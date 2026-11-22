<?php

namespace App\Domain\Access;

use App\Domain\Plans\TeacherCoverage;
use App\Domain\School\SchoolCoverage;
use App\Models\Entitlement;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * L'AUTORITÉ unique du droit d'accès.
 *
 * Une seule question lui est posée : « cet utilisateur possède-t-il la
 * permission requise par ce palier ? ». Elle ne regarde jamais l'état de
 * publication d'un contenu, et ne doit jamais le regarder — c'est ce qui
 * garantit qu'une dérogation d'administration n'ouvre pas du contenu masqué
 * (spec §8, §29). Les deux décisions sont composées par ContentAccess, et
 * seulement là.
 *
 * Ce qui rend cette classe sûre : elle est la SEULE à savoir ce qu'est un
 * droit valide. Aucun contrôleur n'écrit `if ($user->subscription)` — cette
 * condition, dispersée, finirait par exister en cinq versions dont trois
 * fausses sur les dates.
 *
 * ── Le gratuit n'est pas une ligne ──────────────────────────────────────
 * Tout compte actif satisfait le palier gratuit, par RÈGLE. Aucune requête,
 * aucune ligne, aucun risque d'un élève enfermé dehors parce qu'une
 * migration a oublié de lui créer son droit. Voir la migration entitlements.
 *
 * ── Le point d'ancrage du paiement (spec §31) ───────────────────────────
 * Le jour où un fournisseur de paiement sera branché, la chaîne sera :
 *
 *     fournisseur → état d'abonnement → SYNCHRONISATION → entitlements
 *                                                             ↓
 *                                                    EntitlementService
 *                                                             ↓
 *                                                       ContentAccess
 *
 * La synchronisation écrit des lignes `subscription` ; rien d'autre ne
 * change. Aucune règle d'accès ne consulte le fournisseur, et surtout aucune
 * ne déduit un droit d'un PAIEMENT : « un paiement existe » et « l'accès est
 * ouvert » sont deux faits distincts (un remboursement sépare les deux). La
 * table payments n'est donc jamais lue ici.
 */
class EntitlementService
{
    /**
     * L'utilisateur satisfait-il le palier demandé ?
     *
     * $user à null = visiteur anonyme. Aucune requête n'est faite pour lui :
     * il n'a pas de droits, et interroger la base pour l'apprendre coûterait
     * une requête par page vue par un visiteur non connecté.
     */
    public function satisfies(?User $user, string $tier): bool
    {
        return $this->decide($user, $tier)->allowed;
    }

