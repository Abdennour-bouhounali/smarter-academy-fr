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
    /**
     * Fenêtre de réutilisation d'un signal encore incomplet. Assez longue
     * pour couvrir une hésitation ou une fermeture accidentelle, assez courte
     * pour qu'un problème rencontré à nouveau une heure plus tard compte
     * comme un nouveau signalement.
     */
    private const DRAFT_REUSE_MINUTES = 30;

    public function __construct(private ActivityLogger $log) {}

    /**
     * Le SIGNAL : un élève a buté ici.
     *
     * Créé au CLIC, avant toute saisie. « Un élève a rencontré un problème sur
     * ce module » est déjà une information exploitable, même s'il referme la
     * fenêtre sans rien écrire — et c'est précisément l'information qu'un
     * formulaire abandonné fait perdre aujourd'hui.
     *
     * `category` reste NULL jusqu'à ce que l'élève choisisse. Poser 'other'
     * par défaut inventerait une réponse qu'il n'a pas donnée et fausserait
     * durablement le comptage par catégorie.
     *
     * DÉDUPLICATION : un signal encore incomplet, du même élève, sur le même
     * contexte, et récent, est RENVOYÉ au lieu d'être recréé. Ouvrir et
     * refermer la fenêtre cinq fois ne fabrique pas cinq signalements. En
     * revanche, un signal DÉJÀ complété n'est jamais réutilisé : signaler une
     * erreur de maths puis, plus tard, une manipulation cassée sur le même
     * module sont deux problèmes distincts (§15).
     *
     * @param  array<string, mixed>  $payload  déjà validé par le contrôleur
     */
    public function initiate(User $student, array $payload): StudentReport
    {
        $context = $this->resolveContext($student, $payload);

        // Empreinte SANS catégorie à ce stade : elle n'existe pas encore. Elle
        // est recalculée à la complétion, quand la catégorie est connue.
        $fingerprint = StudentReport::fingerprintFor($context['fingerprintParts'] + ['category' => '']);

        $existing = StudentReport::where('user_id', $student->id)
            ->where('fingerprint', $fingerprint)
            ->whereNull('details_completed_at')
            ->where('created_at', '>=', now()->subMinutes(self::DRAFT_REUSE_MINUTES))
            ->latest()
            ->first();

        if ($existing) {
            return $existing;
        }

        return StudentReport::create($context['attributes'] + [
            'user_id' => $student->id,
            'category' => null,
            'note' => null,
            'status' => StudentReport::STATUS_NEW,
            // Sans catégorie, aucune priorité ne peut être déduite : on part
            // du milieu, et la complétion la réévalue.
            'priority' => 'medium',
            'fingerprint' => $fingerprint,
        ]);
    }

    /**
     * La COMPLÉTION : l'élève a choisi une catégorie et, peut-être, écrit.
     *
     * Le propriétaire seul peut compléter son signalement, et seulement tant
     * qu'il est incomplet — un signalement déjà envoyé ne se réécrit pas.
     */
    public function complete(User $student, int $reportId, array $payload): StudentReport
    {
        $report = StudentReport::where('id', $reportId)->first();

        if ($report === null || $report->user_id !== $student->id) {
            // Ne révèle pas qu'il existe : un signalement d'un autre élève et
            // un signalement inexistant doivent être indiscernables.
            throw new DomainException('Signalement introuvable.');
        }

        if ($report->hasDetails()) {
            throw new DomainException('Ce signalement a déjà été envoyé.');
        }

        $category = $payload['category'];
        $isTechnical = in_array($category, StudentReport::TECHNICAL_CATEGORIES, true);

        $report->fill([
            'category' => $category,
            'note' => $payload['note'] ?? null,
            'priority' => $this->initialPriority($category),
            'details_completed_at' => now(),
            // L'empreinte intègre enfin la catégorie : c'est ce qui permet de
            // regrouper « 25 élèves, même question, même problème » (§17).
            'fingerprint' => StudentReport::fingerprintFor([
                'lesson_code' => $report->lesson_code,
                'module_number' => $report->module_number,
                'exercise_code' => $report->exercise_code,
                'question_id' => $report->question_id,
                'category' => $category,
            ]),
        ]);

        // Le contexte machine ne se garde que pour ce qui décrit une panne :
        // une faute de frappe n'a pas besoin du navigateur de l'élève.
        if (! $isTechnical) {
            $report->fill(['browser' => null, 'os' => null, 'screen' => null]);
        }

        $report->save();

        return $report;
    }

    /**
     * Résout le contexte CÔTÉ SERVEUR, à partir des seuls codes.
     *
     * Rien de ce qui est une clé étrangère ne vient du client. Un
     * `lesson_id` posté serait ignoré — il n'est même pas validé.
     *
     * @return array{attributes: array<string, mixed>, fingerprintParts: array<string, mixed>}
     */
    private function resolveContext(User $student, array $payload): array
    {
        $lessonCode = $payload['lessonCode'] ?? null;
        $moduleNumber = $payload['moduleNumber'] ?? null;
        $source = $payload['source'] ?? StudentReport::SOURCE_LESSON;

        $lesson = $lessonCode ? $this->resolveLesson($lessonCode, $payload['grade'] ?? null) : null;

        // Le module doit APPARTENIR à la leçon : c'est la garde anti-IDOR.
        // Chercher le module par (lesson_id, number) plutôt que par un id posté
        // rend structurellement impossible de rattacher le module d'une leçon
        // au signalement d'une autre.
        $module = null;
        if ($lesson && $moduleNumber !== null) {
            $module = LessonModule::where('lesson_id', $lesson->id)
                ->where('number', $moduleNumber)
                ->whereNull('retired_at')
                ->first();
        }

        // La tentative n'est rattachée que si elle appartient à cet élève.
        $attempt = null;
        if ($uuid = ($payload['attemptUuid'] ?? null)) {
            $attempt = QuestionAttempt::where('attempt_uuid', $uuid)
                ->where('user_id', $student->id)
                ->first();
        }

        return [
            'attributes' => [
                'lesson_id' => $lesson?->id,
                'lesson_module_id' => $module?->id,
                'lesson_code' => $lessonCode,
                'module_number' => $moduleNumber,
                'step' => $payload['step'] ?? null,
                'exercise_code' => $payload['exerciseCode'] ?? null,
                'question_id' => $payload['questionId'] ?? null,
                'practice_session_id' => $payload['sessionId'] ?? null,
                'question_attempt_id' => $attempt?->id,
                'source' => $source,
                'route' => $payload['route'] ?? null,
                'browser' => $payload['browser'] ?? null,
                'os' => $payload['os'] ?? null,
                'screen' => $payload['screen'] ?? null,
                'app_version' => $payload['appVersion'] ?? null,
                'error_ref' => $payload['errorRef'] ?? null,
            ],
            'fingerprintParts' => [
                'lesson_code' => $lessonCode,
                'module_number' => $moduleNumber,
                'exercise_code' => $payload['exerciseCode'] ?? null,
                'question_id' => $payload['questionId'] ?? null,
            ],
        ];
    }

    /**
     * Priorité d'entrée. Une réponse fausse ou un contenu erroné trompent
     * activement l'élève : ils commencent plus haut qu'une coquille.
     * L'administrateur reste libre de la changer.
     */
    private function initialPriority(string $category): string
    {
        return match ($category) {
            // Ces trois-là TROMPENT activement l'élève : une réponse fausse,
            // une erreur de maths ou une correction erronée lui apprennent
            // quelque chose de faux. Ils passent devant.
            StudentReport::CATEGORY_MATH_ERROR,
            StudentReport::CATEGORY_ANSWER,
            'wrong_answer', 'content_error' => 'high',

            // Une manipulation cassée bloque, sans rien enseigner de faux.
            StudentReport::CATEGORY_MANIPULATION,
            'interaction_problem' => 'high',

            StudentReport::CATEGORY_TYPO => 'low',
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

        foreach (['status', 'priority', 'category', 'source'] as $field) {
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

        // Les signaux SANS description sont VISIBLES par défaut.
        //
        // Ils étaient masqués au départ, par crainte qu'ils noient les
        // signalements décrits. Mais un signal caché derrière une case à
        // cocher est un signal que personne ne regarde — et « douze élèves ont
        // ouvert la fenêtre sur ce module sans rien écrire » est justement ce
        // qu'on veut voir. Ils sont donc listés, et clairement étiquetés comme
        // incomplets plutôt que confondus avec un signalement abouti.
        //
        // `completion=incomplete` isole les signaux non décrits,
        // `completion=complete` les signalements aboutis.
        $completion = $filters['completion'] ?? null;

        if ($completion === 'incomplete') {
            $query->whereNull('details_completed_at');
        } elseif ($completion === 'complete') {
            $query->whereNotNull('details_completed_at');
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

        // Même règle qu'ailleurs : la décision et sa trace sont indivisibles.
        DB::transaction(function () use ($admin, $report, $before) {
            $report->save();

            $this->log->log(
                $admin,
                ActivityLogger::REPORT_UPDATED,
                'report',
                $report->id,
                $before,
                $report->only(['status', 'priority', 'assigned_to', 'duplicate_of_id']),
            );
        });

        return $report->fresh(['student', 'lesson', 'module', 'assignee', 'resolver', 'notes.author']);
    }

    /** Une note INTERNE. Jamais exposée à l'élève. */
    public function addNote(User $admin, int $reportId, string $body): ReportNote
    {
        $report = $this->find($reportId);

        $note = DB::transaction(function () use ($admin, $report, $body) {
            $created = ReportNote::create([
                'student_report_id' => $report->id,
                'user_id' => $admin->id,
                'body' => $body,
            ]);

            // Le journal retient QU'UNE note a été ajoutée, jamais son
            // contenu : une note interne peut citer un élève, et un journal
            // d'audit n'est pas l'endroit pour en garder une seconde copie.
            $this->log->log($admin, ActivityLogger::REPORT_NOTE_ADDED, 'report', $report->id);

            return $created;
        });

        return $note->load('author');
    }
}
