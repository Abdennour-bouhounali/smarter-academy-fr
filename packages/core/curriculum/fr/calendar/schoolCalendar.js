/**
 * schoolCalendar — le calendrier scolaire et les progressions annuelles (collège)
 * comme DONNÉES, et les questions pures qu'on leur pose : quelle semaine est-ce,
 * qu'a déjà vu la classe, que vient-il ensuite, quelle est la prochaine échéance.
 *
 * Contrat : docs/architecture/YEAR_COMPASS.md §3. Importé PAR CHEMIN, jamais
 * depuis le barrel de @smarter-academy/core (BUNDLE_BOUNDARIES.md §3–§4).
 *
 * Règle du propriétaire (2026-11-09) : le calendrier est renouvelé CHAQUE année
 * (un fichier school_<aaaa>_<aaaa>.json) ; l'ordre des leçons par niveau change
 * rarement et n'est que revérifié.
 *
 * Toutes les dates sont des chaînes ISO « AAAA-MM-JJ » comparées comme chaînes
 * (aucun fuseau horaire en jeu).
 */
import school20262027 from './school_2026_2027.json' with { type: 'json' };
import prog6e20262027 from './progression_6e_2026_2027.json' with { type: 'json' };
import prog5e20262027 from './progression_5e_2026_2027.json' with { type: 'json' };
import prog4e20262027 from './progression_4e_2026_2027.json' with { type: 'json' };
import prog3e20262027 from './progression_3e_2026_2027.json' with { type: 'json' };

export const GRADES = ['6e', '5e', '4e', '3e'];

/** Années scolaires disponibles : année → { calendar, progressions[grade] }. */
export const SCHOOL_YEARS = {
  '2026/2027': {
    calendar: school20262027,
    // Empty until stage 2D writes the French year: validateSchoolYear refuses it, on purpose.
    progressions: { '6e': prog6e20262027, '5e': prog5e20262027, '4e': prog4e20262027, '3e': prog3e20262027 },
  },
};

/** L'année scolaire bascule le 15 août : '2026-08-14' → '2025/2026', '2026-08-15' → '2026/2027'. */
export function schoolYearOf(date) {
  const y = Number(date.slice(0, 4));
  const start = date.slice(5) >= '08-15' ? y : y - 1;
  return `${start}/${start + 1}`;
}

export function getSchoolYear(schoolYear) {
  return SCHOOL_YEARS[schoolYear] ?? null;
}

const utc = (d) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));

/** Ajoute n jours à une date ISO (UTC, sans fuseau). */
export function addDays(date, n) {
  return new Date(utc(date) + n * 86400000).toISOString().slice(0, 10);
}

export function daysBetween(from, to) {
  return Math.round((utc(to) - utc(from)) / 86400000);
}

/** Les évènements qui concernent un niveau (sans `grades` = tous les niveaux). */
export function eventsFor(calendar, grade) {
  return calendar.events.filter((e) => !e.grades || e.grades.includes(grade));
}

/** L'ordre des leçons de la progression, à plat : [{ code, weekIndex }]. */
export function lessonOrder(progression) {
  const out = [];
  progression.weeks.forEach((w, weekIndex) => {
    for (const code of w.lessons) out.push({ code, weekIndex });
  });
  return out;
}

/**
 * Index de la dernière semaine d'enseignement TERMINÉE à cette date (-1 si
 * aucune). Une semaine est terminée le lendemain de son `to`.
 */
function lastCompletedWeekIndex(calendar, date) {
  let idx = -1;
  calendar.weeks.forEach((w, i) => {
    if (w.to < date) idx = i;
  });
  return idx;
}

/**
 * Le pointeur PAR DÉFAUT (sans tap de l'élève ni choix du professeur) : la
 * dernière leçon de la dernière semaine terminée. `null` avant la première
 * semaine. Les leçons de la semaine en cours sont « à venir », pas « vues ».
 */
export function defaultPointer(calendar, progression, date) {
  const last = lastCompletedWeekIndex(calendar, date);
  for (let i = last; i >= 0; i -= 1) {
    const ls = progression.weeks[i].lessons;
    if (ls.length) return ls[ls.length - 1];
  }
  return null;
}

