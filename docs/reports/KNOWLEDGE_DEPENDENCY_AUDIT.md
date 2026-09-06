# Audit des dépendances de connaissances

> Généré par `npm run audit:knowledge` (lexique v1). Ne pas éditer à la main.
>
> La loi : **avant toute demande, tout ce qui est nécessaire pour la comprendre doit déjà être
> disponible pour l'élève** (docs/architecture/KNOWLEDGE_DEPENDENCY.md). Les positions
> `explain`, `explainWrong`, `correction`, `feedback` et `footer` renforcent une notion ;
> elles ne l'établissent jamais.
>
> Le lexique est un **détecteur**, pas le juge : il signale les candidats à l'audit manuel.

## Périmètre courant — 6e, 3e et 2nde

74 leçon(s) · critiques 11 · hautes 12 · moyennes 8 · basses 2

| Leçon | Carte | Bricks | requires | Contrat | C | H | M | L |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `3e:fonctions-3e` | ✅ | 17 | 41/41 | 0 | 0 | 0 | 0 | 0 |
| `3e:fonctions-affines-3e` | ✅ | 15 | 35/35 | 0 | 0 | 0 | 0 | 0 |
| `3e:fonctions-lineaires-3e` | ✅ | 14 | 38/38 | 0 | 0 | 0 | 0 | 0 |
| `3e:lecture-graphique-3e` | ✅ | 14 | 35/35 | 0 | 0 | 0 | 0 | 0 |
| `3e:modelisation-3e` | ✅ | 19 | 44/44 | 0 | 0 | 0 | 0 | 0 |
| `3e:probabilites-3e` | ✅ | 23 | 41/41 | 0 | 0 | 0 | 0 | 0 |
| `3e:proportionnalite-3e` | ✅ | 8 | 47/47 | 0 | 0 | 0 | 0 | 0 |
| `3e:representation-graphique-3e` | ✅ | 15 | 36/36 | 0 | 0 | 0 | 0 | 0 |
| `3e:statistiques-3e` | ✅ | 20 | 42/42 | 0 | 0 | 0 | 0 | 0 |
| `3e:pythagore-3e` | ✅ | 10 | 30/30 | 0 | 0 | 0 | 0 | 0 |
| `3e:reperage-droite-plan-3e` | ✅ | 16 | 28/28 | 0 | 0 | 0 | 0 | 0 |
| `3e:representation-espace-3e` | ✅ | 14 | 26/26 | 0 | 0 | 0 | 0 | 0 |
| `3e:thales-3e` | ✅ | 11 | 29/29 | 0 | 0 | 0 | 0 | 0 |
| `3e:translations-vecteurs-3e` | ✅ | 17 | 29/29 | 0 | 0 | 0 | 0 | 0 |
| `3e:triangles-3e` | ✅ | 10 | 27/27 | 0 | 0 | 0 | 0 | 0 |
| `3e:trigonometrie-triangle-rectangle-3e` | ✅ | 12 | 31/31 | 0 | 0 | 0 | 0 | 0 |
| `3e:calcul-litteral-algebrique` | ✅ | 21 | 30/30 | 0 | 0 | 0 | 0 | 0 |
| `3e:equations-produit` | ✅ | 13 | 26/26 | 0 | 0 | 0 | 0 | 0 |
| `3e:multiples-diviseurs` | ✅ | 9 | 31/31 | 0 | 0 | 0 | 0 | 0 |
| `3e:nombres-rationnels` | ✅ | 17 | 36/36 | 0 | 0 | 0 | 0 | 0 |
| `3e:puissances-3e` | ✅ | 13 | 28/28 | 0 | 0 | 0 | 0 | 0 |
| `3e:racines-carrees-3e` | ✅ | 14 | 32/32 | 0 | 0 | 0 | 0 | 0 |
| `3e:resolution-problemes-3e` | ✅ | 10 | 30/30 | 0 | 0 | 0 | 0 | 0 |
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
| `seconde:fonction-affine-2nde` | ✅ | 0 | 0/32 | 0 | 0 | 0 | 0 | 0 |
| `seconde:fonctions-2nde` | ✅ | 23 | 33/43 | 0 | 0 | 0 | 0 | 0 |
| `seconde:fonctions-de-reference-2nde` | ✅ | 0 | 0/27 | 0 | 2 | 0 | 0 | 0 |
| `seconde:signe-fonctions-2nde` | ✅ | 0 | 0/31 | 0 | 0 | 2 | 0 | 0 |
| `seconde:variations-extremums-2nde` | ✅ | 0 | 0/32 | 0 | 1 | 2 | 0 | 0 |
| `seconde:colinearite-alignement-2nde` | ✅ | 0 | 0/30 | 0 | 0 | 1 | 0 | 0 |
| `seconde:equations-de-droites-2nde` | ✅ | 4 | 6/34 | 5 | 6 | 0 | 4 | 0 |
| `seconde:positions-relatives-droites-2nde` | ✅ | 0 | 0/29 | 0 | 0 | 0 | 1 | 0 |
| `seconde:vecteurs-2nde` | ✅ | 0 | 0/32 | 0 | 0 | 0 | 1 | 0 |
| `seconde:arithmetique-2nde` | ✅ | 0 | 0/35 | 0 | 0 | 0 | 0 | 0 |
| `seconde:calcul-litteral-2nde` | ✅ | 0 | 0/30 | 0 | 1 | 0 | 0 | 0 |
| `seconde:ensembles-et-intervalles-2nde` | ✅ | 0 | 0/29 | 0 | 0 | 0 | 1 | 0 |
| `seconde:equations-et-inequations-2nde` | ✅ | 21 | 35/35 | 0 | 0 | 0 | 0 | 0 |
| `seconde:logique-et-raisonnement-2nde` | ✅ | 0 | 0/32 | 0 | 0 | 1 | 0 | 1 |
| `seconde:nombres-reels-2nde` | ✅ | 0 | 0/27 | 0 | 0 | 2 | 1 | 0 |
| `seconde:valeur-absolue-distance-2nde` | ✅ | 0 | 0/30 | 0 | 0 | 1 | 0 | 0 |
| `seconde:arbres-probabilites-2nde` | ✅ | 0 | 0/26 | 0 | 0 | 0 | 0 | 0 |
| `seconde:boites-a-moustaches-2nde` | ✅ | 0 | 0/26 | 0 | 0 | 0 | 0 | 0 |
| `seconde:evolutions-successives-reciproques-2nde` | ✅ | 0 | 0/32 | 0 | 0 | 0 | 0 | 0 |
| `seconde:frequences-conditionnelles-2nde` | ✅ | 0 | 0/27 | 0 | 0 | 0 | 0 | 0 |
| `seconde:loi-grands-nombres-2nde` | ✅ | 0 | 0/24 | 0 | 0 | 0 | 0 | 1 |
| `seconde:probabilites-conditionnelles-2nde` | ✅ | 0 | 0/27 | 0 | 1 | 0 | 0 | 0 |
| `seconde:proportions-pourcentages-2nde` | ✅ | 0 | 0/34 | 0 | 0 | 0 | 0 | 0 |
| `seconde:series-regroupees-classes-2nde` | ✅ | 0 | 0/33 | 0 | 0 | 1 | 0 | 0 |
| `seconde:statistiques-une-variable-2nde` | ✅ | 0 | 0/34 | 0 | 0 | 1 | 0 | 0 |
| `seconde:tableaux-croises-2nde` | ✅ | 0 | 0/26 | 0 | 0 | 1 | 0 | 0 |
| `seconde:tests-diagnostiques-probabilites-2nde` | ✅ | 0 | 0/28 | 0 | 0 | 0 | 0 | 0 |

