#!/usr/bin/env python
#
# Copyright 2013 Roadhouse
#

import sys
import core.people
import tornado.escape
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket


current_user = {"fname": "John",
				"lname" : "Doe",
				"username" : "johndoe",
				"email" : "john@doe.com",
				"rating" : {"rating1": 0, "rating2": 0},
				"onlinestatus" : 1}
current_user_id = 1
current_user_fullid = 0



def get_user_fullid(key):
	if key == "0":
		return 0

	uid = decode_key(key)
	return uid
	#return webself.get_secure_cookie("user")
	

def get_user_id(key):
	if key == "0":
		return 0

	uid = decode_key(key)

	people = core.people.People(key)
	userd = people.get(uid)
	
	if userd is None:
		return None
	
	return userd["id"]

	#userfid = webself.get_secure_cookie("user")
	#if userfid is None:
	#	return None
#
	#people = core.people.People(webself)
	#userd = people.get(userfid)
#
	#if userd is None:
	#	return None
#
	#return userd["id"]
	return "1"
	
def logout(key):
	#webself.clear_cookie("user")
	return True


def login(em, ps):
	#logout(webself)
	people = core.people.People(0)
	r = people.test_user(em, ps)
	if r == False:
		return False

	#webself.set_secure_cookie("user", r)
	return r #r

def make_key(data):
	return data


def decode_key(key):

	return key


def is_authorized(key):
	#cookie = webself.get_secure_cookie("user")
	#if cookie is not None:
	if key == "0":
		return False

	key = decode_key(key)
	
	people = core.people.People(key)
	if people.get(key) is None:
		return False

	return True

	#return False

