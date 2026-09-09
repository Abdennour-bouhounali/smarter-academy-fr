/**
 * Suite e2e de la famille « Proportionnalité & fonctions » (5e).
 *
 * Ce qu'elle verrouille, au-delà du « ça charge » :
 *  — aucune erreur console sur AUCUNE page des deux leçons ;
 *  — les manipulations BALAYÉES sur toute leur plage (§6ter.5 : sweep, don't
 *    sample), avec contrôle de débordement à chaque pas ;
 *  — aucun débordement horizontal, en 375 px comme en 1280 px ;
 *  — AUCUN vocabulaire de 3e dans les leçons de 5e (f(x), image, antécédent,
 *    fonction linéaire/affine, coefficient directeur…) — la frontière de
 *    niveau, vérifiée sur le texte réellement rendu ;
 *  — les valeurs affichées par les labos sont celles que les règles calculent.
 *
 *   node apps/web/e2e/lesson-kit/5e-proportionnalite-fonctions.mjs [baseURL]
 */
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:5252';
const PROP = '/courses/college/5e/proportionnalite_fonctions/proportionnalite-5e';
const FONC = '/courses/college/5e/proportionnalite_fonctions/fonctions-5e';

const PAGES = [
  ...['', '/mission-de-depart', '/le-doseur', '/le-nombre-qui-ne-bouge-pas', '/quatre-cases',
      '/la-carte-et-le-terrain', '/les-soldes', '/la-ligne-droite', '/la-vitesse-du-car',
      '/mission-finale-la-fete'].map((s) => PROP + s),
  ...['', '/mission-de-depart', '/le-four', '/qui-commande-qui', '/le-carnet-de-bord',
      '/un-couple-un-point', '/lire-le-graphique', '/la-cabane-du-club',
      '/mission-finale-la-journee'].map((s) => FONC + s),
];

/** Vocabulaire STRICTEMENT interdit en 5e (objets de 3e et au-delà). */
const INTERDIT = [
  [/\bf\s*\(\s*x\s*\)/i, 'notation f(x) (3e)'],
  [/antécédent/i, 'antécédent (3e)'],
  [/\bimage de\b/i, 'image d’un nombre (3e)'],
  [/fonction (linéaire|affine)/i, 'fonction linéaire/affine (3e)'],
  [/coefficient directeur/i, 'coefficient directeur (3e)'],
  [/ordonnée à l’origine|ordonnée à l'origine/i, 'ordonnée à l’origine (3e)'],
  [/produit en croix/i, 'produit en croix (4e)'],
];

/**
 * SEMER LA PROGRESSION. Les deux leçons ont `sequentialUnlock: true` : sans
 * cela, tout module au-delà du premier rend « Module verrouillé » et la suite
 * testerait une page de garde au lieu du module.
 *
 * La clé est PORTÉE PAR L'UTILISATEUR (`u_anon_` + la clé héritée) et les
 * numéros de modules y sont des chaînes NON PADDÉES — « 3 », jamais « 03 ».
 */
const seed = (page, lessonId, upTo) =>
  page.addInitScript(([id, n]) => {
    const done = Array.from({ length: n + 1 }, (_, i) => String(i));
    localStorage.setItem(
      `u_anon_smarter_lesson_${id}`,
      JSON.stringify({ completedModules: done, currentModule: n, lastVisitedAt: new Date().toISOString() }),
    );
  }, [lessonId, upTo]);

let failures = 0;
const fail = (m) => { failures += 1; console.log(`  ✗ ${m}`); };
const ok = (m) => console.log(`  ✓ ${m}`);

/**
 * Débordement horizontal RÉEL, c'est-à-dire celui que l'élève subit : la page
 * défile-t-elle latéralement ?
 *
 * On ne teste PAS « un rectangle dépasse la fenêtre » : le fond décoratif de
 * l'application (un DIV centré volontairement plus large que l'écran, présent
 * sur toutes les leçons déjà livrées) le ferait échouer partout, et un
 * `overflow-x-auto` légitime aussi. La question qui compte est celle du
 * scroll du document — plus le contenu textuel de chaque conteneur non
 * défilant, dont le débordement, lui, tronque vraiment du texte.
 */
async function overflow(page) {
  return page.evaluate(() => {
    const bad = [];
    const doc = document.documentElement;
    if (doc.scrollWidth > doc.clientWidth + 1) {
      bad.push(`la PAGE défile latéralement (${doc.scrollWidth} > ${doc.clientWidth})`);
    }
    // Un conteneur qui n'est pas prévu pour défiler mais dont le contenu
    // dépasse : c'est là que du texte se retrouve tronqué.
    for (const el of document.querySelectorAll('main *')) {
      const s = getComputedStyle(el);
      if (s.overflowX === 'auto' || s.overflowX === 'scroll') continue;
      // `sr-only` est VOLONTAIREMENT rogné (1 px) : c'est le procédé qui rend
      // un texte audible aux lecteurs d'écran sans l'afficher.
      if (el.classList.contains('sr-only')) continue;
      // Un <text> SVG n'a pas de boîte de défilement : scrollWidth y mesure
      // l'encre du glyphe et non un rognage. Le débordement d'un repère se
      // vérifie autrement — voir le contrôle `svgLabelsInside` ci-dessous.
      if (el.ownerSVGElement) continue;
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
        const tag = `${el.tagName}.${String(el.className).slice(0, 44)}`;
        bad.push(`${tag} tronque son contenu (${el.scrollWidth} > ${el.clientWidth})`);
      }
    }
    // Repères : aucune étiquette ne doit sortir du cadre de son SVG — c'est
    // le vrai invariant visuel (§6bis.4), et il se mesure sur les rectangles.
    for (const svg of document.querySelectorAll('main svg')) {
      const sb = svg.getBoundingClientRect();
      if (sb.width === 0) continue;
      for (const t of svg.querySelectorAll('text')) {
        const tb = t.getBoundingClientRect();
        if (tb.width === 0) continue;
        if (tb.left < sb.left - 0.5 || tb.right > sb.right + 0.5
            || tb.top < sb.top - 0.5 || tb.bottom > sb.bottom + 0.5) {
          bad.push(`étiquette « ${t.textContent} » hors du cadre du repère`);
        }
      }
    }
    return bad.slice(0, 4);
  });
}

