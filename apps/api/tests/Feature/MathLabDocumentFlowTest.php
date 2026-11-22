<?php

namespace Tests\Feature;

use App\Models\MathLabDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\FeatureAccessFixtures;
use Tests\TestCase;

/**
 * Le مختبر الرياضيات : un élève crée, retrouve, modifie et supprime SES
 * documents — et seulement les siens. L'instrument est vérifié, la taille
 * bornée, et le propriétaire vient toujours de la session, jamais du corps.
 */
class MathLabDocumentFlowTest extends TestCase
{
    use FeatureAccessFixtures;
    use RefreshDatabase;

    private User $student;

    private User $other;

    protected function setUp(): void
    {
        parent::setUp();
        $this->student = User::factory()->create(['role' => 'student']);
        $this->other = User::factory()->create(['role' => 'student']);
        // Cette suite éprouve la PERSISTANCE des instruments ; l'accès par
        // palier et les quotas sont l'affaire de FeatureAccessTest.
        $this->openAllFeatures();
    }

    private function scene(int $strokes = 1): array
    {
        return [
            'elements' => array_fill(0, $strokes, ['type' => 'freedraw', 'x' => 10, 'y' => 20, 'points' => [[0, 0], [5, 5]]]),
            'appState' => ['viewBackgroundColor' => '#ffffff'],
            'files' => (object) [],
        ];
    }

