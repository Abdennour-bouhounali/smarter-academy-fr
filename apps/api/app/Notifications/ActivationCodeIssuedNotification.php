<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

/**
 * « Voici votre code d'activation. »
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
        $message = (new MailMessage)
            ->subject('رمز التفعيل الخاص بك — Smarter Academy')
            ->greeting('السلام عليكم،')
            ->line("إليك رمز تفعيل العرض « {$this->planName} » :")
            ->line('**'.$this->code.'**')
            ->line('أدخله في صفحة « تفعيل الوصول » من حسابك.');

        if ($this->redeemBy !== null) {
            $message->line('يجب إدخال الرمز قبل '.$this->redeemBy->toDateString().'.');
        }

        return $message->salutation('فريق Smarter Academy');
    }
}
