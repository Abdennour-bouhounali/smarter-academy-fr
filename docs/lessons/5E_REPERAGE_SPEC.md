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
prononcé qu'au **module 2**, après que l'élève a constaté au module 1 **qu'un seul nombre ne
suffit plus**.

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
| M1 | Le zéro n'est pas « le début » | chercher l'origine à gauche de la droite | M1, M2 (l'origine O comme croisement) |
| M2 | −3 « plus grand » que −1 (valeur absolue) | placer −3 à droite de −1 | **hors objet** — traité par `nombres-relatifs-5e` M3 ; ici seulement diagnostiqué (M0) |
| M3 | Compter les graduations au lieu de lire l'échelle | lire 3 là où le pas vaut 0,5 | **M6** |
| M4 | Échanger les deux coordonnées | placer (−2 ; 5) là où va (5 ; −2) | **M4** — interaction signature (le fantôme) |
| M5 | Croire que le signe de x commande la hauteur | confondre les rôles des deux axes | M2 (un curseur par axe), M3 |
| M6 | Ranger de force dans un quadrant un point situé sur un axe | « (0 ; 3) est dans le quadrant 1 » | **M5** |

## 6. Mathematical Model — `components/reperageUtils.js`

Source de vérité unique. **Aucun module n'écrit un couple en dur** : tout vient d'ici.

```js
// ── Périmètre (exécutable) ────────────────────────────────────────────
export function point(x, y, ...rest)        // throw si une 3e composante est passée

// ── Droite graduée (abscisse relative — RAPPEL, pas l'objet de la leçon) ──
export function snapAbscissa(a, step)        // pas 1 ; 0,5 puis 2 au module 6
export function formatAbscissa(a)            // « −3 », « 2,5 » — moins typographique U+2212

// ── L'ambiguïté du module 1 (le cœur du déclencheur) ──────────────────
export function sharingAbscissa(x, lieux)    // tous les lieux de cette colonne
export function isAmbiguous(x, lieux)        // vrai ssi >= 2 lieux la partagent
export const AMBIGU                          // la paire de lieux garantie ambiguë (unit-testée)

// ── Plan : quadrants, lecture, placement ──────────────────────────────
export function quadrantOf({ x, y })        // 1..4, 'axe-x', 'axe-y', 'origine'
export function describeQuadrant(q)         // « en haut à droite », « sur l'axe des abscisses »…
export function signsOf({ x, y })           // { sx: '+'|'−'|'0', sy: … }
export function samePoint(a, b, eps)
export function swap({ x, y })              // (x;y) -> (y;x) — le piège M4
export function swapLandsElsewhere(p)       // false ssi x === y : le contre-exemple honnête
export function formatCoords({ x, y })      // « (−2 ; 5) » — espaces fines, point-virgule FR

// ── Saisie élève ──────────────────────────────────────────────────────
export function parseSigned(str)   // accepte « - », « − » (U+2212), la virgule, les espaces fines

// ── Données de la leçon ───────────────────────────────────────────────
export const DOMAINE        // fenêtre du repère : xMin −6, xMax 6, yMin −4, yMax 4
export const LIEUX          // lieux nommés du domaine, coordonnées relatives
export const CIBLES         // points-cibles des exercices de placement
```

### Invariants (unit-testés)

1. `swap(swap(p)) === p`.
2. `swapLandsElsewhere(p) === false` **ssi** `p.x === p.y` — la leçon ne peut donc pas prétendre
   que l'échange déplace toujours le point (mémoire `visual_invariant_rule` : ne jamais affirmer
   ce que le dessin contredit).
3. `quadrantOf` renvoie un cas d'axe dès que `x === 0` ou `y === 0` — un point sur un axe
   **n'est dans aucun quadrant**, et la leçon le dit (M5).
4. `AMBIGU` désigne **réellement** deux lieux de même abscisse et d'ordonnées différentes : le
   déclencheur du M1 ne peut pas mentir sur son ambiguïté.
