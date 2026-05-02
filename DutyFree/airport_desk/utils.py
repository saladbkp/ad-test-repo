import pygame
from params import *

def create_darkened_image(image, darken_factor=0.6):
    """Return a darkened copy of the image with transparency preserved."""
    dark_image = image.copy()
    for x in range(dark_image.get_width()):
        for y in range(dark_image.get_height()):
            r, g, b, a = dark_image.get_at((x, y))
            if a > 0:  # Only darken visible pixels
                r = int(r * darken_factor)
                g = int(g * darken_factor)
                b = int(b * darken_factor)
                dark_image.set_at((x, y), (r, g, b, a))
    return dark_image

def wrap_text(text, font, max_width):
    """Wrap text to fit inside max_width using given font."""
    words = text.split(' ')
    lines = []
    current_line = ""

    for word in words:
        test_line = current_line + word + " "
        if font.size(test_line)[0] <= max_width:
            current_line = test_line
        else:
            lines.append(current_line.strip())
            current_line = word + " "
    if current_line:
        lines.append(current_line.strip())

    return lines

def filter_string(s, alph):
    return ''.join(c for c in s if c in alph)

def render_text_fitting_rect(text, topleft, size, font_path=None, color=BLACK):
    """
    Returns a list of (surface, (x, y)) to blit text into the rectangle defined by topleft and size.
    Adjusts font size so that no line exceeds width, and splits long words if needed.
    """
    x, y = topleft
    width, height = size

    words = text.split()

    max_font_size = 100
    min_font_size = 10

    # Try decreasing font sizes
    for font_size in range(max_font_size, min_font_size - 1, -1):
        font = pygame.font.Font(font_path, font_size)
        space_width, _ = font.size(' ')

        too_wide = False
        for word in words:
            word_width, _ = font.size(word)
            if word_width > width:
                too_wide = True
                break
        if too_wide:
            continue

        # Wrap words into lines
        lines = []
        current_line = ""
        current_width = 0
        for word in words:
            word_width, _ = font.size(word)
            if current_line:
                if current_width + space_width + word_width <= width:
                    current_line += " " + word
                    current_width += space_width + word_width
                else:
                    lines.append(current_line)
                    current_line = word
                    current_width = word_width
            else:
                current_line = word
                current_width = word_width
        if current_line:
            lines.append(current_line)

        line_height = font.get_linesize()
        total_height = line_height * len(lines)

        if total_height <= height:
            rendered = []
            for idx, line in enumerate(lines):
                surface = font.render(line, True, color)
                pos = (x, y + idx * line_height)
                rendered.append((surface, pos))
            return rendered

    # No font size without splitting words worked, so split words at min_font_size
    font = pygame.font.Font(font_path, min_font_size)
    space_width, _ = font.size(' ')
    line_height = font.get_linesize()

    lines = []
    for word in words:
        word_width, _ = font.size(word)
        if word_width <= width:
            # Word fits without splitting
            if lines and font.size(lines[-1])[0] + space_width + word_width <= width:
                lines[-1] += " " + word
            else:
                lines.append(word)
        else:
            # Word needs to be split
            subword = ""
            for char in word:
                subword += char
                subword_width, _ = font.size(subword)
                if subword_width > width:
                    # Append without last char
                    if len(subword) > 1:
                        lines.append(subword[:-1])
                        subword = char
            if subword:
                lines.append(subword)

    # Now re-check height (last resort: just show as many lines as fit)
    max_lines = height // line_height
    lines = lines[:max_lines]

    rendered = []
    for idx, line in enumerate(lines):
        surface = font.render(line, True, color)
        pos = (x, y + idx * line_height)
        rendered.append((surface, pos))

    return rendered
