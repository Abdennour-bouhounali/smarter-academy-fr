# Knowledge Map — refonte pédagogique des leçons de 6e

> Refonte des **24 leçons de 6e** (2026-09-07) : intégration de la carte des
> connaissances cumulative et application de la loi « connaissances avant la
> demande » (`KNOWLEDGE_DEPENDENCY.md`). Ce document ne décrit que ce qui a été
> réellement implémenté et vérifié.

Référence d'architecture : `KNOWLEDGE_MAP.md`.
Implémentation de référence pour la 6e : **`fractions`** (`nombres_calculs/fractions`).
Implémentation partagée réutilisée telle quelle : `apps/web/src/lessons/common/knowledge/`.

---

## Pourquoi cette refonte

Avant ce chantier, **aucune** des 24 leçons de 6e n'avait de `knowledge.jsx`, de
`KnowledgeBrick`, de `requires` ni de `priorKnowledge`. Les connaissances y étaient
distribuées dans les positions que l'élève lit **trop tard** : `explain`,
`feedback` d'après-réponse, bandeaux « À retenir » de fin de module, `ConceptCard`
enfouies dans des composants auxiliaires. La conséquence n'est pas cosmétique :
un élève pouvait devoir choisir entre « aire » et « périmètre » (leçon `aires`,
module 1) alors qu'aucun des deux mots n'avait été introduit, ou manipuler des
boutons étiquetés « Numérateur » / « Dénominateur » (leçon `nombres-decimaux`,
module 3) avant que ces mots existent.

Le rapport d'audit rangeait alors la 6e « hors périmètre — relevé, non réparé ».
Elle est désormais dans le périmètre courant, au même titre que la 3e et la 2nde.

---

## Résultat

| Mesure | Avant | Après |
| --- | --- | --- |
| Leçons avec carte des connaissances | 0 / 24 | **24 / 24** |
| `KnowledgeBrick` posées | 0 | **308** |
| Questions sous contrat (`requires`) | 0 / 662 | **668 / 668** |
| Violations de contrat (`contract E`) | 0 | **0** |
| Signalements du lexique (C/H/M/L) | 1 / 19 / 5 / 0 | **0 / 0 / 0 / 0** |
| Erreurs `validate:lessons` (dépôt entier) | 6 | **0** |
| Avertissements `validate:lessons` | 29 | **0** |
| Blocages `audit:knowledge:gate` (dépôt entier) | 30 | **5** (tous en 2nde, préexistants) |

> La colonne « Avant » du lexique est mesurée avec le lexique **de l'époque**,
> qui ignorait 21 termes de 6e (« numérateur », « dénominateur », « boucle »,
> « patron »…). Le nombre réel de défauts détectables était donc plus élevé : le
> détecteur ne pouvait pas voir ce qu'il ne connaissait pas. La colonne
> « Après » est mesurée avec le lexique enrichi — c'est-à-dire contre un
> détecteur strictement plus sévère.

## Statut par leçon

