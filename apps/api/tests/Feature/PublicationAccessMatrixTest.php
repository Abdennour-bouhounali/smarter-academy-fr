<?php

namespace Tests\Feature;

use App\Domain\Practice\PracticeCapability;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\LearningEvidence;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use App\Models\StudentLessonProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * La matrice de publication, prise au mot.
 *
 * L'invariant : SEUL « published » ouvre, aux trois niveaux, et sur tous les
 * chemins d'écriture. Un état de publication qui ne ferme rien ne vaut pas
 * mieux que l'ancien `lessons.status`, dont la migration avouait
 * « informational only, not enforced against anything ».
 */
class PublicationAccessMatrixTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    private LessonModule $module;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => 'seconde', 'name' => 'Seconde', 'level' => 'lycee']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'fonctions', 'title' => 'Fonctions', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fonction-affine-2nde',
            'title' => 'Fonction affine', 'status' => 'available', 'order' => 0,
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);
        $this->module = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '01', 'number' => 1,
            'title' => 'Découvrir', 'publication_status' => LessonModule::PUB_PUBLISHED,
        ]);
        LearningPoint::create([
            'lesson_id' => $this->lesson->id, 'code' => 'seconde_fonction-affine-2nde_P1',
            'title' => 'Reconnaître une fonction affine', 'order' => 1,
        ]);

        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => 'seconde']);
        PracticeCapability::forget();
    }

    private function asStudent(): self
    {
        return $this->actingAs($this->student, 'sanctum');
    }

    /** @return array<string, array{string, bool}> */
    public static function publicationStates(): array
    {
        return [
            'brouillon' => [Lesson::PUB_DRAFT, false],
            'publié' => [Lesson::PUB_PUBLISHED, true],
            'masqué' => [Lesson::PUB_HIDDEN, false],
            'archivé' => [Lesson::PUB_ARCHIVED, false],
        ];
    }

    // ---------------------------------------------------------------- LEÇON

    #[DataProvider('publicationStates')]
    public function test_matrice_lecon_progression(string $status, bool $accessible): void
    {
        $this->lesson->update(['publication_status' => $status]);

        $response = $this->asStudent()->putJson('/api/v1/lessons/fonction-affine-2nde/progress', [
            'completedModules' => [],
            'currentModule' => 1,
            'status' => 'in_progress',
            'lastActivityAt' => now()->toIso8601String(),
        ]);

        $this->assertSame($accessible ? 200 : 422, $response->status(), "état {$status}");
    }

    #[DataProvider('publicationStates')]
    public function test_matrice_lecon_preuve(string $status, bool $accessible): void
    {
        $this->lesson->update(['publication_status' => $status]);

        $response = $this->asStudent()->postJson('/api/v1/lessons/fonction-affine-2nde/evidence', [
            'questionCode' => 'q1',
            'attemptId' => (string) Str::uuid(),
            'isCorrect' => true,
            'learningPointCodes' => ['seconde_fonction-affine-2nde_P1'],
        ]);

        // Publié : 200/201. Fermé : 422, et surtout AUCUNE preuve enregistrée.
        $this->assertSame($accessible, $response->status() < 400, "état {$status}");
        $this->assertSame($accessible ? 1 : 0, LearningEvidence::count(), "état {$status}");
    }

    #[DataProvider('publicationStates')]
    public function test_matrice_lecon_test_final(string $status, bool $accessible): void
    {
        $this->lesson->update(['publication_status' => $status]);

        $response = $this->asStudent()->putJson('/api/v1/lessons/fonction-affine-2nde/final-test-attempt', [
            'score' => 4, 'totalQuestions' => 5, 'answers' => [], 'submittedAt' => now()->toIso8601String(),
        ]);

        $this->assertSame($accessible, $response->status() < 400, "état {$status}");
    }

    // --------------------------------------------------------------- MODULE

    /**
     * Le module a son propre état : masquer UN module ne ferme pas la leçon,
     * et publier la leçon ne publie aucun module.
     */
    #[DataProvider('publicationStates')]
    public function test_matrice_module(string $status, bool $accessible): void
    {
        $this->module->update(['publication_status' => $status]);

        $response = $this->asStudent()->putJson('/api/v1/lessons/fonction-affine-2nde/progress', [
            'completedModules' => ['1'],
            'currentModule' => 1,
            'status' => 'in_progress',
            'lastActivityAt' => now()->toIso8601String(),
        ]);

        $this->assertSame($accessible ? 200 : 422, $response->status(), "module {$status}");
    }

    /** Pas de cascade : leçon publiée + module brouillon = module fermé. */
    public function test_publier_la_lecon_ne_publie_pas_ses_modules(): void
    {
        $this->module->update(['publication_status' => LessonModule::PUB_DRAFT]);
        $this->lesson->update(['publication_status' => Lesson::PUB_PUBLISHED]);

        $this->asStudent()->putJson('/api/v1/lessons/fonction-affine-2nde/progress', [
            'completedModules' => ['1'],
            'currentModule' => 1,
            'status' => 'in_progress',
            'lastActivityAt' => now()->toIso8601String(),
        ])->assertStatus(422);
    }

    /**
     * Le piège qu'il fallait éviter : `completedModules` est une union
     * monotone renvoyée en entier à chaque sauvegarde. Masquer un module
     * DÉJÀ terminé ne doit pas empêcher l'élève d'enregistrer la suite.
     */
    public function test_masquer_un_module_deja_termine_n_empeche_pas_de_progresser(): void
    {
        StudentLessonProgress::create([
            'user_id' => $this->student->id,
            'lesson_id' => $this->lesson->id,
            'status' => 'in_progress',
            'completed_modules' => ['1'],
            'last_activity_at' => now()->subDay(),
        ]);
        LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '02', 'number' => 2,
            'title' => 'Suite', 'publication_status' => LessonModule::PUB_PUBLISHED,
        ]);

        $this->module->update(['publication_status' => LessonModule::PUB_HIDDEN]);

        $this->asStudent()->putJson('/api/v1/lessons/fonction-affine-2nde/progress', [
            'completedModules' => ['1', '2'],
            'currentModule' => 2,
            'status' => 'in_progress',
            'lastActivityAt' => now()->toIso8601String(),
        ])->assertStatus(200);

        $this->assertContains('2', StudentLessonProgress::first()->completed_modules);
    }

    // ------------------------------------------------------------- EXERCICE

    #[DataProvider('publicationStates')]
    public function test_matrice_exercice_listage(string $status, bool $listed): void
    {
        PracticeExercise::create([
            'lesson_id' => $this->lesson->id,
            'exercise_code' => 'ex-2de-fonction-affine-l1-001',
            'level' => 1, 'publication_status' => $status,
        ]);

        $response = $this->asStudent()
            ->getJson('/api/v1/lessons/fonction-affine-2nde/exercises')
            ->assertStatus(200);

        $codes = collect($response->json('exercises'))->pluck('exerciseCode');
        $this->assertSame($listed, $codes->contains('ex-2de-fonction-affine-l1-001'), "état {$status}");
    }

    /** Une leçon fermée ne liste aucun exercice, quel que soit leur état. */
    public function test_une_lecon_fermee_ne_liste_aucun_exercice(): void
    {
        PracticeExercise::create([
            'lesson_id' => $this->lesson->id, 'exercise_code' => 'ex-a', 'level' => 1,
            'publication_status' => PracticeExercise::PUB_PUBLISHED,
        ]);
        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);

        $this->asStudent()->getJson('/api/v1/lessons/fonction-affine-2nde/exercises')
            ->assertStatus(200)
            ->assertJsonPath('available', false)
            ->assertJsonPath('reason', 'lesson_unavailable')
            ->assertJsonCount(0, 'exercises');
    }

    // --------------------------------------------------- INVENTAIRE FERMÉ

    public function test_l_inventaire_des_fermetures_reflete_la_publication(): void
    {
        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);
        $this->module->update(['publication_status' => LessonModule::PUB_DRAFT]);

        $this->asStudent()->getJson('/api/v1/content/availability')
            ->assertStatus(200)
            ->assertJsonPath('closed.lessons', ['fonction-affine-2nde'])
            ->assertJsonPath('closed.modules.fonction-affine-2nde', [1]);
    }

    public function test_rien_n_est_ferme_quand_tout_est_publie(): void
    {
        $this->asStudent()->getJson('/api/v1/content/availability')
            ->assertStatus(200)
            ->assertJsonPath('closed.lessons', [])
            ->assertJsonPath('closed.modules', []);
    }

    /** Un visiteur non connecté n'atteint pas l'inventaire. */
    public function test_l_inventaire_exige_une_session(): void
    {
        $this->getJson('/api/v1/content/availability')->assertStatus(401);
    }

    /**
     * Un code de leçon se répète d'une classe à l'autre : la 6e masquée ne
     * doit pas fermer la 3e.
     */
    public function test_l_homonyme_publie_garde_la_lecon_ouverte(): void
    {
        $other = Grade::create(['code' => '3e', 'name' => 'Troisième', 'level' => 'college']);
        $otherChapter = Chapter::create(['grade_id' => $other->id, 'code' => 'fonctions', 'title' => 'F', 'order' => 0]);
        Lesson::create([
            'chapter_id' => $otherChapter->id, 'code' => 'fonction-affine-2nde',
            'title' => 'Homonyme', 'status' => 'available', 'order' => 0,
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);

        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);

        $this->asStudent()->getJson('/api/v1/content/availability')
            ->assertStatus(200)
            ->assertJsonPath('closed.lessons', []);
    }
}
