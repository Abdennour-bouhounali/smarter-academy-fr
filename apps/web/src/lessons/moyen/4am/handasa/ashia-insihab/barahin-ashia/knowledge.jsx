import MathText from '../../../../../common/components/MathText';
import { REMARKS, PROOF_STEPS, METHOD_PROOF, CONCLUSIONS, CONSTRUCT, MIDPOINT_OPPOSITE } from './content/textbook';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/**
 * Ce que le درس 4 établit. Le manuel n'a pas de معارف pour cette leçon : sa طريقة (p. 133) est citée telle quelle ;
 * le reste est une formalisation DÉCLARÉE de la plateforme (`knowledge_formalization`, content/textbook.js), posée au
 * moment où les modules la font vivre.
 *   rabt-shal           module 1 — on raccorde deux vecteurs CONSÉCUTIFS (fin = début) ; l'ordre de la somme est libre
 *   taawid-musawi       module 1 — on remplace un vecteur par un vecteur égal que les DONNÉES garantissent
 *   mutaakisan-sifr     module 1 — deux opposés : le vecteur nul
 *   shakl-la-yubarhin   module 1 — une égalité lue sur la figure n'est pas une preuve
 *   khatawat-burhan     module 2 — traduire · transformer · conclure
 *   tariqat-abdc        module 2 — la طريقة du manuel : AB = CD ⇔ ABDC متوازي أضلاع
 *   istintajat          module 2 — ce qu'une égalité vectorielle permet de conclure (parallélogramme, milieu, alignement, parallèles)
 *   insha-majmu         module 3 — construire le représentant d'une somme de plusieurs vecteurs
 *   surat-daira         module 3 — l'image d'un cercle par une translation
 *   muntasaf-mutaakisan module 4 — un milieu par deux vecteurs opposés (ex-23)
 * « أتوقّع القاعدة » (2026-10-06) : un predictPrompt par règle gatée ; mutaakisan-sifr, tariqat-abdc et muntasaf-mutaakisan
 * sont posées en RAPPEL par leur brique (leçons 2–3) ; les modules enveloppent dans <PredictRule> les questions / boîtes
 * qui énoncent la règle juste avant sa brique.
 * Les réponses du « إختبار أولي » (R, S, T ; EFGH ; UVWX ; N, P, Q ; le drone ; Ω) ne sont dans aucun item.
 */
