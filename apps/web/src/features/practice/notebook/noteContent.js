import katex from 'katex';
import { isolateMathRuns } from '../../../utils/bidi';
import { factorizationToPlain } from '@smarter-academy/core/practice/factorization.js';

/**
 * Le CONTENU d'une note de carnet : sa forme, sa fabrication, sa désinfection.
 *
 * ── Deux formats cohabitent dans la colonne `content` ────────────────────
 * Les notes prises avant le carnet riche sont du TEXTE BRUT (« Penser à
 * vérifier le signe »). Les nouvelles sont du HTML restreint, produit par
 * l'éditeur. La base ne porte pas de drapeau de format — et n'en a pas
 * besoin : l'éditeur enveloppe toujours son contenu dans des blocs, donc un
 * contenu qui COMMENCE par un bloc est riche, tout autre est brut. Une note
 * brute qui commence par « < » existe en théorie (« <3 »…) mais aucune ne
 * commence par « <p> » ou « <section> » : le test est déterministe.
 *
 * ── Le HTML stocké n'est JAMAIS cru ───────────────────────────────────────
 * On le désinfecte à l'enregistrement ET au rendu, par LISTE BLANCHE : seules
 * les balises et attributs que l'éditeur sait produire survivent. `style` ne
 * garde que couleur, fond et taille — validés par expression régulière, pas
 * par confiance. Tout `on*`, `href`, `src`, `<script>`, `<img>`… disparaît.
 *
 * ── Les mathématiques ─────────────────────────────────────────────────────
 * Même dialecte que le reste du dépôt : `$…$` (KaTeX, voir MathText). Dans
 * l'éditeur la formule reste en clair ; au rendu (carnet, aperçu) elle est
 * dessinée dans un `<span dir="ltr">`, comme partout ailleurs. Le HTML de
 * KaTeX est produit APRÈS la désinfection, à partir du texte : il n'a jamais
 * été soumis par quiconque.
 *
 * Les fonctions qui touchent au DOM sont regroupées en bas et ne s'exécutent
 * que dans un navigateur ; celles du haut sont pures et testables en Node.
 */

/** Limite serveur (PracticeNotebookController) — le client la connaît pour refuser AVANT l'aller-retour. */
export const MAX_CONTENT_LENGTH = 12000;

const RICH_CONTENT_RE = /^\s*<(p|h[1-6]|ul|ol|div|section|blockquote)[\s>]/i;

/** Une note enregistrée est-elle en HTML (nouveau carnet) ou en texte brut (ancien) ? */
export function isRichContent(content) {
  return typeof content === 'string' && RICH_CONTENT_RE.test(content);
}

export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Le dialecte des fichiers d'exercice (RichText) → HTML de note : le texte
 * est échappé, `**gras**` devient <strong>, et `$…$` reste TEL QUEL — la
 * formule sera dessinée au rendu, pas figée en HTML dans la base.
 */
