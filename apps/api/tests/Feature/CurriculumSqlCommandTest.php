<?php

namespace Tests\Feature;

use Tests\TestCase;

/** `smarter:curriculum-sql` : des upserts par code, FK par sous-requête, jamais de DELETE ni de publication_status écrasé. */
class CurriculumSqlCommandTest extends TestCase
{
    public function test_emits_code_keyed_upserts_for_the_whole_mirror(): void
    {
        $dir = sys_get_temp_dir().'/sa-curriculum-sql-'.uniqid();
        mkdir($dir);
        file_put_contents("{$dir}/curriculum.json", json_encode(['grades' => [[
            'code' => '4am', 'name' => '4AM', 'level' => 'moyen', 'order' => 0, 'active' => true,
            'chapters' => [[
                'code' => 'ch', 'title' => 'ميدان', 'order' => 0, 'topics' => [],
                'units' => [['code' => 'u1', 'title' => 'الوحدة', 'number' => 1, 'objectives' => ['أ'], 'sourceTopicCodes' => ['pgcd'], 'textbook' => null, 'order' => 0]],
                'lessons' => [['code' => 'l1', 'officialObjectCode' => null, 'title' => "L'1", 'description' => null, 'status' => 'available', 'durationMinutes' => 45, 'tier' => 'free', 'order' => 0, 'unitCode' => 'u1', 'kind' => 'lesson', 'titleSource' => 'textbook', 'textbookRef' => ['a' => 1], 'prerequisiteLessonCodes' => ['l0'],
                    'learningPoints' => [['code' => '4am_l1_P1', 'title' => 'p', 'order' => 1, 'prerequisites' => [['code' => '4am_l0_P1', 'requiredMastery' => 0.7]]]]]],
            ]],
        ]]]));
        file_put_contents("{$dir}/registry.json", json_encode(['lessons' => [['code' => 'l1', 'grade' => '4am', 'modules' => [['code' => '01', 'number' => 1, 'slug' => 's', 'title' => 'm', 'stage' => 'trigger', 'estimatedMin' => 10, 'difficulty' => 1, 'teachesLearningPointCodes' => ['4am_l1_P1']]],
            'resources' => [['code' => 'r1', 'kind' => 'manipulation', 'type' => 'divisor-explorer', 'title' => 'x', 'module' => 1, 'learningPointIds' => ['4am_l1_P1'], 'sourceElementIds' => ['act-1'], 'config' => null]]]],
            'exercises' => [['lessonCode' => 'l1', 'exerciseCode' => 'ex-4am-l1-l1-001', 'level' => 1, 'title' => 't', 'questionCount' => 2]]]));

        $out = "{$dir}/out.sql";
        $this->artisan('smarter:curriculum-sql', ['--from-json' => "{$dir}/curriculum.json", '--registry-json' => "{$dir}/registry.json", '--out' => $out, '--retire-lesson' => ['pgcd']])->assertSuccessful();
        $sql = file_get_contents($out);

        $this->assertStringContainsString('INSERT INTO `grades`', $sql);
        $this->assertStringContainsString('INSERT INTO `units`', $sql);
        $this->assertStringContainsString("WHERE g.code = '4am' AND c.code = 'ch'", $sql);
        $this->assertStringContainsString("(SELECT u.id FROM `units` u WHERE u.chapter_id = c.id AND u.code = 'u1')", $sql);
        $this->assertStringContainsString("'L\\'1'", $sql, 'les apostrophes sont échappées');
        $this->assertStringContainsString('INSERT IGNORE INTO `lesson_prerequisites`', $sql);
        $this->assertStringContainsString('INSERT INTO `learning_point_prerequisites`', $sql);
        $this->assertStringContainsString('INSERT INTO `lesson_modules`', $sql);
        $this->assertStringContainsString('INSERT INTO `lesson_resources`', $sql);
        $this->assertStringContainsString('INSERT INTO `practice_exercises`', $sql);
        $this->assertStringContainsString("UPDATE `lessons` SET `publication_status` = 'archived'", $sql);
        $this->assertStringNotContainsString('DELETE ', $sql);
        $this->assertStringNotContainsString('DROP ', $sql);
        // Un module reçoit l'état de sa leçon (2026-11-11 : il n'a pas d'état propre).
        $this->assertMatchesRegularExpression('/INSERT INTO `lesson_modules` .*l\.publication_status, NULL/', $sql);
        // Un exercice naît publié sous une leçon publiée ; un draft y est publié.
        $this->assertStringContainsString("IF(l.publication_status = 'published', 'published', 'draft')", $sql);
        // publication_status n'est recopié tel quel (VALUES) que pour les modules.
        foreach (explode("\n", $sql) as $line) {
            if (str_contains($line, 'ON DUPLICATE KEY UPDATE')) {
                if (! str_starts_with($line, 'INSERT INTO `lesson_modules`')) {
                    $this->assertStringNotContainsString('`publication_status` = VALUES', $line);
                }
                // Le palier non plus : rejouer ce SQL ne réécrit jamais la
                // décision de l'administrateur (lessons.tier).
                $this->assertStringNotContainsString('`tier` = VALUES', $line);
            }
        }
    }
}
