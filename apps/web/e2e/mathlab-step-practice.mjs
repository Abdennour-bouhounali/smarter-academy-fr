// Math Lab — solutions pas à pas (MATH_LAB.md §3.4.1), vérifiées dans un vrai navigateur
// sur les routes enseignant (qa-prof@smarter.dz), à 1280 et 390 px. Vite sur 5173, API sur 8000.
// Lancement : node apps/web/e2e/mathlab-step-practice.mjs — captures dans /tmp/mathlab-steps-qa.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = process.env.QA_OUT || '/tmp/mathlab-steps-qa';
mkdirSync(OUT, { recursive: true });
const res = await fetch('http://localhost:8000/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: 'qa-prof@smarter.dz', password: 'QaPass2026!' }) });
const d = await res.json(); const token = d.token ?? d.data?.token;
const browser = await chromium.launch();
let ok = 0, ko = 0;
const check = (c, l) => { if (c) ok++; else { ko++; console.log('  ✗', l); } };
for (const vp of [{ width: 1280, height: 800, n: 'd' }, { width: 390, height: 844, n: 'm', touch: true }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.touch, isMobile: !!vp.touch, locale: 'ar-DZ' });
  await ctx.addInitScript((tk) => { localStorage.setItem('token', tk); localStorage.removeItem('sa-ml-step-player'); localStorage.removeItem('sa-ml-step-dock'); }, token);
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  await page.goto('http://localhost:5173/enseignant/atelier/algebre?lab=secondaire', { waitUntil: 'networkidle' });
  await page.fill('[data-ml-equation-input]', '2x + 3 = 9'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  await page.locator('[data-ml-alg-solve]').first().click(); await page.waitForTimeout(600);
  const bar = page.locator('.sa-ml-kit-player.is-floating').first();
  const box = await bar.boundingBox();
  const stage = await page.locator('.sa-ml-alg__stage').first().boundingBox();
  check(box && box.y < 260 && Math.abs((box.x + box.width) - (stage.x + stage.width)) < 40, `toolbar opens top-right (${JSON.stringify(box)} stage ${JSON.stringify(stage)})`);
  check(await page.locator('[data-ml-alg-step-mode="manual"][aria-checked="true"]').count() === 1, 'default mode manual');
  check(await page.locator('.is-attention').count() === 1, 'forward button pulses at the beginning');
  // drag
  const grip = await page.locator('[data-ml-alg-step-grip]').first().boundingBox();
  await page.mouse.move(grip.x + 5, grip.y + 10); await page.mouse.down(); await page.mouse.move(grip.x - 120, grip.y + 200, { steps: 6 }); await page.mouse.up();
  const moved = await bar.boundingBox();
  check(Math.abs(moved.y - box.y) > 100, `toolbar drags (${box.y} → ${moved.y})`);
  await page.dblclick('[data-ml-alg-step-grip]'); await page.waitForTimeout(250);
  const back = await bar.boundingBox();
  check(Math.abs(back.y - box.y) < 4, `double-click puts it back (${back.y})`);
  // minimize
  await page.click('[data-ml-alg-step-minimize]'); await page.waitForTimeout(200);
  check(await page.locator('.sa-ml-kit-player.is-minimized .sa-ml-kit-player__position').count() === 0
    && await page.locator('.sa-ml-kit-player.is-minimized [data-ml-alg-step-mode]').count() === 0, 'reduced: icons only, no progress/mode');
  await page.screenshot({ path: `${OUT}/${vp.n}-p-minimized.png` });
  await page.click('[data-ml-alg-step-minimize]'); await page.waitForTimeout(200);
  // practice
  await page.click('[data-ml-alg-step-mode="practice"]'); await page.waitForTimeout(300);
  await page.click('[data-ml-alg-step-restart]').catch(() => {}); await page.waitForTimeout(400);
  check(await page.locator('[data-ml-board-practice="pick"]').count() === 1, 'practice: first frame is an exercise');
  check(await page.locator('[data-ml-alg-step-next]').first().isDisabled(), 'practice: next blocked until answered');
  await page.screenshot({ path: `${OUT}/${vp.n}-p-eq-1.png` });
  await page.locator('[data-mb-pick]').first().click(); await page.waitForTimeout(250);   // 2x — wrong
  check((await page.locator('[data-ml-board-feedback]').getAttribute('data-ml-board-feedback')) === 'error', 'practice: wrong pick gets feedback');
  await page.screenshot({ path: `${OUT}/${vp.n}-p-eq-wrong.png` });
  const picks = await page.locator('[data-mb-pick]').evaluateAll((n) => n.map((e) => [e.getAttribute('data-mb-pick'), e.textContent]));
  const plus3 = picks.find(([, text]) => text.includes('3'));
  await page.click(`[data-mb-pick="${plus3[0]}"]`); await page.waitForTimeout(250);
  check(await page.locator('[data-mb-operator]').count() === 4, 'practice: operator palette after correct pick');
  await page.screenshot({ path: `${OUT}/${vp.n}-p-eq-ops.png` });
  await page.click('[data-mb-operator="subtract"]'); await page.waitForTimeout(300);
  check(await page.locator('[data-mb-answer-input]').count() === 1, 'practice: the student must compute the result');
  await page.fill('[data-mb-answer-input]', '5'); await page.click('[data-mb-answer-check]'); await page.waitForTimeout(250);
  check((await page.locator('[data-ml-board-feedback]').getAttribute('data-ml-board-feedback')) === 'error', 'practice: wrong result refused');
  await page.fill('[data-mb-answer-input]', '6');
  await page.screenshot({ path: `${OUT}/${vp.n}-p-eq-answer.png` });
  await page.click('[data-mb-answer-check]'); await page.waitForTimeout(1400);
  check(await page.locator('[data-ml-board-practice]').count() === 0, 'practice: correct result advances');
  await page.screenshot({ path: `${OUT}/${vp.n}-p-eq-after.png` });
  // Second operation: ÷ 2 — find the next exercise.
  for (let i = 0; i < 4 && !(await page.locator('[data-ml-board-practice="pick"]').count()); i++) {
    await page.locator('[data-ml-alg-step-next]').first().click(); await page.waitForTimeout(300);
  }
  const picks2 = await page.locator('[data-mb-pick]').evaluateAll((n) => n.map((e) => [e.getAttribute('data-mb-pick'), e.textContent]));
  const twoX = picks2.find(([, text]) => text.includes('2') && text.includes('x'));
  await page.click(`[data-mb-pick="${twoX[0]}"]`); await page.waitForTimeout(200);
  await page.click('[data-mb-operator="divide"]'); await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${vp.n}-p-eq-answer2.png` });
  await page.fill('[data-mb-answer-input]', '3'); await page.click('[data-mb-answer-check]'); await page.waitForTimeout(1400);
  for (let i = 0; i < 6; i++) {
    const next = page.locator('[data-ml-alg-step-next]').first();
    if (!(await next.count()) || await next.isDisabled()) break;
    await next.click(); await page.waitForTimeout(300);
  }
  const sol = await page.locator('[data-ml-solution]').innerText().catch(() => '');
  check(sol.includes('3'), `practice: the student reached x = 3 (${sol.replace(/\s+/g, ' ')})`);
  // factor practice
  await page.locator('[data-ml-alg-tab="factor"]').evaluate((el) => el.click()); await page.waitForTimeout(400);
  await page.fill('[data-ml-alg-factor-input]', 'x^2 + 5x + 6'); await page.locator('[data-ml-alg-factor-run]').evaluate((el) => el.click()); await page.waitForTimeout(500);
  let exercises = 0;
  for (let i = 0; i < 30; i++) {
    if (await page.locator('[data-ml-board-practice="pick"]').count()) {
      exercises++;
      await page.screenshot({ path: `${OUT}/${vp.n}-p-factor-ex${exercises}.png` });
      await page.click('[data-ml-alg-step-reveal-step]'); await page.waitForTimeout(300);
    }
    const next = page.locator('[data-ml-alg-step-next]').first();
    if (!(await next.count()) || await next.isDisabled()) break;
    await next.click(); await page.waitForTimeout(350);
  }
  check(exercises >= 3, `factor: ${exercises} exercises met (reveal used)`);
  await page.screenshot({ path: `${OUT}/${vp.n}-p-factor-final.png` });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 1, `no page overflow (${overflow})`);
  check(errs.length === 0, `no page errors ${errs.slice(0, 2).join(' | ')}`);
  await ctx.close();
}
await browser.close();
console.log(`${ok} ✓ · ${ko} ✗`);
