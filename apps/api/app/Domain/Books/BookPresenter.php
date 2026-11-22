<?php

namespace App\Domain\Books;

use App\Models\Book;
use App\Models\BookMessage;
use App\Models\BookOrder;
use App\Models\BookOrderEvent;
use App\Models\BookOrderPayment;

/** La forme JSON des objets de la librairie — un seul endroit, public et admin. */
final class BookPresenter
{
    public static function publicBook(Book $book, bool $full = false): array
    {
        $data = [
            'id' => $book->id,
            'slug' => $book->slug,
            'title' => $book->title,
            'subtitle' => $book->subtitle,
            'author' => $book->author,
            'summary' => $book->summary,
            'price' => $book->price,
            'coverImage' => $book->cover_image,
        ];

        if ($full) {
            $data['content'] = $book->content ?? [];
            $data['gallery'] = $book->gallery ?? [];
        }

        return $data;
    }

    public static function adminBook(Book $book): array
    {
        return self::publicBook($book, true) + [
            'status' => $book->status,
            'sortOrder' => $book->sort_order,
            'ordersCount' => $book->orders_count ?? null,
            'createdAt' => $book->created_at,
            'updatedAt' => $book->updated_at,
        ];
    }

    public static function order(BookOrder $order, bool $detail = false): array
    {
        $data = [
            'id' => $order->id,
            'reference' => $order->reference,
            'book' => $order->book ? ['id' => $order->book->id, 'title' => $order->book->title, 'slug' => $order->book->slug] : null,
            'customerName' => $order->customer_name,
            'phone' => $order->phone,
            'email' => $order->email,
            'wilaya' => $order->wilaya,
            'commune' => $order->commune,
            'quantity' => $order->quantity,
            'unitPrice' => $order->unit_price,
            'subtotal' => $order->subtotal(),
            'deliveryFee' => $order->delivery_fee,
            'deliveryMode' => $order->delivery_mode,
            'total' => $order->total(),
            'paidAmount' => $order->paidAmount(),
            'paymentStatus' => $order->paymentStatus(),
            'status' => $order->status,
            'allowedStatuses' => BookOrder::TRANSITIONS[$order->status] ?? [],
            'createdAt' => $order->created_at,
            'updatedAt' => $order->updated_at,
        ];

        if ($detail) {
            $data += [
                'address' => $order->address,
                'customerNote' => $order->customer_note,
                'adminNote' => $order->admin_note,
                'payments' => $order->payments->map(fn (BookOrderPayment $p) => [
                    'id' => $p->id,
                    'kind' => $p->kind,
                    'amount' => $p->amount,
                    'method' => $p->method,
                    'note' => $p->note,
                    'receivedAt' => $p->received_at,
                ])->values(),
                'events' => $order->events->map(fn (BookOrderEvent $e) => [
                    'id' => $e->id,
                    'type' => $e->type,
                    'from' => $e->from_value,
                    'to' => $e->to_value,
                    'by' => $e->user ? trim(($e->user->first_name ?? '').' '.($e->user->last_name ?? '')) ?: $e->user->email : null,
                    'createdAt' => $e->created_at,
                ])->values(),
            ];
        }

        return $data;
    }

    public static function message(BookMessage $m): array
    {
        return [
            'id' => $m->id,
            'bookId' => $m->book_id,
            'fullName' => $m->full_name,
            'email' => $m->email,
            'phone' => $m->phone,
            'country' => $m->country,
            'role' => $m->role,
            'school' => $m->school,
            'bookOwner' => $m->book_owner,
            'subject' => $m->subject,
            'message' => $m->message,
            'status' => $m->status,
            'adminNote' => $m->admin_note,
            'createdAt' => $m->created_at,
        ];
    }
}
