<?php

namespace App\Http\Controllers;

use App\Models\PageTour;
use Carbon\CarbonImmutable;
use DateTimeInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * La « جولة تعريفية » (2026-10-07) — quelles visites guidées ce compte a
 * déjà closes, et la clôture d'une visite (terminée ou passée).
 *
 * Élève et enseignant seulement : chacun a SES visites, préfixées par son
 * rôle (`student.home`, `teacher.home`). Une clé d'un autre rôle est refusée —
 * le registre des pages vit dans le front (features/tours/tourRegistry.js),
 * le serveur ne garde que la forme de la clé.
 */
class PageTourController extends Controller
{
    private const KEY_PATTERN = '/^(student|teacher)\.[a-z][a-z0-9-]{0,47}$/';

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isStudent() || $user->isTeacher(), 403);

        return response()->json([
            'success' => true,
            'eligible' => $this->eligible($user->created_at),
            'tours' => $user->pageTours()->get()->mapWithKeys(fn (PageTour $tour) => [
                $tour->tour => [
                    'status' => $tour->status,
                    'step' => $tour->step,
                    'at' => $tour->updated_at?->toIso8601String(),
                ],
            ])->all(),
        ]);
    }

    public function store(Request $request, string $tour): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isStudent() || $user->isTeacher(), 403);
        abort_unless(preg_match(self::KEY_PATTERN, $tour) === 1, 404);
        abort_unless(str_starts_with($tour, $user->role.'.'), 403);

        $validated = $request->validate([
            'status' => ['required', Rule::in(PageTour::STATUSES)],
            'step' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:100'],
        ]);

        // Rejouée (bouton « جولة في الصفحة »), une visite se clôt de nouveau :
        // la dernière issue l'emporte, la ligne reste unique.
        $record = PageTour::updateOrCreate(
            ['user_id' => $user->id, 'tour' => $tour],
            ['status' => $validated['status'], 'step' => $validated['step'] ?? null],
        );

        return response()->json([
            'success' => true,
            'tour' => $tour,
            'status' => $record->status,
        ]);
    }

    private function eligible(?DateTimeInterface $createdAt): bool
    {
        $since = config('tours.eligible_since');
        if (! $since || ! $createdAt) {
            return true;
        }

        return CarbonImmutable::parse($since)->startOfDay()->lessThanOrEqualTo($createdAt);
    }
}