| Leçon | Carte | Bricks | requires | Contrat | C | H | M | L |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `6e:algorithmique-programmation` | ✅ | 12 | 21/21 | 0 | 0 | 0 | 0 | 0 |
| `6e:graphiques` | ✅ | 14 | 31/31 | 0 | 0 | 0 | 0 | 0 |
| `6e:proportionnalite` | ✅ | 12 | 31/31 | 0 | 0 | 0 | 0 | 0 |
| `6e:tableaux` | ✅ | 11 | 34/34 | 0 | 0 | 0 | 0 | 0 |
| `6e:constructions-geometriques` | ✅ | 12 | 28/28 | 0 | 0 | 0 | 0 | 0 |
| `6e:droites-segments` | ✅ | 15 | 26/26 | 0 | 0 | 0 | 0 | 0 |
| `6e:figures-planes` | ✅ | 17 | 27/27 | 0 | 0 | 0 | 0 | 0 |
| `6e:parallelisme-perpendicularite` | ✅ | 12 | 29/29 | 0 | 0 | 0 | 0 | 0 |
| `6e:reperage-plan` | ✅ | 14 | 27/27 | 0 | 0 | 0 | 0 | 0 |
| `6e:solides-patrons` | ✅ | 13 | 26/26 | 0 | 0 | 0 | 0 | 0 |
| `6e:symetrie` | ✅ | 9 | 26/26 | 0 | 0 | 0 | 0 | 0 |
| `6e:aires` | ✅ | 10 | 32/32 | 0 | 0 | 0 | 0 | 0 |
| `6e:angles` | ✅ | 11 | 27/27 | 0 | 0 | 0 | 0 | 0 |
| `6e:contenances` | ✅ | 11 | 23/23 | 0 | 0 | 0 | 0 | 0 |
| `6e:durees` | ✅ | 10 | 35/35 | 0 | 0 | 0 | 0 | 0 |
| `6e:longueurs` | ✅ | 12 | 26/26 | 0 | 0 | 0 | 0 | 0 |
| `6e:masses` | ✅ | 11 | 25/25 | 0 | 0 | 0 | 0 | 0 |
| `6e:perimetres` | ✅ | 10 | 33/33 | 0 | 0 | 0 | 0 | 0 |
| `6e:fractions` | ✅ | 14 | 23/23 | 0 | 0 | 0 | 0 | 0 |
| `6e:nombres-decimaux` | ✅ | 15 | 29/29 | 0 | 0 | 0 | 0 | 0 |
| `6e:nombres-entiers` | ✅ | 19 | 33/33 | 0 | 0 | 0 | 0 | 0 |
| `6e:ordre-grandeur-estimation` | ✅ | 13 | 28/28 | 0 | 0 | 0 | 0 | 0 |
| `6e:quatre-operations` | ✅ | 17 | 22/22 | 0 | 0 | 0 | 0 | 0 |
| `6e:resolution-problemes` | ✅ | 14 | 26/26 | 0 | 0 | 0 | 0 | 0 |

---

## Ce que la refonte a changé, au-delà du câblage

La loi ne se satisfait pas d'ajouter des briques : il a fallu **déplacer** les
connaissances vers le point de besoin, et **réécrire** les demandes qui
employaient un mot avant son enseignement. Les motifs récurrents :

1. **Mot employé dans la manipulation elle-même.** Les boutons de l'explorateur
   disaient « Voir le NUMÉRATEUR » avant que le mot n'existe (`fractions` M3,
   `nombres-decimaux` M3). Reformulés en langage courant — « Voir le nombre du
   HAUT » — le mot savant arrivant ensuite par la brique, sur ce que l'élève
   vient de voir.

2. **Titre d'étape verrouillé.** `StepCard` affiche le titre **avant** que
   l'étape ne s'ouvre : un titre qui nomme la notion l'enseigne donc hors de
   tout contexte, ou vend la mèche. Une quinzaine de titres neutralisés
   (« Range dans l'ordre croissant » → « Du plus petit au plus grand »,
   « Arrondis à la dizaine » → « Le voisin rond le plus proche »).

3. **Règle qui n'existe qu'après la réponse.** Des dizaines de règles ne
   vivaient que dans un `explain`, un `explainFor` ou un `Feedback` de fin
   d'étape. Elles sont désormais posées **avant** la question qu'elles servent.

4. **Diagnostic qui enseigne.** Le module 0 de `masses` mesurait la balance à
   deux plateaux — précisément ce que son module 1 enseigne. Un diagnostic
   mesure des prérequis, il n'anticipe pas la leçon.

5. **Test final qui introduit du neuf.** « puissance de 10 » (`fractions`),
   « quotient » (`quatre-operations`), « pente » (`parallelisme-perpendicularite`),
   « arrondi » (`constructions-geometriques`) apparaissaient pour la première
   fois dans une option ou un `explain` du boss.

6. **Synthèse recopiée à la main.** Chaque boss se terminait par une fiche qui
   réécrivait toute la leçon — une deuxième source de vérité. Remplacée partout
   par `<KnowledgeSnapshot complete variant="complete" />`.

Une réparation structurelle : la leçon `contenances` sautait l'étape
`practice_lab` et laissait son objectif P6 (« relier 1 L à 1 dm³ ») non enseigné.
Un vrai module a été construit — `Module06AtelierDuBar.jsx` — où l'élève verse
une bouteille de 1 L décilitre par décilitre dans un cube de 1 dm d'arête. La
relation se **constate** avant d'être énoncée.