5. Tout `LIEUX`/`CIBLES` tient dans `DOMAINE` (garde de cadrage : aucun point hors fenêtre).
6. `LIEUX` couvre les **quatre** quadrants **et** au moins un point sur chaque axe (sinon M3 et M5
   n'auraient pas de matière honnête).
7. `formatAbscissa` / `formatCoords` utilisent le moins typographique U+2212 et le point-virgule
   français — et `parseSigned` les accepte (voir §12), aller-retour testé.

## 7. Representation Model

| Registre | Composant | Rôle |
|---|---|---|
| Droite graduée | `NumberLineLab` (5e voisin, réutilisé tel quel) | rappel de l'abscisse (M1, M6) |
| Plan repéré | `CoordPlane` (commun, 4 quadrants) | coordonnées, quadrants |
| Écriture | `formatCoords` | le couple `(x ; y)` |
| Langue | `describeQuadrant` | « en haut à gauche » |

Les quatre registres sont **synchronisés** : bouger le point met à jour l'écriture et la phrase.

## 8. Module Architecture (7 modules, 57 min)

| # | slug | titre | stage | LP | min |
|---|---|---|---|---|---|
| 0 | `mission-de-depart` | Mission de départ | `prerequisite_check` | — | 4 |
| 1 | `un-seul-nombre-suffit-il` | Un seul nombre suffit-il ? | `trigger` | P1, P3 | 9 |
| 2 | `deux-nombres-un-endroit` | Deux nombres, un endroit | `discovery` | P3, P4 | 9 |
| 3 | `lire-un-point` | Lire un point | `manipulation` | P4 | 8 |
| 4 | `placer-sans-echanger` | Placer sans échanger | `manipulation` | P5 | 9 |
| 5 | `sur-un-axe-ou-nulle-part` | Sur un axe, ou nulle part | `discovery` | P3, P4 | 6 |
| 6 | `le-plan-du-domaine` | Le plan du domaine | `practice_lab` | P2, P5 | 8 |
| 7 | `mission-finale-le-domaine` | 🏆 Mission finale : le domaine | `evaluation` | — | 12 |

**Somme = 65 min.** `durationMinutes` du catalogue = 55, tolérance ±10 → conforme (§13).

Couverture LP : P1 (M1) · P2 (M6) · P3 (M1,M2,M5) · P4 (M2,M3,M5) · P5 (M4,M6). Complète.

> La droite graduée n'occupe plus qu'une **rampe** (M1, étapes 1–2) au lieu de trois modules :
> c'est la conséquence directe du §3.2.

### M1 — Un seul nombre suffit-il ? · `trigger`

**Manipulation signature — le module ouvre sur le lab** (règle `m1_lab_first_no_prediction_gate`),
et le lab pose d'emblée **le problème de la leçon**, pas une révision.

Une carte du domaine, et **une seule règle graduée horizontale** sous la carte. L'élève doit
indiquer où se trouve un chalet en ne bougeant qu'un curseur sur cette règle. Il y arrive… et
**deux chalets différents tombent sur le même nombre** : l'un en haut de la piste, l'autre en bas.

- Geste : glisser le curseur (drag + flèches, tap sur les graduations).
- Conséquence immédiate : un **halo** s'allume sur *tous* les lieux qui partagent cette abscisse.
- Découverte : *« ce nombre ne désigne pas un endroit, il désigne toute une colonne »*.
- `PredictionChips` optionnel **à l'intérieur** du lab (« combien de lieux vont s'allumer ? »).
- Étapes 1–2 : rappel actif de l'abscisse relative (brique `abscisse` en `variant="rappel"`) —
  révision, pas enseignement.
- Étape 3 : le constat d'ambiguïté. Brique `deuxieme-dimension` (nouveau).

C'est la même figure de style que le M1 de `operations-5e` (le ticket ambigu) : **la leçon commence
par un manque**, et la notation arrivera comme la réponse à ce manque.

### M2 — Deux nombres, un endroit · `discovery`

On ajoute l'axe vertical. Le second nombre lève l'ambiguïté du M1 : le halo se réduit à **un seul
point**. C'est ici que le mot **repère** est prononcé, et seulement ici.

- L'élève déplace un point avec **deux** curseurs séparés (un par axe) : un curseur → un seul
  déplacement, jamais les deux (INTERACTION_PEDAGOGY §8, une variable à la fois).
- Briques `repere`, `axes-origine`, `coordonnees`.

### M3 — Lire un point · `manipulation`

Lecture dans les quatre quadrants sur `CoordPlane`. Guides pointillés **dérivés** du point (jamais
dessinés en dur). Traite M5 (le signe de x ne commande pas la hauteur).
Briques `quadrant`, `lire-un-point` (méthode).

