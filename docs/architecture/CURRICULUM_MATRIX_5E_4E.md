# Matrice curriculaire 5e / 4e — mathématiques

> **Généré depuis la source officielle du dépôt**, jamais saisi à la main :
> `packages/core/curriculum/smarter_academy_programmes_maths_2026.json`.
> Régénérer : `node scripts/gen-curriculum-matrix.mjs`.

## Autorité officielle

| Source | Publication | NOR |
| --- | --- | --- |
| Programmes d'enseignement de français et de mathématiques du cycle de consolidation (cycle 3) | BO n°16 du 17 avril 2025 | [MENE2504620A](https://www.education.gouv.fr/bo/2025/Hebdo16/MENE2504620A) |
| Programmes d'enseignement de français et de mathématiques du cycle des approfondissements (cycle 4) | BO n°10 du 5 mars 2026 | [MENE2602912A](https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2602912A) |
| Programme d'enseignement de mathématiques de la classe de seconde générale et technologique | BO n°14 du 2 avril 2026 | [MENE2602914A](https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602914A) |

Calendrier d'application : **6e** 2025-2026 · **5e** 2026-2027 · **4e** 2027-2028 · **3e** 2028-2029

> Le ministère publie des programmes, pas une liste de leçons. Les leçons Smarter Academy
> sont éditoriales et se rattachent chacune à **un** objet officiel — c'est exactement ce que fait
> `buildChaptersForGrade()` dans `coursesData.js`, qui GÉNÈRE le catalogue depuis ce référentiel.
> Il n'y a donc pas de catalogue à corriger à la main : le corriger, c'est corriger le référentiel
> ou enrichir `smaMetadata`.

---

## Ce que la matrice décide

Pour chaque objet officiel de 5e et de 4e :

- **Périmètre** — `teachingScope.include` / `exclude` du référentiel, qui portent déjà les
  frontières de niveau (« réservé à la 4e », « réservées à la 3e »…).
- **Propriétaire de niveau** — où le concept est *introduit*, *approfondi*, *maîtrisé*, *réutilisé*.
- **Ce qui ne doit PAS être enseigné ici** — la colonne qui empêche une leçon de voler la matière
  du niveau suivant.


---

# 5E — Nouveau programme de mathématiques du cycle 4 — application à la 5e à partir de 2026-2027

Statut : `applicable_2026_2027`

## Nombres et calculs

### Opérations

- **Objet officiel** : `operations` · domaine `nombres_calculs`
- **Chaîne verticale** : 6e → **5e**
- **Rôle en 5e** : maîtrise / réutilisation
- **Prérequis officiels** : Nombres entiers, Nombres décimaux, Fractions
- **Spécificité de niveau** : En 5e, les techniques sont consolidées et étendues aux nouveaux nombres et situations du cycle 4.

**Au programme de 5e**

- Calcul mental et en ligne sur décimaux
- Division par un nombre décimal
- Priorités opératoires avec parenthèses
- Enchaînement d'opérations
- Notion de multiple et diviseur

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Nombres relatifs dans les enchaînements complexes
- Fractions dans les priorités opératoires

### Nombres relatifs

- **Objet officiel** : `nombres_relatifs` · domaine `nombres_calculs`
- **Chaîne verticale** : **5e** → 4e
- **Rôle en 5e** : introduction
- **Prérequis officiels** : Nombres entiers, Droite graduée
- **Spécificité de niveau** : La priorité est la compréhension du sens et la maîtrise des opérations de base sur les nombres relatifs.

**Au programme de 5e**

- Définir nombres positifs/négatifs, opposé, valeur absolue
- Lire/placer sur droite graduée
- Comparer des relatifs
- Additionner et soustraire des relatifs

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Multiplier et diviser des nombres relatifs (réservé à la 4e)
- Priorités opératoires avec relatifs

### Nombres rationnels

- **Objet officiel** : `nombres_rationnels` · domaine `nombres_calculs`
- **Chaîne verticale** : **5e** → 4e → 3e
- **Rôle en 5e** : introduction
- **Prérequis officiels** : Fractions, Division, Nombres relatifs
- **Spécificité de niveau** : La 5e construit les bases des nombres rationnels ; elle ne doit pas anticiper les techniques et formalismes de 3e.

