import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { QCM1, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_QCM1, FIG_TEST_KL } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves : l'item 1 de « أؤكّد تعلّماتي » (p. 148, extraction › destinations › qcm, duplicatedIn ce درس — les
 * options du manuel, imprimées en couples, sont écrites ici en colonne comme le manuel l'enseigne) et quatre épreuves
 * de la plateforme : une flèche vers la gauche et le bas (P1), OM ↔ M (P2), représenter un vecteur depuis un point
 * (P3, deux fois). Chaque épreuve évalue UN point ; P1–P3 couverts. Aucun nombre n'est celui d'un module.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const col = (a, b) => `$\\begin{pmatrix} ${a} \\\\ ${b} \\end{pmatrix}$`;
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
      estimatedTime="5 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        qiraa: { label: 'قراءة مركبتي شعاع', module: 2 },
        om: { label: 'مركبتا OM وإحداثيتا M', module: 2 },
        tamthil: { label: 'تمثيل شعاع علمت مركبتاه', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'qiraa', requires: ['qiraa-bayaniya'],
          prompt: <Q source={QCM1.source} figure={FIG_QCM1}>{QCM1.text}</Q>,
          options: [
            col(-5, -4),
            col(-5, 3), // la longueur verticale mal comptée
            col(5, -3), // le sens horizontal inversé et la hauteur mal lue
          ].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'من A إلى B: 5 وحدات نحو اليسار ثم 4 نحو الأسفل — مركبتان سالبتان: $\\overrightarrow{AB}\\begin{pmatrix} -5 \\\\ -4 \\end{pmatrix}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_murakkibata-shuaa_P1'] },
        },
        {
          id: 'E2', skill: 'qiraa', requires: ['qiraa-bayaniya'],
          prompt: <Q source={PLATFORM_SOURCE} figure={FIG_TEST_KL}>{'على الشكل، مركبتا الشعاع $\\overrightarrow{KL}$ هما:'}</Q>,
          options: [
            col(-5, -2),
            col(5, 2), // les signes oubliés (MISC-MAALAM-ISHARA)
            col(-2, -5), // échangé (MISC-MAALAM-TABDIL-X-Y)
            col(-3, 1), // les coordonnées de L (MISC-MAALAM-IHDATHIYAT-MURAKKIBAT)
          ].map(M),
          correct: 0, cols: 4,
          explain: <MathText>{'من K نسير 5 وحدات نحو اليسار ثم وحدتين نحو الأسفل: $\\overrightarrow{KL}\\begin{pmatrix} -5 \\\\ -2 \\end{pmatrix}$ . أما $(-3\\,;\\,1)$ فهما إحداثيتا L.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_murakkibata-shuaa_P1'] },
        },
        {
          id: 'E3', skill: 'om', requires: ['murakkibata-om'],
          prompt: <Q source={PLATFORM_SOURCE}>{'في معلم مبدؤه O، النقطة $M(-4\\,;\\,2{,}5)$ . مركبتا الشعاع $\\overrightarrow{OM}$ هما:'}</Q>,
          options: [
            col(-4, '2{,}5'),
            col('2{,}5', -4), // échangé
            col(4, '-2{,}5'), // le trajet de M vers O
          ].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'مركبتا $\\overrightarrow{OM}$ هما إحداثيتا M بنفس الترتيب: $\\begin{pmatrix} -4 \\\\ 2{,}5 \\end{pmatrix}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_murakkibata-shuaa_P2'] },
        },
        {
          id: 'E4', skill: 'tamthil', requires: ['tamthil-shuaa'],
          prompt: <Q source={PLATFORM_SOURCE}>{'$\\vec{u}\\begin{pmatrix} -3 \\\\ 2 \\end{pmatrix}$ . ممثّل $\\vec{u}$ الذي مبدؤه $P(1\\,;\\,-1)$ ينتهي عند النقطة:'}</Q>,
          options: [
            '$Q(-2\\,;\\,1)$',
            '$Q(-3\\,;\\,2)$', // les composantes prises pour l'adresse
            '$Q(4\\,;\\,-3)$', // le trajet à l'envers
            '$Q(3\\,;\\,-4)$', // échangé : 2 en largeur, −3 en hauteur
          ].map(M),
          correct: 0, cols: 2,
          explain: <MathText>{'من P: 3 وحدات نحو اليسار ثم وحدتان نحو الأعلى: $Q(-2\\,;\\,1)$ . النقطة $(-3\\,;\\,2)$ نهاية الممثّل الذي مبدؤه O فقط.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_murakkibata-shuaa_P3'] },
        },
        {
          id: 'E5', skill: 'tamthil', requires: ['tamthil-shuaa'],
          prompt: <Q source={PLATFORM_SOURCE}>{'لتمثيل الشعاع $\\vec{v}\\begin{pmatrix} 4 \\\\ -1 \\end{pmatrix}$ انطلاقا من نقطة A:'}</Q>,
          options: [
            'ننتقل من A بـ 4 وحدات نحو اليمين ثم بوحدة نحو الأسفل',
            'ننتقل من A بـ 4 وحدات نحو اليسار ثم بوحدة نحو الأعلى', // le sens inversé
            'ننتقل من A بـ 4 وحدات نحو الأسفل ثم بوحدة نحو اليمين', // les axes échangés
            'نعلّم النقطة التي إحداثيتاها $4$ و $-1$', // l'adresse au lieu du trajet (vrai seulement si A = O)
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'المركبة الأولى 4 أفقية (نحو اليمين لأنها موجبة)، والثانية $-1$ عمودية (نحو الأسفل لأنها سالبة)، انطلاقا من A.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_murakkibata-shuaa_P3'] },
        },
      ]}
      badges={[
        { id: 'qiraa', emoji: '🛵', label: 'قراءة المركبتين', test: (m) => (m.qiraa ?? 0) === 0 },
        { id: 'om', emoji: '📍', label: 'OM والإحداثيتان', test: (m) => (m.om ?? 0) === 0 },
        { id: 'tamthil', emoji: '🧭', label: 'تمثيل شعاع', test: (m) => (m.tamthil ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت قراءة مركبتي شعاع وتمثيله',
        title: 'انتهى الدرس 1',
        message: 'تعرف الآن أن مركبتي شعاع هما الإزاحة الأفقية ثم العمودية بإشارتيهما، وأن مركبتي OM هما إحداثيتا M، وأنك تمثّل شعاعا علمت مركبتاه انطلاقا من أي نقطة.',
        verbs: ['أقرأ', 'أكتب', 'أمثّل', 'أميّز'],
        masterBadgeLabel: 'مركبتا شعاع',
      }}
    />
  );
}
