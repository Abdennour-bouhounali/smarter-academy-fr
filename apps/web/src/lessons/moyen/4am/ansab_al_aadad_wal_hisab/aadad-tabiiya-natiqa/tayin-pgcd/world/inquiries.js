/**
 * What this lesson PLAYS of the world's experiments: one bench. No forge of the lesson opens on an experiment — the three
 * keys are met on the islands (owner, 2026-11-19; GAME_WORLD.md §2ter-1, forges.js) — but the WORKSHOP of island A has a
 * bench (`story.js`, segment `g32`, `workshop.bench`): the `lists` kind on the two gaps of the convoy « lists »
 * (GAME_WORLD.md « Spec shape of `lists` »; screen `divisorIsles/InquiryLists.jsx`, logic `lists.js`).
 *
 * The bench gives FACTS and stops there (`crown: false`): he types planks and the world writes, for each, whether it fills
 * the gap and the plank that pairs with it; it closes a list that holds every plank; he taps the planks of one list he
 * finds in the other and the world lays each on both gaps. It ends on the two lists and their links — it never asks the
 * longest, never points at a plank to make. Which plank to make is HIS: the purse decides on the islands, and the mirror
 * of island C asks him to write how he knew (forge 📋).
 * No sentence here names a divisor, a list « common », the greatest, nor the procedure (`inquiries.test.js`).
 */
import { NUMBERS, emptyCells, listAr } from './math';

const [W1, W2] = NUMBERS.lists.gaps;

export const LISTS_BENCH = {
  kind: 'lists',
  crown: false,
  rounds: [{ a: W1, b: W2 }],
  text: {
    lead: (a, b) => `دفتر الورشة: الهوّة الأولى ${a} خانة، والثانية ${b} خانة.`,
    goal: (a, b) => `اكتب الألواح التي تملأ ${a}، ثمّ التي تملأ ${b}، ثمّ اضغط ما تجده في السطرين.`,
    listLabel: (n) => `ألواح تملأ ${n}`,
    buildAsk: ({ n }) => `اكتب طول لوح، والدفتر يضعه على الهوّة ${n}.`,
    unit: 'خانة',
    lay: 'ضع اللوح',
    claim: 'السطر كامل',
    bound: ({ n }) => `اكتب طولًا من 1 إلى ${n}.`,
    fills: ({ n, d, q }) => `$${n} = ${d} \\times ${q}$: اللوح ${d} يملأ ${n}، واللوح ${q} يملؤها أيضًا.`,
    again: ({ n, d, q }) => `$${n} = ${d} \\times ${q}$: اللوحان ${d} و ${q} في السطر من قبل.`,
    misses: ({ n, d, q, r }) => `$${n} = ${d} \\times ${q} + ${r}$: ${emptyCells(r)}.`,
    missing: ({ n, d, q }) => `$${n} = ${d} \\times ${q}$: اللوح ${d} يملأ ${n}، ولم يكن في السطر.`,
    closed: ({ n, list }) => `كلّ لوح يملأ ${n} في السطر الآن: ${listAr(list)}.`,
    go: 'التالي',
    linkAsk: ({ a, b }) => `اضغط كلّ لوح تجده في سطر ${a} وفي سطر ${b}.`,
    allLinked: 'ضغطتها كلّها',
    linked: ({ a, b, d, qa, qb }) => `$${a} = ${d} \\times ${qa}$ و $${b} = ${d} \\times ${qb}$.`,
    unlinked: ({ d, n, q, r }) => `$${n} = ${d} \\times ${q} + ${r}$: اللوح ${d} لا يملأ ${n}.`,
    linkMissing: ({ a, b, d, qa, qb }) =>
      `$${a} = ${d} \\times ${qa}$ و $${b} = ${d} \\times ${qb}$: اللوح ${d} في السطرين.`,
    linksDone: ({ links }) => `في السطرين معًا: ${listAr(links)}. ارجع إلى الورشة متى شئت.`,
    foundLine: (r) => `${r.a} و ${r.b}: ${listAr(r.links)}`,
    next: 'التالي',
    done: 'إلى الورشة',
  },
};
