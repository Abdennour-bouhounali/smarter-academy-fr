import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION } from '../content/textbook';

/**
 * Module 8 — وضعية الاختبار النهائي (stage: evaluation) : la résolution de la situation de Sétif et Montréal en cinq épreuves qui suivent les trois étapes. Les épreuves
 * restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/textbook.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js, qui vérifie que ce fichier
 * contient chaque option. Chaque distracteur est FAUX et porte une erreur de l'unité (signe de la somme, signe perdu, priorité, chaîne inverse mal ordonnée). LP : P1.
 */
const Q = ({ children }) => <span>{typeof children === 'string' ? <MathText>{children}</MathText> : children} <SourceTag source={SITUATION.source} /></span>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Ahill() {
  return (
    <BossFinal
      ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="خمس مراحل: التحويل والمقارنة والتحقّق" estimatedTime="12 دقيقة"
      lessonConfig={LESSON_CONFIG} timerSeconds={12 * 60} timerLabel="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي', title: 'أيّ المدينتين أشدّ برودة؟', tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p> }}
      skills={{
        fahrenheit: { label: 'التحويل إلى الفهرنهايت', module: 1 },
        celsius: { label: 'التحويل إلى السيلسيوس', module: 7 },
        compare: { label: 'المقارنة بسلّم واحد', module: 7 },
        verify: { label: 'التحقّق بالتعويض', module: 6 },
      }}
      epreuves={[
        { id: 'E1', skill: 'fahrenheit', requires: ['jidaa-nisbi'], prompt: <Q>المرحلة 1 — درجة الحرارة في سطيف بالفهرنهايت هي ...</Q>,
          options: opts(['$1{,}8 \\times (-3) + 32 = 26{,}6$', '$-5{,}4 - 32 = -37{,}4$', '$1{,}8 \\times 3 + 32 = 37{,}4$', '$1{,}8 \\times (-3 + 32) = 52{,}2$']), correct: 0, cols: 1,
          explain: <MathText>{'$1{,}8 \\times (-3) = -5{,}4$ (إشارتان مختلفتان) ثم $-5{,}4 + 32 = 26{,}6$ . الخطأ الأوّل جمع $32$ كأنّه طُرح، والثاني أسقط الإشارة، والثالث أجرى الجمع قبل الضرب.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'] } },
        { id: 'E2', skill: 'celsius', requires: ['qisma-nisbi', 'awlawiya-amaliyat'], prompt: <Q>المرحلة 2 — درجة الحرارة في مونتريال بالسيلسيوس هي ...</Q>,
          options: opts(['$(-13 - 32) \\div 1{,}8 = -25$', '$(-13 + 32) \\div 1{,}8 \\approx 10{,}56$', '$-13 - 32 \\div 1{,}8 \\approx -30{,}78$', '$(-13 - 32) \\times 1{,}8 = -81$']), correct: 0, cols: 1,
          explain: <MathText>{'نعكس السلسلة: $-13 - 32 = -45$ ثم $(-45) \\div 1{,}8 = -25$ . نتحقّق: $1{,}8 \\times (-25) + 32 = -45 + 32 = -13$ .'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'] } },
        { id: 'E3', skill: 'compare', requires: ['majmu-jabri'], prompt: <Q>المرحلة 3 — أيّ المدينتين أشدّ برودة؟</Q>,
          options: opts(['مونتريال، لأنّ $-25 < -3$ (بالسيلسيوس)', 'سطيف، لأنّ $-3 < -13$', 'سطيف، لأنّ $-3\\,^\\circ\\mathrm{C}$ أبعد عن الصفر من $-13\\,^\\circ\\mathrm{F}$', 'المدينتان متساويتان في البرودة']), correct: 0, cols: 1,
          explain: <MathText>{'نقارن بالسلّم نفسه: $-25\\,^\\circ\\mathrm{C} < -3\\,^\\circ\\mathrm{C}$ ( و $-13\\,^\\circ\\mathrm{F} < 26{,}6\\,^\\circ\\mathrm{F}$ ). مقارنة $-3$ بـ $-13$ مباشرة خطأ لأنّ العددين ليسا بالسلّم نفسه.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'] } },
        { id: 'E4', skill: 'compare', requires: ['majmu-jabri'], prompt: <Q>المرحلة 4 — الفارق بين الدرجتين بالسيلسيوس ($-3 - (-25)$) هو ...</Q>,
          options: opts(['$22\\,^\\circ\\mathrm{C}$', '$-28\\,^\\circ\\mathrm{C}$', '$28\\,^\\circ\\mathrm{C}$', '$-22\\,^\\circ\\mathrm{C}$']), correct: 0, cols: 2,
          explain: <MathText>{'طرح عدد سالب هو جمع نظيره: $-3 - (-25) = -3 + 25 = 22$ . الفارق بين درجتي حرارة عدد موجب.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'] } },
        { id: 'E5', skill: 'verify', requires: ['jidaa-nisbi'], prompt: <Q>المرحلة 5 — نتحقّق من أنّ الدرجة $-40$ هي نفسها في السلّمين.</Q>,
          options: opts(['$1{,}8 \\times (-40) + 32 = -72 + 32 = -40$ : القيمتان متساويتان', '$1{,}8 \\times (-40) + 32 = 72 + 32 = 104$ : القيمتان مختلفتان', '$1{,}8 \\times (-40) + 32 = -72 - 32 = -104$ : القيمتان مختلفتان', '$1{,}8 \\times (-40 + 32) = -14{,}4$ : القيمتان مختلفتان']), correct: 0, cols: 1,
          explain: <MathText>{'$1{,}8 \\times (-40) = -72$ ثم $-72 + 32 = -40$ ، فالدرجة $-40$ تساوي $-40$ في السلّمين.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_wadiya-idmajiya-aadad-nisbiya_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🌡️', label: 'أدمجت تعلّماتي', test: (m) => (m.fahrenheit ?? 0) + (m.celsius ?? 0) + (m.compare ?? 0) + (m.verify ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أنهيت الوحدة 1', title: 'الأعداد النسبية',
        message: 'سطيف $26{,}6\\,^\\circ\\mathrm{F}$ ومونتريال $-25\\,^\\circ\\mathrm{C}$ : مونتريال أشدّ برودة بـ $22\\,^\\circ\\mathrm{C}$ . وظّفت جداء الأعداد النسبية وحاصل قسمتها وسلاسل الحسابات في وضعية واحدة.',
        verbs: ['أقرأ', 'أحوّل', 'أقارن', 'أتحقّق'], masterBadgeLabel: 'الوحدة 1',
      }}
    />
  );
}
