<?php

namespace Tests\Feature;

use App\Domain\Practice\PracticeCapability;
use App\Models\Chapter;
use App\Models\Entitlement;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\PracticeExercise;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Le cycle de vie COMPLET d'un exercice payant, par l'API.
 *
 * Pourquoi tout le cycle et pas seulement l'ouverture : chaque étape est un
 * point d'entrée distinct, et il suffit qu'UNE seule oublie le contrôle pour
 * que le contenu vendu se récupère par ce chemin-là. Une séance ouverte
 * pendant l'abonnement ne doit pas rester une porte ouverte après.
 *
 * Le contenu est réel (fonction-affine-2nde, la seule leçon dont la pratique
 * est activée) : un exercice inventé ne prouverait rien sur le dépôt.
 */
class ExercisePremiumAccessTest extends TestCase
{
    use RefreshDatabase;

    private const LESSON = 'fonction-affine-2nde';

    private const EXERCISE = 'ex-2de-fonction-affine-l1-001';

    private Lesson $lesson;

    private PracticeExercise $exercise;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => 'seconde', 'name' => 'Seconde', 'level' => 'lycee']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'fonctions', 'title' => 'Fonctions', 'order' => 0]);
        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => self::LESSON, 'title' => 'Fonction affine',
            'status' => 'available', 'order' => 0, 'tier' => 'free',
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);
        LearningPoint::create([
            'lesson_id' => $this->lesson->id, 'code' => 'seconde_fonction-affine-2nde_P1',
            'title' => 'Reconnaître', 'order' => 1,
        ]);
        $this->exercise = PracticeExercise::create([
            'lesson_id' => $this->lesson->id, 'exercise_code' => self::EXERCISE, 'level' => 1,
            'title' => 'Exercice 1', 'question_count' => 1,
            'publication_status' => PracticeExercise::PUB_PUBLISHED,
        ]);

        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => 'seconde']);
        PracticeCapability::forget();
    }

    private function token(): string
    {
        return $this->student->createToken('t')->plainTextToken;
    }

    private function grantSubscription(): void
    {
        Entitlement::factory()->subscription()->create(['user_id' => $this->student->id]);
    }

    /**
     * Ouvre une question. Le corps est TOUJOURS valide — `attemptUuid` est
     * fourni par le client — pour qu'un refus ne puisse venir que de la porte
     * d'accès, jamais d'une validation de format.
     */
    private function openQuestion(string $token, string $sessionId)
    {
        return $this->withToken($token)->postJson(
            "/api/v1/practice/sessions/{$sessionId}/questions",
            [
                'exerciseId' => self::EXERCISE,
                'questionId' => 'q1',
                'attemptUuid' => (string) Str::uuid(),
            ],
        );
    }

    /** Ouvre une séance et renvoie son identifiant, ou null si refusé. */
    private function openPracticeSession(string $token): ?string
    {
        $sessionId = (string) Str::uuid();
        $response = $this->withToken($token)->postJson(
            '/api/v1/lessons/'.self::LESSON.'/practice/sessions',
            ['sessionId' => $sessionId, 'level' => 1],
        );

        return $response->status() === 201 || $response->status() === 200 ? $sessionId : null;
    }

    // ───────────────────────── LISTE ─────────────────────────

    /**
     * Un exercice payant RESTE listé, avec son titre : l'élève doit voir ce
     * qu'il obtiendrait. Mais son nombre de questions est tu, et il ne compte
     * pas dans les niveaux jouables.
     */
    public function test_premium_exercise_is_listed_but_marked_locked(): void
    {
        $this->exercise->update(['tier' => 'premium']);

        $response = $this->withToken($this->token())
            ->getJson('/api/v1/lessons/'.self::LESSON.'/exercises')
            ->assertOk();

        $row = collect($response->json('exercises'))->firstWhere('exerciseCode', self::EXERCISE);

        $this->assertNotNull($row, 'L\'exercice payant doit rester visible.');
        $this->assertTrue($row['locked']);
        $this->assertSame('premium', $row['tier']);
        $this->assertSame('Exercice 1', $row['title']);
        // Le nombre de questions est une information de CONTENU.
        $this->assertNull($row['questionCount']);
    }

    public function test_premium_exercise_is_unlocked_with_a_subscription(): void
    {
        $this->exercise->update(['tier' => 'premium']);
        $this->grantSubscription();

        $response = $this->withToken($this->token())
            ->getJson('/api/v1/lessons/'.self::LESSON.'/exercises')
            ->assertOk();

        $row = collect($response->json('exercises'))->firstWhere('exerciseCode', self::EXERCISE);

        $this->assertFalse($row['locked']);
        $this->assertSame(1, $row['questionCount']);
    }

    /** Un exercice payant ne gonfle pas le compteur d'un niveau jouable. */
    public function test_locked_exercise_is_excluded_from_level_counts(): void
    {
        $this->exercise->update(['tier' => 'premium']);

        $response = $this->withToken($this->token())
            ->getJson('/api/v1/lessons/'.self::LESSON.'/exercises')
            ->assertOk();

        $level1 = $response->json('countsByLevel.1');
        $unlockedLevel1 = collect($response->json('exercises'))
            ->where('level', 1)->where('locked', false)->count();

        $this->assertSame($unlockedLevel1, $level1);
    }

    // ──────────────── OUVERTURE DE QUESTION ────────────────

    /**
     * LE test central : une séance ouverte légitimement, puis un exercice
     * payant à l'intérieur. La séance n'est pas un laissez-passer.
     */
    public function test_premium_exercise_question_cannot_be_opened_without_entitlement(): void
    {
        // La leçon est gratuite : la séance s'ouvre normalement.
        $sessionId = $this->openPracticeSession($this->token());
        $this->assertNotNull($sessionId, 'La séance d\'une leçon gratuite doit s\'ouvrir.');

        // Puis l'exercice devient payant.
        $this->exercise->update(['tier' => 'premium']);

        $this->openQuestion($this->token(), $sessionId)
            ->assertStatus(422);

        $this->assertDatabaseCount('question_attempts', 0);
    }

    public function test_premium_exercise_question_opens_with_a_subscription(): void
    {
        $this->exercise->update(['tier' => 'premium']);
        $this->grantSubscription();

        $sessionId = $this->openPracticeSession($this->token());
        $this->assertNotNull($sessionId);

        $this->openQuestion($this->token(), $sessionId)
            ->assertSuccessful();

        $this->assertDatabaseCount('question_attempts', 1);
    }

    /** Une dérogation ouvre aussi bien qu'un abonnement. */
    public function test_admin_override_opens_a_premium_exercise(): void
    {
        $this->exercise->update(['tier' => 'premium']);
        Entitlement::factory()->adminOverride()->create(['user_id' => $this->student->id]);

        $sessionId = $this->openPracticeSession($this->token());
        $this->openQuestion($this->token(), $sessionId)
            ->assertSuccessful();
    }

    /**
     * L'expiration referme une séance DÉJÀ ouverte.
     *
     * Le cas que seul un test de cycle complet attrape : l'élève ouvre sa
     * séance pendant qu'il est abonné, l'abonnement tombe, et la séance ne
     * doit plus servir de contenu.
     */
    public function test_an_open_session_stops_serving_after_the_entitlement_expires(): void
    {
        $this->exercise->update(['tier' => 'premium']);
        $entitlement = Entitlement::factory()->subscription()->create(['user_id' => $this->student->id]);

        $token = $this->token();
        $sessionId = $this->openPracticeSession($token);

        $this->openQuestion($token, $sessionId)
            ->assertSuccessful();

        // L'abonnement tombe. La séance, elle, est toujours ouverte.
        $entitlement->update(['status' => Entitlement::STATUS_REVOKED]);

        $this->openQuestion($token, $sessionId)
            ->assertStatus(422);
    }

    // ──────────────────── PUBLICATION ────────────────────

    /** La publication l'emporte toujours : abonné ou non. */
    public function test_hidden_exercise_stays_closed_with_a_subscription(): void
    {
        $this->exercise->update(['publication_status' => PracticeExercise::PUB_HIDDEN]);
        $this->grantSubscription();

        $sessionId = $this->openPracticeSession($this->token());

        $this->openQuestion($this->token(), $sessionId)
            ->assertStatus(422);
    }

    /** Une leçon payante ferme la SÉANCE : on ne va même pas plus loin. */
    public function test_premium_lesson_blocks_session_creation(): void
    {
        $this->lesson->update(['tier' => 'premium']);

        $this->assertNull($this->openPracticeSession($this->token()));
        $this->assertDatabaseCount('practice_sessions', 0);
    }

    /**
     * L'héritage : une leçon payante rend ses exercices payants, sans qu'un
     * administrateur ait à les marquer un par un.
     */
    public function test_exercises_inherit_the_lesson_tier(): void
    {
        $this->lesson->update(['tier' => 'premium']);
        $this->assertNull($this->exercise->fresh()->tier, 'L\'exercice ne déclare rien.');

        $response = $this->withToken($this->token())
            ->getJson('/api/v1/lessons/'.self::LESSON.'/exercises')
            ->assertOk();

        // La leçon étant fermée, la liste entière est tue.
        $this->assertSame('premium_required', $response->json('reason'));
        $this->assertSame([], $response->json('exercises'));
    }

    /**
     * L'exception inverse : un exercice explicitement gratuit reste ouvert
     * sous une leçon payante… mais la leçon, elle, reste fermée. Le palier de
     * l'exercice n'ouvre pas la porte de sa leçon.
     */
    public function test_a_free_exercise_does_not_open_a_premium_lesson(): void
    {
        $this->lesson->update(['tier' => 'premium']);
        $this->exercise->update(['tier' => 'free']);

        $this->assertNull($this->openPracticeSession($this->token()));
    }
}
