<?php

namespace App\Domain\School;

use App\Domain\Admin\ActivityLogger;
use App\Domain\Classroom\StudentCredentials;
use App\Models\School;
use App\Models\SchoolStaff;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Les établissements, côté ADMINISTRATION de la plateforme : créer, régler,
 * suspendre, nommer et retirer le directeur (SCHOOL_ADMIN_SPACE.md §5).
 *
 * Chaque geste est journalisé dans la même transaction. Le mot de passe du
 * directeur n'existe en clair que dans la valeur de retour d'appointDirector :
 * jamais dans un journal, jamais relisible.
 */
class SchoolService
{
    public function __construct(private ActivityLogger $logger) {}

    /** @param array<string, mixed> $filters */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = School::query()
            ->with('activeDirector.user:id,first_name,last_name,email')
            ->withCount('classrooms');

        if ($search = trim((string) ($filters['search'] ?? ''))) {
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('code', $search)
                ->orWhere('wilaya', 'like', "%{$search}%")
                ->orWhere('commune', 'like', "%{$search}%"));
        }
        if (in_array($status = ($filters['status'] ?? null), School::STATUSES, true)) {
            $query->where('status', $status);
        }

        return $query->orderByDesc('id')->paginate(min((int) ($filters['perPage'] ?? 25), 100));
    }

    /** @param array<string, mixed> $attrs */
    public function create(User $admin, array $attrs): School
    {
        return DB::transaction(function () use ($admin, $attrs) {
            $school = new School($this->fields($attrs));
            $school->created_by = $admin->id;
            $school->save();

            $this->logger->log($admin, ActivityLogger::SCHOOL_CREATED, 'school', $school->id, null, $school->only(['name', 'wilaya', 'commune', 'code']));

            return $school;
        });
    }

    /** @param array<string, mixed> $attrs */
    public function update(User $admin, School $school, array $attrs): School
    {
        return DB::transaction(function () use ($admin, $school, $attrs) {
            $before = $school->only(['name', 'wilaya', 'commune', 'code', 'current_academic_year']);
            $school->fill($this->fields($attrs))->save();

            $this->logger->log($admin, ActivityLogger::SCHOOL_UPDATED, 'school', $school->id, $before, $school->only(array_keys($before)));

            return $school;
        });
    }

    /** @throws SchoolException */
    public function setStatus(User $admin, School $school, string $status): School
    {
        if (! in_array($status, School::STATUSES, true)) {
            throw new SchoolException(SchoolException::INVALID_STATUS, 'Statut inconnu.');
        }

        return DB::transaction(function () use ($admin, $school, $status) {
            $before = $school->status;
            $school->status = $status;
            $school->save();

            $this->logger->log($admin, ActivityLogger::SCHOOL_STATUS, 'school', $school->id, ['status' => $before], ['status' => $status]);

            return $school;
        });
    }

    /**
     * Nommer le directeur : un NOUVEAU compte `school_admin`, adresse vérifiée
     * (l'administration l'a saisie et remet les identifiants elle-même), et un
     * mot de passe rendu UNE fois.
     *
     * Une adresse qui a déjà un compte est refusée : transformer un compte
     * d'enseignant en directeur rendrait ses classes orphelines.
     *
     * @param  array{firstName: string, lastName: string, email: string}  $person
     * @return array{director: User, password: string}
     *
     * @throws SchoolException
     */
    public function appointDirector(User $admin, School $school, array $person): array
    {
        return DB::transaction(function () use ($admin, $school, $person) {
            School::whereKey($school->id)->lockForUpdate()->first();

            if (! $school->isActive()) {
                throw new SchoolException(SchoolException::SCHOOL_INACTIVE, 'L\'établissement n\'est pas actif.');
            }
            if ($school->activeDirector()->exists()) {
                throw new SchoolException(SchoolException::DIRECTOR_EXISTS, 'Cet établissement a déjà un directeur.');
            }
            $email = mb_strtolower(trim($person['email']));
            if (User::where('email', $email)->exists()) {
                throw new SchoolException(SchoolException::EMAIL_TAKEN, 'Cette adresse a déjà un compte.');
            }

            $password = self::generatePassword();
            $director = new User([
                'first_name' => $person['firstName'],
                'last_name' => $person['lastName'],
                'email' => $email,
                'password' => $password,
                'role' => User::ROLE_SCHOOL_ADMIN,
            ]);
            $director->email_verified_at = now();
            $director->save();

            $staff = new SchoolStaff(['appointed_at' => now()]);
            $staff->school_id = $school->id;
            $staff->user_id = $director->id;
            $staff->appointed_by = $admin->id;
            $staff->save();

            $this->logger->log($admin, ActivityLogger::SCHOOL_DIRECTOR_APPOINTED, 'school', $school->id, null, [
                'directorId' => $director->id,
                'firstName' => $director->first_name,
                'lastName' => $director->last_name,
            ]);

            return ['director' => $director, 'password' => $password];
        });
    }

    /**
     * Retirer le directeur : la nomination est close, le compte reste — il ne
     * passe plus la deuxième couche (SchoolAccess::schoolOf → no_school) et ses
     * jetons sont révoqués.
     *
     * @throws SchoolException
     */
    public function revokeDirector(User $admin, School $school): void
    {
        DB::transaction(function () use ($admin, $school) {
            $staff = $school->activeDirector()->lockForUpdate()->first();
            if ($staff === null) {
                throw new SchoolException(SchoolException::NO_DIRECTOR, 'Aucun directeur en fonction.');
            }

            $staff->status = SchoolStaff::STATUS_REVOKED;
            $staff->revoked_at = now();
            $staff->save();
            $staff->user?->tokens()->delete();

            $this->logger->log($admin, ActivityLogger::SCHOOL_DIRECTOR_REVOKED, 'school', $school->id, ['directorId' => $staff->user_id], null);
        });
    }

    /**
     * Deux mots de passe de « بطاقات الدخول » joints : 17 caractères faciles à
     * recopier (« kmar4827-tbqe5513 »). Plus long que celui d'un élève : ce
     * compte lit les données de tout un établissement.
     */
    public static function generatePassword(): string
    {
        return StudentCredentials::generate().'-'.StudentCredentials::generate();
    }

    /**
     * @param  array<string, mixed>  $attrs
     * @return array<string, mixed>
     */
    private function fields(array $attrs): array
    {
        $map = ['name' => 'name', 'wilaya' => 'wilaya', 'commune' => 'commune', 'code' => 'code', 'currentAcademicYear' => 'current_academic_year'];
        $out = [];
        foreach ($map as $in => $column) {
            if (array_key_exists($in, $attrs)) {
                $value = is_string($attrs[$in]) ? trim($attrs[$in]) : $attrs[$in];
                $out[$column] = $value === '' ? null : $value;
            }
        }

        return $out;
    }

    /** @return array<string, mixed> */
    public static function serialize(School $school): array
    {
        $director = $school->relationLoaded('activeDirector') ? $school->activeDirector?->user : null;

        return [
            'id' => $school->id,
            'name' => $school->name,
            'wilaya' => $school->wilaya,
            'commune' => $school->commune,
            'code' => $school->code,
            'status' => $school->status,
            'currentAcademicYear' => $school->current_academic_year,
            'classroomsCount' => $school->classrooms_count ?? null,
            // L'administration voit l'adresse du directeur (comme celle d'un enseignant).
            'director' => $director ? [
                'id' => $director->id,
                'firstName' => $director->first_name,
                'lastName' => $director->last_name,
                'email' => $director->email,
            ] : null,
            'createdAt' => optional($school->created_at)->toIso8601String(),
        ];
    }
}
