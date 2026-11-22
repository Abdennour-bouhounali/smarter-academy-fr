<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Throwable;

/**
 * Le courriel « إعادة تعيين كلمة المرور ».
 *
 * Même gabarit de marque et même langue (arabe) que VerifyEmailAddress. Le
 * lien pointe directement vers le FRONTEND (`/reinitialiser-mot-de-passe`) :
 * le jeton est à usage unique, haché en base par le broker de Laravel, et
 * expire (config auth.passwords.users.expire). Le courriel ne contient aucun
 * mot de passe.
 */
class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $token) {}

    /**
     * Envoie le courriel et dit s'il est parti (une panne SMTP est
     * journalisée, jamais propagée — voir VerifyEmailAddress::sendTo).
     */
    public static function sendTo(User $user, string $token): bool
    {
        try {
            $user->notify(new self($token));

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
        $base = rtrim((string) config('app.frontend_url'), '/');
        $url = $base.'/reinitialiser-mot-de-passe?'.http_build_query([
            'token' => $this->token,
            'email' => $notifiable->getEmailForVerification(),
        ]);
        $minutes = (int) config('auth.passwords.users.expire', 60);

        return (new MailMessage)
            ->subject('إعادة تعيين كلمة المرور — Smarter Academy')
            ->view(
                ['html' => 'emails.reset-password', 'text' => 'emails.reset-password-text'],
                [
                    'firstName' => trim((string) ($notifiable->first_name ?? '')),
                    'url' => $url,
                    'minutes' => $minutes,
                ],
            );
    }
}
