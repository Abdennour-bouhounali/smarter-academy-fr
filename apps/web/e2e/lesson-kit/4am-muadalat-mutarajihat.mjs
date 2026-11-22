// 4AM — الوحدة 4 « معادلات ومتراجحات من الدرجة الأولى بمجهول واحد » (2026-10-01).
//
// Ce que ce fichier garde :
//   1. la page d'UNITÉ liste les 4 leçons dans l'ordre du manuel, puis la synthèse ;
//   2. CHAQUE module de CHAQUE leçon se monte sans erreur console, en RTL, sans
//      débordement horizontal (1280 et 320 px), sans clé i18n brute ;
//   3. les quatre laboratoires de l'unité répondent au VRAI geste (section 3) ;
//   4. leur couche décorative est aria-hidden et hors du parcours clavier.
//
// Run : KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-muadalat-mutarajihat.mjs
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE, launch, newCtx, watchErrors, check, summary, noHorizontalScroll, seed, lessonKey } from './helpers.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const UNIT_DIR = resolve(here, '../../src/lessons/moyen/4am/ansab_al_aadad_wal_hisab/muadalat-mutarajihat');
const LESSONS = ['muadala-ula', 'jidaa-maadum', 'mutarajiha-ula', 'tarrid-mushkila', 'wadiya-idmajiya-muadalat'];
const CONFIGS = Object.fromEntries(await Promise.all(LESSONS.map(async (id) => [id, (await import(pathToFileURL(`${UNIT_DIR}/${id}/lesson.config.js`).href)).LESSON_CONFIG])));
const CH = `${BASE}/courses/moyen/4am/ansab_al_aadad_wal_hisab`;
const errors = [];
const { browser } = await launch();

async function fresh({ mobile = false, lesson = null } = {}) {
  const ctx = await newCtx(browser, { mobile });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  // Les polices Google ne jugent rien ici ; hors ligne, elles bloquent l'événement « load ».
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  if (lesson) await seed(page, CONFIGS[lesson].modules.map((m) => String(m.number)), lessonKey(lesson));
  return { ctx, page };
}
/**
 * Aller à une page : « networkidle » jusqu'à 45 s ; une page CHARGÉE dont le réseau ne
 * se tait pas (le serveur PHP de développement traite une requête à la fois) n'est pas
 * un échec de la leçon — on continue sur l'état « load », et les vérifications jugent.
 */
async function go(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch (e) {
    if (!/Timeout/.test(String(e))) throw e;
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);
  }
}
// Depuis le 2026-10-13 la synthèse « wadiya-idmajiya-* » s'ouvre sur six وضعيات d'entraînement (practice_lab) : son
// module d'entrée n'est plus un `trigger`, c'est « al-wadiya » (module 7).
const modulePath = (lesson, stage) => (CONFIGS[lesson].modules.find((m) => m.stage === stage)
  ?? CONFIGS[lesson].modules.find((m) => m.slug === 'al-wadiya')).path;
async function pickLevel(page, level) {
  const tab = page.locator(`[data-manipulation-workspace] [role="tab"][data-level="${level}"]`).first();
  if (!(await tab.count())) return false;
  await tab.click();
  await page.waitForTimeout(350);
  return true;
}
async function visibleManip(page, type) {
  const scoped = page.locator(`[data-manipulation-level-panel]:not([hidden]) [data-manipulation="${type}"]`).first();
  if (await scoped.count()) return scoped;
  return page.locator(`[data-manipulation="${type}"]`).first();
}
const text = async (loc) => ((await loc.textContent()) ?? '').replace(/\s/g, '');
/** Toucher la source puis la zone : le chemin non-glisser du moteur de port. */
async function tapCarry(page, m, source, zone) {
  await m.locator(`[data-drag-source="${source}"]`).last().click();
  await page.waitForTimeout(120);
  await m.locator(`[data-drop-zone="${zone}"]`).first().click({ position: { x: 6, y: 6 } });
  await page.waitForTimeout(200);
}