export function inlineMarkupToHtml(text) {
  const escaped = escapeHtml(text);

  return escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/** Un texte brut (ancienne note, ou collage) → paragraphes éditables. */
export function plainTextToHtml(text) {
  const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n');

  return lines.map((line) => `<p>${line.trim() === '' ? '<br>' : inlineMarkupToHtml(line)}</p>`).join('');
}

const INTERVAL_INF = { lo: '−∞', hi: '+∞' };

/**
 * La réponse de l'élève, telle qu'il l'a saisie, en une ligne lisible.
 *
 * Une entrée par `answerType` du moteur (QuestionRenderer/REGISTRY) : la
 * forme de `answer` est celle que chaque widget émet, pas une abstraction.
 * `null` quand il n'y a rien à montrer — on n'invente jamais une réponse.
 *
 * @returns {{ text: string, ltr: boolean, markup: boolean } | null}
 *   `ltr` : notation mathématique, à isoler en gauche-à-droite.
 *   `markup` : le texte est dans le dialecte des exercices (`**`, `$`).
 */
export function formatAnswer(question, answer) {
  if (!question || answer == null) return null;
  const choices = question.choices ?? [];

  switch (question.answerType) {
    case 'choice': {
      const choice = choices.find((c) => c.id === answer.choiceId);
      return choice ? { text: choice.content ?? String(choice.id), ltr: false, markup: true } : null;
    }
    case 'multiChoice': {
      const picked = (answer.choiceIds ?? [])
        .map((id) => choices.find((c) => c.id === id))
        .filter(Boolean)
        .map((c) => c.content ?? String(c.id));
      return picked.length ? { text: picked.join(' ; '), ltr: false, markup: true } : null;
    }
    case 'factorization': {
      // Le LaTeX du champ (« 2^{3}\\times3 ») se relit « 2³ × 3 » ; une saisie illisible, telle quelle.
      const value = String(answer.value ?? '').trim();
      return value ? { text: factorizationToPlain(value) ?? value, ltr: true, markup: false } : null;
    }
    case 'rational':
    case 'integerSet': {
      const value = String(answer.value ?? '').trim();
      return value ? { text: value, ltr: true, markup: false } : null;
    }
    case 'affine': {
      const a = String(answer.a ?? '').trim();
      const b = String(answer.b ?? '').trim();
      if (!a && !b) return null;
      return { text: `a = ${a || '?'} ; b = ${b || '?'}`, ltr: true, markup: false };
    }
    case 'interval': {
      const lo = String(answer.lo ?? '').trim();
      const hi = String(answer.hi ?? '').trim();
      if (!lo && !hi) return null;
      const open = (side, isOpen) => (side === 'lo' ? (isOpen ? ']' : '[') : isOpen ? '[' : ']');
      const loOpen = lo === '' ? true : answer.loOpen !== false;
      const hiOpen = hi === '' ? true : answer.hiOpen !== false;
      return {
        text: `${open('lo', loOpen)}${lo || INTERVAL_INF.lo} ; ${hi || INTERVAL_INF.hi}${open('hi', hiOpen)}`,
        ltr: true,
        markup: false,
      };
    }
    case 'point': {
      const x = String(answer.x ?? '').trim();
      const y = String(answer.y ?? '').trim();
      if (!x && !y) return null;
      return { text: `(${x || '?'} ; ${y || '?'})`, ltr: true, markup: false };
    }
    default:
      return null;
  }
}

const paragraphs = (text) => String(text ?? '')
  .split(/\n{2,}/)
  .map((p) => p.trim())
  .filter(Boolean)
  .map((p) => `<p>${inlineMarkupToHtml(p)}</p>`)
  .join('');

/**
 * Le contenu INITIAL d'une note ouverte depuis un exercice.
 *
 * Fabriqué à partir du vrai contexte — jamais figé dans la base autrement que
 * comme partie du `content` que l'élève choisit d'enregistrer. Les blocs
 * portent `data-nb` pour être stylés (et reconnus) comme du contexte, distinct
 * de l'écriture de l'élève ; ils restent éditables et « Tout effacer » les
 * emporte avec le reste.
 *
 * Le bloc « Mon erreur » n'existe QUE si l'élève a répondu et que la réponse n'est
 * pas juste. Pas de réponse, pas d'erreur inventée.
 *
 * @param {object} p
 * @param {object} p.exercise      le fichier d'exercice chargé
 * @param {object} p.question      la question courante
 * @param {*}      [p.answer]      la saisie de l'élève (forme du widget)
 * @param {object} [p.evaluation]  le résultat de evaluateAnswer, s'il a validé
 * @param {string} [p.feedbackMessage] le message de FeedbackPanel (dialecte exercice)
 * @param {string} [p.verdict]     le titre du verdict (practice.verdict.*)
 * @param {object} p.labels        libellés : exercise, question, mistake, myAnswer, verdict, noAnswer
 */
export function buildDefaultContent({
  exercise, question, answer = null, evaluation = null, feedbackMessage = '', verdict = '', labels,
}) {
  const parts = [];
  const title = exercise?.metadata?.title ? ` — ${inlineMarkupToHtml(isolateMathRuns(exercise.metadata.title))}` : '';

  const exerciseBody = [
    `<p data-nb="label">${escapeHtml(labels.exercise)}${title}</p>`,
    paragraphs(exercise?.statement?.content),
  ];
  if (question?.statement) {
    exerciseBody.push(`<p data-nb="label">${escapeHtml(labels.question)}</p>`);
    exerciseBody.push(paragraphs(question.statement));
  }
  parts.push(`<section data-nb="exercise">${exerciseBody.join('')}</section>`);

  if (evaluation && !evaluation.isCorrect) {
    const formatted = formatAnswer(question, answer);
    const answerHtml = formatted
      ? (formatted.markup ? inlineMarkupToHtml(formatted.text) : escapeHtml(formatted.text))
      : escapeHtml(labels.noAnswer);
    const answerSpan = formatted?.ltr ? `<span dir="ltr">${answerHtml}</span>` : answerHtml;
    const verdictLine = [verdict ? escapeHtml(verdict) : '', feedbackMessage ? inlineMarkupToHtml(feedbackMessage) : '']
      .filter(Boolean)
      .join(' — ');

    const mistakeBody = [
      `<p data-nb="label">${escapeHtml(labels.mistake)}</p>`,
      `<p><strong>${escapeHtml(labels.myAnswer)}\u00A0:</strong> ${answerSpan}</p>`,
      verdictLine ? `<p><strong>${escapeHtml(labels.verdict)}\u00A0:</strong> ${verdictLine}</p>` : '',
    ];
    parts.push(`<section data-nb="mistake">${mistakeBody.join('')}</section>`);
  }

  // La ligne où l'élève écrit : un paragraphe vide, pour que le curseur
  // tombe SOUS le contexte et non à l'intérieur.
  parts.push('<p><br></p>');

  return parts.join('');
}

/* ══════════════════════════════════════════════════════════════════════════
   À partir d'ici : DOM requis (navigateur).
   ══════════════════════════════════════════════════════════════════════════ */

// Balises que l'éditeur produit. Tout le reste est déballé (son texte
// survit, la balise non) — sauf les conteneurs de code exécutable, qui
// disparaissent AVEC leur contenu.
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
  'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'span', 'div', 'section', 'blockquote',
]);
const DROP_WITH_CHILDREN = new Set(['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'template', 'noscript', 'head', 'title', 'meta', 'link']);

const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)|[a-z]{3,20})$/i;
const FONT_SIZE_RE = /^(\d+(\.\d+)?(px|em|rem|%|pt)|xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large|smaller|larger)$/i;
const DIR_RE = /^(ltr|rtl|auto)$/;
const NB_RE = /^(exercise|mistake|knowledge|label)$/;
// <font size="1..7"> — ce que produit execCommand('fontSize') quand
// styleWithCSS est absent (Safari ancien) : on le traduit en taille CSS.
const FONT_SIZE_KEYWORDS = ['', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'xxx-large'];

