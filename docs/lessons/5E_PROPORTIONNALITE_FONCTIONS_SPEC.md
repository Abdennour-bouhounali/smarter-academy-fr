# 5e — Famille 7 « Proportionnalité & fonctions »

> Deux leçons, et deux seulement : `proportionnalite-5e` et `fonctions-5e`.
> Référentiel officiel 2026 (BO n°10 du 5 mars 2026), domaine
> `proportionnalite_fonctions`. Périmètre : `docs/architecture/CURRICULUM_MATRIX_5E_4E.md`.

---

## Pourquoi ces deux leçons ne se ressemblent pas

Les deux parlent de « deux grandeurs qui varient ensemble ». Si on les écrit sans y prendre
garde, on obtient deux fois le même tableau et deux fois le même graphique. La frontière est
donc posée en premier, et elle est mathématique :

| | Proportionnalité | Fonctions |
|---|---|---|
| Objet d'étude | **le coefficient** — le nombre qui ne change pas | **la dépendance** — B est déterminé par A |
| Question centrale | « est-ce proportionnel ? combien vaut k ? » | « qu'est-ce qui dépend de quoi ? » |
| Le tableau sert à | trouver une valeur manquante | lire une correspondance |
| Le graphique sert à | reconnaître l'alignement **avec l'origine** | lire une valeur, répondre à une question |
| Cas non proportionnel | un **contre-exemple** à écarter | un **cas parfaitement normal** |

Ce dernier point est le pivot de la famille. En proportionnalité, « non proportionnel » est ce
qu'on apprend à rejeter ; en fonctions, c'est ce qu'on apprend à accepter. La leçon
« Fonctions » commence donc là où « Proportionnalité » s'arrête, et la dernière ligne de la
première est la première question de la seconde.

---

## Ce qui est déjà pris, et qu'on ne reprend pas

- **6e `proportionnalite`** — la kermesse, le distributeur de crêpes, le passage par l'unité,
  la linéarité additive, double/triple/moitié. Le graphique y est **exclu** du programme.
- **3e `proportionnalite-3e`** — la recette pour 7, le coefficient nommé, les quatre chemins
  vers la case vide, k / k² / k³, Thalès, le produit en croix.
- **3e `fonctions-3e`** — la machine mystère, image, antécédent, f(x).

La 5e occupe l'espace laissé libre : elle **installe le coefficient comme opérateur** (la 6e
passait par l'unité sans jamais le nommer un nombre unique), elle ajoute les **trois transferts
propres au niveau** (échelle, pourcentage, vitesse) et elle **ouvre le graphique**, qui était
hors programme en 6e. Elle ne dit ni « produit en croix », ni « fonction linéaire », ni « f(x) ».

---

## Leçon A — `proportionnalite-5e`

**Idée centrale, vécue avant d'être nommée** : passer d'une grandeur à l'autre, c'est toujours
multiplier par le **même** nombre. Ce nombre a un sens concret — un prix à l'unité, une vitesse,
une échelle — et c'est lui, pas la table de valeurs, qui *est* la situation.

**Manipulation signature (M1) — le doseur.** Deux curseurs, deux situations qui tournent
côte à côte dans le même écran :

- à gauche, un **distributeur de sirop** : on choisit le nombre de verres, le sirop suit ;
- à droite, un **abonnement de piscine** : on choisit le nombre d'entrées, le prix suit *aussi*.

Les deux réagissent. Les deux montent. L'élève prédit, manipule, et découvre que **seule l'une
des deux double quand on double l'entrée**. La question « qu'est-ce qui change ? » du brief est
répondue par un geste, pas par une phrase : on double, et on regarde laquelle des deux colonnes
double avec.

Ce que M1 laisse aux autres modules : le mot *coefficient* (M2), le tableau (M3), l'échelle et
le pourcentage (M4, M5), le graphique (M6).

**Progression** (la chaîne demandée : relation → facteur commun → linéarité → unité →
coefficient → tableau → graphique) :

| M | Titre | Rôle | Ce qui s'y découvre |
|---|---|---|---|
| 0 | Mission de départ | diagnostic | tables, quotient, décimaux, lecture de tableau, repérage |
| 1 | Le doseur | déclencheur | deux grandeurs varient ; une seule double quand on double |
| 2 | Le nombre qui ne bouge pas | découverte | le rapport B/A est constant → **coefficient** |
| 3 | Quatre cases, plusieurs chemins | manipulation | unité, facteur, coefficient — dans un **tableau** |
| 4 | La carte et le terrain | manipulation | **échelle** : un coefficient qu'on ne choisit pas |
| 5 | Les soldes | manipulation | **pourcentage** comme coefficient |
| 6 | La ligne droite | manipulation | **graphique** : alignement *avec l'origine* |
| 7 | Vitesse moyenne | labo | le coefficient a une **unité** (km/h) |
| 8 | Mission finale | évaluation | 10 épreuves, transfert |

