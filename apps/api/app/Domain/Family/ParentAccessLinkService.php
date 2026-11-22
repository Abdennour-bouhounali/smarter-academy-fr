<?php

namespace App\Domain\Family;

use App\Models\ParentAccessLink;
use App\Models\User;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * « رابط الوليّ » — le lien privé, SANS compte (PARENT_SPACE.md §2).
 *
 *  - L'élève le crée après avoir lu « ما سيراه وليّك » (le geste est le
 *    consentement), ou l'enseignant l'imprime en QR sur une « بطاقة الوليّ ».
 *    Un seul lien vivant par élève : en créer un révoque le précédent.
 *  - Le parent l'ouvre depuis WhatsApp ou en scannant le QR : il lit le
 *    rapport, rien d'autre. Il peut poser un code à 4 chiffres à la première
 *    ouverture ; ensuite le code est demandé (5 essais, puis 15 minutes).
 *  - L'élève voit combien de fois et quand le lien a été ouvert, et peut le
 *    révoquer. Un lien révoqué répond 410 `link_revoked`, un jeton inconnu
 *    404 `link_invalid`.
 */
class ParentAccessLinkService
{
    private const TOKEN_LENGTH = 32;

    private const OPEN_DEBOUNCE_MINUTES = 10;

    private const PIN_MAX_FAILURES = 5;

    private const PIN_LOCK_MINUTES = 15;

    private const PASS_DAYS = 30;

    public function current(User $student): ?ParentAccessLink
    {
        return ParentAccessLink::where('student_id', $student->id)->whereNull('revoked_at')->latest('id')->first();
    }

    /** Le lien de l'élève — celui qui existe, sinon un nouveau. Pour les cartes de l'enseignant. */
    public function ensure(User $student, string $by, ?User $creator = null): ParentAccessLink
    {
        return $this->current($student) ?? $this->create($student, true, $by, $creator);
    }

    /** Un NOUVEAU lien ; l'ancien cesse de fonctionner. */
    public function create(User $student, bool $consent, string $by, ?User $creator = null): ParentAccessLink
    {
        if (! $consent) {
            throw new FamilyException(FamilyException::CONSENT_REQUIRED, 'Le consentement est requis.');
        }

        return DB::transaction(function () use ($student, $by, $creator) {
            ParentAccessLink::where('student_id', $student->id)->whereNull('revoked_at')
                ->update(['revoked_at' => Carbon::now(), 'revoked_by' => 'system']);

            $token = Str::random(self::TOKEN_LENGTH);

            return ParentAccessLink::create([
                'student_id' => $student->id,
                'token_hash' => self::hash($token),
                'token_encrypted' => $token,
                'consent_version' => (string) config('family.consent_version'),
                'consented_at' => Carbon::now(),
                'created_by' => $by,
                'created_by_user_id' => $creator?->id,
            ]);
        });
    }

    public function revoke(User $student, string $by): void
    {
        ParentAccessLink::where('student_id', $student->id)->whereNull('revoked_at')
            ->update(['revoked_at' => Carbon::now(), 'revoked_by' => $by]);
    }

    /** Le lien d'un jeton présenté par un parent : actif, sinon une exception au motif clos. */
    public function resolve(string $token): ParentAccessLink
    {
        $link = strlen($token) === self::TOKEN_LENGTH
            ? ParentAccessLink::with('student')->where('token_hash', self::hash($token))->first()
            : null;

        if ($link === null || $link->student === null || ! $link->student->isStudent()) {
            throw new FamilyException(FamilyException::LINK_INVALID, 'Lien inconnu.', 404);
        }
        if (! $link->isActive()) {
            throw new FamilyException(FamilyException::LINK_REVOKED, 'Lien annulé.', 410);
        }

        return $link;
    }

