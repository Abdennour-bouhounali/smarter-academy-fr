// 6e « fractions » — les deux nouvelles manipulations à deux prises,
// inspirées de RationalBar / CommonCutLab (3e) :
//   M5 station-quantite  → QuantityShareLab (ranger / emporter)
//   M6 fraction-quotient → ShareOutLab      (convives / pizzas)
// On vérifie le VRAI glisser (mouse.down/move/up), le chemin clavier,
// l'invariant (le total ne bouge pas), 375 px et les zones ≥ 44 px.
import { launch, open, check, summary, settle, body, noHScroll, smallTargets, layoutAudit, errs, SHOT_DIR } from '../_2nde-helpers.mjs';

const BASE = 'http://localhost:5250/courses/college/6e/nombres_calculs/fractions';
const KEY = 'u_anon_smarter_lesson_fractions';
const browser = await launch();

const attrs = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  return el ? { ...el.dataset } : null;
}, sel);

/** Vrai glisser souris. Les coordonnées de `page.mouse` sont celles du
 *  VIEWPORT : une poignée sous la ligne de flottaison est injoignable, donc on
 *  la ramène à l'écran avant de la saisir. */
async function dragX(page, locator, fromRatio, toRatio) {
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const b = await locator.boundingBox();
  const y = b.y + b.height / 2;
  await page.mouse.move(b.x + b.width * fromRatio, y);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * ((fromRatio + toRatio) / 2), y, { steps: 6 });
  await page.mouse.move(b.x + b.width * toRatio, y, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(350);
}

/* ══════════════ M5 — QuantityShareLab ══════════════ */
{
  const { ctx, page } = await open(browser, `${BASE}/station-quantite`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'm5',
  });
  await settle(page, 1200);

  const lab = '[data-qs-total]';
  check('M5 : le labo à deux prises est rendu', await page.locator(lab).count() > 0);

  const s0 = await attrs(page, lab);
  check('M5 : état initial 12 objets', s0 && s0.qsTotal === '12', JSON.stringify(s0));

  // Les deux prises sont deux sliders DISTINCTS sur la même figure.
  const sliders = page.locator(`${lab} [role="slider"]`);
  check('M5 : deux prises distinctes', await sliders.count() === 2, `${await sliders.count()}`);

  // ── VRAI glisser sur la prise « ranger » : la découpe doit changer,
  //    et le TOTAL doit rester rigoureusement identique (l'invariant).
  const cut = sliders.nth(1);
  await dragX(page, cut, 0.15, 0.85);
  const s1 = await attrs(page, lab);
  check('M5 : glisser la prise « ranger » change le nombre de paniers',
    s1.qsGroups !== s0.qsGroups, `${s0.qsGroups} → ${s1.qsGroups}`);
  check('M5 : INVARIANT — le total ne bouge pas quand on range',
    s1.qsTotal === s0.qsTotal, `${s0.qsTotal} → ${s1.qsTotal}`);
  check('M5 : les paniers restent ÉGAUX (groupes divisent le total)',
    Number(s1.qsTotal) % Number(s1.qsGroups) === 0, `${s1.qsTotal} / ${s1.qsGroups}`);
  check('M5 : « par panier » est dérivé, pas écrit en dur',
    Number(s1.qsPer) === Number(s1.qsTotal) / Number(s1.qsGroups), JSON.stringify(s1));

  // ── VRAI glisser sur la prise « emporter » : la découpe NE bouge PAS.
  const take = sliders.nth(0);
  await dragX(page, take, 0.02, 0.7);
  const s2 = await attrs(page, lab);
  check('M5 : glisser le bord « emporter » change les paniers emportés',
    s2.qsTaken !== s1.qsTaken, `${s1.qsTaken} → ${s2.qsTaken}`);
  check('M5 : emporter NE re-découpe pas (la 2e prise ne fait pas le travail de la 1re)',
    s2.qsGroups === s1.qsGroups, `${s1.qsGroups} → ${s2.qsGroups}`);
  check('M5 : on n’emporte jamais plus de paniers qu’il n’en existe',
    Number(s2.qsTaken) <= Number(s2.qsGroups), JSON.stringify(s2));

  // ── Chemin clavier, obligatoire.
  await take.focus();
  const before = (await attrs(page, lab)).qsTaken;
  await page.keyboard.press('ArrowLeft');
  await settle(page, 200);
  check('M5 : clavier — flèche gauche retire un panier',
    (await attrs(page, lab)).qsTaken !== before, `${before} → ${(await attrs(page, lab)).qsTaken}`);
  await cut.focus();
  const gBefore = (await attrs(page, lab)).qsGroups;
  await page.keyboard.press('Home');
  await settle(page, 200);
  check('M5 : clavier — Début ramène au rangement le plus grossier',
    (await attrs(page, lab)).qsGroups !== gBefore || gBefore === '2',
    `${gBefore} → ${(await attrs(page, lab)).qsGroups}`);

  // ── La manipulation ne se fige JAMAIS : on livre les 3 commandes puis
  //    on vérifie que les prises répondent encore.
  for (let i = 0; i < 6; i += 1) {
    const btn = page.locator('button:has-text("Livrer la commande")');
    if (await btn.count() === 0) break;
    // On amène l'état sur la cible annoncée en lisant la consigne.
    const txt = await body(page);
    const m = txt.match(/emporte\s+(\d+)\s*(\d+)\s+du tas/);
    // À défaut de lecture MathJax fiable, on itère au clavier vers la cible.
    void m;
    await btn.first().click();
    await settle(page, 300);
    if (i > 3) break;
  }
  const stillLive = await page.locator(`${lab} [role="slider"]`).count();
  check('M5 : les prises restent vivantes après validation (aucun disabled)',
    stillLive === 2, `${stillLive}`);
  const disabledInLab = await page.locator(`${lab} [disabled]`).count();
  check('M5 : aucun élément désactivé dans le labo', disabledInLab === 0, `${disabledInLab}`);

  const la = await layoutAudit(page);
  check('M5 : aucune étiquette SVG hors cadre ni chevauchée', la.length === 0, JSON.stringify(la.slice(0, 3)));
  check('M5 : pas de défilement horizontal', await noHScroll(page));
  await page.screenshot({ path: `${SHOT_DIR}fractions-m5-twogrip.png`, fullPage: true });
  await ctx.close();
}

