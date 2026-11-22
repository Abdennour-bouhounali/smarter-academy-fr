// 4AM — les figures d'OUVERTURE d'unité (2026-10-02). Un تحدّ ou un encadré dont le texte dit « الشكل المقابل »,
// « البيان المقابل », « التمثيل البياني المقابل », « اعتمادا على الشكل » ou « نظم العمل في جدول » doit montrer cette figure sur la page
// d'unité (pages/unit/UnitOpenerFigure.jsx) ; une unité sans renvoi n'en montre aucune.
// Depuis le 2026-10-13 le تحدّ de la page EST la situation de la synthèse « أدمج تعلّماتي » (module 7) : unités 5, 7, 13 sans dessin.
//
// Run : KIT_BASE=http://localhost:5173 node apps/web/e2e/lesson-kit/4am-unit-opener-figures.mjs
//   SHOTS=dir enregistre une capture du bloc d'ouverture de chaque unité.
import { BASE, launch, newCtx, watchErrors, check, summary, noHorizontalScroll } from './helpers.mjs';

const A = 'ansab_al_aadad_wal_hisab'; const T = 'tanasubiya_duwal'; const H = 'handasa';
// [chapitre, unité, slots attendus]
const UNITS = [
  [A, 'aadad-tabiiya-natiqa', []],
  [A, 'hisab-judhur', ['challenge']],
  [A, 'hisab-harfi', ['challenge', 'aside']],
  [A, 'muadalat-mutarajihat', ['challenge']],
  [A, 'jumal-muadalatayn', []],
  [T, 'tanasubiya-dala-khattiya', ['challenge']],
  [T, 'dala-taalufiya', []],
  [T, 'ihsa', ['challenge']],
  [H, 'khassiyat-talis', ['challenge']],
  [H, 'hisab-muthallathat', ['challenge']],
  [H, 'ashia-insihab', ['challenge']],
  [H, 'ashia-maalam', ['challenge']],
  [H, 'dawaran-mudalaat', []],
  [H, 'handasa-fada', ['challenge']],
];
// Unité 10 : « اعتمادا على الشكل » renvoie aussi à une figure ; unité 11 : « (الشكل) » entre parenthèses.
const REFERS = /المقابل|نظم العمل في جدول|على الشكل|\(الشكل\)/;
const errors = [];
const { browser } = await launch();

for (const mobile of [false, true]) {
  const ctx = await newCtx(browser, { mobile });
  const page = await ctx.newPage();
  watchErrors(page, errors);
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const tag = mobile ? 'mobile' : 'desktop';
  for (const [ch, code, slots] of UNITS) {
    await page.goto(`${BASE}/courses/moyen/4am/${ch}/units/${code}`, { waitUntil: 'load', timeout: 45000 });
    await page.waitForSelector(`[data-unit="${code}"]`);
    await page.$$eval('details', (ds) => ds.forEach((d) => { d.open = true; }));
    for (const slot of slots) {
      const sel = `[data-unit-figure="${code}:${slot}"]`;
      await page.waitForSelector(`${sel} svg, ${sel} table`, { timeout: 15000 }).catch(() => {});
      check(`${tag} ${code}:${slot} — la figure annoncée est dessinée`, (await page.$(`${sel} svg, ${sel} table`)) !== null);
    }
    const challengeText = (await page.$eval('[data-unit-challenge] p', (el) => el.textContent).catch(() => '')) ?? '';
    if (REFERS.test(challengeText)) check(`${tag} ${code} — le تحدّ renvoie à une figure, elle existe`, slots.includes('challenge'));
    if (!slots.length) check(`${tag} ${code} — aucune figure superflue`, (await page.$('[data-unit-figure]')) === null);
    check(`${tag} ${code} — aucun débordement horizontal`, await noHorizontalScroll(page));
    if (process.env.SHOTS && slots.length) {
      await page.locator('[data-unit-challenge]').first().screenshot({ path: `${process.env.SHOTS}/${tag}-${code}-challenge.png` });
      if (slots.includes('aside')) await page.locator(`[data-unit-figure="${code}:aside"]`).screenshot({ path: `${process.env.SHOTS}/${tag}-${code}-aside.png` });
    }
  }
  await ctx.close();
}
await browser.close();
check('aucune erreur console', errors.length === 0, errors.slice(0, 3).join(' | '));
summary();
