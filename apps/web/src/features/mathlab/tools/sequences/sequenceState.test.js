import { describe, it, expect } from 'vitest';
import {
  SEQUENCES_SCHEMA_VERSION, createSequencesData, normalizeSequencesData,
  serializeSequencesData, createSpec, createPracticeState,
  setParameter, setCount, setCursor, stepForward, stepBackward, resetCursor,
  setProbe, toggleLayer, setView, setCobwebView, toggleCompare, applyPreset,
  applyExperimentPatch,
  MIN_COUNT, MAX_COUNT, DEFAULT_COUNT, MIN_PARAM, MAX_PARAM, MAX_PROBE,
  LAYER_KEYS, DEFAULT_LAYERS,
} from './sequenceState.js';
import { PRESETS, EXPERIMENTS } from './presets.js';
import { buildModel } from './sequenceModel.js';

/**
 * L'ÉTAT du مختبر المتتاليات : le document, sa frontière, ses transitions.
 *
 * Deux exigences du cahier des charges sont vérifiées ici plutôt que
 * relues : §48 (« do not persist unnecessary transient animation state ») et
 * §32 (rien de ce qui vient de la base n'est cru sur parole).
 */

describe('le document d’ouverture (§5h.1)', () => {
  const data = createSequencesData();

  it('ouvre sur une ARITHMÉTIQUE u₀ = 2, r = 3 — le geste du programme de 4AM', () => {
    expect(data.primary.kind).toBe('arithmetic');
    expect(data.primary.first).toBe(2);
    expect(data.primary.difference).toBe(3);
    expect(data.primary.startIndex).toBe(0);
  });

  it('montre les DIFFÉRENCES d’emblée : « الفروق المتتالية » est au programme (LP 2.1)', () => {
    expect(data.layers.differences).toBe(true);
    expect(data.layers.table).toBe(true);
    expect(data.layers.points).toBe(true);
  });

  it('ne montre RIEN de ce qui dépasse le programme : la règle appliquée une troisième fois', () => {
    // Le produit scalaire (§5f.10), le cercle trigonométrique (§5g.1), et ici
    // la toile, les points fixes, les sommes et la comparaison.
    expect(data.layers.cobweb).toBe(false);
    expect(data.layers.fixedPoints).toBe(false);
    expect(data.layers.sums).toBe(false);
    expect(data.layers.compare).toBe(false);
    expect(data.layers.evenOdd).toBe(false);
    expect(data.secondary).toBeNull();
  });

  it('ne RELIE pas les points : une suite n’existe qu’aux entiers (§18)', () => {
    expect(data.layers.connect).toBe(false);
  });

  it('donne tout de suite dix termes lisibles et un curseur sur le premier', () => {
    expect(data.count).toBe(DEFAULT_COUNT);
    expect(data.cursor).toBe(0);
    const model = buildModel(data);
    expect(model.terms.map((term) => term.value)).toEqual([2, 5, 8, 11, 14, 17, 20, 23, 26, 29]);
    expect(model.error).toBeNull();
  });

  it('a une version de format', () => {
    expect(SEQUENCES_SCHEMA_VERSION).toBe(1);
  });
});

