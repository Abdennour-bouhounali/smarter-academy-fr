// Le lecteur partagé des solutions pas à pas du مختبر (MATH_LAB.md §3.4.1).
// Une solution n'est jamais affichée d'un bloc : un e2e qui veut lire un
// résultat doit dérouler le lecteur — mode « خطوة بخطوة », « ابدأ الحل »,
// puis « الخطوة التالية » jusqu'au bout. `prefix` est l'attribut du lecteur
// (`data-ml-alg-step`, `data-ml-nb-step`, `data-ml-an-dstep`…).

/** Déroule le lecteur jusqu'au dernier pas ; rend le nombre de clics sur « التالي ». */
export async function playToEnd(page, prefix, { max = 120, pause = 60 } = {}) {
  const manual = page.locator(`[${prefix}-mode="manual"]`).first();
  if (await manual.count()) await manual.click();
  const start = page.locator(`[${prefix}-start]`).first();
  if (await start.count()) await start.click();
  let clicks = 0;
  for (; clicks < max; clicks += 1) {
    const next = page.locator(`[${prefix}-next]`).first();
    if (!(await next.count()) || await next.isDisabled()) break;
    await next.click();
    await page.waitForTimeout(pause);
  }
  return clicks;
}
