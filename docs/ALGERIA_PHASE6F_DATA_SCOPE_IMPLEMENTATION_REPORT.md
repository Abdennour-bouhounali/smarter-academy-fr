# Phase 6F — Rapport d'implémentation : périmètre de données du catalogue et de la base DZ

**Exécuté** : 2026-09-16. Compagnon de `ALGERIA_4AM_CURRICULUM.md` et de
`ALGERIA_IMPLEMENTATION_ROADMAP.md` (Phase 7, dont ce travail est désormais un
prérequis explicite).

**Objectif de la phase**, tel que reçu : avant que la phase 7 (autorité du
curriculum algérien) ne commence, le catalogue et la base DZ ne doivent plus
porter le curriculum français hérité comme périmètre actif. Le résultat visé
était strictement à deux classes : la 4AM avec le programme fourni par le
propriétaire (4 domaines, 28 sujets), et la seconde classe DZ déjà prévue par
le projet, sans inventer de leçon ni de point d'apprentissage.

---

## 1. Inventaire initial

Base MySQL locale `smarter-academy-dz`, mesuré avant toute modification :

| Entité | Compte |
|---|---|
| grades | 8 (toutes françaises, toutes `is_active = 0`) |
| chapters | 36 |
| lessons | 133 |
| learning_points | 1067 |
| lesson_modules / practice_exercises | 0 / 0 |

Par classe :

| code | is_active | chapitres | leçons | points |
|---|---|---|---|---|
| 6e | 0 | 5 | 24 | 192 |
| 5e | 0 | 5 | 16 | 101 |
| 4e | 0 | 5 | 19 | 111 |
| 3e | 0 | 4 | 24 | 258 |
| seconde | 0 | 5 | 31 | 303 |
| premiere_specialite | 0 | 5 | 19 | 102 |
| terminale_specialite | 0 | 4 | 0 | 0 |
| terminale_complementaires | 0 | 3 | 0 | 0 |

Toute table applicative référençant une ligne de curriculum (`learning_evidence`,
`learning_evidence_learning_point`, `student_learning_point_progress`,
`student_lesson_progress`, `lesson_final_test_attempts`, `practice_sessions`,
`exercise_attempts`, `question_attempts`, `hint_events`, `notebook_notes`,
`student_reports`, `diagnostic_sessions`) comptait **0 ligne**. `users` comptait
3 comptes, tous avec `grade = NULL`. `entitlements`, `activation_codes` et
`activation_code_batches` étaient vides et ne portent, structurellement, aucune
colonne de curriculum.

## 2. Source catalogue authentifiée

`packages/core/curriculum/coursesData.js` est la seule source de vérité du
catalogue. Il n'existe **aucun** `DataCourses.json` dans le dépôt.
`packages/core/curriculum/.generated/curriculum-export.json` est un artefact de
build **gitignoré** (`.gitignore:13`), produit par `exportCurriculum.mjs` et
consommé par `smarter:import-curriculum` / `RegistryHealthService` — jamais une
source, jamais modifié à la main.

## 3. Seconde classe retenue, et pourquoi

Le second identifiant n'était pas à deviner : `ALGERIA_PLATFORM_MASTER_SPEC.md`
§3 le nomme explicitement, à trois reprises dans le dépôt (§3, §22, §24) :

> « The initial active curriculum contains ONLY: 4AM — السنة الرابعة متوسط ·
> Terminale — السنة الثالثة ثانوي »

Aucun document ne fixait en revanche son *identifiant technique* :
`ALGERIA_IMPLEMENTATION_ROADMAP.md` (Phases 7-9) mentionne `terminale_dz`
uniquement comme exemple (« e.g. / or similar — naming to be decided »), et
aucun programme officiel n'existe pour cette classe
(`ALGERIA_TAKEOVER_IMPLEMENTATION_REPORT.md` §19, B1 : « Terminale-DZ reste
entièrement bloquée »). Décision retenue avec le propriétaire : code
`terminale_dz`, niveau `thanawi` (miroir du choix `moyen` déjà arrêté pour la
4AM dans `ALGERIA_4AM_CURRICULUM.md` §8). Aucun programme n'a été inventé pour
elle — voir §4 ci-dessous.

## 4. Périmètre 4AM

Programme officiel : `docs/ALGERIA_4AM_CURRICULUM.md` + sa transcription
`packages/core/curriculum/dz/programme_4am_2026_2027.json`, fournis par le
propriétaire du projet le 2026-09-16. **4 domaines, 28 sujets**, transcrits au
mot près (le fichier JSON le dit lui-même : « CE FICHIER EST UNE
TRANSCRIPTION, PAS UNE INTERPRÉTATION »).

Représentation retenue : les 4 domaines deviennent des **chapitres**, les 28
sujets sont portés par leur chapitre dans une nouvelle liste `topics`
(colonne `chapters.topics`, JSON), et **aucune leçon n'est créée**. Le
découpage en leçons reste une décision de la phase 7, explicitement laissée
ouverte par le document source (`À DÉCOMPOSER`). Seuls 6 des 28 sujets
portent des méthodes ou parties nommées par le programme
(`namedMethodsAr`/`namedPartsAr`) ; les 22 autres n'en portent aucune, et
aucune n'a été inventée pour eux.

