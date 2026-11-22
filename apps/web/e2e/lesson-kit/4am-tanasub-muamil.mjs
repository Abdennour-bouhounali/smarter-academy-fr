// Unité 6, leçon 1 « التناسبية ومعامل التناسبية » (tanasub-muamil) — chaque module monté (1280 / 320 px),
// le lab ratio-ride au vrai geste (glisser la trottinette, −/+, clavier), ses refus, et la règle
// « un seul écran » (MANIPULATION_CONTRACT §8bis) mesurée aux quatre viewports, aux deux niveaux.
//   KIT_BASE=http://localhost:5175 node apps/web/e2e/lesson-kit/4am-tanasub-muamil.mjs     (LABS_ONLY=1 : le lab seul)
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BASE, launch, newCtx, watchErrors, check, summary, noHorizontalScroll, seed, lessonKey } from './helpers.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(here, '../../src/lessons/moyen/4am/tanasubiya_duwal/tanasubiya-dala-khattiya/tanasub-muamil');
const LESSON = 'tanasub-muamil';
const CONFIG = (await import(pathToFileURL(`${DIR}/lesson.config.js`).href)).LESSON_CONFIG;
const errors = [];
const { browser } = await launch();
// L'API locale n'est pas lancée (ou refuse l'origine d'un port d'auteur) : ces messages-là ne jugent pas la leçon.
const real = (list) => list.filter((e) => !/CORS policy|ERR_FAILED|api\/v1/.test(e));
const VIEWPORTS = [[1280, 800], [1366, 768], [390, 844], [320, 640]];

async function fresh({ mobile = false } = {}) {
  const ctx = await newCtx(browser, { mobile });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await seed(page, CONFIG.modules.map((m) => String(m.number)), lessonKey(LESSON));
  return { ctx, page };
}
async function go(page, url) {
  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); } catch (e) {
    if (!/Timeout/.test(String(e))) throw e;
    await page.waitForLoadState('load'); await page.waitForTimeout(1500);
  }
}
async function pickLevel(page, level) {
  const tab = page.locator(`[data-manipulation-workspace] [role="tab"][data-level="${level}"]`).first();
  if (!(await tab.count())) return false;
  await tab.click(); await page.waitForTimeout(350); return true;
}
const panel = (page) => page.locator('[data-manipulation-level-panel]:not([hidden]) [data-manipulation="ratio-ride"]').first();
/** La scène + ses commandes + le tableau + les jugements, amenés à l'écran, tiennent-ils dans la hauteur visible ? */
async function fitsOneScreen(page) {
  await page.locator('[data-manipulation-level-panel]:not([hidden]) [data-ride-glance]').first().scrollIntoViewIfNeeded();
  return page.evaluate(() => {
    const g = [...document.querySelectorAll('[data-manipulation-level-panel]:not([hidden]) [data-ride-glance]')].find((e) => e.offsetParent !== null);
    if (!g) return { ok: false, why: 'introuvable' };
    const r = g.getBoundingClientRect();
    const header = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
    const avail = innerHeight - Math.min(header, 72);
    return { ok: r.height <= avail + 1, why: `${Math.round(r.height)} px pour ${Math.round(avail)} px` };
  });
}
async function setX(page, m, target) {
  for (let i = 0; i < 40; i += 1) {
    const cur = await m.locator('[data-ratio-ride]').getAttribute('data-x');
    if (cur === String(target)) return true;
    await m.locator(`[data-ride-${cur === '' || Number(cur) < target ? 'more' : 'less'}]`).click();
    await page.waitForTimeout(30);
  }
  return false;
}
async function ride(page, m, x) { await setX(page, m, x); await page.waitForTimeout(750); await m.locator('[data-ride-record]').click(); await page.waitForTimeout(150); }

// ── 1. Chaque module se monte (1280 px puis 320 px) ──
for (const mobile of (process.env.LABS_ONLY ? [] : [false, true])) {
  const { ctx, page } = await fresh({ mobile });
  const before = errors.length;
  await go(page, `${BASE}/courses/moyen/4am/tanasubiya_duwal/${LESSON}`);
  check(`sommaire${mobile ? ' (mobile)' : ''} : sans débordement`, await noHorizontalScroll(page));
  for (const m of CONFIG.modules) {
    await go(page, `${BASE}${m.path}`);
    await page.waitForTimeout(500);
    const url = page.url();
    const bodyText = await page.evaluate(() => document.body.innerText);
    const dir = await page.evaluate(() => document.documentElement.dir);
    check(`M${m.number}${mobile ? ' (mobile)' : ''} : monté en RTL, sans débordement`, url.includes(m.slug) && dir === 'rtl' && await noHorizontalScroll(page) && bodyText.length > 200, `${url} ${bodyText.length}`);
    check(`M${m.number}${mobile ? ' (mobile)' : ''} : aucune clé i18n ni undefined`, !/manipulation\.|undefined|NaN/.test(bodyText), (bodyText.match(/manipulation\.[a-zA-Z.]+|undefined|NaN/) ?? [''])[0]);
  }
  check(`aucune erreur console${mobile ? ' (mobile)' : ''}`, real(errors.slice(before)).length === 0, real(errors.slice(before)).join(' | '));
  await ctx.close();
}

