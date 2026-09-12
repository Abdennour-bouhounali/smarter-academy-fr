<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * LE CONSENTEMENT LÉGAL, tel qu'il a été donné — pas tel qu'on le
     * souhaiterait.
     *
     * Trois colonnes, et pas un booléen : « a accepté » ne prouve rien sans
     * dire QUOI et QUAND. La version désigne le texte, l'horodatage désigne
     * l'instant. Un booléen seul aurait rendu impossible de répondre à la
     * seule question qui compte le jour où on la pose.
     *
     * ── Nullable, et ce n'est pas un oubli ───────────────────────────────
     * Les comptes créés AVANT cette migration n'ont jamais rien accepté.
     * Leur écrire une date de consentement serait fabriquer une preuve : on
     * inventerait un geste que l'élève n'a pas fait. Ces colonnes restent
     * donc NULL pour eux, et NULL se lit « aucun consentement enregistré » —
     * ce qui est la vérité.
     *
     * Aucune donnée existante n'est touchée. La migration est purement
     * additive et réversible.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // La version du document acceptée, telle que le SERVEUR l'a
            // écrite au moment du geste (voir config/legal.php). Jamais une
            // valeur venue du client.
            $table->string('terms_accepted_version', 32)->nullable()->after('grade');
            $table->string('privacy_policy_accepted_version', 32)->nullable()->after('terms_accepted_version');
            // L'instant du geste. Un seul horodatage pour les deux documents :
            // l'interface ne propose qu'une case, acceptant les deux ensemble.
            $table->timestamp('legal_consent_at')->nullable()->after('privacy_policy_accepted_version');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'terms_accepted_version',
                'privacy_policy_accepted_version',
                'legal_consent_at',
            ]);
        });
    }
};
