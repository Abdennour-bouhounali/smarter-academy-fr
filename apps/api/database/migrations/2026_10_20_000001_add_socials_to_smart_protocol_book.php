<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Ajoute à la fiche `smart-protocol` ses chaînes YouTube et Facebook
 * (`content.socials`, owner 2026-10-20). Une migration, et non le seeder :
 * BookSeeder n'écrase jamais une fiche existante, celle de production comprise.
 * Ne touche que la clé `socials`, et seulement si elle est absente (une valeur
 * saisie dans « الكتب » est conservée).
 */
return new class extends Migration
{
    public function up(): void
    {
        $book = DB::table('books')->where('slug', 'smart-protocol')->first();
        if (! $book) {
            return;
        }
        $content = json_decode($book->content ?? '[]', true) ?: [];
        if (array_key_exists('socials', $content)) {
            return;
        }
        $content['socials'] = [
            ['network' => 'youtube', 'url' => 'https://www.youtube.com/@SmartMathProtocol'],
            ['network' => 'facebook', 'url' => 'https://www.facebook.com/SmartMathProtocol'],
        ];
        DB::table('books')->where('id', $book->id)->update([
            'content' => json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
    }

    public function down(): void
    {
        // Données : rien à défaire (la clé reste éditable dans « الكتب »).
    }
};
