/**
 * « L’échauffement » — the PURE engine of a launch: (tools, answers, time) → what comes next, the state of each tool, the score.
 *
 * A tool is one earlier savoir-faire the lesson stands on. Its station follows the band machine of « Ma boussole »
 * (`core/compass/engine.js › itemProgress`, the same one the server holds in PHP): an easy question, then a harder one; a
 * miss gets a second easy one — a tool is never judged on one answer; the game STOPS asking as soon as it knows (2 or 3
 * answers). « Pas sûr » counts as not succeeded for the band, never as a fault.
 *
 *   solid        « Solide »            two segments lit
 *   consolidate  « À consolider »      one segment
 *   start        « À reprendre »       none
 *   unseen       « Pas encore testé »  (time ran out)
 *
 * The gate (`gateOf`) is the capsule of a core tool left empty — see there.
 *
 * After the stations, ONE quick workshop repairs the weakest tool on the spot (a worked example, then two similar
 * questions). Repaired, a tool at « À reprendre » rises to « À consolider » and a tool at « À consolider » keeps its band:
 * what was just shown is not yet « Solide » — the next launch asks it again.
 */
import { itemProgress, BANDS } from '@smarter-academy/core/compass/engine.js';

export { BANDS };
export const CAP = Object.freeze({ seconds: 300, questions: 12, tools: 4, freshDays: 21, workshopNeeds: 50 });
const SEGMENTS = Object.freeze({ solid: 2, consolidate: 1, start: 0, unseen: 0 });
const DAY = 86400000;

/**
 * The tools of a lesson: `toolsForLesson(code)` of the learning net — its direct prerequisites, the CORE ones first (a
 * student cannot pass the lesson without them), then the supports, the nearest year first — kept when they have a question
 * family, at most four. A tool measured « Solide » in the last three weeks arrives charged and is not asked again.
 */
export function planTools(netTools, hasFamily, kit = {}, now = Date.now()) {
  const tools = [];
  for (const it of netTools) {
    if (!hasFamily(it.id) || tools.some((t) => t.item === it.id)) continue;
    const known = kit[it.id];
    const fresh = Boolean(known && known.band === BANDS.SOLID && now - known.at <= CAP.freshDays * DAY);
    tools.push({
      item: it.id,
      grade: it.grade,
      text: it.text,
      weight: it.weight ?? null,
      lesson: it.lesson,
      known: fresh,
    });
  }
  return tools.slice(0, CAP.tools);
}

const of = (answers, item, phase) => answers.filter((a) => a.item === item && a.phase === phase);
const ok = (a) => a.correct === true && !a.unsure;

/** The workshop of a launch, once the stations are over: the weakest tool (« À reprendre » before « À consolider »), or none. */
export function workshopTool(tools, answers) {
  const bands = tools
    .filter((t) => !t.known)
    .map((t) => ({ t, p: itemProgress(of(answers, t.item, 'station')) }))
    .filter((x) => x.p.done);
  const weak = bands.find((x) => x.p.band === BANDS.START) ?? bands.find((x) => x.p.band === BANDS.CONSOLIDATE);
  return weak ? { item: weak.t.item, level: weak.p.band === BANDS.START ? 1 : 2 } : null;
}

/**
 * What comes next. `skipWorkshop` is set when the student is re-checking one tool from the result screen.
 * → { type: 'question', item, level, phase, first } | { type: 'example', item, level } | { type: 'result' }
 */
export function nextStep({ tools, answers, elapsed = 0, exampleSeen = false, skipWorkshop = false }) {
  const asked = answers.filter((a) => a.phase === 'station').length;
  const out = elapsed >= CAP.seconds || asked >= CAP.questions;
  if (!out)
    for (const t of tools) {
      if (t.known) continue;
      const p = itemProgress(of(answers, t.item, 'station'));
      if (!p.done)
        return { type: 'question', item: t.item, level: p.next.level, phase: 'station', first: answers.length === 0 };
    }
  const w = skipWorkshop ? null : workshopTool(tools, answers);
  if (w) {
    const done = of(answers, w.item, 'workshop').length;
    if (done >= 2) return { type: 'result' };
    if (done === 0 && !exampleSeen)
      return elapsed <= CAP.seconds - CAP.workshopNeeds ? { type: 'example', ...w } : { type: 'result' };
    return { type: 'question', item: w.item, level: w.level, phase: 'workshop', first: false };
  }
  return { type: 'result' };
}