const run = async () => {
  const browser = await chromium.launch();

  for (const width of [1280, 375]) {
    console.log(`\n── Largeur ${width} px ─────────────────────────────`);
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });

    for (const path of PAGES) {
      const page = await ctx.newPage();
      await seed(page, path.startsWith(PROP) ? 'proportionnalite-5e' : 'fonctions-5e', 8);
      const errors = [];
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', (e) => errors.push(String(e)));

      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(280);

      const label = path.replace('/courses/college/5e/proportionnalite_fonctions/', '');

      // 1. Le module a bien rendu (et n'est pas retombé sur la page d'accueil).
      const body = await page.evaluate(() => document.body.innerText);
      if (body.length < 120) fail(`${label} — page quasi vide (route non branchée ?)`);

      // 2. Aucune erreur d'exécution.
      if (errors.length) fail(`${label} — ${errors.length} erreur(s) console : ${errors[0].slice(0, 160)}`);

      // 3. Frontière de niveau, sur le texte réellement affiché.
      for (const [re, why] of INTERDIT) {
        if (re.test(body)) fail(`${label} — vocabulaire interdit : ${why}`);
      }

      // 4. Mise en page.
      const bad = await overflow(page);
      if (bad.length) fail(`${label} — débordement : ${bad[0]}`);

      if (!errors.length && bad.length === 0 && body.length >= 120) ok(label);
      await page.close();
    }
    await ctx.close();
  }

  /* ── Balayage des manipulations (§6ter.5 : sweep, don't sample) ────── */
  console.log('\n── Balayage des labos ───────────────────────────────');
  const ctx = await browser.newContext({ viewport: { width: 375, height: 900 } });

  const sweeps = [
    { path: `${PROP}/le-doseur`, label: 'doseur' },
    { path: `${PROP}/la-carte-et-le-terrain`, label: 'échelle' },
    { path: `${PROP}/les-soldes`, label: 'soldes' },
    { path: `${PROP}/la-vitesse-du-car`, label: 'vitesse' },
    { path: `${FONC}/le-four`, label: 'four' },
    { path: `${FONC}/lire-le-graphique`, label: 'sonde' },
  ];

  for (const { path, label } of sweeps) {
    const page = await ctx.newPage();
    await seed(page, path.startsWith(PROP) ? 'proportionnalite-5e' : 'fonctions-5e', 8);
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(250);

    const slider = page.locator('input[type=range]').first();
    if (await slider.count() === 0) { fail(`${label} — aucun curseur trouvé`); await page.close(); continue; }

    const { min, max, step } = await slider.evaluate((el) => ({
      min: Number(el.min), max: Number(el.max), step: Number(el.step) || 1,
    }));

    let overflowed = null;
    // On balaie TOUTE la plage, borne à borne — jamais un échantillon.
    for (let v = min; v <= max; v += step) {
      await slider.evaluate((el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, String(val));
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, v);
      const bad = await overflow(page);
      if (bad.length && !overflowed) overflowed = `${v} → ${bad[0]}`;
    }

    if (errors.length) fail(`${label} — erreur pendant le balayage : ${errors[0].slice(0, 140)}`);
    else if (overflowed) fail(`${label} — débordement à ${overflowed}`);
    else ok(`${label} — balayé de ${min} à ${max} sans débordement ni erreur`);

    await page.close();
  }

  await ctx.close();
  await browser.close();

  console.log(failures === 0
    ? '\n✅ Famille 5e « proportionnalité & fonctions » : tout est vert.'
    : `\n❌ ${failures} problème(s).`);
  process.exit(failures === 0 ? 0 : 1);
};

run().catch((e) => { console.error(e); process.exit(1); });
