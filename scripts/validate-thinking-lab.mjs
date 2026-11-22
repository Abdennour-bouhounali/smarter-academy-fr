#!/usr/bin/env node
/**
 * Porte de validation du contenu du « مختبر التفكير » (سُلَّم التحدّيات).
 * Copie du principe de validate-exercises.mjs : un contrat est un script qui échoue.
 *
 * Ce que le schéma ne peut pas dire et qui se vérifie ici :
 *   — la réponse est lisible par le vrai juge (checkAnswer) et s'accepte elle-même,
 *     pour CHAQUE tuple de `params` ;
 *   — chaque erreur déclarée est REFUSÉE et reconnue comme elle-même ;
 *   — rien de ce que l'élève voit AVANT la porte (clés, réponses « ليس بعد », exemple)
 *     ne contient la réponse, ni comme texte ni comme valeur ;
 *   — la tranche cachée suit le numéro, les sommets sont les multiples de 25 ;
 *   — une relecture de ≥ 6 pas a une pause « اشرح لنفسك » ;
 *   — numéros et ids uniques, nom de fichier = NNNN-id.json ;
 *   — mots interdits (règle culturelle et religieuse du dépôt) ;
 *   — en --strict : aucun défi `draft`, index généré à jour, ≥ 1 défi sur 5 montre une impasse.
 *
 *   node scripts/validate-thinking-lab.mjs [--strict] [--json]
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAgainstSchema } from './lib/jsonSchemaSubset.mjs';
import { readChallenges, indexIsFresh, CONTENT_ROOT, repoRoot } from './build-thinking-lab-index.mjs';
import { checkAnswer, mistakeExpression, expressionOptions, exactValue } from '../packages/core/thinkingLab/checkAnswer.js';
import { parseExpression, equivalentExpressions, evaluateExpression, closeEnough } from '../packages/core/thinkingLab/expression.js';
import { allTuples, fillChallenge } from '../packages/core/thinkingLab/params.js';

const FIGURES_DIR = join(repoRoot, 'apps/web/src/features/thinkingLab/figures');
const SCHEMA = JSON.parse(readFileSync(join(CONTENT_ROOT, '_schema/challenge.schema.json'), 'utf-8'));

/** Tranches cachées (THINKING_LAB.md §5 ; banque §1). */
export const BANDS = [
  { band: 'primary', from: 1, to: 120 },
  { band: 'middle', from: 121, to: 260 },
  { band: 'secondary', from: 261, to: 420 },
  { band: 'university', from: 421, to: 9999 },
];
export const bandOf = (number) => BANDS.find((b) => number >= b.from && number <= b.to)?.band;

/* Règle culturelle et religieuse (LESSON_DEVELOPMENT_GUIDE.md § « Cultural and religious respect »).
   Mots entiers ; seul l'article est permis comme préfixe (ال، وال، بال، فال) — une lettre seule ferait
   lire « بيرة » dans « كبيرة » et « رهان » dans « برهان ». Harakat retirées avant la recherche.
   « عيد الميلاد » seul n'est PAS interdit : c'est aussi l'anniversaire (défi #460). */
const FORBIDDEN_AR = [
  'خنزير', 'خنازير', 'خمر', 'خمور', 'كحول', 'نبيذ', 'بيرة', 'جعة', 'قمار', 'مقامرة', 'رهان', 'مراهنة',
  'يانصيب', 'كازينو', 'ربا', 'نرد', 'كوتشينة', 'الكريسماس', 'كريسماس', 'نويل', 'هالوين',
];
const FORBIDDEN_PHRASES_AR = ['فائدة بنكية', 'فوائد بنكية', 'قرض بفائدة', 'ورق اللعب', 'أوراق اللعب', 'عيد الميلاد المجيد', 'شجرة الميلاد'];
const FORBIDDEN_EN = /\b(pigs?|pork|wine|beer|alcohol|casino|lottery|gambl\w*|betting|poker|usury)\b/i;
const FORBIDDEN_EMOJI = /[🐷🐖🐗🍷🍺🍻🥂🍸🍹🥓🌭🎰🃏🎲🎄🎅⛪✝🕍🔯]/u;
const stripHarakat = (s) => s.replace(/[ً-ْـ]/g, '');
const wordPattern = (w) => new RegExp(`(?<!\\p{L})(?:[وفب]?ال)?${w.replace(/^ال/, '')}(?!\\p{L})`, 'u');
const FORBIDDEN_WORD_PATTERNS = FORBIDDEN_AR.map((w) => [w, wordPattern(w)]);

export function forbiddenIn(text) {
  const s = stripHarakat(String(text));
  for (const [w, re] of FORBIDDEN_WORD_PATTERNS) if (re.test(s)) return w;
  for (const p of FORBIDDEN_PHRASES_AR) if (s.includes(p)) return p;
  const en = FORBIDDEN_EN.exec(s);
  if (en) return en[0];
  const emoji = FORBIDDEN_EMOJI.exec(s);
  return emoji ? emoji[0] : null;
}

