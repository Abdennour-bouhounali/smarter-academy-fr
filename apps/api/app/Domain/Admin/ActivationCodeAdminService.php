<?php

namespace App\Domain\Admin;

use App\Domain\Access\ActivationCodes\ActivationCodeGenerator;
use App\Domain\Access\EntitlementService;
use App\Domain\Access\SubscriptionEntitlementSynchronizer;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Models\ActivationCode;
use App\Models\ActivationCodeBatch;
use App\Models\AdminActivityLog;
use App\Models\Entitlement;
use App\Models\Plan;
use App\Models\PlanVersion;
use App\Models\Subscription;
use App\Models\User;
use App\Notifications\ActivationCodeIssuedNotification;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Les codes d'activation, vus de l'administration : consulter, filtrer,
 * révoquer.
 *
 * La PRODUCTION n'est pas ici — elle vit dans ActivationCodeGenerator, parce
 * qu'elle seule manipule des codes en clair et que cette frontière doit rester
 * visible. Ce service ne voit jamais un code : il travaille sur des
 * empreintes, des indices de 4 symboles et des états.
 */
class ActivationCodeAdminService
{
    public function __construct(
        private ActivityLogger $log,
        private EntitlementService $entitlements,
        private ActivationCodeGenerator $generator,
        private SubscriptionEntitlementSynchronizer $sync,
        private PlanEntitlementResolver $resolver,
    ) {}

    /**
     * UN code, pour UN compte, envoyé par courriel — la vente individuelle
     * quand l'administration préfère un code à une activation directe.
     *
     * Un lot de quantité 1, lié à l'offre, marqué de son destinataire. Le
     * code en clair est rendu une fois (comme pour tout lot) ET envoyé à
     * l'adresse du compte. Le saisir depuis un autre compte reste possible —
     * le code est le secret — mais l'administration voit qui l'a saisi.
     *
     * @return array{batch: ActivationCodeBatch, code: array{id: int, code: string, hint: string}}
     */
    public function issueIndividualCode(User $admin, User $recipient, Plan $plan, ?PlanVersion $version, ?Carbon $redeemBy, ?int $accessDays, ?Carbon $accessEndsAt, ?int $studentSeats = null): array
    {
        if ($recipient->isAdmin()) {
            throw new DomainException('Un administrateur n\'a pas d\'offre.');
        }
        $expectedType = $recipient->isTeacher() ? Plan::TYPE_TEACHER : Plan::TYPE_STUDENT;
        if ($plan->type !== $expectedType) {
            throw new DomainException('Cette offre ne correspond pas au type de ce compte.');
        }
        $version ??= $plan->currentVersion;
        if ($version === null || $version->plan_id !== $plan->id) {
            throw new DomainException('Cette offre n\'a pas de version publiée.');
        }

        $result = $this->generator->generateBatch($admin, [
            'label' => 'Code individuel — '.$recipient->email,
            'quantity' => 1,
            'accessDays' => $accessDays,
            'accessEndsAt' => $accessEndsAt,
            'redeemBy' => $redeemBy,
            'planVersionId' => $version->id,
            'recipientUserId' => $recipient->id,
            'studentSeatLimit' => $studentSeats,
        ]);

        $code = $result['codes'][0];

        $recipient->notify(new ActivationCodeIssuedNotification($code['code'], $plan->name, $redeemBy));

        $this->log->log($admin, ActivityLogger::ACTIVATION_CODE_ISSUED, 'user', $recipient->id, null, [
            'batch_id' => $result['batch']->id,
            'plan' => $plan->slug,
            'plan_version' => $version->version,
            'student_seat_limit' => $studentSeats,
        ]);

        return ['batch' => $result['batch'], 'code' => $code];
    }

    /** Les tris autorisés. Liste blanche : la valeur vient de l'URL. */
    private const SORTABLE = [
        'created_at' => 'activation_codes.created_at',
        'activated_at' => 'activation_codes.activated_at',
        'expires_at' => 'activation_codes.expires_at',
        'status' => 'activation_codes.status',
    ];