const Lines = ({ lines }) => (
  <ul className="list-disc ms-5 space-y-1">{lines.map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ul>
);

/** La partie qui CHANGE dans une fiche de mémoire, en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      { id: 'rabt-shal', type: 'regles', title: 'نربط شعاعين متتابعين',
        memo: {
          rule: `\\overrightarrow{AB}+\\overrightarrow{BC}=${R('\\overrightarrow{AC}')}`,
          hook: 'نهاية الأول هي بداية الثاني',
          example: `\\overrightarrow{BC}+\\overrightarrow{AB}=\\overrightarrow{AB}+\\overrightarrow{BC}=${R('\\overrightarrow{AC}')}`,
          trap: 'لا نربط شعاعين لا يلتقيان في نقطة واحدة',
          exam: 'اكتب سطر شال ثم المجموع بحرفيه',
          chip: `\\overrightarrow{AB}{+}\\overrightarrow{BC}{=}${R('\\overrightarrow{AC}')}`,
          quiz: [
            { q: '$\\overrightarrow{AB}$+$\\overrightarrow{BC}$ =', options: ['$\\overrightarrow{AC}$', '$\\overrightarrow{CA}$', '$\\overrightarrow{BC}$'], correct: 0 },
            { q: 'ما المجموع $\\overrightarrow{BC}$ + $\\overrightarrow{AB}$ ؟', options: ['$\\overrightarrow{CA}$', '$\\overrightarrow{AC}$', '$\\overrightarrow{BA}$'], correct: 1 },
          ],
        }, predictPrompt: 'في المترو قبل القطار أن يربط التذكرتين $\\overrightarrow{BC}$ و $\\overrightarrow{AB}$ في رحلة واحدة. متى يمكن أن نجمع تذكرتين في تذكرة واحدة؟ وهل يهمّ ترتيبهما في المجموع؟ اكتب القاعدة بكلماتك.', summary: 'نجمع شعاعين بعلاقة شال إذا كانت نهاية الأول هي مبدأ الثاني؛ ترتيب الحدود في المجموع لا يهم، فنرتّبها لتتتابع.',
        body: <Lines lines={[REMARKS.shalRule]} /> },
      { id: 'taawid-musawi', type: 'regles', title: 'نعوّض بشعاع يساويه',
        memo: {
          rule: `\\overrightarrow{AD}\\to${R('\\overrightarrow{BC}')}`,
          hook: 'بدّل بشعاع تضمنه المعطيات',
          example: `\\overrightarrow{AD}=${R('\\overrightarrow{BC}')}\\Rightarrow \\overrightarrow{AB}+\\overrightarrow{AD}=\\overrightarrow{AC}`,
          trap: 'لا نبدّل شعاعًا لمجرد أنه يشبه الآخر على الشكل',
          exam: 'اذكر المعطى الذي يبرّر التبديل',
          chip: `\\overrightarrow{AD}\\to${R('\\overrightarrow{BC}')}`,
          quiz: [
            { q: 'في متوازي الأضلاع $ABCD$ ، بأيّ شعاع نعوّض $\\overrightarrow{AD}$ ؟', options: ['$\\overrightarrow{BC}$', '$\\overrightarrow{CB}$', '$\\overrightarrow{DC}$'], correct: 0 },
            { q: 'متى يحقّ لنا أن نعوّض شعاعًا بآخر؟', options: ['حين يبدوان متساويين على الشكل', 'حين يتساوى طولاهما فقط', 'حين تضمن المعطيات أنهما متساويان'], correct: 2 },
          ],
        }, predictPrompt: 'في الرحلة 2 لم ترتبط $\\overrightarrow{AB}$ و $\\overrightarrow{AD}$ ، فنقلت إحدى التذكرتين إلى محطة أخرى. متى يحقّ لنا أن نضع شعاعًا مكان شعاع آخر في عبارة؟ ومن أين نأخذ هذا الحقّ؟ اكتب القاعدة.', summary: 'إذا لم يتتابع شعاعان نعوّض أحدهما بشعاع يساويه تضمنه المعطيات: متوازي أضلاع، منتصف، أو تعريف نقطة.',
        body: <Lines lines={[REMARKS.swapRule, REMARKS.rabtRight]} /> },
      { id: 'mutaakisan-sifr', type: 'regles', title: 'شعاعان متعاكسان',
        memo: {
          rule: `\\overrightarrow{AB}+\\overrightarrow{BA}=${R('\\vec{0}')}`,
          hook: 'ذهاب وإياب: لا حركة',
          example: `\\overrightarrow{OA}+\\overrightarrow{AO}=${R('\\overrightarrow{0}')}`,
          trap: 'الناتج شعاع معدوم وليس العدد صفر',
          exam: 'ارسم السهم فوق الصفر',
          chip: `\\overrightarrow{AB}+\\overrightarrow{BA}=${R('\\vec{0}')}`,
          quiz: [
            { q: '$\\overrightarrow{OA}$+$\\overrightarrow{AO}$ =', options: ['$\\overrightarrow{0}$', '$0$', '$2\\overrightarrow{OA}$'], correct: 0 },
            { q: 'ماذا نفعل بشعاعين متعاكسين في مجموع؟', options: ['نكتب مجموعهما العدد صفر', 'نحذفهما لأن مجموعهما الشعاع المعدوم', 'نضاعف أحدهما'], correct: 1 },
          ],
        }, summary: 'مجموع شعاعين متعاكسين هو الشعاع المعدوم، فنحذفهما من العبارة؛ والشعاع المعدوم لا يغيّر المجموع.',
        body: <Lines lines={[REMARKS.zeroRule]} /> },
      { id: 'shakl-la-yubarhin', type: 'regles', title: 'الشكل لا يبرهن',
        memo: {
          rule: `\\overrightarrow{OL}${R('\\overset{?}{=}')}\\overrightarrow{AC}`,
          hook: 'ما نراه يوحي، والمعطى يبرهن',
          example: `\\overrightarrow{OL}=\\overrightarrow{OC}+${R('\\overrightarrow{CL}')}=\\overrightarrow{OC}+${R('\\overrightarrow{OC}')}=\\overrightarrow{AC}`,
          trap: 'لا نبدأ البرهان من النتيجة التي نراها على الشكل',
          exam: 'اذكر المعطى بجانب كل مساواة',
          chip: `\\overrightarrow{OL}\\overset{?}{=}\\overrightarrow{AC}\\to${R('\\checkmark')}`,
          quiz: [
            { q: 'على الشكل يبدو أنّ $\\overrightarrow{OL}$ = $\\overrightarrow{AC}$ . ماذا نفعل في البرهان؟', options: ['نكتبها مباشرة لأنها ظاهرة', 'نبرهنها بالمعطيات وعلاقة شال', 'نقيس الشكل بالمسطرة'], correct: 1 },
            { q: 'ما الذي يحقّ لنا استعماله في البرهان؟', options: ['المعطيات والخواص المعروفة', 'ما يبدو صحيحًا على الشكل', 'قياسات الشكل'], correct: 0 },
          ],
        }, predictPrompt: 'في المستوى المتقدّم بدا على الشكل أنّ $\\overrightarrow{OL} = \\overrightarrow{AC}$ ، لكنّ المختبر لم يقبل أن تستعمل ذلك. ما الذي يحقّ لنا أن نستعمله في برهان، وما الذي لا يكفي؟ اكتب القاعدة.', summary: 'ما نراه على الشكل يوحي ولا يثبت: لا نستعمل في البرهان إلا المعطيات والخواص المعروفة.',
        body: <Lines lines={[REMARKS.seeWhy, REMARKS.seeRight]} /> },
    ],
    2: [
      { id: 'khatawat-burhan', type: 'methodes', title: PROOF_STEPS.title,
        memo: {
          rule: `\\overrightarrow{HK}=\\cdots=${R('\\overrightarrow{AC}')}`,
          hook: 'ترجم · حوّل · استنتج',
          example: `\\overrightarrow{HK}=${R('\\overrightarrow{HB}+\\overrightarrow{BC}+\\overrightarrow{CK}')}=\\overrightarrow{AC}`,
          trap: 'لا نقفز إلى النتيجة دون خطوات الوسط',
          exam: 'ثلاثة أسطر: المطلوب ثم التحويل ثم الاستنتاج',
          chip: `\\overrightarrow{HK}=\\cdots=${R('\\overrightarrow{AC}')}`,
          quiz: [
            { q: 'ما الخطوة الأولى في برهان تساوي شعاعين؟', options: ['نترجم المطلوب إلى مساواة شعاعية', 'نقيس الشكل', 'نكتب الاستنتاج مباشرة'], correct: 0 },
            { q: 'كيف نحوّل أحد طرفي المساواة؟', options: ['بالتخمين من الشكل', 'بحذف شعاع من الطرفين', 'بعلاقة شال وبالمعطيات خطوة خطوة'], correct: 2 },
          ],
        }, predictPrompt: 'في المترو وصلت من $\\overrightarrow{OL}$ إلى $\\overrightarrow{AC}$ خطوة خطوة. لو طُلب منك أن تبرهن أنّ نقطة منتصف قطعة أو أنّ رباعيًا متوازي أضلاع، بأيّ خطوات تبدأ ثم تتابع ثم تنتهي؟ اكتب الطريقة.', summary: 'نترجم المطلوب إلى مساواة شعاعية، نحوّل أحد طرفيها خطوة خطوة بعلاقة شال وبالمعطيات، ثم نستنتج الخاصية الهندسية.',
        body: (
          <ol className="list-decimal ms-5 space-y-1">{PROOF_STEPS.lines.map((l) => <li key={l}><MathText>{l}</MathText></li>)}</ol>
        ) },
      { id: 'tariqat-abdc', type: 'methodes', title: METHOD_PROOF.title,
        memo: {
          rule: `\\overrightarrow{AB}=\\overrightarrow{CD}\\iff${R('ABDC')}`,
          hook: 'انظر إلى ترتيب رؤوس الرباعي',
          example: `\\overrightarrow{AB}=\\overrightarrow{CD}\\iff${R('ABDC')}`,
          trap: 'لا نخلط ترتيب رؤوس الرباعي عند كتابة اسمه',
          exam: 'اكتب اسم الرباعي بترتيب الدوران',
          chip: `\\overrightarrow{AB}=\\overrightarrow{CD}\\to${R('ABDC')}`,
          quiz: [
            { q: 'إذا كان $\\overrightarrow{AB}$ = $\\overrightarrow{CD}$ فالرباعي متوازي الأضلاع هو:', options: ['$ABCD$', '$ABDC$', '$ACBD$'], correct: 1 },
            { q: 'لإثبات $\\overrightarrow{AB}$ = $\\overrightarrow{CD}$ يكفي أن نثبت أنّ:', options: ['قطري $ABDC$ متناصفان', '$AB=CD$ طولاً فقط', '$(AB)$ و $(CD)$ متوازيان فقط'], correct: 0 },
          ],
        }, summary: 'لإثبات أن شعاعين AB و CD متساويان يكفي إثبات أن الرباعي ABDC متوازي أضلاع، مثلا لأن قطريه متناصفان.',
        body: <Lines lines={[METHOD_PROOF.rule]} /> },
      { id: 'istintajat', type: 'regles', title: CONCLUSIONS.title,
        memo: {
          rule: `\\overrightarrow{AI}=\\overrightarrow{ID}\\Rightarrow${R('AI=ID')}`,
          hook: 'ماذا نستنتج؟ منتصف · متوازي · استقامة',
          example: `\\overrightarrow{AI}=\\overrightarrow{ID}\\Rightarrow${R('AI=ID=\\tfrac{1}{2}AD')}`,
          trap: 'علاقة شال وحدها لا تثبت أنّ ثلاث نقط على استقامة واحدة',
          exam: 'اكتب الاستنتاج الهندسي بعد المساواة الشعاعية',
          chip: `\\overrightarrow{AI}=\\overrightarrow{ID}\\to${R('AI=ID')}`,
          quiz: [
            { q: 'من $\\overrightarrow{AI}$ = $\\overrightarrow{ID}$ نستنتج أنّ:', options: ['$A$ منتصف $[ID]$', '$I$ منتصف $[AD]$', '$ID=2AI$'], correct: 1 },
            { q: 'هل تكفي علاقة شال $\\overrightarrow{AB}$+$\\overrightarrow{BC}$=$\\overrightarrow{AC}$ لإثبات أنّ $B\\in[AC]$ ؟', options: ['نعم دائمًا', 'نعم إذا كان $AB=BC$', 'لا، فهي صحيحة لأيّ ثلاث نقط'], correct: 2 },
          ],
        }, predictPrompt: 'في طريقة الكتاب استنتجنا خاصية هندسية من $\\overrightarrow{AI} = \\overrightarrow{ID}$ . ماذا تستنتج من $\\overrightarrow{AB} = \\overrightarrow{DC}$ ؟ ومن $\\overrightarrow{AB} = \\overrightarrow{BC}$ ؟ وهل تكفي $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$ لنقول إنّ $B$ تقع على $[AC]$ ؟', summary: 'من مساواة شعاعية نستنتج متوازي أضلاع، أو منتصف قطعة، أو استقامية ثلاث نقط، أو توازي مستقيمين؛ أما علاقة شال وحدها فلا تثبت استقامية.',
        body: <Lines lines={[...CONCLUSIONS.lines, CONCLUSIONS.warning]} /> },
    ],
    3: [
      { id: 'insha-majmu', type: 'methodes', title: CONSTRUCT.title,
        memo: {
          rule: `\\overrightarrow{EE_1}=${R('\\overrightarrow{AB}+\\overrightarrow{AC}')}`,
          hook: 'كل ممثّل ينطلق من نهاية سابقه',
          example: `E\\xrightarrow{\\overrightarrow{AB}}M\\xrightarrow{\\overrightarrow{AC}}${R('E_1')}`,
          trap: 'لا ننطلق بكل الممثّلات من النقطة نفسها',
          exam: 'ارسم الممثّلات متتابعة ثم سمِّ النقطة الأخيرة',
          chip: `E\\to${R('E_1')}`,
          quiz: [
            { q: 'نرسم ممثّل مجموع ثلاثة أشعة بأن:', options: ['نرسمها كلها من النقطة نفسها', 'نرسم كلًّا منها من نهاية السابق', 'نرسم الأخير فقط'], correct: 1 },
            { q: 'إذا كان $\\overrightarrow{EE_1}$ = $\\vec{u}$ + $\\vec{v}$ فإنّ $E_1$ هي:', options: ['صورة $E$ بالانسحاب الذي شعاعه $\\vec{u}$ فقط', 'صورة $E$ بالانسحاب الذي شعاعه $\\vec{u}+\\vec{v}$', 'صورة $E$ بالانسحاب الذي شعاعه $\\vec{v}$ فقط'], correct: 1 },
          ],
        }, predictPrompt: 'في المختبر أوصلت القطار من المحطة E بالتذكرتين $\\overrightarrow{AB}$ و $\\overrightarrow{AC}$ . لو أعطيناك ثلاثة أشعة ونقطة انطلاق M ، كيف تنشئ ممثّل مجموعها الذي يبدأ من M ؟ اكتب الطريقة.', summary: 'نرسم ممثّلات الأشعة متتابعة، كل واحد من نهاية السابق، فتكون النهاية الأخيرة نهاية ممثّل المجموع.',
        body: <Lines lines={CONSTRUCT.lines} /> },
      { id: 'surat-daira', type: 'regles', title: 'صورة دائرة بانسحاب',
        memo: {
          rule: `\\mathcal{C}(E;r)\\to\\mathcal{C}(${R('E_1')};r)`,
          hook: 'نفس نصف القطر ومركز جديد',
          example: `\\mathcal{C}(E;2)\\to\\mathcal{C}(${R('E_1')};${R('2')})`,
          trap: 'لا يتغيّر نصف القطر بالانسحاب',
          exam: 'اكتب: دائرة مركزها صورة المركز ونصف قطرها نفسه',
          chip: `(E;r)\\to(${R('E_1')};r)`,
          quiz: [
            { q: 'صورة دائرة نصف قطرها $2$ بانسحاب دائرة نصف قطرها:', options: ['$2$', '$4$', '$2+EE_1$'], correct: 0 },
            { q: 'مركز صورة الدائرة بانسحاب هو:', options: ['المركز نفسه', 'منتصف شعاع الانسحاب', 'صورة المركز'], correct: 2 },
          ],
        }, predictPrompt: 'في المختبر نقلت مركز الدائرة (Γ) من E إلى $E_1$ بانسحاب. ماذا يحدث لنصف قطرها؟ كيف تعيّن صورة دائرة بانسحاب؟ اكتب القاعدة.', summary: 'صورة دائرة بانسحاب دائرة لها نفس نصف القطر، ومركزها صورة المركز.',
        body: <Lines lines={[CONSTRUCT.circle]} /> },
    ],
    4: [
      { id: 'muntasaf-mutaakisan', type: 'regles', title: 'منتصف بشعاعين متعاكسين',
        memo: {
          rule: `\\overrightarrow{AK}=-\\overrightarrow{AL}\\Rightarrow${R('\\overrightarrow{LA}=\\overrightarrow{AK}')}`,
          hook: 'متعاكسان من A: A في الوسط',
          example: `\\overrightarrow{AK}+\\overrightarrow{AL}=\\overrightarrow{0}\\Rightarrow${R('\\overrightarrow{LA}=\\overrightarrow{AK}')}`,
          trap: 'لا يكفي أن يكون A على المستقيم المار بالنقطتين',
          exam: 'اكتب المساواة ثم استنتج أنّ A منتصف القطعة',
          chip: `\\overrightarrow{AK}{=}{-}\\overrightarrow{AL}`,
          quiz: [
            { q: 'إذا كان $\\overrightarrow{AK}$+$\\overrightarrow{AL}$=$\\overrightarrow{0}$ فإنّ:', options: ['$K$ منتصف $[AL]$', '$AK=2AL$', '$A$ منتصف $[KL]$'], correct: 2 },
            { q: 'مجموع شعاعين متعاكسين لهما المبدأ نفسه هو:', options: ['$2\\overrightarrow{AK}$', 'الشعاع المعدوم', 'العدد $0$'], correct: 1 },
          ],
        }, summary: 'إذا كان الشعاعان من A نحو K ومن A نحو L متعاكسين فإن A منتصف القطعة [KL].',
        body: <Lines lines={[MIDPOINT_OPPOSITE]} /> },
    ],
  },
};
