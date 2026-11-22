<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\UserDeletionService;
use App\Http\Controllers\Controller;
use DomainException;
use Illuminate\Http\Request;

/**
 * Suppression DÉFINITIVE d'un compte élève ou enseignant. Les règles vivent
 * dans UserDeletionService ; ce contrôleur ne fait que valider et traduire
 * un refus en 422.
 */
class AdminUserDeletionController extends Controller
{
    public function __construct(private UserDeletionService $deletion) {}

    /** Ce qui sera perdu — affiché dans l'avertissement avant le geste. */
    public function preview(Request $request, int $id)
    {
        try {
            $summary = $this->deletion->preview($request->user(), $id);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'summary' => $summary]);
    }

    public function destroy(Request $request, int $id)
    {
        $validated = $request->validate([
            'confirmEmail' => ['required', 'string', 'max:255'],
        ], [
            'confirmEmail.required' => 'Retapez l\'adresse e-mail du compte pour confirmer.',
        ]);

        try {
            $result = $this->deletion->delete($request->user(), $id, $validated['confirmEmail']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true] + $result);
    }
}
