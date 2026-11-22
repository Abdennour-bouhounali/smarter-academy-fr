// The shared, PURE rules of the `validate-*.mjs` gates — importable by their tests (the gates themselves run
// `process.exit` at load). Tests: scripts/validate-lib.test.mjs.
//
//   - what a v2 lesson IS (its `lesson.pack.js`), for validate-lessons.mjs (plan §8bis);
//   - French typography and French mathematical writing of an exercise's visible text
//     (FRENCH_LANGUAGE_CONTRACT.md §4, §5, §7), for validate-exercises.mjs;
//   - the provenance of an exam sheet and the brevet tags of the bank (EXERCISE_CONTRACT.md « The exam sheet »,
//     « The brevet tags »), for validate-exercises.mjs — the French port of the Algerian `examProvenance.mjs`.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/* ── What a v2 lesson is ───────────────────────────────────────────────── */

/**
 * The source of a lesson's pack, or null. A v2 lesson IS a lesson folder with a `lesson.pack.js` that exports
 * `LESSON_PACK` (LESSON_V2.md §1) — not a marker in its `routes.jsx`: `buildLessonRoutes` takes no option any more,
 * and the old text `retiredModules: true` proves nothing (plan §8bis).
 */
export function packSource(lessonDir) {
  const file = join(lessonDir, 'lesson.pack.js');
  if (!existsSync(file)) return null;
  const src = readFileSync(file, 'utf-8');
  return /export\s+const\s+LESSON_PACK\s*=/.test(src) ? src : null;
}

export const isV2Lesson = (lessonDir) => packSource(lessonDir) !== null;

/** The pack's world id (`world: { id: '<world>' … }`), or null. */
export function packWorldId(lessonDir) {
  return packSource(lessonDir)?.match(/world:\s*\{\s*id:\s*'([^']+)'/)?.[1] ?? null;
}

/** The file the pack's `knowledge` loads (`knowledge: () => import('./…')`), as written, or null. */
export function packKnowledgePath(lessonDir) {
  return packSource(lessonDir)?.match(/knowledge:\s*\(\)\s*=>\s*import\('\.\/([^']+)'\)/)?.[1] ?? null;
}

/* ── French typography and mathematical writing ────────────────────────── */

const ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u;
const BIDI = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/u;
/** `$$…$$`, `$…$`, `\(…\)` — the formulas inside a sentence. */
const MATH = /\$\$[\s\S]*?\$\$|\$[^$]*\$|\\\([\s\S]*?\\\)/g;
const NBSP = '[\\u00a0\\u202f]';

/** The formulas of a sentence, and the sentence with each formula replaced by « § » (it stays a word, never a space). */
export function splitMath(text) {
  const s = String(text ?? '');
  const formulas = [];
  const prose = s.replace(MATH, (m) => {
    formulas.push(m.replace(/^\$\$|\$\$$|^\$|\$$|^\\\(|\\\)$/g, ''));
    return '§';
  });
  return { prose, formulas };
}

/** Errors that hold in prose AND in a formula. */
function commonErrors(s, push) {
  if (ARABIC.test(s)) push('arabe', s.match(ARABIC)[0]);
  if (BIDI.test(s)) push('bidi', 'U+' + s.match(BIDI)[0].codePointAt(0).toString(16).toUpperCase());
  // « PGCD(12 ; 18) » : a pair is written with a semicolon (§7).
  for (const m of s.matchAll(/\b(?:PGCD|PPCM)\s*\(\s*[^;()]*,[^()]*\)/g)) push('point-virgule', m[0]);
}

/**
 * The French typography mistakes of a sentence of the bank (prose with `$…$` formulas inside):
 *   espace         no space, or a plain one, before « : », « ; », « ! », « ? » (U+00A0 or U+202F expected)
 *   guillemets     « … » without a no-break space inside
 *   guillemets-anglais  a straight or English double quote
 *   apostrophe     a straight apostrophe between two letters (« l'île » → « l’île »)
 *   ordinal        « 3ème », « 2eme », « 1ère » (« 3e », « 1re »)
 *   double         « !! », « ?? »
 *   point-décimal  « 3.5 » in prose (« 3,5 »)
 *   unité          « 35€ », « 35 € » or « 20 % » with a plain space (a no-break space before « € » and « % »)
 *   monnaie        « €35 », « EUR » (« 35 € »)
 *   devise         an Algerian currency: « 450 DA », « dinar »
 *   arabe, bidi    an Arabic letter or a bidi control
 *   point-virgule  « PGCD(12, 18) » (« PGCD(12 ; 18) »)
 * Inside each formula (`mathErrors`): `\cdot` or `*` for a product, « 2,5 » or « 2.5 » (`2{,}5`), `\le`/`\ge`
 * (`\leqslant`/`\geqslant`).
 * → [{ kind, at }] — [] when the sentence is clean.
 */
