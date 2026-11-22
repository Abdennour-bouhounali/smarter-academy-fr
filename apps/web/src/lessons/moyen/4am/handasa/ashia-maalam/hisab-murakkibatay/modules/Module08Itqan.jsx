import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PLATFORM_SOURCE } from '../content/textbook';

/**
 * Module 8 — إختبار أولي (après les trois « مسائل », modules 5–7) (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon.
 * Cinq épreuves de la plateforme (aucun QCM du manuel n'est rattaché à ce درس), sur d'autres lettres et d'autres nombres
 * que la leçon, des contextes algériens. Chaque épreuve évalue UN point ; P1 (E1, E2), P2 (E3), P3 (E4, E5).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Q = ({ children }) => (
  <span className="block space-y-2">
    <span><MathText>{children}</MathText> <SourceTag source={PLATFORM_SOURCE} /></span>
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
        hisab: { label: 'حساب مركبتي شعاع', module: 2 },
        tasawi: { label: 'تساوي شعاعين', module: 2 },
        majhul: { label: 'نقطة مجهولة', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'hisab', requires: ['qanun-murakkibatayn'],
          prompt: <Q>{'على خريطة المترو في معلم، محطة البريد المركزي $G(-3\\,;\\,4)$ ومحطة ساحة الشهداء $S(2\\,;\\,-1)$ . مركبتا الشعاع $\\overrightarrow{GS}$ هما:'}</Q>,
          options: [
            '$\\begin{pmatrix} 5 \\\\ -5 \\end{pmatrix}$',
            '$\\begin{pmatrix} -5 \\\\ 5 \\end{pmatrix}$', // G − S : à l'envers
            '$\\begin{pmatrix} 2 \\\\ -1 \\end{pmatrix}$', // coordonnées de S
            '$\\begin{pmatrix} -1 \\\\ 3 \\end{pmatrix}$', // somme des coordonnées
          ].map(M),
          correct: 0, cols: 4,
          explain: <MathText>{'$x_S - x_G = 2 - (-3) = 5$ و $y_S - y_G = -1 - 4 = -5$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_hisab-murakkibatay_P1'] },
        },
        {
          id: 'E2', skill: 'hisab', requires: ['qanun-murakkibatayn'],
          prompt: <Q>{'$U(1{,}5\\,;\\,-2)$ و $V(-0{,}5\\,;\\,3)$ . مركبتا الشعاع $\\overrightarrow{VU}$ هما:'}</Q>,
          options: [
            '$\\begin{pmatrix} 2 \\\\ -5 \\end{pmatrix}$',
            '$\\begin{pmatrix} -2 \\\\ 5 \\end{pmatrix}$', // UV au lieu de VU
            '$\\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$', // somme des coordonnées
          ].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'المبدأ V والنهاية U: $1{,}5 - (-0{,}5) = 2$ و $-2 - 3 = -5$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_hisab-murakkibatay_P1'] },
        },
        {
          id: 'E3', skill: 'tasawi', requires: ['tasawi-murakkibat'],
          prompt: <Q>{'$K(0\\,;\\,2)$ ، $L(4\\,;\\,-1)$ ، $M(-3\\,;\\,5)$ ، $N(1\\,;\\,8)$ . أيّ عبارة صحيحة؟'}</Q>,
          options: [
            'الشعاعان $\\overrightarrow{KL}$ و $\\overrightarrow{MN}$ غير متساويين: لهما نفس المركبة الأولى فقط',
            '$\\overrightarrow{KL} = \\overrightarrow{MN}$', // seconde composante : −3 ≠ 3
            '$\\overrightarrow{KL} = \\overrightarrow{NM}$', // NM(−4 ; −3) : première composante différente
          ].map(M),
          correct: 0, cols: 1,
          explain: <MathText>{'$\\overrightarrow{KL}\\begin{pmatrix} 4 \\\\ -3 \\end{pmatrix}$ و $\\overrightarrow{MN}\\begin{pmatrix} 4 \\\\ 3 \\end{pmatrix}$ : المركبتان الثانيتان مختلفتان، فالشعاعان غير متساويين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_hisab-murakkibatay_P2'] },
        },
        {
          id: 'E4', skill: 'majhul', requires: ['nuqta-majhula'],
          prompt: <Q>{'في عرض طائرات مسيّرة فوق خليج الجزائر، ثلاث طائرات في $A(1\\,;\\,2)$ ، $B(5\\,;\\,3)$ ، $C(4\\,;\\,6)$ . أين نضع الطائرة D ليكون ABCD متوازي أضلاع؟'}</Q>,
          options: [
            '$D(0\\,;\\,5)$',
            '$D(8\\,;\\,7)$', // CD = AB : ABCD croisé
            '$D(2\\,;\\,-1)$', // A + B − C
          ].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'$\\overrightarrow{AB} = \\overrightarrow{DC}$ : $4 - x_D = 4$ و $6 - y_D = 1$ ، إذن $D(0\\,;\\,5)$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_hisab-murakkibatay_P3'] },
        },
        {
          id: 'E5', skill: 'majhul', requires: ['nuqta-majhula'],
          prompt: <Q>{'$\\vec{u}\\begin{pmatrix} -4 \\\\ 3 \\end{pmatrix}$ و $P(2\\,;\\,-1)$ . النقطة Q حيث $\\overrightarrow{QP} = \\vec{u}$ هي:'}</Q>,
          options: [
            '$Q(6\\,;\\,-4)$',
            '$Q(-2\\,;\\,2)$', // PQ = u : l'ordre des lettres
            '$Q(-4\\,;\\,3)$', // les composantes prises pour les coordonnées
          ].map(M),
          correct: 0, cols: 3,
          explain: <MathText>{'$\\overrightarrow{QP}\\begin{pmatrix} 2 - x_Q \\\\ -1 - y_Q \\end{pmatrix}$ : $2 - x_Q = -4$ و $-1 - y_Q = 3$ ، إذن $Q(6\\,;\\,-4)$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_hisab-murakkibatay_P3'] },
        },
      ]}
      badges={[
        { id: 'hisab', emoji: '🧮', label: 'المركبتان', test: (m) => (m.hisab ?? 0) === 0 },
        { id: 'tasawi', emoji: '🟰', label: 'التساوي', test: (m) => (m.tasawi ?? 0) === 0 },
        { id: 'majhul', emoji: '🎮', label: 'النقطة المجهولة', test: (m) => (m.majhul ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت حساب مركبتي شعاع وتساوي شعاعين',
        title: 'انتهى الدرس 2',
        message: 'تحسب الآن مركبتي شعاع دون عدّ بطرح إحداثيتي المبدأ من إحداثيتي النهاية، وتقارن شعاعين بمركباتهما، وتجد إحداثيتي نقطة مجهولة لتكوين شعاع مساو أو متوازي أضلاع.',
        verbs: ['أحسب', 'أقارن', 'أجد المجهول'],
        masterBadgeLabel: 'بوابات المعلم',
      }}
    />
  );
}
