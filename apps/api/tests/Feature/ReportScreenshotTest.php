<?php

namespace Tests\Feature;

use App\Domain\Admin\ReportScreenshotStore;
use App\Models\StudentReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * La CAPTURE D'ÉCRAN jointe à un signalement : disque privé, type lu sur le
 * contenu, 2 Mo au plus, servie aux seuls administrateurs. Une capture
 * refusée annule l'envoi entier — pas de signalement à moitié.
 */
class ReportScreenshotTest extends TestCase
{
    use RefreshDatabase;

    private User $ambassador;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake(ReportScreenshotStore::DISK);

        $this->ambassador = User::factory()->create(['role' => User::ROLE_TEACHER]);
        $this->ambassador->forceFill(['is_ambassador' => true])->save();
        $this->admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
    }

    private function send(array $files, ?User $as = null)
    {
        return $this->actingAs($as ?? $this->ambassador, 'sanctum')->post('/api/v1/reports', [
            'source' => 'lesson', 'lessonCode' => 'x', 'category' => 'display_problem',
            'note' => 'Le texte ne s’affiche pas bien.',
        ] + $files, ['Accept' => 'application/json']);
    }

    public function test_une_capture_png_est_stockee_en_prive_et_servie_a_l_admin(): void
    {
        $id = $this->send(['screenshot' => UploadedFile::fake()->image('capture.png', 800, 500)])
            ->assertStatus(201)
            ->assertJsonPath('report.hasScreenshot', true)
            ->json('report.id');

        $report = StudentReport::find($id);
        $this->assertNotNull($report->screenshot_path);
        $this->assertStringStartsWith("reports/{$id}/", $report->screenshot_path);
        $this->assertStringEndsWith('.png', $report->screenshot_path);
        Storage::disk(ReportScreenshotStore::DISK)->assertExists($report->screenshot_path);

        $this->actingAs($this->admin, 'sanctum')->get("/api/v1/admin/reports/{$id}/screenshot")
            ->assertOk()
            ->assertHeader('Content-Type', 'image/png')
            ->assertHeader('X-Content-Type-Options', 'nosniff');

        $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/reports')
            ->assertJsonPath('counts.withScreenshot', 1)
            ->assertJsonPath('reports.data.0.hasScreenshot', true);
        $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/admin/reports?screenshot=1')
            ->assertJsonCount(1, 'reports.data');
    }

    public function test_jpeg_et_webp_sont_acceptes(): void
    {
        $this->send(['screenshot' => UploadedFile::fake()->image('c.jpg', 200, 200)])->assertStatus(201);
        if (function_exists('imagewebp')) {
            $this->send(['screenshot' => UploadedFile::fake()->image('c.webp', 200, 200)])->assertStatus(201);
        }
        $this->assertSame(StudentReport::count(), StudentReport::whereNotNull('screenshot_path')->count());
    }

    public function test_un_faux_fichier_image_est_refuse_et_rien_n_est_cree(): void
    {
        // Une extension d'image ne suffit pas : le contenu est lu.
        $fake = UploadedFile::fake()->createWithContent('capture.png', '<?php echo "hello"; ?>');
        $this->send(['screenshot' => $fake])->assertStatus(422);

        $svg = UploadedFile::fake()->createWithContent('capture.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
        $this->send(['screenshot' => $svg])->assertStatus(422);

        $this->assertSame(0, StudentReport::count(), 'une capture refusée annule tout l\'envoi');
        $this->assertSame([], Storage::disk(ReportScreenshotStore::DISK)->allFiles());
    }

    public function test_une_capture_de_plus_de_2_mo_est_refusee(): void
    {
        $this->send(['screenshot' => UploadedFile::fake()->image('big.png')->size(ReportScreenshotStore::MAX_KILOBYTES + 1)])
            ->assertStatus(422)
            ->assertJsonValidationErrors('screenshot');
        $this->assertSame(0, StudentReport::count());
    }

    public function test_sans_capture_la_route_admin_repond_404(): void
    {
        $id = $this->send([])->assertStatus(201)->json('report.id');
        $this->actingAs($this->admin, 'sanctum')->get("/api/v1/admin/reports/{$id}/screenshot")->assertNotFound();
        $this->actingAs($this->admin, 'sanctum')->get('/api/v1/admin/reports/999999/screenshot')->assertNotFound();
    }

    public function test_la_capture_n_est_servie_qu_a_l_admin(): void
    {
        $id = $this->send(['screenshot' => UploadedFile::fake()->image('capture.png', 100, 100)])->json('report.id');

        foreach ([$this->ambassador, User::factory()->create(['role' => User::ROLE_STUDENT])] as $user) {
            $this->actingAs($user, 'sanctum')->getJson("/api/v1/admin/reports/{$id}/screenshot")->assertStatus(403);
        }
    }
}
