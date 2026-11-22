import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TEST } from '../content/textbook';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : six situations de la plateforme (content/textbook.js › TEST), des points
 * et des contextes qui n'apparaissent nulle part ailleurs dans la leçon ni dans le banc.
 *   E1 (P1)  RS + TR + ST = 0⃗ (un aller-retour en tramway de Constantine) — l'ordre de la somme est libre
 *   E2 (P1)  EFGH : EF + EH = EG (la règle du parallélogramme : la diagonale issue de E)
 *   E3 (P2)  UV = XW ⇒ UVWX متوازي أضلاع (l'ordre des sommets)
 *   E4 (P2)  NP + NQ = 0⃗ ⇒ N منتصف [PQ]
 *   E5 (P3)  le drone : PM = AB + CD + EF se construit bout à bout depuis P
 *   E6 (P3)  l'image d'un cercle par la translation de vecteur UV + VW : centre Ω′ (ΩΩ′ = UW), rayon 3
 * Chaque distracteur est FAUX et porte une erreur nommée (MISC-SHUAA-SIFR-ADAD, -SHAL-AKS, -QAIDA-QUTR, -TARTIB-RUUS,
 * -MUNTASAF-IB-IA, -INSHA-MABDA, -DAIRA-QUTR) ; une seule LP primaire par épreuve, les trois couvertes deux fois.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={TEST.source} /></span>;
const O1 = ['$\\overrightarrow{0}$', '$\\overrightarrow{RT}$', 'العدد 0', '$2\\overrightarrow{RS}$'];
const O2 = ['$\\overrightarrow{EG}$', '$\\overrightarrow{FH}$', '$\\overrightarrow{HF}$', '$\\overrightarrow{GE}$'];
const O3 = ['UVWX متوازي أضلاع', 'UVXW متوازي أضلاع', '(UV) و (XW) متقاطعان', 'V منتصف [UW]'];
const O4 = ['N منتصف [PQ]', 'P منتصف [NQ]', 'NPQ مثلث قائم في N', 'Q منتصف [NP]'];
const O5 = [
  'من P ممثّل $\\overrightarrow{AB}$ ، ثم من نهايته ممثّل $\\overrightarrow{CD}$ ، ثم من نهاية هذا ممثّل $\\overrightarrow{EF}$ : M هي النهاية الأخيرة',
  'من P الممثّلات الثلاثة، و M نهاية أطولها',
  'الأشعة الثلاثة في أماكنها، و M نهاية $\\overrightarrow{EF}$',
  'من P ممثّل $\\overrightarrow{AB}$ ، ثم من A ممثّل $\\overrightarrow{CD}$ ، ثم من C ممثّل $\\overrightarrow{EF}$',
];
const O6 = [
  'الدائرة التي مركزها Ω′ حيث $\\overrightarrow{\\Omega\\Omega\'} = \\overrightarrow{UW}$ ، ونصف قطرها 3',
  'الدائرة التي مركزها Ω′ حيث $\\overrightarrow{\\Omega\'\\Omega} = \\overrightarrow{UW}$ ، ونصف قطرها 3',
  'الدائرة التي مركزها Ω′ حيث $\\overrightarrow{\\Omega\\Omega\'} = \\overrightarrow{UW}$ ، ونصف قطرها $3 + UW$',
  'الدائرة التي مركزها W ونصف قطرها 3',
];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Itqan() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="إختبار أولي" moduleSubtitle="وضعيات جديدة: الأدوات نفسها، نقط أخرى" estimatedTime="7 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={7 * 60} timerLabel="7 دقائق"
      brief={{
        tag: 'إختبار أولي — وضعيات من المنصّة', title: TEST.title, tone: 'slate',
        body: (
          <div className="space-y-1" data-situation="itqan">
            <p>ارسم على مسودّتك شكلا تقريبيا، واستعمل المعطيات وحدها: علاقة شال، تعويض شعاع بشعاع يساويه، حذف المتعاكسين.</p>
          </div>
        ),
      }}
      skills={{
        tabsit: { label: 'تبسيط عبارة شعاعية', module: 1 },
        burhan: { label: 'البرهان والاستنتاج', module: 2 },
        insha: { label: 'إنشاء مجموع عدة أشعة', module: 3 },
      }}
      epreuves={[
        { id: 'E1', skill: 'tabsit', requires: ['rabt-shal', 'mutaakisan-sifr'], prompt: <Q><MathText>{`${TEST.metro} $\\overrightarrow{RS} + \\overrightarrow{TR} + \\overrightarrow{ST}$ يساوي:`}</MathText></Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 2,
          explain: <MathText>{'نرتّب الحدود لتتتابع: $\\overrightarrow{TR} + \\overrightarrow{RS} + \\overrightarrow{ST} = \\overrightarrow{TT} = \\overrightarrow{0}$ (عودة إلى المحطة نفسها). $\\overrightarrow{RT}$ ينسى الحدّ الأخير، والعدد 0 ليس شعاعا، و $2\\overrightarrow{RS}$ يجمع حدّين لا يتساويان.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_barahin-ashia_P1'] } },
        { id: 'E2', skill: 'tabsit', requires: ['taawid-musawi', 'qaidat-mutawazi'], prompt: <Q><MathText>{`${TEST.park} $\\overrightarrow{EF} + \\overrightarrow{EH}$ يساوي:`}</MathText></Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 4,
          explain: <MathText>{'$\\overrightarrow{EH} = \\overrightarrow{FG}$ (EFGH متوازي أضلاع) فـ $\\overrightarrow{EF} + \\overrightarrow{EH} = \\overrightarrow{EF} + \\overrightarrow{FG} = \\overrightarrow{EG}$ ، القطر الصادر من E. $\\overrightarrow{FH}$ و $\\overrightarrow{HF}$ يمثّلان القطر الآخر، و $\\overrightarrow{GE}$ معاكس للنتيجة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_barahin-ashia_P1'] } },
        { id: 'E3', skill: 'burhan', requires: ['istintajat', 'tariqat-abdc'], prompt: <Q><MathText>{`${TEST.uvwx} إذن:`}</MathText></Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 2,
          explain: <MathText>{'$\\overrightarrow{UV} = \\overrightarrow{XW}$ : من U إلى V كما من X إلى W، فالرباعي UVWX متوازي أضلاع. UVXW رباعي متقاطع الضلعين، والشعاعان المتساويان لهما مستقيمان متوازيان لا متقاطعان، ولا شيء يجعل V منتصف [UW].'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_barahin-ashia_P2'] } },
        { id: 'E4', skill: 'burhan', requires: ['muntasaf-mutaakisan', 'istintajat'], prompt: <Q><MathText>{`${TEST.npq} إذن:`}</MathText></Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 2,
          explain: <MathText>{'$\\overrightarrow{NQ} = -\\overrightarrow{NP} = \\overrightarrow{PN}$ أي $\\overrightarrow{PN} = \\overrightarrow{NQ}$ : N منتصف [PQ]، والنقط الثلاث على استقامة واحدة (فلا مثلث).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_barahin-ashia_P2'] } },
        { id: 'E5', skill: 'insha', requires: ['insha-majmu'], prompt: <Q><MathText>{`${TEST.drone} لإنشاء M نرسم:`}</MathText></Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 1,
          explain: <MathText>{'علاقة شال: كل ممثّل يبدأ من نهاية السابق، والممثّل الأول من P. الممثّلات من P وحدها لا تجمع، والأشعة في أماكنها لا تمرّ بـ P، والبدء من A ثم من C يترك القطار حيث كانت الأشعة لا حيث وصلت الطائرة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_barahin-ashia_P3'] } },
        { id: 'E6', skill: 'insha', requires: ['surat-daira', 'rabt-shal'], prompt: <Q><MathText>{`${TEST.circle} صورة (C) بالانسحاب الذي شعاعه $\\overrightarrow{UV} + \\overrightarrow{VW}$ هي:`}</MathText></Q>,
          options: opts(O6), optionLabel: label(O6), correct: 0, cols: 1,
          explain: <MathText>{'$\\overrightarrow{UV} + \\overrightarrow{VW} = \\overrightarrow{UW}$ (علاقة شال)، وصورة دائرة بانسحاب دائرة لها نفس نصف القطر ومركزها صورة المركز: $\\overrightarrow{\\Omega\\Omega\'} = \\overrightarrow{UW}$ . الانسحاب لا يغيّر الأطوال، وصورة Ω ليست W.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_barahin-ashia_P3'] } },
      ]}
      badges={[{ id: 'burhan', emoji: '🚇', label: 'أختصر وأبرهن', test: (m) => (m.tabsit ?? 0) + (m.burhan ?? 0) + (m.insha ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أتقنت البرهان بالأشعة', title: 'حل مشكلات وإنجاز براهين بالأشعة', message: 'ترامواي، حديقة، رباعي، ثلاث نقط، طائرة مسيّرة ودائرة: اختصرت كل عبارة بعلاقة شال وبالمعطيات، واستنتجت الخاصية، وأنشأت مجموع عدة أشعة.', verbs: ['أربط', 'أعوّض', 'أستنتج', 'أنشئ'], masterBadgeLabel: 'الدرس 4' }} />
  );
}
