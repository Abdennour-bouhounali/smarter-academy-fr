import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP3_TABLE } from '../content/textbook';
import MathText from '../../../../../../common/components/MathText';
import { HistogramFigure } from '../components/Figures';

/**
 * Module 0 — أستعدّ. L'item 3 du manuel (p. 91 : l'histogramme dont le troisième rectangle monte à 10 quand le
 * tableau dit 7 — FAUX par construction), puis cinq affirmations de la plateforme dans la même forme pour les
 * acquis de la leçon 2 (المدى، المتوسط، الوسيط، الفئة الوسيطية) et des années précédentes (l'angle d'un
 * secteur). Aucune n'utilise les nombres du تمرين 7. Diagnostic JAMAIS bloquant ; `id` et `requires` restent
 * littéraux (audit).
 */
const prep3Figure = (
  <span className="block space-y-1" data-prep3-figure>
    <span className="block text-xs font-bold text-slate-600">الجدول — الفئة: تكرارها</span>
    <span className="flex flex-wrap gap-1">
      {PREP3_TABLE.classes.map((c, i) => (
        <span key={c} className="inline-block whitespace-nowrap rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-sm">
          <MathText>{`${c} : ${PREP3_TABLE.freqs[i]}`}</MathText>
        </span>
      ))}
    </span>
    <HistogramFigure bounds={[5, 10, 15, 20]} heights={PREP3_TABLE.drawn} yMax={10} label="المدرّج التكراري المقابل: ثلاثة مستطيلات متلاصقة على الفئات من 5 إلى 20" />
  </span>
);
const withFigure = (item) => <span className="block space-y-2">{prepQuestion(item).prompt}{prep3Figure}</span>;

export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="5 دقائق"
      brief={{
        tag: 'أستعدّ — الكتاب ص 91', title: 'ستّ عبارات قبل فتح المجدول', tone: 'teal',
        body: <p>عبارة من الكتاب عن مدرّج تكراري، وخمس من المنصّة عن المدى والمتوسط والوسيط والفئة الوسيطية وزاوية قطاع دائري. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        qiraa: { label: 'قراءة تمثيل بياني ومطابقته بجدول', emoji: '📊' },
        mada: { label: 'مدى سلسلة', emoji: '↔️' },
        mutawassit: { label: 'متوسط سلسلة', emoji: '⚖️' },
        wasit: { label: 'وسيط سلسلة', emoji: '🎯' },
        fia: { label: 'الفئة الوسيطية', emoji: '🧱' },
        qita: { label: 'زاوية قطاع في مخطط دائري', emoji: '🥧' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: في الدرس تحسب باليد ثم يتأكّد المجدول من حسابك.', advice: 'راجع درس «مدى ووسيط ومتوسط سلسلة إحصائية»: رتّب القيم قبل الوسيط، والمدى فرق.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الرتبة في الوسيط، وإلى أنّ الدائرة كلها 360 درجة.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'المؤشّرات الثلاثة وقراءة التمثيلات متحكَّم فيها.', advice: 'في المستوى المتقدّم احجز السلسلة بنفسك واكتب الدساتير الأربعة دون نموذج.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['qiraat-tamthil'], prompt: withFigure(PREP_ITEMS[0]) },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['mada-silsila'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['mutawassit-silsila'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['wasit-silsila'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['fia-wasitiya'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['zawiya-qita'] },
      ]}
    />
  );
}
