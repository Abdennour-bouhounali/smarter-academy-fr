<?php

namespace App\Http\Controllers;

use App\Domain\Books\BookPresenter;
use App\Domain\Books\DeliveryFees;
use App\Domain\Books\Wilayas;
use App\Domain\Push\AdminPush;
use App\Models\Book;
use App\Models\BookMessage;
use App\Models\BookOrder;
use App\Models\BookOrderEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * La vitrine publique de la librairie : catalogue, fiche d'un livre, demande
 * de commande (sans paiement en ligne), message de contact.
 */
class BookStoreController extends Controller
{
    private const PHONE = '/^(\+213|00213|0)?[\s.-]?[5-7]([\s.-]?\d){8}$/';

    public function index()
    {
        $books = Book::published()->orderBy('sort_order')->orderBy('id')->get();

        return response()->json(['books' => $books->map(fn (Book $b) => BookPresenter::publicBook($b))]);
    }

    public function show(string $slug)
    {
        $book = Book::published()->where('slug', $slug)->firstOrFail();

        return response()->json(['book' => BookPresenter::publicBook($book, true)]);
    }

    public function wilayas()
    {
        return response()->json(['wilayas' => Wilayas::all()]);
    }

    public function order(Request $request, string $slug)
    {
        // Pot de miel : un humain ne remplit pas un champ caché. La réponse est
        // un faux succès, pour ne rien apprendre au robot.
        if (filled($request->input('website'))) {
            return response()->json(['success' => true, 'reference' => 'BK-0'], 201);
        }

        $book = Book::published()->where('slug', $slug)->firstOrFail();

        $data = $request->validate([
            'customerName' => 'required|string|min:3|max:150',
            'phone' => ['required', 'string', 'max:30', 'regex:'.self::PHONE],
            'email' => 'nullable|email|max:190',
            'wilaya' => ['required', 'string', Rule::in(Wilayas::labels())],
            'commune' => 'required|string|min:2|max:120',
            // L'adresse n'est plus demandée (2026-11-13) : wilaya + commune, précisées à l'appel.
            'address' => 'nullable|string|max:500',
            'customerNote' => 'nullable|string|max:500',
            'quantity' => 'required|integer|min:1|max:10',
            // Nullable exprès : un navigateur qui garde l'ancien formulaire en cache commande
            // encore ; mode et frais restent alors NULL, fixés à l'appel comme avant.
            'deliveryMode' => ['nullable', Rule::in(DeliveryFees::MODES)],
        ]);
        $mode = $data['deliveryMode'] ?? null;

        $order = BookOrder::create([
            'reference' => $this->newReference(),
            'book_id' => $book->id,
            'customer_name' => $data['customerName'],
            'phone' => preg_replace('/[\s.-]+/', '', $data['phone']),
            'email' => $data['email'] ?? null,
            'wilaya' => $data['wilaya'],
            'commune' => $data['commune'],
            'address' => $data['address'] ?? null,
            'customer_note' => $data['customerNote'] ?? null,
            'quantity' => $data['quantity'],
            'unit_price' => $book->price,
            // Le frais est CALCULÉ ici par le tarif du transporteur, jamais lu du client.
            'delivery_mode' => $mode,
            'delivery_fee' => DeliveryFees::fee($data['wilaya'], $mode),
            'status' => BookOrder::PENDING,
        ]);

        BookOrderEvent::create(['book_order_id' => $order->id, 'type' => 'created', 'to_value' => BookOrder::PENDING]);

        // Notification « طلب جديد » aux appareils de la librairie — APRÈS la réponse : le client
        // n'attend jamais l'envoi, et une panne d'envoi ne touche pas sa commande.
        AdminPush::later('book_order', $order->id);

        return response()->json([
            'success' => true,
            'reference' => $order->reference,
            'subtotal' => $order->subtotal(),
            'deliveryFee' => $order->delivery_fee,
            'total' => $order->total(),
        ], 201);
    }

    public function message(Request $request)
    {
        if (filled($request->input('website'))) {
            return response()->json(['success' => true], 201);
        }

        $data = $request->validate([
            'fullName' => 'required|string|min:2|max:150',
            'email' => 'required|email|max:190',
            'phone' => ['nullable', 'string', 'max:30'],
            'country' => 'nullable|string|max:80',
            'role' => ['required', Rule::in(BookMessage::ROLES)],
            'school' => 'nullable|string|max:190',
            'bookOwner' => 'nullable|boolean',
            'subject' => ['required', Rule::in(BookMessage::SUBJECTS)],
            'message' => 'required|string|min:10|max:5000',
            'consent' => 'accepted',
            'bookSlug' => 'nullable|string|max:80',
        ]);

        $bookMessage = BookMessage::create([
            'book_id' => isset($data['bookSlug']) ? Book::where('slug', $data['bookSlug'])->value('id') : null,
            'full_name' => $data['fullName'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'country' => $data['country'] ?? null,
            'role' => $data['role'],
            'school' => $data['school'] ?? null,
            'book_owner' => (bool) ($data['bookOwner'] ?? false),
            'subject' => $data['subject'],
            'message' => $data['message'],
        ]);
        AdminPush::later('book_message', $bookMessage->id);

        return response()->json(['success' => true], 201);
    }

    private function newReference(): string
    {
        do {
            $reference = 'BK-'.now()->format('ymd').'-'.Str::upper(Str::random(4));
        } while (BookOrder::where('reference', $reference)->exists());

        return $reference;
    }
}
