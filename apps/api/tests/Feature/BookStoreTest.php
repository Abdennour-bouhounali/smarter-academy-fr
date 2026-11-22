<?php

namespace Tests\Feature;

use App\Domain\Books\DeliveryFees;
use App\Domain\Books\Wilayas;
use App\Models\Book;
use App\Models\BookOrder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** La librairie : vitrine publique, commande sans paiement en ligne, suivi admin. */
class BookStoreTest extends TestCase
{
    use RefreshDatabase;

    private function book(array $over = []): Book
    {
        return Book::create($over + ['slug' => 'smart-protocol', 'title' => 'SMART', 'price' => 1400, 'status' => 'published']);
    }

    private function admin(): string
    {
        return User::factory()->create(['role' => User::ROLE_ADMIN])->createToken('t')->plainTextToken;
    }

    private function orderPayload(array $over = []): array
    {
        return $over + [
            'customerName' => 'Samir Benali', 'phone' => '0555 12 34 56', 'wilaya' => 'الجزائر - Alger',
            'commune' => 'Bab Ezzouar', 'address' => 'Cité 5 juillet, bloc 3', 'quantity' => 2,
        ];
    }

    public function test_le_catalogue_ne_montre_que_les_livres_publies(): void
    {
        $this->book();
        $this->book(['slug' => 'brouillon', 'title' => 'B', 'status' => 'draft']);

        $this->getJson('/api/v1/books')->assertOk()->assertJsonCount(1, 'books')->assertJsonPath('books.0.slug', 'smart-protocol');
        $this->getJson('/api/v1/books/brouillon')->assertNotFound();
        $this->getJson('/api/v1/books/smart-protocol')->assertOk()->assertJsonPath('book.price', 1400);
    }

    public function test_une_commande_fige_le_prix_et_sans_mode_n_a_pas_de_frais_de_livraison(): void
    {
        $book = $this->book();
        $res = $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload())->assertCreated();

        $order = BookOrder::firstOrFail();
        $this->assertSame($res->json('reference'), $order->reference);
        $this->assertSame(1400, $order->unit_price);
        $this->assertNull($order->delivery_fee);
        $this->assertNull($order->delivery_mode);
        $res->assertJsonPath('deliveryFee', null)->assertJsonPath('total', 2800);
        $this->assertSame('0555123456', $order->phone);
        $this->assertSame(2800, $order->total());

