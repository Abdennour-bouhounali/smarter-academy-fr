/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي » (unité 13 « الدوران - الزوايا - المضلّعات المنتظمة ») — la séance d'INTÉGRATION.
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A (A.15, cas de l'intégration) ; modèles : les synthèses des unités 11–12.
 *
 *   — aucune connaissance nouvelle : la DÉMARCHE du manuel appliquée à la وضعية (le polygone régulier posé par le دوران, la
 *     distance dans le triangle équilatéral puis dans le triangle rectangle de la hauteur, le plan à l'échelle) ;
 *   — la وضعية du manuel est résolue au module 7 (enseignement) ; l'évaluation est un AUTRE tour de lampadaires (Oran), dont
 *     aucune réponse n'est ici (A.10 règle 14) ;
 *   — les trois erreurs sont celles que le module 7 corrige avec son « لماذا؟ » : n − 1 arcs au lieu de n (MISC-MUNTAZAM-AMDA),
 *     l'arc au lieu de la corde, « d = r » toujours (MISC-MUNTAZAM-DIL).
 *
 *                      [أعمدة متباعدة بانتظام]                  مفهوم
 *                                │ نبدأ بـ
 *     خطأ شائع ┌──────── [بالدوران: 360°/n]                    طريقة
 *                                │ ثم
 *     خطأ شائع ┌──────── [السداسي: d = r]                       علاقة
 *                                │ بصفة عامة
 *     خطأ شائع ┌──────── [d في المثلث القائم]                  علاقة
 *                                │ نجمعها
 *                       [من النص إلى المخطط] → 🎯                طريقة
 */
import { REMARKS, SITUATION } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    {
      id: 'wadiya', kind: 'concept', lane: 'center', requires: 'tawzi-dawaran',
      title: 'أعمدة متباعدة بانتظام', subtitle: 'حول حوض دائري',
      context: { text: REMARKS.tajnid },
      reveals: ['tawzi'],
    },
    { id: 'tawzi', kind: 'method', lane: 'center', requires: 'tawzi-dawaran', notebook: true, title: 'بالدوران حول المركز', subtitle: '$\\alpha = \\dfrac{360^\\circ}{n}$', reveals: ['amdaKhata', 'masafa'] },
    {
      // ⛔ خطأ شائع — module 7, étape 3 : n − 1 arcs au lieu de n (MISC-MUNTAZAM-AMDA).
      id: 'amdaKhata', kind: 'common_mistake', lane: 'start', requires: 'tawzi-dawaran',
      title: '5 مسافات أم 6؟', subtitle: 'الدائرة مغلقة',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.amdaWrong },
          { role: 'why', text: REMARKS.amdaWhy },
          { role: 'right', text: REMARKS.amdaRight },
        ],
      },
      reveals: [],
    },
    { id: 'masafa', kind: 'relationship', lane: 'end', requires: 'masafa-amudayn', notebook: true, title: 'السداسي: المسافة = نصف القطر', subtitle: '$d = r$', reveals: ['qawsKhata', 'qanun'] },
    {
      // ⛔ خطأ شائع — module 7, étape 8 : l'arc au lieu de la corde.
      id: 'qawsKhata', kind: 'common_mistake', lane: 'start', requires: 'masafa-amudayn',
      title: 'القوس أم الوتر؟', subtitle: 'المسافة مستقيمة',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.qawsWrong },
          { role: 'why', text: REMARKS.qawsWhy },
          { role: 'right', text: REMARKS.qawsRight },
        ],
      },
      reveals: [],
    },
    { id: 'qanun', kind: 'relationship', lane: 'end', requires: 'qanun-masafa', notebook: true, title: 'المسافة في المثلث القائم', subtitle: '$d = 2r\\sin\\dfrac{180^\\circ}{n}$', reveals: ['dilKhata', 'marahil'] },
    {
      // ⛔ خطأ شائع — module 7, étape 8 : « d = r » toujours (MISC-MUNTAZAM-DIL).
      id: 'dilKhata', kind: 'common_mistake', lane: 'start', requires: 'qanun-masafa',
      title: 'نصف القطر دائما؟', subtitle: 'السداسي فقط',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.dilWrong },
          { role: 'why', text: REMARKS.dilWhy },
          { role: 'right', text: REMARKS.dilRight },
        ],
      },
      reveals: [],
    },
    { id: 'marahil', kind: 'method', lane: 'center', requires: 'tariqat-wadiya', notebook: true, title: 'من النص إلى المخطط', reveals: ['khulasa'] },
    {
      // 🎯 خلاصة — les trois étapes de l'analyse du manuel, nommées par lui.
      id: 'khulasa', kind: 'takeaway', lane: 'end', requires: 'tariqat-wadiya',
      title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ',
      context: { list: SITUATION.analysis.map((a) => a.label) },
      reveals: [],
    },
  ],
  edges: [
    { from: 'wadiya', to: 'tawzi', label: 'نبدأ بـ' },
    { from: 'tawzi', to: 'amdaKhata', label: 'خطأ شائع' },
    { from: 'tawzi', to: 'masafa', label: 'ثم' },
    { from: 'masafa', to: 'qawsKhata', label: 'خطأ شائع' },
    { from: 'masafa', to: 'qanun', label: 'بصفة عامة' },
    { from: 'qanun', to: 'dilKhata', label: 'خطأ شائع' },
    { from: 'qanun', to: 'marahil', label: 'نجمعها' },
    { from: 'marahil', to: 'khulasa', label: 'نستخلص' },
  ],
};