// ── 1. La page d'unité ────────────────────────────────────────────────────
// LABS_ONLY=1 saute les sections 1–2 (montage de chaque module) pour itérer sur les labs.
if (!process.env.LABS_ONLY) {
  const { ctx, page } = await fresh();
  await go(page, `${CH}/units/muadalat-mutarajihat`);
  await page.waitForSelector('[data-unit="muadalat-mutarajihat"]');
  const ids = await page.$$eval('[data-unit-lesson]', (els) => els.map((e) => e.getAttribute('data-unit-lesson')));
  check('unité 4 : 4 leçons dans l’ordre du manuel, puis la synthèse « أدمج تعلّماتي »', JSON.stringify(ids) === JSON.stringify(LESSONS), ids.join(','));
  check('unité 4 : le défi d’ouverture (x² + 12x = 85) est affiché', await page.$('[data-unit-challenge]') !== null);
  check('unité 4 : aucun débordement horizontal', await noHorizontalScroll(page));
  await ctx.close();
}

// ── 2. Chaque module de chaque leçon se monte (1280 px puis 320 px) ───────
for (const mobile of (process.env.LABS_ONLY ? [] : [false, true])) {
  // MOUNT_LESSONS=a,b limite la section 2 à ces leçons (reprise d'un passage interrompu).
  for (const lesson of LESSONS.filter((l) => !process.env.MOUNT_LESSONS || process.env.MOUNT_LESSONS.split(',').includes(l))) {
    const { ctx, page } = await fresh({ mobile, lesson });
    const before = errors.length;
    await go(page, `${CH}/${lesson}`);
    check(`${lesson}${mobile ? ' (320)' : ''} : sommaire sans débordement`, await noHorizontalScroll(page));
    for (const m of CONFIGS[lesson].modules) {
      await go(page, `${BASE}${m.path}`);
      await page.waitForTimeout(400);
      const dir = await page.evaluate(() => document.documentElement.dir);
      const bodyText = await page.evaluate(() => document.body.innerText);
      check(`${lesson} M${m.number}${mobile ? ' (320)' : ''} : monté en RTL, sans débordement`, dir === 'rtl' && await noHorizontalScroll(page) && bodyText.length > 200);
      check(`${lesson} M${m.number}${mobile ? ' (320)' : ''} : aucune clé i18n ni undefined`, !/manipulation\.|undefined|NaN/.test(bodyText), (bodyText.match(/manipulation\.[a-zA-Z.]+|undefined|NaN/) ?? [''])[0]);
    }
    check(`${lesson}${mobile ? ' (320)' : ''} : aucune erreur console`, errors.length === before, errors.slice(before).join(' | '));
    await ctx.close();
  }
}

// ── 3. Les laboratoires au vrai geste — écrit après l'intégration des quatre types ──
/** Une poignée de réglette (useStretchInteraction) : Home, puis → jusqu'à ce que sa valeur lue corresponde. */
/** La valeur lue se termine EXACTEMENT par n (−2 ne passe pas pour 2). */
const endsWith = (n) => new RegExp(`(?<![\\d\\-−.,])${String(n).replace('-', '[-−]')}$`);
async function stretchTo(page, handle, re, max = 60) {
  await handle.focus();
  await page.keyboard.press('Home');
  await page.waitForTimeout(150);
  for (let i = 0; i <= max; i += 1) {
    const v = (await handle.getAttribute('aria-valuetext')) ?? '';
    if (re.test(v.replace(/[⁦-⁩\s]/g, ''))) { await page.waitForTimeout(950); return true; }
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(60);
  }
  return false;
}

