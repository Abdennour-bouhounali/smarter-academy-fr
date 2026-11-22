<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Prérequis entre points d'apprentissage, avec le seuil de maîtrise
     * attendu (défaut 0,700 = MasteryModel::MASTERED_THRESHOLD). Sert au
     * profil (« quel point manque à cet élève pour celui-ci ? »), pas à
     * verrouiller : la garde `isMasteryGateSatisfied` côté client échoue
     * ouverte et ne bloque que sur un écart DÉMONTRÉ.
     */
    public function up(): void
    {
        Schema::create('learning_point_prerequisites', function (Blueprint $table) {
            $table->id();
            // Noms de contrainte EXPLICITES : le nom que Laravel dériverait
            // (`learning_point_prerequisites_prerequisite_learning_point_id_foreign`)
            // fait 67 caractères, et MySQL refuse tout identifiant au-delà
            // de 64 (erreur 1059). Le schéma serait passé sous SQLite et
            // aurait cassé au premier `migrate` sur Hostinger.
            $table->foreignId('learning_point_id')->constrained('learning_points', indexName: 'lp_prereq_lp_fk')->cascadeOnDelete();
            $table->foreignId('prerequisite_learning_point_id')->constrained('learning_points', indexName: 'lp_prereq_prereq_fk')->cascadeOnDelete();
            $table->decimal('required_mastery', 4, 3)->default(0.700);
            $table->timestamps();

            $table->unique(['learning_point_id', 'prerequisite_learning_point_id'], 'lp_prerequisite_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_point_prerequisites');
    }
};
