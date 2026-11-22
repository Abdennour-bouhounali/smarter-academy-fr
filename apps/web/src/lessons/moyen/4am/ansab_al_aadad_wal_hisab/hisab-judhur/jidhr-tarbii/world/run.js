/**
 * « سباق المربّعات » — the gate run of lesson `jidhr-tarbii` (the kit's rail of light, `kit/GateRun.js`): a COURSE of
 * fourteen gates on products he already knows — a number by itself (1 × 1 … 10 × 10), then three times (2 × 2 × 2 …
 * 5 × 5 × 5). It stands on the third terrace, before the court of 100 (owner, 2026-11-21: « a game like the endless but
 * not endless … simple operations of power 1*1 2*2 3*3 4*4 5*5 … 5*5*5 »). It tells no rule: these products are
 * what he brings from the years before, and what every court of the palace will ask of him.
 * A gate that was not the right one shows a FACT (the product, and what the number he took is).
 */
const ltr = (s) => `⁦${s}⁩`;

/** The gates in the order he meets them: [the number, how many times it is written]. */
export const COURSE = [...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((a) => [a, 2]), ...[2, 3, 4, 5].map((a) => [a, 3])];

const product = (a, times) => a ** times;
const written = (a, times) => Array(times).fill(a).join(' × ');

/** The two other numbers of a gate, each a real slip: the double (or triple), the neighbour's product, the square for a cube. */
export function others(a, times) {
  const right = product(a, times);
  const pool =
    times === 2
      ? [
          [a * 2, `${a} × 2`],
          [a * (a + 1), `${a} × ${a + 1}`],
          [a + 2, `${a} + 2`],
          [(a + 1) * (a + 1), `${a + 1} × ${a + 1}`],
        ]
      : [
          [a * 3, `${a} × 3`],
          [a * a, `${a} × ${a}`],
          [a * a * 2, `${a} × ${a} × 2`],
        ];
  const out = [];
  for (const [v, how] of pool) if (v !== right && !out.some((o) => o.v === v) && out.length < 2) out.push({ v, how });
  return out;
}

/** One gate: the product asked, three numbers in a drawn order, and the fact each of them tells. */
export function round(level, random, n) {
  const [a, times] = COURSE[n % COURSE.length];
  const right = product(a, times);
  const fact = ltr(`${written(a, times)} = ${right}`);
  const cells = [
    { v: right, why: fact },
    ...others(a, times).map((o) => ({ v: o.v, why: `${fact} — و ${o.v} هو ${ltr(o.how)}.` })),
  ];
  for (let i = cells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return {
    ask: 'كم يساوي؟',
    tex: Array(times).fill(a).join(' \\times '),
    options: cells.map((c) => ({ t: String(c.v) })),
    right: cells.findIndex((c) => c.v === right),
    why: cells.map((c) => c.why),
  };
}

export const RUN = {
  total: COURSE.length,
  gates: 5,
  levels: [
    { name: 'عدد في نفسه', from: '1 × 1' },
    { name: 'أعداد أكبر', from: '6 × 6' },
    { name: 'ثلاث مرّات', from: '2 × 2 × 2' },
  ],
  round,
  text: {
    title: 'سباق المربّعات',
    say: 'قبل الساحة الكبيرة: أربعة عشر بابًا من الضوء. على كلّ باب جداء عدد في نفسه.',
    rule: 'اختر الباب الصحيح بالسهمين ← →. لك ثلاثة قلوب.',
    start: 'أبدأ السباق',
    again: 'أعيد السباق',
    leave: 'الرجوع إلى السطح',
    order: 'مرّ من الباب الصحيح',
    gate: 'الباب',
    of: 'من',
    pause: 'توقّف',
    resume: 'متابعة',
    quit: 'خروج',
    pausedTitle: 'السباق متوقّف',
    pausedText: 'الأبواب تنتظرك حيث تركتها. اضغط « متابعة » أو مفتاح المسافة.',
    left: 'يسار',
    right: 'يمين',
    won: { title: 'أنهيتَ السباق', text: 'الساحة الكبيرة مفتوحة الآن.' },
    lost: { title: 'انتهت القلوب', text: 'لا بأس: الأبواب نفسها تنتظرك. أعد السباق.' },
  },
};
