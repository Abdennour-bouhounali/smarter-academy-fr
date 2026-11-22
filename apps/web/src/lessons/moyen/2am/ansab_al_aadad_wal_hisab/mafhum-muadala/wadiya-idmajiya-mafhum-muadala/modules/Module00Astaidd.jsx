import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { TextbookBox } from '../../../../../../common/textbook';
import MathText from '../../../../../../common/components/MathText';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS, DID_YOU_KNOW } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la plateforme, DEUX par leçon de l'unité (إنتاج عبارة حرفية وتبسيطها, اختبار مساواة, حلّ معادلة). Aucune ne donne les nombres des situations.
 * JAMAIS bloquant ; `id` et `requires` littéraux. Le cadre « هل تعلم » (l'origine du signe « = », fait de la plateforme) clôt la présentation ; les trois leçons y sont rappelées par des LIENS
 * vivants (`getLessonPath`) — rien n'y est reconstruit.
 */
const RECALL_LESSONS = [
  ['ibara-harfiya-intaj', 'إنتاج عبارة حرفية واستعمالها'],
  ['ikhtibar-musawat-mutabayina', 'اختبار صحة مساواة أو متباينة'],
  ['hall-mushkil-muadala', 'حلّ مشكل باستعمال معادلة'],
];

export default function Module00Astaidd() {
  const link = (code, text) => { const to = getLessonPath(code); return to ? <Link key={code} to={to} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>{text}</Link> : null; };
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
            <p>الوضعيات تجمع ما تعلّمته في الوحدة: كتابة عبارة بحرف وحساب قيمتها وتبسيطها، واختبار مساواة أو متباينة بقيم معطاة، وحلّ معادلة. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>
            <nav aria-label="دروس الوحدة" className="flex flex-wrap gap-x-4 gap-y-1">{RECALL_LESSONS.map(([code, text]) => link(code, text))}</nav>
            <TextbookBox kind="remark" title="هل تعلم؟" compact><MathText>{DID_YOU_KNOW.text}</MathText></TextbookBox>
          </div>
        ),
      }}
      skills={{
        ibara: { label: 'إنتاج عبارة وتبسيطها', emoji: '🔤' },
        qima: { label: 'قيمة عبارة حرفية', emoji: '🧮' },
        ikhtibar: { label: 'اختبار مساواة', emoji: '⚖️' },
        hall: { label: 'حلّ معادلة', emoji: '🧩' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: ستحلّ ست وضعيات تدريبية خطوة بخطوة.', advice: 'راجع دروس الوحدة الثلاثة: إنتاج عبارة حرفية، واختبار صحة مساواة أو متباينة، وحلّ مشكل باستعمال معادلة.', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعيات.', advice: 'انتبه إلى العنصر المشترك في صفّ الخلايا وإلى الأسّ وإلى العملية العكسية في المعادلة.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعيات متحكَّم فيها.', advice: 'حاول حلّ الوضعيات دون مساعدة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['ibara-harfiya-intaj-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['ibara-harfiya-intaj-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['ibara-harfiya-intaj-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['ikhtibar-musawat-mutabayina-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['hall-mushkil-muadala-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['hall-mushkil-muadala-2am'] },
      ]}
    />
  );
}