Vérifié programmatiquement, dans les deux sens, à trois étages de la chaîne
(catalogue JS, export JSON, base de données) : les 28 identifiants et
intitulés correspondent exactement à ceux de
`programme_4am_2026_2027.json` — aucun manquant, aucun ajouté, aucun modifié.

## 5. Conception de la migration / du nettoyage de données

**Constat déterminant** : `CurriculumImporter` (`smarter:import-curriculum`)
est un pur upsert — il ne supprime jamais rien. Rétrécir le catalogue source
seul n'aurait donc rien retiré de la base ; il fallait une commande dédiée.

**`smarter:scope-curriculum`** (nouvelle, `apps/api/app/Console/Commands/ScopeCurriculum.php`) :

- lit les classes à conserver depuis l'**export** (jamais une liste locale) ;
- lit le **graphe de clés étrangères depuis `information_schema`** au moment
  de l'exécution, plutôt que de faire confiance à une liste écrite dans le
  code — une table découverte hors de la carte connue fait échouer la
  commande plutôt que d'être ignorée ;
- affiche le compte à conserver/supprimer (classes, chapitres, leçons,
  points) **avant** toute suppression ;
- affiche, table par table, ce que la cascade atteindrait, en distinguant les
  tables *cascade* (ligne détruite) des tables *SET NULL* (lien coupé, ligne
  conservée) ;
- **refuse** si une ligne de données ÉLÈVE serait détruite par cascade, sauf
  `--force` **et** `--allow-student-data-loss` ensemble — l'un sans l'autre
  ne supprime rien ;
- **refuse inconditionnellement en environnement `production`**, sans option
  de contournement ;
- exige `--force` puis une confirmation qui cite les comptes réels avant
  d'agir ;
- supprime dans l'ordre explicite des dépendances (points → leçons →
  chapitres → classes) à l'intérieur d'une transaction, et **vérifie**, dans
  la même transaction, que les classes restantes sont exactement celles
  attendues et qu'aucune ligne orpheline ne subsiste — sinon la transaction
  est annulée ;
- signale les comptes dont `users.grade` (chaîne libre, sans clé étrangère)
  ne correspond plus à aucune classe conservée, sans jamais modifier ces
  comptes.

