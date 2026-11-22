import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Les items « أستعدّ » du manuel (1–7) vont aux leçons 1 et 2 (extraction › destinations › prep) :
 * six affirmations de la plateforme, dans la forme « أصحيح أم خاطئ؟ برّر إجابتك », une par acquis déclaré
 * (`priorKnowledge`) — Chasles (le sens du résultat), la règle du parallélogramme, l'égalité de deux vecteurs et
 * l'ORDRE des sommets, le milieu, deux vecteurs opposés, un quadrilatère connu. Aucun point de l'activité qui suit
 * (le métro A, B, C, D ; l'ex-18 O, H, K, L). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
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
        tag: 'أستعدّ', title: 'ست عبارات قبل أن نركب المترو', tone: 'teal',
        body: <p>عبارات من المنصّة عن علاقة شال وقاعدة متوازي الأضلاع وتساوي شعاعين والمنتصف. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        shal: { label: 'علاقة شال', emoji: '🔗' },
        qaida: { label: 'قاعدة متوازي الأضلاع', emoji: '▱' },
        tasawi: { label: 'تساوي شعاعين وترتيب الرؤوس', emoji: '🟰' },
        muntasaf: { label: 'منتصف قطعة بالأشعة', emoji: '📍' },
        mutaakisan: { label: 'شعاعان متعاكسان', emoji: '↔️' },
        rubaiyat: { label: 'خواص الرباعيات الشهيرة', emoji: '🔷' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بمختبر تحرّك فيه الأشعة بيدك.', advice: 'راجع علاقة شال وقاعدة متوازي الأضلاع (الدرس 3)، ومعنى تساوي شعاعين (الدرس 1).', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الاتجاه: الشعاع من A إلى B يعاكس الشعاع من B إلى A، وانتبه إلى ترتيب رؤوس متوازي الأضلاع.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'علاقة شال وتساوي الأشعة متحكَّم فيهما.', advice: 'في المستوى المتقدّم لا يقبل المختبر إلا ما تثبته المعطيات: الشكل وحده لا يكفي.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['shal'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['qaidat-mutawazi'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['tasawi-shuaayn'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['muntasaf-shuaa'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['mutaakisan'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['khawass-rubaiyat'] },
      ]}
    />
  );
}