describe('la relecture d’un document : rien n’est cru sur parole (§32)', () => {
  it('un data vide, nul ou absurde rend un document neuf', () => {
    expect(normalizeSequencesData(null).primary.kind).toBe('arithmetic');
    expect(normalizeSequencesData(undefined).count).toBe(DEFAULT_COUNT);
    expect(normalizeSequencesData('bricolé').count).toBe(DEFAULT_COUNT);
    expect(normalizeSequencesData([]).count).toBe(DEFAULT_COUNT);
  });

  it('une famille inconnue retombe sur l’arithmétique', () => {
    expect(normalizeSequencesData({ primary: { kind: 'malveillant' } }).primary.kind).toBe('arithmetic');
  });

  it('un paramètre non numérique retombe sur sa valeur de repli', () => {
    const data = normalizeSequencesData({ primary: { first: 'abc', difference: null, ratio: Number.NaN } });
    expect(Number.isFinite(data.primary.first)).toBe(true);
    expect(Number.isFinite(data.primary.difference)).toBe(true);
    expect(Number.isFinite(data.primary.ratio)).toBe(true);
  });

  it('accepte la virgule décimale d’un paramètre stocké en texte', () => {
    expect(normalizeSequencesData({ primary: { ratio: '1,5' } }).primary.ratio).toBe(1.5);
  });

  it('borne les paramètres démesurés', () => {
    const data = normalizeSequencesData({ primary: { first: 1e12, difference: -1e12 } });
    expect(data.primary.first).toBe(MAX_PARAM);
    expect(data.primary.difference).toBe(MIN_PARAM);
  });

  it('borne le nombre de termes et l’indice inspecté', () => {
    expect(normalizeSequencesData({ count: 99999 }).count).toBe(MAX_COUNT);
    expect(normalizeSequencesData({ count: 0 }).count).toBe(MIN_COUNT);
    expect(normalizeSequencesData({ probe: 1e9 }).probe).toBe(MAX_PROBE);
    expect(normalizeSequencesData({ probe: -5 }).probe).toBe(0);
  });

  it('ramène le curseur DANS les termes engendrés', () => {
    expect(normalizeSequencesData({ count: 5, cursor: 400 }).cursor).toBe(4);
    expect(normalizeSequencesData({ count: 5, cursor: -9 }).cursor).toBe(0);
    // parti de u₁, le curseur ne peut pas valoir 0
    expect(normalizeSequencesData({ primary: { startIndex: 1 }, count: 5, cursor: 0 }).cursor).toBe(1);
  });

  it('ne garde que les couches CONNUES, et complète celles qui manquent', () => {
    const data = normalizeSequencesData({ layers: { cobweb: true, inventée: true, points: 'oui' } });
    expect(data.layers.cobweb).toBe(true);
    expect(data.layers.inventée).toBeUndefined();
    // une valeur non booléenne retombe sur le défaut
    expect(data.layers.points).toBe(DEFAULT_LAYERS.points);
    expect(Object.keys(data.layers).sort()).toEqual([...LAYER_KEYS].sort());
  });

  it('refuse une fenêtre incohérente plutôt que de la garder', () => {
    expect(normalizeSequencesData({ view: { xMin: 5, xMax: 1, yMin: 0, yMax: 1 } }).view).toBeNull();
    expect(normalizeSequencesData({ view: { xMin: 0, xMax: Number.NaN, yMin: 0, yMax: 1 } }).view).toBeNull();
    expect(normalizeSequencesData({ view: { xMin: 0, xMax: 10, yMin: 0, yMax: 5 } }).view).toEqual({ xMin: 0, xMax: 10, yMin: 0, yMax: 5 });
  });

  it('une expression stockée trop longue est remplacée, pas tronquée à moitié', () => {
    const data = normalizeSequencesData({ primary: { kind: 'explicit', explicitSource: 'n'.repeat(500) } });
    expect(data.primary.explicitSource).toBe('2n + 1');
  });

  it('un préréglage inconnu ne survit pas à la relecture', () => {
    expect(normalizeSequencesData({ preset: 'jamais-vu' }).preset).toBeNull();
    expect(normalizeSequencesData({ preset: 'fibonacci' }).preset).toBe('fibonacci');
  });

  it('un document relu est STABLE : le relire deux fois ne le change plus', () => {
    const once = normalizeSequencesData({ primary: { kind: 'geometric', ratio: '2,5' }, count: 7, cursor: 3 });
    expect(normalizeSequencesData(serializeSequencesData(once))).toEqual(once);
  });
});

