<?php

namespace Tests\Feature;

use App\Models\ActivationCode;
use App\Models\ActivationCodeBatch;
use App\Models\Chapter;
use App\Models\Entitlement;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\StudentLessonProgress;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Le PÉRIMÈTRE du curriculum en base (phase 6F).
 *
 * `smarter:import-curriculum` ne supprime jamais : il peut élargir la base,
 * pas la rétrécir. `smarter:scope-curriculum` est l'autre moitié, et ces
 * tests couvrent ce qu'on attend d'une commande destructive — ce qu'elle
 * supprime, ce qu'elle préserve, et surtout ce qu'elle REFUSE de faire.
 */
class CurriculumScopeTest extends TestCase
{
    use RefreshDatabase;

    /** L'export minimal, de la forme qu'écrit exportCurriculum.mjs. */
    private function export(array $gradeCodes = ['4am', 'terminale_dz']): string
    {
        $grades = [];
        foreach ($gradeCodes as $i => $code) {
            $grades[] = [
                'code' => $code,
                'name' => $code,
                'level' => $code === '4am' ? 'moyen' : 'thanawi',
                'order' => $i,
                'active' => true,
                'curriculumStatus' => $code === '4am' ? 'programme_only' : 'not_supplied',
                'chapters' => $code === '4am' ? [[
                    'code' => 'handasa',
                    'title' => 'ميدان الهندسة',
                    'order' => 0,
                    'topics' => [['id' => 'thales', 'title' => 'خاصية طالس']],
                    'lessons' => [],
                ]] : [],
            ];
        }

        $path = tempnam(sys_get_temp_dir(), 'scope').'.json';
        file_put_contents($path, json_encode(['exportedAt' => null, 'grades' => $grades]));

        return $path;
    }

