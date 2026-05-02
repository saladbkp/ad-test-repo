import pygame
from params import *
import string
from utils import *
from classes.clickable import *
from classes.boxes import *
from classes.item import Item

class Shop:
    def __init__(self, name, manager):
        self.name = name
        self.manager = manager

        self.bg = Image(f"{IMAGES_PATH}/shops/{name}_background.jpg", manager, relative_position="upper_left")
        self.person = Clickable(f"{IMAGES_PATH}/shops/{self.name}_person.png", manager, "pick_up", relative_position="bottom_center", hitbox_scale=(0.3, 1))
        self.counter = Image(f"{IMAGES_PATH}/shops/counter.png", manager, relative_position="upper_left")
        item_names = ITEMS_PER_SHOP[self.name]
        self.shelves_items = [Item(f"{IMAGES_PATH}/items/{name}.png", self.manager, "zoom", position=ITEMS[name][0], image_scale=(0.1, 0.1)) for name in item_names]

        self.left_arrow = Clickable(f"{IMAGES_PATH}/shops/left_arrow.png", manager, "prev_item", SHOP_ARROWS_POSITIONS[0], image_scale=(0.1, 0.1))
        self.right_arrow = Clickable(f"{IMAGES_PATH}/shops/right_arrow.png", manager, "next_item", SHOP_ARROWS_POSITIONS[1], image_scale=(0.1, 0.1))

        self.clickable = [self.person] + self.shelves_items

        self.dialogues = SHOP_DIALOGUES[self.name]
        self.dialog_box = DialogBox(
            manager=self.manager,
            duration=2
        )

        self.input_box = InputBox(
            alph=string.ascii_letters + string.digits + '-',
            manager=self.manager,
        )

        self.phase = -1
        self.ERROR_DIALOG = len(self.dialogues) - 1
        self.EXIT_PHASE = self.ERROR_DIALOG + 1

        self.input_text = ''

        self.counter_items = None
        self.counter_index = 0
        self.zoomed_item = None

        self.dark_overlay = pygame.Surface(WINDOW_SIZE)
        self.dark_overlay.set_alpha(128)
        self.dark_overlay.fill((0, 0, 0))
    
    def deactivate_all(self):
        self.person.deactivate()
        for item in self.shelves_items:
            item.deactivate()

    def activate_all(self):
        self.person.activate()
        for item in self.shelves_items:
            item.activate()

    def handle_click(self, mouse_pos):
        if self.zoomed_item:
            image = self.zoomed_item
            self.clickable[self.zoomed_image_idx].activate()
            self.left_arrow.activate()
            self.right_arrow.activate()
            self.zoomed_item = None
            if self.phase == 2:
                self.activate_all()
            return
        for i, image in enumerate(self.clickable):
            if isinstance(image, Clickable):
                action = image.handle_click(mouse_pos)
                match action:
                    case "pick_up":
                        self.next_phase()
                        break
                    case "zoom":
                        self.zoomed_item = image.zoomed_image
                        image.deactivate()
                        self.left_arrow.deactivate()
                        self.right_arrow.deactivate()
                        self.deactivate_all()
                        self.zoomed_image_idx = i
                        break
                    case "prev_item":
                        self.clickable.remove(self.counter_items[self.counter_index])
                        self.counter_index = (self.counter_index - 1) % len(self.counter_items)
                        self.clickable.append(self.counter_items[self.counter_index])
                    case "next_item":
                        self.clickable.remove(self.counter_items[self.counter_index])
                        self.counter_index = (self.counter_index + 1) % len(self.counter_items)
                        self.clickable.append(self.counter_items[self.counter_index])

    def handle_keydown(self, event):
        if event.key == pygame.K_ESCAPE:
            self.exit_shop()
            return
        elif self.input_box.visible:
            res = self.input_box.handle_event(event)
            if res:
                self.input_text = res
                self.next_phase()
        return

    def draw(self):
        self.bg.draw()
        self.person.draw()
        self.counter.draw()
        for item in self.shelves_items:
            item.draw()
        if self.counter_items:
            self.counter_items[self.counter_index].draw()
            if len(self.counter_items) > 1:
                self.left_arrow.draw()
                self.right_arrow.draw()
        self.dialog_box.draw()
        self.input_box.draw()
        if self.zoomed_item:
            self.manager.screen.blit(self.dark_overlay, (0,0))
            self.zoomed_item.draw()

    def update(self):
        self.draw()
        if not self.dialog_box.update():
            self.next_phase()

    def next_phase(self):
        self.phase += 1

        match self.phase:
            case 0 | 1 | 3 | self.ERROR_DIALOG:
                self.dialog_box.show(self.dialogues[self.phase])
                self.deactivate_all()
            case 2:
                self.activate_all()
            case 4 | 6:
                self.input_box.visible = True
            case 5:
                self.dialog_box.show(self.dialogues[self.phase])
                self.deactivate_all()
                self.order_id = self.input_text
                self.input_text = ""
            case 7:
                if not all(c in string.hexdigits for c in self.input_text):
                    self.next_phase()
                    return
                self.auth_key = self.input_text
                self.input_text = ""
                products = self.manager.client.authenticate(self.order_id, self.auth_key)
                if not products:
                    self.next_phase()
                    return
                self.counter_items = [Item(f"{IMAGES_PATH}/items/{ID_TO_ITEM[order_info['product_id']]}.png", self.manager, "zoom", COUNTER_ITEM_POSITION, customization=order_info["customization"] if ("customization" in order_info) else None, image_scale=(0.2, 0.2), customization_position=ITEMS[ID_TO_ITEM[order_info['product_id']]][1], customization_size=ITEMS[ID_TO_ITEM[order_info['product_id']]][2]) for order_info in products]
                self.clickable.append(self.counter_items[self.counter_index])
                if len(self.counter_items) > 1:
                    self.clickable.append(self.left_arrow)
                    self.clickable.append(self.right_arrow)
            case self.EXIT_PHASE:
                self.exit_shop()

    def exit_shop(self):
        self.phase = -1
        self.input_box.deactivate()
        self.dialog_box.deactivate()
        self.counter_items = None
        self.counter_index = 0
        self.zoomed_item = None
        self.clickable = [self.person] + self.shelves_items
        self.manager.change_scene("menu")