describe('ce qui part au serveur, et ce qui n’y va pas (§48)', () => {
  it('la question d’entraînement en cours n’est JAMAIS sérialisée — seul le score', () => {
    const data = {
      ...createSequencesData(),
      practice: {
        active: true, challenge: { kind: 'arithmeticTerm', expected: 17 }, phase: 'reveal',
        answer: '20', attempts: 3, hintsUsed: 2, solved: 4, seen: 7,
      },
    };
    const stored = serializeSequencesData(data);
    expect(stored.practice).toEqual({ solved: 4, seen: 7 });
    expect(stored.practice.challenge).toBeUndefined();
    expect(stored.practice.active).toBeUndefined();
    expect(stored.practice.answer).toBeUndefined();
  });

  it('aucun champ d’animation n’EXISTE — §48 est tenu par construction', () => {
    const stored = serializeSequencesData(createSequencesData());
    const raw = JSON.stringify(stored);
    expect(raw).not.toMatch(/playing|speed|frame|animation|direction|panelOpen|experiment/);
    expect(Object.keys(stored)).not.toContain('playing');
    expect(Object.keys(stored)).not.toContain('animation');
  });

  it('une question à moitié répondue hier ne revient pas aujourd’hui (§27)', () => {
    const reopened = normalizeSequencesData({ practice: { active: true, challenge: { expected: 1 }, solved: 2, seen: 5 } });
    expect(reopened.practice.active).toBe(false);
    expect(reopened.practice.challenge).toBeNull();
    expect(reopened.practice.solved).toBe(2);
    expect(reopened.practice.seen).toBe(5);
  });

  it('les nombres sont ARRONDIS : pas de 0,30000000000000004 en base', () => {
    const data = setParameter(createSequencesData(), 'difference', 0.1 + 0.2);
    expect(serializeSequencesData(data).primary.difference).toBe(0.3);
  });

  it('le document reste minuscule — très loin des 8 Ko accordés côté serveur', () => {
    const worst = {
      ...createSequencesData(),
      primary: createSpec({ kind: 'recurrence', ruleSource: 'x'.repeat(200), explicitSource: 'y'.repeat(200) }),
      secondary: createSpec({ kind: 'explicit', explicitSource: 'z'.repeat(200) }),
      count: MAX_COUNT,
      probe: MAX_PROBE,
      layers: Object.fromEntries(LAYER_KEYS.map((key) => [key, true])),
      view: { xMin: -1234.5678, xMax: 1234.5678, yMin: -1234.5678, yMax: 1234.5678 },
      cobwebView: { xMin: -1234.5678, xMax: 1234.5678, yMin: -1234.5678, yMax: 1234.5678 },
      practice: { ...createPracticeState(), solved: 99999, seen: 99999 },
      preset: 'fibonacci',
    };
    const bytes = new TextEncoder().encode(JSON.stringify(serializeSequencesData(worst))).length;
    expect(bytes).toBeLessThan(8000);
  });

  it('un document par défaut pèse moins d’un kilo-octet', () => {
    const bytes = new TextEncoder().encode(JSON.stringify(serializeSequencesData(createSequencesData()))).length;
    expect(bytes).toBeLessThan(1000);
  });

  it('le document ne contient AUCUNE fonction — on ne stocke pas de code (§31)', () => {
    const stored = serializeSequencesData(createSequencesData());
    const walk = (node) => {
      expect(typeof node).not.toBe('function');
      if (node && typeof node === 'object') Object.values(node).forEach(walk);
    };
    walk(stored);
  });
});

describe('les transitions : pures, et sans rendu inutile (§48)', () => {
  const data = createSequencesData();

  it('un paramètre inchangé rend le MÊME objet', () => {
    expect(setParameter(data, 'difference', 3)).toBe(data);
    expect(setParameter(data, 'kind', 'arithmetic')).toBe(data);
    expect(setCount(data, DEFAULT_COUNT)).toBe(data);
    expect(setCursor(data, 0)).toBe(data);
    expect(setProbe(data, 100)).toBe(data);
    expect(resetCursor(data)).toBe(data);
  });

  it('une clé ou une famille inconnue ne change rien', () => {
    expect(setParameter(data, 'inventé', 5)).toBe(data);
    expect(setParameter(data, 'kind', 'inventé')).toBe(data);
    expect(toggleLayer(data, 'inventée')).toBe(data);
    expect(setView(data, { xMin: 5, xMax: 1, yMin: 0, yMax: 1 })).toBe(data);
    expect(applyPreset(data, 'inventé')).toBe(data);
    expect(applyExperimentPatch(data, null)).toBe(data);
  });

  it('changer un paramètre fait TOMBER le préréglage : l’élève a reprisla main', () => {
    const withPreset = applyPreset(data, 'fibonacci');
    expect(withPreset.preset).toBe('fibonacci');
    expect(setParameter(withPreset, 'first', 5).preset).toBeNull();
  });

  it('changer de famille GARDE les réglages de l’autre (§4)', () => {
    const geometric = setParameter(setParameter(data, 'kind', 'geometric'), 'ratio', 1.5);
    const back = setParameter(geometric, 'kind', 'arithmetic');
    expect(back.primary.difference).toBe(3);
    // et en revenant au géométrique, la raison choisie est toujours là
    expect(setParameter(back, 'kind', 'geometric').primary.ratio).toBe(1.5);
  });

  it('un paramètre est borné, jamais NaN', () => {
    expect(setParameter(data, 'ratio', 1e12).primary.ratio).toBe(MAX_PARAM);
    expect(setParameter(data, 'first', 'abc').primary.first).toBe(data.primary.first);
    expect(setParameter(data, 'difference', Number.NaN).primary.difference).toBe(data.primary.difference);
  });

  it('les bascules de couches marchent dans les deux sens', () => {
    expect(toggleLayer(data, 'cobweb').layers.cobweb).toBe(true);
    expect(toggleLayer(toggleLayer(data, 'cobweb'), 'cobweb').layers.cobweb).toBe(false);
  });
});

