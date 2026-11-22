<?php

namespace App\Http\Controllers;

use App\Domain\Classroom\ClassroomException;
use App\Domain\Classroom\ClassroomMembershipService;
use App\Models\ClassroomMembership;
use Illuminate\Http\Request;

/**
 * GET /join-links/{token} — ce qu'un lien de classe révèle AVANT tout compte.
 *
 * Publique et limitée en débit : la page `/rejoindre/classe/{jeton}` s'ouvre
 * depuis WhatsApp, le plus souvent sans session. Elle rend ce qui rassure
 * l'élève qu'il rejoint la BONNE classe — nom du قسم, classe scolaire, nom de
 * l'enseignant — et si la classe accepte de nouveaux élèves. Jamais un
 * identifiant, jamais une adresse, jamais l'effectif.
 *
 * Si la requête porte le jeton d'un ÉLÈVE connecté (Sanctum, facultatif),
 * elle dit aussi s'il est déjà membre : la page le renvoie alors à sa classe
 * sans rien lui redemander — et, s'il est déjà dans une AUTRE classe, le nom
 * de SA classe (`currentClassroomName`) : un élève n'a qu'un قسم à la fois,
 * la page le lui dit avant qu'il consente. Rien n'est écrit ici — l'adhésion reste
 * `POST /student/classrooms/join`, derrière `email.verified`.
 */
class ClassJoinLinkController extends Controller
{
    public function __construct(private ClassroomMembershipService $memberships) {}

    public function show(Request $request, string $token)
    {
        try {
            $classroom = $this->memberships->classroomForLink($token);
        } catch (ClassroomException $e) {
            return response()->json(['success' => false, 'reason' => $e->reason, 'message' => $e->getMessage()], 422);
        }

        $viewer = $request->user('sanctum');
        $alreadyMember = null;
        $currentClassroomName = null;
        if ($viewer !== null && $viewer->isStudent()) {
            $alreadyMember = ClassroomMembership::where('classroom_id', $classroom->id)
                ->where('student_id', $viewer->id)
                ->active()
                ->exists();
            $currentClassroomName = $alreadyMember ? null : $this->memberships->currentClassroomOf($viewer, except: $classroom->id)?->name;
        }

        $teacher = $classroom->teacher;

        return response()->json([
            'success' => true,
            'joinLink' => [
                'classroomName' => $classroom->name,
                'grade' => $classroom->grade,
                'teacherName' => trim(($teacher?->first_name ?? '').' '.($teacher?->last_name ?? '')),
                // Une classe d'établissement : le texte de partage le NOMME, et
                // le geste ouvre aussi la lecture de la direction (SCHOOL_ADMIN_SPACE.md §4).
                'schoolName' => $classroom->school?->isActive() ? $classroom->school->name : null,
                'joiningOpen' => $classroom->acceptsNewMembers(),
                'alreadyMember' => $alreadyMember,
                'currentClassroomName' => $currentClassroomName,
            ],
        ]);
    }
}
