<?php

namespace Tests\Feature;

use App\Domain\Practice\AnswerImageStore;
use App\Domain\Practice\PracticeCapability;
use App\Models\AnswerImage;
use App\Models\AnswerReview;
use App\Models\Chapter;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\Grade;
use App\Models\LearningEvidence;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\QuestionAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Réponses en PHOTO et correction par l'ENSEIGNANT (prototype BEM `bahth-pgcd`,
 * décisions du propriétaire 2026-10-06 — EXERCISE_CONTRACT.md § « Image
 * answers and teacher validation »).
 *
 * Exercice utilisé : ex-4am-bahth-pgcd-l2-002 — q1 « احسب الفرق 117 − 91 »
 * (rational, 26), q3 « بيّن أن … » (selfCheck), q2 PGCD par différences
 * (rational, rédaction exigée, 13).
 */
class AnswerImagesAndTeacherReviewTest extends TestCase
{
    use RefreshDatabase;

    private const EXERCISE = 'ex-4am-bahth-pgcd-l2-002';

    protected function setUp(): void
    {
        parent::setUp();
        config(['mastery.engine_version' => 2, 'mastery.server_evaluation' => true]);
        PracticeCapability::forget();
        Storage::fake(AnswerImageStore::DISK);

        $grade = Grade::create(['code' => '4am', 'name' => 'السنة الرابعة متوسط', 'level' => 'moyen']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'ansab_al_aadad_wal_hisab', 'title' => 'ميدان أنساب الأعداد والحساب', 'order' => 0]);
        $lesson = Lesson::create(['chapter_id' => $chapter->id, 'code' => 'bahth-pgcd', 'title' => 'البحث عن PGCD', 'status' => 'available', 'order' => 0]);
        foreach ([1, 2] as $n) {
            LearningPoint::create(['lesson_id' => $lesson->id, 'code' => "4am_bahth-pgcd_P{$n}", 'title' => "P{$n}", 'order' => $n]);
        }
    }

    private function student(): User
    {
        return User::factory()->create(['role' => 'student', 'grade' => '4am']);
    }

    /** Une classe de l'enseignant, l'élève dedans, en « تصحيح الأستاذ ». */
    private function teacherMode(User $student): array
    {
        $teacher = User::factory()->create(['role' => 'teacher']);
        $classroom = Classroom::factory()->ownedBy($teacher)->create();
        ClassroomMembership::factory()->in($classroom)->of($student)->create();
        $this->actingAs($teacher)->patchJson("/api/v1/teacher/classrooms/{$classroom->id}/students/{$student->id}/settings", ['practiceValidation' => 'teacher'])
            ->assertOk()->assertJsonPath('settings.practiceValidation', 'teacher');

        return [$teacher, $classroom];
    }

    private function practiceSession(User $student): string
    {
        $sessionId = (string) Str::uuid();
        $this->actingAs($student)->postJson('/api/v1/lessons/bahth-pgcd/practice/sessions', ['sessionId' => $sessionId, 'level' => 2])->assertSuccessful();

        return $sessionId;
    }

    private function open(User $student, string $sessionId, string $questionId): string
    {
        $uuid = (string) Str::uuid();
        $this->actingAs($student)->postJson("/api/v1/practice/sessions/{$sessionId}/questions", [
            'exerciseId' => self::EXERCISE, 'questionId' => $questionId, 'attemptUuid' => $uuid,
        ])->assertSuccessful();

        return $uuid;
    }

    private function photo(int $w = 2400, int $h = 1200): UploadedFile
    {
        return UploadedFile::fake()->image('copie.jpg', $w, $h);
    }

    private function upload(User $student, string $attemptUuid, ?UploadedFile $file = null)
    {
        return $this->actingAs($student)->post("/api/v1/practice/question-attempts/{$attemptUuid}/images", ['image' => $file ?? $this->photo()], ['Accept' => 'application/json']);
    }

    private function answer(User $student, string $sessionId, string $attemptUuid, array $answer)
    {
        return $this->actingAs($student)->postJson("/api/v1/practice/sessions/{$sessionId}/answers", ['attemptUuid' => $attemptUuid, 'answer' => $answer]);
    }

    public function test_photos_are_reencoded_privately_without_metadata_and_capped(): void
    {
        $student = $this->student();
        $sessionId = $this->practiceSession($student);
        $attempt = $this->open($student, $sessionId, 'q1');

        // Un JPEG porteur d'un bloc EXIF (APP1) : il ne doit pas survivre.
        $source = $this->photo(800, 600);
        $jpeg = (string) file_get_contents($source->getRealPath());
        $exif = "Exif\0\0MM\0*GPS-SECRET-48.85N";
        $withExif = substr($jpeg, 0, 2)."\xFF\xE1".pack('n', strlen($exif) + 2).$exif.substr($jpeg, 2);
        $path = tempnam(sys_get_temp_dir(), 'exif').'.jpg';
        file_put_contents($path, $withExif);

        $id = $this->upload($student, $attempt, new UploadedFile($path, 'copie.jpg', 'image/jpeg', null, true))
            ->assertCreated()->json('image.id');
        $image = AnswerImage::where('uuid', $id)->firstOrFail();
        $bytes = Storage::disk(AnswerImageStore::DISK)->get($image->disk_path);
        $this->assertStringNotContainsString('GPS-SECRET', $bytes);
        $this->assertStringStartsWith('answer-images/', $image->disk_path);
        $this->assertTrue($image->expires_at->greaterThan(now()->addMonths(11)));

        // Plus grand côté ramené à 1600 px.
        $big = $this->upload($student, $attempt)->assertCreated()->json('image');
        $this->assertSame(1600, $big['width']);
        $this->assertSame(800, $big['height']);

        // Pas une image ; puis la 4e photo ; puis trop lourde.
        $this->upload($student, $attempt, UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf'))
            ->assertStatus(422)->assertJsonPath('code', AnswerImageStore::UNSUPPORTED);
        $this->upload($student, $attempt)->assertCreated();
        $this->upload($student, $attempt)->assertStatus(422)->assertJsonPath('code', AnswerImageStore::LIMIT_REACHED);

        // Un autre élève ne joint rien à cette étape et ne lit pas la photo.
        $other = $this->student();
        $this->upload($other, $attempt)->assertNotFound();
        $this->actingAs($other)->get("/api/v1/practice/answer-images/{$id}")->assertNotFound();
        $this->actingAs($student)->get("/api/v1/practice/answer-images/{$id}")->assertOk()->assertHeader('Content-Type', 'image/jpeg');

        // Retirer avant de répondre, oui.
        $this->actingAs($student)->deleteJson("/api/v1/practice/answer-images/{$id}")->assertOk();
        $this->assertSame(2, AnswerImage::count());
    }

    public function test_an_independent_student_self_marks_an_image_only_answer_without_mastery_or_medal(): void
    {
        $student = $this->student();
        $sessionId = $this->practiceSession($student);
        $attempt = $this->open($student, $sessionId, 'q1');
        $imageId = $this->upload($student, $attempt)->json('image.id');

        // Photo seulement : rien d'évaluable → auto-évaluation, comme une « بيّن أن ».
        $this->answer($student, $sessionId, $attempt, ['seconds' => 30, 'images' => ['forged-by-client']])
            ->assertStatus(201)->assertJsonPath('evaluation.outcome', 'abandoned')->assertJsonPath('evaluation.normalized', 'self:pending');
        $stored = QuestionAttempt::where('attempt_uuid', $attempt)->first()->submitted_answer;
        $this->assertSame([$imageId], $stored['images']); // la liste du SERVEUR
        $this->assertTrue($stored['imageOnly']);

        // Verrouillée : plus de photo, ni d'ajout ni de retrait.
        $this->upload($student, $attempt)->assertStatus(422)->assertJsonPath('code', AnswerImageStore::LOCKED);
        $this->actingAs($student)->deleteJson("/api/v1/practice/answer-images/{$imageId}")->assertStatus(422);

        $this->answer($student, $sessionId, $attempt, ['selfMark' => 'correct'])
            ->assertStatus(201)->assertJsonPath('evaluation.outcome', 'correct');
        $this->assertDatabaseHas('question_attempts', ['attempt_uuid' => $attempt, 'evaluated_by' => 'self']);
        $this->assertSame(0, LearningEvidence::count());
        $this->actingAs($student)->getJson('/api/v1/lessons/bahth-pgcd/practice/medals')->assertJsonPath('total.points', 0);
        $this->assertSame(0, AnswerReview::count());

        // « التمرين السابق » relit la photo.
        $this->actingAs($student)->getJson("/api/v1/practice/sessions/{$sessionId}/answers")
            ->assertJsonPath('exercises.0.questions.0.images.0.id', $imageId);
    }

    /**
     * Une étape « هل … ؟ برّر » (choix نعم / لا) répondue en PHOTO sans case cochée : rien
     * d'évaluable à la machine, donc en attente — de l'enseignant ou de la note de l'élève —,
     * jamais « ليس بعد » d'emblée (constaté au déploiement de l'unité 2, 2026-10-06).
     */
    public function test_a_photo_on_a_choice_step_without_a_ticked_box_waits_like_any_image_only_answer(): void
    {
        $student = $this->student();
        $sessionId = (string) Str::uuid();
        $this->actingAs($student)->postJson('/api/v1/lessons/bahth-pgcd/practice/sessions', ['sessionId' => $sessionId, 'level' => 4])->assertSuccessful();
        $attempt = (string) Str::uuid();
        $this->actingAs($student)->postJson("/api/v1/practice/sessions/{$sessionId}/questions", [
            'exerciseId' => 'ex-4am-bahth-pgcd-l4-005', 'questionId' => 'q1', 'attemptUuid' => $attempt,
        ])->assertSuccessful();
        $this->upload($student, $attempt)->assertSuccessful();
        $this->answer($student, $sessionId, $attempt, ['seconds' => 30])
            ->assertStatus(201)->assertJsonPath('evaluation.outcome', 'abandoned')->assertJsonPath('evaluation.normalized', 'self:pending');
        $this->assertTrue(QuestionAttempt::where('attempt_uuid', $attempt)->first()->submitted_answer['imageOnly']);
    }

    public function test_in_teacher_mode_proofs_and_photos_wait_for_the_teacher_who_decides_mastery_and_medal(): void
    {
        $student = $this->student();
        [$teacher, $classroom] = $this->teacherMode($student);
        $this->actingAs($student)->getJson('/api/v1/me/settings')->assertJsonPath('effectiveValidation', 'teacher');
        $sessionId = $this->practiceSession($student);

        // 1. Réponse saisie seule, étape sans rédaction : verdict automatique immédiat, pas de file.
        $typed = $this->open($student, $sessionId, 'q1');
        $this->answer($student, $sessionId, $typed, ['value' => '26'])->assertStatus(201)->assertJsonPath('evaluation.outcome', 'correct');
        $this->assertSame(0, AnswerReview::count());

        // 2. « بيّن أن » : en attente de l'enseignant, l'élève ne peut pas se noter.
        $proof = $this->open($student, $sessionId, 'q3');
        $text = 'PGCD(117 ; 91) = PGCD(91 ; 26) لأن 117 − 91 = 26';
        $this->answer($student, $sessionId, $proof, ['text' => $text, 'seconds' => 40])
            ->assertStatus(201)->assertJsonPath('evaluation.normalized', 'review:pending')->assertJsonPath('evaluation.feedbackKey', 'pending');
        $this->answer($student, $sessionId, $proof, ['text' => $text, 'selfMark' => 'correct'])
            ->assertStatus(422)->assertJsonPath('message', 'review_pending');

        // 3. Réponse saisie + rédaction exigée + photo : jugée tout de suite, avis de l'enseignant en plus.
        $worked = $this->open($student, $sessionId, 'q2');
        $photo = $this->upload($student, $worked)->json('image.id');
        $this->answer($student, $sessionId, $worked, ['value' => '13', 'work' => '117−91=26 ; 91−26=65 …'])
            ->assertStatus(201)->assertJsonPath('evaluation.outcome', 'correct');
        $this->assertDatabaseHas('answer_reviews', ['kind' => 'feedback', 'status' => 'pending']);

        // La file de l'enseignant : deux copies, sans courriel.
        $queue = $this->actingAs($teacher)->getJson('/api/v1/teacher/reviews')->assertOk()->assertJsonPath('total', 2);
        $this->assertStringNotContainsString($student->email, $queue->getContent());
        $this->actingAs($teacher)->getJson('/api/v1/teacher/reviews/count')->assertJsonPath('pending', 2);
        $this->actingAs($teacher)->getJson("/api/v1/teacher/reviews?classroom={$classroom->id}")->assertJsonPath('total', 2);
        $this->actingAs($teacher)->get("/api/v1/teacher/answer-images/{$photo}")->assertOk();

        // Un autre enseignant ne voit rien.
        $stranger = User::factory()->create(['role' => 'teacher']);
        $this->actingAs($stranger)->getJson('/api/v1/teacher/reviews')->assertJsonPath('total', 0);
        $this->actingAs($stranger)->get("/api/v1/teacher/answer-images/{$photo}")->assertNotFound();
        $proofReview = AnswerReview::where('kind', 'verdict')->firstOrFail();
        $this->actingAs($stranger)->postJson("/api/v1/teacher/reviews/{$proofReview->id}", ['verdict' => 'correct'])->assertNotFound();

        // L'enseignant annote la photo (image À PART) et juge.
        $this->actingAs($teacher)->post("/api/v1/teacher/answer-images/{$photo}/annotation", ['image' => $this->photo(800, 400)], ['Accept' => 'application/json'])
            ->assertOk()->assertJsonPath('image.annotated', true);
        $this->actingAs($student)->get("/api/v1/practice/answer-images/{$photo}?annotated=1")->assertOk();

        $this->actingAs($teacher)->postJson("/api/v1/teacher/reviews/{$proofReview->id}", ['verdict' => 'correct', 'comment' => 'برهان سليم، أحسنت.'])
            ->assertOk()->assertJsonPath('review.status', 'reviewed');
        $this->actingAs($teacher)->postJson("/api/v1/teacher/reviews/{$proofReview->id}", ['verdict' => 'incorrect'])->assertStatus(409);

        // La décision est l'issue : preuve « teacher », médaille d'or (40 s < 90 s).
        $this->assertDatabaseHas('question_attempts', ['attempt_uuid' => $proof, 'outcome' => 'correct', 'evaluated_by' => 'teacher']);
        $this->assertDatabaseHas('learning_evidence', ['attempt_id' => $proof, 'evaluated_by' => 'teacher']);
        $medals = $this->actingAs($student)->getJson('/api/v1/lessons/bahth-pgcd/practice/medals')->json('total');
        $this->assertSame(3, $medals['gold']); // q1, q2 (serveur) + q3 (enseignant)

        // La cloche de l'élève, et la correction qu'elle ouvre.
        $bell = $this->actingAs($student)->getJson('/api/v1/me/notifications')->assertOk()->assertJsonPath('unread', 1);
        $this->assertSame($proofReview->id, $bell->json('notifications.0.data.reviewId'));
        $this->assertSame('q3', $bell->json('notifications.0.data.questionId'));
        $this->actingAs($student)->getJson("/api/v1/practice/reviews/{$proofReview->id}")->assertOk()
            ->assertJsonPath('exerciseId', self::EXERCISE)->assertJsonPath('questionId', 'q3')
            ->assertJsonPath('review.comment', 'برهان سليم، أحسنت.')->assertJsonPath('review.verdict', 'correct');
        $this->actingAs($this->student())->getJson("/api/v1/practice/reviews/{$proofReview->id}")->assertNotFound();
        $this->actingAs($student)->postJson('/api/v1/me/notifications/'.$bell->json('notifications.0.id').'/read')->assertJsonPath('unread', 0);

        // L'avis sur une réponse déjà jugée ne change pas l'issue.
        $feedback = AnswerReview::where('kind', 'feedback')->firstOrFail();
        $this->actingAs($teacher)->postJson("/api/v1/teacher/reviews/{$feedback->id}", ['verdict' => 'incorrect', 'comment' => 'الخطوات ناقصة'])->assertOk();
        $this->assertDatabaseHas('question_attempts', ['attempt_uuid' => $worked, 'outcome' => 'correct', 'evaluated_by' => 'server']);
    }

    public function test_an_image_only_answer_in_teacher_mode_waits_and_a_student_who_leaves_takes_his_copy_back(): void
    {
        $student = $this->student();
        [$teacher, $classroom] = $this->teacherMode($student);
        $sessionId = $this->practiceSession($student);
        $attempt = $this->open($student, $sessionId, 'q1');
        $photo = $this->upload($student, $attempt)->json('image.id');
        $this->answer($student, $sessionId, $attempt, ['seconds' => 20])
            ->assertStatus(201)->assertJsonPath('evaluation.normalized', 'review:pending');
        $this->actingAs($teacher)->getJson('/api/v1/teacher/reviews')->assertJsonPath('total', 1)
            ->assertJsonPath('items.0.images.0.id', $photo);

        // L'élève quitte la classe : l'enseignant perd l'accès, l'élève garde sa copie.
        $this->actingAs($student)->postJson("/api/v1/student/classrooms/{$classroom->id}/leave")->assertOk();
        $this->actingAs($teacher)->getJson('/api/v1/teacher/reviews')->assertJsonPath('total', 0);
        $this->actingAs($teacher)->get("/api/v1/teacher/answer-images/{$photo}")->assertNotFound();
        $this->actingAs($student)->get("/api/v1/practice/answer-images/{$photo}")->assertOk();

        // Redevenu autonome, il peut se noter ; la demande est retirée.
        $this->answer($student, $sessionId, $attempt, ['selfMark' => 'incorrect'])
            ->assertStatus(201)->assertJsonPath('evaluation.outcome', 'incorrect');
        $this->assertDatabaseHas('answer_reviews', ['question_attempt_id' => QuestionAttempt::where('attempt_uuid', $attempt)->value('id'), 'status' => 'withdrawn']);
    }

    public function test_expired_photos_are_purged_with_their_files(): void
    {
        $student = $this->student();
        $sessionId = $this->practiceSession($student);
        $attempt = $this->open($student, $sessionId, 'q1');
        $id = $this->upload($student, $attempt)->json('image.id');
        $image = AnswerImage::where('uuid', $id)->firstOrFail();
        $image->update(['expires_at' => now()->subDay()]);

        $this->actingAs($student)->get("/api/v1/practice/answer-images/{$id}")->assertNotFound();
        $this->artisan('smarter:answer-images:purge')->assertSuccessful();
        $this->assertSame(0, AnswerImage::count());
        Storage::disk(AnswerImageStore::DISK)->assertMissing($image->disk_path);
    }

    public function test_a_student_cannot_choose_teacher_validation_himself(): void
    {
        $student = $this->student();
        $this->actingAs($student)->patchJson('/api/v1/me/settings', ['practiceValidation' => 'teacher'])->assertOk()
            ->assertJsonPath('settings.practiceValidation', 'self');
        $this->actingAs($student)->getJson('/api/v1/me/settings')->assertJsonPath('effectiveValidation', 'self');
    }
}
