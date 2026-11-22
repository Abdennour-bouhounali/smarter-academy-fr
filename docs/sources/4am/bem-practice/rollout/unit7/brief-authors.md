# Brief — unité 7 « الدالة التآلفية » au format BEM (2026-10-07)

Une leçon à la fois : `mafhum-taalufiya` → `tamthil-bayani-taalufi` → `tanasub-taghayyurat` →
`tafsir-bayani-jumla` → `tarrid-taalufi` → `wadiya-idmajiya-taalufiya`. Toutes les règles des briefs précédents
s'appliquent : `../unit2/brief-authors.md` §1–§7, `../unit1/brief-authors.md` §5 (contrôles sans vitest) et §7
(couverture), `../unit3/brief-authors.md` (saisie), `../unit4/brief-authors.md` (inéquation = borne puis sens),
`../unit5/brief-authors.md` (couples `point`, formules courtes séparées pour 360 px), `../unit6/brief-authors.md`
(graphiques : tracer sans valeur = `selfCheck` ; lecture = valeur sur un nœud du quadrillage, figure en
`statement.figure` ; `statement.visual` est refusé sur une feuille d'examen). Contrat :
`docs/architecture/EXERCISE_CONTRACT.md` § « One step split into several questions ». RÉÉCRIS l'oracle
`scripts/practice-oracle/<leçon>.mjs` de ta leçon.

## Officiels (index `../../annals-index.md`) — cités une fois, mot pour mot, corrigé officiel

| Leçon | Officiels (session · ن · page sujet · pages corrigé) |
|---|---|
| `mafhum-taalufiya` | 2019 II (08) 5L · 44–47 |
| `tamthil-bayani-taalufi` | 2012 II (08) 2L→3R · 17–20 ; 2023 I-4 (03) 6L · 55–57 |
| `tanasub-taghayyurat` | 2008 I-4 (03) 1L · 5–7 ; 2016 I-3 (02,5) 4R · 32–35 ; 2025 I-4 (03) 7L · 61–62 |
| `tafsir-bayani-jumla` | 2009 II (08) 1L→2R · 8–11 ; 2014 II (08) 3L · 25–28 ; 2015 II (08) 4R · 29–31 ; 2018 II (08) 5R · 40–43 |
| `tarrid-taalufi` | 2007 II (08) 1R · 1–4 ; 2011 II (08) 2L · 14–16 ; 2013 II (08) 3R · 21–24 ; 2024 المسألة (08) 7R→7L · 58–60 |
| `wadiya-idmajiya-taalufiya` | 2017 II (08) 4L→5R · 36–39 |

Les « الجزء الثاني (08 ن) » officiels vont au **niveau 5** (ils comptent parmi les 10) ; les exercices du الجزء
الأول (02,5 / 03) aux niveaux 2–4. Un officiel recopie aussi l'échelle imposée (« 1cm يمثل 50 دقيقة ») : le tracé
demandé est `selfCheck`. Si le sujet DESSINE un graphique ou une figure, redessine-le en `statement.figure` (les
graduations de la bibliothèque sont 1, 2, 3… : donne l'unité dans l'énoncé / la légende, comme l'unité 6).
Tableaux « انقل وأكمل » : `statement.table`, une question par case à remplir.
Étapes hors unité `counted:false` : fonction linéaire seule (unité 6), équations / inéquations (unité 4), systèmes
(unité 5), PGCD (unité 1), géométrie. Coquille ou désaccord oracle ↔ corrigé : règle §1.5 (signaler).
