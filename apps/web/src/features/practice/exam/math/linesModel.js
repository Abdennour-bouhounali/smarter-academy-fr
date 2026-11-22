/**
 * Les LIGNES d'une rédaction de feuille d'examen (« مراحل الحساب »، démonstration
 * « بيّن أن ») — modèle pur, sans React ni MathLive.
 *
 * Une ligne est soit du TEXTE (arabe, de droite à gauche), soit une FORMULE
 * (LaTeX saisi dans MathLive, de gauche à droite). Le texte enregistré reste une
 * simple chaîne — une ligne par ligne, une formule écrite `$…$` — que RichText
 * relit telle quelle : l'arabe en RTL, chaque formule isolée en LTR. C'est ce qui
 * rend « لأن 21 − 14 = 7 » lisible, là où un champ de texte unique l'inversait.
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