describe('la marche pas à pas (§6, §7)', () => {
  it('« terme suivant » avance le curseur', () => {
    const data = createSequencesData();
    expect(stepForward(data).cursor).toBe(1);
    expect(stepForward(stepForward(data)).cursor).toBe(2);
  });

  it('au bout des termes engendrés, avancer en ENGENDRE un de plus (§7)', () => {
    const data = { ...createSequencesData(), cursor: 9 };   // dernier des dix
    const next = stepForward(data);
    expect(next.count).toBe(11);
    expect(next.cursor).toBe(10);
  });

  it('avancer ne dépasse jamais le plafond de termes', () => {
    const data = { ...createSequencesData(), count: MAX_COUNT, cursor: MAX_COUNT - 1 };
    expect(stepForward(data)).toBe(data);
  });

  it('reculer s’arrête au premier terme et ne RETIRE aucun terme', () => {
    const data = { ...createSequencesData(), cursor: 1, count: 10 };
    expect(stepBackward(data).cursor).toBe(0);
    expect(stepBackward(stepBackward(data)).cursor).toBe(0);
    expect(stepBackward(data).count).toBe(10);
  });

  it('le curseur suit l’indice de départ', () => {
    const fromOne = setParameter(createSequencesData(), 'startIndex', 1);
    expect(fromOne.cursor).toBe(1);
    expect(stepBackward(fromOne).cursor).toBe(1);
    expect(resetCursor({ ...fromOne, cursor: 4 }).cursor).toBe(1);
  });

  it('réduire le nombre de termes ramène le curseur dans ce qui reste', () => {
    const data = { ...createSequencesData(), cursor: 8 };
    expect(setCount(data, 4).cursor).toBe(3);
  });
});

describe('la comparaison (§33)', () => {
  it('s’ouvre sur une suite VOISINE, pas identique — sinon il n’y aurait rien à voir', () => {
    const data = toggleCompare(createSequencesData());
    expect(data.secondary).not.toBeNull();
    expect(data.layers.compare).toBe(true);
    // arithmétique : on renverse la différence, donc la comparaison montre
    // immédiatement une suite qui monte contre une qui descend
    expect(data.secondary.difference).toBe(-3);
    const model = buildModel(data);
    expect(model.secondaryTerms).toHaveLength(data.count);
    expect(model.secondaryTerms[1].value).not.toBe(model.terms[1].value);
  });

  it('sur une géométrique, elle décale la raison', () => {
    const geometric = setParameter(createSequencesData(), 'kind', 'geometric');
    expect(toggleCompare(geometric).secondary.ratio).toBe(geometric.primary.ratio / 2);
  });

  it('se referme et éteint sa couche', () => {
    const closed = toggleCompare(toggleCompare(createSequencesData()));
    expect(closed.secondary).toBeNull();
    expect(closed.layers.compare).toBe(false);
  });

  it('la suite comparée se règle sans toucher à l’étudiée', () => {
    const data = toggleCompare(createSequencesData());
    const changed = setParameter(data, 'difference', 7, 'secondary');
    expect(changed.secondary.difference).toBe(7);
    expect(changed.primary.difference).toBe(3);
  });
});

