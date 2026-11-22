import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { TextbookBox } from '../../../../../../common/textbook';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS, HISTORY } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la plateforme, UNE ou DEUX par leçon de l'unité (الأولوية، الأقواس وخطّ الكسر، وصف السلسلة، توزيع الضرب). Aucune ne donne les nombres des situations.
 * JAMAIS bloquant ; `id` et `requires` littéraux. La boîte « هل تعلم » (l'`opener` du manuel, redit) ferme le module.
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
            <p>الوضعيات تجمع ما تعلّمته في الوحدة: أولوية العمليات، والأقواس وخطّ الكسر، ووصف السلسلة، وتوزيع الضرب. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>
            <TextbookBox kind="remark" title={HISTORY.title} text={HISTORY.text} compact />
          </div>
        ),
      }}
      skills={{
        silsila: { label: 'أولوية العمليات', emoji: '🥇' },
        aqwas: { label: 'الأقواس وخطّ الكسر', emoji: '🧮' },
        wasf: { label: 'وصف السلسلة', emoji: '🏷️' },
        tawzi: { label: 'توزيع الضرب', emoji: '✖️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: ستحلّ ست وضعيات تدريبية خطوة بخطوة.', advice: 'راجع دروس الوحدة الأربعة: السلسلة دون أقواس، والسلسلة بأقواس، ووصف السلسلة، وتوزيع الضرب على الجمع والطرح.', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعيات.', advice: 'انتبه إلى الجمع والطرح من اليسار إلى اليمين وإلى توزيع الضرب على الحدّين معًا.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعيات متحكَّم فيها.', advice: 'حاول حلّ الوضعيات دون مساعدة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['silsila-bidun-aqwas-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['silsila-bidun-aqwas-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['silsila-bi-aqwas-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['wasf-silsila-hisab-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['tawzi-darb-jam-tarh-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['tawzi-darb-jam-tarh-2am'] },
      ]}
    />
  );
}
