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
        'firstName' => 'Yanis',
        'lastName' => 'Bernard',
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

    public function test_the_waiting_list_keeps_an_email_address_once(): void
    {
        $this->postJson('/api/v1/waitlist', ['email' => 'Parent.Yanis@Example.fr', 'name' => 'Mère de Yanis', 'role' => 'parent', 'phone' => '06 12 34 56 78'])
            ->assertStatus(201)
            ->assertJson(['success' => true]);
        $this->postJson('/api/v1/waitlist', ['email' => 'parent.yanis@example.fr'])->assertOk();

        $rows = Contact::where('objectif', 'waitlist')->get();
        $this->assertCount(1, $rows);
        $this->assertSame('parent.yanis@example.fr', $rows[0]->email);
        $this->assertSame('0612345678', $rows[0]->phone);
        $this->assertSame('Mère de Yanis', $rows[0]->name);
    }

    /** L'adresse suffit : ni nom, ni rôle, ni téléphone ne sont exigés. */
    public function test_the_waiting_list_needs_only_an_email_address(): void
    {
        $this->postJson('/api/v1/waitlist', ['email' => 'zoe@example.fr'])->assertStatus(201);
        $this->assertNull(Contact::where('email', 'zoe@example.fr')->value('phone'));
    }

    public function test_the_waiting_list_accepts_a_french_phone_number_in_its_usual_shapes(): void
    {
        foreach (['01 23 45 67 89', '06.12.34.56.78', '+33 6 12 34 56 78', '+33612345678', '0033 7 12 34 56 78'] as $i => $phone) {
            $this->postJson('/api/v1/waitlist', ['email' => "p{$i}@example.fr", 'phone' => $phone])->assertStatus(201);
        }
        $this->assertSame(5, Contact::count());
    }

    public function test_the_waiting_list_refuses_what_is_not_an_email_or_a_french_phone_number(): void
    {
        $this->postJson('/api/v1/waitlist', ['email' => 'bonjour'])->assertStatus(422)->assertJsonValidationErrors('email');
        $this->postJson('/api/v1/waitlist', [])->assertStatus(422)->assertJsonValidationErrors('email');
        // un numéro algérien n'est pas demandé, et n'est pas un numéro français
        $this->postJson('/api/v1/waitlist', ['email' => 'a@example.fr', 'phone' => '+213 550 12 34 56'])->assertStatus(422)->assertJsonValidationErrors('phone');
        $this->postJson('/api/v1/waitlist', ['email' => 'a@example.fr', 'phone' => 'bonjour'])->assertStatus(422)->assertJsonValidationErrors('phone');
        $this->assertSame(0, Contact::count());
    }
}
