import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SELF } from '../content/exercises';
import { addition } from '../../_unit/unitMeta.js';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE. Cinq épreuves, une الكفاءة principale chacune, réécrites à partir de « أؤكّد تعلّماتي » 4
 * (autres nombres) plus quatre épreuves de la plateforme. Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/exercises.js) porte les mêmes
 * données, recalculées en BigInt par ../content/content.test.js qui vérifie aussi que le source de ce module contient chaque option.
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
        read: { label: 'قراءة فاصلة نقطة', module: 1 },
        opposite: { label: 'معاكس عدد', module: 2 },
        step: { label: 'اختيار التدريجة', module: 3 },
        origin: { label: 'تغيّر الفاصلة بتغيّر المبدأ', module: 1 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'read', requires: ['faasila'],
          prompt: <Q source={PLATFORM}><MathText>{'النقطة $M$ على ثلاث تدريجات يسار المبدأ، وقيمة التدريجة $5$ . فاصلتها:'}</MathText></Q>,
          options: ['$-15$', '$-3$', '$15$', '$-8$'], correct: 0, cols: 2,
          explain: <MathText>{'$3\\times 5=15$ ، ويسار المبدأ إشارة $-$ : $-15$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_talim-mustaqim-mudarraj-2_P2'] },
        },
        {
          id: 'E2', skill: 'opposite', requires: ['mafhum-mutaakisan'],
          prompt: <Q source={SELF.E2.source}><MathText>{'معاكس العدد $-2{,}5$ هو:'}</MathText></Q>,
          options: ['$2{,}5$', '$-2{,}5$', '$0{,}4$', '$5{,}2$'], correct: 0, cols: 2,
          explain: <MathText>{'للعددين المسافة نفسها إلى الصفر وإشارتان مختلفتان: معاكس $-2{,}5$ هو $2{,}5$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_talim-mustaqim-mudarraj-2_P1'] },
        },
        {
          id: 'E3', skill: 'step', requires: ['ikhtiyar-tadrij'],
          prompt: <Q source={PLATFORM}><MathText>{'نريد وضع $-40$ ؛ $60$ ؛ $20$ ؛ $30$ على مستقيم فيه $6$ تدريجات في كل جهة. التدريجة المناسبة:'}</MathText></Q>,
          options: ['$10$', '$5$', '$15$', '$20$'], correct: 0, cols: 2,
          explain: <MathText>{'مع $10$ : $-4$ ، $6$ ، $2$ ، $3$ : كلّها على تدريجات وداخل المستقيم. مع $5$ تبعد $60$ اثنتي عشرة تدريجة، ومع $15$ تقع $-40$ بين تدريجتين، ومع $20$ تقع $30$ بين تدريجتين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_talim-mustaqim-mudarraj-2_P3'] },
        },
        {
          id: 'E4', skill: 'opposite', requires: ['masafa-ila-sifr'],
          prompt: <Q source={PLATFORM}><MathText>{'النقطتان $A(-7)$ و $B(+7)$ . العبارة الصحيحة:'}</MathText></Q>,
          options: ['لهما المسافة نفسها إلى الصفر', 'هما في الجهة نفسها من المبدأ', 'المسافة إلى الصفر للنقطة $A$ هي $-7$', '$A$ هي النقطة $B$'], correct: 0, cols: 1,
          explain: <MathText>{'$7$ و $7$ : المسافة نفسها إلى الصفر، وإشارتاهما مختلفتان. المسافة لا تكون سالبة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_talim-mustaqim-mudarraj-2_P1'] },
        },
        {
          id: 'E5', skill: 'origin', requires: ['faasila-tataghayyar'],
          prompt: <Q source={PLATFORM}><MathText>{'التدريجة $1$ . نقلنا المبدأ إلى النقطة $C(+20)$ . فاصلة $D(+50)$ في المعلم الجديد:'}</MathText></Q>,
          options: ['$30$', '$50$', '$70$', '$-30$'], correct: 0, cols: 2,
          explain: <MathText>{'$50-20=30$ : النقطة $D$ على بعد $30$ تدريجة يمين المبدأ الجديد.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_talim-mustaqim-mudarraj-2_P3'] },
        },
      ]}
      badges={[
        { id: 'read', emoji: '📍', label: 'أقرأ الفواصل', test: (m) => (m.read ?? 0) === 0 },
        { id: 'step', emoji: '📏', label: 'أختار التدريجة', test: (m) => (m.step ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت التعليم على مستقيم مدرّج',
        title: 'انتهى درس التعليم على مستقيم مدرّج',
        message: 'تعرف الآن أنّ فاصلة نقطة هي عدد التدريجات في قيمة التدريجة بإشارة جهتها، وأنّها تتغيّر بتغيّر المبدأ، وأنّ العددين المتعاكسين لهما المسافة نفسها إلى الصفر، وتختار تدريجة تناسب أعدادًا معلومة.',
        verbs: ['أقرأ', 'أضع', 'أختار'],
        masterBadgeLabel: 'التعليم على مستقيم مدرّج',
      }}
    />
  );
}
