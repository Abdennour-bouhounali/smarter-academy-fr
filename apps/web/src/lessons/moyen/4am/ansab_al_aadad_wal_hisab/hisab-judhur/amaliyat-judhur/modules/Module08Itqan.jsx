import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { src } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la
 * leçon. Six épreuves : QCM 8 et 9 de « أؤكّد تعلّماتي » (p. 28), deux
 * exemples de معارف 4 (p. 24) et les deux calculs de l'activité 4 (p. 21).
 * QCM 9 a DEUX bonnes réponses dans le manuel (1/√28 et 1/(2√7)) : elles
 * sont réunies en UNE option exclusive, et les distracteurs restent faux.
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const m = (tex) => <MathText key={tex}>{tex}</MathText>;

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="ستة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="7 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={7 * 60}
      timerLabel="7 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الستة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        jidaa: { label: 'جداء جذرين تربيعيين', module: 1 },
        qisma: { label: 'حاصل قسمة جذرين تربيعيين', module: 1 },
        jam: { label: 'لا مساواة في الجمع والطرح', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'jidaa', requires: ['jidaa-jidhrayn'],
          prompt: <Q source={src('know-4', 24, 'معارف', 4)}>العدد <MathText>{'$\\sqrt{0{,}9} \\times \\sqrt{0{,}4}$'}</MathText> يساوي ...</Q>,
          options: ['$0{,}06$', '$0{,}6$', '$\\sqrt{1{,}3}$', '$0{,}36$'].map(m),
          optionLabel: (i) => ['0,06', '0,6', '√1,3', '0,36'][i],
          correct: 1, cols: 2,
          explain: <MathText>{'$\\sqrt{0{,}9 \\times 0{,}4} = \\sqrt{0{,}36} = 0{,}6$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_amaliyat-judhur_P1'] },
        },
        {
          id: 'E2', skill: 'jidaa', requires: ['jidaa-jidhrayn', 'jidhr-a2b'],
          prompt: <Q source={src('know-4', 24, 'معارف', 4)}>العدد <MathText>{'$\\sqrt{28}$'}</MathText> يساوي ...</Q>,
          options: ['$4\\sqrt{7}$', '$7\\sqrt{2}$', '$14$', '$2\\sqrt{7}$'].map(m),
          optionLabel: (i) => ['4√7', '7√2', '14', '2√7'][i],
          correct: 3, cols: 2,
          explain: <MathText>{'$\\sqrt{28} = \\sqrt{4 \\times 7} = \\sqrt{4} \\times \\sqrt{7} = 2\\sqrt{7}$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_amaliyat-judhur_P1'] },
        },
        {
          id: 'E3', skill: 'qisma', requires: ['qismat-jidhrayn'],
          prompt: <Q source={src('qcm', 28, 'أؤكّد تعلّماتي', 8)}>العدد <MathText>{'$\\sqrt{\\dfrac{9}{25}}$'}</MathText> يبسط على الشكل......</Q>,
          options: ['$\\dfrac{81}{625}$', '$\\dfrac{3}{5}$', '$\\dfrac{5}{3}$'].map(m),
          optionLabel: (i) => ['81/625', '3/5', '5/3'][i],
          correct: 1, cols: 3,
          explain: <MathText>{'$\\sqrt{\\dfrac{9}{25}} = \\dfrac{\\sqrt{9}}{\\sqrt{25}} = \\dfrac{3}{5}$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_amaliyat-judhur_P2'] },
        },
        {
          id: 'E4', skill: 'qisma', requires: ['qismat-jidhrayn', 'jidhr-a2b'],
          prompt: <Q source={src('qcm', 28, 'أؤكّد تعلّماتي', 9)}>العدد <MathText>{'$\\sqrt{\\dfrac{1}{28}}$'}</MathText> يكتب ........</Q>,
          options: [
            <span key="a">الكتابتان <MathText>{'$\\dfrac{1}{\\sqrt{28}}$'}</MathText> و <MathText>{'$\\dfrac{1}{2\\sqrt{7}}$'}</MathText> صحيحتان</span>,
            <span key="b"><MathText>{'$\\sqrt{28}$'}</MathText> فقط</span>,
            <span key="c"><MathText>{'$\\dfrac{1}{\\sqrt{28}}$'}</MathText> فقط، أما <MathText>{'$\\dfrac{1}{2\\sqrt{7}}$'}</MathText> فخاطئة</span>,
          ],
          optionLabel: (i) => ['الكتابتان 1/√28 و 1/(2√7) صحيحتان', '√28 فقط', '1/√28 فقط'][i],
          correct: 0, cols: 1,
          explain: <MathText>{'$\\sqrt{\\dfrac{1}{28}} = \\dfrac{\\sqrt{1}}{\\sqrt{28}} = \\dfrac{1}{\\sqrt{28}}$ و $\\sqrt{28} = 2\\sqrt{7}$ ، إذن $\\sqrt{\\dfrac{1}{28}} = \\dfrac{1}{2\\sqrt{7}}$ أيضًا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_amaliyat-judhur_P2'] },
        },
        {
          id: 'E5', skill: 'jam', requires: ['la-tawzi-jam'],
          prompt: <Q source={src('act-4c', 21, 'أنشطة', 4)}>العدد <MathText>{'$\\sqrt{16 + 9}$'}</MathText> يساوي ...</Q>,
          options: ['$7$', '$\\sqrt{16} + \\sqrt{9}$', '$5$', '$25$'].map(m),
          optionLabel: (i) => ['7', '√16 + √9', '5', '25'][i],
          correct: 2, cols: 2,
          explain: <MathText>{'$\\sqrt{16 + 9} = \\sqrt{25} = 5$ ، أما $\\sqrt{16} + \\sqrt{9} = 4 + 3 = 7$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_amaliyat-judhur_P3'] },
        },
        {
          id: 'E6', skill: 'jam', requires: ['la-tawzi-jam'],
          prompt: <Q source={src('act-4c', 21, 'أنشطة', 4)}>أي مساواة صحيحة؟</Q>,
          options: ['$\\sqrt{100 - 36} = \\sqrt{100} - \\sqrt{36}$', '$\\sqrt{100 - 36} = 8$', '$\\sqrt{100 - 36} = 4$'].map(m),
          optionLabel: (i) => ['√(100 − 36) = √100 − √36', '√(100 − 36) = 8', '√(100 − 36) = 4'][i],
          correct: 1, cols: 1,
          explain: <MathText>{'$\\sqrt{100 - 36} = \\sqrt{64} = 8$ ، أما $\\sqrt{100} - \\sqrt{36} = 10 - 6 = 4$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_amaliyat-judhur_P3'] },
        },
      ]}
      badges={[
        { id: 'jidaa', emoji: '✖️', label: 'أحسب جداء جذرين', test: (s) => (s.jidaa ?? 0) === 0 },
        { id: 'jam', emoji: '🚫', label: 'لا أوزّع الجذر على الجمع', test: (s) => (s.jam ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت العمليات على الجذور التربيعية',
        title: 'انتهى درس العمليات على الجذور',
        message: 'تعرف الآن أن جذر جداء هو جداء الجذرين، وأن جذر حاصل قسمة هو حاصل قسمة الجذرين، وأن ذلك لا يصحّ في الجمع والطرح. الدرس التالي يوظّف هذه الخواص.',
        verbs: ['أحسب', 'أبرهن', 'أبسّط', 'أنتبه'],
        masterBadgeLabel: 'العمليات على الجذور',
      }}
    />
  );
}
