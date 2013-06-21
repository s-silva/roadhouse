#!/usr/bin/env python
#
# Roadhouse
# Copyright (C) 2013 Sandaruwan Silva <c-h [-a-t-] users [-dot-] sf [-dot-] net>
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
# 
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
# 
# You should have received a copy of the GNU Lesser General Public
# License along with this library; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
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
import core.rooms
import pymongo
import db
import login
import datetime
from bson.objectid import ObjectId
import hashlib


class People:

	key = "0"

	def __init__(self, key):
		db.connect()
		self.key = key;

	def get(self, userid):
		try:
			userid = int(userid)
			userdata = db.roadhouse.people.find_one({"id": userid})
		except:
			userdata = db.roadhouse.people.find_one({"_id": ObjectId(userid)})
		

		if userdata is not None:
			if "_id" in userdata:
				userdata['fullid'] = str(userdata["_id"])
			if userdata["accountactive"] == 1:
				return userdata
		return None


	def get_friends(self, userid):
		try: userid = int(userid)
		except: return None
		
		if userid != 0:
			userdata = self.get(userid)
			if userdata is not None:
				if "friends" in userdata:
					return self.get_friend_detailset(userdata["friends"])
			return None
		else:
			userdata = self.get(login.get_user_fullid(self.key))
			if userdata is not None:
				if "friends" in userdata:
					return self.get_friend_detailset(userdata["friends"])
			return None


	def get_friend_detailset(self, objs):
		if objs is None:
			return None

		outobjs = []

		for f in objs:
			if "fid" in f:
				o = self.get(f["fid"])
				if o is not None:
					dp_s = ""
					dp_l = ""

					if "dp" in o:
						if o["dp"] != "":
							dp_s = "/static/cdn/full/" + o["dp"]
							dp_l = "/static/cdn/full/" + o["dp"]

					uname = o["fname"] + " " + o["lname"]

					outobjs.append({"id": str(f["fid"]), "name": uname, "status": o["description"], "dp_s": dp_s, "dp_l": dp_l, "username": o["username"]})

		print outobjs
		return outobjs

	def get_user(self, userid):
		o = self.get(userid)
		if o is not None:
			dp_s = ""
			dp_l = ""

			if "dp" in o:
				if o["dp"] != "":
					dp_s = "/static/cdn/full/" + o["dp"]
					dp_l = "/static/cdn/full/" + o["dp"]

			o = {"name": o["fname"] + " " + o["lname"], "dp_s": dp_s, "dp_l": dp_l, "username": o["username"]}
		return o
			
		
	def get_by_email(self, email):
		return db.roadhouse.people.find_one({"email": email.lower()})


	def set_dp(self, uid, url):
		res = db.roadhouse.people.find_one({"_id": ObjectId(uid)})
		if res is None:
			return 0

		db.roadhouse.people.update({"_id": ObjectId(uid)}, {"$set" : {"dp": url}}, True)
		return 1


	def test_user(self, em, ps):
		u = db.roadhouse.secure.find_one({"email": em.lower()})

		
		if u is None:
			return False

		if "password" in u:
			if str(u["password"]) == str(hashlib.sha256(ps + "_rd").hexdigest()):
				return str(u["userfullid"])

		return False


	def search_simple(self, keywords, skip, limit):
		# update mongo and use new text search features or
		# set up Solr etc.
		return db.roadhouse.people.find({"searchkeys": {"$regex" : '.*' + keywords.lower() + '.*' }})
		
		
		
	# user data:
	# name, description, topic, image, lat, long, size, type (security), duration,
	# admins
	
	def create(self, userdata):
		if userdata["email"] is None:
			return 0
			
		if self.get_by_email(str(userdata["email"])) is None:
			userpassword = hashlib.sha256(userdata["password"] + "_rd").hexdigest()
			
			dbconfig = db.roadhouse.config.find_one()
			
			userdata["id"] = 1
			
			if dbconfig is not None:
				if dbconfig["last_userid"] is not None:
					userdata["id"] = dbconfig["last_userid"] + 1
			
			db.roadhouse.config.update({}, {"$set" : {"last_userid" : userdata["id"]}}, True)
			
			userdata["accountactive"] = 1
			userdata["username"] = userdata["username"].lower()
			userdata["email"] = userdata["email"].lower()
			userdata["rating"] = {"rating1": 0, "rating2": 0}
			userdata["onlinestatus"] = 1
			userdata["password"] = None
			userdata["searchkeys"] = userdata["fname"].lower() + " " + userdata["lname"].lower() + " " + userdata["description"].lower()
			
			userfullid = db.roadhouse.people.insert(userdata)
			db.roadhouse.secure.insert({"password" : userpassword, "email" : userdata["email"], "userid" : userdata["id"],
										"userfullid" : userfullid})
			return 1
		return 0
		
	
	def delete(self, password):
		userid = login.get_user_fullid(self.key)
		if userid:
			db.roadhouse.people.update({"_id": userid}, {"$set": {"accountactive" : 0}})
			login.logout(self.key)
			return 1
		return 0

	def update(self, data, password):

		userid = login.get_user_fullid(self.key)
		if userid:
			u = db.roadhouse.secure.find_one({"userfullid": ObjectId(userid)})

			if u is None:
				return None

			if len(data["fname"]) < 1:
				return None

			if len(data["lname"]) < 1:
				return None

			if len(data["email"]) < 5:
				return None


			if "password" in u:
				if str(u["password"]) == str(hashlib.sha256(password + "_rd").hexdigest()):
					db.roadhouse.people.update({"_id": ObjectId(userid)}, {"$set": {"fname" : data["fname"], "lname": data["lname"],
												"username": data["username"], "email": data["email"], "description": data["description"]}})


					if len(data["password"]) > 4:
						db.roadhouse.secure.update({"userfullid": ObjectId(userid)}, {"$set": {"email" : data["email"], "password" : data["password"]}})
					else:
						db.roadhouse.secure.update({"userfullid": ObjectId(userid)}, {"$set": {"email" : data["email"]}})

					print data["lname"] + "Account updated"
					return 1

		return None

		
	def report(self, roomid):
		return 0
		
		
	def follow(self, userid):
		return 0
		
		
	def set_location(self, lat, long):
		return 0


	def get_subscriptions(self):
		userid = login.get_user_fullid(self.key)
		userdata = self.get(userid)
		if userdata is None:
			return None


		objr = []
		rooms = core.rooms.Rooms(self.key)
		
		if "subscriptions" in userdata:
			subids = userdata["subscriptions"]
			for subid in subids:
				if "id" in subid:
					o = rooms.get_info(subid["id"])
					rooms.format_room(o)
					rooms.strip_secure_details(o)
					objr.append(o)


			return objr

		else:
			return None


	def unsubscribe(self, roomid):
		userid = login.get_user_fullid(self.key)
		db.roadhouse.people.update({"_id": ObjectId(userid)}, {"$pull" : {"subscriptions" : {"id" : str(roomid)}}})
		return None


	def subscribe(self, roomid):
		userid = login.get_user_fullid(self.key)
		print "SUBSCRIBING -----------------" + userid
		fdata = {"id": roomid, "since": datetime.datetime.utcnow()}
		db.roadhouse.people.update({"_id": ObjectId(userid)}, {"$push": {"subscriptions": fdata}}, True)
		return None


	def add_friend(self, id, iid):




		iuserid = login.get_user_id(self.key)
		userid = login.get_user_fullid(self.key)
		ouserid = ObjectId(userid)

		userdata = self.get(login.get_user_fullid(self.key))
		if userdata is not None:
			if "friends" in userdata:
				for frnd in userdata["friends"]:
					if frnd["fid"] == ouserid:
						print "Trying to add an existing contact"
						return 1


		fdata = {"id": iid, "fid": ObjectId(id), "rating": 0, "since": datetime.datetime.utcnow(), "conversation": None}
		db.roadhouse.people.update({"_id": ObjectId(userid)}, {"$push": {"friends": fdata}}, True)
		fdata2 = {"id": iuserid, "fid": ObjectId(userid), "rating": 0, "since": datetime.datetime.utcnow(), "conversation": None}
		db.roadhouse.people.update({"_id": ObjectId(id)}, {"$push": {"friends": fdata2}}, True)
		return 1

	def format_details(self, obj):

		dp_s = ""
		dp_l = ""

		if "dp" in obj:
			if obj["dp"] != "":
				dp_s = "/static/cdn/full/" + obj["dp"]
				dp_l = "/static/cdn/full/" + obj["dp"]
		

		obj["dp_s"] = dp_s;
		obj["dp_l"] = dp_l;
		return 1


	def strip_secure_details(self, peopleobject):
		if peopleobject is None:
			return 0

		try:
			peopleobject.pop('password', None)        # privacy
			peopleobject.pop('coordinates', None)     # privacy
			peopleobject.pop('location', None)        # privacy
			#peopleobject.pop('email', None)           # privacy
			peopleobject.pop('searchkeys', None)      # privacy
			return 1
		except:
			return 0