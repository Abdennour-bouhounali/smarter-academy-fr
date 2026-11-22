import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme, une الكفاءة principale chacune (P1 : nombre × somme ; P2 : nombre × différence ; P3 deux fois :
 * mettre en facteur, puis nombre × (lettre − nombre) ; P4 : le calcul mental). Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes données, recalculées en BigInt
 * par ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option et que chaque distracteur reproduit son erreur nommée (MISC-TAWZI-*).
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
        jam: { label: 'نشر جداء عدد ومجموع', module: 1 },
        tarh: { label: 'نشر جداء عدد وفرق', module: 1 },
        tahlil: { label: 'التحليل والحرف', module: 1 },
        dhihni: { label: 'الحساب الذهني', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'jam', requires: ['tawzi-jam'],
          prompt: <Q source={PLATFORM}><MathText>{'نشر $7 \\times (10 + 3)$ هو:'}</MathText></Q>,
          options: ['$7 \\times 10 + 7 \\times 3$', '$7 \\times 10 + 3$', '$7 + 10 \\times 3$', '$7 \\times 10 \\times 3$'], correct: 0, cols: 2,
          explain: <MathText>{'العدد $7$ يضرب الحدّين: $7 \\times 10 + 7 \\times 3 = 70 + 21 = 91$ . (الثانية ضربت الحدّ الأول وحده؛ والثالثة جمعت العدد 7 إلى الجداء؛ والرابعة ضربت العوامل.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_tawzi-darb-jam-tarh_P1'] },
        },
        {
          id: 'E2', skill: 'tarh', requires: ['tawzi-tarh'],
          prompt: <Q source={PLATFORM}><MathText>{'نشر $6 \\times (9 - 4)$ هو:'}</MathText></Q>,
          options: ['$6 \\times 9 - 6 \\times 4$', '$6 \\times 9 + 6 \\times 4$', '$6 \\times 9 - 4$', '$9 \\times 6 - 4 \\times 4$'], correct: 0, cols: 2,
          explain: <MathText>{'العدد $6$ يضرب الحدّين والإشارة تبقى طرحًا: $54 - 24 = 30$ . (الثانية غيّرت الإشارة؛ والثالثة ضربت الحدّ الأول وحده؛ والرابعة ضربت الحدّ الثاني في 4.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_tawzi-darb-jam-tarh_P2'] },
        },
        {
          id: 'E3', skill: 'tahlil', requires: ['tahlil'],
          prompt: <Q source={PLATFORM}><MathText>{'قيمة $13 \\times 8 + 13 \\times 2$ هي:'}</MathText></Q>,
          options: ['$130$', '$208$', '$260$', '$106$'], correct: 0, cols: 2,
          explain: <MathText>{'نخرج العامل المشترك: $13 \\times (8 + 2) = 13 \\times 10 = 130$ . ($208$ ضرب العوامل $13 \\times 8 \\times 2$ ؛ و $260$ ضاعف العامل المشترك؛ و $106$ نسي ضرب 2 في 13.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_tawzi-darb-jam-tarh_P3'] },
        },
        {
          id: 'E4', skill: 'dhihni', requires: ['tariqa-dhihni'],
          prompt: <Q source={PLATFORM}><MathText>{'قيمة $99 \\times 7$ ذهنيًا هي:'}</MathText></Q>,
          options: ['$693$', '$699$', '$707$', '$630$'], correct: 0, cols: 2,
          explain: <MathText>{'$99 = 100 - 1$ ، فـ $99 \\times 7 = 700 - 7 = 693$ . ($699$ طرح 1 وحده؛ و $707$ جمع بدل أن يطرح؛ و $630$ ضرب 90 في 7.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_tawzi-darb-jam-tarh_P4'] },
        },
        {
          id: 'E5', skill: 'tahlil', requires: ['tariqa-harf'],
          prompt: <Q source={PLATFORM}><MathText>{'نشر $5 \\times (x - 4)$ هو:'}</MathText></Q>,
          options: ['$5x - 20$', '$5x - 4$', '$5x + 20$', '$x - 20$'], correct: 0, cols: 2,
          explain: <MathText>{'$5 \\times (x - 4) = 5 \\times x - 5 \\times 4 = 5x - 20$ . (الثانية ضربت الحرف وحده؛ والثالثة غيّرت الإشارة؛ والرابعة ضربت العدد وحده.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_tawzi-darb-jam-tarh_P3'] },
        },
      ]}
      badges={[
        { id: 'tawzi', emoji: '🎒', label: 'أوزّع الضرب', test: (m) => (m.jam ?? 0) === 0 && (m.tarh ?? 0) === 0 },
        { id: 'tahlil', emoji: '🧠', label: 'أحلّل وأحسب ذهنيًا', test: (m) => (m.tahlil ?? 0) === 0 && (m.dhihni ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت توزيع الضرب',
        title: 'انتهى درس توزيع الضرب على الجمع والطرح',
        message: 'تعرف الآن أنّ الضرب في مجموع أو فرق هو ضرب في كلّ حدّ، فتنشر وتحلّل وتحسب ذهنيًا وتتعامل مع عبارة فيها حرف.',
        verbs: ['أنشر', 'أحلّل', 'أحسب ذهنيًا'],
        masterBadgeLabel: 'توزيع الضرب',
      }}
    />
  );
}
