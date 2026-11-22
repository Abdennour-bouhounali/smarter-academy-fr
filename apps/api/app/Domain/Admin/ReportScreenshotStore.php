<?php

namespace App\Domain\Admin;

use App\Models\StudentReport;
use DomainException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

/**
 * La CAPTURE D'ÉCRAN d'un signalement — la zone fautive encadrée par
 * l'ambassadeur, brûlée dans l'image côté navigateur.
 *
 * Même prudence que les pièces jointes du مختبر (MathLabFileService) : disque
 * PRIVÉ, type lu sur le CONTENU (finfo) puis confirmé par getimagesize, nom
 * tiré au hasard. Jamais de SVG : une capture est un raster.
 */
class ReportScreenshotStore
{
    public const DISK = 'local';

    /** 2 Mo — une capture WebP de page entière pèse quelques centaines de Ko. */
    public const MAX_KILOBYTES = 2048;

    /** @var array<string, string> type MIME → extension */
    public const TYPES = [
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'image/webp' => 'webp',
    ];

    public const UNSUPPORTED = 'La capture doit être une image PNG, JPEG ou WebP.';

    /** Enregistre les octets et rend le chemin sur le disque. */
    public function store(StudentReport $report, UploadedFile $upload): string
    {
        $mime = (string) $upload->getMimeType(); // finfo, sur le contenu
        $extension = self::TYPES[$mime] ?? null;
        $info = @getimagesize((string) $upload->getRealPath());

        if ($extension === null || ! is_array($info) || ($info['mime'] ?? null) !== $mime) {
            throw new DomainException(self::UNSUPPORTED);
        }

        $path = Storage::disk(self::DISK)->putFileAs("reports/{$report->id}", $upload, Str::uuid()->toString().'.'.$extension);
        if (! $path) {
            throw new DomainException('La capture n\'a pas pu être enregistrée.');
        }

        return $path;
    }

    public function exists(?string $path): bool
    {
        return $path !== null && Storage::disk(self::DISK)->exists($path);
    }

    public function absolutePath(string $path): string
    {
        return Storage::disk(self::DISK)->path($path);
    }

    public function mimeOf(string $path): string
    {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        return array_search($extension, self::TYPES, true) ?: 'application/octet-stream';
    }

    public function delete(?string $path): void
    {
        if ($path === null) {
            return;
        }
        try {
            Storage::disk(self::DISK)->delete($path);
        } catch (Throwable $e) {
            Log::warning('reports: capture non supprimée', ['path' => $path, 'error' => $e->getMessage()]);
        }
    }
}
