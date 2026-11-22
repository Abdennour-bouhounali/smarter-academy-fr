<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * L'inscription enseignant : même formulaire, même vérification d'adresse,
 * et l'offre GRATUITE effective aussitôt — sans ligne, sans approbation.
 */
class TeacherRegistrationTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_un_enseignant_s_inscrit_verifie_et_est_sur_l_offre_gratuite(): void
    {
        Notification::fake();
        $this->defaultTeacherPlan();
        $this->grade4am(0);

        $response = $this->postJson('/api/v1/auth/register', [
            'firstName' => 'أمين', 'lastName' => 'بن علي',
            'email' => 'prof@example.dz', 'password' => 'Passw0rd123', 'accept_legal' => true, 'accountType' => 'teacher',
        ])->assertCreated()->assertJsonPath('user.role', 'teacher');

        $token = $response->json('token');
        $user = User::where('email', 'prof@example.dz')->firstOrFail();

        // Adresse non vérifiée : l'espace est fermé, pas le compte.
        $this->withToken($token)->getJson('/api/v1/teacher/dashboard')->assertStatus(403)->assertJsonPath('emailVerified', false);

        $user->markEmailAsVerified();

        $dashboard = $this->withToken($token)->getJson('/api/v1/teacher/dashboard')->assertOk();
        $this->assertSame('default', $dashboard->json('dashboard.entitlements.plan.source'));
        $this->assertSame('teacher-free', $dashboard->json('dashboard.entitlements.plan.slug'));
        $this->assertSame(1, $dashboard->json('dashboard.entitlements.classes.maximum'));
        $this->assertDatabaseCount('subscriptions', 0);

        // Et les limites gratuites s'exercent : une classe, pas deux.
        $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => '4AM A', 'grade' => '4am'])->assertCreated();
        $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => '4AM B', 'grade' => '4am'])
            ->assertStatus(422)->assertJsonPath('reason', 'limit_reached');
    }

    public function test_le_type_de_compte_est_une_liste_blanche(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'firstName' => 'أمين', 'lastName' => 'بن علي',
            'email' => 'x@example.dz', 'password' => 'Passw0rd123', 'accept_legal' => true, 'accountType' => 'admin',
        ])->assertStatus(422);

        $this->assertDatabaseMissing('users', ['email' => 'x@example.dz']);
    }

    public function test_sans_type_l_inscription_reste_un_eleve(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'firstName' => 'أمين', 'lastName' => 'بن علي',
            'email' => 'e@example.dz', 'password' => 'Passw0rd123', 'accept_legal' => true,
        ])->assertCreated()->assertJsonPath('user.role', 'student');
    }

    public function test_un_enseignant_n_entre_pas_dans_l_espace_eleve_ni_dans_l_administration(): void
    {
        $teacher = $this->teacher();
        $token = $this->tokenOf($teacher);

        $this->withToken($token)->getJson('/api/v1/admin/dashboard')->assertStatus(403);
        $this->withToken($token)->getJson('/api/v1/student/study-context')->assertOk()
            ->assertJsonPath('studyContext.mode', 'independent');
    }
}
