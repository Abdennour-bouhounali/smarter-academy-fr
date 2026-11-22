<?php

namespace App\Http\Controllers;

use App\Domain\Classroom\PendingClassJoin;
use App\Domain\Identity\LegalConsent;
use App\Domain\Identity\PersonName;
use App\Domain\Push\AdminPush;
use App\Domain\Registration\RegistrationGate;
use App\Models\User;
use App\Notifications\VerifyEmailAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // LES INSCRIPTIONS FERMÉES (config/registration.php) : aucun compte ne naît ici, sauf l'élève invité par le
        // lien valide d'une classe. Décidé AVANT toute validation : la page n'a rien à corriger, elle a un message à lire.
        $gate = app(RegistrationGate::class);
        if (! $gate->allows($request->input('accountType'), $request->input('classJoinLink'), $request->boolean('classJoinConsent'))) {
            return response()->json([
                'success' => false,
                'code' => RegistrationGate::CLOSED_CODE,
                'message' => RegistrationGate::CLOSED_MESSAGE,
            ], 403);
        }

        PersonName::normalizeRequest($request);

        $validated = $request->validate([
            // « الاسم و اللقب » — obligatoires dès la naissance du compte :
            // c'est ainsi que l'enseignant reconnaîtra l'élève (jamais par
            // son courriel). Même règle que le profil et Google (PersonName).
            ...PersonName::rules(),
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
            // Le TYPE de compte, dans une liste blanche : élève (défaut) ou
            // enseignant. Jamais admin — cette valeur n'est pas dans la liste,
            // donc un client qui l'enverrait est refusé en 422, pas ignoré.
            'accountType' => ['nullable', 'string', Rule::in(User::SELF_REGISTERABLE_ROLES)],
            // Arrivé par le LIEN d'une classe, après avoir accepté le texte de
            // partage sur sa page : l'adhésion attendra l'adresse vérifiée
            // (PendingClassJoin). Le jeton est revalidé côté serveur ; un
            // lien périmé est ignoré, il ne fait jamais échouer l'inscription.
            'classJoinLink' => 'nullable|string|max:64',
            'classJoinConsent' => 'nullable|boolean',
        ], [
            'email.unique' => 'Un compte existe déjà avec cet email.',
            'email.email' => 'Format email invalide.',
            'password.min' => 'Le mot de passe doit faire au moins 8 caractères.',
            'password.letters' => 'Le mot de passe doit contenir au moins une lettre.',
            'password.numbers' => 'Le mot de passe doit contenir au moins un chiffre.',
            'accept_legal.required' => "Vous devez accepter les Conditions Générales d'Utilisation et la Politique de confidentialité.",
            'accept_legal.accepted' => "Vous devez accepter les Conditions Générales d'Utilisation et la Politique de confidentialité.",
            ...PersonName::messages(),
        ]);

        // Le rôle vient d'une LISTE BLANCHE (student par défaut, teacher sur
        // demande explicite) — jamais d'une valeur libre du client. Le seul
        // moyen de créer un administrateur reste la commande CreateAdmin.
        // Le nom naît avec le compte ; la classe scolaire (grade) est choisie
        // juste après, à l'accueil (/espace/bienvenue).
        //
        // Un enseignant n'a pas de classe scolaire (grade) : il possède des
        // classes (Classroom), chacune avec la sienne. Il est immédiatement
        // sur l'offre enseignant PAR DÉFAUT (gratuite) — aucune ligne, aucune
        // approbation (voir PlanEntitlementResolver).
        //
        // Le consentement naît avec le compte, dans le même INSERT : il
        // n'existe pas d'instant où un compte existe sans lui.
        $user = User::create([
            'first_name' => $validated['firstName'],
            'last_name' => $validated['lastName'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['accountType'] ?? User::ROLE_STUDENT,
            ...LegalConsent::current()->attributes(),
        ]);

        // Notification au tableau de bord (AdminPush) : un élève ou un enseignant vient de s'inscrire.
        if (in_array($user->role, [User::ROLE_STUDENT, User::ROLE_TEACHER], true)) {
            AdminPush::later($user->role === User::ROLE_TEACHER ? 'new_teacher' : 'new_student', $user->id);
        }

        if (! empty($validated['classJoinLink'])) {
            app(PendingClassJoin::class)->remember($user, $validated['classJoinLink'], (bool) ($validated['classJoinConsent'] ?? false));
        }

        // L'adresse n'est PAS vérifiée (email_verified_at reste nul) : le
        // courriel qui suit est la seule façon de la prouver.
        //
        // Un échec d'envoi (SMTP en panne, identifiants faux) ne fait PAS
        // échouer l'inscription : le compte existe déjà. Répondre 500 ici
        // laissait l'élève sans jeton, et sa nouvelle tentative butait sur
        // « adresse déjà utilisée » — enfermé dehors. On répond 201, et
        // `verificationEmailSent: false` dit au frontend de proposer le
        // renvoi tout de suite.
        $sent = VerifyEmailAddress::sendTo($user);

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
            'verificationEmailSent' => $sent,
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
     * « الاسم و اللقب » — le seul geste par lequel un élève ou un enseignant
     * change son propre nom (profil, ou l'étape d'accueil qui le demande à
     * un compte qui n'en a pas encore). Les deux parties, toujours ensemble :
     * un nom à moitié rempli ne sortirait pas l'utilisateur de l'étape.
     */
    public function updateProfile(Request $request)
    {
        PersonName::normalizeRequest($request);
        $validated = $request->validate(PersonName::rules(), PersonName::messages());

        $user = $request->user();
        $user->update([
            'first_name' => $validated['firstName'],
            'last_name' => $validated['lastName'],
        ]);

        return response()->json([
            'success' => true,
            'user' => UserPresenter::format($user),
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
