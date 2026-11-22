<?php

namespace App\Http\Controllers\Family;

use App\Domain\Family\FamilyException;
use App\Domain\Family\ParentLinkService;
use App\Domain\Family\ParentProgressService;
use App\Domain\Family\ParentReportService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * « فضاء الوليّ » — /api/v1/parent/*, derrière can:parent (PARENT_SPACE.md).
 * Chaque lecture d'un enfant passe par ParentLinkService::activeLink() : un
 * lien actif, sinon 404. Aucune réponse ne porte l'adresse de l'élève.
 */
class ParentController extends Controller
{
    public function __construct(
        private ParentLinkService $links,
        private ParentReportService $reports,
        private ParentProgressService $progress,
    ) {}

    public function children(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'children' => $this->links->childrenOf($request->user())->map(fn ($l) => [
                ...$this->child($l),
                ...$this->reports->glance($l->student),
            ])->values(),
        ]);
    }

    public function link(Request $request): JsonResponse
    {
        $validated = $request->validate(['code' => 'required|string|max:32']);

        try {
            $link = $this->links->link($request->user(), $validated['code']);
        } catch (FamilyException $e) {
            return response()->json(['success' => false, 'reason' => $e->reason, 'message' => $e->getMessage()], $e->status);
        }

        return response()->json(['success' => true, 'child' => $this->child($link)], 201);
    }

    public function report(Request $request, int $studentId): JsonResponse
    {
        $request->validate(['week' => 'nullable|integer|min:0|max:52']);
        $link = $this->links->activeLink($request->user(), $studentId);

        return response()->json([
            'success' => true,
            'child' => $this->child($link),
            'report' => $this->reports->week($link->student, (int) $request->query('week', 0)),
        ]);
    }

    /** « التقدّم بالتفصيل » : l'année entière, leçon par leçon (PARENT_SPACE.md §4bis). */
    public function progress(Request $request, int $studentId): JsonResponse
    {
        $link = $this->links->activeLink($request->user(), $studentId);

        return response()->json([
            'success' => true,
            'child' => $this->child($link),
            'progress' => $this->progress->forStudent($link->student),
        ]);
    }

    public function update(Request $request, int $studentId): JsonResponse
    {
        $validated = $request->validate(['weeklyEmail' => 'required|boolean']);
        $link = $this->links->activeLink($request->user(), $studentId);
        $link->update(['weekly_email' => $validated['weeklyEmail']]);

        return response()->json(['success' => true, 'child' => $this->child($link)]);
    }

    public function unlink(Request $request, int $studentId): JsonResponse
    {
        $this->links->revokeByParent($request->user(), $studentId);

        return response()->json(['success' => true]);
    }

    /** L'identité d'un enfant côté parent : nom, année — jamais l'adresse. */
    private function child($link): array
    {
        return [
            ...ParentLinkService::identity($link->student),
            'grade' => $link->student->grade,
            'linkedAt' => $link->linked_at?->toIso8601String(),
            'weeklyEmail' => (bool) $link->weekly_email,
        ];
    }
}
