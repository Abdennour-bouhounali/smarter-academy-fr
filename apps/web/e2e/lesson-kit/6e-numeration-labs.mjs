/**
 * Manipulations « deep WOW » des deux leçons de numération de 6e.
 *
 * Ce que la suite prouve, sur les modules refaits :
 *   - le GESTE change l'état affiché, sans clic de validation entre les deux ;
 *   - la manipulation ne se fige PAS après la validation de l'étape ;
 *   - aucun mot enseigné plus tard n'apparaît avant sa brique ;
 *   - 375 px : pas de défilement horizontal, zones tactiles ≥ 44 px.
 *
 * Vite tourne déjà sur 5250 — la suite ne le relance pas.
 */
import {
  launch, open, check, summary, settle, body, noHScroll, smallTargets,
  layoutAudit, domOverflow, SHOT_DIR, errs,
} from './_2nde-helpers.mjs';

const B = 'http://localhost:5250';
const ENT = `${B}/courses/college/6e/nombres_calculs/nombres-entiers`;
const DEC = `${B}/courses/college/6e/nombres_calculs/nombres-decimaux`;
const K_ENT = 'u_anon_smarter_lesson_nombres-entiers';
const K_DEC = 'u_anon_smarter_lesson_nombres-decimaux';

const browser = await launch();

/** Chemin CLAVIER / CLIC : activer l'objet le prend, activer la zone le pose.
 *  Déterministe, et c'est le jumeau accessible obligatoire du glisser (§17). */
async function poser(page, sourceLabel, zoneLabel) {
  await page.locator(`button[aria-label^="${sourceLabel}"]`).first().click();
  await page.locator(`[data-drop-zone="${zoneLabel}"] button:has-text("Poser ici")`).first().click();
  await settle(page, 180);
}

/** Chemin GLISSER réel : pointeur enfoncé sur l'objet, déplacé jusqu'à la
 *  colonne, relâché dessus. C'est le geste que l'élève fait au doigt. */
async function glisser(page, sourceLabel, zoneLabel, scope = null) {
  const root = scope ?? page;
  const src = root.locator(`button[aria-label^="${sourceLabel}"]`).first();
  const zone = root.locator(`[data-drop-zone="${zoneLabel}"]`).first();
  const a = await src.boundingBox();
  const b = await zone.boundingBox();
  if (!a || !b) return false;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  // Plusieurs pas : le hook suit le pointeur et allume la zone survolée.
  for (let i = 1; i <= 6; i += 1) {
    await page.mouse.move(
      a.x + a.width / 2 + ((b.x + b.width / 2) - (a.x + a.width / 2)) * (i / 6),
      a.y + a.height / 2 + ((b.y + b.height / 2) - (a.y + a.height / 2)) * (i / 6),
    );
  }
  await page.mouse.up();
  await settle(page, 220);
  return true;
}

/** Le nombre du plateau — le dernier role=status de la carte « Ton nombre »,
 *  jamais le message éphémère « en main » qui partage le même rôle. */
const readNumber = async (page) => {
  const n = page.locator('.tabular-nums[role="status"]').first();
  if (await n.count()) return ((await n.textContent()) || '').replace(/\s+/g, ' ').trim();
  return ((await page.locator('[role="status"]').last().textContent()) || '').replace(/\s+/g, ' ').trim();
};

