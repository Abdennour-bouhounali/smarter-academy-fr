// « تدرّب » of lesson `qawasim-adad-tabii` (lesson 2), as a STUDENT — the equivalent of the trainer part of the pilot's
// gameworld-field.mjs. On the full « خريطة المعارف », four cards are trained — جداء عاملين, القاسم, أين نتوقّف, قواعد قابلية
// القسمة — six questions each, so EVERY kind of question of the lesson's `world/trainer.js` is played through its screen:
// tap (the gates), true / false (game, and exam with its reason), pairs, show, stop, list, rule. In each session: a wrong
// then a right answer (the hint), a right one at the first try, two wrong (the written correction, the model sheet when the
// question has one). The right answers are computed HERE from the numbers of the question, never taken from the lesson.
// What is posted as evidence (exam format, first try) is captured and its shape asserted.
// Run (dev server up): [E2E_SIZE=1366x768] [E2E_TOUCH=1] node apps/web/e2e/gameworld-qawasim-trainer.mjs [outDir]
import { createWalk, lessonUrl, divisorsOf, isqrt, readingOf, TOUCH } from './lib/walk.mjs';

const ID = 'qawasim-adad-tabii';
const URL = lessonUrl('ansab_al_aadad_wal_hisab', ID);
const KEYS = ['jidaa-aamilayn', 'qasim-rappel', 'tariqa-qawasim', 'qawaid-qisma'];
const POINT = { 'jidaa-aamilayn': 'P1', 'qasim-rappel': 'P2', 'tariqa-qawasim': 'P3', 'qawaid-qisma': 'P4' };
const CARDS = ['qawasim', 'jidaa', 'rappel', 'ex60', 'khata-nisyan', 'tariqa', 'ex105', 'khata-nisf', 'qawaid', 'khata-9', 'khulasa'];
/** The kinds each trained card must show (the plans of world/trainer.js: jidaa, rappel, tariqa, qawaid). */
const TRAIN = { jidaa: ['tap', 'tf', 'pairs'], rappel: ['tap', 'tf', 'show'], tariqa: ['tap', 'tf', 'stop', 'list'], qawaid: ['tap', 'tf', 'rule'] };
const w = createWalk('gameworld-qawasim-trainer');
const { expect, check, shot } = w;

/** Is gate value n right for this wave? Computed HERE. */
const gateRight = (x, n) => ({ missing: () => n * x.b === x.a, fromProduct: () => n >= 1 && x.a % n === 0, divisorOf: () => n >= 1 && x.a % n === 0, remainder: () => n === x.a % x.b, lastTry: () => n === isqrt(x.a), countOf: () => n === divisorsOf(x.a).length, divisibleBy: () => n >= 1 && n % x.b === 0 })[x.type]();
const pairsOf = (a) => divisorsOf(a).filter((d) => d * d <= a).map((d) => [d, a / d]);
/** The right answer of a question, from its numbers. (A true / false is judged by the statement the lesson wrote: its `truth`.) */
function solve(q) {
  switch (q.kind) {
    case 'tap': {
      const ok = q.options.filter((n) => gateRight(q.wave, n));
      expect(ok.length === 1, `tap « ${q.wave.type} » (${q.options.join(', ')}): exactly one gate is right`);
      return ok[0];
    }
    case 'tf': return { truth: q.truth, reason: q.reasons ? q.reasons.findIndex((r) => r.ok) : null };
    case 'pairs': return Object.fromEntries(pairsOf(q.a).flatMap(([d, e], i) => [[`x${i}`, d], [`y${i}`, e]]));
    case 'show': return { q: q.a / q.b, x: q.a / q.b };
    case 'stop': return { d: isqrt(q.a), e: isqrt(q.a) + 1 };
    case 'list': return Object.fromEntries(divisorsOf(q.a).map((d, i) => [`d${i}`, d]));
    case 'rule': return { v: readingOf(q.a, q.b), fits: q.a % q.b === 0 };
    default: throw new Error(`unknown kind ${q.kind}`);
  }
}
/** A wrong answer of the same shape. */
function wrongOf(q) {
  const r = solve(q);
  switch (q.kind) {
    case 'tap': return q.options.find((n) => n !== r);
    case 'tf': return { truth: !r.truth, reason: r.reason };
    case 'pairs': return { ...r, x0: 2, y0: q.a };
    case 'show': return { q: r.q + 1, x: q.b };
    case 'stop': return { d: r.d + 1, e: r.d + 2 };
    case 'list': return { ...r, [`d${divisorsOf(q.a).length - 1}`]: q.a + 1 };
    case 'rule': return { v: r.v + 1, fits: !r.fits };
    default: return null;
  }
}

