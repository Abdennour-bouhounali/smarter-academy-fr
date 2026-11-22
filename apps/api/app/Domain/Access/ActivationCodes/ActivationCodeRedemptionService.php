<?php

namespace App\Domain\Access\ActivationCodes;

use App\Domain\Access\EntitlementService;
use App\Domain\Plans\SubscriptionActivationService;
use App\Models\ActivationCode;
use App\Models\Entitlement;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * La SAISIE d'un code d'activation : le seul chemin par lequel un élève
 * obtient un accès payant dans le produit algérien.
 *
 *     code saisi → ce service → entitlements (type = activation_code)
 *                                       ↓
 *                              EntitlementService → ContentAccess
 *
 * Ce service n'autorise RIEN par lui-même et ne connaît aucune leçon : il
 * traduit un titre en droit, exactement comme
 * SubscriptionEntitlementSynchronizer traduit un abonnement. Toute la couche
 * d'accès reste ignorante de l'existence des codes, et c'est ce qui permet
 * d'en changer le modèle commercial sans y toucher.
 *
 * ── Un code ne s'active qu'UNE fois, et c'est tenu à trois niveaux ───────
 *
 *   1. `lockForUpdate()` sérialise deux saisies simultanées du même code.
 *   2. La transition est une mise à jour CONDITIONNELLE
 *      (`where status = available`), qui ne peut réussir qu'une fois même si
 *      le verrou venait à manquer.
 *   3. L'index unique (type, reference) sur `entitlements` rend le doublon
 *      impossible en base — c'est le filet, celui qui tient encore quand les
 *      deux premiers sont contournés par une configuration inattendue.
 *
 * Trois plutôt qu'un parce que le premier dépend du moteur : sous SQLite (la
 * suite de tests) `lockForUpdate` ne fait rien. Le deuxième et le troisième,
 * eux, sont vrais partout. La migration unique_entitlement_reference avait
 * déjà tiré exactement cette conclusion pour les abonnements.
 *
 * ── Ce qui n'est PAS fait ici ────────────────────────────────────────────
 * Aucune vérification de palier, de publication ni de classe : un code ouvre
 * le DROIT COMMERCIAL, pas un contenu. ContentAccess compose ensuite ce droit
 * avec la publication et l'activation de la classe, et refusera toujours une
 * leçon dormante à qui détient un code parfaitement valide.
 */
class ActivationCodeRedemptionService
{
    public function __construct(
        private EntitlementService $entitlements,
        private SubscriptionActivationService $activation,
    ) {}

