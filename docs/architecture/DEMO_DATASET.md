# Le jeu de données de démonstration (`DemoDataSeeder`)

> **Document autoritaire** pour les données de démonstration / recette : ce
> qu'elles contiennent, comment on les régénère, et les garanties qu'elles
> offrent. La source de vérité reste le code : `apps/api/database/seeders/DemoDataSeeder.php`
> et `apps/api/database/seeders/Demo/`.

## Ce que c'est

Un peuplement qui donne à la plateforme l'aspect d'**environ trois mois
d'enseignement déjà écoulés** : des élèves à des points différents de l'unité
1, des erreurs concentrées sur certaines notions, un cahier rempli, des
classes avec des leçons masquées, et une administration qui a activé des
offres à la main.

Ce n'est pas un générateur de lignes aléatoires. Chaque compte porte un
**portrait** (`DemoPersona`) — ancienneté, fréquence, réussite, persévérance,
points faibles, appétit de notes — et ce portrait est **déroulé jour par
jour** sur le contenu réel.

## Les trois garanties

| Garantie | Comment elle est tenue |
|---|---|
| **Reconnaissable** | Tous les comptes sont en `@smarter-academy-dz.test` — un TLD réservé (RFC 6761) qui ne peut appartenir à personne. Le périmètre du jeu de données est défini par l'email, jamais par un intervalle d'id. |
| **Idempotent** | Relancer purge d'abord les comptes de démonstration **et tout ce qui en dépend**, puis reconstruit. Le générateur est ensemencé par la clé du persona : deux exécutions produisent le même élève. |
| **Jamais en production** | `run()` refuse de s'exécuter si `APP_ENV=production`, sauf `--force` explicite. Les données réelles ne sont jamais touchées : la purge ne sélectionne que le domaine de test. |

## Ce qui est simulé — et ce qui ne l'est jamais

Le simulateur **n'écrit que ce que l'application écrirait** :

- une séance de pratique (`practice_sessions`) porte ses compteurs
  (`exercises_completed`, `questions_answered`, `correct_count`) ;
- une tentative de question (`question_attempts`) naît à l'ouverture puis
  reçoit sa réponse, avec `attempt_number` croissant sur les reprises ;
- un indice demandé laisse un `hint_events` daté, comme en production ;
- chaque réponse produit une preuve (`learning_evidence`) reliée à ses points
  de savoir avec leur rôle (`primary` / `secondary`).

**La maîtrise n'est jamais décrétée.** Chaque preuve passe par
`App\Domain\Progress\ProgressEngine::recordEvidence` — la porte de
production, avec le moteur de la version courante (Mastery V2), jamais
recopiée ni approximée ; datée dans le passé (`submittedAt`), elle laisse
aussi l'HISTOIRE de l'état (`learning_point_state_transitions`, lignes
`live` datées de la preuve). C'est la propriété
structurante de ce jeu de données : un élève qui échoue trois fois sur un
point ne peut pas en ressortir « maîtrisé », parce que l'arithmétique du
modèle l'interdit. Les statuts `mastered` / `reinforce` / `gap` qu'affiche la
plateforme sont donc ceux que ces preuves-là produisent réellement.

De la même façon, **les classes, adhésions, abonnements et visibilités
passent par les services du domaine** (`ClassroomService`,
`ClassroomMembershipService`, `ClassroomLessonService`,
`SubscriptionActivationService`) et non par des insertions directes : les
limites de sièges, la capacité de l'enseignant et le journal d'activité
restent donc vrais. Un élève refusé faute de siège est un **fait de la
démonstration**, affiché en avertissement, pas un bug contourné.

## Le contenu utilisé

Aucun contenu n'est inventé. `DemoContent` lit :

- les leçons, modules et points de savoir **depuis la base** (unité 1 de 4AM
  telle qu'importée) ;
- les exercices, leurs questions, leurs points de savoir et leurs
  **erreurs-types depuis `content/practice/`**, par le même
  `ExerciseRepository` qu'utilise le moteur de pratique en production, filtrés
  sur ce que la base déclare publié.

Les notes du cahier (كرّاسي) sont **en arabe** — le cahier est l'écriture
privée de l'élève, et cet élève écrit dans la langue de son cours — et chaque
note d'erreur est accrochée à une vraie erreur-type
(`content/practice/misconceptions.json`) et au couple exercice/question qui
l'a provoquée. Une note s'ouvre donc sur la question qui l'a fait naître.

## La population

| Rôle | Nombre | Mot de passe |
|---|---|---|
| Administrateur | 1 (`admin@smarter-academy-dz.test`) | `TestPassword123!` |
| Enseignants | 3 (`teacher01..03@`) | `TestTeacher123!` |
| Élèves | 18 (`student01..18@`) | `TestStudent123!` |

Les proportions suivent une vraie classe : quelques éléments moteurs, une
majorité au milieu, une part en difficulté ou irrégulière, deux arrivées
récentes.

### Scénarios de test

| Scénario | Compte | Ce qu'il sert à vérifier |
|---|---|---|
| Élève moteur | `student01` | Progression large, réussite haute, maîtrise acquise |
| Élève moyen | `student04`–`student10` | Le cas ordinaire |
| Lent mais tenace | `student11` | Beaucoup de tentatives, beaucoup de notes, progression réelle |
| En difficulté | `student12` | Réussite basse, points faibles déclarés, leçons inachevées |
| Erreurs en nombre | `student13` | Cahier fourni, erreurs-types récurrentes |
| Irrégulier | `student14` | Deux interruptions longues dans l'historique |
| Inactif | `student15` | Dernière activité ancienne ; abonnement expiré |
| De retour | `student16` | Longue absence puis activité récente |
| Nouveau | `student17`, `student18` | Compte récent, très peu d'historique |

### Enseignants et offres

- `teacher01` — offre à sièges activée par l'administration (paiement hors
  plateforme), deux classes de 4AM, dont la classe mixte qui sert à juger la
  lecture enseignant ;
