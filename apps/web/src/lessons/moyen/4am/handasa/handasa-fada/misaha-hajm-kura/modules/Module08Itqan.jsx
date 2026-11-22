import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import SpaceFigure from '../../../../../../common/components/SpaceFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PLATFORM_SOURCE } from '../content/textbook';
import { FIG_TEST_ARCHIMEDES } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Le scan n'a pas de QCM (« أؤكّد
 * تعلّماتي ») : cinq épreuves de la plateforme, chacune avec UN point principal, dont les nombres n'apparaissent nulle part
 * ailleurs dans la leçon : un ballon de basket (P1), une boule de pétanque (P2), l'arrondi au dixième (P3), le rayon depuis
 * l'aire (P1), Archimède avec un cylindre de 686π cm³ (P2). P1–P3 couverts.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Q = ({ children, figure }) => (
  <span className="block space-y-2">
    <span><MathText>{children}</MathText> <SourceTag source={PLATFORM_SOURCE} /></span>
    {figure && <SpaceFigure {...figure} />}
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
        misaha: { label: 'مساحة الكرة', module: 2 },
        hajm: { label: 'حجم الجلة', module: 2 },
        tadwir: { label: 'القيمة المضبوطة والمدوّرة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'misaha', requires: ['misahat-kura'],
          prompt: <Q>{'كرة سلة في ملعب الحيّ نصف قطرها $12\\,\\mathrm{cm}$ . القيمة المضبوطة لمساحة سطحها:'}</Q>,
          options: [
            '$576\\pi\\,\\mathrm{cm}^2$',
            // πR² : un seul disque (MISC-MISAHA-DAIRA)
            '$144\\pi\\,\\mathrm{cm}^2$',
            // 2πR : une longueur (MISC-MISAHA-MUHIT)
            '$24\\pi\\,\\mathrm{cm}$',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$\\mathcal{A} = 4\\pi \\times 12^2 = 4\\pi \\times 144 = 576\\pi\\,\\mathrm{cm}^2$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_misaha-hajm-kura_P1'] },
        },
        {
          id: 'E2', skill: 'hajm', requires: ['hajm-julla'],
          prompt: <Q>{'كرة «بيتانك» حديدية (جلة) نصف قطرها $4{,}5\\,\\mathrm{cm}$ . القيمة المضبوطة لحجمها:'}</Q>,
          options: [
            '$121{,}5\\pi\\,\\mathrm{cm}^3$',
            // R² au lieu de R³ (MISC-HAJM-QUWA)
            '$27\\pi\\,\\mathrm{cm}^3$',
            // la formule de l'aire 4πR² (MISC-WAHDA)
            '$81\\pi\\,\\mathrm{cm}^3$',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$\\mathcal{V} = \\frac{4}{3}\\pi \\times 4{,}5^3 = \\frac{4}{3}\\pi \\times 91{,}125 = 121{,}5\\pi\\,\\mathrm{cm}^3$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_misaha-hajm-kura_P2'] },
        },
        {
          id: 'E3', skill: 'tadwir', requires: ['qima-muqarraba'],
          prompt: <Q>{'حجم جلة نصف قطرها $2\\,\\mathrm{cm}$ هو $\\frac{32}{3}\\pi\\,\\mathrm{cm}^3$ . قيمته المدوّرة إلى الجزء من عشرة:'}</Q>,
          options: [
            '$33{,}5\\,\\mathrm{cm}^3$',
            // π oublié : 32/3 ≈ 10,7 (MISC-TADWIR)
            '$10{,}7\\,\\mathrm{cm}^3$',
            // arrondi au centième, pas au dixième (MISC-TADWIR)
            '$33{,}51\\,\\mathrm{cm}^3$',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$\\frac{32}{3}\\pi = 33{,}510\\ldots$ ؛ رقم الأجزاء من عشرة 5 والرقم الموالي 1 أصغر من 5: $33{,}5\\,\\mathrm{cm}^3$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_misaha-hajm-kura_P3'] },
        },
        {
          id: 'E4', skill: 'misaha', requires: ['tariqa-aksiya'],
          prompt: <Q>{'مساحة كرة مجسّم الكرة الأرضية في القسم $256\\pi\\,\\mathrm{cm}^2$ . نصف قطرها:'}</Q>,
          options: [
            '$8\\,\\mathrm{cm}$',
            // R² = 64 pris pour R
            '$64\\,\\mathrm{cm}$',
            // √256 sans diviser par 4
            '$16\\,\\mathrm{cm}$',
          ].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'$4\\pi R^2 = 256\\pi$ أي $R^2 = 64$ و $R = 8\\,\\mathrm{cm}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_misaha-hajm-kura_P1'] },
        },
        {
          id: 'E5', skill: 'hajm', requires: ['arkhimidis-hajm'],
          prompt: <Q figure={FIG_TEST_ARCHIMEDES}>{'كرة نصف قطرها $R$ داخل أسطوانة نصف قطر قاعدتها $R$ وارتفاعها $2R$ (أرخميدس). حجم الأسطوانة $686\\pi\\,\\mathrm{cm}^3$ . حجم الجلة:'}</Q>,
          options: [
            '$\\frac{1372}{3}\\pi\\,\\mathrm{cm}^3$',
            // le cylindre entier
            '$686\\pi\\,\\mathrm{cm}^3$',
            // la moitié
            '$343\\pi\\,\\mathrm{cm}^3$',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'حجم الجلة ثلثا حجم الأسطوانة: $\\frac{2}{3} \\times 686\\pi = \\frac{1372}{3}\\pi\\,\\mathrm{cm}^3$ (هنا $R = 7\\,\\mathrm{cm}$ لأن $2\\pi R^3 = 686\\pi$).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_misaha-hajm-kura_P2'] },
        },
      ]}
      badges={[
        { id: 'misaha', emoji: '🍊', label: 'مساحة الكرة', test: (m) => (m.misaha ?? 0) === 0 },
        { id: 'hajm', emoji: '🧃', label: 'حجم الجلة', test: (m) => (m.hajm ?? 0) === 0 },
        { id: 'tadwir', emoji: '🎯', label: 'التدوير', test: (m) => (m.tadwir ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت مساحة الكرة وحجم الجلة',
        title: 'انتهى الدرس 2',
        message: 'تعرف الآن أن مساحة الكرة أربعة أقراص كبرى، 4πR²، وأن حجم الجلة ثلثا حجم الأسطوانة التي تحيط بها، 4/3·πR³، وتكتب القيمة المضبوطة بدلالة π ثم تدوّر في آخر الحساب.',
        verbs: ['أقشّر', 'أعصر', 'أحسب', 'أدوّر'],
        masterBadgeLabel: 'الكرة والجلة',
      }}
    />
  );
}
