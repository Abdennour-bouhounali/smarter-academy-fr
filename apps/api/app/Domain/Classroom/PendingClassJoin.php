<?php

namespace App\Domain\Classroom;

use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * L'adhésion qui ATTEND l'adresse vérifiée.
 *
 * Un élève ouvre le lien de classe sans compte, lit le texte de partage,
 * appuie sur « أوافق وأنشئ حسابي » — il a consenti. Mais l'espace élève (et
 * donc `POST /student/classrooms/join`) reste fermé tant que son adresse n'est
 * pas prouvée, et le lien du courriel s'ouvre souvent AILLEURS (l'application
 * Gmail du téléphone) : un état gardé dans le navigateur d'origine serait
 * perdu. Le serveur le garde donc sur le compte, et l'adhésion se fait au
 * moment où l'adresse est vérifiée (EmailVerificationController::verify).
 *
 * Le navigateur d'origine, lui, garde aussi l'intention (pendingClassJoin.js) :
 * s'il est encore ouvert, il rejoint lui-même — et reçoit `alreadyMember` si
 * la vérification l'a déjà fait. Les deux chemins sont idempotents.
 *
 * Ce qui est gardé : le jeton (revalidé au moment d'adhérer — un lien
 * renouvelé ou une classe fermée entre-temps n'ouvre rien) et l'instant du
 * consentement. Jamais un identifiant de classe venu du client.
 */
class PendingClassJoin
{
    public function __construct(private ClassroomMembershipService $memberships) {}

    /**
     * À l'inscription d'un ÉLÈVE qui a consenti sur la page du lien. Un lien
     * invalide ou une classe fermée est ignoré en silence : l'inscription
     * n'échoue jamais à cause d'un lien périmé.
     */
    public function remember(User $student, ?string $token, bool $consented): void
    {
        if (! $consented || ! $student->isStudent()) {
            return;
        }

        try {
            $classroom = $this->memberships->classroomForLink($token);
        } catch (ClassroomException) {
            return;
        }
        if (! $classroom->acceptsNewMembers()) {
            return;
        }

        $student->forceFill([
            'pending_class_join_token' => $token,
            'pending_class_join_at' => Carbon::now(),
        ]);

        // La classe scolaire du قسم, DÈS l'inscription (propriétaire,
        // 2026-10-22) : l'élève venu par le lien de son enseignant n'a pas à
        // choisir son année — c'est celle de la classe qu'il rejoint. Même
        // règle que ClassroomMembershipService::join(), avancée à l'instant
        // de l'inscription : une classe déjà choisie n'est jamais touchée.
        if ($student->grade === null || $student->grade === '') {
            $student->grade = $classroom->grade;
        }

        $student->save();
    }

    /**
     * L'adresse vient d'être prouvée : l'adhésion attendue se fait, avec le
     * consentement donné sur la page du lien. Un refus (classe complète,
     * fermée, lien renouvelé) efface l'attente sans bruit — l'élève peut
     * rouvrir le lien, et la vérification de son adresse, elle, a réussi.
     */
    public function complete(User $student): void
    {
        $token = $student->pending_class_join_token;
        if ($token === null || $token === '') {
            return;
        }

        $student->forceFill(['pending_class_join_token' => null, 'pending_class_join_at' => null])->save();

        try {
            $this->memberships->joinByLink($student, $token, consented: true);
        } catch (ClassroomException) {
            // Voir ci-dessus : l'attente est levée, rien d'autre.
        }
    }
}