await w.run(async () => {
  const know = { found: CARDS, read: [], sealed: [], trained: {} };
  const practice = Object.fromEntries(KEYS.map((k) => [`${k}:1`, { stars: 2, best: 800 }]));
  const save = { v: 1, stage: 8, stars: {}, gems: [], keys: KEYS, keysEver: KEYS, falls: 0, flags: {}, finished: true, practice, know };
  const { page } = await w.student({ uid: 9601, lessonId: ID, url: URL, seed: { [`u_9601_smarter_world_${ID}`]: save } });
  await page.waitForSelector('[data-di-start]', { timeout: 30000 });
  await page.click('[data-di-know-open]'); await page.waitForSelector('[data-di-kmap="full"]'); await page.waitForTimeout(700);
  expect(await page.locator('[data-di-knode]').count() === CARDS.length && await page.locator('[data-di-knode][data-open="true"]').count() === CARDS.length, `« خريطة المعارف »: the ${CARDS.length} cards of the lesson, all open with the four keys`);
  await shot(page, 'know-full', { exit: ['[data-di-know-close]'], sound: true, numbers: true });

  const tr = () => page.evaluate(() => ({ q: window.__trainer?.q, index: window.__trainer?.index, dom: document.querySelector('[data-di-trainer]')?.dataset.diTrainer, fb: document.querySelector('[data-di-tr-fb]')?.dataset.diTrFb ?? null, fbText: document.querySelector('[data-di-tr-fb]')?.textContent ?? '' }));
  const trainerText = () => page.textContent('[data-di-trainer]');
  /**
   * The paper gate « كتبتُ على ورقتي » (kit/Paper.jsx › PaperGate): every question written on a sheet (kit/Trainer.jsx) closes
   * its answer boxes behind it until it is passed once; the question stays mounted between two tries (keyed by its index), so
   * the gate does not come back for the second try. A gate to tap or a game true / false has none. `gate.open` tracks it.
   */
  const passGate = async (q, gate, what) => {
    // Trainer.jsx › Question: a « tap » and a game-format true / false answer at once; every other question is a sheet whose
    // boxes sit behind the gate (an exam true / false, and every form, whatever its format)
    const want = !(q.kind === 'tap' || (q.kind === 'tf' && q.format !== 'exam')) && !gate.open;
    const shown = await page.locator('[data-di-pgate-go]').count();
    expect(shown === (want ? 1 : 0), `${what}: the paper gate « كتبتُ على ورقتي » is ${want ? 'there (a sheet, not yet passed)' : 'absent (gates to tap, a game true / false, or already passed)'} (found ${shown})`);
    if (want) { await page.click('[data-di-pgate-go]'); gate.open = true; }
  };
  /** Answers the question on screen with `v`, through its own controls. */
  const reply = async (q, v, gate, what) => {
    await passGate(q, gate, what);
    if (q.kind === 'tap') { await page.click(`[data-di-tr-opt="${v}"]`); return; }
    if (q.kind === 'tf') {
      await page.click(`[data-di-tr-tf="${v.truth}"]`);
      if (q.format === 'exam') { await page.click(`[data-di-tr-reason="${v.reason}"]`); await page.click('[data-di-tr-check]'); }
      return;
    }
    for (const [k, x] of Object.entries(v)) {
      if (k === 'fits') await page.selectOption('[data-di-tr="fits"]', x ? 'yes' : 'no');
      else await page.fill(`[data-di-tr="${k}"]`, String(x));
    }
    await page.click('[data-di-tr-check]');
  };
  /** Picks a card on the full map (on a phone the map steps aside while training: the tab « البطاقة » brings it back). */
  const knode = async (id) => { const n = page.locator(`[data-di-knode="${id}"]`); if (!(await n.isVisible())) await page.click('[data-di-tab="card"]'); await n.click(); };

  const allPosts = [];
  for (const card of Object.keys(TRAIN)) {
    await knode(card); await page.waitForTimeout(200);
    await page.click('[data-di-know-train]'); await page.waitForSelector('[data-di-trainer]');
    const seen = new Set();
    const formats = [];
    const sent0 = (await page.evaluate(() => window.__posts ?? [])).length;
    const firstTries = [];
    for (let i = 0; i < 6; i += 1) {
      const t = await tr();
      const { q } = t;
      const gate = { open: false };
      const what = `${card} · question ${i + 1} (${q.kind}, ${q.format})`;
      formats.push(t.dom);
      expect(t.index === i && q.format === t.dom, `${card} · question ${i + 1}: « ${q.kind} » in the ${q.format} format`);
      // the question on screen says ITS numbers
      const text = await trainerText();
      const nums = q.kind === 'tap' ? [q.wave.a ?? q.wave.b] : q.kind === 'tf' ? [] : [q.a];
      check(nums.every((x) => text.includes(String(x))), `${card} · question ${i + 1}: the screen says the question’s own number${nums.length ? ` (${nums.join(', ')})` : ''}`);
      if (q.format === 'exam') {
        check(await page.locator('[data-di-trainer] [data-di-paper], .di-trainer [data-di-paper]').count() >= 1 && await page.evaluate(() => window.__world.getState().paper === true), `${card} · question ${i + 1}: the exam format is answered in PAPER MODE (no music, the sign « وضع الورقة »)`);
        if (q.kind !== 'tf') {
          await passGate(q, gate, what); await page.waitForTimeout(1200); // the sheet opens with a short animation
          // the answer is typed in its own shape: every box sits in a line of the template, never a free text box
          const shape = await page.evaluate(() => [...document.querySelectorAll('.di-sheet input, .di-sheet select')].map((el) => ({ inLine: Boolean(el.closest('.di-sheet__line')), line: el.closest('.di-sheet__line')?.textContent.trim() ?? '' })));
          expect(shape.length > 0 && shape.every((x) => x.inLine), `${card} · question ${i + 1}: the answer boxes sit inside the template of the answer (${shape.length} boxes)`);
          // « تحقّق » is SEEN on the sheet — also under the mouse: on top at its centre, not faded out (0.4 is its disabled
          // look, before every box is filled), and its background stays dark when hovered (white letters on the paper otherwise)
          const look = () => page.evaluate(() => {
            const b = document.querySelector('[data-di-tr-check]');
            if (!b) return null;
            const r = b.getBoundingClientRect();
            const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            let op = 1;
            for (let x = b; x; x = x.parentElement) op *= Number(getComputedStyle(x).opacity);
            const m = getComputedStyle(b).backgroundColor.match(/[\d.]+/g).map(Number);
            const alpha = m.length > 3 ? m[3] : 1;
            const lum = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
            return { onTop: Boolean(top && (top === b || b.contains(top))), op: Number(op.toFixed(2)), bg: getComputedStyle(b).backgroundColor, dark: alpha >= 0.6 && lum < 0.5, h: Math.round(r.height) };
          });
          await page.mouse.move(2, 2);
          const rest = await look();
          await page.hover('[data-di-tr-check]', { force: true });
          const hovered = await look();
          await page.mouse.move(2, 2);
          check(rest && rest.onTop && rest.op >= 0.35 && rest.dark && rest.h >= 28, `${card} · question ${i + 1} (${q.kind}): the « تحقّق » button is seen on the sheet (${JSON.stringify(rest)})`);
          if (!TOUCH) check(hovered && hovered.dark, `${card} · question ${i + 1} (${q.kind}): under the mouse, « تحقّق » keeps its dark background (hovered: ${hovered?.bg})`);
          if (q.kind === 'stop') check(await page.evaluate(() => [...document.querySelectorAll('.di-sheet__line')].some((l) => l.textContent.includes('²') && l.textContent.includes('≤') && l.querySelectorAll('input').length === 2)), `${card}: « [d]² ≤ a < [e]² » is drawn as the line of the exam, two boxes`);
          if (q.kind === 'rule') check(await page.locator('.di-sheet select[data-di-tr="fits"]').count() === 1 && (await page.textContent('.di-sheet')).includes('القسمة على'), `${card}: the verdict is chosen in its sentence « إذن a [يقبل / لا يقبل] القسمة على b »`);
          if (q.kind === 'pairs') check(await page.locator('.di-sheet__line').count() === q.n && (await page.locator('.di-sheet__line').first().textContent()).includes('×'), `${card}: one line « a = [ ] × [ ] » per product (${q.n})`);
          if (q.kind === 'list') check(await page.locator('.di-sheet__line input').count() === divisorsOf(q.a).length, `${card}: as many boxes as ${q.a} has divisors`);
          if (q.kind === 'show') check(await page.locator('.di-sheet__line').count() === 2, `${card}: « a = b × [ ] », then « قاسم آخر للعدد a: [ ] »`);
        }
      }
      if (!seen.has(`${q.kind}:${q.format}`)) { seen.add(`${q.kind}:${q.format}`); await shot(page, `tr-${card}-${i + 1}-${q.kind}-${q.format}`, { exit: ['[data-di-know-close]'] }); }
      const plan = i === 0 || i === 2 ? 'wrong-right' : i === 4 ? 'wrong-wrong' : 'right';
      firstTries.push({ q, first: plan === 'right' ? 'right' : 'wrong', value: plan === 'right' ? solve(q) : wrongOf(q) });
      if (plan === 'right') {
        await reply(q, solve(q), gate, what); await page.waitForTimeout(150);
        expect((await tr()).fb === 'ok', `${card} · question ${i + 1} (${q.kind}): the right answer is accepted at once`);
      } else {
        await reply(q, wrongOf(q), gate, what); await page.waitForTimeout(150);
        let f = await tr();
        expect(f.fb === 'hint', `${card} · question ${i + 1} (${q.kind}): a wrong answer gets a HINT first (« ${f.fbText.trim().slice(0, 70)} »)`);
        if (q.kind === 'tap' && i === 0) await shot(page, `tr-${card}-hint-tap`, { exit: ['[data-di-know-close]'] });
        if (i === 2) await shot(page, `tr-${card}-hint-${q.kind}`, { exit: ['[data-di-know-close]'] });
        if (plan === 'wrong-right') {
          await reply(q, solve(q), gate, what); await page.waitForTimeout(150);
          f = await tr();
          expect(f.fb === 'ok', `${card} · question ${i + 1} (${q.kind}): …then the right answer is accepted`);
        } else {
          await reply(q, wrongOf(q), gate, what); await page.waitForTimeout(150);
          f = await tr();
          expect(f.fb === 'fix' && f.fbText.includes('التصحيح'), `${card} · question ${i + 1} (${q.kind}): a second wrong answer gets the written correction`);
          await shot(page, `tr-${card}-fix-${q.kind}`, { exit: ['[data-di-know-close]'] });
          // « اقرأ التصحيح على الورقة » comes with a wrong final answer exactly when the question's form carries a model sheet
          // (kit/Trainer.jsx: `!fb.ok && q.form?.model`; in this lesson, the « show » form — world/trainer.js › showForm)
          const hasModel = Boolean(q.form?.model);
          const modelBtn = await page.locator('[data-di-tr-model]').count();
          expect(modelBtn === (hasModel ? 1 : 0), `${what}: the model-sheet link is ${hasModel ? 'offered (its form has a model)' : 'absent (its form has no model)'} after the correction (found ${modelBtn})`);
          if (hasModel) {
            await page.click('[data-di-tr-model]'); await page.waitForSelector('[data-di-model]');
            for (let k = 0; k < 12 && await page.locator('[data-di-model-next]').count(); k += 1) await page.click('[data-di-model-next]');
            await shot(page, `tr-${card}-model`, { exit: ['[data-di-model-close]'] });
            await page.click('[data-di-model-close]');
          }
        }
      }
      if (i === 5) expect(await page.locator('[data-di-tr-next]').count() === 1, `${card}: after the last answer, « أنهِ التدريب »`);
      await page.click('[data-di-tr-next]'); await page.waitForTimeout(150);
    }
    expect(formats.join(',') === 'game,game,exam,game,exam,exam', `${card}: the formats alternate and end on the exam: ${formats.join(', ')}`);
    const kinds = new Set(firstTries.map((x) => x.q.kind));
    expect(TRAIN[card].every((k) => kinds.has(k)), `${card}: the session asked ${[...kinds].join(', ')}`);
    expect(await page.locator('[data-di-trainer="done"][data-di-tr-stars="1"]').count() === 1, `${card}: three right at the first try of six — 1 star`);
    await shot(page, `tr-${card}-done`, { exit: ['[data-di-know-close]'] });
    expect((await page.evaluate(() => window.__world.getState().know.trained))[card] === 1, `${card}: the star is saved on the card`);
    // الكفاءات: the FIRST try of every exam-format question that is not a true / false — right or wrong — is sent
    const posts = (await page.evaluate(() => window.__posts ?? [])).slice(sent0).map((p) => p.body);
    const owed = firstTries.filter((x) => x.q.format === 'exam' && x.q.kind !== 'tf' && !(x.q.kind === 'stop' && Number(x.value.e) !== Number(x.value.d) + 1));
    expect(posts.length === owed.length, `${card}: ${owed.length} answers are sent as evidence — the first try of each exam question, never a true / false, never a second try (sent ${posts.length})`);
    expect(posts.every((p) => p.context === 'trainer' && typeof p.attemptId === 'string' && p.attemptId.length > 6 && p.learningPoint === `4am_${ID}_${POINT[owed[0].q.key]}`), `${card}: each is { attemptId, learningPoint 4am_${ID}_${POINT[owed[0]?.q.key]}, context « trainer », claim }`);
    for (const [k, p] of posts.entries()) {
      const x = owed[k];
      const c = p.claim;
      const shapeOk = { pairs: () => (c.kind === 'divisors' && c.a === x.q.a && Array.isArray(c.list) && c.b === c.list.length) || (c.kind === 'pair' && c.a === x.q.a && Number.isFinite(c.b) && Number.isFinite(c.e)), show: () => c.kind === 'product' && c.a === x.q.a && c.b === x.q.b && c.q === Number(x.value.q) && c.other === Number(x.value.x), stop: () => c.kind === 'stop' && c.a === x.q.a && c.b === Number(x.value.d), list: () => c.kind === 'divisors' && c.a === x.q.a && c.list.length === divisorsOf(x.q.a).length, rule: () => c.kind === 'divisible' && c.a === x.q.a && c.b === x.q.b && typeof c.fits === 'boolean' }[x.q.kind]();
      // the verdict the server will compute, computed here: a wrong first try must make a FALSE claim, a right one a TRUE claim
      // a pairs sheet with a line that is not a product equal to a claims THAT line (`pair`, world/evidence.js — kit/claims.js)
      const truth = { pair: () => c.b > 0 && c.e > 0 && c.b * c.e === c.a, divisors: () => { const all = divisorsOf(c.a); return c.list.length === new Set(c.list).size && [...c.list].sort((m, n) => m - n).join() === all.join() && c.b === all.length; }, product: () => c.b * c.q === c.a && c.a % c.other === 0 && (c.other !== c.b || c.b === c.q), stop: () => c.b * c.b <= c.a && c.a < (c.b + 1) * (c.b + 1), divisible: () => c.fits === (c.a % c.b === 0) }[c.kind]();
      expect(shapeOk && truth === (x.first === 'right'), `${card}: evidence ${k + 1} (${x.q.kind}) carries what he WROTE at the first try — claim ${JSON.stringify(c).slice(0, 90)} — ${truth ? 'true' : 'false'} as his answer was ${x.first}`);
    }
    allPosts.push(...posts);
  }
  expect(new Set(allPosts.map((p) => p.attemptId)).size === allPosts.length, `every evidence has its own attempt id (${allPosts.length})`);
  // the way out of the page: back to the title screen
  await page.click('[data-di-know-close]'); await page.waitForSelector('[data-di-start]');
  expect((await page.evaluate(() => window.__world.getState().phase)) === 'title', '« خريطة المعارف » closes back to the title screen');
});
