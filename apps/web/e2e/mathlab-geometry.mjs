/**
 * QA navigateur — le BUREAU DE GÉOMÉTRIE de la سبّورة (MATH_LAB.md §5.8).
 *
 * Lancement (dev server sur 5173, API sur 8000, élève QA existant) :
 *   node apps/web/e2e/mathlab-geometry.mjs [dossier-captures]
 *
 * Le principe vérifié : l'instrument CONDUIT le crayon ORDINAIRE (le القلم
 * d'Excalidraw) — pas un crayon spécial. On trace « à la main qui tremble »
 * et on lit, dans le document enregistré, la géométrie exacte qui en sort :
 *
 *   1. sans instrument, le القلم reste libre (un trait à main levée) ;
 *   2. règle posée : 0 → 5 cm donne un segment de 5,0 cm, droit, sur le bord ;
 *   3. règle tournée de 45° : 3 cm à 45° ;
 *   4. la règle déplacée après coup ne déplace pas le segment ;
 *   5. المدوّر : pointe sur A (même sous la règle), r = 4, la mine suit → arc de
 *      rayon 4 centré sur A, rattaché à A ;
 *   6. المنقلة « إنشاء زاوية » 60° : une demi-droite à 60° exactement ;
 *   7. المنقلة « رسم قوس » : 0° → 90° sur le bord extérieur = quart de cercle de
 *      rayon R centré sur A ; 30° → 120° sur le bord intérieur = 90° ;
 *   8. الكوس plaqué contre la règle, glissé : deux perpendiculaires parallèles ;
 *   9. « تحرير القلم » : le long de la règle, le trait redevient libre ;
 *  10. une annulation retire toute une construction ;
 *  11. tactile (390 × 844) : le doigt le long de la règle donne un segment
 *      exact, la page ne défile pas, la règle se déplace d'un doigt ;
 *  12. rechargement : les instruments sont là où on les a laissés ;
 *      « إعادة البناء » rejoue et s'arrête ; export avec / sans instruments.
 *
 * Les documents créés sont supprimés à la fin.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const EMAIL = process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const OUT = process.argv[2] || '/tmp/mathlab-geometry-shots';
mkdirSync(OUT, { recursive: true });

const CM = 40; // geoMath.UNITS_PER_CM
const results = [];
const record = (label, ok, detail = '') => {
  results.push({ label, ok });
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
};
const near = (a, b, eps = 0.02) => Math.abs(a - b) <= eps;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const login = await fetch(`${API}/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
}).then((r) => r.json());
const TOKEN = login.token ?? login.data?.token;
if (!TOKEN) { console.error('Connexion API impossible :', login); process.exit(1); }
const api = (method, path) => fetch(`${API}${path}`, { method, headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' } })
  .then((r) => r.json().catch(() => ({})));

const browser = await chromium.launch();
let authState = null;
const created = new Set();
const pageErrors = [];

async function openBoard(viewport, extra = {}) {
  const ctx = await browser.newContext({ viewport, ...extra, ...(authState ? { storageState: authState } : {}) });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  if (!authState) {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/espace/, { timeout: 20000 });
    authState = await ctx.storageState();
  }
  await page.goto(`${BASE}/espace/atelier/tableau`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-geo-layer]', { timeout: 30000 });

  return { ctx, page };
}

// ── Aides ────────────────────────────────────────────────────────────────
/** Une image d'animation : l'état du bureau est rendu au prochain requestAnimationFrame. */
const frame = (page) => page.waitForTimeout(120);
const click = async (page, sel) => { await page.click(sel); await frame(page); };
const attr = (page, name) => page.getAttribute('[data-geo-layer]', name);

/** La pose (translate/rotate) d'un instrument, lue sur son groupe SVG. */
async function pose(page, kind) {
  const tr = await page.getAttribute(`[data-geo-instrument="${kind}"]${kind === 'protractor' ? ' > g' : ''}`, 'transform');
  const m = tr.match(/translate\(([^ ]+) ([^)]+)\) rotate\(([^)]+)\)/);

  return { x: +m[1], y: +m[2], deg: +m[3] };
}

/** Scène → écran, par la transformation du calque (zoom et défilement d'Excalidraw). */
function toScreen(page, p) {
  return page.evaluate(({ p }) => {
    const svg = document.querySelector('[data-geo-layer]');
    const r = svg.getBoundingClientRect();
    const m = svg.querySelector('[data-geo-world]').getAttribute('transform').match(/scale\(([^)]+)\) translate\(([^ ]+) ([^)]+)\)/);

    return { x: r.left + (p.x + +m[2]) * +m[1], y: r.top + (p.y + +m[3]) * +m[1] };
  }, { p });
}

