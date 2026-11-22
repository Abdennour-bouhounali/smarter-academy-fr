<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * « Mon cahier » (كرّاسي) : l'espace où l'élève retrouve, range et révise
 * TOUTES ses notes. Une seule table, `notebook_notes`, reste la source de
 * vérité — pas de table par type de note. Ce que l'espace ajoute :
 *
 *  - `title`          un titre facultatif, pour retrouver une note d'un coup d'œil ;
 *  - `note_type`      ce qu'EST la note pour l'élève : note | erreur | question |
 *                     rappel | astuce | exemple | resume. Le contexte dit d'où
 *                     elle vient ; le type dit à quoi elle sert ;
 *  - `is_pinned`      « ⭐ importante » — un seul drapeau, pas deux ;
 *  - `archived_at`    rangée hors de vue sans être supprimée (date, pas booléen) ;
 *  - `next_review_at` la file « à revoir » : une date = dans la file. Prête pour
 *     `last_reviewed_at` une répétition espacée plus tard, sans en implémenter
 *     `review_count`   une aujourd'hui — l'intervalle double simplement ;
 *  - `content_text`   le TEXTE de la note, sans balises : la colonne de
 *                     recherche. `content` garde le HTML restreint de
 *                     l'éditeur ; chercher « span » ne doit rien trouver.
 *
 * Reprise des données : jusqu'ici, une note sans `completed_at` s'affichait
 * « للمراجعة ». Ce sens est conservé : ces notes ENTRENT dans la file de
 * révision. Aucune note, aucun rattachement, aucune date n'est perdu.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notebook_notes', function (Blueprint $table) {
            $table->string('title', 160)->nullable()->after('user_id');
            $table->string('note_type', 20)->default('note')->after('mistake_type');
            $table->boolean('is_pinned')->default(false)->after('note_type');
            $table->timestamp('archived_at')->nullable()->after('completed_at');
            $table->timestamp('next_review_at')->nullable()->after('archived_at');
            $table->timestamp('last_reviewed_at')->nullable()->after('next_review_at');
            $table->unsignedSmallInteger('review_count')->default(0)->after('last_reviewed_at');
            $table->text('content_text')->nullable()->after('content');

            // Les lectures du cahier sont TOUTES « mes notes, dans tel état » :
            // chaque index commence par user_id.
            $table->index(['user_id', 'archived_at']);
            $table->index(['user_id', 'next_review_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'note_type']);
        });

        // Reprise, par paquets : le texte de recherche, et la file de révision
        // pour les notes qui s'affichaient déjà « à revoir ».
        DB::table('notebook_notes')->orderBy('id')->chunkById(200, function ($rows) {
            foreach ($rows as $row) {
                DB::table('notebook_notes')->where('id', $row->id)->update([
                    'content_text' => self::plainText($row->content),
                    'next_review_at' => $row->completed_at === null ? $row->created_at : null,
                    // Une note d'exercice avec un type d'erreur EST une erreur.
                    'note_type' => $row->mistake_type !== null ? 'erreur' : 'note',
                ]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('notebook_notes', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'archived_at']);
            $table->dropIndex(['user_id', 'next_review_at']);
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['user_id', 'note_type']);
            $table->dropColumn([
                'title', 'note_type', 'is_pinned', 'archived_at', 'next_review_at',
                'last_reviewed_at', 'review_count', 'content_text',
            ]);
        });
    }

    private static function plainText(?string $html): string
    {
        $spaced = preg_replace('/<\/(p|li|h[1-6]|div|section|blockquote)>|<br\s*\/?>/i', ' ', (string) $html);
        $text = html_entity_decode(strip_tags($spaced), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return trim((string) preg_replace('/\s+/u', ' ', $text));
    }
};
