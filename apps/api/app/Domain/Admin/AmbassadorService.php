<?php

namespace App\Domain\Admin;

use App\Models\User;
use DomainException;
use Illuminate\Support\Facades\DB;

/**
 * Désigner, ou retirer, un AMBASSADEUR (« سفير »).
 *
 * Un ambassadeur est un enseignant qui relit le contenu : il le voit tout,
 * quel qu'en soit l'état de publication, et peut signaler un problème. Le
 * geste ne touche ni ses classes, ni son offre, ni son statut de compte.
 * Idempotent : redemander l'état courant ne journalise rien.
 */
class AmbassadorService
{
    public function __construct(private ActivityLogger $log) {}

    public function set(User $admin, User $target, bool $on): User
    {
        if (! $target->isTeacher()) {
            throw new DomainException('Seul un enseignant peut être ambassadeur.');
        }

        $before = (bool) $target->is_ambassador;
        if ($before === $on) {
            return $target;
        }

        DB::transaction(function () use ($admin, $target, $on, $before) {
            $target->is_ambassador = $on;
            $target->ambassador_since = $on ? now() : null;
            $target->save();

            $this->log->log($admin, ActivityLogger::TEACHER_AMBASSADOR, 'teacher', $target->id,
                ['is_ambassador' => $before], ['is_ambassador' => $on]);
        });

        return $target;
    }
}
