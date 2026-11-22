import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { FINAL_FIGURES } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves réécrites à partir de « أؤكّد تعلّماتي » 1–4 (autres
 * triangles, autres nombres) : une الكفاءة principale par épreuve, les quatre couvertes. Les clés sont recalculées en arithmétique exacte dans
 * ../content/content.test.js (FINAL) ; chaque distracteur y est vérifié FAUX. Options LITTÉRALES (l'audit les lit statiquement).
 */
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
        property: { label: 'خاصية فيثاغورس', module: 2 },
        compute: { label: 'حساب طول ضلع', module: 3 },
        root: { label: 'اللمسة √ والتدوير', module: 3 },
        notRight: { label: 'مثلث غير قائم', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'property', requires: ['watar'],
          prompt: <Q source={SELF[1].source}><MathText>{'LMN مثلث قائم في M. ما المساواة التي تعبّر عن خاصية فيثاغورس فيه؟'}</MathText></Q>,
          options: ['$LN^2=LM^2+MN^2$', '$LM^2=LN^2+MN^2$', '$MN^2=LM^2+LN^2$', '$LN=LM+MN$'], correct: 0, cols: 2,
          explain: <MathText>{'الزاوية القائمة في M، فالوتر هو الضلع المقابل لها $[LN]$ ، ونجمع المربعات لا الأطوال.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_khassiyat-fitaghuras_P1'] },
        },
        {
          id: 'E2', skill: 'compute', requires: ['hisab-watar'],
          prompt: <Q source={SELF[3].source}><MathText>{'ABC مثلث قائم في A حيث $AB=8\\,\\mathrm{cm}$ و $AC=6\\,\\mathrm{cm}$. ما طول $BC$؟'}</MathText><GeoFigure inline {...FINAL_FIGURES.E2} /></Q>,
          options: ['$10\\,\\mathrm{cm}$', '$14\\,\\mathrm{cm}$', '$100\\,\\mathrm{cm}$', '$\\sqrt{28}\\,\\mathrm{cm}$'], correct: 0, cols: 2,
          explain: <MathText>{'$BC^2=8^2+6^2=64+36=100$ ، و $10^2=100$ ، إذن $BC=10\\,\\mathrm{cm}$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_khassiyat-fitaghuras_P2'] },
        },
        {
          id: 'E3', skill: 'compute', requires: ['hisab-dil'],
          prompt: <Q source={SELF[3].source}><MathText>{'RST مثلث قائم في S حيث $RT=13\\,\\mathrm{cm}$ و $RS=5\\,\\mathrm{cm}$. ما طول $ST$؟'}</MathText></Q>,
          options: ['$12\\,\\mathrm{cm}$', '$\\sqrt{194}\\,\\mathrm{cm}$', '$8\\,\\mathrm{cm}$', '$144\\,\\mathrm{cm}$'], correct: 0, cols: 2,
          explain: <MathText>{'الوتر $[RT]$ : $ST^2=13^2-5^2=169-25=144$ ، و $12^2=144$ ، إذن $ST=12\\,\\mathrm{cm}$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_khassiyat-fitaghuras_P2'] },
        },
        {
          id: 'E4', skill: 'root', requires: ['lamsa-jidhr'],
          prompt: <Q source={SELF[3].source}><MathText>{'مثلث قائم ضلعاه القائمان $3\\,\\mathrm{cm}$ و $5\\,\\mathrm{cm}$. ما طول وتره، بالقيمة المضبوطة ثم مدوّرا إلى $0{,}1$؟'}</MathText></Q>,
          options: ['$\\sqrt{34}\\approx5{,}8\\,\\mathrm{cm}$', '$\\sqrt{34}\\approx5{,}9\\,\\mathrm{cm}$', '$8\\,\\mathrm{cm}$', '$17\\,\\mathrm{cm}$'], correct: 0, cols: 2,
          explain: <MathText>{'$3^2+5^2=34$ ، والآلة الحاسبة تعرض $\\sqrt{34}=5{,}830951895$ ، فالمدوّر إلى $0{,}1$ هو $5{,}8$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_khassiyat-fitaghuras_P3'] },
        },
        {
          id: 'E5', skill: 'notRight', requires: ['ithbat-ghayr-qaim'],
          prompt: <Q source={SELF[4].source}><MathText>{'مثلث أطوال أضلاعه $5{,}1\\,\\mathrm{cm}$ و $6{,}8\\,\\mathrm{cm}$ و $8{,}6\\,\\mathrm{cm}$. ما العبارة الصحيحة؟'}</MathText></Q>,
          options: ['غير قائم، لأنّ $8{,}6^2\\neq5{,}1^2+6{,}8^2$', 'قائم، لأنّ $5{,}1^2+6{,}8^2$ قريب جدا من $8{,}6^2$', 'قائم، لأنّ أحد أضلاعه أطول من الآخرين', 'لا يمكن الحكم دون منقلة'], correct: 0, cols: 1,
          explain: <MathText>{'$8{,}6^2=73{,}96$ و $5{,}1^2+6{,}8^2=26{,}01+46{,}24=72{,}25$ : العددان مختلفان، فحسب خاصية فيثاغورس المثلث غير قائم.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_khassiyat-fitaghuras_P4'] },
        },
      ]}
      badges={[
        { id: 'compute', emoji: '📏', label: 'أحسب أطوال المثلث القائم', test: (m) => (m.compute ?? 0) === 0 },
        { id: 'notRight', emoji: '🔍', label: 'أكشف المثلث غير القائم', test: (m) => (m.notRight ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت خاصية فيثاغورس',
        title: 'انتهى درس خاصية فيثاغورس',
        message: 'تعرف الآن أنّ مربع الوتر في مثلث قائم هو مجموع مربعي الضلعين الآخرين، وتحسب به وترا أو ضلعا قائما وتأخذ قيمته بالآلة الحاسبة، وتُثبت به أنّ مثلثا غير قائم.',
        verbs: ['أكتب', 'أحسب', 'أُثبت'],
        masterBadgeLabel: 'خاصية فيثاغورس',
      }}
    />
  );
}
