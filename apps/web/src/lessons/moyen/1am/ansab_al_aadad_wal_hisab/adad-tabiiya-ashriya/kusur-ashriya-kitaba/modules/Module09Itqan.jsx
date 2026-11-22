import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 9 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme (réécrites à partir de
 * « أقوّم تعلّماتي » 3, 4, 5 et 13, autres nombres) : une الكفاءة principale par épreuve, deux pour le كسر عشري. Toutes les clés sont
 * recalculées en fractions exactes dans ../content/content.test.js ; chaque distracteur y est vérifié FAUX.
 */
const PLATFORM = addition('final_test_item');
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;

export default function Module09Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(9)}
      moduleNumber={9}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة، ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        kasr: { label: 'الكسر العشري', module: 1 },
        kitaba: { label: 'الفاصلة والكسر', module: 3 },
        mafkuk: { label: 'المفكوك النموذجي', module: 2 },
        azaha: { label: 'إزاحة الفاصلة', module: 4 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'kasr', requires: ['kasr-ashri'],
          prompt: <Q source={PLATFORM}><MathText>{'أيّ هذه الكسور يساوي $\\frac{3}{10}$ ؟'}</MathText></Q>,
          options: ['$\\frac{30}{100}$', '$\\frac{3}{100}$', '$\\frac{30}{10}$', '$\\frac{300}{10}$'], correct: 0, cols: 2,
          explain: <MathText>{'كل عُشر عشرة أجزاء من مائة: $\\frac{3}{10}=\\frac{30}{100}$ . أمّا $\\frac{3}{100}$ فأصغر بعشر مرّات، و $\\frac{30}{10}=3$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_kusur-ashriya-kitaba_P1'] },
        },
        {
          id: 'E2', skill: 'kitaba', requires: ['tariqat-intiqal'],
          prompt: <Q source={SELF[3].source}><MathText>{'الكتابة العشرية للكسر $\\frac{6407}{1000}$ هي:'}</MathText></Q>,
          options: ['$6{,}407$', '$64{,}07$', '$640{,}7$', '$6{,}47$'], correct: 0, cols: 2,
          explain: <MathText>{'المقام 1000 فيه ثلاثة أصفار، فثلاثة أرقام بعد الفاصلة: $\\frac{6407}{1000}=6{,}407$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_kusur-ashriya-kitaba_P2'] },
        },
        {
          id: 'E3', skill: 'mafkuk', requires: ['mafkuk-ashri'],
          prompt: <Q source={SELF[5].source}><MathText>{'المفكوك النموذجي للعدد $306{,}208$ هو:'}</MathText></Q>,
          options: ['$3\\times100+6+\\frac{2}{10}+\\frac{8}{1000}$', '$3\\times100+6+\\frac{2}{10}+\\frac{8}{100}$', '$3\\times100+6\\times10+\\frac{2}{10}+\\frac{8}{1000}$', '$3\\times100+6+\\frac{2}{100}+\\frac{8}{1000}$'], correct: 0, cols: 1,
          explain: <MathText>{'رقم العشرات 0 فلا حدّ لها، والرقم 6 للآحاد، و 2 للأعشار، و 0 للأجزاء من مائة، و 8 للأجزاء من ألف.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_kusur-ashriya-kitaba_P3'] },
        },
        {
          id: 'E4', skill: 'azaha', requires: ['azaha-fasila'],
          prompt: <Q source={SELF[13].source}><MathText>{'احسب ذهنيًا: $34{,}2\\div100$'}</MathText></Q>,
          options: ['$0{,}342$', '$3{,}42$', '$0{,}0342$', '$342$'], correct: 0, cols: 2,
          explain: <MathText>{'القسمة على 100 تزيح الفاصلة مرتبتين نحو اليسار: $34{,}2\\div100=0{,}342$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_kusur-ashriya-kitaba_P4'] },
        },
        {
          id: 'E5', skill: 'kitaba', requires: ['asfar-ghayr-darurya'],
          prompt: <Q source={SELF[4].source}><MathText>{'أيّ هذه الكتابات لا تمثّل العدد $8{,}5$ ؟'}</MathText></Q>,
          options: ['$8{,}05$', '$8{,}50$', '$08{,}5$', '$8{,}500$'], correct: 0, cols: 2,
          explain: <MathText>{'$8{,}50$ و $08{,}5$ و $8{,}500$ هي $8{,}5$ نفسه (أصفار على الطرفين). أمّا $8{,}05$ ففيه صفر يحفظ مكان الأعشار: عدد آخر.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_kusur-ashriya-kitaba_P2'] },
        },
      ]}
      badges={[
        { id: 'azaha', emoji: '↔️', label: 'أزيح الفاصلة', test: (m) => (m.azaha ?? 0) === 0 },
        { id: 'kitaba', emoji: '🔢', label: 'أنتقل بين الفاصلة والكسر', test: (m) => (m.kitaba ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت الكسور العشرية والكتابة العشرية',
        title: 'انتهى درس الكسور العشرية والكتابة العشرية',
        message: 'تعرف الآن أنّ الكسر العشري عدّ لقطع متساوية أصغر فأصغر، وأنّ عدد الأرقام بعد الفاصلة هو عدد أصفار المقام، وأنّ الفاصلة تنزلق عند الضرب في 10 أو القسمة عليه.',
        verbs: ['أكتب', 'أفكّك', 'أزيح'],
        masterBadgeLabel: 'الكسور العشرية',
      }}
    />
  );
}
