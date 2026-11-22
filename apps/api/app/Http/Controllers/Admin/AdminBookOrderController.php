<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Books\BookPresenter;
use App\Domain\Books\DeliveryFees;
use App\Http\Controllers\Controller;
use App\Models\BookOrder;
use App\Models\BookOrderEvent;
use App\Models\BookOrderPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Le suivi des commandes de livres : liste filtrée, états (avec transitions
 * contrôlées), frais et mode de livraison corrigeables après coup, paiements en lignes.
 */
class AdminBookOrderController extends Controller
{
    public function __construct(private ActivityLogger $logger) {}

    public function index(Request $request)
    {
        $query = BookOrder::with(['book:id,title,slug', 'payments']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($bookId = $request->query('bookId')) {
            $query->where('book_id', (int) $bookId);
        }
        if ($wilaya = $request->query('wilaya')) {
            $query->where('wilaya', $wilaya);
        }
        if ($search = trim((string) $request->query('search'))) {
            $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $search).'%';
            $query->where(fn ($q) => $q->where('customer_name', 'like', $like)
                ->orWhere('reference', 'like', $like)
                ->orWhere('phone', 'like', $like));
        }

        $page = $query->latest('id')->paginate(min((int) $request->query('perPage', 20), 100));
        $orders = collect($page->items())->map(fn (BookOrder $o) => BookPresenter::order($o));

        // Le filtre « paiement » est calculé (les paiements sont des lignes) :
        // appliqué sur la page, qui reste petite.
        if ($payment = $request->query('paymentStatus')) {
            $orders = $orders->where('paymentStatus', $payment)->values();
        }

        return response()->json([
            'orders' => $orders,
            'total' => $page->total(),
            'page' => $page->currentPage(),
            'lastPage' => $page->lastPage(),
        ]);
    }

    public function stats(Request $request)
    {
        $orders = BookOrder::with('payments')
            ->when($request->query('bookId'), fn ($q, $id) => $q->where('book_id', (int) $id))
            ->get();

        $byStatus = array_fill_keys(BookOrder::STATUSES, 0);
        $expected = 0;   // commandes vivantes (ni annulées ni retournées)
        $delivered = 0;  // valeur livrée
        $collected = 0;  // encaissé net
        $toCollect = 0;  // livré mais pas (entièrement) encaissé
        $copies = 0;

        foreach ($orders as $o) {
            $byStatus[$o->status]++;
            $paid = $o->paidAmount();
            $collected += $paid;
            if (! in_array($o->status, [BookOrder::CANCELLED, BookOrder::RETURNED], true)) {
                $expected += $o->total();
            }
            if ($o->status === BookOrder::DELIVERED) {
                $delivered += $o->total();
                $copies += $o->quantity;
                $toCollect += max(0, $o->total() - $paid);
            }
        }

        return response()->json([
            'totalOrders' => $orders->count(),
            'byStatus' => $byStatus,
            'expectedRevenue' => $expected,
            'deliveredRevenue' => $delivered,
            'collected' => $collected,
            'toCollect' => $toCollect,
            'copiesDelivered' => $copies,
        ]);
    }

