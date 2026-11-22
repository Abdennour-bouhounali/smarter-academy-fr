<?php

namespace App\Domain\MathLab;

use App\Domain\Access\Features\FeatureAccessService;
use App\Domain\Access\Features\FeatureRegistry;
use App\Models\MathLabDocument;
use App\Models\User;
use DomainException;
use Illuminate\Support\Collection;

/**
 * Les documents du مختبر الرياضيات — le travail libre de l'élève.
 *
 * Même règle que le cahier (NotebookService) : toute lecture est filtrée par
 * `user_id`, qui vient de l'élève AUTHENTIFIÉ et jamais de la requête ; le
 * document d'autrui est « introuvable » plutôt qu'« interdit », pour ne pas
 * révéler son existence.
 *
 * Le serveur ne comprend pas `data` : c'est l'état d'un instrument, que seul
 * cet instrument sait lire. Il n'en vérifie que deux choses — l'instrument
 * existe (MathLabTools) et la taille reste dans sa borne. L'instrument d'un
 * document ne change jamais : un dessin ne devient pas un graphe.
 *
 * ── Accès et quota (« الوصول والحدود ») ─────────────────────────────────
 * Ouvrir, modifier ou copier un travail exige l'accès à SON instrument
 * (`math_lab.tool.<id>`) ; en CRÉER un — premier enregistrement ou copie —
 * consomme une unité `document_generation`, atomiquement avec la création
 * (FeatureAccessService::consume). Lister et supprimer restent toujours
 * permis : un instrument fermé ne confisque pas le travail déjà fait.
 * Les refus sont des FeatureAccessDenied (403), jamais des DomainException.
 */
class MathLabDocumentService
{
    public function __construct(private MathLabFileService $files, private FeatureAccessService $access) {}

    public const NOT_FOUND = 'math_lab_document_not_found';

    public const UNKNOWN_TOOL = 'math_lab_unknown_tool';

    public const TOO_LARGE = 'math_lab_document_too_large';

    public const UNKNOWN_ACTION = 'math_lab_unknown_action';

    /**
     * Le RÉSUMÉ d'un instrument voyage dans une LISTE : il doit rester
     * minuscule. Deux kilo-octets tiennent six expressions du grapheur, un
     * solide et ses dimensions, une équation et son pas courant — largement
     * ce qu'une carte dessine. Au-delà, on préfère aucun résumé (la carte a
     * un aperçu de repli) à une liste qui pèse.
     */
    public const MAX_SUMMARY_BYTES = 2_000;

    /** Ce qu'un geste GROUPÉ peut faire — jamais plus que ce qu'un geste seul fait. */
    public const BULK_ACTIONS = ['delete', 'favorite', 'unfavorite'];

    /** « Mes travaux » : sans `data`, du plus récent au plus ancien. */
    public function listFor(User $user, ?string $tool = null): Collection
    {
        return MathLabDocument::query()
            ->select(MathLabDocument::SUMMARY_COLUMNS)
            ->where('user_id', $user->id)
            // « ملفّ الدرس » d'un enseignant est un document de la سبّورة, mais il n'est PAS un travail du مختبر :
            // on l'ouvre depuis la leçon, il ne paraît jamais dans « أعمالي » (CLASS_SESSION.md §2ter).
            ->whereNotIn('id', \App\Models\TeacherLessonFile::query()->where('teacher_id', $user->id)->whereNotNull('math_lab_document_id')->select('math_lab_document_id'))
            ->when($tool, fn ($q) => $q->where('tool', $tool))
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get();
    }

    /**
     * Un travail à OUVRIR : le mien, et d'un instrument qui m'est ouvert.
     * `find()` seul ne vérifie que la propriété — il sert aussi à supprimer.
     */
    public function open(User $user, int $id): MathLabDocument
    {
        $document = $this->find($user, $id);
        $this->ensureTool($user, $document->tool);

        return $document;
    }

    /** L'accès à un instrument (403 FeatureAccessDenied), s'il est connu. */
    public function ensureTool(User $user, string $tool): void
    {
        if (MathLabTools::exists($tool)) {
            $this->access->ensure($user, FeatureRegistry::toolKey($tool));
        }
    }

    public function find(User $user, int $id): MathLabDocument
    {
        $document = MathLabDocument::query()
            ->where('user_id', $user->id)
            ->find($id);

        if (! $document) {
            throw new DomainException(self::NOT_FOUND);
        }

        return $document;
    }

    /**
     * @param array{tool: string, title: string, data: array, schemaVersion?: int} $attributes
     */
    public function create(User $user, array $attributes): MathLabDocument
    {
        $tool = $attributes['tool'];
        if (! MathLabTools::exists($tool)) {
            throw new DomainException(self::UNKNOWN_TOOL);
        }

        $bytes = $this->measure($tool, $attributes['data']);
        $this->ensureTool($user, $tool);

        return $this->access->consume($user, FeatureRegistry::MATH_LAB_DOCUMENTS, fn () => MathLabDocument::create([
            'user_id' => $user->id,
            'tool' => $tool,
            'title' => $this->cleanTitle($attributes['title']),
            'schema_version' => $attributes['schemaVersion'] ?? 1,
            'data' => $attributes['data'],
            'data_bytes' => $bytes,
            'summary' => $this->cleanSummary($attributes['summary'] ?? null),
            'is_favorite' => false,
        ]), $tool);
    }

