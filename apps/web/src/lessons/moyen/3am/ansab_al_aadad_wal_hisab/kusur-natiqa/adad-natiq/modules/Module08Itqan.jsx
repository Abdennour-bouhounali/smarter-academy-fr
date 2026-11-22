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
 * module contient chaque option. Chaque distracteur est une erreur nommée (MISC-NATIQ-* : signe perdu, deux négatifs pris pour un négatif, −11/4 entre −2 et −1, ordre des négatifs par distance,
 * « une fraction négative n'est pas décimale »).
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
        maqam: { label: 'الكتابة بمقام موجب', module: 1 },
        twoneg: { label: 'إشارتان سالبتان', module: 1 },
        place: { label: 'مكان العدد على المستقيم', module: 3 },
        order: { label: 'ترتيب الأعداد الناطقة', module: 3 },
        decimal: { label: 'عشري أم لا', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'maqam', requires: ['maqam-mujab'],
          prompt: <Q source={PLATFORM}><MathText>{'أيّ عدد يساوي $\\frac{9}{-12}$ ؟'}</MathText></Q>,
          options: ['$-\\frac{3}{4}$', '$\\frac{3}{4}$', '$\\frac{4}{3}$', '$-\\frac{12}{9}$'], correct: 0, cols: 2,
          explain: <MathText>{'$\\frac{9}{-12}=-\\frac{9}{12}=-\\frac{3}{4}$ . ($\\frac{3}{4}$ أسقط الإشارة؛ $\\frac{4}{3}$ و $-\\frac{12}{9}$ قلبا الكسر.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_adad-natiq_P2'] },
        },
        {
          id: 'E2', skill: 'twoneg', requires: ['adad-natiq'],
          prompt: <Q source={PLATFORM}><MathText>{'$\\frac{-14}{-6}=$'}</MathText></Q>,
          options: ['$\\frac{7}{3}$', '$-\\frac{7}{3}$', '$-\\frac{3}{7}$', '$\\frac{3}{7}$'], correct: 0, cols: 2,
          explain: <MathText>{'عددان سالبان: الحاصل موجب، $\\frac{-14}{-6}=\\frac{14}{6}=\\frac{7}{3}$ . ($-\\frac{7}{3}$ جعل الحاصل سالبًا؛ والباقيان قلبا الكسر.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_adad-natiq_P2'] },
        },
        {
          id: 'E3', skill: 'place', requires: ['tartib-natiqa'],
          prompt: <Q source={PLATFORM}><MathText>{'يقع العدد $-\\frac{11}{4}$ بين'}</MathText></Q>,
          options: ['$-3$ و $-2$', '$-2$ و $-1$', '$2$ و $3$', '$-4$ و $-3$'], correct: 0, cols: 2,
          explain: <MathText>{'$\\frac{11}{4}=2+\\frac{3}{4}$ ، فعلى يسار الصفر $-\\frac{11}{4}$ بين $-3$ و $-2$ . ($-2$ و $-1$ نسي أنّ الجزء الكسري يبعده عن الصفر؛ $2$ و $3$ أسقط الإشارة.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_adad-natiq_P3'] },
        },
        {
          id: 'E4', skill: 'order', requires: ['tartib-natiqa'],
          prompt: <Q source={PLATFORM}><MathText>{'الترتيب التصاعدي للأعداد $-\\frac{5}{6}$ ، $-\\frac{3}{4}$ ، $-\\frac{2}{3}$ هو'}</MathText></Q>,
          options: ['$-\\frac{5}{6}<-\\frac{3}{4}<-\\frac{2}{3}$', '$-\\frac{2}{3}<-\\frac{3}{4}<-\\frac{5}{6}$', '$-\\frac{3}{4}<-\\frac{5}{6}<-\\frac{2}{3}$'], correct: 0, cols: 1,
          explain: <MathText>{'بالمقام $12$ : $-\\frac{10}{12}<-\\frac{9}{12}<-\\frac{8}{12}$ . (الخيار الثاني رتّب حسب القرب من الصفر.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_adad-natiq_P3'] },
        },
        {
          id: 'E5', skill: 'decimal', requires: ['adad-natiq-shamil'],
          prompt: <Q source={PLATFORM}><MathText>{'أيّ هذه الأعداد ليس عشريًّا؟'}</MathText></Q>,
          options: ['$\\frac{5}{12}$', '$\\frac{7}{8}$', '$-\\frac{9}{20}$', '$-\\frac{13}{25}$'], correct: 0, cols: 2,
          explain: <MathText>{'$12=2\\times2\\times3$ فيه العامل $3$ ، فالعدد ناطق وليس عشريًّا؛ أمّا $8$ و $20$ و $25$ فلا عوامل أوّلية فيها إلا $2$ و $5$ . (العدد السالب قد يكون عشريًّا.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_adad-natiq_P1'] },
        },
      ]}
      badges={[
        { id: 'maqam', emoji: '🧺', label: 'أكتب بمقام موجب', test: (m) => (m.maqam ?? 0) === 0 && (m.twoneg ?? 0) === 0 },
        { id: 'order', emoji: '↔️', label: 'أرتّب الأعداد الناطقة', test: (m) => (m.order ?? 0) === 0 && (m.place ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'عرفت العدد الناطق',
        title: 'انتهى درس العدد الناطق',
        message: 'تعرف الآن أنّ العدد الناطق حاصل قسمة عددين نسبيين، له مكان واحد على المستقيم وكتابات كثيرة، وكتابته المعيارية بمقام موجب، وأنّنا نرتّب الأعداد الناطقة بمقام موجب مشترك.',
        verbs: ['أكتب', 'أقارن', 'أرتّب'],
        masterBadgeLabel: 'العدد الناطق',
      }}
    />
  );
}
