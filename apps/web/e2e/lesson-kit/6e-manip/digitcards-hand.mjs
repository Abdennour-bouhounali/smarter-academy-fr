import { writeFileSync, rmSync } from 'node:fs';
import { launch, open, check, summary, settle, body, noHScroll, smallTargets, SHOT_DIR, errs } from '../_2nde-helpers.mjs';

// `CardHand` n'est monté par AUCUN module aujourd'hui (composant partagé,
// testé unitairement, en attente d'emploi). On le monte donc sur une page
// jetable, écrite dans la racine vite le temps du test puis effacée, pour
// éprouver le VRAI geste sur le serveur déjà lancé.
const ROOT = '/home/abdennour/websites/smarter-academy-v2/apps/web/';
writeFileSync(`${ROOT}__cardhand-harness.html`,
  '<!doctype html><html lang="fr"><head><meta charset="utf-8">'
  + '<meta name="viewport" content="width=device-width, initial-scale=1.0"><title>CardHand harness</title></head>'
  + '<body><main style="padding:12px;max-width:640px;margin:0 auto"><div id="root"></div></main>'
  + '<script type="module" src="/__cardhand-harness.jsx"></script></body></html>');
writeFileSync(`${ROOT}__cardhand-harness.jsx`, `import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './src/index.css';
import { CardHand } from './src/lessons/college/6e/nombres_calculs/nombres-entiers/components/DigitCards';
function Harness() {
  const [slots, setSlots] = useState([null, null, null, null]);
  return (
    <div>
      <CardHand name="Test" cards={[3, 9, 1, 2]} slots={slots} onChange={setSlots} />
      <div data-testid="arrangement">{slots.map((d) => (d === null ? '_' : d)).join('')}</div>
    </div>
  );
}
createRoot(document.getElementById('root')).render(<Harness />);
`);
const cleanup = () => {
  rmSync(`${ROOT}__cardhand-harness.html`, { force: true });
  rmSync(`${ROOT}__cardhand-harness.jsx`, { force: true });
};
process.on('exit', cleanup);

const URL = 'http://localhost:5250/__cardhand-harness.html';
const browser = await launch();
const { ctx, page } = await open(browser, URL, { tag: 'd' });
await settle(page, 900);

const t = await body(page);
check('la consigne annonce le glisser', /fais-les glisser dans une case/i.test(t), t.slice(0, 200));

const hand = page.locator('button[aria-label^="Test — Prendre la carte"]');
check('les 4 cartes sont saisissables', await hand.count() === 4, `cartes: ${await hand.count()}`);
const slot0 = page.locator('button[data-drop-zone="slot:0"]');
const slot1 = page.locator('button[data-drop-zone="slot:1"]');
check('les cases sont des zones de dépôt', await page.locator('button[data-drop-zone^="slot:"]').count() === 4);

const arr = () => page.locator('[data-testid="arrangement"]').textContent();

// ── VRAI glisser : la carte 3 (première de la main) → case des milliers.
const card3 = page.locator('button[aria-label="Test — Prendre la carte 3"]');
{
  const a = await card3.boundingBox(); const b = await slot0.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2 - 20, { steps: 5 });
  check('la carte suit le doigt (fantôme)', await page.locator('div.fixed.z-50.pointer-events-none').count() > 0);
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  check('la case survolée s’allume', await slot0.getAttribute('data-drop-active') === 'true');
  await page.mouse.up();
  await settle(page, 400);
}
check('le glisser POSE la carte dans la case', await arr() === '3___', await arr());

// ── VRAI glisser d'une carte POSÉE vers une autre case : l'échange/déplacement.
{
  const a = await slot0.boundingBox(); const b = await slot1.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 });
  await page.mouse.up();
  await settle(page, 400);
}
check('glisser une carte posée la DÉPLACE (même chiffre, autre valeur)', await arr() === '_3__', await arr());

// ── Le chemin clic/clavier (lecteur d'écran) : prendre puis poser.
const card9 = page.locator('button[aria-label="Test — Prendre la carte 9"]');
await card9.click();
await settle(page, 250);
check('activer une carte la PREND (aria-pressed)', await card9.getAttribute('aria-pressed') === 'true');
await slot0.click();
await settle(page, 400);
check('activer une case POSE la carte', await arr() === '93__', await arr());

// L'échange au clavier : prendre la carte de la case 0, la poser sur la case 1.
await slot0.click(); await settle(page, 200);
check('activer une case pleine reprend sa carte', await slot0.getAttribute('aria-pressed') === 'true');
await slot1.click(); await settle(page, 400);
check('poser sur une case pleine ÉCHANGE les deux', await arr() === '39__', await arr());

// La manipulation ne se fige jamais : « Tout retirer » et les cartes restent vivantes.
await page.getByRole('button', { name: /Tout retirer/ }).click();
await settle(page, 300);
check('« Tout retirer » rend la main entière', await arr() === '____', await arr());
check('rien n’est désactivé', await page.locator('main button[disabled]').count() === 0);

check('pas de défilement horizontal', await noHScroll(page));
await page.screenshot({ path: `${SHOT_DIR}digitcards-hand.png`, fullPage: true });
await ctx.close();

const m = await open(browser, URL, { mobile: true, tag: 'dm' });
await settle(m.page, 800);
check('mobile 375px : pas de débordement', await noHScroll(m.page));
const small = await smallTargets(m.page);
check('mobile : zones tactiles ≥44px', small.length === 0, JSON.stringify(small.slice(0, 4)));
await m.ctx.close();

await browser.close();
check('aucune erreur console', errs.length === 0, errs.slice(0, 3).join(' | '));
process.exit(summary() ? 1 : 0);