### `seconde:fonctions-de-reference-2nde`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/fonctions-de-reference-2nde/modules/Module02LaParabole.jsx:80 · terme « variations »  
  « variations / croissante / décroissante » is a target concept of this lesson but its first appearance is q.rowOption (module 2, étape 4); it is only taught later at apps/web/src/lessons/lycee/seconde/fonctions/fonctions-de-reference-2nde/modules/Module03LHyperbole.jsx:78
- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/fonctions-de-reference-2nde/modules/Module04LeV.jsx:92 · terme « extremum »  
  « extremum / maximum / minimum » is a target concept of this lesson but its first appearance is q.rowLabel (module 4, étape 4) and it is never taught in a teaching position

### `seconde:signe-fonctions-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/signe-fonctions-2nde/modules/Module02LesZerosEtLeTableau.jsx:62 · terme « intervalle-crochets »  
  « crochets d'intervalle » first appears at q.correction (module 2, étape 3) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/signe-fonctions-2nde/modules/Module02LesZerosEtLeTableau.jsx:62 · terme « appartient »  
  « symbole ∈ » first appears at q.correction (module 2, étape 3) and is never established in a teaching position in this lesson

### `seconde:variations-extremums-2nde`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/variations-extremums-2nde/modules/Module01LeRandonneur.jsx:77 · terme « intervalle »  
  « intervalle » is a target concept of this lesson but its first appearance is q.explain (module 1, étape 3); it is only taught later at apps/web/src/lessons/lycee/seconde/fonctions/variations-extremums-2nde/modules/Module02CroissanteDecroissante.jsx:78
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/variations-extremums-2nde/modules/Module03LeTableauDeVariations.jsx:55 · terme « appartient »  
  « symbole ∈ » first appears at q.correction (module 3, étape 2) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/fonctions/variations-extremums-2nde/modules/Module05ComparerSansCalculer.jsx:48 · terme « inclus »  
  « symbole ⊂ » first appears at q.correction (module 5, étape 3) and is never established in a teaching position in this lesson

