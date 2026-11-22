<?php

namespace Tests\Feature;

use App\Domain\Curriculum\ContentRegistryImporter;
use App\Domain\Curriculum\CurriculumImporter;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\LessonResource;
use App\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Phase 8 : le miroir des UNITÉS du manuel, des prérequis pédagogiques et des
 * ressources déclarées — la même forme que exportCurriculum.mjs /
 * exportContentRegistry.mjs produisent.
 */
class CurriculumUnitsImportTest extends TestCase
{
    use RefreshDatabase;

    private function export(): array
    {
        $lp = fn (string $lesson, int $n, string $title, array $pre = []) => [
            'code' => "3e_{$lesson}_P{$n}", 'title' => $title, 'order' => $n,
            'prerequisites' => array_map(fn ($c) => ['code' => $c, 'requiredMastery' => 0.7], $pre),
        ];

        return ['grades' => [[
            'code' => '3e', 'name' => 'Troisième', 'level' => 'college', 'order' => 0, 'active' => true,
            'chapters' => [[
                'code' => 'nombres_calculs', 'title' => 'Nombres et calculs', 'order' => 0, 'topics' => [['id' => 'pgcd', 'title' => 'x']],
                'units' => [['code' => 'unite-nombres', 'title' => 'Nombres entiers et rationnels', 'subtitle' => null, 'number' => 1, 'objectives' => ['A', 'B'], 'sourceTopicCodes' => ['pgcd'], 'textbook' => ['unit' => 1], 'order' => 0]],
                'lessons' => [
                    ['code' => 'lecon-a', 'officialObjectCode' => null, 'title' => 'Leçon A', 'description' => 'd', 'status' => 'available', 'durationMinutes' => 45, 'tier' => 'free', 'order' => 0,
                        'unitCode' => 'unite-nombres', 'kind' => 'lesson', 'titleSource' => 'textbook', 'textbookRef' => ['activity' => 1], 'prerequisiteLessonCodes' => [],
                        'learningPoints' => [$lp('lecon-a', 1, 'p1'), $lp('lecon-a', 2, 'p2')]],
                    ['code' => 'lecon-f', 'officialObjectCode' => null, 'title' => 'Leçon F', 'description' => 'd', 'status' => 'available', 'durationMinutes' => 50, 'tier' => 'premium', 'order' => 1,
                        'unitCode' => 'unite-nombres', 'kind' => 'lesson', 'titleSource' => 'textbook', 'textbookRef' => null, 'prerequisiteLessonCodes' => ['lecon-a'],
                        'learningPoints' => [$lp('lecon-f', 1, 'q1', ['3e_lecon-a_P2'])]],
                    ['code' => 'lecon-g', 'officialObjectCode' => null, 'title' => 'Intégration', 'description' => 'd', 'status' => 'available', 'durationMinutes' => 40, 'tier' => 'premium', 'order' => 2,
                        'unitCode' => 'unite-nombres', 'kind' => 'synthesis', 'titleSource' => 'textbook', 'textbookRef' => null, 'prerequisiteLessonCodes' => ['lecon-a', 'lecon-f'],
                        'learningPoints' => [$lp('lecon-g', 1, 's1')]],
                    ['code' => 'lecon-h', 'officialObjectCode' => null, 'title' => 'Racines', 'description' => 'd', 'status' => 'coming_soon', 'durationMinutes' => 90, 'tier' => 'premium', 'order' => 3,
                        'unitCode' => null, 'kind' => 'lesson', 'titleSource' => 'official_topic', 'textbookRef' => null, 'prerequisiteLessonCodes' => [],
                        'learningPoints' => [$lp('lecon-h', 1, 'r1')]],
                ],
            ]],
        ]]];
    }

    public function test_units_are_mirrored_and_lessons_attached_with_kind(): void
    {
        (new CurriculumImporter)->import($this->export());

        $unit = Unit::where('code', 'unite-nombres')->firstOrFail();
        $this->assertSame(1, $unit->number);
        $this->assertSame(['A', 'B'], $unit->objectives);
        $this->assertSame(['pgcd'], $unit->source_topic_codes);

        $l1 = Lesson::where('code', 'lecon-a')->firstOrFail();
        $this->assertSame($unit->id, $l1->unit_id);
        $this->assertSame('lesson', $l1->kind);
        $this->assertSame('textbook', $l1->title_source);
        $this->assertSame(['activity' => 1], $l1->textbook_ref);

        $this->assertSame('synthesis', Lesson::where('code', 'lecon-g')->firstOrFail()->kind);
        $this->assertTrue(Lesson::where('code', 'lecon-g')->firstOrFail()->isSynthesis());
        $this->assertNull(Lesson::where('code', 'lecon-h')->firstOrFail()->unit_id);
        $this->assertSame(3, $unit->lessons()->count());
    }

