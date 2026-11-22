<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * La CLOCHE (2026-10-06) — les notifications de l'utilisateur, dans
 * l'application seulement (canal `database` de Laravel ; aucun courriel).
 * Premier usage : « صحّح أستاذك إجابتك » (AnswerReviewedNotification).
 */
class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'unread' => $user->unreadNotifications()->count(),
            'notifications' => $user->notifications()->latest()->limit(20)->get()->map(fn ($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'data' => $n->data,
                'read' => $n->read_at !== null,
                'createdAt' => $n->created_at?->toIso8601String(),
            ])->values()->all(),
        ]);
    }

    public function read(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();
        if ($notification === null) {
            abort(404);
        }
        $notification->markAsRead();

        return response()->json(['success' => true, 'unread' => $request->user()->unreadNotifications()->count()]);
    }

    public function readAll(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['success' => true, 'unread' => 0]);
    }
}
