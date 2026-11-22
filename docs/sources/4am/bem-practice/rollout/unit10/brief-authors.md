# Brief — unité 10 « حساب المثلثات في المثلث القائم » au format BEM (2026-10-08)

Une leçon à la fois, dans l'ordre de `content/practice/active.json` : `nisab-muthallathiya` → `hasiba-muthallathiya`
→ `alaqat-muthallathiya` → `tarrid-muthallathiya` → `wadiya-idmajiya-muthallathat`. Toutes les règles des briefs
précédents s'appliquent : `../unit2/brief-authors.md` §1–§7 (officiels mot pour mot + corrigé officiel ; coquilles
signalées, jamais corrigées en silence), `../unit1/brief-authors.md` §5 et §7, `../unit3`, `../unit5`, `../unit7`,
`../unit8` (☜ unique scindé : compétence comptée / argent `counted:false`), et SURTOUT `../unit9/brief-authors.md`
(figures exactes vérifiées par l'oracle, `figureQuality` exigé par le validateur, lecture des scans). Contrat :
`docs/architecture/EXERCISE_CONTRACT.md` § « Présentation examen (BEM) », « One step split into several questions »,
« A plane figure on an exam sheet must be readable », « Model solution opened = no retry ». Références converties :
les 4 leçons de l'unité 9 (`content/practice/4am/talis-hisab-atwal/` …) et leurs oracles. RÉÉCRIS l'oracle
`scripts/practice-oracle/<leçon>.mjs`.

## Officiels (index `../../annals-index.md`) — cités UNE fois

| Leçon | Officiels (session · exercice · ن · page sujet · pages corrigé) |
|---|---|
| `nisab-muthallathiya` | 2011 I-3 (03) 2L · 14–16 ; 2018 I-4 (03) 5R · 40–43 ; 2019 I-3 (03) 5L · 44–47 ; 2021 I-3 (03) 6R · 50–52 |
| `hasiba-muthallathiya` | aucun — mais ses étapes sont dans 9 sujets d'AUTRES leçons (2008 I-3 02ب, 2013 I-3 02, 2014 I-3 01, 2015 I-3 03, 2016 II I-03, 2017 I-4 02, 2018 I-3 03, 2020 I-3 02, 2024 I-3 03) : « على منوال » sur leur forme seulement |
| `alaqat-muthallathiya` | aucun — « على منوال » + adapted |
| `tarrid-muthallathiya` | 2010 II (08) 2R · 12–13 ; 2014 I-3 (03) 3L · 25–28 |
| `wadiya-idmajiya-muthallathat` | 2025 II (08) 7L→8 · 61–62 (niveau 5) |

Le PDF des sujets a 8 pages : « 5R » = page 5, colonne DROITE ; le corrigé (même nom + « حلول », sans extension,
62 pages) a sa propre numérotation. `pdftoppm -r 150 -png -f <p> -l <p> "<fichier>" <dossier>/x`, recadrer la colonne,
LIRE l'image. Scans de droite à gauche : le point final d'une phrase est à GAUCHE ; une liste « حيث: X ، Y » commence à
DROITE. Ne JAMAIS `git add` les PDF.

## Étapes hors leçon (`counted: false`, gardées telles qu'imprimées, LP de TA leçon)

Pythagore et sa réciproque (3AM), Thalès et sa réciproque (unité 9), angle inscrit / rotation (unité 13), aires,
pourcentages, argent, écriture scientifique. Entre leçons de l'unité 10 : une étape d'une autre leçon de l'unité COMPTE
dans la synthèse seulement ; ailleurs, étiquette-la avec le LP le plus proche de ta leçon, comptée si c'est un
prérequis direct de l'unité (ex. calculer un cos dans `hasiba-muthallathiya`).

**Correction du lead (2026-10-08, après `tarrid-muthallathiya`)** : Pythagore n'est PAS hors leçon partout. Le P3 de
`tarrid-muthallathiya` est « حل المثلث القائم كاملا بخاصية فيثاغورس والنسب المثلثية والزاوية المتممة » : un côté d'un
triangle rectangle calculé par Pythagore DANS une modélisation compte (P3) dans cette leçon et dans la synthèse. Restent
`counted:false` : la RÉCIPROQUE de Pythagore (3AM), Thalès, aires, argent, distances dans un repère.

## Valeurs, arrondis, calculatrice

- Angle : arrondi demandé explicitement (« بالتدوير إلى الوحدة من الدرجة ») → `rational`, clé = valeur arrondie ; les
  signatures de misconception attrapent l'arrondi par défaut, la mauvaise fonction (sin/cos/tan), le rapport inversé, le
  mode radian (`MISC-MUTH-*` existants d'abord).
- Longueur : arrondi demandé (« إلى 0,1 ») → clé arrondie ; une valeur exacte en √ (√3/2, 5√3) = `choice` (règle de
  l'unité 10 : pas de type « surd ») ou le coefficient a de a√r si l'énoncé le demande ainsi (convention unité 2).
- Un rapport trigonométrique exact (cos = 3/5) : `rational` (fraction acceptée).
- Touches de calculatrice (sin⁻¹, DEG, « 2nd ») : code LTR (`<code dir="ltr">` / LRI…PDI), jamais KaTeX
  (ARABIC_RTL_CONTRACT « Calculator keys are LTR code »).
- Une fraction de MOTS arabes (« طول الضلع المقابل / طول الوتر ») : jamais en KaTeX — dans un énoncé, écris-la en phrase
  (« … على … ») ; la leçon a `WordFraction` pour ses modules.
- `alaqat-muthallathiya` (cos² + sin² = 1, tan = sin / cos) : les « بيّن أن » sont des `selfCheck` ; chaque valeur
  déduite (sin à partir de cos, tan) est à saisir, exacte (fraction ou `choice` en √).

## Figures

Triangle rectangle avec son angle droit (`rightAngles`), l'angle étudié (`angles` avec `label`), longueurs données
sur les segments ; la valeur DEMANDÉE n'est jamais écrite. Exactes : l'oracle vérifie les longueurs (à une échelle),
l'angle droit et la mesure de l'angle dessiné (à 0,5° près pour un angle donné en degrés). Une situation réelle
(échelle contre un mur, rampe, cerf-volant, clinomètre, ombre) : figure « غير مرسوم بالأبعاد الحقيقية » acceptable si
`figureQuality` l'exige, mais angles et rapports respectés. Une figure de sujet mal conçue est REDESSINÉE (même
données, ligne « أعادت المنصّة رسم … » dans `solution`).
