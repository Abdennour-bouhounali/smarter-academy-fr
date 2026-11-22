// QA — « جولة تعريفية » (features/tours, docs/architecture/PAGE_TOURS.md).
//
// Lancement (Vite sur 5173 en marche) :
//   node apps/web/e2e/page-tours.mjs
//
// API simulée avec l'enveloppe RÉELLE ({ success, user } pour /auth/me —
// sinon tout redirige vers /login et le test passe au vert à tort). Le
// serveur des visites est simulé EN MÉMOIRE : un POST /me/tours/{key} clôt
// la visite, le GET suivant la renvoie.
//
// Vérifie, élève et enseignant, bureau 1440 et téléphone 390 :
//   1. chaque page du registre ouvre sa visite à la première visite, avec au
//      moins une étape ciblée, sans débordement horizontal ni erreur console ;
//   2. « التالي » jusqu'à « إنهاء » clôt la visite en `completed` ;
//      « تخطّي » (ou Échap) la clôt en `skipped` ;
//   3. revenue sur la page, une visite close NE s'ouvre PLUS ;
//   4. la page reste cliquable pendant la visite (le voile n'intercepte rien) ;
//   5. le bouton « جولة في الصفحة » la rejoue.
// Captures dans /tmp/page-tours-qa.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const OUT = process.env.QA_OUT || '/tmp/page-tours-qa';
mkdirSync(OUT, { recursive: true });

const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

const USERS = {
  student: { id: 9101, role: 'student', firstName: 'عمر', lastName: 'بن علي', email: 'qa@example.dz', grade: '4am', emailVerified: true, emailVerifiedAt: '2026-01-01' },
  teacher: { id: 9102, role: 'teacher', firstName: 'أمينة', lastName: 'سعدي', email: 'qa-prof@example.dz', emailVerified: true, emailVerifiedAt: '2026-01-01' },
};
// Formes RÉELLES du tableau de bord et de la liste des classes.
const ENTITLEMENTS = {
  plan: null, request: null,
  students: { current: 3, maximum: 30, overLimit: false },
  classes: { current: 1, maximum: null, overLimit: false, canCreate: true },
};
const CLASSROOMS = [{ id: 7, name: 'الرابعة متوسط 1', grade: '4am', status: 'active', studentsCount: 3, joinCode: 'QA7CODE' }];
const DASHBOARD = { entitlements: ENTITLEMENTS, classrooms: CLASSROOMS };

