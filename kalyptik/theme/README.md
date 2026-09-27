# Thème Kalyptik

Identité visuelle : **ProfZen 2** (design system « Copie du soir » : navy #070d18,
teal #32b8c6 / #1d748f, violet #7c3aed). Ergonomie : celle d'Office 365.

Maquettes et logos (source de vérité) : Figma « Kalyptik Office — Logos & Thème »
https://www.figma.com/design/KRXcVQmqp30HuvzYQSrbpz

## Noms des logiciels

| Logiciel              | Nom             | Couleur (clair / sombre) |
| --------------------- | --------------- | ------------------------ |
| Suite                 | Kalyptik Office | teal → violet (encre)    |
| Traitement de texte   | KalyptWrite     | #2563EB / #60A5FA        |
| Tableur               | KalyptCalc      | #059669 / #34D399        |
| Présentation          | KalyptPoint     | #D97706 / #FBBF24        |
| PDF                   | KalyptPDF       | #E11D48 / #FB7185        |
| Formulaires           | KalyptForm      | #7C3AED / #A78BFA        |
| Diagrammes            | KalyptDraw      | #0D9488 / #2DD4BF        |

## Icônes — `icons/`

Style Microsoft 365 (feuille à bandes + pastille-lettre), aux couleurs ProfZen :
pastille « feuille posée » navy, lettre dans la couleur du logiciel, filet d'encre
teal → violet sous la lettre (signature de la suite).

- `svg/` : vectoriel · `png/<app>/<taille>.png` : 16 à 512 px · `ico/` : Windows
- `apercu.png` : planche de contrôle (fond sombre / fond clair, 128 et 32 px)
- Régénérer : `python3 kalyptik/theme/icons/build_icons.py`

## Thèmes d'interface — `uithemes/`

| Fichier               | Nom affiché     | Base Euro-Office | Rôle                     |
| --------------------- | --------------- | ---------------- | ------------------------ |
| `kalyptik-light.json` | Kalyptik Clair  | `theme-white`    | **thème par défaut**     |
| `kalyptik-dark.json`  | Kalyptik Sombre | `theme-night`    | thème sombre ProfZen     |

On garde toute l'ergonomie du thème moderne d'Euro-Office (proche d'Office 365)
et on ne remplace que les couleurs : neutres teintés navy, accent teal,
onglet actif souligné de la couleur du logiciel, rayons ProfZen (fenêtres 12 px).

L'application charge automatiquement les thèmes JSON du dossier
`<installation>/uithemes/`. Régénérer après une mise à jour d'Euro-Office :
`python3 kalyptik/theme/uithemes/build_themes.py`.

## Correctifs — `kalyptik/patches/`

Modifications minimes du code d'Euro-Office, appliquées au build par
`kalyptik/scripts/apply-kalyptik.sh` :

- `web-apps/0001-custom-theme-icon-set.patch` : un thème personnalisé peut
  utiliser le jeu d'icônes moderne (`"icons": {"cls": "mod2"}`).
- `desktop-apps/0001-default-kalyptik-light-theme.patch` : Kalyptik Clair est
  le thème au premier lancement (si le fichier manque : thème système).
- `desktop-apps/0002-install-uithemes.patch` : installe les thèmes à côté de l'exécutable.
- `core/0001-v8-depot-tools-lru-cache.patch` : correctif de build (pas de marque).
  Le correctif V8 d'Euro-Office ne s'applique plus aux versions récentes des
  outils Google ; celui-ci fait la même chose de façon robuste. Euro-Office n'est
  pas touché car il télécharge V8 déjà compilé depuis un cache privé.
