import { launch, open, check, summary, settle, body, noHScroll, smallTargets, SHOT_DIR, errs } from '../_2nde-helpers.mjs';

const URL = 'http://localhost:5250/courses/college/6e/grandeurs_mesures/aires/meme-contour-meme-aire';
const KEY = 'u_anon_smarter_lesson_aires';
const browser = await launch();
const { ctx, page } = await open(browser, URL, { key: KEY, completedModules: ['0', '1'], tag: 'a' });
await settle(page, 1400);

// L'étape 2 n'est offerte qu'après l'étape 1 : on déforme le terrain aux deux
// extrêmes (clavier sur la poignée-coin), comme le fait un élève.
const slider = page.locator('[role="slider"]').first();
await slider.focus();
await page.keyboard.press('Home');           // largeur 1 → la lanière (11 m², la plus petite)
await settle(page, 300);
for (let i = 0; i < 5; i += 1) await page.keyboard.press('ArrowRight'); // largeur 6 → le carré (36 m²)
await settle(page, 900);

const t = await body(page);
check('la consigne annonce le glisser', /Fais glisser/i.test(t), t.match(/escalier[^.]*\./)?.[0]);
check('plus de « tape un morceau, puis tape un emplacement »', !/tape un morceau/i.test(t));

const composer = page.locator('svg[aria-label="Atelier de découpage"]');
check('l’atelier est là', await composer.count() > 0);

const pieceA = composer.locator('g[role="button"]').first();      // 4 carreaux
const pieceB = composer.locator('g[role="button"]').nth(1);       // 2 carreaux
const slotA = composer.locator('rect[data-drop-zone="slot-A"]');
const slotB = composer.locator('rect[data-drop-zone="slot-B"]');
check('emplacements marqués data-drop-zone', await slotA.count() === 1 && await slotB.count() === 1);

// ── VRAI glisser de la pièce A (4 carreaux) vers son emplacement.
const drag = async (src, dst, wantGhost) => {
  // La souris de Playwright travaille en coordonnées de FENÊTRE : sans cette
  // remise dans le cadre, on tirerait 2000 px sous le bas de l'écran.
  await src.scrollIntoViewIfNeeded();
  await settle(page, 400);
  const a = await src.boundingBox(); const b = await dst.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 20, a.y + a.height / 2 + 20, { steps: 5 });
  if (wantGhost) {
    const g = await page.locator('svg.fixed.z-50.pointer-events-none').count();
    check('la pièce suit le doigt (fantôme)', g > 0, `fantômes: ${g}`);
    const hot = await dst.getAttribute('data-drop-active');
    check('avant d’arriver, l’emplacement n’est pas allumé', hot !== 'true');
  }
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  if (wantGhost) {
    check('l’emplacement survolé s’allume', await dst.getAttribute('data-drop-active') === 'true');
  }
  await page.mouse.up();
  await settle(page, 600);
};

await drag(pieceA, slotA, true);
const posA = await pieceA.evaluate((el) => el.style.transform);
check('le glisser a DÉPLACÉ la pièce A', /translate\(160px, 0px\)/.test(posA), posA);

// ── Chemin clic/clavier (lecteur d'écran) pour la pièce B : prendre puis poser.
await pieceB.click();
await settle(page, 250);
check('activer la pièce la PREND (aria-pressed)', await pieceB.getAttribute('aria-pressed') === 'true');
const hint = await body(page);
check('la consigne dit « pièce en main »', /Pièce en main/i.test(hint));
await slotB.click();
await settle(page, 700);
const posB = await pieceB.evaluate((el) => el.style.transform);
check('activer l’emplacement POSE la pièce B', /translate\(224px, 0px\)/.test(posB), posB);

const after = await body(page);
check('le rectangle est reconnu (aire conservée)', /toujours 4 \+ 2 = 6/.test(after) || /conserve l'aire/i.test(after), after.slice(0, 0));

// ── La manipulation ne se fige PAS après validation : on peut défaire.
const stillLive = await composer.locator('rect[data-drop-zone="slot-A0"]').count();
check('l’atelier reste manipulable après validation', stillLive === 1);
await pieceA.click(); await settle(page, 200);
await composer.locator('rect[data-drop-zone="slot-A0"]').click(); await settle(page, 600);
const backA = await pieceA.evaluate((el) => el.style.transform);
check('on peut défaire le rectangle', /translate\(0px, 32px\)/.test(backA), backA);

check('pas de défilement horizontal', await noHScroll(page));
await page.screenshot({ path: `${SHOT_DIR}aires-recompose.png`, fullPage: true });
await ctx.close();

const m = await open(browser, URL, { key: KEY, completedModules: ['0', '1'], mobile: true, tag: 'am' });
await settle(m.page, 1300);
check('mobile 375px : pas de débordement', await noHScroll(m.page));
const small = await smallTargets(m.page);
check('mobile : zones tactiles ≥44px', small.length === 0, JSON.stringify(small.slice(0, 4)));
await m.ctx.close();

await browser.close();
check('aucune erreur console', errs.length === 0, errs.slice(0, 3).join(' | '));
process.exit(summary() ? 1 : 0);
