<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Deux colonnes, et pas une de plus.
     *
     * La table `payments` est une TRACE comptable, jamais une source d'accès :
     * la couche d'accès ne la lit pas, et ne doit jamais la lire (un
     * remboursement sépare « un paiement existe » de « l'accès est ouvert »).
     * Elle n'a donc besoin que du strict nécessaire pour se réconcilier avec
     * le fournisseur.
     *
     * Ce qui n'est PAS ajouté, délibérément : numéro de carte, CVC, marque,
     * quatre derniers chiffres, moyen de paiement, PDF de facture, adresse de
     * facturation. La table a été créée sans colonne capable d'en accueillir,
     * et cette migration maintient cette propriété. Minimisation des données.
     *
     * `failure_code` est un CODE court du fournisseur (`card_declined`), pas un
     * message : un message brut finirait affiché à un élève ou recopié dans un
     * journal, avec ce qu'il peut contenir.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('provider_invoice_id')->nullable()->after('external_reference');
            $table->string('failure_code')->nullable()->after('status');

            // Un paiement du fournisseur = UNE ligne locale. Sans cette
            // contrainte, un `invoice.paid` livré deux fois produirait deux
            // lignes et fausserait toute réconciliation comptable.
            $table->unique(['provider', 'external_reference'], 'payments_provider_reference_unique');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique('payments_provider_reference_unique');
            $table->dropColumn(['provider_invoice_id', 'failure_code']);
        });
    }
};