    /**
     * La liste paginée, filtrée.
     *
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = $this->filtered($filters)
            ->with([
                'batch:id,label',
                'activatedBy:id,first_name,last_name,email',
                'revokedBy:id,first_name,last_name',
                'entitlement:id,status,expires_at',
            ]);

        $sort = self::SORTABLE[$filters['sort'] ?? 'created_at'] ?? self::SORTABLE['created_at'];
        $direction = ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction)
            ->orderByDesc('activation_codes.id')
            ->paginate(min((int) ($filters['perPage'] ?? 25), 100));
    }

    /**
     * La requête filtrée, sans tri ni pagination — partagée par la liste, les
     * compteurs et l'export, pour que les trois ne puissent pas diverger.
     *
     * @param  array<string, mixed>  $filters
     */
    private function filtered(array $filters): Builder
    {
        $query = ActivationCode::query();

        if ($status = ($filters['status'] ?? null)) {
            if (in_array($status, ActivationCode::STATUSES, true)) {
                $query->effectiveStatus($status);
            }
        }

        if ($batchId = ($filters['batch'] ?? null)) {
            $query->where('batch_id', (int) $batchId);
        }

        if ($studentId = ($filters['student'] ?? null)) {
            $query->where('activated_by', (int) $studentId);
        }

        if ($search = trim((string) ($filters['search'] ?? ''))) {
            // L'indice de 4 symboles est le pont entre une carte physique et
            // une ligne : « le code se termine par 7K2P ». Les autres critères
            // servent le cas inverse — retrouver le code d'un élève qui
            // appelle. La recherche est insensible aux tirets et à la casse,
            // comme la saisie élève.
            $hint = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $search) ?? '');

            $query->where(function ($q) use ($search, $hint) {
                if ($hint !== '') {
                    $q->where('code_hint', 'like', "%{$hint}%");
                }
                $q->orWhereHas('activatedBy', fn ($u) => $u
                    ->where('email', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%"))
                    ->orWhereHas('batch', fn ($b) => $b->where('label', 'like', "%{$search}%"));
            });
        }

        foreach ([
            'createdFrom' => ['created_at', '>='],
            'createdTo' => ['created_at', '<='],
            'activatedFrom' => ['activated_at', '>='],
            'activatedTo' => ['activated_at', '<='],
            'expiresBefore' => ['expires_at', '<='],
        ] as $key => [$column, $operator]) {
            if ($value = ($filters[$key] ?? null)) {
                $query->where("activation_codes.{$column}", $operator, Carbon::parse($value));
            }
        }

        return $query;
    }

    /**
     * Combien de codes dans chaque état — les mêmes filtres appliqués, moins
     * celui sur l'état lui-même : un onglet « Activés » doit continuer
     * d'annoncer combien il y a de disponibles.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, int>
     */
    public function counts(array $filters = []): array
    {
        $base = $filters;
        unset($base['status']);

        $counts = [];
        foreach (ActivationCode::STATUSES as $status) {
            $counts[$status] = (clone $this->filtered($base))->effectiveStatus($status)->count();
        }
        $counts['total'] = $this->filtered($base)->count();

        return $counts;
    }

    /**
     * Les lots, avec le décompte par état de leurs codes.
     *
     * C'est la vue opérationnelle : « le lot d'Oran, 100 cartes, 37 activées,
     * 2 révoquées ». Les décomptes sont faits en UNE requête groupée plutôt
     * qu'en une par lot — cent lots auraient sinon coûté trois cents requêtes.
     */
    public function batches(array $filters = []): LengthAwarePaginator
    {
        $query = ActivationCodeBatch::with(['createdBy:id,first_name,last_name,email', 'planVersion.plan:id,slug,name,type']);

        if ($search = trim((string) ($filters['search'] ?? ''))) {
            $query->where('label', 'like', "%{$search}%");
        }

        $batches = $query->orderByDesc('id')
            ->paginate(min((int) ($filters['perPage'] ?? 25), 100));

        $now = Carbon::now();
        $ids = collect($batches->items())->pluck('id');

        $rows = ActivationCode::whereIn('batch_id', $ids)
            ->get(['batch_id', 'status', 'expires_at']);

        $tally = [];
        foreach ($rows as $row) {
            $state = $row->effectiveStatus($now);
            $tally[$row->batch_id][$state] = ($tally[$row->batch_id][$state] ?? 0) + 1;
        }

        foreach ($batches->items() as $batch) {
            $batch->setAttribute('code_counts', array_merge(
                array_fill_keys(ActivationCode::STATUSES, 0),
                $tally[$batch->id] ?? [],
            ));
        }

        return $batches;
    }

