<?php

namespace Tests\Feature;

use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * La gestion des leçons filtre par الوحدة — l'unité du manuel, entre le
 * ميدان et le درس. À ne pas confondre avec le module d'une leçon (المحور).
 * Les options du filtre sont lues en base : exactement les unités qui portent
 * une leçon, sans liste écrite dans l'interface.
 */
class AdminLessonUnitFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_lessons_can_be_filtered_by_unit_and_units_are_listed_from_the_database(): void
    {
        $grade = Grade::create(['code' => '4am', 'name' => '4am', 'level' => 'moyen', 'order' => 0, 'is_active' => true]);
        $chapter = Chapter::create(['grade_id' => $grade->id, 'code' => 'midan', 'title' => 'ميدان', 'order' => 0]);
        $unit = Unit::create(['chapter_id' => $chapter->id, 'code' => 'wahda-1', 'title' => 'الأعداد الطبيعيّة والأعداد النّاطقة', 'order' => 0]);
        Unit::create(['chapter_id' => $chapter->id, 'code' => 'wahda-vide', 'title' => 'وحدة بلا درس', 'order' => 1]);
        Lesson::create(['chapter_id' => $chapter->id, 'unit_id' => $unit->id, 'code' => 'dans-unite', 'title' => 'أ', 'status' => 'available', 'order' => 0, 'tier' => 'free']);
        Lesson::create(['chapter_id' => $chapter->id, 'code' => 'hors-unite', 'title' => 'ب', 'status' => 'available', 'order' => 1, 'tier' => 'free']);

        $token = User::factory()->create(['role' => User::ROLE_ADMIN])->createToken('t')->plainTextToken;

        $all = $this->withToken($token)->getJson('/api/v1/admin/content/lessons')->assertOk();
        $this->assertCount(2, $all->json('lessons.data'));
        // Seule l'unité qui porte une leçon est proposée.
        $all->assertJsonPath('units.0.code', 'wahda-1')
            ->assertJsonPath('units.0.title', 'الأعداد الطبيعيّة والأعداد النّاطقة')
            ->assertJsonPath('units.0.lessonsCount', 1)
            ->assertJsonCount(1, 'units');

        $filtered = $this->withToken($token)->getJson('/api/v1/admin/content/lessons?unit=wahda-1')->assertOk();
        $this->assertSame(['dans-unite'], array_column($filtered->json('lessons.data'), 'code'));
        $filtered->assertJsonPath('lessons.data.0.unit', 'wahda-1')
            ->assertJsonPath('lessons.data.0.unitTitle', 'الأعداد الطبيعيّة والأعداد النّاطقة');
    }
}
