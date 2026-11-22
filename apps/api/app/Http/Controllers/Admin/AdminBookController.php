<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Books\BookPresenter;
use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** La fiche des livres : titre, prix, contenu de la page, publication. */
class AdminBookController extends Controller
{
    public function __construct(private ActivityLogger $logger) {}

    public function index()
    {
        $books = Book::withCount('orders')->orderBy('sort_order')->orderBy('id')->get();

        return response()->json(['books' => $books->map(fn (Book $b) => BookPresenter::adminBook($b))]);
    }

    public function show(int $id)
    {
        return response()->json(['book' => BookPresenter::adminBook(Book::withCount('orders')->findOrFail($id))]);
    }

    public function store(Request $request)
    {
        $book = Book::create($this->validated($request));
        $this->logger->log($request->user(), ActivityLogger::BOOK_SAVED, 'book', $book->id, null, ['slug' => $book->slug, 'status' => $book->status]);

        return response()->json(['book' => BookPresenter::adminBook($book)], 201);
    }

    public function update(Request $request, int $id)
    {
        $book = Book::findOrFail($id);
        $before = ['price' => $book->price, 'status' => $book->status];
        $book->update($this->validated($request, $book));
        $this->logger->log($request->user(), ActivityLogger::BOOK_SAVED, 'book', $book->id, $before, ['price' => $book->price, 'status' => $book->status]);

        return response()->json(['book' => BookPresenter::adminBook($book->loadCount('orders'))]);
    }

    private function validated(Request $request, ?Book $book = null): array
    {
        $data = $request->validate([
            'slug' => ['required', 'string', 'max:80', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/', Rule::unique('books', 'slug')->ignore($book?->id)],
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'author' => 'nullable|string|max:255',
            'summary' => 'nullable|string|max:5000',
            'content' => 'nullable|array',
            'price' => 'required|integer|min:0|max:1000000',
            'coverImage' => 'nullable|string|max:255',
            'gallery' => 'nullable|array',
            'gallery.*' => 'string|max:255',
            'status' => ['required', Rule::in([Book::STATUS_DRAFT, Book::STATUS_PUBLISHED])],
            'sortOrder' => 'nullable|integer|min:0|max:65535',
        ]);

        // L'API parle camelCase, la base snake_case.
        $data['cover_image'] = $data['coverImage'] ?? null;
        $data['sort_order'] = $data['sortOrder'] ?? 0;
        unset($data['coverImage'], $data['sortOrder']);

        return $data;
    }
}
