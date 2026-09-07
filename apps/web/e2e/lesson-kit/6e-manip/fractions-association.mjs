import { launch, open, check, summary, settle, body, noHScroll, smallTargets, SHOT_DIR, errs } from '../_2nde-helpers.mjs';

const URL = 'http://localhost:5250/courses/college/6e/nombres_calculs/fractions/fractions-simples';
const KEY = 'u_anon_smarter_lesson_fractions';
const DONE = ['0', '1', '2', '3', '4', '5', '6'];
const browser = await launch();
const { ctx, page } = await open(browser, URL, { key: KEY, completedModules: DONE, tag: 'f' });
await settle(page, 1400);

// L'étape 2 (le jeu d'association) n'ouvre qu'après les 4 cartes de contexte :
// une part à colorier dans chacune (1/2, 1/3, 1/4, 1/10), puis Valider.
for (const den of [2, 3, 4, 10]) {
  const part = page.getByRole('button', { name: `Part 1 sur ${den}` });
  await part.scrollIntoViewIfNeeded();
  await part.click();
  await settle(page, 250);
  const card = page.locator('div.border-2.rounded-2xl').filter({ has: part });
  await card.getByRole('button', { name: /^Valider$/ }).click();
  await settle(page, 450);
}
await settle(page, 900);

const t = await body(page);
check('la consigne annonce le glisser', /Fais glisser chaque figure sur le nom/i.test(t));
check('plus de « tape une figure, puis tape le nom »', !/Tape une figure, puis tape le nom/i.test(t));

const zones = page.locator('button[data-drop-zone]');
check('les 4 noms sont des zones de dépôt', await zones.count() === 4, `zones: ${await zones.count()}`);
const figs = page.locator('button[aria-label^="Figure "]');
check('les 4 figures sont saisissables', await figs.count() === 4, `figures: ${await figs.count()}`);

// Quelle étiquette porte quel index de paire ? On lit data-drop-zone.
const zoneIds = await zones.evaluateAll((els) => els.map((e) => e.getAttribute('data-drop-zone')));

// ── 1) Un VRAI glisser FAUX : la figure 0 sur un nom qui n'est pas le sien.
const wrongZone = page.locator(`button[data-drop-zone="${zoneIds.find((z) => z !== '0')}"]`);
const f0 = figs.nth(0);
await f0.scrollIntoViewIfNeeded(); await settle(page, 400);
{
  const a = await f0.boundingBox(); const b = await wrongZone.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 20, a.y + a.height / 2, { steps: 5 });
  check('la figure suit le doigt (fantôme)', await page.locator('div.fixed.z-50.pointer-events-none').count() > 0);
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  check('le nom survolé s’allume', await wrongZone.getAttribute('data-drop-active') === 'true');
  await page.mouse.up();
  await settle(page, 250);
  check('une erreur est MONTRÉE, pas refusée en silence', (await wrongZone.getAttribute('class')).includes('border-rose-400'));
  await settle(page, 700);
}

// ── 2) Le VRAI glisser JUSTE : figure 0 sur le nom 0.
const rightZone = page.locator('button[data-drop-zone="0"]');
{
  const a = await f0.boundingBox(); const b = await rightZone.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 14 });
  await page.mouse.up();
  await settle(page, 500);
}
check('le glisser juste apparie', /1 \/ 4 paires trouvées/.test(await body(page)), (await body(page)).match(/\d \/ 4 paires trouvées/)?.[0]);

// ── 3) Le chemin clic/clavier (lecteur d'écran) apparie les 3 restantes.
for (const i of [1, 2, 3]) {
  const f = figs.nth(i);
  await f.scrollIntoViewIfNeeded();
  await f.click();
  await settle(page, 200);
  if (i === 1) check('activer une figure la PREND (aria-pressed)', await f.getAttribute('aria-pressed') === 'true');
  await page.locator(`button[data-drop-zone="${i}"]`).click();
  await settle(page, 350);
}
const end = await body(page);
check('le chemin clic/clavier apparie tout', /4 \/ 4 paires trouvées/.test(end), end.match(/\d \/ 4 paires trouvées/)?.[0]);
check('l’étape est validée', /Bien joué/.test(end));

// La manipulation ne se fige pas : les figures restent saisissables.
check('rien n’est figé après validation', await page.locator('button[aria-label^="Figure "]:not([disabled])').count() === 4);

check('pas de défilement horizontal', await noHScroll(page));
await page.screenshot({ path: `${SHOT_DIR}fractions-association.png`, fullPage: true });
await ctx.close();

const m = await open(browser, URL, { key: KEY, completedModules: DONE, mobile: true, tag: 'fm' });
await settle(m.page, 1300);
check('mobile 375px : pas de débordement', await noHScroll(m.page));
const small = await smallTargets(m.page);
check('mobile : zones tactiles ≥44px', small.length === 0, JSON.stringify(small.slice(0, 4)));
await m.ctx.close();

await browser.close();
check('aucune erreur console', errs.length === 0, errs.slice(0, 3).join(' | '));
process.exit(summary() ? 1 : 0);
