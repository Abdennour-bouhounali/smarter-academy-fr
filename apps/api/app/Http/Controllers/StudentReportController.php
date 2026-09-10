<?php

namespace App\Http\Controllers;

use App\Domain\Admin\ReportService;
use App\Models\StudentReport;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * « Signaler un problème », côté élève. Deux temps, deux points d'entrée.
 *
 *   store()  — le CLIC. Un signal naît immédiatement, sans catégorie : « un
 *              élève a buté ici » est déjà une information, et un formulaire
 *              abandonné la ferait perdre.
 *   update() — l'ENVOI. La catégorie et les détails complètent le signal.
 *
 * Dans les deux cas, l'élève n'envoie que des CODES de contenu. Le serveur
 * résout lui-même la leçon, le module et la tentative
 * (App\Domain\Admin\ReportService::resolveContext) : un identifiant de base
 * posté ici ne serait même pas validé, donc jamais lu.
 */
class StudentReportController extends Controller
{
    public function __construct(private ReportService $reports) {}

    /** Le signal immédiat. Renvoie l'identifiant à compléter. */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'source' => ['required', Rule::in(StudentReport::SOURCES)],

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
        ]);

        // Un signalement de module doit dire de quel module : sans ce numéro,
        // l'administration ne saurait pas où regarder.
        if ($validated['source'] === StudentReport::SOURCE_MODULE && ! isset($validated['moduleNumber'])) {
            return response()->json([
                'success' => false,
                'message' => 'Un signalement de module doit préciser le module.',
            ], 422);
        }

        $report = $this->reports->initiate($request->user(), $validated);

        return response()->json([
            'success' => true,
            'report' => $this->serialize($report),
        ], 201);
    }

    /**
     * La complétion. Seul le propriétaire, et seulement tant que le
     * signalement n'a pas déjà été envoyé.
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'category' => ['required', Rule::in(StudentReport::CATEGORIES)],
            // Facultative pour toutes les catégories, y compris « Autre » :
            // exiger une explication écrite ferait taire la moitié des élèves,
            // et un signalement sans mot reste un signalement.
            'note' => 'nullable|string|max:2000',
        ], [
            'category.required' => 'Merci de choisir un type de problème.',
            'category.in' => 'Type de problème inconnu.',
            'note.max' => 'Le message est trop long (2000 caractères maximum).',
        ]);

        try {
            $report = $this->reports->complete($request->user(), $id, $validated);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Merci ! Ton signalement a bien été envoyé.',
            'report' => $this->serialize($report),
        ]);
    }

    /**
     * Ce que l'élève reçoit en retour : le strict minimum pour poursuivre le
     * dialogue. Aucun identifiant de leçon ou de module en base, aucune donnée
     * d'administration (statut interne, priorité, notes).
     */
    private function serialize(StudentReport $report): array
    {
        return [
            'id' => $report->id,
            'category' => $report->category,
            'source' => $report->source,
            'submitted' => $report->hasDetails(),
            'createdAt' => $report->created_at,
        ];
    }
}
