<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * « ألغى ابنك الربط » — l'élève a rompu le lien depuis son profil. Le parent
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

        return (new MailMessage)
            ->subject('تمّ إلغاء الربط بحساب '.$name.' — Smarter Academy')
            ->greeting('السلام عليكم،')
            ->line("ألغى {$name} الربط بين حسابه وحسابك من صفحة ملفّه الشخصي.")
            ->line('لن تصلك تقارير عمله بعد الآن. إن كان ذلك خطأً، اطلب منه رمزًا جديدًا وأدخله في فضاء الوليّ.')
            ->action('فضاء الوليّ', $base.'/wali')
            ->salutation('فريق Smarter Academy');
    }
}
