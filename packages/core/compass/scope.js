/**
 * scope — ce que couvre « جولة الانطلاق » à une date, pour un niveau et un
 * pointeur (بوصلتي, P1). Contrat : docs/architecture/YEAR_COMPASS.md §4.
 *
 *  Règle A — vu en classe : les items des leçons jusqu'au pointeur (les plus
 *            récents retenus : `recentTaught`, 10 par défaut ; les plus anciens
 *            restent pour « تحقّق » dans la خطّة).
 *  Règle B — à venir : pour les leçons des 3 prochaines semaines, leurs
 *            PRÉREQUIS dans le réseau (jamais les leçons elles-mêmes), 4 au plus.
 *  Règle C — la descente (1 pas, puis 2, jamais 3) est faite par engine.js à
 *            partir de `prereqsOf`.
 *
 * Importé par chemin (jamais depuis le barrel) : il charge le réseau.
 */
import { getLesson, getItem, homeLessonOf, linksInto } from '../curriculum/dz/net/learningNet.js';
import { taughtLessons, upcomingLessons } from '../curriculum/dz/calendar/schoolCalendar.js';

const TYPE_RANK = { requires: 0, extends: 1, consolidates: 2 };

/** Les prérequis directs d'un item (un pas), `requires` d'abord, sans doublon. */
export function prereqsOf(itemId) {
  const seen = new Set();
  return linksInto(itemId)
    .slice()
    .sort((a, b) => TYPE_RANK[a.type] - TYPE_RANK[b.type])
    .map((l) => l.from)
    .filter((id) => {
      if (id === itemId || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
}

function itemsOfLessons(codes) {
  const out = [];
  for (const code of codes) {
    const l = getLesson(code);
    if (!l || l.kind === 'synthesis') continue;
    for (const id of l.programmeItems ?? []) if (!out.includes(id)) out.push(id);
  }
  return out;
}

/**
 * → { targets, taughtItems, upcomingItems, ruleA, ruleB, taughtLessons, upcomingLessons }
 * `targets` = règle B puis règle A (ordre de la classe), sans doublon.
 */
export function buildScope({ progression, pointer, recentTaught = 10, maxUpcomingPrereqs = 4, upcomingWeeks = 3 }) {
  const taught = taughtLessons(progression, pointer);
  const upcoming = upcomingLessons(progression, pointer, upcomingWeeks);
  const taughtItems = itemsOfLessons(taught);
  const upcomingItems = itemsOfLessons(upcoming);
  const ruleA = taughtItems.slice(-recentTaught);
  const ruleB = [];
  for (const id of upcomingItems) {
    for (const p of prereqsOf(id)) {
      if (ruleB.length >= maxUpcomingPrereqs) break;
      if (!ruleB.includes(p) && !ruleA.includes(p) && !upcomingItems.includes(p)) ruleB.push(p);
    }
  }
  const targets = [...ruleB, ...ruleA.filter((id) => !ruleB.includes(id))];
  return { targets, taughtItems, upcomingItems, ruleA, ruleB, taughtLessons: taught, upcomingLessons: upcoming };
}

/** Ce que le rapport affiche d'un item : texte, année, leçon où le réviser. */
export function itemInfo(itemId) {
  const it = getItem(itemId);
  if (!it) return null;
  const home = homeLessonOf(itemId);
  return {
    id: itemId,
    textAr: it.textAr,
    grade: it.grade,
    homeLesson: home ? { code: home.code, grade: home.grade, titleAr: home.titleAr, status: home.status } : null,
  };
}
