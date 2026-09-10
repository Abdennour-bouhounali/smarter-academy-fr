<?php

use App\Models\StudentReport;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le signal immédiat, et d'où il vient.
     *
     * Deux besoins, une migration :
     *
     * 1. `category` devient NULLABLE. Un signalement naît au CLIC, avant que
     *    l'élève n'ait choisi quoi que ce soit — « un élève a buté ici » est
     *    déjà une information, même s'il referme la fenêtre ensuite. L'autre
     *    solution aurait été d'insérer 'other' par défaut : ce serait inventer
     *    une réponse que l'élève n'a pas donnée, et fausser durablement les
     *    statistiques par catégorie.
     *
     * 2. `source` dit d'OÙ part le signalement — sommaire de leçon, module,
     *    exercice, question, diagnostic. Jusqu'ici l'administration devait le
     *    déduire de la présence ou l'absence de module_number/exercise_code,
     *    ce qui rend « signalement au niveau leçon » indistinguable de
     *    « contexte incomplet ».
     *
     * `details_completed_at` sépare les deux moments : signal posé vs.
     * formulaire rempli. Un horodatage plutôt qu'un booléen — on veut savoir
     * QUAND, et un booléen se déduit de sa présence.
     *
     * Additive : aucune colonne supprimée, aucune donnée réécrite.
     */
    public function up(): void
    {
        Schema::table('student_reports', function (Blueprint $table) {
            $table->string('source')->default(StudentReport::SOURCE_LESSON)->after('question_attempt_id');
            $table->timestamp('details_completed_at')->nullable()->after('note');

            // La déduplication d'un signal encore incomplet interroge
            // (user_id, fingerprint) : sans index, chaque clic ferait un
            // balayage complet de la table.
            $table->index(['user_id', 'fingerprint']);
            $table->index('source');
        });

        // `category` nullable. Fait en SQL brut : rendre une colonne nullable
        // avec le Blueprint exige doctrine/dbal, absent de ce projet.
        DB::statement('ALTER TABLE student_reports MODIFY category VARCHAR(255) NULL');

        // Reprise des lignes existantes : un signalement déjà en base a
        // forcément été complété (l'ancien flux exigeait la catégorie), et sa
        // source se déduit du contexte qu'il porte.
        DB::table('student_reports')->whereNull('details_completed_at')->update([
            'details_completed_at' => DB::raw('created_at'),
        ]);
        DB::table('student_reports')->whereNotNull('exercise_code')->update(['source' => StudentReport::SOURCE_EXERCISE]);
        DB::table('student_reports')->whereNull('exercise_code')->whereNotNull('module_number')->update(['source' => StudentReport::SOURCE_MODULE]);
    }

    public function down(): void
    {
        Schema::table('student_reports', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'fingerprint']);
            $table->dropIndex(['source']);
            $table->dropColumn(['source', 'details_completed_at']);
        });

        DB::statement('ALTER TABLE student_reports MODIFY category VARCHAR(255) NOT NULL');
    }
};
