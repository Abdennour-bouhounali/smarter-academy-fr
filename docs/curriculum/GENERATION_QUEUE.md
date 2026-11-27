# File de génération des leçons du collège

> **Généré** par `scripts/learning-net-queue.mjs` depuis le réseau des compétences — ne pas éditer à la main.
> **Phase A d’abord** : ce dont l’élève de la classe d’ancrage (Troisième) a besoin MAINTENANT — ses unités dans
> l’ordre du catalogue ; pour chaque leçon, ses prérequis DIRECTS des classes antérieures, pris dans la classe la plus récente.
> Ensuite : les chaînes complètes des leçons, de la classe d’ancrage à la première ; les leçons isolées en dernier ; chaque
> synthèse juste après la dernière leçon de son unité. Contrat : `docs/architecture/LEARNING_NET.md` §4.

**54** leçons à générer (12 synthèses).

## Phase A — ce dont la classe d’ancrage a besoin maintenant, unité par unité (0)

### Unité 1 — Multiples et diviseurs (0) — rien à générer : ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de Quatrième) : ils seront générés avec leur classe.

### Unité 2 — Développer et factoriser (0) — rien à générer : ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de Quatrième) : ils seront générés avec leur classe.

### Unité 3 — Thalès et triangles semblables (0) — rien à générer : ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de Quatrième, Cinquième) : ils seront générés avec leur classe.

### Unité 4 — Résoudre des équations (0) — rien à générer : ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de Quatrième) : ils seront générés avec leur classe.

### Unité 5 — La notion de fonction (0) — rien à générer : ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de Quatrième, Cinquième) : ils seront générés avec leur classe.

### Unité 6 — Puissances et racine carrée (0) — rien à générer : ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de Quatrième) : ils seront générés avec leur classe.

### Unité 7 — Trigonométrie (0) — rien à générer : ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de Quatrième) : ils seront générés avec leur classe.

### Unité 8 — Fonctions linéaires et affines (0) — rien à générer : ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de Quatrième, Cinquième) : ils seront générés avec leur classe.

### Unité 9 — Statistiques et probabilités (0) — rien à générer : ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de Quatrième, Cinquième) : ils seront générés avec leur classe.

### Unité 10 — Programmer : blocs, boucles et scripts (0) — rien à générer : ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de Quatrième) : ils seront générés avec leur classe.

### Unité 11 — Rotations et homothéties (0) — rien à générer : ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de Quatrième, Cinquième, Sixième) : ils seront générés avec leur classe.

### Unité 12 — Vitesses, débits et volumes (0) — rien à générer : ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de Quatrième, Cinquième) : ils seront générés avec leur classe.

### Unité 13 — Représenter l’espace (0) — rien à générer : ses prérequis directs des classes antérieures n’ont pas encore de leçon (items « stub » de Quatrième) : ils seront générés avec leur classe.

## Phase B — depuis les leçons de Troisième (54)

