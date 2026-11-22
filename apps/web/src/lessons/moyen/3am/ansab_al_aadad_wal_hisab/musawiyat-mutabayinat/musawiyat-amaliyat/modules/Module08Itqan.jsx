import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, réécrites à partir de
 * « أؤكّد تعلّماتي » 1–2 (autres nombres) plus trois épreuves de la plateforme. Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL`
 * (content/exercises.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce module
 * contient chaque option.
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
        addsub: { label: 'الجمع والطرح على الطرفين', module: 1 },
        muldiv: { label: 'الضرب والقسمة على الطرفين', module: 2 },
        transform: { label: 'تحويل مساواة والحكم عليها', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'addsub', requires: ['musawat-jam'],
          prompt: <Q source={SELF.E1.source}><MathText>{'إذا كان $a = -7$ فإنّ $a + 7$ يساوي:'}</MathText></Q>,
          options: ['$0$', '$-14$', '$14$', '$-49$'], correct: 0, cols: 2,
          explain: <MathText>{'نضيف $7$ إلى طرفي $a = -7$ : $a + 7 = -7 + 7 = 0$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_musawiyat-amaliyat_P1'] },
        },
        {
          id: 'E2', skill: 'transform', requires: ['tahwil'],
          prompt: <Q source={SELF.E2.source}><MathText>{'إذا كان $3b - 5 = 0$ فإنّ $b$ يساوي:'}</MathText></Q>,
          options: ['$\\frac{5}{3}$', '$\\frac{3}{5}$', '$-\\frac{5}{3}$', '$2$'], correct: 0, cols: 2,
          explain: <MathText>{'نضيف $5$ إلى الطرفين: $3b = 5$ ، ثم نقسمهما على $3$ : $b = \\frac{5}{3}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_musawiyat-amaliyat_P3'] },
        },
        {
          id: 'E3', skill: 'muldiv', requires: ['musawat-darb'],
          prompt: <Q source={PLATFORM}><MathText>{'إذا كان $a = b$ فإنّ $a \\times (-3)$ يساوي:'}</MathText></Q>,
          options: ['$b \\times (-3)$', '$b \\div (-3)$', '$b + (-3)$', '$-3 \\times b + 3$'], correct: 0, cols: 2,
          explain: <MathText>{'نضرب طرفي $a = b$ في $-3$ : $a \\times (-3) = b \\times (-3)$ . المساواة تبقى عند الضرب في عدد سالب.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_musawiyat-amaliyat_P2'] },
        },
        {
          id: 'E4', skill: 'muldiv', requires: ['sifr'],
          prompt: <Q source={PLATFORM}><MathText>{'إذا كان $a = b$ و $c \\neq 0$ فأيّ الجمل الآتية صحيحة دائمًا؟'}</MathText></Q>,
          options: ['$\\frac{a}{c} = \\frac{b}{c}$', '$\\frac{a}{0} = \\frac{b}{0}$', '$a \\times 0 = b$', '$\\frac{a}{c} = b$'], correct: 0, cols: 2,
          explain: <MathText>{'نقسم الطرفين على العدد نفسه غير المعدوم $c$ . لا قسمة على $0$ ، و $a \\times 0 = 0$ لا تساوي $b$ عمومًا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_musawiyat-amaliyat_P2'] },
        },
        {
          id: 'E5', skill: 'transform', requires: ['hukm'],
          prompt: <Q source={PLATFORM}><MathText>{'إذا كان $5 = 3x - 1$ فإنّ المساواة $3x + 2 = 5$ :'}</MathText></Q>,
          options: ['خاطئة، لأنّ بإضافة $3$ إلى الطرفين نجد $8 = 3x + 2$', 'صحيحة، لأنّ إضافة $3$ إلى الطرف الأيمن تعطي $3x + 2$', 'صحيحة، لأنّ $5 = 5$', 'لا يمكن الحكم عليها'], correct: 0, cols: 1,
          explain: <MathText>{'نضيف $3$ إلى الطرفين: $5 + 3 = 3x - 1 + 3$ أي $8 = 3x + 2$ ؛ فـ $3x + 2 = 5$ خاطئة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_musawiyat-amaliyat_P3'] },
        },
      ]}
      badges={[
        { id: 'both', emoji: '🏃', label: 'أُجري العملية على الطرفين', test: (m) => (m.addsub ?? 0) === 0 },
        { id: 'scale', emoji: '✖️', label: 'أضرب وأقسم بإتقان', test: (m) => (m.muldiv ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت المساويات والعمليات',
        title: 'انتهى درس المساويات والعمليات',
        message: 'تعرف الآن أنّ العملية نفسها بالعدد نفسه على طرفي مساواة تُبقيها صحيحة (وأنّ القسمة على 0 مستحيلة)، وأنّها إذا مسّت طرفًا واحدًا كسرتها، وتحوّل مساواة معطاة إلى أخرى.',
        verbs: ['أضيف', 'أضرب', 'أحوّل'],
        masterBadgeLabel: 'المساويات والعمليات',
      }}
    />
  );
}
