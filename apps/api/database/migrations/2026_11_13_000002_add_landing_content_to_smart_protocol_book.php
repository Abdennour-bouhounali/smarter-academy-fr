<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Page d'atterrissage des publicités Facebook (2026-11-13) : la fiche
 * `smart-protocol` reçoit
 * - `hook` / `hookSub` : le premier écran parle du PROBLÈME du visiteur avant le
 *   nom du produit — repris de ce que la fiche dit déjà (FAQ : « يفهمون الدروس
 *   ويحفظون القوانين لكنهم يعجزون عن الانطلاق في الحل ») ;
 * - `forWho` : « هذا الكتاب لك إذا… / ليس لك إذا… », tiré des mêmes affirmations ;
 * - la galerie réordonnée : les PAGES INTÉRIEURES d'abord (la couverture est déjà
 *   dans le premier écran).
 * Comme la migration des réseaux : une clé déjà présente (saisie dans « الكتب »)
 * n'est jamais écrasée.
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
            'hook' => 'تفهم الدرس وتحفظ القوانين… لكنك لا تعرف من أين تبدأ حلّ التمرين؟',
            'hookSub' => 'بروتوكول SMART يدرّبك على طريقة تفكير من 5 مراحل تطبّقها على أي تمرين في البكالوريا.',
            'forWho' => [
                'yes' => [
                    'تفهم الدروس وتحفظ القوانين، لكنك تتوقف أمام التمرين ولا تعرف من أين تبدأ.',
                    'تحضّر للبكالوريا في شعبة علمية أو تقنية.',
                    'تريد طريقة تفكير ثابتة تطبّقها على كل تمرين، بدل حفظ حلول جاهزة.',
                    'أستاذ يبحث عن إطار منهجي يطبّقه مع تلاميذه في القسم.',
                ],
                'no' => [
                    'تبحث عن ملخّص للدروس أو عن حلول جاهزة للحفظ.',
                    'تريد كتاب تمارين مكرّرة دون منهجية.',
                ],
            ],
        ];

        // « كيف أدفع؟ » : « تدفع عند الاستلام أو وفق ما نتفق عليه » laissait croire à un
        // paiement à négocier. Remplacé SEULEMENT s'il est resté le texte d'origine.
        $oldPay = 'لا يوجد دفع إلكتروني: تُرسل طلبك ثم نتصل بك لتأكيد الطلب وتحديد التوصيل، وتدفع عند الاستلام أو وفق ما نتفق عليه.';
        foreach ($content['faq'] ?? [] as $i => $item) {
            if (($item['answer'] ?? null) === $oldPay) {
                $content['faq'][$i]['answer'] = 'لا يوجد أي دفع إلكتروني: ترسل طلبك، نتصل بك لتأكيد الطلب وإخبارك بتكلفة التوصيل، ثم تدفع نقدًا عند استلام الكتاب.';
            }
        }

        $gallery = json_decode($book->gallery ?? '[]', true) ?: [];
        $covers = array_values(array_filter($gallery, fn ($src) => str_contains($src, 'cover') || str_contains($src, 'book-3d')));
        $inside = array_values(array_diff($gallery, $covers));

        DB::table('books')->where('id', $book->id)->update([
            'content' => json_encode($content, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'gallery' => json_encode(array_merge($inside, $covers), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);
    }

    public function down(): void
    {
        // Données : rien à défaire (les clés restent éditables dans « الكتب »).
    }
};
