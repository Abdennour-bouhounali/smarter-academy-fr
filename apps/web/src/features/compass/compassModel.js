/**
 * « بوصلتي » — la logique PURE de l'écran (testée). Contrat :
 * docs/architecture/YEAR_COMPASS.md.
 *
 * Elle relie ce que le serveur a décidé (état, réponses corrigées, bandes) au
 * calendrier et au réseau : position de la classe, portée, rejeu du moteur,
 * rapport, semaine v0. Importée PAR CHEMIN et seulement sous la frontière
 * paresseuse de /espace/bawsala (le réseau est lourd — BUNDLE_BOUNDARIES.md).
 */
import {
  SCHOOL_YEARS, schoolYearOf, defaultPointer, nextMilestone, upcomingLessons, eventsFor, addDays, daysBetween,
} from '@smarter-academy/core/curriculum/dz/calendar/schoolCalendar.js';
import { buildScope, prereqsOf, itemInfo } from '@smarter-academy/core/compass/scope.js';
import { replay, bandsOf, bandCounts, priorities, BANDS } from '@smarter-academy/core/compass/engine.js';
import { getLesson } from '@smarter-academy/core/curriculum/dz/net/learningNet.js';

export { BANDS };

/** L'année scolaire et la progression du niveau à cette date (ou null). */
export function yearFor(grade, today) {
  const schoolYear = schoolYearOf(today);
  const year = SCHOOL_YEARS[schoolYear];
  const progression = year?.progressions?.[grade];
  return year && progression ? { schoolYear, calendar: year.calendar, progression } : null;
}

/**
 * La position de la classe. P1 : le tap de l'élève (seul ou en classe — la
 * couche enseignant arrive en P3), sinon le défaut par la date.
 * « لا أتابع قسمًا » : le défaut par la date en attendant le suivi des leçons
 * terminées sur la plateforme (P2).
 * → { pointer, source: 'student' | 'default' }
 */
export function resolvePointer({ profile, year, today }) {
  if (profile?.mode === 'lesson' && profile.lesson && year?.progression.weeks.some((w) => w.lessons.includes(profile.lesson))) {
    return { pointer: profile.lesson, source: 'student' };
  }
  return { pointer: year ? defaultPointer(year.calendar, year.progression, today) : null, source: 'default' };
}

/** Les leçons à proposer dans « أين وصل قسمك؟ » autour du pointeur suggéré (synthèses exclues). */
export function pointerChoices(year, suggested, before = 4, after = 1) {
  if (!year) return [];
  const order = year.progression.weeks.flatMap((w) => w.lessons)
    .filter((code) => getLesson(code)?.kind !== 'synthesis');
  let at = suggested ? order.indexOf(suggested) : -1;
  if (at < 0 && suggested) {
    // un pointeur sur une synthèse : la dernière leçon qui la précède
    const flat = year.progression.weeks.flatMap((w) => w.lessons);
    const idx = flat.indexOf(suggested);
    at = order.indexOf(flat.slice(0, idx).filter((c) => order.includes(c)).at(-1));
  }
  at = Math.max(0, at);
  const pick = order[at];
  return order.slice(Math.max(0, at - before), at + after + 1).map((code) => ({
    code, titleAr: getLesson(code)?.titleAr ?? code, suggested: code === pick,
  }));
}

export function scopeFor(year, pointer) {
  return buildScope({ progression: year.progression, pointer });
}

const hasQuestionIn = (availability) => (id, level) => Boolean(availability?.[id]?.includes(level));

/** Le moteur rejoué sur les réponses du serveur. */
export function sessionView(session, availability) {
  return replay({
    targets: session.targets ?? [],
    prereqsOf,
    answers: (session.answers ?? []).map((a) => ({ ...a })),
    hasQuestion: hasQuestionIn(availability),
  });
}

/**
 * Le rapport « خريطة نقاطي ». À la fin, les bandes sont celles du SERVEUR
 * (`session.bands`) ; le moteur ne sert qu'à classer la priorité. Un item
 * jamais mesuré est « لم نفحصها بعد », jamais faible.
 */
