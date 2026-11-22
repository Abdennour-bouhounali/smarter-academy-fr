<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * « رابط الوليّ » — le lien PRIVÉ qui montre au parent le travail de son enfant,
 * SANS compte (owner, 2026-10-23 ; docs/architecture/PARENT_SPACE.md §2).
 *
 * Le jeton est retrouvé par son empreinte (`token_hash`, sha256) et gardé
 * CHIFFRÉ (`token_encrypted`) : l'élève et l'enseignant doivent pouvoir
 * réafficher le même lien ou le même QR sans le remplacer. Un seul lien vivant
 * par élève ; un nouveau révoque l'ancien. Révoquer n'efface rien.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parent_access_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->char('token_hash', 64)->unique();
            $table->text('token_encrypted');
            $table->string('consent_version', 32);
            $table->timestamp('consented_at');
            // student | teacher — qui l'a créé (l'enseignant : « بطاقات الأولياء »).
            $table->string('created_by', 16);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            // Le code à 4 chiffres que le parent peut poser à la première ouverture.
            $table->string('pin_hash')->nullable();
            $table->unsignedTinyInteger('pin_failures')->default(0);
            $table->timestamp('pin_locked_until')->nullable();
            $table->unsignedInteger('open_count')->default(0);
            $table->timestamp('last_opened_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            // student | teacher | system (remplacé par un nouveau lien).
            $table->string('revoked_by', 16)->nullable();
            $table->timestamps();

            $table->index(['student_id', 'revoked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parent_access_links');
    }
};
