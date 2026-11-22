import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme (réécrites à partir de « أؤكّد تعلّماتي » 3,
 * autres nombres) : une الكفاءة principale par épreuve (P1, P2, P2, P1, P3). Les clés sont recalculées dans ../content/content.test.js avec un évaluateur
 * de rationnels à part ; chaque distracteur y est vérifié FAUX et correspond à une erreur nommée (MISC-QIMA-*).
 */
const PLATFORM = addition('final_test_item');
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;

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
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة، ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        priority: { label: 'أولوية العمليات', module: 2 },
        brackets: { label: 'العدد السالب بين قوسين', module: 1 },
        power: { label: 'التربيع والجداء', module: 1 },
        letters: { label: 'حرفان وكسر', module: 2 },
        counter: { label: 'مثال مضاد', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'priority', requires: ['tawid-qimat'],
          prompt: <Q source={SELF[3].source}><MathText>{'قيمة العبارة $5-2x$ من أجل $x=-3$ هي'}</MathText></Q>,
          options: ['$11$', '$-1$', '$-9$', '$0$'], correct: 0, cols: 4,
          explain: <MathText>{'$5-2\\times(-3)=5+6=11$ ؛ نضرب قبل أن نطرح، وجداء عددين سالبين موجب.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qimat-ibara-harfiya_P1'] },
        },
        {
          id: 'E2', skill: 'brackets', requires: ['aqwas-salib'],
          prompt: <Q source={PLATFORM}><MathText>{'قيمة العبارة $x^2-4$ من أجل $x=-3$ هي'}</MathText></Q>,
          options: ['$5$', '$-13$', '$-10$', '$13$'], correct: 0, cols: 4,
          explain: <MathText>{'$(-3)^2-4=9-4=5$ ؛ أمّا $-3^2-4$ فتعطي خطأً $-13$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qimat-ibara-harfiya_P2'] },
        },
        {
          id: 'E3', skill: 'power', requires: ['aqwas-salib'],
          prompt: <Q source={PLATFORM}><MathText>{'قيمة العبارة $3x^2$ من أجل $x=-2$ هي'}</MathText></Q>,
          options: ['$12$', '$36$', '$-12$', '$-36$'], correct: 0, cols: 4,
          explain: <MathText>{'$3\\times(-2)^2=3\\times4=12$ ؛ التربيع يخصّ $x$ وحده لا العامل $3$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qimat-ibara-harfiya_P2'] },
        },
        {
          id: 'E4', skill: 'letters', requires: ['harfan'],
          prompt: <Q source={PLATFORM}><MathText>{'قيمة العبارة $2x-3y$ من أجل $x=\\frac12$ و $y=-1$ هي'}</MathText></Q>,
          options: ['$4$', '$-2$', '$-\\frac{7}{2}$', '$1$'], correct: 0, cols: 4,
          explain: <MathText>{'$2\\times\\frac12-3\\times(-1)=1+3=4$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qimat-ibara-harfiya_P1'] },
        },
        {
          id: 'E5', skill: 'counter', requires: ['mithal-mudad'],
          prompt: <Q source={PLATFORM}><MathText>{'هل العبارتان $(x+1)^2$ و $x^2+1$ متساويتان ؟'}</MathText></Q>,
          options: ['غير متساويتين لأنّ من أجل $x=1$ نجد $4$ و $2$', 'متساويتان لأنّ لهما القيمة $1$ من أجل $x=0$', 'متساويتان لأنّ $(x+1)^2=x^2+1^2$', 'لا يمكن أبدًا الحكم على مساواة بالقيم'], correct: 0, cols: 1,
          explain: <MathText>{'قيمة واحدة تختلف عندها العبارتان تكفي: $(1+1)^2=4$ و $1^2+1=2$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_qimat-ibara-harfiya_P3'] },
        },
      ]}
      badges={[
        { id: 'value', emoji: '🎯', label: 'أحسب قيمة عبارة', test: (m) => (m.priority ?? 0) === 0 && (m.letters ?? 0) === 0 },
        { id: 'brackets', emoji: '🧩', label: 'أضع الأقواس في مكانها', test: (m) => (m.brackets ?? 0) === 0 && (m.power ?? 0) === 0 },
        { id: 'counter', emoji: '⚖️', label: 'أبطل مساواة بمثال مضاد', test: (m) => (m.counter ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت حساب قيمة عبارة حرفية',
        title: 'انتهى درس حساب قيمة عبارة حرفية',
        message: 'تعرف الآن أنّ الحرف يأخذ العدد نفسه في كل مكان، وأنّ علامة الضرب تُظهَر والعدد السالب يوضع بين قوسين، وأنّ الحساب يحترم أولوية العمليات، وأنّ قيمة واحدة تختلف عندها عبارتان تثبت أنهما غير متساويتين أمّا تساوي القيم فلا يثبت التساوي.',
        verbs: ['أعوّض', 'أحسب', 'أبطل'],
        masterBadgeLabel: 'حساب قيمة عبارة حرفية',
      }}
    />
  );
}
