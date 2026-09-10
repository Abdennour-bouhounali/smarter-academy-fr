<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\ActivityLogger;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/**
 * Le compte de l'administrateur : voir son profil, changer son email, changer
 * son mot de passe.
 *
 * Trois règles tenues ici :
 *   — le mot de passe actuel est exigé pour toute modification sensible ;
 *   — le mot de passe actuel n'est JAMAIS renvoyé ni journalisé ;
 *   — après un changement, les AUTRES sessions sont révoquées, jamais celle
 *     en cours (sinon l'administrateur se déconnecterait lui-même en changeant
 *     son propre mot de passe).
 */
class AdminAccountController extends Controller
{
    public function __construct(private ActivityLogger $log) {}

    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'account' => [
                'id' => $user->id,
                'email' => $user->email,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'role' => $user->role,
                'createdAt' => $user->created_at,
                // Utile pour « déconnecter mes autres appareils ».
                'activeSessions' => $user->tokens()->count(),
            ],
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'firstName' => 'sometimes|nullable|string|max:100',
            'lastName' => 'sometimes|nullable|string|max:100',
        ]);

        $user = $request->user();

        if (array_key_exists('firstName', $validated)) {
            $user->first_name = $validated['firstName'];
        }
        if (array_key_exists('lastName', $validated)) {
            $user->last_name = $validated['lastName'];
        }
        $user->save();

        return response()->json([
            'success' => true,
            'account' => [
                'id' => $user->id,
                'email' => $user->email,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
            ],
        ]);
    }

    public function updateEmail(Request $request)
    {
        $validated = $request->validate([
            'currentPassword' => 'required|string',
            'email' => 'required|email|max:255|unique:users,email',
        ], [
            'email.unique' => 'Cet email est déjà utilisé.',
        ]);

        $user = $request->user();

        if (! Hash::check($validated['currentPassword'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mot de passe actuel incorrect.',
            ], 422);
        }

        $before = $user->email;
        $user->email = $validated['email'];
        $user->save();

        $revoked = $this->revokeOtherSessions($request);

        // L'email est une donnée d'identification, pas un secret : le
        // journaliser est utile et sans risque. Le mot de passe, lui, ne
        // traverse jamais ActivityLogger (qui le caviarderait de toute façon).
        $this->log->log(
            $user,
            ActivityLogger::ADMIN_EMAIL_CHANGED,
            'admin',
            $user->id,
            ['email' => $before],
            ['email' => $user->email],
        );

        return response()->json([
            'success' => true,
            'email' => $user->email,
            'revokedSessions' => $revoked,
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'currentPassword' => 'required|string',
            'password' => ['required', 'confirmed', Password::min(10)->letters()->numbers()->symbols()],
        ], [
            'password.confirmed' => 'La confirmation ne correspond pas.',
            'password.min' => 'Le mot de passe doit faire au moins 10 caractères.',
        ]);

        $user = $request->user();

        if (! Hash::check($validated['currentPassword'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mot de passe actuel incorrect.',
            ], 422);
        }

        if (Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Le nouveau mot de passe doit être différent de l\'ancien.',
            ], 422);
        }

        // Le cast 'hashed' du modèle fait le hachage : aucune valeur en clair
        // n'atteint la base.
        $user->password = $validated['password'];
        $user->save();

        $revoked = $this->revokeOtherSessions($request);

        // AUCUNE valeur — ni l'ancienne, ni la nouvelle. Seulement le fait.
        $this->log->log($user, ActivityLogger::ADMIN_PASSWORD_CHANGED, 'admin', $user->id);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe modifié.',
            'revokedSessions' => $revoked,
        ]);
    }

    /**
     * Révoque toutes les sessions SAUF celle qui fait la demande.
     *
     * Un changement d'identifiant doit chasser un éventuel intrus des autres
     * appareils, sans jeter dehors l'administrateur qui vient de le faire.
     */
    private function revokeOtherSessions(Request $request): int
    {
        $current = $request->user()->currentAccessToken();

        $query = $request->user()->tokens();
        if ($current) {
            $query->where('id', '!=', $current->id);
        }

        return $query->delete();
    }
}
