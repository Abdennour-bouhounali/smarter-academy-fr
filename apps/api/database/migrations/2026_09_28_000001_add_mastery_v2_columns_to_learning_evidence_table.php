<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Mastery V2, phase 1 — la preuve devient auto-descriptive.
 *
 * Tout est ADDITIF et nullable : les lignes existantes restent valides, et
 * `smarter:evidence:backfill` les complète de façon déterministe. `outcome`
 * reste nullable en base (les lignes historiques n'en ont pas toutes) ; le
 * code refuse d'écrire une nouvelle preuve sans issue canonique.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('learning_evidence', function (Blueprint $table) {
            // LA question exacte : source:leçon:exercice:question. Canonique ;
            // `question_code` reste pour la compatibilité.
            $table->string('item_key', 191)->nullable()->after('question_code');
            // Le gabarit d'exercice déclaré par le contenu (templateId), sinon null.
            $table->string('template_key', 191)->nullable()->after('item_key');
            // 1..levels, résolue par le SERVEUR depuis le contenu — jamais par la requête.
            $table->unsignedTinyInteger('difficulty')->nullable()->after('level');
            // 1 + preuves antérieures de l'élève sur cet item.
            $table->unsignedSmallInteger('attempt_number')->nullable()->after('difficulty');
            // first | variant | retry_after_failure | repeat_after_success
            $table->string('demonstration_kind', 24)->nullable()->after('attempt_number');
            // server | client | client_verified | client_legacy
            $table->string('evaluated_by', 16)->nullable()->after('demonstration_kind');

            $table->index(['user_id', 'item_key'], 'learning_evidence_user_item_index');
            $table->index(['user_id', 'template_key'], 'learning_evidence_user_template_index');
            $table->index(['user_id', 'submitted_at'], 'learning_evidence_user_submitted_index');
        });

        Schema::table('learning_evidence_learning_point', function (Blueprint $table) {
            // Le rejeu et l'explication lisent « toutes les preuves de CE point » :
            // l'index unique existant commence par la preuve, pas par le point.
            $table->index(['learning_point_id', 'learning_evidence_id'], 'evidence_lp_by_point_index');
        });
    }

    public function down(): void
    {
        Schema::table('learning_evidence_learning_point', function (Blueprint $table) {
            $table->dropIndex('evidence_lp_by_point_index');
        });

        Schema::table('learning_evidence', function (Blueprint $table) {
            $table->dropIndex('learning_evidence_user_item_index');
            $table->dropIndex('learning_evidence_user_template_index');
            $table->dropIndex('learning_evidence_user_submitted_index');
            $table->dropColumn(['item_key', 'template_key', 'difficulty', 'attempt_number', 'demonstration_kind', 'evaluated_by']);
        });
    }
};
