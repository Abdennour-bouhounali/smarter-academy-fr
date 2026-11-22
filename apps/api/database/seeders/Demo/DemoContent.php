<?php

namespace Database\Seeders\Demo;

use App\Domain\Practice\ExerciseRepository;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\LearningPoint;
use App\Models\PracticeExercise;
use Illuminate\Support\Collection;

/**
 * Le CONTENU RÉEL sur lequel la démonstration s'appuie.
 *
 * Rien n'est inventé : les leçons, les modules et les points de savoir
 * viennent de la base ; les exercices, leurs questions, leurs points de
 * savoir et leurs erreurs-types viennent des fichiers versionnés de
 * content/practice/ — la même source que lit le moteur de pratique en
 * production (ExerciseRepository). Une démonstration qui inventerait un
 * identifiant de question produirait un carnet d'erreurs qui ne s'ouvre pas.
 */
final class DemoContent
{
    /** @var Collection<int, Lesson> ordonnées comme le parcours de l'unité */
    public readonly Collection $lessons;

    /** @var array<string, int> code de point de savoir → id */
    public readonly array $learningPointIds;

    /** @var array<int, int[]> lesson id → numéros de modules, triés */
    public readonly array $moduleNumbers;

    /** @var array<string, array<int, array<int, array<string, mixed>>>> code leçon → niveau → exercices */
    public readonly array $exercisesByLesson;

    public function __construct(string $gradeCode = '4am')
    {
        $this->lessons = Lesson::query()
            ->whereHas('chapter', fn ($q) => $q->whereHas('grade', fn ($g) => $g->where('code', $gradeCode)))
            ->where('publication_status', 'published')
            ->orderBy('chapter_id')
            ->orderBy('order')
            ->get();

        $this->learningPointIds = LearningPoint::whereIn('lesson_id', $this->lessons->pluck('id'))
            ->pluck('id', 'code')->all();

        $this->moduleNumbers = LessonModule::whereIn('lesson_id', $this->lessons->pluck('id'))
            ->orderBy('number')
            ->get(['lesson_id', 'number'])
            ->groupBy('lesson_id')
            ->map(fn ($rows) => $rows->pluck('number')->map(fn ($n) => (int) $n)->values()->all())
            ->all();

        $this->exercisesByLesson = $this->readExercises();
    }

    /**
     * Les exercices publiés de chaque leçon, lus depuis les fichiers, filtrés
     * sur ce que la base déclare publié : un exercice retiré par
     * l'administration ne doit pas apparaître dans un historique.
     *
     * @return array<string, array<int, array<int, array<string, mixed>>>>
     */
    private function readExercises(): array
    {
        $repository = app(ExerciseRepository::class);
        $published = PracticeExercise::where('publication_status', 'published')
            ->pluck('exercise_code')->flip();

        $out = [];
        foreach ($this->lessons as $lesson) {
            foreach ($repository->indexFor($lesson->code) as $level => $ids) {
                foreach ($ids as $id) {
                    if (! $published->has($id)) {
                        continue;
                    }
                    $exercise = $repository->find($lesson->code, $id);
                    if ($exercise === null || ! isset($exercise['questions'])) {
                        continue;
                    }
                    $out[$lesson->code][(int) $level][] = [
                        'id' => $id,
                        'level' => (int) $level,
                        'questions' => array_map(fn ($q) => [
                            'id' => $q['id'],
                            'learningPoints' => array_map(
                                fn ($lp) => ['code' => $lp['code'], 'role' => $lp['role'] ?? 'primary'],
                                $q['learningPoints'] ?? []
                            ),
                            // L'erreur-type que ce distracteur documente : on
                            // ne l'invente pas, on la reprend du contenu.
                            'misconceptions' => array_values(array_filter(array_map(
                                fn ($c) => $c['misconceptionId'] ?? null,
                                $q['choices'] ?? []
                            ))),
                            'hints' => count($q['hints'] ?? []),
                        ], $exercise['questions']),
                    ];
                }
            }
        }

        return $out;
    }

    /** Les exercices d'une leçon jusqu'à un niveau donné, dans l'ordre. */
    public function exercisesUpTo(string $lessonCode, int $maxLevel): array
    {
        $out = [];
        foreach ($this->exercisesByLesson[$lessonCode] ?? [] as $level => $list) {
            if ($level <= $maxLevel) {
                foreach ($list as $exercise) {
                    $out[] = $exercise;
                }
            }
        }

        usort($out, fn ($a, $b) => [$a['level'], $a['id']] <=> [$b['level'], $b['id']]);

        return $out;
    }
}
