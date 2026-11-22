<?php

namespace App\Domain\MathLab;

use App\Models\MathLabDocument;
use App\Models\MathLabFile;
use App\Models\User;
use DomainException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

/**
 * Les fichiers d'une سبّورة : ajouter, lister, télécharger, supprimer —
 * sous quota.
 *
 * ── Ce qu'on ne croit pas ────────────────────────────────────────────────
 * Ni le nom, ni l'extension, ni le type que le navigateur annonce : le type
 * est lu dans les OCTETS (finfo, puis une vérification par genre — en-tête
 * PNG/JPEG/WEBP, « %PDF- », un `<svg` sans script). La taille est celle du
 * fichier reçu. Le propriétaire est l'élève authentifié ; le document doit
 * être à lui (sinon « introuvable », comme partout dans le مختبر).
 *
 * ── Les quotas, atomiques ────────────────────────────────────────────────
 * Deux envois simultanés à 49 fichiers ne doivent pas en faire 51. Chaque
 * ajout se fait dans UNE transaction qui commence par verrouiller la ligne
 * de l'élève (`SELECT … FOR UPDATE`) : les ajouts d'un même élève passent
 * un par un, et les comptages — eux-mêmes verrouillants, donc lus à jour et
 * non dans un instantané plus ancien — précèdent l'insertion. Le deuxième
 * envoi compte 50, et refuse.
 *
 * ── Le disque et la base, ensemble ───────────────────────────────────────
 * Les octets sont écrits, puis la ligne ; si la ligne échoue, les octets sont
 * retirés. À la suppression, la ligne part dans la transaction, puis les
 * octets ; un disque récalcitrant est journalisé, jamais un fichier fantôme
 * en base.
 *
 * ── L'existant ───────────────────────────────────────────────────────────
 * Rien n'est jamais supprimé d'office : une سبّورة ou un élève au-dessus du
 * quota (données antérieures) garde tout, et ne peut simplement plus ajouter
 * tant qu'il n'est pas repassé dessous.
 */
class MathLabFileService
{
    public const DISK = 'local';

    public const NOT_FOUND = 'math_lab_file_not_found';

    public const TOO_LARGE = 'math_lab_file_too_large';

    public const UNSUPPORTED = 'math_lab_file_unsupported';

    public const BOARD_LIMIT = 'math_lab_board_file_limit';

    public const USER_LIMIT = 'math_lab_user_file_limit';

    public const UPLOAD_FAILED = 'math_lab_upload_failed';

    public function listFor(User $user, MathLabDocument $document): Collection
    {
        return MathLabFile::query()
            ->where('user_id', $user->id)
            ->where('document_id', $document->id)
            ->orderBy('id')
            ->get();
    }

    /**
     * Les compteurs que l'interface affiche — informatifs ; c'est `store` qui
     * fait foi, sous verrou.
     *
     * @return array{document: array{used: int, max: int}|null, user: array{used: int, max: int}, limits: array}
     */
    public function quotaFor(User $user, ?MathLabDocument $document = null): array
    {
        return [
            'document' => $document ? [
                'used' => MathLabFile::query()->where('document_id', $document->id)->count(),
                'max' => MathLabFilePolicy::MAX_FILES_PER_DOCUMENT,
            ] : null,
            'user' => [
                'used' => MathLabFile::query()->where('user_id', $user->id)->count(),
                'max' => MathLabFilePolicy::MAX_FILES_PER_USER,
            ],
            'limits' => MathLabFilePolicy::limits(),
        ];
    }

    public function find(User $user, int $id): MathLabFile
    {
        $file = MathLabFile::query()->where('user_id', $user->id)->find($id);
        if (! $file) {
            throw new DomainException(self::NOT_FOUND);
        }

        return $file;
    }

