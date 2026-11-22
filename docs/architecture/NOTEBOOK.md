# Le cahier de l'élève (📓 كرّاسي)

Le cahier est **la représentation de l'élève** de ce qu'il veut garder : ses
mots, ses erreurs, ses explications. Il n'est ni une seconde carte des
connaissances, ni une copie de la leçon.

| Surface | Rôle | Écrit par |
|---|---|---|
| 🧠 Carte des connaissances (`lessons/common/knowledge`) | le savoir de la plateforme, cumulé au fil des modules | la leçon (`knowledge.jsx`) — **lecture seule** pour l'élève |
| ⭐ À retenir (`KnowledgeSnapshot`) | présentation de la carte en fin de module | la leçon |
| 📈 Maîtrise (`LearningPointMastery`, `/practice/overview`) | l'état démontré de l'apprentissage | le moteur d'exercices |
| 📓 Cahier (`features/practice/notebook`) | les notes personnelles, rattachées à l'endroit où elles ont été prises | **l'élève** |

**Le cahier appartient à l'élève. Une seule lecture tierce existe, et elle
est bornée.** (Règle changée le 2026-09-24 ; jusque-là personne d'autre que
l'élève ne lisait le cahier.)

| Qui | Lit le cahier ? |
|---|---|
| L'élève | oui — le sien, en lecture ET écriture |
| **L'enseignant d'un قسم dont l'élève est membre ACTIF** | **oui, en LECTURE SEULE**, et seulement les notes NON ARCHIVÉES rattachées aux leçons *effectives* de ce قسم |
| La fiche élève de l'administration (`StudentDossier`) | non |
| Le dossier de progression d'un élève (`ClassroomProgressService`) et l'aperçu « لمحة » | non — « où en est-il ? » et « qu'a-t-il noté ? » restent deux écrans |
| La preuve d'un point pour un élève (`…/learning-points/{code}/explanation`) | **oui** : ses 10 notes les plus récentes sur CE point (mêmes règles), montrées comme l'écrit de l'élève, jamais comptées |
| Les signaux de classe, la carte, les interventions | non — une note n'est jamais un détecteur ni un agrégat de classe |
| Un autre élève, un autre enseignant | non (404) |

Pourquoi ce changement : les erreurs qu'un élève NOTE lui-même — « je
confonds toujours le signe » — disent ce qu'aucun pourcentage de réussite ne
dit. C'est la matière d'une remédiation.

Ce qui borne la lecture, et qui est verrouillé par
`TeacherClassroomNotebookTest` :

- **Lecture seule.** Aucune route d'écriture n'existe sous
  `…/students/{id}/notebook`. Modifier, archiver, réviser ou supprimer
  passent tous par `ownedBy()`, qui exige d'être le propriétaire.
- **Périmètre = le قسم.** Seules les notes dont la `lesson_id` est dans
  `ClassroomProgressService::effectiveLessonIds()`. Une note prise dans une
  leçon d'un autre niveau, dans une leçon que l'enseignant a lui-même
  masquée, ou **hors de toute leçon**, reste privée — y compris dans les
  compteurs.
- **Trois verrous** : `can:teacher`, puis `ClassroomPolicy@view` (la classe
  est à cet enseignant), puis `ClassroomAccess::activeStudent` — l'élève est
  membre ACTIF d'une classe ACTIVE (depuis le 2026-09-25 ; avant, une
  adhésion quittée suffisait, contrairement à ce que ce document promettait).
- **Les notes archivées restent privées** : l'élève les a rangées. Elles
  sortent de la liste, du compteur (`archived` vaut toujours 0 pour un
  lecteur) et de la lecture d'une note seule (404).
- **Trace** : la lecture du cahier d'un élève écrit `teacher.notebook_read`
  dans `admin_activity_logs` (une ligne par enseignant, élève et jour).
- **L'élève est prévenu** : le texte qu'il accepte en rejoignant un قسم dit
  que son enseignant lit ce qu'il note dans les leçons de la classe, hors
  notes archivées (`TEACHER_CLASSROOM_ARCHITECTURE.md` §2 « Consent »).
- **La porte de l'élève reste fermée.** `/practice/notes` ne sert que le
  compte authentifié : un enseignant y reçoit 404 pour la note d'un élève
  (`TeacherLearningAccessTest`).

