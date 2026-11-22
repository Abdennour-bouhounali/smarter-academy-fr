/**
 * La LOGIQUE d'une مسألة guidée (GuidedProblem.jsx) — pure, sans React, lue
 * aussi par scripts/validate-lessons.mjs.
 *
 * Une مسألة est un exercice COMPLET « comme au امتحان » : un énoncé de
 * situation réelle, plusieurs questions numérotées (1), 2), 3)…), et pour
 * chacune un chemin guidé de sous-étapes :
 *
 *   sort      أستخرج المعطيات   InfoSorter sur `problem.data` (partie 1 seulement)
 *   choice    أترجم / أستنتج    TapQuestion (`role`: translate | conclude)
 *   numeric   أحسب / الجواب     NumericQuestion (`role`: compute | answer)
 *   batch     الجواب             BatchChoiceQuestion — plusieurs lignes à compléter
 *                                (ex. « عبّر بأربع صيغ » : les quatre phrases)
 *   solution  أحرّر الحلّ        WrittenAnswer : l'élève RÉDIGE, puis découvre la
 *                                rédaction modèle ligne par ligne (`lines`)
 *
 * CHAQUE DEMANDE A SA RÉPONSE (règle du propriétaire, 2026-10-06 : « deux
 * questions, une seule saisie » est un défaut). Une partie déclare ses
 * demandes dans `asks` — une entrée par « ؟ » et par impératif
 * بيّن / احسب / استنتج / عبّر / عيّن de `question` (au moins autant que
 * `demandsOf(question)`). Une sous-étape RÉPOND à la demande k en portant
 * `ask: k` ; seules peuvent répondre : `numeric` de rôle `answer`, `choice` de
 * rôle `conclude`, `batch` et `solution`. Chaque demande doit avoir au moins
 * une réponse qui ne soit pas la seule rédaction (une valeur saisie ou une
 * conclusion choisie) — la rédaction s'y AJOUTE. Une étape de raisonnement
 * (interpréter un reste…) ne porte pas d'`ask` et ne compte pas.
 *
 * Une sous-étape est FAITE dès qu'on y a RÉPONDU — juste ou faux (contrat non
 * bloquant, LESSON_CONTRACT.md) — et la suivante s'ouvre. Aucune réponse n'est
 * une preuve de maîtrise : le module est `practice_lab`, jamais d'`assessment`.
 *
 * Voir docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
 */

import { validateStatementFigure } from '../components/statementFigure.js';
import { validateScene } from './problemScene.js';
import { validateIllustration } from './problemIllustration.js';
import { PROBLEM_TONES } from './problemTone.js';

/** Les props de CoordPlane qu'un `problem.visual` peut porter — la même liste fermée que la pratique
 *  (scripts/validate-exercises.mjs › COORDPLANE_PROPS) : une faute de frappe rendrait un plan vide. */
const COORDPLANE_PROPS = new Set([
  'range', 'unit', 'unitY', 'step', 'points', 'segments', 'polygons', 'arrows',
  'guides', 'ghost', 'target', 'overlay', 'showGrid', 'axisLabels', 'size',
  'ariaLabel', 'caption', 'functions', 'curves', 'cursor', 'readGuides',
  'staircase', 'intercept', 'highlightIntervals', 'xStep', 'yStep', 'labelEvery',
  'frozen', 'disabled',
]);
const MAX_PLOT_PX = 460;
const DEFAULT_UNIT = 34;

/** Les renvois d'un énoncé à un support (« مربّع الشكل » = de forme carrée, n'en est pas un). */
export const SUPPORT_REFERENCE = /في الشكل|الشكل المقابل|الشكل التالي|الجدول المقابل|في الجدول|الجدول التالي|الجدول الآتي|التمثيل البياني المقابل|في التمثيل البياني|على التمثيل البياني|بقراءة بيانية|المعلم المقابل/;

export const SUBSTEP_KINDS = ['sort', 'choice', 'numeric', 'batch', 'solution'];
export const SUBSTEP_ROLES = {
  sort: ['extract'],
  choice: ['translate', 'conclude'],
  numeric: ['compute', 'answer'],
  batch: ['answer'],
  solution: ['written'],
};