**Au programme de 5e**

- Fraction comme nombre
- Fractions égales
- Comparer des fractions (même dénominateur ou multiple)
- Addition/soustraction de fractions simples (dénominateurs multiples)
- Prendre une fraction d'une quantité

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Addition de fractions de dénominateurs quelconques
- Multiplication/division de fractions
- Nombres rationnels relatifs

### Puissances

- **Objet officiel** : `puissances` · domaine `nombres_calculs`
- **Chaîne verticale** : **5e** → 4e → 3e
- **Rôle en 5e** : introduction
- **Prérequis officiels** : Multiplication, Produit de facteurs identiques
- **Spécificité de niveau** : En 5e, la priorité est la construction du sens de la notation puissance et son utilisation numérique. Ne pas transformer cette leçon en cours avancé sur les règles algébriques des puissances.

**Au programme de 5e**

- Découvrir la notion de puissance d'un nombre (carré, cube)
- Carrés parfaits de 0 à 12
- Puissances de 10 (exposant positif)
- Calculs simples avec puissances

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Exposants négatifs
- Écriture scientifique (réservée à la 4e)
- Règles algébriques des puissances

### Calcul littéral et algébrique

- **Objet officiel** : `calcul_litteral` · domaine `nombres_calculs`
- **Chaîne verticale** : **5e** → 4e → 3e → seconde
- **Rôle en 5e** : introduction
- **Prérequis officiels** : Opérations, Priorités opératoires
- **Spécificité de niveau** : La 5e doit construire le langage algébrique avant les transformations plus avancées des niveaux supérieurs.

**Au programme de 5e**

- Utiliser une lettre comme inconnue ou variable
- Calculer la valeur d'une expression par substitution
- Développer avec la distributivité simple (numérique)
- Produire une formule

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Réduction d'expressions complexes
- Factorisation formelle
- Double distributivité
- Résolution formelle d'équations

## Espace et géométrie

### Repérage sur une droite et dans le plan

- **Objet officiel** : `reperage` · domaine `espace_geometrie`
- **Chaîne verticale** : **5e** → 4e → 3e
- **Rôle en 5e** : introduction
- **Prérequis officiels** : Repérage en 6e, Nombres relatifs

**Au programme de 5e**

- Abscisse d'un point (relatifs)
- Coordonnées dans le plan (repère orthogonal avec positifs et négatifs)

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Coordonnées dans l'espace

### Représentation de l'espace

- **Objet officiel** : `representations_espace` · domaine `espace_geometrie`
- **Chaîne verticale** : **5e** → 4e → 3e
- **Rôle en 5e** : introduction
- **Prérequis officiels** : Solides, Patrons

**Au programme de 5e**

- Vues (dessus, face, côté)
- Perspective cavalière de prismes et cylindres
- Patrons du prisme droit et du cylindre de révolution

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Sphère

### Transformations

- **Objet officiel** : `transformations` · domaine `espace_geometrie`
- **Chaîne verticale** : **5e** → 4e
- **Rôle en 5e** : introduction
- **Prérequis officiels** : Symétrie, Figures planes

**Au programme de 5e**

- Symétrie centrale (demi-tour)
- Construire un symétrique
- Propriétés de la symétrie centrale

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Translation
- Homothétie
- Rotation

### Angles

- **Objet officiel** : `angles` · domaine `espace_geometrie`
- **Chaîne verticale** : 6e → **5e**
- **Rôle en 5e** : maîtrise / réutilisation
- **Prérequis officiels** : Angles de 6e, Droites parallèles et perpendiculaires

**Au programme de 5e**

- Angles alternes-internes et correspondants
- Caractériser le parallélisme par les angles

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Lignes trigonométriques
- Angles inscrits

### Triangles

- **Objet officiel** : `triangles` · domaine `espace_geometrie`
- **Chaîne verticale** : **5e** → 4e → 3e
- **Rôle en 5e** : introduction
- **Prérequis officiels** : Figures planes, Angles

**Au programme de 5e**

- Somme des angles (180°)
- Inégalité triangulaire
- Construction à partir de données
- Médiatrices et cercle circonscrit
- Hauteurs et médianes (découverte)

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Théorème de Pythagore
- Théorème de Thalès
- Trigonométrie