// ── 3a. equation-balance 3x + 2 = 11 — un seul plateau fait pencher, le geste miroir rétablit ──
{
  const { ctx, page } = await fresh({ lesson: 'muadala-ula' });
  await go(page, `${BASE}${modulePath('muadala-ula', 'trigger')}`);
  await pickLevel(page, 'beginner');
  const m = await visibleManip(page, 'equation-balance');
  await m.waitFor();
  const bal = m.locator('[data-equation-balance]');
  check('L1 مبتدئ : la balance porte 3x + 2 = 11, de niveau', (await bal.getAttribute('data-eq')) === '3x+2=11' && (await bal.getAttribute('data-tilt')) === '0');
  await tapCarry(page, m, 'p:L:ball', 'reserve');
  check('L1 مبتدئ : ôter un ballon d’un seul plateau fait PENCHER le fléau', (await bal.getAttribute('data-tilt')) !== '0');
  // Un AUTRE effet (ajouter un sac à droite) pendant que le fléau penche : refusé. On vise le
  // plateau en touchant un de ses objets (le plateau est couvert par ses objets).
  await m.locator('[data-drag-source="r:bag"]').last().click(); await page.waitForTimeout(120);
  await m.locator('[data-drag-source="p:R:ball"]').last().click(); await page.waitForTimeout(250);
  const counts0 = await text(m.locator('[data-balance-count="R"]'));
  check('L1 مبتدئ : un autre effet est refusé tant que le fléau penche', (await bal.getAttribute('data-tilt')) !== '0' && (await m.locator('[data-balance-notice]').getAttribute('data-balance-notice')) === 'tipped', counts0);
  await page.keyboard.press('Escape');
  await tapCarry(page, m, 'p:R:ball', 'reserve');
  check('L1 مبتدئ : le même geste sur l’autre plateau rétablit l’équilibre et écrit une étape', (await bal.getAttribute('data-tilt')) === '0' && (await m.locator('[data-balance-step]').count()) >= 1);
  for (let i = 0; i < 1; i += 1) { await tapCarry(page, m, 'p:L:ball', 'reserve'); await tapCarry(page, m, 'p:R:ball', 'reserve'); }
  const counts = await text(m.locator('[data-balance-counts]'));
  check('L1 مبتدئ : 3 sacs face à 9 ballons', /3/.test(counts) && /9/.test(counts), counts);
  const kh = m.locator('[data-balance-divide] [data-stretch-handle]');
  if (await kh.count()) {
    await stretchTo(page, kh, /(^|\D)2(\D|$)/);
    const okAttr = await m.locator('[data-balance-groups]').getAttribute('data-ok').catch(() => null);
    check('L1 مبتدئ : partager 3 sacs en 2 groupes égaux est refusé (sac restant)', await m.locator('[data-balance-divide-go]').isDisabled() && okAttr !== 'true', String(okAttr));
    await stretchTo(page, kh, /(^|\D)3(\D|$)/);
    await m.locator('[data-balance-divide-go]').click(); await page.waitForTimeout(300);
  }
  check('L1 مبتدئ : en 3 groupes, un sac vaut 3 ballons (x = 3)', (await bal.getAttribute('data-solved')) === 'true', await text(m.locator('[data-balance-steps]')));
  const decor = m.locator('[data-decor-ball]').first();
  check('L1 décor : le ballon est aria-hidden et hors clavier', (await decor.getAttribute('aria-hidden')) === 'true' && (await decor.getAttribute('tabindex')) === '-1');
  await ctx.close();
}

// ── 3b. vanishing-pitch 3(x − 5) — épingle refusée, le terrain s'écrase en x = 5 ──
{
  const { ctx, page } = await fresh({ lesson: 'jidaa-maadum' });
  await go(page, `${BASE}${modulePath('jidaa-maadum', 'trigger')}`);
  await pickLevel(page, 'beginner');
  const m = await visibleManip(page, 'vanishing-pitch');
  await m.waitFor();
  const h = m.locator('[data-vanishing-ruler] [data-stretch-handle]').first();
  await stretchTo(page, h, endsWith(4));
  const field = m.locator('[data-vanishing-field]');
  check('L2 مبتدئ : x = 4, le terrain ne s’écrase pas', (await field.getAttribute('data-collapsed')) === 'false', await text(m.locator('[data-vanishing-x]')));
  await m.locator('[data-vanishing-pin-button]').click(); await page.waitForTimeout(250);
  check('L2 مبتدئ : épingler x = 4 est refusé (aire non nulle)', (await m.locator('[data-vanishing-refused]').count()) >= 1);
  await stretchTo(page, h, endsWith(5));
  check('L2 مبتدئ : en x = 5 le côté x − 5 est nul, le terrain s’écrase', (await field.getAttribute('data-collapsed')) === 'true');
  await m.locator('[data-vanishing-pin-button]').click(); await page.waitForTimeout(250);
  check('L2 مبتدئ : x = 5 épinglé comme solution', (await m.locator('[data-vanishing-pin]').count()) === 1);
  const decor = m.locator('[data-decor-ball]').first();
  check('L2 décor : le ballon est aria-hidden et hors clavier', (await decor.getAttribute('aria-hidden')) === 'true' && (await decor.getAttribute('tabindex')) === '-1');
  await ctx.close();
}

