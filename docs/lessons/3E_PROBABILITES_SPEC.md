# 3e — Probabilités — Design & Implementation Spec

> Spec produite le 2026-09-04 (LESSON_DESIGN_PLAYBOOK §15.3, INTERACTION_PEDAGOGY §23/§24).
> Leçon `probabilites-3e` (clé catalogue `3e_probabilites`, 12 learning points, 83 min).

## 1. Identité et contrat curriculaire

| | |
|---|---|
| Id / clé | `probabilites-3e` / `3e_probabilites` — ids LP `3e_probabilites-3e_P1…P12` (déjà importés en MySQL, 0 evidence, 0 progression : la liste est conservée telle quelle) |
| Description | Modéliser des expériences aléatoires et calculer ou interpréter des probabilités dans des situations adaptées. |
| Prérequis (module 0) | Fractions, Pourcentages, Calcul numérique |
| Périmètre officiel 3e | expériences à deux épreuves (traitée par la SOMME DE DEUX DÉS et la grille 6 × 6), fréquence/probabilité, événement contraire ; exclus : variables aléatoires, espérance, arbres pondérés complexes |
| Durée | 83 min = somme des `estimatedMin` (`durationMinutes` aligné) |

## 2. Décision de conception (§23)

1. **Concept.** Une expérience aléatoire a des issues connues mais un résultat imprévisible ; un événement est un ensemble d'issues ; sa probabilité (entre 0 et 1) mesure sa chance de se réaliser et se calcule, quand les issues sont équiprobables, par nb d'issues favorables ÷ nb d'issues possibles ; la fréquence observée, elle, vient de l'expérience et se rapproche de la probabilité quand le nombre d'essais grandit.
2. **Misconceptions.** « le 6 est plus dur » · « il vient de sortir 3 fois, il est plus (ou moins) probable » · « les fréquences finissent exactement égales » · « fréquence = probabilité » · « 11 sommes possibles ⇒ P(7) = 1/11 » · « deux issues ⇒ 1/2 chacune » · « doubler le sac change la probabilité » · « P = 0,9 ⇒ certain ».
3. **Situation.** Un jeu de plateau : le dé décide de combien de cases on avance, il faut un 6 pour passer le pont, la somme de deux dés pour le dernier défi.
4. **Manipulation.** Lancer le dé (×1, ×10, séries de 100 / 1 000) ; lancer l'expérience « après trois 6 de suite » ; alourdir une face ; composer un événement en touchant des faces ; composer un sac de billes ; lancer deux dés et cocher les cases d'une grille 6 × 6 ; régler une roue.
5. **Variable pilotée.** Le nombre d'essais (M1), la composition de l'événement (M2), la composition du sac (M3), les cases de la grille (M4), les secteurs de la roue (M6).
6. **Invariants à remarquer.** Un lancer est imprévisible ; les fréquences se resserrent autour de 1/6 ; le lancer suivant trois 6 se répartit comme n'importe quel lancer ; la part d'un événement = nb de faces favorables / 6 ; doubler le sac ne change pas la part ; la somme 7 domine parce que 6 cases sur 36 la donnent.
7–9. **Visuel / numérique / symbolique.** Barres d'effectifs → fréquences en % → repère 1/6 → fraction P(A) = k/n → échelle 0…1.
10. **Étayage décroissant.** Un bouton (Lancer) → séries → expérience programmée → événement à composer avec objectif → sac à composer → grille à cocher → questions sans manipulation → boss.
11. **Transfert.** Sac de billes, deux dés, roue, contrôle qualité, tirage au sort.

### Candidats examinés

| Concept | Candidats | Verdict |
|---|---|---|
| Hasard, fréquence, stabilisation (M1) | (a) sac composé par l'élève · (b) dé cliquable + compteur · **(c) laboratoire du dé : dé roulant, barres, séries figées, expérience « après trois 6 », dé truqué** | **(c)** — imposé par la commande ; le sac est réservé au M3 pour que la probabilité arrive APRÈS l'expérience |
| Événement (M2) | (a) QCM « quelles faces ? » · **(b) toucher les faces qui réalisent l'événement, fréquence sur 1 000 lancers dérivée** | **(b)** — la part se VOIT sur les barres avant d'être calculée |
| P = favorables/possibles (M3) | (a) formule + exercices · **(b) composer un sac pour atteindre une part, doubler le sac, tirer 200 fois** | **(b)** — la fraction naît comme la description du sac |
| Deux épreuves (M4) | (a) arbre · **(b) somme de deux dés : barres, puis grille 6 × 6 à cocher** | **(b)** — la grille EST l'arbre du programme, et elle explique le 7 |
| Échelle 0…1 (M5) | (a) texte · **(b) placer des événements sur une échelle en douzièmes** | **(b)** |