/** Un trait « à main qui tremble » passant par des points de la scène. */
async function stroke(page, pts, wobble = 5) {
  const s = [];
  for (const p of pts) s.push(await toScreen(page, p));
  await page.mouse.move(s[0].x, s[0].y);
  await frame(page);
  await page.mouse.down();
  for (let i = 1; i < s.length; i += 1) await page.mouse.move(s[i].x + Math.sin(i) * wobble, s[i].y + Math.cos(i * 1.3) * wobble);
  await page.mouse.up();
  await page.waitForTimeout(250);
}
const line = (a, b, n = 20) => Array.from({ length: n + 1 }, (_, i) => ({ x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n }));

async function dragScene(page, a, b, steps = 25) {
  const A = await toScreen(page, a);
  const B = await toScreen(page, b);
  await page.mouse.move(A.x, A.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i += 1) await page.mouse.move(A.x + ((B.x - A.x) * i) / steps, A.y + ((B.y - A.y) * i) / steps);
  await page.mouse.up();
  await frame(page);
}

/** Fait tourner la poignée de `kind` de `radians` autour de `pivot` (scène). */
async function turn(page, kind, pivot, radians) {
  const hb = await page.locator(`[data-geo-hit="${kind}:rotate"] circle`).first().boundingBox();
  const h = { x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 };
  const o = await toScreen(page, pivot);
  const r = Math.hypot(h.x - o.x, h.y - o.y);
  const a0 = Math.atan2(h.y - o.y, h.x - o.x);
  await page.mouse.move(h.x, h.y);
  await page.mouse.down();
  for (let i = 1; i <= 24; i += 1) await page.mouse.move(o.x + r * Math.cos(a0 + (radians * i) / 24), o.y + r * Math.sin(a0 + (radians * i) / 24));
  await page.mouse.up();
  await frame(page);
}

async function saved(page) {
  await page.waitForSelector('[data-ml-status="dirty"], [data-ml-status="saving"]', { timeout: 2000 }).catch(() => {});
  await page.waitForSelector('[data-ml-status="saved"]', { timeout: 15000 });
  const id = Number((page.url().match(/\/atelier\/tableau\/(\d+)/) || [])[1]) || null;
  if (id) created.add(id);

  return id;
}

/** La géométrie du document ENREGISTRÉ : ce qui compte, c'est ce qui est sur le serveur. */
async function geometryOf(id) {
  const data = (await api('GET', `/math-lab/documents/${id}`)).document?.data ?? {};
  const els = (data.elements ?? []).filter((e) => !e.isDeleted);
  const points = new Map(els.filter((e) => e.customData?.geo?.kind === 'point').map((e) => [e.id, { x: e.x + e.width / 2, y: e.y + e.height / 2 }]));
  const out = { freedraw: els.filter((e) => e.type === 'freedraw'), linears: [], arcs: [], desk: data.geometry ?? null };
  for (const e of els) {
    const g = e.customData?.geo;
    if (!g) continue;
    if (['segment', 'ray', 'line'].includes(g.kind)) {
      const a = { x: e.x + g.ra.x, y: e.y + g.ra.y };
      const b = { x: e.x + g.rb.x, y: e.y + g.rb.y };
      out.linears.push({ kind: g.kind, a, len: Math.hypot(b.x - a.x, b.y - a.y) / CM, deg: -Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI, via: g.via?.tool });
    } else if (g.kind === 'arc') {
      out.arcs.push({ c: { x: e.x + g.rc.x, y: e.y + g.rc.y }, r: g.r / CM, sweep: Math.abs(g.sweep) * 180 / Math.PI, center: points.get(g.centerId) ?? null, via: g.via?.tool });
    }
  }

  return out;
}

