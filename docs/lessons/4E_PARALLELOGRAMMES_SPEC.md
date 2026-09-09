# 4e — `parallelogrammes-translations-4e` « Le glissement qui ferme la figure »

> Objet officiel `parallelogrammes_translations` (BO n°10 du 5 mars 2026),
> domaine `espace_geometrie`, chaîne verticale : **4e** seule.
> Rôle en 4e : **introduction + maîtrise**.
> Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`.

## 1. Identité

**Idée centrale, vécue avant d'être nommée** : un parallélogramme n'est pas
seulement une forme, c'est la TRACE d'un glissement. Un même glissement emporte
A sur D et B sur C ; les deux trajets [AD] et [BC] sont alors parallèles et de
même longueur, et le quadrilatère ABCD se referme tout seul. L'élève ne
reconnaît donc pas un parallélogramme à son allure : il le fabrique en
glissant, et il le justifie par le glissement qui l'a produit.

Le renversement pédagogique de la leçon tient en une phrase :
**la 5e demandait « est-ce un parallélogramme ? », la 4e demande « quel
glissement l'a fait ? »** — et c'est la réponse à la seconde question qui
justifie la première.

## 2. Contrat curriculaire

| | |
|---|---|
| **Acquis 5e** (`priorKnowledge`) | `parallelogramme`, `construire-parallelogramme`, `cotes-opposes-egaux`, `diagonales-milieu`, `caracterisations` (leçon `parallelogrammes-5e`), plus `droites-paralleles`, `milieu-segment`, `quadrilatere`, `diagonale`, `notation-segment`, `angle-droit` (6e) |
| **NOUVEAU en 4e** | le glissement comme cause · le parallélogramme comme trace d'un glissement · construire le 4e sommet PAR le glissement · les trois écarts égaux (le « même déplacement ») · justifier par le glissement · la chaîne donnée → propriété → conclusion d'une démonstration |
| **Approfondi** | la caractérisation « deux côtés opposés parallèles ET de même longueur », vue en 5e comme un critère, devient ici la PROPRIÉTÉ mobilisée dans une démonstration rédigée |
| **Réservé à la 3e** (exclu, garde exécutable) | le **vecteur**, sa **notation** (→, u⃗, AB⃗), ses **coordonnées**, la **relation de Chasles**, la composition de translations |

Le mot « vecteur » n'apparaît **nulle part** dans la leçon. La frontière est
EXÉCUTABLE : `assertScope4e('vecteur' | 'chasles' | 'coordonnees-vecteur')`
lève, et un test balaye tous les fichiers de la leçon à la recherche du mot.

**Leçon sœur** : `transformations-4e` enseigne la translation elle-même (le
glissement, ses trois caractères, l'image d'un point, les invariants, et déjà
la brique `translation-parallelogramme`). Cette leçon-ci ne la redéfinit pas :
elle la reçoit en `priorKnowledge` (`translation`, `image`,
`invariants-translation`, `translation-parallelogramme`) et va plus loin — le
quatrième sommet CONSTRUIT, la justification RÉDIGÉE, la démonstration
COMPLÈTE. Aucune brique de la sœur n'est redéclarée ici.

## 3. Learning Points (catalogue `4e_parallelogrammes_translations`)

```
4e_parallelogrammes-translations-4e_P1  Reconnaître le parallélogramme formé par une translation
4e_parallelogrammes-translations-4e_P2  Construire le quatrième sommet d'un parallélogramme par translation
4e_parallelogrammes-translations-4e_P3  Justifier qu'un quadrilatère est un parallélogramme par une translation
4e_parallelogrammes-translations-4e_P4  Utiliser le lien translation / parallélogramme dans une démonstration
```

## 4. Modèle mathématique — `components/paral4e.js`

Règle du fichier : **la figure ne ment jamais**. Chaque affirmation de la leçon
(« ces côtés sont parallèles », « ces longueurs sont égales », « les diagonales
se coupent en leur milieu ») est CALCULÉE sur les quatre points réellement
dessinés, jamais écrite à côté d'un dessin approximatif.

- `glissementEntre(A, Aprime)` — le déplacement, décrit **sans le mot vecteur** :
  `{ dx, dy, longueur, directionDeg }`. C'est le « même déplacement » que
  l'élève lit sur les trois écarts.
- `glisser(P, g)` — l'image d'un point par ce déplacement.
- `quatriemeSommet(A, B, D)` — le point C tel que ABCD soit un parallélogramme,
  obtenu **par le glissement A→D appliqué à B** (et non par le milieu commun
  des diagonales, qui est le geste de 5e). Un test vérifie que les deux
  constructions coïncident : c'est la même mathématique, vue autrement.
- `etatQuad(q)` — les quatre témoins (deux parallélismes, deux égalités de
  longueurs) et les diagonales, tous MESURÉS, avec l'écart restant.
- `estParallelogramme(q)` — la définition (côtés opposés parallèles), calculée
  sur les points DESSINÉS, via `oppositeSidesParallel` de `geometry2d`.
- `invariants(g, pts)` — ce que le glissement conserve : longueurs, angles,
  aire, parallélisme. Le test vérifie chacun.
- `demonstration(nom)` — la chaîne **donnée → propriété → conclusion** d'une
  démonstration rédigée, sous forme de données, pas de texte figé : les trois
  maillons sont des objets, mélangeables, et le module 6 fait remettre l'ordre.
- `assertScope4e(sujet)` — lève sur `vecteur`, `chasles`, `coordonnees-vecteur`,
  `composition`.

`geometry2d.js` est RÉUTILISÉ (`oppositeSidesParallel`, `oppositeSidesEqual`,
`diagonalLengths`, `midpoint`, `areParallel`, `lineThrough`, `sideLengths`,
`polygonArea`, `interiorAngles`) : rien n'est réécrit.

## 5. Manipulation signature (M1) — `ConstructeurLab`

**A, B et D sont saisissables et se glissent.** Le déplacement qui mène A à D
est calculé, puis appliqué à B : C apparaît, et ABCD se referme. Les quatre
témoins s'allument EN DIRECT, calculés sur les points dessinés : (AB) ∥ (DC),
(AD) ∥ (BC), AB = DC, AD = BC, plus les diagonales et leur milieu commun.

Un mode **défi** cache un sommet : l'élève doit le replacer, et le lab dit à
quelle distance il est de la position juste — sans jamais aimanter.

Décisions techniques, toutes des pièges déjà rencontrés dans ce dépôt :
- `setPointerCapture` sur chaque poignée, sinon le glissement se fige au
  premier pixel dès que le pointeur quitte la pastille ;
- `hitR` **mesuré** (≈ 68 unités de viewBox pour un cadre de ~620 unités) pour
  atteindre 44 px CSS à 375 px de large ;
- le **viewBox est DÉRIVÉ du contenu** — englobant les quatre sommets, les
  traces du glissement et les diagonales, avec marge. Un cadre fixe laisserait
  C sortir de l'écran dès que D s'éloigne : c'est exactement le défaut qui a
  mordu `pythagore-4e`, et un test de sécurité visuelle le verrouille ici ;
- tous les nombres sont affichés **hors du SVG**, dans le DOM.

**Aha** : « je ne place pas C, je le laisse arriver — c'est le glissement qui
le pose ».

## 6. Modules

| M | Titre | Stage | Manipulation | LP |
|---|---|---|---|---|
| 0 | Mission de départ | prerequisite_check | diagnostic des acquis de 5e (parallélogramme, côtés opposés, diagonales) et du glissement | — |
| 1 | Le quatrième point arrive tout seul | trigger | `ConstructeurLab` : A, B, D se glissent, C suit, les témoins s'allument | P1, P2 |
| 2 | Un seul glissement, deux trajets | discovery | même lab, on compare les deux trajets [AD] et [BC] : même longueur, même direction | P1 |
| 3 | Place le point qui manque | manipulation | `ConstructeurLab` en mode défi : C est caché, à reconstruire | P2 |
| 4 | Le même déplacement partout | manipulation | glisser une figure entière : chaque point trace le même trajet | P1, P3 |
| 5 | Le dire proprement | manipulation | la justification en une phrase : quel glissement, quels deux points | P3 |
| 6 | Trois lignes qui prouvent | practice_lab | remettre en ordre donnée → propriété → conclusion, puis rédiger | P4 |
| 7 | 🏆 Mission finale | evaluation | 10 épreuves, les 4 LP couverts | — |

Durée : 4 + 12 + 8 + 9 + 8 + 7 + 8 + 8 = **64 min** (≤ 90).
`durationMinutes` du catalogue réaligné sur 64.

## 7. Continuité d'état

`continuity: { key: 'quad', chain: [1, 2, 3] }` — le quadrilatère construit au
module 1 est celui qu'on décortique au module 2, puis celui dont on cache un
sommet au module 3. Au-delà, les modules 4 à 6 ont besoin de configurations
CHOISIES (une figure entière à glisser, puis des énoncés sans figure) : y
imposer la continuité serait artificiel.

## 8. Erreurs visées

- **relier M N M' N' au lieu de M M' N' N** : on traverse la figure au lieu
  d'en faire le tour, et on obtient un quadrilatère croisé (M2, M5) ;
- croire qu'il suffit que deux côtés soient **de même longueur** — sans le
  parallélisme — pour conclure (M5, boss) ;
- croire que le glissement **tourne** la figure (M4, contre le demi-tour de 5e) ;
- **placer C au jugé** au lieu de reporter le déplacement (M3) ;
- conclure sans nommer la **propriété** utilisée dans la démonstration (M6).

## 9. Vérification

`paral4e.test.js` (exactitude, périmètre exécutable, le glissement conserve ce
qu'il doit conserver, les deux constructions du quatrième sommet coïncident) +
`parcours.test.js` (chaque nombre montré par un module, l'ATTEIGNABILITÉ des
positions à la grille, et la SÉCURITÉ VISUELLE du cadre dérivé sur toutes les
positions atteignables). Navigateur :
`apps/web/e2e/lesson-kit/4e-parallelogrammes.mjs` sur le port **5407**.
