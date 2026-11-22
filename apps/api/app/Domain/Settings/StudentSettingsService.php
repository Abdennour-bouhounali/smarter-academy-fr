<?php

namespace App\Domain\Settings;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\StudentSetting;
use App\Models\User;
use DomainException;

/**
 * Les réglages d'un élève, et QUI peut les changer (propriétaire, 2026-10-06) :
 *
 *  - un élève membre ACTIF d'une classe ACTIVE : son enseignant décide, élève
 *    par élève (TeacherStudentSettingsController) ; l'élève les lit sans pouvoir
 *    les modifier ;
 *  - un élève indépendant : il les règle lui-même (page « الإعدادات »).
 *
 * Valeurs par défaut quand aucune ligne n'existe : celles de la migration.
 */
final class StudentSettingsService
{
    public const REASON_MANAGED_BY_TEACHER = 'managed_by_teacher';

    /** « مستقل » : l'élève se corrige lui-même (défaut, et toujours hors classe). */
    public const VALIDATION_SELF = 'self';

    /** « تصحيح الأستاذ » : les photos et les démonstrations attendent l'enseignant. */
    public const VALIDATION_TEACHER = 'teacher';

    public const VALIDATIONS = [self::VALIDATION_SELF, self::VALIDATION_TEACHER];

    /** @return array{practiceLevelsOpen: bool, practiceValidation: string} */
    public function read(User $student): array
    {
        $row = StudentSetting::where('user_id', $student->id)->first();

        return [
            'practiceLevelsOpen' => (bool) ($row?->practice_levels_open ?? false),
            'practiceValidation' => in_array($row?->practice_validation, self::VALIDATIONS, true) ? $row->practice_validation : self::VALIDATION_SELF,
        ];
    }

    /**
     * Le mode de correction EFFECTIF : « teacher » seulement si l'enseignant l'a
     * choisi ET que l'élève est encore membre actif d'une classe active. Un
     * élève qui quitte la classe redevient autonome sans que rien ne soit
     * réécrit (le réglage reste, il ne s'applique plus).
     */
    public function practiceValidation(User $student): string
    {
        $chosen = $this->read($student)['practiceValidation'];

        return $chosen === self::VALIDATION_TEACHER && $this->managedByTeacher($student)
            ? self::VALIDATION_TEACHER
            : self::VALIDATION_SELF;
    }

    public function practiceLevelsOpen(User $student): bool
    {
        return $this->read($student)['practiceLevelsOpen'];
    }

    /** Vrai quand un enseignant règle ces réglages : membre actif d'une classe active. */
    public function managedByTeacher(User $student): bool
    {
        $classroomIds = ClassroomMembership::where('student_id', $student->id)->active()->pluck('classroom_id');
        if ($classroomIds->isEmpty()) {
            return false;
        }

        return Classroom::whereIn('id', $classroomIds)->get()->contains(fn (Classroom $c) => $c->isActive());
    }

    /**
     * L'élève règle LUI-MÊME — refusé s'il appartient à une classe.
     *
     * @param  array{practiceLevelsOpen?: bool, practiceValidation?: string}  $changes
     * @return array{practiceLevelsOpen: bool, practiceValidation: string}
     *
     * @throws DomainException
     */
    public function updateBySelf(User $student, array $changes): array
    {
        if ($this->managedByTeacher($student)) {
            throw new DomainException(self::REASON_MANAGED_BY_TEACHER);
        }

        return $this->write($student, $changes, $student);
    }

    /**
     * L'enseignant règle pour UN élève — la classe et l'appartenance sont
     * vérifiées par l'appelant (ownedClassroom + ClassroomAccess::activeStudent).
     *
     * @param  array{practiceLevelsOpen?: bool}  $changes
     * @return array{practiceLevelsOpen: bool}
     */
    public function updateByTeacher(User $teacher, User $student, array $changes): array
    {
        return $this->write($student, $changes, $teacher);
    }

    /** @param  array{practiceLevelsOpen?: bool}  $changes */
    private function write(User $student, array $changes, User $author): array
    {
        $attributes = ['updated_by' => $author->id];
        if (array_key_exists('practiceLevelsOpen', $changes)) {
            $attributes['practice_levels_open'] = (bool) $changes['practiceLevelsOpen'];
        }
        if (array_key_exists('practiceValidation', $changes) && in_array($changes['practiceValidation'], self::VALIDATIONS, true)) {
            $attributes['practice_validation'] = $changes['practiceValidation'];
        }
        StudentSetting::updateOrCreate(['user_id' => $student->id], $attributes);

        return $this->read($student);
    }
}