// ═══ Bureau 1440 × 900 : règle, compas, منقلة, كوس ═══════════════════════
{
  const { ctx, page } = await openBoard({ width: 1440, height: 900 });
  await click(page, '[data-geo-button="pen"]');
  const box = await page.locator('[data-ml-whiteboard] canvas.interactive').first().boundingBox();
  // 1. Sans instrument : le القلم est libre.
  await page.mouse.move(box.x + 180, box.y + 120);
  await page.mouse.down();
  for (let i = 1; i <= 20; i += 1) await page.mouse.move(box.x + 180 + i * 10, box.y + 120 + Math.sin(i) * 12);
  await page.mouse.up();
  await frame(page);

  // 2. La règle : 0 → 5 cm.
  await click(page, '[data-geo-button="ruler"]');
  record('la règle ne change pas d’outil : le القلم reste en main', (await attr(page, 'data-geo-tool')) === '');
  let r = await pose(page, 'ruler');
  const A = { x: r.x, y: r.y };
  const s0 = await toScreen(page, { x: r.x + 1, y: r.y + 6 });
  await page.mouse.move(s0.x, s0.y);
  await frame(page);
  record('la mine s’approche du bord : « near », tenue par la règle', (await attr(page, 'data-geo-pen')) === 'near' && (await attr(page, 'data-geo-holder')) === 'ruler');
  await stroke(page, line({ x: r.x + 1, y: r.y + 6 }, { x: r.x + 5 * CM + 2, y: r.y + 3 }));

  // 3. Règle tournée de 45° (vers le haut), 0 → 3 cm.
  await turn(page, 'ruler', A, -Math.PI / 4);
  r = await pose(page, 'ruler');
  record('la règle se cale sur 45°', near(r.deg, -45, 0.01), `${r.deg}°`);
  const u = { x: Math.cos(r.deg * Math.PI / 180), y: Math.sin(r.deg * Math.PI / 180) };
  await stroke(page, line({ x: r.x + 3, y: r.y + 4 }, { x: r.x + u.x * 3 * CM + 2, y: r.y + u.y * 3 * CM + 5 }));
  await page.screenshot({ path: `${OUT}/01-ruler.png` });

  // 4. La règle s'en va ; les segments restent.
  await dragScene(page, { x: r.x + u.x * 300 + u.y * 30, y: r.y + u.y * 300 - u.x * 30 }, { x: r.x + u.x * 300 + 60, y: r.y + u.y * 300 + 200 });

  // La règle rangée : près d'un bord, le crayon a priorité sur le glisser d'un autre instrument.
  await click(page, '[data-geo-button="ruler"]');
  // 5. Le compas : la pointe sur A — A est sous la règle déplacée ou non —, r = 4, la mine suit.
  await click(page, '[data-geo-button="compass"]');
  const aS = await toScreen(page, A);
  await page.mouse.click(aS.x + 3, aS.y + 2);
  await frame(page);
  await page.fill('[data-geo-radius]', '4');
  await click(page, '[data-geo-button="pen"]');
  const tb = await page.locator('[data-geo-hit="compass:tip"] circle').first().boundingBox();
  await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
  await frame(page);
  record('la mine sur la pointe du compas : tenue par le compas', (await attr(page, 'data-geo-holder')) === 'compass');
  await page.mouse.down();
  for (let i = 1; i <= 30; i += 1) {
    const a = -(Math.PI * 100 / 180) * i / 30;
    await page.mouse.move(aS.x + 260 * Math.cos(a), aS.y + 260 * Math.sin(a));
  }
  await page.mouse.up();
  await frame(page);
  await click(page, '[data-geo-button="compass"]');

  // 6. La منقلة en « إنشاء زاوية » : 60°, depuis A.
  await click(page, '[data-geo-button="protractor"]');
  let p = await pose(page, 'protractor');
  await dragScene(page, { x: p.x, y: p.y - 170 }, { x: A.x + 3, y: A.y - 170 + 2 });
  p = await pose(page, 'protractor');
  record('le centre de la منقلة se pose exactement sur A', near(p.x, A.x, 1e-6) && near(p.y, A.y, 1e-6));
  await click(page, '[data-geo-chip="protractor-construct"]');
  await page.fill('[data-geo-needle]', '60');
  await click(page, '[data-geo-button="pen"]');
  await stroke(page, line({ x: p.x + 2, y: p.y + 2 }, { x: p.x + 140, y: p.y - 230 }));

  // 7. « رسم قوس » : 0° → 90° (bord extérieur), 30° → 120° (bord intérieur).
  await click(page, '[data-geo-chip="protractor-arc"]');
  const R = 6 * CM;
  const rim = (deg, rr) => ({ x: p.x + rr * Math.cos((p.deg - deg) * Math.PI / 180), y: p.y + rr * Math.sin((p.deg - deg) * Math.PI / 180) });
  const outer = [];
  for (let d = 1; d <= 91; d += 3) outer.push(rim(d, R + (d % 2 ? 7 : -6)));
  await stroke(page, outer, 3);
  const inner = [];
  for (let d = 31; d <= 121; d += 3) inner.push(rim(d, R * 0.42 + (d % 2 ? 5 : -4)));
  await stroke(page, inner, 2);
  await page.screenshot({ path: `${OUT}/02-protractor.png` });
  await click(page, '[data-geo-button="protractor"]');

  // 10. Une annulation retire la dernière construction (l'arc intérieur) d'un coup.
  await page.keyboard.press('Control+z');
  await frame(page);

  const id = await saved(page);
  const g = await geometryOf(id);
  const seg5 = g.linears.find((l) => l.via === 'ruler' && near(l.len, 5));
  const seg3 = g.linears.find((l) => l.via === 'ruler' && near(l.len, 3));
  record('1. sans instrument, le القلم reste libre', g.freedraw.length === 1 && g.freedraw[0].points.length > 5);
  record('2. règle : 0 → 5 cm = segment de 5,0 cm, horizontal, depuis le zéro', !!seg5 && near(seg5.deg, 0, 1e-6) && near(seg5.a.x, A.x, 1e-6) && near(seg5.a.y, A.y, 1e-6));
  record('3. règle à 45° : 3 cm à 45°', !!seg3 && near(seg3.deg, 45, 1e-6));
  record('4. la règle déplacée ne déplace pas les segments', !!seg5 && near(g.desk.instruments.ruler.x, A.x, 1) === false);
  const arc4 = g.arcs.find((a) => a.via === 'compass');
  record('5. compas : arc de rayon 4 exact, centré et rattaché sur A', !!arc4 && near(arc4.r, 4, 1e-9) && near(arc4.c.x, A.x, 1e-6) && !!arc4.center);
  const ray = g.linears.find((l) => l.kind === 'ray');
  record('6. منقلة « إنشاء زاوية » : demi-droite à 60° exactement, depuis A', !!ray && near(ray.deg, 60, 1e-6) && near(ray.a.x, A.x, 1e-6));
  const protArcs = g.arcs.filter((a) => a.via === 'protractor');
  record('7. منقلة « رسم قوس » : 0° → 90° = quart de cercle de rayon 6, centré sur A', protArcs.length === 1 && near(protArcs[0].sweep, 90, 1e-6) && near(protArcs[0].r, 6, 1e-9) && !!protArcs[0].center);
  record('10. une annulation a retiré l’arc intérieur entier', protArcs.length === 1);
  await ctx.close();
}

