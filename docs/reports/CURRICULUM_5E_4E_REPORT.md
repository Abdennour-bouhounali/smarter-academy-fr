# 5e / 4e — audit curriculaire, correction du catalogue et premières leçons

Date : 2026-09-08. Périmètre : les 31 objets officiels de 5e et de 4e.

---

## A. Sources officielles consultées

Le référentiel officiel était **déjà dans le dépôt** et n'a pas eu à être
reconstitué : `packages/core/curriculum/smarter_academy_programmes_maths_2026.json`
(version 2026-08).

| Source | Publication | NOR |
| --- | --- | --- |
| Programmes de français et de mathématiques du cycle des approfondissements (cycle 4) | BO n°10 du 5 mars 2026 | [MENE2602912A](https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2602912A) |
| Programmes du cycle de consolidation (cycle 3) | BO n°16 du 17 avril 2025 | [MENE2504620A](https://www.education.gouv.fr/bo/2025/Hebdo16/MENE2504620A) |
| Programme de mathématiques de seconde générale et technologique | BO n°14 du 2 avril 2026 | [MENE2602914A](https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602914A) |

Calendrier d'application confirmé par le référentiel : 6e 2025-2026, **5e
2026-2027**, **4e 2027-2028**, 3e 2028-2029.

Chaque objet officiel porte un `teachingScope.include` / `exclude` : les
frontières de niveau sont donc **lisibles par une machine**, et c'est cette
donnée — pas un avis — qui a servi d'autorité.

---

## B. Audit du catalogue — verdict

**Constat central : il n'y avait aucun nom, niveau, domaine ni doublon à
corriger.** `coursesData.js` ne liste pas les leçons à la main :
`buildChaptersForGrade()` les **génère** depuis le référentiel officiel. Les 16
objets de 5e et les 15 de 4e sont donc, par construction, au bon niveau et dans
le bon domaine.

Verdict §25 pour les 31 candidats : **KEEP**. Aucun DELETE, aucun MOVE, aucun
MERGE, aucun SPLIT, aucun RENAME.

Ce qui manquait était la **couche éditoriale** :

| Avant | Après |
| --- | --- |
| 28 leçons sur 31 sans métadonnées : description « En préparation… », durée « -- », 0 Learning Point | 31 leçons décrites, avec 4 à 8 LP atomiques et une durée réelle |
| 2 entrées rédigées portant des LP vagues (« Développer », « Calculer avec les puissances ») | LP atomiques dérivés de `teachingScope.include` |
| 192 Learning Points au total | **192** LP explicites (101 en 5e, 91 en 4e) |

Durées différenciées selon la densité conceptuelle (§43), de 50 min
(`reperage-4e`) à 85 min (`triangles-4e`) — plus aucune durée uniforme.

---

## C. §26 — Racine carrée (4e) : audit, pas duplication

`apps/web/src/lessons/college/4e/nombres_calculs/racines-carrees` a été inspectée
avant toute décision.

- **Niveau** : CORRECT — `racine_carree` est un objet officiel de 4e, et la 3e a
  le sien (`racines-carrees-3e`, distinct).
- **Périmètre** : CONFORME — la leçon exclut explicitement les propriétés de
  produit/quotient et la simplification `a√b`, exactement ce que la liste
  `exclude` officielle réserve au niveau suivant.
- **Durée** : 53 min au catalogue = somme des `estimatedMin` des 5 modules.
- **Écart relevé** : la leçon est antérieure à l'architecture des connaissances.
  Pas de `knowledge.jsx`, pas de `priorKnowledge`, **0 `<KnowledgeBrick>`** sur
  ses 5 modules.

**Verdict : CONSERVER et RÉPARER** (ajout de la couche connaissances), jamais
dupliquer ni supprimer. La réparation reste à faire — voir §J.

---

## D. Ce qui a été construit

Deux leçons complètes, choisies pour former une **paire verticale** : le même
objet officiel `nombres_relatifs` vu à deux niveaux, ce qui met la frontière
5e/4e à l'épreuve sur le cas le plus exposé au recouvrement.

### 5e — Nombres relatifs (`nombres-relatifs-5e`, 8 modules, 75 min)

| # | Module | Stage | LP enseignés |
| --- | --- | --- | --- |
| 0 | Mission de départ | `prerequisite_check` | — (mesure les acquis de 6e) |
| 1 | L'ascenseur du parking | `trigger` | P1 |
| 2 | La droite des nombres | `discovery` | P2, P3, P4 |
| 3 | Qui est le plus grand ? | `discovery` | P5, P4 |
| 4 | Se déplacer sur la droite | `manipulation` | P6, P8 |
| 5 | Soustraire, c'est reculer | `manipulation` | P7, P8, P4 |
| 6 | Le relevé de la station | `practice_lab` | P1, P5, P7, P8 |
| 7 | 🏆 Mission finale | `evaluation` | — (10 épreuves, 8/8 LP couverts) |

Manipulation signature : une cabine d'ascenseur qui descend **sous** le
rez-de-chaussée. Le sol est le zéro ; le signe apparaît comme une information de
position, jamais comme une opération.

### 4e — Opérations sur les nombres relatifs (`nombres-relatifs-4e`, 7 modules, 70 min)

| # | Module | Stage | LP enseignés |
| --- | --- | --- | --- |
| 0 | Mission de départ | `prerequisite_check` | — (mesure les acquis de 5e) |
| 1 | Prolonger la table | `trigger` | P2 |
| 2 | La règle des signes | `discovery` | P1, P2 |
| 3 | Plusieurs facteurs | `manipulation` | P3, P6 |
| 4 | Diviser | `manipulation` | P4, P6 |
| 5 | Enchaîner les opérations | `practice_lab` | P5, P1, P4 |
| 6 | 🏆 Mission finale | `evaluation` | — (10 épreuves, 6/6 LP couverts) |

Manipulation signature : une **colonne de table de multiplication que l'élève
prolonge** sous le zéro. L'écart affiché reste constant, et « − × − = + »
apparaît comme la seule valeur possible — une déduction, pas une convention.

---

## E. La frontière verticale, tenue

| | 5e enseigne | 5e n'enseigne PAS | 4e reprend |
| --- | --- | --- | --- |
| Sens du relatif | position, opposé, valeur absolue, ordre | — | supposé acquis (`priorKnowledge`) |
| Somme / différence | oui, comme déplacements | — | supposé acquis |
| Produit / quotient | — | **réservé à la 4e** (exclusion officielle) | introduit et automatisé |
| Règle des signes | — | **réservée à la 4e** | déduite de la régularité de la table |
| Priorités sur relatifs | — | **réservées à la 4e** | module 5 |

Le module 0 de la 4e **mesure** les acquis de 5e sans les réenseigner ; les
`priorKnowledge` de la 4e sont exactement les ids de briques posés par la 5e
(`nombre-relatif`, `oppose`, `distance-a-zero`, `ordre-relatifs`,
`addition-deplacement`, `soustraction-oppose`).

---

## F. Bugs trouvés et corrigés

Trois défauts réels, invisibles à tout contrôle de source :

1. **`parseFr` refuse les négatifs.** Le parseur par défaut du kit teste
   `^\d+$` : dans une leçon sur les nombres négatifs, un élève saisissant « −5 »
   était compté faux. Corrigé par un `parseRelatif` local acceptant aussi le
   vrai signe moins U+2212 que la leçon affiche partout. Verrouillé par un test
   qui relit tout ce que `fmt()` écrit.
2. **`oppose(0)` rendait `-0`**, affiché « −0 » sur la droite graduée.
3. **`badges[].test` doit être une fonction.** Un objet `{skill}` y jetait
   « b.test is not a function » : le test final ne montait pas du tout. Attrapé
   au navigateur, pas par les validateurs.

Deux défauts pédagogiques attrapés par les tests que j'ai écrits :

4. **Deux expressions du module 5 (4e) ne démontraient rien** : `12 ÷ (−4) − 5`
   et `(−6) × (−2) + (−5)` donnent le même résultat avec ou sans priorités.
   Remplacées ; l'invariant « les deux ordres diffèrent » est désormais testé.
5. **Le mot « facteur » arrivait d'abord dans une option de question** (4e M3) —
   une violation de la loi « connaissance avant demande ». Corrigé en le
   définissant en position d'enseignement (M2), pas en le masquant.

---

## G. Lexique — une correction assumée

`valeur-absolue` passe de `seconde` à `5e` dans `scripts/audit/lexicon.json`.
Ce n'est pas un abaissement pour faire taire un signalement : le programme 2026
introduit la notion dans l'objet **5e** `nombres_relatifs` (« Définir nombres
positifs/négatifs, opposé, valeur absolue »), la Seconde l'approfondissant via
`valeur_absolue_et_distance`. Le niveau indiqué est celui de la **première
rencontre**, conformément au `_boundaryNote` du fichier.

