import pygame
import sys
from params import *
from classes.shop import Shop
from classes.menu import Menu
from classes.manager import Manager


def start_game():
    pygame.init()
    pygame.scrap.init()
    pygame.scrap.set_mode(pygame.SCRAP_CLIPBOARD)
    pygame.display.set_caption("Duty Free")


    manager = Manager()

    menu = Menu(manager)
    shops = {s: Shop(s, manager) for s in SHOPS}

    manager.load_menu(menu)
    manager.load_shops(shops)
    manager.set_scene(menu)
    manager.load_items()

    while True:
        manager.update()

        pygame.display.flip()

        # --- Events ---
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            elif event.type == pygame.MOUSEBUTTONDOWN:
                manager.current_scene.handle_click(event.pos)

            elif event.type == pygame.KEYDOWN and manager.current_scene != "menu":
                manager.current_scene.handle_keydown(event)