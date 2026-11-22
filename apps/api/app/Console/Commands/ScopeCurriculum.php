<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Process;

/**
 * Ramène le curriculum EN BASE au périmètre que déclare le catalogue.
 *
 * ── Pourquoi cette commande existe ──────────────────────────────────────
 * `smarter:import-curriculum` est un UPSERT : il crée et met à jour, il ne
 * supprime jamais. C'est délibéré — une leçon disparue de la source peut
 * porter des preuves d'apprentissage, et une cascade les emporterait. Mais
 * cela veut dire qu'aucune commande n'était capable de RÉTRÉCIR la base.
 *
 * La phase 6F en a besoin : le dépôt algérien a été cloné du français et sa
 * base porte encore 8 classes, 133 leçons et 1067 points d'apprentissage
 * français, alors que le produit ne doit plus contenir que la 4AM et la
 * terminale algérienne. Les cacher ne suffit plus (c'était la phase 3) ; il
 * faut les retirer.
 *
 * ── L'autorité, et pourquoi ce n'est pas une liste ici ──────────────────
 * Les classes à conserver viennent de L'EXPORT DU CATALOGUE, jamais d'une
 * liste écrite dans ce fichier. Une liste locale pourrait diverger du
 * catalogue sans que rien ne le signale ; l'export, lui, est déjà l'autorité
 * que lisent l'import et `smarter:registry-health`. Il y a donc une seule
 * réponse à « quelles classes existent », et cette commande la lit.
 *
 * ── Ce qu'elle refuse de faire ──────────────────────────────────────────
 * Supprimer une classe fait cascader la base jusqu'aux données ÉLÈVES
 * (preuves, progression, tentatives, sessions de pratique). Cette commande
 * compte ces lignes AVANT d'agir et refuse tant qu'il en existe, sauf
 * autorisation explicite. Elle refuse aussi de tourner en production, sans
 * option de contournement : un nettoyage de curriculum n'y a pas sa place.
 *
 *     php artisan smarter:scope-curriculum --dry-run   # voir sans rien casser
 *     php artisan smarter:scope-curriculum --force     # exécuter
 */
class ScopeCurriculum extends Command
{
    protected $signature = 'smarter:scope-curriculum
                            {--from-json= : Lire un export déjà généré au lieu de lancer le script Node}
                            {--dry-run : Compter et afficher, sans rien supprimer}
                            {--force : Confirmer la suppression définitive}
                            {--allow-student-data-loss : Lever le refus quand des données élèves seraient détruites. NE SUPPRIME RIEN à lui seul : --force et la confirmation restent exigés.}';

    protected $description = 'Supprime de la base tout curriculum hors des classes déclarées par le catalogue. Ne touche jamais aux comptes, droits ou codes d\'activation.';

    /**
     * Les tables que la cascade atteint depuis le curriculum, et la façon dont
     * elle les atteint. Toute table découverte dans le schéma mais absente
     * d'ici fait ÉCHOUER la commande : mieux vaut s'arrêter devant une table
     * inconnue que supposer qu'elle est sans importance.
     *
     * @var array<string, string> table => 'cascade' (les lignes meurent) | 'set_null' (le lien est coupé, la ligne survit)
     */
    private const DEPENDENT_TABLES = [
        'chapters' => 'cascade',
        'units' => 'cascade',
        'lessons' => 'cascade',
        'lesson_prerequisites' => 'cascade',
        'learning_point_prerequisites' => 'cascade',
        'lesson_resources' => 'cascade',
        'learning_points' => 'cascade',
        'lesson_modules' => 'cascade',
        'practice_exercises' => 'cascade',
        'learning_evidence' => 'cascade',
        'learning_evidence_learning_point' => 'cascade',
        'student_learning_point_progress' => 'cascade',
        'student_lesson_progress' => 'cascade',
        'lesson_final_test_attempts' => 'cascade',
        'practice_sessions' => 'cascade',
        'notebook_notes' => 'set_null',
        'student_reports' => 'set_null',
        // La visibilité d'une leçon pour une classe d'enseignant : un réglage,
        // pas une donnée élève. Il meurt avec la leçon qu'il règle.
        'classroom_lessons' => 'cascade',
        // Le registre des items d'évaluation (Mastery V2) : un INDEX du
        // contenu, reconstruit par smarter:import-content-registry — pas une
        // donnée élève. Il meurt avec sa leçon et avec ses learning points.
        'assessment_items' => 'cascade',
        'assessment_item_learning_point' => 'cascade',
        // L'HISTOIRE des états de maîtrise d'un élève : une donnée élève,
        // qui bloque la commande comme la preuve dont elle dérive.
        'learning_point_state_transitions' => 'cascade',
        // Les interventions de l'enseignant : sa donnée, pas celle du
        // curriculum. Le lien au point ou à la leçon est coupé, le geste reste.
        'classroom_interventions' => 'set_null',
        // « التحدّي اليومي » : les questions d'un défi référencent une leçon
        // et un point ; leur suppression emporterait les RÉPONSES des élèves
        // (daily_challenge_answers). Donnée élève : elle bloque la commande.
        'daily_challenge_questions' => 'cascade',
        // « مدار » : une question d'approvisionnement référence une leçon et un
        // point, et porte la réponse de l'élève. Donnée élève : elle bloque.
        'madar_refuels' => 'cascade',
        // Les réponses de l'élève DANS la leçon (mission player, « قاعدتي ») :
        // donnée élève privée. Elle bloque la commande.
        'student_lesson_answers' => 'cascade',
        // Le réglage d'un enseignant sur les labs d'une leçon : un réglage, pas
        // une donnée élève — il meurt avec sa leçon, comme classroom_lessons.
        'teacher_lab_settings' => 'cascade',
    ];

