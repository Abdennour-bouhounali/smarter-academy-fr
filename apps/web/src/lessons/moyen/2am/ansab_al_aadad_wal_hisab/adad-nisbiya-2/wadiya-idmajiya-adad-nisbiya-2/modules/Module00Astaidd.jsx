import { Link } from 'react-router-dom';
import { getLessonPath } from '@smarter-academy/core';
import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations de la plateforme, UNE par leçon de l'unité (التعليم على مستقيم مدرّج, المقارنة, المعلم, الجمع, المجموع الجبري, المسافة) ; la réponse « خطأ » tombe
 * sur le repère (une pointe sur l'axe des ordonnées) et sur la distance (deux points de part et d'autre de zéro). Aucune ne donne les nombres des situations. JAMAIS bloquant ; `id` et `requires` littéraux.
 * Les six leçons y sont rappelées par des LIENS vivants (`getLessonPath`) — rien n'y est reconstruit.
 */
const RECALL_LESSONS = [
  ['talim-mustaqim-mudarraj-2', 'التعليم على مستقيم مدرّج'],
  ['muqarana-nisbiya', 'مقارنة الأعداد النسبية'],
  ['talim-nuqta-mustawi', 'تعليم نقطة في المستوي'],
  ['jam-tarh-nisbiya', 'جمع وطرح عددين نسبيين'],
  ['majmu-jabri', 'حساب مجموع جبري'],
  ['masafa-nuqtatayn', 'المسافة بين نقطتين على مستقيم مدرّج'],
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
            <p>الوضعيات تجمع ما تعلّمته في الوحدة: التعليم على مستقيم مدرّج وفي معلم، والمقارنة، والجمع والطرح، والمجموع الجبري، والمسافة. تحقّق منها قبل أن تبدأ؛ النتيجة لا تمنعك من المتابعة.</p>
            <nav aria-label="دروس الوحدة" className="flex flex-wrap gap-x-4 gap-y-1">{RECALL_LESSONS.map(([code, text]) => link(code, text))}</nav>
          </div>
        ),
      }}
      skills={{
        talim: { label: 'التعليم على مستقيم مدرّج', emoji: '📏' },
        muqarana: { label: 'مقارنة عددين نسبيين', emoji: '⚖️' },
        maalam: { label: 'الإحداثيان في معلم', emoji: '📍' },
        jam: { label: 'جمع عددين نسبيين', emoji: '➕' },
        jabri: { label: 'المجموع الجبري', emoji: '🧮' },
        masafa: { label: 'المسافة بين نقطتين', emoji: '↔️' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: ستحلّ ست وضعيات تدريبية خطوة بخطوة.', advice: 'راجع دروس الوحدة الستّة: التعليم على مستقيم مدرّج، ومقارنة الأعداد النسبية، وتعليم نقطة في المستوي، وجمع وطرح عددين نسبيين، وحساب مجموع جبري، والمسافة بين نقطتين.', cta: 'أبدأ الوضعية على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات ستُصحَّح أثناء الوضعيات.', advice: 'انتبه إلى الفاصلة قبل الترتيب في الإحداثيين، وإلى الأبعد عن الصفر عند جمع عددين من إشارتين مختلفتين، وإلى المسافة بين عددين على جهتين من الصفر.', cta: 'أقرأ الوضعية', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأدوات التي تحتاجها الوضعيات متحكَّم فيها.', advice: 'حاول حلّ الوضعيات دون مساعدة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['faasila'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['salibayn'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['nuqta-ala-mihwar'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-4', requires: ['jam-ishara-mukhtalifa'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[4]), id: 'prep-5', requires: ['qaidat-majmu-jabri'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[5]), id: 'prep-6', requires: ['qaidat-masafa'] },
      ]}
    />
  );
}
