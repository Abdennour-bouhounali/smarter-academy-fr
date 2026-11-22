# Official sources — mathematics, collège (France)

Fetched on 2026-11-22. **The French learning net (`packages/core/curriculum/fr/`) is defined from these texts and from
nothing else** (owner, 2026-11-22: « they must be defined and get it from the official resources »). A textbook, a
tutoring site or the old `smarter_academy_programmes_maths_2026.json` is never a source.

How they were read: the PDFs were downloaded and extracted with `pdftotext -layout` (`_txt/`); Légifrance was read
through a fetch tool that relays quoted fragments; **the HTML pages of education.gouv.fr and eduscol refused automated
reading (HTTP 403), so what is attributed to them below rests on search snippets and is marked « snippet »** — re-read
those pages in a browser before quoting them to the public.

## Which text applies to which grade

| Grade | 2026-2027 | 2027-2028 | 2028-2029 → |
|---|---|---|---|
| 6e | cycle 3 programme of 2025 (`15_…`) | same | same |
| 5e | **new** cycle 4 programme of 2026 (`02_…`) | same | same |
| 4e | cycle 4 programme, 2020 consolidation (`01_…`, maths pp. 127–137) | **new** programme (`02_…`) | same |
| 3e | cycle 4 programme, 2020 consolidation (`01_…`) | same | **new** programme (`02_…`) |

Proof for cycle 4 — arrêté du 18 février 2026 (NOR MENE2602912A, JORF du 4 mars 2026, BO n° 10 du 5 mars 2026, p. 13,
`08_…`), article 3: « Les dispositions du présent arrêté entrent en application à la rentrée de l'année scolaire
2026-2027 en tant qu'elles s'appliquent à la classe de cinquième, à la rentrée de l'année scolaire 2027-2028 en tant
qu'elles s'appliquent à la classe de quatrième et à la rentrée de l'année scolaire 2028-2029 en tant qu'elles
s'appliquent à la classe de troisième. »

Proof for 6e — arrêté du 10 avril 2025 (NOR MENE2504620A, BO n° 16 du 17 avril 2025), article 3: in force at the
rentrée 2025-2026 for CM1 and 6e, 2026-2027 for CM2 (read on Légifrance, relayed quote).

**Consequence for the net.** 3e is built on the 2020 text, with its « repères annuels de progression » (`06_…`, the
document that splits the cycle into 5e / 4e / 3e) and its « attendus de fin d'année » (`20_…`). The 2026 text for 3e
(`OUTLINE_3e.md`, part B) is read at the same time, so that a lesson built now survives 2028: its domains differ (no
separate « Grandeurs et mesures »; « Organisation et gestion de données et probabilités »; « Proportionnalité,
fonctions »; « La pensée informatique »), and the words homothétie, rotation, semblables, latitude, histogramme,
arbre, agrandissement do not appear anywhere in its extracted text — NOT verified as removals (the 5e and 4e sections
must be read first).

## The documents

| Folder | What | Use |
|---|---|---|
| `01_programme_cycle4_2020/` | Programme du cycle 4, « en vigueur à la rentrée 2020 » (BOEN n° 31 du 30 juillet 2020), 139 p. | 3e (until 2027-28), 4e (2026-27) |
| `06_reperes_annuels_progression_maths_c4/` | Repères annuels de progression, cycle 4 (2019), 13 p. | which item belongs to 5e / 4e / 3e under the 2020 text |
| `20_attendus_maths_3e/`, `19_attendus_maths_4e/` | Attendus de fin d'année 3e, 4e (2019) | « ce que sait faire l'élève » + examples of success |
| `13_attendus_maths_5e/` | Attendus 5e (2019) | OLD programme — background only |
| `02_programme_maths_cycle4_2026_annexe2/` | New cycle 4 maths programme (annexe 2 of the arrêté du 18-2-2026), 20 p., written year by year | 5e now, 4e 2027, 3e 2028 |
| `08_bo10_2026-03-05_a/` | BO n° 10 du 5 mars 2026 | the legal source of `02_` |
| `03_exemples_mise_en_oeuvre_c4_2026/` | Eduscol, examples for the new programme (5e, 4e, 3e), 51 p. | companion of `02_` |
| `11_calendrier_nouveaux_programmes/` | Eduscol, calendar of the new programmes (07.2026) | cross-check |
| `15_programme_maths_cycle3_2025_annexe2/` | Cycle 3 maths programme of 2025 (CM1 / CM2 / Sixième), 28 p. | 6e |
| `23_exemples_mise_en_oeuvre_6e_2025/`, `24_livret_accompagnement_maths_6e_2026/` | Eduscol, 6e companions | 6e |
| `12_attendus_maths_6e/`, `14_reperes_annuels_progression_maths_c3/` | 2019 documents of the FORMER cycle 3 programme | background only |
| `05_bo_special4_2026-09-17_dnb/` | BO spécial n° 4 du 17 septembre 2026 — the brevet from the 2027 session (maths: pp. 18–19) | the exercise bank's exam format |
| `07_…`, `16_…` | Two official « sujets de référence » of the maths test, série générale | models of a 2027 paper |
| `22_liste_automatismes_475708/` | « DNB 2026 : liste indicative d'automatismes » (October 2025) | part 1 of the test; no 2027 edition was found |
| `04_dnb_calendrier_2027/` | Dates of the written tests, session 2027 | maths: Monday 28 June 2027, 10 h – 12 h |
| `18_calendrier_scolaire_opendata/` | Ministry open data, school calendar 2026-2027 (218 records) | Stage 2D |
| `OUTLINE_3e.md` | Working outline of 3e, 1,334 lines: part A = the 2020 text item by item with the repères and the attendus; A.7 = 25 learning points the official documents place in 3e; part B = the 2026 text for 3e; part C = the automatisms | the starting point of the 3e net — its `[→ 3e]` tags are the outline author's reading, said so in the file |

