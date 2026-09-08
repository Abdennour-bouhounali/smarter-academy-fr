# 5e — Repérage sur une droite et dans le plan — Design Spec

> Contrat de conception. Toute déviation pendant l'implémentation exige de modifier
> ce document d'abord (LESSON_DESIGN_PLAYBOOK §15.3).

## 1. Lesson Identity

| | |
|---|---|
| Catalogue key | `5e_reperage` |
| `LESSON_CONFIG.id` | `reperage-5e` |
| Dossier | `apps/web/src/lessons/college/5e/espace_geometrie/reperage-5e/` |
| Chapitre | `espace_geometrie` — Espace et géométrie |
| Durée catalogue | 55 min (`durationMinutes`) |
| Emoji | 📍 |
| Difficulté | Facile |

## 2. Curriculum Contract (référentiel officiel 2026)

`levels.5e.domains.espace_geometrie.official_objects.reperage` :

- **description** : « Utiliser les coordonnées et les repères pour localiser des points et
  raisonner dans le plan. »
- **prerequisites** : Repérage en 6e · Nombres relatifs
- **include** :
  - Abscisse d'un point (relatifs)
  - Coordonnées dans le plan (repère orthogonal avec positifs et négatifs)
- **exclude** :
  - **Coordonnées dans l'espace**

### Périmètre exécutable

Le `exclude` n'est pas un commentaire : `reperageUtils.js` **lève une exception** si on lui
demande un point à trois composantes (mémoire `perimetre_executable_lecon`).

```js
export function point(x, y, ...rest) {
  if (rest.length) throw new Error('reperage-5e : hors périmètre — pas de coordonnées dans l’espace (3D réservée au lycée)');
  …
}
```

Sont également hors périmètre, et pour la même raison **non traités** (pas seulement non
mentionnés) : équation de droite, coefficient directeur, distance entre deux points quelconques
(exige Pythagore, 4e), latitude/longitude.

### Learning Points (dérivés de `coursesData.js`, ordre contraignant)

| id | intitulé |
|---|---|
| `5e_reperage-5e_P1` | Lire l'abscisse d'un point, positive ou négative |
| `5e_reperage-5e_P2` | Placer un point d'abscisse donnée sur une droite graduée |
| `5e_reperage-5e_P3` | Identifier les axes et l'origine d'un repère du plan |
| `5e_reperage-5e_P4` | Lire les coordonnées d'un point dans les quatre quadrants |
| `5e_reperage-5e_P5` | Placer un point à partir de ses coordonnées |

## 3. Ce qui distingue cette leçon de ses voisines

### 3.1 Les trois « repérages » du dépôt

| | 6e `reperage-plan` | **5e `reperage-5e`** | 3e `reperage-droite-plan-3e` |
|---|---|---|---|
| nombres | entiers positifs | **relatifs (et décimaux simples)** | relatifs et décimaux |
| plan | quadrillage, cases **et** nœuds | **repère à 4 quadrants** | 4 quadrants |
| au-delà | trajets sur quadrillage | — | longueurs, milieu, figures, symétries |

### 3.2 La frontière critique : `nombres-relatifs-5e` (leçon voisine, DÉJÀ LIVRÉE)

⚠️ **Contrainte de conception la plus forte de cette leçon.** La leçon `nombres-relatifs-5e`
existe déjà dans le même niveau et son `teachingScope.include` contient :

