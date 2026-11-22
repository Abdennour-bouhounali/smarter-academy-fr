import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import RayFigure from '../components/RayFigure';
import { describe } from '../components/GraphChoice';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { src, addition } from '../../_unit/unitMeta';

/**
 * Module 9 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Six épreuves : trois items de « أؤكّد تعلّماتي » (p. 52 : 6, 8, 9 — les items 5 et 7, à
 * deux bonnes réponses, sont formatifs au module 5) et trois énoncés de la plateforme sur
 * le modèle du نشاط 3 et de معارف 3 (P1 : reconnaître une متراجحة, tester une valeur ;
 * P2 : résoudre avec un coefficient négatif). Chaque épreuve évalue UN point
 * d'apprentissage ; P1, P2, P3 sont couverts. Les items 6 et 9 sont des droites graduées
 * DESSINÉES selon la convention du manuel (RayFigure) ; chaque distracteur est faux.
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;
const F = (o, text) => <RayFigure key={text} {...o} label={describe(o)} caption={text} showLabel={false} />;

export default function Module09Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(9)}
      moduleNumber={9}
      moduleTitle="إختبار أولي"
      moduleSubtitle="ستة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="7 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={7 * 60}
      timerLabel="7 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الستة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        hal: { label: 'المتراجحة وحلولها', module: 1 },
        ittijah: { label: 'حل متراجحة واتجاهها', module: 3 },
        tamthil: { label: 'التمثيل البياني للحلول', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'hal', requires: ['mutarajiha'],
          prompt: <Q source={addition('interaction_generation')}>أيّ كتابة مما يلي متراجحة ذات المجهول <MathText>{'$x$'}</MathText> ؟</Q>,
          options: [M('$-8 > -3$'), M('$2x + 1 \\leq 7$'), M('$2 \\times 3 + 1 = 7$'), M('$2x + 1 = 7$')],
          correct: 1, cols: 2,
          explain: <MathText>{'$2x + 1 \\leq 7$ متباينة فيها المجهول $x$ : صحيحة لبعض قيمه وخاطئة لأخرى. $-8 > -3$ متباينة عددية (خاطئة) بلا مجهول، والكتابتان الأخريان مساواتان.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mutarajiha-ula_P1'] },
        },
        {
          id: 'E2', skill: 'hal', requires: ['hal-mutarajiha'],
          prompt: <Q source={addition('interaction_generation')}>العدد 3 حلّ للمتراجحة ...</Q>,
          options: [M('$2x - 1 < 5$'), M('$-x + 4 > 0$'), M('$3x \\geq 10$')],
          correct: 1, cols: 3,
          explain: <MathText>{'$-3 + 4 = 1$ و $1 > 0$ صحيحة. أمّا $2 \\times 3 - 1 = 5$ و $5 < 5$ خاطئة، و $3 \\times 3 = 9$ و $9 \\geq 10$ خاطئة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mutarajiha-ula_P1'] },
        },
        {
          id: 'E3', skill: 'ittijah', requires: ['qawaid-ittijah'],
          prompt: <Q source={{ ...src('qcm', 52, 'أؤكّد تعلّماتي', 8), part: 'بأعداد المنصّة' }}>حلول المتراجحة <MathText>{'$-\\dfrac{1}{5}x < 2$'}</MathText> هي الأعداد <MathText>{'$x$'}</MathText> حيث ...</Q>,
          options: [M('$x < -10$'), M('$x > -10$'), M('$x > 10$')],
          correct: 1, cols: 3,
          explain: <MathText>{'نضرب الطرفين في $-5$ (عدد سالب) فنغيّر الاتجاه: $x > -10$ ، والعدد $-10$ هو الحدّ وليس حلًّا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mutarajiha-ula_P2'] },
        },
        {
          id: 'E4', skill: 'ittijah', requires: ['tariqat-hal'],
          prompt: <Q source={addition('interaction_generation')}>حلول المتراجحة <MathText>{'$-2x + 3 \\geq 11$'}</MathText> هي الأعداد <MathText>{'$x$'}</MathText> حيث ...</Q>,
          options: [M('$x \\geq -4$'), M('$x \\leq -4$'), M('$x \\geq 4$'), M('$x \\leq 7$')],
          correct: 1, cols: 2,
          explain: <MathText>{'نطرح 3: $-2x \\geq 8$ ، ثم نقسم على $-2$ (سالب) فنغيّر الاتجاه: $x \\leq -4$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mutarajiha-ula_P2'] },
        },
        {
          id: 'E5', skill: 'tamthil', requires: ['tamthil-bayani'], keepOrder: true,
          prompt: <Q source={{ ...src('qcm', 52, 'أؤكّد تعلّماتي', 6), part: 'بأعداد المنصّة' }}>التمثيل على مستقيم مدرّج للأعداد <MathText>{'$x$'}</MathText> حيث <MathText>{'$x \\geq -5$'}</MathText> هو ...</Q>,
          options: [
            F({ from: -8, to: -2, at: -5, side: 'left', closed: true }, 'الجزء الملوّن على يسار $-5$ والرمز $]$ عند $-5$'),
            F({ from: -8, to: -2, at: -5, side: 'right', closed: true }, 'الجزء الملوّن على يمين $-5$ والرمز $[$ عند $-5$'),
            F({ from: -8, to: -2, at: -5, side: 'right', closed: false }, 'الجزء الملوّن على يمين $-5$ والرمز $]$ عند $-5$'),
          ],
          correct: 1, cols: 1,
          explain: <MathText>{'$x \\geq -5$ : الحلول على يمين $-5$ ، و $-5$ حلّ ($-5 \\geq -5$ صحيحة) فالرمز $[$ موجّه نحو الجزء الملوّن.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mutarajiha-ula_P3'] },
        },
        {
          id: 'E6', skill: 'tamthil', requires: ['tamthil-bayani'], keepOrder: true,
          prompt: <Q source={{ ...src('qcm', 52, 'أؤكّد تعلّماتي', 9), part: 'بأعداد المنصّة' }}>التمثيل البياني لحلول المتراجحة <MathText>{'$x - 2 < -4$'}</MathText> هو ...</Q>,
          options: [
            F({ from: -5, to: 1, at: -2, side: 'left', closed: false }, 'الجزء الملوّن على يسار $-2$ والرمز $[$ عند $-2$'),
            F({ from: -5, to: 1, at: -2, side: 'left', closed: true }, 'الجزء الملوّن على يسار $-2$ والرمز $]$ عند $-2$'),
            F({ from: -5, to: 1, at: -2, side: 'right', closed: false }, 'الجزء الملوّن على يمين $-2$ والرمز $]$ عند $-2$'),
          ],
          correct: 0, cols: 1,
          explain: <MathText>{'نضيف 2 إلى الطرفين: $x < -2$ ؛ الحلول على يسار $-2$ ، و $-2$ ليس حلًّا فالرمز $[$ غير موجّه نحو الجزء الملوّن.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mutarajiha-ula_P3'] },
        },
      ]}
      badges={[
        { id: 'ittijah', emoji: '🔄', label: 'الاتجاه الصحيح', test: (m) => (m.ittijah ?? 0) === 0 },
        { id: 'tamthil', emoji: '📏', label: 'الجزء الملوّن بالأحمر', test: (m) => (m.tamthil ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت حل المتراجحات وتمثيل حلولها',
        title: 'انتهى الدرس 3',
        message: 'تعرف الآن ما هي المتراجحة وحلولها، وكيف تحلّها بقواعد الاتجاه، وكيف تمثّل حلولها على مستقيم مدرّج.',
        verbs: ['أختبر', 'أحلّ', 'أغيّر الاتجاه', 'أمثّل'],
        masterBadgeLabel: 'المتراجحات من الدرجة الأولى',
      }}
    />
  );
}
