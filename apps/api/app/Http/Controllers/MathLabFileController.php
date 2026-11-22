<?php

namespace App\Http\Controllers;

use App\Domain\MathLab\MathLabDocumentService;
use App\Domain\MathLab\MathLabFileService;
use App\Models\MathLabFile;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Les fichiers d'une سبّورة, côté HTTP. Le service décide ; ici on traduit
 * les refus en statuts et en CODES (le client choisit sa phrase arabe sur
 * le code, jamais sur le texte) : 404 document ou fichier d'autrui, 422 pour
 * tout refus de politique (taille, type, quota), 500 pour une panne d'écriture.
 */
class MathLabFileController extends Controller
{
    public function __construct(private MathLabFileService $files, private MathLabDocumentService $documents) {}

    public function index(Request $request, int $documentId): JsonResponse
    {
        try {
            $document = $this->documents->find($request->user(), $documentId);
        } catch (DomainException $e) {
            return $this->refuse($e, 404);
        }

        return response()->json([
            'success' => true,
            'files' => $this->files->listFor($request->user(), $document)->map(fn ($f) => self::serialize($f))->all(),
            'quota' => $this->files->quotaFor($request->user(), $document),
        ]);
    }

    /** Les compteurs de l'élève seul : une سبّورة neuve n'a pas encore de document. */
    public function quota(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'quota' => $this->files->quotaFor($request->user(), null)]);
    }

    public function store(Request $request, int $documentId): JsonResponse
    {
        $user = $request->user();
        try {
            $document = $this->documents->find($user, $documentId);
        } catch (DomainException $e) {
            return $this->refuse($e, 404);
        }

        // Joindre un fichier, c'est se servir de l'instrument : 403 s'il est fermé.
        $this->documents->ensureTool($user, $document->tool);

        $request->validate(['file' => 'required|file']);

        try {
            $file = $this->files->store($user, $document, $request->file('file'));
        } catch (DomainException $e) {
            return $this->refuse($e, $e->getMessage() === MathLabFileService::UPLOAD_FAILED ? 500 : 422, $this->files->quotaFor($user, $document));
        }

        return response()->json([
            'success' => true,
            'file' => self::serialize($file),
            'quota' => $this->files->quotaFor($user, $document),
        ], 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        try {
            $file = $this->files->find($user, $id);
            $this->files->delete($user, $id);
        } catch (DomainException $e) {
            return $this->refuse($e, 404);
        }

        return response()->json([
            'success' => true,
            'quota' => $this->files->quotaFor($user, $file->document),
        ]);
    }

    /** Les octets, au propriétaire seulement — toujours en pièce jointe, jamais rendus par le navigateur. */
    public function content(Request $request, int $id): BinaryFileResponse|JsonResponse
    {
        try {
            $file = $this->files->find($request->user(), $id);
        } catch (DomainException $e) {
            return $this->refuse($e, 404);
        }
        if (! $this->files->exists($file)) {
            return response()->json(['success' => false, 'code' => MathLabFileService::NOT_FOUND, 'message' => MathLabFileService::NOT_FOUND], 404);
        }

        return response()->file($this->files->absolutePath($file), [
            'Content-Type' => $file->mime_type,
            'Content-Disposition' => 'attachment; filename="file.'.pathinfo($file->disk_path, PATHINFO_EXTENSION).'"; filename*=UTF-8\'\''.rawurlencode($file->original_name),
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, max-age=0',
        ]);
    }

    public static function serialize(MathLabFile $file): array
    {
        return [
            'id' => $file->id,
            'documentId' => $file->document_id,
            'kind' => $file->kind,
            'name' => $file->original_name,
            'mimeType' => $file->mime_type,
            'size' => (int) $file->size,
            'createdAt' => $file->created_at?->toIso8601String(),
        ];
    }

    private function refuse(DomainException $e, int $status, ?array $quota = null): JsonResponse
    {
        $body = ['success' => false, 'code' => $e->getMessage(), 'message' => $e->getMessage()];
        if ($quota) {
            $body['quota'] = $quota;
        }

        return response()->json($body, $status);
    }
}