> « Lire et placer un relatif sur une droite graduée » · « Comparer et ranger des relatifs
> (l'ordre suit la droite graduée) »

Elle le fait avec `ElevatorLab` (cabine verticale, le sol = zéro) au module 1, `NumberLineLab`
(la même droite couchée) au module 2, et « pourquoi −2 est plus grand que −7 » au module 3.

**Conséquence : une manipulation « téléphérique » qui ferait glisser une cabine le long d'un axe
signé serait un doublon de l'ascenseur du parking** — le geste, la découverte et le trait de zéro
seraient les mêmes. C'est exactement le piège « réutiliser l'architecture, jamais les maths »
(mémoire `cross_level_inspiration_6e_3e`), ici entre deux leçons du **même** niveau.

**Partage du travail, décidé ici :**

| | `nombres-relatifs-5e` | `reperage-5e` (cette leçon) |
|---|---|---|
| objet | le **nombre** relatif | le **point** et sa position |
| droite graduée | on y *construit* le sens du signe | acquise, on s'en **sert** pour repérer |
| question centrale | « combien vaut ce nombre, et lequel est le plus grand ? » | « **où** est ce point, et comment le dire à quelqu'un ? » |
| apport propre | signe, opposé, ordre, addition | **la deuxième dimension** : le couple ordonné |

> **La 5e « repérage » apporte exactement une chose : qu'un seul nombre ne suffit plus.**
> L'abscisse relative est un **prérequis** de cette leçon (`priorKnowledge`), pas son objet —
> elle est révisée en deux étapes, jamais réenseignée en trois modules.

Conséquence directe sur l'architecture : la partie « droite graduée » passe de 3 modules à
**1 seul** (M1), qui sert de **rampe** et non de découverte, et le poids bascule sur le plan
(M2 à M5). Le fil narratif abandonne la cabine sur un câble — trop proche de l'ascenseur — pour
**une carte de domaine skiable**, où le problème est de *désigner un endroit*, pas de mesurer une
hauteur.

## 4. Pedagogical Vision

Progression imposée par le brief, et qui est aussi la dépendance mathématique réelle :

```text
position → droite graduée → abscisse → placement
        → deux dimensions → repère → coordonnées → lecture → placement
```

Aucun module n'ouvre sur une définition de repère (CLAUDE.md §4). Le mot « repère » n'est
prononcé qu'au module 4, après que l'élève a constaté **qu'un seul nombre ne suffit plus**.

### Le fil narratif : la carte du domaine skiable

Un domaine de montagne, et une **carte** qu'on doit savoir lire pour se donner rendez-vous. Le
chalet d'accueil est le point de référence : c'est lui le zéro. La question de toute la leçon
n'est jamais « quelle altitude ? » (ce serait la leçon des relatifs) mais **« comment dire à
quelqu'un exactement où se trouver ? »** — c'est-à-dire : combien de nombres faut-il, dans quel
ordre, et à partir d'où.

Le fil est repris **figé** dans la synthèse du boss (convention du dépôt).

## 5. Cognitive Challenges & Misconceptions

| # | Difficulté | Erreur typique | Où elle est traitée |
|---|---|---|---|
| M1 | Le zéro n'est pas « le début » | chercher l'origine à gauche de la droite | M1, M2 |
| M2 | −3 « plus grand » que −1 (valeur absolue) | placer −3 à droite de −1 | M2, brique `abscisse-negative` |
| M3 | Compter les graduations au lieu de lire l'échelle | lire 3 là où le pas vaut 0,5 | M3 |
| M4 | Échanger les deux coordonnées | placer (−2 ; 5) là où va (5 ; −2) | M5, M6 — interaction signature |
| M5 | Croire que le signe de x commande la hauteur | confondre les rôles des deux axes | M5 |
| M6 | Deux points d'un même quadrant ont « le même signe » | généraliser sans vérifier | M6 |

## 6. Mathematical Model — `components/reperageUtils.js`

Source de vérité unique. **Aucun module n'écrit un couple en dur** : tout vient d'ici.

```js
// ── Périmètre (exécutable) ────────────────────────────────────────────
export function point(x, y, ...rest)        // throw si une 3e composante est passée

// ── Droite graduée (abscisse relative) ────────────────────────────────
export function readAbscissa(px, { origin, unitPx })   // px écran -> abscisse
export function snapAbscissa(a, step)                   // pas 1 ; 0,5 au module 3
export function compareAbscissa(a, b)                   // -1 | 0 | 1 — l'ordre, pas la distance
export function isLeftOf(a, b)
export function formatAbscissa(a)                       // « −3 », « 2,5 » — moins typographique U+2212

// ── Plan : quadrants, lecture, placement ──────────────────────────────
export function quadrantOf({ x, y })        // 1..4, 'axe-x', 'axe-y', 'origine'
export function describeQuadrant(q)         // « en haut à droite », « sur l'axe des abscisses »…
export function signsOf({ x, y })           // { sx: '+'|'−'|'0', sy: … }
export function samePoint(a, b, eps)
export function swap({ x, y })              // (x;y) -> (y;x) — le piège M4
export function swapLandsElsewhere(p)       // false ssi x === y : le contre-exemple honnête
export function formatCoords({ x, y })      // « (−2 ; 5) » — espaces fines, point-virgule FR

// ── Données de la leçon ───────────────────────────────────────────────
export const CABLE          // droite graduée du téléphérique : min −6, max 6, pas 1
export const STATIONS       // repères nommés du domaine, coordonnées relatives
export const FIGURES        // points-cibles des exercices de placement
```

### Invariants (unit-testés)

1. `swap(swap(p)) === p`.
2. `swapLandsElsewhere(p) === false` **ssi** `p.x === p.y` — la leçon ne peut donc pas prétendre
   que l'échange déplace toujours le point (mémoire `visual_invariant_rule` : ne jamais affirmer
   ce que le dessin contredit).