/**
 * « الإجابة تُكتب في شكلها » pour une sous-étape `numeric` (2026-11-10 ; EXERCISE_CONTRACT.md § « قوالب الإجابة ») : l'étape DÉCLARE la
 * forme de sa saisie par des champs explicites — jamais déduits de `expected`. Une étape sans `shape` garde la case nue d'avant.
 *
 *   shape: 'quantity', unit: 'm'                  [ ] m — l'unité est imprimée (liste fermée STEP_UNITS, « دج » et non « DA »)
 *   shape: 'form', subject: 'V', factor: '\\pi'    V = [ ]π — la forme est imprimée, l'élève tape le coefficient
 *   shape: 'gap', subject: 'AM \\times AC'         AM × AC = [ ] ; avec « \ldots » dans `subject`, la case prend SA place
 *   shape: 'decimal'                              [ ] — un nombre décimal (« . » devient « , »), sans unité : un rapport
 *
 * `subject` et `factor` sont du LaTeX SANS « $ ». Une étape qui porte `shape` ne porte ni `prefix` ni `suffix` (ils feraient doublon).
 */
export const STEP_SHAPES = ['quantity', 'form', 'gap', 'decimal'];
export const STEP_UNITS = ['m', 'cm', 'mm', 'km', 'm²', 'cm²', 'mm²', 'km²', 'm³', 'cm³', 'L', 'cL', 'mL', 'g', 'kg', '°', 'km/h', 'دج'];
const SHAPE_FIELDS = { quantity: ['unit'], form: ['subject', 'factor'], gap: ['subject'], decimal: [] };
const STEP_GAP = '\\ldots';

