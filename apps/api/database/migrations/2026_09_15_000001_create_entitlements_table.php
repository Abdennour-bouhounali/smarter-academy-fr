<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le DROIT D'ACCÈS — distinct de trois choses avec lesquelles il se
     * confond facilement :
     *
     *   users.account_status  → le compte est-il ouvert ?
     *   lessons.publication_* → ce contenu a-t-il le droit d'être servi ?
     *   entitlements          → cet élève a-t-il le droit commercial d'y accéder ?
     *
     * Les trois sont indépendants, et c'est voulu : un droit valide sur une
     * leçon masquée reste un refus (voir ContentAccess). Un droit n'est PAS
     * une dérogation d'administration au contenu non publié.
     *
     * Pas de ligne « free » : l'accès gratuit est une RÈGLE (tout compte actif
     * la satisfait), pas une donnée. Créer une ligne par élève pour dire
     * « il a le droit au gratuit » produirait des millions de lignes qui ne
     * portent aucune information — leur absence dit déjà la même chose.
     * Seuls les droits qui ne se déduisent pas d'une règle sont stockés ici.
     *
     * `source` / `reference` restent GÉNÉRIQUES : une chaîne libre et une
     * référence opaque. Aucune sémantique de fournisseur, de livre ni
     * d'établissement n'est codée — le jour où une intégration de paiement
     * écrira ici, c'est une valeur de plus, pas une migration.
     */
    public function up(): void
    {
        Schema::create('entitlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // subscription | admin_override
            // Chaîne libre et non enum : un type de plus doit rester additif.
            $table->string('type');
            // active | revoked
            $table->string('status')->default('active');

            // Validité temporelle. NULL sur expires_at = sans terme.
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            // D'où vient ce droit, et quoi consulter pour le justifier.
            $table->string('source')->nullable();
            $table->string('reference')->nullable();

            // Qui l'a accordé, pour une dérogation d'administration. Nul
            // pour un droit venu d'une synchronisation automatique.
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete();

            // Le motif — c'est ce qui permet de répondre « pourquoi cet élève
            // a-t-il accès ? » sans lire du SQL.
            $table->string('reason')->nullable();

            $table->timestamps();

            // La question posée à CHAQUE évaluation : « les droits actifs de
            // cet élève ». C'est l'index qui la sert.
            $table->index(['user_id', 'status', 'type']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entitlements');
    }
};
