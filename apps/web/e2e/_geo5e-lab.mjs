/** Capture le Nième SVG de la page (le laboratoire), après des clics. */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:5271';
const OUT = process.env.OUT || '/tmp/claude-1000/-home-abdennour-websites-smarter-academy-v2/c36825ca-c545-48d1-aba2-29cdecf4d47f/scratchpad/shots';
const a = process.argv.slice(2);
const [path, name] = a;
const clicks = []; let idx = 0; let width = 1440;
for (let i = 2; i < a.length; i += 1) {
  if (a[i] === '--click') { clicks.push(a[i + 1]); i += 1; }
  if (a[i] === '--svg') { idx = Number(a[i + 1]); i += 1; }
  if (a[i] === '--w') { width = Number(a[i + 1]); i += 1; }
}
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 2 });
const p = await c.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
// Déverrouiller les modules précédents : la clé de progression est PORTÉE
// PAR UTILISATEUR (u_anon_...), jamais la clé nue.
const lesson = process.env.LESSON;
if (lesson) {
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  await p.evaluate(([id]) => {
    localStorage.setItem(`u_anon_smarter_lesson_${id}`, JSON.stringify({
      completedModules: ['0', '1', '2', '3', '4', '5', '6', '7'], xp: 500,
    }));
  }, [lesson]);
}
await p.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
await p.waitForTimeout(500);
for (const t of clicks) {
  await p.getByRole('button', { name: new RegExp(t, 'i') }).first().click({ timeout: 8000 })
    .catch((e) => console.log(`  ⚠ ${t}: ${e.message.split('\n')[0]}`));
  await p.waitForTimeout(1700);
}
const svgs = await p.locator('svg').all();
const target = svgs[idx];
await target.screenshot({ path: `${OUT}/${name}.png` }).catch((e) => console.log('shot: ' + e.message));
if (errs.length) { console.log('ERREURS:'); errs.forEach((e) => console.log('  ' + e)); }
console.log(`→ ${name}.png  (svg ${idx} sur ${svgs.length})`);
await b.close();
