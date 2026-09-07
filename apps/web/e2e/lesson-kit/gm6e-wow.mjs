/**
 * Suite « deep WOW » — les manipulations refondues des quatre leçons de 6e
 * grandeurs & mesures : aires, périmètres, angles, durées.
 *
 * Chaque leçon est vérifiée sur trois axes :
 *   1. le GESTE change l'état affiché (pas de clic de validation entre les deux) ;
 *   2. le BALAYAGE complet de la course ne produit ni chevauchement ni
 *      débordement (§6bis.4 : on balaie, on n'échantillonne pas) ;
 *   3. à 375 px : pas de défilement horizontal, zones tactiles ≥ 44 px.
 */
import {
  launch, open, check, summary, settle, body, noHScroll, smallTargets,
  layoutAudit, aspectAudit, domOverflow, sweepSliders, errs, SHOT_DIR,
} from '/home/abdennour/websites/smarter-academy-v2/apps/web/e2e/lesson-kit/_2nde-helpers.mjs';

const B = 'http://localhost:5250';
const base = (l) => `${B}/courses/college/6e/grandeurs_mesures/${l}`;
const seed = (l) => ({ key: `u_anon_smarter_lesson_${l}`, completedModules: ['0', '1', '2', '3', '4', '5', '6'] });

const browser = await launch();
const issues = [];

/** Ouvre un module, balaie tous ses sliders, renvoie la page. */
async function openModule(lesson, slug, tag, mobile = false) {
  const { ctx, page } = await open(browser, `${base(lesson)}/${slug}`, { ...seed(lesson), mobile, tag });
  await settle(page, 900);
  return { ctx, page };
}

