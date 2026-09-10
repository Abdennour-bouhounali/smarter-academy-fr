<?php

namespace App\Domain\Admin;

use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Abonnements et paiements — EN LECTURE SEULE dans cette version.
 *
 * Aucun fournisseur de paiement n'est intégré : ces tables ne seront
 * remplies que le jour où l'un le sera. Il n'existe donc volontairement
 * aucune méthode d'écriture ici — un abonnement inventé à la main dans
 * l'administration donnerait un accès que rien n'a payé, et ferait diverger
 * la base de la réalité comptable.
 *
 * Les écrans correspondants affichent un état vide honnête.
 */
class SubscriptionService
{
    public function subscriptions(array $filters = []): LengthAwarePaginator
    {
        $query = Subscription::with('user:id,first_name,last_name,email,grade,account_status');

        if ($status = ($filters['status'] ?? null)) {
            $query->where('status', $status);
        }

        if ($search = ($filters['search'] ?? null)) {
            $query->whereHas('user', fn ($q) => $q
                ->where('email', 'like', "%{$search}%")
                ->orWhere('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%"));
        }

        return $query->orderByDesc('started_at')
            ->paginate(min((int) ($filters['perPage'] ?? 25), 100));
    }

    public function payments(array $filters = []): LengthAwarePaginator
    {
        $query = Payment::with(['user:id,first_name,last_name,email', 'subscription:id,plan,status']);

        if ($status = ($filters['status'] ?? null)) {
            $query->where('status', $status);
        }

        return $query->orderByDesc('paid_at')
            ->paginate(min((int) ($filters['perPage'] ?? 25), 100));
    }

    /** De quoi afficher un en-tête honnête au-dessus d'un tableau vide. */
    public function summary(): array
    {
        return [
            'total' => Subscription::count(),
            'active' => Subscription::where('status', Subscription::STATUS_ACTIVE)->count(),
            'expired' => Subscription::where('status', Subscription::STATUS_EXPIRED)->count(),
            'cancelled' => Subscription::where('status', Subscription::STATUS_CANCELLED)->count(),
            'payments' => Payment::count(),
            // Dit à l'interface POURQUOI c'est vide, pour qu'elle ne laisse
            // pas croire à une panne de chargement.
            'paymentProviderIntegrated' => false,
        ];
    }
}
