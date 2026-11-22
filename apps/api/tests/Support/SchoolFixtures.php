<?php

namespace Tests\Support;

use App\Models\Classroom;
use App\Models\School;
use App\Models\SchoolStaff;
use App\Models\SchoolTeacher;
use App\Models\User;

/**
 * Les fixtures de « فضاء الإدارة » : un établissement et son directeur, un
 * enseignant rattaché, une classe d'établissement. Rien n'y code une règle.
 * S'utilise avec CommercialFixtures.
 */
trait SchoolFixtures
{
    /** @return array{school: School, director: User, token: string} */
    protected function schoolWithDirector(string $name = 'متوسطة النور'): array
    {
        $school = School::create(['name' => $name, 'current_academic_year' => '2026-2027']);
        $director = User::factory()->create(['role' => User::ROLE_SCHOOL_ADMIN]);
        $staff = new SchoolStaff(['appointed_at' => now()]);
        $staff->school_id = $school->id;
        $staff->user_id = $director->id;
        $staff->save();

        return ['school' => $school, 'director' => $director, 'token' => $this->tokenOf($director)];
    }

    protected function teacherInSchool(School $school, array $attributes = []): User
    {
        $teacher = $this->teacher($attributes);
        $row = new SchoolTeacher(['status' => SchoolTeacher::STATUS_ACTIVE, 'joined_at' => now()]);
        $row->school_id = $school->id;
        $row->teacher_id = $teacher->id;
        $row->save();

        return $teacher;
    }

    protected function schoolClassroom(School $school, User $teacher, array $attributes = []): Classroom
    {
        $classroom = Classroom::factory()->ownedBy($teacher)->create($attributes);
        $classroom->school_id = $school->id;
        $classroom->save();

        return $classroom;
    }
}
