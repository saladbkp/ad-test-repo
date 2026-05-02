import os
import pathlib
import sys

WINDOW_SIZE = (1344, 768)

FONT_PATH = pathlib.Path(os.path.dirname(__file__)) / "assets/fonts/PressStart2P.ttf"
CUSTOMIZATION_FONT_PATH = pathlib.Path(os.path.dirname(__file__)) / "assets/fonts/MonsieurLaDoulaise-Regular.ttf"
M0LECON_FONT_PATH = pathlib.Path(os.path.dirname(__file__)) / "assets/fonts/LeagueGothic-Regular.ttf"
FONT_SIZE = 24
IMAGES_PATH = pathlib.Path(os.path.dirname(__file__)) / "assets/images"

HIGHLIGHT = (255, 100, 100)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
BROWN = (139, 69, 19)
TRANSPARENT_BLACK = (0, 0, 0, 180)

# box params
BOX_POSITION = (WINDOW_SIZE[0]//2, WINDOW_SIZE[1] - 100)
BOX_BG_COLOR = (50, 50, 50)
BOX_PADDING = 20
BOX_BORDER_COLOR = (200, 200, 200)
BOX_BORDER_WIDTH = 2

SHOPS = ["gift", "jewelry", "food"]

MENU_DOORS_POSITIONS = {
    "gift": (152, 211),
    "jewelry": (561, 211),
    "food": (981, 211)
}

MENU_ICONS_POSITIONS = {
    "gift": (190, 55),
    "jewelry": (620, 63),
    "food": (1042, 58)
}

SHOP_DIALOGUES = {
    "gift": ["Never too late to buy a gift!", "Ask to me to pick up an order!", "", "Please provide the order id", "", "Please insert your authentication key", "", "", "Something went wrong!"],
    "jewelry": ["Here for some shiny stuff?", "Ask to me to pick up an order!", "", "Please provide the order id", "", "Please insert your authentication key", "", "", "Something went wrong!"],
    "food": ["The best products of our region!", "Ask to me to pick up an order!", "", "Please provide the order id", "", "Please insert your authentication key", "", "", "Something went wrong!"]
}

COUNTER_ITEM_POSITION = (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] - 300)
SHOP_ARROWS_POSITIONS = ((COUNTER_ITEM_POSITION[0] - 120, COUNTER_ITEM_POSITION[1] + 130), (COUNTER_ITEM_POSITION[0] + 183, COUNTER_ITEM_POSITION[1] + 132))
CUSTOMIZATION_POSITION = (WINDOW_SIZE[0] // 2, WINDOW_SIZE[1] - 200)

ITEMS = {
    # shelf position, customization position, customization size
    "snow_globe": [(30, 70), (539, 543), (250, 87)],
    "book": [(130, 70), None, None],
    "neck_pillow": [(230, 70), None, None],
    "shirt": [(330, 70), None, None],
    "m0lecon": [(830, 90), None, None],
    "empty_m0lecon": [(830, 90), (595, 370), (404, 116)],

    "bracelet": [(100, 200), None, None],
    "necklace": [(200, 200), (584, 392), (170, 227)],
    "horse": [(300, 190), None, None],
    "perfume": [(400, 195), None, None],
    "pen": [(820, 200), None, None],

    "pasta": [(30, 70), None, None],
    "wine": [(130, 70), None, None],
    "cookies": [(230, 70), None, None],
    "candies": [(330, 70), None, None],
    "chocolate": [(850, 90), None, None],
    "red_can": [(950, 90), (570, 257), (207, 341)],
}

NAME_TO_ITEM = {
    'Travel Diary': 'book',
    'Pink Gold Bracelet': 'bracelet',
    'Hard Candies': 'candies',
    'Traditional Chocolate Candy': 'chocolate',
    'Grandma\'s Cookies': 'cookies',
    'Diamond Horse': 'horse',
    'Custom Bottle Opener': 'empty_m0lecon',
    'Neck Pillow': 'neck_pillow',
    'Gold tag': 'necklace',
    'Semolina Pasta': 'pasta',
    'Space Pen': 'pen',
    'Puzzo di CTF - Eau de Parfum': 'perfume',
    'Blank shirt': 'shirt',
    'Snow Globe': 'snow_globe',
    'Second Cheapest Wine': 'wine',
    'Red Soda Can': 'red_can',
}

ID_TO_ITEM = {}

ITEMS_PER_SHOP = {
    "gift": ["snow_globe", "book", "neck_pillow", "shirt", "m0lecon"],
    "jewelry": ["bracelet", "necklace", "horse", "perfume", "pen"],
    "food": ["pasta", "wine", "cookies", "candies", "chocolate", "red_can"]
}

if len(sys.argv) != 2:
    print(f'\n\n\x1b[1;31mPlease run with {sys.argv[0]} [ip]\x1b[0m\n', file=sys.stderr)
    exit(1)

HOST = sys.argv[1]
PORT = "6006"