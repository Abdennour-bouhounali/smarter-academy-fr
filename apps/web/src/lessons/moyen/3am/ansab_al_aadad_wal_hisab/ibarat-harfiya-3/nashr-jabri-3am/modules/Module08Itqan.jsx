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
 * « أؤكّد تعلّماتي » 4 et 7, autres nombres) : une الكفاءة principale par épreuve (P3, P1, P2, P4, P4). Les clés sont recalculées dans
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
        area: { label: 'مساحة بطريقتين', module: 1 },
        one: { label: 'نشر k(a ± b)', module: 2 },
        two: { label: 'نشر (a + b)(c + d)', module: 2 },
        order: { label: 'نشر وتبسيط', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'area', requires: ['masaha-tariqatayn'],
          prompt: <Q source={PLATFORM}><MathText>{'مستطيل بعداه $(x+2)$ و $5$. أيّ زوج من العبارتين يعبّر كلٌّ منهما عن مساحته؟'}</MathText></Q>,
          options: ['$5(x+2)$ و $5x+10$', '$5(x+2)$ و $5x+2$', '$5+(x+2)$ و $5x+10$', '$5x+2$ و $5x+10$'], correct: 0, cols: 1,
          explain: <MathText>{'المساحة جداء البعدين $5(x+2)$ وهي مجموع مساحتين $5x+10$ : النشر هو الانتقال من الأولى إلى الثانية.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_nashr-jabri-3am_P3'] },
        },
        {
          id: 'E2', skill: 'one', requires: ['tawzi-darb'],
          prompt: <Q source={SELF[4].source}><MathText>{'انشر العبارة $-3(2x-5)$.'}</MathText></Q>,
          options: ['$-6x+15$', '$-6x-15$', '$6x-15$', '$-6x+5$'], correct: 0, cols: 2,
          explain: <MathText>{'$(-3)\\times2x=-6x$ و $(-3)\\times(-5)=+15$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_nashr-jabri-3am_P1'] },
        },
        {
          id: 'E3', skill: 'two', requires: ['jidaa-qawsayn'],
          prompt: <Q source={PLATFORM}><MathText>{'انشر وبسّط $(x+3)(x-4)$.'}</MathText></Q>,
          options: ['$x^2-x-12$', '$x^2+x-12$', '$x^2-12$', '$x^2-x+12$'], correct: 0, cols: 2,
          explain: <MathText>{'$x^2-4x+3x-12=x^2-x-12$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_nashr-jabri-3am_P2'] },
        },
        {
          id: 'E4', skill: 'order', requires: ['tariqat-nashr'],
          prompt: <Q source={SELF[7].source}><MathText>{'انشر وبسّط $A=2(x-1)+(x+3)(x-2)$.'}</MathText></Q>,
          options: ['$x^2+3x-8$', '$x^2+3x-4$', '$x^2+x-8$', '$x^2+3x+8$'], correct: 0, cols: 2,
          explain: <MathText>{'$2x-2+x^2+x-6=x^2+3x-8$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_nashr-jabri-3am_P4'] },
        },
        {
          id: 'E5', skill: 'order', requires: ['tariqat-nashr'],
          prompt: <Q source={PLATFORM}><MathText>{'انشر وبسّط $B=(x-1)(x+5)-x(x+3)$.'}</MathText></Q>,
          options: ['$x-5$', '$x^2+x-5$', '$7x-5$', '$x+5$'], correct: 0, cols: 2,
          explain: <MathText>{'$x^2+4x-5-x^2-3x=x-5$ : يتلاشى الحدّان $x^2$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['3am_nashr-jabri-3am_P4'] },
        },
      ]}
      badges={[
        { id: 'area', emoji: '📐', label: 'أحسب مساحة بطريقتين', test: (m) => (m.area ?? 0) === 0 },
        { id: 'expand', emoji: '✖️', label: 'أنشر وأبسّط', test: (m) => (m.one ?? 0) === 0 && (m.two ?? 0) === 0 && (m.order ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت نشر العبارات الجبرية',
        title: 'انتهى درس نشر عبارات جبرية',
        message: 'تعرف الآن أنّ مساحة المستطيل تُحصى بجداء بعديه وبمجموع مساحات أجزائه، وأنّ كل حدّ في القوس الأول يضرب كل حدّ في الثاني مع إشارة كل جداء، وأنّ نجمع المتشابهة ونرتّب بعد النشر، وأنّ القيمة لا تتغيّر.',
        verbs: ['أنشر', 'أبسّط', 'أراقب'],
        masterBadgeLabel: 'نشر عبارات جبرية',
      }}
    />
  );
}
