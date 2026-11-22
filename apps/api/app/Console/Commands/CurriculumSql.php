<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

/**
 * Émet le SQL d'UPSERT du miroir de curriculum, pour une base où `php artisan`
 * ne s'exécute pas (Hostinger : le schéma et les données s'appliquent par SQL
 * relu dans phpMyAdmin — docs/deployment/DZ_FIRST_DEPLOYMENT.md).
 *
 * Pourquoi ne pas exporter la base locale : ses `id` ne sont pas ceux de la
 * production. Chaque ligne est donc écrite avec ses CLÉS PAR CODE, et les
 * clés étrangères sont résolues par sous-requête au moment de l'exécution :
 *
 *   INSERT INTO lessons (chapter_id, code, …)
 *   SELECT c.id, 'qasim-adad-tabii', … FROM chapters c JOIN grades g ON g.id = c.grade_id
 *   WHERE g.code = '4am' AND c.code = 'ansab_al_aadad_wal_hisab'
 *   ON DUPLICATE KEY UPDATE title = VALUES(title), …
 *
 * Idempotent (rejouable), additif (jamais de DELETE), et il ne touche JAMAIS
 * `tier` d'une ligne existante. Une leçon nouvelle naît `tier = 'free'`.
 * Publication — mêmes règles que les importeurs (propriétaire, 2026-11-11,
 * « pousser en production publie ») : une leçon `available` encore `draft`
 * devient `published` ; un module n'a pas d'état propre et reçoit celui de
 * sa leçon ; un exercice naît `published` sous une leçon publiée et un
 * `draft` y est publié. `hidden` / `archived` (gestes de l'admin) sont gardés.
 *
 *     php artisan smarter:curriculum-sql --out=docs/deployment/HOSTINGER_UNIT1_CURRICULUM_DATA.sql
 */
class CurriculumSql extends Command
{
    protected $signature = 'smarter:curriculum-sql
        {--out= : Fichier .sql à écrire (défaut : storage/app/curriculum-upsert.sql)}
        {--from-json= : Export du curriculum déjà généré}
        {--registry-json= : Export du registre de contenu déjà généré}
        {--grade= : Ne garder que cette classe (code), ex. 4am}
        {--retire-lesson=* : Codes de leçons à archiver (publication_status = archived) — ex. pgcd}';

    protected $description = 'Écrit le SQL d\'upsert (clés par code, FK par sous-requête) du miroir de curriculum, pour une base sans artisan';

    /** @var string[] */
    private array $sql = [];

    public function handle(): int
    {
        $curriculum = $this->readExport($this->option('from-json'), config('curriculum.export_script_path'), config('curriculum.export_output_path'), 'grades');
        $registry = $this->readExport($this->option('registry-json'), config('curriculum.registry_export_script_path'), config('curriculum.registry_export_output_path'), 'lessons');
        if ($curriculum === null || $registry === null) {
            return self::FAILURE;
        }

        $onlyGrade = $this->option('grade');
        $this->header();

        foreach ($curriculum['grades'] as $grade) {
            if ($onlyGrade && $grade['code'] !== $onlyGrade) {
                continue;
            }
            $this->emitGrade($grade);
        }

        $gradeOfLesson = [];
        foreach ($curriculum['grades'] as $grade) {
            foreach ($grade['chapters'] as $chapter) {
                foreach ($chapter['lessons'] as $lesson) {
                    $gradeOfLesson[$lesson['code']] = $grade['code'];
                }
            }
        }
        foreach ($registry['lessons'] ?? [] as $lesson) {
            $g = $lesson['grade'] ?? $gradeOfLesson[$lesson['code']] ?? null;
            if (! $g || ($onlyGrade && $g !== $onlyGrade)) {
                continue;
            }
            $this->emitModules($lesson, $g);
            $this->emitResources($lesson, $g);
        }
        foreach ($registry['exercises'] ?? [] as $exercise) {
            $g = $gradeOfLesson[$exercise['lessonCode']] ?? null;
            if (! $g || ($onlyGrade && $g !== $onlyGrade)) {
                continue;
            }
            $this->emitExercise($exercise, $g);
        }

        foreach ((array) $this->option('retire-lesson') as $code) {
            $this->sql[] = '-- Leçon retirée du catalogue : archivée (jamais supprimée — la progression des élèves la référence).';
            $this->sql[] = "UPDATE `lessons` SET `publication_status` = 'archived', `archived_at` = COALESCE(`archived_at`, NOW()), `updated_at` = NOW() WHERE `code` = {$this->q($code)};";
        }

        $this->sql[] = 'COMMIT;';

        $out = $this->option('out') ?: storage_path('app/curriculum-upsert.sql');
        @mkdir(dirname($out), 0777, true);
        file_put_contents($out, implode("\n", $this->sql)."\n");
        $this->info("SQL écrit : {$out} (".count($this->sql).' instructions)');

        return self::SUCCESS;
    }

