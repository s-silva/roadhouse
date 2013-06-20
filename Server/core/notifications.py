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
import core.conversations
import core.socketapi
import db
from bson.json_util import dumps
import datetime
from bson.objectid import ObjectId


class Notifications:

	notification_type_msg = 1
	notification_type_friendship = 2
	notification_type_conversation_reply = 3
	notification_type_conversation_vote = 4
	notification_type_room_newpost = 5

	webself = 0

	def __init__(self, ws):
		self.webself = ws;


	def send_to_user(self, uid, fromuser, type, mdata):
		msg = self.format(fromuser, type, mdata, 0)

		if msg is None:
			return False

		#sockets = core.socketapi.SocketAPI()
		#sockets.send(uid, dumps(msg))

		return self.add_to_history(uid, fromuser, type, mdata)


	def accept_friend(self, cuid, fromuser):
		ntf = db.roadhouse.notifications.find_one({"uid": ObjectId(cuid)})

		if ntf is None:
			return False

		for n in ntf["friendshipreq"]:
			if n["fromuser"] == fromuser:
				db.roadhouse.notifications.update({"uid": ObjectId(cuid)}, {"$pull" : {"friendshipreq" : {"fromuser" : ObjectId(fromuser)}}})
				return True

		return False


	def add_to_history(self, uid, fromuser, type, mdata):
		ntf = db.roadhouse.notifications.find_one({"uid": ObjectId(uid)})

		obj = {"fromuser": fromuser, "type": type, "mdata": mdata, "timestamp": datetime.datetime.utcnow(), "marked": 0};


		if ntf is None:
			if type == self.notification_type_msg:
				db.roadhouse.notifications.insert({"uid": ObjectId(uid), "notifications": [], "messages": [obj], "friendshipreq": []})

			elif type == self.notification_type_friendship:
				db.roadhouse.notifications.insert({"uid": ObjectId(uid), "notifications": [], "messages": [], "friendshipreq": [obj]})

			else:
				db.roadhouse.notifications.insert({"uid": ObjectId(uid), "notifications": [obj], "messages": [], "friendshipreq": []})

		else:
			if type == self.notification_type_msg:
				db.roadhouse.notifications.update({"uid": ObjectId(uid)}, {"$push": {"messages": obj}})

			elif type == self.notification_type_friendship:
				db.roadhouse.notifications.update({"uid": ObjectId(uid)}, {"$push": {"friendshipreq": obj}})

			else:
				db.roadhouse.notifications.update({"uid": ObjectId(uid)}, {"$push": {"notifications": obj}})

		return True

	def get_history(self, uid):
		ntf = db.roadhouse.notifications.find_one({"uid": ObjectId(uid)})
		if ntf is None:
			return None;

		last_fetch_timestamp = 0;

		if "last_fetch" in ntf:
			last_fetch_timestamp = ntf["last_fetch"]

		msgs = []

		i = 0
		for n in ntf["friendshipreq"]:
			i = i + 1
			if i > 40: break
			n["mdata"]["timestamp"] = n["timestamp"]
			msgs.append(self.format(n["fromuser"], n["type"], n["mdata"], last_fetch_timestamp))

		i = 0
		for n in ntf["messages"]:
			i = i + 1
			if i > 30: break
			n["mdata"]["timestamp"] = n["timestamp"]
			msgs.append(self.format(n["fromuser"], n["type"], n["mdata"], last_fetch_timestamp))

		i = 0
		for n in ntf["notifications"]:
			i = i + 1
			if i > 20: break
			n["mdata"]["timestamp"] = n["timestamp"]
			msgs.append(self.format(n["fromuser"], n["type"], n["mdata"], last_fetch_timestamp))

		db.roadhouse.notifications.update({"uid": ObjectId(uid)}, {"$set" : {"last_fetch": datetime.datetime.utcnow()}}, True)
		return msgs

	def register_user(self, uid):
		return True


	def unregister_user(self, uid):

		return True


	def format(self, fromuser, type, mdata, last_fetch_timestamp):
		people = core.people.People(self)

		msg = {}
		userdata = people.get(str(fromuser))

		if userdata is None:
			return False

		dp_s = ""
		dp_l = ""

		if "dp" in userdata:
			if userdata["dp"] != "":
				dp_s = "/static/cdn/full/" + userdata["dp"]
				dp_l = "/static/cdn/full/" + userdata["dp"]


		msg["user"] = {"uid": str(fromuser), "fname": userdata["fname"], "lname": userdata["lname"], "dp_s": dp_s, "dp_l": dp_l}

		msg["marked"] = 0

		if "timestamp" in mdata:
			msg["timestamp"] = mdata["timestamp"]
			
			if last_fetch_timestamp != 0:
				if mdata["timestamp"] > last_fetch_timestamp:
					msg["marked"] = 1
		else:
			msg["timestamp"] = ""

		

		if type == self.notification_type_msg:
			msg["mtype"] = "message"
			msg["ctext"] = mdata["msg"]

		elif type == self.notification_type_friendship:
			msg["mtype"] = "friendship"
			msg["mode"] = mdata["mode"]

		elif type == self.notification_type_room_newpost:
			msg["mtype"] = "newpost"
			msg["roomid"] = ""
			msg["roomid"] = ""
			msg["convid"] = ""
			msg["postid"] = ""
			msg["noteid"] = "" 

		elif type == self.notification_type_conversation_reply:
			msg["mtype"] = "newnote"
			msg["roomid"] = ""
			msg["convid"] = ""
			msg["postid"] = ""
			msg["noteid"] = "" 

		elif type == self.notification_type_conversation_vote:
			msg["mtype"] = "upvote"
			msg["roomid"] = ""
			msg["convid"] = ""
			msg["postid"] = ""
			msg["noteid"] = "" 

		return msg