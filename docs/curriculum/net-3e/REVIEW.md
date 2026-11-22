# 3e mathematics — the reviewed net (2026-11-22)

**Status:** LIVE since 2026-11-22. This document is the review of the 3e net; the data itself lives in
`packages/core/curriculum/fr/` (one source of truth) and every lesson is `coming_soon` until it is built.
**Sources:** only the official texts in `docs/curriculum/officiel/` (their `README.md` says which applies when). No
textbook, no website, no memory of a textbook's chapters.
**Check:** the tests of `packages/core` (`cd packages/core && npx vitest run curriculum compass`) and
`scripts/fr-dz-table.test.mjs` — they replace the draft's `validate.mjs`.

| File | What it holds |
|---|---|
| `packages/core/curriculum/fr/net/official_programme_college.json` | the programme items: 55 items taught in 3e in 2026-2027 and 53 « stub » items of 4e / 5e / 6e that a 3e item needs (a stub has no lesson until its grade is written) |
| `packages/core/curriculum/fr/net/horizon_2028.json` | the 19 « horizon 2028 » items (what the 2026 programme adds to 3e), with their 21 links and their `attachesTo` — NOT loaded by the resolver |
| `packages/core/curriculum/fr/net/learning_net_college.json` | 17 threads and 112 live links (`requires` / `extends` / `consolidates`), every one weighted `core` or `support` |
| `packages/core/curriculum/fr/units_3e_2026_2027.json` | 13 teaching units, in the platform's year order |
| `packages/core/curriculum/fr/lessons_3e_2026_2027.json` | 59 lessons: 46 lessons of discovery + 13 « Vers le brevet » syntheses |
| `packages/core/curriculum/fr/programme_3e_2026_2027.json` | one official topic per thème (the segments `3e.m1`…`3e.m5`), what each lesson's `sourceTopicId` names |
| `packages/core/curriculum/fr/learning_points.lock.json` | the learning points of every lesson, in order (append-only once a lesson is built; `npm run generate:lp-lock`) |
| `fr_dz_table.json` (this folder) | 55 rows pairing a 3e lesson with an Algerian 4AM / 3AM lesson |

How to read an item: `3e.m2.r14` = grade 3e, thème 2 (B, données et fonctions), item 14. `text` is the official
sentence, cut where needed (`[…]`), never reworded; `origin` and `page` say where it is (PDF page); `alsoIn` gives the
same content in the other documents; `in2026` says whether the 2026 programme keeps it in 3e.

## (a) Units and lessons

Page numbers: « prog. 2020 » = the 2020 cycle 4 programme PDF; « repères » = the repères annuels de progression; « attendus 3e »
= the attendus de fin d'année de 3e. « v2 ready » = the Algerian lesson already runs on the new engine (it has a
`lesson.pack.js`). Synthesis lessons are in *italics*; they declare no programme item.

The order of the units is the **platform's**: the official texts fix what is taught in 3e, never in which order.

### Unit 1 — Nombres premiers et fractions (Nombres et calculs)

| # | Lesson | Learning points | Official items | Algerian platform |
|---|---|---|---|---|
| 0 | Décomposer un nombre en facteurs premiers `decomposer-en-facteurs-premiers` | P1 Décomposer un nombre entier en produit de facteurs premiers en essayant les divisions par 2, 3, 5, 7… dans l’ordre<br>P2 Écrire une décomposition en facteurs premiers avec des puissances, par exemple 60 = 2² × 3 × 5<br>P3 Décomposer un grand nombre à l’aide d’un tableur, d’une calculatrice ou d’un programme qui teste les diviseurs | 3e.m1.r05 (attendus 3e p. 2) | none |
| 1 | Rendre une fraction irréductible `fraction-irreductible` | P1 Reconnaître qu’une fraction est irréductible quand son numérateur et son dénominateur n’ont aucun facteur premier commun<br>P2 Rendre une fraction irréductible en divisant numérateur et dénominateur par leurs facteurs premiers communs<br>P3 Donner le résultat d’un calcul de fractions sous forme irréductible | 3e.m1.r06 (attendus 3e p. 2) | ikhtizal-kasr (4AM, same-maths-other-method, **v2 ready**) |
| 2 | Engrenages et rendez-vous : multiples et diviseurs communs `multiples-et-diviseurs-communs` | P1 Reconnaître qu’un problème de répétitions simultanées (engrenages, signaux lumineux) revient à chercher un multiple commun<br>P2 Trouver le plus petit multiple commun non nul de deux entiers à partir de leurs décompositions en facteurs premiers<br>P3 Reconnaître qu’un problème de partage en lots identiques revient à chercher un diviseur commun, et trouver le plus grand à partir des décompositions | 3e.m1.r07 (attendus 3e p. 2) | qasim-mushtarak-akbar (4AM, partial, **v2 ready**) |
| 3 | Résoudre des problèmes avec des fractions `calculer-avec-des-fractions` | P1 Choisir l’opération sur les fractions (somme, différence, produit, quotient) qui traduit un énoncé<br>P2 Calculer une fraction d’une quantité puis une fraction de ce qui reste, en enchaînant les calculs<br>P3 Mener un calcul avec des nombres relatifs et des fractions en respectant les priorités, et donner le résultat sous forme irréductible | 3e.m1.r01 (attendus 3e p. 2) | amaliyat-natiqa (3AM, partial) |
| 4 | *Vers le brevet — Nombres premiers et fractions* `vers-le-brevet-nombres-premiers-et-fractions` | P1 Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « Nombres premiers et fractions » | — | — |

