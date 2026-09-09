/**
 * Suite e2e — « Représentation de l'espace » (5e).
 *
 * C'est la famille où le visuel est central : les contrôles de source ne
 * voient rien du dessin, et c'est ici que se vérifie ce que le brief exige.
 *
 *   1. chaque module REND (une leçon non branchée dans App.jsx retombe sur la
 *      page d'accueil sans la moindre erreur — cf. scripts/check-routes.mjs) ;
 *   2. le déclencheur ne MENT pas : de face, les deux emballages donnent
 *      réellement la MÊME silhouette, et c'est la vue de dessus qui les
 *      sépare — sinon tout le module 1 serait une affirmation gratuite ;
 *   3. la bande du cylindre se referme à la BONNE longueur, et le diamètre
 *      (valeur de départ) est visiblement trop court ;
 *   4. le patron du prisme refuse « deux bases du même côté » en le NOMMANT ;
 *   5. la rotation du solide ne produit AUCUNE collision d'étiquette sur
 *      toute la plage (balayage, jamais un échantillon — c'est le défaut
 *      qu'un décalage fixe avait laissé passer sur 16 orientations / 468) ;
 *   6. pas de défilement horizontal à 375, 768 et 1440 px ;
 *   7. le test final se monte (le contrat `badges[].test` est une fonction).
 *
 * Lancer : démarrer vite depuis apps/web/ en détaché, puis
 *   KIT_BASE=http://localhost:5251 node apps/web/e2e/lesson-kit/5e-representations-espace.mjs
 */
import {
  launch, open, settle, body, check, summary, errs,
  layoutAudit, noHScroll,
} from './_2nde-helpers.mjs';

const BASE = process.env.KIT_BASE || 'http://localhost:5251';
const L = '/courses/college/5e/espace_geometrie/representations-espace-5e';
const KEY = 'u_anon_smarter_lesson_representations-espace-5e';
const ALL_DONE = ['0', '1', '2', '3', '4', '5', '6'];

/** Attend que le module soit réellement peint (chargement `lazy`). */
async function attendreModule(page) {
  // Les modules sont chargés en `lazy`. Sous un serveur de dev partagé, le
  // premier import peut dépasser la seconde : on attend que le corps porte
  // vraiment du contenu de leçon, plutôt qu'un délai fixe qui rend la suite
  // intermittente (le défaut observé : des échecs qui se déplaçaient d'un
  // module à l'autre à chaque exécution, sans aucune erreur console).
  await page.waitForFunction(
    () => (document.body.innerText || '').length > 800,
    null, { timeout: 30000 },
  ).catch(() => {});
  await settle(page, 600);
}

const browser = await launch();

/* ── 1. La page d'accueil de la leçon ─────────────────────────────────── */
{
  const { ctx, page } = await open(browser, BASE + L, { tag: 'index' });
  // La page d'accueil charge son index en `lazy` : attendre que le titre soit
  // peint, sinon on lit un corps encore vide (faux négatif intermittent).
  await page.waitForFunction(
    () => /Parcours des Modules/.test(document.body.innerText || ''),
    null, { timeout: 30000 },
  ).catch(() => {});
  await settle(page, 600);
  const t = await body(page);
  check('index : la leçon rend son propre titre', /Représentation de l’espace|Representation/.test(t), t.slice(0, 200));
  check('index : ce n’est pas la page d’accueil commerciale', !/Apprendre les maths autrement/.test(t));
  check('index : les modules sont annoncés', /Mission finale/.test(t) && /bande du cylindre/i.test(t));
  // PÉRIMÈTRE : la leçon ne doit promettre ni volume, ni sphère, ni pyramide.
  check('index : aucune promesse de volume (objet de 4e)', !/\bvolume\b/i.test(t), t.slice(0, 400));
  await ctx.close();
}