    public function test_pedagogical_prerequisites_are_synced_in_a_second_pass(): void
    {
        $summary = (new CurriculumImporter)->import($this->export());

        $l2 = Lesson::where('code', 'lecon-f')->firstOrFail();
        $this->assertSame(['lecon-a'], $l2->prerequisites()->pluck('code')->all());
        $synth = Lesson::where('code', 'lecon-g')->firstOrFail();
        $this->assertEqualsCanonicalizing(['lecon-a', 'lecon-f'], $synth->prerequisites()->pluck('code')->all());
        $this->assertSame(['lecon-f', 'lecon-g'], Lesson::where('code', 'lecon-a')->firstOrFail()->dependents()->orderBy('code')->pluck('code')->all());

        $q1 = LearningPoint::where('code', '3e_lecon-f_P1')->firstOrFail();
        $pre = $q1->prerequisites()->first();
        $this->assertSame('3e_lecon-a_P2', $pre->code);
        $this->assertEqualsWithDelta(0.7, (float) $pre->pivot->required_mastery, 0.0001);
        $this->assertContains('lecon-f', $summary['lessonPrerequisites']['created']);
        $this->assertContains('3e_lecon-f_P1', $summary['learningPointPrerequisites']['created']);
    }

    public function test_reimport_is_idempotent_and_removes_a_dropped_prerequisite_edge(): void
    {
        $importer = new CurriculumImporter;
        $importer->import($this->export());
        $second = $importer->import($this->export());
        $this->assertSame([], $second['units']['created']);
        $this->assertSame([], $second['lessonPrerequisites']['created']);
        $this->assertSame([], $second['lessonPrerequisites']['updated']);

        $export = $this->export();
        $export['grades'][0]['chapters'][0]['lessons'][2]['prerequisiteLessonCodes'] = ['lecon-a'];
        $third = $importer->import($export);
        $this->assertContains('lecon-g', $third['lessonPrerequisites']['updated']);
        $this->assertSame(['lecon-a'], Lesson::where('code', 'lecon-g')->firstOrFail()->prerequisites()->pluck('code')->all());
    }

    public function test_declared_resources_are_mirrored_and_retired_never_deleted(): void
    {
        (new CurriculumImporter)->import($this->export());
        $registry = ['lessons' => [[
            'code' => 'lecon-a', 'grade' => '3e',
            'modules' => [['code' => '01', 'number' => 1, 'slug' => 'decouverte', 'title' => 'Activité 1', 'description' => null, 'stage' => 'trigger', 'estimatedMin' => 10, 'difficulty' => 1, 'teachesLearningPointCodes' => ['3e_lecon-a_P1']]],
            'resources' => [
                ['code' => 'divisor-explorer-420', 'kind' => 'manipulation', 'type' => 'divisor-explorer', 'title' => 'Est-ce un diviseur ?', 'description' => null, 'module' => 1, 'learningPointIds' => ['3e_lecon-a_P1'], 'sourceElementIds' => ['act-1'], 'config' => null],
                ['code' => 'method-x', 'kind' => 'method', 'type' => null, 'title' => 'Méthode', 'description' => null, 'module' => 1, 'learningPointIds' => ['3e_lecon-a_P2'], 'sourceElementIds' => null, 'config' => null],
            ],
        ]], 'exercises' => []];

        $summary = (new ContentRegistryImporter)->import($registry);
        $this->assertCount(2, $summary['resources']['created']);
        $r = LessonResource::where('code', 'divisor-explorer-420')->firstOrFail();
        $this->assertSame('manipulation', $r->kind);
        $this->assertSame('divisor-explorer', $r->type);
        $this->assertSame(1, $r->module_number);
        $this->assertSame(['act-1'], $r->source_element_ids);

        $registry['lessons'][0]['resources'] = [$registry['lessons'][0]['resources'][0]];
        $second = (new ContentRegistryImporter)->import($registry);
        $this->assertSame(['lecon-a/method-x'], $second['resources']['retired']);
        $this->assertNotNull(LessonResource::where('code', 'method-x')->firstOrFail()->retired_at);
        $this->assertSame(2, LessonResource::count());

        // Une leçon sans tableau `resources` n'est pas touchée.
        unset($registry['lessons'][0]['resources']);
        $third = (new ContentRegistryImporter)->import($registry);
        $this->assertSame([], $third['resources']['retired']);
    }
}
