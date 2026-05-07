from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


OUT_DIR = Path("frontend/public/branding")
OUT_DIR.mkdir(parents=True, exist_ok=True)

CANVAS_W = 1600
CANVAS_H = 900

PRIMARY = (112, 76, 255)
SECONDARY = (255, 94, 184)
ACCENT = (45, 201, 123)
AMBER = (255, 193, 59)
CORAL = (255, 124, 90)
INK = (34, 28, 58)
WHITE = (255, 255, 255)
MUTED = (241, 237, 255)

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_ROUNDED = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def gradient_background(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    width, height = size
    image = Image.new("RGBA", size)
    pixels = image.load()
    for y in range(height):
        mix = y / max(height - 1, 1)
        color = tuple(int(top[i] * (1 - mix) + bottom[i] * mix) for i in range(3))
        for x in range(width):
            pixels[x, y] = (*color, 255)
    return image


def pill(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill, outline=None, width: int = 0):
    draw.rounded_rectangle(box, radius=(box[3] - box[1]) // 2, fill=fill, outline=outline, width=width)


def add_wordmark(base: Image.Image, title_y: int, subtitle: str):
    draw = ImageDraw.Draw(base)
    title_font = font(FONT_ROUNDED, 142)
    subtitle_font = font(FONT_BOLD, 46)
    draw.text((610, title_y), "CrocHub", font=title_font, fill=INK)
    draw.text((614, title_y + 164), subtitle, font=subtitle_font, fill=(99, 92, 130))


def add_music_note(draw: ImageDraw.ImageDraw, x: int, y: int, color):
    draw.ellipse((x, y + 54, x + 38, y + 92), fill=color)
    draw.ellipse((x + 52, y + 42, x + 90, y + 80), fill=color)
    draw.rounded_rectangle((x + 28, y, x + 42, y + 68), radius=7, fill=color)
    draw.rounded_rectangle((x + 80, y - 4, x + 94, y + 56), radius=7, fill=color)
    draw.polygon([(x + 39, y + 4), (x + 92, y - 6), (x + 92, y + 18), (x + 39, y + 28)], fill=color)


def add_magnifier(draw: ImageDraw.ImageDraw, x: int, y: int, color, bg):
    draw.ellipse((x, y, x + 92, y + 92), outline=color, width=12)
    draw.line((x + 72, y + 72, x + 122, y + 122), fill=color, width=14)
    draw.ellipse((x + 26, y + 26, x + 40, y + 40), fill=bg)


def add_hotpot(draw: ImageDraw.ImageDraw, x: int, y: int):
    draw.rounded_rectangle((x, y + 32, x + 132, y + 96), radius=22, fill=CORAL)
    draw.arc((x + 18, y + 6, x + 114, y + 58), start=180, end=360, fill=INK, width=8)
    draw.line((x + 32, y + 26, x + 32, y + 12), fill=INK, width=8)
    draw.line((x + 100, y + 26, x + 100, y + 12), fill=INK, width=8)
    draw.line((x + 20, y + 96, x + 44, y + 114), fill=INK, width=8)
    draw.line((x + 112, y + 96, x + 88, y + 114), fill=INK, width=8)
    draw.arc((x + 24, y - 8, x + 54, y + 34), start=200, end=340, fill=WHITE, width=6)
    draw.arc((x + 56, y - 16, x + 86, y + 28), start=200, end=340, fill=WHITE, width=6)
    draw.arc((x + 86, y - 8, x + 116, y + 34), start=200, end=340, fill=WHITE, width=6)


def concept_1() -> Image.Image:
    image = Image.new("RGBA", (CANVAS_W, CANVAS_H), (255, 255, 255, 0))
    panel = gradient_background((CANVAS_W, CANVAS_H), (248, 245, 255), (238, 255, 246))
    image.alpha_composite(panel)
    draw = ImageDraw.Draw(image)

    pill(draw, (80, 120, 520, 560), fill=(255, 255, 255, 255), outline=(225, 220, 245), width=6)
    inner = gradient_background((360, 360), PRIMARY, ACCENT)
    mask = Image.new("L", (360, 360), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, 359, 359), radius=110, fill=255)
    image.paste(inner, (120, 160), mask)

    # Abstract crocodile head with a music note and mystery sparkle.
    mark = ImageDraw.Draw(image)
    mark.polygon([(190, 298), (350, 230), (432, 256), (400, 296), (294, 325), (387, 342), (431, 392), (327, 405), (210, 370)], fill=WHITE)
    mark.polygon([(262, 328), (382, 345), (334, 372), (238, 361)], fill=(224, 255, 239))
    mark.ellipse((349, 270, 376, 297), fill=INK)
    mark.polygon([(400, 214), (425, 164), (438, 211), (486, 224), (438, 239), (426, 286)], fill=(255, 224, 245))
    mark.ellipse((150, 184, 250, 284), fill=(255, 255, 255, 40))
    add_music_note(mark, 160, 420, (239, 240, 255))
    add_magnifier(mark, 360, 404, (244, 223, 255), (0, 0, 0, 0))

    add_wordmark(image, 255, "Purple croc with music and mystery cues")
    return image


def concept_2() -> Image.Image:
    image = Image.new("RGBA", (CANVAS_W, CANVAS_H), (255, 255, 255, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((0, 0, CANVAS_W - 1, CANVAS_H - 1), radius=72, fill=(250, 248, 255))

    circle = gradient_background((420, 420), SECONDARY, PRIMARY)
    circle_mask = Image.new("L", (420, 420), 0)
    ImageDraw.Draw(circle_mask).ellipse((0, 0, 419, 419), fill=255)
    image.paste(circle, (110, 182), circle_mask)

    # Croc + C monogram with detective lens and note.
    mark = ImageDraw.Draw(image)
    mark.ellipse((182, 254, 456, 528), outline=WHITE, width=42)
    mark.rectangle((325, 222, 520, 560), fill=(250, 248, 255))
    mark.polygon([(240, 328), (398, 282), (444, 306), (370, 343), (448, 366), (408, 421), (275, 406)], fill=WHITE)
    mark.ellipse((372, 315, 392, 335), fill=INK)
    mark.line((262, 442, 402, 442), fill=(255, 214, 236), width=12)
    mark.line((279, 458, 390, 458), fill=(255, 214, 236), width=12)
    add_magnifier(mark, 292, 362, (255, 220, 242), (0, 0, 0, 0))
    add_music_note(mark, 208, 214, (255, 235, 247))

    add_wordmark(image, 255, "Bolder service mark with croc, clue, and rhythm")
    tag_font = font(FONT_BOLD, 36)
    pill(draw, (614, 496, 1058, 568), fill=MUTED)
    draw.text((650, 516), "detective-pop branding", font=tag_font, fill=PRIMARY)
    return image


def concept_3() -> Image.Image:
    image = Image.new("RGBA", (CANVAS_W, CANVAS_H), (255, 255, 255, 0))
    draw = ImageDraw.Draw(image)
    bg = gradient_background((CANVAS_W, CANVAS_H), (244, 255, 250), (247, 244, 255))
    image.alpha_composite(bg)

    pill(draw, (90, 150, 530, 590), fill=(255, 255, 255, 255), outline=(221, 241, 232), width=6)
    badge = gradient_background((340, 340), ACCENT, PRIMARY)
    badge_mask = Image.new("L", (340, 340), 0)
    ImageDraw.Draw(badge_mask).rounded_rectangle((0, 0, 339, 339), radius=96, fill=255)
    image.paste(badge, (140, 200), badge_mask)

    # CH monogram with crocodile, music, and budae-jjigae hint.
    mark = ImageDraw.Draw(image)
    mono_font = font(FONT_ROUNDED, 172)
    mark.text((188, 248), "CH", font=mono_font, fill=WHITE)
    mark.polygon([(420, 212), (440, 172), (454, 212), (494, 230), (454, 246), (438, 286)], fill=(255, 232, 112))
    mark.ellipse((174, 220, 244, 290), fill=(255, 255, 255, 30))
    add_music_note(mark, 178, 438, (230, 239, 255))
    add_hotpot(mark, 312, 410)
    mark.polygon([(150, 298), (236, 264), (266, 280), (226, 306), (252, 328), (190, 344), (152, 326)], fill=(221, 255, 244))
    mark.ellipse((230, 286, 244, 300), fill=INK)

    add_wordmark(image, 255, "Playful personal mark with favorite motifs tucked inside")
    chip_font = font(FONT_BOLD, 34)
    pill(draw, (614, 498, 964, 566), fill=(229, 253, 243))
    draw.text((652, 516), "most personal", font=chip_font, fill=(28, 140, 98))
    return image


def export_concept(name: str, image: Image.Image):
    image.save(OUT_DIR / f"{name}.png")

    icon = image.crop((80, 120, 520, 560)).resize((512, 512), Image.Resampling.LANCZOS)
    icon.save(OUT_DIR / f"{name}-icon.png")


def export_preview(images: list[Image.Image]):
    preview = Image.new("RGBA", (1460, 2360), (248, 247, 252, 255))
    draw = ImageDraw.Draw(preview)
    header_font = font(FONT_ROUNDED, 64)
    body_font = font(FONT_BOLD, 32)
    draw.text((80, 54), "CrocHub Logo Concepts", font=header_font, fill=INK)
    draw.text((84, 136), "Three directions generated locally for site branding review", font=body_font, fill=(108, 101, 138))

    positions = [(80, 320), (80, 1020), (80, 1720)]
    labels = [
        "Concept 1 — Croc head badge",
        "Concept 2 — Circular C monogram",
        "Concept 3 — CH app-style badge",
    ]

    label_font = font(FONT_ROUNDED, 42)
    for image, (x, y), label in zip(images, positions, labels):
        draw.text((x, y - 74), label, font=label_font, fill=INK)
        card = image.resize((1280, 720), Image.Resampling.LANCZOS)
        preview.paste(card, (x, y), card)

    preview.save(OUT_DIR / "logo-concepts-preview.png")


def main():
    concepts = [concept_1(), concept_2(), concept_3()]
    for idx, image in enumerate(concepts, start=1):
        export_concept(f"logo-concept-{idx}", image)
    export_preview(concepts)


if __name__ == "__main__":
    main()
