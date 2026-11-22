<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

/**
 * « Voici votre code d’activation. »
 *
 * Le SEUL courriel qui transporte un code en clair — c'est sa raison d'être.
 * La base n'en garde que l'empreinte ; ce message est donc, avec l'écran de
 * l'administrateur, la seule copie qui existera jamais.
 */
class ActivationCodeIssuedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private string $code,
        private string $planName,
        private ?Carbon $redeemBy,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $brand = (string) config('app.name');
        $message = (new MailMessage)
            ->subject('Votre code d’activation — '.$brand)
            ->greeting('Bonjour,')
            ->line("Voici votre code d’activation pour la formule « {$this->planName} » :")
            ->line('**'.$this->code.'**')
            ->line('Saisissez-le dans votre compte, à la rubrique « Code d’activation ».');

        if ($this->redeemBy !== null) {
            // « 1er décembre 2026 », « 15 décembre 2026 » : l'ordinal du premier jour, à la française.
            $date = $this->redeemBy->copy()->locale('fr');
            $message->line('Ce code doit être saisi avant le '.($date->day === 1 ? '1er' : $date->day).' '.$date->translatedFormat('F Y').'.');
        }

        return $message->salutation('L’équipe '.$brand);
    }
}