### `seconde:colinearite-alignement-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/geometrie/colinearite-alignement-2nde/modules/Module03Proportionnelles.jsx:124 · terme « valeur-absolue »  
  « valeur absolue » first appears at q.explainFor (module 3, étape 3) and is never established in a teaching position in this lesson

### `seconde:equations-de-droites-2nde`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/geometrie/equations-de-droites-2nde/modules/Module00Diagnostic.jsx:41 · terme « colineaire »  
  « colinéaire » is a target concept of this lesson but its first appearance is diag.prompt (module 0); it is only taught later at apps/web/src/lessons/lycee/seconde/geometrie/equations-de-droites-2nde/modules/Module01LaboratoireDesDroites.jsx:87
- **CRITICAL** `E_REQUIRES_NOT_ESTABLISHED` — apps/web/src/lessons/lycee/seconde/geometrie/equations-de-droites-2nde/modules/Module07AtelierConstruireEtResoudre.jsx:63  
  question 'M07-S1-Q1' requires 'droite-calculer-pente', which no brick establishes and priorKnowledge does not declare
- **CRITICAL** `E_REQUIRES_NOT_ESTABLISHED` — apps/web/src/lessons/lycee/seconde/geometrie/equations-de-droites-2nde/modules/Module07AtelierConstruireEtResoudre.jsx:69  
  question 'M07-S1-Q2' requires 'droite-equation-reduite', which no brick establishes and priorKnowledge does not declare
- **CRITICAL** `E_REQUIRES_NOT_ESTABLISHED` — apps/web/src/lessons/lycee/seconde/geometrie/equations-de-droites-2nde/modules/Module07AtelierConstruireEtResoudre.jsx:82  
  question 'M07-S2-Q3' requires 'droite-methode-point-vecteur', which no brick establishes and priorKnowledge does not declare
- **CRITICAL** `E_REQUIRES_NOT_ESTABLISHED` — apps/web/src/lessons/lycee/seconde/geometrie/equations-de-droites-2nde/modules/Module07AtelierConstruireEtResoudre.jsx:120  
  question 'M07-S4-Q5' requires 'droite-equation-cartesienne', which no brick establishes and priorKnowledge does not declare
