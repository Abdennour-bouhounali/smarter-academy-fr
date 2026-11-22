import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { QCM, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_QCM4 } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves : les items 2 à 5 de « أؤكّد تعلّماتي » (p. 148, extraction › destinations › qcm, duplicatedIn ce درس) —
 * les items 4 et 5 ont DEUX bonnes réponses (le même nombre avec et sans simplification) : une combinaison — et une
 * épreuve de la plateforme (retrouver une extrémité connaissant le milieu). Chaque épreuve évalue UN point ; P1 et P2
 * couverts.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Q = ({ children, source, figure }) => (
  <span className="block space-y-2">
    <span><MathText>{children}</MathText> <SourceTag source={source} /></span>
    {figure && <GeoFigure {...figure} inline />}
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
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        muntasaf: { label: 'إحداثيتا منتصف قطعة', module: 3 },
        masafa: { label: 'المسافة بين نقطتين', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'muntasaf', requires: ['ihdathiyata-muntasaf'],
          prompt: <Q source={QCM[2].source}>{QCM[2].text}</Q>,
          options: [
            '$\\left(-\\dfrac{3}{2}\\,;\\,0\\right)$',
            '$\\left(\\dfrac{3}{2}\\,;\\,0\\right)$', // le signe perdu
            '$\\left(0\\,;\\,-\\dfrac{3}{2}\\right)$', // abscisse et ordonnée échangées
          ].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'$x_I = \\dfrac{-2 + (-1)}{2} = -\\dfrac{3}{2}$ و $y_I = \\dfrac{-1 + 1}{2} = 0$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_muntasaf-masafa_P1'] },
        },
        {
          id: 'E2', skill: 'masafa', requires: ['masafa'],
          prompt: <Q source={QCM[3].source}>{QCM[3].text}</Q>,
          options: ['$5$', '$3{,}5$', '$7$'].map(M), // 3,5 : la moyenne ; 7 : la somme des coordonnées
          correct: 0, cols: 3,
          explain: <MathText>{'$OA = \\sqrt{(4 - 0)^2 + (3 - 0)^2} = \\sqrt{25} = 5$ ($7 = 4 + 3$ ليست المسافة).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_muntasaf-masafa_P2'] },
        },
        {
          id: 'E3', skill: 'masafa', requires: ['masafa', 'judhur-tabsit'],
          prompt: <Q source={QCM[4].source} figure={FIG_QCM4}>{`${QCM[4].text} (الكتاب: اختر الإجابة أو الإجابات الصحيحة)`}</Q>,
          options: [
            '$6\\sqrt{2}$ و $\\sqrt{72}$ (كلتاهما)',
            '$9$ فقط', // le distracteur du manuel : 9 ≠ 6√2 ≈ 8,49
            '$\\sqrt{72}$ فقط', // oublie que 6√2 est le même nombre
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$\\overrightarrow{AB}\\begin{pmatrix} -6 \\\\ -6 \\end{pmatrix}$ ، $AB = \\sqrt{36 + 36} = \\sqrt{72} = 6\\sqrt{2}$ : كتابتان لنفس العدد.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_muntasaf-masafa_P2'] },
        },
        {
          id: 'E4', skill: 'masafa', requires: ['masafa', 'judhur-tabsit'],
          prompt: <Q source={QCM[5].source}>{`${QCM[5].text} (الكتاب: اختر الإجابة أو الإجابات الصحيحة)`}</Q>,
          options: [
            '$\\sqrt{8}$ و $2\\sqrt{2}$ (كلتاهما)',
            '$0$ فقط', // (4 − 2) + (1 − 3) = 0 : les écarts additionnés avec leur signe
            '$\\sqrt{8}$ فقط',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$AB = \\sqrt{(4 - 2)^2 + (1 - 3)^2} = \\sqrt{4 + 4} = \\sqrt{8} = 2\\sqrt{2}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_muntasaf-masafa_P2'] },
        },
        {
          id: 'E5', skill: 'muntasaf', requires: ['ihdathiyata-muntasaf'],
          prompt: <Q source={PLATFORM_SOURCE}>{'نقطة اللقاء $I(1\\,;\\,-2)$ هي منتصف [AB]، والصديق الأول في $A(-3\\,;\\,1)$ . موقع الصديق الثاني B هو:'}</Q>,
          options: [
            '$B(5\\,;\\,-5)$',
            '$B\\left(-1\\,;\\,-\\dfrac{1}{2}\\right)$', // le milieu de [AI]
            '$B(-7\\,;\\,4)$', // 2A − I : le symétrique dans le mauvais sens
          ].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'$\\dfrac{-3 + x_B}{2} = 1$ إذن $x_B = 5$ ، و $\\dfrac{1 + y_B}{2} = -2$ إذن $y_B = -5$ : $B(5\\,;\\,-5)$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_muntasaf-masafa_P1'] },
        },
      ]}
      badges={[
        { id: 'muntasaf', emoji: '📍', label: 'نقطة اللقاء', test: (m) => (m.muntasaf ?? 0) === 0 },
        { id: 'masafa', emoji: '📏', label: 'مسافة GPS', test: (m) => (m.masafa ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت المنتصف والمسافة في معلم',
        title: 'انتهى الدرس 3',
        message: 'تعرف الآن أن إحداثيتي منتصف قطعة هما متوسطا إحداثيات طرفيها، وأن المسافة بين نقطتين في معلم متعامد ومتجانس هي وتر مثلث قائم ضلعاه فرقا الإحداثيات — بقيمتها المضبوطة.',
        verbs: ['أحدّد', 'أحسب', 'أبسّط', 'أتحقّق'],
        masterBadgeLabel: 'المسافة',
      }}
    />
  );
}
