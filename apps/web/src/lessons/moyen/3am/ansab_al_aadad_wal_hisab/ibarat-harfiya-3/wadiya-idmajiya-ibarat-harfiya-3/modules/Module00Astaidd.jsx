import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la plateforme, UNE ou DEUX par leçon de l'unité (تبسيط وحذف الأقواس, النشر, حساب القيمة — avec la logique « une valeur réfute, elle ne prouve pas » —,
 * مقارنة بإشارة الفرق). Aucune ne donne les nombres des situations. JAMAIS bloquant ; `id` et `requires` littéraux.
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="6 دقائق"
      brief={{
        tag: 'أستعدّ — قبل الوضعيات', title: 'ست عبارات قبل الوضعيات', tone: 'teal',
        body: (
          <div className="space-y-3">
            <p>الوضعيات تجمع ما تعلّمته في الوحدة: التبسيط والنشر، وحساب قيمة عبارة حرفية، والمقارنة بإشارة الفرق. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>
          </div>
        ),
      }}
      skills={{
        tabsit: { label: 'التبسيط وحذف الأقواس', emoji: '🧹' },
        nashr: { label: 'نشر جداء', emoji: '✖️' },
        qimat: { label: 'حساب قيمة عبارة', emoji: '🎯' },
        muqaranat: { label: 'المقارنة بإشارة الفرق', emoji: '⚖️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: ستحلّ ست وضعيات تدريبية خطوة بخطوة.', advice: 'راجع دروس الوحدة: التبسيط وحذف الأقواس، والنشر، وحساب قيمة عبارة حرفية، ومقارنة عددين ناطقين.', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعيات.', advice: 'انتبه إلى إشارات الأقواس وإلى العدد السالب عند التعويض.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعيات متحكَّم فيها.', advice: 'حاول حلّ الوضعيات دون مساعدة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['tabsit-hadhf-aqwas-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['nashr-jabri-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['qimat-ibara-harfiya-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['qimat-ibara-harfiya-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['muqaranat-natiqayn-3am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['muqaranat-natiqayn-3am'] },
      ]}
    />
  );
}
