import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves de la plateforme (réécrites à partir de
 * « أؤكّد تعلّماتي » 1, 2 et 6, autres nombres) : une الكفاءة principale par épreuve (P4, P1, P1, P2, P3). Les clés sont recalculées dans
 * ../content/content.test.js à partir des termes ; chaque distracteur y est vérifié FAUX.
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
        form: { label: 'مجموع أم جداء', module: 2 },
        simplify: { label: 'تبسيط الحدود', module: 1 },
        plus: { label: 'قوسان بعد +', module: 3 },
        minus: { label: 'قوسان بعد −', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'form', requires: ['majmu-wa-jidaa'],
          prompt: <Q source={SELF[1].source}><MathText>{'أيّ هذه العبارات تُمثّل مجموعًا؟'}</MathText></Q>,
          options: ['$(2x+5)(x+1)$', '$6-3x+x^2$', '$(4x-1)^2$', '$3x(2x-5)$'], correct: 1, cols: 1,
          explain: <MathText>{'آخر عملية في $6-3x+x^2$ جمع (وطرح)، أمّا في العبارات الأخرى فآخر عملية ضرب.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tabsit-hadhf-aqwas_P4'] },
        },
        {
          id: 'E2', skill: 'simplify', requires: ['jidaa-hududayn'],
          prompt: <Q source={SELF[2].source}><MathText>{'بسّط العبارة $-6x\\times4x$.'}</MathText></Q>,
          options: ['$-24x^2$', '$-24x$', '$-2x^2$', '$-10x^2$'], correct: 0, cols: 2,
          explain: <MathText>{'نضرب الأعداد: $-6\\times4=-24$ ، ونضرب الحروف: $x\\times x=x^2$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tabsit-hadhf-aqwas_P1'] },
        },
        {
          id: 'E3', skill: 'simplify', requires: ['jam-muamilat'],
          prompt: <Q source={PLATFORM}><MathText>{'بسّط العبارة $9x^2-4x-5x^2+x$.'}</MathText></Q>,
          options: ['$4x^2-3x$', '$4x^2+3x$', '$14x^2-3x$', '$4x-3x^2$'], correct: 0, cols: 2,
          explain: <MathText>{'نجمع حدود $x^2$ : $9-5=4$ ، وحدود $x$ : $-4+1=-3$ ، فنجد $4x^2-3x$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tabsit-hadhf-aqwas_P1'] },
        },
        {
          id: 'E4', skill: 'plus', requires: ['aqwas-jam'],
          prompt: <Q source={PLATFORM}><MathText>{'اكتب $12+(3x-7)$ بدون أقواس وفي أبسط شكل.'}</MathText></Q>,
          options: ['$3x+5$', '$3x-19$', '$-3x+5$', '$3x+19$'], correct: 0, cols: 2,
          explain: <MathText>{'القوسان مسبوقان بـ $+$ فنُبقي الإشارتين: $12+3x-7=3x+5$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tabsit-hadhf-aqwas_P2'] },
        },
        {
          id: 'E5', skill: 'minus', requires: ['aqwas-tarh'],
          prompt: <Q source={SELF[6].source}><MathText>{'بسّط العبارة $A=(6a+2)-(4a-5)$ بعد حذف القوسين.'}</MathText></Q>,
          options: ['$2a+7$', '$2a-3$', '$10a-3$', '$10a+7$'], correct: 0, cols: 2,
          explain: <MathText>{'القوسان الثانيان مسبوقان بـ $-$ فتتغيّر إشارة كل حدّ: $6a+2-4a+5=2a+7$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_tabsit-hadhf-aqwas_P3'] },
        },
      ]}
      badges={[
        { id: 'simplify', emoji: '🧮', label: 'أبسّط الحدود', test: (m) => (m.simplify ?? 0) === 0 },
        { id: 'brackets', emoji: '🔓', label: 'أحذف الأقواس', test: (m) => (m.plus ?? 0) === 0 && (m.minus ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت تبسيط العبارة وحذف الأقواس',
        title: 'انتهى درس تبسيط عبارة جبرية وحذف الأقواس',
        message: 'تعرف الآن أنّ الحدود المتشابهة وحدها تُجمع، وأنّ جداء الحدود نبسّطه بضرب الأعداد والحروف، وأنّ القوسين المسبوقين بـ + نحذفهما دون تغيير وبـ − بتغيير إشارة كل حدّ، وأنّ القيمة لا تتغيّر.',
        verbs: ['أبسّط', 'أحذف', 'أميّز'],
        masterBadgeLabel: 'تبسيط عبارة جبرية',
      }}
    />
  );
}
