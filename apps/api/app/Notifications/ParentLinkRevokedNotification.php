<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * « Votre enfant a retiré le lien » — l'élève a rompu le lien depuis son profil. Le parent
 * en est TOUJOURS averti (PARENT_SPACE.md §2) : une rupture silencieuse
 * ferait croire à un enfant qui n'étudie plus.
 */
class ParentLinkRevokedNotification extends Notification
{
    public function __construct(private User $student) {}

    /** @return string[] */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $name = trim(($this->student->first_name ?? '').' '.($this->student->last_name ?? ''));
        $base = rtrim((string) config('app.frontend_url'), '/');

        $brand = (string) config('app.name');

        // `/parent` : le chemin de l'espace parent du frontend (apps/web App.jsx).
        return (new MailMessage)
            ->subject($name.' a retiré le lien avec votre compte — '.$brand)
            ->greeting('Bonjour,')
            ->line("{$name} a retiré, depuis son profil, le lien entre son compte et le vôtre.")
            ->line('Vous ne recevrez plus le résumé de son travail. S’il s’agit d’une erreur, demandez-lui un nouveau code et saisissez-le dans votre espace parent.')
            ->action('Ouvrir mon espace parent', $base.'/parent')
            ->salutation('L’équipe '.$brand);
    }
}
