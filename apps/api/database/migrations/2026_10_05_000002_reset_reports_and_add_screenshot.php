<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

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
 * Les signalements existants étaient des TESTS (décision du propriétaire) :
 * ils sont effacés, avec leurs notes. Irréversible par nature — `down()` ne
 * retire que la colonne.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_reports', function (Blueprint $table) {
            $table->string('screenshot_path')->nullable()->after('note');
        });

        DB::table('report_notes')->delete();
        DB::table('student_reports')->delete();
        Storage::disk('local')->deleteDirectory('reports');
    }

    public function down(): void
    {
        Schema::table('student_reports', function (Blueprint $table) {
            $table->dropColumn('screenshot_path');
        });
    }
};