### Unit 2 — Développer et factoriser (Nombres et calculs)

| # | Lesson | Learning points | Official items | Algerian platform |
|---|---|---|---|---|
| 5 | L’opposé d’une expression et les parenthèses `oppose-d-une-expression` | P1 Écrire l’opposé d’une expression littérale en changeant le signe de chacun de ses termes<br>P2 Supprimer des parenthèses précédées d’un signe moins, puis réduire l’expression obtenue<br>P3 Développer et réduire un produit k(a + b) quand le facteur k est négatif | 3e.m1.r09 (attendus 3e p. 3) | tabsit-hadhf-aqwas (3AM, partial)<br>nashr-jabri-3am (3AM, partial) |
| 6 | Développer un produit de deux sommes `double-distributivite` | P1 Développer un produit (a + b)(c + d) en multipliant chaque terme du premier facteur par chaque terme du second<br>P2 Démontrer l’égalité (a + b)(c + d) = ac + ad + bc + bd en appliquant deux fois la distributivité simple<br>P3 Développer et réduire une expression qui mêle produits de sommes, signes moins et termes isolés<br>P4 Contrôler un développement en remplaçant la lettre par une valeur | 3e.m1.r10 (repères p. 5)<br>3e.m1.r11 (attendus 3e p. 3) | nashr-jabri-3am (3AM, same-maths-other-method)<br>nashr-tabsit (4AM, partial) |
| 7 | Factoriser une différence de deux carrés `difference-de-deux-carres` | P1 Développer un produit (a + b)(a − b) et reconnaître le résultat a² − b²<br>P2 Reconnaître une expression de la forme a² − b² et identifier a et b<br>P3 Factoriser une expression de la forme a² − b², par exemple x² − 64 ou 4x² − 49 | 3e.m1.r12 (attendus 3e p. 3) | mutatabiqat-shahira (4AM, partial)<br>tahlil-ibara (4AM, partial) |
| 8 | Prouver avec des lettres : programmes de calcul `prouver-avec-le-calcul-litteral` | P1 Traduire un programme de calcul par une expression littérale<br>P2 Prouver que deux programmes de calcul donnent toujours le même résultat en développant et en réduisant<br>P3 Réfuter une affirmation générale par un contre-exemple numérique<br>P4 Prouver une propriété générale des nombres entiers, par exemple sur la somme d’entiers consécutifs, en les écrivant avec une lettre | 3e.m1.r08 (repères p. 5) | qawaid-niqash-mithal-mudad (3AM, partial)<br>qimat-ibara-harfiya (3AM, partial)<br>khawass-qawasim (4AM, partial, **v2 ready**) |
| 9 | *Vers le brevet — Développer et factoriser* `vers-le-brevet-developper-et-factoriser` | P1 Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « Développer et factoriser » | — | — |

### Unit 3 — Thalès et triangles semblables (Espace et géométrie)

| # | Lesson | Learning points | Official items | Algerian platform |
|---|---|---|---|---|
| 10 | Reconnaître des triangles semblables `triangles-semblables` | P1 Reconnaître deux triangles semblables par la proportionnalité des longueurs de leurs côtés<br>P2 Reconnaître deux triangles semblables par l’égalité de leurs angles<br>P3 Associer les sommets et les côtés homologues de deux triangles semblables<br>P4 Calculer une longueur inconnue à l’aide du rapport entre deux triangles semblables | 3e.m4.r04 (attendus 3e p. 8)<br>3e.m2.r09 (attendus 3e p. 5) | none |
| 11 | Thalès dans le papillon `thales-configuration-papillon` | P1 Reconnaître une configuration de Thalès en papillon et écrire l’égalité des trois rapports<br>P2 Choisir l’ordre des longueurs dans les rapports selon la configuration, emboîtée ou en papillon<br>P3 Calculer une longueur dans une configuration de Thalès en papillon | 3e.m4.r05 (repères p. 11)<br>3e.m2.r09 (attendus 3e p. 5) | talis-hisab-atwal (4AM, partial) |
| 12 | Prouver que deux droites sont parallèles `reciproque-de-thales` | P1 Vérifier que les points sont alignés dans le même ordre sur les deux droites sécantes<br>P2 Comparer deux rapports de longueurs pour démontrer que deux droites sont parallèles<br>P3 Rédiger une démonstration de parallélisme qui cite la réciproque du théorème de Thalès | 3e.m4.r05 (repères p. 11) | aksiya-talis (4AM, partial) |
| 13 | *Vers le brevet — Thalès et triangles semblables* `vers-le-brevet-thales-et-triangles-semblables` | P1 Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « Thalès et triangles semblables » | — | — |

### Unit 4 — Résoudre des équations (Nombres et calculs)