function safeStyle(el) {
  const out = [];
  const color = el.style?.color;
  const background = el.style?.backgroundColor;
  const size = el.style?.fontSize;
  if (color && COLOR_RE.test(color)) out.push(`color: ${color}`);
  if (background && COLOR_RE.test(background)) out.push(`background-color: ${background}`);
  if (size && FONT_SIZE_RE.test(size)) out.push(`font-size: ${size}`);

  return out.join('; ');
}

function cleanNode(node, doc) {
  if (node.nodeType === Node.TEXT_NODE) return doc.createTextNode(node.nodeValue);
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  let tag = node.tagName.toLowerCase();
  if (DROP_WITH_CHILDREN.has(tag)) return null;

  let extraStyle = '';
  if (tag === 'font') {
    // <font color size> → <span style>
    tag = 'span';
    const color = node.getAttribute('color');
    const size = Number(node.getAttribute('size'));
    if (color && COLOR_RE.test(color)) extraStyle += `color: ${color}; `;
    if (FONT_SIZE_KEYWORDS[size]) extraStyle += `font-size: ${FONT_SIZE_KEYWORDS[size]}; `;
  }

  const fragment = doc.createDocumentFragment();
  const children = Array.from(node.childNodes).map((child) => cleanNode(child, doc)).filter(Boolean);

  if (!ALLOWED_TAGS.has(tag)) {
    // Déballé : le texte reste, la balise s'en va.
    children.forEach((c) => fragment.appendChild(c));
    return fragment;
  }

  const el = doc.createElement(tag);
  const style = `${extraStyle}${safeStyle(node)}`.trim().replace(/;\s*$/, '');
  if (style) el.setAttribute('style', style);
  const dir = node.getAttribute('dir');
  if (dir && DIR_RE.test(dir)) el.setAttribute('dir', dir);
  const nb = node.getAttribute('data-nb');
  if (nb && NB_RE.test(nb)) el.setAttribute('data-nb', nb);
  children.forEach((c) => el.appendChild(c));

  return el;
}

