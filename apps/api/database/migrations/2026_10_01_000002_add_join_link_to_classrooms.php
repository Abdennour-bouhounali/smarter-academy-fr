<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Le LIEN DE CLASSE remplace l'invitation par courriel (2026-10-01).
 *
 *   classrooms.join_link_token         le jeton de `/rejoindre/classe/{jeton}` —
 *                                      aléatoire, unique, stocké en clair comme
 *                                      join_code (voir JoinLinkToken)
 *   users.pending_class_join_token     l'élève a consenti sur la page du lien
 *   users.pending_class_join_at        AVANT d'avoir un compte : l'adhésion
 *                                      l'attend jusqu'à la vérification de son
 *                                      adresse, même ouverte dans un autre
 *                                      navigateur (PendingClassJoin)
 *
 * Les invitations par courriel ne sont plus émises ni acceptées. Leur table
 * est CONSERVÉE (historique : classroom_memberships.invitation_id y renvoie) ;
 * celles encore en attente sont révoquées, pour que la table dise la vérité.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classrooms', function (Blueprint $table) {
            $table->string('join_link_token', 64)->nullable()->unique()->after('join_code_enabled');
        });

        // Chaque classe existante reçoit son lien. Même tirage que
        // JoinLinkToken::generate() — recopié ici : une migration ne dépend
        // pas d'une classe applicative qui peut changer après elle.
        $alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        DB::table('classrooms')->whereNull('join_link_token')->orderBy('id')->pluck('id')->each(function ($id) use ($alphabet) {
            $token = '';
            for ($i = 0; $i < 32; $i++) {
                $token .= $alphabet[random_int(0, 61)];
            }
            DB::table('classrooms')->where('id', $id)->update(['join_link_token' => $token]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('pending_class_join_token', 64)->nullable();
            $table->timestamp('pending_class_join_at')->nullable();
        });

        if (Schema::hasTable('classroom_invitations')) {
            DB::table('classroom_invitations')->where('status', 'pending')
                ->update(['status' => 'revoked', 'revoked_at' => Carbon::now()]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['pending_class_join_token', 'pending_class_join_at']);
        });

        Schema::table('classrooms', function (Blueprint $table) {
            $table->dropUnique(['join_link_token']);
            $table->dropColumn('join_link_token');
        });
    }
};
