# 5e — Représentation de l'espace — Design Spec

> Contrat de conception. Toute déviation pendant l'implémentation exige de modifier
> ce document d'abord (LESSON_DESIGN_PLAYBOOK §15.3).

## 1. Lesson Identity

| | |
|---|---|
| Catalogue key | `5e_representations_espace` |
| `LESSON_CONFIG.id` | `representations-espace-5e` |
| Dossier | `apps/web/src/lessons/college/5e/espace_geometrie/representations-espace-5e/` |
| Chapitre | `espace_geometrie` — Espace et géométrie |
| Durée catalogue | 65 min (`durationMinutes`) |
| Emoji | 📦 |
| Difficulté | Moyen |

## 2. Curriculum Contract (référentiel officiel 2026)

`levels.5e.domains.espace_geometrie.official_objects.representations_espace` :

- **description** : « Développer la capacité à représenter, lire et raisonner sur des objets de
  l'espace. »
- **prerequisites** : Solides · Patrons
- **include** :
  - Vues (dessus, face, côté)
  - Perspective cavalière de prismes et cylindres
  - Patrons du prisme droit et du cylindre de révolution
- **exclude** :
  - **Sphère**

### ⚠️ Le volume n'est PAS au programme de 5e — décision de périmètre

Le brief initial demandait une carte allant jusqu'à `volume → conversion`. **Le référentiel 2026
place le volume en 4e**, non en 5e :

| | 5e `representations_espace` | 4e `representations_espace` |
|---|---|---|
| include | Vues · Perspective cavalière (prismes, cylindres) · Patrons (prisme droit, cylindre) | Pyramide, cône · Base et hauteur · **Volume de la pyramide et du cône** |

Les `pointsToLearn` de `coursesData.js` pour cette leçon (six, listés ci-dessous) ne mentionnent
aucun volume. Comme `validate-lessons.mjs` confronte `teachingScope` aux `pointsToLearn` du
catalogue, un module de volume ferait échouer la gate.

