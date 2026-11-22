import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 9,
 * leçon 1, 2026-11-10 ; conseil du 2026-11-10). Les deux كفاءات alternent : kasr « تساوي كسرين والجداء المتصالب » (1 → 3 → 5 → 7 → 9, à réviser
 * dans `tasawi-muqaranat-kasrayn`, 3AM — la leçon qui enseigne le test d'égalité de deux fractions) et tanasub « التناسبية والرابع المتناسب »
 * (2 → 4 → 6 → 8 → 10, à réviser dans `rabi-mutanasib`, 2AM — la leçon qui enseigne le quatrième proportionnel). Les deux leçons sont PUBLIÉES
 * (jamais une leçon `coming_soon` : « مستقيم المنتصفين », 3AM, ne l'est pas encore — ses énoncés restent dans content/textbook.js).
 * AUCUNE affirmation n'a besoin de Thalès : « أستعدّ » ne teste que des acquis ANTÉRIEURS. Écrites par la plateforme : les six énoncés d'avant
 * restent dans content/textbook.js (PREP_ITEMS) comme source.
 * `check` (recalculé en fractions exactes par content/prep.test.js) :
 *   { kind: 'cross', left: [a, b], right: [c, d], claim }   — la proportion a/b = c/d dont UN terme est 'x' ; l'affirmation dit x = claim
 *   { kind: 'fracEq', a, b, c, d }                          — « a/b = c/d » (vrai ⇔ a·d = b·c)
 *   { kind: 'fourth', a, b, c, claim }                      — situation proportionnelle : a ↦ b, donc c ↦ claim (vrai ⇔ a·claim = b·c)
 *   { kind: 'table', pairs: [[a, b], [c, d]], claim }       — « c'est un tableau de proportionnalité » (vrai ⇔ a·d = b·c)
 * Les nombres sont des textes à virgule (« 1,4 »). Aucun nombre de la مسألة ni du تحدّ de la synthèse (content/forbidden.js).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'kasr', level: 1, text: 'من المساواة $\\dfrac{x}{14} = \\dfrac{1}{7}$ ينتج أن $x = 2$ .', answer: true, why: 'الجداء المتصالب: $7 \\times x = 14 \\times 1 = 14$ ، ومنه $x = 2$ .', check: { kind: 'cross', left: ['x', '14'], right: ['1', '7'], claim: '2' } },
  { n: 2, skill: 'tanasub', level: 1, text: 'في وضعية تناسبية: ثمن 2 kg من التمر هو 700 دج، إذن ثمن 4 kg هو 1400 دج.', answer: true, why: 'الكتلة تضاعفت، فيتضاعف الثمن: $700 \\times 2 = 1400$ دج.', check: { kind: 'fourth', a: '2', b: '700', c: '4', claim: '1400' } },
  { n: 3, skill: 'kasr', level: 1, text: 'بما أن $1{,}5 \\times 28 = 2{,}1 \\times 20$ فإن $\\dfrac{1{,}5}{2{,}1} = \\dfrac{20}{28}$ .', answer: true, why: 'الجداءان المتصالبان متساويان (كلاهما 42)، فالكسران متساويان.', check: { kind: 'fracEq', a: '1,5', b: '2,1', c: '20', d: '28' } },
  { n: 4, skill: 'tanasub', level: 2, text: 'الجدول $\\begin{array}{|c|c|} \\hline 2 & 5 \\\\ \\hline 3{,}4 & 6{,}4 \\\\ \\hline \\end{array}$ جدول تناسبية لأننا نضيف $1{,}4$ في كل عمود.', answer: false, why: 'في جدول تناسبية نضرب في العدد نفسه: $3{,}4 \\div 2 = 1{,}7$ لكن $6{,}4 \\div 5 = 1{,}28$ . إضافة العدد نفسه لا تعطي جدول تناسبية.', check: { kind: 'table', pairs: [['2', '3,4'], ['5', '6,4']], claim: true } },
  { n: 5, skill: 'kasr', level: 2, text: 'من المساواة $\\dfrac{1{,}4}{x} = \\dfrac{3{,}5}{2{,}5}$ ينتج أن $x = 3{,}5$ .', answer: false, why: 'الجداء المتصالب: $3{,}5 \\times x = 1{,}4 \\times 2{,}5 = 3{,}5$ ، ومنه $x = 1$ .', check: { kind: 'cross', left: ['1,4', 'x'], right: ['3,5', '2,5'], claim: '3,5' } },
  { n: 6, skill: 'tanasub', level: 2, text: 'في وضعية تناسبية: 3 m من القماش بـ 750 دج، إذن 7 m من القماش نفسه بـ 1750 دج.', answer: true, why: 'ثمن المتر الواحد $750 \\div 3 = 250$ دج، و $250 \\times 7 = 1750$ دج.', check: { kind: 'fourth', a: '3', b: '750', c: '7', claim: '1750' } },
  { n: 7, skill: 'kasr', level: 3, text: 'من المساواة $\\dfrac{2{,}8}{x} = \\dfrac{0{,}7}{1{,}3}$ ينتج أن $x = 5{,}2$ .', answer: true, why: 'الجداء المتصالب: $0{,}7 \\times x = 2{,}8 \\times 1{,}3 = 3{,}64$ ، ومنه $x = 5{,}2$ .', check: { kind: 'cross', left: ['2,8', 'x'], right: ['0,7', '1,3'], claim: '5,2' } },
  { n: 8, skill: 'tanasub', level: 3, text: 'آلة تطبع 42 صفحة في 3 دقائق. بالوتيرة نفسها تطبع 77 صفحة في 5 دقائق.', answer: false, why: 'في الدقيقة الواحدة $42 \\div 3 = 14$ صفحة، وفي 5 دقائق $14 \\times 5 = 70$ صفحة، لا 77.', check: { kind: 'fourth', a: '3', b: '42', c: '5', claim: '77' } },
  { n: 9, skill: 'kasr', level: 3, text: 'من المساواة $\\dfrac{x}{4{,}2} = \\dfrac{5}{7}$ ينتج أن $x = 3$ .', answer: true, why: 'الجداء المتصالب: $7 \\times x = 4{,}2 \\times 5 = 21$ ، ومنه $x = 3$ .', check: { kind: 'cross', left: ['x', '4,2'], right: ['5', '7'], claim: '3' } },
  { n: 10, skill: 'tanasub', level: 3, text: 'في جدول تناسبية العدد 14 يوافق 21. إذن العدد 22 يوافق 29.', answer: false, why: 'نضرب في العدد نفسه: $21 \\div 14 = 1{,}5$ ، و $22 \\times 1{,}5 = 33$ . العدد 29 يأتي من إضافة 7، والإضافة لا تحفظ التناسب.', check: { kind: 'fourth', a: '14', b: '21', c: '22', claim: '29' } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));
