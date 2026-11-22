import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import SpaceFigure from '../../../../../../common/components/SpaceFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PLATFORM_SOURCE } from '../content/textbook';
import { FIG_TEST_PYRAMID } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Le scan n'a ni QCM ni exercices : cinq
 * épreuves de la plateforme, sur des nombres qui n'apparaissent nulle part ailleurs dans la leçon — le rayon d'une section de
 * sphère (P1), le contact h = R (P1), la section d'un pavé parallèle à une face (P2), celle d'un cylindre parallèle à l'axe
 * (P3), celle d'une pyramide parallèle à la base (P4, figure). Chaque épreuve évalue UN point ; P1–P4 couverts.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Q = ({ children, figure }) => (
  <span className="block space-y-2">
    <span><MathText>{children}</MathText> <SourceTag source={PLATFORM_SOURCE} /></span>
    {figure && <SpaceFigure {...figure} inline />}
  </span>
);

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="5 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        kura: { label: 'مقطع كرة بمستو', module: 2 },
        balata: { label: 'مقطع بلاطة قائمة', module: 2 },
        ustuwana: { label: 'مقطع أسطوانة دوران', module: 2 },
        haram: { label: 'مقطع هرم أو مخروط', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'kura', requires: ['maqta-kura', 'tariqat-nisf-qutr'],
          prompt: <Q>{'مصباح كروي في غرفة ألعاب نصف قطره $17\\,\\mathrm{cm}$ ، يقطعه مستو يبعد عن مركزه بـ $8\\,\\mathrm{cm}$ . المقطع دائرة نصف قطرها:'}</Q>,
          options: [
            '$15\\,\\mathrm{cm}$',
            // 17 − 8 (MISC-MAQTA-TARH)
            '$9\\,\\mathrm{cm}$',
            // √(17² + 8²) (MISC-MAQTA-JAM)
            '$\\sqrt{353}\\,\\mathrm{cm}$',
          ].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'$r^2 = 17^2 - 8^2 = 289 - 64 = 225$ ، إذن $r = 15\\,\\mathrm{cm}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_maqati-mustawiya_P1'] },
        },
        {
          id: 'E2', skill: 'kura', requires: ['maqta-kura'],
          prompt: <Q>{'كرة مركزها O ونصف قطرها $7\\,\\mathrm{cm}$ ، ومستو (P) يبعد عن O بـ $7\\,\\mathrm{cm}$ . الكرة والمستوي (P):'}</Q>,
          options: [
            'يشتركان في نقطة واحدة: (P) مماس للكرة',
            // h = R pris pour h = 0 (دائرة كبرى)
            'يشتركان في دائرة كبرى نصف قطرها $7\\,\\mathrm{cm}$',
            // h = R pris pour h > R (MISC-MAQTA-MUMAS)
            'لا يشتركان في أي نقطة',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'بعد المستوي عن المركز يساوي نصف القطر ($h = R$): المستوي مماس للكرة في نقطة واحدة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_maqati-mustawiya_P1'] },
        },
        {
          id: 'E3', skill: 'balata', requires: ['maqta-balata'],
          prompt: <Q>{'صندوق على شكل بلاطة قائمة أبعادها $12\\,\\mathrm{cm}$ و $7\\,\\mathrm{cm}$ و $4\\,\\mathrm{cm}$ . نقطعه بمستو موازٍ للوجه الذي بعداه $7$ و $4$ . مساحة المقطع:'}</Q>,
          options: [
            '$28\\,\\mathrm{cm}^2$',
            // 12 × 4 (MISC-MAQTA-BUUD)
            '$48\\,\\mathrm{cm}^2$',
            // 12 × 7, la face du dessus
            '$84\\,\\mathrm{cm}^2$',
          ].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'المقطع مستطيل له نفس بعدي الوجه الموازي له: $7 \\times 4 = 28\\,\\mathrm{cm}^2$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_maqati-mustawiya_P2'] },
        },
        {
          id: 'E4', skill: 'ustuwana', requires: ['maqta-ustuwana', 'tariqat-ustuwana'],
          prompt: <Q>{'أسطوانة دوران نصف قطر قاعدتها $5\\,\\mathrm{cm}$ وارتفاعها $10\\,\\mathrm{cm}$ ، يقطعها مستو موازٍ لمحورها يبعد عنه بـ $3\\,\\mathrm{cm}$ . المقطع:'}</Q>,
          options: [
            'مستطيل بعداه $8\\,\\mathrm{cm}$ و $10\\,\\mathrm{cm}$',
            // 2(5 − 3) (MISC-MAQTA-TARH)
            'مستطيل بعداه $4\\,\\mathrm{cm}$ و $10\\,\\mathrm{cm}$',
            // un plan parallèle à l'axe pris pour parallèle à la base (MISC-MAQTA-SHAKL)
            'دائرة نصف قطرها $5\\,\\mathrm{cm}$',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'مستطيل أحد بعديه الارتفاع $10$ ، والآخر $2\\sqrt{5^2 - 3^2} = 2\\sqrt{16} = 8\\,\\mathrm{cm}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_maqati-mustawiya_P3'] },
        },
        {
          id: 'E5', skill: 'haram', requires: ['maqta-haram'],
          prompt: <Q figure={FIG_TEST_PYRAMID}>{'هرم منتظم SABCD قاعدته مربع ضلعه $10\\,\\mathrm{cm}$ . المستوي الموازي للقاعدة يقطع $[SA]$ في E حيث $SE = \\dfrac{2}{5}SA$ . المقطع EFGH:'}</Q>,
          options: [
            'مربع ضلعه $4\\,\\mathrm{cm}$',
            // la base (MISC-MAQTA-HARAM)
            'مربع ضلعه $10\\,\\mathrm{cm}$',
            // 10 × 3/5 : le rapport pris depuis la base
            'مربع ضلعه $6\\,\\mathrm{cm}$',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'المقطع تصغير للقاعدة بنسبة $\\dfrac{SE}{SA} = \\dfrac{2}{5}$ : ضلعه $\\dfrac{2}{5} \\times 10 = 4\\,\\mathrm{cm}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_maqati-mustawiya_P4'] },
        },
      ]}
      badges={[
        { id: 'kura', emoji: '⚪', label: 'مقطع الكرة', test: (m) => (m.kura ?? 0) === 0 },
        { id: 'balata', emoji: '🧱', label: 'مقطع البلاطة', test: (m) => (m.balata ?? 0) === 0 },
        { id: 'ustuwana', emoji: '🥫', label: 'مقطع الأسطوانة', test: (m) => (m.ustuwana ?? 0) === 0 },
        { id: 'haram', emoji: '🔺', label: 'مقطع الهرم', test: (m) => (m.haram ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت المقاطع المستوية للمجسمات المألوفة',
        title: 'انتهى درس المقاطع المستوية',
        message: 'تعرف الآن أن مقطع الكرة بمستو دائرة نصف قطرها جذر الفرق بين مربعي R و h، أو نقطة، أو لا شيء؛ وأن مقطع البلاطة والأسطوانة مستطيل أو دائرة حسب اتجاه المستوي؛ وأن مقطع الهرم أو المخروط الموازي للقاعدة تصغير لها.',
        verbs: ['أقطع', 'أتوقّع', 'أحسب', 'أتحقّق'],
        masterBadgeLabel: 'المقاطع',
      }}
    />
  );
}
