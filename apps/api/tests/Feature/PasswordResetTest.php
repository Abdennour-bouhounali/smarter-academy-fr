<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

/**
 * LE MOT DE PASSE OUBLIÉ — le lien reçu par courriel et ce qu'il ouvre.
 */
class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_sends_the_mail_to_an_existing_account(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'eleve@example.com']);

        $this->postJson('/api/v1/auth/password/forgot', ['email' => 'eleve@example.com'])
            ->assertOk()->assertJson(['success' => true]);

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_forgot_answers_the_same_for_an_unknown_address_and_sends_nothing(): void
    {
        Notification::fake();

        $known = User::factory()->create(['email' => 'eleve@example.com']);
        $a = $this->postJson('/api/v1/auth/password/forgot', ['email' => 'eleve@example.com']);
        $b = $this->postJson('/api/v1/auth/password/forgot', ['email' => 'personne@example.com']);

        $this->assertSame($a->status(), $b->status());
        $this->assertSame($a->json(), $b->json());
        Notification::assertSentToTimes($known, ResetPasswordNotification::class, 1);
        Notification::assertCount(1);
    }

    public function test_forgot_sends_nothing_to_a_google_account_without_password(): void
    {
        Notification::fake();
        User::factory()->create(['email' => 'g@example.com', 'password' => null]);

        $this->postJson('/api/v1/auth/password/forgot', ['email' => 'g@example.com'])->assertOk();

        Notification::assertNothingSent();
    }

    public function test_the_mail_renders_with_a_link_to_the_frontend(): void
    {
        $user = User::factory()->create(['email' => 'eleve@example.com']);

        $mail = (new ResetPasswordNotification('tok123'))->toMail($user);
        $html = (string) $mail->render();

        $this->assertStringContainsString('/reinitialiser-mot-de-passe?token=tok123', $html);
        $this->assertStringContainsString('eleve%40example.com', $html);
    }

    public function test_reset_changes_the_password_and_revokes_sessions(): void
    {
        $user = User::factory()->create(['email' => 'eleve@example.com']);
        $user->createToken('student-token');
        $token = Password::broker()->createToken($user);

        $this->postJson('/api/v1/auth/password/reset', [
            'token' => $token, 'email' => 'eleve@example.com',
            'password' => 'nouveau123', 'password_confirmation' => 'nouveau123',
        ])->assertOk()->assertJson(['success' => true]);

        $this->assertSame(0, $user->tokens()->count());
        $this->postJson('/api/v1/auth/login', ['email' => 'eleve@example.com', 'password' => 'nouveau123'])
            ->assertOk();
    }

    public function test_the_token_is_single_use(): void
    {
        $user = User::factory()->create(['email' => 'eleve@example.com']);
        $token = Password::broker()->createToken($user);
        $body = [
            'token' => $token, 'email' => 'eleve@example.com',
            'password' => 'nouveau123', 'password_confirmation' => 'nouveau123',
        ];

        $this->postJson('/api/v1/auth/password/reset', $body)->assertOk();
        $this->postJson('/api/v1/auth/password/reset', $body)
            ->assertStatus(422)->assertJson(['reason' => 'invalid_token']);
    }

    public function test_a_wrong_token_is_refused(): void
    {
        User::factory()->create(['email' => 'eleve@example.com']);

        $this->postJson('/api/v1/auth/password/reset', [
            'token' => 'faux', 'email' => 'eleve@example.com',
            'password' => 'nouveau123', 'password_confirmation' => 'nouveau123',
        ])->assertStatus(422)->assertJson(['reason' => 'invalid_token']);
    }

    public function test_a_weak_or_unconfirmed_password_is_refused(): void
    {
        $user = User::factory()->create(['email' => 'eleve@example.com']);
        $token = Password::broker()->createToken($user);

        $this->postJson('/api/v1/auth/password/reset', [
            'token' => $token, 'email' => 'eleve@example.com',
            'password' => 'abcdefgh', 'password_confirmation' => 'abcdefgh',
        ])->assertStatus(422)->assertJsonValidationErrors('password');

        $this->postJson('/api/v1/auth/password/reset', [
            'token' => $token, 'email' => 'eleve@example.com',
            'password' => 'nouveau123', 'password_confirmation' => 'autre1234',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }
}
