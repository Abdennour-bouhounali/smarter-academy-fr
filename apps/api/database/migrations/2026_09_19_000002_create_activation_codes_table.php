<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le CODE D'ACTIVATION — ce qui est imprimé sur une carte et vendu en
     * espèces (ALGERIA_PLATFORM_MASTER_SPEC.md §17).
     *
     * Ce n'est PAS un droit d'accès. La chaîne est :
     *
     *     code activé  →  entitlements (type = activation_code)
     *                            ↓
     *                    EntitlementService  →  ContentAccess
     *
     * Le code est le TITRE ; le droit est l'ACCÈS. Les séparer est ce qui
     * permet de révoquer un code volé sans perdre la trace qu'il avait ouvert
     * un accès, et de raisonner sur les droits sans savoir d'où ils viennent.
     *
     * ── Le code n'est jamais stocké en clair ─────────────────────────────
     * `code_hash` porte un HMAC-SHA256 du code normalisé, la clé étant dérivée
     * d'APP_KEY (voir ActivationCodeFormat). Conséquences assumées :
     *
     *   — une fuite de la base ne donne aucun code utilisable ;
     *   — personne, administrateur compris, ne peut relire un code après sa
     *     génération : il est montré UNE fois, à la création du lot ;
     *   — une rotation d'APP_KEY rend inutilisables les codes non encore
     *     saisis. C'est documenté dans .env.example, et c'est le prix du
     *     premier point.
     *
     * `code_hint` garde les 4 derniers symboles, en clair et volontairement :
     * c'est ce qui permet à l'administration de rapprocher une carte physique
     * d'une ligne (« le code se termine par 7K2P ») sans jamais reconstituer
     * le secret — 4 symboles sur 12 laissent 2^40 possibilités.
     *
     * HMAC et non bcrypt : un code se VÉRIFIE par recherche indexée (« ce
     * code existe-t-il ? »), pas par comparaison avec une ligne déjà trouvée.
     * Un hachage salé par ligne obligerait à parcourir toute la table à
     * chaque saisie. Le code ayant 60 bits d'entropie et n'étant ni choisi ni
     * réutilisé par un humain, la lenteur anti-force-brute que bcrypt apporte
     * ne protège de rien ici — et la limite de débit couvre le tâtonnement.
     *
     * ── Les états ────────────────────────────────────────────────────────
     *   available  → jamais saisi, utilisable
     *   activated  → saisi ; activated_by / activated_at / entitlement_id
     *   revoked    → retiré par l'administration, définitivement
     *   expired    → DÉRIVÉ, jamais stocké : available ET expires_at dépassé.
     *
     * « expiré » n'est pas une colonne pour la même raison que chez
     * Entitlement::isValid() : le temps doit fermer tout seul, sans qu'aucune
     * tâche planifiée n'ait à passer. Une colonne aurait produit des codes
     * « available » périmés dès le premier oubli de cron.
     */
    public function up(): void
    {
        Schema::create('activation_codes', function (Blueprint $table) {
            $table->id();

            // Le lot porte les CONDITIONS (durée, date limite). Suppression en
            // cascade : un lot ne se supprime pas en exploitation normale
            // (on révoque), mais s'il l'était, des codes orphelins n'auraient
            // plus de conditions à appliquer.
            $table->foreignId('batch_id')->constrained('activation_code_batches')->cascadeOnDelete();

            // 64 caractères hexadécimaux = SHA-256. UNIQUE : c'est cet index
            // qui garantit qu'un même code ne peut pas exister deux fois, et
            // c'est aussi lui qui sert la recherche à chaque saisie.
            $table->string('code_hash', 64)->unique();

            // Les 4 derniers symboles, en clair. Voir le docblock.
            $table->string('code_hint', 4);

            // available | activated | revoked (jamais 'expired' : dérivé)
            $table->string('status')->default('available');

            // Date limite de SAISIE, recopiée du lot à la création. Recopiée
            // plutôt que lue par jointure pour que la question « ce code
            // est-il encore saisissable ? » reste une condition indexable sur
            // une seule table — c'est la requête du chemin chaud.
            $table->timestamp('expires_at')->nullable();

            $table->timestamp('activated_at')->nullable();
            $table->foreignId('activated_by')->nullable()->constrained('users')->nullOnDelete();

            // Le droit d'accès né de ce code. Le lien est gardé pour que
            // révoquer un code sache quoi fermer, et pour répondre à
            // « d'où vient cet accès ? » sans deviner.
            $table->foreignId('entitlement_id')->nullable()->constrained('entitlements')->nullOnDelete();

            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('revoke_reason')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            // « Les codes disponibles », « les codes de ce lot », « les codes
            // de cet élève » : les trois questions de l'écran d'administration.
            $table->index(['status', 'expires_at']);
            $table->index(['batch_id', 'status']);
            $table->index('activated_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activation_codes');
    }
};
