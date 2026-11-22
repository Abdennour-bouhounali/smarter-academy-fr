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
 * `net` (optionnel) est un résolveur de createLearningNet : les tests passent le leur.
 */
import * as deliveredNet from '../curriculum/fr/net/learningNet.js';
import { taughtLessons, upcomingLessons } from '../curriculum/fr/calendar/schoolCalendar.js';

const TYPE_RANK = { requires: 0, extends: 1, consolidates: 2 };

/** Les prérequis directs d'un item (un pas), `requires` d'abord, sans doublon. */
export function prereqsOf(itemId, net = deliveredNet) {
  const seen = new Set();
  return net.linksInto(itemId)
    .slice()
    .sort((a, b) => TYPE_RANK[a.type] - TYPE_RANK[b.type])
    .map((l) => l.from)
    .filter((id) => {
      if (id === itemId || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
}

function itemsOfLessons(codes, net) {
  const out = [];
  for (const code of codes) {
    const l = net.getLesson(code);
    if (!l || l.kind === 'synthesis') continue;
    for (const id of l.programmeItems ?? []) if (!out.includes(id)) out.push(id);
  }
  return out;
}

/**
 * → { targets, taughtItems, upcomingItems, ruleA, ruleB, taughtLessons, upcomingLessons }
 * `targets` = règle B puis règle A (ordre de la classe), sans doublon.
 */
export function buildScope({
  progression, pointer, recentTaught = 10, maxUpcomingPrereqs = 4, upcomingWeeks = 3, net = deliveredNet,
}) {
  const taught = taughtLessons(progression, pointer);
  const upcoming = upcomingLessons(progression, pointer, upcomingWeeks);
  const taughtItems = itemsOfLessons(taught, net);
  const upcomingItems = itemsOfLessons(upcoming, net);
  const ruleA = taughtItems.slice(-recentTaught);
  const ruleB = [];
  for (const id of upcomingItems) {
    for (const p of prereqsOf(id, net)) {
      if (ruleB.length >= maxUpcomingPrereqs) break;
      if (!ruleB.includes(p) && !ruleA.includes(p) && !upcomingItems.includes(p)) ruleB.push(p);
    }
  }
  const targets = [...ruleB, ...ruleA.filter((id) => !ruleB.includes(id))];
  return { targets, taughtItems, upcomingItems, ruleA, ruleB, taughtLessons: taught, upcomingLessons: upcoming };
}

/**
 * Ce que le rapport affiche d'un item : texte, année, leçon où le réviser. A stub has no lesson to revise in:
 * `homeLesson: null`, `noLessonInGrade` names its grade.
 */
export function itemInfo(itemId, net = deliveredNet) {
  const it = net.getItem(itemId);
  if (!it) return null;
  const home = net.homeLessonOf(itemId);
  return {
    id: itemId,
    text: it.text,
    grade: it.grade,
    homeLesson: home ? { code: home.code, grade: home.grade, title: home.title, status: home.status } : null,
    noLessonInGrade: it.stub === true ? it.grade : null,
  };
}