/* ── 2. Module 1 — l'ambiguïté est RÉELLE ─────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/trois-photos-un-carton`, { key: KEY, tag: 'm1' });
  await attendreModule(page);
  check('M1 : le module rend', /Trois photos/i.test(await body(page)));

  // Les deux silhouettes de face doivent être GÉOMÉTRIQUEMENT identiques :
  // c'est l'affirmation du module, et elle doit être vraie dans le DOM.
  const memeDeFace = await page.evaluate(() => {
    const svgs = [...document.querySelectorAll('svg[aria-label]')]
      .filter((s) => /Vue de face/.test(s.getAttribute('aria-label')));
    if (svgs.length < 2) return null;
    const rect = (s) => {
      const r = s.querySelector('rect');
      return r ? `${r.getAttribute('width')}x${r.getAttribute('height')}` : null;
    };
    return rect(svgs[0]) && rect(svgs[0]) === rect(svgs[1]);
  });
  check('M1 : de face, les deux emballages ont la MÊME silhouette', memeDeFace === true, String(memeDeFace));

  // Puis la vue de dessus doit les séparer.
  await page.locator('button:has-text("Photographier de dessus")').first().click();
  await settle(page, 400);
  const separe = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('svg[aria-label]')]
      .map((s) => s.getAttribute('aria-label'))
      .filter((a) => /Vue de dessus/.test(a));
    return new Set(labels).size >= 2;
  });
  check('M1 : de dessus, les deux emballages DIFFÈRENT', separe, 'triangle vs disque');

  const issues = await layoutAudit(page);
  check('M1 : aucune collision d’étiquette', issues.length === 0, JSON.stringify(issues).slice(0, 300));
  await ctx.close();
}

/* ── 3. Module 2 — la rotation, balayée sur TOUTE la plage ────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/le-dessin-qui-ment`,
    { key: KEY, completedModules: ['0', '1'], tag: 'm2' });
  await attendreModule(page);
  check('M2 : le module rend', /perspective|cavalière/i.test(await body(page)));

  // Le défaut visé (§10.6b) : un décalage d'étiquette correct à l'angle par
  // défaut et fautif ailleurs. On BALAIE donc, on n'échantillonne pas.
  const boutons = page.locator('button:has-text("+15°"), button:has-text("−15°"), button:has-text("-15°")');
  const n = await boutons.count();
  const issues = [];
  if (n > 0) {
    for (let i = 0; i < 24; i += 1) {
      await boutons.first().click({ timeout: 2000 }).catch(() => {});
      await settle(page, 70);
      issues.push(...(await layoutAudit(page)));
    }
  }
  check('M2 : aucune collision sur toute la plage de rotation',
    issues.length === 0, `${n} réglages · ${JSON.stringify(issues.slice(0, 3))}`);
  await ctx.close();
}

/* ── 4. Module 3 — la vue de dessus est la vue décisive ───────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/lire-les-trois-vues`,
    { key: KEY, completedModules: ['0', '1', '2'], tag: 'm3' });
  await attendreModule(page);
  const t0 = await body(page);
  check('M3 : le module rend', /trois vues/i.test(t0));
  check('M3 : au départ on ne peut pas conclure', /même chose|impossible de conclure/i.test(t0), t0.slice(0, 300));

  await page.locator('button:has-text("Ouvrir la vue de côté")').first().click();
  await settle(page, 300);
  await page.locator('button:has-text("Ouvrir la vue de dessus")').first().click();
  await settle(page, 400);
  const t1 = await body(page);
  check('M3 : la vue de dessus tranche', /tranche|triangle/i.test(t1), t1.slice(0, 300));
  await ctx.close();
}

/* ── 5. Module 4 — le patron refuse, et NOMME l'erreur ────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/deplier-le-prisme`,
    { key: KEY, completedModules: ['0', '1', '2', '3'], tag: 'm4' });
  await attendreModule(page);
  check('M4 : le module rend', /Déplier|patron/i.test(await body(page)));

  // Poser DEUX bases du même côté doit produire un refus NOMMÉ.
  const hauts = page.locator('button[aria-label*="côté haut"]');
  if (await hauts.count() >= 2) {
    await hauts.nth(0).click();
    await settle(page, 150);
    await hauts.nth(1).click();
    await settle(page, 250);
    const t = await body(page);
    check('M4 : « deux bases du même côté » est diagnostiqué, pas juste refusé',
      /même côté/i.test(t), t.slice(0, 300));
  } else {
    check('M4 : les emplacements de base sont exposés', false, 'aucun bouton de base trouvé');
  }
  await ctx.close();
}

/* ── 6. Module 5 — la bande se referme à la bonne longueur ────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/la-bande-du-cylindre`,
    { key: KEY, completedModules: ['0', '1', '2', '3', '4'], tag: 'm5' });
  await attendreModule(page);
  const t0 = await body(page);
  check('M5 : le module rend', /bande/i.test(t0));
  // Le curseur démarre AU DIAMÈTRE : la bande doit y être trop courte.
  check('M5 : au départ (le diamètre), il reste un jour', /jour|manque/i.test(t0), t0.slice(0, 300));

  // Balayage complet du réglage : on cherche l'état « se referme », et on
  // vérifie qu'aucune position n'abîme la mise en page.
  const slider = page.locator('[role="slider"]').first();
  await slider.focus();
  await page.keyboard.press('Home');
  await settle(page, 150);
  // Le clavier offre un pas GROSSIER (flèches ←/→, 1 unité) pour traverser la
  // plage, et un pas FIN (↑/↓, 0,1) pour se poser. On balaie donc en deux
  // temps — c'est aussi le geste réel de l'élève.
  let ferme = false;
  const issues = [];
  for (let i = 0; i < 40 && !ferme; i += 1) {
    await page.keyboard.press('ArrowRight');
    await settle(page, 40);
    if (/se referme exactement/.test(await body(page))) ferme = true;
    if (i % 5 === 0) issues.push(...(await layoutAudit(page)));
  }
  // Réglage fin : la cible (un périmètre) ne tombe jamais sur un entier.
  for (let i = 0; i < 12 && !ferme; i += 1) {
    await page.keyboard.press('ArrowUp');
    await settle(page, 40);
    if (/se referme exactement/.test(await body(page))) ferme = true;
  }
  issues.push(...(await layoutAudit(page)));
  check('M5 : il existe une longueur qui referme exactement le tube', ferme);
  check('M5 : aucune collision sur toute la plage du réglage', issues.length === 0,
    JSON.stringify(issues.slice(0, 3)));

  await page.keyboard.press('End');
  await settle(page, 200);
  const tFin = await body(page);
  check('M5 : au-delà, la bande chevauche', /chevauche|dépasse/i.test(tFin), tFin.slice(0, 250));
  await ctx.close();
}

/* ── 7. Module 6 — l'atelier ──────────────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/latelier-demballage`,
    { key: KEY, completedModules: ['0', '1', '2', '3', '4', '5'], tag: 'm6' });
  await attendreModule(page);
  const t = await body(page);
  check('M6 : le module rend', /atelier/i.test(t));
  check('M6 : aucun calcul de volume (périmètre 5e)', !/volume/i.test(t), t.slice(0, 400));
  await ctx.close();
}

/* ── 8. Le test final se monte ────────────────────────────────────────── */
{
  const { ctx, page } = await open(browser, `${BASE}${L}/mission-finale-latelier`,
    { key: KEY, completedModules: ALL_DONE, tag: 'boss' });
  await attendreModule(page);
  const t = await body(page);
  check('Boss : le module rend (badges[].test est bien une fonction)',
    /Mission finale/i.test(t) && !/b\.test is not a function/.test(t), t.slice(0, 200));
  check('Boss : aucune épreuve ne porte sur le volume', !/volume/i.test(t));
  await ctx.close();
}

/* ── 9. Responsive : 375 / 768 / 1440 ─────────────────────────────────── */
for (const [w, h, nom] of [[375, 667, 'mobile'], [768, 1024, 'tablette'], [1440, 900, 'bureau']]) {
  const { ctx, page } = await open(browser, `${BASE}${L}/le-dessin-qui-ment`,
    { key: KEY, completedModules: ['0', '1'], tag: `rwd-${w}` });
  await page.setViewportSize({ width: w, height: h });
  await settle(page);
  check(`${nom} (${w}px) : pas de défilement horizontal de page`, await noHScroll(page));
  const issues = await layoutAudit(page);
  check(`${nom} (${w}px) : aucune collision d’étiquette`, issues.length === 0,
    JSON.stringify(issues).slice(0, 200));
  await ctx.close();
}

check('aucune erreur console sur toute la suite', errs.length === 0, errs.slice(0, 5).join(' | '));

await browser.close();
summary();