Quitter ou être retiré d'une classe ne touche pas une note — mais retire
l'élève du périmètre de lecture de cet enseignant.

Le serveur : `NotebookService::searchForReader` / `countsForReader` /
`findForReader` (le même moteur que `search`, pas un second) ·
`Teacher\TeacherClassroomNotebookController` ·
`GET /teacher/classrooms/{id}/students/{studentId}/notebook[/{noteId}]`.
Le client : `pages/teacher/StudentNotebookPage.jsx` (paginé, 50 notes par
page), atteint depuis le dossier de l'élève et depuis la preuve d'un point. La forme d'une note est rendue par
`NotebookPresenter::note` — **une seule** sérialisation pour les deux
surfaces.

**L'enseignant a SON cahier.** Les mêmes pages (`NotebookSpace`, `NoteDetail`,
`ReviewSession`) et la même fenêtre flottante servent l'enseignant sous
`/enseignant/cahier[/revision|/:noteId]` ; les liens se construisent depuis
`useWorkspaceBase()` (`notebookPaths(base)` dans `noteMeta.js`), jamais en dur.
Le serveur ne sert que les notes du compte authentifié : un enseignant ne
voit ni la note d'un élève ni celle d'un autre enseignant (404). Une note
d'exercice ouverte depuis le cahier de l'enseignant renvoie à la leçon, la
pratique étant une surface d'élève (`TEACHER_CLASSROOM_ARCHITECTURE.md` §8b).

Rien ne passe de la carte au cahier tout seul : « أضف إلى كرّاسي »
(`AddToNotebookButton`) dépose le titre et le résumé d'une connaissance comme
*point de départ*, que l'élève réécrit. La carte n'est jamais modifiée depuis
le cahier ; le cahier ne touche ni à la maîtrise ni à la progression. Une
**intervention** de l'enseignant (« تدخّل ») n'écrit jamais dans le cahier de
l'élève : c'est une donnée de l'enseignant (`classroom_interventions`).

## Accès et quota (« الوصول والحدود », depuis le 2026-09-25)

Le cahier est une fonctionnalité réglable par palier (`notebook`, voir
[`ACCESS_AND_LIMITS.md`](./ACCESS_AND_LIMITS.md)). **Une « copie du cahier »
(`notebook_copy`) = une NOUVELLE note** (`POST /practice/notes`), d'où
qu'elle vienne ; modifier, réviser, archiver, imprimer ne comptent pas, et
supprimer ne rembourse pas. `NotebookService::create` consomme l'unité dans
la même transaction que la note (verrou de la ligne `users`) ; `update` et
`review` exigent l'accès. Lire, archiver et supprimer restent permis quand
le cahier est fermé au palier. La lecture enseignant (`…ForReader`) ne
dépend pas du palier de l'élève. Côté client : compteur dans la fenêtre
(note neuve, limite finie) et dans « Mon cahier », panneau explicatif sur
un refus — le texte reste dans la fenêtre et le brouillon local.

