import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, réécrites
 * à partir de « أؤكّد تعلّماتي » 22–25 (autres nombres) plus une épreuve de la plateforme sur a⁻ⁿ. Les épreuves restent LITTÉRALES
 * ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js
 * qui vérifie aussi que le source de ce module contient chaque option.
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
        sign: { label: 'قوة عدد نسبي وإشارتها', module: 1 },
        inverse: { label: 'الأس صفر والأس السالب', module: 1 },
        rules: { label: 'قواعد الحساب على القوى', module: 2 },
        priority: { label: 'أولوية القوى', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'sign', requires: ['ishara-quwa'],
          prompt: <Q source={SELF.E1.source}><MathText>{'$(-2)^5$ يساوي:'}</MathText></Q>,
          options: ['$-32$', '$32$', '$-10$', '$10$'], correct: 0, cols: 2,
          explain: <MathText>{'خمسة عوامل سالبة (عدد فردي): الجداء سالب، و $2^5 = 32$ ، إذن $(-2)^5 = -32$ . أمّا $\\pm 10$ فهو $5 \\times 2$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_quwat-adad-nisbi_P1'] },
        },
        {
          id: 'E2', skill: 'rules', requires: ['quwat-quwa'],
          prompt: <Q source={SELF.E2.source}><MathText>{'$(5^3)^4$ يساوي:'}</MathText></Q>,
          options: ['$5^{12}$', '$5^{7}$', '$5^{81}$', '$20^{3}$'], correct: 0, cols: 2,
          explain: <MathText>{'قوة قوة: نضرب الأسين، $(5^3)^4 = 5^{3 \\times 4} = 5^{12}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_quwat-adad-nisbi_P3'] },
        },
        {
          id: 'E3', skill: 'inverse', requires: ['quwa-salib'],
          prompt: <Q source={PLATFORM}><MathText>{'$4^{-2}$ يساوي:'}</MathText></Q>,
          options: ['$\\frac{1}{16}$', '$-16$', '$-8$', '$16$'], correct: 0, cols: 2,
          explain: <MathText>{'$4^{-2}$ مقلوب $4^2$ : $4^{-2} = \\frac{1}{16}$ . الأس السالب لا يجعل القوة سالبة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_quwat-adad-nisbi_P2'] },
        },
        {
          id: 'E4', skill: 'rules', requires: ['hasil-quwatayn'],
          prompt: <Q source={SELF.E4.source}><MathText>{'نصف العدد $2^{10}$ هو:'}</MathText></Q>,
          options: ['$2^{9}$', '$1^{10}$', '$2^{5}$', '$2^{8}$'], correct: 0, cols: 2,
          explain: <MathText>{'$\\frac{2^{10}}{2} = \\frac{2^{10}}{2^1} = 2^{10-1} = 2^9$ . ($2^5$ يقسم الأس على 2 .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_quwat-adad-nisbi_P3'] },
        },
        {
          id: 'E5', skill: 'priority', requires: ['awlawiya-quwa'],
          prompt: <Q source={SELF.E5.source}><MathText>{'$-3 \\times 4^2$ يساوي:'}</MathText></Q>,
          options: ['$-48$', '$144$', '$-144$', '$48$'], correct: 0, cols: 2,
          explain: <MathText>{'القوة أوّلًا: $4^2 = 16$ ، ثم $-3 \\times 16 = -48$ . ($144 = (-3 \\times 4)^2$ تبدأ بالضرب.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_quwat-adad-nisbi_P4'] },
        },
      ]}
      badges={[
        { id: 'sign', emoji: '➖', label: 'أعرف إشارة القوة', test: (m) => (m.sign ?? 0) === 0 },
        { id: 'rules', emoji: '🚂', label: 'أطبّق قواعد القوى', test: (m) => (m.rules ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت قوة عدد نسبي',
        title: 'انتهى درس قوة عدد نسبي',
        message: 'تعرف الآن أنّ $a^n$ جداء $n$ عاملًا يساوي $a$ وأنّ إشارتها تتبع زوجية الأس عندما يكون $a$ سالبًا، وأنّ $a^0 = 1$ و $a^{-n} = \\frac{1}{a^n}$ ، وتستعمل قواعد الحساب على القوى وأولويتها.',
        verbs: ['أحسب', 'أبسّط', 'أرتّب'],
        masterBadgeLabel: 'قوة عدد نسبي',
      }}
    />
  );
}
