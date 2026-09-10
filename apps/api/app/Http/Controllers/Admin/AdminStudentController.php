<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\StudentService;
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
