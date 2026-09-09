# 4e — `representations-espace-4e` « Le labo 3D »

> Objet officiel `representations_espace` (BO n°10 du 5 mars 2026), domaine
> `espace_geometrie`, rôle **approfondissement** dans la chaîne 5e → **4e** → 3e.
> Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`.

## 1. Identité

**Idée centrale, vécue avant d'être nommée** : une pyramide et un prisme de
même base et même hauteur ne contiennent pas la même chose — il en faut
exactement **trois** pour remplir le prisme. Le tiers n'est pas une formule à
retenir : c'est un nombre de versements qu'on compte.

## 2. Contrat curriculaire

| | |
|---|---|
| **Acquis 5e** (`priorKnowledge`) | `perspective-cavaliere`, `trois-vues`, `patron-prisme`, `dimensions-solide`, `aire` |
| **NOUVEAU en 4e** | la pyramide et le cône de révolution · reconnaître leur base et leur hauteur · le volume = ⅓ × base × hauteur · le patron de la pyramide |
| **Approfondi** | résoudre un problème de volume, changer une dimension et prévoir l'effet |
| **Réservé à la 3e** (exclu, garde exécutable) | la boule et la sphère · les **sections de solides par un plan** · l'agrandissement des volumes (k³) |

La 5e s'arrêtait aux vues, à la perspective cavalière et aux patrons du prisme
et du cylindre. La 4e ajoute deux solides **pointus** et la seule formule de
volume que le programme lui confie.

**Note de périmètre importante** : la demande initiale évoquait un plan de
coupe mobile et l'observation des sections. Les sections de solides sont
explicitement `exclude` en 4e et `include` en 3e
(`representation-espace-3e`). Le labo 3D fait donc tourner, déplier,
redimensionner et **remplir** — il ne coupe pas.

## 3. Learning Points (catalogue, `4e_representations_espace`)

```
4e_representations-espace-4e_P1  Reconnaître une pyramide et un cône de révolution
4e_representations-espace-4e_P2  Identifier la base et la hauteur d'une pyramide
4e_representations-espace-4e_P3  Identifier la base et la hauteur d'un cône
4e_representations-espace-4e_P4  Calculer le volume d'une pyramide
4e_representations-espace-4e_P5  Calculer le volume d'un cône de révolution
4e_representations-espace-4e_P6  Résoudre un problème de volume
```

## 4. Modèle mathématique — `components/espace4e.js`

- Les solides paramétriques viennent de `common/utils/geometry3d.js`
  (`makePyramide`, `makePrismeCarre`, `makeCone`, `makeCylindre`), ajoutés pour
  cette leçon et vérifiés sur 20 couples de dimensions et 60 rotations.
- `volumePyramide(base, hauteur)`, `volumeCone(rayon, hauteur)`,
  `volumePrisme`, `volumeCylindre` — et surtout `versements(pyramide, prisme)`,
  qui **compte** combien de contenus de pyramide remplissent le prisme.
- `hauteurEstPerpendiculaire(solide)` — la hauteur est le segment du sommet au
  plan de base, jamais l'arête latérale. C'est le piège du niveau.
- `patronPyramide(cote, hauteur)` — la base et les quatre triangles, avec leur
  **apothème** calculé (≠ hauteur de la pyramide).
- `assertScope4e` lève sur `section`, `sphere`, `boule`, `agrandissement-volume`.

## 5. Manipulation signature (M1) — `RemplissageLab`

Deux solides de même base et même hauteur, tournés à la main
(`SolidTurner`) : un prisme et une pyramide. L'élève règle le côté de la base
et la hauteur, puis **verse** la pyramide dans le prisme. Une jauge cumule le
volume versé.

**Aha** : il faut exactement 3 versements, et cela ne dépend ni de la base ni
de la hauteur — l'élève peut les changer et recompter.

Laissé aux modules suivants : base et hauteur nommées (M2), le patron (M3), le
cône (M4), les formules écrites (M5), les problèmes (M6).

## 6. Modules

| M | Titre | Stage | Manipulation | LP |
|---|---|---|---|---|
| 0 | Mission de départ | prerequisite_check | diagnostic des 5 prérequis | — |
| 1 | Trois versements | trigger | `RemplissageLab` : verser, recompter à d'autres dimensions | P4 |
| 2 | La pointe et le plancher | discovery | déplacer le sommet : la base ne change pas, la hauteur reste perpendiculaire | P1, P2 |
| 3 | Déplier la pyramide | manipulation | `PatronLab` : poser les quatre triangles autour de la base | P1, P2 |
| 4 | Le cône, tourné d'un triangle | manipulation | `RevolutionLab` : faire tourner un triangle, le cône naît ; même ⅓ | P1, P3, P5 |
| 5 | Les deux formules | formalization | comparer les deux calculs sur une même base | P4, P5 |
| 6 | La tente et le cornet | practice_lab | trois problèmes, dont un où l'on change une dimension | P6 |
| 7 | 🏆 Mission finale | evaluation | 10 épreuves, ≥ 1 par LP | — |

Durée : 4+13+10+11+11+9+9+8 = **75 min** (≤ 90).

## 7. Continuité d'état

`continuity: { key: 'solide', chain: [1, 2] }` — les dimensions réglées au
module 1 sont celles qu'on examine au module 2. Ensuite, chaque module a besoin
de solides choisis (un patron lisible, un cône, des données de problème).

## 8. Erreurs visées

- prendre l'**arête latérale** pour la hauteur (M2, et un distracteur chiffré
  au boss) ;
- oublier le tiers (M5, M6) ;
- confondre l'aire de la base et le volume (M5) ;
- croire que doubler la hauteur double… la base (M6).

## 9. Vérification

`espace4e.test.js` (les volumes, le tiers pour toutes les dimensions, le patron
qui se referme, le périmètre exécutable) + `parcours.test.js` (chaque nombre
montré). Navigateur : `apps/web/e2e/lesson-kit/4e-espace.mjs` sur le port 5409.
