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
 *   E1 (P1)  KLM (Bab Ezzouar) : KL² = LM² = 20, KM² = 40 → rectangle et isocèle en L
 *   E2 (P1)  « EFG قائم في F » se prouve par FE² + FG² = EG² (le côté seul)
 *   E3 (P2)  la ساحة de Wahran : AB = DC, AC = BD = 5, AB² = 20 ≠ BC² = 5 → rectangle, pas carré
 *   E4 (P2)  PQRS : PQ = SR et PR = QS → rectangle (et rien de plus)
 *   E5 (P3)  le rond central de Constantine Ω(2 ; −1), r = 5 : T(5 ; 3) dessus ; distracteurs : le diamètre, la somme des écarts
 *   E6 (P3)  le cercle de diamètre [PQ] : I(1 ; −1), IR² = IP² = 20 → R dessus
 * Chaque distracteur est FAUX et porte une erreur nommée (MISC-MAALAM-FITHAGHURAS-WATAR, -MUTAWAZI-KAFI, -DAIRA-QUTR,
 * -MASAFA-JADHR-JAM) ; une seule LP primaire par épreuve, les trois couvertes deux fois.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={TEST.source} /></span>;
const O1 = ['قائم في L ومتساوي الساقين', 'قائم في K', 'متقايس الأضلاع', 'قائم في M'];
const O2 = ['$FE^2 + FG^2 = EG^2$', '$EF^2 + EG^2 = FG^2$', '$FE = FG$', '$EG^2 + FG^2 = EF^2$'];
const O3 = ['مستطيل وليس مربّعا', 'مربّع', 'معيّن وليس مربّعا', 'ليس متوازي أضلاع'];
const O4 = ['PQRS مستطيل', 'PQRS مربّع', 'PQRS معيّن', 'PQRS متوازي أضلاع لا يمكن أن يكون مستطيلا'];
const O5 = ['$T(5\\,;\\,3)$', '$U(6\\,;\\,3)$', '$W(2\\,;\\,9)$', '$Z(5\\,;\\,1)$'];
const O6 = [
  'تنتمي إلى $(\\mathcal{C})$ لأن $IR^2 = IP^2 = 20$',
  'لا تنتمي إلى $(\\mathcal{C})$ لأن $IR^2 = 20$ و $PQ^2 = 80$',
  'لا تنتمي إلى $(\\mathcal{C})$ لأن $IR^2 \\neq IP^2$',
  'لا نستطيع الحكم دون رسم الدائرة',
];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Itqan() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="إختبار أولي" moduleSubtitle="وضعيات جديدة: نفس الأدلة، نقط أخرى" estimatedTime="7 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={7 * 60} timerLabel="7 دقائق"
      brief={{
        tag: 'إختبار أولي — وضعيات من المنصّة', title: TEST.title, tone: 'slate',
        body: (
          <div className="space-y-1" data-situation="itqan">
            <p>احسب على مسودّتك مربعات المسافات أو المركبات أو المنتصفات، ثم اختر الدليل الكافي: الفار لا يقبل ما تراه العين.</p>
          </div>
        ),
      }}
      skills={{
        muthallath: { label: 'طبيعة مثلث', module: 2 },
        rubai: { label: 'طبيعة رباعي', module: 2 },
        daira: { label: 'الانتماء إلى دائرة', module: 2 },
      }}
      epreuves={[
        { id: 'E1', skill: 'muthallath', requires: ['tabiat-muthallath', 'masafa-maalam'], prompt: <Q><MathText>{`${TEST.triangle} المثلث KLM:`}</MathText></Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 2,
          explain: <MathText>{'$KL^2 = 4^2 + 2^2 = 20$ ، $LM^2 = (-2)^2 + 4^2 = 20$ ، $KM^2 = 2^2 + 6^2 = 40 = 20 + 20$ : الضلع [KM] وحده، فالزاوية القائمة في L المقابلة له، و $KL = LM$ . ليس قائما في K أو M (مثلا $20 + 40 \\neq 20$ )، والمربعات ليست متساوية كلها.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_ithbat-khawas-maalam_P1'] } },
        { id: 'E2', skill: 'muthallath', requires: ['qaim-fithaghuras', 'taamud'], prompt: <Q><MathText>{`${TEST.right} لإثبات أنه قائم في F ، أي $(FE) \\perp (FG)$ ، نتحقق أن:`}</MathText></Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 2,
          explain: <MathText>{'الزاوية القائمة في F تقابل الضلع [EG] ، فهو الذي يكون وحده: $FE^2 + FG^2 = EG^2$ . المساواتان الأخريان تثبتان زاوية قائمة في E أو في G ، و $FE = FG$ يجعله متساوي الساقين فقط.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_ithbat-khawas-maalam_P1'] } },
        { id: 'E3', skill: 'rubai', requires: ['tabiat-rubai', 'murakkibat-shuaa', 'masafa-maalam'], prompt: <Q><MathText>{`${TEST.quad} الرباعي ABCD:`}</MathText></Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 2,
          explain: <MathText>{'$\\overrightarrow{AB}\\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix} = \\overrightarrow{DC}\\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$ : متوازي أضلاع؛ $AC^2 = 25 = BD^2$ : مستطيل؛ $AB^2 = 20 \\neq BC^2 = 5$ : ليس معيّنا، فليس مربّعا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_ithbat-khawas-maalam_P2'] } },
        { id: 'E4', skill: 'rubai', requires: ['adilla-kafiya', 'tabiat-rubai'], prompt: <Q><MathText>{`${TEST.suffice} نستطيع أن نستنتج أن:`}</MathText></Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 1,
          explain: <MathText>{'$\\overrightarrow{PQ} = \\overrightarrow{SR}$ : PQRS متوازي أضلاع؛ وقطراه متقايسان: مستطيل. لا دليل على ضلعين متتاليين متقايسين، فلا نستطيع قول «مربّع» ولا «معيّن»؛ والقول إنه لا يمكن أن يكون مستطيلا يناقض الدليلين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_ithbat-khawas-maalam_P2'] } },
        { id: 'E5', skill: 'daira', requires: ['intima-daira', 'masafa-maalam'], prompt: <Q><MathText>{`${TEST.centre} أيّ شاخص يقع على هذه الدائرة؟`}</MathText></Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 2,
          explain: <MathText>{'$\\Omega T^2 = 3^2 + 4^2 = 25 = 5^2$ . أما $\\Omega U^2 = 16 + 16 = 32$ ، و $\\Omega W = 10$ هو القطر لا نصف القطر، و $\\Omega Z^2 = 9 + 4 = 13$ (مجموع الفرقين $3 + 2 = 5$ ليس المسافة).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_ithbat-khawas-maalam_P3'] } },
        { id: 'E6', skill: 'daira', requires: ['intima-daira', 'muntasaf-maalam'], prompt: <Q><MathText>{`${TEST.diameter} النقطة R :`}</MathText></Q>,
          options: opts(O6), optionLabel: label(O6), correct: 0, cols: 1,
          explain: <MathText>{'مركز $(\\mathcal{C})$ هو منتصف [PQ]: $I(1\\,;\\,-1)$ ، ونصف قطرها $IP$ : $IP^2 = 16 + 4 = 20$ و $IR^2 = 2^2 + 4^2 = 20$ : R على الدائرة. $PQ^2 = 80$ هو مربع القطر لا نصف القطر، والحساب يكفي للحكم.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_ithbat-khawas-maalam_P3'] } },
      ]}
      badges={[{ id: 'fhar', emoji: '📺', label: 'حَكَم الحساب', test: (m) => (m.muthallath ?? 0) + (m.rubai ?? 0) + (m.daira ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أتقنت الإثبات بالحساب في معلم', title: 'إثبات الخواص الهندسية بالحساب', message: 'مثلث في باب الزوار، ساحة في وهران، رباعي، دائرة وسط ملعب في قسنطينة: أثبتّ كل طبيعة بمساواة محسوبة وبأدلة كافية، لا بالنظر.', verbs: ['أحسب', 'أقارن', 'أختار الدليل', 'أستنتج'], masterBadgeLabel: 'الدرس 4' }} />
  );
}
