from params import *
from classes.client import Client
import pygame

class Manager:
    def __init__(self):
        self.screen = pygame.display.set_mode(WINDOW_SIZE)
        self.font = pygame.font.Font(FONT_PATH, FONT_SIZE)
        self.customization_font = pygame.font.Font(FONT_PATH, 7)
        self.client = Client(HOST, PORT)

    def load_menu(self, menu):
        self.menu = menu

    def load_shops(self, shops):
        self.shops = shops

    def load_items(self):
        items = self.client.get_items()
        for item in items:
            ID_TO_ITEM[item['id']] = NAME_TO_ITEM[item['name']]

    def set_scene(self, scene):
        self.current_scene = scene

    def update(self):
        self.current_scene.update()

    def change_scene(self, new_scene):
        if new_scene in self.shops:
            self.current_scene = self.shops[new_scene]
            self.current_scene.next_phase()
        else:
            self.current_scene = self.menu
