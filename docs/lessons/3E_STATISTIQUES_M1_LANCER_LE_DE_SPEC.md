# 3e — Statistiques — Module 1 « Lancer le dé » (spécification)

Portée : **le seul module 1** de la leçon `statistiques-3e`. Les modules 2 à 8, `DotPlot`,
`statUtils` et le boss ne sont pas touchés. Le module remplace « Douze trajets » (pose des
douze valeurs) tout en restant responsable des mêmes points d'apprentissage.

## 1. Identité

| | |
|---|---|
| Leçon | `statistiques-3e` (clé catalogue `3e_statistiques`) |
| Module | 1 · `lancer-le-de` · stage `trigger` · 12 min · couleur indigo |
| LPs enseignés | `3e_statistiques-3e_P1` (lire et organiser une série), `3e_statistiques-3e_P2` (effectifs et valeurs) |
| Transition | vers la leçon `probabilites-3e` (P(événement) = favorables ÷ possibles), non enseignée ici |
| Fichiers | `components/diceUtils.js` (+ test), `components/DiceLab.jsx`, `components/FrequencyStrip.jsx`, `modules/Module01LancerLeDe.jsx` |

## 2. Décision de conception (§23 d'INTERACTION_PEDAGOGY)

1. **Concept.** Une expérience aléatoire répétée produit une série statistique (valeurs = faces,
   effectifs = nombres d'apparitions, fréquences = effectif ÷ total). Quand le nombre de lancers
   grandit, les fréquences se resserrent autour d'une valeur commune ; pour un dé équilibré cette
   valeur est 1/6 ≈ 16,7 %, la probabilité de chaque face.
2. **Misconceptions.** « Le 6 est plus dur à obtenir » · « il vient de sortir trois fois, il est
   plus probable » (ou « moins probable ») · « avec assez de lancers, les fréquences deviennent
   exactement égales » · « fréquence = probabilité » · « une face en tête sur 10 lancers prouve
   un dé truqué ».
3. **Situation réelle.** Aux petits chevaux, il faut un 6 pour sortir un pion ; tout le monde jure
   que le 6 est la face la plus difficile. L'élève a un dé et va le tester.
4. **Manipulation.** Prédire une face (tap), lancer le dé (tap), lancer ×10, lancer des séries
   neuves de 100 et de 1 000, alourdir une face du dé (tap), labo libre à la fin.
5. **Variable pilotée.** Le nombre de lancers ; puis les poids du dé (étape 9).
6. **Invariant à remarquer.** *Un* lancer est imprévisible ; sur peu de lancers les barres sont
   très inégales et la face en tête change ; sur 1 000 lancers les six barres sont presque de
   même hauteur, quelle que soit la série — sauf si le dé est truqué.
7. **Visuel.** Un dé qui roule puis se pose ; six barres (une par face) qui grandissent ; le
   repère théorique pointillé qui n'apparaît qu'à l'étape 7.
8. **Numérique.** Effectif de chaque face, total, fréquence en % (à partir de l'étape 3), écart
   max − min en points (étapes 4 et 5).
9. **Symbolique.** « 18 sur 100 = 18/100 = 18 % » (étape 3) ; « 1 face sur 6 → 1/6 ≈ 16,7 % »
   et P(6) = 1/6 (étape 7) ; P(k) = 3/8 pour le dé truqué (étape 9).
10. **Décroissance de l'étayage.** Un seul bouton (Lancer) → ×10 → série de 100 → série de
    1 000 avec pari → dé truqué → deux questions sans manipulation (étape 10).
11. **Transfert.** Retour au jeu (étape 6) ; dé truqué (étape 9) ; défi final « 22 fois le 4 ».

### Candidats d'interaction examinés

| Candidat | Verdict |
|---|---|
| A. Sac de billes composé par l'élève, tirages répétés (pattern §22) | Rejeté ici : impose de composer le sac avant de lancer, donc de connaître la probabilité avant l'expérience — l'inverse de l'objectif du module. Sera le bon pattern pour `probabilites-3e`. |
| B. Dé cliquable + compteur textuel | Rejeté : pas de représentation visuelle de la série ; la stabilisation ne se *voit* pas. |
| **C. Laboratoire du dé : dé qui roule, six barres, séries de 10/100/1 000 figées et comparées, dé truqué** | **Retenu** : la variable pilotée (nombre de lancers) est celle du concept ; les instantanés figés rendent la comparaison 10 → 100 → 1 000 tangible ; le dé truqué isole l'hypothèse « équilibré ». |

## 3. Modèle mathématique (`diceUtils.js`)

- État : `counts[6]` (effectifs), la seule vérité. Le module possède aussi `lastFace`, `rolling`,
  `loadedFace`, les prédictions, et des **instantanés figés** `{counts, last, loaded}` par étape.
- Dérivés : `totalOf`, `frequencies` (exactes), `pct`/`formatPct` (affichage), `leaders`,
  `laggards` (toutes les faces à égalité), `spreadPoints`, `probabilities(weights)`,
  `barGeometry` (échelle, barres, étiquettes, repères).
- Transformations : `rollMany(counts, n, rng, weights)` — pure, rejouable (`makeRng(SEED)`).
- Invariant : somme des effectifs = total ; somme des fréquences = 1 ; échelle ≥ barre la plus
  haute et ≥ repère le plus haut.
- Le dé truqué est un vecteur de poids `[1,1,1,1,1,1]` → `[1,1,1,1,1,3]` : 1/6 devient un cas
  particulier, ce que l'étape 9 fait constater.

## 4. Les dix étapes

| # | Étape | Action | Question mathématique | Ce qui est nommé |
|---|---|---|---|---|
| 1 | Quelle face va sortir ? | prédire, lancer ×3 | peut-on prévoir un lancer ? | expérience aléatoire |
| 2 | Dix lancers | Lancer, ×10 | 10 lancers : la face k n'est sortie que c fois — conclure ? | série, valeur, effectif |
| 3 | Est-ce beaucoup ? | série neuve de 100 | c sur 100 → ? % (saisie) | fréquence |
| 4 | Parie, puis lance 1 000 fois | pari, 3 séries de 1 000 | une face reste-t-elle en tête ? | — (observation) |
| 5 | 10, 100, 1 000 | comparer les trois instantanés | les fréquences… deviennent égales / se rapprochent / s'éloignent | stabilisation |
| 6 | Retour au jeu | — | « le 6 est plus dur » ; « trois 6 de suite » | le dé n'a pas de mémoire |
| 7 | Une face sur six | — (le repère 1/6 se révèle sur la série de 1 000) | quelle part par face ? (fractions KaTeX) | probabilité, P(6) = 1/6 |
| 8 | Fréquence ou probabilité ? | — | pourquoi 19 % ≠ 16,7 % ? | fréquence ≠ probabilité |
| 9 | Et si le dé était truqué ? | alourdir une face, série de 1 000 | 1/6 encore vrai ? | hypothèse « équilibré » |
| 10 | Défi final | — | P(4) ; 22 fois le 4 sur 100 | — |

Chaque correction cite les nombres **de l'élève** (ses effectifs, ses écarts, sa face en tête),
jamais des valeurs inventées ; les instantanés figés garantissent que le texte d'une question ne
change pas sous ses yeux pendant qu'il continue à lancer.

## 5. Politique formative

Toutes les questions passent par `TapQuestion` / `NumericQuestion` du kit : révélation immédiate,
`onAnswered` inconditionnel, correction citant la bonne réponse et la règle. Les manipulations
terminent sur leur objectif réel (3 lancers, 10 lancers, une série de 100, trois séries de 1 000,
une série truquée) et ne bloquent jamais : la prédiction n'a pas de « bonne » réponse.

## 6. Sécurité d'affichage (§17bis)

- `barGeometry` : l'échelle contient toujours la barre et le repère les plus hauts ; une étiquette
  par colonne, avec halo blanc ; test unitaire sur 8 états extrêmes × 4 modèles (0, 1, 99 999
  lancers, une face seule, six faces égales, dé truqué).
- Lectures longues (« 17 / 1 000 », « 16,7 % ») en DOM, dans une grille `grid-cols-3
  sm:grid-cols-6` — jamais dans le SVG.
- `MAX_TOTAL = 99 999` : les boutons se désactivent au-delà.
- `FrequencyStrip` : échelle commune (plancher 40 %), seuls textes = six numéros de face, un par
  colonne ; titres et écarts en DOM.
- E2E : `layoutAudit` (hors cadre + chevauchement de `<text>`) après chaque lancer, chaque série
  de 100/1 000, la série truquée, et cinq ×1 000 dans le labo libre ; à 1280 px et à 375 px.

## 7. Accessibilité et mobile

Tous les contrôles sont des boutons ≥ 44 px, libellés en français (« Lancer le dé », « Lancer 10
fois », « Nouvelle série de 1 000 lancers », « Prédire la face 4 », « Alourdir la face 6 ») ;
le résultat est annoncé dans une zone `aria-live` ; le graphique porte la lecture complète en
`aria-label` ; le roulement du dé et la croissance des barres respectent `prefers-reduced-motion`
(le module révèle alors le résultat sans délai). Aucun glisser. Mise en page sur une colonne ; la
grille des six cartes se replie en 3 × 2 à 375 px.

## 8. Hors périmètre, noté pour le rapport

- Le boss (module 8) ouvre sa synthèse par « Des douze trajets jusqu'à… » : référence narrative à
  l'ancien module 1, laissée telle quelle (module non touché).
- La leçon `probabilites-3e` n'existe pas encore ; ce module y prépare sans l'enseigner.