### M4 — Placer sans échanger · `manipulation`

L'interaction signature du piège M4 (échanger les coordonnées) : l'élève place `(−2 ; 5)`, et un
**fantôme** montre où serait `(5 ; −2)`. Les deux coexistent à l'écran — c'est la comparaison qui
enseigne, pas la correction.

Cas honnête : si `x === y`, le fantôme se superpose ; `swapLandsElsewhere` le sait et le module le
**dit** au lieu de prétendre le contraire (invariant §6.2).

Briques `ordre-du-couple`, `placer-un-point` (méthode), `mem-couple` (à mémoriser).

### M5 — Sur un axe, ou nulle part · `discovery`

Module court. Un point dont une coordonnée est nulle **n'est dans aucun quadrant** — il est *sur*
un axe. C'est le cas-limite que les élèves rangent de force dans un quadrant, et il vaut mieux le
traiter explicitement que le laisser comme distracteur.

Traite M6. Brique `sur-un-axe`.

### M6 — Le plan du domaine · `practice_lab`

Transfert : lire et placer sur une carte dont **l'échelle n'est pas 1** (pas de 0,5, puis de 2).
Traite M3 (compter les graduations ≠ lire l'échelle) — LP P2 (placer une abscisse donnée) y est
consolidé sur les deux axes. Brique `echelle-graduation`.

### M7 — Mission finale · `evaluation`

`BossFinal`, 10 épreuves QCM, distracteurs = les six erreurs du §5. Synthèse = la carte du
domaine, figée.

## 9. Knowledge Map

```text
IDÉES            abscisse (rappel) · deuxième dimension · repère · coordonnées · quadrant
PROPRIÉTÉS       le couple est ordonné · les axes se coupent en O · une coordonnée nulle = sur un axe
MÉTHODES         lire un point · placer un point · lire l'échelle d'un axe
À MÉMORISER      ⭐ (x ; y) : d'abord horizontal, puis vertical
                 ⭐ un point sur un axe n'est dans aucun quadrant
```

Chaîne demandée par le brief : `droite graduée → abscisse → repère → coordonnées`. Respectée —
`abscisse` (M1, rappel) → `deuxieme-dimension` (M1) → `repere` (M2) → `coordonnees` (M2).

| module | items |
|---|---|
| 1 | `abscisse` (rappel), `deuxieme-dimension` |
| 2 | `repere`, `axes-origine`, `coordonnees` |
| 3 | `quadrant`, `lire-un-point` (méthode) |
| 4 | `ordre-du-couple`, `placer-un-point` (méthode), `mem-couple` |
| 5 | `sur-un-axe`, `mem-sur-un-axe` |
| 6 | `echelle-graduation` |

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
(état A, puis rappel juste-à-temps), et la brique M1 doit donc être `variant="rappel"`. Elle
n'établit rien de neuf — la seule brique `variant="new"` du M1 est `deuxieme-dimension`.

`nombres-relatifs-5e` étant la leçon voisine et **déjà livrée**, le module 0 peut légitimement
supposer les relatifs : c'est un prérequis inter-leçons du même niveau, pas une fuite.

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
│   ├── DomaineLab.jsx        ← manipulation signature M1 (colonne ambiguë)
│   └── PointPlacer.jsx       ← lecture/placement + fantôme M5–M6
└── modules/Module00…Module07*.jsx
```

## 16bis. Écarts assumés entre le spec et le code livré

- **Le stage du module 5** est `manipulation` et non `discovery` : les stages doivent être
  non décroissants dans l'ordre du parcours (M3 et M4 sont déjà `manipulation`), et le
  validateur le contrôle. Le contenu du module est inchangé.
- **`DomaineLab` remplace `CableLab`** (voir §3.2) : le geste porte l'ambiguïté d'une colonne,
  pas la lecture d'une hauteur.

## 17. Definition of Done

1. `npm run validate:lessons` — 0 erreur nouvelle.
2. `npm run check:lessons` — les six gardes.
3. `npm test` — les invariants du §6 et `parseSigned`.
4. e2e `apps/web/e2e/lesson-kit/5e-reperage.mjs` : parcours des 8 modules, briques, carte
   cumulative, balayage de collisions aux trois largeurs.
5. `status: 'available'`.
6. Relecture de périmètre : aucune coordonnée dans l'espace, aucune distance oblique.