- `teacher02` — même modèle, plus petit, une classe de soutien ;
- `teacher03` — resté sur l'offre **gratuite** (5 sièges) : c'est le compte
  qui montre la limite commerciale à l'œuvre.

La visibilité des leçons diffère d'une classe à l'autre : chaque classe est
arrivée à un point différent de l'unité, et les leçons suivantes sont
masquées. Aucune classe n'a tout masqué.

Les adhésions passent par le service avec le consentement (`consented:
true`) : aucun élève de démonstration n'a de confirmation en attente.

### Interventions (groupe A de `teacher01`)

Après la simulation, `DemoDataSeeder::interventions()` rejoue la boucle
DÉTECTER → INTERVENIR → MESURER sur la preuve simulée, par le service de
production :

1. une **proposition d'exercices** datée d'il y a 9 jours, sur le point où
   des élèves étaient ALORS en ثغرة et ont progressé depuis — « ما حدث بعده »
   montre un changement réel ;
2. un **renforcement en classe** daté d'il y a 3 jours, sur la difficulté
   partagée que « تستحقّ نظرة » signale aujourd'hui (peu ou pas de preuve
   nouvelle : la mesure le dit) ;
3. une **observation** privée sur un élève sans activité récente.

Une intervention datée dans le passé a sa photographie de départ relue dans
l'histoire des états à cette date — ce que l'enseignant aurait vu ce jour-là.
L'élève visé par la proposition la voit dans «قسمي». QA navigateur :
`apps/web/e2e/teacher-intelligence.mjs`.

## Défis quotidiens — « التحدّي اليومي » (2026-09-25)

`Demo/DemoDailyChallenges.php` joue les **14 derniers jours** de défis (hors
aujourd'hui, laissé ouvert pour la QA) **par le service de production**
(`DailyChallengeService` : chronométrage serveur, évaluation, preuve par
`ProgressEngine`, datée du jour joué), selon le portrait : un élève inactif
ne joue pas, un irrégulier manque des jours (série cassée, pénalité bornée),
un moteur joue presque tous les jours. Réponses justes / fausses LUES dans le
contenu. Les quatre classes portent les quatre configurations :

| Classe | Réglage | Sert à vérifier |
|---|---|---|
| A (`teacher01`) | compétition ON, Top 3 ON, participation visible | podium, rang, « ↑ n » |
| B (`teacher01`) | compétition ON, Top 3 OFF | l'enseignant voit le classement, les élèves leur seul rang |
| C (`teacher02`) | compétition OFF | aucun classement pour personne |
| D (`teacher03`) | défi désactivé | `student05`, `student12` (D est leur classe principale) ont un défi PERSONNEL |

QA navigateur : `apps/web/e2e/daily-challenge.mjs` (joue le défi du jour de
`student01` — relancer le seeder pour recommencer ; un jour de repos est
ouvert le temps de la QA puis restauré).

## Régénérer

```bash
cd apps/api
php artisan db:seed --class=DemoDataSeeder
```

Prérequis : le curriculum doit être importé (sinon le seeder s'arrête avec un
message explicite — une base sans leçon 4AM publiée ne peut porter aucune
progression). La commande est sûre à relancer autant de fois qu'on veut.

## Ce que ce jeu de données ne fait pas

- Il **ne complète jamais tout le curriculum** : « aujourd'hui est un jour
  ordinaire au milieu du parcours ». La dernière leçon touchée par chaque
  élève reste en cours.
- Il ne crée **ni XP ni badges**. La **série** du défi quotidien, elle, existe
  (voir « Défis quotidiens » ci-dessus) ; hors du défi, ces notions n'existent
  pas dans le modèle actuel (voir `PROGRESS_MODEL.md`). Ce qui en tient lieu —
  activité récente, régularité — se lit dans les dates réelles des séances.
- Il ne touche **ni les grades, ni les chapitres, ni les leçons, ni les
  exercices** : le contenu est une donnée d'entrée, jamais une sortie.
- Ses `created_at` ne sont pas antidatés (ceux des preuves et des
  progressions) : les écrans et signaux de l'enseignant lisent `submitted_at`
  / `occurred_at`, jamais `created_at`.
