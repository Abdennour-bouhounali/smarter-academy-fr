# 4e — `reperage-4e` « Le repère qu'on choisit »

> Objet officiel `reperage` (BO n°10 du 5 mars 2026), domaine `espace_geometrie`,
> rôle **approfondissement** dans la chaîne 6e → 5e → **4e** → 3e.
> Clé catalogue `4e_reperage`. Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`, section 4E.

## 1. Identité

**Idée centrale, vécue avant d'être nommée** : jusqu'ici le repère était
DONNÉ — un quadrillage tout prêt, une graduation de 1 en 1, des points qui
tombaient sur les nœuds. En 4e, le repère devient un **choix**. On reçoit des
données réelles, et c'est l'élève qui décide de la graduation. Un mauvais
choix ne produit pas une erreur de calcul : il produit un graphique
**illisible** — des points empilés sur le même nœud, ou un axe couvert de
traits qu'on ne peut plus compter.

Et une fois le repère bien choisi, les coordonnées cessent d'être une simple
étiquette : elles deviennent un **moyen de décider**. Ce quadrilatère est-il un
parallélogramme ? Quel point est le plus proche ? On répond par le calcul sur
les nombres, sans poser de règle sur le dessin.

## 2. Contrat curriculaire

| | |
|---|---|
| **Acquis 5e** (`priorKnowledge`) | `repere`, `axes-origine`, `coordonnees`, `ordre-du-couple`, `lire-un-point`, `placer-un-point`, `quadrant`, `sur-un-axe`, `echelle-graduation` (tous établis par `reperage-5e`) |
| **NOUVEAU en 4e** | lire une coordonnée qui tombe ENTRE deux graduations (décimale) · **choisir** la graduation d'un axe pour un jeu de données donné · placer un point quand le pas n'est pas 1 · fermer un parallélogramme par le calcul · comparer des distances par les coordonnées |
| **Approfondi** | les coordonnées négatives (vues en 5e, ici avec des décimales : −4,5) |
| **Réservé à la 3e** (exclu, garde exécutable) | le repérage sur la SPHÈRE (latitude, longitude) · les coordonnées dans l'ESPACE · la formule du milieu et la formule de la longueur comme objets d'étude formels · les vecteurs (2nde) |

`reperage-5e` a déjà ouvert le plan aux quatre quadrants, avec des négatifs, et
a même touché du doigt une graduation non unitaire (brique
`echelle-graduation`). La 4e ne **refait donc jamais** « lire un point » ni
« le couple est ordonné ». Elle prend ces acquis comme point de départ et
déplace la question : **qui choisit le repère, et qu'est-ce qu'un mauvais
choix coûte ?**

`reperage-droite-plan-3e` reprendra le milieu et la longueur comme formules,
et la sphère terrestre. Rien de cela n'apparaît ici : le module 6 fait
comparer des distances **au carré** (« plus proche que »), sans jamais écrire
la formule de la distance.

## 3. Learning Points (catalogue `4e_reperage`, append-only)

```
4e_reperage-4e_P1  Lire des coordonnées décimales ou négatives
4e_reperage-4e_P2  Choisir une graduation adaptée à des données
4e_reperage-4e_P3  Placer un point dans un repère à graduation non unitaire
4e_reperage-4e_P4  Utiliser les coordonnées pour résoudre un problème géométrique
```

## 4. Modèle mathématique — `components/reperage4e.js`

Tout ce que la leçon affirme est **calculé**, jamais écrit à la main.

- `graduationPour(donnees, options)` — **le cœur de P2**. Pour un jeu de
  points et un budget de graduations, essaie les pas de la famille
  1·2·5 × 10ⁿ et rend, pour CHACUN, un verdict motivé :
  - `trop-de-graduations` — l'axe en porterait plus que le budget : illisible ;
  - `points-confondus` — deux points distincts atterrissent sur le même nœud ;
  - `entre-les-graduations` — des valeurs ne tombent sur aucune graduation ;
  - `ok` — lisible et fidèle.
  La fonction expose la liste complète des candidats avec leur raison, de
  sorte que l'interface n'ait **rien à affirmer** : elle affiche le verdict du
  noyau.
- `lirePoint(p, repere)` — la lecture, en nombre de graduations ET en valeur,
  avec le nombre de décimales que le pas impose.
- `placer(p, repere)` — l'aimantation sur les nœuds **réellement dessinés**
  (délègue à `snapCoord` de `CoordPlane` : une seule définition du pas).
- `estParallelogramme(A, B, C, D)` — par le calcul sur les coordonnées :
  les milieux des diagonales coïncident. Rend aussi les deux milieux, pour
  que la conclusion soit lisible et non assénée.
- `quatriemeSommet(A, B, C)` — le point qui ferme le parallélogramme ABCD.
- `plusProche(P, liste)` — le point le plus proche, comparé par les **carrés**
  des distances (aucune racine, aucune formule de longueur : hors programme).
- `assertScope4e(sujet)` — lève sur `sphere`, `latitude-longitude`,
  `coordonnees-espace`, `vecteur`.

Réutilise `common/components/CoordPlane` (`planeGeometry`, `snapCoord`,
`formatCoords`) et `common/utils/geometry2d` (`dist`, `midpoint`) — rien n'est
réimplémenté.

## 5. Manipulation signature (M1) — `GraduationLab`

L'élève reçoit **12 relevés de température réels** sur une journée, de −4,5 °C
à 22,5 °C. La grille par défaut ne convient pas. Un seul contrôle : le **pas
de l'axe vertical**, choisi parmi 0,5 · 1 · 2 · 5 · 10.

- pas 10 → les douze points s'écrasent sur trois nœuds : deux relevés
  différents deviennent le même point ;
- pas 0,5 → 55 graduations sur l'axe : on ne peut plus les compter ;
- pas 5 → les demi-degrés tombent entre les graduations ;
- pas 2,5 → lisible ET fidèle.

Le verdict est **calculé** par `graduationPour`, jamais écrit en prose : le
panneau affiche le nombre de graduations, le nombre de points confondus, et la
raison du refus. L'élève voit littéralement ses données se détruire.

**Aha** : « ce n'est pas le repère qui est donné, c'est moi qui le choisis —
et un mauvais choix rend les données illisibles ».

Laissé aux modules suivants : lire entre deux graduations (M2), placer soi-même
dans un repère non unitaire (M4), les coordonnées comme preuve (M5–M6).

## 6. Modules

| M | Titre | Stage | Manipulation | LP |
|---|---|---|---|---|
| 0 | Mission de départ | prerequisite_check | diagnostic des 9 acquis de 5e | — |
| 1 | La journée qui ne tient pas | trigger | `GraduationLab` : choisir le pas de l'axe | P2 |
| 2 | Entre deux graduations | discovery | `LectureLab` : une sonde qui lit un point posé hors des nœuds | P1 |
| 3 | Le pas qu'on se donne | manipulation | `GraduationLab` sur un second jeu (altitudes), budget imposé | P2 |
| 4 | Poser un point quand le pas n'est pas 1 | manipulation | `PlacementLab` : cible à atteindre, aimantation sur les nœuds réels | P3 |
| 5 | Le quatrième sommet | manipulation | `PlacementLab` : fermer un parallélogramme, vérifié par les milieux | P4 |
| 6 | Décider par les coordonnées | practice_lab | comparer des distances, trancher sans règle | P4 |
| 7 | 🏆 Mission finale | evaluation | 10 épreuves, ≥ 2 par LP | — |

Durée : 4 + 9 + 6 + 6 + 7 + 7 + 6 + 5 = **50 min**, égal au `durationMinutes`
du catalogue.

## 7. Continuité

`continuity: { key: 'temperatures', chain: [1, 2] }` — le jeu de températures
choisi au module 1 est CELUI qu'on lit au module 2 : l'élève lit dans le repère
qu'il vient lui-même de régler. Au-delà, les modules ont besoin de jeux de
données CHOISIS (altitudes, puis un quadrilatère) ; y imposer la continuité
serait artificiel.

## 8. Garanties vérifiées par les tests

`components/parcours.test.js` vérifie, en plus des nombres affichés :

- **ATTEIGNABILITÉ** — chaque point que l'élève doit placer tombe sur un nœud
  réellement dessiné au pas choisi. (Classe de défaut qui a cassé deux labos
  plus tôt dans cette vague : une cible à 2,5 dans une grille de pas 1.)
- **SÉCURITÉ VISUELLE** — le rapport hauteur/largeur de chaque `CoordPlane`
  reste ≤ 3, et le nombre de graduations ≤ 26 sur chaque axe.
- **VERDICTS** — chaque pas refusé par le labo l'est pour la raison que le
  panneau affiche, et le pas recommandé est bien accepté.
