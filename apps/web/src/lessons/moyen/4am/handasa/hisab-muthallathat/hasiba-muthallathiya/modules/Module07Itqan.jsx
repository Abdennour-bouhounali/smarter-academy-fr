import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PLATFORM_SOURCE, key } from '../content/textbook';

/**
 * Module 7 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Six épreuves de la plateforme (le manuel n'a pas de QCM pour cette leçon : « أؤكّد تعلّماتي » appartient aux leçons
 * 1 et 3 et à la synthèse) : P1 — tan 62° au centième, le piège du mode R ; P2 — un angle depuis son cosinus, le
 * programme d'un angle depuis sa tangente ; P3 — un angle et un rapport arrondis (troncature en distracteur).
 * Chaque épreuve évalue UN point d'apprentissage ; aucun nombre des modules.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Q = ({ children }) => (
  <span className="block"><MathText>{children}</MathText> <SourceTag source={PLATFORM_SOURCE} /></span>
);

export default function Module07Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="إختبار أولي"
      moduleSubtitle="ستة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={7 * 60}
      timerLabel="7 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الستة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال. الحاسبة مبرمجة بالدرجة إلا إذا قيل غير ذلك.</p> }}
      skills={{
        nisba: { label: 'نسبة زاوية بالحاسبة', module: 1 },
        zawiya: { label: 'قيس زاوية من نسبتها', module: 1 },
        tadwir: { label: 'تدوير النتيجة', module: 2 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'nisba', requires: ['hasiba-nisba'],
          prompt: <Q>{'المدوّر إلى الجزء من 100 لـ $\\tan 62^{\\circ}$ هو:'}</Q>,
          options: ['$1{,}88$', '$0{,}47$', '$-1{,}10$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{`${key('ON tan 62 =')} يعطي $1{,}880726465$ ، إذن $\\tan 62^{\\circ} \\approx 1{,}88$ . ( $0{,}47$ هو $\\cos 62^{\\circ}$ ، و $-1{,}10$ هو $\\tan 62$ بالراديان.)`}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_hasiba-muthallathiya_P1'] },
        },
        {
          id: 'E2', skill: 'nisba', requires: ['barmaja-daraja'],
          prompt: <Q>{`تلميذ ضغط ${key('ON sin 30 =')} فظهر على الشاشة $-0{,}9880316241$ . السبب:`}</Q>,
          options: [
            'الحاسبة غير مبرمجة بالدرجة',
            `نسي اللمسة ${key('2nd')}`,
            'يجب كتابة 30 قبل الدالة',
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{`$\\sin 30^{\\circ} = 0{,}5$ . العدد السالب هو جيب 30 راديانًا: نبرمج الحاسبة بالدرجة ( ${key('D')} ). ( ${key('2nd')} يحوّل الحساب إلى قيس زاوية، وترتيب اللمسات صحيح.)`}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_hasiba-muthallathiya_P1'] },
        },
        {
          id: 'E3', skill: 'zawiya', requires: ['hasiba-zawiya'],
          prompt: <Q>{'x زاوية حادة حيث $\\cos x = 0{,}4$ . المدوّر إلى الوحدة لقيس x (بالدرجة):'}</Q>,
          options: ['$66$', '$24$', '$1$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{`${key('ON 2nd cos⁻¹ 0,4 =')} يعطي $66{,}42182152$ ، إذن $x \\approx 66^{\\circ}$ . ( $24$ يأتي من ${key('sin⁻¹')} ، و $1$ من $\\cos 0{,}4^{\\circ}$ دون ${key('2nd')}.)`}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_hasiba-muthallathiya_P2'] },
        },
        {
          id: 'E4', skill: 'zawiya', requires: ['hasiba-zawiya'],
          prompt: <Q>{'البرنامج الذي يعطي قيس الزاوية الحادة B حيث $\\tan\\widehat{B} = 2{,}5$ :'}</Q>,
          options: [key('ON 2nd tan⁻¹ 2,5 ='), key('ON tan 2,5 ='), key('ON 2nd sin⁻¹ 2,5 =')].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{`نعرف الظل ونريد الزاوية: ${key('2nd')} ثم ${key('tan⁻¹')} ، فنجد $\\widehat{B} \\approx 68{,}2^{\\circ}$ . ( ${key('tan')} وحدها تحسب ظل زاوية قيسها $2{,}5^{\\circ}$ ، و ${key('sin⁻¹')} مع $2{,}5$ يعطي خطأ رياضيا لأن الجيب أصغر من 1.)`}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_hasiba-muthallathiya_P2'] },
        },
        {
          id: 'E5', skill: 'tadwir', requires: ['tadwir-dalaqa'],
          prompt: <Q>{'x زاوية حادة حيث $\\sin x = 0{,}75$ ، والشاشة تعرض $48{,}59037789$ . المدوّر إلى الجزء من 10 لقيس x:'}</Q>,
          options: ['$48{,}6^{\\circ}$', '$48{,}5^{\\circ}$', '$49^{\\circ}$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'رقم الأجزاء من 100 هو 9، وهو أكبر من 5: $x \\approx 48{,}6^{\\circ}$ . ( $48{,}5$ بتر، و $49$ هو المدوّر إلى الوحدة.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_hasiba-muthallathiya_P3'] },
        },
        {
          id: 'E6', skill: 'tadwir', requires: ['tadwir-dalaqa'],
          prompt: <Q>{'$\\cos 25^{\\circ} = 0{,}906307787$ على الشاشة. المدوّر إلى الجزء من 100:'}</Q>,
          options: ['$0{,}91$', '$0{,}90$', '$0{,}9$'].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'نحتفظ برقمين بعد الفاصلة (0,90) والرقم الموالي 6 أكبر من 5: نضيف 1، $\\cos 25^{\\circ} \\approx 0{,}91$ . ( $0{,}90$ بتر، و $0{,}9$ مدوّر إلى الجزء من 10.)'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_hasiba-muthallathiya_P3'] },
        },
      ]}
      badges={[
        { id: 'nisba', emoji: '🧮', label: 'النسبة بالحاسبة', test: (m) => (m.nisba ?? 0) === 0 },
        { id: 'zawiya', emoji: '📐', label: 'الزاوية من نسبتها', test: (m) => (m.zawiya ?? 0) === 0 },
        { id: 'tadwir', emoji: '✂️', label: 'التدوير', test: (m) => (m.tadwir ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت استعمال الحاسبة في حساب المثلثات',
        title: 'انتهى الدرس 2',
        message: 'تحسب الآن نسب زاوية معلومة بالحاسبة المبرمجة بالدرجة، وتعيّن قيس زاوية حادة من إحدى نسبها باللمسات العكسية، وتدوّر النتيجة إلى الدقة المطلوبة.',
        verbs: ['أبرمج', 'أحسب', 'أعكس', 'أدوّر'],
        masterBadgeLabel: 'حاسبة المثلثات',
      }}
    />
  );
}
