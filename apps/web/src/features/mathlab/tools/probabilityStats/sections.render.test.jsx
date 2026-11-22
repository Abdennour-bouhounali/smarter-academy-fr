import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import mathlab from '../../../../i18n/locales/ar/mathlab.json';
import ProbabilityStatsTool from './ProbabilityStatsTool.jsx';
import { normalizeProbabilityStatsData } from './probabilityState.js';
import { TREE_PRESETS } from './treePresets.js';
import { NORMAL_PRESETS } from './normalPresets.js';
import { DATASET_PRESETS } from './datasetPresets.js';
import { setProbability, setQuery } from './probabilityTree.js';

// Le déroulé RÉEL (useStepReveal), sauf quand un test demande « tout révélé » :
// le rendu serveur ne clique pas, on simule donc un élève arrivé au dernier pas.
const reveal = vi.hoisted(() => ({ all: false }));
vi.mock('../../shared/useStepReveal.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    default: (total, options) => {
      const player = actual.default(total, options);
      return reveal.all && total > 0
        ? { ...player, cursor: total, phase: 'completed', done: true, started: true }
        : player;
    },
  };
});

// Une instance i18n LOCALE ; toute clé absente est relevée (une chaîne manquante s'afficherait en clair).
const missing = new Set();
const i18n = i18next.createInstance();
i18n.use(initReactI18next).init({
  lng: 'ar-DZ',
  fallbackLng: 'ar-DZ',
  resources: { 'ar-DZ': { mathlab } },
  ns: ['mathlab'],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  saveMissing: true,
  missingKeyHandler: (_lngs, _ns, key) => missing.add(key),
});

const render = (data) => renderToStaticMarkup(createElement(
  I18nextProvider,
  { i18n },
  createElement(ProbabilityStatsTool, { initialData: data, onChange: () => {}, onReady: () => {} }),
));

beforeEach(() => { missing.clear(); reveal.all = false; });

/** Chaque section se REND sans navigateur : pas d'exception, pas de NaN, aucune clé i18n manquante, les sélecteurs e2e présents. */
describe('le laboratoire se rend dans chaque section', () => {
  it('un document neuf s’ouvre sur les expériences, avec la barre des quatre sections', () => {
    const html = render(undefined);
    expect(html).toContain('data-ml-ps-section="experiment"');
    expect(html.match(/data-ml-ps-mode=/g)).toHaveLength(4);
    expect(html).toContain('role="tablist"');
    expect(html).toContain('data-ml-ps-run');
    expect(html).toContain('data-ml-ps-panel-toggle');
    expect([...missing]).toEqual([]);
  });

  it.each(DATASET_PRESETS.map((p) => p.id))('statistique descriptive — %s, dans chaque type de graphique', (id) => {
    const text = DATASET_PRESETS.find((p) => p.id === id).text;
    for (const chart of [null, 'bars', 'histogram', 'pie', 'box', 'cumulative']) {
      const html = render({ mode: 'dataset', dataset: text, chart });
      expect(html).toContain('data-ml-ps-summary');
      expect(html).toContain('data-ml-ps-freq-table');
      expect(html).toContain('data-ml-ps-chips');
      expect(html).not.toMatch(/NaN|Infinity|undefined/);
    }
    expect([...missing]).toEqual([]);
  });

  it('statistique descriptive — série vide, valeur unique, saisie fautive', () => {
    for (const dataset of ['', '7', '12, abc, 15']) {
      const html = render({ mode: 'dataset', dataset, chart: 'pie' });
      expect(html).not.toMatch(/NaN|Infinity/);
    }
    expect(render({ mode: 'dataset', dataset: '' })).toContain('data-ml-ps-chart-empty');
    expect(render({ mode: 'dataset', dataset: '1, 2, 3' })).toContain('لا يوجد منوال');
    expect([...missing]).toEqual([]);
  });

  it.each(TREE_PRESETS.map((p) => p.id))('arbre — %s', (id) => {
    const tree = TREE_PRESETS.find((p) => p.id === id).create();
    const html = render({ mode: 'tree', tree });
    expect(html).toContain('data-ml-ps-tree-diagram');
    expect(html).toContain('data-ml-ps-tree-valid="true"');
    expect(html).not.toMatch(/NaN|Infinity|undefined/);
    expect([...missing]).toEqual([]);
  });

  it('arbre faux : « غير محسوبة », marqueur « ! »', () => {
    const tree = setProbability(TREE_PRESETS[2].create(), [0, 0], '3/4');
    const html = render({ mode: 'tree', tree });
    expect(html).toContain('data-ml-ps-tree-valid="false"');
    expect(html).toContain('data-ml-ps-tree-issue');
    expect(html).toContain('غير محسوبة');
    expect([...missing]).toEqual([]);
  });

  it.each(NORMAL_PRESETS.map((p) => p.id))('loi normale — %s', (id) => {
    const { params } = NORMAL_PRESETS.find((p) => p.id === id);
    for (const scale of ['x', 'z']) {
      const html = render({ mode: 'normal', normal: { ...params, scale } });
      expect(html).toContain(`data-ml-ps-normal-curve="${scale}"`);
      expect(html).toContain('data-ml-ps-normal-probability="pending"');
      expect(html).toContain('data-ml-ps-normal-board');
      expect(html).not.toMatch(/NaN|Infinity|undefined/);
    }
    expect([...missing]).toEqual([]);
  });

  it('un document V1 en mode série se rouvre dans la section الإحصاء الوصفي', () => {
    const html = render(normalizeProbabilityStatsData({ mode: 'dataset', dataset: '10, 20, 30' }));
    expect(html).toContain('data-ml-ps-section="dataset"');
    expect(html).toContain('10, 20, 30');
  });
});

