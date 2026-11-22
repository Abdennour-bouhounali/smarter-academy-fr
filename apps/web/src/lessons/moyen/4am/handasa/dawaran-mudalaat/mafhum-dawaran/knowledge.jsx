import MathText from '../../../../../common/components/MathText';
import { SourceTag } from '../../../../../common/textbook';
import { ACTIVITY, KNOW1, KNOW2, METHOD_POINT, METHOD_SEGMENT, ACTIVITY_3_LINES, ACTIVITY_3 } from './content/textbook';
import SenseClocks from './components/SenseClocks';

// La carte progressive de la leçon (structure, relations, aides) — KNOWLEDGE_MAP.md, Part A.
export { KNOWLEDGE_GRAPH } from './knowledgeGraph';

/** `memo` — la FICHE DE MÉMOIRE (MemoCard) : ce qui CHANGE dans la règle s'écrit en rouge. */
const R = (x) => `\\textcolor{#e11d48}{${x}}`;

/**
 * Les connaissances du درس « مفهوم الدوران وإنشاء صور أشكال هندسية بدوران » — SOURCE UNIQUE.
 *
 *   module 1 (نشاط 1)   dawaran-tajribi — A′ est l'image de A par le دوران de centre O et d'angle \widehat{AOA′} (le texte
 *                       du نشاط 1, après le papier calque) ;
 *   module 2 (معارف)     dawaran (تعريف + ملاحظة), ittijah (اصطلاح : المباشر / غير المباشر), surat-nuqta (صورة نقطة +
 *                       O صورة نفسها), nisf-dawra (180° = التناظر المركزي) ;
 *   module 3 (طرائق)     tariqat-nuqta (تمرين 1), tariqat-qitaa (تمرين 2 et sa طريقة), suwar-ashkal (les images du نشاط 3 :
 *                       قطعة، مستقيم، نصف مستقيم، دائرة).
 */
