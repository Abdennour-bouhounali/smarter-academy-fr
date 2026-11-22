/**
 * « الإجابة تُكتب في شكلها » — le STANDARD des saisies de réponse (propriétaire, 2026-11-09 :
 * « une norme globale pour tous les exercices et questions » ; appliqué d'abord à « جولة الانطلاق »).
 * Contrat : EXERCISE_CONTRACT.md § « قوالب الإجابة ».
 *
 * Une fonction PURE : à partir de ce que le client a toujours (énoncé de la question, `answerFormat`,
 * `evaluationPolicy`) — jamais la réponse attendue — elle dit À QUOI ressemble la saisie :
 *
 *   gap       « 4,826 × [ ] = 48,26 » — la case remplace « … » (ou l'exposant n) DANS la formule
 *   form      « A = a x + [b] » — le coefficient demandé est une case, la forme est imprimée
 *   fraction  ± [ ] / [ ] — vraie barre ; dénominateur vide = entier
 *   percent   [ ] %
 *   quantity  [ ] دج / m / ° / cm … — l'unité est imprimée, jamais tapée
 *   solution  x = [ ]
 *   digit     0 … 9 en boutons
 *   natural   chiffres seulement, milliers espacés
 *   signed    ± [ ]
 *   decimal   [ ] — « . » devient « , »
 *
 * La valeur envoyée reste `{ value }`, lue par AnswerEvaluator : rien ne change côté serveur.
 */

const GAP_TOKENS = ['\\ldots', '\\dots', '\\cdots', '…', '\\square', '\\Box'];

const UNITS = [
  [/بالدينار|\(دج\)|\bDA\b/u, 'دج'],
  [/بالسنتيمتر المربع|\(cm²\)/u, 'cm²'],
  [/بالمتر المربع|\(m²\)/u, 'm²'],
  [/بالسنتيمتر المكعب|\(cm³\)/u, 'cm³'],
  [/بالكيلومتر في الساعة|km\/h/u, 'km/h'],
  [/بالكيلومتر|\(km\)/u, 'km'],
  [/بالسنتيمتر|\(cm\)/u, 'cm'],
  [/بالمليمتر|\(mm\)/u, 'mm'],
  [/بالمتر|\(m\)/u, 'm'],
  [/بالدرجة|\(°\)/u, '°'],
  [/باللتر|\(L\)/u, 'L'],
  [/بالكيلوغرام|\(kg\)/u, 'kg'],
  [/بالغرام|\(g\)/u, 'g'],
  [/بالساعة/u, 'سا'],
  [/بالدقيقة/u, 'د'],
];

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
  // Un exposant à trouver (« الأسّ $n$ ») : la case va À LA PLACE de n dans 10^{n}.
  const exp = /الأسّ?\s*\$(\w)\$/.exec(format)?.[1];
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
      signed: /نسبي|صحيح/.test(format),
    };
  }
  return null;
}

function formTemplate(question) {
  const format = String(question.answerFormat ?? '');
  const m = /على\s+الشكل\s*\$([^$]+)\$\s*[:：،]?\s*اكتب\s+(?:العدد|المعامل|قيمة)\s*\$(\w)\$\s*فقط/.exec(format);
  if (!m) return null;
  const [, form, letter] = m;
  const cut = cutLetter(form, letter);
  if (!cut) return null;
  const subject = /يُ?كتب\s*\$([^$]+)\$/.exec(format)?.[1] ?? null;
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
  if (/(^|\s)رقم\s+واحد(?!\s*بعد)/.test(format)) return { kind: 'digit' };
  if (/كسر|حاصل\s*قسمة|a\s*\/\s*b/.test(format) || required === 'irreducible' || required === 'fraction') {
    return { kind: 'fraction', irreducible: /لا\s*يقبل\s*الاختزال|غير\s*قابل\s*للاختزال/.test(format) || required === 'irreducible' };
  }
  if (/مئوية|%/.test(format)) return { kind: 'percent' };
  const unit = UNITS.find(([re]) => re.test(format));
  if (unit) return { kind: 'quantity', unit: unit[1], signed: /نسبي/.test(format) };
  const sol = /قيمة\s*\$([a-z])\$/.exec(format);
  if (sol) return { kind: 'solution', letter: sol[1], signed: true };
  if (/عدد\s+طبيعي/.test(format) || /^عدد\s+(?!عشري|نسبي|ناطق|صحيح|\()[^\s(]+$/.test(format)) return { kind: 'natural' };
  if (/نسبي|صحيح/.test(format) && !/عشري|الفاصلة/.test(format)) return { kind: 'signed' };
  return { kind: 'decimal', signed: /نسبي/.test(format) };
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
