<?php

namespace Database\Factories;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ClassroomMembership> */
class ClassroomMembershipFactory extends Factory
{
    protected $model = ClassroomMembership::class;

    public function definition(): array
    {
        return [
            'classroom_id' => Classroom::factory(),
            'student_id' => User::factory()->state(['role' => User::ROLE_STUDENT, 'grade' => '4am']),
            'status' => ClassroomMembership::STATUS_ACTIVE,
            'joined_at' => now()->subDay(),
            'joined_via' => ClassroomMembership::VIA_JOIN_CODE,
            'consented_at' => now()->subDay(),
            'consent_version' => (string) config('classroom.consent_version'),
        ];
    }

    public function in(Classroom $classroom): static
    {
        return $this->state(['classroom_id' => $classroom->id]);
    }

    public function of(User $student): static
    {
        return $this->state(['student_id' => $student->id]);
    }

    /** Une adhésion antérieure au texte de partage. */
    public function withoutConsent(): static
    {
        return $this->state(['consented_at' => null, 'consent_version' => null]);
    }

    public function left(): static
    {
        return $this->state(['status' => ClassroomMembership::STATUS_LEFT, 'left_at' => now()]);
    }
}
