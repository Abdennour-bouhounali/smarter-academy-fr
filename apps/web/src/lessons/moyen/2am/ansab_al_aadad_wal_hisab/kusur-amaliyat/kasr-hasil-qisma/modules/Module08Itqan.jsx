import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme « على منوال » les examens du 1er trimestre, avec des nombres jamais vus dans la leçon (déclarées) ; chaque
 * mauvaise option encode une erreur réelle (le reste écrit après la virgule, la valeur par excès prise pour la valeur par défaut, le mauvais rang, ×10 sur un seul terme, la nature du quotient). Chaque option fausse est FAUSSE
 * (recalculé dans content.test.js). Une الكفاءة principale par épreuve ; la 2e épreuve couvre P2 et P3.
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
        hasr: { label: 'حصر حاصل القسمة إلى 0,1 و 0,01', module: 1 },
        qasim: { label: 'القسمة على عدد عشري', module: 3 },
        nisba: { label: 'النسبة والقيمة المضبوطة', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'hasr', requires: ['qiyam-muqarraba-ushr'],
          prompt: <Q>القيمة المقرّبة إلى <MathText>{'$0{,}1$'}</MathText> بالنقصان لحاصل القسمة <MathText>{'$\\frac{11}{6}$'}</MathText> هي:</Q>,
          options: [M('$1{,}8$'), M('$1{,}9$'), M('$1{,}5$'), M('$1{,}83$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$11 \\div 6 = 1{,}833\\ldots$ : $1{,}8 < \\frac{11}{6} < 1{,}9$ ، والقيمة بالنقصان هي $1{,}8$ . ($1{,}9$ هي القيمة بالزيادة؛ و $1{,}5$ تكتب الباقي بعد الفاصلة؛ و $1{,}83$ رتبتها $0{,}01$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_kasr-hasil-qisma_P4'] },
        },
        {
          id: 'E2', skill: 'qasim', requires: ['qisma-ashari'],
          prompt: <Q>احسب <MathText>{'$3{,}6 \\div 0{,}08$'}</MathText> .</Q>,
          options: [M('$45$'), M('$4{,}5$'), M('$0{,}45$'), M('$450$')],
          correct: 0, cols: 2,
          explain: <MathText>{'في $0{,}08$ رقمان بعد الفاصلة: نضرب الحدّين في $100$ : $\\frac{360}{8} = 45$ . (ضرب حدّ واحد في $10$ يعطي $4{,}5$ أو $450$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPoints: [{ code: '2am_kasr-hasil-qisma_P3', role: 'primary' }, { code: '2am_kasr-hasil-qisma_P2', role: 'secondary' }] },
        },
        {
          id: 'E3', skill: 'hasr', requires: ['hasr-ushri-tariqa'],
          prompt: <Q>أيّ حصر صحيح لحاصل القسمة <MathText>{'$\\frac{5}{7}$'}</MathText> إلى <MathText>{'$0{,}01$'}</MathText> ؟</Q>,
          options: [M('$0{,}71 < \\frac{5}{7} < 0{,}72$'), M('$0{,}72 < \\frac{5}{7} < 0{,}73$'), M('$0{,}70 < \\frac{5}{7} < 0{,}71$')],
          correct: 0, cols: 1,
          explain: <MathText>{'$5 \\div 7 = 0{,}714\\ldots$ ننهي عند رقمين: $0{,}71$ ثم نضيف $0{,}01$ . ($0{,}72$ تدوير لا يحصر الحاصل من أسفل؛ و $0{,}71$ بالزيادة خطأ لأنّ $7 \\times 0{,}71 = 4{,}97 < 5$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_kasr-hasil-qisma_P4'] },
        },
        {
          id: 'E4', skill: 'nisba', requires: ['ashri-am-la'],
          prompt: <Q>أيّ كتابة كسرية قيمتها المضبوطة عدد عشري؟</Q>,
          options: [M('$\\frac{9}{8}$'), M('$\\frac{5}{6}$'), M('$\\frac{4}{3}$'), M('$\\frac{7}{9}$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$9 \\div 8 = 1{,}125$ تنتهي القسمة. أمّا $5 \\div 6$ و $4 \\div 3$ و $7 \\div 9$ فلا تنتهي.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_kasr-hasil-qisma_P1'] },
        },
        {
          id: 'E5', skill: 'nisba', requires: ['nisba-kasriya'],
          prompt: <Q>من بين <MathText>{'$36$'}</MathText> تلميذًا في المتوسطة يشارك <MathText>{'$9$'}</MathText> في نادي الرياضيات. نسبتهم إلى التلاميذ كلّهم هي:</Q>,
          options: [M('$\\frac{9}{36} = 0{,}25$'), M('$\\frac{36}{9}$'), M('$0{,}9$'), M('$\\frac{9}{27}$')],
          correct: 0, cols: 2,
          explain: <MathText>{'نسبة $9$ إلى $36$ هي $\\frac{9}{36} = \\frac{1}{4} = 0{,}25$ . ($\\frac{36}{9}$ قلب النسبة؛ و $\\frac{9}{27}$ يقارن المشاركين بغير المشاركين.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_kasr-hasil-qisma_P1'] },
        },
      ]}
      badges={[
        { id: 'hasr', emoji: '🎯', label: 'أحصر حاصل القسمة', test: (m) => (m.hasr ?? 0) === 0 },
        { id: 'qasim', emoji: '🪢', label: 'أقسم على عدد عشري', test: (m) => (m.qasim ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت النسبة والقيم المقرّبة',
        title: 'انتهى درس الكسر: نسبة وحاصل قسمة وقيم مقرّبة',
        message: 'تعرف الآن أنّ حاصل القسمة عدد واحد، نحصره بقيمتين مقرّبتين إلى 0,1 وإلى 0,01 ونقسم على عدد عشري بجعل القاسم طبيعيًا. الدرس التالي يجمع كسرين ويطرحهما.',
        verbs: ['أقسم', 'أحصر', 'أقرّب', 'أعلّل'],
        masterBadgeLabel: 'حصر الحاصل إلى 0,01',
      }}
    />
  );
}
