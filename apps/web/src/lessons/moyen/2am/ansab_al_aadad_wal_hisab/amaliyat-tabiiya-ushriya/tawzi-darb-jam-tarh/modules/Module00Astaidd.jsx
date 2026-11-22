import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS, PREP_PLATFORM_ITEMS } from '../content/textbook';

/**
 * Module 0 — أستعدّ : six affirmations. Deux viennent de « أستعدّ » (p. 7, items 9 et 11, réécrits : l'aire d'un rectangle en deux morceaux et la notation d'un produit avec une lettre) ; quatre de la
 * plateforme mesurent le lien « راجع » du réseau (LEARNING_NET.md §4.4) : `2am.m1.r02` (les parenthèses — leçon `silsila-bi-aqwas`, PUBLIÉE : le panneau « راجع قبل أن تنطلق » y renvoie) et l'aire du rectangle (1AM).
 * Diagnostic JAMAIS bloquant ; `id` et `requires` littéraux.
 */
export default function Module00Astaidd() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="🎯 أستعدّ"
      moduleSubtitle="أصحيح أم خاطئ؟ برّر إجابتك. تشخيص قصير لا يمنعك من متابعة الدرس."
      estimatedTime="7 دقائق"
      brief={{
        tag: 'أستعدّ', title: 'ست عبارات قبل الانطلاق', tone: 'teal',
        body: <p>الأقواس ومساحة المستطيل وكتابة الجداء بحرف. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه قبل أن تبدأ.</p>,
      }}
      skills={{
        aqwas: { label: 'الأقواس', emoji: '🧮' },
        masaha: { label: 'مساحة المستطيل', emoji: '📐' },
        harf: { label: 'الحرف في الجداء', emoji: '🔤' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: النشاط يبدأ بحقائب بسيطة في ورشة النادي.', advice: 'راجع الأقواس ومساحة المستطيل قبل أن تبدأ.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى ما يُحسب أوّلًا بين القوسين.', cta: 'أبدأ النشاط', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'الأقواس والمساحة والحرف متحكَّم فيها.', advice: 'جرّب المستوى المتقدّم مباشرة.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_PLATFORM_ITEMS[0]), id: 'prep-1', requires: ['silsila-bi-aqwas-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[1]), id: 'prep-2', requires: ['silsila-bi-aqwas-2am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[2]), id: 'prep-3', requires: ['silsila-bi-aqwas-2am'] },
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-4', requires: ['masahat-muhit-sath-1am'] },
        { ...prepQuestion(PREP_PLATFORM_ITEMS[3]), id: 'prep-5', requires: ['masahat-muhit-sath-1am'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-6', requires: ['harf-adad-1am'] },
      ]}
    />
  );
}
