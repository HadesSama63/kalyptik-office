#!/usr/bin/env python3
"""Complète les traductions françaises des éditeurs au moment du build.

Euro-Office ajoute souvent des textes en anglais avant que leur traduction
française n'arrive : ils s'affichent alors en anglais. Ce script remplit les
clés absentes des fichiers web-apps/apps/*/*/locale/fr.json à partir du
dictionnaire kalyptik/i18n/fr.json (texte anglais -> texte français).

    python3 kalyptik/i18n/complete_fr.py            # compléter
    python3 kalyptik/i18n/complete_fr.py --check    # lister ce qui manque encore

Les textes encore absents du dictionnaire sont listés : il suffit de les
ajouter à fr.json (clé = texte anglais exact) après une mise à jour.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DICT = json.loads((Path(__file__).with_name("fr.json")).read_text(encoding="utf-8"))


def norm(text):
    """Compare les textes sans tenir compte des espaces (insécables compris)."""
    return " ".join(str(text).split())


DICT = {norm(k): v for k, v in DICT.items()}


def main():
    check = "--check" in sys.argv
    added, untranslated = 0, {}
    for en_file in sorted(ROOT.glob("web-apps/apps/*/*/locale/en.json")):
        fr_file = en_file.with_name("fr.json")
        if not fr_file.exists():
            continue
        en = json.loads(en_file.read_text(encoding="utf-8"))
        fr = json.loads(fr_file.read_text(encoding="utf-8"))
        changed = False
        for key, text in en.items():
            if str(fr.get(key, "")).strip():
                continue
            if norm(text) in DICT:
                fr[key] = DICT[norm(text)]
                added += 1
                changed = True
            else:
                untranslated[text] = key
        if changed and not check:
            fr_file.write_text(json.dumps(fr, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for text, key in untranslated.items():
        print(f"   à traduire ({key}) : {text}")
    print(f"   {added} texte(s) {'traduisible(s)' if check else 'traduit(s)'}, {len(untranslated)} sans traduction")


if __name__ == "__main__":
    main()
