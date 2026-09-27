#!/usr/bin/env python3
"""Génère les éléments de marque Kalyptik Office pour l'application.

Produit `kalyptik/brand/overlay/`, qui reprend l'arborescence d'Euro-Office :
chaque fichier y remplace le fichier du même chemin au moment du build
(voir kalyptik/scripts/apply-kalyptik.sh). Aucun fichier d'Euro-Office n'est
modifié dans le dépôt.

Sources : icônes de kalyptik/theme/icons/svg (voir build_icons.py) et tracés
de texte exportés de Figma (glyphs.json, police Plus Jakarta Sans).
Figma : https://www.figma.com/design/KRXcVQmqp30HuvzYQSrbpz (page « Marque »)

    pip install cairosvg pillow
    python3 kalyptik/theme/icons/build_icons.py   # si les icônes ont changé
    python3 kalyptik/brand/build_brand.py
"""
import json
import re
import shutil
from pathlib import Path

import cairosvg
from PIL import Image

HERE = Path(__file__).resolve().parent
ICONS = HERE.parent / "theme" / "icons"
OUT = HERE / "overlay"
GLYPHS = json.loads((HERE / "glyphs.json").read_text())

NAVY, INK_TEAL, INK_VIOLET = "#070D18", "#32B8C6", "#7C3AED"
LIGHT_BG = "#F4F6FA"

WIN_ICONS = "desktop-apps/win-linux/res/icons"
PROJ_ICONS = "desktop-apps/win-linux/extras/projicons/res/icons"
START_IMG = "desktop-apps/common/loginpage/res/img"
PKG = "desktop-apps/package"


# ---------------------------------------------------------------- utilitaires

def out(rel):
    p = OUT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def write_svg(rel, content):
    out(rel).write_text(content)


def render(svg, rel, w, h):
    cairosvg.svg2png(bytestring=svg.encode(), write_to=str(out(rel)), output_width=w, output_height=h)


def icon_inner(app, prefix):
    """Contenu de l'icône `app`, identifiants préfixés (plusieurs icônes par page)."""
    svg = (ICONS / "svg" / f"{app}.svg").read_text()
    inner = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1)
    inner = re.sub(r"<title>.*?</title>", "", inner)
    ids = set(re.findall(r'id="([^"]+)"', inner))
    for i in ids:
        inner = inner.replace(f'id="{i}"', f'id="{prefix}-{i}"').replace(f"url(#{i})", f"url(#{prefix}-{i})")
    return inner


def icon(app, x, y, size, prefix=None):
    return (f'<svg x="{x}" y="{y}" width="{size}" height="{size}" viewBox="0 -4 264 264">'
            f'{icon_inner(app, prefix or app)}</svg>')


