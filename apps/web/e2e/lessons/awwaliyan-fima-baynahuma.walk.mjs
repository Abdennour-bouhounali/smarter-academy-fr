// The walks of lesson 7 `awwaliyan-fima-baynahuma` — a DESCRIPTOR for lib/lessonWalk (README there): only what the
// lesson's files cannot say — the walk's own arithmetic of each verdict, and the words no screen may show before their
// tablet.
// Run: E2E_SIZE=1366x768 node apps/web/e2e/lesson.mjs awwaliyan-fima-baynahuma [story|hub|trainer|board|launch|sitting|all] [outDir]
import { gcd, divisions } from '../lib/lessonWalk.mjs';

const nums = (s) => (String(s).match(/\d+/g) ?? []).map(Number);
const coprime = (c) => gcd(c.A, c.B) === 1; // the three forges ask the same question of a pair
const yesNo = (x, y) => (gcd(x, y) === 1 ? 'yes' : 'no');
/** The smallest common divisor other than 1 of x and y (a witness). */
const witness = (x, y) => {
  for (let d = 2; d <= Math.min(x, y); d += 1) if (x % d === 0 && y % d === 0) return d;
  return null;
};
/** Row i of Euclid's divisions as the last step names its boxes: a_i, b_i, q_i, r_i. */
const row = (D, i) => ({ [`a${i}`]: D[i - 1].a, [`b${i}`]: D[i - 1].b, [`q${i}`]: D[i - 1].q, [`r${i}`]: D[i - 1].r });
/** « a = b × [q] + [r] » of a trainer form, then the PGCD. */
const division = (q) => ({ q: Math.floor(q.a / q.b), r: q.a % q.b, g: gcd(q.a, q.b) });

export default {
  id: 'awwaliyan-fima-baynahuma',
  uid: 9750,
  forbidden: {
    awwaliyan: ['فيما بينهما', 'أوّليّان', 'أوّليّين'],
    'ithbat-awwaliyan': ['نثبت', 'خوارزمية إقليدس'],
    'shahid-wahid': ['يكفي', 'قاسم مشترك واحد'],
  },
  benchForbidden: ['فيما بينهما', 'الوحيد', 'PGCD', 'مشترك', 'الأكبر', 'أطول'],
  story: { wrongFirst: ['only', 'witness'], reloadOn: 7 },
  truth: { awwaliyan: coprime, 'ithbat-awwaliyan': coprime, 'shahid-wahid': coprime },
  use: {
    awwaliyan: (u) => ({ g: gcd(u.A, u.B), verdict: yesNo(u.A, u.B) }),
    'ithbat-awwaliyan': (u) => {
      const D = divisions(u.A, u.B);
      return { q1: D[0].q, r1: D[0].r, ...row(D, 2), ...row(D, 3), g: gcd(u.A, u.B), verdict: yesNo(u.A, u.B) };
    },
    'shahid-wahid': (u) => {
      const d = witness(u.A, u.B);
      return { d, qa: u.A / d, e: d, qb: u.B / d, verdict: yesNo(u.A, u.B) };
    },
  },
  dash: (say, n) => {
    const [a, b] = nums(say);
    if (/PGCD/.test(say)) return n === gcd(a, b);
    if (/مشترك/.test(say)) return n > 1 && a % n === 0 && b % n === 0;
    return n >= 1 && gcd(a, n) === 1; // « عدد أوّليّ مع a فيما بينهما »
  },
  gate: {
    pgcd: (x, n) => n === gcd(x.a, x.b),
    witness: (x, n) => n > 1 && x.a % n === 0 && x.b % n === 0,
    coprimeWith: (x, n) => n >= 1 && gcd(x.a, n) === 1,
  },
  solve: {
    hukm: (q) => ({ g: gcd(q.a, q.b), verdict: yesNo(q.a, q.b) }),
    burhan: division,
    nafi: division,
    shahid: (q) => ({ d: witness(q.a, q.b) }),
  },
  /** « صحيح أم خطأ؟ »: what the statement says of its pair, against the pair's PGCD. */
  statement: (t) => {
    const m = /العدد(?:ان|ين) (\d+) و (\d+)/.exec(t);
    if (!m) throw new Error(`the walk cannot read the statement « ${t} »`);
    const one = gcd(+m[1], +m[2]) === 1;
    return /ليسا/.test(t) ? !one : one;
  },
  // 645 = 2 × 322 + 1 and 410 = 3 × 136 + 2: the world writes them when he tries 2 and 3 on the witness convoy
  ownNumbers: [322, 136],
  steps: {
    /**
     * The seconds he waits on the long gap 645 with the plank 2 (refused: 322 planks then a piece) — the library times
     * the planks it plays (3 on 645 by `wrongFirst`, 5 on 645 and 410, the last bridge); this one it would not play.
     */
    'forge:ithbat-awwaliyan:after': async ({ w, W, L }) => {
      const segs = L.lesson.story.segments;
      const h = segs.findIndex((s) => s.convoy === 'witness');
      const a = segs[h].a;
      await W.take(2);
      const t = await W.fire(h, async () => {
        w.expect(await W.until((r) => r.verdict != null, 60), `the world shows its verdict on ${a}`);
        const v = (await W.road()).verdict;
        w.check(
          !v.holds && v.r === a % 2,
          `${a} = 2 × ${Math.floor(a / 2)} + ${a % 2}: refused (${JSON.stringify(v)})`,
        );
        return 0;
      });
      console.log(`WAIT  2 on ${a} (${Math.floor(a / 2)} planks, refused): ${t.toFixed(1)} s`);
    },
  },
  launch: {
    scenario: 'one',
    tool: {
      item: '4am.m1.r03',
      name: 'القاسم المشترك الأكبر لعددين',
      year: 'من السنة الرابعة متوسط',
      home: 'القاسم المشترك الأكبر',
      memo: 4,
      // the second easy question: the level-1 « common » form, a SORT of three numbers (never the division's flag)
      second: 'sort',
      // the very first question (`families.js › pgcdPair`, first): g 2–5, numbers 4–15
      firstOk: (q) => q.calc?.op === 'pgcd' && Math.max(q.calc.x, q.calc.y) <= 15,
    },
  },
};