export function typographyErrors(text) {
  const errors = [];
  const push = (kind, at) => errors.push({ kind, at });
  const { prose, formulas } = splitMath(text);
  const find = (kind, re) => {
    for (const m of prose.matchAll(re)) push(kind, m[0]);
  };
  find('espace', /(?<=[^\s\u00A0\u202F(«[])[:;!?](?!\/\/)/gu);
  find('espace', / [:;!?]/g);
  find('guillemets', new RegExp(`«(?!${NBSP})|(?<!${NBSP})»`, 'g'));
  find('guillemets-anglais', /["“”]/g);
  find('apostrophe', /\p{L}'\p{L}/gu);
  find('ordinal', /\d+\s?(?:ème|eme|ième|ère)(?!\p{L})/gu);
  find('double', /!!|\?\?/g);
  find('point-décimal', /\d\.\d/g);
  find('unité', /\d(?:[€%]| [€%])/g);
  find('monnaie', /€\s?\d|\bEUR\b/g);
  find('devise', /\d\s?(?:DA|DZD)\b|\b[Dd]inars?\b/gu);
  commonErrors(prose, push);
  for (const f of formulas) for (const e of mathErrors(f)) errors.push(e);
  return errors;
}

/** The mistakes of French mathematical writing inside ONE LaTeX formula (§5, §7). */
export function mathErrors(latex) {
  const errors = [];
  const s = String(latex ?? '');
  const push = (kind, at) => errors.push({ kind, at });
  for (const m of s.matchAll(/\\cdot(?![a-z])|\*/g)) push('produit', m[0]);
  for (const m of s.matchAll(/\d,\d/g)) push('virgule', m[0]);
  for (const m of s.matchAll(/\d\.\d/g)) push('point-décimal', m[0]);
  for (const m of s.matchAll(/\\(?:leq?|geq?)(?![a-z])/g)) push('inégalité', m[0]);
  commonErrors(s, push);
  return errors;
}

/**
 * Every text of an exercise a student or a teacher READS, with its path and whether it is a pure formula.
 * The answer key (`expectedAnswer`, signatures) is data, not text: it is not here.
 */
export function visibleTexts(data) {
  const out = [];
  const add = (path, value, formula = false) => {
    if (typeof value === 'string' && value.trim()) out.push({ path, text: value, formula });
  };
  const md = data?.metadata ?? {};
  add('metadata.title', md.title);
  (md.tags ?? []).forEach((t, i) => add(`metadata.tags[${i}]`, t));
  add('metadata.exam.heading', md.exam?.heading);
  const st = data?.statement ?? {};
  add('statement.content', st.content);
  (st.formulas ?? []).forEach((f, i) => add(`statement.formulas[${i}]`, f, true));
  (st.table?.head ?? []).forEach((h, i) => add(`statement.table.head[${i}]`, h));
  (st.table?.rows ?? []).forEach((r, i) =>
    (Array.isArray(r) ? r : []).forEach((c, j) => add(`statement.table.rows[${i}][${j}]`, c)),
  );
  (data?.questions ?? []).forEach((q, i) => {
    const p = `questions[${i}]`;
    for (const k of ['lead', 'statement', 'prompt', 'answerFormat']) add(`${p}.${k}`, q[k]);
    (q.choices ?? []).forEach((c, j) => add(`${p}.choices[${j}].content`, c?.content));
    (q.hints ?? []).forEach((h, j) => add(`${p}.hints[${j}].content`, h?.content));
    add(`${p}.feedback.correct`, q.feedback?.correct);
    add(`${p}.feedback.incorrect`, q.feedback?.incorrect);
    (q.solution?.lines ?? []).forEach((l, j) => add(`${p}.solution.lines[${j}]`, l));
    add(`${p}.solution.result`, q.solution?.result, true);
  });
  return out;
}

/** The typography errors of an exercise: [{ path, kind, at }]. */
export function exerciseTypographyErrors(data) {
  return visibleTexts(data).flatMap(({ path, text, formula }) =>
    (formula ? mathErrors(text) : typographyErrors(text)).map((e) => ({ path, ...e })),
  );
}

/* ── The exam sheet: sub-items, provenance, brevet tags ────────────────── */

/** The sub-items of a step, as the brevet writes them: « a) », « b) »… (the sheet adds the « ) »). */
export const EXAM_SUBS = Object.freeze(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);

/**
 * The brevet sessions an exercise may cite or be modelled on: the papers since the 2017 reform of the DNB, and 2027,
 * the first session of the new format (part 1 automatisms without calculator, part 2 problems — its reference papers:
 * docs/curriculum/officiel/07, 16). [À VÉRIFIER DANS LE PROGRAMME OFFICIEL: whether earlier annals are wanted.]
 */
export const BREVET_YEARS = Object.freeze([2017, 2027]);
export const GRADES = Object.freeze(['6e', '5e', '4e', '3e']);
/** The grade whose final exam is the brevet (the Algerian rule reserved the BEM to 4AM the same way). */
export const BREVET_GRADE = '3e';
/** The badge of a 6e–4e exercise modelled on a class test (« contrôle ») — read by the sheet as « term » (no year). */
export const CONTROL_BADGE = 'Sur le modèle d’un contrôle';

const MODELLED_BADGE = /^Sur le modèle du brevet (\d{4})$/;
const inYears = (y) => Number.isInteger(y) && y >= BREVET_YEARS[0] && y <= BREVET_YEARS[1];

/** The grade of an exercise, read in its id `ex-<grade>-<lesson>-l<n>-<nnn>`. */
export const gradeOfExercise = (data) => /^ex-(6e|5e|4e|3e)-/.exec(data?.id ?? '')?.[1] ?? null;

/**
 * The PROVENANCE of an exercise (`metadata.source`, `metadata.exam.kind` / `badge`) — the French port of the Algerian
 * rule (BEM for 4AM, the term exam for 1AM–3AM):
 *  - 3e → the brevet: `official` / `excerpt` cite `{ type: "brevet", year, part: 1|2, exercise }` with the badge
 *    « Brevet <year> »; `modelled` carries « Sur le modèle du brevet <year> »;
 *  - 6e–4e → no official paper exists: never `official` nor `excerpt`, never the brevet; `modelled` carries
 *    « Sur le modèle d’un contrôle » and declares `{ type: "platform_addition", reason: "control_modelled",
 *    modelledOn: "<its grade>" }`;
 *  - `bem` (the Algerian exam) and `term_exam` (the deleted Algerian corpus) are refused everywhere;
 *  - `adapted` carries no badge.
 * @returns {string[]} the errors ([] = conforms)
 */
export function examProvenanceErrors(data) {
  const errors = [];
  const exam = data?.metadata?.exam;
  const source = data?.metadata?.source;
  const grade = gradeOfExercise(data);
  const brevetGrade = grade === BREVET_GRADE;

  if (source?.type === 'bem')
    errors.push('metadata.source.type « bem » cite l’examen algérien — un sujet français cite « brevet »');
  if (source?.type === 'term_exam')
    errors.push('metadata.source.type « term_exam » cite le corpus algérien supprimé — aucune source vérifiable');
  if (source?.type === 'brevet') {
    if (!brevetGrade)
      errors.push(
        `seule une leçon de 3e cite le brevet (exercice ${grade ?? '?'}) : son examen est un contrôle de la classe`,
      );
    if (!inYears(source.year))
      errors.push(
        `metadata.source.year doit être une session du brevet ${BREVET_YEARS.join('–')} (reçu ${JSON.stringify(source.year)})`,
      );
    if (![1, 2].includes(source.part))
      errors.push('metadata.source.part vaut 1 (automatismes, sans calculatrice) ou 2 (problèmes)');
    if (!Number.isInteger(source.exercise) || source.exercise < 1)
      errors.push('metadata.source.exercise est le numéro (≥ 1) de l’exercice du sujet');
  }
  if (source?.type === 'platform_addition' && source.reason === 'control_modelled') {
    if (brevetGrade)
      errors.push('une leçon de 3e est modelée sur le brevet, pas sur un contrôle (reason « brevet_modelled »)');
    if (source.modelledOn !== grade)
      errors.push(
        `metadata.source.modelledOn est le niveau de l’exercice « ${grade} » (reçu ${JSON.stringify(source.modelledOn)})`,
      );
  }

  if (!exam || typeof exam !== 'object') return errors;
  if (exam.kind === 'official' || exam.kind === 'excerpt') {
    if (!brevetGrade)
      errors.push(
        `un exercice de ${grade ?? '?'} n’est jamais « ${exam.kind} » : aucun sujet officiel n’existe pour ce niveau`,
      );
    if (source?.type !== 'brevet')
      errors.push(`un exercice « ${exam.kind} » cite sa session : metadata.source.type = "brevet"`);
    else if (exam.badge !== `Brevet ${source.year}`)
      errors.push(`metadata.exam.badge doit valoir « Brevet ${source.year} » (reçu ${JSON.stringify(exam.badge)})`);
  }
  if (exam.kind === 'modelled') {
    if (brevetGrade) {
      const m = MODELLED_BADGE.exec(exam.badge ?? '');
      if (!m || !inYears(Number(m[1])))
        errors.push(
          `un exercice « modelled » de 3e porte le badge « Sur le modèle du brevet <année> », année ${BREVET_YEARS.join('–')} (reçu ${JSON.stringify(exam.badge)})`,
        );
    } else {
      if (exam.badge !== CONTROL_BADGE)
        errors.push(
          `un exercice « modelled » de ${grade ?? '?'} porte le badge « ${CONTROL_BADGE} » (reçu ${JSON.stringify(exam.badge)})`,
        );
      if (!(source?.type === 'platform_addition' && source.reason === 'control_modelled')) {
        errors.push('un exercice « modelled » de 6e–4e déclare sa source : platform_addition / control_modelled');
      }
    }
  }
  if (exam.kind === 'adapted' && exam.badge != null)
    errors.push('un exercice « adapted » ne porte pas de badge : il ne vient pas d’un sujet');
  return errors;
}

/**
 * The two tags of the bank decided by the owner's council (plan §7bis): `brevet: 1 | 2 | null` — the part of the
 * brevet the exercise trains (1 = automatisms WITHOUT calculator, 2 = problems, null = neither) — and
 * `calculator: true | false`. Optional below 3e (checked when present), REQUIRED on every 3e exercise.
 * `brevet: 1` implies `calculator: false`; a brevet excerpt trains the part it was taken from.
 * @returns {string[]}
 */
export function brevetTagErrors(data, grade = gradeOfExercise(data)) {
  const errors = [];
  const required = grade === BREVET_GRADE;
  const has = (k) => Object.prototype.hasOwnProperty.call(data ?? {}, k);
  if (has('brevet')) {
    if (![1, 2, null].includes(data.brevet))
      errors.push(`brevet vaut 1 (automatismes), 2 (problèmes) ou null (reçu ${JSON.stringify(data.brevet)})`);
  } else if (required)
    errors.push('brevet est obligatoire en 3e : 1 (automatismes, sans calculatrice), 2 (problèmes) ou null');
  if (has('calculator')) {
    if (typeof data.calculator !== 'boolean')
      errors.push(`calculator est un booléen (reçu ${JSON.stringify(data.calculator)})`);
  } else if (required) errors.push('calculator est obligatoire en 3e : true (calculatrice permise) ou false');
  if (data?.brevet === 1 && data.calculator !== false)
    errors.push('brevet: 1 (automatismes) se fait SANS calculatrice : calculator doit valoir false');
  const source = data?.metadata?.source;
  if (source?.type === 'brevet' && [1, 2].includes(source.part) && has('brevet') && data.brevet !== source.part) {
    errors.push(
      `un extrait du brevet entraîne la partie dont il vient : brevet doit valoir ${source.part} (metadata.source.part)`,
    );
  }
  return errors;
}
