/**
 * « الحساب الذهني » — la simulation (pure : aucun DOM, aucune horloge).
 *
 * Un problème après l'autre. L'élève tape la réponse (clavier ou pavé) ; la
 * réponse part TOUTE SEULE quand toutes les cases sont remplies (le nombre de
 * cases est celui de la réponse — c'est le rythme du jeu, rapide).
 *
 *   juste      +points du niveau × série (≤ ×4) + bonus de vitesse ; la fusée monte
 *   faux       −1 bouclier, la série retombe, la bonne réponse s'affiche
 *   temps écoulé −1 bouclier
 *
 * Toutes les `problemsPerRound` réponses, la manche se clôt et le niveau
 * s'adapte (sniper/adapt.js). Plus de bouclier : fin, sans reprise.
 *
 *   step(game, dt) → événements   (problem, hit, wrong, timeout, roundEnd, planet, over)
 *   press(game, key) → événement | null    key : '0'…'9', '−', ',', 'back', 'enter'
 */
import { makeProblem } from './levels';
import { LIVES, PLANET_EVERY, SCHEDULE, STREAK_STEP, timeLimit } from './constants';
import { perHit } from '../sniper/constants';
import { clampPos, levelOfPos, subOfPos } from '../sniper/levels';
import { adaptStep, warmStart } from '../sniper/adapt';

export const multiplierFor = (streak) => Math.min(SCHEDULE.maxMultiplier, 1 + Math.floor(streak / STREAK_STEP));

/**
 * `start` = la position de l'élève (`home`). Avec `warmup` (le défaut), la
 * partie commence deux niveaux plus bas et ses cinq premières
 * réponses ne coûtent aucun bouclier : on gagne d'abord (sniper/adapt.js).
 */
export function createMental(seed, { start = 0, autopilot = false, warmup = true } = {}) {
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
    typed: '',
    feedback: null,
    lastChange: null,
    autoT: 0,
  };
  game.problem = makeProblem(game.seed, 0, { level: levelOfPos(pos), sub: subOfPos(pos) });
  return game;
}

export const timeLeft = (game) => Math.max(0, timeLimit(game.i) - game.t);

function submit(game, typed) {
  const p = game.problem;
  const correct = typed === p.answerText;
  if (correct) {
    game.streak += 1;
    game.bestStreak = Math.max(game.bestStreak, game.streak);
    const mult = multiplierFor(game.streak);
    const speed = Math.floor(perHit(p.level) * SCHEDULE.speedFactor * (timeLeft(game) / timeLimit(game.i)));
    const points = perHit(p.level) * mult + speed;
    game.score += points;
    game.hits += 1;
    game.round.hits += 1;
    game.feedback = { correct: true, typed, left: SCHEDULE.feedbackMs / 1000, points, speed };
    const event = { type: 'hit', points, mult, speed, streak: game.streak };
    if (game.hits % PLANET_EVERY === 0) event.planet = game.hits / PLANET_EVERY;
    return event;
  }
  game.streak = 0;
  game.round.faults += 1;
  if (typed === null) game.timeouts += 1; else game.wrong += 1;
  if (!game.autopilot && !isWarmingUp(game)) game.lives -= 1;
  // Une faute laisse le temps de LIRE la bonne réponse.
  game.feedback = { correct: false, typed, left: (SCHEDULE.feedbackMs / 1000) * 2 };
  return { type: typed === null ? 'timeout' : 'wrong' };
}

/** Une touche : un chiffre, le signe, la virgule, l'effacement, la validation. */
export function press(game, key) {
  if (game.status !== 'playing' || game.feedback) return null;
  const want = game.problem.answerText;
  if (key === 'back') { game.typed = game.typed.slice(0, -1); return { type: 'typed' }; }
  if (key === 'enter') return game.typed ? submit(game, game.typed) : null;
  if (key === '−' && game.typed !== '') return null;
  if (key === ',' && (game.typed.includes(',') || game.typed === '' || game.typed === '−')) return null;
  if (!/^[0-9]$/.test(key) && key !== '−' && key !== ',') return null;
  if (game.typed.length >= want.length) return null;
  game.typed += key;
  if (game.typed.length === want.length) return submit(game, game.typed);
  return { type: 'typed' };
}

function next(game, events) {
  const per = SCHEDULE.problemsPerRound;
  game.i += 1;
  game.t = 0;
  game.typed = '';
  game.feedback = null;
  if (game.i % per === 0) {
    const level = game.problem.level;
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
  game.problem = makeProblem(game.seed, game.i, { level: levelOfPos(game.pos), sub: subOfPos(game.pos) });
  events.push({ type: 'problem', i: game.i });
}

/** La manche d'échauffement : on peut se tromper sans perdre de bouclier. */
export const isWarmingUp = (game) => game.warmup && game.i < SCHEDULE.problemsPerRound;

export function step(game, dt) {
  const events = [];
  if (game.status !== 'playing') return events;
  if (game.feedback) {
    game.feedback.left -= dt;
    if (game.feedback.left <= 0) next(game, events);
    return events;
  }
  game.t += dt;
  if (game.autopilot) {
    game.autoT += dt;
    if (game.autoT > 0.32) {
      game.autoT = 0;
      events.push(press(game, game.problem.answerText[game.typed.length]));
    }
    return events.filter(Boolean);
  }
  if (game.t >= timeLimit(game.i)) events.push(submit(game, null));
  return events;
}

/** Ce que la page envoie au serveur et montre à la fin. */
export function resultOf(game) {
  const tries = game.hits + game.wrong + game.timeouts;
  return {
    score: game.score,
    hits: game.hits,
    wrong: game.wrong + game.timeouts,
    bestStreak: game.bestStreak,
    problems: game.i,
    round: game.rounds,
    start: game.start,
    position: game.pos,
    peak: game.peak,
    level: levelOfPos(game.pos),
    sub: subOfPos(game.pos),
    accuracy: tries > 0 ? game.hits / tries : null,
  };
}