async function stub(ctx, role, tours) {
  await ctx.addInitScript(() => localStorage.setItem('token', 'qa-fake-token'));
  await ctx.route(/\/api\/v1\//, (route) => {
    const req = route.request();
    const url = req.url();
    let body = { success: true, data: [] };
    const m = url.match(/\/me\/tours\/([^/?]+)/);
    if (m && req.method() === 'POST') {
      const key = decodeURIComponent(m[1]);
      tours[key] = { status: JSON.parse(req.postData() || '{}').status };
      body = { success: true, tour: key, status: tours[key].status };
    } else if (url.includes('/me/tours')) body = { success: true, eligible: true, tours };
    else if (url.includes('/auth/me')) body = { success: true, user: USERS[role] };
    else if (url.includes('/teacher/dashboard')) body = { success: true, dashboard: DASHBOARD };
    else if (/\/teacher\/classrooms(\?|$)/.test(url)) body = { success: true, entitlements: ENTITLEMENTS, classrooms: CLASSROOMS };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

// La page d'une وحدة (par chemin) et le sommaire d'une leçon (déclaré par LessonIndex).
const UNIT_URL = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/units/aadad-tabiiya-natiqa';
const LESSON_URL = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-adad-tabii';

const PAGES = {
  student: [
    ['/espace', 'student.home'], ['/espace/cours', 'student.courses'], ['/espace/explorer', 'student.explorer'],
    ['/espace/atelier', 'student.mathlab'], ['/espace/progression', 'student.progression'],
    ['/espace/cahier', 'student.notebook'], ['/espace/qism', 'student.class'], ['/espace/profil', 'student.profile'],
    [UNIT_URL, 'student.unit'], [LESSON_URL, 'student.lesson-index'],
  ],
  teacher: [
    ['/enseignant', 'teacher.home'], ['/enseignant/cours', 'teacher.courses'], ['/enseignant/atelier', 'teacher.mathlab'],
    ['/enseignant/cahier', 'teacher.notebook'], ['/enseignant/classes', 'teacher.classes'], ['/enseignant/profil', 'teacher.profile'],
    [UNIT_URL, 'teacher.unit'], [LESSON_URL, 'teacher.lesson-index'],
  ],
};

const card = '[data-tour-card]';

async function waitTour(page, key, timeout = 12000) {
  try {
    await page.waitForSelector(`[data-page-tour="${key}"] ${card}`, { timeout });
    return true;
  } catch {
    return false;
  }
}

const browser = await chromium.launch();
for (const [vpName, viewport] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  for (const role of ['student', 'teacher']) {
    const tours = {};
    const ctx = await browser.newContext({ viewport, locale: 'ar' });
    await stub(ctx, role, tours);
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));

    for (const [i, [path, key]] of PAGES[role].entries()) {
      const tag = `${vpName} ${role} ${path}`;
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
      check(!page.url().includes('/login'), `${tag}: session simulée acceptée (pas de /login)`);
      const opened = await waitTour(page, key);
      check(opened, `${tag}: la visite ${key} s'ouvre à la première visite`);
      if (!opened) continue;

      const info = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        dir: document.documentElement.dir,
        title: document.querySelector('[data-tour-card] h2')?.textContent ?? '',
        cardBox: document.querySelector('[data-tour-card]').getBoundingClientRect().toJSON(),
      }));
      check(info.overflow <= 1, `${tag}: pas de débordement horizontal (${info.overflow}px)`);
      check(/[؀-ۿ]/.test(info.title) && !info.title.includes('.'), `${tag}: titre arabe, pas une clé brute (« ${info.title} »)`);
      check(info.cardBox.left >= 0 && info.cardBox.right <= viewport.width + 1 && info.cardBox.bottom <= viewport.height + 1, `${tag}: la carte reste dans l'écran`);
      await page.screenshot({ path: `${OUT}/${vpName}-${key}-1.png` });

      if (i % 2 === 0) {
        // Parcours complet jusqu'à « إنهاء ».
        let guard = 0;
        while (guard++ < 12 && (await page.locator(card).count())) {
          const kind = await page.getAttribute('[data-tour-next]', 'data-tour-next');
          // Le projecteur glisse 200 ms d'une étape à l'autre : capturer après.
          if (guard === 2) { await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/${vpName}-${key}-2.png` }); }
          await page.click('[data-tour-next]');
          if (kind === 'finish') break;
          await page.waitForTimeout(120);
        }
        await page.waitForTimeout(300);
        check(tours[key]?.status === 'completed', `${tag}: « إنهاء » clôt en completed (${tours[key]?.status})`);
      } else {
        // « تخطّي » au clavier, après avoir cliqué la page derrière le voile.
        const clickable = await page.evaluate(() => {
          const spot = document.querySelector('[data-tour-spotlight]');
          return !spot || getComputedStyle(spot).pointerEvents === 'none';
        });
        check(clickable, `${tag}: le voile n'intercepte pas les clics`);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        check(tours[key]?.status === 'skipped', `${tag}: Échap clôt en skipped (${tours[key]?.status})`);
      }
      check((await page.locator(card).count()) === 0, `${tag}: la carte se ferme`);

      // Revenue : plus jamais d'elle-même — même après rechargement complet.
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
      check(!(await waitTour(page, key, 3500)), `${tag}: une visite close ne revient pas`);
    }

    // Le bouton « جولة في الصفحة » rejoue la visite de la page ouverte.
    const [path, key] = PAGES[role][0];
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    const replay = page.locator('[data-tour-replay]:visible').first();
    check((await replay.count()) === 1, `${vpName} ${role}: bouton « جولة في الصفحة » visible`);
    if (await replay.count()) {
      await replay.click();
      check(await waitTour(page, key), `${vpName} ${role}: le bouton rejoue ${key}`);
      await page.click('[data-tour-skip]');
    }
    check(errors.length === 0, `${vpName} ${role}: aucune erreur console${errors.length ? ` — ${errors[0]}` : ''}`);
    await ctx.close();
  }
}

