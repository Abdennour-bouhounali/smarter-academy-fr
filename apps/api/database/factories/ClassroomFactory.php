<?php

namespace Database\Factories;

use App\Domain\Classroom\JoinCode;
use App\Models\Classroom;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Usine de TEST : une classe active en 4AM, possédée par un enseignant neuf.
 *
 * @extends Factory<Classroom>
 */
class ClassroomFactory extends Factory
{
    protected $model = Classroom::class;

    public function definition(): array
    {
        return [
            'teacher_id' => User::factory()->state(['role' => User::ROLE_TEACHER]),
            'name' => '4AM '.fake()->randomLetter(),
            'description' => null,
            'grade' => '4am',
            'academic_year' => '2026-2027',
            'status' => Classroom::STATUS_ACTIVE,
            'join_code' => JoinCode::generate(),
            'join_code_enabled' => true,
        ];
    }

    public function ownedBy(User $teacher): static
    {
        return $this->state(['teacher_id' => $teacher->id]);
    }

    public function archived(): static
    {
        return $this->state(['status' => Classroom::STATUS_ARCHIVED, 'archived_at' => now()]);
    }

    public function suspended(): static
    {
        return $this->state(['status' => Classroom::STATUS_SUSPENDED]);
    }
}