    /**
     * Saisit un code au nom d'un élève.
     *
     * @throws ActivationCodeException avec son motif (invalid, already_activated,
     *                                 expired, revoked)
     */
    public function redeem(User $student, ?string $rawCode): ActivationCode
    {
        $normalized = ActivationCodeFormat::normalize($rawCode);

        // Mal formé : refusé SANS toucher la base. Un tâtonnement automatisé
        // ne coûte donc même pas une requête, et ne se distingue pas d'un
        // code bien formé mais inconnu (voir ActivationCodeException).
        if ($normalized === null) {
            $this->logRejection($student, ActivationCodeException::INVALID, null);

            throw ActivationCodeException::invalid();
        }

        $hash = ActivationCodeFormat::hash($normalized);
        $now = Carbon::now();

        $code = DB::transaction(function () use ($student, $hash, $now) {
            $code = ActivationCode::where('code_hash', $hash)
                ->lockForUpdate()
                ->first();

            if ($code === null) {
                $this->logRejection($student, ActivationCodeException::INVALID, null);

                throw ActivationCodeException::invalid();
            }

            // Un code lié à une OFFRE ne s'active que pour le bon type de
            // compte — et cela se vérifie AVANT la transition, pour ne pas
            // consommer un code qui n'ouvrira rien.
            $batch = $code->batch;
            if ($batch !== null && $batch->activatesPlan()) {
                $planType = $batch->planVersion?->plan?->type;
                $userType = $student->isTeacher() ? 'teacher' : 'student';
                if ($planType !== $userType) {
                    throw $this->reject($student, ActivationCodeException::planMismatch(), $code);
                }
            }

            // L'ordre des trois refus n'est pas indifférent : il va du plus
            // définitif au plus circonstanciel, pour que le message rendu soit
            // le plus utile des trois. À un code révoqué ET expiré, dire
            // « expiré » laisserait croire qu'un remplacement arrangerait tout.
            match ($code->effectiveStatus($now)) {
                ActivationCode::STATUS_REVOKED => throw $this->reject(
                    $student, ActivationCodeException::revoked(), $code
                ),
                ActivationCode::STATUS_ACTIVATED => throw $this->reject(
                    $student, ActivationCodeException::alreadyActivated(), $code
                ),
                ActivationCode::STATUS_EXPIRED => throw $this->reject(
                    $student, ActivationCodeException::expired(), $code
                ),
                default => null,
            };

            // ── LA transition ────────────────────────────────────────────
            // Conditionnelle, et c'est tout l'intérêt : deux saisies
            // concurrentes exécutent cette mise à jour, une seule voit
            // `status = available` et touche une ligne. La perdante obtient 0
            // et repart avec « déjà utilisé », qui est la stricte vérité.
            $applied = ActivationCode::where('id', $code->id)
                ->where('status', ActivationCode::STATUS_AVAILABLE)
                ->update([
                    'status' => ActivationCode::STATUS_ACTIVATED,
                    'activated_at' => $now,
                    'activated_by' => $student->id,
                ]);

            if ($applied !== 1) {
                throw $this->reject($student, ActivationCodeException::alreadyActivated(), $code);
            }

            // ── Un code lié à une OFFRE fait naître un ABONNEMENT ────────
            // (vente en nombre, ou code individuel envoyé par l'administration).
            // La synchronisation existante en tire le droit ; le code pointe
            // sur ce droit-là, exactement comme sur le chemin classique, pour
            // que la révocation sache quoi fermer.
            if ($batch !== null && $batch->activatesPlan()) {
                try {
                    $subscription = $this->activation->activateFromCode($code, $student, $now);
                } catch (QueryException $e) {
                    $this->logRejection($student, ActivationCodeException::ALREADY_ACTIVATED, $code->code_hint);

                    throw ActivationCodeException::alreadyActivated();
                }

                $entitlement = Entitlement::where('type', Entitlement::TYPE_SUBSCRIPTION)
                    ->where('reference', 'subscription:'.$subscription->id)
                    ->first();

                $code->forceFill([
                    'status' => ActivationCode::STATUS_ACTIVATED,
                    'activated_at' => $now,
                    'activated_by' => $student->id,
                    'entitlement_id' => $entitlement?->id,
                ])->save();

                return $code;
            }

            try {
                $entitlement = Entitlement::create([
                    'user_id' => $student->id,
                    'type' => Entitlement::TYPE_ACTIVATION_CODE,
                    'status' => Entitlement::STATUS_ACTIVE,
                    'starts_at' => $now,
                    // Copiée à la saisie, jamais relue ensuite : le droit
                    // expire tout seul même si le lot change après coup.
                    'expires_at' => $batch?->accessExpiryFrom($now),
                    'source' => 'activation_code',
                    'reference' => self::referenceFor($code),
                    // De quoi répondre « pourquoi cet élève a-t-il accès ? »
                    // sans lire du SQL — le nom du lot, pas le code.
                    'reason' => $batch?->label,
                ]);
            } catch (QueryException $e) {
                // L'index unique (type, reference) a parlé : un droit existe
                // déjà pour ce code. Seule une course que les deux garde-fous
                // précédents n'auraient pas arrêtée mène ici ; le résultat
                // rendu à l'élève reste exact.
                $this->logRejection($student, ActivationCodeException::ALREADY_ACTIVATED, $code->code_hint);

                throw ActivationCodeException::alreadyActivated();
            }

            $code->forceFill([
                'status' => ActivationCode::STATUS_ACTIVATED,
                'activated_at' => $now,
                'activated_by' => $student->id,
                'entitlement_id' => $entitlement->id,
            ])->save();

            return $code;
        });

        // Le service a mémorisé l'état d'AVANT la saisie pendant cette
        // requête : sans cet oubli, la réponse rendue à l'élève lui dirait
        // qu'il n'a toujours pas accès, juste après le lui avoir ouvert.
        $this->entitlements->forget($student);

        return $code->refresh();
    }

    /** L'identité stable du droit né d'un code. Voir l'index unique. */
    public static function referenceFor(ActivationCode $code): string
    {
        return 'activation_code:'.$code->id;
    }

    /** Journalise puis rend l'exception, pour que l'appelant la lève. */
    private function reject(User $student, ActivationCodeException $e, ActivationCode $code): ActivationCodeException
    {
        $this->logRejection($student, $e->reason, $code->code_hint);

        return $e;
    }

    /**
     * La trace d'un refus — dans les journaux applicatifs, pas dans
     * admin_activity_logs : ce dernier retrace les gestes d'ADMINISTRATION,
     * et une saisie ratée d'élève n'en est pas un.
     *
     * Le code saisi n'est JAMAIS écrit, même invalide : un élève qui se
     * trompe d'un caractère aurait déposé un code voisin du vrai dans un
     * fichier que lisent des gens qui n'ont pas à le connaître.
     */
    private function logRejection(User $student, string $reason, ?string $hint): void
    {
        Log::info('activation_code.rejected', [
            'user_id' => $student->id,
            'reason' => $reason,
            'hint' => $hint,
        ]);
    }
}
