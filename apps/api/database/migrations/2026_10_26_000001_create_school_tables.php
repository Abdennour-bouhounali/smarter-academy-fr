<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « فضاء الإدارة » — l'ÉTABLISSEMENT comme objet de premier rang (le « modèle C »
 * de TEACHER_CLASSROOM_ARCHITECTURE.md §6 ; docs/architecture/SCHOOL_ADMIN_SPACE.md).
 *
 * Une classe d'établissement reste la classe de SON enseignant (`teacher_id`) :
 * `classrooms.school_id` ajoute un lecteur, jamais un second propriétaire. Et
 * l'établissement ne lit un élève un par un que s'il y a consenti
 * (`school_consent_at`) — l'adhésion à la classe ne parlait que du professeur.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('wilaya', 64)->nullable();
            $table->string('commune', 96)->nullable();
            // Le code ministériel de l'établissement, s'il est connu.
            $table->string('code', 32)->nullable()->unique();
            // active | suspended | archived
            $table->string('status', 16)->default('active');
            $table->string('current_academic_year', 9)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('status');
        });

        // Le personnel de direction. Un compte n'appartient qu'à UN établissement.
        Schema::create('school_staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            // director — le seul rôle aujourd'hui (décision D3 du propriétaire).
            $table->string('school_role', 16)->default('director');
            // active | revoked
            $table->string('status', 16)->default('active');
            $table->foreignId('appointed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('appointed_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['school_id', 'status']);
        });

        Schema::create('school_teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            // active | left
            $table->string('status', 16)->default('active');
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'teacher_id']);
        });

        Schema::create('school_terms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('academic_year', 9);
            $table->unsignedTinyInteger('term');
            $table->date('starts_on');
            $table->date('ends_on');
            $table->timestamps();

            $table->unique(['school_id', 'academic_year', 'term']);
        });

        Schema::table('classrooms', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable()->after('teacher_id')->constrained()->nullOnDelete();
        });

        Schema::table('classroom_memberships', function (Blueprint $table) {
            $table->timestamp('school_consent_at')->nullable()->after('consent_version');
            // student (l'élève a confirmé) | school (inscrit par la direction, D2)
            $table->string('school_consent_by', 16)->nullable()->after('school_consent_at');
        });
    }

    public function down(): void
    {
        Schema::table('classroom_memberships', function (Blueprint $table) {
            $table->dropColumn(['school_consent_at', 'school_consent_by']);
        });
        Schema::table('classrooms', function (Blueprint $table) {
            $table->dropConstrainedForeignId('school_id');
        });
        Schema::dropIfExists('school_terms');
        Schema::dropIfExists('school_teachers');
        Schema::dropIfExists('school_staff');
        Schema::dropIfExists('schools');
    }
};
