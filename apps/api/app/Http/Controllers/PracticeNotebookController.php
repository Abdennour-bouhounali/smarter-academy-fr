<?php

namespace App\Http\Controllers;

use App\Domain\Practice\NotebookService;
use App\Models\NotebookNote;
use DomainException;
use Illuminate\Http\Request;

class PracticeNotebookController extends Controller
{
    public function __construct(private NotebookService $notebook) {}

    public function index(Request $request)
    {
        $notes = $this->notebook->listFor($request->user(), $request->query('lessonCode'));

        return response()->json([
            'success' => true,
            'notes' => $notes->map(fn ($n) => $this->serialize($n))->all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:4000',
            'lessonCode' => 'nullable|string|max:120',
            'learningPointCode' => 'nullable|string|max:255',
            'exerciseId' => 'nullable|string|max:120',
            'questionId' => 'nullable|string|max:40',
            'mistakeType' => 'nullable|string|max:40',
        ]);

        try {
            $note = $this->notebook->create($request->user(), $validated);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'note' => $this->serialize($note)], 201);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'content' => 'sometimes|string|max:4000',
            'mistakeType' => 'sometimes|nullable|string|max:40',
            'completed' => 'sometimes|boolean',
        ]);

        try {
            $note = $this->notebook->update($request->user(), $id, $validated);
        } catch (DomainException $e) {
            // Introuvable plutôt qu'interdit : on ne révèle pas l'existence
            // de la note d'un autre élève.
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        }

        return response()->json(['success' => true, 'note' => $this->serialize($note)]);
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

    private function serialize(NotebookNote $note): array
    {
        return [
            'id' => $note->id,
            'content' => $note->content,
            'mistakeType' => $note->mistake_type,
            // La DATE est la donnée ; `isCompleted` n'en est que la lecture
            // commode pour l'interface.
            'completedAt' => $note->completed_at?->toIso8601String(),
            'isCompleted' => $note->completed_at !== null,
            'lessonCode' => $note->lesson?->code,
            'learningPointCode' => $note->learningPoint?->code,
            'exerciseId' => $note->exercise_id,
            'questionId' => $note->question_id,
            'createdAt' => $note->created_at?->toIso8601String(),
            'updatedAt' => $note->updated_at?->toIso8601String(),
        ];
    }
}
