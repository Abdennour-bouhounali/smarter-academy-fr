/**
 * QA navigateur — LES DEUX مخابر du مختبر الرياضيات (MATH_LAB.md §2.1).
 *
 * Lancement (Vite sur 5173, API sur 8000, comptes QA existants) :
 *   node apps/web/e2e/mathlab-labs-scope.mjs [dossier-captures]
 *
 * Ce qu'on vérifie, sur un vrai compte élève et le vrai serveur :
 *   - l'accueil : la سبّورة en tête (commune), DEUX choix — مخبر المتوسط,
 *     مخبر الثانوي — puis « أعمالي » ; RTL, aucun débordement, à 1280 et 390 px ;
 *   - chaque مخبر : EXACTEMENT ses instruments, le commutateur, le retour ;
 *   - chaque instrument PARTAGÉ ouvert dans chaque مخبر : ce que le collège
 *     ne doit jamais montrer n'est pas dans le DOM, et le lycée l'a ;
 *   - le document se souvient de son مخبر : né au collège, rechargé sans
 *     `?lab=`, il revient au collège (URL, badge, fonctions) ;
 *   - « أعمالي » : le badge du مخبر, et le filtre ;
 *   - l'espace enseignant : mêmes مخابر sous /enseignant/atelier ;
 *   - le calque d'une leçon : le sélecteur s'ouvre sur le مخبر de la leçon.
 *
 * Les documents créés (par le compte enseignant) sont supprimés à la fin.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const PASSWORD = process.env.QA_PASSWORD || 'QaPass2026!';
const STUDENT = { email: process.env.QA_STUDENT_EMAIL || 'qa-eleve@smarter.dz', password: PASSWORD };
const TEACHER = { email: process.env.QA_TEACHER_EMAIL || 'qa-prof@smarter.dz', password: PASSWORD };
const LESSON = process.env.QA_LESSON || '/courses/moyen/4am/ansab_al_aadad_wal_hisab/tayin-pgcd';
const OUT = process.argv[2] || '/tmp/mathlab-labs-scope-shots';
mkdirSync(OUT, { recursive: true });

let passed = 0;
let failed = 0;
const check = (ok, label, detail = '') => {
  if (ok) passed += 1; else failed += 1;
  console.log(`  ${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
};

async function login(who) {
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(who) });
  const data = await res.json().catch(() => ({}));
  if (!data.token) throw new Error(`login ${who.email}: ${res.status}`);

  return data.token;
}
async function api(token, method, path) {
  const res = await fetch(`${API}${path}`, { method, headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });

  return { status: res.status, data: await res.json().catch(() => ({})) };
}

const MOYEN = ['functionGrapher', 'geometry3d', 'algebra', 'vectors', 'trigonometry', 'transformations', 'numberLab', 'logic', 'measurement'];
const SECONDAIRE = [...MOYEN.filter((id) => id !== 'geometry3d'), 'probabilityStats', 'sequences', 'conics', 'analysis'];

/**
 * Pour chaque instrument partagé : où aller dans l'outil (`prepare`), ce que
 * le collège n'a JAMAIS (`absent`), et ce que le lycée a (`present`).
 */