// ── 2. Le lab ratio-ride ──
{
  const { ctx, page } = await fresh();
  await go(page, `${BASE}${CONFIG.modules[1].path}`);
  await pickLevel(page, 'beginner');
  let m = panel(page);
  await m.waitFor();
  // glisser la trottinette sur la règle (le vrai geste)
  const handle = m.locator('[data-ride-handle]');
  const scene = m.locator('[data-ride-scene]');
  const sb = await scene.boundingBox();
  const hb = await handle.boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.mouse.down();
  await page.mouse.move(sb.x + sb.width * 0.55, hb.y + hb.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  const x1 = await m.locator('[data-ratio-ride]').getAttribute('data-x');
  check('L1 glisser la trottinette fixe la durée', x1 !== '' && Number(x1) > 0, x1);
  // clavier
  await handle.focus(); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
  check('L1 clavier : → ajoute une minute', (await m.locator('[data-ratio-ride]').getAttribute('data-x')) === String(Number(x1) + 1));
  await m.locator('[data-ride-claim="A:yes"]').click();
  check('L1 juger sans colonne : « سجّل رحلة أخرى »', (await m.locator('[data-ride-verdict]').getAttribute('data-ride-verdict')) === 'few');
  await ride(page, m, 2); await ride(page, m, 5);
  check('L1 deux colonnes enregistrées, quotients 15', (await m.locator('[data-ride-ratio="A:2"]').innerText()).includes('15') && (await m.locator('[data-ride-ratio="A:5"]').innerText()).includes('15'));
  check('L1 la leçon reçoit les colonnes (preuve au-dessus de la question)', await page.locator('[data-activity-evidence][data-tried="true"] [data-evidence-ride="5"]').count() === 1);
  await m.locator('[data-ride-claim="A:no"]').click();
  check('L1 « ليس جدول تناسبية » refusé : tous les quotients valent 15', (await m.locator('[data-ride-verdict]').getAttribute('data-ride-verdict')) === 'noRefused');
  await m.locator('[data-ride-claim="A:yes"]').click();
  check('L1 « جدول تناسبية » accepté, colonne fantôme 12 ouverte', (await m.locator('[data-ride-judged="A"]').count()) === 1 && (await m.locator('[data-ride-ghost]').getAttribute('data-x')) === '12');
  await m.locator('[data-ride-ghost-input]').fill('170'); await m.locator('[data-ride-ghost] button[type="submit"]').click();
  check('L1 colonne fantôme fausse refusée avec son quotient', (await m.locator('[data-ride-verdict]').getAttribute('data-ride-verdict')) === 'ghostWrong');
  await m.locator('[data-ride-ghost-input]').fill('١٨٠'); await m.locator('[data-ride-ghost] button[type="submit"]').click();
  await page.waitForTimeout(300);
  check('L1 180 (chiffres arabes) accepté → découverte ouverte', (await m.getAttribute('data-phase')) === 'discover');
  const decor = m.locator('[data-deco="scooter"]');
  check('L1 décor : la trottinette est aria-hidden', (await decor.getAttribute('aria-hidden')) === 'true');

  // متقدم : deux tarifs, quotients cachés, décider, écrire
  await pickLevel(page, 'advanced');
  m = panel(page);
  check('L2 quotients cachés jusqu’à la demande', (await m.locator('[data-ride-ratio]').count()) === 0 && (await m.locator('[data-ride-reveal]').count()) === 1);
  await ride(page, m, 0); await ride(page, m, 4); await ride(page, m, 7);
  await m.locator('[data-ride-claim="B:yes"]').click();
  check('L2 « 10x + 50 تناسبي » refusé (0 minute coûte 50DA)', (await m.locator('[data-ride-verdict]').getAttribute('data-ride-verdict')) === 'yesRefused');
  await m.locator('[data-ride-claim="B:no"]').click();
  await m.locator('[data-ride-claim="A:yes"]').click();
  await m.locator('[data-ride-formula-input]').fill('10'); await m.locator('[data-ride-formula] button[type="submit"]').click();
  check('L2 y = 10 × x refusé en rejouant une colonne', (await m.locator('[data-ride-verdict]').getAttribute('data-ride-verdict')) === 'formulaWrong');
  await m.locator('[data-ride-formula-input]').fill('15'); await m.locator('[data-ride-formula] button[type="submit"]').click();
  await page.waitForTimeout(300);
  check('L2 y = 15 × x accepté → découverte', (await m.getAttribute('data-phase')) === 'discover');

  // un seul écran, deux niveaux, quatre viewports (état chargé : colonnes + jugements)
  for (const level of ['beginner', 'advanced']) {
    await pickLevel(page, level);
    for (const [w, h] of VIEWPORTS) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(600);
      const fit = await fitsOneScreen(page);
      console.log(`  mesure ${level} ${w}×${h} : ${fit.why}`);
      check(`${level} ${w}×${h} : scène + commandes + tableau + jugements sur un seul écran`, fit.ok, fit.why);
      check(`${level} ${w}×${h} : aucun débordement horizontal`, await noHorizontalScroll(page));
    }
    await page.setViewportSize({ width: 1280, height: 800 });
  }
  await ctx.close();
}

await browser.close();
if (real(errors).length) console.log('erreurs console :', real(errors).join('\n'));
process.exit(summary() ? 1 : 0);
