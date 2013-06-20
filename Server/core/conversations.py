#!/usr/bin/env python
#
# Copyright 2013 Roadhouse
#

import logging
import tornado.escape
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
import os.path
import uuid
import api.center
import core.people
import pymongo
import db
import login
import datetime
from bson.objectid import ObjectId
from bson.json_util import dumps


class Conversations:

	post_type_text = 1
	post_type_album = 2
	post_type_link = 3

	associate_type_room = 1
	associate_type_chat = 2

	type_conversation = 1
	type_post         = 2

	get_simple  = 1 # get only the posts
	get_default = 2 # get last few notes
	get_full    = 3 # get complete post

	key = "0"

	def __init__(self, key):
		db.connect()
		self.key = key;

	# type = 1 (text)
	#	tags: tagged users [id]
	#	data: not used
	# type = 2 (photo/album)
	#	tags: tagged users [id]
	#	data: album id
	# type = 3 (link)
	#	tags: tagged users [id]
	#	data: {url, thumb small url, thumb large url}
	def post(self, conversationid, postid, text, tags, data, type):
		retid = 1
		
		if tags == 0:
			tags = None
			
		if data == 0:
			data = None
		
		if postid == "0": # full post
			if type == self.post_type_text or type == self.post_type_link:
			
				if type == self.post_type_text:
					data = None
				
				parent_conv = db.roadhouse.conversations.find_one({"_id": ObjectId(conversationid)})

				if parent_conv is None:
					return None
				
				associate_id   = parent_conv["associate"]["id"]
				associate_type = parent_conv["associate"]["type"]

				postinfo = {"type": self.type_post, "parent": str(conversationid), "associate": {"id": associate_id, "type": associate_type}, "posts": []}

				postfullid = db.roadhouse.conversations.insert(postinfo)
					
				post = {"userid": login.get_user_fullid(self.key), "type": type, "text": text, "rating": 0, "dp": "",
						"data": data, "tags": [], "marks_up": [], "marks_down": [], "time": datetime.datetime.utcnow(), "notes": None, "id": str(postfullid)}
						
				if tags is not None:
					post["tags"] = tags
						
				db.roadhouse.conversations.update({"_id": ObjectId(conversationid)}, {"$push" : {"posts" : post}})
				retid = postfullid
				
			elif type == self.post_type_album:
				
				x = 1
				# [todo]
			
		else: #note
			if type == self.post_type_text:

				if type == self.post_type_text:
					data = None
				
				post = {"userid": login.get_user_fullid(self.key), "type": type, "text": text, "rating": 0,
						"data": data, "tags": [], "marks_up": [], "marks_down": [], "time": datetime.datetime.utcnow(), "id": str(ObjectId())}
						
				if tags is not None:
					post["tags"] = tags
						
				db.roadhouse.conversations.update({"_id": ObjectId(postid)}, {"$push" : {"posts" : post}})
				
				return 1
				
		# send notifications
		# send websocket notifications
				
		return retid
		
	
	# enter the conversation
	def delete(self, conversationid, postid, noteid):
		if noteid != "0": #note
			db.roadhouse.conversations.update({"_id": ObjectId(postid)}, {"$pull" : {"posts" : {"id": str(noteid)}}})
		elif postid != "0": #post
			db.roadhouse.conversations.update({"_id": ObjectId(conversationid)}, {"$pull" : {"posts" : {"id": str(postid)}}})
			db.roadhouse.conversations.remove({"_id": ObjectId(conversationid), "type": self.type_post})
		return 1


	# delete the whole conversation

	def clear(self, conversationid):
		o = db.roadhouse.conversations.find_one({"_id": ObjectId(conversationid)})
		if o is None:
			return 0

		for cpost in o["posts"]:
			if "id" in cpost:
				db.roadhouse.conversations.remove({"_id": ObjectId(cpost["id"]), "type": self.type_post})
					
		db.roadhouse.conversations.remove({"_id": ObjectId(conversationid)})
		return 1
		
	
	def mark(self, conversationid, postid, noteid, isup):
		cuid = login.get_user_fullid(self.key)

		mark_field = "marks_up"
		
		if isup == 1:
			isup = 1
		else:
			isup = -1
			mark_field = "marks_down"


		if noteid != "0": #note
			#   db.roadhouse.conversations.update({"_id": ObjectId(postid), "posts.id": str(noteid)}, {"$inc": {"posts.$.rating": isup}})
			cuid = login.get_user_fullid(self.key)
			cc = db.roadhouse.conversations.find_one({"_id": ObjectId(postid), "posts.id": str(noteid)}) #, "posts." + mark_field + ".id": {"$ne": str(cuid)}})
			if cc is None:
				return 0

			for post in cc["posts"]:
				if "id" in post:
					if post["id"] == str(noteid):
						print post
						for mks in post[mark_field]:
							if "id" in mks:
								if mks["id"] == str(cuid):
									return 0

			if cc is not None:
				db.roadhouse.conversations.update({"_id": ObjectId(postid), "posts.id": str(noteid)}, {"$inc": {"posts.$.rating": isup}})
				db.roadhouse.conversations.update({"_id": ObjectId(postid), "posts.id": str(noteid)}, {"$push" : {"posts.$." + mark_field : {  "id" : cuid, "status": 0}}})

			else:
				return 0

		elif postid != "0": #bump
			cuid = login.get_user_fullid(self.key)
			cc = db.roadhouse.conversations.find_one({"_id": ObjectId(conversationid), "posts.id": str(postid)}) #, "posts." + mark_field + ".id": {"$ne": str(cuid)}})
			if cc is None:
				return 0

			for post in cc["posts"]:
				if "id" in post:
					if post["id"] == str(postid):
						for mks in post[mark_field]:
							if "id" in mks:
								if mks["id"] == str(cuid):
									return 0
				
			
			if cc is not None:
				db.roadhouse.conversations.update({"_id": ObjectId(conversationid), "posts.id": str(postid)}, {"$inc": {"posts.$.rating": isup}})
				db.roadhouse.conversations.update({"_id": ObjectId(conversationid), "posts.id": str(postid)}, {"$push" : {"posts.$." + mark_field : {  "id" : cuid, "status": 0}}})

			else:
				return 0

		return 1

	def set_cover_photo(self, convid, postid, url):
		res = db.roadhouse.conversations.find_one({"_id": ObjectId(postid)})
		if res is None:
			return 0

		db.roadhouse.conversations.update({"_id": ObjectId(convid), "posts.id": str(postid)}, {"$set": {"posts.$.dp": url}})
		return 1
		
		
	def create(self, associate_id, associate_type):
		conv = {"type": self.type_conversation, "associate": {"id": str(associate_id), "type": associate_type}, "posts": []}
		fullid = db.roadhouse.conversations.insert(conv)
		return fullid
		
	
	# if postid is zero, a list of posts will be fetched
	# assumes that conversationid is a string
	def get(self, get_mode, conversationid, postid, skip, count, noteskip, notecount):
		o = db.roadhouse.conversations.find_one({"_id": ObjectId(conversationid)})#, "type": self.type_conversation})
		if o is None:
			o = {}

		self.post_fill_userdetails(o)

		o["id"] = conversationid;

		o["posts"] = o["posts"][::-1]
		o["posts"] = o["posts"][skip:]
		o["posts"] = o["posts"][:count]

		if get_mode != self.get_simple:
			for cpost in o["posts"]:

				if "id" in cpost:
					if "dp" in cpost:
						if len(cpost["dp"]) > 2:
							cpost["dp"] = "/static/cdn/full/" + cpost["dp"]
					else:
						cpost["dp"] = ""

					co = db.roadhouse.conversations.find_one({"_id": ObjectId(cpost["id"])})#, "type": self.type_conversation})
					if co is None:
						co = {}

					self.post_fill_userdetails(co)

					if "posts" in co:
						cpost["notecount"] = len(co["posts"])
					else:
						cpost["notecount"] = 0

					co["posts"] = co["posts"][::-1]

					if notecount > 0:
						co["posts"] = co["posts"][noteskip:notecount]
					else:
						co["posts"] = co["posts"][noteskip:]

					cpost["notes"] = co
		return o

	def get_notes(self, convid, pid, skip, count):
		o = []
		nl = db.roadhouse.conversations.find_one({"_id": ObjectId(pid)})
		if nl is None:
			o = []
			return o

		if "posts" in nl:
			self.post_fill_userdetails(nl)
			o = nl["posts"]

		
		return o

		
	def post_fill_userdetails(self, o):
		people = core.people.People(self.key)

		for cpost in o["posts"]:
			if "userid" in cpost:
				cpost["user"] = people.get_user(cpost["userid"])

		return o