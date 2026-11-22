// QA — « شاهد البداية » se superpose à l'accueil de la mission (propriétaire, 2026-11-11) : l'accroche a la MÊME taille (zoom du lecteur),
// la MÊME largeur de carte, et son bouton (« لا أعرف بعد… » / « أجرّب ») est au MÊME pixel que « ابدأ : … » / « واصل : … » de l'accueil.
// Pour chaque leçon convertie (`studentView: 'mission'`) et chaque taille : l'accueil (déjà ouvert, rien de fait), puis « شاهد البداية ».
// Lancement (Vite sur 5173 ; l'API n'est PAS nécessaire — la session est simulée dans la page) :
//   node apps/web/e2e/mission-opening-align.mjs                    toutes les leçons converties, 1366×768, 1024×768, 1920×1080
//   node apps/web/e2e/mission-opening-align.mjs nashr-tabsit       ces leçons seulement
//   QA_SIZES=1366x768 node apps/web/e2e/mission-opening-align.mjs …
// Code de sortie 1 si un écart : zoom différent, largeur ±2 px, bouton ±2 px, ou un débordement.
import { chromium } from 'playwright';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const SIZES = (process.env.QA_SIZES || '1366x768,1024x768,1920x1080').split(',').map((s) => s.split('x').map(Number));
const SRC = new URL('../src/lessons/', import.meta.url).pathname;
const INDEX = JSON.parse(readFileSync(join(SRC, 'lessonIndex.generated.json'), 'utf8')).lessons;

function missionLessons(dir = join(SRC, 'moyen')) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    try { if (readFileSync(join(p, 'lesson.config.js'), 'utf8').includes("studentView: 'mission'")) { out.push(name); continue; } } catch { /* pas une leçon */ }
    out.push(...missionLessons(p));
  }
  return out;
}
const ids = process.argv.slice(2).length ? process.argv.slice(2) : missionLessons();
const USER = { id: 9001, name: 'تلميذ تجريبي', email: 'eleve@example.com', grade: '4am', level: 'moyen', email_verified_at: '2026-01-01T00:00:00Z', nameComplete: true, firstName: 'تلميذ', lastName: 'تجريبي', role: 'student', roles: ['student'] };

const measure = (page) => page.evaluate(() => {
  const box = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), left: Math.round(b.left), width: Math.round(b.width) }; };
  const z = document.querySelector('[data-fit-zoom]');
  return {
    zoom: z?.dataset.fitZoom ?? null,
    overflow: z?.dataset.fitOverflow === 'true' || document.scrollingElement.scrollHeight > innerHeight + 1,
    hero: box('[data-mission-hero]'),
    btn: box('[data-mission-continue]') || box('[data-mission-start]'),
  };
});

let bad = 0;
const browser = await chromium.launch({ args: ['--no-sandbox'] });
for (const [w, h] of SIZES) {
  for (const id of ids) {
    const L = INDEX.find((l) => l.id === id);
    if (!L) { console.log(`? ${id}: not in lessonIndex.generated.json`); continue; }
    const seed = { [`u_9001_smarter_mission_${id}`]: { opened: true, seen: {}, answered: {} } };
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    await ctx.addInitScript(({ user, seed }) => {
      try { localStorage.setItem('token', 'qa-fake-token'); } catch { /* */ }
      for (const [k, v] of Object.entries(seed)) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* */ } }
      const real = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        const url = typeof input === 'string' ? input : input.url;
        if (url.includes('/api/')) {
          const ok = (b) => new Response(JSON.stringify(b), { status: 200, headers: { 'Content-Type': 'application/json' } });
          if (url.includes('/auth/me')) return ok({ success: true, user });
          if (/\/lessons\/[^/]+\/answers/.test(url)) return ok({ success: true, answers: {} });
          return ok({ success: true, data: [] });
        }
        return real(input, init);
      };
    }, { user: USER, seed });
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}/courses/${L.level}/${L.grade}/${L.chapter}/${id}`, { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-mission-replay]', { timeout: 15000 });
      await page.waitForTimeout(1200);
      const home = await measure(page);
      await page.click('[data-mission-replay]');
      await page.waitForSelector('[data-mission-opening]');
      await page.waitForTimeout(1200);
      const op = await measure(page);
      const issues = [];
      if (home.zoom !== op.zoom) issues.push(`zoom ${home.zoom}→${op.zoom}`);
      if (Math.abs(home.hero.width - op.hero.width) > 2 || Math.abs(home.hero.left - op.hero.left) > 2) issues.push(`card ${home.hero.width}→${op.hero.width}`);
      if (Math.abs(home.btn.top - op.btn.top) > 2 || Math.abs(home.btn.width - op.btn.width) > 2) issues.push(`button y ${home.btn.top}→${op.btn.top}`);
      if (home.overflow || op.overflow) issues.push('OVERFLOW');
      if (issues.length) bad++;
      console.log(`${issues.length ? '✗' : '✓'} ${w}×${h} ${id}${issues.length ? ` — ${issues.join(', ')}` : ` (zoom ${op.zoom})`}`);
    } catch (e) {
      bad++;
      console.log(`✗ ${w}×${h} ${id} — ${e.message.split('\n')[0]}`);
    }
    await ctx.close();
  }
}
await browser.close();
console.log(bad ? `\n${bad} écart(s)` : '\nall aligned');
process.exit(bad ? 1 : 0);
