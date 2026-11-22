<?php

namespace Tests\Feature;

use App\Domain\Access\AccessTier;
use App\Domain\Access\ActivationCodes\ActivationCodeFormat;
use App\Domain\Access\ContentAccess;
use App\Domain\Access\EntitlementService;
use App\Models\ActivationCode;
use App\Models\Chapter;
use App\Models\Entitlement;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\User;
use Database\Factories\ActivationCodeFactory;
use DomainException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

/**
 * Ce qui doit rester vrai même quand quelqu'un s'y emploie : la limite de
 * débit, la forme des codes, et l'invariant qui veut qu'un droit d'accès
 * n'ouvre JAMAIS du contenu dormant.
 */
class ActivationCodeSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $this->token = $this->student->createToken('t')->plainTextToken;
        RateLimiter::clear('activation-user:'.$this->student->id);
    }

    private function entitlements(): EntitlementService
    {
        app(EntitlementService::class)->forget();

        return app(EntitlementService::class);
    }

    /**
     * Le tâtonnement s'arrête au sixième essai de la minute.
     *
     * Ce n'est pas ce qui rend l'attaque impossible — 2^60 codes possibles
     * s'en chargent — mais c'est ce qui la rend inutile à tenter, et ce qui
     * garde la table à l'abri d'un flot de requêtes.
     */
    public function test_la_limite_de_debit_arrete_le_tatonnement(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->withToken($this->token)
                ->postJson('/api/v1/activation-codes/redeem', ['code' => 'ZZZZ-ZZZZ-ZZZ'.$i])
                ->assertStatus(422);
        }

        $this->withToken($this->token)
            ->postJson('/api/v1/activation-codes/redeem', ['code' => 'ZZZZ-ZZZZ-ZZZZ'])
            ->assertStatus(429);
    }

    /**
     * La limite ne doit pas enfermer dehors un élève qui a réellement une
     * carte : cinq essais par minute laissent largement la place à une faute
     * de frappe ou deux.
     */
    public function test_la_limite_laisse_place_a_une_faute_de_frappe(): void
    {
        $code = ActivationCode::factory()->create();
        $plain = ActivationCodeFactory::plainCodeOf($code);

        $this->withToken($this->token)
            ->postJson('/api/v1/activation-codes/redeem', ['code' => 'ZZZZ-ZZZZ-ZZZZ'])
            ->assertStatus(422);

        $this->withToken($this->token)
            ->postJson('/api/v1/activation-codes/redeem', ['code' => $plain])
            ->assertOk();
    }

    /**
     * L'INVARIANT CENTRAL, et la raison pour laquelle cette phase ne touche
     * pas à ContentAccess : un code parfaitement valide n'ouvre RIEN d'une
     * classe dormante. Le droit commercial et la publication du contenu sont
     * deux questions distinctes, et les deux doivent être satisfaites.
     *
     * C'est ce qui garantit que vendre des cartes aujourd'hui n'expose pas,
     * par surprise, les 132 leçons françaises héritées.
     */
    public function test_un_code_valide_n_ouvre_pas_une_classe_dormante(): void
    {
        config(['curriculum.enforce_active_grades' => true]);

        $dormant = Grade::create([
            'code' => 'seconde', 'name' => 'Seconde', 'level' => 'lycee', 'order' => 0, 'is_active' => false,
        ]);
        $chapter = Chapter::create([
            'grade_id' => $dormant->id, 'code' => 'ch-dormant', 'title' => 'Chapitre', 'order' => 0,
        ]);
        Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'fonction-affine-2nde', 'title' => 'Leçon dormante',
            'order' => 0, 'tier' => AccessTier::FREE, 'publication_status' => Lesson::PUB_PUBLISHED,
        ]);

        $code = ActivationCode::factory()->create();
        $this->withToken($this->token)
            ->postJson('/api/v1/activation-codes/redeem', ['code' => ActivationCodeFactory::plainCodeOf($code)])
            ->assertOk();

        $this->assertTrue($this->entitlements()->satisfies($this->student, AccessTier::PREMIUM));

        // … et pourtant la leçon reste fermée.
        $this->expectException(DomainException::class);
        ContentAccess::assertLessonAvailable('fonction-affine-2nde', $this->student->fresh());
    }

    /**
     * Le pendant utile : sur une classe ACTIVE, une leçon payante s'ouvre
     * avec le droit, et reste fermée sans lui.
     */
    public function test_une_lecon_payante_s_ouvre_avec_le_code_et_pas_sans(): void
    {
        config(['curriculum.enforce_active_grades' => true]);

        $grade = Grade::create([
            'code' => '4am', 'name' => '4AM', 'level' => 'moyen', 'order' => 0, 'is_active' => true,
        ]);
        $chapter = Chapter::create([
            'grade_id' => $grade->id, 'code' => 'ch-actif', 'title' => 'Chapitre', 'order' => 0,
        ]);
        Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'lecon-payante', 'title' => 'Leçon payante',
            'order' => 0, 'tier' => AccessTier::PREMIUM, 'publication_status' => Lesson::PUB_PUBLISHED,
        ]);

        // Sans droit : fermée.
        try {
            ContentAccess::assertLessonAvailable('lecon-payante', $this->student);
            $this->fail('La leçon payante aurait dû être fermée sans droit.');
        } catch (DomainException $e) {
            $this->assertStringContainsString('premium', $e->getMessage());
        }

        $code = ActivationCode::factory()->create();
        $this->withToken($this->token)
            ->postJson('/api/v1/activation-codes/redeem', ['code' => ActivationCodeFactory::plainCodeOf($code)])
            ->assertOk();

        $this->entitlements();
        ContentAccess::assertLessonAvailable('lecon-payante', $this->student->fresh());

        // Pas d'exception : l'accès est ouvert.
        $this->assertTrue(true);
    }

    /**
     * Une leçon MASQUÉE reste masquée pour qui détient un code : un droit
     * n'est pas un passe-droit vers du contenu non publié.
     */
    public function test_un_code_n_ouvre_pas_une_lecon_masquee(): void
    {
        $grade = Grade::create([
            'code' => '4am', 'name' => '4AM', 'level' => 'moyen', 'order' => 0, 'is_active' => true,
        ]);
        $chapter = Chapter::create([
            'grade_id' => $grade->id, 'code' => 'ch', 'title' => 'C', 'order' => 0,
        ]);
        Lesson::create([
            'chapter_id' => $chapter->id, 'code' => 'lecon-masquee', 'title' => 'Masquée',
            'order' => 0, 'tier' => AccessTier::PREMIUM, 'publication_status' => Lesson::PUB_DRAFT,
        ]);

        Entitlement::factory()->activationCode()->create(['user_id' => $this->student->id]);

        $this->expectException(DomainException::class);
        ContentAccess::assertLessonAvailable('lecon-masquee', $this->student);
    }

    /**
     * L'alphabet exclut les caractères qui se confondent à l'impression — la
     * première cause de saisie ratée sur une carte lue au téléphone.
     */
    public function test_l_alphabet_exclut_les_caracteres_ambigus(): void
    {
        foreach (['0', 'O', '1', 'I'] as $ambiguous) {
            $this->assertStringNotContainsString(
                $ambiguous,
                ActivationCodeFormat::ALPHABET,
                "L'alphabet contient {$ambiguous}, ambigu à la lecture."
            );
        }

        // 32 symboles = 5 bits chacun, 12 symboles = 60 bits d'entropie.
        $this->assertSame(32, strlen(ActivationCodeFormat::ALPHABET));
        $this->assertSame(32, count(array_unique(str_split(ActivationCodeFormat::ALPHABET))));
    }

    /** Deux tirages ne se répètent pas : le générateur est bien aléatoire. */
    public function test_les_codes_tires_sont_distincts(): void
    {
        $codes = [];
        for ($i = 0; $i < 200; $i++) {
            $codes[] = ActivationCodeFormat::generate();
        }

        $this->assertCount(200, array_unique($codes));
    }

    /** L'empreinte est stable, et ne ressemble pas au code. */
    public function test_l_empreinte_est_stable_et_opaque(): void
    {
        $plain = ActivationCodeFormat::generate();
        $normalized = ActivationCodeFormat::normalize($plain);

        $this->assertSame(
            ActivationCodeFormat::hash($normalized),
            ActivationCodeFormat::hash($normalized),
        );
        $this->assertSame(64, strlen(ActivationCodeFormat::hash($normalized)));
        $this->assertStringNotContainsString($normalized, ActivationCodeFormat::hash($normalized));

        // Les tirets et la casse ne changent pas l'empreinte : c'est ce qui
        // rend la saisie tolérante sans rien affaiblir.
        $this->assertSame(
            ActivationCodeFormat::hash($normalized),
            ActivationCodeFormat::hash(ActivationCodeFormat::normalize(strtolower($plain))),
        );
    }

    /** Ce qui n'a pas exactement douze symboles n'est pas un code. */
    public function test_la_normalisation_refuse_les_longueurs_fausses(): void
    {
        $this->assertNull(ActivationCodeFormat::normalize('ABCD-EFGH-JKL'));   // 11
        $this->assertNull(ActivationCodeFormat::normalize('ABCD-EFGH-JKLMN')); // 13
        $this->assertNull(ActivationCodeFormat::normalize(''));
        $this->assertNull(ActivationCodeFormat::normalize(null));
        // Des caractères hors alphabet sont RETIRÉS, pas tolérés : il reste
        // onze symboles, donc null.
        $this->assertNull(ActivationCodeFormat::normalize('ABCD-EFGH-JK0O'));
        $this->assertSame('ABCDEFGHJKLM', ActivationCodeFormat::normalize('abcd efgh jklm'));
    }
}
