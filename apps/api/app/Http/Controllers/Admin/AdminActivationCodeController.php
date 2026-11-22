<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Access\ActivationCodes\ActivationCodeGenerator;
use App\Domain\Admin\ActivationCodeAdminService;
use App\Domain\Admin\ActivityLogger;
use App\Http\Controllers\Controller;
use App\Models\ActivationCode;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * Les codes d'activation, côté administration.
 *
 * Toute la protection vient des routes : ce contrôleur vit derrière
 * auth:sanctum + account.active + can:admin. Un élève n'atteint donc jamais
 * ces méthodes, et un administrateur suspendu non plus.
 *
 * ── Les codes en clair ne sortent qu'UNE fois ───────────────────────────
 * `generate` est le seul point d'entrée qui rend des codes lisibles, et il
 * ne rend que ceux qu'il vient de créer. Aucune autre méthode ne peut les
 * relire : la base n'en garde que l'empreinte. C'est pourquoi il n'existe
 * volontairement pas de route « réafficher les codes d'un lot » — elle
 * n'aurait rien à afficher.
 */
class AdminActivationCodeController extends Controller
{
    public function __construct(
        private ActivationCodeAdminService $codes,
        private ActivationCodeGenerator $generator,
    ) {}

    public function index(Request $request)
    {
        $filters = $request->query();
        $codes = $this->codes->list($filters);

        return response()->json([
            'success' => true,
            'codes' => $codes->through(fn (ActivationCode $code) => $this->codes->serialize($code)),
            'counts' => $this->codes->counts($filters),
        ]);
    }

    public function batches(Request $request)
    {
        $batches = $this->codes->batches($request->query());

        return response()->json([
            'success' => true,
            'batches' => $batches->through(fn ($batch) => $this->codes->serializeBatch($batch)),
        ]);
    }

    public function show(int $id)
    {
        try {
            $detail = $this->codes->show($id);
        } catch (DomainException) {
            abort(404);
        }

        return response()->json(['success' => true, ...$detail]);
    }

    /**
     * Produit un lot, et rend ses codes EN CLAIR — la seule fois.
     *
     * La réponse est explicitement marquée `codesShownOnce` pour que
     * l'interface n'ait pas à deviner qu'elle tient quelque chose
     * d'irrécupérable, et qu'elle le dise à l'administrateur avant qu'il ne
     * ferme la fenêtre.
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:120',
            'quantity' => 'required|integer|min:1|max:'.ActivationCodeGenerator::MAX_QUANTITY,
            // Les deux formes de durée d'accès. Exclusives — la règle est
            // tenue par le générateur, qui rend un message explicite.
            'accessDays' => 'nullable|integer|min:1|max:3650',
            'accessEndsAt' => 'nullable|date',
            'redeemBy' => 'nullable|date',
            'notes' => 'nullable|string|max:2000',
            // L'OFFRE que chaque code active — vente en nombre à une école ou
            // une classe. Facultatif : sans elle, le lot ouvre le droit
            // premium élève classique, comme avant.
            'planVersionId' => 'nullable|integer|min:1',
            // La capacité que chaque code ouvre — obligatoire pour une offre
            // par sièges (« 10 codes × 30 élèves »), figée sur le lot.
            'studentSeats' => 'nullable|integer|min:1|max:100000',
        ], [
            'label.required' => 'Donnez un nom à ce lot (il sert à le retrouver).',
            'quantity.max' => 'Un lot ne peut pas dépasser '.ActivationCodeGenerator::MAX_QUANTITY.' codes.',
        ]);

        try {
            $result = $this->generator->generateBatch($request->user(), [
                'label' => $validated['label'],
                'quantity' => (int) $validated['quantity'],
                'accessDays' => $validated['accessDays'] ?? null,
                'accessEndsAt' => isset($validated['accessEndsAt']) ? Carbon::parse($validated['accessEndsAt']) : null,
                'redeemBy' => isset($validated['redeemBy']) ? Carbon::parse($validated['redeemBy']) : null,
                'notes' => $validated['notes'] ?? null,
                'planVersionId' => isset($validated['planVersionId']) ? (int) $validated['planVersionId'] : null,
                'studentSeatLimit' => isset($validated['studentSeats']) ? (int) $validated['studentSeats'] : null,
            ]);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'batch' => $this->codes->serializeBatch($result['batch']),
            'codes' => $result['codes'],
            'codesShownOnce' => true,
        ], 201);
    }

    public function revoke(Request $request, int $id)
    {
        $validated = $request->validate([
            // Obligatoire, à la différence de la dérogation : révoquer une
            // carte vendue ferme un accès payé. Six mois plus tard, « pourquoi
            // ce code a-t-il été révoqué ? » doit avoir une réponse écrite.
            'reason' => 'required|string|max:255',
        ], [
            'reason.required' => 'Indiquez le motif de la révocation.',
        ]);

        try {
            $code = $this->codes->revoke($request->user(), $id, $validated['reason']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'code' => $this->codes->serialize($code)]);
    }

    public function revokeBatch(Request $request, int $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255',
        ], [
            'reason.required' => 'Indiquez le motif de la révocation.',
        ]);

        try {
            $count = $this->codes->revokeBatch($request->user(), $id, $validated['reason']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'revoked' => $count]);
    }

    /**
     * L'export CSV — des métadonnées, jamais des codes.
     *
     * En FLUX (`streamDownload`) : un export de dix mille lignes ne doit pas
     * se construire en mémoire avant d'être envoyé.
     *
     * Journalisé, comme une révocation : sortir la liste des codes vendus de
     * l'application est un geste qu'on doit pouvoir dater et attribuer, même
     * si ce qui en sort n'est pas secret.
     */
    public function export(Request $request)
    {
        $request->validate([
            'status' => ['nullable', Rule::in(ActivationCode::STATUSES)],
        ]);

        $filters = $request->query();

        app(ActivityLogger::class)->log(
            $request->user(),
            ActivityLogger::ACTIVATION_CODES_EXPORTED,
            'activation_code_batch',
            $filters['batch'] ?? null,
            null,
            ['filters' => array_intersect_key($filters, array_flip(['status', 'batch', 'search', 'student']))],
        );

        $rows = $this->codes->exportRows($filters);
        $filename = 'codes-activation-'.Carbon::now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            // Le BOM : sans lui, Excel lit un CSV UTF-8 comme du latin-1 et
            // les accents des motifs de révocation deviennent illisibles.
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ActivationCodeAdminService::EXPORT_HEADER);
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
