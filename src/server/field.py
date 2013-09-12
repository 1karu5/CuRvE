#!/usr/bin/env python
# -*- coding: utf-8 -*-

ignoreCount = 10
size = 5

class field:
    
    def __init__(self):
        self.fieldMap = {}
        
    def addUser(self, name):
        self.fieldMap[name] = []
        
    def add(self, data):
        self.fieldMap[data["name"]].append(data)
    
    def collision(self, name, x, y):
        fieldMap = self.fieldMap
        
        for p in fieldMap:
            arr = fieldMap[p]
            for c in xrange(len(arr)):
                if p == name and c + ignoreCount > len(arr):
                    pass
                else:  
                    cx = arr[c]["x"]
                    cy = arr[c]["y"]
                    if x < cx + size and x + size > cx and y < cy + size and y + size > cy:
                        return True
        return False
