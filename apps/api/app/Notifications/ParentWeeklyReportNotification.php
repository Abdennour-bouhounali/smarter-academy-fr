<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Le résumé du dimanche (PARENT_SPACE.md §5) : la semaine écoulée d'UN enfant,
 * en chiffres mesurés — temps d'étude actif, temps hors de la page, réponses
 * justes, leçons terminées, الكفاءات maîtrisées — et un lien vers le détail.
 */
class ParentWeeklyReportNotification extends Notification
{
    /** @param  array<string, mixed>  $report  ParentReportService::week() */
    public function __construct(private User $student, private array $report) {}

    /** @return string[] */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $r = $this->report;
        $name = trim(($this->student->first_name ?? '').' '.($this->student->last_name ?? ''));
        $base = rtrim((string) config('app.frontend_url'), '/');
        $t = $r['time'];
        $p = $r['practice'];

        $message = (new MailMessage)
            ->subject("أسبوع {$name} على Smarter Academy")
            ->greeting('السلام عليكم،')
            ->line("هذا ملخّص أسبوع {$name} من {$r['weekStart']} إلى {$r['weekEnd']}.")
            ->line('**وقت الدراسة الفعلي:** '.self::duration($t['studySeconds'])." — في {$t['activeDays']} من 7 أيام")
            ->line('**خارج المنصّة أثناء الدراسة:** '.self::duration($t['awaySeconds'])." ({$t['leaves']} مرّة)")
            ->line('**وقت الألعاب:** '.self::duration($t['gameSeconds']))
            ->line("**التمارين:** {$p['correct']} إجابة صحيحة من {$p['answered']}")
            ->line("**الدروس:** عمل على {$r['lessons']['worked']}، وأنهى {$r['lessons']['completed']}")
            ->line("**كفاءات صارت « متحكَّم فيها » هذا الأسبوع:** {$r['mastered']['count']}");

        foreach (array_slice($r['mastered']['items'], 0, 5) as $item) {
            $message->line('• '.$item['title']);
        }

        if ($t['studySeconds'] < 60) {
            $message->line('لم نسجّل وقت دراسة هذا الأسبوع. قد يكون من المفيد أن تسأله عن السبب، بلطف.');
        }

        return $message
            ->action('التفاصيل في فضاء الوليّ', $base.'/wali/abnaa/'.$this->student->id)
            ->line('يُحسب الوقت الفعلي فقط حين تكون صفحة المنصّة ظاهرة ويتفاعل معها. لإيقاف هذا البريد: فضاء الوليّ ← صفحة الابن.')
            ->salutation('فريق Smarter Academy');
    }

    /** « 1 سا 25 د » — lisible dans un courriel, sans dépendre du client. */
    public static function duration(int $seconds): string
    {
        $minutes = intdiv(max(0, $seconds), 60);
        $h = intdiv($minutes, 60);
        $m = $minutes % 60;

        return $h > 0 ? "{$h} سا {$m} د" : "{$m} د";
    }
}
