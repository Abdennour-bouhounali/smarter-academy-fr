<?php

namespace Database\Seeders\Demo;

use App\Models\NotebookNote;
use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * Le CAHIER de l'élève (كرّاسي) — son écriture privée.
 *
 * Les notes sont en arabe, comme l'espace élève : le cahier est rédigé PAR
 * l'élève, et cet élève écrit dans la langue de son cours. Chaque note
 * d'erreur est accrochée à une vraie erreur-type du contenu
 * (content/practice/misconceptions.json) et au couple exercice/question qui
 * l'a provoquée : la note s'ouvre donc sur la question qui l'a fait naître,
 * au lieu de pendre dans le vide.
 *
 * Aucun élève n'écrit la même chose : le texte est choisi par l'erreur
 * rencontrée, et le nombre de notes vient de l'appétit déclaré du portrait.
 */
final class DemoNotes
{
    /**
     * Ce que l'élève écrit quand il retombe sur telle erreur — une phrase
     * d'élève, à la première personne, pas une définition de manuel.
     *
     * @var array<string, array{title: string, body: string, type: string}>
     */
    private const BY_MISCONCEPTION = [
        'MISC-QISMA-BAQI-KABIR' => [
            'title' => 'الباقي دائمًا أصغر من المقسوم عليه',
            'body' => 'وقعت في الخطأ مرّة أخرى: كتبت 137 = 5 × 25 + 12 وقبلتها. لكن 12 أكبر من 5، إذن القسمة لم تكتمل. القاعدة: الباقي يجب أن يكون أصغر تمامًا من المقسوم عليه.',
            'type' => 'erreur',
        ],
        'MISC-QISMA-HASIL-BAQI' => [
            'title' => 'لا أخلط بين حاصل القسمة والباقي',
            'body' => 'في a = b × q + r، العدد q هو حاصل القسمة و r هو الباقي. في 72 = 24 × 3 الباقي معدوم، و3 ليس الباقي بل حاصل القسمة. أكتب دائمًا المساواة كاملة قبل أن أجيب.',
            'type' => 'erreur',
        ],
        'MISC-QISMA-6-ZAWJI-FAQAT' => [
            'title' => 'زوجي لا يعني يقبل القسمة على 6',
            'body' => 'العدد 14 زوجي لكنه لا يقبل القسمة على 6. ليقبل عدد القسمة على 6 يجب أن يقبلها على 2 وعلى 3 معًا.',
            'type' => 'erreur',
        ],
        'MISC-QASIM-MUDAAF-ITTIJAH' => [
            'title' => 'اتجاه «يقسم» و«مضاعف»',
            'body' => 'إذا كان 3 يقسم 12 فإنّ 12 مضاعف للعدد 3، وليس العكس. القاسم هو الأصغر، والمضاعف هو الأكبر. أعيد قراءة الجملة ببطء قبل الإجابة.',
            'type' => 'rappel',
        ],
        'MISC-QAWASIM-NASY-1-WA-N' => [
            'title' => 'لا أنسى 1 والعدد نفسه',
            'body' => 'كلّما عيّنت قواسم عدد نسيت 1 ونسيت العدد نفسه. هما دائمًا قاسمان. أبدأ قائمتي بهما ثم أكمل.',
            'type' => 'erreur',
        ],
        'MISC-QAWASIM-A-BADAL-A-ZAID-7' => [
            'title' => 'أجيب عمّا سُئلت عنه',
            'body' => 'طُلبت منّي قيم a فأعطيت قواسم 24. أقرأ السؤال مرّتين وأسطّر تحت ما هو مطلوب فعلًا.',
            'type' => 'erreur',
        ],
        'MISC-PGCD-HASIL-BADAL-QASIM' => [
            'title' => 'القاسم المشترك الأكبر ليس حاصل القسمة',
            'body' => 'في وضعية الباقات: عدد الباقات هو PGCD، وما يوضع في كل باقة هو حاصل قسمة كل عدد على PGCD. أكتب الاثنين بوضوح حتى لا أخلط.',
            'type' => 'erreur',
        ],
        'MISC-PGCD-LAYSA-AKBAR' => [
            'title' => 'الأكبر، لا أيّ قاسم مشترك',
            'body' => 'عيّنت قاسمًا مشتركًا وتوقّفت. لكن المطلوب هو الأكبر. أكتب كل القواسم المشتركة ثم أختار أكبرها.',
            'type' => 'erreur',
        ],
        'MISC-PGCD-SIFR' => [
            'title' => 'PGCD(a ; 0) = a',
            'body' => 'ظننت أنّ PGCD مع الصفر يساوي صفرًا. كل عدد يقسم 0، إذن القاسم المشترك الأكبر هو a نفسه.',
            'type' => 'rappel',
        ],
        'MISC-PGCD-MUDAAF-15' => [
            'title' => 'قاسم، لا مضاعف',
            'body' => 'عندما يُطلب PGCD(a ; 15) = 5 يجب أن يكون 5 قاسمًا مشتركًا: أبحث عن عدد يقبل القسمة على 5 لا عن مضاعف للعدد 15.',
            'type' => 'erreur',
        ],
        'MISC-AWWALIYAN-ADAD-AWWALI' => [
            'title' => 'أوّليان فيما بينهما ≠ عددان أوّليان',
            'body' => 'العددان 8 و9 ليسا أوّليين، لكنّهما أوّليان فيما بينهما لأنّ PGCD(8 ; 9) = 1. الشرط الوحيد هو أن يكون قاسمهما المشترك الأكبر يساوي 1.',
            'type' => 'erreur',
        ],
        'MISC-IKHTIZAL-NAQIS' => [
            'title' => 'أتحقّق أنّ الاختزال اكتمل',
            'body' => 'اختزلت الكسر مرّة وتوقّفت، لكنّه بقي قابلًا للاختزال. الطريقة المضمونة: أقسم البسط والمقام على PGCD مباشرة، ثم أتأكّد أنّهما أوّليان فيما بينهما.',
            'type' => 'erreur',
        ],
    ];