| # | Lesson | Learning points | Official items | Algerian platform |
|---|---|---|---|---|
| 14 | Mettre un problème en équation `mettre-un-probleme-en-equation` | P1 Choisir une inconnue et traduire un énoncé par une équation<br>P2 Résoudre une équation du premier degré qui a l’inconnue dans les deux membres, y compris avec des parenthèses à développer<br>P3 Vérifier une solution et répondre à la question posée dans le contexte du problème | 3e.m1.r13 (attendus 3e p. 3) | muadalat-darajat-ula (3AM, same)<br>tarrid-mushkila (4AM, partial) |
| 15 | Résoudre une équation produit nul `equation-produit-nul` | P1 Utiliser le fait qu’un produit est nul si et seulement si l’un au moins de ses facteurs est nul<br>P2 Résoudre une équation de la forme (ax + b)(cx + d) = 0<br>P3 Se ramener à une équation produit nul en factorisant, par un facteur commun ou par a² − b², avant de résoudre | 3e.m1.r14 (prog. 2020 p. 132) | jidaa-maadum (4AM, same) |
| 16 | Résoudre l’équation x² = a `equation-x-carre-egal-a` | P1 Déterminer le nombre de solutions de l’équation x² = a selon le signe de a<br>P2 Résoudre l’équation x² = a pour a positif en donnant les deux solutions √a et −√a<br>P3 Résoudre une équation qui se ramène à la forme x² = a | 3e.m1.r15 (attendus 3e p. 3) | muadalat-x-murabba (4AM, same) |
| 17 | *Vers le brevet — Résoudre des équations* `vers-le-brevet-resoudre-des-equations` | P1 Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « Résoudre des équations » | — | — |

### Unit 5 — La notion de fonction (Organisation et gestion de données, fonctions)

| # | Lesson | Learning points | Official items | Algerian platform |
|---|---|---|---|---|
| 18 | Qu’est-ce qu’une fonction ? Image et antécédent `notion-de-fonction` | P1 Utiliser les notations f(x) et x ↦ f(x) pour dire qu’une fonction associe à chaque nombre un seul nombre<br>P2 Calculer l’image d’un nombre à partir de l’expression d’une fonction ou d’un programme de calcul<br>P3 Traduire une égalité comme g(3) = 15 avec les mots image et antécédent | 3e.m2.r10 (attendus 3e p. 5)<br>3e.m2.r11 (attendus 3e p. 5) | dala-khattiya (4AM, partial) |
| 19 | Lire une fonction dans un tableau ou sur une courbe `lire-une-fonction` | P1 Construire un tableau de valeurs à partir de l’expression d’une fonction, puis placer les points correspondants<br>P2 Lire l’image d’un nombre sur une courbe ou dans un tableau de valeurs<br>P3 Lire un ou plusieurs antécédents d’un nombre sur une courbe ou dans un tableau de valeurs<br>P4 Interpréter une lecture graphique dans le contexte du problème, avec ses unités | 3e.m2.r12 (attendus 3e p. 5)<br>3e.m2.r11 (attendus 3e p. 5)<br>3e.m2.r13 (attendus 3e p. 5) | tamthil-bayani-taalufi (4AM, partial)<br>tamthil-bayani-khatti (4AM, partial) |
| 20 | Trouver un antécédent par le calcul `antecedent-par-le-calcul` | P1 Déterminer l’antécédent d’un nombre par une fonction affine en résolvant une équation du premier degré<br>P2 Déterminer les antécédents de 0 par une fonction donnée sous forme de produit<br>P3 Vérifier par le calcul un antécédent lu sur un graphique | 3e.m2.r14 (attendus 3e p. 5) | mafhum-taalufiya (4AM, partial) |
| 21 | *Vers le brevet — La notion de fonction* `vers-le-brevet-la-notion-de-fonction` | P1 Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « La notion de fonction » | — | — |

### Unit 6 — Puissances et racine carrée (Nombres et calculs)

| # | Lesson | Learning points | Official items | Algerian platform |
|---|---|---|---|---|
| 22 | Les puissances d’exposant négatif `puissances-d-exposant-negatif` | P1 Simplifier un quotient de produits d’un même facteur en comptant les facteurs qui restent au numérateur ou au dénominateur<br>P2 Interpréter a⁻ⁿ comme l’inverse de aⁿ<br>P3 Écrire un produit ou un quotient de puissances d’un même nombre sous la forme d’une seule puissance en revenant à la définition | 3e.m1.r02 (repères p. 4) | quwat-adad-nisbi (3AM, partial) |
| 23 | Très grand, très petit : la notation scientifique `notation-scientifique-en-probleme` | P1 Écrire un nombre en notation scientifique à partir de son écriture décimale ou d’un résultat de calcul<br>P2 Calculer un produit ou un quotient de nombres en notation scientifique<br>P3 Résoudre un problème sur de très grandes ou de très petites quantités en donnant un ordre de grandeur du résultat | 3e.m1.r03 (attendus 3e p. 2) | kitaba-ilmiya-rutba (3AM, partial)<br>qawaid-quwa-ashara (3AM, partial) |
| 24 | Utiliser la racine carrée pour calculer une longueur `racine-carree-en-probleme` | P1 Donner la valeur exacte √a puis une valeur approchée de la longueur du côté d’un carré d’aire a<br>P2 Calculer une longueur avec le théorème de Pythagore et la racine carrée<br>P3 Choisir entre valeur exacte et valeur approchée, et arrondir à la précision demandée | 3e.m1.r04 (attendus 3e p. 2) | khassiyat-fitaghuras (3AM, partial) |
| 25 | *Vers le brevet — Puissances et racine carrée* `vers-le-brevet-puissances-et-racines` | P1 Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « Puissances et racine carrée » | — | — |

### Unit 7 — Trigonométrie (Espace et géométrie)

