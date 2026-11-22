// « أتوقّع القاعدة » (2026-10-06) — l'élève écrit la règle avant de la lire.
// Prototype : درس 1 qasim-adad-tabii (modules 1 et 2). Vrai compte élève (API :8000),
// puis le compte enseignant (jamais arrêté).
// Run: KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/predict-rule.mjs
import { launch, newCtx, check, summary, watchErrors, BASE, SHOT_DIR } from './helpers.mjs';
import { readFileSync } from 'node:fs';

const API = process.env.KIT_API || 'http://localhost:8000/api/v1';
const LESSON = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab/qasim-adad-tabii`;
const AR = JSON.parse(readFileSync(new URL('../../src/i18n/locales/ar/lesson.json', import.meta.url)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function login(email) {
  const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email, password: 'QaPass2026!' }) }).then((x) => x.json());
  return { token: r.token ?? r.data?.token, uid: r.user?.id ?? r.data?.user?.id };
}

const { browser } = await launch();
const errors = [];

async function open(who, { mobile = false, done = ['0'], lesson = 'qasim-adad-tabii' } = {}) {
  const ctx = await newCtx(browser, { mobile });
  await ctx.addInitScript(([token, uid, done, lesson]) => {
    localStorage.setItem('token', token);
    if (!sessionStorage.getItem('seeded')) {
      // Modules `done` faits ; aucune prédiction encore (sauf celles gardées par le test).
      localStorage.setItem(`u_${uid}_smarter_lesson_${lesson}`, JSON.stringify({ completedModules: done, completedExercises: [], layoutVersion: 2 }));
      if (done.length === 1 || lesson !== 'qasim-adad-tabii') localStorage.removeItem(`u_${uid}_smarter_predictions_${lesson}`);
      sessionStorage.setItem('seeded', '1');
    }
  }, [who.token, who.uid, done, lesson]);
  const page = await ctx.newPage();
  watchErrors(page, errors);
  return { ctx, page };
}

const student = await login('qa-eleve@smarter.dz');
const teacher = await login('qa-prof@smarter.dz');

// ── Élève : module 1 ─────────────────────────────────────────────────────
{
  const { ctx, page } = await open(student, { mobile: true });
  await page.goto(`${LESSON}/al-maktaba`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /26 كتابًا في كل رفّ/ }).first().click();
  const panel = page.locator('[data-predict-for="qasim-baqi"]');
  await panel.waitFor({ timeout: 10000 });
  check('M1: le panneau « أتوقّع القاعدة » remplace la définition', await panel.isVisible() && (await page.locator('[data-knowledge-brick="qasim-baqi"]').count()) === 0);
  // Une OPTION de la question (le titre de l'étape, lui, reste visible).
  check('M1: la question qui suit est cachée tant que rien n\'est écrit', !(await page.getByRole('button', { name: '28 قاسم للعدد 420' }).isVisible().catch(() => false)));
  const btn = panel.getByRole('button', { name: AR.predict.reveal });
  check('M1: « أظهر القاعدة » désactivé avant d\'écrire', await btn.isDisabled());
  await panel.locator('textarea').fill('عند');
  check('M1: toujours désactivé avec 3 lettres', await btn.isDisabled());
  await panel.locator('textarea').click();
  await page.keyboard.type(' ما يكون الباقي ');
  // La palette ne propose QUE les symboles de cette définition : ≠ et les lettres a, b.
  const palette = await panel.locator('[data-math-symbols] button').allInnerTexts();
  check('M1: palette = symboles de la règle seulement (≠, a, b)', JSON.stringify(palette) === JSON.stringify(['≠', 'a', 'b']), JSON.stringify(palette));
  await panel.getByRole('button', { name: 'b', exact: true }).click();
  await page.keyboard.type('≠ 0');
  await panel.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOT_DIR}predict-m1-panel.png` });
  check('M1: actif après une phrase', await btn.isEnabled());
  await btn.click();
  await page.locator('[data-knowledge-brick="qasim-baqi"]').waitFor();
  check('M1: la règle complète apparaît, avec « توقّعك »', (await page.locator('[data-knowledge-brick="qasim-baqi"] [data-predict-own]').innerText()).includes('الباقي'));
  check('M1: la question réapparaît', await page.getByRole('button', { name: '28 قاسم للعدد 420' }).isVisible());
  await page.locator('[data-knowledge-brick="qasim-baqi"]').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOT_DIR}predict-m1-revealed.png` });

  // Revisite : la règle déjà prédite ne redemande rien.
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /26 كتابًا في كل رفّ/ }).first().click().catch(() => {});
  await sleep(800);
  check('M1 revisite: pas de second panneau, la prédiction est rappelée', (await page.locator('[data-predict-for="qasim-baqi"]').count()) === 0
    && (await page.locator('[data-knowledge-brick="qasim-baqi"] [data-predict-own]').count()) === 1);
  check('mobile: pas de débordement horizontal', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await ctx.close();
}

// ── Élève : module 2 (deux règles, un vocabulaire) ───────────────────────
{
  const { ctx, page } = await open(student, { done: ['0', '1'] });
  await page.goto(`${LESSON}/maarif`, { waitUntil: 'networkidle' });
  // Étape 1 : la définition par le باقي, déjà trouvée au module 1 → montrée telle quelle.
  await page.getByRole('button', { name: /باقي القسمة الإقليدية لـ 143 على 11 معدوم/ }).click();
  const jidaa = page.locator('[data-predict-for="qasim-jidaa"]');
  await jidaa.waitFor({ timeout: 10000 });
  check('M2: « بالجداء » attend une prédiction (prompt de la leçon)', (await jidaa.innerText()).includes('143'));
  const pal2 = await jidaa.locator('[data-math-symbols] button').allInnerTexts();
  check('M2: palette « بالجداء » = ×, =, ≠ et a, b, q', ['×', '=', '≠', 'a', 'b', 'q'].every((x) => pal2.includes(x)) && !pal2.includes('√') && !pal2.includes('∥'), JSON.stringify(pal2));
  await jidaa.locator('textarea').fill('a = b × q بدون باقي');
  await jidaa.getByRole('button', { name: AR.predict.reveal }).click();
  await page.locator('[data-knowledge-brick="qasim-jidaa"]').waitFor();
  check('M2: règle « بالجداء » révélée', true);
  await page.getByRole('button', { name: /6 و 20 قاسمان للعدد 120/ }).click();
  await page.locator('[data-knowledge-brick="siyagh-mutakafia"]').waitFor({ timeout: 10000 });
  check('M2: le vocabulaire (أربع جمل) est montré sans prédiction', (await page.locator('[data-predict-for="siyagh-mutakafia"]').count()) === 0);
  const wahid = page.locator('[data-predict-for="wahid-wa-nafsuh"]');
  check('M2: « 1 والعدد نفسه » attend une prédiction', await wahid.isVisible());
  await wahid.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOT_DIR}predict-m2-wahid.png` });
  await ctx.close();
}