    private function readExport(?string $path, string $script, string $output, string $rootKey): ?array
    {
        $file = $path ?: $output;
        if (! $path) {
            $result = Process::run(['node', $script, $output]);
            if (! $result->successful()) {
                $this->error("Export impossible ({$script}) :\n".$result->errorOutput());

                return null;
            }
        }
        if (! is_file($file)) {
            $this->error("Export introuvable : {$file}");

            return null;
        }
        $data = json_decode(file_get_contents($file), true);
        if (! is_array($data) || ! isset($data[$rootKey])) {
            $this->error("Export invalide (clé « {$rootKey} » absente) : {$file}");

            return null;
        }

        return $data;
    }

    private function header(): void
    {
        $this->sql[] = '-- ============================================================================';
        $this->sql[] = '-- SMARTER ACADEMY — MIROIR DU CURRICULUM (UPSERT PAR CODE)';
        $this->sql[] = '-- Généré par `php artisan smarter:curriculum-sql`. Rejouable : chaque ligne';
        $this->sql[] = '-- est identifiée par son CODE, les clés étrangères sont résolues par';
        $this->sql[] = '-- sous-requête, et rien n\'est supprimé. Le tier d\'une ligne existante n\'est';
        $this->sql[] = '-- jamais modifié ; une leçon available draft est publiée, ses modules la suivent.';
        $this->sql[] = '-- Une leçon nouvelle naît tier = \'free\'. Appliquer APRÈS le SQL de schéma.';
        $this->sql[] = '-- ============================================================================';
        $this->sql[] = 'SET NAMES utf8mb4;';
        $this->sql[] = 'START TRANSACTION;';
    }

    /**
     * Les affectations de publication d'une leçon existante, AVANT `status` :
     * MySQL évalue l'ON DUPLICATE KEY UPDATE de gauche à droite, donc ces
     * expressions lisent encore l'ANCIEN `status` et l'ancien état.
     */
    private const PUBLICATION_ON_UPDATE =
        "`published_at` = CASE WHEN VALUES(`status`) = 'available' AND `publication_status` = 'draft' THEN NOW() ELSE `published_at` END, "
        ."`publication_status` = CASE WHEN VALUES(`status`) <> 'available' AND `publication_status` = 'published' THEN 'draft' "
        ."WHEN VALUES(`status`) = 'available' AND `publication_status` = 'draft' THEN 'published' "
        .'ELSE `publication_status` END,';

