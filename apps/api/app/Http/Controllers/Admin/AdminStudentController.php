<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\StudentService;
use App\Domain\Identity\PersonName;
use App\Http\Controllers\Controller;
use App\Models\User;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminStudentController extends Controller
{
    public function __construct(private StudentService $students) {}

    public function index(Request $request)
    {
        $students = $this->students->list($request->query());

        return response()->json([
            'success' => true,
            'students' => $students->through(fn (User $s) => $this->serialize($s)),
            'counts' => [
                'all' => User::where('role', User::ROLE_STUDENT)->count(),
                'active' => User::where('role', User::ROLE_STUDENT)->where('account_status', User::STATUS_ACTIVE)->count(),
                'suspended' => User::where('role', User::ROLE_STUDENT)->where('account_status', User::STATUS_SUSPENDED)->count(),
                'disabled' => User::where('role', User::ROLE_STUDENT)->where('account_status', User::STATUS_DISABLED)->count(),
            ],
        ]);
    }

    /**
     * POST /admin/students — l'administrateur crée un compte élève (StudentService::create). Le mot de passe n'est
     * rendu qu'ici, une fois : `Cache-Control: no-store`.
     */
    public function store(Request $request)
    {
        PersonName::normalizeRequest($request);
        if (is_string($request->input('email'))) {
            $email = mb_strtolower(trim($request->input('email')));
            $request->merge(['email' => $email === '' ? null : $email]);
        }

        // La classe scolaire : un code de `grades` (active, quand la plateforme ne sert que les classes actives) —
        // la même règle que la classe d'un enseignant (ClassroomService::assertGradeAllowed).
        $grade = Rule::exists('grades', 'code');
        if (config('curriculum.enforce_active_grades', true)) {
            $grade = $grade->where('is_active', true);
        }

        $validated = $request->validate([
            ...PersonName::rules(),
            'email' => ['nullable', 'string', 'email', 'max:190'],
            'grade' => ['nullable', 'string', 'max:50', $grade],
        ], [
            ...PersonName::messages(),
            'email.email' => 'Format email invalide.',
            'grade.exists' => 'Cette classe scolaire n\'existe pas.',
        ]);

        try {
            $created = $this->students->create($request->user(), [
                'firstName' => $validated['firstName'],
                'lastName' => $validated['lastName'],
                'email' => $validated['email'] ?? null,
                'grade' => $validated['grade'] ?? null,
            ]);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'reason' => 'email_taken', 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'student' => $this->serialize($created['student']),
            'login' => $created['login'],
            // Rendu UNE fois : l'administrateur le remet à l'élève.
            'password' => $created['password'],
        ], 201)->header('Cache-Control', 'no-store');
    }

    public function show(int $id)
    {
        try {
            $student = $this->students->find($id);
        } catch (DomainException) {
            abort(404);
        }

        $profile = $this->students->profile($student);
        $subscription = $student->currentSubscription();

        return response()->json([
            'success' => true,
            'student' => $this->serialize($student) + [
                'subscription' => $subscription ? [
                    'plan' => $subscription->plan,
                    'status' => $subscription->status,
                    'startedAt' => $subscription->started_at,
                    'endsAt' => $subscription->ends_at,
                    'provider' => $subscription->provider,
                    'reference' => $subscription->external_reference,
                    'grantsAccess' => $subscription->grantsAccess(),
                ] : null,
                'learning' => [
                    'lessonsStarted' => $profile['lessonsStarted'],
                    'lessonsCompleted' => $profile['lessonsCompleted'],
                    'modulesCompleted' => $profile['modulesCompleted'],
                    'exerciseAttempts' => $profile['exerciseAttempts'],
                    'questionsAnswered' => $profile['questionsAnswered'],
                    'correctAnswers' => $profile['correctAnswers'],
                    'successRate' => $profile['successRate'],
                    'hintsUsed' => $profile['hintsUsed'],
                    'evidenceCount' => $profile['evidenceCount'],
                    'masteryCounts' => $profile['masteryCounts'],
                ],
                'progress' => $profile['progress']->map(fn ($p) => [
                    'lessonCode' => $p->lesson?->code,
                    'lessonTitle' => $p->lesson?->title,
                    'status' => $p->status,
                    'currentModule' => $p->current_module,
                    'completedModules' => $p->completed_modules,
                    'lastActivityAt' => $p->last_activity_at,
                    'completedAt' => $p->completed_at,
                ]),
                // Points forts / points faibles : DÉRIVÉS de la maîtrise déjà
                // calculée, jamais stockés une seconde fois.
                'mastery' => $profile['mastery']->map(fn ($m) => [
                    'code' => $m->learningPoint?->code,
                    'title' => $m->learningPoint?->title,
                    'status' => $m->status,
                    'confidence' => $m->confidence,
                    'attempts' => $m->attempts,
                    'correctCount' => $m->correct_count,
                    'lastEvidenceAt' => $m->last_evidence_at,
                ]),
                'timeline' => $this->students->timeline($student),
            ],
        ]);
    }

    public function changeStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(User::ACCOUNT_STATUSES)],
        ], [
            'status.in' => 'Statut de compte inconnu.',
        ]);

        try {
            $student = $this->students->changeStatus($request->user(), $id, $validated['status']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'student' => $this->serialize($student)]);
    }

    private function serialize(User $s): array
    {
        return [
            'id' => $s->id,
            'firstName' => $s->first_name,
            'lastName' => $s->last_name,
            'email' => $s->email,
            'grade' => $s->grade,
            'accountStatus' => $s->account_status,
            'suspendedAt' => $s->suspended_at,
            'lastActivityAt' => $s->last_activity_at,
            'createdAt' => $s->created_at,
            'lessonsStartedCount' => $s->lessons_started_count ?? null,
            'lessonsCompletedCount' => $s->lessons_completed_count ?? null,
            'reportsCount' => $s->reports_count ?? null,
            'subscriptionStatus' => $s->relationLoaded('subscriptions')
                ? $s->subscriptions->first()?->status
                : null,
        ];
    }
}
