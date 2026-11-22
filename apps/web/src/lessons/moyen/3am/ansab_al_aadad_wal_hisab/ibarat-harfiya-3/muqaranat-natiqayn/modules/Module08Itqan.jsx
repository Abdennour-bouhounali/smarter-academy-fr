import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme (réécrites à partir de « أؤكّد تعلّماتي » 9–10 et de معارف 5, autres nombres) : une الكفاءة
 * principale par épreuve (P1, P2, P2, P3, P1). Les clés sont recalculées dans ../content/content.test.js avec une arithmétique de rationnels à part ; chaque distracteur y est vérifié FAUX
 * et correspond à une erreur nommée (MISC-MUQ-*).
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
        known: { label: 'الترتيب من الفرق', module: 1 },
        frac: { label: 'مقارنة كسرين بالفرق', module: 2 },
        neg: { label: 'عددان سالبان', module: 2 },
        expr: { label: 'عبارتان حرفيتان', module: 3 },
        sense: { label: 'معنى الفرق الموجب', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'known', requires: ['farq-wahdahu'],
          prompt: <Q source={PLATFORM}><MathText>{'إذا كان $a-b=-0{,}2$ فإنّ'}</MathText></Q>,
          options: ['$a<b$', '$a>b$ لأنّ $0{,}2$ موجب', 'لا نستطيع الحكم دون معرفة $a$ و $b$', '$a=b$'], correct: 0, cols: 2,
          explain: <MathText>{'الفرق $a-b$ سالب، إذن $a<b$ ؛ وإشارته وحدها تكفي.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_muqaranat-natiqayn_P1'] },
        },
        {
          id: 'E2', skill: 'frac', requires: ['hisab-farq'],
          prompt: <Q source={PLATFORM}><MathText>{'لمقارنة العددين $\\frac56$ و $\\frac79$ :'}</MathText></Q>,
          options: ['$\\frac56-\\frac79=\\frac1{18}>0$ ، إذن $\\frac56>\\frac79$', '$\\frac56-\\frac79=\\frac{-2}{-3}$ ، إذن $\\frac56>\\frac79$', '$\\frac56<\\frac79$ لأنّ $5<7$', '$\\frac1{18}>0$ ، إذن $\\frac56<\\frac79$'], correct: 0, cols: 1,
          explain: <MathText>{'$\\frac56-\\frac79=\\frac{15-14}{18}=\\frac1{18}>0$ ؛ نوحّد المقامين ولا نطرح البسطين والمقامين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_muqaranat-natiqayn_P2'] },
        },
        {
          id: 'E3', skill: 'neg', requires: ['hisab-farq'],
          prompt: <Q source={PLATFORM}><MathText>{'لمقارنة العددين $-\\frac34$ و $-\\frac57$ :'}</MathText></Q>,
          options: ['$-\\frac34<-\\frac57$ لأنّ الفرق $-\\frac1{28}$', '$-\\frac34>-\\frac57$ لأنّ $\\frac34>\\frac57$', 'العددان متساويان', '$-\\frac34>-\\frac57$ لأنّ الفرق $\\frac1{28}$'], correct: 0, cols: 1,
          explain: <MathText>{'$-\\frac34-\\left(-\\frac57\\right)=\\frac{-21+20}{28}=-\\frac1{28}<0$ ؛ مع العدد السالب الأبعد عن الصفر هو الأصغر.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_muqaranat-natiqayn_P2'] },
        },
        {
          id: 'E4', skill: 'expr', requires: ['farq-ibaratayn'],
          prompt: <Q source={PLATFORM}><MathText>{'من أجل $x>3$ ، قارن $A=2x+7$ و $B=x+10$ :'}</MathText></Q>,
          options: ['$A>B$ لأنّ $A-B=x-3>0$', '$A<B$ لأنّ $A-B=x-3>0$', '$A-B=3x+17$ ، إذن $A>B$', '$A=B$ من أجل كل $x$'], correct: 0, cols: 1,
          explain: <MathText>{'$A-B=2x+7-x-10=x-3$ ، وهو موجب عندما $x>3$ ، إذن $A>B$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_muqaranat-natiqayn_P3'] },
        },
        {
          id: 'E5', skill: 'sense', requires: ['maana-farq'],
          prompt: <Q source={PLATFORM}><MathText>{'إذا كان $b-a>0$ فإنّ'}</MathText></Q>,
          options: ['$a<b$', '$a>b$', '$a=b$', '$a$ و $b$ موجبان'], correct: 0, cols: 2,
          explain: <MathText>{'$b-a>0$ معناه $b>a$ أي $a<b$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_muqaranat-natiqayn_P1'] },
        },
      ]}
      badges={[
        { id: 'order', emoji: '⚖️', label: 'أرتّب بإشارة الفرق', test: (m) => (m.known ?? 0) === 0 && (m.sense ?? 0) === 0 },
        { id: 'compare', emoji: '🔬', label: 'أقارن عددين ناطقين', test: (m) => (m.frac ?? 0) === 0 && (m.neg ?? 0) === 0 },
        { id: 'expr', emoji: '🧮', label: 'أقارن عبارتين', test: (m) => (m.expr ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت مقارنة عددين ناطقين',
        title: 'انتهى درس مقارنة عددين ناطقين',
        message: 'تعرف الآن أنّ $a>b$ معناه $a-b>0$ ، وأنّ إشارة الفرق وحدها تكفي لترتيب عددين، وأنّ مقارنة عددين ناطقين تكون بحساب فرقهما وقراءة إشارته، وأنّ مقارنة عبارتين تكون بتبسيط $A-B$ ثم تعيين إشارته حسب قيم $x$.',
        verbs: ['أحسب الفرق', 'أقرأ الإشارة', 'أستنتج'],
        masterBadgeLabel: 'مقارنة عددين ناطقين',
      }}
    />
  );
}
