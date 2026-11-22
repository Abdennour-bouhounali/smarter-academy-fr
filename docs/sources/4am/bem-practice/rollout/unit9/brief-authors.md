# Brief — unité 9 « خاصية طالس » au format BEM (2026-10-08)

Une leçon à la fois, dans l'ordre de `content/practice/active.json` : `talis-hisab-atwal` → `aksiya-talis` →
`inshaat-talis` → `wadiya-idmajiya-talis`. PREMIÈRE unité de géométrie convertie. Toutes les règles des briefs
précédents s'appliquent : `../unit2/brief-authors.md` §1–§7 (officiels mot pour mot + corrigé officiel, coquilles
signalées jamais corrigées en silence), `../unit1/brief-authors.md` §5 et §7, `../unit3`, `../unit5`, `../unit7`
(officiels), `../unit8/brief-authors.md` (précédents : ☜ unique scindé compétence comptée / argent `counted:false`).
Contrat : `docs/architecture/EXERCISE_CONTRACT.md` § « Présentation examen (BEM) », « One step split into several
questions », « Model solution opened = no retry ». RÉÉCRIS l'oracle `scripts/practice-oracle/<leçon>.mjs`.

## Officiels (index `../../annals-index.md`) — cités UNE fois, mot pour mot, corrigé officiel

| Leçon | Officiels (session · exercice · ن · page sujet · pages corrigé) |
|---|---|
| `talis-hisab-atwal` | 2008 I-3 (03) 1R→1L · 5–7 ; 2010 I-4 (03) 2R · 12–13 ; 2013 I-3 (02) 3R · 21–24 ; 2020 I-3 (03) 5L · 48–49 ; 2023 I-3 (03) 6L · 55–57 |
| `aksiya-talis` | 2007 I-4 (03,5) 1R · 1–4 ; 2015 I-4 (02,5) 4R · 29–31 ; 2017 I-4 (02) 4L · 36–39 ; 2018 I-3 (03) 5R · 40–43 |
| `inshaat-talis` | aucun — « على منوال » + adapted seulement |
| `wadiya-idmajiya-talis` | 2016 II (08) 4L · 32–35 (niveau 5, parmi les 10) |

Pages : sujets `docs/official-BREVET-exams/حوليات شهادة التعليم المتوسط سابقة من 2007الى 2025.pdf` (R = colonne
droite), corrigés : le fichier « … حلول » sans extension. Rendu `pdftoppm -r 150 -png -f <p> -l <p> "<fichier>"
<ton dossier temporaire>/x`, puis LIS l'image (couche texte illisible). Ne JAMAIS `git add` ces fichiers.
Des étapes de Thalès vivent aussi dans des sujets possédés par d'AUTRES leçons (2012 I-3, 2019 I-3, 2021 I-3,
2022 II, 2024 I-4, 2016 II hors synthèse) : jamais « BEM <année> » ici, seulement « على منوال » sur leur forme.

## Étapes hors leçon (`counted: false`, gardées telles qu'imprimées, LP de TA leçon)

Pythagore et sa réciproque (3AM), trigonométrie (cos / sin / tan, unité 10 — enseignée APRÈS Thalès), angle inscrit
et rotation (unité 13), pourcentages, impôt, écriture scientifique (unités 1 / 6). Dans `aksiya-talis`, un calcul de
longueur par Thalès direct est une compétence de `talis-hisab-atwal` : il COMPTE pour la synthèse seulement ; dans
une autre leçon de l'unité, étiquette-le avec le LP de ta leçon le plus proche, compté (même unité, prérequis direct).

## Figures — la règle de l'unité

- Tout sujet qui dit « الشكل المقابل » ou qui a une figure : la figure est DESSINÉE en `statement.figure` (GeoFigure,
  `apps/web/src/lessons/common/components/geoFigure.js` : `points`, `segments` avec `label`, `lines`, `rightAngles`,
  `angles`, `labels`, `hidden`…). Les leçons de l'unité ont déjà leurs figures du manuel en données
  (`apps/web/src/lessons/moyen/4am/handasa/khassiyat-talis/<leçon>/content/figures.js`) : réutilise-les.
- **Lisibilité exigée par le validateur** sur toute feuille d'examen : `figureQuality(fig)` doit être vide (pas de
  bande plus large que 2 : 1, pas d'étiquette sur une autre ou sur un point). Une figure de sujet mal conçue est
  REDESSINÉE (même concept, mêmes données, coordonnées choisies pour qu'elles soient exactes : les longueurs DESSINÉES
  respectent les rapports de Thalès), avec la ligne « أعادت المنصّة رسم شكل الموضوع بوضوح أكبر، بنفس المعطيات » dans
  `solution` si le dessin diffère de celui du sujet.
- Les longueurs données s'écrivent sur les segments (`label: '4,5'` ; unité dans l'énoncé). La longueur DEMANDÉE n'est
  jamais écrite sur la figure (`label: 'x'` ou rien).
- Parallélisme dans l'énoncé (« (MN)//(BC) ») : jamais seulement suggéré par le dessin.

## Types de réponse

- Longueur : `rational` (virgule maison ; « 7,5 » et « 15/2 » acceptés). Une longueur non décimale : fraction exacte,
  ou arrondi demandé explicitement.
- Réciproque (« هل المستقيمان متوازيان؟ ») : d'abord les DEUX rapports à saisir (comparés en exact), puis `choice`
  نعم / لا dont chaque option porte une misconception (`MISC-TALIS-*`) ; « بيّن أن (MN)//(BC) » = rapports saisis puis
  `selfCheck` pour la rédaction (« حسب عكس خاصية طالس… »), ou `choice` si c'est un oui/non.
- Configuration papillon (en croix) et emboîtée : les deux formes doivent apparaître dans chaque leçon.
- Constructions (`inshaat-talis`) : partager un segment, construire x = a × b / c, placer un point au rapport k :
  la construction elle-même = `selfCheck` (« أنشئ ») avec une figure modèle dans `solution` ; une LONGUEUR obtenue
  = valeur à saisir.

## Oracle

Recalcule chaque longueur et chaque rapport en rationnels EXACTS à partir des nombres de l'énoncé (tes propres
formules ; jamais `packages/core/arithmetic/thales.js`). Pour une figure redessinée, l'oracle vérifie AUSSI que les
coordonnées dessinées respectent les rapports (`|AM|/|AB| = |AN|/|AC|` sur les points de la figure, à 1e-9 près).
Chaque question fermée : une seule option vraie.
