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