| # | Lesson | Learning points | Official items | Algerian platform |
|---|---|---|---|---|
| 26 | Cosinus, sinus et tangente d’un angle `cosinus-sinus-tangente` | P1 Nommer, pour un angle aigu d’un triangle rectangle, l’hypoténuse, le côté adjacent et le côté opposé<br>P2 Écrire le cosinus, le sinus et la tangente d’un angle aigu comme des rapports de longueurs<br>P3 Choisir la ligne trigonométrique qui relie l’angle connu, la longueur connue et la longueur cherchée<br>P4 Calculer une longueur dans un triangle rectangle avec le cosinus, le sinus ou la tangente | 3e.m4.r06 (attendus 3e p. 9) | nisab-muthallathiya (4AM, partial)<br>jayb-tamam-zawiya (3AM, partial)<br>tarrid-muthallathiya (4AM, partial) |
| 27 | Calculer un angle dans un triangle rectangle `calculer-un-angle` | P1 Calculer la mesure d’un angle aigu à la calculatrice à partir de son cosinus, de son sinus ou de sa tangente<br>P2 Choisir la ligne trigonométrique à utiliser selon les deux longueurs connues<br>P3 Arrondir une mesure d’angle à la précision demandée | 3e.m4.r06 (attendus 3e p. 9) | hasiba-muthallathiya (4AM, partial) |
| 28 | Résoudre un triangle rectangle `resoudre-un-triangle-rectangle` | P1 Choisir entre le théorème de Pythagore, le cosinus, le sinus et la tangente selon les données et l’inconnue<br>P2 Calculer toutes les longueurs et tous les angles d’un triangle rectangle à partir de deux données<br>P3 Résoudre un problème qui fait intervenir deux triangles rectangles accolés, par exemple une hauteur inaccessible | 3e.m4.r06 (attendus 3e p. 9) | tarrid-muthallathiya (4AM, same) |
| 29 | *Vers le brevet — Trigonométrie* `vers-le-brevet-trigonometrie` | P1 Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « Trigonométrie » | — | — |

### Unit 8 — Fonctions linéaires et affines (Organisation et gestion de données, fonctions)

| # | Lesson | Learning points | Official items | Algerian platform |
|---|---|---|---|---|
| 30 | Fonction linéaire et proportionnalité `fonction-lineaire` | P1 Reconnaître une fonction linéaire à son expression f(x) = ax<br>P2 Représenter graphiquement une fonction linéaire par une droite passant par l’origine du repère<br>P3 Modéliser une situation de proportionnalité par une fonction linéaire<br>P4 Déterminer le coefficient d’une fonction linéaire à partir d’un nombre et de son image | 3e.m2.r15 (attendus 3e p. 5)<br>3e.m2.r08 (attendus 3e p. 5) | dala-khattiya (4AM, partial)<br>tamthil-bayani-khatti (4AM, partial)<br>tarrid-khatti (4AM, partial) |
| 31 | Fonction affine et sa droite `fonction-affine` | P1 Reconnaître une fonction affine à son expression f(x) = ax + b<br>P2 Représenter graphiquement une fonction affine par une droite tracée à partir de deux points<br>P3 Déterminer le signe du coefficient directeur et de l’ordonnée à l’origine à partir de l’allure de la droite | 3e.m2.r16 (attendus 3e p. 5)<br>3e.m2.r17 (attendus 3e p. 5) | mafhum-taalufiya (4AM, partial)<br>tamthil-bayani-taalufi (4AM, partial) |
| 32 | Augmenter ou baisser d’un pourcentage `pourcentage-d-evolution` | P1 Traduire une augmentation de t % par une multiplication par 1 + t/100<br>P2 Traduire une diminution de t % par une multiplication par 1 − t/100<br>P3 Retrouver le pourcentage d’évolution à partir d’un coefficient multiplicateur | 3e.m2.r07 (attendus 3e p. 5) | nisba-miawiya-3am (3AM, partial)<br>tatbiqat-tanasub (4AM, partial) |
| 33 | Choisir une fonction pour résoudre un problème `modeliser-avec-une-fonction` | P1 Exprimer une grandeur en fonction d’une autre par une formule, par exemple l’aire d’un rectangle de périmètre fixé<br>P2 Comparer deux situations modélisées par des fonctions affines, à l’aide d’un graphique ou d’une équation<br>P3 Résoudre un problème modélisé par une fonction en choisissant entre tableau de valeurs, graphique et calcul | 3e.m2.r18 (attendus 3e p. 5)<br>3e.m2.r19 (attendus 3e p. 5) | tarrid-taalufi (4AM, partial)<br>tarrid-khatti (4AM, partial) |
| 34 | *Vers le brevet — Fonctions linéaires et affines* `vers-le-brevet-fonctions-lineaires-et-affines` | P1 Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « Fonctions linéaires et affines » | — | — |

### Unit 9 — Statistiques et probabilités (Organisation et gestion de données, fonctions)

