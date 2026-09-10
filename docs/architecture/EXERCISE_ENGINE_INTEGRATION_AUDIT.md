# Exercise Engine Integration Audit

> Phase : **audit + analyse d'écart + plan d'intégration**. Aucune ligne de
> code de production n'a été modifiée. Ouvert le 2026-09-10.
>
> Référence cible : [`EXERCISE_ENGINE_ARCHITECTURE.md`](./EXERCISE_ENGINE_ARCHITECTURE.md)
> (1765 lignes, **non implémenté**).
>
> Convention de statut utilisée partout dans ce document :
> `REUSABLE` · `PARTIAL` · `CONFLICT` · `NOT FOUND` · `UNKNOWN — REQUIRES VERIFICATION`

---

## 1. Executive Summary

**La conclusion centrale : le Moteur d'Exercices n'a pas besoin d'un nouveau
système de maîtrise. Il en existe déjà un, canonique, persistant, testé, et
en production avec de vraies données.**

La chaîne complète `question → correctness → evidence → learning point →
mastery → persistance serveur` existe et fonctionne aujourd'hui. Elle est
alimentée par un seul producteur (le test final « Boss Final »). La base de
production contient **1 067 learning points**, **193 preuves**, **131
rollups de maîtrise** répartis sur **8 niveaux** et **133 leçons**.

Le travail d'intégration de Practice n'est donc pas *« construire
l'évaluation des Learning Points »*, c'est **ajouter un second producteur de
preuves à un système d'évaluation qui existe déjà**, et construire autour de
lui la couche de contenu, de session et d'UI qui, elle, manque entièrement.

### Ce qui existe et se réutilise tel quel

| Élément | Où | Statut |
|---|---|---|
| Learning Points canoniques (ids stables, globalement uniques) | `learning_points` (MySQL) ← `coursesData.js` | `REUSABLE` |
| Modèle de preuve historique | `learning_evidence` + pivot `learning_evidence_learning_point` | `REUSABLE` |
| Rollup de maîtrise par (élève, LP) | `student_learning_point_progress` | `REUSABLE` |
| Moteur de maîtrise déterministe et pur | `App\Domain\Progress\Support\MasteryModel` | `REUSABLE` (à étendre) |
| Service d'enregistrement + validation de relation | `App\Domain\Progress\ProgressEngine` | `EXTEND` |
| File d'attente hors-ligne + idempotence | `evidenceQueue.js` + `attempt_id` unique | `REUSABLE` |
| Identité élève, Sanctum, scoping du stockage | `AuthContext` + `scopedStorage` | `REUSABLE` |
| Précédent complet de moteur serveur (banque, correction, misconceptions, adaptatif) | `App\Domain\Diagnostic\*` | `REUSABLE` comme **patron** |
| Registre de rendu de questions piloté par la donnée | `components/diagnostic/QuestionRenderer.jsx` | `REUSABLE` comme **patron** |

### Ce qui manque entièrement

Practice Hub, sélecteur de niveau, Exercise Player, sessions, carnet
(notebook), hints progressifs *en usage*, misconceptions structurées côté
élève, contenu d'exercices piloté par la donnée, et les 7 tables d'activité
décrites au §26 de la cible. **`NOT FOUND`** pour chacun.

### Les cinq conflits qui décident du plan

1. **`ProgressEngine` refuse par construction toute preuve non-`assessment`**
   (`ProgressEngine.php:48-51` → 422). Practice ne peut pas soumettre de
   preuve aujourd'hui. C'est un **garde-fou volontaire**, pas un bug : il
   faut l'élargir de `'assessment'` à un ensemble `{'assessment', 'practice'}`,
   pas le supprimer.