function* strings(node, path = '') {
  if (typeof node === 'string') yield [path, node];
  else if (Array.isArray(node)) for (const [i, v] of node.entries()) yield* strings(v, `${path}[${i}]`);
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) yield* strings(v, path ? `${path}.${k}` : k);
}

/** Les morceaux « mathématiques » d'un texte arabe : suites de chiffres, lettres latines et opérateurs. */
export function mathCandidates(text) {
  const out = new Set();
  for (const run of String(text).match(/[0-9A-Za-zπ√²³⁴+\-−*/×·÷^().,|٫ ]+/g) ?? []) {
    for (const piece of run.split(/[=:]/)) {
      const c = piece.trim().replace(/[.,:]+$/, '').replace(/^[.,]+/, '').trim();
      if (/[0-9A-Za-zπ√]/.test(c)) out.add(c);
    }
  }
  return [...out];
}

/** Le texte `text` divulgue-t-il la réponse `spec` ? (chaîne ou valeur) */
export function leaksAnswer(text, spec) {
  if (spec.check === 'choice') {
    const correct = (spec.choices ?? []).find((c) => c.id === spec.value);
    return Boolean(correct && correct.text.length > 2 && String(text).includes(correct.text));
  }
  for (const cand of mathCandidates(text)) {
    if (spec.check === 'expression') {
      const opts = expressionOptions(spec);
      if (!parseExpression(cand, opts.vars).ok) continue;
      if (equivalentExpressions(cand, String(spec.value), opts).equivalent) return cand;
    } else {
      const v = evaluateExpression(cand, {}, []);
      const expected = evaluateExpression(String(spec.value), {}, []);
      if (v !== null && expected !== null && closeEnough(v, expected, 1e-9, 1e-12)) return cand;
    }
  }
  return null;
}

/** Ce que l'élève voit AVANT que la porte s'ouvre (l'énoncé exclu : il porte les données). */
function beforeGateTexts(c) {
  const texts = [];
  (c.keys ?? []).forEach((k, i) => texts.push([`keys[${i}]`, k.text]));
  (c.mistakes ?? []).forEach((m, i) => texts.push([`mistakes[${i}].reply`, m.reply]));
  if (c.example) {
    texts.push(['example.statement', c.example.statement]);
    c.example.steps.forEach((s, i) => texts.push([`example.steps[${i}]`, s]));
  }
  return texts;
}

function checkAnswerSpec(spec, where, err) {
  if (spec.check === 'choice' && !(spec.choices ?? []).some((c) => c.id === spec.value)) {
    err(where, `la réponse « ${spec.value} » n'est pas un des choix`);
    return false;
  }
  try {
    // integer/rational : la valeur attendue peut être une expression constante remplie par params ;
    // l'élève, lui, écrit le nombre — c'est ce nombre exact que l'on soumet.
    const asTyped = ['integer', 'rational'].includes(spec.check) ? exactValue(String(spec.value))?.toString() ?? String(spec.value) : String(spec.value);
    const self = checkAnswer(spec, asTyped);
    if (!self.correct) err(where, `la réponse ne s'accepte pas elle-même (${self.outcome})`);
    return self.correct;
  } catch (e) {
    err(where, e.message);
    return false;
  }
}

/**
 * @param {{file: string, data?: object, error?: string}[]} entries
 * @returns {{errors: string[], warnings: string[]}}
 */
