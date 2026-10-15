# Module « Examen 2027 » (KalyptWrite)

Panneau du traitement de texte (onglet **Modules complémentaires → Examen 2027**)
pour rédiger les sujets d'examens selon les *Règles typographiques à respecter
pour les énoncés des sujets d'examens en mathématiques*.

## Fonctions

| Section | Rôle |
|---|---|
| Mise en forme 2027 | Arial 12, texte aligné à gauche (plus de justifié), interligne 1,15 ; sur tout le document (styles par défaut et « Normal » compris) ou sur la sélection. Les titres gardent leur taille, les équations ne sont pas touchées. |
| Vérification du sujet | Analyse le document et liste les écarts : ponctuation et espaces insécables (fine avant `; ! ?`, insécable avant `:`), virgule décimale, parenthèses, guillemets « », ordinaux (1re, 2e, n-ième), unités (min, h, €, 3,55 €), séparateur des milliers, signe ×, opérateurs employés comme verbes, locutions latines en italique, souligné → gras, police, taille, interligne, justification. Les écarts cochés sont corrigés d'un clic, et le lien « Voir dans le document » sélectionne l'occurrence. |
| Compétences évaluées | Liste propre au sujet (code + intitulé). Un bouton ajoute les 6 compétences de mathématiques (Chercher, Modéliser, Représenter, Raisonner, Calculer, Communiquer). |
| Question à l'emplacement du curseur | Associe des compétences au paragraphe de la question. Le repère (« 1 a) ») est deviné puis modifiable. Un discret « [CH, RA] » est ajouté en fin de question : c'est un contrôle de contenu, qu'on peut masquer. |
| Grille d'évaluation | Insère (ou remplace) en fin de document un tableau « Compétence / Questions / niveaux de maîtrise » construit à partir des questions associées. |

Les compétences sont enregistrées dans le fichier lui-même (propriété
personnalisée `KalyptikExamen2027`). Les repères des questions sont des
contrôles de contenu étiquetés `kx27q:…`, et la grille est étiquetée `kx27grid`.
Le sujet reste un .docx ordinaire, lisible dans Word.

## Fichiers

- `config.json` : déclaration du module (GUID, panneau de droite, événements).
- `index.html`, `resources/` : interface et icônes (thèmes clair et sombre).
- `scripts/rules.js` : règles typographiques (fonctions pures).
- `scripts/commands.js` : commandes exécutées dans le document (API des éditeurs).
- `scripts/plugin.js` : logique du panneau.
- `tests/rules.test.js` : tests des règles (`node tests/rules.test.js`).

## Intégration au build

`apply-kalyptik.sh` (étape 9) copie chaque module dans
`build/kalyptik-plugins/<GUID>/`, avec le kit `v1/` partagé. Le Dockerfile
`desktop-common` les dépose dans `editors/sdkjs-plugins/`, où l'application
charge ses extensions système.
