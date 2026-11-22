<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Une commande de livre. Le total et l'état du paiement sont CALCULÉS (jamais
 * stockés) : le frais de livraison peut changer après coup (l'admin le corrige
 * à l'appel de confirmation) et les paiements sont des lignes — une valeur
 * stockée serait fausse dès le premier changement. Le frais lui-même est figé à
 * la commande par le tarif du transporteur (DeliveryFees) quand un mode est choisi.
 */
class BookOrder extends Model
{
    public const PENDING = 'pending';

    public const CONFIRMED = 'confirmed';

    public const IN_WAY = 'in_way';

    public const DELIVERED = 'delivered';

    public const RETURNED = 'returned';

    public const CANCELLED = 'cancelled';

    public const STATUSES = [self::PENDING, self::CONFIRMED, self::IN_WAY, self::DELIVERED, self::RETURNED, self::CANCELLED];

    /** @var array<string, array<int, string>> */
    public const TRANSITIONS = [
        self::PENDING => [self::CONFIRMED, self::CANCELLED],
        self::CONFIRMED => [self::IN_WAY, self::CANCELLED],
        self::IN_WAY => [self::DELIVERED, self::RETURNED],
        self::DELIVERED => [self::RETURNED],
        self::RETURNED => [],
        self::CANCELLED => [],
    ];

    protected $fillable = [
        'reference', 'book_id', 'customer_name', 'phone', 'email', 'wilaya', 'commune',
        'address', 'customer_note', 'quantity', 'unit_price', 'delivery_fee', 'delivery_mode', 'status', 'admin_note',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'integer',
            'delivery_fee' => 'integer',
        ];
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(BookOrderPayment::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(BookOrderEvent::class);
    }

    public function subtotal(): int
    {
        return $this->unit_price * $this->quantity;
    }

    public function total(): int
    {
        return $this->subtotal() + (int) $this->delivery_fee;
    }

    /** Encaissé net : paiements moins remboursements. */
    public function paidAmount(): int
    {
        $payments = $this->relationLoaded('payments') ? $this->payments : $this->payments()->get();

        return (int) $payments->sum(fn (BookOrderPayment $p) => $p->kind === BookOrderPayment::REFUND ? -$p->amount : $p->amount);
    }

    /** unpaid | partial | paid | overpaid */
    public function paymentStatus(): string
    {
        $paid = $this->paidAmount();

        return match (true) {
            $paid <= 0 => 'unpaid',
            $paid < $this->total() => 'partial',
            $paid === $this->total() => 'paid',
            default => 'overpaid',
        };
    }

    public function canMoveTo(string $status): bool
    {
        return in_array($status, self::TRANSITIONS[$this->status] ?? [], true);
    }
}
