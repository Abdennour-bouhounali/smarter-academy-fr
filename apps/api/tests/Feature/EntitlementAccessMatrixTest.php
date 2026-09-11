<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Entitlement;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\PracticeExercise;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * La matrice d'accès, prise au mot (spec §40).
 *
 * Deux invariants s'y croisent, et c'est leur CROISEMENT qui est testé :
 *
 *   1. Un droit d'accès valide n'ouvre rien qui ne soit publié.
 *   2. Une publication n'ouvre rien à qui n'a pas le droit.
 *
 * Le premier est celui qui se casse en silence : il suffit qu'un jour
 * quelqu'un fasse « court-circuiter la publication pour les dérogations, ce
 * sera plus pratique pour tester » pour que du contenu faux devienne visible
 * à des élèves payants. Les lignes `admin_override + masqué` de cette table
 * sont là pour que ce changement casse un test au lieu de partir en
 * production.
 */
class EntitlementAccessMatrixTest extends TestCase
{
    use RefreshDatabase;

    private Lesson $lesson;

    private LessonModule $module;

    private PracticeExercise $exercise;

    protected function setUp(): void
    {
        parent::setUp();

        $grade = Grade::create(['code' => 'seconde', 'name' => 'Seconde', 'level' => 'lycee']);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'fonctions', 'title' => 'Fonctions', 'order' => 0]);

        $this->lesson = Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fonction-affine-2nde',
            'title' => 'Fonction affine', 'status' => 'available', 'order' => 0,
            'tier' => 'free',
            'publication_status' => Lesson::PUB_PUBLISHED,
        ]);
        $this->module = LessonModule::create([
            'lesson_id' => $this->lesson->id, 'code' => '01', 'number' => 1,
            'title' => 'Découvrir', 'publication_status' => LessonModule::PUB_PUBLISHED,
        ]);
        $this->exercise = PracticeExercise::create([
            'lesson_id' => $this->lesson->id, 'exercise_code' => 'ex-01', 'level' => 1,
            'title' => 'Exercice 1', 'publication_status' => PracticeExercise::PUB_PUBLISHED,
        ]);
        LearningPoint::create([
            'lesson_id' => $this->lesson->id, 'code' => 'seconde_fonction-affine-2nde_P1',
            'title' => 'Reconnaître une fonction affine', 'order' => 1,
        ]);
    }

    /**
     * La table de la spec §40, ligne par ligne.
     *
     * @return array<string, array{0: string, 1: ?string, 2: string, 3: string, 4: string, 5: bool}>
     */
    public static function matrix(): array
    {
        return [
            //                                compte       droit                  leçon        module     exercice    attendu
            'gratuit, aucun droit' => ['active',    null,                  'free',      'published', 'published', true],
            'payant, aucun droit' => ['active',    null,                  'premium',   'published', 'published', false],
            'payant, abonnement valide' => ['active',    'subscription',        'premium',   'published', 'published', true],
            'payant, abonnement expiré' => ['active',    'expired',             'premium',   'published', 'published', false],
            'payant, abonnement à venir' => ['active',    'future',              'premium',   'published', 'published', false],
            'payant, abonnement révoqué' => ['active',    'revoked',             'premium',   'published', 'published', false],
            'payant, dérogation' => ['active',    'override',            'premium',   'published', 'published', true],
            // Les deux lignes qui comptent : le droit n'est PAS un passe-droit.
            'dérogation + leçon masquée' => ['active',    'override',            'hidden',    'published', 'published', false],
            'dérogation + module masqué' => ['active',    'override',            'premium',   'hidden',    'published', false],
            'abonnement + module masqué' => ['active',    'subscription',        'free',      'hidden',    'published', false],
            // Le statut de compte domine tout.
            'suspendu + abonnement' => ['suspended', 'subscription',        'free',      'published', 'published', false],
            'suspendu + gratuit' => ['suspended', null,                  'free',      'published', 'published', false],
        ];
    }

    /**
     * Le niveau EXERCICE a sa propre table, plus bas : la sauvegarde d'une
     * progression n'ouvre aucun exercice, donc masquer un exercice ne doit
     * (et ne peut) pas la refuser. Les mélanger ferait passer un test pour la
     * mauvaise raison — c'est exactement ce que la première version de ce
     * fichier faisait.
     */
    #[DataProvider('matrix')]
    public function test_access_matrix(
        string $accountStatus,
        ?string $entitlement,
        string $tier,
        string $modulePub,
        string $exercisePub,
        bool $expected,
    ): void {
        $this->lesson->update([
            'tier' => $tier === 'hidden' ? 'premium' : $tier,
            'publication_status' => $tier === 'hidden' ? Lesson::PUB_HIDDEN : Lesson::PUB_PUBLISHED,
        ]);
        $this->module->update(['publication_status' => $modulePub]);
        $this->exercise->update(['publication_status' => $exercisePub]);

        $student = User::factory()->create([
            'role' => User::ROLE_STUDENT, 'grade' => 'seconde', 'account_status' => $accountStatus,
        ]);
        $this->giveEntitlement($student, $entitlement);

        $token = $student->createToken('t')->plainTextToken;

        // On teste par l'API — pas par le service. Un droit correctement
        // évalué dans une classe que personne n'appelle ne protège rien.
        $response = $this->withToken($token)->putJson(
            "/api/v1/lessons/{$this->lesson->code}/progress",
            $this->payload(),
        );

        if ($expected) {
            $response->assertOk();
            $this->assertTrue($response->json('success'));
        } else {
            $this->assertNotEquals(200, $response->status(), 'L\'accès aurait dû être refusé.');
        }
    }

    /**
     * Le cas qui n'apparaît pas dans une table : un contenu MASQUÉ dont
     * l'élève a par ailleurs tous les droits reste fermé, et le module masqué
     * ne s'ouvre pas non plus sous une leçon publiée.
     */
    public function test_admin_override_never_bypasses_publication(): void
    {
        $this->lesson->update(['tier' => 'premium', 'publication_status' => Lesson::PUB_HIDDEN]);
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => 'seconde']);
        Entitlement::factory()->adminOverride()->create(['user_id' => $student->id]);

        $token = $student->createToken('t')->plainTextToken;

        $this->withToken($token)
            ->putJson("/api/v1/lessons/{$this->lesson->code}/progress", $this->payload(['completedModules' => []]))
            ->assertStatus(422);

        // Et le message ne dit pas « abonnement » : la leçon est masquée, pas
        // payante-inaccessible. Confondre les deux enverrait l'élève payer
        // pour du contenu qui ne s'ouvrirait pas davantage.
        $this->assertStringNotContainsString(
            'premium',
            $this->withToken($token)
                ->putJson("/api/v1/lessons/{$this->lesson->code}/progress", $this->payload(['completedModules' => []]))
                ->json('message'),
        );
    }

    /** Un élève ne peut pas se servir du droit d'un autre. */
    public function test_entitlement_is_not_transferable(): void
    {
        $this->lesson->update(['tier' => 'premium']);

        $payer = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => 'seconde']);
        Entitlement::factory()->subscription()->create(['user_id' => $payer->id]);

        $freeloader = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => 'seconde']);
        $token = $freeloader->createToken('t')->plainTextToken;

        // Le corps de la requête PRÉTEND être l'élève abonné. Le serveur ne
        // lit jamais l'identité depuis le corps — elle vient du jeton.
        $this->withToken($token)
            ->putJson("/api/v1/lessons/{$this->lesson->code}/progress", $this->payload([
                'completedModules' => [],
                'user_id' => $payer->id,
                'entitlement' => ['type' => 'subscription', 'status' => 'active'],
                'premiumAccess' => true,
            ]))
            ->assertStatus(422);

        $this->assertDatabaseMissing('entitlements', ['user_id' => $freeloader->id]);
    }

    /** Un élève ne peut pas s'accorder un droit : la route n'existe pas pour lui. */
    public function test_student_cannot_mutate_entitlements(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $token = $student->createToken('t')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/v1/admin/students/{$student->id}/entitlements/override", [])
            ->assertStatus(403);

        $this->assertDatabaseCount('entitlements', 0);
    }

    /**
     * Le badge suit le CONTENU, le verrou suit l'ÉLÈVE.
     *
     * Écrit après l'avoir manqué au navigateur : `locked` se vide dès que
     * l'élève a accès, si bien qu'une leçon payante qu'il peut ouvrir
     * n'apparaissait plus nulle part comme payante — le contenu vendu se
     * déguisait en gratuit, et sa disparition à l'échéance serait
     * incompréhensible. Il fallait donc DEUX listes.
     */
    public function test_premium_is_reported_even_when_the_student_has_access(): void
    {
        $this->lesson->update(['tier' => 'premium']);
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => 'seconde']);

        // Sans droit : payant ET verrouillé.
        $response = $this->withToken($student->createToken('a')->plainTextToken)
            ->getJson('/api/v1/content/availability')->assertOk();
        $this->assertSame([$this->lesson->code], $response->json('closed.premium'));
        $this->assertSame([$this->lesson->code], $response->json('closed.locked'));

        // Avec droit : toujours payant, mais plus verrouillé.
        Entitlement::factory()->subscription()->create(['user_id' => $student->id]);

        $response = $this->withToken($student->createToken('b')->plainTextToken)
            ->getJson('/api/v1/content/availability')->assertOk();
        $this->assertSame([$this->lesson->code], $response->json('closed.premium'));
        $this->assertSame([], $response->json('closed.locked'));
    }

    /** Un catalogue entièrement gratuit ne signale ni payant ni verrouillé. */
    public function test_a_free_catalogue_reports_nothing_premium(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => 'seconde']);

        $response = $this->withToken($student->createToken('t')->plainTextToken)
            ->getJson('/api/v1/content/availability')->assertOk();

        $this->assertSame([], $response->json('closed.premium'));
        $this->assertSame([], $response->json('closed.locked'));
    }

    /**
     * Le niveau EXERCICE : la liste et l'ouverture d'une séance.
     *
     * Deux points d'entrée seulement, parce que tout le reste du moteur exige
     * une séance déjà ouverte et hérite donc de ce contrôle.
     */
    public function test_premium_lesson_lists_no_exercises_without_entitlement(): void
    {
        $this->lesson->update(['tier' => 'premium']);
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => 'seconde']);
        $token = $student->createToken('t')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson("/api/v1/lessons/{$this->lesson->code}/exercises")
            ->assertOk();

        // Ni titre, ni nombre de questions : le catalogue d'exercices fait
        // partie de ce qui est vendu (spec §46).
        $this->assertSame([], $response->json('exercises'));
        $this->assertFalse($response->json('available'));
        $this->assertSame('premium_required', $response->json('reason'));
        $this->assertStringNotContainsString('Exercice 1', $response->getContent());
    }

    public function test_premium_lesson_lists_exercises_with_entitlement(): void
    {
        $this->lesson->update(['tier' => 'premium']);
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => 'seconde']);
        Entitlement::factory()->subscription()->create(['user_id' => $student->id]);

        $response = $this->withToken($student->createToken('t')->plainTextToken)
            ->getJson("/api/v1/lessons/{$this->lesson->code}/exercises")
            ->assertOk();

        $this->assertNotSame('premium_required', $response->json('reason'));
    }

    public function test_practice_session_refused_without_entitlement(): void
    {
        $this->lesson->update(['tier' => 'premium']);
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => 'seconde']);

        $this->withToken($student->createToken('t')->plainTextToken)
            ->postJson("/api/v1/lessons/{$this->lesson->code}/practice/sessions", [
                'sessionId' => (string) Str::uuid(),
                'level' => 1,
            ])
            ->assertStatus(422);

        // Aucune séance créée : l'accumulation de preuves passe par là, donc
        // un refus qui laisserait la séance ouverte laisserait un chemin
        // d'écriture derrière lui.
        $this->assertDatabaseCount('practice_sessions', 0);
    }

    /**
     * Un corps de requête VALIDE.
     *
     * La validation de format passe avant le contrôle d'accès dans le
     * contrôleur : un corps incomplet produirait un 422 de validation qu'un
     * test de refus confondrait avec un 422 d'accès. On envoie donc toujours
     * un corps correct, pour que le seul motif possible de refus soit celui
     * qu'on teste.
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'completedModules' => ['1'],
            'currentModule' => 1,
            'status' => 'in_progress',
            'lastActivityAt' => Carbon::now()->toIso8601String(),
        ], $overrides);
    }

    private function giveEntitlement(User $student, ?string $kind): void
    {
        match ($kind) {
            'subscription' => Entitlement::factory()->subscription()->create(['user_id' => $student->id]),
            'override' => Entitlement::factory()->adminOverride()->create(['user_id' => $student->id]),
            'expired' => Entitlement::factory()->subscription()->expired()->create(['user_id' => $student->id]),
            'future' => Entitlement::factory()->subscription()->future()->create(['user_id' => $student->id]),
            'revoked' => Entitlement::factory()->subscription()->revoked()->create(['user_id' => $student->id]),
            default => null,
        };
    }
}
