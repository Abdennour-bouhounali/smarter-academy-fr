<?php

namespace App\Http\Controllers;

use App\Domain\Progress\ProgressEngine;
use App\Models\Lesson;
use DomainException;
use Illuminate\Http\Request;

class LearningEvidenceController extends Controller
{
    public function __construct(private ProgressEngine $engine) {}

    /**
     * Records one assessment-question result as learning evidence. The
     * student is always the token's user (never a body field), and every
     * learningPointCode must resolve to one single lesson matching the URL's
     * lesson code — anything else is a 422. (Lesson codes repeat across
     * grades, so the engine disambiguates via the globally-unique learning
     * point codes rather than trusting the code alone.) Idempotent by
     * attemptId.
     */
    public function store(Request $request, string $lessonCode)
    {
        if (! Lesson::where('code', $lessonCode)->exists()) {
            abort(404);
        }

        $validated = $request->validate([
            'questionCode' => 'required|string|max:255',
            'attemptId' => 'required|string|max:64',
            'isCorrect' => 'required|boolean',
            'learningPointCodes' => 'required|array|min:1',
            'learningPointCodes.*' => 'string|max:255',
            'assessmentType' => 'nullable|string',
            'answer' => 'nullable|array',
        ], [
            'learningPointCodes.required' => 'Au moins un point d\'apprentissage est requis.',
        ]);

        try {
            $result = $this->engine->recordEvidence($request->user(), $lessonCode, [
                'questionCode' => $validated['questionCode'],
                'attemptId' => $validated['attemptId'],
                'isCorrect' => $validated['isCorrect'],
                'learningPointCodes' => $validated['learningPointCodes'],
                'assessmentType' => $validated['assessmentType'] ?? 'assessment',
                'answer' => $validated['answer'] ?? null,
            ]);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'duplicate' => $result['duplicate'],
            'evidenceId' => $result['evidence']->id,
        ], $result['duplicate'] ? 200 : 201);
    }
}
