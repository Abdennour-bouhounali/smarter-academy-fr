<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookOrderPayment extends Model
{
    public const PAYMENT = 'payment';

    public const REFUND = 'refund';

    public const METHODS = ['cash_on_delivery', 'ccp', 'baridimob', 'bank', 'other'];

    protected $fillable = ['book_order_id', 'kind', 'amount', 'method', 'note', 'received_at', 'recorded_by'];

    protected function casts(): array
    {
        return ['amount' => 'integer', 'received_at' => 'datetime'];
    }
}
