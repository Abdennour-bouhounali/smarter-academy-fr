<?php

namespace Tests\Feature;

use App\Domain\Classroom\JoinLinkToken;
use App\Domain\Identity\EmailVerificationLink;
use App\Domain\Plans\EntitlementKeys as K;
use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\Support\CommercialFixtures;
use Tests\TestCase;

/**
 * LE LIEN DE CLASSE (« رابط الانضمام ») — `/rejoindre/classe/{jeton}`.
 *
 * Une capacité : un jeton aléatoire, propre à UNE classe, revalidé à chaque
 * usage, qui aboutit à la MÊME adhésion que le code (une ligne unique par
 * classe et élève, même consentement, même capacité). Rouvrir le lien est
 * idempotent ; fermer les adhésions le ferme sans toucher aux membres ; le
 * renouveler invalide l'ancien. Voir TEACHER_CLASSROOM_ARCHITECTURE.md §2.
 */
class ClassroomJoinLinkTest extends TestCase
{
    use CommercialFixtures;
    use RefreshDatabase;

    private function classroom(array $attributes = []): Classroom
    {
        $this->defaultTeacherPlan();
        $this->grade4am(1);

        return Classroom::factory()->create($attributes);
    }

    private function joinByLink(User $student, string $link, bool $consent = true)
    {
        return $this->withToken($this->tokenOf($student))->postJson('/api/v1/student/classrooms/join', array_filter(['link' => $link, 'consent' => $consent ?: null]));
    }

    // ── Le jeton ────────────────────────────────────────────────────────

    public function test_chaque_classe_nait_avec_un_jeton_aleatoire_unique_et_non_derive(): void
    {
        $this->defaultTeacherPlan([K::CLASSROOMS_MAX => null]);
        $this->grade4am(0);
        $teacher = $this->teacher();
        $token = $this->tokenOf($teacher);

        $tokens = [];
        for ($i = 0; $i < 5; $i++) {
            $created = $this->withToken($token)->postJson('/api/v1/teacher/classrooms', ['name' => "4AM {$i}", 'grade' => '4am'])->assertCreated();
            $link = $created->json('classroom.joinLinkToken');
            $this->assertTrue(JoinLinkToken::isWellFormed($link));
            $classroom = Classroom::findOrFail($created->json('classroom.id'));
            // Ni l'identifiant, ni le code, ni l'enseignant ne s'y lisent.
            $this->assertStringNotContainsString((string) $classroom->id.'-', $link);
            $this->assertStringNotContainsStringIgnoringCase($classroom->join_code, $link);
            $this->assertNotSame(hash('sha256', (string) $classroom->id), $link);
            $tokens[] = $link;
        }

        $this->assertCount(5, array_unique($tokens));
        // 32 symboles base62 : la distance entre deux jetons n'est pas un pas.
        $this->assertSame(JoinLinkToken::LENGTH, strlen($tokens[0]));
        $this->assertGreaterThan(20, levenshtein($tokens[0], $tokens[1]));
    }

    public function test_un_jeton_designe_sa_classe_et_aucune_autre(): void
    {
        $a = $this->classroom();
        $b = Classroom::factory()->create();
        $student = $this->student();

        $this->joinByLink($student, $b->join_link_token)->assertCreated()->assertJsonPath('classroomId', $b->id);
        $this->assertDatabaseMissing('classroom_memberships', ['classroom_id' => $a->id, 'student_id' => $student->id]);
    }

    // ── L'aperçu public ────────────────────────────────────────────────

    public function test_l_apercu_public_rassure_sans_rien_reveler(): void
    {
        $classroom = $this->classroom(['name' => 'رياضيات — 4م2']);
        $classroom->teacher->forceFill(['first_name' => 'أمين', 'last_name' => 'بن علي'])->save();

        $this->getJson("/api/v1/join-links/{$classroom->join_link_token}")
            ->assertOk()
            ->assertJsonPath('joinLink.classroomName', 'رياضيات — 4م2')
            ->assertJsonPath('joinLink.grade', '4am')
            ->assertJsonPath('joinLink.teacherName', 'أمين بن علي')
            ->assertJsonPath('joinLink.joiningOpen', true)
            ->assertJsonPath('joinLink.alreadyMember', null)
            ->assertJsonMissingPath('joinLink.id')
            ->assertJsonMissingPath('joinLink.joinCode');
    }

