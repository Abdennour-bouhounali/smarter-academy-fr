<?php

namespace App\Domain\Admin;

use App\Models\Lesson;
use App\Models\LessonModule;
use App\Models\QuestionAttempt;
use App\Models\ReportNote;
use App\Models\StudentReport;
use App\Models\User;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Les signalements d'élèves — création côté élève, traitement côté admin.
 *
 * Principe : l'élève ne désigne jamais le contenu fautif. Il envoie une
 * catégorie, une note facultative, et le contexte technique de sa page. TOUT
 * ce qui est une clé étrangère est résolu ICI, à partir des codes : un client
 * qui enverrait lesson_id = 7 n'obtiendrait rien de plus qu'un autre.
 */
class ReportService
{
    public function __construct(private ActivityLogger $log) {}

    /**
     * Enregistre un signalement.
     *
     * @param  array<string, mixed>  $payload  déjà validé par le contrôleur
     */
    public function create(User $student, array $payload): StudentReport
    {
        $lessonCode = $payload['lessonCode'] ?? null;
        $moduleNumber = $payload['moduleNumber'] ?? null;

        // Résolution serveur. Une leçon introuvable n'est PAS une erreur : le
        // signalement est archivé avec ses codes en clair. Refuser le
        // signalement parce que le registre ne connaît pas encore la leçon
        // reviendrait à perdre exactement l'information qu'on cherche.
        $lesson = $lessonCode ? $this->resolveLesson($lessonCode, $payload['grade'] ?? null) : null;

        $module = null;
        if ($lesson && $moduleNumber !== null) {
            $module = LessonModule::where('lesson_id', $lesson->id)
                ->where('number', $moduleNumber)
                ->first();
        }

        // La tentative n'est rattachée QUE si elle appartient à cet élève —
        // sinon un identifiant deviné donnerait accès au travail d'un autre
        // dans le détail du signalement.
        $attempt = null;
        if ($uuid = ($payload['attemptUuid'] ?? null)) {
            $attempt = QuestionAttempt::where('attempt_uuid', $uuid)
                ->where('user_id', $student->id)
                ->first();
        }

        $category = $payload['category'];
        $isTechnical = in_array($category, StudentReport::TECHNICAL_CATEGORIES, true);

        return StudentReport::create([
            'user_id' => $student->id,
            'lesson_id' => $lesson?->id,
            'lesson_module_id' => $module?->id,
            'lesson_code' => $lessonCode,
            'module_number' => $moduleNumber,
            'step' => $payload['step'] ?? null,
            'exercise_code' => $payload['exerciseCode'] ?? null,
            'question_id' => $payload['questionId'] ?? null,
            'practice_session_id' => $payload['sessionId'] ?? null,
            'question_attempt_id' => $attempt?->id,
            'category' => $category,
            'note' => $payload['note'] ?? null,
            'status' => StudentReport::STATUS_NEW,
            'priority' => $this->initialPriority($category),
            'route' => $payload['route'] ?? null,
            // Le contexte machine n'est conservé que pour les catégories qui
            // décrivent une panne : un signalement « faute de frappe » n'a
            // aucun besoin de savoir quel navigateur l'élève utilise.
            'browser' => $isTechnical ? ($payload['browser'] ?? null) : null,
            'os' => $isTechnical ? ($payload['os'] ?? null) : null,
            'screen' => $isTechnical ? ($payload['screen'] ?? null) : null,
            'app_version' => $payload['appVersion'] ?? null,
            'error_ref' => $payload['errorRef'] ?? null,
            'fingerprint' => StudentReport::fingerprintFor([
                'lesson_code' => $lessonCode,
                'module_number' => $moduleNumber,
                'exercise_code' => $payload['exerciseCode'] ?? null,
                'question_id' => $payload['questionId'] ?? null,
                'category' => $category,
            ]),
        ]);
    }

    /**
     * Priorité d'entrée. Une réponse fausse ou un contenu erroné trompent
     * activement l'élève : ils commencent plus haut qu'une coquille.
     * L'administrateur reste libre de la changer.
     */
    private function initialPriority(string $category): string
    {
        return match ($category) {
            'wrong_answer', 'content_error' => 'high',
            'typo' => 'low',
            default => 'medium',
        };
    }

    private function resolveLesson(string $code, ?string $grade): ?Lesson
    {
        $query = Lesson::where('code', $code);
        if ($grade) {
            $query->whereHas('chapter.grade', fn ($q) => $q->where('code', $grade));
        }
        $matches = $query->get();

        return $matches->count() === 1 ? $matches->first() : null;
    }

    /** @param array<string, mixed> $filters */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = StudentReport::query()
            ->with(['student:id,first_name,last_name,email,grade,account_status', 'lesson:id,code,title', 'module:id,code,number,title', 'assignee:id,first_name,last_name,email']);

        foreach (['status', 'priority', 'category'] as $field) {
            if ($value = ($filters[$field] ?? null)) {
                $query->where($field, $value);
            }
        }

        if ($lesson = ($filters['lesson'] ?? null)) {
            $query->where('lesson_code', $lesson);
        }

