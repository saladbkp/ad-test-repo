import pygame
from params import *
from utils import *

class Image:
    def __init__(self, filename, manager, position=None, relative_position=None, image_scale=None):
        self.filename = filename
        self.image = self.bg = pygame.image.load(filename)
        self.image_scale = image_scale
        if image_scale:
            self.image = pygame.transform.smoothscale(self.image, (self.image.get_size()[0] * image_scale[0], self.image.get_size()[1] * image_scale[1]))
        if relative_position:
            match relative_position:
                case "bottom_center":
                    self.position = (WINDOW_SIZE[0] // 2 - self.image.get_size()[0] // 2, WINDOW_SIZE[1] - self.image.get_size()[1])
                case "upper_left":
                    self.position = (0,0)
                case "center":
                    self.position = (WINDOW_SIZE[0] // 2 - self.image.get_size()[0] // 2, WINDOW_SIZE[1] // 2 - self.image.get_size()[1] // 2)
        else:        
            self.position = position
        self.manager = manager
        self.visible = True

    def draw(self):
        if self.visible:
            self.manager.screen.blit(self.image, self.position)

class Clickable(Image):
    def __init__(self, filename, manager, action, position=None, relative_position=None, hitbox_scale=None, image_scale=None):
        super().__init__(filename, manager, position, relative_position, image_scale)
        self.dark_image = create_darkened_image(self.image)
        self.action = action
        self.item_rect = self.image.get_rect()
        if hitbox_scale:
            self.item_rect.width = int(self.item_rect.width * hitbox_scale[0])
            self.item_rect.height = int(self.item_rect.height * hitbox_scale[1])
        self.item_rect.center = (self.position[0] + self.image.get_size()[0] // 2, self.position[1] + self.image.get_size()[1] // 2)
        self.active = True
    
    def deactivate(self):
        self.active = False

    def activate(self):
        self.active = True

    def draw(self):
        mouse_pos = pygame.mouse.get_pos()
        if self.active and self.item_rect.collidepoint(mouse_pos):
            self.manager.screen.blit(self.dark_image, self.position)
        else:
            self.manager.screen.blit(self.image, self.position)
    
    def handle_click(self, mouse_pos):
        if self.active and self.item_rect.collidepoint(mouse_pos):
            return self.action
        else:
            return None