    /** Une classe française héritée, avec chapitre, leçon et point. */
    private function seedFrenchGrade(string $code = '6e'): Lesson
    {
        $grade = Grade::create(['code' => $code, 'name' => $code, 'level' => 'college', 'order' => 0, 'is_active' => false]);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'nombres', 'title' => 'Nombres', 'order' => 0]);
        $lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => "fractions-{$code}", 'title' => 'Fractions',
            'status' => 'available', 'tier' => 'free', 'order' => 0,
        ]);
        LearningPoint::create(['lesson_id' => $lesson->id, 'code' => "{$code}_fractions_P1", 'title' => 'Partager', 'order' => 1]);

        return $lesson;
    }

    private function seedRetainedGrades(): void
    {
        $g = Grade::create(['code' => '4am', 'name' => '4am', 'level' => 'moyen', 'order' => 0, 'is_active' => true]);
        Chapter::create(['grade_id' => $g->id, 'code' => 'handasa', 'title' => 'ميدان الهندسة', 'order' => 0]);
        Grade::create(['code' => 'terminale_dz', 'name' => 'terminale_dz', 'level' => 'thanawi', 'order' => 1, 'is_active' => true]);
    }

    public function test_it_retains_only_the_grades_the_catalogue_declares(): void
    {
        $this->seedRetainedGrades();
        $this->seedFrenchGrade('6e');
        $this->seedFrenchGrade('seconde');

        $this->assertSame(4, Grade::count());

        $this->artisan('smarter:scope-curriculum', ['--from-json' => $this->export(), '--force' => true])
            ->expectsConfirmation(
                "Supprimer définitivement 2 classe(s), 2 chapitre(s), 2 leçon(s) et 2 point(s) d'apprentissage ?",
                'yes'
            )
            ->assertSuccessful();

        $this->assertEqualsCanonicalizing(['4am', 'terminale_dz'], Grade::pluck('code')->all());
    }

    public function test_every_remaining_row_belongs_to_a_retained_grade(): void
    {
        $this->seedRetainedGrades();
        $this->seedFrenchGrade('6e');

        $this->artisan('smarter:scope-curriculum', ['--from-json' => $this->export(), '--force' => true])
            ->expectsConfirmation(
                "Supprimer définitivement 1 classe(s), 1 chapitre(s), 1 leçon(s) et 1 point(s) d'apprentissage ?",
                'yes'
            )
            ->assertSuccessful();

        $retainedIds = Grade::pluck('id');
        $this->assertSame(0, Chapter::whereNotIn('grade_id', $retainedIds)->count());
        $this->assertSame(0, Lesson::whereNotIn('chapter_id', Chapter::pluck('id'))->count());
        $this->assertSame(0, LearningPoint::whereNotIn('lesson_id', Lesson::pluck('id'))->count());
        // Et rien de français ne subsiste, sous aucune forme.
        $this->assertSame(0, Lesson::where('code', 'like', '%-6e')->count());
        $this->assertSame(0, LearningPoint::where('code', 'like', '6e_%')->count());
    }

    public function test_it_preserves_accounts_entitlements_and_activation_codes(): void
    {
        $this->seedRetainedGrades();
        $this->seedFrenchGrade('6e');

        $user = User::factory()->create();
        $entitlement = Entitlement::factory()->create(['user_id' => $user->id]);
        $batch = ActivationCodeBatch::factory()->create();
        $code = ActivationCode::factory()->create(['batch_id' => $batch->id]);

        $this->artisan('smarter:scope-curriculum', ['--from-json' => $this->export(), '--force' => true])
            ->expectsConfirmation(
                "Supprimer définitivement 1 classe(s), 1 chapitre(s), 1 leçon(s) et 1 point(s) d'apprentissage ?",
                'yes'
            )
            ->assertSuccessful();

        // Le nettoyage porte sur le CURRICULUM. Les comptes, les droits et les
        // codes d'activation n'ont aucune colonne de curriculum et ne doivent
        // pas bouger d'une ligne.
        $this->assertDatabaseHas('users', ['id' => $user->id]);
        $this->assertDatabaseHas('entitlements', ['id' => $entitlement->id]);
        $this->assertDatabaseHas('activation_codes', ['id' => $code->id]);
        $this->assertDatabaseHas('activation_code_batches', ['id' => $batch->id]);
    }

    public function test_it_refuses_when_student_data_would_be_destroyed(): void
    {
        $this->seedRetainedGrades();
        $lesson = $this->seedFrenchGrade('6e');

        $user = User::factory()->create();
        StudentLessonProgress::create([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
            'completed_modules' => [],
            'last_activity_at' => now(),
        ]);

        $this->artisan('smarter:scope-curriculum', ['--from-json' => $this->export(), '--force' => true])
            ->assertFailed();

        // Rien n'a bougé : le refus est total, pas partiel.
        $this->assertSame(3, Grade::count());
        $this->assertDatabaseHas('student_lesson_progress', ['lesson_id' => $lesson->id]);
    }

    public function test_allow_student_data_loss_alone_deletes_nothing(): void
    {
        $this->seedRetainedGrades();
        $this->seedFrenchGrade('6e');

        // Lever le refus n'autorise PAS la suppression : --force reste exigé.
        // C'est la confusion qui coûterait le plus cher sur cette commande.
        $this->artisan('smarter:scope-curriculum', [
            '--from-json' => $this->export(),
            '--allow-student-data-loss' => true,
        ])->assertFailed();

        $this->assertSame(3, Grade::count());
    }

    public function test_dry_run_deletes_nothing(): void
    {
        $this->seedRetainedGrades();
        $this->seedFrenchGrade('6e');

        $this->artisan('smarter:scope-curriculum', ['--from-json' => $this->export(), '--dry-run' => true])
            ->assertSuccessful();

        $this->assertSame(3, Grade::count());
    }

    public function test_it_refuses_an_export_declaring_no_grade(): void
    {
        $this->seedRetainedGrades();

        // Un export vide effacerait TOUT le curriculum. Le cas le plus
        // probable n'est pas une décision : c'est un export raté.
        $this->artisan('smarter:scope-curriculum', ['--from-json' => $this->export([]), '--force' => true])
            ->assertFailed();

        $this->assertSame(2, Grade::count());
    }

    public function test_it_refuses_to_run_in_production(): void
    {
        $this->app['env'] = 'production';
        $this->seedRetainedGrades();
        $this->seedFrenchGrade('6e');

        $this->artisan('smarter:scope-curriculum', ['--from-json' => $this->export(), '--force' => true])
            ->assertFailed();

        $this->assertSame(3, Grade::count());
    }

    /**
     * La RÉGRESSION PERMANENTE, et le vrai invariant de la phase 6F.
     *
     * L'import est un upsert sur TOUT l'export : c'est donc l'export, et lui
     * seul, qui détermine ce que la base contient. Ce test échouera si
     * quelqu'un ré-élargit l'export ou y réintroduit l'arbre français — la
     * seule façon dont les 133 leçons pourraient revenir.
     */
    public function test_importing_after_cleanup_does_not_resurrect_removed_grades(): void
    {
        $this->seedRetainedGrades();
        $this->seedFrenchGrade('6e');
        $export = $this->export();

        $this->artisan('smarter:scope-curriculum', ['--from-json' => $export, '--force' => true])
            ->expectsConfirmation(
                "Supprimer définitivement 1 classe(s), 1 chapitre(s), 1 leçon(s) et 1 point(s) d'apprentissage ?",
                'yes'
            )
            ->assertSuccessful();

        $this->artisan('smarter:import-curriculum', ['--from-json' => $export])->assertSuccessful();

        $this->assertEqualsCanonicalizing(['4am', 'terminale_dz'], Grade::pluck('code')->all());
        $this->assertSame(0, Lesson::count());
    }

    /**
     * La FIDÉLITÉ DES SUJETS, au bout de la chaîne.
     *
     * Le catalogue peut être juste et la base fausse : l'export ou l'import
     * pourraient perdre un sujet en chemin. On vérifie donc à l'arrivée, pas
     * seulement au départ.
     */
    public function test_it_imports_chapter_topics_verbatim(): void
    {
        $this->artisan('smarter:import-curriculum', ['--from-json' => $this->export()])->assertSuccessful();

        $chapter = Chapter::where('code', 'handasa')->firstOrFail();
        $this->assertSame([['id' => 'thales', 'title' => 'خاصية طالس']], $chapter->topics);

        // Un chapitre sans sujets reçoit null, pas un tableau vide : l'absence
        // de sujets n'est pas une liste vide de sujets.
        $this->assertNull(
            Chapter::whereHas('grade', fn ($q) => $q->where('code', 'terminale_dz'))->first()?->topics
        );
    }

    public function test_it_reports_orphaned_user_grades_without_touching_accounts(): void
    {
        $this->seedRetainedGrades();
        $this->seedFrenchGrade('6e');
        $user = User::factory()->create(['grade' => '6e']);

        $this->artisan('smarter:scope-curriculum', ['--from-json' => $this->export(), '--force' => true])
            ->expectsConfirmation(
                "Supprimer définitivement 1 classe(s), 1 chapitre(s), 1 leçon(s) et 1 point(s) d'apprentissage ?",
                'yes'
            )
            ->assertSuccessful();

        // `users.grade` est une chaîne libre : elle pend, et c'est signalé.
        // Reclasser un élève est une décision produit, pas un effet de bord.
        $this->assertSame('6e', $user->fresh()->grade);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_registry_health_gate_fails_on_an_out_of_scope_grade(): void
    {
        $this->seedRetainedGrades();
        $this->seedFrenchGrade('6e');

        config(['curriculum.export_output_path' => $this->export()]);

        // La porte doit NOMMER la classe hors périmètre : c'est ce qui rend
        // le diagnostic actionnable plutôt qu'alarmant.
        $this->artisan('smarter:registry-health', ['--gate' => true])
            ->expectsOutputToContain('6e')
            ->assertFailed();
    }

    public function test_registry_health_gate_passes_once_the_scope_is_clean(): void
    {
        $this->seedRetainedGrades();
        config(['curriculum.export_output_path' => $this->export()]);

        $this->artisan('smarter:registry-health', ['--gate' => true])->assertSuccessful();
    }

    /**
     * Un 4am actif, un ميدان, une leçon — et l'export qui la déclare, SANS
     * palier (le catalogue n'en porte plus).
     */
    private function seedActiveLesson(?string $tier, string $code = 'thales'): string
    {
        $grade = Grade::create(['code' => '4am', 'name' => '4am', 'level' => 'moyen', 'order' => 0, 'is_active' => true]);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'handasa', 'title' => 'ميدان الهندسة', 'order' => 0]);
        Lesson::create([
            'chapter_id' => $chapter->id, 'code' => $code, 'title' => 'Thalès',
            'status' => 'available', 'order' => 0,
        ]);
        // Écrit en SQL brut : le modèle et la colonne n'acceptent pas tous les
        // cas qu'on veut éprouver ici (NULL, faute de frappe).
        DB::table('lessons')->where('code', $code)->update(['tier' => $tier]);

        $export = tempnam(sys_get_temp_dir(), 'tier').'.json';
        file_put_contents($export, json_encode(['grades' => [[
            'code' => '4am', 'active' => true, 'chapters' => [[
                'code' => 'handasa', 'lessons' => [['code' => 'thales']],
            ]],
        ]]]));

        return $export;
    }

    /**
     * Le palier appartient à la BASE : une leçon que l'administrateur a
     * passée premium alors que le catalogue ne dit rien n'est PAS une
     * dérive. C'est la configuration voulue — l'ancienne porte l'aurait
     * refusée, et aurait ainsi appris à « réparer » la décision de
     * l'administrateur par un import.
     */
    #[DataProvider('adminTiers')]
    public function test_registry_health_gate_accepts_any_admin_decided_tier(string $tier): void
    {
        config(['curriculum.export_output_path' => $this->seedActiveLesson($tier)]);

        $this->artisan('smarter:registry-health', ['--gate' => true])->assertSuccessful();
    }

    public static function adminTiers(): array
    {
        return ['free' => ['free'], 'premium' => ['premium']];
    }

    /** Un palier ABSENT ou INCONNU en base reste un défaut, signalé. */
    public function test_registry_health_gate_fails_on_an_invalid_tier_in_the_database(): void
    {
        config(['curriculum.export_output_path' => $this->seedActiveLesson('premiun')]);

        $this->artisan('smarter:registry-health', ['--gate' => true])
            ->expectsOutputToContain('thales')
            ->assertFailed();
    }

    /**
     * Une leçon en base que le catalogue ne déclare plus : une question de
     * PÉRIMÈTRE, détectée comme telle (et non plus comme une « dérive de
     * palier » dont la source serait absente).
     */
    public function test_registry_health_gate_fails_on_a_lesson_outside_the_catalogue(): void
    {
        config(['curriculum.export_output_path' => $this->seedActiveLesson('free', 'lecon-orpheline')]);

        $this->artisan('smarter:registry-health', ['--gate' => true])
            ->expectsOutputToContain('lecon-orpheline')
            ->assertFailed();
    }

    public function test_it_leaves_curriculum_untouched_when_already_in_scope(): void
    {
        $this->seedRetainedGrades();

        $this->artisan('smarter:scope-curriculum', ['--from-json' => $this->export(), '--force' => true])
            ->assertSuccessful();

        $this->assertSame(2, Grade::count());
        $this->assertSame(1, DB::table('chapters')->count());
    }
}
