/**
 * Les exercices du MANUEL rattachés au درس 4 de l'unité 2 (couverture :
 * extraction.json → destinations) : أوظّف تعلّماتي 15, 16, 17 (p. 26–27),
 * 20, 21 (p. 27) et أتعمّق 33 (p. 29). Énoncés au mot près, nombres du livre.
 *
 * Chaque item d'un exercice est une LIGNE d'un `batch` : les réponses sont
 * des racines, des décimaux ou des fractions, et chaque distracteur est FAUX,
 * construit sur une erreur réelle (racine d'un seul facteur, racine oubliée,
 * virgule mal placée, √(a + b) = √a + √b…). Les options sont des chaînes
 * `$…$` : le module les rend par MathText.
 */
import { src } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_amaliyat-judhur_P1',
  P2: '4am_amaliyat-judhur_P2',
  P3: '4am_amaliyat-judhur_P3',
};

const row = (label, options, correct, correction) => ({ label, options, correct, ...(correction ? { correction } : {}) });

export const EXERCISES = [
  {
    id: 'ex-15', source: src('ex-15', 26, 'أوظّف تعلّماتي', 15), learningPointId: LP.P1, difficulty: 'facile',
    group: 'استعمال المساواة $\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}$',
    statement: 'احسب ما يلي:',
    interaction: 'batch',
    question: {
      rows: [
        row('$\\sqrt{9 \\times 81}$', ['$27$', '$243$', '$729$'], 0, '$\\sqrt{9} \\times \\sqrt{81} = 3 \\times 9 = 27$'),
        row('$\\sqrt{121 \\times 100}$', ['$1100$', '$110$', '$12100$'], 1, '$\\sqrt{121} \\times \\sqrt{100} = 11 \\times 10 = 110$'),
        row('$\\sqrt{16 \\times 900}$', ['$3600$', '$1200$', '$120$'], 2, '$\\sqrt{16} \\times \\sqrt{900} = 4 \\times 30 = 120$'),
        row('$\\sqrt{10^2 \\times 10^4}$', ['$1000$', '$1000000$', '$100000$'], 0, '$\\sqrt{10^2} \\times \\sqrt{10^4} = 10 \\times 10^2 = 1000$'),
        row('$\\sqrt{\\dfrac{1}{4} \\times 10^6}$', ['$250$', '$500$', '$250000$'], 1, '$\\sqrt{\\dfrac{1}{4}} \\times \\sqrt{10^6} = \\dfrac{1}{2} \\times 1000 = 500$'),
        row('$\\sqrt{1{,}44 \\times 0{,}25}$', ['$0{,}36$', '$0{,}06$', '$0{,}6$'], 2, '$\\sqrt{1{,}44} \\times \\sqrt{0{,}25} = 1{,}2 \\times 0{,}5 = 0{,}6$'),
      ],
      explain: 'نكتب $\\sqrt{a \\times b} = \\sqrt{a} \\times \\sqrt{b}$ ونحسب جذر كل عامل.',
    },
    method: 'نكتب $\\sqrt{a \\times b} = \\sqrt{a} \\times \\sqrt{b}$ ونحسب جذر كل عامل.',
    commonError: 'حساب جذر أحد العاملين فقط ($3 \\times 81 = 243$) أو نسيان الجذر كليًّا ($9 \\times 81 = 729$).',
  },
  {
    id: 'ex-16', source: src('ex-16', 26, 'أوظّف تعلّماتي', 16), learningPointId: LP.P1, difficulty: 'moyen',
    group: 'استعمال المساواة $\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}$',
    statement: 'احسب ما يلي:',
    interaction: 'batch',
    question: {
      rows: [
        row('$\\sqrt{0{,}01 \\times 64}$', ['$0{,}8$', '$0{,}08$', '$0{,}64$'], 0, '$\\sqrt{0{,}01} \\times \\sqrt{64} = 0{,}1 \\times 8 = 0{,}8$'),
        row('$\\sqrt{0{,}81 \\times 0{,}0001}$', ['$0{,}09$', '$0{,}009$', '$0{,}0009$'], 1, '$\\sqrt{0{,}81} \\times \\sqrt{0{,}0001} = 0{,}9 \\times 0{,}01 = 0{,}009$'),
        row('$\\sqrt{2{,}56 \\times 0{,}16}$', ['$6{,}4$', '$0{,}064$', '$0{,}64$'], 2, '$\\sqrt{2{,}56} \\times \\sqrt{0{,}16} = 1{,}6 \\times 0{,}4 = 0{,}64$'),
        row('$\\sqrt{5{,}76 \\times 0{,}0144}$', ['$2{,}88$', '$0{,}288$', '$0{,}0288$'], 1, '$\\sqrt{5{,}76} \\times \\sqrt{0{,}0144} = 2{,}4 \\times 0{,}12 = 0{,}288$'),
      ],
      explain: 'جذر عدد عشري: $\\sqrt{0{,}01} = 0{,}1$ لأن $0{,}1^2 = 0{,}01$ ، و $\\sqrt{0{,}0001} = 0{,}01$ لأن $0{,}01^2 = 0{,}0001$.',
    },
    method: 'نكتب الجذر جداءً لجذرين، ونتحقق من موضع الفاصلة بالتربيع.',
    commonError: 'الخطأ في موضع الفاصلة: $\\sqrt{0{,}0001} = 0{,}01$ لا $0{,}001$.',
  },
  {
    id: 'ex-17', source: src('ex-17', 27, 'أوظّف تعلّماتي', 17), learningPointId: LP.P1, difficulty: 'moyen',
    group: 'استعمال المساواة $\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}$',
    statement: 'احسب ما يلي:',
    interaction: 'batch',
    question: {
      rows: [
        row('$\\sqrt{2} \\times \\sqrt{50}$', ['$10$', '$\\sqrt{52}$', '$100$'], 0, '$\\sqrt{2 \\times 50} = \\sqrt{100} = 10$'),
        row('$\\sqrt{32} \\times \\sqrt{2}$', ['$\\sqrt{34}$', '$64$', '$8$'], 2, '$\\sqrt{32 \\times 2} = \\sqrt{64} = 8$'),
        row('$\\sqrt{3} \\times \\sqrt{48}$', ['$12$', '$144$', '$\\sqrt{51}$'], 0, '$\\sqrt{3 \\times 48} = \\sqrt{144} = 12$'),
        row('$\\sqrt{125} \\times \\sqrt{5}$', ['$\\sqrt{130}$', '$25$', '$625$'], 1, '$\\sqrt{125 \\times 5} = \\sqrt{625} = 25$'),
        row('$\\sqrt{0{,}04 \\times 0{,}09}$', ['$0{,}6$', '$0{,}06$', '$0{,}0036$'], 1, '$\\sqrt{0{,}04} \\times \\sqrt{0{,}09} = 0{,}2 \\times 0{,}3 = 0{,}06$'),
      ],
      explain: 'في الاتجاه الآخر: $\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}$ ، ثم نعرف جذر الجداء.',
    },
    method: 'نجمع الجذرين في جذر واحد: $\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}$.',
    commonError: 'جمع العددين تحت الجذر بدل ضربهما: $\\sqrt{2} \\times \\sqrt{50} \\neq \\sqrt{52}$.',
  },
  {
    id: 'ex-20', source: src('ex-20', 27, 'أوظّف تعلّماتي', 20), learningPointId: LP.P2, difficulty: 'facile',
    group: 'استعمال المساواة $\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{\\sqrt{b}}$',
    statement: 'اكتب كل عدد مما يلي على شكل كسر.',
    interaction: 'batch',
    question: {
      rows: [
        row('$\\sqrt{\\dfrac{49}{16}}$', ['$\\dfrac{7}{4}$', '$\\dfrac{49}{4}$', '$\\dfrac{7}{16}$'], 0, '$\\dfrac{\\sqrt{49}}{\\sqrt{16}} = \\dfrac{7}{4}$'),
        row('$\\sqrt{\\dfrac{36}{81}}$', ['$\\dfrac{6}{81}$', '$\\dfrac{2}{3}$', '$\\dfrac{4}{9}$'], 1, '$\\dfrac{\\sqrt{36}}{\\sqrt{81}} = \\dfrac{6}{9} = \\dfrac{2}{3}$'),
        row('$\\sqrt{\\dfrac{1}{324}}$', ['$\\dfrac{1}{162}$', '$\\dfrac{1}{324}$', '$\\dfrac{1}{18}$'], 2, '$\\dfrac{\\sqrt{1}}{\\sqrt{324}} = \\dfrac{1}{18}$'),
        row('$\\sqrt{\\dfrac{12100}{900}}$', ['$\\dfrac{11}{3}$', '$\\dfrac{121}{9}$', '$\\dfrac{11}{30}$'], 0, '$\\dfrac{\\sqrt{12100}}{\\sqrt{900}} = \\dfrac{110}{30} = \\dfrac{11}{3}$'),
        row('$\\sqrt{\\dfrac{1}{2500}}$', ['$\\dfrac{1}{250}$', '$\\dfrac{1}{50}$', '$\\dfrac{1}{500}$'], 1, '$\\dfrac{\\sqrt{1}}{\\sqrt{2500}} = \\dfrac{1}{50}$'),
        row('$\\sqrt{\\dfrac{4900}{32400}}$', ['$\\dfrac{49}{324}$', '$\\dfrac{7}{180}$', '$\\dfrac{7}{18}$'], 2, '$\\dfrac{\\sqrt{4900}}{\\sqrt{32400}} = \\dfrac{70}{180} = \\dfrac{7}{18}$'),
      ],
      explain: 'نكتب $\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{\\sqrt{b}}$ ، ثم نختزل الكسر.',
    },
    method: 'نحسب جذر البسط وجذر المقام، ثم نختزل.',
    commonError: 'نسيان جذر البسط أو المقام: $\\sqrt{\\dfrac{49}{16}} \\neq \\dfrac{49}{4}$.',
  },
  {
    id: 'ex-21', source: src('ex-21', 27, 'أوظّف تعلّماتي', 21), learningPointId: LP.P2, difficulty: 'moyen',
    group: 'استعمال المساواة $\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{\\sqrt{b}}$',
    statement: 'بسّط كل عدد مما يلي واعط النتيجة على شكل كسر.',
    interaction: 'batch',
    question: {
      rows: [
        row('$\\dfrac{\\sqrt{2}}{\\sqrt{18}}$', ['$\\dfrac{1}{9}$', '$\\dfrac{1}{3}$', '$3$'], 1, '$\\sqrt{\\dfrac{2}{18}} = \\sqrt{\\dfrac{1}{9}} = \\dfrac{1}{3}$'),
        row('$\\dfrac{\\sqrt{3}}{\\sqrt{48}}$', ['$\\dfrac{1}{4}$', '$\\dfrac{1}{16}$', '$4$'], 0, '$\\sqrt{\\dfrac{3}{48}} = \\sqrt{\\dfrac{1}{16}} = \\dfrac{1}{4}$'),
        row('$\\dfrac{\\sqrt{2}}{\\sqrt{32}}$', ['$\\dfrac{1}{16}$', '$\\dfrac{1}{8}$', '$\\dfrac{1}{4}$'], 2, '$\\sqrt{\\dfrac{2}{32}} = \\sqrt{\\dfrac{1}{16}} = \\dfrac{1}{4}$'),
        row('$\\dfrac{\\sqrt{400}}{\\sqrt{900}}$', ['$\\dfrac{4}{9}$', '$\\dfrac{2}{3}$', '$\\dfrac{3}{2}$'], 1, '$\\dfrac{20}{30} = \\dfrac{2}{3}$'),
        row('$\\dfrac{\\sqrt{6875}}{\\sqrt{1100}}$', ['$\\dfrac{5}{2}$', '$\\dfrac{25}{4}$', '$\\dfrac{2}{5}$'], 0, '$\\sqrt{\\dfrac{6875}{1100}} = \\sqrt{\\dfrac{25}{4}} = \\dfrac{5}{2}$'),
        row('$\\dfrac{\\sqrt{7}}{\\sqrt{448}}$', ['$\\dfrac{1}{64}$', '$8$', '$\\dfrac{1}{8}$'], 2, '$\\sqrt{\\dfrac{7}{448}} = \\sqrt{\\dfrac{1}{64}} = \\dfrac{1}{8}$'),
      ],
      explain: 'نجمع الجذرين في جذر واحد: $\\dfrac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\dfrac{a}{b}}$ ، نختزل الكسر تحت الجذر، ثم نحسب الجذر.',
    },
    method: 'نكتب $\\dfrac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\dfrac{a}{b}}$ ونختزل $\\dfrac{a}{b}$ قبل حساب الجذر.',
    commonError: 'نسيان الجذر بعد الاختزال: $\\dfrac{\\sqrt{2}}{\\sqrt{18}} = \\sqrt{\\dfrac{1}{9}} = \\dfrac{1}{3}$ ، لا $\\dfrac{1}{9}$.',
  },
  {
    id: 'ex-33', source: src('ex-33', 29, 'أتعمّق', 33), learningPointId: LP.P2, difficulty: 'difficile',
    statement: 'طريقة لإنشاء العدد $\\dfrac{1 + \\sqrt{5}}{2}$ الذي يسمّى العدد الذهبي. AED مثلث قائم في A حيث $AE = \\dfrac{1}{2}AD$ .',
    items: [
      '1) احسب القيمة المضبوطة للطول ED.',
      '2) أنشئ على نصف المستقيم [AE) النقطة B حيث EB = ED، ثم النقطة C حيث ABCD مستطيل.',
      '3) تحقّق أنّ القيمة المضبوطة للطول AB هي $\\dfrac{1 + \\sqrt{5}}{2}$ .',
      '4) اعط ملخصا لطريقة إنشاء العدد الذهبي باستعمال المسطرة والمدور.',
    ],
    // Le shéma du manuel : AD = 1 ، AE = 1/2 (extraction.json → figure).
    figure: { AD: 1, AE: '1/2' },
    interaction: 'batch',
    question: {
      prompt: 'في الشكل $AD = 1$ و $AE = \\dfrac{1}{2}$.',
      rows: [
        row('1) $ED =$', ['$\\dfrac{\\sqrt{5}}{2}$', '$\\dfrac{3}{2}$', '$\\dfrac{5}{4}$'], 0, '$ED^2 = AD^2 + AE^2 = 1 + \\dfrac{1}{4} = \\dfrac{5}{4}$ ، إذن $ED = \\dfrac{\\sqrt{5}}{\\sqrt{4}} = \\dfrac{\\sqrt{5}}{2}$'),
        row('3) $AB =$', ['$\\dfrac{\\sqrt{6}}{2}$', '$\\dfrac{1 + \\sqrt{5}}{2}$', '$1 + \\dfrac{\\sqrt{5}}{2}$'], 1, '$AB = AE + EB = \\dfrac{1}{2} + \\dfrac{\\sqrt{5}}{2} = \\dfrac{1 + \\sqrt{5}}{2}$'),
      ],
      explain: 'حسب خاصية فيثاغورس $ED^2 = \\dfrac{5}{4}$ ، و $\\sqrt{\\dfrac{5}{4}} = \\dfrac{\\sqrt{5}}{\\sqrt{4}} = \\dfrac{\\sqrt{5}}{2}$. ثم $AB = AE + EB = AE + ED$. الملخّص: نرسم مثلثًا قائمًا ضلعاه القائمان 1 و $\\dfrac{1}{2}$ ، ونرسم بالمدوّر قوسًا مركزه E ونصف قطره ED يقطع $[AE)$ في B.',
    },
    method: 'نحسب الوتر بخاصية فيثاغورس، ثم نكتب $\\sqrt{\\dfrac{5}{4}} = \\dfrac{\\sqrt{5}}{\\sqrt{4}}$.',
    commonError: 'كتابة $ED = \\sqrt{1} + \\sqrt{\\dfrac{1}{4}} = \\dfrac{3}{2}$: الجذر لا يتوزّع على الجمع.',
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
