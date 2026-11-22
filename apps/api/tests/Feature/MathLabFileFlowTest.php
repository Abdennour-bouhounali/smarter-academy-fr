<?php

namespace Tests\Feature;

use App\Domain\MathLab\MathLabFilePolicy;
use App\Models\MathLabDocument;
use App\Models\MathLabFile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Les fichiers d'une سبّورة : 1 Mo par fichier, 3 par document, 50 par
 * élève — tenus par le serveur, sous verrou, sans jamais toucher à
 * l'existant. Le type est lu dans les octets, le propriétaire dans la session.
 */
class MathLabFileFlowTest extends TestCase
{
    use RefreshDatabase;

    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    private User $student;

    private User $other;

    private MathLabDocument $board;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        $this->student = User::factory()->create(['role' => 'student']);
        $this->other = User::factory()->create(['role' => 'student']);
        $this->board = $this->boardFor($this->student);
    }

    private function boardFor(User $user, string $title = 'سبّورة'): MathLabDocument
    {
        return MathLabDocument::create(['user_id' => $user->id, 'tool' => 'whiteboard', 'title' => $title, 'data' => ['elements' => []]]);
    }

    private function png(string $name = 'figure.png', ?int $size = null): UploadedFile
    {
        $bytes = base64_decode(self::PNG);
        if ($size !== null) {
            $bytes .= str_repeat("\0", $size - strlen($bytes));
        }

        return UploadedFile::fake()->createWithContent($name, $bytes);
    }

    private function pdf(string $name = 'exercice.pdf'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");
    }

    private function svg(string $name = 'graphe.svg', string $body = '<rect width="10" height="10"/>'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">'.$body.'</svg>');
    }

    /** Des fichiers « d'avant » : des lignes posées directement, sans passer par l'envoi. */
    private function seedFiles(User $user, MathLabDocument $board, int $count): void
    {
        for ($i = 0; $i < $count; $i++) {
            MathLabFile::create([
                'user_id' => $user->id, 'document_id' => $board->id, 'kind' => 'image',
                'original_name' => "ancien-{$i}.png", 'mime_type' => 'image/png', 'size' => 10, 'disk_path' => "math-lab/{$user->id}/ancien-{$i}.png",
            ]);
        }
    }

    private function upload(MathLabDocument $board, UploadedFile $file, ?User $as = null)
    {
        return $this->actingAs($as ?? $this->student)->post("/api/v1/math-lab/documents/{$board->id}/files", ['file' => $file], ['Accept' => 'application/json']);
    }

    public function test_une_image_entre_et_ressort_avec_ses_compteurs(): void
    {
        $response = $this->upload($this->board, $this->png());

        $response->assertCreated()
            ->assertJsonPath('file.kind', 'image')
            ->assertJsonPath('file.name', 'figure.png')
            ->assertJsonPath('file.mimeType', 'image/png')
            ->assertJsonPath('quota.document.used', 1)
            ->assertJsonPath('quota.document.max', 3)
            ->assertJsonPath('quota.user.used', 1)
            ->assertJsonPath('quota.user.max', 50)
            ->assertJsonPath('quota.limits.maxFileBytes', 1_000_000);

        $file = MathLabFile::first();
        $this->assertSame($this->student->id, $file->user_id);
        Storage::disk('local')->assertExists($file->disk_path);

        $this->actingAs($this->student)->getJson("/api/v1/math-lab/documents/{$this->board->id}")
            ->assertOk()->assertJsonCount(1, 'files')->assertJsonPath('quota.document.used', 1);
        $this->actingAs($this->student)->getJson("/api/v1/math-lab/documents/{$this->board->id}/files")
            ->assertOk()->assertJsonCount(1, 'files');

        $content = $this->actingAs($this->student)->get("/api/v1/math-lab/files/{$file->id}/content");
        $content->assertOk()->assertHeader('Content-Type', 'image/png')->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertStringStartsWith('attachment;', $content->headers->get('Content-Disposition'));
    }

    public function test_pdf_et_svg_entrent_le_svg_avec_script_non(): void
    {
        $this->upload($this->board, $this->pdf())->assertCreated()->assertJsonPath('file.kind', 'pdf');
        $this->upload($this->board, $this->svg())->assertCreated()->assertJsonPath('file.kind', 'svg')->assertJsonPath('file.mimeType', 'image/svg+xml');
        $this->upload($this->board, $this->svg('mechant.svg', '<script>alert(1)</script>'))
            ->assertStatus(422)->assertJsonPath('code', 'math_lab_file_unsupported');
    }

    public function test_la_taille_est_bornee_a_un_million_d_octets(): void
    {
        $this->upload($this->board, $this->png('a.png', 999_000))->assertCreated();
        $this->upload($this->board, $this->png('b.png', 1_000_000))->assertCreated();
        $this->upload($this->board, $this->png('c.png', 1_000_001))
            ->assertStatus(422)->assertJsonPath('code', 'math_lab_file_too_large');

        $this->assertSame(2, MathLabFile::count());
        $this->assertCount(2, Storage::disk('local')->allFiles());
    }

    public function test_le_type_est_lu_dans_les_octets_pas_dans_le_nom(): void
    {
        $this->upload($this->board, UploadedFile::fake()->createWithContent('notes.txt', 'bonjour'))
            ->assertStatus(422)->assertJsonPath('code', 'math_lab_file_unsupported');
        $this->upload($this->board, UploadedFile::fake()->createWithContent('faux.png', 'ceci n est pas une image'))
            ->assertStatus(422)->assertJsonPath('code', 'math_lab_file_unsupported');
        $this->upload($this->board, UploadedFile::fake()->createWithContent('tableur.xlsx', "PK\x03\x04"))
            ->assertStatus(422)->assertJsonPath('code', 'math_lab_file_unsupported');

        $this->assertSame(0, MathLabFile::count());
        $this->assertCount(0, Storage::disk('local')->allFiles());
    }

    public function test_trois_fichiers_par_document_pas_un_de_plus(): void
    {
        foreach ([0, 1, 2] as $i) {
            $this->upload($this->board, $this->png("f{$i}.png"))->assertCreated()->assertJsonPath('quota.document.used', $i + 1);
        }
        $this->upload($this->board, $this->png('f3.png'))
            ->assertStatus(422)->assertJsonPath('code', 'math_lab_board_file_limit')->assertJsonPath('quota.document.used', 3);

        // Un AUTRE document du même élève reste ouvert.
        $this->upload($this->boardFor($this->student, 'autre'), $this->png())->assertCreated();
    }

    public function test_cinquante_fichiers_par_eleve(): void
    {
        $this->seedFiles($this->student, $this->boardFor($this->student, 'archives'), 49);

        $this->upload($this->board, $this->png())->assertCreated()->assertJsonPath('quota.user.used', 50);
        $this->upload($this->board, $this->png('un-de-trop.png'))
            ->assertStatus(422)->assertJsonPath('code', 'math_lab_user_file_limit');
        $this->assertSame(50, MathLabFile::where('user_id', $this->student->id)->count());
    }

    public function test_les_deux_limites_se_verifient_ensemble(): void
    {
        // Document = 2, élève = 49 → un fichier passe.
        $this->seedFiles($this->student, $this->board, 2);
        $this->seedFiles($this->student, $this->boardFor($this->student, 'archives'), 47);
        $this->upload($this->board, $this->png())->assertCreated()->assertJsonPath('quota.document.used', 3)->assertJsonPath('quota.user.used', 50);

        // Document = 2, élève = 50 → refusé pour l'élève.
        $second = $this->boardFor($this->student, 'deux');
        $this->seedFiles($this->student, $second, 2);
        $this->upload($second, $this->png())->assertStatus(422)->assertJsonPath('code', 'math_lab_user_file_limit');

        // Document = 3, élève = 20 → refusé pour le document.
        $fresh = User::factory()->create(['role' => 'student']);
        $full = $this->boardFor($fresh, 'pleine');
        $this->seedFiles($fresh, $full, 3);
        $this->seedFiles($fresh, $this->boardFor($fresh, 'reste'), 17);
        $this->upload($full, $this->png(), $fresh)->assertStatus(422)->assertJsonPath('code', 'math_lab_board_file_limit');
    }

    public function test_deux_envois_de_suite_respectent_le_total(): void
    {
        // Document = 1, élève = 48, deux fichiers → 3 et 50.
        $this->seedFiles($this->student, $this->board, 1);
        $this->seedFiles($this->student, $this->boardFor($this->student, 'archives'), 47);
        $this->upload($this->board, $this->png('a.png'))->assertCreated();
        $this->upload($this->board, $this->png('b.png'))->assertCreated()->assertJsonPath('quota.document.used', 3)->assertJsonPath('quota.user.used', 50);

        // Document = 2, élève = 49, deux fichiers → le premier passe, le second est refusé : jamais 51.
        $fresh = User::factory()->create(['role' => 'student']);
        $board = $this->boardFor($fresh);
        $this->seedFiles($fresh, $board, 2);
        $this->seedFiles($fresh, $this->boardFor($fresh, 'archives'), 47);
        $this->upload($board, $this->png('a.png'), $fresh)->assertCreated()->assertJsonPath('quota.user.used', 50);
        $this->upload($board, $this->png('b.png'), $fresh)->assertStatus(422);
        $this->assertSame(50, MathLabFile::where('user_id', $fresh->id)->count());
    }

    /**
     * Le garde-fou contre deux envois SIMULTANÉS : l'ajout verrouille la ligne
     * de l'élève (SELECT … FOR UPDATE) avant de compter, dans la même
     * transaction que l'insertion. Deux requêtes à 49 passent donc l'une après
     * l'autre, et la seconde compte 50. On vérifie ici que ce verrou est bien
     * pris, avant l'insertion, et que le comptage est lui-même verrouillant.
     */
    public function test_l_ajout_verrouille_l_eleve_avant_de_compter_et_d_inserer(): void
    {
        DB::enableQueryLog();
        $this->upload($this->board, $this->png())->assertCreated();
        $sql = array_map(fn ($q) => strtolower($q['query']), DB::getQueryLog());
        DB::disableQueryLog();

        $lock = array_search(true, array_map(fn ($q) => str_contains($q, 'from `users`') && str_contains($q, 'for update'), $sql), true);
        $count = array_search(true, array_map(fn ($q) => str_contains($q, 'count(*)') && str_contains($q, 'math_lab_files') && str_contains($q, 'for update'), $sql), true);
        $insert = array_search(true, array_map(fn ($q) => str_starts_with($q, 'insert into `math_lab_files`'), $sql), true);

        $this->assertNotFalse($lock, 'la ligne de l’élève doit être verrouillée');
        $this->assertNotFalse($count, 'le comptage doit être une lecture verrouillante');
        $this->assertNotFalse($insert);
        $this->assertLessThan($count, $lock);
        $this->assertLessThan($insert, $count);
    }

    public function test_supprimer_rend_de_la_place(): void
    {
        $this->upload($this->board, $this->png('a.png'))->assertCreated();
        $this->seedFiles($this->student, $this->boardFor($this->student, 'archives'), 49);
        $this->upload($this->board, $this->png('b.png'))->assertStatus(422)->assertJsonPath('code', 'math_lab_user_file_limit');

        $file = MathLabFile::where('original_name', 'a.png')->first();
        $this->actingAs($this->student)->deleteJson("/api/v1/math-lab/files/{$file->id}")
            ->assertOk()->assertJsonPath('quota.user.used', 49)->assertJsonPath('quota.document.used', 0);
        Storage::disk('local')->assertMissing($file->disk_path);

        $this->upload($this->board, $this->png('b.png'))->assertCreated()->assertJsonPath('quota.user.used', 50);
    }

    public function test_le_document_et_les_fichiers_d_un_autre_sont_introuvables(): void
    {
        $theirs = $this->boardFor($this->other);
        $this->upload($theirs, $this->png())->assertNotFound();
        $this->assertSame(0, MathLabFile::count());

        $this->upload($theirs, $this->png(), $this->other)->assertCreated();
        $file = MathLabFile::first();
        $this->actingAs($this->student)->get("/api/v1/math-lab/files/{$file->id}/content")->assertNotFound();
        $this->actingAs($this->student)->deleteJson("/api/v1/math-lab/files/{$file->id}")->assertNotFound();
        $this->actingAs($this->student)->getJson("/api/v1/math-lab/documents/{$theirs->id}/files")->assertNotFound();
        $this->assertSame(1, MathLabFile::count());
    }

    public function test_un_visiteur_est_refuse_partout(): void
    {
        $this->getJson("/api/v1/math-lab/documents/{$this->board->id}/files")->assertUnauthorized();
        $this->post("/api/v1/math-lab/documents/{$this->board->id}/files", ['file' => $this->png()], ['Accept' => 'application/json'])->assertUnauthorized();
        $this->getJson('/api/v1/math-lab/files/1/content')->assertUnauthorized();
        $this->deleteJson('/api/v1/math-lab/files/1')->assertUnauthorized();
        $this->getJson('/api/v1/math-lab/quota')->assertUnauthorized();
        $this->assertSame(0, MathLabFile::count());
    }

    public function test_les_compteurs_de_l_eleve_se_lisent_sans_document(): void
    {
        $this->seedFiles($this->student, $this->board, 2);
        $this->actingAs($this->student)->getJson('/api/v1/math-lab/quota')
            ->assertOk()->assertJsonPath('quota.user.used', 2)->assertJsonPath('quota.document', null)->assertJsonPath('quota.limits.maxFilesPerDocument', 3);
    }

    public function test_une_sabbura_d_avant_avec_cinq_fichiers_garde_tout(): void
    {
        $this->seedFiles($this->student, $this->board, 5);

        $this->actingAs($this->student)->getJson("/api/v1/math-lab/documents/{$this->board->id}")
            ->assertOk()->assertJsonCount(5, 'files')->assertJsonPath('quota.document.used', 5)->assertJsonPath('quota.document.max', 3);
        $this->upload($this->board, $this->png())->assertStatus(422)->assertJsonPath('code', 'math_lab_board_file_limit');
        $this->assertSame(5, MathLabFile::where('document_id', $this->board->id)->count());
    }

    public function test_supprimer_le_document_emporte_ses_fichiers(): void
    {
        $this->upload($this->board, $this->png())->assertCreated();
        $path = MathLabFile::first()->disk_path;

        $this->actingAs($this->student)->deleteJson("/api/v1/math-lab/documents/{$this->board->id}")->assertOk();
        $this->assertSame(0, MathLabFile::count());
        Storage::disk('local')->assertMissing($path);
    }

    public function test_les_limites_sont_celles_de_la_politique(): void
    {
        $this->assertSame(1_000_000, MathLabFilePolicy::MAX_FILE_BYTES);
        $this->assertSame(3, MathLabFilePolicy::MAX_FILES_PER_DOCUMENT);
        $this->assertSame(50, MathLabFilePolicy::MAX_FILES_PER_USER);
    }
}