| # | Lesson | Learning points | Official items | Algerian platform |
|---|---|---|---|---|
| 35 | Comparer des séries : moyenne, médiane, étendue `etendue-d-une-serie` | P1 Calculer l’étendue d’une série donnée par des données brutes, un tableau ou un diagramme<br>P2 Calculer la moyenne et la médiane d’une série et les interpréter<br>P3 Comparer deux séries à l’aide d’un indicateur de position et de l’étendue | 3e.m2.r01 (attendus 3e p. 4)<br>3e.m2.r03 (repères p. 7) | mada-wasit-mutawassit (4AM, partial)<br>qiraat-wadiyat-ihsaiya (4AM, partial) |
| 36 | Lire et tracer un histogramme `histogramme` | P1 Lire et interpréter un histogramme dont les classes ont la même amplitude<br>P2 Représenter par un histogramme une série regroupée en classes de même amplitude<br>P3 Calculer, à partir d’un diagramme, l’effectif ou la fréquence d’un groupe de valeurs (au moins, au plus, entre deux valeurs) | 3e.m2.r02 (attendus 3e p. 4)<br>3e.m2.r03 (repères p. 7) | tamthil-silsila-ihsaiya (3AM, partial) |
| 37 | Calculer une probabilité en comptant les issues `probabilite-une-epreuve` | P1 Lister les issues d’une expérience aléatoire à une épreuve et repérer si elles sont équiprobables<br>P2 Calculer la probabilité d’un événement en comptant les issues favorables parmi les issues équiprobables<br>P3 Calculer la probabilité d’un événement à partir de celle de son événement contraire | 3e.m2.r04 (attendus 3e p. 4) | none |
| 38 | Deux tirages : le tableau à double entrée `probabilite-deux-epreuves` | P1 Dresser le tableau à double entrée de toutes les issues d’une expérience à deux épreuves<br>P2 Calculer la probabilité d’un événement en comptant les cases favorables du tableau<br>P3 Utiliser l’événement contraire pour calculer la probabilité d’obtenir au moins une fois une issue | 3e.m2.r05 (repères p. 7) | none |
| 39 | Simuler le hasard : fréquences et probabilité `frequence-et-probabilite` | P1 Simuler une expérience aléatoire avec un tableur ou un logiciel de programmation<br>P2 Observer que la fréquence d’une issue se stabilise quand le nombre d’essais augmente<br>P3 Comparer des fréquences observées aux probabilités théoriques pour juger un modèle, par exemple un dé équilibré | 3e.m2.r06 (attendus 3e p. 4) | none |
| 40 | *Vers le brevet — Statistiques et probabilités* `vers-le-brevet-statistiques-et-probabilites` | P1 Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « Statistiques et probabilités » | — | — |

### Unit 10 — Programmer : blocs, boucles et scripts (Algorithmique et programmation)

| # | Lesson | Learning points | Official items | Algerian platform |
|---|---|---|---|---|
| 41 | Découper un programme en blocs `programmer-des-blocs-personnalises` | P1 Décomposer un problème en sous-problèmes<br>P2 Créer un bloc personnalisé qui traduit un sous-problème<br>P3 Construire une figure ou une frise en reproduisant un motif à l’aide d’une boucle | 3e.m5.r01 (attendus 3e p. 10)<br>3e.m5.r02 (attendus 3e p. 10) | none |
| 42 | Boucles « jusqu’à » et conditions `boucles-et-conditions` | P1 Utiliser une boucle « répéter jusqu’à … » qui s’arrête quand une condition est remplie<br>P2 Combiner les boucles « répéter … fois », « répéter jusqu’à … » et des instructions conditionnelles dans un programme de calcul ou de déplacement<br>P3 Programmer la simulation d’une expérience aléatoire qui compte ses issues<br>P4 Tester un programme et corriger l’instruction qui produit un résultat faux | 3e.m5.r03 (attendus 3e p. 10) | none |
| 43 | Faire interagir des lutins `scripts-en-parallele` | P1 Écrire plusieurs scripts qui s’exécutent en parallèle<br>P2 Gérer une interaction entre deux lutins, par exemple quand l’un touche l’autre<br>P3 Programmer un petit jeu qui utilise au moins deux lutins avec des scripts en parallèle | 3e.m5.r04 (attendus 3e p. 10) | none |
| 44 | *Vers le brevet — Programmer : blocs, boucles et scripts* `vers-le-brevet-programmer-avec-des-blocs` | P1 Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « Programmer : blocs, boucles et scripts » | — | — |

### Unit 11 — Rotations et homothéties (Espace et géométrie)

| # | Lesson | Learning points | Official items | Algerian platform |
|---|---|---|---|---|
| 45 | Faire tourner une figure : la rotation `rotation` | P1 Construire l’image d’un point par une rotation de centre, d’angle et de sens donnés<br>P2 Construire l’image d’une figure par une rotation<br>P3 Utiliser la conservation des longueurs, des angles et des aires par une rotation pour calculer une grandeur | 3e.m4.r07 (repères p. 12)<br>3e.m3.r06 (attendus 3e p. 7) | mafhum-dawaran (4AM, partial)<br>khawas-dawaran (4AM, partial) |
| 46 | Agrandir depuis un point : l’homothétie `homothetie` | P1 Construire l’image d’une figure par une homothétie de centre donné et de rapport positif<br>P2 Construire l’image d’une figure par une homothétie de rapport négatif, de l’autre côté du centre<br>P3 Retrouver le rapport d’une homothétie à partir de longueurs, en lien avec la configuration de Thalès | 3e.m4.r08 (repères p. 12) | none |
| 47 | Longueurs, aires et volumes après une homothétie `effet-d-une-homothetie` | P1 Calculer les longueurs de l’image d’une figure par une homothétie ou un agrandissement de rapport donné<br>P2 Calculer l’aire de l’image d’une figure en multipliant l’aire initiale par le carré du rapport<br>P3 Calculer le volume d’un solide agrandi ou réduit en multipliant le volume initial par le cube du rapport<br>P4 Justifier la nature d’une figure image par la conservation des angles et du parallélisme par une homothétie | 3e.m3.r07 (attendus 3e p. 7)<br>3e.m4.r08 (repères p. 12) | takbir-tasghir (4AM, partial) |
| 48 | Frises, pavages et rosaces `frises-pavages-rosaces` | P1 Identifier la transformation (symétrie, translation, rotation, homothétie) qui fait passer d’un motif à un autre dans une frise, un pavage ou une rosace<br>P2 Décrire les transformations qui permettent de construire une rosace<br>P3 Construire une rosace en enchaînant des rotations à partir d’un motif | 3e.m4.r09 (attendus 3e p. 8) | none |
| 49 | Rédiger une démonstration en géométrie `demontrer-en-geometrie` | P1 Repérer les données utiles d’une figure et choisir la propriété qui permet d’avancer vers la conclusion<br>P2 Rédiger une démonstration en enchaînant des étapes « on sait que … ; or … ; donc … »<br>P3 Déterminer une grandeur géométrique en combinant plusieurs propriétés de figures, de configurations ou de transformations | 3e.m4.r10 (attendus 3e p. 8) | burhan-handasi (3AM, partial) |
| 50 | *Vers le brevet — Rotations et homothéties* `vers-le-brevet-rotations-et-homotheties` | P1 Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « Rotations et homothéties » | — | — |

