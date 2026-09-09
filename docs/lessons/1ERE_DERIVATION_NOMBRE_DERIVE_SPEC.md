# 1ère spé — Dérivation : le nombre dérivé et la tangente — Design & Implementation Spec

> Tranche verticale de la mission « Première Spécialité », 2026-09-09. Sections d'après
> LESSON_DESIGN_PLAYBOOK §15.3 ; état livré à la fin. **Ce fichier porte aussi le PATRON
> PREMIÈRE** (§8) que les dix-huit autres leçons transcrivent.

## 1. Identité et contrat de curriculum

- Clé catalogue `premiere_specialite_derivation` (partie 1 / 3) · id `derivation-nombre-derive-1ere` · 📈 · Difficile · free · 75 min.
- Chemin `/courses/lycee/premiere_specialite/analyse/derivation-nombre-derive-1ere`.
  Dossier `apps/web/src/lessons/lycee/premiere_specialite/analyse/derivation-nombre-derive-1ere/`.
  **Le segment de grade du dossier est `premiere_specialite`** : `check-routes.mjs` en extrait le
  grade par `lessons/(?:college|lycee)/([^/]+)/` et le compare au catalogue. `premiere` seul
  ferait retomber chaque clic sur l'accueil, toutes les portes au vert.
- LP (append-only, `premiere_specialite_derivation-nombre-derive-1ere_P1…P4`) :
  - P1 Calculer un taux de variation entre deux points
  - P2 Comprendre le nombre dérivé comme limite du taux de variation
  - P3 Interpréter le nombre dérivé comme coefficient directeur de la tangente
  - P4 Déterminer l'équation de la tangente en un point
- Prérequis catalogue : « Taux d'accroissement », « Équations de droites », « Fonctions ».
  Le module 0 mesure exactement ceux-là, jamais la matière de la leçon.

## 2. Idée centrale et conceptions erronées

**Idée centrale, vécue avant d'être nommée :** le taux de variation entre deux points d'une
courbe est la pente d'une sécante. Quand le second point se rapproche du premier, ces pentes
**cessent de bouger** alors même que l'écart n'atteint jamais zéro. Ce nombre-limite est une
propriété du POINT, pas d'un couple de points : c'est la pente de la tangente en ce point.

Parcours : **deux points → sécante → pente → rapprochement → stabilisation → nombre dérivé →
tangente → équation de la tangente.**

| # | Conception erronée | Confrontée | Ce que l'élève voit |
|---|---|---|---|
| 1 | « il faut que h atteigne 0 » | M1 étapes 2-3, boss e3 | h = 0,001 donne encore une sécante ; les pentes se stabilisent bien avant |
| 2 | le taux de variation est une différence f(b) − f(a), sans diviser | M1 étape 1, M2 étape 2, boss e1 | le triangle montre montée ET avancée ; la pente change si l'avancée change |
| 3 | la tangente « touche en un seul point » donc ne recoupe jamais la courbe | M4 étape 3, boss e6 | sur le cube, la tangente en 1 recoupe la courbe plus loin |
| 4 | la tangente est horizontale partout / f′(a) est l'ordonnée f(a) | M3 étape 2, boss e5 | f(1) = 1 mais f′(1) = 2 : deux nombres différents au même point |
| 5 | équation de la tangente : y = f′(a)x + f(a) (on oublie le décalage) | M5 étapes 1-2, `explainFor`, boss e8 | la droite passe à côté du point de contact, visiblement |
| 6 | pente négative = courbe « en dessous de l'axe » | M3 étape 3, boss e4 | en x = −1 la courbe est sous l'axe et pourtant f′ > 0 |

## 3. Interaction signature — « La sécante qui se couche » (`SecantLab`)

Une courbe (f : x ↦ x², puis un cube), un point A fixé en x = a, un second point B en x = a + h.
L'élève **rétrécit h au cliquet** : 2 → 1 → 0,5 → 0,25 → 0,1 → 0,05 → 0,01. À chaque cran :