    /**
     * Le titre et l'état — jamais l'instrument, jamais le propriétaire.
     *
     * @param array{title?: string, data?: array, schemaVersion?: int} $attributes
     */
    public function update(User $user, int $id, array $attributes): MathLabDocument
    {
        // Changer l'ÉTAT, c'est se servir de l'instrument ; renommer ou mettre
        // en favori, c'est ranger son travail — permis même instrument fermé.
        $document = array_key_exists('data', $attributes) ? $this->open($user, $id) : $this->find($user, $id);

        if (array_key_exists('title', $attributes)) {
            $document->title = $this->cleanTitle($attributes['title']);
        }
        if (array_key_exists('data', $attributes)) {
            $document->data_bytes = $this->measure($document->tool, $attributes['data']);
            $document->data = $attributes['data'];
        }
        if (array_key_exists('schemaVersion', $attributes)) {
            $document->schema_version = $attributes['schemaVersion'];
        }
        // Le résumé suit l'état : il arrive avec lui, à chaque sauvegarde.
        if (array_key_exists('summary', $attributes)) {
            $document->summary = $this->cleanSummary($attributes['summary']);
        }
        if (array_key_exists('isFavorite', $attributes)) {
            $document->is_favorite = (bool) $attributes['isFavorite'];
        }

        $document->save();

        return $document;
    }

    /**
     * Une COPIE d'un document à moi : même instrument, même état, même
     * résumé — un titre neuf, et jamais l'étoile de l'original (une copie
     * n'est pas encore un travail qu'on a choisi de garder sous la main).
     *
     * Les FICHIERS ne sont pas copiés : ils comptent dans le quota de
     * l'élève (MathLabFilePolicy), et dupliquer une سبّورة ne doit pas
     * dupliquer silencieusement ses octets. La copie s'ouvre sans eux.
     */
    public function duplicate(User $user, int $id, ?string $title = null): MathLabDocument
    {
        $source = $this->open($user, $id);

        return $this->access->consume($user, FeatureRegistry::MATH_LAB_DOCUMENTS, fn () => MathLabDocument::create([
            'user_id' => $user->id,
            'tool' => $source->tool,
            'title' => $this->cleanTitle($title ?? $source->title),
            'schema_version' => $source->schema_version,
            'data' => $source->data,
            'data_bytes' => $source->data_bytes,
            'summary' => $source->summary,
            'is_favorite' => false,
        ]), $source->tool);
    }

    /**
     * Le même geste sur PLUSIEURS documents — et sur les miens seulement :
     * `user_id` borne la requête, donc un identifiant qui ne m'appartient
     * pas ne fait rien du tout (ni erreur qui révélerait son existence, ni
     * effet). Rend le nombre de documents effectivement touchés.
     *
     * @param  int[]  $ids
     */
    public function bulk(User $user, array $ids, string $action): int
    {
        if (! in_array($action, self::BULK_ACTIONS, true)) {
            throw new DomainException(self::UNKNOWN_ACTION);
        }

        $ids = array_values(array_unique(array_map('intval', $ids)));
        $query = MathLabDocument::query()->where('user_id', $user->id)->whereIn('id', $ids);

        if ($action !== 'delete') {
            return $query->update(['is_favorite' => $action === 'favorite']);
        }

        // Les octets des fichiers partent AVEC leurs documents : les lignes
        // s'en vont en cascade, le disque a besoin qu'on le lui dise.
        $documents = $query->get();
        foreach ($documents as $document) {
            $this->files->deleteAllFor($document);
        }

        return MathLabDocument::query()->where('user_id', $user->id)->whereIn('id', $ids)->delete();
    }

    public function delete(User $user, int $id): void
    {
        $document = $this->find($user, $id);
        // Les lignes de fichiers partent en cascade ; leurs octets, ici.
        $this->files->deleteAllFor($document);
        $document->delete();
    }

    /** La taille de l'état, en octets de JSON — et le refus si elle dépasse la borne de l'outil. */
    private function measure(string $tool, array $data): int
    {
        $bytes = strlen((string) json_encode($data, JSON_UNESCAPED_UNICODE));
        if ($bytes > MathLabTools::maxBytes($tool)) {
            throw new DomainException(self::TOO_LARGE);
        }

        return $bytes;
    }

    /**
     * Le résumé tel qu'on le stocke : un objet, ou rien. On ne le lit pas —
     * on vérifie seulement qu'il est un objet JSON et qu'il reste minuscule.
     * Un résumé trop gros n'est pas une erreur : il est simplement ignoré,
     * et la carte retombe sur son aperçu de repli. Refuser la sauvegarde
     * ferait perdre le TRAVAIL pour une vignette.
     */
    private function cleanSummary(mixed $summary): ?array
    {
        if (! is_array($summary) || $summary === []) {
            return null;
        }
        $bytes = strlen((string) json_encode($summary, JSON_UNESCAPED_UNICODE));

        return $bytes > self::MAX_SUMMARY_BYTES ? null : $summary;
    }

    private function cleanTitle(string $title): string
    {
        $clean = trim((string) preg_replace('/\s+/u', ' ', $title));

        return $clean === '' ? 'Sans titre' : mb_substr($clean, 0, 160);
    }
}