const Body = ({ lines, source, children }) => (
  <div className="space-y-1.5">
    {lines.map((l) => <p key={l}><MathText>{l}</MathText></p>)}
    {children}
    <SourceTag source={source} />
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'dawaran-tajribi', type: 'concepts', title: 'الدوران: نقطة وصورتها',
        memo: {
          rule: `${R("OA'")}=OA\\ ,\\ \\widehat{AOA'}=\\alpha`,
          hook: 'يدور حول المركز ويبقى على بعده',
          example: `${R("OA'")}=OA=3`,
          trap: 'ظنّ أن بُعد الصورة عن المركز يتغيّر مع الدوران',
          exam: 'اكتب أن البعد عن المركز ثابت وأن الزاوية هي زاوية الدوران',
          chip: `${R("OA'")}=OA`,
          quiz: [
            { q: 'نقطة تبعد $3$ عن $O$ دارت حول $O$. صورتها تبعد عن $O$:', options: ['$3$', 'أكثر من $3$ لأنها تحرّكت', 'أقل من $3$ لأنها اقتربت'], correct: 0 },
            { q: 'تنطبق $A$ على $A\'$ عند تدوير الورق الشفاف:', options: ['حول $O$', 'مع تحريكه دون تدويره', 'مع قلبه'], correct: 0 },
          ],
        },
        // Pas de prédiction : le texte du نشاط 1 NOMME la notion (« نقول إنّ … ») dans l'encadré juste avant, et les lignes du
        // questionnaire font énoncer chaque élément (A sur A′, OA = OA′, les angles égaux) ; la règle générale est prédite au module 2 (surat-nuqta).
        predict: false,
        summary: 'بتدوير الورق الشفاف حول النقطة O تنطبق A على A′: نقول إن A′ صورة A بالدوران الذي مركزه O وزاويته AOA′، و OA′ = OA.',
        body: <Body lines={[ACTIVITY.naming, ACTIVITY.closing]} source={ACTIVITY.source} />,
      },
    ],
    2: [
      {
        id: 'dawaran', type: 'concepts', title: 'الدوران: مركز وزاوية واتجاه',
        memo: {
          rule: `\\left(O\\ ;\\ ${R('\\alpha')}\\ ;\\ \\circlearrowleft\\right)`,
          hook: 'مركز وزاوية واتجاه',
          example: `\\left(O\\ ;\\ ${R('70^{\\circ}')}\\ ;\\ \\circlearrowleft\\right)`,
          trap: 'نسيان الاتجاه: الزاوية وحدها لا تعيّن الدوران',
          exam: 'اذكر دائما المركز والزاوية والاتجاه',
          chip: `O\\ ;\\ ${R('\\alpha')}\\ ;\\ \\circlearrowleft`,
          quiz: [
            { q: 'ما الذي يعيّن الدوران؟', options: ['المركز والزاوية والاتجاه', 'المركز والزاوية فقط', 'الزاوية والاتجاه فقط'], correct: 0 },
            { q: 'النقطة الوحيدة التي لا تتحرك في الدوران هي:', options: ['المركز', 'أبعد نقطة عن المركز', 'كل النقط'], correct: 0 },
          ],
        },
        predictPrompt: 'في نشاط 1 وضعت إبرة المدور على $O$ ودوّرت الورق الشفاف حتى انطبق (F) على (F′)، وعلى الورقة أنشأت صورة نقطة بزاوية $70^\\circ$. لو قال لك زميل فقط: «دوّر الشكل بزاوية $70^\\circ$»، ماذا ينقصه لتعرف أين يصل الشكل؟ اكتب بكلماتك ما الذي يحدّد دورانًا.',
        summary: 'تحويل شكل بدوران هو تدويره بزاوية معيّنة حول نقطة ثابتة وفي اتجاه معيّن؛ يتميّز الدوران بمركز وزاوية واتجاه.',
        body: <Body lines={[KNOW1.definition, KNOW1.remark]} source={KNOW1.source} />,
      },
      {
        id: 'ittijah', type: 'vocabulaire', title: 'الاتجاه المباشر وغير المباشر',
        memo: {
          rule: `\\circlearrowleft=${R('+')}\\quad\\circlearrowright=${R('-')}`,
          hook: 'عكس الساعة هو المباشر',
          example: `${R('+')}60^{\\circ}\\ \\circlearrowleft`,
          trap: 'الخلط بين الاتجاه المباشر واتجاه عقارب الساعة',
          exam: 'اذكر الاتجاه صراحة: مباشر أو غير مباشر',
          chip: `\\circlearrowleft=${R('+')}`,
          quiz: [
            { q: 'الاتجاه المباشر هو:', options: ['عكس اتجاه عقارب الساعة', 'اتجاه عقارب الساعة', 'نحو اليمين دائما'], correct: 0 },
            { q: 'دوران في اتجاه عقارب الساعة هو دوران:', options: ['غير مباشر', 'مباشر', 'بلا اتجاه'], correct: 0 },
          ],
        },
        summary: 'الاتجاه المباشر (الموجب) هو عكس اتجاه عقارب الساعة؛ الاتجاه غير المباشر (السالب) هو اتجاه حركة عقارب الساعة.',
        body: <Body lines={[KNOW1.convention]} source={KNOW1.source}><SenseClocks /></Body>,
      },
      {
        id: 'surat-nuqta', type: 'concepts', title: 'صورة نقطة بدوران',
        memo: {
          rule: `${R("OM'")}=OM\\ ,\\ \\widehat{MOM'}=${R('\\alpha')}`,
          hook: 'البعد نفسه والزاوية المطلوبة',
          example: `\\widehat{AOA'}=${R('70^{\\circ}')}\\ ,\\ OA'=OA`,
          trap: 'التحقق من الزاوية وحدها دون البعد',
          exam: 'تحقق من الشروط الثلاثة: البعد والزاوية والاتجاه',
          chip: `${R("OM'")}=OM`,
          quiz: [
            { q: 'لتكون $M\'$ صورة $M$ نشترط:', options: ['$OM\'=OM$ والزاوية $\\alpha$ في الاتجاه المعطى', 'الزاوية $\\alpha$ فقط', '$OM\'=OM$ فقط'], correct: 0 },
            { q: 'صورة النقطة $O$ بدوران مركزه $O$ هي:', options: ['$O$ نفسها', 'نقطة على بعد $1$ منها', 'لا صورة لها'], correct: 0 },
          ],
        },
        predictPrompt: 'في المستوى «متقدم» فتحت المدور على $O$ وأدرت المنقلة $70^\\circ$ قبل أن تضع $A\'$، ورفض المختبر بعض المواضع. متى تكون نقطة $M\'$ صورة نقطة $M$ بالدوران الذي مركزه $O$ وزاويته $\\alpha$ في اتجاه معيّن؟ وما صورة $O$ نفسها؟ اكتب الشروط بكلماتك.',
        summary: 'صورة نقطة M تختلف عن O بالدوران الذي مركزه O وزاويته ألفا في اتجاه معيّن هي النقطة M′ حيث OM′ = OM والزاوية MOM′ تساوي ألفا؛ وصورة O هي O نفسها.',
        body: <Body lines={[KNOW2.definition, KNOW2.remark]} source={KNOW2.source} />,
      },
      {
        id: 'nisf-dawra', type: 'regles', title: 'دوران زاويته 180 درجة',
        memo: {
          rule: `180^{\\circ}:\\ ${R("O\\in[MM']")}`,
          hook: 'نصف دورة: المركز في المنتصف',
          example: `180^{\\circ}:\\ ${R("O\\in[AA']")}`,
          trap: 'ظنّ أن الاتجاه يغيّر الصورة عند نصف دورة',
          exam: 'اذكر أن المركز منتصف القطعة التي تصل نقطة بصورتها',
          chip: `180^{\\circ}`,
          quiz: [
            { q: 'دوران زاويته $180^\\circ$ هو:', options: ['التناظر المركزي', 'التناظر المحوري', 'الانسحاب'], correct: 0 },
            { q: 'صورة نقطة بدوران $180^\\circ$:', options: ['نقطة واحدة في الاتجاهين', 'نقطتان مختلفتان بحسب الاتجاه', 'النقطة نفسها'], correct: 0 },
          ],
        },
        predictPrompt: 'في العجلة ذات المقصورات الست، دوران بزاوية $60^\\circ$ يوصل المقصورة A إلى مكانين مختلفين بحسب الاتجاه. ماذا يحدث لو كانت الزاوية $180^\\circ$: أين تصل A في كل من الاتجاهين؟ وأيّ تحويل درسته من قبل يعطي نفس الصورة؟ اكتب القاعدة.',
        summary: 'الدوران الذي مركزه O وزاويته 180 درجة هو التناظر بالنسبة إلى النقطة O، والاتجاهان يعطيان نفس الصورة.',
        body: <Body lines={[KNOW2.special, KNOW2.example2]} source={KNOW2.source} />,
      },
    ],
    3: [
      {
        id: 'tariqat-nuqta', type: 'methodes', title: 'إنشاء صورة نقطة',
        memo: {
          rule: `A'\\in[Ox)\\ ,\\ ${R("OA'=OA")}`,
          hook: 'نصف مستقيم بالمنقلة ثم المدور',
          example: `\\widehat{AOx}=${R('70^{\\circ}')}\\ ,\\ OA'=OA`,
          trap: 'وضع مركز المنقلة على النقطة لا على المركز',
          exam: 'ارسم نصف المستقيم ثم الزاوية بالمنقلة ثم عيّن الصورة بالمدور',
          chip: `[OA)\\to[Ox)\\to A'`,
          quiz: [
            { q: 'يوضع مركز المنقلة عند:', options: ['مركز الدوران $O$', 'النقطة $A$', 'منتصف $[OA]$'], correct: 0 },
            { q: 'نعيّن $A\'$ على $[Ox)$ بفتح المدور على:', options: ['$OA$', 'الزاوية المطلوبة', '$AA\'$'], correct: 0 },
          ],
        },
        predictPrompt: '$O$ و $A$ نقطتان متمايزتان. على الورقة أنشأت صورة نقطة بزاوية $70^\\circ$ بالمدور والمنقلة. كيف تنشئ $A\'$ صورة $A$ بالدوران الذي مركزه $O$ وزاويته $50^\\circ$ في الاتجاه المباشر؟ اكتب خطوات الطريقة بالترتيب.',
        summary: 'نرسم نصف المستقيم [OA)، ثم بالمنقلة نصف المستقيم [Ox) بالزاوية المطلوبة في الاتجاه المطلوب، ثم بالمدور النقطة A′ على [Ox) حيث OA′ = OA.',
        body: <Body lines={METHOD_POINT.solution} source={METHOD_POINT.source} />,
      },
      {
        id: 'tariqat-qitaa', type: 'methodes', title: 'إنشاء صورة قطعة',
        memo: {
          rule: `[AB]\\to[A'B']\\ ,\\ ${R("A'B'=AB")}`,
          hook: 'صورتا الطرفين تكفيان',
          example: `[AB]\\to[${R("A'B'")}]`,
          trap: 'إدارة كل نقط القطعة بدل طرفيها فقط',
          exam: 'ابنِ صورتي الطرفين ثم صل بينهما',
          chip: `[AB]\\to[A'B']`,
          quiz: [
            { q: 'لإنشاء صورة قطعة يكفي إنشاء صورة:', options: ['طرفيها', 'منتصفها فقط', 'أحد طرفيها'], correct: 0 },
            { q: 'القطعة وصورتها بدوران:', options: ['متقايستان', 'مختلفتان في الطول', 'متوازيتان دائما'], correct: 0 },
          ],
        },
        predictPrompt: 'في الشكل قطعة $[AB]$ ونقطة $O$. في نشاط 3 أنشأت صورة قطعة بزاوية $72^\\circ$. كيف تنشئ صورة $[AB]$ بالدوران الذي مركزه $O$ وزاويته $40^\\circ$ في الاتجاه غير المباشر، دون أن تدير كل نقطها؟ اكتب الطريقة.',
        summary: 'لإنشاء صورة قطعة مستقيم بدوران يكفي إنشاء صورتي طرفيها ورسم القطعة المحدّدة بالصورتين.',
        body: <Body lines={[METHOD_SEGMENT.rule]} source={METHOD_SEGMENT.source} />,
      },
      {
        id: 'suwar-ashkal', type: 'regles', title: 'صور القطعة والمستقيم والدائرة',
        memo: {
          rule: `(W,r)\\to(${R("W'")},r)`,
          hook: 'الدوران يحرّك المركز ويحفظ الطول',
          example: `(W\\ ;\\ 1{,}5)\\to(${R("W'")}\\ ;\\ 1{,}5)`,
          trap: 'إبقاء مركز الدائرة في مكانه',
          exam: 'مركز الصورة هو صورة المركز ونصف القطر هو نفسه',
          chip: `(W,r)\\to(${R("W'")},r)`,
          quiz: [
            { q: 'صورة دائرة بدوران هي دائرة:', options: ['مركزها صورة المركز ونصف قطرها نفسه', 'مركزها المركز نفسه', 'مركزها صورة المركز ونصف قطرها يتغير'], correct: 0 },
            { q: 'صورة قطعة طولها $4$ بدوران:', options: ['قطعة طولها $4$', 'قطعة طولها $4+\\alpha$', 'قطعة توازي الأصلية دائما'], correct: 0 },
          ],
        },
        predictPrompt: 'في نشاط 3 أنشأت بزاوية $72^\\circ$ صور قطعة ومستقيم ونصف مستقيم ودائرة. لكل شكل: ما نوع صورته؟ ما الذي يبقى محفوظًا؟ وأيّ النقط تكفي لإنشائها؟ اكتب القاعدة.',
        summary: 'صورة قطعة قطعة لها نفس الطول، وصورة مستقيم مستقيم يكفي لإنشائه صورتا نقطتين منه، وصورة نصف مستقيم نصف مستقيم مبدؤه صورة المبدأ، وصورة دائرة دائرة مركزها صورة المركز ولها نفس نصف القطر.',
        body: <Body lines={[ACTIVITY_3_LINES.segment, ACTIVITY_3_LINES.line2, ACTIVITY_3_LINES.ray, ACTIVITY_3_LINES.circle]} source={ACTIVITY_3.source} />,
      },
    ],
  },
};