// ═══ الكوس contre la règle : le parallélisme, et « تحرير القلم » ═════════
{
  const { ctx, page } = await openBoard({ width: 1440, height: 900 });
  await click(page, '[data-geo-button="pen"]');
  await click(page, '[data-geo-button="ruler"]');
  const r = await pose(page, 'ruler');
  await stroke(page, line({ x: r.x + 2, y: r.y + 5 }, { x: r.x + 8 * CM + 1, y: r.y + 3 }));
  await click(page, '[data-geo-button="setSquare"]');
  let q = await pose(page, 'setSquare');
  await turn(page, 'setSquare', q, Math.PI);
  q = await pose(page, 'setSquare');
  const inside = (s) => ({ x: s.x - 60, y: s.y + 60 });
  await dragScene(page, inside(q), { x: inside(q).x + (r.x + 11 * CM - q.x), y: inside(q).y + (r.y + 6 - q.y) });
  q = await pose(page, 'setSquare');
  record('8. le كوس se plaque contre la règle', near(q.y, r.y, 1e-6) && near(Math.abs(q.deg), 180, 1e-6));
  await stroke(page, line({ x: q.x + 3, y: q.y + 4 }, { x: q.x - 2, y: q.y + 150 }));
  await dragScene(page, inside(q), { x: inside(q).x - 4 * CM, y: inside(q).y + 25 }, 30);
  const q2 = await pose(page, 'setSquare');
  record('8. glissé le long de la règle, il reste plaqué (la main peut dériver)', near(q2.y, r.y, 1e-6) && near(q2.x, q.x - 4 * CM, 1));
  await stroke(page, line({ x: q2.x + 3, y: q2.y + 4 }, { x: q2.x - 2, y: q2.y + 150 }));
  // 9. « تحرير القلم » : le long de la règle, le trait est libre.
  await click(page, '[data-geo-chip="attach"]');
  // Au-delà du كوس (qui couvre [x − 10 cm, x] sous la règle) : le bord de la règle seul.
  await stroke(page, line({ x: q2.x + 40, y: r.y + 3 }, { x: q2.x + 240, y: r.y + 3 }), 6);
  await click(page, '[data-geo-chip="attach"]');
  await page.screenshot({ path: `${OUT}/03-set-square.png` });
  const id = await saved(page);
  const g = await geometryOf(id);
  const perps = g.linears.filter((l) => l.via === 'setSquare');
  record('8. deux perpendiculaires exactes à la règle, donc parallèles', perps.length === 2 && perps.every((l) => near(Math.abs(l.deg), 90, 1e-6)));
  record('9. « تحرير القلم » : le trait le long de la règle redevient libre', g.freedraw.length === 1 && g.freedraw[0].points.length > 5);

  // 12. Rechargement, « إعادة البناء », export.
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-geo-layer]');
  await frame(page);
  const visible = await page.evaluate(() => [...document.querySelectorAll('[data-geo-instrument]')].map((n) => n.getAttribute('data-geo-instrument')).sort());
  record('12. rechargement : la règle et le كوس sont restés posés', JSON.stringify(visible) === JSON.stringify(['ruler', 'setSquare']));
  await click(page, '[data-geo-button="replay"]');
  await page.waitForTimeout(800);
  const playing = await page.locator('[data-geo-replay]').count();
  await click(page, '[data-geo-button="replay"]');
  record('12. « إعادة البناء » rejoue, puis s’arrête', playing === 1 && (await page.locator('[data-geo-replay]').count()) === 0);
  const download = async () => {
    const [d] = await Promise.all([page.waitForEvent('download'), page.click('[data-ml-export]')]);

    return (await d.path()) ? true : false;
  };
  const plain = await download();
  await click(page, '[data-geo-button="settings"]');
  await click(page, '[data-geo-chip="exportInstruments"]');
  const withInstruments = await download();
  record('12. export PNG, sans puis avec les instruments', plain && withInstruments);
  await ctx.close();
}

