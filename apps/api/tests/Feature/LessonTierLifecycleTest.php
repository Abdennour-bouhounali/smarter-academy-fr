<?php

namespace Tests\Feature;

use App\Domain\Curriculum\CurriculumImporter;
use App\Models\Entitlement;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * Le cycle de vie du PALIER d'une leçon, de bout en bout :
 *
 *   import (leçon nouvelle → free) → l'administrateur la passe premium
 *   → l'élève sans droit est refusé, l'abonné passe, le visiteur voit le verrou
 *   → une resynchronisation du catalogue NE la remet PAS gratuite
 *   → l'administrateur la repasse gratuite → la resynchronisation ne la
 *     remet PAS premium → l'élève y accède de nouveau.
 *
 * L'invariant : `lessons.tier` est la seule source de vérité, et
 * l'administrateur en est l'autorité. Le catalogue (l'export) décrit ce
 * qu'est une leçon, jamais qui peut l'ouvrir. Aucun code de leçon n'a de
 * sens particulier ici : les codes de ce fichier sont inventés, et la règle
 * vaut pour toute leçon, présente ou future.
 */
class LessonTierLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private CurriculumImporter $importer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->importer = new CurriculumImporter;
    }

    /**
     * Un export de la forme exacte de exportCurriculum.mjs : classe active,
     * ميدان, وحدة, leçons — SANS palier, comme le catalogue d'aujourd'hui.
     *
     * @param  array<int, string>  $codes
     */
    private function export(array $codes = ['lecon-alpha', 'lecon-beta'], array $lessonOverrides = []): array
    {
        $lessons = [];
        foreach (array_values($codes) as $i => $code) {
            $lessons[] = array_merge([
                'code' => $code,
                'officialObjectCode' => null,
                'title' => "عنوان {$code}",
                'description' => 'وصف',
                'status' => 'available',
                'durationMinutes' => 45,
                'order' => $i,
                'unitCode' => 'wahda-1',
                'kind' => 'lesson',
                'titleSource' => 'textbook',
                'textbookRef' => null,
                'prerequisiteLessonCodes' => [],
                'learningPoints' => [
                    ['code' => "4am_{$code}_P1", 'title' => 'نقطة 1', 'order' => 1, 'prerequisites' => []],
                ],
            ], $lessonOverrides[$code] ?? []);
        }

        return ['exportedAt' => null, 'grades' => [[
            'code' => '4am', 'name' => 'السنة الرابعة متوسط', 'level' => 'moyen', 'order' => 0, 'active' => true,
            'chapters' => [[
                'code' => 'midan-1', 'title' => 'ميدان', 'order' => 0, 'topics' => [],
                'units' => [['code' => 'wahda-1', 'title' => 'وحدة', 'order' => 0]],
                'lessons' => $lessons,
            ]],
        ]]];
    }

    /**
     * Plusieurs comptes se succèdent dans un même test : Sanctum garde en
     * mémoire l'utilisateur du premier jeton, d'où l'oubli des gardes à
     * chaque changement (même geste que CommercialFixtures::withToken).
     */
    public function withToken($token, $type = 'Bearer')
    {
        $this->app['auth']->forgetGuards();

        return parent::withToken($token, $type);
    }

    /** Un visiteur : aucun jeton, aucune garde en mémoire. */
    private function asGuest(): static
    {
        $this->app['auth']->forgetGuards();
        $this->withoutToken();

        return $this;
    }

    private function adminToken(): string
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN])->createToken('t')->plainTextToken;
    }

    private function studentToken(bool $premium = false): string
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'grade' => '4am']);
        if ($premium) {
            Entitlement::factory()->subscription()->create(['user_id' => $student->id]);
        }

        return $student->createToken('t')->plainTextToken;
    }

    private function setTier(string $adminToken, string $code, string $tier): void
    {
        $id = Lesson::where('code', $code)->value('id');

        $this->withToken($adminToken)
            ->patchJson("/api/v1/admin/content/lesson/{$id}/tier", ['tier' => $tier])
            ->assertOk()
            ->assertJsonPath('tier', $tier);
    }

    /** Une écriture de progression : la porte ContentAccess, par l'API. */
    private function progress(string $token, string $code)
    {
        return $this->withToken($token)->putJson("/api/v1/lessons/{$code}/progress", [
            'completedModules' => [],
            'currentModule' => 1,
            'status' => 'in_progress',
            'lastActivityAt' => Carbon::now()->toIso8601String(),
        ]);
    }

    private function tier(string $code): ?string
    {
        return Lesson::where('code', $code)->value('tier');
    }

    // ── Test A — une leçon nouvelle naît gratuite ───────────────────────

    public function test_a_new_lesson_is_created_free(): void
    {
        $this->importer->import($this->export());

        $this->assertSame('free', $this->tier('lecon-alpha'));
        $this->assertSame('free', $this->tier('lecon-beta'));
    }

    /**
     * Un export ANCIEN portait encore un `tier` : il est ignoré, même à la
     * création. Le palier ne se déduit pas du fichier source.
     */
    public function test_a_tier_left_in_an_old_export_is_ignored(): void
    {
        $this->importer->import($this->export(['lecon-alpha'], ['lecon-alpha' => ['tier' => 'premium']]));
        $this->assertSame('free', $this->tier('lecon-alpha'));

        $this->setTier($this->adminToken(), 'lecon-alpha', 'premium');
        $this->importer->import($this->export(['lecon-alpha'], ['lecon-alpha' => ['tier' => 'free']]));
        $this->assertSame('premium', $this->tier('lecon-alpha'));
    }

    // ── Tests B, C, D — le cycle complet, par l'API ─────────────────────

    public function test_full_admin_to_student_lifecycle_survives_every_sync(): void
    {
        $this->importer->import($this->export());
        $admin = $this->adminToken();
        $student = $this->studentToken();
        $subscriber = $this->studentToken(premium: true);

        // Gratuite : l'élève sans droit y accède.
        $this->progress($student, 'lecon-alpha')->assertOk();

        // B — l'administrateur la passe premium.
        $this->setTier($admin, 'lecon-alpha', 'premium');
        $this->assertSame('premium', $this->tier('lecon-alpha'));

        $this->progress($student, 'lecon-alpha')->assertStatus(422);
        $this->progress($subscriber, 'lecon-alpha')->assertOk();
        // L'autre leçon n'a pas bougé.
        $this->progress($student, 'lecon-beta')->assertOk();

        // C — une resynchronisation (et même un changement de contenu) ne
        // la remet pas gratuite.
        $this->importer->import($this->export(lessonOverrides: ['lecon-alpha' => ['title' => 'عنوان جديد']]));
        $this->assertSame('premium', $this->tier('lecon-alpha'));
        $this->assertSame('عنوان جديد', Lesson::where('code', 'lecon-alpha')->value('title'));
        $this->progress($student, 'lecon-alpha')->assertStatus(422);

        // D — l'administrateur la repasse gratuite ; la resynchronisation ne
        // la remet pas premium.
        $this->setTier($admin, 'lecon-alpha', 'free');
        $this->importer->import($this->export());
        $this->assertSame('free', $this->tier('lecon-alpha'));
        $this->progress($student, 'lecon-alpha')->assertOk();
    }

    // ── Ce que voient l'élève, l'abonné et le visiteur ──────────────────

    public function test_availability_reflects_the_admin_decision_for_every_audience(): void
    {
        $this->importer->import($this->export());
        $admin = $this->adminToken();
        $this->setTier($admin, 'lecon-alpha', 'premium');

        // Élève sans droit : premium ET verrouillée.
        $this->withToken($this->studentToken())->getJson('/api/v1/content/availability')
            ->assertOk()
            ->assertJsonPath('closed.premium', ['lecon-alpha'])
            ->assertJsonPath('closed.locked', ['lecon-alpha']);

        // Abonné : le badge reste, le verrou disparaît.
        $this->withToken($this->studentToken(premium: true))->getJson('/api/v1/content/availability')
            ->assertOk()
            ->assertJsonPath('closed.premium', ['lecon-alpha'])
            ->assertJsonPath('closed.locked', []);

        // Visiteur sans compte : même palier, verrouillé, aucune donnée perso.
        $this->asGuest()->getJson('/api/v1/content/availability/public')
            ->assertOk()
            ->assertJsonPath('closed.premium', ['lecon-alpha'])
            ->assertJsonPath('closed.locked', ['lecon-alpha'])
            ->assertJsonPath('closed.hiddenByClass', [])
            ->assertJsonPath('access.premiumAccess', false);

        // Le retour au gratuit se voit à la requête suivante — aucun cache.
        $this->setTier($admin, 'lecon-alpha', 'free');
        $this->asGuest()->getJson('/api/v1/content/availability/public')
            ->assertOk()
            ->assertJsonPath('closed.premium', [])
            ->assertJsonPath('closed.locked', []);
    }

    /** La route publique n'est jamais celle de l'élève, même avec un jeton. */
    public function test_public_inventory_ignores_any_token(): void
    {
        $this->importer->import($this->export());
        $this->setTier($this->adminToken(), 'lecon-alpha', 'premium');

        $this->withToken($this->studentToken(premium: true))
            ->getJson('/api/v1/content/availability/public')
            ->assertOk()
            ->assertJsonPath('closed.locked', ['lecon-alpha'])
            ->assertJsonPath('access.premiumAccess', false);
    }

    // ── L'accès direct : l'API refuse, quelle que soit l'entrée ─────────

    public function test_direct_api_access_to_a_premium_lesson_is_refused_everywhere(): void
    {
        $this->importer->import($this->export());
        $this->setTier($this->adminToken(), 'lecon-alpha', 'premium');
        $student = $this->studentToken();

        // Progression d'un MODULE (l'URL de module tapée directement écrit ici).
        $this->withToken($student)->putJson('/api/v1/lessons/lecon-alpha/progress', [
            'completedModules' => ['1'], 'currentModule' => 1, 'status' => 'in_progress',
            'lastActivityAt' => Carbon::now()->toIso8601String(),
        ])->assertStatus(422);

        // Inventaire des exercices : rien n'est listé.
        $this->withToken($student)->getJson('/api/v1/lessons/lecon-alpha/exercises')
            ->assertOk()
            ->assertJsonPath('available', false)
            ->assertJsonPath('exercises', []);

        // Séance de pratique : refusée.
        $this->assertNotEquals(
            200,
            $this->withToken($student)->postJson('/api/v1/lessons/lecon-alpha/practice/sessions', ['level' => 1])->status(),
        );

        // Visiteur : aucune écriture sans compte.
        $this->asGuest()->putJson('/api/v1/lessons/lecon-alpha/progress', ['completedModules' => []])->assertStatus(401);
    }

    // ── Une leçon FUTURE entre dans le même système, sans code ──────────

    public function test_a_lesson_added_later_is_free_admin_controlled_and_leaves_others_untouched(): void
    {
        $this->importer->import($this->export());
        $admin = $this->adminToken();
        $this->setTier($admin, 'lecon-alpha', 'premium');

        // Le catalogue s'enrichit d'une leçon générée plus tard.
        $this->importer->import($this->export(['lecon-alpha', 'lecon-beta', 'lecon-gamma']));

        $this->assertSame('free', $this->tier('lecon-gamma'));
        $this->assertSame('premium', $this->tier('lecon-alpha'));

        // Elle apparaît dans l'administration, avec son palier…
        $this->withToken($admin)->getJson('/api/v1/admin/content/lessons/lecon-gamma')
            ->assertOk()
            ->assertJsonPath('lesson.tier', 'free');

        // … l'administrateur la change, et l'élève suit.
        $this->setTier($admin, 'lecon-gamma', 'premium');
        $this->progress($this->studentToken(), 'lecon-gamma')->assertStatus(422);
        $this->progress($this->studentToken(premium: true), 'lecon-gamma')->assertOk();
    }
}