### Unit 12 — Vitesses, débits et volumes (Grandeurs et mesures)

| # | Lesson | Learning points | Official items | Algerian platform |
|---|---|---|---|---|
| 51 | Volume d’une boule et de solides assemblés `volume-boule-et-assemblages` | P1 Calculer le volume d’une boule de rayon donné avec la formule (4/3)πr³<br>P2 Exprimer un volume en valeur exacte en fonction de π, puis en donner une valeur approchée<br>P3 Décomposer un solide en solides connus (prisme, cylindre, pyramide, cône, boule, demi-boule)<br>P4 Calculer le volume d’un assemblage ou d’un solide évidé par sommes et différences de volumes | 3e.m3.r01 (attendus 3e p. 7)<br>3e.m3.r02 (attendus 3e p. 7) | misaha-hajm-kura (4AM, partial) |
| 52 | Vitesse, débit, masse volumique `grandeurs-composees` | P1 Calculer une vitesse, un débit ou une masse volumique et l’exprimer dans une unité composée adaptée<br>P2 Calculer une distance, une durée ou un volume à partir d’une grandeur composée<br>P3 Vérifier la cohérence d’un résultat en contrôlant ses unités | 3e.m3.r03 (attendus 3e p. 7)<br>3e.m3.r05 (attendus 3e p. 7) | haraka-muntazama-sura (3AM, partial)<br>tatbiqat-tanasub (4AM, partial) |
| 53 | Convertir des vitesses, des débits et des volumes `conversions-grandeurs-composees` | P1 Convertir une vitesse entre kilomètres par heure et mètres par seconde<br>P2 Convertir un débit, par exemple des mètres cubes par seconde en litres par minute<br>P3 Convertir des unités d’aire et de volume à l’aide des puissances de 10, par exemple 1 m³ = 10⁶ cm³ | 3e.m3.r04 (attendus 3e p. 7)<br>3e.m3.r05 (attendus 3e p. 7) | haraka-muntazama-sura (3AM, partial) |
| 54 | *Vers le brevet — Vitesses, débits et volumes* `vers-le-brevet-grandeurs-et-volumes` | P1 Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « Vitesses, débits et volumes » | — | — |

### Unit 13 — Représenter l’espace (Espace et géométrie)

| # | Lesson | Learning points | Official items | Algerian platform |
|---|---|---|---|---|
| 55 | Se repérer sur une sphère : latitude et longitude `se-reperer-sur-une-sphere` | P1 Reconnaître un grand cercle d’une sphère<br>P2 Repérer un point d’une sphère par sa latitude et sa longitude<br>P3 Placer sur une sphère un point de latitude et de longitude données | 3e.m4.r01 (attendus 3e p. 8) | kura-julla (4AM, partial) |
| 56 | Patrons, perspective et vues d’un solide `representations-des-solides` | P1 Associer un solide à ses vues de face, de dessus et en coupe<br>P2 Associer la représentation en perspective cavalière d’un solide étudié et son patron<br>P3 Représenter un solide en perspective cavalière | 3e.m4.r02 (attendus 3e p. 8) | wasf-tamthil-haram (3AM, partial)<br>wasf-tamthil-makhrut (3AM, partial) |
| 57 | Couper un solide : les sections planes `sections-planes` | P1 Déterminer la nature de la section d’un pavé droit ou d’un cylindre par un plan parallèle à une face, à une arête ou à l’axe<br>P2 Déterminer la nature de la section d’une sphère ou d’une boule par un plan<br>P3 Reconnaître que la section d’une pyramide ou d’un cône par un plan parallèle à la base est une réduction de la base<br>P4 Représenter une section plane sur un solide dessiné en perspective cavalière | 3e.m4.r03 (repères p. 10) | maqati-mustawiya (4AM, partial) |
| 58 | *Vers le brevet — Représenter l’espace* `vers-le-brevet-representer-l-espace` | P1 Résoudre un problème au format du brevet qui mobilise les capacités de l’unité « Représenter l’espace » | — | — |

## (b) Counts

| | |
|---|---|
| Programme items | **127**: 55 taught in 3e in 2026-2027 (thème A 15, B 19, C 7, D 10, E 4) · 19 horizon 2028 · 53 stubs (4e 43, 5e 9, 6e 1) |
| How the 55 fare in 2026 | 19 kept · 20 changed · 16 absent (leave 3e in 2028) |
| Units | 13 |
| Lessons | 59 = 46 lessons + 13 syntheses |
| Learning points | 161 = 148 in the 46 lessons (3 or 4 each, mean 3.2) + 13 integrating points, one per synthesis |
| Links | 133: 91 `requires`, 33 `extends`, 9 `consolidates` — all into 3e items, so all weighted: **95 core, 38 support** |
| Threads | 17 |
| Lesson pairs checked against the net | 43 (none unexplained) |
| FR ↔ DZ rows | 55, covering 36 of the 46 lessons: 4 `same`, 2 `same-maths-other-method`, 49 `partial`; 3 rows point to a DZ lesson that is v2 ready (`ikhtizal-kasr`, `qasim-mushtarak-akbar`, `khawass-qawasim`) |
| Lessons with no Algerian counterpart | 10: decomposing into primes, similar triangles, both probability lessons, frequency and probability, homothety, friezes and rosettes, and the three programming lessons |