export function validateThinkingLab(entries, { strict = false } = {}) {
  const errors = [];
  const warnings = [];
  const ids = new Map();
  const numbers = new Map();
  const knownIds = new Set(entries.map((e) => e.data?.id).filter(Boolean));
  let withDeadEnd = 0;
  let valid = 0;

  for (const { file, data: c, error } of entries) {
    const err = (where, msg) => errors.push(`${file}${where ? ` › ${where}` : ''} : ${msg}`);
    const warn = (where, msg) => warnings.push(`${file}${where ? ` › ${where}` : ''} : ${msg}`);
    if (error) {
      err('', error);
      continue;
    }
    const schemaErrors = validateAgainstSchema(c, SCHEMA);
    if (schemaErrors.length) {
      for (const e of schemaErrors) err('schéma', e);
      continue;
    }
    valid++;

    const expectedFile = `${String(c.number).padStart(4, '0')}-${c.id}.json`;
    if (file !== expectedFile) err('', `le fichier doit s'appeler ${expectedFile}`);
    if (ids.has(c.id)) err('id', `« ${c.id} » déjà pris par ${ids.get(c.id)}`);
    ids.set(c.id, file);
    if (numbers.has(c.number)) err('number', `${c.number} déjà pris par ${numbers.get(c.number)}`);
    numbers.set(c.number, file);

    if (bandOf(c.number) !== c.band) err('band', `le numéro ${c.number} est dans la tranche « ${bandOf(c.number)} », pas « ${c.band} »`);
    if (c.summit !== (c.number % 25 === 0)) err('summit', `summit doit valoir ${c.number % 25 === 0} pour le numéro ${c.number}`);
    if (c.band === 'primary' && !c.example) err('example', 'la tranche primaire montre un exemple résolu AVANT l\'essai');
    if (c.band !== 'primary' && c.example) err('example', 'seule la tranche primaire a un exemple avant l\'essai');
    if (c.status === 'published' && c.keys.length !== 3) err('keys', `un défi publié a 3 clés (S → 👁 → R), il en a ${c.keys.length}`);
    if (strict && c.status !== 'published') err('status', 'rien de généré ne reste `draft` (règle du propriétaire)');

    if (c.replay.length >= 6 && !c.replay.some((s) => s.ask)) err('replay', 'une relecture de ≥ 6 pas a une pause « اشرح لنفسك » (ask)');
    c.replay.forEach((s, i) => {
      if (s.ask && s.ask.correct >= s.ask.options.length) err(`replay[${i}].ask.correct`, 'indice hors des options');
    });
    if (c.replay.some((s) => s.phase === 'B')) withDeadEnd++;

    if (c.figure && !existsSync(join(FIGURES_DIR, `${c.figure.component}.jsx`))) err('figure.component', `aucune figure ${c.figure.component}.jsx dans apps/web/src/features/thinkingLab/figures/`);
    if (c.twin && !knownIds.has(c.twin)) warn('twin', `le jumeau « ${c.twin} » n'existe pas encore`);
    if (c.twin === c.id) err('twin', 'un défi n\'est pas son propre jumeau');

    for (const [path, text] of strings(c)) {
      const bad = forbiddenIn(text);
      if (bad) err(path, `mot interdit « ${bad} » (règle culturelle et religieuse)`);
    }

    for (const values of allTuples(c.params)) {
      const f = fillChallenge(c, values);
      const tag = Object.keys(values).length ? ` [${JSON.stringify(values)}]` : '';
      for (const [path, text] of strings({ statement: f.statement, keys: f.keys, replay: f.replay })) {
        if (/\{[a-zA-Z][a-zA-Z0-9_]*\}/.test(text)) err(`${path}${tag}`, 'un {nom} non rempli (variable absente de params)');
      }
      if (!checkAnswerSpec(f.answer, `answer${tag}`, err)) continue;
      f.mistakes.forEach((m, i) => {
        try {
          const typed = ['integer', 'rational'].includes(f.answer.check) && !m.outside ? exactValue(String(m.value))?.toString() ?? String(m.value) : mistakeExpression(m);
          const r = checkAnswer(f.answer, typed, { mistakes: f.mistakes });
          if (r.outcome === 'syntax_error') err(`mistakes[${i}]${tag}`, `valeur illisible « ${m.value} »`);
          else if (r.correct) err(`mistakes[${i}]${tag}`, 'l\'erreur déclarée est ACCEPTÉE comme juste');
          else if (r.mistakeIndex !== i) err(`mistakes[${i}]${tag}`, `l'erreur n'est pas reconnue comme elle-même (reconnue : ${r.mistakeIndex})`);
        } catch (e) {
          err(`mistakes[${i}]${tag}`, e.message);
        }
      });
      for (const [where, text] of beforeGateTexts(f)) {
        const leak = leaksAnswer(text, f.answer);
        if (leak) err(`${where}${tag}`, `divulgue la réponse avant la porte (« ${leak} »)`);
      }
      (f.parts ?? []).forEach((p, i) => checkAnswerSpec(p.answer, `parts[${i}].answer${tag}`, err));
      if (f.ceiling) checkAnswerSpec(f.ceiling.answer, `ceiling.answer${tag}`, err);
    }
  }

  if (strict) {
    if (!indexIsFresh(entries)) errors.push('index.generated.json : périmé — relance `npm run build:thinking-lab-index`');
    if (valid > 0 && withDeadEnd * 5 < valid) errors.push(`banque : ${withDeadEnd} défi(s) sur ${valid} montrent une impasse « ↩ » (il en faut au moins un sur cinq)`);
  }
  return { errors, warnings };
}

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const entries = readChallenges();
  const { errors, warnings } = validateThinkingLab(entries, { strict });
  if (argv.includes('--json')) {
    console.log(JSON.stringify({ files: entries.length, errors, warnings }, null, 2));
  } else {
    console.log(`validate-thinking-lab: ${entries.length} défi(s) lu(s)${strict ? ' [strict]' : ''}`);
    if (warnings.length) {
      console.warn(`\n${warnings.length} avertissement(s) :`);
      for (const w of warnings) console.warn(`  - ${w}`);
    }
    if (errors.length) {
      console.error(`\n${errors.length} erreur(s) :`);
      for (const e of errors) console.error(`  - ${e}`);
    } else {
      console.log('Validation passed');
    }
  }
  return errors.length ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main());