    private function emitGrade(array $g): void
    {
        $this->sql[] = "\n-- ── Classe {$g['code']} ──";
        $this->sql[] = "INSERT INTO `grades` (`code`, `name`, `level`, `order`, `is_active`, `created_at`, `updated_at`) VALUES ({$this->q($g['code'])}, {$this->q($g['name'])}, {$this->q($g['level'])}, ".(int) ($g['order'] ?? 0).', '.(! empty($g['active']) ? 1 : 0).', NOW(), NOW())'
            .' ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `level` = VALUES(`level`), `order` = VALUES(`order`), `is_active` = VALUES(`is_active`), `updated_at` = NOW();';

        foreach ($g['chapters'] as $c) {
            $topics = ($c['topics'] ?? []) === [] ? 'NULL' : $this->q(json_encode($c['topics'], JSON_UNESCAPED_UNICODE));
            $this->sql[] = "INSERT INTO `chapters` (`grade_id`, `code`, `title`, `topics`, `order`, `created_at`, `updated_at`) SELECT g.id, {$this->q($c['code'])}, {$this->q($c['title'])}, {$topics}, ".(int) $c['order'].", NOW(), NOW() FROM `grades` g WHERE g.code = {$this->q($g['code'])}"
                .' ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `topics` = VALUES(`topics`), `order` = VALUES(`order`), `updated_at` = NOW();';

            foreach ($c['units'] ?? [] as $u) {
                $this->sql[] = "INSERT INTO `units` (`chapter_id`, `code`, `title`, `subtitle`, `number`, `objectives`, `source_topic_codes`, `textbook`, `order`, `created_at`, `updated_at`) SELECT c.id, {$this->q($u['code'])}, {$this->q($u['title'])}, {$this->qn($u['subtitle'] ?? null)}, {$this->n($u['number'] ?? null)}, {$this->qj($u['objectives'] ?? null)}, {$this->qj($u['sourceTopicCodes'] ?? null)}, {$this->qj($u['textbook'] ?? null)}, ".(int) ($u['order'] ?? 0).", NOW(), NOW() FROM `chapters` c JOIN `grades` g ON g.id = c.grade_id WHERE g.code = {$this->q($g['code'])} AND c.code = {$this->q($c['code'])}"
                    .' ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `subtitle` = VALUES(`subtitle`), `number` = VALUES(`number`), `objectives` = VALUES(`objectives`), `source_topic_codes` = VALUES(`source_topic_codes`), `textbook` = VALUES(`textbook`), `order` = VALUES(`order`), `updated_at` = NOW();';
            }

            foreach ($c['lessons'] as $l) {
                // Le palier : `'free'` pour une leçon CRÉÉE par ce SQL, et
                // absent de l'ON DUPLICATE KEY UPDATE — rejouer ce fichier ne
                // touche jamais au palier qu'un administrateur a décidé
                // (lessons.tier, seule source de vérité). Même règle que
                // CurriculumImporter.
                // L'état de publication : même règle que CurriculumImporter
                // (publicationOnCreate / publicationOnUpdate) — une leçon
                // `coming_soon` naît `draft` et n'est jamais `published` ;
                // `coming_soon` → `available` promeut un `draft` en `published`.
                $publication = $l['status'] === 'available' ? "'published'" : "'draft'";
                $publishedAt = $l['status'] === 'available' ? 'NOW()' : 'NULL';
                $unitSelect = ! empty($l['unitCode'])
                    ? "(SELECT u.id FROM `units` u WHERE u.chapter_id = c.id AND u.code = {$this->q($l['unitCode'])})"
                    : 'NULL';
                $this->sql[] = "INSERT INTO `lessons` (`chapter_id`, `unit_id`, `code`, `kind`, `official_object_code`, `title`, `title_source`, `description`, `textbook_ref`, `status`, `publication_status`, `published_at`, `duration_minutes`, `tier`, `order`, `created_at`, `updated_at`) SELECT c.id, {$unitSelect}, {$this->q($l['code'])}, {$this->q($l['kind'] ?? 'lesson')}, {$this->qn($l['officialObjectCode'] ?? null)}, {$this->q($l['title'])}, {$this->q($l['titleSource'] ?? 'official_topic')}, {$this->qn($l['description'] ?? null)}, {$this->qj($l['textbookRef'] ?? null)}, {$this->q($l['status'])}, {$publication}, {$publishedAt}, {$this->n($l['durationMinutes'] ?? null)}, 'free', ".(int) $l['order'].", NOW(), NOW() FROM `chapters` c JOIN `grades` g ON g.id = c.grade_id WHERE g.code = {$this->q($g['code'])} AND c.code = {$this->q($c['code'])}"
                    .' ON DUPLICATE KEY UPDATE `unit_id` = VALUES(`unit_id`), `kind` = VALUES(`kind`), `official_object_code` = VALUES(`official_object_code`), `title` = VALUES(`title`), `title_source` = VALUES(`title_source`), `description` = VALUES(`description`), `textbook_ref` = VALUES(`textbook_ref`), '
                    .self::PUBLICATION_ON_UPDATE.' `status` = VALUES(`status`), `duration_minutes` = VALUES(`duration_minutes`), `order` = VALUES(`order`), `updated_at` = NOW();';

                foreach ($l['learningPoints'] as $lp) {
                    $this->sql[] = "INSERT INTO `learning_points` (`lesson_id`, `code`, `title`, `order`, `retired_at`, `created_at`, `updated_at`) SELECT l.id, {$this->q($lp['code'])}, {$this->q($lp['title'])}, ".(int) $lp['order'].", NULL, NOW(), NOW() FROM `lessons` l WHERE l.code = {$this->q($l['code'])}"
                        .' ON DUPLICATE KEY UPDATE `lesson_id` = VALUES(`lesson_id`), `title` = VALUES(`title`), `order` = VALUES(`order`), `retired_at` = NULL, `updated_at` = NOW();';
                }
            }
        }

        // Prérequis (seconde passe : toutes les leçons et points existent).
        foreach ($g['chapters'] as $c) {
            foreach ($c['lessons'] as $l) {
                foreach ($l['prerequisiteLessonCodes'] ?? [] as $pre) {
                    $this->sql[] = "INSERT IGNORE INTO `lesson_prerequisites` (`lesson_id`, `prerequisite_lesson_id`, `created_at`, `updated_at`) SELECT a.id, b.id, NOW(), NOW() FROM `lessons` a, `lessons` b WHERE a.code = {$this->q($l['code'])} AND b.code = {$this->q($pre)};";
                }
                foreach ($l['learningPoints'] as $lp) {
                    foreach ($lp['prerequisites'] ?? [] as $p) {
                        $this->sql[] = 'INSERT INTO `learning_point_prerequisites` (`learning_point_id`, `prerequisite_learning_point_id`, `required_mastery`, `created_at`, `updated_at`) SELECT a.id, b.id, '.number_format((float) ($p['requiredMastery'] ?? 0.7), 3, '.', '').", NOW(), NOW() FROM `learning_points` a, `learning_points` b WHERE a.code = {$this->q($lp['code'])} AND b.code = {$this->q($p['code'])}"
                            .' ON DUPLICATE KEY UPDATE `required_mastery` = VALUES(`required_mastery`), `updated_at` = NOW();';
                    }
                }
            }
        }
        // Les points disparus de la source pour une leçon présente : retirés, jamais supprimés.
        foreach ($g['chapters'] as $c) {
            foreach ($c['lessons'] as $l) {
                $codes = array_map(fn ($lp) => $this->q($lp['code']), $l['learningPoints']);
                if ($codes !== []) {
                    $this->sql[] = "UPDATE `learning_points` lp JOIN `lessons` l ON l.id = lp.lesson_id SET lp.retired_at = COALESCE(lp.retired_at, NOW()) WHERE l.code = {$this->q($l['code'])} AND lp.code NOT IN (".implode(', ', $codes).');';
                }
            }
        }
    }