// ── Une règle du MANUEL enveloppée (PredictRule) suivie de SA brique ─────
// mada-wasit-mutawassit, module 2 : le TextbookBox « الوسيط » précède la
// brique « wasit ». Une seule prédiction, puis la boîte ET la brique, une
// seule « توقّعك ».
{
  const { ctx, page } = await open(student, { done: ['0', '1'], lesson: 'mada-wasit-mutawassit' });
  await page.goto(`${BASE}/courses/moyen/4am/tanasubiya_duwal/mada-wasit-mutawassit/nashat-4`, { waitUntil: 'networkidle' });
  // Étape 1 : le classement (option « 6 valeurs », fausse : non bloquant), puis le salaire médian.
  await page.locator('button').filter({ hasText: '65000' }).nth(1).click();
  // La saisie de l'étape (pas celles du laboratoire au-dessus) : la dernière visible avant « حسنًا ».
  const salary = page.locator('input[inputmode], input[type="text"], input:not([type])').filter({ visible: true }).last();
  await salary.fill('42000');
  await salary.press('Enter');
  // La boîte enveloppée ET la brique attendent ; la seconde est masquée (elle SUIT la première).
  const panel = page.locator('[data-predict-for="wasit"]').first();
  await panel.waitFor({ timeout: 10000 });
  check('wasit: une seule prédiction visible, AVANT la définition du manuel', (await page.locator('[data-predict-panel]').filter({ visible: true }).count()) === 1
    && !(await page.locator('[data-textbook-box="definition"]').first().isVisible().catch(() => false)));
  await panel.locator('textarea').fill('القيمة التي في الوسط بعد الترتيب');
  await panel.getByRole('button', { name: AR.predict.reveal }).click();
  await page.locator('[data-knowledge-brick="wasit"]').waitFor({ timeout: 10000 });
  check('wasit: boîte du manuel ET brique visibles, sans second panneau', (await page.locator('[data-predict-panel]').count()) === 0
    && await page.locator('[data-predict-revealed="wasit"] [data-textbook-box="definition"]').isVisible());
  check('wasit: « توقّعك » affiché une seule fois', (await page.locator('[data-predict-own]').count()) === 1);
  await page.locator('[data-predict-revealed="wasit"]').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOT_DIR}predict-wasit.png` });
  check('wasit: page ouverte', !page.url().includes('/login'), page.url());
  await ctx.close();
}

// ── Enseignant : jamais arrêté ───────────────────────────────────────────
{
  const { ctx, page } = await open(teacher);
  await page.goto(`${LESSON}/maarif`, { waitUntil: 'networkidle' });
  await sleep(800);
  check('enseignant: aucune prédiction demandée', (await page.locator('[data-predict-panel]').count()) === 0);
  await ctx.close();
}

check('aucune erreur console/page', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
