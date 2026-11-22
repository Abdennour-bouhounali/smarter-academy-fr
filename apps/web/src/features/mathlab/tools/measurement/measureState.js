/**
 * L'ÉTAT de « Grandeurs et mesures » — logique pure, sans React.
 *
 *     data = {
 *       investigation: 'rectangle-area',
 *       objects:  { <enquête>: {params} },      // chaque enquête garde SON objet
 *       records:  { <enquête>: {observations, rule, stage, hintsUsed, tests} },
 *       precision: 0 | 0.1 | 0.01,
 *       settings: { grid, units, labels, showExplanation },
 *     }
 *
 * ── Pourquoi chaque enquête garde son propre objet ───────────────────────
 * C'est le choix de numberLab (§3 de son cahier) et il vaut ici pour la même
 * raison : un élève qui règle un rectangle 7 × 4, part mesurer un triangle,
 * et revient, doit retrouver SON rectangle et SES quatre observations. Les
 * enquêtes ne se marchent pas dessus.
 *
 * ── Ce qui n'est PAS persisté ────────────────────────────────────────────
 *   | état MATHÉMATIQUE (data)        | état d'INTERFACE (local)          |
 *   |---------------------------------|-----------------------------------|
 *   | l'objet, ses dimensions         | la poignée saisie, le glissement  |
 *   | les observations, la règle      | l'onglet ouvert, le tiroir        |
 *   | l'étape, les indices consommés  | l'animation des secteurs          |
 *   | les essais sur objets inconnus  | le message d'annonce              |
 *
 * L'animation n'a AUCUN champ dans `data` : elle ne peut donc pas y arriver
 * par accident, et rouvrir un document ne rejoue pas un découpage à moitié
 * fait (la règle de l'atelier, MATH_LAB §5l.10).
 */

import {
  INVESTIGATIONS, INVESTIGATION_IDS, DEFAULT_INVESTIGATION, getInvestigation,
  initialParams, measureAll, matchesSolution, parameterGrid,
} from './investigations.js';
import { normalizeRule, isComplete, testRule } from './ruleEngine.js';
import { clamp, cleanNumber } from './measureMath.js';

export const MEASUREMENT_SCHEMA_VERSION = 1;

/**
 * Le nombre d'observations qu'un tableau garde.
 *
 * Vingt suffisent très largement à faire apparaître une relation, et c'est
 * ce plafond qui borne la taille du document côté serveur
 * (MathLabTools.php) ; `measureState.test.js` tient cette borne.
 */
export const MAX_OBSERVATIONS = 20;

/** Les essais gardés sur des objets non choisis par l'élève (§20). */
export const MAX_TESTS = 10;

/** Les étapes de la découverte (§21 : l'observation n'est pas la preuve). */
const STAGES = Object.freeze(['exploring', 'conjecturing', 'testing', 'found', 'explained']);

/** Les graduations proposées (§27) : exact, au dixième, au centième. */
export const PRECISIONS = Object.freeze([0, 0.1, 0.01]);

const DEFAULT_SETTINGS = Object.freeze({
  grid: true,
  labels: true,
  showExplanation: false,
});

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

