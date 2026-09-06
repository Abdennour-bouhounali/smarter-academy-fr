# 2nde — Signe d'une fonction — Design & Implementation Spec

> Built 2026-09-06. Sections follow LESSON_DESIGN_PLAYBOOK §15.3.

## 1. Identity & curriculum contract
- Key `seconde_signe_fonctions` · id `signe-fonctions-2nde` · domain `fonctions` · ➕➖ · Difficile · **80 min**.
- Route `/courses/lycee/seconde/fonctions/signe-fonctions-2nde`. LPs `seconde_signe-fonctions-2nde_P1…P12`.
- Specificity: signe lu graphiquement puis organisé en tableau (affine, produit, quotient) pour résoudre f(x) = 0, > 0, < 0.

## 2. Central idea & misconceptions
Le signe de f(x) EST la position de la courbe par rapport à l'axe des abscisses ; il ne change qu'aux zéros. L'axe peint sous la sonde est déjà un tableau de signes.

| # | Misconception | Confronted |
|---|---|---|
| 1 | signe de f(x) = signe de x | M1 step 3–4, boss e1 |
| 2 | un zéro est une ordonnée / un point | M2 step 1, boss e2 |
| 3 | zéro de ax + b en b (pas −b/a) ; signe de a oublié | M3 steps 3–4, boss e5 |
| 4 | double barre lue comme un 0 | M4 steps 2–3, boss e7 |
| 5 | bornes incluses à tort ; valeur interdite incluse | M5 steps 3–4, boss e9 |
| 6 | « la courbe descend » = « f(x) < 0 » | M5 step 4, boss e10 |

## 3. Signature interaction — « Au-dessus ou en dessous ? » (`SignProbe`)
Une sonde balaie la courbe des températures d'une journée d'hiver ; le point s'allume vert/rose/ambre et l'axe se peint sous la sonde ; les zéros se marquent quand on tombe dessus. Prédiction sans verdict (« combien de fois T passe par 0 ? »). Aha : le signe change exactement aux traversées. Rejetés : un tableau à remplir d'abord, une animation qui colore seule, un simple curseur sans trace.

## 4. Module architecture (8 · 80 min)
| # | Slug | Stage | LPs | min | Interaction |
|---|---|---|---|---|---|
| 0 | mission-de-depart | prerequisite_check | — | 4 | kit |
| 1 | au-dessus-ou-en-dessous | trigger | P1 P2 | 10 | `SignProbe` (température, cubique) |
| 2 | les-zeros-et-le-tableau | discovery | P3 P4 P2 | 10 | `SignTable` éditable |
| 3 | le-signe-d-une-fonction-affine | discovery | P5 P3 P9 | 10 | `AffineSignLab` (b puis a) |
| 4 | produit-et-quotient | manipulation | P6 P7 P4 | 12 | `SignTable` lignes de facteurs, double barre |
| 5 | resoudre-avec-le-signe | manipulation | P8–P12 | 11 | tableau + bandes sur la courbe |
| 6 | atelier-gel-et-benefice | practice_lab | P8 P10 P11 P12 P6 P7 P1 | 8 | kit |
| 7 | mission-finale-le-signe | evaluation | — | 15 | `BossFinal` |

Knowledge Map: M1 4 · M2 3 · M3 3 · M4 3 · M5 3 · M6 1 = 17 items.

## 5. Mathematical model — `components/signeUtils.js`
Fonction = `{ fn, zeros (exacts), forbidden, domain }` ; `signAt`, `signTable` (bornes, cellules, marques zéro/interdite), `affine`, `productOf` (quotient), `combineSigns`, `solveSign` (bornes fermées de l'étude incluses, zéros inclus pour ≥/≤, interdites jamais), `setText`. Tests : 10.

## 6. Validation
`validate:lessons` 12/12 ; vitest 10/10 ; e2e `2nde-signe-fonctions.mjs` 53/53 (vite :5241).
