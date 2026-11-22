<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « فضاء الوليّ » — l'espace du parent (docs/architecture/PARENT_SPACE.md).
 *
 * Trois tables :
 *
 *   - parent_link_codes : le RÉCÉPISSÉ du consentement de l'élève. L'élève lit
 *     ce que son وليّ verra, accepte, et reçoit un code qu'il lui donne. Un
 *     seul code vivant par élève ; il expire et ne sert qu'une fois ;
 *   - parent_links : le lien parent ↔ élève. Rompre un lien ne l'efface pas
 *     (status = revoked) : l'historique de qui a lu quoi reste lisible ;
 *   - study_time_days : le TEMPS RÉEL d'étude, agrégé par jour (Alger) et par
 *     surface. Jamais un journal des sites visités : la plateforme ne voit
 *     que ses propres pages, et c'est tout ce qu'elle compte.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parent_link_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('code', 16)->unique();
            // La version du texte que l'élève a accepté en créant ce code.
            $table->string('consent_version', 32);
            $table->timestamp('consented_at');
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        Schema::create('parent_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            // active | revoked
            $table->string('status', 16)->default('active');
            $table->string('consent_version', 32);
            $table->timestamp('consented_at');
            $table->timestamp('linked_at');
            $table->timestamp('revoked_at')->nullable();
            // parent | student | admin — qui a rompu le lien.
            $table->string('revoked_by', 16)->nullable();
            // Le résumé hebdomadaire par courriel, réglé par le parent, enfant par enfant.
            $table->boolean('weekly_email')->default(true);
            // Le dimanche (Alger) de la dernière semaine envoyée : l'envoi est idempotent.
            $table->date('last_weekly_report_week')->nullable();
            $table->timestamps();

            $table->unique(['parent_id', 'student_id']);
            $table->index(['student_id', 'status']);
        });

        Schema::create('study_time_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('day');
            // lesson | practice | challenge | lab | game | other
            $table->string('surface', 16);
            // Page visible, fenêtre au premier plan, un geste depuis moins d'une minute.
            $table->unsignedInteger('active_seconds')->default(0);
            // Page visible mais aucun geste (borné : au-delà, la séance est finie).
            $table->unsignedInteger('idle_seconds')->default(0);
            // Page cachée ou fenêtre quittée pendant une séance (borné aussi).
            $table->unsignedInteger('away_seconds')->default(0);
            // Combien de fois l'élève a quitté la page pendant une séance.
            $table->unsignedInteger('leave_count')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'day', 'surface']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_time_days');
        Schema::dropIfExists('parent_links');
        Schema::dropIfExists('parent_link_codes');
    }
};
