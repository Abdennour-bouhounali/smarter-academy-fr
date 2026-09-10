<?php

namespace Tests\Feature;

use App\Domain\Access\ContentAccess;
use App\Domain\Practice\PracticeCapability;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\PracticeExercise;
use App\Models\StudentLessonProgress;
use App\Models\User;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * « L'admin masque, l'élève n'accède plus » — la moitié qui compte.
 *
 * Un état de publication qui ne ferme rien ne vaut pas mieux que l'ancien
 * `lessons.status`, dont la migration disait elle-même : « informational
 * only, not enforced against anything ».
 */
class ContentAccessEnforcementTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => 'seconde', 'name' => 'Seconde', 'level' => 'lycee']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'fonctions', 'title' => 'Fonctions', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fonction-affine-2nde',
            'title' => 'Fonction affine', 'status' => 'available', 'order' => 0,
        ]);

        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => 'seconde']);
        PracticeCapability::forget();
    }

    private function asStudent(): self
    {
        return $this->actingAs($this->student, 'sanctum');
    }

    public function test_une_lecon_publiee_reste_ouverte(): void
    {
        ContentAccess::assertLessonAvailable('fonction-affine-2nde');
        $this->assertTrue(true, 'aucune exception attendue');
    }

    public function test_une_lecon_masquee_ferme_l_apercu_de_pratique(): void
    {
        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);

        $this->asStudent()
            ->getJson('/api/v1/lessons/fonction-affine-2nde/practice/overview')
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_une_lecon_masquee_empeche_d_ouvrir_une_seance(): void
    {
        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);

        $this->asStudent()
            ->postJson('/api/v1/lessons/fonction-affine-2nde/practice/sessions', [
                'sessionId' => (string) Str::uuid(),
                'level' => 1,
            ])
            ->assertStatus(422);
    }

    /** Archivé et brouillon ferment aussi : seul « publié » ouvre. */
    public function test_seul_l_etat_publie_ouvre_l_acces(): void
    {
        foreach ([Lesson::PUB_HIDDEN, Lesson::PUB_ARCHIVED, Lesson::PUB_DRAFT] as $status) {
            $this->lesson->update(['publication_status' => $status]);

            try {
                ContentAccess::assertLessonAvailable('fonction-affine-2nde');
                $this->fail("l'état {$status} ne devrait pas ouvrir l'accès");
            } catch (DomainException) {
                $this->assertTrue(true);
            }
        }
    }

    /**
     * Un code de leçon se répète d'une classe à l'autre : masquer la version
     * de 6e ne doit pas fermer celle de 3e.
     */
    public function test_masquer_une_lecon_ne_ferme_pas_son_homonyme_d_une_autre_classe(): void
    {
        $other = Grade::create(['code' => '3e', 'name' => 'Troisième', 'level' => 'college']);
        $otherChapter = Chapter::create(['grade_id' => $other->id, 'code' => 'fonctions', 'title' => 'Fonctions', 'order' => 0]);
        Lesson::create([
            'chapter_id' => $otherChapter->id, 'code' => 'fonction-affine-2nde',
            'title' => 'Homonyme', 'status' => 'available', 'order' => 0,
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);

        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);

        ContentAccess::assertLessonAvailable('fonction-affine-2nde');
        $this->assertTrue(true, "l'homonyme publié garde l'accès ouvert");
    }

    /**
     * Une leçon absente du registre reste accessible : la base MIROITE le
     * contenu, elle n'en est pas l'autorité. Refuser l'inconnu fermerait la
     * plateforme au premier oubli de synchronisation.
     */
    public function test_une_lecon_inconnue_du_registre_reste_accessible(): void
    {
        ContentAccess::assertLessonAvailable('lecon-jamais-importee');
        $this->assertTrue(true);
    }

    public function test_un_exercice_masque_n_est_plus_servi(): void
    {
        PracticeExercise::create([
            'lesson_id' => $this->lesson->id,
            'exercise_code' => 'ex-2de-fonction-affine-l1-001',
            'level' => 1,
            'publication_status' => PracticeExercise::PUB_HIDDEN,
        ]);

        $this->assertFalse(
            ContentAccess::isExerciseAvailable('fonction-affine-2nde', 'ex-2de-fonction-affine-l1-001')
        );
        // Un exercice inconnu du registre reste servi, même raison que ci-dessus.
        $this->assertTrue(
            ContentAccess::isExerciseAvailable('fonction-affine-2nde', 'ex-inconnu')
        );
    }

    /**
     * Le point de la spec §12 : masquer retire l'ACCÈS, jamais l'HISTORIQUE.
     */
    public function test_masquer_une_lecon_ne_touche_pas_a_la_progression(): void
    {
        StudentLessonProgress::create([
            'user_id' => $this->student->id,
            'lesson_id' => $this->lesson->id,
            'status' => StudentLessonProgress::STATUS_IN_PROGRESS,
            'completed_modules' => ['01', '02'],
            'last_activity_at' => now(),
        ]);

        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);

        $this->assertDatabaseCount('student_lesson_progress', 1);

        // Et l'élève lit toujours sa propre progression : c'est SON histoire,
        // pas le contenu. La masquer serait lui mentir sur ce qu'il a fait.
        $this->asStudent()
            ->getJson('/api/v1/students/me/lesson-progress')
            ->assertStatus(200);
    }

    /** Republier rouvre : masquer n'est jamais définitif. */
    public function test_republier_rouvre_l_acces(): void
    {
        $this->lesson->update(['publication_status' => Lesson::PUB_HIDDEN]);
        $this->lesson->update(['publication_status' => Lesson::PUB_PUBLISHED]);

        ContentAccess::assertLessonAvailable('fonction-affine-2nde');
        $this->assertTrue(true);
    }
}
