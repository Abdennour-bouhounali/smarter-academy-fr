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
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Le scan n'a pas de QCM (أؤكّد
 * تعلّماتي manque) : cinq épreuves de la plateforme, sur des nombres qui n'apparaissent nulle part ailleurs dans la leçon.
 * Chaque épreuve évalue UN point ; P1 (l'effet de k : × k³, k depuis un rapport d'aires) et P2 (le volume de l'image, la
 * pyramide coupée, la capacité d'une maquette) couverts. Les réponses sont recalculées dans content/figures.test.js.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Q = ({ children, source, figure }) => (
  <span className="block space-y-2">
    <span><MathText>{children}</MathText> <SourceTag source={source} /></span>
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
        athar: { label: 'أثر النسبة k على الأطوال والمساحات والحجوم', module: 2 },
        hisab: { label: 'حساب مقادير المجسّم الناتج', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'athar', requires: ['takbir-khassiya'],
          prompt: <Q source={PLATFORM_SOURCE}>{'في لعبة البناء، كُبّر مجسّم بالنسبة $k = 3$ . حجمه يُضرب في:'}</Q>,
          // 3 : × k ; 9 : × k² (MISC-TAKBIR-HAJM-K)
          options: ['$27$', '$3$', '$9$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'الحجوم تُضرب في $k^3 = 3 \\times 3 \\times 3 = 27$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_takbir-tasghir_P1'] },
        },
        {
          id: 'E2', skill: 'athar', requires: ['tariqat-judhur'],
          prompt: <Q source={PLATFORM_SOURCE}>{'مجسّم كبير هو تكبير لمجسّم صغير، ومساحة أوجهه تساوي $\\dfrac{16}{9}$ مساحة أوجه الصغير. نسبة التكبير:'}</Q>,
          // 16/9 : le rapport des aires pris pour k (MISC-TAKBIR-MISAHA-K) ; 3/4 : le rapport renversé (MISC-TAKBIR-ITTIJAH)
          options: ['$k = \\dfrac{4}{3}$', '$k = \\dfrac{16}{9}$', '$k = \\dfrac{3}{4}$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'$k^2 = \\dfrac{16}{9}$ ، إذن $k = \\dfrac{4}{3}$ ، و $k > 1$ : تكبير.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_takbir-tasghir_P1'] },
        },
        {
          id: 'E3', skill: 'hisab', requires: ['tariqat-maqadir'],
          prompt: <Q source={PLATFORM_SOURCE}>{'علبة على شكل متوازي مستطيلات أبعادها $6\\,\\mathrm{cm}$ و $4\\,\\mathrm{cm}$ و $2\\,\\mathrm{cm}$ ، صُغّرت بالنسبة $\\dfrac{1}{2}$ . حجم العلبة الناتجة:'}</Q>,
          // 24 : V × 1/2 ; 12 : V × (1/2)² (MISC-TAKBIR-HAJM-K)
          options: ['$6\\,\\mathrm{cm}^3$', '$24\\,\\mathrm{cm}^3$', '$12\\,\\mathrm{cm}^3$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'$\\mathcal{V} = 6 \\times 4 \\times 2 = 48\\,\\mathrm{cm}^3$ ، و $\\mathcal{V}\' = \\left(\\dfrac{1}{2}\\right)^3 \\times 48 = 6\\,\\mathrm{cm}^3$ (أو $3 \\times 2 \\times 1 = 6$).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_takbir-tasghir_P2'] },
        },
        {
          id: 'E4', skill: 'hisab', requires: ['maqta-tasghir'],
          prompt: <Q source={PLATFORM_SOURCE} figure={FIG_TEST_PYRAMID}>{'هرم ارتفاعه $9\\,\\mathrm{cm}$ وحجمه $108\\,\\mathrm{cm}^3$ ، يقطعه مستو يوازي قاعدته على بعد $3\\,\\mathrm{cm}$ من رأسه. حجم الهرم الصغير الذي له نفس الرأس:'}</Q>,
          // 36 : × 1/3 ; 12 : × (1/3)² (MISC-TAKBIR-HAJM-K)
          options: ['$4\\,\\mathrm{cm}^3$', '$36\\,\\mathrm{cm}^3$', '$12\\,\\mathrm{cm}^3$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'الهرم الصغير تصغير للهرم الأصلي بالنسبة $k = \\dfrac{3}{9} = \\dfrac{1}{3}$ : $\\left(\\dfrac{1}{3}\\right)^3 \\times 108 = \\dfrac{108}{27} = 4\\,\\mathrm{cm}^3$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_takbir-tasghir_P2'] },
        },
        {
          id: 'E5', skill: 'hisab', requires: ['tariqat-maqadir'],
          prompt: <Q source={PLATFORM_SOURCE}>{'سعة خزّان مائي في سطح عمارة $2000\\,\\mathrm{L}$ . نموذج مصغّر له بالنسبة $\\dfrac{1}{10}$ سعته:'}</Q>,
          // 200 L : × 1/10 ; 20 L : × (1/10)² (MISC-TAKBIR-HAJM-K)
          options: ['$2\\,\\mathrm{L}$', '$200\\,\\mathrm{L}$', '$20\\,\\mathrm{L}$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'السعة حجم: $\\left(\\dfrac{1}{10}\\right)^3 \\times 2000 = \\dfrac{2000}{1000} = 2\\,\\mathrm{L}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_takbir-tasghir_P2'] },
        },
      ]}
      badges={[
        { id: 'athar', emoji: '🧊', label: 'أثر k', test: (m) => (m.athar ?? 0) === 0 },
        { id: 'hisab', emoji: '🧮', label: 'مقادير المجسّم الناتج', test: (m) => (m.hisab ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت التكبير والتصغير في الفضاء',
        title: 'انتهى الدرس 4',
        message: 'تعرف الآن أن التكبير أو التصغير بالنسبة k يضرب الأطوال في k والمساحات في k² والحجوم في k³، وتجد k من طولين أو من نسبة مساحتين أو حجمين.',
        verbs: ['أكبّر', 'أصغّر', 'أحسب', 'أتحقّق'],
        masterBadgeLabel: 'التكبير والتصغير',
      }}
    />
  );
}
