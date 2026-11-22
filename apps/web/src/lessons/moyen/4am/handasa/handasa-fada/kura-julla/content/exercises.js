/**
 * Les exercices de « أوظّف تعلّماتي » du درس « الكرة والجلة » — le scan de l'unité s'arrête p. 169 : AUCUNE page d'exercices
 * (extraction › discrepancies « objectives / missing_page »). Ce sont donc des exercices DÉCLARÉS de la plateforme
 * (`addition('interaction_generation')`, label « مثال تفاعلي إضافي »), un par compétence du درس : sur / dans / hors à partir de
 * coordonnées (P4), le قطر et le rayon (P2), دوائر كبرى / صغرى (P2), représenter un point (P3, P4), la كرة engendrée par une
 * دائرة qui tourne (P2). Contextes algériens ; aucun ne reprend un nombre du إختبار أولي. Tous les distracteurs sont FAUX (la
 * confusion qu'ils portent est dite en commentaire).
 */
import { addition } from '../../_unit/unitMeta.js';

export const LP = {
  P1: '4am_kura-julla_P1',
  P2: '4am_kura-julla_P2',
  P3: '4am_kura-julla_P3',
  P4: '4am_kura-julla_P4',
};

const SRC = addition('interaction_generation');
const WHERE = ['على الكرة $(\\delta)$', 'داخل الجلة $(\\beta)$ وليست على الكرة', 'خارج الجلة $(\\beta)$'];