    /**
     * Les tables de cascade qui portent des données ÉLÈVES. Une ligne ici
     * suffit à bloquer la commande : le curriculum se nettoie, l'histoire
     * d'un élève ne se nettoie pas au passage.
     *
     * @var string[]
     */
    private const STUDENT_DATA_TABLES = [
        'learning_evidence',
        'learning_evidence_learning_point',
        'student_learning_point_progress',
        'student_lesson_progress',
        'lesson_final_test_attempts',
        'practice_sessions',
        'learning_point_state_transitions',
        'daily_challenge_questions',
        'madar_refuels',
        'student_lesson_answers',
    ];

    public function handle(): int
    {
        // ── Garde d'environnement ───────────────────────────────────────
        // Sans option de contournement, volontairement. Une commande qui
        // supprime du curriculum n'a rien à faire en production, et compter
        // sur la discipline humaine n'est pas un contrôle.
        if (app()->environment('production')) {
            $this->error('Refus : cette commande ne s\'exécute jamais en production.');

            return self::FAILURE;
        }

        $retained = $this->retainedGradeCodes();
        if ($retained === null) {
            return self::FAILURE;
        }

        if ($retained === []) {
            $this->error('Refus : l\'export ne déclare AUCUNE classe. Un export vide effacerait tout le curriculum.');

            return self::FAILURE;
        }

        $this->line('Classes déclarées par le catalogue (conservées) : '.implode(', ', $retained));

        // ── Le graphe de clés étrangères, lu dans le SCHÉMA ──────────────
        $unknown = $this->undeclaredDependentTables();
        if ($unknown !== []) {
            $this->error('Refus : des tables dépendent du curriculum sans que cette commande sache quoi en faire :');
            foreach ($unknown as $row) {
                $this->line("  {$row['table']}.{$row['column']} → {$row['references']} (ON DELETE {$row['rule']})");
            }
            $this->line('Ajoutez-les à ScopeCurriculum::DEPENDENT_TABLES après avoir décidé de leur sort.');

            return self::FAILURE;
        }

        $removedGradeIds = DB::table('grades')->whereNotIn('code', $retained)->pluck('id');
        $removedGradeCodes = DB::table('grades')->whereNotIn('code', $retained)->pluck('code')->all();

        $counts = $this->countCurriculum($removedGradeIds);
        $this->renderInventory($retained, $removedGradeCodes, $counts);

        if ($removedGradeIds->isEmpty()) {
            $this->info('La base est déjà au périmètre du catalogue : rien à supprimer.');

            return self::SUCCESS;
        }

        // ── Ce que la cascade emporterait ───────────────────────────────
        $dependents = $this->countDependents($counts['lesson_ids'], $counts['learning_point_ids']);
        $this->renderDependents($dependents);

        $studentRows = collect(self::STUDENT_DATA_TABLES)
            ->mapWithKeys(fn ($t) => [$t => $dependents[$t] ?? 0])
            ->filter(fn ($n) => $n > 0);

        if ($studentRows->isNotEmpty() && ! $this->option('allow-student-data-loss')) {
            $this->error('Refus : des données ÉLÈVES seraient détruites par cascade :');
            foreach ($studentRows as $table => $n) {
                $this->line(sprintf('  %-36s %d ligne(s)', $table, $n));
            }
            $this->line('Un nettoyage de curriculum ne doit pas emporter l\'histoire d\'un élève.');
            $this->line('Si cette perte est réellement voulue : --force --allow-student-data-loss.');

            return self::FAILURE;
        }

        if ($this->option('dry-run')) {
            $this->warn('Simulation : rien n\'a été supprimé.');

            return self::SUCCESS;
        }

        if (! $this->option('force')) {
            // Dit explicitement, parce que c'est la confusion qui coûterait
            // cher : lever le refus n'autorise pas la suppression.
            $this->error('Refus : ajoutez --force pour exécuter réellement.');
            if ($this->option('allow-student-data-loss')) {
                $this->line('(--allow-student-data-loss ne supprime rien à lui seul.)');
            }

            return self::FAILURE;
        }

        $question = sprintf(
            "Supprimer définitivement %d classe(s), %d chapitre(s), %d leçon(s) et %d point(s) d'apprentissage ?",
            $counts['grades'],
            $counts['chapters'],
            $counts['lessons'],
            $counts['learning_points'],
        );

        if (! $this->confirm($question, false)) {
            $this->info('Annulé.');

            return self::SUCCESS;
        }

        $this->deleteCurriculum($removedGradeIds, $counts, $retained);

        $this->info(sprintf(
            '%d classe(s), %d chapitre(s), %d leçon(s), %d point(s) d\'apprentissage supprimé(s).',
            $counts['grades'],
            $counts['chapters'],
            $counts['lessons'],
            $counts['learning_points'],
        ));
        $this->reportOrphanedUserGrades($retained);

        return self::SUCCESS;
    }

