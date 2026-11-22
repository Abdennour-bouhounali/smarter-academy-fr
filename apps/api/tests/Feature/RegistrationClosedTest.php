<?php

namespace Tests\Feature;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Les inscriptions fermées (config/registration.php ; propriétaire, 2026-11-20) : aucun compte ne naît, la page
 * recueille un numéro de téléphone, les comptes existants se connectent.
 */
class RegistrationClosedTest extends TestCase
{
    use RefreshDatabase;

    private const PAYLOAD = [
        'firstName' => 'ياسين',
        'lastName' => 'بلقاسم',
        'email' => 'eleve@example.test',
        'password' => 'motdepasse1',
        'accept_legal' => true,
    ];

    public function test_closed_no_account_is_created_and_the_page_gets_a_code(): void
    {
        config(['registration.open' => false]);

        $this->getJson('/api/v1/registration')->assertOk()->assertJson(['open' => false]);
        $this->postJson('/api/v1/auth/register', self::PAYLOAD)
            ->assertStatus(403)
            ->assertJson(['success' => false, 'code' => 'registration_closed']);
        $this->assertSame(0, User::count());
    }

    public function test_closed_a_teacher_cannot_sign_up_either_and_an_invalid_class_link_opens_nothing(): void
    {
        config(['registration.open' => false]);

        $this->postJson('/api/v1/auth/register', [...self::PAYLOAD, 'accountType' => 'teacher'])->assertStatus(403);
        $this->postJson('/api/v1/auth/register', [...self::PAYLOAD, 'classJoinLink' => 'not-a-link', 'classJoinConsent' => true])
            ->assertStatus(403);
        $this->assertSame(0, User::count());
    }

    public function test_open_the_sign_up_works_as_before(): void
    {
        config(['registration.open' => true]);

        $this->getJson('/api/v1/registration')->assertJson(['open' => true]);
        $this->postJson('/api/v1/auth/register', self::PAYLOAD)->assertSuccessful();
        $this->assertSame(1, User::count());
    }

    public function test_the_waiting_list_keeps_a_phone_number_once(): void
    {
        $this->postJson('/api/v1/waitlist', ['phone' => '0550 12 34 56', 'name' => 'أمّ ياسين', 'role' => 'parent'])
            ->assertStatus(201)
            ->assertJson(['success' => true]);
        $this->postJson('/api/v1/waitlist', ['phone' => '0550123456'])->assertOk();

        $rows = Contact::where('objectif', 'waitlist')->get();
        $this->assertCount(1, $rows);
        $this->assertSame('0550123456', $rows[0]->phone);
        $this->assertSame('أمّ ياسين', $rows[0]->name);
    }

    public function test_the_waiting_list_refuses_what_is_not_a_phone_number(): void
    {
        $this->postJson('/api/v1/waitlist', ['phone' => 'bonjour'])->assertStatus(422);
        $this->postJson('/api/v1/waitlist', [])->assertStatus(422);
        $this->assertSame(0, Contact::count());
    }
}
