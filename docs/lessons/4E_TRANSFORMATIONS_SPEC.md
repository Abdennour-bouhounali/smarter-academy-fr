# 4e — `transformations-4e` « Le glissement »

> Objet officiel `transformations` (BO n°10 du 5 mars 2026), domaine
> `espace_geometrie`, rôle **maîtrise / réutilisation** dans la chaîne
> 5e → **4e**. Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`.
> Clé catalogue `4e_transformations`, cinq Learning Points.

## 1. Identité

**Idée centrale, vécue avant d'être nommée** : une translation est UN
glissement du plan, décrit par TROIS caractères et rien d'autre — une
direction, un sens, une longueur. Tous les points de la figure font
*exactement le même trajet*, ce qui rend la copie superposable à l'originale
sans la retourner ni la faire tourner.

Le geste signature : l'élève tire la **flèche du glissement** elle-même, et la
copie suit en direct. Il n'y a pas de curseur « direction » et de curseur
« longueur » : les trois caractères sont dans le SEUL objet qu'on manipule,
et c'est ce qui les rend inséparables.

**La conséquence qui referme la leçon** : si tous les segments [M M'] ont même
direction, même sens et même longueur, alors M M' N' N est un
**parallélogramme**. Le lien translation ↔ parallélogramme n'est donc pas une
propriété ajoutée : c'est la même chose vue deux fois.

## 2. Contrat curriculaire

| | |
|---|---|
| **Acquis 5e / 6e** (`priorKnowledge`) | `symetrie-centrale`, `construire-image`, `invariants-symetrie`, `parallelogramme`, `droites-paralleles`, `milieu-segment`, `quadrilatere`, `diagonale`, `notation-segment`, `aire`, `perimetre`, `angle-droit`, `axe-symetrie` |
| **NOUVEAU en 4e** | la **translation** comme glissement à trois caractères · construire l'image d'un **point** · construire l'image d'une **figure** · le **parallélogramme** que forment M, M', N', N · les **propriétés conservées** (longueurs, angles, parallélisme, aires) |
| **Réservé à la 3e** (exclu, garde exécutable) | le **vecteur** et sa notation · ses **coordonnées** · la **relation de Chasles** · l'**homothétie** |

La 5e a installé la symétrie centrale : une transformation qui *retourne* la
figure autour d'une punaise. La 4e ajoute la transformation qui ne retourne
rien — elle **glisse**. Le contraste 5e/4e est le moteur du module 1 : même
figure, deux gestes, deux copies qui ne se ressemblent pas.

**Le mot « vecteur » n'apparaît nulle part dans cette leçon.** Il est
recherché mécaniquement par `components/translation4e.test.js`, et
`assertScope4e` lève pour `'vecteur'`, `'chasles'`, `'coordonnees-vecteur'` et
`'homothetie'`. Le glissement se nomme donc toujours *le glissement*, décrit
par sa direction, son sens et sa longueur — trois mots de français, aucun
symbole fléché.

## 3. Learning Points (catalogue, append-only)

```
4e_transformations-4e_P1  Reconnaître une translation à son glissement
4e_transformations-4e_P2  Construire l'image d'un point par une translation
4e_transformations-4e_P3  Construire l'image d'une figure par une translation
4e_transformations-4e_P4  Relier une translation au parallélogramme qu'elle forme
4e_transformations-4e_P5  Utiliser les propriétés conservées par une translation
```

## 4. Modèle mathématique — `components/translation4e.js`

Source de vérité unique, purement fonctionnelle, **construite sur
`common/utils/geometry2d.js`** (`dist`, `midpoint`, `areParallel`,
`polygonArea`, `sideLengths`, `interiorAngles`, `lineThrough`, `add`, `vec`,
`scale`, `normalize`) — rien de tout cela n'est réimplémenté ici.

- `glissement({dx, dy})` — le glissement décrit par ses TROIS caractères :
  `direction` (l'angle de la droite support, non orienté, dans [0 ; 180[),
  `sens` (est/ouest/nord/sud et composés, la moitié de l'information qu'une
  direction seule ne porte pas) et `longueur`. Jamais de champ `vecteur`, et
  jamais de notation fléchée dans le rendu.
- `translater(points, g)` — l'image d'une liste de points. Un point seul passe
  par le même chemin (`translater([M], g)[0]`), ce qui garantit que « l'image
  d'une figure, c'est l'image de chacun de ses points » est un fait du code et
  non une phrase.
- `retrouverGlissement(figure, image)` — le glissement qui mène de l'une à
  l'autre, ou `null` si les deux figures ne s'en déduisent pas (elles ont été
  tournées, retournées, ou déformées). C'est ce `null` qui permet au module 1
  de distinguer un glissement d'un demi-tour SANS le dire.
- `invariants(figure, image)` — longueurs, angles, aire et parallélisme
  calculés **sur les points réellement dessinés**. Aucun invariant n'est
  déclaré : ils sont mesurés, donc « la figure ne ment jamais ».
- `parallelogrammeDe(M, g)` — les quatre sommets M, M', N', N et le verdict
  `estParallelogramme`, obtenu par `oppositeSidesParallel` sur les points
  dessinés.
- `assertScope4e(sujet)` — lève pour `'vecteur'`, `'chasles'`,
  `'coordonnees-vecteur'`, `'homothetie'`. Le périmètre se code, il ne se
  commente pas (mémoire « périmètre exécutable »).

## 5. Manipulation signature (M1) — `GlissementLab`

L'élève **tire la flèche du glissement elle-même** : une poignée à sa pointe.
La direction, le sens et la longueur changent tous les trois d'un seul geste,
parce qu'ils sont trois lectures du même objet. La copie de la figure suit en
direct, et **chaque segment [M M'] est dessiné** — quatre segments qui restent
parallèles et de même longueur, quoi que fasse l'élève.

```
tirer la flèche  →  la copie suit  →  les 4 traits M M' restent parallèles et égaux
```

Puis un bouton « et le demi-tour de 5e ? » : la même figure, transformée par la
symétrie centrale de la 5e. Les traits M M' ne sont alors plus parallèles — ils
se croisent tous en un point. **Aha** : le glissement se reconnaît à ce que
*tous les points font le même trajet*.

Contraintes techniques tenues par le composant :
- `e.currentTarget.setPointerCapture(e.pointerId)` dans `onPointerDown` —
  sans quoi le glisser se fige au premier pixel (mémoire « pièges du glisser
  geo5e ») ;
- cadre de 760 unités rendu sur 263 px à 375 px de large ⇒ `hitR = 68` unités
  pour atteindre les 44 px CSS du §17 ;
- les lectures (direction, sens, longueur, verdict de parallélisme) sont dans
  le **DOM**, pas dans des `<text>` SVG ;
- rien ne se fige après validation : le labo reste manipulable.

Laissé aux modules suivants : construire une image seul (M2, M3), le
parallélogramme (M5), les invariants mesurés (M4), le choix de la
transformation (M6).

## 6. Modules

| M | Titre | Stage | Manipulation | LP |
|---|---|---|---|---|
| 0 | Mission de départ | prerequisite_check | diagnostic des acquis 5e/6e | — |
| 1 | Le tapis roulant | trigger | `GlissementLab` : tirer la flèche, les 4 traits restent parallèles ; contraste avec le demi-tour de 5e | P1 |
| 2 | Le trajet d'un seul point | discovery | `PointImageLab` : placer M' soi-même, la scène mesure direction / sens / longueur | P2 |
| 3 | Toute la figure d'un coup | manipulation | `FigureLab` : les sommets un à un, puis la figure entière | P3 |
| 4 | Ce que le glissement garde | manipulation | `InvariantsTable` : longueurs, angles, aire mesurés sur les deux figures | P5 |
| 5 | Le parallélogramme caché | manipulation | `ParallelogrammeLab` : M, M', N', N et le verdict mesuré | P4 |
| 6 | L'atelier des trois gestes | practice_lab | trois situations : glisser, retourner, ou ni l'un ni l'autre | P1, P3, P5 |
| 7 | 🏆 Mission finale : le carrelage | evaluation | dix épreuves, les 5 LPs | — |

Somme des `estimatedMin` : 4 + 12 + 10 + 10 + 9 + 10 + 8 + 9 = **72**, égale à
`durationMinutes` du catalogue.

## 7. Continuité d'état

`continuity: null`, et c'est délibéré. La figure change de module en module
(un drapeau, un point seul, un triangle, un quadrilatère, un carrelage) parce
que **le transfert d'une figure à l'autre est l'objectif** : une translation
qui ne serait vue que sur un seul dessin resterait une propriété de ce dessin.
Ce qui persiste n'est pas un état, c'est le glissement lui-même — et il est
redéfini à chaque module pour que l'élève le reconnaisse ailleurs.

## 8. Erreurs visées

- **« La copie a tourné »** → M1, le demi-tour de 5e mis côte à côte : ses
  traits M M' se croisent, ceux de la translation ne se croisent jamais.
- **Direction sans sens** → M2, deux images candidates sur la même droite, à
  la même distance, dans les deux sens : une seule est juste.
- **« Il suffit de la même longueur »** → M2 et M3, une image à bonne distance
  mais dans une autre direction est refusée par la mesure.
- **« L'aire change quand la figure bouge »** → M4, l'aire est recalculée sur
  les points dessinés et ne bouge pas d'un dixième.
- **« Le parallélogramme, c'est M N N' M' »** → M5, l'ordre des sommets
  compte : c'est M M' N' N, et l'autre ordre donne un quadrilatère croisé.
- **Confondre translation et symétrie centrale** → M6, trois situations dont
  une seule est un glissement.

## 9. Vérification

Noyau : `translation4e.test.js` (translation, retour, invariants mesurés,
gardes de périmètre, absence mécanique du mot « vecteur ») +
`parcours.test.js` (chaque nombre que la rédaction annonce, et
l'**atteignabilité** de chaque cible sur la grille — le défaut qui a coûté
deux étapes impossibles dans les leçons de référence).
Navigateur : `apps/web/e2e/lesson-kit/4e-transformations.mjs` sur le port
**5405** — labo tiré dans les quatre directions, chemins faux non bloquants,
carte des connaissances sans fuite, boss complet, mobile 375 px, console vide.