// ── 3c. solution-ray x < 3 — traces rouge / grise, crochet refusé puis accepté ──
{
  const { ctx, page } = await fresh({ lesson: 'mutarajiha-ula' });
  await go(page, `${BASE}${CONFIGS['mutarajiha-ula'].modules[2].path}`);
  await pickLevel(page, 'beginner');
  const m = await visibleManip(page, 'solution-ray');
  await m.waitFor();
  const probe = m.locator('[data-ray-probe]').first();
  await stretchTo(page, probe, endsWith(2));
  await stretchTo(page, probe, endsWith(4));
  const tried = await m.locator('[data-ray-tried] [data-tried-x]').evaluateAll((els) => els.map((e) => `${e.getAttribute('data-tried-x')}:${e.getAttribute('data-ok')}`));
  check('L3 مبتدئ : x = 2 laisse une trace rouge (solution), x = 4 une grise', tried.includes('2:true') && tried.includes('4:false'), tried.join(','));
  const bh = m.locator('[data-ray-bracket-handle]');
  if (await bh.count()) {
    await stretchTo(page, bh, endsWith(3));
    await m.locator('[data-ray-side="left"]').click();
    await m.locator('[data-ray-toward="true"]').click();
    await m.locator('[data-ray-fix]').click(); await page.waitForTimeout(250);
    check('L3 مبتدئ : crochet tourné vers le rouge en 3 refusé (3 n’est pas solution)', (await m.locator('[data-ray-bracket]').getAttribute('data-placed')) === 'false');
    await m.locator('[data-ray-toward="false"]').click();
    await m.locator('[data-ray-fix]').click(); await page.waitForTimeout(250);
    check('L3 مبتدئ : crochet détourné en 3 accepté (x < 3)', (await m.locator('[data-ray-bracket]').getAttribute('data-placed')) === 'true', String(await m.locator('[data-ray-verdict]').getAttribute('data-ray-verdict')));
  } else check('L3 مبتدئ : la pose du crochet s’ouvre après le contraste', false);
  await ctx.close();
}

// ── 3d. solution-ray −3x + 5 ≤ 20 — diviser par −3 sans inverser est refusé ──
{
  const { ctx, page } = await fresh({ lesson: 'mutarajiha-ula' });
  await go(page, `${BASE}${CONFIGS['mutarajiha-ula'].modules[2].path}`);
  await pickLevel(page, 'advanced');
  const m = await visibleManip(page, 'solution-ray');
  await m.waitFor();
  const probe = m.locator('[data-ray-probe]').first();
  await stretchTo(page, probe, endsWith(-6));
  await stretchTo(page, probe, endsWith(0));
  // La transformation s'ouvre après le crochet : −5, solutions à droite, tourné vers le rouge.
  await stretchTo(page, m.locator('[data-ray-bracket-handle]'), endsWith(-5));
  await m.locator('[data-ray-side="right"]').click();
  await m.locator('[data-ray-toward="true"]').click();
  await m.locator('[data-ray-fix]').click(); await page.waitForTimeout(300);
  check('L3 متقدم : crochet [ en −5, solutions à droite (x ≥ −5)', (await m.locator('[data-ray-bracket]').getAttribute('data-placed')) === 'true', String(await m.locator('[data-ray-verdict]').getAttribute('data-ray-verdict')));
  const cards = m.locator('[data-ray-card]');
  if (await cards.count()) {
    const ids = await cards.evaluateAll((els) => els.map((e) => e.getAttribute('data-ray-card')));
    const sub = ids.findIndex((t) => /5/.test(t) && !/div|times/.test(t));
    if (sub >= 0) { await cards.nth(sub).click(); await m.locator('[data-ray-choice="<="]').click(); await page.waitForTimeout(250); }
    check('L3 متقدم : retrancher 5 garde le sens (accepté)', (await m.locator('[data-ray-step]').getAttribute('data-ray-step')) === 'ok', ids.join(' '));
    const ids2 = await m.locator('[data-ray-card]').evaluateAll((els) => els.map((e) => e.getAttribute('data-ray-card')));
    const dv = ids2.findIndex((t) => /div/.test(t) && /3/.test(t) && /-|−/.test(t));
    if (dv >= 0) {
      await m.locator('[data-ray-card]').nth(dv).click(); await m.locator('[data-ray-choice="<="]').click(); await page.waitForTimeout(250);
      check('L3 متقدم : ÷(−3) en gardant ≤ est refusé par les traces', (await m.locator('[data-ray-step]').getAttribute('data-ray-step')) === 'ko');
      await m.locator('[data-ray-card]').nth(dv).click().catch(() => {});
      await m.locator('[data-ray-choice=">="]').click(); await page.waitForTimeout(250);
      check('L3 متقدم : ÷(−3) en inversant (x ≥ −5) est accepté', (await m.locator('[data-ray-step]').getAttribute('data-ray-step')) === 'ok');
    } else check('L3 متقدم : la carte ÷(−3) existe', false, ids2.join(' | '));
  } else check('L3 متقدم : les cartes de transformation s’ouvrent après le crochet', false);
  await ctx.close();
}

