import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_LADDER } from '../content/prep';

/**
 * Module 0 — أستعدّ : DIX affirmations de la plateforme (content/prep.js › PREP_LADDER), de très facile à plus difficile, les deux كفاءات en
 * alternance — « مربّع عدد ومعاكسه » et « الجذر التربيعي » (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 2, leçon 3, le
 * 2026-11-10). Les six énoncés d'avant (ci-dessous) restent dans textbook.js comme source ; les équations du premier degré restent un
 * `priorKnowledge` de la leçon (le module 3 les requiert), sans question dans l'échelle.
 *
 * Avant le rollout — أستعدّ. L'item 3 du manuel (p. 19 : « 36 هو مربع العدد الوحيد 6 »)
 * et cinq affirmations de la plateforme dans la même forme, qui mesurent les
 * trois `priorKnowledge` : le carré d'un nombre et l'opposé (murabba-adad), la
 * racine carrée de la leçon 1 (jidhr-taarif), les équations du premier degré
 * (muadala-daraja-ula). Jamais bloquant, jamais une preuve ; `id` et
 * `requires` restent littéraux (audit).
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="8 دقائق"
      brief={{
        tag: 'أستعدّ', title: 'عشر عبارات قبل الانطلاق', tone: 'teal',
        body: <p>من السهل جدًّا إلى الأصعب. ليست اختبارًا: الغاية أن تعرف أنت ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        // `lesson` : la leçon à réviser quand cette كفاءة est fragile (carte « راجع » prioritaire de la revue)
        murabba: { label: 'مربّع عدد ومعاكسه', emoji: '²', lesson: 'quwat-adad-nisbi' },
        jidhr: { label: 'الجذر التربيعي', emoji: '√', lesson: 'jidhr-tarbii' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط الأول يبدأ بتحريك عدد على مستقيم ومتابعة مربّعه.', advice: 'راجع مربّع عدد سالب: جداء عددين سالبين عدد موجب.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى إشارة مربّع العدد السالب، وإلى أنّ الجذر التربيعي عدد موجب.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'مربّع عدد ومعاكسه والجذر التربيعي متحكَّم فيهما.', advice: 'حاول أن تتوقّع عدد الحلول قبل أن تحرّك أي شيء.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_LADDER[0]), id: 'prep-1', requires: ['murabba-adad'] },
        { ...prepQuestion(PREP_LADDER[1]), id: 'prep-2', requires: ['jidhr-taarif'] },
        { ...prepQuestion(PREP_LADDER[2]), id: 'prep-3', requires: ['murabba-adad'] },
        { ...prepQuestion(PREP_LADDER[3]), id: 'prep-4', requires: ['jidhr-taarif'] },
        { ...prepQuestion(PREP_LADDER[4]), id: 'prep-5', requires: ['murabba-adad'] },
        { ...prepQuestion(PREP_LADDER[5]), id: 'prep-6', requires: ['jidhr-taarif'] },
        { ...prepQuestion(PREP_LADDER[6]), id: 'prep-7', requires: ['murabba-adad'] },
        { ...prepQuestion(PREP_LADDER[7]), id: 'prep-8', requires: ['jidhr-taarif'] },
        { ...prepQuestion(PREP_LADDER[8]), id: 'prep-9', requires: ['murabba-adad'] },
        { ...prepQuestion(PREP_LADDER[9]), id: 'prep-10', requires: ['jidhr-taarif'] },
      ]}
    />
  );
}