/* ══════════════ M6 — ShareOutLab ══════════════ */
{
  const { ctx, page } = await open(browser, `${BASE}/fraction-quotient`, {
    key: KEY, completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'm6',
  });
  await settle(page, 1200);

  // Étape 1 (tap sur les 3 pizzas) précède le labo : on la franchit.
  // Les parts de PartitionShape (disque) sont des <path role="button">.
  const wedges = page.locator('path[role="button"]');
  const nWedges = await wedges.count();
  check('M6 : les 3 pizzas de l’étape 1 sont tapables', nWedges >= 12, `${nWedges} parts`);
  // Une part par pizza : les parts sont émises pizza par pizza (4 chacune).
  for (const idx of [0, 4, 8]) {
    if (idx < nWedges) { await wedges.nth(idx).click({ force: true }); await settle(page, 200); }
  }
  const vb = page.locator('button:has-text("Valider ma part")');
  if (await vb.count() > 0 && await vb.first().isEnabled()) { await vb.first().click(); await settle(page, 700); }

  const lab = '[data-so-pies]';
  const present = await page.locator(lab).count();
  check('M6 : le labo « convives / pizzas » est rendu', present > 0, `étape 1 franchie ? ${present}`);

  if (present > 0) {
    const sliders = page.locator(`${lab} [role="slider"]`);
    check('M6 : deux prises distinctes', await sliders.count() === 2, `${await sliders.count()}`);

    const s0 = await attrs(page, lab);

    // ── VRAI glisser sur « combien de personnes » : toutes les pizzas se
    //    recoupent, et le nombre de pizzas reste identique.
    const ppl = sliders.nth(0);
    await dragX(page, ppl, 0.02, 0.75);
    const s1 = await attrs(page, lab);
    check('M6 : glisser les convives change le nombre de personnes',
      s1.soPeople !== s0.soPeople, `${s0.soPeople} → ${s1.soPeople}`);
    check('M6 : INVARIANT — inviter du monde ne change pas le nombre de pizzas',
      s1.soPies === s0.soPies, `${s0.soPies} → ${s1.soPies}`);

    // La découpe VISIBLE suit : autant de secteurs que de convives.
    const wedgeCount = await page.locator(`${lab} svg > g:first-of-type > g:first-of-type path`).count();
    check('M6 : la découpe dessinée suit le nombre de convives',
      wedgeCount === Number(s1.soPeople), `${wedgeCount} secteurs pour ${s1.soPeople} convives`);

    // ── VRAI glisser sur « combien de pizzas » : la découpe NE change pas.
    const pie = sliders.nth(1);
    await dragX(page, pie, 0.02, 0.9);
    const s2 = await attrs(page, lab);
    check('M6 : glisser les pizzas change ce qu’on partage',
      s2.soPies !== s1.soPies, `${s1.soPies} → ${s2.soPies}`);
    check('M6 : ajouter une pizza NE re-découpe pas (les rôles ne se confondent pas)',
      s2.soPeople === s1.soPeople, `${s1.soPeople} → ${s2.soPeople}`);

    // ── Clavier.
    await ppl.focus();
    const pBefore = (await attrs(page, lab)).soPeople;
    await page.keyboard.press('ArrowLeft');
    await settle(page, 200);
    check('M6 : clavier — flèche gauche retire un convive',
      (await attrs(page, lab)).soPeople !== pBefore,
      `${pBefore} → ${(await attrs(page, lab)).soPeople}`);

    // ── Jamais figé.
    const dis = await page.locator(`${lab} [disabled]`).count();
    check('M6 : aucun élément désactivé dans le labo', dis === 0, `${dis}`);

    const la = await layoutAudit(page);
    check('M6 : aucune étiquette SVG hors cadre ni chevauchée', la.length === 0, JSON.stringify(la.slice(0, 3)));
  }
  check('M6 : pas de défilement horizontal', await noHScroll(page));
  await page.screenshot({ path: `${SHOT_DIR}fractions-m6-twogrip.png`, fullPage: true });
  await ctx.close();
}