describe('les préréglages et les expériences (§26, §39)', () => {
  it('chaque préréglage POSE un espace qui engendre des termes', () => {
    for (const preset of PRESETS) {
      const data = applyPreset(createSequencesData(), preset.id);
      const model = buildModel(data);
      expect(model.error, preset.id).toBeNull();
      expect(model.terms.length, preset.id).toBeGreaterThan(1);
      expect(data.preset, preset.id).toBe(preset.id);
      // le curseur est remis au début : on montre la suite depuis son départ
      expect(data.cursor, preset.id).toBe(data.primary.startIndex);
    }
  });

  it('un préréglage garde toujours le repère : il ne laisse pas un écran vide', () => {
    for (const preset of PRESETS) {
      const data = applyPreset(createSequencesData(), preset.id);
      expect(data.layers.points, preset.id).toBe(true);
      expect(data.layers.grid, preset.id).toBe(true);
    }
  });

  it('un préréglage survit à un aller-retour en base', () => {
    for (const preset of PRESETS) {
      const data = applyPreset(createSequencesData(), preset.id);
      const back = normalizeSequencesData(serializeSequencesData(data));
      expect(back.preset, preset.id).toBe(preset.id);
      expect(back.primary.kind, preset.id).toBe(data.primary.kind);
    }
  });

  it('chaque expérience pose un espace exploitable et porte une QUESTION sans réponse', () => {
    for (const experiment of EXPERIMENTS) {
      const data = applyExperimentPatch(createSequencesData(), experiment);
      const model = buildModel(data);
      expect(model.error, experiment.id).toBeNull();
      expect(model.terms.length, experiment.id).toBeGreaterThan(1);
      expect(typeof experiment.questionKey, experiment.id).toBe('string');
      expect(experiment.steps.length, experiment.id).toBeGreaterThan(0);
      // Aucune expérience ne porte de réponse : on pose et on se taît (§26)
      expect(experiment.expected, experiment.id).toBeUndefined();
      expect(experiment.answer, experiment.id).toBeUndefined();
      // et elle nomme le paramètre à tirer
      expect(typeof experiment.focus, experiment.id).toBe('string');
    }
  });

  it('une expérience ne marque PAS de préréglage : ce n’est pas la même chose', () => {
    const data = applyExperimentPatch(applyPreset(createSequencesData(), 'fibonacci'), EXPERIMENTS[0]);
    expect(data.preset).toBeNull();
  });

  it('les identifiants de préréglages et d’expériences sont uniques', () => {
    const presetIds = PRESETS.map((preset) => preset.id);
    const experimentIds = EXPERIMENTS.map((experiment) => experiment.id);
    expect(new Set(presetIds).size).toBe(presetIds.length);
    expect(new Set(experimentIds).size).toBe(experimentIds.length);
  });
});

describe('l’amorce d’une leçon (openMathLab)', () => {
  it('une amorce illisible ne casse rien', () => {
    expect(createSequencesData('n’importe quoi').primary.kind).toBe('arithmetic');
    expect(createSequencesData(42).count).toBe(DEFAULT_COUNT);
    expect(createSequencesData([]).count).toBe(DEFAULT_COUNT);
  });

  it('une amorce pose la suite demandée', () => {
    const data = createSequencesData({ primary: { kind: 'geometric', first: 3, ratio: 2 }, count: 6 });
    expect(data.primary.kind).toBe('geometric');
    expect(data.primary.ratio).toBe(2);
    expect(data.count).toBe(6);
    expect(buildModel(data).terms.map((term) => term.value)).toEqual([3, 6, 12, 24, 48, 96]);
  });

  it('une amorce peut nommer un préréglage', () => {
    const data = createSequencesData({ preset: 'fibonacci' });
    expect(data.preset).toBe('fibonacci');
    expect(buildModel(data).terms.slice(0, 5).map((term) => term.value)).toEqual([0, 1, 1, 2, 3]);
  });

  it('une amorce peut allumer une couche', () => {
    expect(createSequencesData({ layers: { cobweb: true } }).layers.cobweb).toBe(true);
  });

  it('une amorce est BORNÉE comme le reste', () => {
    expect(createSequencesData({ count: 99999 }).count).toBe(MAX_COUNT);
    expect(createSequencesData({ primary: { first: 1e15 } }).primary.first).toBe(MAX_PARAM);
  });
});

describe('les fenêtres (§19)', () => {
  it('se posent et se relisent', () => {
    const view = { xMin: -1, xMax: 11, yMin: -2, yMax: 32 };
    expect(setView(createSequencesData(), view).view).toEqual(view);
    expect(setCobwebView(createSequencesData(), view).cobwebView).toEqual(view);
  });

  it('sont arrondies en base', () => {
    const data = setView(createSequencesData(), { xMin: 0.123456789, xMax: 10, yMin: 0, yMax: 1 });
    expect(serializeSequencesData(data).view.xMin).toBe(0.1235);
  });
});