export const EXERCISES = [
  {
    id: 'aw-1', source: SRC, learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'في القبة السماوية (البلانيتاريوم) بمدينة العلوم التي يزورها التلاميذ طلبا للعلم، نمثّل القبة بكرة $(\\delta)$ مركزها O ونصف قطرها $5\\,\\mathrm{m}$ ، و $(\\beta)$ الجلة المعيّنة بها. في معلم متعامد ومتجانس للفضاء مبدؤه O (الوحدة: المتر)، لكل نقطة $M(x\\,;\\,y\\,;\\,z)$ : $OM^2 = x^2 + y^2 + z^2$ .',
    interaction: 'batch',
    question: {
      prompt: 'أين تقع كل نقطة؟',
      rows: [
        // F : 9 + 16 + 0 = 25 ; « داخل » : les coordonnées 3 et 4 sont plus petites que 5 (MISC-KURA-MASAFA)
        { label: 'مصباح في الموضع $F(3\\,;\\,4\\,;\\,0)$', options: WHERE, correct: 0, correction: '$OF^2 = 9 + 16 + 0 = 25 = 5^2$ : F على الكرة.' },
        // G : 1 + 4 + 4 = 9 < 25 ; « على الكرة » : 1 + 2 + 2 = 5 (on additionne les coordonnées)
        { label: 'جهاز العرض في الموضع $G(1\\,;\\,2\\,;\\,2)$', options: WHERE, correct: 1, correction: '$OG^2 = 1 + 4 + 4 = 9 < 25$ : $OG = 3 < 5$ ، G داخل الجلة وليست على الكرة.' },
        // H : 16 + 9 + 1 = 26 > 25 ; « داخل » : chaque coordonnée est < 5
        { label: 'هوائي في الموضع $H(4\\,;\\,3\\,;\\,1)$', options: WHERE, correct: 2, correction: '$OH^2 = 16 + 9 + 1 = 26 > 25$ : H خارج الجلة.' },
      ],
      explain: 'نحسب $OM^2$ ونقارنه بـ $R^2 = 25$ : المساواة تعني «على الكرة»، الأصغر «داخل الجلة»، الأكبر «خارج الجلة».',
    },
    commonError: 'الحكم من الإحداثيات وحدها («كل إحداثية أصغر من 5 إذن النقطة داخلها») دون حساب $OM^2$ .',
  },
  {
    id: 'aw-2', source: SRC, learningPointId: LP.P2, difficulty: 'facile',
    statement: 'كرة يد مركزها O، و $[EF]$ قطر لها طوله $18\\,\\mathrm{cm}$ .',
    interaction: 'numeric',
    question: {
      prompt: 'ما هو نصف قطر الكرة بالسنتيمتر؟',
      expected: 9,
      explain: 'القطر يمر بالمركز O وطوله $2R$ : $2R = 18$ ، إذن $R = 9\\,\\mathrm{cm}$ .',
    },
    commonError: 'أخذ طول القطر نصفَ قطرٍ ($R = 18$) أو ضربه في 2: القطر يساوي $2R$ .',
  },
  {
    id: 'aw-3', source: SRC, learningPointId: LP.P2, difficulty: 'moyen',
    statement: 'كرة أرضية مدرسية (مجسّم الكرة الأرضية) مركزها O ونصف قطرها $15\\,\\mathrm{cm}$ ، محورها $[NS]$ .',
    interaction: 'batch',
    question: {
      prompt: 'كبرى أم صغرى؟',
      rows: [
        // l'équateur : centre O, rayon R
        { label: 'دائرة خط الاستواء (مركزها O)', options: ['دائرة كبرى', 'دائرة صغرى'], correct: 0, correction: 'مركزها O ونصف قطرها $15\\,\\mathrm{cm} = R$ : دائرة كبرى.' },
        // un parallèle : centre sur [NS] mais ≠ O (MISC-KURA-DAIRA-KUBRA)
        { label: 'دائرة عرض مركزها $O_1$ على المحور حيث $OO_1 = 9\\,\\mathrm{cm}$', options: ['دائرة كبرى', 'دائرة صغرى'], correct: 1, correction: 'مركزها $O_1$ يختلف عن O: دائرة صغرى (نصف قطرها أصغر من $15\\,\\mathrm{cm}$).' },
        // un méridien passe par N et S, son plan contient O
        { label: 'دائرة طول تمر بالقطبين N و S', options: ['دائرة كبرى', 'دائرة صغرى'], correct: 0, correction: 'مستويها يشمل المحور $[NS]$ فيشمل O: مركزها O ونصف قطرها R، دائرة كبرى.' },
      ],
      explain: 'الدائرة الكبرى مركزها مركز الكرة ونصف قطرها R؛ كل دائرة من الكرة مركزها يختلف عن O دائرة صغرى.',
    },
    commonError: 'اعتبار كل دائرة مرسومة على الكرة دائرة كبرى.',
  },
  {
    id: 'aw-4', source: SRC, learningPointId: LP.P4, difficulty: 'moyen',
    statement: 'رسم أمين، بإتقان وصبر، كرة مركزها O (دائرة كفاف وشكل بيضوي)، ويريد أن يمثّل النقطة B من الجلة حيث $OB < R$ .',
    interaction: 'choice',
    question: {
      prompt: 'كيف يمثّل B؟',
      options: [
        'يرسم نصف قطر $[OM]$ للكرة ويضع B عليه، ثم يرسم إحدى الدوائر الكبرى ذات نصف القطر $[OM]$',
        // B posé sur le contour : le contour est un grand cercle, OB = R (MISC-KURA-JULLA)
        'يضع B على الدائرة الكفاف',
        // une petite دائرة quelconque par B ne situe pas B dans l'espace
        'يرسم دائرة صغرى كيفية تمر بـ B',
      ],
      correct: 0, cols: 1,
      explain: 'طريقة الكتاب: لتمثيل نقطة على كرة أو داخلها نستعمل إحدى الدوائر الكبرى؛ B داخل الجلة فتقع على نصف قطر $[OM]$ منها.',
    },
    commonError: 'وضع B على الكفاف: كل نقطة من الكفاف على الكرة ($OM = R$)، و B داخلها.',
  },
  {
    id: 'aw-5', source: SRC, learningPointId: LP.P2, difficulty: 'facile',
    statement: 'في ورشة الفنون، يتعاون ريّان مع زملائه في إنجاز مجسّم، فيدير قرصا دائريا من الورق المقوّى مركزه O ونصف قطره $6\\,\\mathrm{cm}$ بسرعة حول أحد أقطاره.',
    interaction: 'choice',
    question: {
      prompt: 'الدائرة التي تحدّ القرص تولّد بهذا الدوران:',
      options: [
        'كرة مركزها O ونصف قطرها $6\\,\\mathrm{cm}$',
        // le diamètre pris pour le rayon (MISC-KURA-QUTR)
        'كرة مركزها O ونصف قطرها $12\\,\\mathrm{cm}$',
        // le centre déplacé au bout du diamètre
        'كرة مركزها طرف القطر ونصف قطرها $6\\,\\mathrm{cm}$',
      ],
      correct: 0, cols: 1,
      explain: 'عند تدوير دائرة مركزها O ونصف قطرها R حول أحد أقطارها يتولّد من هذا الدوران كرة مركزها O ونصف قطرها R.',
    },
  },
];

export const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