/* ══════════════════════════════════════════════════════════════════
   NOMBRES ENTIERS — M1 : l'atelier de numération
   ══════════════════════════════════════════════════════════════════ */
{
  const { ctx, page } = await open(browser, `${ENT}/1`, {
    key: K_ENT, completedModules: ['0'], tag: 'ent-m1',
  });
  await settle(page, 900);

  const t0 = await body(page);
  check('ENT M1 — le labo est à l\'écran dès la première seconde',
    /Prends un objet et fais-le glisser/.test(t0) && /Le plateau/.test(t0), t0.slice(0, 160));

  // ── LE GLISSER RÉEL : c'est le geste demandé, il doit poser la pièce ──
  const before = await readNumber(page);
  await glisser(page, 'une centaine', 'C');
  const afterDrag = await readNumber(page);
  check('ENT M1 — GLISSER une centaine dans sa colonne pose la pièce (souris/doigt)',
    before !== afterDrag && /100/.test(afterDrag), `${before} → ${afterDrag}`);

  // ── un glisser qui finit hors zone ne pose rien ──
  const avantVide = await readNumber(page);
  const srcU = page.locator('button[aria-label^="une unité"]').first();
  const bb = await srcU.boundingBox();
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await page.mouse.down();
  await page.mouse.move(5, 5);
  await page.mouse.up();
  await settle(page, 250);
  check('ENT M1 — un glisser relâché hors d\'une colonne ne pose rien',
    (await readNumber(page)) === avantVide, await readNumber(page));

  // ── le chemin clavier / clic mène au MÊME état ──
  await poser(page, 'une centaine', 'C');
  const afterC = await readNumber(page);
  check('ENT M1 — le chemin clavier / clic pose la même pièce que le glisser',
    /200/.test(afterC), afterC);

  await poser(page, 'une dizaine', 'D');
  await poser(page, 'une unité', 'U');
  const after3 = await readNumber(page);
  check('ENT M1 — chaque objet posé ajoute exactement sa valeur',
    /211/.test(after3), after3);

  // ── un dépôt dans la mauvaise colonne est refusé (la contrainte enseigne) ──
  await page.locator('button[aria-label^="une centaine"]').first().click();
  const refuse = page.locator('[data-drop-zone="U"] button:has-text("Poser ici")').first();
  check('ENT M1 — poser une centaine dans la colonne des unités est refusé',
    await refuse.isDisabled());
  await page.locator('button[aria-label^="une centaine"]').first().click(); // reposer l'objet

  // ── construire la cible 234, puis vérifier que le labo NE SE FIGE PAS ──
  for (let i = 0; i < 2; i += 1) await poser(page, 'une dizaine', 'D');
  for (let i = 0; i < 3; i += 1) await poser(page, 'une unité', 'U');
  const cible = await readNumber(page);
  check('ENT M1 — la cible 234 se fabrique par dépôts successifs', /234/.test(cible), cible);
  await settle(page, 400);

  await poser(page, 'une unité', 'U');
  const apresCible = await readNumber(page);
  check('ENT M1 — le plateau reste vivant APRÈS la validation de l\'étape (règle 2)',
    /235/.test(apresCible), apresCible);

  // ── vocabulaire : rien de plus tard ne fuite avant sa brique ──
  const txt = await body(page);
  const avantBrique = txt.split('Le nombre de chiffres départage')[0] || txt;
  check('ENT M1 — aucun mot des modules suivants avant sa brique',
    !/valeur de position|ordre croissant|ordre de grandeur|encadrement|décompos/i.test(avantBrique),
    (avantBrique.match(/valeur de position|ordre croissant|ordre de grandeur|encadrement|décompos/i) || [])[0]);

  check('ENT M1 — pas de défilement horizontal (desktop)', await noHScroll(page));
  const la = await layoutAudit(page);
  check('ENT M1 — aucun texte SVG hors cadre ni en chevauchement', la.length === 0, JSON.stringify(la.slice(0, 3)));
  await page.screenshot({ path: `${SHOT_DIR}ent-m1-desktop.png`, fullPage: true });

  // ── L'ÉCHANGE EST UN GESTE : on vide le plateau, on empile dix cubes, et
  //    on ATTRAPE LA PILE pour la porter dans la colonne de gauche. ──
  await page.locator('button:has-text("Vider le plateau")').first().click();
  await settle(page, 350);
  for (let i = 0; i < 10; i += 1) await poser(page, 'une unité', 'U');
  await settle(page, 400);

  // L'étape 2 ouvre son PROPRE plateau dès qu'elle est déverrouillée : on
  // borne donc le geste au premier plateau, celui de l'étape 1.
  const lab1 = page.locator('[data-drop-zone="U"]').first().locator('xpath=ancestor::div[contains(@class,"space-y-3")][1]');
  const pile = lab1.locator('button[aria-label^="Prendre la pile de dix"]').first();
  check('ENT M1 — à dix objets, la PILE elle-même devient saisissable',
    await pile.count() > 0);
  if (await pile.count()) {
    const objets = () => page.locator('text=/objets? sur le plateau/').first().textContent();
    const av = ((await objets()) || '').match(/(\d+)/);
    const avant = await readNumber(page);
    await glisser(page, 'Prendre la pile de dix', 'D', lab1);
    await settle(page, 500);
    const ap = ((await objets()) || '').match(/(\d+)/);
    check('ENT M1 — GLISSER la pile de dix à gauche retire 9 objets du plateau',
      av && ap && Number(av[1]) - Number(ap[1]) === 9, `${av?.[1]} → ${ap?.[1]}`);
    check('ENT M1 — … et la VALEUR ne bouge pas : c\'est L\'INVARIANT du module',
      (await readNumber(page)) === avant, `${avant} → ${await readNumber(page)}`);
  }
  await ctx.close();
}