// ── 3e. growth-race 30 + x = 2(6 + x) — un modèle incomplet refusé, la course se rejoint en 18 ──
{
  const { ctx, page } = await fresh({ lesson: 'tarrid-mushkila' });
  await go(page, `${BASE}${modulePath('tarrid-mushkila', 'trigger')}`);
  await pickLevel(page, 'beginner');
  const m = await visibleManip(page, 'growth-race');
  await m.waitFor();
  const els = await m.locator('[data-drop-zone^="el:"]').evaluateAll((e) => e.map((n) => n.getAttribute('data-drop-zone')));
  // toucher le jeton puis la zone de la PREMIÈRE personne seulement
  await m.locator('[data-drag-source="tok"]').last().click(); await page.waitForTimeout(120);
  await m.locator(`[data-drop-zone="${els[0]}"]`).click({ position: { x: 6, y: 6 } }); await page.waitForTimeout(200);
  await m.locator('[data-gr-check]').click(); await page.waitForTimeout(250);
  check('L4 مبتدئ : un seul « + x » porté → le modèle est refusé', (await m.locator('[data-gr-verdict]').getAttribute('data-gr-verdict')) === 'ko', els.join(','));
  for (const z of els.slice(1)) {
    if ((await m.locator(`[data-gr-element="${z.slice(3)}"]`).getAttribute('data-carried')) === 'true') continue;
    await m.locator('[data-drag-source="tok"]').last().click(); await page.waitForTimeout(120);
    await m.locator(`[data-drop-zone="${z}"]`).click({ position: { x: 6, y: 6 } }); await page.waitForTimeout(200);
  }
  await m.locator('[data-gr-check]').click(); await page.waitForTimeout(250);
  check('L4 مبتدئ : chaque personne a vieilli → modèle accepté', (await m.locator('[data-gr-verdict]').getAttribute('data-gr-verdict')) === 'ok');
  await m.locator('[data-gr-open-race]').click(); await page.waitForTimeout(300);
  const h = m.locator('[data-gr-ruler] [data-stretch-handle]').first();
  await stretchTo(page, h, endsWith(18), 40);
  const rel = await m.locator('[data-gr-columns]').getAttribute('data-rel');
  check('L4 مبتدئ : en x = 18 les deux colonnes se rejoignent (48 = 2 × 24)', rel === '=' , String(rel));
  const decor = m.locator('[data-decor]').first();
  check('L4 décor : aria-hidden et hors clavier', (await decor.getAttribute('aria-hidden')) === 'true' && (await decor.getAttribute('tabindex')) === '-1');
  await ctx.close();
}

// ── 3f. growth-race dans la synthèse — le monde « pool » se monte ──
{
  const { ctx, page } = await fresh({ lesson: 'wadiya-idmajiya-muadalat' });
  await go(page, `${BASE}${modulePath('wadiya-idmajiya-muadalat', 'trigger')}`);
  const m = await visibleManip(page, 'growth-race');
  await m.waitFor();
  check('synthèse : la course des deux tarifs est dans le monde « pool »', (await m.locator('[data-growth-race]').first().getAttribute('data-theme')) === 'pool');
  await ctx.close();
}

await browser.close();
if (errors.length) console.log('\nErreurs console :', errors.slice(0, 10));
process.exit(summary() > 0 ? 1 : 0);