        $book->update(['price' => 2000]);
        $this->assertSame(2800, $order->fresh()->total(), 'changer le prix ne réécrit pas une commande reçue');
    }

    public function test_a_domicile_a_alger_le_frais_est_calcule_et_fige(): void
    {
        $this->book();
        $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload(['deliveryMode' => 'home']))
            ->assertCreated()
            ->assertJsonPath('subtotal', 2800)->assertJsonPath('deliveryFee', 400)->assertJsonPath('total', 2 * 1400 + 400);

        $order = BookOrder::firstOrFail();
        $this->assertSame('home', $order->delivery_mode);
        $this->assertSame(400, $order->delivery_fee);
    }

    public function test_au_bureau_a_alger_le_frais_est_celui_du_bureau(): void
    {
        $this->book();
        $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload(['deliveryMode' => 'desk']))
            ->assertCreated()->assertJsonPath('deliveryFee', 300)->assertJsonPath('total', 3100);
        $this->assertSame('desk', BookOrder::firstOrFail()->delivery_mode);
    }

    public function test_une_wilaya_sans_tarif_garde_le_mode_sans_frais(): void
    {
        $this->book();
        $label = collect(Wilayas::all())->firstWhere('id', 50)['label'];
        $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload(['wilaya' => $label, 'deliveryMode' => 'home']))
            ->assertCreated()->assertJsonPath('deliveryFee', null);

        $order = BookOrder::firstOrFail();
        $this->assertSame('home', $order->delivery_mode);
        $this->assertNull($order->delivery_fee);
    }

    public function test_un_mode_inconnu_est_refuse(): void
    {
        $this->book();
        $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload(['deliveryMode' => 'drone']))->assertStatus(422);
        $this->assertSame(0, BookOrder::count());
    }

    public function test_un_frais_envoye_par_le_client_est_ignore(): void
    {
        $this->book();
        $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload(['deliveryMode' => 'home', 'deliveryFee' => 0]))
            ->assertCreated()->assertJsonPath('deliveryFee', 400);
        $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload(['deliveryFee' => 5]))
            ->assertCreated()->assertJsonPath('deliveryFee', null);
        $this->assertSame([400, null], BookOrder::orderBy('id')->pluck('delivery_fee')->all());
    }

    public function test_la_liste_des_wilayas_expose_le_tarif(): void
    {
        $wilayas = collect($this->getJson('/api/v1/books/wilayas')->assertOk()->json('wilayas'));
        $this->assertSame(['home' => 400, 'desk' => 300], $wilayas->firstWhere('id', 16)['delivery']);
        $this->assertNull($wilayas->firstWhere('id', 50)['delivery']);
        $this->assertNull($wilayas->firstWhere('id', 54)['delivery']);
    }

    public function test_le_tarif_a_56_lignes_toutes_des_wilayas_connues(): void
    {
        $table = DeliveryFees::table();
        $this->assertCount(56, $table);
        $ids = array_column(Wilayas::all(), 'id');
        foreach (array_keys($table) as $id) {
            $this->assertContains($id, $ids);
        }
        $this->assertArrayNotHasKey(50, $table);
        $this->assertArrayNotHasKey(54, $table);
    }

    public function test_l_admin_change_le_mode_sans_recalculer_le_frais(): void
    {
        $this->book();
        $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload(['deliveryMode' => 'home']))->assertCreated();
        $id = BookOrder::firstOrFail()->id;
        $h = ['Authorization' => 'Bearer '.$this->admin()];

        $this->withHeaders($h)->patchJson("/api/v1/admin/book-orders/$id", ['deliveryMode' => 'desk'])
            ->assertOk()->assertJsonPath('order.deliveryMode', 'desk')->assertJsonPath('order.deliveryFee', 400);
        $this->withHeaders($h)->patchJson("/api/v1/admin/book-orders/$id", ['deliveryMode' => 'boat'])->assertStatus(422);
        $this->assertSame('desk', BookOrder::firstOrFail()->delivery_mode);
    }

    public function test_une_commande_sans_adresse_est_acceptee(): void
    {
        $this->book();
        $payload = $this->orderPayload();
        unset($payload['address']);

        $this->postJson('/api/v1/books/smart-protocol/orders', $payload)->assertCreated();
        $this->assertNull(BookOrder::firstOrFail()->address);
    }

    public function test_la_commande_refuse_un_telephone_ou_une_wilaya_invalides_et_un_livre_brouillon(): void
    {
        $this->book();
        $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload(['phone' => '123']))->assertStatus(422);
        $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload(['wilaya' => 'Atlantide']))->assertStatus(422);
        $this->book(['slug' => 'b', 'status' => 'draft']);
        $this->postJson('/api/v1/books/b/orders', $this->orderPayload())->assertNotFound();
        $this->assertSame(0, BookOrder::count());
    }

    public function test_le_pot_de_miel_ne_cree_rien(): void
    {
        $this->book();
        $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload(['website' => 'http://spam']))->assertCreated();
        $this->assertSame(0, BookOrder::count());
    }

    public function test_le_message_de_contact_est_enregistre(): void
    {
        $this->postJson('/api/v1/books/messages', [
            'fullName' => 'Nadia', 'email' => 'n@example.com', 'role' => 'teacher', 'subject' => 'bulk_purchase',
            'message' => 'Je voudrais 30 exemplaires pour mon lycée.', 'consent' => true,
        ])->assertCreated();
        $this->assertDatabaseHas('book_messages', ['full_name' => 'Nadia', 'status' => 'new']);
    }

    public function test_le_suivi_admin_etats_livraison_et_paiements(): void
    {
        $this->book();
        $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload())->assertCreated();
        $id = BookOrder::firstOrFail()->id;
        $h = ['Authorization' => 'Bearer '.$this->admin()];

        // Transition interdite : pending → delivered.
        $this->withHeaders($h)->patchJson("/api/v1/admin/book-orders/$id/status", ['status' => 'delivered'])->assertStatus(422);
        $this->withHeaders($h)->patchJson("/api/v1/admin/book-orders/$id/status", ['status' => 'confirmed'])->assertOk();
        $this->withHeaders($h)->patchJson("/api/v1/admin/book-orders/$id/status", ['status' => 'in_way'])->assertOk();

        // Le frais est fixé après coup et entre dans le total.
        $this->withHeaders($h)->patchJson("/api/v1/admin/book-orders/$id", ['deliveryFee' => 600])
            ->assertOk()->assertJsonPath('order.total', 3400)->assertJsonPath('order.paymentStatus', 'unpaid');

        $this->withHeaders($h)->postJson("/api/v1/admin/book-orders/$id/payments", ['kind' => 'payment', 'amount' => 1000, 'method' => 'ccp'])
            ->assertCreated()->assertJsonPath('order.paymentStatus', 'partial');
        $this->withHeaders($h)->postJson("/api/v1/admin/book-orders/$id/payments", ['kind' => 'payment', 'amount' => 2400, 'method' => 'cash_on_delivery'])
            ->assertCreated()->assertJsonPath('order.paymentStatus', 'paid');
        // Remboursement au-delà de l'encaissé : refusé.
        $this->withHeaders($h)->postJson("/api/v1/admin/book-orders/$id/payments", ['kind' => 'refund', 'amount' => 9999, 'method' => 'ccp'])->assertStatus(422);

        $this->withHeaders($h)->patchJson("/api/v1/admin/book-orders/$id/status", ['status' => 'delivered'])->assertOk();
        $stats = $this->withHeaders($h)->getJson('/api/v1/admin/book-orders/stats')->assertOk();
        $stats->assertJsonPath('collected', 3400)->assertJsonPath('deliveredRevenue', 3400)->assertJsonPath('toCollect', 0)->assertJsonPath('copiesDelivered', 2);

        $detail = $this->withHeaders($h)->getJson("/api/v1/admin/book-orders/$id")->assertOk();
        $this->assertGreaterThanOrEqual(5, count($detail->json('order.events')));
        // Une commande livrée ne se supprime pas.
        $this->withHeaders($h)->deleteJson("/api/v1/admin/book-orders/$id")->assertStatus(422);
    }

    public function test_un_eleve_n_atteint_pas_l_admin_librairie(): void
    {
        $token = User::factory()->create(['role' => User::ROLE_STUDENT])->createToken('s')->plainTextToken;
        $this->withHeader('Authorization', "Bearer $token")->getJson('/api/v1/admin/book-orders')->assertForbidden();
    }

    public function test_la_navigation_n_epuise_pas_la_limite_des_commandes(): void
    {
        // Régression (2026-10-17) : un `throttle:8,10` en ligne partageait sa clé
        // « domaine|IP » avec /content/availability/public, appelée à chaque page.
        $this->book();
        for ($i = 0; $i < 10; $i++) {
            $this->getJson('/api/v1/content/availability/public');
        }
        $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload())->assertCreated();
    }

    public function test_la_limite_des_commandes_reste_active(): void
    {
        $this->book();
        for ($i = 0; $i < 8; $i++) {
            $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload())->assertCreated();
        }
        $this->postJson('/api/v1/books/smart-protocol/orders', $this->orderPayload())->assertStatus(429);
    }
}
