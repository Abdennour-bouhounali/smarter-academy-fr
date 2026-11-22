import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 9,
 * leçon 2, 2026-11-10 ; conseil du 2026-11-10). Les deux كفاءات alternent : kasr « تساوي كسرين » (1 → 3 → 5 → 7 → 9, à réviser dans
 * `tasawi-muqaranat-kasrayn`, 3AM) et talis « خاصية طالس وترتيب النقط » (2 → 4 → 6 → 8 → 10, à réviser dans `talis-hisab-atwal`). Écrites par la
 * plateforme (indépendance du manuel) : les six énoncés d'avant restent dans content/textbook.js (PREP_ITEMS).
 * `check` (recalculé par content/prep.test.js) :
 *   { kind: 'fracEq', a, b, c, d }             — « a/b = c/d » (vrai ⇔ a·d = b·c)
 *   { kind: 'between', claim }                 — l'ordre de trois points : `claim` est la vérité d'une définition (« X entre Y et Z ⇔ Y et Z
 *                                                de part et d'autre de X »), écrite à la main et justifiée par `why`
 *   { kind: 'thales', part, whole, other, claim }  — « part/whole = x/other ⇒ x = claim » (x = part·other/whole)
 * Aucun nombre de la مسألة (80, 100, 24, 30, 36, 44–46, 3/10, 9/20, 23/50, 2400, 3600, 3680) ni des RAPPORTS de la ورقة زميل (6/15, 6/9, 4/10 — ses nombres seuls restent permis : le test scanne les rapports).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'kasr', level: 1, text: '$\\dfrac{2}{6} = \\dfrac{1}{3}$', answer: true, why: 'نقسم البسط والمقام على 2: $\\dfrac{2}{6} = \\dfrac{1}{3}$ .', check: { kind: 'fracEq', a: 2, b: 6, c: 1, d: 3 } },
  { n: 2, skill: 'talis', level: 1, text: 'النقط A و B′ و B على مستقيم واحد، و B′ بين A و B: إذن الترتيب على المستقيم هو A ثم B′ ثم B.', answer: true, why: 'B′ بين A و B تعني أن B′ في الوسط: A ، B′ ، B .', check: { kind: 'between', claim: true } },
  { n: 3, skill: 'kasr', level: 1, text: '$\\dfrac{4}{7} = \\dfrac{12}{21}$', answer: true, why: 'الجداءان المتصالبان: $4 \\times 21 = 84$ و $7 \\times 12 = 84$ ، فالكسران متساويان.', check: { kind: 'fracEq', a: 4, b: 7, c: 12, d: 21 } },
  { n: 4, skill: 'talis', level: 2, text: 'ABC مثلث، M من [AB] و N من [AC] و (MN)//(BC). إذا كان AM = 2 و AB = 6 و AC = 9 فإن AN = 3.', answer: true, why: 'حسب خاصية طالس $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ أي $\\dfrac{2}{6} = \\dfrac{AN}{9}$ ، ومنه $AN = 3$ .', check: { kind: 'thales', part: 2, whole: 6, other: 9, claim: 3 } },
  { n: 5, skill: 'kasr', level: 2, text: '$\\dfrac{2}{5} = \\dfrac{3}{7}$', answer: false, why: '$2 \\times 7 = 14$ و $5 \\times 3 = 15$ : الجداءان مختلفان، فالكسران غير متساويين.', check: { kind: 'fracEq', a: 2, b: 5, c: 3, d: 7 } },
  { n: 6, skill: 'talis', level: 2, text: 'A بين B′ و B. إذن B′ و B في الجهة نفسها من A.', answer: false, why: 'A بين B′ و B يعني أن B′ و B في جهتين مختلفتين من A.', check: { kind: 'between', claim: false } },
  { n: 7, skill: 'kasr', level: 2, text: '$\\dfrac{5}{9} = \\dfrac{7}{12}$', answer: false, why: '$5 \\times 12 = 60$ و $9 \\times 7 = 63$ : الجداءان مختلفان، فالكسران غير متساويين.', check: { kind: 'fracEq', a: 5, b: 9, c: 7, d: 12 } },
  { n: 8, skill: 'talis', level: 3, text: 'ABC مثلث، M من [AB] و N من [AC] و (MN)//(BC). إذا كان AM = 3 و AB = 9 و MN = 4 فإن BC = 12.', answer: true, why: 'حسب خاصية طالس $\\dfrac{AM}{AB} = \\dfrac{MN}{BC}$ أي $\\dfrac{3}{9} = \\dfrac{4}{BC}$ ، ومنه $BC = 12$ .', check: { kind: 'thales', part: 3, whole: 9, other: 4, claim: 12, inverse: true } },
  { n: 9, skill: 'kasr', level: 3, text: '$\\dfrac{6}{14} = \\dfrac{9}{21}$', answer: true, why: '$6 \\times 21 = 126$ و $14 \\times 9 = 126$ : الجداءان متساويان، فالكسران متساويان.', check: { kind: 'fracEq', a: 6, b: 14, c: 9, d: 21 } },
  { n: 10, skill: 'talis', level: 3, text: 'M و N من الجهة الأخرى للنقطة A، و (MN)//(BC)، و $\\dfrac{AM}{AB} = \\dfrac{2}{5}$ و AN = 3. إذن AC = 6.', answer: false, why: '$\\dfrac{2}{5} = \\dfrac{3}{AC}$ ومنه $AC = \\dfrac{3 \\times 5}{2} = 7{,}5$ ، لا 6.', check: { kind: 'thales', part: 2, whole: 5, other: 3, claim: 6, inverse: true } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
