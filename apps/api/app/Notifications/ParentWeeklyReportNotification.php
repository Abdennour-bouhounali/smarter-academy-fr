<?php

namespace App\Notifications;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Le résumé du lundi matin (PARENT_SPACE.md §5) : la semaine écoulée (du lundi
 * au dimanche) d'UN enfant, en chiffres mesurés — temps d'étude actif, temps
 * hors de la page, réponses justes, leçons terminées, savoir-faire maîtrisés —
 * et un lien vers le détail. Écrit au parent : « vous ».
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
        $first = trim((string) ($this->student->first_name ?? '')) ?: $name;
        $base = rtrim((string) config('app.frontend_url'), '/');
        $brand = (string) config('app.name');
        $t = $r['time'];
        $p = $r['practice'];

        $message = (new MailMessage)
            ->subject("La semaine de {$name} sur {$brand}")
            ->greeting('Bonjour,')
            ->line("Voici le résumé de la semaine de {$name}, ".self::period($r['weekStart'], $r['weekEnd']).'.')
            ->line('**Temps d’étude effectif :** '.self::duration($t['studySeconds']).', '.self::count($t['activeDays'], 'jour', 'jours').' sur 7')
            ->line('**Hors de la plateforme pendant l’étude :** '.self::duration($t['awaySeconds']).' ('.self::count($t['leaves'], 'fois', 'fois').')')
            ->line('**Temps de jeu :** '.self::duration($t['gameSeconds']))
            ->line('**Exercices :** '.self::count($p['correct'], 'réponse juste', 'réponses justes').' sur '.$p['answered'])
            ->line('**Leçons :** '.self::count($r['lessons']['worked'], 'travaillée', 'travaillées').', '.self::count($r['lessons']['completed'], 'terminée', 'terminées'))
            ->line('**Savoir-faire maîtrisés cette semaine :** '.$r['mastered']['count']);

        foreach (array_slice($r['mastered']['items'], 0, 5) as $item) {
            $message->line('• '.$item['title']);
        }

        if ($t['studySeconds'] < 60) {
            $message->line("Nous n’avons enregistré aucun temps d’étude cette semaine. Vous pouvez en parler avec {$first}, simplement.");
        }

        // `/parent/enfants/{id}` : la page de l'enfant dans l'espace parent du frontend (apps/web App.jsx).
        return $message
            ->action('Voir le détail dans mon espace parent', $base.'/parent/enfants/'.$this->student->id)
            ->line('Le temps effectif ne compte que lorsque la page de la plateforme est affichée et utilisée. Pour ne plus recevoir ce courriel : espace parent, puis la page de votre enfant.')
            ->salutation('L’équipe '.$brand);
    }

    /** « 1 h 25 min » — lisible dans un courriel, sans dépendre du client. */
    public static function duration(int $seconds): string
    {
        $minutes = intdiv(max(0, $seconds), 60);
        $h = intdiv($minutes, 60);
        $m = $minutes % 60;

        return $h > 0 ? "{$h} h {$m} min" : "{$m} min";
    }

    /** « 0 jour », « 1 jour », « 3 jours » — le nombre et son nom ne se séparent pas. */
    private static function count(int $n, string $one, string $other): string
    {
        return $n.' '.($n <= 1 ? $one : $other);
    }

    /** « du lundi 16 au dimanche 22 novembre 2026 » (dates AAAA-MM-JJ du rapport). */
    private static function period(string $from, string $to): string
    {
        $a = CarbonImmutable::parse($from)->locale('fr');
        $b = CarbonImmutable::parse($to)->locale('fr');
        // « lundi 1er » : l'ordinal du premier jour du mois, à la française.
        $day = fn (CarbonImmutable $d) => $d->translatedFormat('l').' '.($d->day === 1 ? '1er' : $d->day);
        $left = $a->month === $b->month ? $day($a) : $day($a).' '.$a->translatedFormat('F');

        return 'du '.$left.' au '.$day($b).' '.$b->translatedFormat('F Y');
    }
}
