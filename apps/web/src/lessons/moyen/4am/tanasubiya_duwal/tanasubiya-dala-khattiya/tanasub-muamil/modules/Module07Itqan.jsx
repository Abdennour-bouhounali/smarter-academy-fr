import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';
import { texTable } from '../components/DataTable';

/**
 * Module 7 — إختبار أولي (module 4 avant les « مسائل », 2026-10-06) (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Cinq épreuves de
 * la plateforme (le manuel ne destine aucun item de « أؤكّد تعلّماتي » à cette leçon), d'autres
 * nombres que la leçon : P1 (le coefficient, le quatrième proportionnel), P2 (la situation
 * proportionnelle, un tableau qui ne l'est pas), P3 (y = a × x). Chaque épreuve évalue UN point.
 */
const PLATFORM = addition('interaction_generation');
const Q = ({ children }) => <span>{children} <SourceTag source={PLATFORM} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;
const T = (xs, ys) => <span className="mt-1 block" dir="ltr"><MathText>{texTable(xs, ys)}</MathText></span>;

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
        muamil: { label: 'معامل التناسبية والرابع المتناسب', module: 2 },
        tamyiz: { label: 'التمييز بين وضعية تناسبية وغير تناسبية', module: 2 },
        ibara: { label: 'العلاقة y = a × x', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'muamil', requires: ['muamil-tanasub'],
          prompt: <Q><span>هذا الجدول جدول تناسبية. معامل التناسبية هو:</span>{T([5, 8, 12], ['3', '4,8', '7,2'])}</Q>,
          options: [M('$0{,}6$'), M('$\\dfrac{5}{3}$'), M('$2$'), M('$0{,}8$')],
          correct: 0, cols: 4,
          explain: <MathText>{'$\\dfrac{3}{5} = \\dfrac{4{,}8}{8} = \\dfrac{7{,}2}{12} = 0{,}6$. أمّا $\\dfrac{5}{3}$ فهو مقلوب المعامل (السطر الأول على الثاني).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tanasub-muamil_P1'] },
        },
        {
          id: 'E2', skill: 'muamil', requires: ['rabi-mutanasib'],
          prompt: <Q><span>هذا الجدول جدول تناسبية. العدد الناقص هو:</span>{T([4, 10], ['6', '?'])}</Q>,
          options: [M('$15$'), M('$12$'), M('$\\dfrac{20}{3}$')],
          correct: 0, cols: 3,
          explain: <MathText>{'المعامل $\\dfrac{6}{4} = 1{,}5$ ، و $10 \\times 1{,}5 = 15$ ؛ أو $4 \\times y = 10 \\times 6$ ومنه $y = 15$. أمّا 12 فإضافة الفرق $10 - 4 = 6$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tanasub-muamil_P1'] },
        },
        {
          id: 'E3', skill: 'tamyiz', requires: ['mablagh-thabit'],
          prompt: <Q><span>أيّ وضعية من هذه الوضعيات تناسبية؟</span></Q>,
          options: [
            M('تذاكر الحافلة: 30DA للتذكرة (عدد التذاكر والثمن)'),
            M('قاعة رياضة: 500DA للتسجيل + 200DA للحصة (عدد الحصص والثمن)'),
            M('سيارة أجرة: 80DA عند الركوب + 25DA للكيلومتر (المسافة والثمن)'),
          ],
          correct: 0, cols: 1,
          explain: <MathText>{'ثمن التذاكر $= 30 \\times$ عددها: حاصل القسمة 30 ثابت. في الوضعيتين الأخريين مبلغ ثابت (500DA ، 80DA) يُدفع مهما كان العدد، فحواصل القسمة تتغيّر.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tanasub-muamil_P2'] },
        },
        {
          id: 'E4', skill: 'tamyiz', requires: ['muamil-tanasub'],
          prompt: <Q><span>هل هذا الجدول جدول تناسبية؟</span>{T([2, 4, 6], ['9', '13', '17'])}</Q>,
          options: [
            M('لا، لأنّ $\\dfrac{9}{2} = 4{,}5$ و $\\dfrac{13}{4} = 3{,}25$'),
            M('نعم، لأنّ الفرق بين عمودين متتاليين ثابت'),
            M('نعم، ومعامل التناسبية $4{,}5$'),
          ],
          correct: 0, cols: 1,
          explain: <MathText>{'حاصلا القسمة $\\dfrac{9}{2} = 4{,}5$ و $\\dfrac{13}{4} = 3{,}25$ مختلفان: ليس جدول تناسبية. ثبات الفرق (4) لا يجعله تناسبيا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tanasub-muamil_P2'] },
        },
        {
          id: 'E5', skill: 'ibara', requires: ['y-ax'],
          prompt: <Q><span>هذا الجدول جدول تناسبية. العلاقة بين سطريه هي:</span>{T([5, 10, 15], ['6', '12', '18'])}</Q>,
          options: [M('$y = 1{,}2 \\times x$'), M('$x = 1{,}2 \\times y$'), M('$y = x + 1$'), M('$y = 6 \\times x$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$\\dfrac{6}{5} = \\dfrac{12}{10} = \\dfrac{18}{15} = 1{,}2$ ، إذن $y = 1{,}2 \\times x$. أمّا $y = x + 1$ فتعطي $11$ من أجل $x = 10$ ، وليس $12$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_tanasub-muamil_P3'] },
        },
      ]}
      badges={[
        { id: 'muamil', emoji: '🧮', label: 'المعامل والرابع المتناسب', test: (m) => (m.muamil ?? 0) === 0 },
        { id: 'tamyiz', emoji: '🔍', label: 'تناسبية أم لا', test: (m) => (m.tamyiz ?? 0) === 0 },
        { id: 'ibara', emoji: '✍️', label: 'y = a × x', test: (m) => (m.ibara ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت التناسبية ومعامل التناسبية',
        title: 'انتهى الدرس 1',
        message: 'تعرف الآن جدول التناسبية ومعامله، وتكمل جدولا بالخواص أو بالرابع المتناسب، وتميّز وضعية تناسبية من وضعية فيها مبلغ ثابت، وتكتب العلاقة y = a × x.',
        verbs: ['أقسم', 'أكمل', 'أميّز', 'أكتب'],
        masterBadgeLabel: 'التناسبية ومعامل التناسبية',
      }}
    />
  );
}
