/**
 * La carte PROGRESSIVE de « أدمج تعلّماتي » (unité 5) — la séance d'INTÉGRATION.
 * Contrat : docs/architecture/KNOWLEDGE_MAP.md, Part A (A.15, cas de l'intégration) ;
 * modèle : muadalat-mutarajihat/wadiya-idmajiya-muadalat.
 *
 *   — aucune connaissance nouvelle : la DÉMARCHE du manuel (choisir les inconnues,
 *     traduire chaque information, choisir la méthode, vérifier dans le texte) ;
 *   — la SOLUTION du حفل (25 DA et 50 DA) n'y figure pas : c'est la réponse de
 *     l'évaluation (A.10 règle 14). Depuis le 2026-11-12, la carte est OUVERTE dès le premier écran : la situation et les erreurs en LETTRES ;
 *   — les deux erreurs sont celles que le module 7 corrige (une quantité multipliée
 *     par le prix de l'AUTRE objet ; s'arrêter après une seule inconnue), avec leur « لماذا؟ » ;
 *
 *                      [ما سعر العلبة وسعر القطعة؟]               مفهوم
 *                               نبدأ بـ │
 *                          [اختيار المجهولين]                      طريقة
 *                                نترجم │
 *                          [من معلومة إلى معادلة]                  طريقة
 *              خطأ شائع ┌──────────┴──────────┐ نحلّ بـ
 *       ⛔ [عدد في سعر شيء آخر]        [الطريقة الأنجع]           طريقة
 *                                           │ ثم نتحقق
 *                    خطأ شائع ┌──── [التحقق وتحرير الجواب]        طريقة
 *          ⛔ [مجهول واحد لا يكفي]           │ نجمعها
 *                                   [من النص إلى الجواب]           طريقة
 *                                           │ نستخلص
 *                                    🎯 [ثلاث مراحل]
 */
import { SITUATION, SITUATION_LETTERS, REMARKS } from './content/textbook';

export const KNOWLEDGE_GRAPH = {
  root: 'wadiya',
  nodes: [
    {
      id: 'wadiya', kind: 'concept', lane: 'center', requires: 'tahdid-majahil',
      title: 'ما سعر العلبة وسعر القطعة؟', subtitle: 'وضعية الوحدة',
      // la وضعية en LETTRES : la carte est ouverte dès le premier écran (balayage par rôle, content/mission.test.js — 2026-11-12)
      context: { text: SITUATION_LETTERS },
      reveals: ['majahil'],
    },
    { id: 'majahil', kind: 'method', lane: 'center', requires: 'tahdid-majahil', notebook: true, title: 'اختيار المجهولين', subtitle: 'المطلوب في السؤال', reveals: ['tarjama'] },
    { id: 'tarjama', kind: 'method', lane: 'center', requires: 'tarjamat-maalumat', notebook: true, title: 'من معلومة إلى معادلة', reveals: ['tarjamaKhata', 'tariqa'] },
    {
      // ⛔ خطأ شائع — module 7, étape 2 : la ligne « 3x + 2y = 210 » et sa correction (MISC-JUMLA-TARJAMA).
      id: 'tarjamaKhata', kind: 'common_mistake', lane: 'start', requires: 'tarjamat-maalumat',
      title: 'عدد في سعر شيء آخر', subtitle: 'أيّ عدد مع أيّ سعر؟',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.tarjamaWrong },
          { role: 'why', text: REMARKS.tarjamaWhy },
          { role: 'right', text: REMARKS.tarjamaRight },
        ],
      },
      reveals: [],
    },
    { id: 'tariqa', kind: 'method', lane: 'end', requires: 'ikhtiyar-tariqa', notebook: true, title: 'الطريقة الأنجع', subtitle: 'تعويض أم جمع؟', reveals: ['tahaqquq'] },
    { id: 'tahaqquq', kind: 'method', lane: 'end', requires: 'tahaqquq-tafsir', notebook: true, title: 'التحقق وتحرير الجواب', reveals: ['nisf', 'marahil'] },
    {
      // ⛔ خطأ شائع — module 7, étape 5 : le distracteur « x = 30 … وانتهى الحل » (MISC-JUMLA-NISF-HALL).
      id: 'nisf', kind: 'common_mistake', lane: 'start', requires: 'tahaqquq-tafsir',
      title: 'مجهول واحد لا يكفي', subtitle: 'الحل ثنائية',
      context: {
        parts: [
          { role: 'wrong', text: REMARKS.nisfWrong },
          { role: 'why', text: REMARKS.nisfWhy },
          { role: 'right', text: REMARKS.nisfRight },
        ],
      },
      reveals: [],
    },
    { id: 'marahil', kind: 'method', lane: 'end', requires: 'tariqat-wadiya', notebook: true, title: 'من النص إلى الجواب', reveals: ['khulasa'] },
    {
      // 🎯 خلاصة — les trois étapes de l'analyse du manuel, nommées par lui.
      id: 'khulasa', kind: 'takeaway', lane: 'center', requires: 'tariqat-wadiya',
      title: 'ثلاث مراحل', subtitle: 'نقرأ · نحلّل · ننفّذ',
      context: { list: SITUATION.analysis.map((a) => a.label) },
      reveals: [],
    },
  ],
  edges: [
    { from: 'wadiya', to: 'majahil', label: 'نبدأ بـ' },
    { from: 'majahil', to: 'tarjama', label: 'نترجم' },
    { from: 'tarjama', to: 'tarjamaKhata', label: 'خطأ شائع' },
    { from: 'tarjama', to: 'tariqa', label: 'نحلّ بـ' },
    { from: 'tariqa', to: 'tahaqquq', label: 'ثم نتحقق' },
    { from: 'tahaqquq', to: 'nisf', label: 'خطأ شائع' },
    { from: 'tahaqquq', to: 'marahil', label: 'نجمعها' },
    { from: 'marahil', to: 'khulasa', label: 'نستخلص' },
  ],
};
