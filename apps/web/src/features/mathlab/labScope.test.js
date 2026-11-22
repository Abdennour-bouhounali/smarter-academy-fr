import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  LAB_SCOPES, attachLabScope, attachScopeToSummary, commonTools, isCommonTool, labHomePath, readLabScopeParam,
  resolveToolScope, scopeDeclarationError, storedLabScope, stripLabScope, summaryLabScope, toolCapabilities,
  toolScopes, toolsForScope, withLabScope, workLabScope,
} from './labScope.js';
import { MATH_LAB_TOOLS, getMathLabTool } from './toolRegistry.js';
import { mathLabToolPath, newMathLabDocument } from './mathLabDocument.js';
import { selectWorks, activeWorkFilterCount, DEFAULT_WORK_FILTERS } from './work/workFilters.js';

// Ce fichier tient la mécanique des DEUX ateliers : il ouvre donc le côté lycée,
// caché en France (labConfig.js). Ce que l'atelier fait quand il est caché —
// le réglage livré — est tenu par labScope.closed.test.js.
vi.mock('./labConfig.js', () => ({ LYCEE_LAB_ENABLED: true }));

const here = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(readFileSync(resolve(here, '../../i18n/locales/fr/mathlab.json'), 'utf8'));
const lookup = (key) => key.split('.').reduce((node, part) => node?.[part], catalog);

/**
 * LES DEUX ateliers (MATH_LAB.md §2.1) — la logique pure, et la CLASSIFICATION
 * des quatorze instruments selon le programme FRANÇAIS (le collège : cycle 4,
 * 2020 ; ce qu'il n'enseigne pas est au lycée). Cette classification est une
 * décision pédagogique : la changer doit se faire ici, consciemment, pas par
 * accident.
 */
describe('la classification des instruments', () => {
  const EXPECTED = {
    whiteboard: 'common',
    functionGrapher: ['moyen', 'secondaire'],
    geometry3d: ['moyen'],
    probabilityStats: ['moyen', 'secondaire'],
    algebra: ['moyen', 'secondaire'],
    vectors: ['secondaire'],
    trigonometry: ['moyen', 'secondaire'],
    sequences: ['secondaire'],
    transformations: ['moyen', 'secondaire'],
    conics: ['secondaire'],
    numberLab: ['moyen', 'secondaire'],
    analysis: ['secondaire'],
    logic: ['moyen', 'secondaire'],
    measurement: ['moyen', 'secondaire'],
  };

  it('chaque instrument est classé, et comme prévu', () => {
    expect(Object.keys(EXPECTED).sort()).toEqual(MATH_LAB_TOOLS.map((tool) => tool.id).sort());
    for (const tool of MATH_LAB_TOOLS) expect(tool.scopes, tool.id).toEqual(EXPECTED[tool.id]);
  });

  it('le tableau est le seul instrument commun', () => {
    expect(commonTools(MATH_LAB_TOOLS).map((tool) => tool.id)).toEqual(['whiteboard']);
    expect(isCommonTool(getMathLabTool('whiteboard'))).toBe(true);
    expect(toolScopes(getMathLabTool('whiteboard'))).toEqual([]);
  });

  it('atelier du collège ne montre aucun instrument du seul lycée', () => {
    const moyen = toolsForScope(MATH_LAB_TOOLS, 'moyen').map((tool) => tool.id);
    for (const id of ['sequences', 'conics', 'analysis', 'vectors', 'whiteboard']) expect(moyen, id).not.toContain(id);
    expect(moyen).toContain('measurement');
    expect(moyen).toContain('geometry3d');
    expect(moyen).toContain('probabilityStats');
  });

  it('atelier du lycée : les instruments partagés, plus les siens ; sans la géométrie dans l’espace', () => {
    const moyen = toolsForScope(MATH_LAB_TOOLS, 'moyen').map((tool) => tool.id);
    const secondaire = toolsForScope(MATH_LAB_TOOLS, 'secondaire').map((tool) => tool.id);
    for (const id of moyen.filter((tool) => tool !== 'geometry3d')) expect(secondaire, id).toContain(id);
    expect(secondaire).not.toContain('geometry3d');
    for (const id of ['sequences', 'conics', 'analysis', 'vectors', 'probabilityStats']) expect(secondaire, id).toContain(id);
  });

  it('un instrument PARTAGÉ l’est une seule fois : un objet, un composant, une route', () => {
    const grapherMoyen = toolsForScope(MATH_LAB_TOOLS, 'moyen').find((tool) => tool.id === 'functionGrapher');
    const grapherSecondaire = toolsForScope(MATH_LAB_TOOLS, 'secondaire').find((tool) => tool.id === 'functionGrapher');
    expect(grapherMoyen).toBe(grapherSecondaire);
    expect(mathLabToolPath(grapherMoyen, null, '/espace/atelier', 'moyen')).toBe('/espace/atelier/grapheur?lab=moyen');
    expect(mathLabToolPath(grapherMoyen, null, '/espace/atelier', 'secondaire')).toBe('/espace/atelier/grapheur?lab=secondaire');
  });

  it('chaque description propre à un atelier existe en français', () => {
    for (const tool of MATH_LAB_TOOLS) {
      for (const scope of LAB_SCOPES) {
        const key = toolCapabilities(tool, scope)?.descriptionKey;
        if (key) expect(typeof lookup(key), `${tool.id}/${scope}`).toBe('string');
      }
    }
  });

  it('chaque mot des ateliers existe en français, pluriels compris', () => {
    for (const scope of LAB_SCOPES) {
      for (const key of ['name', 'short', 'grades', 'description', 'toolsHeading']) {
        expect(typeof lookup(`labs.${scope}.${key}`), `${scope}.${key}`).toBe('string');
      }
      expect(typeof lookup(`work.filters.labs.${scope}`)).toBe('string');
    }
    for (const key of ['heading', 'hint', 'commonHeading', 'commonBadge', 'enter', 'backToLab', 'switchLabel', 'myWorkHint', 'pickLabel']) {
      expect(typeof lookup(`labs.${key}`), key).toBe('string');
    }
    for (const form of ['one', 'other']) {
      expect(typeof lookup(`labs.toolCount_${form}`), form).toBe('string');
    }
    for (const form of ['zero', 'two', 'few', 'many']) {
      expect(lookup(`labs.toolCount_${form}`), form).toBeUndefined();
    }
    expect(typeof lookup('labs.toolCountEmpty')).toBe('string');
    expect(lookup('labs.moyen.name')).toBe('L’atelier du collège');
    expect(lookup('labs.secondaire.name')).toBe('L’atelier du lycée');
    expect(lookup('labs.moyen.short')).toBe('Collège');
    expect(lookup('labs.secondaire.short')).toBe('Lycée');
  });
});

