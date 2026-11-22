#!/usr/bin/env node
/**
 * Porte de validation du contenu du « labo des énigmes » (l'échelle des défis).
 * Copie du principe de validate-exercises.mjs : un contrat est un script qui échoue.
 *
 * Ce que le schéma ne peut pas dire et qui se vérifie ici :
 *   — la réponse est lisible par le vrai juge (checkAnswer) et s'accepte elle-même,
 *     pour CHAQUE tuple de `params` ;
 *   — chaque erreur déclarée est REFUSÉE et reconnue comme elle-même ;
 *   — rien de ce que l'élève voit AVANT la porte (clés, réponses « Pas encore », exemple)
 *     ne contient la réponse, ni comme texte ni comme valeur ;
 *   — la tranche cachée suit le numéro, les sommets sont les multiples de 25 ;
 *   — une relecture de ≥ 6 pas a une pause « Explique-toi » ;
 *   — numéros et ids uniques, nom de fichier = NNNN-id.json ;
 *   — mots interdits (règles de contenu de la France, FRENCH_LANGUAGE_CONTRACT.md §9) ;
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

/* Règles de contenu de la France (FRENCH_LANGUAGE_CONTRACT.md §9, plan §7bis) — portage de la règle culturelle
   algérienne : jamais d'alcool, de tabac, de pari, de casino, de jeu d'argent ni de cartes à jouer ; aucune religion
   ni fête religieuse. Un DÉ, une pièce, une urne, une roue sont le matériel du brevet : permis comme EXPÉRIENCE
   (le dé était interdit en Algérie, il ne l'est plus). Les intérêts d'un prêt sont un contexte de pourcentages en
   France : retirés de la liste. Le porc reste interdit (« un contexte qui n'exclut personne » ❓ — à confirmer par le
   propriétaire, plan §7 ligne 7).
   Mots entiers, insensibles à la casse et aux élisions (« l'alcool », « d'alcool ») ; « Paris » (la ville) n'est pas
   « paris » (des paris) : seules les formes du verbe et « paris sportifs » sont cherchées. */