### Parallélogrammes

- **Objet officiel** : `parallelogrammes` · domaine `espace_geometrie`
- **Chaîne verticale** : **5e**
- **Rôle en 5e** : introduction + maîtrise
- **Prérequis officiels** : Parallélisme, Quadrilatères

**Au programme de 5e**

- Définition et construction du parallélogramme
- Propriétés (côtés opposés, diagonales)
- Parallélogrammes particuliers (rectangle, losange, carré)

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Vecteurs

## Organisation et gestion de données et probabilités

### Statistiques

- **Objet officiel** : `statistiques` · domaine `donnees_probabilites`
- **Chaîne verticale** : **5e** → 4e → 3e
- **Rôle en 5e** : introduction
- **Prérequis officiels** : Tableaux, Graphiques

**Au programme de 5e**

- Recueillir/organiser des données
- Calculer effectifs et fréquences
- Représentations (tableaux, barres, circulaires)
- Moyenne simple

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Médiane
- Étendue
- Moyenne pondérée (réservées à la 4e)

### Probabilités

- **Objet officiel** : `probabilites` · domaine `donnees_probabilites`
- **Chaîne verticale** : **5e** → 4e → 3e
- **Rôle en 5e** : introduction
- **Prérequis officiels** : Fractions, Proportionnalité

**Au programme de 5e**

- Notion de hasard et d'expérience aléatoire
- Vocabulaire (issue, événement)
- Équiprobabilité simple
- Échelle de probabilité (0 à 1)

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Arbres de probabilité
- Événement contraire
- Réunion/intersection

## Proportionnalité et fonctions

### Proportionnalité

- **Objet officiel** : `proportionnalite` · domaine `proportionnalite_fonctions`
- **Chaîne verticale** : 6e → **5e** → 4e → 3e
- **Rôle en 5e** : approfondissement
- **Prérequis officiels** : Proportionnalité de 6e, Fractions

**Au programme de 5e**

- Utiliser un coefficient de proportionnalité
- Échelles, pourcentages, vitesse moyenne
- Représentation graphique (alignement de points)

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Produit en croix formel
- Fonctions linéaires

### Fonctions

- **Objet officiel** : `fonctions` · domaine `proportionnalite_fonctions`
- **Chaîne verticale** : **5e** → 4e → 3e → seconde
- **Rôle en 5e** : introduction
- **Prérequis officiels** : Repérage, Calcul littéral
- **Spécificité de niveau** : La 5e construit l'intuition fonctionnelle avant la formalisation plus poussée des fonctions affines et linéaires.

**Au programme de 5e**

- Expression 'en fonction de'
- Tableau de valeurs
- Lecture d'un graphique cartésien

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Notations f(x)
- Antécédent
- Image

## Pensée informatique

### Algorithmique et programmation

- **Objet officiel** : `algorithmique_programmation` · domaine `pensee_informatique`
- **Chaîne verticale** : 6e → **5e** → 4e → 3e
- **Rôle en 5e** : approfondissement
- **Prérequis officiels** : Raisonnement logique

**Au programme de 5e**

- Définir et utiliser des variables (lecture)
- Boucles inconditionnelles (répéter n fois)
- Tracer des figures simples

**Hors périmètre de 5e** (ne pas voler au niveau suivant)

- Conditions composées

---

# 4E — Programme de mathématiques du cycle 4 — nouveau programme applicable à la 4e à partir de 2027-2028

Statut : `future_2027_2028`

## Nombres et calculs

### Opérations sur les nombres relatifs

- **Objet officiel** : `nombres_relatifs` · domaine `nombres_calculs`
- **Chaîne verticale** : 5e → **4e**
- **Rôle en 4e** : maîtrise / réutilisation
- **Prérequis officiels** : Nombres relatifs de 5e
- **Spécificité de niveau** : La 4e vise une maîtrise plus systématique des règles de calcul et leur mobilisation dans des expressions.

**Au programme de 4e**

- Multiplication et division de nombres relatifs
- Règle des signes
- Enchaînement des 4 opérations sur les relatifs

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Racines carrées de nombres négatifs

### Nombres rationnels

