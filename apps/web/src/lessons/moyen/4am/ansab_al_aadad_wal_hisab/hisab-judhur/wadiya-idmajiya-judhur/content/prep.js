import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA SYNTHÈSE — l'ÉCHELLE de dix affirmations bâtie sur les leçons de l'unité (recette de la synthèse, point 3 ; pilote
 * `wadiya-idmajiya-talis`). Trois كفاءات en cycle : jidhr « الجذر التربيعي » (1 → 4 → 7 → 10, à réviser dans `jidhr-tarbii`), muadala « المعادلة
 * x² = a » (2 → 5 → 8, `muadalat-x-murabba`), kitaba « أبسط كتابة لجذر » (3 → 6 → 9, `tawzif-khawass-judhur`) — trois leçons de l'unité, « راجع »
 * n'est jamais vide. De très facile (énoncés de règles, les trois premières VRAIES) à plus difficile. Les six affirmations d'avant restent dans
 * content/textbook.js (PREP_ITEMS) comme source. `check` (recalculé par content/prep.test.js) :
 *   { kind: 'rule', truth }                  — un énoncé de règle
 *   { kind: 'sqrt', n, claim }               — « √n = claim »
 *   { kind: 'sqrtSquare', x, claim }         — « √(x²) = claim »
 *   { kind: 'sqrtEq', root, claim }          — « √x = root, donc x = claim »
 *   { kind: 'solutions', a, claim }          — « x² = a a pour solutions exactement claim »
 *   { kind: 'simplest', n, k, b }            — « k√b est la forme la plus simple de √n »
 * Aucun nombre de la زربية (le défi 🏆, la وضعية du module 7) ni d'une manche du module 7 (content/forbidden.js, content/mission.test.js).
 */
export const PREP_LADDER = [
  { n: 1, skill: 'jidhr', level: 1, text: 'الجذر التربيعي لعدد موجب $a$ هو العدد الموجب الذي مربّعه $a$.', answer: true,
    why: 'مثلًا $\\sqrt{25} = 5$ لأنّ 5 موجب و $5^2 = 25$.', check: { kind: 'rule', truth: true } },
  { n: 2, skill: 'muadala', level: 1, text: 'إذا كان $a$ عددًا موجبًا تمامًا، فللمعادلة $x^2 = a$ حلّان متعاكسان.', answer: true,
    why: 'الحلّان هما $\\sqrt{a}$ و $-\\sqrt{a}$: لهما المربّع نفسه $a$.', check: { kind: 'rule', truth: true } },
  { n: 3, skill: 'kitaba', level: 1, text: 'لكل عددين موجبين $a$ و $b$: $\\sqrt{a \\times b} = \\sqrt{a} \\times \\sqrt{b}$', answer: true,
    why: 'جذر جداء عددين موجبين هو جداء جذريهما: مثلًا $\\sqrt{4 \\times 9} = 2 \\times 3 = 6$.', check: { kind: 'rule', truth: true } },
  { n: 4, skill: 'jidhr', level: 2, text: '$\\sqrt{0{,}16} = 0{,}04$', answer: false,
    why: '$0{,}04^2 = 0{,}0016$ وليس $0{,}16$. أمّا $0{,}4^2 = 0{,}16$، إذن $\\sqrt{0{,}16} = 0{,}4$.', check: { kind: 'sqrt', n: 0.16, claim: 0.04 } },
  { n: 5, skill: 'muadala', level: 2, text: 'المعادلة $x^2 = 49$ تقبل حلّين هما 7 و $-7$.', answer: true,
    why: '$49 > 0$، و $7^2 = (-7)^2 = 49$.', check: { kind: 'solutions', a: 49, claim: [7, -7] } },
  { n: 6, skill: 'kitaba', level: 2, text: 'أبسط كتابة للعدد $\\sqrt{175}$ هي $5\\sqrt{7}$.', answer: true,
    why: '$175 = 25 \\times 7$ و 25 مربّع تامّ، و 7 لا يقبل القسمة على أيّ مربّع غير 1: $\\sqrt{175} = 5\\sqrt{7}$.', check: { kind: 'simplest', n: 175, k: 5, b: 7 } },
  { n: 7, skill: 'jidhr', level: 2, text: '$\\sqrt{(-5)^2} = -5$', answer: false,
    why: 'الجذر التربيعي عدد موجب: $(-5)^2 = 25$ و $\\sqrt{25} = 5$.', check: { kind: 'sqrtSquare', x: -5, claim: -5 } },
  { n: 8, skill: 'muadala', level: 3, text: 'المعادلة $x^2 = -16$ تقبل حلّين هما 4 و $-4$.', answer: false,
    why: '$4^2 = (-4)^2 = 16$ وليس $-16$: مربّع أيّ عدد موجب، فالمعادلة لا تقبل أيّ حلّ.', check: { kind: 'solutions', a: -16, claim: [4, -4] } },
  { n: 9, skill: 'kitaba', level: 3, text: 'أبسط كتابة للعدد $\\sqrt{162}$ هي $3\\sqrt{18}$.', answer: false,
    why: '18 يقبل التبسيط ($18 = 9 \\times 2$): أكبر مربّع يقسم 162 هو 81، إذن $\\sqrt{162} = \\sqrt{81 \\times 2} = 9\\sqrt{2}$.', check: { kind: 'simplest', n: 162, k: 3, b: 18 } },
  { n: 10, skill: 'jidhr', level: 3, text: 'إذا كان $\\sqrt{x} = 9$ فإنّ $x = 3$.', answer: false,
    why: '$\\sqrt{x} = 9$ يعني أنّ $x = 9^2 = 81$. أمّا 3 فهو الجذر التربيعي للعدد 9.', check: { kind: 'sqrtEq', root: 9, claim: 3 } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** La leçon de l'unité à réviser pour chaque كفاءة (Module00Astaidd › skills, carte « راجع ») — trois leçons de l'unité. */
export const PREP_LESSON = { jidhr: 'jidhr-tarbii', muadala: 'muadalat-x-murabba', kitaba: 'tawzif-khawass-judhur' };