    public function test_un_eleve_cree_un_tableau_et_le_retrouve_avec_son_etat(): void
    {
        $created = $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents', [
            'tool' => 'whiteboard',
            'title' => '  رسم   المثلث  ',
            'schemaVersion' => 1,
            'data' => $this->scene(),
            // Ignoré : le propriétaire est l'élève authentifié.
            'userId' => $this->other->id,
        ]);

        $created->assertCreated()
            ->assertJsonPath('document.tool', 'whiteboard')
            ->assertJsonPath('document.title', 'رسم المثلث')
            ->assertJsonPath('document.schemaVersion', 1);

        $id = $created->json('document.id');
        $this->assertSame($this->student->id, MathLabDocument::find($id)->user_id);

        $this->actingAs($this->student)->getJson("/api/v1/math-lab/documents/{$id}")
            ->assertOk()
            ->assertJsonPath('document.data.appState.viewBackgroundColor', '#ffffff')
            ->assertJsonCount(1, 'document.data.elements');
    }

    public function test_le_grapheur_est_un_instrument_connu_avec_sa_propre_limite(): void
    {
        $data = [
            'functions' => [['id' => 'fn-1', 'name' => 'f', 'expression' => 'x^2', 'visible' => true, 'color' => '#2563eb', 'domain' => null]],
            'points' => [['id' => 'pt-1', 'name' => 'A', 'functionId' => 'fn-1', 'x' => 2]],
            'viewport' => ['xMin' => -8, 'xMax' => 8, 'yMin' => -6, 'yMax' => 6],
            'settings' => ['grid' => true],
        ];

        $created = $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents', [
            'tool' => 'functionGrapher',
            'title' => 'منحنيات',
            'schemaVersion' => 1,
            'data' => $data,
        ]);

        $created->assertCreated()->assertJsonPath('document.tool', 'functionGrapher');
        $id = $created->json('document.id');

        $this->actingAs($this->student)->getJson("/api/v1/math-lab/documents/{$id}")
            ->assertOk()
            ->assertJsonPath('document.data.functions.0.expression', 'x^2')
            ->assertJsonPath('document.data.points.0.x', 2)
            ->assertJsonPath('document.data.viewport.xMax', 8);

        // 100 Ko : bien plus qu'un grapheur n'en produit, bien moins que la سبّورة.
        $this->actingAs($this->student)->patchJson("/api/v1/math-lab/documents/{$id}", [
            'data' => ['functions' => [['expression' => str_repeat('x+', 60_000)]]],
        ])->assertStatus(422)->assertJsonPath('code', 'math_lab_document_too_large');
    }

    public function test_la_geometrie_3d_est_un_instrument_connu_avec_sa_propre_limite(): void
    {
        $data = [
            'shape' => 'cuboid',
            'dimensions' => ['length' => 4, 'width' => 2, 'height' => 3],
            'showAxes' => true,
            'showGrid' => false,
            'showMeasurements' => true,
            'camera' => ['position' => [-6.2, 4.9, 8.1], 'target' => [2, 1.5, -1]],
        ];

        $created = $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents', [
            'tool' => 'geometry3d',
            'title' => 'مجسّمات',
            'schemaVersion' => 1,
            'data' => $data,
        ]);

        $created->assertCreated()->assertJsonPath('document.tool', 'geometry3d');
        $id = $created->json('document.id');

        $this->actingAs($this->student)->getJson("/api/v1/math-lab/documents/{$id}")
            ->assertOk()
            ->assertJsonPath('document.data.shape', 'cuboid')
            ->assertJsonPath('document.data.dimensions.length', 4)
            ->assertJsonPath('document.data.showGrid', false)
            ->assertJsonPath('document.data.camera.target.0', 2);

        // 20 Ko : bien plus qu'un solide n'en produit.
        $this->actingAs($this->student)->patchJson("/api/v1/math-lab/documents/{$id}", [
            'data' => ['shape' => 'cube', 'note' => str_repeat('x', 25_000)],
        ])->assertStatus(422)->assertJsonPath('code', 'math_lab_document_too_large');
    }

    public function test_les_probabilites_et_statistiques_sont_un_instrument_connu_avec_sa_propre_limite(): void
    {
        // Ce que l'outil enregistre vraiment : des EFFECTIFS et une graine,
        // jamais les tirages — cent mille lancers tiennent dans six nombres.
        $data = [
            'mode' => 'experiment',
            'experiment' => 'die',
            'range' => ['min' => 1, 'max' => 20],
            'draws' => 1000,
            'simulation' => [
                'experimentId' => 'die', 'seed' => 12345, 'total' => 100000, 'drawn' => 100000,
                'counts' => [16702, 16611, 16689, 16598, 16745, 16655],
                'trajectory' => [['n' => 1, 'frequency' => 0], ['n' => 100000, 'frequency' => 0.16702]],
            ],
            'dataset' => '12 ; 15 ; 14 ; 18 ; 10 ; 12 ; 16',
            'settings' => ['compare' => true, 'showMean' => true, 'showMedian' => false],
        ];

        $created = $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents', [
            'tool' => 'probabilityStats',
            'title' => 'احتمالات وإحصاء',
            'schemaVersion' => 1,
            'data' => $data,
        ]);

        $created->assertCreated()->assertJsonPath('document.tool', 'probabilityStats');
        $id = $created->json('document.id');

        $this->actingAs($this->student)->getJson("/api/v1/math-lab/documents/{$id}")
            ->assertOk()
            ->assertJsonPath('document.data.experiment', 'die')
            ->assertJsonPath('document.data.simulation.total', 100000)
            ->assertJsonPath('document.data.simulation.counts.0', 16702)
            ->assertJsonPath('document.data.settings.showMedian', false);

        // 60 Ko : bien plus qu'une expérience et une série de 500 valeurs n'en produisent.
        $this->actingAs($this->student)->patchJson("/api/v1/math-lab/documents/{$id}", [
            'data' => ['mode' => 'dataset', 'dataset' => str_repeat('1 ; ', 20_000)],
        ])->assertStatus(422)->assertJsonPath('code', 'math_lab_document_too_large');
    }

    public function test_la_trigonometrie_est_un_instrument_connu_avec_sa_propre_limite(): void
    {
        // Ce que l'outil enregistre vraiment : un angle, un mode, seize
        // bascules et deux compteurs. L'ANIMATION et la question
        // d'entraînement n'y sont pas — elles ne sont jamais sérialisées
        // (trigState.js §43).
        $data = [
            'mode' => 'circle',
            'angle' => 450,
            'radius' => 1,
            'unit' => 'deg',
            'valueMode' => 'exact',
            'compare' => ['enabled' => true, 'angle' => 150],
            'triangle' => [
                'given' => 'opp-adj', 'angle' => 30, 'opposite' => 3,
                'adjacent' => 4, 'hypotenuse' => 5,
            ],
            'inverse' => ['ratio' => 'sin', 'value' => 0.5],
            'symmetry' => 'negate',
            'highlight' => 'sin',
            'layers' => [
                'axes' => true, 'grid' => true, 'circle' => true, 'arc' => true,
                'radius' => true, 'triangle' => true, 'projections' => true,
                'coordinates' => true, 'sinSegment' => true, 'cosSegment' => true,
                'tangentLine' => false, 'sineGraph' => true, 'cosineGraph' => false,
                'values' => true, 'quadrant' => false, 'specialMarkers' => false,
            ],
            'practice' => ['solved' => 4, 'seen' => 7],
            'preset' => 'unitCircle',
        ];

        $created = $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents', [
            'tool' => 'trigonometry',
            'title' => 'مثلثات',
            'schemaVersion' => 1,
            'data' => $data,
        ]);

        $created->assertCreated()->assertJsonPath('document.tool', 'trigonometry');
        $id = $created->json('document.id');

        $this->actingAs($this->student)->getJson("/api/v1/math-lab/documents/{$id}")
            ->assertOk()
            // L'angle dépasse le tour et le RESTE : c'est ce que §14 fait
            // découvrir, et le serveur n'a pas à le normaliser.
            ->assertJsonPath('document.data.angle', 450)
            ->assertJsonPath('document.data.mode', 'circle')
            ->assertJsonPath('document.data.layers.sineGraph', true)
            ->assertJsonPath('document.data.practice.solved', 4)
            ->assertJsonPath('document.data.preset', 'unitCircle');

        // 8 Ko : le document mesuré pèse moins d'un kilo-octet ; au-delà,
        // aucun état que l'instrument saurait rouvrir.
        $this->actingAs($this->student)->patchJson("/api/v1/math-lab/documents/{$id}", [
            'data' => ['mode' => 'circle', 'note' => str_repeat('x', 9_000)],
        ])->assertStatus(422)->assertJsonPath('code', 'math_lab_document_too_large');
    }

    /**
     * Le مختبر المنطق والبرهان : dix aires, chacune avec ses réglages, et
     * RIEN de ce qui se calcule (la table de vérité, les régions, le verdict
     * d'une recherche se refont de l'énoncé). Le serveur ne fait qu'accepter
     * et rendre : il n'interprète aucune de ces clés.
     */
    public function test_le_laboratoire_de_logique_conserve_son_etat(): void
    {
        $data = [
            'area' => 'counterexample',
            'statements' => ['id' => 'squareGtX', 'verdict' => 'depends', 'guess' => 'true', 'probe' => 0.5],
            'connectors' => ['connector' => 'implies', 'p' => true, 'q' => false],
            'implication' => ['id' => 'gtThreeImpliesGtOne', 'x' => 2, 'form' => 'converse', 'showSets' => true],
            'counterexample' => ['id' => 'primeGtTwoIsEven', 'tried' => [9, 3], 'found' => 3, 'candidate' => 3],
            'quantifiers' => ['id' => 'squareNonNegative', 'tried' => [1, -2], 'witness' => null, 'counterexample' => null],
            'proof' => ['id' => 'evenSquareIsEven', 'placed' => ['given', 'rewrite'], 'mode' => 'build', 'gapSeed' => 3],
            'practice' => ['open' => true, 'level' => 2, 'solved' => 3, 'seen' => 5, 'hintsUsed' => 1],
        ];

        $created = $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents', [
            'tool' => 'logic',
            'title' => 'منطق وبرهان',
            'schemaVersion' => 1,
            'data' => $data,
        ]);

        $created->assertCreated()->assertJsonPath('document.tool', 'logic');
        $id = $created->json('document.id');

        $this->actingAs($this->student)->getJson("/api/v1/math-lab/documents/{$id}")
            ->assertOk()
            // Le contre-exemple TROUVÉ survit : c'est le travail de l'élève.
            ->assertJsonPath('document.data.counterexample.found', 3)
            ->assertJsonPath('document.data.counterexample.tried', [9, 3])
            // La forme regardée aussi — la réciproque n'est pas la directe.
            ->assertJsonPath('document.data.implication.form', 'converse')
            ->assertJsonPath('document.data.proof.placed', ['given', 'rewrite'])
            ->assertJsonPath('document.data.practice.solved', 3)
            ->assertJsonPath('document.data.area', 'counterexample');

        // 8 Ko : le document mesuré pèse ~600 octets ; au-delà, aucun état
        // que l'instrument saurait rouvrir.
        $this->actingAs($this->student)->patchJson("/api/v1/math-lab/documents/{$id}", [
            'data' => ['area' => 'proof', 'note' => str_repeat('x', 9_000)],
        ])->assertStatus(422)->assertJsonPath('code', 'math_lab_document_too_large');
    }

    public function test_la_liste_ne_montre_que_mes_documents_sans_leur_etat(): void
    {
        MathLabDocument::create(['user_id' => $this->student->id, 'tool' => 'whiteboard', 'title' => 'A', 'data' => $this->scene()]);
        MathLabDocument::create(['user_id' => $this->other->id, 'tool' => 'whiteboard', 'title' => 'B', 'data' => $this->scene()]);

        $response = $this->actingAs($this->student)->getJson('/api/v1/math-lab/documents');

        $response->assertOk()
            ->assertJsonCount(1, 'documents')
            ->assertJsonPath('documents.0.title', 'A')
            ->assertJsonMissingPath('documents.0.data');
    }

    public function test_la_liste_se_filtre_par_instrument(): void
    {
        MathLabDocument::create(['user_id' => $this->student->id, 'tool' => 'whiteboard', 'title' => 'A', 'data' => $this->scene()]);

        $this->actingAs($this->student)->getJson('/api/v1/math-lab/documents?tool=whiteboard')->assertOk()->assertJsonCount(1, 'documents');
        $this->actingAs($this->student)->getJson('/api/v1/math-lab/documents?tool=graph')->assertOk()->assertJsonCount(0, 'documents');
    }

    public function test_le_document_d_un_autre_eleve_est_introuvable(): void
    {
        $document = MathLabDocument::create(['user_id' => $this->other->id, 'tool' => 'whiteboard', 'title' => 'B', 'data' => $this->scene()]);

        $this->actingAs($this->student)->getJson("/api/v1/math-lab/documents/{$document->id}")->assertNotFound();
        $this->actingAs($this->student)->patchJson("/api/v1/math-lab/documents/{$document->id}", ['title' => 'X'])->assertNotFound();
        $this->actingAs($this->student)->deleteJson("/api/v1/math-lab/documents/{$document->id}")->assertNotFound();

        $this->assertSame('B', $document->fresh()->title);
    }

    public function test_modifier_change_le_titre_et_l_etat_mais_jamais_l_instrument(): void
    {
        $document = MathLabDocument::create(['user_id' => $this->student->id, 'tool' => 'whiteboard', 'title' => 'A', 'data' => $this->scene()]);

        $this->actingAs($this->student)->patchJson("/api/v1/math-lab/documents/{$document->id}", [
            'title' => 'الدائرة',
            'data' => $this->scene(3),
            'tool' => 'graph',
        ])->assertOk()
            ->assertJsonPath('document.title', 'الدائرة')
            ->assertJsonMissingPath('document.data');

        $fresh = $document->fresh();
        $this->assertSame('whiteboard', $fresh->tool);
        $this->assertCount(3, $fresh->data['elements']);
        $this->assertGreaterThan(0, $fresh->data_bytes);
    }

    public function test_un_instrument_inconnu_est_refuse(): void
    {
        $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents', [
            'tool' => 'graph',
            'title' => 'x',
            'data' => $this->scene(),
        ])->assertStatus(422)->assertJsonPath('code', 'math_lab_unknown_tool');
    }

    public function test_un_etat_trop_lourd_est_refuse(): void
    {
        $heavy = ['blob' => str_repeat('x', 2_100_000)];

        $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents', [
            'tool' => 'whiteboard',
            'title' => 'x',
            'data' => $heavy,
        ])->assertStatus(422)->assertJsonPath('code', 'math_lab_document_too_large');

        $document = MathLabDocument::create(['user_id' => $this->student->id, 'tool' => 'whiteboard', 'title' => 'A', 'data' => $this->scene()]);
        $this->actingAs($this->student)->patchJson("/api/v1/math-lab/documents/{$document->id}", ['data' => $heavy])
            ->assertStatus(422)->assertJsonPath('code', 'math_lab_document_too_large');
    }

    public function test_supprimer_retire_le_document(): void
    {
        $document = MathLabDocument::create(['user_id' => $this->student->id, 'tool' => 'whiteboard', 'title' => 'A', 'data' => $this->scene()]);

        $this->actingAs($this->student)->deleteJson("/api/v1/math-lab/documents/{$document->id}")->assertOk();
        $this->assertNull($document->fresh());
    }

    // ── « أعمالي » : l'atelier — résumé, favoris, copie, gestes groupés ──

    public function test_le_resume_voyage_avec_l_etat_et_revient_dans_la_liste(): void
    {
        $created = $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents', [
            'tool' => 'functionGrapher',
            'title' => 'دراسة الدالة',
            'data' => ['functions' => [['expression' => 'x^2']]],
            'summary' => ['kind' => 'curve', 'text' => ['f(x) = x^2'], 'detail' => ['curves' => [['e' => 'x^2', 'c' => '#2563eb']]]],
        ]);

        $created->assertCreated()->assertJsonPath('document.summary.kind', 'curve');
        $id = $created->json('document.id');

        // La LISTE le porte : c'est elle qui dessine les aperçus, et elle
        // n'a toujours pas `data`.
        $this->actingAs($this->student)->getJson('/api/v1/math-lab/documents')
            ->assertOk()
            ->assertJsonPath('documents.0.summary.kind', 'curve')
            ->assertJsonPath('documents.0.summary.text.0', 'f(x) = x^2')
            ->assertJsonMissingPath('documents.0.data');

        // Il suit l'état à chaque sauvegarde.
        $this->actingAs($this->student)->patchJson("/api/v1/math-lab/documents/{$id}", [
            'data' => ['functions' => [['expression' => 'x^3']]],
            'summary' => ['kind' => 'curve', 'text' => ['f(x) = x^3']],
        ])->assertOk()->assertJsonPath('document.summary.text.0', 'f(x) = x^3');
    }

    /**
     * Un résumé trop gros n'est PAS une erreur : il est ignoré, et la carte
     * retombe sur son aperçu de repli. Refuser la sauvegarde ferait perdre
     * le TRAVAIL pour une vignette.
     */
    public function test_un_resume_trop_gros_est_ignore_mais_le_travail_est_enregistre(): void
    {
        $created = $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents', [
            'tool' => 'whiteboard',
            'title' => 'رسم',
            'data' => $this->scene(),
            'summary' => ['kind' => 'strokes', 'text' => [str_repeat('x', 5000)]],
        ]);

        $created->assertCreated()->assertJsonPath('document.summary', null);
        $this->assertDatabaseHas('math_lab_documents', ['id' => $created->json('document.id'), 'title' => 'رسم']);
    }

    public function test_un_document_ancien_sans_resume_reste_lisible(): void
    {
        // Exactement ce qu'une ligne d'avant la migration contient.
        $document = MathLabDocument::create([
            'user_id' => $this->student->id, 'tool' => 'whiteboard', 'title' => 'ancien', 'data' => $this->scene(),
        ]);

        $this->actingAs($this->student)->getJson('/api/v1/math-lab/documents')
            ->assertOk()
            ->assertJsonPath('documents.0.summary', null)
            ->assertJsonPath('documents.0.isFavorite', false);

        $this->actingAs($this->student)->getJson("/api/v1/math-lab/documents/{$document->id}")->assertOk();
    }

    public function test_l_etoile_se_pose_et_se_retire(): void
    {
        $document = MathLabDocument::create([
            'user_id' => $this->student->id, 'tool' => 'whiteboard', 'title' => 'A', 'data' => $this->scene(),
        ]);

        $this->actingAs($this->student)->patchJson("/api/v1/math-lab/documents/{$document->id}", ['isFavorite' => true])
            ->assertOk()->assertJsonPath('document.isFavorite', true);
        $this->assertTrue($document->fresh()->is_favorite);

        $this->actingAs($this->student)->patchJson("/api/v1/math-lab/documents/{$document->id}", ['isFavorite' => false])
            ->assertOk()->assertJsonPath('document.isFavorite', false);
    }

    public function test_une_copie_garde_l_etat_et_le_resume_mais_jamais_l_etoile(): void
    {
        $document = MathLabDocument::create([
            'user_id' => $this->student->id, 'tool' => 'functionGrapher', 'title' => 'الأصل',
            'data' => ['functions' => [['expression' => 'x^2']]],
            'summary' => ['kind' => 'curve', 'text' => ['x^2']],
            'is_favorite' => true,
        ]);

        $copy = $this->actingAs($this->student)->postJson("/api/v1/math-lab/documents/{$document->id}/duplicate", [
            'title' => 'نسخة من الأصل',
        ]);

        $copy->assertCreated()
            ->assertJsonPath('document.tool', 'functionGrapher')
            ->assertJsonPath('document.title', 'نسخة من الأصل')
            ->assertJsonPath('document.summary.kind', 'curve')
            // Une copie n'est pas encore un travail qu'on a choisi de garder.
            ->assertJsonPath('document.isFavorite', false);

        $this->assertNotSame($document->id, $copy->json('document.id'));
        $this->assertSame(
            $document->data,
            MathLabDocument::find($copy->json('document.id'))->data,
        );
        // L'original n'a pas bougé.
        $this->assertSame('الأصل', $document->fresh()->title);
    }

    public function test_on_ne_copie_pas_le_document_d_un_autre(): void
    {
        $document = MathLabDocument::create([
            'user_id' => $this->other->id, 'tool' => 'whiteboard', 'title' => 'B', 'data' => $this->scene(),
        ]);

        $this->actingAs($this->student)->postJson("/api/v1/math-lab/documents/{$document->id}/duplicate")->assertNotFound();
        $this->assertSame(1, MathLabDocument::count());
    }

    public function test_la_suppression_groupee_ne_touche_que_mes_documents(): void
    {
        $mine = collect(range(1, 3))->map(fn ($i) => MathLabDocument::create([
            'user_id' => $this->student->id, 'tool' => 'whiteboard', 'title' => "A{$i}", 'data' => $this->scene(),
        ]));
        $theirs = MathLabDocument::create([
            'user_id' => $this->other->id, 'tool' => 'whiteboard', 'title' => 'B', 'data' => $this->scene(),
        ]);

        // La liste porte l'identifiant d'autrui : le serveur ne le suit pas.
        $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents/bulk', [
            'ids' => [...$mine->pluck('id')->all(), $theirs->id],
            'action' => 'delete',
        ])->assertOk()->assertJsonPath('count', 3);

        $this->assertSame(0, MathLabDocument::where('user_id', $this->student->id)->count());
        $this->assertDatabaseHas('math_lab_documents', ['id' => $theirs->id]);
    }

    public function test_l_etoile_groupee_ne_touche_que_mes_documents(): void
    {
        $mine = MathLabDocument::create([
            'user_id' => $this->student->id, 'tool' => 'whiteboard', 'title' => 'A', 'data' => $this->scene(),
        ]);
        $theirs = MathLabDocument::create([
            'user_id' => $this->other->id, 'tool' => 'whiteboard', 'title' => 'B', 'data' => $this->scene(),
        ]);

        $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents/bulk', [
            'ids' => [$mine->id, $theirs->id], 'action' => 'favorite',
        ])->assertOk()->assertJsonPath('count', 1);

        $this->assertTrue($mine->fresh()->is_favorite);
        $this->assertFalse($theirs->fresh()->is_favorite);

        $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents/bulk', [
            'ids' => [$mine->id], 'action' => 'unfavorite',
        ])->assertOk();
        $this->assertFalse($mine->fresh()->is_favorite);
    }

    public function test_un_geste_groupe_inconnu_est_refuse(): void
    {
        $document = MathLabDocument::create([
            'user_id' => $this->student->id, 'tool' => 'whiteboard', 'title' => 'A', 'data' => $this->scene(),
        ]);

        $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents/bulk', [
            'ids' => [$document->id], 'action' => 'archive',
        ])->assertStatus(422);

        // Une liste vide n'est pas un geste.
        $this->actingAs($this->student)->postJson('/api/v1/math-lab/documents/bulk', [
            'ids' => [], 'action' => 'delete',
        ])->assertStatus(422);

        $this->assertDatabaseHas('math_lab_documents', ['id' => $document->id]);
    }

    public function test_un_visiteur_ne_touche_ni_aux_copies_ni_aux_gestes_groupes(): void
    {
        $document = MathLabDocument::create([
            'user_id' => $this->student->id, 'tool' => 'whiteboard', 'title' => 'A', 'data' => $this->scene(),
        ]);

        $this->postJson("/api/v1/math-lab/documents/{$document->id}/duplicate")->assertUnauthorized();
        $this->postJson('/api/v1/math-lab/documents/bulk', ['ids' => [$document->id], 'action' => 'delete'])->assertUnauthorized();
        $this->assertDatabaseHas('math_lab_documents', ['id' => $document->id]);
    }

    public function test_un_visiteur_est_refuse(): void
    {
        $this->getJson('/api/v1/math-lab/documents')->assertUnauthorized();
    }
}