- **Objet officiel** : `nombres_rationnels` · domaine `nombres_calculs`
- **Chaîne verticale** : 5e → **4e** → 3e
- **Rôle en 4e** : approfondissement
- **Prérequis officiels** : Fractions de 5e, Nombres relatifs
- **Spécificité de niveau** : La 4e augmente la complexité des calculs rationnels et prépare aux manipulations algébriques du niveau 3e.

**Au programme de 4e**

- Notion formelle de nombre rationnel
- Égalité des produits en croix
- Addition/soustraction de fractions de dénominateurs quelconques
- Multiplication/division de fractions
- Inverse d'un nombre

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Identités remarquables avec fractions

### Puissances

- **Objet officiel** : `puissances` · domaine `nombres_calculs`
- **Chaîne verticale** : 5e → **4e** → 3e
- **Rôle en 4e** : approfondissement
- **Prérequis officiels** : Puissances de 5e, Calcul littéral
- **Spécificité de niveau** : La 4e doit aller au-delà de la simple définition étudiée en 5e et renforcer les règles de calcul.

**Au programme de 4e**

- Puissances d'exposant négatif
- Notation scientifique
- Calculs avec des puissances de 10
- Ordres de grandeur
- Règles opératoires de base sur les exposants entiers

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Puissances littérales complexes
- Exponentielles

### Racine carrée

- **Objet officiel** : `racine_carree` · domaine `nombres_calculs`
- **Chaîne verticale** : **4e** → 3e
- **Rôle en 4e** : introduction
- **Prérequis officiels** : Carrés, Puissances, Aires
- **Spécificité de niveau** : La notion doit être construite à partir de son sens avant l'utilisation de propriétés plus avancées.

**Au programme de 4e**

- Définition de la racine carrée d'un positif
- Encadrement entre deux entiers
- Résolution de x² = a (parfois introduit)

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Opérations sur les racines (produit, quotient)
- Simplification de racine (ex: sqrt(12) = 2sqrt(3))

### Calcul littéral et algébrique

- **Objet officiel** : `calcul_litteral` · domaine `nombres_calculs`
- **Chaîne verticale** : 5e → **4e** → 3e → seconde
- **Rôle en 4e** : approfondissement
- **Prérequis officiels** : Calcul littéral de 5e, Nombres relatifs
- **Spécificité de niveau** : La 4e développe le langage algébrique nécessaire à la résolution d'équations et aux identités remarquables étudiées ensuite.

**Au programme de 4e**

- Distributivité simple et double (initiation)
- Réduire des expressions formelles
- Factoriser avec un facteur commun évident
- Tester une égalité
- Résolution d'équations du premier degré ax+b=c

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Identités remarquables
- Inéquations
- Équations produit nul

## Espace et géométrie

### Transformations

- **Objet officiel** : `transformations` · domaine `espace_geometrie`
- **Chaîne verticale** : 5e → **4e**
- **Rôle en 4e** : maîtrise / réutilisation
- **Prérequis officiels** : Transformations de 5e

**Au programme de 4e**

- Translation
- Lien avec le parallélogramme
- Propriétés de conservation des translations

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Vecteurs formels (relation de Chasles)
- Homothéties (réservées à la 3e)

### Repérage sur une droite et dans le plan

- **Objet officiel** : `reperage` · domaine `espace_geometrie`
- **Chaîne verticale** : 5e → **4e** → 3e
- **Rôle en 4e** : approfondissement
- **Prérequis officiels** : Repérage de 5e

**Au programme de 4e**

- Repérage dans le plan
- Lecture de coordonnées complexes

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Coordonnées dans l'espace

### Représentation de l'espace

- **Objet officiel** : `representations_espace` · domaine `espace_geometrie`
- **Chaîne verticale** : 5e → **4e** → 3e
- **Rôle en 4e** : approfondissement
- **Prérequis officiels** : Solides, Représentations de 5e

**Au programme de 4e**

- Pyramide, cône de révolution
- Reconnaître base, hauteur
- Volume de la pyramide et du cône

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Sections de solides (boule, plan)

### Parallélogrammes et translations

- **Objet officiel** : `parallelogrammes_translations` · domaine `espace_geometrie`
- **Chaîne verticale** : **4e**
- **Rôle en 4e** : introduction + maîtrise
- **Prérequis officiels** : Parallélogrammes de 5e, Transformations

**Au programme de 4e**

