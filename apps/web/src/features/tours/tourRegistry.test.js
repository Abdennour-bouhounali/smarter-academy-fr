import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGE_TOURS } from './tourRegistry';
import tourText from '../../i18n/locales/fr/tour.json';
import nav from '../../i18n/locales/fr/nav.json';
import { features } from '../../config/features';

/**
 * Le CONTRAT du registre des « Visite de la page » : chaque étape a ses textes
 * français (aucune lettre arabe), et chaque crochet `data-*` qu'une étape vise est posé quelque part
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
  it('every step has a non-empty French title and body, with no Arabic letter', () => {
    for (const tour of PAGE_TOURS) {
      for (const step of tour.steps) {
        for (const field of ['title', 'body']) {
          const text = lookup(`${tour.key}.${step.id}.${field}`);
          expect(text, `${tour.key}.${step.id}.${field}`).toMatch(/[A-Za-zÀ-ÿ]{2}/);
          expect(text, `${tour.key}.${step.id}.${field}`).not.toMatch(/[\u0600-\u06FF]/);
        }
      }
    }
  });

  it('a student tour says « tu », a teacher tour says « vous »', () => {
    for (const tour of PAGE_TOURS) {
      const text = tour.steps.map((s) => lookup(`${tour.key}.${s.id}.body`)).join(' ');
      if (tour.role === 'teacher') expect(text, tour.key).not.toMatch(/\b(tu|ton|ta|tes|toi)\b/i);
      else expect(text, tour.key).not.toMatch(/\b(vous|votre|vos)\b/i);
    }
  });

  it('a gate names a real feature, and the surfaces that are off are gated', () => {
    for (const tour of PAGE_TOURS) {
      for (const item of [tour, ...tour.steps]) {
        if (item.feature) expect(Object.keys(features), `${tour.key}: ${item.feature}`).toContain(item.feature);
      }
    }
    const byKey = Object.fromEntries(PAGE_TOURS.map((tour) => [tour.key, tour]));
    expect(byKey['student.challenge'].feature).toBe('dailyChallenge');
    expect(byKey['student.home'].steps.find((s) => s.id === 'challenge').feature).toBe('dailyChallenge');
    expect(byKey['teacher.plan'].commercial).toBe(true);
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
    // « N sur M » : un mot, pas une barre oblique.
    expect(tourText.ui.progress).not.toContain('/');
    expect(nav.tourReplay).toBe('Visite de la page');
    expect(nav.tourReplay).not.toMatch(/[\u0600-\u06FF]/);
  });
});
