# Exercise Engine — implémentation de référence

> Livrée le 2026-09-10. **Activée pour une seule leçon : 2nde « Fonction affine ».**
>
> Cible : [`EXERCISE_ENGINE_ARCHITECTURE.md`](./EXERCISE_ENGINE_ARCHITECTURE.md).
> Audit préalable : [`EXERCISE_ENGINE_INTEGRATION_AUDIT.md`](./EXERCISE_ENGINE_INTEGRATION_AUDIT.md).

---

## 1. Ce qui a été construit

Un moteur d'exercices générique, piloté par la donnée, et son premier jeu de
contenu. Le parcours complet fonctionne, joué au navigateur avec un vrai
compte élève :

```text
leçon → « Commencer à pratiquer » → Hub → niveau → séance
  → exercice → question → indice → réponse → retour diagnostique
  → carnet → tentative persistée → preuve d'apprentissage
  → MÊME évaluation canonique que le test final → bilan
```

**Rien d'autre n'est activé.** Les 131 autres leçons sont inchangées : le
bouton ne s'affiche pas, aucun de leurs fichiers n'est modifié, et le serveur
refuse en 422 toute séance ouverte sur elles.

### La découverte qui a façonné le chantier

Le système d'évaluation des Learning Points **existait déjà**, canonique et en
production (1 067 points, 193 preuves, 131 agrégats de maîtrise). Il n'avait
qu'un producteur : le test final. Ce chantier n'a donc pas construit une
évaluation — il a **ajouté une seconde source de preuve** à celle qui existait,
et bâti autour d'elle la couche de contenu, de session et d'interface qui
manquait.

---

## 2. Ce qui a été réutilisé, tel quel

| Élément | Où |
|---|---|
| Points d'apprentissage canoniques | `learning_points`, dérivés de `coursesData.js` |
| Modèle de preuve historique | `learning_evidence` + pivot N-N |
| Agrégat de maîtrise | `student_learning_point_progress` |
| Validation des relations, idempotence | `ProgressEngine::resolveLesson()`, `attempt_id` unique |
| Seuils de maîtrise (0,70 / 0,40) | `MasteryModel` — inchangés |
| Identité, Sanctum, `scopedStorage` | inchangés |
| Plan cartésien | `CoordPlane` (907 l., 132 fichiers) — **aucune nouvelle bibliothèque** |
| Laboratoires | `TankLab`, `RateProbes` de la leçon elle-même |
| Modèle mathématique | `affineUtils.js` — les réponses attendues en sont dérivées |
| Codes des 11 points | `components/learningPoints.js` — importés, jamais retapés |
| Patron de registre | `components/diagnostic/QuestionRenderer.jsx` |
| Primitives d'interface | `Feedback`, `ValidateButton`, `MathText`… |

---

## 3. Ce qui a été étendu

