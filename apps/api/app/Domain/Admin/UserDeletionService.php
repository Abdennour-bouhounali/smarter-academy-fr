<?php

namespace App\Domain\Admin;

use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * La SUPPRESSION DÉFINITIVE d'un compte élève ou enseignant (2026-10-07).
 *
 * À ne pas confondre avec la désactivation (AccountStatusService), qui ferme
 * le compte en gardant tout. Ici rien ne reste : la ligne `users` est
 * supprimée, et la base emporte avec elle chaque table qui lui appartient
 * (clés étrangères CASCADE : progression, preuves, tentatives, séances,
 * classes d'un enseignant, abonnements, paiements, signalements, carnet,
 * Math Lab…). Les tables qui ne font que CITER l'utilisateur comme auteur
 * d'un geste (granted_by, created_by, reviewer_id…) passent à NULL.
 *
 * Ce que la base ne sait pas faire, ce service le fait :
 *   - les jetons Sanctum (relation polymorphe, sans clé étrangère),
 *     les sessions et les jetons de réinitialisation du mot de passe ;
 *   - les FICHIERS sur le disque privé : copies photographiées (et leur
 *     version annotée), fichiers Math Lab, captures des signalements.
 *     Leurs chemins sont lus AVANT la suppression, effacés APRÈS la
 *     validation de la transaction — un échec de base ne laisse jamais une
 *     ligne pointant vers un fichier déjà effacé.
 *
 * Garde-fous : jamais un administrateur (ni soi-même), et l'adresse e-mail du
 * compte doit être retapée — le serveur la revérifie, l'interface ne fait que
 * la demander. Le journal garde l'identifiant et le rôle, aucune donnée
 * personnelle : un compte supprimé « complètement » ne survit pas dans l'audit.
 */
class UserDeletionService
{
    /** Le disque privé où vivent tous les fichiers d'utilisateur. */
    private const DISK = 'local';

    public function __construct(private ActivityLogger $log) {}

    /**
     * Ce que la suppression emportera — pour l'avertissement, AVANT le geste.
     *
     * @return array<string, int>
     */
    public function preview(User $admin, int $id): array
    {
        $target = $this->deletable($admin, $id);

        $count = fn (string $table, string $column = 'user_id') => DB::table($table)->where($column, $target->id)->count();

        $summary = [
            'lessonProgress' => $count('student_lesson_progress'),
            'learningPoints' => $count('student_learning_point_progress'),
            'practiceSessions' => $count('practice_sessions'),
            'questionAttempts' => $count('question_attempts'),
            'answerImages' => $count('answer_images'),
            'notebookNotes' => $count('notebook_notes'),
            'mathLabDocuments' => $count('math_lab_documents'),
            'mathLabFiles' => $count('math_lab_files'),
            'subscriptions' => $count('subscriptions'),
            'payments' => $count('payments'),
            'reports' => $count('student_reports'),
            'classMemberships' => $count('classroom_memberships', 'student_id'),
        ];

        if ($target->isTeacher()) {
            $classroomIds = DB::table('classrooms')->where('teacher_id', $target->id)->pluck('id');
            $summary['classrooms'] = $classroomIds->count();
            $summary['studentsInClassrooms'] = DB::table('classroom_memberships')
                ->whereIn('classroom_id', $classroomIds)
                ->where('status', 'active')
                ->distinct()
                ->count('student_id');
        }

        return $summary;
    }

    /**
     * @return array{id: int, role: string, filesDeleted: int}
     */
    public function delete(User $admin, int $id, string $confirmEmail): array
    {
        $target = $this->deletable($admin, $id);

        if (mb_strtolower(trim($confirmEmail)) !== mb_strtolower((string) $target->email)) {
            throw new DomainException('L\'adresse e-mail saisie ne correspond pas à ce compte.');
        }

        $files = $this->filesOf($target);
        $role = $target->role;
        $targetId = $target->id;
        $email = $target->email;

        DB::transaction(function () use ($admin, $target, $role, $targetId, $email) {
            $target->tokens()->delete();
            DB::table('sessions')->where('user_id', $targetId)->delete();
            if ($email) {
                DB::table('password_reset_tokens')->where('email', $email)->delete();
            }

            $target->delete();

            $this->log->log($admin, ActivityLogger::USER_DELETED, 'user', $targetId,
                ['role' => $role], null);
        });

        return ['id' => $targetId, 'role' => $role, 'filesDeleted' => $this->deleteFiles($files, $targetId)];
    }

    private function deletable(User $admin, int $id): User
    {
        $target = User::find($id);

        if ($target === null) {
            throw new DomainException('Compte introuvable.');
        }
        if ($target->id === $admin->id) {
            throw new DomainException('Vous ne pouvez pas supprimer votre propre compte.');
        }
        if ($target->isAdmin()) {
            throw new DomainException('Un compte administrateur ne se supprime pas ici.');
        }

        return $target;
    }

    /** @return string[] */
    private function filesOf(User $target): array
    {
        $images = DB::table('answer_images')->where('user_id', $target->id)->get(['disk_path', 'annotation_path']);

        return collect()
            ->merge($images->pluck('disk_path'))
            ->merge($images->pluck('annotation_path'))
            ->merge(DB::table('math_lab_files')->where('user_id', $target->id)->pluck('disk_path'))
            ->merge(DB::table('student_reports')->where('user_id', $target->id)->pluck('screenshot_path'))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Après la transaction : un fichier qui résiste est journalisé, pas fatal —
     * le compte est déjà supprimé, et l'annoncer « échoué » serait faux.
     *
     * @param  string[]  $files
     */
    private function deleteFiles(array $files, int $userId): int
    {
        $disk = Storage::disk(self::DISK);
        $deleted = 0;

        foreach ($files as $path) {
            try {
                if ($disk->exists($path) && $disk->delete($path)) {
                    $deleted++;
                }
            } catch (Throwable $e) {
                Log::warning('user deletion: fichier non supprimé', ['path' => $path, 'error' => $e->getMessage()]);
            }
        }

        // Le dossier des copies de l'élève (answer-images/{id}/), vide désormais.
        try {
            $disk->deleteDirectory("answer-images/{$userId}");
        } catch (Throwable) {
            // Rien à faire : un dossier vide oublié ne contient aucune donnée.
        }

        return $deleted;
    }
}
