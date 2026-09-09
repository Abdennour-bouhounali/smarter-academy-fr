# 2nde — Probabilités conditionnelles — Design & Implementation Spec

> Rétro-documenté depuis le code le 2026-09-09 (la leçon existait sans spec). Sections selon LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_probabilites_conditionnelles` · id `probabilites-conditionnelles-2nde` · domain `statistiques_probabilites` · 🎲 · **80 min**.
- Route `/courses/lycee/seconde/statistiques_probabilites/probabilites-conditionnelles-2nde`. LPs `seconde_probabilites-conditionnelles-2nde_P1…P9`.
- Specificity : « En Seconde, la probabilité conditionnelle P_A(B) est introduite à partir de tableaux croisés et de situations concrètes ; on distingue explicitement P_A(B) et P_B(A). » (`level_specificity`, objet officiel `probabilites_conditionnelles`).
- Neighbours NOT repeated : arbres pondérés (expériences successives — leçon suivante), tests diagnostiques (application médicale de l'inversion), loi des grands nombres — cette leçon reste sur une seule population restreinte par une condition, jamais deux étapes chronologiques.

## 2. Central idea & misconceptions
Restreindre l'univers à une condition change le dénominateur, pas seulement la sélection des cas favorables ; P_A(B) et P_B(A) sont deux quotients différents calculés dans deux univers différents, et les confondre ou intervertir le sens de la condition est l'erreur centrale du programme.

| # | Misconception | Confronted |
|---|---|---|
| 1 | Inversion du conditionnement : confondre P(près de chez soi \| accident) et P(accident \| près de chez soi) | M3 step 2, boss `pc-e7` |
| 2 | Même numérateur, univers différents (P_A(B) et P_B(A) confondus car « ça se ressemble ») | M5 situation 3 (s3, inverse de s2), boss `pc-e6` |
| 3 | Diviser par la population totale au lieu du sous-groupe conditionné (P(A∩B) pris pour P_A(B)) | M2 step 2 et 3, boss `pc-e4` |
| 4 | Appliquer une probabilité conditionnelle à toute la population au lieu du seul sous-groupe concerné | M4 step 2, M5 situation 4 (s4), boss `pc-e9` |

## 3. Signature interaction — « Éteins une partie de la population » (`UniverseLab`)
Le module 1 (trigger) fait choisir un événement (« être en club » / « être interne ») puis une condition parmi quatre (« Aucune condition », « Sachant qu'il est interne », « Sachant qu'il est externe », « Sachant qu'il est en club »). Chaque clic appelle `probabilityUnder(conditionId, eventId)` : la population de 800 élèves (`POPULATION_GROUPS`) est filtrée par la condition, et `UniverseLab` redessine une `PopulationBar` où les groupes exclus sont grisés/hachurés, avec le quotient écrit en entier (« 150 / 200 = 75 % ») plutôt que le seul résultat. L'étape n'est validée qu'après au moins 3 conditions distinctes essayées, pour forcer la comparaison entre univers plutôt qu'une seule lecture isolée.

## 4. Module architecture (7 · 80 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | diag |
| 1 | eteindre-la-population | trigger | P1 P2 | 14 | `UniverseLab` |
| 2 | la-notation-sachant-que | discovery | P3 P4 | 14 | `CrossTableView` + notation P_A(B) |
| 3 | ne-jamais-retourner-la-condition | discovery | P6 P8 | 14 | comparaison P_A(B)/P_B(A), situation accident |
| 4 | des-frequences-aux-probabilites | formalization | P9 P7 | 12 | probabilités composées, exemple cyclistes |
| 5 | atelier-situations-concretes | practice_lab | P5 P7 | 12 | 4 étapes **littérales** (voir ci-dessous) |
| 6 | mission-finale-sachant-que | evaluation | — | 10 | `BossFinal` |

Le module 5 (`Module05AtelierSituationsConcretes.jsx`) n'est **pas** généré par `.map()` sur son tableau de données : les 4 étapes sont écrites à la main (littéral `steps = [{...},{...},{...},{...}]`), chacune extrayant son contenu de `SITUATIONS[i]` par déstructuration mais portant un `requires` littéral propre — commentaire du fichier : « requires est lu par l'audit comme un tableau LITTÉRAL dans le JSX : un module `.map()` sur SITUATIONS ne peut donc pas indexer un objet à l'exécution (E_REQUIRES_NOT_LITERAL). » `requires` varie par étape : la situation 1 ajoute `denominateur`, la situation 3 ajoute `inversion`, la situation 4 échange `probabilites-composees`.

Knowledge Map : M1 1 · M2 1 · M3 2 · M4 2 · M5 1 = 6 items.

## 5. Mathematical model — `data.js`
`REGIMES` (`interne`/`externe`), `SPORT` (`club`/`sans club`), `LYCEE` (effectifs `{interne:{club:150,'sans club':50}, externe:{club:300,'sans club':300}}`, total 800), `TOTAL = 800`, `lyceeTable()` (forme attendue par `CrossTableView`), `POPULATION_GROUPS` (4 groupes ordonnés pour la lisibilité de `PopulationBar`), `CONDITIONS` (4 conditions avec prédicat `keep(g)`), `EVENTS` (2 événements avec prédicat `match(g)`), `probabilityUnder(conditionId, eventId)` (calcul central réutilisé par `UniverseLab` et les modules 1–3), `SITUATIONS` (4 énoncés `s1`–`s4` pour le module 5, `s3` étant l'inversion délibérée de `s2` : même numérateur 15, dénominateurs 300 puis 19). Tests : 11, dont `P_interne(club) = 0,75 — la surprise du module 1`, `P_club(interne) ≈ 0,333 — l'inversion du module 3`, `les deux sens du conditionnement diffèrent nettement`, et `oppose bien s2 et s3 : même numérateur, univers différents`.

## 6. Validation
`validate:lessons` 9/9 LP couverts ; vitest 11/11 ; e2e `apps/web/e2e/lesson-kit/2nde-probabilites-conditionnelles.mjs` (vite :5252).