describe('l’atelier où s’ouvre un instrument', () => {
  const grapher = getMathLabTool('functionGrapher');
  const analysis = getMathLabTool('analysis');
  const whiteboard = getMathLabTool('whiteboard');

  it('le document enregistré l’emporte, puis l’URL, puis le dernier choisi, puis le collège', () => {
    expect(resolveToolScope(grapher, { stored: 'secondaire', requested: 'moyen', remembered: 'moyen' })).toBe('secondaire');
    expect(resolveToolScope(grapher, { requested: 'secondaire', remembered: 'moyen' })).toBe('secondaire');
    expect(resolveToolScope(grapher, { remembered: 'secondaire' })).toBe('secondaire');
    expect(resolveToolScope(grapher, {})).toBe('moyen');
  });

  it('un instrument d’un seul atelier y est toujours, un commun n’en a pas', () => {
    expect(resolveToolScope(analysis, { requested: 'moyen', stored: 'moyen' })).toBe('secondaire');
    expect(resolveToolScope(getMathLabTool('sequences'), { requested: 'moyen' })).toBe('secondaire');
    expect(resolveToolScope(whiteboard, { requested: 'moyen' })).toBeNull();
  });

  it('une valeur qui n’est pas un atelier est ignorée', () => {
    expect(resolveToolScope(grapher, { stored: 'lycee', requested: 'college', remembered: 42 })).toBe('moyen');
    expect(readLabScopeParam('?lab=secondaire')).toBe('secondaire');
    expect(readLabScopeParam('?lab=lycee')).toBeNull();
    expect(readLabScopeParam('')).toBeNull();
  });

  it('écrit et relit le paramètre d’URL', () => {
    expect(withLabScope('/espace/atelier', 'moyen')).toBe('/espace/atelier?lab=moyen');
    expect(withLabScope('/espace/atelier', null)).toBe('/espace/atelier');
    expect(labHomePath('/enseignant/atelier', 'secondaire')).toBe('/enseignant/atelier?lab=secondaire');
    expect(mathLabToolPath(grapher, 12, '/espace/atelier', 'moyen')).toBe('/espace/atelier/grapheur/12?lab=moyen');
    // Sans atelier, les adresses d'avant ne changent pas.
    expect(mathLabToolPath(grapher, 12)).toBe('/espace/atelier/grapheur/12');
  });
});