    /** Une ouverture compte au plus une fois par tranche de 10 minutes. */
    public function recordOpen(ParentAccessLink $link): void
    {
        if ($link->last_opened_at === null || $link->last_opened_at->lt(Carbon::now()->subMinutes(self::OPEN_DEBOUNCE_MINUTES))) {
            $link->forceFill(['open_count' => $link->open_count + 1, 'last_opened_at' => Carbon::now()])->save();
        }
    }

    // ── Le code à 4 chiffres du parent ───────────────────────────────────

    /** Le parent pose le code — une seule fois ; ensuite seul un nouveau lien le retire. */
    public function setPin(ParentAccessLink $link, string $pin): string
    {
        if ($link->pin_hash !== null) {
            throw new FamilyException(FamilyException::PIN_ALREADY_SET, 'Code déjà posé.', 409);
        }
        $link->forceFill(['pin_hash' => Hash::make($pin), 'pin_failures' => 0, 'pin_locked_until' => null])->save();

        return $this->pass($link);
    }

    public function unlock(ParentAccessLink $link, string $pin): string
    {
        if ($link->pin_hash === null) {
            return $this->pass($link);
        }
        if ($link->pin_locked_until !== null && $link->pin_locked_until->isFuture()) {
            throw new FamilyException(FamilyException::PIN_LOCKED, 'Trop d\'essais.', 429);
        }
        if (! Hash::check($pin, $link->pin_hash)) {
            $failures = $link->pin_failures + 1;
            $locked = $failures >= self::PIN_MAX_FAILURES;
            $link->forceFill([
                'pin_failures' => $locked ? 0 : $failures,
                'pin_locked_until' => $locked ? Carbon::now()->addMinutes(self::PIN_LOCK_MINUTES) : null,
            ])->save();
            throw new FamilyException($locked ? FamilyException::PIN_LOCKED : FamilyException::PIN_WRONG, 'Code faux.', $locked ? 429 : 422);
        }
        $link->forceFill(['pin_failures' => 0, 'pin_locked_until' => null])->save();

        return $this->pass($link);
    }

    /** Sans code posé, tout porteur du lien lit ; avec un code, il faut un laissez-passer valide. */
    public function allows(ParentAccessLink $link, ?string $pass): bool
    {
        if ($link->pin_hash === null) {
            return true;
        }
        if (! $pass) {
            return false;
        }
        try {
            $data = json_decode(Crypt::decryptString($pass), true, 4, JSON_THROW_ON_ERROR);
        } catch (DecryptException|\JsonException) {
            return false;
        }

        return ($data['l'] ?? null) === $link->id
            && hash_equals(self::pinFingerprint($link), (string) ($data['p'] ?? ''))
            && (int) ($data['e'] ?? 0) > time();
    }

    // ── Ce que voient l'élève et l'enseignant ────────────────────────────

    public static function url(ParentAccessLink $link): string
    {
        return rtrim((string) config('app.frontend_url'), '/').'/w/'.$link->token_encrypted;
    }

    /** @return array<string, mixed> */
    public static function describe(ParentAccessLink $link): array
    {
        return [
            'url' => self::url($link),
            'createdAt' => $link->created_at?->toIso8601String(),
            'createdBy' => $link->created_by,
            'openCount' => (int) $link->open_count,
            'lastOpenedAt' => $link->last_opened_at?->toIso8601String(),
            'pinSet' => $link->pin_hash !== null,
        ];
    }

    private function pass(ParentAccessLink $link): string
    {
        // Le laissez-passer porte une empreinte du code : un nouveau code (nouveau lien) les annule tous.
        return Crypt::encryptString(json_encode([
            'l' => $link->id,
            'p' => self::pinFingerprint($link),
            'e' => time() + self::PASS_DAYS * 86400,
        ]));
    }

    private static function pinFingerprint(ParentAccessLink $link): string
    {
        return substr(hash('sha256', (string) $link->pin_hash), 0, 16);
    }

    private static function hash(string $token): string
    {
        return hash('sha256', $token);
    }
}
