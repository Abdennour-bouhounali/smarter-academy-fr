<?php

namespace App\Http\Controllers\Teacher;

use App\Domain\ThinkingLab\ChallengeRepository;
use App\Domain\ThinkingLab\TeacherPreview;
use App\Domain\ThinkingLab\ThinkingLabException;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * « مختبر التفكير » côté enseignant : une PRÉVISUALISATION en lecture seule
 * (THINKING_LAB.md §8bis). Aucune écriture : ni progression, ni tentative, ni quota.
 * La porte est `can:teacher` sur le groupe de routes.
 */
class TeacherThinkingLabController extends Controller
{
    public function __construct(private TeacherPreview $preview, private ChallengeRepository $challenges) {}

    public function index(): JsonResponse
    {
        return response()->json(['challenges' => $this->preview->list()]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $challenge = $this->challenges->find($id);
        if ($challenge === null) {
            return response()->json(['message' => 'not_found', 'reason' => 'not_found'], 404);
        }

        return response()->json(['challenge' => $this->preview->show($challenge, (int) $request->query('tuple', 0))]);
    }

    public function check(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'answer' => 'required|string|max:'.(int) config('thinking_lab.honest.max_answer_chars', 300),
            'kind' => 'nullable|in:answer,part,ceiling',
            'index' => 'nullable|integer|min:0|max:9',
            'tuple' => 'nullable|integer|min:0|max:500',
        ]);
        $challenge = $this->challenges->find($id);
        if ($challenge === null) {
            return response()->json(['message' => 'not_found', 'reason' => 'not_found'], 404);
        }
        try {
            return response()->json($this->preview->check($challenge, (int) ($data['tuple'] ?? 0), $data['kind'] ?? 'answer', (int) ($data['index'] ?? 0), $data['answer']));
        } catch (ThinkingLabException $e) {
            return response()->json(['message' => $e->reason, 'reason' => $e->reason], $e->status());
        }
    }
}