/* ── ENT M1 : l'échange, le cœur mathématique — et le mobile ── */
{
  const { ctx, page } = await open(browser, `${ENT}/1`, {
    key: K_ENT, completedModules: ['0'], mobile: true, tag: 'ent-m1-mob',
  });
  await settle(page, 900);

  check('ENT M1 mobile 375px — pas de défilement horizontal', await noHScroll(page));
  const small = await smallTargets(page);
  check('ENT M1 mobile — zones tactiles ≥ 44 px', small.length === 0, JSON.stringify(small.slice(0, 4)));

  // L'échange est déjà offert à l'étape 1 : dix cubes suffisent à faire naître
  // la pile. On les pose, ce qui est aussi le chemin le plus court vers l'aha.
  for (let i = 0; i < 10; i += 1) await poser(page, 'une unité', 'U');
  await settle(page, 500);

  const t = await body(page);
  check('ENT M1 mobile — la pile de dix se signale d\'elle-même',
    /pile de dix/.test(t), t.slice(0, 120));

  // L'ÉCHANGE EST UN GESTE : on attrape la pile de dix et on la porte à gauche.
  const pile = page.locator('button[aria-label^="Prendre la pile de dix"]').first();
  check('ENT M1 mobile — la pile de dix devient elle-même saisissable', await pile.count() > 0);

  const ov = await domOverflow(page);
  check('ENT M1 mobile — rien ne déborde de la colonne principale', ov.length === 0, JSON.stringify(ov.slice(0, 3)));
  await page.screenshot({ path: `${SHOT_DIR}ent-m1-mobile.png`, fullPage: true });
  await ctx.close();
}

/* ══════════════════════════════════════════════════════════════════
   NOMBRES ENTIERS — M2 : plus aucun stepper
   ══════════════════════════════════════════════════════════════════ */
{
  const { ctx, page } = await open(browser, `${ENT}/2`, {
    key: K_ENT, completedModules: ['0', '1'], tag: 'ent-m2',
  });
  await settle(page, 900);

  const plus = await page.locator('button[aria-label^="Ajouter une"], button:has-text("Échanger :"), button:has-text("Casser :")').count();
  check('ENT M2 — aucun stepper + / − ni bouton « Échanger » (anti-motif retiré)', plus === 0, `${plus} restants`);

  const before = await readNumber(page);
  await poser(page, 'une centaine', 'C');
  const after = await readNumber(page);
  check('ENT M2 — le nombre change parce que l\'objet a bougé', before !== after, `${before} → ${after}`);

  check('ENT M2 — pas de défilement horizontal', await noHScroll(page));
  await page.screenshot({ path: `${SHOT_DIR}ent-m2-desktop.png`, fullPage: true });
  await ctx.close();
}

