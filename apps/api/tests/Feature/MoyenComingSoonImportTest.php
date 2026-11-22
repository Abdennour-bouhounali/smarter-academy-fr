<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Curriculum\CurriculumImporter;
use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\ProgressEngine;
use App\Domain\Progress\Recommendation\RecommendationService;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Le cycle moyen, phase 2 (2026-10-14) : les leçons 1AM–3AM entrent en base
 * AVANT d'être écrites (`coming_soon`, décision D2 du propriétaire), avec toutes
 * leurs الكفاءات — mais le serveur ne les ouvre pas, et Mastery V2 ne s'en sert
 * pas, tant qu'elles ne sont pas publiées (docs/architecture/LEARNING_NET.md §3bis).
 */
class MoyenComingSoonImportTest extends TestCase
{
    use RefreshDatabase;

    /** 3AM : une leçon à générer ; 4AM : une leçon publiée qui s'appuie sur elle. */
    private function export(string $status3am = 'coming_soon', array $lp4amPrerequisites = []): array
    {
        $grade = fn (string $code, int $order, array $lesson) => [
            'code' => $code, 'name' => $code, 'level' => 'moyen', 'order' => $order, 'active' => true,
            'chapters' => [['code' => 'ansab_al_aadad_wal_hisab', 'title' => 'ميدان', 'order' => 0, 'topics' => [], 'units' => [], 'lessons' => [$lesson]]],
        ];

        return ['grades' => [
            $grade('3am', 2, [
                'code' => 'quwa-asas-nisbi', 'officialObjectCode' => null, 'title' => 'قوى عدد نسبي', 'description' => '',
                'status' => $status3am, 'durationMinutes' => null, 'order' => 0, 'kind' => 'lesson',
                'prerequisiteLessonCodes' => [],
                'learningPoints' => [
                    ['code' => '3am_quwa-asas-nisbi_P1', 'title' => 'كتابة جداء عوامل متساوية على شكل قوة', 'order' => 1, 'prerequisites' => []],
                    ['code' => '3am_quwa-asas-nisbi_P2', 'title' => 'حساب قوة عدد نسبي', 'order' => 2, 'prerequisites' => []],
                ],
            ]),
            $grade('4am', 3, [
                'code' => 'jidhr-tarbii', 'officialObjectCode' => null, 'title' => 'الجذر التربيعي', 'description' => '',
                'status' => 'available', 'durationMinutes' => 45, 'order' => 0, 'kind' => 'lesson',
                // Prérequis de LEÇON tiré du réseau, d'une année antérieure.
                'prerequisiteLessonCodes' => ['quwa-asas-nisbi'],
                'learningPoints' => [
                    ['code' => '4am_jidhr-tarbii_P1', 'title' => 'الجذر التربيعي', 'order' => 1, 'prerequisites' => $lp4amPrerequisites],
                ],
            ]),
        ]];
    }

    public function test_a_coming_soon_lesson_is_imported_with_its_learning_points_but_stays_closed(): void
    {
        (new CurriculumImporter)->import($this->export());

        $draft = Lesson::where('code', 'quwa-asas-nisbi')->firstOrFail();
        $this->assertSame('coming_soon', $draft->status);
        $this->assertSame(Lesson::PUB_DRAFT, $draft->publication_status, 'coming_soon naît draft, jamais published');
        $this->assertFalse($draft->isVisibleToStudents());
        $this->assertSame(AccessTier::FREE, $draft->tier, 'une leçon nouvelle naît gratuite');
        $this->assertSame(2, LearningPoint::where('lesson_id', $draft->id)->whereNull('retired_at')->count(), 'toutes ses الكفاءات sont en base');

        $published = Lesson::where('code', 'jidhr-tarbii')->firstOrFail();
        $this->assertSame(Lesson::PUB_PUBLISHED, $published->publication_status, 'available naît published (comportement d’avant)');
        $this->assertNotNull($published->published_at);

        // Le prérequis de leçon d'une année antérieure est résolu (second passage).
        $this->assertDatabaseHas('lesson_prerequisites', ['lesson_id' => $published->id, 'prerequisite_lesson_id' => $draft->id]);
        $this->assertSame(0, Lesson::visibleToStudents()->where('code', 'quwa-asas-nisbi')->count());
    }

