import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ. Le manuel n'a pas d'item « أستعدّ » pour cette leçon : six affirmations de la
 * plateforme, dans la forme du livre (« أصحيح أم خاطئ؟ برّر إجابتك ») : lire les coordonnées d'un point
 * (1, 2), calculer une image par x ⟼ ax (3), les règles des signes (4, 6), déterminer a depuis un
 * couple (5, leçon 2). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux (audit).
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
        tag: 'أستعدّ — عبارات من المنصّة', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>ست عبارات عن إحداثيات نقطة في معلم، وصورة عدد بدالة خطية، وقواعد الإشارات، ومعامل دالة خطية. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>,
      }}
      skills={{
        talim: { label: 'تعليم نقطة وقراءة إحداثياتها', emoji: '📍' },
        sura: { label: 'حساب صورة عدد بدالة خطية', emoji: '🧮' },
        ishara: { label: 'قواعد الإشارات في الضرب والقسمة', emoji: '±' },
        muamil: { label: 'تعيين معامل دالة خطية من عدد وصورته', emoji: '🔑' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: في الدرس معلم تضع عليه النقط بيدك ويكتب لك كل حساب.', advice: 'راجع تعليم النقط في معلم (الفاصلة أولًا ثم الترتيب)، وحساب صورة عدد بضربه في المعامل مع الانتباه إلى الإشارة.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى ترتيب الإحداثيين (الفاصلة أولًا ثم الترتيب)، وإلى إشارة المعامل عند حساب صورة عدد سالب.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الإحداثيات والصور والإشارات متحكَّم فيها.', advice: 'في المستوى المتقدّم من النشاط أدر المستقيم بنفسك واكتشف أثر إشارة المعامل.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1', requires: ['talim-nuqta'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-2', requires: ['talim-nuqta'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-3', requires: ['notation-fx'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-4', requires: ['qawaid-ishara'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-5', requires: ['tayin-muamil'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-6', requires: ['qawaid-ishara'] },
      ]}
    />
  );
}
