<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le statut de COMPTE — à ne jamais confondre avec le statut
     * d'abonnement (voir subscriptions). « Compte actif, abonnement expiré »
     * est un état parfaitement valide, et les deux colonnes vivent dans deux
     * tables pour que personne ne soit tenté de les fusionner.
     *
     * active | suspended | disabled. Appliqué côté SERVEUR par le middleware
     * EnsureAccountIsActive : cacher un bouton n'a jamais suspendu personne.
     *
     * `last_activity_at` alimente les indicateurs d'activité (DAU/WAU/MAU).
     * Il est rempli ici à partir de la progression déjà enregistrée, sinon
     * chaque élève existant paraîtrait inactif depuis toujours.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('account_status')->default('active')->after('role');
            $table->timestamp('suspended_at')->nullable()->after('account_status');
            $table->timestamp('last_activity_at')->nullable()->after('suspended_at');

            $table->index('account_status');
            $table->index('last_activity_at');
        });

        // Reprise : la dernière activité connue de chaque élève, telle que
        // la progression la connaît déjà. Écrit avec le query builder plutôt
        // qu'un UPDATE...JOIN : la suite de tests tourne aussi bien sur
        // SQLite (phpunit.xml) que sur MySQL (phpunit.local.xml), et un
        // UPDATE...JOIN n'existe pas en SQLite.
        $seen = DB::table('student_lesson_progress')
            ->select('user_id', DB::raw('MAX(last_activity_at) AS seen'))
            ->groupBy('user_id')
            ->get();

        foreach ($seen as $row) {
            DB::table('users')->where('id', $row->user_id)->update([
                'last_activity_at' => $row->seen,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['account_status']);
            $table->dropIndex(['last_activity_at']);
            $table->dropColumn(['account_status', 'suspended_at', 'last_activity_at']);
        });
    }
};
