import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 9 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. « أقوّم تعلّماتي » 4 et 5 (p. 59 : 12/16 et
 * 44/24, jamais posés ailleurs dans la leçon), découpés en trois épreuves, plus deux épreuves de la plateforme (2,45 en
 * fraction décimale ; 36/60 à réduire). Une الكفاءة principale par épreuve ; toutes les clés sont recalculées en fractions
 * exactes dans ../content/content.test.js.
 */
const PLATFORM = addition('final_test_item');
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;

export default function Module09Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(9)}
      moduleNumber={9}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة، ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        kitabat: { label: 'كتابات كسرية متساوية', module: 1 },
        ashri: { label: 'الكسر العشري والكتابة العشرية', module: 2 },
        ikhtizal: { label: 'اختزال كسر', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'kitabat', requires: ['kitabat-mutasawiya'],
          prompt: <Q source={SELF[4].source}>أيّ كتابة <strong>لا</strong> تساوي الكسر <MathText>{'$\\frac{12}{16}$'}</MathText>؟</Q>,
          options: ['3/4', '6/8', '24/28', '18/24'], correct: 2, cols: 2,
          explain: <MathText>{'$\\frac{12}{16}=\\frac{3}{4}=\\frac{6}{8}=\\frac{18}{24}$ ، أمّا $\\frac{24}{28}=\\frac{6}{7}$ : أضفنا 12 إلى البسط والمقام بدل أن نضرب.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_ikhtizal-kitaba-kasriya_P1'] },
        },
        {
          id: 'E2', skill: 'ikhtizal', requires: ['tariqat-ikhtizal'],
          prompt: <Q source={SELF[5].source}>أبسط شكل ممكن للكسر <MathText>{'$\\frac{44}{24}$'}</MathText> هو:</Q>,
          options: ['22/12', '11/6', '4/2'], correct: 1, cols: 3,
          explain: <MathText>{'$\\frac{44\\div 4}{24\\div 4}=\\frac{11}{6}$ ؛ $\\frac{22}{12}$ يساويه لكن يمكن اختزاله، و $\\frac{4}{2}=2$ لا يساويه.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_ikhtizal-kitaba-kasriya_P3'] },
        },
        {
          id: 'E3', skill: 'ashri', requires: ['kasr-ashri'],
          prompt: <Q source={SELF[4].source}>الكتابة العشرية للكسر <MathText>{'$\\frac{12}{16}$'}</MathText> هي:</Q>,
          options: ['1,216', '0,12', '0,75'], correct: 2, cols: 3,
          explain: <MathText>{'$\\frac{12}{16}=\\frac{3}{4}=\\frac{75}{100}=0{,}75$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_ikhtizal-kitaba-kasriya_P2'] },
        },
        {
          id: 'E4', skill: 'ashri', requires: ['kasr-ashri'],
          prompt: <Q source={PLATFORM}>العدد العشري 2,45 يساوي الكسر العشري:</Q>,
          options: ['245/100', '245/10', '2/45'], correct: 0, cols: 3,
          explain: <MathText>{'رقمان بعد الفاصلة: أجزاء من المئة. $2{,}45=\\frac{245}{100}$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_ikhtizal-kitaba-kasriya_P2'] },
        },
        {
          id: 'E5', skill: 'ikhtizal', requires: ['tariqat-ikhtizal'],
          prompt: <Q source={PLATFORM}>أبسط شكل ممكن للكسر <MathText>{'$\\frac{36}{60}$'}</MathText> هو:</Q>,
          options: ['6/10', '12/20', '3/5'], correct: 2, cols: 3,
          explain: <MathText>{'$\\frac{36\\div 12}{60\\div 12}=\\frac{3}{5}$ (مثلا ÷3 ثم ÷4) ؛ $\\frac{6}{10}$ و $\\frac{12}{20}$ يمكن اختزالهما.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_ikhtizal-kitaba-kasriya_P3'] },
        },
      ]}
      badges={[
        { id: 'ikhtizal', emoji: '✂️', label: 'أختزل حتى أبسط شكل', test: (m) => (m.ikhtizal ?? 0) === 0 },
        { id: 'ashri', emoji: '🔢', label: 'أضع الفاصلة في مكانها', test: (m) => (m.ashri ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت الكتابات الكسرية والاختزال',
        title: 'انتهى درس الكتابات الكسرية لحاصل قسمة واختزال كسر',
        message: 'تعرف الآن أنّ للعدد كتابات كسرية عديدة، وتمرّ من الكسر العشري إلى الكتابة العشرية، وتختزل كسرًا حتى أبسط شكل ممكن.',
        verbs: ['أكتب', 'أحوّل', 'أختزل'],
        masterBadgeLabel: 'الكتابات الكسرية والاختزال',
      }}
    />
  );
}
