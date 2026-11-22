import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { TextbookBox } from '../../../../../../common/textbook';
import MathText from '../../../../../../common/components/MathText';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS, DID_YOU_KNOW } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la plateforme, UNE ou deux par leçon de l'unité (قوى العدد 10, قواعد الحساب عليها, الكتابة العلمية ورتبة القدر, قوة عدد نسبي).
 * Aucune ne donne les nombres des situations. JAMAIS bloquant ; `id` et `requires` littéraux. Le cadre « هل تعلم » (les préfixes sont des puissances de 10, réécrit) clôt la présentation.
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
            <p>الوضعيات تجمع ما تعلّمته في الوحدة: قوى العدد 10 وقواعد الحساب عليها، والكتابة العلمية ورتبة القدر، وقوة عدد نسبي. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>
            <TextbookBox kind="remark" title="هل تعلم؟" compact><MathText>{DID_YOU_KNOW.text}</MathText></TextbookBox>
          </div>
        ),
      }}
      skills={{
        ashara: { label: 'قوى العدد 10', emoji: '🔟' },
        qawaid: { label: 'قواعد الحساب على قوى العدد 10', emoji: '⚙️' },
        ilmiya: { label: 'الكتابة العلمية ورتبة القدر', emoji: '🔭' },
        quwa: { label: 'قوة عدد نسبي', emoji: '🚂' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: ستحلّ ست وضعيات تدريبية خطوة بخطوة.', advice: 'راجع الدروس الأربعة: قوى العدد 10، وقواعد الحساب عليها، والكتابة العلمية ورتبة القدر، وقوة عدد نسبي.', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعيات.', advice: 'انتبه إلى إشارة القوة، وإلى جمع الأسّين في الجداء، وإلى شرط الكتابة العلمية.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعيات متحكَّم فيها.', advice: 'حاول حلّ الوضعيات دون مساعدة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['ashara-salib'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['hasil-quwa-ashara'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['kitaba-ilmiya'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['rutbat-qadr'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['ishara-quwa'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['awlawiya-quwa'] },
      ]}
    />
  );
}
