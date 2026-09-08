/**
 * Capture ciblée d'un laboratoire, après avoir joué une interaction.
 * usage : node _geo5e-shot.mjs <path> <nom> [--click "texte du bouton"]... [--w 1440]
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5271';
const OUT = process.env.OUT || '/tmp/claude-1000/-home-abdennour-websites-smarter-academy-v2/c36825ca-c545-48d1-aba2-29cdecf4d47f/scratchpad/shots';
const args = process.argv.slice(2);
const path = args[0];
const name = args[1];
const clicks = [];
let width = 1440;
for (let i = 2; i < args.length; i += 1) {
  if (args[i] === '--click') { clicks.push(args[i + 1]); i += 1; }
  if (args[i] === '--w') { width = Number(args[i + 1]); i += 1; }
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

for (const c of clicks) {
  const el = page.getByRole('button', { name: new RegExp(c, 'i') }).first();
  await el.click({ timeout: 8000 }).catch((e) => console.log(`  ⚠ clic "${c}" : ${e.message.split('\n')[0]}`));
  await page.waitForTimeout(1800);
}

await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
if (errs.length) { console.log('ERREURS:'); errs.forEach((e) => console.log('  ' + e)); }
console.log(`→ ${OUT}/${name}.png`);
await browser.close();
