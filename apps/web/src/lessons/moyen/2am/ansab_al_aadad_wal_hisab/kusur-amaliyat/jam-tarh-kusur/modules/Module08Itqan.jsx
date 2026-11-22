import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme « على منوال » les examens du 1er trimestre, avec des nombres jamais vus dans la leçon (déclarées) ; chaque
 * mauvaise option encode une erreur réelle (additionner numérateurs ET dénominateurs, ne changer que le dénominateur, additionner aussi les dénominateurs d'une même base, donner la part pour le reste, le reste pour
 * la somme). Chaque option fausse est FAUSSE (recalculé dans content.test.js). Une الكفاءة principale par épreuve : E1, E2, E5 → P2 ; E3 → P3 ; E4 → P1.
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
        same: { label: 'جمع كسرين لهما نفس المقام', module: 1 },
        unify: { label: 'توحيد المقامين ثم الجمع أو الطرح', module: 3 },
        rest: { label: 'الباقي من الكلّ', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'unify', requires: ['qaida-jam-tarh'],
          prompt: <Q>احسب <MathText>{'$\\frac{3}{8}+\\frac{1}{4}$'}</MathText> .</Q>,
          options: [M('$\\frac{5}{8}$'), M('$\\frac{4}{12}$'), M('$\\frac{4}{8}$'), M('$\\frac{5}{12}$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$8=4\\times 2$ : $\\frac{1}{4}=\\frac{2}{8}$ ثم $\\frac{3}{8}+\\frac{2}{8}=\\frac{5}{8}$ . ($\\frac{4}{12}$ جمع البسطين والمقامين؛ و $\\frac{4}{8}$ لم يحوّل الربع: $1$ بدل $2$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jam-tarh-kusur_P2'] },
        },
        {
          id: 'E2', skill: 'unify', requires: ['qaida-jam-tarh'],
          prompt: <Q>احسب <MathText>{'$\\frac{7}{10}-\\frac{2}{5}$'}</MathText> .</Q>,
          options: [M('$\\frac{3}{10}$'), M('$\\frac{5}{5}$'), M('$\\frac{5}{10}$'), M('$\\frac{3}{5}$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$10=5\\times 2$ : $\\frac{2}{5}=\\frac{4}{10}$ ثم $\\frac{7}{10}-\\frac{4}{10}=\\frac{3}{10}$ . ($\\frac{5}{5}$ طرح البسطين والمقامين؛ و $\\frac{5}{10}$ لم يحوّل $\\frac{2}{5}$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jam-tarh-kusur_P2'] },
        },
        {
          id: 'E3', skill: 'rest', requires: ['al-baqi'],
          prompt: <Q>احسب <MathText>{'$1-\\frac{5}{9}$'}</MathText> .</Q>,
          options: [M('$\\frac{4}{9}$'), M('$\\frac{5}{9}$'), M('$\\frac{4}{8}$'), M('$\\frac{4}{10}$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$1=\\frac{9}{9}$ ، و $\\frac{9}{9}-\\frac{5}{9}=\\frac{4}{9}$ . ($\\frac{5}{9}$ هو الجزء المأخوذ لا الباقي؛ و $\\frac{4}{8}$ طرح من البسط والمقام معًا.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jam-tarh-kusur_P3'] },
        },
        {
          id: 'E4', skill: 'same', requires: ['qaida-jam-tarh'],
          prompt: <Q>احسب <MathText>{'$\\frac{13}{15}+\\frac{4}{15}$'}</MathText> .</Q>,
          options: [M('$\\frac{17}{15}$'), M('$\\frac{17}{30}$'), M('$\\frac{17}{225}$'), M('$\\frac{9}{15}$')],
          correct: 0, cols: 2,
          explain: <MathText>{'المقام نفسه: $13+4=17$ ونحافظ على المقام $15$ ، فالمجموع أكبر من $1$ . ($\\frac{17}{30}$ جمع المقامين أيضًا؛ و $\\frac{9}{15}$ طرح بدل الجمع.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jam-tarh-kusur_P1'] },
        },
        {
          id: 'E5', skill: 'unify', requires: ['qaida-jam-tarh'],
          prompt: <Q>زُرع <MathText>{'$\\frac{4}{15}$'}</MathText> من حقل قمحًا و <MathText>{'$\\frac{2}{5}$'}</MathText> منه شعيرًا. ما الجزء المزروع من الحقل؟</Q>,
          options: [M('$\\frac{10}{15}=\\frac{2}{3}$'), M('$\\frac{6}{20}$'), M('$\\frac{6}{15}$'), M('$\\frac{1}{3}$')],
          correct: 0, cols: 2,
          explain: <MathText>{'$15=5\\times 3$ : $\\frac{2}{5}=\\frac{6}{15}$ ، ثم $\\frac{4}{15}+\\frac{6}{15}=\\frac{10}{15}=\\frac{2}{3}$ . ($\\frac{6}{20}$ جمع المقامين؛ و $\\frac{1}{3}$ هو الجزء الباقي لا المزروع.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_jam-tarh-kusur_P2'] },
        },
      ]}
      badges={[
        { id: 'unify', emoji: '🥾', label: 'أوحّد المقامين وأجمع', test: (m) => (m.unify ?? 0) === 0 },
        { id: 'rest', emoji: '🏁', label: 'أحسب الباقي من الكلّ', test: (m) => (m.rest ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت جمع الكسور وطرحها',
        title: 'انتهى درس جمع وطرح كسرين',
        message: 'تعرف الآن أن توحّد مقامين أحدهما مضاعف للآخر، وتجمع وتطرح البسطين وتختزل، وتحسب الباقي من الكلّ. الدرس التالي: جداء كسرين.',
        verbs: ['أوحّد', 'أجمع', 'أطرح', 'أختزل'],
        masterBadgeLabel: 'جمع وطرح كسرين',
      }}
    />
  );
}