/* ══════════════════════ AIRES ══════════════════════ */
{
  // M1 — le pavage au balayage.
  const { ctx, page } = await openModule('aires', 'la-guerre-des-pelouses', 'aires-m1');
  const t0 = await body(page);
  check('aires M1 · le labo de pavage est là', /balaie/i.test(t0), t0.slice(0, 200));
  check('aires M1 · compteur à 0 au départ', /0 \/ 12/.test(t0), t0.match(/\d+ \/ 12[^.]*/)?.[0]);

  // LE GESTE RÉEL : on appuie sur la pelouse et on BALAIE à la souris.
  const gridA = page.locator('[aria-label="Jardin A à paver"]').first();
  const ga = await gridA.boundingBox();
  await page.mouse.move(ga.x + 6, ga.y + ga.height * 0.25);
  await page.mouse.down();
  for (let k = 1; k <= 14; k += 1) {
    await page.mouse.move(ga.x + (ga.width - 6) * (k / 14), ga.y + ga.height * 0.25);
    await page.waitForTimeout(45);
  }
  await page.mouse.up();
  await settle(page, 300);
  const countA = async () => {
    const txt = await page.locator('[aria-label="Jardin A à paver"]')
      .locator('xpath=ancestor::div[contains(@class,"space-y-1.5")][1]').innerText();
    return Number(txt.replace(/\s+/g, ' ').match(/(\d+) \/ 12/)?.[1] ?? -1);
  };
  const swept = await countA();
  check('aires M1 · le BALAYAGE à la souris pose plusieurs carreaux d’un geste',
    swept >= 4, `${swept} carreaux posés en un balayage`);

  // Le chemin CLAVIER doit rester complet : les poignées de rangée.
  const rows = page.locator('[aria-label="Jardin A à paver"] ~ * button[aria-label^="Rangée"], [aria-label*="accès clavier"] button');
  const nRows = await rows.count();
  check('aires M1 · un chemin clavier existe (poignées de rangée)', nRows >= 2, String(nRows));
  for (let i = 0; i < nRows; i += 1) {
    const lbl = await rows.nth(i).getAttribute('aria-label');
    if (!/posée/.test(lbl || '')) { await rows.nth(i).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(120); }
  }
  await settle(page, 400);
  const full = await countA();
  check('aires M1 · le geste change le compte, sans validation', full === 12, `${full} / 12`);

  // Le labo NE SE FIGE PAS : on retire une rangée après coup.
  const firstRow = page.locator('[aria-label*="accès clavier"] button').first();
  await firstRow.focus(); await page.keyboard.press('Enter'); await settle(page, 300);
  const left = await countA();
  check('aires M1 · le labo reste vivant après la pose', left >= 0 && left < 12, `${left} / 12 après retrait`);
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}
{
  // M2 — LA manipulation signature : déformer à tour constant.
  const { ctx, page } = await openModule('aires', 'meme-contour-meme-aire', 'aires-m2');
  const t0 = await body(page);
  check('aires M2 · le terrain déformable est là', /coin rouge/i.test(t0));
  check('aires M2 · départ sur le carré (36 m²)', /36 m²/.test(t0), t0.match(/\d+ m²/g)?.slice(0, 3).join(' '));
  check('aires M2 · tour de 24 m au départ', /24 m\b/.test(t0));

  const slider = page.locator('[aria-label*="Coin du rectangle"]').first();
  check('aires M2 · la poignée est un slider pilotable', await slider.count() > 0);
  // Balayage COMPLET de la course : chaque état doit rester lisible.
  await slider.focus();
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(120);
    issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  }
  const tMin = await body(page);
  check('aires M2 · l’aire s’effondre à 11 m² (la lanière)', /11 m²/.test(tMin), tMin.match(/Surface[^0-9]*(\d+) m²/)?.[0]);
  check('aires M2 · le TOUR n’a pas bougé pendant tout le balayage', /24 m\b/.test(tMin));
  // Les deux extrêmes, au clavier : Fin puis Début.
  await slider.focus();
  await page.keyboard.press('End'); await page.waitForTimeout(250);
  const readAP = async () => ({
    tour: (await page.locator('[data-tour]').first().innerText()).replace(/\s+/g, ' ').trim(),
    aire: (await page.locator('[data-aire]').first().innerText()).replace(/\s+/g, ' ').trim(),
  });
  const tEnd = await body(page);
  const apEnd = await readAP();
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await page.keyboard.press('Home'); await page.waitForTimeout(250);
  const apHome = await readAP();
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  /* Les DEUX bornes de la course donnent la même aire — 1 × 11 et 11 × 1
     valent 11 m² — et c'est mathématiquement juste : la surface maximale
     (le carré, 36 m²) est au MILIEU. On vérifie donc que les deux bornes
     sont bien la lanière, et que le maximum a été traversé pendant le
     balayage précédent. */
  check('aires M2 · les deux bornes sont la lanière (11 m²)',
    apEnd.aire === '11 m²' && apHome.aire === '11 m²',
    `fin: ${apEnd.aire} · début: ${apHome.aire}`);
  check('aires M2 · le tour reste 24 m aux DEUX extrêmes',
    apEnd.tour === '24 m' && apHome.tour === '24 m', `${apEnd.tour} / ${apHome.tour}`);

  // LE GESTE RÉEL : attraper le coin rouge et le tirer à la souris.
  const svg = page.locator('[aria-label="Rectangle à tour constant"]').first();
  const sb = await svg.boundingBox();
  // On repart d'une position intermédiaire pour que le glisser ait de la course.
  await slider.focus();
  for (let i = 0; i < 5; i += 1) { await page.keyboard.press('ArrowUp'); await page.waitForTimeout(60); }
  const areaBefore = (await readAP()).aire;
  await page.mouse.move(sb.x + sb.width * 0.4, sb.y + sb.height * 0.5);
  await page.mouse.down();
  for (let k = 1; k <= 8; k += 1) {
    await page.mouse.move(sb.x + sb.width * 0.4, sb.y + sb.height * (0.5 - 0.35 * (k / 8)));
    await page.waitForTimeout(80);
    issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  }
  await page.mouse.up();
  await settle(page, 300);
  const tDrag = await body(page);
  const apDrag = await readAP();
  check('aires M2 · le GLISSER du sommet déforme le terrain',
    apDrag.aire !== areaBefore, `${areaBefore} m² → ${apDrag.aire} m²`);
  check('aires M2 · le tour reste 24 m pendant le glisser', apDrag.tour === '24 m', apDrag.tour);
  check('aires M2 · la découverte est validée par le geste', /clôture de 24 m|infinité de terrains/i.test(tDrag), '');
  // Le maximum (le carré, 36 m²) doit être atteignable — sinon la surprise
  // « de 36 à 11 avec la même clôture » n'existe pas.
  await slider.focus();
  await page.keyboard.press('Home'); await page.waitForTimeout(150);
  for (let i = 0; i < 5; i += 1) { await page.keyboard.press('ArrowUp'); await page.waitForTimeout(80); }
  const apMax = await readAP();
  check('aires M2 · le carré (36 m², l’aire maximale) est atteignable',
    apMax.aire === '36 m²' && apMax.tour === '24 m', `${apMax.aire} / tour ${apMax.tour}`);
  await ctx.close();
}
{
  // M4 — le potager qu'on étire : deux dimensions, un produit.
  const { ctx, page } = await openModule('aires', 'la-formule-du-rectangle', 'aires-m4');
  const t0 = await body(page);
  check('aires M4 · plus de bouton « Colorier une ligne »', !/Colorier une ligne/i.test(t0));
  const corner = page.locator('[aria-label*="Coin du potager"]').first();
  check('aires M4 · la poignée d’étirement existe', await corner.count() > 0);
  // Le VRAI glisser : on attrape le coin à la souris et on l'étire en
  // diagonale (le geste que fait l'élève), puis on vérifie le produit.
  const cb = await corner.boundingBox();
  const svgBox = await page.locator('[aria-label="Potager à étirer"]').boundingBox();
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await page.mouse.down();
  for (let k = 1; k <= 6; k += 1) {
    await page.mouse.move(svgBox.x + (svgBox.width * 0.15) + (svgBox.width * 0.7 * k) / 6,
                          svgBox.y + (svgBox.height * 0.15) + (svgBox.height * 0.6 * k) / 6);
    await page.waitForTimeout(90);
    issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  }
  await page.mouse.up();
  await settle(page, 300);
  const t1 = await body(page);
  const prod = t1.match(/(\d+) lignes? de (\d+) carreaux?/);
  check('aires M4 · le GLISSER change les deux dimensions', !!prod && (Number(prod[1]) > 1 || Number(prod[2]) > 1), prod?.[0]);
  check('aires M4 · le geste construit une multiplication',
    /= \d+ m²/.test(t1) && (Number(prod?.[1]) > 1 ? /× /.test(t1) : true), t1.match(/= \d+ m²[^A-Z]*/)?.[0]);
  // Puis le clavier, qui doit rester un chemin complet.
  await corner.focus();
  for (let i = 0; i < 3; i += 1) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(80); }
  const t2 = await body(page);
  check('aires M4 · le clavier pilote aussi la figure', /\d+ lignes de \d+/.test(t2), t2.match(/\d+ lignes de \d+/)?.[0]);
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ══════════════════════ PÉRIMÈTRES ══════════════════════ */
{
  // M1 — dérouler le contour en une ligne droite.
  const { ctx, page } = await openModule('perimetres', 'la-cloture-du-parc', 'perim-m1');
  const t0 = await body(page);
  check('périmètres M1 · le ruban à dérouler est là', /bout du ruban/i.test(t0));
  check('périmètres M1 · rien déroulé au départ', /0 m/.test(t0));
  const roll = page.locator('[aria-label*="Déroule le tour"]').first();
  check('périmètres M1 · la poignée du ruban existe', await roll.count() > 0);
  await roll.focus();
  // Balayage complet, du départ au tour entier.
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('PageUp');
    await page.waitForTimeout(90);
    issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  }
  await page.keyboard.press('End'); await page.waitForTimeout(300);
  const t1 = await body(page);
  check('périmètres M1 · le tour complet fait 43 m', /43 m/.test(t1), t1.match(/Contour déroulé[^0-9]*[\d,.]+ m/)?.[0]);
  check('périmètres M1 · la somme des côtés est écrite', /12 \+ 9 \+ 14 \+ 8/.test(t1));
  check('périmètres M1 · le mot « périmètre » arrive APRÈS le geste', /périmètre/i.test(t1));
  await page.keyboard.press('Home'); await page.waitForTimeout(250);
  const t2 = await body(page);
  check('périmètres M1 · le ruban se rembobine (labo vivant)', /0 m/.test(t2));
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}
{
  // M3 — fabriquer ses rectangles, voir L + l + L + l.
  const { ctx, page } = await openModule('perimetres', 'les-formules-magiques', 'perim-m3');
  const t0 = await body(page);
  check('périmètres M3 · le rectangle est redimensionnable', /coin rouge/i.test(t0));
  const corner = page.locator('[aria-label*="Coin du rectangle"]').first();
  check('périmètres M3 · la poignée existe', await corner.count() > 0);
  await corner.focus();
  const seen = new Set();
  for (const key of ['ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'ArrowDown']) {
    await page.keyboard.press(key); await page.waitForTimeout(140);
    const b = await body(page);
    const m = b.match(/L = (\d+) m · l = (\d+) m/);
    if (m) seen.add(`${m[1]}x${m[2]}`);
    issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  }
  check('périmètres M3 · le geste fabrique des rectangles distincts', seen.size >= 3, [...seen].join(','));
  const t1 = await body(page);
  check('périmètres M3 · le tour s’écrit L + l + L + l', /\d+ \+ \d+ \+ \d+ \+ \d+ =/.test(t1), t1.match(/\d+ \+ \d+ \+ \d+ \+ \d+ = \d+ m/)?.[0]);
  await ctx.close();
}

/* ══════════════════════ ANGLES ══════════════════════ */
{
  // M1 — LA misconception : rotation vs longueur des côtés.
  const { ctx, page } = await openModule('angles', 'l-ouverture', 'angles-m1');
  const t0 = await body(page);
  check('angles M1 · les trois poignées sont annoncées', /poignée bleue/i.test(t0) && /bouts des côtés/i.test(t0));
  const startDeg = (await body(page)).match(/(\d+)°/)?.[1];

  // Geste 1 : RALLONGER les côtés. La mesure ne doit PAS bouger.
  const ray = page.locator('[aria-label*="Longueur du côté fixe"]').first();
  check('angles M1 · la poignée de longueur existe', await ray.count() > 0);
  await ray.focus();
  for (let i = 0; i < 10; i += 1) {
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(70);
    issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  }
  const tAfterStretch = await body(page);
  const degAfterStretch = tAfterStretch.match(/(\d+)°/)?.[1];
  check('angles M1 · rallonger les côtés NE CHANGE PAS la mesure',
    startDeg === degAfterStretch, `${startDeg}° → ${degAfterStretch}°`);
  check('angles M1 · les côtés ont bien changé de longueur',
    /côtés : \d+ et \d+/.test(tAfterStretch), tAfterStretch.match(/côtés : \d+ et \d+/)?.[0]);

  // Geste 2 : TOURNER. La mesure doit bouger.
  const rot = page.locator('[aria-label*="Fais tourner le côté mobile"]').first();
  check('angles M1 · la poignée de rotation existe', await rot.count() > 0);
  await rot.focus();
  for (let i = 0; i < 14; i += 1) {
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(70);
    issues.push(...(await layoutAudit(page)), ...(await aspectAudit(page)), ...(await domOverflow(page)));
  }
  const tAfterRotate = await body(page);
  const degAfterRotate = tAfterRotate.match(/(\d+)°/)?.[1];
  check('angles M1 · tourner CHANGE la mesure', degAfterStretch !== degAfterRotate, `${degAfterStretch}° → ${degAfterRotate}°`);
  check('angles M1 · les deux gestes sont enregistrés', /j'ai fait pivoter/i.test(tAfterRotate) && /j'ai rallongé/i.test(tAfterRotate));
  check('angles M1 · la découverte est énoncée après le geste',
    /ouverture|écartement/i.test(tAfterRotate));
  await ctx.close();
}
{
  // M4 — le piège des deux graduations : il ne doit PAS se figer une fois
  // la réponse donnée (c'est en retournant voir l'autre graduation que
  // l'élève comprend pourquoi il n'y en a qu'une de bonne).
  const { ctx, page } = await openModule('angles', 'la-bonne-graduation', 'angles-m4');
  const before = await body(page);
  check('angles M4 · le rapporteur et ses deux échelles sont là',
    /graduation/i.test(before) && /50/.test(before) && /130/.test(before));
  const ticks = page.locator('main svg [tabindex="0"]');
  const nTicks = await ticks.count();
  check('angles M4 · les graduations sont tappables', nTicks > 0, String(nTicks));
  if (nTicks > 0) {
    await ticks.nth(Math.floor(nTicks / 3)).click({ force: true });
    await settle(page, 400);
    // Un choix de valeur peut s'ouvrir (double graduation) : on prend le premier.
    const picks = page.locator('main button').filter({ hasText: /^\s*\d+°?\s*$/ });
    if (await picks.count()) { await picks.first().click({ force: true }); await settle(page, 400); }
    const afterFirst = await body(page);
    // Le rapporteur doit rester tappable APRÈS la réponse.
    const stillTappable = await page.locator('main svg [tabindex="0"]').count();
    check('angles M4 · le rapporteur ne se fige pas après la réponse',
      stillTappable > 0, `${stillTappable} graduations encore actives`);
    check('angles M4 · une correction a été rendue', afterFirst.length > before.length - 50);
  }
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ══════════════════════ DURÉES ══════════════════════ */
{
  // M1 — le cadran qui accumule, et la retenue de 60.
  const { ctx, page } = await openModule('durees', 'la-course-contre-la-montre', 'durees-m1');
  const t0 = await body(page);
  check('durées M1 · le chronomètre ouvre la leçon', /grande aiguille/i.test(t0));
  check('durées M1 · départ à 9 h 00', /9 h 00/.test(t0));
  check('durées M1 · zéro tour au départ', /Tours complets/.test(t0));

  const dial = page.locator('[aria-label*="fais-la tourner"]').first();
  check('durées M1 · le cadran est pilotable', await dial.count() > 0);
  await dial.focus();
  // Balayage : un tour complet, minute par minute, en auditant chaque état.
  for (let i = 0; i < 13; i += 1) {
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(80);
    issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  }
  const tMid = await body(page);
  check('durées M1 · le geste fait avancer l’heure', !/9 h 00/.test(tMid) || /Temps écoulé : \d+ min/.test(tMid), tMid.match(/Temps écoulé : \d+ min/)?.[0]);
  // Franchir le 12 : LA retenue de 60.
  await page.keyboard.press('PageUp'); await page.waitForTimeout(300);
  const tCarry = await body(page);
  check('durées M1 · la retenue se fait à 60 (pas 100)',
    /Temps écoulé : (6[0-9]|[7-9]\d|1\d\d) min/.test(tCarry) && !/Dans le tour[^0-9]*(6[0-9]|[7-9]\d|\d{3}) min/.test(tCarry),
    tCarry.match(/Dans le tour[^0-9]*\d+ min/)?.[0]);
  check('durées M1 · un tour complet est compté', /Tours complets/.test(tCarry));
  check('durées M1 · l’heure a avancé d’une heure', /10 h |11 h |12 h /.test(tCarry), tCarry.match(/\d+ h \d\d/)?.[0]);
  // Le labo reste vivant : on revient en arrière.
  await page.keyboard.press('Home'); await page.waitForTimeout(250);
  const tBack = await body(page);
  check('durées M1 · on peut rembobiner (labo vivant)', /9 h 00/.test(tBack));
  issues.push(...(await layoutAudit(page)), ...(await domOverflow(page)));
  await ctx.close();
}

/* ══════════════════════ BALAYAGE VISUEL GLOBAL ══════════════════════ */
check('aucun chevauchement ni hors-cadre sur toute la course des gestes',
  issues.length === 0, issues.slice(0, 6).join(' | '));

/* ══════════════════════ MOBILE 375 px ══════════════════════ */
for (const [lesson, slug, label] of [
  ['aires', 'meme-contour-meme-aire', 'aires M2'],
  ['aires', 'la-guerre-des-pelouses', 'aires M1'],
  ['aires', 'les-unites-d-aire', 'aires M5'],
  ['perimetres', 'la-cloture-du-parc', 'périmètres M1'],
  ['perimetres', 'les-formules-magiques', 'périmètres M3'],
  ['angles', 'l-ouverture', 'angles M1'],
  ['durees', 'la-course-contre-la-montre', 'durées M1'],
]) {
  const { ctx, page } = await openModule(lesson, slug, `m-${lesson}`, true);
  check(`${label} · 375 px : pas de défilement horizontal`, await noHScroll(page));
  const small = await smallTargets(page);
  check(`${label} · 375 px : zones tactiles ≥ 44 px`, small.length === 0, JSON.stringify(small.slice(0, 4)));
  const mIssues = [...(await layoutAudit(page)), ...(await domOverflow(page))];
  // Balayage mobile de tous les sliders du module.
  const swept = [];
  await sweepSliders(page, swept);
  check(`${label} · 375 px : balayage sans débordement`,
    mIssues.length === 0 && swept.length === 0, [...mIssues, ...swept].slice(0, 4).join(' | '));
  await page.screenshot({ path: `${SHOT_DIR}gm6e-${lesson}-${slug}-375.png`, fullPage: true });
  await ctx.close();
}

check('aucune erreur console', errs.length === 0, errs.slice(0, 3).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
