<?php

namespace Tests\Feature;

use App\Domain\Curriculum\ContentRegistryImporter;
use App\Domain\Curriculum\CurriculumImporter;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** GET /v1/curriculum/grades/{code} et GET /v1/lessons/{code}/structure (phase 8). */
class CurriculumStructureEndpointTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $lp = fn (string $lesson, int $n, array $pre = []) => ['code' => "4am_{$lesson}_P{$n}", 'title' => "p{$n}", 'order' => $n, 'prerequisites' => array_map(fn ($c) => ['code' => $c, 'requiredMastery' => 0.7], $pre)];
        (new CurriculumImporter)->import(['grades' => [[
            'code' => '4am', 'name' => '4AM', 'level' => 'moyen', 'order' => 0, 'active' => true,
            'chapters' => [[
                'code' => 'ansab_al_aadad_wal_hisab', 'title' => 'ميدان', 'order' => 0, 'topics' => [],
                'units' => [['code' => 'aadad-tabiiya-natiqa', 'title' => 'الوحدة 1', 'number' => 1, 'objectives' => ['أ'], 'sourceTopicCodes' => ['pgcd'], 'textbook' => null, 'order' => 0]],
                'lessons' => [
                    ['code' => 'qasim-adad-tabii', 'officialObjectCode' => null, 'title' => 'L1', 'description' => 'd', 'status' => 'available', 'durationMinutes' => 45, 'tier' => 'free', 'order' => 0, 'unitCode' => 'aadad-tabiiya-natiqa', 'kind' => 'lesson', 'titleSource' => 'textbook', 'textbookRef' => null, 'prerequisiteLessonCodes' => [], 'learningPoints' => [$lp('qasim-adad-tabii', 1)]],
                    ['code' => 'bahth-pgcd', 'officialObjectCode' => null, 'title' => 'L6', 'description' => 'd', 'status' => 'available', 'durationMinutes' => 65, 'tier' => 'premium', 'order' => 1, 'unitCode' => 'aadad-tabiiya-natiqa', 'kind' => 'lesson', 'titleSource' => 'textbook', 'textbookRef' => ['activity' => 6], 'prerequisiteLessonCodes' => ['qasim-adad-tabii'], 'learningPoints' => [$lp('bahth-pgcd', 1, ['4am_qasim-adad-tabii_P1'])]],
                ],
            ]],
        ], ['code' => 'dormant', 'name' => 'x', 'level' => 'college', 'order' => 1, 'active' => false, 'chapters' => []]]]);
        (new ContentRegistryImporter)->import(['lessons' => [[
            'code' => 'bahth-pgcd', 'grade' => '4am',
            'modules' => [['code' => '01', 'number' => 1, 'slug' => 'al-furuq', 'title' => 'm1', 'stage' => 'trigger', 'estimatedMin' => 14, 'difficulty' => 2, 'teachesLearningPointCodes' => ['4am_bahth-pgcd_P1']]],
            'resources' => [['code' => 'pgcd-differences-252-140', 'kind' => 'manipulation', 'type' => 'pgcd-differences', 'title' => 'الفروق', 'module' => 1, 'learningPointIds' => ['4am_bahth-pgcd_P1'], 'sourceElementIds' => ['act-6a'], 'config' => null]],
        ]], 'exercises' => [['lessonCode' => 'bahth-pgcd', 'exerciseCode' => 'ex-4am-bahth-pgcd-l1-001', 'level' => 1, 'title' => 't', 'questionCount' => 1]]]);
    }

    private function token(): string
    {
        $user = User::factory()->create(['role' => 'student', 'grade' => '4am', 'email_verified_at' => now()]);

        return $user->createToken('t')->plainTextToken;
    }

    public function test_guests_get_401(): void
    {
        $this->getJson('/api/v1/curriculum/grades/4am')->assertStatus(401);
    }

    public function test_grade_tree_returns_units_lessons_points_and_prerequisites(): void
    {
        $res = $this->withHeader('Authorization', 'Bearer '.$this->token())->getJson('/api/v1/curriculum/grades/4am');
        $res->assertOk()->assertJsonPath('grade.code', '4am')
            ->assertJsonPath('grade.chapters.0.units.0.code', 'aadad-tabiiya-natiqa')
            ->assertJsonPath('grade.chapters.0.lessons.1.unitCode', 'aadad-tabiiya-natiqa')
            ->assertJsonPath('grade.chapters.0.lessons.1.kind', 'lesson')
            ->assertJsonPath('grade.chapters.0.lessons.1.prerequisiteLessonCodes.0', 'qasim-adad-tabii')
            ->assertJsonPath('grade.chapters.0.lessons.1.learningPoints.0.prerequisites.0.code', '4am_qasim-adad-tabii_P1')
            ->assertJsonPath('grade.chapters.0.lessons.1.learningPoints.0.prerequisites.0.requiredMastery', 0.7);
    }

    public function test_grade_tree_is_eager_loaded_without_per_lesson_queries(): void
    {
        $token = $this->token();
        DB::enableQueryLog();
        $this->withHeader('Authorization', 'Bearer '.$token)->getJson('/api/v1/curriculum/grades/4am')->assertOk();
        $count = count(DB::getQueryLog());
        DB::disableQueryLog();
        // Auth + grade + chapters + units + lessons + LPs + LP prerequisites + lesson prerequisites : une poignée, jamais N par leçon.
        $this->assertLessThanOrEqual(12, $count, "trop de requêtes : {$count}");
    }

    public function test_inactive_grade_is_404_and_unknown_lesson_too(): void
    {
        $token = $this->token();
        $this->withHeader('Authorization', 'Bearer '.$token)->getJson('/api/v1/curriculum/grades/dormant')->assertStatus(404)->assertJsonPath('reason', 'grade_not_found');
        $this->withHeader('Authorization', 'Bearer '.$token)->getJson('/api/v1/lessons/nope/structure')->assertStatus(404)->assertJsonPath('reason', 'lesson_not_found');
    }

    public function test_lesson_structure_returns_unit_resources_modules_and_exercises(): void
    {
        $res = $this->withHeader('Authorization', 'Bearer '.$this->token())->getJson('/api/v1/lessons/bahth-pgcd/structure');
        $res->assertOk()
            ->assertJsonPath('lesson.code', 'bahth-pgcd')
            ->assertJsonPath('lesson.unit.code', 'aadad-tabiiya-natiqa')
            ->assertJsonPath('lesson.textbookRef.activity', 6)
            ->assertJsonPath('lesson.prerequisiteLessonCodes.0', 'qasim-adad-tabii')
            ->assertJsonPath('lesson.resources.0.type', 'pgcd-differences')
            ->assertJsonPath('lesson.resources.0.sourceElementIds.0', 'act-6a')
            ->assertJsonPath('lesson.modules.0.slug', 'al-furuq')
            ->assertJsonPath('lesson.practiceExercises.0.code', 'ex-4am-bahth-pgcd-l1-001');
        $this->assertTrue(Grade::where('code', '4am')->firstOrFail()->is_active);
    }
}