3. `quadrantOf` renvoie un cas d'axe dès que `x === 0` ou `y === 0` — un point sur un axe
   **n'est dans aucun quadrant**, et la leçon le dit.
4. `compareAbscissa` est cohérent avec l'ordre des relatifs : `−3 < −1 < 0 < 2`.
5. Aucune donnée de `STATIONS`/`FIGURES` hors de la fenêtre du repère (garde de cadrage).
6. `formatAbscissa` / `formatCoords` utilisent le moins typographique U+2212 et le point-virgule
   français — et le parseur de saisie les accepte (voir §12).

## 7. Representation Model

| Registre | Composant | Rôle |
|---|---|---|
| Droite graduée | `NumberLineLab` (5e, existant) ou `RealLine` | abscisse, signe, ordre |
| Plan repéré | `CoordPlane` (commun, 4 quadrants) | coordonnées, quadrants |
| Écriture | `formatCoords` | le couple `(x ; y)` |
| Langue | `describeQuadrant` | « en haut à gauche » |

Les quatre registres sont **synchronisés** : bouger le point met à jour l'écriture et la phrase.

## 8. Module Architecture (7 modules, 55 min)

| # | slug | titre | stage | LP | min |
|---|---|---|---|---|---|
| 0 | `mission-de-depart` | Mission de départ | `prerequisite_check` | — | 4 |
| 1 | `le-cable-du-telepherique` | Le câble du téléphérique | `trigger` | P1 | 8 |
| 2 | `au-dessus-au-dessous` | Au-dessus, au-dessous | `discovery` | P1, P2 | 9 |
| 3 | `placer-sur-le-cable` | Placer sur le câble | `manipulation` | P2 | 8 |
| 4 | `un-nombre-ne-suffit-plus` | Un nombre ne suffit plus | `discovery` | P3 | 9 |
| 5 | `lire-un-point` | Lire un point | `manipulation` | P4 | 8 |
| 6 | `placer-sans-echanger` | Placer sans échanger | `practice_lab` | P5, P4 | 9 |
| 7 | `mission-finale-la-station` | 🏆 Mission finale : la station | `evaluation` | — | 12 |

Somme = 67 min. **Contrainte** : `estimatedDurationMin` doit rester à ≤ 10 min de
`durationMinutes` (55). → cible **57 min** : 4+7+8+7+8+7+8+8. Ajusté au §13.

Couverture LP : P1 (M1,M2) · P2 (M2,M3) · P3 (M4) · P4 (M5,M6) · P5 (M6). Complète.

### M1 — Le câble du téléphérique · `trigger`

**Manipulation signature (règle M1 : le module ouvre sur le lab, pas sur une prédiction).**
La cabine se **glisse** le long du câble vertical. La station est marquée 0. L'élève fait monter
et descendre la cabine et lit, à côté, le nombre affiché.