| # | leçon | classe | unité | déclenchée par |
|---:|---|---|---|---|
| 1 | `oppose-d-une-expression` — L’opposé d’une expression et les parenthèses | Troisième | `developper-et-factoriser` | `oppose-d-une-expression` |
| 2 | `double-distributivite` — Développer un produit de deux sommes | Troisième | `developper-et-factoriser` | `double-distributivite` |
| 3 | `difference-de-deux-carres` — Factoriser une différence de deux carrés | Troisième | `developper-et-factoriser` | `difference-de-deux-carres` |
| 4 | `prouver-avec-le-calcul-litteral` — Prouver avec des lettres : programmes de calcul | Troisième | `developper-et-factoriser` | `prouver-avec-le-calcul-litteral` |
| 5 | `vers-le-brevet-developper-et-factoriser` — Vers le brevet — Développer et factoriser _(synthèse)_ | Troisième | `developper-et-factoriser` | unité developper-et-factoriser complète |
| 6 | `triangles-semblables` — Reconnaître des triangles semblables | Troisième | `thales-et-triangles-semblables` | `triangles-semblables` |
| 7 | `reciproque-de-thales` — Prouver que deux droites sont parallèles | Troisième | `thales-et-triangles-semblables` | `reciproque-de-thales` |
| 8 | `vers-le-brevet-thales-et-triangles-semblables` — Vers le brevet — Thalès et triangles semblables _(synthèse)_ | Troisième | `thales-et-triangles-semblables` | unité thales-et-triangles-semblables complète |
| 9 | `calculer-avec-des-fractions` — Résoudre des problèmes avec des fractions | Troisième | `resoudre-des-equations` | `calculer-avec-des-fractions` |
| 10 | `mettre-un-probleme-en-equation` — Mettre un problème en équation | Troisième | `resoudre-des-equations` | `mettre-un-probleme-en-equation` |
| 11 | `equation-produit-nul` — Résoudre une équation produit nul | Troisième | `resoudre-des-equations` | `equation-produit-nul` |
| 12 | `equation-x-carre-egal-a` — Résoudre l’équation x² = a | Troisième | `resoudre-des-equations` | `equation-x-carre-egal-a` |
| 13 | `vers-le-brevet-resoudre-des-equations` — Vers le brevet — Résoudre des équations _(synthèse)_ | Troisième | `resoudre-des-equations` | unité resoudre-des-equations complète |
| 14 | `notion-de-fonction` — Qu’est-ce qu’une fonction ? Image et antécédent | Troisième | `la-notion-de-fonction` | `notion-de-fonction` |
| 15 | `lire-une-fonction` — Lire une fonction dans un tableau ou sur une courbe | Troisième | `la-notion-de-fonction` | `lire-une-fonction` |
| 16 | `antecedent-par-le-calcul` — Trouver un antécédent par le calcul | Troisième | `la-notion-de-fonction` | `antecedent-par-le-calcul` |
| 17 | `vers-le-brevet-la-notion-de-fonction` — Vers le brevet — La notion de fonction _(synthèse)_ | Troisième | `la-notion-de-fonction` | unité la-notion-de-fonction complète |
| 18 | `puissances-d-exposant-negatif` — Les puissances d’exposant négatif | Troisième | `puissances-et-racines` | `puissances-d-exposant-negatif` |
| 19 | `notation-scientifique-en-probleme` — Très grand, très petit : la notation scientifique | Troisième | `puissances-et-racines` | `notation-scientifique-en-probleme` |
| 20 | `racine-carree-en-probleme` — Utiliser la racine carrée pour calculer une longueur | Troisième | `puissances-et-racines` | `racine-carree-en-probleme` |
| 21 | `vers-le-brevet-puissances-et-racines` — Vers le brevet — Puissances et racine carrée _(synthèse)_ | Troisième | `puissances-et-racines` | unité puissances-et-racines complète |
| 22 | `cosinus-sinus-tangente` — Cosinus, sinus et tangente d’un angle | Troisième | `trigonometrie` | `cosinus-sinus-tangente` |
| 23 | `calculer-un-angle` — Calculer un angle dans un triangle rectangle | Troisième | `trigonometrie` | `calculer-un-angle` |
| 24 | `resoudre-un-triangle-rectangle` — Résoudre un triangle rectangle | Troisième | `trigonometrie` | `resoudre-un-triangle-rectangle` |
| 25 | `vers-le-brevet-trigonometrie` — Vers le brevet — Trigonométrie _(synthèse)_ | Troisième | `trigonometrie` | unité trigonometrie complète |
| 26 | `fonction-lineaire` — Fonction linéaire et proportionnalité | Troisième | `fonctions-lineaires-et-affines` | `fonction-lineaire` |
| 27 | `fonction-affine` — Fonction affine et sa droite | Troisième | `fonctions-lineaires-et-affines` | `fonction-affine` |
| 28 | `pourcentage-d-evolution` — Augmenter ou baisser d’un pourcentage | Troisième | `fonctions-lineaires-et-affines` | `pourcentage-d-evolution` |
| 29 | `modeliser-avec-une-fonction` — Choisir une fonction pour résoudre un problème | Troisième | `fonctions-lineaires-et-affines` | `modeliser-avec-une-fonction` |
| 30 | `vers-le-brevet-fonctions-lineaires-et-affines` — Vers le brevet — Fonctions linéaires et affines _(synthèse)_ | Troisième | `fonctions-lineaires-et-affines` | unité fonctions-lineaires-et-affines complète |
| 31 | `etendue-d-une-serie` — Comparer des séries : moyenne, médiane, étendue | Troisième | `statistiques-et-probabilites` | `etendue-d-une-serie` |
| 32 | `histogramme` — Lire et tracer un histogramme | Troisième | `statistiques-et-probabilites` | `histogramme` |
| 33 | `probabilite-une-epreuve` — Calculer une probabilité en comptant les issues | Troisième | `statistiques-et-probabilites` | `probabilite-une-epreuve` |
| 34 | `probabilite-deux-epreuves` — Deux tirages : le tableau à double entrée | Troisième | `statistiques-et-probabilites` | `probabilite-deux-epreuves` |
| 35 | `frequence-et-probabilite` — Simuler le hasard : fréquences et probabilité | Troisième | `statistiques-et-probabilites` | `frequence-et-probabilite` |
| 36 | `vers-le-brevet-statistiques-et-probabilites` — Vers le brevet — Statistiques et probabilités _(synthèse)_ | Troisième | `statistiques-et-probabilites` | unité statistiques-et-probabilites complète |
| 37 | `programmer-des-blocs-personnalises` — Découper un programme en blocs | Troisième | `programmer-avec-des-blocs` | `programmer-des-blocs-personnalises` |
| 38 | `boucles-et-conditions` — Boucles « jusqu’à » et conditions | Troisième | `programmer-avec-des-blocs` | `boucles-et-conditions` |
| 39 | `scripts-en-parallele` — Faire interagir des lutins | Troisième | `programmer-avec-des-blocs` | `scripts-en-parallele` |
| 40 | `vers-le-brevet-programmer-avec-des-blocs` — Vers le brevet — Programmer : blocs, boucles et scripts _(synthèse)_ | Troisième | `programmer-avec-des-blocs` | unité programmer-avec-des-blocs complète |
| 41 | `rotation` — Faire tourner une figure : la rotation | Troisième | `rotations-et-homotheties` | `rotation` |
| 42 | `homothetie` — Agrandir depuis un point : l’homothétie | Troisième | `rotations-et-homotheties` | `homothetie` |
| 43 | `effet-d-une-homothetie` — Longueurs, aires et volumes après une homothétie | Troisième | `rotations-et-homotheties` | `effet-d-une-homothetie` |
| 44 | `frises-pavages-rosaces` — Frises, pavages et rosaces | Troisième | `rotations-et-homotheties` | `frises-pavages-rosaces` |
| 45 | `demontrer-en-geometrie` — Rédiger une démonstration en géométrie | Troisième | `rotations-et-homotheties` | `demontrer-en-geometrie` |
| 46 | `vers-le-brevet-rotations-et-homotheties` — Vers le brevet — Rotations et homothéties _(synthèse)_ | Troisième | `rotations-et-homotheties` | unité rotations-et-homotheties complète |
| 47 | `volume-boule-et-assemblages` — Volume d’une boule et de solides assemblés | Troisième | `grandeurs-et-volumes` | `volume-boule-et-assemblages` |
| 48 | `grandeurs-composees` — Vitesse, débit, masse volumique | Troisième | `grandeurs-et-volumes` | `grandeurs-composees` |
| 49 | `conversions-grandeurs-composees` — Convertir des vitesses, des débits et des volumes | Troisième | `grandeurs-et-volumes` | `conversions-grandeurs-composees` |
| 50 | `vers-le-brevet-grandeurs-et-volumes` — Vers le brevet — Vitesses, débits et volumes _(synthèse)_ | Troisième | `grandeurs-et-volumes` | unité grandeurs-et-volumes complète |
| 51 | `se-reperer-sur-une-sphere` — Se repérer sur une sphère : latitude et longitude | Troisième | `representer-l-espace` | `se-reperer-sur-une-sphere` |
| 52 | `representations-des-solides` — Patrons, perspective et vues d’un solide | Troisième | `representer-l-espace` | `representations-des-solides` |
| 53 | `sections-planes` — Couper un solide : les sections planes | Troisième | `representer-l-espace` | `sections-planes` |
| 54 | `vers-le-brevet-representer-l-espace` — Vers le brevet — Représenter l’espace _(synthèse)_ | Troisième | `representer-l-espace` | unité representer-l-espace complète |

## Renvois en avant dans une même classe (0)

La leçon de gauche suppose un item que le catalogue n’enseigne que PLUS LOIN : elle le rappelle elle-même, sans le construire.

| leçon | suppose | enseigné plus loin dans |
|---|---|---|

