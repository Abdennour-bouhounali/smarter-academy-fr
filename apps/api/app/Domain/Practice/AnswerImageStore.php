<?php

namespace App\Domain\Practice;

use App\Models\AnswerImage;
use App\Models\QuestionAttempt;
use App\Models\User;
use DomainException;
use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

/**
 * Les PHOTOS DE COPIE d'une étape d'examen (propriétaire, 2026-10-06) — des
 * photos de MINEURS, d'où la prudence :
 *
 *  - disque PRIVÉ (`local` = storage/app/private), jamais d'URL publique ; les
 *    octets passent par AnswerImageController, qui vérifie qui demande ;
 *  - type lu sur le CONTENU (finfo + getimagesize), jamais sur le nom ;
 *  - l'image est RÉENCODÉE en JPEG par GD : l'orientation EXIF est appliquée
 *    puis TOUTES les métadonnées (EXIF, GPS, appareil) disparaissent, puisque
 *    seuls les pixels sont réécrits ; le plus grand côté est ramené à 1600 px ;
 *  - 5 Mo au plus avant compression, 3 photos par étape, 12 mois de garde
 *    (`expires_at`, purgé par `smarter:answer-images:purge`).
 *
 * L'annotation de l'enseignant (stylo rouge) suit le même chemin et s'écrit À
 * CÔTÉ de l'original, qui n'est jamais modifié.
 */
class AnswerImageStore
{
    public const DISK = 'local';

    public const MAX_KILOBYTES = 5120;

    public const MAX_PER_STEP = 3;

    public const MAX_SIDE = 1600;

    public const KEEP_MONTHS = 12;

    public const JPEG_QUALITY = 82;

    /** @var string[] */
    public const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    // Codes stables : le client choisit sa phrase arabe sur le code.
    public const UNSUPPORTED = 'image_unsupported';

    public const TOO_LARGE = 'image_too_large';

    public const LIMIT_REACHED = 'image_limit_reached';

    public const LOCKED = 'answer_locked';

    public const NOT_FOUND = 'image_not_found';

    /** Joint une photo à une étape NON encore répondue de l'élève. */
    public function attach(User $student, QuestionAttempt $attempt, UploadedFile $upload): AnswerImage
    {
        if ($attempt->user_id !== $student->id) {
            throw new DomainException(self::NOT_FOUND);
        }
        // Une étape répondue est verrouillée — ses photos aussi.
        if ($attempt->isAnswered()) {
            throw new DomainException(self::LOCKED);
        }
        if (AnswerImage::where('question_attempt_id', $attempt->id)->count() >= self::MAX_PER_STEP) {
            throw new DomainException(self::LIMIT_REACHED);
        }

        $uuid = Str::uuid()->toString();
        [$path, $width, $height, $size] = $this->encode($upload, "answer-images/{$student->id}/{$uuid}.jpg");

        return AnswerImage::create([
            'uuid' => $uuid,
            'question_attempt_id' => $attempt->id,
            'user_id' => $student->id,
            'disk_path' => $path,
            'width' => $width,
            'height' => $height,
            'size' => $size,
            'expires_at' => now()->addMonths(self::KEEP_MONTHS),
        ]);
    }

    /** Retire une photo — seulement avant la réponse (ensuite, elle fait partie de la copie). */
    public function detach(User $student, string $uuid): void
    {
        $image = AnswerImage::where('uuid', $uuid)->where('user_id', $student->id)->first();
        if ($image === null) {
            throw new DomainException(self::NOT_FOUND);
        }
        if ($image->questionAttempt?->isAnswered()) {
            throw new DomainException(self::LOCKED);
        }
        $this->deleteFiles($image);
        $image->delete();
    }

    /** L'annotation de l'enseignant : une image composée côté navigateur (photo + traits). */
    public function annotate(User $teacher, AnswerImage $image, UploadedFile $upload): AnswerImage
    {
        $previous = $image->annotation_path;
        [$path] = $this->encode($upload, "answer-images/{$image->user_id}/{$image->uuid}-annotated-".Str::random(8).'.jpg');
        $image->update(['annotation_path' => $path, 'annotated_by' => $teacher->id, 'annotated_at' => now()]);
        if ($previous !== null && $previous !== $path) {
            $this->deletePath($previous);
        }

        return $image->fresh();
    }