export function reportOf(session, availability) {
  const view = sessionView(session, availability);
  const local = bandsOf(view);
  const server = session.bands ?? null;
  const bands = new Map(view.order.map((id) => [id, server ? (server[id] ?? BANDS.UNSEEN) : local.get(id)]));
  const counts = bandCounts(bands);
  const p = priorities(view, bands);
  const line = (id) => ({ ...itemInfo(id), band: bands.get(id), step: view.items.get(id)?.step ?? 0 });
  const ranked = [p.priority, ...p.also, ...p.rest].filter(Boolean);
  return {
    counts,
    priority: p.priority ? line(p.priority) : null,
    also: p.also.map(line),
    all: [...ranked, ...view.order.filter((id) => !ranked.includes(id))].map(line),
  };
}

/**
 * La semaine v0 (P1) : la priorité à réviser, une « وأيضًا », et la
 * préparation de la prochaine leçon de la classe — 3 tâches au plus, jamais
 * de retard compté (la semaine glissante complète arrive en P2).
 */
export function weekV0(report, year, pointer) {
  const tasks = [];
  if (report.priority) tasks.push({ kind: 'revise', item: report.priority });
  if (report.also[0]) tasks.push({ kind: 'revise', item: report.also[0] });
  const next = year ? upcomingLessons(year.progression, pointer, 1).find((c) => getLesson(c)?.kind !== 'synthesis') : null;
  const lesson = next ? getLesson(next) : null;
  if (lesson) tasks.push({ kind: 'prepare', lesson: { code: lesson.code, titleAr: lesson.titleAr } });
  return tasks.slice(0, 3);
}

/**
 * L'année en bandes de semaines (dimanche → samedi), du début à la fin du calendrier,
 * pour la bande « السنة » de l'accueil. Chaque semaine : `kind` parmi
 * taught | now | coming | devoir | exam | break | eval | bem, et le mois (1–12) de son dimanche.
 * Une semaine prend l'évènement qui la touche (examen > devoir > vacances > BEM > évaluation),
 * sinon son statut de classe par rapport à aujourd'hui.
 */
export function yearStrip(year, grade, today) {
  if (!year) return [];
  const { calendar } = year;
  const events = eventsFor(calendar, grade);
  const PRIORITY = ['exam', 'devoir', 'break', 'bem_sprint', 'evaluation'];
  const KIND = { exam: 'exam', devoir: 'devoir', break: 'break', bem_sprint: 'bem', evaluation: 'eval' };
  const startDay = new Date(`${calendar.start}T00:00:00Z`).getUTCDay();
  let from = addDays(calendar.start, -startDay);
  const out = [];
  while (from <= calendar.end) {
    const to = addDays(from, 6);
    const hit = PRIORITY.map((k) => events.find((e) => e.kind === k && e.from <= to && e.to >= from && !(k === 'break' && daysBetween(e.from > from ? e.from : from, e.to < to ? e.to : to) < 2)))
      .find(Boolean);
    let kind;
    if (hit) kind = KIND[hit.kind];
    else if (today >= from && today <= to) kind = 'now';
    else kind = to < today ? 'taught' : 'coming';
    out.push({ from, to, kind, month: Number(from.slice(5, 7)), now: today >= from && today <= to });
    from = addDays(from, 7);
  }
  return out;
}

/** « الأسبوع N من 25 » : le rang de la semaine de classe en cours (ou de la dernière commencée). */
export function teachingWeekNumber(year, today) {
  if (!year) return null;
  const weeks = year.calendar.weeks;
  const started = weeks.filter((w) => w.from <= today).length;
  return { n: Math.max(0, started), total: weeks.length };
}

/**
 * La semaine v0 avec son avancement : une tâche est faite quand sa leçon a été
 * ouverte APRÈS la jauge (`visits[code]` = dernier passage, en ms ; `since` = fin de la jauge).
 * → { tasks: [{ ...task, code, done }], today: première tâche non faite | null, doneCount }
 */
export function tickTasks(tasks, visits, since) {
  const sinceMs = since ? Date.parse(since) : 0;
  const ticked = tasks.map((task) => {
    const code = task.kind === 'prepare' ? task.lesson.code : task.item?.homeLesson?.code ?? null;
    return { ...task, code, done: Boolean(code && (visits?.[code] ?? 0) > sinceMs) };
  });
  return { tasks: ticked, today: ticked.find((x) => !x.done) ?? null, doneCount: ticked.filter((x) => x.done).length };
}

export function milestone(year, grade, today) {
  return year ? nextMilestone(year.calendar, grade, today) : null;
}

/** Aujourd'hui en ISO local (aucun fuseau horaire dans les comparaisons). */
export function todayIso(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}
