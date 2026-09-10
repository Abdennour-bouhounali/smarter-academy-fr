<?php

namespace App\Domain\Practice;

use App\Models\LearningPoint;
use App\Models\Lesson;
use App\Models\NotebookNote;
use App\Models\User;
use DomainException;

/**
 * Le carnet : les notes et les erreurs que l'élève marque en pratiquant.
 * Enregistrements historiques, pas un état d'interface (cible §20).
 *
 * Toute lecture est filtrée par user_id, et une note d'autrui est
 * « introuvable » plutôt qu'« interdite » : on ne révèle pas son existence.
 */
class NotebookService
{
    public function listFor(User $user, ?string $lessonCode = null)
    {
        return NotebookNote::query()
            ->where('user_id', $user->id)
            ->when($lessonCode, fn ($q) => $q->whereHas('lesson', fn ($l) => $l->where('code', $lessonCode)))
            ->with(['lesson:id,code,title', 'learningPoint:id,code,title'])
            // Les notes à revoir remontent : le carnet sert d'abord à traiter
            // ce qui reste en suspens. À état égal, la plus récente d'abord.
            ->orderByRaw('completed_at IS NOT NULL')
            ->orderByDesc('created_at')
            ->get();
    }

    public function create(User $user, array $data): NotebookNote
    {
        $content = trim((string) ($data['content'] ?? ''));
        if ($content === '') {
            throw new DomainException('Une note ne peut pas être vide.');
        }

        return NotebookNote::create([
            'user_id' => $user->id,
            'lesson_id' => $this->lessonId($data['lessonCode'] ?? null),
            'learning_point_id' => $this->learningPointId($data['learningPointCode'] ?? null),
            'exercise_id' => $data['exerciseId'] ?? null,
            'question_id' => $data['questionId'] ?? null,
            'content' => $content,
            'mistake_type' => $data['mistakeType'] ?? null,
        ]);
    }

    public function update(User $user, int $id, array $data): NotebookNote
    {
        $note = $this->ownedBy($user, $id);
        $payload = [];
        if (array_key_exists('content', $data)) {
            $content = trim((string) $data['content']);
            if ($content === '') {
                throw new DomainException('Une note ne peut pas être vide.');
            }
            $payload['content'] = $content;
        }
        if (array_key_exists('mistakeType', $data)) {
            $payload['mistake_type'] = $data['mistakeType'];
        }
        // « Traitée » se pose et se retire : l'élève qui rouvre une note pour
        // la retravailler doit pouvoir la remettre à revoir. On stocke la date
        // du geste, pas un simple drapeau.
        if (array_key_exists('completed', $data)) {
            $payload['completed_at'] = $data['completed'] ? now() : null;
        }
        $note->update($payload);

        return $note->fresh();
    }

    public function delete(User $user, int $id): void
    {
        $this->ownedBy($user, $id)->delete();
    }

    private function ownedBy(User $user, int $id): NotebookNote
    {
        $note = NotebookNote::find($id);
        if ($note === null || $note->user_id !== $user->id) {
            throw new DomainException('Note introuvable.');
        }

        return $note;
    }

    private function lessonId(?string $code): ?int
    {
        return $code ? Lesson::where('code', $code)->value('id') : null;
    }

    private function learningPointId(?string $code): ?int
    {
        return $code ? LearningPoint::where('code', $code)->value('id') : null;
    }
}
