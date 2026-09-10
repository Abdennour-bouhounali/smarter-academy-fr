# Pilote JSXGraph — deux leçons de Seconde

**Date** 2026-09-10 · **Base** tag `jsxgraph-pilot-baseline` (`06854082`)
**Recommandation : NE PAS ADOPTER** (détail au §9, retrait au §10)

---

## 1. Objectif

Répondre à une seule question :

> JSXGraph améliore-t-il assez nos manipulations mathématiques pour justifier
> qu'on l'adopte plus largement ?

« JSXGraph fonctionne techniquement » ne suffit pas. Le critère est
pédagogique d'abord, technique ensuite.

## 2. Leçons testées

| Leçon | id | Manipulation visée |
|---|---|---|
| Seconde — Vecteurs | `vecteurs-2nde` | M2 étape 1, « promène la flèche » |
| Seconde — Fonction affine | `fonction-affine-2nde` | M1 étape 3, « fais pivoter la droite » |

Aucune autre leçon n'a été touchée.

## 3. L'implémentation existante

Les deux leçons s'appuient sur **`CoordPlane`** (907 lignes, partagé par
**118 fichiers de leçon**), complété par `VectorScene` + `labelLayout`
(placement d'étiquettes anti-collision) côté vecteurs, et par les props
`functions` / `cursor` / `intercept` / `staircase` côté fonctions.

`CoordPlane` porte déjà : grille, axes gradués et étiquetés, zone tactile
unique, chemin clavier complet, aimantation par axe, marges calculées
d'après la largeur réelle des étiquettes, courbes coupées au cadre.

> **Précédent décisif.** `mafs@0.21.0` — une bibliothèque React de
> visualisation mathématique — est **déjà une dépendance du projet**. Elle
> est importée dans **un seul fichier** : `components/hero/MafsGraph.jsx`,
> la vitrine marketing, qui affiche `f(x) = ax + b` avec deux curseurs et
> pan/zoom. **Zéro leçon** l'utilise. Le dépôt a donc déjà mené cette
> expérience avec une autre bibliothèque, et celle-ci n'est jamais entrée
> dans la couche pédagogique.

## 4. L'architecture du pilote

```
Leçon  →  VectorLabJSXGraph / AffineLineLabJSXGraph  →  JSXGraphBoard  →  jsxgraph
```

Aucun module de leçon n'importe `jsxgraph`. L'adaptateur
(`lessons/common/math-visualization/jsxgraph/JSXGraphBoard.jsx`) tient le
contrat React/impératif en trois règles :

1. **Le plateau est créé une fois.** `setup(board, JXG, getData)` renvoie une
   fonction `update(data)` ; on ne reconstruit jamais sur un changement de
   donnée (sinon le glisser en cours est perdu et la figure clignote).
2. **Les données arrivent par ref.** `getData()` lit `dataRef.current` —
   jamais une valeur capturée : c'est ce qui évite les fermetures périmées
   quand un gestionnaire JSXGraph survit à dix rendus React.
3. **Le plateau est détruit au démontage** (`JXG.JSXGraph.freeBoard`) et le
   conteneur est vidé.

**Erreur** : si l'import dynamique ou la création échoue, le composant rend
`fallback` — l'implémentation Smarter Academy d'origine. Une leçon ne tombe
jamais à cause du pilote.

**Commutateur** (`pilotSwitch.js`) : doublement fermé — `import.meta.env.DEV`
**et** `?viz=jsxgraph`. Un élève ne voit jamais le pilote.

**Mathématiques** : les deux composants pilotes réutilisent `vecteurUtils` et
`affineUtils` **inchangés**, et toute l'arithmétique de geste vit dans
`pilotMath.js`, pur et testé. La comparaison ne porte donc que sur la couche
de rendu et de geste.

## 5. Ce que le pilote apporte, pédagogiquement

### Vecteurs — LP `seconde_vecteurs-2nde_P1` (égalité de deux vecteurs)

```
LP P1  →  l'élève TIRE A en continu  →  A varie, u reste (3 ; 2)
       →  il VOIT la flèche glisser identique à elle-même
       →  brique `egalite-vecteurs` + `vocab-representant`
       →  TapQuestion étape 4
```

**Mesuré au navigateur** : pendant tout le glisser, le déplacement affiché
reste « 3 vers la droite et 2 vers le haut » (invariant vérifié sur 8 images
intermédiaires) ; au relâchement A s'aimante sur (1 ; 2).

*Gain réel* : le glisser continu montre la **translation** de la flèche, là
où l'incumbent la fait sauter de case en case. C'est le seul gain
pédagogique net du pilote.

### Fonction affine — LP `..._P2` / `..._P5` (coefficient directeur, variations)

```
LP P2/P5  →  l'élève TIRE la poignée de pente (1 ; a+b)
          →  a passe de 3 à −4, b reste EXACTEMENT 20
          →  il VOIT la droite PIVOTER autour de (0 ; b), et non glisser
          →  brique `vocab-coefficient-ordonnee`
```

**Mesuré au navigateur** : `V(t) = 3·t + 20` → `V(t) = −4·t + 20`, `b = 20`
inchangé. Le pivot est vrai par construction (`a = y(1) − b`), pas à l'œil.

*Gain réel* : l'élève agit **sur la droite elle-même** au lieu de pousser un
curseur posé à côté. Le mot « pivoter » devient un geste.

## 6. Résultats techniques

| Mesure | Résultat |
|---|---|
| Montage / démontage | 1 plateau après **10 aller-retours** ; **0** après navigation SPA ; tas plat à 93 Mo |
| Fuites | aucune (`freeBoard` + conteneur vidé) ; aucun SVG orphelin |
| Erreurs console | **0**, sur les deux leçons, à toutes les largeurs |
| Responsive | 375 / 390 / 768 / 1024 / 1280 px — **aucun débordement horizontal** |
| Tactile | glisser à 375 px : A bouge, **la page ne défile pas** |
| Repli | `fallback` rend le composant d'origine |
| Tests | **146 fichiers / 3391 tests** au vert (baseline 138 / 3124) |
| Portes | `validate:lessons --strict`, `check:katex`, `check:non-blocking` : vertes. `vecteurs-2nde` **29 briques / 29 requires / 0E** — inchangé |
| Build | `npm run build` réussit |

### Le coût, mesuré

- **Dépendance** : `jsxgraph@1.13.3`, cœur **948 Ko** minifié.
- **En production, l'élève ne télécharge PAS JSXGraph** : seuls un stub de
  **2,2 Ko** et son CSS partent (vérifié en `vite preview` : la requête vers
  le chunk de 971 Ko n'est jamais émise, et `.jxgbox` est absent).
- Mais le chunk de **971 Ko reste émis dans `dist/`** : le garde
  `import.meta.env.DEV` ne l'élimine pas, car l'`import('jsxgraph')` de
  l'adaptateur est inconditionnel. Un vrai retrait suppose de supprimer le
  code, pas seulement de fermer le drapeau.
- **649 lignes** de code pilote (dont 191 + 162 de composants) pour
  reproduire un **sous-ensemble** de ce que fait `VectorLab` en **153 lignes**.

### Défauts trouvés — et ce qu'ils coûtent

1. **Pas de graduations ni de nombres sur les axes.** Le plateau pilote
   n'affiche aucun repère chiffré ; l'élève ne peut **pas lire une
   coordonnée** sur la figure. Il a fallu ajouter une ligne de lecture dans
   le DOM pour compenser — c'est un contournement, pas une solution : toute
   la leçon « Deux nombres suffisent » se lit sur les axes.
2. **Pas de notation vectorielle.** L'incumbent écrit `u⃗` (flèche au-dessus)
   ; JSXGraph ne le fait pas sans un second moteur de rendu — or le contrat
   interdit un second moteur mathématique à côté de KaTeX.
3. **Étiquettes non anti-collision.** JSXGraph pose un décalage fixe ;
   `labelLayout` place les étiquettes d'après les obstacles réellement
   dessinés. L'invariant « tout état valide a une mise en page valide » n'est
   pas tenable avec un décalage fixe (c'est exactement le défaut
   `SolidTurner` déjà documenté : 16 orientations fautives sur 468).
4. **Pointe de flèche déformée** à l'épaisseur utilisée.
5. **Taille non bornée** : `aspectRatio: 1/1` sur une colonne pleine largeur
   donnait un plateau de **1164 × 1164 px**, la figure sous la ligne de
   flottaison. Corrigé en plafonnant à 460 px, comme `CoordPlane`.
6. **Boutons repliés** à 375 px (`flex-wrap`) — corrigé.
7. **Double vérité mathématique** : le plateau garde son propre état de
   points, qui peut diverger de l'état React. Il a fallu un aller-retour
   `moveTo` à chaque rendu pour les resynchroniser — précisément le mode de
   défaillance que la règle « ne jamais dupliquer l'état mathématique »
   existe pour empêcher.

## 7. Ce que dit l'architecture documentée

L'audit des contrats (`LESSON_CONTRACT`, `INTERACTION_PEDAGOGY`,
`LESSON_DESIGN_PLAYBOOK`, `CLAUDE.md`…) est explicite sur plusieurs points
qui pèsent contre JSXGraph :

- « **Une nouvelle bibliothèque a besoin d'une raison qu'aucune bibliothèque
  existante ne peut satisfaire** » (§28) ; « nouvelles dépendances sans
  justification » figure parmi les anti-patrons livrés (playbook §17).
- Précédent explicite de refus pour le même motif : « **SVG uniquement. Pas
  de Three.js, pas de WebGL, pas de nouvelle dépendance** »
  (`LESSON_INTEGRATION_GUIDE` §12.2).
- « Le patron `CoordPlane` / `CoordGrid` est **le patron à copier** » : une
  seule zone tactile, `pointerEvents:'none'` sur le décor, jumeau clavier
  **obligatoire**, steppers d'abord. JSXGraph apporte sa propre couche
  d'événements qui court-circuite les six points.
- L'outillage d'audit (`audit-svg-collisions.mjs`) suppose **votre propre
  SVG** : il classe le décor par `role="decor"` et exempte le texte auréolé.
  Sur du balisage tiers non annotable, il produit des faux positifs.
- Ordre de préférence des contrôles : `tap → stepper → chip → slider →
  draw → drag`. Le glisser n'est justifié que quand **le concept EST une
  position continue**, « et même alors il est livré avec un jumeau clavier ».

## 8. Ancien vs JSXGraph

### Vecteurs

| Critère | Ancien (`CoordPlane`) | JSXGraph |
|---|---|---|
| Clarté pédagogique | axes gradués, `u⃗` nommé | **pas de nombres sur les axes** ✗ |
| Qualité de la manipulation | saut de case en case | **glisser continu** ✓ |
| Retour mathématique | escalier, lecture DOM | lecture DOM (compensation) |
| Autonomie de l'élève | cible + aimantation | idem |
| Qualité visuelle | étiquettes anti-collision, halo | décalage fixe, pointe déformée ✗ |
| Mobile | testé, 44 px | correct après correction |
| Tactile | zone unique + clavier | correct, mais couche tierce |
| Performance | SVG React | 1 plateau, pas de fuite ✓ |
| Accessibilité | clavier complet, `aria-valuetext` | à réécrire à la main ✗ |
| Complexité du code | 153 l., zéro dépendance | 649 l. + 948 Ko ✗ |
| Maintenabilité | patron partagé (118 fichiers) | pont impératif à maintenir ✗ |

### Fonction affine

Mêmes colonnes, même verdict, à une exception près : la **poignée de pente**
est un gain propre — le pivot autour de `(0 ; b)` devient un geste. Mais
`CoordPlane` peut recevoir cette poignée : il expose déjà `cursor`,
`readGuides` et `staircase` avec des `onChange`, et son patron de glisser est
documenté. Le gain n'exige pas JSXGraph ; il exige **une poignée**.

### Les réponses

- **A. Pédagogiquement meilleur ?** *Partiellement.* Le glisser continu et la
  poignée de pente sont de vrais gains. Mais la perte des graduations, de la
  notation `u⃗` et du placement anti-collision **coûte plus** qu'ils
  n'apportent, sur des leçons dont le sujet est justement de *lire des
  nombres sur une figure*.
- **B. Techniquement meilleur ?** **Non.** 649 lignes contre 153, une seconde
  vérité mathématique à resynchroniser, l'accessibilité à refaire.
- **C. Visuellement meilleur ?** **Non.** Comparaison d'écrans à l'appui.
- **D. Performance acceptable ?** **Oui.** Aucune fuite, tas plat, 0 erreur.
- **E. Mobile acceptable ?** **Oui**, après deux corrections.
- **F. La dépendance vaut-elle le coup ?** **Non** — 948 Ko, et un précédent
  (`mafs`) qui n'est jamais entré dans les leçons.
- **G. Migrer d'autres leçons ?** **Non.**

## 9. Recommandation

```
NE PAS ADOPTER
```

JSXGraph **fonctionne** : il monte, se détruit proprement, ne fuit pas, tient
le tactile et le 375 px, et n'a produit aucune erreur. Le pilote a atteint son
but — il a produit une réponse, et elle est négative.

La raison n'est pas technique. C'est que `CoordPlane` **est déjà** le
composant que JSXGraph prétend remplacer, avec dix ans de contraintes
pédagogiques françaises cuites dedans : graduations à la virgule française,
moins typographique, marges calculées sur la largeur réelle des étiquettes,
placement d'étiquettes anti-collision, jumeau clavier, aimantation par axe.
JSXGraph rend un plan cartésien générique ; il faudrait réécrire tout cela
**par-dessus**, en impératif, en double de l'état React.

**Ce qu'il faut garder de l'expérience — sans la dépendance :**

1. **Le glisser continu avec aimantation au relâchement.** `CoordPlane`
   aimante à chaque `pointermove` ; la flèche saute. Un mode « libre pendant
   le geste, aimanté au relâchement » est une amélioration réelle, ~20 lignes
   dans `CoordPlane`, utile aux 118 fichiers.
2. **La poignée de pente.** Tirer `(1 ; a+b)` pour faire pivoter une droite
   autour de `(0 ; b)` est un meilleur geste que deux curseurs. À porter en
   SVG maison, avec son jumeau clavier. `pilotMath.slopeFromHandle` /
   `handleYForSlope` sont déjà écrits et testés, sans dépendance.

Les deux sont consignés ici comme améliorations à instruire séparément —
**pas** à implémenter dans ce pilote (§26 : aucun refactor pendant le pilote).

## 10. Retrait

### Fichiers ajoutés (à supprimer)

```
apps/web/src/lessons/common/math-visualization/          (dossier entier)
  jsxgraph/JSXGraphBoard.jsx        jsxgraph/jsxgraph.css
  jsxgraph/index.js                 jsxgraph/pilotMath.js
  jsxgraph/pilotMath.test.js        pilotSwitch.js
apps/web/src/lessons/lycee/seconde/geometrie/vecteurs-2nde/components/VectorLabJSXGraph.jsx
apps/web/src/lessons/lycee/seconde/fonctions/fonction-affine-2nde/components/AffineLineLabJSXGraph.jsx
apps/web/e2e/_jsxgraph-pilot.mjs   apps/web/e2e/_jsxgraph-drag.mjs
apps/web/e2e/_jxg-diag.mjs         apps/web/e2e/_jxg-diag2.mjs
apps/web/e2e/_jxg-affine.mjs       apps/web/e2e/_jxg-mobile.mjs
apps/web/e2e/_jxg-lifecycle.mjs    apps/web/e2e/_jxg-prod.mjs
apps/web/e2e/_jxg-shots.mjs
docs/experiments/JSXGRAPH_PILOT.md  (ce fichier — à garder comme trace)
```

### Fichiers modifiés (2 leçons, à rétablir)

```
apps/web/src/lessons/lycee/seconde/geometrie/vecteurs-2nde/modules/Module02LeMemeVecteur.jsx
  → retirer les 2 imports pilote, `const pilot/MoveLab`, remettre <VectorLab> à l'étape 1
apps/web/src/lessons/lycee/seconde/fonctions/fonction-affine-2nde/modules/Module01LeReservoir.jsx
  → retirer les 2 imports pilote, `const pilot`, remettre <TankLab> à l'étape 3
apps/web/package.json  → retirer la dépendance jsxgraph
```

### Dépendances ajoutées

`jsxgraph@1.13.3` (aucune autre ; rien n'a été mis à jour).

### Tests ajoutés

`pilotMath.test.js` — 11 tests, dont un balayage **exhaustif de 61 009
états** prouvant qu'une flèche ne sort jamais du cadre. `snapClamp`,
`slopeFromHandle` et `handleYForSlope` sont **sans dépendance** : si le pivot
est porté en SVG maison (§9), ce fichier reste valable tel quel.

### Commande

```bash
git checkout jsxgraph-pilot-baseline -- apps/web/src/lessons/lycee/seconde/geometrie/vecteurs-2nde/modules/Module02LeMemeVecteur.jsx \
                                        apps/web/src/lessons/lycee/seconde/fonctions/fonction-affine-2nde/modules/Module01LeReservoir.jsx
rm -rf apps/web/src/lessons/common/math-visualization
rm -f  apps/web/src/lessons/lycee/seconde/geometrie/vecteurs-2nde/components/VectorLabJSXGraph.jsx \
       apps/web/src/lessons/lycee/seconde/fonctions/fonction-affine-2nde/components/AffineLineLabJSXGraph.jsx \
       apps/web/e2e/_jsxgraph-*.mjs apps/web/e2e/_jxg-*.mjs
npm uninstall jsxgraph --workspace=apps/web
```

**Aucune implémentation d'origine n'a été supprimée ni réécrite.**
`VectorLab`, `TankLab`, `VectorScene`, `CoordPlane` sont intacts.
