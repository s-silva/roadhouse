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
import core.rooms
import core.people
import core.conversations
import core.socketapi
import core.photos
import core.notifications
import api.dataformats
from bson.json_util import dumps
import login
import base64
import db


class ApiHandler(tornado.web.RequestHandler):

	key = "0"

	def check_xsrf_cookie(self):
		pass

	def post(self, url):
		self.get(url)

	def get(self, url):
		nobj = None
		splitpath = os.path.splitext(url)

		#sockets = core.socketapi.SocketAPI()
		#sockets.send_to_all(url)
		db.connect()
		self.key = self.get_argument("key", "0")
		
		if login.is_authorized(self.key) == True or url[:8] == "account/" or url[:7] == "photos/":
			obj = {"errors" : [{"message": "Not found or under construction", "code": 404}]}
			print "AAAAAAAAAAAAAAAAAAAAA"
			if url[:7] == "people/":
				nobj = self.handle_people(splitpath[0][7:])
			elif url[:6] == "rooms/":
				nobj = self.handle_rooms(splitpath[0][6:])
			elif url[:14] == "conversations/":
				nobj = self.handle_conversations(splitpath[0][14:])
			elif url[:14] == "notifications/":
				nobj = self.handle_notifications(splitpath[0][14:])
			elif url[:7] == "photos/":
				nobj = self.handle_photos(splitpath[0][7:])
			elif url[:8] == "account/":
				nobj = self.handle_accounts(splitpath[0][8:])
			if nobj is not None:
				if nobj != 0:
					obj = nobj
			
			if "_id" in obj:
				obj.pop("_id", None)
		else:
			obj = {"errors" : [{"message": "Not authorized", "code": 102}], "criticalerror": 102}

		if splitpath[1] == ".xml":
			self.set_header("Content-Type", "text/xml")
			xml_encoder = api.dataformats.Py2XML()
			return self.write(xml_encoder.parse({"data" : [obj]}))
		else:
			if self.get_argument("callback", "0") != "0":
				self.set_header("Content-Type", "application/javascript")
				return self.write(self.get_argument("callback", "0") + "(" + dumps(obj) + ")")
			else:
				self.set_header("Content-Type", "application/json")
				return self.write(dumps(obj))

		
	def handle_people(self, url):
	
		obj = None
		people = core.people.People(self.key)
		
		if url == "get":
			obj = people.get(self.get_argument("id", "0"))
			if obj is not None:
				people.format_details(obj)
				people.strip_secure_details(obj)
				
		elif url == "get_friends":
			obj = people.get_friends(self.get_argument("id", "0"))

			if obj is None:
				obj = {"result" : "error", "message" : "No friends found"}
				return 0

			#p = []
			#for fid in obj:
			#	if fid is not None and fid != 0:
			#		pd = people.get(fid["id"])
			#		people.strip_secure_details(pd)
			#		p.append(pd)

			#obj = p

			
		elif url == "send_message":
			obj = {"message" : "under construction"}
			
		elif url == "follow":
			obj = people.follow(str(self.get_argument("id", "0")))
			
		elif url == "delete":
			obj = people.delete(str(self.get_argument("id", "0")))
			
		elif url == "update":
			person =  {"fname"		 : self.get_argument("fname", ""),
					   "lname" 		 : self.get_argument("lname", ""),
					   "username" 	 : self.get_argument("username", ""),
					   "email" 		 : self.get_argument("email", ""),
					   "password" 	 : self.get_argument("password", ""),
					   "description" : self.get_argument("description", "", "")}

			if people.update(person, self.get_argument("cpassword", "")) is not None:
				obj = {"result" : "success"}
			else:
				obj = {"result" : "error"}

			return obj

		elif url == "report":
			obj = {"message" : "under construction"}

		elif url == "get_subscriptions":
			obj = people.get_subscriptions()
			
		elif url == "set_location":
			obj = people.set_location(str(self.get_argument("lat", "0")), str(self.get_argument("long", "0")))

		elif url == "add_friend":
			#v = people.add_friend(str(self.get_argument("id", "0")), str(self.get_argument("iid", "0")))
			#if v == 0:
				return {"result" : "error"}
			#else:
			#	return {"result" : "success"}
			#return obj

		elif url == "respond_to_friend_request":

			uid = self.get_argument("uid", "0")
			accepted = self.get_argument("accepted", "1")

			cuid = login.get_user_fullid(self.key)
			notifications = core.notifications.Notifications(self.key)
			rreq = notifications.accept_friend(cuid, uid)

			if rreq == False:
				return {"result": "error"}

			v = 1

			if accepted != 0:
				v = people.add_friend(uid, 0)

			if v == 0:
				return {"result" : "error"}
			else:
				return {"result" : "success"}
			return obj

		elif url == "search_simple":
			oc = people.search_simple(self.get_argument("q", "0"), 0, 0)
			obj = []

			for o in oc:
				if "_id" in o:
					dp_s = ""
					dp_l = ""

					if "dp" in o:
						if o["dp"] != "":
							dp_s = "/cdn/full/" + o["dp"]
							dp_l = "/cdn/full/" + o["dp"]

					uname = o["fname"] + " " + o["lname"]

					obj.append({"id": str(o["_id"]), "name": uname, "status": o["description"], "dp_s": dp_s, "dp_l": dp_l, "username": o["username"]})

			#people.strip_secure_details(obj)

		return obj


	def handle_rooms(self, url):
	
		obj = None
		rooms = core.rooms.Rooms(self.key)

		if url == "create":

			lat = 0.0
			lng = 0.0
			rsize = 5

			try:
				rsize = int(self.get_argument("size"))
				lat = float(self.get_argument("lat"))
				lng = float(self.get_argument("long"))
			except:
				return obj

			room   =  {"name"		 : str(self.get_argument("name")),
					   "dsc" 		 : str(self.get_argument("dsc")),
					   "address" 	 : str(self.get_argument("address")),
					   "status" 	 : "",
					   "size"        : rsize,
					   "type"        : rooms.room_type_place,
					   "security"    : {"type": rooms.security_level_open, "password": ""},
					   "locname"	 : "",
					   "loc" 		 : [lat, lng],
					   "event" 		 : {"start": 0, "end": 0},
					   "ratings" 	 : {"rating1" : 0, "rating2" : 0},
					   "tickets"	 : {"message" : "", "url": "", "price": ""},
					   "conversation": None}


			oid = rooms.create(room)
			obj = {"result" : "success", "objid" : str(oid)}

			if obj is not None:
				rooms.strip_secure_details(obj)
				
		elif url == "get":
			cuid = login.get_user_fullid(self.key)
			oc = rooms.get(self.get_argument("lat", "0"), self.get_argument("long", "0"), self.get_argument("rad", "100"), None, None)
			
			if oc is None:
				obj = {"result" : "error", "message" : "No rooms around."}
				return 0
			
			obj = []
			for o in oc:
				rooms.strip_secure_details(o)
				rooms.format_room(o)
				o["subscribed"] = rooms.is_subscribed(o, cuid)
				o["intheroom"] = rooms.is_intheroom(o, cuid)
				

				obj.append(o)


		elif url == "get_info":
			cuid = login.get_user_fullid(self.key)

			o = rooms.get_info(self.get_argument("id", "0"))
			
			if o is None:
				obj = {"result" : "error", "message" : "No rooms around."}
				return obj
			
			rooms.strip_secure_details(o)
			rooms.format_room(o)
			o["subscribed"] = rooms.is_subscribed(o, cuid)
			o["intheroom"] = rooms.is_intheroom(o, cuid)
			obj = o


		elif url == "enter":
			id = self.get_argument("id", "0")
			
			if id == "0":
				return 0

			oc = rooms.enter(id)
			if oc == 1:
				obj = {"result" : "success"}


		elif url == "leave":
			id = self.get_argument("id", "0")
			
			if id == "0":
				return 0

			oc = rooms.leave(id)
			if oc == 1:
				obj = {"result" : "success"}


		elif url == "subscribe":
			id = self.get_argument("id", "0")
			
			if id == "0":
				return 0

			oc = rooms.subscribe(id)
			if oc == 1:
				obj = {"result" : "success"}


		elif url == "unsubscribe":
			id = self.get_argument("id", "0")
			
			if id == "0":
				return 0

			oc = rooms.unsubscribe(id)
			if oc == 1:
				obj = {"result" : "success"}

		elif url == "get_conversation":
			id    = str(self.get_argument("id", "0"))
			pid   = str(self.get_argument("pid", "0"))
			skip  = str(self.get_argument("skip", "0"))
			count = str(self.get_argument("count", "7"))
			noteskip  = str(self.get_argument("noteskip", "0"))
			notecount = str(self.get_argument("notecount", "5"))
			
			obj = {"result" : "error"}
			
			if id == "0":
				return obj

			try:
				skip = int(skip)
			except:
				skip = 0

			try:
				count = int(count)
			except:
				count = 1

			try:
				noteskip = int(noteskip)
			except:
				noteskip = 0

			try:
				notecount = int(notecount)
			except:
				notecount = 5

			oc = rooms.get_conversation(id)
			if oc is not None:
				conversations = core.conversations.Conversations(self.key)
				obj = conversations.get(conversations.get_default, oc, pid, skip, count, noteskip, notecount)


		return obj



	
	
	
	
	

	def handle_conversations(self, url):
	
		obj = None
		conversations = core.conversations.Conversations(self.key)
		
		if url == "post": # convid, postid, text, tags, data, type
			ptype = str(self.get_argument("type", "text"))
			itype = conversations.post_type_text
			ptype = ptype.lower()

			if ptype == "album":
				itype = conversations.post_type_album
			elif ptype == "link":
				itype = conversations.post_type_link

			r = conversations.post( str(self.get_argument("convid", "0")),
									str(self.get_argument("postid", "0")),
									str(self.get_argument("text", "0")),
									str(self.get_argument("tags", "0")),
									str(self.get_argument("data", "0")),
									itype )

			if r is not None:
				obj = {"result" : "success", "objid" : str(r)}
			else:
				obj = {"result" : "error"}
				
		elif url == "delete": # conv id, post id, note id
			r = conversations.delete( str(self.get_argument("convid", "0")),
									  str(self.get_argument("postid", "0")),
									  str(self.get_argument("noteid", "0")))

			if r == 1:
				obj = {"result" : "success"}
			else:
				obj = {"result" : "error"}

		elif url == "reply": # conv id, post id, note id
			return 0

		elif url == "up": # conv id, post id, note id
			r = conversations.mark( str(self.get_argument("convid", "0")),
									str(self.get_argument("postid", "0")),
									str(self.get_argument("noteid", "0")), True)

			if r == 1:
				obj = {"result" : "success"}
			else:
				obj = {"result" : "error"}

		elif url == "down": # conv id, post id, note id
			r = conversations.mark( str(self.get_argument("convid", "0")),
									str(self.get_argument("postid", "0")),
									str(self.get_argument("noteid", "0")), False)

			if r == 1:
				obj = {"result" : "success"}
			else:
				obj = {"result" : "error"}

		elif url == "get_all_notes":
			pid = str(self.get_argument("id", "0"))
			convid = str(self.get_argument("convid", "0"))

			if pid == "0":
				obj = {"result" : "error"}
				return obj

			if convid == "0":
				obj = {"result" : "error"}
				return obj

			conversations = core.conversations.Conversations(self.key)
			obj = conversations.get_notes(convid, pid, 0, 0)

		return obj




	def handle_photos(self, url):
	
		obj = None
		photos = core.photos.Photos(self.key)
		rooms = core.rooms.Rooms(self.key)
		people = core.people.People(self.key)

		print url
		if url == "add_roomdp": # roomid
			roomid = self.get_argument("roomid", "0")
			userid = self.get_argument("userid", "0")

			if roomid == "0":
				return obj

			if userid == "0":
				return obj

			cuid = userid
			_, b64 = self.request.body.split(',')
			imgdata = base64.b64decode(b64)
			rid = photos.add_photo(imgdata, photos.photo_type_roomdp, cuid, roomid, 0, "Display Pictures", "")\

			if rooms.set_dp(roomid, str(rid) + ".jpg") == 0:
				return None

			return obj

		elif url == "set_userdp": #userid
			userid = self.get_argument("userid", "0")

			if userid == "0":
				return obj

			cuid = userid
			_, b64 = self.request.body.split(',')
			imgdata = base64.b64decode(b64)
			rid = photos.add_photo(imgdata, photos.photo_type_dp, cuid, 0, 0, "Display Picture", "")\

			if people.set_dp(cuid, str(rid) + ".jpg") == 0:
				return None

			return obj
		
		elif url == "add_post_photo": #postid, #convid, #dsc, #userid
			postid = self.get_argument("postid", "0")
			dsc = self.get_argument("dsc", "")
			convid = self.get_argument("convid", "0")
			userid = self.get_argument("userid", "0")
			
			if postid == "0":
				return obj
			if userid == "0":
				return obj

			cuid = userid
			_, b64 = self.request.body.split(',')
			imgdata = base64.b64decode(b64)
			rid = photos.add_photo(imgdata, photos.photo_type_photo, cuid, convid, postid, "General", dsc)

			conversations = core.conversations.Conversations(self.key)

			if conversations.set_cover_photo(convid, postid, str(rid) + ".jpg") == 0:
				return None
			return obj

		return obj


	def handle_accounts(self, url):
	
		obj = None

		if url == "login": # email, pass
			email = self.get_argument("email", "0")
			passw = self.get_argument("pass", "0")

			if email == "0" or passw == "0":
				return obj

			r = login.login(email, passw)	
			
			if r != False:
				self.key = login.make_key(r)
				people = core.people.People(self.key)
				cuid = r
				userdata = people.get(str(cuid))
				if userdata is None:
					obj = {"result" : "error"}
					login.logout(self.key)
					return obj

				if "dp" in userdata:
					if userdata["dp"] == "":
						dp_s = ""
						dp_l = ""
					else:
						dp_s = "/static/cdn/full/" + userdata["dp"]
						dp_l = "/static/cdn/full/" + userdata["dp"]
				else:
					dp_s = ""
					dp_l = ""
				
				

				print userdata["fname"] + " " + userdata["lname"] + " logged in dp - " + dp_s
				obj = {"result" : "success", "key": self.key, "user": {"id": str(cuid), "dp_s": dp_s, "dp_l": dp_l, "uname": userdata["fname"] + " " + userdata["lname"]}}
			else:
				obj = {"result" : "error"}

			return obj


		elif url == "create_account":
			obj = {"result" : "error"}

			people = core.people.People(self.key)

			person =  {"fname"		 : self.get_argument("fname", ""),
					   "lname" 		 : self.get_argument("lname", ""),
					   "username" 	 : self.get_argument("username", ""),
					   "email" 		 : self.get_argument("email", ""),
					   "rating"	 	 : {"rating1" : 0, "rating2" : 0},
					   "password" 	 : self.get_argument("password", ""),
					   "location" 	 : {"name" : "Unknown Location", "type" : 0},
					   "coordinates" : [0, 0],
					   "description" : self.get_argument("description", ""),
					   "status" 	 : self.get_argument("status", "")}
			
			pcr = people.create(person)
			
			if pcr == 1:
				email = self.get_argument("email", "0")
				passw = self.get_argument("password", "0")

				if email == "0" or passw == "0":
					return obj

				r = login.login(email, passw)	
				
				if r != False:
					self.key = login.make_key(r)
					people = core.people.People(self.key)
					cuid = r
					userdata = people.get(str(cuid))
					if userdata is None:
						obj = {"result" : "error"}
						login.logout(self.key)
						return obj

					if "dp" in userdata:
						if userdata["dp"] == "":
							dp_s = ""
							dp_l = ""
						else:
							dp_s = "/static/cdn/full/" + userdata["dp"]
							dp_l = "/static/cdn/full/" + userdata["dp"]
					else:
						dp_s = ""
						dp_l = ""
				

					print userdata["fname"] + " " + userdata["lname"] + " logged in dp - " + dp_s
					obj = {"result" : "success", "key": self.key, "user": {"id": str(cuid), "dp_s": dp_s, "dp_l": dp_l, "uname": userdata["fname"] + " " + userdata["lname"]}}
				else:
					obj = {"result" : "error"}
		

		if url == "logout":
			r = login.logout(self.key)	
			
			if r == True:		
				obj = {"result" : "success"}
			else:
				obj = {"result" : "error"}

			return obj


		if url == "deactivate":
			obj = {"result" : "Not Implemented"}
			return obj

		return obj


	def handle_notifications(self, url):
	
		obj = None
		notifications = core.notifications.Notifications(self.key)

		if url == "get":
			uid = login.get_user_fullid(self.key)

			obj = notifications.get_history(uid)
			return obj


		elif url == "send_message": # uid, msg (+body)
			fromuser = login.get_user_fullid(self.key)
			uid = self.get_argument("uid", "0")
			msg = self.get_argument("msg", "")
			if self.request.body is not None:
				msg = msg + self.request.body

			notifications.send_to_user(uid, fromuser, notifications.notification_type_msg, {"msg": msg, "timestamp": ""})
			return obj
		

		elif url == "send_friend_request": # uid
			fromuser = login.get_user_fullid(self.key)
			uid = self.get_argument("uid", "0")
			r = notifications.send_to_user(uid, fromuser, notifications.notification_type_friendship, {"mode": 0, "timestamp": ""})

			if r == True:		
				obj = {"result" : "success"}
			else:
				obj = {"result" : "error"}

			return obj

		return obj