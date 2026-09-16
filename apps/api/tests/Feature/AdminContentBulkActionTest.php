<?php

namespace Tests\Feature;

use App\Domain\Admin\ActivityLogger;
use App\Models\AdminActivityLog;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use App\Models\StudentLessonProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Le traitement en LOT — et l'invariant qui le justifie : il ne contourne
 * rien.
 *
 * Ce fichier ne vérifie pas « le lot a marché ». Il vérifie que le lot est
 * exactement le geste unitaire répété : mêmes refus structurels, même journal,
 * mêmes données d'apprentissage intactes, même interdiction de palier sur un
 * module. Un lot qui irait plus vite en sautant l'un des quatre serait un
 * second système de publication, et ce sont ces tests-là qui l'attrapent.
 */
class AdminContentBulkActionTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Lesson $lessonA;

    private Lesson $lessonB;

    /** Une leçon qui a des modules EN REGISTRE mais aucun publié : impubliable. */
    private Lesson $lessonBloquee;

    private LessonModule $moduleA;

    private LessonModule $moduleB;

    private PracticeExercise $exerciseA;

    private PracticeExercise $exerciseB;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => '4e', 'name' => 'Quatrième', 'level' => 'college']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'calcul_litteral', 'title' => 'Calcul littéral', 'order' => 0]);

        $make = fn (string $code, string $title, int $order) => Lesson::create([
            'chapter_id' => $chapter->id, 'code' => $code, 'title' => $title,
            'status' => 'available', 'order' => $order, 'tier' => 'free',
            'publication_status' => Lesson::PUB_DRAFT,
        ]);

        $this->lessonA = $make('developper-4e', 'Développer', 0);
        $this->lessonB = $make('factoriser-4e', 'Factoriser', 1);
        $this->lessonBloquee = $make('puissances-4e', 'Puissances', 2);

        // Les deux premières leçons ont un module PUBLIÉ : elles franchissent
        // assertPublishable(). La troisième a un module en brouillon, donc
        // « l'élève ouvrirait une leçon vide » — le refus qu'on veut voir
        // survivre au lot.
        $this->moduleA = LessonModule::create([
            'lesson_id' => $this->lessonA->id, 'code' => '01', 'number' => 1, 'title' => 'Distribuer',
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);
        $this->moduleB = LessonModule::create([
            'lesson_id' => $this->lessonB->id, 'code' => '01', 'number' => 1, 'title' => 'Facteur commun',
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);
        LessonModule::create([
            'lesson_id' => $this->lessonBloquee->id, 'code' => '01', 'number' => 1, 'title' => 'Exposants',
            'publication_status' => Lesson::PUB_DRAFT,
        ]);

        $this->exerciseA = PracticeExercise::create([
            'lesson_id' => $this->lessonA->id, 'exercise_code' => 'ex-dev-01', 'level' => 1,
            'publication_status' => Lesson::PUB_DRAFT,
        ]);
        $this->exerciseB = PracticeExercise::create([
            'lesson_id' => $this->lessonB->id, 'exercise_code' => 'ex-fac-01', 'level' => 1,
            'publication_status' => Lesson::PUB_DRAFT,
        ]);

        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function asAdmin(): self
    {
        return $this->actingAs($this->admin, 'sanctum');
    }

    public function test_un_lot_publie_toutes_les_lecons_valides(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-status', [
                'ids' => [$this->lessonA->id, $this->lessonB->id],
                'status' => Lesson::PUB_PUBLISHED,
            ])
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'applied')
            ->assertJsonCount(0, 'failed');

        $this->assertSame(Lesson::PUB_PUBLISHED, $this->lessonA->fresh()->publication_status);
        $this->assertSame(Lesson::PUB_PUBLISHED, $this->lessonB->fresh()->publication_status);
        // L'horodatage de publication, que seul changeStatus() pose : sa
        // présence prouve que le lot est bien passé PAR lui.
        $this->assertNotNull($this->lessonA->fresh()->published_at);
    }

    /**
     * LE test central : un contenu qui refuse n'emporte pas les autres, et son
     * refus est nommé.
     */
    public function test_un_contenu_refuse_n_empeche_pas_les_autres(): void
    {
        $response = $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-status', [
                'ids' => [$this->lessonA->id, $this->lessonBloquee->id, $this->lessonB->id],
                'status' => Lesson::PUB_PUBLISHED,
            ])
            ->assertStatus(200)
            ->assertJsonCount(2, 'applied')
            ->assertJsonCount(1, 'failed')
            ->assertJsonPath('failed.0.id', $this->lessonBloquee->id);

        // Le message est celui du service, pas un « échec » générique :
        // l'administrateur doit savoir POURQUOI cette leçon-là a résisté.
        $this->assertStringContainsString('module', $response->json('failed.0.message'));

        $this->assertSame(Lesson::PUB_PUBLISHED, $this->lessonA->fresh()->publication_status);
        $this->assertSame(Lesson::PUB_PUBLISHED, $this->lessonB->fresh()->publication_status);
        $this->assertSame(Lesson::PUB_DRAFT, $this->lessonBloquee->fresh()->publication_status);
    }

    /**
     * « Déjà dans cet état » n'est ni un succès ni un échec.
     *
     * Le confondre avec `applied` ferait annoncer « 25 leçons publiées » quand
     * 24 l'étaient déjà ; le confondre avec `failed` ferait passer pour un
     * problème le résultat exactement demandé.
     */
    public function test_un_contenu_deja_dans_cet_etat_est_compte_a_part(): void
    {
        $this->lessonA->update(['publication_status' => Lesson::PUB_HIDDEN]);

        $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-status', [
                'ids' => [$this->lessonA->id, $this->lessonB->id],
                'status' => Lesson::PUB_HIDDEN,
            ])
            ->assertStatus(200)
            ->assertJsonPath('applied', [$this->lessonB->id])
            ->assertJsonPath('unchanged', [$this->lessonA->id])
            ->assertJsonCount(0, 'failed');
    }

    public function test_un_lot_journalise_une_ligne_par_contenu(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-status', [
                'ids' => [$this->lessonA->id, $this->lessonB->id],
                'status' => Lesson::PUB_HIDDEN,
            ])
            ->assertStatus(200);

        // Deux lignes, pas une « opération de lot » anonyme : le journal doit
        // pouvoir répondre « qui a masqué CETTE leçon ».
        $logs = AdminActivityLog::where('action', ActivityLogger::PUBLISH_LESSON)->get();
        $this->assertCount(2, $logs);
        $this->assertEqualsCanonicalizing(
            [(string) $this->lessonA->id, (string) $this->lessonB->id],
            $logs->pluck('entity_id')->all(),
        );
        $this->assertSame($this->admin->id, $logs->first()->user_id);
        $this->assertSame(Lesson::PUB_DRAFT, $logs->first()->before['publication_status']);
    }

    /** Un contenu qui refuse ne laisse AUCUNE trace : pas de journal qui mente. */
    public function test_un_contenu_refuse_ne_se_journalise_pas(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-status', [
                'ids' => [$this->lessonBloquee->id],
                'status' => Lesson::PUB_PUBLISHED,
            ])
            ->assertStatus(200)
            ->assertJsonCount(1, 'failed');

        $this->assertSame(0, AdminActivityLog::count());
    }

    public function test_un_lot_masque_des_modules_et_des_exercices(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/content/module/bulk-status', [
                'ids' => [$this->moduleA->id, $this->moduleB->id],
                'status' => Lesson::PUB_HIDDEN,
            ])
            ->assertStatus(200)
            ->assertJsonCount(2, 'applied');

        $this->assertSame(Lesson::PUB_HIDDEN, $this->moduleA->fresh()->publication_status);

        $this->asAdmin()
            ->postJson('/api/v1/admin/content/exercise/bulk-status', [
                'ids' => [$this->exerciseA->id, $this->exerciseB->id],
                'status' => Lesson::PUB_PUBLISHED,
            ])
            ->assertStatus(200)
            ->assertJsonCount(2, 'applied');

        $this->assertSame(Lesson::PUB_PUBLISHED, $this->exerciseA->fresh()->publication_status);
    }

    public function test_un_lot_change_le_palier_de_plusieurs_lecons(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-tier', [
                'ids' => [$this->lessonA->id, $this->lessonB->id],
                'tier' => 'premium',
            ])
            ->assertStatus(200)
            ->assertJsonCount(2, 'applied');

        $this->assertSame('premium', $this->lessonA->fresh()->tier);
        // Le palier ne touche pas la publication, en lot comme à l'unité.
        $this->assertSame(Lesson::PUB_DRAFT, $this->lessonA->fresh()->publication_status);
    }

    /**
     * `tier: null` — « hérite de la leçon » — reste réservé aux exercices, en
     * lot exactement comme à l'unité.
     */
    public function test_un_lot_ne_peut_pas_rendre_une_lecon_sans_palier(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-tier', [
                'ids' => [$this->lessonA->id],
                'tier' => null,
            ])
            ->assertStatus(200)
            ->assertJsonCount(0, 'applied')
            ->assertJsonCount(1, 'failed');

        $this->assertSame('free', $this->lessonA->fresh()->tier);

        // Pour un exercice, le même appel est valide.
        $this->exerciseA->update(['tier' => 'premium']);
        $this->asAdmin()
            ->postJson('/api/v1/admin/content/exercise/bulk-tier', [
                'ids' => [$this->exerciseA->id],
                'tier' => null,
            ])
            ->assertStatus(200)
            ->assertJsonCount(1, 'applied');

        $this->assertNull($this->exerciseA->fresh()->tier);
    }

    /** Un module n'a pas de palier : la ROUTE elle-même le refuse. */
    public function test_le_palier_en_lot_n_existe_pas_pour_un_module(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/content/module/bulk-tier', [
                'ids' => [$this->moduleA->id],
                'tier' => 'premium',
            ])
            ->assertStatus(404);
    }

    public function test_un_etat_inconnu_est_refuse_pour_tout_le_lot(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-status', [
                'ids' => [$this->lessonA->id, $this->lessonB->id],
                'status' => 'secret',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('status');

        $this->assertSame(Lesson::PUB_DRAFT, $this->lessonA->fresh()->publication_status);
    }

    public function test_une_liste_vide_ou_non_entiere_est_refusee(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-status', ['ids' => [], 'status' => Lesson::PUB_HIDDEN])
            ->assertStatus(422)
            ->assertJsonValidationErrors('ids');

        $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-status', ['ids' => ['abc'], 'status' => Lesson::PUB_HIDDEN])
            ->assertStatus(422)
            ->assertJsonValidationErrors('ids.0');
    }

    /**
     * Un plafond, pour qu'un appel forgé ne puisse pas transformer une requête
     * HTTP en migration de toute la base.
     */
    public function test_un_lot_est_plafonne(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-status', [
                'ids' => range(1, 201),
                'status' => Lesson::PUB_HIDDEN,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('ids');
    }

    /** Un identifiant inexistant est un échec NOMMÉ, pas une erreur 500. */
    public function test_un_identifiant_inconnu_est_un_echec_nomme(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-status', [
                'ids' => [$this->lessonA->id, 999999],
                'status' => Lesson::PUB_HIDDEN,
            ])
            ->assertStatus(200)
            ->assertJsonPath('applied', [$this->lessonA->id])
            ->assertJsonPath('failed.0.id', 999999)
            ->assertJsonPath('failed.0.message', 'Contenu introuvable.');
    }

    /** Le même identifiant deux fois ne compte qu'une fois. */
    public function test_les_doublons_sont_ignores(): void
    {
        $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-status', [
                'ids' => [$this->lessonA->id, $this->lessonA->id],
                'status' => Lesson::PUB_HIDDEN,
            ])
            ->assertStatus(200)
            ->assertJsonPath('applied', [$this->lessonA->id])
            ->assertJsonCount(0, 'unchanged');
    }

    /**
     * L'invariant de la spec §12, en lot : masquer ne détruit aucune
     * progression. C'est la promesse que la confirmation fait à
     * l'administrateur ; elle doit être vraie pour 25 leçons comme pour une.
     */
    public function test_un_lot_ne_detruit_aucune_progression(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '4e']);
        StudentLessonProgress::create([
            'user_id' => $student->id, 'lesson_id' => $this->lessonA->id,
            'completed_modules' => ['01'], 'status' => StudentLessonProgress::STATUS_IN_PROGRESS,
            'current_module' => 1, 'last_activity_at' => now(),
        ]);

        $this->asAdmin()
            ->postJson('/api/v1/admin/content/lesson/bulk-status', [
                'ids' => [$this->lessonA->id, $this->lessonB->id],
                'status' => Lesson::PUB_ARCHIVED,
            ])
            ->assertStatus(200);

        $progress = StudentLessonProgress::where('user_id', $student->id)->first();
        $this->assertNotNull($progress);
        $this->assertSame(['01'], $progress->completed_modules);
    }

    public function test_un_eleve_ne_peut_pas_lancer_un_lot(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '4e']);

        $this->actingAs($student, 'sanctum')
            ->postJson('/api/v1/admin/content/lesson/bulk-status', [
                'ids' => [$this->lessonA->id],
                'status' => Lesson::PUB_HIDDEN,
            ])
            ->assertStatus(403);

        $this->assertSame(Lesson::PUB_DRAFT, $this->lessonA->fresh()->publication_status);
    }

    public function test_un_visiteur_anonyme_ne_peut_pas_lancer_un_lot(): void
    {
        $this->postJson('/api/v1/admin/content/lesson/bulk-status', [
            'ids' => [$this->lessonA->id],
            'status' => Lesson::PUB_HIDDEN,
        ])->assertStatus(401);
    }
}