    public function absolutePath(AnswerImage $image, bool $annotated): ?string
    {
        $path = $annotated && $image->annotation_path ? $image->annotation_path : $image->disk_path;

        return Storage::disk(self::DISK)->exists($path) ? Storage::disk(self::DISK)->path($path) : null;
    }

    public function deleteFiles(AnswerImage $image): void
    {
        $this->deletePath($image->disk_path);
        $this->deletePath($image->annotation_path);
    }

    /** Efface les photos dont la garde (12 mois) est échue, et les dossiers des comptes supprimés. Rend le nombre de photos effacées. */
    public function purgeExpired(): int
    {
        $count = 0;
        AnswerImage::where('expires_at', '<', now())->orderBy('id')->chunkById(200, function ($images) use (&$count) {
            foreach ($images as $image) {
                $this->deleteFiles($image);
                $image->delete();
                $count++;
            }
        });

        // Un compte supprimé emporte ses lignes (cascade) mais pas ses
        // fichiers : le dossier d'un élève qui n'existe plus est effacé ici.
        $disk = Storage::disk(self::DISK);
        foreach ($disk->directories('answer-images') as $directory) {
            $userId = (int) basename($directory);
            if ($userId > 0 && ! User::whereKey($userId)->exists()) {
                $disk->deleteDirectory($directory);
            }
        }

        return $count;
    }

    /**
     * Réencode l'image téléversée en JPEG sans métadonnées.
     *
     * @return array{0: string, 1: int, 2: int, 3: int} [chemin, largeur, hauteur, octets]
     */
    private function encode(UploadedFile $upload, string $path): array
    {
        if (! $upload->isValid()) {
            throw new DomainException(self::UNSUPPORTED);
        }
        if ($upload->getSize() > self::MAX_KILOBYTES * 1024) {
            throw new DomainException(self::TOO_LARGE);
        }
        $mime = (string) $upload->getMimeType(); // finfo, sur le contenu
        $real = (string) $upload->getRealPath();
        $info = @getimagesize($real);
        if (! in_array($mime, self::TYPES, true) || ! is_array($info) || ($info['mime'] ?? null) !== $mime) {
            throw new DomainException(self::UNSUPPORTED);
        }
        // Une « bombe » de décompression : refusée avant d'allouer les pixels.
        if ($info[0] < 1 || $info[1] < 1 || $info[0] * $info[1] > 40_000_000) {
            throw new DomainException(self::UNSUPPORTED);
        }

        $source = @imagecreatefromstring((string) file_get_contents($real));
        if (! $source instanceof GdImage) {
            throw new DomainException(self::UNSUPPORTED);
        }
        $source = $this->orient($source, $mime === 'image/jpeg' ? $real : null);

        $w = imagesx($source);
        $h = imagesy($source);
        $scale = min(1, self::MAX_SIDE / max($w, $h));
        $tw = max(1, (int) round($w * $scale));
        $th = max(1, (int) round($h * $scale));
        $canvas = imagecreatetruecolor($tw, $th);
        // Fond blanc : une capture PNG transparente reste lisible en JPEG.
        imagefill($canvas, 0, 0, imagecolorallocate($canvas, 255, 255, 255));
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $tw, $th, $w, $h);
        imagedestroy($source);

        ob_start();
        imagejpeg($canvas, null, self::JPEG_QUALITY);
        $bytes = (string) ob_get_clean();
        imagedestroy($canvas);

        if (! Storage::disk(self::DISK)->put($path, $bytes)) {
            throw new DomainException(self::UNSUPPORTED);
        }

        return [$path, $tw, $th, strlen($bytes)];
    }

    /** Applique l'orientation EXIF d'une photo de téléphone (avant que l'EXIF ne disparaisse). */
    private function orient(GdImage $image, ?string $jpegPath): GdImage
    {
        if ($jpegPath === null || ! function_exists('exif_read_data')) {
            return $image;
        }
        $exif = @exif_read_data($jpegPath);
        $angle = match ((int) ($exif['Orientation'] ?? 1)) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };
        if ($angle === 0) {
            return $image;
        }
        $rotated = imagerotate($image, $angle, 0);
        if ($rotated instanceof GdImage) {
            imagedestroy($image);

            return $rotated;
        }

        return $image;
    }

    private function deletePath(?string $path): void
    {
        if ($path === null) {
            return;
        }
        try {
            Storage::disk(self::DISK)->delete($path);
        } catch (Throwable $e) {
            Log::warning('answer-images: fichier non supprimé', ['path' => $path, 'error' => $e->getMessage()]);
        }
    }
}
