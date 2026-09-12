<?php

namespace App\Http\Controllers;

use App\Domain\Identity\GoogleAccountLinker;
use App\Domain\Identity\GoogleIdentity;
use App\Domain\Identity\GoogleIdentityRejected;
use App\Domain\Identity\GoogleLinkOutcome;
use App\Domain\Identity\LegalConsent;
use App\Domain\Identity\PendingGoogleSignup;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

/**
 * « Continuer avec Google ».
 *
 * Le parcours, et où se trouve chaque garantie :
 *
 *     /auth/google/redirect          le navigateur part chez Google
 *              ↓
 *     Google authentifie la personne
 *              ↓
 *     /auth/google/callback          ÉCHANGE du code contre l'identité,
 *                                    côté serveur (le secret ne quitte
 *                                    jamais cette machine)
 *              ↓
 *     GoogleAccountLinker            QUI est-ce ? (règle de liaison)
 *              ↓
 *       ┌──────┴───────┐
 *   compte connu    aucun compte
 *       ↓                ↓
 *   jeton Sanctum    jeton d'attente → écran de consentement
 *       ↓                ↓
 *    /espace         /auth/google/complete → création → jeton Sanctum
 *
 * ── « stateless » ────────────────────────────────────────────────────────
 * Socialite est utilisé sans session : cette API sert un SPA qui s'authentifie
 * par jeton porteur, et le retour de Google arrive sur une requête de premier
 * niveau où le cookie de session n'est pas garanti (SameSite=lax + redirection
 * inter-site). Le mode avec session échouerait donc par intermittence, sur la
 * vérification d'un `state` que le navigateur n'a pas renvoyé.
 *
 * Ce que `state` protège — le CSRF de connexion — est ici couvert autrement :
 * le rappel ne produit AUCUNE session directement exploitable sans que le
 * frontend, seul détenteur de la page de retour, lise le jeton et l'installe.
 */
class GoogleAuthController extends Controller
{
    public function __construct(private readonly GoogleAccountLinker $linker) {}

    /**
     * Départ vers Google. Ne demande que l'identité — aucun accès Gmail,
     * Drive ou contacts : on veut savoir QUI, pas obtenir des pouvoirs.
     */
    public function redirect(): RedirectResponse|JsonResponse
    {
        if (! $this->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => "La connexion avec Google n'est pas disponible.",
            ], 503);
        }

        return Socialite::driver('google')
            ->stateless()
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    /**
     * Retour de Google. Redirige TOUJOURS vers le frontend — c'est le
     * navigateur de l'élève qui arrive ici, pas un appel programmatique :
     * rendre du JSON lui afficherait une page blanche remplie d'accolades.
     */
    public function callback(Request $request): RedirectResponse
    {
        if (! $this->isConfigured()) {
            return $this->back(['erreur' => 'indisponible']);
        }

        // L'élève a refusé l'autorisation, ou Google a renvoyé une erreur.
        if ($request->has('error') || ! $request->has('code')) {
            return $this->back(['erreur' => 'annule']);
        }

        try {
            $identity = $this->fetchIdentity();
        } catch (GoogleIdentityRejected $e) {
            return $this->back(['erreur' => $e->reason]);
        } catch (Throwable) {
            // Panne réseau, jeton refusé, réponse inattendue : on ne laisse
            // jamais fuir le détail vers l'élève.
            return $this->back(['erreur' => 'provider_failure']);
        }

        try {
            $outcome = $this->linker->resolve($identity);
        } catch (GoogleIdentityRejected $e) {
            return $this->back(['erreur' => $e->reason]);
        }

        // Compte neuf : RIEN n'a été créé. On renvoie l'élève vers l'écran de
        // consentement, muni d'un jeton d'attente (§22).
        if ($outcome->kind === GoogleLinkOutcome::NEEDS_CONSENT) {
            return $this->back([
                'etape' => 'consentement',
                'handoff' => PendingGoogleSignup::issue($identity),
                'email' => $identity->email,
            ]);
        }

        return $this->issueSessionRedirect($outcome->user);
    }

    /**
     * Création du compte, APRÈS consentement. Le seul point d'entrée qui
     * crée un compte Google.
     */
    public function complete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'handoff' => 'required|string',
            // Un BOOLÉEN, et rien d'autre. Aucune version n'est acceptée du
            // client : le serveur écrit celles qui ont cours (§7).
            'accept_legal' => 'required|accepted',
        ], [
            'accept_legal.required' => "Vous devez accepter les Conditions Générales d'Utilisation et la Politique de confidentialité.",
            'accept_legal.accepted' => "Vous devez accepter les Conditions Générales d'Utilisation et la Politique de confidentialité.",
        ]);

        $identity = PendingGoogleSignup::open($validated['handoff']);

        if ($identity === null) {
            return response()->json([
                'success' => false,
                'message' => 'Votre session de connexion a expiré. Recommencez.',
            ], 422);
        }

        try {
            $user = $this->linker->createFromIdentity($identity, LegalConsent::current());
        } catch (GoogleIdentityRejected $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        if (! $user->hasActiveAccount()) {
            return response()->json([
                'success' => false,
                'message' => 'Votre compte a été désactivé.',
            ], 403);
        }

        $user->forceFill(['last_activity_at' => now()])->save();

        return response()->json([
            'success' => true,
            'token' => $user->createToken($user->role.'-token')->plainTextToken,
            'user' => UserPresenter::format($user),
        ], 201);
    }

    /**
     * Traduit la réponse de Socialite en identité, ou refuse.
     */
    private function fetchIdentity(): GoogleIdentity
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $sub = (string) ($googleUser->getId() ?? '');
        $email = (string) ($googleUser->getEmail() ?? '');

        if ($sub === '' || $email === '') {
            throw GoogleIdentityRejected::providerFailure();
        }

        // `email_verified` vient du profil OpenID. ABSENT ⇒ FAUX : on ne
        // suppose jamais une vérification que le fournisseur n'affirme pas.
        $raw = $googleUser->user ?? [];
        $verified = ($raw['email_verified'] ?? false) === true
            || ($raw['email_verified'] ?? null) === 'true';

        return new GoogleIdentity(
            providerUserId: $sub,
            email: $email,
            emailVerified: $verified,
            firstName: $raw['given_name'] ?? null,
            lastName: $raw['family_name'] ?? null,
        );
    }

    /**
     * Délivre un jeton et renvoie le navigateur vers le frontend.
     *
     * Le jeton transite par l'URL parce que le rappel de Google est une
     * navigation, pas un appel que le frontend peut lire. Il est à usage
     * unique côté frontend, qui l'échange immédiatement contre son stockage
     * et nettoie l'URL.
     */
    private function issueSessionRedirect(User $user): RedirectResponse
    {
        if (! $user->hasActiveAccount()) {
            return $this->back(['erreur' => 'compte_inactif']);
        }

        $user->forceFill(['last_activity_at' => now()])->save();

        return $this->back([
            'etape' => 'connecte',
            'token' => $user->createToken($user->role.'-token')->plainTextToken,
        ]);
    }

    private function isConfigured(): bool
    {
        $google = config('services.google');

        return ! empty($google['client_id'])
            && ! empty($google['client_secret'])
            && ! empty($google['redirect']);
    }

    /**
     * Retour vers la page d'atterrissage du frontend. L'URL de base vient de
     * la CONFIGURATION, jamais de la requête (redirection ouverte).
     */
    private function back(array $params): RedirectResponse
    {
        $base = rtrim((string) config('app.frontend_url'), '/');

        return redirect()->away($base.'/auth/google?'.http_build_query($params));
    }
}
