<?php

namespace App\Notifications;

use App\Domain\Identity\EmailVerificationLink;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Throwable;

/**
 * Le courriel « أكّد بريدك الإلكتروني ».
 *
 * Écrit en ARABE, comme tout ce que l'élève lit, et envoyé avec la locale
 * `ar` (User::preferredLocale). Mis en page par le gabarit de marque
 * `resources/views/emails/layouts/brand.blade.php` (logo, Cairo / Amiri,
 * couleurs de la plateforme, RTL), et non par le gabarit Markdown de Laravel.
 *
 * Ce courriel ne contient AUCUN secret réutilisable : le lien est signé et
 * expire (voir EmailVerificationLink). Il ne contient pas non plus de mot de
 * passe — ni celui de l'élève, ni un mot de passe provisoire.
 */
class VerifyEmailAddress extends Notification
{
    use Queueable;

    /**
     * Envoie le courriel et dit s'il est parti.
     *
     * L'envoi est synchrone : une panne SMTP lèverait une exception au milieu
     * de l'inscription ou du renvoi. Elle est journalisée (report) et rendue
     * en `false`, pour que l'appelant réponde proprement au lieu d'un 500.
     */
    public static function sendTo(User $user): bool
    {
        try {
            $user->notify(new self);

            return true;
        } catch (Throwable $e) {
            report($e);

            return false;
        }
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = EmailVerificationLink::for($notifiable);
        $hours = (int) (EmailVerificationLink::EXPIRES_AFTER_MINUTES / 60);

        // Le gabarit de marque (logo, Cairo / Amiri, couleurs du logo),
        // et sa version texte pour les clients qui n'affichent pas le HTML.
        return (new MailMessage)
            ->subject('أكّد بريدك الإلكتروني — Smarter Academy')
            ->view(
                ['html' => 'emails.verify-email', 'text' => 'emails.verify-email-text'],
                [
                    'firstName' => trim((string) ($notifiable->first_name ?? '')),
                    'url' => $url,
                    'hours' => $hours,
                ],
            );
    }
}