    private function emitModules(array $lesson, string $grade): void
    {
        foreach ($lesson['modules'] ?? [] as $m) {
            $this->sql[] = "INSERT INTO `lesson_modules` (`lesson_id`, `code`, `number`, `slug`, `title`, `description`, `stage`, `estimated_min`, `difficulty`, `teaches_learning_point_codes`, `publication_status`, `retired_at`, `created_at`, `updated_at`) SELECT l.id, {$this->q((string) $m['code'])}, ".(int) $m['number'].", {$this->qn($m['slug'] ?? null)}, {$this->q($m['title'] ?? '')}, {$this->qn($m['description'] ?? null)}, {$this->qn($m['stage'] ?? null)}, {$this->n($m['estimatedMin'] ?? null)}, {$this->n($m['difficulty'] ?? null)}, {$this->qj($m['teachesLearningPointCodes'] ?? null)}, l.publication_status, NULL, NOW(), NOW() FROM `lessons` l JOIN `chapters` c ON c.id = l.chapter_id JOIN `grades` g ON g.id = c.grade_id WHERE l.code = {$this->q($lesson['code'])} AND g.code = {$this->q($grade)}"
                .' ON DUPLICATE KEY UPDATE `number` = VALUES(`number`), `slug` = VALUES(`slug`), `title` = VALUES(`title`), `description` = VALUES(`description`), `stage` = VALUES(`stage`), `estimated_min` = VALUES(`estimated_min`), `difficulty` = VALUES(`difficulty`), `teaches_learning_point_codes` = VALUES(`teaches_learning_point_codes`), `publication_status` = VALUES(`publication_status`), `retired_at` = NULL, `updated_at` = NOW();';
        }
    }

