<?php

use App\Domain\Classroom\JoinLinkToken;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * « فضاء الإدارة », phase 3 — la structure (SCHOOL_ADMIN_SPACE.md §7).
 *
 * - `schools.teacher_join_token` : le lien par lequel un ENSEIGNANT rejoint
 *   l'établissement (même nature que le lien de classe : 32 base62, en clair,
 *   renouvelable par le directeur).
 * - `users.birth_date` : la date de naissance d'un élève inscrit par la
 *   direction — elle distingue deux homonymes à l'import. Rien d'autre ne la lit.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schools', function (Blueprint $table) {
            $table->char('teacher_join_token', 32)->nullable()->unique()->after('code');
        });
        foreach (DB::table('schools')->whereNull('teacher_join_token')->pluck('id') as $id) {
            DB::table('schools')->where('id', $id)->update(['teacher_join_token' => JoinLinkToken::generate()]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->date('birth_date')->nullable()->after('grade');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('birth_date');
        });
        Schema::table('schools', function (Blueprint $table) {
            $table->dropUnique(['teacher_join_token']);
            $table->dropColumn('teacher_join_token');
        });
    }
};
