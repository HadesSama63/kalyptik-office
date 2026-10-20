[![Licence](https://img.shields.io/badge/Licence-GNU%20AGPL%20V3-green.svg?style=flat)](https://www.gnu.org/licenses/agpl-3.0.fr.html)
![Plateformes Windows | macOS | Linux](https://img.shields.io/badge/Plateformes-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg?style=flat)

## Bienvenue dans le dépôt de Kalyptik Office !

**Kalyptik Office** est une suite bureautique libre et gratuite qui réunit un traitement de texte, un tableur, un logiciel de présentation, des éditeurs de PDF et de formulaires, ainsi qu'une visionneuse de diagrammes. Elle permet de créer, consulter et modifier des documents enregistrés sur votre ordinateur Windows ou Linux, sans connexion à Internet. Elle est entièrement compatible avec les formats Office Open XML : .docx, .xlsx, .pptx.

Kalyptik Office est une version d'[Euro-Office Desktop Editors](https://github.com/Euro-Office/DesktopEditors) pensée pour les enseignants : interface en français, thème clair par défaut, outils pour les sujets d'examens et polices adaptées à l'école. Site : [kalyptik.com](https://kalyptik.com).

## Des fonctionnalités que vous allez adorer ✨

Profitez des éditeurs complets inclus dans Kalyptik Office :

* **KalyptWrite** : traitement de texte
* **KalyptCalc** : tableur
* **KalyptPoint** : présentations
* **KalyptForm** : création de formulaires
* **KalyptPDF** : éditeur de PDF
* **KalyptDraw** : visionneuse de diagrammes

La suite permet de créer, modifier, enregistrer et exporter des documents texte, des feuilles de calcul, des présentations et des PDF, de remplir des formulaires PDF et d'ouvrir des diagrammes. Elle propose aussi des fonctions avancées :

* Connexion au cloud (Moodle, Nextcloud, ownCloud, Seafile, Liferay, kDrive) pour la collaboration en temps réel ☁️
* Assistants d'intelligence artificielle 🤖
* Signatures numériques ✍️🔏
* Protection par mot de passe 🔒🔑
* Interface ajustable (dont un mode sombre 🌓)

## Les ajouts de Kalyptik Office 🎓

* **Module Examen 2027** dans KalyptWrite : mise en forme des sujets (Arial 12, aligné à gauche, interligne 1,15), vérification et correction des règles typographiques des énoncés d'examens, compétences évaluées associées à chaque question (listes prêtes pour le Bac pro / CAP et pour les voies générale et technologique, une couleur par compétence) et grille d'évaluation des compétences en fin de document.
* **Polices pour l'école et pour les élèves dyslexiques**, incluses et prêtes à l'emploi : OpenDyslexic, Andika, Lexend, Atkinson Hyperlegible, Comic Neue.
* **Vérification des polices à l'ouverture** : les polices libres manquantes peuvent être téléchargées en un clic, et un équivalent libre est proposé pour les polices payantes.
* **Graphiques** : boîtes à moustaches, équation et coefficient R² des courbes de tendance.
* **Mises à jour intégrées** : l'application signale les nouvelles versions et, sous Windows, les installe après confirmation.
* Interface en **français par défaut**, thèmes Kalyptik clair et sombre.

## Langues 🌐

La traduction des éditeurs s'améliore en permanence pour rendre la suite accessible à tous, partout dans le monde.

* Interface disponible en 46 langues
* Prise en charge de l'écriture de droite à gauche
* Prise en charge des idéogrammes 🈴

## Modules complémentaires 🧩

Les éditeurs acceptent des modules complémentaires (plugins), qui permettent aux développeurs d'ajouter des fonctions qui ne relèvent pas directement du format OOXML. Les modules propres à Kalyptik Office se trouvent dans [`kalyptik/modules/`](../kalyptik/modules/).

## Composants 📦

Kalyptik Office s'appuie sur les composants d'Euro-Office :

* [desktop-apps](https://github.com/Euro-Office/desktop-apps) : l'application de bureau, qui construit l'interface du programme pour chaque système d'exploitation.
* [desktop-sdk](https://github.com/Euro-Office/desktop-sdk) : le kit de développement au cœur de l'application de bureau.
* [core](https://github.com/Euro-Office/core) : les composants serveur de [Document Server][1], utilisés pour convertir entre les formats bureautiques les plus courants (DOC, DOCX, ODT, RTF, TXT, PDF, HTML, EPUB, XPS, DjVu, XLS, XLSX, ODS, CSV, PPT, PPTX, ODP).
* [sdkjs](https://github.com/Euro-Office/sdkjs) : le kit de développement JavaScript de [Document Server][1], qui contient l'API des interactions côté client de tous les composants.
* [web-apps](https://github.com/Euro-Office/web-apps) : l'interface de [Document Server][1], qui permet de créer, modifier, enregistrer et exporter des documents texte, des feuilles de calcul et des présentations dans une interface commune.
* [dictionaries](https://github.com/Euro-Office/dictionaries) : les dictionnaires des différentes langues, utilisés pour la correction orthographique.

Les personnalisations de Kalyptik Office sont regroupées dans le dossier [`kalyptik/`](../kalyptik/) et appliquées par-dessus le code d'Euro-Office au moment de la compilation : la suite reste ainsi facile à mettre à jour avec les nouvelles versions d'Euro-Office.

## Installation 💾

Téléchargez la dernière version sur [kalyptik.com](https://kalyptik.com) ou sur la page des [versions publiées](https://github.com/HadesSama63/kalyptik-office/releases) :

* **Windows** : l'installeur `Kalyptik-Office-<version>-x64.exe`
* **macOS** (Mac avec puce Apple) : l'image `Kalyptik-Office-<version>-macos-arm64.dmg`, signée et notarisée par Apple
* **Linux** : le paquet `.deb` (Debian, Ubuntu) ou `.rpm` (Fedora, openSUSE)

Une fois installé, Kalyptik Office vous prévient lui-même à chaque nouvelle version.

## Compiler vous-même 🛠️

Kalyptik Office se compile depuis les sources sous **Windows**, **Linux** et **macOS** (voir [kalyptik/macos/](../kalyptik/macos/README.md)). C'est un super-dépôt : la première étape consiste toujours à récupérer les sous-modules, puis à appliquer les personnalisations Kalyptik :

```sh
git clone https://github.com/HadesSama63/kalyptik-office.git
cd kalyptik-office
git submodule update --init --recursive
./kalyptik/scripts/apply-kalyptik.sh
```

Consultez ensuite la documentation :

* **[kalyptik/](../kalyptik/README.md)** : à lire en premier pour Kalyptik Office (personnalisations, synchronisation avec Euro-Office, compilation et publication avec GitHub Actions).
* **[build/](../build/README.md)** : le fonctionnement général de la compilation d'Euro-Office (définition CMake commune, éditeurs web, vcpkg, cache), en anglais.
* **[build/windows/](../build/windows/README.md)** : la compilation sous Windows (`build.ps1`, MSVC + CMake), en anglais.
* **[build/linux/](../build/linux/README.md)** : la compilation sous Linux (Docker / `docker buildx bake`), en anglais.

## Participer 🤝

Les contributions sont les bienvenues, qu'il s'agisse d'un signalement de bogue, d'une idée de fonctionnalité, d'une traduction ou d'une pull request :

* **Un bogue ou une idée ?** Ouvrez un [ticket](https://github.com/HadesSama63/kalyptik-office/issues) en décrivant ce que vous avez constaté ou ce que vous aimeriez voir.
* **Envie de contribuer du code ?** Faites un fork du dépôt, apportez votre modification dans `kalyptik/`, puis ouvrez une pull request.
* **Un problème qui concerne aussi Euro-Office ?** Signalez-le directement à [Euro-Office](https://github.com/Euro-Office/DesktopEditors/issues) : la correction profitera aux deux suites.

Merci de garder vos contributions compatibles avec la licence AGPL v3 du projet.

## Licence 📄

Kalyptik Office, comme Euro-Office Desktop Editors dont il est issu, est distribué sous licence GNU Affero General Public License, version 3.0, gage de transparence et d'engagement envers la communauté du logiciel libre.

  [1]: https://github.com/Euro-Office/DocumentServer