const SHARED = [
  {
    slug: 'grapheur', name: 'راسم الدوال',
    absent: ['[data-ml-tangent-toggle]', '[data-ml-preset="\\\\sin(x)"]', '[data-ml-preset="x^2"]'],
    present: ['[data-ml-tangent-toggle]', '[data-ml-preset="\\\\sin(x)"]'],
    collegeHas: ['[data-ml-preset="2x+1"]'],
  },
  {
    slug: 'algebre', name: 'مختبر الجبر',
    prepare: async (page) => { await page.locator('[data-ml-alg-tab="functions"]').click(); await page.waitForTimeout(400); },
    absent: ['[data-ml-alg-family="quadratic"]'],
    present: ['[data-ml-alg-family="quadratic"]'],
    collegeHas: ['[data-ml-alg-family="affine"]'],
  },
  {
    slug: 'vecteurs', name: 'مختبر الأشعة',
    absent: ['[data-ml-scale]', '[data-ml-analysis]', '[data-ml-experiment="scalar"]', '[data-ml-experiment="perpendicular"]'],
    present: ['[data-ml-scale]', '[data-ml-analysis]', '[data-ml-experiment="perpendicular"]'],
    collegeHas: ['[data-ml-sum]', '[data-ml-experiment="translation"]'],
  },
  {
    slug: 'trigonometrie', name: 'مختبر المثلثات',
    absent: ['[data-ml-trig-mode="circle"]', '[data-ml-trig-unit="rad"]', '[data-ml-trig-quadrant-readout]', '[data-ml-trig-play]', '[data-ml-trig-special="90"]'],
    present: ['[data-ml-trig-mode="circle"]', '[data-ml-trig-unit="rad"]', '[data-ml-trig-play]'],
    collegeHas: ['[data-ml-trig-special="45"]'],
  },
  {
    slug: 'transformations', name: 'مختبر التحويلات',
    absent: ['[data-ml-toggle="showMatrix"]', '[data-ml-toggle="showIntermediate"]', '[data-ml-experiment="order"]'],
    present: ['[data-ml-toggle="showMatrix"]', '[data-ml-experiment="order"]'],
    collegeHas: ['[data-ml-add-step="dilation"]', '[data-ml-add-step="rotation"]', '[data-ml-preset="reflectOrigin"]'],
  },
  {
    slug: 'logique', name: 'مختبر المنطق',
    absent: ['[data-ml-lg-area-tab="quantifiers"]', '[data-ml-lg-area-tab="induction"]', '[data-ml-lg-area-tab="proof"]', '[data-ml-lg-area-tab="connectors"]'],
    present: ['[data-ml-lg-area-tab="quantifiers"]', '[data-ml-lg-area-tab="induction"]'],
    collegeHas: ['[data-ml-lg-area-tab="counterexample"]', '[data-ml-lg-area-tab="implication"]'],
  },
];

const studentToken = await login(STUDENT);
const teacherToken = await login(TEACHER);
const before = new Set(((await api(teacherToken, 'GET', '/math-lab/documents')).data.documents ?? []).map((doc) => doc.id));
const browser = await chromium.launch();
const errors = [];

