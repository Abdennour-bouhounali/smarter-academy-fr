/**
 * La carte PROGRESSIVE du درس « مساحة سطح مستو ومحيطه » (1AM) — docs/architecture/KNOWLEDGE_MAP.md, Part A.
 * Aucune mathématique écrite ici : les textes viennent de content/textbook.js (`KNOWLEDGE`, `METHOD_TILING`, `GUIDE`).
 *
 * (Ordre de lecture LTR ; sous RTL le couloir `start` est à DROITE.)
 *
 *                              [حوش الزليج] (M1)                                  مفهوم
 *                        نعدّ ┌──────┴──────┐ ونعدّ
 *            [المساحة] (M1)                   [المحيط] (M1)
 *               │ بوحدة              خطأ شائع │          │ ننقل
 *        [الوحدتان] (M1)        ⛔ [المحيط = عدد البلاطات؟]   [نقل البلاطات] (M1)
 *                                                    │ ونستنتج
 *                                           [سطحان] (M2)
 *                                      خطأ شائع │       │ ثم نعيّن
 *                                       خطأ شائع │       │ وبوحدتين
 *                              ⛔ [نهمل النصف؟]      [وحدتان] (M3)
 *                                                       │ نستخلص
 *                                                  🎯 [الخلاصة]
 */
import { KNOWLEDGE, METHOD_TILING, GUIDE } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'hawsh',
  nodes: [
    {
      id: 'hawsh', kind: 'concept', lane: 'center', requires: 'masaha-adad',
      title: 'حوش الزليج', subtitle: 'بلاطات وسياج',
      context: { text: 'حوش من بلاطات مربّعة متماثلة وسياج يحيط به: نعدّ البلاطات التي تغطّيه ونعدّ العصي التي تحيط به، وهما عددان مختلفان.', note: KNOWLEDGE.different.text },
      reveals: ['masaha', 'mahit'],
    },
    {
      id: 'masaha', kind: 'concept', lane: 'start', requires: 'masaha-adad', notebook: true,
      title: 'المساحة', subtitle: 'عدد البلاطات',
      context: { text: KNOWLEDGE.area.text },
      reveals: ['wahdat'],
    },
    {
      id: 'wahdat', kind: 'concept', lane: 'start', requires: 'wahdat-tul-masaha', notebook: true,
      title: 'الوحدتان', subtitle: 'بلاطة وضلع',
      context: { text: KNOWLEDGE.unitLength.text },
      reveals: [],
    },
    {
      id: 'mahit', kind: 'concept', lane: 'end', requires: 'mahit-hadd', notebook: true,
      title: 'المحيط', subtitle: 'طول السياج',
      context: { text: KNOWLEDGE.perimeter.text },
      reveals: ['khataKhalt', 'naql'],
    },
    {
      // ⛔ خطأ شائع — la surface confondue avec son bord (`GUIDE.confusion`).
      id: 'khataKhalt', kind: 'common_mistake', lane: 'end', requires: 'mahit-hadd',
      title: 'المحيط هو عدد البلاطات؟', subtitle: '',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.confusion.wrong },
          { role: 'why', text: GUIDE.confusion.why },
          { role: 'right', text: GUIDE.confusion.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'naql', kind: 'relationship', lane: 'center', requires: 'naql-baqat-masaha', notebook: true,
      title: 'نقل البلاطات', subtitle: 'المساحة ثابتة',
      context: { text: KNOWLEDGE.moving.text },
      reveals: ['hallat'],
    },
    {
      id: 'hallat', kind: 'relationship', lane: 'center', requires: 'thalath-hallat', notebook: true,
      title: 'سطحان', subtitle: 'ثلاث حالات',
      context: { text: KNOWLEDGE.sameAreaOnly.text, note: KNOWLEDGE.samePerimeterOnly.text },
      reveals: ['rasf'],
    },
    {
      id: 'rasf', kind: 'method', lane: 'end', requires: 'tariqat-rasf', notebook: true,
      title: 'أعيّن المساحة برصف', subtitle: 'كاملة وأنصاف',
      context: { text: METHOD_TILING.exercise, note: METHOD_TILING.rule },
      reveals: ['khataNisf', 'wahdatan'],
    },
    {
      // ⛔ خطأ شائع — le demi-carreau négligé (`GUIDE.halfIgnored`).
      id: 'khataNisf', kind: 'common_mistake', lane: 'end', requires: 'tariqat-rasf',
      title: 'نهمل نصف البلاطة؟', subtitle: '',
      context: {
        parts: [
          { role: 'wrong', text: GUIDE.halfIgnored.wrong },
          { role: 'why', text: GUIDE.halfIgnored.why },
          { role: 'right', text: GUIDE.halfIgnored.right },
        ],
      },
      reveals: [],
    },
    {
      id: 'wahdatan', kind: 'relationship', lane: 'center', requires: 'wahdatan-adad', notebook: true,
      title: 'مساحة بوحدتين', subtitle: 'العدد يتبع الوحدة',
      context: { text: KNOWLEDGE.units.text },
      reveals: ['khulasa'],
    },
    {
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'wahdatan-adad',
      title: 'الخلاصة', subtitle: 'مساحة ومحيط',
      context: { text: 'المساحة عدد وحدات المساحة التي تغطّي السطح، والمحيط طول حدّه؛ ينقل البلاطات فيبقى الأول ويتغيّر الثاني؛ ونعدّ الأنصاف بالنصف، ويتبع العدد الوحدة.', note: KNOWLEDGE.different.text },
      reveals: [],
    },
  ],
  edges: [
    { from: 'hawsh', to: 'masaha', label: 'نعدّ البلاطات' },
    { from: 'hawsh', to: 'mahit', label: 'ونعدّ العصي' },
    { from: 'masaha', to: 'wahdat', label: 'بوحدة' },
    { from: 'mahit', to: 'khataKhalt', label: 'خطأ شائع' },
    { from: 'mahit', to: 'naql', label: 'ننقل' },
    { from: 'naql', to: 'hallat', label: 'ونستنتج' },
    { from: 'hallat', to: 'rasf', label: 'ثم نعيّن' },
    { from: 'rasf', to: 'khataNisf', label: 'خطأ شائع' },
    { from: 'rasf', to: 'wahdatan', label: 'وبوحدتين' },
    { from: 'wahdatan', to: 'khulasa', label: 'نستخلص' },
  ],
};
