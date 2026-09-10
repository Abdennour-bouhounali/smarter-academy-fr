<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\SubscriptionService;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Http\Request;

/**
 * Lecture seule — voir SubscriptionService pour la raison.
 */
class AdminSubscriptionController extends Controller
{
    public function __construct(private SubscriptionService $subscriptions) {}

    public function index(Request $request)
    {
        $rows = $this->subscriptions->subscriptions($request->query());

        return response()->json([
            'success' => true,
            'subscriptions' => $rows->through(fn (Subscription $s) => [
                'id' => $s->id,
                'studentId' => $s->user_id,
                'studentEmail' => $s->user?->email,
                'studentName' => trim(($s->user?->first_name ?? '').' '.($s->user?->last_name ?? '')),
                'grade' => $s->user?->grade,
                'plan' => $s->plan,
                'status' => $s->status,
                'startedAt' => $s->started_at,
                'endsAt' => $s->ends_at,
                'provider' => $s->provider,
                'reference' => $s->external_reference,
            ]),
            'summary' => $this->subscriptions->summary(),
        ]);
    }

    public function payments(Request $request)
    {
        $rows = $this->subscriptions->payments($request->query());

        return response()->json([
            'success' => true,
            'payments' => $rows->through(fn (Payment $p) => [
                'id' => $p->id,
                'studentId' => $p->user_id,
                'studentEmail' => $p->user?->email,
                'amount' => $p->amount_cents / 100,
                'currency' => $p->currency,
                'status' => $p->status,
                'provider' => $p->provider,
                'reference' => $p->external_reference,
                'paidAt' => $p->paid_at,
                'plan' => $p->subscription?->plan,
            ]),
            'summary' => $this->subscriptions->summary(),
        ]);
    }
}