- la sécante (AB) **pivote** et se couche vers une position limite ;
- le triangle « avancée h / montée f(a+h) − f(a) » se redessine sous la sécante ;
- un affichage lit le taux (f(a+h) − f(a)) / h, en DOM, jamais en `<text>` SVG ;
- une **bande d'historique** empile les couples (h, pente) déjà visités, en ordre d'essai.

Variable pilotée : h (cliquet discret, jamais un curseur — les valeurs doivent être exactement
atteignables, cf. la règle de cible atteignable). État mathématique : le couple (a, h), tout le
reste en est dérivé. Conséquence visuelle : rotation de la sécante + colonne de pentes qui
converge. **Aha :** les pentes se stabilisent sur un nombre alors que h ne vaut jamais 0 ; ce
nombre ne dépend plus que de a.

La sécante ne disparaît jamais : à h minimal, elle est *presque* la tangente, et le module se
termine en **demandant** ce qu'est cette position limite — il ne la nomme pas. « Nombre dérivé »
et « tangente » sont posés au module 2.

Laissé aux modules suivants : le mot *nombre dérivé* et la notation f′(a) (M2), la lecture
graphique de f′(a) sur une tangente déjà tracée (M3), le tracé de la tangente et son
coefficient directeur (M4), l'équation y = f′(a)(x − a) + f(a) (M5).

Candidats rejetés : (a) un curseur continu sur h — les valeurs remarquables ne seraient pas
atteignables et la stabilisation deviendrait illisible ; (b) une animation automatique du
rapprochement — l'élève regarderait au lieu d'agir (§2, fausse interaction) ; (c) un QCM « que
devient la sécante ? » sur des images fixes — aucune manipulation ; (d) faire glisser B
librement sur la courbe — h ne prendrait pas de valeurs lisibles et l'historique n'aurait pas
de sens d'ordre.

Étiquettes : les nombres (h, pente, montée, avancée) vivent dans le DOM à côté de la figure,
jamais en texte SVG — c'est la parade §6bis.4 contre les collisions. Seuls A et B portent un
nom dans le repère, placés par `CoordPlane` qui bascule déjà l'étiquette au bord du cadre.

## 4. Architecture des modules (7 · 75 min)

| # | Slug | Stage | LP | min | Responsabilité | Interaction |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | image f(x), coefficient directeur d'une droite, taux d'accroissement de 2de | kit |
| 1 | la-secante-qui-se-couche | trigger | P1 P2 | 10 | le phénomène : les pentes se stabilisent, h n'atteint jamais 0 | `SecantLab`, `PredictionChips` |
| 2 | le-nombre-derive | discovery | P2 P1 | 10 | nommer : f′(a), limite du taux ; le calculer sur x² par le calcul littéral | `SecantLab` (a mobile) + kit |
| 3 | lire-une-tangente | manipulation | P3 | 12 | f′(a) EST le coefficient directeur : le lire sur une tangente tracée, signe compris | `TangentReader` |
| 4 | tracer-la-tangente | practice_lab | P3 P4 | 12 | poser la tangente au bon endroit avec la bonne pente ; elle peut recouper la courbe | `TangentBuilder` |
| 5 | l-equation-de-la-tangente | practice_lab | P4 P3 P1 | 12 | y = f′(a)(x − a) + f(a) : construire, vérifier, corriger le piège du décalage | `TangentBuilder` + kit |
| 6 | mission-finale-la-tangente | evaluation | — | 15 | 10 épreuves | kit `BossFinal` |

