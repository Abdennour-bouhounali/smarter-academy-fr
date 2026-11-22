import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGE_TOURS } from './tourRegistry';
import tourText from '../../i18n/locales/ar/tour.json';
import nav from '../../i18n/locales/ar/nav.json';

/**
 * Le CONTRAT du registre des « جولة تعريفية » : chaque étape a ses textes
 * arabes, et chaque crochet `data-*` qu'une étape vise est posé quelque part
 * dans le code. Renommer un crochet sans mettre la visite à jour ferait
 * disparaître l'étape en silence — ce test le dit avant.
 */
const SRC = join(dirname(fileURLToPath(import.meta.url)), '../..');

function sources(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    // Le moteur commun des leçons (lessons/common) porte des crochets ; le
    // CONTENU des leçons (lessons/moyen, des milliers de fichiers) n'en porte pas.
    if (name === 'node_modules' || path.endsWith(join('lessons', 'moyen'))) continue;
    if (statSync(path).isDirectory()) sources(path, out);
    else if (/\.jsx?$/.test(name) && !/\.test\.jsx?$/.test(name) && name !== 'tourRegistry.js') out.push(readFileSync(path, 'utf8'));
  }
  return out;
}
const code = sources(SRC).join('\n');

// Chaque `[attr]` ou `[attr="value"]` d'un sélecteur.
function hooks(selector) {
  return [...selector.matchAll(/\[([a-z-]+)(?:="([^"]+)")?\]/g)].map(([, attr, value]) => ({ attr, value }));
}

const lookup = (path) => path.split('.').reduce((node, part) => node?.[part], tourText);

describe('tour registry contract', () => {
  it('every step has a non-empty Arabic title and body', () => {
    for (const tour of PAGE_TOURS) {
      for (const step of tour.steps) {
        for (const field of ['title', 'body']) {
          const text = lookup(`${tour.key}.${step.id}.${field}`);
          expect(text, `${tour.key}.${step.id}.${field}`).toMatch(/[؀-ۿ]/);
        }
      }
    }
  });

  it('every hook a step targets is set somewhere in the code', () => {
    for (const tour of PAGE_TOURS) {
      for (const step of tour.steps.filter((s) => s.target)) {
        for (const { attr, value } of hooks(step.target)) {
          // `data-tab="students"` est posé par une expression (`data-tab={key}`) :
          // on vérifie l'attribut, et la valeur quand elle est littérale.
          expect(code.includes(attr), `${tour.key}.${step.id}: ${attr}`).toBe(true);
          if (value && attr === 'data-tour') {
            expect(code.includes(`data-tour="${value}"`), `${tour.key}.${step.id}: ${value}`).toBe(true);
          }
        }
      }
    }
  });

  it('ships the shared controls and the replay label', () => {
    for (const key of ['label', 'progress', 'next', 'previous', 'skip', 'finish', 'close']) {
      expect(tourText.ui[key]).toBeTruthy();
    }
    // « N من M » : pas de barre oblique, qui s'inverse en RTL.
    expect(tourText.ui.progress).not.toContain('/');
    expect(nav.tourReplay).toMatch(/[؀-ۿ]/);
  });
});
