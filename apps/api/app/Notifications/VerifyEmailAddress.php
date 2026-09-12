<?php

namespace App\Notifications;

use App\Domain\Identity\EmailVerificationLink;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Le courriel « vérifiez votre adresse ».
 *
 * Écrit en français, comme tout ce que l'élève lit. Le gabarit par défaut de
 * Laravel est en anglais ; il n'est donc pas réutilisé tel quel.
 *
 * Ce courriel ne contient AUCUN secret réutilisable : le lien est signé et
 * expire (voir EmailVerificationLink). Il ne contient pas non plus de mot de
 * passe — ni celui de l'élève, ni un mot de passe provisoire.
 */
class VerifyEmailAddress extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = EmailVerificationLink::for($notifiable);
        $hours = (int) (EmailVerificationLink::EXPIRES_AFTER_MINUTES / 60);

        return (new MailMessage)
            ->subject('Vérifiez votre adresse e-mail — Smarter Academy')
            ->greeting('Bienvenue sur Smarter Academy !')
            ->line("Il reste une étape : confirmer que cette adresse e-mail est bien la vôtre.")
            ->action('Vérifier mon adresse', $url)
            ->line("Ce lien est valable {$hours} heures.")
            ->line("Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message : aucun compte ne sera activé sans cette confirmation.")
            ->salutation('À très vite, l\'équipe Smarter Academy');
    }
}
