/**
 * memoQuiz — la LOGIQUE PURE du défi chronométré « اختبر ذاكرتك » de la fiche de mémoire (MemoCard, PROTOTYPE 2026-10-28, propriétaire :
 * « un petit quiz facultatif, chronométré, au centre de l'écran sur fond assombri — simple, rapide, pratique, efficace »).
 *
 * Les questions viennent des items de la carte : `item.memo.quiz = [{ q, options: [3 textes], correct }]` (q et options : texte avec `$…$`).
 * `buildQuiz` en tire au plus `size`, celles des apports du module D'ABORD (une par item, puis une seconde), puis celles des acquis ;
 * les options sont mélangées (`rng`, injectable pour les tests). Un tour : `answer(s, i)` ou `timeout(s)` → révélé ; `next(s)` → suivante ou fin.
 */
const QUIZ_SIZE = 5;
export const SECONDS = 12;

function shuffle(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** @returns {Array<{ id, itemId, n, q, options: string[], correct: number }>} `n` : le numéro de la tuile de la règle (pour « راجع القاعدة 02 ») */
export function buildQuiz(items, moduleNumber, { size = QUIZ_SIZE, rng = Math.random } = {}) {
  const fresh = items.filter((i) => i.module === moduleNumber);
  const tiles = fresh.length > 0 ? fresh : items;
  const order = [...tiles, ...items.filter((i) => !tiles.includes(i))];
  const numberOf = (item) => (tiles.includes(item) ? tiles.indexOf(item) + 1 : null);
  const rounds = [];
  const maxPer = Math.max(0, ...order.map((i) => i.memo?.quiz?.length ?? 0));
  for (let r = 0; r < maxPer; r += 1) {
    for (const item of order) {
      const raw = item.memo?.quiz?.[r];
      if (raw) rounds.push({ item, raw, r });
    }
  }
  const picked = rounds.slice(0, size);
  const slots = answerSlots(picked.length, rng);
  return picked.map(({ item, raw, r }, qi) => {
    const wrong = shuffle(raw.options.filter((_, i) => i !== raw.correct), rng);
    const options = [...wrong];
    options.splice(slots[qi], 0, raw.options[raw.correct]);
    return { id: `${item.id}#${r}`, itemId: item.id, n: numberOf(item), q: raw.q, options, correct: slots[qi] };
  });
}

/**
 * La PLACE de la bonne réponse, question par question (propriétaire, 2026-10-28 : « un quiz où la bonne réponse est presque toujours
 * la 1re ou la 2e n'est pas un quiz ») : chaque place (0, 1, 2) sert autant que possible — au plus ⌈n/3⌉ fois — et jamais deux fois
 * de suite. Un mélange au hasard ne le garantit pas sur 5 questions.
 */
export function answerSlots(n, rng = Math.random) {
  const pool = shuffle(Array.from({ length: n }, (_, i) => i % 3), rng);
  for (let tries = 0; tries < 50; tries += 1) {
    const out = []; const left = [...pool];
    let ok = true;
    for (let i = 0; i < n; i += 1) {
      const choices = left.filter((p) => p !== out[i - 1]);
      if (choices.length === 0) { ok = false; break; }
      const p = choices[Math.floor(rng() * choices.length)];
      out.push(p); left.splice(left.indexOf(p), 1);
    }
    if (ok) return out;
  }
  return Array.from({ length: n }, (_, i) => i % 3);
}

export const start = (questions) => ({ questions, qi: 0, picked: null, timedOut: false, results: [], done: false });

const settle = (s, picked, timedOut, ms) => {
  if (s.done || s.picked != null || s.timedOut) return s;
  const q = s.questions[s.qi];
  const ok = !timedOut && picked === q.correct;
  return { ...s, picked, timedOut, results: [...s.results, { id: q.id, itemId: q.itemId, n: q.n, ok, ms }] };
};
/** La réponse de l'élève (indice d'option) ; `ms` : le temps mis. Sans effet si la question est déjà jugée. */
export const answer = (s, i, ms = 0) => settle(s, i, false, ms);
export const timeout = (s) => settle(s, null, true, SECONDS * 1000);
export const revealed = (s) => s.picked != null || s.timedOut;
export function next(s) {
  if (!revealed(s)) return s;
  if (s.qi + 1 >= s.questions.length) return { ...s, done: true };
  return { ...s, qi: s.qi + 1, picked: null, timedOut: false };
}

/** Le bilan : score, temps total (s, une décimale), étoiles (3 : tout juste ; 2 : au moins 60 % ; 1 sinon), règles à revoir (numéros, sans doublon). */
export function summary(s) {
  const total = s.questions.length;
  const score = s.results.filter((r) => r.ok).length;
  const seconds = Math.round(s.results.reduce((a, r) => a + r.ms, 0) / 100) / 10;
  const stars = score === total ? 3 : score >= Math.ceil(total * 0.6) ? 2 : 1;
  const review = [...new Set(s.results.filter((r) => !r.ok && r.n != null).map((r) => r.n))].sort((a, b) => a - b);
  return { score, total, seconds, stars, review };
}