    /**
     * Un code et tout ce qui explique son histoire.
     *
     * @return array<string, mixed>
     */
    public function show(int $id): array
    {
        $code = ActivationCode::with([
            'batch',
            'batch.createdBy:id,first_name,last_name,email',
            'activatedBy:id,first_name,last_name,email,account_status',
            'revokedBy:id,first_name,last_name,email',
            'createdBy:id,first_name,last_name,email',
            'entitlement',
        ])->find($id);

        if ($code === null) {
            throw new DomainException('Code introuvable.');
        }

        return [
            'code' => $this->serialize($code),
            'batch' => $this->serializeBatch($code->batch),
            'entitlement' => $code->entitlement === null ? null : [
                'id' => $code->entitlement->id,
                'status' => $code->entitlement->status,
                'valid' => $code->entitlement->isValid(),
                'startsAt' => optional($code->entitlement->starts_at)->toIso8601String(),
                'expiresAt' => optional($code->entitlement->expires_at)->toIso8601String(),
                'revokedAt' => optional($code->entitlement->revoked_at)->toIso8601String(),
                'reason' => $code->entitlement->reason,
            ],
            'history' => $this->history($code),
        ];
    }

    /**
     * Le journal d'administration qui concerne ce code — production du lot
     * comprise, parce que « quand ces cartes ont-elles été imprimées, et par
     * qui » fait partie de l'histoire d'un code.
     *
     * @return array<int, array<string, mixed>>
     */
    private function history(ActivationCode $code): array
    {
        return AdminActivityLog::with('admin:id,first_name,last_name,email')
            ->where(function ($q) use ($code) {
                $q->where(fn ($s) => $s->where('entity_type', 'activation_code')
                    ->where('entity_id', (string) $code->id));
                if ($code->batch_id !== null) {
                    $q->orWhere(fn ($s) => $s->where('entity_type', 'activation_code_batch')
                        ->where('entity_id', (string) $code->batch_id));
                }
            })
            ->orderByDesc('id')
            ->get()
            ->map(fn (AdminActivityLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'admin' => self::fullName($log->admin),
                'after' => $log->after,
                'createdAt' => optional($log->created_at)->toIso8601String(),
            ])
            ->all();
    }

    /**
     * Révoque UN code.
     *
     * Deux cas, et le second est celui qui compte :
     *
     *   disponible → le code ne pourra plus être saisi. Rien d'autre.
     *   activé     → le code est retiré ET le droit qu'il a ouvert est
     *                révoqué, donc l'accès de l'élève se ferme.
     *
     * Le second existe pour la carte volée, revendue deux fois ou remboursée.
     * Sans lui, un code frauduleux resterait payant à vie dès qu'il a été
     * saisi une fois, et il faudrait aller chercher le droit à la main sur la
     * fiche de l'élève — en sachant lequel, ce que rien n'indiquerait.
     *
     * La ligne n'est JAMAIS supprimée, ni le code ni le droit : « cet élève a
     * eu accès du 3 au 12 » est précisément ce qu'un audit vient chercher.
     */
    public function revoke(User $admin, int $id, string $reason): ActivationCode
    {
        return DB::transaction(function () use ($admin, $id, $reason) {
            $code = ActivationCode::where('id', $id)->lockForUpdate()->first();

            if ($code === null) {
                throw new DomainException('Code introuvable.');
            }

            if ($code->status === ActivationCode::STATUS_REVOKED) {
                throw new DomainException('Ce code est déjà révoqué.');
            }

            $before = $code->effectiveStatus();
            $now = Carbon::now();
            $student = $code->activatedBy;

            $entitlementClosed = $this->revokeEntitlementOf($code, $admin, $reason, $now);

            $code->forceFill([
                'status' => ActivationCode::STATUS_REVOKED,
                'revoked_at' => $now,
                'revoked_by' => $admin->id,
                'revoke_reason' => $reason,
            ])->save();

            $this->log->log(
                $admin,
                ActivityLogger::ACTIVATION_CODE_REVOKED,
                'activation_code',
                $code->id,
                ['status' => $before],
                [
                    'status' => ActivationCode::STATUS_REVOKED,
                    'reason' => $reason,
                    'batch_id' => $code->batch_id,
                    // Dit si un accès a été FERMÉ, pas seulement si une carte
                    // a été neutralisée : les deux n'appellent pas le même
                    // suivi côté support.
                    'entitlement_revoked' => $entitlementClosed,
                ],
            );

            if ($student !== null) {
                $this->entitlements->forget($student);
            }

            return $code->refresh();
        });
    }