**La مذكرة الدرس de l'enseignant (depuis le 2026-09-29).** La page
`/enseignant/cours/:lessonId/memoire` montre, sous « كرّاسي », les notes du
compte sur CETTE leçon (`GET /practice/notes?lessonCode=…`) et en crée de
nouvelles avec le contexte `lessonCode` seul
(`features/teacher/lessonMemo/MemoNotes.jsx`). Ce n'est pas un second
cahier : même table, même API, mêmes règles de propriété et de quota
(`notebook_copy` = une note neuve) ; ces notes réapparaissent dans
« كرّاسي » (/enseignant/cahier) et inversement. Enregistrement automatique
(POST au premier arrêt de frappe, PATCH ensuite), brouillon local
`smarter_memo_draft_<leçon>` tant que la note n'est pas née. Une note riche
(HTML de l'éditeur) s'y lit en texte et se modifie dans « كرّاسي ».

## Trois surfaces, une table

| | Répond à | Où |
|---|---|---|
| Cahier **flottant** (`NotebookWindow`) | « j'apprends, je note ça maintenant » | dans la leçon et l'exercice |
| **Mon cahier** (`/espace/cahier`, `notebook/space/`) | « j'ai écrit beaucoup : retrouver, ranger, imprimer, réviser » | espace élève |
| Ma progression (`/espace/progression`) | « où en suis-je ? » | espace élève — ne liste plus les notes, y renvoie |

`Mon cahier` lit les mêmes `notebook_notes` avec recherche, filtres, tri et
pagination **côté serveur** (`NotebookService::search`) ; les vues (toutes,
à revoir, erreurs, questions, importantes, archivées) sont des filtres. Les
colonnes ajoutées pour l'espace : `title`, `note_type`, `is_pinned`,
`archived_at`, la file de révision (`next_review_at`, `last_reviewed_at`,
`review_count` — l'intervalle double, prêt pour une répétition espacée) et
`content_text`, le texte nu qui sert la recherche (chercher « span » ne
trouve rien). La hiérarchie classe → domaine → leçon vient des facettes du
serveur + du catalogue, jamais d'une seconde structure.

## Une seule fenêtre

```
App
└── NotebookProvider            ← LA fenêtre (NotebookWindow), au-dessus du routeur
    └── Router
        ├── leçon (buildLessonRoutes → LazyLessonKnowledgeProvider)
        │   ├── <Module />
        │   └── <LessonNotebookAnchor config module />   publie la POSITION + déclencheur « 📓 كرّاسي »
        ├── pratique (PracticeSession → NotebookButton)  même pastille « 📓 كرّاسي », contexte exercice/question
        └── Mon cahier (NotebookSpace / NoteDetail)       retrouve, rouvre, révise
```

**Chargement (2026-09-25).** `NotebookProvider` est dans le lot d'entrée
(au-dessus du routeur) ; `NotebookWindow` n'y est plus : elle est chargée
paresseusement (`lazy()` + `<Suspense>`), car elle embarque l'éditeur et
KaTeX. Dès qu'une page publie sa position (`setLocation` non nul — leçon,
محور, pratique), `preloadNotebookWindow()` la demande au prochain moment
d'inactivité : la pastille « 📓 كرّاسي » s'ouvre sans attente là où elle
existe. Voir [`BUNDLE_BOUNDARIES.md`](./BUNDLE_BOUNDARIES.md).

`NotebookProvider` porte deux états **indépendants** :

- `location` — où l'élève est (publiée par la coquille de la leçon, retirée
  au démontage). C'est ce que le prochain « ouvrir » capturera.
- `session` — le contexte **capturé au moment de l'ouverture**, la note
  rouverte s'il y en a une, le contenu de départ. La session ne suit pas la
  navigation : une note commencée dans le module A reste du module A si
  l'élève passe au module B. Il ferme et rouvre pour écrire « ici ».

### Un seul déclencheur, une seule ouverture

Le déclencheur est **la même pastille** en leçon et en exercice : « 📓 كرّاسي »,
classe `.sa-nb-lesson-trigger` (`notebook.css`), bascule ouvrir/fermer
(`aria-pressed`), fixée au bord **physique gauche** à `bottom: 5.5rem`.

| Espace | Composant | `data-nb-trigger` | Contexte capturé |
| --- | --- | --- | --- |
| leçon / محور | `LessonNotebookAnchor` | `lesson` | la position publiée (leçon, module, point) |
| exercice | `NotebookButton` (porté dans `<body>`) | `practice` | exercice, question, réponse, verdict |

En exercice, `NotebookButton` est remonté (`key`) à chaque question **et au
verdict** : après validation, la pastille commence une nouvelle note
pré-remplie de la réponse et du verdict ; après un « حفظ », elle rouvre CETTE
note (jamais de doublon). Sous `lg`, la barre collante « السؤال التالي » occupe
l'étage au-dessus de la barre d'onglets : la pastille d'exercice monte à
`8.5rem`. Sur ordinateur, le pied de question réserve sa fin (`lg:pe-36`) à la
pastille.

**Le cahier s'ouvre toujours en grand (`data-size="large"`), centré dans
l'écran** (`inset: 0; margin: auto`), dans les deux espaces. L'élève peut le
réduire en « petit » (il reste centré) et le déplacer par l'en-tête ; ni la
taille ni la position ne sont gardées d'une ouverture à l'autre. Sous 640px,
une seule taille, quasi plein écran.

La fenêtre est un **compagnon non modal** : pas de voile, pas de gel du
défilement, pas de piège à Tab. La leçon reste utilisable, on change de module
avec le cahier ouvert. Échap ferme depuis l'intérieur seulement.