async function newPage(token, viewport = { width: 1280, height: 800 }, extra = {}) {
  const context = await browser.newContext({ viewport, locale: 'ar-DZ', ...extra });
  await context.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.removeItem('sa-ml-lab'); } catch { /* noop */ } }, token);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`${page.url()} :: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/status of (401|404)/.test(m.text())) errors.push(`${page.url()} :: console: ${m.text()}`); });

  return page;
}
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const cardIds = (page, scope) => page.locator(`[data-ml-lab-tools="${scope}"] [data-ml-tool-card]`).evaluateAll((els) => els.map((el) => el.getAttribute('data-ml-tool-card')));
const sorted = (list) => [...list].sort();

try {
  // ── 1. L'accueil ────────────────────────────────────────────────────────
  for (const viewport of [{ width: 1280, height: 800, label: 'bureau' }, { width: 390, height: 844, label: 'téléphone' }]) {
    console.log(`\nL'accueil @ ${viewport.label}`);
    const page = await newPage(studentToken, viewport, viewport.width < 500 ? { hasTouch: true, isMobile: true } : {});
    await page.goto(`${BASE}/espace/atelier`, { waitUntil: 'networkidle' });
    await page.locator('[data-ml-home-view="landing"]').waitFor({ timeout: 20000 });
    check(page.url().endsWith('/espace/atelier'), 'l’accueil reste sur /espace/atelier (aucune route nouvelle)');
    check(await page.evaluate(() => document.documentElement.dir) === 'rtl', 'la page est RTL');
    const common = await page.locator('[data-ml-common-tools] [data-ml-tool-card]').evaluateAll((els) => els.map((el) => el.getAttribute('data-ml-tool-card')));
    check(JSON.stringify(common) === '["whiteboard"]', 'la سبّورة seule est en tête, commune', common.join(','));
    check(await page.locator('[data-ml-common-badge]').count() === 1, 'elle porte la pastille « مشتركة »');
    const order = await page.evaluate(() => {
      const top = (sel) => document.querySelector(sel)?.getBoundingClientRect().top ?? -1;

      return [top('[data-ml-common-tools]'), top('[data-ml-lab-choices]'), top('[data-ml-work-space], [data-ml-docs-empty]')];
    });
    check(order[0] >= 0 && order[0] < order[1] && order[1] < order[2], 'l’ordre : السبّورة → les deux مخابر → أعمالي', order.map(Math.round).join(' < '));
    const choices = await page.locator('[data-ml-lab-choice]').evaluateAll((els) => els.map((el) => el.getAttribute('data-ml-lab-choice')));
    check(JSON.stringify(choices) === '["moyen","secondaire"]', 'deux choix clairs : المتوسط puis الثانوي');
    const choiceText = await page.locator('[data-ml-lab-choices]').innerText();
    check(choiceText.includes('مخبر المتوسط') && choiceText.includes('مخبر الثانوي'), 'les noms « مخبر المتوسط » et « مخبر الثانوي » sont écrits');
    check(await page.locator('[data-ml-lab-choices] [data-ml-tool-card]').count() === 0, 'aucun instrument de مخبر sur l’accueil lui-même');
    check(await page.locator('[data-ml-lab-choice="moyen"] [data-ml-lab-choice-tool]').count() > 0, 'chaque choix annonce ses instruments en icônes');
    check(await overflow(page) <= 1, 'aucun débordement horizontal', `${await overflow(page)}px`);
    const bad = (await page.locator('main').innerText()).match(/\bNaN\b|\bundefined\b|labs\.[a-z]+|tools\.[a-zA-Z]+\./);
    check(!bad, 'aucune clé brute ni NaN', bad?.[0] ?? '');
    await page.screenshot({ path: `${OUT}/home-${viewport.label}.png`, fullPage: true });
    await page.context().close();
  }

  // ── 2. Chaque مخبر : exactement ses instruments ─────────────────────────
  console.log('\nLes مخابر');
  {
    const page = await newPage(studentToken);
    await page.goto(`${BASE}/espace/atelier`, { waitUntil: 'networkidle' });
    await page.locator('[data-ml-lab-choice="moyen"]').click();
    await page.locator('[data-ml-home-view="lab"][data-ml-lab="moyen"]').waitFor();
    await page.locator('[data-ml-work-space], [data-ml-docs-empty]').first().waitFor({ timeout: 15000 });
    check(page.url().endsWith('/espace/atelier?lab=moyen'), 'choisir مخبر المتوسط → /espace/atelier?lab=moyen');
    check(await page.locator('h1').innerText() === 'مخبر المتوسط', 'le titre est « مخبر المتوسط »');
    const moyen = await cardIds(page, 'moyen');
    check(JSON.stringify(sorted(moyen)) === JSON.stringify(sorted(MOYEN)), 'مخبر المتوسط : exactement ses neuf instruments', moyen.join(','));
    check(moyen[0] !== 'whiteboard' && !moyen.includes('whiteboard'), 'la سبّورة n’est pas un instrument du مخبر (elle est commune)');
    for (const lycee of ['analysis', 'sequences', 'conics', 'probabilityStats']) check(!moyen.includes(lycee), `  pas de « ${lycee} » au collège`);
    const links = await page.locator('[data-ml-lab-tools="moyen"] a').evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    check(links.every((href) => href.endsWith('?lab=moyen')), 'chaque carte ouvre l’instrument DANS ce مخبر (?lab=moyen)');
    check(await page.locator('[data-ml-common-tools] [data-ml-tool-card="whiteboard"]').count() === 1, 'la سبّورة reste à portée dans le مخبر');
    const pill = await page.locator('[data-ml-work-lab-pill="moyen"]').count();
    const empty = await page.locator('[data-ml-docs-empty]').count();
    check(pill === 1 || empty === 1, '« أعمالي » est filtré sur ce مخبر (pastille retirable)');
    await page.screenshot({ path: `${OUT}/lab-moyen.png`, fullPage: true });

    await page.locator('[data-ml-lab-switch-item="secondaire"]').click();
    await page.locator('[data-ml-home-view="lab"][data-ml-lab="secondaire"]').waitFor();
    check(page.url().endsWith('?lab=secondaire'), 'le commutateur mène à مخبر الثانوي');
    const secondaire = await cardIds(page, 'secondaire');
    check(JSON.stringify(sorted(secondaire)) === JSON.stringify(sorted(SECONDAIRE)), 'مخبر الثانوي : exactement ses douze instruments', secondaire.join(','));
    check(!secondaire.includes('geometry3d'), '  pas de « geometry3d » au lycée');
    check(await page.locator('[data-ml-lab-switch-item="secondaire"]').getAttribute('aria-current') === 'page', 'l’onglet courant est marqué aria-current');
    await page.screenshot({ path: `${OUT}/lab-secondaire.png`, fullPage: true });

    await page.locator('[data-ml-lab-back]').click();
    await page.locator('[data-ml-home-view="landing"]').waitFor();
    check(page.url().endsWith('/espace/atelier'), '« المختبر » ramène à l’accueil');
    await page.context().close();

    const phone = await newPage(studentToken, { width: 390, height: 844 }, { hasTouch: true, isMobile: true });
    for (const scope of ['moyen', 'secondaire']) {
      await phone.goto(`${BASE}/espace/atelier?lab=${scope}`, { waitUntil: 'networkidle' });
      await phone.locator(`[data-ml-lab-tools="${scope}"]`).waitFor();
      check(await overflow(phone) <= 1, `${scope} @ 390 px : aucun débordement`, `${await overflow(phone)}px`);
      await phone.screenshot({ path: `${OUT}/lab-${scope}-phone.png`, fullPage: true });
    }
    await phone.context().close();
  }

  // ── 3. Chaque instrument partagé, dans chaque مخبر ──────────────────────
  // Le compte ENSEIGNANT : il a accès à tous les instruments (l'élève QA
  // n'a que l'offre gratuite — certains instruments y sont fermés).
  for (const tool of SHARED) {
    console.log(`\n${tool.name} (${tool.slug})`);
    const page = await newPage(teacherToken);
    for (const scope of ['moyen', 'secondaire']) {
      await page.goto(`${BASE}/enseignant/atelier/${tool.slug}?lab=${scope}`, { waitUntil: 'networkidle' });
      await page.locator('[data-ml-scope-badge]').waitFor({ timeout: 20000 });
      await page.waitForTimeout(600);
      check(await page.locator('[data-ml-scope-badge]').getAttribute('data-ml-scope-badge') === scope, `[${scope}] la barre porte le badge du مخبر`);
      if (tool.prepare) await tool.prepare(page);
      if (scope === 'moyen') {
        for (const selector of tool.absent) check(await page.locator(selector).count() === 0, `[${scope}] absent : ${selector}`);
        for (const selector of tool.collegeHas ?? []) check(await page.locator(selector).count() > 0, `[${scope}] présent : ${selector}`);
      } else {
        for (const selector of tool.present) check(await page.locator(selector).count() > 0, `[${scope}] présent : ${selector}`);
      }
      check(await overflow(page) <= 1, `[${scope}] aucun débordement`);
      await page.screenshot({ path: `${OUT}/tool-${tool.slug}-${scope}.png` });
    }
    const back = await page.locator('[data-ml-back]').getAttribute('href');
    check(back === '/enseignant/atelier?lab=secondaire', `« retour » ramène au مخبر ouvert (${back})`);
    await page.context().close();
  }

  // ── 4. Un instrument d'un seul مخبر ne s'ouvre que dans le sien ─────────
  console.log('\nInstruments d’un seul مخبر');
  {
    const page = await newPage(studentToken);
    await page.goto(`${BASE}/espace/atelier/analyse?lab=moyen`, { waitUntil: 'networkidle' });
    await page.waitForURL(/analyse\?lab=secondaire/, { timeout: 15000 }).catch(() => {});
    check(page.url().endsWith('/analyse?lab=secondaire'), 'التحليل demandé au collège s’ouvre au ثانوي (URL corrigée)');
    await page.goto(`${BASE}/espace/atelier/suites?lab=moyen`, { waitUntil: 'networkidle' });
    await page.waitForURL(/suites\?lab=secondaire/, { timeout: 15000 }).catch(() => {});
    check(page.url().endsWith('/suites?lab=secondaire'), 'المتتاليات demandées au collège s’ouvrent au ثانوي');
    await page.goto(`${BASE}/espace/atelier/probabilites-statistiques?lab=moyen`, { waitUntil: 'networkidle' });
    await page.waitForURL(/probabilites-statistiques\?lab=secondaire/, { timeout: 15000 }).catch(() => {});
    check(page.url().endsWith('?lab=secondaire'), 'الاحتمالات والإحصاء demandés au collège s’ouvrent au ثانوي');
    await page.goto(`${BASE}/espace/atelier/geometrie-3d?lab=secondaire`, { waitUntil: 'networkidle' });
    await page.waitForURL(/geometrie-3d\?lab=moyen/, { timeout: 15000 }).catch(() => {});
    check(page.url().endsWith('/geometrie-3d?lab=moyen'), 'الهندسة ثلاثية الأبعاد demandée au lycée s’ouvre au collège');
    await page.goto(`${BASE}/espace/atelier/nombres`, { waitUntil: 'networkidle' });
    await page.waitForURL(/nombres\?lab=/, { timeout: 15000 }).catch(() => {});
    check(page.url().endsWith('/nombres?lab=moyen'), 'un lien nu vers un instrument partagé s’ouvre au collège par défaut (et l’URL le dit)');
    await page.goto(`${BASE}/espace/atelier/tableau?lab=moyen`, { waitUntil: 'networkidle' });
    await page.locator('[data-ml-tool="whiteboard"]').waitFor({ timeout: 20000 });
    check(await page.locator('[data-ml-scope-badge]').count() === 0, 'la سبّورة n’a pas de مخبر (pas de badge)');
    check((await page.locator('[data-ml-back]').getAttribute('href')).endsWith('/espace/atelier'), 'son « retour » mène à l’accueil du مختبر');
    await page.context().close();
  }

  // ── 5. Le document se souvient de son مخبر ──────────────────────────────
  console.log('\nLe document garde son مخبر');
  // L'enseignant : l'élève QA a épuisé le quota de travaux de l'offre gratuite.
  {
    const page = await newPage(teacherToken);
    await page.goto(`${BASE}/enseignant/atelier/grapheur?lab=moyen`, { waitUntil: 'networkidle' });
    await page.locator('[data-ml-preset="2x"]').waitFor({ timeout: 20000 });
    await page.locator('[data-ml-preset="2x"]').click();
    await page.waitForURL(/\/grapheur\/\d+\?lab=moyen$/, { timeout: 20000 }).catch(() => {});
    const url = page.url();
    check(/\/grapheur\/\d+\?lab=moyen$/.test(url), 'à sa naissance, l’URL garde ?lab=moyen', url.replace(BASE, ''));
    const id = Number(url.match(/grapheur\/(\d+)/)?.[1]);
    await page.waitForTimeout(3500);
    const stored = await api(teacherToken, 'GET', `/math-lab/documents/${id}`);
    check(stored.data.document?.data?.labScope === 'moyen', 'le serveur a reçu data.labScope = moyen');
    check(stored.data.document?.summary?.scope === 'moyen', 'le résumé de « أعمالي » porte scope = moyen');
    await page.goto(`${BASE}/enseignant/atelier/grapheur/${id}`, { waitUntil: 'networkidle' });
    await page.waitForURL(/\?lab=moyen$/, { timeout: 15000 }).catch(() => {});
    check(page.url().endsWith(`/grapheur/${id}?lab=moyen`), 'rouvert SANS ?lab=, il revient au collège (URL complétée)');
    check(await page.locator('[data-ml-scope-badge="moyen"]').count() === 1, 'le badge dit المتوسط');
    check(await page.locator('[data-ml-tangent-toggle]').count() === 0, 'et المماس n’existe toujours pas');
    // Même demandé au lycée, un travail reste dans le مخبر où il est né.
    await page.goto(`${BASE}/enseignant/atelier/grapheur/${id}?lab=secondaire`, { waitUntil: 'networkidle' });
    await page.waitForURL(/\?lab=moyen$/, { timeout: 15000 }).catch(() => {});
    check(page.url().endsWith('?lab=moyen') && await page.locator('[data-ml-tangent-toggle]').count() === 0, 'demandé au ثانوي, il reste au collège');

    await page.goto(`${BASE}/enseignant/atelier`, { waitUntil: 'networkidle' });
    const card = page.locator(`[data-ml-doc="${id}"]`);
    await card.waitFor({ timeout: 15000 });
    check(await card.locator('[data-ml-work-lab-badge="moyen"]').count() === 1, 'sa carte de « أعمالي » porte le badge المتوسط');
    await page.locator('[data-ml-work-lab="secondaire"]').first().click({ trial: false }).catch(async () => {
      await page.locator('[data-ml-work-filters-open]').click();
      await page.locator('[data-ml-work-filters-sheet] [data-ml-work-lab="secondaire"]').click();
    });
    await page.waitForTimeout(400);
    check(await page.locator(`[data-ml-doc="${id}"]`).count() === 0, 'le filtre « مخبر الثانوي » la masque');
    await page.locator('[data-ml-work-lab-pill="secondaire"]').click();
    await page.waitForTimeout(300);
    check(await page.locator(`[data-ml-doc="${id}"]`).count() === 1, 'retirer la pastille la rend');

    await page.locator('[data-ml-work-new]').click();
    const groups = await page.locator('[data-ml-work-new-group]').evaluateAll((els) => els.map((el) => el.getAttribute('data-ml-work-new-group')));
    check(JSON.stringify(groups) === '["common","moyen","secondaire"]', '« عمل جديد » est rangé : للجميع, المتوسط, الثانوي', groups.join(','));
    check(await page.locator('[data-ml-work-new-group="moyen"] [data-ml-work-new-tool="analysis"]').count() === 0, '  aucun instrument du lycée sous المتوسط');
    await page.screenshot({ path: `${OUT}/work-new-menu.png` });
    await page.context().close();
  }

  // ── 6. L'espace enseignant ──────────────────────────────────────────────
  console.log('\nL’espace enseignant');
  {
    const page = await newPage(teacherToken);
    await page.goto(`${BASE}/enseignant/atelier`, { waitUntil: 'networkidle' });
    await page.locator('[data-ml-lab-choice="secondaire"]').waitFor({ timeout: 20000 });
    check((await page.locator('[data-ml-lab-choice="secondaire"]').getAttribute('href')) === '/enseignant/atelier?lab=secondaire', 'les choix restent dans /enseignant/atelier');
    await page.locator('[data-ml-lab-choice="secondaire"]').click();
    await page.locator('[data-ml-lab-tools="secondaire"] [data-ml-tool-card="analysis"]').click();
    await page.waitForURL(/\/enseignant\/atelier\/analyse\?lab=secondaire/, { timeout: 15000 }).catch(() => {});
    check(/\/enseignant\/atelier\/analyse\?lab=secondaire$/.test(page.url()), 'un instrument s’ouvre sous /enseignant, dans son مخبر');
    await page.context().close();
  }

  // ── 7. Le calque d'une leçon ────────────────────────────────────────────
  console.log('\nLe calque (leçon de 4AM)');
  {
    const page = await newPage(studentToken);
    await page.goto(`${BASE}${LESSON}`, { waitUntil: 'networkidle' });
    const trigger = page.locator('[data-ml-overlay-trigger]').first();
    if (await trigger.count() === 0) {
      check(false, `pas de bouton « المختبر » sur ${LESSON}`);
    } else {
      await trigger.click();
      await page.locator('[data-ml-overlay-picker]').waitFor({ timeout: 20000 });
      check(await page.locator('[data-ml-overlay-lab="moyen"]').getAttribute('aria-pressed') === 'true', 'le sélecteur s’ouvre sur مخبر المتوسط (le cycle de la leçon)');
      const tools = await page.locator('[data-ml-overlay-tool]').evaluateAll((els) => els.map((el) => el.getAttribute('data-ml-overlay-tool')));
      check(tools[0] === 'whiteboard', 'la سبّورة en tête');
      check(!tools.includes('analysis') && !tools.includes('sequences') && !tools.includes('probabilityStats') && tools.includes('geometry3d'), 'les instruments du collège seulement', tools.join(','));
      await page.screenshot({ path: `${OUT}/overlay-moyen.png` });
      await page.locator('[data-ml-overlay-tool="functionGrapher"]').click();
      await page.locator('[data-ml-overlay="functionGrapher"] [data-ml-grapher]').waitFor({ timeout: 20000 });
      check(await page.locator('[data-ml-overlay] [data-ml-scope-badge="moyen"]').count() === 1, 'l’instrument ouvert porte le badge المتوسط');
      check(await page.locator('[data-ml-tangent-toggle]').count() === 0, 'sans المماس');
      await page.locator('[data-ml-overlay-back]').click();
      await page.locator('[data-ml-overlay-lab="secondaire"]').click();
      const lycee = await page.locator('[data-ml-overlay-tool]').evaluateAll((els) => els.map((el) => el.getAttribute('data-ml-overlay-tool')));
      check(lycee.includes('analysis') && lycee.includes('probabilityStats') && !lycee.includes('geometry3d'), 'passer au ثانوي change la liste, sans quitter la leçon');
      await page.locator('[data-ml-overlay-close]').click();
    }
    await page.context().close();
  }

  check(errors.length === 0, 'aucune erreur de page ni de console', errors.slice(0, 4).join(' | '));
} finally {
  // Ménage : les documents créés par ce script.
  const after = (await api(teacherToken, 'GET', '/math-lab/documents')).data.documents ?? [];
  for (const doc of after) if (!before.has(doc.id)) await api(teacherToken, 'DELETE', `/math-lab/documents/${doc.id}`);
  await browser.close();
}

console.log(`\n${passed} ✓ · ${failed} ✗ · captures dans ${OUT}`);
process.exit(failed ? 1 : 0);
