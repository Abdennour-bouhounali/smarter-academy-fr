<?php

namespace App\Domain\Admin;

use App\Domain\Classroom\StudentCredentials;
use App\Domain\Progress\StudentDossier;
use App\Models\StudentLessonProgress;
use App\Models\User;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Les élèves vus par l'administration.
 *
 * Tout ce qui est affiché ici est DÉRIVÉ des tables d'apprentissage
 * existantes — progression, preuves, maîtrise, tentatives. Aucune colonne
 * « points faibles » n'est maintenue en double : la maîtrise a déjà un
 * propriétaire (ProgressEngine / student_learning_point_progress), et en
 * tenir une seconde copie garantirait qu'elles divergent.
 */
class StudentService
{
    /** Le préfixe du « معرّف الدخول » d'un compte créé par l'administrateur (`s<id>` est celui d'un établissement). */
    public const ADMIN_LOGIN_PREFIX = 'a';

    public const EMAIL_TAKEN_MESSAGE = 'Cette adresse e-mail est déjà liée à un compte.';

    public function __construct(private ActivityLogger $log) {}

    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = User::query()
            ->where('role', User::ROLE_STUDENT)
            ->withCount([
                'lessonProgress as lessons_started_count',
                'lessonProgress as lessons_completed_count' => fn ($q) => $q->where('status', StudentLessonProgress::STATUS_COMPLETED),
                'reports as reports_count',
            ])
            ->with(['subscriptions' => fn ($q) => $q->orderByDesc('started_at')->limit(1)]);

        if ($search = ($filters['search'] ?? null)) {
            $query->where(fn ($q) => $q
                ->where('email', 'like', "%{$search}%")
                ->orWhere('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('id', $search));
        }

        if ($grade = ($filters['grade'] ?? null)) {
            $query->where('grade', $grade);
        }

        if ($status = ($filters['status'] ?? null)) {
            $query->where('account_status', $status);
        }

        if ($subscription = ($filters['subscription'] ?? null)) {
            $query->whereHas('subscriptions', fn ($q) => $q->where('status', $subscription));
        }

        // « Actif depuis » : une date, pas un booléen — le seuil appartient à
        // celui qui regarde, pas à ce service.
        if ($since = ($filters['activeSince'] ?? null)) {
            $query->where('last_activity_at', '>=', $since);
        }

        $sort = $filters['sort'] ?? 'created_at';
        $direction = ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $sortable = ['created_at', 'last_activity_at', 'email', 'grade', 'account_status', 'lessons_completed_count'];
        $query->orderBy(in_array($sort, $sortable, true) ? $sort : 'created_at', $direction);

        return $query->paginate(min((int) ($filters['perPage'] ?? 25), 100));
    }

    public function find(int $id): User
    {
        $student = User::where('role', User::ROLE_STUDENT)->find($id);

        if (! $student) {
            throw new DomainException('Élève introuvable.');
        }

        return $student;
    }

    /**
     * Le dossier d'apprentissage complet d'un élève — calculé par
     * App\Domain\Progress\StudentDossier, partagé avec l'enseignant.
     *
     * @return array<string, mixed>
     */
    public function profile(User $student): array
    {
        return StudentDossier::profile($student);
    }

    /** @return array<int, array<string, mixed>> */
    public function timeline(User $student, int $limit = 50): array
    {
        return StudentDossier::timeline($student, $limit);
    }

    /**
     * Change le statut d'un compte élève — par AccountStatusService, partagé
     * avec les enseignants : une seule règle « désactiver révoque les jetons,
     * suspendre les garde, rien ne touche l'apprentissage ».
     */
    public function changeStatus(User $admin, int $studentId, string $status): User
    {
        return app(AccountStatusService::class)->change($admin, $this->find($studentId), $status, ActivityLogger::STUDENT_STATUS, 'student');
    }

    /**
     * L'administrateur crée un compte élève (propriétaire, 2026-11-21) — que les inscriptions soient ouvertes ou
     * fermées : ce n'est pas une inscription publique, RegistrationGate n'est pas consulté.
     *
     * Comme un élève importé par un établissement (SchoolRosterService::commit) : adresse vérifiée (l'administrateur
     * remet les identifiants lui-même), mot de passe StudentCredentials rendu UNE fois, aucun consentement légal écrit
     * à sa place (les colonnes restent nulles, comme pour l'import). Sans adresse, un « معرّف الدخول » généré
     * (`a.<6>@<domaine>`), sans boîte aux lettres : aucun courriel ne lui part (User::routeNotificationForMail).
     * Aucune notification « new_student » : l'administrateur sait déjà.
     *
     * `$data` : firstName, lastName (déjà validés et normalisés par PersonName), email (minuscules, nettoyée) ou null,
     * grade (code validé) ou null.
     *
     * @param  array{firstName: string, lastName: string, email: ?string, grade: ?string}  $data
     * @return array{student: User, login: string, password: string}
     *
     * @throws DomainException adresse déjà prise (EMAIL_TAKEN_MESSAGE)
     */
    public function create(User $admin, array $data): array
    {
        $email = $data['email'] ?? null;
        if ($email !== null && User::where('email', $email)->exists()) {
            throw new DomainException(self::EMAIL_TAKEN_MESSAGE);
        }

        $password = StudentCredentials::generate();

        $student = DB::transaction(function () use ($admin, $data, $email, $password) {
            $student = new User([
                'first_name' => $data['firstName'],
                'last_name' => $data['lastName'],
                'email' => $email ?? StudentCredentials::uniqueLogin(self::ADMIN_LOGIN_PREFIX),
                'password' => $password,
                'role' => User::ROLE_STUDENT,
                'grade' => $data['grade'] ?? null,
            ]);
            $student->email_verified_at = now();
            $student->save();

            // Jamais le mot de passe ; l'identifiant n'est pas un secret (l'administrateur le lit dans la liste).
            $this->log->log($admin, ActivityLogger::STUDENT_CREATED, 'user', $student->id, null, [
                'firstName' => $student->first_name,
                'lastName' => $student->last_name,
                'grade' => $student->grade,
                'generatedLogin' => $email === null,
            ]);

            return $student;
        });

        return ['student' => $student, 'login' => $student->email, 'password' => $password];
    }
}
