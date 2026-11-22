<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * LA LIBRAIRIE (2026-10-17) — les livres papier vendus par la plateforme.
 *
 * Aucun paiement en ligne : le client dépose une DEMANDE de commande, la
 * livraison et l'encaissement se font hors ligne. Les tables portent donc ce
 * que l'administrateur doit suivre : la commande, ses paiements (un
 * encaissement est une ligne, pas un drapeau), et l'historique de ses états.
 *
 * Les montants sont des entiers en dinars (DA). Le frais de livraison est
 * NULLABLE : il est fixé plus tard, commande par commande.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 80)->unique();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('author')->nullable();
            $table->text('summary')->nullable();
            // Contenu de la page produit (points forts, sommaire, questions) :
            // du JSON éditable, pour qu'un livre n'exige pas un déploiement.
            $table->json('content')->nullable();
            $table->unsignedInteger('price');
            $table->string('cover_image')->nullable();
            $table->json('gallery')->nullable();
            // draft | published : un brouillon n'est visible que de l'admin.
            $table->string('status', 16)->default('draft');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('book_orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 40)->unique();
            $table->foreignId('book_id')->constrained('books')->restrictOnDelete();
            $table->string('customer_name', 150);
            $table->string('phone', 30);
            $table->string('email', 190)->nullable();
            $table->string('wilaya', 120);
            $table->string('commune', 120);
            $table->text('address');
            $table->text('customer_note')->nullable();
            $table->unsignedSmallInteger('quantity')->default(1);
            // Prix unitaire FIGÉ à la commande : changer le prix du livre ne
            // réécrit pas les commandes déjà reçues.
            $table->unsignedInteger('unit_price');
            $table->unsignedInteger('delivery_fee')->nullable();
            // pending | confirmed | in_way | delivered | returned | cancelled
            $table->string('status', 16)->default('pending');
            $table->text('admin_note')->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
            $table->index('wilaya');
        });

        Schema::create('book_order_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_order_id')->constrained('book_orders')->cascadeOnDelete();
            // payment | refund
            $table->string('kind', 12)->default('payment');
            $table->unsignedInteger('amount');
            // cash_on_delivery | ccp | baridimob | bank | other
            $table->string('method', 24)->default('cash_on_delivery');
            $table->string('note')->nullable();
            $table->timestamp('received_at');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('book_order_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_order_id')->constrained('book_orders')->cascadeOnDelete();
            // created | status | delivery_fee | note | payment | refund
            $table->string('type', 24);
            $table->string('from_value', 190)->nullable();
            $table->string('to_value', 190)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('book_messages', function (Blueprint $table) {
            $table->id();
            // Optionnel : le message peut concerner un livre précis.
            $table->foreignId('book_id')->nullable()->constrained('books')->nullOnDelete();
            $table->string('full_name', 150);
            $table->string('email', 190);
            $table->string('phone', 30)->nullable();
            $table->string('country', 80)->nullable();
            $table->string('role', 16);
            $table->string('school', 190)->nullable();
            $table->boolean('book_owner')->default(false);
            $table->boolean('wants_free_session')->default(false);
            $table->string('subject', 40);
            $table->text('message');
            // new | in_progress | replied | closed | archived
            $table->string('status', 16)->default('new');
            $table->text('admin_note')->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_messages');
        Schema::dropIfExists('book_order_events');
        Schema::dropIfExists('book_order_payments');
        Schema::dropIfExists('book_orders');
        Schema::dropIfExists('books');
    }
};