---

## Pièges d'implémentation (à connaître avant d'en migrer d'autres)

**Une brique doit vivre dans le littéral `steps`.** `scripts/lib/exposureStream.mjs`
construit le flux d'exposition en parcourant le tableau `steps={[…]}` de la racine
`ContentModule`. Une `<KnowledgeBrick>` rendue dans un composant auxiliaire, ou
dans le callback d'un `steps={DATA.map(…)}`, est **invisible** : l'audit affiche
`bricks 0` et tout `requires` qui en dépend échoue. Il a fallu littéraliser les
étapes de plusieurs modules (`figures-planes` M3/M4, `symetrie` M4,
`quatre-operations` M7/M8, `resolution-problemes` M10, `reperage-plan` M4/M5).

**Le lexique ne voyait pas la 6e.** `scripts/audit/lexicon.json` ne contenait
aucune entrée pour « numérateur », « dénominateur », « boucle », « patron »,
« coefficient de proportionnalité »… 21 termes de niveau 6e y ont été ajoutés,
ce qui a fait apparaître de vrais défauts jusque-là invisibles. Les motifs sont
en mode `u` : `\'` y est un échappement invalide (utiliser `[’']`).

**Réaligner le catalogue.** Le validateur compare la somme des `estimatedMin` de
`lesson.config.js` avec `durationMinutes` de `packages/core/curriculum/coursesData.js`.
Quatre leçons dépassaient le plafond de 90 min ; leurs durées ont été
recalibrées sur le **nombre réel d'étapes** (~2,5 min/étape + 2 min d'entrée),
sans supprimer de contenu, et le catalogue réaligné.

**Les unités de temps ne suivent pas l'escalier ×10.** `UnitLadder`
(`common/knowledge6e`) convient aux longueurs, masses et contenances ; la leçon
`durees` utilise un escalier local à marches inégales (×24, ×60, ×60). Réutiliser
l'escalier générique y aurait installé l'erreur exacte que la leçon combat.

---

## Nouveau : les visuels de carte propres à la 6e

`apps/web/src/lessons/common/knowledge6e/` — les visuels de
`common/knowledge/knowledgeVisuals.jsx` servent le lycée (repère, graphe,
triangle rectangle) et ne disaient rien du monde de la 6e. Sept figures SVG
autonomes ont été ajoutées, mêmes règles que leurs aînées (pas de KaTeX, rendu
identique à l'écran et à l'impression) :

`PartsBar` · `PartsCircle` · `MiniNumberLine` · `UnitLadder` · `PlaceValue` ·
`MiniFigure` · `MiniGrid`

---

## Validation

```bash
npm run validate:lessons      # Validation passed — 0 erreur, 0 avertissement
npm run check:katex           # aucun antislash avalé
npm run build                 # OK
node apps/web/e2e/lesson-kit/6e-fractions-carte.mjs   # 47/47
```

`npm test` : 1300/1301. L'unique échec,
`positions-relatives-droites-2nde/components/labelLayout.test.js`, est
**antérieur** à ce chantier (vérifié en remisant les modifications : il échoue
à l'identique sur `HEAD`) et concerne une leçon de 2nde non touchée ici.

`npm run audit:knowledge:gate` signale encore 5 blocages, **tous en 2nde et tous
préexistants** (`fonctions-de-reference-2nde`, `signe-fonctions-2nde`,
`variations-extremums-2nde`, `colinearite-alignement-2nde`,
`probabilites-conditionnelles-2nde`). Le compte est passé de 30 à 5 : aucune
leçon de 6e n'en produit.

`apps/web/e2e/lesson-kit/6e-fractions-carte.mjs` est la première suite « carte »
de 6e. Elle verrouille le même contrat DOM que celles de 2nde : carte vide au
départ, rien ne se débloque à la simple ouverture d'un module, cumul exact
module par module, **aucune fuite d'une connaissance d'un module ultérieur**,
vue d'impression, et 375 px sans débordement.
