// Sonde HMR : une leçon ouverte, on ajoute un id à knowledge.jsx ET une brique qui l'utilise dans un module ;
// la page ne doit JAMAIS afficher « aucun item » (la carte du provider doit suivre le rechargement à chaud).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const BASE = process.env.QA_BASE || 'http://localhost:5173';
const L = 'apps/web/src/lessons/moyen/1am/ansab_al_aadad_wal_hisab/adad-tabiiya-ashriya/kitabat-adad-tabii';
const K = `${L}/knowledge.jsx`; const M = `${L}/modules/Module02Maarif.jsx`;
const k0 = readFileSync(K, 'utf8'); const m0 = readFileSync(M, 'utf8');
const res = await fetch('http://localhost:8000/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: 'qa-prof@smarter.dz', password: 'QaPass2026!' }) });
const d = await res.json(); const token = d.token ?? d.access_token ?? d.data?.token;
const browser = await chromium.launch(); const ctx = await browser.newContext({ locale: 'ar', viewport: { width: 1280, height: 900 } });
await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch {} }, token);
const page = await ctx.newPage();
await page.goto(`${BASE}/courses/moyen/1am/ansab_al_aadad_wal_hisab/kitabat-adad-tabii/maarif`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('[data-rank-exchange]', { timeout: 30000 });
await page.evaluate(() => { window.__marker = 1; });
let ok = true;
try {
  // 1) ajoute un item `probe-x` à knowledge.jsx puis 2) la brique dans le module, comme le fait un agent de génération.
  writeFileSync(K, k0.replace("id: 'fiaat', type: 'regles'", "id: 'probe-x', type: 'concepts', title: 'sonde', predict: false, summary: 'sonde', body: <p>sonde</p> },\n      {\n        id: 'fiaat', type: 'regles'"));
  await page.waitForTimeout(2500);
  writeFileSync(M, m0.replace('<KnowledgeBrick id="fiaat"', '<KnowledgeBrick id="probe-x" />\n              <KnowledgeBrick id="fiaat"'));
  await page.waitForTimeout(3500);
  // répondre à la première question pour monter la brique
  await page.locator('button', { hasText: 'من اليمين، ثلاثة أرقام' }).first().click().catch(() => {});
  await page.waitForTimeout(1500);
  const txt = await page.evaluate(() => document.body.innerText);
  const kept = await page.evaluate(() => window.__marker === 1);
  console.log(kept ? 'page NOT reloaded (hot update)' : 'page reloaded');
  console.log('brick probe-x rendered:', /sonde/.test(txt));
  ok = !/aucun item/.test(txt);
  console.log(ok ? '✓ la carte a suivi le HMR' : `✗ ${txt.match(/aucun item[^\n]*/)}`);
} finally { writeFileSync(K, k0); writeFileSync(M, m0); }
await browser.close(); process.exit(ok ? 0 : 1);