## 3. Modèle mathématique — `components/probaUtils.js`

- État du dé : `counts[6]` (effectifs), dérivés : `totalOf`, `frequencies` (exactes), `pct/formatPct` (affichage), `leaders/laggards/spreadPoints`, `probabilities(weights)`.
- `rollMany(counts, n, rng, weights)` pur et rejouable (`makeRng(SEED)`) — aucun `Math.random`.
- `afterStreak(rng, face, len, trials)` : répète `trials` fois « lancer jusqu'à `len` faces `face` consécutives, noter le lancer suivant » → six effectifs du lancer suivant.
- Événement : `eventProbability(faces)` = |faces|/6 ; `eventFrequency(counts, faces)`.
- Fractions : `simplify`, `fracLatex`, `equalFractions`.
- Sac : `bagProbability(bag, colour)`, `drawMany(bag, n, rng)`, `scaleBag(bag, k)`.
- Deux dés : `sumCells(s)` (cases (a,b) de somme s), `sumProbabilities()` (k/36), `rollTwoMany(counts, n, rng)` (11 effectifs, sommes 2…12).
- Roue : `wheelProbability(sectors, colour)`, `spinMany`.
- Géométrie des barres : `barsGeometry(counts, theory, cols)` — échelle contenant toujours la barre et le repère les plus hauts ; une étiquette par colonne (testé sur les extrêmes).
- Ne jamais arrondir la mathématique, seulement l'affichage.

## 4. Architecture des modules (83 min)

| # | slug | Titre | stage | LPs | min | Responsabilité unique · aha |
|---|---|---|---|---|---|---|
| 0 | mission-de-depart | Mission de départ | prerequisite_check | — | 4 | 5 × 2 pts sur fractions, pourcentages, calcul |
| 1 | le-laboratoire-du-de | Le laboratoire du dé | trigger | P1, P2, P7, P9 | 12 | prédire, lancer 1/10/100/1 000, comparer, l'expérience « après trois 6 », 1/6 se révèle, dé truqué · « je ne prévois pas UN lancer, mais 1 000 » |
| 2 | issues-et-evenements | Issues et événements | discovery | P2, P3, P4 | 10 | composer un événement en touchant des faces ; sa fréquence sur 1 000 lancers ; impossible / certain · « un événement, c'est plusieurs issues » |
| 3 | le-sac-de-billes | Le sac de billes | discovery | P5, P6, P10 | 10 | composer un sac pour une part visée ; doubler ; tirer 200 fois · « la fraction décrit le sac » |
| 4 | deux-des | Deux dés | manipulation | P3, P5, P9, P10, P12 | 11 | somme de deux dés : parier, 1 000 lancers, cocher la grille 6 × 6 · « 7 gagne parce que 6 cases sur 36 » |
| 5 | le-langage-des-probabilites | Le langage des probabilités | formalization | P4, P6, P8, P11 | 9 | échelle 0…1, « À retenir », contraire, fréquence ≠ probabilité, interpréter |
| 6 | le-labo-des-situations | Le labo des situations | practice_lab | P5, P10, P11, P12 | 12 | roue de kermesse, contrôle qualité, tirage au sort, vrai/faux |
| 7 | mission-finale-le-tournoi | 🏆 Mission finale : le tournoi | evaluation | — | 15 | 10 QCM `pb-e1…e10`, badges, synthèse (dé + grille figés) |

## 5. Composants

| Composant | Rôle | Nœuds interactifs |
|---|---|---|
| `DiceLab` (+ `DieIcon`, `FaceChips`, `PredictionChips`) | dé roulant, barres, commandes de l'étape, repère théorique | ≤ 12 |
| `CountBars` | n barres génériques (faces 1…6 ou sommes 2…12), étiquettes dérivées de `barsGeometry` | 0 |
| `FrequencyStrip` | trois séries côte à côte en % | 0 |
| `EventBuilder` | six faces à toucher → événement, part et fréquence dérivées | 6 |
| `MarbleBag` | trois steppers, sac plafonné (tuiles + « ×N »), tirages | 8 |
| `TwoDiceLab` | deux dés + `CountBars` des sommes | ≤ 4 |
| `OutcomeGrid` | grille 6 × 6, un rect transparent par case (36) + clavier | 36 |
| `ProbabilityScale` | échelle 0…1 en douzièmes, événements à placer par tap | ≤ 18 |
| `SpinnerWheel` | roue à 12 secteurs, steppers de couleurs, tourner ×1 / ×120 | 6 |

## 6. Boss — « Le tournoi » (`pb-e1…e10`)

