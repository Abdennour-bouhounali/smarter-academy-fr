<?php

namespace App\Http\Controllers;

use App\Domain\Identity\LegalConsent;
use App\Models\User;
use App\Notifications\VerifyEmailAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::min(8)->letters()->numbers()],
            // LE CONSENTEMENT — obligatoire, et réduit à un booléen.
            //
            // `accepted` refuse false, "0", "", et l'absence du champ : une
            // case décochée ne crée pas de compte. Le client ne transmet
            // AUCUNE version : les versions acceptées sont écrites par le
            // serveur d'après config/legal.php (voir LegalConsent). Il
            // n'existe volontairement aucun chemin de code lisant une version
            // depuis la requête.
            'accept_legal' => 'required|accepted',
        ], [
            'email.unique' => 'Un compte existe déjà avec cet email.',
            'email.email' => 'Format email invalide.',
            'password.min' => 'Le mot de passe doit faire au moins 8 caractères.',
            'password.letters' => 'Le mot de passe doit contenir au moins une lettre.',
            'password.numbers' => 'Le mot de passe doit contenir au moins un chiffre.',
            'accept_legal.required' => "Vous devez accepter les Conditions Générales d'Utilisation et la Politique de confidentialité.",
            'accept_legal.accepted' => "Vous devez accepter les Conditions Générales d'Utilisation et la Politique de confidentialité.",
        ]);

        // role is never taken from client input: every self-registration is a student
        // (the only account type this phase implements — see User model note on future
        // 'famille'/'enseignant' values). The only way to provision an admin is the
        // CreateAdmin CLI command. first_name/last_name/grade are intentionally not
        // collected here — the account is created from email+password alone, and
        // grade is set afterwards via PATCH /auth/grade during onboarding.
        //
        // Le consentement naît avec le compte, dans le même INSERT : il
        // n'existe pas d'instant où un compte existe sans lui.
        $user = User::create([
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => 'student',
            ...LegalConsent::current()->attributes(),
        ]);

        // L'adresse n'est PAS vérifiée (email_verified_at reste nul) : le
        // courriel qui suit est la seule façon de la prouver.
        $user->notify(new VerifyEmailAddress);

        // Un jeton est tout de même délivré — mais il n'ouvre pas l'espace
        // élève. Le middleware `email.verified` refuse chaque route
        // d'apprentissage tant que l'adresse n'est pas prouvée. Ce jeton ne
        // sert qu'à trois choses : lire son propre compte, redemander le
        // courriel, se déconnecter. Sans lui, l'écran « vérifiez votre
        // adresse » ne saurait même pas de qui il parle.
        $token = $user->createToken('student-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => UserPresenter::format($user),
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Un compte créé par Google n'a pas de mot de passe (NULL, et non un
        // secret aléatoire). Auth::attempt() échouerait de toute façon, mais
        // le message serait « identifiants incorrects » — vrai, et inutile :
        // l'élève a un compte, il se trompe seulement de porte.
        $candidate = User::where('email', $request->input('email'))->first();

        if ($candidate !== null && ! $candidate->hasPassword()) {
            return response()->json([
                'success' => false,
                'message' => 'Ce compte se connecte avec Google. Utilisez « Continuer avec Google ».',
            ], 401);
        }

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();

            // Un compte suspendu ou désactivé n'obtient pas de jeton du tout :
            // le middleware account.active refuserait chaque appel ensuite, mais
            // délivrer un jeton utilisable nulle part n'aurait aucun sens.
            if (! $user->hasActiveAccount()) {
                return response()->json([
                    'success' => false,
                    'message' => $user->account_status === User::STATUS_SUSPENDED
                        ? 'Votre compte est temporairement suspendu.'
                        : 'Votre compte a été désactivé.',
                ], 403);
            }

            // Trace d'activité, utilisée par les indicateurs d'activité
            // (actifs du jour, DAU/WAU/MAU) côté administration.
            $user->forceFill(['last_activity_at' => now()])->save();

            // Une adresse non vérifiée ne REFUSE pas la connexion : elle la
            // limite. L'élève reçoit un jeton et atterrit sur l'écran de
            // vérification (le frontend lit `emailVerified`), d'où il peut
            // redemander le courriel. Refuser ici l'enfermerait dehors sans
            // aucun moyen de s'en sortir.
            $token = $user->createToken($user->role.'-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => UserPresenter::format($user),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Email ou mot de passe incorrect.',
        ], 401);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => UserPresenter::format($request->user()),
        ]);
    }

    public function logout(Request $request)
    {
        // Révoque le jeton de CETTE session, ici, sur nos serveurs.
        //
        // Un compte connecté par Google n'est PAS déconnecté de Google pour
        // autant : ce sont deux sessions distinctes, chez deux acteurs
        // distincts. Nous n'avons ni le pouvoir ni le droit de fermer la
        // session Google de quelqu'un, et laisser croire le contraire serait
        // trompeur. L'interface le dit à l'élève.
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnecté.',
        ]);
    }

    /**
     * Updates the current user's grade — the one way a student's default
     * learning context changes after registration. Never touches progress
     * data (which lives client-side, keyed by lesson id, not grade).
     */
    public function updateGrade(Request $request)
    {
        $validated = $request->validate([
            'grade' => 'required|string|max:50',
        ], [
            'grade.required' => 'Merci de sélectionner une classe.',
        ]);

        $user = $request->user();
        $user->update(['grade' => $validated['grade']]);

        return response()->json([
            'success' => true,
            'user' => UserPresenter::format($user),
        ]);
    }
}
