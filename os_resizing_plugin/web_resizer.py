import js2py
import math
from libopensesame.py3compat import *
from libopensesame.item import Item
from libqtopensesame.items.qtautoplugin import QtAutoPlugin

class WebResizer(Item):
    def __init__(self, experiment):
        self.__dict__[u'experiment'] = experiment
        self._persistent = {}
        self._globals = {
            u'__name__': u'web_resizer',
            u'vars': self.experiment.var,
            u'persistent': self._persistent
        }
        self.var.allowed_resize_units = ['none', 'cm', 'inch', 'deg']
        self.var.pixels_per_unit = 100
        self.var.item_height = 53.98 # height of a credit card in mm
        self.var.item_width = 85.60 # width of a credit card in mm
        self.var.item_init = 250 # initial size of the resizable item

    def prepare(self):
        aspect_ratio = self._item_width / self._item_height
        # implement the stuff that's needed for the resizing task

        # calculate starting div size (can we create a div in python?)

        # implement resizing logic for the box on screen

        # virtual chinrest task?

    def run(self):
        # the time sensitive part of the resizing task should be here
        pass


        


