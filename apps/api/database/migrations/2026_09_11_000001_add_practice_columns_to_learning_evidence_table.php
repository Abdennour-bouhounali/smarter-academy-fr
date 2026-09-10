<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Le moteur de pratique devient une SECONDE source de preuve, dans la MÊME
// table — jamais une table parallèle. Une seconde table de preuve obligerait
// à interroger deux historiques pour répondre à « pourquoi ce point est-il
// maîtrisé ? », et c'est exactement ce que l'architecture interdit.
//
// Tout est additif et défaillable : les 193 lignes existantes gardent
// `outcome`/`level` à NULL et continuent de se lire par `is_correct`, qui
// n'est pas touché. Aucune migration de données n'est nécessaire.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('learning_evidence', function (Blueprint $table) {
            // Les six issues de la cible §11. `is_correct` ne peut pas
            // représenter `partially_correct` ni `syntax_error`, et les
            // écraser toutes en `false` est précisément ce que la cible
            // refuse. NULL sur les lignes antérieures : pour elles,
            // `is_correct` reste la source.
            $table->string('outcome')->nullable()->after('is_correct');

            // Niveau de pratique 1..5, qui alimente enfin le paramètre
            // `$difficulty` que MasteryModel::updateConfidence accepte depuis
            // toujours sans qu'aucun appelant ne le remplisse. NULL pour le
            // test final, qui n'a pas de niveau.
            $table->unsignedTinyInteger('level')->nullable()->after('assessment_type');

            // Un indice utilisé n'est PAS un échec (cible §12) : il réduit la
            // valeur probante d'une réussite autonome, il ne la rend jamais
            // négative.
            $table->unsignedTinyInteger('hints_used')->default(0)->after('level');

            // Pas de clé étrangère : les misconceptions vivent dans du contenu
            // versionné (content/practice/misconceptions.json), comme les
            // questions. Même convention que diagnostic_responses.misconception.
            $table->string('misconception_id')->nullable()->after('hints_used');

            // practice_sessions.session_id, ou NULL pour le test final.
            $table->string('source_id', 36)->nullable()->after('misconception_id');

            // `assessment_type` devient un critère de filtre courant (« mes
            // preuves de pratique ») et n'avait aucun index.
            $table->index(['user_id', 'assessment_type'], 'learning_evidence_user_type_index');
        });
    }

    public function down(): void
    {
        Schema::table('learning_evidence', function (Blueprint $table) {
            $table->dropIndex('learning_evidence_user_type_index');
            $table->dropColumn(['outcome', 'level', 'hints_used', 'misconception_id', 'source_id']);
        });
    }
};