---

## H. Fichiers

**Créés** — 2 leçons complètes (24 fichiers), 2 suites e2e, 1 document
d'architecture, 1 générateur :

- `docs/architecture/CURRICULUM_MATRIX_5E_4E.md` — la matrice des 31 objets,
  périmètre et hors-périmètre leçon par leçon
- `scripts/gen-curriculum-matrix.mjs` — la régénère depuis la source officielle
- `apps/web/src/lessons/college/5e/nombres_calculs/nombres-relatifs-5e/**`
- `apps/web/src/lessons/college/4e/nombres_calculs/nombres-relatifs-4e/**`
- `apps/web/e2e/lesson-kit/{5e,4e}-nombres-relatifs.mjs`

**Modifiés** :

- `packages/core/curriculum/coursesData.js` — métadonnées des 31 objets
- `apps/web/src/App.jsx` — 2 routes branchées
- `scripts/audit/lexicon.json` — `valeur-absolue` → 5e

**Composants réutilisés** (aucune architecture nouvelle, §39) : `ContentModule`,
`TapQuestion`, `NumericQuestion`, `BatchChoiceQuestion`, `PredictionChips`,
`KnowledgeBrick`, `BossFinal`, `PrerequisiteDiagnostic`, `KnowledgeSnapshot`,
`LessonIndex`, `LessonKnowledgeProvider`, et le harnais e2e `_2nde-helpers.mjs`.

