import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Le manuel fourni n'a pas de « أؤكّد تعلّماتي » : les cinq épreuves sont des ajouts de la plateforme
 * (déclarés). Chaque épreuve évalue UN point d'apprentissage ; P1–P4 sont couverts. Chaque distracteur est
 * faux pour une raison nommée (a et b inversés, signe, b oublié, ordre inverse, la constante prise pour
 * une linéaire).
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;
const PLATFORM = addition('interaction_generation');

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        mafhum: { label: 'الدالة التآلفية ومعاملاها', module: 3 },
        sura: { label: 'صورة عدد', module: 3 },
        sabiq: { label: 'العدد الذي صورته معلومة', module: 3 },
        hala: { label: 'الدالة الخطية والدالة الثابتة', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'mafhum', requires: ['taarif-taalufiya'],
          prompt: <Q source={PLATFORM}><MathText>{'المعاملان $a$ و $b$ للدالة التآلفية $f : x \\longmapsto 7 - 2x$ هما:'}</MathText></Q>,
          options: [M('$a = -2$ ، $b = 7$'), M('$a = 7$ ، $b = -2$'), M('$a = 2$ ، $b = 7$'), M('$a = -2$ ، $b = -7$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$7 - 2x = (-2) \\times x + 7$ : $a$ هو المضروب في $x$ بإشارته، و $b$ الحدّ الثابت.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-taalufiya_P1'] },
        },
        {
          id: 'E2', skill: 'sura', requires: ['sura-taalufiya'],
          prompt: <Q source={PLATFORM}><MathText>{'$f(x) = -4x + 3$ . صورة العدد $-2$ بالدالة $f$ هي:'}</MathText></Q>,
          options: [M('$11$'), M('$-5$'), M('$8$'), M('$5$')],
          correct: 0, cols: 4,
          explain: <MathText>{'$f(-2) = -4 \\times (-2) + 3 = 8 + 3 = 11$. أما $-5$ فخطأ في إشارة الجداء، و $8$ نسيان $b$ ، و $5$ طرح $b$ بدل إضافته.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-taalufiya_P2'] },
        },
        {
          id: 'E3', skill: 'sabiq', requires: ['sabiq-taalufiya'],
          prompt: <Q source={PLATFORM}><MathText>{'$g(x) = 5x + 8$ . العدد الذي صورته $-7$ بالدالة $g$ هو:'}</MathText></Q>,
          options: [M('$-3$'), M('$-9{,}4$'), M('$0{,}2$'), M('$-27$')],
          correct: 0, cols: 4,
          explain: <MathText>{'$5x + 8 = -7$ ، إذن $5x = -15$ ، ومنه $x = -3$. أما $-9{,}4 = -7 \\div 5 - 8$ فترتيب معكوس، و $0{,}2$ إضافة 8 بدل طرحها، و $-27$ هو صورة $-7$ لا العدد الذي صورته $-7$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-taalufiya_P3'] },
        },
        {
          id: 'E4', skill: 'hala', requires: ['thabita'],
          prompt: <Q source={PLATFORM}><MathText>{'الدالة $h : x \\longmapsto -6$ هي:'}</MathText></Q>,
          options: [M('دالة ثابتة: تآلفية مع $a = 0$ و $b = -6$'), M('دالة خطية معاملها $-6$'), M('ليست دالة تآلفية')],
          correct: 0, cols: 1,
          explain: <MathText>{'$-6 = 0 \\times x - 6$ : صورة كل عدد هي $-6$ . أما الدالة الخطية التي معاملها $-6$ فتعطي $h(1) = -6$ و $h(2) = -12$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-taalufiya_P4'] },
        },
        {
          id: 'E5', skill: 'hala', requires: ['khattiya-taalufiya'],
          prompt: <Q source={PLATFORM}><MathText>{'الدالة الخطية من بين الدوال التآلفية الآتية هي:'}</MathText></Q>,
          options: [M('$x \\longmapsto -3x$'), M('$x \\longmapsto 3x - 1$'), M('$x \\longmapsto 3$'), M('$x \\longmapsto x + 3$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$-3x = -3x + 0$ : $b = 0$ ، فهي خطية. أما $3x - 1$ و $x + 3$ فـ $b \\neq 0$ ، و $x \\longmapsto 3$ ثابتة ($a = 0$).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mafhum-taalufiya_P4'] },
        },
      ]}
      badges={[
        { id: 'mafhum', emoji: '🧾', label: 'الدالة التآلفية', test: (m) => (m.mafhum ?? 0) === 0 },
        { id: 'sura', emoji: '🏷️', label: 'صورة عدد', test: (m) => (m.sura ?? 0) === 0 },
        { id: 'sabiq', emoji: '🔁', label: 'البرنامج العكسي', test: (m) => (m.sabiq ?? 0) === 0 },
        { id: 'hala', emoji: '🎚️', label: 'خطية وثابتة', test: (m) => (m.hala ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت مفهوم الدالة التآلفية',
        title: 'انتهى الدرس 1',
        message: 'تعرف الآن الدالة التآلفية x ⟼ ax + b ومعاملَيها، تحسب صورة عدد، وتعيّن العدد الذي صورته معلومة بالبرنامج العكسي، وتميّز الدالة الخطية (b = 0) والدالة الثابتة (a = 0).',
        verbs: ['أميّز', 'أحسب الصورة', 'أعكس البرنامج', 'أصنّف'],
        masterBadgeLabel: 'الدالة التآلفية',
      }}
    />
  );
}
