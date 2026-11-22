import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { QCM, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_QCM1, FIG_QCM2, FIG_QCM3, FIG_QCM5 } from '../content/figures';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Six épreuves : les items 1 à 5 de « أؤكّد تعلّماتي » (p. 124, extraction › destinations › qcm, duplicatedIn ce درس) —
 * l'item 3 a DEUX bonnes réponses (une combinaison), l'item 5 deux lignes IE / EL réunies en une combinaison (la
 * ligne EL du manuel imprime deux fois « 6 × sin 50° » : une seule fois ici) — et une épreuve de la plateforme pour
 * P2 (quel nombre peut être un sinus). Chaque épreuve évalue UN point d'apprentissage ; P1–P3 sont couverts.
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
      moduleSubtitle="ستة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={7 * 60}
      timerLabel="7 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الستة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        tasmiya: { label: 'جيب التمام والجيب والظل', module: 2 },
        hudud: { label: 'الجيب وجيب التمام بين 0 و 1', module: 2 },
        hisab: { label: 'حساب طول ضلع', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'tasmiya', requires: ['jayb'],
          prompt: <Q source={QCM[1].source} figure={FIG_QCM1}>{QCM[1].text}</Q>,
          options: ['$\\cos\\widehat{M} = \\dfrac{OM}{OB}$', '$\\cos\\widehat{M} = \\dfrac{OM}{MB}$', '$\\cos\\widehat{M} = \\dfrac{OB}{MB}$'].map(M),
          correct: 1, cols: 1,
          explain: <MathText>{'بالنسبة إلى M: المجاور [OM] والوتر [MB]: $\\cos\\widehat{M} = \\dfrac{OM}{MB}$ . ($\\dfrac{OM}{OB}$ لا يستعمل الوتر، و $\\dfrac{OB}{MB}$ هو $\\sin\\widehat{M}$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_nisab-muthallathiya_P1'] },
        },
        {
          id: 'E2', skill: 'tasmiya', requires: ['jayb'],
          prompt: <Q source={QCM[2].source} figure={FIG_QCM2}>{QCM[2].text}</Q>,
          options: ['$\\sin\\widehat{L} = \\dfrac{MN}{LN}$', '$\\sin\\widehat{L} = \\dfrac{LM}{LN}$', '$\\sin\\widehat{L} = \\dfrac{MN}{LM}$'].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'بالنسبة إلى L: المقابل [MN] والوتر [LN]: $\\sin\\widehat{L} = \\dfrac{MN}{LN}$ . ($\\dfrac{LM}{LN}$ هو $\\cos\\widehat{L}$ ، و $\\dfrac{MN}{LM}$ هو $\\tan\\widehat{L}$ .)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_nisab-muthallathiya_P1'] },
        },
        {
          id: 'E3', skill: 'hisab', requires: ['hisab-tul'],
          prompt: <Q source={QCM[3].source} figure={FIG_QCM3}>{`${QCM[3].text} (الكتاب: اختر الإجابة أو الإجابات الصحيحة)`}</Q>,
          options: [
            '$\\sin 35^{\\circ} = \\dfrac{7}{AC}$ و $\\sin 35^{\\circ} \\times AC = 7$',
            '$\\sin 35^{\\circ} = \\dfrac{AC}{7}$ فقط',
            '$\\sin 35^{\\circ} = \\dfrac{7}{AC}$ فقط',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'بالنسبة إلى C: [AB] مقابل و [AC] وتر: $\\sin 35^{\\circ} = \\dfrac{7}{AC}$ ، والجداء المتصالب يعطي $\\sin 35^{\\circ} \\times AC = 7$ : الكتابتان صحيحتان. ($\\dfrac{AC}{7}$ مقلوبة وأكبر من 1.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_nisab-muthallathiya_P3'] },
        },
        {
          id: 'E4', skill: 'hisab', requires: ['hisab-tul'],
          prompt: <Q source={QCM[4].source}>{QCM[4].text}</Q>,
          options: ['$MN = 2 \\times \\cos 70^{\\circ}$', '$MN = \\dfrac{\\cos 70^{\\circ}}{2}$', '$MN = \\dfrac{2}{\\cos 70^{\\circ}}$'].map(M),
          correct: 2, cols: 1,
          explain: <MathText>{'MN في المقام: $\\cos 70^{\\circ} \\times MN = 2$ ومنه $MN = \\dfrac{2}{\\cos 70^{\\circ}}$ . ($2 \\times \\cos 70^{\\circ}$ يضرب بدل أن يقسم.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_nisab-muthallathiya_P3'] },
        },
        {
          id: 'E5', skill: 'hisab', requires: ['hisab-tul'],
          prompt: <Q source={QCM[5].source} figure={FIG_QCM5}>{`${QCM[5].text} (السطران IE و EL معا)`}</Q>,
          options: [
            '$IE = 6 \\times \\tan 50^{\\circ}$ و $EL = \\dfrac{6}{\\cos 50^{\\circ}}$',
            '$IE = \\dfrac{6}{\\tan 50^{\\circ}}$ و $EL = \\dfrac{6}{\\cos 50^{\\circ}}$',
            '$IE = 6 \\times \\sin 50^{\\circ}$ و $EL = 6 \\times \\sin 50^{\\circ}$',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'بالنسبة إلى L: [IL] مجاور معلوم، [IE] مقابل، [EL] وتر. $\\tan 50^{\\circ} = \\dfrac{IE}{6}$ ومنه $IE = 6 \\times \\tan 50^{\\circ}$ ؛ $\\cos 50^{\\circ} = \\dfrac{6}{EL}$ ومنه $EL = \\dfrac{6}{\\cos 50^{\\circ}}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_nisab-muthallathiya_P3'] },
        },
        {
          id: 'E6', skill: 'hudud', requires: ['hudud'],
          prompt: <Q source={PLATFORM_SOURCE}>{'أيّ هذه الأعداد يمكن أن يكون جيب زاوية حادة في مثلث قائم؟'}</Q>,
          options: ['$\\dfrac{7}{9}$', '$\\dfrac{9}{7}$', '$1$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'الجيب = المقابل ÷ الوتر، والوتر أطول: العدد محصور تماما بين 0 و 1. $\\dfrac{9}{7} > 1$ مستحيل، و 1 يعني مقابلا بطول الوتر.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_nisab-muthallathiya_P2'] },
        },
      ]}
      badges={[
        { id: 'tasmiya', emoji: '📐', label: 'النسب المثلثية', test: (m) => (m.tasmiya ?? 0) === 0 },
        { id: 'hudud', emoji: '🧭', label: 'بين 0 و 1', test: (m) => (m.hudud ?? 0) === 0 },
        { id: 'hisab', emoji: '📏', label: 'حساب الأطوال', test: (m) => (m.hisab ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت النسب المثلثية لزاوية حادة',
        title: 'انتهى الدرس 1',
        message: 'تعرف الآن جيب التمام والجيب والظل لزاوية حادة في مثلث قائم، وأنها لا تتعلق إلا بقيس الزاوية، وأن الجيب وجيب التمام بين 0 و 1، وتحسب بها أطوالا مجهولة.',
        verbs: ['أسمّي الأضلاع', 'أكتب النسب', 'أحدّ', 'أحسب'],
        masterBadgeLabel: 'النسب المثلثية',
      }}
    />
  );
}