2. **`validate-lessons.mjs:275-285` interdit toute question `enabled: true`
   hors d'un module de stage `evaluation`.** C'est exactement l'invariant 1 de
   la cible (« les questions de module n'évaluent pas »), déjà mécanisé. Le
   contenu Practice vit **hors** de `lessons/`, donc hors de portée de cette
   garde — il lui faut sa propre garde.
3. **`is_correct` est calculé côté client** pour les leçons (asymétrie
   documentée et assumée face au diagnostic). Le §39 de la cible exige que
   le serveur ne fasse pas confiance au client. C'est le conflit le plus
   structurant du dossier.
4. **Aucune notion de rôle primaire/secondaire de LP.** 284 questions
   mappent déjà plusieurs LP, toutes à poids égal. La cible (§9) demande un
   LP primaire.
5. **`MasteryModel` ignore la difficulté** (`DEFAULT_DIFFICULTY = 2`, figé) et
   n'a pas de notion d'indice ni de source. La cible (§7) exige une politique
   multidimensionnelle. Le point d'extension est déjà nommé dans le docblock
   de la classe.

### Le levier pédagogique réel

L'audit de 2de (`docs/audits/2DE_LEARNING_POINT_AUDIT.md`) chiffre la
faiblesse que Practice corrige : **le test final compte 10 épreuves quel que
soit le nombre de LP** ; en 2de, **121 LP sur 249 ne sont mesurés que par
des questions partagées**, et **69 reposent sur UNE seule question partagée**.
Le serveur tranche la maîtrise à 0,70 sur cette base. Practice n'est donc pas
un ajout de confort : c'est **la source de preuve qui manque** pour que
`student_learning_point_progress` veuille dire quelque chose.

### Recommandation en une phrase

Commencer par les **contrats et le moteur de domaine pur** (schéma
d'exercice + évaluateur + politique de preuve), en `packages/core`, sans UI
ni base de données — parce que c'est la seule couche dont tout le reste
dépend, et la seule qu'on peut prouver entièrement par des tests avant
qu'une seule ligne de contenu n'existe. Détail en §32.

---

## 2. Target Architecture Summary

Résumé fidèle de `EXERCISE_ENGINE_ARCHITECTURE.md`, pour référence.

**Trois rôles pédagogiques disjoints** (§2) :

```text
MODULES DE LEÇON  → enseigner            → aucune évaluation de LP
TEST FINAL        → évaluer              → preuve de LP
PRACTICE          → entraîner/diagnostiquer → preuve de LP (même LP canonique)
```

**Une seule évaluation canonique par (élève, LP)** (§5.1), alimentée par deux
sources (`final_test`, `practice`) via un modèle de preuve historique jamais
écrasé (§6, §28). L'état courant est *dérivé* de la preuve, pas stocké comme
score final.

**Hiérarchie de contenu** (§8-9) : `Exercise` (problème scolaire complet) →
`Questions` (chacune évaluable indépendamment) → `Learning Points` (un
primaire, des secondaires optionnels).

**Deux modes de réponse** (§10) : QCM avec distracteurs porteurs de
misconceptions, et réponse libre MathLive avec `answerFormat` visible,
`expectedAnswer` caché, et `evaluationPolicy: {acceptEquivalent, requiredForm}`.

**Six issues canoniques** (§11) : `correct`, `equivalent_correct`,
`partially_correct`, `incorrect`, `syntax_error`, `abandoned`.

**Trois indices progressifs** (§12) : LOOK → DIRECTION → STRATEGY, jamais la
réponse, tracés comme événements historiques.

**Cinq niveaux** (§14), configurables, la difficulté étant multidimensionnelle
et non « des nombres plus gros ».

**Minimum initial** (§15) : 3 exercices × 5 niveaux = **15 exercices par leçon**.

**Contenu piloté par la donnée** (§23, invariants 5 et 13) : ajouter un
exercice ne doit jamais toucher au code React.

**Persistance serveur** (§26) : `practice_sessions`, `exercise_attempts`,
`question_attempts`, `hint_events`, `misconception_events`, `notebook_notes`,
`learning_point_evidence`.

**15 invariants** (§43), dont les plus contraignants pour ce dépôt : #1
(modules n'évaluent pas), #2/#3 (une seule maîtrise), #4 (preuve jamais
écrasée), #5/#13 (contenu = donnée), #6 (mapping LP explicite), #15 (l'état
doit être explicable par la preuve stockée).

---

## 3. Current Architecture Summary

Monorepo npm workspaces.

```text
apps/web      React 19 + Vite + react-router-dom + Tailwind + framer-motion
apps/api      Laravel 13 + Sanctum + MySQL
packages/core @smarter-academy/core — logique pure, zéro React/DOM/Vite
scripts/      gardes exécutables (AST) : validate-lessons, check-routes, audits
docs/         architecture / audits / lessons / reports
```

**Chiffres réels (relevés, pas estimés) :**

| Mesure | Valeur | Source |
|---|---|---|
| Leçons construites (`lesson.config.js`) | **132** | `find apps/web/src/lessons -name lesson.config.js` |
| Leçons en base | 133 | `SELECT COUNT(*) FROM lessons` |
| Learning Points en base | **1 067** | `SELECT COUNT(*) FROM learning_points` |
| Niveaux | 8 (6e→terminale_complementaires) | `grades` |
| Preuves enregistrées | 193 | `learning_evidence` |
| Rollups de maîtrise | 131 | `student_learning_point_progress` |
| Tentatives de test final | 14 | `lesson_final_test_attempts` |
| Déclarations `assessment:` en JSX | **1 339** dans 133 fichiers | grep |
| Configs déclarant `teachesLearningPointIds` | 134 | grep |
| Questions mappant ≥ 2 LP | 284 | grep |
| Appels `TapQuestion` / `NumericQuestion` | 771 / 402 fichiers | grep |

Répartition des leçons construites : 6e 24 · 5e 16 · 4e 19 · 3e 23 ·
seconde 31 · première spécialité 19.

**Le flux qui existe aujourd'hui, de bout en bout :**

```text
Épreuve QCM du Boss Final (JSX, littéraux)
  └─ assessment: {enabled:true, type:'assessment', learningPointIds:[...]}
       └─ BossFinal.jsx:submitBoss()  → correctness calculée CLIENT
            ├─ useEvidenceSubmission.submitEvidence()
            │    └─ POST /api/v1/lessons/{code}/evidence
            │         └─ ProgressEngine::recordEvidence()
            │              ├─ refuse tout type ≠ 'assessment'
            │              ├─ résout les LP globalement, exige UNE leçon
            │              ├─ idempotent par attempt_id
            │              ├─ INSERT learning_evidence (+ pivot N-N)
            │              └─ MasteryModel::updateConfidence() → UPSERT
            │                   student_learning_point_progress
            └─ useFinalTestAttempt.save()
                 └─ PUT /api/v1/lessons/{code}/final-test-attempt
                      └─ lesson_final_test_attempts (1 ligne/user+leçon, écrasée)
```

**Ce que ce flux prouve pour Practice :** le point d'insertion existe, il est
unique, il est validé côté serveur, il est idempotent, et il survit au
hors-ligne. Practice doit s'y brancher, pas le doubler.

---

## 4. Documentation Audit

19 documents lus intégralement ou en partie substantielle.

| Document | Statut | Ce qu'il apporte / contredit |
|---|---|---|
| `docs/architecture/EXERCISE_ENGINE_ARCHITECTURE.md` | **cible, non implémentée** | 1765 lignes. La spécification. Rien de ce qu'elle décrit n'existe en code. |
| `docs/architecture/EXERCISE_CONTRACT.md` | `PARTIAL` — **partiellement périmé** | Canonise `{isCorrect, fields?, feedback?}` comme « le contrat d'exercice », fondé sur `useAdaptiveExercise`. Or ce hook a **zéro consommateur** aujourd'hui (§13). Son §« Attempt model » documente précisément le trou que la cible vient combler. |
| `docs/architecture/PROGRESS_MODEL.md` | `REUSABLE` — excellent | Sépare explicitement *complétion* et *maîtrise*, nomme `getModuleMastery` comme un proxy à **remplacer**, pas à étendre. Décrit les sémantiques de fusion multi-appareils. |
| `docs/architecture/LEARNING_ARCHITECTURE.md` | `REUSABLE` — **le document clé** | La hiérarchie Grade→Chapter→Lesson→LP, la dérivation des ids, le caractère *append-only* de `pointsToLearn`, le flux de preuve complet, la frontière de confiance, le modèle de maîtrise. À lire avant toute conception. |
| `docs/architecture/AI_LESSON_CONTRACT.md` | `REUSABLE` — normatif | Les 4 règles absolues du mapping LP, la convention `assessment: {enabled, type, learningPointIds}`, et la règle « une question mappe le(s) LP qu'elle mesure réellement ». Practice doit hériter de ces règles. |
| `docs/architecture/LESSON_CONTRACT.md` | `REUSABLE` | Contrat de leçon/module ; §« Progression non bloquante » = invariant dur. |
| `docs/architecture/LESSON_INTEGRATION_GUIDE.md` | `REUSABLE` | §7 : la forme **obligatoire** du test final (QCM seul, silencieux jusqu'au submit unique, chaque épreuve liée à ses LP). §9 : le tableau complet de la couche de persistance et l'**idiome de garde d'hydratation** à copier pour tout nouvel état persisté. |
| `docs/architecture/KNOWLEDGE_MAP.md`, `KNOWLEDGE_DEPENDENCY.md` | `REUSABLE` (hors périmètre direct) | La carte des connaissances (briques, `priorKnowledge`, `requires`) est un système parallèle aux LP, pas une seconde maîtrise — il ne produit aucune preuve. |
| `docs/architecture/DIAGNOSTIC_6E.md` | `REUSABLE` comme patron | Justifie « la banque de questions vit dans du code versionné, pas en base ». Précédent direct pour le choix de format du contenu Practice. |
| `docs/audits/2DE_LEARNING_POINT_AUDIT.md` | **critique** | Chiffre le déficit de densité de preuve (voir §1). Fournit aussi la classe de défaut « enseigné mais non mesuré » (41 items en 2de). |
| `docs/reports/ARCHITECTURE_FOUNDATION_AUDIT.md`, `MOBILE_READINESS_REPORT.md`, `LEARNING_POINT_COVERAGE.md`, `MIGRATION_AUDIT.md` | historiques | Utiles pour la généalogie ; **partiellement périmés** (voir ci-dessous). |
| `docs/architecture/ARCHITECTURE.md` | `CONFLICT` — **périmé** | §3 affirme « Laravel … currently minimal: User + Contact only. No curriculum/progress/attempt data model exists server-side » et §5 « Nothing in this chain talks to the backend today ». **Les deux sont faux depuis les migrations du 2026-08-18.** Ne pas s'y fier ; `LEARNING_ARCHITECTURE.md` est la version à jour. |
| `docs/reports/MOBILE_READINESS_REPORT.md` | `CONFLICT` — **périmé** | Cite `Module02CalculHypotenuse.jsx` / `Module03TableauValeurs.jsx` comme sites de migration vérifiés. **Ces fichiers n'existent plus** (leçons reconstruites au kit). Ses conclusions sur MathLive « vérifié en navigateur » ne valent plus pour le code actuel. |

**Documents cherchés et absents :** `ARCHITECTURE_FOUNDATION_*` existe sous
`docs/reports/` (deux fichiers) ; il n'y a **pas** de `NOTEBOOK*`,
`PRACTICE*`, `MISCONCEPTION*`, `HINT*`, ni de doc dédiée aux tests finaux
autre que `LESSON_INTEGRATION_GUIDE.md` §7.

---

## 5. Frontend Audit

### 5.1 Pile et conventions

| Aspect | Réalité | Fichier |
|---|---|---|
| Framework | React 19, Vite | `apps/web/package.json` |
| Routage | `react-router-dom`, **table statique unique** | `apps/web/src/App.jsx` |
| État global | React Context seul — **aucune** librairie d'état | `context/AuthContext.jsx`, `context/WorkspaceLayoutContext.jsx` |
| Client API | `fetch` fin, ne lève **pas** sur non-2xx | `services/apiClient.js` |
| Stockage | une seule couture, `scopedStorage` préfixe `u_{id\|anon}_` | `utils/storage.js`, `utils/authUserId.js` |
| Style | Tailwind + `framer-motion` + `lucide-react` | — |
| Maths affichées | KaTeX via `MathText.jsx` (`$…$`) | `lessons/common/components/MathText.jsx` |
| Tests | Vitest (`--passWithNoTests` côté web), e2e maison Playwright/Puppeteer dans `apps/web/e2e/` | — |

### 5.2 Routage — la contrainte à connaître

`App.jsx` importe **une fonction de routes par leçon construite** (~132
imports) et étale leurs `<Route>` dans un `<Routes>` unique. Chaque leçon
expose `routes.jsx` qui lit `LESSON_BASE_PATH` et `LESSON_CONFIG.modules[].path`.

```text
/courses/{college|lycee}/{grade}/{domaine_officiel}/{lesson-id}          index
/courses/{college|lycee}/{grade}/{domaine_officiel}/{lesson-id}/{slug}   module
```

Gardes exécutables :
- `npm run check:routes` — vérifie que `LESSON_BASE_PATH` **est égal** au
  chemin du catalogue. Un écart renvoie silencieusement l'élève à l'accueil.
- Le segment de domaine doit être le **domaine officiel avec souligné**
  (`espace_geometrie`, `pensee_informatique`), pas un tiret.

**Conséquence pour Practice :** ajouter des routes Practice par leçon dans
`App.jsx` multiplierait par deux une table déjà à 132 imports. Recommandation
en §25 : **une seule route paramétrée**, hors de l'arbre par leçon.

### 5.3 Le kit de leçon — le système vivant

`apps/web/src/lessons/common/kit/` est ce que toutes les leçons récentes
utilisent.

| Export | Rôle | Réutilisable pour Practice ? |
|---|---|---|
| `ContentModule` + `useKit` | coque d'un module formatif (progression, verrouillage, effets, auto-avance) | **Non** — c'est la coque *de module de leçon*. Practice n'est pas un module. |
| `TapQuestion` | QCM un-tap, correction toujours révélée, `onAnswered` inconditionnel | `REFACTOR` — bonne base visuelle, mais pas de hints, pas de misconception structurée, pas de `assessment` |
| `BatchChoiceQuestion` | QCM multi-lignes | `REFACTOR` (même raison) |
| `NumericQuestion` | saisie numérique, `parse` injectable, `expected` nombre ou prédicat, `explainFor(n)` | `REFACTOR` — `explainFor(n)` est **le seul crochet de type misconception du frontend**, mais c'est une fonction JSX, pas de la donnée |
| `BossFinal` | moteur du test final, **seul consommateur d'`assessment`** | `KEEP` — ne pas y toucher |
| `PrerequisiteDiagnostic` | module 0, local seulement | `KEEP` |
| `KnowledgeBrick`, `PredictionChips` | carte des connaissances / prédiction sans verdict | `KEEP` |

`LessonUI.jsx` (453 lignes) fournit les primitives : `Feedback` (tons
`ok|ko|hint|info`), `ChoiceGrid`, `ValidateButton`, `StepCard`, `MissionBrief`,
`NumberField`, `TimerToggle`/`TimerDisplay`, `XPBurst`, `StepProgressBar`,
`StreakChip`, `AutoAdvance`. **Toutes réutilisables telles quelles** par un
Exercise Player — ce sont des composants de présentation sans état.

### 5.4 Code mort confirmé — à ne surtout pas ressusciter sans décision

Vérifié par grep exhaustif sur `apps/web/src` :

| Composant / hook | Importateurs réels | Statut |
|---|---|---|
| `components/MathInput.jsx` (MathLive) | **0** (seulement le README) | `NOT FOUND` en usage — voir §12 |
| `hooks/useAdaptiveExercise.js` | **0 module de leçon** (seulement `useSimpleExercise` et `ExerciseValidator`, eux-mêmes morts) | mort |
| `hooks/useSimpleExercise.js` | **0** | mort |
| `components/ExerciseValidator.jsx` | **0** | mort |
| `components/AdaptiveFeedback.jsx` | 1 (`ExerciseValidator`, mort) | mort |
| `components/GuidedSolution.jsx` | **0** | mort |
| `components/QuizQuestion.jsx` | **0** | mort |
| `components/TutorGuide.jsx` | **0** | mort |

C'est un **îlot auto-référentiel complet** : `useAdaptiveExercise →
ExerciseValidator → AdaptiveFeedback → GuidedSolution`. Il est néanmoins la
**seule machine à états hints/tentatives/solution du dépôt**, sa partie pure
est déjà extraite et testée dans `packages/core/exercise/adaptiveExerciseState.js`
(14 tests), et c'est ce que `EXERCISE_CONTRACT.md` canonise. Traitement
recommandé en §18.

### 5.5 Points d'intégration recommandés

| Composant cible | Emplacement recommandé | Réutilise |
|---|---|---|
| `PracticeHub` | `apps/web/src/pages/practice/PracticeHub.jsx` | `LessonIndex`'s hero/progress patterns |
| `LevelSelector` | `apps/web/src/features/practice/components/LevelSelector.jsx` | `QuantityCard`, `StepProgressBar` |
| `ExercisePlayer` | `features/practice/components/ExercisePlayer.jsx` | `ModuleLayout` (ou une coque propre), `MissionBrief` |
| `QuestionRenderer` | `features/practice/components/QuestionRenderer.jsx` | **le patron de registre** de `components/diagnostic/QuestionRenderer.jsx` |
| `ChoiceInput` | `features/practice/components/inputs/ChoiceInput.jsx` | `ChoiceGrid` (as-is) |
| `MathInput` | `features/practice/components/inputs/MathAnswerInput.jsx` | `components/MathInput.jsx` **à réécrire** (§12) |
| `HintPanel` | `features/practice/components/HintPanel.jsx` | `Feedback tone="hint"`, logique de `adaptiveExerciseState.js` |
| `FeedbackPanel` | `features/practice/components/FeedbackPanel.jsx` | `Feedback`, `MathText` |
| `Notebook` | `features/practice/components/Notebook.jsx` | rien — nouveau |
| `SessionProgress` | `features/practice/components/SessionProgress.jsx` | `StepProgressBar` |
| `SessionSummary` | `features/practice/components/SessionSummary.jsx` | `ProfilMaitrise` de `BossFinal.jsx` (à extraire) |
| Bouton « Commencer à pratiquer » | `lessons/common/components/LessonIndex.jsx` — **un seul endroit pour les 132 leçons** | — |

`LessonIndex.jsx` est un composant unique partagé par toutes les leçons : le
point d'entrée Practice s'y ajoute **une fois**, pas 132 fois. C'est le
principal cadeau que fait l'architecture existante.

---

## 6. Backend Audit

Laravel 13 + Sanctum. **8 contrôleurs, 3 domaines, 12 modèles, 22
migrations, 18 tests de fonctionnalité + unitaires.**

### 6.1 Conventions observées (à respecter, pas à réinventer)

1. **Domaines sous `app/Domain/{Curriculum,Diagnostic,Progress}/`**, avec un
   sous-dossier `Support/` contenant des classes **statiques et pures**
   (`MasteryModel`, `AnswerChecker`, `AdaptiveSelector`, `ProfileBuilder`,
   `LearningProfileBuilder`). Aucune ne touche Eloquent. Toutes sont testées
   sans base de données.
2. **Contrôleurs minces** : validation via `$request->validate()` inline (il
   n'y a **aucune** classe `FormRequest` dans le dépôt), délégation immédiate
   au service de domaine, `DomainException` → 422.
3. **Aucune classe `Resource`/transformer.** La sérialisation est une méthode
   `private function serialize()` dans le contrôleur
   (`LessonFinalTestAttemptController::serialize`) ou un tableau construit
   dans un `Builder` pur.
4. **Aucun repository.** Eloquent est appelé directement depuis les services
   de domaine.
5. **Aucune Policy.** L'autorisation est *structurelle* : `$request->user()`
   est la seule source d'identité, jamais un champ du corps de la requête ;
   les requêtes sont systématiquement filtrées par `where('user_id', ...)`.
   Le seul `Gate` est `admin` (`AppServiceProvider`).
6. **Routes** : préfixe `v1`, groupes `throttle:6,1` (public),
   `auth:sanctum` (protégé), `['auth:sanctum','can:admin']` (admin).
   Nommage : `/lessons/{lessonCode}/...` et `/students/me/...`.
7. **Le code de leçon, pas l'id numérique**, circule dans les URLs.
8. **Tests** : `tests/Feature/*FlowTest.php`, SQLite en mémoire
   (`phpunit.xml:26-27`), assertions `assertDatabaseHas`/`assertDatabaseCount`.

### 6.2 Le cœur : `ProgressEngine`

`apps/api/app/Domain/Progress/ProgressEngine.php` — **la seule porte
d'écriture de la maîtrise**. Quatre garanties, toutes à préserver :

| Garantie | Ligne | Ce qu'elle implique pour Practice |
|---|---|---|
| Refus de tout `assessmentType` ≠ `'assessment'` | `:48-51` | **`CONFLICT`** — bloque Practice. À élargir. |
| Idempotence par `attempt_id` (unique en base) | `:53-62` | À conserver : c'est ce qui rend la file hors-ligne sûre. |
| Résolution des LP **globalement** puis dérivation de la leçon, avec exigence d'unicité et de correspondance au code réclamé | `resolveLesson()`, `:96-133` | Réutilisable tel quel pour Practice. |
| Transaction : `learning_evidence` + pivot + rollup en un seul bloc | `:64-88` | À conserver. |

### 6.3 `MasteryModel` — le point d'extension déjà nommé

`app/Domain/Progress/Support/MasteryModel.php`, 4 constantes, 2 méthodes pures.

```php
MASTERED_THRESHOLD = 0.70   GAP_THRESHOLD = 0.40
STARTING_CONFIDENCE = 0.5   LEARNING_RATE = 0.22
DEFAULT_DIFFICULTY = 2      // « figé — si les questions de leçon gagnent
                            //   des métadonnées de difficulté, faites-les
                            //   passer par ProgressEngine plutôt que
                            //   d'élargir le rôle de cette constante »
```

Le docblock de `DEFAULT_DIFFICULTY` **prescrit littéralement la manière
d'étendre**. Practice apporte enfin une difficulté réelle (le niveau 1–5).
`updateConfidence()` accepte déjà `int $difficulty` en troisième paramètre :
**la signature est prête, seul l'appelant ne la remplit pas.**

Un test verrou (`tests/Unit/Progress/MasteryModelTest.php`) échoue si les
seuils divergent de ceux du diagnostic.

### 6.4 Le domaine Diagnostic — le patron à copier

`app/Domain/Diagnostic/` est **la preuve que ce dépôt sait déjà faire un
moteur d'exercices serveur complet** :

- **Banque de questions en constantes PHP versionnées**
  (`SixiemeDiagnosticProvider::QUESTIONS`, 623 lignes) — pas de base, pas de
  CMS. Rationale documentée : relisible en PR, livrée atomiquement.
- **Correction serveur pure** (`AnswerChecker::check()`) sur 6 représentations
  (`choice`, `numeric`, `fraction`, `ordering`, `classification`,
  `numberline`), retournant `{isCorrect, misconceptionId}`.
- **Misconceptions structurées** : `'misconceptions' => ['b' => 'groupement-mots-litteral']`
  pour les QCM, signatures de valeurs pour le numérique.
- **Sélection adaptative pure** (`AdaptiveSelector::selectNext()`) : suivi de
  misconception prioritaire, blocage transitif par prérequis manquant,
  escalier de difficulté, arrêt borné à 24 questions.
- **Interface par niveau** (`GradeDiagnosticProvider`) : ajouter la 5e =
  enregistrer un provider, rien d'autre.

`AnswerChecker` refuse explicitement de porter le comparateur algébrique de
`packages/core` (docblock `:11-19`) — **la banque 6e a été écrite pour éviter
l'algèbre libre**. Practice, lui, en a besoin (§12).

---

## 7. Database Audit

22 migrations. Tables pertinentes, relevées dans la base de production.

| Table | But | Colonnes clés | Relations | Usage réel | Réutilisable ? | Changements requis |
|---|---|---|---|---|---|---|
| `users` | identité | `id, email, role, grade` | → tout | 6 lignes | **Oui, as-is** | aucun |
| `grades` | niveau | `code, order` | ← chapters | 8 | as-is | aucun |
| `chapters` | domaine officiel | `grade_id, code` | ← lessons | 36 | as-is | aucun |
| `lessons` | leçon | `chapter_id, code, official_object_code, status, tier` | ← learning_points | 133 | as-is | aucun |
| `learning_points` | **LP canonique** | `lesson_id, code (UNIQUE), title, order, diagnostic_skill_id, retired_at` | ← evidence (N-N) | **1 067** | **Oui, as-is** | aucun |
| `learning_evidence` | **preuve historique** | `user_id, lesson_id, question_code, attempt_id (UNIQUE), is_correct, assessment_type, answer (json), submitted_at` | N-N LP | 193 | **Oui, à étendre** | + colonnes source/contexte (§23) |
| `learning_evidence_learning_point` | pivot N-N | `learning_evidence_id, learning_point_id`, unique composite | — | — | **as-is** | *(option : + `role`)* |
| `student_learning_point_progress` | **rollup maîtrise** | `user_id, learning_point_id` (unique), `status, confidence, attempts, correct_count, last_evidence_at` | — | 131 | **Oui** | voir §22 |
| `student_lesson_progress` | position dans le parcours | `status, current_module, completed_modules (json), completion_mode` | — | 113 | as-is | aucun |
| `lesson_final_test_attempts` | dernière tentative de test final | `user_id+lesson_id` unique, `score, total_questions, answers (json)` | — | 14 | as-is | aucun — **ne pas en faire le modèle des sessions Practice** |
| `diagnostic_sessions` / `_responses` / `_skill_assessments` | diagnostic | `misconception` persisté | — | 3 | as-is | aucun |
| `contacts`, `cache`, `jobs`, `personal_access_tokens` | infra | — | — | — | as-is | aucun |

### Confrontation avec les 7 tables de la cible (§26)

| Table cible | État | Verdict |
|---|---|---|
| `learning_point_evidence` | **existe déjà sous le nom `learning_evidence`** (+ pivot N-N) | **NE PAS CRÉER.** Étendre. Créer une seconde table de preuve violerait les invariants 2 et 3. |
| `practice_sessions` | `NOT FOUND` | à créer |
| `exercise_attempts` | `NOT FOUND` | à créer |
| `question_attempts` | `NOT FOUND` | à créer |
| `hint_events` | `NOT FOUND` | à créer — ou colonne `hints_used` sur `question_attempts` si l'ordre des indices n'est pas requis (voir §33) |
| `misconception_events` | `NOT FOUND` | **probablement inutile comme table** : `question_attempts.misconception_id` porte la même information sans dénormalisation. Précédent : `diagnostic_responses.misconception` est une colonne, pas une table. |
| `notebook_notes` | `NOT FOUND` | à créer |

**Tables de contenu de la cible** (`exercises`, `exercise_questions`,
`exercise_choices`, `exercise_hints`, …) : **à ne pas créer.** Le dépôt a une
convention nette et deux fois justifiée — le contenu vit dans du code
versionné (`coursesData.js`, `SixiemeDiagnosticProvider::QUESTIONS`, les JSX
de leçon), jamais en base. Voir §14 et §26.

---

## 8. API Audit

### 8.1 Surface existante

```text
POST   /api/v1/contact                                   public
POST   /api/v1/auth/register                             public, throttle:6,1
POST   /api/v1/auth/login                                public, throttle:6,1
GET    /api/v1/auth/me                                   auth
POST   /api/v1/auth/logout                               auth
PATCH  /api/v1/auth/grade                                auth
POST   /api/v1/diagnostic/sessions                       auth
GET    /api/v1/diagnostic/sessions/current               auth
POST   /api/v1/diagnostic/sessions/{sessionId}/responses auth
POST   /api/v1/lessons/{lessonCode}/evidence             auth   ← le point d'entrée maîtrise
PUT    /api/v1/lessons/{lessonCode}/progress             auth
GET    /api/v1/lessons/{lessonCode}/final-test-attempt   auth
PUT    /api/v1/lessons/{lessonCode}/final-test-attempt   auth
DELETE /api/v1/lessons/{lessonCode}/final-test-attempt   auth
GET    /api/v1/students/me/learning-profile              auth
GET    /api/v1/students/me/lesson-progress               auth
GET    /api/v1/contact                                   auth + can:admin
```

Conventions : corps JSON en **camelCase**, réponses `{success: bool, ...}`,
erreurs de domaine en 422 avec `message` en français, 404 pour une leçon
inconnue, 401 sans jeton. Le `sessionId` du diagnostic est un **UUID
client-fourni** dans l'URL — précédent direct pour `sessionId` Practice.

### 8.2 API Practice proposée (spécification seulement)

Le diagnostic donne le patron de session ; on le suit.

---

**1. Ouvrir (ou reprendre) une session**

```text
METHOD          POST
PATH            /api/v1/lessons/{lessonCode}/practice/sessions
PURPOSE         Ouvrir une session de pratique à un niveau donné, ou
                reprendre celle qui est encore ouverte (idempotent).
AUTHORIZATION   auth:sanctum. L'élève = le porteur du jeton, jamais le corps.
REQUEST         { "sessionId": "<uuid client>", "level": 1..5 }
RESPONSE 201    { "success": true, "session": { sessionId, level, lessonCode,
                  status: "open", exercisesCompleted, startedAt } }
RESPONSE 200    idem si la session existait déjà (reprise)
DB EFFECT       INSERT practice_sessions, ou lecture si sessionId connu.
```

**2. Demander l'exercice suivant**

```text
METHOD          GET
PATH            /api/v1/practice/sessions/{sessionId}/next-exercise
PURPOSE         Le moteur de recommandation choisit et renvoie l'exercice —
                SANS les réponses attendues (§39 de la cible).
AUTHORIZATION   auth:sanctum + la session doit appartenir au demandeur (404 sinon).
REQUEST         —
RESPONSE 200    { "success": true, "exercise": { id, level, metadata,
                  statement, questions: [{ id, statement, answerType,
                  answerFormat, choices?: [{id, content}], hintCount }] } }
RESPONSE 200    { "success": true, "exercise": null, "reason": "level_exhausted" }
DB EFFECT       INSERT exercise_attempts (started).
NOTE            `expectedAnswer`, `isCorrect` par choix, `misconceptionId`
                et le contenu des indices ne sont JAMAIS dans cette réponse.
```

**3. Demander un indice**

```text
METHOD          POST
PATH            /api/v1/practice/question-attempts/{questionAttemptId}/hints
PURPOSE         Révéler l'indice suivant et le tracer comme événement.
AUTHORIZATION   auth:sanctum + propriété de la tentative.
REQUEST         —  (le serveur sait quel indice est le suivant)
RESPONSE 200    { "success": true, "hint": { index: 1..3, type, content },
                  "remaining": int }
RESPONSE 409    plus d'indice disponible
DB EFFECT       INSERT hint_events (ou incrément hints_used).
```

**4. Soumettre une réponse — l'endpoint central**

```text
METHOD          POST
PATH            /api/v1/practice/sessions/{sessionId}/answers
PURPOSE         Corriger côté SERVEUR, enregistrer la tentative, créer la
                preuve de LP, recalculer la maîtrise. Une seule transaction.
AUTHORIZATION   auth:sanctum + propriété de la session.
REQUEST         { "attemptId": "<uuid client, idempotence>",
                  "exerciseId": "...", "questionId": "...",
                  "answer": { … payload structuré selon answerType … },
                  "hintsUsed": int, "startedAt": iso8601 }
RESPONSE 201    { "success": true, "duplicate": false,
                  "result": { outcome: "correct|equivalent_correct|
                              partially_correct|incorrect|syntax_error",
                              feedback: "...", misconceptionId: ?string,
                              correctAnswer?: … (seulement si la politique
                              de la question autorise la révélation) },
                    "learningPoints": [{ code, status, confidence }] }
RESPONSE 200    idem avec duplicate:true (rejeu du même attemptId)
DB EFFECT       INSERT question_attempts
                + INSERT learning_evidence (assessment_type = 'practice')
                + INSERT pivot learning_evidence_learning_point
                + UPSERT student_learning_point_progress
                — le tout dans une DB::transaction, exactement comme
                  ProgressEngine::recordEvidence le fait déjà.
```

**5. Clore la session**

```text
METHOD          POST
PATH            /api/v1/practice/sessions/{sessionId}/complete
PURPOSE         Fermer la session et renvoyer la synthèse.
AUTHORIZATION   auth:sanctum + propriété.
REQUEST         —
RESPONSE 200    { "success": true, "summary": { exercisesCompleted,
                  questionsAnswered, correctCount, hintsUsed,
                  misconceptions: [...], learningPoints: [{code, before,
                  after, status}], recommendedNext: {...} } }
DB EFFECT       UPDATE practice_sessions SET status='completed', completed_at.
```

**6. État du Practice Hub**

```text
METHOD          GET
PATH            /api/v1/lessons/{lessonCode}/practice/overview
PURPOSE         Alimenter le Hub : niveaux, nombre d'exercices, progression,
                déverrouillage, état des LP de la leçon.
AUTHORIZATION   auth:sanctum.
REQUEST         —
RESPONSE 200    { "success": true, "lesson": {code, title},
                  "levels": [{ level, exerciseCount, completedCount,
                               unlocked, reason? }],
                  "learningPoints": [{ code, title, status, confidence }],
                  "openSession": {...}|null }
DB EFFECT       aucun (lecture).
```

**7. Carnet**

```text
METHOD          POST | GET | PATCH | DELETE
PATH            /api/v1/practice/notes   ·   /api/v1/practice/notes/{id}
PURPOSE         Créer/lire/modifier/supprimer une note ou une erreur marquée.
AUTHORIZATION   auth:sanctum ; toute lecture filtrée par user_id ; 404 (pas
                403) sur une note d'autrui, pour ne pas divulguer l'existence.
REQUEST(POST)   { lessonCode, exerciseId?, questionId?, learningPointCode?,
                  content, mistakeType? }
RESPONSE 201    { "success": true, "note": {...} }
DB EFFECT       INSERT/UPDATE/DELETE notebook_notes.
```

**Endpoints existants à ne pas toucher** : `/lessons/{code}/evidence` reste la
porte du test final. Practice a la sienne parce que **son contrat est
différent** : le serveur corrige, le client ne déclare pas `isCorrect`.

---

## 9. Learning Point Audit

Réponses directes aux questions A–J du cahier des charges.

### A. Où les LP sont-ils définis ?

Deux niveaux, une seule source.

- **Source de vérité (autorité)** : `packages/core/curriculum/coursesData.js`
  (3 043 lignes), champ `pointsToLearn: string[]` dans chaque entrée de
  `smaMetadata`, indexée par une clé catalogue (`'6e_nombres_entiers'`,
  `'seconde_vecteurs'`, …). Le fichier fusionne les métadonnées maison avec
  le programme officiel `smarter_academy_programmes_maths_2026.json`.
- **Index d'exécution** : la table MySQL `learning_points`, alimentée par
  `node packages/core/curriculum/exportCurriculum.mjs` →
  `.generated/curriculum-export.json` → `php artisan smarter:import-curriculum`.

`LEARNING_ARCHITECTURE.md` le dit sans ambiguïté : « MySQL is the **runtime
index** of that source, never a second definition of it. »

### B. Quel est l'id canonique d'un LP ?

`{gradeId}_{lessonId}_P{i+1}`, où `i` est l'index dans `pointsToLearn`.
Colonne `learning_points.code`, **UNIQUE globalement**.

**La dérivation est en JavaScript, pas en PHP** — point important pour qui
chercherait à l'étendre :

```js
// packages/core/curriculum/coursesData.js:2924-2928
learningPoints: pointsToLearn.map((title, i) => ({
  id: `${gradeId}_${lessonId}_P${i + 1}`,
  title,
  order: i + 1,
})),
```

`exportCurriculum.mjs:40-44` renomme `id` → `code` ;
`CurriculumImporter.php:112-163` ne fait que *consommer* un `code`
pré-calculé et upserter par lui (retrait par `retired_at`, jamais de
suppression dure).

⚠️ **Les ids ne sont pas analysables en découpant sur `_`** : les préfixes de
lycée en contiennent eux-mêmes (`premiere_specialite_…`). Tout code qui
voudrait extraire le niveau d'un id de LP doit le faire par correspondance
de préfixe connu, pas par `split('_')`.

Exemples réels tirés de la base :

```text
6e_algorithmique-programmation_P1
3e_nombres-rationnels_P3
seconde_fonctions-en-python-2nde_P1
premiere_specialite_second-degre-resoudre-1ere_P2
```

**Propriété critique : `pointsToLearn` est *append-only* après import.**
Réordonner ou retirer une entrée change silencieusement la compétence que
désigne un `P{n}` existant, alors que les lignes de preuve continuent de
pointer sur le code. `php artisan smarter:validate-curriculum --strict`
signale la dérive de titre. Un LP qui disparaît est **retiré**
(`retired_at`), jamais supprimé.

**Note d'écart avec la cible :** le §4 de la cible illustre
`LP-2N-DER-03`. Le format réel est différent. **Le format réel gagne** — il
est en base, en production, référencé par 1 339 déclarations JSX et 193
lignes de preuve. Aucune raison de le changer, et une excellente de ne pas le
faire.

### C. Comment une leçon référence-t-elle ses LP ?

Par `teachesLearningPointIds: string[]` sur chaque module de
`LESSON_CONFIG.modules` — **134 fichiers** sur 132 configs (deux configs
hors-arbre). Les ids doivent être des **littéraux** (le validateur les *parse*,
ne les exécute pas). Un module de stage `evaluation` a l'interdiction d'en
déclarer (`validate-lessons.mjs:171-172`) : « an evaluation module evaluates ».

### D. Comment le test final référence-t-il les LP ?

Par métadonnée au niveau de la question, sur chaque épreuve du tableau
`epreuves` passé à `BossFinal` :

```js
assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_nombres-rationnels_P4'] }
```

**1 339 déclarations dans 133 fichiers.** Toujours des littéraux statiques.
`BossFinal.jsx:294` appelle `submitEvidence(ep, isCorrect, {picked})` pour
chaque épreuve au moment du submit unique.

Validé par `npm run validate:lessons` (`scripts/validate-lessons.mjs`), qui
impose : id littéral unique ; `enabled` booléen ; `type ∈
{discovery, practice, assessment}` ; `enabled:true ⇒ type:'assessment'` **et**
au moins un `learningPointId` appartenant **à cette leçon** ; `discovery`/
`practice` **interdits** de porter des `learningPointIds` ; et — invariant
décisif — `enabled:true` seulement dans un module de stage `evaluation`
(`:275-285`).

### E. Où l'évaluation des LP est-elle calculée ?

`apps/api/app/Domain/Progress/Support/MasteryModel.php` — deux fonctions
pures : `updateConfidence(float, bool, int $difficulty = 2): float` et
`statusFor(float): 'mastered'|'reinforce'|'gap'`. Appelées **uniquement**
depuis `ProgressEngine::updateProgress()`. Aucune règle d'évaluation n'est
dispersée dans React. La cible §7 l'exige : c'est **déjà le cas**.

### F. Où est-elle stockée ?

`student_learning_point_progress`, une ligne par `(user_id,
learning_point_id)` (contrainte unique), colonnes `status, confidence,
attempts, correct_count, last_evidence_at`. Lu par
`GET /students/me/learning-profile` via `LearningProfileBuilder`.

### G. L'évaluation est-elle persistante côté serveur ?

**Oui.** MySQL, 131 lignes en production. Ni localStorage, ni dérivé client.
Le frontend n'a qu'un *cache* (`useFinalTestAttempt`) pour la tentative de
test final, ce qui est autre chose.

### H. Existe-t-il déjà un modèle de preuve / de tentative ?

**Preuve : oui, complet.** `learning_evidence` (193 lignes) + pivot N-N
`learning_evidence_learning_point`. Chaque ligne porte `question_code`,
`attempt_id` (unique, clé d'idempotence), `is_correct`, `assessment_type`,
`answer` (JSON), `submitted_at`. **L'historique n'est jamais écrasé** —
invariant 4 de la cible, déjà tenu.

**Tentative au sens de la cible §27 : `PARTIAL`.** Il manque `outcome`
(seulement un booléen), `hintsUsed`, `misconceptionId`, `level`,
`startedAt`/durée, `normalizedAnswer`. `lesson_final_test_attempts`
n'est *pas* ce modèle : c'est un instantané écrasé à chaque soumission, une
ligne par (élève, leçon), sans historique — délibérément.

### I. Practice peut-il alimenter proprement le système existant ?

**Oui, avec un seul changement bloquant et trois extensions.**

Bloquant : `ProgressEngine.php:48-51` rejette tout `assessmentType` ≠
`'assessment'` avec « Seules les questions d'évaluation génèrent une preuve
d'apprentissage. » C'est une défense en profondeur voulue contre les
questions de *module*. Practice n'est pas une question de module — c'est une
**seconde source d'évaluation légitime**, exactement ce que le commentaire de
la migration anticipait : « Kept as a column rather than hard-coded so a
future evidence source has somewhere to say so. »

Tout le reste fonctionne déjà : résolution des LP, contrainte d'unicité de la
leçon, transaction, idempotence, rollup, profil.

### J. Que faut-il changer pour accepter la preuve Practice ?

Par ordre de nécessité :

1. **Élargir le garde-fou de type** en un ensemble de sources autorisées
   (`'assessment'`, `'practice'`), en gardant le rejet de `'discovery'` et
   `'practice_lab'` — c'est-à-dire des questions de module. *(bloquant)*
2. **Faire remonter la difficulté** : `updateConfidence()` accepte déjà le
   paramètre ; il suffit de lui passer le niveau 1–5 normalisé sur 1–4.
   *(nécessaire pour l'invariant « la difficulté compte »)*
3. **Faire compter les indices** : pondérer la valeur probante d'une réussite
   obtenue après indices. *(§12 de la cible)*
4. **Rôle primaire/secondaire** sur le pivot, pour ne pas créditer un LP
   secondaire autant qu'un LP primaire. *(§9 de la cible)*
5. **Étendre le vocabulaire d'issue** : `is_correct` booléen ne peut pas
   représenter `partially_correct` ni `syntax_error`. Ajouter une colonne
   `outcome` en gardant `is_correct` (rétro-compatibilité des 193 lignes).

Aucun de ces cinq points ne demande un second système de LP. **Ne pas en
créer un.**

### Vérification transversale sur trois niveaux

| | 6e `nombres-rationnels`… | 3e `nombres-rationnels` | 2nde `vecteurs-2nde` |
|---|---|---|---|
| LP dans `coursesData.js` (`pointsToLearn`) | oui | oui (10) | oui |
| LP en base | oui | 10 | oui |
| `teachesLearningPointIds` dans la config | oui | oui | oui |
| Épreuves du test final avec `assessment` | oui | 10 | 14 |
| Ids cohérents entre les trois | oui | oui | oui |

Le validateur **échoue** si un `learningPointId` cité par une question
n'appartient pas à la leçon du catalogue — cette cohérence n'est donc pas une
observation, c'est une garantie de CI.

### Une question ↦ plusieurs LP ?

**Oui, 284 questions** le font. Exemple réel
(`proportionnalite-3e/modules/Module07MissionFinale.jsx:85`) :

```js
learningPointIds: ['3e_proportionnalite-3e_P5', '3e_proportionnalite-3e_P7']
```

Le pivot N-N le supporte nativement, et `ProgressEngine` met à jour **chaque**
LP avec la même valeur.

### Rôle primaire / secondaire ?

**`NOT FOUND`.** Aucune notion de rôle nulle part — ni dans les métadonnées
JSX, ni dans le pivot, ni dans le moteur. Les LP multiples d'une question sont
strictement équipondérés. C'est un écart réel avec le §9 de la cible, et
l'audit de 2de montre pourquoi il compte : quand 69 LP reposent sur une seule
question partagée, l'équipondération signifie qu'une réponse tranche pour deux
compétences.

### Gardes exécutables existantes

| Commande | Ce qu'elle vérifie |
|---|---|
| `npm run validate:lessons [-- --strict]` | contrat de leçon, stages, métadonnées d'`assessment`, appartenance des LP, couverture |
| `npm run audit:knowledge[:gate]` | contrat « connaissance avant la demande » (briques, `priorKnowledge`, `requires`) |
| `npm run check:routes` | `LESSON_BASE_PATH` == chemin du catalogue |
| `npm run check:non-blocking` | aucune progression bloquée par une réponse fausse |
| `npm run check:katex` | notation mathématique |
| `npm run check:level-leak` | pas de mathématiques hors niveau |
| `npm run audit:collisions` | collisions de tracé SVG |
| `npm run audit:2de` | couverture LP de la 2de, jugement par leçon |
| `npm run check:lessons` | l'agrégat (les 6 premières, en mode strict) |
| `php artisan smarter:validate-curriculum --strict` | dérive entre `coursesData.js` et MySQL |

**Practice devra fournir la garde équivalente** (§28) — sans elle, le contenu
d'exercices n'a aucun filet.

---

## 10. Final Test Audit

### Le flux complet, tracé

```text
lesson.config.js  (module de stage 'evaluation')
   └─ modules/ModuleNNMissionFinale.jsx
        └─ const EPREUVES = [{ id, skill, prompt, options, correct,
                               explain, assessment: {...} }, ...]   ← DONNÉE
             └─ <BossFinal epreuves={EPREUVES} skills={...} badges={...} />
                  │  kit/BossFinal.jsx — 490 lignes, moteur générique
                  ├─ phase 'boss'    : ChoiceGrid SANS revealed/correctIndex
                  │                    → aucun retour avant le submit unique
                  ├─ submitBoss()    : garde submittedRef (anti double-envoi
                  │                    clic + expiration du minuteur)
                  │    ├─ correctIndexOf(ep)  ← correctness CLIENT
                  │    ├─ submitEvidence(ep, isCorrect, {picked})  [par épreuve]
                  │    ├─ awardXP(...)                            [si juste]
                  │    └─ saveAttempt({score, totalQuestions, answers})
                  ├─ phase 'profil'  : ProfilMaitrise — miss count par `skill`,
                  │                    lien « revoir le module N »
                  └─ phase 'synthese': récapitulatif + bannière de complétion
```

### Inventaire des éléments impliqués

| Couche | Élément | Fichier |
|---|---|---|
| Composant | `BossFinal` | `lessons/common/kit/BossFinal.jsx` |
| Sous-composants | `Epreuve`, `BossReview`, `ProfilMaitrise` | idem (internes) |
| UI | `ChoiceGrid`, `Feedback`, `ValidateButton`, `MissionBrief`, `TimerToggle`, `TimerDisplay` | `components/LessonUI.jsx` |
| Coque | `ModuleLayout` | `components/ModuleLayout.jsx` |
| Hooks | `useProgress`, `useEvidenceSubmission`, `useCountdownTimer`, `useFinalTestAttempt` | `lessons/common/hooks/` |
| Services | `learningEvidenceService`, `finalTestAttemptService`, `apiClient` | `services/` |
| File hors-ligne | `evidenceQueue.js` | `lessons/common/` |
| Contrôleurs | `LearningEvidenceController`, `LessonFinalTestAttemptController` | `app/Http/Controllers/` |
| Domaine | `ProgressEngine`, `MasteryModel` | `app/Domain/Progress/` |
| Modèles | `LearningEvidence`, `LearningPoint`, `StudentLearningPointProgress`, `LessonFinalTestAttempt`, `Lesson` | `app/Models/` |
| Tables | `learning_evidence`, pivot, `student_learning_point_progress`, `lesson_final_test_attempts` | migrations `2026_08_18_0900*`, `2026_08_20_120000` |
| Tests | `LearningEvidenceFlowTest` (11 cas), `LessonFinalTestAttemptFlowTest`, `MasteryModelTest`, `evidenceQueue.test.js` | — |

### Ce que Practice peut réutiliser directement

| Élément | Verdict | Raison |
|---|---|---|
| `ProgressEngine::resolveLesson()` | **REUSABLE** | validation de relation LP↔leçon, déjà durcie et testée |
| Idempotence par `attempt_id` | **REUSABLE** | même besoin exactement |
| `MasteryModel` | **EXTEND** | ajouter difficulté/indices/source, garder les seuils |
| `evidenceQueue` (patron hors-ligne) | **EXTEND** | Practice a le même besoin, mais son contrat serveur diffère (le serveur corrige) |
| `learning_evidence` + pivot | **EXTEND** | ajouter le contexte, ne pas dupliquer |
| `ProfilMaitrise` (composant) | **REFACTOR → extraire** | exactement la synthèse de session dont Practice a besoin ; aujourd'hui enterré dans `BossFinal.jsx` |
| `ChoiceGrid`, `Feedback`, `ValidateButton` | **USE AS-IS** | présentationnels purs |
| `BossFinal` lui-même | **KEEP — ne pas toucher** | forme obligatoire documentée, 133 leçons en dépendent |

### Défauts relevés dans le test final (constat, hors périmètre de correction)

1. **`correctIndexOf` défaut à 0** (`BossFinal.jsx:66`) : 16 leçons antérieures
   au 2026-09-06 ont omis `correct` en plaçant la bonne réponse en première
   position. La valeur par défaut les répare — mais elle **masque
   définitivement** une omission réelle dans toute leçon future. Une garde de
   validation serait préférable au silence. `PARTIAL`.
2. **QCM exclusivement** (règle §7 du guide d'intégration). Aucune évaluation
   de réponse libre n'existe donc nulle part dans le produit. Practice
   introduira le premier.
3. **Densité de preuve** : 10 épreuves quel que soit le nombre de LP (voir §1).
4. **`is_correct` client**. Voir le conflit C-3 en §17.

---

## 11. Existing Exercise System Audit

Classification de tout ce qui touche à l'exercice.

| Élément | Fichier | État | Verdict | Pourquoi |
|---|---|---|---|---|
| `TapQuestion` | `kit/questions.jsx:26` | 771 fichiers | **KEEP** (leçons) / **REFACTOR** (source d'inspiration Practice) | Mûr et massivement utilisé, mais sans hints ni misconceptions structurées ; Practice a besoin des deux. Ne pas le modifier pour Practice — les 771 sites sont un risque de régression disproportionné. |
| `NumericQuestion` (kit) | `kit/questions.jsx:186` | 402 fichiers | **KEEP** / **REFACTOR** | `explainFor(n)` est le seul crochet type-misconception du frontend, mais c'est une fonction JSX, pas de la donnée. Piège connu : `parseFr` par défaut est **entier seulement** — une réponse décimale exige `parse={parseDec}`. |
| `BatchChoiceQuestion` | `kit/questions.jsx:92` | 240 fichiers | **KEEP** | — |
| `BossFinal` | `kit/BossFinal.jsx` | 133 leçons | **KEEP — intouchable** | Seul consommateur d'`assessment`. Forme obligatoire. |
| `ContentModule` / `useKit` | `kit/ContentModule.jsx` | massif | **KEEP** | Coque de module de leçon ; hors périmètre Practice. |
| `LessonUI.jsx` (14 primitives) | `components/LessonUI.jsx` | massif | **USE AS-IS** | Présentationnels purs, sans état. |
| `useAdaptiveExercise` | `hooks/useAdaptiveExercise.js` | **0 consommateur** | **REFACTOR → réanimer la partie pure** | Machine à états hints/tentatives/solution **unique dans le dépôt**, partie pure déjà extraite et testée. Le wrapper React est mort ; la logique ne l'est pas. |
| `adaptiveExerciseState.js` | `packages/core/exercise/` | 14 tests | **EXTEND** | Base directe du HintEngine. Manque : issues au-delà de `correct/incorrect`, misconceptions, horodatage. |
| `useSimpleExercise` | `hooks/useSimpleExercise.js` | **0** | **DEPRECATE** | Enveloppe d'un hook mort. |
| `ExerciseValidator` | `components/ExerciseValidator.jsx` | **0** | **DEPRECATE** | — |
| `AdaptiveFeedback` | `components/AdaptiveFeedback.jsx` | 0 réel | **REFACTOR** | Le rendu « 💡 Besoin d'aide ? / 📘 Voir la solution » est exactement le HintPanel demandé. À reprendre, pas à jeter. |
| `GuidedSolution` | `components/GuidedSolution.jsx` | **0** | **REFACTOR** ou `DEPRECATE` | Étapes numérotées + retry. Utile si Practice révèle une solution ; sinon à retirer. |
| `QuizQuestion` | `components/QuizQuestion.jsx` | **0** | **DEPRECATE** | QCM parallèle et antérieur au kit. |
| `TutorGuide` | `components/TutorGuide.jsx` | **0** | **DEPRECATE** | — |
| `MathInput` (MathLive) | `components/MathInput.jsx` | **0** | **REPLACE** | Voir §12. |
| `validateNumericAnswer` | `packages/core/validation/` | peu | **EXTEND** | Le patron parse+tolérance+algèbre est le bon ; il lui manque `requiredForm` et les issues. |
| `validateChoiceAnswer` | `packages/core/validation/` | peu | **KEEP** | Trivial et correct. |
| `validateScientificNotation` | `packages/core/validation/` | peu | **KEEP** | — |
| `errorClassifiers.js` | `packages/core/` | **0 consommateur** | **REPLACE** | 38 lignes, 3 fonctions dont **une renvoie `null` en dur** (`isAdditionInsteadOfMultiplication`), messages français codés en dur dans la logique. Embryon de misconception, non générique, non branché. Le moteur de misconceptions doit être écrit proprement — mais l'*idée* (signature numérique → diagnostic) est bonne et existe déjà, mûre, côté PHP (`AnswerChecker`). |
| `mathComparison.js` | `packages/core/` | **0 consommateur applicatif** | **REFACTOR** | Voir §12. |
| Domaine `Diagnostic` (PHP) | `app/Domain/Diagnostic/` | production | **KEEP + copier le patron** | Ne pas le fusionner avec Practice (auto-confinement documenté dans les deux sens), mais en reprendre l'architecture. |
| `QuestionRenderer` (diagnostic) | `components/diagnostic/QuestionRenderer.jsx` | production | **KEEP + copier le patron** | Registre `{type → widget}` : le modèle exact du rendu piloté par la donnée. |
| Contenu d'exercices en donnée | — | **NOT FOUND** | à créer | **Zéro `.json` sous `apps/web/src`.** Tout le contenu de question est en JSX. |
| Système de hints en usage | — | **NOT FOUND** | à créer | `grep "hints:"` dans `apps/web/src` → **0**. Les « indices » sont des bannières statiques `Feedback tone="hint"` (21 fichiers). |
| Misconceptions structurées (frontend) | — | **NOT FOUND** | à créer | 526 fichiers portent un commentaire d'auteur `Misconception targeted …` — jamais parsé, jamais exécuté, sans identifiant. |
| Practice Hub / route / banque | — | **NOT FOUND** | à créer | Zéro route, zéro page, zéro contrôleur. Les occurrences de « Pratiquer » sont du texte marketing ; `stage: 'practice_lab'` est un stage de module, pas une fonctionnalité. |

---

## 12. MathLive / Evaluation Audit

### 12.1 État réel : les dépendances sont là, le code ne l'est pas

| Élément | Réalité |
|---|---|
| `mathlive@^0.110.0` | déclaré dans `apps/web/package.json:20` |
| `@cortex-js/compute-engine@^0.102.0` | déclaré dans `apps/web/package.json:13` **et** `packages/core/package.json:11` |
| `components/MathInput.jsx` | existe (85 lignes), **0 importateur** |
| `<math-field>` ailleurs dans l'app | **0 occurrence** |
| `packages/core/mathComparison.js` | existe (50 lignes), **0 consommateur applicatif** — seulement `validateNumericAnswer.js` et ses propres tests |
| `validateNumericAnswer` | quelques sites |

**Autrement dit : aucun élève n'a jamais saisi une expression mathématique
libre dans ce produit.** Le test final est QCM par règle (§7 du guide
d'intégration) ; les questions numériques du kit utilisent `NumberField`, un
`<input>` ordinaire. Le rapport `MOBILE_READINESS_REPORT.md` affirme avoir
vérifié MathLive en navigateur sur `Module02CalculHypotenuse.jsx` — **ce
fichier n'existe plus**, la leçon a été reconstruite au kit.

Conséquence : **il n'y a pas de comportement MathLive en production à
préserver.** C'est une bonne nouvelle — Practice peut poser le contrat
proprement — et une mauvaise : rien n'est éprouvé.

### 12.2 `mathComparison.js` — analyse ligne à ligne

```js
export function compareMathExpressions(expr1, expr2) {
  // 1. e1.isEqual(e2)                     — égalité structurelle
  // 2. e1.isSame(e2)                      — « algébriquement pareil »
  // 3. repli : comparaison de chaînes, espaces retirés, minuscules
  // catch → même repli sur chaînes
}
```

| Aspect | Verdict |
|---|---|
| Équivalence algébrique | `PARTIAL` — l'ordre est **inversé** par rapport à la sémantique de Compute Engine : `isSame()` est la comparaison *structurelle* stricte, `isEqual()` la comparaison de *valeur*. Les deux sont appelées, donc l'effet net est « au moins l'une accepte » — mais l'intention documentée dans les commentaires est fausse, et le comportement sur `2(x+3)` vs `2x+6` n'est **pas vérifié par les tests** (à confirmer). `UNKNOWN — REQUIRES VERIFICATION` |
| Forme requise (`requiredForm`) | **`NOT FOUND`** — aucune notion de forme factorisée/développée/irréductible. C'est une exigence explicite du §10 de la cible. |
| Tolérance numérique | `NOT FOUND` ici (elle est dans `validateNumericAnswer`, séparément) |
| Unités | **`NOT FOUND`** partout |
| Entrée malformée | **`CONFLICT`** — un `catch` retombe sur une comparaison de chaînes. Une saisie syntaxiquement invalide peut donc être déclarée *correcte* si sa chaîne coïncide, et n'est **jamais** signalée comme `syntax_error`. La cible §11 exige `syntax_error` comme issue distincte. |
| Repli sur chaînes | **`CONFLICT`** — `"1/2"` et `"0.5"` ne sont pas la même chaîne mais sont le même nombre ; à l'inverse `"2x"` et `"2X"` deviennent identiques après `toLowerCase()`, ce qui est faux dès qu'une leçon distingue deux variables `x` et `X`. Silencieux dans les deux sens. |
| `console.error` dans le chemin d'erreur | bruit en production, à retirer |
| Normalisation | `normalizeMathAnswer()` renvoie le LaTeX canonique — utile pour la colonne `normalized_answer` du §27 de la cible. `REUSABLE` |
| Exécution côté serveur | **`CONFLICT` structurel** — c'est du JavaScript. Le §39 exige la validation serveur. Voir C-3 en §17. |

### 12.3 Verdict et recommandation

**Ne pas écrire un second moteur de comparaison.** Compute Engine est le bon
choix : c'est la bibliothèque compagne de MathLive, elle est déjà installée,
et elle sait faire ce qu'il faut. Mais `compareMathExpressions` **dans sa
forme actuelle n'est pas apte** à porter l'évaluation d'exercices :

- `REFACTOR`, pas `KEEP` : la fonction doit renvoyer une **issue** (`correct`
  / `equivalent_correct` / `syntax_error` / `incorrect`), pas un booléen ;
  supprimer le repli sur chaînes qui masque les erreurs de syntaxe ; ajouter
  `requiredForm` ; ne plus journaliser en console.
- Signature cible, dans `packages/core` :
  `compareMathAnswer(studentLatex, expected, {acceptEquivalent, requiredForm, tolerance})
  → {outcome, normalized, reason?}`.
- `MathInput.jsx` : `REPLACE`. Le composant actuel a un bloc `useEffect`
  entièrement vide pour le `placeholder`, ne gère ni le clavier virtuel
  mobile explicitement, ni l'accessibilité au-delà d'un `aria-label`, et n'a
  jamais tourné en production. Le réécrire est moins risqué que le corriger à
  l'aveugle.

**La question serveur est la vraie décision** (D-1 en §33) : Compute Engine
n'existe pas en PHP. Trois options y sont pesées.

---

## 13. Adaptive Exercise Audit

| Élément | Fonctionnel ? | Branché ? | Verdict |
|---|---|---|---|
| `packages/core/exercise/adaptiveExerciseState.js` | **oui** — pur, 14 tests verts | non (via un hook mort) | **EXTEND** |
| `hooks/useAdaptiveExercise.js` | oui, mais inutilisé | **non — 0 module** | `DEPRECATE` le wrapper |
| `hooks/useSimpleExercise.js` | oui, inutilisé | **non — 0** | `DEPRECATE` |
| `components/ExerciseValidator.jsx` | oui, inutilisé | **non — 0** | `DEPRECATE` |
| `components/AdaptiveFeedback.jsx` | oui | non | **REFACTOR** → base du `HintPanel` |
| `components/GuidedSolution.jsx` | oui | **non — 0** | **REFACTOR** ou `DEPRECATE` |
| `packages/core/errorClassifiers.js` | **partiellement** — 1 des 3 fonctions renvoie `null` en dur | **non — 0** | **REPLACE** |
| Sélection d'exercice / difficulté / génération aléatoire / banque | — | — | **`NOT FOUND`** côté frontend |
| `AdaptiveSelector` (PHP, diagnostic) | **oui, en production** | oui (diagnostic seulement) | **KEEP + copier le patron** |

### Ce qui est dangereux à réutiliser tel quel

1. **`errorClassifiers.js`** — `isAdditionInsteadOfMultiplication()` renvoie
   `null` inconditionnellement avec un commentaire « requires context ». Les
   messages français sont codés en dur *dans la logique*, ce qui empêche toute
   réutilisation par une autre leçon. Trois fonctions, aucun identifiant de
   misconception, aucun registre. Ce n'est pas un moteur, c'est une esquisse
   abandonnée. **La remplacer** — en s'inspirant de `AnswerChecker`, qui fait
   la même chose correctement (`{isCorrect, misconceptionId}`, signatures de
   valeurs numériques, identifiants réutilisables).

2. **`EXERCISE_CONTRACT.md`** canonise le contrat de `useAdaptiveExercise`
   (`{isCorrect, fields?, feedback?}`) en le présentant comme « le plus fort
   des trois patrons existants ». C'était vrai à la date de rédaction ; ce
   hook n'a plus aucun consommateur aujourd'hui. **Ne pas prendre ce
   document pour l'état des lieux.** Son contrat reste néanmoins un bon
   *point de départ* — il lui manque exactement ce que la cible ajoute :
   les issues, la misconception, les indices, la valeur probante.

### Ce qui mérite d'être réanimé

`adaptiveExerciseState.js` est la seule machine à états
hints → tentatives → solution du dépôt, elle est pure, testée, et vit déjà
dans `packages/core`. Le HintEngine du §30 de la cible en est une extension
directe :

```text
existant : {status, attempts, hintLevel, fieldStatuses, specificFeedback}
manquant : outcome (6 valeurs), misconceptionId, hintEvents[] horodatés,
           evidenceWeight
```

---

## 14. Content Architecture Audit

### 14.1 Comment le contenu est stocké aujourd'hui

| Type de contenu | Format | Où | Piloté par la donnée ? |
|---|---|---|---|
| Catalogue (leçons, LP, prérequis, périmètre) | **module JS** exporté | `packages/core/curriculum/coursesData.js` (3 043 l.) | oui |
| Programme officiel | **JSON** | `curriculum/smarter_academy_programmes_maths_2026.json` | oui |
| Structure de leçon (modules, stages, LP enseignés) | **module JS** | `<lesson>/lesson.config.js` × 132 | oui |
| Carte des connaissances | **JSX** | `<lesson>/knowledge.jsx` | semi |
| Épreuves du test final | **tableau JS littéral dans un JSX** | `<lesson>/modules/ModuleNN*.jsx` | semi — donnée, mais dans un fichier de composant |
| Toutes les autres questions | **JSX en dur** | ~700 fichiers `ModuleNN*.jsx` | **non** |
| Banque du diagnostic | **constantes PHP** | `SixiemeDiagnosticProvider::QUESTIONS` | oui |
| Exercices Practice | — | — | **`NOT FOUND`** |

**Fait vérifié : `find apps/web/src -name "*.json"` ne renvoie rien.** Il n'y a
pas un seul fichier JSON dans le frontend.

### 14.2 Confrontation avec l'exigence « ajouter un exercice sans toucher au React »

Le dépôt a une convention forte et **deux fois justifiée par écrit** : le
contenu vit dans du **code versionné**, jamais en base.

- `DIAGNOSTIC_6E.md:21` — relisible en PR, pas de CMS, livré atomiquement.
- `AI_LESSON_CONTRACT.md` règle 3 — « Questions stay in JSX. No question
  content in MySQL, ever. »

Ces deux justifications visent la **base de données**, pas le format. Un
fichier de données versionné (JSON ou module JS) les respecte intégralement
tout en satisfaisant l'invariant 13 de la cible.

### 14.3 Recommandation : JSON versionné, indexé par glob, validé par script

```text
apps/web/src/content/practice/
  6e/
    nombres-entiers/
      level-1/  ex-6e-nombres-entiers-l1-001.json
                ex-6e-nombres-entiers-l1-002.json
      level-2/  …
  3e/
  seconde/
```

Pourquoi JSON et non un module JS :

1. **Un script de validation Node peut le lire sans transpiler.** C'est déjà
   la douleur des gardes actuelles : `validate-lessons.mjs` doit parser du
   JSX en AST Babel pour extraire des littéraux, et
   `scripts/lib/assessmentQuestions.mjs` porte l'avertissement « KEEP IN SYNC
   with validate-lessons.mjs:60-88 ». Du JSON supprime cette classe entière
   de fragilité.
2. **Un générateur d'exercices produit du JSON**, pas du JSX. Le §32 de la
   cible décrit un pipeline de génération continue.
3. **Un schéma déclaratif** (JSON Schema / Zod) valide le JSON nativement.
4. **Le même fichier peut être servi par l'API** si la correction passe
   serveur (§17 C-3) — Laravel lit ce JSON, PHP n'a pas besoin de comprendre
   du JSX.
5. `import.meta.glob` de Vite indexe le dossier sans qu'aucun `import` ne
   soit écrit à la main — exactement le mécanisme déjà utilisé par
   `lessons/registry.js`. **Invariant 13 satisfait par construction.**

Un index généré (`content/practice/index.generated.json` : leçon → niveau →
liste d'ids + compteurs) évite de charger toute la bibliothèque en mémoire
(§38 de la cible) et donne au Hub ses compteurs sans lecture des fichiers.

### 14.4 Référencement des ids canoniques, sans duplication

```jsonc
{
  "id": "ex-3e-nombres-rationnels-l3-002",   // ★ propre à Practice, stable
  "lessonCode": "nombres-rationnels",        // ← lessons.code (MySQL) == LESSON_CONFIG.id
  "level": 3,
  "questions": [{
    "id": "q1",                              // ★ unique dans l'exercice seulement
    "learningPoints": [
      { "code": "3e_nombres-rationnels_P5", "role": "primary"   },
      { "code": "3e_nombres-rationnels_P9", "role": "secondary" }
    ]
  }]
}
```

Règles :

- **`lessonCode`** est le code canonique existant (`lessons.code` en base ==
  `LESSON_CONFIG.id` == la clé du catalogue). Ne jamais réinventer un id de
  leçon, ne jamais recopier son titre dans le fichier d'exercice.
- **`learningPoints[].code`** est le code canonique en base. Le script de
  validation vérifie qu'il **existe** et **appartient à cette leçon** —
  exactement ce que `validate-lessons.mjs:291-294` fait déjà pour les
  questions de test final, en réutilisant `scripts/lib/lessonAst.mjs`'s
  catalogue index.
- **`exerciseId` et `questionId`** sont les seuls ids nouveaux. `questionId`
  n'est unique que dans son exercice ; la clé globale est le couple
  `(exerciseId, questionId)` — même convention que les `question_code` du
  test final, qui ne sont uniques que dans leur leçon.
- **Rien d'autre du catalogue n'est recopié** : ni titre de leçon, ni
  intitulé de LP, ni niveau scolaire. Ils se joignent à l'exécution.

---

## 15. Authentication / Student Progress Audit

| Question | Réponse | Fichier |
|---|---|---|
| Comment l'élève authentifié est-il identifié ? | Jeton porteur Sanctum, en-tête `Authorization: Bearer`. Côté serveur, **toujours** `$request->user()`, jamais un champ du corps. | `AuthContext.jsx`, `routes/api.php` |
| Un anonyme peut-il pratiquer ? | Aujourd'hui, un anonyme a **toute** la persistance locale (modules, XP, tentative de test final, diagnostic de prérequis) **sauf la preuve de LP**, qui exige un jeton par conception (« mastery tracking is an account-level concept »). | `useEvidenceSubmission.js:52`, guide d'intégration §9 |
| Comment la progression est-elle persistée ? | Deux tables serveur (`student_lesson_progress`, `student_learning_point_progress`) + `localStorage` comme **cache et file hors-ligne**, jamais comme source de vérité pour la maîtrise. | `PROGRESS_MODEL.md` |
| Comment l'autorisation fonctionne-t-elle ? | **Structurellement**, pas par Policy : `where('user_id', $request->user()->id)` systématique. Une ressource d'autrui renvoie 404, pas 403 — pour ne pas divulguer son existence (`ProgressEngine.php:56-59` : « treat as invalid rather than leaking that the id exists »). | — |
| Isolation multi-comptes sur un même navigateur | `scopedStorage` préfixe chaque clé de `u_{userId\|anon}_`. `migrateLegacyStorageToUser()` replie les clés anonymes sur le compte à la première connexion. | `utils/storage.js`, `utils/authUserId.js` |

### Décision requise pour Practice

**Recommandation : Practice exige un compte.** Trois raisons :

1. Le §39 de la cible exige la persistance serveur des preuves. Sans compte,
   il n'y a pas de propriétaire.
2. C'est **déjà la règle** pour la preuve de LP. Autoriser une pratique
   anonyme produisant des preuves créerait un second régime, en contradiction
   avec l'invariant 2.
3. La recommandation adaptative (§18 cible) lit l'état des LP de l'élève —
   sans compte, il n'y a pas d'état.

Conséquence UI : le bouton « Commencer à pratiquer » est visible pour tous,
mais l'ouverture d'une session invite à se connecter. C'est le même geste que
le diagnostic, qui est déjà `auth:sanctum` sur tous ses endpoints.

**Ne rien ajouter à l'architecture d'authentification.** Elle convient telle
quelle.

---

## 16. Routing / UX Audit

### 16.1 Convention existante

```text
/courses/{college|lycee}/{grade}/{domaine_officiel}/{lesson-id}
/courses/{college|lycee}/{grade}/{domaine_officiel}/{lesson-id}/{module-slug}
/espace/{cours|explorer|progression|profil|diagnostic|diagnostic/run|diagnostic/resultat}
```

Deux pièges déjà documentés et gardés :
- le segment de domaine porte un **souligné** (`espace_geometrie`) ; un tiret
  passe `check:routes` et renvoie l'élève à l'accueil ;
- `LESSON_BASE_PATH` doit **égaler** le chemin dérivé de l'**id** de leçon.

### 16.2 Le problème d'échelle

`App.jsx` contient ~132 imports de fonctions de routes, une par leçon. Suivre
ce patron pour Practice ajouterait 132 imports de plus et 3–4 routes par
leçon, soit ~400 routes supplémentaires dans une table statique.

### 16.3 Routes recommandées

**Une seule famille paramétrée, montée une fois, hors de l'arbre des leçons :**

```text
/pratiquer/:lessonCode                          Practice Hub (choix du niveau)
/pratiquer/:lessonCode/niveau/:level            démarre/reprend une session
/pratiquer/:lessonCode/session/:sessionId       Exercise Player
/pratiquer/:lessonCode/session/:sessionId/bilan Session Summary
/espace/carnet                                  « Mes erreurs / Mes notes »
```

Justifications :

- **`/pratiquer` et non `/lessons/:id/practice`** : la cible §3 dit que
  Practice est « architecturalement indépendant du renderer de leçon ». Le
  placer sous `/courses/...` le ferait vivre dans l'arbre des leçons et
  imposerait de choisir un niveau et un domaine dans l'URL — deux segments
  que Practice n'a aucune raison de connaître, puisque `lessonCode` est
  globalement unique (invariant garanti par `coursesData.test.js`).
- **Français**, cohérent avec `/espace`, `/cours`, `/courses?...`. Le produit
  est francophone ; « Commencer à pratiquer » mène naturellement à
  `/pratiquer`.
- **`:lessonCode` seul suffit** : les codes de leçon sont globalement uniques
  depuis la scission des 45 minutes, et c'est déjà le contrat des endpoints
  API `/lessons/{lessonCode}/...`.
- **`:sessionId` dans l'URL** : reprend le patron du diagnostic
  (`/diagnostic/sessions/{sessionId}/responses`) et rend la session
  rechargeable et partageable entre onglets.

**Point d'entrée unique** : un bouton dans `LessonIndex.jsx`, à côté du widget
de progression, visible dès que la leçon a du contenu Practice indexé.
Un seul fichier modifié, 132 leçons servies.

---

## 17. ARCHITECTURAL CONFLICTS

Sept conflits réels. Aucun n'est masqué ; deux sont bloquants.

---

### C-1 — `ProgressEngine` refuse structurellement la preuve Practice · **BLOQUANT**

```text
Implémentation actuelle  ProgressEngine.php:48-51 — tout assessmentType ≠
                         'assessment' lève DomainException → 422. Doublé
                         côté client par useEvidenceSubmission.js:52.
Architecture cible       §6 — sourceType ∈ {final_test, practice}, extensible.
Conflit                  Practice ne peut PAS écrire de preuve aujourd'hui.
Risque                   Faible si l'on comprend l'intention ; ÉLEVÉ si
                         quelqu'un « corrige » en supprimant le garde-fou —
                         il protège l'invariant 1 (les questions de module
                         n'évaluent jamais), qui est le fondement pédagogique
                         du produit.
Résolution recommandée   Remplacer le test d'égalité par un ensemble de
                         sources autorisées, en gardant le rejet explicite
                         de 'discovery' et 'practice_lab' :
                           const ALLOWED = ['assessment', 'practice'];
                         Ajouter un test de non-régression : une preuve de
                         type 'discovery' reste refusée en 422.
                         La colonne assessment_type existe déjà exactement
                         pour ça (commentaire de migration : « Kept as a
                         column … so a future evidence source has somewhere
                         to say so »).
                         ⚠️ Nommer la source 'practice' est ambigu avec le
                         stage de module 'practice_lab' et avec le type de
                         question 'practice' (qui, lui, ne DOIT jamais
                         produire de preuve). Préférer 'practice_exercise'.
```

---

### C-2 — Le contenu d'exercices n'a nulle part où vivre

```text
Implémentation actuelle  Zéro fichier .json sous apps/web/src. Tout le
                         contenu de question est en JSX ; les seules banques
                         structurées sont des constantes PHP (diagnostic).
Architecture cible       §23, invariants 5 et 13 — ajouter un exercice ne
                         doit jamais toucher au code React.
Conflit                  Écrire les exercices comme les questions de leçon
                         violerait l'invariant 13 dès le premier exercice.
Risque                   ÉLEVÉ — c'est une erreur irréversible en pratique :
                         15 exercices × 132 leçons = 1 980 fichiers. Se
                         tromper de format coûte une migration de masse.
Résolution recommandée   JSON versionné sous apps/web/src/content/practice/,
                         indexé par import.meta.glob (patron déjà utilisé par
                         lessons/registry.js), validé par un script Node
                         dédié. Détail en §14.3 et §26.
```

---

### C-3 — Correction côté client vs. exigence de correction serveur · **STRUCTURANT**

```text
Implémentation actuelle  is_correct est calculé en JSX et envoyé au serveur.
                         Asymétrie DOCUMENTÉE et assumée (migration
                         learning_evidence, LEARNING_ARCHITECTURE.md
                         « Trust boundary ») : le contenu des questions vit
                         en JSX, donc le serveur ne PEUT PAS recalculer.
                         Ce qu'il possède, c'est la validation de relation.
                         Le diagnostic, lui, corrige côté serveur (AnswerChecker).
Architecture cible       §39 — « The client must not be trusted to declare
                         correct = true ». §26 — « Expected answers … should
                         not be unnecessarily exposed to the client. »
Conflit                  Direct. Si le contenu Practice est du JSON servi au
                         navigateur, expectedAnswer part avec, et un élève
                         peut lire les réponses dans l'onglet réseau — et
                         fabriquer des preuves de maîtrise.
Risque                   MOYEN sur le plan produit (il n'y a ni note, ni
                         diplôme, ni classement — la triche ne rapporte
                         qu'un faux profil de maîtrise à soi-même)
                         ÉLEVÉ sur le plan des données (le profil de maîtrise
                         est le produit ; s'il est falsifiable, la
                         recommandation adaptative devient du bruit).
Résolution recommandée   Séparer le contenu en DEUX projections issues du
                         MÊME fichier source :
                           • projection publique — énoncé, format de réponse,
                             choix (sans isCorrect), nombre d'indices ;
                           • projection privée — expectedAnswer, isCorrect
                             par choix, misconceptionId, contenu des indices,
                             evaluationPolicy.
                         Le fichier JSON est lu par Laravel ; l'API sert la
                         projection publique et corrige avec la privée.
                         Cela dicte que le contenu soit lisible par PHP —
                         donc JSON, pas JSX. C'est la seconde raison
                         décisive du choix de format.
                         Pour le QCM, l'algèbre libre et le numérique à
                         tolérance, la correction PHP est simple :
                         AnswerChecker montre déjà comment (5 des 6
                         représentations n'ont besoin d'aucune bibliothèque).
                         Le SEUL cas dur est l'équivalence algébrique — voir
                         la décision ouverte D-1 (§33).
```

---

### C-4 — Aucun rôle primaire/secondaire de LP

```text
Implémentation actuelle  284 questions mappent ≥ 2 LP ; le pivot
                         learning_evidence_learning_point ne porte que deux
                         clés étrangères. ProgressEngine met à jour CHAQUE LP
                         avec la MÊME valeur. Aucune sémantique d'ordre.
Architecture cible       §9 — « Each question should have one primary LP …
                         Secondary LPs may be attached. »
Conflit                  Réel mais non bloquant.
Risque                   MOYEN. L'audit de 2de le chiffre : 69 LP reposent
                         sur UNE question partagée ; à équipondération, une
                         réponse tranche pour deux compétences, au seuil 0,70.
Résolution recommandée   Ajouter une colonne `role` ('primary'|'secondary')
                         au pivot, défaut 'primary' — les 193 lignes
                         existantes gardent alors exactement le comportement
                         actuel. Practice la remplit ; le test final pourra
                         être enrichi plus tard, leçon par leçon, sans
                         urgence. Le scorer pondère le secondaire plus
                         faiblement.
```

---

### C-5 — `MasteryModel` ignore difficulté, indices et source

```text
Implémentation actuelle  DEFAULT_DIFFICULTY = 2 figé ; delta symétrique
                         ±0,22 pondéré par une difficulté qu'aucun appelant
                         ne fournit ; aucune notion d'indice ni de source.
                         Une réussite de niveau 5 sans aide vaut exactement
                         une réussite de niveau 1 avec trois indices.
Architecture cible       §7 — politique multidimensionnelle (source,
                         difficulté, correction partielle, tentatives,
                         indices, misconception, récence, répétition),
                         déterministe, configurable, testée.
Conflit                  Écart de capacité, pas de contradiction.
Risque                   MOYEN — sans cette extension, Practice dilue le
                         signal au lieu de l'affiner : 15 exercices faciles
                         suffiraient à faire passer un LP en 'mastered'.
Résolution recommandée   Étendre le MODÈLE EXISTANT, ne pas en écrire un
                         second. Le docblock de DEFAULT_DIFFICULTY prescrit
                         déjà la manière (« thread it through ProgressEngine
                         instead of widening this constant's job ») et
                         updateConfidence() accepte DÉJÀ le paramètre
                         $difficulty — seul l'appelant ne le remplit pas.
                         Conserver les seuils 0,70 / 0,40 : le test verrou
                         MasteryModelTest les compare à ceux du diagnostic.
```

---

### C-6 — `is_correct` booléen ne peut pas porter six issues

```text
Implémentation actuelle  learning_evidence.is_correct : boolean NOT NULL.
Architecture cible       §11 — correct | equivalent_correct |
                         partially_correct | incorrect | syntax_error |
                         abandoned.
Conflit                  partially_correct et syntax_error n'ont pas de
                         représentation ; les collapser en `false` est
                         exactement ce que la cible interdit.
Risque                   FAIBLE, purement additif.
Résolution recommandée   Ajouter une colonne `outcome` (string, nullable)
                         SANS toucher à is_correct. Les 193 lignes
                         existantes restent lisibles ; is_correct est dérivé
                         (outcome ∈ {correct, equivalent_correct}) pour les
                         nouvelles. Ne jamais supprimer is_correct : le
                         profil d'apprentissage et correct_count s'en
                         servent.
```

---

### C-7 — La garde « stage evaluation » ne couvre pas Practice

```text
Implémentation actuelle  validate-lessons.mjs:275-285 interdit toute question
                         `enabled: true` hors d'un module de stage
                         'evaluation'. C'est l'invariant 1 de la cible,
                         déjà mécanisé — un excellent acquis.
Architecture cible       Invariants 1 et 6.
Conflit                  Le contenu Practice vivra HORS de
                         apps/web/src/lessons/, donc hors du périmètre de
                         cette garde. Aucun filet n'existe pour lui.
Risque                   ÉLEVÉ à moyen terme — sans garde, un exercice sans
                         LP, avec un LP d'une autre leçon, ou avec un indice
                         qui divulgue la réponse, passe en production sans
                         que rien ne le signale. C'est précisément la classe
                         de défaut que ce dépôt attrape systématiquement
                         partout ailleurs.
Résolution recommandée   `npm run validate:exercises`, ajouté à
                         `check:lessons`. Il valide le JSON contre le schéma,
                         vérifie l'appartenance des LP en réutilisant
                         scripts/lib/lessonAst.mjs's catalogue index, impose
                         le minimum 3×5, et détecte la fuite de réponse dans
                         les indices. Détail en §26 et §28.
```

---

### Conflits recherchés et **absents** (bonne nouvelle)

| Conflit cherché | Constat |
|---|---|
| Double système de maîtrise | **Absent.** Une seule table de rollup, un seul moteur, une seule porte d'écriture. |
| Évaluateur dupliqué | **Absent** côté leçon — il n'y en a qu'un (JS, largement inutilisé). Le PHP du diagnostic est délibérément séparé et documenté comme tel. |
| Questions de module alimentant les LP | **Absent** — triplement empêché : métadonnée, validateur AST, garde serveur. |
| Le test final utilisant un autre modèle de LP | **Absent** — c'est le seul producteur, sur le modèle canonique. |
| `localStorage` là où le serveur est requis | **Absent** pour la maîtrise (serveur, 131 lignes). Vrai seulement pour le XP (`smarter_global_xp`), signalé comme dette connue dans `PROGRESS_MODEL.md`. |
| Contrats de réponse incompatibles | Sans objet — il n'y a pas encore de contrat Practice. |

---

## 18. REUSABLE COMPONENTS AND SERVICES

### USE AS-IS — ne rien modifier

| Élément | Fichier |
|---|---|
| Modèle de LP canonique (table, ids, import, retrait) | `learning_points`, `CurriculumImporter`, `coursesData.js:2924-2928` |
| `learning_evidence` + pivot N-N | migrations `2026_08_18_090004/090005` |
| `student_learning_point_progress` | migration `2026_08_18_090006` |
| `ProgressEngine::resolveLesson()` | `ProgressEngine.php:96-133` |
| Idempotence par `attempt_id` | `learning_evidence.attempt_id` UNIQUE |
| Seuils de maîtrise (0,70 / 0,40) | `MasteryModel` — verrouillés par test |
| Sanctum, `AuthContext`, `ProtectedRoute` | — |
| `scopedStorage` / `authUserId` | `utils/storage.js` |
| `apiRequest`, `ApiError`, `classifyStatus` | `services/apiClient.js`, `packages/core/api/errors.js` |
| `Feedback`, `ChoiceGrid`, `ValidateButton`, `StepCard`, `MissionBrief`, `NumberField`, `TimerToggle/Display`, `StepProgressBar`, `AutoAdvance`, `XPBurst`, `StreakChip` | `components/LessonUI.jsx` |
| `MathText` (KaTeX) | `components/MathText.jsx` |
| `parseFr` / `parseDec` | `packages/core/numberFormat.js` — ⚠️ `parseFr` est **entier seulement**, `parseDec` refuse le vrai signe moins U+2212 |
| `LearningPointMastery` (`MASTERY_STATES`, `resolveMasteryState`, `LearningPointCard`) | `components/LearningPointMastery.jsx` |
| `useLearningProfile` | `hooks/useLearningProfile.js` |
| `lessons/registry.js` (patron `import.meta.glob`) | — |
| Patron de registre du `QuestionRenderer` du diagnostic | `components/diagnostic/QuestionRenderer.jsx` |
| Patron d'architecture `AnswerChecker` / `AdaptiveSelector` | `app/Domain/Diagnostic/Support/` |
| Idiome de garde d'hydratation (`useState(readLocal)` + `useRef` + `useEffect`) | guide d'intégration §9 |

### EXTEND — étendre sans rompre l'existant

| Élément | Extension nécessaire |
|---|---|
| `ProgressEngine::recordEvidence()` | accepter la source `practice_exercise`, la difficulté, les indices, le rôle de LP |
| `MasteryModel::updateConfidence()` | recevoir enfin `$difficulty` ; pondérer indices et source ; **garder les seuils** |
| `learning_evidence` | + `outcome`, `level`, `hints_used`, `misconception_id`, `source_id` |
| pivot `learning_evidence_learning_point` | + `role` (défaut `'primary'`) |
| `packages/core/exercise/adaptiveExerciseState.js` | + 6 issues, misconception, événements d'indice horodatés, valeur probante |
| `packages/core/validation/validateNumericAnswer.js` | + `requiredForm`, + issues, + tolérance relative |
| `evidenceQueue.js` | patron à dupliquer pour la file Practice (contrat serveur différent) |
| `LessonIndex.jsx` | + le bouton « Commencer à pratiquer » (une ligne, 132 leçons) |
| `check:lessons` | + `validate:exercises` |

### REFACTOR — reprendre l'idée, réécrire le code

| Élément | Pourquoi |
|---|---|
| `packages/core/mathComparison.js` | renvoyer une issue ; supprimer le repli sur chaînes ; ajouter `requiredForm` ; retirer `console.error`. Voir §12.2. |
| `components/MathInput.jsx` | jamais exécuté en production, `useEffect` vide, mobile et a11y non traités. Réécrire. |
| `components/AdaptiveFeedback.jsx` | le rendu est exactement le `HintPanel` demandé ; l'extraire du hook mort. |
| `ProfilMaitrise` (dans `BossFinal.jsx`) | c'est le `SessionSummary` de Practice ; l'extraire en composant partagé **sans changer le comportement de `BossFinal`**. |
| `TapQuestion` / `NumericQuestion` | source d'inspiration visuelle et ergonomique. **Ne pas les modifier** : 1 173 sites d'appel. Practice écrit ses propres entrées. |
| `components/GuidedSolution.jsx` | utile si Practice révèle une solution ; sinon `DEPRECATE`. |

### DEPRECATE — retirer, mais pas dans cette phase

`useSimpleExercise.js`, `ExerciseValidator.jsx`, `QuizQuestion.jsx`,
`TutorGuide.jsx`, `errorClassifiers.js`, et le wrapper React
`useAdaptiveExercise.js` (sa partie pure survit dans `packages/core`).

**Recommandation de séquence : ne rien supprimer avant que Practice ne
fonctionne.** Ce code est mort, donc inoffensif ; le supprimer maintenant
ajoute du bruit de diff à une phase déjà large, et `EXERCISE_CONTRACT.md`
référence encore `useAdaptiveExercise`. Nettoyer en phase 12, avec la mise à
jour de la documentation.

---

## 19. MISSING COMPONENTS

### Frontend

`PracticeHub` · `LevelSelector` · `ExercisePlayer` · `ExerciseStatement` ·
`QuestionRenderer` (registre) · `ChoiceInput` · `MathAnswerInput` ·
`NumericInput` · `HintPanel` · `FeedbackPanel` · `Notebook` ·
`SessionProgress` · `SessionSummary` · `usePracticeSession` ·
`usePracticeContent` · `useNotebook` · `practiceQueue.js` (file hors-ligne) ·
`practiceService.js` · page « Mes erreurs / Mes notes »

### Domain / Core (`packages/core/practice/`)

`AnswerEvaluator` (dispatch par `answerType`) · `MathComparison` refondu ·
`ChoiceEvaluator` · `NumericEvaluator` · `HintEngine` (extension de
`adaptiveExerciseState`) · `MisconceptionResolver` · `EvidenceNormalizer` ·
`EvidenceScorer` · `MasteryPolicy` · `LearningPointStateCalculator` ·
`RecommendationEngine` · `SessionEngine` · `LevelPolicy` (déverrouillage)

### Backend (`apps/api/app/Domain/Practice/`)

`PracticeSessionService` · `ExerciseRepository` (lecture du JSON versionné) ·
`AnswerEvaluationService` (correction serveur) · `PracticeEvidenceRecorder`
(appelle `ProgressEngine` étendu) · `RecommendationService` ·
`NotebookService` · `PracticeSessionController` · `PracticeAnswerController` ·
`PracticeHintController` · `NotebookController` · modèles `PracticeSession`,
`ExerciseAttempt`, `QuestionAttempt`, `HintEvent`, `NotebookNote`

### Database

`practice_sessions` · `exercise_attempts` · `question_attempts` ·
`hint_events` · `notebook_notes` · colonnes ajoutées à `learning_evidence` ·
colonne `role` sur le pivot

### API

Les 7 endpoints du §8.2.

### Content / Contracts

`exercise.schema.json` · `question.schema.json` · `answer.schema.json` ·
`hint.schema.json` · registre de misconceptions
(`content/practice/misconceptions.json`) · l'arborescence
`content/practice/<grade>/<lesson>/level-N/` · l'index généré ·
`EXERCISE_CONTRACT.md` **réécrit** (le document actuel décrit un hook mort)

### Testing

`validate-exercises.mjs` (garde CI) · tests unitaires des évaluateurs · tests
de contrat des fixtures · tests de fonctionnalité de l'API Practice · **le
test d'intégration décisif** : test final + Practice convergent sur la même
ligne de `student_learning_point_progress` · un e2e de parcours complet

### Integration

Le bouton dans `LessonIndex.jsx` · les routes `/pratiquer/*` dans `App.jsx` ·
la mise à jour de `ARCHITECTURE.md` (§3 et §5 périmés) et de
`MOBILE_READINESS_REPORT.md`

---

## 20. Required Refactors

Par ordre de risque croissant.

| # | Refactor | Portée | Risque | Garde-fou |
|---|---|---|---|---|
| R-1 | Élargir le garde-fou de type de `ProgressEngine` | 4 lignes + 1 test | **Faible** | test : `'discovery'` reste refusé en 422 |
| R-2 | Ajouter `outcome`, `level`, `hints_used`, `misconception_id` à `learning_evidence` | migration additive | **Faible** | colonnes nullables ; les 193 lignes intactes |
| R-3 | Ajouter `role` au pivot, défaut `'primary'` | migration additive | **Faible** | le défaut préserve le comportement actuel |
| R-4 | Passer la difficulté à `MasteryModel::updateConfidence()` | 1 appelant | **Moyen** | ne change **rien** pour le test final (qui continue de passer le défaut 2) ; les 11 tests de `LearningEvidenceFlowTest` doivent rester verts |
| R-5 | Extraire `ProfilMaitrise` de `BossFinal.jsx` en composant partagé | 1 fichier + 1 nouveau | **Moyen** | 133 leçons dépendent de `BossFinal` — extraction **sans changement de rendu**, vérifiée par capture d'écran |
| R-6 | Refondre `mathComparison.js` en API à issues | `packages/core` | **Moyen** | garder l'ancienne fonction exportée jusqu'à migration du dernier appelant (ils sont 1) |
| R-7 | Réécrire `MathInput.jsx` | 1 fichier | **Faible** | 0 importateur — rien à casser |
| R-8 | Réécrire `EXERCISE_CONTRACT.md` | doc | **Faible** | — |
| R-9 | Corriger `ARCHITECTURE.md` §3/§5 (périmés) | doc | **Faible** | — |
| R-10 | Retirer le code mort (§18 DEPRECATE) | 6 fichiers | **Faible** | **après** la phase 11, pas avant |

**Refactors explicitement NON requis** — et à ne pas entreprendre :
toucher à `BossFinal` (au-delà de R-5), modifier `TapQuestion`/
`NumericQuestion`, fusionner le domaine Diagnostic avec Practice, migrer le
contenu de leçon existant vers du JSON, changer le format des ids de LP,
introduire une bibliothèque d'état global, ajouter des `FormRequest`/
`Resource`/`Policy` là où le dépôt n'en utilise pas.

---

## 21. Required New Components

Voir §19 pour la liste exhaustive. Les **cinq pièces critiques** dont tout le
reste dépend :

1. **`exercise.schema.json`** — le contrat. Rien ne peut être écrit avant lui.
2. **`AnswerEvaluator`** (pur, `packages/core`) — la seule chose qui décide si
   une réponse est juste, et sous quelle issue.
3. **`EvidenceScorer` + `MasteryPolicy`** — comment une tentative devient une
   valeur probante. C'est ce qui garantit l'invariant 15 (« l'état doit être
   explicable par la preuve stockée »).
4. **`PracticeEvidenceRecorder`** (PHP) — le point unique où Practice touche
   `ProgressEngine`. Toute la convergence des invariants 2 et 3 passe par ce
   fichier.
5. **`validate-exercises.mjs`** — sans lui, aucun contenu n'est sûr.

---

## 22. LP Evaluation Integration Design

C'est la section la plus importante du document. Les invariants 2 et 3 se
gagnent ou se perdent ici.

### 22.1 Le flux cible

```text
TEST FINAL (inchangé)                    PRACTICE (nouveau)
épreuve QCM en JSX                       question d'un exercice JSON
      ↓                                        ↓
correctness CLIENT                       correctness SERVEUR
      ↓                                        ↓
POST /lessons/{code}/evidence            POST /practice/sessions/{id}/answers
      ↓                                        ↓
LearningEvidenceController               PracticeAnswerController
      ↓                                        ↓
      └──────────────┬─────────────────────────┘
                     ↓
        ProgressEngine::recordEvidence()      ← LE POINT DE CONVERGENCE
                     │
                     ├─ resolveLesson()        (déjà là, inchangé)
                     ├─ idempotence attemptId  (déjà là, inchangé)
                     ├─ INSERT learning_evidence  (+ source, level,
                     │                              hints_used, outcome)
                     ├─ INSERT pivot (+ role)
                     └─ MasteryModel::updateConfidence(conf, ok, difficulty,
                                                       hintsUsed, source)
                            ↓
                     UPSERT student_learning_point_progress
                            ↓
                     UNE SEULE LIGNE PAR (élève, LP)
```

**La convergence n'est pas un principe, c'est un fichier.**
`ProgressEngine::recordEvidence()` est la seule fonction du système qui écrit
dans `student_learning_point_progress`. Tant que Practice passe par elle,
l'invariant 3 est tenu **par construction** — il n'y a nulle part ailleurs où
écrire une seconde maîtrise.

### 22.2 Où la preuve est créée

**Côté serveur, dans la même transaction que la tentative.** Pas côté client.
C'est la différence de contrat avec le test final, et elle est délibérée :
Practice corrige côté serveur (§17 C-3), donc le serveur est déjà en train de
décider ; créer la preuve au même endroit évite un aller-retour et rend
impossible qu'une tentative existe sans sa preuve.

```php
// Domain/Practice/PracticeEvidenceRecorder.php  (nouveau)
DB::transaction(function () {
    $attempt  = QuestionAttempt::create([...]);       // historique brut
    $outcome  = $evaluation->outcome;                 // décidé par le serveur
    $this->progressEngine->recordEvidence($user, $lessonCode, [
        'questionCode'      => "{$exerciseId}:{$questionId}",
        'attemptId'         => $clientAttemptId,      // idempotence
        'isCorrect'         => in_array($outcome, ['correct','equivalent_correct']),
        'outcome'           => $outcome,
        'learningPointRefs' => [['code' => '…', 'role' => 'primary'], …],
        'assessmentType'    => 'practice_exercise',
        'level'             => $exercise->level,
        'hintsUsed'         => $attempt->hints_used,
        'misconceptionId'   => $evaluation->misconceptionId,
        'answer'            => ['raw' => …, 'normalized' => …],
    ]);
});
```

### 22.3 Où elle est persistée

`learning_evidence` — **la table existante**, étendue de 5 colonnes
nullables. Pas de `practice_evidence`. Créer une seconde table de preuve
serait la violation la plus directe possible de l'invariant 2 : la question
« pourquoi ce LP est-il maîtrisé ? » exigerait alors d'interroger deux
tables et de fusionner deux historiques.

Corollaire : `GET /students/me/learning-profile` continue de fonctionner sans
modification, et un LP renforcé par Practice apparaît immédiatement dans le
profil — sans une ligne de code frontend.

### 22.4 Où l'évaluation est recalculée

`MasteryModel` — **le modèle existant, étendu**. Signature cible :

```php
public static function updateConfidence(
    float $confidence,
    bool  $isCorrect,
    int   $difficulty = self::DEFAULT_DIFFICULTY,
    int   $hintsUsed  = 0,
    string $source    = 'assessment',
    string $role      = 'primary',
): float
```

Les trois derniers paramètres ont un défaut qui reproduit **exactement** le
comportement actuel — le test final n'est donc pas affecté, et les 11 cas de
`LearningEvidenceFlowTest` doivent rester verts sans modification. C'est le
critère d'acceptation de R-4.

Principes de pondération à documenter et tester (les valeurs exactes sont une
décision de calibration, pas d'architecture) :

| Dimension | Effet attendu |
|---|---|
| Difficulté (niveau 1–5 → 1–4) | une réussite difficile monte plus ; un échec facile descend plus |
| Indices utilisés | une réussite avec 3 indices monte peu ; **jamais négatif** — « using a hint is not itself a failure » (§12 cible) |
| Rôle du LP | secondaire pondéré plus faiblement que primaire |
| Issue | `partially_correct` entre les deux ; `syntax_error` **ne bouge pas** la confiance (ce n'est pas une information mathématique) ; `abandoned` idem |
| Source | Practice et test final comptent tous deux ; le test final peut peser légèrement plus (conditions d'évaluation, sans indice) |

### 22.5 Comment l'historique reste intact

Trois garanties déjà en place, à ne pas casser :

1. `learning_evidence` n'est **jamais** mise à jour ni supprimée — que des
   `INSERT`. Vérifié : le seul écrasement du système est
   `lesson_final_test_attempts` (une ligne par élève+leçon, par conception),
   qui n'est pas une table de preuve.
2. L'unicité de `attempt_id` empêche le double comptage sans jamais écraser.
3. Un LP retiré passe en `retired_at`, jamais supprimé — la preuve qui le
   référence survit.

Practice hérite des trois. Ajouter `question_attempts` (l'historique riche de
la tentative) **en plus** de la preuve n'est pas une duplication : la preuve
est ce que le moteur de maîtrise consomme, la tentative est ce que l'élève et
le carnet relisent.

### 22.6 L'invariant 15, rendu vérifiable

> « L'état courant d'un LP doit être explicable à partir de la preuve
> stockée. »

Aujourd'hui, `confidence` est mise à jour **incrémentalement** : on ne peut
pas la recalculer depuis l'historique sans rejouer les événements dans
l'ordre. Ce n'est pas faux — c'est exactement ce que fait le modèle —, mais
cela signifie qu'une erreur de pondération est **irréversible** sans un
recalcul complet.

Recommandation (peu coûteuse, grande valeur) : rendre le recalcul possible.

```php
// Domain/Progress/MasteryRecalculator.php
// Rejoue toutes les preuves d'un (user, LP) dans l'ordre chronologique et
// reconstruit confidence/status. Doit produire EXACTEMENT la valeur stockée.
```

Un test qui compare le rollup stocké au rollup rejoué transforme l'invariant
15 en assertion exécutable, et donne le filet nécessaire pour oser calibrer
la politique de pondération plus tard.

### 22.7 Ce qui ne doit surtout pas arriver

| Anti-patron | Pourquoi c'est fatal |
|---|---|
| Une table `practice_mastery` | viole les invariants 2 et 3 ; la question « suis-je bon en X ? » aurait deux réponses |
| Un `PracticeMasteryModel` | même effet, avec en prime une dérive silencieuse des seuils |
| Practice écrivant directement dans `student_learning_point_progress` | contourne la preuve : l'état ne serait plus explicable (invariant 15) |
| Practice ayant son propre endpoint `/evidence` doublant `ProgressEngine` | deux chemins d'écriture = deux comportements qui divergeront |
| Un « score Practice » affiché à côté de l'état du LP | recrée dans l'UI la double maîtrise que l'architecture interdit |

---

## 23. Database Integration Plan

Toutes les migrations sont **additives**. Aucune colonne existante n'est
modifiée ni supprimée. Les 193 lignes de preuve et les 131 rollups restent
valides et lisibles.

### M-1 · Étendre `learning_evidence`

```php
$table->string('outcome')->nullable()->after('is_correct');
    // correct | equivalent_correct | partially_correct | incorrect
    // | syntax_error | abandoned. NULL sur les lignes antérieures :
    // is_correct reste la source pour elles.
$table->unsignedTinyInteger('level')->nullable()->after('assessment_type');
    // niveau Practice 1..5 ; NULL pour le test final (pas de niveau).
$table->unsignedTinyInteger('hints_used')->default(0)->after('level');
$table->string('misconception_id')->nullable()->after('hints_used');
    // pas de FK : les misconceptions vivent dans le contenu versionné,
    // comme diagnostic_responses.misconception. Même précédent.
$table->string('source_id')->nullable()->after('misconception_id');
    // practice_sessions.session_id, ou NULL pour le test final.
$table->index(['user_id', 'assessment_type']);
```

⚠️ `assessment_type` n'a **pas** d'index aujourd'hui alors qu'il deviendra un
critère de filtre courant (« mes preuves de pratique »).

### M-2 · Ajouter `role` au pivot

```php
Schema::table('learning_evidence_learning_point', function (Blueprint $t) {
    $t->string('role')->default('primary')->after('learning_point_id');
});
```

Le défaut préserve à l'identique le comportement des lignes existantes.

### M-3 · `practice_sessions`

```php
$table->id();
$table->uuid('session_id')->unique();     // fourni par le client, comme le diagnostic
$table->foreignId('user_id')->constrained()->cascadeOnDelete();
$table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
$table->unsignedTinyInteger('level');
$table->string('status')->default('open');       // open | completed | abandoned
$table->unsignedSmallInteger('exercises_completed')->default(0);
$table->unsignedSmallInteger('questions_answered')->default(0);
$table->unsignedSmallInteger('correct_count')->default(0);
$table->timestamp('started_at');
$table->timestamp('completed_at')->nullable();
$table->timestamps();
$table->index(['user_id', 'lesson_id', 'status']);
```

### M-4 · `exercise_attempts`

```php
$table->id();
$table->foreignId('practice_session_id')->constrained()->cascadeOnDelete();
$table->string('exercise_id');            // id du JSON, PAS une FK — le
                                          // contenu vit en fichiers versionnés
$table->unsignedTinyInteger('level');
$table->string('status')->default('in_progress');  // in_progress|completed|skipped
$table->timestamp('started_at');
$table->timestamp('completed_at')->nullable();
$table->timestamps();
$table->index(['practice_session_id', 'exercise_id']);
```

### M-5 · `question_attempts`

```php
$table->id();
$table->foreignId('exercise_attempt_id')->constrained()->cascadeOnDelete();
$table->foreignId('user_id')->constrained()->cascadeOnDelete();  // dénormalisé
                                          // pour requêter « mes erreurs »
                                          // sans triple jointure
$table->string('question_id');
$table->uuid('attempt_uuid')->unique();   // idempotence, même rôle que
                                          // learning_evidence.attempt_id
$table->json('submitted_answer');
$table->string('normalized_answer')->nullable();
$table->string('outcome');                // les 6 issues
$table->unsignedTinyInteger('hints_used')->default(0);
$table->string('misconception_id')->nullable();
$table->unsignedSmallInteger('attempt_number')->default(1);
$table->timestamp('started_at')->nullable();
$table->timestamp('submitted_at');
$table->timestamps();
$table->index(['user_id', 'outcome']);
```

### M-6 · `hint_events`

```php
$table->id();
$table->foreignId('question_attempt_id')->constrained()->cascadeOnDelete();
$table->unsignedTinyInteger('hint_index');   // 1..3
$table->string('hint_type');                 // look | direction | strategy
$table->timestamp('requested_at');
$table->timestamps();
$table->unique(['question_attempt_id', 'hint_index']);
```

**À arbitrer** (§33 D-3) : cette table n'apporte, au-delà de
`question_attempts.hints_used`, que **l'horodatage de chaque demande**.
Cela a une valeur réelle (mesurer le temps de lutte productive), mais si
personne ne l'exploite en phase 1, la colonne suffit. Recommandation :
**créer la table** — l'ajouter plus tard signifierait perdre définitivement
l'historique de la période intermédiaire, alors qu'une table peu lue ne coûte
rien.

### M-7 · `notebook_notes`

```php
$table->id();
$table->foreignId('user_id')->constrained()->cascadeOnDelete();
$table->foreignId('lesson_id')->nullable()->constrained()->nullOnDelete();
$table->string('exercise_id')->nullable();
$table->string('question_id')->nullable();
$table->foreignId('learning_point_id')->nullable()->constrained()->nullOnDelete();
$table->text('content');
$table->string('mistake_type')->nullable();   // calcul | méthode | lecture
                                              // | signe | étourderie | …
$table->timestamps();                          // createdAt/updatedAt : requis
                                               // par le §20 de la cible
$table->index(['user_id', 'lesson_id']);
$table->index(['user_id', 'learning_point_id']);
```

Les deux index couvrent d'emblée « Mes erreurs par chapitre » et « Mes
erreurs par Learning Point » (§20 cible) sans construire les tableaux de bord.

### `misconception_events` — **ne pas créer**

`question_attempts.misconception_id` porte la même information, avec son
contexte complet (quelle question, quelle réponse, quel exercice, quand).
Une table dédiée serait une dénormalisation sans requête qui la justifie.
Précédent du dépôt : `diagnostic_responses.misconception` est une colonne.

### Tables de contenu — **ne pas créer**

`exercises`, `exercise_questions`, `exercise_choices`, `exercise_hints`,
`exercise_misconceptions`, `exercise_variants` : le contenu reste en fichiers
versionnés (§14). Les colonnes `exercise_id` / `question_id` sont donc des
**chaînes, pas des clés étrangères** — exactement comme
`learning_evidence.question_code` et `diagnostic_responses.question_id`, dont
les migrations documentent déjà cette convention.

### Séquence et réversibilité

M-1 et M-2 d'abord (elles débloquent la preuve Practice), M-3→M-7 ensuite.
Chaque `down()` est un `dropColumn` / `dropIfExists` propre. **Aucune
migration de données n'est nécessaire** — c'est la propriété qui rend ce plan
sûr.

---

## 24. API Integration Plan

La spécification complète est en §8.2. Points d'intégration :

| Décision | Choix | Raison |
|---|---|---|
| Versionnement | `v1`, même préfixe | pas de rupture ; l'API existante est jeune |
| Nommage | `/lessons/{lessonCode}/practice/...` pour ce qui est lié à une leçon, `/practice/...` pour ce qui est lié à une session | suit `/lessons/{code}/evidence` et `/diagnostic/sessions/{id}/responses` |
| Identité | `$request->user()` **exclusivement** | jamais un champ du corps — règle absolue du dépôt |
| Autorisation | filtrage par `user_id` ; **404** sur la ressource d'autrui | précédent `ProgressEngine.php:56-59` |
| Validation | `$request->validate()` inline dans le contrôleur | il n'y a **aucun** `FormRequest` dans le dépôt |
| Sérialisation | méthode `private serialize()` ou `Builder` pur | il n'y a **aucune** classe `Resource` |
| Erreurs | `DomainException` → 422 + `message` **en français** | précédent `LearningEvidenceController` |
| Idempotence | `attemptId` UUID client sur toute écriture de tentative | ce qui rend la file hors-ligne sûre |
| Casse | camelCase dans le JSON, snake_case en base | convention constante |
| Limitation de débit | à considérer sur l'endpoint de réponse | seuls les endpoints publics sont limités aujourd'hui ; une session authentifiée n'en a probablement pas besoin |

**Contrat de sécurité, non négociable** : `GET /next-exercise` ne renvoie
**jamais** `expectedAnswer`, `isCorrect` par choix, `misconceptionId`, ni le
contenu des indices. Un test de fonctionnalité doit l'affirmer explicitement
(§28) — c'est le genre de fuite qu'une refonte de sérialiseur réintroduit
sans bruit.

---

## 25. Frontend Integration Plan

### Arborescence proposée

```text
apps/web/src/
├── pages/practice/
│   ├── PracticeHub.jsx            /pratiquer/:lessonCode
│   ├── PracticeSession.jsx        /pratiquer/:lessonCode/session/:sessionId
│   └── PracticeSummary.jsx        …/bilan
├── features/practice/
│   ├── components/
│   │   ├── LevelSelector.jsx
│   │   ├── ExercisePlayer.jsx
│   │   ├── ExerciseStatement.jsx
│   │   ├── QuestionRenderer.jsx        ← registre {answerType → widget}
│   │   ├── inputs/{ChoiceInput,MathAnswerInput,NumericInput}.jsx
│   │   ├── HintPanel.jsx
│   │   ├── FeedbackPanel.jsx
│   │   ├── Notebook.jsx
│   │   └── SessionProgress.jsx
│   ├── hooks/{usePracticeSession,usePracticeContent,useNotebook}.js
│   └── practiceQueue.js
├── services/practiceService.js
└── content/practice/<grade>/<lesson>/level-N/*.json
```

`features/` est un dossier nouveau : le dépôt a `components/`, `pages/`,
`lessons/`, `services/`, `hooks/`. Practice n'est ni une leçon ni du
marketing ; lui donner son dossier évite de gonfler `components/` (déjà
9 sous-dossiers thématiques) et marque l'indépendance architecturale
exigée par le §3 de la cible.

### Les trois points de contact avec l'existant

1. **`LessonIndex.jsx`** — un bouton, une fois, 132 leçons servies. À placer
   près du widget de progression ; visible seulement si l'index de contenu
   déclare des exercices pour cette leçon.
2. **`App.jsx`** — 5 routes paramétrées (§16.3), montées une fois, **hors**
   du bloc des ~132 imports de leçons.
3. **`packages/core/practice/`** — le moteur pur, partagé, sans React. Même
   frontière que `packages/core/exercise/adaptiveExerciseState.js` : testable
   sous Node nu, réutilisable par un futur client natif.

### Patrons à reprendre tels quels

- **Registre de types** de `components/diagnostic/QuestionRenderer.jsx` :
  ajouter un type de réponse = ajouter un widget + une entrée, sans
  branchement ailleurs. C'est ce qui rend le lecteur d'exercices
  data-driven.
- **Idiome de garde d'hydratation** (guide §9) pour tout état persisté :
  `useState(readLocal)` + `useRef` de garde + `useEffect` unique + chemin
  `redo()` qui arme la garde. Explicitement : « Copy this idiom for any new
  per-lesson persisted state — don't invent a new pattern. »
- **File hors-ligne** sur le modèle d'`evidenceQueue.js`, avec une différence
  de contrat : Practice envoie la *réponse*, pas la correction, donc une
  entrée rejouée peut revenir avec un verdict — la file doit savoir le
  ranger, pas seulement le jeter.

### Contraintes responsive (§17 de la cible)

Le dépôt a une exigence vérifiée : **aucun défilement horizontal à 375 px**
(les 466 pages de 2de ont été ouvertes pour le confirmer). Trois points
d'attention propres à Practice :

- **Le clavier virtuel de MathLive** occupe la moitié basse d'un écran de
  téléphone. La zone de réponse doit rester visible clavier ouvert — c'est
  le risque ergonomique n°1 du lecteur, et il n'a jamais été testé dans ce
  produit puisque MathLive n'a jamais tourné.
- **L'échelle typographique** a été recalibrée le 2026-09-06
  (`xs=13, sm=15, base=17`) ; ne jamais utiliser `text-[10px]`/`text-[11px]`
  dans du contenu neuf.
- **Le carnet** : sur mobile, une zone de saisie de texte sous l'exercice
  pousse tout hors écran. Préférer un panneau escamotable.

---

## 26. Exercise Contract Integration Plan

### Le contrat proposé

Aligné sur le §24 de la cible **et** sur les conventions réelles du dépôt
(codes de LP canoniques, `lessonCode`, français côté élève).

```jsonc
{
  "$schema": "../../../_schema/exercise.schema.json",
  "id": "ex-3e-nombres-rationnels-l3-002",
  "lessonCode": "nombres-rationnels",
  "level": 3,

  "metadata": {
    "title": "Le budget du club",
    "estimatedMinutes": 8,
    "tags": ["standard", "multi-step", "contexte"]
  },

  "statement": {
    "content": "Le club a dépensé $\\frac{2}{5}$ de son budget …"
  },

  "questions": [
    {
      "id": "q1",
      "statement": "Quelle fraction du budget reste-t-il ?",
      "learningPoints": [
        { "code": "3e_nombres-rationnels_P5", "role": "primary" }
      ],
      "answerType": "mathlive",
      "answerFormat": "\\frac{a}{b}",
      "expectedAnswer": "\\frac{3}{5}",
      "evaluationPolicy": {
        "acceptEquivalent": true,
        "requiredForm": "irreducible",
        "tolerance": null
      },
      "hints": [
        { "id": "h1", "type": "look",      "content": "Le budget entier, c'est combien de cinquièmes ?" },
        { "id": "h2", "type": "direction", "content": "Écris le budget entier sous forme de fraction de dénominateur 5." },
        { "id": "h3", "type": "strategy",  "content": "Soustrais deux fractions de même dénominateur : les dénominateurs ne changent pas." }
      ],
      "feedback": {
        "correct": "Oui — même découpe, donc on soustrait seulement les numérateurs.",
        "incorrect": "Regarde le dénominateur de ta réponse : as-tu gardé la même découpe ?"
      }
    },
    {
      "id": "q2",
      "statement": "…",
      "learningPoints": [
        { "code": "3e_nombres-rationnels_P8", "role": "primary"   },
        { "code": "3e_nombres-rationnels_P9", "role": "secondary" }
      ],
      "answerType": "choice",
      "choices": [
        { "id": "A", "content": "…", "isCorrect": true },
        { "id": "B", "content": "…", "isCorrect": false, "misconceptionId": "MISC-FRAC-ADD-DENOM" },
        { "id": "C", "content": "…", "isCorrect": false, "misconceptionId": "MISC-PRIORITE-GAUCHE-DROITE" },
        { "id": "D", "content": "…", "isCorrect": false, "misconceptionId": "MISC-SIGNE-SOUSTRACTION" }
      ],
      "hints": [ … ],
      "feedback": { "correct": "…", "incorrect": "…" }
    }
  ]
}
```

### Écarts assumés avec l'illustration du §24 de la cible

| Cible | Ici | Raison |
|---|---|---|
| `lessonId: "2nde-fonctions-affines"` | `lessonCode` | c'est le nom réel de la colonne (`lessons.code`) et du paramètre d'URL de l'API |
| `"id": "LP-2N-FCT-03"` | `"code": "3e_nombres-rationnels_P5"` | le format réel, en base, référencé par 1 339 déclarations |
| LP au niveau de l'exercice **et** de la question | **question seulement** | les LP de l'exercice sont l'union de ceux de ses questions ; les dupliquer crée deux vérités à maintenir. Le validateur peut dériver l'union. |
| `expectedAnswer` dans le même fichier | idem, mais **jamais sérialisé vers le client** | voir §17 C-3 : deux projections, une source |

### Le registre de misconceptions

Fichier unique versionné, `content/practice/misconceptions.json` :

```jsonc
{
  "MISC-FRAC-ADD-DENOM": {
    "label": "Additionne les dénominateurs",
    "explanation": "Quand on additionne deux fractions de même dénominateur, la découpe ne change pas : seul le nombre de parts change. $\\frac{1}{5}+\\frac{2}{5}=\\frac{3}{5}$, pas $\\frac{3}{10}$.",
    "relatedLearningPoints": ["3e_nombres-rationnels_P5"]
  }
}
```

Le §25 de la cible le demande (« reusable entities/IDs rather than duplicated
free text »), et le diagnostic PHP fait déjà exactement cela avec ses ids de
misconception. **Un identifiant partagé permet de compter** : « cet élève
retombe trois fois sur MISC-FRAC-ADD-DENOM » est une information que du texte
libre ne donnera jamais.

### `validate-exercises.mjs` — la garde

À ajouter à `npm run check:lessons`. Vérifications, par ordre d'importance :

**Identité** — id d'exercice unique globalement ; `lessonCode` existe dans le
catalogue ; ids de question uniques dans l'exercice ; `level` ∈ 1..5.

**Learning Points** — chaque `code` existe **et appartient à cette leçon**
(réutiliser l'index de `scripts/lib/lessonAst.mjs`, exactement comme
`validate-lessons.mjs:291-294`) ; au moins un LP par question ; **exactement
un** `role: "primary"`.

**Réponses** — `answerType` connu ; QCM : ≥ 2 choix, **exactement un**
`isCorrect: true`, ids uniques ; `mathlive`/`numeric` : `expectedAnswer`
présent et `answerFormat` non vide.

**Indices** — au plus 3 ; types dans l'ordre `look → direction → strategy` ;
**détection de fuite** : rejeter tout indice contenant `expectedAnswer`
normalisé, ou l'intitulé d'un choix correct. C'est l'invariant 10 de la
cible, et la seule vérification qui demande un peu d'astuce — une
normalisation grossière (espaces, casse, `\left`/`\right`) attrape déjà la
quasi-totalité des cas.

**Format de réponse** — `answerFormat` ne doit pas contenir la réponse
attendue (invariant 8).

**Minimum par leçon** — en mode `--strict`, une leçon déclarée « Practice
active » doit avoir **≥ 3 exercices sur chacun des 5 niveaux**. En mode
normal, avertir seulement — sinon le tout premier exercice écrit fait échouer
la CI, ce qui rendrait le développement incrémental impossible.

**Mathématiques** — `MathText`/KaTeX parse chaque champ de contenu (reprendre
`check-katex.mjs`, qui attrape déjà les simples antislashs mangés par
l'échappement JS).

---

## 27. First Reference Lesson Strategy

### Critères de choix

Une leçon de référence doit : (1) avoir un contenu mathématique riche et
varié, pour que 5 niveaux aient un sens ; (2) supporter à la fois le QCM et
la réponse libre, pour exercer les deux modes ; (3) avoir des misconceptions
classiques bien connues, pour que les distracteurs soient vrais ; (4) être
déjà de haute qualité et bien auditée ; (5) avoir assez de LP pour tester le
mapping, sans excès.

### Candidats évalués

| Leçon | LP | Pour | Contre |
|---|---|---|---|
| **`nombres-rationnels` (3e)** | 10 | Reconstruite récemment et documentée (`3E_NOMBRES_RATIONNELS_SPEC.md`, `nombres_rationnels_rebuild`) ; misconceptions de fractions parmi les mieux établies de la didactique ; QCM **et** réponse libre naturels ; niveau 5 crédible (priorités, problèmes) ; les 4 opérations donnent une vraie gradation | 3e = programme chargé |
| `fractions` (6e) | — | La leçon de référence historique du projet ; manipulation forte | Réponses libres pauvres en 6e ; niveaux 4–5 difficiles à rendre exigeants sans sortir du programme |
| `vecteurs-2nde` | 14 | 14 LP, audit exhaustif, riche géométriquement | La réponse est souvent un couple de coordonnées ou une figure — le mode « réponse libre » y est atypique ; 14 LP compliquent le premier mapping |
| `second-degre-resoudre-1ere` | 5 | Réponse libre algébrique idéale (`x = …`), équivalence et forme requise pleinement exercées, misconceptions nettes (signe du discriminant, oubli d'une racine) | Leçon très récente (2026-09-10), moins éprouvée ; 5 LP seulement |

### Recommandation : **`nombres-rationnels` (3e)**

C'est la leçon qui exerce **le plus de chemins du moteur à la fois** :

- **10 LP** : assez pour tester le mapping primaire/secondaire, pas assez
  pour noyer la première itération.
- **Les deux modes de réponse sont naturels.** Comparer deux rationnels →
  QCM. Calculer $\frac{2}{3} - \frac{1}{4}$ → réponse libre.
- **`requiredForm: "irreducible"` a un sens mathématique évident ici** — et
  c'est justement la fonctionnalité que `mathComparison` n'a pas. La leçon de
  référence doit forcer à la construire correctement.
- **Les misconceptions sont canoniques** : additionner les dénominateurs,
  « plus le dénominateur est grand, plus la fraction est grande », inverser
  numérateur et dénominateur à la division. Elles sont déjà nommées dans le
  diagnostic 6e (`numerateur-denominateur-inverses`), donc le registre
  démarre avec du contenu réutilisable et déjà validé.
- **La gradation 1→5 est authentique** : reconnaître une écriture équivalente
  (1) → rendre irréductible (2) → additionner à dénominateurs différents (3)
  → enchaîner avec priorités (4) → problème contextualisé multi-étapes (5).
  Aucun niveau n'a besoin de « nombres plus gros » pour être plus dur — c'est
  l'invariant 11.
- Un plan de secours existe : si l'algèbre libre pose un problème serveur
  (D-1), les rationnels restent évaluables **sans Compute Engine**, par
  comparaison de fractions en entiers exacts — `AnswerChecker::checkFraction`
  le fait déjà par produit en croix. **La leçon de référence ne peut donc
  pas être bloquée par la décision D-1.** C'est l'argument décisif.

### Le pipeline que la référence doit prouver

```text
leçon terminée → test final → preuve → LP à 'reinforce'
   → « Commencer à pratiquer » → Hub → niveau 3 → session
   → exercice → question → réponse → indice → retour → carnet
   → tentative persistée → preuve Practice
   → MÊME ligne de student_learning_point_progress mise à jour
   → LP passe à 'mastered' → bilan de session → recommandation
```

**Le critère d'acceptation qui compte plus que tous les autres :** après le
test final puis la pratique, il existe **exactement une** ligne dans
`student_learning_point_progress` pour ce `(user, learning_point)`, et
`attempts` est la somme des deux sources. Un test d'intégration doit
l'affirmer.

### Contenu à produire : 15 exercices

| Niveau | Intention | Exemples de LP visés |
|---|---|---|
| 1 — Reconnecter | reconnaître des écritures équivalentes | P1, P2 |
| 2 — Appliquer | rendre irréductible, comparer | P3, P4 |
| 3 — Exercice standard | additionner/soustraire, multiplier | P5, P6 |
| 4 — Multi-étapes | diviser, enchaîner, priorités | P7, P8, P9 |
| 5 — Défi / type brevet | problème contextualisé | P10 + rappel des précédents |

Les 3 exercices d'un niveau doivent varier de contexte, de représentation et
de chemin de raisonnement (§16 cible) — pas seulement de nombres.

**Ne pas générer les 131 autres leçons avant que celle-ci ne soit prouvée en
navigateur, avec un vrai compte, sur mobile.**

---

## 28. Testing Strategy

### Unitaires — `packages/core/practice/` (Vitest, Node nu)

| Cible | Cas essentiels |
|---|---|
| `AnswerEvaluator` | dispatch par `answerType` ; type inconnu → erreur explicite, pas un `false` silencieux |
| `MathComparison` | `2(x+3)` ≡ `2x+6` quand `acceptEquivalent` ; **refusé** quand `requiredForm: "factorized"` ; `\frac{2}{4}` refusé si `requiredForm: "irreducible"` ; entrée malformée → `syntax_error` et **non** `incorrect` ; `1/2` ≡ `0,5` ; `x` ≠ `X` (la régression du repli sur chaînes) |
| `NumericEvaluator` | tolérance ; virgule française ; **le vrai signe moins U+2212** (piège documenté de `parseDec`) ; espace fine insécable de `fr-FR` |
| `ChoiceEvaluator` | choix correct ; distracteur → le bon `misconceptionId` ; id inconnu → `incorrect` sans plantage |
| `HintEngine` | progression 1→2→3 ; jamais au-delà de 3 ; l'ordre est monotone ; le compteur ne se réinitialise pas entre deux tentatives de la même question |
| `EvidenceScorer` | une réussite difficile > une réussite facile ; une réussite avec 3 indices < sans indice, **mais reste positive** ; un LP secondaire pèse moins qu'un primaire ; `syntax_error` ne bouge pas la confiance |
| `MasteryPolicy` | transitions aux seuils exacts 0,40 et 0,70 ; **les valeurs actuelles sont reproduites à l'identique** quand les nouveaux paramètres sont à leur défaut (test de non-régression) |
| `RecommendationEngine` | cible le LP le plus faible ; ne répète pas un exercice déjà réussi dans la session ; s'arrête proprement quand le niveau est épuisé |
| `SessionEngine` | ouverture, reprise, complétion ; une session close n'accepte plus de réponse |

### Contrat — `scripts/validate-exercises.mjs` + tests du script

Chaque fixture d'exercice valide contre le schéma. Et surtout, des fixtures
**invalides** qui doivent échouer : LP d'une autre leçon, deux choix
corrects, 4 indices, un indice contenant la réponse, `answerFormat` révélant
la réponse, id dupliqué, niveau 6. Le patron existe déjà :
`scripts/audit/__fixtures__/`.

### Backend — `apps/api/tests/Feature/`

| Test | Assertion |
|---|---|
| `PracticeSessionFlowTest` | ouverture idempotente ; reprise ; session d'autrui → **404** |
| `PracticeAnswerFlowTest` | une réponse crée `question_attempts` **et** `learning_evidence` **et** met à jour le rollup, en une transaction |
| — idem | rejeu du même `attemptId` → `duplicate: true`, **aucun** double comptage |
| — idem | une réponse fausse **ne bloque jamais** la suite (invariant non-bloquant du dépôt) |
| **`PracticeAnswerLeakTest`** | la réponse de `next-exercise` ne contient **ni** `expectedAnswer`, **ni** `isCorrect`, **ni** `misconceptionId`, **ni** le contenu des indices |
| `PracticeEvidenceTypeTest` | `'practice_exercise'` accepté ; **`'discovery'` toujours refusé en 422** (la non-régression de C-1) |
| `NotebookFlowTest` | CRUD ; la note d'autrui → 404 |
| `LearningEvidenceFlowTest` | **les 11 cas existants restent verts sans modification** — critère d'acceptation de R-4 |

### Intégration — le test qui décide de tout

```php
public function test_final_test_and_practice_converge_on_one_learning_point_row(): void
{
    // 1. soumettre une preuve de test final sur LP X  → 1 ligne de rollup
    // 2. soumettre une preuve Practice sur le MÊME LP X
    // 3. assertDatabaseCount('student_learning_point_progress', 1)
    // 4. attempts == 2, la confiance a évolué deux fois
    // 5. assertDatabaseCount('learning_evidence', 2)  ← l'historique est intact
}
```

Et son miroir :

```php
public function test_module_questions_never_create_evidence(): void
// invariant 1 — déjà couvert côté serveur, à recouvrir avec la nouvelle
// liste de sources autorisées.
```

Plus `test_mastery_can_be_recomputed_from_evidence()` — l'invariant 15 rendu
exécutable (§22.6).

### End-to-end — `apps/web/e2e/`

Le dépôt a une infrastructure e2e maison (Playwright/Puppeteer, ~14 scripts).
Un parcours complet à ajouter, avec les pièges déjà catalogués :

- semer la progression sous la clé **portée par l'utilisateur**
  (`u_anon_smarter_lesson_<id>`, jamais la clé nue) ;
- les espaces fines insécables de `fr-FR` cassent les sélecteurs littéraux ;
- lancer Vite avec `setsid` ;
- vérifier **0 défilement horizontal à 375 px** et **0 erreur console** —
  c'est la barre appliquée aux 466 pages de 2de.

Et le test que rien d'existant ne couvre : **la saisie MathLive sur mobile,
clavier virtuel ouvert.**

---

## 29. Risk Register

| # | Risque | Sévérité | Probabilité | Mitigation |
|---|---|---|---|---|
| R1 | **Double système de maîtrise** créé par inadvertance (une table `practice_mastery`, un second modèle) | **Critique** | Faible | Une seule porte d'écriture : `ProgressEngine`. Test d'intégration §28 « une seule ligne ». Le dire dans le PR template. |
| R2 | **Casser le test final** en modifiant `ProgressEngine`/`MasteryModel` | **Critique** | Moyenne | Tous les nouveaux paramètres ont un défaut reproduisant le comportement actuel. Les 11 cas de `LearningEvidenceFlowTest` doivent passer **sans être modifiés** — critère d'acceptation explicite. |
| R3 | **Corruption des 193 preuves / 131 rollups** existants | **Critique** | Très faible | Toutes les migrations sont additives, colonnes nullables ou à défaut. Zéro migration de données. Sauvegarde avant M-1. |
| R4 | **Fuite des réponses attendues** au client | Élevée | **Élevée** si on n'y pense pas | Deux projections depuis une source unique ; `PracticeAnswerLeakTest` en CI ; ne jamais sérialiser l'objet d'exercice complet. |
| R5 | **Mauvais calcul de maîtrise** — Practice fait passer un LP en `mastered` trop vite | Élevée | Moyenne | `EvidenceScorer` pur et testé aux bornes ; pondération par difficulté et indices ; `MasteryRecalculator` pour pouvoir corriger après coup sans perte. |
| R6 | **Équivalence algébrique fausse** — une bonne réponse refusée, ou une mauvaise acceptée | Élevée | **Élevée** | C'est le risque le plus sous-estimé : `compareMathExpressions` a un repli sur chaînes qui masque les deux erreurs. Batterie de cas dédiée, `syntax_error` distinct d'`incorrect`, et la leçon de référence choisie pour rester évaluable en arithmétique exacte. |
| R7 | **Contenu codé en dur** dans React malgré l'invariant 13 | Élevée | Moyenne | Décider le format **avant** d'écrire le premier exercice (phase 1). `validate-exercises.mjs` dès la phase 1, pas après. |
| R8 | **Couplage excessif leçon ↔ Practice** | Moyenne | Moyenne | Practice ne référence que `lessonCode` et des codes de LP. Aucun `import` depuis `lessons/` dans `features/practice/` — vérifiable par une règle ESLint ou une garde de script. |
| R9 | **Explosion de la table de routes** (132 → 500+) | Moyenne | Faible | 5 routes paramétrées, hors de l'arbre des leçons (§16.3). |
| R10 | **Régression de responsive**, en particulier le clavier MathLive sur mobile | Moyenne | **Élevée** | MathLive n'a **jamais** tourné dans ce produit. Tester tôt sur vrai téléphone, pas seulement en émulation. Prévoir un repli `NumberField` par question. |
| R11 | **Performance** — charger toute la bibliothèque d'exercices | Moyenne | Faible | Index généré + `import.meta.glob` paresseux + chargement par session (§38 cible). |
| R12 | **Compatibilité API** | Faible | Faible | Endpoints entièrement nouveaux, préfixe `v1` partagé, aucun contrat existant modifié. |
| R13 | **Dérive du contenu** — un LP renommé/réordonné dans `pointsToLearn` casse silencieusement le mapping d'exercice | Élevée | Faible mais **irréversible** | `pointsToLearn` est *append-only* (déjà documenté). `validate-exercises.mjs` vérifie l'appartenance à chaque exécution ; `smarter:validate-curriculum --strict` détecte la dérive de titre. |
| R14 | **Deux lecteurs du même contenu qui divergent** (JS pour la validation, PHP pour la correction) | Moyenne | Moyenne | Un seul schéma JSON faisant autorité, validé par les deux côtés. Test de contrat partagé sur les mêmes fixtures. |
| R15 | **Périmètre de la phase 1 qui déborde** vers les 132 leçons avant que la référence ne soit prouvée | Moyenne | **Élevée** | Règle explicite : aucune génération de masse avant la validation en navigateur de la leçon de référence (§27, §41 cible). |
| R16 | **Fuite de réponse dans un indice**, écrite de bonne foi par l'auteur | Moyenne | Élevée | Vérification automatisée dans `validate-exercises.mjs` (§26). |

---

## 30. Phased Implementation Roadmap

Ordonné par **dépendance**, pas par visibilité. Chaque phase se termine sur
quelque chose de vérifiable.

---

### Phase 1 — Contrats et schéma · *aucune dépendance*

**Objectif** — figer la forme des données avant qu'un seul exercice n'existe.

**Fichiers** — `content/practice/_schema/{exercise,question,answer,hint}.schema.json` ·
`content/practice/misconceptions.json` · `scripts/validate-exercises.mjs` ·
réécriture de `docs/architecture/EXERCISE_CONTRACT.md`

**Tâches** — décider JSON vs module JS (recommandé : JSON, §14.3) · écrire le
schéma · écrire la garde et la brancher dans `check:lessons` · écrire 2
fixtures valides et 6 invalides · amorcer le registre de misconceptions avec
celles du diagnostic 6e

**Tests** — le script échoue sur chacune des 6 fixtures invalides, avec le
bon message

**Risques** — R7, R14 · **Migration** — aucune

**Acceptation** — `npm run validate:exercises` distingue correctement valide
et invalide ; le schéma référence des codes de LP réels validés contre le
catalogue.

---

### Phase 2 — Moteur de domaine pur · *dépend de 1*

**Objectif** — toute la logique d'évaluation, sans UI, sans base, sans React.

**Fichiers** — `packages/core/practice/{AnswerEvaluator,ChoiceEvaluator,
NumericEvaluator,MathComparison,HintEngine,MisconceptionResolver,
EvidenceScorer,MasteryPolicy,RecommendationEngine,SessionEngine}.js` +
un fichier de test par module · refonte de `packages/core/mathComparison.js`

**Tâches** — implémenter les 6 issues · `requiredForm` (irréductible,
factorisée, développée) · supprimer le repli sur chaînes · étendre
`adaptiveExerciseState` en `HintEngine` · écrire la politique de pondération
**et sa documentation**

**Tests** — tout le bloc « Unitaires » du §28. C'est la phase la plus dense en
tests du projet, et c'est voulu : une erreur ici corrompt les données
d'apprentissage.

**Risques** — R5, R6 · **Migration** — aucune

**Acceptation** — 100 % des cas du §28 passent ; `MasteryPolicy` reproduit
**exactement** les valeurs actuelles quand les nouveaux paramètres sont à
leur défaut ; aucune importation de React, DOM ou Vite dans le paquet.

---

### Phase 3 — Base de données · *dépend de 1*

**Objectif** — les 7 migrations, sans code applicatif.

**Fichiers** — les migrations M-1…M-7 (§23) + les modèles Eloquent

**Tâches** — écrire les migrations · les modèles avec leurs `casts` et
relations · vérifier chaque `down()`

**Tests** — `migrate` puis `migrate:rollback` propres sur une base vierge ;
`php artisan test` reste vert ; **vérifier sur une copie de la base de
production** que les 193 preuves et 131 rollups survivent à M-1/M-2

**Risques** — R3 · **Migration** — additive seulement, sauvegarde avant M-1

**Acceptation** — aller-retour de migration propre ; les données existantes
inchangées ; les tests existants verts.

---

### Phase 4 — Services backend · *dépend de 2, 3*

**Objectif** — la logique serveur, sans HTTP.

**Fichiers** — `app/Domain/Practice/{PracticeSessionService,ExerciseRepository,
AnswerEvaluationService,PracticeEvidenceRecorder,RecommendationService,
NotebookService}.php` · **extension** de `ProgressEngine` et `MasteryModel` ·
nouveau `MasteryRecalculator`

**Tâches** — R-1 (élargir le garde-fou de type) · R-4 (passer la difficulté) ·
lecture et cache du JSON par `ExerciseRepository` · la correction serveur
(voir D-1 pour l'algèbre)

**Tests** — le bloc « Backend » du §28, dont **`PracticeEvidenceTypeTest`** et
la non-régression des 11 cas existants

**Risques** — **R1, R2** (les deux critiques) · **Migration** — aucune

**Acceptation** — une preuve Practice écrite en base met à jour **la même**
ligne de rollup qu'une preuve de test final ; `'discovery'` toujours refusé ;
`LearningEvidenceFlowTest` vert **sans modification**.

---

### Phase 5 — API · *dépend de 4*

**Objectif** — les 7 endpoints du §8.2.

**Fichiers** — les 4 contrôleurs · `routes/api.php`

**Tests** — un test de fonctionnalité par endpoint · **`PracticeAnswerLeakTest`**

**Risques** — **R4** · **Migration** — aucune

**Acceptation** — le parcours complet fonctionne au `curl` avec un vrai
jeton ; aucune donnée d'évaluateur dans aucune réponse ; une ressource
d'autrui renvoie 404.

---

### Phase 6 — Practice Hub · *dépend de 5*

**Objectif** — l'élève voit ses niveaux et peut en ouvrir un.

**Fichiers** — `pages/practice/PracticeHub.jsx` · `LevelSelector.jsx` ·
`services/practiceService.js` · `hooks/usePracticeContent.js` ·
`App.jsx` (routes) · **`LessonIndex.jsx` (le bouton)**

**Tests** — rendu ; état vide ; état d'erreur ; **375 px sans défilement
horizontal**

**Risques** — R9 · **Migration** — aucune

**Acceptation** — depuis n'importe laquelle des 132 leçons, « Commencer à
pratiquer » mène au Hub ; les compteurs sont exacts ; le verrouillage des
niveaux s'explique à l'élève.

---

### Phase 7 — Exercise Player · *dépend de 6*

**Objectif** — répondre à une question et recevoir un retour.

**Fichiers** — `ExercisePlayer.jsx` · `ExerciseStatement.jsx` ·
`QuestionRenderer.jsx` (registre) · `inputs/*` · `HintPanel.jsx` ·
`FeedbackPanel.jsx` · réécriture de `MathInput`

**Tests** — un test par type de réponse ; **MathLive sur vrai téléphone,
clavier virtuel ouvert** ; l'indice n'apparaît que sur demande

**Risques** — **R10**, R6 · **Migration** — aucune

**Acceptation** — QCM et réponse libre fonctionnent ; les 3 indices se
révèlent progressivement ; le retour de misconception s'affiche ; utilisable
à une main sur téléphone.

---

### Phase 8 — Sessions et progression · *dépend de 7*

**Objectif** — enchaîner les exercices et clore une session.

**Fichiers** — `PracticeSession.jsx` · `PracticeSummary.jsx` ·
`SessionProgress.jsx` · `usePracticeSession.js` · `practiceQueue.js` ·
extraction de `ProfilMaitrise` (R-5)

**Tests** — reprise après rechargement ; hors-ligne puis reconnexion ;
le bilan reflète les preuves réellement écrites

**Risques** — R8 · **Migration** — aucune

**Acceptation** — une session survit à un rechargement ; le bilan montre
l'évolution réelle des LP ; l'extraction de `ProfilMaitrise` ne change **rien**
au rendu du Boss Final (vérifié par capture).

---

### Phase 9 — Carnet · *dépend de 5*

**Objectif** — écrire une note ou marquer une erreur, durablement.

**Fichiers** — `Notebook.jsx` · `useNotebook.js` · `NotebookController` ·
page « Mes erreurs / Mes notes » sous `/espace`

**Tests** — CRUD ; isolation entre comptes ; ergonomie mobile

**Risques** — R10 · **Migration** — M-7 déjà appliquée

**Acceptation** — une note survit à la déconnexion/reconnexion et à un
changement d'appareil ; elle est reliée à son exercice et à son LP.

---

### Phase 10 — Convergence de l'évaluation des LP · *dépend de 8*

**Objectif** — **prouver** l'invariant 2 et l'invariant 3.

**Fichiers** — tests d'intégration · `MasteryRecalculator` · le tableau de
bord de maîtrise de la leçon (réutilise `LearningPointMastery`)

**Tests** — `test_final_test_and_practice_converge_on_one_learning_point_row`
· `test_mastery_can_be_recomputed_from_evidence`
· `test_module_questions_never_create_evidence`

**Risques** — **R1, R5** · **Migration** — aucune

**Acceptation** — les trois tests passent ; l'élève voit **un seul** état par
LP, quelle que soit la source ; cet état est explicable depuis l'historique.

---

### Phase 11 — Les 15 exercices de référence · *dépend de 1, 10*

**Objectif** — le contenu qui prouve le pipeline de bout en bout.

**Fichiers** — `content/practice/3e/nombres-rationnels/level-{1..5}/*.json`
(15 fichiers) · les entrées de misconception correspondantes

**Tâches** — écrire les 15 · faire varier contexte, représentation et chemin
de raisonnement (§16 cible) · les faire passer par la garde

**Tests** — `validate-exercises.mjs --strict` vert · **relecture
mathématique humaine des 15** · le parcours e2e complet

**Risques** — R15 · **Migration** — aucune

**Acceptation** — un élève réel termine une session de niveau 3 dans un vrai
navigateur, sur téléphone ; son profil de LP a bougé ; aucune erreur console.

---

### Phase 12 — Validation qualité et nettoyage · *dépend de 11*

**Objectif** — durcir avant toute mise à l'échelle.

**Tâches** — retirer le code mort (§18 DEPRECATE, R-10) · corriger
`ARCHITECTURE.md` §3/§5 et `MOBILE_READINESS_REPORT.md` · relecture
d'accessibilité · budget de performance · rejouer les gardes complètes

**Acceptation** — `npm run check:lessons` (avec `validate:exercises`) et
`php artisan test` verts ; aucune référence de documentation à un fichier
inexistant.

---

### Phase 13 — Mise à l'échelle du contenu · *dépend de 12*

**Objectif** — étendre au-delà de la leçon de référence.

**Tâches** — pipeline de génération (§32 cible) · relecture pédagogique par
lot · déploiement progressif, chapitre par chapitre

**Règle absolue** — **ne pas commencer avant que la phase 12 ne soit close.**

---

## 31. Dependency Graph

```text
        Learning Points canoniques (EXISTE — 1 067 en base)
                          │
                          ▼
        Contrat d'exercice + schéma JSON        ◀── PHASE 1
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
   Moteur de domaine pur        Migrations additives      ◀── PHASES 2, 3
   (packages/core/practice)     (7 tables + 2 extensions)
            │                           │
            └─────────────┬─────────────┘
                          ▼
        ProgressEngine ÉTENDU + MasteryModel ÉTENDU        ◀── PHASE 4
        ★ LE POINT DE CONVERGENCE — invariants 2 et 3 ★
                          │
                          ▼
                    API Practice                           ◀── PHASE 5
                          │
                          ▼
                   Practice Hub                            ◀── PHASE 6
                          │
                          ▼
                  Exercise Player                          ◀── PHASE 7
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
    Sessions + bilan                 Carnet                ◀── PHASES 8, 9
            │                           │
            └─────────────┬─────────────┘
                          ▼
      Convergence de l'évaluation PROUVÉE par test         ◀── PHASE 10
                          │
                          ▼
       15 exercices de référence (nombres-rationnels)      ◀── PHASE 11
                          │
                          ▼
              Validation qualité + nettoyage               ◀── PHASE 12
                          │
                          ▼
                Génération de masse                        ◀── PHASE 13
```

**Chemin critique** : 1 → 2 → 4 → 5 → 7 → 10 → 11.
La phase 3 peut être menée en parallèle de la 2. Les phases 6 et 9 sont hors
du chemin critique.

**Le nœud à ne pas manquer** est la phase 4 : c'est le seul endroit du plan où
l'on touche à du code qui sert 133 leçons en production.

---

## 32. Acceptance Criteria

### Invariants de la cible — vérification exécutable

| # | Invariant | Comment il est vérifié |
|---|---|---|
| 1 | Les questions de module n'évaluent pas | `validate-lessons.mjs:275-285` (existe) + `PracticeEvidenceTypeTest` refusant `'discovery'` |
| 2 | Test final et Practice alimentent la **même** évaluation | `test_final_test_and_practice_converge_on_one_learning_point_row` |
| 3 | Pas de maîtrise Practice séparée | `assertDatabaseCount('student_learning_point_progress', 1)` ; grep : aucune seconde table/modèle de maîtrise |
| 4 | La preuve historique n'est jamais remplacée | `learning_evidence` n'est jamais `UPDATE`/`DELETE` ; deux preuves après deux sources |
| 5 | Contenu piloté par la donnée | zéro contenu d'exercice dans `features/practice/` ; garde par script |
| 6 | Chaque question évaluative a un mapping LP | `validate-exercises.mjs` |
| 7 | Chaque réponse libre a un `answerFormat` | `validate-exercises.mjs` |
| 8 | Le format ne révèle pas la réponse | détection de fuite dans le validateur |
| 9 | Les distracteurs portent des misconceptions | avertissement du validateur ; ids réutilisables |
| 10 | Les indices ne révèlent pas la solution | détection de fuite dans le validateur |
| 11 | La difficulté est mathématique | relecture humaine + variation des LP visés par niveau |
| 12 | ≥ 15 exercices par leçon activée | `validate-exercises.mjs --strict` |
| 13 | Ajouter un exercice ne touche pas au code | ajouter un JSON, relancer la garde — **aucun** diff `.jsx` |
| 14 | Les notes sont persistantes et historiques | `NotebookFlowTest` + persistance inter-appareils |
| 15 | L'état est explicable depuis la preuve | `test_mastery_can_be_recomputed_from_evidence` |

### Critères propres à ce dépôt

- `npm run check:lessons` **et** `npm run validate:exercises` verts
- `php artisan test` vert, **les 11 cas de `LearningEvidenceFlowTest` non
  modifiés**
- `npm test` vert (`packages/core`, `apps/web`, `scripts`)
- `npm run build` réussit
- 0 erreur console sur tout le parcours Practice
- 0 défilement horizontal à 375 px
- La saisie MathLive utilisable sur un vrai téléphone, clavier ouvert
- Aucun `import` depuis `lessons/` dans `features/practice/`
- La documentation périmée (`ARCHITECTURE.md` §3/§5,
  `MOBILE_READINESS_REPORT.md`, `EXERCISE_CONTRACT.md`) corrigée

---

## 33. Open Decisions

Cinq décisions restent réellement ouvertes après cet audit. Toutes les autres
sont tranchées ci-dessus.

---

### D-1 · Où la correction algébrique s'exécute-t-elle ? · **la plus structurante**

**Pourquoi c'est important** — Compute Engine est une bibliothèque
JavaScript. Il n'a pas d'équivalent PHP. Le §39 de la cible exige que le
serveur ne fasse pas confiance au client. Les deux ne peuvent pas être vrais
en même temps sans un choix d'infrastructure.

**Options**

| | Approche | Pour | Contre |
|---|---|---|---|
| **A** | Correction serveur, **sans algèbre libre** au départ : QCM, numérique à tolérance, fractions exactes (ce que `AnswerChecker` fait déjà) | Aucune infrastructure nouvelle ; sécurité pleine ; le patron existe et tourne en production | Pas de réponse algébrique libre en phase 1 |
| **B** | Correction serveur avec un microservice Node pour l'algèbre | Sécurité pleine **et** algèbre libre | Un service à déployer, surveiller, sécuriser — sur un hébergement mutualisé (`.env.hostinger`), c'est un vrai coût |
| **C** | Correction client, comme le test final aujourd'hui | Aucune infrastructure ; cohérent avec l'asymétrie déjà documentée | Réponses attendues exposées ; preuves falsifiables ; contredit frontalement le §39 |
| **D** | Portage d'un comparateur algébrique minimal en PHP | Sécurité pleine, sans service | Écrire un CAS est un projet en soi ; risque d'erreur mathématique élevé |

**Recommandée : A, avec B comme extension ultérieure.**
Commencer par les types de réponse évaluables en PHP simple couvre
l'essentiel du collège et une bonne part du lycée, ne demande aucune
infrastructure, et **la leçon de référence a été choisie pour rester dans ce
périmètre** — l'arithmétique rationnelle se compare exactement, en entiers.
L'algèbre libre (Seconde/Première) attend une décision d'infrastructure prise
séparément, avec des exercices réels sous les yeux.

**Impact si reporté** — bloque tout exercice de réponse libre algébrique,
donc une partie du lycée. Ne bloque **pas** la phase 1 ni la leçon de
référence. C'est précisément pourquoi ce choix de leçon compte.

---

### D-2 · JSON ou module JS pour le contenu ?

**Pourquoi c'est important** — 1 980 fichiers à terme. Se tromper coûte une
migration de masse.

**Options** — (A) JSON pur ; (B) module JS exportant un objet ; (C) hybride,
JSON pour les données et un module pour les composants de laboratoire du §21.

**Recommandée : A**, avec un mécanisme de référence pour les rares
laboratoires interactifs (`"lab": {"component": "RationalBar", "props": {…}}`,
résolu par un registre côté frontend).
Cinq raisons en §14.3, dont deux décisives : un script Node valide du JSON
sans transpiler, et **Laravel doit pouvoir lire le contenu** si la correction
passe serveur (D-1).

**Impact si reporté** — bloque la phase 1, donc tout le reste.

---

### D-3 · Table `hint_events` ou colonne `hints_used` ?

**Pourquoi c'est important** — l'horodatage des demandes d'indice est une
donnée qu'on ne peut pas reconstituer après coup.

**Options** — (A) table dédiée ; (B) colonne seule ; (C) colonne maintenant,
table plus tard.

**Recommandée : A.** Une table peu lue ne coûte rien ; l'option C perd
définitivement l'historique de la période intermédiaire. Le §12 de la cible
demande explicitement que « hint usage must be recorded as historical
events ».

**Impact si reporté** — faible. Rattrapable, au prix des données perdues
entre-temps.

---

### D-4 · Practice exige-t-il un compte ?

**Pourquoi c'est important** — les visiteurs anonymes ont aujourd'hui une
persistance locale complète **sauf** la preuve de LP.

**Options** — (A) compte requis ; (B) anonyme autorisé, sans preuve ;
(C) anonyme avec preuve locale, repliée à la connexion.

**Recommandée : A.** C'est déjà la règle pour la preuve de LP ; l'option C
créerait un second régime de preuve, en tension directe avec l'invariant 2 ;
et la recommandation adaptative n'a aucun sens sans état d'élève.

L'option B mérite d'être reconsidérée **plus tard** comme outil d'acquisition
(essayer avant de créer un compte) — mais alors comme une démonstration
explicitement sans trace, pas comme une pratique dégradée.

**Impact si reporté** — moyen. Décider en phase 5 ou 6 suffit.

---

### D-5 · Le test final adopte-t-il rétroactivement le rôle primaire/secondaire ?

**Pourquoi c'est important** — 284 questions de test final mappent déjà
plusieurs LP à poids égal. Practice introduira le rôle. Faut-il aligner
l'existant ?

**Options** — (A) laisser le test final en `primary` partout (le défaut de la
colonne) ; (B) auditer et annoter les 284 ; (C) annoter au fil de l'eau,
lorsqu'une leçon est retouchée.

**Recommandée : A maintenant, C ensuite.** Le défaut préserve exactement le
comportement actuel — aucun risque. L'audit de 2de montre que le vrai
problème n'est pas le rôle mais la **densité** de preuve (10 questions pour
jusqu'à 14 LP) — et c'est Practice qui le résout, pas une annotation.

**Impact si reporté** — faible. Le défaut de colonne rend le choix
réversible à tout moment.

---

## RECOMMENDED NEXT STEP

> **Phase 1 — figer le contrat d'exercice et sa garde de validation.**

Concrètement, et rien de plus :

1. Trancher **D-2** (JSON, recommandé) et écrire
   `content/practice/_schema/exercise.schema.json`, en référençant les codes
   de LP canoniques du catalogue existant.
2. Écrire `scripts/validate-exercises.mjs` et le brancher dans
   `npm run check:lessons`.
3. Écrire **2 fixtures valides et 6 invalides** (LP d'une autre leçon, deux
   choix corrects, 4 indices, un indice contenant la réponse, un
   `answerFormat` révélateur, un id dupliqué) et prouver que la garde les
   distingue.
4. Amorcer `content/practice/misconceptions.json` avec les misconceptions déjà
   nommées et validées dans le diagnostic 6e.
5. Réécrire `docs/architecture/EXERCISE_CONTRACT.md`, qui décrit aujourd'hui
   un hook sans consommateur.

**Pourquoi c'est le premier pas le plus sûr et le plus propre :**

- **Aucun code de production n'est touché.** Zéro risque pour les 133 leçons,
  les 193 preuves, les 131 rollups.
- **C'est la seule couche dont tout le reste dépend** (§31) — le moteur de
  domaine, les migrations, l'API et le lecteur consomment tous le contrat.
- **C'est réversible** tant qu'aucun exercice n'est écrit. Une fois 1 980
  fichiers produits, ce n'est plus vrai.
- **Cela suit la culture éprouvée du dépôt** : ici, un contrat n'est pas un
  document, c'est un script qui échoue. `validate-lessons.mjs`,
  `check-routes.mjs`, `check-non-blocking.mjs`, `audit-knowledge-dependencies.mjs`
  — chacun a été écrit **avant** que la classe de défaut correspondante ne se
  répande. Practice mérite le même traitement, et il ne l'aura jamais à
  meilleur compte qu'aujourd'hui : il y a zéro exercice à corriger.
- **Cela ne préempte pas D-1**, la seule décision réellement lourde. Le schéma
  décrit ce qu'*est* une réponse attendue, pas *où* elle est comparée.

**Ne pas commencer par** : les migrations (sans contrat, les colonnes sont
des devinettes), le Practice Hub (il n'y a rien à montrer), ni la refonte de
`mathComparison` (sa signature cible sort du contrat).
