import { addition } from '../../_unit/unitMeta.js';

/**
 * « أستعدّ » DE LA PLATEFORME — 10 affirmations, de TRÈS FACILE à plus difficile (règle des pilotes, propriétaire 2026-11-07 ; rollout de l'unité 4,
 * leçon 3, 2026-11-11 ; conseil du 2026-11-11, verdict L3.7). Deux كفاءات en alternance, toutes deux des `requires` du réseau :
 *   tartib   « ترتيب الأعداد النسبية على مستقيم مدرّج »  (1 → 3 → 5 → 7 → 9, à réviser dans `muqarana-nisbiya`, 2AM) ;
 *   amaliyat « العمليات على طرفي متباينة »               (2 → 4 → 6 → 8 → 10, à réviser dans `mutabayinat-amaliyat`, 3AM).
 * « اختبار قيمة » n'est PAS diagnostiquée : c'est le P1 de cette leçon. Les items 8 et 10 sont des متباينات NUMÉRIQUES (la propriété de 3AM, pas
 * l'étape de la مسألة : L3.7). Les six énoncés d'avant restent dans content/textbook.js (PREP_ITEMS).
 * `check` (recalculé par content/prep.test.js) : { kind: 'cmp' | 'op' | 'between' | 'forall' } — voir `truthOf`.
 */
export const PREP_LADDER = [
  { n: 1, skill: 'tartib', level: 1, text: 'على مستقيم مدرّج، يقع العدد $-4$ على يسار العدد 1 .', answer: true, why: '$-4 < 1$ : الأصغر على اليسار.', check: { kind: 'cmp', l: -4, rel: '<', r: 1 } },
  { n: 2, skill: 'amaliyat', level: 1, text: 'نضيف 6 إلى طرفي المتباينة $2 < 9$ فنحصل على $8 < 15$ .', answer: true, why: '$2 + 6 = 8$ و $9 + 6 = 15$ والاتجاه يبقى: $8 < 15$ .', check: { kind: 'op', l: 2, rel: '<', r: 9, op: '+', k: 6, claim: { l: 8, rel: '<', r: 15 } } },
  { n: 3, skill: 'tartib', level: 1, text: '$-7 < -2$', answer: true, why: '$-7$ على يسار $-2$ فهو الأصغر.', check: { kind: 'cmp', l: -7, rel: '<', r: -2 } },
  { n: 4, skill: 'amaliyat', level: 2, text: 'نطرح 10 من طرفي المتباينة $6 < 8$ فنحصل على $-4 > -2$ .', answer: false, why: '$6 - 10 = -4$ و $8 - 10 = -2$ لكنّ الطرح يحافظ على الاتجاه: $-4 < -2$ .', check: { kind: 'op', l: 6, rel: '<', r: 8, op: '-', k: 10, claim: { l: -4, rel: '>', r: -2 } } },
  { n: 5, skill: 'tartib', level: 2, text: 'العدد $-1{,}5$ أصغر من العدد $-1{,}7$ .', answer: false, why: '$-1{,}7 < -1{,}5$ : $-1{,}7$ أبعد عن الصفر نحو اليسار فهو الأصغر.', check: { kind: 'cmp', l: -1.5, rel: '<', r: -1.7 } },
  { n: 6, skill: 'amaliyat', level: 2, text: 'نضرب طرفي المتباينة $-2 < 6$ في 4 فنحصل على $-8 < 24$ .', answer: true, why: '$-2 \\times 4 = -8$ و $6 \\times 4 = 24$ والضرب في عدد موجب يحافظ على الاتجاه.', check: { kind: 'op', l: -2, rel: '<', r: 6, op: '*', k: 4, claim: { l: -8, rel: '<', r: 24 } } },
  { n: 7, skill: 'tartib', level: 3, text: 'العدد $-\\dfrac{9}{2}$ محصور بين $-5$ و $-4$ .', answer: true, why: '$-\\dfrac{9}{2} = -4{,}5$ و $-5 < -4{,}5 < -4$ .', check: { kind: 'between', x: -4.5, lo: -5, hi: -4 } },
  { n: 8, skill: 'amaliyat', level: 3, text: 'نضرب طرفي المتباينة $2 < 5$ في $-1$ فنحصل على $-2 < -5$ .', answer: false, why: '$2 \\times (-1) = -2$ و $5 \\times (-1) = -5$ ، و $-2 > -5$ : الضرب في عدد سالب يغيّر الاتجاه.', check: { kind: 'op', l: 2, rel: '<', r: 5, op: '*', k: -1, claim: { l: -2, rel: '<', r: -5 } } },
  { n: 9, skill: 'tartib', level: 3, text: 'كل عدد أصغر من $-6$ هو أيضًا أصغر من $-8$ .', answer: false, why: 'العدد $-7$ أصغر من $-6$ لكنّه أكبر من $-8$ .', check: { kind: 'forall', counter: -7, a: -6, b: -8 } },
  { n: 10, skill: 'amaliyat', level: 3, text: 'نقسم طرفي المتباينة $-20 < 8$ على $-4$ فنحصل على $5 > -2$ .', answer: true, why: '$-20 \\div (-4) = 5$ و $8 \\div (-4) = -2$ ، و $5 > -2$ : القسمة على عدد سالب غيّرت الاتجاه.', check: { kind: 'op', l: -20, rel: '<', r: 8, op: '/', k: -4, claim: { l: 5, rel: '>', r: -2 } } },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

const REL = { '<': (a, b) => a < b, '>': (a, b) => a > b };
const FLIP = { '<': '>', '>': '<' };
const APPLY = { '+': (a, k) => a + k, '-': (a, k) => a - k, '*': (a, k) => a * k, '/': (a, k) => a / k };

/** La vérité d'une affirmation, recalculée. */
export function truthOf(c) {
  if (c.kind === 'cmp') return REL[c.rel](c.l, c.r);
  if (c.kind === 'between') return c.lo < c.x && c.x < c.hi;
  if (c.kind === 'forall') return !(c.counter < c.a && !(c.counter < c.b));
  const l = APPLY[c.op](c.l, c.k); const r = APPLY[c.op](c.r, c.k);
  const rel = (c.op === '*' || c.op === '/') && c.k < 0 ? FLIP[c.rel] : c.rel;
  return c.claim.l === l && c.claim.r === r && c.claim.rel === rel;
}
