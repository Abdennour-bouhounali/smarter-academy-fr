import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { addition } from '../../_unit/unitMeta.js';
import { FINAL } from '../content/exercises';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme (« أقوّم تعلّماتي » 7, 8 et 9 réécrits, autres nombres) : une الكفاءة principale
 * par épreuve. Toutes les clés sont recalculées en arithmétique entière exacte dans ../content/content.test.js ; chaque distracteur y est vérifié FAUX.
 */
const PLATFORM = addition('final_test_item');
const Q = ({ children, source }) => <span>{children} <SourceTag source={source ?? PLATFORM} /></span>;

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
        frame: { label: 'المعلم المتعامد', module: 2 },
        read: { label: 'قراءة إحداثيي نقطة', module: 1 },
        mark: { label: 'تعليم نقطة', module: 3 },
        abscissaAxis: { label: 'نقط محور الفواصل', module: 1 },
        ordinateAxis: { label: 'نقط محور التراتيب', module: 1 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'frame', requires: ['mu-allam-mutaamid'],
          prompt: <Q><MathText>{'المعلم المتعامد للمستوي يتشكّل من:'}</MathText></Q>,
          options: ['مستقيمين مدرّجين متعامدين لهما المبدأ نفسه', 'مستقيمين مدرّجين متوازيين', 'مستقيم مدرّج واحد', 'مستقيمين متعامدين لهما مبدآن مختلفان'], correct: 0, cols: 1,
          explain: <MathText>{'المحوران متعامدان ولهما المبدأ نفسه، وإلا لم تتعيّن كلّ نقطة بعددين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_talim-fi-mustawi_P1'] },
        },
        {
          id: 'E2', skill: 'read', requires: ['ihdathiyyan'],
          prompt: <Q source={FINAL[1].source}><MathText>{'تبعد نقطة عن المبدإ بثلاث وحدات نحو اليمين على الخط الأفقي، ثمّ بوحدة واحدة نحو الأسفل. إحداثياها:'}</MathText></Q>,
          options: ['$(3\\,;\\,-1)$', '$(-1\\,;\\,3)$', '$(1\\,;\\,3)$', '$(3\\,;\\,1)$'], correct: 0, cols: 2,
          explain: <MathText>{'الفاصلة $3$ (يمين) أوّلًا ثمّ الترتيب $-1$ (أسفل): $(3\\,;\\,-1)$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_talim-fi-mustawi_P2'] },
        },
        {
          id: 'E3', skill: 'mark', requires: ['tariqat-talim'],
          prompt: <Q><MathText>{'لتعليم النقطة $M(-2\\,;\\,4)$ نقطع من المبدإ:'}</MathText></Q>,
          options: ['وحدتين نحو اليسار على الخط الأفقي ثمّ أربع وحدات نحو الأعلى', 'أربع وحدات نحو اليسار على الخط الأفقي ثمّ وحدتين نحو الأعلى', 'وحدتين نحو اليمين على الخط الأفقي ثمّ أربع وحدات نحو الأعلى', 'أربع وحدات نحو الأعلى ثمّ وحدتين نحو اليمين'], correct: 0, cols: 1,
          explain: <MathText>{'الفاصلة $-2$ : وحدتان على يسار المبدإ؛ ثمّ الترتيب $4$ : أربع وحدات نحو الأعلى.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_talim-fi-mustawi_P3'] },
        },
        {
          id: 'E4', skill: 'abscissaAxis', requires: ['nuqta-ala-muhwar'],
          prompt: <Q source={FINAL[3].source}><MathText>{'إذا كانت نقطة على محور الفواصل، فإنّ:'}</MathText></Q>,
          options: ['ترتيبها معدوم', 'فاصلتها معدومة', 'هي المبدأ', 'فاصلتها تساوي ترتيبها'], correct: 0, cols: 2,
          explain: <MathText>{'على محور الفواصل لا نصعد ولا ننزل: الترتيب $0$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_talim-fi-mustawi_P2'] },
        },
        {
          id: 'E5', skill: 'ordinateAxis', requires: ['nuqta-ala-muhwar'],
          prompt: <Q source={FINAL[4].source}><MathText>{'النقطة التي إحداثياها $(0\\,;\\,-3)$ تقع على:'}</MathText></Q>,
          options: ['محور التراتيب', 'محور الفواصل', 'المبدأ', 'خارج المحورين'], correct: 0, cols: 2,
          explain: <MathText>{'فاصلتها $0$ : لا نتحرّك على الخط الأفقي، فهي على محور التراتيب تحت المبدإ بثلاث وحدات.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_talim-fi-mustawi_P3'] },
        },
      ]}
      badges={[
        { id: 'muallam', emoji: '📍', label: 'أعلّم نقطة في المستوي', test: (m) => (m.frame ?? 0) === 0 && (m.mark ?? 0) === 0 },
        { id: 'ihdathiyyat', emoji: '🛸', label: 'أقرأ الإحداثيين بالترتيب', test: (m) => (m.read ?? 0) === 0 && (m.abscissaAxis ?? 0) === 0 && (m.ordinateAxis ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت التعليم في المستوي',
        title: 'انتهى درس التعليم في المستوي',
        message: 'تعرف الآن أنّ المعلم المتعامد مستقيمان مدرّجان متعامدان لهما المبدأ نفسه، وأنّ لكلّ نقطة عددين نكتبهما بالترتيب (الفاصلة ثمّ الترتيب)، وأنّ تبديلهما يعطي نقطة أخرى، وأنّ نقطة المحور الأفقي ترتيبها معدوم.',
        verbs: ['أقرأ', 'أعلّم', 'أرتّب'],
        masterBadgeLabel: 'المعلم المتعامد',
      }}
    />
  );
}
