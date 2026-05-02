import pygame
from classes.clickable import Clickable
from params import *
from utils import *

class Item(Clickable):
    def __init__(self, filename, manager, action, position=None, relative_position=None, hitbox_scale=None, image_scale=None, customization=None, customization_position=None, customization_size=None):
        super().__init__(filename, manager, action, position, relative_position, hitbox_scale, image_scale)
        if action == "zoom":
            self.zoomed_image = Item(filename, manager, "unzoom", relative_position="center", image_scale=(0.7, 0.7), customization=customization, customization_position=customization_position, customization_size=customization_size)
            self.zoomed_image.deactivate()
            self.customization = None
        elif action == "unzoom":
            self.customization = customization
            self.customization_position = customization_position
            self.customization_size = customization_size
            if self.customization:
                if 'm0lecon' in self.filename:
                    self.wrapped_text = render_text_fitting_rect(self.customization, self.customization_position, self.customization_size, font_path=M0LECON_FONT_PATH, color=WHITE)
                else:
                    self.wrapped_text = render_text_fitting_rect(self.customization, self.customization_position, self.customization_size, font_path=CUSTOMIZATION_FONT_PATH)

    def draw(self):
        super().draw()
        if self.customization:
            for surf, pos in self.wrapped_text:
                if 'm0lecon' in self.filename:
                    rotated_surface = pygame.transform.rotate(surf, 20)
                    rotated_rect = rotated_surface.get_rect(center=self.customization_position)
                    self.manager.screen.blit(rotated_surface, rotated_rect)
                else:
                    self.manager.screen.blit(surf, pos)

