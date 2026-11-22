/**
 * « La réponse s’écrit dans sa forme » — le STANDARD des saisies de réponse (propriétaire, 2026-11-09 :
 * « une norme globale pour tous les exercices et questions »).
 * Contrat : EXERCISE_CONTRACT.md § « Answer templates ».
 *
 * Une fonction PURE : à partir de ce que le client a toujours (énoncé de la question, `answerFormat`,
 * `evaluationPolicy`) — jamais la réponse attendue — elle dit À QUOI ressemble la saisie. Les consignes
 * `answerFormat` sont lues EN FRANÇAIS (« en euros », « fraction irréductible », « nombre entier »…) :
 *
 *   gap       « 4,826 × [ ] = 48,26 » — la case remplace « … » (ou l'exposant n) DANS la formule
 *   form      « A = a x + [b] » — le coefficient demandé est une case, la forme est imprimée
 *   fraction  ± [ ] / [ ] — vraie barre ; dénominateur vide = entier
 *   percent   [ ] %
 *   quantity  [ ] € / m / ° / cm / h / min … — l'unité est imprimée, jamais tapée
 *   solution  x = [ ]
 *   digit     0 … 9 en boutons
 *   natural   chiffres seulement, milliers espacés
 *   signed    ± [ ]
 *   decimal   [ ] — « . » devient « , »
 *
 * La valeur envoyée reste `{ value }`, lue par AnswerEvaluator : rien ne change côté serveur.
 */

const GAP_TOKENS = ['\\ldots', '\\dots', '\\cdots', '…', '\\square', '\\Box'];

// L'unité imprimée après la case. L'ordre compte : « mètres carrés » avant « mètres », « kilomètres par heure »
// avant « kilomètres ».
const UNITS = [
  [/en\s+euros?\b|\(€\)/iu, '€'],
  [/en\s+centimètres?\s+carrés?|\(cm²\)/iu, 'cm²'],
  [/en\s+mètres?\s+carrés?|\(m²\)/iu, 'm²'],
  [/en\s+centimètres?\s+cubes?|\(cm³\)/iu, 'cm³'],
  [/en\s+kilomètres?\s+par\s+heure|km\/h/iu, 'km/h'],
  [/en\s+kilomètres?|\(km\)/iu, 'km'],
  [/en\s+centimètres?|\(cm\)/iu, 'cm'],
  [/en\s+millimètres?|\(mm\)/iu, 'mm'],
  [/en\s+mètres?|\(m\)/iu, 'm'],
  [/en\s+degrés?|\(°\)/iu, '°'],
  [/en\s+litres?|\(L\)/u, 'L'],
  [/en\s+kilogrammes?|\(kg\)/iu, 'kg'],
  [/en\s+grammes?|\(g\)/iu, 'g'],
  [/en\s+heures?\b|\(h\)/iu, 'h'],
  [/en\s+minutes?\b|\(min\)/iu, 'min'],
];

// « nombre relatif », « entier relatif » : la réponse peut être négative.
const SIGNED = /relatif|négatif/iu;

/** Les segments `$…$` d'un texte : [{ math, text }]. */
export function splitMath(text) {
  const parts = [];
  const re = /\$([^$]+)\$/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ math: false, text: text.slice(last, m.index) });
    parts.push({ math: true, text: m[1] });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push({ math: false, text: text.slice(last) });
  return parts;
}

/** La 1re occurrence d'un jeton de trou → { pre, post, tok } | null. */
function cutAt(latex, tokens) {
  let best = null;
  for (const tok of tokens) {
    const i = latex.indexOf(tok);
    if (i >= 0 && (!best || i < best.i)) best = { i, tok };
  }
  return best ? { pre: latex.slice(0, best.i), post: latex.slice(best.i + best.tok.length), tok: best.tok } : null;
}

/**
 * La lettre-coefficient (pas une lettre d'une commande \sqrt, \dfrac…) → { pre, post } | null.
 * Seul ce qui la PRÉCÈDE compte : un coefficient est souvent suivi de sa variable (« bx », « at^2 »).
 */
function cutLetter(latex, letter) {
  const re = new RegExp(`(?<![\\\\A-Za-z])${letter}`);
  const m = re.exec(latex);
  return m ? { pre: latex.slice(0, m.index), post: latex.slice(m.index + 1) } : null;
}

