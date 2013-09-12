#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import tornado
from tornado import websocket
from tornado import web
from field import field

color = {}
player = []

gameField = field() 

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        if self.request.uri == "/":
            self.render("../static/index.html")

class EchoWebSocket(websocket.WebSocketHandler):
    def open(self):
        print "open"
        player.append(self)

    def on_message(self, message):
        data = json.loads(message)
        print "#receive: %s" % data
        
        if data["message"] == "connect":  # send complete array to new player
            response = {"message":"init", "data": {"collision": gameField.fieldMap, "color":color}}
            self.write_message(json.dumps(response))
            print "##send: %s" % response
            gameField.addUser(data["data"]["name"])
            color[data["data"]["name"]] = data["data"]["color"]
        else:
            if gameField.collision(data["data"]["name"], data["data"]["x"], data["data"]["y"]):
                print "collision"
                self.write_message(json.dumps({"message":"killed"}))
            else:
                gameField.add(data["data"])
                for obj in player:
                    response = {"message":"update", "data":{"x":data["data"]["x"], "y":data["data"]["y"], "color":color[data["data"]["name"]]}}
                    obj.write_message(json.dumps(response))

    def on_close(self):
        print "close"
        i = player.index(self)
        del player[i]
        # gamer.remove(self)
        
application = tornado.web.Application([
    (r"/", EchoWebSocket),
])

STATIC = os.path.abspath(os.path.join(os.path.dirname(__file__), "../static"))

handlers = [
            (r"/static/(.*)", tornado.web.StaticFileHandler, {'path': STATIC}),
            (r'/', MainHandler)
]

webserver = tornado.web.Application(handlers)

if __name__ == "__main__":
    application.listen(8888)
    webserver.listen(8889)
    tornado.ioloop.IOLoop.instance().start()
    tornado.autoreload.start()

