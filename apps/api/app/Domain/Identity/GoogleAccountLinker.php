<?php

namespace App\Domain\Identity;

use App\Models\User;
use App\Models\UserIdentity;
use Illuminate\Support\Facades\DB;

/**
 * QUI EST CETTE PERSONNE ? — la seule réponse autorisée à cette question pour
 * une identité Google.
 *
 * C'est la pièce sensible de toute la connexion Google : s'y tromper ne
 * produit pas un bug, mais un DÉTOURNEMENT DE COMPTE. Les règles sont donc
 * énoncées une fois, ici, et vérifiées par des tests dédiés.
 *
 * ══ LA RÈGLE DE LIAISON ═══════════════════════════════════════════════════
 *
 * 1. L'identité Google (`provider_user_id`) est-elle DÉJÀ liée ?
 *       → oui : c'est ce compte-là. On ne regarde même pas le courriel.
 *         Le `sub` de Google est stable et n'est jamais réattribué ; le
 *         courriel, lui, peut changer. L'identifiant fait foi, pas l'adresse.
 *         Conséquence voulue : un élève qui change d'adresse chez Google
 *         retrouve son compte, et un courriel recyclé n'en ouvre aucun.
 *
 * 2. Google affirme-t-il que l'adresse est VÉRIFIÉE ?
 *       → non : on s'arrête. Sans preuve de possession de l'adresse, la
 *         rapprocher d'un compte local reviendrait à laisser n'importe qui
 *         revendiquer l'adresse d'autrui. Aucune liaison, aucune création.
 *
 * 3. Un compte local porte-t-il ce courriel ?
 *       → non : aucun compte n'existe → NEEDS_CONSENT. Rien n'est créé ici
 *         (§22 : le consentement précède la création).
 *       → oui : on LIE, sous les conditions du paragraphe suivant.
 *
 * ══ POURQUOI LIER EST SÛR ICI ═════════════════════════════════════════════
 *
 * Lier, c'est donner à qui contrôle la boîte Google l'accès à un compte local
 * existant. Ce n'est légitime que si l'adresse est la MÊME et qu'elle est
 * PROUVÉE. Elle l'est : Google vient d'attester que la personne possède cette
 * adresse (étape 2), et c'est très exactement la preuve que notre propre
 * courriel de vérification cherche à obtenir. Le possesseur de la boîte
 * pourrait de toute façon s'emparer du compte par « mot de passe oublié ».
 *
 * Ce que ce raisonnement NE couvre pas, et qu'il faut donc traiter :
 * un compte local dont l'adresse n'a jamais été vérifiée de NOTRE côté peut
 * avoir été créé par un tiers avec l'adresse d'un autre (rien n'empêche
 * d'écrire l'adresse du voisin dans un formulaire d'inscription). Le lier
 * livrerait à ce tiers... non : il livrerait au VRAI possesseur de l'adresse
 * un compte créé par l'usurpateur. Le danger est l'inverse de celui qu'on
 * craint d'ordinaire — c'est l'imposteur qui perd la main, pas la victime.
 *
 * On lie donc, MAIS on neutralise l'accès de l'imposteur dans ce cas précis :
 * les jetons existants du compte sont révoqués (voir `linkExisting`). Le
 * compte revient ainsi à qui prouve posséder l'adresse, et celui qui l'avait
 * créé sans preuve en perd la main. Le mot de passe qu'il connaît peut-être
 * n'est pas effacé — nous ignorons lequel des deux l'a choisi — mais il ne
 * lui donne plus de session en cours.
 *
 * Un compte DÉJÀ vérifié de notre côté, lui, ne subit aucune révocation :
 * les deux preuves désignent la même personne.
 */
