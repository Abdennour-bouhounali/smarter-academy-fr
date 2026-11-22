# Composants partagés des leçons — `lessons/common/components/`

> **Statut (2026-09-29).** Ce document décrit `MathText` (vivant, 360+ appels)
> et fait l'inventaire du dossier. `MathInput` a été **supprimé** le 2026-09-29
> avec le reste du code mort de l'ère française (voir §0). Le seul consommateur
> de la dépendance `mathlive` est le grapheur du مختبر
> (`features/mathlab/tools/functionGrapher/ExpressionField.jsx`, chargé
> paresseusement, configuré dans `mathliveSetup.js`). Aucune leçon arabe ne
> saisit d'expression algébrique libre — les réponses sont des choix, des
> rationnels, des ensembles, des intervalles ou des points, tous exactement
> comparables.

## 0. Inventaire

**Ce qui reste** (fichiers présents dans ce dossier) : `AdaptiveFeedback.jsx`,
`CoordPlane.jsx` (+ `coordPlane.test.js`), `FeedbackBox.jsx`, `InfoSorter.jsx`,
`LearningPointMastery.jsx`, `LessonAccessGate.jsx`, `LessonIndex.jsx`,
`LessonLearningPointsStatus.jsx`, `LessonUI.jsx`, `masteryLabels.js`
(+ test), `MathText.jsx`, `ModuleLayout.jsx`, `moduleZeroProgress.test.js`,
`NumberLine.jsx`, `PremiumLessonLocked.jsx`.

- **`ChoiceGrid`** (dans `LessonUI.jsx`) accepte un prop optionnel `order` :
  l'ordre d'**affichage** des options (indices). `selected`, `correctIndex` et
  `onSelect` restent dans l'espace d'indices de l'**auteur** — c'est ce qui
  permet au test final de mélanger l'affichage (`optionOrder`,
  `kit/testPresentation.js`) sans toucher à la preuve ni à la clé de réponse.
- **`InfoSorter`** est en arabe : ses libellés viennent de l'espace i18n
  `lesson` (clés `infoSorter.*`, `locales/ar/lesson.json`).

**Supprimés le 2026-09-29** — code mort de l'ère française, **aucun
importateur** : `AffineExplorer`, `AnswerBuilder`, `BarModel`, `CalcChain`,
`ConceptCard`, `CourseHero`, `EqualShareBoard`, `ExampleBox`,
`ExerciseValidator`, `GroupBuilder`, `GuidedSolution`, `KeyTakeaway`,
`MathInput`, `MeasureFillMission`, `OrderingGame`, `QuizQuestion`, `RealLine`
(+ `realLineLayout.js`), `SectionHeader`, `SolidTurner`, `TutorGuide`,
`ValueTable` (+ `valueTableUtils.js`), `ViewsPanel` ; et les hooks
`useAdaptiveExercise`, `useSimpleExercise` (`lessons/common/hooks/`). Un
document qui les cite décrit du code qui n'existe plus (historique git).
Une nouvelle manipulation passe par le registre
(`lessons/common/manipulations/`, `MANIPULATION_CONTRACT.md`) ; un composant
partagé s'étend derrière un prop optionnel, il ne se copie pas.

## 1. Affichage de mathématiques — `MathText`

Le composant `<MathText>` sert **uniquement** à l'affichage (rendu KaTeX), et
c'est le **point de passage unique** de la notation mathématique.

```jsx
import MathText from 'path/to/common/components/MathText';

// En ligne :
<p>على العموم <MathText>{'$a = b \\times q + r$'}</MathText>.</p>

// En bloc centré :
<MathText>{'$$\\mathrm{PGCD}(420\\ ;\\ 28) = 28$$'}</MathText>
```

Ce qu'il fait, et pourquoi il faut passer par lui : il découpe la chaîne sur
`$…$` et `$$…$$` et enveloppe **chaque expression** dans un conteneur
`dir="ltr"` portant `.sa-math-inline` (un `<span>`) ou `.sa-math-block` (un
`<div>` — `BlockMath` rend un div, invalide dans un span). Le CSS global
(`index.css`) y ajoute `direction: ltr; unicode-bidi: isolate` : la notation se
lit de gauche à droite et sort du flux bidi arabe qui l'entoure. Sans les deux,
une expression dans une phrase arabe s'affiche à l'envers.

Il n'est **pas** responsable du gras (`**`), de l'italique (`*`) ni de la mise
en page : utilisez `<strong>`, `<em>`, `<p>`. Un enfant non-chaîne est refusé
(rend `null` et avertit en développement).

> **Les couples numériques aussi.** `{score} / {max}` s'inverse en RTL :
> 10/11 se lit « 11 / 10 ». Tout score, compteur ou rapport a besoin du même
> `dir="ltr"`. Voir `docs/architecture/ARABIC_RTL_CONTRACT.md` §4.

## 2. Saisie

`MathInput` (enveloppe MathLive) a été supprimé le 2026-09-29 : il n'avait
aucun importateur. Pour une saisie de nombre, de fraction ou d'ensemble,
utilisez ce que le kit et la couche manuel fournissent déjà :
`NumericQuestion` (`kit/questions.jsx`), `FractionQuestion`,
`IntegerSetQuestion` (`lessons/common/textbook/`) — voir
`docs/architecture/EXERCISE_CONTRACT.md` §0.

## 3. Comparaison

L'évaluation vivante est `practice.evaluateAnswer`
(`packages/core/practice/answerEvaluator.js`) : arithmétique rationnelle
**exacte** (pas d'epsilon), six issues plutôt qu'un booléen, chiffres
arabo-indiens acceptés à l'entrée. `compareMathExpressions`
(`packages/core/mathComparison.js`) existe mais n'est utilisé par aucune page.