    /**
     * Révoque tous les codes ENCORE DISPONIBLES d'un lot.
     *
     * Le geste du lot perdu ou mal imprimé : on neutralise ce qui n'a pas
     * servi. Les codes déjà activés sont laissés intacts — fermer d'un clic
     * l'accès de trente élèves qui ont payé serait un geste bien trop lourd
     * pour être groupé. Pour ceux-là, la révocation reste unitaire et
     * délibérée.
     */
    public function revokeBatch(User $admin, int $batchId, string $reason): int
    {
        return DB::transaction(function () use ($admin, $batchId, $reason) {
            $batch = ActivationCodeBatch::find($batchId);

            if ($batch === null) {
                throw new DomainException('Lot introuvable.');
            }

            $now = Carbon::now();

            $count = ActivationCode::where('batch_id', $batch->id)
                ->where('status', ActivationCode::STATUS_AVAILABLE)
                ->update([
                    'status' => ActivationCode::STATUS_REVOKED,
                    'revoked_at' => $now,
                    'revoked_by' => $admin->id,
                    'revoke_reason' => $reason,
                ]);

            if ($count === 0) {
                throw new DomainException('Ce lot n\'a aucun code encore disponible.');
            }

            $this->log->log(
                $admin,
                ActivityLogger::ACTIVATION_CODE_BATCH_REVOKED,
                'activation_code_batch',
                $batch->id,
                null,
                ['revoked' => $count, 'reason' => $reason, 'label' => $batch->label],
            );

            return $count;
        });
    }

    /**
     * Ferme le droit né d'un code, s'il y en a un.
     *
     * Retrouvé par `reference` plutôt que par `entitlement_id` seul : la
     * référence est l'identité STABLE du droit (voir l'index unique), et elle
     * reste juste même si le lien a été perdu par une suppression de compte
     * qui a mis la colonne à NULL.
     */
    private function revokeEntitlementOf(ActivationCode $code, User $admin, string $reason, Carbon $now): bool
    {
        // Un code lié à une OFFRE a fait naître un abonnement : c'est lui
        // qu'on ferme, et la synchronisation ferme le droit — exactement le
        // chemin par lequel il s'était ouvert.
        $subscription = Subscription::where('provider', Subscription::PROVIDER_ACTIVATION_CODE)
            ->where('external_reference', 'activation_code:'.$code->id)
            ->first();
        if ($subscription !== null) {
            $wasRunning = $subscription->isRunning($now);
            $subscription->forceFill([
                'status' => Subscription::STATUS_CANCELLED,
                'cancelled_at' => $now,
                'ends_at' => $now,
                'activation_note' => trim(($subscription->activation_note ?? '').' — révoqué : '.$reason, ' —'),
            ])->save();
            $this->sync->sync($subscription);
            if ($subscription->user !== null) {
                $this->resolver->forget($subscription->user);
            }

            return $wasRunning;
        }

        $closed = Entitlement::where('type', Entitlement::TYPE_ACTIVATION_CODE)
            ->where('reference', 'activation_code:'.$code->id)
            ->where('status', Entitlement::STATUS_ACTIVE)
            ->update([
                'status' => Entitlement::STATUS_REVOKED,
                'revoked_at' => $now,
                'revoked_by' => $admin->id,
                'reason' => $reason,
            ]);

        return $closed > 0;
    }

