import { launch, open, check, summary, settle, body, noHScroll, smallTargets, SHOT_DIR } from '../_2nde-helpers.mjs';

const URL = 'http://localhost:5250/courses/college/6e/donnees_proportionnalite/proportionnalite/completer-le-tableau';
const KEY = 'u_anon_smarter_lesson_proportionnalite';

const browser = await launch();
const { ctx, page } = await open(browser, URL, { key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'arrow' });
await settle(page, 1500);

const t0 = await body(page);
check('le labo de flèche ouvre le module', /Traîne la flèche sur le tableau/i.test(t0));
check('la consigne annonce le glissement', /Attrape la flèche/i.test(t0));

const grid = page.locator('[aria-label="Tableau : traîne la flèche pour lire les multiplications"]').first();
check('la grille est présente', await grid.count() > 0);

const arrow = page.locator('[aria-label="Flèche de lecture du tableau"]').first();
check('la flèche est saisissable', await arrow.count() > 0);

// État initial : flèche verticale sur la 1re colonne (1 crêpe → 3 €).
const read0 = await page.locator('[role="status"]').first().textContent();
check('lecture initiale verticale', /Flèche verticale/i.test(read0 ?? ''), read0);

const gb = await grid.boundingBox();
const HEAD_W = 96, CELL_W = 76, ROW_H = 48, GAP_H = 56;
const colX = (i) => gb.x + HEAD_W + i * CELL_W + CELL_W / 2;
const downY = gb.y + ROW_H + GAP_H / 2 - 30;      // hors couloir → verticale
const corridorY = gb.y + ROW_H + GAP_H / 2;        // dans le couloir → horizontale

// ── VRAI glisser : de la colonne 0 vers la colonne 2, hors couloir.
const ab = await arrow.boundingBox();
await page.mouse.move(ab.x + ab.width / 2, ab.y + ab.height / 2);
await page.mouse.down();
await page.mouse.move(colX(2), downY, { steps: 12 });
await page.mouse.up();
await settle(page, 350);

const readDown = await page.locator('[role="status"]').first().textContent();
check('le glissement change de colonne', /colonne 6/.test(readDown ?? ''), readDown);
check('la lecture reste verticale', /Flèche verticale/i.test(readDown ?? ''));
const tDown = await body(page);
check('vers le bas : la multiplication est écrite', /6 × 3 = 18/.test(tDown), tDown.match(/\d+ × \d+ = \d+/g)?.join(' | '));

// ── PÉRIMÈTRE 6e : aucune division / aucun quotient y÷x affiché.
check('aucun quotient y ÷ x affiché', !/÷/.test(tDown), tDown.match(/.{20}÷.{20}/)?.[0]);
check('aucune notation f(x) ni y = ax', !/f\s*\(\s*x\s*\)|y\s*=\s*a\s*[x×]/i.test(tDown));

// ── Glisser dans le COULOIR : la flèche se couche.
const arrow2 = page.locator('[aria-label="Flèche de lecture du tableau"]').first();
const ab2 = await arrow2.boundingBox();
await page.mouse.move(ab2.x + ab2.width / 2, ab2.y + ab2.height / 2);
await page.mouse.down();
await page.mouse.move(colX(1), corridorY, { steps: 14 });
await page.mouse.up();
await settle(page, 350);

const readAcross = await page.locator('[role="status"]').first().textContent();
check('passer entre les lignes couche la flèche', /Flèche horizontale/i.test(readAcross ?? ''), readAcross);
const tAcross = await body(page);
check('sur le côté : le MÊME facteur sur les deux lignes', /DEUX lignes/.test(tAcross));
check('les deux multiplications sont écrites', (tAcross.match(/\d+(?:,\d+)? × \d+(?:,\d+)? = \d+/g) ?? []).length >= 2,
  (tAcross.match(/\d+(?:,\d+)? × \d+(?:,\d+)? = \d+/g) ?? []).join(' | '));

// ── Le jalon : deux verticales distinctes + une horizontale → étape validée.
check('l’étape se valide après des lectures DISTINCTES', /Deux lectures, deux nombres différents/.test(tAcross));

// ── La manipulation NE SE FIGE PAS après validation.
const arrow3 = page.locator('[aria-label="Flèche de lecture du tableau"]').first();
check('la flèche existe toujours après validation', await arrow3.count() > 0);
const ab3 = await arrow3.boundingBox();
await page.mouse.move(ab3.x + ab3.width / 2, ab3.y + ab3.height / 2);
await page.mouse.down();
await page.mouse.move(colX(3), downY, { steps: 10 });
await page.mouse.up();
await settle(page, 350);
const readAfter = await page.locator('[role="status"]').first().textContent();
check('elle bouge encore après validation (jamais figée)', /colonne 9/.test(readAfter ?? ''), readAfter);

// ── Clavier.
await arrow3.focus();
await page.keyboard.press('ArrowLeft');
await settle(page, 250);
const readKb = await page.locator('[role="status"]').first().textContent();
check('pilotable au clavier', /colonne 6/.test(readKb ?? ''), readKb);

check('pas de défilement horizontal', await noHScroll(page));
await page.screenshot({ path: `${SHOT_DIR}arrowreader.png`, fullPage: true });
await ctx.close();

// ── Mobile 375 px.
const m = await open(browser, URL, { key: KEY, completedModules: ['0', '1', '2', '3'], mobile: true, tag: 'arrow-m' });
await settle(m.page, 1400);
check('mobile 375px : pas de débordement de page', await noHScroll(m.page));
const small = await smallTargets(m.page);
check('mobile : zones tactiles ≥ 44px', small.length === 0, JSON.stringify(small.slice(0, 3)));
await m.ctx.close();

await browser.close();
summary();
