<?php

namespace App\Domain\School;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Progress\Engine\MasteryState;
use App\Models\Grade;
use App\Models\LearningPoint;
use App\Models\School;
use App\Models\SchoolReportSnapshot;
use App\Models\SchoolTerm;
use App\Models\StudentLearningPointProgress;
use App\Models\User;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * « التقارير » (SCHOOL_ADMIN_SPACE.md §7, phase 5) — un constructeur par type,
 * une forme versionnée, un rapport FIGÉ.
 *
 *   student      بطاقة متابعة التلميذ    le dossier de l'élève (le même que son وليّ)
 *   class        تقرير القسم             الكفاءات de la classe en effectifs + les élèves à suivre
 *   grade        تقرير المستوى           les classes côte à côte + les كفاءات les plus difficiles
 *   school_term  الحصيلة الفصلية          chaque niveau en un coup d'œil
 *   teachers     نشاط الأساتذة           les FAITS de chaque enseignant (D4)
 *
 * Tout se calcule avec les services du suivi (SchoolProgressService) et des
 * enseignants : aucun rapport ne recalcule une maîtrise, et aucun ne contient
 * une moyenne. Le serveur rend des codes, des nombres et des noms ; les
 * libellés et l'export CSV sont faits par le client (« l'API parle en codes »).
 */
class SchoolReportService
{
    public function __construct(
        private SchoolProgressService $progress,
        private SchoolClassroomService $classrooms,
        private SchoolTeacherService $teachers,
        private SchoolOverviewService $overview,
        private ActivityLogger $logger,
    ) {}

    /**
     * Générer et figer un rapport.
     *
     * @throws SchoolException
     */
    public function generate(User $director, School $school, string $type, ?string $scope, ?int $termId): SchoolReportSnapshot
    {
        $term = null;
        if ($termId !== null) {
            $term = SchoolTerm::where('id', $termId)->where('school_id', $school->id)->first();
            if ($term === null) {
                throw new SchoolException(SchoolException::INVALID_REPORT, 'Trimestre inconnu.');
            }
        }

        [$title, $payload] = match ($type) {
            SchoolReportSnapshot::TYPE_STUDENT => $this->student($school, (int) $scope),
            SchoolReportSnapshot::TYPE_CLASS => $this->classReport($school, (int) $scope),
            SchoolReportSnapshot::TYPE_GRADE => $this->grade($school, (string) $scope),
            SchoolReportSnapshot::TYPE_SCHOOL_TERM => $this->schoolTerm($school),
            SchoolReportSnapshot::TYPE_TEACHERS => $this->teacherActivity($school),
            default => throw new SchoolException(SchoolException::INVALID_REPORT, 'Type de rapport inconnu.'),
        };

        $snapshot = new SchoolReportSnapshot([
            'type' => $type,
            'scope' => $scope,
            'term_id' => $term?->id,
            'title' => $title,
            'payload' => $payload,
            'schema_version' => SchoolReportSnapshot::SCHEMA_VERSION,
            'generated_at' => Carbon::now(),
        ]);
        $snapshot->school_id = $school->id;
        $snapshot->generated_by = $director->id;
        $snapshot->save();

        $this->logger->log($director, ActivityLogger::SCHOOL_REPORT_GENERATED, 'school_report', $snapshot->id, null, [
            'schoolId' => $school->id, 'type' => $type, 'scope' => $scope,
        ]);

        return $snapshot;
    }

    /** @return array<int, array<string, mixed>> les rapports de l'établissement, les plus récents d'abord (sans charge utile) */
    public function list(School $school): array
    {
        return SchoolReportSnapshot::with('term')
            ->where('school_id', $school->id)
            ->orderByDesc('generated_at')
            ->orderByDesc('id')
            ->limit(200)
            ->get()
            ->map(fn (SchoolReportSnapshot $s) => self::summary($s))
            ->all();
    }

    /** @throws SchoolException */
    public function find(School $school, int $id): SchoolReportSnapshot
    {
        $snapshot = SchoolReportSnapshot::with('term')->where('school_id', $school->id)->find($id);
        if ($snapshot === null) {
            throw new SchoolException(SchoolException::REPORT_NOT_FOUND, 'Rapport introuvable.');
        }

        return $snapshot;
    }

    /** @throws SchoolException */
    public function delete(User $director, School $school, int $id): void
    {
        $snapshot = $this->find($school, $id);
        $snapshot->delete();
        $this->logger->log($director, ActivityLogger::SCHOOL_REPORT_DELETED, 'school_report', $id, ['type' => $snapshot->type], null);
    }

