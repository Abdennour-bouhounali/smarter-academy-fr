/**
 * L'HORLOGE DU TEMPS RÉEL d'étude (docs/architecture/PARENT_SPACE.md §3) —
 * logique pure, sans DOM, testée par studyClock.test.js.
 *
 * À chaque pas, le temps écoulé est rangé dans UN état :
 *
 *   active : page visible, fenêtre au premier plan, un geste depuis moins de
 *            IDLE_AFTER_MS ;
 *   idle   : page visible, aucun geste — compté jusqu'à IDLE_CAP_MS d'affilée
 *            seulement (au-delà, l'élève est parti : rien n'est compté) ;
 *   away   : page cachée ou fenêtre quittée — compté jusqu'à AWAY_CAP_MS
 *            d'affilée ; chaque passage vers `away` est un « départ » (leave).
 *
 * Un pas ne couvre jamais plus de MAX_STEP_MS (veille de l'ordinateur,
 * onglet gelé). La plateforme ne sait RIEN des autres sites : `away` dit
 * seulement « pas sur cette page ».
 */
export const IDLE_AFTER_MS = 90_000;
export const IDLE_CAP_MS = 10 * 60_000;
export const AWAY_CAP_MS = 30 * 60_000;
export const MAX_STEP_MS = 90_000;

const LESSON_PATH = /^\/courses\/[^/]+\/[^/]+\/[^/]+\/(?!units(?:\/|$))[^/]+/;

/**
 * La SURFACE d'une adresse : où l'élève passe son temps. `null` = hors de
 * l'espace d'apprentissage (pages publiques, livres) : rien n'est compté.
 */
export function surfaceFor(pathname) {
  if (LESSON_PATH.test(pathname)) return 'lesson';
  if (pathname.startsWith('/courses')) return 'other';
  if (!pathname.startsWith('/espace')) return null;
  if (pathname.startsWith('/espace/pratique') || pathname.startsWith('/espace/corrections')) return 'practice';
  if (pathname.startsWith('/espace/defi') || pathname.startsWith('/espace/diagnostic')) return 'challenge';
  if (pathname.startsWith('/espace/atelier') || pathname.startsWith('/espace/cahier')) return 'lab';
  if (pathname.startsWith('/espace/jeux')) return 'game';
  return 'other';
}

export function createClock(now) {
  return { lastAt: now, mode: 'active', streak: 0, buckets: {} };
}

function modeFor({ now, visible, focused, lastInputAt }) {
  if (!visible || !focused) return 'away';
  return now - lastInputAt <= IDLE_AFTER_MS ? 'active' : 'idle';
}

/** Un pas de l'horloge ; rend une NOUVELLE horloge. */
export function step(clock, { now, visible, focused, lastInputAt, surface }) {
  const dt = Math.max(0, Math.min(MAX_STEP_MS, now - clock.lastAt));
  const mode = modeFor({ now, visible, focused, lastInputAt });
  const streakBefore = mode === clock.mode ? clock.streak : 0;
  const cap = mode === 'idle' ? IDLE_CAP_MS : mode === 'away' ? AWAY_CAP_MS : Infinity;
  const counted = Math.max(0, Math.min(dt, cap - streakBefore));

  const buckets = { ...clock.buckets };
  if (surface) {
    const b = { active: 0, idle: 0, away: 0, leaves: 0, ...buckets[surface] };
    b[mode] += counted;
    if (mode === 'away' && clock.mode !== 'away') b.leaves += 1;
    buckets[surface] = b;
  }

  return { lastAt: now, mode, streak: streakBefore + dt, buckets };
}

/**
 * Ce qui part au serveur : des SECONDES entières par surface. Les
 * millisecondes restantes restent dans l'horloge pour le battement suivant.
 * Rend `{ clock, segments }` ; `segments` est vide s'il n'y a rien à dire.
 */
export function drain(clock) {
  const buckets = {};
  const segments = [];
  for (const [surface, b] of Object.entries(clock.buckets)) {
    const sec = { active: Math.floor(b.active / 1000), idle: Math.floor(b.idle / 1000), away: Math.floor(b.away / 1000) };
    if (sec.active + sec.idle + sec.away > 0 || b.leaves > 0) {
      segments.push({ surface, ...sec, leaves: b.leaves });
    }
    buckets[surface] = {
      active: b.active - sec.active * 1000,
      idle: b.idle - sec.idle * 1000,
      away: b.away - sec.away * 1000,
      leaves: 0,
    };
  }
  return { clock: { ...clock, buckets }, segments };
}
