<?php

namespace App\Http\Controllers;

use App\Domain\Settings\StudentSettingsService;
use DomainException;
use Illuminate\Http\Request;

/**
 * « الإعدادات » de l'élève (2026-10-06) : il lit ses réglages ; il les change
 * seulement s'il n'appartient à aucune classe — sinon c'est son enseignant
 * (`managedByTeacher`, refus 422 `managed_by_teacher`).
 */
class StudentSettingsController extends Controller
{
    public function __construct(private StudentSettingsService $settings) {}

    public function show(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isStudent(), 403);

        return response()->json([
            'success' => true,
            'settings' => $this->settings->read($user),
            'managedByTeacher' => $this->settings->managedByTeacher($user),
            // Le mode APPLIQUÉ (hors classe : toujours « self ») — c'est lui que
            // le lecteur d'exercices suit.
            'effectiveValidation' => $this->settings->practiceValidation($user),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        abort_unless($user->isStudent(), 403);
        $validated = $request->validate(['practiceLevelsOpen' => 'sometimes|boolean']);

        try {
            $settings = $this->settings->updateBySelf($user, $validated);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'reason' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'settings' => $settings, 'managedByTeacher' => false]);
    }
}
