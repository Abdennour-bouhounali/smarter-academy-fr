<?php

namespace App\Domain\Admin;

use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;

/**
 * Le STATUT DE COMPTE, pour tout compte non administrateur.
 *
 * Suspendre ou désactiver est une décision de cycle de vie du compte ; la
 * conservation de l'historique en est une autre (spec §2.4) : rien ici ne
 * touche l'apprentissage, ni les classes d'un enseignant, ni ses abonnements.
 * Un compte fermé ne garde pas de jeton valide ; un compte suspendu les
 * garde — la suspension est temporaire.
 */
class AccountStatusService
{
    public function __construct(private ActivityLogger $log) {}

    public function change(User $admin, User $target, string $status, string $action, string $entityType): User
    {
        if (! in_array($status, User::ACCOUNT_STATUSES, true)) {
            throw new DomainException('Statut de compte inconnu.');
        }
        if ($target->isAdmin()) {
            throw new DomainException('Le statut d\'un administrateur ne se change pas ici.');
        }

        $before = $target->account_status;

        DB::transaction(function () use ($admin, $target, $status, $before, $action, $entityType) {
            $target->account_status = $status;
            $target->suspended_at = $status === User::STATUS_ACTIVE ? null : now();
            $target->save();

            if ($status === User::STATUS_DISABLED) {
                $target->tokens()->delete();
            }

            $this->log->log($admin, $action, $entityType, $target->id,
                ['account_status' => $before], ['account_status' => $status]);
        });

        return $target;
    }
}
