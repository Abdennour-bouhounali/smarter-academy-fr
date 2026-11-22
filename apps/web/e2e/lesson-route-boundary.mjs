// QA — la FRONTIÈRE DE ROUTES DES LEÇONS et le lot d'entrée (BUNDLE_BOUNDARIES.md §3, 2026-10-14).
//
// Lancement (Vite sur 5173 et l'API sur 8000 en marche) :
//   node apps/web/e2e/lesson-route-boundary.mjs
// Sur le build de PRODUCTION (le découpage réel de Rollup) :
//   VITE_API_URL=http://localhost:8000/api/v1 npx vite build --outDir /tmp/dist-qa   (dans apps/web)
//   npx vite preview --outDir /tmp/dist-qa --port 4173   puis   QA_BASE=http://localhost:4173 node …
//
// Ce que la frontière doit garder exactement comme avant, dans un vrai navigateur :
//   1. « / » (visiteur) ne demande AUCUN fichier de leçon ni les textes des manipulations ;
//   2. un lien PROFOND vers un محور (enseignant : tout est ouvert) monte la leçon — coquille du mode classe,
//      laboratoire rendu, AUCUNE clé `manipulation.*` brute, « بطاقتي » et « كرّاسي » présents ;
//   3. passer du sommaire à un محور par un lien GARDE la coquille du mode classe montée (même nœud DOM) ;
//   4. une URL de محور inconnue retombe sur `*` (comme avant : l'élève est renvoyé vers /espace) ;
//   5. page d'unité (enseignant) : les puces des محاور et les manipulations / méthodes (config chargée à part) ;
//   6. « مذكرة الدرس » se construit (config + contenu chargés à la demande) ;
//   7. aucune erreur console sur tout le parcours.
// Deux connexions API (/auth/login est limité à 6/min). Captures dans /tmp/lesson-route-boundary-qa.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const STUDENT = { email: process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz', password: PASSWORD };
const OUT = process.env.QA_OUT || '/tmp/lesson-route-boundary-qa';
const CH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab';
// A v2 lesson (its pack declares a WORLD, LESSON_V2.md §2) has NO module page: its module addresses redirect to its home.
// The module walk below needs a lesson that still has its module pages: the first lesson of this unit that is not v2,
// read from the generated index (its `modules` are those of its lesson.config.js) — never a name written here.
const INDEX = JSON.parse(readFileSync(new URL('../src/lessons/lessonIndex.generated.json', import.meta.url), 'utf8'));
const V2 = new Set(INDEX.lessons.filter((l) => l.pack?.world).map((l) => l.id));
const UNIT_LESSONS = ['qasim-adad-tabii', 'qawasim-adad-tabii', 'khawass-qawasim', 'qasim-mushtarak-akbar', 'tayin-pgcd', 'bahth-pgcd', 'awwaliyan-fima-baynahuma', 'ikhtizal-kasr', 'wadiya-idmajiya-aadad'];
const MODULE_LESSON = INDEX.lessons.find((l) => UNIT_LESSONS.includes(l.id) && !V2.has(l.id) && l.modules?.some(([n]) => n === 1));
if (!MODULE_LESSON) throw new Error('no lesson of the unit still has its module pages: section 2–3 has nothing to walk');
const SLUG1 = MODULE_LESSON.modules.find(([n]) => n === 1)[1];
const LESSON = `${CH}/${MODULE_LESSON.id}`;
const MODULE1 = `${LESSON}/${SLUG1}`; // its module 1
const V2_LESSON = `${CH}/qasim-adad-tabii`;
const UNIT = `${CH}/units/aadad-tabiiya-natiqa`;
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

async function loginToken(who) {
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(who) });
  const data = await res.json().catch(() => ({}));
  const token = data.token ?? data.access_token ?? data.data?.token;
  if (!token) throw new Error(`login ${who.email}: ${res.status}`);
  return token;
}

async function contextFor(browser, token, viewport = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport, locale: 'ar' });
  // Les polices Google retiennent « load » hors réseau : réponse vide (un abort loguerait ERR_FAILED en console).
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  if (token) await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); } catch { /* noop */ } }, token);
  return ctx;
}

