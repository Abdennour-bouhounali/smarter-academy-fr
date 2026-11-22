<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

/**
 * Le mot de passe oublié : demander le lien, puis choisir un nouveau mot de
 * passe avec lui.
 *
 * Deux routes publiques (personne n'est connecté), donc deux protections :
 *
 *  - `forgot` répond TOUJOURS la même chose, que l'adresse existe ou non. Une
 *    réponse différente ferait de ce point d'entrée un moyen de savoir qui a
 *    un compte. La limite de débit (routes/api.php) couvre l'envoi en masse.
 *  - `reset` s'appuie sur le broker de Laravel : jeton à usage unique, haché
 *    en base, expirant. Les erreurs qu'il rend sont des CODES (`reason`), pas
 *    des phrases : le frontend les met en arabe.
 *
 * Un compte créé par Google n'a pas de mot de passe : on n'envoie rien (il se
 * connecte avec Google), sans que la réponse le trahisse.
 */
class PasswordResetController extends Controller
{
    public function forgot(Request $request): JsonResponse
    {
        $validated = $request->validate(['email' => 'required|email']);

        $user = User::where('email', $validated['email'])->first();

        if ($user !== null && $user->hasPassword() && $user->hasActiveAccount()) {
            // Le broker applique sa propre limite (config auth.passwords.*.throttle)
            // et ne crée de jeton que s'il peut ; on envoie nous-mêmes le
            // courriel pour garder le gabarit de marque et la tolérance aux
            // pannes SMTP.
            $token = Password::broker()->createToken($user);
            ResetPasswordNotification::sendTo($user, $token);
        }

        return response()->json([
            'success' => true,
            'message' => 'Si un compte existe pour cette adresse, un e-mail vient de lui être envoyé.',
        ]);
    }

    public function reset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', PasswordRule::min(8)->letters()->numbers()],
        ]);

        $status = Password::broker()->reset(
            $validated,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => $password, // haché par le cast du modèle
                    'remember_token' => Str::random(60),
                ])->save();

                // Quiconque tenait une session ouverte avec l'ancien mot de
                // passe (un appareil perdu, un intrus) est déconnecté.
                $user->tokens()->delete();

                // Il a prouvé posséder la boîte mail.
                $user->markEmailAsVerified();

                event(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'success' => false,
                'reason' => 'invalid_token',
                'message' => 'Lien invalide ou expiré.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe modifié.',
        ]);
    }
}
