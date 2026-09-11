<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\ContentAccess;
use App\Domain\Access\EntitlementService;
use App\Models\Chapter;
use App\Models\Entitlement;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\StudentLearningPointProgress;
use App\Models\StudentLessonProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Ce que l'introduction des droits d'accès ne doit PAS avoir cassé.
 *
 * Le risque propre à ce chantier n'est pas qu'un contenu payant s'ouvre —
 * il n'en existe aucun. C'est qu'un contenu GRATUIT se ferme, silencieusement,
 * pour 133 leçons à la fois. Ces tests sont écrits contre ce risque-là.
 */
class EntitlementRegressionTest extends TestCase
{
    use RefreshDatabase;

    /** Les niveaux réellement présents au catalogue. */
    public static function grades(): array
    {
        return [
            '6e' => ['6e', 'college'],
            '5e' => ['5e', 'college'],
            '4e' => ['4e', 'college'],
            '3e' => ['3e', 'college'],
            '2nde' => ['seconde', 'lycee'],
            '1ere' => ['premiere', 'lycee'],
            'terminale' => ['terminale', 'lycee'],
        ];
    }

    /**
     * Une leçon gratuite et publiée reste écrivable, à chaque niveau, pour un
     * élève qui n'a aucun droit d'accès en base.
     */
    #[DataProvider('grades')]
    public function test_free_lessons_stay_open_at_every_grade(string $gradeCode, string $level): void
    {
        $grade = Grade::create(['code' => $gradeCode, 'name' => $gradeCode, 'level' => $level]);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ch', 'title' => 'Chapitre', 'order' => 0]);
        $lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => "lecon-{$gradeCode}", 'title' => 'Leçon',
            'status' => 'available', 'order' => 0, 'tier' => 'free',
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);
        LessonModule::create([
            'lesson_id' => $lesson->id, 'code' => '01', 'number' => 1,
            'title' => 'M1', 'publication_status' => LessonModule::PUB_PUBLISHED,
        ]);
        LearningPoint::create([
            'lesson_id' => $lesson->id, 'code' => "{$gradeCode}_lecon_P1", 'title' => 'P1', 'order' => 1,
        ]);

        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => $gradeCode]);

        $this->assertDatabaseCount('entitlements', 0);

        $this->withToken($student->createToken('t')->plainTextToken)
            ->putJson("/api/v1/lessons/{$lesson->code}/progress", [
                'completedModules' => ['1'], 'currentModule' => 1,
                'status' => 'in_progress', 'lastActivityAt' => Carbon::now()->toIso8601String(),
            ])
            ->assertOk();
    }

    /**
     * Une leçon ABSENTE du registre reste ouverte.
     *
     * Comportement existant, préservé volontairement : la base miroite le
     * contenu, elle n'en est pas l'autorité. Le palier ne doit pas devenir
     * une deuxième façon de fermer ce qui n'est simplement pas encore importé.
     */
    public function test_unregistered_lesson_stays_open(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);

        ContentAccess::assertLessonAvailable('lecon-jamais-importee', $student);
        $this->assertTrue(true);
    }

    /**
     * Perdre son accès n'efface AUCUN apprentissage (spec §38, §42).
     *
     * C'est l'invariant que l'on vérifie le plus volontiers « à l'œil » et
     * qui casse le plus discrètement : une suppression en cascade posée un
     * jour sur entitlements emporterait un historique irremplaçable.
     */
    public function test_losing_access_never_touches_progress(): void
    {
        $grade = Grade::create(['code' => '3e', 'name' => '3e', 'level' => 'college']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ch', 'title' => 'Ch', 'order' => 0]);
        $lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'lecon-premium', 'title' => 'Leçon',
            'status' => 'available', 'order' => 0, 'tier' => 'premium',
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);
        $point = LearningPoint::create([
            'lesson_id' => $lesson->id, 'code' => '3e_lecon_P1', 'title' => 'P1', 'order' => 1,
        ]);
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '3e']);
        $entitlement = Entitlement::factory()->subscription()->create(['user_id' => $student->id]);

        StudentLessonProgress::create([
            'user_id' => $student->id, 'lesson_id' => $lesson->id,
            'completed_modules' => ['1', '2'], 'current_module' => 2,
            'status' => 'in_progress', 'last_activity_at' => Carbon::now(),
        ]);
        StudentLearningPointProgress::create([
            'user_id' => $student->id, 'learning_point_id' => $point->id,
            'status' => 'mastered', 'confidence' => 0.9,
        ]);

        // L'abonnement tombe.
        $entitlement->update(['status' => Entitlement::STATUS_REVOKED]);
        app(EntitlementService::class)->forget();

        $this->assertFalse(app(EntitlementService::class)->satisfies($student, AccessTier::PREMIUM));

        // L'apprentissage, lui, est intact.
        $this->assertDatabaseHas('student_lesson_progress', [
            'user_id' => $student->id, 'lesson_id' => $lesson->id, 'current_module' => 2,
        ]);
        $this->assertDatabaseHas('student_learning_point_progress', [
            'user_id' => $student->id, 'learning_point_id' => $point->id, 'status' => 'mastered',
        ]);

        // Et il reste LISIBLE : ce que l'élève a fait lui appartient, même
        // quand l'accès au contenu se referme (politique de lecture existante).
        $this->withToken($student->createToken('t')->plainTextToken)
            ->getJson('/api/v1/students/me/lesson-progress')
            ->assertOk();

        // L'accès revient : rien n'a été réinitialisé.
        $entitlement->update(['status' => Entitlement::STATUS_ACTIVE]);
        app(EntitlementService::class)->forget();

        $this->assertTrue(app(EntitlementService::class)->satisfies($student, AccessTier::PREMIUM));
        $this->assertDatabaseHas('student_lesson_progress', [
            'user_id' => $student->id, 'lesson_id' => $lesson->id, 'current_module' => 2,
        ]);
    }

    /**
     * Le catalogue réel est intégralement gratuit : l'inventaire des
     * verrouillages est VIDE.
     *
     * Si ce test se met un jour à échouer, c'est qu'une leçon est devenue
     * payante — ce qui doit être une décision, jamais une surprise.
     */
    public function test_nothing_is_locked_in_a_free_catalogue(): void
    {
        $grade = Grade::create(['code' => '6e', 'name' => '6e', 'level' => 'college']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ch', 'title' => 'Ch', 'order' => 0]);
        foreach (['a', 'b', 'c'] as $i => $code) {
            Lesson::create([
                'chapter_id' => $chapter->id, 'code' => "lecon-{$code}", 'title' => 'L',
                'status' => 'available', 'order' => $i, 'tier' => 'free',
                'publication_status' => Lesson::PUB_PUBLISHED,
            ]);
        }
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);

        $inventory = ContentAccess::closedInventory($student);

        $this->assertSame([], $inventory['locked']);
        $this->assertSame([], $inventory['lessons']);
    }

    /** Le défaut de colonne est GRATUIT : une leçon créée sans palier reste ouverte. */
    public function test_column_default_is_free(): void
    {
        $grade = Grade::create(['code' => '4e', 'name' => '4e', 'level' => 'college']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ch', 'title' => 'Ch', 'order' => 0]);

        // Aucun `tier` passé — exactement le cas de l'oubli au catalogue.
        $lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'lecon-sans-palier', 'title' => 'L',
            'status' => 'available', 'order' => 0,
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);

        $this->assertSame('free', $lesson->fresh()->tier);

        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        ContentAccess::assertLessonAvailable('lecon-sans-palier', $student);
        $this->assertTrue(true);
    }
}
