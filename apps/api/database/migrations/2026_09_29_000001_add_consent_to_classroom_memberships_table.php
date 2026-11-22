<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Le CONSENTEMENT de l'élève, sur son appartenance.
 *
 * Rejoindre un قسم ouvre à l'enseignant l'apprentissage de l'élève dans les
 * leçons de la classe : progression, maîtrise, réponses, cahier. Ce geste
 * doit être délibéré et daté. `consented_at` dit QUAND l'élève a accepté,
 * `consent_version` QUEL texte il a lu (config classroom.consent_version) :
 * si le texte change, on sait qui a accepté l'ancien.
 *
 * Null sur les lignes antérieures : l'élève a rejoint avant que le texte
 * n'existe. Il lui est redemandé une fois (TEACHER_CLASSROOM_ARCHITECTURE.md
 * § « Consentement »), rien n'est supposé.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classroom_memberships', function (Blueprint $table) {
            $table->timestamp('consented_at')->nullable()->after('joined_via');
            $table->string('consent_version', 32)->nullable()->after('consented_at');
        });
    }

    public function down(): void
    {
        Schema::table('classroom_memberships', function (Blueprint $table) {
            $table->dropColumn(['consented_at', 'consent_version']);
        });
    }
};
