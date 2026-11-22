import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import mathlab from '../../i18n/locales/fr/mathlab.json';
import { LYCEE_LAB_ENABLED } from './labConfig.js';
import {
  DECLARED_LAB_SCOPES,
  LAB_SCOPES,
  isLabScope,
  labHomePath,
  readLabScopeParam,
  resolveToolScope,
  storedLabScope,
  summaryLabScope,
  toolsForScope,
  workLabScope,
} from './labScope.js';
import { MATH_LAB_TOOLS, REGISTERED_MATH_LAB_TOOLS, getMathLabTool, getMathLabToolBySlug } from './toolRegistry.js';
import { WORK_LABS } from './work/workFilters.js';
import MathLabToolPicker from './overlay/MathLabToolPicker.jsx';
import WorkFilterPanel from './work/WorkFilterPanel.jsx';

/**
 * LE RÉGLAGE LIVRÉ en France : le côté lycée de l’atelier est caché
 * (labConfig.js › LYCEE_LAB_ENABLED = false, décision du propriétaire,
 * 2026-11-23). Ce fichier n'ouvre rien : il vérifie qu'aucun atelier du lycée,
 * aucun instrument du lycée seul, n'est LISTÉ (accueil, sélecteur, filtres),
 * ROUTÉ (segment d'URL, `?lab=`, document, résumé) ni CHERCHABLE (les filtres
 * et la recherche de « Mes travaux » ne lisent que MATH_LAB_TOOLS) — et que
 * leur code, lui, est toujours enregistré.
 */
const LYCEE_ONLY = ['vectors', 'sequences', 'conics', 'analysis'];
const COLLEGE = [
  'whiteboard',
  'functionGrapher',
  'geometry3d',
  'probabilityStats',
  'algebra',
  'trigonometry',
  'transformations',
  'numberLab',
  'logic',
  'measurement',
];

const i18n = i18next.createInstance();
i18n.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  resources: { fr: { mathlab, access: {} } },
  ns: ['mathlab', 'access'],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});
const render = (Component, props) =>
  renderToStaticMarkup(createElement(I18nextProvider, { i18n }, createElement(Component, props)));
const names = (ids) => ids.map((id) => mathlab.tools[id].name);

describe('le côté lycée est caché (labConfig.js)', () => {
  it('le drapeau est éteint, et un seul atelier est ouvert : le collège', () => {
    expect(LYCEE_LAB_ENABLED).toBe(false);
    expect(LAB_SCOPES).toEqual(['moyen']);
    expect(DECLARED_LAB_SCOPES).toEqual(['moyen', 'secondaire']);
    expect(isLabScope('secondaire')).toBe(false);
  });

  it('le code reste : les quatorze instruments sont enregistrés, ceux du lycée compris', () => {
    const registered = REGISTERED_MATH_LAB_TOOLS.map((tool) => tool.id);
    expect(registered).toHaveLength(14);
    for (const id of LYCEE_ONLY) expect(registered, id).toContain(id);
    expect(REGISTERED_MATH_LAB_TOOLS.find((tool) => tool.id === 'algebra').capabilities).toHaveProperty('secondaire');
  });

  it('LISTÉ : les instruments publiés sont ceux du collège, sans un atelier du lycée', () => {
    expect(MATH_LAB_TOOLS.map((tool) => tool.id).sort()).toEqual([...COLLEGE].sort());
    for (const tool of MATH_LAB_TOOLS) {
      if (Array.isArray(tool.scopes)) expect(tool.scopes, tool.id).toEqual(['moyen']);
      expect(tool.capabilities ?? {}, tool.id).not.toHaveProperty('secondaire');
    }
    expect(toolsForScope(MATH_LAB_TOOLS, 'secondaire')).toEqual([]);
    expect(WORK_LABS).toEqual(['all', 'moyen']);
  });

  it('ROUTÉ : ni segment d’URL, ni identifiant, ni `?lab=secondaire` n’atteint le lycée', () => {
    for (const tool of REGISTERED_MATH_LAB_TOOLS.filter((entry) => LYCEE_ONLY.includes(entry.id))) {
      expect(getMathLabTool(tool.id), tool.id).toBeNull();
      for (const segment of [tool.slug, ...(tool.aliases ?? [])])
        expect(getMathLabToolBySlug(segment), segment).toBeNull();
    }
    for (const id of COLLEGE) expect(getMathLabTool(id), id).not.toBeNull();
    expect(readLabScopeParam('?lab=secondaire')).toBeNull();
    expect(labHomePath('/espace/atelier', 'secondaire')).toBe('/espace/atelier');
    // Un document ou un résumé né au lycée rouvre au collège.
    const algebra = getMathLabTool('algebra');
    expect(resolveToolScope(algebra, { stored: 'secondaire', requested: 'secondaire', remembered: 'secondaire' })).toBe(
      'moyen',
    );
    expect(storedLabScope({ labScope: 'secondaire' })).toBeNull();
    expect(summaryLabScope({ scope: 'secondaire' })).toBeNull();
    expect(workLabScope({ tool: 'algebra', summary: { scope: 'secondaire' } }, algebra)).toBe('moyen');
  });

  it('LISTÉ, dans une leçon : le sélecteur du calque n’a ni onglet du lycée ni instrument du lycée', () => {
    const html = render(MathLabToolPicker, {
      tools: MATH_LAB_TOOLS,
      onPick: () => {},
      scope: 'moyen',
      onScope: () => {},
    });
    expect(html).toContain('data-ml-overlay-lab="moyen"');
    expect(html).not.toContain('data-ml-overlay-lab="secondaire"');
    expect(html).not.toContain(mathlab.labs.secondaire.name);
    for (const name of names(LYCEE_ONLY)) expect(html, name).not.toContain(name);
    expect(html).toContain(mathlab.tools.probabilityStats.name);
  });

  it('CHERCHABLE : les filtres de « Mes travaux » n’offrent ni le lycée, ni un instrument du lycée', () => {
    const html = render(WorkFilterPanel, { filters: { lab: 'all', tool: 'all', period: 'all', favorite: false } });
    expect(html).toContain('data-ml-work-lab="moyen"');
    expect(html).not.toContain('data-ml-work-lab="secondaire"');
    for (const id of LYCEE_ONLY) expect(html, id).not.toContain(`data-ml-work-tool="${id}"`);
    for (const id of COLLEGE) expect(html, id).toContain(`data-ml-work-tool="${id}"`);
  });
});
