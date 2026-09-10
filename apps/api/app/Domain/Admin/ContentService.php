<?php

namespace App\Domain\Admin;

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
