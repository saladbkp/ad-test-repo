import pygame
from params import *
from classes.clickable import *

class Menu:
    def __init__(self, manager):
        self.bg = Image(f"{IMAGES_PATH}/menu/background.jpg", manager, relative_position="upper_left")
        self.doors = [
            Clickable(f"{IMAGES_PATH}/menu/{name}_door.jpg", manager, name, position=MENU_DOORS_POSITIONS[name]) for name in SHOPS
        ]
        self.icons = [
            Image(f"{IMAGES_PATH}/menu/{name}_icon.png", manager, position=MENU_ICONS_POSITIONS[name], image_scale=(0.1, 0.1)) for name in SHOPS
        ]
        self.manager = manager

    def draw(self):
        self.bg.draw()
        for door in self.doors + self.icons:
            door.draw()
    
    def handle_click(self, mouse_pos):
        for door in self.doors:
            action = door.handle_click(mouse_pos)
            if action:
                self.manager.change_scene(action)
                break
    
    def handle_keydown(self, event):
        pass

    def update(self):
        self.draw()