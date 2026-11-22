<?php

namespace Tests\Feature;

use App\Domain\Access\ContentAccess;
use App\Domain\Practice\PracticeCapability;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use App\Models\User;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Qui voit quel état de publication (2026-10-07) :
 *
 *     published   tout le monde
 *     hidden      administrateur + enseignant ambassadeur (« سفير »)
 *     draft       administrateur seulement
 *     archived    administrateur seulement
 *
 * Le serveur dit l'état de ce qui n'est pas publié à qui le voit. Les autres
 * comptes gardent le comportement d'avant (voir PublicationAccessMatrixTest).
 */
class ContentReviewerAccessTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    private LessonModule $module;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => '4am', 'name' => 'السنة الرابعة متوسط', 'level' => 'moyen']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab_al_aadad_wal_hisab', 'title' => 'ميدان', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'qasim-mushtarak-akbar',
            'title' => 'القاسم المشترك الأكبر', 'status' => 'available', 'order' => 0,
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);
        $this->module = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '01', 'number' => 1,
            'title' => 'Découvrir', 'publication_status' => LessonModule::PUB_PUBLISHED,
        ]);
        PracticeCapability::forget();
    }

    private function ambassador(): User
    {
        $user = User::factory()->create(['role' => User::ROLE_TEACHER]);
        $user->forceFill(['is_ambassador' => true])->save();

        return $user;
    }

    private function reviewer(string $kind): User
    {
        return $kind === 'admin' ? User::factory()->create(['role' => User::ROLE_ADMIN]) : $this->ambassador();
    }

    // ------------------------------------------------- LA PORTE (domaine)

    /** @return array<string, array{string, string, bool}> */
    public static function visibilityMatrix(): array
    {
        $rows = [];
        $expected = [
            Lesson::PUB_HIDDEN => ['admin' => true, 'ambassador' => true, 'teacher' => false, 'student' => false, 'guest' => false],
            Lesson::PUB_DRAFT => ['admin' => true, 'ambassador' => false, 'teacher' => false, 'student' => false, 'guest' => false],
            Lesson::PUB_ARCHIVED => ['admin' => true, 'ambassador' => false, 'teacher' => false, 'student' => false, 'guest' => false],
            Lesson::PUB_PUBLISHED => ['admin' => true, 'ambassador' => true, 'teacher' => true, 'student' => true, 'guest' => true],
        ];
        foreach ($expected as $state => $viewers) {
            foreach ($viewers as $viewer => $sees) {
                $rows["{$state} / {$viewer}"] = [$state, $viewer, $sees];
            }
        }

        return $rows;
    }

    private function viewer(string $kind): ?User
    {
        return match ($kind) {
            'admin' => User::factory()->create(['role' => User::ROLE_ADMIN]),
            'ambassador' => $this->ambassador(),
            'teacher' => User::factory()->create(['role' => User::ROLE_TEACHER]),
            'student' => User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '4am']),
            'guest' => null,
        };
    }

    #[DataProvider('visibilityMatrix')]
    public function test_la_matrice_de_visibilite_lecon_module_exercice(string $state, string $kind, bool $sees): void
    {
        $this->lesson->update(['publication_status' => $state]);
        $this->module->update(['publication_status' => $state]);
        PracticeExercise::create([
            'lesson_id' => $this->lesson->id, 'exercise_code' => 'ex-a', 'level' => 1,
            'publication_status' => $state,
        ]);
        $user = $this->viewer($kind);

        try {
            ContentAccess::assertLessonAvailable('qasim-mushtarak-akbar', $user);
            $lessonOpen = true;
        } catch (DomainException) {
            $lessonOpen = false;
        }

        $this->assertSame($sees, $lessonOpen, "leçon {$state} pour {$kind}");
        $this->assertSame($sees, ContentAccess::isModuleAvailable('qasim-mushtarak-akbar', 1, $user), "module {$state} pour {$kind}");
        $this->assertSame($sees, ContentAccess::isExerciseAvailable('qasim-mushtarak-akbar', 'ex-a', $user), "exercice {$state} pour {$kind}");
    }

    /** Un module n'a pas d'état propre (2026-11-11) : sous une leçon publiée, il est ouvert. */
    public function test_un_module_suit_sa_lecon_quel_que_soit_sa_colonne(): void
    {
        $this->module->update(['publication_status' => LessonModule::PUB_DRAFT]);

        $this->assertTrue(ContentAccess::isModuleAvailable('qasim-mushtarak-akbar', 1, $this->ambassador()));
        $this->assertTrue(ContentAccess::isModuleAvailable('qasim-mushtarak-akbar', 1, User::factory()->create(['role' => User::ROLE_TEACHER])));

        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);
        $this->assertTrue(ContentAccess::isModuleAvailable('qasim-mushtarak-akbar', 1, $this->ambassador()));
        $this->assertFalse(ContentAccess::isModuleAvailable('qasim-mushtarak-akbar', 1, User::factory()->create(['role' => User::ROLE_TEACHER])));
    }

    public function test_un_ambassadeur_retire_redevient_un_enseignant_ordinaire(): void
    {
        $this->lesson->update(['publication_status' => Lesson::PUB_DRAFT]);
        $ambassador = $this->ambassador();
        $ambassador->forceFill(['is_ambassador' => false])->save();

        $this->expectException(DomainException::class);
        ContentAccess::assertLessonAvailable('qasim-mushtarak-akbar', $ambassador->fresh());
    }

    // ------------------------------------------------- L'INVENTAIRE (HTTP)

    public function test_l_inventaire_de_l_admin_ne_ferme_rien_et_donne_l_etat(): void
    {
        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);
        $this->module->update(['publication_status' => LessonModule::PUB_DRAFT]);

        $this->actingAs($this->reviewer('admin'), 'sanctum')->getJson('/api/v1/content/availability')
            ->assertOk()
            ->assertJsonPath('closed.lessons', [])
            ->assertJsonPath('closed.modules', [])
            ->assertJsonPath('closed.statuses.lessons.qasim-mushtarak-akbar', 'hidden')
            // Un module n'a pas d'état propre (2026-11-11) : aucun état de module.
            ->assertJsonPath('closed.statuses.modules', []);
    }

    public function test_l_inventaire_de_l_ambassadeur_ouvre_le_masque_et_ferme_le_brouillon(): void
    {
        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);
        $this->module->update(['publication_status' => LessonModule::PUB_DRAFT]);

        $this->actingAs($this->ambassador(), 'sanctum')->getJson('/api/v1/content/availability')
            ->assertOk()
            ->assertJsonPath('closed.lessons', [])
            // Le module suit sa leçon masquée, que l'ambassadeur voit : rien de fermé.
            ->assertJsonPath('closed.modules', [])
            ->assertJsonPath('closed.statuses.lessons.qasim-mushtarak-akbar', 'hidden')
            ->assertJsonMissingPath('closed.statuses.modules.qasim-mushtarak-akbar');

        $this->lesson->update(['publication_status' => Lesson::PUB_ARCHIVED]);
        $this->actingAs($this->ambassador(), 'sanctum')->getJson('/api/v1/content/availability')
            ->assertOk()
            ->assertJsonPath('closed.lessons', ['qasim-mushtarak-akbar'])
            ->assertJsonMissingPath('closed.statuses.lessons.qasim-mushtarak-akbar');
    }

    public function test_un_contenu_publie_n_apparait_pas_dans_les_etats(): void
    {
        $this->actingAs($this->ambassador(), 'sanctum')->getJson('/api/v1/content/availability')
            ->assertOk()
            ->assertJsonPath('closed.statuses.lessons', [])
            ->assertJsonPath('closed.statuses.modules', []);
    }

    public function test_les_autres_comptes_gardent_les_fermetures_et_ne_voient_aucun_etat(): void
    {
        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);

        foreach ([
            User::factory()->create(['role' => User::ROLE_TEACHER]),
            User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '4am']),
        ] as $user) {
            $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/content/availability')
                ->assertOk()
                ->assertJsonPath('closed.lessons', ['qasim-mushtarak-akbar']);
            $this->assertArrayNotHasKey('statuses', $response->json('closed'), $user->role.' ne doit pas recevoir les états');
        }

        $this->getJson('/api/v1/content/availability/public')->assertOk()
            ->assertJsonPath('closed.lessons', ['qasim-mushtarak-akbar'])
            ->assertJsonMissingPath('closed.statuses');
    }

    public function test_un_code_dont_une_version_est_publiee_n_est_pas_marque(): void
    {
        // Deux leçons sous le même code (deux classes) : une seule publiée suffit.
        $otherGrade = Grade::create(['code' => '3am', 'name' => 'السنة الثالثة متوسط', 'level' => 'moyen']);
        $otherChapter = Chapter::create(['grade_id' => $otherGrade->id, 'code' => 'ansab', 'title' => 'ميدان', 'order' => 0]);
        Lesson::create([
            'chapter_id' => $otherChapter->id, 'code' => 'qasim-mushtarak-akbar',
            'title' => 'Homonyme', 'status' => 'available', 'order' => 1, 'publication_status' => Lesson::PUB_DRAFT,
        ]);

        $this->actingAs($this->ambassador(), 'sanctum')->getJson('/api/v1/content/availability')
            ->assertOk()
            ->assertJsonMissingPath('closed.statuses.lessons.qasim-mushtarak-akbar');
    }

    // ------------------------------------------------- LES EXERCICES (HTTP)

    public function test_le_relecteur_liste_les_exercices_non_publies_avec_leur_etat(): void
    {
        PracticeExercise::create([
            'lesson_id' => $this->lesson->id, 'exercise_code' => 'ex-4am-qasim-mushtarak-akbar-l1-001',
            'level' => 1, 'publication_status' => PracticeExercise::PUB_HIDDEN,
        ]);

        $rows = collect($this->actingAs($this->ambassador(), 'sanctum')
            ->getJson('/api/v1/lessons/qasim-mushtarak-akbar/exercises')->assertOk()->json('exercises'))
            ->keyBy('exerciseCode');
        $this->assertSame('hidden', $rows['ex-4am-qasim-mushtarak-akbar-l1-001']['publicationStatus'] ?? null);

        // Un enseignant ordinaire ne voit pas l'exercice masqué, ni le champ d'état.
        $plain = collect($this->actingAs(User::factory()->create(['role' => User::ROLE_TEACHER]), 'sanctum')
            ->getJson('/api/v1/lessons/qasim-mushtarak-akbar/exercises')->assertOk()->json('exercises'));
        $this->assertFalse($plain->pluck('exerciseCode')->contains('ex-4am-qasim-mushtarak-akbar-l1-001'));
        $this->assertFalse($plain->contains(fn ($row) => array_key_exists('publicationStatus', $row)));
    }

    public function test_le_relecteur_liste_les_exercices_d_une_lecon_non_publiee(): void
    {
        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);

        $response = $this->actingAs($this->ambassador(), 'sanctum')
            ->getJson('/api/v1/lessons/qasim-mushtarak-akbar/exercises')->assertOk();
        $this->assertNotSame('lesson_unavailable', $response->json('reason'));
        $this->assertNotEmpty($response->json('exercises'));

        // Un brouillon : l'admin le liste, l'ambassadeur non.
        $this->lesson->update(['publication_status' => Lesson::PUB_DRAFT]);
        $this->actingAs($this->ambassador(), 'sanctum')
            ->getJson('/api/v1/lessons/qasim-mushtarak-akbar/exercises')->assertOk()
            ->assertJsonPath('reason', 'lesson_unavailable');
        $admin = $this->actingAs($this->reviewer('admin'), 'sanctum')
            ->getJson('/api/v1/lessons/qasim-mushtarak-akbar/exercises')->assertOk();
        $this->assertNotSame('lesson_unavailable', $admin->json('reason'));
    }

    public function test_l_ambassadeur_ne_liste_pas_un_exercice_en_brouillon(): void
    {
        PracticeExercise::create([
            'lesson_id' => $this->lesson->id, 'exercise_code' => 'ex-4am-qasim-mushtarak-akbar-l1-001',
            'level' => 1, 'publication_status' => PracticeExercise::PUB_DRAFT,
        ]);

        $codes = collect($this->actingAs($this->ambassador(), 'sanctum')
            ->getJson('/api/v1/lessons/qasim-mushtarak-akbar/exercises')->assertOk()->json('exercises'))
            ->pluck('exerciseCode');
        $this->assertFalse($codes->contains('ex-4am-qasim-mushtarak-akbar-l1-001'));

        $adminRows = collect($this->actingAs($this->reviewer('admin'), 'sanctum')
            ->getJson('/api/v1/lessons/qasim-mushtarak-akbar/exercises')->assertOk()->json('exercises'))
            ->keyBy('exerciseCode');
        $this->assertSame('draft', $adminRows['ex-4am-qasim-mushtarak-akbar-l1-001']['publicationStatus'] ?? null);
    }

    // ------------------------------------------------- AUCUNE ÉCRITURE

    public function test_le_relecteur_n_ecrit_toujours_aucune_progression(): void
    {
        $this->lesson->update(['publication_status' => Lesson::PUB_DRAFT]);

        $this->actingAs($this->ambassador(), 'sanctum')->putJson('/api/v1/lessons/qasim-mushtarak-akbar/progress', [
            'completedModules' => ['1'], 'currentModule' => 1, 'status' => 'in_progress', 'lastActivityAt' => now()->toIso8601String(),
        ])->assertStatus(403)->assertJsonPath('reason', 'not_a_learner');

        $this->assertDatabaseCount('student_lesson_progress', 0);
    }
}