let idCounter = 0;
function newId() {
  idCounter += 1;

  return `o-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

// ── La relecture d'un document ───────────────────────────────────────────

function normalizeParams(investigation, raw) {
  const params = initialParams(investigation);
  if (!isPlainObject(raw)) return params;
  for (const entry of investigation.params) {
    const value = Number(raw[entry.key]);
    if (!Number.isFinite(value)) continue;
    // Le pas de l'enquête est respecté : un document trafiqué ne pose pas un
    // rectangle de largeur 2,7 là où l'instrument n'offre que des entiers.
    const snapped = Math.round(value / entry.step) * entry.step;
    params[entry.key] = cleanNumber(clamp(snapped, entry.min, entry.max));
  }

  return params;
}

function normalizeObservation(raw, investigation) {
  if (!isPlainObject(raw)) return null;
  const values = {};
  let count = 0;
  for (const entry of investigation.quantities) {
    const value = Number(raw.values?.[entry.key]);
    if (Number.isFinite(value)) {
      values[entry.key] = cleanNumber(value);
      count += 1;
    }
  }
  if (count === 0) return null;

  return {
    id: typeof raw.id === 'string' && raw.id.length <= 64 ? raw.id : newId(),
    values,
  };
}

function normalizeRecord(raw, investigation) {
  const source = isPlainObject(raw) ? raw : {};
  const observations = (Array.isArray(source.observations) ? source.observations : [])
    .map((entry) => normalizeObservation(entry, investigation))
    .filter(Boolean)
    .slice(0, MAX_OBSERVATIONS);
  const rule = normalizeRule(source.rule);
  const stage = STAGES.includes(source.stage) ? source.stage : 'exploring';
  const tests = (Array.isArray(source.tests) ? source.tests : [])
    .map((entry) => normalizeObservation(entry, investigation))
    .filter(Boolean)
    .slice(0, MAX_TESTS);

  return {
    observations,
    rule,
    stage: reconcileStage(stage, observations, rule, tests, investigation),
    hintsUsed: Math.max(0, Math.min(investigation.hintCount, Math.round(Number(source.hintsUsed) || 0))),
    tests,
  };
}

/**
 * L'étape RELUE ne peut pas être plus avancée que ce que les données
 * justifient.
 *
 * Un document dont le champ `stage` dit « found » mais qui n'a ni règle ni
 * observations retombe à « exploring » : l'instrument ne félicite jamais
 * une découverte qu'il ne peut pas constater. C'est la même prudence que
 * §25 côté vivant, appliquée à la frontière du JSON.
 */
function reconcileStage(stage, observations, rule, tests, investigation) {
  const solved = rule && matchesSolution(investigation, rule);
  if ((stage === 'found' || stage === 'explained') && !solved) {
    return observations.length > 0 ? 'conjecturing' : 'exploring';
  }
  if (stage === 'testing' && !isComplete(rule)) {
    return observations.length > 0 ? 'conjecturing' : 'exploring';
  }
  if (stage === 'conjecturing' && observations.length === 0) return 'exploring';

  return stage;
}

/** L'état complet relu depuis un document stocké. */
export function normalizeMeasurementData(raw) {
  const source = isPlainObject(raw) ? raw : {};
  const investigation = INVESTIGATION_IDS.includes(source.investigation)
    ? source.investigation
    : DEFAULT_INVESTIGATION;

  const objects = {};
  const records = {};
  for (const entry of INVESTIGATIONS) {
    objects[entry.id] = normalizeParams(entry, source.objects?.[entry.id]);
    records[entry.id] = normalizeRecord(source.records?.[entry.id], entry);
  }

  const precision = PRECISIONS.includes(Number(source.precision)) ? Number(source.precision) : 0;

  return {
    investigation,
    objects,
    records,
    precision,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(isPlainObject(source.settings)
        ? {
          grid: source.settings.grid !== false,
          labels: source.settings.labels !== false,
          showExplanation: source.settings.showExplanation === true,
        }
        : {}),
    },
  };
}

/** Ce qu'on envoie à la coquille : du JSON simple, rien d'autre. */
export function serializeMeasurementData(data) {
  return normalizeMeasurementData(data);
}

/** Un document neuf, éventuellement amorcé par une leçon (openMathLab.js). */
export function createMeasurementData(seed = undefined) {
  const base = normalizeMeasurementData(isPlainObject(seed) ? seed : {});
  // Une leçon peut demander une enquête précise : {investigation: 'triangle-area'}
  if (isPlainObject(seed) && INVESTIGATION_IDS.includes(seed.investigation)) {
    base.investigation = seed.investigation;
  }

  return base;
}

// ── Les lectures ─────────────────────────────────────────────────────────

const currentInvestigation = (data) => getInvestigation(data?.investigation) ?? getInvestigation(DEFAULT_INVESTIGATION);
export const currentParams = (data) => data?.objects?.[data?.investigation] ?? {};
export const currentRecord = (data) => data?.records?.[data?.investigation] ?? null;

// ── Les gestes ───────────────────────────────────────────────────────────

/** Changer d'enquête — l'objet et les observations de l'autre restent intacts. */
export function selectInvestigation(data, id) {
  if (!INVESTIGATION_IDS.includes(id) || data.investigation === id) return data;

  return { ...data, investigation: id };
}

/** Régler une dimension de l'objet courant (une poignée, un curseur, une flèche). */
export function setParam(data, key, value) {
  const investigation = currentInvestigation(data);
  const entry = investigation.params.find((p) => p.key === key);
  if (!entry) return data;
  const snapped = Math.round(Number(value) / entry.step) * entry.step;
  const next = cleanNumber(clamp(snapped, entry.min, entry.max));
  const params = currentParams(data);
  if (params[key] === next) return data;

  return {
    ...data,
    objects: { ...data.objects, [investigation.id]: { ...params, [key]: next } },
  };
}

/**
 * ENREGISTRER l'objet courant dans le tableau (§18).
 *
 * Une observation déjà présente n'est pas ajoutée deux fois : mesurer trois
 * fois le même rectangle ne fait pas trois preuves (§25), et le tableau
 * garderait des lignes identiques qui n'apprennent rien. On rend l'état
 * inchangé, et l'interface le dit à l'élève.
 */
export function recordObservation(data) {
  const investigation = currentInvestigation(data);
  const record = currentRecord(data);
  const values = measureAll(investigation, currentParams(data), data.precision);

  if (record.observations.some((row) => sameValues(row.values, values))) return data;

  const observations = [...record.observations, { id: newId(), values }].slice(-MAX_OBSERVATIONS);

  return patchRecord(data, {
    observations,
    // Une première mesure fait passer de « j'explore » à « je peux comparer ».
    stage: record.stage === 'exploring' && observations.length >= 2 ? 'conjecturing' : record.stage,
  });
}

/** Deux jeux de mesures identiques ? (à la poussière de flottant près) */
function sameValues(a, b) {
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  for (const key of keys) {
    const left = a?.[key];
    const right = b?.[key];
    if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
    if (Math.abs(left - right) > 1e-9) return false;
  }

  return true;
}

export function removeObservation(data, id) {
  const record = currentRecord(data);
  const observations = record.observations.filter((row) => row.id !== id);
  if (observations.length === record.observations.length) return data;

  return patchRecord(data, { observations });
}

export function clearObservations(data) {
  const record = currentRecord(data);
  if (record.observations.length === 0) return data;

  return patchRecord(data, { observations: [], tests: [], stage: 'exploring' });
}

/** Poser (ou modifier) la règle conjecturée. */
export function setRule(data, rule) {
  const normalized = rule == null ? null : normalizeRule(rule);
  const record = currentRecord(data);
  const stage = record.stage === 'found' || record.stage === 'explained'
    ? record.stage
    : (isComplete(normalized) ? 'testing' : 'conjecturing');

  return patchRecord(data, { rule: normalized, stage });
}

/** Consommer un indice (§24) — l'instrument se souvient combien ont servi. */
export function useHint(data) {
  const investigation = currentInvestigation(data);
  const record = currentRecord(data);
  if (record.hintsUsed >= investigation.hintCount) return data;

  return patchRecord(data, { hintsUsed: record.hintsUsed + 1 });
}

/**
 * Éprouver la règle sur un objet que l'élève n'a PAS choisi (§20, §25).
 *
 * L'objet d'épreuve est tiré d'une suite DÉTERMINISTE (aucun `Math.random`
 * dans cet instrument : deux élèves sur le même état voient le même objet,
 * et un test qui échoue est reproductible). Il est choisi hors des
 * observations déjà faites, sinon l'épreuve ne prouverait rien de neuf.
 */
export function runUnseenTest(data) {
  const investigation = currentInvestigation(data);
  const record = currentRecord(data);
  if (!isComplete(record.rule)) return data;

  const params = unseenParams(investigation, record, data.precision);
  /**
   * Plus AUCUN objet jamais vu : l'élève a déjà mesuré toute la grille (les
   * quatre crans des conversions, par exemple). On n'invente pas d'épreuve
   * sur un objet déjà mesuré — elle ne prouverait rien. La règle a alors
   * été confrontée à TOUS les objets possibles, et `evaluateEvidence` le
   * compte comme une épreuve (`exhaustive`).
   */
  const tests = params === null
    ? record.tests
    : [...record.tests, { id: newId(), values: measureAll(investigation, params, data.precision) }].slice(-MAX_TESTS);

  const evidence = evaluateEvidence({ ...data, records: { ...data.records, [investigation.id]: { ...record, tests } } });
  const stage = evidence.satisfied && matchesSolution(investigation, record.rule) ? 'found' : record.stage;

  return patchRecord(data, { tests, stage });
}

/**
 * Un objet d'épreuve que l'élève n'a pas encore mesuré.
 *
 * On balaie les dimensions par pas croissants depuis un décalage qui dépend
 * du nombre d'essais déjà faits — donc sans hasard, et sans jamais retomber
 * indéfiniment sur la même configuration.
 */
const GRID_SCAN_LIMIT = 5000;

/**
 * L'élève a-t-il mesuré TOUS les objets possibles de l'enquête ? Alors une
 * règle qui tient sur ses observations a été éprouvée partout.
 */
function coversWholeGrid(investigation, observations, precision) {
  const grid = parameterGrid(investigation, GRID_SCAN_LIMIT);
  if (!grid || grid.length === 0 || observations.length < grid.length) return false;

  return grid.every((params) => {
    const values = measureAll(investigation, params, precision);

    return observations.some((row) => sameValues(row.values, values));
  });
}

/** @returns {object|null} des dimensions jamais mesurées, ou null s'il n'en reste aucune. */
export function unseenParams(investigation, record, precision = 0) {
  const seen = [...record.observations, ...record.tests];
  const attempts = seen.length;

  for (let offset = 1; offset <= 40; offset += 1) {
    const params = {};
    investigation.params.forEach((entry, index) => {
      const span = Math.max(1, Math.round((entry.max - entry.min) / entry.step));
      const position = (attempts * (index + 2) + offset * (index + 1)) % (span + 1);
      params[entry.key] = cleanNumber(clamp(entry.min + position * entry.step, entry.min, entry.max));
    });
    const values = measureAll(investigation, params, precision);
    if (!seen.some((row) => sameValues(row.values, values))) return params;
  }

  // Le balayage n'a rien trouvé : on parcourt toute la grille, quand elle est
  // parcourable. Si TOUT a déjà été vu, il n'existe plus d'objet d'épreuve.
  const grid = parameterGrid(investigation, GRID_SCAN_LIMIT);
  if (grid) {
    const fresh = grid.find((params) => {
      const values = measureAll(investigation, params, precision);

      return !seen.some((row) => sameValues(row.values, values));
    });

    return fresh ?? null;
  }

  // Filet : les dimensions d'ouverture, décalées d'un pas.
  const fallback = initialParams(investigation);
  const first = investigation.params[0];
  if (first) {
    fallback[first.key] = cleanNumber(clamp(fallback[first.key] + first.step, first.min, first.max));
  }

  return fallback;
}

/** Marquer l'explication géométrique comme vue (§21). */
export function markExplained(data) {
  const record = currentRecord(data);
  if (record.stage !== 'found') return data;

  return patchRecord(data, { stage: 'explained' });
}

/** Repartir de zéro sur l'enquête courante, sans toucher aux autres. */
export function resetInvestigation(data) {
  const investigation = currentInvestigation(data);

  return {
    ...data,
    objects: { ...data.objects, [investigation.id]: initialParams(investigation) },
    records: {
      ...data.records,
      [investigation.id]: { observations: [], rule: null, stage: 'exploring', hintsUsed: 0, tests: [] },
    },
  };
}

export function setPrecision(data, precision) {
  const value = PRECISIONS.includes(Number(precision)) ? Number(precision) : 0;

  return value === data.precision ? data : { ...data, precision: value };
}

export function toggleSetting(data, key) {
  if (!(key in DEFAULT_SETTINGS)) return data;

  return { ...data, settings: { ...data.settings, [key]: !data.settings[key] } };
}

function patchRecord(data, updates) {
  const id = currentInvestigation(data).id;

  return { ...data, records: { ...data.records, [id]: { ...data.records[id], ...updates } } };
}

// ── La PREUVE exigée (§25 : on ne devine pas) ────────────────────────────

/**
 * L'élève a-t-il rassemblé de quoi retenir sa conjecture ?
 *
 * Trois conditions, et elles ne sont pas décoratives :
 *
 *   `enough`   — assez d'observations ;
 *   `varied`   — elles ne sont pas toutes le même objet. Sans cela, trois
 *                mesures d'un carré 2 × 2 valideraient A = L + l aussi bien
 *                que A = L × l, et l'élève repartirait avec une règle fausse ;
 *   `tested`   — la règle a tenu sur un objet qu'il n'a pas choisi.
 *
 * Tant que les trois ne sont pas réunies, l'instrument ne dit jamais
 * « trouvé » — même si la règle EST la bonne. C'est le prix de §25, et c'est
 * ce qui distingue une découverte d'une devinette heureuse.
 */
export function evaluateEvidence(data) {
  const investigation = currentInvestigation(data);
  const record = currentRecord(data);
  const rule = record.rule;
  const requirement = investigation.evidence;

  const enough = record.observations.length >= requirement.minObservations;
  const varied = countDistinctConfigurations(investigation, record.observations) >= requirement.minDistinct;

  const check = testRule(rule, record.observations, investigation.target);
  const holds = check.verdict === 'holds';

  const testCheck = testRule(rule, record.tests, investigation.target);
  const exhaustive = holds && coversWholeGrid(investigation, record.observations, data.precision);
  const tested = !requirement.requiresUnseenTest
    ? true
    : (record.tests.length > 0 && testCheck.verdict === 'holds') || exhaustive;

  return {
    enough,
    varied,
    holds,
    tested,
    exhaustive,
    check,
    testCheck,
    satisfied: enough && varied && holds && tested,
    requirement,
  };
}

/**
 * Combien de configurations DIFFÉRENTES le tableau contient-il ?
 *
 * On compte sur les grandeurs réglables (`input`) : deux rectangles 4 × 3 et
 * 3 × 4 comptent pour deux, et c'est voulu — ils séparent L × l de L + l
 * aussi bien l'un que l'autre, mais surtout ils montrent que l'aire ne
 * change pas, ce qui est déjà une observation.
 */
function countDistinctConfigurations(investigation, observations) {
  const inputs = investigation.quantities.filter((entry) => entry.role === 'input').map((entry) => entry.key);
  if (inputs.length === 0) return observations.length;
  const seen = new Set();
  for (const row of observations) {
    seen.add(inputs.map((key) => row.values?.[key] ?? '·').join('|'));
  }

  return seen.size;
}

/**
 * Tout ce que l'écran a besoin de savoir, calculé UNE fois par rendu.
 *
 * Le composant ne calcule rien : il lit. C'est la règle de séparation de
 * l'atelier — aucune mathématique dans le JSX.
 */
export function resolveMeasurement(data) {
  const investigation = currentInvestigation(data);
  const params = currentParams(data);
  const record = currentRecord(data);
  const measures = measureAll(investigation, params, data.precision);
  const evidence = evaluateEvidence(data);
  const solved = record.rule ? matchesSolution(investigation, record.rule) : false;

  return { investigation, params, record, measures, evidence, solved };
}