- Lien entre translation et parallélogramme

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Vecteurs

### Triangles

- **Objet officiel** : `triangles` · domaine `espace_geometrie`
- **Chaîne verticale** : 5e → **4e** → 3e
- **Rôle en 4e** : approfondissement
- **Prérequis officiels** : Triangles de 5e, Angles

**Au programme de 4e**

- Théorème de Pythagore (direct, réciproque, contraposée)
- Caractériser le triangle rectangle par le cercle circonscrit
- Droite des milieux

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Théorème de Thalès (complet)
- Trigonométrie (cos, sin, tan)

## Organisation et gestion de données et probabilités

### Statistiques

- **Objet officiel** : `statistiques` · domaine `donnees_probabilites`
- **Chaîne verticale** : 5e → **4e** → 3e
- **Rôle en 4e** : approfondissement
- **Prérequis officiels** : Statistiques de 5e

**Au programme de 4e**

- Moyenne pondérée
- Médiane
- Étendue
- Comparaison de séries statistiques

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Quartiles
- Boîte à moustaches (réservées à la 3e)

### Probabilités

- **Objet officiel** : `probabilites` · domaine `donnees_probabilites`
- **Chaîne verticale** : 5e → **4e** → 3e
- **Rôle en 4e** : approfondissement
- **Prérequis officiels** : Probabilités de 5e, Fractions

**Au programme de 4e**

- Événements et notations ensemblistes (intersection, réunion)
- Événement contraire
- Événement impossible/certain
- Fluctuation des fréquences

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Arbres pondérés complexes
- Probabilités conditionnelles

## Proportionnalité et fonctions

### Proportionnalité

- **Objet officiel** : `proportionnalite` · domaine `proportionnalite_fonctions`
- **Chaîne verticale** : 6e → 5e → **4e** → 3e
- **Rôle en 4e** : approfondissement
- **Prérequis officiels** : Proportionnalité de 5e

**Au programme de 4e**

- Quatrième proportionnelle (produit en croix)
- Calcul avec des pourcentages (augmentation, diminution)
- Coefficient multiplicateur

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Fonctions affines

### Fonctions

- **Objet officiel** : `fonctions` · domaine `proportionnalite_fonctions`
- **Chaîne verticale** : 5e → **4e** → 3e → seconde
- **Rôle en 4e** : approfondissement
- **Prérequis officiels** : Fonctions de 5e, Calcul littéral

**Au programme de 4e**

- Dépendance entre deux grandeurs
- Programme de calcul
- Produire une formule
- Représenter graphiquement

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Notions formelles d'image et antécédent
- Fonctions linéaires

## Pensée informatique

### Algorithmique et programmation

- **Objet officiel** : `algorithmique_programmation` · domaine `pensee_informatique`
- **Chaîne verticale** : 6e → 5e → **4e** → 3e
- **Rôle en 4e** : approfondissement
- **Prérequis officiels** : Algorithmique de 5e

**Au programme de 4e**

- Conditions (si... alors... sinon)
- Manipulation de variables informatiques simples
- Modification d'un programme existant

**Hors périmètre de 4e** (ne pas voler au niveau suivant)

- Boucles 'Tant que' complexes

---

# Graphe de dépendance des connaissances

Les chaînes verticales qui traversent 5e et 4e, dérivées du référentiel :

```text
operations                     6e → 5e
angles                         6e → 5e
proportionnalite               6e → 5e → 4e → 3e
algorithmique_programmation    6e → 5e → 4e → 3e
nombres_relatifs               5e → 4e
nombres_rationnels             5e → 4e → 3e
puissances                     5e → 4e → 3e
calcul_litteral                5e → 4e → 3e → seconde
reperage                       5e → 4e → 3e
representations_espace         5e → 4e → 3e
transformations                5e → 4e
triangles                      5e → 4e → 3e
statistiques                   5e → 4e → 3e
probabilites                   5e → 4e → 3e
fonctions                      5e → 4e → 3e → seconde
racine_carree                  4e → 3e
```

Lecture : un concept présent à plusieurs niveaux est **le même objet officiel** vu avec un
périmètre différent. La colonne « Hors périmètre » de chaque niveau est ce qui garantit que
l'approfondissement du niveau suivant a encore quelque chose à apprendre.
