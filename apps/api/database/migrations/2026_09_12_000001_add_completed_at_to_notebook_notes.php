<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « Marquer comme traitée » : l'élève a revu la note et la considère réglée.
 *
 * Un horodatage nullable, et non un booléen `is_completed` : QUAND une note a
 * été traitée est une information en soi (elle situe le travail de révision
 * dans le temps), là où un booléen la perdrait. `null` = à revoir, une date =
 * traitée. La note n'est jamais supprimée pour autant — le carnet reste un
 * enregistrement historique.
 *
 * L'index couvre l'écran « les notes de cette leçon » avec le filtre « à
 * revoir d'abord », qui est la lecture par défaut du carnet.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notebook_notes', function (Blueprint $table) {
            $table->timestamp('completed_at')->nullable()->after('mistake_type');
            $table->index(['user_id', 'completed_at']);
        });
    }

    public function down(): void
    {
        Schema::table('notebook_notes', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'completed_at']);
            $table->dropColumn('completed_at');
        });
    }
};