final class GoogleAccountLinker
{
    /**
     * Résout une identité Google en compte local, ou dit qu'il faut le
     * consentement avant d'en créer un.
     *
     * @throws GoogleIdentityRejected si l'adresse n'est pas vérifiée chez Google
     */
    public function resolve(GoogleIdentity $identity): GoogleLinkOutcome
    {
        // ── 1. Identité déjà connue ? ────────────────────────────────────
        // La recherche porte sur (provider, provider_user_id), la clé unique.
        // Le courriel n'intervient pas : voir l'en-tête, règle 1.
        $existingIdentity = UserIdentity::query()
            ->where('provider', UserIdentity::PROVIDER_GOOGLE)
            ->where('provider_user_id', $identity->providerUserId)
            ->first();

        if ($existingIdentity !== null) {
            $user = $existingIdentity->user;

            // Une identité orpheline ne devrait pas exister (la clé étrangère
            // est en cascade). Si elle existe malgré tout, on refuse plutôt
            // que de « réparer » en créant un compte : un état impossible ne
            // se rattrape pas en silence.
            if ($user === null) {
                throw GoogleIdentityRejected::orphanIdentity();
            }

            // L'adresse chez Google a pu changer depuis la liaison. On met
            // l'ARCHIVE à jour, jamais le courriel du compte local : changer
            // l'adresse de connexion d'un compte est un geste que l'élève doit
            // faire lui-même, pas un effet de bord d'une connexion.
            if ($existingIdentity->provider_email !== $identity->email) {
                $existingIdentity->forceFill(['provider_email' => $identity->email])->save();
            }

            return GoogleLinkOutcome::signedIn($user, $identity);
        }

        // ── 2. Adresse prouvée chez Google ? ─────────────────────────────
        if (! $identity->emailVerified) {
            throw GoogleIdentityRejected::unverifiedEmail();
        }

        // ── 3. Un compte local porte-t-il ce courriel ? ──────────────────
        $user = User::query()->where('email', $identity->email)->first();

        if ($user === null) {
            // Aucun compte. On n'en crée PAS ici : le consentement d'abord.
            return GoogleLinkOutcome::needsConsent($identity);
        }

        return GoogleLinkOutcome::linked($this->linkExisting($user, $identity), $identity);
    }

    /**
     * Crée le compte d'une personne qui vient de consentir, et le lie.
     *
     * Le compte et son identité naissent dans la MÊME transaction : un compte
     * sans identité serait un compte auquel son propriétaire ne pourrait plus
     * se connecter (il n'a pas de mot de passe).
     */
    public function createFromIdentity(GoogleIdentity $identity, LegalConsent $consent): User
    {
        if (! $identity->emailVerified) {
            throw GoogleIdentityRejected::unverifiedEmail();
        }

        return DB::transaction(function () use ($identity, $consent) {
            // Course possible : deux onglets, deux créations. L'unicité de
            // users.email tranche ; on relit plutôt que de supposer.
            $existing = User::query()->where('email', $identity->email)->first();

            if ($existing !== null) {
                return $this->linkExisting($existing, $identity);
            }

            $user = User::create([
                'email' => $identity->email,
                // Le prénom si Google le donne — il alimente l'accueil de
                // l'élève. Jamais obligatoire : un compte se crée sans.
                'first_name' => $identity->firstName,
                'last_name' => $identity->lastName,
                // PAS de mot de passe. Ni vide, ni aléatoire : NULL.
                // Voir la migration 2026_09_18_000003.
                'password' => null,
                'role' => User::ROLE_STUDENT,
                ...$consent->attributes(),
            ]);

            // L'adresse est prouvée par Google : aucun courriel de
            // vérification n'a de sens ici, on demanderait à l'élève de
            // prouver ce qui vient de l'être.
            $user->forceFill(['email_verified_at' => now()])->save();

            $this->attachIdentity($user, $identity);

            return $user;
        });
    }

    /**
     * Lie une identité Google à un compte local existant.
     *
     * @throws GoogleIdentityRejected si ce compte est déjà lié à une AUTRE
     *         identité Google — voir plus bas.
     */
    private function linkExisting(User $user, GoogleIdentity $identity): User
    {
        return DB::transaction(function () use ($user, $identity) {
            $already = UserIdentity::query()
                ->where('user_id', $user->id)
                ->where('provider', UserIdentity::PROVIDER_GOOGLE)
                ->first();

            // Ce compte est déjà lié à un AUTRE compte Google. Le lier une
            // seconde fois donnerait deux clés à deux personnes différentes
            // pour la même porte. On refuse.
            if ($already !== null && $already->provider_user_id !== $identity->providerUserId) {
                throw GoogleIdentityRejected::alreadyLinkedToAnotherIdentity();
            }

            // Un compte dont NOUS n'avons jamais vérifié l'adresse : on rend
            // la main au possesseur prouvé de la boîte, et on coupe les
            // sessions ouvertes par qui ne l'avait pas prouvée.
            // Voir l'en-tête de la classe pour le raisonnement complet.
            $wasUnverifiedLocally = $user->email_verified_at === null;

            if ($already === null) {
                $this->attachIdentity($user, $identity);
            }

            if ($wasUnverifiedLocally) {
                $user->tokens()->delete();
                // Google vient de prouver l'adresse : elle est vérifiée.
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            return $user->refresh();
        });
    }

    private function attachIdentity(User $user, GoogleIdentity $identity): void
    {
        UserIdentity::create([
            'user_id' => $user->id,
            'provider' => UserIdentity::PROVIDER_GOOGLE,
            'provider_user_id' => $identity->providerUserId,
            'provider_email' => $identity->email,
        ]);
    }
}
