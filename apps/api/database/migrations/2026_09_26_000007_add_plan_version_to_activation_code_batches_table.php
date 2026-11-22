<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Un lot de codes peut porter une OFFRE — c'est la vente en nombre.
     *
     * Une école paie pour trente professeurs ou deux cents élèves, hors
     * plateforme ; l'administration choisit l'offre et sa version, la
     * quantité, et imprime autant de codes. Chaque code vaut UNE activation :
     * le saisir crée l'abonnement (voir ActivationCodeRedemptionService).
     *
     *   plan_version_id     nul → un lot élève « classique », qui ouvre le
     *                       droit premium exactement comme avant. Rien ne
     *                       change pour les cartes déjà vendues.
     *   recipient_user_id   posé quand le lot est un code INDIVIDUEL envoyé
     *                       depuis la fiche d'un compte (quantité 1) — pour
     *                       retrouver à qui il était destiné.
     */
    public function up(): void
    {
        Schema::table('activation_code_batches', function (Blueprint $table) {
            $table->foreignId('plan_version_id')->nullable()->after('notes')->constrained('plan_versions')->nullOnDelete();
            $table->foreignId('recipient_user_id')->nullable()->after('plan_version_id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('activation_code_batches', function (Blueprint $table) {
            $table->dropConstrainedForeignId('plan_version_id');
            $table->dropConstrainedForeignId('recipient_user_id');
        });
    }
};
