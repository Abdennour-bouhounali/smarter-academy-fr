<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Seeder;

/** Le premier livre de la librairie (idempotent : ne réécrit jamais une fiche existante). */
class BookSeeder extends Seeder
{
    public function run(): void
    {
        Book::firstOrCreate(['slug' => 'smart-protocol'], [
            'title' => 'بروتوكول SMART لحل المسائل الرياضية',
            'subtitle' => 'منهجية التفكير الرياضي — مرجعك لبكالوريا الرياضيات',
            'author' => 'أ. عبد النور',
            'summary' => 'الكتاب لا يعطيك حلولًا جاهزة لتحفظها، بل يدرّبك على طريقة تفكير من خمس مراحل: حلّل، ترجم، حدّد الهدف، اربط المعطيات، ثم تحقّق.',
            'price' => 1400,
            'cover_image' => '/images/books/smart-protocol/front-cover.webp',
            // Pages intérieures d'abord : la couverture est déjà dans le premier écran.
            'gallery' => [
                '/images/books/smart-protocol/prtocole.webp',
                '/images/books/smart-protocol/tranlation_section.webp',
                '/images/books/smart-protocol/solving-techniques.webp',
                '/images/books/smart-protocol/bac_2016_exercice.webp',
                '/images/books/smart-protocol/front-cover.webp',
                '/images/books/smart-protocol/book-3d.webp',
                '/images/books/smart-protocol/back-cover.webp',
            ],
            'content' => [
                // Image principale de la page (maquette 3D : scripts/book-mockup.py).
                'heroImage' => '/images/books/smart-protocol/book-3d.webp',
                'badge' => 'للبكالوريا — جميع الشعب العلمية والتقنية',
                // Premier écran : le problème du visiteur avant le nom du produit (BOOKS_STORE.md §4).
                'hook' => 'تفهم الدرس وتحفظ القوانين… لكنك لا تعرف من أين تبدأ حلّ التمرين؟',
                'hookSub' => 'بروتوكول SMART يدرّبك على طريقة تفكير من 5 مراحل تطبّقها على أي تمرين في البكالوريا.',
                'authorBio' => [
                    'name' => 'أ. عبد النور',
                    'photo' => '/images/books/smart-protocol/author.webp',
                    'lines' => [
                        'أستاذ دعم مدرسي في الرياضيات، خبرة أكثر من 5 سنوات (معهد عمي سعيد ومؤسسة الرضوان الخاصة).',
                        'مهندس دولة في الإلكترونيك، متخرج من المدرسة الوطنية متعددة التقنيات بالجزائر العاصمة.',
                        'ماستر 2 ذكاء اصطناعي ومعالجة البيانات، جامعة Paul Sabatier Toulouse 3 بفرنسا.',
                    ],
                ],
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
                'stats' => [
                    ['number' => '+30', 'title' => 'تمرين تدريبي', 'description' => 'من الترجمة إلى التفكير الاستراتيجي'],
                    ['number' => '293', 'title' => 'سؤال تحليل ذكي', 'description' => 'لتعلم كيف تقرأ التمرين قبل الحل'],
                    ['number' => '19', 'title' => 'تدريب على المنهجية', 'description' => 'لبناء طريقة تفكير ثابتة'],
                    ['number' => '5', 'title' => 'مراحل SMART', 'description' => 'من التحليل إلى التحقق'],
                ],
                'steps' => [
                    ['letter' => 'S', 'title' => 'Scan — حلّل التمرين', 'description' => 'اقرأ التمرين كاملًا قبل أن تحلّ أي سؤال: السؤال المتأخر غالبًا تلميح لما سبقه.'],
                    ['letter' => 'M', 'title' => 'Math Translate — ترجم', 'description' => 'حوّل كل عبارة في النص إلى علاقة رياضية دقيقة.'],
                    ['letter' => 'A', 'title' => 'Aim — حدّد الهدف', 'description' => 'اعرف ما الذي تبحث عنه رياضيًا قبل أن تبدأ الحساب.'],
                    ['letter' => 'R', 'title' => 'Relate — اربط', 'description' => 'اجرد المعطيات، صفّها، ثم اربطها بالهدف خطوة بخطوة.'],
                    ['letter' => 'T', 'title' => 'Test — تحقّق', 'description' => 'اختبر منطقية النتيجة قبل أن تسلّم ورقتك.'],
                ],
                'highlights' => [
                    ['title' => 'تملك الأدوات', 'description' => 'أنت تحفظ القوانين وتفهم الدرس، لكنك تفتقد «كتيب التعليمات» الذي يخبرك كيف ومتى تستخدمها.'],
                    ['title' => 'البكالوريا ليست عشوائية', 'description' => 'المواضيع تُبنى بمنطق دقيق: السؤال الأول مفتاح الثاني، والمتأخر يحمل تلميحًا لما سبقه.'],
                    ['title' => 'القراءة التحليلية تغيّر كل شيء', 'description' => 'حين تترجم المطلوب إلى أهداف واضحة، يتحول الحل من فوضى إلى خطوات منظمة.'],
                ],
                // Chaînes du livre (section « تابعنا » de la page) ; `network` : youtube | facebook.
                'socials' => [
                    ['network' => 'youtube', 'url' => 'https://www.youtube.com/@SmartMathProtocol'],
                    ['network' => 'facebook', 'url' => 'https://www.facebook.com/SmartMathProtocol'],
                ],
                'faq' => [
                    ['question' => 'هل هذا مجرد كتاب تمارين آخر؟', 'answer' => 'لا. إنه بروتوكول للتفكير. لا حشو ولا تمارين مكررة، بل بناء المنهجية التي تمكّنك من حل أي تمرين.'],
                    ['question' => 'هل أحتاج لأن أكون ممتازًا في الرياضيات؟', 'answer' => 'الكتاب مصمم للطلاب الذين يفهمون الدروس ويحفظون القوانين لكنهم يعجزون عن الانطلاق في الحل.'],
                    ['question' => 'لأي مستوى تعليمي هو موجّه؟', 'answer' => 'لطلاب البكالوريا — جميع الشعب التي تدرس الرياضيات.'],
                    ['question' => 'هل يمكن للأساتذة استخدامه؟', 'answer' => 'نعم. بروتوكول SMART إطار منهجي قابل للتدريس والتطبيق داخل القسم.'],
                    ['question' => 'كيف أدفع؟', 'answer' => 'لا يوجد أي دفع إلكتروني: ترسل طلبك، نتصل بك لتأكيد الطلب وإخبارك بتكلفة التوصيل، ثم تدفع نقدًا عند استلام الكتاب.'],
                ],
            ],
            'status' => Book::STATUS_PUBLISHED,
        ]);
    }
}
