/**
 * LE TABLEAU QUI SE CONSTRUIT — le modèle pur des transformations visibles.
 *
 * Exigence de la propriétaire (2026-09-30) : l'élève doit VOIR l'opération
 * se faire, élément par élément, avant d'en voir le résultat. Une solution
 * n'est donc pas une suite de formules « A → B → C », mais une suite de
 * FRAMES — des micro-états du tableau :
 *
 *     2x + [3] = 9            1. on désigne l'élément (selected)
 *     2x + 3 = 9              2. l'opération tombe sur LES DEUX membres (↓ −3 ↓ −3)
 *     2x + 3 −3 = 9 −3        3. elle est écrite dans l'expression (operation)
 *     2x = 6                  4. l'expression simplifiée — ce qui a changé en vert (result)
 *
 * Un frame :
 *
 *     {
 *       step,                  // l'étape LOGIQUE (0, 1, …) : « الخطوة 2 من 3 » compte les étapes
 *       textKey?, textParams?, // la phrase de ce micro-état (clé i18n du namespace mathlab) — ou `text`
 *       operationKey?, operationParams?, operationLatex?,   // la pastille « ce qui se fait »
 *       rows: [[token…], …],   // une ou plusieurs lignes d'expression (une jumelle = deux lignes)
 *       marks: [mark…],        // les flèches et les résultats posés sur les jetons
 *       settle?,               // LaTeX de la ligne acquise quand ce frame clôt une étape
 *       tone?,                 // 'result' (le dernier frame) | 'warning' (le sens s'inverse)
 *       task?,                 // l'exercice de ce micro-état en mode « تدرّب بنفسك » (voir makeTask)
 *     }
 *
 *     token = { id, latex, tone? }   tone ∈ TOKEN_TONES
 *     mark  = { type: 'under',  target: id, latex, tone? }          ↓ sous un jeton   (« −3 » sous chaque membre)
 *           | { type: 'link',   from: id, to: id, latex }            ⌒ d'un jeton à l'autre, l'opérateur sur l'arc
 *           | { type: 'result', from: [id…], latex }                 ↓ le résultat d'une opération entre jetons
 *
 * Aucune fonction ici ne CALCULE les mathématiques : l'outil garde son
 * moteur (equation.js, factor.js, differences.js…) comme seule source de
 * vérité, et ces constructeurs ne font que mettre SES résultats en scène.
 * Le composant (MathBoard) ne rend que `frames.slice(0, cursor)` : un frame
 * futur n'existe pas dans le DOM.
 */

export const TOKEN_TONES = Object.freeze(['neutral', 'selected', 'operation', 'result', 'completed', 'muted', 'warning']);
export const MARK_TYPES = Object.freeze(['under', 'link', 'result']);

/** La palette des opérations proposées à l'élève (mode « تدرّب بنفسك »). */
export const OPERATOR_PALETTE = Object.freeze(['+', '-', '\\times', '\\div']);

/**
 * L'opérateur d'une écriture : `-3` → `-`, `\\div 2` → `\\div`, `\\times (-1)`
 * → `\\times`, `−` → `-`, `×` → `\\times`, `÷` → `\\div`. `null` si aucun.
 */
export function normalizeOperator(latex) {
  const text = String(latex ?? '').trim().replace(/−/g, '-').replace(/×/g, '\\times').replace(/÷/g, '\\div').replace(/\\cdot/g, '\\times');
  if (text.startsWith('\\times')) return '\\times';
  if (text.startsWith('\\div') || text.startsWith('\\frac') || text.startsWith(':')) return '\\div';
  if (text.startsWith('+')) return '+';
  if (text.startsWith('-')) return '-';

  return null;
}

/**
 * L'EXERCICE d'un micro-état — le mode « تدرّب بنفسك ».
 *
 * Au lieu de voir l'outil désigner les éléments, l'élève les désigne : il
 * touche les jetons `targets` (dans n'importe quel ordre), puis choisit
 * l'opération (`operator`, dans `OPERATOR_PALETTE`) quand il y en a une.
 * Juste → le déroulé continue ; faux → un mot, et il réessaie ; « أرني » montre.
 *
 * @param {object} p
 * @param {string[]} p.targets   ids des jetons à choisir
 * @param {string|null} [p.operator]  l'opération attendue (LaTeX normalisé), ou null
 * @param {'operation'|'term'|'pick'} [p.kind]  la consigne par défaut
 * @param {string} [p.promptKey]  une consigne propre (clé i18n)
 */