    public function test_l_apercu_dit_a_un_eleve_connecte_s_il_est_deja_membre(): void
    {
        $classroom = $this->classroom();
        $student = $this->student();
        $token = $this->tokenOf($student);

        $this->withToken($token)->getJson("/api/v1/join-links/{$classroom->join_link_token}")->assertOk()->assertJsonPath('joinLink.alreadyMember', false);
        $this->joinByLink($student, $classroom->join_link_token)->assertCreated();
        $this->withToken($token)->getJson("/api/v1/join-links/{$classroom->join_link_token}")->assertOk()->assertJsonPath('joinLink.alreadyMember', true);
    }

    public function test_jetons_invalides_mal_formes_et_inconnus_sont_refuses_pareil(): void
    {
        $classroom = $this->classroom();
        $student = $this->student();
        $unknown = JoinLinkToken::generate();

        foreach ([$unknown, 'abc', str_repeat('a', 33), substr($classroom->join_link_token, 0, 31).'!'] as $bad) {
            $this->getJson('/api/v1/join-links/'.rawurlencode($bad))->assertStatus(in_array($bad, [$unknown, 'abc', str_repeat('a', 33)], true) ? 422 : 404);
            $this->joinByLink($student, $bad)->assertStatus(422)->assertJsonPath('reason', 'invalid');
        }
        $r = $this->getJson("/api/v1/join-links/{$unknown}")->assertStatus(422)->assertJsonPath('reason', 'invalid');
        $this->assertStringNotContainsString('SQL', $r->getContent());
        $this->assertSame(0, ClassroomMembership::count());
    }

    // ── Rejoindre : élève connecté, membre, consentement ───────────────

    public function test_un_eleve_connecte_rejoint_par_le_lien_sans_code(): void
    {
        $classroom = $this->classroom();
        $student = $this->student();

        $this->joinByLink($student, $classroom->join_link_token)
            ->assertCreated()
            ->assertJsonPath('alreadyMember', false)
            ->assertJsonPath('classroomId', $classroom->id)
            ->assertJsonPath('studyContext.primary.id', $classroom->id);

        $this->assertDatabaseHas('classroom_memberships', [
            'classroom_id' => $classroom->id, 'student_id' => $student->id, 'status' => 'active', 'joined_via' => 'join_link',
        ]);
        $this->assertNotNull(ClassroomMembership::first()->consented_at);
    }

    public function test_le_lien_sans_consentement_ne_cree_rien(): void
    {
        $classroom = $this->classroom();

        $this->joinByLink($this->student(), $classroom->join_link_token, consent: false)
            ->assertStatus(422)->assertJsonPath('reason', 'consent_required');
        $this->assertSame(0, ClassroomMembership::count());
    }

    public function test_rouvrir_le_lien_est_idempotent_une_seule_ligne(): void
    {
        $classroom = $this->classroom();
        $student = $this->student();

        $this->joinByLink($student, $classroom->join_link_token)->assertCreated();
        // Même sans consentement : un membre n'a rien de nouveau à accepter.
        $this->joinByLink($student, $classroom->join_link_token, consent: false)->assertOk()->assertJsonPath('alreadyMember', true);
        $this->joinByLink($student, $classroom->join_link_token)->assertOk()->assertJsonPath('alreadyMember', true);

        $this->assertSame(1, ClassroomMembership::where('student_id', $student->id)->count());
    }