    /**
     * @throws DomainException TOO_LARGE | UNSUPPORTED | BOARD_LIMIT | USER_LIMIT | UPLOAD_FAILED
     */
    public function store(User $user, MathLabDocument $document, UploadedFile $upload): MathLabFile
    {
        if (! $upload->isValid()) {
            throw new DomainException(self::UPLOAD_FAILED);
        }
        $size = (int) $upload->getSize();
        if ($size <= 0) {
            throw new DomainException(self::UNSUPPORTED);
        }
        if ($size > MathLabFilePolicy::MAX_FILE_BYTES) {
            throw new DomainException(self::TOO_LARGE);
        }
        $type = $this->inspect($upload);

        return DB::transaction(function () use ($user, $document, $upload, $size, $type) {
            // Le mutex de l'élève : un ajout à la fois par compte.
            User::query()->whereKey($user->id)->lockForUpdate()->first();

            $inDocument = MathLabFile::query()->where('document_id', $document->id)->lockForUpdate()->count();
            if ($inDocument >= MathLabFilePolicy::MAX_FILES_PER_DOCUMENT) {
                throw new DomainException(self::BOARD_LIMIT);
            }
            $inAccount = MathLabFile::query()->where('user_id', $user->id)->lockForUpdate()->count();
            if ($inAccount >= MathLabFilePolicy::MAX_FILES_PER_USER) {
                throw new DomainException(self::USER_LIMIT);
            }

            $directory = "math-lab/{$user->id}";
            $name = Str::uuid()->toString().'.'.$type['extension'];
            $path = Storage::disk(self::DISK)->putFileAs($directory, $upload, $name);
            if (! $path) {
                throw new DomainException(self::UPLOAD_FAILED);
            }

            try {
                return MathLabFile::create([
                    'user_id' => $user->id,
                    'document_id' => $document->id,
                    'kind' => $type['kind'],
                    'original_name' => $this->cleanName($upload->getClientOriginalName(), $type['extension']),
                    'mime_type' => $type['mime'],
                    'size' => $size,
                    'disk_path' => $path,
                ]);
            } catch (Throwable $e) {
                // Pas de ligne → pas d'octets orphelins.
                Storage::disk(self::DISK)->delete($path);
                throw new DomainException(self::UPLOAD_FAILED, 0, $e);
            }
        });
    }

    public function delete(User $user, int $id): void
    {
        $file = $this->find($user, $id);
        DB::transaction(fn () => $file->delete());
        $this->deleteBytes($file);
    }

    /** À la suppression d'un document : ses lignes partent en cascade, ses octets ici. */
    public function deleteAllFor(MathLabDocument $document): void
    {
        MathLabFile::query()->where('document_id', $document->id)->get()->each(fn ($f) => $this->deleteBytes($f));
    }

    /** Le chemin absolu des octets, pour les servir. */
    public function absolutePath(MathLabFile $file): string
    {
        return Storage::disk(self::DISK)->path($file->disk_path);
    }

    public function exists(MathLabFile $file): bool
    {
        return Storage::disk(self::DISK)->exists($file->disk_path);
    }

    private function deleteBytes(MathLabFile $file): void
    {
        try {
            Storage::disk(self::DISK)->delete($file->disk_path);
        } catch (Throwable $e) {
            Log::warning('math-lab: octets non supprimés', ['path' => $file->disk_path, 'error' => $e->getMessage()]);
        }
    }

    /**
     * Le type réel du fichier, ou UNSUPPORTED.
     *
     * @return array{mime: string, kind: string, extension: string}
     */
    private function inspect(UploadedFile $upload): array
    {
        $claimed = strtolower($upload->getClientOriginalExtension());
        if (! in_array($claimed, MathLabFilePolicy::EXTENSIONS, true)) {
            throw new DomainException(self::UNSUPPORTED);
        }

        $path = $upload->getRealPath();
        $head = (string) @file_get_contents($path, false, null, 0, 4096);
        $mime = (string) $upload->getMimeType(); // finfo, sur le contenu

        // Un SVG sans prologue XML est parfois lu « text/plain » ou « text/xml » : on regarde la balise.
        if ($claimed === 'svg' && in_array($mime, ['text/plain', 'text/xml', 'application/xml', 'image/svg+xml', 'image/svg'], true)) {
            if (stripos($head, '<svg') !== false && ! preg_match('/<script|javascript:|\son[a-z]+\s*=/i', $head.(string) @file_get_contents($path))) {
                return ['mime' => 'image/svg+xml', 'kind' => 'svg', 'extension' => 'svg'];
            }
            throw new DomainException(self::UNSUPPORTED);
        }

        $type = MathLabFilePolicy::TYPES[$mime] ?? null;
        if (! $type) {
            throw new DomainException(self::UNSUPPORTED);
        }

        $genuine = match ($type['kind']) {
            'pdf' => str_starts_with($head, '%PDF-'),
            'image' => $this->isGenuineImage($path, $mime),
            default => false,
        };
        if (! $genuine) {
            throw new DomainException(self::UNSUPPORTED);
        }

        return ['mime' => $mime, 'kind' => $type['kind'], 'extension' => $type['extension']];
    }

    private function isGenuineImage(string $path, string $mime): bool
    {
        $info = @getimagesize($path);
        if (! is_array($info) || empty($info['mime'])) {
            return false;
        }

        return $info['mime'] === $mime;
    }

    private function cleanName(string $name, string $extension): string
    {
        $base = trim((string) preg_replace('/[\\\\\/:*?"<>|\x00-\x1F]+/u', ' ', pathinfo($name, PATHINFO_FILENAME)));
        $base = $base === '' ? 'fichier' : mb_substr($base, 0, 120);

        return "{$base}.{$extension}";
    }
}
