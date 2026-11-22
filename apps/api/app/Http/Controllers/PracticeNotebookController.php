<?php

namespace App\Http\Controllers;

use App\Domain\Practice\NotebookPresenter;
use App\Domain\Practice\NotebookService;
use App\Models\NotebookNote;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Le carnet, côté HTTP. Le service décide ; ici on valide la forme, on
 * traduit les refus en statuts (422 contexte incohérent, 404 note d'autrui)
 * et on sérialise.
 */
class PracticeNotebookController extends Controller
{
    private const CONTEXT_RELATIONS = ['lesson:id,code,title', 'learningPoint:id,code,title'];

    public function __construct(private NotebookService $notebook) {}

    /**
     * La liste — deux lectures du même point d'entrée :
     *  - sans `page` : toutes les notes (hors archives), comme avant ;
     *  - avec `page`/`view`/`q`/filtres : une page du cahier, avec le total,
     *    les compteurs de l'en-tête et les leçons représentées.
     */
    public function index(Request $request)
    {
        $params = $request->validate([
            'q' => 'nullable|string|max:120',
            'view' => ['nullable', Rule::in(NotebookService::VIEWS)],
            'lessonCode' => 'nullable|string|max:120',
            'learningPointCode' => 'nullable|string|max:255',
            'chapterCode' => 'nullable|string|max:120',
            'gradeCode' => 'nullable|string|max:40',
            'origin' => ['nullable', Rule::in(['lesson', 'exercise'])],
            'type' => ['nullable', Rule::in(NotebookNote::TYPES)],
            'sort' => ['nullable', Rule::in(NotebookService::SORTS)],
            'page' => 'nullable|integer|min:1',
            'perPage' => 'nullable|integer|min:1|max:100',
        ]);
        $user = $request->user();

        $paged = isset($params['page']) || isset($params['view']) || isset($params['q']) || isset($params['sort'])
            || isset($params['type']) || isset($params['origin']) || isset($params['chapterCode']) || isset($params['gradeCode'])
            || isset($params['learningPointCode']);

        if (! $paged) {
            $notes = $this->notebook->listFor($user, $params['lessonCode'] ?? null);
            $modules = $this->notebook->modulesFor($notes);

            return response()->json([
                'success' => true,
                'notes' => $notes->map(fn ($n) => $this->serialize($n, $modules))->all(),
                'counts' => $this->notebook->counts($user),
            ]);
        }

        $result = $this->notebook->search($user, $params);
        $modules = $this->notebook->modulesFor($result['notes']);

        return response()->json([
            'success' => true,
            'notes' => $result['notes']->map(fn ($n) => $this->serialize($n, $modules))->all(),
            'meta' => [
                'total' => $result['total'],
                'page' => $result['page'],
                'perPage' => $result['perPage'],
                'hasMore' => $result['hasMore'],
            ],
            'counts' => $this->notebook->counts($user),
            'facets' => ['lessons' => $this->notebook->lessonFacets($user)],
        ]);
    }

    public function show(Request $request, int $id)
    {
        try {
            $note = $this->notebook->find($request->user(), $id);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        }

        return response()->json(['success' => true, 'note' => $this->serialize($note, $this->notebook->modulesFor([$note]))]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:12000',
            'title' => 'nullable|string|max:160',
            'lessonCode' => 'nullable|string|max:120',
            'learningPointCode' => 'nullable|string|max:255',
            'exerciseId' => 'nullable|string|max:120',
            'questionId' => 'nullable|string|max:40',
            'moduleNumber' => 'nullable|integer|min:0|max:999',
            'mistakeType' => 'nullable|string|max:40',
            'noteType' => ['nullable', Rule::in(NotebookNote::TYPES)],
            'pinned' => 'nullable|boolean',
            'review' => 'nullable|boolean',
        ]);

        try {
            $note = $this->notebook->create($request->user(), $validated);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        $note->load(self::CONTEXT_RELATIONS);

        return response()->json(['success' => true, 'note' => $this->serialize($note, $this->notebook->modulesFor([$note]))], 201);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'content' => 'sometimes|string|max:12000',
            'title' => 'sometimes|nullable|string|max:160',
            'mistakeType' => 'sometimes|nullable|string|max:40',
            'noteType' => ['sometimes', Rule::in(NotebookNote::TYPES)],
            'pinned' => 'sometimes|boolean',
            'archived' => 'sometimes|boolean',
            'review' => 'sometimes|boolean',
            'completed' => 'sometimes|boolean',
        ]);

        try {
            $note = $this->notebook->update($request->user(), $id, $validated);
        } catch (DomainException $e) {
            // Introuvable plutôt qu'interdit : on ne révèle pas l'existence
            // de la note d'un autre élève.
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        }

        return response()->json(['success' => true, 'note' => $this->serialize($note, $this->notebook->modulesFor([$note]))]);
    }

    /** Une révision active : `known` (je la sais) ou `again` (à revoir plus tard). */
    public function review(Request $request, int $id)
    {
        $validated = $request->validate(['outcome' => ['required', Rule::in(['known', 'again'])]]);

        try {
            $note = $this->notebook->review($request->user(), $id, $validated['outcome']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        }

        return response()->json(['success' => true, 'note' => $this->serialize($note, $this->notebook->modulesFor([$note]))]);
    }

    /** Archiver, désarchiver, remettre à revoir ou supprimer plusieurs notes à moi. */
    public function bulk(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1|max:200',
            'ids.*' => 'integer',
            'action' => ['required', Rule::in(['archive', 'unarchive', 'review', 'delete'])],
        ]);

        try {
            $count = $this->notebook->bulk($request->user(), $validated['ids'], $validated['action']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'count' => $count, 'counts' => $this->notebook->counts($request->user())]);
    }

    public function destroy(Request $request, int $id)
    {
        try {
            $this->notebook->delete($request->user(), $id);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        }

        return response()->json(['success' => true]);
    }

    /**
     * @param  array<string, \App\Models\LessonModule>  $modules  « lesson_id:number » → module (voir NotebookService::modulesFor)
     */
    private function serialize(NotebookNote $note, array $modules = []): array
    {
        return NotebookPresenter::note($note, $modules);
    }
}
