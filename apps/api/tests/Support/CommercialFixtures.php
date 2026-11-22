<?php

namespace Tests\Support;

use App\Domain\Access\EntitlementService;
use App\Domain\Classroom\StudyContextService;
use App\Domain\Plans\EntitlementKeys as K;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Les fixtures COMMERCIALES des tests : offres, enseignants, élèves, une
 * classe scolaire avec ses leçons. Rien ici ne code une règle — tout ce
 * qu'un test lit vient des lignes qu'il a semées.
 */
trait CommercialFixtures
{
    /** L'offre enseignant PAR DÉFAUT (le gratuit automatique), aux limites données. */
    protected function defaultTeacherPlan(array $entitlements = []): Plan
    {
        return Plan::factory()->teacher()->default()->withCurrentVersion(array_merge([
            K::CLASSROOMS_MAX => 1,
            K::STUDENTS_PER_CLASSROOM_MAX => 10,
            K::STUDENTS_TOTAL_MAX => 10,
            K::LESSONS_VISIBILITY => true,
            K::LESSONS_BULK_ACTIONS => false,
            K::PROGRESS_CLASS => true,
            K::PROGRESS_STUDENT => true,
            K::STUDENTS_COVERED => false,
            K::CONTENT_ALLOWED_GRADES => ['4am'],
        ], $entitlements))->create(['slug' => 'teacher-free', 'name' => 'Gratuit']);
    }

    /** Une offre enseignant PAYANTE, publique et demandable. */
    protected function paidTeacherPlan(array $entitlements = [], array $attributes = []): Plan
    {
        return Plan::factory()->teacher()->withCurrentVersion(array_merge([
            K::CLASSROOMS_MAX => 5,
            K::STUDENTS_PER_CLASSROOM_MAX => 35,
            K::STUDENTS_TOTAL_MAX => 100,
            K::LESSONS_VISIBILITY => true,
            K::LESSONS_BULK_ACTIONS => true,
            K::PROGRESS_CLASS => true,
            K::PROGRESS_STUDENT => true,
            K::ANALYTICS_ADVANCED => true,
            K::STUDENTS_COVERED => true,
            K::CONTENT_ALLOWED_GRADES => ['4am'],
        ], $entitlements), ['amount_cents' => 1500000, 'duration_days' => 365])
            ->create(array_merge(['slug' => 'teacher-pro', 'name' => 'Pro'], $attributes));
    }

    /** La grille de départ des tests : [min, max|null, centimes par élève]. */
    public const SEAT_TIERS = [[1, 5, 0], [6, 20, 100000], [21, 30, 80000], [31, 50, 70000], [51, 100, 60000], [101, null, 50000]];

    /**
     * L'offre enseignant PAR DÉFAUT du modèle par sièges : N sièges,
     * classes illimitées (aucune limite technique).
     */
    protected function freeSeatsPlan(int $seats = 5, array $entitlements = []): Plan
    {
        return $this->defaultTeacherPlan(array_merge([
            K::STUDENTS_TOTAL_MAX => $seats,
            K::CLASSROOMS_MAX => null,
            K::STUDENTS_PER_CLASSROOM_MAX => null,
        ], $entitlements));
    }

    /**
     * L'offre enseignant PAR SIÈGES : publique, demandable, avec sa grille.
     *
     * @param  array<int, array{0: int, 1: ?int, 2: int}>|null  $tiers
     */
    protected function seatTeacherPlan(?array $tiers = null, array $entitlements = [], array $attributes = []): Plan
    {
        return Plan::factory()->teacher()->withCurrentVersion(array_merge([
            K::CLASSROOMS_MAX => null,
            K::STUDENTS_PER_CLASSROOM_MAX => null,
            K::LESSONS_VISIBILITY => true,
            K::LESSONS_BULK_ACTIONS => true,
            K::PROGRESS_CLASS => true,
            K::PROGRESS_STUDENT => true,
            K::STUDENTS_COVERED => true,
            K::CONTENT_ALLOWED_GRADES => ['4am'],
        ], $entitlements), ['amount_cents' => 0, 'duration_days' => 365], $tiers ?? self::SEAT_TIERS)
            ->create(array_merge(['slug' => 'teacher-seats', 'name' => 'Par élève'], $attributes));
    }

    protected function studentPlan(array $attributes = []): Plan
    {
        return Plan::factory()->student()->withCurrentVersion([], ['amount_cents' => 300000, 'duration_days' => 365])
            ->create(array_merge(['slug' => 'student-premium', 'name' => 'Accès complet'], $attributes));
    }

    protected function admin(): User
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    protected function teacher(array $attributes = []): User
    {
        return User::factory()->create(array_merge(['role' => User::ROLE_TEACHER], $attributes));
    }

    protected function student(array $attributes = []): User
    {
        return User::factory()->create(array_merge(['role' => User::ROLE_STUDENT, 'grade' => '4am'], $attributes));
    }

    protected function tokenOf(User $user): string
    {
        return $user->createToken('t')->plainTextToken;
    }

    /**
     * Changer de compte AU MILIEU d'un test.
     *
     * Le garde Sanctum mémorise l'utilisateur résolu pour la durée du
     * processus : sans cet oubli, la deuxième requête d'un test — même avec
     * un autre jeton — s'exécuterait toujours comme le premier compte, et
     * une adresse vérifiée entre deux appels resterait « non vérifiée ».
     */
    public function withToken($token, $type = 'Bearer')
    {
        $this->app['auth']->forgetGuards();

        return parent::withToken($token, $type);
    }

    /**
     * La classe scolaire 4AM avec N leçons publiées.
     *
     * @return array{grade: Grade, chapter: Chapter, lessons: Collection<int, Lesson>}
     */
    protected function grade4am(int $lessons = 3): array
    {
        $grade = Grade::firstOrCreate(['code' => '4am'], ['name' => 'السنة الرابعة متوسط', 'level' => 'moyen', 'order' => 1, 'is_active' => true]);
        $chapter = Chapter::factory()->create(['grade_id' => $grade->id]);
        $rows = Lesson::factory()->count($lessons)->inChapter($chapter)->create();

        return ['grade' => $grade, 'chapter' => $chapter, 'lessons' => $rows];
    }

    /** Les trois mémoires par requête, vidées : un test observe plusieurs états dans un même processus. */
    protected function forgetAll(): void
    {
        app(EntitlementService::class)->forget();
        app(PlanEntitlementResolver::class)->forget();
        app(StudyContextService::class)->forget();
    }
}
