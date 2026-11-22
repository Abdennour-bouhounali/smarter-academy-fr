import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import ArcTape from '../../../../../../common/components/ArcTape';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { src } from '../../_unit/unitMeta';

/**
 * Module 8 — إختبار أولي (stage: evaluation) : LA SEULE SOURCE DE PREUVE de la leçon. Cinq épreuves tirées du manuel :
 * « أقوّم تعلّماتي » 6, 7, 8 (p. 31 — ses items d'auto-évaluation, jamais posés ailleurs dans la leçon), l'exercice 1 ج
 * (p. 30) et la définition de معارف 1 (p. 26) sur les nombres de l'exercice 16 ب. Une الكفاءة principale par épreuve.
 */
const Q = ({ children, source }) => <span>{children} <SourceTag source={source} /></span>;
const M = (s) => <MathText key={s}>{s}</MathText>;
const SELF6 = {
  kind: 'tape', inline: true, maxWidth: 300,
  parts: [{ label: '□', unknown: true }, { label: '12,4', value: '12,4' }], whole: { label: '17,8', value: '17,8' },
  ariaLabel: 'مخطط بأقواس: المجهول و 12,4 فوق الخطّ، و 17,8 تحته',
};

export default function Module08Itqan() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="إختبار أولي"
      moduleSubtitle="خمسة أسئلة تُقيّم ما تعلّمته"
      estimatedTime="6 دقائق"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={6 * 60}
      timerLabel="6 دقائق"
      brief={{ tag: 'التقويم', title: 'أظهر ما تعرفه', tone: 'slate', body: <p>أجب عن الأسئلة الخمسة ثم أرسِلها دفعة واحدة. لا يُصحَّح شيء قبل الإرسال.</p> }}
      skills={{
        amaliya: { label: 'اختيار العملية المناسبة', module: 1 },
        mufradat: { label: 'المجموع والفرق وحدودهما', module: 2 },
        tamthil: { label: 'التمثيل بمخطط بأقواس', module: 3 },
      }}
      epreuves={[
        {
          id: 'E1', skill: 'amaliya', requires: ['ikhtiyar-amaliya'],
          prompt: <Q source={src('self-7', 31, 'أقوّم تعلّماتي', 7)}>مجموع عددين عشريين هو 43,7 ، أحد العددين هو 38,45. العدد الآخر هو:</Q>,
          options: [M('$5{,}25$'), M('$82{,}15$'), M('$5{,}35$')],
          correct: 0, cols: 3,
          explain: <MathText>{'المجموع 43,7 هو الكلّ و 38,45 جزء منه: العدد الآخر $43{,}70 - 38{,}45 = 5{,}25$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_mana-jam-tarh_P1'] },
        },
        {
          id: 'E2', skill: 'mufradat', requires: ['majmu-hadda'],
          prompt: <Q source={src('ex-1', 30, 'أتمرّن', 1)}>الأعداد 5,34 ، 6 و 91,7 هي ... <MathText>{'$5{,}34 + 6 + 91{,}7$'}</MathText></Q>,
          options: ['حدود المجموع', 'مجموع الأعداد', 'حدود الفرق'],
          correct: 0, cols: 3,
          explain: <span>الأعداد التي نجمعها تُسمّى حدود المجموع؛ والنتيجة وحدها هي المجموع.</span>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_mana-jam-tarh_P2'] },
        },
        {
          id: 'E3', skill: 'tamthil', requires: ['tamthil-aqwas'],
          prompt: <Q source={src('self-6', 31, 'أقوّم تعلّماتي', 6)}>اعتمادا على الشكل المقابل، اختر الإجابة الصحيحة: <ArcTape {...SELF6} /></Q>,
          options: [M('$\\square = 17{,}8 + 12{,}4$'), M('$\\square = 12{,}4 - 17{,}8$'), M('$\\square = 17{,}8 - 12{,}4$')],
          correct: 2, cols: 1,
          explain: <MathText>{'17,8 تحت الخطّ: هو الكلّ، و □ جزء منه: $\\square = 17{,}8 - 12{,}4 = 5{,}4$.'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_mana-jam-tarh_P3'] },
        },
        {
          id: 'E4', skill: 'amaliya', requires: ['ikhtiyar-amaliya'],
          prompt: <Q source={src('self-8', 31, 'أقوّم تعلّماتي', 8)}>تبلغ قامة محمّد <MathText>{'$1{,}68\\,\\mathrm{m}$'}</MathText> ، بذلك تزيد قامته عن قامة صديقه بـ <MathText>{'$2\\,\\mathrm{cm}$'}</MathText>. قامة صديق محمد هي:</Q>,
          options: [M('$1{,}66\\,\\mathrm{m}$'), M('$1{,}70\\,\\mathrm{m}$'), M('$1{,}48\\,\\mathrm{m}$')],
          correct: 0, cols: 3,
          explain: <MathText>{'قامة محمد هي الأطول (الكلّ): نطرح $2\\,\\mathrm{cm} = 0{,}02\\,\\mathrm{m}$ ، $1{,}68 - 0{,}02 = 1{,}66$ ، رغم كلمة «تزيد».'}</MathText>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_mana-jam-tarh_P1'] },
        },
        {
          id: 'E5', skill: 'mufradat', requires: ['farq-hadda'],
          prompt: <Q source={src('know-1d', 26, 'أوظّف تعلّماتي', 1)}>في المساواة <MathText>{'$7{,}91 - 5{,}35 = 2{,}56$'}</MathText> ، العدد 2,56 هو:</Q>,
          options: ['فرق العددين 7,91 و 5,35', 'مجموع العددين 7,91 و 5,35', 'حدّ من حدّي المجموع'],
          correct: 0, cols: 1,
          explain: <span>نتيجة طرح عددين تُسمّى فرق هذين العددين.</span>,
          assessment: { enabled: true, type: 'assessment', learningPointIds: ['1am_mana-jam-tarh_P2'] },
        },
      ]}
      badges={[
        { id: 'amaliya', emoji: '🧭', label: 'أعرف أيّ حساب أقوم به', test: (m) => (m.amaliya ?? 0) === 0 },
        { id: 'tamthil', emoji: '📏', label: 'أمثّل قبل أن أحسب', test: (m) => (m.tamthil ?? 0) === 0 },
      ]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أتقنت معنى الجمع والطرح',
        title: 'انتهى درس معنى الجمع والطرح',
        message: 'تعرف الآن أيّ حساب تقوم به: المجهول هو الكلّ فتجمع، أو جزء فتطرح. الدرس التالي يعلّمك إنجاز العمليتين أفقيا وعموديا.',
        verbs: ['أختار', 'أسمّي', 'أمثّل', 'أحسب'],
        masterBadgeLabel: 'معنى الجمع والطرح',
      }}
    />
  );
}