// ── Le PREMIER module d'une leçon (visite déclarée par ModuleLayout) ─────
// Le premier module (« أستعدّ ») ouvre la visite, avec بطاقتي et كرّاسي ; un
// autre module ne l'ouvre pas ; une fois close, elle ne revient sur aucune leçon.
const LESSON = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-adad-tabii';
for (const [vpName, viewport] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  for (const role of ['student', 'teacher']) {
    const key = `${role}.lesson`;
    const tag = `${vpName} ${role} leçon`;
    const tours = {};
    const ctx = await browser.newContext({ viewport, locale: 'ar' });
    await stub(ctx, role, tours);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto(`${BASE}${LESSON}/maarif`, { waitUntil: 'networkidle' });
    check(!(await waitTour(page, key, 3500)), `${tag}: un module qui n'est pas le premier n'ouvre pas la visite`);

    await page.goto(`${BASE}${LESSON}/astaidd`, { waitUntil: 'networkidle' });
    check(await waitTour(page, key), `${tag}: le premier module ouvre ${key}`);
    const seen = [];
    let guard = 0;
    while (guard++ < 12 && (await page.locator(card).count())) {
      const step = await page.getAttribute('[data-tour-step]', 'data-tour-step');
      seen.push(step);
      if (step === 'map' || step === 'notebook') {
        await page.waitForTimeout(400);
        await page.screenshot({ path: `${OUT}/${vpName}-${key}-${step}.png` });
      }
      const kind = await page.getAttribute('[data-tour-next]', 'data-tour-next');
      await page.click('[data-tour-next]');
      if (kind === 'finish') break;
      await page.waitForTimeout(120);
    }
    check(seen.includes('map') && seen.includes('notebook'), `${tag}: étapes بطاقتي et كرّاسي présentes (${seen.join(',')})`);
    await page.waitForTimeout(300);
    check(tours[key]?.status === 'completed', `${tag}: « إنهاء » clôt en completed`);
    await page.goto(`${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab/tayin-pgcd`, { waitUntil: 'networkidle' });
    await page.goto(`${BASE}${LESSON}/astaidd`, { waitUntil: 'networkidle' });
    check(!(await waitTour(page, key, 3500)), `${tag}: close, elle ne revient pas`);
    // Close, elle reste rejouable par « جولة في الصفحة » depuis n'importe quel module.
    await page.goto(`${BASE}${LESSON}/maarif`, { waitUntil: 'networkidle' });
    const replay = page.locator('[data-tour-replay]:visible').first();
    check((await replay.count()) === 1, `${tag}: bouton « جولة في الصفحة » visible sur un autre module`);
    if (await replay.count()) {
      await replay.click();
      check(await waitTour(page, key), `${tag}: le bouton rejoue ${key} sur un autre module`);
      await page.click('[data-tour-skip]');
    }
    check(errors.length === 0, `${tag}: aucune erreur page${errors.length ? ` — ${errors[0]}` : ''}`);
    await ctx.close();
  }
}

// ── La barre des outils du compte (barre latérale élève, grand écran) ────
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ar' });
  await stub(ctx, 'student', { 'student.home': { status: 'completed' } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/espace`, { waitUntil: 'networkidle' });
  const bar = page.locator('aside [data-account-tools]');
  const box = await bar.boundingBox();
  const buttons = await bar.locator('button').count();
  check(buttons === 4 && box && box.height <= 44, `outils du compte : 4 boutons sur une ligne (${buttons}, h=${box?.height})`);
  await page.locator('aside').screenshot({ path: `${OUT}/sidebar-account-tools.png` });
  await ctx.close();
}

await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\nTout est vert.');
process.exit(failures.length ? 1 : 0);