/**
 * LE DÉROULÉ (exigence 2026-09-30) : avant « ابدأ الحل », le résultat du calcul
 * n'est nulle part dans le DOM (ni au tableau, ni sur le dessin, ni dans un
 * attribut) ; une fois tous les pas révélés, il y est.
 */
/** Le texte visible (KaTeX découpe « 16{,}1 » en plusieurs balises). */
const visible = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');

describe('aucune réponse avant le dernier pas', () => {
  it('arbre — chemin R₁ ∩ B₂ : ni 3/10 au tableau, ni « P = 3/10 » à la feuille, ni dans le tableau des chemins', () => {
    const tree = setQuery(TREE_PRESETS.find((p) => p.id === 'urn').create(), { kind: 'path', path: [0, 1] });
    const before = render({ mode: 'tree', tree });
    expect(before).toContain('data-ml-ps-tree-board="ready"');
    expect(before).toContain('data-ml-ps-tree-step-player="ready"');
    expect(before).not.toContain('P = 3/10');
    expect(before).not.toContain('data-ml-ps-tree-leaf-state="written"');
    expect(before).toContain('data-ml-ps-tree-row-pending');
    expect(visible(before)).not.toMatch(/0,3\b|30\s?%/);
    expect(before).not.toContain('data-ml-board-frame');
    reveal.all = true;
    const after = render({ mode: 'tree', tree });
    expect(after).toContain('data-ml-ps-tree-step-player="completed"');
    expect(after).toContain('P = 3/10');
    expect(after).toContain('data-ml-ps-tree-leaf-state="written"');
    expect(after).toContain('data-ml-board-frame');
    expect(visible(after)).toMatch(/0,3\s?=\s?30\s?%/);
    expect([...missing]).toEqual([]);
  });

  it('arbre — Bayes : 19/118 seulement au dernier pas', () => {
    const tree = TREE_PRESETS.find((p) => p.id === 'medicalTest').create();
    const query = setQuery(tree, { kind: 'conditional', target: { stage: 1, label: 'M' }, given: { stage: 2, label: 'T' } });
    expect(visible(render({ mode: 'tree', tree: query }))).not.toContain('16,1');
    reveal.all = true;
    expect(visible(render({ mode: 'tree', tree: query }))).toContain('16,1');
    expect([...missing]).toEqual([]);
  });

  it('loi normale : le bandeau pose la question, sans aire ni z, puis donne la réponse au dernier pas', () => {
    const params = { ...NORMAL_PRESETS[0].params, query: 'le', scale: 'x' };
    const before = render({ mode: 'normal', normal: params });
    expect(before).toContain('data-ml-ps-normal-probability="pending"');
    expect(before).not.toContain('data-ml-ps-normal-area');
    expect(before).not.toContain('(z =');
    expect(before).not.toContain('data-ml-board-frame');
    reveal.all = true;
    const after = render({ mode: 'normal', normal: params });
    expect(after).toMatch(/data-ml-ps-normal-probability="0\.\d{6}"/);
    expect(after).toContain('data-ml-ps-normal-area');
    expect(after).toContain('(z =');
    expect([...missing]).toEqual([]);
  });
});
