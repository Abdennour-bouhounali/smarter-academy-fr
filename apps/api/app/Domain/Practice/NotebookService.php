<?php

namespace App\Domain\Practice;

use App\Domain\Access\Features\FeatureAccessService;
use App\Domain\Access\Features\FeatureRegistry;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\NotebookNote;
use App\Models\User;
use DomainException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Le carnet : les notes et les erreurs que l'élève marque en apprenant.
 * Enregistrements historiques, pas un état d'interface (cible §20).
 *
 * Toute lecture est filtrée par user_id, et une note d'autrui est
 * « introuvable » plutôt qu'« interdite » : on ne révèle pas son existence.
 *
 * ── Le contexte d'une note ────────────────────────────────────────────────
 * Une note se prend depuis un endroit précis de la leçon — sa page d'accueil,
 * un module, un point d'apprentissage, une question d'exercice — et cet
 * endroit est FIGÉ à la création : modifier une note ne change jamais son
 * contexte, et l'élève qui la rouvre depuis un autre module la retrouve là
 * où il l'a écrite.
 *
 * Le client envoie des CODES (leçon, point, module, exercice, question) ; le
 * serveur ne les croit pas sur parole. Chaque élément doit exister ET
 * appartenir à celui qui le contient : un point à sa leçon, un module à sa
 * leçon, un exercice à sa leçon, une question à son exercice. Un contexte
 * incohérent est refusé (422) plutôt qu'enregistré à moitié — une note
 * rattachée au mauvais endroit vaut moins qu'une note refusée.
 *
 * ── « Mon cahier » ────────────────────────────────────────────────────────
 * L'espace dédié lit les MÊMES lignes, avec recherche, filtres, tri et
 * pagination côté serveur (`search`). Les vues (toutes, à revoir, erreurs,
 * questions, importantes, archivées) sont des filtres, pas des tables.
 *
 * ── Accès et quota (« الوصول والحدود ») ─────────────────────────────────
 * ÉCRIRE — créer, modifier, réviser une note — exige la fonctionnalité
 * `notebook` pour le palier du compte ; CRÉER une note consomme une unité
 * `notebook_copy`, atomiquement avec la création (FeatureAccessService).
 * Lire, archiver et supprimer restent permis : un cahier fermé ne confisque
 * pas ce que l'élève y a écrit. La lecture de l'enseignant (…ForReader)
 * n'est jamais soumise au palier de l'élève.
 */
class NotebookService
{
    public const VIEWS = ['all', 'review', 'errors', 'questions', 'pinned', 'archived'];

    public const SORTS = ['newest', 'oldest', 'review', 'updated'];

    public function __construct(private ExerciseRepository $exercises, private FeatureAccessService $access) {}