/** Accolades équilibrées (hors `\{ \}`) : une formule coupée au milieu d'un groupe ne se rend pas. */
function balancedLatex(latex) {
  let depth = 0;
  for (let i = 0; i < latex.length; i += 1) {
    if (latex[i] === '\\') { i += 1; continue; }
    if (latex[i] === '{') depth += 1;
    if (latex[i] === '}') depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}
const latexField = (v) => typeof v === 'string' && v.trim() !== '' && !v.includes('$') && balancedLatex(v);

/** Les erreurs des champs de forme d'une sous-étape (tableau vide = conforme, ou pas de `shape`). */
export function shapeErrors(step) {
  const errors = [];
  const stray = ['unit', 'subject', 'factor'].filter((f) => step?.[f] != null);
  if (step?.shape == null) {
    if (stray.length) errors.push(`'${stray.join("', '")}' need a 'shape'`);
    return errors;
  }
  if (step.kind !== 'numeric') return ["'shape' belongs to a numeric step"];
  if (!STEP_SHAPES.includes(step.shape)) return [`unknown shape '${step.shape}' (${STEP_SHAPES.join(' | ')})`];
  const allowed = SHAPE_FIELDS[step.shape];
  for (const f of stray) if (!allowed.includes(f)) errors.push(`'${f}' is not a field of shape '${step.shape}'`);
  if (step.prefix != null || step.suffix != null) errors.push("a step with a 'shape' carries no 'prefix' / 'suffix' (the shape prints them)");
  if (step.shape === 'quantity' && !STEP_UNITS.includes(step.unit)) errors.push(`shape 'quantity' needs a 'unit' among ${STEP_UNITS.join(', ')}`);
  if (step.shape === 'form') {
    if (!latexField(step.subject)) errors.push("shape 'form' needs a 'subject' (LaTeX without $, e.g. 'V')");
    if (!latexField(step.factor)) errors.push("shape 'form' needs a 'factor' (LaTeX without $, e.g. '\\pi')");
  }
  if (step.shape === 'gap') {
    if (!latexField(step.subject)) errors.push("shape 'gap' needs a 'subject' (LaTeX without $, e.g. 'AM \\times AC')");
    else if (step.subject.includes(STEP_GAP)) {
      const [pre, ...rest] = step.subject.split(STEP_GAP);
      if (rest.length !== 1) errors.push("shape 'gap': 'subject' holds one « \\ldots » at most");
      else if (!balancedLatex(pre) || !balancedLatex(rest[0])) errors.push("shape 'gap': « \\ldots » sits inside a { } group — the formula cannot be cut there");
    }
  }
  return errors;
}

/**
 * Le modèle de saisie d'une sous-étape (celui que lit TemplateInput), ou null : pas de `shape`, ou une forme invalide — la case nue.
 * PURE, et ne lit JAMAIS `expected` : rien de la réponse ne passe dans la forme.
 */
export function stepTemplate(step) {
  if (!step || step.shape == null || shapeErrors(step).length) return null;
  switch (step.shape) {
    case 'quantity': return { kind: 'quantity', unit: step.unit, signed: false };
    case 'form': return { kind: 'form', subject: step.subject, pre: '', post: step.factor, letter: step.subject };
    case 'gap': {
      const [pre, post] = step.subject.includes(STEP_GAP) ? step.subject.split(STEP_GAP) : [`${step.subject} =`, ''];
      return { kind: 'gap', before: '', pre, post, after: '', raised: false, signed: false };
    }
    default: return { kind: 'decimal', signed: false };
  }
}

/** Ce que l'élève a répondu, tel qu'on le relit dans la liste des demandes : la valeur DANS sa forme (virgule décimale, unité, π…). */
export function stepGiven(step, n) {
  const tpl = stepTemplate(step);
  if (!tpl) return `${n}${step.suffix ? ` ${step.suffix}` : ''}`;
  const value = String(n).replace('.', ',');
  const tex = value.replace(',', '{,}');
  if (tpl.kind === 'quantity') return `${value} ${tpl.unit}`;
  if (tpl.kind === 'form') return `$${tpl.subject} = ${tex}${tpl.post}$`;
  if (tpl.kind === 'gap') return `$${tpl.pre} ${tex}${tpl.post}$`;
  return value;
}

/** Le rôle affiché d'une sous-étape (par défaut, celui de son type). */
export const substepRole = (step) => step.role ?? SUBSTEP_ROLES[step.kind]?.[0];

/** Les verbes de consigne qui sont une demande (avec la شدّة : « بين » seul est la préposition). */
const DEMAND_VERBS = /(^|[\s،.؛:])(بيّن|احسب|استنتج|عبّر|عيّن)(?=[\s،.؛:]|$)/g;

/** Nombre de demandes d'une question : ses « ؟ » et ses impératifs de consigne. */
export function demandsOf(question = '') {
  return (question.match(/؟/g) ?? []).length + (question.match(DEMAND_VERBS) ?? []).length;
}

/** Une sous-étape PEUT répondre à une demande (porter `ask`). */
const canAnswer = (s) => (s.kind === 'numeric' && s.role === 'answer') || (s.kind === 'choice' && s.role === 'conclude') || s.kind === 'batch' || s.kind === 'solution';

/**
 * Les erreurs de contrat d'une مسألة (tableau vide = conforme).
 * @param {object} problem
 * @returns {string[]}
 */
export function validateProblem(problem) {
  const errors = [];
  const at = (msg) => errors.push(`${problem?.id ?? '?'}: ${msg}`);
  if (!problem || typeof problem !== 'object') return ['problem: not an object'];
  if (!problem.id) at('missing id');
  if (!problem.title) at('missing title');
  if (!problem.statement) at('missing statement');
  if (problem.source?.type !== 'platform_addition' && problem.source?.type !== 'textbook') at('source must be a textbook src() or an addition()');
  const parts = problem.parts ?? [];
  if (parts.length < 2) at(`needs at least 2 parts (exam style), has ${parts.length}`);

  // Le support de l'énoncé (facultatif) : figure GeoFigure / SpaceFigure, repère CoordPlane, tableau.
  if (problem.figure != null) {
    const figErrors = validateStatementFigure(problem.figure);
    for (const e of figErrors) at(`figure: ${e}`);
  }
  // Un énoncé qui RENVOIE à un support le montre (règle du propriétaire : jamais « الشكل المقابل » sans figure).
  const texts = [problem.statement, ...parts.map((pt) => pt.question)].join(' ');
  if (SUPPORT_REFERENCE.test(texts) && !problem.figure && !problem.visual && !problem.table) {
    at('the statement refers to a figure / table / graph (« في الشكل », « الجدول المقابل », « بقراءة بيانية »…) but the problem has no figure, visual or table');
  }
  // La scène interactive (facultative, 2026-10-13) et la teinte de la مسألة.
  if (problem.illustration != null) for (const e of validateIllustration(problem.illustration)) at(`illustration: ${e}`);
  if (problem.scene != null) for (const e of validateScene(problem.scene)) at(`scene: ${e}`);
  if (problem.tone != null && !PROBLEM_TONES[problem.tone]) at(`tone inconnu « ${problem.tone} »`);
  if (problem.visual != null) {
    const v = problem.visual;
    if (typeof v !== 'object' || Array.isArray(v)) at('visual must be an object of CoordPlane props');
    else {
      for (const k of Object.keys(v)) if (!COORDPLANE_PROPS.has(k)) at(`visual.${k} is not a CoordPlane prop`);
      if (v.range) {
        const unit = v.unit ?? DEFAULT_UNIT;
        const w = (v.range.xMax - v.range.xMin) * unit;
        const h = (v.range.yMax - v.range.yMin) * (v.unitY ?? unit);
        if (w > MAX_PLOT_PX || h > MAX_PLOT_PX) at(`visual is ${Math.round(w)}×${Math.round(h)} px (max ${MAX_PLOT_PX}): set unit / unitY`);
      }
    }
  }
  if (problem.table != null) {
    const { head, rows } = problem.table;
    if (!Array.isArray(head) || head.length < 2) at('table: head needs ≥ 2 cells');
    else if (!Array.isArray(rows) || rows.length < 1) at('table: needs ≥ 1 row');
    else rows.forEach((r, k) => { if (!Array.isArray(r) || r.length !== head.length) at(`table: row ${k + 1} must have ${head.length} cells`); });
  }

  parts.forEach((part, p) => {
    const where = `part ${p + 1}`;
    if (!part.question) at(`${where}: missing question`);
    const steps = part.steps ?? [];
    if (steps.length < 2) at(`${where}: needs at least 2 sub-steps`);

    // Les demandes, déclarées et couvertes.
    const asks = part.asks ?? [];
    const demands = Math.max(1, demandsOf(part.question));
    if (!Array.isArray(asks) || asks.length < demands) {
      at(`${where}: the question makes ${demands} demand(s) (؟ / بيّن / احسب / استنتج / عبّر / عيّن) but declares ${asks.length ?? 0} in 'asks'`);
    }
    const answeredBy = asks.map(() => []);

    steps.forEach((s, i) => {
      const w = `${where} step ${i + 1}`;
      if (!SUBSTEP_KINDS.includes(s.kind)) { at(`${w}: unknown kind '${s.kind}'`); return; }
      if (s.role && !SUBSTEP_ROLES[s.kind].includes(s.role)) at(`${w}: role '${s.role}' is not allowed for '${s.kind}'`);
      if (s.ask != null) {
        if (!canAnswer(s)) at(`${w}: only numeric 'answer', choice 'conclude', batch or solution steps may carry 'ask'`);
        else if (!Number.isInteger(s.ask) || s.ask < 0 || s.ask >= asks.length) at(`${w}: ask ${s.ask} is not one of the part's asks`);
        else answeredBy[s.ask].push(s.kind);
      } else if (s.kind === 'numeric' && s.role === 'answer') {
        at(`${w}: a numeric 'answer' must say which ask it answers ('ask')`);
      }
      if (s.kind === 'sort') {
        if (p !== 0) at(`${w}: data sorting belongs to part 1`);
        const data = problem.data ?? [];
        if (!data.some((d) => d.useful) || !data.some((d) => !d.useful)) at(`${w}: data needs useful AND useless items`);
      }
      if (s.kind === 'choice') {
        if (!Array.isArray(s.options) || s.options.length < 2) at(`${w}: needs ≥ 2 options`);
        else if (!Number.isInteger(s.correct) || s.correct < 0 || s.correct >= s.options.length) at(`${w}: correct out of range`);
      }
      if (s.kind === 'numeric' && typeof s.expected !== 'number') at(`${w}: expected must be a number`);
      for (const e of shapeErrors(s)) at(`${w}: ${e}`);
      if (s.kind === 'batch') {
        if (!Array.isArray(s.rows) || s.rows.length < 2) at(`${w}: batch needs ≥ 2 rows`);
        else s.rows.forEach((r, k) => {
          if (!Array.isArray(r.options) || r.options.length < 2 || !Number.isInteger(r.correct) || r.correct < 0 || r.correct >= r.options.length) at(`${w} row ${k + 1}: needs ≥ 2 options and a correct index in range`);
        });
      }
    });

    answeredBy.forEach((kinds, k) => {
      if (!kinds.some((kind) => kind !== 'solution')) at(`${where}: ask ${k + 1} « ${asks[k]} » has no answer step of its own (a value entered or a conclusion chosen)`);
    });

    const last = steps[steps.length - 1];
    // La rédaction modèle se révèle ligne à ligne : au moins 2 lignes.
    if (last?.kind !== 'solution') at(`${where}: must end with a 'solution' step`);
    else if (!Array.isArray(last.lines) || last.lines.length < 2) at(`${where}: written solution needs ≥ 2 lines`);
  });
  return errors;
}

/** Progression : nombre de sous-étapes faites par partie. */
export const initialProgress = (problem) => problem.parts.map(() => 0);

/** Marque la sous-étape `stepIdx` de la partie `partIdx` comme faite (monotone). */
export function completeSubstep(progress, partIdx, stepIdx) {
  if ((progress[partIdx] ?? 0) > stepIdx) return progress;
  const next = progress.slice();
  next[partIdx] = stepIdx + 1;
  return next;
}

export const isPartDone = (progress, problem, partIdx) => (progress[partIdx] ?? 0) >= problem.parts[partIdx].steps.length;

/**
 * La partie où REPRENDRE une مسألة retrouvée (indice 0…), ou null : rien n'a encore été fait (on commence par l'énoncé).
 * C'est la première partie pas finie ; si toutes le sont, la dernière (son écran mène à la suite).
 */
export function resumePart(progress, problem) {
  if (!Array.isArray(progress) || !progress.some((n) => n > 0)) return null;
  const open = problem.parts.findIndex((_, p) => !isPartDone(progress, problem, p));
  return open === -1 ? problem.parts.length - 1 : open;
}

/**
 * « Pas d'aller-retour » (propriétaire, 2026-11-11) — ce que montre, DANS LE LECTEUR, la colonne « المعطيات » posée à côté d'une sous-étape :
 * l'énoncé n'est que sur le premier écran de la مسألة, et « احسب AM × AC » se lisait sur un écran sans aucun nombre ni figure.
 * Rend null pour le tri des données (`sort` : c'est lui qui les extrait — les montrer donnerait la réponse) ; sinon
 * { figure, table, data, statement } : la figure et le tableau de l'énoncé, les données UTILES (celles que l'élève vient de trier), et
 * l'énoncé lui-même seulement quand la مسألة n'a pas de liste de données (ses nombres ne seraient nulle part ailleurs).
 * Rien à montrer (ni figure, ni tableau, ni donnée, ni énoncé) → null.
 */
export function asideOf(problem, step) {
  if (!problem || !step || step.kind === 'sort') return null;
  const data = (problem.data ?? []).filter((d) => d.useful).map((d) => d.text);
  const figure = problem.figure && (problem.figure.kind || Object.keys(problem.figure.points ?? {}).length) ? problem.figure : null;
  const table = problem.table ?? null;
  const statement = data.length ? null : (problem.statement || null);
  if (!figure && !table && !data.length && !statement) return null;
  return { figure, table, data, statement };
}

/**
 * « Ce que j'ai trouvé » (« pas d'aller-retour », cas 4 : une question sur ce que l'élève a fait avant) : dans le lecteur, la ligne
 * d'Euclide « باقي قسمة القاسم السابق على الباقي الذي وجدته » se lisait sur un écran sans les lignes précédentes. Rend, pour la
 * sous-étape `i` de la partie `p`, les sous-étapes DÉJÀ répondues : celles de la même partie (leur consigne et leur résultat), précédées des
 * résultats des parties précédentes (leurs demandes satisfaites). Le résultat montré est le BON (`display`/`expected`, l'option juste) —
 * celui que la correction vient d'afficher : une ligne d'Euclide fausse ne se propage pas à la suivante. Jamais une sous-étape pas encore
 * répondue ; ni le tri, ni la rédaction, ni une grille (`batch`) — rien d'une ligne à relire.
 *   given : { 'p:i': valeur } (GuidedProblem › given)
 */
/** Le BON résultat d'une sous-étape à une réponse (numeric, choice), ou null. */
export function rightAnswerOf(step) {
  if (step?.kind === 'numeric') return step.display ?? (step.expected != null && typeof step.expected !== 'function' ? String(step.expected) : null);
  if (step?.kind === 'choice') return step.options?.[step.correct] ?? null;
  return null;
}

export function foundOf(problem, p, i, given = {}) {
  const out = [];
  const has = (k) => given[k] != null && given[k] !== '';
  problem.parts.slice(0, p).forEach((part, q) => {
    (part.asks ?? []).forEach((ask, k) => {
      const j = part.steps.findIndex((st, jj) => st.ask === k && rightAnswerOf(st) != null && has(`${q}:${jj}`));
      if (j >= 0) out.push({ label: ask, value: rightAnswerOf(part.steps[j]) });
    });
  });
  problem.parts[p].steps.slice(0, i).forEach((st, j) => {
    const value = rightAnswerOf(st);
    if (value == null || !st.prompt || !has(`${p}:${j}`)) return;
    out.push({ label: st.prompt, value });
  });
  return out;
}