    private function emitResources(array $lesson, string $grade): void
    {
        foreach ($lesson['resources'] ?? [] as $i => $r) {
            $this->sql[] = "INSERT INTO `lesson_resources` (`lesson_id`, `code`, `kind`, `type`, `title`, `description`, `module_number`, `learning_point_codes`, `source_element_ids`, `config`, `order`, `retired_at`, `created_at`, `updated_at`) SELECT l.id, {$this->q($r['code'])}, {$this->q($r['kind'])}, {$this->qn($r['type'] ?? null)}, {$this->q($r['title'] ?? '')}, {$this->qn($r['description'] ?? null)}, {$this->n($r['module'] ?? null)}, {$this->qj($r['learningPointIds'] ?? null)}, {$this->qj($r['sourceElementIds'] ?? null)}, {$this->qj($r['config'] ?? null)}, {$i}, NULL, NOW(), NOW() FROM `lessons` l JOIN `chapters` c ON c.id = l.chapter_id JOIN `grades` g ON g.id = c.grade_id WHERE l.code = {$this->q($lesson['code'])} AND g.code = {$this->q($grade)}"
                .' ON DUPLICATE KEY UPDATE `kind` = VALUES(`kind`), `type` = VALUES(`type`), `title` = VALUES(`title`), `description` = VALUES(`description`), `module_number` = VALUES(`module_number`), `learning_point_codes` = VALUES(`learning_point_codes`), `source_element_ids` = VALUES(`source_element_ids`), `config` = VALUES(`config`), `order` = VALUES(`order`), `retired_at` = NULL, `updated_at` = NOW();';
        }
    }

    private function emitExercise(array $e, string $grade): void
    {
        $this->sql[] = "INSERT INTO `practice_exercises` (`lesson_id`, `exercise_code`, `level`, `title`, `question_count`, `publication_status`, `retired_at`, `created_at`, `updated_at`) SELECT l.id, {$this->q($e['exerciseCode'])}, ".(int) $e['level'].", {$this->qn($e['title'] ?? null)}, ".(int) ($e['questionCount'] ?? 0).", IF(l.publication_status = 'published', 'published', 'draft'), NULL, NOW(), NOW() FROM `lessons` l JOIN `chapters` c ON c.id = l.chapter_id JOIN `grades` g ON g.id = c.grade_id WHERE l.code = {$this->q($e['lessonCode'])} AND g.code = {$this->q($grade)}"
            ." ON DUPLICATE KEY UPDATE `level` = VALUES(`level`), `title` = VALUES(`title`), `question_count` = VALUES(`question_count`), `publication_status` = IF(`publication_status` = 'draft' AND VALUES(`publication_status`) = 'published', 'published', `publication_status`), `retired_at` = NULL, `updated_at` = NOW();";
    }

    private function q(string $s): string
    {
        return "'".str_replace(['\\', "'"], ['\\\\', "\\'"], $s)."'";
    }

    private function qn(?string $s): string
    {
        return $s === null ? 'NULL' : $this->q($s);
    }

    private function n(mixed $v): string
    {
        return $v === null ? 'NULL' : (string) (int) $v;
    }

    private function qj(mixed $v): string
    {
        return $v === null ? 'NULL' : $this->q(json_encode($v, JSON_UNESCAPED_UNICODE));
    }
}
