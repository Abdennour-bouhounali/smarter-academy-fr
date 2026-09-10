# 5e — Parallélogrammes — spécification de conception

Objet officiel : `5e / espace_geometrie / parallelogrammes` (BO n°10 du 5 mars 2026).
Clé catalogue : `5e_parallelogrammes` · id leçon : `parallelogrammes-5e`.

> **Périmètre (du JSON officiel, non négociable)**
> `include` : définition et construction du parallélogramme · propriétés (côtés opposés,
> diagonales) · parallélogrammes particuliers (rectangle, losange, carré).
> `exclude` : **les vecteurs**.
> `prerequisites` : Parallélisme · Quadrilatères.
>
> Le `exclude` est **exécutable** (mémoire `perimetre_executable_lecon`) : `components/paral.js`
> LÈVE si on lui demande une translation par un vecteur nommé, et le test le vérifie. Aucune
> translation, aucune notation vectorielle, aucun `\vec{AB}` — cela appartient à la 4e
> (`4e_parallelogrammes_translations`, déjà au catalogue).

---

## §23 — Le processus de décision, répondu avant toute JSX

| Étape | Réponse |
|---|---|
| **1. Concept exact** | Un parallélogramme est un quadrilatère dont les côtés opposés sont **parallèles deux à deux**. De cette seule définition découlent, et ne sont donc jamais des définitions concurrentes : côtés opposés de même longueur, angles opposés égaux, diagonales qui se coupent en leur milieu. Chacune de ces propriétés est aussi une **caractérisation** — elle suffit à conclure. LP : `5e_parallelogrammes-5e_P1..P6`. |
| **2. Misconception** | Quatre, hiérarchisées. **(a)** « un parallélogramme, c'est un rectangle penché » — l'élève croit qu'il faut des angles droits, ou refuse d'appeler « parallélogramme » un rectangle. **(b)** « les côtés opposés sont égaux **donc** c'est un parallélogramme » appliqué à n'importe quelle paire : deux côtés égaux **quelconques** suffiraient. **(c)** « les diagonales sont égales » confondu avec « les diagonales se coupent en leur milieu ». **(d)** conclure d'un dessin qui *ressemble* au lieu d'invoquer une propriété. |
| **3. Situation réelle** | Le **portail en croisillons** (le portillon accordéon d'un jardin). On l'ouvre, on le ferme : les lattes restent parallèles, les losanges se déforment mais restent des parallélogrammes. Rien n'y est décoratif : c'est exactement un quadrilatère articulé dont les côtés opposés gardent leur longueur et leur direction pendant que les angles changent. |
| **4. Manipulation physique** | L'élève **traîne les sommets** d'un quadrilatère articulé (`QuadLab`). Il ne règle aucun +/− : il déplace A, B, C ou D directement (mémoire `manipulation_interaction_rules`). Quatre témoins (« lampes ») s'allument tout seuls : `AB ∥ DC`, `AD ∥ BC`, `AB = DC`, `AD = BC`. |
| **5. Variable contrôlée** | La **position du quatrième sommet D** (le seul sommet libre au module 1) — donc, mathématiquement, la direction et la longueur du côté (DC) comparées à (AB). Un seul point mobile : §8. |
| **6. Invariant à faire voir** | « **Quand les deux lampes de parallélisme s'allument, les deux lampes d'égalité s'allument au même instant — et il n'y a qu'UNE place pour D.** » C'est la découverte du module 1 : le parallélisme des deux paires n'est pas une condition qu'on ajuste, c'est une position unique, et elle emporte l'égalité des longueurs sans qu'on l'ait demandée. |
| **7. Représentation visuelle** | Le quadrilatère ABCD dessiné dans `GeoScene`, avec les codages usuels : chevrons (`>` / `>>`) sur les côtés parallèles, marques (`|` / `||`) sur les côtés égaux, arcs d'angles, diagonales et leur point d'intersection. Tout est **calculé** depuis les quatre points (invariant visuel : `visual_invariant_rule`). |
| **8. Représentation numérique** | Une table vivante des quatre longueurs et des quatre angles, mesurées sur la figure réellement dessinée. Elle ne dit jamais « égal » : elle affiche `AB = 6,4` et `DC = 6,4` et laisse l'élève lire l'égalité. |
| **9. Représentation symbolique** | Émerge dans cet ordre : `(AB) ∥ (DC)` (M2) → `AB = DC` (M3) → « les diagonales se coupent en leur milieu », donc `O milieu de [AC]` et `O milieu de [BD]` (M4) → l'implication « si … alors ABCD est un parallélogramme » (M5). Aucune notation vectorielle. |
| **10. Disparition de l'étayage** | M1 : les lampes s'allument seules, D est libre. M2 : les lampes restent, mais l'élève doit **construire** la position. M3 : plus de lampes, la table numérique seule. M4 : plus de table, seule la figure et son codage. M5 : plus de figure manipulable — un énoncé, une propriété à choisir. M6 : la figure revient mais l'élève doit décider *quel* parallélogramme particulier. M7 : rien, que la mathématique. |
| **11. Transfert** | M6 (rectangle / losange / carré comme parallélogrammes particuliers, l'arbre des inclusions), M7 (aire = base × hauteur, où « hauteur » n'est **pas** un côté), M8 (test final : configurations non vues, énoncés seuls). |

---

## Progression demandée → modules livrés

La progression demandée par la commande est
`quadrilatère → parallélogramme → propriétés des côtés → propriétés des diagonales →
caractérisations → rectangle / losange / carré → aire → problème complexe`.
Elle est réalisée module par module :

| # | Stage | Titre | Rung de la progression | LP |
|---|---|---|---|---|
| 0 | `prerequisite_check` | Mission de départ | (prérequis : parallélisme, quadrilatères) | — |
| 1 | `trigger` | Le portail qui s'ouvre | quadrilatère → parallélogramme | P1 |
| 2 | `discovery` | La quatrième place | définition · construction | P1 P2 |
| 3 | `manipulation` | Ce que les côtés promettent | propriétés des côtés | P3 |
| 4 | `manipulation` | Le point où tout se croise | propriétés des diagonales | P4 |
| 5 | `practice_lab` | Quelle propriété me permet de conclure ? | caractérisations · démonstration | P6 |
| 6 | `practice_lab` | La famille des parallélogrammes | rectangle / losange / carré | P5 |
| 7 | `practice_lab` | L'aire, et le piège de la hauteur | aire | P3 |
| 8 | `evaluation` | 🏆 Mission finale | problème complexe | P1–P6 |

`estimatedDurationMin` = 5+11+11+10+10+10+9+8+7 = **78 min** (le module 0 est passé à 5 min
quand trois prérequis de plus y sont entrés — voir plus bas). C'est sous le plafond de 90
(`MAX_LESSON_MINUTES`), et la durée catalogue est alignée à 78 pour rester dans les ±10 min
qu'exige `smarter:validate-curriculum`. Voir « Ajustements du catalogue ».

---

## §24 — Spécification d'interaction, activité par activité

### M1 · Le portail qui s'ouvre — `QuadLab` (laboratoire signature)

```text
Activity:              traîner le sommet D d'un quadrilatère articulé ABCD
Mathematical objective: découvrir qu'il existe UNE seule position de D pour laquelle les deux
                       paires de côtés opposés sont parallèles — et qu'à cet instant les côtés
                       opposés deviennent aussi égaux, sans qu'on l'ait demandé
Student action:        pointer/glisser la pastille D (clavier : flèches, pas de 8 px)
Controlled variable:   la position de D, donc la direction et la longueur de (DC) face à (AB)
Mathematical state:    {A, B, C, D} ; dérivés : angle((AB),(DC)), angle((AD),(BC)), les quatre
                       longueurs, et le prédicat estParallelogramme(A,B,C,D)
Visual consequence:    quatre lampes (2 parallélisme, 2 égalité) s'allument dès que l'écart passe
                       sous la tolérance ; les chevrons et les marques apparaissent avec elles
Expected observation:  « les quatre lampes s'allument ensemble, et il n'y a qu'une place pour D »
Misconception targeted:(a) il faudrait des angles droits — le portail se déforme sans jamais en
                       avoir ; (b) « côtés égaux » serait indépendant de « côtés parallèles »
Feedback:              jamais « faux » : la lampe éteinte NOMME l'attribut qui manque
                       (« (AD) et (BC) ne sont pas encore parallèles : il s'en faut de 14° »)
Formalization:         brique `parallelogramme` APRÈS la découverte, jamais avant
Scaffolding:           D libre, lampes visibles, tolérance généreuse (2°/2 px de rendu)
Transfert:             le portail en croisillons : trois quadrilatères articulés en même temps
```

### M2 · La quatrième place — `QuadLab` en mode construction
`Student action` : placer D **sans lampes de longueur**, en n'ayant que le parallélisme comme
guide, puis recommencer depuis trois points différents (trois configurations tirées d'une liste
fixe — déterminisme §28). `Expected observation` : « la place de D ne dépend pas de mon coup
d'œil : elle est imposée par A, B et C ». `Formalization` : brique `construire-parallelogramme`.

### M3 · Ce que les côtés promettent — `MesureTable`
`Student action` : déformer le parallélogramme (A, B et C mobiles, D **asservi** — il suit pour
que la figure RESTE un parallélogramme) et chercher un contre-exemple à `AB = DC`.
`Expected observation` : « je n'arrive pas à casser l'égalité ». C'est le motif du contre-exemple
introuvable, déjà éprouvé par `transformations-5e` M4. `Formalization` : briques
`cotes-opposes-egaux` et `angles-opposes-egaux`.

### M4 · Le point où tout se croise — `DiagonalesLab`
`Controlled variable` : les sommets ; `Mathematical state` dérivé : le point d'intersection O des
diagonales, et les quatre longueurs OA, OC, OB, OD. `Expected observation` : « O est toujours au
milieu des DEUX diagonales — mais les deux diagonales n'ont pas la même longueur ». La
misconception (c) est attaquée frontalement : un affichage montre `AC ≠ BD` pendant que
`OA = OC` et `OB = OD`. `Formalization` : brique `diagonales-milieu`.

### M5 · Quelle propriété me permet de conclure ? — `PreuveChoix`
Pas de manipulation de figure : une **configuration codée** (les marques sont données, les
mesures ne le sont pas) et trois propriétés candidates. L'élève choisit **celle qui permet de
conclure**, pas le résultat. Six configurations, dont deux où **aucune** ne conclut (côtés
adjacents égaux ; une seule paire parallèle → trapèze). C'est la demande explicite de la commande
(« RAISONNEMENT »). `Formalization` : brique `caracterisations`.

### M6 · La famille — `FamilleLab`
`Student action` : partir d'un parallélogramme et le pousser vers rectangle / losange / carré en
déplaçant un seul sommet ; deux jauges (« un angle droit ? », « deux côtés consécutifs égaux ? »)
disent où l'on est. `Expected observation` : « le carré est les deux à la fois — et tous restent
des parallélogrammes ». `Formalization` : brique `parallelogrammes-particuliers` + l'arbre
d'inclusions.

### M7 · L'aire — `AireLab`
`Student action` : faire glisser le sommet supérieur du parallélogramme **le long d'une droite
parallèle à la base** (cisaillement) : la base et la hauteur ne bougent pas, l'aire non plus,
mais le côté oblique s'allonge. `Expected observation` : « l'aire ne dépend pas du côté oblique :
elle dépend de la hauteur ». C'est la misconception `base × côté` détruite par le geste, pas par
une phrase. `Formalization` : brique `aire-parallelogramme` (type `formules`).

---

## Carte des connaissances (`knowledgeMap: true`)

La dépendance réelle, qui décide de l'ordre des modules :

```
        parallelogramme (M1)
                 ↓
     construire-parallelogramme (M2)
                 ↓
   cotes-opposes-egaux ─ angles-opposes-egaux (M3)
                 ↓
        diagonales-milieu (M4)
                 ↓
         caracterisations (M5)
            ↓          ↘
parallelogrammes-      aire-parallelogramme (M7)
 particuliers (M6)
```

Rien n'est arbitraire : on ne caractérise pas (M5) avant d'avoir les propriétés à invoquer
(M3, M4) ; on ne reconnaît pas le rectangle comme parallélogramme particulier (M6) avant de
savoir ce qu'est un parallélogramme et ce qu'il garantit.

**Prérequis déclarés, et diagnostiqués.** L'audit `--strict` a montré que la leçon MOBILISE
trois notions de 6e sans les enseigner : la perpendicularité (un distracteur du module 4), le
périmètre (mis en contraste avec l'aire dans un indice du module 7) et le sommet d'une figure.
Elles sont donc entrées dans `priorKnowledge` **et** dans le module 0, qui compte dix questions
au lieu de sept. Déclarer sans diagnostiquer aurait seulement déplacé le constat.

**Ids de briques et lexique.** `parallelogramme`, `quadrilatere`, `losange`, `diagonale`,
`droites-paralleles` sont des termes du lexique gradés 6e. `parallelogramme` est la matière
même de cette leçon : la brique porte donc **l'id du lexique** (mémoire
`lexicon_term_above_level`). `quadrilatere`, `droites-paralleles`, `diagonale`, `losange`,
`milieu-segment`, `notation-segment`, `angle-droit` sont déclarés en `priorKnowledge` et
diagnostiqués par le module 0.

---

## Ajustements du catalogue

`coursesData.js` est **généré** depuis le référentiel officiel (mémoire `catalogue_is_generated`) :
on n'y renomme rien. Deux champs seulement changent, et pour une raison contractuelle :

- `durationMinutes: 70 → 78` — pour rester dans les ±10 min que `smarter:validate-curriculum`
  exige face à la somme des `estimatedMin` des modules (78).
- `status: 'coming_soon' → 'available'` — règle `lesson_status_always_available` : une leçon
  terminée, routée et validée ouvre sa carte.

Les `pointsToLearn` ne bougent pas : les ids de Learning Points en dérivent par l'ordre.

---

## Ce que cette leçon ne fait PAS

- **Aucun vecteur, aucune translation** (`exclude` officiel ; c'est la 4e). Le noyau `paral.js`
  lève sur toute demande de translation nommée, et `paral.test.js` le vérifie.
- Aucune démonstration rédigée au sens de la 3e : en 5e on **choisit la propriété** qui conclut
  et on l'énonce, on ne rédige pas un enchaînement hypothèse → théorème → conclusion.
- Aucun théorème des milieux, aucune réciproque de Thalès, aucune trigonométrie.
- Aucun repère, aucune coordonnée : la leçon est une leçon de figure.
