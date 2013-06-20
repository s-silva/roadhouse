#!/usr/bin/python 

import sys
import pymongo
import db
import core.people
import core.rooms

def main(args):
	print "started initialization"
		
	db.connect()
	people = core.people.People(0)
	rooms = core.rooms.Rooms(0)

	if db.roadhouse is not None:
		
		"""
		John Doe
		Jane Roe
		石戸谷 貞子
		
		"""
		
		print "db found"

		db.roadhouse.secure.remove()

		db.roadhouse.config.update({}, {"$set" : {"last_userid" : 0}}, True)
		db.roadhouse.people.remove()
		
		people.create({"fname" : "John",
					   "lname" : "Smith",
					   "username" : "johnsmith",
					   "email" : "john@smith.com",
					   "rating" : {"rating1" : 0, "rating2" : 0},
					   "password" : "123",
					   "location" : {"name" : "Unknown Location", "type" : 0},
					   "coordinates" : [0, 0],
					   "description" : "A man of word",
					   "status" : "Good morning..."})
					   
		people.create({"fname" : "Mary",
					   "lname" : "Jane",
					   "username" : "maryjane",
					   "email" : "mary@jane.com",
					   "rating" : {"rating1" : 0, "rating2" : 0},
					   "password" : "123",
					   "location" : {"name" : "Unknown Location", "type" : 0},
					   "coordinates" : [0, 0],
					   "description" : "Hey!",
					   "status" : "Drawing some stuff."})
					   
		people.create({"fname" : "石戸谷",
					   "lname" : "貞子",
					   "username" : "sadako",
					   "email" : "sadako@example.com",
					   "rating" : {"rating1" : 0, "rating2" : 0},
					   "password" : "123",
					   "location" : {"name" : "Unknown Location", "type" : 0},
					   "coordinates" : [0, 0],
					   "description" : "Blah",
					   "status" : "Growing plants here..."})
					   
		db.roadhouse.rooms.remove()

		rooms.create({"name"		 : "Mayfield Park",
					   "dsc" 		 : "Love, peace, music",
					   "address" 	 : "7th street, Elf Town",
					   "status" 	 : "",
					   "size"        : 10,
					   "type"        : rooms.room_type_place,
					   "security"    : {"type": rooms.security_level_open, "password": ""},
					   "locname"	 : "",
					   "loc" 		 : [1.0, 1.0],
					   "event" 		 : {"start": 0, "end": 0},
					   "ratings" 	 : {"rating1" : 0, "rating2" : 0},
					   "tickets"	 : {"message" : "", "url": "", "price": ""},
					   "conversation": None})

		rooms.create({"name"		 : "Coffee Shop",
					   "dsc" 		 : "Jim's Coffee Spot",
					   "address" 	 : "22/1, Elf Town",
					   "status" 	 : "",
					   "size"        : 5,
					   "type"        : rooms.room_type_place,
					   "security"    : {"type": rooms.security_level_open, "password": ""},
					   "locname"	 : "",
					   "loc" 		 : [2.0, 1.0],
					   "event" 		 : {"start": 0, "end": 0},
					   "ratings" 	 : {"rating1" : 0, "rating2" : 0},
					   "tickets"	 : {"message" : "", "url": "", "price": ""},
					   "conversation": None})

		rooms.create({"name"		 : "College of Design and Arts",
					   "dsc" 		 : "Welcome to the Elf Town College of Art",
					   "address" 	 : "12/A, Elf Town",
					   "status" 	 : "",
					   "size"        : 20,
					   "type"        : rooms.room_type_place,
					   "security"    : {"type": rooms.security_level_open, "password": ""},
					   "locname"	 : "",
					   "loc" 		 : [1.0, 1.0],
					   "event" 		 : {"start": 0, "end": 0},
					   "ratings" 	 : {"rating1" : 0, "rating2" : 0},
					   "tickets"	 : {"message" : "", "url": "", "price": ""},
					   "conversation": None})
	else:
		print('Ouch!')
		
if __name__ == '__main__': 
	main(sys.argv[1:])