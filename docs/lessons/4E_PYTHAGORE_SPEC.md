# 4e — `pythagore-4e` « Les trois carrés »

> Objet officiel `triangles` (BO n°10 du 5 mars 2026), domaine `espace_geometrie`,
> rôle **approfondissement** dans la chaîne 5e → **4e** → 3e.
> Part 2 de la clé catalogue `4e_triangles` (part 1 = `triangles-4e`, la démonstration).
> Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`.

## 1. Identité

**Idée centrale, vécue avant d'être nommée** : sur un triangle rectangle, le
carré construit sur l'hypoténuse est FAIT des deux autres. Pas « a pour aire la
somme » — littéralement fait : on peut découper les deux petits et remplir le
grand, sans trou ni chevauchement. L'égalité des aires précède l'égalité des
nombres, qui précède la formule.

## 2. Contrat curriculaire

| | |
|---|---|
| **Acquis 5e/4e** (`priorKnowledge`) | `angle-droit`, `aire`, `carre-ou-pas`, `racine-carree`, `encadrer-une-racine` (racines-carrees-4e) |
| **NOUVEAU en 4e** | hypoténuse · l'égalité des aires · l'énoncé du théorème · calculer l'hypoténuse · calculer un côté de l'angle droit · la réciproque · la contraposée |
| **Approfondi** | résoudre un problème réel (échelle, diagonale, écran) |
| **Réservé à la 3e** (exclu, garde exécutable) | application à la géométrie dans l'espace · le choix de la relation dans une configuration complexe · Thalès · trigonométrie |

`pythagore-3e` existe et fait des relevés sur une balance d'aires. La 4e ne
refait pas ce geste : elle **découpe et remplit** (découpage de Perigal). Même
mathématique, geste d'une autre nature — c'est la règle
« inspiration inter-niveaux » du dépôt.

## 3. Learning Points (catalogue, part 2 de `4e_triangles`)

```
4e_pythagore-4e_P1  Énoncer le théorème de Pythagore
4e_pythagore-4e_P2  Calculer la longueur de l'hypoténuse
4e_pythagore-4e_P3  Calculer la longueur d'un côté de l'angle droit
4e_pythagore-4e_P4  Utiliser la réciproque pour prouver qu'un triangle est rectangle
4e_pythagore-4e_P5  Utiliser la contraposée pour prouver qu'un triangle n'est pas rectangle
4e_pythagore-4e_P6  Résoudre un problème avec le théorème de Pythagore
```

## 4. Modèle mathématique — `components/pythagore4e.js`

- Le triangle est défini par ses trois sommets ; **tout** est mesuré sur la
  figure (§ « la figure ne ment jamais ») : côtés, angles, aires des carrés.
- `carreSurCote(A, B)` — les quatre sommets du carré construit à l'extérieur.
- `perigal(a, b)` — les cinq pièces (4 morceaux du carré moyen + le petit carré)
  et leur position cible dans le grand carré. Le découpage est CALCULÉ, jamais
  dessiné à la main.
- `hypotenuse(a, b)` et `coteAngleDroit(c, a)` — valeur exacte quand elle est
  entière, encadrement sinon (réutilise l'idée de `racines-carrees-4e`).
- `verdict(a, b, c)` — rectangle / pas rectangle, avec les deux membres calculés :
  c'est la réciproque ET la contraposée, selon le sens de lecture.
- `assertScope4e` lève sur `espace`, `thales`, `trigonometrie`.

## 5. Manipulation signature (M1) — `CarresLab`

Le sommet C est **contraint au cercle de diamètre [AB]** : l'angle droit est
préservé par la GÉOMÉTRIE, pas par un aimant qui corrigerait la position. Les
trois carrés se construisent, leurs aires s'affichent. L'élève déforme le
triangle : les trois nombres changent, l'égalité tient.

**Aha** : « les aires changent, l'égalité reste ».
Laissé aux modules suivants : casser l'angle droit (M2), le découpage (M3), la
formule (M3), les calculs (M4–M5), la réciproque (M6).

## 6. Modules

| M | Titre | Stage | Manipulation | LP |
|---|---|---|---|---|
| 0 | Mission de départ | prerequisite_check | diagnostic des 5 prérequis | — |
| 1 | Les trois carrés | trigger | `CarresLab` : C sur le cercle, trois aires en direct | P1 |
| 2 | Quand l'angle se casse | discovery | C libéré du cercle : l'égalité se rompt, une jauge dit aigu/droit/obtus | P1, P5 |
| 3 | Le grand carré est fait des deux autres | manipulation | `PerigalLab` : glisser 5 pièces dans le grand carré | P1 |
| 4 | Écrire, puis calculer | manipulation | `CalculLab` : de l'égalité des aires au nombre, hypoténuse | P2 |
| 5 | Le côté manquant | manipulation | même méthode, on soustrait | P3 |
| 6 | Rectangle ou pas ? | practice_lab | trois longueurs sans figure fiable : réciproque et contraposée, puis problèmes | P4, P5, P6 |
| 7 | 🏆 Mission finale | evaluation | 10 épreuves, ≥ 1 par LP | — |

Durée : 4+13+10+13+11+10+10+9 = **80 min** (≤ 90).

## 7. Continuité d'état

`continuity: { key: 'triangle', chain: [1, 2] }` — le triangle déformé au
module 1 est celui qu'on casse au module 2. Au-delà, les modules ont besoin de
triangles CHOISIS (3-4-5, puis des cas non entiers) : imposer la continuité y
serait artificiel et priverait la leçon de ses exemples.

## 8. Erreurs visées

- `a + b = c` au lieu de `a² + b² = c²` — testée explicitement au module 4 ;
- prendre l'hypoténuse pour un côté de l'angle droit (le triangle est dessiné
  « de travers » à plusieurs reprises) ;
- appliquer le théorème à un triangle non rectangle (module 2 et module 6) ;
- oublier la racine carrée après avoir trouvé le carré.

## 9. Vérification

`pythagore4e.test.js` (exactitude, périmètre, le découpage de Perigal couvre le
grand carré exactement) + `parcours.test.js` (les nombres annoncés, et
l'atteignabilité des positions du découpage). Navigateur :
`apps/web/e2e/lesson-kit/4e-pythagore.mjs` sur le port 5406.
