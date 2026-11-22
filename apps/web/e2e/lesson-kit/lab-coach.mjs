// QA — l'onboarding `LabCoach`, UN script, un bloc par type de manipulation :
//   QA_BASE=http://localhost:5173 QA_OUT=/tmp/qa-coach node apps/web/e2e/lesson-kit/lab-coach.mjs
//   QA_ONLY=rank-exchange | divisibility   (sans QA_ONLY : tout) ; QA_LAB=factor-pairs/beginner (un seul bloc)
// Blocs : rank-exchange (kitabat-adad-tabii) · divisibility = team-builder, divisor-explorer-books, factor-pairs,
// divisor-properties, common-divisors (leçons 4AM « القواسم »). `divisor-explorer` n'est posé par AUCUNE leçon : rendu + logique seulement.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const BASE = process.env.QA_BASE || 'http://localhost:5173';
const OUT = process.env.QA_OUT || '/tmp/qa-coach';
mkdirSync(OUT, { recursive: true });
const URL = `${BASE}/courses/moyen/1am/ansab_al_aadad_wal_hisab/kitabat-adad-tabii/nashat`;
const ONLY = process.env.QA_ONLY || '';
const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };
const r = await fetch('http://localhost:8000/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: 'qa-eleve@smarter.dz', password: 'QaPass2026!' }) });
const d = await r.json(); const token = d.token ?? d.access_token ?? d.data?.token;
const browser = await chromium.launch();

async function open(vp) {
  const ctx = await browser.newContext({ viewport: vp, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (x) => x.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch {} }, token);
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('[data-manipulation-level-panel=beginner] [data-rank-exchange]', { timeout: 40000 });
  await page.waitForTimeout(900);
  return { ctx, page };
}
const view = (page) => page.evaluate(() => document.querySelector('[data-manipulation-level-panel=beginner] [data-rx-glance]').scrollIntoView({ block: 'start', behavior: 'instant' }));
const lab = (page) => page.locator('[data-manipulation-level-panel=beginner]');
const bubble = (page) => lab(page).locator('[data-lab-coach]');
const inside = async (page) => page.evaluate((s) => {
  const b = document.querySelector(s); if (!b) return false;
  const g = b.closest('[data-rx-glance]').getBoundingClientRect(); const x = b.getBoundingClientRect();
  return x.left >= g.left - 1 && x.right <= g.right + 1;
}, '[data-manipulation-level-panel=beginner] [data-lab-coach]');
const overlaps = async (page) => page.evaluate(() => {
  const b = document.querySelector('[data-manipulation-level-panel=beginner] [data-lab-coach]');
  const ring = document.querySelector('[data-manipulation-level-panel=beginner] [data-lab-coach-ring]');
  if (!b || !ring) return null;
  const a = b.getBoundingClientRect(); const t = ring.getBoundingClientRect();
  return !(a.bottom <= t.top + 6 || a.top >= t.bottom - 6 || a.right <= t.left || a.left >= t.right);
});

// QA_MOBILE=1 ajoute 390×844 et 320×640 (owner, 2026-10-15 : « skip the mobile screen » — par défaut le bureau seul)
const VPS = [{ width: 1280, height: 800 }, ...(process.env.QA_MOBILE ? [{ width: 390, height: 844 }, { width: 320, height: 640 }] : [])];
for (const vp of ONLY && ONLY !== 'rank-exchange' ? [] : VPS) {
  const { ctx, page } = await open(vp);
  const tag = `${vp.width}`;
  check(await bubble(page).count() === 1, `${tag}: une bulle au départ`);
  check((await bubble(page).getAttribute('data-step')) === 'predict', `${tag}: 1re étape = la prédiction`);
  check(await inside(page, ''), `${tag}: la bulle reste dans le cadre du labo`);
  check((await overlaps(page)) === false, `${tag}: la bulle ne couvre pas l'élément montré`);
  await view(page); await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/1-predict-${tag}.png` });
  // choisir une carte → l'étape suivante : lier
  await lab(page).locator('[data-rx-predict][data-state=idle]').first().click();
  await page.waitForTimeout(700);
  check((await bubble(page).getAttribute('data-step')) === 'tie', `${tag}: après la prédiction → « lier »`);
  check((await overlaps(page)) === false, `${tag}: (lier) la bulle ne couvre pas le bouton`);
  await view(page); await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/2-tie-${tag}.png` });
  // le doigt traverse l'anneau : on lie VRAIMENT en cliquant le bouton montré
  await lab(page).locator('[data-rx-tie]').first().click();
  await page.waitForTimeout(700);
  check((await bubble(page).getAttribute('data-step')) === 'carry', `${tag}: après le lien → « porter »`);
  await view(page); await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/3-carry-${tag}.png` });
  // « فهمت » masque cette astuce seulement
  await bubble(page).locator('[data-lab-coach-ok]').click();
  await page.waitForTimeout(300);
  check(await bubble(page).count() === 0, `${tag}: « فهمت » masque l'astuce`);
  // l'interrupteur la ramène
  await lab(page).locator('[data-lab-coach-toggle]').click();
  await page.waitForTimeout(500);
  check(await bubble(page).count() === 1, `${tag}: « أرِني ماذا أفعل » la ramène`);
  // l'arrêter : mémorisé après rechargement
  await bubble(page).locator('[data-lab-coach-stop]').click();
  await page.waitForTimeout(300);
  check(await bubble(page).count() === 0, `${tag}: « إيقاف الإرشاد » masque tout`);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-manipulation-level-panel=beginner] [data-rank-exchange]', { timeout: 40000 });
  await page.waitForTimeout(900);
  check(await bubble(page).count() === 0, `${tag}: l'arrêt est mémorisé après rechargement`);
  check((await lab(page).locator('[data-lab-coach-toggle]').getAttribute('data-state')) === 'off', `${tag}: l'interrupteur propose de le remettre`);
  await view(page); await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/4-off-${tag}.png` });
  await ctx.close();
}

/* ───────────── divisibility : un bloc par type, à chaque niveau et chaque largeur ───────────── */
const L4 = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab`;
const dragTo = async (page, from, to, dx = 0, dy = 0) => {
  await from.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(300); // au centre : la colonne flottante (كرّاسي) ne le couvre pas
  const a = await from.boundingBox(); const b = to ? await to.boundingBox() : null;
  const sx = a.x + a.width / 2; const sy = a.y + a.height / 2;
  const ex = b ? b.x + b.width / 2 : sx + dx; const ey = b ? b.y + b.height / 2 : sy + dy;
  await page.mouse.move(sx, sy); await page.mouse.down();
  for (let i = 1; i <= 8; i += 1) await page.mouse.move(sx + ((ex - sx) * i) / 8, sy + ((ey - sy) * i) / 8);
  await page.mouse.up(); await page.waitForTimeout(500);
};
const tap = async (page, loc, opts) => { await loc.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(250); await loc.click(opts); await page.waitForTimeout(500); };
const DIV = [
  { type: 'team-builder', url: `${L4}/qasim-adad-tabii/al-maktaba`, level: 'beginner', first: 'place',
    // le chemin sans glisser (toucher le joueur, puis l'équipe) : sur un téléphone l'équipe est hors écran pendant un glisser
    acts: [async (p, r) => { await r.locator('[data-drag-source^="player:"]').first().click(); const z = r.locator('[data-drop-zone="team:0"]'); await z.scrollIntoViewIfNeeded(); await z.click({ position: { x: 20, y: 20 } }); await p.waitForTimeout(500); }, 'more'] },
  { type: 'divisor-explorer-books', url: `${L4}/qasim-adad-tabii/al-maktaba`, level: 'advanced', first: 'handle',
    acts: [async (p, r) => dragTo(p, r.locator('[data-stretch-handle]'), null, -50, 0), 'nudge'] },
  { type: 'factor-pairs', url: `${L4}/qawasim-adad-tabii/al-adad-60`, level: 'beginner', first: 'handle',
    acts: [async (p, r) => dragTo(p, r.locator('[data-stretch-handle]'), null, -60, 0), 'nudge'] },
  { type: 'divisor-properties', url: `${L4}/khawass-qawasim/thalath-halat`, level: 'beginner', first: 'carry',
    acts: [async (p, r) => dragTo(p, r.locator('[data-drag-source="wall:b"]'), r.locator('[data-drop-zone="zone:join"]')), 'carry-next'] },
  { type: 'divisor-properties', url: `${L4}/khawass-qawasim/thalath-halat`, level: 'advanced', first: 'predict',
    acts: [async (p, r) => { await r.locator('[data-site-zone="join"] [data-prediction] button').first().click(); await p.waitForTimeout(500); }, 'carry'] },
  { type: 'common-divisors', url: `${L4}/qasim-mushtarak-akbar/baqat`, level: 'beginner', first: 'add',
    acts: [async (p, r) => tap(p, r.locator('[data-group-add]')), 'more'] },
  { type: 'common-divisors', url: `${L4}/qasim-mushtarak-akbar/baqat`, level: 'advanced', first: 'add',
    acts: [async (p, r) => tap(p, r.locator('[data-group-add]')), 'more'] },
  // les LISTES seules (startWith="lists") : le guide montre la zone du milieu, pas un jeton ; un jeton posé au toucher laisse le guide là
  { type: 'common-divisors', url: `${L4}/tayin-pgcd/42-wa-60`, level: 'advanced', first: 'middle', tag: 'lists',
    acts: [async (p, r) => { await tap(p, r.locator('[data-drag-source="a:6"]').first()); await tap(p, r.locator('[data-drop-zone="middle"]'), { position: { x: 20, y: 20 } }); }, 'middle'] },
];
async function openDiv(vp, lab) {
  const ctx = await browser.newContext({ viewport: vp, locale: 'ar' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (x) => x.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch {} }, token);
  const page = await ctx.newPage();
  await page.goto(lab.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const panel = lab.level ? `[data-manipulation-level-panel=${lab.level}] ` : '';
  const root = `${panel}[data-manipulation=${lab.type}]`;
  if (lab.level === 'advanced') {
    await page.waitForSelector('[data-manipulation-levels-selector] [data-level=advanced]', { timeout: 40000 });
    await page.locator('[data-manipulation-levels-selector] [data-level=advanced]').first().click();
  }
  await page.waitForSelector(`${root} [data-lab-coach-toggle]`, { timeout: 40000 });
  await page.waitForTimeout(1000);
  await page.locator(root).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  return { ctx, page, root, r: page.locator(root).first() };
}
const geo = (page, root) => page.evaluate((sel) => {
  const host = document.querySelector(sel); const b = host?.querySelector('[data-lab-coach]'); const ring = host?.querySelector('[data-lab-coach-ring]');
  if (!b || !ring) return null;
  const h = host.getBoundingClientRect(); const a = b.getBoundingClientRect(); const t = ring.getBoundingClientRect();
  return {
    inside: a.left >= h.left - 1 && a.right <= h.right + 1 && a.top >= h.top - 1 && a.bottom <= h.bottom + 1,
    overlaps: !(a.bottom <= t.top + 6 || a.top >= t.bottom - 6 || a.right <= t.left || a.left >= t.right),
    // le guide lui-même ne déborde jamais de l'écran (un débordement de la page vient d'ailleurs, pas de lui)
    overflowX: a.right > window.innerWidth + 1 || a.left < -1 || t.right > window.innerWidth + 6 || t.left < -6,
  };
}, root);
for (const lab of (ONLY && ONLY !== 'divisibility' ? [] : DIV).filter((l) => !process.env.QA_LAB || `${l.type}/${l.level ?? l.tag}`.includes(process.env.QA_LAB))) {
  for (const vp of VPS) {
    const tag = `${lab.type}${lab.tag ? `/${lab.tag}` : ''}/${lab.level ?? '-'}/${vp.width}`;
    const file = `${lab.type}-${lab.tag ?? lab.level}-${vp.width}`;
    const { ctx, page, root, r } = await openDiv(vp, lab);
    const bubble = r.locator('[data-lab-coach]');
    check(await bubble.count() === 1, `${tag}: une bulle au départ`);
    check((await bubble.getAttribute('data-step')) === lab.first, `${tag}: 1re étape = ${lab.first}`);
    let g = await geo(page, root);
    check(g?.inside === true, `${tag}: la bulle reste dans le cadre du labo`);
    check(g?.overlaps === false, `${tag}: la bulle ne couvre pas l'élément montré`);
    check(g?.overflowX === false, `${tag}: la bulle et l'anneau ne débordent pas de l'écran`);
    await page.screenshot({ path: `${OUT}/${file}-1.png` });
    if (lab.acts.length) {
      await lab.acts[0](page, r);
      check((await bubble.getAttribute('data-step').catch(() => null)) === lab.acts[1], `${tag}: le vrai geste sous l'anneau marche → « ${lab.acts[1]} »`);
      g = await geo(page, root);
      check(g?.overlaps === false && g?.inside === true, `${tag}: (${lab.acts[1]}) bulle dans le cadre, ne couvre pas le bouton`);
      await page.screenshot({ path: `${OUT}/${file}-2.png` });
    }
    await bubble.locator('[data-lab-coach-ok]').click();
    await page.waitForTimeout(300);
    check(await bubble.count() === 0, `${tag}: « فهمت » masque l'astuce`);
    await r.locator('[data-lab-coach-toggle]').click();
    await page.waitForTimeout(500);
    check(await bubble.count() === 1, `${tag}: « أرِني ماذا أفعل » la ramène`);
    await page.screenshot({ path: `${OUT}/${file}-3.png` });
    await bubble.locator('[data-lab-coach-stop]').click();
    await page.waitForTimeout(300);
    check(await bubble.count() === 0, `${tag}: « إيقاف الإرشاد » masque tout`);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector(`${root} [data-lab-coach-toggle]`, { timeout: 40000 }).catch(() => {});
    if (lab.level === 'advanced') await page.locator('[data-manipulation-levels-selector] [data-level=advanced]').first().click().catch(() => {});
    await page.waitForTimeout(900);
    check(await page.locator(`${root} [data-lab-coach]`).count() === 0, `${tag}: l'arrêt est mémorisé après rechargement`);
    check((await page.locator(`${root} [data-lab-coach-toggle]`).first().getAttribute('data-state')) === 'off', `${tag}: l'interrupteur propose de le remettre`);
    await ctx.close();
  }
}
await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ onboarding : tout est vert');
process.exit(failures.length ? 1 : 0);
