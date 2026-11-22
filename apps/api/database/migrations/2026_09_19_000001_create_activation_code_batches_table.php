<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Un LOT de codes d'activation — ce qui est imprimé d'un coup.
     *
     * Le lot existe parce que les conditions d'accès (durée, date limite
     * d'utilisation, motif commercial) appartiennent à l'impression, pas au
     * code : cent cartes vendues à la même occasion ouvrent le même droit.
     * Les porter sur chaque code les dupliquerait cent fois, et un lot dont
     * la moitié des codes ouvre six mois et l'autre un an ne se décrirait
     * plus.
     *
     * ── Deux échéances DISTINCTES, et c'est la subtilité du modèle ────────
     *
     *   redeem_by      → jusqu'à QUAND le code peut être saisi.
     *                    Passé ce jour, une carte invendue ne vaut plus rien.
     *   access_days /  → COMBIEN DE TEMPS l'accès dure une fois le code saisi.
     *   access_ends_at
     *
     * Les deux sont facultatives et ne se remplacent pas : une carte peut
     * être utilisable jusqu'en juin et ouvrir un an à partir du jour où
     * l'élève la saisit.
     *
     * `access_days` et `access_ends_at` sont MUTUELLEMENT EXCLUSIVES :
     *
     *   access_days = 365     → un an à compter de la saisie (glissant)
     *   access_ends_at = date → jusqu'à cette date, quelle que soit la saisie
     *                           (typiquement « fin d'année scolaire »)
     *   les deux à NULL       → accès sans terme
     *
     * L'exclusivité est tenue par ActivationCodeGenerator plutôt que par une
     * contrainte SQL : le message rendu à l'administrateur doit expliquer
     * laquelle des deux choisir, ce qu'une violation de contrainte ne fait
     * pas. Voir ALGERIA_PLATFORM_MASTER_SPEC.md §17.
     */
    public function up(): void
    {
        Schema::create('activation_code_batches', function (Blueprint $table) {
            $table->id();

            // Ce qui permet de RETROUVER un lot six mois plus tard : « cartes
            // Alger-Centre janvier », « lot revendeur Oran ». Obligatoire,
            // parce qu'un lot sans nom n'est plus administrable dès le
            // troisième.
            $table->string('label');

            // Combien de codes ont été produits. Recopié depuis la demande
            // plutôt que compté : le nombre DEMANDÉ reste vrai même après
            // qu'un code a été révoqué, et c'est lui qui se compare au nombre
            // de cartes physiques imprimées.
            $table->unsignedInteger('quantity');

            // La durée d'accès ouverte par un code de ce lot. Voir le
            // docblock : exclusives, toutes deux facultatives.
            $table->unsignedInteger('access_days')->nullable();
            $table->timestamp('access_ends_at')->nullable();

            // La date limite de SAISIE. NULL = le code reste utilisable
            // indéfiniment.
            $table->timestamp('redeem_by')->nullable();

            $table->text('notes')->nullable();

            // Qui a produit ce lot. Nul si le compte a été supprimé depuis —
            // la trace du lot survit à celle de son auteur, comme partout
            // ailleurs dans ce schéma.
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activation_code_batches');
    }
};