## The brevet's mathematics test from the 2027 session

Note de service du 11 septembre 2026, NOR MENE2623228N (`05_…`, pp. 18–19): written test, coefficient 2, **2 hours**,
marked out of 20; two parts on two separate papers, no break. **Part 1 — automatisms and direct applications: 6
points, 20 minutes, WITHOUT calculator**, short-answer questions. **Part 2 — reasoning and problem solving: 14 points,
1 h 40, with calculator**; any form except multiple choice; every answer justified unless said otherwise; 2 points for
the mastery of language. The test examines « le programme de mathématiques de la classe de troisième s'il est en
vigueur ou, à défaut, des programmes de cycle 4 » — read here as: sessions 2027 and 2028 on the 2020 text (an
inference, not a quote). Both reference papers: part 1 = 9 questions; part 2 = 3 exercises of 4 points.

Not established: which list of automatisms binds the 2027 session (the note points to the « objectifs d'apprentissage »
of the NEW programme, which does not apply to 3e yet). Past papers: Eduscol, « Préparer le DNB avec les sujets des
annales » (snippet; the page could not be opened).

## The school calendar 2026-2027 (metropolitan France)

Arrêté du 22 octobre 2025, NOR MENE2526965A, JORF du 23 octobre 2025. Dates as written in its annex (relayed quotes;
the split by zone is confirmed by the open data file):

| | Zone A | Zone B | Zone C |
|---|---|---|---|
| Rentrée des élèves | mardi 1er septembre 2026 | same | same |
| Toussaint | samedi 17 octobre → lundi 2 novembre 2026 | same | same |
| Noël | samedi 19 décembre 2026 → lundi 4 janvier 2027 | same | same |
| Hiver | samedi 13 février → lundi 1er mars 2027 | samedi 20 février → lundi 8 mars 2027 | samedi 6 février → lundi 22 février 2027 |
| Printemps | samedi 10 avril → lundi 26 avril 2027 | samedi 17 avril → lundi 3 mai 2027 | samedi 3 avril → lundi 19 avril 2027 |
| Été | samedi 3 juillet 2027 | same | same |

« Les classes vaqueront le vendredi 7 mai 2027 ». Classes resume on the morning of the day given. Zone A: Besançon,
Bordeaux, Clermont-Ferrand, Dijon, Grenoble, Limoges, Lyon, Poitiers. Zone B: Aix-Marseille, Amiens, Lille,
Nancy-Metz, Nantes, Nice, Normandie, Orléans-Tours, Reims, Rennes, Strasbourg. Zone C: Créteil, Montpellier, Paris,
Toulouse, Versailles.

## Not established

- The NOR numbers of the 2015, 2018 and 2020 arrêtés behind the 2020 consolidation come from search-result titles.
- The BO reference of the 2019 repères and attendus (probably note de service n° 2019-072, BO n° 22 du 29-5-2019).
- Whether the two-part format of the maths test began at the 2026 session.
- The série professionnelle of the brevet was not looked at.
