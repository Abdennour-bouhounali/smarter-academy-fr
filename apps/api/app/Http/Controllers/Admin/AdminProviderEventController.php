<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\ProviderEventAdminService;
use App\Http\Controllers\Controller;
use App\Models\ProviderEvent;
use DomainException;
use Illuminate\Http\Request;

/**
 * Les évènements de fournisseur — LECTURE, plus le rejeu.
 *
 * Aucun point d'entrée ne crée, ne modifie ni ne supprime un évènement : un
 * évènement est ce que le fournisseur a envoyé, et l'administration n'a pas à
 * réécrire l'histoire. Le seul geste est de redemander l'application d'un
 * évènement déjà reçu (voir ProviderEventAdminService::replay).
 *
 * Derrière auth:sanctum + account.active + can:admin, comme tout /admin.
 */
class AdminProviderEventController extends Controller
{
    public function __construct(private ProviderEventAdminService $events) {}

    public function index(Request $request)
    {
        $rows = $this->events->events($request->query());

        return response()->json([
            'success' => true,
            'events' => $rows->through(fn (ProviderEvent $e) => $this->events->present($e)),
            'summary' => $this->events->summary(),
            // De quoi peupler les filtres sans les coder en dur côté client.
            'statuses' => ProviderEvent::STATUSES,
        ]);
    }

    public function show(int $id)
    {
        $event = ProviderEvent::with('subscription')->find($id);

        if ($event === null) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'event' => $this->events->present($event),
        ]);
    }

    public function replay(Request $request, int $id)
    {
        $event = ProviderEvent::with('subscription.user')->find($id);

        if ($event === null) {
            abort(404);
        }

        try {
            $result = $this->events->replay($event, $request->user());
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'action' => $result['action'],
            'subscriptionId' => $result['subscriptionId'],
            'event' => $this->events->present($event->refresh()),
        ]);
    }
}
