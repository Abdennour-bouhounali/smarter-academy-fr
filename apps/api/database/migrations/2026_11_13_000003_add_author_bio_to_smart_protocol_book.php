<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Section « من كتب هذا الكتاب؟ » de la fiche `smart-protocol` (2026-11-13) : la photo
 * et les références de l'auteur, fournies par lui-même. Une clé déjà présente
 * (saisie dans « الكتب ») n'est jamais écrasée.
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
        $content += [
            'authorBio' => [
                'name' => 'أ. عبد النور',
                'photo' => '/images/books/smart-protocol/author.webp',
                'lines' => [
                    'أستاذ دعم مدرسي في الرياضيات، خبرة أكثر من 5 سنوات (معهد عمي سعيد ومؤسسة الرضوان الخاصة).',
                    'مهندس دولة في الإلكترونيك، متخرج من المدرسة الوطنية متعددة التقنيات بالجزائر العاصمة.',
                    'ماستر 2 ذكاء اصطناعي ومعالجة البيانات، جامعة Paul Sabatier Toulouse 3 بفرنسا.',
                ],
            ],
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