> **Décision (validée par l'utilisateur) : suivre le référentiel officiel.** La carte s'arrête à
> `patron → dimensions`. Volume et conversions sont exclus, et l'exclusion est **exécutable**
> (§6). La chaîne du brief est honorée jusqu'à `dimensions` ; les deux derniers maillons
> appartiennent à la 4e.

Sont aussi hors périmètre : la **sphère et la boule** (exclusion explicite du référentiel), la
**pyramide et le cône** (objets de 4e), et les **sections de solides** (3e).

### Learning Points (dérivés de `coursesData.js`, ordre contraignant)

| id | intitulé |
|---|---|
| `5e_representations-espace-5e_P1` | Identifier les vues de dessus, de face et de côté d'un solide |
| `5e_representations-espace-5e_P2` | Associer un solide à ses trois vues |
| `5e_representations-espace-5e_P3` | Lire une perspective cavalière d'un prisme droit |
| `5e_representations-espace-5e_P4` | Lire une perspective cavalière d'un cylindre de révolution |
| `5e_representations-espace-5e_P5` | Reconnaître le patron d'un prisme droit |
| `5e_representations-espace-5e_P6` | Reconnaître le patron d'un cylindre de révolution |

## 3. Ce qui distingue cette leçon de ses voisines

| | 6e `solides-patrons` | **5e (cette leçon)** | 3e `representation-espace-3e` |
|---|---|---|---|
| solides | cube, pavé (+ cylindre nommé) | **prisme droit, cylindre** | cube, pavé, prisme, pyramide, courbes |
| patrons | **du cube et du pavé** | **du prisme droit et du cylindre** | — (renvoyés à la 6e) |
| vues | — | **les trois vues** | les trois vues |
| perspective | dessin donné | **lire la convention** | règles, arêtes cachées, Euler |
| au-delà | — | — | droites non coplanaires, relation d'Euler |

**Ce que la 5e apporte : les solides à base non carrée.** Le cube et le pavé se déplient de façon
« évidente » (six rectangles) ; le prisme droit introduit **deux bases identiques + une bande de
rectangles**, et le cylindre pousse cette idée à sa limite — la bande devient un **rectangle dont
un côté vaut le périmètre du disque**. C'est le vrai contenu neuf, et c'est lui qui doit porter la
manipulation signature.

> Conséquence : la leçon ne redéplie **pas** le cube (c'est la 6e), et ne compte pas faces/arêtes/
> sommets pour eux-mêmes (6e, puis Euler en 3e).

## 4. Pedagogical Vision

Chaîne demandée par le brief, restreinte au périmètre officiel :

```text
objet réel ↔ perspective ↔ patron ↔ dimensions
```

Les quatre représentations d'un même solide doivent être **manipulables et synchronisées** : une
dimension changée sur l'une se voit sur les autres.

### Le fil narratif : l'atelier d'emballage

On fabrique des emballages : une boîte de chocolats en **prisme triangulaire**, une boîte de thé
**cylindrique**. Pour les fabriquer il faut le **patron** (le carton à découper), pour les
commander il faut les **dimensions**, et pour se comprendre à distance il faut un **dessin** —
d'où la perspective et les vues. Chaque représentation répond à un besoin réel du fil.

## 5. Cognitive Challenges & Misconceptions

| # | Difficulté | Erreur typique | Où elle est traitée |
|---|---|---|---|
| M1 | Le dessin n'est pas le solide | croire que les faces fuyantes sont des losanges | M2 |
| M2 | Une vue perd une dimension | croire qu'une vue suffit à identifier un solide | M1, M3 |
| M3 | Le patron du prisme | oublier une des deux bases, ou les mettre du même côté | M4 |
| M4 | La bande du cylindre | croire que la bande est un cercle, ou de longueur libre | M5 — **interaction signature** |
| M5 | Périmètre vs diamètre | prendre la largeur de la bande égale au diamètre | M5 |
| M6 | Deux solides, mêmes vues | conclure d'une seule vue | M3 |

## 6. Mathematical Model

### 6.1 Réutilisation — `common/utils/geometry3d.js`

Acquis, à **importer** et non recopier : `SOLIDS.prisme`, `rotateSolid`, `projectCavaliere`
(45°, k = 0,5), `projectOrtho('face'|'dessus'|'cote')`, `visibleEdges` (visibilité **calculée**,
jamais dessinée à la main), `countsOf`.

`SolidTurner` et `ViewsPanel` (aujourd'hui dans `representation-espace-3e/components/`) sont
**promus dans `common/components/`** plutôt que copiés une troisième fois — c'est la pratique
documentée du dépôt (kit, knowledge). La 3e continue de les importer via un ré-export d'une ligne.

### 6.2 Le manque : le cylindre

`geometry3d.js` ne contient **pas** de cylindre — or le référentiel 5e l'exige explicitement, en
perspective **et** en patron. Un cylindre n'est pas un polyèdre : le modéliser en sommets/arêtes
mentirait sur sa nature (c'est la raison pour laquelle la 3e l'a délibérément laissé de côté).

Nouveau module de leçon `components/espace5e.js` :

```js
// ── Le cylindre, décrit par ses grandeurs, jamais par des sommets ──────
export function cylindre({ rayon, hauteur })       // { rayon, hauteur, nom, emoji }
export function bandeDuCylindre(cyl)               // { largeur: 2πr, hauteur } — LE cœur de la leçon
export function patronCylindreOk(bande, cyl, tol)  // la bande se referme-t-elle ?
export function diametre(cyl), perimetreBase(cyl)

// ── Le prisme droit ───────────────────────────────────────────────────
export function prismeDroit({ base, hauteur })     // base = polygone régulier ou triangle
export function facesDuPrisme(pr)                  // 2 bases + n rectangles
export function patronPrismeOk(pieces, pr)         // 2 bases + bande complète, bases opposées

// ── Périmètre exécutable ──────────────────────────────────────────────
export function solide(spec)   // throw sur 'sphere' | 'boule' | 'pyramide' | 'cone'
export function volume()       // throw : le volume est un objet de 4e
```

### Atteignabilité du réglage (§10.6) — corrigé pendant l'implémentation

La bonne longueur de bande est un **périmètre** (2πr = 25,13 pour r = 4), qui n'est jamais un
multiple de 0,5. Avec le pas de 0,5 initialement prévu, le cran le plus proche tombait à 0,133 de
la cible — **hors tolérance** : la manipulation signature était littéralement impossible à
réussir. Défaut trouvé par la suite e2e, pas par relecture.

**Correctif** : pas de **0,1** (la tolérance de 0,05 reste plus fine, donc deux crans voisins ne
peuvent pas être « justes » tous les deux), et clavier à **deux vitesses** — ←/→ d'une unité pour
traverser la plage, ↑/↓ au dixième pour se poser (250 appuis au pas fin seul étaient
inutilisables). Verrouillé par le test `ATTEIGNABILITÉ (§10.6)`, qui vérifie la cible sur trois
rayons différents.

### Invariants (unit-testés)

1. `bandeDuCylindre(cyl).largeur === 2πr` — et **jamais** le diamètre (piège M5).
2. `patronCylindreOk` est vrai **ssi** la largeur de la bande égale le périmètre à la tolérance
   près ; faux si on lui donne le diamètre.
3. `facesDuPrisme` rend `2 + n` faces, dont exactement 2 bases superposables.
4. `patronPrismeOk` refuse un patron dont les deux bases sont du même côté de la bande.
5. `solide('sphere')`, `solide('pyramide')` et `volume()` **lèvent** — périmètre exécutable.
6. `projectCavaliere` d'un prisme : la face avant garde ses vraies longueurs (invariant de la
   convention), la profondeur est réduite de k.
7. Toute dimension des données de la leçon est positive et tient dans le cadre de dessin.

## 7. Module Architecture (7 modules, 65 min)

| # | slug | titre | stage | LP | min |
|---|---|---|---|---|---|
| 0 | `mission-de-depart` | Mission de départ | `prerequisite_check` | — | 4 |
| 1 | `trois-photos-un-carton` | Trois photos, un carton | `trigger` | P1 | 9 |
| 2 | `le-dessin-qui-ment` | Le dessin qui ment un peu | `discovery` | P3 | 9 |
| 3 | `lire-les-trois-vues` | Lire les trois vues | `manipulation` | P1, P2 | 9 |
| 4 | `deplier-le-prisme` | Déplier le prisme | `manipulation` | P5 | 10 |
| 5 | `la-bande-du-cylindre` | La bande du cylindre | `manipulation` | P4, P6 | 11 |
| 6 | `latelier-demballage` | L'atelier d'emballage | `practice_lab` | P2, P5, P6 | 8 |
| 7 | `mission-finale-latelier` | 🏆 Mission finale : l'atelier | `evaluation` | — | 12 |

**Somme = 72 min**, contre 65 au catalogue : tolérance ±10 → conforme.

Couverture LP : P1 (M1,M3) · P2 (M3,M6) · P3 (M2) · P4 (M5) · P5 (M4,M6) · P6 (M5,M6). Complète.

### M1 — Trois photos, un carton · `trigger`

**Le module ouvre sur le lab.** Trois photographies d'un même carton, prises de face, de dessus et
de côté. L'élève doit deviner l'objet — et **deux solides différents produisent la même vue de
face**. Le manque : *une seule vue ne suffit pas*.

Geste : basculer d'une vue à l'autre, et voir la silhouette changer. Brique `vue`.

### M2 — Le dessin qui ment un peu · `discovery`

La perspective cavalière comme **convention**, pas comme photo. L'élève fait tourner le prisme
(`SolidTurner`) et constate que la face avant garde ses vraies mesures tandis que la profondeur est
raccourcie. Briques `perspective-cavaliere`, `fuyante`.

### M3 — Lire les trois vues · `manipulation`

Associer un solide à ses trois vues (`ViewsPanel`), et l'inverse. Traite M6 : deux solides
partagent une vue, jamais les trois. Briques `trois-vues`, `associer-vues` (méthode).

### M4 — Déplier le prisme · `manipulation`

Le patron du prisme droit se **construit** : l'élève pose les pièces (2 bases + les rectangles) et
le composant **vérifie par simulation**, jamais par comparaison à une liste. Traite M3.
Briques `patron-prisme`, `deux-bases`.

### M5 — La bande du cylindre · `manipulation` — **INTERACTION SIGNATURE**

Le cœur neuf de la leçon. L'élève **déroule** la surface latérale d'un cylindre et doit régler la
**longueur de la bande** pour que le tube se referme exactement.

- Trop courte → il reste un jour ; trop longue → la bande chevauche. Les deux états sont **visibles**.
- La bonne longueur est le **périmètre du disque**, découvert par l'ajustement, puis nommé.
- Traite M4 et M5 (le piège du diamètre est un état atteignable, et il se voit).
- Briques `patron-cylindre`, `bande-perimetre`, `mem-bande`.

### M6 — L'atelier d'emballage · `practice_lab`

Transfert : commander le bon carton. Passer des dimensions au patron et réciproquement.
Brique `dimensions-solide`.

### M7 — Mission finale · `evaluation`

`BossFinal`, 10 épreuves QCM, distracteurs = les six erreurs du §5. Synthèse = l'atelier, figé.

## 8. Knowledge Map

```text
IDÉES         solide · vue · perspective cavalière · patron
PROPRIÉTÉS    la face avant garde ses mesures · le prisme a deux bases identiques
              la bande du cylindre a pour longueur le périmètre de la base
MÉTHODES      lire les trois vues · associer un solide à ses vues · construire un patron
À MÉMORISER   ⭐ la bande du cylindre : longueur = périmètre du disque (2 × π × r)
              ⭐ trois vues valent mieux qu'une : une seule ne détermine pas le solide
```

Chaîne du brief, restreinte au périmètre : `solide → représentation → patron → dimensions`.

| module | items |
|---|---|
| 1 | `solide-usuel`, `vue` |
| 2 | `perspective-cavaliere`, `fuyante` |
| 3 | `trois-vues`, `associer-vues` |
| 4 | `patron-prisme`, `deux-bases` |
| 5 | `patron-cylindre`, `bande-perimetre`, `mem-bande` |
| 6 | `dimensions-solide`, `mem-trois-vues` |

Toutes les briques vivent dans le tableau littéral `steps`.

## 9. `priorKnowledge`

```js
priorKnowledge: ['face-solide', 'arete', 'sommet-solide', 'patron-solide', 'perimetre', 'figures-planes-usuelles'],
```

Tous viennent de la 6e (`solides-patrons`, `figures-planes`). Le module 0 les diagnostique — et
rien d'autre. `perimetre` est indispensable : la bande du cylindre en dépend.

### Note lexique

`perspective-cavaliere`, `trois-vues` et `arete-cachee` sont étiquetés **3e** dans
`scripts/audit/lexicon.json`, alors que le référentiel 2026 les place en **5e**. Le lexique
précède la réforme. Deux voies : (a) re-étiqueter ces termes en `5e` — correction de fond, à
faire ; (b) s'assurer que chaque terme apparaît d'abord en **position d'enseignement** (une
brique), ce qui suffit à l'audit. On fait **(a) et (b)** : le lexique est corrigé (il décrit le
programme, il ne doit pas mentir), et les briques précèdent les demandes de toute façon.

