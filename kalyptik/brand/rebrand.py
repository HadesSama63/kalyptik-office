#!/usr/bin/env python3
"""Renomme Euro-Office en Kalyptik Office dans les sources, au moment du build.

Chaque règle remplace un texte précis dans un fichier précis. Si Euro-Office
modifie une de ces lignes dans une mise à jour, le script s'arrête avec un
message clair (règle introuvable) au lieu de produire une version à moitié
renommée. Idempotent : une règle déjà appliquée est ignorée.

    python3 kalyptik/brand/rebrand.py            # appliquer
    python3 kalyptik/brand/rebrand.py --check    # vérifier sans modifier

Ce qui ne change PAS, volontairement :
- les mentions de copyright d'Ascensio System SIA (obligation de la licence AGPL) ;
- le nom de l'exécutable (DesktopEditors) et l'identifiant d'association « ASC.Editors »,
  sur lesquels reposent les mises à jour et les associations de fichiers ;
- le protocole « oo-office:// » utilisé par les connecteurs cloud (Nextcloud…).
Le site affiché (fenêtre « À propos », installeur Windows) est SITE.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

SUITE = "Kalyptik Office"
SITE = "https://kalyptik.com"

DEFINES = "desktop-apps/win-linux/src/defines.h"
VERSION = "desktop-apps/win-linux/src/version.h"
INNO = "desktop-apps/package/inno/defines.iss"
LINUX_M4 = "desktop-apps/package/common/linux/defines.m4"
START = "desktop-apps/common/loginpage/src/panelrecent.js"

# (fichier, texte d'origine, remplacement)
RULES = [
    # --- Application : nom, dossiers de données, registre, instance unique
    (DEFINES, '#define APP_TITLE "Euro-Office"', f'#define APP_TITLE "{SUITE}"'),
    (DEFINES, '# define APP_DATA_PATH "/euro-office/desktopeditors"', '# define APP_DATA_PATH "/kalyptik/office"'),
    (DEFINES, '# define REG_GROUP_KEY "euro-office"', '# define REG_GROUP_KEY "kalyptik"'),
    (DEFINES, '# define APP_MUTEX_NAME "asc:editors"', '# define APP_MUTEX_NAME "kalyptik:office"'),
    (DEFINES, '# define DESKTOP_FILE_NAME "eurooffice-desktopeditors"', '# define DESKTOP_FILE_NAME "kalyptik-office"'),
    (DEFINES, '# define APP_DATA_PATH "/Euro-Office/DesktopEditors"', '# define APP_DATA_PATH "/Kalyptik/DesktopEditors"'),
    (DEFINES, '# define APP_REG_NAME  "Euro-Office"', '# define APP_REG_NAME  "Kalyptik"'),
    (DEFINES, '# define REG_GROUP_KEY "Euro-Office"', '# define REG_GROUP_KEY "Kalyptik"'),
    (DEFINES, '# define REG_UNINST_KEY "Euro-Office Desktop Editors"', f'# define REG_UNINST_KEY "{SUITE}"'),
    (DEFINES, '# define APP_MUTEX_NAME "TEAMLAB"', '# define APP_MUTEX_NAME "KALYPTIK_OFFICE"'),
    (DEFINES, '#define WINDOW_NAME "Euro-Office"', f'#define WINDOW_NAME "{SUITE}"'),
    (DEFINES, '#define APP_USER_MODEL_ID "ASC.Documents.5"', '#define APP_USER_MODEL_ID "Kalyptik.Office.1"'),
    (DEFINES, '#define APP_SIMPLE_WINDOW_TITLE "Euro-Office Editor"', f'#define APP_SIMPLE_WINDOW_TITLE "{SUITE}"'),
    (DEFINES, '#define FILE_PREFIX "eurooffice_"', '#define FILE_PREFIX "kalyptik_"'),
    (DEFINES, '#define URL_SITE                "https://github.com/Euro-Office"',
              f'#define URL_SITE                "{SITE}"'),

    # --- Propriétés de l'exécutable Windows
    (VERSION, '#define VER_FILEDESCRIPTION_STR     "Euro-Office Desktop Editors\\0"',
              f'#define VER_FILEDESCRIPTION_STR     "{SUITE}\\0"'),
    (VERSION, '#define VER_PRODUCTNAME_STR         "Euro-Office\\0"', f'#define VER_PRODUCTNAME_STR         "{SUITE}\\0"'),

    # --- Fenêtre « À propos » (Linux : ABOUT_PAGE_APP_NAME vient de COMPANY_NAME/PRODUCT_NAME)
    ("build/windows/build.ps1", "'-DABOUT_PAGE_APP_NAME=Desktop Editors'", f"'-DABOUT_PAGE_APP_NAME={SUITE}'"),
    ("desktop-apps/win-linux/src/prop/cmainwindowimpl.cpp",
     '_json_obj["appname"]    = "Euro-Office Desktop Editors";', f'_json_obj["appname"]    = "{SUITE}";'),

    # --- Installeur Windows (doit rester cohérent avec defines.h ci-dessus)
    (INNO, '; -- Euro-Office Desktop Editors Defines --', f'; -- {SUITE} Defines --'),
    (INNO, '#define sCompanyName                    "Euro-Office"', '#define sCompanyName                    "Kalyptik"'),
    (INNO, '#define sProductName                    "Desktop Editors"', '#define sProductName                    "Office"'),
    (INNO, '#define sAppName                        str(sCompanyName)', f'#define sAppName                        "{SUITE}"'),
    (INNO, '#define sAppPublisherURL                "https://www.onlyoffice.com/"', f'#define sAppPublisherURL                "{SITE}"'),
    (INNO, '#define sAppSupportURL                  "https://www.onlyoffice.com/support.aspx"', f'#define sAppSupportURL                  "{SITE}"'),
    (INNO, '#define sAppIconName                    "Euro-Office"', f'#define sAppIconName                    "{SUITE}"'),
    (INNO, '#define APP_USER_MODEL_ID               "ASC.Documents.5"', '#define APP_USER_MODEL_ID               "Kalyptik.Office.1"'),
    (INNO, '#define APP_MUTEX_NAME                  "TEAMLAB"', '#define APP_MUTEX_NAME                  "KALYPTIK_OFFICE"'),
    (INNO, '#define ASSC_APP_NAME                   "Euro-Office"', f'#define ASSC_APP_NAME                   "{SUITE}"'),
    (INNO, '#define ASCC_REG_REGISTERED_APP_NAME    "Euro-Office Editors"', f'#define ASCC_REG_REGISTERED_APP_NAME    "{SUITE}"'),
    (INNO, '#define ASSOC_APP_FRIENDLY_NAME         "Euro-Office Editors"', f'#define ASSOC_APP_FRIENDLY_NAME         "{SUITE}"'),

    # --- Linux : nom affiché dans le menu des applications
    (LINUX_M4, "define(`_NAME',M4_COMPANY_NAME)dnl", f"define(`_NAME',{SUITE})dnl"),
    (LINUX_M4, "define(`_GENERICNAME',Document Editor)dnl", "define(`_GENERICNAME',Office Suite)dnl"),

    # --- Écran d'accueil : cartes « Créer » aux noms et couleurs des logiciels
    (START, "title: utils.Lang.newDoc,\n                            langKey: 'newDoc',",
            "title: 'KalyptWrite',\n                            langKey: 'kalyptWrite',"),
    (START, "gradientColorStart: '#4298C5',\n                                gradientColorEnd: '#2D84B2',\n                                bgColorWinXP: '#287ca9',",
            "gradientColorStart: '#2563EB',\n                                gradientColorEnd: '#1D4ED8',\n                                bgColorWinXP: '#2563EB',"),
    (START, "title: utils.Lang.newXlsx,\n                            langKey: 'newXlsx',",
            "title: 'KalyptCalc',\n                            langKey: 'kalyptCalc',"),
    (START, "gradientColorStart: '#5BB514',\n                                gradientColorEnd: '#318C2B',\n                                bgColorWinXP: '#3aa133',",
            "gradientColorStart: '#059669',\n                                gradientColorEnd: '#047857',\n                                bgColorWinXP: '#059669',"),
    (START, "title: utils.Lang.newPptx,\n                            langKey: 'newPptx',",
            "title: 'KalyptPoint',\n                            langKey: 'kalyptPoint',"),
    (START, "gradientColorStart: '#F4893A',\n                                gradientColorEnd: '#DE7341',\n                                bgColorWinXP: '#f36700',",
            "gradientColorStart: '#D97706',\n                                gradientColorEnd: '#B45309',\n                                bgColorWinXP: '#D97706',"),
    (START, "title: utils.Lang.newForm,\n                            langKey: 'newForm',",
            "title: 'KalyptForm',\n                            langKey: 'kalyptForm',"),
    (START, "gradientColorStart: '#F36653',\n                                gradientColorEnd: '#D2402D',\n                                bgColorWinXP: '#e54d39',",
            "gradientColorStart: '#7C3AED',\n                                gradientColorEnd: '#6D28D9',\n                                bgColorWinXP: '#7C3AED',"),
]

# Libellé des modèles de formulaire (.docxf) dans l'installeur Windows, toutes langues
BULK = [("desktop-apps/package/inno/_messages.iss", "Euro-Office", "KalyptForm")]


def read(rel):
    return (ROOT / rel).read_bytes().decode("utf-8")  # garde BOM et fins de ligne telles quelles


def write(rel, text):
    (ROOT / rel).write_bytes(text.encode("utf-8"))


def main():
    check = "--check" in sys.argv
    errors, applied = [], 0
    for rel, old, new in RULES:
        text = read(rel)
        if "\r\n" in text and "\n" in old:  # fichier en fins de ligne Windows
            old, new = old.replace("\n", "\r\n"), new.replace("\n", "\r\n")
        if old in text:
            if text.count(old) != 1:
                errors.append(f"{rel}: « {old.splitlines()[0]} » trouvé {text.count(old)} fois (1 attendu)")
                continue
            applied += 1
            if not check:
                write(rel, text.replace(old, new))
        elif new not in text:
            errors.append(f"{rel}: règle introuvable, Euro-Office a changé cette ligne : « {old.splitlines()[0]} »")
    for rel, old, new in BULK:
        text = read(rel)
        if old in text:
            applied += 1
            if not check:
                write(rel, text.replace(old, new))
    for e in errors:
        print("ERREUR", e, file=sys.stderr)
    print(f"{applied} règle(s) {'applicable(s)' if check else 'appliquée(s)'}, {len(errors)} erreur(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
