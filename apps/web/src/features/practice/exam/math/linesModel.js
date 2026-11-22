/**
 * Les LIGNES d'une rédaction de feuille d'examen (« Étapes du calcul », démonstration
 * « Démontrer que ») — modèle pur, sans React ni MathLive.
 *
 * Une ligne est soit du TEXTE, soit une FORMULE (LaTeX saisi dans MathLive). Le texte enregistré reste une
 * simple chaîne — une ligne par ligne, une formule écrite `$…$` — que RichText
 * relit telle quelle, chaque formule isolée dans son îlot KaTeX : « car 21 − 14 = 7 »
 * se lit comme il s'écrit, et une formule n'est jamais coupée par la saisie du texte.
 */

/** @typedef {{kind: 'text'|'math', value: string}} Line */

/** Une ligne entièrement écrite `$…$` est une formule ; toute autre est du texte. */
export function parseLines(text, startWith = 'math') {
  const raw = typeof text === 'string' && text.length ? text.split('\n') : [];
  const lines = raw.map((l) => {
    const m = /^\s*\$([^$]*)\$\s*$/.exec(l);
    return m ? { kind: 'math', value: m[1] } : { kind: 'text', value: l };
  });
  return lines.length ? lines : [{ kind: startWith, value: '' }];
}

/** Le texte enregistré : une formule s'écrit `$…$`, une ligne vide disparaît. */
export function serializeLines(lines) {
  return lines
    .map((l) => (l.kind === 'math' ? (l.value.trim() ? `$${l.value.trim()}$` : '') : l.value))
    .filter((l) => l.trim() !== '')
    .join('\n');
}
