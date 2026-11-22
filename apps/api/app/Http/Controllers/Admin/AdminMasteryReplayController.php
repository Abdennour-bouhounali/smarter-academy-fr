<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Progress\Engine\EngineRegistry;
use App\Http\Controllers\Controller;
use App\Jobs\ReplayMasteryJob;
use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\MasteryReplay;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * Rejeux de maîtrise demandés par l'administration (Mastery V2, §23).
 *
 * POST crée un ticket et met le rejeu en file ; GET en lit l'état et le
 * diff. Un rejeu ne modifie JAMAIS la preuve ; il reconstruit l'état depuis
 * elle, dans la version demandée. Un dry-run n'écrit rien.
 */
class AdminMasteryReplayController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'currentEngineVersion' => (int) config('mastery.engine_version'),
            'knownVersions' => app(EngineRegistry::class)->knownVersions(),
            'replays' => MasteryReplay::latest('id')->limit(30)->get()->map(fn ($r) => $this->serialize($r))->all(),
        ]);
    }

    public function store(Request $request, EngineRegistry $engines)
    {
        $validated = $request->validate([
            'engineVersion' => 'required|integer|in:'.implode(',', $engines->knownVersions()),
            'scope' => 'required|in:all,user,learning_point,lesson',
            'scopeId' => 'nullable|string|max:191|required_unless:scope,all',
            'dryRun' => 'boolean',
        ]);

        // Le périmètre doit exister : un rejeu sur un code mal tapé ne doit
        // pas « réussir » en ne touchant rien.
        $exists = match ($validated['scope']) {
            'user' => User::whereKey((int) $validated['scopeId'])->exists(),
            'learning_point' => LearningPoint::where('code', $validated['scopeId'])->exists(),
            'lesson' => Lesson::where('code', $validated['scopeId'])->exists(),
            default => true,
        };
        if (! $exists) {
            return response()->json(['success' => false, 'message' => 'Périmètre introuvable.'], 422);
        }

        $ticket = MasteryReplay::create([
            'engine_version' => $validated['engineVersion'],
            'scope' => $validated['scope'],
            'scope_id' => $validated['scopeId'] ?? null,
            'dry_run' => (bool) ($validated['dryRun'] ?? true),
            'status' => MasteryReplay::STATUS_PENDING,
            'requested_by' => $request->user()->id,
        ]);

        ReplayMasteryJob::dispatch($ticket->id);

        return response()->json(['success' => true, 'replay' => $this->serialize($ticket->fresh())], 202);
    }

    public function show(int $id)
    {
        $replay = MasteryReplay::findOrFail($id);

        return response()->json(['success' => true, 'replay' => $this->serialize($replay)]);
    }

    private function serialize(MasteryReplay $r): array
    {
        return [
            'id' => $r->id,
            'engineVersion' => $r->engine_version,
            'scope' => $r->scope,
            'scopeId' => $r->scope_id,
            'dryRun' => $r->dry_run,
            'status' => $r->status,
            'pairsTotal' => $r->pairs_total,
            'pairsDone' => $r->pairs_done,
            'pairsChanged' => $r->pairs_changed,
            'diffSummary' => $r->diff_summary,
            'error' => $r->error,
            'requestedBy' => $r->requested_by,
            'startedAt' => optional($r->started_at)->toIso8601String(),
            'finishedAt' => optional($r->finished_at)->toIso8601String(),
            'createdAt' => optional($r->created_at)->toIso8601String(),
        ];
    }
}
