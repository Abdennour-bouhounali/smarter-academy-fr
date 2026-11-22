<?php

namespace App\Domain\Practice;

use App\Models\NotebookNote;

/**
 * LA FORME D'UNE NOTE, une seule fois.
 *
 * Deux surfaces lisent le même cahier : l'élève (PracticeNotebookController)
 * et — en lecture seule — l'enseignant d'un قسم auquel il appartient
 * (Teacher\TeacherClassroomNotebookController). Elles doivent rendre
 * EXACTEMENT les mêmes champs : deux sérialisations divergeraient au premier
 * champ ajouté, et l'enseignant lirait un cahier qui n'est plus celui de
 * l'élève.
 *
 * Rien n'est filtré selon le lecteur : le périmètre (quelles notes) est
 * décidé en amont, par NotebookService, et l'autorisation encore avant, par
 * le contrôleur. Ici on ne fait que mettre en forme.
 */
class NotebookPresenter
{
    /**
     * @param  array<string, \App\Models\LessonModule>  $modules  « lesson_id:number » → module (voir NotebookService::modulesFor)
     */
    public static function note(NotebookNote $note, array $modules = []): array
    {
        $module = $note->module_number !== null ? ($modules["{$note->lesson_id}:{$note->module_number}"] ?? null) : null;

        return [
            'id' => $note->id,
            'title' => $note->title,
            'content' => $note->content,
            // Le texte nu : pour l'aperçu d'une carte, sans redésinfecter le HTML.
            'excerpt' => mb_substr((string) $note->content_text, 0, 280),
            'noteType' => $note->note_type ?? 'note',
            'isErreur' => $note->isErreur(),
            'mistakeType' => $note->mistake_type,
            'isPinned' => (bool) $note->is_pinned,
            // Les DATES sont la donnée ; les booléens n'en sont que la lecture
            // commode pour l'interface.
            'completedAt' => $note->completed_at?->toIso8601String(),
            'isCompleted' => $note->completed_at !== null,
            'archivedAt' => $note->archived_at?->toIso8601String(),
            'isArchived' => $note->archived_at !== null,
            'nextReviewAt' => $note->next_review_at?->toIso8601String(),
            'isToReview' => $note->next_review_at !== null,
            'lastReviewedAt' => $note->last_reviewed_at?->toIso8601String(),
            'reviewCount' => (int) $note->review_count,
            // Le CONTEXTE, figé à la création. Les titres sont des commodités
            // d'affichage résolues ici (le client montre « 📚 leçon › 📍
            // module ») ; les codes restent la donnée.
            'origin' => $note->exercise_id !== null ? 'exercise' : 'lesson',
            'lessonCode' => $note->lesson?->code,
            'lessonTitle' => $note->lesson?->title,
            'learningPointCode' => $note->learningPoint?->code,
            'learningPointTitle' => $note->learningPoint?->title,
            'moduleNumber' => $note->module_number,
            'moduleTitle' => $module?->title,
            'moduleSlug' => $module?->slug,
            'exerciseId' => $note->exercise_id,
            'questionId' => $note->question_id,
            'createdAt' => $note->created_at?->toIso8601String(),
            'updatedAt' => $note->updated_at?->toIso8601String(),
        ];
    }
}
