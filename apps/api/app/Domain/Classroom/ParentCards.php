<?php

namespace App\Domain\Classroom;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Family\ParentAccessLinkService;
use App\Models\Classroom;
use App\Models\User;

/**
 * « بطاقات الأولياء » (PARENT_SPACE.md §2bis) — l'enseignant imprime, pour des
 * élèves ACTIFS de sa classe, une carte avec le QR du « رابط الوليّ » de
 * chacun, à remettre au parent (réunion des parents, cahier).
 *
 * Le lien EXISTANT est réutilisé : imprimer ne casse jamais un lien déjà
 * envoyé par l'élève. Un élève sans lien en reçoit un (created_by teacher) ;
 * il le voit dans son profil et peut le révoquer comme le sien.
 */
class ParentCards
{
    public function __construct(private ActivityLogger $log, private ParentAccessLinkService $links) {}

    /**
     * @param  int[]  $studentIds
     * @return array<int, array<string, mixed>>
     */
    public function issue(User $teacher, Classroom $classroom, array $studentIds): array
    {
        if (! $classroom->isActive()) {
            throw new ClassroomException(ClassroomException::CLASS_INACTIVE, 'Cette classe est archivée.');
        }

        $ids = ClassroomAccess::activeStudentIds($classroom, $studentIds);

        $cards = User::query()->whereIn('id', $ids)->orderBy('last_name')->orderBy('first_name')->get()
            ->map(fn (User $student) => ClassroomAccess::identity($student) + [
                'url' => ParentAccessLinkService::url($this->links->ensure($student, 'teacher', $teacher)),
            ])->all();

        $this->log->log($teacher, ActivityLogger::TEACHER_PARENT_CARDS_ISSUED, 'classroom', $classroom->id, null, [
            'student_ids' => $ids,
        ]);

        return $cards;
    }
}
