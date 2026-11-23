// « Mon labo » of a lesson: its OWN instruments (lessonlab/registry.js › TOOLS tagged with the lesson), each played by
// its handler here with the walk's own arithmetic (an instrument's state hook gives the question, never the answer). The
// hub walk calls `playLab` at the door « Mon labo » for every instrument of the lesson the library knows; an instrument it
// does not know is said with a NOTE (its lesson writes its handler here — README « Adding to the library »).
const isPrime = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
};
const spf = (n) => {
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return d;
  return n;
};

/** The number of the instrument's first box (« Le nombre »), set as a student types it. */
async function setNumber(page, n) {
  await page.fill('[data-ll-input="a"]', String(n));
  await page.waitForTimeout(250);
}

/**
 * « L’échelle des facteurs » (`tools/FactorLadder.jsx`, first French lesson): a number of his own is a gap; a plank of the
 * rack, a length typed, or the whole gap. Played: on 8 192 a plank that leaves cells falls (3), then the plank of 2
 * thirteen times — the longest row the instrument draws; on 2 387 the lengths 7 and 11 TYPED, then « Tout le fossé ». The
 * gap after every plank, the row and the product at the end, computed here.
 */
async function factorTool({ w, page, shot }) {
  const left = () => page.getAttribute('[data-ll-factor-tool]', 'data-left').then(Number);
  const lay = async (how, d, gap) => {
    if (how === 'rack') await page.click(`[data-ll-factor-plank="${d}"]`);
    else if (how === 'typed') {
      await page.fill('[data-ll-factor-input]', String(d));
      await page.click('[data-ll-factor-lay]');
    } else await page.click('[data-ll-factor-whole]');
    await page.waitForTimeout(150);
    const want = gap % d === 0 ? gap / d : gap;
    const got = await left();
    w.check(
      got === want,
      `the factor ladder: ${gap} ${gap % d === 0 ? `÷ ${d} = ${want}` : `= ${d} × ${Math.floor(gap / d)} + ${gap % d}, the gap stays`} (the instrument: ${got})`,
    );
    return want;
  };
  // 8 192: a plank that falls, then the planks of 2 to the end
  await setNumber(page, 8192);
  w.expect((await left()) === 8192, 'the factor ladder opens on 8 192 as typed');
  let gap = await lay('rack', 3, 8192);
  w.check(
    (await page.locator('[data-ll-factor-last="fell"]').count()) === 1,
    'the plank of 3 on 8 192: what is left is said',
  );
  await shot('lab-factor-8192-fell-3');
  const want = [];
  for (let x = 8192; x > 1; x /= spf(x)) want.push(spf(x));
  for (const d of want) gap = await lay('rack', d, gap);
  w.expect(gap === 1, `8 192 = ${want.join(' × ')}: the gap is 1 case (${want.length} planks)`);
  const row = (await page.getAttribute('[data-ll-factor-tool]', 'data-planks')) ?? '';
  w.check(row === want.join(','), `the row of planks laid is ${want.length} planks of 2 (${row})`);
  w.check(
    (await page.locator('[data-ll-factor-done], [data-ll-factor-product]').count()) === 2,
    'the gap crossed: the product written, the chip says so',
  );
  await shot('lab-factor-8192');
  // 2 387: two lengths typed, then the whole gap (31 is prime)
  await setNumber(page, 2387);
  gap = 2387;
  for (let k = 0; k < 2; k += 1) gap = await lay('typed', spf(gap), gap);
  w.expect(isPrime(gap), `2 387 ÷ 7 ÷ 11 = ${gap}, a prime — no plank of the rack fills it`);
  await shot('lab-factor-2387-typed');
  gap = await lay('whole', gap, gap);
  w.check(gap === 1, '« Tout le fossé »: the gap is 1 case');
  await shot('lab-factor-2387');
}

export const INSTRUMENTS = { factor: factorTool };

/** Plays every instrument of « Mon labo » open on screen that the library knows. */
export async function playLab(ctx) {
  const ids = await ctx.page.$$eval('[data-ll-tool]', (els) => [...new Set(els.map((e) => e.dataset.llTool))]);
  for (const id of ids) {
    const play = INSTRUMENTS[id];
    if (!play) {
      console.log(`NOTE  « Mon labo »: the instrument « ${id} » has no handler in lib/lessonWalk/lab.mjs`);
      continue;
    }
    if ((await ctx.page.locator(`[data-ll-tool="${id}"]`).count()) > 0)
      await ctx.page.click(`[data-ll-tool="${id}"]`).catch(() => {});
    await ctx.page.waitForTimeout(400);
    await play(ctx);
  }
}
