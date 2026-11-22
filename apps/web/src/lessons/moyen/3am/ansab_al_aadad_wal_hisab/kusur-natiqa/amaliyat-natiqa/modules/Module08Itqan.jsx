import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, de la plateforme (aucune n'est un exercice du manuel retapé). Les épreuves
 * restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce
 * module contient chaque option. Chaque distracteur est une erreur nommée (MISC-AMAL-* : signe de la somme, distances additionnées, BASE/ACROSS, signe du produit, division sans retournement,
 * dividende retourné, priorité oubliée).
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
        sum: { label: 'جمع عددين ناطقين', module: 1 },
        prod: { label: 'جداء عددين ناطقين', module: 1 },
        quot: { label: 'قسمة عددين ناطقين', module: 2 },
        chain: { label: 'سلسلة حسابات', module: 3 },
        compound: { label: 'كسر مركّب', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'sum', requires: ['jam-natiqa'],
          prompt: <Q source={PLATFORM}><MathText>{'$-\\frac{2}{3}+\\frac{1}{4}=$'}</MathText></Q>,
          options: ['$-\\frac{5}{12}$', '$\\frac{5}{12}$', '$-\\frac{1}{7}$', '$-\\frac{11}{12}$'], correct: 0, cols: 2,
          explain: <MathText>{'$\\frac{2}{3}=\\frac{8}{12}$ أبعد عن الصفر من $\\frac{1}{4}=\\frac{3}{12}$ ، فالناتج سالب: $-\\frac{8}{12}+\\frac{3}{12}=-\\frac{5}{12}$ . ($\\frac{5}{12}$ نسي الإشارة؛ $-\\frac{1}{7}$ جمع البسطين والمقامين؛ $-\\frac{11}{12}$ جمع المسافتين.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_amaliyat-natiqa_P1'] },
        },
        {
          id: 'E2', skill: 'prod', requires: ['jida-natiqa'],
          prompt: <Q source={PLATFORM}><MathText>{'$\\left(-\\frac{3}{5}\\right)\\times\\left(-\\frac{10}{9}\\right)=$'}</MathText></Q>,
          options: ['$\\frac{2}{3}$', '$-\\frac{2}{3}$', '$\\frac{3}{2}$', '$-\\frac{15}{7}$'], correct: 0, cols: 2,
          explain: <MathText>{'عاملان سالبان: الجداء موجب، $\\frac{30}{45}=\\frac{2}{3}$ . ($-\\frac{2}{3}$ أخطأ في الإشارة؛ $\\frac{3}{2}$ قلب الناتج؛ $-\\frac{15}{7}$ جمع المقامين.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_amaliyat-natiqa_P2'] },
        },
        {
          id: 'E3', skill: 'quot', requires: ['qisma-natiqa'],
          prompt: <Q source={PLATFORM}><MathText>{'$\\frac{4}{7}\\div\\left(-\\frac{2}{21}\\right)=$'}</MathText></Q>,
          options: ['$-6$', '$6$', '$-\\frac{8}{147}$', '$-\\frac{1}{6}$'], correct: 0, cols: 2,
          explain: <MathText>{'نقلب القاسم فيبقى سالبًا: $\\frac{4}{7}\\times\\left(-\\frac{21}{2}\\right)=-\\frac{84}{14}=-6$ . ($6$ أخطأ في الإشارة؛ $-\\frac{8}{147}$ ضرب دون قلب؛ $-\\frac{1}{6}$ قلب المقسوم.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_amaliyat-natiqa_P3'] },
        },
        {
          id: 'E4', skill: 'chain', requires: ['awlawiya'],
          prompt: <Q source={PLATFORM}><MathText>{'$\\frac{1}{2}-\\frac{3}{4}\\times\\frac{2}{3}=$'}</MathText></Q>,
          options: ['$0$', '$-\\frac{1}{6}$', '$1$', '$-\\frac{1}{2}$'], correct: 0, cols: 2,
          explain: <MathText>{'الضرب أوّلًا: $\\frac{3}{4}\\times\\frac{2}{3}=\\frac{1}{2}$ ثمّ $\\frac{1}{2}-\\frac{1}{2}=0$ . ($-\\frac{1}{6}$ حسب من اليسار إلى اليمين.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_amaliyat-natiqa_P4'] },
        },
        {
          id: 'E5', skill: 'compound', requires: ['tariqa-amaliyat'],
          prompt: <Q source={PLATFORM}><MathText>{'$\\dfrac{\\frac{2}{3}-1}{\\frac{1}{3}}=$'}</MathText></Q>,
          options: ['$-1$', '$-\\frac{1}{9}$', '$1$', '$\\frac{1}{3}$'], correct: 0, cols: 2,
          explain: <MathText>{'البسط $\\frac{2}{3}-1=-\\frac{1}{3}$ ، ثمّ نقسم على $\\frac{1}{3}$ فنضرب في $3$ : $-1$ . ($-\\frac{1}{9}$ ضرب دون قلب؛ $1$ نسي الإشارة.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_amaliyat-natiqa_P4'] },
        },
      ]}
      badges={[
        { id: 'sign', emoji: '🕹️', label: 'أتوقّع الإشارة', test: (m) => (m.sum ?? 0) === 0 && (m.prod ?? 0) === 0 },
        { id: 'chain', emoji: '🧲', label: 'أنظّم سلسلة حسابات', test: (m) => (m.chain ?? 0) === 0 && (m.compound ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'عرفت العمليات على الأعداد الناطقة',
        title: 'انتهى درس العمليات على الأعداد الناطقة',
        message: 'تعرف الآن أنّنا نعيّن إشارة الناتج أوّلًا ثمّ نحسب الكسر، وأنّنا نقسم بالضرب في مقلوب القاسم وللمقلوب إشارة العدد نفسه، وأنّنا ننجز السلسلة بالأولوية: الأقواس ثمّ الضرب والقسمة ثمّ الجمع والطرح.',
        verbs: ['أجمع', 'أضرب', 'أقسم'],
        masterBadgeLabel: 'العمليات على الأعداد الناطقة',
      }}
    />
  );
}