Somme = 4+10+10+12+12+12+15 = **75 min**, exactement la durée catalogue (aucun avertissement
d'écart). Stages non décroissants ; `formalization` dispensé par `knowledgeMap: true`.

### Matrice de couverture des LP

| LP | Enseigné | Pratiqué | Épreuves dédiées |
|---|---|---|---|
| P1 taux de variation | M1 | M2, M5 | **e1** (seul), e2 |
| P2 nombre dérivé comme limite | M1, M2 | M2 | **e3** (seul), e2, e7 |
| P3 coefficient directeur de la tangente | M3 | M4, M5 | **e4** (seul), e5, e6 |
| P4 équation de la tangente | M5 | M4, M5 | **e8** (seul), e9, e10 |

Chaque LP a au moins une épreuve dont `learningPointIds` vaut exactement `[P_i]` : le profil de
maîtrise du boss est donc interprétable, et la couverture est prouvable à la lecture.

## 5. Modèle — `lessons/common/analysis/derivative.js` (partagé)

Fonctions pures, testées **avant** toute JSX, consommées par les 3 leçons de dérivation et les
2 d'exponentielle :

`secantSlope(f, a, h)` · `numericDerivative(f, a)` (différence centrée, pour le DESSIN
seulement) · `tangentLine(f, a, fPrime)` → `{ a: pente, b: ordonnée à l'origine }` directement
consommable par `CoordPlane.functions` · `tangentAt(fPrime, a, fa)` · `riseRun(f, a, h)` pour le
triangle · `signTable`.

**Règle de justesse :** une réponse attendue de l'élève n'est JAMAIS comparée à
`numericDerivative`. Les valeurs exactes sont écrites en littéraux dans le module (f′(1) = 2
pour x²). Le dérivé numérique ne sert qu'à tracer.

Local à la leçon : `components/derivUtils.js` (les fonctions de la leçon, leurs dérivées
exactes, l'échelle du repère, la suite de crans de h) et son `.test.js`.

## 6. Tests

Unitaires : `lessons/common/analysis/derivative.test.js` (x², x³, 1/x, √x en plusieurs points ;
la tangente passe bien par le point de contact ; `secantSlope` retrouve la pente exacte d'une
affine pour tout h). `components/derivUtils.test.js` : chaque valeur citée par un module est
recalculée, chaque cran de h est atteignable, et les distracteurs du boss sont numériquement
distincts de la bonne réponse.

E2E `apps/web/e2e/lesson-kit/1ere-derivation-nombre-derive.mjs`, vite sur le port **5280** :
index et carte vide, diagnostic non bloquant, M1 pilotable au cliquet et **encore pilotable
après validation**, la colonne d'historique se remplit, briques au bon moment (table `CONTRIB`),
une mauvaise réponse produit son retour ciblé, M3/M4/M5 balayés jusqu'aux bornes avec l'audit de
mise en page, boss silencieux → score sur 10 → profil → synthèse, progression relue après
rechargement, passe mobile à 375 px, zéro erreur console.

## 7. Périmètre

**Exclu, et laissé aux leçons voisines :** les règles de calcul des dérivées (somme, produit,
quotient, composée) — `derivation-calculer-1ere` ; le lien signe de f′ / variations et
l'optimisation — `derivation-variations-optimisation-1ere` ; la notion de limite en général ;
la dérivabilité et ses contre-exemples. Le périmètre est codé en `teachingScope.exclude`.

## 8. PATRON PREMIÈRE (à transcrire pour les 18 autres leçons)

1. Dossier `apps/web/src/lessons/lycee/premiere_specialite/<domaine>/<id>/`, `<domaine>` ∈
   {`algebre`, `analyse`, `geometrie`, `probabilites`}, `<id>` = l'id du catalogue.
2. `lesson.config.js` : `LESSON_BASE_PATH = '/courses/lycee/premiere_specialite/<domaine>/<id>'`,
   puis `LESSON_CONFIG` avec `level: 'lycee'`, `grade: 'premiere_specialite'`,
   `chapter: '<domaine>'`, `knowledgeMap: true`, `sequentialUnlock: true`. En-tête listant les
   ids de LP **générés depuis le catalogue**, jamais saisis à la main.
3. `moduleContext.js` : copie conforme, avec `gradeLabel: 'Première'` et
   `gradeId: 'premiere_specialite'` (sans lui, `ModuleLayout` retombe sur « 3e »).
4. `routes.jsx` : copie conforme ; seuls changent le nom de la fonction exportée, le préfixe des
   clés, `printTitle` et `printSubject: 'Mathématiques · 1ère spé'`.
5. Profondeur d'import depuis la racine de la leçon : `../../../../common/…` ; depuis
   `modules/` : `../../../../../common/…`.
6. Le boss porte seul `assessment: { enabled: true, type: 'assessment', learningPointIds: [...] }`,
   en littéraux intégraux — un helper les rendrait invisibles au validateur.
7. `SKILLS[*].module` pointe le module qui ENSEIGNE, jamais le boss.
8. Toute `NumericQuestion` à réponse décimale porte `parse={parseDec}` : `parseFr` est
   entier-seulement et tronque en silence.
9. Aucune manipulation n'est gelée après validation : `disabled={!donePrecedent}` seulement.

## 9. État livré (2026-09-09)

`status: 'available'` · 7 modules · somme des `estimatedMin` = 75 min = durée catalogue
(aucun écart, donc aucun avertissement).

| Porte | Résultat |
| --- | --- |
| `npm run check:lessons` | vert (6 contrôles) |
| `node scripts/validate-lessons.mjs --strict` | vert — 4/4 LP couverts |
| `audit-knowledge-dependencies --lesson … --strict` | 11 briques · 27/27 `requires` · 0 E · lexique 0C/0H/0M/0L |
| `npx vitest run --root apps/web` | 138 fichiers, 3124 tests |
| `npm run test:scripts` | 3 fichiers, 43 tests |
| `npm run build` | vert |
| `1ere-derivation-nombre-derive.mjs` (vite :5280) | **52/52** |
| `smarter:import-curriculum` puis `validate-curriculum` | 1 leçon mise à jour, « No drift » |

### Défauts trouvés par les contrôles, et corrigés

1. **`numericDerivative` au mauvais pas.** Le pas 1e-6 d'une différence centrée
   laissait 2,8e-10 d'erreur sur une affine, là où 1e-4 en laisse 4,7e-12 : l'annulation
   catastrophique domine la troncature dès que f(a) est grand devant h. Corrigé dans le module
   partagé, avec la mesure en commentaire.
2. **Escalier de lecture de pente hors cadre.** Sur g en a = −1,5, une avancée fixée à 1 hissait
   le sommet de la marche à 4,875 pour un cadre s'arrêtant à 4. L'avancée est désormais
   CALCULÉE (`stepRun`) et le balayage complet est un test.
3. **Cible pédagogique inatteignable.** Les bornes du point de contact sur g s'arrêtaient à 1,
   alors que la seule position « courbe sous l'axe ET tangente qui monte » est a = 1,5 : la
   question de M3 étape 3 aurait affirmé quelque chose que la manipulation ne pouvait pas
   montrer. Bornes portées à 1,5, atteignabilité verrouillée par un test.
4. **Pente cible hors du cliquet.** Sur g les pentes visées valent 3,75 et −2,25, qu'un cliquet
   de 0,5 n'atteint jamais depuis 0. Chaque fonction déclare son `pasPente` ; un test vérifie que
   toute cible tombe sur un cran.
5. **Vocabulaire au-dessus du niveau, en position de demande.** L'audit strict a trouvé
   « pente » employé dans un explain du module 0 (cible de la leçon), « quotient » et
   « ordonnée à l'origine » jamais posés, et deux titres d'étape nommant avant l'ouverture.
   Tous reformulés avec le vocabulaire réellement disponible.
6. **Brique orpheline.** `mem-equation-tangente` ne vivait que dans l'« À retenir » : elle est
   désormais posée dans le flux du module 5.
7. **Collision d'étiquettes A ↔ B.** Au dernier cran, B est à 0,01 de A : les deux noms posés
   dans le SVG se chevauchaient. Ils sont passés en LÉGENDE DOM — l'écart peut tendre vers zéro
   sans jamais rendre la figure illisible.

### Signalé, hors périmètre

`LessonUI.TimerToggle` (kit partagé) mesure **28 px** de haut, sous le plancher de 40 px, dans
le boss de **toutes** les leçons. Défaut du composant partagé, pas de celle-ci : il est exclu
explicitement de l'assertion e2e plutôt qu'ignoré en silence (§6bis.5 — on ne corrige pas sans
qu'on le demande une manipulation qui n'est pas la sienne).
