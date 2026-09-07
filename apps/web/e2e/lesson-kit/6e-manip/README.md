# Suites e2e — manipulations de 6e

Écrites pendant la refonte « deep WOW » du 2026-09-07. Chacune verrouille un
CONTRAT d'interaction, pas une apparence : le geste doit changer l'état
mathématique affiché, sans clic de validation intermédiaire.

Elles supposent un serveur vite sur `http://localhost:5250` :

```bash
cd apps/web && npx vite --port 5250 --strictPort
node apps/web/e2e/lesson-kit/6e-manip/<suite>.mjs
```

## Ce que chaque suite verrouille

| Suite | Contrat |
| --- | --- |
| `sorter.mjs` | trieur utile/inutile : glisser réel + fantôme, ET le chemin clic/clavier |
| `sorter3e.mjs` | non-régression 3e — `InfoSorter` est partagé avec `modelisation-3e` et `resolution-problemes-3e` |
| `dnd.mjs` | partage des billes : glisser-déposer, clic conservé |
| `entdrag.mjs` | plateau de numération : glisser une pièce dans sa colonne |
| `digitcards-hand.mjs` | cartes-chiffres : une case est source ET zone (échange) |
| `fractions-association.mjs` | figure → nom : un appariement est un déplacement |
| `fractions-twogrip.mjs` | deux prises indépendantes, invariant visible pendant le geste |
| `aires-recompose.mjs` | conservation de l'aire : la pièce se déplace sans changer |
| `arrowreader.mjs` | lecture ×k du tableau — et JAMAIS de quotient à l'écran |
| `crossfinder.mjs` | croisement ligne × colonne, sans aucune proportionnalité |
| `split.mjs` | distributivité : la somme des deux morceaux ne dépend pas de la coupe |
| `rp2.mjs` | les DEUX prises sont sur la figure, pas dans une barre sous elle |
| `focus.mjs`, `focus6e.mjs` | pas de contour noir du navigateur, mais un anneau visible |
| `sweep6e.mjs` | §17bis — balayage de toute la course, aucun débordement |

## Règles vérifiées partout

- le geste change l'état **immédiatement** (pas de « Valider » entre les deux) ;
- une manipulation ne se **fige jamais** après validation de l'étape ;
- le chemin **clavier / lecteur d'écran** existe toujours (prendre → poser) ;
- **375 px** sans défilement horizontal, zones tactiles **≥ 44 px** ;
- aucun mot enseigné plus tard n'est visible avant sa brique.

## Piège du harnais

`page.mouse` travaille en coordonnées de **fenêtre** : une poignée sous la ligne
de flottaison ne reçoit rien et le glissement « réussit » sans rien déplacer.
Utiliser `dragBy` / `dragOnto` de `../_2nde-helpers.mjs`, qui font défiler avant
de lire la boîte englobante.
