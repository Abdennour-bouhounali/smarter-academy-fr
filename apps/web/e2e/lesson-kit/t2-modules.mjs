// T2 — desktop: modules 2–6 full fresh flows (formative behavior included).
import { LESSON, launch, newCtx, watchErrors, check, summary, getProgress, seed, SHOT_DIR } from './helpers.mjs';
const errors = [];
const { browser } = await launch();
async function freshPage(completed) { const ctx = await newCtx(browser); const page = await ctx.newPage(); watchErrors(page, errors); await seed(page, completed); return { ctx, page }; }
const S = (page, n) => page.locator(`#step-${n}`);
{
  const { ctx, page } = await freshPage(['1']);
  await page.goto(`${LESSON}/2`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Construire les nombres');
  check('m2: steps 2-3 locked', (await page.getByText("termine l'étape précédente").count()) === 2);
  for (let i = 0; i < 3; i++) await S(page, 1).getByRole('button', { name: 'Ajouter une centaine' }).click();
  for (let i = 0; i < 4; i++) await S(page, 1).getByRole('button', { name: 'Ajouter une dizaine' }).click();
  for (let i = 0; i < 7; i++) await S(page, 1).getByRole('button', { name: 'Ajouter une unité' }).click();
  await page.waitForTimeout(400);
  check('m2 s1: solved + reveal', await S(page, 1).getByText('Parfait :').isVisible().catch(() => false));
  await S(page, 2).getByRole('button', { name: 'Ajouter une millier' }).click();
  for (let i = 0; i < 2; i++) await S(page, 2).getByRole('button', { name: 'Ajouter une centaine' }).click();
  for (let i = 0; i < 5; i++) await S(page, 2).getByRole('button', { name: 'Ajouter une unité' }).click();
  await page.waitForTimeout(400);
  check('m2 s2: solved (zero dizaine note)', await S(page, 2).getByText('aucune barre').first().isVisible().catch(() => false));
  await S(page, 3).getByRole('button', { name: 'Ajouter une dizaine' }).first().click();
  for (let i = 0; i < 3; i++) await S(page, 3).getByRole('button', { name: 'Ajouter une unité' }).first().click();
  await page.waitForTimeout(300);
  check('m2 s3a: canonical hint at 4D 10U', await S(page, 3).getByText('le moins de blocs possible').isVisible().catch(() => false));
  await S(page, 3).getByRole('button', { name: /Échanger : 10 unités = 1 dizaine/ }).click();
  await page.waitForTimeout(400);
  check('m2 s3a: solved 5 dizaines', await S(page, 3).getByText('rangé au plus court').isVisible().catch(() => false));
  for (let i = 0; i < 5; i++) { await S(page, 3).getByRole('button', { name: /Casser : 1 dizaine = 10 unités/ }).last().click(); await page.waitForTimeout(120); }
  await page.waitForTimeout(400);
  check('m2 s3b: 50 = 50 unités', await S(page, 3).getByText('Deux représentations, un seul nombre').isVisible().catch(() => false));
  check('m2: next enabled', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
  await page.waitForTimeout(300);
  const p = await getProgress(page);
  check('m2: completedModules has 2', !!p?.completedModules?.includes('2'), JSON.stringify(p?.completedModules));
  await page.screenshot({ path: SHOT_DIR + 'v2-m2-done.png', fullPage: true });
  await ctx.close();
}
{
  const { ctx, page } = await freshPage(['1', '2']);
  await page.goto(`${LESSON}/3`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Lire et écrire les nombres');
  const inc = async (label, times) => { for (let i = 0; i < times; i++) await S(page, 1).getByRole('button', { name: `Augmenter le chiffre des ${label}` }).first().click(); };
  await inc('milliers', 2); await inc('centaines', 4); await inc('dizaines', 3); await inc('unités', 6);
  await S(page, 1).getByRole('button', { name: 'Vérifier', exact: true }).first().click();
  await page.waitForTimeout(300);
  check('m3 s1a: ok feedback', await S(page, 1).getByText('chaque groupe de mots correspond').isVisible().catch(() => false));
  await S(page, 1).getByRole('button', { name: 'Vérifier', exact: true }).first().click();
  await page.waitForTimeout(300);
  check('m3 s1b: wrong shows bonne réponse', await S(page, 1).getByText('La bonne réponse était').isVisible().catch(() => false));
  check('m3 s1b: wrong still completes step', (await page.getByText("termine l'étape précédente").count()) === 1);
  await S(page, 2).getByRole('button', { name: 'sept mille deux cent cinq', exact: true }).click();
  await S(page, 2).getByRole('button', { name: 'quatre mille cinq', exact: true }).click();
  await page.waitForTimeout(300);
  check('m3 s2: done, s3 unlocked', (await page.getByText("termine l'étape précédente").count()) === 0);
  for (const a of ['trois mille quatre cent quatre-vingt-deux', 'vingt-sept mille trois cent cinq', 'quatre cent cinq mille dix-sept', 'deux millions trois cent cinquante mille sept cents']) {
    await S(page, 3).getByRole('button', { name: 'Grouper par 3 en partant de la droite' }).first().click();
    await page.waitForTimeout(300);
    await S(page, 3).getByRole('button', { name: a, exact: true }).click();
    await page.waitForTimeout(200);
  }
  await S(page, 3).getByRole('button', { name: /^2[\s  ]350[\s  ]700$/ }).click();
  await page.waitForTimeout(400);
  check('m3: all done, next enabled', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
  const p = await getProgress(page);
  check('m3: completedModules has 3', !!p?.completedModules?.includes('3'));
  await ctx.close();
}
{
  const { ctx, page } = await freshPage(['1', '2', '3']);
  await page.goto(`${LESSON}/4`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=La valeur de chaque chiffre');
  await S(page, 1).getByRole('button', { name: 'Chiffre 4, position Millions' }).last().click();
  await page.waitForTimeout(200);
  check('m4 h1: wrong digit hint', await S(page, 1).getByText("Ce n'est pas le bon chiffre").isVisible().catch(() => false));
  await S(page, 1).getByRole('button', { name: 'Chiffre 8, position Dizaines de milliers' }).last().click();
  await S(page, 1).getByRole('button', { name: /^80.000$/ }).last().click(); await page.waitForTimeout(300);
  await S(page, 1).getByRole('button', { name: 'Chiffre 3, position Centaines' }).last().click();
  await S(page, 1).getByRole('button', { name: '300', exact: true }).last().click(); await page.waitForTimeout(300);
  await S(page, 1).getByRole('button', { name: 'Chiffre 5, position Centaines de milliers' }).last().click();
  await S(page, 1).getByRole('button', { name: /^500.000$/ }).last().click(); await page.waitForTimeout(300);
  check('m4 s1: done, s2 unlocked', (await page.getByText("termine l'étape précédente").count()) === 1);
  for (const a of [/^5.000$/, '500', '50', '5']) {
    const loc = typeof a === 'string' ? S(page, 2).getByRole('button', { name: a, exact: true }) : S(page, 2).getByRole('button', { name: a });
    await loc.click(); await page.waitForTimeout(1600);
  }
  check('m4 s2: recap 5000+500+50+5', await S(page, 2).getByText(/5.000 \+ 500 \+ 50 \+ 5/).isVisible().catch(() => false));
  check('m4 s2: à retenir', await S(page, 2).getByText("Le chiffre n'est pas la valeur.").isVisible().catch(() => false));
  await S(page, 3).getByRole('button', { name: '2', exact: true }).first().click(); await page.waitForTimeout(200);
  await S(page, 3).getByRole('button', { name: '12', exact: true }).last().click(); await page.waitForTimeout(300);
  check('m4 s3: info nuance', await S(page, 3).getByText('Retiens la nuance').isVisible().catch(() => false));
  check('m4: next enabled', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
  const p = await getProgress(page);
  check('m4: completedModules has 4', !!p?.completedModules?.includes('4'));
  await ctx.close();
}
{
  const { ctx, page } = await freshPage(['1', '2', '3', '4']);
  await page.goto(`${LESSON}/5`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Décomposer et recomposer');
  await S(page, 1).getByRole('button', { name: /^4.000$/ }).click();
  await S(page, 1).getByRole('button', { name: '400', exact: true }).click();
  await S(page, 1).getByRole('button', { name: 'Vérifier', exact: true }).click();
  await page.waitForTimeout(400);
  check('m5 s1: wrong sum ko persists', await S(page, 1).getByText('Ta somme vaut').isVisible().catch(() => false));
  check('m5 s1: correct decomposition revealed', await S(page, 1).getByText(/4.582 = 4.000 \+ 500 \+ 80 \+ 2/).first().isVisible().catch(() => false));
  const eq = S(page, 2).getByRole('button', { name: /^= 4.582$/ });
  const neq = S(page, 2).getByRole('button', { name: /^≠ 4.582$/ });
  await eq.nth(0).click(); await eq.nth(1).click(); await eq.nth(2).click(); await eq.nth(3).click(); await neq.nth(4).click(); await eq.nth(5).click();
  await page.waitForTimeout(400);
  check('m5 s2: row correction shown', await S(page, 2).getByText(/4.000 \+ 50 \+ 80 \+ 2 = 4.132/).isVisible().catch(() => false));
  check('m5 s2: ko + ok feedback', await S(page, 2).getByText('Certaines réponses étaient à revoir').isVisible().catch(() => false));
  const input = () => S(page, 3).getByRole('textbox').first();
  await input().fill('3427'); await S(page, 3).getByRole('button', { name: 'OK' }).first().click(); await page.waitForTimeout(200);
  await input().fill('586'); await S(page, 3).getByRole('button', { name: 'OK' }).first().click(); await page.waitForTimeout(200);
  check('m5 s3: trap feedback', await S(page, 3).getByText('une position a disparu').isVisible().catch(() => false));
  await input().fill('4005'); await S(page, 3).getByRole('button', { name: 'OK' }).first().click(); await page.waitForTimeout(300);
  await S(page, 4).getByRole('button', { name: 'Chiffre 0, position Centaines' }).last().click();
  await S(page, 4).getByRole('button', { name: 'Vérifier', exact: true }).last().click(); await page.waitForTimeout(300);
  check('m5 s4: wrong hint persists', await S(page, 4).getByText('Une position est « vide »').isVisible().catch(() => false));
  check('m5 s4: reveal decomposition', await S(page, 4).getByText(/4.005 = 4.000 \+ 5/).isVisible().catch(() => false));
  await S(page, 4).getByRole('button', { name: 'Chiffre 0, position Centaines' }).last().click();
  await S(page, 4).getByRole('button', { name: 'Chiffre 0, position Unités' }).last().click();
  await S(page, 4).getByRole('button', { name: 'Vérifier', exact: true }).last().click(); await page.waitForTimeout(300);
  await S(page, 4).getByRole('button', { name: 'Chiffre 0, position Milliers', exact: true }).last().click();
  await S(page, 4).getByRole('button', { name: 'Chiffre 0, position Centaines' }).last().click();
  await S(page, 4).getByRole('button', { name: 'Chiffre 0, position Dizaines', exact: true }).last().click();
  await S(page, 4).getByRole('button', { name: 'Vérifier', exact: true }).last().click(); await page.waitForTimeout(300);
  await S(page, 4).getByRole('button', { name: 'Chiffre 0, position Dizaines de milliers' }).last().click();
  await S(page, 4).getByRole('button', { name: 'Chiffre 0, position Centaines' }).last().click();
  await S(page, 4).getByRole('button', { name: 'Chiffre 0, position Dizaines', exact: true }).last().click();
  await S(page, 4).getByRole('button', { name: 'Vérifier', exact: true }).last().click(); await page.waitForTimeout(300);
  await S(page, 4).getByRole('button', { name: /ni centaine ni dizaine/ }).click(); await page.waitForTimeout(200);
  await S(page, 4).getByRole('button', { name: /deux nombres différents/ }).click(); await page.waitForTimeout(400);
  check('m5: next enabled', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
  const p = await getProgress(page);
  check('m5: completedModules has 5', !!p?.completedModules?.includes('5'));
  await ctx.close();
}
{
  const { ctx, page } = await freshPage(['1', '2', '3', '4', '5']);
  await page.goto(`${LESSON}/6`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Comparer les nombres');
  await S(page, 1).getByRole('button', { name: 'La quantité A' }).click(); await page.waitForTimeout(300);
  await S(page, 2).getByRole('button', { name: /^1.200 4 chiffres$/ }).click(); await page.waitForTimeout(200);
  await S(page, 2).getByRole('button', { name: /^10.000 5 chiffres$/ }).click(); await page.waitForTimeout(200);
  await S(page, 2).getByRole('button', { name: /^100.000 6 chiffres$/ }).click(); await page.waitForTimeout(300);
  check('m6 s2: règle 1 shown', await S(page, 2).getByText('Règle 1').isVisible().catch(() => false));
  await S(page, 3).getByRole('button', { name: 'Comparer les milliers' }).click();
  await S(page, 3).getByRole('button', { name: 'Comparer les centaines' }).click();
  await S(page, 3).getByRole('button', { name: 'Comparer les dizaines' }).click(); await page.waitForTimeout(300);
  check('m6 lab1: première différence', await S(page, 3).getByText('Première différence').first().isVisible().catch(() => false));
  await S(page, 3).getByRole('button', { name: 'Signe =' }).first().click(); await page.waitForTimeout(300);
  check('m6 lab1: wrong symbol shows bonne réponse', await S(page, 3).getByText(/Bonne réponse : ?/).first().isVisible().catch(() => false));
  await S(page, 3).getByRole('button', { name: 'Comparer les milliers' }).click();
  await S(page, 3).getByRole('button', { name: 'Comparer les centaines' }).click();
  await S(page, 3).getByRole('button', { name: 'Comparer les dizaines' }).click(); await page.waitForTimeout(300);
  await S(page, 3).getByRole('button', { name: 'Signe <' }).last().click(); await page.waitForTimeout(300);
  check('m6 s3: règle 2 shown', await S(page, 3).getByText('Règle 2').isVisible().catch(() => false));
  await S(page, 4).getByRole('button', { name: /On compare 900 et 12/ }).click(); await page.waitForTimeout(200);
  await S(page, 4).getByRole('button', { name: /morceaux au hasard/ }).click(); await page.waitForTimeout(400);
  check('m6: next enabled', await page.getByRole('button', { name: /Module suivant/ }).last().isEnabled().catch(() => false));
  const p = await getProgress(page);
  check('m6: completedModules has 6', !!p?.completedModules?.includes('6'));
  await page.screenshot({ path: SHOT_DIR + 'v2-m6-done.png', fullPage: true });
  await ctx.close();
}
check('no console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
process.exit(summary() ? 1 : 0);
