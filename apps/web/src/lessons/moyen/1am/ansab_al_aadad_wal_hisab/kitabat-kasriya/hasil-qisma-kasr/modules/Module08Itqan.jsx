import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. « أقوّم تعلّماتي » 2 et 3 (p. 59, jamais posés ailleurs dans la
 * leçon) et trois épreuves de la plateforme (le facteur manquant 13/8, 0,7 = 7 × …, le quotient qui n'est pas décimal). Une الكفاءة
 * principale par épreuve ; toutes les clés sont recalculées en fractions exactes dans ../content/content.test.js.
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
        kasr: { label: 'الكسر حاصل قسمة', module: 1 },
        darb: { label: 'العدد الناقص', module: 3 },
        ashri: { label: 'عشري وغير عشري', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'kasr', requires: ['kasr-hasil-qisma'],
          prompt: <Q source={SELF[3].source}>حاصل القسمة <MathText>{'$\\frac{11}{7}$'}</MathText> يساوي:</Q>,
          options: ['11 ÷ 7', '11,7', '7 ÷ 11', '1,571'], correct: 0, cols: 2,
          explain: <MathText>{'$\\frac{11}{7}=11\\div 7$ : البسط هو المقسوم. $1{,}571$ قيمة مقرّبة فقط، و $7\\div 11=\\frac{7}{11}$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_hasil-qisma-kasr_P1'] },
        },
        {
          id: 'E2', skill: 'kasr', requires: ['kasr-hasil-qisma', 'natija-darb'],
          prompt: <Q source={SELF[2].source}>أيّ هذه العبارات عن الكسر <MathText>{'$\\frac{7}{3}$'}</MathText> <strong>خاطئة</strong>؟</Q>,
          options: ['العدد الذي إذا ضُرب في 7 ينتج 3', '7 مرّات 1/3', '7 ÷ 3', 'العدد الذي إذا ضُرب في 3 ينتج 7'], correct: 0, cols: 1,
          explain: <MathText>{'$\\frac{7}{3}\\times 3=7$ وليس $\\frac{7}{3}\\times 7=3$ ؛ و $\\frac{7}{3}=7\\times\\frac{1}{3}=7\\div 3$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_hasil-qisma-kasr_P1'] },
        },
        {
          id: 'E3', skill: 'darb', requires: ['natija-darb'],
          prompt: <Q source={PLATFORM}>العدد الذي إذا ضُرب في 8 أعطى 13 هو:</Q>,
          options: ['13/8', '8/13', '5'], correct: 0, cols: 3,
          explain: <MathText>{'$\\frac{13}{8}\\times 8=13$ ؛ و $\\frac{8}{13}\\times 8\\neq 13$ ، و $5\\times 8=40$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_hasil-qisma-kasr_P2'] },
        },
        {
          id: 'E4', skill: 'darb', requires: ['natija-darb'],
          prompt: <Q source={PLATFORM}>العدد الناقص في <MathText>{'$7\\times\\ldots=0{,}7$'}</MathText> هو:</Q>,
          options: ['0,1', '1', '0,7'], correct: 0, cols: 3,
          explain: <MathText>{'$0{,}7\\div 7=0{,}1$ و $7\\times 0{,}1=0{,}7$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_hasil-qisma-kasr_P2'] },
        },
        {
          id: 'E5', skill: 'ashri', requires: ['ashri-ghayr-ashri'],
          prompt: <Q source={PLATFORM}>أيّ حاصل قسمة لا كتابة عشرية مضبوطة له؟</Q>,
          options: ['9 ÷ 2', '7 ÷ 4', '5 ÷ 6', '3 ÷ 5'], correct: 2, cols: 2,
          explain: <MathText>{'$9\\div 2=4{,}5$ ، $7\\div 4=1{,}75$ ، $3\\div 5=0{,}6$ تنتهي القسمة؛ أمّا $5\\div 6=0{,}8333\\ldots$ فلا تنتهي.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_hasil-qisma-kasr_P3'] },
        },
      ]}
      badges={[
        { id: 'darb', emoji: '✖️', label: 'أجد العدد الناقص', test: (m) => (m.darb ?? 0) === 0 },
        { id: 'ashri', emoji: '🔢', label: 'أميّز العشري من غيره', test: (m) => (m.ashri ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت حاصل القسمة والكسر',
        title: 'انتهى درس حاصل القسمة والكسر',
        message: 'تعرف الآن أنّ الكسر هو حاصل القسمة، وأنّه العدد الذي إذا ضُرب في مقامه أعطى بسطه، وأنّه ليس عددًا عشريًا دائمًا.',
        verbs: ['أقسم', 'أكتب', 'أميّز'],
        masterBadgeLabel: 'حاصل القسمة والكسر',
      }}
    />
  );
}