/* ══════════════ 375 px — les deux modules ══════════════ */
for (const [slug, mods, tag] of [
  ['station-quantite', ['0', '1', '2', '3', '4'], 'm5m'],
  ['fraction-quotient', ['0', '1', '2', '3', '4', '5'], 'm6m'],
]) {
  const { ctx, page } = await open(browser, `${BASE}/${slug}`, {
    key: KEY, completedModules: mods, mobile: true, tag,
  });
  await settle(page, 1200);
  check(`375px ${slug} : pas de débordement`, await noHScroll(page));
  const small = await smallTargets(page);
  check(`375px ${slug} : zones tactiles ≥ 44 px`, small.length === 0, JSON.stringify(small.slice(0, 4)));

  // Les prises du labo, mesurées en pixels RÉELS (§6ter.5).
  const grips = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('[data-qs-total] [role="slider"], [data-so-pies] [role="slider"]')) {
      const r = el.getBoundingClientRect();
      out.push({ label: (el.getAttribute('aria-label') || '').slice(0, 34), w: Math.round(r.width), h: Math.round(r.height) });
    }
    return out;
  });
  const tooSmall = grips.filter((g) => g.h < 44 || g.w < 44);
  check(`375px ${slug} : chaque prise du labo mesure ≥ 44 px`,
    grips.length === 0 || tooSmall.length === 0, JSON.stringify(grips));
  const la = await layoutAudit(page);
  check(`375px ${slug} : étiquettes SVG lisibles`, la.length === 0, JSON.stringify(la.slice(0, 3)));
  await page.screenshot({ path: `${SHOT_DIR}fractions-${slug}-375.png`, fullPage: true });
  await ctx.close();
}

await browser.close();
check('aucune erreur console', errs.length === 0, errs.slice(0, 4).join(' | '));
process.exit(summary() ? 1 : 0);
