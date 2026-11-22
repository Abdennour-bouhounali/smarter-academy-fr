<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// « أعمالي » devient un ATELIER : on y cherche, on y trie, on y range. Deux
// colonnes suffisent, et aucune ne touche à `data` (l'état de l'outil, qui
// reste opaque et qui, pour une سبّورة, pèse jusqu'à 2 Mo).
//
// `summary` : le RÉSUMÉ que l'instrument fait de son propre document —
// quelques centaines d'octets de JSON (les expressions du grapheur, le
// solide de la 3D, l'équation du جبر…). C'est lui qui permet à une carte de
// dessiner un aperçu VRAI sans charger three.js, Excalidraw ni MathLive, et
// à la recherche de trouver « دالة » dans une expression. Borné à
// MathLabDocumentService::MAX_SUMMARY_BYTES ; nul pour les documents
// antérieurs, que l'interface sait afficher sans lui (aperçu de repli).
//
// `is_favorite` : l'étoile de l'élève. Faux par défaut — aucune ligne
// existante n'est invalidée.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('math_lab_documents', function (Blueprint $table) {
            $table->json('summary')->nullable()->after('data_bytes');
            $table->boolean('is_favorite')->default(false)->after('summary');

            // « المفضلة » : les favoris d'un élève, les plus récents d'abord.
            $table->index(['user_id', 'is_favorite', 'updated_at'], 'math_lab_documents_favorites_index');
        });
    }

    public function down(): void
    {
        Schema::table('math_lab_documents', function (Blueprint $table) {
            $table->dropIndex('math_lab_documents_favorites_index');
            $table->dropColumn(['summary', 'is_favorite']);
        });
    }
};
