<?php

namespace Tests\Feature;

use App\Models\Classroom;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * Les questions PENDANT les labos : un enseignant les coupe pour SON compte seulement. Un élève n'y a jamais accès (elles sont obligatoires).
 */
class TeacherLabSettingsTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    public function test_l_enseignant_coupe_et_rallume_pour_son_seul_compte(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $url = "/api/v1/teacher/labs/{$lessons[0]->code}";
        $teacher = $this->tokenOf(Classroom::factory()->create()->teacher);
        $other = $this->tokenOf(Classroom::factory()->create()->teacher);

        $this->withToken($teacher)->getJson($url)->assertOk()->assertJsonPath('checkpointsOff', []);
        $this->withToken($teacher)->patchJson($url, ['lab' => 'nashat:gear-crank', 'checkpoints' => false])->assertOk()->assertJsonPath('checkpointsOff', ['nashat:gear-crank']);
        $this->withToken($teacher)->getJson($url)->assertJsonPath('checkpointsOff', ['nashat:gear-crank']);
        // un autre enseignant n'est pas touché
        $this->withToken($other)->getJson($url)->assertJsonPath('checkpointsOff', []);
        $this->withToken($teacher)->patchJson($url, ['lab' => 'nashat:gear-crank', 'checkpoints' => true])->assertOk()->assertJsonPath('checkpointsOff', []);
    }

    public function test_un_eleve_ne_peut_ni_lire_ni_couper_et_les_entrees_illisibles_sont_refusees(): void
    {
        $this->defaultTeacherPlan();
        ['lessons' => $lessons] = $this->grade4am(1);
        $url = "/api/v1/teacher/labs/{$lessons[0]->code}";
        $student = $this->tokenOf($this->student());
        $teacher = $this->tokenOf(Classroom::factory()->create()->teacher);

        $this->withToken($student)->getJson($url)->assertForbidden();
        $this->withToken($student)->patchJson($url, ['lab' => 'nashat:gear-crank', 'checkpoints' => false])->assertForbidden();
        $this->withToken($teacher)->patchJson($url, ['lab' => '<script>', 'checkpoints' => false])->assertStatus(422);
        $this->withToken($teacher)->getJson('/api/v1/teacher/labs/no-such-lesson')->assertNotFound();
    }
}
