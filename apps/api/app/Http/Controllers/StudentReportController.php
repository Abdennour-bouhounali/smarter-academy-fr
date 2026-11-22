<?php

namespace App\Http\Controllers;

use App\Domain\Admin\ReportScreenshotStore;
use App\Domain\Admin\ReportService;
use App\Models\StudentReport;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * « Signaler un problème » — administrateur et AMBASSADEURS seulement
 * (middleware `reviewer`, depuis 2026-10-05).
 *
 * UN envoi (multipart) : le contexte, la catégorie, une note facultative et
 * une capture d'écran facultative où le relecteur a encadré la zone fautive.
 * Le clic sur le bouton n'envoie plus rien.
 *
 * Le client n'envoie que des CODES de contenu. Le serveur résout lui-même la
 * leçon, le module et la tentative (ReportService::resolveContext) : un
 * identifiant de base posté ici ne serait même pas validé, donc jamais lu.
 */
class StudentReportController extends Controller
{
    public function __construct(private ReportService $reports) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'source' => ['required', Rule::in(StudentReport::SOURCES)],
            // Seules les catégories PROPOSÉES : les anciennes ne se créent plus.
            'category' => ['required', Rule::in(StudentReport::OFFERED_CATEGORIES)],
            // Le message est OBLIGATOIRE (2026-10-08) : la catégorie seule ne dit
            // pas assez au correcteur ; le formulaire envoie « other » sans choix.
            'note' => 'required|string|min:3|max:2000',
            'screenshot' => 'nullable|file|max:'.ReportScreenshotStore::MAX_KILOBYTES,

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
            'source.required' => 'Contexte de signalement manquant.',
            'source.in' => 'Contexte de signalement inconnu.',
            'category.required' => 'Merci de choisir un type de problème.',
            'category.in' => 'Type de problème inconnu.',
            'note.required' => 'Merci de décrire le problème.',
            'note.min' => 'Merci de décrire le problème en quelques mots.',
            'note.max' => 'Le message est trop long (2000 caractères maximum).',
            'screenshot.max' => 'La capture est trop lourde (2 Mo maximum).',
            'screenshot.file' => ReportScreenshotStore::UNSUPPORTED,
        ]);

        // Un signalement de module doit dire de quel module : sans ce numéro,
        // l'administration ne saurait pas où regarder.
        if ($validated['source'] === StudentReport::SOURCE_MODULE && ! isset($validated['moduleNumber'])) {
            return response()->json([
                'success' => false,
                'message' => 'Un signalement de module doit préciser le module.',
            ], 422);
        }

        try {
            $report = $this->reports->submit($request->user(), $validated, $request->file('screenshot'));
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'report' => [
                'id' => $report->id,
                'category' => $report->category,
                'source' => $report->source,
                'hasScreenshot' => $report->screenshot_path !== null,
                'createdAt' => $report->created_at,
            ],
        ], 201);
    }
}
