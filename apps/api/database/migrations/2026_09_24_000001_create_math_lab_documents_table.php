<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Le مختبر الرياضيات (Math Lab) : le travail libre de l'élève, hors de toute
// leçon. UNE table pour TOUS les instruments — la سبّورة aujourd'hui, le
// grapheur ou la géométrie demain : `tool` dit lequel, `data` porte l'état
// sérialisé de l'outil, et le serveur ne le lit pas. Ajouter un instrument
// n'ajoute donc ni table ni colonne (docs/architecture/MATH_LAB.md).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('math_lab_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // L'identifiant d'un instrument du registre (App\Domain\MathLab\MathLabTools).
            $table->string('tool', 40);
            $table->string('title', 160);

            // La version du FORMAT de `data`, propre à l'outil : c'est à lui
            // de lire un document ancien. Le serveur la stocke, ne l'interprète pas.
            $table->unsignedSmallInteger('schema_version')->default(1);

            // L'état de l'outil, opaque. Borné à la création et à la
            // modification (MathLabTools::maxBytes) — jamais illimité.
            $table->json('data');
            $table->unsignedInteger('data_bytes')->default(0);

            $table->timestamps();

            // « Mes travaux » : les documents d'un élève, un outil ou tous,
            // du plus récemment modifié au plus ancien.
            $table->index(['user_id', 'tool', 'updated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('math_lab_documents');
    }
};
