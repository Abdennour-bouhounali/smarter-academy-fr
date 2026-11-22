<?php

namespace Tests\Feature;

use App\Domain\Push\AdminPush;
use App\Domain\Push\PushSender;
use App\Models\Book;
use App\Models\BookOrder;
use App\Models\PushSubscription;
use App\Models\StudentReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Notifications du tableau de bord (BOOKS_STORE.md §6quater) — l'envoi réel est remplacé. */
class AdminPushTest extends TestCase
{
    use RefreshDatabase;

    private FakePushSender $sender;

    protected function setUp(): void
    {
        parent::setUp();
        $this->sender = new FakePushSender;
        $this->app->instance(PushSender::class, $this->sender);
    }

    private function token(string $role): array
    {
        $user = User::factory()->create(['role' => $role, 'email_verified_at' => now()]);

        return [$user, $user->createToken('t')->plainTextToken];
    }

    private function as(string $token)
    {
        // Les gardes gardent l'utilisateur d'une requête à l'autre dans un même test.
        $this->app['auth']->forgetGuards();

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    private function subscribe(string $token, string $endpoint, ?array $topics = null): void
    {
        $body = ['endpoint' => $endpoint, 'keys' => ['p256dh' => 'pk', 'auth' => 'au']];
        if ($topics !== null) {
            $body['topics'] = $topics;
        }
        $this->as($token)->postJson('/api/v1/admin/push/subscriptions', $body)->assertCreated();
    }

    private function order(): void
    {
        Book::create(['slug' => 'smart-protocol', 'title' => 'SMART', 'price' => 1000, 'status' => 'published', 'content' => [], 'gallery' => []]);
        $this->postJson('/api/v1/books/smart-protocol/orders', [
            'customerName' => 'Samir Benali', 'phone' => '0555123456', 'wilaya' => 'الجزائر - Alger',
            'commune' => 'باب الزوار', 'quantity' => 2,
        ])->assertCreated();
    }

    /** Le dernier envoi : [endpoints, payload]. */
    private function last(): array
    {
        return end($this->sender->sent) ?: [[], []];
    }

    public function test_le_gestionnaire_recoit_la_nouvelle_commande_sans_donnee_personnelle(): void
    {
        [, $token] = $this->token(User::ROLE_BOOK_MANAGER);
        $this->as($token)->getJson('/api/v1/admin/push')
            ->assertOk()->assertJson(['enabled' => true, 'publicKey' => 'PUBLIC', 'devices' => 0, 'topics' => ['book_order', 'book_message'], 'device' => null]);

        $this->subscribe($token, 'https://fcm.googleapis.com/fcm/send/device-1');
        $this->subscribe($token, 'https://fcm.googleapis.com/fcm/send/device-1'); // même appareil : pas de doublon
        $this->assertSame(1, PushSubscription::count());

        $this->order();

        [$endpoints, $payload] = $this->last();
        $this->assertSame(['https://fcm.googleapis.com/fcm/send/device-1'], $endpoints);
        $this->assertStringStartsWith('طلب جديد · BK-', $payload['title']);
        $this->assertSame('الجزائر · 2 نسخ · 2000دج', $payload['body']);
        $this->assertSame('/admin/livres/commandes/'.BookOrder::firstOrFail()->id, $payload['url']);
        $this->assertStringNotContainsString('Samir', json_encode($payload, JSON_UNESCAPED_UNICODE));
        $this->assertStringNotContainsString('0555', json_encode($payload));
    }

    public function test_l_admin_recoit_la_plateforme_le_gestionnaire_seulement_la_librairie(): void
    {
        [, $adminToken] = $this->token(User::ROLE_ADMIN);
        [, $managerToken] = $this->token(User::ROLE_BOOK_MANAGER);
        $this->subscribe($adminToken, 'https://push.example/admin');
        $this->subscribe($managerToken, 'https://push.example/manager');

        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'first_name' => 'Yasmine']);
        app(AdminPush::class)->send('new_student', $student->id);
        [$endpoints, $payload] = $this->last();
        $this->assertSame(['https://push.example/admin'], $endpoints);
        $this->assertSame('تلميذ جديد', $payload['title']);
        $this->assertSame('تسجيلات التلاميذ اليوم: 1', $payload['body']);
        $this->assertSame('new_student', $payload['tag'], 'une seule notification d\'inscription, remplacée');
        $this->assertSame('/admin/eleves/'.$student->id, $payload['url']);
        $this->assertStringNotContainsString('Yasmine', json_encode($payload, JSON_UNESCAPED_UNICODE));