Ouvrir ne crée **rien** en base. La note naît au premier « حفظ » (POST) ;
les suivants modifient la même note (PATCH). Le brouillon local
(`useNoteDraft`, localStorage) est un filet, pas une source de vérité ; sa clé
est l'endroit complet (leçon/module/point/exercice/question) et il porte
l'id de la note dès qu'elle existe, pour qu'une restauration ne crée jamais
de doublon.

## Le contexte (`noteContext.js`)

```
{ lessonCode, moduleNumber, learningPointCode, exerciseId, questionId }   ← la donnée, envoyée au serveur
{ lessonTitle, moduleTitle, moduleSlug, learningPointTitle, …Path }        ← affichage, résolus côté client / API
```

Priorité du plus précis au plus large : question → exercice → point → module
→ leçon ; **le plus précis n'efface jamais le plus large**. Rien n'est
inventé : un module qui enseigne plusieurs points n'en désigne aucun ; la
page d'accueil de la leçon n'a pas de module.

Le serveur (`NotebookService::resolveContext`) refuse (422) tout contexte
incohérent : point hors de sa leçon, module inconnu de la leçon, exercice
d'une autre leçon, question absente de l'exercice. **Modifier une note ne
change jamais son contexte** — `update()` n'accepte que le contenu, le type
d'erreur et l'état « traitée ».

Colonnes : `lesson_id`, `learning_point_id`, `module_number` (numéro, pas FK :
même règle que `exercise_id`/`question_id`, chaînes de contenu versionné),
`exercise_id`, `question_id`. L'état d'interface (position à l'écran, taille)
n'y entre jamais.

## Contenu

`content` : texte brut (notes antérieures) ou HTML restreint (éditeur).
`isRichContent()` distingue les deux ; `sanitizeHtml()` (liste blanche) passe
à l'enregistrement **et** au rendu ; KaTeX dessine les `$…$` après. Voir
`noteContent.js`.

## Vérifications

- `apps/web/src/features/practice/notebook/*.test.js` — logique pure.
- `apps/api/tests/Feature/NotebookFlowTest.php` — propriété, contexte, refus.
- `apps/web/e2e/notebook.mjs` — l'exercice : pastille, ouverture en grand et centrée, huit tailles d'écran, pied de question non recouvert, glisser.
- `apps/web/e2e/notebook-lesson.mjs` — la leçon : contexte, navigation, brique, retour, sécurité.
- `apps/web/e2e/notebook-space.mjs` — Mon cahier : compteurs, vues, recherche, filtres, carte, page, groupé, impression, révision, mobile.

## « قاعدتي » — the rule the student writes becomes a card (PILOT, 2026-11-07)

Council of 2026-11-07 + owner's choices. In the pilot lesson only (`studentView: 'mission'`) and for a real STUDENT account,
when the student writes a rule in their own words in « أتوقّع القاعدة » (`kit/PredictRule.jsx › PredictPanel`) and reveals the
official rule, a NORMAL note is created through `POST /practice/notes` (`predictRule.ruleNoteOf`):
`title` « قاعدتي: <rule title> », `content` « كتبتُ: <their words> » then « القاعدة: <official rule> », `lessonCode`, `noteType: 'note'`.
- It is an ordinary note, so the class teacher can READ it (read-only, the 2026-09-24 rule); the panel says so before the
  student writes: « ستُحفظ قاعدتك في كرّاسي — يراها أستاذك. » (`predict.toNotebook`).
- It is never learning evidence and feeds no mastery. A failed request (offline) never blocks the lesson.
- Not yet extended to other lessons (pilot rule: extended only after the owner validates the prototype).


### Not the notebook: the lesson's saved answers (PILOT, 2026-11-07)

The answers a student gives inside the pilot lesson (choices, numbers, problem progress, written answers) are restored when the
student comes back. They are NOT notes: they live in their own table `student_lesson_answers`, behind `GET/PUT
/lessons/{code}/answers` (student only, `learner` routes), and no adult view reads them. Only the rule written in « أتوقّع القاعدة »
reaches « كرّاسي », as described above. Details: `docs/lessons/LESSON_DEVELOPMENT_GUIDE.md` §4septies « The student's answers come back ».
