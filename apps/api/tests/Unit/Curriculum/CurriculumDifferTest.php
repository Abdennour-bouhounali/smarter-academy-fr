<?php

namespace Tests\Unit\Curriculum;

use App\Domain\Curriculum\Support\CurriculumDiffer;
use PHPUnit\Framework\TestCase;

class CurriculumDifferTest extends TestCase
{
    public function test_a_code_absent_from_existing_is_created(): void
    {
        $diff = CurriculumDiffer::diff(
            ['6e_x_P1' => ['title' => 'A', 'order' => 1]],
            []
        );

        $this->assertSame(['6e_x_P1'], $diff['created']);
        $this->assertSame([], $diff['updated']);
        $this->assertSame([], $diff['retired']);
        $this->assertSame([], $diff['unchanged']);
    }

    public function test_a_code_with_identical_fields_is_unchanged(): void
    {
        $entry = ['title' => 'A', 'order' => 1];

        $diff = CurriculumDiffer::diff(['6e_x_P1' => $entry], ['6e_x_P1' => $entry]);

        $this->assertSame(['6e_x_P1'], $diff['unchanged']);
        $this->assertSame([], $diff['created']);
    }

    public function test_a_code_with_a_changed_title_is_updated(): void
    {
        $diff = CurriculumDiffer::diff(
            ['6e_x_P1' => ['title' => 'New title', 'order' => 1]],
            ['6e_x_P1' => ['title' => 'Old title', 'order' => 1]]
        );

        $this->assertSame(['6e_x_P1'], $diff['updated']);
    }

    public function test_a_code_present_only_in_existing_is_retired(): void
    {
        $diff = CurriculumDiffer::diff(
            [],
            ['6e_x_P9' => ['title' => 'Gone', 'order' => 9]]
        );

        $this->assertSame(['6e_x_P9'], $diff['retired']);
    }

    public function test_extra_db_side_fields_never_count_as_drift(): void
    {
        // The DB snapshot may carry fields the source doesn't own (ids,
        // timestamps, diagnostic_skill_id) — only source-defined fields are
        // compared.
        $diff = CurriculumDiffer::diff(
            ['6e_x_P1' => ['title' => 'A', 'order' => 1]],
            ['6e_x_P1' => ['title' => 'A', 'order' => 1, 'diagnostic_skill_id' => 'nombres.lecture']]
        );

        $this->assertSame(['6e_x_P1'], $diff['unchanged']);
    }

    public function test_all_four_classifications_can_coexist(): void
    {
        $diff = CurriculumDiffer::diff(
            [
                'new' => ['title' => 'N'],
                'changed' => ['title' => 'after'],
                'same' => ['title' => 'S'],
            ],
            [
                'changed' => ['title' => 'before'],
                'same' => ['title' => 'S'],
                'gone' => ['title' => 'G'],
            ]
        );

        $this->assertSame(['new'], $diff['created']);
        $this->assertSame(['changed'], $diff['updated']);
        $this->assertSame(['same'], $diff['unchanged']);
        $this->assertSame(['gone'], $diff['retired']);
    }
}
