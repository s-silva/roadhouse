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
import pymongo
import api.center
import db
import login
import core.conversations
import core.people
from bson.objectid import ObjectId


# room security level: 1-open, 2-live, 3-closed, 4-hidden


class Rooms:

	room_type_place = 1
	room_type_event = 2
	room_type_group = 3

	security_level_open = 1
	security_level_live = 2
	security_level_closed = 3
	security_level_hidden = 4

	key = "0"

	def __init__(self, key):
		db.connect()
		self.key = key;

	# rad: km, if rad = 0, it's a global search
	# -1 is for global (virtual) room search
	def get(self, lat, long, rad, search, lastid):
		try:
			lat = float(lat)
			long = float(long)
			rad = float(rad)
		except:
			return None

		roomset = db.roadhouse.rooms.find({"loc": { "$within": { "$center": [ [ lat, long] , rad / 6378.137 ] } } } )
		
		return roomset
		
	def get_info(self, roomid):
		res = db.roadhouse.rooms.find_one({"_id": ObjectId(roomid)})
		return res
	
	
	def enter(self, roomid):
		cuid = login.get_user_fullid(self.key)
		db.roadhouse.rooms.update({"_id": ObjectId(roomid), "people.id" : {"$ne": str(cuid)}},
								  {"$push" : {"people" : {  "id" : cuid,
															"security": 0,
															"rating": 0}}})
		return 1
		
	
	def leave(self, roomid):
		cuid = login.get_user_fullid(self.key)
		db.roadhouse.rooms.update({"_id": ObjectId(roomid)}, {"$pull" : {"people" : {"id" : str(cuid)}}})
		return 1
		
		
	def subscribe(self, roomid):
		cuid = login.get_user_fullid(self.key)
		db.roadhouse.rooms.update({"_id": ObjectId(roomid), "subscribers.id": {"$ne": str(cuid)}},
									{"$push" : {"subscribers" : {  "id" : cuid, "status": 0}}})

		people = core.people.People(self.key)
		people.subscribe(roomid)
		return 1
		
		
	def unsubscribe(self, roomid):
		cuid = login.get_user_fullid(self.key)
		db.roadhouse.rooms.update({"_id": ObjectId(roomid)}, {"$pull" : {"subscribers" : {"id": str(cuid)}}})

		people = core.people.People(self.key)
		people.unsubscribe(roomid)
		return 1


	def set_dp(self, roomid, url):
		res = db.roadhouse.rooms.find_one({"_id": ObjectId(roomid)})
		if res is None:
			return 0

		db.roadhouse.rooms.update({"_id": ObjectId(roomid)}, {"$set" : {"dp": url}}, True)
		return 1
		
	# reserved
	def invite(self, userfullid, roomid):
		return 0
		
	# reserved
	def kick(self, roomid):
		return 0

	def get_conversation(self, roomid):
		r = db.roadhouse.rooms.find_one({"_id": ObjectId(roomid)})
		if r is not None:
			if r["conversation"] is not None:
				return r["conversation"]
			else:
				conversations = core.conversations.Conversations(self.key)
				cid = conversations.create(roomid, conversations.associate_type_room)
				if cid is None:
					return None
				db.roadhouse.rooms.update({"_id": ObjectId(roomid)}, {"$set" : {"conversation": str(cid)}})
				return str(cid)

		return None
		
		
	# room data:
	# name, description, topic, image, lat, long, size, type (security), duration,
	# admins, start time, end time, location name, ticket url
	
	def create(self, roomdata):
		cuid = login.get_user_fullid(self.key)
		roomdata["admins"] = [{"id": cuid, "status": 0}]
		
		roomdata["subscribers"] = [];	
		roomdata["people"] = [];

		roomfullid = db.roadhouse.rooms.insert(roomdata)
		return roomfullid
		
	
	def delete(self, roomid):
		r = db.roadhouse.rooms.find_one({"_id": roomid})
		if r is None:
			return 0
			
		if self.is_admin(roomid) == False:
			return 0
			
		db.roadhouse.rooms.remove({"_id": roomid})
		# [todo] remove associated images
		# [todo] remove assiciated conversation
		return 1
		
	def is_admin(self, roomid):
		r = db.roadhouse.rooms.find_one({"_id": roomid})
		if r is None:
			return False
			
		if r["admins"] is not None:
			found_user = 0
			for admin in r["admins"]:
				if admin["id"] == cuid:
					found_user = 1
			
			if found_user != 1:
				return False
			
		return True
		
		
	def report(self, roomid):
		return 0
		
	
	def get_people(self, roomid):
		r = db.roadhouse.rooms.find_one({"_id": roomid})
		if r is None:
			return None
		
		if r["people"] is not None:
			return r["people"]
		return None
		
		
	def get_albums(self, roomid):
		return 0


	def format_room(self, obj):
		if "dp" in obj:
			obj["dp"] = "/static/cdn/full/" + obj["dp"]
		else:
			obj["dp"] = ""
		return 1


	def strip_secure_details(self, obj):
		if obj is None:
			return 0

		try:
			obj["id"] = str(obj["_id"])
			obj.pop('security', None)        # privacy
			obj.pop('_id', None)
			return 1
		except:
			return 0


	def is_intheroom(self, roomobj, fuid):
		for r in roomobj["people"]:
			if r is not None:
				if r["id"] == fuid:
					return True
		return False


	def is_subscribed(self, roomobj, fuid):
		for r in roomobj["subscribers"]:
			if r is not None:
				if r["id"] == fuid:
					return True

		return False
		
		
		
		

# Name
# Description
# Address
# Cirrent status
# loc_name
# loc
#     lat
#     long
# Event
# 	  Start time
# 	  End time
# Community ratings
# 	  Rating1
# 	  Rating2
# Ticket information
# Conversation
# 	  [<Post>]
# People
#     [(ID, _ID, Status)]
# Size
# Security
# 	  Type #open, closed, live (cannot subscribe)
# 	  Secret word
# Type #event, group (no location, secret), place
# Advertisement
# 	  Radius
# 	  Note
# 	  Initiate time
# 	  Advertisement duration
#     Past advertisements count
# Subscribers
# 	  [(ID, _ID, Status)]
# Photo
# 	  URL
# 	  W
# 	  H
# Admins
# 	  [(ID, _ID, Status)]
#
