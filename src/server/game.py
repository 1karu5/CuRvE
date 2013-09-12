#!/usr/bin/env python
# -*- coding: utf-8 -*-

from field import field

class game:
    
    def init(self):
        self.field = field()
        self.playerConnect =[]
        self.player = {}
        
    def playerAdd(self, connect, name=None, color=None, *args, **kwargs):
        self.playerConnect(connect)
        self.player[name] = color
        self.field.addUser(name)
        
    def playerRemove(self, connection):
        i = self.playerConnect.index(self)
        del self.playerConnect[i] 
        