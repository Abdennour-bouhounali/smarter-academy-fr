<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Admin\ActivityLogger;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\PracticeExercise;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Le palier commercial : qui le change, et comment il se combine.
 *
 * L'invariant qui structure ce fichier : palier et publication sont
 * INDÉPENDANTS. Changer l'un ne doit jamais bouger l'autre — sinon on ne
 * pourrait plus vendre une leçon sans la republier, ni la retirer sans la
 * rendre gratuite.
 */
class ContentTierControlTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Lesson $lesson;

    private PracticeExercise $exercise;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => '3e', 'name' => '3e', 'level' => 'college']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'fonctions', 'title' => 'Fonctions', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fonction-affine-3e', 'title' => 'Fonction affine',
            'status' => 'available', 'order' => 0, 'tier' => 'free',
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);
        $this->exercise = PracticeExercise::create([
            'lesson_id' => $this->lesson->id, 'exercise_code' => 'ex-01', 'level' => 1,
            'title' => 'Exercice 1', 'publication_status' => PracticeExercise::PUB_PUBLISHED,
        ]);

        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->token = $this->admin->createToken('t')->plainTextToken;
    }

    public function test_admin_can_move_a_lesson_between_tiers(): void
    {
        $this->withToken($this->token)
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/tier", ['tier' => 'premium'])
            ->assertOk()
            ->assertJsonPath('tier', 'premium')
            // La publication n'a PAS bougé.
            ->assertJsonPath('publicationStatus', Lesson::PUB_PUBLISHED);

        $this->assertSame('premium', $this->lesson->fresh()->tier);

        $this->withToken($this->token)
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/tier", ['tier' => 'free'])
            ->assertOk()
            ->assertJsonPath('tier', 'free');

        $this->assertSame('free', $this->lesson->fresh()->tier);
    }

    public function test_changing_tier_never_changes_publication(): void
    {
        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);

        $this->withToken($this->token)
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/tier", ['tier' => 'premium'])
            ->assertOk();

        // Masquée ET payante : les quatre combinaisons ont un sens.
        $this->assertSame(Lesson::PUB_HIDDEN, $this->lesson->fresh()->publication_status);
        $this->assertSame('premium', $this->lesson->fresh()->tier);
    }

    public function test_changing_publication_never_changes_tier(): void
    {
        $this->lesson->update(['tier' => 'premium']);

        $this->withToken($this->token)
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/status", ['status' => Lesson::PUB_HIDDEN])
            ->assertOk();

        $this->assertSame('premium', $this->lesson->fresh()->tier);
    }

    public function test_exercise_tier_can_be_set_and_reset_to_inherit(): void
    {
        $this->withToken($this->token)
            ->patchJson("/api/v1/admin/content/exercise/{$this->exercise->id}/tier", ['tier' => 'premium'])
            ->assertOk()
            ->assertJsonPath('tier', 'premium');

        // null = « hérite de la leçon », et c'est une valeur valide ici.
        $this->withToken($this->token)
            ->patchJson("/api/v1/admin/content/exercise/{$this->exercise->id}/tier", ['tier' => null])
            ->assertOk()
            ->assertJsonPath('tier', null);

        $this->assertNull($this->exercise->fresh()->tier);
    }

    /** Une leçon doit porter un palier explicite : elle n'a rien dont hériter. */
    public function test_lesson_tier_cannot_be_null(): void
    {
        $this->withToken($this->token)
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/tier", ['tier' => null])
            ->assertStatus(422);

        $this->assertSame('free', $this->lesson->fresh()->tier);
    }

    public function test_unknown_tier_is_refused(): void
    {
        $this->withToken($this->token)
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/tier", ['tier' => 'gold'])
            ->assertStatus(422);

        $this->assertSame('free', $this->lesson->fresh()->tier);
    }

    /** Les modules n'ont pas de palier : un module suit sa leçon. */
    public function test_module_has_no_tier_route(): void
    {
        $this->withToken($this->token)
            ->patchJson('/api/v1/admin/content/module/1/tier', ['tier' => 'premium'])
            ->assertStatus(404);
    }

    public function test_tier_changes_are_audited(): void
    {
        $this->withToken($this->token)
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/tier", ['tier' => 'premium'])
            ->assertOk();

        $this->assertDatabaseHas('admin_activity_logs', [
            'user_id' => $this->admin->id,
            'action' => ActivityLogger::TIER_LESSON,
            'entity_type' => 'lesson',
            'entity_id' => (string) $this->lesson->id,
        ]);
    }

    public function test_student_cannot_change_a_tier(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);

        $this->withToken($student->createToken('t')->plainTextToken)
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/tier", ['tier' => 'free'])
            ->assertStatus(403);
    }

    public function test_guest_cannot_change_a_tier(): void
    {
        $this->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/tier", ['tier' => 'free'])
            ->assertStatus(401);
    }

    /**
     * La règle de palier EFFECTIF d'un exercice — la table de vérité
     * complète, y compris le cas qui existe pour ouvrir une démonstration
     * sous une leçon vendue.
     *
     * @return array<string, array{0: ?string, 1: string, 2: string}>
     */
    public static function effectiveTiers(): array
    {
        return [
            'hérite du gratuit' => [null, 'free', 'free'],
            'hérite du payant' => [null, 'premium', 'premium'],
            'payant sous leçon gratuite' => ['premium', 'free', 'premium'],
            'gratuit sous leçon payante' => ['free', 'premium', 'free'],
            'payant sous leçon payante' => ['premium', 'premium', 'premium'],
            'chaîne vide = hérite' => ['', 'premium', 'premium'],
            'palier inconnu = gratuit' => ['gold', 'premium', 'free'],
        ];
    }

    #[DataProvider('effectiveTiers')]
    public function test_effective_tier_rule(?string $exerciseTier, string $lessonTier, string $expected): void
    {
        $this->assertSame($expected, AccessTier::effective($exerciseTier, $lessonTier));
    }

    /**
     * Repasser une leçon en gratuit NE touche PAS un exercice explicitement
     * payant : l'intention de l'administrateur survit (spec Part H).
     */
    public function test_reverting_a_lesson_to_free_preserves_an_explicitly_premium_exercise(): void
    {
        $this->withToken($this->token)
            ->patchJson("/api/v1/admin/content/exercise/{$this->exercise->id}/tier", ['tier' => 'premium'])
            ->assertOk();
        $this->withToken($this->token)
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/tier", ['tier' => 'premium'])
            ->assertOk();

        // La leçon redevient gratuite.
        $this->withToken($this->token)
            ->patchJson("/api/v1/admin/content/lesson/{$this->lesson->id}/tier", ['tier' => 'free'])
            ->assertOk();

        $this->assertSame('premium', $this->exercise->fresh()->tier);
        $this->assertSame(
            'premium',
            AccessTier::effective($this->exercise->fresh()->tier, $this->lesson->fresh()->tier),
        );
    }
}
