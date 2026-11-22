/**
 * « الدخيل » — la simulation (pure : aucun DOM, aucune horloge).
 *
 * Une énigme après l'autre ; chacune montre 4 ou 5 cartes égales sauf une.
 *
 *   « الدخيل » touché          +points (ceux du niveau × multiplicateur ≤ ×4)
 *   une carte égale touchée  −1 bouclier, la série retombe
 *   le temps écoulé          −1 bouclier
 *
 * Après chaque choix, la RÉPONSE reste affichée `revealMs` : ce que les cartes
 * partagent, ce que vaut « الدخيل ». Toutes les `puzzlesPerRound` énigmes, la
 * manche se clôt : parfaite → +bonus, un bouclier rendu, un sous-niveau plus
 * haut ; deux fautes → plus bas (sniper/adapt.js). Plus de bouclier : fin, sans
 * reprise (le jeu est gratuit).
 *
 *   step(game, dt) → événements   (puzzle, hit, wrong, timeout, roundEnd, over)
 *   pick(game, index) → événement | null
 */
import { makePuzzle } from './puzzle';
import { LIVES, SCHEDULE, STREAK_STEP, timeLimit } from './constants';
import { perHit } from '../sniper/constants';
import { clampPos, levelOfPos, subOfPos } from '../sniper/levels';
import { adaptStep, warmStart } from '../sniper/adapt';

export const multiplierFor = (streak) => Math.min(SCHEDULE.maxMultiplier, 1 + Math.floor(streak / STREAK_STEP));

/**
 * `start` = la position de l'élève (`home`). Avec `warmup` (le défaut), la
 * partie commence deux niveaux plus bas et ses cinq premières
 * énigmes ne coûtent aucun bouclier : on gagne d'abord (sniper/adapt.js).
 */
export function createOdd(seed, { start = 0, autopilot = false, warmup = true } = {}) {
  const home = clampPos(start);
  const pos = warmup && !autopilot ? warmStart(home) : home;
  const game = {
    seed: seed >>> 0 || 1,
    autopilot,
    start: home,
    home,
    warmup: warmup && !autopilot,
    pos,
    peak: pos,
    prevBad: false,
    status: 'playing',
    lives: LIVES,
    score: 0,
    streak: 0,
    bestStreak: 0,
    hits: 0,
    wrong: 0,
    timeouts: 0,
    rounds: 0,
    round: { hits: 0, faults: 0 },
    i: 0,
    t: 0,
    reveal: null,
    puzzle: null,
    lastChange: null,
  };
  game.puzzle = makePuzzle(game.seed, 0, { level: levelOfPos(pos), sub: subOfPos(pos) });
  return game;
}

export const timeLeft = (game) => Math.max(0, timeLimit(game.i) - game.t);

function loseLife(game) {
  if (game.autopilot || isWarmingUp(game)) return;
  game.lives -= 1;
}

function settle(game, picked) {
  const p = game.puzzle;
  const correct = picked !== null && p.cards[picked]?.odd;
  if (correct) {
    game.streak += 1;
    game.bestStreak = Math.max(game.bestStreak, game.streak);
    const mult = multiplierFor(game.streak);
    const points = perHit(p.level) * mult;
    game.score += points;
    game.hits += 1;
    game.round.hits += 1;
    game.reveal = { picked, correct: true, left: SCHEDULE.revealMs / 1000 };
    return { type: 'hit', points, mult, streak: game.streak };
  }
  game.streak = 0;
  game.round.faults += 1;
  if (picked === null) game.timeouts += 1; else game.wrong += 1;
  loseLife(game);
  game.reveal = { picked, correct: false, left: SCHEDULE.revealMs / 1000 };
  return { type: picked === null ? 'timeout' : 'wrong', picked };
}

/** Toucher la carte `index` de l'énigme en cours. */
export function pick(game, index) {
  if (game.status !== 'playing' || game.reveal) return null;
  if (index < 0 || index >= game.puzzle.cards.length) return null;
  return settle(game, index);
}

function next(game, events) {
  const per = SCHEDULE.puzzlesPerRound;
  game.i += 1;
  game.t = 0;
  game.reveal = null;
  if (game.i % per === 0) {
    const level = game.puzzle.level;
    const perfect = game.round.faults === 0 && game.round.hits === per;
    let bonus = 0;
    if (perfect) {
      bonus = SCHEDULE.bonusFactor * perHit(level);
      game.score += bonus;
      if (game.lives < LIVES) game.lives += 1;
    }
    const from = game.pos;
    const step = adaptStep(game.pos, { perfect, faults: game.round.faults }, game.prevBad, game.home);
    game.pos = step.pos;
    game.prevBad = step.bad;
    game.peak = Math.max(game.peak, game.pos);
    game.rounds += 1;
    game.round = { hits: 0, faults: 0 };
    if (step.change !== 'same') game.lastChange = { kind: step.change, level: levelOfPos(game.pos), sub: subOfPos(game.pos), id: game.rounds };
    events.push({ type: 'roundEnd', perfect, bonus, change: step.change, from, pos: game.pos });
  }
  if (game.lives <= 0) {
    game.status = 'over';
    events.push({ type: 'over' });
    return;
  }
  game.puzzle = makePuzzle(game.seed, game.i, { level: levelOfPos(game.pos), sub: subOfPos(game.pos) });
  events.push({ type: 'puzzle', i: game.i, level: game.puzzle.level, sub: game.puzzle.sub });
}

/** La manche d'échauffement : on peut se tromper sans perdre de bouclier. */
export const isWarmingUp = (game) => game.warmup && game.i < SCHEDULE.puzzlesPerRound;

export function step(game, dt) {
  const events = [];
  if (game.status !== 'playing') return events;
  if (game.reveal) {
    game.reveal.left -= dt;
    if (game.reveal.left <= 0) next(game, events);
    return events;
  }
  game.t += dt;
  if (game.autopilot && game.t > 1.6 + (game.i % 3) * 0.4) {
    events.push(pick(game, game.puzzle.oddIndex));
    return events;
  }
  if (game.t >= timeLimit(game.i)) events.push(settle(game, null));
  return events;
}

/** Ce que la page envoie au serveur et montre à la fin. */
export function resultOf(game) {
  return {
    score: game.score,
    hits: game.hits,
    wrong: game.wrong + game.timeouts,
    bestStreak: game.bestStreak,
    puzzles: game.i,
    round: game.rounds,
    start: game.start,
    position: game.pos,
    peak: game.peak,
    level: levelOfPos(game.pos),
    sub: subOfPos(game.pos),
    accuracy: game.hits + game.wrong + game.timeouts > 0 ? game.hits / (game.hits + game.wrong + game.timeouts) : null,
  };
}