        $this->order();
        $this->assertSame(['https://push.example/admin', 'https://push.example/manager'], $this->last()[0]);
    }

    public function test_un_message_de_contact_notifie_l_admin_sans_son_contenu(): void
    {
        [, $token] = $this->token(User::ROLE_ADMIN);
        $this->subscribe($token, 'https://push.example/admin');

        $this->postJson('/api/v1/contact', ['name' => 'Karim', 'email' => 'k@example.com', 'message' => 'Un message assez long.'])->assertCreated();

        [, $payload] = $this->last();
        $this->assertSame('رسالة جديدة', $payload['title']);
        $this->assertSame('/admin/systeme/messages', $payload['url']);
        $this->assertStringNotContainsString('Karim', json_encode($payload, JSON_UNESCAPED_UNICODE));
        $this->assertStringNotContainsString('assez long', json_encode($payload, JSON_UNESCAPED_UNICODE));
    }

    public function test_un_bilan_de_signalement_dit_sa_categorie(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        $report = StudentReport::forceCreate([
            'user_id' => $student->id, 'category' => StudentReport::CATEGORY_MATH_ERROR, 'lesson_code' => 'tayin-pgcd',
            'status' => StudentReport::STATUS_NEW, 'priority' => 'normal', 'fingerprint' => str_repeat('a', 64),
        ]);

        $payload = app(AdminPush::class)->payload('student_report', $report->id);
        $this->assertSame('بلاغ جديد', $payload['title']);
        $this->assertSame('خطأ رياضي · tayin-pgcd', $payload['body']);
        $this->assertSame('/admin/signalements/'.$report->id, $payload['url']);
    }

    public function test_chaque_appareil_choisit_ses_sujets(): void
    {
        [, $token] = $this->token(User::ROLE_ADMIN);
        $this->subscribe($token, 'https://push.example/phone');
        $this->as($token)->getJson('/api/v1/admin/push?endpoint='.urlencode('https://push.example/phone'))
            ->assertOk()->assertJsonPath('device.topics', array_keys(AdminPush::TOPICS));

        $this->as($token)->patchJson('/api/v1/admin/push/subscriptions', ['endpoint' => 'https://push.example/phone', 'topics' => ['book_order']])
            ->assertOk()->assertJson(['topics' => ['book_order']]);

        $student = User::factory()->create(['role' => User::ROLE_STUDENT]);
        app(AdminPush::class)->send('new_student', $student->id);
        $this->assertSame([], $this->sender->sent, 'sujet désactivé sur cet appareil');

        $this->order();
        $this->assertSame(['https://push.example/phone'], $this->last()[0]);
    }

    public function test_le_gestionnaire_ne_peut_pas_choisir_un_sujet_de_la_plateforme(): void
    {
        [, $token] = $this->token(User::ROLE_BOOK_MANAGER);
        $this->subscribe($token, 'https://push.example/m');
        $this->as($token)->patchJson('/api/v1/admin/push/subscriptions', ['endpoint' => 'https://push.example/m', 'topics' => ['new_student']])
            ->assertStatus(422);
    }

    public function test_seuls_les_comptes_actifs_recoivent_et_un_eleve_n_entre_pas(): void
    {
        [, $adminToken] = $this->token(User::ROLE_ADMIN);
        [$suspended, $suspendedToken] = $this->token(User::ROLE_BOOK_MANAGER);
        $this->subscribe($adminToken, 'https://push.example/admin');
        $this->subscribe($suspendedToken, 'https://push.example/suspended');
        $suspended->update(['account_status' => User::STATUS_SUSPENDED]);

        $this->order();
        $this->assertSame(['https://push.example/admin'], $this->last()[0]);

        [, $studentToken] = $this->token(User::ROLE_STUDENT);
        $this->as($studentToken)->getJson('/api/v1/admin/push')->assertForbidden();
    }

    public function test_desabonner_et_nettoyer_un_appareil_expire(): void
    {
        [$user, $token] = $this->token(User::ROLE_BOOK_MANAGER);
        $this->subscribe($token, 'https://push.example/a');
        $this->subscribe($token, 'https://push.example/b');

        $this->as($token)->deleteJson('/api/v1/admin/push/subscriptions', ['endpoint' => 'https://push.example/a'])->assertOk();
        $this->assertSame(['https://push.example/b'], PushSubscription::pluck('endpoint')->all());

        $this->sender->expire = ['https://push.example/b'];
        $this->assertSame(1, app(AdminPush::class)->test($user));
        $this->assertSame(0, PushSubscription::count());
    }

    public function test_sans_cles_rien_n_est_envoye_et_les_evenements_passent(): void
    {
        $this->sender->on = false;
        [, $token] = $this->token(User::ROLE_ADMIN);
        $this->as($token)->postJson('/api/v1/admin/push/subscriptions', [
            'endpoint' => 'https://push.example/x', 'keys' => ['p256dh' => 'pk', 'auth' => 'au'],
        ])->assertStatus(409);

        $this->order();
        $this->postJson('/api/v1/contact', ['name' => 'Karim', 'email' => 'k@example.com', 'message' => 'Un message assez long.'])->assertCreated();
        $this->assertSame([], $this->sender->sent);
    }
}

class FakePushSender implements PushSender
{
    public bool $on = true;

    /** @var array<int, array{0: array<int,string>, 1: array}> */
    public array $sent = [];

    /** @var array<int, string> */
    public array $expire = [];

    public function enabled(): bool
    {
        return $this->on;
    }

    public function publicKey(): ?string
    {
        return $this->on ? 'PUBLIC' : null;
    }

    public function send(iterable $subscriptions, array $payload): array
    {
        $endpoints = collect($subscriptions)->pluck('endpoint')->sort()->values()->all();
        $this->sent[] = [$endpoints, $payload];

        return array_values(array_intersect($this->expire, $endpoints));
    }
}