/**
 * Les leçons vues par la classe : toutes celles de la progression jusqu'au
 * pointeur INCLUS. Un pointeur absent de la progression → []. `null` → [].
 */
export function taughtLessons(progression, pointer) {
  if (!pointer) return [];
  const order = lessonOrder(progression);
  const at = order.findIndex((o) => o.code === pointer);
  if (at < 0) return [];
  return order.slice(0, at + 1).map((o) => o.code);
}

/**
 * Les leçons des `weeks` prochaines semaines de classe après le pointeur
 * (règle B : on teste leurs PRÉREQUIS, pas elles). Le reste de la semaine du
 * pointeur compte dans la première semaine.
 */
export function upcomingLessons(progression, pointer, weeks = 3) {
  const order = lessonOrder(progression);
  const at = pointer ? order.findIndex((o) => o.code === pointer) : -1;
  if (pointer && at < 0) return [];
  const rest = order.slice(at + 1);
  if (!rest.length) return [];
  const firstWeek = rest[0].weekIndex;
  return rest.filter((o) => o.weekIndex < firstWeek + weeks).map((o) => o.code);
}

/**
 * La prochaine échéance pour un niveau à une date : le prochain devoir (فرض),
 * examen ou sprint BEM pas encore terminé → { kind, label, from, to, daysLeft }
 * | null. `daysLeft` = 0 pendant l'échéance.
 */
export function nextMilestone(calendar, grade, date) {
  const kinds = new Set(['devoir', 'exam', 'bem_sprint']);
  const next = eventsFor(calendar, grade)
    .filter((e) => kinds.has(e.kind) && e.to >= date)
    .sort((a, b) => (a.from < b.from ? -1 : 1))[0];
  if (!next) return null;
  return { ...next, daysLeft: Math.max(0, daysBetween(date, next.from)) };
}