    /** Des notes qui ne viennent pas d'une erreur : méthode, rappel, résumé. */
    private const FREE_NOTES = [
        ['title' => 'طريقة إقليدس — الخطوات', 'body' => 'أقسم الأكبر على الأصغر، آخذ الباقي، أعيد القسمة على الباقي، وهكذا. آخر باقٍ غير معدوم هو PGCD. أسرع بكثير من طريقة الفروق عندما يكون العددان متباعدين.', 'type' => 'astuce'],
        ['title' => 'قواعد قابلية القسمة', 'body' => 'على 2: الرقم الأخير زوجي. على 3: مجموع الأرقام يقبل القسمة على 3. على 5: ينتهي بـ0 أو 5. على 9: مجموع الأرقام يقبل القسمة على 9.', 'type' => 'resume'],
        ['title' => 'متى أتوقّف عن البحث عن القواسم؟', 'body' => 'أختبر الأعداد التي مربّعها أصغر من العدد أو يساويه. كل قاسم وجدته يعطيني قاسمًا ثانيًا معه.', 'type' => 'astuce'],
        ['title' => 'سؤال لأستاذي', 'body' => 'هل يمكن أن يكون PGCD لعددين أكبر من أصغرهما؟ أظنّ لا، لكنّي أريد أن أتأكّد.', 'type' => 'question'],
        ['title' => 'مثال أعود إليه', 'body' => 'PGCD(42 ; 60): قواسم 42 هي 1، 2، 3، 6، 7، 14، 21، 42 — وقواسم 60 فيها 1، 2، 3، 6. المشتركة: 1، 2، 3، 6. الأكبر: 6.', 'type' => 'exemple'],
    ];

    /**
     * @param  array<int, array<string, mixed>>  $mistakes  les erreurs rencontrées pendant la simulation
     */
    public function write(User $student, DemoPersona $persona, array $mistakes): void
    {
        $budget = $persona->noteAppetite;
        if ($budget <= 0) {
            return;
        }

        // Une note par erreur-type RENCONTRÉE, la plus récente d'abord :
        // l'élève écrit sur ce qui lui résiste, pas sur tout.
        $seen = [];
        $written = 0;
        foreach (array_reverse($mistakes) as $mistake) {
            if ($written >= $budget) {
                break;
            }
            $key = $mistake['misconception'];
            if (isset($seen[$key]) || ! isset(self::BY_MISCONCEPTION[$key])) {
                continue;
            }
            $seen[$key] = true;

            $template = self::BY_MISCONCEPTION[$key];
            $at = Carbon::parse($mistake['at'])->addMinutes(3);
            $this->create($student, [
                'title' => $template['title'],
                'lesson_id' => $mistake['lesson']->id,
                'learning_point_id' => null,
                'exercise_id' => $mistake['exerciseId'],
                'question_id' => $mistake['questionId'],
                'mistake_type' => $key,
                'note_type' => $template['type'],
                'content' => '<p>'.$template['body'].'</p>',
            ], $at, $written === 0);
            $written++;
        }

        // Puis, s'il lui reste de l'appétit, des notes libres.
        $lesson = $mistakes !== [] ? end($mistakes)['lesson'] : null;
        foreach (self::FREE_NOTES as $i => $note) {
            if ($written >= $budget) {
                break;
            }
            $at = Carbon::now()->subDays($persona->lastSeenDaysAgo + $i * 4)->setTime(19, 20);
            $this->create($student, [
                'title' => $note['title'],
                'lesson_id' => $lesson?->id,
                'learning_point_id' => null,
                'exercise_id' => null,
                'question_id' => null,
                'mistake_type' => null,
                'note_type' => $note['type'],
                'content' => '<p>'.$note['body'].'</p>',
            ], $at, false);
            $written++;
        }
    }

    private function create(User $student, array $attributes, Carbon $at, bool $pinned): void
    {
        NotebookNote::create([
            'user_id' => $student->id,
            ...$attributes,
            'content_text' => NotebookNote::plainText($attributes['content']),
            'is_pinned' => $pinned,
            'created_at' => $at,
            'updated_at' => $at,
        ]);
    }
}
