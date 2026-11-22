<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * La « جولة تعريفية » (2026-10-07) — la visite guidée d'une page, montrée UNE
 * fois par compte, à la première visite de la page.
 *
 * Une ligne = une page dont la visite est CLOSE pour ce compte : l'utilisateur
 * l'a terminée (`completed`) ou passée (`skipped`). Absente = jamais close :
 * la visite s'ouvre à la prochaine arrivée sur la page. Une visite close ne
 * revient jamais d'elle-même — seul le bouton « جولة في الصفحة » la rejoue.
 *
 * `tour` est la clé du registre front (`student.home`, `teacher.classes`…) :
 * le rôle en préfixe, la page ensuite. `step` garde l'étape atteinte (où
 * l'utilisateur a passé), pour savoir si une visite est lue jusqu'au bout.
 * Voir docs/architecture/PAGE_TOURS.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_tours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('tour', 64);
            $table->string('status', 16);
            $table->unsignedSmallInteger('step')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'tour']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_tours');
    }
};
