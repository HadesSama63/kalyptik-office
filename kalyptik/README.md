# Kalyptik Office

Version personnalisée de [Euro-Office DesktopEditors](https://github.com/Euro-Office/DesktopEditors)
(suite bureautique Windows / Linux / macOS, licence AGPL v3).

## Principe : rester synchronisé avec Euro-Office

Ce dépôt contient **tout l'historique d'Euro-Office**. Pour pouvoir intégrer
facilement les futures versions, on respecte une règle simple :

> **On ne modifie pas les fichiers d'Euro-Office.** Toutes les personnalisations
> vivent dans le dossier `kalyptik/` et sont appliquées par-dessus au moment du build.

| Dossier                | Contenu                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `kalyptik/theme/`      | aspect visuel : logos, icônes, couleurs, thèmes, textes    |
| `kalyptik/modules/`    | modules ajoutés (plugins des éditeurs)                     |
| `kalyptik/scripts/`    | outils (synchronisation avec Euro-Office, application du thème) |
| `kalyptik/patches/`    | correctifs minimes du code d'Euro-Office, appliqués au build |
| `kalyptik/brand/`      | nom Kalyptik Office, logos, icônes, écran d'accueil, installeurs |

Les fichiers d'Euro-Office ne sont pas modifiés ; on ajoute des fichiers
*nouveaux* (`kalyptik/`, `.github/workflows/kalyptik-*.yml`), donc les mises à
jour ne génèrent pas de conflit. Exceptions : les correctifs de `kalyptik/patches/` (appliqués au build,
jamais commités dans les sous-modules) et une ligne
`if: github.repository_owner == 'Euro-Office'` dans `build.yml` et `winget.yml`
pour que ces workflows d'Euro-Office (qui ont besoin de leurs secrets, ou qui
publieraient sur winget sous leur nom) ne tournent pas chez nous.

## Récupérer les mises à jour d'Euro-Office

### Automatiquement
Le workflow GitHub Actions `.github/workflows/kalyptik-sync-upstream.yml`
vérifie chaque lundi s'il y a du nouveau chez Euro-Office et ouvre une
Pull Request `Sync Euro-Office` à relire puis fusionner.
Il peut aussi être lancé à la main (onglet *Actions* → *Run workflow*).

> Dans les réglages du dépôt GitHub : *Settings → Actions → General →
> Workflow permissions* → cocher « Read and write permissions » et
> « Allow GitHub Actions to create and approve pull requests ».

### Manuellement
```sh
./kalyptik/scripts/sync-upstream.sh
git push
```

## Compiler Kalyptik Office

Onglet **Actions → Kalyptik - Build → Run workflow** (Linux x64 coché par
défaut, Windows x64 en option). Les paquets (.deb, .rpm, installeur .exe)
sont téléchargeables en bas de la page de l'exécution, rubrique *Artifacts*.
La première compilation dure plusieurs heures ; les suivantes utilisent le cache.
Sous Windows, les dépendances C++ (V8, CEF, Qt, ICU…) sont gardées en cache
(`third_party/install`) et recompilées seulement si Euro-Office modifie leurs
scripts (`core/Common/3dParty`).

En local, avant de lancer le build d'Euro-Office (`build/`) :

```sh
git submodule update --init --recursive
./kalyptik/scripts/apply-kalyptik.sh
COMPANY_NAME=Kalyptik PRODUCT_NAME=Office docker buildx bake ...   # voir build/linux/README.md
```

## Architecture d'Euro-Office (à connaître)

C'est un *super-dépôt* : le code réel est dans des sous-modules.
Ceux qui nous concernent :

- `web-apps` — l'interface des éditeurs (barres d'outils, couleurs, thèmes)
- `desktop-apps` — l'application bureau (fenêtre principale, écran d'accueil, icônes, installeurs)
- `sdkjs` — le moteur JavaScript (API utilisée par les plugins/modules)

```sh
git submodule update --init --recursive   # récupère les sous-modules
```

Euro-Office prévoit déjà un mécanisme de « brand » dans son build
(cf. `nextcloud-office-brand` dans `.github/workflows/build.yml`) :
c'est ce mécanisme que Kalyptik utilisera pour l'habillage.

## Plateformes

- **Windows** et **Linux** : build documenté par Euro-Office (`build/`).
- **macOS** : pas encore documenté par Euro-Office — travail spécifique à prévoir.

## Licence

AGPL v3, comme Euro-Office. Toute distribution de Kalyptik Office doit
publier son code source (y compris les modifications de ce dossier).