| Épreuve | skill → module | LPs | piège du distracteur |
|---|---|---|---|
| e1 quelle situation est aléatoire | hasard → 1 | P1 | « calculer 3 × 4 » |
| e2 issues d'une pièce / d'un dé | hasard → 1 | P2 | compter les événements |
| e3 faces qui réalisent « ≥ 5 » | evenements → 2 | P3 | inclure le 4 |
| e4 P(pair) sur un dé | calcul → 3 | P5, P6 | 3/3 |
| e5 sac 5R 3B 2V : P(V) | calcul → 3 | P6, P10 | 2/8 |
| e6 22 fois le 4 sur 100 lancers | frequence → 1 | P7, P8 | « P = 22 % » |
| e7 fréquences quand n grandit | frequence → 1 | P9 | « exactement égales » |
| e8 somme 7 avec deux dés | deuxdes → 4 | P5, P10 | 1/11 |
| e9 « 0,9 donc certain » | interpreter → 5 | P4, P11 | oui |
| e10 loterie 2 % → 500 tickets | problemes → 6 | P11, P12 | 2 |

## 7. Politique formative, sécurité d'affichage, mobile

Toutes les questions passent par le kit (révélation immédiate, `onAnswered` inconditionnel). Les manipulations à objectif (événement, sac, grille, roue) complètent sur l'objectif réel, quantifient l'écart et offrent « montre-moi » après 3 essais. Aucune lecture numérique dans le SVG hors étiquettes de colonnes ; échelle des barres calculée ; grille 6 × 6 à zone tactile ≥ 44 px via viewBox responsive ; tout en une colonne à 375 px ; e2e : `layoutAudit` après chaque série, à 1280 et 375 px.

## 8. Fichiers

`apps/web/src/lessons/college/3e/donnees_probabilites/probabilites-3e/` — `lesson.config.js`, `moduleContext.js`, `index.jsx`, `routes.jsx`, `components/{probaUtils.js, probaUtils.test.js, learningPoints.js, DiceLab.jsx, CountBars.jsx, FrequencyStrip.jsx, EventBuilder.jsx, MarbleBag.jsx, TwoDiceLab.jsx, OutcomeGrid.jsx, ProbabilityScale.jsx, SpinnerWheel.jsx}`, `modules/Module00…Module07`. E2E : `apps/web/e2e/lesson-kit/3e-probabilites.mjs` (port 5219). Catalogue : `status: 'available'` + `durationMinutes: 83`. `App.jsx` : import + spread.

## 9. Note de périmètre

Le module 1 de `statistiques-3e` (« Lancer le dé ») est lui aussi un laboratoire du dé. Il est laissé tel quel (règle de périmètre) ; celui-ci s'en distingue par l'expérience « après trois 6 de suite », par l'absence du vocabulaire série/valeurs/effectifs, et par le fait que ses observations sont réutilisées par les modules 2 à 6 (événement, sac, deux dés). `diceUtils` n'est pas importé d'une leçon voisine : copié et étendu dans `probaUtils` (playbook §14 ADAPT).

## Shipped state (2026-09-05)

- Catalogue : `status: 'available'`, `durationMinutes` = somme des modules ; exporté puis importé
  (`smarter:import-curriculum`), `smarter:validate-curriculum` : « No drift » ; 12 LP rows en MySQL.
- `npm run validate:lessons` : 12/12 learning points covered, zéro erreur pour la leçon (baseline du
  dépôt inchangée : 6 erreurs / 29 avertissements, toutes dans des leçons 6e pré-existantes).
- `npm run build` : OK. Tests unitaires : voir ci-dessous. Suite Playwright : voir ci-dessous.
- Unit tests `probaUtils.test.js` : 17 (modèle du dé, expérience « après trois 6 », fractions,
  événements, sac, deux dés, géométrie des barres sur états extrêmes, graine de session).
- E2E `3e-probabilites.mjs` (port 5219) : 78/78 — index, diagnostic, M1 complet (prédiction,
  1/10/100/1 000, bande des derniers résultats, expérience de la mémoire, 1/6, dé truqué, labo libre
  6 000 lancers), M2–M6 avec chemins « faux exprès », boss silencieux → score → profil → synthèse →
  rechargement, revisite, mobile M1 et M4 (cases de grille ≥ 40 px après le débord `-mx-5`).
- Écarts au design initial : le module 1 a été REDESSINÉ en cours de build sur demande de l'utilisateur
  (dé sombre sur plateau, `ResultStrip`, pistes horizontales DOM `FaceTracks` au lieu des barres SVG
  copiées de statistiques-3e) ; la graine du générateur est désormais par session (`sessionSeed`),
  car une graine littérale faisait toujours tomber le premier lancer sur la même face.
- Chevauchement assumé : `statistiques-3e` M1 est aussi un laboratoire du dé (laissé tel quel).
