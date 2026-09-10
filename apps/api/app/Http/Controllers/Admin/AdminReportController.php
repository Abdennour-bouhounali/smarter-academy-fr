<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\ReportService;
use App\Http\Controllers\Controller;
use App\Models\StudentReport;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminReportController extends Controller
{
    public function __construct(private ReportService $reports) {}

    public function index(Request $request)
    {
        $reports = $this->reports->list(
            $request->query() + ['includeIncomplete' => $request->boolean('includeIncomplete')]
        );

        return response()->json([
            'success' => true,
            'reports' => $reports->through(fn (StudentReport $r) => $this->serialize($r)),
            'counts' => $this->counts(),
        ]);
    }

    public function clusters()
    {
        return response()->json([
            'success' => true,
            'clusters' => $this->reports->clusters(),
        ]);
    }

    public function show(int $id)
    {
        try {
            $report = $this->reports->find($id);
        } catch (DomainException) {
            abort(404);
        }

        $siblings = $this->reports->siblings($report);
        $attempt = $report->questionAttempt;

        return response()->json([
            'success' => true,
            'report' => $this->serialize($report) + [
                'student' => [
                    'id' => $report->student?->id,
                    'email' => $report->student?->email,
                    'firstName' => $report->student?->first_name,
                    'lastName' => $report->student?->last_name,
                    'grade' => $report->student?->grade,
                    'accountStatus' => $report->student?->account_status,
                ],
                'source' => $report->source,
                'detailsCompleted' => $report->hasDetails(),
                'context' => [
                    'source' => $report->source,
                    // Un signalement parti du sommaire n'a PAS de module :
                    // le dire explicitement évite que l'administrateur lise
                    // un blanc comme un contexte perdu.
                    'isLessonLevel' => $report->source === StudentReport::SOURCE_LESSON,
                    'lessonCode' => $report->lesson_code,
                    'lessonTitle' => $report->lesson?->title,
                    'grade' => $report->lesson?->chapter?->grade?->code,
                    'moduleNumber' => $report->module_number,
                    'moduleTitle' => $report->module?->title,
                    'step' => $report->step,
                    'exerciseCode' => $report->exercise_code,
                    'questionId' => $report->question_id,
                    'route' => $report->route,
                ],
                // Le contexte machine n'existe que pour les signalements
                // techniques (voir ReportService::create).
                'diagnostics' => $report->isTechnical() ? [
                    'browser' => $report->browser,
                    'os' => $report->os,
                    'screen' => $report->screen,
                    'appVersion' => $report->app_version,
                    'errorRef' => $report->error_ref,
                ] : null,
                // La tentative telle que l'élève l'a vécue : sa réponse, ce
                // qui était attendu, combien d'indices. C'est ce qui permet
                // de trancher « contenu faux » vs « élève perdu ».
                'attempt' => $attempt ? [
                    'questionId' => $attempt->question_id,
                    'submittedAnswer' => $attempt->submitted_answer,
                    'normalizedAnswer' => $attempt->normalized_answer,
                    'outcome' => $attempt->outcome,
                    'attemptNumber' => $attempt->attempt_number,
                    'hintsUsed' => $attempt->hints_used,
                    'misconceptionId' => $attempt->misconception_id,
                    'startedAt' => $attempt->started_at,
                    'submittedAt' => $attempt->submitted_at,
                    'exerciseId' => $attempt->exerciseAttempt?->exercise_id,
                    'level' => $attempt->exerciseAttempt?->level,
                ] : null,
                // Notes INTERNES — ce point d'entrée est le seul à les servir,
                // et il est derrière can:admin.
                'notes' => $report->notes->map(fn ($n) => [
                    'id' => $n->id,
                    'body' => $n->body,
                    'author' => trim(($n->author?->first_name ?? '').' '.($n->author?->last_name ?? '')) ?: $n->author?->email,
                    'createdAt' => $n->created_at,
                ]),
                'related' => [
                    'total' => $siblings['total'],
                    'reports' => $siblings['others']->map(fn ($r) => [
                        'id' => $r->id,
                        'status' => $r->status,
                        'createdAt' => $r->created_at,
                        'note' => $r->note,
                    ]),
                ],
            ],
        ]);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => ['sometimes', Rule::in(StudentReport::STATUSES)],
            'priority' => ['sometimes', Rule::in(StudentReport::PRIORITIES)],
            'assignedTo' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'duplicateOfId' => ['sometimes', 'nullable', 'integer'],
        ]);

        try {
            $report = $this->reports->update($request->user(), $id, $validated);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json(['success' => true, 'report' => $this->serialize($report)]);
    }

    public function addNote(Request $request, int $id)
    {
        $validated = $request->validate([
            'body' => 'required|string|min:1|max:5000',
        ]);

        try {
            $note = $this->reports->addNote($request->user(), $id, $validated['body']);
        } catch (DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'note' => [
                'id' => $note->id,
                'body' => $note->body,
                'author' => trim(($note->author?->first_name ?? '').' '.($note->author?->last_name ?? '')) ?: $note->author?->email,
                'createdAt' => $note->created_at,
            ],
        ], 201);
    }

    private function counts(): array
    {
        $byStatus = StudentReport::selectRaw('status, COUNT(*) as c')->groupBy('status')->pluck('c', 'status');

        return [
            'all' => (int) $byStatus->sum(),
            // Les signaux ouverts sans jamais être décrits. Un nombre qui
            // monte sur un même module dit quelque chose, même sans un mot.
            'incomplete' => StudentReport::whereNull('details_completed_at')->count(),
            'new' => (int) ($byStatus[StudentReport::STATUS_NEW] ?? 0),
            'inReview' => (int) ($byStatus[StudentReport::STATUS_IN_REVIEW] ?? 0),
            'resolved' => (int) ($byStatus[StudentReport::STATUS_RESOLVED] ?? 0),
            'dismissed' => (int) ($byStatus[StudentReport::STATUS_DISMISSED] ?? 0),
            'duplicate' => (int) ($byStatus[StudentReport::STATUS_DUPLICATE] ?? 0),
        ];
    }

    private function serialize(StudentReport $r): array
    {
        return [
            'id' => $r->id,
            'category' => $r->category,
            'note' => $r->note,
            'source' => $r->source,
            // Distingue « l'élève a cliqué » de « l'élève a décrit » : sans
            // ça, un signal sans catégorie ressemble à une donnée manquante.
            'detailsCompleted' => $r->hasDetails(),
            'detailsCompletedAt' => $r->details_completed_at,
            'status' => $r->status,
            'priority' => $r->priority,
            'lessonCode' => $r->lesson_code,
            'lessonTitle' => $r->lesson?->title,
            'moduleNumber' => $r->module_number,
            'moduleTitle' => $r->module?->title,
            'exerciseCode' => $r->exercise_code,
            'questionId' => $r->question_id,
            'studentId' => $r->user_id,
            'studentEmail' => $r->student?->email,
            'studentGrade' => $r->student?->grade,
            'assignedTo' => $r->assigned_to,
            'assigneeEmail' => $r->assignee?->email,
            'duplicateOfId' => $r->duplicate_of_id,
            'resolvedAt' => $r->resolved_at,
            'createdAt' => $r->created_at,
        ];
    }
}
