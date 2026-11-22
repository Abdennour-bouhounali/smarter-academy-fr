<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\StudentLessonAnswers;
use Illuminate\Http\Request;

/**
 * LES RÉPONSES DE L'ÉLÈVE PENDANT UNE LEÇON — à lui SEUL (pilote 2026-11-07, conseil + propriétaire).
 *
 *   GET /lessons/{code}/answers   ses réponses (pour les remettre à l'écran quand il revient)
 *   PUT /lessons/{code}/answers   { answers: { clé: { v, at } } } → fusion clé par clé, la plus RÉCENTE gagne (`at`)
 *
 * Ce contrôleur est la SEULE porte de la table : aucun enseignant, établissement, parent ni administrateur ne la lit, et elle
 * ne nourrit aucune maîtrise (seul le test final est une preuve). Route réservée à l'élève (`learner`).
 */
class StudentLessonAnswersController extends Controller
{
    private const MAX_KEYS = 300;
    private const MAX_VALUE_CHARS = 6000;

    public function show(Request $request, string $lessonCode)
    {
        $lesson = Lesson::where('code', $lessonCode)->firstOrFail();
        $row = StudentLessonAnswers::where('user_id', $request->user()->id)->where('lesson_id', $lesson->id)->first();

        return response()->json(['success' => true, 'answers' => (object) ($row?->answers ?? [])]);
    }

    public function upsert(Request $request, string $lessonCode)
    {
        $lesson = Lesson::where('code', $lessonCode)->firstOrFail();
        $validated = $request->validate([
            'answers' => 'present|array|max:'.self::MAX_KEYS,
            'answers.*' => 'array',
            'answers.*.at' => 'required|integer|min:0',
        ]);

        $incoming = [];
        foreach ($validated['answers'] as $key => $entry) {
            if (! is_string($key) || strlen($key) > 160) {
                continue;
            }
            $value = $request->input("answers.$key.v");
            if (strlen((string) json_encode($value)) > self::MAX_VALUE_CHARS) {
                continue;
            }
            $incoming[$key] = ['v' => $value, 'at' => (int) $entry['at']];
        }

        $row = StudentLessonAnswers::firstOrNew(['user_id' => $request->user()->id, 'lesson_id' => $lesson->id]);
        $merged = $row->answers ?? [];
        foreach ($incoming as $key => $entry) {
            if (! isset($merged[$key]) || (int) ($merged[$key]['at'] ?? 0) <= $entry['at']) {
                $merged[$key] = $entry;
            }
        }
        if (count($merged) > self::MAX_KEYS) {
            uasort($merged, fn ($a, $b) => ($b['at'] ?? 0) <=> ($a['at'] ?? 0));
            $merged = array_slice($merged, 0, self::MAX_KEYS, true);
        }
        $row->answers = $merged;
        $row->save();

        return response()->json(['success' => true, 'answers' => (object) $merged]);
    }
}