## 10. Visual Quality (exigence renforcée du brief)

C'est la famille où le visuel est central. Règles dures :

- **Aucune étiquette sur une arête** : les noms de sommets sont placés radialement vers
  l'extérieur depuis le centre projeté, avec passe de dé-chevauchement (l'algorithme de
  `SolidTurner`, dont le décalage fixe avait justement produit 16 collisions sur 468 orientations).
- **Aucune annotation coupée** : le viewBox est ajusté au dessin **plus** ses étiquettes.
- **Aucune flèche ambiguë** : une cote va d'un point nommé à un point nommé.
- **Aucun texte illisible** : jamais `text-[10px]`/`[11px]`.
- **Aucun diagramme minuscule** : largeur minimale garantie, défilement interne plutôt que
  rétrécissement.
- Vérification par **balayage** de toute la plage de rotation en e2e (`textCollisions`,
  `svgOverflow`), jamais un échantillon.
- Testé à **375 / 768 / 1440 px**.

## 11. Mobile & accessibilité

- Rotation : glisser **et** boutons ±15°, plus flèches clavier.
- Dépliage : glisser **et** curseur tapable ; tout état atteignable au clavier.
- `aria-label` énonçant la lecture (« Prisme droit, tourné de 30 degrés, 3 arêtes cachées »).
- `pointerEvents: 'none'` sur tout décor SVG frère d'une zone tactile.
- `useReducedMotion` : le dépliage devient instantané, la logique inchangée.
- Densité ≤ ~52 nœuds interactifs.

## 12. Fichiers

```text
apps/web/src/lessons/common/components/
├── SolidTurner.jsx        ← PROMU depuis la 3e
└── ViewsPanel.jsx         ← PROMU depuis la 3e

apps/web/src/lessons/college/5e/espace_geometrie/representations-espace-5e/
├── lesson.config.js · knowledge.jsx · moduleContext.js · index.jsx · routes.jsx
├── components/
│   ├── espace5e.js         ← cylindre, prisme, patrons (+ périmètre exécutable)
│   ├── espace5e.test.js
│   ├── PatronPrismeLab.jsx ← M4
│   └── BandeCylindreLab.jsx← M5, interaction signature
└── modules/Module00…Module07*.jsx
```

## 13. Definition of Done

1. `npm run validate:lessons` — 0 erreur nouvelle, 6/6 LP couverts.
2. `npm run check:lessons` — les six gardes.
3. `npm test` — les invariants du §6.
4. e2e `apps/web/e2e/lesson-kit/5e-representations-espace.mjs` : parcours des 8 modules, briques,
   carte cumulative, **balayage de collisions sur toute la rotation**, aux trois largeurs.
5. `status: 'available'`.
6. Relecture de périmètre : aucun volume, aucune sphère, aucune pyramide, aucun cône.
