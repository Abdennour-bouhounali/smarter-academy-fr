import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD, GUIDE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « حساب مجموع جبري » (2AM) — SOURCE UNIQUE, construite à partir du contenu (content/textbook.js : معارف p. 44 réécrit, طريقة p. 45 réécrite).
 * Les règles sont NOMMÉES après le labo, jamais avant : chaque brique suit une question sur ce que l'élève vient de faire avec les enfants et la corde.
 */
const { definition, move, simplified, brackets } = KNOWLEDGE;

/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tajmi-hudud', type: 'regles', title: 'تجميع الحدود الموجبة والسالبة',
        memo: {
          rule: `S=${R('P')}+${R('N')}`,
          hook: 'الموجبة في فريق والسالبة في فريق',
          example: `(+12)+(-9)=${R('(+3)')}`,
          trap: 'لا نجمع كلّ المسافات معًا',
          exam: 'اجمع الحدود الموجبة معًا والسالبة معًا ثم اجمع الناتجين',
          chip: `P+N`,
          quiz: [
            { q: '$(+7)+(-3)+(+5)+(-6)$ يساوي', options: ['$+3$', '$-3$', '$+21$'], correct: 0 },
            { q: 'الحدود الموجبة في $(+2)+(-9)+(+4)$ مجموعها', options: ['$+6$', '$-3$', '$-9$'], correct: 0 },
          ],
        },
        predictPrompt: 'وزّعتَ الأطفال على فريقين وأطلقتَ الصفّارة. كيف حصلتَ على موضع الشريط من قوّتي الفريقين؟',
        summary: 'نجمع الحدود الموجبة معًا والحدود السالبة معًا ثم نجمع الناتجين : (+7) + (−3) + (+5) + (−6) = (+12) + (−9) = (+3) .',
        body: <div className="space-y-2"><p><MathText>{move.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{move.example}</MathText></p></div>,
      },
      {
        id: 'tarh-ila-jam', type: 'regles', title: 'كلّ طرح يصير جمعًا للمعاكس',
        memo: {
          rule: `x-(-a)=x+${R('(+a)')}`,
          hook: 'الذي تسبقه إشارة − يستدير',
          example: `(-6)-(-5)=(-6)+${R('(+5)')}`,
          trap: 'لا يستدير إلا المسبوق بإشارة −',
          exam: 'حوّل كلّ طرح إلى جمع المعاكس في سطر مستقلّ',
          chip: `x-y=x+(-y)`,
          quiz: [
            { q: '$(-8)-(+3)$ تُكتب جمعًا هكذا', options: ['$(-8)+(-3)$', '$(-8)+(+3)$', '$(+8)+(-3)$'], correct: 0 },
            { q: '$(-6)-(-5)$ تُكتب جمعًا هكذا', options: ['$(-6)+(+5)$', '$(-6)+(-5)$', '$(+6)+(-5)$'], correct: 0 },
          ],
        },
        predictPrompt: 'استدار بعض الأطفال قبل أن يُرسلوا. ما الذي جعلهم يستديرون وماذا تغيّر في صدرياتهم؟',
        summary: 'كلّ طرح يصير جمعًا لمعاكس العدد : (−8) − (+3) + (−6) − (−5) = (−8) + (−3) + (−6) + (+5) .',
        body: <div className="space-y-2"><p><MathText>{definition.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{GUIDE.noTurn.right}</MathText></p></div>,
      },
      {
        id: 'hadhf-mutaakisayn', type: 'regles', title: 'الحدّان المتعاكسان يتعادلان',
        memo: {
          rule: `(+a)+(-a)=${R('0')}`,
          hook: 'قوّتان متساويتان من جهتين',
          example: `(+7)+(-7)+(-3)=${R('-3')}`,
          trap: 'ليس ضعف العدد',
          exam: 'احذف الحدّين المتعاكسين ثم احسب الباقي',
          chip: `(+a)+(-a)=0`,
          quiz: [
            { q: '$(+5)+(-7)+(-5)+(+7)+(-3)$ يساوي', options: ['$-3$', '$+3$', '$-7$'], correct: 0 },
            { q: 'مجموع $(+9)+(-9)$ يساوي', options: ['$0$', '$18$', '$-18$'], correct: 0 },
          ],
        },
        predictPrompt: 'في الحبل أطفال بصدريتين من العدد نفسه وإشارتين مختلفتين. ماذا يحدث لقوّتيهما؟ وهل نحتاج إلى حسابهما؟',
        summary: 'الحدّان المتعاكسان مجموعهما معدوم فيمكن حذفهما : (+5) + (−5) = 0 .',
        body: <p><MathText>{move.text}</MathText></p>,
      },
      {
        id: 'qaidat-majmu-jabri', type: 'regles', title: 'قاعدة حساب المجموع الجبري',
        memo: {
          rule: `S=${R('P')}+${R('N')}`,
          hook: 'أجمّع الموجبة والسالبة ثم أقارن',
          example: `-15+4+8+3=${R('0')}`,
          trap: 'الترتيب لا يغيّر الناتج',
          exam: 'اجمع الموجبة معًا والسالبة معًا ثم طبّق قاعدة جمع عددين',
          chip: `P+N`,
          quiz: [
            { q: '$-15+4+8+3$ يساوي', options: ['$0$', '$-30$', '$30$'], correct: 0 },
            { q: 'لحساب مجموع جبري نبدأ بـ', options: ['تحويل الطرح إلى جمع المعاكس', 'ضرب الحدود', 'حذف الإشارات'], correct: 0 },
          ],
        },
        predictPrompt: 'كيف تحسب مجموعًا جبريًا كبيرًا دون الاستعانة بالحبل؟ اكتب الخطوات بكلماتك.',
        summary: 'نجمع الحدود الموجبة معًا والسالبة معًا ثم نطبّق قاعدة جمع عددين نسبيين : −15 + 4 + 8 + 3 = 15 + (−15) = 0 .',
        body: <div className="space-y-2"><p><MathText>{move.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{move.example}</MathText></p></div>,
      },
    ],
    2: [
      {
        id: 'taarif-majmu-jabri', type: 'vocabulaire', title: 'المجموع الجبري',
        memo: {
          rule: `A=a-b+c-d`,
          hook: 'سلسلة جمع وطرح لأعداد نسبية',
          example: `(-9)-(+2)=${R('(-9)+(-2)')}`,
          trap: 'نحافظ على أقواس كلّ عدد وإشارته',
          exam: 'اكتب كلّ عدد بين قوسين مع إشارته',
          chip: `A=a-b+c-d`,
          quiz: [
            { q: 'سلسلة جمع وطرح لأعداد نسبية تسمّى', options: ['مجموعًا جبريًا', 'جداءً', 'قسمة'], correct: 0 },
            { q: '$(+3)-(-2)$ تُكتب جمعًا هكذا', options: ['$(+3)+(+2)$', '$(+3)+(-2)$', '$(-3)+(+2)$'], correct: 0 },
          ],
        },
        predictPrompt: 'السلاسل التي رتّبتَ أطفالها كانت جمعًا وطرحًا لأعداد نسبية. ماذا نسمّي سلسلة كهذه؟',
        summary: 'المجموع الجبري سلسلة جمع وطرح لأعداد نسبية، وكلّ طرح فيه يصير جمعًا لمعاكس العدد.',
        body: <p><MathText>{definition.text}</MathText></p>,
      },
      {
        id: 'naql-tajmi', type: 'regles', title: 'نقل الحدود وتجميعها',
        memo: {
          rule: `a+b+c=${R('a+c')}+b`,
          hook: 'غيّر الترتيب بعد تحويل الطرح',
          example: `(+7)+(-9)+(-4)=${R('-6')}`,
          trap: 'لا نغيّر الترتيب قبل تحويل الطرح',
          exam: 'حوّل الطرح أوّلًا ثم انقل الحدود وجمّعها',
          chip: `a+b+c=a+c+b`,
          quiz: [
            { q: 'هل يتغيّر المجموع إذا غيّرنا ترتيب حدود مجموع جبري بعد تحويل الطرح؟', options: ['لا يتغيّر', 'يتغيّر دائمًا', 'يتغيّر إن بدأنا بالسالب'], correct: 0 },
            { q: '$(+7)-(+9)+(-4)+(-2)$ يساوي', options: ['$-8$', '$+8$', '$-22$'], correct: 0 },
          ],
        },
        predictPrompt: 'أرسلتَ الأطفال بترتيب آخر فلم يتغيّر موضع الشريط. ماذا يعني ذلك لحدود المجموع الجبري؟',
        summary: 'بعد تحويل كلّ طرح إلى جمع يمكن تغيير ترتيب الحدود وتجميعها، ويمكن حذف الحدّين المتعاكسين.',
        body: <div className="space-y-2"><p><MathText>{move.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{move.example}</MathText></p></div>,
      },
      {
        id: 'kitaba-mubassata', type: 'regles', title: 'الكتابة المبسّطة للمجموع الجبري',
        memo: {
          rule: `(+5)-(+6)=${R('5-6')}`,
          hook: 'أحذف إشارة الجمع وأقواس العدد',
          example: `-6+10-4=0`,
          trap: 'إشارة الطرح لا تُحذف',
          exam: 'اقرأ كلّ عدد بإشارته ثم اجمع الموجبة والسالبة',
          chip: `(+a)-(+b)=a-b`,
          quiz: [
            { q: 'الكتابة المبسّطة لـ $(+5)-(+6)+(-8)$', options: ['$5-6-8$', '$5+6-8$', '$-5-6-8$'], correct: 0 },
            { q: '$-6+10-4$ يساوي', options: ['$0$', '$-20$', '$20$'], correct: 0 },
          ],
        },
        predictPrompt: 'السلسلة الأخيرة كانت مكتوبة بلا أقواس ولا إشارات جمع. كيف قرأتَ كلّ عدد فيها؟',
        summary: 'نحذف إشارة الجمع وأقواس كلّ عدد فيحتفظ كلّ عدد بإشارته : (+7) − (+9) + (−4) + (−2) تُكتب 7 − 9 − 4 − 2 .',
        body: <div className="space-y-2"><p><MathText>{simplified.text}</MathText></p><p className="text-sm text-slate-600"><MathText>{simplified.example}</MathText></p></div>,
      },
    ],
    3: [
      {
        id: 'tariqat-majmu-jabri', type: 'methodes', title: 'أحسب مجموعًا جبريًا',
        memo: {
          rule: `S=${R('P')}+${R('N')}`,
          hook: 'أحوّل ثم أجمّع ثم أجمع الناتجين',
          example: `10{,}5+(-13{,}5)=${R('-3')}`,
          trap: 'لا أنسى أنّ − قبل العدد تخصّه',
          exam: 'اكتب الحدود الموجبة ثم السالبة ثم المجموعين ثم الناتج',
          chip: `S=P+N`,
          quiz: [
            { q: '$6-11+4{,}5-2{,}5$ يساوي', options: ['$-3$', '$+3$', '$-14{,}5$'], correct: 0 },
            { q: 'مجموع الحدود الموجبة في $6-11+4{,}5-2{,}5$', options: ['$10{,}5$', '$13{,}5$', '$-3$'], correct: 0 },
          ],
        },
        predictPrompt: 'حسبتَ مجاميع جبرية بأرقام جديدة. اكتب الخطوات التي اتّبعتها بالترتيب.',
        summary: 'لحساب مجموع جبري نحوّل كلّ طرح إلى جمع المعاكس، ثم نجمع الموجبة معًا والسالبة معًا ونجمع الناتجين.',
        body: <ul className="list-disc ps-5 space-y-1 text-sm">{METHOD.chain.rule.slice(1).map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ul>,
      },
      {
        id: 'tariqat-aqwas-awwalan', type: 'methodes', title: 'ما بين الأقواس أوّلًا',
        memo: {
          rule: `x-[a-b]=x-${R('(c)')}`,
          hook: 'الأقواس تتجاذب أوّلًا',
          example: `(+18)-(-15)=${R('(+33)')}`,
          trap: 'لا أهمل ما بين القوسين',
          exam: 'احسب ما بين القوسين أوّلًا ثم أكمل',
          chip: `x-[\\ldots]`,
          quiz: [
            { q: '$(+18)-[(-9)-(+6)]$ يساوي', options: ['$+33$', '$-3$', '$+3$'], correct: 0 },
            { q: 'في $20-[8-3]$ نحسب أوّلًا', options: ['ما بين القوسين', '$20-8$', 'الأعداد الصغيرة'], correct: 0 },
          ],
        },
        predictPrompt: 'في مجموع فيه قوسان ماذا حسبتَ أوّلًا وكيف أكملتَ بعد ذلك؟',
        summary: 'نحسب ما بين الأقواس أوّلًا فيصير ناتجها حدًّا واحدًا نكمل به الحساب : (+18) − [(−9) − (+6)] = (+18) − (−15) = (+33) .',
        body: <ul className="list-disc ps-5 space-y-1 text-sm">{METHOD.brackets.rule.slice(1).map((l) => <li key={l}><MathText>{l}</MathText></li>)}<li><MathText>{brackets.text}</MathText></li></ul>,
      },
    ],
  },
};
