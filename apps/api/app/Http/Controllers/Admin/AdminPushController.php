<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Push\AdminPush;
use App\Domain\Push\PushSender;
use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Notifications du tableau de bord sur l'appareil du compte connecté (porte `books` :
 * administrateur ou « مسيّر المكتبة », BOOKS_STORE.md §6quater). Chaque compte ne voit et
 * ne gère QUE ses propres appareils, et ne choisit que parmi les sujets de son rôle.
 */
class AdminPushController extends Controller
{
    public function __construct(private PushSender $sender) {}

    /**
     * La clé publique VAPID, les sujets possibles pour CE rôle, le nombre d'appareils du compte
     * et — si `?endpoint=` désigne un de ses appareils — les sujets choisis sur celui-ci.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $device = $request->filled('endpoint')
            ? PushSubscription::where('user_id', $user->id)->where('endpoint_hash', PushSubscription::hashOf((string) $request->query('endpoint')))->first()
            : null;
        $topics = AdminPush::topicsFor($user->role);

        return response()->json([
            'enabled' => $this->sender->enabled(),
            'publicKey' => $this->sender->publicKey(),
            'devices' => PushSubscription::where('user_id', $user->id)->count(),
            'topics' => $topics,
            'device' => $device ? ['topics' => $device->topics ?? $topics] : null,
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        abort_unless($this->sender->enabled(), 409, 'Notifications are not configured on the server.');
        $allowed = AdminPush::topicsFor($request->user()->role);

        $data = $request->validate([
            'endpoint' => 'required|url|starts_with:https://|max:2000',
            'keys.p256dh' => 'required|string|max:255',
            'keys.auth' => 'required|string|max:255',
            'topics' => 'sometimes|nullable|array',
            'topics.*' => ['string', Rule::in($allowed)],
        ]);

        // Un appareil = un abonnement. Repris par un autre compte (même navigateur), il change de main.
        PushSubscription::updateOrCreate(
            ['endpoint_hash' => PushSubscription::hashOf($data['endpoint'])],
            [
                'user_id' => $request->user()->id,
                'endpoint' => $data['endpoint'],
                'public_key' => $data['keys']['p256dh'],
                'auth_token' => $data['keys']['auth'],
                'user_agent' => Str::limit((string) $request->userAgent(), 250, ''),
                'topics' => array_key_exists('topics', $data) ? $data['topics'] : null,
            ],
        );

        return response()->json(['success' => true], 201);
    }

    /** Les sujets reçus sur UN appareil du compte. */
    public function updateTopics(Request $request): JsonResponse
    {
        $allowed = AdminPush::topicsFor($request->user()->role);
        $data = $request->validate([
            'endpoint' => 'required|string|max:2000',
            'topics' => 'present|array',
            'topics.*' => ['string', Rule::in($allowed)],
        ]);

        $device = PushSubscription::where('user_id', $request->user()->id)
            ->where('endpoint_hash', PushSubscription::hashOf($data['endpoint']))
            ->firstOrFail();
        $device->update(['topics' => array_values(array_unique($data['topics']))]);

        return response()->json(['topics' => $device->topics]);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $data = $request->validate(['endpoint' => 'required|string|max:2000']);
        PushSubscription::where('user_id', $request->user()->id)
            ->where('endpoint_hash', PushSubscription::hashOf($data['endpoint']))
            ->delete();

        return response()->json(['success' => true]);
    }

    public function test(Request $request, AdminPush $push): JsonResponse
    {
        abort_unless($this->sender->enabled(), 409, 'Notifications are not configured on the server.');

        return response()->json(['sent' => $push->test($request->user())]);
    }
}
