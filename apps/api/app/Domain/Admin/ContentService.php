<?php

namespace App\Domain\Admin;

use App\Domain\Access\AccessTier;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use App\Models\StudentReport;
use App\Models\User;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Le contenu vu par l'administration : lister, inspecter, publier, masquer.
 *
 * Ce service ne connaît QUE l'état de publication. Le contenu pédagogique
 * lui-même reste dans les fichiers (voir ContentRegistryImporter) — il n'y a
 * pas de « second moteur d'exercices » ici, ni d'éditeur de leçon.
 *
 * Toute écriture passe par changeStatus(), qui journalise. Il n'existe pas de
 * chemin qui change une publication sans laisser de trace.
 */
class ContentService
{
    public function __construct(private ActivityLogger $log) {}

    /**
     * Liste des leçons, avec ce qu'il faut pour décider : combien de modules,
     * combien d'exercices, combien de signalements ouverts.
     *
     * Les compteurs sont agrégés par withCount plutôt que dans la boucle
     * d'affichage : 133 leçons × 3 requêtes serait la façon la plus simple de
     * rendre cette page lente.
     */
    public function lessons(array $filters = []): LengthAwarePaginator
    {
        $query = Lesson::query()
            ->with('chapter.grade')
            ->withCount([
                'modules as modules_count' => fn ($q) => $q->whereNull('retired_at'),
                'practiceExercises as exercises_count' => fn ($q) => $q->whereNull('retired_at'),
                'reports as open_reports_count' => fn ($q) => $q->whereIn('status', [
                    StudentReport::STATUS_NEW,
                    StudentReport::STATUS_IN_REVIEW,
                ]),
                'studentProgress as students_count',
            ]);

        if ($search = ($filters['search'] ?? null)) {
            $query->where(fn ($q) => $q
                ->where('title', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%"));
        }

        if ($grade = ($filters['grade'] ?? null)) {
            $query->whereHas('chapter.grade', fn ($q) => $q->where('code', $grade));
        }

        if ($chapter = ($filters['chapter'] ?? null)) {
            $query->whereHas('chapter', fn ($q) => $q->where('code', $chapter));
        }

        if ($status = ($filters['status'] ?? null)) {
            $query->where('publication_status', $status);
        }

        if ($tier = ($filters['tier'] ?? null)) {
            $query->where('tier', $tier);
        }

        $sort = $filters['sort'] ?? 'title';
        $direction = ($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $sortable = ['title', 'code', 'publication_status', 'updated_at', 'modules_count', 'exercises_count', 'open_reports_count'];
        $query->orderBy(in_array($sort, $sortable, true) ? $sort : 'title', $direction);

        return $query->paginate(min((int) ($filters['perPage'] ?? 25), 100));
    }

    /** Une leçon, ses modules et ses exercices — la vue d'inspection. */
    public function lesson(string $code): Lesson
    {
        $lesson = Lesson::with([
            'chapter.grade',
            'modules' => fn ($q) => $q->orderBy('number'),
            'practiceExercises' => fn ($q) => $q->orderBy('level')->orderBy('exercise_code'),
            'learningPoints' => fn ($q) => $q->orderBy('order'),
        ])->where('code', $code)->first();

        if (! $lesson) {
            throw new DomainException('Leçon introuvable.');
        }

        return $lesson;
    }

    /**
     * TOUS les modules, toutes leçons confondues.
     *
     * La vue par leçon existait déjà (voir lesson()), mais elle oblige à
     * savoir OÙ chercher. Un administrateur qui veut « tous les modules
     * masqués » ou « toutes les manipulations de 5e » n'a pas ce point de
     * départ — d'où cette liste transversale, filtrable par étape et par
     * état.
     */
    public function modules(array $filters = []): LengthAwarePaginator
    {
        // Colonnes QUALIFIÉES partout : le tri par leçon joint `lessons`, qui
        // porte exactement les mêmes noms (publication_status, title, code).
        // Sans préfixe, MySQL refuse la requête pour ambiguïté — et seulement
        // quand un filtre est posé, ce qui en fait un défaut discret.
        $query = LessonModule::query()
            ->with(['lesson:id,code,title,chapter_id', 'lesson.chapter:id,code,title,grade_id', 'lesson.chapter.grade:id,code'])
            ->whereNull('lesson_modules.retired_at');

        if ($search = ($filters['search'] ?? null)) {
            $query->where(fn ($q) => $q
                ->where('lesson_modules.title', 'like', "%{$search}%")
                ->orWhere('lesson_modules.code', 'like', "%{$search}%")
                ->orWhereHas('lesson', fn ($l) => $l
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")));
        }

        if ($grade = ($filters['grade'] ?? null)) {
            $query->whereHas('lesson.chapter.grade', fn ($q) => $q->where('code', $grade));
        }

        if ($lesson = ($filters['lesson'] ?? null)) {
            $query->whereHas('lesson', fn ($q) => $q->where('code', $lesson));
        }

        if ($stage = ($filters['stage'] ?? null)) {
            $query->where('lesson_modules.stage', $stage);
        }

        if ($status = ($filters['status'] ?? null)) {
            $query->where('lesson_modules.publication_status', $status);
        }

        $sort = $filters['sort'] ?? 'lesson';
        $direction = ($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        // Trier par leçon demande une jointure : l'ordre naturel d'une liste
        // de modules est « leçon, puis numéro », pas « id ».
        if ($sort === 'lesson') {
            $query->join('lessons', 'lessons.id', '=', 'lesson_modules.lesson_id')
                ->orderBy('lessons.code', $direction)
                ->orderBy('lesson_modules.number')
                ->select('lesson_modules.*');
        } else {
            $sortable = ['number', 'title', 'stage', 'publication_status', 'updated_at'];
            $column = in_array($sort, $sortable, true) ? $sort : 'number';
            $query->orderBy("lesson_modules.{$column}", $direction);
        }

        return $query->paginate(min((int) ($filters['perPage'] ?? 50), 100));
    }

    /** Tous les exercices, toutes leçons confondues. Jumeau de modules(). */
    public function exercises(array $filters = []): LengthAwarePaginator
    {
        $query = PracticeExercise::query()
            // `tier` fait partie de la sélection : sans lui, le palier
            // effectif d'un exercice se calculerait contre un null et
            // afficherait « gratuit » sous une leçon payante.
            ->with(['lesson:id,code,title,chapter_id,tier', 'lesson.chapter:id,code,title,grade_id', 'lesson.chapter.grade:id,code'])
            ->whereNull('practice_exercises.retired_at');

        if ($search = ($filters['search'] ?? null)) {
            $query->where(fn ($q) => $q
                ->where('practice_exercises.exercise_code', 'like', "%{$search}%")
                ->orWhere('practice_exercises.title', 'like', "%{$search}%")
                ->orWhereHas('lesson', fn ($l) => $l
                    ->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")));
        }

        if ($grade = ($filters['grade'] ?? null)) {
            $query->whereHas('lesson.chapter.grade', fn ($q) => $q->where('code', $grade));
        }

        if ($lesson = ($filters['lesson'] ?? null)) {
            $query->whereHas('lesson', fn ($q) => $q->where('code', $lesson));
        }

        if (($level = ($filters['level'] ?? null)) !== null && $level !== '') {
            $query->where('practice_exercises.level', (int) $level);
        }

        if ($status = ($filters['status'] ?? null)) {
            $query->where('practice_exercises.publication_status', $status);
        }

        $direction = ($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';
        $query->join('lessons', 'lessons.id', '=', 'practice_exercises.lesson_id')
            ->orderBy('lessons.code', $direction)
            ->orderBy('practice_exercises.level')
            ->orderBy('practice_exercises.exercise_code')
            ->select('practice_exercises.*');

        return $query->paginate(min((int) ($filters['perPage'] ?? 50), 100));
    }

    /**
     * Change l'état de publication d'une leçon, d'un module ou d'un exercice.
     *
     * Un seul chemin pour les trois : c'est ce qui garantit qu'aucun d'eux ne
     * peut changer d'état sans validation ni journal.
     *
     * Ce que cette méthode ne fait PAS, volontairement : toucher aux données
     * d'apprentissage. Masquer un module ne supprime aucune progression,
     * masquer un exercice n'efface aucune tentative (spec §12).
     */
    public function changeStatus(User $admin, string $type, int $id, string $status): array
    {
        $model = match ($type) {
            'lesson' => Lesson::find($id),
            'module' => LessonModule::find($id),
            'exercise' => PracticeExercise::find($id),
            default => throw new DomainException('Type de contenu inconnu.'),
        };

        if (! $model) {
            throw new DomainException('Contenu introuvable.');
        }

        if (! in_array($status, Lesson::PUBLICATION_STATUSES, true)) {
            throw new DomainException('État de publication inconnu.');
        }

        $before = $model->publication_status;

        if ($before === $status) {
            return ['model' => $model, 'changed' => false];
        }

        // On ne publie que ce qui tient debout. Retirer reste toujours
        // possible : refuser de MASQUER un contenu cassé serait exactement
        // l'inverse de ce qu'on veut.
        if ($status === Lesson::PUB_PUBLISHED) {
            $this->assertPublishable($type, $model);
        }

        // Le changement ET sa trace dans la MÊME transaction : un journal
        // qui affirme une publication qui n'a pas eu lieu est pire que pas de
        // journal du tout — c'est un audit qui ment.
        DB::transaction(function () use ($admin, $model, $status, $type, $before) {
            $model->publication_status = $status;

            // Les horodatages n'existent que sur la leçon : c'est le seul
            // niveau où « depuis quand est-ce publié » a un sens éditorial.
            if ($type === 'lesson') {
                if ($status === Lesson::PUB_PUBLISHED) {
                    $model->published_at ??= now();
                    $model->archived_at = null;
                }
                if ($status === Lesson::PUB_ARCHIVED) {
                    $model->archived_at = now();
                }
            }

            $model->save();

            $this->log->log(
                $admin,
                match ($type) {
                    'lesson' => ActivityLogger::PUBLISH_LESSON,
                    'module' => ActivityLogger::PUBLISH_MODULE,
                    'exercise' => ActivityLogger::PUBLISH_EXERCISE,
                },
                $type,
                $model->id,
                ['publication_status' => $before],
                ['publication_status' => $status],
            );
        });

        return ['model' => $model, 'changed' => true];
    }

    /**
     * Changer le PALIER COMMERCIAL d'une leçon ou d'un exercice.
     *
     * Délibérément SÉPARÉ de changeStatus(), parce que publication et palier
     * sont deux dimensions indépendantes : « publié » dit que le contenu a le
     * droit d'être servi, « payant » dit à qui. Les quatre combinaisons ont un
     * sens, et les mêler dans un seul point d'entrée ferait qu'on ne pourrait
     * plus vendre une leçon sans la republier, ni la retirer sans la rendre
     * gratuite.
     *
     * Les modules n'en ont pas : un module suit sa leçon. Lui donner un palier
     * propre permettrait de vendre le module 7 d'une leçon gratuite, ce qui
     * découperait un parcours pédagogique en péage — ce n'est pas le produit.
     *
     * Ne touche à AUCUNE donnée d'apprentissage : rendre une leçon payante
     * n'efface la progression de personne (§AD).
     */
    public function changeTier(User $admin, string $type, int $id, ?string $tier): array
    {
        $model = match ($type) {
            'lesson' => Lesson::find($id),
            'exercise' => PracticeExercise::find($id),
            default => throw new DomainException('Le palier ne s\'applique qu\'aux leçons et aux exercices.'),
        };

        if (! $model) {
            throw new DomainException('Contenu introuvable.');
        }

        // `null` n'est accepté que pour un exercice, où il veut dire « hérite
        // de la leçon ». Une leçon n'a rien dont hériter : son palier est la
        // racine de la règle, il doit être explicite.
        if ($tier === null) {
            if ($type !== 'exercise') {
                throw new DomainException('Une leçon doit porter un palier explicite.');
            }
        } elseif (! in_array($tier, AccessTier::TIERS, true)) {
            throw new DomainException('Palier inconnu.');
        }

        $before = $model->tier;

        if ($before === $tier) {
            return ['model' => $model, 'changed' => false];
        }

        DB::transaction(function () use ($admin, $model, $tier, $type, $before) {
            $model->tier = $tier;
            $model->save();

            $this->log->log(
                $admin,
                $type === 'lesson' ? ActivityLogger::TIER_LESSON : ActivityLogger::TIER_EXERCISE,
                $type,
                $model->id,
                ['tier' => $before],
                ['tier' => $tier],
            );
        });

        return ['model' => $model, 'changed' => true];
    }

    /**
     * LE MÊME geste, sur plusieurs contenus.
     *
     * Ce n'est délibérément PAS une deuxième implémentation de la
     * publication : la boucle rappelle changeStatus() contenu par contenu.
     * Tout ce qui garde la publication honnête — la validation du vocabulaire,
     * les contrôles structurels d'assertPublishable(), la transaction, la
     * ligne de journal — reste écrit une seule fois, et un traitement en lot
     * ne peut donc pas s'en affranchir. Ajouter ici un `update()` de masse
     * serait deux fois plus rapide et contournerait les quatre.
     *
     * Chaque contenu est traité INDÉPENDAMMENT : une leçon qui refuse d'être
     * publiée (parce qu'aucun de ses modules ne l'est) n'empêche pas les 24
     * autres de l'être. Refuser le lot entier pour un élément invalide
     * obligerait l'administrateur à désélectionner à l'aveugle jusqu'à
     * trouver le coupable.
     *
     * @param  int[]  $ids
     * @return array{applied: int[], unchanged: int[], failed: array<int, array{id: int, message: string}>}
     */
    public function bulkChangeStatus(User $admin, string $type, array $ids, string $status): array
    {
        return $this->bulk(
            $ids,
            fn (int $id) => $this->changeStatus($admin, $type, $id, $status),
        );
    }

    /**
     * Le palier, sur plusieurs contenus. Jumeau de bulkChangeStatus(), et
     * passant par le même changeTier() que le geste unitaire — donc soumis à
     * la même règle « une leçon doit porter un palier explicite ».
     *
     * @param  int[]  $ids
     * @return array{applied: int[], unchanged: int[], failed: array<int, array{id: int, message: string}>}
     */
    public function bulkChangeTier(User $admin, string $type, array $ids, ?string $tier): array
    {
        return $this->bulk(
            $ids,
            fn (int $id) => $this->changeTier($admin, $type, $id, $tier),
        );
    }

    /**
     * La boucle partagée par les deux gestes en lot.
     *
     * Trois issues distinguées, pas deux : APPLIQUÉ, DÉJÀ DANS CET ÉTAT, et
     * REFUSÉ. Fondre les deux premières ferait annoncer « 25 leçons publiées »
     * alors que 20 l'étaient déjà ; fondre « déjà dans cet état » avec un
     * échec ferait passer pour un problème ce qui est exactement le résultat
     * demandé.
     *
     * Seule une DomainException est rattrapée : c'est la classe que le service
     * lève pour dire « ce contenu-là ne peut pas ». Une panne de base ou un
     * bogue remonte, parce qu'un lot qui continue vaillamment à travers une
     * base cassée produirait un rapport qui mentirait sur 24 lignes.
     *
     * @param  int[]  $ids
     * @param  callable(int): array{model: mixed, changed: bool}  $apply
     * @return array{applied: int[], unchanged: int[], failed: array<int, array{id: int, message: string}>}
     */
    private function bulk(array $ids, callable $apply): array
    {
        $applied = [];
        $unchanged = [];
        $failed = [];

        // Dédoublonné : deux fois le même identifiant compterait deux fois
        // dans le rapport, pour un seul contenu touché.
        foreach (array_values(array_unique(array_map('intval', $ids))) as $id) {
            try {
                $result = $apply($id);

                if ($result['changed']) {
                    $applied[] = $id;
                } else {
                    $unchanged[] = $id;
                }
            } catch (DomainException $e) {
                $failed[] = ['id' => $id, 'message' => $e->getMessage()];
            }
        }

        return ['applied' => $applied, 'unchanged' => $unchanged, 'failed' => $failed];
    }

    /**
     * Le contenu est-il publiable ?
     *
     * Contrôles STRUCTURELS seulement — l'existence et la cohérence des
     * liens. Rien sur la pédagogie : ce panneau n'est pas un correcteur de
     * leçon, et prétendre juger la qualité d'un contenu depuis la base serait
     * une promesse qu'on ne peut pas tenir.
     */
    private function assertPublishable(string $type, $model): void
    {
        if ($type === 'module' || $type === 'exercise') {
            // Un contenu retiré du registre n'a plus de source : le publier
            // rendrait visible une page qui n'existe pas.
            if ($model->retired_at !== null) {
                throw new DomainException(
                    'Ce contenu a été retiré du registre : sa source n\'existe plus. '
                    .'Relancez la synchronisation avant de le publier.'
                );
            }

            if ($model->lesson === null) {
                throw new DomainException('Ce contenu n\'est rattaché à aucune leçon.');
            }
        }

        if ($type === 'module') {
            // Un point d'apprentissage retiré signale un module qui enseigne
            // quelque chose qui n'est plus au programme.
            foreach ($model->teaches_learning_point_codes ?? [] as $code) {
                $point = LearningPoint::where('code', $code)->first();

                if ($point === null) {
                    throw new DomainException(
                        "Ce module référence un point d'apprentissage inconnu ({$code})."
                    );
                }

                if ($point->retired_at !== null) {
                    throw new DomainException(
                        "Ce module enseigne un point d'apprentissage retiré du programme ({$code})."
                    );
                }
            }
        }

        if ($type === 'lesson') {
            // Une leçon sans aucun module publiable s'ouvre sur du vide.
            // Avertissement volontairement limité au cas où la leçon a des
            // modules EN REGISTRE : une leçon « à venir » n'en a aucun, et
            // la bloquer n'aurait pas de sens.
            $registered = $model->modules()->whereNull('retired_at')->count();

            if ($registered > 0) {
                $publishable = $model->modules()
                    ->whereNull('retired_at')
                    ->where('publication_status', Lesson::PUB_PUBLISHED)
                    ->count();

                if ($publishable === 0) {
                    throw new DomainException(
                        'Aucun module de cette leçon n\'est publié : l\'élève ouvrirait une leçon vide. '
                        .'Publiez au moins un module d\'abord.'
                    );
                }
            }
        }
    }
}
