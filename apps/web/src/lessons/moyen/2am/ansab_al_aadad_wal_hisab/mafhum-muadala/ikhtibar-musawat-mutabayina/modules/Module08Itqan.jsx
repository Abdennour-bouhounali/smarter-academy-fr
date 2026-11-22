import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme « على منوال » les examens du 2e trimestre, avec des nombres jamais vus dans la leçon (déclarées) ; chaque mauvaise option encode une erreur réelle
 * (ONESIDE : ne calculer qu'un membre ; SWAP : échanger x et y ; BOUNDARY : prendre « a < a » pour vrai ; ONEVALUE : une valeur égale prouve ; MANYEX : il faudrait plusieurs contre-exemples). Chaque option fausse est FAUSSE (recalculé dans content.test.js).
 * Une الكفاءة principale par épreuve : E1, E2 → P1 ; E3 → P3 ; E4, E5 → P2.
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
        test: { label: 'اختبار مساواة', module: 1 },
        ineq: { label: 'اختبار متباينة', module: 2 },
        counter: { label: 'المثال المضادّ', module: 1 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'test', requires: ['tawid-wa-hisab'],
          prompt: <Q>المساواة <MathText>{'$5x-4=3x+2$'}</MathText> صحيحة من أجل :</Q>,
          options: [M('$x=3$'), M('$x=2$'), M('$x=1$'), M('$x=6$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$x=3$ : $5\\times3-4=11$ و $3\\times3+2=11$ ، فالطرفان متساويان. ($x=2$ يعطي $6$ و $8$ ؛ و $x=1$ يعطي $1$ و $5$ ؛ و $x=6$ يعطي $26$ و $20$ : نحسب الطرفين لا طرفًا واحدًا.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_ikhtibar-musawat-mutabayina_P1'] },
        },
        {
          id: 'E2', skill: 'test', requires: ['zawj-tartib'],
          prompt: <Q>المساواة <MathText>{'$2x+y=13$'}</MathText> من أجل <MathText>{'$x=4$ و $y=5$'}</MathText> :</Q>,
          options: [M('صحيحة'), M('خاطئة')],
          correct: 0, cols: 2,
          explain: <MathText>{'$2\\times4+5=13$ ، فهي صحيحة. (إن بدّلنا القيمتين وجدنا $2\\times5+4=14$ ، لكنّ $x$ هو $4$ و $y$ هو $5$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_ikhtibar-musawat-mutabayina_P1'] },
        },
        {
          id: 'E3', skill: 'ineq', requires: ['qiyam-muhaqqiqa'],
          prompt: <Q>من بين <MathText>{'$2$ و $3$ و $4$'}</MathText> ، القيم التي تجعل <MathText>{'$6x-1<2x+11$'}</MathText> صحيحة :</Q>,
          options: [M('$2$ فقط'), M('$2$ و $3$'), M('$3$ و $4$'), M('$4$ فقط')],
          correct: 0, cols: 2,
          explain: <MathText>{'$x=2$ : $11<15$ صحيحة. $x=3$ : $17<17$ خاطئة لأنّ الرمز $<$ لا يقبل التساوي. $x=4$ : $23<19$ خاطئة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_ikhtibar-musawat-mutabayina_P3'] },
        },
        {
          id: 'E4', skill: 'counter', requires: ['tasawi-ibaratayn'],
          prompt: <Q>قال تلميذ: «<MathText>{'$x^2$'}</MathText> و <MathText>{'$2x$'}</MathText> متساويتان لأنّهما تعطيان <MathText>{'$4$'}</MathText> من أجل <MathText>{'$x=2$'}</MathText> ». قوله :</Q>,
          options: [M('خاطئ: من أجل $x=3$ نجد $9\\neq6$'), M('صحيح')],
          correct: 0, cols: 2,
          explain: <MathText>{'قيمة واحدة لا تكفي لإثبات التساوي، ومن أجل $x=3$ نجد $9$ و $6$ : مثال مضادّ واحد يبيّن أنّ العبارتين غير متساويتين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_ikhtibar-musawat-mutabayina_P2'] },
        },
        {
          id: 'E5', skill: 'counter', requires: ['mithal-mudad'],
          prompt: <Q>لإثبات أنّ عبارتين حرفيتين غير متساويتين يكفي :</Q>,
          options: [M('مثال واحد تختلفان عنده'), M('ثلاثة أمثلة تختلفان عندها'), M('أن لا نقدر على إثبات ذلك'), M('أن تختلفا من أجل كلّ القيم')],
          correct: 0, cols: 2,
          explain: <MathText>{'قيمة واحدة تعطي عندها عددين مختلفين تكفي. لا نحتاج إلى ثلاثة أمثلة، ولا إلى الاختلاف من أجل كلّ القيم.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_ikhtibar-musawat-mutabayina_P2'] },
        },
      ]}
      badges={[
        { id: 'test', emoji: '🚚', label: 'أختبر مساواة', test: (m) => (m.test ?? 0) === 0 },
        { id: 'counter', emoji: '🔎', label: 'أبطل ادّعاءً', test: (m) => (m.counter ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت اختبار المساواة والمتباينة',
        title: 'انتهى درس اختبار صحة مساواة أو متباينة',
        message: 'تعرف الآن أن تعوّض وتحسب وتقارن، وأن تعيّن القيم الصحيحة، وأن تبطل ادّعاءً بمثال مضادّ واحد. الدرس التالي: حلّ مشكل باستعمال معادلة.',
        verbs: ['أعوّض', 'أحسب', 'أقارن', 'أبطل'],
        masterBadgeLabel: 'اختبار',
      }}
    />
  );
}
