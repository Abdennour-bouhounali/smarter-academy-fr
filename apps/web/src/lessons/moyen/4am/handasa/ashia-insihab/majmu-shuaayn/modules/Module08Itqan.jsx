import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TEST, QCM_SOURCE } from '../content/textbook';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : les QCM 4, 5, 7 du manuel (p. 136, DOUBLON DÉCLARÉ — extraction ›
 * destinations › qcm › duplicatedIn « items 4, 5, 7 ») et deux questions de la plateforme (content/textbook.js › TEST),
 * des lettres qui n'apparaissent nulle part ailleurs dans la leçon.
 *   E1 (P1)  le héros d'un jeu : EF puis FG → la translation de vecteur EG
 *   E2 (P2)  QCM 7 : MN + NP = MP
 *   E3 (P3)  QCM 4 : AB + AC = AE (ABEC parallélogramme)
 *   E4 (P3)  QCM 5 : ABC rectangle en A, AB = 4, AC = 3 → la longueur de AB + AC est 5
 *   E5 (P4)  TR et RT : opposés, somme nulle
 * Chaque distracteur est FAUX et porte une erreur nommée (MISC-SHUAA-SHAL-AKS, -SHAL-RABT, -QAIDA-QUTR, -JAM-ATWAL,
 * -SIFR-ADAD, -ITTIJAH-MUAKKAS) ; une seule LP primaire par épreuve, les quatre couvertes.
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const O1 = ['$\\overrightarrow{EG}$', '$\\overrightarrow{GE}$', '$\\overrightarrow{FG}$', '$\\overrightarrow{EF}$'];
const O2 = ['$\\vec{0}$', '$\\overrightarrow{MP}$', '$\\overrightarrow{PM}$'];
const O3 = ['الشعاع $\\overrightarrow{CB}$', 'الشعاع $\\overrightarrow{BC}$', 'الشعاع $\\overrightarrow{AE}$ حيث ABEC متوازي أضلاع'];
const O4 = ['$7$', '$\\sqrt{7}$', '$5$'];
const O5 = [
  'متعاكسان، ومجموعهما الشعاع المعدوم $\\vec{0}$',
  'متساويان لأن لهما نفس المنحى ونفس الطول',
  'مجموعهما $2\\overrightarrow{TR}$',
];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Itqan() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="إختبار أولي" moduleSubtitle="خمسة أسئلة: ثلاثة من «أؤكّد تعلّماتي» واثنان من المنصّة" estimatedTime="6 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={6 * 60} timerLabel="6 دقائق"
      brief={{
        tag: 'إختبار أولي — الكتاب ص 136 والمنصّة', title: TEST.title, tone: 'slate',
        body: (
          <div className="space-y-1" data-situation="itqan">
            <p>قبل كل اختيار: هل الشعاعان متعاقبان، أم لهما نفس المبدأ؟ ارسم شكلا صغيرا على مسودّتك.</p>
          </div>
        ),
      }}
      skills={{
        tarkib: { label: 'انسحابان متتابعان', module: 1 },
        shal: { label: 'علاقة شال', module: 2 },
        qaida: { label: 'قاعدة متوازي الأضلاع', module: 2 },
        aks: { label: 'الشعاعان المتعاكسان والمعدوم', module: 2 },
      }}
      epreuves={[
        { id: 'E1', skill: 'tarkib', requires: ['tarkib-insihabayn', 'alaqat-shal'], prompt: <Q source={TEST.source}><MathText>{`${TEST.ride} موضعه الأخير هو صورة K بالانسحاب الذي شعاعه:`}</MathText></Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 4,
          explain: <MathText>{'انسحابان متتابعان = انسحاب واحد شعاعه المجموع: $\\overrightarrow{EF} + \\overrightarrow{FG} = \\overrightarrow{EG}$ . $\\overrightarrow{GE}$ يعكس الاتجاه، و $\\overrightarrow{EF}$ أو $\\overrightarrow{FG}$ وحده ينسى أحد الانسحابين.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_majmu-shuaayn_P1'] } },
        { id: 'E2', skill: 'shal', requires: ['alaqat-shal'], prompt: <Q source={QCM_SOURCE(7)}><MathText>{'الشعاع $\\overrightarrow{MN} + \\overrightarrow{NP}$ يساوي الشعاع'}</MathText></Q>,
          options: opts(O2), optionLabel: label(O2), correct: 1, cols: 3,
          explain: <MathText>{'علاقة شال: نهاية الأول N هي مبدأ الثاني، فالمجموع من M إلى P : $\\overrightarrow{MP}$ . $\\overrightarrow{PM}$ هو المعاكس، و $\\vec{0}$ يتطلب العودة إلى M.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_majmu-shuaayn_P2'] } },
        { id: 'E3', skill: 'qaida', requires: ['qaidat-mutawazi'], prompt: <Q source={QCM_SOURCE(4)}><MathText>{'A، B، C ثلاث نقط. ممثل الشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$ هو …'}</MathText></Q>,
          options: opts(O3), optionLabel: label(O3), correct: 2, cols: 1,
          explain: <MathText>{'للشعاعين نفس المبدأ A: قاعدة متوازي الأضلاع، المجموع هو القطر الصادر من A ، $\\overrightarrow{AE}$ حيث ABEC متوازي أضلاع. $\\overrightarrow{BC}$ و $\\overrightarrow{CB}$ على القطر الآخر الذي لا يمرّ بـ A.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_majmu-shuaayn_P3'] } },
        { id: 'E4', skill: 'qaida', requires: ['qaidat-mutawazi', 'fithaghuras'], prompt: <Q source={QCM_SOURCE(5)}><MathText>{'ABC مثلث قائم في A حيث $AB = 4$ و $AC = 3$ . طول الشعاع $\\overrightarrow{AB} + \\overrightarrow{AC}$ هو..'}</MathText></Q>,
          options: opts(O4), optionLabel: label(O4), correct: 2, cols: 3,
          explain: <MathText>{'$\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AD}$ قطر المستطيل ABDC: $AD = BC = \\sqrt{4^2 + 3^2} = 5$ . 7 يجمع الطولين، و $\\sqrt{7}$ يجمع الطولين تحت الجذر.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_majmu-shuaayn_P3'] } },
        { id: 'E5', skill: 'aks', requires: ['mutaakisan', 'shuaa-maadum'], prompt: <Q source={TEST.source}><MathText>{`${TEST.opposite} الشعاعان $\\overrightarrow{TR}$ و $\\overrightarrow{RT}$ :`}</MathText></Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 1,
          explain: <MathText>{'نفس المنحى ونفس الطول واتجاهان متعاكسان: متعاكسان لا متساويان، و $\\overrightarrow{TR} + \\overrightarrow{RT} = \\overrightarrow{TT} = \\vec{0}$ .'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_majmu-shuaayn_P4'] } },
      ]}
      badges={[{ id: 'shal', emoji: '➕', label: 'أجمع الأشعة', test: (m) => (m.tarkib ?? 0) + (m.shal ?? 0) + (m.qaida ?? 0) + (m.aks ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أتقنت جمع شعاعين', title: 'مجموع شعاعين', message: 'لعبة وقفزتان، شال ومتوازي الأضلاع، ومعاكس يعيدك إلى البداية: جمعت شعاعين متعاقبين بعلاقة شال، وشعاعين لهما نفس المبدأ بقاعدة متوازي الأضلاع.', verbs: ['أتابع', 'أجمع', 'أنشئ', 'أعاكس'], masterBadgeLabel: 'الدرس 3' }} />
  );
}
