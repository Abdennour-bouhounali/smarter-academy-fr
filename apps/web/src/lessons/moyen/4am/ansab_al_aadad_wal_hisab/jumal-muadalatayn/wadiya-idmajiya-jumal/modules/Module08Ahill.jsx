import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION } from '../content/textbook';

/**
 * Module 8 — أحلّ الوضعية (stage: evaluation) : la résolution du حفل البلدية
 * (extraction › situation › duplicatedIn module 8) en cinq épreuves qui suivent
 * l'« تنفيذ استراتيجية الحل » du manuel — les inconnues (P2), la جملة (P2), sa
 * simplification par 150 et la méthode (P2), la ثنائية (25 ; 50) (P1), puis la
 * vérification dans le texte et la réponse (P1). Chaque distracteur est FAUX
 * (MISC-JUMLA-MAJAHIL, MISC-JUMLA-TARJAMA, MISC-JAM-TARAF-WAHID, MISC-JUMLA-TARTIB,
 * MISC-JUMLA-MUADALA-WAHIDA, MISC-JUMLA-NISF-HALL) ; une seule LP primaire par
 * épreuve, les deux couvertes.
 */
const Q = ({ children }) => <span>{children} <SourceTag source={SITUATION.source} /></span>;
const sys = (a, b) => `$\\begin{cases} ${a} \\\\ ${b} \\end{cases}$`;
const O1 = [
  '$x$ سعر علبة عصير و $y$ سعر قطعة حلوى (بالدينار)',
  '$x$ عدد علب العصير و $y$ عدد قطع الحلوى',
  '$x$ عدد العلب التي بقيت و $y$ عدد القطع التي بقيت',
  '$x$ المبلغ المدفوع و $y$ ثمن ما بقي (بالدينار)',
];
const O2 = [
  sys('150x + 150y = 11250', '24x + 30y = 2100'),
  sys('150x + 150y = 11250', '30x + 24y = 2100'),
  sys('x + y = 11250', '24x + 30y = 2100'),
  sys('150x + 150y = 2100', '24x + 30y = 11250'),
];
const O3 = [
  sys('x + y = 75', '24x + 30y = 2100'),
  sys('x + y = 11250', '24x + 30y = 2100'),
  sys('x + y = 75', '4x + 5y = 2100'),
  sys('x + y = 75', '24x + 30y = 14'),
];
const O4 = ['$(25 ; 50)$', '$(50 ; 25)$', '$(35 ; 40)$', '$(37{,}5 ; 37{,}5)$'];
const O5 = [
  'سعر علبة العصير 25 دج وسعر قطعة الحلوى 50 دج، لأنّ $150 \\times 25 + 150 \\times 50 = 11250$ و $24 \\times 25 + 30 \\times 50 = 2100$',
  'سعر علبة العصير 25 دج؛ أمّا سعر قطعة الحلوى فلا يمكن حسابه',
  'سعر علبة العصير 50 دج وسعر قطعة الحلوى 25 دج',
  'ثمن علبة وقطعة معا 75 دج، ولا يمكن معرفة كل سعر وحده',
];
const label = (list) => (i) => <MathText>{list[i]}</MathText>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Ahill() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="أحلّ الوضعية" moduleSubtitle="خمس مراحل نحو سعر العلبة وسعر القطعة" estimatedTime="6 دقائق" lessonConfig={LESSON_CONFIG} timerSeconds={6 * 60} timerLabel="6 دقائق"
      brief={{ tag: 'أدمج تعلّماتي', title: 'ما هو سعر علبة عصير وسعر قطعة حلوى في حفل البلدية؟', tone: 'amber', body: <p>{SITUATION.text}</p> }}
      skills={{
        tarjama: { label: 'اختيار المجهولين وكتابة الجملة', module: 7 },
        tariqa: { label: 'اختيار طريقة الحل وحل الجملة', module: 7 },
        tahaqquq: { label: 'التحقق وتحرير الجواب', module: 7 },
      }}
      epreuves={[
        { id: 'E1', skill: 'tarjama', requires: ['tahdid-majahil'], prompt: <Q>المرحلة 1 — نختار المجهولين المناسبين:</Q>,
          options: opts(O1), optionLabel: label(O1), correct: 0, cols: 1,
          explain: <MathText>{'السؤال يطلب السعرين: $x$ سعر علبة عصير و $y$ سعر قطعة حلوى. الأعداد (150 و 24 و 30) والمبلغان معطيات معلومة.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-jumal_P2'] } },
        { id: 'E2', skill: 'tarjama', requires: ['tarjamat-maalumat'], prompt: <Q>المرحلة 2 — جملة المعادلتين التي تترجم المعطيات هي:</Q>,
          options: opts(O2), optionLabel: label(O2), correct: 0, cols: 2,
          explain: <MathText>{'150 علبة و 150 قطعة بـ 11250 دج: $150x + 150y = 11250$ ؛ وما بقي، 24 علبة و 30 قطعة، بـ 2100 دج: $24x + 30y = 2100$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-jumal_P2'] } },
        { id: 'E3', skill: 'tariqa', requires: ['ikhtiyar-tariqa'], prompt: <Q>المرحلة 3 — نقسم طرفي المعادلة الأولى على 150 لنبسّطها. تصبح الجملة:</Q>,
          options: opts(O3), optionLabel: label(O3), correct: 0, cols: 2,
          explain: <MathText>{'$150x \\div 150 = x$ و $150y \\div 150 = y$ و $11250 \\div 150 = 75$ : $x + y = 75$ : نقسم طرفي المعادلة الأولى معا، والمعادلة الثانية تبقى كما هي.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-jumal_P2'] } },
        { id: 'E4', skill: 'tariqa', requires: ['ikhtiyar-tariqa', 'tawid'], prompt: <Q><MathText>{'حل الجملة هو الثنائية $(x ; y)$ :'}</MathText></Q>,
          options: opts(O4), optionLabel: label(O4), correct: 0, cols: 2,
          explain: <MathText>{'$y = 75 - x$ ، نعوّض: $24x + 30(75 - x) = 2100$ أي $2250 - 6x = 2100$ ، $x = 25$ ثم $y = 50$. الثنائية $(35 ; 40)$ تحقق $x + y = 75$ فقط ($24 \\times 35 + 30 \\times 40 = 2040$).'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-jumal_P1'] } },
        { id: 'E5', skill: 'tahaqquq', requires: ['tahaqquq-tafsir'], prompt: <Q>التحقق وتحرير الإجابة — ما هو سعر علبة عصير وسعر قطعة حلوى؟</Q>,
          options: opts(O5), optionLabel: label(O5), correct: 0, cols: 1,
          explain: <MathText>{'نتحقق في النص: $150 \\times 25 + 150 \\times 50 = 3750 + 7500 = 11250$ و $24 \\times 25 + 30 \\times 50 = 600 + 1500 = 2100$. والترتيب مهم: $(50 ; 25)$ يعطي $24 \\times 50 + 30 \\times 25 = 1950$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_wadiya-idmajiya-jumal_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🎉', label: 'أدمجت تعلّماتي', test: (m) => (m.tarjama ?? 0) + (m.tariqa ?? 0) + (m.tahaqquq ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{ masterTitle: 'أنهيت الوحدة 5', title: 'جمل معادلتين من الدرجة الأولى بمجهولين', message: 'سعر علبة العصير 25 دج وسعر قطعة الحلوى 50 دج. اخترت المجهولين، ترجمت المعلومتين بجملة معادلتين، بسّطت واخترت طريقة الحل، ثم تحققت في النص — ما تعلّمته في دروس الوحدة الثلاثة.', verbs: ['أترجم', 'أبسّط', 'أحلّ', 'أتحقق'], masterBadgeLabel: 'الوحدة 5' }} />
  );
}