/* ══════════════════════════════════════════════════════════════════
   NOMBRES DÉCIMAUX — M1 : la règle qu'on découpe
   ══════════════════════════════════════════════════════════════════ */
{
  const { ctx, page } = await open(browser, `${DEC}/entre-deux-nombres`, {
    key: K_DEC, completedModules: ['0'], tag: 'dec-m1',
  });
  await settle(page, 900);

  const t0 = await body(page);
  check('DEC M1 — le labo est à l\'écran dès la première seconde',
    /Couper chaque part en 10/.test(t0) && /La planche mesure/.test(t0));
  check('DEC M1 — sans coupe, la règle n\'offre que deux positions',
    /ne peut se poser que sur 3 ou sur 4|ne peut se poser que sur/.test(t0));

  // ── le geste : on attrape le repère et on le déplace au clavier ──
  const repere = page.locator('[role="slider"][aria-label*="Repère de mesure"]').first();
  const v0 = await repere.getAttribute('aria-valuenow');
  await repere.focus();
  await page.keyboard.press('ArrowRight');
  await settle(page, 250);
  const v1 = await repere.getAttribute('aria-valuenow');
  check('DEC M1 — déplacer le repère change la mesure, sans clic de validation',
    v0 !== v1, `${v0} → ${v1}`);

  // ── le coup de ciseaux ouvre l'espace : le pas se resserre ──
  await page.locator('button:has-text("Couper chaque part en 10")').first().click();
  await settle(page, 350);
  const t1 = await body(page);
  check('DEC M1 — une coupe divise l\'intervalle en 10 parts', /coupé en 10 parts/.test(t1));

  await repere.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await settle(page, 250);
  const v2 = await repere.getAttribute('aria-valuenow');
  check('DEC M1 — après la coupe, le repère atteint une position entre 3 et 4',
    Number(v2) > 3 && Number(v2) < 4, String(v2));

  await page.locator('button:has-text("Couper chaque part en 10")').first().click();
  await settle(page, 350);
  check('DEC M1 — une seconde coupe divise en 100 parts', /coupé en 100 parts/.test(await body(page)));

  // ── amener le repère sur 3,75 : la mesure exacte ──
  await repere.focus();
  await page.keyboard.press('Home');
  for (let i = 0; i < 75; i += 1) await page.keyboard.press('ArrowRight');
  await settle(page, 450);
  const v3 = await repere.getAttribute('aria-valuenow');
  check('DEC M1 — la longueur exacte 3,75 devient atteignable après deux coupes',
    Math.abs(Number(v3) - 3.75) < 1e-6, String(v3));

  // ── le labo NE SE FIGE PAS après validation ──
  await page.keyboard.press('ArrowRight');
  await settle(page, 250);
  const v4 = await repere.getAttribute('aria-valuenow');
  check('DEC M1 — le repère bouge encore APRÈS la validation de l\'étape (règle 2)',
    v4 !== v3, `${v3} → ${v4}`);

  // ── vocabulaire : « dixième » / « centième » appartiennent au module 2 ──
  const txt = await body(page);
  check('DEC M1 — les mots des modules suivants n\'apparaissent pas',
    !/dixième|centième|fraction décimale|valeur de position|écritures équivalentes/i.test(txt),
    (txt.match(/dixième|centième|fraction décimale|valeur de position|écritures équivalentes/i) || [])[0]);

  check('DEC M1 — pas de défilement horizontal (desktop)', await noHScroll(page));
  const la = await layoutAudit(page);
  check('DEC M1 — aucun texte SVG hors cadre ni en chevauchement', la.length === 0, JSON.stringify(la.slice(0, 3)));
  await page.screenshot({ path: `${SHOT_DIR}dec-m1-desktop.png`, fullPage: true });
  await ctx.close();
}

