import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 9,
 * leçon 3, 2026-11-10 ; conseil du 2026-11-10). Les deux كفاءات alternent : talis « خاصية طالس » (1 → 3 → 5 → 7 → 9, à réviser dans
 * `talis-hisab-atwal`) et kasr « التناسب والرابع المتناسب » (2 → 4 → 6 → 8 → 10, à réviser dans `tasawi-muqaranat-kasrayn`, 3AM — la leçon qui
 * enseigne le test d'égalité de deux fractions). Écrites par la plateforme : les sept énoncés d'avant restent dans content/textbook.js (PREP_ITEMS).
 * `check` (recalculé par content/prep.test.js) :
 *   { kind: 'statement', claim }                       — la propriété de Thalès énoncée (vraie par définition, justifiée par `why`)
 *   { kind: 'fracEq', a, b, c, d }                     — « a/b = c/d » (vrai ⇔ a·d = b·c)
 *   { kind: 'cross', left: [a, b], right: [c, d], claim: [n, m] } — une proportion dont UN terme est 'x' ; l'affirmation dit x = n/m
 *   { kind: 'thales', part, whole | rest, other, claim: [n, m] }  — part/whole = other/x ⇒ x = other·whole/part (`rest` : whole = part + rest)
 * Aucun nombre de la مسألة (10, 40, 30, 35, 20, 15, 4/3, 3/4, 4/7, 3/7, 40/7, 30/7) ni des rapports de la ورقة زميل (2/3 avec 6 cm, 2,4).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'talis', level: 1, text: 'ABC مثلث، M من [AB] و N من [AC] و (MN)//(BC). إذن $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ .', answer: true, why: 'هذه خاصية طالس: المستقيم الموازي لضلع يقطع الضلعين الآخرين بالنسبة نفسها.', check: { kind: 'statement', claim: true } },
  { n: 2, skill: 'kasr', level: 1, text: '$\\dfrac{2}{3} = \\dfrac{8}{12}$', answer: true, why: 'نضرب البسط والمقام في 4: $\\dfrac{2}{3} = \\dfrac{8}{12}$ .', check: { kind: 'fracEq', a: 2, b: 3, c: 8, d: 12 } },
  { n: 3, skill: 'talis', level: 1, text: 'ABC مثلث، M من [AB] و N من [AC] و (MN)//(BC). إذا كان AM = 2 و AB = 6 فإن $\\dfrac{MN}{BC} = \\dfrac{1}{3}$ .', answer: true, why: 'حسب خاصية طالس $\\dfrac{MN}{BC} = \\dfrac{AM}{AB} = \\dfrac{2}{6} = \\dfrac{1}{3}$ .', check: { kind: 'fracEq', a: 2, b: 6, c: 1, d: 3 } },
  { n: 4, skill: 'kasr', level: 2, text: 'من التناسب $\\dfrac{3}{x} = \\dfrac{6}{7}$ نستنتج أن $x = \\dfrac{18}{7}$ .', answer: false, why: 'الجداء المتصالب: $6 \\times x = 3 \\times 7 = 21$ ، ومنه $x = \\dfrac{21}{6} = \\dfrac{7}{2}$ .', check: { kind: 'cross', left: [3, 'x'], right: [6, 7], claim: [18, 7] } },
  { n: 5, skill: 'talis', level: 2, text: 'ABC مثلث، M من [AB] و N من [AC] و (MN)//(BC). إذا كان AM = 3 و AB = 9 و AN = 2 فإن AC = 5.', answer: false, why: 'حسب خاصية طالس $\\dfrac{3}{9} = \\dfrac{2}{AC}$ ، ومنه $AC = \\dfrac{2 \\times 9}{3} = 6$ ، لا 5.', check: { kind: 'thales', part: 3, whole: 9, other: 2, claim: [5, 1] } },
  { n: 6, skill: 'kasr', level: 2, text: 'من التناسب $\\dfrac{2}{9} = \\dfrac{5}{x}$ نستنتج أن $x = \\dfrac{45}{2}$ .', answer: true, why: 'الجداء المتصالب: $2 \\times x = 9 \\times 5 = 45$ ، ومنه $x = \\dfrac{45}{2}$ .', check: { kind: 'cross', left: [2, 9], right: [5, 'x'], claim: [45, 2] } },
  { n: 7, skill: 'talis', level: 3, text: 'ABC مثلث، M من [AB] و N من [AC] و (MN)//(BC). إذا كان AM = 2 و MB = 4 و AN = 3 فإن AC = 6.', answer: false, why: '$AB = AM + MB = 6$ ، وحسب خاصية طالس $\\dfrac{2}{6} = \\dfrac{3}{AC}$ ومنه $AC = 9$ : نقارن الجزء AM بالكل AB، لا بالجزء الباقي MB.', check: { kind: 'thales', part: 2, rest: 4, other: 3, claim: [6, 1] } },
  { n: 8, skill: 'kasr', level: 3, text: 'من التناسب $\\dfrac{x}{12} = \\dfrac{3}{8}$ نستنتج أن $x = \\dfrac{9}{2}$ .', answer: true, why: 'الجداء المتصالب: $8 \\times x = 12 \\times 3 = 36$ ، ومنه $x = \\dfrac{36}{8} = \\dfrac{9}{2}$ .', check: { kind: 'cross', left: ['x', 12], right: [3, 8], claim: [9, 2] } },
  { n: 9, skill: 'talis', level: 3, text: 'المستقيمان (BM) و (CN) متقاطعان في A، والنقطتان M و N من الجهة الأخرى للنقطة A، و (MN)//(BC). إذا كان AM = 2 و AB = 7 و AN = 3 فإن $AC = \\dfrac{21}{2}$ .', answer: true, why: 'خاصية طالس تصحّ في هذه الوضعية أيضًا: $\\dfrac{2}{7} = \\dfrac{3}{AC}$ ، ومنه $AC = \\dfrac{3 \\times 7}{2} = \\dfrac{21}{2}$ .', check: { kind: 'thales', part: 2, whole: 7, other: 3, claim: [21, 2] } },
  { n: 10, skill: 'kasr', level: 3, text: 'من التناسب $\\dfrac{6}{x} = \\dfrac{9}{4}$ نستنتج أن $x = \\dfrac{27}{2}$ .', answer: false, why: 'الجداء المتصالب: $9 \\times x = 6 \\times 4 = 24$ ، ومنه $x = \\dfrac{24}{9} = \\dfrac{8}{3}$ .', check: { kind: 'cross', left: [6, 'x'], right: [9, 4], claim: [27, 2] } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
