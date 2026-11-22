<?php

namespace Tests\Feature\Scale;

use App\Domain\Classroom\ClassroomLearningPointService;
use App\Domain\Content\AssessmentItemRepository;
use App\Domain\Practice\ExerciseRepository;
use App\Domain\Practice\ExerciseSelector;
use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\ProgressEngine;
use App\Domain\Progress\Replay\ReplayService;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\LearningPoint;
use App\Models\PracticeSession;
use App\Models\StudentLearningPointProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * La banque d'exercices grandit, l'architecture de maîtrise ne bouge pas
 * (Mastery V2, §40 du plan).
 *
 * Même leçon, 5 learning points, 5 niveaux, et 3 → 40 → 100 → 500 exercices
 * par niveau. Pour chaque taille, on mesure le NOMBRE DE REQUÊTES de chaque
 * chemin chaud — écrire une réponse, lire le profil d'une leçon, agréger la
 * classe × point, choisir l'exercice suivant, rejouer un couple — et on
 * exige qu'il soit IDENTIQUE d'une taille à l'autre. Le moteur reçoit les
 * mêmes preuves et doit produire le même état. La table d'état reste bornée
 * par élèves × points, jamais par élèves × exercices.
 *
 * Les durées (ms) sont écrites dans storage/logs/mastery-scale.json pour le
 * rapport ; elles ne sont pas assertées (elles dépendent de la machine).
 */
class MasteryScaleTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    private const LEVELS = 5;

    private const STUDENTS = 12;

    /** @var array<string, array<string, int>> requêtes par chemin, par taille */
    private static array $queries = [];

    /** @var array<string, array<string, mixed>> */
    private static array $report = [];

    public static function banks(): array
    {
        return [
            'A — 5 × 3' => [3],
            'B — 5 × 40' => [40],
            'C — 5 × 100' => [100],
            'Stress — 5 × 500' => [500],
        ];
    }

    #[DataProvider('banks')]
    public function test_hot_paths_do_constant_work_whatever_the_bank_size(int $perLevel): void
    {
        config(['mastery.engine_version' => 2]);
        Cache::flush();
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $lesson = $lessons[0];
        $lps = collect(range(1, 5))->map(fn ($i) => LearningPoint::create([
            'lesson_id' => $lesson->id, 'code' => "4am_{$lesson->code}_P{$i}", 'title' => "P{$i}", 'order' => $i,
        ]));

        // ── La banque : perLevel × 5 exercices, une question chacun ──────────
        $index = [];
        $now = now();
        $itemRows = [];
        $meta = [];
        for ($level = 1; $level <= self::LEVELS; $level++) {
            for ($i = 1; $i <= $perLevel; $i++) {
                $code = sprintf('ex-scale-l%d-%03d', $level, $i);
                $index[$level][] = $code;
                $lp = $lps[($i - 1) % 5];
                $key = "practice:{$lesson->code}:{$code}:q1";
                $itemRows[] = [
                    'lesson_id' => $lesson->id, 'item_key' => $key, 'source_kind' => 'practice', 'exercise_code' => $code,
                    'question_id' => 'q1', 'template_key' => "tpl-scale-{$level}-".($i % 6), 'difficulty' => $level,
                    'answer_type' => 'rational', 'learning_points' => json_encode([['code' => $lp->code, 'role' => 'primary']]),
                    'answer_key' => json_encode(['answerType' => 'rational', 'expectedAnswer' => '6']), 'evaluation' => 'server',
                    'content_version' => sha1($key), 'publication_status' => 'published', 'created_at' => $now, 'updated_at' => $now,
                ];
                $meta[$key] = $lp->id;
            }
        }
        $t = microtime(true);
        foreach (array_chunk($itemRows, 500) as $chunk) {
            DB::table('assessment_items')->insert($chunk);
        }
        $ids = DB::table('assessment_items')->where('lesson_id', $lesson->id)->pluck('id', 'item_key');
        $pivot = [];
        foreach ($meta as $key => $lpId) {
            $pivot[] = ['assessment_item_id' => $ids[$key], 'learning_point_id' => $lpId, 'role' => 'primary', 'created_at' => $now, 'updated_at' => $now];
        }
        foreach (array_chunk($pivot, 500) as $chunk) {
            DB::table('assessment_item_learning_point')->insert($chunk);
        }
        $registryMs = (int) round((microtime(true) - $t) * 1000);

        // Le contenu, tel que l'index le verrait — sans fichiers.
        $this->app->instance(ExerciseRepository::class, new class($index) extends ExerciseRepository
        {
            public function __construct(private array $index) {}

            public function indexFor(string $lessonCode): array
            {
                return $this->index;
            }
        });
        $this->app->forgetInstance(ExerciseSelector::class);

        // ── Une classe, douze élèves, le même parcours pour chaque taille ────
        $classroom = Classroom::factory()->create();
        $students = collect(range(1, self::STUDENTS))->map(fn () => $this->student(['grade' => '4am']));
        foreach ($students as $s) {
            ClassroomMembership::factory()->in($classroom)->of($s)->create();
        }

        $engine = app(ProgressEngine::class);
        // Préchauffe le compte d'items par point (cache), comme en production.
        foreach ($lps as $lp) {
            app(AssessmentItemRepository::class)->availableItemsForLearningPoint($lp->id);
        }

        // Chaque élève : 8 réponses sur les 3 premiers exercices de chaque
        // niveau — toujours les MÊMES items, quelle que soit la taille.
        $answer = function ($student, int $n) use ($engine, $lesson, $lps) {
            $level = ($n % self::LEVELS) + 1;
            $i = ($n % 3) + 1;
            $code = sprintf('ex-scale-l%d-%03d', $level, $i);
            $engine->recordEvidence($student, $lesson->code, [
                'attemptId' => (string) Str::uuid(), 'exerciseCode' => $code, 'questionId' => 'q1',
                'assessmentType' => ProgressEngine::SOURCE_PRACTICE, 'outcome' => $n % 4 === 3 ? 'incorrect' : 'correct',
                'learningPointRefs' => [['code' => $lps[($i - 1) % 5]->code, 'role' => 'primary']],
                'level' => $level, 'evaluatedBy' => EvidenceEvent::EVALUATED_BY_SERVER,
            ]);
        };
        foreach ($students as $s) {
            for ($n = 0; $n < 7; $n++) {
                $answer($s, $n);
            }
        }

        $probe = $students->first();
        $counts = [];

        // 1. Écrire UNE réponse.
        $t = microtime(true);
        $counts['answerWrite'] = $this->countQueries(fn () => $answer($probe, 7));
        $writeMs = round((microtime(true) - $t) * 1000, 1);

        // 2. Lire le profil d'UNE leçon.
        $token = $this->tokenOf($probe);
        $t = microtime(true);
        $counts['lessonProfile'] = $this->countQueries(fn () => $this->withToken($token)->getJson("/api/v1/students/me/learning-profile?lesson={$lesson->code}")->assertOk());
        $profileMs = round((microtime(true) - $t) * 1000, 1);

        // 3. Classe × learning point.
        $service = app(ClassroomLearningPointService::class);
        $t = microtime(true);
        $counts['classByLp'] = $this->countQueries(fn () => $service->map($classroom, $lesson->code));
        $classMs = round((microtime(true) - $t) * 1000, 1);

        // 4. Choisir l'exercice suivant (le seul chemin qui DOIT lire la banque — un niveau).
        $session = PracticeSession::create([
            'session_id' => (string) Str::uuid(), 'user_id' => $probe->id, 'lesson_id' => $lesson->id,
            'level' => 3, 'status' => 'open', 'started_at' => now(),
        ]);
        $t = microtime(true);
        $selected = null;
        $counts['selector'] = $this->countQueries(function () use ($session, &$selected) {
            $selected = app(ExerciseSelector::class)->next($session);
        });
        $selectorMs = round((microtime(true) - $t) * 1000, 1);
        $this->assertNotNull($selected['exerciseId']);
        $this->assertSame($perLevel, $selected['candidates'], 'le sélecteur voit UN niveau, pas la banque');

        // 5. Rejouer un couple.
        $replay = app(ReplayService::class);
        $t = microtime(true);
        $counts['replayPair'] = $this->countQueries(fn () => $replay->replay($probe->id, $lps[0]->id));
        $replayMs = round((microtime(true) - $t) * 1000, 1);
        $this->assertTrue($replay->matchesStored($probe->id, $lps[0]->id));

        // ── Invariants ───────────────────────────────────────────────────────
        $stateRows = StudentLearningPointProgress::count();
        $this->assertLessThanOrEqual(self::STUDENTS * 5, $stateRows, 'état borné par élèves × points');
        $state = StudentLearningPointProgress::where('user_id', $probe->id)->where('learning_point_id', $lps[0]->id)->first();

        $signature = [
            'confidence' => (float) $state->confidence,
            'status' => $state->status,
            'distinct' => (int) $state->distinct_items_success,
            'rows' => $stateRows,
        ];

        if (self::$queries !== []) {
            $first = array_key_first(self::$queries);
            $this->assertSame(self::$queries[$first]['counts'], $counts, "même travail qu'en {$first}");
            $this->assertSame(self::$queries[$first]['signature'], $signature, "même état qu'en {$first}");
        }
        self::$queries["{$perLevel}/level"] = ['counts' => $counts, 'signature' => $signature];

        self::$report["{$perLevel}/level"] = [
            'exercises' => $perLevel * self::LEVELS,
            'items' => count($itemRows),
            'stateRows' => $stateRows,
            'queries' => $counts,
            'ms' => ['registryInsert' => $registryMs, 'answerWrite' => $writeMs, 'lessonProfile' => $profileMs,
                'classByLp' => $classMs, 'selector' => $selectorMs, 'replayPair' => $replayMs],
            'state' => $signature,
        ];
        @file_put_contents(storage_path('logs/mastery-scale.json'), json_encode(self::$report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    private function countQueries(callable $fn): int
    {
        $n = 0;
        DB::listen(function () use (&$n) {
            $n++;
        });
        $before = $n;
        $fn();

        return $n - $before;
    }
}
