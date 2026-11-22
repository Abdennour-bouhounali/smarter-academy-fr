import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA SYNTHÈSE — l'ÉCHELLE de dix affirmations bâtie sur les trois leçons de l'unité (décisions S, 2026-11-10 : une synthèse diagnostique
 * ce que la وضعية mobilise — l'unité elle-même). Trois كفاءات en cycle : talis « خاصية طالس وحساب الأطوال » (1 → 4 → 7 → 10, à réviser dans
 * `talis-hisab-atwal`), aksiya « الخاصية العكسية وإثبات التوازي » (2 → 5 → 8, `aksiya-talis`), inshaat « تقسيم قطعة » (3 → 6 → 9,
 * `inshaat-talis`) — les trois leçons sont des prérequis du catalogue : « راجع » n'est jamais vide. De très facile (énoncés de règles, les trois
 * premières VRAIES) à plus difficile (calculs). Les sept affirmations d'avant restent dans content/textbook.js (PREP_ITEMS) comme source.
 * `check` (recalculé en fractions exactes par content/prep.test.js) :
 *   { kind: 'rule', truth }                                   — un énoncé de règle (niveau 1)
 *   { kind: 'prop', a, b, c, claim }                          — a / b = claim / c (Thalès) : vrai ⇔ a·c = b·claim
 *   { kind: 'ratios', a, b, c, d, sameOrder }                 — a/b et c/d et l'ordre des points : (MN)//(BC) ⇔ a·d = b·c ET même ordre
 *   { kind: 'share', total, parts, claim }                    — une part d'un partage égal : vrai ⇔ parts·claim = total
 *   { kind: 'rest', num, den, total, claim }                  — M de [AB] avec AM/AB = num/den : MB = claim ⇔ den·claim = (den − num)·total
 * Aucun nombre de la وضعية de l'unité ni du défi 🏆 (content/forbidden.js).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'talis', level: 1, text: 'ABC مثلث، M من $[AB]$ و N من $[AC]$ و $(MN) \\parallel (BC)$ . إذن $\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$ .', answer: true,
    why: 'المثلثان AMN و ABC في وضعية طالس: أطوال أضلاعهما متناسبة.', check: { kind: 'rule', truth: true } },
  { n: 2, skill: 'aksiya', level: 1, text: 'لنُثبت أنّ مستقيمين متوازيان، نستعمل الخاصية العكسية لخاصية طالس.', answer: true,
    why: 'نسبتان متساويتان ونقط بالترتيب نفسه تعطيان التوازي: هذه هي الخاصية العكسية.', check: { kind: 'rule', truth: true } },
  { n: 3, skill: 'inshaat', level: 1, text: 'لتقسيم قطعة إلى 3 قطع متقايسة، نعيّن 3 قطع متقايسة على نصف مستقيم مساعد، ثم نرسم مستقيمات متوازية.', answer: true,
    why: 'المستقيمات المتوازية تنقل تساوي القطع من نصف المستقيم المساعد إلى القطعة (خاصية طالس).', check: { kind: 'rule', truth: true } },
  { n: 4, skill: 'talis', level: 2, text: '$(MN) \\parallel (BC)$ و $AM = 3$ و $AB = 5$ و $AC = 25$ . إذن $AN = 15$ .', answer: true,
    why: '$\\dfrac{AN}{AC} = \\dfrac{AM}{AB}$ ، ومنه $AN = \\dfrac{3 \\times 25}{5} = 15$ .', check: { kind: 'prop', a: '3', b: '5', c: '25', claim: '15' } },
  { n: 5, skill: 'aksiya', level: 2, text: '$\\dfrac{AM}{AB} = \\dfrac{2}{5}$ و $\\dfrac{AN}{AC} = \\dfrac{3}{8}$ ، والنقط بالترتيب نفسه. إذن $(MN) \\parallel (BC)$ .', answer: false,
    why: 'الجداءان المتصالبان $2 \\times 8 = 16$ و $5 \\times 3 = 15$ مختلفان: النسبتان غير متساويتين، فالمستقيمان غير متوازيين.', check: { kind: 'ratios', a: '2', b: '5', c: '3', d: '8', sameOrder: true } },
  { n: 6, skill: 'inshaat', level: 2, text: 'قطعة طولها 15 قُسمت إلى 5 قطع متقايسة. طول كل قطعة 3 .', answer: true,
    why: '$15 \\div 5 = 3$ .', check: { kind: 'share', total: '15', parts: '5', claim: '3' } },
  { n: 7, skill: 'talis', level: 2, text: '$(MN) \\parallel (BC)$ و $AM = 2$ و $AB = 3$ و $BC = 39$ . إذن $MN = 13$ .', answer: false,
    why: '$\\dfrac{MN}{BC} = \\dfrac{AM}{AB}$ ، ومنه $MN = \\dfrac{2 \\times 39}{3} = 26$ . العدد 13 يأتي من قطعة لا من ضلع.', check: { kind: 'prop', a: '2', b: '3', c: '39', claim: '13' } },
  { n: 8, skill: 'aksiya', level: 3, text: 'A بين M و B ، و A بين N و C ، حيث $AM = 2$ و $AB = 5$ و $AN = 5$ و $AC = 12{,}5$ . إذن $(MN) \\parallel (BC)$ .', answer: true,
    why: '$2 \\times 12{,}5 = 25$ و $5 \\times 5 = 25$ : النسبتان متساويتان، والنقط بالترتيب نفسه (A بين النقطتين في الحالتين).', check: { kind: 'ratios', a: '2', b: '5', c: '5', d: '12,5', sameOrder: true } },
  { n: 9, skill: 'inshaat', level: 3, text: 'M من $[AB]$ حيث $\\dfrac{AM}{AB} = \\dfrac{2}{5}$ و $AB = 55$ . إذن $MB = 22$ .', answer: false,
    why: '$AM = \\dfrac{2}{5} \\times 55 = 22$ ، ومنه $MB = 55 - 22 = 33$ .', check: { kind: 'rest', num: '2', den: '5', total: '55', claim: '22' } },
  { n: 10, skill: 'talis', level: 3, text: '$(AB) \\parallel (CD)$ ، والمستقيمان $(AC)$ و $(BD)$ يتقاطعان في O ، حيث $OA = 20$ و $OC = 50$ و $AB = 34$ . إذن $CD = 85$ .', answer: true,
    why: 'المثلثان OAB و OCD في وضعية طالس: $\\dfrac{CD}{AB} = \\dfrac{OC}{OA}$ ، ومنه $CD = \\dfrac{34 \\times 50}{20} = 85$ .', check: { kind: 'prop', a: '50', b: '20', c: '34', claim: '85' } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** La leçon de l'unité à réviser pour chaque كفاءة (Module00Astaidd › skills, carte « راجع ») — les trois sont des prérequis du catalogue. */
export const PREP_LESSON = { talis: 'talis-hisab-atwal', aksiya: 'aksiya-talis', inshaat: 'inshaat-talis' };
