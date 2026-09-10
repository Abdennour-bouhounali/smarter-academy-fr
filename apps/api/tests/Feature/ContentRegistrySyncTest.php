<?php

namespace Tests\Feature;

use App\Domain\Curriculum\ContentRegistryImporter;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Le registre de contenu : la synchro possède l'identité, l'administration
 * possède l'état de publication, et rien n'est jamais supprimé.
 *
 * Ces trois propriétés sont la raison d'être de ContentRegistryImporter — si
 * l'une d'elles cède, un déploiement rouvre en silence un module qu'un
 * administrateur avait masqué, ou orpheline une progression d'élève.
 */
class ContentRegistrySyncTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => '6e', 'name' => 'Sixième', 'level' => 'college']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'nombres_calculs', 'title' => 'Nombres', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fractions',
            'title' => 'Fractions', 'status' => 'available', 'order' => 0,
        ]);
    }

    private function export(array $modules, array $exercises = []): array
    {
        return [
            'lessons' => [[
                'code' => 'fractions',
                'grade' => '6e',
                'modules' => $modules,
            ]],
            'exercises' => $exercises,
        ];
    }

    private function module(string $code, array $overrides = []): array
    {
        return array_merge([
            'code' => $code,
            'number' => (int) $code,
            'slug' => "module-{$code}",
            'title' => "Module {$code}",
            'description' => null,
            'stage' => 'discovery',
            'estimatedMin' => 8,
            'difficulty' => 1,
            'teachesLearningPointCodes' => null,
        ], $overrides);
    }

    private function importer(): ContentRegistryImporter
    {
        return app(ContentRegistryImporter::class);
    }

    public function test_la_synchro_cree_les_modules_declares(): void
    {
        $summary = $this->importer()->import($this->export([
            $this->module('01'),
            $this->module('02'),
        ]));

        $this->assertCount(2, $summary['modules']['created']);
        $this->assertDatabaseCount('lesson_modules', 2);
        $this->assertSame('Module 01', LessonModule::where('code', '01')->first()->title);
    }

    public function test_rejouer_la_synchro_ne_cree_rien_de_neuf(): void
    {
        $export = $this->export([$this->module('01')]);

        $this->importer()->import($export);
        $summary = $this->importer()->import($export);

        $this->assertSame([], $summary['modules']['created']);
        $this->assertCount(1, $summary['modules']['unchanged']);
        $this->assertDatabaseCount('lesson_modules', 1);
    }

    /**
     * LA propriété centrale. Un administrateur masque un module cassé ; le
     * déploiement suivant resynchronise le contenu. Le module doit RESTER
     * masqué — sinon la décision d'administration ne survit pas au prochain
     * `git push`, et personne ne s'en aperçoit avant le signalement suivant.
     */
    public function test_une_resynchro_ne_touche_pas_l_etat_de_publication_choisi_par_l_admin(): void
    {
        $export = $this->export([$this->module('01')]);
        $this->importer()->import($export);

        LessonModule::where('code', '01')->update(['publication_status' => LessonModule::PUB_HIDDEN]);

        // Le titre change côté contenu : la synchro a donc bien du travail,
        // et écrit réellement la ligne — c'est le cas qui piège.
        $this->importer()->import($this->export([
            $this->module('01', ['title' => 'Titre réécrit']),
        ]));

        $module = LessonModule::where('code', '01')->first();
        $this->assertSame('Titre réécrit', $module->title, "l'identité doit suivre le contenu");
        $this->assertSame(LessonModule::PUB_HIDDEN, $module->publication_status, "l'état doit rester celui de l'admin");
    }

    public function test_un_module_disparu_est_retire_jamais_supprime(): void
    {
        $this->importer()->import($this->export([$this->module('01'), $this->module('02')]));

        $summary = $this->importer()->import($this->export([$this->module('01')]));

        $this->assertCount(1, $summary['modules']['retired']);
        // La ligne existe toujours : student_lesson_progress.completed_modules
        // référence ces codes, et la supprimer rendrait la progression muette.
        $this->assertDatabaseCount('lesson_modules', 2);
        $this->assertNotNull(LessonModule::where('code', '02')->first()->retired_at);
    }

    public function test_un_module_qui_reapparait_reprend_du_service(): void
    {
        $this->importer()->import($this->export([$this->module('01'), $this->module('02')]));
        $this->importer()->import($this->export([$this->module('01')]));

        $this->importer()->import($this->export([$this->module('01'), $this->module('02')]));

        $this->assertNull(LessonModule::where('code', '02')->first()->retired_at);
    }

    public function test_le_dry_run_calcule_le_diff_sans_rien_ecrire(): void
    {
        $summary = $this->importer()->import($this->export([$this->module('01')]), dryRun: true);

        $this->assertCount(1, $summary['modules']['created']);
        $this->assertDatabaseCount('lesson_modules', 0);
    }

    public function test_les_exercices_suivent_les_memes_regles(): void
    {
        $export = $this->export([], [[
            'lessonCode' => 'fractions',
            'exerciseCode' => 'ex-frac-001',
            'level' => 2,
            'title' => 'Comparer',
            'questionCount' => 3,
        ]]);

        $this->importer()->import($export);
        PracticeExercise::where('exercise_code', 'ex-frac-001')
            ->update(['publication_status' => PracticeExercise::PUB_HIDDEN]);

        $this->importer()->import($export);

        $exercise = PracticeExercise::where('exercise_code', 'ex-frac-001')->first();
        $this->assertSame(PracticeExercise::PUB_HIDDEN, $exercise->publication_status);
        $this->assertSame(3, $exercise->question_count);
    }

    /**
     * Un code de leçon se répète d'une classe à l'autre ('resolution-problemes'
     * existe en 6e et en 3e). Sans classe pour trancher, on refuse plutôt que
     * d'accrocher les modules d'une 6e sous la leçon de 3e.
     */
    public function test_une_lecon_ambigue_n_est_pas_devinee(): void
    {
        $other = Grade::create(['code' => '3e', 'name' => 'Troisième', 'level' => 'college']);
        $otherChapter = Chapter::create(['grade_id' => $other->id, 'code' => 'nombres_calculs', 'title' => 'Nombres', 'order' => 0]);
        Lesson::create([
            'chapter_id' => $otherChapter->id, 'code' => 'fractions',
            'title' => 'Fractions 3e', 'status' => 'available', 'order' => 0,
        ]);

        $export = $this->export([$this->module('01')]);
        $export['lessons'][0]['grade'] = null;

        $summary = $this->importer()->import($export);

        $this->assertContains('fractions', $summary['unknownLessons']);
        $this->assertDatabaseCount('lesson_modules', 0);
    }
}
