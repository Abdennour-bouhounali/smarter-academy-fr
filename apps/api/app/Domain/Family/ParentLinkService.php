<?php

namespace App\Domain\Family;

use App\Models\ParentLink;
use App\Models\ParentLinkCode;
use App\Models\User;
use App\Notifications\ParentLinkRevokedNotification;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Le lien parent ↔ élève (PARENT_SPACE.md §2).
 *
 * Le consentement est un GESTE de l'élève : il lit « ما يراه وليّك », accepte,
 * et reçoit un code (8 caractères, 72 h, usage unique) qu'il donne lui-même à
 * son وليّ. Le parent saisit le code ; le lien hérite de la version acceptée.
 *
 * Les deux côtés peuvent rompre le lien. Quand l'ÉLÈVE le rompt, le parent
 * en est averti par courriel : la rupture n'est jamais silencieuse.
 *
 * Toute lecture du parent passe par `activeLink()` : un lien actif, sinon 404
 * (le parent n'apprend pas qu'un autre compte existe).
 */
class ParentLinkService
{
    /** Sans 0/O, 1/I/L : un code se dicte au téléphone. */
    private const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

    private const CODE_LENGTH = 8;

    public function currentCode(User $student): ?ParentLinkCode
    {
        return ParentLinkCode::where('student_id', $student->id)
            ->where('expires_at', '>', Carbon::now())
            ->first();
    }

    public function issueCode(User $student, bool $consent): ParentLinkCode
    {
        if (! $consent) {
            throw new FamilyException(FamilyException::CONSENT_REQUIRED, 'Le consentement est requis.');
        }

        return DB::transaction(function () use ($student) {
            ParentLinkCode::where('student_id', $student->id)->delete();

            return ParentLinkCode::create([
                'student_id' => $student->id,
                'code' => $this->freshCode(),
                'consent_version' => (string) config('family.consent_version'),
                'consented_at' => Carbon::now(),
                'expires_at' => Carbon::now()->addHours((int) config('family.code_ttl_hours', 72)),
            ]);
        });
    }

    public function cancelCode(User $student): void
    {
        ParentLinkCode::where('student_id', $student->id)->delete();
    }

    public function link(User $parent, string $rawCode): ParentLink
    {
        $code = self::normalize($rawCode);

        return DB::transaction(function () use ($parent, $code) {
            $row = ParentLinkCode::where('code', $code)->lockForUpdate()->first();
            if ($row === null) {
                throw new FamilyException(FamilyException::INVALID_CODE, 'Code inconnu.');
            }
            if ($row->expires_at->isPast()) {
                $row->delete();
                throw new FamilyException(FamilyException::EXPIRED_CODE, 'Code expiré.');
            }

            $student = User::find($row->student_id);
            if ($student === null || ! $student->isStudent()) {
                throw new FamilyException(FamilyException::INVALID_CODE, 'Code inconnu.');
            }

            $existing = ParentLink::where('parent_id', $parent->id)->where('student_id', $student->id)->first();
            if ($existing?->status === ParentLink::STATUS_ACTIVE) {
                throw new FamilyException(FamilyException::ALREADY_LINKED, 'Déjà lié.');
            }

            $children = ParentLink::where('parent_id', $parent->id)->where('status', ParentLink::STATUS_ACTIVE)->count();
            if ($children >= (int) config('family.max_children', 6)) {
                throw new FamilyException(FamilyException::TOO_MANY_CHILDREN, 'Trop d\'enfants liés.');
            }
            $parents = ParentLink::where('student_id', $student->id)->where('status', ParentLink::STATUS_ACTIVE)->count();
            if ($parents >= (int) config('family.max_parents', 4)) {
                throw new FamilyException(FamilyException::TOO_MANY_PARENTS, 'Trop de parents liés.');
            }

            $attributes = [
                'status' => ParentLink::STATUS_ACTIVE,
                'consent_version' => $row->consent_version,
                'consented_at' => $row->consented_at,
                'linked_at' => Carbon::now(),
                'revoked_at' => null,
                'revoked_by' => null,
            ];
            $link = $existing
                ? tap($existing)->update($attributes)
                : ParentLink::create(['parent_id' => $parent->id, 'student_id' => $student->id, ...$attributes]);

            // Usage unique : le code meurt avec le lien qu'il a créé.
            $row->delete();

            return $link->fresh(['student']);
        });
    }

    /** @return Collection<int, ParentLink> les liens actifs d'un parent, enfants chargés. */
    public function childrenOf(User $parent): Collection
    {
        return ParentLink::with('student:id,first_name,last_name,grade,role')
            ->where('parent_id', $parent->id)
            ->where('status', ParentLink::STATUS_ACTIVE)
            ->orderBy('linked_at')
            ->get();
    }

    /** @return Collection<int, ParentLink> les liens actifs d'un élève, parents chargés. */
    public function parentsOf(User $student): Collection
    {
        return ParentLink::with('parent:id,first_name,last_name')
            ->where('student_id', $student->id)
            ->where('status', ParentLink::STATUS_ACTIVE)
            ->orderBy('linked_at')
            ->get();
    }

    /** La SEULE porte des lectures du parent : un lien actif, sinon 404. */
    public function activeLink(User $parent, int $studentId): ParentLink
    {
        $link = ParentLink::with('student')
            ->where('parent_id', $parent->id)
            ->where('student_id', $studentId)
            ->where('status', ParentLink::STATUS_ACTIVE)
            ->first();

        if ($link === null || $link->student === null || ! $link->student->isStudent()) {
            throw (new ModelNotFoundException)->setModel(ParentLink::class);
        }

        return $link;
    }

    public function revokeByParent(User $parent, int $studentId): void
    {
        $this->activeLink($parent, $studentId)->update([
            'status' => ParentLink::STATUS_REVOKED,
            'revoked_at' => Carbon::now(),
            'revoked_by' => 'parent',
        ]);
    }

    public function revokeByStudent(User $student, int $linkId): void
    {
        $link = ParentLink::with('parent')
            ->where('id', $linkId)
            ->where('student_id', $student->id)
            ->where('status', ParentLink::STATUS_ACTIVE)
            ->first();
        if ($link === null) {
            throw (new ModelNotFoundException)->setModel(ParentLink::class);
        }

        $link->update([
            'status' => ParentLink::STATUS_REVOKED,
            'revoked_at' => Carbon::now(),
            'revoked_by' => 'student',
        ]);

        // La rupture n'est jamais silencieuse : le parent est averti. Un échec
        // d'envoi ne rétablit pas le lien.
        try {
            $link->parent?->notify(new ParentLinkRevokedNotification($student));
        } catch (Throwable $e) {
            Log::warning('family.revoke_mail_failed', ['link' => $link->id, 'error' => $e->getMessage()]);
        }
    }

    public static function normalize(string $raw): string
    {
        return strtoupper((string) preg_replace('/[^A-Za-z0-9]/', '', $raw));
    }

    /** @return array{id: int, firstName: ?string, lastName: ?string} */
    public static function identity(User $user): array
    {
        return ['id' => $user->id, 'firstName' => $user->first_name, 'lastName' => $user->last_name];
    }

    private function freshCode(): string
    {
        do {
            $code = '';
            for ($i = 0; $i < self::CODE_LENGTH; $i++) {
                $code .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
            }
        } while (ParentLinkCode::where('code', $code)->exists());

        return $code;
    }
}
