<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le CLASSE d'un professeur (« القسم ») — un groupe d'élèves qu'il suit.
     *
     * Ne contient AUCUN contenu : le programme reste global (leçons,
     * modules, exercices). Une classe ne fait que régler la VISIBILITÉ de
     * ce programme pour ses élèves (classroom_lessons) et donner au
     * professeur une vue sur leur progression, qui reste la leur.
     *
     *   grade          le code de classe scolaire, même convention libre que
     *                  users.grade ('4am') — le catalogue est l'autorité.
     *   status         active | archived | suspended. Archiver garde tout :
     *                  les adhésions, la configuration, et surtout
     *                  l'historique d'apprentissage des élèves, qui ne lui
     *                  appartient pas.
     *   join_code      le rmz al-indimam : ce qu'un élève tape pour rejoindre.
     *                  Unique en base ; rotatif par le professeur.
     *
     * À ne pas confondre avec « وضع القسم » (Classroom Mode), le mode de
     * présentation au projecteur : autre couche, autre document.
     */
    public function up(): void
    {
        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('description', 500)->nullable();
            $table->string('grade', 50);
            $table->string('academic_year', 9)->nullable();
            $table->string('status', 16)->default('active');
            $table->string('join_code', 8)->unique();
            $table->boolean('join_code_enabled')->default(true);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['teacher_id', 'status']);
            $table->index('grade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classrooms');
    }
};
