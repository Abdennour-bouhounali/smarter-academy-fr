<?php

namespace App\Domain\School;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Classroom\ClassroomException;
use App\Domain\Classroom\ClassroomMembershipService;
use App\Domain\Classroom\StudentCredentials;
use App\Domain\Classroom\TeacherCapacityService;
use App\Domain\Identity\PersonName;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\School;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Les ÉLÈVES d'un établissement (SCHOOL_ADMIN_SPACE.md §7, phase 3) :
 * l'import d'une liste de classe, la liste, le changement de classe et les
 * cartes de connexion.
 *
 * L'import se fait en deux temps, sur les MÊMES lignes : `preview` ne crée
 * rien et dit ce qui arrivera à chaque ligne ; `commit` crée tout ou rien.
 * Un élève importé reçoit un « معرّف الدخول » généré (décision du propriétaire,
 * 2026-10-26) — sans boîte aux lettres — et un mot de passe rendu UNE fois,
 * imprimé sur sa carte. Il est inscrit par la direction (D2) : il confirmera
 * le partage dans « قسمي ».
 *
 * Un homonyme se reconnaît au prénom + nom + date de naissance, parmi les
 * élèves que l'établissement lit déjà : la ligne est sautée, jamais doublée.
 */
class SchoolRosterService
{
    public const STATUS_NEW = 'new';

    public const STATUS_EXISTS = 'exists';

    public const STATUS_DUPLICATE_IN_FILE = 'duplicate_in_file';

    public const STATUS_INVALID = 'invalid';

    public function __construct(
        private ClassroomMembershipService $memberships,
        private TeacherCapacityService $capacity,
        private ActivityLogger $logger,
        private SchoolCapacityService $schoolCapacity,
    ) {}

    /**
     * Ce que l'import FERAIT, ligne par ligne. Ne crée rien.
     *
     * @param  array<int, array<string, mixed>>  $rows
     * @return array{rows: array<int, array<string, mixed>>, counts: array<string, int>, seatsRemaining: ?int}
     *
     * @throws SchoolException
     */
    public function preview(School $school, Classroom $classroom, array $rows): array
    {
        $this->assertSize($rows);
        $known = $this->knownKeys($school);
        $seen = [];
        $out = [];

        foreach (array_values($rows) as $i => $row) {
            [$first, $last, $birth, $problem] = $this->clean($row);
            $key = $first !== null && $last !== null && $birth !== null ? self::key($first, $last, $birth) : null;

            $status = match (true) {
                $problem !== null => self::STATUS_INVALID,
                isset($known[$key]) => self::STATUS_EXISTS,
                isset($seen[$key]) => self::STATUS_DUPLICATE_IN_FILE,
                default => self::STATUS_NEW,
            };
            if ($key !== null) {
                $seen[$key] = true;
            }

            $out[] = ['line' => $i + 1, 'firstName' => $first, 'lastName' => $last, 'birthDate' => $birth, 'status' => $status, 'problem' => $problem];
        }

        $counts = array_count_values(array_column($out, 'status')) + array_fill_keys([self::STATUS_NEW, self::STATUS_EXISTS, self::STATUS_DUPLICATE_IN_FILE, self::STATUS_INVALID], 0);

        // Les sièges qui comptent : ceux de la licence de l'établissement si
        // elle court, sinon ceux de l'enseignant de la classe.
        $schoolSeats = $this->schoolCapacity->remainingSeats($school);

        return [
            'rows' => $out,
            'counts' => $counts,
            'seatsRemaining' => $schoolSeats ?? $this->capacity->remainingSeats($classroom->teacher),
            'seatsFrom' => $schoolSeats !== null ? 'school' : 'teacher',
        ];
    }

