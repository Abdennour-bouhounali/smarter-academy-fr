import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, de la plateforme
 * (autres nombres que ceux des modules). Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données,
 * recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
 */
const PLATFORM = addition('final_test_item');
const Q = ({ children }) => <span>{children} <SourceTag source={PLATFORM} /></span>;

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="8 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={8 * 60}
      timerLabel="8 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة، ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        sign: { label: 'إشارة جداء عدة أعداد', module: 1 },
        opposite: { label: 'الضرب في (−1)', module: 1 },
        square: { label: 'مربّع عدد نسبي', module: 2 },
        product: { label: 'حساب جداء عدة أعداد', module: 3 },
        distribute: { label: 'توزيع الضرب', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'sign', requires: ['adad-salib'],
          prompt: <Q><MathText>{'ما إشارة الجداء $(-2) \\times 5 \\times (-3) \\times (-1) \\times 4$ ؟'}</MathText></Q>,
          options: ['سالب', 'موجب', 'لا يمكن معرفته', 'معدوم'], correct: 0, cols: 2,
          explain: <MathText>{'عدد العوامل السالبة ثلاثة، وهو عدد فردي: الجداء سالب. (الأكثرية للعوامل الموجبة لا تحسم، وليس فيه عامل معدوم.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jidaa-ida-nisbiya_P2'] },
        },
        {
          id: 'E2', skill: 'opposite', requires: ['maakus'],
          prompt: <Q><MathText>{'$(-1) \\times (-7{,}5)$ يساوي:'}</MathText></Q>,
          options: ['$7{,}5$', '$-7{,}5$', '$-8{,}5$', '$6{,}5$'], correct: 0, cols: 2,
          explain: <MathText>{'الضرب في $-1$ يعطي المعاكس، ومعاكس $-7{,}5$ هو $7{,}5$ . ($-8{,}5$ هو $-7{,}5 - 1$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jidaa-ida-nisbiya_P1'] },
        },
        {
          id: 'E3', skill: 'square', requires: ['murabba'],
          prompt: <Q><MathText>{'$(-0{,}3)^2$ يساوي:'}</MathText></Q>,
          options: ['$0{,}09$', '$-0{,}09$', '$0{,}9$', '$-0{,}6$'], correct: 0, cols: 2,
          explain: <MathText>{'$(-0{,}3)^2 = (-0{,}3) \\times (-0{,}3) = 0{,}09$ : مربّع عدد لا يكون سالبًا، والفاصلة بعد رقمين. ($0{,}9$ ينسى الفاصلة، و $-0{,}6$ هو ضعف $-0{,}3$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jidaa-ida-nisbiya_P3'] },
        },
        {
          id: 'E4', skill: 'product', requires: ['tariqat-iddat'],
          prompt: <Q><MathText>{'$(-5) \\times 0{,}2 \\times (-4) \\times (-10)$ يساوي:'}</MathText></Q>,
          options: ['$-40$', '$40$', '$-4$', '$-400$'], correct: 0, cols: 2,
          explain: <MathText>{'ثلاثة عوامل سالبة: الجداء سالب. $5 \\times 0{,}2 = 1$ ثم $1 \\times 4 \\times 10 = 40$ ، إذن $-40$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jidaa-ida-nisbiya_P2'] },
        },
        {
          id: 'E5', skill: 'distribute', requires: ['tawzi-aadad'],
          prompt: <Q><MathText>{'$(-6) \\times 17 + (-6) \\times 3$ يساوي:'}</MathText></Q>,
          options: ['$-120$', '$120$', '$-99$', '$-20$'], correct: 0, cols: 2,
          explain: <MathText>{'نخرج العامل المشترك: $(-6) \\times (17 + 3) = (-6) \\times 20 = -120$ . ($-99$ ينسى أنّ الجداء الثاني سالب أيضًا.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jidaa-ida-nisbiya_P4'] },
        },
      ]}
      badges={[
        { id: 'sign', emoji: '➖', label: 'أعيّن إشارة جداء عدة أعداد', test: (m) => (m.sign ?? 0) === 0 && (m.product ?? 0) === 0 },
        { id: 'distribute', emoji: '🤖', label: 'أوزّع الضرب لأحسب ذهنيًا', test: (m) => (m.distribute ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت جداء عدة أعداد نسبية',
        title: 'انتهى درس جداء عدة أعداد نسبية',
        message: 'تعرف الآن أنّ إشارة جداء عدة أعداد تتبع زوجية عدد عوامله السالبة، وأنّ الضرب في (−1) يعطي المعاكس، وأنّ مربّع عدد لا يكون سالبًا، وتوزّع الضرب لتحسب ذهنيًا.',
        verbs: ['أعيّن الإشارة', 'أحسب', 'أوزّع'],
        masterBadgeLabel: 'جداء عدة أعداد نسبية',
      }}
    />
  );
}
