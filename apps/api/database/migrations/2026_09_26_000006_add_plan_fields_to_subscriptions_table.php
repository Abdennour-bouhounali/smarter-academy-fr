<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * L'abonnement apprend à quelle VERSION d'offre il se rattache, et
     * COMMENT il a été accordé.
     *
     *   plan_version_id      la version immuable dont découlent les limites
     *                        (nul pour les lignes héritées : `plan` reste la
     *                        clé texte, comme avant).
     *   acquisition_source   manual_admin_activation | activation_code |
     *                        provider | promotion | partnership | other.
     *                        Des MÉTADONNÉES sur l'origine — pas un système
     *                        de paiement. Le produit algérien n'encaisse rien.
     *   granted_by           l'administrateur qui a activé à la main.
     *   activation_note      ce qu'il a noté (« payé en espèces le 12/09 »).
     *   trial_ends_at        réservé au statut `trialing`.
     *   suspended_at         le statut `suspended` — accès fermé, ligne gardée.
     *
     * Toutes nullables : les lignes existantes restent valides sans réécriture.
     */
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->foreignId('plan_version_id')->nullable()->after('plan')->constrained('plan_versions')->nullOnDelete();
            $table->string('acquisition_source', 32)->nullable()->after('plan_version_id');
            $table->foreignId('granted_by')->nullable()->after('acquisition_source')->constrained('users')->nullOnDelete();
            $table->string('activation_note')->nullable()->after('granted_by');
            $table->timestamp('trial_ends_at')->nullable()->after('ends_at');
            $table->timestamp('suspended_at')->nullable()->after('cancelled_at');

            $table->index('plan_version_id');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('plan_version_id');
            $table->dropConstrainedForeignId('granted_by');
            $table->dropColumn(['acquisition_source', 'activation_note', 'trial_ends_at', 'suspended_at']);
        });
    }
};
