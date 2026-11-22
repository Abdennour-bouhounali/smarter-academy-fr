import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Le manuel n'a pas
 * d'item d'évaluation pour ce sujet : cinq épreuves de la PLATEFORME, chacune sur le modèle d'un moment de
 * la leçon, avec d'autres nombres. Chaque épreuve évalue UN point : P1 (E1, E2), P2 (E3, E4, E5).
 * Chaque distracteur est faux.
 *   E1  150DA une fois + 250DA par sandwich → 250x + 150
 *   E2  120x + 800 = 2240 → 120x = 1440 → x = 12
 *   E3  60x + 900 = 150x → 900 = 90x → x = 10
 *   E4  croisement (8 ; 2400), A en dessous avant 8 → B moins chère après 8 (donc à 12)
 *   E5  40x + 1200 < 100x → 1200 < 60x → x > 20
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;
const SRC = addition('interactive_example');

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="5 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        namdhaja: { label: 'نمذجة تكلفة بدالة تآلفية', module: 1 },
        mufadala: { label: 'المفاضلة بين صيغتين', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'namdhaja', requires: ['namdhaja-taalufiya'],
          prompt: <Q source={SRC}>تطبيق لتوصيل الأكل: 150DA للتوصيل تُدفع مرّة واحدة، و 250DA لكل شطيرة. نسمّي <MathText>{'$x$'}</MathText> عدد الشطائر. المبلغ الذي يُدفع هو:</Q>,
          options: [M('$f(x) = 250x + 150$'), M('$f(x) = 150x + 250$'), M('$f(x) = 400x$'), M('$f(x) = 250x$')],
          correct: 0, cols: 2,
          explain: <MathText>{'التوصيل جزء ثابت $b = 150$ يُدفع مرّة واحدة، وثمن الشطيرة $a = 250$ يُدفع $x$ مرّة: $f(x) = 250x + 150$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-taalufi_P1'] },
        },
        {
          id: 'E2', skill: 'namdhaja', requires: ['sura-fi-wadiya'],
          prompt: <Q source={SRC}>في قاعة ألعاب تربوية بالحيّ: بطاقة شهرية 800DA ثم 120DA للساعة. دفع أيمن هذا الشهر 2240DA. كم ساعة لعب؟</Q>,
          options: ['12 ساعة', '19 ساعة', '6 ساعات', '14 ساعة'],
          correct: 0, cols: 2,
          explain: <MathText>{'$120x + 800 = 2240$ أي $120x = 1440$ ومنه $x = 12$ : لعب 12 ساعة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-taalufi_P1'] },
        },
        {
          id: 'E3', skill: 'mufadala', requires: ['tasawi-taqatu'],
          prompt: <Q source={SRC}>صيغتان للكراء: <MathText>{'$f(x) = 60x + 900$'}</MathText> و <MathText>{'$g(x) = 150x$'}</MathText> ، حيث <MathText>{'$x$'}</MathText> عدد الساعات. تتساوى التكلفتان من أجل:</Q>,
          options: [M('$x = 10$'), M('$x = 6$'), M('$x = 15$'), M('$x = 5$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$60x + 900 = 150x$ أي $900 = 90x$ ومنه $x = 10$ ، و $f(10) = g(10) = 1500$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-taalufi_P2'] },
        },
        {
          id: 'E4', skill: 'mufadala', requires: ['sigha-afdal', 'qiraa-bayaniya-taalufiya'],
          prompt: <Q source={SRC}>مستقيما صيغتين A و B يتقاطعان في النقطة <MathText>{'$(8 ; 2400)$'}</MathText> ، وقبل الفاصلة 8 يقع مستقيم A تحت مستقيم B. من أجل 12 وحدة، الصيغة الأرخص هي:</Q>,
          options: ['الصيغة A', 'الصيغة B', 'الصيغتان متساويتان', 'لا يمكن معرفة ذلك'],
          correct: 1, cols: 2, keepOrder: true,
          explain: 'المستقيمان يتبادلان الموضع عند نقطة التقاطع: بعد الفاصلة 8 يقع مستقيم B تحت مستقيم A، فالصيغة B أرخص من أجل 12 وحدة.',
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-taalufi_P2'] },
        },
        {
          id: 'E5', skill: 'mufadala', requires: ['sigha-afdal'],
          prompt: <Q source={SRC}>بطاقة لقاعة رياضة: <MathText>{'$f(x) = 40x + 1200$'}</MathText> ، ودون بطاقة: <MathText>{'$g(x) = 100x$'}</MathText> . البطاقة أرخص عندما:</Q>,
          options: [M('$x > 20$'), M('$x < 20$'), M('$x > 30$'), 'دائمًا'],
          correct: 0, cols: 2,
          explain: <MathText>{'$40x + 1200 < 100x$ أي $1200 < 60x$ ومنه $x > 20$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tarrid-taalufi_P2'] },
        },
      ]}
      badges={[
        { id: 'namdhaja', emoji: '🧾', label: 'من الوضعية إلى الدالة', test: (m) => (m.namdhaja ?? 0) === 0 },
        { id: 'mufadala', emoji: '⚖️', label: 'الصيغة المناسبة', test: (m) => (m.mufadala ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت ترييض الوضعيات بالدالة التآلفية',
        title: 'انتهى الدرس 5',
        message: 'تعرف الآن كيف تنمذج تكلفة بجزء ثابت وجزء متغير بدالة تآلفية، وكيف تقارن صيغتين بمعادلة ومتراجحة وبالتمثيل البياني، ثم تختار الأفضل بحسب قيمة المتغير.',
        verbs: ['أنمذج', 'أحسب', 'أقارن', 'أختار'],
        masterBadgeLabel: 'ترييض بالدالة التآلفية',
      }}
    />
  );
}
