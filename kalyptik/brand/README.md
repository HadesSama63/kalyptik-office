# Marque Kalyptik Office

Tout ce qui transforme Euro-Office en **Kalyptik Office** dans l'application,
appliqué au build par `kalyptik/scripts/apply-kalyptik.sh`.

| Élément | Fichier | Rôle |
| --- | --- | --- |
| Renommage | `rebrand.py` | 42 remplacements ciblés (nom de l'application, dossiers de données, registre Windows, installeur, menu Linux, écran d'accueil). S'arrête avec un message clair si Euro-Office a modifié une des lignes visées. |
| Images | `overlay/` | 112 fichiers qui remplacent ceux d'Euro-Office au même chemin : icône de l'application, logo de la fenêtre (clair/sombre), écran de démarrage, icônes des types de fichiers Windows, cartes « Créer » de l'écran d'accueil, icônes Linux, images de l'installeur Windows. |
| Générateur | `build_brand.py` | Recrée `overlay/` à partir des icônes (`kalyptik/theme/icons`) et des tracés de texte Figma (`glyphs.json`). |
| Aperçu | `preview/splash.png` | Écran de démarrage. |

Figma (page « Marque ») : https://www.figma.com/design/KRXcVQmqp30HuvzYQSrbpz

## Ce qui apparaît où

- **Nom** : « Kalyptik Office » (titre des fenêtres, « À propos », menu des applications,
  installeur, Ajout/Suppression de programmes).
- **Écran d'accueil**, cartes « Créer » : KalyptWrite (DOCX), KalyptCalc (XLSX),
  KalyptPoint (PPTX), KalyptForm (formulaire PDF), avec leurs icônes et couleurs.
- **Fichiers** (Windows) : chaque extension prend l'icône de son logiciel
  (.docx → KalyptWrite, .xlsx → KalyptCalc, .pptx → KalyptPoint, .pdf → KalyptPDF…).
- **Paquets Linux** : `kalyptik-office` (installé dans `/opt/kalyptik/office`).
- **Windows** : installé dans `Program Files\Kalyptik\DesktopEditors`.

- **Site web** : https://kalyptik.com (fenêtre « À propos », liens de l'installeur Windows).

## Volontairement inchangé

- Les mentions de copyright d'Ascensio System SIA (auteurs du code, obligation AGPL),
  y compris dans les métadonnées des paquets Linux.
- Le nom de l'exécutable `DesktopEditors`, l'identifiant d'association `ASC.Editors`
  et le protocole `oo-office://` (connecteurs cloud).

## Régénérer

```sh
pip install cairosvg pillow
python3 kalyptik/theme/icons/build_icons.py
python3 kalyptik/brand/build_brand.py
```
