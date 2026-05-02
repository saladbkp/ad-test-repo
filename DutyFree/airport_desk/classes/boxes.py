import pygame
import time
from params import *
from utils import filter_string

class DialogBox:
    def __init__(self, manager, duration=2):
        self.font = manager.font
        self.manager = manager
        self.duration = duration

        self.pos = BOX_POSITION
        self.padding = BOX_PADDING
        self.bg_color = BOX_BG_COLOR
        self.text_color = WHITE
        self.border_color = BOX_BORDER_COLOR
        self.border_width = BOX_BORDER_WIDTH

        self.visible = False
        self.start_time = 0

        self.text = ""

    def show(self, text):
        """Call this to make the dialog appear."""
        self.visible = True
        self.start_time = time.time()
        self.text = text
        # Create text surface
        self.text_surface = self.font.render(self.text, True, self.text_color)
        text_width, text_height = self.text_surface.get_size()

        # Automatically size the rect
        self.rect = pygame.Rect(
            self.pos[0],
            self.pos[1],
            text_width + self.padding * 2,
            text_height + self.padding * 2
        )
        self.rect.center = self.pos


    def update(self):
        """Call every frame to check if the dialog should hide."""
        if self.visible and (time.time() - self.start_time) >= self.duration:
            self.visible = False
            return False
        return True

    def draw(self):
        """Draw the dialog onto the given surface if visible."""
        if not self.visible:
            return

        # Draw background
        pygame.draw.rect(self.manager.screen, self.bg_color, self.rect)
        # Draw border
        pygame.draw.rect(self.manager.screen, self.border_color, self.rect, self.border_width)

        # Render text
        text_surface = self.font.render(self.text, True, self.text_color)
        text_rect = text_surface.get_rect(center=self.rect.center)
        self.manager.screen.blit(text_surface, text_rect)

    def deactivate(self):
        self.visible = False
        self.text = ""

import pygame

class InputBox:
    def __init__(self, alph, manager):
        self.alph = alph
        self.rect = pygame.Rect(300, 400, 600, 60)
        self.rect.center = BOX_POSITION
        self.font_path = FONT_PATH
        self.manager = manager
        self.initial_font_size = FONT_SIZE
        self.bg_color = BOX_BG_COLOR
        self.text_color = WHITE
        self.border_color = BOX_BORDER_COLOR
        self.border_width = BOX_BORDER_WIDTH

        self.text = "_"
        self.visible = False

    def handle_event(self, event):
        """Process user key events."""
        mods = pygame.key.get_mods()
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_RETURN:
                res = self.text
                self.deactivate()
                return res
            elif event.key == pygame.K_BACKSPACE:
                self.text = self.text[:-1]
            elif mods & pygame.KMOD_CTRL and event.key == pygame.K_v:
                pasted_text = pygame.scrap.get("text/plain;charset=utf-8")
                if pasted_text:
                    if self.text == "_":
                        self.text = ""
                    self.text += filter_string(pasted_text.decode().strip(), self.alph)
            elif event.unicode in self.alph:
                if self.text == "_":
                    self.text = ""
                self.text += event.unicode
            if not self.text:
                self.text = "_"
        return None

    def draw(self):
        """Draw the input box and the text if visible."""
        if not self.visible:
            return

        # Draw background
        pygame.draw.rect(self.manager.screen, self.bg_color, self.rect)
        # Draw border
        pygame.draw.rect(self.manager.screen, self.border_color, self.rect, self.border_width)

        # Find the largest font size that fits
        font_size = self.initial_font_size
        font = pygame.font.Font(self.font_path, font_size)
        text_surface = font.render(self.text, True, self.text_color)
        text_width, text_height = text_surface.get_size()

        while (text_width > self.rect.width - 10 or text_height > self.rect.height - 10) and font_size > 8:
            font_size -= 1
            font = pygame.font.Font(self.font_path, font_size)
            text_surface = font.render(self.text, True, self.text_color)
            text_width, text_height = text_surface.get_size()

        # Center the text
        text_rect = text_surface.get_rect(center=self.rect.center)
        self.manager.screen.blit(text_surface, text_rect)

    def deactivate(self):
        self.visible = False
        self.text = "_"