/* ── DEC M1 : la surprise 4,5 / 4,50 / 4,05, et le mobile ── */
{
  const { ctx, page } = await open(browser, `${DEC}/entre-deux-nombres`, {
    key: K_DEC, completedModules: ['0'], mobile: true, tag: 'dec-m1-mob',
  });
  await settle(page, 900);

  check('DEC M1 mobile 375px — pas de défilement horizontal', await noHScroll(page));
  const small = await smallTargets(page);
  check('DEC M1 mobile — zones tactiles ≥ 44 px', small.length === 0, JSON.stringify(small.slice(0, 4)));

  // Franchir l'étape 1 pour atteindre le laboratoire des écritures.
  const repere = page.locator('[role="slider"][aria-label*="Repère de mesure"]').first();
  await page.locator('button:has-text("Couper chaque part en 10")').first().click();
  await settle(page, 250);
  await page.locator('button:has-text("Couper chaque part en 10")').first().click();
  await settle(page, 250);
  await repere.focus();
  await page.keyboard.press('Home');
  for (let i = 0; i < 75; i += 1) await page.keyboard.press('ArrowRight');
  await settle(page, 800);

  const t = await body(page);
  check('DEC M1 mobile — l\'atelier des trois écritures s\'ouvre', /Trois étiquettes/.test(t));

  // 4,5 et 4,50 doivent tomber au MÊME point ; 4,05 non.
  const e45 = page.locator('[role="slider"][aria-label="Étiquette 4,5"]').first();
  const e450 = page.locator('[role="slider"][aria-label="Étiquette 4,50"]').first();
  const e405 = page.locator('[role="slider"][aria-label="Étiquette 4,05"]').first();
  if (await e45.count() && await e450.count() && await e405.count()) {
    for (const [el, steps] of [[e45, 50], [e450, 50], [e405, 5]]) {
      await el.focus();
      await page.keyboard.press('Home');
      for (let i = 0; i < steps; i += 1) await page.keyboard.press('ArrowRight');
      await settle(page, 120);
    }
    await settle(page, 600);
    const p45 = Number(await e45.getAttribute('aria-valuenow'));
    const p450 = Number(await e450.getAttribute('aria-valuenow'));
    const p405 = Number(await e405.getAttribute('aria-valuenow'));
    check('DEC M1 — 4,5 et 4,50 tombent exactement au MÊME point',
      Math.abs(p45 - p450) < 1e-6, `${p45} vs ${p450}`);
    check('DEC M1 — 4,05 tombe très loin des deux autres (la surprise contrôlée)',
      Math.abs(p45 - p405) > 0.3, `écart ${Math.abs(p45 - p405)}`);
    const tf = await body(page);
    check('DEC M1 — la coïncidence est dite à l\'écran, sans nommer la règle',
      /se sont posées au même endroit/.test(tf));
  } else {
    check('DEC M1 — les trois étiquettes sont glissables', false, 'étiquettes absentes');
  }

  const ov = await domOverflow(page);
  check('DEC M1 mobile — rien ne déborde de la colonne principale', ov.length === 0, JSON.stringify(ov.slice(0, 3)));
  await page.screenshot({ path: `${SHOT_DIR}dec-m1-mobile.png`, fullPage: true });
  await ctx.close();
}

/* ══════════════════════════════════════════════════════════════════
   LE BUG DE CLASSE : plus aucune manipulation ne se fige
   ══════════════════════════════════════════════════════════════════ */
{
  const { ctx, page } = await open(browser, `${DEC}/droite-graduee`, {
    key: K_DEC, completedModules: ['0', '1', '2', '3', '4', '5', '6', '7'], tag: 'dec-m8',
  });
  await settle(page, 900);
  // Le curseur (mode « place ») n'apparaît qu'après la LECTURE de la position :
  // un champ où l'on tape le nombre repéré, puis « OK ».
  const champ = page.locator('input[aria-label="Nombre repéré par le point"]').first();
  if (await champ.count()) {
    await champ.fill('0,3');
    await page.locator('main button:has-text("OK")').first().click();
    await settle(page, 800);
  }
  const line = page.locator('[role="slider"]').first();
  if (await line.count()) {
    await line.focus();
    const a = await line.getAttribute('aria-valuenow');
    await page.keyboard.press('ArrowRight');
    await settle(page, 250);
    const b1 = await line.getAttribute('aria-valuenow');
    const valider = page.locator('button:has-text("Valider ma position")').first();
    if (await valider.count()) { await valider.click(); await settle(page, 600); }
    await line.focus();
    await page.keyboard.press('ArrowRight');
    await settle(page, 250);
    const c = await line.getAttribute('aria-valuenow');
    check('DEC M8 — la droite graduée reste manipulable APRÈS validation (bug de classe corrigé)',
      c !== b1, `${a} → ${b1} → (valider) → ${c}`);
  } else {
    check('DEC M8 — la droite graduée est présente', false, 'slider absent');
  }
  await ctx.close();
}

check('aucune erreur console sur les modules refaits',
  errs.length === 0, errs.slice(0, 3).join(' | '));

await browser.close();
process.exit(summary() > 0 ? 1 : 0);
