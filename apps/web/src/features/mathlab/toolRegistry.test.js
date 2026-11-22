import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { MATH_LAB_TOOLS, PLANNED_MATH_LAB_TOOLS, getMathLabTool, getMathLabToolBySlug } from './toolRegistry.js';
import { defineMathLabTool } from './toolContract.js';
import { WORK_SORTS, WORK_PERIODS } from './work/workFilters.js';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Le registre du مختبر : chaque instrument respecte le contrat, aucun n'en
 * cache un autre, et le serveur connaît exactement les mêmes identifiants.
 */
describe('registre des instruments', () => {
  it('ne contient que des définitions complètes et figées', () => {
    for (const tool of MATH_LAB_TOOLS) {
      expect(Object.isFrozen(tool)).toBe(true);
      expect(() => defineMathLabTool(tool)).not.toThrow();
    }
  });

  it('a des identifiants et des segments d’URL uniques', () => {
    const ids = MATH_LAB_TOOLS.map((t) => t.id);
    const slugs = MATH_LAB_TOOLS.map((t) => t.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('expose la سبّورة sous /espace/atelier/tableau, le grapheur sous /espace/atelier/grapheur, la géométrie 3D sous /espace/atelier/geometrie-3d', () => {
    expect(getMathLabTool('whiteboard')?.slug).toBe('tableau');
    expect(getMathLabToolBySlug('tableau')?.id).toBe('whiteboard');
    expect(getMathLabTool('functionGrapher')?.slug).toBe('grapheur');
    expect(getMathLabToolBySlug('grapheur')?.id).toBe('functionGrapher');
    expect(getMathLabTool('geometry3d')?.slug).toBe('geometrie-3d');
    expect(getMathLabToolBySlug('geometrie-3d')?.id).toBe('geometry3d');
    expect(getMathLabTool('probabilityStats')?.slug).toBe('probabilites-statistiques');
    expect(getMathLabToolBySlug('probabilites-statistiques')?.id).toBe('probabilityStats');
    expect(getMathLabTool('algebra')?.slug).toBe('algebre');
    expect(getMathLabToolBySlug('algebre')?.id).toBe('algebra');
    // Un alias ouvre le même instrument ; le segment canonique ne change pas.
    expect(getMathLabToolBySlug('nombres-calcul')?.id).toBe('numberLab');
    expect(getMathLabToolBySlug('nombres')?.id).toBe('numberLab');
    expect(getMathLabTool('vectors')?.slug).toBe('vecteurs');
    expect(getMathLabToolBySlug('vecteurs')?.id).toBe('vectors');
    expect(getMathLabTool('trigonometry')?.slug).toBe('trigonometrie');
    expect(getMathLabToolBySlug('trigonometrie')?.id).toBe('trigonometry');
    expect(getMathLabTool('sequences')?.slug).toBe('suites');
    expect(getMathLabToolBySlug('suites')?.id).toBe('sequences');
    expect(getMathLabTool('transformations')?.slug).toBe('transformations');
    expect(getMathLabToolBySlug('transformations')?.id).toBe('transformations');
    expect(getMathLabToolBySlug('inconnu')).toBeNull();
    expect(getMathLabTool('graph')).toBeNull();
  });

  // Un instrument construit ne doit pas rester annoncé « قريبًا » : le
  // laboratoire des probabilités et statistiques livre à lui seul ce que
  // « الإحصاء » et « الاحتمالات » promettaient, donc les deux ont quitté
  // la liste des instruments à venir.
  it('n’annonce plus ce qui est livré', () => {
    const plannedIds = PLANNED_MATH_LAB_TOOLS.map((tool) => tool.id);
    expect(plannedIds).not.toContain('statistics');
    expect(plannedIds).not.toContain('probability');
    expect(plannedIds).not.toContain('probabilityStats');
    expect(plannedIds).not.toContain('algebra');
    // Le مختبر الأشعة est livré : « الأشعة » a quitté les instruments annoncés.
    expect(plannedIds).not.toContain('vectors');
    // Le مختبر المثلثات a livré ce que « الدائرة المثلثية » promettait.
    expect(plannedIds).not.toContain('trigonometry');
    // Le مختبر المتتاليات est livré : il n'a jamais été annoncé, et il ne
    // remplaçait PAS « المستقيم المدرّج » — placer et comparer des nombres
    // quelconques n'est pas manipuler des suites. C'est le مختبر الأعداد qui
    // a fini par le livrer (ci-dessous).
    expect(plannedIds).not.toContain('sequences');
    // Le مختبر التحويلات a livré ce que « الهندسة » promettait : un plan où
    // l'on construit des figures et où on les transforme. Le chip a donc
    // quitté la liste des instruments à venir.
    expect(plannedIds).not.toContain('geometry');
    expect(plannedIds).not.toContain('transformations');
    // Le مختبر الأعداد a livré ce que « المستقيم المدرّج » promettait — placer,
    // comparer et ordonner des nombres, des fractions et des décimaux sur une
    // droite — mais comme UN mode parmi treize : une droite graduée seule
    // aurait tenu la promesse trop petitement. Le chip a donc quitté la liste.
    expect(plannedIds).not.toContain('numberLine');
    expect(plannedIds).not.toContain('numberLab');
    // Le مختبر القياس est livré : mesurer des grandeurs (longueurs, aires,
    // volumes, unités) est bien un instrument à part, et c'est le
    // quatorzième. « القياس » a donc quitté la liste des instruments à venir.
    expect(plannedIds).not.toContain('measurement');
  });

  it('les instruments annoncés ne sont pas des instruments : ni composant, ni route', () => {
    const active = new Set(MATH_LAB_TOOLS.map((t) => t.id));
    for (const planned of PLANNED_MATH_LAB_TOOLS) {
      expect(active.has(planned.id)).toBe(false);
      expect(planned.labelKey).toMatch(/^tools\.\w+\.name$/);
      expect(planned.icon).toBeTruthy();
      expect(planned.load).toBeUndefined();
      expect(planned.slug).toBeUndefined();
    }
  });

  /**
   * « أعمالي » dessine l'aperçu d'un travail à partir du seul RÉSUMÉ que son
   * instrument a laissé. Un instrument qui n'en produit pas n'est pas en
   * faute — sa carte a un repli — mais les huit livrés le font, et un
   * neuvième doit y penser plutôt que le découvrir en production.
   */
  it('chaque instrument sait résumer son document pour « أعمالي »', () => {
    for (const tool of MATH_LAB_TOOLS) {
      expect(typeof tool.summarize, `${tool.id} n’a pas de summarize`).toBe('function');
    }
  });

  it('le registre serveur (MathLabTools.php) connaît exactement les mêmes identifiants', () => {
    const php = readFileSync(resolve(here, '../../../../api/app/Domain/MathLab/MathLabTools.php'), 'utf8');
    const serverIds = [...php.matchAll(/^\s*'([a-zA-Z0-9]+)'\s*=>\s*\['maxBytes'/gm)].map((m) => m[1]).sort();
    const clientIds = MATH_LAB_TOOLS.map((t) => t.id).sort();
    expect(serverIds).toEqual(clientIds);
  });

  it('chaque libellé du registre existe dans le catalogue arabe', () => {
    const catalog = JSON.parse(readFileSync(resolve(here, '../../i18n/locales/ar/mathlab.json'), 'utf8'));
    const lookup = (key) => key.split('.').reduce((node, part) => node?.[part], catalog);
    for (const tool of MATH_LAB_TOOLS) {
      for (const key of [tool.labelKey, tool.descriptionKey, tool.newLabelKey, tool.defaultTitleKey]) {
        expect(typeof lookup(key), key).toBe('string');
      }
    }
    for (const planned of PLANNED_MATH_LAB_TOOLS) {
      expect(typeof lookup(planned.labelKey), planned.labelKey).toBe('string');
    }
  });
});

describe('defineMathLabTool', () => {
  const valid = {
    id: 'demo', slug: 'demo', labelKey: 'a', descriptionKey: 'b', newLabelKey: 'c', defaultTitleKey: 'd',
    icon: () => null, schemaVersion: 1, createInitialData: () => ({}), load: () => Promise.resolve({ default: () => null }),
    scopes: 'common',
  };

  it('refuse une définition incomplète, au chargement et non au premier clic', () => {
    expect(() => defineMathLabTool({ ...valid, load: undefined })).toThrow(/load/);
    expect(() => defineMathLabTool({ ...valid, id: 'Bad-Id' })).toThrow(/identifiant/);
    expect(() => defineMathLabTool({ ...valid, slug: 'Tableau' })).toThrow(/URL/);
    expect(() => defineMathLabTool({ ...valid, schemaVersion: 0 })).toThrow(/schemaVersion/);
    expect(() => defineMathLabTool({ ...valid, summarize: 'pas une fonction' })).toThrow(/summarize/);
  });

  it('exige que l’instrument dise dans quel مخبر il vit (labScope.js)', () => {
    expect(() => defineMathLabTool({ ...valid, scopes: undefined })).toThrow(/scopes/);
    expect(() => defineMathLabTool({ ...valid, scopes: [] })).toThrow(/scopes/);
    expect(() => defineMathLabTool({ ...valid, scopes: ['college'] })).toThrow(/scopes/);
    expect(() => defineMathLabTool({ ...valid, scopes: ['moyen', 'moyen'] })).toThrow(/scopes/);
    // Un instrument commun n'a pas de capacités à déclarer…
    expect(() => defineMathLabTool({ ...valid, capabilities: { moyen: null } })).toThrow(/commun/);
    // …et un instrument ne déclare de capacités QUE pour ses مخابر.
    expect(() => defineMathLabTool({ ...valid, scopes: ['moyen'], capabilities: { secondaire: null } })).toThrow(/secondaire/);
    expect(() => defineMathLabTool({ ...valid, scopes: ['moyen', 'secondaire'], capabilities: { moyen: { tangent: false }, secondaire: null } })).not.toThrow();
  });

  it('`summarize` reste FACULTATIF : un instrument sans résumé se définit encore', () => {
    expect(() => defineMathLabTool({ ...valid, summarize: undefined })).not.toThrow();
  });

  it('fige la définition', () => {
    const tool = defineMathLabTool(valid);
    expect(Object.isFrozen(tool)).toBe(true);
    expect(tool.id).toBe('demo');
  });
});

/**
 * Le catalogue arabe de « أعمالي » : chaque clé que l'atelier demande doit
 * exister. Une clé manquante s'affiche à l'élève telle quelle
 * (« work.bulk.delete ») — c'est un défaut visible, et c'est ici qu'on
 * l'attrape.
 */
describe('les mots de « أعمالي »', () => {
  const REQUIRED = [
    'work.newWork', 'work.searchPlaceholder', 'work.searchAria', 'work.clearSearch',
    'work.countFiltered', 'work.sortLabel', 'work.viewLabel', 'work.viewGrid', 'work.viewList', 'work.copyPrefix',
    'work.filters.title', 'work.filters.active', 'work.filters.clearAll', 'work.filters.reset',
    'work.filters.toolLegend', 'work.filters.allTools', 'work.filters.periodLegend', 'work.filters.otherLegend', 'work.filters.favorites',
    'work.card.select', 'work.card.menu', 'work.card.open', 'work.card.rename', 'work.card.duplicate',
    'work.card.favorite', 'work.card.unfavorite', 'work.card.delete', 'work.card.modified', 'work.card.unknownTool',
    'work.bulk.selectAll', 'work.bulk.deselectAll', 'work.bulk.favorite', 'work.bulk.unfavorite', 'work.bulk.delete',
    'work.deleteMany.title', 'work.deleteMany.body',
    'work.rename.title', 'work.rename.label', 'work.rename.placeholder', 'work.rename.confirm',
    'work.empty.title', 'work.empty.body',
    'work.noResults.title', 'work.noResults.body', 'work.noResults.reset',
    'work.errors.rename', 'work.errors.duplicate', 'work.errors.favorite', 'work.errors.delete',
  ];

  const catalog = JSON.parse(readFileSync(resolve(here, '../../i18n/locales/ar/mathlab.json'), 'utf8'));
  const lookup = (key) => key.split('.').reduce((node, part) => node?.[part], catalog);

  it('chaque libellé de l’atelier existe en arabe', () => {
    for (const key of REQUIRED) {
      expect(typeof lookup(key), key).toBe('string');
    }
  });

  it('chaque tri et chaque période a son mot', () => {
    for (const sort of WORK_SORTS) expect(typeof lookup(`work.sorts.${sort}`), sort).toBe('string');
    for (const period of WORK_PERIODS) expect(typeof lookup(`work.filters.periods.${period}`), period).toBe('string');
  });

  /**
   * L'arabe compte en six formes (zéro, un, deux, quelques, beaucoup,
   * autre). i18next les choisit par SUFFIXE : une forme manquante fait
   * retomber sur `_other`, et « عملان » devient « 2 عمل ».
   */
  it('les compteurs portent les six formes du pluriel arabe', () => {
    for (const base of ['work.count', 'work.bulk.selected']) {
      for (const form of ['one', 'two', 'few', 'many', 'other']) {
        expect(typeof lookup(`${base}_${form}`), `${base}_${form}`).toBe('string');
      }
    }
  });
});

describe('segments d\'URL', () => {
  it('aucun segment ni alias n\'ouvre deux instruments', () => {
    const seen = new Map();
    for (const tool of MATH_LAB_TOOLS) {
      for (const segment of [tool.slug, ...(tool.aliases ?? [])]) {
        expect(seen.has(segment), `« ${segment} » est pris par ${seen.get(segment)} et ${tool.id}`).toBe(false);
        seen.set(segment, tool.id);
      }
    }
  });
});