## (c) Choices made here that the official texts do not dictate

**The cut into items**
- One item per « ce que sait faire l'élève » bullet of the attendus 3e, or per repères sentence when the attendus are silent; a bullet that names two things is cut in two (linear / affine function, rotation / homothety).
- Four 3e items are consolidations of 4e work (rationals in problems, scientific notation in problems, literal calculation « consolidé », effectifs/fréquences/indicateurs « consolidé »): they are items because the 3e texts name them, linked by `consolidates`.
- « Proportionnalité dans le cadre de la géométrie » appears twice in the official texts (thème B attendu, p. 5; thème C attendu, p. 7): kept as two items (`3e.m2.r09` lengths, `3e.m3.r07` agrandissement / homothety, areas, volumes).
- Algorithmics: only the niveau 3 bullets are 3e items; niveaux 1–2 are 4e stubs (the attendus 4e expect them in 4e).
- The optional repères sentence « il est possible d'identifier … l'enchaînement d'une translation, d'une rotation et d'une homothétie » (p. 12) is not an item (« il est possible »).
- Stubs: only the direct step below a 3e item, from the text in force when the 2026-2027 3e cohort was in that grade (4e: 2020 text; 5e: repères 5e column, attendus 5e where the column is silent — two items; 6e: cycle 3 repères of the former programme).

**The cut into lessons**
- 46 lessons for 55 items: most items get one lesson; trigonometry gets three (ratios, angles, solving a triangle) and Thales in the butterfly two (computing, the converse); some small items share a lesson (coherence of units with both grandeurs lessons, image of a number with the notion of function).
- « Volume d'une boule » and « volumes d'assemblages » share one lesson (the first alone is two points).
- The demonstration item (`3e.m4.r10`) gets a lesson of its own, « Rédiger une démonstration en géométrie », at the end of the transformations unit.
- Statistics and probability form one unit (two notions of the same thème; statistics alone would be two lessons).
- Units count 3 to 5 lessons plus their synthesis (4 to 6 in all); the rule « 3 to 7 lessons » was read as including the synthesis.

**Where a notion sits**
- The effect of transformations on lengths, areas and volumes (thème C) is taught inside the rotations-and-homotheties unit (thème D), because it cannot be built before the transformations and a link may not go from thème D back to thème C in the same grade (net invariant).
- `3e.m2.r09` (proportionality in geometry) is first taught with similar triangles, then with Thales.
- The percentage-of-change lesson sits in the linear-functions unit (the coefficient is a linear function), though the texts list it under proportionality.
- Simulating a random experiment is taught in probability (thème B) and reused in programming (thème E), not the other way round.
- The multiples-and-divisors lesson asks for the smallest common multiple and the largest common divisor through prime decompositions; the 2020 text names neither PGCD nor PPCM.

**The order of the year** (the brevet is on Monday 28 June 2027)
- Arithmetic first (short, independent, gives the irreducible fraction that every later answer needs); literal calculation second (needed by equations, functions and proofs); Thales and similar triangles in the first term (heavy brevet weight, needs only 4e).
- Equations before functions (the algebraic antecedent needs them); powers and square root in January (they serve trigonometry and volumes); functions in the second term; statistics, probability and programming in the spring; transformations, grandeurs and space last (they reuse Thales, volumes of 4e and powers of ten).

