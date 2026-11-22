/**
 * La carte PROGRESSIVE du درس 3 « مجموع شعاعين (علاقة شال وقاعدة متوازي الأضلاع) » (unité 11).
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A ; modèle : hisab-muthallathat/tarrid-muthallathiya.
 *
 *   — la SOMME née de deux translations (module 1), علاقة شال, le vecteur nul et les opposés, la règle du
 *     parallélogramme (module 2), construire un représentant (module 3) ;
 *   — trois erreurs que la leçon corrige avec leur « لماذا؟ » : AB + BC = CA (module 2, étape 1, et la découverte du
 *     lab), l'autre diagonale BC (module 2, étape 3), les longueurs additionnées 4 + 2 = 6 (la découverte du nageur,
 *     module 2 étape 4, rattachée aux deux mouvements : le compteur de la trottinette et le nageur) ; une خلاصة ;
 *   — aucune réponse du « إختبار أولي » (A.10 règle 14).
 *
 *                     [مجموع شعاعين]                         مفهوم
 *                          │ يبدأ بـ
 *      خطأ شائع ┌──── [انسحابان متتابعان]                     مفهوم
 *                          │ نكتب
 *      خطأ شائع ┌──── [علاقة شال]
 *                          │ ثم
 *                   [الشعاع المعدوم]                          مفهوم
 *                          │ ومنه
 *                 [الشعاعان المتعاكسان]                       مفهوم
 *                          │ نفس المبدأ
 *      خطأ شائع ┌──── [قاعدة متوازي الأضلاع]
 *                          │ نوظّفها
 *      خطأ شائع ┌──── [إنشاء ممثل لمجموع] → 🎯
 */
import { ACTIVITY, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'majmu',
  nodes: [
    {
      id: 'majmu', kind: 'concept', lane: 'center', requires: 'tarkib-insihabayn',
      title: 'مجموع شعاعين', subtitle: 'حركتان، حركة واحدة',
      context: { text: ACTIVITY.closing },
      reveals: ['tarkib'],
    },
    { id: 'tarkib', kind: 'concept', lane: 'center', requires: 'tarkib-insihabayn', notebook: true, title: 'انسحابان متتابعان', reveals: ['atwalKhata', 'shal'] },
    {
      // ⛔ خطأ شائع — module 2, étape 4 (le nageur : 6 km/h) et la découverte du lab : MISC-SHUAA-JAM-ATWAL.
      id: 'atwalKhata', kind: 'common_mistake', lane: 'start', requires: 'qaidat-mutawazi',
      title: 'جمع الطولين', subtitle: 'السرعة الفعلية',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.lengthsWrong },
          { role: 'why', text: REMARKS.lengthsWhy },
          { role: 'right', text: REMARKS.lengthsRight },
        ],
      },
      reveals: [],
    },
    { id: 'shal', kind: 'relationship', lane: 'end', requires: 'alaqat-shal', notebook: true, title: 'علاقة شال', subtitle: 'نهاية الأول مبدأ الثاني', reveals: ['shalKhata', 'maadum'] },
    {
      // ⛔ خطأ شائع — module 2, étape 1 (distracteur CA) et la découverte du lab : MISC-SHUAA-SHAL-AKS.
      id: 'shalKhata', kind: 'common_mistake', lane: 'start', requires: 'alaqat-shal',
      title: 'المجموع معكوس', subtitle: 'من C إلى A؟',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.reverseWrong },
          { role: 'why', text: REMARKS.reverseWhy },
          { role: 'right', text: REMARKS.reverseRight },
        ],
      },
      reveals: [],
    },
    { id: 'maadum', kind: 'concept', lane: 'end', requires: 'shuaa-maadum', notebook: true, title: 'الشعاع المعدوم', reveals: ['mutaakisan'] },
    { id: 'mutaakisan', kind: 'concept', lane: 'center', requires: 'mutaakisan', notebook: true, title: 'الشعاعان المتعاكسان', reveals: ['qaida'] },
    { id: 'qaida', kind: 'relationship', lane: 'center', requires: 'qaidat-mutawazi', notebook: true, title: 'قاعدة متوازي الأضلاع', subtitle: 'القطر الصادر من المبدأ', reveals: ['qutrKhata', 'insha'] },
    {
      // ⛔ خطأ شائع — module 2, étape 3 (distracteur BC) : MISC-SHUAA-QAIDA-QUTR.
      id: 'qutrKhata', kind: 'common_mistake', lane: 'start', requires: 'qaidat-mutawazi',
      title: 'القطر الآخر', subtitle: 'لا يمرّ بالمبدأ',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.diagonalWrong },
          { role: 'why', text: REMARKS.diagonalWhy },
          { role: 'right', text: REMARKS.diagonalRight },
        ],
      },
      reveals: [],
    },
    { id: 'insha', kind: 'method', lane: 'end', requires: 'insha-mumaththil', notebook: true, title: 'إنشاء ممثل لمجموع', reveals: ['khulasa'] },
    {
      // 🎯 خلاصة — les deux règles et les opposés, en une phrase du module 3.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'insha-mumaththil',
      title: 'شال أم متوازي الأضلاع؟',
      context: { text: REMARKS.takeaway },
      reveals: [],
    },
  ],
  edges: [
    { from: 'majmu', to: 'tarkib', label: 'يبدأ بـ' },
    { from: 'tarkib', to: 'atwalKhata', label: 'خطأ شائع' },
    { from: 'tarkib', to: 'shal', label: 'نكتب' },
    { from: 'shal', to: 'shalKhata', label: 'خطأ شائع' },
    { from: 'shal', to: 'maadum', label: 'ثم' },
    { from: 'maadum', to: 'mutaakisan', label: 'ومنه' },
    { from: 'mutaakisan', to: 'qaida', label: 'نفس المبدأ' },
    { from: 'qaida', to: 'qutrKhata', label: 'خطأ شائع' },
    { from: 'qaida', to: 'insha', label: 'نوظّفها' },
    { from: 'insha', to: 'khulasa', label: 'نستخلص' },
  ],
};