/**
 * HTML → HTML restreint. Idempotent : désinfecter deux fois donne la même
 * chose. Ne fait AUCUNE confiance à l'entrée, qu'elle vienne de l'éditeur,
 * d'un collage ou de la base.
 */
export function sanitizeHtml(html) {
  if (typeof document === 'undefined') return escapeHtml(html);
  const doc = new DOMParser().parseFromString(`<body>${String(html ?? '')}</body>`, 'text/html');
  const out = document.createElement('div');
  Array.from(doc.body.childNodes).forEach((n) => {
    const cleaned = cleanNode(n, document);
    if (cleaned) out.appendChild(cleaned);
  });

  return out.innerHTML;
}

/** Le texte seul, sans balise — pour « est-ce vide ? » et les comparaisons. */
function plainTextOf(html) {
  if (typeof document === 'undefined') return String(html ?? '').replace(/<[^>]*>/g, '');
  const div = document.createElement('div');
  div.innerHTML = sanitizeHtml(html);

  return div.textContent ?? '';
}

export function isEmptyContent(html) {
  return plainTextOf(html).replace(/ /g, ' ').trim() === '';
}

/** Même texte, espaces normalisés : « la note a-t-elle changé ? » sans bruit de balisage. */
export function normalizeForCompare(html) {
  return plainTextOf(html).replace(/[\s ]+/g, ' ').trim();
}

const MATH_RE = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;

function renderMathInto(root, doc) {
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const targets = [];
  let node = walker.nextNode();
  while (node) {
    if (node.nodeValue.includes('$')) targets.push(node);
    node = walker.nextNode();
  }

  targets.forEach((textNode) => {
    const pieces = textNode.nodeValue.split(MATH_RE);
    if (pieces.length < 2) return;
    const frag = doc.createDocumentFragment();
    pieces.forEach((piece) => {
      const block = piece.startsWith('$$') && piece.endsWith('$$') && piece.length > 4;
      const inline = !block && piece.startsWith('$') && piece.endsWith('$') && piece.length > 2;
      if (!block && !inline) {
        if (piece) frag.appendChild(doc.createTextNode(piece));
        return;
      }
      const tex = block ? piece.slice(2, -2) : piece.slice(1, -1);
      const span = doc.createElement(block ? 'div' : 'span');
      span.setAttribute('dir', 'ltr');
      span.className = block ? 'sa-math-block' : 'sa-math-inline';
      // throwOnError:false : une formule mal fermée s'affiche en rouge, en
      // clair — elle ne casse ni la note ni le carnet.
      span.innerHTML = katex.renderToString(block ? tex : `\\displaystyle ${tex}`, {
        throwOnError: false, displayMode: block, output: 'html',
      });
      frag.appendChild(span);
    });
    textNode.parentNode.replaceChild(frag, textNode);
  });
}

/**
 * Le HTML PRÊT À AFFICHER d'une note : désinfecté, puis mathématiques dessinées.
 * Accepte les deux formats — une ancienne note brute est d'abord mise en
 * paragraphes, ce qui lui offre KaTeX au passage.
 */
export function renderNoteHtml(content) {
  const source = isRichContent(content) ? content : plainTextToHtml(content);
  if (typeof document === 'undefined') return sanitizeHtml(source);
  const div = document.createElement('div');
  div.innerHTML = sanitizeHtml(source);
  renderMathInto(div, document);

  return div.innerHTML;
}
