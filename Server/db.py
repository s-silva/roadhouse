#!/usr/bin/env python
#
# Copyright 2013 Roadhouse
#

import sys
import pymongo
import config

roadhouse = None


def connect():
	try:
		global roadhouse
		connection = pymongo.Connection(config.mongodb_uri)
		roadhouse = connection[config.mongodb_name]
	except:
		print('Error: Unable to connect to database.')
		connection = None

class objectify:
	def __init__(self, **entries): 
		self.__dict__.update(entries)