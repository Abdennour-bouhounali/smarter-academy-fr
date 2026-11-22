import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 7 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Cinq épreuves de la
 * plateforme (le manuel fourni n'a aucun item d'évaluation pour cette leçon), d'autres nombres que la leçon :
 * P1 (a par تناسب التغيّرات, a négatif, la raison du quotient constant), P2 (f(x) de deux couples, b d'une
 * histoire). Chaque épreuve évalue UN point ; chaque distracteur est une erreur expliquée par la leçon.
 */
const PLATFORM = addition('interaction_generation');
const Q = ({ children }) => <span>{children} <SourceTag source={PLATFORM} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module07Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="5 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        muamil: { label: 'تناسب التغيّرات وحساب a', module: 1 },
        tayin: { label: 'تعيين دالة تآلفية من عددين وصورتيهما', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'muamil', requires: ['hisab-muamil-a'],
          prompt: <Q><MathText>{'$f$ دالة تآلفية حيث $f(2) = 3$ و $f(6) = 23$ . المعامل $a$ هو:'}</MathText></Q>,
          options: [M('$20$'), M('$5$'), M('$-5$'), M('$4$')],
          correct: 1, cols: 4,
          explain: <MathText>{'$a = \\dfrac{23 - 3}{6 - 2} = \\dfrac{20}{4} = 5$ . أمّا $20$ ففرق الصورتين وحده، و $-5$ خطأ في ترتيب الطرح، و $4$ فرق العددين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tanasub-taghayyurat_P1'] },
        },
        {
          id: 'E2', skill: 'muamil', requires: ['hisab-muamil-a'],
          prompt: <Q><MathText>{'$g$ دالة تآلفية حيث $g(-1) = 8$ و $g(3) = -4$ . المعامل $a$ هو:'}</MathText></Q>,
          options: [M('$3$'), M('$-12$'), M('$-3$'), M('$-6$')],
          correct: 2, cols: 4,
          explain: <MathText>{'$a = \\dfrac{-4 - 8}{3 - (-1)} = \\dfrac{-12}{4} = -3$ : الصورة تنقص لمّا يزيد العدد. $-6$ تنسى إشارة $-1$ في المقام ($3 - 1 = 2$).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tanasub-taghayyurat_P1'] },
        },
        {
          id: 'E3', skill: 'muamil', requires: ['burhan-taghayyurat'],
          prompt: <Q><MathText>{'من أجل $f(x) = ax + b$ وعددين متمايزين $x_1$ و $x_2$ ، الفرق $f(x_1) - f(x_2)$ يساوي:'}</MathText></Q>,
          options: [M('$a(x_1 - x_2) + b$'), M('$(a + b)(x_1 - x_2)$'), M('$a x_1 - x_2$'), M('$a(x_1 - x_2)$')],
          correct: 3, cols: 2,
          explain: <MathText>{'$(a x_1 + b) - (a x_2 + b) = a x_1 - a x_2 = a(x_1 - x_2)$ : الحدّ $b$ يختفي، ولهذا $\\dfrac{f(x_1) - f(x_2)}{x_1 - x_2} = a$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tanasub-taghayyurat_P1'] },
        },
        {
          id: 'E4', skill: 'tayin', requires: ['hisab-muamil-a', 'hisab-b'],
          prompt: <Q><MathText>{'$h$ دالة تآلفية حيث $h(4) = 11$ و $h(10) = 26$ . عبارة $h(x)$ هي:'}</MathText></Q>,
          options: [M('$h(x) = 2{,}5x + 1$'), M('$h(x) = 15x + 11$'), M('$h(x) = 2{,}5x + 2{,}75$'), M('$h(x) = 2{,}5x - 1$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$a = \\dfrac{26 - 11}{10 - 4} = \\dfrac{15}{6} = 2{,}5$ ، $b = 11 - 2{,}5 \\times 4 = 1$ ؛ تحقّق: $h(10) = 25 + 1 = 26$ . $2{,}75$ هو $\\dfrac{11}{4}$ : قسمة الصورة على العدد لا تعطي $b$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tanasub-taghayyurat_P2'] },
        },
        {
          id: 'E5', skill: 'tayin', requires: ['hisab-b', 'hisab-muamil-a'],
          prompt: <Q><MathText>{'قاعة رياضة يقصدها الشباب للمحافظة على صحتهم: مشترك دفع 4100DA مقابل 3 أشهر، وآخر دفع 8100DA مقابل 8 أشهر. المبلغ دالة تآلفية لعدد الأشهر. حقوق التسجيل (المبلغ الثابت $b$) هي:'}</MathText></Q>,
          options: [M('$800$ DA'), M('$2400$ DA'), M('$1700$ DA'), M('$4100$ DA')],
          correct: 2, cols: 2,
          explain: <MathText>{'$a = \\dfrac{8100 - 4100}{8 - 3} = \\dfrac{4000}{5} = 800$ DA للشهر، ثم $b = 4100 - 800 \\times 3 = 1700$ DA ؛ تحقّق: $800 \\times 8 + 1700 = 8100$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tanasub-taghayyurat_P2'] },
        },
      ]}
      badges={[
        { id: 'muamil', emoji: '📶', label: 'تناسب التغيّرات', test: (m) => (m.muamil ?? 0) === 0 },
        { id: 'tayin', emoji: '🎯', label: 'دالة من عددين', test: (m) => (m.tayin ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت تعيين دالة تآلفية من عددين وصورتيهما',
        title: 'انتهى الدرس 3',
        message: 'تعرف الآن أنّ حاصل قسمة فرق الصورتين على فرق العددين ثابت يساوي a ، وتعيّن دالة تآلفية من عددين وصورتيهما: a ثم b ، أو بجملة معادلتين.',
        verbs: ['أحسب', 'أعلّل', 'أعيّن', 'أتحقّق'],
        masterBadgeLabel: 'دالة تآلفية من عددين وصورتيهما',
      }}
    />
  );
}
