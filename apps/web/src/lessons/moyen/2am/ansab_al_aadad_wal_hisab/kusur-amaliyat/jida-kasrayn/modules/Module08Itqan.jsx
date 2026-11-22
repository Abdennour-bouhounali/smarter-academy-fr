import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme « على منوال » les examens du 1er trimestre, avec des nombres jamais vus dans la leçon (déclarées) ; chaque
 * mauvaise option encode une erreur réelle (la somme en croix, les dénominateurs additionnés, le produit en croix, n × a/b = na/nb, a/b de x = x × b/a, ÷ b seul, la fraction du reste prise du tout ou du dépensé).
 * Chaque option fausse est FAUSSE (recalculé dans content.test.js). Une الكفاءة principale par épreuve : E1, E4 → P1 ; E2 → P2 ; E3, E5 → P3.
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
        product: { label: 'جداء كسرين', module: 1 },
        natural: { label: 'عدد طبيعي في كسر', module: 2 },
        part: { label: 'كسر من كمية ومن الباقي', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'product', requires: ['qaida-jida'],
          prompt: <Q>احسب <MathText>{'$\\frac{2}{5}\\times\\frac{3}{7}$'}</MathText> .</Q>,
          options: [M('$\\frac{6}{35}$'), M('$\\frac{5}{12}$'), M('$\\frac{6}{12}$'), M('$\\frac{14}{15}$')],
          correct: 0, cols: 2,
          explain: <MathText>{'نضرب البسطين $2\\times 3=6$ والمقامين $5\\times 7=35$ . ($\\frac{5}{12}$ جمع البسطين والمقامين؛ و $\\frac{6}{12}$ ضرب البسطين وجمع المقامين؛ و $\\frac{14}{15}$ ضرب البسط في مقام الآخر.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jida-kasrayn_P1'] },
        },
        {
          id: 'E2', skill: 'natural', requires: ['adad-fi-kasr'],
          prompt: <Q>احسب <MathText>{'$4\\times\\frac{2}{9}$'}</MathText> .</Q>,
          options: [M('$\\frac{8}{9}$'), M('$\\frac{8}{36}$'), M('$\\frac{6}{9}$'), M('$\\frac{2}{36}$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$4=\\frac{4}{1}$ : $\\frac{4\\times 2}{9}=\\frac{8}{9}$ ، والمقام لا يُضرب في $4$ . ($\\frac{8}{36}$ ضرب المقام أيضًا؛ و $\\frac{6}{9}$ جمع بدل الضرب.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jida-kasrayn_P2'] },
        },
        {
          id: 'E3', skill: 'part', requires: ['kasr-min-adad'],
          prompt: <Q>ما <MathText>{'$\\frac{3}{4}$'}</MathText> من <MathText>{'$60$'}</MathText> ؟</Q>,
          options: [M('$45$'), M('$80$'), M('$15$'), M('$57$')],
          correct: 0, cols: 2,
          explain: <MathText>{'«من» ضرب: $60\\times\\frac{3}{4}=\\frac{180}{4}=45$ . ($80$ ضرب في $\\frac{4}{3}$ ؛ و $15$ قسمة على $4$ فقط؛ و $57$ طرح $3$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jida-kasrayn_P3'] },
        },
        {
          id: 'E4', skill: 'product', requires: ['qaida-jida'],
          prompt: <Q>احسب <MathText>{'$\\frac{2}{3}\\times\\frac{9}{10}$'}</MathText> وأعط النتيجة مختزلة.</Q>,
          options: [M('$\\frac{3}{5}$'), M('$\\frac{11}{13}$'), M('$\\frac{20}{27}$'), M('$\\frac{18}{10}$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$\\frac{2\\times 9}{3\\times 10}=\\frac{18}{30}=\\frac{3}{5}$ . ($\\frac{11}{13}$ جمع البسطين والمقامين؛ و $\\frac{20}{27}$ ضرب في الاتجاه المعاكس؛ و $\\frac{18}{10}$ نسيان المقام $3$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jida-kasrayn_P1'] },
        },
        {
          id: 'E5', skill: 'part', requires: ['kasr-min-baqi'],
          prompt: <Q>أنفق شخص <MathText>{'$\\frac{1}{3}$'}</MathText> من مبلغ ثم أنفق نصف الباقي. ما الكسر الذي أنفقه في المرّة الثانية من المبلغ كلّه؟</Q>,
          options: [M('$\\frac{1}{3}$'), M('$\\frac{1}{2}$'), M('$\\frac{1}{6}$'), M('$\\frac{5}{6}$')],
          correct: 0, cols: 2,
          explain: <MathText>{'الباقي $\\frac{2}{3}$ ونصفه $\\frac{1}{2}\\times\\frac{2}{3}=\\frac{1}{3}$ من المبلغ. ($\\frac{1}{2}$ نصف المبلغ كلّه؛ و $\\frac{1}{6}$ نصف الجزء المنفق؛ و $\\frac{5}{6}$ هو مجموع الكسور لا ما أُنفق ثانيةً.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jida-kasrayn_P3'] },
        },
      ]}
      badges={[
        { id: 'product', emoji: '🪟', label: 'أضرب كسرين', test: (m) => (m.product ?? 0) === 0 },
        { id: 'part', emoji: '🍊', label: 'كسر من كمية ومن الباقي', test: (m) => (m.part ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت جداء كسرين',
        title: 'انتهى درس جداء كسرين',
        message: 'تعرف الآن أن تضرب كسرين وتختزل، وتضرب عددًا في كسر، وتترجم «كسر من كمية» و«كسر من الباقي» إلى جداء. الدرس التالي: مقارنة كسرين.',
        verbs: ['أضرب', 'أختزل', 'أترجم', 'أحسب'],
        masterBadgeLabel: 'جداء كسرين',
      }}
    />
  );
}