/** The state of every tool: its band, its lit segments, whether the workshop repaired it, the mistakes its answers named. */
export function kitOf(tools, answers) {
  return tools.map((t) => {
    if (t.known)
      return { ...t, band: BANDS.SOLID, segments: 2, repaired: false, capsule: false, measured: false, mistakes: [] };
    const station = of(answers, t.item, 'station');
    const p = itemProgress(station);
    const shop = of(answers, t.item, 'workshop');
    const cap = of(answers, t.item, 'capsule');
    const repaired =
      p.done && p.band !== BANDS.SOLID && ((shop.length >= 2 && shop.every(ok)) || (cap.length >= 2 && cap.every(ok)));
    const band = !p.done ? BANDS.UNSEEN : repaired && p.band === BANDS.START ? BANDS.CONSOLIDATE : p.band;
    return {
      ...t,
      band,
      segments: SEGMENTS[band],
      repaired,
      capsule: cap.length >= 2,
      measured: p.done,
      lit: station.filter(ok).length,
      mistakes: [...new Set([...station, ...shop, ...cap].map((a) => a.mistake).filter(Boolean))],
    };
  });
}

/**
 * THE GATE (owner, 2026-11-17: « the door opens by doing, not by scoring »). A CORE tool — one the lesson cannot be passed
 * without (`weight` of the learning net; a tool not classified yet counts as core) — left at « À reprendre » replaces the
 * take-off by ONE required short capsule of that tool: its card, a worked example, its instrument, two easy questions.
 * After the capsule the student goes in WHATEVER the two answers say: the tool stays as it is, flagged. Never a second
 * capsule in the same launch, never a dead end; a support tool never closes the door.
 * → the tool whose capsule is required now, or null (the take-off is open).
 */
export function gateOf(kit) {
  if (kit.some((t) => t.capsule)) return null;
  return kit.find((t) => t.weight !== 'support' && t.band === BANDS.START) ?? null;
}
export const CAPSULE_STEPS = ['card', 'example', 'lab', 'questions'];

/** The score: lit segments over the segments of the tools the game could measure (a tool cut by the clock does not count). */
export function scoreOf(kit) {
  const seen = kit.filter((t) => t.band !== BANDS.UNSEEN);
  const total = seen.length * 2;
  const lit = seen.reduce((n, t) => n + t.segments, 0);
  return { lit, total, percent: total ? Math.round((lit / total) * 100) : null };
}

/**
 * « Étoile de franchise »: the student knew what he knew — sure and right, or unsure and wrong — on at least four answers out of five
 * (three answers at least). It rewards an honest « Pas sûr », which is also what makes the doubt worth reading.
 */
export function honesty(answers) {
  const n = answers.length;
  const matched = answers.filter((a) => (a.correct && !a.unsure) || (!a.correct && a.unsure)).length;
  return { n, matched, star: n >= 3 && matched / n >= 0.8 };
}

/** What to revise: the weakest tool first (« À reprendre », then « À consolider » not repaired, then repaired), the others after. */
export function priorities(kit) {
  const rank = (t) => (t.band === BANDS.START ? 0 : t.band === BANDS.CONSOLIDATE ? (t.repaired ? 2 : 1) : 9);
  const weak = kit.filter((t) => rank(t) < 9).sort((a, b) => rank(a) - rank(b));
  return { first: weak[0] ?? null, also: weak.slice(1) };
}

/** How many consecutive right-and-sure answers end the list: the « flow » the music and the lights follow (show only). */
export const flowOf = (answers) => {
  let n = 0;
  for (let i = answers.length - 1; i >= 0 && ok(answers[i]); i -= 1) n += 1;
  return Math.min(3, n);
};

/** The result written in the student's toolbox: each measured tool, and the lesson's first and last score. A re-check of one tool from the result screen (`count: false`) updates the last score without counting a new try. */
export function mergeKit(store, lessonCode, kit, now = Date.now(), { count = true } = {}) {
  const items = { ...(store.items ?? {}) };
  for (const t of kit)
    if (t.measured)
      items[t.item] = { band: t.band, repaired: t.repaired, ...(t.capsule ? { capsule: true } : {}), at: now };
  const score = scoreOf(kit);
  const prev = store.lessons?.[lessonCode];
  const entry = { percent: score.percent, lit: score.lit, total: score.total, at: now };
  return {
    ...store,
    items,
    lessons: {
      ...(store.lessons ?? {}),
      [lessonCode]: {
        first: prev?.first ?? entry,
        last: entry,
        tries: Math.max(1, (prev?.tries ?? 0) + (count ? 1 : 0)),
      },
    },
  };
}
