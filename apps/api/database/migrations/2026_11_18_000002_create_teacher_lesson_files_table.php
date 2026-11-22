<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « ملفّ الدرس » — le fichier de l'ENSEIGNANT sur une leçon (propriétaire, 2026-11-18) : UN seul par leçon. Le fichier
 * lui-même est un document de la سبّورة du مختبر الرياضيات (« use exactly the existing whiteboard ») ; cette table ne
 * garde que le lien (enseignant, leçon) → ce document. Supprimer le document dans le مختبر libère le lien.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_lesson_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->string('lesson_code', 120);
            $table->foreignId('math_lab_document_id')->nullable()->constrained('math_lab_documents')->nullOnDelete();
            $table->timestamps();
            $table->unique(['teacher_id', 'lesson_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_lesson_files');
    }
};
