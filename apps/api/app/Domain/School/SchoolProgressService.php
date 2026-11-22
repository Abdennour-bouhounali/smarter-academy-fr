<?php

namespace App\Domain\School;

use App\Domain\Classroom\ClassroomProgressService;
use App\Domain\Classroom\Insights\LearningTrend;
use App\Domain\Family\ParentProgressService;
use App\Domain\Progress\Engine\MasteryState;
use App\Models\Classroom;
use App\Models\School;
use Illuminate\Support\Facades\DB;

/**
 * Le SUIVI de l'établissement (SCHOOL_ADMIN_SPACE.md §7, phase 4).
 *
 * Il ne recalcule rien : il LIT l'état canonique de Mastery V2
 * (`student_learning_point_progress`) — celui que lisent l'élève, son
 * enseignant et l'administration — sur les seuls élèves que l'établissement
 * peut lire (SchoolAccess::consentedMemberships).
 *
 * Des DISTRIBUTIONS, jamais une moyenne : pour chaque الكفاءة et chaque
 * classe, combien d'élèves sont « متحكَّم فيها », « تحتاج تعزيزًا », en
 * « ثغرة », ou pas encore évalués. Le temps d'étude n'y figure pas : le texte
 * que l'élève accepte parle de son avancement et de ses كفاءات.
 *
 * Coût : trois requêtes groupées pour un niveau, quelle que soit la taille
 * de l'établissement (+ la mémoire des leçons effectives de chaque classe).
 */
class SchoolProgressService
{
    public function __construct(
        private ClassroomProgressService $classroomProgress,
        private ParentProgressService $parentProgress,
    ) {}

    /** Les niveaux qui ont au moins une classe active dans l'établissement. @return string[] */
    public function grades(School $school): array
    {
        return Classroom::where('school_id', $school->id)
            ->where('status', Classroom::STATUS_ACTIVE)
            ->distinct()
            ->orderBy('grade')
            ->pluck('grade')
            ->all();
    }

    /**
     * La carte des الكفاءات d'un niveau, classe par classe.
     *
     * @return array{grade: string, classes: array<int, array{id: int, name: string, students: int}>, lessons: array<int, array<string, mixed>>}
     */
    public function learningMap(School $school, string $grade): array
    {
        $classes = Classroom::where('school_id', $school->id)
            ->where('status', Classroom::STATUS_ACTIVE)
            ->where('grade', $grade)
            ->orderBy('name')
            ->get(['id', 'name', 'grade', 'teacher_id', 'status']);

        // Les leçons de la carte : celles qu'au moins une classe voit.
        $lessonIds = [];
        foreach ($classes as $c) {
            $lessonIds = array_merge($lessonIds, $this->classroomProgress->effectiveLessonIds($c));
        }
        $lessonIds = array_values(array_unique($lessonIds));
        $classIds = $classes->pluck('id')->all();

        $students = $classIds === [] ? collect() : SchoolAccess::consentedMemberships($school)
            ->whereIn('classroom_memberships.classroom_id', $classIds)
            ->selectRaw('classroom_memberships.classroom_id as classroom_id, count(*) as c')
            ->groupBy('classroom_memberships.classroom_id')
            ->toBase()
            ->pluck('c', 'classroom_id');

        $points = $lessonIds === [] ? collect() : DB::table('learning_points as lp')
            ->join('lessons as l', 'l.id', '=', 'lp.lesson_id')
            ->whereIn('lp.lesson_id', $lessonIds)
            ->whereNull('lp.retired_at')
            ->orderBy('l.order')->orderBy('l.id')->orderBy('lp.order')
            ->get(['lp.id', 'lp.code', 'lp.title', 'l.code as lesson_code', 'l.title as lesson_title']);

        // UNE requête : (classe, الكفاءة, statut) → effectif, sur les élèves lisibles.
        $counts = [];
        if ($points->isNotEmpty() && $classIds !== []) {
            $rows = SchoolAccess::consentedMemberships($school)
                ->whereIn('classroom_memberships.classroom_id', $classIds)
                ->join('student_learning_point_progress as s', 's.user_id', '=', 'classroom_memberships.student_id')
                ->whereIn('s.learning_point_id', $points->pluck('id')->all())
                ->groupBy('classroom_memberships.classroom_id', 's.learning_point_id', 's.status')
                ->selectRaw('classroom_memberships.classroom_id as classroom_id, s.learning_point_id as point_id, s.status as status, count(*) as c')
                ->toBase()
                ->get();
            foreach ($rows as $r) {
                $counts[(int) $r->point_id][(int) $r->classroom_id][$r->status] = (int) $r->c;
            }
        }

        $lessons = [];
        foreach ($points as $p) {
            $lessons[$p->lesson_code] ??= ['code' => $p->lesson_code, 'title' => $p->lesson_title, 'learningPoints' => []];
            $byClass = [];
            $total = ['mastered' => 0, 'reinforce' => 0, 'gap' => 0, 'unassessed' => 0];
            foreach ($classes as $c) {
                $row = $counts[$p->id][$c->id] ?? [];
                $cell = [
                    'mastered' => $row[MasteryState::STATUS_MASTERED] ?? 0,
                    'reinforce' => $row[MasteryState::STATUS_REINFORCE] ?? 0,
                    'gap' => $row[MasteryState::STATUS_GAP] ?? 0,
                ];
                $cell['unassessed'] = max(0, (int) ($students[$c->id] ?? 0) - $cell['mastered'] - $cell['reinforce'] - $cell['gap']);
                $byClass[(string) $c->id] = $cell;
                foreach ($cell as $k => $v) {
                    $total[$k] += $v;
                }
            }
            $assessed = $total['mastered'] + $total['reinforce'] + $total['gap'];
            $lessons[$p->lesson_code]['learningPoints'][] = [
                'code' => $p->code,
                'title' => $p->title,
                'byClass' => $byClass,
                'total' => $total,
                'difficultyScope' => LearningTrend::difficultyScope($total['gap'], $assessed),
            ];
        }

        return [
            'grade' => $grade,
            'classes' => $classes->map(fn (Classroom $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'students' => (int) ($students[$c->id] ?? 0),
            ])->values()->all(),
            'lessons' => array_values($lessons),
        ];
    }

    /**
     * Le dossier d'UN élève, tel que son وليّ et lui-même le lisent
     * (« التقدّم بالتفصيل », PARENT_SPACE.md §4bis) — la même forme, le même
     * service. 404 s'il n'est pas lisible par l'établissement.
     *
     * @return array<string, mixed>
     */
    public function studentFile(School $school, int $studentId): array
    {
        $student = SchoolAccess::activeStudent($school, $studentId);
        $membership = SchoolAccess::consentedMemberships($school)
            ->with('classroom:id,name,grade')
            ->where('classroom_memberships.student_id', $student->id)
            ->first();

        return [
            'student' => [
                ...SchoolAccess::identity($student),
                'classroom' => $membership?->classroom ? ['id' => $membership->classroom->id, 'name' => $membership->classroom->name] : null,
            ],
            'progress' => $this->parentProgress->forStudent($student),
        ];
    }
}