    public function show(int $id)
    {
        return response()->json(['order' => $this->present($this->find($id))]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $data = $request->validate(['status' => ['required', Rule::in(BookOrder::STATUSES)]]);
        $order = $this->find($id);

        if (! $order->canMoveTo($data['status'])) {
            throw ValidationException::withMessages(['status' => ["Transition impossible : {$order->status} → {$data['status']}."]]);
        }

        $from = $order->status;
        DB::transaction(function () use ($order, $data, $request, $from) {
            $order->update(['status' => $data['status']]);
            $this->event($order, 'status', $from, $data['status'], $request);
        });
        $this->logger->log($request->user(), ActivityLogger::BOOK_ORDER_STATUS, 'book_order', $order->id, ['status' => $from], ['status' => $data['status']]);

        return response()->json(['order' => $this->present($order)]);
    }

    /**
     * Frais et mode de livraison, note interne — corrigés par l'administrateur.
     * Le frais est figé à la commande quand le client a choisi un mode (DeliveryFees) ; sinon,
     * ou pour une wilaya sans tarif, il est NULL. L'admin peut le fixer ou le corriger, et
     * changer le mode à l'appel de confirmation : changer le mode ne recalcule PAS le frais —
     * le frais saisi par l'admin reste l'autorité.
     */
    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'deliveryFee' => 'nullable|integer|min:0|max:100000',
            'deliveryMode' => ['nullable', Rule::in(DeliveryFees::MODES)],
            'adminNote' => 'nullable|string|max:2000',
        ]);
        $order = $this->find($id);

        DB::transaction(function () use ($order, $data, $request) {
            if (array_key_exists('deliveryFee', $data) && $data['deliveryFee'] !== $order->delivery_fee) {
                $this->event($order, 'delivery_fee', (string) $order->delivery_fee, (string) $data['deliveryFee'], $request);
                $order->delivery_fee = $data['deliveryFee'];
            }
            if (array_key_exists('deliveryMode', $data) && $data['deliveryMode'] !== $order->delivery_mode) {
                $this->event($order, 'delivery_mode', $order->delivery_mode, $data['deliveryMode'], $request);
                $order->delivery_mode = $data['deliveryMode'];
            }
            if (array_key_exists('adminNote', $data)) {
                $order->admin_note = $data['adminNote'];
            }
            $order->save();
        });
        $this->logger->log($request->user(), ActivityLogger::BOOK_ORDER_UPDATED, 'book_order', $order->id, null, ['deliveryFee' => $order->delivery_fee, 'deliveryMode' => $order->delivery_mode]);

        return response()->json(['order' => $this->present($order)]);
    }

    public function addPayment(Request $request, int $id)
    {
        $data = $request->validate([
            'kind' => ['required', Rule::in([BookOrderPayment::PAYMENT, BookOrderPayment::REFUND])],
            'amount' => 'required|integer|min:1|max:1000000',
            'method' => ['required', Rule::in(BookOrderPayment::METHODS)],
            'note' => 'nullable|string|max:255',
            'receivedAt' => 'nullable|date',
        ]);
        $order = $this->find($id);

        // Un remboursement ne peut dépasser ce qui a été encaissé.
        if ($data['kind'] === BookOrderPayment::REFUND && $data['amount'] > $order->paidAmount()) {
            throw ValidationException::withMessages(['amount' => ['Le remboursement dépasse le montant encaissé.']]);
        }

        DB::transaction(function () use ($order, $data, $request) {
            $order->payments()->create([
                'kind' => $data['kind'],
                'amount' => $data['amount'],
                'method' => $data['method'],
                'note' => $data['note'] ?? null,
                'received_at' => $data['receivedAt'] ?? now(),
                'recorded_by' => $request->user()->id,
            ]);
            $this->event($order, $data['kind'], null, (string) $data['amount'], $request);
        });
        $this->logger->log($request->user(), ActivityLogger::BOOK_ORDER_PAYMENT, 'book_order', $order->id, null, ['kind' => $data['kind'], 'amount' => $data['amount']]);

        return response()->json(['order' => $this->present($order)], 201);
    }

    public function removePayment(Request $request, int $id)
    {
        $payment = BookOrderPayment::findOrFail($id);
        $order = $this->find($payment->book_order_id);
        $payment->delete();
        $this->logger->log($request->user(), ActivityLogger::BOOK_ORDER_PAYMENT_REMOVED, 'book_order', $order->id, ['amount' => $payment->amount, 'kind' => $payment->kind], null);

        return response()->json(['order' => $this->present($order)]);
    }

    /** Seule une commande annulée ou retournée peut être supprimée de la liste. */
    public function destroy(Request $request, int $id)
    {
        $order = $this->find($id);
        if (! in_array($order->status, [BookOrder::CANCELLED, BookOrder::RETURNED], true)) {
            throw ValidationException::withMessages(['status' => ['Seule une commande annulée ou retournée peut être supprimée.']]);
        }
        $order->delete();
        $this->logger->log($request->user(), ActivityLogger::BOOK_ORDER_DELETED, 'book_order', $id, ['reference' => $order->reference], null);

        return response()->json(['success' => true]);
    }

    private function find(int $id): BookOrder
    {
        return BookOrder::with(['book:id,title,slug', 'payments', 'events.user'])->findOrFail($id);
    }

    private function present(BookOrder $order): array
    {
        return BookPresenter::order($order->fresh(['book:id,title,slug', 'payments', 'events.user']), true);
    }

    private function event(BookOrder $order, string $type, ?string $from, ?string $to, Request $request): void
    {
        BookOrderEvent::create([
            'book_order_id' => $order->id,
            'type' => $type,
            'from_value' => $from,
            'to_value' => $to,
            'user_id' => $request->user()->id,
        ]);
    }
}
