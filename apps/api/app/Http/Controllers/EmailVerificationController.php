<?php

namespace App\Http\Controllers;

use App\Domain\Identity\EmailVerificationLink;
use App\Models\User;
use App\Notifications\VerifyEmailAddress;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

/**
 * La vérification d'adresse : recevoir le lien, le suivre, le redemander.
 *
 * `verify` est la seule route de ce fichier qui ne demande PAS de jeton : on
 * clique un lien depuis sa boîte mail, souvent dans un autre navigateur que
 * celui où l'on s'est inscrit. Exiger une session y rendrait la vérification
 * impossible pour une bonne partie des élèves.
 *
 * Ce qui la protège à la place : la SIGNATURE de l'URL (middleware `signed`),
 * qui prouve que le lien vient de nous et n'a pas été modifié, et son
 * expiration. Voir EmailVerificationLink.
 */
class EmailVerificationController extends Controller
{
    /**
     * Suit le lien reçu par courriel, puis renvoie le navigateur vers le
     * frontend — l'élève n'a rien à faire d'autre que cliquer.
     *
     * IDEMPOTENT : re-cliquer un lien déjà utilisé n'est pas une erreur. Tant
     * que la signature est valide et non expirée, on renvoie « déjà vérifié »
     * plutôt qu'un échec — un élève qui clique deux fois n'a rien fait de mal.
     */
    public function verify(Request $request, string $id, string $hash): RedirectResponse
    {
        $user = User::find($id);

        // Compte disparu : la signature est valable (elle a été émise par
        // nous), mais elle ne désigne plus personne.
        if ($user === null) {
            return $this->redirectToFrontend('invalide');
        }

        // Le condensat lie le lien à l'ADRESSE visée. S'il ne correspond
        // plus, l'adresse a changé depuis l'envoi : ce lien certifierait une
        // adresse que personne n'a prouvé posséder. On refuse.
        if (! EmailVerificationLink::hashMatches($user, $hash)) {
            return $this->redirectToFrontend('invalide');
        }

        if (! $user->markEmailAsVerified()) {
            return $this->redirectToFrontend('deja-verifie');
        }

        return $this->redirectToFrontend('succes');
    }

    /**
     * Renvoie le courriel de vérification à l'élève CONNECTÉ.
     *
     * Demande un jeton, contrairement à `verify` : sans cela, ce point
     * d'entrée permettrait d'envoyer des courriels à une adresse quelconque
     * en la nommant dans la requête — un service d'envoi gratuit pour qui
     * veut inonder une boîte. Ici, l'adresse vient du compte authentifié, et
     * jamais du corps de la requête.
     *
     * La limite de débit est posée sur la route (voir routes/api.php).
     */
    public function resend(Request $request)
    {
        $user = $request->user();

        // Déjà vérifié : on ne renvoie rien, et ce n'est pas une erreur.
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'alreadyVerified' => true,
                'message' => 'Votre adresse est déjà vérifiée.',
            ]);
        }

        $user->notify(new VerifyEmailAddress);

        return response()->json([
            'success' => true,
            'alreadyVerified' => false,
            'message' => 'E-mail de vérification envoyé.',
        ]);
    }

    /**
     * Le retour vers le frontend. L'URL est celle du SERVEUR
     * (config frontend.url) — jamais une URL fournie dans la requête, qui
     * ferait de cette route un tremplin de redirection ouverte.
     */
    private function redirectToFrontend(string $statut): RedirectResponse
    {
        $base = rtrim((string) config('app.frontend_url'), '/');

        return redirect()->away($base.'/verification-email?statut='.$statut);
    }
}
