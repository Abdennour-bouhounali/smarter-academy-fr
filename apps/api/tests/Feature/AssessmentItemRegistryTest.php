<?php

namespace Tests\Feature;

use App\Domain\Content\AssessmentItemRepository;
use App\Domain\Curriculum\ContentRegistryImporter;
use App\Models\AssessmentItem;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Le registre d'items (Mastery V2, phase 3) : un index du contenu, validé
 * contre la base, qui ne supprime jamais et ne réinterprète pas le passé.
 */
class AssessmentItemRegistryTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    private LearningPoint $p1;

    private LearningPoint $p2;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => '4am', 'name' => '4AM', 'level' => 'moyen']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab', 'title' => 'الأعداد', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'tayin-pgcd', 'title' => 'تعيين PGCD', 'status' => 'available', 'order' => 0,
        ]);
        $this->p1 = LearningPoint::create(['lesson_id' => $this->lesson->id, 'code' => '4am_tayin-pgcd_P1', 'title' => 'P1', 'order' => 1]);
        $this->p2 = LearningPoint::create(['lesson_id' => $this->lesson->id, 'code' => '4am_tayin-pgcd_P2', 'title' => 'P2', 'order' => 2]);

        $other = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'bahth-pgcd', 'title' => 'بحث PGCD', 'status' => 'available', 'order' => 1,
        ]);
        LearningPoint::create(['lesson_id' => $other->id, 'code' => '4am_bahth-pgcd_P1', 'title' => 'P1', 'order' => 1]);
    }

    private function item(array $override = []): array
    {
        return array_replace([
            'lessonCode' => 'tayin-pgcd',
            'itemKey' => 'final_test:tayin-pgcd:final:E1',
            'sourceKind' => 'final_test',
            'exerciseCode' => null,
            'questionId' => 'E1',
            'templateKey' => null,
            'difficulty' => 3,
            'cognitiveDemand' => null,
            'answerType' => 'choice',
            'title' => null,
            'learningPoints' => [['code' => '4am_tayin-pgcd_P1', 'role' => 'primary']],
            'answerKey' => ['correct' => 0, 'optionCount' => 4],
            'evaluation' => 'server',
            'contentVersion' => 'v1',
        ], $override);
    }

    private function import(array $items): array
    {
        return app(ContentRegistryImporter::class)->import(['lessons' => [], 'exercises' => [], 'items' => $items]);
    }

    public function test_a_valid_item_is_created_with_its_learning_point_pivot(): void
    {
        $summary = $this->import([$this->item(), $this->item([
            'itemKey' => 'practice:tayin-pgcd:ex-4am-tayin-pgcd-l2-001:q1', 'sourceKind' => 'practice',
            'exerciseCode' => 'ex-4am-tayin-pgcd-l2-001', 'questionId' => 'q1', 'difficulty' => 2, 'answerType' => 'rational',
            'learningPoints' => [['code' => '4am_tayin-pgcd_P1', 'role' => 'primary'], ['code' => '4am_tayin-pgcd_P2', 'role' => 'secondary']],
            'answerKey' => ['answerType' => 'rational', 'expectedAnswer' => '18'], 'contentVersion' => 'p1',
        ])]);

        $this->assertCount(2, $summary['items']['created']);
        $this->assertSame([], $summary['invalidItems']);

        $item = AssessmentItem::where('item_key', 'practice:tayin-pgcd:ex-4am-tayin-pgcd-l2-001:q1')->first();
        $this->assertSame('published', $item->publication_status);
        $this->assertSame(['P1' => 'primary', 'P2' => 'secondary'], $item->learningPointRows->mapWithKeys(fn ($p) => [$p->title => $p->pivot->role])->all());

        $repo = app(AssessmentItemRepository::class);
        $this->assertSame(2, $repo->availableItemsForLearningPoint($this->p1->id), 'deux items ont P1 pour point principal');
        $this->assertSame(0, $repo->availableItemsForLearningPoint($this->p2->id), 'P2 n\'est que secondaire');
    }

    public function test_an_item_whose_learning_point_belongs_to_another_lesson_is_refused(): void
    {
        $summary = $this->import([$this->item(['learningPoints' => [['code' => '4am_bahth-pgcd_P1', 'role' => 'primary']]])]);
        $this->assertCount(1, $summary['invalidItems']);
        $this->assertSame(0, AssessmentItem::count());
    }

    public function test_two_primaries_or_an_unknown_code_are_refused(): void
    {
        $summary = $this->import([
            $this->item(['learningPoints' => [['code' => '4am_tayin-pgcd_P1', 'role' => 'primary'], ['code' => '4am_tayin-pgcd_P2', 'role' => 'primary']]]),
            $this->item(['itemKey' => 'final_test:tayin-pgcd:final:E2', 'questionId' => 'E2', 'learningPoints' => [['code' => '4am_tayin-pgcd_P9', 'role' => 'primary']]]),
        ]);
        $this->assertCount(2, $summary['invalidItems']);
        $this->assertSame(0, AssessmentItem::count());
    }

    public function test_a_changed_content_version_updates_the_row_and_an_absent_item_is_retired_never_deleted(): void
    {
        $this->import([$this->item(), $this->item(['itemKey' => 'final_test:tayin-pgcd:final:E2', 'questionId' => 'E2'])]);

        $summary = $this->import([$this->item(['answerKey' => ['correct' => 2, 'optionCount' => 4], 'contentVersion' => 'v2'])]);

        $this->assertSame(['final_test:tayin-pgcd:final:E1'], $summary['items']['updated']);
        $this->assertSame(['final_test:tayin-pgcd:final:E2'], $summary['items']['retired']);
        $this->assertSame(2, AssessmentItem::count(), 'rien n\'est supprimé');
        $this->assertSame(2, AssessmentItem::where('item_key', 'final_test:tayin-pgcd:final:E1')->value('answer_key')['correct']);
        $this->assertNotNull(AssessmentItem::where('item_key', 'final_test:tayin-pgcd:final:E2')->value('retired_at'));

        // Le compte d'items disponibles suit : un seul item publié non retiré pour P1.
        $this->assertSame(1, app(AssessmentItemRepository::class)->availableItemsForLearningPoint($this->p1->id));
    }

    public function test_the_import_is_idempotent(): void
    {
        $this->import([$this->item()]);
        $summary = $this->import([$this->item()]);
        $this->assertSame(['final_test:tayin-pgcd:final:E1'], $summary['items']['unchanged']);
        $this->assertSame([], $summary['items']['updated']);
    }

    public function test_an_empty_registry_reports_unknown_not_zero(): void
    {
        $this->assertNull(app(AssessmentItemRepository::class)->availableItemsForLearningPoint($this->p1->id));
    }
}
