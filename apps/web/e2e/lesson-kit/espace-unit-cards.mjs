// Espace élève — « دروسي » (/espace/cours) et « استكشاف » (/espace/explorer)
// montrent le niveau الوحدة comme /courses?…&chapter=… :
//   ميدان (puce) → carte d'UNITÉ (vers /courses/…/units/<unité>) → leçons.
// Et la barre latérale garde ses destinations d'origine (pas d'arbre).
//
// Run : KIT_BASE=http://localhost:5183 node apps/web/e2e/lesson-kit/espace-unit-cards.mjs
import { BASE, launch, check, summary, watchErrors } from './helpers.mjs';

const UNIT_PATH = '/courses/moyen/4am/ansab_al_aadad_wal_hisab/units/aadad-tabiiya-natiqa';
const errors = [];
const { browser } = await launch();

async function open(url) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { localStorage.setItem('token', 'fake'); });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await page.route('**/auth/me', (r) => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, user: { id: 7, name: 'تلميذ', email: 't@t.dz', role: 'student', grade: '4am', email_verified_at: '2026-09-01T00:00:00Z', nameComplete: true } }),
  }));
  await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1800);
  return { ctx, page };
}

const state = (page) => page.evaluate((unitPath) => ({
  unitCard: !!document.querySelector('[data-unit-group="aadad-tabiiya-natiqa"]'),
  unitHref: document.querySelector('[data-unit-group="aadad-tabiiya-natiqa"]')?.getAttribute('href') === unitPath,
  tree: !!document.querySelector('[data-curriculum-tree]'),
  sidebarLinks: [...document.querySelectorAll('aside nav a')].length,
}), UNIT_PATH);

for (const [label, url] of [['دروسي', '/espace/cours'], ['استكشاف', '/espace/explorer']]) {
  const { ctx, page } = await open(url);
  check(`${label} : la barre latérale d'origine (8 destinations, pas d'arbre)`, (await state(page)).sidebarLinks === 8 && !(await state(page)).tree, JSON.stringify(await state(page)));
  check(`${label} : « كل الميادين » montre la carte de l'unité`, (await state(page)).unitCard);


  // Cliquer le ميدان du manuel : la carte d'unité mène à la page d'unité.
  await page.getByRole('button', { name: /ميدان أنساب الأعداد والحساب/ }).click();
  await page.waitForTimeout(500);
  const s = await state(page);
  check(`${label} : le ميدان du manuel montre la carte d'unité vers sa page`, s.unitCard && s.unitHref, JSON.stringify(s));
  await page.locator('[data-unit-group="aadad-tabiiya-natiqa"]').click();
  await page.waitForURL(`**${UNIT_PATH}`);
  // La page d'unité est un morceau chargé à la demande : on l'attend.
  const opened = await page.waitForSelector('[data-unit="aadad-tabiiya-natiqa"]', { timeout: 8000 }).then(() => true).catch(() => false);
  check(`${label} : la carte ouvre la page d'unité`, opened);
  await ctx.close();
}

check('aucune erreur console/page', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
summary();