**`ProgressEngine`** — quatre changements chirurgicaux, signature inchangée :
la liste des sources autorisées accueille `practice_exercise` (⚠️ pas
`practice`, qui désigne les questions d'entraînement d'une leçon et **doit**
rester refusé : `LearningEvidenceFlowTest:142` l'exige) ; `assessment_type`
cesse d'être écrit en dur ; les points acceptent une forme avec rôle ; et
`updateProgress()` reçoit un contexte, en écartant les issues inertes.

**`MasteryModel`** — quatre paramètres à valeur par défaut, tous reproduisant
l'arithmétique d'avant. La difficulté 1..4 est enfin alimentée, par le niveau
1..5 de la pratique.

**`learning_evidence`** — cinq colonnes nullables ; le pivot gagne `role`
(défaut `primary`).

---

## 4. Base de données

| Table | Rôle |
|---|---|
| `practice_sessions` | une séance : élève, leçon, niveau, compteurs |
| `exercise_attempts` | le passage sur un exercice |
| `question_attempts` | une tentative — créée à l'**ouverture** de la question |
| `hint_events` | chaque demande d'indice, horodatée |
| `notebook_notes` | le carnet |
| `learning_evidence` | **étendue**, pas dupliquée |
| pivot | **étendu** d'un `role` |

Pas de `misconception_events` : la colonne sur `question_attempts` porte la
même information avec son contexte. Pas de tables de contenu : les exercices
sont des fichiers versionnés, donc `exercise_id` est une chaîne, pas une clé
étrangère.

Vérifié sur une **copie de la production** avant d'y toucher : 193 / 131 / 230
lignes identiques après migration, aller-retour `migrate`/`rollback` propre.

---

## 5. API

Douze routes, toutes sous `auth:sanctum`. Les 17 routes préexistantes sont
**byte-identiques** (comparaison de `route:list` avant/après).

```text
GET    /lessons/{lessonCode}/practice/overview
POST   /lessons/{lessonCode}/practice/sessions
GET    /practice/sessions/{sessionId}
POST   /practice/sessions/{sessionId}/questions
POST   /practice/sessions/{sessionId}/answers
POST   /practice/sessions/{sessionId}/exercise-completions
POST   /practice/sessions/{sessionId}/complete
POST   /practice/question-attempts/{attemptUuid}/hints
GET|POST|PATCH|DELETE /practice/notes[/{id}]
```

Conventions du dépôt respectées : pas de `FormRequest`, pas de `Resource`, pas
de `Policy`. Validation en ligne, messages en français, `DomainException` →
422, identité toujours issue du jeton, 404 (jamais 403) sur la ressource
d'autrui.

---

## 6. Frontend

```text
apps/web/src/pages/student/practice/   PracticeHub · PracticeSession · PracticeSummary
apps/web/src/features/practice/        QuestionRenderer (registre) · inputs/ ·
                                       HintPanel · FeedbackPanel · RichText ·
                                       LevelSelector · NotebookButton · PracticeLab ·
                                       practiceCapability · practiceContent
apps/web/src/services/practiceService.js
```

Trois routes paramétrées dans `/espace`, **pas une par leçon**. Un seul bloc
ajouté à `LessonIndex.jsx`, qui sert les 132 leçons.

Trois composants nouveaux, chacun pour une raison précise :

- **`AnswerField`** — `NumberField` n'accepte pas `disabled` et déclare
  `inputMode="numeric"`, qui masque le signe moins et la barre de fraction sur
  mobile. `NumberField` reste intact : 132 leçons en dépendent.
- **`RichText`** — `MathText` se limite volontairement à KaTeX (« pour le
  gras, utilisez `<strong>` »). Bon contrat pour du JSX, impossible pour de la
  donnée : un JSON ne contient pas de balise.
- **`AffineInput`** — deux champs plutôt qu'un éditeur d'expression, ce qui
  rend possible le retour « ton coefficient directeur est bon ».

**MathLive n'est pas utilisé.** Aucun exercice n'en a besoin ; `MathInput.jsx`
avait zéro importateur et demanderait une réécriture.

---

## 7. Contenu

```text
content/practice/
  _schema/exercise.schema.json      le contrat
  misconceptions.json               16 erreurs de raisonnement nommées
  active.json                       la liste des leçons activées
  index.generated.json              généré par le validateur
  seconde/fonction-affine-2nde/level-{1..5}/   15 exercices
```

À la racine du dépôt, pas sous `apps/web/src` : c'est de la donnée versionnée,
lue par Vite, par Laravel (`base_path('../../…')`, la poignée de main
qu'inaugure `config/curriculum.php`) et par le script de validation.

Couverture pondérée par le jugement d'audit de la leçon, qui marque **P6 et P9
`PARTIALLY_COVERED`** : P6 est primaire 5 fois, P9 4 fois. Les onze points sont
primaires quelque part. Huit contextes distincts ; la difficulté ne vient
jamais de la taille des nombres.

---

## 8. Évaluation

Côté client, par `packages/core/practice/` — **même frontière de confiance que
le test final**, documentée dans `LEARNING_ARCHITECTURE.md`. Cinq formes de
réponse (`choice`, `multiChoice`, `rational`, `affine`, `interval`, `point`),
toutes comparées en **arithmétique rationnelle exacte** : `Math.abs(a-b) < ε`
est banni du chemin de comparaison, si bien que 0,1 + 0,2 vaut 0,3 et que 7,5
égale 15/2.

Six issues, pas un booléen : `correct`, `equivalent_correct`,
`partially_correct`, `incorrect`, `syntax_error`, `abandoned`. `syntax_error`
ne bouge pas la maîtrise — ne pas savoir écrire un nombre n'est pas se tromper
de nombre.

Le serveur possède : la propriété de la séance, les points crédités (lus dans
le **contenu**, jamais dans la requête), l'idempotence, et l'arithmétique de
la maîtrise.

---

## 9. Tests

| Suite | Résultat |
|---|---|
| `packages/core` | **201** (dont 43 nouveaux : rationnels, évaluateur, contrat de contenu) |
| `apps/web` | **4638** |
| `scripts` | **43** |
| `php artisan test` | **165** (13 nouveaux) |
| `npm run check:lessons` | vert, `validate:exercises --strict` compris |
| `npm run build` | vert, 15 morceaux chargés à la demande |

Le test décisif — `PracticeEvidenceConvergenceTest` — affirme qu'après une
preuve de test final **et** une preuve de pratique sur le même point, il
existe **exactement une** ligne d'agrégat, dont `attempts` vaut 2, et que le
rejeu de l'historique reproduit la valeur enregistrée.

**`LearningEvidenceFlowTest` passe sans qu'une ligne du fichier ne change** :
c'était le critère d'acceptation de l'extension de `ProgressEngine`.

---

## 10. Limites connues

1. **La correction est côté client.** `expectedAnswer` arrive dans le
   navigateur ; un élève déterminé peut gonfler son propre profil. C'est le
   statu quo des 133 leçons, assumé (décision prise pour cette phase). Le
   passage au serveur ne toucherait **aucun fichier d'exercice** : il faudrait
   un évaluateur PHP sur le même JSON et une projection publique/privée.
2. **Pas d'algèbre libre.** Les réponses sont des couples, des rationnels ou
   des intervalles — tous exactement comparables sans moteur de calcul formel.
   `2(x+3)` est **refusé** comme hors contrat plutôt qu'analysé de travers.
3. **`requiredForm`** (factorisée / développée) n'est pas implémenté : sans
   objet pour une fonction affine.
4. **La recommandation est minimale** : le niveau conseillé est le plus haut
   niveau ouvert non terminé. L'interface `RecommendationService` existe pour
   la suite.
5. **Le carnet s'écrit, il ne se relit pas encore** : le modèle et l'API sont
   là, avec leurs index, mais aucun écran « Mes erreurs ».
6. **Le sélecteur d'exercices est séquentiel** dans un niveau ; il n'exploite
   pas encore l'état des points ni les erreurs répétées.
7. **Défaut préexistant, non corrigé** : les 10 épreuves du test final de
   cette leçon ne déclarent **jamais** `correct`, s'appuyant sur le défaut à 0
   de `BossFinal.jsx:66`. Hors périmètre ; le schéma des exercices rend cette
   classe de bug impossible côté pratique.
8. **`CurriculumImporter.php` n'est pas conforme à Pint** — antérieur à ce
   chantier (vérifié au commit `65ae8e1`), laissé tel quel.

---

## 11. Activer une seconde leçon

1. Ajouter son code à `content/practice/active.json`.
2. Écrire ≥ 3 exercices par niveau sous
   `content/practice/<grade>/<lessonCode>/level-{1..5}/`, en dérivant les
   réponses attendues du modèle mathématique de la leçon.
3. `npm run validate:exercises` (régénère l'index), puis `--strict`.
4. `php artisan cache:clear` puis `php artisan smarter:practice-doctor`.

**Aucun code React à écrire** — sauf si la leçon a besoin d'une forme de
réponse inédite : dans ce cas, un widget, une ligne dans `QuestionRenderer`,
un évaluateur dans `answerEvaluator.js`. Rien d'autre ne teste le type.

### Piège de déploiement

Le serveur résout `base_path('../../content/practice')`. Là où l'API est
déployée seule, **`content/` doit être synchronisé à côté**, ou
`PRACTICE_CONTENT_PATH` défini. Et le contenu est mis en cache : après une
livraison, `php artisan cache:clear`. Un index mis en cache avant les fichiers
donne un Hub **vide et silencieux** — c'est arrivé pendant ce chantier, d'où
`smarter:practice-doctor`.

---

## 12. Étape suivante recommandée

**Faire tester la leçon de référence à de vrais élèves avant toute mise à
l'échelle.** Le moteur est prouvé techniquement ; ce qui ne l'est pas encore,
c'est la qualité pédagogique des quinze exercices, la lisibilité des retours,
et le rythme d'une séance. Ce sont des réponses que seul l'usage donne, et
elles peuvent modifier le contrat — mieux vaut qu'elles arrivent à 15
exercices qu'à 1 980.

Ensuite seulement, dans l'ordre : l'écran « Mes erreurs » (les données
l'attendent déjà), la sélection adaptative, puis la génération de contenu à
grande échelle.