    public function test_publishing_flips_coming_soon_to_available_and_opens_the_lesson_without_touching_its_tier(): void
    {
        (new CurriculumImporter)->import($this->export());
        Lesson::where('code', 'quwa-asas-nisbi')->update(['tier' => AccessTier::PREMIUM]);

        (new CurriculumImporter)->import($this->export('available'));

        $lesson = Lesson::where('code', 'quwa-asas-nisbi')->firstOrFail();
        $this->assertSame('available', $lesson->status);
        $this->assertSame(Lesson::PUB_PUBLISHED, $lesson->publication_status);
        $this->assertNotNull($lesson->published_at);
        $this->assertSame(AccessTier::PREMIUM, $lesson->tier, 'le palier reste celui de l’administrateur');

        // Réimporter n'y change plus rien.
        (new CurriculumImporter)->import($this->export('available'));
        $this->assertSame(Lesson::PUB_PUBLISHED, $lesson->fresh()->publication_status);
    }

    public function test_the_admin_keeps_authority_over_a_published_lesson_and_a_hidden_draft(): void
    {
        (new CurriculumImporter)->import($this->export('available'));
        // Pousser en production publie (2026-11-11) : une leçon écrite restée
        // en brouillon est publiée ; l'administrateur la RETIENT en la masquant.
        Lesson::where('code', 'quwa-asas-nisbi')->update(['publication_status' => Lesson::PUB_DRAFT]);
        (new CurriculumImporter)->import($this->export('available'));
        $this->assertSame(Lesson::PUB_PUBLISHED, Lesson::where('code', 'quwa-asas-nisbi')->value('publication_status'));
        Lesson::where('code', 'quwa-asas-nisbi')->update(['publication_status' => Lesson::PUB_HIDDEN]);
        (new CurriculumImporter)->import($this->export('available'));
        $this->assertSame(Lesson::PUB_HIDDEN, Lesson::where('code', 'quwa-asas-nisbi')->value('publication_status'));

        // Une leçon redevenue coming_soon ne peut pas rester published ; hidden est gardé.
        Lesson::where('code', 'quwa-asas-nisbi')->update(['publication_status' => Lesson::PUB_PUBLISHED]);
        (new CurriculumImporter)->import($this->export());
        $this->assertSame(Lesson::PUB_DRAFT, Lesson::where('code', 'quwa-asas-nisbi')->value('publication_status'));
        Lesson::where('code', 'quwa-asas-nisbi')->update(['publication_status' => Lesson::PUB_HIDDEN]);
        (new CurriculumImporter)->import($this->export());
        $this->assertSame(Lesson::PUB_HIDDEN, Lesson::where('code', 'quwa-asas-nisbi')->value('publication_status'));
    }

    public function test_a_recommendation_never_sends_a_student_to_an_unpublished_prerequisite(): void
    {
        config(['mastery.engine_version' => 2]);
        $prerequisite = [['code' => '3am_quwa-asas-nisbi_P2', 'requiredMastery' => 0.7]];
        (new CurriculumImporter)->import($this->export('coming_soon', $prerequisite));
        $this->assertDatabaseCount('learning_point_prerequisites', 1);

        $student = User::factory()->create(['role' => 'student', 'grade' => '4am']);
        $fail = fn (string $lesson, string $lp, string $id) => app(ProgressEngine::class)->recordEvidence($student, $lesson, [
            'attemptId' => $id, 'exerciseCode' => "ex-{$id}", 'questionId' => 'q1',
            'assessmentType' => ProgressEngine::SOURCE_PRACTICE, 'outcome' => 'incorrect',
            'learningPointRefs' => [['code' => $lp, 'role' => 'primary']], 'level' => 1,
            'evaluatedBy' => EvidenceEvent::EVALUATED_BY_SERVER,
        ]);
        $fail('jidhr-tarbii', '4am_jidhr-tarbii_P1', 'a1');
        // Un état en « gap » sur le prérequis (ex. venu d'avant la mise en brouillon).
        $fail('quwa-asas-nisbi', '3am_quwa-asas-nisbi_P2', 'a2');

        $recs = fn () => collect(app(RecommendationService::class)->forLesson($student->id, Lesson::where('code', 'jidhr-tarbii')->firstOrFail()))
            ->keyBy('learningPoint.code');

        $this->assertSame('reteach', $recs()['4am_jidhr-tarbii_P1']['kind'], 'prérequis non publié : on ne renvoie pas vers lui');

        (new CurriculumImporter)->import($this->export('available', $prerequisite));
        $this->assertSame('prerequisite', $recs()['4am_jidhr-tarbii_P1']['kind'], 'publié : le renvoi s’allume de lui-même');
    }
}
