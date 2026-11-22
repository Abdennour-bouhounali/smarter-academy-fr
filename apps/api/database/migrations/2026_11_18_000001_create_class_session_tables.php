<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « حصّة القسم » — la séance en classe d'un enseignant (CLASS_SESSION.md).
 *   class_seatings          le plan de la classe : qui est assis où, les équipes (UNE ligne par classe) ;
 *   class_tests             la copie d'un enseignant du test d'une leçon (début / fin) — le test PAR DÉFAUT reste un
 *                           fichier du dépôt (content/class-tests), jamais écrasé : « réinitialiser » supprime la copie ;
 *   class_sessions          une séance terminée : la leçon, le moment, le bilan ;
 *   class_session_answers   qui a répondu à quoi (juste ou non). Ce n'est JAMAIS une preuve d'apprentissage :
 *                           aucune de ces tables n'alimente learning_evidence ni la progression d'un élève.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_seatings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->unique()->constrained()->cascadeOnDelete();
            $table->json('layout');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('class_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->string('lesson_code', 120);
            $table->json('questions');
            $table->unsignedInteger('base_version')->nullable();
            $table->timestamps();
            $table->unique(['teacher_id', 'lesson_code']);
        });

        Schema::create('class_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('classroom_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->string('lesson_code', 120);
            $table->string('moment', 8);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->json('absent')->nullable();
            $table->json('summary');
            $table->timestamps();
            $table->index(['classroom_id', 'lesson_code']);
        });

        Schema::create('class_session_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_session_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('position');
            $table->string('question_id', 40);
            $table->string('item', 40)->nullable();
            $table->foreignId('student_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('team_id', 40)->nullable();
            $table->boolean('correct');
            $table->string('picked_by', 12)->default('order');
            $table->unsignedInteger('ms')->nullable();
            $table->index('student_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_session_answers');
        Schema::dropIfExists('class_sessions');
        Schema::dropIfExists('class_tests');
        Schema::dropIfExists('class_seatings');
    }
};
