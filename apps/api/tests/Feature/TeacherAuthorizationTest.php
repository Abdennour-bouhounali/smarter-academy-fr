<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * La porte de l'espace enseignant, balayée route par route — comme
 * AdminAuthorizationTest : une route /teacher ajoutée demain sans
 * protection est attrapée ici.
 */
class TeacherAuthorizationTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    /** @return array<int, array{string, string}> */
    private function teacherRoutes(): array
    {
        $routes = [];
        foreach (app('router')->getRoutes() as $route) {
            if (! str_starts_with($route->uri(), 'api/v1/teacher')) {
                continue;
            }
            $uri = str_replace(
                // `{uuid}` : une photo de copie (contrainte whereUuid) — un vrai UUID,
                // sinon la route répondrait 404 AVANT le contrôle du rôle.
                ['{id}', '{studentId}', '{lessonId}', '{requestId}', '{planId}', '{noteId}', '{interventionId}', '{uuid}'],
                ['1', '1', '1', '1', '1', '1', '1', '00000000-0000-4000-8000-000000000000'],
                $route->uri()
            );
            foreach (array_diff($route->methods(), ['HEAD']) as $method) {
                $routes[] = [$method, '/'.$uri];
            }
        }

        return $routes;
    }

    public function test_un_visiteur_est_refuse_partout(): void
    {
        $routes = $this->teacherRoutes();
        $this->assertGreaterThan(15, count($routes));

        foreach ($routes as [$method, $uri]) {
            $this->assertSame(401, $this->json($method, $uri)->status(), "{$method} {$uri}");
        }
    }

    public function test_un_eleve_et_un_admin_sont_refuses_partout(): void
    {
        foreach ([$this->student(), $this->admin()] as $user) {
            $token = $this->tokenOf($user);
            foreach ($this->teacherRoutes() as [$method, $uri]) {
                $status = $this->withToken($token)->json($method, $uri)->status();
                $this->assertSame(403, $status, "{$user->role} {$method} {$uri} → {$status}");
            }
        }
    }

    public function test_un_enseignant_passe_la_porte(): void
    {
        $this->defaultTeacherPlan();
        $teacher = $this->teacher();

        $this->withToken($this->tokenOf($teacher))
            ->getJson('/api/v1/teacher/dashboard')
            ->assertOk()
            ->assertJsonPath('dashboard.entitlements.plan.source', 'default');
    }

    public function test_un_enseignant_non_verifie_est_refuse(): void
    {
        $teacher = $this->teacher(['email_verified_at' => null]);

        $this->withToken($this->tokenOf($teacher))
            ->getJson('/api/v1/teacher/dashboard')
            ->assertStatus(403)
            ->assertJsonPath('emailVerified', false);
    }

    public function test_la_classe_d_un_autre_enseignant_repond_403(): void
    {
        $this->defaultTeacherPlan();
        $owner = $this->teacher();
        $other = $this->teacher();
        $classroom = Classroom::factory()->ownedBy($owner)->create();

        $token = $this->tokenOf($other);
        $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}")->assertStatus(403);
        $this->withToken($token)->patchJson("/api/v1/teacher/classrooms/{$classroom->id}", ['name' => 'x'])->assertStatus(403);
        $this->withToken($token)->getJson("/api/v1/teacher/classrooms/{$classroom->id}/students")->assertStatus(403);
        $this->withToken($token)->postJson("/api/v1/teacher/classrooms/{$classroom->id}/lessons/bulk", ['lessonIds' => [1], 'status' => 'hidden'])->assertStatus(403);

        $this->assertSame($classroom->fresh()->name !== 'x', true);
    }

    public function test_le_corps_ne_choisit_jamais_le_proprietaire(): void
    {
        $this->defaultTeacherPlan();
        $this->grade4am(0);
        $teacher = $this->teacher();
        $victim = $this->teacher();

        $this->withToken($this->tokenOf($teacher))
            ->postJson('/api/v1/teacher/classrooms', ['name' => '4AM A', 'grade' => '4am', 'teacherId' => $victim->id, 'teacher_id' => $victim->id])
            ->assertCreated();

        $this->assertDatabaseHas('classrooms', ['name' => '4AM A', 'teacher_id' => $teacher->id]);
        $this->assertDatabaseMissing('classrooms', ['teacher_id' => $victim->id]);
        $this->assertSame(User::ROLE_TEACHER, $teacher->fresh()->role);
    }
}