// ═══ Tactile 390 × 844 ════════════════════════════════════════════════════
{
  const { ctx, page } = await openBoard({ width: 390, height: 844 }, { hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const cdp = await ctx.newCDPSession(page);
  const touch = async (pts) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pts[0].x, y: pts[0].y }] });
    for (const q of pts.slice(1)) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: q.x, y: q.y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(300);
  };
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  record('11. mobile : la barre « أدوات الهندسة » ne déborde pas', overflow === 0, `${overflow}px`);
  for (const b of ['pen', 'ruler']) {
    await page.locator(`[data-geo-button="${b}"]`).scrollIntoViewIfNeeded();
    await page.tap(`[data-geo-button="${b}"]`);
  }
  await frame(page);
  const r = await pose(page, 'ruler');
  const zero = await toScreen(page, r);
  record('11. mobile : la règle sort à la taille de l’écran, zéro visible', zero.x >= 0 && zero.x <= 390, `zéro à x=${zero.x.toFixed(0)}`);
  const pts = [];
  for (let i = 0; i <= 20; i += 1) pts.push(await toScreen(page, { x: r.x + 1 + i * 6, y: r.y + 5 + Math.sin(i) * 5 }));
  const before = await page.evaluate(() => window.scrollY);
  await touch(pts);
  record('11. tactile : la page ne défile pas pendant le tracé', (await page.evaluate(() => window.scrollY)) === before);
  const body = await toScreen(page, { x: r.x + 150, y: r.y - 40 });
  await touch(Array.from({ length: 11 }, (_, i) => ({ x: body.x - i * 3, y: body.y + i * 8 })));
  const moved = await pose(page, 'ruler');
  record('11. tactile : un doigt sur le corps déplace la règle', !near(moved.y, r.y, 5));
  await page.screenshot({ path: `${OUT}/04-touch.png` });
  const id = await saved(page);
  const g = await geometryOf(id);
  record('11. tactile : le doigt le long de la règle donne un segment exact de 3 cm', g.linears.length === 1 && near(g.linears[0].len, 3, 1e-6) && near(g.linears[0].deg, 0, 1e-6));
  await ctx.close();
}

record('aucune erreur de page', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));

for (const id of created) await api('DELETE', `/math-lab/documents/${id}`);
await browser.close();
await sleep(10);
const ok = results.filter((r) => r.ok).length;
console.log(`\n${ok}/${results.length} vérifications réussies — captures dans ${OUT}`);
process.exit(ok === results.length ? 0 : 1);
