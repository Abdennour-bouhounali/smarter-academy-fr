# Phase 8 — Unité 1 du manuel 4AM : « الأعداد الطبيعيّة والأعداد النّاطقة »

**Date** : 2026-09-18 · **Source pédagogique** : manuel officiel de mathématiques 4AM (الجيل الثاني), unité 1, pages 7–16, fourni par le propriétaire (`وحدة الأعداد الطبيعية و الأعداد الناطقة.pdf`, non versionné — 2 Mo, droits d'auteur).

## 1. Ce que cette phase établit

Le premier chapitre algérien construit **à partir du manuel scolaire** et non d'une décomposition inférée, et avec lui la hiérarchie canonique réutilisable pour tous les chapitres suivants :

```
المجال (chapters)  →  الوحدة (units)  →  الدرس (lessons)  →  الكفاءات (learning_points)
                                              ├── المتطلبات السابقة (lesson_prerequisites, learning_point_prerequisites — pédagogiques, jamais bloquants)
                                              ├── الطريقة / المناولة / الوضعية (lesson_resources, déclarées dans lesson.config.js → resources[])
                                              ├── التمارين (content/*.js dans la leçon + content/practice/4am/<leçon>/)
                                              └── الإتقان (module `evaluation` = seule source de preuve)
                       └── أدمج تعلّماتي (leçon de kind `synthesis`, jamais comptée comme un درس)
```

## 2. Le manuel, source de vérité

- **Extraction canonique** : `docs/sources/4am/unit1/extraction.json` — 72 éléments (objectifs, défi, أستعدّ, 8 activités, 6 blocs de معارف, 4 méthodes, 4 « دوري الآن », 40 exercices, 9 QCM, la وضعية), chacun avec page, section, numéro, formulation au mot près, réponse calculée (`answerSource: computed` — le manuel n'a pas de corrigé) et `destinations` (une destination par élément, réutilisations déclarées `duplicatedIn`).
- **Traçabilité** : chaque donnée de leçon porte `source: { type: 'textbook', elementId, page, section, number }` ; les ajouts de la plateforme portent `type: 'platform_addition'` et s'affichent « مثال تفاعلي إضافي » (un seul : les candidats supplémentaires du rail de la manipulation de la leçon 1).
- **Garde** : `npm run check:textbook` (`scripts/check-textbook-coverage.mjs`) échoue si un élément extrait n'a pas exactement une destination, ou si un contenu cite un élément inexistant. Intégré à `check:lessons`.
- **Écarts constatés dans le manuel** (encodés, jamais corrigés en silence) : activité 6 imprime « PGCD(… ; 25) » là où le calcul donne 28 ; exercice 5, première affirmation lue « 8 يقسم 4 » (faux) — lecture retenue et signalée ; أستعدّ item 9 : le diviseur imprimé est −9/4, l'affirmation est donc fausse ; terminologie : « الفروق المتتابعة » (manuel) / « المتتالية » (programme).

## 3. Les 8 leçons (+ synthèse) et leurs points d'apprentissage

| # | Code | Titre (manuel) | LP | Manipulation | Durée |
|---|---|---|---|---|---|
| 1 | `qasim-adad-tabii` | التعرّف على قاسم لعدد طبيعي | 4 | `divisor-explorer` | 45 |
| 2 | `qawasim-adad-tabii` | قواسم عدد طبيعي | 4 | `factor-pairs` | 50 |
| 3 | `khawass-qawasim` | خواص قواسم عدد طبيعي | 4 | `divisor-properties` | 55 |
| 4 | `qasim-mushtarak-akbar` | القاسم المشترك الأكبر لعددين طبيعيين | 4 | `common-divisors` | 45 |
| 5 | `tayin-pgcd` | تعيين القاسم المشترك الأكبر لعددين طبيعيين | 3 | `common-divisors` | 40 |
| 6 | `bahth-pgcd` | البحث عن القاسم المشترك الأكبر لعددين طبيعيين | 5 | `pgcd-differences`, `euclidean-algorithm` | 65 |
| 7 | `awwaliyan-fima-baynahuma` | العددان الأوّليّان فيما بينهما | 3 | `coprime-explorer` | 40 |
| 8 | `ikhtizal-kasr` | اختزال كسر | 4 | `fraction-reduction` | 65 |
| — | `wadiya-idmajiya-aadad` (synthesis) | أدمج تعلّماتي (أؤكّد + الوضعية) | 1 | — | 40 |

Les LP sont listés dans `packages/core/curriculum/dz/lessons_4am_2026_2027.json` (`pointsToLearn`, `pointPrerequisites`) ; les prérequis entre leçons dans `prerequisiteLessonCodes`. Leçons 1–6 tracent vers le sujet officiel `pgcd`, 7–8 vers `aadad_awwaliya` (la leçon `aadad-awwaliya` — nombres premiers — reste `coming_soon` ; son recouvrement sur les fractions irréductibles est à arbitrer par le propriétaire quand son unité du manuel sera fournie).

## 4. Le système de manipulation

> **Refonte du 2026-09-18 (2ᵉ passe).** Les huit manipulations sont devenues des
> LABORATOIRES TACTILES : l'élève porte un objet (une taille de rayon, un nombre
> de colonnes, un nombre de baquets, un diviseur, une copie du diviseur) dans une
> zone, et la notation apparaît en CONSÉQUENCE de son geste. Contrat complet,
> architecture et check-list : `docs/architecture/MANIPULATION_CONTRACT.md`.
> Geste réel au pointeur (`useDragInteraction`) avec aimant, refus expliqué en
> arabe, et alternative sans glisser (toucher-poser, clavier) toujours
> disponible. Flux imposé : mission → action → découverte → conjecture → règle ;
> le résultat ne peut pas s'afficher avant la découverte. Quatre paliers par type
> et « مختبر حر » borné. Mode classe complet (pas à pas, rejouer, masquer la
> conclusion, montrer la solution, changer les nombres sous contraintes).

`apps/web/src/lessons/common/manipulations/` : registre fermé de types (`packages/core/curriculum/manipulationTypes.js`, lu par les validateurs), une enveloppe commune (`ManipulationShell`), un état commun (`useManipulation`), des **primitives partagées** (`DivisionDisplay`, `EquationDisplay`, `DivisorSet`, `FactorPairRow`, `StepTimeline`, `HighlightedNumber`, `NumberInput`, `ExplanationPanel`, `TeacherControls`) que composent les 8 types. Toute mathématique vient de `packages/core/arithmetic/divisibility.js` (fidèle au manuel : les différences vont jusqu'au fruit nul, PGCD = « آخر فرق غير معدوم » / « آخر باقٍ غير معدوم »).

**Mode** : dans les modules, toujours « وضع التلميذ » (l'élève agit à chaque étape) — décision du propriétaire du 2026-09-18. Le mode classe (« الخطوة التالية », masquer la conclusion, changer les nombres sous contraintes) reste implémenté dans `TeacherControls` pour une future surface enseignant (`allowModeSwitch`).

## 5. Données et API

- **Catalogue** : `dz/units_4am_2026_2027.json` (nouveau), `lessons_4am_2026_2027.json` (règle `one_lesson_per_official_topic_unless_textbook_unit`), `coursesData.js` (`chapter.units`, `getUnitById`, `getUnitOfLesson`, chemin `/courses/moyen/4am/<ميدان>/units/<وحدة>`), `freeLessons.js` (les trois premières leçons de l'unité sont gratuites — modifiable en une ligne).
- **Base** (additif, migrations `2026_09_21_00000{1..5}`) : `units`, `lessons.unit_id/kind/title_source/textbook_ref`, `lesson_prerequisites`, `learning_point_prerequisites` (`required_mastery`), `lesson_resources`. Importateurs étendus ; `ScopeCurriculum::DEPENDENT_TABLES` complété.
- **API** (auth, e-mail vérifié) : `GET /api/v1/curriculum/grades/{code}` (arbre complet, chargement anticipé), `GET /api/v1/lessons/{code}/structure` (leçon + unité + LP + prérequis + ressources + modules + exercices).
- **Surfaces de navigation** (toutes lisent le même catalogue, aucune ne verrouille) : la page des cours (`Courses.jsx`, cartes d'unité « وحدات الكتاب المدرسي » sous le ميدان, puis « مواضيع أخرى ») → la page d'unité (`UnitPage.jsx`) → l'index de leçon (`LessonIndex.jsx`, fil d'Ariane avec l'unité, section الكفاءات / المتطلبات / المناولات), et les pages de l'espace élève « دروسي » (`MesCours.jsx`) et « استكشاف » (`Explorer.jsx`) qui, sous un ميدان, montrent les mêmes cartes d'unité puis les autres leçons (helper partagé `components/student/unitGrouping.js`).
- **Déploiement sans artisan** : `php artisan smarter:curriculum-sql --grade=4am --retire-lesson=pgcd --out=…` émet des upserts PAR CODE (FK résolues par sous-requête, jamais de DELETE, `publication_status` jamais écrasé). Voir `docs/deployment/HOSTINGER_UNIT1_MIGRATION.sql` et `HOSTINGER_UNIT1_CURRICULUM_DATA.sql`.

## 6. Pratique

`content/practice/4am/<leçon>/level-N/` : 60 fichiers, tous issus du manuel (`metadata.source`), niveaux = progression du manuel. Nouveautés du moteur : `answerType: integerSet`, politique `requiredForm: 'irreducible'` enforcée (valeur juste non réduite → `partially_correct`, message `notIrreducible`), `content/practice/policy.json` (minimum par niveau nominatif pour les leçons issues du manuel — le défaut 3 × 5 est conservé pour les autres), 16 misconceptions arabes dans `misconceptions.json`.

## 7. Ce qui a été retiré

La leçon prototype `pgcd` (dossier, e2e, catalogue, gratuité). Sa ligne `lessons` et ses 7 LP sont conservés en base (retirés/archivés) : la progression des élèves qui l'avaient ouverte reste lisible.

## 7bis. Gratuité (2026-09-18)

À la demande du propriétaire, les NEUF leçons écrites de l'unité sont gratuites
pour l'instant (`FREE_LESSON_IDS`). Le mécanisme est inchangé : une liste nommée,
propagée jusqu'à `lessons.tier` et appliquée par `ContentAccess` côté serveur.
Revenir aux trois leçons du cahier des charges (§17) = retirer des identifiants
de cette liste.

## 8. Validation (2026-09-18)

`npm test` ✅ (core 279, web 4953, scripts) · `validate-lessons --strict` ✅ (9 leçons, 32 LP couverts) · `validate-exercises --strict` ✅ · `audit:knowledge:gate` ✅ · `check:katex` ✅ · `check:routes` ✅ · `check:non-blocking` ✅ · `check:textbook` ✅ · `npm run build` ✅ · e2e `4am-aadad-tabiiya-natiqa.mjs` 26/26 ✅ · e2e `espace-unit-cards.mjs` (دروسي / استكشاف) 11/11 ✅ · e2e `manipulations.mjs` (glisser réel, clavier, mobile 320 px, mode classe, mouvement réduit) 33/33 ✅ · backend (MySQL, `phpunit.local.xml`) : suites curriculum 43/43 ✅ après correction des noms de clés étrangères de `learning_point_prerequisites` (le nom dérivé par Laravel dépassait les 64 caractères de MySQL — erreur 1059 ; noms explicites `lp_prereq_lp_fk` / `lp_prereq_prereq_fk`, reportés dans `HOSTINGER_UNIT1_MIGRATION.sql`) · `pint` ✅.
