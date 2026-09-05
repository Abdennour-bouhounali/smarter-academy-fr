/**
 * random — générateur pseudo-aléatoire DÉTERMINISTE (Lehmer / MINSTD).
 *
 * POURQUOI UNE GRAINE, ET PAS `Math.random` :
 * une simulation de probabilités est un objet mathématique. Elle doit être
 * rejouable — pour la tester (vitest), pour la piloter (Playwright), et pour
 * qu'un élève qui recharge la page ne voie pas ses 1000 lancers changer sous
 * ses yeux. RÈGLE : aucun `Math.random` dans l'état mathématique d'une leçon ;
 * une simulation reçoit toujours un `rng`, et le module dérive sa graine d'un
 * littéral plus un compteur d'essais.
 *
 * MINSTD : s ← 16807·s mod (2³¹ − 1). Période 2³¹ − 2, pas de graine nulle.
 * Suffisant pour des tirages pédagogiques ; ce n'est pas de la cryptographie.
 */

const M = 2147483647; // 2³¹ − 1, premier de Mersenne
const A = 16807;

/**
 * Fabrique un générateur à partir d'une graine entière.
 *
 * @param {number} seed - n'importe quel entier ; 0 et les multiples de M sont
 *   ramenés dans l'intervalle utile (une graine nulle figerait la suite).
 * @returns {{next: () => number, int: (n: number) => number,
 *            pick: <T>(arr: T[]) => T, shuffle: <T>(arr: T[]) => T[]}}
 */
export function makeRng(seed = 1) {
  let s = Math.trunc(Math.abs(seed)) % M;
  if (s <= 0) s = M - 1;

  /** Réel dans [0, 1[. */
  const next = () => {
    s = (s * A) % M;
    return (s - 1) / (M - 1);
  };

  /** Entier dans [0, n[ — uniforme tant que n reste petit devant M. */
  const int = (n) => {
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.floor(next() * n);
  };

  /** Un élément du tableau ; `undefined` si le tableau est vide. */
  const pick = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr[int(arr.length)] : undefined);

  /** Copie mélangée (Fisher-Yates) — l'entrée n'est jamais modifiée. */
  const shuffle = (arr) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = int(i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  return { next, int, pick, shuffle };
}