function watch(page) {
  const errors = []; const requests = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('request', (r) => requests.push(r.url()));
  return { errors, requests };
}

/** Ferme la « جولة تعريفية » d'une première visite : sa carte intercepte les clics. */
async function closeTour(page) {
  for (let i = 0; i < 3 && await page.locator('[data-tour-card]').count(); i += 1) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
  }
}

const rawKeys = (page) => page.evaluate(() => (document.body.innerText.match(/\bmanipulation\.[a-zA-Z][\w.]*/g) ?? []).slice(0, 5));

const browser = await chromium.launch();
const teacherToken = await loginToken(TEACHER);
const studentToken = await loginToken(STUDENT);

// ── 1. « / » : aucun contenu de leçon ─────────────────────────────────────
{
  const ctx = await contextFor(browser, null);
  const page = await ctx.newPage();
  const { errors, requests } = watch(page);
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const lessonFiles = requests.filter((u) => /\/src\/lessons\/moyen\/|lesson\.config|\/routes\.jsx|lessonRoutes|buildLessonRoutes|lesson\.manipulation|lessonLoaders/.test(u));
  check(lessonFiles.length === 0, `/ : aucun fichier de leçon demandé (${lessonFiles.slice(0, 3).join(', ') || 'aucun'})`);
  check(errors.length === 0, `/ : aucune erreur console ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}

// ── 2–3. Enseignant : lien profond vers un محور, puis sommaire → محور ─────
{
  const ctx = await contextFor(browser, teacherToken);
  const page = await ctx.newPage();
  const { errors, requests } = watch(page);
  await page.goto(`${BASE}${MODULE1}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-classroom-scope]', { timeout: 20000 });
  await page.waitForTimeout(800);
  await closeTour(page);
  check(page.url() === `${BASE}${MODULE1}`, `lien profond : l'URL reste celle du محور (${page.url().replace(BASE, '')})`);
  await page.waitForSelector('[data-manipulation-workspace], [data-manipulation]', { timeout: 20000 }).catch(() => {});
  check(await page.locator('[data-manipulation-workspace], [data-manipulation]').count() > 0, 'lien profond : le laboratoire du محور 1 est rendu');
  check(requests.some((u) => /lesson\.manipulation(\.json|-[\w-]+\.js)/.test(u)), 'les textes des manipulations sont chargés AVEC la leçon');
  const keys = await rawKeys(page);
  check(keys.length === 0, `aucune clé manipulation.* brute à l'écran (${keys.join(', ')})`);
  check(await page.locator('[data-km-trigger]').count() > 0, '« بطاقتي » présent');
  check(await page.locator('[data-nb-trigger]').count() > 0, '« كرّاسي » présent');
  await page.screenshot({ path: `${OUT}/teacher-module1.png` });

  // A v2 lesson's module address is not a page any more: it redirects to the lesson's home (its world).
  {
    const slug = INDEX.lessons.find((l) => l.id === 'qasim-adad-tabii')?.modules?.find(([n]) => n === 1)?.[1];
    check(V2.has('qasim-adad-tabii') && Boolean(slug), `qasim-adad-tabii is a v2 lesson whose module 1 has an address (${slug})`);
    await page.goto(`${BASE}${V2_LESSON}/${slug}`, { waitUntil: 'networkidle' });
    await page.waitForURL((u) => !u.pathname.endsWith(`/${slug}`), { timeout: 15000 }).catch(() => {});
    check(new URL(page.url()).pathname.replace(/\/$/, '') === V2_LESSON && (await page.locator('[data-manipulation-workspace]').count()) === 0, `v2 : l'adresse du محور 1 de qasim-adad-tabii renvoie à l'accueil de la leçon (→ ${page.url().replace(BASE, '')})`);
  }

  // Sommaire → محور par un LIEN : la coquille du mode classe ne se remonte pas.
  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-classroom-scope]', { timeout: 20000 });
  await page.waitForTimeout(600);
  await closeTour(page);
  await page.evaluate(() => { document.querySelector('[data-classroom-scope]').__qaMarker = 'kept'; });
  const link = page.locator(`a[href$="/${SLUG1}"]`).first();
  check(await link.count() > 0, `le sommaire de ${MODULE_LESSON.id} lie le محور 1`);
  {
    await link.click();
    await page.waitForURL(`**/${SLUG1}`, { timeout: 15000 });
    await page.waitForSelector('[data-manipulation-workspace], [data-manipulation]', { timeout: 20000 }).catch(() => {});
    const kept = await page.evaluate(() => document.querySelector('[data-classroom-scope]')?.__qaMarker ?? null);
    check(kept === 'kept', 'navigation sommaire → محور : la coquille du mode classe reste montée (même nœud)');
  }

  // 5. Page d'unité : puces des محاور et ressources (configs chargées à part).
  await page.goto(`${BASE}${UNIT}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await closeTour(page);
  // a v2 lesson (its pack declares a world, LESSON_V2.md §2) lists NO module chip — its module pages do not exist;
  // a lesson that still has its module pages lists one chip per module of its lesson.config.js (counted in the index)
  const chips = await page.locator('[data-lesson-modules="qasim-adad-tabii"] [data-module-chip]').count();
  check(V2.has('qasim-adad-tabii') && chips === 0, `page d'unité : aucune puce de محور pour la leçon v2 qasim-adad-tabii (${chips})`);
  {
    const id = MODULE_LESSON.id;
    const want = MODULE_LESSON.modules.length;
    const got = await page.locator(`[data-lesson-modules="${id}"] [data-module-chip]`).count();
    check(want > 0 && got === want, `page d'unité : ${want} puces de محاور pour ${id}, une par module de sa lesson.config.js (${got})`);
  }
  const resources = await page.locator('[data-unit-lesson="qasim-adad-tabii"] li[data-unit-resource="manipulation"]').count();
  check(resources > 0, `page d'unité : manipulations de la leçon affichées (${resources})`);
  await page.screenshot({ path: `${OUT}/teacher-unit.png`, fullPage: true });

  // 6. « مذكرة الدرس ».
  await page.goto(`${BASE}/enseignant/cours/qasim-adad-tabii/memoire`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await closeTour(page);
  check(await page.locator('[data-memo-not-found]').count() === 0, 'مذكرة الدرس : la leçon est trouvée');
  check(await page.locator('[data-lesson-memo="qasim-adad-tabii"] [data-memo-toolbar]').count() === 1, 'مذكرة الدرس : la page est construite');
  await page.screenshot({ path: `${OUT}/teacher-memo.png` });
  check(errors.length === 0, `enseignant : aucune erreur console ${errors.slice(0, 2).join(' | ')}`);
  await ctx.close();
}

// ── 4. Élève : une URL de محور inconnue retombe sur `*` ───────────────────
{
  const ctx = await contextFor(browser, studentToken, { width: 390, height: 844 });
  const page = await ctx.newPage();
  const { errors } = watch(page);
  await page.goto(`${BASE}${LESSON}/mihwar-la-yujad`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForURL((u) => !u.pathname.endsWith('/mihwar-la-yujad'), { timeout: 30000 }).catch(() => {});
  check(!page.url().includes('/mihwar-la-yujad'), `محور inconnu : retombe sur * (→ ${page.url().replace(BASE, '')})`);
  // Et le sommaire, lui, s'ouvre en lien profond sur téléphone.
  await page.goto(`${BASE}${LESSON}`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('[data-classroom-scope]', { timeout: 30000 });
  await page.waitForTimeout(800);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 1, `élève 390 px : sommaire sans débordement horizontal (${overflow}px)`);
  check(await page.evaluate(() => document.documentElement.dir) === 'rtl', 'élève : la page est en RTL');
  check(errors.length === 0, `élève : aucune erreur console ${errors.slice(0, 2).join(' | ')}`);
  await page.screenshot({ path: `${OUT}/student-index-phone.png` });
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n✗ ${failures.length} échec(s)` : '\nTout est vert.');
process.exit(failures.length ? 1 : 0);