const FORBIDDEN_FR = [
  'alcool', 'alcools', 'alcoolisé', 'alcoolisée', 'alcoolisés', 'alcoolisées', 'vin', 'vins', 'bière', 'bières',
  'apéritif', 'apéritifs', 'champagne', 'whisky', 'vodka', 'rhum', 'cidre',
  'tabac', 'cigarette', 'cigarettes', 'cigare', 'cigares', 'vapoteuse',
  'pari', 'parier', 'parie', 'parient', 'pariez', 'parions', 'parieur', 'parieurs', 'casino', 'casinos', 'loto',
  'loterie', 'loteries', 'tombola', 'tiercé', 'poker', 'roulette', 'belote', 'tarot', 'blackjack',
  'porc', 'porcs', 'jambon', 'lardons', 'saucisson',
  'noël', 'pâques', 'halloween', 'ramadan', 'aïd', 'hanoucca', 'église', 'mosquée', 'synagogue', 'prière', 'bible', 'coran',
];
const FORBIDDEN_PHRASES_FR = ['paris sportifs', 'jeu d’argent', 'jeux d’argent', 'jeu de cartes', 'jeux de cartes', 'cartes à jouer', 'carte à jouer', 'jeu de 32 cartes', 'jeu de 52 cartes', 'machine à sous', 'ticket à gratter'];
const FORBIDDEN_EN = /\b(pigs?|pork|wine|beer|alcohol|casino|lottery|gambl\w*|betting|poker|usury|playing cards?)\b/i;
// 🎲 a die is allowed (an experiment); 🃏 a playing card is not; 🚬 tobacco.
const FORBIDDEN_EMOJI = /[🐷🐖🐗🍷🍺🍻🥂🍸🍹🥓🌭🎰🃏🚬🎄🎅⛪✝🕍🔯🕌]/u;
const normalize = (s) => String(s).toLowerCase().replace(/['’]/g, '’');
const wordPattern = (w) => new RegExp(`(?<!\\p{L})${w}(?!\\p{L})`, 'u');
const FORBIDDEN_WORD_PATTERNS = FORBIDDEN_FR.map((w) => [w, wordPattern(w)]);

export function forbiddenIn(text) {
  const s = normalize(text);
  for (const [w, re] of FORBIDDEN_WORD_PATTERNS) if (re.test(s)) return w;
  for (const p of FORBIDDEN_PHRASES_FR) if (s.includes(p)) return p;
  const en = FORBIDDEN_EN.exec(s);
  if (en) return en[0];
  const emoji = FORBIDDEN_EMOJI.exec(String(text));
  return emoji ? emoji[0] : null;
}

function* strings(node, path = '') {
  if (typeof node === 'string') yield [path, node];
  else if (Array.isArray(node)) for (const [i, v] of node.entries()) yield* strings(v, `${path}[${i}]`);
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) yield* strings(v, path ? `${path}.${k}` : k);
}

/** Les noms de fonctions et de constantes qu'une formule écrit en lettres latines. */
const MATH_WORDS = new Set(['sqrt', 'pi', 'sin', 'cos', 'tan', 'ln', 'log', 'exp', 'abs']);

/**
 * Les morceaux « mathématiques » d'un texte FRANÇAIS : suites de chiffres, de lettres isolées (les variables),
 * de noms de fonctions et d'opérateurs. Un mot de prose (deux lettres ou plus, ou une lettre accentuée) coupe la
 * suite — en arabe, toute lettre latine était des mathématiques ; en français, « Réponse » n'en est pas (plan §8bis).
 * Chaque suite est aussi proposée sans ses lettres isolées de bord (« a 0,3 » → « 0,3 » : « a » est le verbe).
 */
export function mathCandidates(text) {
  const out = new Set();
  const add = (piece) => {
    const c = piece.trim().replace(/[.,:;]+$/, '').replace(/^[.,]+/, '').trim();
    if (/[0-9A-Za-zπ√]/.test(c)) out.add(c);
  };
  const tokens = String(text).match(/\p{L}+|\d+(?:[.,]\d+)*|\s+|./gsu) ?? [];
  const isLetter = (t) => /^[A-Za-zπ]$/.test(t);
  const mathy = (t) =>
    /^\d/.test(t) || /^\s+$/.test(t) || /^[π√²³⁴+\-−*/×·÷^().,|=:;<>⩽⩾≤≥]$/u.test(t) || isLetter(t) || MATH_WORDS.has(t.toLowerCase());
  const runs = [[]];
  for (const t of tokens) {
    if (mathy(t)) runs.at(-1).push(t);
    else runs.push([]);
  }
  for (const run of runs) {
    for (const piece of run.join('').split(/[=:;]/)) add(piece);
    // The same run without an isolated letter at either end, standing apart (the French « a », « y » next to a number).
    const t = [...run];
    const trimSpaces = () => {
      while (t.length && /^\s+$/.test(t[0])) t.shift();
      while (t.length && /^\s+$/.test(t.at(-1))) t.pop();
    };
    trimSpaces();
    let cut = false;
    while (t.length > 2 && isLetter(t[0]) && /^\s+$/.test(t[1])) { t.splice(0, 2); cut = true; trimSpaces(); }
    while (t.length > 2 && isLetter(t.at(-1)) && /^\s+$/.test(t.at(-2))) { t.splice(-2, 2); cut = true; trimSpaces(); }
    if (cut) for (const piece of t.join('').split(/[=:;]/)) add(piece);
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

    if (c.replay.length >= 6 && !c.replay.some((s) => s.ask)) err('replay', 'une relecture de ≥ 6 pas a une pause « Explique-toi » (ask)');
    c.replay.forEach((s, i) => {
      if (s.ask && s.ask.correct >= s.ask.options.length) err(`replay[${i}].ask.correct`, 'indice hors des options');
    });
    if (c.replay.some((s) => s.phase === 'B')) withDeadEnd++;

    if (c.figure && !existsSync(join(FIGURES_DIR, `${c.figure.component}.jsx`))) err('figure.component', `aucune figure ${c.figure.component}.jsx dans apps/web/src/features/thinkingLab/figures/`);
    if (c.twin && !knownIds.has(c.twin)) warn('twin', `le jumeau « ${c.twin} » n'existe pas encore`);
    if (c.twin === c.id) err('twin', 'un défi n\'est pas son propre jumeau');

    for (const [path, text] of strings(c)) {
      const bad = forbiddenIn(text);
      if (bad) err(path, `mot interdit « ${bad} » (règles de contenu, FRENCH_LANGUAGE_CONTRACT.md §9)`);
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
