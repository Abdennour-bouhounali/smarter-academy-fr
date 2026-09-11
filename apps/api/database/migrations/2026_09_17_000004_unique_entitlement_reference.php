<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Un abonnement ne peut produire qu'UN droit — tenu par la base.
     *
     * L'idempotence du synchroniseur reposait jusqu'ici sur un
     * `lockForUpdate()` suivi d'une lecture. Cela suffit pour une commande
     * d'entretien qui tourne seule. Cela ne suffit PLUS quand un fournisseur
     * livre deux fois le même évènement en parallèle : les deux transactions
     * peuvent constater l'absence de droit avant que l'une n'écrive, et
     * l'élève se retrouve avec deux droits dont un que plus rien ne révoquera.
     *
     * L'index rend ce scénario impossible plutôt qu'improbable.
     *
     * Pourquoi (type, reference) et non `reference` seule : une dérogation
     * d'administration porte `reference = NULL`, et il en faut autant qu'on
     * veut. MySQL n'entre pas les NULL en collision dans un index unique, donc
     * les dérogations ne sont pas concernées — seuls les droits qui portent
     * une référence, c'est-à-dire ceux issus d'un abonnement, le sont.
     */
    public function up(): void
    {
        // Un index unique posé sur des doublons échoue au milieu de la
        // migration et laisse le schéma à moitié migré. On regarde AVANT, et
        // on s'arrête avec un message exploitable plutôt qu'une erreur SQL
        // brute. Aucune ligne n'est jamais fusionnée ni supprimée
        // automatiquement : arbitrer entre deux droits est une décision
        // humaine, pas une migration.
        $duplicates = DB::table('entitlements')
            ->select('type', 'reference', DB::raw('COUNT(*) as total'))
            ->whereNotNull('reference')
            ->groupBy('type', 'reference')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        if ($duplicates->isNotEmpty()) {
            $detail = $duplicates
                ->map(fn ($row) => "{$row->type}/{$row->reference} ×{$row->total}")
                ->implode(', ');

            throw new RuntimeException(
                'Des droits en double empêchent la pose de la contrainte d\'unicité : '
                .$detail
                .'. Arbitrez ces lignes à la main (en RÉVOQUANT celle en trop, jamais en la supprimant), puis relancez.'
            );
        }

        Schema::table('entitlements', function (Blueprint $table) {
            $table->unique(['type', 'reference'], 'entitlements_type_reference_unique');
        });
    }

    public function down(): void
    {
        Schema::table('entitlements', function (Blueprint $table) {
            $table->dropUnique('entitlements_type_reference_unique');
        });
    }
};