describe('le document se souvient de son atelier', () => {
  it('la coquille ajoute sa clé à l’envoi et la retire à la lecture', () => {
    const toolData = { functions: [], viewport: null };
    const sent = attachLabScope(toolData, 'moyen');
    expect(sent).toEqual({ functions: [], viewport: null, labScope: 'moyen' });
    expect(storedLabScope(sent)).toBe('moyen');
    expect(stripLabScope(sent)).toEqual(toolData);
    // L'état de l'outil n'est jamais modifié en place.
    expect(toolData).not.toHaveProperty('labScope');
  });

  it('un instrument commun, ou un ancien document, n’a pas de clé', () => {
    expect(attachLabScope({ elements: [] }, null)).toEqual({ elements: [] });
    expect(storedLabScope({ elements: [] })).toBeNull();
    expect(stripLabScope({ elements: [] })).toEqual({ elements: [] });
    expect(stripLabScope(null)).toBeNull();
  });

  it('le résumé de « Mes travaux » porte l’atelier, sans rien changer d’autre', () => {
    const summary = { kind: 'curve', text: ['2x+1'] };
    expect(attachScopeToSummary(summary, 'moyen')).toEqual({ ...summary, scope: 'moyen' });
    expect(attachScopeToSummary(null, 'moyen')).toBeNull();
    expect(attachScopeToSummary(summary, null)).toBe(summary);
    expect(summaryLabScope({ scope: 'secondaire' })).toBe('secondaire');
    expect(summaryLabScope({ scope: 'x' })).toBeNull();
  });

  it('un document neuf naît dans son atelier : l’algèbre ouvre le collège sur a² − b², pas sur x² + 5x + 6', () => {
    const algebra = getMathLabTool('algebra');
    const moyen = newMathLabDocument(algebra, { title: 't', scope: 'moyen', capabilities: toolCapabilities(algebra, 'moyen') });
    const secondaire = newMathLabDocument(algebra, { title: 't', scope: 'secondaire', capabilities: toolCapabilities(algebra, 'secondaire') });
    expect(moyen.data.factor.source).toBe('4x^2 - 9');
    expect(secondaire.data.factor.source).toBe('x^2 + 5x + 6');
  });

  it('le traceur ouvre le collège sur une droite, le lycée sur la parabole', () => {
    const grapher = getMathLabTool('functionGrapher');
    const moyen = newMathLabDocument(grapher, { title: 't', scope: 'moyen', capabilities: toolCapabilities(grapher, 'moyen') });
    const secondaire = newMathLabDocument(grapher, { title: 't', scope: 'secondaire', capabilities: toolCapabilities(grapher, 'secondaire') });
    expect(moyen.data.functions[0].expression).toBe('2x+1');
    expect(secondaire.data.functions[0].expression).toBe('x^2');
  });
});

describe('« Mes travaux » par atelier', () => {
  const works = [
    { id: 1, tool: 'functionGrapher', summary: { kind: 'curve', scope: 'moyen' }, updatedAt: '2026-09-30T10:00:00Z' },
    { id: 2, tool: 'functionGrapher', summary: { kind: 'curve', scope: 'secondaire' }, updatedAt: '2026-09-30T09:00:00Z' },
    // Un travail plus ancien que les ateliers : son instrument n'a qu'un atelier.
    { id: 3, tool: 'analysis', summary: { kind: 'curve' }, updatedAt: '2026-09-30T08:00:00Z' },
    // Un ancien travail d'un instrument partagé : aucun atelier connu.
    { id: 4, tool: 'algebra', summary: null, updatedAt: '2026-09-30T07:00:00Z' },
    { id: 5, tool: 'whiteboard', summary: { kind: 'strokes' }, updatedAt: '2026-09-30T06:00:00Z' },
  ];
  const labOf = (work) => workLabScope(work, getMathLabTool(work.tool));

  it('l’atelier d’un travail : son résumé, sinon son instrument s’il n’en a qu’un', () => {
    expect(works.map(labOf)).toEqual(['moyen', 'secondaire', 'secondaire', null, null]);
  });

  it('filtre par atelier, et le filtre compte comme les autres', () => {
    const ids = (lab) => selectWorks(works, { filters: { ...DEFAULT_WORK_FILTERS, lab }, labOf }).map((work) => work.id);
    expect(ids('all')).toEqual([1, 2, 3, 4, 5]);
    expect(ids('moyen')).toEqual([1]);
    expect(ids('secondaire')).toEqual([2, 3]);
    expect(activeWorkFilterCount({ ...DEFAULT_WORK_FILTERS, lab: 'moyen' })).toBe(1);
    expect(DEFAULT_WORK_FILTERS.lab).toBe('all');
  });
});

describe('la déclaration d’un instrument', () => {
  it('refuse ce qui n’est pas une liste d’ateliers', () => {
    expect(scopeDeclarationError({ scopes: 'common' })).toBeNull();
    expect(scopeDeclarationError({ scopes: ['moyen'] })).toBeNull();
    expect(scopeDeclarationError({ scopes: ['moyen', 'secondaire'], capabilities: { moyen: {}, secondaire: null } })).toBeNull();
    expect(scopeDeclarationError({})).toMatch(/scopes/);
    expect(scopeDeclarationError({ scopes: ['lycee'] })).toMatch(/scopes/);
    expect(scopeDeclarationError({ scopes: 'common', capabilities: {} })).toMatch(/commun/);
    expect(scopeDeclarationError({ scopes: ['secondaire'], capabilities: { moyen: {} } })).toMatch(/moyen/);
  });

  it('aucun segment d’URL ne s’appelle comme un atelier', () => {
    for (const tool of MATH_LAB_TOOLS) {
      for (const segment of [tool.slug, ...(tool.aliases ?? [])]) expect(LAB_SCOPES, segment).not.toContain(segment);
    }
  });
});