export function makeTask({ targets, operator = null, kind = 'operation', promptKey = null, promptParams = null, answer = undefined }) {
  return {
    // `answer` : le résultat à taper (LaTeX ou texte numérique) ; absent → déduit
    // des frames suivants (deriveAnswer) ; `false` → aucune saisie.
    ...(answer !== undefined ? { answer } : {}),
    targets: targets.map(String),
    // Un symbole qui n'est pas l'une des quatre opérations (une étiquette comme
    // `(−4/2)^2`) : l'exercice se limite à désigner les éléments.
    operator: operator ? normalizeOperator(operator) : null,
    kind,
    promptKey: promptKey ?? `kit.practice.prompt.${kind}`,
    promptParams,
  };
}

/**
 * Un nombre tapé par l'élève (ou un résultat LaTeX de l'outil) → un rationnel
 * exact `{ n, d }`, ou null. Lit `6`, `-3`, `−3`, `0,3`, `0.3`, `3/10`,
 * `\\frac{3}{10}`, `-\\frac{1}{2}`, `+4`. Rien d'autre : un résultat qui n'est
 * pas un nombre n'est pas demandé à l'élève.
 */
export function parseNumberAnswer(raw) {
  let text = String(raw ?? '').trim()
    .replace(/−/g, '-').replace(/\\left|\\right|\\,|\s+/g, '')
    .replace(/\\[dt]?frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2')
    .replace(/,/g, '.');
  if (/^\(.*\)$/.test(text)) text = text.slice(1, -1);
  const match = text.match(/^([+-]?)(\d+(?:\.\d+)?)(?:\/([+-]?\d+(?:\.\d+)?))?$/);
  if (!match) return null;
  const sign = match[1] === '-' ? -1 : 1;
  const toFrac = (value) => {
    const [whole, decimals = ''] = value.replace(/^[+-]/, '').split('.');
    const d = 10 ** decimals.length;
    const n = Number(whole + decimals) * (value.startsWith('-') ? -1 : 1);

    return { n, d };
  };
  const num = toFrac(match[2]);
  const den = match[3] ? toFrac(match[3]) : { n: 1, d: 1 };
  if (den.n === 0 || !Number.isSafeInteger(num.n) || !Number.isSafeInteger(den.n)) return null;
  let n = sign * num.n * den.d;
  let d = num.d * den.n;
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(Math.abs(n), d) || 1;

  return { n: n / g, d: d / g };
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

/** La valeur tapée est-elle le résultat attendu (à l'égalité exacte près : 0,5 = 1/2) ? */
export function checkAnswer(expected, typed) {
  const want = parseNumberAnswer(expected);
  const got = parseNumberAnswer(typed);

  return Boolean(want && got && want.n === got.n && want.d === got.d);
}

/**
 * Le RÉSULTAT que l'élève doit calculer lui-même après avoir désigné et
 * choisi l'opération (« تدرّب بنفسك » : c'est lui qui fait presque tout).
 * Lu dans les frames SUIVANTS de la même étape : le premier résultat posé
 * (`result` mark, ↓ 6), sinon le premier jeton `result` numérique de la ligne
 * simplifiée (9 − 3 → 6). Seulement pour un exercice qui porte une opération,
 * et seulement si c'est un nombre ; sinon null (pas de saisie demandée).
 */
export function deriveAnswer(frames, index) {
  return locateAnswer(frames, index)?.latex ?? null;
}

/**
 * Comme deriveAnswer, avec l'indice du frame où ce résultat apparaît (`at`) :
 * une fois que l'élève l'a calculé, le déroulé y saute directement.
 * @returns {{ latex: string, at: number } | null}
 */
export function locateAnswer(frames, index) {
  const frame = frames[index];
  const task = frame?.task;
  if (!task) return null;
  if (task.answer === false) return null;
  if (task.answer != null) return parseNumberAnswer(task.answer) ? { latex: String(task.answer), at: index } : null;
  if (!task.operator) return null;
  for (let k = index + 1; k < frames.length && frames[k].step === frame.step; k += 1) {
    const mark = (frames[k].marks ?? []).find((item) => item.type === 'result' && parseNumberAnswer(item.latex));
    if (mark) return { latex: mark.latex, at: k };
    const token = frames[k].rows.flat().find((item) => item.tone === 'result' && parseNumberAnswer(item.latex));
    if (token) return { latex: token.latex, at: k };
  }

  return null;
}

/** Le choix de jetons est-il le bon ? (ensemble, sans ordre) */
export function checkPick(task, picked) {
  const want = new Set(task.targets);
  const got = new Set(picked.map(String));
  if (got.size !== want.size) return { ok: false, reason: 'count' };
  for (const id of got) if (!want.has(id)) return { ok: false, reason: 'wrong' };

  return { ok: true };
}

/** L'opération choisie est-elle la bonne ? */
export function checkOperator(task, operator) {
  return !task.operator || normalizeOperator(operator) === task.operator;
}

/** Un jeton que l'élève peut toucher (ni une relation, ni un signe seul, ni une parenthèse). */
export function isPickable(token) {
  // Un jeton vide ou un simple espacement n'est rien à désigner.
  if (!String(token.latex).replace(/\\(quad|qquad|;|,|:|!|\s)|\{\}|\s/g, '').trim()) return false;

  return !/^\s*(=|<|>|\\le(q)?|\\ge(q)?|\\neq|\+|-|\\times|\\div|\(|\)|\\left\(|\\right\)|;|,)\s*$/.test(token.latex);
}

/** Un jeton : un morceau d'expression qu'on peut désigner. */
export function tok(id, latex, tone = 'neutral') {
  return { id: String(id), latex: String(latex), tone: TOKEN_TONES.includes(tone) ? tone : 'neutral' };
}

/** Recolorer certains jetons d'une ligne (sans muter). */
export function withTones(row, tones) {
  return row.map((token) => (token.id in tones ? { ...token, tone: tones[token.id] } : token));
}

/** Le LaTeX d'une ligne de jetons — pour la ligne acquise et les lecteurs d'écran. */
export function rowLatex(row) {
  return row.map((token) => token.latex).join(' ');
}

/**
 * UNE OPÉRATION ENTRE DEUX NOMBRES — « [2] × [3] → 6 ».
 *
 *   1. les deux opérandes désignés ;
 *   2. l'arc qui les relie, l'opérateur posé dessus ;
 *   3. le résultat qui tombe sous eux — l'égalité est acquise.
 *
 * `row` est la ligne où vivent les opérandes (ils peuvent être noyés dans une
 * expression : `x^2 + 5x + [2] × [3]`) ; `a` / `b` sont leurs ids.
 *
 * @returns {object[]} trois frames de l'étape `step`
 */
export function binaryOperationFrames({ step, row, a, b, symbolLatex, resultLatex, settle, texts = {}, task = undefined }) {
  const selected = withTones(row, { [a]: 'selected', [b]: 'selected' });
  const operating = withTones(row, { [a]: 'operation', [b]: 'operation' });
  // L'exercice par défaut : désigner les deux opérandes, puis l'opération.
  const exercise = task === false ? null : (task ?? makeTask({ targets: a === b ? [a] : [a, b], operator: symbolLatex, kind: 'operation' }));

  return [
    { step, ...texts.select, rows: [selected], marks: [], ...(exercise ? { task: exercise } : {}) },
    { step, ...texts.operate, rows: [operating], marks: [{ type: 'link', from: a, to: b, latex: symbolLatex }] },
    {
      step,
      ...texts.result,
      rows: [operating],
      marks: [{ type: 'link', from: a, to: b, latex: symbolLatex }, { type: 'result', from: [a, b], latex: resultLatex }],
      settle: settle ?? null,
    },
  ];
}

/**
 * LA MÊME OPÉRATION SUR LES DEUX MEMBRES — le geste de la balance.
 *
 *   1. désigner ce qu'on veut faire disparaître (`targets`) ;
 *   2. l'opération tombe sous CHAQUE membre (↓ −3 … ↓ −3) ;
 *   3. elle s'écrit dans l'expression : `2x + 3 −3 = 9 −3` ;
 *   4. l'expression simplifiée, le changement en vert ; si le sens de la
 *      relation s'inverse, le jeton de relation passe en `warning` et porte
 *      la marque `< → >`.
 *
 * @param {object} p
 * @param {number} p.step
 * @param {object[]} p.left   jetons du membre de gauche (avant)
 * @param {object} p.relation jeton de la relation (avant)
 * @param {object[]} p.right  jetons du membre de droite (avant)
 * @param {string[]} p.targets ids des jetons visés (peut être vide : on divise « tout »)
 * @param {string} p.opLatex  l'opération telle qu'écrite : `-3`, `\div 2`, `\times (-1)`
 * @param {object[]} p.applied  la ligne complète APRÈS écriture de l'opération (étape 3)
 * @param {object[]} p.after    la ligne simplifiée (étape 4)
 * @param {boolean} [p.flipped] le sens de la relation s'inverse
 * @param {string} [p.flipLatex] `<\to>` — la marque posée sur la relation inversée
 * @param {string} p.settle    LaTeX de la ligne acquise
 * @param {object} [p.texts]   { select, apply, write, simplify, flip } → { textKey, textParams, operationKey… }
 */
export function bothSidesFrames({ step, left, relation, right, targets = [], opLatex, applied, after, flipped = false, flipLatex = null, settle, texts = {}, task = undefined }) {
  const before = [...left, relation, ...right];
  const leftAnchor = left[left.length - 1]?.id;
  const rightAnchor = right[right.length - 1]?.id;
  const selectTones = Object.fromEntries(targets.map((id) => [id, 'selected']));
  const under = [
    { type: 'under', target: leftAnchor, latex: opLatex, tone: 'operation' },
    { type: 'under', target: rightAnchor, latex: opLatex, tone: 'operation' },
  ];
  // L'exercice par défaut : désigner le terme à faire disparaître (ou, pour une
  // division, le terme qui porte le coefficient), puis l'opération à appliquer
  // AUX DEUX membres.
  const exercise = task === false ? null : (task ?? makeTask({
    targets: targets.length ? targets : [left[0]?.id].filter(Boolean),
    operator: opLatex,
    kind: 'term',
  }));
  const frames = [];
  if (targets.length) frames.push({ step, ...texts.select, rows: [withTones(before, selectTones)], marks: [], ...(exercise ? { task: exercise } : {}) });
  frames.push({ step, ...texts.apply, rows: [withTones(before, selectTones)], marks: under, ...(!targets.length && exercise ? { task: exercise } : {}) });
  frames.push({ step, ...texts.write, rows: [applied], marks: [] });
  const last = {
    step,
    ...(flipped ? texts.flip ?? texts.simplify : texts.simplify),
    rows: [after],
    marks: flipped && flipLatex ? [{ type: 'under', target: after.find((token) => token.tone === 'warning')?.id, latex: flipLatex, tone: 'warning' }] : [],
    settle,
  };
  if (flipped) last.tone = 'warning';
  frames.push(last);

  return frames;
}

/** Un frame de conclusion : la réponse, et rien d'autre. */
export function resultFrame({ step, row, settle, ...text }) {
  return { step, ...text, rows: [row], marks: [], settle: settle ?? rowLatex(row), tone: 'result' };
}

/** Un frame de simple énoncé (une ligne posée, un commentaire). */
export function stateFrame({ step, rows, marks = [], settle = null, ...text }) {
  return { step, ...text, rows, marks, settle };
}

/**
 * La progression lisible : « الخطوة 2 من 3 » compte les ÉTAPES logiques,
 * pas les micro-états. `cursor` = frames montrés.
 */
export function boardProgress(frames, cursor) {
  const total = frames.length ? Math.max(...frames.map((frame) => frame.step)) + 1 : 0;
  const current = cursor > 0 && frames[cursor - 1] ? frames[cursor - 1].step + 1 : 0;

  return { current, total };
}

/** Les lignes ACQUISES avant le frame courant (l'historique du tableau). */
export function settledLines(frames, cursor) {
  return frames.slice(0, Math.max(0, cursor - 1)).filter((frame) => frame.settle).map((frame) => ({ latex: frame.settle, step: frame.step, tone: frame.tone }));
}

/**
 * Vérifie qu'une suite de frames est cohérente : chaque marque vise un jeton
 * présent dans le frame, les étapes ne reculent jamais, le dernier frame est
 * un résultat. Rend la liste des problèmes (vide = sain) — pour les tests des outils.
 */
export function validateFrames(frames) {
  const problems = [];
  let lastStep = -1;
  frames.forEach((frame, index) => {
    if (!Number.isInteger(frame.step) || frame.step < lastStep) problems.push(`frame ${index}: step ${frame.step} after ${lastStep}`);
    lastStep = Math.max(lastStep, frame.step);
    const ids = new Set(frame.rows.flat().map((token) => token.id));
    for (const mark of frame.marks ?? []) {
      if (!MARK_TYPES.includes(mark.type)) problems.push(`frame ${index}: unknown mark ${mark.type}`);
      const targets = mark.type === 'under' ? [mark.target] : (mark.type === 'link' ? [mark.from, mark.to] : mark.from);
      for (const id of targets) if (!ids.has(id)) problems.push(`frame ${index}: mark targets missing token ${id}`);
    }
    if (frame.task) {
      for (const id of frame.task.targets) if (!ids.has(id)) problems.push(`frame ${index}: task targets missing token ${id}`);
      if (frame.task.operator && !OPERATOR_PALETTE.includes(frame.task.operator)) problems.push(`frame ${index}: task operator ${frame.task.operator} not in palette`);
    }
  });
  if (frames.length && frames[frames.length - 1].tone !== 'result') problems.push('last frame is not a result');

  return problems;
}
