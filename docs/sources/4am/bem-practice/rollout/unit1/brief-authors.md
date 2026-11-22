# Brief — unité 1 « الأعداد الطبيعيّة والأعداد النّاطقة » au format BEM (2026-10-06)

Demande du propriétaire (2026-10-06) : UNE LEÇON À LA FOIS, de la plus ancienne de la plateforme à la plus
récente, sans sauter. Ordre de l'unité 1 : `qasim-adad-tabii` → `qawasim-adad-tabii` → `khawass-qawasim` →
`qasim-mushtarak-akbar` → `tayin-pgcd` → `bahth-pgcd` (déjà converti : seul son niveau 5 est réaligné) →
`awwaliyan-fima-baynahuma` → `ikhtizal-kasr` → `wadiya-idmajiya-aadad`.

Ce brief reprend TOUTES les règles du brief de l'unité 2 (`../unit2/brief-authors.md`, §1–§7 : décisions
du propriétaire, niveaux, types de réponse, oracle, contrôle, rapport) — lis-le en entier — avec les
différences ci-dessous. Format commun : `docs/sources/4am/bem-practice/brief-authors.md` ; exemple de
référence : `content/practice/4am/bahth-pgcd/level-3/ex-4am-bahth-pgcd-l3-004.json` ; modèles récents :
les feuilles de l'unité 2 (`content/practice/4am/tawzif-khawass-judhur/…`).

## Différences propres à l'unité 1

1. **La banque actuelle est PETITE** (1 à 5 exercices par niveau, tirés du manuel et de « سلسلة التفوق »,
   `docs/sources/4am/unit1/`). Tu RÉÉCRIS les fichiers existants en place (ids inchangés, `kind: adapted`,
   source d'origine conservée) et tu CRÉES les fichiers manquants pour arriver à **10 par niveau**, en
   continuant la numérotation : `ex-4am-<leçon>-lN-NNN.json` (NNN = suivant libre … 010). Ne supprime rien.
2. **Aucun exercice d'annales n'appartient à ces leçons** (seule `bahth-pgcd` en cite, voir
   `../../annals-index.md`). Donc AUCUN badge « BEM <année> » : les feuilles nouvelles sont
   « على منوال BEM <année> » (`kind: modelled`, source `platform_addition` / `bem_modelled`), le badge nommant
   une session dont le sujet a vraiment cette structure (exercice de PGCD/fraction du الجزء الأول, ou الجزء
   الثاني pour le niveau 5). Libellé décidé par le propriétaire : on garde « على منوال BEM <année> » même
   quand seule la STRUCTURE de la session est reprise.
   Sessions utiles : 2008 I-1 (PGCD + fraction irréductible), 2009 I-4 02 (PGCD(500 ; 125)), 2010 I-2,
   2015 I-1, 2016 I-1, 2021 I-1, 2023 I-1 01 (756/216), 2024 I-2, 2025 I-2 ; الجزء الثاني 2020 et 2022 (PGCD).
   Ne recopie JAMAIS leurs nombres : les feuilles officielles appartiennent à `bahth-pgcd`.
3. **Ne sors pas du programme de ta leçon** : lis son `teachingScope` (include / exclude) dans
   `lesson.config.js`. Une compétence d'une autre leçon de l'unité (ex. PGCD par Euclide dans
   `qasim-adad-tabii`) n'apparaît qu'en étape `counted: false`, et avec parcimonie.
4. **Exemption de couverture** : `content/practice/policy.json` exempte aujourd'hui ta leçon (« minPerLevel 1,
   source manuel »). N'y touche pas : le lead la retire après l'audit, quand ta banque a 10 feuilles par niveau.
5. **Oracle** : écris `scripts/practice-oracle/<ta-leçon>.mjs` (`export const ORACLE = { … }`, outils dans
   `./helpers.mjs`), une clé par question non selfCheck, recalculée (diviseurs par balayage, PGCD par Euclide,
   fractions exactes `q(...)`). Le lead le branche dans le test commun et retire les anciennes entrées en ligne
   de ta leçon ; pour te contrôler avant, lance :
   ```bash
   node -e "import('./scripts/practice-oracle/<ta-leçon>.mjs').then(m=>console.log(Object.keys(m.ORACLE).length))"
   node scripts/validate-exercises.mjs --strict 2>&1 | grep -E "<ta-leçon>|Validation"
   ```
   puis demande au lead (dans ton rapport) de lancer l'oracle commun. Ne lance pas `vitest` en parallèle.
6. **Niveau 5** : 10 NOUVELLES « الوضعية الإدماجية (08 ن) », situations réelles algériennes, sans reprendre les
   « مسائل » de la leçon ni les situations des niveaux 5 déjà écrits dans l'unité (`bahth-pgcd` : ورشة
   الخياطة، التعاونية الحليبية، تبليط قاعة، عمي محمود، الفلاح 1188/528).
7. **Couverture du manuel et de « سلسلة التفوق »** : `node scripts/check-textbook-coverage.mjs` exige que certains
   éléments sources (ex. `ws01-ex-06`) restent cités par un exercice précis. Lance-le avant ET après ; ne crée aucun
   nouveau ✗ (déplacer un exercice du manuel : garder sa `source` et poser `adaptedFrom`). Leçon traitée avant
   toi : le nombre de ✗ ne doit pas augmenter.
   Depuis le 2026-10-07, une copie adaptée d'un exercice d'une autre leçon qui garde la `source` de l'original
   ET déclare `adaptedFrom` (id de l'original) est acceptée par le contrôle (elle compte pour la leçon
   d'origine) : c'est ainsi que `bahth-pgcd` reprend des exercices de ses leçons sœurs. Le contrôle est à 0 ✗.
