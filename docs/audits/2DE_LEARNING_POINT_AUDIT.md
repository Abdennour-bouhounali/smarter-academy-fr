# 2de — audit de couverture des Learning Points

> Audit ouvert le 2026-09-09, **mis à jour le 2026-09-10**. Périmètre : les 31
> leçons de Seconde du catalogue — **toutes construites**, plus aucune
> `coming_soon` — et leurs 303 learning points, réconciliés avec une liste
> externe de 159 points fournie pour la mission.
>
> Au 2026-09-10 : **303 / 303 learning points jugés un par un**, 277 COVERED
> (91,4 %), 23 PARTIALLY_COVERED, 3 DUPLICATED, **0 MISSING, 0 UNJUDGED**. Les
> 4 leçons ajoutées depuis l'ouverture (2 de trigonométrie, 2 d'algorithmique)
> sont jugées au même titre que les autres.
>
> **Comment lire ce document.** Les sections encadrées par
> `<!-- BEGIN GENERATED: … -->` sont produites par
> `npm run audit:2de` (`scripts/audit-2de-learning-points.mjs`) : **ne pas les
> éditer à la main**, elles sont réécrites à chaque exécution. Tout le reste est
> rédigé, daté, et n'affirme que ce qui a été vérifié — la règle héritée du
> 2026-09-07 (`KNOWLEDGE_MAP_MIGRATION_2NDE.md`) : *ne jamais cocher une ligne
> sans avoir ouvert la page*.
>
> Les statuts de couverture viennent de `docs/audits/judgements/<leçon>.json`,
> un jugement humain par leçon. Le script les lit et les valide (il refuse un
> identifiant de module ou de question inconnu) ; il ne les calcule jamais.

---

## 1. Résumé exécutif

<!-- BEGIN SECTION: executive -->
**Les 27 leçons de Seconde construites existent, sont routées, visibles, et fonctionnent.** Les
466 pages (27 leçons × leurs modules × deux formats) ont été ouvertes dans un navigateur :
0 erreur console, 0 défilement horizontal à 375 px, la carte des connaissances montée sur chacune.
Ce n'est donc pas un chantier de construction, c'est un chantier de **mesure**.

Les 249 learning points ont tous été jugés un par un, chaque verdict citant son module, son étape
et son mécanisme (`docs/audits/judgements/`). Aucun n'est MISSING, aucun n'est orphelin : tous
sont déclarés par au moins un module et mesurés par au moins une épreuve du test final. Le
déficit est ailleurs, et il est invisible aux portes actuelles.

**1. 41 items du programme officiel n'ont aucun learning point** — donc aucune preuve n'est jamais
enregistrée pour eux. Ils se concentrent **entièrement** sur les sept leçons de `nombres_calculs`
(les 22 autres objets officiels ont exactement autant de LP que d'items de périmètre). 26 d'entre
eux sont **enseignés pour de bon** : `|x − a| ≤ r` a sa manipulation (`BeamLine`), ses briques et
son intervalle de solutions, mais aucun LP ne le nomme, donc la maîtrise de l'élève sur cette
compétence n'est écrite nulle part. C'est la classe de défaut la plus nombreuse de la 2de :
**enseigné, non mesuré**. Cinq autres sont franchement absents (complémentaire et produit
cartésien, « factoriser ax+bx », fraction irréductible, simulation exécutable).

**2. La densité de preuve est très inégale.** Le test final compte exactement 10 épreuves dans les
27 leçons, quel que soit le nombre de learning points (5 pour `ensembles-et-intervalles`, 14 pour
`vecteurs`). Conséquence mécanique : **121 LP sur 249 ne sont mesurés que par des questions
partagées**, et **69 reposent en tout et pour tout sur UNE question partagée avec un autre LP**.
Le serveur tranchant la maîtrise à 0,70 (`MasteryModel`), une seule réponse décide alors pour deux
compétences. Certains partages sont légitimes (`vec-e8` exige les deux résultats dans la même
option), d'autres non (`vec-e2` compte pour « additionner deux vecteurs » sans qu'aucune addition
soit faite).

**3. Deux défauts fonctionnels réels**, qu'aucune porte ni la fumée ne pouvaient voir (§5) : un
module qui lève une exception dès que l'élève valide une étape, et une réponse juste refusée par
une erreur de flottant.

**4. Deux ruptures de chaîne en amont** : les quartiles et le mode statistique sont déclarés en
prérequis de leçons de 2de alors qu'**aucune leçon d'aucun niveau ne les enseigne** — le
programme officiel de 3e inclut pourtant les quartiles, que la leçon de 3e exclut d'elle-même.

**5. Une duplication littérale 3e → 2de** sur les coordonnées de vecteurs, où c'est la 3e qui sort
de son propre périmètre officiel, avec les mêmes identifiants de briques et le même titre de
module que `vecteurs-2nde`.

Sur la liste externe de 159 points fournie pour la mission, 117 trouvent une correspondance dans
le référentiel 2026 (dont 25 relèvent du collège), 4 relèvent de la Première, et 38 sont absents
du programme officiel de Seconde : ils deviennent des **leçons d'extension planifiées**,
explicitement marquées hors référentiel (§2, §9.3).

**Ce que la Session 1 a corrigé** (§11) : 17 durées incohérentes, 21 fichiers dupliqués supprimés,
la base resynchronisée. **Ce qu'elle a délibérément laissé** : les défauts fonctionnels et
pédagogiques, qui ouvrent la Session 2 (§12).
<!-- END SECTION: executive -->

### Statuts de couverture

<!-- BEGIN GENERATED: status-counts -->
| Statut | LP | Part |
| --- | ---: | ---: |
| `COVERED` | 286 | 94.4 % |
| `PARTIALLY_COVERED` | 17 | 5.6 % |
| **Total** | **303** | 100 % |
<!-- END GENERATED: status-counts -->

---

## 2. Réconciliation curriculaire

<!-- BEGIN SECTION: reconciliation-analysis -->
La liste externe de 159 points et le référentiel du dépôt **ne sont pas le même document**.
Le dépôt génère son catalogue depuis `smarter_academy_programmes_maths_2026.json` (BO n°10 du
5 mars 2026) : `buildChaptersForGrade` parcourt `official_objects` et `smaMetadata` ne fait
qu'enrichir. Ce référentiel est donc l'autorité curriculaire, et la liste externe un document
de comparaison.

**Décision (2026-09-09).** L'inventaire canonique reste celui du dépôt : 29 objets officiels,
249 learning points sur les 27 leçons construites + 24 sur les 2 leçons d'algorithmique encore à
écrire. Les 38 points externes absents du programme 2026 ne sont ni ignorés ni fondus dans les
leçons existantes : ils sont regroupés en **leçons d'extension**, à déclarer dans le référentiel
avec `origin: "extension"` pour qu'aucune ne puisse jamais être présentée comme officielle
(mécanisme décrit au §9).

| Extension proposée | Points externes | Domaine |
| --- | ---: | --- |
| `trigonometrie_cercle` | 10 (LP114–121, 123, 124) | geometrie |
| `geometrie_espace_positions_sections` | 6 | geometrie |
| `geometrie_espace_volumes_coordonnees` | 3 | geometrie |
| `fonctions_cube_racine` | 4 (LP50–52, 65) | fonctions |
| `second_degre_elementaire` | 4 (LP60–63) | fonctions |
| `variations_operations` | 4 (LP74–77) | fonctions |
| `fractions_algebriques` | 3 (LP5–7) | nombres_calculs |
| `orthogonalite_coordonnees` | 1 (LP98) | geometrie — point d'extension |
| `independance_probabiliste` | 1 (LP131) | statistiques_probabilites — point d'extension |

Deux points externes (LP105 soustraction de vecteurs, LP126 dénombrement) restent sans extension :
ils appartiennent à des leçons existantes et relèvent d'un LP à ajouter, pas d'une leçon nouvelle.

**Ce que la réconciliation a révélé sur le collège** (vérifié dans les deux fichiers) :
- `translations-vecteurs-3e` enseigne les **coordonnées de vecteurs** — quatre `pointsToLearn` et
  tout son module 5 — alors que son objet officiel les met en `teachingScope.exclude`. La
  duplication avec `vecteurs-2nde` M3 est littérale : même titre de module (« Deux nombres
  suffisent »), mêmes identifiants de briques (`coordonnees-vecteur`,
  `mem-arrivee-moins-depart`). Le défaut est **au catalogue de 3e**, pas en 2de.
- **Les quartiles** : le programme officiel de 3e les INCLUT (« Quartiles », « Boîtes à
  moustaches ») ; la leçon `statistiques-3e` construite les met dans son propre
  `teachingScope.exclude` et n'en enseigne rien ; la 4e les exclut comme « réservées à la 3e ».
  Or `boites-a-moustaches-2nde` les déclare en `priorKnowledge` et son module 0 les teste comme
  acquis (`bm-d2`, `bm-d5`). La chaîne est rompue aux trois maillons.
- **Le mode statistique** est déclaré en prérequis de `statistiques-une-variable-2nde` et
  n'est enseigné dans aucune leçon, à aucun niveau.
<!-- END SECTION: reconciliation-analysis -->