    /**
     * Les codes de classe que le catalogue déclare. L'export est l'autorité —
     * voir l'en-tête de classe.
     *
     * @return string[]|null null si l'export est introuvable ou illisible
     */
    private function retainedGradeCodes(): ?array
    {
        $jsonPath = $this->option('from-json') ?: $this->generateExport();
        if ($jsonPath === null) {
            return null;
        }

        if (! is_file($jsonPath)) {
            $this->error("Export du curriculum introuvable : {$jsonPath}");

            return null;
        }

        $export = json_decode((string) file_get_contents($jsonPath), true);
        if (! is_array($export) || ! isset($export['grades'])) {
            $this->error("L'export n'est pas un JSON valide avec une clé « grades » : {$jsonPath}");

            return null;
        }

        return array_values(array_filter(array_map(
            fn ($g) => $g['code'] ?? null,
            $export['grades']
        )));
    }

    private function generateExport(): ?string
    {
        $script = config('curriculum.export_script_path');
        $output = config('curriculum.export_output_path');

        $result = Process::run(['node', $script, $output]);
        if (! $result->successful()) {
            $this->error("Le script d'export a échoué :\n".$result->errorOutput());
            $this->line('Si Node est indisponible ici, générez l\'export ailleurs et passez --from-json=<chemin>.');

            return null;
        }

        $this->line(trim($result->output()));

        return $output;
    }

    /**
     * Les clés étrangères qui pointent vers le curriculum, lues dans le
     * schéma VIVANT plutôt que supposées. Une table ajoutée après l'écriture
     * de cette commande doit se faire remarquer, pas se faire oublier.
     *
     * @return array<int, array{table: string, column: string, references: string, rule: string}>
     */
    private function undeclaredDependentTables(): array
    {
        $curriculumTables = ['grades', 'chapters', 'lessons', 'learning_points'];

        try {
            $rows = DB::select(
                'SELECT k.TABLE_NAME AS child, k.COLUMN_NAME AS col,
                        k.REFERENCED_TABLE_NAME AS parent, r.DELETE_RULE AS rule
                   FROM information_schema.KEY_COLUMN_USAGE k
                   JOIN information_schema.REFERENTIAL_CONSTRAINTS r
                     ON r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
                    AND r.CONSTRAINT_SCHEMA = k.TABLE_SCHEMA
                  WHERE k.TABLE_SCHEMA = DATABASE()
                    AND k.REFERENCED_TABLE_NAME IN (?, ?, ?, ?)',
                $curriculumTables
            );
        } catch (\Throwable) {
            // SQLite (suite de tests) n'expose pas information_schema. Le
            // contrôle est une sécurité pour MySQL, pas un prérequis.
            return [];
        }

        $undeclared = [];
        foreach ($rows as $row) {
            if (array_key_exists($row->child, self::DEPENDENT_TABLES)) {
                continue;
            }
            $undeclared[] = [
                'table' => $row->child,
                'column' => $row->col,
                'references' => $row->parent,
                'rule' => $row->rule,
            ];
        }

        return $undeclared;
    }

