import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TEST } from '../content/textbook';
import ConeFigure from '../components/ConeFigure';
import MinaretFigure from '../components/MinaretFigure';

/**
 * Module 8 — وضعية الاختبار النهائي (stage: evaluation) : la وضعية et le تحدّ TRANSPOSÉS (extraction › situation ›
 * duplicatedIn module 8) — un autre cornet (H = 12, R = 6) et une autre minaret (bâton de 1,5 m à 12 m, ombres
 * finissant ensemble à 14 m), content/textbook.js › TEST ; aucune réponse n'apparaît ailleurs dans la leçon.
 *   E1 (P2)  l'égalité de Thalès dans la coupe : r ÷ 6 = (12 − h) ÷ 12
 *   E2 (P2)  h = r : 12r = 6(12 − r) ⇒ 18r = 72 ⇒ r = 4
 *   E3 (P2)  V = π × 4² × 4 = 64π ≈ 201,06 cm³
 *   E4 (P1)  l'égalité de la minaret : AM ÷ 1,5 = 14 ÷ 2
 *   E5 (P1)  AM = 1,5 × 14 ÷ 2 = 10,5 m
 *   E6 (P3)  r = 9 trouvé par un élève : rejeté, 9 > 6 (le cylindre sortirait du cône)
 * Chaque distracteur est FAUX (MISC-TALIS-QITAA-BADAL-DILA, MISC-TALIS-NISBA-MAQLUBA, MISC-TALIS-QUTR-BADAL-NISF,
 * MISC-TALIS-MULAAMA-WAQI) ; une seule LP primaire par épreuve, les trois couvertes.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={TEST.source} /></span>;
const O1 = ['$\\dfrac{r}{6} = \\dfrac{12 - h}{12}$', '$\\dfrac{r}{6} = \\dfrac{h}{12}$', '$\\dfrac{6}{r} = \\dfrac{12 - h}{12}$', '$r + h = 12$'];
const O2 = ['$r = 4\\,\\mathrm{cm}$', '$r = 3\\,\\mathrm{cm}$', '$r = 6\\,\\mathrm{cm}$', '$r = 8\\,\\mathrm{cm}$'];
const O3 = ['$64\\pi \\approx 201{,}06\\,\\mathrm{cm}^3$', '$256\\pi \\approx 804{,}25\\,\\mathrm{cm}^3$', '$16\\pi \\approx 50{,}27\\,\\mathrm{cm}^3$', '$64\\,\\mathrm{cm}^3$'];
const O4 = ['$\\dfrac{AM}{1{,}5} = \\dfrac{14}{2}$', '$\\dfrac{AM}{1{,}5} = \\dfrac{12}{2}$', '$\\dfrac{AM}{2} = \\dfrac{14}{1{,}5}$', '$\\dfrac{AM}{14} = \\dfrac{2}{1{,}5}$'];
const O5 = ['$10{,}5\\,\\mathrm{m}$', '$7\\,\\mathrm{m}$', '$9\\,\\mathrm{m}$', '$21\\,\\mathrm{m}$'];
const O6 = [
  'النتيجة غير مقبولة: نصف قطر الأسطوانة يجب أن يكون أصغر من 6، وإلا خرقت المخروط',
  'النتيجة مقبولة لأنّ 9 أصغر من 12',
  'النتيجة مقبولة لأنّ r عدد موجب',
  'النتيجة غير مقبولة لأنّ r يجب أن يساوي 6',
];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Itqan() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="وضعية أخرى: الموارد نفسها، أعداد أخرى" estimatedTime="7 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={7 * 60} timerLabel="7 دقائق"
      brief={{
        tag: 'أدمج تعلّماتي — وضعية من المنصّة', title: TEST.title, tone: 'amber',
        body: (
          <div className="space-y-2" data-situation="itqan">
            <p><MathText>{TEST.cone.text}</MathText></p>
            <ConeFigure H="12" R="6" />
            <p><MathText>{TEST.minaret.text}</MathText></p>
            <MinaretFigure stick={TEST.minaret.stick} stickAt={TEST.minaret.stickAt} tip={TEST.minaret.tip}
              label="منارة ارتفاعها مجهول، وعصا شاقولية طولها 1,5 m على بعد 12 m من قاعدتها؛ ظلّاهما ينتهيان معًا على بعد 14 m من قاعدة المنارة" />
          </div>
        ),
      }}
      skills={{
        maqta: { label: 'المقطع المحوري ومعادلة البُعد', module: 7 },
        hajm: { label: 'الحجم وملاءمة النتيجة', module: 7 },
        zill: { label: 'خاصية طالس وطريقة الظل', module: 7 },
      }}
      epreuves={[
        { id: 'E1', skill: 'maqta', requires: ['maqta-mihwari-talis'], prompt: <Q><MathText>{'في نصف المقطع المحوري، O رأس المخروط، والأسطوانة طولها $h$ ونصف قطرها $r$ . خاصية طالس تعطي:'}</MathText></Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 2,
          explain: <MathText>{'المثلث الصغير الذي رأسه O ضلعه على المحور $12 - h$ وضلعه الآخر r ، والمثلث الكبير 12 و 6: $\\dfrac{r}{6} = \\dfrac{12 - h}{12}$ . h ليس الضلع الذي رأسه O، وقلب نسبة واحدة يعطي مساواة خاطئة، و $r + h$ ليس ثابتا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-talis_P2'] } },
        { id: 'E2', skill: 'maqta', requires: ['muadala-bud'], prompt: <Q><MathText>{'في الحالة $h = r$ ، نصف قطر الأسطوانة هو:'}</MathText></Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 2,
          explain: <MathText>{'$\\dfrac{r}{6} = \\dfrac{12 - r}{12}$ أي $12r = 72 - 6r$ ومنه $18r = 72$ و $r = 4$ . تحقّق: $\\dfrac{4}{6} = \\dfrac{8}{12}$ . العدد 6 نصف قطر المخروط، و 8 هو $12 - 4$ ، و 3 لا يحقّق المساواة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-talis_P2'] } },
        { id: 'E3', skill: 'hajm', requires: ['mulaamat-natija'], prompt: <Q><MathText>{'حجم هذه الأسطوانة ( $h = r$ ) هو:'}</MathText></Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 2,
          explain: <MathText>{'$V = \\pi \\times 4^2 \\times 4 = 64\\pi \\approx 201{,}06\\,\\mathrm{cm}^3$ . $256\\pi$ يحسب بالقطر 8، و $16\\pi$ ينسى تربيع r ، و 64 دون π ليس حجم الأسطوانة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-talis_P2'] } },
        { id: 'E4', skill: 'zill', requires: ['tariqat-zill'], prompt: <Q><MathText>{'نسمّي A قاعدة المنارة و M رأسها و O نهاية الظلّين. المساواة التي تعطي ارتفاع المنارة AM :'}</MathText></Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 2,
          explain: <MathText>{'ظلّ العصا $14 - 12 = 2$ ، وظلّ المنارة 14 : $\\dfrac{AM}{1{,}5} = \\dfrac{14}{2}$ . المسافة 12 ليست ظلّ المنارة، والنسبتان تُكتبان بالترتيب نفسه (ارتفاع على ارتفاع، ظلّ على ظلّ).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-talis_P1'] } },
        { id: 'E5', skill: 'zill', requires: ['tariqat-zill', 'rabi-mutanasib'], prompt: <Q>ارتفاع المنارة هو:</Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 4,
          explain: <MathText>{'$AM = 1{,}5 \\times \\dfrac{14}{2} = 10{,}5\\,\\mathrm{m}$ . 7 ينسى طول العصا، و 9 يستعمل 12 بدل 14، و 21 ينسى القسمة على ظلّ العصا.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-talis_P1'] } },
        { id: 'E6', skill: 'hajm', requires: ['mulaamat-natija'], prompt: <Q><MathText>{'وجد تلميذ في هذه الوضعية نصف قطر للأسطوانة $r = 9\\,\\mathrm{cm}$ . ماذا نقول؟'}</MathText></Q>,
          options: opts(O6), optionLabel: label(O6), correct: 0, cols: 1,
          explain: <MathText>{'الأسطوانة داخل المخروط: $r < 6$ دائما، فالعدد 9 مرفوض ونبحث عن الخطأ في الحساب. أن يكون r موجبا أو أصغر من 12 لا يكفي، و $r = 6$ يعني أسطوانة تخرق المخروط لأيّ طول.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-talis_P3'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🕌', label: 'أدمجت تعلّماتي', test: (m) => (m.maqta ?? 0) + (m.hajm ?? 0) + (m.zill ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أنهيت الوحدة 9', title: 'خاصية طالس', message: 'منارة بعصا وظلّين، وأسطوانة داخل مخروط: ما الذي جمع بين الوضعيتين؟ أيّ مثلثين وجدتهما، وأيّ معادلة كتبتها، وكيف تحقّقت من أنّ النتيجة ملائمة؟', verbs: ['أقرأ', 'أقطع', 'أحسب', 'أتحقّق'], masterBadgeLabel: 'الوحدة 9' }} />
  );
}
