<?php

namespace App\Domain\Classroom;

use App\Domain\Classroom\Insights\AttentionSignals;
use App\Domain\Classroom\Insights\ClassroomFacts;
use App\Domain\Classroom\Insights\RecentChanges;
use App\Domain\Classroom\Insights\StudentSnapshot;
use App\Domain\Plans\EntitlementKeys;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Models\Classroom;
use App\Models\User;

/**
 * DÉTECTER et COMPRENDRE — ce que l'espace enseignant tire de l'état
 * canonique d'une classe.
 *
 * Le service CHARGE les faits une fois (ClassroomFacts, requêtes groupées)
 * puis applique les calculs purs : les signaux (AttentionSignals), les
 * changements récents (RecentChanges), l'aperçu d'un élève
 * (StudentSnapshot). La même instance de faits sert la classe ET l'élève :
 * un élève voit dans son aperçu exactement les signaux que la classe montre
 * à son sujet.
 *
 * Aucune maîtrise n'est recalculée ici. Le statut d'un point est celui du
 * moteur (student_learning_point_progress) ; ce service le LIT.
 */
class ClassroomInsightService
{
    public function __construct(
        private PlanEntitlementResolver $entitlements,
        private ClassroomProgressService $progress,
    ) {}

    /**
     * « تستحقّ نظرة » et « ما الذي تغيّر؟ » pour une classe.
     *
     * @return array<string, mixed>
     */
    public function attention(Classroom $classroom): array
    {
        $this->assertFeature($classroom->teacher, EntitlementKeys::PROGRESS_CLASS);
        $facts = ClassroomFacts::load($classroom, $this->progress->effectiveLessonIds($classroom));

        return AttentionSignals::compute($facts) + ['recentChanges' => RecentChanges::compute($facts)];
    }

    /**
     * L'aperçu d'un élève et les signaux qui le concernent. L'élève est déjà
     * légitimé (ClassroomAccess::activeStudent).
     *
     * @return array{snapshot: array, signals: array}
     */
    public function forStudent(Classroom $classroom, User $student): array
    {
        $this->assertFeature($classroom->teacher, EntitlementKeys::PROGRESS_STUDENT);
        $facts = ClassroomFacts::load($classroom, $this->progress->effectiveLessonIds($classroom));
        $signals = AttentionSignals::compute($facts);

        return [
            'snapshot' => StudentSnapshot::compute($facts, $student->id),
            'signals' => AttentionSignals::forStudent($signals['signals'], $student->id),
        ];
    }

    private function assertFeature(?User $teacher, string $key): void
    {
        if ($teacher === null || ! $this->entitlements->allows($teacher, $key)) {
            throw new ClassroomException(ClassroomException::FEATURE_UNAVAILABLE, 'Votre offre ne comprend pas cette fonctionnalité.');
        }
    }
}
