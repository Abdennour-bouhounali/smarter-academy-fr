/**
 * Mise en forme pure de « مدار » (aucun appel réseau, aucun DOM).
 */
const NUMBER = new Intl.NumberFormat('en-US');

/** Les nombres du jeu en chiffres occidentaux groupés (ar-DZ), toujours en `dir="ltr"`. */
export function formatScore(n) {
  return NUMBER.format(Math.max(0, Math.round(n ?? 0)));
}

/** Les cœurs, un par case : plein / vide. */
export function heartSlots(hearts, max) {
  return Array.from({ length: Math.max(0, max) }, (_, i) => i < hearts);
}

/** La sortie de crash : continuer avec un cœur, gagner un cœur d'abord, ou finir. */
export function crashOptions({ hearts, revives, maxRevives }) {
  const canContinue = revives < maxRevives;
  return {
    revive: canContinue && hearts > 0,
    refuelToRevive: canContinue && hearts <= 0,
    revivesLeft: Math.max(0, maxRevives - revives),
  };
}

/** Une montée au classement, seulement si elle est réelle (jamais « tu as reculé »). */
export function rankMovement(rank) {
  if (!rank || rank.after == null) return null;
  if (rank.before == null || rank.after < rank.before) return { kind: 'up', to: rank.after };
  return { kind: 'same', to: rank.after };
}

/** Le prochain vaisseau à débloquer : le plus proche de son seuil. */
export function nextShipGoal(ships) {
  const locked = (ships ?? []).filter((s) => !s.unlocked && s.rule);
  if (locked.length === 0) return null;
  return locked
    .map((s) => ({ ...s, ratio: Math.min(1, s.rule.progress / s.rule.threshold) }))
    .sort((a, b) => b.ratio - a.ratio)[0];
}

/** Les jeux qui ne coûtent aucun cœur (le serveur fait foi : `games[].free`). */
const FREE_GAMES = ['sniper', 'odd', 'mental'];

/** Les jeux de mathématiques : 50 niveaux partagés, une position par élève et par jeu. */
export const MATH_GAMES = ['sniper', 'odd', 'mental'];

/** Un jeu gratuit, d'après l'état du serveur (repli : FREE_GAMES). */
export function isFreeGame(state, game) {
  const entry = (state?.games ?? []).find((g) => g.id === game);
  return entry ? Boolean(entry.free) : FREE_GAMES.includes(game);
}

/**
 * Ce qui empêche de lancer une partie maintenant (null = rien). Avec `game` :
 * ce jeu fermé (pour la classe ou pour CET élève) bloque, et un jeu gratuit
 * ne demande pas de cœur. La limite du jour compte tous les jeux.
 */
export function playBlocker(state, game = null) {
  if (!state) return 'loading';
  if (!state.available) return state.reason ?? 'disabled';
  if (game) {
    const entry = (state.games ?? []).find((g) => g.id === game);
    if (entry && entry.enabled === false) return entry.closedBy === 'student' ? 'game_disabled_for_student' : 'game_disabled';
  }
  if (state.runsToday >= state.dailyRunCap) return 'daily_cap';
  if (state.hearts < 1 && !(game && isFreeGame(state, game))) return 'no_hearts';
  return null;
}

/** Les jeux de la salle, rangés par famille : ترفيه puis رياضيات. */
export function gamesByCategory(games) {
  const groups = { fun: [], math: [] };
  for (const g of games ?? []) (groups[g.category] ?? groups.fun).push(g);
  return groups;
}

/** Le temps qui reste (ms) sur une question, d'après l'horloge corrigée du serveur. */
export function remainingMs(timeLimitS, elapsedMs) {
  return Math.max(0, timeLimitS * 1000 - elapsedMs);
}

/** La couleur du chronomètre : calme, puis ambre, puis rouge dans les dix dernières secondes. */
export function timerTone(remaining, total) {
  if (remaining <= 10_000) return 'danger';
  if (remaining <= total * 0.35) return 'warn';
  return 'calm';
}

/** Une absence de la page qui compte (une notification ou le clavier ne comptent pas). */
const LEAVE_MIN_MS = 1500;

export function countsAsLeft(awayMs) {
  return awayMs >= LEAVE_MIN_MS;
}

/** Les ajustements de l'enseignant, en messages : signe, nombre, motif. */
export function adjustmentKind(applied) {
  if (applied > 0) return 'gave';
  if (applied < 0) return 'took';
  return 'warned';
}
