<?php

namespace App\Domain\Admin;

use App\Domain\Classroom\TeacherCapacityService;
use App\Domain\Plans\PlanAdminService;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Domain\Plans\SubscriptionActivationService;
use App\Domain\Plans\SubscriptionRequestService;
use App\Models\ActivationCodeBatch;
use App\Models\AdminActivityLog;
use App\Models\Classroom;
use App\Models\SubscriptionRequest;
use App\Models\User;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Les ENSEIGNANTS vus par l'administration : la fiche de contrôle complète —
 * compte, offre effective, demande, abonnements, dérogations, classes,
 * journal. Tout est DÉRIVÉ ; ce service n'écrit rien lui-même.
 */
class TeacherService
{
    public function __construct(
        private PlanEntitlementResolver $resolver,
        private SubscriptionActivationService $subscriptions,
        private PlanAdminService $plans,
        private TeacherCapacityService $capacity,
    ) {}

    /** @param array<string, mixed> $filters */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = User::query()
            ->where('role', User::ROLE_TEACHER)
            ->withCount([
                'classrooms as classrooms_count' => fn ($q) => $q->where('status', '!=', Classroom::STATUS_ARCHIVED),
                'subscriptionRequests as pending_requests_count' => fn ($q) => $q->where('status', SubscriptionRequest::STATUS_PENDING),
            ]);

        if ($search = trim((string) ($filters['search'] ?? ''))) {
            $query->where(fn ($q) => $q
                ->where('email', 'like', "%{$search}%")
                ->orWhere('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('id', $search));
        }
        if ($status = ($filters['status'] ?? null)) {
            $query->where('account_status', $status);
        }
        if (in_array((string) ($filters['ambassador'] ?? ''), ['1', 'true'], true)) {
            $query->where('is_ambassador', true);
        }
        if (($filters['requests'] ?? null) === 'pending') {
            $query->whereHas('subscriptionRequests', fn ($q) => $q->where('status', SubscriptionRequest::STATUS_PENDING));
        }

        $sort = $filters['sort'] ?? 'created_at';
        $direction = ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $sortable = ['created_at', 'last_activity_at', 'email', 'account_status', 'classrooms_count'];
        $query->orderBy(in_array($sort, $sortable, true) ? $sort : 'created_at', $direction);

        return $query->paginate(min((int) ($filters['perPage'] ?? 25), 100));
    }

    public function find(int $id): User
    {
        $teacher = User::where('role', User::ROLE_TEACHER)->find($id);
        if (! $teacher) {
            throw new DomainException('Enseignant introuvable.');
        }

        return $teacher;
    }

    /** @return array<string, mixed> */
    public function serializeRow(User $t): array
    {
        $summary = $this->resolver->summaryFor($t);

        return [
            'id' => $t->id,
            'firstName' => $t->first_name,
            'lastName' => $t->last_name,
            'email' => $t->email,
            'accountStatus' => $t->account_status,
            'isAmbassador' => (bool) $t->is_ambassador,
            'ambassadorSince' => optional($t->ambassador_since)->toIso8601String(),
            'emailVerified' => $t->hasVerifiedEmail(),
            'createdAt' => optional($t->created_at)->toIso8601String(),
            'lastActivityAt' => optional($t->last_activity_at)->toIso8601String(),
            'classroomsCount' => $t->classrooms_count ?? null,
            'pendingRequestsCount' => $t->pending_requests_count ?? null,
            'plan' => $summary['plan'],
            'usage' => ['classes' => $summary['classes'], 'students' => $summary['students']],
        ];
    }

    /**
     * La fiche complète — la surface de contrôle de l'administration.
     *
     * @return array<string, mixed>
     */
    public function detail(User $teacher): array
    {
        $classrooms = Classroom::ownedBy($teacher)
            ->withCount(['activeMemberships as students_count'])
            ->orderByDesc('id')
            ->get();

        return [
            'teacher' => $this->serializeRow($teacher),
            'entitlements' => $this->resolver->summaryFor($teacher),
            // Les sièges : la capacité commerciale, comptée en élèves distincts.
            'capacity' => $this->capacity->summary($teacher),
            'entitlementsDetail' => $this->resolver->explain($teacher),
            'overrides' => $this->plans->overridesOf($teacher),
            'requests' => SubscriptionRequest::where('user_id', $teacher->id)->orderByDesc('id')->get()
                ->map(fn ($r) => SubscriptionRequestService::serialize($r))->all(),
            'subscriptions' => $this->subscriptions->history($teacher),
            'issuedCodes' => self::issuedCodes($teacher),
            'classrooms' => $classrooms->map(fn (Classroom $c) => ClassroomAdminService::serialize($c))->all(),
            'activity' => $this->activity($teacher),
        ];
    }

    /**
     * Les codes individuels envoyés à ce compte, et leur état.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function issuedCodes(User $user): array
    {
        return ActivationCodeBatch::where('recipient_user_id', $user->id)
            ->with(['planVersion.plan:id,slug,name', 'codes:id,batch_id,code_hint,status,expires_at,activated_at,activated_by'])
            ->orderByDesc('id')
            ->get()
            ->map(function (ActivationCodeBatch $batch) {
                $code = $batch->codes->first();

                return [
                    'batchId' => $batch->id,
                    'codeId' => $code?->id,
                    'hint' => $code?->code_hint,
                    'status' => $code?->effectiveStatus(),
                    'planName' => $batch->planVersion?->plan?->name,
                    'planVersion' => $batch->planVersion?->version,
                    'studentSeatLimit' => $batch->student_seat_limit,
                    'redeemBy' => optional($batch->redeem_by)->toIso8601String(),
                    'activatedAt' => optional($code?->activated_at)->toIso8601String(),
                    'activatedBy' => $code?->activated_by,
                    'createdAt' => optional($batch->created_at)->toIso8601String(),
                ];
            })
            ->all();
    }

    /**
     * Ce qui concerne cet enseignant dans le journal : ses gestes, et ceux
     * de l'administration sur lui ou sur ses classes.
     *
     * @return array<int, array<string, mixed>>
     */
    private function activity(User $teacher, int $limit = 60): array
    {
        $classroomIds = Classroom::ownedBy($teacher)->pluck('id')->map(fn ($id) => (string) $id)->all();

        return AdminActivityLog::with('admin:id,first_name,last_name,email,role')
            ->where(function ($q) use ($teacher, $classroomIds) {
                $q->where('user_id', $teacher->id)
                    ->orWhere(fn ($s) => $s->where('entity_type', 'user')->where('entity_id', (string) $teacher->id))
                    ->orWhere(fn ($s) => $s->where('entity_type', 'teacher')->where('entity_id', (string) $teacher->id));
                if ($classroomIds !== []) {
                    $q->orWhere(fn ($s) => $s->where('entity_type', 'classroom')->whereIn('entity_id', $classroomIds));
                }
            })
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->map(fn (AdminActivityLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'actor' => $log->admin === null ? null : trim($log->admin->first_name.' '.$log->admin->last_name),
                'actorRole' => $log->admin?->role,
                'entityType' => $log->entity_type,
                'entityId' => $log->entity_id,
                'before' => $log->before,
                'after' => $log->after,
                'createdAt' => optional($log->created_at)->toIso8601String(),
            ])
            ->all();
    }
}
