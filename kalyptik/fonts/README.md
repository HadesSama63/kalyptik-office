# Polices de Kalyptik Office

## Polices incluses (`bundled/`)

Installées avec l'application (dossier `fonts/`), elles apparaissent dans la
liste des polices pour tout nouveau document :

| Police | Usage | Licence |
|---|---|---|
| OpenDyslexic | lecture facilitée (dyslexie) | SIL OFL 1.1 |
| Andika | apprentissage de la lecture (lettres non ambiguës) | SIL OFL 1.1 |
| Lexend | lisibilité, fluidité de lecture | SIL OFL 1.1 |
| Atkinson Hyperlegible | malvoyance, caractères bien distincts | SIL OFL 1.1 |
| Comic Neue | équivalent libre de Comic Sans MS | SIL OFL 1.1 |

Sources : dépôt Google Fonts (`github.com/google/fonts`), `googlefonts/lexend`,
`antijingoist/opendyslexic`. Chaque licence est installée à côté des polices
(`LICENCE-<police>.txt`).

## Polices manquantes à l'ouverture (`kalyptik-fonts.js`)

À l'ouverture d'un document dans KalyptWrite, les polices du texte absentes
de l'ordinateur sont signalées dans une carte :

- **polices libres** du catalogue (`FREE`) : bouton « Télécharger et installer »,
  dans `<données utilisateur>/kalyptik-fonts` (dossier créé par l'application,
  correctif `patches/desktop-apps/0007`) ; prises en compte au redémarrage ;
- **polices scolaires** (`SCHOOL` : Belle Allure, Écolier, Cursive standard…) :
  gratuites mais non redistribuables, lien de recherche vers leur site ;
- **polices Microsoft** (`MICROSOFT`) : équivalent libre conseillé ;
- **autres** : signalées comme peut-être payantes.

Pour ajouter une police au catalogue, compléter les tables en tête de
`kalyptik-fonts.js` (police libre : fichiers `.ttf` statiques, pas de police
variable).