<!-- BEGIN GENERATED: reconciliation -->
| LP externe | Chapitre | Intitulé | Verdict | LP canonique(s) | Extension proposée | Note |
| --- | ---: | --- | --- | --- | --- | --- |
| `LP1` | 1 | Développer des expressions littérales. | EXACT | `calcul-litteral-2nde_P3` | — | M3 « Développer : l'aire qui se découpe » ; brique developp… |
| `LP2` | 1 | Factoriser des expressions littérales. | EXACT | `calcul-litteral-2nde_P4` | — | M4 facteur commun (nombre, monôme, binôme) plus identité à … |
| `LP3` | 1 | Utiliser les identités remarquables. | SUBSUMED | `calcul-litteral-2nde_P3` `calcul-litteral-2nde_P4` | — | M3/IdentityGrid modes plus, minus, diff enseigne les 3 iden… |
| `LP4` | 1 | Simplifier des expressions comportant des fractions algébri… | PARTIAL | `calcul-litteral-2nde_P4` `calcul-litteral-2nde_P6` | — | M6 étape 4 simplifie (2x+4)/(x+2) avec valeur interdite ; u… |
| `LP5` | 1 | Additionner des fractions algébriques. | MISSING | — | `fractions_algebriques` | Aucune addition de fractions algébriques ; calcul-litteral … |
| `LP6` | 1 | Multiplier des fractions algébriques. | MISSING | — | `fractions_algebriques` | Idem : official include « calculs avec des expressions frac… |
| `LP7` | 1 | Diviser des fractions algébriques. | MISSING | — | `fractions_algebriques` | Aucune division de fractions algébriques dans les 27 leçons… |
| `LP8` | 1 | Manipuler les puissances d'exposants relatifs. | COLLEGE_POINTER | — | — | puissances-4e (exposants négatifs, règles opératoires) et p… |
| `LP9` | 1 | Manipuler les puissances d'exposants fractionnaires. | PREMIERE | — | — | Exposants fractionnaires absents de tout le référentiel 202… |
| `LP10` | 1 | Utiliser les règles sur les puissances : a^n × a^m = a^(n+m… | COLLEGE_POINTER | — | — | puissances-4e : « Règles opératoires de base sur les exposa… |
| `LP11` | 1 | Effectuer des calculs avec les racines carrées. | COLLEGE_POINTER | — | — | racines-carrees (3e) M4 Pavage et produit : racine(a)*racin… |
| `LP12` | 1 | Simplifier des racines carrées. | COLLEGE_POINTER | — | — | racines-carrees (3e) M5 « Simplifier une racine » ; le 4e l… |
| `LP13` | 1 | Rationaliser les dénominateurs. | PREMIERE | — | — | racines-carrees/lesson.config.js l.96 met « La rationalisat… |
| `LP14` | 1 | Résoudre des équations nécessitant la manipulation d'expres… | SUBSUMED | `equations-et-inequations-2nde_P2` `equations-et-inequations-2nde_P5` `equations-et-inequations-2nde_P6` | — | 1er degré, produit nul, quotient avec valeur interdite ; le… |
| `LP15` | 1 | Résoudre des inéquations nécessitant la manipulation d'expr… | SUBSUMED | `equations-et-inequations-2nde_P3` `signe-fonctions-2nde_P8` | — | Inéquation du 1er degré (M3) plus tableau de signes produit… |
| `LP16` | 2 | Déterminer l'ensemble de définition d'une fonction. | EXACT | `fonctions-2nde_P3` | — | fonctions-2nde M2 « Image, antécédent, ensemble de définiti… |
| `LP17` | 2 | Calculer l'image d'un nombre. | EXACT | `fonctions-2nde_P4` | — | M2/M3/M7 ; sonde verticale. |
| `LP18` | 2 | Déterminer un antécédent. | EXACT | `fonctions-2nde_P5` | — | M2/M3/M7 ; sonde horizontale, comptage des antécédents. |
| `LP19` | 2 | Étudier les variations d'une fonction. | SPLIT | `variations-extremums-2nde_P1` `variations-extremums-2nde_P2` `variations-extremums-2nde_P3` | — | Croissance, décroissance, monotonie définies par les inégal… |
| `LP20` | 2 | Interpréter les variations graphiquement. | EXACT | `variations-extremums-2nde_P4` | — | M1 Le randonneur : la piste se peint vert/rose selon le sen… |
| `LP21` | 2 | Identifier des extrema. | SPLIT | `variations-extremums-2nde_P7` `variations-extremums-2nde_P8` `variations-extremums-2nde_P9` | — | M4 : maximum, minimum, extremum sur un intervalle réglable,… |
| `LP22` | 2 | Lire les propriétés d'une fonction à partir de sa représent… | SPLIT | `fonctions-2nde_P7` `fonctions-de-reference-2nde_P7` `variations-extremums-2nde_P4` `signe-fonctions-2nde_P2` | — | Lecture graphique éclatée : images/antécédents, caractérist… |
| `LP23` | 2 | Étudier la parité d'une fonction lorsque pertinent. | PARTIAL | `fonctions-de-reference-2nde_P7` | — | f(-x)=f(x) et g(-x)=-g(x) enseignés comme symétries (M1/M2/… |
| `LP24` | 2 | Identifier/interpréter les asymptotes lorsque pertinent. | PREMIERE | — | — | Le mot « asymptote » est absent de tout apps/web/src/lesson… |
| `LP25` | 2 | Résoudre graphiquement f(x)=k. | EXACT | `fonctions-2nde_P5` `fonctions-de-reference-2nde_P10` | — | Sonde horizontale y=k générale : fonctions-2nde M2/M6, refe… |
| `LP26` | 2 | Résoudre graphiquement f(x)>k. | PARTIAL | `signe-fonctions-2nde_P10` `signe-fonctions-2nde_P12` | — | signe-fonctions M5 résout f(x)>0 (k=0) avec bandes sur la c… |
| `LP27` | 2 | Résoudre graphiquement f(x)≤k. | PARTIAL | `signe-fonctions-2nde_P11` `signe-fonctions-2nde_P8` | — | M5 fait f(x)<=0 et Q(x)>=0 ; le seuil reste 0, la comparais… |
| `LP28` | 2 | Construire un tableau de variation. | EXACT | `variations-extremums-2nde_P5` | — | M3 : poser soi-même les flèches sous la piste, brique metho… |
| `LP29` | 2 | Représenter des fonctions de référence. | EXACT | `fonctions-de-reference-2nde_P6` | — | M1/M5/M6 ; tableau de valeurs puis tracé (P5 pour le tablea… |
| `LP30` | 3 | Reconnaître une fonction linéaire f(x)=ax. | COLLEGE_POINTER | — | — | fonctions-lineaires-3e (« Reconnaître une fonction linéaire… |
| `LP31` | 3 | Caractériser une fonction linéaire. | COLLEGE_POINTER | — | — | fonctions-lineaires-3e M2 Coefficient, M3 Droite à pivot ; … |
| `LP32` | 3 | Reconnaître une fonction affine f(x)=ax+b. | EXACT | `fonction-affine-2nde_P1` | — | fonction-affine-2nde M1 Le réservoir, M2 table à accroissem… |
| `LP33` | 3 | Caractériser une fonction affine. | SPLIT | `fonction-affine-2nde_P2` `fonction-affine-2nde_P3` `fonction-affine-2nde_P4` | — | a comme taux d'accroissement, b comme valeur de départ ; M1… |
| `LP34` | 3 | Déterminer l'équation d'une droite à partir de deux points. | EXACT | `equations-de-droites-2nde_P5` | — | Aussi seconde_fonction-affine-2nde_P6 (M4 « Retrouver la fo… |
| `LP35` | 3 | Déterminer l'équation d'une droite à partir d'un point et d… | EXACT | `equations-de-droites-2nde_P7` | — | M6/M7 ; official include « à partir d'un point et de la pen… |
| `LP36` | 3 | Interpréter graphiquement le coefficient directeur. | EXACT | `fonction-affine-2nde_P7` | — | Aussi equations-de-droites P3/P4 (pente) ; M2/M4 lecture du… |
| `LP37` | 3 | Interpréter graphiquement l'ordonnée à l'origine. | EXACT | `fonction-affine-2nde_P8` | — | M3/M4 : lecture de b à l'intersection avec l'axe des ordonn… |
| `LP38` | 3 | Relier fonction linéaire et proportionnalité. | COLLEGE_POINTER | — | — | fonctions-lineaires-3e « Relier une fonction linéaire à une… |
| `LP39` | 3 | Comprendre que la fonction linéaire est le modèle mathémati… | COLLEGE_POINTER | — | — | Idem LP38 ; proportions-pourcentages-2nde traite le coeffic… |
| `LP40` | 3 | Déterminer une fonction linéaire à partir d'un point de sa … | COLLEGE_POINTER | — | — | fonctions-lineaires-3e M4 « Retrouver le coefficient » ; l'… |
| `LP41` | 3 | Modéliser une situation de proportionnalité par une fonctio… | COLLEGE_POINTER | — | — | fonctions-lineaires-3e / proportionnalite-3e ; en 2de la mo… |
| `LP42` | 3 | Résoudre un problème de vitesse constante avec une fonction… | COLLEGE_POINTER | — | — | fonctions-lineaires-3e (M1 prix au kilo, problèmes) ; l'ate… |
| `LP43` | 3 | Résoudre un problème de coût proportionnel avec une fonctio… | COLLEGE_POINTER | — | — | Idem ; le coût proportionnel est un exercice de fonctions-l… |
| `LP44` | 3 | Modéliser une situation concrète par une fonction affine. | EXACT | `fonction-affine-2nde_P6` | — | M6 Atelier : modéliser (abonnement 25 € + 30 €/mois) ; M7 m… |
| `LP45` | 3 | Résoudre des problèmes appliqués avec une fonction affine. | SPLIT | `fonction-affine-2nde_P9` `fonction-affine-2nde_P10` `fonction-affine-2nde_P11` | — | M5 « Signe, équations, inéquations » puis M6 les applique a… |
| `LP46` | 3 | Étudier les intersections de deux droites. | EXACT | `positions-relatives-droites-2nde_P5` | — | M4 Le point d'intersection ; P1/P2 distinguent parallèles e… |
| `LP47` | 3 | Interpréter géométriquement l'intersection de deux droites. | EXACT | `positions-relatives-droites-2nde_P7` | — | M4/M5 : lecture graphique de l'intersection, cas 0 / 1 / un… |
| `LP48` | 3 | Relier l'intersection de droites à un système d'équations. | EXACT | `positions-relatives-droites-2nde_P6` | — | M4 : brique point-intersection-systeme, methode-resoudre-sy… |
| `LP49` | 4 | Connaître f(x)=x². | EXACT | `fonctions-de-reference-2nde_P2` | — | M2 La parabole ; brique fonction-carre. |
| `LP50` | 4 | Connaître f(x)=x³. | MISSING | — | `fonctions_cube_racine` | lesson.config.js l.94 exclut « Fonctions racine carrée et c… |
| `LP51` | 4 | Connaître f(x)=√x. | MISSING | — | `fonctions_cube_racine` | Même exclusion explicite ; les trois références du repo son… |
| `LP52` | 4 | Connaître l'ensemble de définition de √x. | MISSING | — | `fonctions_cube_racine` | D = [0 ; +inf[ n'est jamais posé : la fonction racine n'exi… |
| `LP53` | 4 | Connaître f(x)=1/x. | EXACT | `fonctions-de-reference-2nde_P3` | — | M3 L'hyperbole ; D = R*, centre de symétrie O, signe de x. |
| `LP54` | 4 | Étudier la parité de la fonction carrée. | PARTIAL | `fonctions-de-reference-2nde_P2` `fonctions-de-reference-2nde_P7` | — | M2 établit f(-a)=f(a) et l'axe (Oy) ; le mot « paire » n'es… |
| `LP55` | 4 | Étudier les variations de la fonction carrée. | SUBSUMED | `fonctions-de-reference-2nde_P2` | — | M2 : décroissante sur ]-inf ; 0], croissante sur [0 ; +inf[… |
| `LP56` | 4 | Identifier le minimum de la fonction carrée. | SUBSUMED | `fonctions-de-reference-2nde_P2` `fonctions-de-reference-2nde_P7` | — | Minimum 0 en 0 dans knowledge.jsx fonction-carre et l'épreu… |
| `LP57` | 4 | Représenter graphiquement la fonction carrée. | SUBSUMED | `fonctions-de-reference-2nde_P6` `fonctions-de-reference-2nde_P5` | — | M1 tableau de valeurs puis tracé ; P6 couvre les trois réfé… |
| `LP58` | 4 | Interpréter la parabole. | SUBSUMED | `fonctions-de-reference-2nde_P7` | — | Brique mem-parabole : sommet O, axe de symétrie, jamais sou… |
| `LP59` | 4 | Résoudre x²=k. | SUBSUMED | `fonctions-de-reference-2nde_P10` | — | M5 étape 1 : sonde horizontale à 4 puis -1 — deux solutions… |
| `LP60` | 4 | Résoudre x²>k. | MISSING | — | `second_degre_elementaire` | x²>k n'est posé nulle part ; M5 compte les points communs a… |
| `LP61` | 4 | Résoudre x²≤k. | MISSING | — | `second_degre_elementaire` | x²<=k absent ; equations-et-inequations exclut les équation… |
| `LP62` | 4 | Étudier des fonctions de type ax²+b. | MISSING | — | `second_degre_elementaire` | Aucune famille ax²+b en 2de ; seule x^2 nue est étudiée, sa… |
| `LP63` | 4 | Représenter graphiquement des fonctions de type ax²+b. | MISSING | — | `second_degre_elementaire` | Corollaire de LP62 : aucun tracé de parabole paramétrée dan… |
| `LP64` | 4 | Comparer les comportements des fonctions de référence. | EXACT | `fonctions-de-reference-2nde_P8` | — | M5 étape 4 : ordre des trois courbes sur ]0;1[ et ]1;+inf[,… |
| `LP65` | 4 | Utiliser la fonction cube dans une modélisation. | MISSING | — | `fonctions_cube_racine` | P11 modélise avec une référence, mais le cube n'en est pas … |
| `LP66` | 5 | Déterminer le sens de variation d'une fonction sur un inter… | EXACT | `variations-extremums-2nde_P3` | — | M2 étape 3 : la monotonie est relative à un intervalle ; br… |
| `LP67` | 5 | Identifier une fonction croissante. | EXACT | `variations-extremums-2nde_P1` | — | M2 : trois paires a<b donnent h(a)<h(b) ; brique definition… |
| `LP68` | 5 | Identifier une fonction décroissante. | EXACT | `variations-extremums-2nde_P2` | — | M2 étape 2 : sur [3 ; 6], a<b et h(a)>h(b). |
| `LP69` | 5 | Construire un tableau de variation complet. | EXACT | `variations-extremums-2nde_P5` | — | M3 étape 1 : les quatre flèches posées à la main, correctio… |
| `LP70` | 5 | Faire apparaître domaine, variations et extrema dans un tab… | SPLIT | `variations-extremums-2nde_P5` `variations-extremums-2nde_P6` `variations-extremums-2nde_P9` | — | Bornes du domaine dans le tableau (M3), lecture (M3 étape 2… |
| `LP71` | 5 | Interpréter graphiquement les variations. | SPLIT | `variations-extremums-2nde_P4` `variations-extremums-2nde_P10` | — | M1 lecture sur la courbe, M3 étape 3 le passage tableau <->… |
| `LP72` | 5 | Relier les variations à une situation concrète. | SUBSUMED | `variations-extremums-2nde_P4` `variations-extremums-2nde_P12` | — | Le sentier (altitude/distance) et l'atelier M6 ancrent les … |
| `LP73` | 5 | Utiliser les variations dans un problème d'optimisation. | EXACT | `variations-extremums-2nde_P12` | — | M6 Atelier : optimiser (enclos d'aire maximale, coût minima… |
| `LP74` | 5 | Étudier les variations de fonctions construites à partir de… | MISSING | — | `variations_operations` | Aucune composition à partir des références ; variations-ext… |
| `LP75` | 5 | Étudier les variations d'une somme. | MISSING | — | `variations_operations` | Variations d'une somme hors des 12 items officiels de varia… |
| `LP76` | 5 | Étudier les variations d'un produit lorsque pertinent. | MISSING | — | `variations_operations` | Variations d'un produit absentes du référentiel 2026 comme … |
| `LP77` | 5 | Étudier les variations d'un quotient lorsque pertinent. | MISSING | — | `variations_operations` | Variations d'un quotient absentes ; signe-fonctions traite … |
| `LP78` | 6 | Résoudre une équation du premier degré. | EXACT | `equations-et-inequations-2nde_P2` | — | Module 02 « Isoler x sans casser l'égalité » ; l'objet offi… |
| `LP79` | 6 | Résoudre une équation du second degré. | PARTIAL | `equations-et-inequations-2nde_P5` | — | Le second degré n'est pas au programme de 2de : seule la fo… |
| `LP80` | 6 | Résoudre une équation sous forme développée. | SUBSUMED | `equations-et-inequations-2nde_P2` `equations-et-inequations-2nde_P5` | — | Une équation développée se ramène au premier degré (P2) ou … |
| `LP81` | 6 | Résoudre une équation sous forme factorisée. | EXACT | `equations-et-inequations-2nde_P5` | — | P5 « Résoudre des équations produit » — module 04 « Produit… |
| `LP82` | 6 | Résoudre une inéquation du premier degré. | EXACT | `equations-et-inequations-2nde_P3` | — | P3 ; module 03 « Le signe qui se retourne » traite l'invers… |
| `LP83` | 6 | Résoudre une inéquation du second degré. | PARTIAL | `signe-fonctions-2nde_P6` `signe-fonctions-2nde_P8` | — | Atteignable via signe-fonctions : trinôme factorisé = table… |
| `LP84` | 6 | Interpréter graphiquement les solutions d'une équation. | PARTIAL | `signe-fonctions-2nde_P12` `signe-fonctions-2nde_P2` | — | signe-fonctions P9/P12 relient f(x)=0 aux zéros lus sur la … |
| `LP85` | 6 | Interpréter graphiquement les solutions d'une inéquation. | EXACT | `signe-fonctions-2nde_P2` `signe-fonctions-2nde_P10` `signe-fonctions-2nde_P11` `signe-fonctions-2nde_P12` `equations-et-inequations-2nde_P4` | — | signe-fonctions M05 lit les bandes au-dessus/en dessous de … |
| `LP86` | 6 | Résoudre des équations avec valeur absolue. | PARTIAL | `valeur-absolue-distance-2nde_P5` | — | \|x−a\|=r est TAUGHT dans valeur-absolue M04 (brique equation… |
| `LP87` | 6 | Résoudre des inéquations avec valeur absolue. | PARTIAL | `valeur-absolue-distance-2nde_P5` | — | \|x−a\|≤r ⇔ [a−r;a+r] enseigné en valeur-absolue M04 (BeamLin… |
| `LP88` | 6 | Résoudre des équations fractionnaires. | EXACT | `equations-et-inequations-2nde_P6` | — | P6 « équations quotient avec les restrictions » ; module 05… |
| `LP89` | 6 | Résoudre des inéquations fractionnaires. | PARTIAL | `signe-fonctions-2nde_P7` `signe-fonctions-2nde_P8` | — | Passe par le tableau de signes d'un quotient (signe-fonctio… |
| `LP90` | 6 | Traduire un problème concret en équation. | EXACT | `equations-et-inequations-2nde_P1` `equations-et-inequations-2nde_P7` | — | Objet officiel « Modéliser un problème par une équation » ;… |
| `LP91` | 6 | Traduire un problème concret en inéquation. | EXACT | `equations-et-inequations-2nde_P3` `equations-et-inequations-2nde_P7` | — | Module 06 « Modéliser » et la mission finale « les deux for… |
| `LP92` | 6 | Interpréter une solution dans le contexte du problème. | EXACT | `equations-et-inequations-2nde_P7` | — | P7 « Interpréter et vérifier les solutions », enseigné par … |
| `LP93` | 7 | Placer un point dans un repère orthonormé. | COLLEGE_POINTER | — | — | Placer un point : reperage-droite-plan-3e (module 04 « Plac… |
| `LP94` | 7 | Lire les coordonnées d'un point. | COLLEGE_POINTER | — | — | Lire les coordonnées : reperage-droite-plan-3e module 03 « … |
| `LP95` | 7 | Calculer la distance entre deux points à partir de leurs co… | EXACT | `vecteurs-2nde_P12` | — | vecteurs-2nde P12 « Calculer une distance entre deux points… |
| `LP96` | 7 | Déterminer les coordonnées du milieu d'un segment. | EXACT | `vecteurs-2nde_P13` | — | vecteurs-2nde P13 « Coordonnées du milieu d'un segment », m… |
| `LP97` | 7 | Utiliser la colinéarité à l'aide des coordonnées. | EXACT | `colinearite-alignement-2nde_P3` `colinearite-alignement-2nde_P4` `colinearite-alignement-2nde_P5` | — | colinearite-alignement-2nde : proportionnalité des coordonn… |
| `LP98` | 7 | Utiliser l'orthogonalité à l'aide des coordonnées. | MISSING | — | `orthogonalite_coordonnees` | Aucun produit scalaire en 2de : l'orthogonalité par coordon… |
| `LP99` | 7 | Établir une équation de droite sous forme adaptée au contex… | EXACT | `equations-de-droites-2nde_P5` `equations-de-droites-2nde_P6` `equations-de-droites-2nde_P7` `equations-de-droites-2nde_P8` `equations-de-droites-2nde_P9` | — | equations-de-droites-2nde : réduite (P8) et cartésienne (P9… |
| `LP100` | 7 | Utiliser une équation de droite dans le plan. | EXACT | `equations-de-droites-2nde_P10` `equations-de-droites-2nde_P11` | — | Tracer une droite depuis son équation (P10) et tester l'app… |
| `LP101` | 8 | Caractériser un vecteur par sa direction. | PARTIAL | `vecteurs-2nde_P1` | — | La direction est l'un des trois attributs de l'égalité (M02… |
| `LP102` | 8 | Caractériser un vecteur par son sens. | PARTIAL | `vecteurs-2nde_P1` `vecteurs-2nde_P5` | — | Le sens apparaît dans l'égalité (M02) et dans le vecteur op… |
| `LP103` | 8 | Caractériser un vecteur par sa norme. | EXACT | `vecteurs-2nde_P10` | — | P10 « Calculer la norme d'un vecteur » (module 06) ; la lon… |
| `LP104` | 8 | Additionner des vecteurs. | EXACT | `vecteurs-2nde_P4` | — | P4 « Additionner deux vecteurs » ; module 04 « Enchaîner le… |
| `LP105` | 8 | Soustraire des vecteurs. | MISSING | — | — | Le vecteur opposé est enseigné (M02, briques vecteur-opposé… |
| `LP106` | 8 | Multiplier un vecteur par un réel. | EXACT | `vecteurs-2nde_P5` | — | P5 « Multiplier un vecteur par un réel » ; module 05 « Étir… |
| `LP107` | 8 | Déterminer les coordonnées d'un vecteur. | EXACT | `vecteurs-2nde_P8` `vecteurs-2nde_P9` `vecteurs-2nde_P11` | — | Lire (P8), calculer (P9) et former les coordonnées de AB (P… |
| `LP108` | 8 | Calculer la norme d'un vecteur. | EXACT | `vecteurs-2nde_P10` | — | P10, module 06 : ‖u‖ = √(x²+y²), avec le piège de la racine… |
| `LP109` | 8 | Établir la colinéarité de deux vecteurs par le calcul. | EXACT | `colinearite-alignement-2nde_P3` `colinearite-alignement-2nde_P4` `colinearite-alignement-2nde_P5` | — | colinearite-alignement-2nde : proportionnalité des coordonn… |
| `LP110` | 8 | Établir la colinéarité graphiquement. | EXACT | `vecteurs-2nde_P6` `colinearite-alignement-2nde_P1` `colinearite-alignement-2nde_P2` | — | Reconnaître graphiquement deux vecteurs colinéaires : vecte… |
| `LP111` | 8 | Utiliser les vecteurs pour démontrer un parallélisme. | EXACT | `colinearite-alignement-2nde_P7` `colinearite-alignement-2nde_P9` | — | colinearite-alignement-2nde P7 « deux droites parallèles » … |
| `LP112` | 8 | Utiliser les vecteurs pour démontrer un alignement. | EXACT | `colinearite-alignement-2nde_P6` `colinearite-alignement-2nde_P8` `equations-de-droites-2nde_P12` | — | Alignement de trois points : colinéarité P6/P8 et equations… |
| `LP113` | 8 | Utiliser les vecteurs pour démontrer une propriété de milie… | EXACT | `vecteurs-2nde_P13` `vecteurs-2nde_P14` | — | vecteurs-2nde P13 (milieu) et P14 (résoudre un problème) ; … |
| `LP114` | 9 | Comprendre le cercle trigonométrique. | MISSING | — | `trigonometrie_cercle` | Aucun objet officiel de trigonométrie en 2de ; le 3e trigon… |
| `LP115` | 9 | Comprendre le radian. | MISSING | — | `trigonometrie_cercle` | Le radian n'apparaît ni dans le référentiel 2de ni au collè… |
| `LP116` | 9 | Associer un réel t à un point du cercle trigonométrique. | MISSING | — | `trigonometrie_cercle` | Enroulement de la droite des réels sur le cercle : absent d… |
| `LP117` | 9 | Déterminer les coordonnées d'un point du cercle trigonométr… | MISSING | — | `trigonometrie_cercle` | Coordonnées (cos t ; sin t) d'un point du cercle : rien en … |
| `LP118` | 9 | Connaître les valeurs remarquables du cosinus. | MISSING | — | `trigonometrie_cercle` | Valeurs remarquables du cosinus : absentes du référentiel 2… |
| `LP119` | 9 | Connaître les valeurs remarquables du sinus. | MISSING | — | `trigonometrie_cercle` | Valeurs remarquables du sinus : même constat, aucun objet o… |
| `LP120` | 9 | Utiliser les valeurs remarquables. | MISSING | — | `trigonometrie_cercle` | Utiliser les valeurs remarquables suppose le cercle : hors … |
| `LP121` | 9 | Utiliser cos²(t)+sin²(t)=1. | MISSING | — | `trigonometrie_cercle` | cos²t + sin²t = 1 n'apparaît nulle part dans le référentiel… |
| `LP122` | 9 | Utiliser les formules d'addition lorsque au programme de la… | PREMIERE | — | — | Les formules d'addition ne sont ni en 2de ni au collège : e… |
| `LP123` | 9 | Résoudre cos(t)=a sur un intervalle donné. | MISSING | — | `trigonometrie_cercle` | Résoudre cos(t)=a sur un intervalle exige le cercle trigono… |
| `LP124` | 9 | Résoudre sin(t)=a sur un intervalle donné. | MISSING | — | `trigonometrie_cercle` | Résoudre sin(t)=a sur un intervalle : même exclusion. À cou… |
| `LP125` | 10 | Calculer une probabilité dans une situation d'équiprobabili… | COLLEGE_POINTER | `loi-grands-nombres-2nde_P8` | — | Enseigné en probabilites-5e (« Calculer une probabilité en … |
| `LP126` | 10 | Utiliser le dénombrement dans une situation probabiliste. | MISSING | — | — | Aucune occurrence de dénombrement, combinaison, arrangement… |
| `LP127` | 10 | Construire un arbre pondéré. | EXACT | `arbres-probabilites-2nde_P1` `arbres-probabilites-2nde_P9` | — | arbres-probabilites-2nde P1 « Construire un arbre » et P9 «… |
| `LP128` | 10 | Lire un arbre pondéré. | EXACT | `arbres-probabilites-2nde_P2` `arbres-probabilites-2nde_P3` `arbres-probabilites-2nde_P10` | — | P2 « Lire un arbre pondéré », P3 (pondération d'une branche… |
| `LP129` | 10 | Calculer une probabilité à partir d'un arbre. | EXACT | `arbres-probabilites-2nde_P5` `arbres-probabilites-2nde_P6` `arbres-probabilites-2nde_P7` | — | Probabilité d'un chemin (P5), produit des branches (P6), pr… |
| `LP130` | 10 | Utiliser la formule des probabilités totales lorsque pertin… | SUBSUMED | `arbres-probabilites-2nde_P7` `arbres-probabilites-2nde_P8` | — | Enseignée sans son nom : module 04 « Additionner les chemin… |
| `LP131` | 10 | Reconnaître une situation d'indépendance. | MISSING | — | `independance_probabiliste` | L'indépendance n'apparaît que comme hypothèse de répétition… |
| `LP132` | 10 | Calculer une probabilité conditionnelle. | EXACT | `probabilites-conditionnelles-2nde_P3` `probabilites-conditionnelles-2nde_P4` `probabilites-conditionnelles-2nde_P5` | — | probabilites-conditionnelles-2nde : calculer P_A(B) (P3), d… |
| `LP133` | 10 | Utiliser une probabilité conditionnelle pour résoudre un pr… | EXACT | `probabilites-conditionnelles-2nde_P7` `probabilites-conditionnelles-2nde_P9` `tests-diagnostiques-probabilites-2nde_P8` | — | Interpréter (P7), relier aux fréquences conditionnelles (P9… |
| `LP134` | 10 | Modéliser une situation concrète avec les probabilités. | EXACT | `arbres-probabilites-2nde_P9` `tests-diagnostiques-probabilites-2nde_P1` `probabilites-conditionnelles-2nde_P5` | — | Modéliser : passer d'une situation réelle à un arbre (arbre… |
| `LP135` | 10 | Interpréter le résultat probabiliste dans son contexte. | EXACT | `probabilites-conditionnelles-2nde_P7` `probabilites-conditionnelles-2nde_P8` `tests-diagnostiques-probabilites-2nde_P9` `tests-diagnostiques-probabilites-2nde_P10` | — | Interprétation contextuelle et piège de l'inversion du cond… |
| `LP136` | 11 | Représenter des points, droites et plans dans l'espace. | MISSING | — | `geometrie_espace_positions_sections` | Aucun objet « espace » en 2de (le domaine géométrie est vec… |
| `LP137` | 11 | Représenter des solides. | COLLEGE_POINTER | — | — | representations-espace-5e (vues, perspective, patrons) et r… |
| `LP138` | 11 | Étudier les positions relatives de droites. | COLLEGE_POINTER | — | — | representation-espace-3e module 07 « Dans le cube » : droit… |
| `LP139` | 11 | Étudier les positions relatives de plans. | MISSING | — | `geometrie_espace_positions_sections` | Positions relatives de deux PLANS : ni le 3e (dont l'objet … |
| `LP140` | 11 | Étudier le parallélisme dans l'espace. | MISSING | — | `geometrie_espace_positions_sections` | Le parallélisme dans l'espace (théorème du toit, plans para… |
| `LP141` | 11 | Étudier l'orthogonalité dans l'espace. | MISSING | — | `geometrie_espace_positions_sections` | L'orthogonalité dans l'espace (droite orthogonale à un plan… |
| `LP142` | 11 | Calculer le volume d'un parallélépipède. | COLLEGE_POINTER | — | — | Volume du parallélépipède : acquis antérieur au collège, mo… |
| `LP143` | 11 | Calculer le volume d'un prisme. | COLLEGE_POINTER | — | — | Le prisme droit sert de récipient de référence en represent… |
| `LP144` | 11 | Calculer le volume d'une pyramide. | COLLEGE_POINTER | — | — | representations-espace-4e : pointsToLearn « Calculer le vol… |
| `LP145` | 11 | Calculer le volume d'un cône. | COLLEGE_POINTER | — | — | representations-espace-4e : « Calculer le volume d'un cône … |
| `LP146` | 11 | Calculer le volume d'une sphère. | MISSING | — | `geometrie_espace_volumes_coordonnees` | Le volume de la boule est au scope officiel de 3e mais repr… |
| `LP147` | 11 | Déterminer une section plane d'un solide. | MISSING | — | `geometrie_espace_positions_sections` | « Sections de solides par un plan » est au scope officiel 3… |
| `LP148` | 11 | Représenter une section plane. | MISSING | — | `geometrie_espace_positions_sections` | Représenter une section plane : même trou que LP147, aucun … |
| `LP149` | 11 | Utiliser les coordonnées dans l'espace. | MISSING | — | `geometrie_espace_volumes_coordonnees` | Coordonnées dans l'espace : exclues explicitement en 5e, 4e… |
| `LP150` | 11 | Résoudre un problème de géométrie spatiale avec des coordon… | MISSING | — | `geometrie_espace_volumes_coordonnees` | Résoudre un problème spatial par coordonnées suppose LP149 … |
| `LP151` | 12 | Comprendre population et caractère. | SUBSUMED | `statistiques-une-variable-2nde_P1` | — | Population et caractère sont portés par « Lire une série st… |
| `LP152` | 12 | Identifier le mode. | COLLEGE_POINTER | — | — | Le mode n'est enseigné dans AUCUNE leçon : priorKnowledge m… |
| `LP153` | 12 | Calculer l'étendue. | COLLEGE_POINTER | `boites-a-moustaches-2nde_P3` | — | L'étendue est enseignée en statistiques-4e et statistiques-… |
| `LP154` | 12 | Calculer la médiane. | EXACT | `statistiques-une-variable-2nde_P4` `series-regroupees-classes-2nde_P8` `series-regroupees-classes-2nde_P9` | — | statistiques-une-variable P4 + classe médiane (SR P8/P9). T… |
| `LP155` | 12 | Calculer la moyenne. | EXACT | `statistiques-une-variable-2nde_P2` `statistiques-une-variable-2nde_P3` `series-regroupees-classes-2nde_P6` `series-regroupees-classes-2nde_P7` | — | Moyenne (P2), linéarité (P3), moyenne pondérée et estimatio… |
| `LP156` | 12 | Interpréter moyenne et médiane. | EXACT | `statistiques-une-variable-2nde_P6` `statistiques-une-variable-2nde_P12` `boites-a-moustaches-2nde_P6` `boites-a-moustaches-2nde_P8` | — | Interpréter les indicateurs (P6), comparer deux séries (P12… |
| `LP157` | 12 | Construire/lire un diagramme en bâtons. | COLLEGE_POINTER | — | — | Diagramme en bâtons : statistiques-5e module 05 « Barres ou… |
| `LP158` | 12 | Construire/lire un histogramme. | EXACT | `series-regroupees-classes-2nde_P3` `series-regroupees-classes-2nde_P4` | — | series-regroupees-classes-2nde P3 « Construire un histogram… |
| `LP159` | 12 | Construire/lire un diagramme circulaire. | COLLEGE_POINTER | — | — | Diagramme circulaire : statistiques-5e module 05, pointsToL… |
<!-- END GENERATED: reconciliation -->

---

## 3. Inventaire des leçons existantes

<!-- BEGIN GENERATED: lesson-inventory -->
| Leçon | Domaine | Statut | Durée cat./config/somme | Modules | LP | Briques | requires | Snapshots | Carte | Spec | e2e | Signalements |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | :-: | :-: | :-: | --- |
| `fonctions-en-python-2nde` | algorithmique_programmation | available | 86 / 86 / 86 | 8 | 12 | 18 | 53 | 7 | ✅ | ❌ | ❌ | NO_SPEC, NO_E2E, NO_LEARNING_POINTS_MIRROR |
| `variables-et-instructions-2nde` | algorithmique_programmation | available | 76 / 76 / 76 | 7 | 12 | 15 | 53 | 6 | ✅ | ❌ | ❌ | NO_SPEC, NO_E2E, NO_LEARNING_POINTS_MIRROR |
| `fonction-affine-2nde` | fonctions | available | 78 / 78 / 78 | 8 | 11 | 14 | 65 | 7 | ✅ | ✅ | ✅ | — |
| `fonctions-2nde` | fonctions | available | 87 / 87 / 87 | 9 | 12 | 23 | 161 | 8 | ✅ | ✅ | ✅ | — |
| `fonctions-de-reference-2nde` | fonctions | available | 84 / 84 / 84 | 8 | 11 | 20 | 76 | 7 | ✅ | ✅ | ✅ | — |
| `signe-fonctions-2nde` | fonctions | available | 80 / 80 / 80 | 8 | 12 | 17 | 98 | 7 | ✅ | ✅ | ✅ | — |
| `variations-extremums-2nde` | fonctions | available | 85 / 85 / 85 | 8 | 12 | 15 | 151 | 7 | ✅ | ✅ | ✅ | — |
| `colinearite-alignement-2nde` | geometrie | available | 64 / 64 / 64 | 7 | 9 | 24 | 65 | 6 | ✅ | ✅ | ✅ | — |
| `equations-de-droites-2nde` | geometrie | available | 85 / 85 / 85 | 9 | 12 | 30 | 78 | 8 | ✅ | ✅ | ✅ | — |
| `positions-relatives-droites-2nde` | geometrie | available | 70 / 70 / 70 | 7 | 8 | 21 | 77 | 6 | ✅ | ✅ | ✅ | — |
| `trigonometrie-cercle-2nde` | geometrie | available | 80 / 80 / 80 | 6 | 9 | 13 | 56 | 5 | ✅ | ❌ | ❌ | NO_SPEC, NO_E2E, NO_LEARNING_POINTS_MIRROR |
| `trigonometrie-equations-2nde` | geometrie | available | 75 / 75 / 75 | 6 | 4 | 12 | 51 | 5 | ✅ | ❌ | ❌ | NO_SPEC, NO_E2E, NO_LEARNING_POINTS_MIRROR |
| `vecteurs-2nde` | geometrie | available | 84 / 84 / 84 | 9 | 14 | 29 | 66 | 8 | ✅ | ✅ | ✅ | — |
| `arithmetique-2nde` | nombres_calculs | available | 68 / 68 / 68 | 7 | 5 | 16 | 32 | 6 | ✅ | ✅ | ✅ | — |
| `calcul-litteral-2nde` | nombres_calculs | available | 80 / 80 / 80 | 8 | 10 | 19 | 73 | 7 | ✅ | ✅ | ✅ | — |
| `ensembles-et-intervalles-2nde` | nombres_calculs | available | 70 / 70 / 70 | 8 | 7 | 23 | 52 | 7 | ✅ | ✅ | ✅ | — |
| `equations-et-inequations-2nde` | nombres_calculs | available | 85 / 85 / 85 | 8 | 10 | 22 | 105 | 7 | ✅ | ✅ | ✅ | — |
| `logique-et-raisonnement-2nde` | nombres_calculs | available | 67 / 67 / 67 | 7 | 11 | 18 | 61 | 6 | ✅ | ✅ | ✅ | — |
| `nombres-reels-2nde` | nombres_calculs | available | 67 / 67 / 67 | 7 | 6 | 17 | 47 | 6 | ✅ | ✅ | ✅ | — |
| `valeur-absolue-distance-2nde` | nombres_calculs | available | 59 / 59 / 59 | 7 | 7 | 14 | 61 | 6 | ✅ | ✅ | ✅ | — |
| `arbres-probabilites-2nde` | statistiques_probabilites | available | 80 / 80 / 80 | 7 | 10 | 9 | 85 | 6 | ✅ | ✅ | ✅ | MAPPED_STEPS, NO_LEARNING_POINTS_MIRROR |
| `boites-a-moustaches-2nde` | statistiques_probabilites | available | 65 / 65 / 65 | 7 | 9 | 9 | 85 | 6 | ✅ | ✅ | ❌ | NO_E2E, NO_LEARNING_POINTS_MIRROR |
| `evolutions-successives-reciproques-2nde` | statistiques_probabilites | available | 70 / 70 / 70 | 8 | 8 | 13 | 112 | 7 | ✅ | ✅ | ❌ | NO_E2E, NO_LEARNING_POINTS_MIRROR |
| `frequences-conditionnelles-2nde` | statistiques_probabilites | available | 75 / 75 / 75 | 7 | 10 | 9 | 87 | 6 | ✅ | ✅ | ❌ | NO_E2E, NO_LEARNING_POINTS_MIRROR |
| `loi-grands-nombres-2nde` | statistiques_probabilites | available | 75 / 75 / 75 | 7 | 9 | 9 | 79 | 6 | ✅ | ✅ | ✅ | NO_LEARNING_POINTS_MIRROR |
| `probabilites-conditionnelles-2nde` | statistiques_probabilites | available | 80 / 80 / 80 | 7 | 9 | 7 | 86 | 6 | ✅ | ✅ | ✅ | NO_LEARNING_POINTS_MIRROR |
| `proportions-pourcentages-2nde` | statistiques_probabilites | available | 70 / 70 / 70 | 8 | 11 | 15 | 138 | 7 | ✅ | ✅ | ❌ | NO_E2E, NO_LEARNING_POINTS_MIRROR |
| `series-regroupees-classes-2nde` | statistiques_probabilites | available | 80 / 80 / 80 | 8 | 10 | 12 | 86 | 7 | ✅ | ✅ | ❌ | NO_E2E, NO_LEARNING_POINTS_MIRROR |
| `statistiques-une-variable-2nde` | statistiques_probabilites | available | 86 / 86 / 86 | 8 | 12 | 12 | 100 | 7 | ✅ | ✅ | ❌ | NO_E2E, NO_LEARNING_POINTS_MIRROR |
| `tableaux-croises-2nde` | statistiques_probabilites | available | 75 / 75 / 75 | 7 | 10 | 8 | 58 | 6 | ✅ | ✅ | ❌ | NO_E2E, NO_LEARNING_POINTS_MIRROR |
| `tests-diagnostiques-probabilites-2nde` | statistiques_probabilites | available | 81 / 81 / 81 | 7 | 11 | 9 | 85 | 6 | ✅ | ✅ | ✅ | MAPPED_STEPS, NO_LEARNING_POINTS_MIRROR |

<!-- END GENERATED: lesson-inventory -->

---

## 4. Matrice de couverture

<!-- BEGIN GENERATED: coverage-matrix -->
| LP | Chapter | Lesson | Module | Status | Evidence | Manipulation | Assessment | Knowledge Map | Progress |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `P1` Définir une fonction en Python | algorithmique_programmation | `fonctions-en-python-2nde` | M1 | COVERED | M1.1 manipulation:PyLab · M1.1 brick:fonction-python · M1.1 brick:def… | PyLab | `fp-e1` `fp-e2` | `fonction-python` `def-return` `appel-fonction` | M1 |
| `P2` Utiliser une fonction avec un argument | algorithmique_programmation | `fonctions-en-python-2nde` | M2 | COVERED | M2.1 manipulation:PyLab · M2.1 brick:parametre-argument · M2.1 assess… | PyLab | `fp-e5` | `parametre-argument` `regle-ordre-arguments` `portee-locale` | M2 |
| `P3` Utiliser une fonction avec plusieurs arguments | algorithmique_programmation | `fonctions-en-python-2nde` | M2 | COVERED | M2.1 manipulation:PyLab · M2.1 brick:regle-ordre-arguments · M2.1 bri… | PyLab | `fp-e6` `fp-e7` | `parametre-argument` `regle-ordre-arguments` `portee-locale` | M2 |
| `P4` Appeler une fonction | algorithmique_programmation | `fonctions-en-python-2nde` | M1 | COVERED | M1.1 manipulation:PyLab · M1.1 brick:appel-fonction · M1.1 brick:mem-… | PyLab | `fp-e3` `fp-e4` | `fonction-python` `def-return` `appel-fonction` | M1 |
| `P5` Lire une fonction existante | algorithmique_programmation | `fonctions-en-python-2nde` | M5 | COVERED | M5.1 manipulation:PyLab · M5.1 brick:methode-lire-fonction · M5.1 ass… | PyLab | `fp-e10` | `methode-lire-fonction` | M5 |
| `P6` Modifier une fonction | algorithmique_programmation | `fonctions-en-python-2nde` | M5 | COVERED | M5.1 manipulation:PyLab · M5.1 assessment:fp-e11 | PyLab | `fp-e11` | `methode-lire-fonction` | M5 |
| `P7` Compléter une fonction | algorithmique_programmation | `fonctions-en-python-2nde` | M5 | COVERED | M5.1 manipulation:PyLab · M5.1 assessment:fp-e14 | PyLab | `fp-e14` | `methode-lire-fonction` | M5 |
| `P8` Écrire une fonction réalisant un calcul | algorithmique_programmation | `fonctions-en-python-2nde` | M4 | COVERED | M4.1 manipulation:PyLab · M4.1 brick:methode-traduire-formule · M4.1 … | PyLab | `fp-e8` `fp-e9` | `methode-traduire-formule` `regle-return-vs-print` | M4 |
| `P9` Utiliser une fonction renvoyant un nombre alé… | algorithmique_programmation | `fonctions-en-python-2nde` | M3 | COVERED | M3.1 manipulation:PyLab · M3.1 brick:randint · M3.1 brick:regle-borne… | PyLab | `fp-e12` | `randint` `simulation` `regle-bornes-randint` | M3 |
| `P10` Répéter une fonction pour produire une série … | algorithmique_programmation | `fonctions-en-python-2nde` | M6 | COVERED | M6.1 manipulation:PyLab · M6.1 brick:methode-repeter-collecter · M6.1… | PyLab | `fp-e15` | `methode-repeter-collecter` `regle-fluctuation` `methode-verifier-simulation` | M6 |
| `P11` Simuler une expérience aléatoire | algorithmique_programmation | `fonctions-en-python-2nde` | M3 | COVERED | M3.1 manipulation:PyLab · M3.1 brick:simulation · M3.1 assessment:fp-… | PyLab | `fp-e12` | `randint` `simulation` `regle-bornes-randint` | M3 |
| `P12` Vérifier les résultats d'un programme | algorithmique_programmation | `fonctions-en-python-2nde` | M6 | COVERED | M6.1 manipulation:PyLab · M6.1 brick:regle-fluctuation · M6.1 brick:m… | PyLab | `fp-e13` | `methode-repeter-collecter` `regle-fluctuation` `methode-verifier-simulation` | M6 |
| `P1` Comprendre la notion de variable informatique | algorithmique_programmation | `variables-et-instructions-2nde` | M1 | COVERED | M1.1 manipulation:PyLab · M1.1 brick:variable-informatique · M1.1 que… | PyLab | `va-e1` | `variable-informatique` `types-python` `mem-nom-valeur-type` | M1 |
| `P2` Identifier les types entier, flottant, boolée… | algorithmique_programmation | `variables-et-instructions-2nde` | M1 | COVERED | M1.1 manipulation:PyLab · M1.1 brick:types-python · M1.1 brick:mem-no… | PyLab | `va-e2` `va-e3` | `variable-informatique` `types-python` `mem-nom-valeur-type` | M1 |
| `P3` Utiliser une affectation | algorithmique_programmation | `variables-et-instructions-2nde` | M2 | COVERED | M2.1 manipulation:PyLab · M2.1 brick:affectation · M2.1 brick:regle-o… | PyLab | `va-e4` | `affectation` `regle-ordre-affectation` `methode-formule-variables` | M2 |
| `P4` Écrire une séquence d'instructions | algorithmique_programmation | `variables-et-instructions-2nde` | M3 | COVERED | M3.1 manipulation:PyLab · M3.1 brick:sequence · M3.1 assessment:va-e5 | PyLab | `va-e5` | `sequence` `conditionnelle` `regle-cas-limite` | M3 |
| `P5` Utiliser une instruction conditionnelle | algorithmique_programmation | `variables-et-instructions-2nde` | M3 | COVERED | M3.1 manipulation:PyLab · M3.1 brick:conditionnelle · M3.1 brick:regl… | PyLab | `va-e6` | `sequence` `conditionnelle` `regle-cas-limite` | M3 |
| `P6` Utiliser une boucle for | algorithmique_programmation | `variables-et-instructions-2nde` | M4 | COVERED | M4.1 manipulation:PyLab · M4.1 brick:boucle-for · M4.1 assessment:va-… | PyLab | `va-e7` | `boucle-for` `boucle-while` `regle-condition-arret` | M4 |
| `P7` Utiliser une boucle while | algorithmique_programmation | `variables-et-instructions-2nde` | M4 | COVERED | M4.1 manipulation:PyLab · M4.1 brick:boucle-while · M4.1 brick:regle-… | PyLab | `va-e8` | `boucle-for` `boucle-while` `regle-condition-arret` | M4 |
| `P8` Écrire une formule avec des variables | algorithmique_programmation | `variables-et-instructions-2nde` | M2 | COVERED | M2.1 manipulation:PyLab · M2.1 brick:methode-formule-variables · M2.1… | PyLab | `va-e9` | `affectation` `regle-ordre-affectation` `methode-formule-variables` | M2 |
| `P9` Lire un algorithme | algorithmique_programmation | `variables-et-instructions-2nde` | M5 | COVERED | M5.1 manipulation:PyLab · M5.1 brick:methode-tracer · M5.1 assessment… | PyLab | `va-e10` | `methode-tracer` `methode-verifier` | M5 |
| `P10` Modifier un algorithme | algorithmique_programmation | `variables-et-instructions-2nde` | M5 | COVERED | M5.1 manipulation:PyLab · M5.1 assessment:va-e11 | PyLab | `va-e11` | `methode-tracer` `methode-verifier` | M5 |
| `P11` Compléter un algorithme | algorithmique_programmation | `variables-et-instructions-2nde` | M5 | COVERED | M5.1 manipulation:PyLab · M5.1 assessment:va-e12 | PyLab | `va-e12` | `methode-tracer` `methode-verifier` | M5 |
| `P12` Vérifier le fonctionnement d'un programme | algorithmique_programmation | `variables-et-instructions-2nde` | M5 | COVERED | M5.1 manipulation:PyLab · M5.1 brick:methode-verifier · M5.1 assessme… | PyLab | `va-e13` | `methode-tracer` `methode-verifier` | M5 |
| `P1` Reconnaître une fonction affine | fonctions | `fonction-affine-2nde` | M1, M2, M6 | COVERED | M1.1 manipulation:TankLab · M1.1 feedback · M1.1 brick:fonction-affin… | TankLab (M1 étape 1, a = 3 et b =… | `fa-e1` `fa-e4` | `fonction-affine-ab` `vocab-coefficient-ordonnee` `methode-reconnaitre-affine-table` | M1, M2, M6 |
| `P2` Identifier le coefficient directeur | fonctions | `fonction-affine-2nde` | M1, M3 | COVERED | M1.3 manipulation:TankLab · M1.3 feedback · M1.3 brick:vocab-coeffici… | TankLab M1 étape 3, b verrouillé … | `fa-e2` | `fonction-affine-ab` `vocab-coefficient-ordonnee` `mem-a-taux-b-depart` | M1, M3 |
| `P3` Identifier l'ordonnée à l'origine | fonctions | `fonction-affine-2nde` | M1 | COVERED | M1.2 manipulation:TankLab · M1.2 feedback · M1.3 brick:vocab-coeffici… | TankLab M1 étape 2, a verrouillé … | `fa-e2` `fa-e7` | `fonction-affine-ab` `vocab-coefficient-ordonnee` `mem-a-taux-b-depart` | M1 |
| `P4` Interpréter le coefficient directeur comme un… | fonctions | `fonction-affine-2nde` | M2, M6 | COVERED | M2.1 manipulation:RateProbes · M2.1 feedback · M2.1 brick:taux-accroi… | RateProbes sur V(t) = 3t + 10 : d… | `fa-e3` | `taux-accroissement` `formule-taux` `methode-modeliser-affine` | M2, M6 |
| `P5` Relier le signe du coefficient directeur aux … | fonctions | `fonction-affine-2nde` | M3, M6 | COVERED | M3.1 manipulation:TankLab · M3.1 feedback · M3.1 brick:regle-signe-a-… | TankLab M3 étape 1 SANS aucun ver… | `fa-e5` | `regle-signe-a-variations` `methode-lire-a-b-graphique` `methode-modeliser-affine` | M3, M6 |
| `P6` Déterminer une fonction affine à partir de do… | fonctions | `fonction-affine-2nde` | M4, M6 | PARTIALLY_COVERED | M4.1 question:M04-S1-Q1 · M4.2 question:M04-S2-Q1 · M4.2 brick:method… | AUCUNE. Le module 4 n'a pas de la… | `fa-e4` `fa-e7` `fa-e9` | `methode-determiner-affine` `mem-deux-points` `methode-modeliser-affine` | M4, M6 |
| `P7` Lire le coefficient directeur sur un graphique | fonctions | `fonction-affine-2nde` | M2, M4 | COVERED | M2.1 manipulation:RateProbes · M3.3 brick:methode-lire-a-b-graphique … | RateProbes (M2 étape 1) est la ma… | `fa-e6` | `methode-lire-a-b-graphique` `taux-accroissement` `formule-taux` | M2, M4 |
| `P8` Lire l'ordonnée à l'origine | fonctions | `fonction-affine-2nde` | M3, M4 | COVERED | M1.2 manipulation:TankLab · M3.3 brick:methode-lire-a-b-graphique · M… | TankLab avec `intercept={{ y: b, … | `fa-e6` | `methode-lire-a-b-graphique` `regle-signe-a-variations` `methode-determiner-affine` | M3, M4 |
| `P9` Étudier le signe d'une fonction affine | fonctions | `fonction-affine-2nde` | M5, M6 | PARTIALLY_COVERED | M5.2 brick:regle-signe-affine-zero · M5.2 question:M05-S2-r1 · M5.2 q… | AUCUNE. C'est le constat central … | `fa-e8` `fa-e10` | `regle-signe-affine-zero` `methode-equation-affine` `methode-inequation-affine` | M5, M6 |
| `P10` Résoudre une équation avec une fonction affine | fonctions | `fonction-affine-2nde` | M5, M6 | COVERED | M5.1 brick:methode-equation-affine · M5.1 question:M05-S1-Q1 · M5.3 q… | AUCUNE (TankLab frozen à l'étape … | `fa-e9` | `methode-equation-affine` `regle-signe-affine-zero` `methode-modeliser-affine` | M5, M6 |
| `P11` Résoudre une inéquation avec une fonction aff… | fonctions | `fonction-affine-2nde` | M5, M6 | COVERED | M5.4 manipulation:TankLab · M5.4 question:M05-S4-Q1 · M5.5 brick:meth… | AUCUNE, et c'est ici que cela coû… | `fa-e10` | `methode-inequation-affine` `methode-equation-affine` `methode-modeliser-affine` | M5, M6 |
| `P1` Comprendre une fonction comme une relation de… | fonctions | `fonctions-2nde` | M1 | COVERED | M1.1 manipulation:BoxLab · M1.1 brick:fonction-dependance · M1.2 mani… | BoxLab — une feuille carrée de 20… | `fo-e1` | `fonction-dependance` `vocab-variable` `mem-un-x-une-valeur` | M1 |
| `P2` Identifier la variable | fonctions | `fonctions-2nde` | M1 | COVERED | M1.3 manipulation:BoxLab · M1.3 brick:vocab-variable · M1.4 question:… | BoxLab avec showGraph : chaque bo… | `fo-e1` `fo-e8` | `vocab-variable` `fonction-dependance` `methode-modeliser` | M1 |
| `P3` Déterminer l'ensemble de définition | fonctions | `fonctions-2nde` | M2, M6 | COVERED | M1.1 manipulation:BoxLab · M1.4 question:M01-S4-Q1 · M2.3 brick:rappe… | Deux gestes portent la notion, et… | `fo-e2` `fo-e9` | `ensemble-definition` `rappel-intervalle` `reunion-intervalles` | M2, M6 |
| `P4` Calculer une image | fonctions | `fonctions-2nde` | M2, M3, M7 | COVERED | M2.1 manipulation:FunctionProbe · M2.1 brick:image-antecedent · M2.2 … | FunctionProbe en mode « x » (modu… | `fo-e3` `fo-e10` | `methode-calculer-image` `image-antecedent` `vocab-notation-fx` | M2, M3, M7 |
| `P5` Déterminer un antécédent | fonctions | `fonctions-2nde` | M2, M3, M7 | COVERED | M2.2 manipulation:FunctionProbe · M2.2 brick:methode-lire-antecedents… | FunctionProbe basculé en mode « y… | `fo-e4` `fo-e5` `fo-e6` | `methode-lire-antecedents-graphique` `regle-antecedent-equation` `image-antecedent` | M2, M3, M7 |
| `P6` Lire une fonction dans un tableau | fonctions | `fonctions-2nde` | M3 | COVERED | M3.1 manipulation:ValueTable · M3.3 brick:tableau-valeurs · M3.3 ques… | ValueTable (composant partagé) à … | `fo-e5` | `tableau-valeurs` `image-antecedent` | M3 |
| `P7` Lire une fonction sur un graphique | fonctions | `fonctions-2nde` | M2, M4, M7 | COVERED | M2.1 manipulation:FunctionProbe · M2.1 brick:methode-lire-image-graph… | PlotTable (module 4 étape 1) — l'… | `fo-e6` `fo-e7` | `methode-lire-image-graphique` `methode-lire-antecedents-graphique` `courbe-representative` | M2, M4, M7 |
| `P8` Lire une fonction à partir d'une expression | fonctions | `fonctions-2nde` | M3, M5 | COVERED | M3.1 manipulation:ValueTable · M3.1 question:M03-S1-Q1 · M3.2 brick:m… | Deux ValueTable, aux deux bouts d… | `fo-e3` `fo-e4` | `methode-calculer-image` `quatre-registres` `tableau-valeurs` | M3, M5 |
| `P9` Passer d'un registre de représentation à un a… | fonctions | `fonctions-2nde` | M4, M5, M7 | COVERED | M4.1 manipulation:PlotTable · M4.1 brick:methode-tracer-courbe · M5.1… | PlotTable est LE passage de regis… | `fo-e7` `fo-e8` | `quatre-registres` `methode-choisir-registre` `methode-tracer-courbe` | M4, M5, M7 |
| `P10` Modéliser une situation avec une fonction | fonctions | `fonctions-2nde` | M1, M5, M7 | COVERED | M1.1 manipulation:BoxLab · M5.2 brick:methode-modeliser · M5.2 questi… | Le module 1 EST la modélisation, … | `fo-e2` `fo-e8` | `methode-modeliser` `methode-verifier-modele` `vocab-variable` | M1, M5, M7 |
| `P11` Utiliser une fonction définie sur un interval… | fonctions | `fonctions-2nde` | M6, M7 | PARTIALLY_COVERED | M6.1 manipulation:FunctionProbe · M6.3 brick:methode-fonction-par-mor… | FunctionProbe sur la piscine, don… | `fo-e10` | `methode-fonction-par-morceaux` `reunion-intervalles` | M6, M7 |
| `P12` Utiliser une fonction définie sur une réunion… | fonctions | `fonctions-2nde` | M6, M7 | COVERED | M6.1 manipulation:FunctionProbe · M6.1 brick:reunion-intervalles · M6… | FunctionProbe sur la piscine. L'é… | `fo-e9` `fo-e10` | `reunion-intervalles` `vocab-union-intervalles` `methode-fonction-par-morceaux` | M6, M7 |
| `P1` Reconnaître la fonction valeur absolue | fonctions | `fonctions-de-reference-2nde` | M4 | COVERED | M1.1 manipulation:ThreeMachines · M4.1 manipulation:TwoProbes · M4.1 … | TwoProbes en mode miroir (module … | `fr-e7` | `fonction-valeur-absolue` `mem-le-v` `vocab-extremum` | M4 |
| `P2` Étudier la fonction carré | fonctions | `fonctions-de-reference-2nde` | M2 | COVERED | M1.2 manipulation:ThreeMachines · M1.2 brick:regle-symetrie-entrees ·… | Deux gestes distincts, tous deux … | `fr-e3` `fr-e4` | `fonction-carre` `regle-comparer-carres` `mem-parabole` | M2 |
| `P3` Étudier la fonction inverse | fonctions | `fonctions-de-reference-2nde` | M3 | COVERED | M1.1 manipulation:ThreeMachines · M1.3 manipulation:ThreeMachines · M… | Trois gestes en escalier. (1) Thr… | `fr-e2` `fr-e5` `fr-e6` `fr-e10` | `fonction-inverse` `regle-comparer-inverses` `mem-hyperbole` | M3 |
| `P4` Connaître leurs expressions | fonctions | `fonctions-de-reference-2nde` | M1, M6 | COVERED | M1.1 manipulation:ThreeMachines · M1.1 brick:trois-references · M1.4 … | ThreeMachines — l'interaction sig… | `fr-e1` | `trois-references` `formule-references` `regle-symetrie-entrees` | M1, M6 |
| `P5` Construire un tableau de valeurs | fonctions | `fonctions-de-reference-2nde` | M1, M6 | COVERED | M1.4 manipulation:PlotTable · M1.4 brick:methode-tableau-tracer · M6.… | PlotTable au module 1 étape 4 : l… | `fr-e2` | `methode-tableau-tracer` | M1, M6 |
| `P6` Représenter graphiquement une fonction de réf… | fonctions | `fonctions-de-reference-2nde` | M1, M5, M6 | COVERED | M1.4 manipulation:PlotTable · M1.4 brick:methode-tableau-tracer · M6.… | PlotTable au module 1 étape 4 : l… | `fr-e7` | `methode-tableau-tracer` `mem-parabole` `mem-hyperbole` | M1, M5, M6 |
| `P7` Identifier les caractéristiques d'une courbe | fonctions | `fonctions-de-reference-2nde` | M2, M3, M4 | COVERED | M2.1 manipulation:TwoProbes · M2.3 brick:fonction-carre · M2.4 questi… | Le MIROIR, décliné trois fois sur… | `fr-e3` `fr-e4` `fr-e5` | `fonction-carre` `fonction-inverse` `fonction-valeur-absolue` | M2, M3, M4 |
| `P8` Comparer les courbes de fonctions de référence | fonctions | `fonctions-de-reference-2nde` | M4, M5, M6 | COVERED | M4.2 manipulation:TwoProbes · M4.2 feedback · M4.2 brick:regle-carre-… | TwoProbes au module 4 étape 2, av… | `fr-e9` | `regle-carre-vs-va` `regle-ordre-references` | M4, M5, M6 |
| `P9` Déterminer une image graphiquement | fonctions | `fonctions-de-reference-2nde` | M5 | COVERED | M1.1 manipulation:ThreeMachines · M3.4 question:M03-S4-Q1 · M5.4 ques… | FunctionProbe en mode x (sonde VE… | `fr-e8` `fr-e9` | `methode-antecedents-reference` `regle-ordre-references` | M5 |
| `P10` Déterminer un antécédent graphiquement | fonctions | `fonctions-de-reference-2nde` | M5 | COVERED | M5.1 manipulation:FunctionProbe · M5.1 feedback · M5.2 manipulation:F… | Trois sondes HORIZONTALES success… | `fr-e8` | `methode-antecedents-reference` `fonction-valeur-absolue` | M5 |
| `P11` Utiliser une fonction de référence pour modél… | fonctions | `fonctions-de-reference-2nde` | M6 | COVERED | M6.1 question:M06-S1-Q1 · M6.1 question:M06-S1-Q2 · M6.1 brick:method… | Aucune — le module 6 est un pract… | `fr-e10` | `methode-modeliser-reference` | M6 |
| `P1` Déterminer le signe d'une fonction | fonctions | `signe-fonctions-2nde` | M1, M6 | COVERED | M1.1 manipulation:SignProbe · M1.1 feedback · M1.1 brick:signe-positi… | SignProbe — la sonde balaie la co… | `sg-e1` `sg-e3` | `signe-position-courbe` `mem-au-dessus-en-dessous` | M1, M6 |
| `P2` Interpréter le signe graphiquement | fonctions | `signe-fonctions-2nde` | M1, M2 | COVERED | M1.1 manipulation:SignProbe · M1.1 brick:signe-position-courbe · M1.2… | SignProbe sur deux fonctions (tem… | `sg-e1` `sg-e2` `sg-e10` | `signe-position-courbe` `mem-au-dessus-en-dessous` | M1, M2 |
| `P3` Déterminer les zéros d'une fonction | fonctions | `signe-fonctions-2nde` | M2, M3 | COVERED | M1.1 feedback · M1.2 manipulation:SignProbe · M1.2 brick:zero-fonctio… | SignProbe : les zéros sont les ab… | `sg-e2` `sg-e4` | `zero-fonction` `formule-zero-affine` | M2, M3 |
| `P4` Construire un tableau de signes | fonctions | `signe-fonctions-2nde` | M2, M4 | COVERED | M2.1 manipulation:SignTable · M2.1 brick:tableau-de-signes · M2.2 bri… | SignTable EN SAISIE (editable) : … | `sg-e3` `sg-e4` `sg-e7` | `tableau-de-signes` `methode-construire-tableau` `methode-lire-tableau` | M2, M4 |
| `P5` Étudier le signe d'une fonction affine | fonctions | `signe-fonctions-2nde` | M3 | COVERED | M3.1 manipulation:AffineSignLab · M3.1 brick:formule-zero-affine · M3… | AffineSignLab — a et b se règlent… | `sg-e5` | `formule-zero-affine` `regle-signe-affine` `mem-signe-de-a` | M3 |
| `P6` Étudier le signe d'un produit | fonctions | `signe-fonctions-2nde` | M4, M6 | COVERED | M4.1 manipulation:SignTable · M4.1 brick:regle-signe-produit · M4.1 q… | SignTable à deux lignes de facteu… | `sg-e6` | `regle-signe-produit` `methode-tableau-produit-quotient` | M4, M6 |
| `P7` Étudier le signe d'un quotient | fonctions | `signe-fonctions-2nde` | M4, M6 | COVERED | M4.2 manipulation:SignTable · M4.2 brick:regle-signe-quotient · M4.2 … | Même tableau en saisie, avec la d… | `sg-e7` | `regle-signe-quotient` `methode-tableau-produit-quotient` | M4, M6 |
| `P8` Utiliser un tableau de signes pour résoudre u… | fonctions | `signe-fonctions-2nde` | M5, M6 | COVERED | M5.1 manipulation:SignTable · M5.1 brick:methode-resoudre-par-le-sign… | Le tableau construit en M4 sert d… | `sg-e8` `sg-e9` | `methode-resoudre-par-le-signe` `vocab-solutions-intervalles` | M5, M6 |
| `P9` Résoudre f(x)=0 | fonctions | `signe-fonctions-2nde` | M3, M5 | COVERED | M3.1 brick:formule-zero-affine · M5.1 manipulation:SignTable · M5.1 q… | Les zéros sont les bornes du tabl… | `sg-e5` `sg-e9` | `formule-zero-affine` `methode-resoudre-par-le-signe` | M3, M5 |
| `P10` Résoudre f(x)>0 | fonctions | `signe-fonctions-2nde` | M5, M6 | COVERED | M5.2 manipulation:SignTable · M5.2 brick:vocab-solutions-intervalles … | Lecture des zones + du tableau ; … | `sg-e8` | `methode-resoudre-par-le-signe` `vocab-solutions-intervalles` | M5, M6 |
| `P11` Résoudre f(x)<0 | fonctions | `signe-fonctions-2nde` | M5, M6 | COVERED | M5.3 manipulation:SignTable · M5.3 question:M05-S3-Q1 · M6.2 manipula… | Même instrument, sens inverse ; l… | `sg-e9` `sg-e10` | `methode-resoudre-par-le-signe` `vocab-solutions-intervalles` | M5, M6 |
| `P12` Vérifier graphiquement une résolution | fonctions | `signe-fonctions-2nde` | M5, M6 | COVERED | M5.4 manipulation:SignProbe · M5.4 brick:methode-verifier-graphiqueme… | Retour à la sonde après le calcul… | `sg-e10` | `methode-verifier-graphiquement` | M5, M6 |
| `P1` Comprendre la croissance d'une fonction | fonctions | `variations-extremums-2nde` | M1, M2 | COVERED | M1.1 manipulation:TrailLab · M1.1 feedback · M1.1 brick:variations-se… | TrailLab — l'interaction signatur… | `va-e1` | `variations-sens` `definition-croissante-decroissante` `mem-croissante-ordre` | M1, M2 |
| `P2` Comprendre la décroissance d'une fonction | fonctions | `variations-extremums-2nde` | M1, M2 | COVERED | M1.2 manipulation:TrailLab · M1.4 question:M01-S4-Q1 · M2.2 manipulat… | Le même dispositif, du côté de la… | `va-e2` | `definition-croissante-decroissante` `variations-sens` `mem-croissante-ordre` | M1, M2 |
| `P3` Comprendre la monotonie | fonctions | `variations-extremums-2nde` | M2, M5 | COVERED | M2.3 manipulation:TwoProbes · M2.3 feedback · M2.3 brick:vocab-monoto… | LA CHASSE AU CONTRE-EXEMPLE DOUBL… | `va-e3` | `vocab-monotone-intervalle` `mem-croissante-ordre` `definition-croissante-decroissante` | M2, M5 |
| `P4` Lire les variations sur un graphique | fonctions | `variations-extremums-2nde` | M1, M6 | COVERED | M1.1 manipulation:TrailLab · M1.2 manipulation:TrailLab · M1.2 feedba… | TrailLab sur le sentier entier : … | `va-e4` | `methode-lire-variations-courbe` `variations-sens` `regle-plus-bas-au-bord` | M1, M6 |
| `P5` Construire un tableau de variations | fonctions | `variations-extremums-2nde` | M3, M6 | COVERED | M3.1 manipulation:VariationTable · M3.1 feedback · M3.1 brick:tableau… | OUI, l'élève CONSTRUIT le tableau… | `va-e5` `va-e6` | `tableau-de-variations` `methode-construire-tableau-variations` | M3, M6 |
| `P6` Lire un tableau de variations | fonctions | `variations-extremums-2nde` | M3, M5 | COVERED | M3.2 brick:methode-lire-tableau-variations · M3.2 question:M03-S2-Q1 … | Aucune manipulation propre, et c'… | `va-e5` `va-e9` | `methode-lire-tableau-variations` `tableau-de-variations` | M3, M5 |
| `P7` Déterminer un maximum | fonctions | `variations-extremums-2nde` | M4, M6 | COVERED | M4.1 manipulation:IntervalLab · M4.1 feedback · M4.1 brick:maximum-mi… | IntervalLab — deux bornes a et b … | `va-e7` `va-e10` | `maximum-minimum` `mem-valeur-et-endroit` `methode-extremum-tableau` | M4, M6 |
| `P8` Déterminer un minimum | fonctions | `variations-extremums-2nde` | M4, M6 | COVERED | M1.2 brick:regle-plus-bas-au-bord · M1.3 question:M01-S3-Q1 · M4.1 ma… | Le geste porteur est celui du mod… | `va-e8` | `regle-plus-bas-au-bord` `maximum-minimum` `mem-valeur-et-endroit` | M4, M6 |
| `P9` Déterminer un extremum sur un intervalle | fonctions | `variations-extremums-2nde` | M4 | COVERED | M4.1 manipulation:IntervalLab · M4.1 feedback · M4.1 brick:maximum-mi… | IntervalLab est TOUT ENTIER ce LP… | `va-e9` | `maximum-minimum` `methode-extremum-tableau` `mem-valeur-et-endroit` | M4 |
| `P10` Relier graphique et tableau de variations | fonctions | `variations-extremums-2nde` | M3, M6 | COVERED | M3.1 manipulation:VariationTable · M3.1 manipulation:TrailLab · M3.1 … | Les DEUX SENS du lien sont travai… | `va-e4` `va-e6` | `tableau-de-variations` `methode-construire-tableau-variations` `methode-lire-tableau-variations` | M3, M6 |
| `P11` Comparer f(a) et f(b) | fonctions | `variations-extremums-2nde` | M2, M5 | COVERED | M2.1 manipulation:TwoProbes · M2.2 manipulation:TwoProbes · M2.3 mani… | TwoProbes affiche en permanence, … | `va-e1` `va-e2` | `methode-comparer-images-tableau` `methode-encadrer-images` `definition-croissante-decroissante` | M2, M5 |
| `P12` Résoudre un problème d'optimisation | fonctions | `variations-extremums-2nde` | M6 | COVERED | M6.1 brick:methode-optimiser · M6.1 question:M06-S1-Q1 · M6.2 questio… | Aucune — le module 6 est un pract… | `va-e10` | `methode-optimiser` `maximum-minimum` `methode-extremum-tableau` | M6 |
| `P1` Comprendre la colinéarité | geometrie | `colinearite-alignement-2nde` | M1, M2 | COVERED | M1.1 manipulation:VectorPlane · M1.2 feedback · M1.4 brick:colin-dire… | VectorPlane — v est glissable, un… | `col-e1` | `colin-direction` `colin-vocabulaire-direction-sens` `colin-vecteur-nul` | M1, M2 |
| `P2` Reconnaître deux vecteurs colinéaires | geometrie | `colinearite-alignement-2nde` | M1, M3 | COVERED | M1.4 question:M01-S4 · M3.1 manipulation:Stepper · M3.1 brick:colin-m… | M3 étape 1 : un curseur k de −3 à… | `col-e2` | `colin-multiple` `colin-produits-croix` `mem-colin-multiple` | M1, M3 |
| `P3` Utiliser la proportionnalité des coordonnées | geometrie | `colinearite-alignement-2nde` | M3 | COVERED | M3.1 manipulation:Stepper · M3.1 feedback · M3.2 brick:colin-produits… | Curseur k + ProportionTable : l'é… | `col-e3` `col-e10` | `colin-produits-croix` `colin-coordonnee-manquante-prop` `mem-colin-multiple` | M3 |
| `P4` Calculer un déterminant | geometrie | `colinearite-alignement-2nde` | M4 | COVERED | M4.1 manipulation:VectorPlane · M4.1 feedback · M4.1 brick:colin-dete… | VectorPlane avec u ET v glissable… | `col-e4` `col-e5` | `colin-determinant` `colin-calculer-det` `colin-formule-det` | M4 |
| `P5` Utiliser le déterminant pour tester la coliné… | geometrie | `colinearite-alignement-2nde` | M4 | COVERED | M4.1 manipulation:VectorPlane · M4.1 brick:colin-critere-det · M4.2 f… | La même que P4 ; l'étape 2 fait v… | `col-e5` | `colin-critere-det` `mem-colin-det-zero` | M4 |
| `P6` Déterminer si trois points sont alignés | geometrie | `colinearite-alignement-2nde` | M2, M5 | COVERED | M2.1 manipulation:VectorPlane · M2.1 feedback · M2.1 brick:colin-alig… | VectorPlane M2 — A et B fixes, C … | `col-e6` `col-e7` | `colin-alignement` `colin-vocabulaire-aligne` `colin-oeil-hesite` | M2, M5 |
| `P7` Déterminer si deux droites sont parallèles | geometrie | `colinearite-alignement-2nde` | M5 | COVERED | M5.1 manipulation:VectorPlane · M5.1 feedback · M5.1 brick:colin-para… | VectorPlane M5 étape 1 — D glissa… | `col-e8` `col-e9` | `colin-parallelisme-det` `colin-vocabulaire-parallele` | M5 |
| `P8` Résoudre un problème d'alignement | geometrie | `colinearite-alignement-2nde` | M5 | COVERED | M5.2 question:M05-S2 · M5.3 question:M05-S3 · M5.4 question:M05-S4 · … | Aucune manipulation propre : M5 é… | `col-e7` `col-e10` | `colin-methode-conclure` `colin-coordonnee-manquante-det` `mem-colin-deux-usages` | M5 |
| `P9` Résoudre un problème de parallélisme | geometrie | `colinearite-alignement-2nde` | M5 | COVERED | M5.6 question:M05-S6-Q1 · M5.6 question:M05-S6-Q2 · M5.1 manipulation… | Aucun instrument propre, mais un … | `col-e9` | `colin-parallelisme-det` `colin-methode-conclure` | M5 |
| `P1` Comprendre un vecteur directeur | geometrie | `equations-de-droites-2nde` | M1, M2 | COVERED | M1.1 manipulation:LineLab · M1.1 feedback · M1.1 brick:droite-vecteur… | LineLab — l'élève double la flèch… | `eq-e1` | `droite-vecteur-directeur` `droite-vocabulaire-directeur` `droite-point-direction` | M1, M2 |
| `P2` Identifier un vecteur directeur d'une droite | geometrie | `equations-de-droites-2nde` | M1, M6 | COVERED | M1.1 brick:droite-vecteur-directeur · M6.2 brick:droite-lire-cartesie… | Aucune manipulation propre pour l… | `eq-e2` | `droite-lire-cartesienne` `droite-equation-cartesienne` | M1, M6 |
| `P3` Comprendre la pente d'une droite | geometrie | `equations-de-droites-2nde` | M2, M4 | COVERED | M2.1 manipulation:LineWalker · M2.1 feedback · M2.1 brick:droite-pent… | LineWalker — l'élève marche sur l… | `eq-e3` | `droite-points-parametres` `droite-pente` `droite-pente-vers-directeur` | M2, M4 |
| `P4` Calculer la pente d'une droite | geometrie | `equations-de-droites-2nde` | M2, M7 | COVERED | M2.3 brick:droite-calculer-pente · M2.3 question:M02-S3 · M7.1 questi… | L'escalier de LineWalker (M2 étap… | `eq-e3` | `droite-calculer-pente` `droite-pente` | M2, M7 |
| `P5` Déterminer une équation de droite à partir de… | geometrie | `equations-de-droites-2nde` | M6, M7 | COVERED | M6.3 brick:droite-methode-deux-points · M6.3 question:M06-S3 · M7.1 q… | Aucune. La méthode « deux points … | `eq-e4` | `droite-methode-deux-points` `droite-equation-reduite` `droite-calculer-pente` | M6, M7 |
| `P6` Déterminer une équation de droite à partir d'… | geometrie | `equations-de-droites-2nde` | M3, M6, M7 | COVERED | M3.4 brick:droite-methode-point-vecteur · M3.4 question:M03-S4 · M7.2… | DetTester (M3 étape 1) sert de so… | `eq-e5` | `droite-methode-point-vecteur` `droite-equation-cartesienne` | M3, M6, M7 |
| `P7` Déterminer une équation de droite à partir d'… | geometrie | `equations-de-droites-2nde` | M6, M7 | COVERED | M6.3 brick:droite-methode-point-pente · M6.3 question:M06-S3 · M7.3 q… | Aucune | `eq-e6` | `droite-methode-point-pente` | M6, M7 |
| `P8` Comprendre l'équation réduite | geometrie | `equations-de-droites-2nde` | M3, M4, M6 | COVERED | M3.3 brick:droite-equation-reduite · M3.3 question:M03-S3 · M4.1 mani… | CoefficientLab — deux boutons iso… | `eq-e7` `eq-e8` | `droite-equation-reduite` `droite-role-m-p` `droite-ordonnee-origine` | M3, M4, M6 |
| `P9` Comprendre l'équation cartésienne | geometrie | `equations-de-droites-2nde` | M3, M4, M6 | COVERED | M3.1 manipulation:DetTester · M3.1 feedback · M3.1 brick:droite-equat… | DetTester — l'élève déplace M et … | `eq-e2` `eq-e8` | `droite-equation-idee` `droite-equation-cartesienne` `droite-verticale` | M3, M4, M6 |
| `P10` Tracer une droite à partir de son équation | geometrie | `equations-de-droites-2nde` | M4, M7 | COVERED | M4.4 brick:droite-tracer · M4.4 manipulation:LineBuilder · M4.4 quest… | LineBuilder — aucune cible n'est … | `eq-e9` `eq-e11` | `droite-tracer` | M4, M7 |
| `P11` Déterminer si un point appartient à une droite | geometrie | `equations-de-droites-2nde` | M5, M7 | COVERED | M5.1 manipulation:MembershipLab · M5.1 feedback · M5.1 brick:droite-a… | MembershipLab — cinq points suspe… | `eq-e10` | `droite-appartenance` `droite-methode-tester-point` `mem-droite-appartenance` | M5, M7 |
| `P12` Établir l'alignement de trois points | geometrie | `equations-de-droites-2nde` | M5, M7 | COVERED | M5.3 brick:droite-alignement-equation · M5.3 question:M05-S3 | Aucune : figure statique (LineSce… | `eq-e10` | `droite-alignement-equation` `droite-methode-tester-point` `mem-droite-appartenance` | M5, M7 |
| `P1` Reconnaître deux droites parallèles | geometrie | `positions-relatives-droites-2nde` | M1, M2, M3 | COVERED | M1.1 manipulation:TwoLinesPlane · M1.1 feedback · M1.1 brick:vocab-se… | TwoLinesPlane — l'élève tire la p… | `pr-e2` `pr-e3` `pr-e5` `pr-e10` | `positions-trois-cas` `vocab-secantes-paralleles-confondues` `regle-direction-position` | M1, M2, M3 |
| `P2` Reconnaître deux droites sécantes | geometrie | `positions-relatives-droites-2nde` | M1, M2, M3 | COVERED | M1.3 manipulation:TwoLinesPlane · M1.3 brick:positions-trois-cas · M1… | M1 étape 3 « le tour complet » — … | `pr-e1` `pr-e2` `pr-e4` | `positions-trois-cas` `mem-trois-comptes` `critere-pentes` | M1, M2, M3 |
| `P3` Comparer les pentes de deux droites | geometrie | `positions-relatives-droites-2nde` | M2 | COVERED | M2.1 manipulation:DirectionLab · M2.1 feedback · M2.2 manipulation:Di… | DirectionLab — les lectures m₁ et… | `pr-e3` `pr-e4` `pr-e10` | `critere-pentes` `critere-vecteurs-directeurs` `methode-comparer-directions` | M2 |
| `P4` Utiliser les équations pour étudier le parall… | geometrie | `positions-relatives-droites-2nde` | M3, M5 | COVERED | M3.1 manipulation:ReducedLab · M3.1 feedback · M3.1 brick:critere-equ… | ReducedLab avec verrouillage alte… | `pr-e5` `pr-e6` `pr-e9` | `critere-equations-reduites` `critere-equations-cartesiennes` `methode-ramener-meme-ecriture` | M3, M5 |
| `P5` Déterminer le point d'intersection de deux dr… | geometrie | `positions-relatives-droites-2nde` | M4, M5 | COVERED | M4.2 brick:point-intersection-systeme · M4.2 brick:methode-resoudre-s… | M4 étape 1 (ReducedLab avec zoom … | `pr-e7` | `point-intersection-systeme` `methode-resoudre-systeme` `formule-abscisse-intersection` | M4, M5 |
| `P6` Résoudre un système associé à deux droites | geometrie | `positions-relatives-droites-2nde` | M4, M5 | PARTIALLY_COVERED | M4.2 brick:methode-resoudre-systeme · M4.2 question:M04-S2a · M4.3 br… | Aucune : le système est un objet … | `pr-e7` `pr-e8` | `point-intersection-systeme` `methode-resoudre-systeme` `regle-nombre-solutions` | M4, M5 |
| `P7` Interpréter graphiquement une intersection | geometrie | `positions-relatives-droites-2nde` | M4, M5 | COVERED | M4.1 manipulation:ReducedLab · M4.1 feedback · M4.1 brick:methode-int… | ReducedLab avec chips de zoom (±6… | `pr-e1` `pr-e8` | `methode-interpretation-graphique` `regle-nombre-solutions` `mem-intersection-systeme` | M4, M5 |
| `P8` Résoudre un problème géométrique avec deux dr… | geometrie | `positions-relatives-droites-2nde` | M5 | COVERED | M5.1 brick:methode-trajectoires · M5.1 question:M05-S1a · M5.2 brick:… | Aucune : le module 5 n'a aucune m… | `pr-e9` `pr-e10` | `methode-trajectoires` `methode-parallele-par-un-point` `methode-ab-cd` | M5 |
| `P1` Comprendre le cercle trigonométrique | geometrie | `trigonometrie-cercle-2nde` | M1 | COVERED | M1.1 manipulation:CircleLab · M1.1 brick:cercle-trigonometrique · M1.… | CircleLab | `tc-e1` `tc-e2` | `cercle-trigonometrique` `enroulement` `mem-rayon-un` | M1 |
| `P2` Comprendre le radian comme mesure d'un angle … | geometrie | `trigonometrie-cercle-2nde` | M2 | COVERED | M2.1 manipulation:CircleLab · M2.1 brick:radian · M2.1 brick:mem-pi-1… | CircleLab | `tc-e3` | `radian` `formule-conversion` `mem-pi-180` | M2 |
| `P3` Convertir entre degrés et radians | geometrie | `trigonometrie-cercle-2nde` | M2 | COVERED | M2.1 manipulation:CircleLab · M2.1 brick:formule-conversion · M2.1 as… | CircleLab | `tc-e4` | `radian` `formule-conversion` `mem-pi-180` | M2 |
| `P4` Associer un réel t à un point du cercle trigo… | geometrie | `trigonometrie-cercle-2nde` | M3 | COVERED | M3.1 manipulation:CircleLab · M3.1 brick:enroulement · M3.1 assessmen… | CircleLab | `tc-e5` | `cos-sin-coordonnees` `regle-signes-quadrants` `regle-borne-un` | M3 |
| `P5` Déterminer les coordonnées d'un point du cerc… | geometrie | `trigonometrie-cercle-2nde` | M3 | COVERED | M3.1 manipulation:CircleLab · M3.1 brick:cos-sin-coordonnees · M3.1 b… | CircleLab | `tc-e6` `tc-e8` | `cos-sin-coordonnees` `regle-signes-quadrants` `regle-borne-un` | M3 |
| `P6` Reconnaître le cosinus comme abscisse et le s… | geometrie | `trigonometrie-cercle-2nde` | M3 | COVERED | M3.1 manipulation:CircleLab · M3.1 brick:mem-cos-abscisse · M3.1 bric… | CircleLab | `tc-e6` `tc-e7` | `cos-sin-coordonnees` `regle-signes-quadrants` `regle-borne-un` | M3 |
| `P7` Connaître les valeurs remarquables du cosinus | geometrie | `trigonometrie-cercle-2nde` | M4 | COVERED | M4.1 manipulation:CircleLab · M4.1 brick:valeurs-remarquables · M4.1 … | CircleLab | `tc-e9` | `valeurs-remarquables` `regle-pi-quatre-egalite` `methode-placer-remarquable` | M4 |
| `P8` Connaître les valeurs remarquables du sinus | geometrie | `trigonometrie-cercle-2nde` | M4 | COVERED | M4.1 manipulation:CircleLab · M4.1 brick:valeurs-remarquables · M4.1 … | CircleLab | `tc-e10` | `valeurs-remarquables` `regle-pi-quatre-egalite` `methode-placer-remarquable` | M4 |
| `P9` Utiliser les valeurs remarquables pour placer… | geometrie | `trigonometrie-cercle-2nde` | M4 | COVERED | M4.1 manipulation:CircleLab · M4.1 brick:methode-placer-remarquable ·… | CircleLab | `tc-e11` | `valeurs-remarquables` `regle-pi-quatre-egalite` `methode-placer-remarquable` | M4 |
| `P1` Utiliser la relation cos²t + sin²t = 1 | geometrie | `trigonometrie-equations-2nde` | M1 | COVERED | M1.1 manipulation:CircleLab · M1.1 assessment:te-e1 · M1.1 assessment… | CircleLab | `te-e1` `te-e2` `te-e3` | `identite-fondamentale` `methode-retrouver-coordonnee` `mem-pythagore-deguise` | M1 |
| `P2` Utiliser les formules d'addition du cosinus e… | geometrie | `trigonometrie-equations-2nde` | M2 | COVERED | M2.1 manipulation:CircleLab · M2.1 assessment:te-e4 · M2.1 assessment… | CircleLab | `te-e4` `te-e5` `te-e6` | `formules-addition` `regle-cos-non-lineaire` `mem-signe-moins` | M2 |
| `P3` Résoudre une équation cos t = a sur un interv… | geometrie | `trigonometrie-equations-2nde` | M3 | COVERED | M3.1 manipulation:CircleLab · M3.1 assessment:te-e7 · M3.1 assessment… | CircleLab | `te-e7` `te-e8` | `equation-deux-solutions` `methode-resoudre-cos` `regle-hors-bornes` | M3 |
| `P4` Résoudre une équation sin t = b sur un interv… | geometrie | `trigonometrie-equations-2nde` | M4 | COVERED | M4.1 manipulation:CircleLab · M4.1 assessment:te-e9 · M4.1 assessment… | CircleLab | `te-e9` `te-e10` | `methode-resoudre-sin` `regle-deux-symetries` `mem-lire-sur-le-cercle` | M4 |
| `P1` Comprendre l'égalité de deux vecteurs | geometrie | `vecteurs-2nde` | M2 | COVERED | M2.1 manipulation:VectorLab · M2.1 feedback · M2.1 brick:egalite-vect… | VectorLab en mode 'move' — seule … | `vec-e1` `vec-e10` | `egalite-vecteurs` `vocab-representant` `regle-egalite-coordonnees` | M2 |
| `P2` Identifier le vecteur nul | geometrie | `vecteurs-2nde` | M2, M4 | COVERED | M2.2 manipulation:VectorLab · M2.2 feedback · M2.2 brick:vecteur-nul … | VectorLab 'build' : l'élève rédui… | `vec-e2` | `vecteur-nul` | M2, M4 |
| `P3` Construire un représentant d'un vecteur | geometrie | `vecteurs-2nde` | M1, M2, M7 | COVERED | M1.2 manipulation:DisplacementLab · M1.5 brick:vecteur-deplacement · … | DisplacementLab M1 étape 2 — le s… | `vec-e3` | `vecteur-deplacement` `mem-deplacement` `vocab-representant` | M1, M2, M7 |
| `P4` Additionner deux vecteurs | geometrie | `vecteurs-2nde` | M4 | COVERED | M4.1 manipulation:SumLab · M4.1 feedback · M4.1 brick:regle-somme · M… | SumLab — l'élève règle v et le po… | `vec-e2` `vec-e4` | `regle-somme` `formule-somme` `vocab-relation-chasles` | M4 |
| `P5` Multiplier un vecteur par un réel | geometrie | `vecteurs-2nde` | M5 | COVERED | M5.1 manipulation:ScaleLab · M5.1 feedback · M5.1 brick:regle-produit… | ScaleLab — l'élève doit VISITER k… | `vec-e5` | `regle-produit-reel` | M5 |
| `P6` Reconnaître deux vecteurs colinéaires | geometrie | `vecteurs-2nde` | M5, M7 | COVERED | M5.3 manipulation:VectorLab · M5.3 feedback · M5.3 brick:regle-coline… | VectorLab étape 3 — l'élève règle… | `vec-e6` | `regle-colineaire` | M5, M7 |
| `P7` Utiliser une base orthonormée | geometrie | `vecteurs-2nde` | M3, M6 | PARTIALLY_COVERED | M3.1 manipulation:VectorLab · M3.1 feedback · M3.1 brick:vocab-base-o… | VectorLab 'build' avec `escalier`… | `vec-e7` | `vocab-base-orthonormee` | M3, M6 |
| `P8` Lire les coordonnées d'un vecteur | geometrie | `vecteurs-2nde` | M3 | COVERED | M3.1 manipulation:VectorLab · M3.1 feedback · M3.1 brick:coordonnees-… | VectorLab avec escalier — les deu… | `vec-e7` | `coordonnees-vecteur` | M3 |
| `P9` Calculer les coordonnées d'un vecteur | geometrie | `vecteurs-2nde` | M4, M5 | COVERED | M4.1 manipulation:SumLab · M4.4 question:M04-S4-Q2 · M5.2 question:M0… | SumLab (tableau des coordonnées o… | `vec-e4` `vec-e5` | `regle-somme` `formule-somme` `regle-produit-reel` | M4, M5 |
| `P10` Calculer la norme d'un vecteur | geometrie | `vecteurs-2nde` | M6 | COVERED | M6.1 manipulation:VectorLab · M6.1 feedback · M6.1 brick:methode-calc… | VectorLab + `escalier` + NormRead… | `vec-e8` | `methode-calcul-norme` `vocab-norme` `formule-norme` | M6 |
| `P11` Calculer les coordonnées du vecteur AB | geometrie | `vecteurs-2nde` | M3, M7 | COVERED | M3.2 manipulation:VectorLab · M3.2 feedback · M3.2 brick:regle-coordo… | VectorLab mode 'points' — l'élève… | `vec-e8` | `regle-coordonnees` `mem-arrivee-moins-depart` `methode-calcul-coordonnees` | M3, M7 |
| `P12` Calculer une distance entre deux points | geometrie | `vecteurs-2nde` | M6 | PARTIALLY_COVERED | M6.2 question:M06-S2-Q1 · M6.1 brick:methode-calcul-norme · M6.1 bric… | Aucune manipulation propre : la d… | `vec-e9` | `formule-norme` `vocab-norme` | M6 |
| `P13` Calculer les coordonnées du milieu d'un segme… | geometrie | `vecteurs-2nde` | M6, M7 | COVERED | M6.3 manipulation:MidpointLab · M6.3 feedback · M6.3 brick:methode-mi… | MidpointLab — l'élève déplace I (… | `vec-e9` | `methode-milieu` `formule-milieu` | M6, M7 |
| `P14` Utiliser les vecteurs pour résoudre un problè… | geometrie | `vecteurs-2nde` | M7 | COVERED | M7.1 manipulation:VectorScene · M7.1 feedback · M7.1 brick:methode-pa… | VectorScene avec D draggable + st… | `vec-e10` | `methode-parallelogramme` `methode-deplacement-manquant` `methode-alignement` | M7 |
| `P1` Reconnaître et utiliser les multiples et divi… | nombres_calculs | `arithmetique-2nde` | M1, M4 | COVERED | M1.1 manipulation:PackLab · M1.1 brick:regle-reste-decide · M1.3 bric… | PackLab — deux tas de jetons (a, … | `ar-e1` `ar-e2` | `division-euclidienne` `multiple-diviseur` `regle-reste-decide` | M1, M4 |
| `P2` Utiliser les propriétés de divisibilité. | nombres_calculs | `arithmetique-2nde` | M3 | COVERED | M3.1 manipulation:DigitSplit · M3.1 question:M03-S1-Q1 · M3.1 brick:c… | DigitSplit — choisir un nombre (4… | `ar-e3` `ar-e4` | `criteres-divisibilite` `critere-est-decoupage` | M3 |
| `P3` Raisonner sur les nombres entiers. | nombres_calculs | `arithmetique-2nde` | M1, M2, M5 | COVERED | M1.2 manipulation:PackLab · M1.2 question:M01-S2-Q1 · M2.1 question:M… | PackLab réglé sur p = 2 avec deux… | `ar-e5` `ar-e6` `ar-e10` | `ecriture-litterale-parite` `lettre-couvre-tout` `regle-parite-operations` | M1, M2, M5 |
| `P4` Résoudre des problèmes faisant intervenir mul… | nombres_calculs | `arithmetique-2nde` | M4, M5 | PARTIALLY_COVERED | M4.1 manipulation:RhythmLine · M4.1 brick:ppcm · M4.1 question:M04-S1… | RhythmLine — deux rythmes de bus … | `ar-e7` `ar-e8` | `ppcm` `pgcd` `methode-reconnaitre-ppcm-pgcd` | M4, M5 |
| `P5` Utiliser les propriétés arithmétiques pour co… | nombres_calculs | `arithmetique-2nde` | M2, M3, M5 | COVERED | M2.2 question:M02-S2-Q1 · M2.2 brick:methode-preuve-parite · M3.1 bri… | ProofOrder — reconstituer la preu… | `ar-e4` `ar-e9` `ar-e10` | `methode-preuve-parite` `methode-demonstration-arithmetique` `regle-exemples-pas-preuve` | M2, M3, M5 |
| `P1` Identifier et manipuler une expression littér… | nombres_calculs | `calcul-litteral-2nde` | M1, M2 | COVERED | M1.1 manipulation:MagicTrick · M1.1 feedback · M1.1 brick:regle-teste… | MagicTrick — l'élève entre ses pr… | `cl2-e1` `cl2-e2` | `expression-litterale` `egalite-pour-tout-x` `regle-tester-ne-prouve-pas` | M1, M2 |
| `P2` Réduire une expression. | nombres_calculs | `calcul-litteral-2nde` | M2, M6 | COVERED | M2.1 manipulation:TermMerger · M2.1 feedback · M2.1 brick:vocab-terme… | TermMerger — l'élève touche deux … | `cl2-e3` | `vocab-terme-coefficient` `methode-reduire` `regle-exposants-pas-additionnes` | M2, M6 |
| `P3` Développer une expression. | nombres_calculs | `calcul-litteral-2nde` | M3, M5 | COVERED | M3.1 manipulation:IdentityGrid · M3.1 brick:developper · M3.1 questio… | IdentityGrid — un carré SVG de cô… | `cl2-e4` `cl2-e5` | `developper` `identites-remarquables` `mem-carre-somme` | M3, M5 |
| `P4` Factoriser une expression. | nombres_calculs | `calcul-litteral-2nde` | M4, M5 | PARTIALLY_COVERED | M4.1 manipulation:FactorFinder · M4.1 brick:factoriser · M4.2 manipul… | FactorFinder — quatre tâches, qua… | `cl2-e6` `cl2-e7` `cl2-e10` | `factoriser` `methode-facteur-commun` `methode-identite-inverse` | M4, M5 |
| `P5` Choisir une forme développée ou factorisée se… | nombres_calculs | `calcul-litteral-2nde` | M5, M6 | PARTIALLY_COVERED | M5.1 question:M05-S1-Q1 · M5.2 question:M05-S2-Q2 · M5.3 question:M05… | AUCUNE. Le module 5 n'a pas de co… | `cl2-e8` | `regle-choisir-la-forme` `regle-carre-positif` `methode-prouver-egalite-formes` | M5, M6 |
| `P6` Utiliser le calcul littéral pour démontrer ou… | nombres_calculs | `calcul-litteral-2nde` | M1, M6 | COVERED | M1.1 manipulation:MagicTrick · M1.1 brick:regle-tester-ne-prouve-pas … | ProofOrder — les cinq lignes de l… | `cl2-e9` `cl2-e10` | `methode-demontrer-litteral` `methode-modeliser-aire` `regle-simplifier-facteurs` | M1, M6 |
| `P7` Utiliser les identités remarquables (a+b)², (… | nombres_calculs | `calcul-litteral-2nde` | M3 | COVERED | M3.1 brick:identites-remarquables · M3.1 brick:mem-carre-somme · M3.1… | IdentityGrid | `cl2-e11` | `developper` `identites-remarquables` `mem-carre-somme` | M3 |
| `P8` Factoriser une expression de la forme ax² + b… | nombres_calculs | `calcul-litteral-2nde` | M4 | COVERED | M4.1 brick:factoriser · M4.1 brick:methode-facteur-commun · M4.1 asse… | FactorFinder | `cl2-e12` | `factoriser` `methode-facteur-commun` `methode-identite-inverse` | M4 |
| `P9` Effectuer des calculs avec des expressions fr… | nombres_calculs | `calcul-litteral-2nde` | M6 | COVERED | M6.1 brick:regle-simplifier-facteurs · M6.1 assessment:cl2-e13 | ProofOrder | `cl2-e13` | `methode-demontrer-litteral` `methode-modeliser-aire` `regle-simplifier-facteurs` | M6 |
| `P10` Vérifier une identité algébrique. | nombres_calculs | `calcul-litteral-2nde` | M6 | COVERED | M6.1 brick:methode-demontrer-litteral · M6.1 assessment:cl2-e14 | ProofOrder | `cl2-e14` | `methode-demontrer-litteral` `methode-modeliser-aire` `regle-simplifier-facteurs` | M6 |
| `P1` Utiliser le langage des ensembles. | nombres_calculs | `ensembles-et-intervalles-2nde` | M2, M5 | PARTIALLY_COVERED | M2.1 manipulation:SetBoxes · M2.1 brick:ensemble · M2.1 brick:vocab-a… | SetBoxes — trois boîtes emboîtées… | `ei-e1` `ei-e2` | `ensemble` `vocab-appartenance` `vocab-inclusion` | M2, M5 |
| `P2` Lire et représenter des intervalles. | nombres_calculs | `ensembles-et-intervalles-2nde` | M1, M3 | COVERED | M1.1 manipulation:IntervalFilter · M1.1 feedback · M1.1 brick:borne-i… | IntervalFilter — le panneau du ma… | `ei-e3` `ei-e4` | `borne-incluse-exclue` `plage-infinite` `mem-borne` | M1, M3 |
| `P3` Décrire un ensemble de nombres à l’aide d’un … | nombres_calculs | `ensembles-et-intervalles-2nde` | M4, M6 | COVERED | M4.1 manipulation:IntervalBuilder · M4.1 brick:regle-signe-crochet · … | IntervalBuilder dans les deux sen… | `ei-e5` `ei-e6` `ei-e9` | `regle-signe-crochet` `regle-sens-inegalite` `methode-traduire` | M4, M6 |
| `P4` Interpréter les bornes et les différents type… | nombres_calculs | `ensembles-et-intervalles-2nde` | M1, M3, M4, M5 | COVERED | M1.1 manipulation:IntervalFilter · M1.1 brick:borne-incluse-exclue · … | IntervalBuilder avec allowInfinit… | `ei-e3` `ei-e4` `ei-e7` `ei-e8` | `borne-incluse-exclue` `plage-infinite` `types-intervalles` | M1, M3, M4, M5 |
| `P5` Utiliser les intervalles pour résoudre des si… | nombres_calculs | `ensembles-et-intervalles-2nde` | M5, M6 | COVERED | M5.2 manipulation:IntervalBuilder · M5.2 brick:intersection-intervall… | IntervalBuilder par-dessus deux b… | `ei-e7` `ei-e8` `ei-e9` `ei-e10` | `intersection-intervalles` `reunion-intervalles` `mem-inter-union` | M5, M6 |
| `P6` Comprendre l’appartenance à un ensemble et ut… | nombres_calculs | `ensembles-et-intervalles-2nde` | M2 | COVERED | M2.1 brick:vocab-appartenance · M2.1 brick:ensemble-vide · M2.1 manip… | SetBoxes, VennSorter | `ei-e11` | `ensemble` `vocab-appartenance` `vocab-inclusion` | M2 |
| `P7` Déterminer une réunion et une intersection d’… | nombres_calculs | `ensembles-et-intervalles-2nde` | M2 | COVERED | M2.1 brick:vocab-intersection-reunion · M2.1 manipulation:VennSorter … | SetBoxes, VennSorter | `ei-e12` | `ensemble` `vocab-appartenance` `vocab-inclusion` | M2 |
| `P1` Comprendre une équation comme une égalité à r… | nombres_calculs | `equations-et-inequations-2nde` | M1 | COVERED | M1.1 manipulation:SolutionScanner · M1.1 feedback · M1.1 brick:equati… | SolutionScanner — deux forfaits A… | `eq-e1` `eq-e2` | `equation-solution` `inequation-infinite` `regle-nombre-de-solutions` | M1 |
| `P2` Résoudre une équation du premier degré. | nombres_calculs | `equations-et-inequations-2nde` | M2, M5, M6 | COVERED | M2.1 manipulation:EquationSteps · M2.1 feedback · M2.1 brick:regle-de… | EquationSteps — l'élève choisit d… | `eq-e3` `eq-e4` | `regle-deux-membres` `methode-premier-degre` `regle-solution-exacte` | M2, M5, M6 |
| `P3` Comprendre et résoudre une inéquation du prem… | nombres_calculs | `equations-et-inequations-2nde` | M3, M6 | COVERED | M3.1 manipulation:SignFlipLine · M3.1 question:M03-S1-Q1 · M3.1 brick… | SignFlipLine — 2 et 5 posés sur u… | `eq-e1` `eq-e5` `eq-e6` `eq-e10` | `regle-signe-retourne` `methode-resoudre-inequation` `mem-signe-negatif` | M3, M6 |
| `P4` Représenter l’ensemble des solutions sur une … | nombres_calculs | `equations-et-inequations-2nde` | M1, M3 | COVERED | M1.2 manipulation:SolutionScanner · M3.3 manipulation:SolutionBuilder… | SolutionBuilder au module 3 étape… | `eq-e6` | `inequation-infinite` | M1, M3 |
| `P5` Résoudre des équations produit. | nombres_calculs | `equations-et-inequations-2nde` | M4, M5 | COVERED | M4.1 manipulation:ProductScanner · M4.1 feedback · M4.2 brick:vocab-f… | ProductScanner — trois barres (fa… | `eq-e7` `eq-e8` | `vocab-facteur` `produit-nul` `methode-equation-produit` | M4, M5 |
| `P6` Résoudre des équations quotient avec les rest… | nombres_calculs | `equations-et-inequations-2nde` | M5 | COVERED | M5.1 manipulation:ProductScanner · M5.1 feedback · M5.1 brick:valeur-… | ProductScanner en mode 'quotient'… | `eq-e9` | `valeur-interdite` `quotient-nul` `methode-choisir-methode` | M5 |
| `P7` Interpréter et vérifier les solutions. | nombres_calculs | `equations-et-inequations-2nde` | M1, M2, M4, M5, M6 | COVERED | M1.4 question:M01-S4-Q3 · M1.4 brick:methode-verifier-solution · M2.3… | Aucune. Le module 6 est le seul m… | `eq-e2` `eq-e8` `eq-e10` | `methode-verifier-solution` `regle-solution-exacte` `methode-traduire-vitesse` | M1, M2, M4, M5, M6 |
| `P8` Prendre en compte l’ensemble de définition d’… | nombres_calculs | `equations-et-inequations-2nde` | M5 | COVERED | M5.1 brick:valeur-interdite · M5.1 brick:quotient-nul · M5.1 assessme… | ProductScanner | `eq-e11` | `valeur-interdite` `quotient-nul` `methode-choisir-methode` | M5 |
| `P9` Modéliser un problème par une équation ou une… | nombres_calculs | `equations-et-inequations-2nde` | M6 | COVERED | M6.1 brick:methode-modeliser · M6.1 brick:regle-interpreter-solution … | — | `eq-e12` | `methode-modeliser` `regle-interpreter-solution` `methode-traduire-vitesse` | M6 |
| `P10` Vérifier une solution. | nombres_calculs | `equations-et-inequations-2nde` | M1 | COVERED | M1.1 brick:methode-verifier-solution · M1.1 manipulation:SolutionScan… | SolutionScanner | `eq-e13` | `equation-solution` `regle-nombre-de-solutions` `methode-verifier-solution` | M1 |
| `P1` Construire et analyser une proposition mathém… | nombres_calculs | `logique-et-raisonnement-2nde` | M1, M2 | COVERED | M1.1 manipulation:ConjectureLab · M1.1 question:M01-S1-Q1 · M1.1 bric… | ConjectureLab — tester n² + n + 4… | `lg-e1` `lg-e2` | `proposition` `contre-exemple` `regle-refuter-prouver` | M1, M2 |
| `P2` Utiliser les connecteurs logiques. | nombres_calculs | `logique-et-raisonnement-2nde` | M2 | COVERED | M2.1 manipulation:FilterLab · M2.1 brick:connecteurs · M2.1 question:… | FilterLab — deux propriétés fixes… | `lg-e3` `lg-e4` | `connecteurs` `regle-ou-inclusif` `methode-negation` | M2 |
| `P3` Comprendre et utiliser l’implication. | nombres_calculs | `logique-et-raisonnement-2nde` | M3, M4 | COVERED | M3.1 manipulation:ImplicationLab · M3.1 brick:implication · M3.1 bric… | ImplicationLab — un domaine se ré… | `lg-e5` `lg-e6` | `implication` `reciproque` `contraposee` | M3, M4 |
| `P4` Comprendre et utiliser l’équivalence. | nombres_calculs | `logique-et-raisonnement-2nde` | M4 | COVERED | M4.1 manipulation:ImplicationLab · M4.1 question:M04-S1-Q1 · M4.1 bri… | ImplicationLab sur le domaine {−3… | `lg-e7` `lg-e8` | `equivalence` `regle-equivalence-carre` `methode-choisir-symbole` | M4 |
| `P5` Utiliser un contre-exemple pour réfuter une a… | nombres_calculs | `logique-et-raisonnement-2nde` | M1, M3, M5 | COVERED | M1.1 manipulation:ConjectureLab · M1.1 brick:contre-exemple · M1.3 br… | Le contre-exemple est produit par… | `lg-e2` `lg-e9` | `contre-exemple` `regle-refuter-prouver` `mem-contre-exemple` | M1, M3, M5 |
| `P6` Raisonner par contradiction. | nombres_calculs | `logique-et-raisonnement-2nde` | M5 | COVERED | M5.1 manipulation:PigeonLab · M5.1 brick:raisonnement-absurde · M5.1 … | PigeonLab — ajouter des élèves un… | `lg-e10` | `raisonnement-absurde` `vocab-quatre-outils` | M5 |
| `P7` Utiliser des variables dans une proposition. | nombres_calculs | `logique-et-raisonnement-2nde` | M1 | COVERED | M1.1 brick:proposition · M1.1 brick:contre-exemple · M1.1 assessment:… | ConjectureLab | `lg-e11` | `proposition` `contre-exemple` `regle-refuter-prouver` | M1 |
| `P8` Formuler la réciproque d’une implication. | nombres_calculs | `logique-et-raisonnement-2nde` | M3 | COVERED | M3.1 brick:reciproque · M3.1 manipulation:ImplicationLab · M3.1 asses… | ImplicationLab | `lg-e12` | `implication` `reciproque` `contraposee` | M3 |
| `P9` Utiliser une contraposée. | nombres_calculs | `logique-et-raisonnement-2nde` | M3 | COVERED | M3.1 brick:contraposee · M3.1 assessment:lg-e13 | ImplicationLab | `lg-e13` | `implication` `reciproque` `contraposee` | M3 |
| `P10` Comprendre les quantifications universelle et… | nombres_calculs | `logique-et-raisonnement-2nde` | M1 | COVERED | M1.1 brick:regle-refuter-prouver · M1.1 brick:mem-contre-exemple · M1… | ConjectureLab | `lg-e14` | `proposition` `contre-exemple` `regle-refuter-prouver` | M1 |
| `P11` Raisonner par disjonction des cas. | nombres_calculs | `logique-et-raisonnement-2nde` | M5 | COVERED | M5.1 brick:disjonction-cas · M5.1 brick:vocab-quatre-outils · M5.1 as… | PigeonLab, ProofOrder | `lg-e15` | `raisonnement-absurde` `disjonction-cas` `vocab-quatre-outils` | M5 |
| `P1` Comprendre l’ensemble des nombres réels. | nombres_calculs | `nombres-reels-2nde` | M1, M2 | COVERED | M1.1 manipulation:ZoomLine · M1.2 feedback · M1.1 brick:droite-reelle… | ZoomLine — zoom ×10 successif sur… | `nr-e1` `nr-e2` | `droite-reelle` `trois-comportements` `familles-emboitees` | M1, M2 |
| `P2` Représenter des nombres réels sur une droite … | nombres_calculs | `nombres-reels-2nde` | M1, M5 | COVERED | M1.1 manipulation:ZoomLine · M1.3 brick:methode-encadrer-decimales · … | ZoomLine (placement/lecture d'un … | `nr-e3` `nr-e10` | `droite-reelle` `methode-encadrer-decimales` `methode-comparer-reels` | M1, M5 |
| `P3` Distinguer nombres décimaux, rationnels et ir… | nombres_calculs | `nombres-reels-2nde` | M2, M3 | COVERED | M2.1 manipulation:FamilySorter · M2.1 brick:decimal · M2.1 brick:rati… | FractionExpander — la division po… | `nr-e2` `nr-e4` `nr-e5` | `decimal` `rationnel` `irrationnel` | M2, M3 |
| `P4` Reconnaître et utiliser les écritures exactes… | nombres_calculs | `nombres-reels-2nde` | M3, M4 | COVERED | M3.4 brick:exact-approche · M3.4 question:M03-S4-Q2 · M4.1 manipulati… | RoundingLab — pousser la précisio… | `nr-e6` `nr-e7` | `exact-approche` `mem-exact-approche` `arrondi-troncature` | M3, M4 |
| `P5` Comparer et encadrer des nombres réels. | nombres_calculs | `nombres-reels-2nde` | M1, M4, M5 | COVERED | M5.1 manipulation:SquareBracketer · M5.2 manipulation:SquareBracketer… | SquareBracketer — toucher des can… | `nr-e3` `nr-e8` `nr-e9` `nr-e10` | `methode-encadrer-racine` `methode-comparer-reels` `regle-sens-arrondi` | M1, M4, M5 |
| `P6` Choisir un arrondi adapté à une situation. | nombres_calculs | `nombres-reels-2nde` | M5 | COVERED | M5.1 brick:regle-sens-arrondi · M5.1 assessment:nr-e11 | OrderingGame, SquareBracketer | `nr-e11` | `methode-encadrer-racine` `methode-comparer-reels` `regle-sens-arrondi` | M5 |
| `P1` Interpréter la valeur absolue comme une dista… | nombres_calculs | `valeur-absolue-distance-2nde` | M1, M2 | COVERED | M1.1 manipulation:DistanceLine · M1.1 feedback · M1.1 brick:valeur-ab… | DistanceLine — un phare en 0, un … | `va-e1` `va-e2` | `valeur-absolue-distance-zero` `regle-opposes-meme-distance` `mem-valeur-absolue-positive` | M1, M2 |
| `P2` Calculer la valeur absolue d’un nombre réel. | nombres_calculs | `valeur-absolue-distance-2nde` | M2 | COVERED | M2.1 manipulation:AbsMachine · M2.1 brick:regle-calcul-valeur-absolue… | AbsMachine — entrer des nombres (… | `va-e2` `va-e3` | `regle-calcul-valeur-absolue` `methode-calculer-expression-absolue` | M2 |
| `P3` Interpréter la distance entre deux nombres ré… | nombres_calculs | `valeur-absolue-distance-2nde` | M3 | COVERED | M3.1 manipulation:DistanceLine · M3.1 brick:distance-deux-nombres · M… | DistanceLine à deux poignées (A e… | `va-e4` `va-e5` | `distance-deux-nombres` `regle-distance-invariante` `mem-distance` | M3 |
| `P4` Résoudre des situations utilisant des distanc… | nombres_calculs | `valeur-absolue-distance-2nde` | M4, M5 | COVERED | M4.3 manipulation:BeamLine · M4.3 brick:equation-distance-egale · M5.… | BeamLine avec bascule ≤ / < (modu… | `va-e8` `va-e9` `va-e10` | `methode-tolerance` `regle-deux-positions` `equation-distance-egale` | M4, M5 |
| `P5` Relier distance, valeur absolue et intervalle… | nombres_calculs | `valeur-absolue-distance-2nde` | M4, M5 | COVERED | M4.1 manipulation:BeamLine · M4.1 brick:faisceau-intervalle · M4.1 qu… | BeamLine — un centre a (Stepper),… | `va-e6` `va-e7` `va-e8` | `faisceau-intervalle` `methode-centre-rayon` `mem-faisceau` | M4, M5 |
| `P6` Résoudre une inéquation de la forme \|x − a\| ≤… | nombres_calculs | `valeur-absolue-distance-2nde` | M4 | COVERED | M4.1 brick:faisceau-intervalle · M4.1 brick:methode-centre-rayon · M4… | BeamLine, BuildCheck | `va-e11` | `faisceau-intervalle` `equation-distance-egale` `methode-centre-rayon` | M4 |
| `P7` Représenter graphiquement l’ensemble des solu… | nombres_calculs | `valeur-absolue-distance-2nde` | M4 | COVERED | M4.1 brick:faisceau-intervalle · M4.1 manipulation:BeamLine · M4.1 as… | BeamLine, BuildCheck | `va-e11` | `faisceau-intervalle` `equation-distance-egale` `methode-centre-rayon` | M4 |
| `P1` Construire un arbre de probabilités | statistiques_probabilites | `arbres-probabilites-2nde` | M1 | COVERED | M1.1 manipulation:TreeBuilder · M1.1 brick:arbre-structure · M1.2 que… | TreeBuilder — l'élève pose lui-mê… | `ar-e1` | `arbre-structure` | M1 |
| `P2` Lire un arbre pondéré | statistiques_probabilites | `arbres-probabilites-2nde` | M2 | COVERED | M2.1 brick:poids-conditionnels · M2.2 brick:somme-branches · M2.2 que… | Aucune manipulation propre : lect… | `ar-e4` | `poids-conditionnels` `somme-branches` | M2 |
| `P3` Interpréter la pondération d'une branche | statistiques_probabilites | `arbres-probabilites-2nde` | M2 | COVERED | M2.1 brick:poids-conditionnels · M2.1 question:M02-S1-Q1 | — | `ar-e3` | `poids-conditionnels` | M2 |
| `P4` Identifier une probabilité conditionnelle dan… | statistiques_probabilites | `arbres-probabilites-2nde` | M2 | COVERED | M2.1 brick:poids-conditionnels · M2.3 question:M02-S3-Q1 | — | `ar-e3` | `poids-conditionnels` | M2 |
| `P5` Calculer la probabilité d'un chemin | statistiques_probabilites | `arbres-probabilites-2nde` | M3 | COVERED | M3.1 feedback · M3.1 question:M03-S1-Q1 · M3.2 brick:produit-chemin | Comptage effectif sur 1 000 tirag… | `ar-e5` | `produit-chemin` | M3 |
| `P6` Multiplier les probabilités des branches | statistiques_probabilites | `arbres-probabilites-2nde` | M3 | COVERED | M3.1 feedback · M3.2 brick:produit-chemin · M3.2 question:M03-S2-Q1 | — | `ar-e5` `ar-e6` | `produit-chemin` | M3 |
| `P7` Calculer la probabilité d'un événement | statistiques_probabilites | `arbres-probabilites-2nde` | M4 | COVERED | M4.1 brick:somme-chemins · M4.1 question:M04-S1-Q1 · M4.2 brick:mem-p… | — | `ar-e7` `ar-e9` | `somme-chemins` `mem-produit-somme` | M4 |
| `P8` Additionner les probabilités de plusieurs che… | statistiques_probabilites | `arbres-probabilites-2nde` | M4 | COVERED | M4.1 brick:somme-chemins · M4.2 question:M04-S2-Q1 | — | `ar-e7` `ar-e8` | `somme-chemins` `mem-produit-somme` | M4 |
| `P9` Passer d'une situation réelle à un arbre | statistiques_probabilites | `arbres-probabilites-2nde` | M1, M5 | COVERED | M1.1 manipulation:TreeBuilder · M5.1 brick:methode-situation-arbre · … | TreeBuilder en M1 ; l'atelier M5 … | `ar-e2` `ar-e9` | `methode-situation-arbre` | M1, M5 |
| `P10` Passer d'un arbre à une situation en langage … | statistiques_probabilites | `arbres-probabilites-2nde` | M5 | COVERED | M5.2 brick:methode-situation-arbre · M5.3 question:M05-S3-Q1 | — | `ar-e10` | `methode-situation-arbre` | M5 |
| `P1` Lire une boîte à moustaches | statistiques_probabilites | `boites-a-moustaches-2nde` | M1, M5 | COVERED | M1.1 manipulation:BoxPlot(reveal) · M1.1 feedback · M1.1 brick:resume… | La SEULE vraie fabrication de la … | `bm-e1` | `resume-cinq-nombres` `construire-boite` | M1, M5 |
| `P2` Identifier médiane et quartiles | statistiques_probabilites | `boites-a-moustaches-2nde` | M1 | PARTIALLY_COVERED | M1.1 manipulation:BoxPlot(reveal) · M1.1 brick:construire-boite · M1.… | La révélation progressive du modu… | `bm-e2` | `construire-boite` `resume-cinq-nombres` | M1 |
| `P3` Identifier l'étendue | statistiques_probabilites | `boites-a-moustaches-2nde` | M2 | COVERED | M2.2 brick:lire-dispersion · M2.2 question:NumericQuestion (écart int… | AUCUNE manipulation propre. La br… | `bm-e3` `bm-e5` | `lire-dispersion` | M2 |
| `P4` Comprendre la dispersion | statistiques_probabilites | `boites-a-moustaches-2nde` | M2 | COVERED | M2.1 manipulation:PredictionChips + DotPlot(showQuartiles) · M2.1 bri… | Pas de manipulation au sens fort … | `bm-e4` `bm-e5` | `zones-quart` `mem-boite` `lire-dispersion` | M2 |
| `P5` Comparer deux distributions | statistiques_probabilites | `boites-a-moustaches-2nde` | M3, M5 | COVERED | M3.1 manipulation:bascule axe commun / échelles séparées (BoxPlot) · … | La deuxième vraie manipulation de… | `bm-e7` `bm-e8` | `axe-commun` `mediane-ne-dit-pas-tout` `interpreter-contexte` | M3, M5 |
| `P6` Comparer des médianes | statistiques_probabilites | `boites-a-moustaches-2nde` | M3 | COVERED | M3.2 question:BatchChoiceQuestion ligne r1 et ligne r4 · M3.3 brick:m… | Aucune manipulation dédiée : le p… | `bm-e6` `bm-e7` | `mediane-ne-dit-pas-tout` `axe-commun` | M3 |
| `P7` Comparer des dispersions | statistiques_probabilites | `boites-a-moustaches-2nde` | M3 | COVERED | M2.3 question:TapQuestion (Brest 4 °C contre Embrun 12 °C) · M3.1 man… | Le geste porteur reste la bascule… | `bm-e8` `bm-e9` | `lire-dispersion` `axe-commun` `zones-quart` | M3 |
| `P8` Choisir des indicateurs adaptés | statistiques_probabilites | `boites-a-moustaches-2nde` | M4 | COVERED | M4.1 manipulation:quatre questions × trois villes, verdict par questi… | Manipulation légère mais réelle :… | `bm-e9` | `choisir-indicateur` `mem-boite` | M4 |
| `P9` Interpréter une boîte à moustaches dans son c… | statistiques_probabilites | `boites-a-moustaches-2nde` | M4, M5 | COVERED | M4.3 question:TapQuestion (festival en plein air) · M5.1 question:Tap… | AUCUNE. Le module 5 est un practi… | `bm-e10` | `interpreter-contexte` `mediane-ne-dit-pas-tout` | M4, M5 |
| `P1` Calculer une évolution successive | statistiques_probabilites | `evolutions-successives-reciproques-2nde` | M1, M2 | COVERED | M1.1 manipulation:EvolutionChain · M1.1 feedback · M1.1 brick:base-mo… | EvolutionChain — la chaîne complè… | `ev-e2` | `base-mouvante` `coefficient-global` `methode-composer` | M1, M2 |
| `P2` Composer des coefficients multiplicateurs | statistiques_probabilites | `evolutions-successives-reciproques-2nde` | M2 | COVERED | M1.3 manipulation:EvolutionChain · M1.3 brick:ordre-sans-importance ·… | EvolutionChain avec `maxSteps={3}… | `ev-e1` `ev-e5` | `coefficient-global` `methode-composer` `ordre-sans-importance` | M2 |
| `P3` Calculer un taux d'évolution global | statistiques_probabilites | `evolutions-successives-reciproques-2nde` | M3, M6 | COVERED | M3.1 manipulation:EvolutionChain · M3.1 feedback · M3.1 brick:taux-gl… | EvolutionChain affiche, dans son … | `ev-e3` `ev-e4` `ev-e5` | `taux-global` `coefficient-global` `somme-jamais` | M3, M6 |
| `P4` Comprendre qu'une succession de pourcentages … | statistiques_probabilites | `evolutions-successives-reciproques-2nde` | M1, M3 | COVERED | M1.1 manipulation:EvolutionChain · M1.2 manipulation:EvolutionChain ·… | Deux gestes distincts portent ce … | `ev-e2` `ev-e4` `ev-e10` | `base-mouvante` `mem-ne-sannule-pas` `somme-jamais` | M1, M3 |
| `P5` Calculer une évolution réciproque | statistiques_probabilites | `evolutions-successives-reciproques-2nde` | M4, M6 | COVERED | M4.1 manipulation:ReciprocalFinder · M4.1 feedback · M4.1 brick:evolu… | ReciprocalFinder — la première év… | `ev-e6` `ev-e9` | `evolution-reciproque` `formule-taux-reciproque` `mem-inverse-pas-oppose` | M4, M6 |
| `P6` Déterminer le coefficient multiplicateur réci… | statistiques_probabilites | `evolutions-successives-reciproques-2nde` | M4, M5 | COVERED | M4.1 manipulation:ReciprocalFinder · M4.1 brick:evolution-reciproque … | Le même ReciprocalFinder : quand … | `ev-e7` | `evolution-reciproque` `formule-taux-reciproque` | M4, M5 |
| `P7` Interpréter une évolution dans son contexte | statistiques_probabilites | `evolutions-successives-reciproques-2nde` | M6 | PARTIALLY_COVERED | M6.1 brick:methode-choisir-operation · M6.1 question:M06-S1-Q1 (« −80… | AUCUNE. Le module 6 est un practi… | `ev-e10` | `methode-choisir-operation` `somme-jamais` `coefficient-global` | M6 |
| `P8` Résoudre des problèmes d'évolution | statistiques_probabilites | `evolutions-successives-reciproques-2nde` | M5, M6 | COVERED | M5.1 brick:retrouver-valeur-initiale · M5.1 question:M05-S1 (96 € apr… | AUCUNE au module 5, et c'est un c… | `ev-e8` `ev-e9` | `retrouver-valeur-initiale` `verification-systematique` `methode-choisir-operation` | M5, M6 |
| `P1` Comprendre une fréquence conditionnelle | statistiques_probabilites | `frequences-conditionnelles-2nde` | M1 | COVERED | M1.1 manipulation:ReferenceLab · M1.1 feedback · M1.1 brick:populatio… | ReferenceLab — L'INTERACTION SIGN… | `fc-e1` | `population-reference` `mem-parmi` `trois-frequences` | M1 |
| `P2` Calculer une fréquence conditionnelle | statistiques_probabilites | `frequences-conditionnelles-2nde` | M2 | COVERED | M1.1 manipulation:ReferenceLab · M2.1 brick:trois-frequences · M3.3 q… | ReferenceLab affiche le quotient … | `fc-e2` | `trois-frequences` `population-reference` | M2 |
| `P3` Comprendre une fréquence marginale | statistiques_probabilites | `frequences-conditionnelles-2nde` | M1 | COVERED | M1.1 manipulation:ReferenceLab (référence « Tout le monde ») · M2.1 b… | Indirecte : la troisième référenc… | `fc-e3` | `trois-frequences` | M1 |
| `P4` Calculer une fréquence marginale | statistiques_probabilites | `frequences-conditionnelles-2nde` | M2 | COVERED | M2.1 brick:trois-frequences · M2.2 manipulation:bascule effectifs / f… | Module 2 étape 2 : deux boutons «… | `fc-e3` | `trois-frequences` `population-reference` | M2 |
| `P5` Compléter un tableau croisé | statistiques_probabilites | `frequences-conditionnelles-2nde` | M4 | PARTIALLY_COVERED | M4.1 brick:frequences-vers-effectifs · M4.1 question:NumericQuestion … | AUCUNE. Le module 4 est étiqueté … | `fc-e9` `fc-e10` | `frequences-vers-effectifs` `methode-completer-tableau` | M4 |
| `P6` Interpréter une fréquence conditionnelle | statistiques_probabilites | `frequences-conditionnelles-2nde` | M3, M5 | COVERED | M3.1 manipulation:bascule de condition (CrossTableView highlight lign… | Deux boutons « Parmi les élèves d… | `fc-e5` `fc-e6` | `inversion-condition` `mem-parmi` | M3, M5 |
| `P7` Comparer des sous-populations | statistiques_probabilites | `frequences-conditionnelles-2nde` | M3, M5 | COVERED | M3.3 brick:comparer-sous-populations · M3.3 question:NumericQuestion … | Aucune manipulation dédiée. Le se… | `fc-e7` | `comparer-sous-populations` `population-reference` | M3, M5 |
| `P8` Passer des effectifs aux fréquences | statistiques_probabilites | `frequences-conditionnelles-2nde` | M2 | COVERED | M2.2 manipulation:bascule effectifs / fréquences conjointes (CrossTab… | La bascule effectifs → fréquences… | `fc-e4` | `somme-conditionnelles` `trois-frequences` | M2 |
| `P9` Passer des fréquences aux effectifs | statistiques_probabilites | `frequences-conditionnelles-2nde` | M4 | COVERED | M4.1 brick:frequences-vers-effectifs · M4.1 question:NumericQuestion … | AUCUNE (voir P5 : le module 4 n'a… | `fc-e8` `fc-e9` | `frequences-vers-effectifs` `somme-conditionnelles` `methode-completer-tableau` | M4 |
| `P10` Interpréter des données réelles | statistiques_probabilites | `frequences-conditionnelles-2nde` | M5 | COVERED | M3.2 question:TapQuestion (90 % des accidents graves) · M5.1 brick:li… | AUCUNE. Le module 5 est un practi… | `fc-e6` `fc-e10` | `lire-un-article` `inversion-condition` `comparer-sous-populations` | M5 |
| `P1` Simuler une expérience aléatoire | statistiques_probabilites | `loi-grands-nombres-2nde` | M1, M5 | COVERED | M1.1 manipulation:SimulationLab · M1.1 brick:experience-simulation · … | SimulationLab — chaque lancer est… | `lgn-e9` | `experience-simulation` `frequence-observee` | M1, M5 |
| `P2` Répéter une expérience indépendante | statistiques_probabilites | `loi-grands-nombres-2nde` | M2 | COVERED | M2.1 manipulation:FluctuationBoard · M2.1 brick:fluctuation · M2.2 qu… | FluctuationBoard — deux séries la… | `lgn-e3` `lgn-e5` | `fluctuation` | M2 |
| `P3` Calculer une fréquence observée | statistiques_probabilites | `loi-grands-nombres-2nde` | M1 | COVERED | M1.1 manipulation:SimulationLab · M1.1 brick:frequence-observee | SimulationLab affiche la fréquenc… | `lgn-e1` | `frequence-observee` | M1 |
| `P4` Observer la fluctuation des fréquences | statistiques_probabilites | `loi-grands-nombres-2nde` | M2 | COVERED | M2.1 manipulation:FluctuationBoard · M2.1 brick:fluctuation · M3.1 ma… | FluctuationBoard puis GapExplorer… | `lgn-e6` `lgn-e7` | `fluctuation` `deux-ecarts` | M2 |
| `P5` Observer la stabilisation des fréquences | statistiques_probabilites | `loi-grands-nombres-2nde` | M3 | COVERED | M3.1 manipulation:GapExplorer · M3.1 brick:deux-ecarts · M3.3 brick:l… | GapExplorer — on fait grandir n e… | `lgn-e4` `lgn-e5` `lgn-e6` | `deux-ecarts` `loi-grands-nombres` | M3 |
| `P6` Comprendre le lien entre fréquence et probabi… | statistiques_probabilites | `loi-grands-nombres-2nde` | M3 | COVERED | M3.1 manipulation:GapExplorer · M3.3 brick:loi-grands-nombres · M3.2 … | — | `lgn-e2` | `loi-grands-nombres` | M3 |
| `P7` Distinguer modèle probabiliste et situation r… | statistiques_probabilites | `loi-grands-nombres-2nde` | M4 | COVERED | M4.1 manipulation:DiceDetector · M4.1 brick:modele-realite · M4.2 bri… | DiceDetector — décider si un dé o… | `lgn-e7` `lgn-e8` `lgn-e10` | `modele-realite` `methode-tester-modele` | M4 |
| `P8` Comprendre qu'une équiprobabilité est une hyp… | statistiques_probabilites | `loi-grands-nombres-2nde` | M4 | COVERED | M4.1 manipulation:DiceDetector · M4.1 brick:modele-realite · M4.2 que… | — | `lgn-e8` `lgn-e10` | `modele-realite` | M4 |
| `P9` Utiliser une simulation Python ou tableur | statistiques_probabilites | `loi-grands-nombres-2nde` | M5 | COVERED | M5.1 brick:lire-simulation · M5.2 manipulation:PyLab · M5.3 question:… | PyLab | `lgn-e9` | `lire-simulation` | M5 |
| `P1` Comprendre une probabilité conditionnelle | statistiques_probabilites | `probabilites-conditionnelles-2nde` | M1 | COVERED | M1.1 manipulation:UniverseLab · M1.1 brick:univers-restreint · M1.2 q… | UniverseLab — appliquer une condi… | `pc-e1` | `univers-restreint` | M1 |
| `P2` Interpréter 'sachant que' | statistiques_probabilites | `probabilites-conditionnelles-2nde` | M1 | COVERED | M1.1 manipulation:UniverseLab · M2.1 brick:notation-sachant · M2.1 qu… | — | `pc-e2` | `univers-restreint` `notation-sachant` | M1 |
| `P3` Calculer P_A(B) | statistiques_probabilites | `probabilites-conditionnelles-2nde` | M2 | COVERED | M2.1 brick:notation-sachant · M2.2 question:M02-S2-Q1 · M2.3 question… | Aucune manipulation propre au mod… | `pc-e3` | `notation-sachant` | M2 |
| `P4` Calculer une probabilité conditionnelle à par… | statistiques_probabilites | `probabilites-conditionnelles-2nde` | M2 | COVERED | M2.2 brick:notation-sachant · M2.2 question:M02-S2-Q1 | — | `pc-e4` | `notation-sachant` | M2 |
| `P5` Calculer une probabilité conditionnelle dans … | statistiques_probabilites | `probabilites-conditionnelles-2nde` | M5 | COVERED | M5.1 brick:methode-situation · M5.1 question:M05-S1-Q1 · M5.3 questio… | Atelier de quatre situations conc… | `pc-e5` `pc-e9` | `methode-situation` | M5 |
| `P6` Distinguer P_A(B) et P_B(A) | statistiques_probabilites | `probabilites-conditionnelles-2nde` | M3 | COVERED | M3.1 brick:inversion · M3.1 question:M03-S1-Q1 · M3.2 brick:mem-indice | Aucun instrument : la confrontati… | `pc-e6` | `inversion` `mem-indice` | M3 |
| `P7` Interpréter une probabilité conditionnelle | statistiques_probabilites | `probabilites-conditionnelles-2nde` | M4, M5 | COVERED | M4.1 brick:frequence-probabilite · M4.2 question:M04-S2-Q1 · M5.2 que… | — | `pc-e8` | `frequence-probabilite` | M4, M5 |
| `P8` Identifier une erreur d'inversion du conditio… | statistiques_probabilites | `probabilites-conditionnelles-2nde` | M3 | COVERED | M3.1 brick:inversion · M3.2 brick:mem-indice · M3.2 question:M03-S2-Q1 | — | `pc-e7` | `inversion` `mem-indice` | M3 |
| `P9` Relier probabilité conditionnelle et fréquenc… | statistiques_probabilites | `probabilites-conditionnelles-2nde` | M4 | COVERED | M4.1 brick:frequence-probabilite · M4.1 question:M04-S1-Q1 · M4.3 bri… | — | `pc-e10` | `frequence-probabilite` `probabilites-composees` | M4 |
| `P1` Calculer une proportion | statistiques_probabilites | `proportions-pourcentages-2nde` | M1, M2, M6 | COVERED | M1.1 manipulation:PopulationSplitter · M1.1 feedback · M1.1 brick:voc… | PopulationSplitter — 800 élèves, … | `pp-e1` `pp-e2` | `vocab-part-tout` `proportion-reference` `formule-proportion` | M1, M2, M6 |
| `P2` Exprimer une proportion sous forme décimale | statistiques_probabilites | `proportions-pourcentages-2nde` | M1, M2 | COVERED | M2.1 manipulation:ThreeWritings · M2.1 feedback · M2.1 brick:trois-ec… | ThreeWritings — l'élève choisit u… | `pp-e3` | `trois-ecritures` `vocab-pourcentage` | M1, M2 |
| `P3` Exprimer une proportion sous forme fractionna… | statistiques_probabilites | `proportions-pourcentages-2nde` | M2, M6 | PARTIALLY_COVERED | M2.1 manipulation:ThreeWritings · M2.1 brick:trois-ecritures · M2.4 q… | ThreeWritings affiche la colonne … | `pp-e3` | `trois-ecritures` `vocab-pourcentage` | M2, M6 |
| `P4` Exprimer une proportion en pourcentage | statistiques_probabilites | `proportions-pourcentages-2nde` | M1, M2 | COVERED | M1.1 manipulation:PopulationSplitter · M1.3 manipulation:PopulationSp… | PopulationSplitter : le pourcenta… | `pp-e1` | `vocab-pourcentage` `trois-ecritures` `vocab-part-tout` | M1, M2 |
| `P5` Calculer une proportion de proportion | statistiques_probabilites | `proportions-pourcentages-2nde` | M3, M6 | COVERED | M1.3 manipulation:PopulationSplitter · M1.3 brick:proportion-referenc… | NestedShares — deux curseurs (p₁ … | `pp-e4` `pp-e5` | `proportion-de-proportion` `methode-remises-successives` `proportion-reference` | M3, M6 |
| `P6` Interpréter un pourcentage de pourcentage | statistiques_probabilites | `proportions-pourcentages-2nde` | M3 | COVERED | M1.3 manipulation:PopulationSplitter · M1.3 brick:proportion-referenc… | PopulationSplitter avec DEUX barr… | `pp-e5` | `proportion-reference` `mem-de-quoi` `proportion-de-proportion` | M3 |
| `P7` Distinguer proportion et évolution | statistiques_probabilites | `proportions-pourcentages-2nde` | M4, M6 | COVERED | M4.1 manipulation:StateVsChange · M4.1 feedback · M4.1 brick:etat-vs-… | StateVsChange — deux barres verti… | `pp-e6` `pp-e7` | `etat-vs-variation` `point-vs-pourcent` `formule-taux-evolution` | M4, M6 |
| `P8` Identifier une variation additive | statistiques_probabilites | `proportions-pourcentages-2nde` | M4 | COVERED | M4.1 manipulation:StateVsChange · M4.1 brick:point-vs-pourcent · M4.2… | L'encadré ambre de StateVsChange … | `pp-e6` | `point-vs-pourcent` `etat-vs-variation` | M4 |
| `P9` Identifier une variation multiplicative | statistiques_probabilites | `proportions-pourcentages-2nde` | M4 | COVERED | M4.1 manipulation:StateVsChange · M4.1 brick:etat-vs-variation · M4.4… | L'encadré rose de StateVsChange c… | `pp-e7` | `formule-taux-evolution` `etat-vs-variation` `coefficient-multiplicateur` | M4 |
| `P10` Utiliser un coefficient multiplicateur | statistiques_probabilites | `proportions-pourcentages-2nde` | M5, M6 | COVERED | M5.1 manipulation:CoefficientDial · M5.1 feedback · M5.1 brick:coeffi… | CoefficientDial — l'élève glisse … | `pp-e9` `pp-e10` | `coefficient-multiplicateur` `mem-k-1-plus-t` `methode-coefficient-taux` | M5, M6 |
| `P11` Passer d'un taux d'évolution à un coefficient… | statistiques_probabilites | `proportions-pourcentages-2nde` | M5 | COVERED | M5.1 manipulation:CoefficientDial · M5.1 brick:mem-k-1-plus-t · M5.2 … | Le même CoefficientDial se lit da… | `pp-e8` `pp-e9` | `mem-k-1-plus-t` `methode-coefficient-taux` `coefficient-multiplicateur` | M5 |
| `P1` Comprendre le regroupement en classes | statistiques_probabilites | `series-regroupees-classes-2nde` | M1 | COVERED | M1.1 manipulation:ClassWidthLab · M1.1 brick:regroupement-classes · M… | ClassWidthLab — le curseur d'ampl… | `sr-e1` | `regroupement-classes` `choix-amplitude` | M1 |
| `P2` Identifier des classes de même amplitude | statistiques_probabilites | `series-regroupees-classes-2nde` | M1 | COVERED | M1.1 manipulation:ClassWidthLab · M1.2 brick:vocab-classe-amplitude ·… | — | `sr-e2` | `vocab-classe-amplitude` `choix-amplitude` | M1 |
| `P3` Construire un histogramme | statistiques_probabilites | `series-regroupees-classes-2nde` | M2, M6 | COVERED | M2.1 manipulation:ClassWidthLab · M2.2 brick:lire-histogramme · M2.3 … | ClassWidthLab réutilisé pour fair… | `sr-e3` | `lire-histogramme` `histogramme-aire` | M2, M6 |
| `P4` Lire un histogramme | statistiques_probabilites | `series-regroupees-classes-2nde` | M2, M6 | COVERED | M2.2 brick:lire-histogramme · M2.4 question:M02-S4-Q1 · M6.2 question… | — | `sr-e4` | `lire-histogramme` `histogramme-aire` | M2, M6 |
| `P5` Construire un polygone des fréquences cumulées | statistiques_probabilites | `series-regroupees-classes-2nde` | M3 | COVERED | M3.1 brick:frequences-cumulees · M3.3 brick:polygone-cumule · M3.3 qu… | Aucun instrument propre : constru… | `sr-e5` | `frequences-cumulees` `polygone-cumule` | M3 |
| `P6` Calculer une moyenne pondérée | statistiques_probabilites | `series-regroupees-classes-2nde` | M4 | COVERED | M4.1 brick:moyenne-estimee · M4.1 question:M04-S1-Q1 | — | `sr-e6` | `moyenne-estimee` | M4 |
| `P7` Estimer une moyenne à partir de classes | statistiques_probabilites | `series-regroupees-classes-2nde` | M4 | COVERED | M4.2 brick:moyenne-estimee · M4.2 brick:mem-estimation · M4.3 questio… | — | `sr-e6` `sr-e7` | `moyenne-estimee` `mem-estimation` | M4 |
| `P8` Déterminer la classe médiane | statistiques_probabilites | `series-regroupees-classes-2nde` | M5 | COVERED | M5.1 brick:classe-mediane · M5.1 question:M05-S1-Q1 | — | `sr-e8` | `classe-mediane` | M5 |
| `P9` Estimer une médiane dans une classe | statistiques_probabilites | `series-regroupees-classes-2nde` | M5 | COVERED | M5.2 brick:mediane-interpolee · M5.3 question:M05-S3-Q1 | — | `sr-e9` | `mediane-interpolee` `classe-mediane` | M5 |
| `P10` Interpréter une série continue regroupée | statistiques_probabilites | `series-regroupees-classes-2nde` | M3, M6 | COVERED | M3.4 question:M03-S4-Q1 · M6.1 brick:lire-honnetement · M6.3 question… | — | `sr-e10` | `lire-honnetement` | M3, M6 |
| `P1` Lire une série statistique | statistiques_probabilites | `statistiques-une-variable-2nde` | M1, M6 | COVERED | M1.1 manipulation:SeriesLab · M1.1 feedback · M1.1 brick:serie-statis… | SeriesLab — vingt pastilles sur u… | `st-e1` | `serie-statistique` `vocab-effectif-frequence` | M1, M6 |
| `P2` Calculer une moyenne | statistiques_probabilites | `statistiques-une-variable-2nde` | M1, M2 | COVERED | M1.1 manipulation:SeriesLab · M2.1 brick:moyenne · M2.1 question:M02-… | SeriesLab, repère orange : la moy… | `st-e2` | `moyenne` | M1, M2 |
| `P3` Utiliser la linéarité de la moyenne | statistiques_probabilites | `statistiques-une-variable-2nde` | M5 | PARTIALLY_COVERED | M5.2 question:M05-S2 (BatchChoiceQuestion, 4 lignes) · M5.2 brick:lin… | AUCUNE pour ce LP. La formule x̄+… | `st-e9` | `linearite-moyenne` | M5 |
| `P4` Calculer une médiane | statistiques_probabilites | `statistiques-une-variable-2nde` | M1, M2 | COVERED | M1.1 manipulation:SeriesLab · M1.1 feedback · M1.3 manipulation:Serie… | SeriesLab, repère vert : le point… | `st-e3` | `mediane` `choisir-position` | M1, M2 |
| `P5` Déterminer les quartiles | statistiques_probabilites | `statistiques-une-variable-2nde` | M3 | COVERED | M3.1 manipulation:SeriesLab (LECTURE SEULE — pas de onChange) · M3.1 … | SeriesLab en lecture (M3 ét. 1, r… | `st-e4` `st-e5` | `quartiles` | M3 |
| `P6` Interpréter les indicateurs statistiques | statistiques_probabilites | `statistiques-une-variable-2nde` | M2, M6 | COVERED | M1.4 question:M01-S4 (un nombre suffit-il ?) · M2.4 brick:choisir-pos… | Le geste porteur est celui du mod… | `st-e5` | `choisir-position` `mem-deux-nombres` `quartiles` | M2, M6 |
| `P7` Comprendre l'écart type | statistiques_probabilites | `statistiques-une-variable-2nde` | M4 | COVERED | M4.1 manipulation:SeriesLab (comparaison A/B, lecture seule) · M4.1 f… | SeriesLab avec `show={{ mean: tru… | `st-e7` `st-e8` | `ecart-type` `mem-deux-nombres` | M4 |
| `P8` Calculer ou utiliser un écart type | statistiques_probabilites | `statistiques-une-variable-2nde` | M4 | COVERED | M4.2 manipulation:SeriesLab · M4.2 brick:ecart-type · M4.3 question:M… | La bande de l'étape 2 précède le … | `st-e7` | `ecart-type` | M4 |
| `P9` Interpréter la dispersion d'une série | statistiques_probabilites | `statistiques-une-variable-2nde` | M3, M6 | COVERED | M3.3 question:M03-S3 (Q3 − Q1 = 13) · M3.3 feedback · M3.3 brick:eten… | Le contraste 2de A / 2de B du mod… | `st-e6` `st-e8` | `etendue-interquartile` `ecart-type` `mem-deux-nombres` | M3, M6 |
| `P10` Étudier l'influence de l'ajout d'une valeur | statistiques_probabilites | `statistiques-une-variable-2nde` | M5 | COVERED | M1.1 manipulation:SeriesLab · M5.1 manipulation:SeriesLab + bascule 2… | Une bascule à deux états — « séri… | `st-e9` | `robustesse` | M5 |
| `P11` Étudier l'influence de la suppression d'une v… | statistiques_probabilites | `statistiques-une-variable-2nde` | M5 | PARTIALLY_COVERED | M5.1 manipulation:SeriesLab + bascule · M5.3 question:M05-S3 (retirer… | La bascule du module 5 étape 1 fo… | `st-e10` | `robustesse` | M5 |
| `P12` Comparer deux séries statistiques | statistiques_probabilites | `statistiques-une-variable-2nde` | M6 | COVERED | M4.1 manipulation:SeriesLab (A et B sur le même axe) · M6.1 manipulat… | SeriesLab en mode `compareValues`… | `st-e10` | `methode-comparer` `mem-deux-nombres` `robustesse` | M6 |
| `P1` Identifier deux variables qualitatives | statistiques_probabilites | `tableaux-croises-2nde` | M2 | PARTIALLY_COVERED | M2.1 brick:combien-modalites · M2.1 question:TapQuestion (classe × ac… | Aucune manipulation ne porte ce L… | `tc-e1` | `combien-modalites` `qualitative-nominale-ordinale` | M2 |
| `P2` Identifier une variable nominale | statistiques_probabilites | `tableaux-croises-2nde` | M2 | COVERED | M2.2 manipulation:bascule ordre quelconque / ordre naturel (CrossTabl… | Deux boutons « Ordre quelconque »… | `tc-e2` | `qualitative-nominale-ordinale` | M2 |
| `P3` Identifier une variable ordinale | statistiques_probabilites | `tableaux-croises-2nde` | M2 | COVERED | M2.2 manipulation:bascule ordre quelconque / ordre naturel (CrossTabl… | Même bascule que P2, lue dans l'a… | `tc-e3` | `qualitative-nominale-ordinale` | M2 |
| `P4` Lire un fichier de données | statistiques_probabilites | `tableaux-croises-2nde` | M1 | COVERED | M1.1 manipulation:FileSorter · M1.2 brick:fichier-donnees · M1.2 ques… | FileSorter : chaque fiche est aff… | `tc-e4` | `fichier-donnees` `tableau-croise` | M1 |
| `P5` Filtrer une population | statistiques_probabilites | `tableaux-croises-2nde` | M4 | COVERED | M4.1 manipulation:FilterLab · M4.1 feedback · M4.1 brick:filtres-logi… | FilterLab : une grille de 60 past… | `tc-e8` | `filtres-logiques` `effectifs-marginaux` | M4 |
| `P6` Construire un tableau croisé d'effectifs | statistiques_probabilites | `tableaux-croises-2nde` | M1 | COVERED | M1.1 manipulation:FileSorter · M1.1 feedback · M1.1 brick:tableau-cro… | FileSorter — L'INTERACTION SIGNAT… | `tc-e5` | `tableau-croise` `fichier-donnees` | M1 |
| `P7` Lire un tableau croisé | statistiques_probabilites | `tableaux-croises-2nde` | M3, M5 | COVERED | M1.3 question:TapQuestion (case contre marges) · M3.1 manipulation:su… | Module 3 étape 1 : trois boutons … | `tc-e5` `tc-e7` | `mem-case-marge` `effectifs-marginaux` `tableau-croise` | M3, M5 |
| `P8` Calculer des effectifs marginaux | statistiques_probabilites | `tableaux-croises-2nde` | M3 | COVERED | M1.1 manipulation:FileSorter (marges recalculées en direct) · M3.1 ma… | Double appui. (1) Dans FileSorter… | `tc-e6` `tc-e7` | `effectifs-marginaux` `mem-case-marge` | M3 |
| `P9` Interpréter les résultats d'un tableau croisé | statistiques_probabilites | `tableaux-croises-2nde` | M5 | COVERED | M5.1 question:TapQuestion (8 danseurs en 2de C contre 5 en 2de A) · M… | AUCUNE. Le module 5 est un practi… | `tc-e10` | `comparer-honnetement` `effectifs-marginaux` `mem-case-marge` | M5 |
| `P10` Utiliser ET, OU et NON pour filtrer des donné… | statistiques_probabilites | `tableaux-croises-2nde` | M4 | COVERED | M4.1 manipulation:FilterLab (OU inclusif et NON) · M4.1 feedback · M4… | FilterLab, et le point mathématiq… | `tc-e8` `tc-e9` | `filtres-logiques` | M4 |
| `P1` Modéliser une situation de test diagnostique | statistiques_probabilites | `tests-diagnostiques-probabilites-2nde` | M1 | COVERED | M1.1 manipulation:TestPopulationLab · M1.1 brick:quatre-groupes · M1.… | TestPopulationLab — 10 000 person… | `td-e1` | `quatre-groupes` | M1 |
| `P2` Identifier la population étudiée | statistiques_probabilites | `tests-diagnostiques-probabilites-2nde` | M1 | COVERED | M1.1 manipulation:TestPopulationLab · M1.1 brick:quatre-groupes | — | `td-e2` | `quatre-groupes` | M1 |
| `P3` Identifier les événements pertinents | statistiques_probabilites | `tests-diagnostiques-probabilites-2nde` | M2 | COVERED | M2.1 manipulation:TestPopulationLab · M2.1 brick:vocabulaire-cases · … | — | `td-e1` | `vocabulaire-cases` | M2 |
| `P4` Comprendre un faux positif | statistiques_probabilites | `tests-diagnostiques-probabilites-2nde` | M2 | COVERED | M2.1 brick:vocabulaire-cases · M2.2 question:M02-S2-Q1 | — | `td-e3` | `vocabulaire-cases` | M2 |
| `P5` Comprendre un faux négatif | statistiques_probabilites | `tests-diagnostiques-probabilites-2nde` | M2 | COVERED | M2.1 brick:vocabulaire-cases · M2.3 question:M02-S3-Q1 | — | `td-e4` | `vocabulaire-cases` | M2 |
| `P6` Comprendre la sensibilité d'un test | statistiques_probabilites | `tests-diagnostiques-probabilites-2nde` | M3 | COVERED | M3.1 brick:sensibilite-specificite · M3.1 question:M03-S1-Q1 | Aucun instrument propre au module… | `td-e5` | `sensibilite-specificite` | M3 |
| `P7` Comprendre la spécificité d'un test | statistiques_probabilites | `tests-diagnostiques-probabilites-2nde` | M3 | COVERED | M3.2 brick:sensibilite-specificite · M3.2 question:M03-S2-Q1 | — | `td-e6` | `sensibilite-specificite` | M3 |
| `P8` Calculer une probabilité conditionnelle dans … | statistiques_probabilites | `tests-diagnostiques-probabilites-2nde` | M4 | COVERED | M4.1 manipulation:PpvExplorer · M4.1 brick:valeur-predictive · M4.2 q… | PpvExplorer — trois curseurs (pré… | `td-e7` | `valeur-predictive` | M4 |
| `P9` Interpréter correctement un résultat de test | statistiques_probabilites | `tests-diagnostiques-probabilites-2nde` | M4, M5 | COVERED | M4.1 manipulation:PpvExplorer · M4.3 brick:mem-inversion-test · M5.3 … | — | `td-e10` | `valeur-predictive` `mem-inversion-test` | M4, M5 |
| `P10` Éviter l'inversion des conditionnements | statistiques_probabilites | `tests-diagnostiques-probabilites-2nde` | M4 | COVERED | M4.1 manipulation:PpvExplorer · M4.3 brick:mem-inversion-test · M4.3 … | — | `td-e8` | `mem-inversion-test` | M4 |
| `P11` Analyser une affirmation liée à un test | statistiques_probabilites | `tests-diagnostiques-probabilites-2nde` | M5 | COVERED | M5.1 brick:methode-affirmation-test · M5.1 question:M05-S1-Q1 · M5.4 … | Atelier de quatre affirmations à … | `td-e9` `td-e10` | `methode-affirmation-test` | M5 |
<!-- END GENERATED: coverage-matrix -->

---

## 5. Problèmes techniques

<!-- BEGIN SECTION: technical-analysis -->
### Deux défauts fonctionnels, invisibles à toutes les portes

**1. Un module qui lève une exception dès que l'élève valide une étape.**
`nombres_calculs/equations-et-inequations-2nde/modules/Module05QuotientEtValeurInterdite.jsx`
rend trois `<KnowledgeBrick>` (lignes 43, 62, 81) et ne l'importe pas (ligne 2). Les six autres
modules de la leçon l'importent : c'est un mot oublié. Conséquence : `ReferenceError` au moment
exact où la brique devrait se poser, et les trois connaissances du quotient
(`valeur-interdite`, `quotient-nul`, `methode-choisir-methode`) ne peuvent structurellement
jamais exister — alors que l'épreuve `eq-e9` du test final les déclare en `requires`.

*Pourquoi rien ne l'a vu :* `validate:lessons`, `audit:knowledge:gate` et le build ne regardent
pas les identifiants libres d'un module ; et la fumée navigateur charge la page sans valider
d'étape, or la brique est derrière une révélation conditionnée. Un contrôle
`MISSING_KIT_IMPORT` a été ajouté à `scripts/lib/moduleFacts.mjs` pendant cet audit : c'est le
**seul** cas sur les 27 leçons.

**2. Une réponse juste refusée par une erreur de flottant.**
`nombres_calculs/ensembles-et-intervalles-2nde/components/IntervalBuilder.jsx:58` — `bump()`
recompose la borne par `Math.round((cur + d*s)/s)*s` sans arrondi final. Au pas 0,1, quatre
appuis donnent `1.4000000000000001`, et `sameInterval` compare en `===`. L'élève lit alors
« Ta construction : ]1,4 ; 1,9[ » et « Il fallait : ]1,4 ; 1,9[ » — deux chaînes identiques,
dont l'une est déclarée fausse, parce que `formatDec` masque la dérive. Le chemin par glissement
arrondit, lui : aucun test e2e qui glisse ne peut rencontrer ce défaut.

### Ce que les portes ne mesurent pas

- `npm run check:lessons` exécute `validate:lessons` **sans `--strict`** : la couverture des LP
  n'est donc pas gardée par la chaîne par défaut (elle passe, vérifié).
- `requires` n'a **aucun effet à l'exécution** (`common/kit/questions.jsx:36,96,195`) : c'est un
  contrat d'audit. Une leçon peut déclarer des dépendances parfaites et n'en honorer aucune.
- `check:level-leak` ne couvre que la 6e ; `gen-curriculum-matrix.mjs` est câblé sur 5e/4e.
  Aucun des deux ne regarde la Seconde.
- La fumée navigateur ne valide aucune étape : elle prouve qu'une page se monte, pas qu'un
  parcours se termine.

### Correctifs mécaniques appliqués (§10) et défauts laissés à la Session 2

Les laboratoires **gelés après validation** (`disabled={doneN}`) touchent les 7 modules de
`vecteurs-2nde`, plusieurs de `equations-de-droites-2nde` et `valeur-absolue-distance-2nde` M4 :
l'élève perd l'instrument au moment précis où il vient de comprendre. La classe de bug et son
correctif sont déjà documentés dans le dépôt. Réparation en Session 2, avec les deux défauts
fonctionnels ci-dessus.
<!-- END SECTION: technical-analysis -->

<!-- BEGIN GENERATED: technical-flags -->
| Leçon | Signalement | Détail |
| --- | --- | --- |
| `fonctions-en-python-2nde` | NO_SPEC | aucun docs/lessons/*_SPEC.md |
| `fonctions-en-python-2nde` | NO_E2E | aucune suite apps/web/e2e/lesson-kit/ |
| `fonctions-en-python-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `variables-et-instructions-2nde` | NO_SPEC | aucun docs/lessons/*_SPEC.md |
| `variables-et-instructions-2nde` | NO_E2E | aucune suite apps/web/e2e/lesson-kit/ |
| `variables-et-instructions-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `trigonometrie-cercle-2nde` | NO_SPEC | aucun docs/lessons/*_SPEC.md |
| `trigonometrie-cercle-2nde` | NO_E2E | aucune suite apps/web/e2e/lesson-kit/ |
| `trigonometrie-cercle-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `trigonometrie-equations-2nde` | NO_SPEC | aucun docs/lessons/*_SPEC.md |
| `trigonometrie-equations-2nde` | NO_E2E | aucune suite apps/web/e2e/lesson-kit/ |
| `trigonometrie-equations-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `arbres-probabilites-2nde` | MAPPED_STEPS | M5 |
| `arbres-probabilites-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `boites-a-moustaches-2nde` | NO_E2E | aucune suite apps/web/e2e/lesson-kit/ |
| `boites-a-moustaches-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `evolutions-successives-reciproques-2nde` | NO_E2E | aucune suite apps/web/e2e/lesson-kit/ |
| `evolutions-successives-reciproques-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `frequences-conditionnelles-2nde` | NO_E2E | aucune suite apps/web/e2e/lesson-kit/ |
| `frequences-conditionnelles-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `loi-grands-nombres-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `probabilites-conditionnelles-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `proportions-pourcentages-2nde` | NO_E2E | aucune suite apps/web/e2e/lesson-kit/ |
| `proportions-pourcentages-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `series-regroupees-classes-2nde` | NO_E2E | aucune suite apps/web/e2e/lesson-kit/ |
| `series-regroupees-classes-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `statistiques-une-variable-2nde` | NO_E2E | aucune suite apps/web/e2e/lesson-kit/ |
| `statistiques-une-variable-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `tableaux-croises-2nde` | NO_E2E | aucune suite apps/web/e2e/lesson-kit/ |
| `tableaux-croises-2nde` | NO_LEARNING_POINTS_MIRROR |  |
| `tests-diagnostiques-probabilites-2nde` | MAPPED_STEPS | M5 |
| `tests-diagnostiques-probabilites-2nde` | NO_LEARNING_POINTS_MIRROR |  |
<!-- END GENERATED: technical-flags -->

---

## 6. Vérification navigateur

<!-- BEGIN GENERATED: smoke-summary -->
_Fumée navigateur non exécutée pour ce rendu._
<!-- END GENERATED: smoke-summary -->

---

## 7. Inventaire canonique des learning points

<!-- BEGIN GENERATED: lp-inventory -->
| LP | Leçon | Objet officiel | Intitulé |
| --- | --- | --- | --- |
| `seconde_fonctions-en-python-2nde_P1` | `fonctions-en-python-2nde` | `fonctions_en_python` | Définir une fonction en Python |
| `seconde_fonctions-en-python-2nde_P2` | `fonctions-en-python-2nde` | `fonctions_en_python` | Utiliser une fonction avec un argument |
| `seconde_fonctions-en-python-2nde_P3` | `fonctions-en-python-2nde` | `fonctions_en_python` | Utiliser une fonction avec plusieurs arguments |
| `seconde_fonctions-en-python-2nde_P4` | `fonctions-en-python-2nde` | `fonctions_en_python` | Appeler une fonction |
| `seconde_fonctions-en-python-2nde_P5` | `fonctions-en-python-2nde` | `fonctions_en_python` | Lire une fonction existante |
| `seconde_fonctions-en-python-2nde_P6` | `fonctions-en-python-2nde` | `fonctions_en_python` | Modifier une fonction |
| `seconde_fonctions-en-python-2nde_P7` | `fonctions-en-python-2nde` | `fonctions_en_python` | Compléter une fonction |
| `seconde_fonctions-en-python-2nde_P8` | `fonctions-en-python-2nde` | `fonctions_en_python` | Écrire une fonction réalisant un calcul |
| `seconde_fonctions-en-python-2nde_P9` | `fonctions-en-python-2nde` | `fonctions_en_python` | Utiliser une fonction renvoyant un nombre aléatoire |
| `seconde_fonctions-en-python-2nde_P10` | `fonctions-en-python-2nde` | `fonctions_en_python` | Répéter une fonction pour produire une série statistique |
| `seconde_fonctions-en-python-2nde_P11` | `fonctions-en-python-2nde` | `fonctions_en_python` | Simuler une expérience aléatoire |
| `seconde_fonctions-en-python-2nde_P12` | `fonctions-en-python-2nde` | `fonctions_en_python` | Vérifier les résultats d'un programme |
| `seconde_variables-et-instructions-2nde_P1` | `variables-et-instructions-2nde` | `variables_et_instructions` | Comprendre la notion de variable informatique |
| `seconde_variables-et-instructions-2nde_P2` | `variables-et-instructions-2nde` | `variables_et_instructions` | Identifier les types entier, flottant, booléen et chaîne |
| `seconde_variables-et-instructions-2nde_P3` | `variables-et-instructions-2nde` | `variables_et_instructions` | Utiliser une affectation |
| `seconde_variables-et-instructions-2nde_P4` | `variables-et-instructions-2nde` | `variables_et_instructions` | Écrire une séquence d'instructions |
| `seconde_variables-et-instructions-2nde_P5` | `variables-et-instructions-2nde` | `variables_et_instructions` | Utiliser une instruction conditionnelle |
| `seconde_variables-et-instructions-2nde_P6` | `variables-et-instructions-2nde` | `variables_et_instructions` | Utiliser une boucle for |
| `seconde_variables-et-instructions-2nde_P7` | `variables-et-instructions-2nde` | `variables_et_instructions` | Utiliser une boucle while |
| `seconde_variables-et-instructions-2nde_P8` | `variables-et-instructions-2nde` | `variables_et_instructions` | Écrire une formule avec des variables |
| `seconde_variables-et-instructions-2nde_P9` | `variables-et-instructions-2nde` | `variables_et_instructions` | Lire un algorithme |
| `seconde_variables-et-instructions-2nde_P10` | `variables-et-instructions-2nde` | `variables_et_instructions` | Modifier un algorithme |
| `seconde_variables-et-instructions-2nde_P11` | `variables-et-instructions-2nde` | `variables_et_instructions` | Compléter un algorithme |
| `seconde_variables-et-instructions-2nde_P12` | `variables-et-instructions-2nde` | `variables_et_instructions` | Vérifier le fonctionnement d'un programme |
| `seconde_fonction-affine-2nde_P1` | `fonction-affine-2nde` | `fonction_affine` | Reconnaître une fonction affine |
| `seconde_fonction-affine-2nde_P2` | `fonction-affine-2nde` | `fonction_affine` | Identifier le coefficient directeur |
| `seconde_fonction-affine-2nde_P3` | `fonction-affine-2nde` | `fonction_affine` | Identifier l'ordonnée à l'origine |
| `seconde_fonction-affine-2nde_P4` | `fonction-affine-2nde` | `fonction_affine` | Interpréter le coefficient directeur comme un taux d'accroissement |
| `seconde_fonction-affine-2nde_P5` | `fonction-affine-2nde` | `fonction_affine` | Relier le signe du coefficient directeur aux variations |
| `seconde_fonction-affine-2nde_P6` | `fonction-affine-2nde` | `fonction_affine` | Déterminer une fonction affine à partir de données |
| `seconde_fonction-affine-2nde_P7` | `fonction-affine-2nde` | `fonction_affine` | Lire le coefficient directeur sur un graphique |
| `seconde_fonction-affine-2nde_P8` | `fonction-affine-2nde` | `fonction_affine` | Lire l'ordonnée à l'origine |
| `seconde_fonction-affine-2nde_P9` | `fonction-affine-2nde` | `fonction_affine` | Étudier le signe d'une fonction affine |
| `seconde_fonction-affine-2nde_P10` | `fonction-affine-2nde` | `fonction_affine` | Résoudre une équation avec une fonction affine |
| `seconde_fonction-affine-2nde_P11` | `fonction-affine-2nde` | `fonction_affine` | Résoudre une inéquation avec une fonction affine |
| `seconde_fonctions-2nde_P1` | `fonctions-2nde` | `fonctions` | Comprendre une fonction comme une relation de dépendance |
| `seconde_fonctions-2nde_P2` | `fonctions-2nde` | `fonctions` | Identifier la variable |
| `seconde_fonctions-2nde_P3` | `fonctions-2nde` | `fonctions` | Déterminer l'ensemble de définition |
| `seconde_fonctions-2nde_P4` | `fonctions-2nde` | `fonctions` | Calculer une image |
| `seconde_fonctions-2nde_P5` | `fonctions-2nde` | `fonctions` | Déterminer un antécédent |
| `seconde_fonctions-2nde_P6` | `fonctions-2nde` | `fonctions` | Lire une fonction dans un tableau |
| `seconde_fonctions-2nde_P7` | `fonctions-2nde` | `fonctions` | Lire une fonction sur un graphique |
| `seconde_fonctions-2nde_P8` | `fonctions-2nde` | `fonctions` | Lire une fonction à partir d'une expression |
| `seconde_fonctions-2nde_P9` | `fonctions-2nde` | `fonctions` | Passer d'un registre de représentation à un autre |
| `seconde_fonctions-2nde_P10` | `fonctions-2nde` | `fonctions` | Modéliser une situation avec une fonction |
| `seconde_fonctions-2nde_P11` | `fonctions-2nde` | `fonctions` | Utiliser une fonction définie sur un intervalle |
| `seconde_fonctions-2nde_P12` | `fonctions-2nde` | `fonctions` | Utiliser une fonction définie sur une réunion d'intervalles |
| `seconde_fonctions-de-reference-2nde_P1` | `fonctions-de-reference-2nde` | `fonctions_de_reference` | Reconnaître la fonction valeur absolue |
| `seconde_fonctions-de-reference-2nde_P2` | `fonctions-de-reference-2nde` | `fonctions_de_reference` | Étudier la fonction carré |
| `seconde_fonctions-de-reference-2nde_P3` | `fonctions-de-reference-2nde` | `fonctions_de_reference` | Étudier la fonction inverse |
| `seconde_fonctions-de-reference-2nde_P4` | `fonctions-de-reference-2nde` | `fonctions_de_reference` | Connaître leurs expressions |
| `seconde_fonctions-de-reference-2nde_P5` | `fonctions-de-reference-2nde` | `fonctions_de_reference` | Construire un tableau de valeurs |
| `seconde_fonctions-de-reference-2nde_P6` | `fonctions-de-reference-2nde` | `fonctions_de_reference` | Représenter graphiquement une fonction de référence |
| `seconde_fonctions-de-reference-2nde_P7` | `fonctions-de-reference-2nde` | `fonctions_de_reference` | Identifier les caractéristiques d'une courbe |
| `seconde_fonctions-de-reference-2nde_P8` | `fonctions-de-reference-2nde` | `fonctions_de_reference` | Comparer les courbes de fonctions de référence |
| `seconde_fonctions-de-reference-2nde_P9` | `fonctions-de-reference-2nde` | `fonctions_de_reference` | Déterminer une image graphiquement |
| `seconde_fonctions-de-reference-2nde_P10` | `fonctions-de-reference-2nde` | `fonctions_de_reference` | Déterminer un antécédent graphiquement |
| `seconde_fonctions-de-reference-2nde_P11` | `fonctions-de-reference-2nde` | `fonctions_de_reference` | Utiliser une fonction de référence pour modéliser une situation |
| `seconde_signe-fonctions-2nde_P1` | `signe-fonctions-2nde` | `signe_fonctions` | Déterminer le signe d'une fonction |
| `seconde_signe-fonctions-2nde_P2` | `signe-fonctions-2nde` | `signe_fonctions` | Interpréter le signe graphiquement |
| `seconde_signe-fonctions-2nde_P3` | `signe-fonctions-2nde` | `signe_fonctions` | Déterminer les zéros d'une fonction |
| `seconde_signe-fonctions-2nde_P4` | `signe-fonctions-2nde` | `signe_fonctions` | Construire un tableau de signes |
| `seconde_signe-fonctions-2nde_P5` | `signe-fonctions-2nde` | `signe_fonctions` | Étudier le signe d'une fonction affine |
| `seconde_signe-fonctions-2nde_P6` | `signe-fonctions-2nde` | `signe_fonctions` | Étudier le signe d'un produit |
| `seconde_signe-fonctions-2nde_P7` | `signe-fonctions-2nde` | `signe_fonctions` | Étudier le signe d'un quotient |
| `seconde_signe-fonctions-2nde_P8` | `signe-fonctions-2nde` | `signe_fonctions` | Utiliser un tableau de signes pour résoudre une inéquation |
| `seconde_signe-fonctions-2nde_P9` | `signe-fonctions-2nde` | `signe_fonctions` | Résoudre f(x)=0 |
| `seconde_signe-fonctions-2nde_P10` | `signe-fonctions-2nde` | `signe_fonctions` | Résoudre f(x)>0 |
| `seconde_signe-fonctions-2nde_P11` | `signe-fonctions-2nde` | `signe_fonctions` | Résoudre f(x)<0 |
| `seconde_signe-fonctions-2nde_P12` | `signe-fonctions-2nde` | `signe_fonctions` | Vérifier graphiquement une résolution |
| `seconde_variations-extremums-2nde_P1` | `variations-extremums-2nde` | `variations_et_extremums` | Comprendre la croissance d'une fonction |
| `seconde_variations-extremums-2nde_P2` | `variations-extremums-2nde` | `variations_et_extremums` | Comprendre la décroissance d'une fonction |
| `seconde_variations-extremums-2nde_P3` | `variations-extremums-2nde` | `variations_et_extremums` | Comprendre la monotonie |
| `seconde_variations-extremums-2nde_P4` | `variations-extremums-2nde` | `variations_et_extremums` | Lire les variations sur un graphique |
| `seconde_variations-extremums-2nde_P5` | `variations-extremums-2nde` | `variations_et_extremums` | Construire un tableau de variations |
| `seconde_variations-extremums-2nde_P6` | `variations-extremums-2nde` | `variations_et_extremums` | Lire un tableau de variations |
| `seconde_variations-extremums-2nde_P7` | `variations-extremums-2nde` | `variations_et_extremums` | Déterminer un maximum |
| `seconde_variations-extremums-2nde_P8` | `variations-extremums-2nde` | `variations_et_extremums` | Déterminer un minimum |
| `seconde_variations-extremums-2nde_P9` | `variations-extremums-2nde` | `variations_et_extremums` | Déterminer un extremum sur un intervalle |
| `seconde_variations-extremums-2nde_P10` | `variations-extremums-2nde` | `variations_et_extremums` | Relier graphique et tableau de variations |
| `seconde_variations-extremums-2nde_P11` | `variations-extremums-2nde` | `variations_et_extremums` | Comparer f(a) et f(b) |
| `seconde_variations-extremums-2nde_P12` | `variations-extremums-2nde` | `variations_et_extremums` | Résoudre un problème d'optimisation |
| `seconde_colinearite-alignement-2nde_P1` | `colinearite-alignement-2nde` | `colinearite_et_alignement` | Comprendre la colinéarité |
| `seconde_colinearite-alignement-2nde_P2` | `colinearite-alignement-2nde` | `colinearite_et_alignement` | Reconnaître deux vecteurs colinéaires |
| `seconde_colinearite-alignement-2nde_P3` | `colinearite-alignement-2nde` | `colinearite_et_alignement` | Utiliser la proportionnalité des coordonnées |
| `seconde_colinearite-alignement-2nde_P4` | `colinearite-alignement-2nde` | `colinearite_et_alignement` | Calculer un déterminant |
| `seconde_colinearite-alignement-2nde_P5` | `colinearite-alignement-2nde` | `colinearite_et_alignement` | Utiliser le déterminant pour tester la colinéarité |
| `seconde_colinearite-alignement-2nde_P6` | `colinearite-alignement-2nde` | `colinearite_et_alignement` | Déterminer si trois points sont alignés |
| `seconde_colinearite-alignement-2nde_P7` | `colinearite-alignement-2nde` | `colinearite_et_alignement` | Déterminer si deux droites sont parallèles |
| `seconde_colinearite-alignement-2nde_P8` | `colinearite-alignement-2nde` | `colinearite_et_alignement` | Résoudre un problème d'alignement |
| `seconde_colinearite-alignement-2nde_P9` | `colinearite-alignement-2nde` | `colinearite_et_alignement` | Résoudre un problème de parallélisme |
| `seconde_equations-de-droites-2nde_P1` | `equations-de-droites-2nde` | `equations_de_droites` | Comprendre un vecteur directeur |
| `seconde_equations-de-droites-2nde_P2` | `equations-de-droites-2nde` | `equations_de_droites` | Identifier un vecteur directeur d'une droite |
| `seconde_equations-de-droites-2nde_P3` | `equations-de-droites-2nde` | `equations_de_droites` | Comprendre la pente d'une droite |
| `seconde_equations-de-droites-2nde_P4` | `equations-de-droites-2nde` | `equations_de_droites` | Calculer la pente d'une droite |
| `seconde_equations-de-droites-2nde_P5` | `equations-de-droites-2nde` | `equations_de_droites` | Déterminer une équation de droite à partir de deux points |
| `seconde_equations-de-droites-2nde_P6` | `equations-de-droites-2nde` | `equations_de_droites` | Déterminer une équation de droite à partir d'un point et d'un vecteur directeur |
| `seconde_equations-de-droites-2nde_P7` | `equations-de-droites-2nde` | `equations_de_droites` | Déterminer une équation de droite à partir d'un point et de la pente |
| `seconde_equations-de-droites-2nde_P8` | `equations-de-droites-2nde` | `equations_de_droites` | Comprendre l'équation réduite |
| `seconde_equations-de-droites-2nde_P9` | `equations-de-droites-2nde` | `equations_de_droites` | Comprendre l'équation cartésienne |
| `seconde_equations-de-droites-2nde_P10` | `equations-de-droites-2nde` | `equations_de_droites` | Tracer une droite à partir de son équation |
| `seconde_equations-de-droites-2nde_P11` | `equations-de-droites-2nde` | `equations_de_droites` | Déterminer si un point appartient à une droite |
| `seconde_equations-de-droites-2nde_P12` | `equations-de-droites-2nde` | `equations_de_droites` | Établir l'alignement de trois points |
| `seconde_positions-relatives-droites-2nde_P1` | `positions-relatives-droites-2nde` | `positions_relatives_droites` | Reconnaître deux droites parallèles |
| `seconde_positions-relatives-droites-2nde_P2` | `positions-relatives-droites-2nde` | `positions_relatives_droites` | Reconnaître deux droites sécantes |
| `seconde_positions-relatives-droites-2nde_P3` | `positions-relatives-droites-2nde` | `positions_relatives_droites` | Comparer les pentes de deux droites |
| `seconde_positions-relatives-droites-2nde_P4` | `positions-relatives-droites-2nde` | `positions_relatives_droites` | Utiliser les équations pour étudier le parallélisme |
| `seconde_positions-relatives-droites-2nde_P5` | `positions-relatives-droites-2nde` | `positions_relatives_droites` | Déterminer le point d'intersection de deux droites |
| `seconde_positions-relatives-droites-2nde_P6` | `positions-relatives-droites-2nde` | `positions_relatives_droites` | Résoudre un système associé à deux droites |
| `seconde_positions-relatives-droites-2nde_P7` | `positions-relatives-droites-2nde` | `positions_relatives_droites` | Interpréter graphiquement une intersection |
| `seconde_positions-relatives-droites-2nde_P8` | `positions-relatives-droites-2nde` | `positions_relatives_droites` | Résoudre un problème géométrique avec deux droites |
| `seconde_trigonometrie-cercle-2nde_P1` | `trigonometrie-cercle-2nde` | `null` | Comprendre le cercle trigonométrique |
| `seconde_trigonometrie-cercle-2nde_P2` | `trigonometrie-cercle-2nde` | `null` | Comprendre le radian comme mesure d'un angle par la longueur d'arc |
| `seconde_trigonometrie-cercle-2nde_P3` | `trigonometrie-cercle-2nde` | `null` | Convertir entre degrés et radians |
| `seconde_trigonometrie-cercle-2nde_P4` | `trigonometrie-cercle-2nde` | `null` | Associer un réel t à un point du cercle trigonométrique |
| `seconde_trigonometrie-cercle-2nde_P5` | `trigonometrie-cercle-2nde` | `null` | Déterminer les coordonnées d'un point du cercle trigonométrique |
| `seconde_trigonometrie-cercle-2nde_P6` | `trigonometrie-cercle-2nde` | `null` | Reconnaître le cosinus comme abscisse et le sinus comme ordonnée |
| `seconde_trigonometrie-cercle-2nde_P7` | `trigonometrie-cercle-2nde` | `null` | Connaître les valeurs remarquables du cosinus |
| `seconde_trigonometrie-cercle-2nde_P8` | `trigonometrie-cercle-2nde` | `null` | Connaître les valeurs remarquables du sinus |
| `seconde_trigonometrie-cercle-2nde_P9` | `trigonometrie-cercle-2nde` | `null` | Utiliser les valeurs remarquables pour placer un point |
| `seconde_trigonometrie-equations-2nde_P1` | `trigonometrie-equations-2nde` | `null` | Utiliser la relation cos²t + sin²t = 1 |
| `seconde_trigonometrie-equations-2nde_P2` | `trigonometrie-equations-2nde` | `null` | Utiliser les formules d'addition du cosinus et du sinus |
| `seconde_trigonometrie-equations-2nde_P3` | `trigonometrie-equations-2nde` | `null` | Résoudre une équation cos t = a sur un intervalle donné |
| `seconde_trigonometrie-equations-2nde_P4` | `trigonometrie-equations-2nde` | `null` | Résoudre une équation sin t = b sur un intervalle donné |
| `seconde_vecteurs-2nde_P1` | `vecteurs-2nde` | `vecteurs` | Comprendre l'égalité de deux vecteurs |
| `seconde_vecteurs-2nde_P2` | `vecteurs-2nde` | `vecteurs` | Identifier le vecteur nul |
| `seconde_vecteurs-2nde_P3` | `vecteurs-2nde` | `vecteurs` | Construire un représentant d'un vecteur |
| `seconde_vecteurs-2nde_P4` | `vecteurs-2nde` | `vecteurs` | Additionner deux vecteurs |
| `seconde_vecteurs-2nde_P5` | `vecteurs-2nde` | `vecteurs` | Multiplier un vecteur par un réel |
| `seconde_vecteurs-2nde_P6` | `vecteurs-2nde` | `vecteurs` | Reconnaître deux vecteurs colinéaires |
| `seconde_vecteurs-2nde_P7` | `vecteurs-2nde` | `vecteurs` | Utiliser une base orthonormée |
| `seconde_vecteurs-2nde_P8` | `vecteurs-2nde` | `vecteurs` | Lire les coordonnées d'un vecteur |
| `seconde_vecteurs-2nde_P9` | `vecteurs-2nde` | `vecteurs` | Calculer les coordonnées d'un vecteur |
| `seconde_vecteurs-2nde_P10` | `vecteurs-2nde` | `vecteurs` | Calculer la norme d'un vecteur |
| `seconde_vecteurs-2nde_P11` | `vecteurs-2nde` | `vecteurs` | Calculer les coordonnées du vecteur AB |
| `seconde_vecteurs-2nde_P12` | `vecteurs-2nde` | `vecteurs` | Calculer une distance entre deux points |
| `seconde_vecteurs-2nde_P13` | `vecteurs-2nde` | `vecteurs` | Calculer les coordonnées du milieu d'un segment |
| `seconde_vecteurs-2nde_P14` | `vecteurs-2nde` | `vecteurs` | Utiliser les vecteurs pour résoudre un problème |
| `seconde_arithmetique-2nde_P1` | `arithmetique-2nde` | `arithmetique` | Reconnaître et utiliser les multiples et diviseurs. |
| `seconde_arithmetique-2nde_P2` | `arithmetique-2nde` | `arithmetique` | Utiliser les propriétés de divisibilité. |
| `seconde_arithmetique-2nde_P3` | `arithmetique-2nde` | `arithmetique` | Raisonner sur les nombres entiers. |
| `seconde_arithmetique-2nde_P4` | `arithmetique-2nde` | `arithmetique` | Résoudre des problèmes faisant intervenir multiples et diviseurs. |
| `seconde_arithmetique-2nde_P5` | `arithmetique-2nde` | `arithmetique` | Utiliser les propriétés arithmétiques pour construire une démonstration. |
| `seconde_calcul-litteral-2nde_P1` | `calcul-litteral-2nde` | `calcul_litteral` | Identifier et manipuler une expression littérale. |
| `seconde_calcul-litteral-2nde_P2` | `calcul-litteral-2nde` | `calcul_litteral` | Réduire une expression. |
| `seconde_calcul-litteral-2nde_P3` | `calcul-litteral-2nde` | `calcul_litteral` | Développer une expression. |
| `seconde_calcul-litteral-2nde_P4` | `calcul-litteral-2nde` | `calcul_litteral` | Factoriser une expression. |
| `seconde_calcul-litteral-2nde_P5` | `calcul-litteral-2nde` | `calcul_litteral` | Choisir une forme développée ou factorisée selon le problème. |
| `seconde_calcul-litteral-2nde_P6` | `calcul-litteral-2nde` | `calcul_litteral` | Utiliser le calcul littéral pour démontrer ou résoudre. |
| `seconde_calcul-litteral-2nde_P7` | `calcul-litteral-2nde` | `calcul_litteral` | Utiliser les identités remarquables (a+b)², (a−b)² et (a+b)(a−b). |
| `seconde_calcul-litteral-2nde_P8` | `calcul-litteral-2nde` | `calcul_litteral` | Factoriser une expression de la forme ax² + bx. |
| `seconde_calcul-litteral-2nde_P9` | `calcul-litteral-2nde` | `calcul_litteral` | Effectuer des calculs avec des expressions fractionnaires simples. |
| `seconde_calcul-litteral-2nde_P10` | `calcul-litteral-2nde` | `calcul_litteral` | Vérifier une identité algébrique. |
| `seconde_ensembles-et-intervalles-2nde_P1` | `ensembles-et-intervalles-2nde` | `ensembles_et_intervalles` | Utiliser le langage des ensembles. |
| `seconde_ensembles-et-intervalles-2nde_P2` | `ensembles-et-intervalles-2nde` | `ensembles_et_intervalles` | Lire et représenter des intervalles. |
| `seconde_ensembles-et-intervalles-2nde_P3` | `ensembles-et-intervalles-2nde` | `ensembles_et_intervalles` | Décrire un ensemble de nombres à l’aide d’un intervalle. |
| `seconde_ensembles-et-intervalles-2nde_P4` | `ensembles-et-intervalles-2nde` | `ensembles_et_intervalles` | Interpréter les bornes et les différents types d’intervalles. |
| `seconde_ensembles-et-intervalles-2nde_P5` | `ensembles-et-intervalles-2nde` | `ensembles_et_intervalles` | Utiliser les intervalles pour résoudre des situations mathématiques. |
| `seconde_ensembles-et-intervalles-2nde_P6` | `ensembles-et-intervalles-2nde` | `ensembles_et_intervalles` | Comprendre l’appartenance à un ensemble et utiliser l’ensemble vide. |
| `seconde_ensembles-et-intervalles-2nde_P7` | `ensembles-et-intervalles-2nde` | `ensembles_et_intervalles` | Déterminer une réunion et une intersection d’ensembles. |
| `seconde_equations-et-inequations-2nde_P1` | `equations-et-inequations-2nde` | `equations_et_inequations` | Comprendre une équation comme une égalité à résoudre. |
| `seconde_equations-et-inequations-2nde_P2` | `equations-et-inequations-2nde` | `equations_et_inequations` | Résoudre une équation du premier degré. |
| `seconde_equations-et-inequations-2nde_P3` | `equations-et-inequations-2nde` | `equations_et_inequations` | Comprendre et résoudre une inéquation du premier degré. |
| `seconde_equations-et-inequations-2nde_P4` | `equations-et-inequations-2nde` | `equations_et_inequations` | Représenter l’ensemble des solutions sur une droite. |
| `seconde_equations-et-inequations-2nde_P5` | `equations-et-inequations-2nde` | `equations_et_inequations` | Résoudre des équations produit. |
| `seconde_equations-et-inequations-2nde_P6` | `equations-et-inequations-2nde` | `equations_et_inequations` | Résoudre des équations quotient avec les restrictions nécessaires. |
| `seconde_equations-et-inequations-2nde_P7` | `equations-et-inequations-2nde` | `equations_et_inequations` | Interpréter et vérifier les solutions. |
| `seconde_equations-et-inequations-2nde_P8` | `equations-et-inequations-2nde` | `equations_et_inequations` | Prendre en compte l’ensemble de définition d’une équation quotient. |
| `seconde_equations-et-inequations-2nde_P9` | `equations-et-inequations-2nde` | `equations_et_inequations` | Modéliser un problème par une équation ou une inéquation. |
| `seconde_equations-et-inequations-2nde_P10` | `equations-et-inequations-2nde` | `equations_et_inequations` | Vérifier une solution. |
| `seconde_logique-et-raisonnement-2nde_P1` | `logique-et-raisonnement-2nde` | `logique_et_raisonnement` | Construire et analyser une proposition mathématique. |
| `seconde_logique-et-raisonnement-2nde_P2` | `logique-et-raisonnement-2nde` | `logique_et_raisonnement` | Utiliser les connecteurs logiques. |
| `seconde_logique-et-raisonnement-2nde_P3` | `logique-et-raisonnement-2nde` | `logique_et_raisonnement` | Comprendre et utiliser l’implication. |
| `seconde_logique-et-raisonnement-2nde_P4` | `logique-et-raisonnement-2nde` | `logique_et_raisonnement` | Comprendre et utiliser l’équivalence. |
| `seconde_logique-et-raisonnement-2nde_P5` | `logique-et-raisonnement-2nde` | `logique_et_raisonnement` | Utiliser un contre-exemple pour réfuter une affirmation. |
| `seconde_logique-et-raisonnement-2nde_P6` | `logique-et-raisonnement-2nde` | `logique_et_raisonnement` | Raisonner par contradiction. |
| `seconde_logique-et-raisonnement-2nde_P7` | `logique-et-raisonnement-2nde` | `logique_et_raisonnement` | Utiliser des variables dans une proposition. |
| `seconde_logique-et-raisonnement-2nde_P8` | `logique-et-raisonnement-2nde` | `logique_et_raisonnement` | Formuler la réciproque d’une implication. |
| `seconde_logique-et-raisonnement-2nde_P9` | `logique-et-raisonnement-2nde` | `logique_et_raisonnement` | Utiliser une contraposée. |
| `seconde_logique-et-raisonnement-2nde_P10` | `logique-et-raisonnement-2nde` | `logique_et_raisonnement` | Comprendre les quantifications universelle et existentielle. |
| `seconde_logique-et-raisonnement-2nde_P11` | `logique-et-raisonnement-2nde` | `logique_et_raisonnement` | Raisonner par disjonction des cas. |
| `seconde_nombres-reels-2nde_P1` | `nombres-reels-2nde` | `nombres_reels` | Comprendre l’ensemble des nombres réels. |
| `seconde_nombres-reels-2nde_P2` | `nombres-reels-2nde` | `nombres_reels` | Représenter des nombres réels sur une droite graduée. |
| `seconde_nombres-reels-2nde_P3` | `nombres-reels-2nde` | `nombres_reels` | Distinguer nombres décimaux, rationnels et irrationnels. |
| `seconde_nombres-reels-2nde_P4` | `nombres-reels-2nde` | `nombres_reels` | Reconnaître et utiliser les écritures exactes et approchées. |
| `seconde_nombres-reels-2nde_P5` | `nombres-reels-2nde` | `nombres_reels` | Comparer et encadrer des nombres réels. |
| `seconde_nombres-reels-2nde_P6` | `nombres-reels-2nde` | `nombres_reels` | Choisir un arrondi adapté à une situation. |
| `seconde_valeur-absolue-distance-2nde_P1` | `valeur-absolue-distance-2nde` | `valeur_absolue_et_distance` | Interpréter la valeur absolue comme une distance à zéro. |
| `seconde_valeur-absolue-distance-2nde_P2` | `valeur-absolue-distance-2nde` | `valeur_absolue_et_distance` | Calculer la valeur absolue d’un nombre réel. |
| `seconde_valeur-absolue-distance-2nde_P3` | `valeur-absolue-distance-2nde` | `valeur_absolue_et_distance` | Interpréter la distance entre deux nombres réels. |
| `seconde_valeur-absolue-distance-2nde_P4` | `valeur-absolue-distance-2nde` | `valeur_absolue_et_distance` | Résoudre des situations utilisant des distances. |
| `seconde_valeur-absolue-distance-2nde_P5` | `valeur-absolue-distance-2nde` | `valeur_absolue_et_distance` | Relier distance, valeur absolue et intervalles. |
| `seconde_valeur-absolue-distance-2nde_P6` | `valeur-absolue-distance-2nde` | `valeur_absolue_et_distance` | Résoudre une inéquation de la forme \|x − a\| ≤ r. |
| `seconde_valeur-absolue-distance-2nde_P7` | `valeur-absolue-distance-2nde` | `valeur_absolue_et_distance` | Représenter graphiquement l’ensemble des solutions sur une droite. |
| `seconde_arbres-probabilites-2nde_P1` | `arbres-probabilites-2nde` | `arbres_de_probabilites` | Construire un arbre de probabilités |
| `seconde_arbres-probabilites-2nde_P2` | `arbres-probabilites-2nde` | `arbres_de_probabilites` | Lire un arbre pondéré |
| `seconde_arbres-probabilites-2nde_P3` | `arbres-probabilites-2nde` | `arbres_de_probabilites` | Interpréter la pondération d'une branche |
| `seconde_arbres-probabilites-2nde_P4` | `arbres-probabilites-2nde` | `arbres_de_probabilites` | Identifier une probabilité conditionnelle dans un arbre |
| `seconde_arbres-probabilites-2nde_P5` | `arbres-probabilites-2nde` | `arbres_de_probabilites` | Calculer la probabilité d'un chemin |
| `seconde_arbres-probabilites-2nde_P6` | `arbres-probabilites-2nde` | `arbres_de_probabilites` | Multiplier les probabilités des branches |
| `seconde_arbres-probabilites-2nde_P7` | `arbres-probabilites-2nde` | `arbres_de_probabilites` | Calculer la probabilité d'un événement |
| `seconde_arbres-probabilites-2nde_P8` | `arbres-probabilites-2nde` | `arbres_de_probabilites` | Additionner les probabilités de plusieurs chemins |
| `seconde_arbres-probabilites-2nde_P9` | `arbres-probabilites-2nde` | `arbres_de_probabilites` | Passer d'une situation réelle à un arbre |
| `seconde_arbres-probabilites-2nde_P10` | `arbres-probabilites-2nde` | `arbres_de_probabilites` | Passer d'un arbre à une situation en langage naturel |
| `seconde_boites-a-moustaches-2nde_P1` | `boites-a-moustaches-2nde` | `boites_a_moustaches` | Lire une boîte à moustaches |
| `seconde_boites-a-moustaches-2nde_P2` | `boites-a-moustaches-2nde` | `boites_a_moustaches` | Identifier médiane et quartiles |
| `seconde_boites-a-moustaches-2nde_P3` | `boites-a-moustaches-2nde` | `boites_a_moustaches` | Identifier l'étendue |
| `seconde_boites-a-moustaches-2nde_P4` | `boites-a-moustaches-2nde` | `boites_a_moustaches` | Comprendre la dispersion |
| `seconde_boites-a-moustaches-2nde_P5` | `boites-a-moustaches-2nde` | `boites_a_moustaches` | Comparer deux distributions |
| `seconde_boites-a-moustaches-2nde_P6` | `boites-a-moustaches-2nde` | `boites_a_moustaches` | Comparer des médianes |
| `seconde_boites-a-moustaches-2nde_P7` | `boites-a-moustaches-2nde` | `boites_a_moustaches` | Comparer des dispersions |
| `seconde_boites-a-moustaches-2nde_P8` | `boites-a-moustaches-2nde` | `boites_a_moustaches` | Choisir des indicateurs adaptés |
| `seconde_boites-a-moustaches-2nde_P9` | `boites-a-moustaches-2nde` | `boites_a_moustaches` | Interpréter une boîte à moustaches dans son contexte |
| `seconde_evolutions-successives-reciproques-2nde_P1` | `evolutions-successives-reciproques-2nde` | `evolutions_successives_reciproques` | Calculer une évolution successive |
| `seconde_evolutions-successives-reciproques-2nde_P2` | `evolutions-successives-reciproques-2nde` | `evolutions_successives_reciproques` | Composer des coefficients multiplicateurs |
| `seconde_evolutions-successives-reciproques-2nde_P3` | `evolutions-successives-reciproques-2nde` | `evolutions_successives_reciproques` | Calculer un taux d'évolution global |
| `seconde_evolutions-successives-reciproques-2nde_P4` | `evolutions-successives-reciproques-2nde` | `evolutions_successives_reciproques` | Comprendre qu'une succession de pourcentages ne s'additionne pas |
| `seconde_evolutions-successives-reciproques-2nde_P5` | `evolutions-successives-reciproques-2nde` | `evolutions_successives_reciproques` | Calculer une évolution réciproque |
| `seconde_evolutions-successives-reciproques-2nde_P6` | `evolutions-successives-reciproques-2nde` | `evolutions_successives_reciproques` | Déterminer le coefficient multiplicateur réciproque |
| `seconde_evolutions-successives-reciproques-2nde_P7` | `evolutions-successives-reciproques-2nde` | `evolutions_successives_reciproques` | Interpréter une évolution dans son contexte |
| `seconde_evolutions-successives-reciproques-2nde_P8` | `evolutions-successives-reciproques-2nde` | `evolutions_successives_reciproques` | Résoudre des problèmes d'évolution |
| `seconde_frequences-conditionnelles-2nde_P1` | `frequences-conditionnelles-2nde` | `frequences_conditionnelles` | Comprendre une fréquence conditionnelle |
| `seconde_frequences-conditionnelles-2nde_P2` | `frequences-conditionnelles-2nde` | `frequences_conditionnelles` | Calculer une fréquence conditionnelle |
| `seconde_frequences-conditionnelles-2nde_P3` | `frequences-conditionnelles-2nde` | `frequences_conditionnelles` | Comprendre une fréquence marginale |
| `seconde_frequences-conditionnelles-2nde_P4` | `frequences-conditionnelles-2nde` | `frequences_conditionnelles` | Calculer une fréquence marginale |
| `seconde_frequences-conditionnelles-2nde_P5` | `frequences-conditionnelles-2nde` | `frequences_conditionnelles` | Compléter un tableau croisé |
| `seconde_frequences-conditionnelles-2nde_P6` | `frequences-conditionnelles-2nde` | `frequences_conditionnelles` | Interpréter une fréquence conditionnelle |
| `seconde_frequences-conditionnelles-2nde_P7` | `frequences-conditionnelles-2nde` | `frequences_conditionnelles` | Comparer des sous-populations |
| `seconde_frequences-conditionnelles-2nde_P8` | `frequences-conditionnelles-2nde` | `frequences_conditionnelles` | Passer des effectifs aux fréquences |
| `seconde_frequences-conditionnelles-2nde_P9` | `frequences-conditionnelles-2nde` | `frequences_conditionnelles` | Passer des fréquences aux effectifs |
| `seconde_frequences-conditionnelles-2nde_P10` | `frequences-conditionnelles-2nde` | `frequences_conditionnelles` | Interpréter des données réelles |
| `seconde_loi-grands-nombres-2nde_P1` | `loi-grands-nombres-2nde` | `loi_des_grands_nombres` | Simuler une expérience aléatoire |
| `seconde_loi-grands-nombres-2nde_P2` | `loi-grands-nombres-2nde` | `loi_des_grands_nombres` | Répéter une expérience indépendante |
| `seconde_loi-grands-nombres-2nde_P3` | `loi-grands-nombres-2nde` | `loi_des_grands_nombres` | Calculer une fréquence observée |
| `seconde_loi-grands-nombres-2nde_P4` | `loi-grands-nombres-2nde` | `loi_des_grands_nombres` | Observer la fluctuation des fréquences |
| `seconde_loi-grands-nombres-2nde_P5` | `loi-grands-nombres-2nde` | `loi_des_grands_nombres` | Observer la stabilisation des fréquences |
| `seconde_loi-grands-nombres-2nde_P6` | `loi-grands-nombres-2nde` | `loi_des_grands_nombres` | Comprendre le lien entre fréquence et probabilité |
| `seconde_loi-grands-nombres-2nde_P7` | `loi-grands-nombres-2nde` | `loi_des_grands_nombres` | Distinguer modèle probabiliste et situation réelle |
| `seconde_loi-grands-nombres-2nde_P8` | `loi-grands-nombres-2nde` | `loi_des_grands_nombres` | Comprendre qu'une équiprobabilité est une hypothèse du modèle |
| `seconde_loi-grands-nombres-2nde_P9` | `loi-grands-nombres-2nde` | `loi_des_grands_nombres` | Utiliser une simulation Python ou tableur |
| `seconde_probabilites-conditionnelles-2nde_P1` | `probabilites-conditionnelles-2nde` | `probabilites_conditionnelles` | Comprendre une probabilité conditionnelle |
| `seconde_probabilites-conditionnelles-2nde_P2` | `probabilites-conditionnelles-2nde` | `probabilites_conditionnelles` | Interpréter 'sachant que' |
| `seconde_probabilites-conditionnelles-2nde_P3` | `probabilites-conditionnelles-2nde` | `probabilites_conditionnelles` | Calculer P_A(B) |
| `seconde_probabilites-conditionnelles-2nde_P4` | `probabilites-conditionnelles-2nde` | `probabilites_conditionnelles` | Calculer une probabilité conditionnelle à partir d'un tableau |
| `seconde_probabilites-conditionnelles-2nde_P5` | `probabilites-conditionnelles-2nde` | `probabilites_conditionnelles` | Calculer une probabilité conditionnelle dans une situation concrète |
| `seconde_probabilites-conditionnelles-2nde_P6` | `probabilites-conditionnelles-2nde` | `probabilites_conditionnelles` | Distinguer P_A(B) et P_B(A) |
| `seconde_probabilites-conditionnelles-2nde_P7` | `probabilites-conditionnelles-2nde` | `probabilites_conditionnelles` | Interpréter une probabilité conditionnelle |
| `seconde_probabilites-conditionnelles-2nde_P8` | `probabilites-conditionnelles-2nde` | `probabilites_conditionnelles` | Identifier une erreur d'inversion du conditionnement |
| `seconde_probabilites-conditionnelles-2nde_P9` | `probabilites-conditionnelles-2nde` | `probabilites_conditionnelles` | Relier probabilité conditionnelle et fréquence conditionnelle |
| `seconde_proportions-pourcentages-2nde_P1` | `proportions-pourcentages-2nde` | `proportions_et_pourcentages` | Calculer une proportion |
| `seconde_proportions-pourcentages-2nde_P2` | `proportions-pourcentages-2nde` | `proportions_et_pourcentages` | Exprimer une proportion sous forme décimale |
| `seconde_proportions-pourcentages-2nde_P3` | `proportions-pourcentages-2nde` | `proportions_et_pourcentages` | Exprimer une proportion sous forme fractionnaire |
| `seconde_proportions-pourcentages-2nde_P4` | `proportions-pourcentages-2nde` | `proportions_et_pourcentages` | Exprimer une proportion en pourcentage |
| `seconde_proportions-pourcentages-2nde_P5` | `proportions-pourcentages-2nde` | `proportions_et_pourcentages` | Calculer une proportion de proportion |
| `seconde_proportions-pourcentages-2nde_P6` | `proportions-pourcentages-2nde` | `proportions_et_pourcentages` | Interpréter un pourcentage de pourcentage |
| `seconde_proportions-pourcentages-2nde_P7` | `proportions-pourcentages-2nde` | `proportions_et_pourcentages` | Distinguer proportion et évolution |
| `seconde_proportions-pourcentages-2nde_P8` | `proportions-pourcentages-2nde` | `proportions_et_pourcentages` | Identifier une variation additive |
| `seconde_proportions-pourcentages-2nde_P9` | `proportions-pourcentages-2nde` | `proportions_et_pourcentages` | Identifier une variation multiplicative |
| `seconde_proportions-pourcentages-2nde_P10` | `proportions-pourcentages-2nde` | `proportions_et_pourcentages` | Utiliser un coefficient multiplicateur |
| `seconde_proportions-pourcentages-2nde_P11` | `proportions-pourcentages-2nde` | `proportions_et_pourcentages` | Passer d'un taux d'évolution à un coefficient multiplicateur |
| `seconde_series-regroupees-classes-2nde_P1` | `series-regroupees-classes-2nde` | `series_regroupees_classes` | Comprendre le regroupement en classes |
| `seconde_series-regroupees-classes-2nde_P2` | `series-regroupees-classes-2nde` | `series_regroupees_classes` | Identifier des classes de même amplitude |
| `seconde_series-regroupees-classes-2nde_P3` | `series-regroupees-classes-2nde` | `series_regroupees_classes` | Construire un histogramme |
| `seconde_series-regroupees-classes-2nde_P4` | `series-regroupees-classes-2nde` | `series_regroupees_classes` | Lire un histogramme |
| `seconde_series-regroupees-classes-2nde_P5` | `series-regroupees-classes-2nde` | `series_regroupees_classes` | Construire un polygone des fréquences cumulées |
| `seconde_series-regroupees-classes-2nde_P6` | `series-regroupees-classes-2nde` | `series_regroupees_classes` | Calculer une moyenne pondérée |
| `seconde_series-regroupees-classes-2nde_P7` | `series-regroupees-classes-2nde` | `series_regroupees_classes` | Estimer une moyenne à partir de classes |
| `seconde_series-regroupees-classes-2nde_P8` | `series-regroupees-classes-2nde` | `series_regroupees_classes` | Déterminer la classe médiane |
| `seconde_series-regroupees-classes-2nde_P9` | `series-regroupees-classes-2nde` | `series_regroupees_classes` | Estimer une médiane dans une classe |
| `seconde_series-regroupees-classes-2nde_P10` | `series-regroupees-classes-2nde` | `series_regroupees_classes` | Interpréter une série continue regroupée |
| `seconde_statistiques-une-variable-2nde_P1` | `statistiques-une-variable-2nde` | `statistiques_une_variable` | Lire une série statistique |
| `seconde_statistiques-une-variable-2nde_P2` | `statistiques-une-variable-2nde` | `statistiques_une_variable` | Calculer une moyenne |
| `seconde_statistiques-une-variable-2nde_P3` | `statistiques-une-variable-2nde` | `statistiques_une_variable` | Utiliser la linéarité de la moyenne |
| `seconde_statistiques-une-variable-2nde_P4` | `statistiques-une-variable-2nde` | `statistiques_une_variable` | Calculer une médiane |
| `seconde_statistiques-une-variable-2nde_P5` | `statistiques-une-variable-2nde` | `statistiques_une_variable` | Déterminer les quartiles |
| `seconde_statistiques-une-variable-2nde_P6` | `statistiques-une-variable-2nde` | `statistiques_une_variable` | Interpréter les indicateurs statistiques |
| `seconde_statistiques-une-variable-2nde_P7` | `statistiques-une-variable-2nde` | `statistiques_une_variable` | Comprendre l'écart type |
| `seconde_statistiques-une-variable-2nde_P8` | `statistiques-une-variable-2nde` | `statistiques_une_variable` | Calculer ou utiliser un écart type |
| `seconde_statistiques-une-variable-2nde_P9` | `statistiques-une-variable-2nde` | `statistiques_une_variable` | Interpréter la dispersion d'une série |
| `seconde_statistiques-une-variable-2nde_P10` | `statistiques-une-variable-2nde` | `statistiques_une_variable` | Étudier l'influence de l'ajout d'une valeur |
| `seconde_statistiques-une-variable-2nde_P11` | `statistiques-une-variable-2nde` | `statistiques_une_variable` | Étudier l'influence de la suppression d'une valeur |
| `seconde_statistiques-une-variable-2nde_P12` | `statistiques-une-variable-2nde` | `statistiques_une_variable` | Comparer deux séries statistiques |
| `seconde_tableaux-croises-2nde_P1` | `tableaux-croises-2nde` | `tableaux_croises` | Identifier deux variables qualitatives |
| `seconde_tableaux-croises-2nde_P2` | `tableaux-croises-2nde` | `tableaux_croises` | Identifier une variable nominale |
| `seconde_tableaux-croises-2nde_P3` | `tableaux-croises-2nde` | `tableaux_croises` | Identifier une variable ordinale |
| `seconde_tableaux-croises-2nde_P4` | `tableaux-croises-2nde` | `tableaux_croises` | Lire un fichier de données |
| `seconde_tableaux-croises-2nde_P5` | `tableaux-croises-2nde` | `tableaux_croises` | Filtrer une population |
| `seconde_tableaux-croises-2nde_P6` | `tableaux-croises-2nde` | `tableaux_croises` | Construire un tableau croisé d'effectifs |
| `seconde_tableaux-croises-2nde_P7` | `tableaux-croises-2nde` | `tableaux_croises` | Lire un tableau croisé |
| `seconde_tableaux-croises-2nde_P8` | `tableaux-croises-2nde` | `tableaux_croises` | Calculer des effectifs marginaux |
| `seconde_tableaux-croises-2nde_P9` | `tableaux-croises-2nde` | `tableaux_croises` | Interpréter les résultats d'un tableau croisé |
| `seconde_tableaux-croises-2nde_P10` | `tableaux-croises-2nde` | `tableaux_croises` | Utiliser ET, OU et NON pour filtrer des données |
| `seconde_tests-diagnostiques-probabilites-2nde_P1` | `tests-diagnostiques-probabilites-2nde` | `tests_diagnostiques` | Modéliser une situation de test diagnostique |
| `seconde_tests-diagnostiques-probabilites-2nde_P2` | `tests-diagnostiques-probabilites-2nde` | `tests_diagnostiques` | Identifier la population étudiée |
| `seconde_tests-diagnostiques-probabilites-2nde_P3` | `tests-diagnostiques-probabilites-2nde` | `tests_diagnostiques` | Identifier les événements pertinents |
| `seconde_tests-diagnostiques-probabilites-2nde_P4` | `tests-diagnostiques-probabilites-2nde` | `tests_diagnostiques` | Comprendre un faux positif |
| `seconde_tests-diagnostiques-probabilites-2nde_P5` | `tests-diagnostiques-probabilites-2nde` | `tests_diagnostiques` | Comprendre un faux négatif |
| `seconde_tests-diagnostiques-probabilites-2nde_P6` | `tests-diagnostiques-probabilites-2nde` | `tests_diagnostiques` | Comprendre la sensibilité d'un test |
| `seconde_tests-diagnostiques-probabilites-2nde_P7` | `tests-diagnostiques-probabilites-2nde` | `tests_diagnostiques` | Comprendre la spécificité d'un test |
| `seconde_tests-diagnostiques-probabilites-2nde_P8` | `tests-diagnostiques-probabilites-2nde` | `tests_diagnostiques` | Calculer une probabilité conditionnelle dans un test |
| `seconde_tests-diagnostiques-probabilites-2nde_P9` | `tests-diagnostiques-probabilites-2nde` | `tests_diagnostiques` | Interpréter correctement un résultat de test |
| `seconde_tests-diagnostiques-probabilites-2nde_P10` | `tests-diagnostiques-probabilites-2nde` | `tests_diagnostiques` | Éviter l'inversion des conditionnements |
| `seconde_tests-diagnostiques-probabilites-2nde_P11` | `tests-diagnostiques-probabilites-2nde` | `tests_diagnostiques` | Analyser une affirmation liée à un test |
<!-- END GENERATED: lp-inventory -->

---

## 8. Problèmes pédagogiques

<!-- BEGIN SECTION: pedagogical -->
Les jugements par leçon (`docs/audits/judgements/*.json`) citent chacun leur module, leur étape et
leur mécanisme. Quatre motifs reviennent assez souvent pour être structurels.

**1. La brique arrive après la demande.** L'ordre du source EST la ligne du temps : une brique
posée après la question qu'elle devrait fonder n'établit rien pour elle. Cas net :
`arithmetique-2nde` P4, où le PGCD est demandé par une `NumericQuestion` nue (84 × 126 → 42) et
la brique `pgcd` n'est révélée qu'ensuite ; aucun des trois laboratoires de la leçon n'explore
le côté « diviseurs », tous travaillent les multiples.

**2. Une technique enseignée par le texte seul.** `logique-et-raisonnement-2nde` pose
`contraposee` et `disjonction-cas` par des briques rendues sans condition, dans une leçon où tout
le reste se manipule ; `ImplicationLab` n'a pas de bascule vers la contraposée alors que
`not()` existe déjà dans `logicUtils`. La disjonction des cas n'est mesurée par aucune épreuve.

**3. Une compétence évaluée sans jamais avoir été enseignée.**
`colinearite-alignement-2nde` P9 (« résoudre un problème de parallélisme ») n'apparaît dans aucun
module : sa seule épreuve, `col-e9`, fournit les quatre vecteurs déjà calculés et emploie
« trapèze » et « parallélogramme », deux termes qu'aucune brique n'établit. L'élève les découvre
pendant son évaluation.

**4. Le laboratoire se fige à l'instant de la compréhension.** `disabled={doneN}` sur un
composant de manipulation retire l'instrument dès que l'étape est validée. Le cas le plus parlant
est `ScaleLab` (`vecteurs-2nde` M5) : il se fige exactement quand la règle générale
`k·(x ; y) = (kx ; ky)` vient d'être énoncée, donc au moment où l'élève voudrait la mettre à
l'épreuve. Le dépôt sait déjà réparer cette classe : deux leçons de géométrie s'en abstiennent
explicitement.

### Positionnement vertical

Chaque jugement porte un bloc `verticalPositioning` (révisé / étendu / nouveau / formalisé /
outil). Deux constats dépassent la leçon :

- `vecteurs-2nde` M3 **n'est pas un déclencheur** pour un élève venant de la 3e : il réenseigne
  comme neuf ce que `translations-vecteurs-3e` M5 a déjà enseigné, avec les mêmes briques.
- `loi-grands-nombres-2nde` repose sur la « stabilisation des fréquences », qui est déjà un
  `pointsToLearn` de `3e_probabilites`. Ce que la 2de ajoute réellement — la distinction
  modèle / réalité, l'équiprobabilité comme hypothèse — mérite d'être ce que le déclencheur met
  en avant.
<!-- END SECTION: pedagogical -->

---

## 9. Architecture recommandée

<!-- BEGIN SECTION: architecture -->
### 9.1 Mesurer ce qui est déjà enseigné (LP appendus)

41 items du programme officiel n'ont pas de learning point, et la plupart sont enseignés. Comme
`learningPoints[].id` dérive de l'ORDRE de `pointsToLearn` et devient append-only dès l'import
(`LEARNING_ARCHITECTURE.md:26-31`), la seule opération sûre est d'**ajouter en fin de liste** :
un LP appendu prend `P<n+1>` et ne déplace le sens d'aucun identifiant existant. Jamais de
réordonnancement, jamais d'insertion au milieu.

Priorité (enseigné, manipulé, non mesuré) : `|x − a| ≤ r` et `|x − a| = r`
(`valeur-absolue-distance-2nde`, manipulation `BeamLine` complète), l'arrondi adapté
(`nombres-reels-2nde`), les trois identités remarquables et « vérifier une identité »
(`calcul-litteral-2nde`), la contraposée / la réciproque / la disjonction des cas
(`logique-et-raisonnement-2nde`), la réunion, l'intersection et l'ensemble vide
(`ensembles-et-intervalles-2nde`).

Puis chaque LP appendu a besoin d'une épreuve : `validate:lessons --strict` l'exige, et c'est
précisément le point — un LP sans question ne produit aucune preuve.

### 9.2 Rétablir la densité de preuve

Le test final compte 10 épreuves partout. Pour les leçons à 11–14 LP, cela force le partage :
69 LP n'ont pour toute preuve qu'une question partagée. Deux voies, non exclusives :
porter le test final à 12–14 épreuves quand la leçon a plus de 10 LP, et **vérifier que chaque
question partagée mesure réellement ses deux LP** — l'audit de `vecteurs-2nde` en donne le
critère : `vec-e8` est légitime (les deux résultats sont dans la même option, une demi-maîtrise
ne passe pas), `vec-e2` ne l'est pas (comptée pour « additionner deux vecteurs » sans qu'aucune
addition soit faite).

### 9.3 Les objets d'extension (hors référentiel)

Le mécanisme, à implémenter en Session 3 : dans chaque domaine de
`smarter_academy_programmes_maths_2026.json`, un tableau frère `extension_objects[]` portant
`origin: "extension"`, `source: "smarter_academy"`, `status`, `rationale`,
`relatedOfficialObjects[]`, `externalLearningPoints[]` et un `teachingScope`.
`buildChaptersForGrade` itère les objets officiels PUIS les extensions ; `buildLesson` expose
`origin` et `extensionObject`, et chaque learning point porte le sien. Pour un point isolé
(orthogonalité par coordonnées, indépendance), pas de leçon : un
`smaMetadata[clé].extensionPointsToLearn[]` concaténé APRÈS `pointsToLearn`, ce qui reste
append-only. Côté élève, `LessonCard.jsx` marque « HORS PROGRAMME ». Une règle de
`generation_rules` doit interdire qu'une extension soit jamais présentée comme officielle.
Tests à étendre : `coursesData.test.js` (tout objet a un `origin`, une extension n'a pas
d'`officialObject`) et `learningPoints.test.js` (les points d'extension viennent en dernier).

### 9.4 Réparer en amont plutôt que compenser en 2de

Les quartiles et le mode ne doivent pas être « rattrapés » discrètement par les leçons de 2de qui
les supposent : le programme officiel de 3e les inclut, c'est la leçon de 3e qu'il faut compléter.
De même, les coordonnées de vecteurs sont hors périmètre officiel en 3e : c'est le catalogue de 3e
qu'il faut aligner, après quoi `vecteurs-2nde` M3 redevient un vrai déclencheur.
<!-- END SECTION: architecture -->

---

## 10. Plan de génération

<!-- BEGIN SECTION: generation-plan -->
Ordre par dépendance, pas par numéro de chapitre.

| # | Leçon | Domaine | Origine | Dépend de | Effort |
| ---: | --- | --- | --- | --- | --- |
| 1 | `variables-et-instructions-2nde` | algorithmique_programmation | officiel (`coming_soon`, 12 LP déjà au catalogue) | — | leçon complète |
| 2 | `fonctions-en-python-2nde` | algorithmique_programmation | officiel (`coming_soon`, 12 LP) | 1, et `loi-grands-nombres-2nde` (simulation) | leçon complète |
| 3 | `second-degre-elementaire-2nde` | fonctions | extension | `fonctions-de-reference-2nde`, `signe-fonctions-2nde` | leçon complète, Δ exclu |
| 4 | `fonctions-cube-racine-2nde` | fonctions | extension | `fonctions-de-reference-2nde` | leçon complète |
| 5 | `fractions-algebriques-2nde` | nombres_calculs | extension | `calcul-litteral-2nde` | leçon complète |
| 6 | `trigonometrie-cercle-2nde` | geometrie | extension | `vecteurs-2nde` (repérage), 3e trigonométrie | leçon complète, la plus lourde |
| 7 | `geometrie-espace-positions-2nde` | geometrie | extension | 3e `representation-espace-3e` | leçon complète |
| 8 | `geometrie-espace-volumes-coordonnees-2nde` | geometrie | extension | 7, 4e volumes | leçon complète |
| 9 | `variations-operations-2nde` | fonctions | extension | `variations-extremums-2nde` | leçon complète |

Les deux points d'extension (orthogonalité par coordonnées sur
`positions-relatives-droites-2nde`, indépendance sur `probabilites-conditionnelles-2nde`)
s'ajoutent aux leçons existantes, pas au plan ci-dessus.

**Les deux leçons d'algorithmique passent en premier** : elles sont officielles, leurs 24 learning
points sont déjà au catalogue, et elles sont les seules du programme 2026 à n'avoir aucune
implémentation. Toute extension passe après ce qui est officiellement dû.
<!-- END SECTION: generation-plan -->

---

## 11. Correctifs appliqués en Session 1

<!-- BEGIN SECTION: fixes -->
| Correctif | Fichiers | Vérifié comment |
| --- | --- | --- |
| 10 durées catalogue alignées sur la somme des modules | `packages/core/curriculum/coursesData.js` | `audit:2de` → 0 dérive ; `npx vitest run` (packages/core) 157/157 |
| 7 `estimatedDurationMin` de configuration alignés | `apps/web/src/lessons/lycee/seconde/*/*/lesson.config.js` | idem, + `validate:lessons` sans avertissement |
| 6 specs mises à jour (durée et titre de section) | `docs/lessons/2NDE_*_SPEC.md` | relecture ligne à ligne |
| 5 fichiers de réexport supprimés, import redirigé vers `common/knowledge` | `equations-de-droites-2nde/components/`, `modules/Module07…jsx:5`, `knowledge.jsx` | aucune référence résiduelle (grep) ; `vitest --root apps/web` 3065/3065 |
| 16 copies de `PredictionChips` supprimées, 38 modules repliés sur l'import du kit | `apps/web/src/lessons/lycee/seconde/**` | `npm run build` ✓ ; fumée 466/466 |
| Base MySQL resynchronisée | — | `smarter:validate-curriculum` → « No drift » |

**Défauts trouvés et NON corrigés** (hors périmètre « correctifs mécaniques », voir §5) :
l'import manquant de `KnowledgeBrick`, l'erreur de flottant d'`IntervalBuilder`, les laboratoires
gelés. Ils ouvrent la Session 2.

### Outillage ajouté

- `scripts/audit-2de-learning-points.mjs` (+ `npm run audit:2de`) : extrait la matrice, fusionne
  les jugements humains sans jamais les écraser, injecte les blocs générés de ce document.
- `scripts/lib/assessmentQuestions.mjs`, `scripts/lib/moduleFacts.mjs` — dont le contrôle
  `MISSING_KIT_IMPORT`, né du défaut n°1.
- `apps/web/e2e/_2de-smoke.mjs` : les 466 pages de la 2de, deux formats.
- 13 tests sur fixture (`scripts/audit/__fixtures__/2de/`), dont la validation de tous les
  fichiers de jugement — deux étaient arrivés avec une erreur de syntaxe JSON.
<!-- END SECTION: fixes -->

---

## 11bis. Correctifs appliqués en Session 2 (2026-09-09)

| Correctif | Fichiers | Vérifié comment |
| --- | --- | --- |
| `id="app-header"` restauré sur les deux coquilles — il n'avait JAMAIS été commité, alors que `KNOWLEDGE_MAP.md` le décrit comme l'ancre du viewport ; le tiroir s'ouvrait sous la barre fixe, bouton « Fermer » recouvert | `components/navigation/Navbar.jsx`, `components/student/StudentNavbar.jsx` | mesuré au navigateur : tiroir à y = 0 avant, y = 64 après ; `2nde-vecteurs-carte` 64/64 |
| 29 suites e2e réalignées sur `chromeTop()` (le calcul de `useLessonViewport`) au lieu de supposer un header | `apps/web/e2e/lesson-kit/*` | les 29 suites s'exécutent et passent |
| Module 5 d'équations : `KnowledgeBrick` rendu sans import → `ReferenceError` à chaque validation d'étape ; les 3 briques du quotient ne pouvaient jamais être posées | `Module05QuotientEtValeurInterdite.jsx` | carte 20 → 21 items, contrat 0E, suites 52/52 et 58/58 |
| `IntervalBuilder` : réponse juste refusée (1.4000000000000001 ≠ 1,4) | `components/IntervalBuilder.jsx`, `intervalUtils.test.js` | 4 tests verrouillent le scénario exact de l'élève |
| 24 laboratoires dégelés (`disabled={doneN}` sur une manipulation) | 13 modules, 12 composants | 0 gel restant ; 5 suites vertes |
| « Revoir le module » renvoyait au test final lui-même (7 cas en 2nde, 1 en 6e `fractions`) | 6 boss de 2nde + `Module10BossFinal.jsx` | garde ajoutée à `validate-lessons` : un `SKILLS[*].module` d'étape `evaluation` est une erreur |
| 3 défauts du composant de dessin PARTAGÉ : étiquette hors cadre, noms de courbes superposés, collision à l'origine | `common/knowledge/knowledgeVisuals.jsx` | audit de collisions vert sur fonctions, fonctions-reference, signe-fonctions |
| 5 questions qui ne mesuraient rien (distracteur = bonne réponse, un seul dessin pour « quel dessin ? », valeur citée mais absente, option qui se réfute) | 5 modules de boss | recalculées ; `evolutions` reçoit son premier fichier de tests |
| Règle annoncée avant d'être découverte (linéarité de la moyenne) ; prérequis `mode-stat` jamais enseigné nulle part | `statistiques-une-variable-2nde` | contrat 0E |
| **17 learning points appendus** pour des compétences enseignées et jamais mesurées, chacun rattaché à son module et éprouvé par une question écrite pour lui | `coursesData.js` + 6 lesson.config + 6 boss | `validate:lessons --strict` passe ; `check:lessons` bascule EN STRICT ; base « No drift » |
| Carte des connaissances morte d'`equations-de-droites` (30 briques, aucun snapshot rendu) | 8 modules + config | 45 → 59/59 |

**Ce que la Session 2 n'a pas fait, et pourquoi :** les enrichissements
pédagogiques (Tier B — ~25 manipulations à créer) et les réparations collège en
amont (Tier C — quartiles de 3e, coordonnées de vecteurs, mode statistique)
restent ouverts. Ce sont des changements de contenu, pas des réparations.

## 11ter. Leçons générées en Session 3 (2026-09-10)

Les deux leçons d'algorithmique du §10 sont **livrées** : 29 leçons de 2de
construites, 273 learning points, plus aucune leçon `coming_soon` en Seconde.

| Leçon | Modules | LP | Épreuves | Particularité |
| --- | ---: | ---: | ---: | --- |
| `variables-et-instructions-2nde` | 7 | 12 | 13 | interpréteur Python réel (`pyRun`), 27 tests |
| `fonctions-en-python-2nde` | 8 | 12 | 13 | interpréteur étendu (def/return/portée/listes), 51 tests |

**Le parti pris technique** : aucune sortie de programme n'est écrite à la main.
Les deux leçons embarquent un interpréteur Python (`components/pyRun.js`,
**copié** d'une leçon à l'autre selon la règle du dépôt, puis divergé) qui
exécute réellement ce que l'élève tape — affectation, `if/elif/else`, `for`,
`while`, `def`/`return` avec portée locale, listes, `randint`. Les erreurs
portent un numéro de ligne. Toute sortie citée dans un module a été exécutée
avant d'être écrite.

**Deux défauts trouvés en construisant, invisibles aux gates :**

| Défaut | Conséquence | Vérifié comment |
| --- | --- | --- |
| `PyLab` fixait sa graine (`seed = 2026`), copiée telle quelle dans la leçon sur le hasard | trois dés affichaient 1, 1, 1 à **chaque** clic, deux simulations de 1 000 lancers rendaient le même compte — alors que toute la leçon repose sur le constat inverse | rejoué au navigateur : 4 lancers distincts, 3 simulations à 178/179/191 (théorie 167) ; `PyLab.test.jsx` interdit le retour de `seed = <nombre>` |
| le compteur de `for` était rangé dans la portée globale | `for i in range(...)` à l'intérieur d'une fonction levait « la variable i n'existe pas » | sortie annoncée vérifiée avant écriture (`somme_jusqua(10)` = 55, `(100)` = 5050) ; 3 tests de portée |

**Écriture de preuves mesurée contre l'API réelle** pour `fonctions-en-python-2nde` :
une épreuve juste écrit `reinforce` sur P9/P11, une fausse écrit `gap` sur
P10/P12 dans `student_learning_point_progress`. Le compte de test et son
evidence ont été supprimés après vérification.

## 12. Session suivante

<!-- BEGIN SECTION: next -->
1. **Réparer les deux défauts fonctionnels** (§5) et les laboratoires gelés, avec un test de
   non-régression par défaut.
2. **Appendre les learning points manquants** (§9.1) sur les sept leçons de `nombres_calculs`,
   puis écrire leurs épreuves, puis passer `validate:lessons --strict` dans `check:lessons`.
3. **Rétablir la densité de preuve** (§9.2) sur les six leçons à plus de 10 LP.
4. **Aligner le collège** : quartiles en 3e, coordonnées de vecteurs hors du catalogue de 3e.
5. ~~Générer les deux leçons d'algorithmique~~ — **fait le 2026-09-10** (§11ter). Restent les
   leçons d'extension de `geometrie-espace` (§9.3), hors référentiel.
<!-- END SECTION: next -->