- Geste : glisser la cabine (drag), + flèches clavier (§10.1 tap-first).
- Conséquence : le nombre change de signe **au passage de la station**, jamais ailleurs.
- Découverte : *« le signe dit de quel côté du zéro on est »*.
- `PredictionChips` **à l'intérieur** du lab, facultatif, sans verdict (mémoire
  `m1_lab_first_no_prediction_gate`).
- Brique `abscisse` (rappel 6e : le nombre qui repère) puis `abscisse-negative` (nouveau).

### M2 — Au-dessus, au-dessous · `discovery`

L'ordre des relatifs sur la droite. Le piège M2 (« −3 > −1 ») est traité en **comparant deux
cabines** : celle qui est plus bas a l'abscisse la plus petite, même si son nombre « paraît plus
grand ». Brique `ordre-abscisses`.

### M3 — Placer sur le câble · `manipulation`

Le pas change : la graduation passe à 0,5. L'élève place une abscisse donnée. Traite M3
(compter les graduations ≠ lire l'échelle). Brique `echelle-graduation`.

### M4 — Un nombre ne suffit plus · `discovery`

**Le pivot de la leçon.** Deux cabanes du domaine ont la *même hauteur* : un seul nombre ne les
distingue pas. L'élève constate l'ambiguïté avant qu'on nomme quoi que ce soit — c'est la même
figure de style que le module 1 de `operations-5e` (le ticket ambigu). Puis on ajoute le second
axe, et le mot **repère** arrive. Briques `repere`, `axes-origine`.

### M5 — Lire un point · `manipulation`

Lecture dans les quatre quadrants sur `CoordPlane`. Guides pointillés dérivés du point.
Briques `coordonnees`, `quadrant`.

### M6 — Placer sans échanger · `practice_lab`

L'interaction signature du piège M4 : l'élève place `(−2 ; 5)`, et un **fantôme** montre où
serait `(5 ; −2)`. Les deux points coexistent à l'écran — c'est la comparaison qui enseigne, pas
la correction. Brique `ordre-du-couple` + `mem-couple` (à mémoriser).

Cas honnête : si `x === y`, le fantôme se superpose ; `swapLandsElsewhere` le sait et le module
le **dit** au lieu de prétendre le contraire.

### M7 — Mission finale · `evaluation`

`BossFinal`, 10 épreuves QCM, distracteurs = les six erreurs du §5. Synthèse = le domaine de la
station, figé.

## 9. Knowledge Map

```text
IDÉES            droite graduée · abscisse · repère · coordonnées · quadrant
PROPRIÉTÉS       l'ordre des abscisses · le couple est ordonné · les axes se coupent en O
MÉTHODES         lire une abscisse · placer une abscisse · lire un point · placer un point
À MÉMORISER      ⭐ (x ; y) : d'abord horizontal, puis vertical
                 ⭐ le signe dit le côté du zéro
```

Chaîne demandée par le brief : `droite graduée → abscisse → repère → coordonnées`. Respectée
(M1→M2 pour les deux premières, M4 pour `repere`, M5 pour `coordonnees`).

| module | items |
|---|---|
| 1 | `abscisse`, `abscisse-negative` |
| 2 | `ordre-abscisses` |
| 3 | `echelle-graduation`, `lire-placer-abscisse` (méthode) |
| 4 | `repere`, `axes-origine` |
| 5 | `coordonnees`, `quadrant`, `lire-un-point` (méthode) |
| 6 | `ordre-du-couple`, `placer-un-point` (méthode), `mem-couple` |

Modules 0 et 7 ne contribuent rien (diagnostic / évaluation).

**Toutes les briques vivent dans le tableau littéral `steps`** (mémoire
`knowledge_bricks_must_live_in_steps`) — jamais dans un composant auxiliaire, sinon l'audit ne
les voit pas.

## 10. `priorKnowledge` et dépendances

```js
priorKnowledge: ['abscisse', 'lecture-quadrillage', 'nombres-relatifs', 'ordre-nombres', 'calcul-numerique'],
```

`abscisse` vient de la 6e (lexique) ; `nombres-relatifs` est la leçon voisine de 5e, déjà livrée.
Le module 0 diagnostique **ces cinq-là et rien d'autre**.

⚠️ `abscisse` est à la fois `priorKnowledge` **et** posé par une brique au M1 : c'est légitime
(état A puis rappel), mais la brique M1 doit être `variant="rappel"` pour `abscisse` et
`variant="new"` pour `abscisse-negative`.

## 11. Error & Feedback Strategy

Jamais « Incorrect. ». Chaque retour **diagnostique le geste réellement fait** (le motif
`essai2` de `operations-5e/Module02`) :

- placement à gauche du zéro pour un positif → « tu es du côté des négatifs » ;
- `(5 ; −2)` au lieu de `(−2 ; 5)` → le fantôme, plus « tu as lu le second nombre en premier » ;
- lecture à un pas d'écart → « regarde ce que vaut UNE graduation ici ».

## 12. Saisie numérique — piège connu

`parseFr` est **entier seulement** et `parseDec` refuse le moins typographique U+2212
(mémoires `numericquestion_parsefr_integer_only`, `parsefr_rejects_negatives`). Cette leçon est
pleine de **négatifs et de décimaux**.

> **Règle de la leçon** : toute `NumericQuestion` passe `parse={parseSigned}` et
> `display={formatAbscissa(expected)}`. `parseSigned` accepte `-`, `−`, la virgule et les espaces
> fines. Testé unitairement.

## 13. Contraintes de validation

- `estimatedDurationMin` = somme des `estimatedMin`, à ≤ 10 min de `durationMinutes` (55).
- Stages dans l'ordre du parcours ; `evaluation` en dernier.
- Ids LP en **littéraux** (le validateur les lit statiquement).
- `status: 'available'` en fin de chantier (mémoire `lesson_status_always_available`).
- Route enregistrée dans `App.jsx` sinon `check:routes` échoue et la leçon tombe en page d'accueil
  (mémoire `unrouted_lessons_silent_failure`).
- Progression non bloquante : `onAnswered={() => setQn(true)}`, jamais `if (ok)`.
- **Aucune manipulation gelée après validation** (mémoire `frozen_manipulation_bug_class`) :
  interdiction de `disabled={…done}` sur un lab.

## 14. Accessibilité & mobile

- Cibles ≥ 44 px ; drag doublé de flèches clavier + Home/End.
- `aria-label` français énonçant la **lecture** : « Cabine à l'abscisse moins trois ».
- `pointerEvents: 'none'` sur tout décor SVG frère d'une zone tactile.
- Testé à 375 / 768 / 1440 px ; jamais de scroll horizontal de page.
- `useReducedMotion` respecté.

## 15. Visual quality (exigence renforcée du brief)

- Aucune étiquette sur un axe ou une graduation ; placement dérivé, jamais un offset fixe.
- viewBox ajusté au dessin **plus ses étiquettes** (mémoire `svg_illustration_vs_manipulable`).
- Balayage de tout l'intervalle atteignable en e2e (`textCollisions`, `svgOverflow`) — jamais un
  échantillon (mémoire `3e_geometrie_build`).
- Jamais `text-[10px]`/`[11px]` (mémoire `typography_scale_100_zoom`).

## 16. Fichiers

```text
apps/web/src/lessons/college/5e/espace_geometrie/reperage-5e/
├── lesson.config.js
├── knowledge.jsx
├── moduleContext.js
├── index.jsx
├── routes.jsx
├── components/
│   ├── reperageUtils.js
│   ├── reperageUtils.test.js
│   ├── CableLab.jsx          ← manipulation signature M1–M3
│   └── PointPlacer.jsx       ← lecture/placement + fantôme M5–M6
└── modules/Module00…Module07*.jsx
```

## 17. Definition of Done

1. `npm run validate:lessons` — 0 erreur nouvelle.
2. `npm run check:lessons` — les six gardes.
3. `npm test` — les invariants du §6 et `parseSigned`.
4. e2e `apps/web/e2e/lesson-kit/5e-reperage.mjs` : parcours des 8 modules, briques, carte
   cumulative, balayage de collisions aux trois largeurs.
5. `status: 'available'`.
6. Relecture de périmètre : aucune coordonnée dans l'espace, aucune distance oblique.
