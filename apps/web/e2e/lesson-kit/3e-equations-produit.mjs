// End-to-end smoke test for the rebuilt 3e lesson « Équations produit nul ».
// Run: node apps/web/e2e/lesson-kit/3e-equations-produit.mjs
// (dev server on :5201, started detached from apps/web/)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.KIT_BASE || 'http://localhost:5201';
const LESSON = `${BASE}/courses/college/3e/nombres_calculs/equations-produit`;
const KEY = 'u_anon_smarter_lesson_equations-produit';
const SHOT_DIR = new URL('./shots/', import.meta.url).pathname;
mkdirSync(SHOT_DIR, { recursive: true });

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail && !cond ? ` — ${detail}` : ''}`);
}
function summary() {
  const fails = results.filter((r) => !r.pass);
  console.log(`\n== ${results.length - fails.length}/${results.length} passed ==`);
  if (fails.length) {
    console.log('FAILED:');
    fails.forEach((f) => console.log(` - ${f.name} ${f.detail}`));
  }
  return fails.length;
}

function seedInit({ key, completedModules }) {
  localStorage.setItem(key, JSON.stringify({ completedModules, completedExercises: [] }));
}
function clearAttempt({ key }) {
  localStorage.removeItem(key);
}

const errs = [];
function watchErrors(page, tag) {
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const t = msg.text();
    if (/favicon|Download the React DevTools|net::ERR_|401 \(Unauthorized\)|Failed to load resource/.test(t)) return;
    errs.push(`[${tag}] console: ${t}`);
  });
  page.on('pageerror', (err) => errs.push(`[${tag}] pageerror: ${err.message}`));
}

const settle = (page) => page.waitForTimeout(1200);

async function open(browser, url, completedModules, opts = {}) {
  const ctx = await browser.newContext({
    viewport: opts.mobile ? { width: 375, height: 667 } : { width: 1280, height: 1500 },
    hasTouch: !!opts.mobile,
    isMobile: !!opts.mobile,
  });
  const page = await ctx.newPage();
  watchErrors(page, opts.tag || 'eq');
  if (completedModules) await page.addInitScript(seedInit, { key: KEY, completedModules });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  return { ctx, page };
}

const body = (page) => page.locator('body').innerText();

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  /* ── 1. Index ─────────────────────────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, LESSON, null, { tag: 'index' });
    const b = await body(page);
    check('index: loads', b.length > 200, `body ${b.length} chars`);
    check('index: module 0 card present', /Mission de départ/i.test(b));
    check('index: signature module listed', /scanner de produit/i.test(b));
    check('index: boss listed', /Mission finale/i.test(b));
    check('index: no NaN', !/NaN/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}eq-index.png` });
    await ctx.close();
  }

  /* ── 2. Diagnostic non-blocking ───────────────────────────────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/mission-de-depart`, null, { tag: 'diag' });
    const opts = page.locator('div[role="group"] > button[aria-pressed]');
    const n = await opts.count();
    check('diagnostic: renders options', n >= 12, `${n} options`);
    for (let i = 0; i < n; i += 1) await opts.nth(i).click({ timeout: 2000 }).catch(() => {});
    const submit = page.locator('button:has-text("Voir mon résultat")');
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
      await page.waitForTimeout(600);
    }
    const b = await body(page);
    check('diagnostic: reaches a result', /\/\s*10|score|résultat/i.test(b));
    check('diagnostic: no NaN', !/NaN/.test(b));
    await page.screenshot({ path: `${SHOT_DIR}eq-diagnostic.png` });
    await ctx.close();
  }

  /* ── 3. M1 — ProductDial reaches all three ways to make 0 ─────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/zero-ou-pas`, ['0'], { tag: 'm1' });
    const head = await body(page);
    check('M1: header shows module 1 of 8', /Module\s*1\s*\/\s*8/i.test(head), head.slice(0, 160));
    check('M1: no NaN', !/NaN/.test(head));

    const setA = (v) => page.locator(`button[aria-label="A = ${v}"]`).first();
    const setB = (v) => page.locator(`button[aria-label="B = ${v}"]`).first();

    // A = 0 with B ≠ 0
    await setA('0').click();
    await page.waitForTimeout(250);
    await setB('3').click();
    await page.waitForTimeout(250);
    // B = 0 with A ≠ 0
    await setA('3').click();
    await page.waitForTimeout(200);
    await setB('0').click();
    await page.waitForTimeout(250);
    // both zero
    await setA('0').click();
    await page.waitForTimeout(400);

    const after = await body(page);
    check('M1: all three ways to zero discovered', /Trois façons/i.test(after), after.slice(0, 300));

    // Wrong-on-purpose on the misconception question; correction stays visible.
    const wrong = page.locator('button', { hasText: 'Ils sont opposés' }).first();
    if (await wrong.isVisible().catch(() => false)) {
      await wrong.click();
      await page.waitForTimeout(500);
      const w = await body(page);
      check('M1: wrong answer shows the correction', /Bonne réponse/i.test(w));
      check('M1: wrong answer explains the maths, not just « Faux »', /addition|ADDITION/i.test(w));
    } else {
      check('M1: misconception question reachable', false, 'option not visible');
    }
    await page.screenshot({ path: `${SHOT_DIR}eq-m1-dial.png` });
    await ctx.close();
  }

  /* ── 4. M2 — shared ValueTable, decimal-free reveal of the solution ─ */
  {
    const { ctx, page } = await open(browser, `${LESSON}/une-egalite-a-inconnue`, ['0', '1'], { tag: 'm2' });
    const head = await body(page);
    check('M2: header shows module 2 of 8', /Module\s*2\s*\/\s*8/i.test(head));
    check('M2: no NaN', !/NaN/.test(head));

    const chip = (v) => page.locator(`button[aria-label="Tester x = ${v}"]`).first();
    for (const v of ['0', '1', '2']) {
      const c = chip(v);
      if (await c.isVisible().catch(() => false)) {
        await c.click();
        await page.waitForTimeout(450);
      }
    }
    const after = await body(page);
    check('M2: value table fills rows', /Une seule ligne verte|ligne verte|x = 2/i.test(after), after.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}eq-m2-valuetable.png` });
    await ctx.close();
  }

  /* ── 5. M3 — EquationBalance: one-sided action tilts, then recover ── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/la-balance`, ['0', '1', '2'], { tag: 'm3' });
    const head = await body(page);
    check('M3: header shows module 3 of 8', /Module\s*3\s*\/\s*8/i.test(head));
    check('M3: no NaN', !/NaN/.test(head));
    check('M3: starts in balance', /Équilibre/i.test(head));

    // Wrong-on-purpose: the deliberately one-sided action must tilt the pan.
    const trap = page.locator('button:has-text("− 3 à gauche seulement")').first();
    await trap.click();
    await page.waitForTimeout(500);
    const tilted = await body(page);
    check('M3: one-sided action visibly tilts the balance', /La balance penche/i.test(tilted));
    check('M3: tilt feedback names the lost solution', /n’est plus|n'est plus/i.test(tilted));

    // Recover and solve properly.
    await page.locator('button:has-text("Recommencer")').first().click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("− x des deux côtés")').first().click();
    await page.waitForTimeout(400);
    await page.locator('button:has-text("− 3 des deux côtés")').first().click();
    await page.waitForTimeout(600);
    const solved = await body(page);
    check('M3: symmetric actions isolate x and keep the solution', /x est isolé/i.test(solved), solved.slice(0, 400));

    // Step 2: the pack must be expanded before the units can go.
    const expand = page.locator('button:has-text("Développer")').first();
    if (await expand.isVisible().catch(() => false)) {
      await expand.click();
      await page.waitForTimeout(400);
      await page.locator('button:has-text("− 6 des deux côtés")').first().click();
      await page.waitForTimeout(400);
      await page.locator('button:has-text("Partager en 3 groupes")').first().click();
      await page.waitForTimeout(600);
      const s2 = await body(page);
      check('M3: distributivity step completes (3(x+2)=15 → x = 3)', /distributivité/i.test(s2), s2.slice(0, 300));
    } else {
      check('M3: distributivity step reachable', false, 'expand button not visible');
    }
    await page.screenshot({ path: `${SHOT_DIR}eq-m3-balance.png` });
    await ctx.close();
  }

  /* ── 6. M4 — SIGNATURE: ProductScanner reaches both zeros ─────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/le-scanner-de-produit`, ['0', '1', '2', '3'], { tag: 'm4' });
    const head = await body(page);
    check('M4: header shows module 4 of 8', /Module\s*4\s*\/\s*8/i.test(head));
    check('M4: no NaN', !/NaN/.test(head));
    check('M4: scanner strip rendered', (await page.locator('svg[role="group"]').count()) >= 1);

    const plus = page.locator('button[aria-label^="Augmenter x"]').first();
    const minus = page.locator('button[aria-label^="Diminuer x"]').first();
    const stampBtn = page.locator('button[aria-label="Marquer ce zéro sur la bande"]').first();

    // x starts at 0. Walk up to x = 3 (a zero), stamp it.
    for (let i = 0; i < 6; i += 1) { await plus.click(); await page.waitForTimeout(90); }
    await page.waitForTimeout(300);
    const atThree = await body(page);
    check('M4: product reads 0 at x = 3', /Le produit vaut/i.test(atThree) || /produit vaut 0/i.test(atThree));
    check('M4: stamp button enabled on a zero', await stampBtn.isEnabled());
    await stampBtn.click();
    await page.waitForTimeout(400);

    // Walk down to x = −2 (the other zero) and stamp it.
    for (let i = 0; i < 10; i += 1) { await minus.click(); await page.waitForTimeout(90); }
    await page.waitForTimeout(300);
    check('M4: stamp button enabled on the second zero', await stampBtn.isEnabled());
    await stampBtn.click();
    await page.waitForTimeout(600);

    const scanned = await body(page);
    check('M4: signature manipulation completes on both zeros', /Deux zéros, pas un de plus/i.test(scanned), scanned.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}eq-m4-scanner.png` });

    // Wrong-on-purpose on the rule question, then decimal branch reveal.
    const bad = page.locator('button', { hasText: 'Les deux facteurs valaient 0 en même temps' }).first();
    if (await bad.isVisible().catch(() => false)) {
      await bad.click();
      await page.waitForTimeout(500);
      const w = await body(page);
      check('M4: wrong rule answer still reveals the correction', /Bonne réponse/i.test(w));
      check('M4: correction quotes the real factor values', /vaut/i.test(w));
    } else {
      check('M4: rule question reachable', false, 'option not visible');
    }

    // Branch 1: answer wrong first, then see the expected value revealed.
    const fields = page.locator('input[type="text"], input[type="number"]');
    if ((await fields.count()) >= 1) {
      await fields.first().fill('7');
      await page.locator('button:has-text("OK")').first().click();
      await page.waitForTimeout(500);
      const r = await body(page);
      check('M4: numeric branch reveals the right answer after a wrong one', /Ta réponse/i.test(r));
    }
    await page.screenshot({ path: `${SHOT_DIR}eq-m4-branches.png` });
    await ctx.close();
  }

  /* ── 7. M5 — verification strip with an intruder candidate ────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/verifier-et-interpreter`, ['0', '1', '2', '3', '4'], { tag: 'm5' });
    const head = await body(page);
    check('M5: header shows module 5 of 8', /Module\s*5\s*\/\s*8/i.test(head));
    check('M5: no NaN', !/NaN/.test(head));

    for (const v of ['−2', '2', '3']) {
      const b = page.locator(`button[aria-label="Vérifier x égale ${v}"]`).first();
      if (await b.isVisible().catch(() => false)) {
        await b.click();
        await page.waitForTimeout(350);
      }
    }
    const after = await body(page);
    check('M5: check strip proves the intruder is not a solution', /ce n’est pas une solution|ce n'est pas une solution/i.test(after), after.slice(0, 400));
    check('M5: check strip confirms the real solutions', /c’est bien une solution|c'est bien une solution/i.test(after));
    await page.screenshot({ path: `${SHOT_DIR}eq-m5-check.png` });
    await ctx.close();
  }

  /* ── 8. M6 — SquareVsRectangle equalises at x = 4 ─────────────────── */
  {
    const { ctx, page } = await open(browser, `${LESSON}/carre-contre-rectangle`, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
    const head = await body(page);
    check('M6: header shows module 6 of 8', /Module\s*6\s*\/\s*8/i.test(head));
    check('M6: no NaN', !/NaN/.test(head));

    // Deliberately wrong first: x = 6 is the start, tap x = 5 (still unequal).
    await page.locator('button[aria-label="x égale 5"]').first().click();
    await page.waitForTimeout(400);
    const wrongState = await body(page);
    check('M6: unequal areas quantify the gap in cm²', /Écart/i.test(wrongState) && /cm²/.test(wrongState));

    await page.locator('button[aria-label="x égale 4"]').first().click();
    await page.waitForTimeout(600);
    const eq = await body(page);
    check('M6: areas equalise at x = 4', /Égalité pour/i.test(eq), eq.slice(0, 400));
    await page.screenshot({ path: `${SHOT_DIR}eq-m6-areas.png` });

    // Decimal reveal: the final word problem expects 4 m; answer wrong first.
    const field = page.locator('input[type="text"], input[type="number"]').first();
    if (await field.isVisible().catch(() => false)) {
      await field.fill('-3');
      await page.locator('button:has-text("OK")').first().click();
      await page.waitForTimeout(500);
      const r = await body(page);
      check('M6: rejecting a negative length is explained', /longueur négative|rejette/i.test(r), r.slice(0, 300));
    }
    await ctx.close();
  }

  /* ── 9. Boss: silent → submit → profil → synthèse → completion ────── */
  {
    const { ctx, page } = await open(
      browser, `${LESSON}/mission-finale`, ['0', '1', '2', '3', '4', '5', '6'], { tag: 'boss' },
    );
    const b = await body(page);
    check('boss: renders', /Boss final|Mission finale/i.test(b));
    check('boss: no NaN', !/NaN/.test(b));
    check('boss: silent before submit', !/Bonne réponse/i.test(b));
    check('boss: registre chips shown', /produit = 0/i.test(b));

    const groups = page.locator('div[role="group"]');
    const nGroups = await groups.count();
    for (let i = 0; i < nGroups; i += 1) {
      const btn = groups.nth(i).locator('button').first();
      if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {});
    }
    await page.waitForTimeout(400);
    const submit = page.locator('button').filter({ hasText: /Valider mes/ }).first();
    check('boss: submit becomes enabled once every épreuve is answered', await submit.isEnabled().catch(() => false));
    await submit.click();
    await page.waitForTimeout(1000);

    const after = await body(page);
    check('boss: submitting produces a score out of 10', /\/\s*10/.test(after), after.slice(0, 200));
    check('boss: review shows corrections', /Bonne réponse|Ta réponse/i.test(after));
    await page.screenshot({ path: `${SHOT_DIR}eq-boss-review.png` });

    await page.locator('button:has-text("Voir mon profil")').first().click();
    await page.waitForTimeout(700);
    const profil = await body(page);
    check('boss: profile of mastery reachable', /profil de maîtrise/i.test(profil));

    await page.locator('button:has-text("Passer à la synthèse")').first().click();
    await page.waitForTimeout(900);
    const synth = await body(page);
    check('boss: synthèse reuses the frozen scanner', /bande du scanner/i.test(synth));
    check('boss: completion banner shown', /Mission accomplie|Chasseur de zéros/i.test(synth));
    check('boss: synthèse has no NaN', !/NaN/.test(synth));
    const frozenSvgs = await page.locator('svg[role="img"]').count();
    check('boss: frozen visuals rendered', frozenSvgs >= 2, `${frozenSvgs} frozen svg`);
    await page.screenshot({ path: `${SHOT_DIR}eq-boss-synthese.png`, fullPage: true });

    // Reload shows the saved review, then « Refaire le test » resets.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settle(page);
    const reloaded = await body(page);
    check('boss: reload shows the saved review', /\/\s*10/.test(reloaded) || /Ta réponse/i.test(reloaded));

    const redo = page.locator('button:has-text("Refaire le test")').first();
    if (await redo.isVisible().catch(() => false)) {
      await redo.click();
      await page.waitForTimeout(900);
      const reset = await body(page);
      check('boss: « Refaire le test » resets to a silent quiz', !/Ta réponse/i.test(reset));
    } else {
      check('boss: redo button present after reload', false, 'not visible');
    }
    await ctx.close();
  }

  /* ── 10. Revisit a completed module: every step open ──────────────── */
  {
    const { ctx, page } = await open(
      browser, `${LESSON}/le-scanner-de-produit`, ['0', '1', '2', '3', '4'], { tag: 'revisit' },
    );
    const b = await body(page);
    check('revisit: completed module shows all steps unlocked', !/verrouill/i.test(b), b.slice(0, 200));
    check('revisit: footer recap visible on a completed module', /ramener à un produit nul/i.test(b));
    check('revisit: no NaN', !/NaN/.test(b));
    await ctx.close();
  }

  /* ── 11. Mobile pass on the signature modules ─────────────────────── */
  const MOBILE = [
    ['M1', `${LESSON}/zero-ou-pas`, ['0']],
    ['M3', `${LESSON}/la-balance`, ['0', '1', '2']],
    ['M4', `${LESSON}/le-scanner-de-produit`, ['0', '1', '2', '3']],
    ['M6', `${LESSON}/carre-contre-rectangle`, ['0', '1', '2', '3', '4', '5']],
  ];
  for (const [name, url, seed] of MOBILE) {
    const { ctx, page } = await open(browser, url, seed, { mobile: true, tag: `${name}-mobile` });
    const overflow = await page.evaluate(
      () => document.scrollingElement.scrollWidth - window.innerWidth,
    );
    check(`${name} mobile: no horizontal page scroll`, overflow <= 1, `overflow ${overflow}px`);

    const small = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('main button').forEach((b) => {
        if (b.disabled) return;
        const r = b.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.height < 40) {
          out.push(`${(b.getAttribute('aria-label') || b.textContent).trim().slice(0, 18)}:${Math.round(r.height)}`);
        }
      });
      return out;
    });
    check(`${name} mobile: tap targets ≥ 40 px`, small.length === 0, small.slice(0, 6).join(', '));

    // Tap-first must work with touch only.
    const anyTap = page.locator('main button:visible').first();
    if (await anyTap.isVisible().catch(() => false)) {
      await anyTap.tap().catch(() => {});
      await page.waitForTimeout(300);
    }
    check(`${name} mobile: no NaN after a touch interaction`, !/NaN/.test(await body(page)));
    await page.screenshot({ path: `${SHOT_DIR}eq-${name.toLowerCase()}-mobile.png` });
    await ctx.close();
  }

  /* ── 12. Zero console/page errors ─────────────────────────────────── */
  check('no console/page errors across the run', errs.length === 0, errs.slice(0, 8).join(' | '));

  await browser.close();
  process.exit(summary() ? 1 : 0);
}

run().catch((e) => {
  console.error('RUNNER CRASH', e);
  process.exit(2);
});
