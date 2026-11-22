/**
 * « تعاونية الواحة » — PURE logic of the real-world practice game of « أرخبيل القواسم » (no three.js, no React).
 *
 * The student runs the packing depot of a cooperative. A MISSION is a short day of ORDERS; an order is a real case solved in
 * one to four STEPS (choose a crate, type a number); after a step the depot packs for real and shows what the choice does:
 * n = b × q + r, crates filled, items left on the floor. Seven kinds of order, one per idea of the lesson:
 *   fit      which crate leaves nothing?                      (divisor by the remainder)
 *   count    the client wants q equal full crates: capacity?  (divisor by the product)
 *   orders   one crate size in stock: which order can go?     (multiple of / divisible by / divisor of / divides)
 *   special  an order no usual crate fits: the two packings that always work (1 and the number itself)
 *   cost     two crate sizes, one fits: crates, then the invoice          (exam case)
 *   profit   two trays fit: which packaging earns more?                    (exam case)
 *   trip     trucks: the remainder MEANS one more truck and empty places   (exam case)
 *   share    another world: sweets shared FAIRLY between friends, then with the neighbours so that nothing is left
 *   tiling   another world: a tiler who cuts no tile and wastes none — the tile, the whole floor, the boxes to buy
 * A step never asks for a number the packing has just SHOWN (the world counted it in front of the student).
 * `judge` is the one place that says whether a step is right and, when it is not, WHY — with the division the choice produces,
 * never the answer.
 */
import { divide } from './logic';
import { divisionTip, productTip } from '../kit/tips';

