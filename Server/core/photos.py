import tornado.httpserver, tornado.ioloop, tornado.options, tornado.web, os.path, random, string
from tornado.options import define, options
from cStringIO import StringIO
import os, sys
#import PIL
#from PIL import Image
import pymongo
import db
import login
from bson.objectid import ObjectId

class Photos:

	photo_type_photo = 1
	photo_type_dp = 2
	photo_type_roomdp = 3

	key = "0"

	def __init__(self, key):
		db.connect()
		self.key = key;

	
	# returns id, and id itself will be the photo name
	# roomid becomes conversation id for photos, and user id for users display pictures
	def add_photo(self, data, ptype, userid, roomid, postid, albumname, text):
		if ptype == self.photo_type_photo:
			rid = db.roadhouse.photos.insert({"type": ptype, "uid": userid, "convid": roomid, "postid": postid, "album": albumname, "text": text})
			print "UPLOADING" + str(rid)
			self.upload_photo(data, str(rid))
			return rid

		elif ptype == self.photo_type_roomdp:
			r = db.roadhouse.photos.find_one({"roomid": roomid, "type": ptype})

			if r is None:
				rid = db.roadhouse.photos.insert({"type": ptype, "uid": userid, "roomid": roomid, "album": albumname, "text": text})
			else:
				rid = r["_id"];
				db.roadhouse.photos.update({"_id": ObjectId(rid)}, {"type": ptype, "uid": userid, "roomid": roomid, "album": albumname, "text": text})

			self.upload_photo(data, str(rid))
			return rid

		elif ptype == self.photo_type_dp:
			r = db.roadhouse.photos.find_one({"uid": userid, "type": ptype})

			if r is None:
				rid = db.roadhouse.photos.insert({"type": ptype, "uid": userid, "roomid": 0, "album": albumname, "text": text})
			else:
				rid = r["_id"];
				db.roadhouse.photos.update({"_id": ObjectId(rid)}, {"type": ptype, "uid": userid, "roomid": 0, "album": albumname, "text": text})

			self.upload_photo(data, str(rid))
			return rid

		else:
			return 0

	def upload_photo(self, data, fname):
		#file1 = self.request.files['file1'][0]
		#original_fname = file1['filename']
		#extension = os.path.splitext(original_fname)[1]
		#fname = ''.join(random.choice(string.ascii_lowercase + string.digits) for x in range(6))
		#final_filename = fname+ ".jpg";
		#output_file = open("uploads/" + final_filename, 'wb')
		#output_file.write(file1['body'])
		try:
			size = 500, 500
			output_file = open("static/cdn/full/" + fname + ".jpg", 'wb')
			output_file.write(data)
			#im = Image.open(StringIO(data))#file1['body']))
			#im.thumbnail(size, Image.ANTIALIAS)
			#im.save(, "JPEG", quality=80, optimize=True, progressive=True)
		except IOError:
			print "cannot create thumbnail for '%s'"
		
			
	
	def upload_dp(self, data, fname):
		try:
			size = 256, 256
			#im = Image.open(StringIO(data))
			#im.thumbnail(size, Image.ANTIALIAS)
			#im.save("static/cdn/full/" + fname + ".jpg", "JPEG", quality=80, optimize=True, progressive=True)
		except IOError:
			print "cannot create thumbnail for '%s'"
			