<?php

namespace App\Http\Controllers;

use App\Domain\Admin\ReportService;
use App\Models\StudentReport;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * « Signaler un problème », côté élève.
 *
 * Le seul point d'entrée que l'élève touche. Il n'envoie JAMAIS
 * d'identifiants de base : uniquement des codes de contenu (lessonCode,
 * moduleNumber, exerciseCode, questionId) que le serveur résout lui-même.
 * Un `lesson_id` posté ici serait purement et simplement ignoré — il ne fait
 * pas partie des champs validés.
 */
class StudentReportController extends Controller
{
    public function __construct(private ReportService $reports) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => ['required', Rule::in(StudentReport::CATEGORIES)],
            // Facultative, et c'est essentiel : exiger une explication écrite
            // ferait taire la moitié des élèves.
            'note' => 'nullable|string|max:2000',

            'lessonCode' => 'nullable|string|max:120',
            'grade' => 'nullable|string|max:50',
            'moduleNumber' => 'nullable|integer|min:0|max:99',
            'step' => 'nullable|string|max:120',
            'exerciseCode' => 'nullable|string|max:120',
            'questionId' => 'nullable|string|max:120',
            'sessionId' => 'nullable|string|max:36',
            'attemptUuid' => 'nullable|string|max:36',

            'route' => 'nullable|string|max:255',
            'browser' => 'nullable|string|max:120',
            'os' => 'nullable|string|max:120',
            'screen' => 'nullable|string|max:40',
            'appVersion' => 'nullable|string|max:40',
            'errorRef' => 'nullable|string|max:120',
        ], [
            'category.required' => 'Merci de choisir un type de problème.',
            'category.in' => 'Type de problème inconnu.',
            'note.max' => 'Le message est trop long.',
        ]);

        $report = $this->reports->create($request->user(), $validated);

        return response()->json([
            'success' => true,
            'message' => 'Merci, le problème a bien été signalé.',
            'report' => [
                'id' => $report->id,
                'category' => $report->category,
                'createdAt' => $report->created_at,
            ],
        ], 201);
    }
}
