import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le manuel n'a pas d'item « أستعدّ » pour cette leçon : huit affirmations de la plateforme
 * dans la forme du livre (« أصحيح أم خاطئ؟ برّر إجابتك ») : une ثنائية حلّ d'une جملة (1), traduire une
 * situation (2), isoler y (3, 4), l'image par une fonction affine (5), son graphe (6), lire un point (7),
 * résoudre une جملة par le calcul (8). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="5 دقائق"
      brief={{
        tag: 'أستعدّ — عبارات من المنصّة', title: 'ثماني عبارات قبل الانطلاق', tone: 'teal',
        body: <p>ثماني عبارات عن جملة معادلتين وحلّها، وعزل y في معادلة، والدالة التآلفية وتمثيلها البياني. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        thunaiya: { label: 'اختبار ثنائية في جملة', emoji: '✌️' },
        tarjama: { label: 'ترجمة وضعية بمعادلة', emoji: '📝' },
        azl: { label: 'عزل y في معادلة', emoji: '↔️' },
        taalufiya: { label: 'صورة عدد بدالة تآلفية', emoji: '🧮' },
        tamthil: { label: 'التمثيل البياني لدالة تآلفية', emoji: '📈' },
        qiraa: { label: 'إحداثيات نقطة في معلم', emoji: '📍' },
        jabri: { label: 'حل جملة بالحساب', emoji: '⚖️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: في الدرس مستقيمان ترسمهما بيدك، ومصباحان يقولان لك متى تتحقّق كل معادلة.', advice: 'راجع اختبار ثنائية بالتعويض في معادلتي الجملة، ونقل حدّ إلى الطرف الآخر مع تغيير إشارته.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الإشارة حين تعزل y، وإلى الترتيب في الثنائية: الفاصلة أولًا ثم الترتيب.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الجمل والدوال التآلفية وتمثيلها متحكَّم فيها.', advice: 'في المستوى المتقدّم من النشاط اكتب المعادلتين بنفسك، ثم اصنع مستقيمين متوازيين ومستقيمين منطبقين.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['thunaiya-hall'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['tarjama-jumla'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['azl-y'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['azl-y'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['dala-taalufiya'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['tamthil-taalufi'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-7', requires: ['qiraa-ihdathiyat'] },
        { ...prepQuestion(PREP_ITEMS[7]), id: 'prep-8', requires: ['hall-jabri'] },
      ]}
    />
  );
}
