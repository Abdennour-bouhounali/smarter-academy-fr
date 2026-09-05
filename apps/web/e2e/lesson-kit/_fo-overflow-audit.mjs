// Audit de débordement — vérifie qu'AUCUN texte SVG ne sort de son viewBox,
// sur les états réellement atteignables des manipulations de fonctions-3e.
import { chromium } from 'playwright';
const BASE = process.env.KIT_BASE || 'http://localhost:5213';
const ROOT = `${BASE}/courses/college/3e/donnees_probabilites/fonctions-3e`;
const KEY = 'u_anon_smarter_lesson_fonctions-3e';
const ALL = ['0','1','2','3','4','5','6','7','8'];

const audit = async (page) => page.evaluate(() => {
  const out = [];
  for (const svg of document.querySelectorAll('svg')) {
    const vb = svg.viewBox?.baseVal;
    if (!vb || !vb.width) continue;
    for (const t of svg.querySelectorAll('text')) {
      let bb; try { bb = t.getBBox(); } catch { continue; }
      if (bb.width === 0) continue;
      if (bb.x < -0.5 || bb.y < -0.5 || bb.x + bb.width > vb.width + 0.5 || bb.y + bb.height > vb.height + 0.5) {
        out.push(`"${t.textContent}" x=${bb.x.toFixed(1)} w=${bb.width.toFixed(1)} / viewBox ${vb.width}×${vb.height}`);
      }
    }
    // Collisions entre étiquettes du même SVG.
    const boxes = [...svg.querySelectorAll('text')].map((t) => {
      try { const b = t.getBBox(); return { t: t.textContent, ...b }; } catch { return null; }
    }).filter((b) => b && b.width > 0);
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i], c = boxes[j];
        const ov = a.x < c.x + c.width && c.x < a.x + a.width && a.y < c.y + c.height && c.y < a.y + a.height;
        if (ov) out.push(`CHEVAUCHEMENT "${a.t}" ↔ "${c.t}"`);
      }
    }
  }
  return out;
});

const b = await chromium.launch();
let problems = 0;
for (const [name, slug] of [
  ['M4 repère', 'du-tableau-au-repere'],
  ['M5 trois allures', 'lineaire-affine-ou-ni-lun-ni-lautre'],
  ['M6 escalier', 'retrouver-la-regle'],
  ['M7 taxi + forfaits', 'la-machine-dans-la-vraie-vie'],
  ['Boss synthèse', 'mission-finale-latelier-des-machines'],
]) {
  for (const w of [375, 900]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 2400 }, hasTouch: w === 375 });
    const p = await ctx.newPage();
    await p.addInitScript(({ key, mods }) => {
      localStorage.setItem(key, JSON.stringify({ completedModules: mods, completedExercises: [] }));
    }, { key: KEY, mods: ALL });
    await p.goto(`${ROOT}/${slug}`, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(1400);
    const bad = await audit(p);
    if (bad.length) { problems += bad.length; console.log(`FAIL ${name} @${w}px`); bad.forEach((x) => console.log('   ', x)); }
    else console.log(`PASS ${name} @${w}px — aucun texte hors cadre, aucun chevauchement`);
    await ctx.close();
  }
}
await b.close();
console.log(problems ? `\n${problems} problème(s) de mise en page` : '\nAucun problème de mise en page');
process.exit(problems ? 1 : 0);