**Learning points, syntheses, weights**
- Every point is written from a « ce que sait faire » bullet or an « exemple de réussite », infinitive first. Points that re-use a 4e capability (e.g. the complementary event, the order of the ratios of Thales) are recalls inside the 3e lesson, never a lesson of their own.
- A synthesis carries **one** integrating point (« Résoudre un problème au format du brevet qui mobilise les capacités de l'unité … ») whose prerequisites are the last point of each lesson of its unit — the Algerian practice (3AM unit 1). It adds no capability. The « 2 to 5 points » rule is applied to the 46 lessons only.
- Weight rule used: `core` when a student cannot pass the target's exercises while failing the source; `support` otherwise, with the reason. When unsure: support. Every 3e item has at least one core prerequisite.
- `prerequisiteLessonCodes` are computed, not chosen: the home lessons of the net links into the lesson's items that come earlier in the year, plus the lessons named by its point prerequisites.

## (d) [À VÉRIFIER] and other open points

- `3e.m1.r07` — whether « le plus grand diviseur commun » may be named as such in 3e (the 2020 text says only « engrenages, conjonction de phénomènes »).
- `3e.m3.r05` — the 2026 preamble (pp. 1–6) was not re-read for a cross-cutting rule on units, so « absent » is unsure.
- Segment `6e.m3` — the cycle 3 repères extraction has no thème heading; « Les angles » is read as Grandeurs et mesures.
- Every « absent » / « changed » note rests on a word search of the `pdftotext` extraction of the 2026 annexe (all 20 pages): a notion named with another word would be missed. The 5e and 4e sections were read only where a note says so.
- FR ↔ DZ: whether the DZ Thales lesson covers the butterfly case; whether the DZ « المنظور متساوي القياس » is the cavalière perspective. Both to check in the DZ lesson before reuse.
- Not verified by a second reader (`verified: false` everywhere).

## (e) What the 2028 programme changes, lesson by lesson

From 2028-2029 3e follows the 2026 text. The students who reach 3e then will have had the 2026 4e, which has
**no Thales and no cosine** (both moved to 3e) but has Pythagoras, the square-root definition, the median, the range,
two-stage probability, the multiplier coefficient and quotient quantities.

**Lessons that leave 3e in 2028** (their items are absent from the 2026 3e section, or only an automatism remains)
- `multiples-et-diviseurs-communs` (divisibility problems — only automatisms remain).
- `histogramme` (the word disappears; the slot goes to cumulative counts, quartiles, box plots).
- `probabilite-une-epreuve`, `probabilite-deux-epreuves` (moved to 4e in 2026).
- `triangles-semblables`, `rotation`, `homothetie`, `effet-d-une-homothetie`, `frises-pavages-rosaces` (similar triangles, rotation, homothety are absent from the whole 2026 annexe; only the automatism « mobiliser les connaissances sur la symétrie axiale, le demi-tour, la translation » remains of `3e.m3.r06`).
- `grandeurs-composees`, `conversions-grandeurs-composees` (quotient quantities are 4e in 2026).
- `scripts-en-parallele` (not named in 2026).

**Lessons that stay but change**
- `puissances-d-exposant-negatif` — the product and quotient rules become an objective (horizon `3e.m1.x4`).
- `decomposer-en-facteurs-premiers` — becomes an automatism only.
- `double-distributivite` — adds factoring; `difference-de-deux-carres` — becomes the three identities (`3e.m1.x1`).
- `mettre-un-probleme-en-equation` — first-degree equations are 4e in 2026; inequations (`3e.m1.x2`) and analysis-synthesis (`3e.m1.x3`) are added next to it.
- `equation-x-carre-egal-a` — adds the graphical solution (`3e.m1.x6`, needs the square function).
- `notion-de-fonction`, `antecedent-par-le-calcul`, `modeliser-avec-une-fonction` — 2026 studies « des exemples de fonctions … sans étude générale de la notion de fonction »; graphical solving of linear equations and inequations is added (`3e.m2.x7`).
- `fonction-affine` — reading the values of the coefficients, not only their signs.
- `pourcentage-d-evolution` — the multiplier is already known from 4e; 3e keeps « traduire une augmentation ou une diminution en pourcentages ».
- `etendue-d-une-serie` — the range becomes an automatism; quartiles and box plots added (`3e.m2.x2`, `x3`).
- `frequence-et-probabilite` — adds repeated independent experiments (`3e.m2.x5`).
- `thales-configuration-papillon`, `reciproque-de-thales` — must also teach the nested configuration (no Thales in 4e 2026) and the contraposée (`3e.m4.x4`).
- `cosinus-sinus-tangente` — must introduce the cosine itself (no cosine in 4e 2026).
- `se-reperer-sur-une-sphere` — latitude and longitude disappear; « définir la boule et la sphère, les grands cercles, le diamètre » stays.
- `sections-planes` — a closed list of solids (pavé, cylinder, ball).
- `volume-boule-et-assemblages` — the ball stays, the assemblies are not named.
- `programmer-des-blocs-personnalises`, `boucles-et-conditions` — « structurer des programmes », conditional loop, compound conditions (`3e.m5.x1`).
- `demontrer-en-geometrie` — reasoning stays, without rotation and homothety.

**Lessons to add in 2028** (each horizon item names the lesson it attaches to, `attachesTo`)
- The square function and its curve (`3e.m2.x6`).
- Inequations of the first degree (`3e.m1.x2`).
- Cumulative counts, quartiles, box plots (`3e.m2.x1`–`x3`, probably two lessons).
- P(A ∪ B) + P(A ∩ B) = P(A) + P(B) (`3e.m2.x4`; needs the set vocabulary of 4e 2026).
- The translation defined point by point, vectors, sum of vectors and Chasles (`3e.m4.x1`, `x2`, `x3`, `x5` — a new unit of about three lessons, in place of rotations and homotheties).
- Thales in the nested configuration and the cosine, for the new cohort (no new item: they are 3e items of the 2026 text, `3e.m4.r05` / `r06` « kept » with a note).

## The draft's known limits — how they were solved (2026-11-22)

1. **Stubs and horizon items had no home lesson.** Horizon items left the live net for `net/horizon_2028.json`.
   Stubs stay in the live net and the model says what they are: a stub has no home lesson (`homeLessonOf` → `null`),
   every result of the resolver shows it as the item itself with `noLessonInGrade`, its grade has no lesson at all
   (tested: the day 4e gets lessons, its stubs must become full items), and no link ends on a stub.
2. **`coursesData.buildLesson` showed the thème title.** A lesson now always shows its own title
   (`titleSource: "editorial"`); `officialTopicTitle` keeps what the official text calls its topic.
3. Stub ids (`4e.m1.r01` …) are numbered 1..n by the needs of 3e. Once written they keep their meaning, so when 4e is
   transcribed in full its other items must be appended after them — and 4e follows the 2026 text from 2027-2028, so
   the 4e stubs describe the 2025-2026 4e of the current cohort, not the future 4e. **Still open.**
4. The programme items of 3e are exposed as one topic per thème in `programme_3e_2026_2027.json` (the segments).

The counts of section (b) are those of the draft: the 133 links are now 112 live links + 21 links into horizon items
(`horizon_2028.json`).
