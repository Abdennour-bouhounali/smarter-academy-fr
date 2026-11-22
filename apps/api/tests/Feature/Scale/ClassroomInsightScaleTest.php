<?php

namespace Tests\Feature\Scale;

use App\Models\Classroom;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\CommercialFixtures;
use Tests\Support\LearningFixtures;
use Tests\TestCase;

/**
 * Les lectures de l'espace enseignant font un travail CONSTANT en requêtes,
 * quel que soit le nombre d'élèves de la classe : la carte, les signaux, un
 * point élève par élève, l'aperçu d'un élève, la liste des interventions.
 * Une requête par élève serait une N+1 ; ce test la ferait échouer.
 */
class ClassroomInsightScaleTest extends TestCase
{
    use CommercialFixtures;
    use LearningFixtures;
    use RefreshDatabase;

    /** @var array<int, array<string, int>> requêtes par lecture, par taille */
    private static array $observed = [];

    public static function sizes(): array
    {
        return ['5 élèves' => [5], '40 élèves' => [40]];
    }

    #[DataProvider('sizes')]
    public function test_teacher_reads_do_constant_work_whatever_the_class_size(int $size): void
    {
        config(['mastery.engine_version' => 2]);
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(2);
        $points = [$this->point($lessons[0], 1), $this->point($lessons[0], 2), $this->point($lessons[1], 1)];
        $classroom = Classroom::factory()->create();
        $students = collect(range(1, $size))->map(fn () => $this->student());
        $this->enrol($classroom, $students->all());

        foreach ($students as $i => $s) {
            foreach ($points as $j => $p) {
                $lesson = $j < 2 ? $lessons[0] : $lessons[1];
                $this->answers($s, $lesson, $p, ($i + $j) % 3 === 0 ? 'incorrect' : 'correct', 2, ($i % 4) + 1);
            }
        }

        $token = $this->tokenOf($classroom->teacher);
        $c = $classroom->id;
        $sid = $students->first()->id;
        $this->withToken($token)->postJson("/api/v1/teacher/classrooms/{$c}/interventions", [
            'kind' => 'recommend_practice', 'studentIds' => $students->pluck('id')->take(5)->all(), 'learningPointCode' => $points[0]->code,
        ])->assertCreated();

        $reads = [
            'map' => "/api/v1/teacher/classrooms/{$c}/learning-points",
            'attention' => "/api/v1/teacher/classrooms/{$c}/attention",
            'point' => "/api/v1/teacher/classrooms/{$c}/learning-points/{$points[0]->code}",
            'dossier' => "/api/v1/teacher/classrooms/{$c}/students/{$sid}/progress",
            'interventions' => "/api/v1/teacher/classrooms/{$c}/interventions",
        ];
        $counts = [];
        foreach ($reads as $label => $url) {
            $this->withToken($token)->getJson($url)->assertOk();   // chauffe les mémoires de requête
            $this->forgetAll();
            DB::flushQueryLog();
            DB::enableQueryLog();
            $this->withToken($token)->getJson($url)->assertOk();
            // Les requêtes de l'APPLICATION : l'écriture périodique de
            // `last_used_at` par Sanctum sur le jeton n'en fait pas partie.
            $counts[$label] = count(array_filter(DB::getQueryLog(), fn ($q) => ! str_contains($q['query'], 'personal_access_tokens')));
            DB::disableQueryLog();
        }

        self::$observed[$size] = $counts;
        if (count(self::$observed) === 2) {
            $this->assertSame(self::$observed[5], self::$observed[40], 'une lecture enseignant a fait plus de requêtes pour 40 élèves que pour 5');
        }
        foreach ($counts as $label => $n) {
            $this->assertLessThanOrEqual(45, $n, "{$label} : {$n} requêtes");
        }
    }
}
