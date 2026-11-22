<?php

namespace App\Http\Controllers;

use App\Domain\Practice\AnswerImageStore;
use App\Domain\Practice\AnswerReviewService;
use App\Models\AnswerImage;
use App\Models\QuestionAttempt;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Les PHOTOS DE COPIE côté élève (prototype BEM, 2026-10-06) : joindre une
 * photo à l'étape ouverte, la retirer avant de répondre, la relire, ouvrir une
 * correction de l'enseignant. Les refus portent un CODE (le client choisit sa
 * phrase arabe) ; tout ce qui n'est pas à l'élève est 404, sans dire si cela
 * existe.
 */
class AnswerImageController extends Controller
{
    public function __construct(private AnswerImageStore $images, private AnswerReviewService $reviews) {}

    public function store(Request $request, string $attemptUuid): JsonResponse
    {
        $attempt = QuestionAttempt::where('attempt_uuid', $attemptUuid)->first();
        if ($attempt === null || $attempt->user_id !== $request->user()->id) {
            abort(404);
        }
        // La taille se revérifie dans le store (le code `image_too_large`) ;
        // ici seulement « un fichier », pour un 422 propre sinon.
        $request->validate(['image' => 'required|file']);

        try {
            $image = $this->images->attach($request->user(), $attempt, $request->file('image'));
        } catch (DomainException $e) {
            return $this->refuse($e);
        }

        return response()->json(['success' => true, 'image' => $image->toClient()], 201);
    }

    public function destroy(Request $request, string $uuid): JsonResponse
    {
        try {
            $this->images->detach($request->user(), $uuid);
        } catch (DomainException $e) {
            return $this->refuse($e);
        }

        return response()->json(['success' => true]);
    }

    /** Les octets, à l'élève propriétaire seulement. `?annotated=1` : la copie annotée par l'enseignant. */
    public function content(Request $request, string $uuid): BinaryFileResponse|JsonResponse
    {
        $image = AnswerImage::where('uuid', $uuid)->where('user_id', $request->user()->id)->first();

        return $this->serve($image, $request->boolean('annotated'));
    }

    /** Une correction de l'enseignant, ouverte depuis la cloche — en lecture seule. */
    public function review(Request $request, int $id): JsonResponse
    {
        try {
            $data = $this->reviews->forStudent($request->user(), $id);
        } catch (DomainException) {
            abort(404);
        }

        return response()->json(['success' => true] + $data);
    }

    /** Sert une photo du disque privé : jamais en cache partagé, jamais devinée par le navigateur. */
    public static function respond(AnswerImageStore $store, ?AnswerImage $image, bool $annotated): BinaryFileResponse|JsonResponse
    {
        $path = $image !== null && ! $image->isExpired() ? $store->absolutePath($image, $annotated) : null;
        if ($path === null) {
            return response()->json(['success' => false, 'code' => AnswerImageStore::NOT_FOUND], 404);
        }

        return response()->file($path, [
            'Content-Type' => 'image/jpeg',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store',
        ]);
    }

    private function serve(?AnswerImage $image, bool $annotated): BinaryFileResponse|JsonResponse
    {
        return self::respond($this->images, $image, $annotated);
    }

    private function refuse(DomainException $e): JsonResponse
    {
        $code = $e->getMessage();
        $status = $code === AnswerImageStore::NOT_FOUND ? 404 : 422;

        return response()->json(['success' => false, 'code' => $code, 'message' => $code], $status);
    }
}
