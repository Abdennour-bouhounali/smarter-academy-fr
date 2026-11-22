import MathText from '../../../../../common/components/MathText';
import { KNOWLEDGE, METHOD_TILING } from './content/textbook';

// La carte progressive de la leçon — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Les connaissances du درس « مساحة سطح مستو ومحيطه » (1AM) — SOURCE UNIQUE (content/textbook.js : les mots de la plateforme, tirés de
 * أوظّف تعلّماتي 1 et de أكتسب طرائق 1 du manuel ; rien n'est copié au mot).
 */
/** La partie de la règle qui CHANGE, en couleur, dans la fiche de mémoire (`memo`, KNOWLEDGE_MAP « The memo card »). */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'masaha-adad', type: 'concepts', title: 'المساحة: عدد البلاطات',
        memo: {
          rule: `\\mathcal{A}=${R('n')}\\times\\square`,
          hook: 'عُدّ البلاطات التي تغطّي',
          example: `3\\times 4=${R('12')}\\times\\square`,
          trap: 'لا فراغ ولا تراكب بين البلاطات',
          exam: 'اكتب العدد ثم الوحدة: 12 بلاطة',
          chip: `\\mathcal{A}=${R('n')}\\,\\square`,
          quiz: [
            { q: 'مستطيل من $3$ صفوف في كلّ منها $4$ بلاطات. مساحته:', options: ['$12$ بلاطة', '$14$ بلاطة', '$7$ بلاطات'], correct: 0 },
            { q: 'سطح مغطّى بـ $9$ بلاطات بلا فراغ. مساحته:', options: ['$9$ بلاطات', '$12$ عصا', '$3$ بلاطات'], correct: 0 },
          ],
        },
        predictPrompt: 'في الحوش اثنتا عشرة بلاطة مهما غيّرتَ ترتيبها. ماذا يقيس هذا العدد؟ اكتب بكلماتك ما هي مساحة سطح.',
        summary: 'مساحة سطح هي عدد وحدات المساحة (البلاطات) التي تغطّيه تمامًا، بلا فراغ وبلا تراكب.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.area.text}</MathText></p></div>,
      },
      {
        id: 'mahit-hadd', type: 'concepts', title: 'المحيط: طول الحدّ',
        memo: {
          rule: `\\mathcal{P}=a+b+c+\\dots`,
          hook: 'طول الحدّ مرّة واحدة',
          example: `\\mathcal{P}=4+3+4+3=${R('14')}`,
          trap: 'لا تعدّ الأضلاع التي بين بلاطتين',
          exam: 'اجمع أطوال الأضلاع التي على الحدّ فقط',
          chip: `\\mathcal{P}=${R('14')}`,
          quiz: [
            { q: 'حوش من صفّين في كلّ منهما $6$ بلاطات. محيطه:', options: ['$16$', '$12$', '$14$'], correct: 0 },
            { q: 'بلاطة واحدة وحدها: محيطها:', options: ['$4$', '$1$', '$2$'], correct: 0 },
          ],
        },
        predictPrompt: 'كلّما التصقت البلاطات قصر السياج وكلّما تباعدت طال. ماذا يقيس طول السياج؟ اكتب بكلماتك ما هو محيط سطح.',
        summary: 'محيط سطح هو طول حدّه: عدد وحدات الطول (أضلاع البلاطات) على الحدّ كلّه، وهو طول السياج الذي يحيط به مرّة واحدة.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.perimeter.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.different.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'wahdat-tul-masaha', type: 'concepts', title: 'وحدة الطول ووحدة المساحة', predict: false,
        memo: {
          rule: `\\mathcal{A}\\to${R('\\square')}\\qquad\\mathcal{P}\\to${R('|')}`,
          hook: 'لكل عدد وحدته',
          example: `12\\,\\square\\qquad 14\\,|`,
          trap: 'لا تكتب مساحة بالعصي ولا محيطًا بالبلاطات',
          exam: 'اكتب الوحدة بعد كل عدد',
          chip: `\\square\\quad |`,
          quiz: [
            { q: 'المحيط يُقاس بـ:', options: ['وحدة طول (ضلع بلاطة)', 'وحدة مساحة (بلاطة)', 'عدد البلاطات'], correct: 0 },
            { q: 'المساحة تُقاس بـ:', options: ['وحدة مساحة (بلاطة)', 'وحدة طول (عصا)', 'طول السياج'], correct: 0 },
          ],
        },
        summary: 'نعدّ المساحة بوحدة مساحة هي البلاطة، ونعدّ المحيط بوحدة طول هي ضلع البلاطة: لكل عدد وحدته.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.unitLength.text}</MathText></p></div>,
      },
      {
        id: 'naql-baqat-masaha', type: 'regles', title: 'نقل البلاطات',
        memo: {
          rule: `\\mathcal{A}=12,\\ \\mathcal{P}=${R('14')}\\to${R('20')}`,
          hook: 'ننقل: المساحة ثابتة',
          example: `12\\,\\square:\\ \\mathcal{P}=14,\\,16,\\,${R('20')}`,
          trap: 'تغيّر المحيط لا يعني تغيّر المساحة',
          exam: 'ما دمنا لا نضيف ولا نزيل، فالمساحة نفسها',
          chip: `\\mathcal{A}=12`,
          quiz: [
            { q: 'نقلنا بلاطة في حوش من $12$ بلاطة. المساحة:', options: ['تبقى $12$', 'تصير $11$', 'تصير $13$'], correct: 0 },
            { q: 'حين تتلاصق البلاطات أكثر، المحيط:', options: ['يقصر', 'يطول', 'لا يتغيّر'], correct: 0 },
          ],
        },
        predictPrompt: 'نقلتَ بلاطة من مكان إلى مكان دون أن تضيف بلاطة أو تزيلها. ماذا بقي كما هو وماذا تغيّر؟ اكتب ما لاحظته.',
        summary: 'إذا نقلنا بلاطات دون إضافة ولا إزالة بقيت المساحة وتغيّر المحيط عادةً: كلّما التصقت البلاطات بأضلاع أكثر قصر الحدّ.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.moving.text}</MathText></p></div>,
      },
    ],
    2: [
      {
        id: 'thalath-hallat', type: 'regles', title: 'سطحان: المساحة والمحيط',
        memo: {
          rule: `\\mathcal{P}_1=\\mathcal{P}_2\\ \\not\\Rightarrow\\ ${R('\\mathcal{A}_1=\\mathcal{A}_2')}`,
          hook: 'المساحة والمحيط مستقلّان',
          example: `\\mathcal{P}=12:\\ \\mathcal{A}=${R('5')},\\ ${R('9')}`,
          trap: 'نفس المحيط لا يعني نفس المساحة، والعكس',
          exam: 'قارن المساحتين وحدهما، ثم المحيطين وحدهما',
          chip: `\\mathcal{A}\\ne\\mathcal{P}`,
          quiz: [
            { q: 'حوشان بنفس الحبل ($12$ عصا)، أحدهما من $5$ بلاطات. الآخر:', options: ['قد يكون من $9$ بلاطات', 'من $5$ بلاطات حتمًا', 'من $12$ بلاطة حتمًا'], correct: 0 },
            { q: 'حوشان من $12$ بلاطة. محيطاهما:', options: ['قد يختلفان', 'متساويان دائمًا', 'يساويان $12$ دائمًا'], correct: 0 },
          ],
        },
        predictPrompt: 'قارنتَ حوشين: بالبلاطات نفسها وسياجين مختلفين، وبالسياج نفسه وعددين مختلفين من البلاطات. ماذا يمكن أن يتساوى لسطحين وماذا يختلف؟ اكتب الحالات التي رأيتها.',
        summary: 'لسطحين مختلفين قد تتساوى المساحتان دون المحيطين، أو المحيطان دون المساحتين، أو المساحتان والمحيطان معًا مع اختلاف الشكلين.',
        body: (
          <div className="space-y-2">
            <p><MathText>{KNOWLEDGE.sameAreaOnly.text}</MathText></p>
            <p><MathText>{KNOWLEDGE.samePerimeterOnly.text}</MathText></p>
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.sameBoth.text}</MathText></p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'tariqat-rasf', type: 'methodes', title: 'أعيّن المساحة برصف',
        memo: {
          rule: `\\mathcal{A}=n+${R('\\dfrac{h}{2}')}`,
          hook: 'كل نصفين بلاطة',
          example: `14+${R('\\dfrac{4}{2}')}=16`,
          trap: 'لا تعدّ النصف بلاطة كاملة، ولا تهمله',
          exam: 'عُدّ الكاملة، ثم اقسم الأنصاف على 2، واجمع',
          chip: `n+${R('\\tfrac{h}{2}')}`,
          quiz: [
            { q: '$7$ بلاطات كاملة و $4$ أنصاف. المساحة:', options: ['$9$', '$11$', '$7$'], correct: 0 },
            { q: '$10$ بلاطات كاملة و $2$ نصفان. المساحة:', options: ['$11$', '$12$', '$10$'], correct: 0 },
          ],
        },
        predictPrompt: 'رصصتَ الشرفة ببلاطات كاملة وأنصاف بلاطات. كيف عيّنتَ مساحتها بعدد واحد؟ اكتب ما فعلتَه بالأنصاف.',
        summary: 'نغطّي السطح بوحدة المساحة ثم نعدّ البلاطات الكاملة ونضمّ كل نصفين في بلاطة، ثم نجمع.',
        body: (
          <div className="space-y-2">
            {METHOD_TILING.solution.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
            <p className="text-sm text-slate-600"><MathText>{KNOWLEDGE.halves.text}</MathText></p>
          </div>
        ),
      },
      {
        id: 'wahdatan-adad', type: 'regles', title: 'مساحة واحدة بوحدتين',
        memo: {
          rule: `u_2=2u_1\\Rightarrow n_2=${R('\\dfrac{n_1}{2}')}`,
          hook: 'وحدة أكبر، عدد أصغر',
          example: `21\\,u_1=${R('10{,}5')}\\,u_2`,
          trap: 'الأرضية لم تصغر: الوحدة هي التي كبرت',
          exam: 'اكتب الوحدة مع العدد دائمًا',
          chip: `n_2=${R('\\tfrac{n_1}{2}')}`,
          quiz: [
            { q: 'مساحة $18$ وحدة ①، والوحدة ② ضعفها. المساحة بالوحدة ②:', options: ['$9$', '$36$', '$18$'], correct: 0 },
            { q: 'المساحة نفسها بوحدة أكبر تُكتب بعدد:', options: ['أصغر', 'أكبر', 'نفسه'], correct: 0 },
          ],
        },
        predictPrompt: 'قرأتَ مساحة الأرضية نفسها بالبلاطة المفردة وبالبلاطة المزدوجة فجاء عددان مختلفان. لماذا اختلف العدد والمساحة واحدة؟ اكتب ما لاحظته.',
        summary: 'المساحة نفسها يتغيّر عددها بتغيّر الوحدة: إذا كانت وحدة ② ضعف وحدة ① فعدد وحدات ② نصف عدد وحدات ①.',
        body: <div className="space-y-2"><p><MathText>{KNOWLEDGE.units.text}</MathText></p></div>,
      },
    ],
  },
};
