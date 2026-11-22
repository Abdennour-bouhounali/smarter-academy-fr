<?php

namespace Tests\Feature;

use App\Domain\Family\ParentReportService;
use App\Models\User;
use App\Notifications\ActivationCodeIssuedNotification;
use App\Notifications\ParentLinkRevokedNotification;
use App\Notifications\ParentWeeklyReportNotification;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * CHAQUE COURRIEL EST FRANÇAIS — sujet, corps, gabarit, de gauche à droite,
 * au « vous », signé du nom configuré (config app.name). Aucune lettre arabe,
 * aucune phrase anglaise du gabarit de Laravel.
 */
class FrenchMailTest extends TestCase
{
    use RefreshDatabase;

    private function render(MailMessage $mail): string
    {
        app()->setLocale('fr');

        return (string) $mail->render();
    }

    private function assertFrench(MailMessage $mail, string $subject): string
    {
        $html = $this->render($mail);

        $this->assertSame($subject, $mail->subject);
        $this->assertDoesNotMatchRegularExpression('/\p{Arabic}/u', $mail->subject.$html);
        $this->assertStringContainsString('lang="fr"', $html);
        $this->assertStringNotContainsString('rtl', $html);
        $this->assertStringNotContainsString('Regards', $html);
        $this->assertStringNotContainsString("If you're having trouble", $html);

        return $html;
    }

    public function test_les_comptes_recoivent_leurs_courriels_en_francais(): void
    {
        $this->assertSame('fr', User::factory()->make()->preferredLocale());
    }

    public function test_le_code_d_activation(): void
    {
        $user = User::factory()->create();
        $mail = (new ActivationCodeIssuedNotification('ABCD-EFGH', 'Élève — accès complet', Carbon::parse('2026-12-01')))->toMail($user);

        $html = $this->assertFrench($mail, 'Votre code d’activation — '.config('app.name'));
        $this->assertStringContainsString('ABCD-EFGH', $html);
        $this->assertStringContainsString('1er décembre 2026', $html);
        $this->assertStringContainsString('L’équipe '.config('app.name'), $html);
    }

    public function test_le_lien_parent_retire(): void
    {
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'first_name' => 'Zoé', 'last_name' => 'Martin']);
        $parent = User::factory()->create(['role' => User::ROLE_PARENT]);
        $mail = (new ParentLinkRevokedNotification($student))->toMail($parent);

        $html = $this->assertFrench($mail, 'Zoé Martin a retiré le lien avec votre compte — '.config('app.name'));
        $this->assertStringContainsString('le vôtre', $html);
        $this->assertStringContainsString(rtrim((string) config('app.frontend_url'), '/').'/parent"', $html);
        $this->assertStringNotContainsString('/wali', $html);
    }

    public function test_le_resume_de_la_semaine(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-11-23 07:00:00', 'UTC')); // un lundi matin à Paris
        $student = User::factory()->create(['role' => User::ROLE_STUDENT, 'first_name' => 'Hugo', 'last_name' => 'Lefèvre']);
        $parent = User::factory()->create(['role' => User::ROLE_PARENT]);
        $report = app(ParentReportService::class)->week($student, 1);
        $mail = (new ParentWeeklyReportNotification($student, $report))->toMail($parent);

        $html = $this->assertFrench($mail, 'La semaine de Hugo Lefèvre sur '.config('app.name'));
        $this->assertStringContainsString('du lundi 16 au dimanche 22 novembre 2026', $html);
        $this->assertStringContainsString('Savoir-faire maîtrisés', $html);
        $this->assertStringContainsString(rtrim((string) config('app.frontend_url'), '/').'/parent/enfants/'.$student->id, $html);
        $this->assertStringNotContainsString('/wali', $html);
        $this->assertSame("1\u{00A0}h\u{00A0}25\u{00A0}min", ParentWeeklyReportNotification::duration(5100));
        $this->assertSame("4\u{00A0}min", ParentWeeklyReportNotification::duration(240));
    }

    public function test_la_reinitialisation_du_mot_de_passe(): void
    {
        $user = User::factory()->create(['first_name' => 'Léa']);
        $mail = (new ResetPasswordNotification('jeton'))->toMail($user);

        $html = $this->assertFrench($mail, 'Réinitialisez votre mot de passe — '.config('app.name'));
        $this->assertStringContainsString('Bonjour Léa,', $html);
        $this->assertStringContainsString('Choisir un nouveau mot de passe', $html);
        $this->assertStringContainsString(config('mail.contact_address'), $html);
    }

    public function test_l_expediteur_vient_de_la_configuration(): void
    {
        $this->assertSame(config('app.name'), config('mail.from.name'));
    }
}