- **CRITICAL** `E_REQUIRES_NOT_ESTABLISHED` — apps/web/src/lessons/lycee/seconde/geometrie/equations-de-droites-2nde/modules/Module07AtelierConstruireEtResoudre.jsx:146  
  question 'M07-S6-Q6' requires 'droite-appartenance', which no brick establishes and priorKnowledge does not declare
- **MEDIUM** `W_BRICK_MODULE_MISMATCH` — apps/web/src/lessons/lycee/seconde/geometrie/equations-de-droites-2nde/modules/Module07AtelierConstruireEtResoudre.jsx:56  
  brick 'droite-methode-deux-points' renders in module 7 but knowledge.jsx declares it under module 6 — the map attributes it to 6
- **MEDIUM** `W_BRICK_MODULE_MISMATCH` — apps/web/src/lessons/lycee/seconde/geometrie/equations-de-droites-2nde/modules/Module07AtelierConstruireEtResoudre.jsx:96  
  brick 'droite-methode-point-pente' renders in module 7 but knowledge.jsx declares it under module 6 — the map attributes it to 6
- **MEDIUM** `W_BRICK_MODULE_MISMATCH` — apps/web/src/lessons/lycee/seconde/geometrie/equations-de-droites-2nde/modules/Module07AtelierConstruireEtResoudre.jsx:114  
  brick 'droite-lire-cartesienne' renders in module 7 but knowledge.jsx declares it under module 6 — the map attributes it to 6
- **MEDIUM** `W_BRICK_MODULE_MISMATCH` — apps/web/src/lessons/lycee/seconde/geometrie/equations-de-droites-2nde/modules/Module07AtelierConstruireEtResoudre.jsx:140  
  brick 'droite-modeliser' renders in module 7 but knowledge.jsx declares it under module 6 — the map attributes it to 6

### `seconde:positions-relatives-droites-2nde`

- **MEDIUM** `M_TAUGHT_TOO_LATE` — apps/web/src/lessons/lycee/seconde/geometrie/positions-relatives-droites-2nde/modules/Module00Diagnostic.jsx:56 · terme « colineaire »  
  « colinéaire » first appears at diag.option (module 0), before its teaching position at apps/web/src/lessons/lycee/seconde/geometrie/positions-relatives-droites-2nde/modules/Module02LaDirection.jsx:96

### `seconde:vecteurs-2nde`

- **MEDIUM** `M_NAMED_IN_LOCKED_TITLE` — apps/web/src/lessons/lycee/seconde/geometrie/vecteurs-2nde/modules/Module05EtirerInverser.jsx:113 · terme « colineaire »  
  « colinéaire » est nommé dans le titre de l'étape 3 (module 5), lisible avant que l'étape ne s'ouvre

### `seconde:calcul-litteral-2nde`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/calcul-litteral-2nde/modules/Module05TroisFormes.jsx:42 · terme « extremum »  
  « extremum / maximum / minimum » is a target concept of this lesson but its first appearance is q.explain (module 5, étape 3); it is only taught later at apps/web/src/lessons/lycee/seconde/nombres_calculs/calcul-litteral-2nde/modules/Module05TroisFormes.jsx:50

### `seconde:ensembles-et-intervalles-2nde`

- **MEDIUM** `M_TAUGHT_TOO_LATE` — apps/web/src/lessons/lycee/seconde/nombres_calculs/ensembles-et-intervalles-2nde/modules/Module04InegaliteOuIntervalle.jsx:160 · terme « intervalle-crochets »  
  « crochets d'intervalle » first appears at q.rowOption (module 4, étape 5), before its teaching position at apps/web/src/lessons/lycee/seconde/nombres_calculs/ensembles-et-intervalles-2nde/modules/Module04InegaliteOuIntervalle.jsx:174

### `seconde:logique-et-raisonnement-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/logique-et-raisonnement-2nde/modules/Module00Diagnostic.jsx:9 · terme « appartient »  
  « symbole ∈ » first appears at diag.option (module 0) and is never established in a teaching position in this lesson