    /**
     * @param  Collection<int, int>  $removedGradeIds
     * @return array<string, mixed>
     */
    private function countCurriculum($removedGradeIds): array
    {
        $chapterIds = DB::table('chapters')->whereIn('grade_id', $removedGradeIds)->pluck('id');
        $lessonIds = DB::table('lessons')->whereIn('chapter_id', $chapterIds)->pluck('id');
        $learningPointIds = DB::table('learning_points')->whereIn('lesson_id', $lessonIds)->pluck('id');

        return [
            'grades' => $removedGradeIds->count(),
            'chapters' => $chapterIds->count(),
            'lessons' => $lessonIds->count(),
            'learning_points' => $learningPointIds->count(),
            'chapter_ids' => $chapterIds,
            'lesson_ids' => $lessonIds,
            'learning_point_ids' => $learningPointIds,
        ];
    }

    /**
     * @param  Collection<int, int>  $lessonIds
     * @param  Collection<int, int>  $learningPointIds
     * @return array<string, int>
     */
    private function countDependents($lessonIds, $learningPointIds): array
    {
        $byLesson = [
            'lesson_modules', 'practice_exercises', 'learning_evidence',
            'student_lesson_progress', 'lesson_final_test_attempts',
            'practice_sessions', 'notebook_notes', 'student_reports',
            'assessment_items', 'classroom_interventions', 'daily_challenge_questions',
            'madar_refuels', 'student_lesson_answers', 'teacher_lab_settings',
        ];

        $counts = [];
        foreach ($byLesson as $table) {
            if (! DB::getSchemaBuilder()->hasTable($table) || ! DB::getSchemaBuilder()->hasColumn($table, 'lesson_id')) {
                continue;
            }
            $counts[$table] = DB::table($table)->whereIn('lesson_id', $lessonIds)->count();
        }

        foreach (['student_learning_point_progress', 'learning_evidence_learning_point', 'assessment_item_learning_point', 'learning_point_state_transitions'] as $table) {
            if (! DB::getSchemaBuilder()->hasTable($table)) {
                continue;
            }
            $counts[$table] = DB::table($table)->whereIn('learning_point_id', $learningPointIds)->count();
        }

        foreach (['notebook_notes', 'classroom_interventions'] as $table) {
            if (DB::getSchemaBuilder()->hasTable($table)) {
                $counts[$table] = ($counts[$table] ?? 0)
                    + DB::table($table)->whereIn('learning_point_id', $learningPointIds)->count();
            }
        }

        return $counts;
    }

    /**
     * @param  string[]  $retained
     * @param  string[]  $removedCodes
     * @param  array<string, mixed>  $counts
     */
    private function renderInventory(array $retained, array $removedCodes, array $counts): void
    {
        $keptGradeIds = DB::table('grades')->whereIn('code', $retained)->pluck('id');
        $keptChapters = DB::table('chapters')->whereIn('grade_id', $keptGradeIds);
        $keptChapterIds = (clone $keptChapters)->pluck('id');
        $keptLessonIds = DB::table('lessons')->whereIn('chapter_id', $keptChapterIds)->pluck('id');

        $this->newLine();
        $this->table(
            ['', 'Conservé', 'Supprimé'],
            [
                ['classes', $keptGradeIds->count(), $counts['grades']],
                ['chapitres', $keptChapterIds->count(), $counts['chapters']],
                ['leçons', $keptLessonIds->count(), $counts['lessons']],
                ['points d\'apprentissage', DB::table('learning_points')->whereIn('lesson_id', $keptLessonIds)->count(), $counts['learning_points']],
            ]
        );

        if ($removedCodes !== []) {
            $this->line('Classes supprimées : '.implode(', ', $removedCodes));
        }
    }

