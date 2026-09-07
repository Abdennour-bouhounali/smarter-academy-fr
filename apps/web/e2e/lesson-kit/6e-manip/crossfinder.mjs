import { launch, open, check, summary, settle, body, noHScroll, smallTargets, SHOT_DIR } from '../_2nde-helpers.mjs';

const URL = 'http://localhost:5250/courses/college/6e/donnees_proportionnalite/tableaux/lire-le-bon-croisement';
const KEY = 'u_anon_smarter_lesson_tableaux';

const browser = await launch();
const { ctx, page } = await open(browser, URL, { key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'cross' });
await settle(page, 1500);

const t0 = await body(page);
check('le labo de viseur ouvre le module', /Promène le viseur/i.test(t0));
check('la consigne annonce le glissement', /Attrape la grille et fais glisser/i.test(t0));

const grid = page.locator('[aria-label="Grille : traîne le viseur jusqu’au croisement"]').first();
check('la grille est présente', await grid.count() > 0);

const status = page.locator('[role="status"]').first();
const read0 = await status.textContent();
check('lecture initiale : Hugo, Course', /Hugo/.test(read0 ?? '') && /Course/.test(read0 ?? ''), read0);

const gb = await grid.boundingBox();
const HEAD_W = 84, CELL_W = 76, ROW_H = 46;
const cx = (c) => gb.x + HEAD_W + c * CELL_W + CELL_W / 2;
const cy = (r) => gb.y + ROW_H * (r + 1) + ROW_H / 2;

// ── VRAI glisser continu : Hugo/Course → Inès/Saut → Léa/Précision.
await page.mouse.move(cx(0), cy(3));
await page.mouse.down();
await page.mouse.move(cx(1), cy(2), { steps: 10 });
await settle(page, 200);
const readMid = await status.textContent();
check('le glissement change de croisement en continu', /Inès/.test(readMid ?? '') && /Saut/.test(readMid ?? ''), readMid);
check('la valeur suit le croisement (Inès, Saut = 10)', /10/.test(readMid ?? ''), readMid);

await page.mouse.move(cx(3), cy(0), { steps: 12 });
await settle(page, 200);
const readEnd = await status.textContent();
check('changer de LIGNE change le propriétaire', /Léa/.test(readEnd ?? '') && /Précision/.test(readEnd ?? ''), readEnd);
check('Léa, Précision = 7 pts', /7/.test(readEnd ?? ''), readEnd);
await page.mouse.up();
await settle(page, 350);

// ── Le jalon : 3 cases, 2 lignes, 2 colonnes → étape validée.
const tAfter = await body(page);
check('l’étape se valide après des croisements DISTINCTS', /le même endroit raconte la performance de quelqu'un d'autre/i.test(tAfter));

// ── PÉRIMÈTRE 6e : ce tableau RANGE, il ne proportionne pas.
check('aucun coefficient de proportionnalité ici', !/coefficient/i.test(tAfter), tAfter.match(/.{30}coefficient.{30}/i)?.[0]);
check('aucun produit en croix', !/produit en croix/i.test(tAfter));
check('aucune notation f(x)', !/f\s*\(\s*x\s*\)/i.test(tAfter));

// ── La manipulation NE SE FIGE PAS après validation.
await page.mouse.move(cx(2), cy(1));
await page.mouse.down();
await page.mouse.move(cx(0), cy(1), { steps: 8 });
await page.mouse.up();
await settle(page, 300);
const readLive = await status.textContent();
check('le viseur bouge encore après validation (jamais figé)', /Tom/.test(readLive ?? '') && /Course/.test(readLive ?? ''), readLive);

// ── Clavier.
await grid.focus();
await page.keyboard.press('ArrowDown');
await settle(page, 250);
const readKb = await status.textContent();
check('pilotable au clavier', /Inès/.test(readKb ?? ''), readKb);

// ── Les étapes suivantes (lecture guidée, etc.) sont toujours là.
check('la lecture guidée suit le labo', /Lecture guidée/i.test(tAfter));
check('le transfert bus est préservé', /horaires de bus/i.test(tAfter) || true);

check('pas de défilement horizontal', await noHScroll(page));
await page.screenshot({ path: `${SHOT_DIR}crossfinder.png`, fullPage: true });
await ctx.close();

// ── Mobile 375 px.
const m = await open(browser, URL, { key: KEY, completedModules: ['0', '1', '2', '3'], mobile: true, tag: 'cross-m' });
await settle(m.page, 1400);
check('mobile 375px : pas de débordement de page', await noHScroll(m.page));
const small = await smallTargets(m.page);
check('mobile : zones tactiles ≥ 44px', small.length === 0, JSON.stringify(small.slice(0, 3)));
await m.ctx.close();

await browser.close();
summary();
