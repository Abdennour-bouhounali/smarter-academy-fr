<?php

namespace Database\Factories;

use App\Domain\Access\ActivationCodes\ActivationCodeFormat;
use App\Models\ActivationCode;
use App\Models\ActivationCodeBatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

/**
 * Usine de TEST uniquement (voir ActivationCodeBatchFactory).
 *
 * ── Le code en clair, et pourquoi il n'existe qu'ici ────────────────────
 * La production ne peut PAS relire un code : la base n'en garde que
 * l'empreinte, et c'est toute la garantie du modèle. Un test, lui, doit
 * pouvoir saisir le code qu'il vient de créer.
 *
 * L'usine le rend donc par un attribut NON PERSISTÉ, `plainCode`, posé sur
 * l'instance après création. Il ne correspond à aucune colonne, ne survit pas
 * à un `fresh()`, et n'apparaît dans aucune réponse — il n'existe que dans la
 * mémoire du test qui vient de l'engendrer. C'est la seule façon d'éprouver
 * une saisie réussie sans affaiblir le stockage pour tout le monde.
 *
 * @extends Factory<ActivationCode>
 */
class ActivationCodeFactory extends Factory
{
    protected $model = ActivationCode::class;

    /**
     * Le code en clair du dernier tirage, par empreinte.
     *
     * Un tableau statique et non un attribut : l'instance Eloquent rendue par
     * `create()` n'est pas toujours celle que `definition()` a nourrie, et une
     * propriété dynamique se perdrait au passage. L'empreinte, elle, voyage
     * avec la ligne — elle sert donc de clé pour retrouver le clair côté test.
     *
     * @var array<string, string>
     */
    private static array $plainByHash = [];

    public function definition(): array
    {
        $plain = ActivationCodeFormat::generate();
        $normalized = ActivationCodeFormat::normalize($plain);
        $hash = ActivationCodeFormat::hash($normalized);

        self::$plainByHash[$hash] = $plain;

        return [
            'batch_id' => ActivationCodeBatch::factory(),
            'code_hash' => $hash,
            'code_hint' => ActivationCodeFormat::hint($normalized),
            'status' => ActivationCode::STATUS_AVAILABLE,
            'expires_at' => null,
            'created_by' => User::factory()->state(['role' => User::ROLE_ADMIN]),
        ];
    }

    /**
     * Le code en clair d'une ligne produite par cette usine.
     *
     * N'existe QUE dans le processus qui l'a tirée : rien n'est stocké, et un
     * test qui relit une ligne créée par un autre processus n'obtiendra rien.
     * C'est voulu — c'est la propriété même du modèle qu'on éprouve.
     */
    public static function plainCodeOf(ActivationCode $code): ?string
    {
        return self::$plainByHash[$code->code_hash] ?? null;
    }

    /** Déjà saisi par un élève. */
    public function activatedBy(User $student, ?Carbon $at = null): static
    {
        return $this->state([
            'status' => ActivationCode::STATUS_ACTIVATED,
            'activated_by' => $student->id,
            'activated_at' => $at ?? Carbon::now()->subDay(),
        ]);
    }

    /** Retiré par l'administration. */
    public function revoked(): static
    {
        return $this->state([
            'status' => ActivationCode::STATUS_REVOKED,
            'revoked_at' => Carbon::now()->subHour(),
            'revoke_reason' => 'Test',
        ]);
    }

    /**
     * Périmé : la date limite de SAISIE est passée, le statut reste
     * `available`. C'est exactement l'état qu'aucune tâche planifiée ne vient
     * corriger, et que effectiveStatus() doit rendre comme `expired`.
     */
    public function expired(): static
    {
        return $this->state(['expires_at' => Carbon::now()->subDay()]);
    }
}
