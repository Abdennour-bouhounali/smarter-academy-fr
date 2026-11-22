<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Le journal des REJEUX de maîtrise : qui a recalculé quoi, avec quelle
 * version du moteur, et ce qui a changé. Une trace d'exploitation — jamais
 * une source de vérité.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mastery_replays', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('engine_version');
            // all | user | learning_point | lesson
            $table->string('scope', 24);
            $table->string('scope_id')->nullable();
            $table->boolean('dry_run')->default(false);
            // pending | running | completed | failed
            $table->string('status', 16)->default('pending');
            $table->unsignedInteger('pairs_total')->default(0);
            $table->unsignedInteger('pairs_done')->default(0);
            $table->unsignedInteger('pairs_changed')->default(0);
            // Distribution des statuts avant/après, transitions, exemples.
            $table->json('diff_summary')->nullable();
            $table->text('error')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mastery_replays');
    }
};