    public function listFor(User $user, ?string $lessonCode = null)
    {
        return NotebookNote::query()
            ->where('user_id', $user->id)
            ->whereNull('archived_at')
            ->when($lessonCode, fn ($q) => $q->whereHas('lesson', fn ($l) => $l->where('code', $lessonCode)))
            ->with(['lesson:id,code,title', 'learningPoint:id,code,title'])
            // Les notes à revoir remontent : le carnet sert d'abord à traiter
            // ce qui reste en suspens. À état égal, la plus récente d'abord.
            ->orderByRaw('completed_at IS NOT NULL')
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Le cahier : une page de notes, filtrée, triée, cherchée.
     *
     * @param array{q?:string, view?:string, lessonCode?:string, learningPointCode?:string, chapterCode?:string,
     *   gradeCode?:string, origin?:string, type?:string, sort?:string, page?:int, perPage?:int} $params
     * @return array{notes: Collection, total: int, page: int, perPage: int, hasMore: bool}
     */
    public function search(User $user, array $params, ?array $lessonIds = null): array
    {
        $view = $params['view'] ?? 'all';
        $view = in_array($view, self::VIEWS, true) ? $view : 'all';
        $sort = $params['sort'] ?? 'newest';
        $sort = in_array($sort, self::SORTS, true) ? $sort : 'newest';
        $page = max(1, (int) ($params['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($params['perPage'] ?? 20)));

        $query = $this->scope($user, $view, $lessonIds);
        $this->applyFilters($query, $params);
        $this->applySearch($query, $params['q'] ?? null);

        $total = (clone $query)->count();

        match ($sort) {
            'oldest' => $query->orderBy('created_at'),
            'updated' => $query->orderByDesc('updated_at'),
            // La file : ce qui est dû d'abord, le reste par date de création.
            'review' => $query->orderByRaw('next_review_at IS NULL')->orderBy('next_review_at')->orderByDesc('created_at'),
            default => $query->orderByDesc('created_at'),
        };
        // Les importantes en tête, quelle que soit la vue — c'est leur raison d'être.
        if ($view !== 'pinned') {
            $query->orderByDesc('is_pinned');
        }

        // Départage à la seconde près : deux notes créées ensemble suivent le
        // SENS du tri, sinon « les plus anciennes » montrerait la plus récente
        // des deux en premier.
        $notes = $query
            ->with(['lesson:id,code,title', 'learningPoint:id,code,title'])
            ->orderBy('id', $sort === 'oldest' ? 'asc' : 'desc')
            ->forPage($page, $perPage)
            ->get();

        return [
            'notes' => $notes,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
            'hasMore' => $page * $perPage < $total,
        ];
    }

    /**
     * LE CAHIER D'UN ÉLÈVE, LU PAR SON ENSEIGNANT — en LECTURE SEULE.
     *
     * ── Ce que cette méthode n'est pas ───────────────────────────────────
     * Ce n'est pas un second cahier, ni une seconde recherche : c'est
     * `search()`, avec les mêmes vues, les mêmes filtres, le même tri et la
     * même pagination, sur les notes d'un AUTRE compte. Une seule table, un
     * seul moteur — le cahier de l'élève et ce que l'enseignant en lit ne
     * peuvent pas diverger.
     *
     * ── Le périmètre ────────────────────────────────────────────────────
     * Les notes rendues sont bornées aux leçons EFFECTIVES de la classe
     * (`$lessonIds`, voir ClassroomProgressService::effectiveLessonIds) :
     * l'enseignant lit ce que son قسم travaille, pas tout ce que l'élève
     * écrit ailleurs — une note prise dans une leçon d'un autre niveau, ou
     * dans une leçon qu'il a lui-même masquée, ne le regarde pas. Les notes
     * SANS leçon (prises hors contexte) restent privées pour la même
     * raison : rien ne les rattache au قسم.
     *
     * ── Ce qui n'est PAS ouvert ─────────────────────────────────────────
     * Les notes ARCHIVÉES : l'élève les a rangées, elles sortent de la
     * lecture de l'enseignant (liste, compteur et note seule).
     *
     * L'écriture. Aucune méthode de modification n'accepte un lecteur tiers :
     * `update`, `review`, `bulk` et `delete` passent tous par `ownedBy()`,
     * qui compare `user_id` au compte authentifié. L'enseignant lit ; il
     * n'annote pas, ne classe pas, n'archive pas, ne supprime pas.
     *
     * L'AUTORISATION n'est pas ici : c'est au contrôleur de prouver que
     * l'élève appartient à une classe de cet enseignant (ClassroomPolicy +
     * TeacherClassroomStudentController::memberOf). Ce service reçoit un
     * élève déjà légitimé.
     *
     * @param  User  $student  l'élève dont on lit le cahier
     * @param  int[]  $lessonIds  les leçons effectives de la classe
     * @param  array{q?:string, view?:string, lessonCode?:string, learningPointCode?:string,
     *   origin?:string, type?:string, sort?:string, page?:int, perPage?:int} $params
     * @return array{notes: Collection, total: int, page: int, perPage: int, hasMore: bool}
     */
    public function searchForReader(User $student, array $lessonIds, array $params): array
    {
        // Une note ARCHIVÉE est rangée par l'élève : elle sort de ce que son
        // enseignant lit. Même réponse qu'un cahier vide, rien n'est révélé.
        if ($lessonIds === [] || ($params['view'] ?? null) === 'archived') {
            return ['notes' => collect(), 'total' => 0, 'page' => 1, 'perPage' => 20, 'hasMore' => false];
        }

        return $this->search($student, $params, $lessonIds);
    }

    /**
     * Les compteurs du cahier d'un élève, dans le périmètre de la classe.
     *
     * @param  int[]  $lessonIds
     * @return array<string, int>
     */
    public function countsForReader(User $student, array $lessonIds): array
    {
        if ($lessonIds === []) {
            return array_fill_keys(self::VIEWS, 0);
        }

        // Les archives restent privées : leur compteur aussi.
        return ['archived' => 0] + $this->counts($student, $lessonIds);
    }

    /**
     * Les compteurs de l'en-tête, en UNE requête : toutes (hors archives), à
     * revoir, erreurs, questions, importantes, archivées.
     *
     * @return array<string, int>
     */
    public function counts(User $user, ?array $lessonIds = null): array
    {
        $query = NotebookNote::query()->where('user_id', $user->id);

        // Le même périmètre que `scope()` : un compteur qui dénombrerait des
        // notes que le lecteur ne peut pas ouvrir les RÉVÉLERAIT quand même.
        if ($lessonIds !== null) {
            $query->whereIn('lesson_id', $lessonIds);
        }

        $row = $query
            ->selectRaw('SUM(archived_at IS NULL) AS all_count')
            ->selectRaw('SUM(archived_at IS NULL AND next_review_at IS NOT NULL) AS review_count')
            ->selectRaw("SUM(archived_at IS NULL AND (note_type = 'erreur' OR mistake_type IS NOT NULL)) AS errors_count")
            ->selectRaw("SUM(archived_at IS NULL AND note_type = 'question') AS questions_count")
            ->selectRaw('SUM(archived_at IS NULL AND is_pinned = 1) AS pinned_count')
            ->selectRaw('SUM(archived_at IS NOT NULL) AS archived_count')
            ->first();

        return [
            'all' => (int) ($row->all_count ?? 0),
            'review' => (int) ($row->review_count ?? 0),
            'errors' => (int) ($row->errors_count ?? 0),
            'questions' => (int) ($row->questions_count ?? 0),
            'pinned' => (int) ($row->pinned_count ?? 0),
            'archived' => (int) ($row->archived_count ?? 0),
        ];
    }

    /**
     * Les leçons du cahier et le nombre de notes de chacune (hors archives) :
     * c'est de là que le client bâtit l'arbre classe → domaine → leçon, en
     * s'appuyant sur le catalogue — jamais sur une seconde hiérarchie.
     *
     * @return array<int, array{lessonCode: ?string, lessonTitle: ?string, count: int}>
     */
    public function lessonFacets(User $user): array
    {
        return NotebookNote::query()
            ->where('notebook_notes.user_id', $user->id)
            ->whereNull('notebook_notes.archived_at')
            ->leftJoin('lessons', 'lessons.id', '=', 'notebook_notes.lesson_id')
            ->groupBy('notebook_notes.lesson_id', 'lessons.code', 'lessons.title')
            ->orderByDesc('count')
            ->get([
                'lessons.code AS lesson_code',
                'lessons.title AS lesson_title',
                \DB::raw('COUNT(*) AS count'),
            ])
            ->map(fn ($r) => ['lessonCode' => $r->lesson_code, 'lessonTitle' => $r->lesson_title, 'count' => (int) $r->count])
            ->all();
    }

    public function find(User $user, int $id): NotebookNote
    {
        return $this->ownedBy($user, $id)->load(['lesson:id,code,title', 'learningPoint:id,code,title']);
    }

    /**
     * UNE note d'un élève, lue par son enseignant — lecture seule.
     *
     * La note doit appartenir à cet élève ET tomber dans le périmètre de la
     * classe, sinon elle est « introuvable » : la même réponse que pour la
     * note d'un inconnu (404, jamais 403), pour ne rien révéler de ce qui
     * existe ailleurs dans le cahier. C'est la règle d'`ownedBy()`, appliquée
     * à un lecteur tiers.
     *
     * @param  int[]  $lessonIds  les leçons effectives de la classe
     *
     * @throws DomainException
     */
    public function findForReader(User $student, int $id, array $lessonIds): NotebookNote
    {
        $note = NotebookNote::find($id);
        if ($note === null || $note->user_id !== $student->id || ! in_array($note->lesson_id, $lessonIds, true)
            || $note->archived_at !== null) {
            throw new DomainException('Note introuvable.');
        }

        return $note->load(['lesson:id,code,title', 'learningPoint:id,code,title']);
    }

    public function create(User $user, array $data): NotebookNote
    {
        $content = trim((string) ($data['content'] ?? ''));
        if ($content === '') {
            throw new DomainException('Une note ne peut pas être vide.');
        }

        $context = $this->resolveContext($data);
        $type = $this->type($data['noteType'] ?? null, $data['mistakeType'] ?? null);

        return $this->access->consume($user, FeatureRegistry::NOTEBOOK, fn () => NotebookNote::create([
            'user_id' => $user->id,
            'title' => $this->title($data['title'] ?? null),
            'content' => $content,
            'content_text' => NotebookNote::plainText($content),
            'mistake_type' => $data['mistakeType'] ?? null,
            'note_type' => $type,
            'is_pinned' => (bool) ($data['pinned'] ?? false),
            // Toute note naît « à revoir » : le cahier sert d'abord à
            // retravailler ce qu'on vient d'écrire. L'élève l'en retire.
            'next_review_at' => array_key_exists('review', $data) && ! $data['review'] ? null : now(),
        ] + $context));
    }

    public function update(User $user, int $id, array $data): NotebookNote
    {
        $note = $this->ownedBy($user, $id);
        $this->access->ensure($user, FeatureRegistry::NOTEBOOK);
        $payload = [];
        if (array_key_exists('content', $data)) {
            $content = trim((string) $data['content']);
            if ($content === '') {
                throw new DomainException('Une note ne peut pas être vide.');
            }
            $payload['content'] = $content;
            $payload['content_text'] = NotebookNote::plainText($content);
        }
        if (array_key_exists('title', $data)) {
            $payload['title'] = $this->title($data['title']);
        }
        if (array_key_exists('mistakeType', $data)) {
            $payload['mistake_type'] = $data['mistakeType'];
        }
        if (array_key_exists('noteType', $data)) {
            $payload['note_type'] = $this->type($data['noteType'], null);
        }
        if (array_key_exists('pinned', $data)) {
            $payload['is_pinned'] = (bool) $data['pinned'];
        }
        if (array_key_exists('archived', $data)) {
            $payload['archived_at'] = $data['archived'] ? now() : null;
        }
        // « À revoir » se pose et se retire : une date dans la file, ou rien.
        if (array_key_exists('review', $data)) {
            $payload['next_review_at'] = $data['review'] ? now() : null;
            if ($data['review']) {
                $payload['completed_at'] = null;
            }
        }
        // « Traitée » (héritage) : traiter, c'est sortir de la file ; remettre
        // à revoir, c'est y rentrer. On stocke la date du geste.
        if (array_key_exists('completed', $data)) {
            $payload['completed_at'] = $data['completed'] ? now() : null;
            $payload['next_review_at'] = $data['completed'] ? null : now();
        }
        // Volontairement ABSENT : lesson_id, learning_point_id, module_number,
        // exercise_id, question_id. Le contexte appartient à la création.
        $note->update($payload);

        return $note->fresh(['lesson:id,code,title', 'learningPoint:id,code,title']);
    }

    /**
     * Une révision active : l'élève s'est rappelé sa note, puis l'a relue.
     *  - `known` : il la sait → elle sort de la file, marquée traitée ;
     *  - `again` : pas encore → elle revient, à un intervalle qui double
     *    (1, 2, 4, 8… jours, plafonné à 30). Assez pour espacer, pas un
     *    algorithme — celui-ci viendra sur ces mêmes colonnes.
     */
    public function review(User $user, int $id, string $outcome): NotebookNote
    {
        $note = $this->ownedBy($user, $id);
        $this->access->ensure($user, FeatureRegistry::NOTEBOOK);
        if (! in_array($outcome, ['known', 'again'], true)) {
            throw new DomainException('Issue de révision inconnue.');
        }
        $count = (int) $note->review_count + 1;
        $note->update([
            'review_count' => $count,
            'last_reviewed_at' => now(),
            'completed_at' => $outcome === 'known' ? now() : null,
            'next_review_at' => $outcome === 'known' ? null : now()->addDays(min(30, 2 ** ($count - 1))),
        ]);

        return $note->fresh(['lesson:id,code,title', 'learningPoint:id,code,title']);
    }

    /**
     * Une action sur plusieurs notes À MOI : les identifiants d'autrui sont
     * simplement ignorés (introuvables), jamais touchés.
     *
     * @param  int[]  $ids
     * @return int le nombre de notes réellement touchées
     */
    public function bulk(User $user, array $ids, string $action): int
    {
        $query = NotebookNote::query()->where('user_id', $user->id)->whereIn('id', $ids);

        return match ($action) {
            'archive' => $query->update(['archived_at' => now()]),
            'unarchive' => $query->update(['archived_at' => null]),
            'review' => $query->update(['next_review_at' => now(), 'completed_at' => null]),
            'delete' => $query->delete(),
            default => throw new DomainException('Action inconnue.'),
        };
    }

    public function delete(User $user, int $id): void
    {
        $this->ownedBy($user, $id)->delete();
    }

    /**
     * Les modules des leçons concernées, indexés « lesson_id:number » — pour
     * que la sérialisation nomme le module d'une note sans une requête par
     * note. Le carnet d'un élève se compte en dizaines de notes.
     *
     * @param  iterable<NotebookNote>  $notes
     * @return array<string, LessonModule>
     */
    public function modulesFor(iterable $notes): array
    {
        $lessonIds = [];
        foreach ($notes as $note) {
            if ($note->lesson_id !== null && $note->module_number !== null) {
                $lessonIds[$note->lesson_id] = true;
            }
        }
        if ($lessonIds === []) {
            return [];
        }

        return LessonModule::query()
            ->whereIn('lesson_id', array_keys($lessonIds))
            ->get(['lesson_id', 'number', 'slug', 'title'])
            ->keyBy(fn ($m) => "{$m->lesson_id}:{$m->number}")
            ->all();
    }

    /* ── Requêtes du cahier ─────────────────────────────────────────────── */

    private function scope(User $user, string $view, ?array $lessonIds = null): Builder
    {
        $q = NotebookNote::query()->where('notebook_notes.user_id', $user->id);

        // Le périmètre d'un LECTEUR tiers (l'enseignant) : les leçons de sa
        // classe, et elles seules. `null` = le propriétaire, qui voit tout
        // son cahier. Une liste VIDE ne descend jamais jusqu'ici (les
        // appelants la court-circuitent), donc `whereIn` ne reçoit jamais
        // un ensemble vide qui ne filtrerait rien.
        if ($lessonIds !== null) {
            $q->whereIn('notebook_notes.lesson_id', $lessonIds);
        }

        return match ($view) {
            'archived' => $q->whereNotNull('archived_at'),
            'review' => $q->whereNull('archived_at')->whereNotNull('next_review_at'),
            'errors' => $q->whereNull('archived_at')->where(fn ($w) => $w->where('note_type', 'erreur')->orWhereNotNull('mistake_type')),
            'questions' => $q->whereNull('archived_at')->where('note_type', 'question'),
            'pinned' => $q->whereNull('archived_at')->where('is_pinned', true),
            default => $q->whereNull('archived_at'),
        };
    }

    private function applyFilters(Builder $q, array $p): void
    {
        if (! empty($p['lessonCode'])) {
            $q->whereHas('lesson', fn ($l) => $l->where('code', $p['lessonCode']));
        }
        if (! empty($p['learningPointCode'])) {
            $q->whereHas('learningPoint', fn ($l) => $l->where('code', $p['learningPointCode']));
        }
        // Domaine et classe : par les relations de la leçon, pas par une copie.
        if (! empty($p['chapterCode'])) {
            $q->whereHas('lesson.chapter', fn ($c) => $c->where('code', $p['chapterCode']));
        }
        if (! empty($p['gradeCode'])) {
            $q->whereHas('lesson.chapter.grade', fn ($g) => $g->where('code', $p['gradeCode']));
        }
        if (($p['origin'] ?? null) === 'exercise') {
            $q->whereNotNull('exercise_id');
        } elseif (($p['origin'] ?? null) === 'lesson') {
            $q->whereNull('exercise_id');
        }
        if (! empty($p['type']) && in_array($p['type'], NotebookNote::TYPES, true)) {
            $q->where('note_type', $p['type']);
        }
    }

    private function applySearch(Builder $q, ?string $term): void
    {
        $term = trim((string) $term);
        if ($term === '') {
            return;
        }
        // Un motif LIKE, jamais une expression régulière : `%` et `_` du
        // texte de l'élève sont des caractères, pas des jokers.
        $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $term).'%';
        $q->where(function ($w) use ($like) {
            $w->where('content_text', 'like', $like)
                ->orWhere('title', 'like', $like)
                ->orWhereHas('lesson', fn ($l) => $l->where('title', 'like', $like))
                ->orWhereHas('learningPoint', fn ($l) => $l->where('title', 'like', $like))
                ->orWhere('exercise_id', 'like', $like);
        });
    }

    /* ── Contexte, propriété ──────────────────────────────────────────── */

    private function ownedBy(User $user, int $id): NotebookNote
    {
        $note = NotebookNote::find($id);
        if ($note === null || $note->user_id !== $user->id) {
            throw new DomainException('Note introuvable.');
        }

        return $note;
    }

    private function type(?string $type, ?string $mistakeType): string
    {
        if ($type !== null && in_array($type, NotebookNote::TYPES, true)) {
            return $type;
        }

        // Sans type déclaré : une note d'exercice qui porte un type d'erreur
        // EST une erreur ; tout le reste est une note.
        return $mistakeType !== null ? 'erreur' : 'note';
    }

    private function title(mixed $value): ?string
    {
        $t = trim((string) ($value ?? ''));

        return $t === '' ? null : mb_substr($t, 0, 160);
    }

    /**
     * Codes → identifiants, en vérifiant que chaque élément appartient bien à
     * celui qui l'englobe. Renvoie les colonnes de contexte de la note.
     *
     * @return array{lesson_id: ?int, learning_point_id: ?int, module_number: ?int, exercise_id: ?string, question_id: ?string}
     */
    private function resolveContext(array $data): array
    {
        $lessonCode = $this->code($data['lessonCode'] ?? null);
        $lpCode = $this->code($data['learningPointCode'] ?? null);
        $exerciseId = $this->code($data['exerciseId'] ?? null);
        $questionId = $this->code($data['questionId'] ?? null);
        $moduleNumber = isset($data['moduleNumber']) && $data['moduleNumber'] !== '' ? (int) $data['moduleNumber'] : null;

        $lesson = $lessonCode ? Lesson::where('code', $lessonCode)->first() : null;
        if ($lessonCode && $lesson === null) {
            throw new DomainException('Leçon inconnue.');
        }

        $learningPoint = $lpCode ? LearningPoint::where('code', $lpCode)->first() : null;
        if ($lpCode && $learningPoint === null) {
            throw new DomainException('Point d’apprentissage inconnu.');
        }
        if ($learningPoint !== null) {
            if ($lesson !== null && $learningPoint->lesson_id !== $lesson->id) {
                throw new DomainException('Ce point d’apprentissage n’appartient pas à cette leçon.');
            }
            // Un point sans leçon déclarée : sa leçon est la sienne, pas une
            // invention — on la déduit plutôt que de laisser la note orpheline.
            $lesson ??= $learningPoint->lesson;
        }

        if ($moduleNumber !== null) {
            if ($lesson === null) {
                throw new DomainException('Un module se rattache à une leçon.');
            }
            $exists = LessonModule::where('lesson_id', $lesson->id)->where('number', $moduleNumber)->exists();
            if (! $exists) {
                throw new DomainException('Ce module n’appartient pas à cette leçon.');
            }
        }

        if ($questionId !== null && $exerciseId === null) {
            throw new DomainException('Une question se rattache à un exercice.');
        }
        if ($exerciseId !== null) {
            if ($lesson === null) {
                throw new DomainException('Un exercice se rattache à une leçon.');
            }
            // Le contenu des exercices vit en fichiers versionnés : c'est là
            // qu'on vérifie qu'un identifiant existe, et sous quelle leçon.
            if ($this->exercises->find($lesson->code, $exerciseId) === null) {
                throw new DomainException('Cet exercice n’appartient pas à cette leçon.');
            }
            if ($questionId !== null && $this->exercises->findQuestion($lesson->code, $exerciseId, $questionId) === null) {
                throw new DomainException('Cette question n’appartient pas à cet exercice.');
            }
        }

        return [
            'lesson_id' => $lesson?->id,
            'learning_point_id' => $learningPoint?->id,
            'module_number' => $moduleNumber,
            'exercise_id' => $exerciseId,
            'question_id' => $questionId,
        ];
    }

    private function code(mixed $value): ?string
    {
        $s = trim((string) ($value ?? ''));

        return $s === '' ? null : $s;
    }
}
