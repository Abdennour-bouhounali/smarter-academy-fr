/**
 * L'AUDIT VISUEL DU PANNEAU D'ADMINISTRATION — arabe, RTL, responsive.
 *
 * Il vérifie ce qu'un test de source ne peut pas voir : la page RENDUE.
 * `adminContract.test.js` tient la langue, les jetons et les propriétés
 * logiques sur le code ; celui-ci ouvre le navigateur et mesure.
 *
 * Il n'a PAS besoin de l'API : il s'arrête sur la porte du panneau (l'écran
 * de connexion, qui partage la même coquille et la même identité) et sur les
 * surfaces publiques, puis compare la fenêtre du panneau à celle de l'espace
 * élève. Avec un compte, il va plus loin — voir QA_ADMIN_EMAIL plus bas.
 *
 *   (cd apps/web && npx vite preview --port 4173)
 *   node apps/web/e2e/admin-design-audit.mjs
 *
 *   # avec l'API et un compte d'administration, l'audit complet :
 *   QA_ADMIN_EMAIL=qa-admin@smarter.dz QA_PASSWORD=… \
 *     node apps/web/e2e/admin-design-audit.mjs
 *
 * Les largeurs sont celles du contrat (§19) : 1920 → 360.
 */
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE || 'http://localhost:4173';
const ADMIN_EMAIL = process.env.QA_ADMIN_EMAIL || '';
const PASSWORD = process.env.QA_PASSWORD || '';

const VIEWPORTS = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-360', width: 360, height: 740 },
];

const results = [];
const record = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'ar-DZ' });
const page = await context.newPage();

const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

/** Le document est-il RTL, en arabe, et en Cairo pour ses glyphes arabes ? */
const readShell = () => page.evaluate(() => {
  const html = document.documentElement;
  const body = getComputedStyle(document.body);
  return {
    dir: html.getAttribute('dir'),
    lang: html.getAttribute('lang'),
    bodyFont: body.fontFamily,
    bodyBg: body.backgroundColor,
  };
});

/** Rien ne doit déborder horizontalement, à aucune largeur. */
const overflow = () => page.evaluate(() => {
  const d = document.documentElement;
  const over = [...document.querySelectorAll('*')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      // Un élément volontairement défilant (un tableau large) n'est pas un
      // débordement DE PAGE : c'est son conteneur qui défile.
      const scrollable = ['auto', 'scroll'].includes(getComputedStyle(el).overflowX);
      return !scrollable && r.width > 0 && (r.right > d.clientWidth + 1 || r.left < -1);
    })
    .slice(0, 5)
    .map((el) => `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`);
  return { pageOverflow: d.scrollWidth > d.clientWidth + 1, culprits: over };
});

try {
  // ══ 1. La coquille : direction, langue, police, fond ═══════════════════
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });

  const shell = await readShell();
  record('document RTL', shell.dir === 'rtl', `dir="${shell.dir}"`);
  record('document en arabe', shell.lang === 'ar', `lang="${shell.lang}"`);
  record('Cairo dans la pile de polices', /Cairo/.test(shell.bodyFont), shell.bodyFont.slice(0, 60));

  // ══ 2. Le fond du produit est le MÊME partout ═════════════════════════
  // `#FAFAFA` : la coquille élève, la coquille enseignant et le panneau. Il
  // était `slate-50` côté panneau — une nuance voisine, donc une nuance autre.
  const loginBg = shell.bodyBg;
  record('fond du produit sur la porte', /250,\s*250,\s*250/.test(loginBg) || loginBg === 'rgba(0, 0, 0, 0)', loginBg);

  // ══ 3. Les huit largeurs, sans débordement ════════════════════════════
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(150);
    const { pageOverflow, culprits } = await overflow();
    record(`${vp.name} — aucun débordement horizontal`, !pageOverflow, culprits.join(', '));
  }

  // ══ 4. Le panneau lui-même, si un compte est fourni ═══════════════════
  if (ADMIN_EMAIL && PASSWORD) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    // Le panneau est chargé en `lazy` : l'URL change AVANT que le morceau
    // n'arrive. On attend la coquille elle-même, sinon on mesure le vide.
    await page.waitForSelector('aside nav a', { timeout: 15000 });
    await page.waitForSelector('.sa-page', { timeout: 15000 });
    record('connexion administrateur', true, page.url());

    // La barre latérale est CLAIRE — plus de livrée `slate-900`.
    const sidebarBg = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      return aside ? getComputedStyle(aside).backgroundColor : null;
    });
    record('barre latérale claire (plus de thème sombre)',
      sidebarBg === 'rgb(255, 255, 255)', sidebarBg);

    // Elle est ancrée sur le bord de DÉBUT, donc à DROITE en RTL.
    const anchored = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      if (!aside) return null;
      const r = aside.getBoundingClientRect();
      return { right: Math.round(r.right), vw: document.documentElement.clientWidth };
    });
    record('barre latérale ancrée à droite (RTL)',
      anchored && Math.abs(anchored.right - anchored.vw) <= 2,
      anchored ? `right=${anchored.right} vw=${anchored.vw}` : 'absente');

    // Aucun libellé de navigation en écriture latine.
    const navLabels = await page.evaluate(() =>
      [...document.querySelectorAll('aside nav a')].map((a) => a.textContent.trim()).filter(Boolean));
    const latin = navLabels.filter((l) => /[A-Za-zÀ-ÿ]/.test(l) && !/[؀-ۿ]/.test(l));
    record('navigation entièrement arabe', latin.length === 0,
      latin.length ? latin.join(' | ') : `${navLabels.length} entrées`);

    // Le panneau et l'espace élève partagent la gouttière `.sa-page`.
    const gutter = await page.evaluate(() => {
      const el = document.querySelector('.sa-page');
      return el ? getComputedStyle(el).paddingInlineStart : null;
    });
    record('gouttière partagée .sa-page', gutter === '60px', `padding-inline-start=${gutter}`);

    // Chaque largeur, à l'intérieur du panneau cette fois. Sous `lg` la barre
    // latérale cède la place au tiroir : on vérifie aussi que la barre haute
    // la remplace, sinon la navigation disparaîtrait sur mobile.
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(250);
      const { pageOverflow, culprits } = await overflow();
      record(`panneau ${vp.name} — aucun débordement`, !pageOverflow, culprits.join(', '));

      const nav = await page.evaluate(() => {
        const visible = (el) => !!el && el.getBoundingClientRect().width > 0;
        return {
          sidebar: visible(document.querySelector('aside')),
          mobileBar: visible(document.querySelector('header')),
        };
      });
      record(`panneau ${vp.name} — une navigation visible`,
        nav.sidebar || nav.mobileBar,
        `barre=${nav.sidebar} tiroir=${nav.mobileBar}`);
    }

    // On revient au bureau pour les mesures qui supposent la barre latérale.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(250);
  } else {
    console.log('\nℹ️  QA_ADMIN_EMAIL/QA_PASSWORD absents : audit limité aux surfaces publiques.');
    console.log('   Le panneau lui-même se vérifie avec un compte et l\'API démarrée.');
  }

  record('aucune erreur JavaScript', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '));
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} vérifications passées.`);
if (failed.length) {
  console.log('Échecs :');
  for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
  process.exit(1);
}