**`RegistryHealthService`/`RegistryHealth --gate`** a été étendu pour détecter
explicitement une classe en base absente du catalogue (« hors périmètre »,
distinct de la dérive d'activation) et toute ligne de curriculum orpheline
(chapitre sans classe, leçon sans chapitre, point sans leçon).

## 6. Comptes avant/après

**Avant** (base de développement locale) : 8 classes, 36 chapitres, 133
leçons, 1067 points d'apprentissage, toutes françaises et inactives.

**Simulation (`--dry-run`)**, exécutée avant toute suppression réelle :

```
                          Conservé   Supprimé
classes                          2          8
chapitres                        4         36
leçons                           0        133
points d'apprentissage           0       1067

Lignes dépendantes atteintes (toutes à 0) :
  lesson_modules, practice_exercises, learning_evidence,
  student_lesson_progress, lesson_final_test_attempts, practice_sessions,
  student_learning_point_progress, learning_evidence_learning_point (cascade)
  notebook_notes, student_reports (lien coupé, ligne conservée)
```

**Après** (`--force`, confirmé) :

| code | level | is_active | chapitres | leçons | points |
|---|---|---|---|---|---|
| 4am | moyen | 1 | 4 | 0 | 0 |
| terminale_dz | thanawi | 1 | 0 | 0 | 0 |

Total : 2 classes, 4 chapitres, 0 leçon, 0 point, 28 sujets répartis sur les 4
chapitres 4AM (4 + 9 + 6 + 9).

Comptes applicatifs, avant = après (aucune ligne touchée) :
`users` = 3, `entitlements` = 0, `activation_codes` = 0,
`activation_code_batches` = 0.

## 7. Tables affectées / protégées

**Affectées (suppression)** : `grades`, `chapters`, `lessons`,
`learning_points`, et par cascade (0 ligne réelle ici) `lesson_modules`,
`practice_exercises`, `learning_evidence`, `learning_evidence_learning_point`,
`student_learning_point_progress`, `student_lesson_progress`,
`lesson_final_test_attempts`, `practice_sessions`.

**Affectées (lien coupé, ligne conservée)** : `notebook_notes`,
`student_reports` — aucune ligne réelle concernée ici.

**Explicitement protégées, jamais touchées** : `users`, `entitlements`,
`activation_codes`, `activation_code_batches`, `subscriptions`, `payments`,
`provider_events`, `user_identities`, `admin_activity_logs`,
`personal_access_tokens`. `users.grade` a été inspecté (0 compte orphelin ici)
et documenté comme une chaîne libre à traiter en dehors de cette commande si
un cas se présente.

## 8. Tests

**JS/Vitest** : nouvelles suites dans `coursesData.test.js` (2 classes
exactes, 4 domaines, 28 sujets comparés au JSON source plutôt que retapés,
absence de classe française, `curriculumStatus` par classe) ; `learningPoints.test.js`,
`freeLessons.test.js` et le `catalogue.test.js` de 5e retargetés sur
`referenceCourseLevels` ; `registry.test.js` retargeté en assertion positive
(deux classes actives, aucune leçon française résolue) ; `check-dormant-isolation.mjs`
étendu avec un contrôle de frontière (aucun fichier produit n'importe
l'arbre de référence français) ; `check-activation-drift.test.mjs` : deux
scénarios de dérive de palier par leçon documentés `it.skip` (aucune leçon DZ
n'existe encore pour les exercer sans fabrication artificielle — réactivation
prévue en phase 7).

**PHP/Pest** : nouvelle suite `CurriculumScopeTest.php` (16 tests) — périmètre
exact après nettoyage, appartenance de chaque ligne restante, préservation des
comptes/droits/codes, refus sur perte de données élève, `--allow-student-data-loss`
seul ne supprime rien, refus sur export vide, refus en production, non-résurrection
après ré-import, fidélité des sujets importés, signalement sans modification
des comptes orphelins, et deux tests dédiés à la dérive de palier par leçon
côté `smarter:registry-health --gate` (comblant un trou de couverture
pré-existant, révélé par cette phase).

## 9. Résultat registry-health

```
✅ Activation et paliers cohérents (classes actives : 4am, terminale_dz ; 0 leçon(s) vérifiée(s)).
```

## 10. Résultat export/import

Export : `2 grades, 4 chapters, 28 topics, 0 lessons, 0 learning points`.
Import sur base préalablement chargée avec les 8 classes françaises (rejouant
le scénario réel) : la base passe de 10 classes / 133 leçons / 1067 points à 2
classes / 0 leçon / 0 point après `smarter:scope-curriculum --force`. Un
ré-import ultérieur (`smarter:import-curriculum`) laisse la base inchangée à 2
classes — vérifié comme test de non-régression permanent
(`test_importing_after_cleanup_does_not_resurrect_removed_grades`).

## 11. Résultat de construction frontend

`npm run build` réussit (avertissement pré-existant de taille de chunk,
non lié à cette phase). Vérification visuelle par navigateur automatisé
(Playwright) : `/courses` résout vers `moyen` → السنة الرابعة متوسط → 4
domaines → 28 sujets affichés en arabe sous RTL, avec compteurs pluriels
corrects ; la sélection de السنة الثالثة ثانوي affiche exclusivement le
message délibéré « البرنامج غير متوفّر بعد », sans repli de grille vide
trompeur. Deux défauts réels ont été trouvés et corrigés pendant cette
vérification : (a) les formes plurielles arabes de `topicsCount` ne
couvraient que 2 des 6 catégories que l'arabe distingue réellement
(`Intl.PluralRules('ar-DZ')` en a 6 : zero/one/two/few/many/other), ce qui
affichait la clé brute au lieu du texte ; (b) la grille de cours affichait un
message « aucun cours ne correspond » sous une classe qui n'a simplement
aucune leçon, ce qui n'est pas la même chose qu'une recherche sans résultat.

## 12. Limites connues

- La 4AM n'a ni leçon, ni module, ni exercice — c'est l'objet même de cette
  phase (préparer le périmètre, pas l'auteur du contenu).
- Terminale-DZ n'a aucun programme et le restera jusqu'à ce que le
  propriétaire en fournisse un.
- L'interface produit reste majoritairement en français hors des nouveaux
  écrans introduits ici (« Tous les chapitres », « Ma classe : », bandeau
  « Programme complet — 6e à Terminale »). Cette phase n'a ajouté aucune
  nouvelle chaîne française : les nouveaux textes (programme du chapitre,
  état « leçons à venir », état « programme non fourni ») sont entièrement en
  arabe. La traduction complète de l'habillage hérité reste hors périmètre.
- Les deux scénarios de dérive de palier par leçon dans
  `check-activation-drift.test.mjs` sont `it.skip` faute de leçon DZ réelle à
  muter ; une couverture équivalente existe côté PHP
  (`RegistryHealthService::tier()`), mais la réactivation JS attend la
  première leçon 4AM.
- Une sauvegarde complète de la base de développement locale a été prise
  avant toute suppression (`backup-dz-20260916-145521.sql`, conservée dans le
  répertoire de travail temporaire de la session) ; elle n'est pas versée
  dans le dépôt.

## 13. Confirmation

**Aucune leçon de production 4AM n'a été créée pendant cette phase.** Aucun
`lesson.config.js`, aucun point d'apprentissage inventé, aucun module, aucun
exercice, aucun contenu BossFinal. Les 28 sujets restent des entrées de
curriculum — pas des leçons — exactement comme demandé. Le dépôt
`smarter-academy-fr` n'a subi aucune modification. Aucune base de production
n'a été touchée ; aucun identifiant de production n'a été utilisé.