        if ($assigned = ($filters['assignedTo'] ?? null)) {
            $query->where('assigned_to', $assigned);
        }

        if ($grade = ($filters['grade'] ?? null)) {
            $query->whereHas('student', fn ($q) => $q->where('grade', $grade));
        }

        if ($search = ($filters['search'] ?? null)) {
            $query->where(fn ($q) => $q
                ->where('note', 'like', "%{$search}%")
                ->orWhere('lesson_code', 'like', "%{$search}%")
                ->orWhere('exercise_code', 'like', "%{$search}%"));
        }

        if ($from = ($filters['from'] ?? null)) {
            $query->where('created_at', '>=', $from);
        }
        if ($to = ($filters['to'] ?? null)) {
            $query->where('created_at', '<=', $to);
        }

        return $query->orderByDesc('created_at')
            ->paginate(min((int) ($filters['perPage'] ?? 25), 100));
    }

    public function find(int $id): StudentReport
    {
        $report = StudentReport::with([
            'student', 'lesson.chapter.grade', 'module',
            'questionAttempt.exerciseAttempt', 'questionAttempt.hintEvents',
            'assignee', 'resolver', 'notes.author',
        ])->find($id);

        if (! $report) {
            throw new DomainException('Signalement introuvable.');
        }

        return $report;
    }

    /**
     * Les signalements qui décrivent le MÊME problème (§17).
     *
     * Regroupement déterministe par empreinte : même leçon, même module ou
     * exercice, même question, même catégorie. Pas de classification floue —
     * vingt-cinq élèves bloqués sur la même question doivent apparaître comme
     * un problème, et ça suffit à le savoir.
     */
    public function siblings(StudentReport $report): array
    {
        $query = StudentReport::where('fingerprint', $report->fingerprint)
            ->where('id', '!=', $report->id);

        return [
            'total' => $query->count() + 1,
            'others' => $query->latest()->limit(50)->get(),
        ];
    }

    /** Les groupes de signalements les plus nombreux — la vue « quoi réparer d'abord ». */
    public function clusters(int $limit = 20): array
    {
        return StudentReport::select(
            'fingerprint',
            'lesson_code',
            'module_number',
            'exercise_code',
            'question_id',
            'category',
            DB::raw('COUNT(*) as reports_count'),
            DB::raw('MAX(created_at) as last_reported_at'),
        )
            ->whereIn('status', [StudentReport::STATUS_NEW, StudentReport::STATUS_IN_REVIEW])
            ->groupBy('fingerprint', 'lesson_code', 'module_number', 'exercise_code', 'question_id', 'category')
            ->havingRaw('COUNT(*) > 1')
            ->orderByDesc('reports_count')
            ->limit($limit)
            ->get()
            ->all();
    }

    /** @param array<string, mixed> $changes */
    public function update(User $admin, int $id, array $changes): StudentReport
    {
        $report = $this->find($id);
        $before = $report->only(['status', 'priority', 'assigned_to', 'duplicate_of_id']);

        if (isset($changes['status'])) {
            $report->status = $changes['status'];

            // Résolu / rejeté : on retient qui a tranché et quand. Rouvrir
            // efface la trace, sinon un signalement réouvert paraîtrait
            // toujours résolu par quelqu'un.
            if (in_array($changes['status'], [StudentReport::STATUS_RESOLVED, StudentReport::STATUS_DISMISSED], true)) {
                $report->resolved_at = now();
                $report->resolved_by = $admin->id;
            } else {
                $report->resolved_at = null;
                $report->resolved_by = null;
            }
        }

        if (array_key_exists('priority', $changes)) {
            $report->priority = $changes['priority'];
        }

        if (array_key_exists('assignedTo', $changes)) {
            $report->assigned_to = $changes['assignedTo'];
        }

        if (array_key_exists('duplicateOfId', $changes)) {
            $target = $changes['duplicateOfId'];

            if ($target !== null) {
                if ((int) $target === $report->id) {
                    throw new DomainException('Un signalement ne peut pas être le doublon de lui-même.');
                }
                if (! StudentReport::whereKey($target)->exists()) {
                    throw new DomainException('Signalement de référence introuvable.');
                }
            }

            $report->duplicate_of_id = $target;
        }

        $report->save();

        $this->log->log(
            $admin,
            ActivityLogger::REPORT_UPDATED,
            'report',
            $report->id,
            $before,
            $report->only(['status', 'priority', 'assigned_to', 'duplicate_of_id']),
        );

        return $report->fresh(['student', 'lesson', 'module', 'assignee', 'resolver', 'notes.author']);
    }

    /** Une note INTERNE. Jamais exposée à l'élève. */
    public function addNote(User $admin, int $reportId, string $body): ReportNote
    {
        $report = $this->find($reportId);

        $note = ReportNote::create([
            'student_report_id' => $report->id,
            'user_id' => $admin->id,
            'body' => $body,
        ]);

        $this->log->log($admin, ActivityLogger::REPORT_NOTE_ADDED, 'report', $report->id);

        return $note->load('author');
    }
}
