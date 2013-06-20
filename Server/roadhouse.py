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
import core.rooms
import core.socketapi
import db

from tornado.options import define, options

define("port", default=8888, help="run on the given port", type=int)


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", HomeHandler),
			(r"/socketapi", core.socketapi.ChatSocketHandler),
			(r"/about/([^/]+)", AboutHandler),
			(r"/api/(.*)", api.center.ApiHandler),
			(r"/test", TestHandler),
			(r"/client", ClientHandler),
			(r"/cdn/(.*)", tornado.web.StaticFileHandler, {"path": "static/cdn"}),
        ]
        settings = dict(
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=True,
            autoescape="xhtml_escape",
        )
        tornado.web.Application.__init__(self, handlers, **settings)

		
class HomeHandler(tornado.web.RequestHandler):
	def get(self):
		self.render("intro/intro.html", entries = {'background' : True})


class AboutHandler(tornado.web.RequestHandler):
    def get(self, url):
		if url == "about":
			self.render("intro/about.html", entries = {'background' : False})
		elif url == "learn":
			self.render("intro/about.html", entries = {'background' : False})
		elif url == "terms":
			self.render("intro/legal/terms.html", entries = {'background' : False})
		elif url == "privacy":
			self.render("intro/legal/privacy.html", entries = {'background' : False})
		else:
			self.render("intro/about.html", entries = {'background' : False})
		

class TestHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("test/testform.html", entries = {'background' : False})


class ClientHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("client/index.html", entries = {'background' : False})


def main():
	db.connect()
	
	if db.roadhouse is None:
		print('FATAL: Cannot connect to the database!')
		return
		
	tornado.options.parse_command_line()
	app = Application()
	app.listen(options.port)
	tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
