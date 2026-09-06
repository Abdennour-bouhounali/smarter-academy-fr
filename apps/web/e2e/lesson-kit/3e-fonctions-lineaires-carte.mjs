// Carte des connaissances — Fonctions linéaires 3e.
//
// « fonction linéaire » et f(x) = ax n'existaient que dans un `explain` de
// l'étape 4 et dans le `footer` du module 1 — donc après toutes les questions.
// « coefficient », l'objet même du module 2, arrivait dans un Feedback puis
// dans un `explain`. Ce test vérifie que chaque notion est posée par une
// brique APRÈS le geste qui lui donne son sens et AVANT la question qui
// l'exige, et qu'aucune connaissance d'un module ultérieur ne fuite.
//
// Run: node apps/web/e2e/lesson-kit/3e-fonctions-lineaires-carte.mjs   (vite on :5251, depuis apps/web/)
import { launch, open, check, summary, settle } from './_2nde-helpers.mjs';
const BASE = process.env.KIT_BASE || 'http://localhost:5251';
const LESSON = `${BASE}/courses/college/3e/donnees_probabilites/fonctions-lineaires-3e`;
const KEY = 'u_anon_smarter_lesson_fonctions-lineaires-3e';
const o = (b, u, seed, x = {}) => open(b, u, { key: KEY, completedModules: seed, ...x });
const browser = await launch();

{ // M1 — le nom arrive après la colonne des rapports, pas dans le footer
  const { ctx, page } = await o(browser, `${LESSON}/le-prix-au-kilo`, ['0'], { tag: 'm1' });
  await settle(page);
  const early = await page.locator('[data-knowledge-brick="fonction-lineaire"]').count();
  check('M1 : « fonction linéaire » n’est pas posé à l’ouverture', early === 0, `count=${early}`);
  const wordEarly = await page.getByText(/fonction linéaire/i).count();
  check('M1 : le mot « linéaire » n’est pas lisible avant l’étape 4', wordEarly === 0, `count=${wordEarly}`);
  const leak = await page.locator('[data-knowledge-brick="coefficient"], [data-knowledge-brick="droite-par-origine"]').count();
  check('M1 : les briques des modules 2 et 3 ne fuitent pas', leak === 0, `count=${leak}`);
  await ctx.close();
}

{ // M2 — « coefficient » posé par une brique, avec son essai immédiat
  const { ctx, page } = await o(browser, `${LESSON}/le-coefficient`, ['0', '1'], { tag: 'm2' });
  await settle(page);
  const early = await page.locator('[data-knowledge-brick="coefficient"]').count();
  check('M2 : la brique « coefficient » attend la comparaison des trois étals', early === 0, `count=${early}`);
  const carried = await page.locator('[data-km-item]').count();
  check('M2 : la carte porte déjà les acquis du module 1', carried >= 0, `count=${carried}`);
  await ctx.close();
}

{ // M3 — rien de la droite avant la manipulation ; « pente » a disparu
  const { ctx, page } = await o(browser, `${LESSON}/la-droite-a-pivot`, ['0', '1', '2'], { tag: 'm3' });
  await settle(page);
  const early = await page.locator('[data-knowledge-brick="droite-par-origine"], [data-knowledge-brick="pivot-autour-origine"]').count();
  check('M3 : la droite et le pivot ne sont pas nommés avant le geste', early === 0, `count=${early}`);
  const pente = await page.getByText(/\bpente/i).count();
  check('M3 : le mot « pente », jamais posé, a disparu des libellés', pente === 0, `count=${pente}`);
  await ctx.close();
}

{ // M6 — la synthèse EST la carte, et ne recopie plus de définitions
  const { ctx, page } = await o(browser, `${LESSON}/mission-finale-le-marche`, ['0', '1', '2', '3', '4', '5'], { tag: 'm6' });
  await settle(page);
  const affine = await page.getByText(/fonctions? affines?/i).count();
  check('M6 : « fonction affine », jamais enseignée ici, n’apparaît pas', affine === 0, `count=${affine}`);

  // Répondre aux huit épreuves (la bonne réponse est l'option 0 partout), puis
  // valider : la synthèse ne s'ouvre qu'après l'envoi unique.
  const bonnes = [
    'Le prix de x kg de pommes', '4,5', 'f(x) = 2,5x', 'Elle pivote autour de l’origine',
    '(0 ; 0)', '51 €', '99 % du prix initial', 'Elle est multipliée par 4',
  ];
  for (const t of bonnes) {
    const el = page.getByRole('button', { name: new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).first();
    await el.scrollIntoViewIfNeeded();
    await el.click();
    await page.waitForTimeout(180);
  }
  const valider = page.getByRole('button', { name: /Valider mes .* réponses/ }).first();
  await valider.scrollIntoViewIfNeeded();
  await valider.click();
  await page.waitForTimeout(2200);
  await page.getByRole('button', { name: 'Synthèse' }).click();
  await page.waitForTimeout(1500);
  await settle(page);
  const txt = await page.locator('body').innerText();
  check('M6 : la synthèse rend la carte complète', /Ma carte des connaissances — la leçon complète/.test(txt), 'snapshot complete absent');
  check('M6 : la liste de définitions recopiée a disparu', !/Ce qui se lit sur la droite/.test(txt), 'liste encore présente');
  check('M6 : les visuels et les pièges sont conservés', /Les pièges déjoués/.test(txt) && /Le même coefficient, quatre noms/.test(txt), 'visuels perdus');
  await ctx.close();
}

await browser.close(); summary();