    /** @param array<string, int> $dependents */
    private function renderDependents(array $dependents): void
    {
        $this->newLine();
        $this->line('Lignes dépendantes atteintes par la suppression :');
        foreach ($dependents as $table => $n) {
            $mode = self::DEPENDENT_TABLES[$table] ?? 'cascade';
            $effect = $mode === 'set_null' ? 'lien coupé, ligne conservée' : 'ligne supprimée';
            $this->line(sprintf('  %-36s %5d  (%s)', $table, $n, $effect));
        }
        $this->newLine();
    }

    /**
     * La suppression, explicitement dans l'ordre des dépendances plutôt qu'en
     * s'en remettant à la cascade : les nombres deviennent observables, et
     * l'ordre est écrit dans le dépôt au lieu d'être une propriété du schéma
     * que personne ne relit.
     *
     * @param  Collection<int, int>  $removedGradeIds
     * @param  array<string, mixed>  $counts
     * @param  string[]  $retained
     */
    private function deleteCurriculum($removedGradeIds, array $counts, array $retained): void
    {
        DB::transaction(function () use ($removedGradeIds, $counts, $retained) {
            DB::table('learning_points')->whereIn('id', $counts['learning_point_ids'])->delete();
            DB::table('lessons')->whereIn('id', $counts['lesson_ids'])->delete();
            DB::table('chapters')->whereIn('id', $counts['chapter_ids'])->delete();
            DB::table('grades')->whereIn('id', $removedGradeIds)->delete();

            // ── L'assertion, DANS la transaction ────────────────────────
            // Vérifier après coup laisserait une base à moitié nettoyée si
            // le résultat n'était pas celui attendu. Ici, il n'y a que deux
            // issues : le périmètre voulu, ou rien.
            $remaining = DB::table('grades')->pluck('code')->all();
            sort($remaining);
            $expected = $retained;
            sort($expected);
            if ($remaining !== $expected) {
                throw new \RuntimeException(
                    'Après suppression, les classes en base ('.implode(', ', $remaining).
                    ') ne correspondent pas au catalogue ('.implode(', ', $expected).'). Transaction annulée.'
                );
            }

            $orphanChapters = DB::table('chapters')
                ->leftJoin('grades', 'grades.id', '=', 'chapters.grade_id')
                ->whereNull('grades.id')->count();
            $orphanLessons = DB::table('lessons')
                ->leftJoin('chapters', 'chapters.id', '=', 'lessons.chapter_id')
                ->whereNull('chapters.id')->count();
            $orphanPoints = DB::table('learning_points')
                ->leftJoin('lessons', 'lessons.id', '=', 'learning_points.lesson_id')
                ->whereNull('lessons.id')->count();

            if ($orphanChapters || $orphanLessons || $orphanPoints) {
                throw new \RuntimeException(
                    "Lignes orphelines après suppression (chapitres: {$orphanChapters}, ".
                    "leçons: {$orphanLessons}, points: {$orphanPoints}). Transaction annulée."
                );
            }
        });
    }

    /**
     * `users.grade` est une chaîne libre, sans clé étrangère : elle ne casse
     * pas, elle pend. On le DIT, sans toucher aux comptes — reclasser un
     * élève est une décision produit, pas un effet de bord de nettoyage.
     *
     * @param  string[]  $retained
     */
    private function reportOrphanedUserGrades(array $retained): void
    {
        if (! DB::getSchemaBuilder()->hasColumn('users', 'grade')) {
            return;
        }

        $orphans = DB::table('users')
            ->whereNotNull('grade')
            ->whereNotIn('grade', $retained)
            ->select('grade', DB::raw('COUNT(*) as n'))
            ->groupBy('grade')
            ->get();

        if ($orphans->isEmpty()) {
            $this->line('Aucun compte élève ne référence une classe supprimée.');

            return;
        }

        $this->newLine();
        $this->warn('Comptes élèves référençant une classe qui n\'existe plus (users.grade, sans clé étrangère) :');
        foreach ($orphans as $row) {
            $this->line(sprintf('  %-28s %d compte(s)', $row->grade, $row->n));
        }
        $this->line('Aucun compte n\'a été modifié. Leur reclassement est une décision produit.');
    }
}
