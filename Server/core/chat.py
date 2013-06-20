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

class Chat:
	def get(self, lat, long, rad, lastid):
		return 0 # an object with an array of rooms around, limited number
		
	
	# enter the conversation
	def enter(self, roomid)
		return 0 # object, top bits of conversation topics
		
	
	def leave(self, roomid)
		return 0
		
		
	# room data:
	# name, description, topic, image, lat, long, size, type (security), duration,
	# admins
	
	def create(self, roomdata)
		return 0
		
	
	def delete(self, roomid)
		return 0
		
		
	def report(self, roomid)
		return 0