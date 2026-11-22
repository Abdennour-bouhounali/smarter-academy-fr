import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme « على منوال » les examens du 2e trimestre, avec des nombres jamais vus dans la leçon (déclarées) ; chaque mauvaise option encode
 * une erreur réelle (x⁴ pour 4 × x, x + 4, (2x)² pour 2x², x² lu 2x, 6n et 5n, 5n juxtaposé à 12, 3a + 4a = 7a², 12a, un 0 sauté ou tout annulé). Chaque option fausse est FAUSSE (recalculé dans content.test.js).
 * Une الكفاءة principale par épreuve : E1, E4 → P1 ; E2 → P2 ; E3, E5 → P3.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={addition('exam_style_problem')} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;

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
        produce: { label: 'إنتاج عبارة حرفية', module: 1 },
        value: { label: 'قيمة عبارة حرفية', module: 2 },
        simplify: { label: 'تبسيط الكتابة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'produce', requires: ['ta3rif'],
          prompt: <Q>محيط مربّع ضلعه <MathText>{'$x$'}</MathText> يُكتب:</Q>,
          options: [M('$4x$'), M('$x^4$'), M('$x+4$'), M('$4+4x$')],
          correct: 0, cols: 2,
          explain: <MathText>{'للمربّع أربعة أضلاع متساوية: $4\\times x=4x$ . ($x^4$ ضرب $x$ في نفسه أربع مرّات؛ و $x+4$ جمع؛ و $4+4x$ يضيف $4$ بلا سبب.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_ibara-harfiya-intaj_P1'] },
        },
        {
          id: 'E2', skill: 'value', requires: ['qima-40'],
          prompt: <Q>قيمة العبارة <MathText>{'$2x^2+1$'}</MathText> من أجل <MathText>{'$x=3$'}</MathText> :</Q>,
          options: [M('$19$'), M('$37$'), M('$13$'), M('$7$')],
          correct: 0, cols: 2,
          explain: <MathText>{'نحسب القوّة أوّلًا: $x^2=9$ ثم $2\\times 9=18$ ثم $18+1=19$ . ($37$ حسب $(2x)^2+1$ ؛ و $13$ قرأ $x^2$ على أنّها $2x$ ؛ و $7$ أسقط المربّع.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_ibara-harfiya-intaj_P2'] },
        },
        {
          id: 'E3', skill: 'simplify', requires: ['tajmi'],
          prompt: <Q>بسّط <MathText>{'$3\\times a+4\\times a$'}</MathText> :</Q>,
          options: [M('$7a$'), M('$7a^2$'), M('$12a$'), M('$7+a$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$3a+4a=(3+4)a=7a$ . ($7a^2$ يجمع الأسس؛ و $12a$ يضرب المعاملين؛ و $7+a$ يفصل الحرف عن المعامل.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_ibara-harfiya-intaj_P3'] },
        },
        {
          id: 'E4', skill: 'produce', requires: ['qima-40'],
          prompt: <Q>صفّ من <MathText>{'$n$'}</MathText> خلية يحتاج <MathText>{'$5n+1$'}</MathText> عودًا. كم عودًا لصفّ من <MathText>{'$12$'}</MathText> خلية؟</Q>,
          options: [M('$61$'), M('$72$'), M('$60$'), M('$513$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$5\\times 12+1=60+1=61$ . ($72$ هو $6\\times 12$ ؛ و $60$ نسي العود الأوّل؛ و $513$ لصق الرقمين $5$ و $12$ ثم أضاف $1$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPoints: [{ code: '2am_ibara-harfiya-intaj_P1', role: 'primary' }, { code: '2am_ibara-harfiya-intaj_P2', role: 'secondary' }] },
        },
        {
          id: 'E5', skill: 'simplify', requires: ['ikhtisar-kitaba'],
          prompt: <Q>بسّط <MathText>{'$5\\times x\\times 0+2\\times x$'}</MathText> :</Q>,
          options: [M('$2x$'), M('$7x$'), M('$0$'), M('$2$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$5\\times x\\times 0=0$ ، فيبقى $0+2x=2x$ . ($7x$ عامل الصفر كأنّه $1$ ؛ و $0$ أبطل المجموع كلّه؛ و $2$ أسقط الحرف.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_ibara-harfiya-intaj_P3'] },
        },
      ]}
      badges={[
        { id: 'produce', emoji: '🐝', label: 'أنتج عبارة حرفية', test: (m) => (m.produce ?? 0) === 0 },
        { id: 'simplify', emoji: '✂️', label: 'أبسّط الكتابة', test: (m) => (m.simplify ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت العبارة الحرفية',
        title: 'انتهى درس إنتاج عبارة حرفية',
        message: 'تعرف الآن أن تكتب عبارة حرفية من وضعية أو من نمط أو من برنامج حساب، وأن تحسب قيمتها وتبسّط كتابتها. الدرس التالي: اختبار صحة مساواة أو متباينة.',
        verbs: ['أكتب', 'أعوّض', 'أحسب', 'أبسّط'],
        masterBadgeLabel: 'عبارة حرفية',
      }}
    />
  );
}