    /**
     * La décision AVEC son motif — c'est elle qui permet de répondre
     * « pourquoi cet élève a-t-il (ou n'a-t-il pas) accès ? » sans lire du
     * SQL (spec §52). `satisfies()` n'en garde que le booléen.
     */
    public function decide(?User $user, string $tier): AccessDecision
    {
        $tier = AccessTier::normalize($tier);

        // Un compte fermé ne satisfait AUCUN palier, pas même le gratuit, et
        // pas même avec un abonnement valide en cours. Le statut de compte
        // domine le droit d'accès : suspendre quelqu'un qui a payé doit le
        // suspendre pour de bon (spec §11).
        if ($user !== null && ! $user->hasActiveAccount()) {
            return AccessDecision::deny(AccessDecision::ACCOUNT_INACTIVE);
        }

        if ($tier === AccessTier::FREE) {
            // Le gratuit reste ouvert à l'anonyme : c'est le comportement
            // actuel de la plateforme, et l'introduction des droits d'accès
            // ne doit rien fermer qui était ouvert (spec §19, §22).
            return AccessDecision::allow(AccessDecision::VIA_FREE);
        }

        // À partir d'ici le contenu est payant. L'anonyme s'arrête là, sans
        // requête.
        if ($user === null) {
            return AccessDecision::deny(AccessDecision::AUTHENTICATION_REQUIRED);
        }

        // L'ENSEIGNANT lit tout le contenu publié : il ne l'achète pas, il
        // le prépare. Le rôle ouvre, sans ligne. La publication reste
        // souveraine (ContentAccess l'a déjà vérifiée) ; la visibilité par
        // classe ne le concerne pas (elle règle ce que SES élèves voient).
        if ($user->isTeacher()) {
            return AccessDecision::allow(AccessDecision::VIA_TEACHER_ROLE);
        }

        // L'ADMINISTRATEUR relit tout le contenu (ContentAccess::
        // visibleStatuses) : le palier ne doit pas lui cacher ce que
        // la publication lui montre.
        if ($user->isAdmin()) {
            return AccessDecision::allow(AccessDecision::VIA_ADMIN_ROLE);
        }

        $now = Carbon::now();

        // Les droits sont cumulatifs et non exclusifs : on cherche s'il en
        // existe UN qui ouvre. Un abonnement expiré doublé d'une dérogation
        // valide ouvre l'accès (spec §33) — c'est le cas d'usage même du
        // geste commercial pendant qu'un paiement se règle.
        $valid = $this->validEntitlements($user, $now);

        // L'ordre est celui de la RÉALITÉ COMMERCIALE, du plus « acheté » au
        // plus offert : quand plusieurs droits coexistent, le motif rendu doit
        // être celui qui décrit vraiment la situation de l'élève. « Cet accès
        // vient d'une dérogation » alors qu'il a payé une carte enverrait le
        // support sur une fausse piste — et lui ferait croire, à l'échéance,
        // qu'on lui retire un cadeau plutôt qu'un dû.
        $byType = [
            Entitlement::TYPE_SUBSCRIPTION => AccessDecision::VIA_SUBSCRIPTION,
            Entitlement::TYPE_ACTIVATION_CODE => AccessDecision::VIA_ACTIVATION_CODE,
            Entitlement::TYPE_ADMIN_OVERRIDE => AccessDecision::VIA_ADMIN_OVERRIDE,
        ];

        foreach ($byType as $type => $reason) {
            if ($found = $valid->firstWhere('type', $type)) {
                return AccessDecision::allow($reason, $found);
            }
        }

        // Le modèle C (licence d'établissement), APRÈS les droits propres et
        // AVANT l'enseignant : c'est l'établissement qui paie ses élèves.
        if ($this->schoolCoverageFor($user)['covered']) {
            return AccessDecision::allow(AccessDecision::VIA_SCHOOL_LICENCE);
        }

        // Le modèle B, APRÈS les droits propres : quand un élève a payé sa
        // carte ET est couvert par son enseignant, c'est sa carte qui
        // explique son accès. La couverture ne produit aucune ligne ; elle
        // se recalcule à chaque requête (mémorisée le temps de celle-ci).
        if ($this->coverageFor($user)['covered']) {
            return AccessDecision::allow(AccessDecision::VIA_TEACHER_SUBSCRIPTION);
        }

        return AccessDecision::deny(AccessDecision::PREMIUM_REQUIRED);
    }

    /**
     * La couverture par l'offre de l'enseignant (modèle B), mémorisée par
     * requête comme les droits. Résolue paresseusement : un élève
     * indépendant ne coûte que la requête d'adhésion.
     *
     * @return array{covered: bool, teacherId: ?int, endsAt: ?Carbon}
     */
    private function coverageFor(User $user): array
    {
        if (! isset($this->coverage[$user->id])) {
            $this->coverage[$user->id] = app(TeacherCoverage::class)->coverageFor($user);
        }

        return $this->coverage[$user->id];
    }

    /** @var array<int, array{covered: bool, teacherId: ?int, endsAt: ?Carbon}> */
    private array $coverage = [];

    /**
     * La couverture par la licence de l'établissement (modèle C), mémorisée
     * par requête comme la couverture de l'enseignant.
     *
     * @return array{covered: bool, schoolId: ?int, endsAt: ?Carbon}
     */
    private function schoolCoverageFor(User $user): array
    {
        if (! isset($this->schoolCoverage[$user->id])) {
            $this->schoolCoverage[$user->id] = app(SchoolCoverage::class)->coverageFor($user);
        }

        return $this->schoolCoverage[$user->id];
    }

    /** @var array<int, array{covered: bool, schoolId: ?int, endsAt: ?Carbon}> */
    private array $schoolCoverage = [];

    /**
     * Les droits valides d'un utilisateur, en UNE requête, mémorisés le temps
     * de la requête HTTP.
     *
     * La mémorisation par instance de modèle est ce qui évite que la
     * sauvegarde d'une progression — qui vérifie la leçon PUIS le module —
     * paie deux fois la même question. Elle ne franchit pas la requête : un
     * droit révoqué à l'instant doit fermer l'accès au prochain appel, pas à
     * l'expiration d'un cache. C'est aussi pourquoi aucun Redis n'est
     * introduit ici (spec §43) : le problème à résoudre était la répétition
     * dans UNE requête, et un tableau le résout.
     *
     * @return Collection<int, Entitlement>
     */
    private function validEntitlements(User $user, Carbon $now)
    {
        if (! isset($this->cache[$user->id])) {
            $this->cache[$user->id] = $user->entitlements()
                ->validNow($now)
                ->whereIn('type', Entitlement::TYPES)
                ->get();
        }

        return $this->cache[$user->id];
    }

    /** @var array<int, Collection<int, Entitlement>> */
    private array $cache = [];

