# Mises à jour de Kalyptik Office

## Pour les utilisateurs

Au démarrage (puis toutes les 12 h), l'écran d'accueil compare la version
installée à la dernière version publiée dans l'onglet **Releases** du dépôt.
Si elle est plus récente, une carte « Nouvelle version disponible » propose :

- **Télécharger** : le bon paquet (installeur `.exe` sous Windows, `.deb` ou
  `.rpm` sous Linux). L'installeur Windows met à jour l'installation existante ;
- **Nouveautés** : la page de la version ;
- **Plus tard** : masque cette version (la suivante sera de nouveau proposée).

Code : `kalyptik-update.js`, copié dans l'écran d'accueil au build
(`kalyptik/scripts/apply-kalyptik.sh`, étape 6).

## Publier une version

1. Nouveautés d'Euro-Office : fusionner la PR `sync/euro-office` ouverte chaque
   semaine par le workflow *Kalyptik - Sync upstream*.
2. Onglet **Actions → Kalyptik - Build → Run workflow**, cocher Windows et/ou
   Linux **et « Publier la version »**.
3. En fin de build, la version `v9.3.1.<n>` est créée avec les paquets ; les
   utilisateurs sont prévenus à leur prochain démarrage.

Le numéro `<n>` est le numéro d'exécution du workflow : il augmente à chaque
build, c'est lui qui permet de savoir qu'une version est plus récente.

## Pourquoi pas une installation silencieuse ?

Euro-Office contient un service de mise à jour en arrière-plan (`updatesvc`,
`desktop-apps/win-linux/extras/update-daemon`) mais il est désactivé dans ses
sources et ne se compile qu'avec l'ancien système qmake. La notification
ci-dessus n'en dépend pas et suit les mises à jour d'Euro-Office sans effort.