**Composants nouveaux, tous locaux à leur leçon** : `ElevatorLab`,
`NumberLineLab` (5e), `TableLab`, `SignCountLab` (4e).

---

## I. Validation

| Contrôle | Résultat |
| --- | --- |
| `npm test` (3 espaces de travail) | **1 548 tests**, 102 fichiers — tous verts |
| `npm run validate:lessons` | passé — 8/8 et 6/6 LP couverts |
| `npm run audit:knowledge:gate` | 0 erreur de contrat, **0 signalement de lexique** sur les deux leçons |
| `npm run check:routes` | 77 leçons branchées (75 avant) |
| `npm run check:non-blocking` | aucune question ne conditionne l'avancement à la justesse |
| `npm run check:level-leak` | aucune fuite |
| `npm run build` | passé |
| e2e navigateur 5e | **27/27** |
| e2e navigateur 4e | **21/21** |

Les suites e2e vérifient ce qu'aucun contrôle de source ne voit : chaque module
rend réellement, les manipulations répondent au clavier et à la souris et
**restent rejouables après validation** (classe de bug « manipulation gelée »),
aucune étiquette SVG ne sort de son cadre ni n'en chevauche une autre **sur
toute la plage balayée**, aucun défilement horizontal à 375 px, aucune erreur
console.

---

## J. Ce qui reste

**Préexistant, hors périmètre de cette session**

- `racines-carrees-4e` : conforme au programme, mais sans couche connaissances
  (0 brique). À réparer comme l'ont été les leçons de 2nde.
- 28 leçons de 5e/4e restent `coming_soon` : leur catalogue est désormais juste
  et complet, le code reste à écrire.

**Introduit par cette session**

- Aucun. Les deux leçons livrées passent l'intégralité des contrôles, et la
  base de référence (75 leçons, 0 erreur) n'a pas régressé.

**Améliorations possibles**

- Les tons de `MissionBrief` se limitent à `amber`, `indigo` et un slate par
  défaut ; cinq autres valeurs retombaient silencieusement sur slate. Normalisé
  ici par déclaration explicite, mais le composant gagnerait à refuser une
  valeur inconnue plutôt qu'à l'ignorer.
- `parseFr` refuse les négatifs pour toute la plateforme. Contourné par un
  parseur local dans les deux leçons ; un `parseRelatif` partagé dans
  `packages/core` éviterait que chaque leçon sur les relatifs le réinvente.

---

## K. Le patron, pour les 28 leçons restantes

Les deux leçons livrées valent **gabarit vérifié**. La séquence qui a marché :

1. lire `teachingScope.include`/`exclude` de l'objet officiel — le périmètre
   n'est jamais une décision d'auteur ;
2. écrire le **noyau numérique** (`components/<sujet>.js`) et **son test** avant
   toute interface : les affirmations de la leçon deviennent vérifiables, et
   c'est ce test qui a attrapé deux défauts pédagogiques réels ;
3. concevoir la manipulation signature à partir de la mathématique, pas d'un
   catalogue de widgets (§6bis.2) ;
4. poser chaque connaissance par une brique **au moment où le geste vient de lui
   donner son sens**, jamais dans un `explain` ni un `footer` ;
5. brancher la route dans `App.jsx` — sans quoi la leçon est injoignable **sans
   qu'aucun contrôle ne le voie** ;
6. vérifier **au navigateur** : trois des cinq bugs de cette session n'étaient
   visibles que là.
