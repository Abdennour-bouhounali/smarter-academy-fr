<?php

namespace App\Domain\Progress\Recommendation;

use App\Domain\Progress\Engine\MasteryState;
use App\Domain\Progress\Support\Freshness;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\StudentLearningPointProgress;

/**
 * Que faire ensuite, point par point (Mastery V2, §30) — CONSOMMATEUR de
 * l'état canonique, jamais un second calcul de maîtrise.
 *
 *   gap                               → réapprendre : le(s) module(s) qui
 *                                       enseignent le point ; si un prérequis
 *                                       est lui aussi en gap, d'abord lui
 *   reinforce · insufficient_evidence → s'entraîner sur ce point (d'autres
 *                                       questions : le sélecteur privilégie
 *                                       les items non vus)
 *   reinforce · needs_assessment      → passer le test final
 *   reinforce · threshold             → s'entraîner
 *   mastered · stale                  → un rappel court
 *   mastered · fresh                  → rien à faire ici
 *   unassessed                        → commencer (le module qui l'enseigne)
 *
 * Aucune recommandation ne BLOQUE : le produit est non bloquant (D8).
 */
class RecommendationService
{
    public const KIND_RETEACH = 'reteach';

    public const KIND_PREREQUISITE = 'prerequisite';

    public const KIND_PRACTICE = 'practice';

    public const KIND_ASSESSMENT = 'assessment';

    public const KIND_REFRESH = 'refresh';

    public const KIND_START = 'start';

    /** @return array<int, array<string, mixed>> une recommandation par point qui en appelle une */
    public function forLesson(int $userId, Lesson $lesson): array
    {
        $points = LearningPoint::where('lesson_id', $lesson->id)->whereNull('retired_at')->orderBy('order')
            ->with(['prerequisites:id,code,title,lesson_id', 'prerequisites.lesson:id,code,publication_status'])->get();
        $states = StudentLearningPointProgress::where('user_id', $userId)
            ->whereIn('learning_point_id', $points->pluck('id')->merge($points->flatMap->prerequisites->pluck('id'))->unique())
            ->get()->keyBy('learning_point_id');

        // Quel module enseigne quel point (registre de contenu).
        $teaching = [];
        foreach (LessonModule::where('lesson_id', $lesson->id)->whereNull('retired_at')->orderBy('number')->get(['number', 'title', 'teaches_learning_point_codes']) as $module) {
            foreach ($module->teaches_learning_point_codes ?? [] as $code) {
                $teaching[$code][] = ['number' => (int) $module->number, 'title' => $module->title];
            }
        }

        $out = [];
        foreach ($points as $lp) {
            $s = $states->get($lp->id);
            $status = $s?->status ?? MasteryState::STATUS_UNASSESSED;
            $reason = $s?->status_reason;
            $freshness = $s ? Freshness::of($s->last_evidence_at) : null;

            $kind = match (true) {
                $status === MasteryState::STATUS_GAP => self::KIND_RETEACH,
                $status === MasteryState::STATUS_REINFORCE && $reason === MasteryState::REASON_NEEDS_ASSESSMENT => self::KIND_ASSESSMENT,
                $status === MasteryState::STATUS_REINFORCE => self::KIND_PRACTICE,
                $status === MasteryState::STATUS_MASTERED && $freshness === Freshness::STALE => self::KIND_REFRESH,
                $status === MasteryState::STATUS_UNASSESSED => self::KIND_START,
                default => null,
            };
            if ($kind === null) {
                continue;
            }

            // Un prérequis en gap passe devant : réapprendre sur du sable ne tient pas.
            $weakPrerequisites = $lp->prerequisites
                // Jamais vers une leçon non publiée (1AM–3AM `coming_soon`, importée `draft`) :
                // l'élève ne pourrait pas y aller (phase 2 du cycle moyen, 2026-10-14).
                ->filter(fn ($p) => $p->lesson?->isVisibleToStudents())
                ->filter(fn ($p) => ($states->get($p->id)?->status) === MasteryState::STATUS_GAP)
                // `lessonCode` : la leçon où ce prérequis se rattrape (le client y renvoie).
                ->map(fn ($p) => ['code' => $p->code, 'title' => $p->title, 'lessonCode' => $p->lesson?->code])->values()->all();
            if ($kind === self::KIND_RETEACH && $weakPrerequisites !== []) {
                $kind = self::KIND_PREREQUISITE;
            }

            $out[] = [
                'learningPoint' => ['code' => $lp->code, 'title' => $lp->title],
                'status' => $status,
                'statusReason' => $reason,
                'freshness' => $freshness,
                'kind' => $kind,
                'modules' => $teaching[$lp->code] ?? [],
                'prerequisites' => $weakPrerequisites,
                // L'ordre de priorité d'affichage : le plus urgent d'abord.
                'priority' => match ($kind) {
                    self::KIND_PREREQUISITE => 0,
                    self::KIND_RETEACH => 1,
                    self::KIND_PRACTICE => 2,
                    self::KIND_ASSESSMENT => 3,
                    self::KIND_REFRESH => 4,
                    default => 5,
                },
            ];
        }

        usort($out, fn ($a, $b) => $a['priority'] <=> $b['priority']);

        return $out;
    }
}