    /** @return array<string, mixed> */
    public static function summary(SchoolReportSnapshot $s): array
    {
        return [
            'id' => $s->id,
            'type' => $s->type,
            'scope' => $s->scope,
            'title' => $s->title,
            'term' => $s->term ? ['id' => $s->term->id, 'term' => $s->term->term, 'academicYear' => $s->term->academic_year] : null,
            'schemaVersion' => $s->schema_version,
            'generatedAt' => $s->generated_at->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    public static function full(SchoolReportSnapshot $s, School $school): array
    {
        return [
            ...self::summary($s),
            'school' => ['name' => $school->name, 'wilaya' => $school->wilaya, 'commune' => $school->commune],
            'payload' => $s->payload,
        ];
    }

    // ── Les constructeurs ────────────────────────────────────────────────

    /** @return array{0: string, 1: array<string, mixed>} */
    private function student(School $school, int $studentId): array
    {
        try {
            $file = $this->progress->studentFile($school, $studentId);
        } catch (HttpException) {
            throw new SchoolException(SchoolException::STUDENT_NOT_IN_SCHOOL, 'Cet élève n\'est pas dans l\'établissement.');
        }

        return [trim($file['student']['firstName'].' '.$file['student']['lastName']), $file];
    }

    /** @return array{0: string, 1: array<string, mixed>} */
    private function classReport(School $school, int $classroomId): array
    {
        $classroom = $this->classrooms->schoolClassroom($school, $classroomId);
        $classroom->loadMissing('teacher:id,first_name,last_name');
        $map = $this->progress->learningMap($school, $classroom->grade);
        $key = (string) $classroom->id;

        $lessons = array_map(fn ($lesson) => [
            'code' => $lesson['code'],
            'title' => $lesson['title'],
            'learningPoints' => array_map(fn ($lp) => [
                'code' => $lp['code'],
                'title' => $lp['title'],
                'counts' => $lp['byClass'][$key],
            ], $lesson['learningPoints']),
        ], $map['lessons']);

        // Les élèves à suivre : combien de كفاءات en ثغرة, à renforcer, maîtrisées.
        $codes = collect($map['lessons'])->flatMap(fn ($l) => array_column($l['learningPoints'], 'code'))->all();
        $pointIds = $codes === [] ? [] : LearningPoint::whereIn('code', $codes)->pluck('id')->all();
        $memberships = SchoolAccess::consentedMemberships($school)
            ->where('classroom_memberships.classroom_id', $classroom->id)
            ->with('student:'.SchoolAccess::IDENTITY_COLUMNS)
            ->get();
        $byStudent = [];
        if ($pointIds !== [] && $memberships->isNotEmpty()) {
            $rows = StudentLearningPointProgress::whereIn('user_id', $memberships->pluck('student_id'))
                ->whereIn('learning_point_id', $pointIds)
                ->groupBy('user_id', 'status')
                ->selectRaw('user_id, status, count(*) as c')
                ->toBase()
                ->get();
            foreach ($rows as $r) {
                $byStudent[(int) $r->user_id][$r->status] = (int) $r->c;
            }
        }
        $students = $memberships->map(fn ($m) => [
            ...SchoolAccess::identity($m->student, $m->student_id),
            'gap' => $byStudent[$m->student_id][MasteryState::STATUS_GAP] ?? 0,
            'reinforce' => $byStudent[$m->student_id][MasteryState::STATUS_REINFORCE] ?? 0,
            'mastered' => $byStudent[$m->student_id][MasteryState::STATUS_MASTERED] ?? 0,
        ])->sortBy([['gap', 'desc'], ['reinforce', 'desc'], ['lastName', 'asc']])->values()->all();

        return [$classroom->name, [
            'classroom' => [
                'id' => $classroom->id,
                'name' => $classroom->name,
                'grade' => $classroom->grade,
                'gradeName' => Grade::where('code', $classroom->grade)->value('name'),
                'teacher' => $classroom->teacher ? SchoolAccess::identity($classroom->teacher) : null,
            ],
            'students' => count($students),
            'lessons' => $lessons,
            'studentsToWatch' => $students,
        ]];
    }

    /** @return array{0: string, 1: array<string, mixed>} */
    private function grade(School $school, string $grade): array
    {
        if (! in_array($grade, $this->progress->grades($school), true)) {
            throw new SchoolException(SchoolException::INVALID_REPORT, 'Niveau sans classe dans l\'établissement.');
        }
        $map = $this->progress->learningMap($school, $grade);
        $gradeName = Grade::where('code', $grade)->value('name') ?? $grade;

        return [$gradeName, [
            'grade' => $grade,
            'gradeName' => $gradeName,
            'map' => $map,
            'hardest' => self::hardest($map, 10),
        ]];
    }

    /** @return array{0: string, 1: array<string, mixed>} */
    private function schoolTerm(School $school): array
    {
        $grades = [];
        foreach ($this->progress->grades($school) as $grade) {
            $map = $this->progress->learningMap($school, $grade);
            $states = ['mastered' => 0, 'reinforce' => 0, 'gap' => 0, 'unassessed' => 0];
            foreach ($map['lessons'] as $lesson) {
                foreach ($lesson['learningPoints'] as $lp) {
                    foreach ($states as $k => $v) {
                        $states[$k] += $lp['total'][$k];
                    }
                }
            }
            $grades[] = [
                'grade' => $grade,
                'gradeName' => Grade::where('code', $grade)->value('name') ?? $grade,
                'classes' => count($map['classes']),
                'students' => array_sum(array_column($map['classes'], 'students')),
                // Des effectifs (élève × كفاءة), jamais une moyenne.
                'states' => $states,
                'hardest' => self::hardest($map, 5),
            ];
        }

        return [$school->name, [
            'counts' => $this->overview->overview($school)['counts'],
            'grades' => $grades,
        ]];
    }

    /** @return array{0: string, 1: array<string, mixed>} */
    private function teacherActivity(School $school): array
    {
        return [$school->name, ['teachers' => $this->teachers->list($school)]];
    }

    /**
     * Les كفاءات où la difficulté touche une classe entière ou un petit groupe,
     * les plus nombreuses en ثغرة d'abord.
     *
     * @return array<int, array<string, mixed>>
     */
    private static function hardest(array $map, int $limit): array
    {
        $all = [];
        foreach ($map['lessons'] as $lesson) {
            foreach ($lesson['learningPoints'] as $lp) {
                if (in_array($lp['difficultyScope'], ['class_wide', 'small_group'], true)) {
                    $all[] = ['code' => $lp['code'], 'title' => $lp['title'], 'lessonTitle' => $lesson['title'], 'total' => $lp['total'], 'difficultyScope' => $lp['difficultyScope']];
                }
            }
        }
        usort($all, fn ($a, $b) => $b['total']['gap'] <=> $a['total']['gap']);

        return array_slice($all, 0, $limit);
    }
}
