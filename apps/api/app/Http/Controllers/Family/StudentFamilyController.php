<?php

namespace App\Http\Controllers\Family;

use App\Domain\Family\FamilyException;
use App\Domain\Family\ParentAccessLinkService;
use App\Domain\Family\ParentLinkService;
use App\Domain\Family\ParentProgressService;
use App\Domain\Family\ParentReportService;
use App\Domain\Family\StudyTimeService;
use App\Http\Controllers\Controller;
use App\Models\StudyTimeDay;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Le côté ÉLÈVE de l'espace parent (PARENT_SPACE.md) : le battement du temps
 * d'étude, le code de liaison (après consentement), la liste de ses أولياء
 * et le rapport « ما يراه وليّك » — exactement celui que lit le parent.
 */
class StudentFamilyController extends Controller
{
    public function __construct(
        private ParentLinkService $links,
        private ParentReportService $reports,
        private StudyTimeService $time,
        private ParentProgressService $progress,
        private ParentAccessLinkService $accessLinks,
    ) {}

    public function heartbeat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'segments' => 'required|array|min:1|max:12',
            'segments.*.surface' => ['required', 'string', Rule::in(StudyTimeDay::SURFACES)],
            'segments.*.active' => 'required|integer|min:0|max:3600',
            'segments.*.idle' => 'required|integer|min:0|max:3600',
            'segments.*.away' => 'required|integer|min:0|max:3600',
            'segments.*.leaves' => 'required|integer|min:0|max:100',
        ]);

        return response()->json(['success' => true, ...$this->time->record($request->user(), $validated['segments'])]);
    }

    public function index(Request $request): JsonResponse
    {
        $student = $request->user();
        $code = $this->links->currentCode($student);

        return response()->json([
            'success' => true,
            'parents' => $this->links->parentsOf($student)->map(fn ($l) => [
                'linkId' => $l->id,
                'parent' => $l->parent ? ParentLinkService::identity($l->parent) : null,
                'linkedAt' => $l->linked_at?->toIso8601String(),
            ])->values(),
            'code' => $code ? ['code' => $code->code, 'expiresAt' => $code->expires_at->toIso8601String()] : null,
            'consentVersion' => (string) config('family.consent_version'),
        ]);
    }

    public function issueCode(Request $request): JsonResponse
    {
        $request->validate(['consent' => 'nullable|boolean']);

        return $this->guard(function () use ($request) {
            $code = $this->links->issueCode($request->user(), $request->boolean('consent'));

            return response()->json([
                'success' => true,
                'code' => ['code' => $code->code, 'expiresAt' => $code->expires_at->toIso8601String()],
            ], 201);
        });
    }

    public function cancelCode(Request $request): JsonResponse
    {
        $this->links->cancelCode($request->user());

        return response()->json(['success' => true]);
    }

    public function revoke(Request $request, int $linkId): JsonResponse
    {
        $this->links->revokeByStudent($request->user(), $linkId);

        return response()->json(['success' => true]);
    }

    public function report(Request $request): JsonResponse
    {
        $request->validate(['week' => 'nullable|integer|min:0|max:52']);

        return response()->json([
            'success' => true,
            'report' => $this->reports->week($request->user(), (int) $request->query('week', 0)),
        ]);
    }

    /** Le même « التقدّم بالتفصيل » que lit le وليّ. */
    public function progress(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'progress' => $this->progress->forStudent($request->user())]);
    }

    // ── « رابط الوليّ » — le lien sans compte (PARENT_SPACE.md §2) ───────────

    public function accessLink(Request $request): JsonResponse
    {
        $link = $this->accessLinks->current($request->user());

        return response()->json([
            'success' => true,
            'link' => $link ? ParentAccessLinkService::describe($link) : null,
        ])->header('Cache-Control', 'no-store');
    }

    /** Le geste de consentement : un NOUVEAU lien (l'ancien cesse de fonctionner). */
    public function createAccessLink(Request $request): JsonResponse
    {
        $request->validate(['consent' => 'nullable|boolean']);

        return $this->guard(fn () => response()->json([
            'success' => true,
            'link' => ParentAccessLinkService::describe(
                $this->accessLinks->create($request->user(), $request->boolean('consent'), 'student', $request->user())
            ),
        ], 201)->header('Cache-Control', 'no-store'));
    }

    public function revokeAccessLink(Request $request): JsonResponse
    {
        $this->accessLinks->revoke($request->user(), 'student');

        return response()->json(['success' => true]);
    }

    private function guard(callable $fn): JsonResponse
    {
        try {
            return $fn();
        } catch (FamilyException $e) {
            return response()->json(['success' => false, 'reason' => $e->reason, 'message' => $e->getMessage()], $e->status);
        }
    }
}