**Hors périmètre, à ne pas voler** : produit en croix formel (4e), fonctions linéaires (3e),
proportionnalité inverse.

---

## Leçon B — `fonctions-5e`

**Idée centrale** : dans une situation, une grandeur en **détermine** une autre. Dire *« le
prix en fonction du nombre de croissants »*, c'est nommer qui commande et qui suit — et cet
ordre n'est pas symétrique.

**Manipulation signature (M1) — la machine à croissants n'est PAS reprise de la 3e.** Ici, pas
de machine à nombres : un **four à pain**. L'élève règle une seule chose — la durée de cuisson —
et trois grandeurs réagissent en même temps sur le même écran : la **couleur** du pain, sa
**masse** (elle diminue, l'eau s'évapore) et la **température à cœur**. Le geste est unique,
les conséquences sont multiples et *toutes* dépendent de la même entrée.

L'« aha » que le module ne dit pas le premier : **on peut remettre le four sur 12 minutes et on
retrouve exactement le même pain**. Une même entrée redonne la même sortie — c'est ce qui fait
qu'une dépendance mérite d'être écrite. Et l'élève constate que la masse *baisse* quand la durée
*monte* : dépendre, ce n'est pas « augmenter ensemble ». C'est la porte d'entrée du non
proportionnel comme cas normal.

**Progression** (grandeur A → B dépend de A → « en fonction de » → tableau → points → graphique
→ expression simple) :

| M | Titre | Rôle | Ce qui s'y découvre |
|---|---|---|---|
| 0 | Mission de départ | diagnostic | repérage, calcul littéral, lecture de tableau |
| 1 | Le four | déclencheur | une entrée, des sorties qui suivent ; même entrée → même sortie |
| 2 | Qui commande qui ? | découverte | **« en fonction de »**, et son sens orienté |
| 3 | Le carnet de bord | manipulation | **tableau de valeurs** : ranger la dépendance |
| 4 | Un point, une ligne | manipulation | chaque couple devient un **point** |
| 5 | Lire le graphique | manipulation | répondre à une question concrète sur le dessin |
| 6 | Le programme de calcul | manipulation | **expression simple** — sans f(x) |
| 7 | Mission finale | évaluation | 10 épreuves, transfert |

**Hors périmètre, absolu** : `f(x)`, image, antécédent, fonction linéaire, fonction affine.
Ces mots ne doivent apparaître nulle part — ni en énoncé, ni en distracteur, ni en correction.
Un garde exécutable le vérifie (`npm run check:level-leak`, périmètre étendu à la 5e).

---

## Cartes des connaissances

**Proportionnalité**

```
relation entre grandeurs (M1)
        ↓
coefficient de proportionnalité (M2)
        ↓
tableau de proportionnalité (M3)
        ↓
    ┌───┴────┬──────────┐
échelle(M4) pourcentage(M5)  graphique / alignement (M6)
    └───┬────┴──────────┘
        ↓
vitesse moyenne — le coefficient a une unité (M7)
```

**Fonctions**

```
grandeur d'entrée (M1)
        ↓
dépendance (M1) ──→ « en fonction de » (M2)
        ↓
tableau de valeurs (M3)
        ↓
points (M4)
        ↓
représentation graphique (M5)
        ↓
expression simple (M6)
```

---

## Le lexique

`scripts/audit/lexicon.json` date `tableau-de-valeurs`, `representation-graphique` et
`fonction` de la **3e**, alors que le référentiel 2026 fait démarrer la chaîne `fonctions` en
**5e** et met explicitement « Tableau de valeurs » et « Lecture d'un graphique cartésien » au
programme de 5e (`CURRICULUM_MATRIX_5E_4E.md`). **Le lexique n'a pas été modifié** : les deux
leçons passent l'audit `--strict` sans aucun constat, parce que chacun de ces termes est posé
par une `<KnowledgeBrick>` AVANT sa première demande — l'état B du contrat. La divergence de
`grade` reste donc sans effet ici, et la corriger relève d'une passe sur le lexique, pas de la
construction de ces deux leçons. `fonction-lineaire`, `fonction-affine`, `coefficient-directeur`
et `ordonnee-origine` restent en 3e : ils sont hors périmètre de la 5e, et aucune des deux
leçons ne les emploie.

---

## Validation

Tableaux, graphiques, valeurs, manipulations, LP evidence, carte des connaissances, test final,
responsive — la suite e2e `apps/web/e2e/lesson-kit/5e-proportionnalite-fonctions.mjs` balaie
les curseurs sur toute leur plage (jamais un échantillon), vérifie l'absence de collision et de
débordement à 375 px, et interdit tout vocabulaire de 3e.