    /**
     * Oublie ce qui a été mémorisé pour un utilisateur.
     *
     * Nécessaire parce que le service est un singleton du conteneur : après
     * qu'une dérogation vient d'être accordée ou retirée DANS LA MÊME requête,
     * le résumé renvoyé à l'administrateur décrirait sinon l'état d'avant, et
     * l'écran afficherait « aucun accès » juste après l'avoir ouvert.
     * `$student->fresh()` ne suffit pas : c'est ce tableau qu'il faut vider,
     * pas le modèle.
     */
    public function forget(?User $user = null): void
    {
        if ($user === null) {
            $this->cache = [];
            $this->coverage = [];
            $this->schoolCoverage = [];

            return;
        }

        unset($this->cache[$user->id], $this->coverage[$user->id], $this->schoolCoverage[$user->id]);
    }

    /**
     * Le résumé destiné à l'élève et à l'administration : de quoi afficher un
     * état, jamais de quoi l'autoriser.
     *
     * N'expose PAS les lignes de droits : un élève n'a pas besoin de
     * connaître la référence externe d'un abonnement pour savoir qu'il est
     * actif (spec §25).
     *
     * @return array{freeAccess: bool, subscriptionActive: bool, activationCodeActive: bool, adminOverrideActive: bool, teacherCoverageActive: bool, premiumAccess: bool, expiresAt: ?string}
     */
    public function summarize(?User $user): array
    {
        $decision = $this->decide($user, AccessTier::PREMIUM);
        $valid = $user !== null && $user->hasActiveAccount()
            ? $this->validEntitlements($user, Carbon::now())
            : collect();
        $coverage = $user !== null && $user->hasActiveAccount()
            ? $this->coverageFor($user)
            : ['covered' => false, 'teacherId' => null, 'endsAt' => null];
        $schoolCoverage = $user !== null && $user->hasActiveAccount()
            ? $this->schoolCoverageFor($user)
            : ['covered' => false, 'schoolId' => null, 'endsAt' => null];

        return [
            'freeAccess' => $this->satisfies($user, AccessTier::FREE),
            'subscriptionActive' => $valid->contains('type', Entitlement::TYPE_SUBSCRIPTION),
            'activationCodeActive' => $valid->contains('type', Entitlement::TYPE_ACTIVATION_CODE),
            'adminOverrideActive' => $valid->contains('type', Entitlement::TYPE_ADMIN_OVERRIDE),
            // Le modèle B : couvert par l'offre de son enseignant.
            'teacherCoverageActive' => $coverage['covered'],
            // Le modèle C : couvert par la licence de son établissement.
            'schoolCoverageActive' => $schoolCoverage['covered'],
            'premiumAccess' => $decision->allowed,
            'expiresAt' => optional($this->accessEndsAt($valid, $coverage, $schoolCoverage))->toIso8601String(),
        ];
    }

    /**
     * Quand l'accès premium se ferme-t-il, tous droits confondus ?
     *
     * La question que l'élève pose est « jusqu'à quand ai-je accès ? », pas
     * « quand ce droit-ci finit-il ». Les droits étant CUMULATIFS (decide()
     * en cherche un qui ouvre, pas le seul), la réponse est la fin du
     * DERNIER : deux cartes d'activation empilées prolongent l'accès, et
     * annoncer la fin de la première ferait craindre une coupure qui n'aura
     * pas lieu.
     *
     * Un seul droit sans terme suffit à rendre la question sans objet : on
     * renvoie null plutôt qu'une date qui serait fausse. C'est aussi ce qui
     * était rendu avant l'introduction des codes, pour un abonnement sans fin.
     *
     * La couverture par l'enseignant entre dans le même calcul : sa fin est
     * celle de l'abonnement de l'enseignant (null = sans terme).
     *
     * @param  Collection<int, Entitlement>  $valid
     * @param  array{covered: bool, teacherId: ?int, endsAt: ?Carbon}  $coverage
     */
    private function accessEndsAt($valid, array $coverage = ['covered' => false, 'teacherId' => null, 'endsAt' => null], array $schoolCoverage = ['covered' => false, 'schoolId' => null, 'endsAt' => null]): ?Carbon
    {
        // `toBase()` : une collection Eloquent VIDE reste Eloquent après map(),
        // et son contains() prend alors un Carbon pour une clé de modèle.
        $ends = $valid->toBase()->map(fn (Entitlement $e) => $e->expires_at);
        if ($coverage['covered']) {
            $ends->push($coverage['endsAt']);
        }
        if ($schoolCoverage['covered']) {
            $ends->push($schoolCoverage['endsAt']);
        }

        if ($ends->isEmpty() || $ends->contains(null)) {
            return null;
        }

        return $ends->max();
    }
}
