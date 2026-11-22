import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { src, addition } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la
 * leçon. Cinq épreuves, une nature d'identité par épreuve : les QCM 7, 8 et 13
 * de « أؤكّد تعلّماتي » (p. 40, extraction → qcm › duplicatedIn), puis deux
 * épreuves de la plateforme (déclarées) pour P3 et un second calcul mental.
 * Chaque distracteur est FAUX et vient d'une erreur réelle (2ab oublié,
 * coefficient non élevé au carré, (a − b)² = a² − b², 99² = 100² − 1²).
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const m = (tex) => <MathText key={tex}>{tex}</MathText>;
const QCM = (n) => src('qcm', 40, 'أؤكّد تعلّماتي', n);

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="7 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        majmu: { label: 'مربع مجموع', module: 1 },
        farq: { label: 'مربع فرق', module: 1 },
        jidaa: { label: 'جداء مجموع حدين وفرقهما', module: 2 },
        dhihni: { label: 'الحساب الذهني', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'majmu', requires: ['murabba-majmu'],
          prompt: <Q source={QCM(7)}>نشر العبارة <MathText>{'$(\\sqrt{3} + x)^2$'}</MathText> هو ........</Q>,
          options: ['$3 + x^2$', '$\\sqrt{3} + x^2$', '$3 + 2\\sqrt{3}x + x^2$'].map(m),
          optionLabel: (i) => ['3 + x²', '√3 + x²', '3 + 2√3x + x²'][i],
          correct: 2, cols: 1,
          explain: <MathText>{'$(\\sqrt{3})^2 + 2 \\times \\sqrt{3} \\times x + x^2 = 3 + 2\\sqrt{3}x + x^2$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mutatabiqat-shahira_P1'] },
        },
        {
          id: 'E2', skill: 'farq', requires: ['murabba-farq'],
          prompt: <Q source={QCM(8)}>نشر العبارة <MathText>{'$(1 - \\sqrt{2}x)^2$'}</MathText> هو ........</Q>,
          options: ['$1 - 2x^2$', '$1 - 2\\sqrt{2}x + 2x^2$', '$-2x^2$'].map(m),
          optionLabel: (i) => ['1 − 2x²', '1 − 2√2x + 2x²', '−2x²'][i],
          correct: 1, cols: 1,
          explain: <MathText>{'$1^2 - 2 \\times 1 \\times \\sqrt{2}x + (\\sqrt{2}x)^2 = 1 - 2\\sqrt{2}x + 2x^2$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mutatabiqat-shahira_P2'] },
        },
        {
          id: 'E3', skill: 'jidaa', requires: ['jidaa-majmu-farq'],
          prompt: <Q source={addition('interaction_generation')}>نشر الجداء <MathText>{'$(2x + 7)(2x - 7)$'}</MathText> هو ........</Q>,
          options: ['$2x^2 - 49$', '$4x^2 + 49$', '$4x^2 - 49$', '$4x^2 - 28x - 49$'].map(m),
          optionLabel: (i) => ['2x² − 49', '4x² + 49', '4x² − 49', '4x² − 28x − 49'][i],
          correct: 2, cols: 2,
          explain: <MathText>{'$(2x)^2 - 7^2 = 4x^2 - 49$ : الحدّان $-14x$ و $+14x$ يتعادمان.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mutatabiqat-shahira_P3'] },
        },
        {
          id: 'E4', skill: 'dhihni', requires: ['jidaa-majmu-farq', 'hisab-mutamaan'],
          prompt: <Q source={QCM(13)}>الجداء <MathText>{'$19 \\times 21$'}</MathText> يساوي</Q>,
          options: ['$399$', '$401$', '$309$'].map(m),
          optionLabel: (i) => ['399', '401', '309'][i],
          correct: 0, cols: 3,
          explain: <MathText>{'$(20 - 1)(20 + 1) = 20^2 - 1^2 = 400 - 1 = 399$'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mutatabiqat-shahira_P4'] },
        },
        {
          id: 'E5', skill: 'dhihni', requires: ['murabba-farq', 'hisab-mutamaan'],
          prompt: <Q source={addition('interaction_generation')}>دون وضع العملية، العدد <MathText>{'$99^2$'}</MathText> يساوي ...</Q>,
          options: ['$9999$', '$9801$', '$8181$', '$10\\,199$'].map(m),
          optionLabel: (i) => ['9999', '9801', '8181', '10199'][i],
          correct: 1, cols: 2,
          explain: <MathText>{'$(100 - 1)^2 = 10\\,000 - 200 + 1 = 9801$ ، أما $100^2 - 1^2 = 9999$ فهو $101 \\times 99$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_mutatabiqat-shahira_P4'] },
        },
      ]}
      badges={[
        { id: 'murabba', emoji: '²', label: 'لا أنسى الحد المضاعف', test: (s) => (s.majmu ?? 0) === 0 && (s.farq ?? 0) === 0 },
        { id: 'dhihni', emoji: '🧠', label: 'أحسب ذهنيا بمتطابقة', test: (s) => (s.dhihni ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت المتطابقات الشهيرة',
        title: 'انتهى درس المتطابقات الشهيرة',
        message: 'تعرف الآن مربع مجموع ومربع فرق وجداء مجموع حدين وفرقهما، وتنشر بها العبارات وتحسب ذهنيا دون وضع العملية. الدرس التالي يقرؤها في الاتجاه الآخر: التحليل.',
        verbs: ['أنشر', 'أبسّط', 'أتعرّف', 'أحسب ذهنيا'],
        masterBadgeLabel: 'المتطابقات الشهيرة',
      }}
    />
  );
}