def ink_bar(x, y, w, h, gid):
    return (f'<defs><linearGradient id="{gid}" x1="{x}" y1="0" x2="{x + w}" y2="0" gradientUnits="userSpaceOnUse">'
            f'<stop stop-color="{INK_TEAL}"/><stop offset="1" stop-color="{INK_VIOLET}"/></linearGradient></defs>'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h / 2}" fill="url(#{gid})"/>')


def glyph(name, x, y, fill, opacity=1.0, scale=1.0):
    return (f'<path transform="translate({x} {y}) scale({scale})" d="{GLYPHS[name]}" '
            f'fill="{fill}" fill-opacity="{opacity}"/>')


def doc(w, h, body, extra=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" fill="none"{extra}>{body}</svg>\n'


# ------------------------------------------------------------ application

def app_icons():
    for name in ("desktopeditors-eo.ico", "desktopeditors.ico"):
        shutil.copy(ICONS / "ico" / "suite.ico", out(f"{WIN_ICONS}/{name}"))
    shutil.copy(ICONS / "png" / "suite" / "64.png", out(f"{WIN_ICONS}/app-icon_64.png"))
    write_svg(f"{WIN_ICONS}/app-icon-eo.svg", doc(24, 24, icon("suite", 0, 0, 24)))


def window_logos():
    """Logo en haut à gauche de la fenêtre (83 x 20) : icône + « Kalyptik »."""
    for variant, fill, op in (("light", NAVY, 0.87), ("dark", "#FFFFFF", 0.95)):
        svg = doc(83, 20, icon("suite", -1, 0, 20, f"wm{variant}") +
                  glyph("wordmark_kalyptik_13px", 22, 3.6, fill, op))
        write_svg(f"{WIN_ICONS}/logo-{variant}-eo.svg", svg)
        for suffix, (w, h) in {"": (83, 20), "@1.25x": (104, 25), "@1.5x": (125, 30), "@1.75x": (145, 35)}.items():
            render(svg, f"{WIN_ICONS}/logo-{variant}-eo{suffix}.png", w, h)


def splash():
    grid = "".join(f'<rect x="{x}" y="0" width="1" height="250" fill="white" fill-opacity="0.035"/>' for x in range(0, 501, 20))
    grid += "".join(f'<rect x="0" y="{y}" width="500" height="1" fill="white" fill-opacity="0.035"/>' for y in range(0, 251, 20))
    body = (f'<rect width="500" height="250" fill="{NAVY}"/>{grid}'
            f'{icon("suite", 36.5, 67.25, 115.5, "splash")}'
            f'{glyph("title_kalyptik_office_34px", 174.5, 97.6, "#FFFFFF", 0.95)}'
            f'{ink_bar(174, 136, 72, 5, "splashInk")}'
            f'{glyph("subtitle_apps_12px", 175, 156, "#FFFFFF", 0.72)}')
    svg = doc(500, 250, body)
    write_svg(f"{WIN_ICONS}/splash-eo.svg", svg)
    render(svg, f"{WIN_ICONS}/splash-eo-1.png", 1440, 720)
    render(svg, "preview/splash.png", 1000, 500)


# Icône de chaque extension de fichier (associations Windows)
EXTENSIONS = {
    "write": "doc docx dotx odt ott fodt rtf txt md epub fb2 htm html mht hwp hwpx pages xml word",
    "calc": "xls xlsx xlsm xlsb xltx ods ots fods csv numbers cell",
    "point": "ppt pptx pptm pot potx pps ppsx odp otp key slide",
    "pdf": "pdf djvu xps oxps",
    "form": "docxf oform form",
    "draw": "vsdx odg",
}


def file_type_icons():
    for app, exts in EXTENSIONS.items():
        for ext in exts.split():
            shutil.copy(ICONS / "ico" / f"{app}.ico", out(f"{PROJ_ICONS}/{ext}.ico"))
    shutil.copy(ICONS / "ico" / "suite.ico", out(f"{PROJ_ICONS}/desktopeditors.ico"))


# ------------------------------------------------------------ écran d'accueil

START_CARDS = {"docx": "write", "xlsx": "calc", "pptx": "point", "pdf": "form"}


def start_page():
    for fmt, app in START_CARDS.items():
        for suffix in ("", "-dark"):
            # carte « Créer » : zone 108 x 100, icône centrée
            write_svg(f"{START_IMG}/common-svg/{fmt}-big{suffix}.svg",
                      doc(108, 100, icon(app, 4, 0, 100, f"{fmt}big{suffix.strip('-')}")))
    for variant in ("light", "dark"):
        write_svg(f"{START_IMG}/idx-logo-{variant}-eo.svg",
                  doc(24, 24, icon("suite", 0, 0, 24, f"idxlogo{variant}"), ' height="24px" width="24px"'))


# ------------------------------------------------------------ paquets

def linux_icons():
    for s in (16, 24, 32, 48, 64, 128, 256):
        shutil.copy(ICONS / "png" / "suite" / f"{s}.png", out(f"{PKG}/common/linux/icons-eo/{s}x{s}.png"))


def installer_images():
    """Images de l'assistant d'installation Windows (Inno Setup)."""
    tall = [(164, 314), (202, 386), (240, 459), (290, 556), (315, 604), (366, 700), (416, 797)]
    small = [58, 71, 85, 103, 112, 129, 147]
    for variant, bg, fill, op in (("Dark", NAVY, "#FFFFFF", 0.95), ("Light", LIGHT_BG, NAVY, 0.87)):
        w, h = 164, 314  # dessin de référence, rendu à chaque taille
        title_scale = 132 / 239
        body = (f'<rect width="{w}" height="{h}" fill="{bg}"/>'
                f'{icon("suite", 32, 70, 100, "wiz")}'
                f'{glyph("title_kalyptik_office_34px", 16, 196, fill, op, title_scale)}'
                f'{ink_bar(16, 226, 40, 4, "wizInk")}')
        svg = doc(w, h, body)
        for tw, th in tall:
            render(svg, f"{PKG}/inno/res/WizImage-{variant}-{tw}x{th}.png", tw, th)
        svg_small = doc(58, 58, f'<rect width="58" height="58" fill="{bg}"/>{icon("suite", 5, 5, 48, "wizs")}')
        for s in small:
            render(svg_small, f"{PKG}/inno/res/WizSmallImage-{variant}-{s}x{s}.png", s, s)


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    app_icons()
    window_logos()
    splash()
    file_type_icons()
    start_page()
    linux_icons()
    installer_images()
    # la prévisualisation n'est pas copiée dans les sources
    shutil.rmtree(HERE / "preview", ignore_errors=True)
    shutil.move(str(OUT / "preview"), str(HERE / "preview"))
    n = sum(1 for p in OUT.rglob("*") if p.is_file())
    print(f"{n} fichiers générés dans {OUT.relative_to(HERE.parents[1])}")


if __name__ == "__main__":
    main()
