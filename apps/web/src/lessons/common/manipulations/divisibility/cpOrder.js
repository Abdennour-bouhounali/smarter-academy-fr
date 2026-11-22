/**
 * cpOrder — où se place la bonne réponse d'une question à choix des labos de la divisibilité (lot 2, 2026-10-28).
 * Les constructeurs `QUESTIONS` écrivent les options dans l'ordre naturel ; ce petit enveloppeur déplace la bonne réponse à une place qui dépend
 * des nombres de l'élève et de la question : elle n'est donc ni toujours première, ni toujours au milieu, et reste STABLE entre deux rendus
 * (sinon la carte se mélangerait à chaque frappe). Les `why` suivent leurs options.
 */
const seedOf = (ctx, id) => {
  const nums = Object.values(ctx).filter((v) => typeof v === 'number');
  return nums.reduce((s, n) => s + n, 0) + [...String(id)].reduce((s, c) => s + c.charCodeAt(0), 0);
};

function moveCorrect(options, seed) {
  const at = options.findIndex((o) => o.correct);
  if (at < 0) return options;
  const to = seed % options.length;
  const rest = options.filter((_, i) => i !== at);
  return [...rest.slice(0, to), options[at], ...rest.slice(to)];
}

/** `QUESTIONS` → mêmes constructeurs, bonne réponse déplacée (les questions `number` ne changent pas). */
export function ordered(build) {
  return Object.fromEntries(Object.entries(build).map(([id, fn]) => [id, (ctx, k) => {
    const q = fn(ctx, k);
    return q.kind === 'choice' ? { ...q, options: moveCorrect(q.options, seedOf(ctx, id)) } : q;
  }]));
}