    public function test_code_et_lien_donnent_la_meme_adhesion_sans_doublon(): void
    {
        $classroom = $this->classroom();
        $student = $this->student();
        $token = $this->tokenOf($student);

        $this->withToken($token)->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])->assertCreated();
        $this->joinByLink($student, $classroom->join_link_token)->assertOk()->assertJsonPath('alreadyMember', true);
        $this->withToken($token)->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])
            ->assertStatus(422)->assertJsonPath('reason', 'already_member');

        $this->assertSame(1, ClassroomMembership::where('student_id', $student->id)->count());
        $this->assertSame('join_code', ClassroomMembership::first()->joined_via);

        // Parti, puis revenu par le lien : la MÊME ligne est réactivée.
        $this->withToken($token)->postJson("/api/v1/student/classrooms/{$classroom->id}/leave")->assertOk();
        $this->joinByLink($student, $classroom->join_link_token)->assertCreated();
        $this->assertSame(1, ClassroomMembership::where('student_id', $student->id)->count());
        $this->assertSame('join_link', ClassroomMembership::first()->joined_via);
    }

    public function test_un_eleve_sans_classe_scolaire_prend_celle_du_qism(): void
    {
        $classroom = $this->classroom();
        $fresh = $this->student(['grade' => null]);
        $chosen = $this->student(['grade' => '3am']);

        $this->joinByLink($fresh, $classroom->join_link_token)->assertCreated();
        $this->joinByLink($chosen, $classroom->join_link_token)->assertCreated();

        $this->assertSame('4am', $fresh->fresh()->grade);
        $this->assertSame('3am', $chosen->fresh()->grade);
    }

    // ── Fermer, renouveler ─────────────────────────────────────────────

    public function test_adhesions_fermees_le_lien_refuse_les_nouveaux_et_garde_les_membres(): void
    {
        $classroom = $this->classroom();
        $member = $this->student();
        $this->joinByLink($member, $classroom->join_link_token)->assertCreated();

        $this->withToken($this->tokenOf($classroom->teacher))->patchJson("/api/v1/teacher/classrooms/{$classroom->id}", ['joinCodeEnabled' => false])->assertOk();

        $this->getJson("/api/v1/join-links/{$classroom->join_link_token}")->assertOk()->assertJsonPath('joinLink.joiningOpen', false);
        $this->joinByLink($this->student(), $classroom->join_link_token)->assertStatus(422)->assertJsonPath('reason', 'joining_closed');
        // Le code aussi est fermé (motif `invalid`, comme avant).
        $this->withToken($this->tokenOf($this->student()))->postJson('/api/v1/student/classrooms/join', ['consent' => true, 'code' => $classroom->join_code])
            ->assertStatus(422)->assertJsonPath('reason', 'invalid');

        // Le membre reste membre, et rouvrir le lien le renvoie à sa classe.
        $this->assertDatabaseHas('classroom_memberships', ['classroom_id' => $classroom->id, 'student_id' => $member->id, 'status' => 'active']);
        $this->joinByLink($member, $classroom->join_link_token)->assertOk()->assertJsonPath('alreadyMember', true);
    }

    public function test_une_classe_archivee_ferme_le_lien(): void
    {
        $classroom = $this->classroom(['status' => Classroom::STATUS_ARCHIVED]);

        $this->joinByLink($this->student(), $classroom->join_link_token)->assertStatus(422)->assertJsonPath('reason', 'joining_closed');
    }

    public function test_renouveler_le_lien_invalide_l_ancien_sans_toucher_aux_membres(): void
    {
        $classroom = $this->classroom();
        $old = $classroom->join_link_token;
        $member = $this->student();
        $this->joinByLink($member, $old)->assertCreated();

        $new = $this->withToken($this->tokenOf($classroom->teacher))->postJson("/api/v1/teacher/classrooms/{$classroom->id}/join-link/rotate")
            ->assertOk()->json('classroom.joinLinkToken');

        $this->assertNotSame($old, $new);
        $this->assertTrue(JoinLinkToken::isWellFormed($new));
        $this->joinByLink($this->student(), $old)->assertStatus(422)->assertJsonPath('reason', 'invalid');
        $this->joinByLink($this->student(), $new)->assertCreated();
        $this->assertDatabaseHas('classroom_memberships', ['student_id' => $member->id, 'status' => 'active']);
        $this->assertDatabaseHas('admin_activity_logs', ['action' => 'classroom.join_link_rotated', 'entity_id' => (string) $classroom->id]);
    }

    // ── Autorisation ───────────────────────────────────────────────────

    public function test_seul_le_proprietaire_voit_et_renouvelle_le_lien(): void
    {
        $classroom = $this->classroom();
        $other = $this->teacher();
        $student = $this->student();
        $old = $classroom->join_link_token;

        $this->withToken($this->tokenOf($other))->postJson("/api/v1/teacher/classrooms/{$classroom->id}/join-link/rotate")->assertForbidden();
        $this->withToken($this->tokenOf($other))->getJson("/api/v1/teacher/classrooms/{$classroom->id}")->assertForbidden();
        $this->withToken($this->tokenOf($student))->postJson("/api/v1/teacher/classrooms/{$classroom->id}/join-link/rotate")->assertForbidden();
        $this->app['auth']->forgetGuards();
        $this->withoutToken()->postJson("/api/v1/teacher/classrooms/{$classroom->id}/join-link/rotate")->assertUnauthorized();
        // Un élève ne peut pas fermer les adhésions d'une classe.
        $this->withToken($this->tokenOf($student))->patchJson("/api/v1/teacher/classrooms/{$classroom->id}", ['joinCodeEnabled' => false])->assertForbidden();

        $this->assertSame($old, $classroom->fresh()->join_link_token);
        $this->assertTrue($classroom->fresh()->join_code_enabled);
    }

    public function test_un_enseignant_ne_rejoint_pas_par_le_lien(): void
    {
        $classroom = $this->classroom();

        $this->joinByLink($this->teacher(), $classroom->join_link_token)->assertStatus(422)->assertJsonPath('reason', 'not_a_student');
    }

    public function test_un_eleve_non_verifie_ne_rejoint_pas_directement(): void
    {
        $classroom = $this->classroom();
        $student = $this->student(['email_verified_at' => null]);

        $this->joinByLink($student, $classroom->join_link_token)->assertForbidden();
        $this->assertSame(0, ClassroomMembership::count());
    }

    // ── Inscription depuis le lien : l'adhésion attend l'adresse vérifiée ──

    public function test_inscription_depuis_le_lien_puis_verification_cree_l_adhesion(): void
    {
        Notification::fake();
        $classroom = $this->classroom();

        $this->postJson('/api/v1/auth/register', [
            'firstName' => 'سارة', 'lastName' => 'بن علي',
            'email' => 'sara@example.dz', 'password' => 'Passw0rd123', 'accept_legal' => true,
            'classJoinLink' => $classroom->join_link_token, 'classJoinConsent' => true,
        ])->assertCreated()->assertJsonMissingPath('user.pendingClassJoinToken');

        $student = User::where('email', 'sara@example.dz')->firstOrFail();
        // Rien avant la vérification : l'espace élève est encore fermé.
        $this->assertSame(0, ClassroomMembership::count());
        $this->assertSame($classroom->join_link_token, $student->pending_class_join_token);
        // …mais la classe scolaire du قسم, DÈS l'inscription : l'accueil ne
        // demandera pas l'année (propriétaire, 2026-10-22).
        $this->assertSame('4am', $student->grade);

        // Le lien du courriel, ouvert SANS session (autre navigateur).
        $this->get(EmailVerificationLink::for($student))->assertRedirect();

        $this->assertDatabaseHas('classroom_memberships', [
            'classroom_id' => $classroom->id, 'student_id' => $student->id, 'status' => 'active', 'joined_via' => 'join_link',
        ]);
        $student->refresh();
        $this->assertNull($student->pending_class_join_token);
        $this->assertSame('4am', $student->grade);

        // Le navigateur d'origine rejoint à son tour : idempotent.
        $this->joinByLink($student, $classroom->join_link_token)->assertOk()->assertJsonPath('alreadyMember', true);
        $this->assertSame(1, ClassroomMembership::count());
    }

    public function test_inscription_sans_consentement_ou_avec_un_lien_perime_n_attend_rien(): void
    {
        Notification::fake();
        $classroom = $this->classroom();

        $payload = fn (string $email, array $extra) => array_merge([
            'firstName' => 'سارة', 'lastName' => 'بن علي', 'email' => $email, 'password' => 'Passw0rd123', 'accept_legal' => true,
        ], $extra);

        $this->postJson('/api/v1/auth/register', $payload('a@example.dz', ['classJoinLink' => $classroom->join_link_token]))->assertCreated();
        $this->postJson('/api/v1/auth/register', $payload('b@example.dz', ['classJoinLink' => JoinLinkToken::generate(), 'classJoinConsent' => true]))->assertCreated();
        $this->postJson('/api/v1/auth/register', $payload('c@example.dz', ['classJoinLink' => $classroom->join_link_token, 'classJoinConsent' => true, 'accountType' => 'teacher']))->assertCreated();

        $this->assertSame(0, User::whereNotNull('pending_class_join_token')->count());
        // Sans adhésion attendue, aucune classe scolaire n'est imposée.
        $this->assertSame(0, User::whereNotNull('grade')->where('email', '!=', $classroom->teacher->email)->count());
    }

    public function test_un_lien_renouvele_entre_inscription_et_verification_n_ouvre_rien(): void
    {
        Notification::fake();
        $classroom = $this->classroom();

        $this->postJson('/api/v1/auth/register', [
            'firstName' => 'سارة', 'lastName' => 'بن علي', 'email' => 'late@example.dz', 'password' => 'Passw0rd123', 'accept_legal' => true,
            'classJoinLink' => $classroom->join_link_token, 'classJoinConsent' => true,
        ])->assertCreated();
        $this->withToken($this->tokenOf($classroom->teacher))->postJson("/api/v1/teacher/classrooms/{$classroom->id}/join-link/rotate")->assertOk();

        $student = User::where('email', 'late@example.dz')->firstOrFail();
        $this->get(EmailVerificationLink::for($student))->assertRedirect();

        $this->assertSame(0, ClassroomMembership::count());
        $this->assertNotNull($student->fresh()->email_verified_at);
        $this->assertNull($student->fresh()->pending_class_join_token);
    }
}
