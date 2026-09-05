// Audit des ÉTATS EXTRÊMES atteignables : on pousse le curseur et les
// réglages jusqu'à leurs bornes, puis on revérifie la mise en page.
import { chromium } from 'playwright';
const BASE = process.env.KIT_BASE || 'http://localhost:5213';
const ROOT = `${BASE}/courses/college/3e/donnees_probabilites/fonctions-3e`;
const KEY = 'u_anon_smarter_lesson_fonctions-3e';
const ALL = ['0','1','2','3','4','5','6','7','8'];

const audit = (page) => page.evaluate(() => {
  const out = [];
  for (const svg of document.querySelectorAll('svg')) {
    const vb = svg.viewBox?.baseVal;
    if (!vb || !vb.width) continue;
    for (const t of svg.querySelectorAll('text')) {
      let bb; try { bb = t.getBBox(); } catch { continue; }
      if (bb.width === 0) continue;
      if (bb.x < -0.5 || bb.y < -0.5 || bb.x + bb.width > vb.width + 0.5 || bb.y + bb.height > vb.height + 0.5)
        out.push(`hors cadre "${t.textContent}" x=${bb.x.toFixed(1)} w=${bb.width.toFixed(1)} vb=${vb.width}`);
    }
    const boxes = [...svg.querySelectorAll('text')].map((t) => {
      try { const b = t.getBBox(); return { t: t.textContent, ...b }; } catch { return null; }
    }).filter((b) => b && b.width > 0);
    for (let i = 0; i < boxes.length; i += 1)
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i], c = boxes[j];
        if (a.x < c.x + c.width && c.x < a.x + a.width && a.y < c.y + c.height && c.y < a.y + a.height)
          out.push(`chevauchement "${a.t}" ↔ "${c.t}"`);
      }
  }
  return out;
});

const b = await chromium.launch();
let problems = 0;
const report = (label, bad) => {
  if (bad.length) { problems += bad.length; console.log(`FAIL ${label}`); bad.forEach((x) => console.log('   ', x)); }
  else console.log(`PASS ${label}`);
};

for (const w of [375, 900]) {
  // ── M4 : le point mobile poussé dans les quatre coins ──
  {
    const ctx = await b.newContext({ viewport: { width: w, height: 2400 }, hasTouch: w === 375 });
    const p = await ctx.newPage();
    await p.addInitScript(({ key, mods }) => localStorage.setItem(key, JSON.stringify({ completedModules: mods, completedExercises: [] })), { key: KEY, mods: ALL });
    await p.goto(`${ROOT}/du-tableau-au-repere`, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(1400);
    const zone = p.locator('rect[role="slider"]').first();
    if (await zone.count()) {
      await zone.focus();
      // Coins extrêmes via le clavier (chemin obligatoire, et déterministe).
      for (const seq of [['Home','PageDown'], ['End','PageUp'], ['Home','PageUp'], ['End','PageDown']]) {
        for (const k of seq) await p.keyboard.press(k);
        await p.waitForTimeout(250);
        report(`M4 point au coin ${seq.join('+')} @${w}px`, await audit(p));
      }
    } else report(`M4 zone tactile absente @${w}px`, ['pas de rect[role=slider]']);
    await ctx.close();
  }

  // ── M7 : curseur des forfaits d'un bout à l'autre (0 → 120 min) ──
  {
    const ctx = await b.newContext({ viewport: { width: w, height: 2400 }, hasTouch: w === 375 });
    const p = await ctx.newPage();
    await p.addInitScript(({ key, mods }) => localStorage.setItem(key, JSON.stringify({ completedModules: mods, completedExercises: [] })), { key: KEY, mods: ALL });
    await p.goto(`${ROOT}/la-machine-dans-la-vraie-vie`, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(1400);
    const zones = p.locator('rect[role="slider"]');
    const n = await zones.count();
    if (n) {
      const cur = zones.last();
      await cur.focus();
      await p.keyboard.press('Home');  await p.waitForTimeout(250);
      report(`M7 curseur à 0 min @${w}px`, await audit(p));
      await p.keyboard.press('End');   await p.waitForTimeout(250);
      report(`M7 curseur à 120 min @${w}px`, await audit(p));
      // Un cran avant/après le croisement (60 min).
      for (let i = 0; i < 7; i += 1) await p.keyboard.press('ArrowLeft');
      await p.waitForTimeout(250);
      report(`M7 curseur près du croisement @${w}px`, await audit(p));
    } else report(`M7 aucun curseur @${w}px`, ['pas de rect[role=slider]']);
    await ctx.close();
  }
}
await b.close();
console.log(problems ? `\n${problems} problème(s)` : '\nAucun problème dans les états extrêmes');
process.exit(problems ? 1 : 0);