    /**
     * Crée les comptes des lignes NOUVELLES et les inscrit — tout ou rien. Une
     * ligne invalide refuse l'import entier (le directeur corrige d'abord).
     *
     * @param  array<int, array<string, mixed>>  $rows
     * @return array<int, array{id: int, firstName: string, lastName: string, login: string, password: string}>
     *
     * @throws SchoolException|ClassroomException
     */
    public function commit(User $director, School $school, Classroom $classroom, array $rows): array
    {
        $preview = $this->preview($school, $classroom, $rows);
        if ($preview['counts'][self::STATUS_INVALID] > 0) {
            throw new SchoolException(SchoolException::INVALID_ROSTER, 'Certaines lignes sont invalides.');
        }

        $cards = DB::transaction(function () use ($school, $classroom, $preview) {
            $cards = [];
            foreach ($preview['rows'] as $row) {
                if ($row['status'] !== self::STATUS_NEW) {
                    continue;
                }
                $password = StudentCredentials::generate();
                $student = new User([
                    'first_name' => $row['firstName'],
                    'last_name' => $row['lastName'],
                    'email' => StudentCredentials::uniqueLogin("s{$school->id}"),
                    'password' => $password,
                    'role' => User::ROLE_STUDENT,
                    'grade' => $classroom->grade,
                ]);
                $student->birth_date = $row['birthDate'];
                $student->email_verified_at = Carbon::now();
                $student->save();

                $this->memberships->enrolBySchool($student, $classroom);

                $cards[] = [
                    'id' => $student->id,
                    'firstName' => $student->first_name,
                    'lastName' => $student->last_name,
                    'login' => $student->email,
                    'password' => $password,
                ];
            }

            return $cards;
        });

        $this->logger->log($director, ActivityLogger::SCHOOL_ROSTER_IMPORTED, 'classroom', $classroom->id, null, [
            'schoolId' => $school->id,
            'created' => count($cards),
            'skipped' => count($preview['rows']) - count($cards),
            'studentIds' => array_column($cards, 'id'),
        ]);

        return $cards;
    }

    /**
     * Les élèves que l'établissement lit, classe par classe. Le « معرّف الدخول »
     * n'est rendu que s'il a été GÉNÉRÉ par l'établissement — jamais une
     * adresse réelle.
     *
     * @return array<int, array<string, mixed>>
     */
    public function students(School $school, ?int $classroomId = null): array
    {
        $query = SchoolAccess::consentedMemberships($school)
            ->with(['student:id,first_name,last_name,email', 'classroom:id,name,grade'])
            ->orderBy('classroom_id');
        if ($classroomId !== null) {
            $query->where('classroom_memberships.classroom_id', $classroomId);
        }

        return $query->get()
            ->filter(fn (ClassroomMembership $m) => $m->student !== null)
            ->sortBy(fn (ClassroomMembership $m) => [$m->classroom_id, $m->student->last_name, $m->student->first_name])
            ->map(fn (ClassroomMembership $m) => [
                ...SchoolAccess::identity($m->student),
                'classroom' => ['id' => $m->classroom->id, 'name' => $m->classroom->name, 'grade' => $m->classroom->grade],
                'login' => $m->student->hasSchoolLogin() ? $m->student->email : null,
                'enrolledBySchool' => $m->joined_via === ClassroomMembership::VIA_SCHOOL_ENROLMENT,
            ])
            ->values()
            ->all();
    }

    /**
     * Changer un élève de classe, dans l'établissement : il quitte l'ancienne,
     * la direction l'inscrit dans la nouvelle (une classe à la fois, capacité
     * du nouvel enseignant). Un « oui » qu'il avait donné à l'établissement
     * le suit.
     *
     * @throws SchoolException|ClassroomException
     */
    public function transfer(User $director, School $school, int $studentId, Classroom $target): void
    {
        $student = $this->readableStudent($school, $studentId);
        $current = SchoolAccess::consentedMemberships($school)
            ->where('classroom_memberships.student_id', $student->id)
            ->first();
        if ($current === null || $current->classroom_id === $target->id) {
            return;
        }

        DB::transaction(function () use ($director, $school, $student, $current, $target) {
            $from = $current->classroom_id;
            $byStudent = $current->school_consent_by === ClassroomMembership::SCHOOL_CONSENT_BY_STUDENT;
            // L'ancienne adhésion est close ICI (et non par `leave`, qui
            // journaliserait un départ de l'élève) : c'est la direction qui agit.
            $current->forceFill([
                'status' => ClassroomMembership::STATUS_REMOVED,
                'left_at' => Carbon::now(),
                'removed_by' => $director->id,
            ])->save();
            $membership = $this->memberships->enrolBySchool($student, $target);
            if ($byStudent) {
                $membership->forceFill(['school_consent_by' => ClassroomMembership::SCHOOL_CONSENT_BY_STUDENT])->save();
            }

            $this->logger->log($director, ActivityLogger::SCHOOL_STUDENT_TRANSFERRED, 'school', $school->id,
                ['classroomId' => $from], ['classroomId' => $target->id, 'studentId' => $student->id]);
        });
    }

