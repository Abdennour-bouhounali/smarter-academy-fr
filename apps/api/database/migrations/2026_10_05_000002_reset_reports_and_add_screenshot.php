<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Le signalement change de mains — 2026-10-05.
 *
 * Seuls l'administrateur et les AMBASSADEURS (« سفراء ») signalent désormais
 * un problème, en UN envoi (plus de signal posé au clic), avec une capture
 * d'écran facultative où la zone fautive est encadrée.
 *
 *   student_reports.screenshot_path   chemin sur le disque privé `local`
 *                                     (reports/{id}/…), null sans capture
 *
 * Dans le produit algérien, cette migration effaçait aussi tous les
 * signalements, leurs notes et leurs fichiers (des TESTS, décision de son
 * propriétaire). En France elle ne fait que le schéma : effacer des
 * signalements n'a jamais été une décision française, et une migration qui
 * vide une table ne doit pas tourner sur une base qui a des données. Aucune
 * base française ne l'a encore jouée (la base est créée neuve, plan §6).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_reports', function (Blueprint $table) {
            $table->string('screenshot_path')->nullable()->after('note');
        });
    }

    public function down(): void
    {
        Schema::table('student_reports', function (Blueprint $table) {
            $table->dropColumn('screenshot_path');
        });
    }
};
