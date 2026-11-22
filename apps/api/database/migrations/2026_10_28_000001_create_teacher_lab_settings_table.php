<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Les questions PENDANT les labos (LabCheckpoint, 2026-10-28) : un ENSEIGNANT peut les couper ou les rallumer pour SON compte, labo par labo
 * (sa préparation, sa présentation en classe). Pour les ÉLÈVES elles sont TOUJOURS obligatoires : rien ici ne les concerne (propriétaire).
 * `checkpoints_off` = les clés de labo « <module>:<type> » coupées pour cet enseignant dans cette leçon ; absence de ligne = toutes actives.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_lab_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->json('checkpoints_off')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'lesson_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_lab_settings');
    }
};