/** Ce qu'est la date pour un niveau : semaine de classe, vacances, examen… */
export function dayStatus(calendar, grade, date) {
  if (date < calendar.start) return { kind: 'before' };
  if (date > calendar.end) return { kind: 'after' };
  const ev = eventsFor(calendar, grade).find(
    (e) => e.from <= date && date <= e.to && e.kind !== 'devoir' && e.kind !== 'holiday',
  );
  if (ev) return { kind: ev.kind, label: ev.label };
  const weekIndex = calendar.weeks.findIndex((w) => w.from <= date && date <= w.to);
  if (weekIndex >= 0) return { kind: 'teaching', weekIndex, week: calendar.weeks[weekIndex] };
  return { kind: 'weekend' };
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const EVENT_KINDS = new Set(['evaluation', 'break', 'holiday', 'devoir', 'exam', 'bem_sprint']);

/**
 * Valide une année : calendrier + progressions face aux catalogues.
 * `catalogues[grade]` = liste des codes de leçon du catalogue de ce niveau.
 * → { errors: string[], warnings: string[] }.
 */
export function validateSchoolYear({ calendar, progressions, catalogues }) {
  const errors = [];
  const warnings = [];
  const okDate = (d, where) => {
    if (!ISO.test(d ?? '')) errors.push(`${where}: date invalide « ${d} »`);
  };
  okDate(calendar.start, 'start');
  okDate(calendar.end, 'end');
  const [y0, y1] = String(calendar.schoolYear ?? '').split('/').map(Number);
  if (!(y1 === y0 + 1)) errors.push(`schoolYear invalide « ${calendar.schoolYear} »`);
  const ids = new Set();
  calendar.weeks.forEach((w, i) => {
    okDate(w.from, `weeks[${i}].from`);
    okDate(w.to, `weeks[${i}].to`);
    if (w.from > w.to) errors.push(`semaine ${w.id}: from > to`);
    if (ids.has(w.id)) errors.push(`semaine ${w.id} en double`);
    ids.add(w.id);
    if (i > 0 && calendar.weeks[i - 1].to >= w.from) errors.push(`semaine ${w.id} chevauche la précédente`);
    if (w.from < calendar.start || w.to > calendar.end) errors.push(`semaine ${w.id} hors de l'année`);
    if (![1, 2, 3].includes(w.term)) errors.push(`semaine ${w.id}: trimestre invalide`);
  });
  calendar.events.forEach((e, i) => {
    okDate(e.from, `events[${i}].from`);
    okDate(e.to, `events[${i}].to`);
    if (!EVENT_KINDS.has(e.kind)) errors.push(`events[${i}]: kind inconnu « ${e.kind} »`);
    if (e.from > e.to) errors.push(`events[${i}]: from > to`);
    if (e.grades && e.grades.some((g) => !GRADES.includes(g))) errors.push(`events[${i}]: niveau inconnu`);
    if (!e.label) errors.push(`events[${i}]: label manquant`);
  });
  for (const g of GRADES) {
    for (const t of [1, 2, 3]) {
      const n = eventsFor(calendar, g).filter((e) => e.kind === 'exam' && e.term === t).length;
      if (n !== 1) errors.push(`${g}: ${n} examen(s) pour le trimestre ${t} (attendu 1)`);
    }
  }

  for (const g of GRADES) {
    const p = progressions[g];
    if (!p) {
      errors.push(`${g}: progression manquante`);
      continue;
    }
    if (p.schoolYear !== calendar.schoolYear) errors.push(`${g}: schoolYear ≠ calendrier`);
    if (p.weeks.length !== calendar.weeks.length) {
      errors.push(`${g}: ${p.weeks.length} semaines, calendrier ${calendar.weeks.length}`);
    }
    p.weeks.forEach((w, i) => {
      if (w.week !== calendar.weeks[i]?.id) {
        errors.push(`${g}: semaine ${i + 1} = « ${w.week} », attendu « ${calendar.weeks[i]?.id} »`);
      }
    });
    const known = new Set(catalogues[g] ?? []);
    const seen = new Map();
    for (const { code, weekIndex } of lessonOrder(p)) {
      const wk = p.weeks[weekIndex].week;
      if (!known.has(code)) errors.push(`${g}: « ${code} » (${wk}) absent du catalogue`);
      if (seen.has(code)) errors.push(`${g}: « ${code} » placé deux fois (${seen.get(code)} et ${wk})`);
      seen.set(code, wk);
    }
    const unscheduled = new Set();
    for (const u of p.unscheduled ?? []) {
      if (!known.has(u.code)) errors.push(`${g}: unscheduled « ${u.code} » absent du catalogue`);
      if (seen.has(u.code)) errors.push(`${g}: « ${u.code} » à la fois placé et unscheduled`);
      if (!u.reason) errors.push(`${g}: unscheduled « ${u.code} » sans raison`);
      unscheduled.add(u.code);
    }
    for (const code of known) {
      if (!seen.has(code) && !unscheduled.has(code)) {
        errors.push(`${g}: leçon du catalogue « ${code} » ni placée ni déclarée unscheduled`);
      }
    }
    for (const code of p.placedByPlatform ?? []) {
      if (!seen.has(code)) errors.push(`${g}: placedByPlatform « ${code} » n'est placé dans aucune semaine`);
    }
    if (p.unscheduled?.length) warnings.push(`${g}: ${p.unscheduled.length} leçon(s) hors progression de l'établissement`);
  }
  return { errors, warnings };
}

/**
 * Règle annuelle (propriétaire, 2026-11-09) : l'année scolaire en cours DOIT
 * avoir son calendrier ; du 1er juin au 14 août, l'année qui vient est
 * attendue (avertissement). `available` = liste des années présentes.
 */
export function yearlyRenewal(available, today) {
  const current = schoolYearOf(today);
  const errors = [];
  const warnings = [];
  if (!available.includes(current)) {
    errors.push(`aucun calendrier pour l'année scolaire en cours ${current} : renouveler school_<aaaa>_<aaaa>.json`);
  }
  const md = today.slice(5);
  if (md >= '06-01' && md < '08-15') {
    const y = Number(today.slice(0, 4));
    const next = `${y}/${y + 1}`;
    if (!available.includes(next)) warnings.push(`le calendrier ${next} n'existe pas encore : à préparer avant le 15 août`);
  }
  return { current, errors, warnings };
}
