<?php

namespace App\Console\Commands;

use App\Domain\Family\FamilyClock;
use App\Domain\Family\ParentReportService;
use App\Models\ParentLink;
use App\Models\User;
use App\Notifications\ParentWeeklyReportNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Le résumé hebdomadaire des parents (PARENT_SPACE.md §5) : chaque dimanche
 * matin (Alger), un courriel par lien actif dont le parent n'a pas coupé
 * l'envoi, pour la semaine dimanche → samedi qui vient de finir.
 *
 * Idempotent : `last_weekly_report_week` retient la semaine envoyée ; relancer
 * la commande n'envoie rien deux fois.
 */
class SendParentWeeklyReports extends Command
{
    protected $signature = 'smarter:family:weekly-reports';

    protected $description = 'Envoie aux parents le résumé de la semaine écoulée de chaque enfant lié.';

    public function handle(ParentReportService $reports): int
    {
        $week = FamilyClock::weekStart(1)->toDateString();
        $sent = 0;

        ParentLink::with(['parent', 'student'])
            ->where('status', ParentLink::STATUS_ACTIVE)
            ->where('weekly_email', true)
            ->where(fn ($q) => $q->whereNull('last_weekly_report_week')->orWhere('last_weekly_report_week', '<', $week))
            ->chunkById(100, function ($links) use ($reports, $week, &$sent) {
                foreach ($links as $link) {
                    $parent = $link->parent;
                    $student = $link->student;
                    if (! $parent || ! $student || ! $parent->isParent() || $parent->email_verified_at === null
                        || $parent->account_status !== User::STATUS_ACTIVE) {
                        continue;
                    }
                    try {
                        $parent->notify(new ParentWeeklyReportNotification($student, $reports->week($student, 1)));
                        $link->update(['last_weekly_report_week' => $week]);
                        $sent++;
                    } catch (Throwable $e) {
                        Log::warning('family.weekly_report_failed', ['link' => $link->id, 'error' => $e->getMessage()]);
                    }
                }
            });

        $this->info("{$sent} résumé(s) envoyé(s) pour la semaine du {$week}.");

        return self::SUCCESS;
    }
}
