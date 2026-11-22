import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, réécrites à
 * partir de « أؤكّد تعلّماتي » 1–5 (autres nombres, plus des épreuves de la plateforme sur la distributivité et le film du labo). Les
 * épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt par
 * ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;

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
        product: { label: 'جداء عددين نسبيين', module: 3 },
        sign: { label: 'قاعدة الإشارات', module: 1 },
        justify: { label: 'تبرير جداء سالبين', module: 2 },
        film: { label: 'المصعد: السرعة والزمن', module: 1 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'film', requires: ['jidaa-jamaa'],
          prompt: <Q source={SELF.E1.source}>ينزل مصعد 4 طوابق في كل دقيقة، ويمرّ الآن بالطابق الأرضي. في أيّ طابق يكون بعد 5 دقائق؟</Q>,
          options: ['الطابق −20', 'الطابق 20', 'الطابق 1', 'الطابق −9'], correct: 0, cols: 2,
          explain: <MathText>{'كل دقيقة تضيف $-4$ ، وبعد 5 دقائق نجمع خمسة حدود كلّها $-4$ : $(-4) \\times 5 = -20$ . ($1$ و $-9$ جمع لا ضرب، و $20$ ينسى أنّ المصعد ينزل.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P1'] },
        },
        {
          id: 'E2', skill: 'product', requires: ['tariqat-jidaa'],
          prompt: <Q source={SELF.E2.source}><MathText>{'$7 \\times (-0{,}6)$ يساوي:'}</MathText></Q>,
          options: ['$-4{,}2$', '$4{,}2$', '$-42$', '$6{,}4$'], correct: 0, cols: 2,
          explain: <MathText>{'إشارتان مختلفتان: سالب. $7 \\times 0{,}6 = 4{,}2$ ، إذن $-4{,}2$ . ($-42$ ينسى الفاصلة، و $6{,}4$ هو المجموع.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P4'] },
        },
        {
          id: 'E3', skill: 'sign', requires: ['ishara-jidaa'],
          prompt: <Q source={SELF.E3.source}>جداء عددين نسبيين موجب، إذن:</Q>,
          options: ['للعددين الإشارة نفسها', 'كلاهما موجب', 'أحدهما سالب', 'أحدهما أبعد عن الصفر'], correct: 0, cols: 1,
          explain: <MathText>{'الجداء الموجب يتحقق بعددين موجبين أو بعددين سالبين: $(-2) \\times (-3) = 6$ . فالشرط هو الإشارة نفسها، لا أن يكونا موجبين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P2'] },
        },
        {
          id: 'E4', skill: 'justify', requires: ['tabrir-tawzi'],
          prompt: <Q source={SELF.E4.source}><MathText>{'$(-5) \\times 3 + (-5) \\times (-3)$ يساوي:'}</MathText></Q>,
          options: ['$0$', '$-30$', '$30$', '$-15$'], correct: 0, cols: 2,
          explain: <MathText>{'$(-5) \\times 3 + (-5) \\times (-3) = (-5) \\times \\big(3 + (-3)\\big) = (-5) \\times 0 = 0$ . ($-15 + 15 = 0$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P3'] },
        },
        {
          id: 'E5', skill: 'film', requires: ['ishara-jidaa'],
          prompt: <Q source={SELF.E5.source}>ينزل مصعد 4 طوابق في الدقيقة ويمرّ الآن بالطابق الأرضي. في أيّ طابق كان قبل دقيقتين؟</Q>,
          options: ['الطابق 8', 'الطابق −8', 'الطابق −2', 'الطابق 2'], correct: 0, cols: 2, keepOrder: false,
          explain: <MathText>{'الزمن $-2$ والسرعة $-4$ : $(-4) \\times (-2) = 8$ ، فالمصعد كان في الطابق 8 فوق الشارع.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_jidaa-adadayn-nisbiyayn_P2'] },
        },
      ]}
      badges={[
        { id: 'sign', emoji: '➖', label: 'أعرف قاعدة الإشارات', test: (m) => (m.sign ?? 0) === 0 },
        { id: 'product', emoji: '🛗', label: 'أحسب جداء عددين نسبيين', test: (m) => (m.product ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت جداء عددين نسبيين',
        title: 'انتهى درس جداء عددين نسبيين',
        message: 'تعرف الآن أنّ جداء عددين نسبيين موجب إذا كان لهما الإشارة نفسها وسالب إذا اختلفت إشارتاهما، وتبرّر ذلك بالخاصية التوزيعية، وتحسبه بتعيين إشارته ثم ضرب المسافتين إلى الصفر.',
        verbs: ['أحسب', 'أعيّن الإشارة', 'أبرّر'],
        masterBadgeLabel: 'جداء عددين نسبيين',
      }}
    />
  );
}
