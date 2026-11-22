import { PrerequisiteDiagnostic } from '../../../../../../common/kit';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { prepQuestion } from '../../_unit/prepDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PREP_ITEMS } from '../content/textbook';
import { FIG_PREP1 } from '../content/figures';

/**
 * Module 0 — أستعدّ. Les items 1 (ses quatre affirmations, jugées une par une sur le معلم dessiné) et 2 du manuel
 * (p. 139 ; 3 à 6 sont aux دروس suivants) et deux affirmations de la plateforme sur le vecteur de l'unité 11, dans la
 * forme « أصحيح أم خاطئ؟ برّر إجابتك » : lire des coordonnées (1a, 1b), une droite graduée (1c, 1d), les axes (2), le
 * sens d'un vecteur (p1), deux vecteurs égaux (p2). Diagnostic JAMAIS bloquant ; `id` et `requires` restent littéraux.
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
        tag: 'أستعدّ — الكتاب ص 139', title: 'سبع عبارات قبل الانطلاق', tone: 'teal',
        body: (
          <div className="space-y-2">
            <p>خمس عبارات من الكتاب واثنتان من المنصّة: إحداثيتا نقطة في معلم، ومحورا المعلم، والشعاع الذي عرفته في الوحدة السابقة. ليست اختبارًا: الغاية أن تعرف ما ينبغي أن تراجعه.</p>
            <p className="text-sm font-semibold text-slate-700">العبارات الأربع الأولى عن المعلم الآتي:</p>
            <GeoFigure {...FIG_PREP1} />
          </div>
        ),
      }}
      skills={{
        ihdathiyat: { label: 'إحداثيتا نقطة في معلم', emoji: '📍' },
        mudarraj: { label: 'المنتصف والمسافة على مستقيم مدرّج', emoji: '📏' },
        mihwar: { label: 'محورا المعلم', emoji: '➕' },
        shuaa: { label: 'منحى الشعاع واتجاهه', emoji: '➡️' },
        tasawi: { label: 'شعاعان متساويان', emoji: '🟰' },
      }}
      levels={{
        fragile: { emoji: '🌱', title: 'مكتسباتك لا تزال هشّة.', body: 'لا بأس: الدرس يبدأ بسائق توصيل تحرّكه بيدك في شوارع حيّ.', advice: 'راجع: الفاصلة أولا (يمين أو يسار محور التراتيب) ثم الترتيب (فوق أو تحت محور الفواصل)؛ والشعاع يتجه من مبدئه نحو نهايته.', cta: 'أبدأ الدرس على كل حال', tone: 'from-emerald-500 to-teal-500' },
        progres: { emoji: '👍', title: 'مكتسباتك في الطريق الصحيح.', body: 'بعض التردّدات الصغيرة ستُصحَّح أثناء الدرس.', advice: 'انتبه إلى الإشارة: على يسار محور التراتيب الفاصلة سالبة، وتحت محور الفواصل الترتيب سالب.', cta: 'أبدأ الدرس', tone: 'from-teal-500 to-cyan-500' },
        pret: { emoji: '🚀', title: 'أنت جاهز!', body: 'المعلم والشعاع متحكَّم فيهما.', advice: 'في المستوى المتقدّم سُق السائق دون عدّادات واكتب رحلته بنفسك.', cta: 'أنا جاهز!', tone: 'from-cyan-500 to-blue-500' },
      }}
      questions={[
        { ...prepQuestion(PREP_ITEMS[0]), id: 'prep-1a', requires: ['ihdathiyat-nuqta'] },
        { ...prepQuestion(PREP_ITEMS[1]), id: 'prep-1b', requires: ['ihdathiyat-nuqta'] },
        { ...prepQuestion(PREP_ITEMS[2]), id: 'prep-1c', requires: ['mustaqim-mudarraj'] },
        { ...prepQuestion(PREP_ITEMS[3]), id: 'prep-1d', requires: ['mustaqim-mudarraj'] },
        { ...prepQuestion(PREP_ITEMS[4]), id: 'prep-2', requires: ['mihwarayn'] },
        { ...prepQuestion(PREP_ITEMS[5]), id: 'prep-p1', requires: ['shuaa-anasir'] },
        { ...prepQuestion(PREP_ITEMS[6]), id: 'prep-p2', requires: ['tasawi-shuaayn'] },
      ]}
    />
  );
}