const int = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
const pick = (rand, list) => list[Math.floor(rand() * list.length)];
const shuffle = (rand, list) => {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Arabic agreement of a counted noun: forms = [one, two, plural (3–10), singular accusative (11+)]. */
export const count = (forms, n) =>
  n === 1 ? forms[0] : n === 2 ? forms[1] : n >= 3 && n <= 10 ? `${n} ${forms[2]}` : `${n} ${forms[3]}`;
const BOX = ['صندوق واحد', 'صندوقان', 'صناديق', 'صندوقًا'];
const TRAY = ['طبق واحد', 'طبقان', 'أطباق', 'طبقًا'];
const TRUCK = ['شاحنة واحدة', 'شاحنتان', 'شاحنات', 'شاحنة'];
const PLACE = ['مكان واحد', 'مكانان', 'أماكن', 'مكانًا'];
const KIDS = ['طفل واحد', 'طفلان', 'أطفال', 'طفلًا'];
const TILE = ['بلاطة واحدة', 'بلاطتان', 'بلاطات', 'بلاطة'];
const PACK = ['علبة واحدة', 'علبتان', 'علب', 'علبة'];
/** The legend of the equality a = b × q + r in each kind of packing (what q counts). */
export const simUnit = (q, mode) =>
  mode === 'share'
    ? `${q} لكلّ واحد`
    : mode === 'row'
      ? count(TILE, q)
      : mode === 'boxes'
        ? count(PACK, q)
        : count(mode === 'trucks' ? TRUCK : BOX, q);
const GOODS = {
  dates: {
    id: 'dates',
    name: 'علب التمر',
    unit: ['علبة تمر واحدة', 'علبتا تمر', 'علب تمر', 'علبة تمر'],
    left: ['علبة واحدة', 'علبتان', 'علب', 'علبة'],
    color: 0xb5651d,
  },
  oil: {
    id: 'oil',
    name: 'قوارير زيت الزيتون',
    unit: ['قارورة زيت واحدة', 'قارورتا زيت', 'قوارير زيت', 'قارورة زيت'],
    left: ['قارورة واحدة', 'قارورتان', 'قوارير', 'قارورة'],
    color: 0x9aa33a,
  },
  eggs: {
    id: 'eggs',
    name: 'البيض',
    unit: ['بيضة واحدة', 'بيضتان', 'بيضات', 'بيضة'],
    left: ['بيضة واحدة', 'بيضتان', 'بيضات', 'بيضة'],
    color: 0xf1dfb8,
  },
  crates: { id: 'crates', name: 'الصناديق', unit: BOX, left: BOX, color: 0xc79a5b },
  sweets: {
    id: 'sweets',
    name: 'قطع المقروط',
    unit: ['قطعة مقروط واحدة', 'قطعتا مقروط', 'قطع مقروط', 'قطعة مقروط'],
    left: ['قطعة واحدة', 'قطعتان', 'قطع', 'قطعة'],
    color: 0xc8862b,
  },
  tiles: { id: 'tiles', name: 'البلاط', unit: TILE, left: TILE, color: 0xc96f4a },
};
const CLIENTS = ['مدرسة الحيّ', 'مطعم الجامعة', 'دكّان عمّي صالح', 'مخبزة الواحة', 'سوق الجملة', 'نادي الحيّ'];
export const ORDER_PAY = 1200;
export const MISTAKE_COST = 300;
export const CASE_HEARTS = 3;
const K = { baqi: 'qasim-baqi', jidaa: 'qasim-jidaa', siyagh: 'siyagh-mutakafia', wahid: 'wahid-wa-nafsuh' };
const eq = (a, b, q, r) => (r ? `$${a} = ${b} \\times ${q} + ${r}$` : `$${a} = ${b} \\times ${q}$`);
const nonDivisorsNear = (n, b, lo, hi) => {
  const out = [];
  for (let x = lo; x <= hi; x += 1) if (x !== b && x > 1 && n % x !== 0) out.push(x);
  return out;
};

// ───────────────────────────── the orders ─────────────────────────────
const MAKE = {
  fit(rand, i) {
    const b = int(rand, 6, 9 + i * 2);
    const q = int(rand, 4 + i * 2, 7 + i * 4);
    const n = b * q;
    const wrong = shuffle(rand, nonDivisorsNear(n, b, Math.max(4, b - 4), b + 5)).slice(0, 2);
    if (wrong.length < 2) return null;
    const good = pick(rand, [GOODS.dates, GOODS.oil]);
    return {
      kind: 'fit',
      key: K.baqi,
      good,
      n,
      b,
      q,
      client: pick(rand, CLIENTS),
      brief: `طلبت «${'$C'}» ${count(good.unit, n)}. الشاحنة لا تحمل إلا صناديق مملوءة تمامًا، ولا يبقى شيء على الأرض.`,
      steps: [
        {
          id: 'crate',
          type: 'choose',
          prompt: 'أيّ صندوق تختار؟',
          options: shuffle(rand, [b, ...wrong]).map((v) => ({ v, label: String(v), sub: `يتّسع لـ ${v}` })),
        },
      ],
    };
  },
  count(rand, i) {
    const b = int(rand, 6, 10 + i * 3);
    const q = int(rand, 4 + i, 8 + i * 2);
    const n = b * q;
    const good = pick(rand, [GOODS.dates, GOODS.oil]);
    return {
      kind: 'count',
      key: K.jidaa,
      good,
      n,
      b,
      q,
      client: pick(rand, CLIENTS),
      brief: `«${'$C'}» تريد ${count(good.unit, n)} في ${count(BOX, q)} متساوية ومملوءة تمامًا.`,
      steps: [
        {
          id: 'capacity',
          type: 'number',
          div: [n, q],
          prompt: 'كم يتّسع الصندوق الواحد؟',
          tokens: [String(n), '=', { slot: 'x', label: 'سعة الصندوق', w: 2 }, '×', String(q)],
        },
      ],
    };
  },
  orders(rand, i) {
    const b = pick(rand, [8, 9, 12, 14, 15, 16, 18]);
    const q = int(rand, 5 + i, 9 + i * 2);
    const n = b * q;
    const others = shuffle(
      rand,
      [n - 4, n - 3, n - 2, n + 2, n + 3, n + 4, n + 5].filter((x) => x % b !== 0),
    ).slice(0, 2);
    const good = pick(rand, [GOODS.dates, GOODS.oil]);
    const phrase = [
      `عدد علبها مضاعف للعدد ${b}`,
      `عدد علبها يقبل القسمة على ${b}`,
      `العدد ${b} قاسم لعدد علبها`,
      `العدد ${b} يقسم عدد علبها`,
    ][i % 4];
    return {
      kind: 'orders',
      key: K.siyagh,
      good,
      n,
      b,
      q,
      client: 'ثلاثة زبائن',
      brief: `لم يبقَ في المخزن إلا صناديق تتّسع لـ ${b}. ثلاث طلبيّات تنتظر: نقبل الطلبيّة التي ${phrase}.`,
      steps: [
        {
          id: 'order',
          type: 'choose',
          prompt: 'أيّ طلبيّة نوضّبها كاملة؟',
          options: shuffle(rand, [n, ...others]).map((v) => ({ v, label: String(v), sub: good.left[3] })),
        },
      ],
    };
  },
  special(rand) {
    const n = pick(rand, [13, 17, 19, 23, 29, 31]);
    const good = GOODS.oil;
    const usual = shuffle(rand, [2, 3, 4, 5, 6, 7, 8, 9])
      .slice(0, 3)
      .sort((x, y) => x - y);
    return {
      kind: 'special',
      key: K.wahid,
      good,
      n,
      client: pick(rand, CLIENTS),
      brief: `طلبيّة عنيدة من «${'$C'}»: ${count(good.unit, n)}. جرّبنا كلّ الصناديق العاديّة وبقي دائمًا شيء على الأرض!`,
      steps: [
        {
          id: 'two',
          type: 'choose',
          pick: 2,
          prompt: 'أيّ توضيبين يصلحان بالتأكيد، دون أيّ حساب؟',
          options: [1, ...usual, n].map((v) => ({
            v,
            label: String(v),
            sub: v === 1 ? 'واحدة في كلّ علبة' : v === n ? 'صندوق واحد كبير' : `يتّسع لـ ${v}`,
          })),
        },
      ],
    };
  },
  cost(rand) {
    const b2 = pick(rand, [12, 15, 16, 18, 20, 24]);
    const q2 = int(rand, 8, 16);
    const n = b2 * q2;
    const b1 = pick(
      rand,
      nonDivisorsNear(n, b2, b2 - 5, b2 + 5).filter((x) => x >= 9),
    );
    const price = pick(rand, [150, 180, 250, 320]);
    if (!b1) return null;
    const d1 = divide(n, b1);
    const good = GOODS.dates;
    return {
      kind: 'cost',
      key: K.baqi,
      good,
      n,
      b1,
      b2,
      q1: d1.q,
      r1: d1.r,
      q2,
      price,
      client: pick(rand, CLIENTS),
      brief: `«${'$C'}» تطلب ${count(good.unit, n)} في صناديق مملوءة تمامًا. في المخزن نوعان: صناديق تتّسع لـ ${b1} وصناديق تتّسع لـ ${b2}. ثمن الصندوق الواحد ${price} دج مهما كان نوعه.`,
      steps: [
        {
          id: 'first',
          type: 'number',
          div: [n, b1],
          prompt: `جرّب الصناديق التي تتّسع لـ ${b1}: أكمل القسمة الإقليدية.`,
          tokens: [
            String(n),
            '=',
            String(b1),
            '×',
            { slot: 'q', label: 'عدد الصناديق', w: 2 },
            '+',
            { slot: 'r', label: 'الباقي', w: 2 },
          ],
        },
        {
          id: 'second',
          type: 'number',
          div: [n, b2],
          prompt: `والصناديق التي تتّسع لـ ${b2}؟`,
          tokens: [String(n), '=', String(b2), '×', { slot: 'q', label: 'عدد الصناديق', w: 2 }],
        },
        {
          id: 'invoice',
          type: 'number',
          prompt: 'كم تدفع المدرسة ثمنًا للصناديق؟',
          tokens: [{ slot: 'x', label: 'المبلغ', w: 5 }, 'دج'],
        },
      ],
    };
  },
  profit(rand) {
    const [b1, b2, k] = pick(rand, [
      [12, 30, 6],
      [6, 10, 10],
      [8, 12, 12],
      [10, 15, 10],
      [12, 20, 6],
      [6, 30, 10],
    ]);
    const lcm =
      (b1 * b2) /
      (function g(x, y) {
        return y ? g(y, x % y) : x;
      })(b1, b2);
    const n = lcm * int(rand, 2, Math.max(2, Math.floor(k / 2)));
    const p1 = pick(rand, [100, 120, 150]);
    const p2 = Math.round((p1 * (b2 / b1) * pick(rand, [0.9, 1.1])) / 10) * 10;
    const q1 = n / b1;
    const q2 = n / b2;
    if (q1 > 36 || q1 * p1 === q2 * p2) return null;
    return {
      kind: 'profit',
      key: K.jidaa,
      good: GOODS.eggs,
      n,
      b1,
      b2,
      q1,
      q2,
      p1,
      p2,
      best: q1 * p1 > q2 * p2 ? b1 : b2,
      client: 'سوق الجملة',
      brief: `جمعت التعاونية ${count(GOODS.eggs.unit, n)}. نبيعها في أطباق من ${b1} بيضة بـ ${p1} دج للطبق، أو في أطباق من ${b2} بيضة بـ ${p2} دج للطبق. أيّ توضيب يربح أكثر؟`,
      steps: [
        {
          id: 'small',
          type: 'number',
          div: [n, b1],
          prompt: `كم طبقًا من ${b1} بيضة؟`,
          tokens: [String(n), '=', String(b1), '×', { slot: 'q', label: 'عدد الأطباق', w: 2 }],
        },
        {
          id: 'big',
          type: 'number',
          div: [n, b2],
          prompt: `وكم طبقًا من ${b2} بيضة؟`,
          tokens: [String(n), '=', String(b2), '×', { slot: 'q', label: 'عدد الأطباق', w: 2 }],
        },
        {
          id: 'best',
          type: 'choose',
          prompt: 'أيّ توضيب يُدخل مبلغًا أكبر؟',
          options: [
            { v: b1, label: String(b1), sub: `${count(TRAY, q1)} × ${p1} دج` },
            { v: b2, label: String(b2), sub: `${count(TRAY, q2)} × ${p2} دج` },
          ],
        },
        {
          id: 'income',
          type: 'number',
          prompt: 'وكم يُدخل هذا التوضيب؟',
          tokens: [{ slot: 'x', label: 'المبلغ', w: 5 }, 'دج'],
        },
      ],
    };
  },
  trip(rand) {
    const b = pick(rand, [24, 30, 36, 40, 48]);
    const q = int(rand, 3, 6);
    const r = int(rand, 5, b - 6);
    const n = b * q + r;
    const price = pick(rand, [4500, 6000, 7500]);
    return {
      kind: 'trip',
      key: K.baqi,
      good: GOODS.crates,
      n,
      b,
      q,
      r,
      price,
      client: 'ميناء التصدير',
      brief: `${count(BOX, n)} جاهزة للتصدير. الشاحنة الواحدة تحمل ${count(BOX, b)}، وكراؤها ${price} دج. كلّ الصناديق يجب أن ترحل.`,
      steps: [
        {
          id: 'trucks',
          type: 'number',
          div: [n, b],
          prompt: 'كم شاحنة نحتاج؟',
          tokens: [{ slot: 'x', label: 'عدد الشاحنات', w: 2 }],
        },
        {
          id: 'empty',
          type: 'number',
          prompt: 'كم مكانًا يبقى فارغًا في الشاحنة الأخيرة؟',
          tokens: [{ slot: 'x', label: 'الأماكن الفارغة', w: 2 }],
        },
        {
          id: 'rent',
          type: 'number',
          prompt: 'كم ندفع كراءً للشاحنات؟',
          tokens: [{ slot: 'x', label: 'المبلغ', w: 5 }, 'دج'],
        },
      ],
    };
  },
  /** A WORLD of its own — « قعدة الأصدقاء »: sharing sweets FAIRLY (the divisor is the number of children). */
  share(rand, i) {
    const g = int(rand, 5, 8);
    const gq = int(rand, 4 + i, 7 + i * 2);
    const n = g * gq;
    const b = pick(
      rand,
      [g - 1, g - 2, g + 1].filter((x) => x >= 3 && n % x !== 0),
    );
    const others = shuffle(
      rand,
      [g - 3, g - 2, g - 1, g + 1, g + 2, g + 3].filter((x) => x >= 3 && x !== b && n % x !== 0),
    ).slice(0, 2);
    if (!b || others.length < 2) return null;
    const d = divide(n, b);
    const good = GOODS.sweets;
    const host = pick(rand, ['أمين', 'ياسين', 'أنس', 'إلياس']);
    return {
      kind: 'share',
      key: K.baqi,
      good,
      n,
      b,
      q: d.q,
      r: d.r,
      g,
      gq,
      host,
      client: host,
      brief: `خبزت أمّ ${host} ${count(good.unit, n)}. ${host} لا يأخذ لنفسه أكثر من غيره: يقسمها بالعدل بينه وبين أصحابه، وهم ${count(KIDS, b)} في المجموع.`,
      steps: [
        {
          id: 'each',
          type: 'number',
          div: [n, b],
          prompt: 'كم قطعة ينال كلّ واحد؟ وكم قطعة تبقى على الطبق؟',
          tokens: [
            String(n),
            '=',
            String(b),
            '×',
            { slot: 'q', label: 'نصيب كلّ واحد', w: 2 },
            '+',
            { slot: 'r', label: 'القطع الباقية', w: 2 },
          ],
        },
        {
          id: 'guests',
          type: 'choose',
          prompt: `${host} كريم: يدعو أبناء الجيران، حتّى تُقسم القطع كلّها بالعدل ولا يبقى شيء. كم طفلًا يكونون في المجموع؟`,
          options: [g, ...others]
            .sort((x, y) => x - y)
            .map((v) => ({ v, label: String(v), sub: v <= 10 ? 'أطفال' : 'طفلًا' })),
        },
      ],
    };
  },
  /** A WORLD of its own — « ورشة التبليط »: a tiler who does the work properly: no tile cut, no gap, nothing wasted. */
  tiling(rand, i) {
    const s = pick(rand, [20, 25, 30, 40]);
    const q = int(rand, 9 + i, 13 + i * 2);
    const L = s * q;
    const wrong = shuffle(
      rand,
      [20, 25, 30, 40, 45, 50, 60].filter((x) => x !== s && L % x !== 0),
    ).slice(0, 2);
    const rows = int(rand, 3, 6);
    const total = q * rows;
    const box = pick(
      rand,
      [8, 10, 12].filter((x) => total % x !== 0),
    );
    if (wrong.length < 2 || !box) return null;
    const d = divide(total, box);
    return {
      kind: 'tiling',
      key: K.baqi,
      good: GOODS.tiles,
      n: L,
      L,
      s,
      q,
      rows,
      total,
      box,
      bq: d.q,
      br: d.r,
      boxes: d.q + 1,
      spare: box - d.r,
      client: 'عمّي الطاهر',
      brief: `عمّي الطاهر بلّاط يحبّ العمل المتقن: لا يقصّ أيّ بلاطة ولا يترك أيّ فراغ. اليوم يبلّط رواقًا طوله ${L} سم.`,
      steps: [
        {
          id: 'tile',
          type: 'choose',
          prompt: 'أيّ بلاطة تغطّي طول الرواق كلّه دون أيّ قصّ؟',
          options: [s, ...wrong].sort((x, y) => x - y).map((v) => ({ v, label: String(v), sub: 'سم' })),
        },
        {
          id: 'all',
          type: 'number',
          prompt: `عرض الرواق يتّسع لـ ${rows} صفوف. كم بلاطة يحتاج في المجموع؟`,
          tokens: [String(rows), '×', String(q), '=', { slot: 'x', label: 'مجموع البلاطات', w: 3 }],
        },
        {
          id: 'boxes',
          type: 'number',
          div: [total, box],
          prompt: `البلاط يُباع في علب من ${box} بلاطة، وعمّي الطاهر لا يشتري أكثر ممّا يلزم. كم علبة يشتري؟`,
          tokens: [{ slot: 'x', label: 'عدد العلب', w: 2 }],
        },
      ],
    };
  },
};

/**
 * The missions of the practice space: which orders a day holds (kind, difficulty index).
 * `WORLD_OF` says in which 3D world a mission is played: the cooperative's depot, the friends' table or the tiler's site.
 */
export const MISSIONS = {
  fit: [
    ['fit', 0],
    ['fit', 1],
    ['fit', 2],
  ],
  count: [
    ['count', 0],
    ['count', 1],
    ['count', 2],
  ],
  orders: [
    ['orders', 0],
    ['orders', 1],
    ['orders', 2],
    ['orders', 3],
  ],
  special: [
    ['special', 0],
    ['special', 1],
  ],
  day: [
    ['cost', 0],
    ['profit', 0],
    ['trip', 0],
  ],
  share: [
    ['share', 0],
    ['share', 1],
  ],
  tiling: [
    ['tiling', 0],
    ['tiling', 1],
  ],
};
export const WORLD_OF = {
  fit: 'depot',
  count: 'depot',
  orders: 'depot',
  special: 'depot',
  day: 'depot',
  share: 'share',
  tiling: 'tiling',
};

export function makeOrder(rand, kind, i) {
  for (let t = 0; t < 300; t += 1) {
    const o = MAKE[kind](rand, i);
    if (o) {
      o.brief = o.brief.replace('$C', o.client);
      return o;
    }
  }
  throw new Error(`cases: no order for ${kind}`);
}
export function makeMission(rand, mission) {
  const out = [];
  for (const [kind, i] of MISSIONS[mission]) {
    let o;
    let t = 0;
    do {
      o = makeOrder(rand, kind, i);
      t += 1;
    } while (t < 20 && out.some((x) => x.n === o.n));
    out.push(o);
  }
  return out;
}

/**
 * EVERYTHING THE CURRENT STEP NEEDS IS ON ITS SCREEN (owner, 2026-11-15 — the platform's « no back-and-forth » rule): the data
 * of the story and the results the student has already found in this case, as short lines kept beside the question.
 * `facts(o, i)` = what is known when step i is asked. A test checks that every number a step needs is in them or in its prompt.
 */
export function facts(o, i) {
  const f = [];
  const done = (id) => {
    const k = o.steps.findIndex((s) => s.id === id);
    return k >= 0 && k < i;
  };
  const U = o.good.unit;
  switch (o.kind) {
    case 'fit':
    case 'special':
      f.push(`الطلبيّة: ${count(U, o.n)}`);
      break;
    case 'count':
      f.push(`الطلبيّة: ${count(U, o.n)}`, `المطلوب: ${count(BOX, o.q)} متساوية ومملوءة`);
      break;
    case 'orders':
      f.push(`سعة الصندوق الوحيد: ${o.b}`);
      break;
    case 'cost':
      f.push(`الطلبيّة: ${count(U, o.n)}`, `سعة الصناديق: ${o.b1} أو ${o.b2}`, `ثمن الصندوق: ${o.price} دج`);
      if (done('first')) f.push(`${eq(o.n, o.b1, o.q1, o.r1)}: سعة ${o.b1} لا تصلح`);
      if (done('second')) f.push(`${eq(o.n, o.b2, o.q2, 0)}: ${count(BOX, o.q2)} بسعة ${o.b2}`);
      break;
    case 'profit':
      f.push(`المحصول: ${count(U, o.n)}`, `طبق من ${o.b1}: ${o.p1} دج`, `طبق من ${o.b2}: ${o.p2} دج`);
      if (done('small')) f.push(`${eq(o.n, o.b1, o.q1, 0)}: ${count(TRAY, o.q1)} من ${o.b1}`);
      if (done('big')) f.push(`${eq(o.n, o.b2, o.q2, 0)}: ${count(TRAY, o.q2)} من ${o.b2}`);
      if (done('best')) f.push(`الأربح: أطباق من ${o.best}`);
      break;
    case 'trip':
      f.push(`للتصدير: ${count(BOX, o.n)}`, `حمولة الشاحنة: ${count(BOX, o.b)}`, `كراء الشاحنة: ${o.price} دج`);
      if (done('trucks')) f.push(`${eq(o.n, o.b, o.q, o.r)}: ${count(TRUCK, o.q + 1)}`);
      if (done('empty')) f.push(`الأماكن الفارغة: ${o.b - o.r}`);
      break;
    case 'share':
      f.push(`على الطبق: ${count(U, o.n)}`, `الأطفال: ${o.b}`);
      if (done('each')) f.push(`${eq(o.n, o.b, o.q, o.r)}: تبقى ${count(o.good.left, o.r)}`);
      break;
    case 'tiling':
      f.push(`طول الرواق: ${o.L} سم`);
      if (done('tile'))
        f.push(
          `طول البلاطة: ${o.s} سم`,
          `${eq(o.L, o.s, o.q, 0)}: ${count(TILE, o.q)} في الصفّ`,
          `عدد الصفوف: ${o.rows}`,
        );
      if (done('all'))
        f.push(`المجموع: $${o.rows} \\times ${o.q} = ${o.total}$ بلاطة`, `العلبة: ${count(TILE, o.box)}`);
      break;
    default:
      break;
  }
  return f;
}

/**
 * An answer as the student GAVE it, to read again later: parts of text, `mine: true` on what he chose or typed.
 * A choice is its option; a typed answer is its whole template with his numbers in place (« 330 = 30 × 11 »).
 */
export function answerParts(step, value) {
  if (step.type === 'choose') {
    const picked = Array.isArray(value) ? value : [value];
    return picked.flatMap((v, i) => {
      const op = step.options.find((x) => x.v === v);
      return [
        ...(i ? [{ text: 'و', mine: false, rtl: true }] : []),
        { text: op?.label ?? String(v), mine: true },
        { text: op?.sub ?? '', mine: false, rtl: true },
      ];
    });
  }
  return step.tokens.map((t) =>
    typeof t === 'string'
      ? { text: t, mine: false, rtl: t === 'دج' }
      : { text: String(value?.[t.slot] ?? ''), mine: true },
  );
}

/** The right answer of a step — used by the tests and by the automated walk, never shown to the student. */
export function answerOf(o, stepIndex) {
  const id = o.steps[stepIndex].id;
  switch (`${o.kind}.${id}`) {
    case 'fit.crate':
      return o.b;
    case 'count.capacity':
      return { x: o.b };
    case 'orders.order':
      return o.n;
    case 'special.two':
      return [1, o.n];
    case 'cost.first':
      return { q: o.q1, r: o.r1 };
    case 'cost.second':
      return { q: o.q2 };
    case 'cost.invoice':
      return { x: o.q2 * o.price };
    case 'profit.small':
      return { q: o.q1 };
    case 'profit.big':
      return { q: o.q2 };
    case 'profit.best':
      return o.best;
    case 'profit.income':
      return { x: o.best === o.b1 ? o.q1 * o.p1 : o.q2 * o.p2 };
    case 'trip.trucks':
      return { x: o.q + 1 };
    case 'trip.empty':
      return { x: o.b - o.r };
    case 'trip.rent':
      return { x: (o.q + 1) * o.price };
    case 'share.each':
      return { q: o.q, r: o.r };
    case 'share.guests':
      return o.g;
    case 'tiling.tile':
      return o.s;
    case 'tiling.all':
      return { x: o.total };
    case 'tiling.boxes':
      return { x: o.boxes };
    default:
      return null;
  }
}

/**
 * Judges one step. `value` = the chosen option (a number, or two numbers for `pick: 2`) or { slot: number }.
 * Returns { ok, sims: [{ n, b, mode }], text } — `sims` is what the depot packs to SHOW the consequence of the answer;
 * `text` says what happened, in the depot's words (a right step is confirmed, a wrong one is explained by its own division).
 */
/** The shortcut worth showing once a step is RIGHT (never before: it would give the result away), or null. */
function tipFor(o, stepIndex) {
  const st = o.steps[stepIndex];
  switch (`${o.kind}.${st.id}`) {
    case 'fit.crate':
    case 'orders.order':
      return divisionTip(o.n, o.b);
    case 'cost.invoice':
      return productTip(o.q2, o.price);
    case 'profit.income':
      return o.best === o.b1 ? productTip(o.q1, o.p1) : productTip(o.q2, o.p2);
    case 'trip.rent':
      return productTip(o.q + 1, o.price);
    case 'share.guests':
      return divisionTip(o.n, o.g);
    case 'tiling.tile':
      return divisionTip(o.L, o.s);
    case 'tiling.all':
      return productTip(o.q, o.rows);
    default:
      return st.div ? divisionTip(st.div[0], st.div[1]) : null;
  }
}

export function judge(o, stepIndex, value) {
  const res = judgeRaw(o, stepIndex, value);
  return res.ok ? { ...res, tip: tipFor(o, stepIndex) } : res;
}

function judgeRaw(o, stepIndex, value) {
  const id = o.steps[stepIndex].id;
  const L = o.good.left;
  const num = (k) => Number(value?.[k]);
  const bad = (text, sims = []) => ({ ok: false, sims, text });
  const good = (text, sims = []) => ({ ok: true, sims, text });
  const leaves = (n, b) => {
    const { q, r } = divide(n, b);
    return `${eq(n, b, q, r)}: ${r === 1 ? 'تبقى' : 'تبقى'} ${count(L, r)} على الأرض.`;
  };
  const valid = (...ks) => ks.every((k) => Number.isInteger(num(k)) && num(k) >= 0);
  switch (`${o.kind}.${id}`) {
    case 'fit.crate': {
      const b = value;
      const { q, r } = divide(o.n, b);
      return r === 0
        ? good(`${eq(o.n, b, q, 0)}: ${count(BOX, q)} مملوءة تمامًا، ولا شيء يبقى.`, [{ n: o.n, b }])
        : bad(`${leaves(o.n, b)} الصندوق ${b} لا يصلح.`, [{ n: o.n, b }]);
    }
    case 'count.capacity': {
      if (!valid('x') || num('x') < 1) return bad('اكتب سعة الصندوق.');
      const x = num('x');
      const { q, r } = divide(o.n, x);
      if (x === o.b) return good(`${eq(o.n, x, q, 0)}: ${count(BOX, q)} كما طلب الزبون.`, [{ n: o.n, b: x }]);
      return bad(
        r === 0 ? `بسعة ${x} نملأ ${count(BOX, q)}، والزبون يريد ${count(BOX, o.q)}.` : `بسعة ${x}: ${leaves(o.n, x)}`,
        x <= o.n && q <= 40 ? [{ n: o.n, b: x }] : [],
      );
    }
    case 'orders.order': {
      const n = value;
      const { q, r } = divide(n, o.b);
      return r === 0
        ? good(`${eq(n, o.b, q, 0)}: ${n} مضاعف للعدد ${o.b}، و ${o.b} قاسم له.`, [{ n, b: o.b }])
        : bad(`${leaves(n, o.b)} ${n} ليس مضاعفًا للعدد ${o.b}.`, [{ n, b: o.b }]);
    }
    case 'special.two': {
      const picked = [...value].sort((x, y) => x - y);
      const wrong = picked.find((x) => o.n % x !== 0);
      if (wrong) return bad(`${leaves(o.n, wrong)} الصندوق ${wrong} لا يصلح.`, [{ n: o.n, b: wrong }]);
      return good(`${eq(o.n, 1, o.n, 0)} و ${eq(o.n, o.n, 1, 0)}: 1 والعدد نفسه قاسمان دائمًا.`, [
        { n: o.n, b: 1 },
        { n: o.n, b: o.n },
      ]);
    }
    case 'cost.first': {
      if (!valid('q', 'r')) return bad('اكتب العددين معًا: عدد الصناديق، والباقي.');
      const q = num('q');
      const r = num('r');
      if (o.b1 * q > o.n) return bad(`${count(BOX, q)} بسعة ${o.b1} تحتاج ${o.b1 * q}، والطلبيّة ${o.n} فقط.`);
      if (o.b1 * q + r !== o.n) return bad(`تحقّق: $${o.b1} \\times ${q} + ${r} = ${o.b1 * q + r}$، والطلبيّة ${o.n}.`);
      if (r >= o.b1) return bad(`بقي ${r}: ما زال هناك ما يملأ صندوقًا آخر. الباقي يجب أن يكون أصغر من ${o.b1}.`);
      return good(`${eq(o.n, o.b1, q, r)}: الباقي ${r} ليس معدومًا، فالصناديق التي تتّسع لـ ${o.b1} لا تصلح.`, [
        { n: o.n, b: o.b1 },
      ]);
    }
    case 'cost.second':
    case 'profit.small':
    case 'profit.big': {
      if (!valid('q')) return bad('اكتب العدد.');
      const b = id === 'second' ? o.b2 : id === 'small' ? o.b1 : o.b2;
      const q = num('q');
      if (b * q !== o.n) return bad(`تحقّق: $${b} \\times ${q} = ${b * q}$، والطلبيّة ${o.n}.`);
      return good(`${eq(o.n, b, q, 0)}: الباقي 0، إذن ${b} قاسم للعدد ${o.n}.`, [{ n: o.n, b }]);
    }
    case 'cost.invoice': {
      if (!valid('x')) return bad('اكتب المبلغ.');
      return num('x') === o.q2 * o.price
        ? good(`$${o.q2} \\times ${o.price} = ${o.q2 * o.price}$ دج.`)
        : bad(`ليس هذا المبلغ. الفاتورة: عدد الصناديق × ثمن الصندوق، أي $${o.q2} \\times ${o.price}$.`);
    }
    case 'profit.best': {
      const r1 = o.q1 * o.p1;
      const r2 = o.q2 * o.p2;
      return value === o.best
        ? good(`$${o.q1} \\times ${o.p1} = ${r1}$ دج و $${o.q2} \\times ${o.p2} = ${r2}$ دج.`)
        : bad(
            `احسب المبلغين: $${o.q1} \\times ${o.p1}$ دج لأطباق ${o.b1}، و $${o.q2} \\times ${o.p2}$ دج لأطباق ${o.b2}، ثمّ قارن.`,
          );
    }
    case 'profit.income': {
      if (!valid('x')) return bad('اكتب المبلغ.');
      const [q, p] = o.best === o.b1 ? [o.q1, o.p1] : [o.q2, o.p2];
      return num('x') === q * p
        ? good(`$${q} \\times ${p} = ${q * p}$ دج.`)
        : bad(`ليس هذا المبلغ: عدد الأطباق × ثمن الطبق، أي $${q} \\times ${p}$.`);
    }
    case 'trip.trucks': {
      if (!valid('x') || num('x') < 1) return bad('اكتب عدد الشاحنات.');
      const x = num('x');
      const sim = [{ n: o.n, b: o.b, mode: 'trucks' }];
      if (x === o.q + 1)
        return good(`${eq(o.n, o.b, o.q, o.r)}: ${count(TRUCK, o.q)} مملوءة، وشاحنة أخرى للـ ${o.r} الباقية.`, sim);
      if (x <= o.q)
        return bad(
          `${count(TRUCK, x)} تحمل $${o.b} \\times ${x} = ${o.b * x}$ فقط: تبقى ${count(BOX, o.n - o.b * x)} على الرصيف.`,
          x === o.q ? sim : [],
        );
      return bad(`${count(TRUCK, x)} أكثر ممّا يلزم: احسب القسمة الإقليدية للعدد ${o.n} على ${o.b}، ولا تنسَ ما يبقى.`);
    }
    case 'trip.empty': {
      if (!valid('x')) return bad('اكتب العدد.');
      return num('x') === o.b - o.r
        ? good(`في الشاحنة الأخيرة ${o.r} من ${o.b}: يبقى $${o.b} - ${o.r} = ${o.b - o.r}$ ${PLACE[3]}.`)
        : bad(`الشاحنة الأخيرة تحمل الباقي فقط، أي ${count(BOX, o.r)} من ${o.b} مكانًا. كم ينقصها لتمتلئ؟`);
    }
    case 'trip.rent': {
      if (!valid('x')) return bad('اكتب المبلغ.');
      return num('x') === (o.q + 1) * o.price
        ? good(`$${o.q + 1} \\times ${o.price} = ${(o.q + 1) * o.price}$ دج.`)
        : bad(`ليس هذا المبلغ: ندفع كراء كلّ الشاحنات، أي $${o.q + 1} \\times ${o.price}$.`);
    }
    case 'share.each': {
      if (!valid('q', 'r')) return bad('اكتب العددين معًا: نصيب كلّ واحد، والقطع الباقية.');
      const q = num('q');
      const r = num('r');
      if (o.b * q > o.n) return bad(`لا تكفي القطع: $${o.b} \\times ${q} = ${o.b * q}$، وعلى الطبق ${o.n} فقط.`);
      if (o.b * q + r !== o.n) return bad(`تحقّق: $${o.b} \\times ${q} + ${r} = ${o.b * q + r}$، وعلى الطبق ${o.n}.`);
      if (r >= o.b)
        return bad(`بقيت ${count(L, r)}: يستطيع كلّ واحد أن ينال قطعة أخرى. الباقي يجب أن يكون أصغر من ${o.b}.`);
      return good(`${eq(o.n, o.b, q, r)}: كلّ واحد ينال ${q}، وتبقى ${count(L, r)} على الطبق.`, [
        { n: o.n, b: o.b, mode: 'share' },
      ]);
    }
    case 'share.guests': {
      const x = value;
      const { q, r } = divide(o.n, x);
      const sim = [{ n: o.n, b: x, mode: 'share' }];
      return r === 0
        ? good(`${eq(o.n, x, q, 0)}: كلّ طفل ينال ${q} ولا يبقى شيء. ${x} قاسم للعدد ${o.n}: قسمة عادلة تمامًا.`, sim)
        : bad(`${eq(o.n, x, q, r)}: تبقى ${count(L, r)} على الطبق. مع ${count(KIDS, x)} لا تكون القسمة تامّة.`, sim);
    }
    case 'share.fair': {
      if (!valid('q')) return bad('اكتب نصيب كلّ واحد.');
      return num('q') === o.gq
        ? good(`${eq(o.n, o.g, o.gq, 0)}: الجميع ينالون النصيب نفسه.`)
        : bad(`تحقّق: $${o.g} \\times ${num('q')} = ${o.g * num('q')}$، وعلى الطبق ${o.n}.`);
    }
    case 'tiling.tile': {
      const x = value;
      const { q, r } = divide(o.L, x);
      const sim = [{ n: o.L, b: x, mode: 'row' }];
      return r === 0
        ? good(`${eq(o.L, x, q, 0)}: ${count(TILE, q)} كاملة تغطّي الرواق، دون أيّ قصّ.`, sim)
        : bad(`${eq(o.L, x, q, r)}: تبقى ${r} سم في آخر الرواق. يجب قصّ بلاطة، وهذا ليس عملًا متقنًا.`, sim);
    }
    case 'tiling.perRow': {
      if (!valid('q')) return bad('اكتب عدد البلاطات.');
      return num('q') === o.q
        ? good(`${eq(o.L, o.s, o.q, 0)}: ${count(TILE, o.q)} في الصفّ.`)
        : bad(`تحقّق: $${o.s} \\times ${num('q')} = ${o.s * num('q')}$ سم، وطول الرواق ${o.L} سم.`);
    }
    case 'tiling.all': {
      if (!valid('x')) return bad('اكتب مجموع البلاطات.');
      return num('x') === o.total
        ? good(`$${o.rows} \\times ${o.q} = ${o.total}$: يحتاج ${count(TILE, o.total)}.`)
        : bad(`ليس هذا العدد: عدد الصفوف × بلاطات الصفّ الواحد، أي $${o.rows} \\times ${o.q}$.`);
    }
    case 'tiling.boxes': {
      if (!valid('x') || num('x') < 1) return bad('اكتب عدد العلب.');
      const x = num('x');
      const sim = [{ n: o.total, b: o.box, mode: 'boxes' }];
      if (x === o.boxes)
        return good(
          `${eq(o.total, o.box, o.bq, o.br)}: ${count(PACK, o.bq)} لا تكفي، فيشتري ${o.boxes}. تبقى ${count(TILE, o.spare)}: يحتفظ بها للتصليح، فلا تبذير.`,
          sim,
        );
      if (x <= o.bq)
        return bad(
          `${count(PACK, x)} فيها $${o.box} \\times ${x} = ${o.box * x}$ بلاطة فقط: تنقصه ${count(TILE, o.total - o.box * x)}.`,
          x === o.bq ? sim : [],
        );
      return bad(
        `${count(PACK, x)} أكثر ممّا يلزم، وعمّي الطاهر لا يبذّر. احسب القسمة الإقليدية للعدد ${o.total} على ${o.box}، ولا تنسَ ما يبقى.`,
      );
    }
    default:
      return bad('');
  }
}
