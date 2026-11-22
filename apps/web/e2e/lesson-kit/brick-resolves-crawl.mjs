// Crawl : ouvre CHAQUE module de CHAQUE leçon montée (lessonIndex.generated.json) dans un vrai navigateur et échoue
// si une <KnowledgeBrick> affiche « aucun item … dans knowledge.jsx » (carte de connaissances absente ou périmée).
//   QA_BASE=http://localhost:5173 [ONLY=kitabat-adad-tabii,…] node apps/web/e2e/lesson-kit/brick-resolves-crawl.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const index = JSON.parse(readFileSync(new URL('../../src/lessons/lessonIndex.generated.json', import.meta.url), 'utf8'));
const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: 'qa-prof@smarter.dz', password: process.env.QA_PASSWORD || 'QaPass2026!' }) });
const d = await res.json();
const token = d.token ?? d.access_token ?? d.data?.token;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'ar' });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch { /* noop */ } }, token);
const page = await ctx.newPage();
const bad = [];
let n = 0;
for (const l of index.lessons.filter((x) => !ONLY.length || ONLY.includes(x.id))) {
  for (const [, slug] of l.modules) {
    const url = `${BASE}/courses/${l.level}/${l.grade}/${l.chapter}/${l.id}/${slug}`;
    let loaded = false;
    for (let t = 0; t < 3 && !loaded; t += 1) {
      try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); loaded = true; } catch { /* retry */ }
    }
    if (!loaded) { console.log('⚠ timeout', l.id, slug); continue; }
    await page.waitForSelector('main h1, main h2', { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(700);
    const txt = await page.evaluate(() => document.body.innerText);
    n += 1;
    const m = txt.match(/aucun item « ([^»]+) »/g);
    if (m) { bad.push(`${l.id}/${slug}: ${m.join(' ; ')}`); console.log('✗', l.id, slug, m.join(' ; ')); }
  }
}
await browser.close();
console.log(`${n} modules ouverts, ${bad.length} en échec`);
process.exit(bad.length ? 1 : 0);
