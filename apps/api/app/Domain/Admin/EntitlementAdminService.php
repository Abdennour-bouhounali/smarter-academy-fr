<?php

namespace App\Domain\Admin;

use App\Models\Entitlement;
use App\Models\User;
use DomainException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Accorder et retirer une DÉROGATION d'administration.
 *
 * Strictement limité à `admin_override`. Un administrateur ne fabrique pas
 * d'abonnement à la main : ces lignes-là appartiendront à la synchronisation
 * de paiement, et un abonnement accordé au clavier serait un abonnement que
 * personne n'a payé, invisible dans toute réconciliation comptable. Le geste
 * commercial existe — c'est justement la dérogation, et elle porte son nom.
 *
 * Ce que la dérogation N'EST PAS : un passe-droit vers du contenu non publié.
 * Voir ContentAccess.
 */
class EntitlementAdminService
{
    public function __construct(private ActivityLogger $log) {}

    /**
     * Accorde une dérogation, en révoquant celle déjà en cours s'il y en a une.
     *
     * Le remplacement plutôt que l'accumulation : deux dérogations actives
     * simultanées rendraient « jusqu'à quand cet élève a-t-il accès ? »
     * ambigu, et l'ambiguïté se paierait au support. L'unicité est tenue ICI
     * plutôt que par un index unique en base, parce qu'elle ne concerne que
     * ce type : les abonnements, eux, doivent pouvoir se chevaucher (un
     * renouvellement anticipé recouvre la fin du précédent) et un index les
     * casserait (spec §35).
     */
    public function grantOverride(
        User $admin,
        User $student,
        ?Carbon $expiresAt = null,
        ?string $reason = null,
    ): Entitlement {
        if ($expiresAt !== null && $expiresAt->lessThanOrEqualTo(Carbon::now())) {
            throw new DomainException('La date de fin doit être dans le futur.');
        }

        return DB::transaction(function () use ($admin, $student, $expiresAt, $reason) {
            $this->revokeActiveOverrides($admin, $student, 'remplacée');

            $entitlement = Entitlement::create([
                'user_id' => $student->id,
                'type' => Entitlement::TYPE_ADMIN_OVERRIDE,
                'status' => Entitlement::STATUS_ACTIVE,
                'starts_at' => Carbon::now(),
                'expires_at' => $expiresAt,
                'source' => 'admin',
                'granted_by' => $admin->id,
                'reason' => $reason,
            ]);

            // Dans la MÊME transaction que l'écriture : un accès accordé sans
            // trace, ou une trace sans accès, sont deux façons de rendre le
            // journal inutilisable pour répondre à « qui a ouvert ça ? ».
            $this->log->log(
                $admin,
                ActivityLogger::ENTITLEMENT_GRANTED,
                'user',
                $student->id,
                null,
                [
                    'type' => Entitlement::TYPE_ADMIN_OVERRIDE,
                    'entitlement_id' => $entitlement->id,
                    'expires_at' => optional($expiresAt)->toIso8601String(),
                    'reason' => $reason,
                ],
            );

            return $entitlement;
        });
    }

    /**
     * Retire la dérogation en cours.
     *
     * La ligne n'est jamais SUPPRIMÉE : « cet élève a eu accès du 3 au 12 »
     * est précisément ce qu'un audit vient chercher, et une ligne effacée ne
     * répond plus à rien (spec §36). Le statut change, l'histoire reste.
     */
    public function revokeOverride(User $admin, User $student, ?string $reason = null): int
    {
        return DB::transaction(function () use ($admin, $student, $reason) {
            $count = $this->revokeActiveOverrides($admin, $student, $reason);

            if ($count === 0) {
                throw new DomainException('Cet élève n\'a aucune dérogation active.');
            }

            $this->log->log(
                $admin,
                ActivityLogger::ENTITLEMENT_REVOKED,
                'user',
                $student->id,
                ['type' => Entitlement::TYPE_ADMIN_OVERRIDE, 'active' => $count],
                ['type' => Entitlement::TYPE_ADMIN_OVERRIDE, 'active' => 0, 'reason' => $reason],
            );

            return $count;
        });
    }

    /** Le geste brut, sans journal : les deux appelants ci-dessus s'en chargent. */
    private function revokeActiveOverrides(User $admin, User $student, ?string $reason): int
    {
        return Entitlement::where('user_id', $student->id)
            ->where('type', Entitlement::TYPE_ADMIN_OVERRIDE)
            ->where('status', Entitlement::STATUS_ACTIVE)
            ->update([
                'status' => Entitlement::STATUS_REVOKED,
                'revoked_at' => Carbon::now(),
                'revoked_by' => $admin->id,
                'reason' => $reason,
            ]);
    }

    private static function fullName(?User $user): ?string
    {
        return $user === null ? null : trim($user->first_name.' '.$user->last_name);
    }

    /**
     * L'historique complet d'un élève — pour répondre « pourquoi a-t-il
     * accès ? » sans ouvrir un client SQL (spec §52).
     *
     * @return array<int, array<string, mixed>>
     */
    public function history(User $student): array
    {
        return Entitlement::where('user_id', $student->id)
            ->with(['grantedBy:id,first_name,last_name', 'revokedBy:id,first_name,last_name'])
            ->orderByDesc('id')
            ->get()
            ->map(fn (Entitlement $e) => [
                'id' => $e->id,
                'type' => $e->type,
                'status' => $e->status,
                'valid' => $e->isValid(),
                'startsAt' => optional($e->starts_at)->toIso8601String(),
                'expiresAt' => optional($e->expires_at)->toIso8601String(),
                'source' => $e->source,
                'reference' => $e->reference,
                'reason' => $e->reason,
                // `?->` s'arrête à null, mais la CONCATÉNATION qui l'entoure,
                // elle, ne s'arrête pas : sans le test explicite, une relation
                // absente rendait « " " », une chaîne d'un espace que
                // l'interface affiche comme un nom vide au lieu de rien.
                'grantedBy' => self::fullName($e->grantedBy),
                'revokedAt' => optional($e->revoked_at)->toIso8601String(),
                'revokedBy' => self::fullName($e->revokedBy),
            ])
            ->all();
    }
}
