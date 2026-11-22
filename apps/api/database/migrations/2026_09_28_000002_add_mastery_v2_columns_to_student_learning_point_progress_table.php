<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Mastery V2, phase 1 — l'état canonique porte ses compteurs de preuve.
 *
 * Toujours UNE ligne par (élève, learning point) : aucune colonne ne
 * référence un exercice. La table reste bornée par élèves × learning points.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_learning_point_progress', function (Blueprint $table) {
            // threshold | insufficient_evidence | needs_assessment
            $table->string('status_reason', 32)->nullable()->after('status');

            $table->unsignedSmallInteger('partial_count')->default(0)->after('correct_count');
            $table->unsignedSmallInteger('failure_count')->default(0)->after('partial_count');

            // Démonstrations INDÉPENDANTES (§9 du plan) — ce qui distingue
            // « la même question dix fois » de « dix questions ».
            $table->unsignedSmallInteger('distinct_items_success')->default(0)->after('failure_count');
            $table->unsignedSmallInteger('distinct_items_attempted')->default(0)->after('distinct_items_success');
            $table->unsignedSmallInteger('distinct_templates_success')->default(0)->after('distinct_items_attempted');
            $table->unsignedSmallInteger('assessment_success_count')->default(0)->after('distinct_templates_success');
            $table->unsignedTinyInteger('max_difficulty_success')->default(0)->after('assessment_success_count');

            $table->timestamp('last_success_at')->nullable()->after('last_evidence_at');
            $table->timestamp('last_failure_at')->nullable()->after('last_success_at');

            // La version du moteur qui a produit cette ligne. Les lignes
            // antérieures à la V2 sont, de fait, des lignes V1.
            $table->unsignedTinyInteger('engine_version')->default(1)->after('last_failure_at');
            $table->timestamp('recomputed_at')->nullable()->after('engine_version');

            // L'agrégation classe × learning point (enseignant) groupe par point et statut.
            $table->index(['learning_point_id', 'status'], 'slpp_point_status_index');
        });
    }

    public function down(): void
    {
        Schema::table('student_learning_point_progress', function (Blueprint $table) {
            $table->dropIndex('slpp_point_status_index');
            $table->dropColumn([
                'status_reason', 'partial_count', 'failure_count',
                'distinct_items_success', 'distinct_items_attempted', 'distinct_templates_success',
                'assessment_success_count', 'max_difficulty_success',
                'last_success_at', 'last_failure_at', 'engine_version', 'recomputed_at',
            ]);
        });
    }
};
