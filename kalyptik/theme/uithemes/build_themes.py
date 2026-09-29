#!/usr/bin/env python3
"""Génère les thèmes d'interface Kalyptik (clair et sombre).

Chaque thème part d'un thème moderne d'Euro-Office (web-apps) :
  - Kalyptik Clair  <- theme-white (clair, ergonomie proche d'Office 365)
  - Kalyptik Sombre <- theme-night (sombre)
puis remplace ses couleurs par celles du design system ProfZen 2
(« Copie du soir » : navy #070d18, teal #32b8c6 / #1d748f, violet #7c3aed).

On repart du thème d'origine à chaque génération : si Euro-Office ajoute
des variables dans une mise à jour, il suffit de relancer ce script.

    git submodule update --init --depth 1 web-apps desktop-apps
    python3 kalyptik/theme/uithemes/build_themes.py

Un thème sert à deux endroits : les éditeurs (web-apps) et l'écran d'accueil
/ paramètres (desktop-apps/common/loginpage), qui a ses propres variables
(onglets, panneau latéral, cases à cocher…). Il faut les deux : une variable
absente retombe sur la valeur claire par défaut (texte blanc sur fond blanc
dans le thème sombre).
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
LESS = ROOT / "web-apps/apps/common/main/resources/less"
LOGIN_LESS = ROOT / "desktop-apps/common/loginpage/src/css"

# Couleur de chaque logiciel (mêmes teintes que les icônes)
APPS_LIGHT = {"document": "#2563EB", "spreadsheet": "#059669", "presentation": "#D97706",
              "pdf": "#E11D48", "visio": "#0D9488"}
APPS_DARK = {"document": "#60A5FA", "spreadsheet": "#34D399", "presentation": "#FBBF24",
             "pdf": "#FB7185", "visio": "#2DD4BF"}


def per_app(prefix, colors):
    return {f"{prefix}-{app}": c for app, c in colors.items()}


NAVY = "7, 13, 24"  # --pz-ink-950

LIGHT = {
    # En-tête et barre d'outils : clair et sobre, comme Office 365
    **per_app("toolbar-header", {a: "#EEF1F6" for a in APPS_LIGHT}),
    **per_app("text-toolbar-header-on-background", {a: "#FFFFFF" for a in APPS_LIGHT}),
    # Onglet actif souligné de la couleur du logiciel (repère Office)
    **per_app("highlight-header-tab-underline", APPS_LIGHT),
    **per_app("highlight-toolbar-tab-underline", APPS_LIGHT),

    "background-normal": "#FFFFFF",
    "background-toolbar": "#FFFFFF",
    "background-toolbar-tab": "#FFFFFF",
    "background-toolbar-additional": "#F4F6FA",
    "background-pane": "#F4F6FA",
    "background-primary-dialog-button": "#1D748F",
    "background-accent-button": "#1D748F",
    "background-scrim": "rgba(3, 6, 12, 0.35)",

    "highlight-button-hover": "#E8EDF4",
    "highlight-button-pressed": "#DBE2EC",
    "highlight-button-pressed-hover": "#C9D3E0",
    "highlight-primary-dialog-button-hover": "#17657D",
    "highlight-primary-dialog-button-pressed": "#125669",
    "highlight-header-button-hover": "#E2E7EF",
    "highlight-header-button-pressed": "#D5DCE7",
    "highlight-text-select": "#32B8C6",
    "highlight-category-button-hover": "rgba(29, 116, 143, 0.06)",
    "highlight-category-button-pressed": "rgba(29, 116, 143, 0.14)",

    "border-toolbar": "#D5DCE7",
    "border-toolbar-active-panel-top": "#EEF1F6",
    "border-divider": "#E6EAF0",
    "border-regular-control": "#D5DCE7",
    "border-preview-hover": "#6FD3DD",
    "border-preview-select": "#1D748F",
    "border-control-focus": "#1D748F",
    "border-button-pressed-focus": "#1D748F",
    "border-fill-input-focused": "#1D748F",

    "text-normal": f"rgba({NAVY}, 0.87)",
    "text-normal-pressed": f"rgba({NAVY}, 0.87)",
    "text-secondary": f"rgba({NAVY}, 0.64)",
    "text-tertiary": f"rgba({NAVY}, 0.45)",
    "text-toolbar-header": f"rgba({NAVY}, 0.87)",
    "text-alt-key-hint": f"rgba({NAVY}, 0.87)",
    "text-link": "#1D748F",
    "text-link-hover": "#17657D",
    "text-link-active": "#17657D",
    "text-link-visited": "#1D748F",

    "icon-normal": "#26324A",
    "icon-normal-pressed": "#26324A",
    "icon-toolbar-header": "#26324A",
    "icon-success": "#059669",

    "canvas-background": "#EEF1F6",
    "canvas-ruler-border": "#D5DCE7",
    "canvas-ruler-margins-background": "#DDE3EC",

    "chb-background-normal-hover": "#F4F6FA",
    "chb-background-checked-hover": "#F4F6FA",
    "chb-border-normal-focus": "#1D748F",
    "chb-border-checked-focus": "#1D748F",
    "rb-background-normal-hover": "#F4F6FA",
    "rb-background-checked-hover": "#F4F6FA",
    "rb-border-normal-focus": "#1D748F",
    "rb-border-checked-focus": "#1D748F",
    "slider-track-background-normal": "#E6EAF0",
    "slider-track-background-filled": "#1D748F",
    "slider-thumb-background-normal": "#1D748F",

    # Formes ProfZen (rayons) sans toucher aux dimensions de la barre d'outils
    "border-radius-window": "12px",
    "border-radius-dropdown-menu": "12px",
    "border-radius-form-control": "6px",
}

DARK = {
    # Surfaces « feuilles » ProfZen : toile #070d18 -> feuille #0f1624 -> posée #141c2e
    **per_app("toolbar-header", {a: "#070D18" for a in APPS_DARK}),
    **per_app("highlight-header-tab-underline", APPS_DARK),
    **per_app("highlight-toolbar-tab-underline", APPS_DARK),

    "background-normal": "#0F1624",
    "background-toolbar": "#0F1624",
    "background-toolbar-tab": "#0F1624",
    "background-toolbar-additional": "#141C2E",
    "background-pane": "#141C2E",
    "background-contrast-popover": "#1A2338",
    "background-primary-dialog-button": "#1D748F",
    "background-accent-button": "#1D748F",
    "background-scrim": "rgba(3, 6, 12, 0.72)",
    "background-loader": "rgba(7, 13, 24, 0.9)",

    "highlight-button-hover": "rgba(255, 255, 255, 0.06)",
    "highlight-button-pressed": "rgba(255, 255, 255, 0.09)",
    "highlight-button-pressed-hover": "rgba(255, 255, 255, 0.12)",
    "highlight-primary-dialog-button-hover": "#23839F",
    "highlight-primary-dialog-button-pressed": "#17657D",
    "highlight-header-button-hover": "rgba(255, 255, 255, 0.06)",
    "highlight-header-button-pressed": "rgba(255, 255, 255, 0.09)",
    "highlight-text-select": "#32B8C6",
    "highlight-category-button-hover": "rgba(50, 184, 198, 0.08)",
    "highlight-category-button-pressed": "rgba(50, 184, 198, 0.16)",

    "border-toolbar": "rgba(255, 255, 255, 0.10)",
    "border-toolbar-active-panel-top": "#070D18",
    "border-divider": "rgba(255, 255, 255, 0.10)",
    "border-regular-control": "rgba(255, 255, 255, 0.36)",
    "border-preview-hover": "#6FD3DD",
    "border-preview-select": "#32B8C6",
    "border-control-focus": "#32B8C6",
    "border-button-pressed-focus": "#32B8C6",
    "border-fill-input-focused": "#32B8C6",

    "text-normal": "rgba(255, 255, 255, 0.95)",
    "text-normal-pressed": "rgba(255, 255, 255, 0.95)",
    "text-secondary": "rgba(255, 255, 255, 0.72)",
    "text-tertiary": "rgba(255, 255, 255, 0.58)",
    "text-toolbar-header": "rgba(255, 255, 255, 0.95)",
    "text-link": "#32B8C6",
    "text-link-hover": "#6FD3DD",
    "text-link-active": "#6FD3DD",
    "text-link-visited": "#32B8C6",

    "icon-success": "#34D399",

    "canvas-background": "#070D18",

    "chb-border-normal-focus": "#32B8C6",
    "chb-border-checked-focus": "#32B8C6",
    "rb-border-normal-focus": "#32B8C6",
    "rb-border-checked-focus": "#32B8C6",
    "slider-track-background-filled": "#32B8C6",
    "slider-thumb-background-normal": "#32B8C6",

    "border-radius-window": "12px",
    "border-radius-dropdown-menu": "12px",
    "border-radius-form-control": "6px",
}

# Écran d'accueil et paramètres (variables propres à loginpage)
LIGHT_START = {
    "background-tabbar": "#EEF1F6",
    "background-normal-element": "#F4F6FA",
    "background-normal-element-light": "#FAFBFD",
    "background-action-panel": "#FFFFFF",
    "background-icon-normal": "#FFFFFF",
    "background-primary-button": "#1D748F",
    "highlight-primary-button-hover": "#17657D",
    "highlight-primary-button-pressed": "#125669",
    "highlight-accent-button-hover": "#17657D",
    "highlight-accent-button-pressed": "#125669",
    "highlight-sidebar-item-pressed": "#FFFFFF",
    "highlight-toolbar-tab-underline-document": "#1D748F",
    "border-tabbar": "#D5DCE7",
    "chb-background-checked": "#1D748F",
    "chb-border-checked": "#1D748F",
}

DARK_START = {
    "background-tabbar": "#070D18",
    "background-button": "#141C2E",
    "background-normal-element": "#141C2E",
    "background-normal-element-light": "#1A2338",
    "background-action-panel": "#141C2E",
    "background-icon-normal": "#141C2E",
    "background-primary-button": "#1D748F",
    "background-scroll-thumb": "rgba(255, 255, 255, 0.16)",
    "highlight-primary-button-hover": "#23839F",
    "highlight-primary-button-pressed": "#17657D",
    "highlight-accent-button-hover": "#23839F",
    "highlight-accent-button-pressed": "#17657D",
    "highlight-scroll-thumb-hover": "rgba(255, 255, 255, 0.28)",
    "highlight-sidebar-item-pressed": "#1A2338",
    "border-tabbar": "rgba(255, 255, 255, 0.10)",
    "border-sidebar-icon": "rgba(255, 255, 255, 0.16)",
    "text-inverse": "#FFFFFF",
    "text-contrast-background": "#FFFFFF",
    "chb-background-checked": "#1D748F",
    "chb-border-checked": "#1D748F",
}

# Onglets de la fenêtre (Qt) : « draw » est le nom côté application, « visio » côté éditeurs
LIGHT["toolbar-header-draw"] = LIGHT["toolbar-header-visio"]
DARK["toolbar-header-draw"] = DARK["toolbar-header-visio"]

THEMES = [
    {"file": "kalyptik-light.json", "id": "theme-kalyptik-light", "type": "light",
     "name": "Kalyptik Light", "fr": "Kalyptik Clair", "base": ("colors-table-white.less", "theme-white"),
     "start": ("colors_white.less", "theme-white"), "overrides": {**LIGHT, **LIGHT_START}},
    {"file": "kalyptik-dark.json", "id": "theme-kalyptik-dark", "type": "dark",
     "name": "Kalyptik Dark", "fr": "Kalyptik Sombre", "base": ("colors-table-night.less", "theme-night"),
     "start": ("colors_night.less", "theme-night"), "overrides": {**DARK, **DARK_START}},
]


def fade_to_rgba(value):
    def repl(m):
        h, pct = m.group(1), float(m.group(2))
        h = "".join(c * 2 for c in h) if len(h) == 3 else h
        r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
        return f"rgba({r}, {g}, {b}, {pct / 100:g})"
    return re.sub(r"fade\(\s*#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\s*,\s*([\d.]+)%\s*\)", repl, value)


def read_base(less_file, css_class, folder=LESS):
    text = (folder / less_file).read_text()
    start = text.index("." + css_class)
    body, depth = [], 0
    for line in text[start:].splitlines():
        depth += line.count("{") - line.count("}")
        body.append(line)
        if depth == 0 and len(body) > 1:
            break
    colors = {}
    for line in body:
        line = line.split("//")[0].strip()
        m = re.match(r"--([\w-]+)\s*:\s*(.+?);$", line)
        if m:
            colors[m.group(1)] = fade_to_rgba(m.group(2).strip())
    return colors


def main():
    if not LESS.exists() or not LOGIN_LESS.exists():
        sys.exit("sources absentes : lancez `git submodule update --init --depth 1 web-apps desktop-apps`")
    for t in THEMES:
        colors = read_base(*t["base"])
        # variables de l'écran d'accueil que les éditeurs n'ont pas
        for k, v in read_base(*t["start"], folder=LOGIN_LESS).items():
            colors.setdefault(k, v)
        unknown = sorted(set(t["overrides"]) - set(colors))
        if unknown:
            print(f"{t['file']}: variables absentes du thème de base (ajoutées quand même) : {unknown}")
        colors.update(t["overrides"])
        theme = {
            "name": t["name"],
            "l10n": {"fr": t["fr"]},
            "id": t["id"],
            "type": t["type"],
            "icons": {"cls": "mod2"},  # icônes modernes (voir kalyptik/patches)
            "colors": colors,
        }
        (HERE / t["file"]).write_text(json.dumps(theme, indent=4, ensure_ascii=False) + "\n")
        print(f"{t['file']}: {len(colors)} variables")


if __name__ == "__main__":
    main()
