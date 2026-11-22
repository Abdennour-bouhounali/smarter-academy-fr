<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Books\BookPresenter;
use App\Http\Controllers\Controller;
use App\Models\BookMessage;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** La boîte de réception des messages venus de la page d'un livre. */
class AdminBookMessageController extends Controller
{
    public function index(Request $request)
    {
        $query = BookMessage::query();
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        $page = $query->latest('id')->paginate(min((int) $request->query('perPage', 20), 100));

        return response()->json([
            'messages' => collect($page->items())->map(fn (BookMessage $m) => BookPresenter::message($m)),
            'total' => $page->total(),
            'page' => $page->currentPage(),
            'lastPage' => $page->lastPage(),
            'newCount' => BookMessage::where('status', 'new')->count(),
        ]);
    }

    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(BookMessage::STATUSES)],
            'adminNote' => 'sometimes|nullable|string|max:2000',
        ]);
        $message = BookMessage::findOrFail($id);

        if (isset($data['status'])) {
            $message->status = $data['status'];
        }
        if (array_key_exists('adminNote', $data)) {
            $message->admin_note = $data['adminNote'];
        }
        $message->save();

        return response()->json(['message' => BookPresenter::message($message)]);
    }
}
