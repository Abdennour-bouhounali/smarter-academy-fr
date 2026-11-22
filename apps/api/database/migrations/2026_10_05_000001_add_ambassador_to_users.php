<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Les AMBASSADEURS (« سفراء ») — 2026-10-05.
 *
 *   users.is_ambassador    un enseignant de confiance, désigné par
 *                          l'administrateur : il voit TOUT le contenu, quel
 *                          qu'en soit l'état de publication, et lui seul
 *                          (avec l'administrateur) peut signaler un problème
 *   users.ambassador_since quand l'administrateur l'a désigné ; null sinon
 *
 * Un drapeau, et non un rôle : un ambassadeur reste un enseignant — ses
 * classes, son offre et son espace ne changent pas. Le drapeau n'a de sens
 * que sur un compte enseignant (User::isAmbassador le vérifie).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_ambassador')->default(false);
            $table->timestamp('ambassador_since')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_ambassador', 'ambassador_since']);
        });
    }
};
