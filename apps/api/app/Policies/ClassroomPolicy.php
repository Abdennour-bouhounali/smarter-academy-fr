<?php

namespace App\Policies;

use App\Models\Classroom;
use App\Models\User;

/**
 * La PROPRIÉTÉ d'une classe — la deuxième couche d'autorisation.
 *
 *   1. le rôle        → can:teacher sur la route
 *   2. la propriété   → ICI : cette classe est-elle à cet enseignant ?
 *   3. l'offre        → PlanEntitlementResolver, dans les services
 *
 * Une seule question, sans nuance : `teacher_id === user.id`. Un
 * administrateur ne passe PAS par cette politique (il a ses propres routes
 * de consultation) ; un élève non plus.
 */
class ClassroomPolicy
{
    public function view(User $user, Classroom $classroom): bool
    {
        return $user->isTeacher() && $classroom->teacher_id === $user->id;
    }

    public function update(User $user, Classroom $classroom): bool
    {
        return $this->view($user, $classroom);
    }

    public function manage(User $user, Classroom $classroom): bool
    {
        return $this->view($user, $classroom);
    }
}
