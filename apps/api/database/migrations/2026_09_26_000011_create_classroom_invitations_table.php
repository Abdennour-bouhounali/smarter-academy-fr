<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Une INVITATION nominative à rejoindre une classe.
     *
     * Même discipline que les codes d'activation : le jeton n'est jamais
     * stocké en clair, seule son empreinte l'est (`token_hash`, HMAC dérivé
     * d'APP_KEY), plus quatre symboles d'indice. Le lien envoyé par courriel
     * est le seul porteur du secret ; l'accepter crée l'adhésion.
     *
     *   pending | accepted | revoked  (expired = dérivé de expires_at)
     *
     * L'adresse invitée n'est pas une CONDITION d'acceptation : le jeton
     * l'est. Un élève qui ouvre le lien depuis un autre compte rejoint
     * quand même — l'invitation reste tracée (accepted_by) pour que le
     * professeur voie qui a réellement rejoint.
     */
    public function up(): void
    {
        Schema::create('classroom_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained('classrooms')->cascadeOnDelete();
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email');
            $table->string('token_hash', 64)->unique();
            $table->string('token_hint', 4);
            $table->string('status', 16)->default('pending');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->foreignId('accepted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['classroom_id', 'status']);
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classroom_invitations');
    }
};
