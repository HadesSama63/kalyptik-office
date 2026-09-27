#!/usr/bin/env python3
"""Génère les icônes Kalyptik Office (SVG, PNG, ICO).

Source de vérité : fichier Figma « Kalyptik Office — Logos & Thème »
https://www.figma.com/design/KRXcVQmqp30HuvzYQSrbpz
Les formes, couleurs et lettres (Plus Jakarta Sans ExtraBold vectorisée)
ci-dessous sont celles exportées de Figma. Pour modifier un logo : modifier
Figma, puis reporter ici et relancer :

    pip install cairosvg pillow
    python3 kalyptik/theme/icons/build_icons.py
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
PNG_SIZES = [16, 24, 32, 48, 64, 128, 256, 512]

INK = ("#32B8C6", "#7C3AED")  # encre ProfZen (teal -> violet)

W75 = 'fill="white" fill-opacity="0.75"'

GLYPHS = {
    "K": "M70.9281 153V96.38H82.7081V124.728L79.4401 123.588L102.088 96.38H116.832L94.4121 123.436L95.0961 115.076L117.288 153H103.532L89.7001 129.06L82.7081 137.496V153H70.9281Z",
    "W": "M68.4314 153L53.6114 96.38H66.3794L77.5514 143.804H74.1314L85.9114 96.38H98.0714L109.851 143.804H106.431L117.603 96.38H130.371L115.551 153H101.871L90.0154 107.4H93.9674L82.1114 153H68.4314Z",
    "C": "M94.5665 153.912C90.5132 153.912 86.7385 153.177 83.2425 151.708C79.7972 150.239 76.7825 148.187 74.1985 145.552C71.6145 142.917 69.5878 139.827 68.1185 136.28C66.6998 132.733 65.9905 128.857 65.9905 124.652C65.9905 120.447 66.6998 116.571 68.1185 113.024C69.5372 109.427 71.5385 106.336 74.1225 103.752C76.7065 101.117 79.7212 99.0907 83.1665 97.672C86.6625 96.2027 90.4625 95.468 94.5665 95.468C98.6705 95.468 102.344 96.152 105.586 97.52C108.88 98.888 111.666 100.712 113.946 102.992C116.226 105.272 117.848 107.805 118.81 110.592L108.398 115.608C107.436 112.872 105.738 110.617 103.306 108.844C100.925 107.02 98.0118 106.108 94.5665 106.108C91.2225 106.108 88.2838 106.893 85.7505 108.464C83.2172 110.035 81.2412 112.213 79.8225 115C78.4545 117.736 77.7705 120.953 77.7705 124.652C77.7705 128.351 78.4545 131.593 79.8225 134.38C81.2412 137.167 83.2172 139.345 85.7505 140.916C88.2838 142.487 91.2225 143.272 94.5665 143.272C98.0118 143.272 100.925 142.385 103.306 140.612C105.738 138.788 107.436 136.508 108.398 133.772L118.81 138.788C117.848 141.575 116.226 144.108 113.946 146.388C111.666 148.668 108.88 150.492 105.586 151.86C102.344 153.228 98.6705 153.912 94.5665 153.912Z",
    "P": "M72.3383 153V96.38H94.0743C97.9756 96.38 101.421 97.064 104.41 98.432C107.45 99.8 109.832 101.827 111.554 104.512C113.277 107.197 114.138 110.516 114.138 114.468C114.138 118.319 113.252 121.587 111.478 124.272C109.756 126.957 107.374 129.009 104.334 130.428C101.345 131.796 97.9249 132.48 94.0743 132.48H84.1183V153H72.3383ZM84.1183 122.22H94.1503C95.8223 122.22 97.2663 121.891 98.4823 121.232C99.6983 120.573 100.636 119.661 101.294 118.496C102.004 117.331 102.358 115.988 102.358 114.468C102.358 112.897 102.004 111.529 101.294 110.364C100.636 109.199 99.6983 108.287 98.4823 107.628C97.2663 106.969 95.8223 106.64 94.1503 106.64H84.1183V122.22Z",
    "PDF": "M55.1283 138V108.2H66.5683C68.6216 108.2 70.4349 108.56 72.0083 109.28C73.6083 110 74.8616 111.067 75.7683 112.48C76.6749 113.893 77.1283 115.64 77.1283 117.72C77.1283 119.747 76.6616 121.467 75.7283 122.88C74.8216 124.293 73.5683 125.373 71.9683 126.12C70.3949 126.84 68.5949 127.2 66.5683 127.2H61.3283V138H55.1283ZM61.3283 121.8H66.6083C67.4883 121.8 68.2483 121.627 68.8883 121.28C69.5283 120.933 70.0216 120.453 70.3683 119.84C70.7416 119.227 70.9283 118.52 70.9283 117.72C70.9283 116.893 70.7416 116.173 70.3683 115.56C70.0216 114.947 69.5283 114.467 68.8883 114.12C68.2483 113.773 67.4883 113.6 66.6083 113.6H61.3283V121.8ZM81.1048 138V108.2H90.8248C94.0515 108.2 96.8515 108.84 99.2248 110.12C101.598 111.4 103.438 113.16 104.745 115.4C106.052 117.64 106.705 120.2 106.705 123.08C106.705 125.96 106.052 128.533 104.745 130.8C103.438 133.04 101.598 134.8 99.2248 136.08C96.8515 137.36 94.0515 138 90.8248 138H81.1048ZM87.3048 132.6H90.9848C92.9315 132.6 94.6115 132.213 96.0248 131.44C97.4382 130.64 98.5315 129.533 99.3048 128.12C100.105 126.68 100.505 125 100.505 123.08C100.505 121.133 100.105 119.453 99.3048 118.04C98.5315 116.627 97.4382 115.533 96.0248 114.76C94.6115 113.987 92.9315 113.6 90.9848 113.6H87.3048V132.6ZM110.675 138V108.2H131.075V113.6H116.875V121.16H129.075V126.56H116.875V138H110.675Z",
    "F": "M74.7133 153V96.38H113.473V106.64H86.4933V121.004H109.673V131.264H86.4933V153H74.7133Z",
    "D": "M68.9242 153V96.38H87.3922C93.5229 96.38 98.8429 97.596 103.352 100.028C107.862 102.46 111.358 105.804 113.84 110.06C116.323 114.316 117.564 119.18 117.564 124.652C117.564 130.124 116.323 135.013 113.84 139.32C111.358 143.576 107.862 146.92 103.352 149.352C98.8429 151.784 93.5229 153 87.3922 153H68.9242ZM80.7042 142.74H87.6962C91.3949 142.74 94.5869 142.005 97.2722 140.536C99.9575 139.016 102.035 136.913 103.504 134.228C105.024 131.492 105.784 128.3 105.784 124.652C105.784 120.953 105.024 117.761 103.504 115.076C102.035 112.391 99.9575 110.313 97.2722 108.844C94.5869 107.375 91.3949 106.64 87.6962 106.64H80.7042V142.74Z",
}

MOTIFS = {
    "none": "",
    "lines": "\n".join(
        f'<rect x="168" y="{y}" width="{w}" height="8" rx="4" fill="white" fill-opacity="{o}"/>'
        for y, w, o in [(42, 64, .75), (62, 40, .75), (112, 64, .75), (132, 40, .75), (182, 64, .85), (202, 40, .85)]
    ),
    "grid": "\n".join([
        '<rect x="72" y="92" width="176" height="4" fill="#070D18" fill-opacity="0.55"/>',
        '<rect x="72" y="162" width="176" height="4" fill="#070D18" fill-opacity="0.55"/>',
        '<rect x="200" y="24" width="4" height="208" fill="#070D18" fill-opacity="0.55"/>',
    ]),
    "pie": "\n".join([
        '<path d="M240 136C240 143.911 237.654 151.645 233.259 158.223C228.864 164.801 222.616 169.928 215.307 172.955C207.998 175.983 199.956 176.775 192.196 175.231C184.437 173.688 177.31 169.878 171.716 164.284C166.122 158.69 162.312 151.563 160.769 143.804C159.225 136.044 160.017 128.002 163.045 120.693C166.072 113.384 171.199 107.136 177.777 102.741C184.355 98.346 192.089 96 200 96L200 136H240Z" fill="white" fill-opacity="0.92"/>',
        '<path d="M208 88C213.253 88 218.454 89.0346 223.307 91.0448C228.16 93.055 232.57 96.0014 236.284 99.7157C239.999 103.43 242.945 107.84 244.955 112.693C246.965 117.546 248 122.747 248 128L208 128L208 88Z" fill="white" fill-opacity="0.55"/>',
    ]),
    "fold": "\n".join([
        f'<rect x="172" y="124" width="56" height="8" rx="4" {W75}/>',
        f'<rect x="172" y="146" width="56" height="8" rx="4" {W75}/>',
        '<path d="M196 24L248 76H208C200 76 196 72 196 64V24Z" fill="white" fill-opacity="0.9"/>',
    ]),
    "checks": "\n".join(
        f'<rect x="174" y="{y}" width="18" height="18" rx="3" stroke="white" stroke-opacity="0.9" stroke-width="4"/>\n'
        f'<rect x="204" y="{y + 5}" width="30" height="8" rx="4" {W75}/>'
        for y in (50, 120, 190)
    ),
    "nodes": "\n".join([
        '<line x1="184.12" y1="62.675" x2="224.12" y2="126.675" stroke="white" stroke-opacity="0.85" stroke-width="5"/>',
        '<line x1="224.12" y1="129.325" x2="184.12" y2="193.325" stroke="white" stroke-opacity="0.85" stroke-width="5"/>',
        *(f'<circle cx="{cx}" cy="{cy}" r="13" fill="white" fill-opacity="0.95"/>' for cx, cy in [(182, 64), (222, 128), (182, 192)]),
    ]),
}

# id, nom, lettre, (clair, moyen, foncé), motif, couleur de la lettre
APPS = [
    ("suite", "Kalyptik Office", "K", ("#6FD3DD", "#32B8C6", "#1D748F"), "none", "white"),
    ("write", "KalyptWrite", "W", ("#93C5FD", "#60A5FA", "#2563EB"), "lines", "#60A5FA"),
    ("calc", "KalyptCalc", "C", ("#6EE7B7", "#34D399", "#059669"), "grid", "#34D399"),
    ("point", "KalyptPoint", "P", ("#FCD34D", "#FBBF24", "#D97706"), "pie", "#FBBF24"),
    ("pdf", "KalyptPDF", "PDF", ("#FDA4AF", "#FB7185", "#E11D48"), "fold", "#FB7185"),
    ("form", "KalyptForm", "F", ("#C4B5FD", "#A78BFA", "#7C3AED"), "checks", "#A78BFA"),
    ("draw", "KalyptDraw", "D", ("#5EEAD4", "#2DD4BF", "#0D9488"), "nodes", "#2DD4BF"),
]

SHEET_CLIP = '<rect x="72" y="24" width="176" height="208" rx="26" fill="white"/>'
PDF_MASK = 'M98 24H196L248 76V206C248 223.333 239.333 232 222 232H98C80.6667 232 72 223.333 72 206V50C72 32.6667 80.6667 24 98 24Z'


def svg(app_id, name, letter, colors, motif, letter_fill):
    light, mid, dark = colors
    third = 'url(#inkBand)' if app_id == "suite" else dark
    bands = (f'<rect x="72" y="24" width="176" height="70" fill="{light}"/>\n'
             f'<rect x="72" y="94" width="176" height="70" fill="{mid}"/>\n'
             f'<rect x="72" y="164" width="176" height="70" fill="{third}"/>')
    if app_id == "pdf":
        sheet = (f'<mask id="sheetMask" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="72" y="24" width="176" height="208">'
                 f'<path d="{PDF_MASK}" fill="white"/></mask>\n'
                 f'<g mask="url(#sheetMask)">\n{bands}\n{MOTIFS[motif]}\n</g>')
        border = ""
    else:
        sheet = (f'<g clip-path="url(#sheetClip)">\n<rect x="72" y="24" width="176" height="208" rx="26" fill="{dark}"/>\n'
                 f'{bands}\n{MOTIFS[motif]}\n</g>')
        border = '<rect x="72.5" y="24.5" width="175" height="207" rx="25.5" stroke="white" stroke-opacity="0.18"/>'
    return f'''<svg width="264" height="264" viewBox="0 -4 264 264" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>{name}</title>
{sheet}
{border}
<g filter="url(#badgeShadow)">
<rect x="24" y="60" width="136" height="136" rx="24" fill="url(#badgeFill)"/>
<rect x="24.75" y="60.75" width="134.5" height="134.5" rx="23.25" stroke="white" stroke-opacity="0.1" stroke-width="1.5"/>
<path d="{GLYPHS[letter]}" fill="{letter_fill}"/>
<rect x="60" y="168" width="64" height="8" rx="4" fill="url(#inkLine)"/>
</g>
<defs>
<filter id="badgeShadow" x="0" y="48" width="184" height="184" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="2"/>
<feGaussianBlur stdDeviation="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.01 0 0 0 0 0.02 0 0 0 0 0.05 0 0 0 0.45 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="12"/>
<feGaussianBlur stdDeviation="12"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.01 0 0 0 0 0.02 0 0 0 0 0.05 0 0 0 0.35 0"/>
<feBlend mode="normal" in2="effect1" result="effect2"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect2" result="shape"/>
</filter>
<linearGradient id="badgeFill" x1="92" y1="60" x2="92" y2="196" gradientUnits="userSpaceOnUse">
<stop stop-color="#1A2338"/><stop offset="1" stop-color="#0F1624"/>
</linearGradient>
<linearGradient id="inkLine" x1="60" y1="172" x2="124" y2="172" gradientUnits="userSpaceOnUse">
<stop stop-color="{INK[0]}"/><stop offset="1" stop-color="{INK[1]}"/>
</linearGradient>
<linearGradient id="inkBand" x1="72" y1="199" x2="248" y2="199" gradientUnits="userSpaceOnUse">
<stop stop-color="#1D748F"/><stop offset="1" stop-color="{INK[1]}"/>
</linearGradient>
<clipPath id="sheetClip">{SHEET_CLIP}</clipPath>
</defs>
</svg>
'''


def main():
    import cairosvg
    from PIL import Image

    for app_id, name, letter, colors, motif, letter_fill in APPS:
        content = svg(app_id, name, letter, colors, motif, letter_fill)
        (HERE / "svg").mkdir(exist_ok=True)
        (HERE / "svg" / f"{app_id}.svg").write_text(content)
        png_dir = HERE / "png" / app_id
        png_dir.mkdir(parents=True, exist_ok=True)
        for size in PNG_SIZES:
            cairosvg.svg2png(bytestring=content.encode(), write_to=str(png_dir / f"{size}.png"),
                             output_width=size, output_height=size)
        (HERE / "ico").mkdir(exist_ok=True)
        Image.open(png_dir / "256.png").save(HERE / "ico" / f"{app_id}.ico",
                                             sizes=[(s, s) for s in (16, 24, 32, 48, 64, 128, 256)])
        print(f"{name}: ok")


if __name__ == "__main__":
    main()