- **LOW** `L_DISTRACTOR_ONLY` — apps/web/src/lessons/lycee/seconde/nombres_calculs/logique-et-raisonnement-2nde/modules/Module00Diagnostic.jsx:9 · terme « ensemble-reels »  
  « ensemble ℝ » appears only as a wrong answer, first at diag.option (module 0) — a distractor still creates a first exposure

### `seconde:nombres-reels-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/nombres-reels-2nde/modules/Module00Diagnostic.jsx:26 · terme « variations »  
  « variations / croissante / décroissante » first appears at diag.prompt (module 0) and is never established in a teaching position in this lesson
- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/nombres-reels-2nde/modules/Module02FamillesDeNombres.jsx:83 · terme « appartient »  
  « symbole ∈ » first appears at q.correction (module 2, étape 2) and is never established in a teaching position in this lesson
- **MEDIUM** `M_NAMED_IN_LOCKED_TITLE` — apps/web/src/lessons/lycee/seconde/nombres_calculs/nombres-reels-2nde/modules/Module02FamillesDeNombres.jsx:54 · terme « ensemble-reels »  
  « ensemble ℝ » est nommé dans le titre de l'étape 1 (module 2), lisible avant que l'étape ne s'ouvre

### `seconde:valeur-absolue-distance-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/nombres_calculs/valeur-absolue-distance-2nde/modules/Module04LeFaisceau.jsx:87 · terme « intervalle-crochets »  
  « crochets d'intervalle » first appears at q.explain (module 4, étape 3) and is never established in a teaching position in this lesson

### `seconde:loi-grands-nombres-2nde`

- **LOW** `L_DISTRACTOR_ONLY` — apps/web/src/lessons/lycee/seconde/statistiques_probabilites/loi-grands-nombres-2nde/modules/Module06MissionFinaleLeGrandNombre.jsx:17 · terme « variations »  
  « variations / croissante / décroissante » appears only as a wrong answer, first at boss.option (module 6) — a distractor still creates a first exposure

### `seconde:probabilites-conditionnelles-2nde`

- **CRITICAL** `C_TARGET_DEMANDED_BEFORE_TAUGHT` — apps/web/src/lessons/lycee/seconde/statistiques_probabilites/probabilites-conditionnelles-2nde/modules/Module02LaNotationSachantQue.jsx:77 · terme « frequence-conditionnelle »  
  « fréquence conditionnelle » is a target concept of this lesson but its first appearance is q.explainFor (module 2, étape 2); it is only taught later at apps/web/src/lessons/lycee/seconde/statistiques_probabilites/probabilites-conditionnelles-2nde/modules/Module03NeJamaisRetournerLaCondition.jsx:129

### `seconde:series-regroupees-classes-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/statistiques_probabilites/series-regroupees-classes-2nde/modules/Module03LesFrequencesCumulees.jsx:127 · terme « extremum »  
  « extremum / maximum / minimum » first appears at q.correction (module 3, étape 3) and is never established in a teaching position in this lesson

### `seconde:statistiques-une-variable-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/statistiques_probabilites/statistiques-une-variable-2nde/modules/Module03LesQuartiles.jsx:109 · terme « extremum »  
  « extremum / maximum / minimum » first appears at q.correction (module 3, étape 4) and is never established in a teaching position in this lesson

### `seconde:tableaux-croises-2nde`

- **HIGH** `H_NEVER_TAUGHT` — apps/web/src/lessons/lycee/seconde/statistiques_probabilites/tableaux-croises-2nde/modules/Module05AtelierInterpreterUnTableau.jsx:92 · terme « echantillon »  
  « échantillon » first appears at q.explain (module 5, étape 2) and is never established in a teaching position in this lesson


## Hors périmètre — 4e (relevé, non réparé)

Ce niveau n'est pas encore traité. Les constats sont enregistrés ici pour mémoire.

1 leçon(s) · critiques 0 · hautes 0 · moyennes 0 · basses 0

| Leçon | Carte | Bricks | requires | Contrat | C | H | M | L |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `4e:racines-carrees-4e` | — | 0 | 0/0 | 0 | 0 | 0 | 0 | 0 |
