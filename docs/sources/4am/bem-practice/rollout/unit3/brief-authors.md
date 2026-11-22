# Brief — unité 3 « الحساب الحرفي » au format BEM (2026-10-07)

Une leçon à la fois, dans l'ordre : `nashr-tabsit` → `mutatabiqat-shahira` → `tahlil-ibara` →
`wadiya-idmajiya-harfi`. Ce brief reprend TOUTES les règles du brief de l'unité 2 (`../unit2/brief-authors.md`
§1–§7 : banque remplacée EN PLACE, ids conservés, ≥ 15 « على منوال »، niveau 5 = 10 NOUVELLES « الوضعية
الإدماجية (08 ن) »، `counted:false`، coquilles signalées et jamais corrigées en silence, oracle exact) et la
procédure de l'unité 1 (`../unit1/brief-authors.md` §5 contrôles sans vitest, §7 couverture du manuel à ne pas
dégrader). Format commun : `../../brief-authors.md`. Les banques actuelles ont déjà 50 exercices.

Libellé décidé par le propriétaire : « على منوال BEM <année> » même quand seule la structure est reprise.

## Officiels attribués par l'index (`../../annals-index.md`) — cités UNE fois, mot pour mot, corrigé officiel

| Leçon | Officiels (session · exercice · ن · page sujet · pages corrigé) |
|---|---|
| `nashr-tabsit` | 2017 I-2 (03) 4L · 36–39 ; 2023 I-2 (03, figure à redessiner) 6L · 55–57 |
| `mutatabiqat-shahira` | 2014 I-2 (03) 3L · 25–28 ; 2015 I-2 (03,5) 3L · 29–31 ; 2020 I-2 (03) 5L · 48–49 ; 2024 I-1 (03) 7R · 58–60 ; 2025 I-1 (03) 7L · 61–62 |
| `tahlil-ibara` | 2007 I-2 (03) 1R · 1–4 ; 2008 I-2 (03,5) 1R · 5–7 ; 2009 I-2 (03) 1L · 8–11 ; 2011 I-1 (03) 2R · 14–16 ; 2012 I-2 (03) 2L · 17–20 ; 2013 I-2 (03,5) 3R · 21–24 ; 2016 I-2 (03) 4R · 32–35 ; 2018 I-2 (03) 5R · 40–43 ; 2019 I-2 (03) 5R→5L · 44–47 ; 2021 I-2 (03) 6R · 50–52 ; 2022 I-2 (03) 6R · 53–54 |
| `wadiya-idmajiya-harfi` | aucun — modelled seulement (sujets complets du calcul littéral, et les الجزء الثاني à expressions : 2008 II, 2015 II, 2017 II) |

`tahlil-ibara` en a 11 : c'est permis (« autant que le corpus en donne »), répartis aux niveaux 2–4.

### Étapes connues hors leçon (`counted: false`) et pièges signalés
- Les étapes « حل المعادلة (…)(…) = 0 » relèvent de `jidaa-maadum`, les متراجحات de `mutarajiha-ula`, les racines
  (2008 I-2 02ا, 2015 I-2 04, 2025 I-1 03) de l'unité 2 : `counted:false` dans ces feuilles.
- **2013 I-2 01(ا)** (dans `tahlil-ibara`) : le livret de corrigés donne « 3√2 − 5 ≈ −0,75 » par défaut à 10⁻² ;
  la valeur juste est **−0,76** (3√2 − 5 = −0,757…). Le sujet est juste : garde-le official, écris la solution
  avec −0,76, et SIGNALE-le dans ton rapport. L'étape (approximation, unité 2) est `counted:false`.
- **2023 I-2** a une figure (carré et rectangle) : redessine-la en `statement.figure` (voir
  `docs/sources/4am/bem-practice/brief-authors.md` et la mémoire « figures du manuel : analyser puis redessiner ») ;
  aucun « الشكل المقابل » sans figure.
- Toute autre coquille ou désaccord oracle ↔ corrigé officiel : règle §1.5 du brief de l'unité 2.

## Types de réponse
Expressions développées / factorisées : vois comment la banque actuelle de l'unité 3 les fait saisir (types déjà
supportés par l'évaluateur, p. ex. coefficients en `rational`, ou un type d'expression s'il existe déjà dans
`packages/core/practice/answerEvaluator.js`). Ne crée PAS de nouveau type de réponse. « تحقق بالنشر أن … » et
« بيّن أن … » sans valeur à saisir : `selfCheck`.

## Oracle et contrôles
`scripts/practice-oracle/<leçon>.mjs` existe déjà (unité 3) : RÉÉCRIS-le pour la nouvelle banque (une clé par
question non selfCheck, recalculée ; outil `poly` de `./helpers.mjs`). Contrôles du brief de l'unité 1 §5 et §7,
plus ton propre script node : chaque clé acceptée par `packages/core/practice/answerEvaluator.js` et égale à
`expectedAnswer`. Pas de vitest, pas de build, pas de commit ; ne touche ni `exam-style.json` ni le test commun.