    /**
     * Rééditer les cartes : un NOUVEAU mot de passe par élève, rendu une fois.
     * Seulement pour les comptes créés par l'établissement (معرّف الدخول) — le
     * mot de passe d'un compte personnel n'appartient qu'à son élève.
     *
     * @param  int[]  $studentIds
     * @return array<int, array{id: int, firstName: ?string, lastName: ?string, login: string, password: string}>
     *
     * @throws SchoolException
     */
    public function reissueCredentials(User $director, School $school, array $studentIds): array
    {
        $students = array_map(fn ($id) => $this->readableStudent($school, (int) $id), array_values(array_unique($studentIds)));
        foreach ($students as $s) {
            if (! $s->hasSchoolLogin()) {
                throw new SchoolException(SchoolException::NOT_SCHOOL_LOGIN, 'Ce compte n\'a pas été créé par l\'établissement.');
            }
        }

        $cards = DB::transaction(function () use ($students) {
            return array_map(function (User $s) {
                $password = StudentCredentials::generate();
                $s->forceFill(['password' => $password])->save();

                return ['id' => $s->id, 'firstName' => $s->first_name, 'lastName' => $s->last_name, 'login' => $s->email, 'password' => $password];
            }, $students);
        });

        $this->logger->log($director, ActivityLogger::SCHOOL_CREDENTIALS_ISSUED, 'school', $school->id, null, [
            'studentIds' => array_column($cards, 'id'),
        ]);

        return $cards;
    }

    /** @throws SchoolException */
    private function readableStudent(School $school, int $studentId): User
    {
        try {
            return SchoolAccess::activeStudent($school, $studentId);
        } catch (Throwable) {
            throw new SchoolException(SchoolException::STUDENT_NOT_IN_SCHOOL, 'Cet élève n\'est pas dans l\'établissement.');
        }
    }

    /** @throws SchoolException */
    private function assertSize(array $rows): void
    {
        if ($rows === [] || count($rows) > (int) config('school.roster_max_rows')) {
            throw new SchoolException(SchoolException::INVALID_ROSTER, 'Liste vide ou trop longue.');
        }
    }

    /**
     * Une ligne nettoyée : [prénom, nom, date Y-m-d, problème|null]. Les noms
     * suivent la règle de tout compte (lettres arabes, PersonName) ; la date
     * doit donner un âge plausible d'élève du moyen (8 à 20 ans).
     *
     * @return array{0: ?string, 1: ?string, 2: ?string, 3: ?string}
     */
    private function clean(array $row): array
    {
        $first = PersonName::normalize($row['firstName'] ?? null);
        $last = PersonName::normalize($row['lastName'] ?? null);
        $first = is_string($first) && $first !== '' ? $first : null;
        $last = is_string($last) && $last !== '' ? $last : null;

        foreach (['firstName' => $first, 'lastName' => $last] as $field => $name) {
            if ($name === null) {
                return [$first, $last, null, "{$field}_missing"];
            }
            $length = mb_strlen($name);
            if ($length < PersonName::MIN || $length > PersonName::MAX || ! preg_match(PersonName::PATTERN, $name)) {
                return [$first, $last, null, "{$field}_not_arabic"];
            }
        }

        $raw = trim((string) ($row['birthDate'] ?? ''));
        $date = preg_match('/^\d{4}-\d{2}-\d{2}$/', $raw) ? Carbon::createFromFormat('!Y-m-d', $raw) : false;
        if ($date === false || $date->format('Y-m-d') !== $raw) {
            return [$first, $last, null, 'birthDate_invalid'];
        }
        $age = $date->diffInYears(Carbon::now());
        if ($age < 8 || $age > 20) {
            return [$first, $last, $raw, 'birthDate_out_of_range'];
        }

        return [$first, $last, $raw, null];
    }

    /** @return array<string, true> les élèves déjà lus par l'établissement, par clé d'homonymie */
    private function knownKeys(School $school): array
    {
        $keys = [];
        foreach (SchoolAccess::consentedMemberships($school)->with('student:id,first_name,last_name,birth_date')->get() as $m) {
            $s = $m->student;
            if ($s !== null && $s->birth_date !== null) {
                $keys[self::key((string) $s->first_name, (string) $s->last_name, $s->birth_date->format('Y-m-d'))] = true;
            }
        }

        return $keys;
    }

    private static function key(string $first, string $last, string $birth): string
    {
        return mb_strtolower($first).'|'.mb_strtolower($last).'|'.$birth;
    }
}
