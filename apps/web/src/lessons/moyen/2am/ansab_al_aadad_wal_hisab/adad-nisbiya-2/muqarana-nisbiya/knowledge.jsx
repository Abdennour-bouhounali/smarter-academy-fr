import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « مقارنة وترتيب أعداد نسبية » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js :
 * les trois propriétés de معارف p. 42, طريقة p. 43, réécrites). La lecture d'une abscisse et la distance à zéro sont des prérequis
 * (`priorKnowledge`), mesurés par « أستعدّ », jamais des items ici.
 */
const { negatives, positives, different, order, between } = KNOWLEDGE;

/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'salibayn', type: 'regles', title: 'عددان سالبان',
        memo: {
          rule: `a>b>0\\Rightarrow ${R('-a<-b')}`,
          hook: 'الأبعد عن الصفر هو الأصغر',
          example: `|{-5}|>|{-3}|\\Rightarrow ${R('-5<-3')}`,
          trap: 'لا تقارن الأرقام وحدها: تحت الصفر ينقلب الترتيب',
          exam: 'قارن المسافتين إلى الصفر، ثم اقلب الترتيب',
          chip: `${R('-5<-3')}`,
          quiz: [
            { q: 'أيّ العددين أصغر: $-7$ أم $-2$ ؟', options: ['$-7$', '$-2$', 'متساويان'], correct: 0 },
            { q: 'الرمز المناسب: $-4{,}5 \\,\\square\\, -4{,}3$', options: ['$<$', '$>$', '$=$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المسبار ، لمّا أطلتَ السلك تحت الصفر صار العدد أخفض. إذن من بين عددين سالبين، أيّهما الأصغر؟ اكتب القاعدة بكلماتك.',
        summary: 'من بين عددين نسبيين سالبين، الأصغر هو الأبعد عن الصفر : −5 < −3 .',
        body: <p><MathText>{negatives.text}</MathText></p>,
      },
      {
        id: 'mujabayn', type: 'regles', title: 'عددان موجبان',
        memo: {
          rule: `0\\le a<b`,
          hook: 'الأقرب إلى الصفر هو الأصغر',
          example: `${R('2{,}5<4')}`,
          trap: 'فوق الصفر لا نقلب الترتيب',
          exam: 'بين موجبين: الأقرب إلى الصفر هو الأصغر',
          chip: `${R('2{,}5<4')}`,
          quiz: [
            { q: 'أيّ العددين أكبر: $+3{,}2$ أم $+3{,}12$ ؟', options: ['$+3{,}2$', '$+3{,}12$', 'متساويان'], correct: 0 },
            { q: 'أصغر عدد بين $7$ و $0{,}7$ و $70$ :', options: ['$0{,}7$', '$7$', '$70$'], correct: 0 },
          ],
        },
        predictPrompt: 'فوق الصفر، كلما أطلتَ السلك ارتفع المسبار. من بين عددين موجبين، أيّهما الأصغر؟',
        summary: 'من بين عددين نسبيين موجبين، الأصغر هو الأقرب إلى الصفر : 2,5 < 4 .',
        body: <p><MathText>{positives.text}</MathText></p>,
      },
      {
        id: 'mukhtalifayn', type: 'regles', title: 'إشارتان مختلفتان',
        memo: {
          rule: `${R('-a')}<0<b`,
          hook: 'السالب أصغر من كل موجب',
          example: `${R('-9')}<0<0{,}5`,
          trap: 'لا تقارن المسافتين حين تختلف الإشارتان',
          exam: 'اختلفت الإشارتان؟ السالب هو الأصغر',
          chip: `${R('-a')}<0<b`,
          quiz: [
            { q: 'أيّهما أصغر: $-0{,}1$ أم $+8$ ؟', options: ['$-0{,}1$', '$+8$', 'متساويان'], correct: 0 },
            { q: 'الرمز المناسب: $0 \\,\\square\\, -3$', options: ['$>$', '$<$', '$=$'], correct: 0 },
          ],
        },
        predictPrompt: 'وقف المسبار تحت الصفر ولم يستطع أن يعلو مسبارًا فوق الصفر مهما طال سلكه. ماذا تستنتج عن عدد سالب وعدد موجب؟ وماذا عن الصفر؟',
        summary: 'العدد السالب أصغر من الصفر ومن كل عدد موجب ؛ والصفر أصغر من كل عدد موجب.',
        body: (
          <div className="space-y-2">
            <p><MathText>{different.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{GUIDE.zero}</MathText></p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'tartib', type: 'vocabulaire', title: 'الترتيب التصاعدي والتنازلي',
        memo: {
          rule: `a<b<c\\quad ${R('c>b>a')}`,
          hook: 'تصاعدي من الأصغر، تنازلي من الأكبر',
          example: `-5<-2<0<3`,
          trap: 'في الترتيب التنازلي نبدأ بالأكبر، لا بالأبعد عن الصفر',
          exam: 'اكتب الرمز نفسه بين كل عددين متتاليين',
          chip: `a<b<c`,
          quiz: [
            { q: 'الترتيب التصاعدي للأعداد $3$ و $-1$ و $-4$ :', options: ['$-4<-1<3$', '$-1<-4<3$', '$3<-1<-4$'], correct: 0 },
            { q: 'الترتيب التنازلي للأعداد $2$ و $-6$ و $0$ :', options: ['$2>0>-6$', '$-6>0>2$', '$0>2>-6$'], correct: 0 },
          ],
        },
        predictPrompt: 'رتّبتَ أعدادًا من الأخفض إلى الأعلى. كيف نسمّي هذا الترتيب؟ وأيّ رمز نكتبه بين عددين متتاليين؟',
        summary: 'ترتيب تصاعدي : من الأصغر إلى الأكبر بالرمز < ؛ ترتيب تنازلي : من الأكبر إلى الأصغر بالرمز > .',
        body: (
          <div className="space-y-2">
            <p><MathText>{order.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{order.example}</MathText></p>
          </div>
        ),
      },
      {
        id: 'hasr', type: 'regles', title: 'عدد بين عددين',
        memo: {
          rule: `a<${R('c')}<b`,
          hook: 'بين عددين يوجد دائمًا عدد',
          example: `-4{,}5<${R('-4{,}4')}<-4{,}3`,
          trap: 'لا عدد صحيح بينهما؟ أضف رقمًا بعد الفاصلة',
          exam: 'اكتب العددين بنفس عدد الأرقام بعد الفاصلة ثم اختر بينهما',
          chip: `a<${R('c')}<b`,
          quiz: [
            { q: 'عدد بين $-2{,}6$ و $-2{,}5$ :', options: ['$-2{,}55$', '$-2{,}65$', '$-2{,}05$'], correct: 0 },
            { q: 'عدد بين $-1$ و $0$ :', options: ['$-0{,}5$', '$-1{,}5$', '$0{,}5$'], correct: 0 },
          ],
        },
        predictPrompt: 'وضعتَ المسبار بين −7 و −5 . كيف تجد عددًا بين −4,5 و −4,3 ؟ وهل يمكن أن لا يوجد أيّ عدد بين عددين مختلفين؟',
        summary: 'بين أيّ عددين نسبيين مختلفين يوجد دائمًا عدد نسبي ثالث : −4,5 < −4,4 < −4,3 .',
        body: <p><MathText>{between.text}</MathText></p>,
      },
    ],
    3: [
      {
        id: 'tariqa', type: 'methodes', title: 'أقارن وأرتّب',
        memo: {
          rule: `${R('-')}<0<${R('+')}`,
          hook: 'الإشارة أوّلًا ثم المسافة',
          example: `-6<-1<0<2<5`,
          trap: 'لا ترتّب حسب الأرقام قبل النظر إلى الإشارات',
          exam: 'افصل السالبة عن الموجبة، ثم رتّب كل مجموعة',
          chip: `${R('-')}<0<${R('+')}`,
          quiz: [
            { q: 'أصغر عدد بين $-3$ و $-8$ و $1$ :', options: ['$-8$', '$-3$', '$1$'], correct: 0 },
            { q: 'أكبر عدد بين $-0{,}2$ و $-5$ و $-1$ :', options: ['$-0{,}2$', '$-5$', '$-1$'], correct: 0 },
          ],
        },
        predictPrompt: 'رتّبتَ ست أعداد بعضها سالب وبعضها موجب. من أين بدأتَ؟ اكتب الخطوات التي اتّبعتَها.',
        summary: 'أنظر إلى الإشارتين أوّلًا ؛ بين سالبين الأبعد عن الصفر أصغر ؛ بين موجبين الأقرب إلى الصفر أصغر.',
        body: <ul className="list-disc ps-5 space-y-1 text-sm">{METHOD.order.rule.slice(1).map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ul>,
      },
    ],
  },
};