/** Accolades équilibrées (hors `\{ \}`) : une case au milieu d'un groupe ne se coupe pas. */
function balanced(latex) {
  let depth = 0;
  for (let i = 0; i < latex.length; i += 1) {
    if (latex[i] === '\\') { i += 1; continue; }
    if (latex[i] === '{') depth += 1;
    if (latex[i] === '}') depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

const joinParts = (parts) => parts.map((x) => (x.math ? `$${x.text}$` : x.text)).join('');

function gapTemplate(question) {
  const statement = String(question.statement ?? '');
  const format = String(question.answerFormat ?? '');
  const parts = splitMath(statement);
  // Un exposant à trouver (« l'exposant $n$ ») : la case va À LA PLACE de n dans 10^{n}.
  const exp = /l['’]exposant\s*\$(\w)\$/iu.exec(format)?.[1];
  const tokens = exp ? [...GAP_TOKENS, `^{${exp}}`] : GAP_TOKENS;
  for (let k = 0; k < parts.length; k += 1) {
    if (!parts[k].math) continue;
    const cut = cutAt(parts[k].text, tokens);
    if (!cut || !balanced(cut.pre) || !balanced(cut.post)) continue;
    return {
      kind: 'gap',
      before: joinParts(parts.slice(0, k)),
      pre: cut.pre,
      post: cut.post,
      after: joinParts(parts.slice(k + 1)),
      raised: Boolean(exp) && cut.tok === `^{${exp}}`,
      signed: SIGNED.test(format),
    };
  }
  return null;
}

function formTemplate(question) {
  const format = String(question.answerFormat ?? '');
  // « $A$ s'écrit sous la forme $ax + b$ : écris seulement le nombre $b$ ».
  const m = /sous\s+la\s+forme\s*\$([^$]+)\$\s*[:;,]?\s*(?:[ée]cris|donne)\s+(?:seulement\s+|uniquement\s+)?(?:le\s+nombre|le\s+coefficient|la\s+valeur\s+de)\s*\$(\w)\$/iu.exec(format);
  if (!m) return null;
  const [, form, letter] = m;
  const cut = cutLetter(form, letter);
  if (!cut) return null;
  const subject = /\$([^$]+)\$\s*s['’][ée]crit/iu.exec(format)?.[1] ?? null;
  return { kind: 'form', subject, pre: cut.pre, post: cut.post, letter };
}

export function templateFor(question) {
  if (!question || question.answerType !== 'rational') return null;
  const format = String(question.answerFormat ?? '').trim();
  const required = question.evaluationPolicy?.requiredForm;

  const gap = gapTemplate(question);
  if (gap) return gap;
  const form = formTemplate(question);
  if (form) return form;
  if (/\bun\s+seul\s+chiffre(?!\s+après)/iu.test(format)) return { kind: 'digit' };
  if (/fraction|quotient|a\s*\/\s*b/iu.test(format) || required === 'irreducible' || required === 'fraction') {
    return { kind: 'fraction', irreducible: /irréductible/iu.test(format) || required === 'irreducible' };
  }
  if (/pourcentage|%/iu.test(format)) return { kind: 'percent' };
  const unit = UNITS.find(([re]) => re.test(format));
  if (unit) return { kind: 'quantity', unit: unit[1], signed: SIGNED.test(format) };
  const sol = /valeur\s+de\s*\$([a-z])\$/u.exec(format);
  if (sol) return { kind: 'solution', letter: sol[1], signed: true };
  // « nombre entier », « entier naturel », « nombre de boîtes » (un compte) ; pas « entier relatif ».
  if (/entier\s+naturel|nombre\s+entier(?!\s+relatif)/iu.test(format) || /^nombre\s+d(?:e\s+|['’])\s*[^\s(]+$/iu.test(format)) return { kind: 'natural' };
  if (SIGNED.test(format) && !/décimal|virgule/iu.test(format)) return { kind: 'signed' };
  return { kind: 'decimal', signed: SIGNED.test(format) };
}

/** La valeur lue par l'évaluateur, depuis les cases d'un modèle. `null` tant que c'est incomplet. */
export function templateValue(tpl, boxes) {
  const clean = (s) => String(s ?? '').replace(/[\s ]/g, '').replace('−', '-');
  if (!tpl) return null;
  if (tpl.kind === 'fraction') {
    const n = clean(boxes.num);
    const d = clean(boxes.den);
    if (!n) return null;
    const sign = boxes.negative ? '-' : '';
    return d ? `${sign}${n}/${d}` : `${sign}${n}`;
  }
  const v = clean(boxes.value);
  if (!v) return null;
  if (boxes.negative && !v.startsWith('-')) return `-${v}`;
  return v;
}
