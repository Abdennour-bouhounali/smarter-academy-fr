import MathText from '../../../../../common/components/MathText';
import ArcTape from '../../../../../common/components/ArcTape';
import { KNOWLEDGE, METHOD, TAPES } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « معنى الجمع والطرح » — SOURCE UNIQUE, construite à partir du contenu du manuel
 * (content/textbook.js). Une <KnowledgeBrick id="…"> dans un module et la carte rendent le même objet.
 *
 * La règle du module 1 n'est PAS une phrase du manuel : le manuel la fait vivre (نشاط 1 : « ينقصه » ⇒ 24,5 + 11,5 ;
 * « زادت » ⇒ 17,5 − 1,5) et la méthode p. 29 l'outille (« تمثيل معطيات عددية بقطع مستقيمات ») ; la plateforme la
 * nomme avec les mots du schéma (الكلّ / الأجزاء).
 */
const { sum, difference } = KNOWLEDGE;

/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'ikhtiyar-amaliya', type: 'regles', title: 'الكلّ أم الجزء؟',
        memo: {
          rule: `${R('\\square')}=a+b,\\quad a=${R('\\square')}+b`,
          hook: 'ابحث عن الكلّ، لا عن الكلمة',
          example: `\\square=130${R('-')}9=121`,
          trap: 'كلمة « تزيد » لا تعني دائمًا الجمع',
          exam: 'ارسم المخطط: المجهول كلّ فنجمع، جزء فنطرح',
          chip: `${R('\\square')}=a+b`,
          quiz: [
            { q: 'تزيد قامة سارة ($130$ cm) عن قامة نزيم بـ $9$ cm. قامة نزيم:', options: ['$130-9$', '$130+9$', '$9-130$'], correct: 0 },
            { q: 'يملك يونس $24{,}5$ DA وينقصه $11{,}5$ DA لشراء كرّاس. ثمن الكرّاس:', options: ['$24{,}5+11{,}5$', '$24{,}5-11{,}5$', '$11{,}5-24{,}5$'], correct: 0 },
          ],
        },
        predictPrompt: 'في المختبر: «تزيد قامة سارة عن قامة نزيم» ومع ذلك وجدت قامة نزيم بالطرح، و«ينقصه 11,5» ومع ذلك وجدنا ثمن الكرّاس بالجمع. فمتى نجمع ومتى نطرح؟ اكتب القاعدة بكلماتك دون أن تعتمد على كلمة «يزيد» أو «ينقص».',
        summary: 'إذا كان المجهول هو الكلّ نجمع الأجزاء، وإذا كان المجهول جزءًا نطرح الجزء الآخر من الكلّ. الكلمة وحدها (يزيد، ينقص، أكثر، أقل) لا تقرّر العملية.',
        body: (
          <div className="space-y-2">
            <p>نبحث في الوضعية عن <strong>الكلّ</strong> (الأكبر) و<strong>الجزأين</strong> اللذين يكوّنانه:</p>
            <ul className="list-disc space-y-1 ps-5">
              <li><MathText>{'المجهول هو الكلّ ⟵ نجمع: $\\square = 24{,}5 + 11{,}5$ (ثمن الكرّاس، رغم كلمة «ينقصه»).'}</MathText></li>
              <li><MathText>{'المجهول جزء ⟵ نطرح من الكلّ الجزء الآخر: $\\square = 17{,}5 - 1{,}5$ (علامة يونس، رغم كلمة «زادت»).'}</MathText></li>
            </ul>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'majmu-hadda', type: 'vocabulaire', title: 'المجموع وحدّاه', predict: false,
        memo: {
          rule: `a+b=${R('s')}`,
          hook: 'ناتج الجمع: المجموع',
          example: `24{,}3+5{,}9=${R('30{,}2')}`,
          trap: 'العددان 24,3 و 5,9 حدّا المجموع، لا المجموع',
          exam: 'اكتب: 30,2 هو مجموع العددين 24,3 و 5,9',
          chip: `a+b=${R('s')}`,
          quiz: [
            { q: 'في $12+7=19$ ، المجموع هو:', options: ['$19$', '$12$', '$7$'], correct: 0 },
            { q: 'حدّا المجموع $8+5=13$ هما:', options: ['$8$ و $5$', '$13$ و $8$', '$13$ و $5$'], correct: 0 },
          ],
        },
        summary: 'ناتج جمع عددين يسمّى مجموعهما، والعددان اللذان نجمعهما يسمّيان حدّي المجموع.',
        body: (
          <div className="space-y-2">
            {sum.definitions.map((t) => <p key={t}>{t}</p>)}
            <p className="text-sm text-slate-600"><MathText>{`${sum.example.equality} : ${sum.example.text}`}</MathText></p>
            <ArcTape {...TAPES.sum} maxWidth={320} />
          </div>
        ),
      },
      {
        id: 'farq-hadda', type: 'vocabulaire', title: 'الفرق وحدّاه', predict: false,
        memo: {
          rule: `a-b=${R('d')}`,
          hook: 'ناتج الطرح: الفرق',
          example: `49{,}5-18{,}46=${R('31{,}04')}`,
          trap: 'نطرح الأصغر من الأكبر، لا العكس',
          exam: 'اكتب: 31,04 هو فرق العددين 49,5 و 18,46',
          chip: `a-b=${R('d')}`,
          quiz: [
            { q: 'فرق العددين $20$ و $7$ هو:', options: ['$13$', '$27$', '$7$'], correct: 0 },
            { q: 'في $15-6=9$ ، الفرق هو:', options: ['$9$', '$15$', '$21$'], correct: 0 },
          ],
        },
        summary: 'نتيجة طرح عددين تسمّى فرقهما، والعددان اللذان نطرح أحدهما من الآخر يسمّيان حدّي الفرق.',
        body: (
          <div className="space-y-2">
            {difference.definitions.map((t) => <p key={t}>{t}</p>)}
            <p className="text-sm text-slate-600"><MathText>{`${difference.example.equality} : ${difference.example.text}`}</MathText></p>
            <ArcTape {...TAPES.difference} maxWidth={320} />
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tamthil-aqwas', type: 'methodes', title: 'نمثّل قبل أن نحسب',
        memo: {
          rule: `\\underbrace{a\\quad ${R('\\square')}}_{c}`,
          hook: 'الكلّ تحت الخطّ، الأجزاء فوقه',
          example: `${R('\\square')}=124+3=127`,
          trap: 'لا تحسب قبل أن تحدّد الكلّ في المخطط',
          exam: 'ارسم القطع، ضع الرمز، ثم اكتب العملية',
          chip: `\\underbrace{a\\quad b}_{c}`,
          quiz: [
            { q: 'في المخطط، الرمز تحت الخطّ (هو الكلّ). العملية:', options: ['جمع الجزأين', 'طرح جزء من الكلّ', 'طرح الكلّ من جزء'], correct: 0 },
            { q: 'تقلّ قامة محمد عن قامة أكرم ($124$ cm) بـ $5$ cm. قامة محمد:', options: ['$124-5$', '$124+5$', '$5-124$'], correct: 0 },
          ],
        },
        predictPrompt: 'هدى أخطأت لأنّ «المعطيات كثيرة ومتداخلة»، وإيناس أصابت. لو أعطيناك مشكلة جديدة فيها «يزيد» أو «أقل»، بأيّ خطوات تبدأ قبل أن تحسب؟ اكتب الطريقة.',
        summary: 'لتفادي الالتباس في «يزيد، ينقص، أكثر، أقل»: نمثّل المعطيات بقطع مستقيمات، الكلّ تحت الخط والأجزاء فوقه، ونضع رمزًا مكان المجهول، ثم نقرأ العملية.',
        body: (
          <div className="space-y-2">
            <p>{METHOD.box}</p>
            <ol className="list-decimal space-y-1 ps-5 text-sm">
              <li>نرسم خطًّا ونحدّد عليه <strong>الكلّ</strong> (قوس تحت الخط) و<strong>الجزأين</strong> (قوسان فوقه).</li>
              <li>نضع رمزًا (□، △، ؟) مكان المجهول، والأعداد المعلومة مكانها.</li>
              <li>نقرأ العملية: الرمز تحت الخط ⟵ جمع؛ الرمز فوق الخط ⟵ طرح.</li>
              <li>نتحقّق أنّ النتيجة معقولة: الكلّ هو الأكبر.</li>
            </ol>
            <ArcTape {...TAPES.method1} maxWidth={320} />
          </div>
        ),
      },
    ],
  },
};
