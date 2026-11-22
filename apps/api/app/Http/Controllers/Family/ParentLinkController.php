<?php

namespace App\Http\Controllers\Family;

use App\Domain\Family\FamilyException;
use App\Domain\Family\ParentAccessLinkService;
use App\Domain\Family\ParentProgressService;
use App\Domain\Family\ParentReportService;
use App\Http\Controllers\Controller;
use App\Models\ParentAccessLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * « رابط الوليّ » — /api/v1/parent-link/{token}/*, PUBLIC (aucun compte),
 * borné en débit (PARENT_SPACE.md §2).
 *
 * Le porteur du lien lit le rapport de la semaine et « التقدّم بالتفصيل » de
 * l'enfant — la même forme que l'élève lit dans « ما يراه وليّك ». Si le parent
 * a posé un code, chaque lecture exige le laissez-passer `X-Parent-Pass`.
 * Réponses `no-store` et `noindex` ; jamais d'adresse électronique.
 */
class ParentLinkController extends Controller
{
    public function __construct(
        private ParentAccessLinkService $links,
        private ParentReportService $reports,
        private ParentProgressService $progress,
    ) {}

    public function show(Request $request, string $token): JsonResponse
    {
        return $this->guard(function () use ($request, $token) {
            $link = $this->links->resolve($token);
            $allowed = $this->links->allows($link, $request->header('X-Parent-Pass'));
            if ($allowed) {
                $this->links->recordOpen($link);
            }

            return [
                'child' => $this->child($link),
                'pinSet' => $link->pin_hash !== null,
                'unlocked' => $allowed,
            ];
        });
    }

    public function report(Request $request, string $token): JsonResponse
    {
        $request->validate(['week' => 'nullable|integer|min:0|max:52']);

        return $this->guard(fn () => ['report' => $this->reports->week($this->readable($request, $token)->student, (int) $request->query('week', 0))]);
    }

    public function progress(Request $request, string $token): JsonResponse
    {
        return $this->guard(fn () => ['progress' => $this->progress->forStudent($this->readable($request, $token)->student)]);
    }

    public function setPin(Request $request, string $token): JsonResponse
    {
        $validated = $request->validate(['pin' => ['required', 'string', 'regex:/^\d{4}$/']]);

        return $this->guard(fn () => ['pass' => $this->links->setPin($this->links->resolve($token), $validated['pin'])]);
    }

    public function unlock(Request $request, string $token): JsonResponse
    {
        $validated = $request->validate(['pin' => ['required', 'string', 'regex:/^\d{4}$/']]);

        return $this->guard(fn () => ['pass' => $this->links->unlock($this->links->resolve($token), $validated['pin'])]);
    }

    private function readable(Request $request, string $token): ParentAccessLink
    {
        $link = $this->links->resolve($token);
        if (! $this->links->allows($link, $request->header('X-Parent-Pass'))) {
            throw new FamilyException(FamilyException::PIN_REQUIRED, 'Code requis.', 401);
        }

        return $link;
    }

    /** L'enfant vu du porteur du lien : prénom, nom, année — jamais l'adresse. */
    private function child(ParentAccessLink $link): array
    {
        return [
            'firstName' => $link->student->first_name,
            'lastName' => $link->student->last_name,
            'grade' => $link->student->grade,
        ];
    }

    private function guard(callable $fn): JsonResponse
    {
        try {
            $response = response()->json(['success' => true, ...$fn()]);
        } catch (FamilyException $e) {
            $response = response()->json(['success' => false, 'reason' => $e->reason, 'message' => $e->getMessage()], $e->status);
        }

        return $response->header('Cache-Control', 'no-store')->header('X-Robots-Tag', 'noindex, nofollow');
    }
}
