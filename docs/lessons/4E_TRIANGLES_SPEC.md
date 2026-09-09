# 4e — `triangles-4e` « Triangles : démontrer »

> Objet officiel `triangles` (BO n°10 du 5 mars 2026), domaine `espace_geometrie`,
> rôle **approfondissement** dans la chaîne 5e → **4e** → 3e.
> Part 1 de la clé catalogue `4e_triangles` (part 2 = `pythagore-4e`).
> Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`.

## 1. Identité

**Idée centrale, vécue avant d'être nommée** : une propriété géométrique est un
**chemin à sens unique**, et le chemin inverse est une *autre* affirmation qu'il
faut vérifier séparément. L'élève ne l'apprend pas comme une règle de logique :
il le rencontre sur deux configurations où le sens direct et le sens réciproque
sont tous les deux vrais (cercle circonscrit, droite des milieux), puis sur une
troisième où il ne l'est pas (« isocèle ⇒ deux angles égaux » se retourne, mais
« la somme fait 180° » ne dit rien de la forme). Le mot « réciproque » arrive
après.

Fil narratif : le **bureau du détective** — on ne croit pas ce qu'on voit, on
établit ce qu'on peut prouver.

## 2. Contrat curriculaire

| | |
|---|---|
| **Acquis 5e/6e** (`priorKnowledge`, 12 entrées, toutes diagnostiquées au module 0) | `mediatrices-cercle-circonscrit`, `somme-angles-triangle`, `inegalite-triangulaire` (5e `triangles-5e`) · `mediatrice`, `milieu-segment`, `droites-paralleles`, `droites-perpendiculaires`, `notation-segment`, `angle-droit`, `triangle-rectangle`, `quadrilatere`, `diagonale` (6e) |
| **NOUVEAU en 4e** | la caractérisation « rectangle ⟺ inscrit dans un demi-cercle » · la médiane relative à l'hypoténuse · la droite des milieux (sens direct) · sa réciproque · propriété / réciproque / caractérisation · la charpente donnée → propriété → conclusion |
| **Approfondi** | rédiger une démonstration complète en enchaînant deux propriétés |
| **Réservé à la 3e** (exclu, garde exécutable) | le théorème de Thalès · la trigonométrie |
| **Réservé à la leçon SŒUR `pythagore-4e`** (exclu, garde exécutable) | l'énoncé de Pythagore, ses calculs, sa réciproque |

`triangles-3e` existe et contient déjà `droite-des-milieux` et
`conjecturer-puis-prouver` : la 3e **réinvestit** dans des configurations
composées. La 4e **établit**, en faisant chercher la propriété avant de
l'énoncer — c'est la règle « inspiration inter-niveaux » du dépôt : même
architecture, jamais les mêmes mathématiques au même endroit.

## 3. Learning Points (catalogue, part 1 de `4e_triangles`)

```
4e_triangles-4e_P1  Caractériser le triangle rectangle par son cercle circonscrit
4e_triangles-4e_P2  Utiliser la droite des milieux
4e_triangles-4e_P3  Distinguer une propriété et sa réciproque
4e_triangles-4e_P4  Rédiger une démonstration géométrique
```

## 4. Modèle mathématique — `components/triangles4e.js`

Réutilise `common/geo5e/geo5e.js` (`circumcenter`, `triangleAngles`, `dist`,
`midpoint`) et `common/utils/geometry2d.js` (`areParallel`, `lineThrough`,
`angleBetweenDeg`) : rien n'y est réimplémenté.

- `cercleCirconscrit(A, B, C)` — centre **calculé** par `circumcenter`, rayon
  mesuré, plus `centreEstMilieuAB` et `ecartAuMilieu` : c'est ce dernier nombre
  qui fait *voir* le centre venir se poser sur le milieu de [AB].
- `estRectangleEn(T, sommet, tol)` — l'angle est **mesuré**, pas décrété.
- `droiteDesMilieux(A, B, C)` — les milieux I de [AB] et J de [AC], et les FAITS
  MESURÉS : `parallele` (angle entre (IJ) et (BC), en degrés, comparé à 0),
  `rapport` (IJ / BC) et les deux longueurs. La leçon n'affirme « parallèle » et
  « moitié » que parce que ces deux nombres le disent.
- `reciproqueMilieux(A, B, C, t)` — la situation inverse : I milieu de [AB], et
  K sur [AC] au paramètre `t`. La conclusion « K est le milieu » n'est vraie
  qu'en `t = 1/2` ; la fonction renvoie `parallele`, `tEstMilieu` et le rapport,
  de sorte qu'un `t` voisin de 1/2 produise une droite VISIBLEMENT non parallèle.
- `statut(enonce)` — classifie `définition` / `propriété` / `caractérisation`,
  et pour une propriété dit si sa réciproque est vraie. C'est l'objet du P3.
- `assertScope4e(sujet)` — lève sur `thales`, `trigonometrie`,
  `pythagore-calcul`.

## 5. Manipulation signature (M1) — `DetectiveLab`

A et B sont fixes ; **C se glisse librement dans tout le plan**. Le cercle
circonscrit du triangle ABC est recalculé à chaque image, son centre O est
dessiné, et l'angle en C est lu dans le DOM.

Le défi : « rends l'angle en C droit ». Il n'y a pas d'aimant, pas de
contrainte : l'élève cherche, et il **trouve** — au moment exact où l'angle
atteint 90°, le centre O vient se poser sur le milieu de [AB] et le cercle
passe par A, B et C avec [AB] pour diamètre. L'écart |O − milieu| est affiché
en continu : c'est un compteur qui tombe à zéro, donc une **cible qu'on vise**,
pas une réponse qu'on subit.

**Aha** : « l'angle droit et le centre sur le milieu, c'est la même chose ».

Le viewBox est **déduit du contenu** (cercle + trois sommets + O), avec un
garde-fou de rapport d'aspect : quand C approche de la droite (AB), le cercle
circonscrit explose — le lab **borne le rayon dessiné** et le test de sécurité
visuelle vérifie que le cadre reste dans un rapport ≤ 3 à toute position
atteignable.

## 6. Modules

| M | Titre | Stage | Manipulation | LP |
|---|---|---|---|---|
| 0 | Mission de départ | prerequisite_check | diagnostic des 12 prérequis, en 10 questions | — |
| 1 | Le cercle qui trahit l'angle droit | trigger | `DetectiveLab` : C libre, cercle vivant, O qui se pose | P1 |
| 2 | Le demi-tour du détective | discovery | le sens INVERSE : C posé sur le cercle de diamètre [AB] | P1, P3 |
| 3 | Deux milieux, une droite | manipulation | `MilieuxLab` : I et J dérivés, deux nombres relevés | P2 |
| 4 | Et dans l'autre sens ? | manipulation | `MilieuxLab` en mode réciproque : K glisse sur [AC] | P2, P3 |
| 5 | Le tri du détective | practice_lab | classer 8 énoncés : définition / propriété / caractérisation | P3 |
| 6 | Rédiger la preuve | practice_lab | `PreuveLab` : assembler donnée → propriété → conclusion, deux fois | P4 |
| 7 | 🏆 Mission finale | evaluation | 10 épreuves, les 4 LPs couverts | — |

Durée : 4 + 13 + 9 + 12 + 10 + 9 + 13 + 8 = **78 min** (≤ 90), et c'est la
valeur du `durationMinutes` catalogue.

## 7. Continuité d'état

`continuity: { key: 'triangle', chain: [1, 2] }` — le triangle du module 1 est
celui qu'on **retourne** au module 2 : on y part du cercle pour retrouver
l'angle droit, exactement à l'envers du chemin parcouru. Au-delà, les modules 3
à 6 travaillent sur des configurations CHOISIES (des milieux, puis des énoncés
à classer, puis une preuve à écrire) : y imposer la continuité serait artificiel.

## 8. Erreurs visées

- croire qu'une propriété « marche dans les deux sens » automatiquement —
  module 5, avec deux contre-exemples chiffrés ;
- confondre le milieu du côté et le pied de la hauteur (module 3) ;
- appliquer la droite des milieux à un segment qui joint UN milieu et un point
  quelconque (module 4, où K glisse et la conclusion tombe) ;
- rédiger une conclusion sans la propriété qui l'autorise (module 6 : la carte
  « propriété » manquante rend la preuve incomplète) ;
- prendre l'observation d'une figure pour une preuve (fil narratif entier).

## 8bis. Les tolérances, toutes DÉRIVÉES d'une seule

Le noyau ne contient pas un seuil par verdict : il contient **une** tolérance
d'angle, `TOL_ANGLE = 1,2°`, et les autres s'en déduisent par trigonométrie.

| verdict | seuil | dérivation |
|---|---|---|
| l'angle en C est droit | `TOL_ANGLE` | la référence |
| O est sur le milieu de [AB] | `ecartCentreEquivalent` | `(AB/2)·\|cot C\|` évalué à la tolérance |
| [AB] est un diamètre | idem × 2 | deux rayons |
| CM vaut la moitié de AB | `ecartMedianeEquivalent` | `(AB/2)·(1/sin C − 1)` à la tolérance |

C'est ce qui rend la CARACTÉRISATION vraie à l'écran : les deux témoins du labo
signature basculent exactement ensemble, par construction et non par chance.
Deux seuils choisis indépendamment produisaient un écran où l'angle était
annoncé « aigu » pendant que le centre était déclaré posé sur le milieu — le
défaut a été attrapé par le test de coïncidence, sur balayage du demi-plan.

Le module 4 a sa propre tolérance, `TOL_PARALLELE = 0,8°`, pour la même raison
inverse : `areParallel` (eps = 1e-6) réduisait la cible au point mathématique
`t = 0,5`, donc à une position **inatteignable** au doigt comme au clavier,
pendant que l'écran affichait « 0,7° » à côté. Le fait que K soit le milieu se
lit sur le MÊME angle : les deux verdicts sont deux lectures d'une seule mesure.

## 9. Vérification

`triangles4e.test.js` (exactitude du noyau, périmètre exécutable, la
caractérisation dans les deux sens) + `parcours.test.js` (tous les nombres que
les modules affichent, l'atteignabilité de la cible du lab signature, et la
SÉCURITÉ VISUELLE du cadre déduit à toute position de C). Navigateur :
`apps/web/e2e/lesson-kit/4e-triangles.mjs` sur le port 5408.
