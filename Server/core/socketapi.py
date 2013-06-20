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
import db
import login
import datetime
from bson.objectid import ObjectId


class SocketAPI:
	def send(self, userid, msg):
		ChatSocketHandler.send_umsg(userid, msg)
		return 1

	def send_to_all(self, msg):
		ChatSocketHandler.on_message(msg)


class ChatSocketHandler(tornado.websocket.WebSocketHandler):
    waiters = set()
    cache = []
    cache_size = 200
    uid = None

    key = "0"

    def allow_draft76(self):
        # for iOS 5.0 Safari
        return True

    def open(self, key):
        userdata = login.get_user_fullid(self.key)
        self.uid = str(userdata)
        ChatSocketHandler.waiters.add(self)

    def on_close(self):
        ChatSocketHandler.waiters.remove(self)

    @classmethod
    def update_cache(cls, chat):
        cls.cache.append(chat)
        if len(cls.cache) > cls.cache_size:
            cls.cache = cls.cache[-cls.cache_size:]

    @classmethod
    def send_updates(cls, chat):
        logging.info("sending message to %d waiters", len(cls.waiters))
        for waiter in cls.waiters:
            try:
                waiter.write_message(chat)
            except:
                logging.error("Error sending message", exc_info=True)

    @classmethod
    def send_update_to(cls, uid, chat):
        logging.info("Sending Unique Msg")

        for waiter in cls.waiters:
            try:
                if waiter.uid == uid:
                    waiter.write_message(chat)
            except:
                logging.error("Error sending message", exc_info=True)


    @classmethod
    def on_message(cls, message):
        logging.info("got message %r", message)
        parsed = message #tornado.escape.json_decode(message)
        chat = parsed
        ChatSocketHandler.update_cache(chat)
        ChatSocketHandler.send_updates(chat)
        
    @classmethod
    def send_umsg(cls, uid, message):
        logging.info("got message %r", message)
        parsed = message #tornado.escape.json_decode(message)
        chat = parsed
        ChatSocketHandler.send_update_to(uid, chat)