    /** @return array<string, mixed> */
    public function serialize(ActivationCode $code): array
    {
        return [
            'id' => $code->id,
            'hint' => $code->code_hint,
            'status' => $code->effectiveStatus(),
            'batchId' => $code->batch_id,
            'batchLabel' => $code->batch?->label,
            'createdAt' => optional($code->created_at)->toIso8601String(),
            'expiresAt' => optional($code->expires_at)->toIso8601String(),
            'activatedAt' => optional($code->activated_at)->toIso8601String(),
            'activatedBy' => $code->activatedBy === null ? null : [
                'id' => $code->activatedBy->id,
                'name' => self::fullName($code->activatedBy),
                'email' => $code->activatedBy->email,
            ],
            'revokedAt' => optional($code->revoked_at)->toIso8601String(),
            'revokedBy' => self::fullName($code->revokedBy),
            'revokeReason' => $code->revoke_reason,
            'entitlementId' => $code->entitlement_id,
        ];
    }

    /** @return array<string, mixed>|null */
    public function serializeBatch(?ActivationCodeBatch $batch): ?array
    {
        if ($batch === null) {
            return null;
        }

        return [
            'id' => $batch->id,
            'label' => $batch->label,
            'quantity' => $batch->quantity,
            'accessDays' => $batch->access_days,
            'accessEndsAt' => optional($batch->access_ends_at)->toIso8601String(),
            'redeemBy' => optional($batch->redeem_by)->toIso8601String(),
            'notes' => $batch->notes,
            // L'offre que chaque code active — nul pour un lot élève classique.
            'planVersionId' => $batch->plan_version_id,
            'plan' => $batch->plan_version_id === null ? null : [
                'slug' => $batch->planVersion?->plan?->slug,
                'name' => $batch->planVersion?->plan?->name,
                'type' => $batch->planVersion?->plan?->type,
                'version' => $batch->planVersion?->version,
            ],
            // La capacité que chaque code ouvre (offre par sièges).
            'studentSeatLimit' => $batch->student_seat_limit,
            'recipientUserId' => $batch->recipient_user_id,
            'createdBy' => self::fullName($batch->createdBy),
            'createdAt' => optional($batch->created_at)->toIso8601String(),
            'codeCounts' => $batch->getAttribute('code_counts'),
        ];
    }

    /**
     * Les lignes de l'export, en flux.
     *
     * Un générateur et non un tableau : un export de dix mille codes ne doit
     * pas tenir en mémoire d'un bloc. `chunkById` pagine côté base, la réponse
     * s'écrit au fil de l'eau.
     *
     * Ce qui sort : des MÉTADONNÉES. Jamais un code — la base n'en a pas, et
     * c'est exactement ce que cette conception garantit.
     *
     * @return iterable<int, array<int, string>>
     */
    public function exportRows(array $filters = []): iterable
    {
        $query = $this->filtered($filters)
            ->with(['batch:id,label', 'activatedBy:id,first_name,last_name,email'])
            ->orderBy('activation_codes.id');

        foreach ($query->lazyById(500, 'activation_codes.id') as $code) {
            yield [
                (string) $code->id,
                (string) ($code->batch?->label ?? ''),
                $code->code_hint,
                $code->effectiveStatus(),
                optional($code->created_at)->toIso8601String() ?? '',
                optional($code->expires_at)->toIso8601String() ?? '',
                optional($code->activated_at)->toIso8601String() ?? '',
                (string) ($code->activatedBy?->email ?? ''),
                optional($code->revoked_at)->toIso8601String() ?? '',
                (string) ($code->revoke_reason ?? ''),
            ];
        }
    }

    /** L'en-tête de l'export. */
    public const EXPORT_HEADER = [
        'id', 'lot', 'indice', 'statut', 'cree_le', 'expire_le',
        'active_le', 'active_par', 'revoque_le', 'motif_revocation',
    ];

    private static function fullName(?User $user): ?string
    {
        return $user === null ? null : (trim($user->first_name.' '.$user->last_name) ?: $user->email);
    }
}
