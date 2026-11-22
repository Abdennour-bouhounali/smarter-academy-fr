<?php

namespace App\Http\Controllers;

use App\Domain\MathLab\MathLabDocumentService;
use App\Domain\MathLab\MathLabFileService;
use App\Models\MathLabDocument;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Les documents du مختبر الرياضيات, côté HTTP. Le service décide ; ici on
 * valide la forme, on traduit les refus en statuts (404 document d'autrui ou
 * inexistant, 422 instrument inconnu ou état trop lourd) et on sérialise.
 *
 * Le client parle des CODES, jamais du texte : `code` est ce qu'il lit pour
 * choisir sa phrase arabe (voir apiMessage.js) ; `message` n'est qu'une aide
 * au débogage dans l'onglet réseau.
 */
class MathLabDocumentController extends Controller
{
    public function __construct(private MathLabDocumentService $documents, private MathLabFileService $files) {}

    public function index(Request $request): JsonResponse
    {
        $params = $request->validate([
            'tool' => 'nullable|string|max:40',
        ]);

        $documents = $this->documents->listFor($request->user(), $params['tool'] ?? null);

        return response()->json([
            'success' => true,
            'documents' => $documents->map(fn ($d) => $this->serialize($d, false))->all(),
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $document = $this->documents->open($request->user(), $id);
        } catch (DomainException $e) {
            return $this->refuse($e, 404);
        }

        // Les fichiers et les quotas viennent avec le document : ouvrir une
        // سبّورة est UN appel, et l'interface affiche des compteurs déjà justes.
        return response()->json([
            'success' => true,
            'document' => $this->serialize($document, true),
            'files' => $this->files->listFor($request->user(), $document)->map(fn ($f) => MathLabFileController::serialize($f))->all(),
            'quota' => $this->files->quotaFor($request->user(), $document),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tool' => 'required|string|max:40',
            'title' => 'required|string|max:160',
            'schemaVersion' => 'nullable|integer|min:1|max:65535',
            'data' => 'required|array',
            // Le résumé que l'instrument fait de son état — ce que « أعمالي »
            // dessine. Facultatif : un instrument qui n'en produit pas, ou un
            // client plus ancien, enregistre exactement comme avant.
            'summary' => 'nullable|array',
        ]);

        try {
            $document = $this->documents->create($request->user(), $validated);
        } catch (DomainException $e) {
            return $this->refuse($e, 422);
        }

        return response()->json(['success' => true, 'document' => $this->serialize($document, true)], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:160',
            'schemaVersion' => 'sometimes|integer|min:1|max:65535',
            'data' => 'sometimes|array',
            'summary' => 'sometimes|nullable|array',
            'isFavorite' => 'sometimes|boolean',
        ]);

        try {
            $document = $this->documents->update($request->user(), $id, $validated);
        } catch (DomainException $e) {
            return $this->refuse($e, $e->getMessage() === MathLabDocumentService::NOT_FOUND ? 404 : 422);
        }

        // Sans `data` : la réponse d'une sauvegarde reste légère, le client
        // possède déjà l'état qu'il vient d'envoyer.
        return response()->json(['success' => true, 'document' => $this->serialize($document, false)]);
    }

    /**
     * « نسخة » : une copie de MON document, prête à diverger de l'original.
     * Le titre vient du client (« نسخة من … », dans sa langue) ; à défaut,
     * c'est celui de l'original.
     */
    public function duplicate(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate(['title' => 'sometimes|string|max:160']);

        try {
            $document = $this->documents->duplicate($request->user(), $id, $validated['title'] ?? null);
        } catch (DomainException $e) {
            return $this->refuse($e, 404);
        }

        return response()->json(['success' => true, 'document' => $this->serialize($document, false)], 201);
    }

    /**
     * Le même geste sur une SÉLECTION. La propriété est tenue par le service
     * (`where user_id`), pas par le client : une liste d'identifiants qui ne
     * sont pas à moi ne supprime rien.
     */
    public function bulk(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1|max:200',
            'ids.*' => 'integer',
            'action' => ['required', Rule::in(MathLabDocumentService::BULK_ACTIONS)],
        ]);

        try {
            $count = $this->documents->bulk($request->user(), $validated['ids'], $validated['action']);
        } catch (DomainException $e) {
            return $this->refuse($e, 422);
        }

        return response()->json(['success' => true, 'count' => $count]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $this->documents->delete($request->user(), $id);
        } catch (DomainException $e) {
            return $this->refuse($e, 404);
        }

        return response()->json(['success' => true]);
    }

    private function refuse(DomainException $e, int $status): JsonResponse
    {
        return response()->json(['success' => false, 'code' => $e->getMessage(), 'message' => $e->getMessage()], $status);
    }

    private function serialize(MathLabDocument $document, bool $withData): array
    {
        $payload = [
            'id' => $document->id,
            'tool' => $document->tool,
            'title' => $document->title,
            'schemaVersion' => (int) $document->schema_version,
            'dataBytes' => (int) $document->data_bytes,
            'summary' => $document->summary,
            'isFavorite' => (bool) $document->is_favorite,
            'createdAt' => $document->created_at?->toIso8601String(),
            'updatedAt' => $document->updated_at?->toIso8601String(),
        ];
        if ($withData) {
            $payload['data'] = $document->data;
        }

        return $payload;
    }
}
