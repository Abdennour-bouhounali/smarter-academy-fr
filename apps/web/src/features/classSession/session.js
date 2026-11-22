/**
 * « حصّة القسم » — the CLASS SESSION of a teacher (owner's design, 2026-11-18). PURE logic; contract
 * docs/architecture/CLASS_SESSION.md.
 *
 * The lesson in class is ONE shared event: one screen, one mouse. A short test opens the hour (and another may close it);
 * the mouse goes from student to student, each called BY NAME, each answer met by a sentence that respects him — right or
 * not. At the end: what the class holds, the الكفاءات to revise, and a podium of the best TEAMS.
 *   - the seating map says who sits where; the turn follows it; a team is a « صفّ » (a vertical line of desks) by default, and the teacher may make as many
 *     teams as he wants (owner: « not necessarily 3 teams »), each under the name of a mathematician;
 *   - who answers next: by place (`order`), chosen by the teacher (`teacher`), or picked fairly by the platform (`fair`:
 *     among those who have spoken least) — the teacher switches at any moment;
 *   - NOTHING here is learning evidence: a class test never changes a student's progress.
 */

/** Team names: scholars of mathematics. The list is long enough for any class; a teacher may rename a team. */
export const SCHOLARS = [
  'الخوارزمي',
  'ابن الهيثم',
  'الكاشي',
  'عمر الخيّام',
  'البيروني',
  'ثابت بن قرّة',
  'أبو الوفاء',
  'الكرجي',
  'ابن البنّاء',
  'السموأل',
  'القلصادي',
  'ابن حمزة',
];
export const TEAM_COLORS = [
  '#0ea5e9',
  '#f59e0b',
  '#10b981',
  '#a855f7',
  '#ef4444',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
  '#ec4899',
  '#0891b2',
  '#ca8a04',
];
export const MODES = ['order', 'teacher', 'fair'];

/** A first seating for a class nobody has placed yet: the roster row by row, `cols` desks per row, row 1 at the board. */
export function defaultSeating(students, cols = 6) {
  return {
    cols,
    seats: students.map((s, i) => ({ student: s.id, r: Math.floor(i / cols), c: i % cols })),
    teams: null,
    genders: {},
  };
}

/** The seats in the order of the turn: row by row from the board, each row from its first desk. Students without a seat come last. */
export function turnOrder(seating, students) {
  const placed = [...(seating?.seats ?? [])]
    .filter((s) => students.some((x) => x.id === s.student))
    .sort((a, b) => a.r - b.r || a.c - b.c)
    .map((s) => s.student);
  return [...placed, ...students.map((s) => s.id).filter((id) => !placed.includes(id))];
}

/**
 * The teams. By default ONE TEAM PER « صفّ » — the VERTICAL line of desks that runs from the board to the back of the room
 * (owner, 2026-11-18: « pick the vertical one »): as many teams as there are such lines, i.e. `cols`. Seven students on four
 * lines make four teams of 2, 2, 2 and 1. A teacher who wants other teams gives `seating.teams = [{ id, name }]` and a `team`
 * on each seat; any number of teams is allowed.
 * → [{ id, name, color, members: [studentId] }], teams without a member left out.
 */
export function teamsOf(seating, students) {
  const known = new Set(students.map((s) => s.id));
  const seats = (seating?.seats ?? []).filter((s) => known.has(s.student));
  const custom = Array.isArray(seating?.teams) && seating.teams.length > 0;
  const keys = custom ? seating.teams.map((t) => t.id) : [...new Set(seats.map((s) => s.c))].sort((a, b) => a - b);
  const teams = keys.map((key, i) => ({
    id: custom ? key : `line-${key}`,
    name: (custom ? seating.teams[i].name : seating?.teamNames?.[`line-${key}`]) || SCHOLARS[i % SCHOLARS.length],
    color: TEAM_COLORS[i % TEAM_COLORS.length],
    members: seats
      .filter((s) => (custom ? s.team === key : s.c === key))
      .sort((a, b) => a.r - b.r || a.c - b.c)
      .map((s) => s.student),
  }));
  return teams.filter((t) => t.members.length > 0);
}
export const teamOfStudent = (teams, id) => teams.find((t) => t.members.includes(id)) ?? null;

/**
 * Who answers the next question.
 *   order    the next present student after the last one who answered, in the order of the turn (it wraps);
 *   teacher  the student the teacher tapped (`pick`) — null until he taps;
 *   fair     among the present students who have spoken LEAST (earlier sessions in `history` + this one), the first in the
 *            order of the turn after the last speaker — so that over a few lessons everyone is called.
 */
export function nextStudent({ order, absent = [], answers = [], mode = 'order', pick = null, history = {} }) {
  const present = order.filter((id) => !absent.includes(id));
  if (present.length === 0) return null;
  if (mode === 'teacher') return present.includes(pick) ? pick : null;
  const last = [...answers].reverse().find((a) => a.student != null)?.student ?? null;
  const at = last == null ? -1 : order.indexOf(last);
  const after = [...order.slice(at + 1), ...order.slice(0, at + 1)].filter((id) => present.includes(id));
  if (mode === 'order') return after[0];
  const spoken = (id) => (history[id] ?? 0) + answers.filter((a) => a.student === id).length;
  const least = Math.min(...present.map(spoken));
  return after.find((id) => spoken(id) === least);
}

/** Is the answer the right one? `choice`: the index of the option; `truefalse`: a boolean; `number`: a number, written or not. */
export function gradeAnswer(question, answer) {
  if (answer === null || answer === undefined || answer === '') return false;
  if (question.kind === 'number') return Number(String(answer).replace(',', '.')) === Number(question.answer);
  return answer === question.answer;
}

/**
 * The sentence that meets an answer — the owner's own words first. It always carries the student's NAME, never the word
 * « خطأ », and a miss is answered by the idea that a mistake is where one starts to learn. `gender` ('f' | 'm' | null)
 * chooses the form of the verbs; without it the sentence is one that fits everyone.
 */
const RIGHT = [
  (n) => `أحسنت يا ${n}، بارك الله فيك!`,
  (n) => `ممتاز يا ${n}، إجابة في محلّها!`,
  (n) => `بارك الله فيك يا ${n}، هكذا يكون العمل!`,
];
const MISS = {
  m: [
    (n) => `لا تقلق يا ${n}، الكلّ يرتكب الأخطاء، لكنّ قليلًا فقط من يستدركون خطأهم.`,
    (n) => `لا بأس يا ${n}: من الخطأ نتعلّم. ستستدركه قبل نهاية الحصّة.`,
  ],
  f: [
    (n) => `لا تقلقي يا ${n}، الكلّ يرتكب الأخطاء، لكنّ قليلًا فقط من يستدركون خطأهم.`,
    (n) => `لا بأس يا ${n}: من الخطأ نتعلّم. ستستدركينه قبل نهاية الحصّة.`,
  ],
  any: [
    (n) => `لا بأس يا ${n}: الكلّ يرتكب الأخطاء، لكنّ قليلًا فقط من يستدركون خطأهم.`,
    (n) => `لا بأس يا ${n}: من الخطأ نتعلّم.`,
  ],
};
export function praise(correct, name, { gender = null, n = 0 } = {}) {
  const list = correct ? RIGHT : MISS[gender === 'f' || gender === 'm' ? gender : 'any'];
  return list[n % list.length](name);
}

/** The first name a class hears: « عمر », not « عمر بن علي ». */
export const callName = (student) =>
  (
    student?.firstName ||
    String(student?.name ?? '')
      .trim()
      .split(/\s+/)[0] ||
    ''
  ).trim();

/**
 * The result of a session.
 *   right / total / percent — of the class;
 *   items   per الكفاءة: right, total, and `revise` when less than half was right (worst first in `revise`);
 *   teams   each team: right, total, rate; ranked by rate, then by number of right answers;
 *   stars   the students who answered right, in the order they did.
 */
export function summarise({ questions, answers, teams }) {
  const byQ = Object.fromEntries(questions.map((q) => [q.id, q]));
  const done = answers.filter((a) => byQ[a.question]);
  const right = done.filter((a) => a.correct).length;
  const items = [];
  for (const a of done) {
    const q = byQ[a.question];
    if (!q.item) continue;
    let it = items.find((x) => x.item === q.item);
    if (!it) {
      it = { item: q.item, label: q.itemLabel ?? null, lesson: q.itemLesson ?? null, right: 0, total: 0 };
      items.push(it);
    }
    it.total += 1;
    if (a.correct) it.right += 1;
  }
  for (const it of items) it.revise = it.right * 2 < it.total;
  const ranked = teams
    .map((t) => {
      const mine = done.filter((a) => t.members.includes(a.student));
      const r = mine.filter((a) => a.correct).length;
      return {
        id: t.id,
        name: t.name,
        color: t.color,
        members: t.members,
        right: r,
        total: mine.length,
        rate: mine.length ? r / mine.length : 0,
      };
    })
    .filter((t) => t.total > 0)
    .sort((a, b) => b.rate - a.rate || b.right - a.right);
  return {
    right,
    total: done.length,
    percent: done.length ? Math.round((right / done.length) * 100) : null,
    items,
    revise: items.filter((x) => x.revise).sort((a, b) => a.right / a.total - b.right / b.total),
    teams: ranked,
    stars: done.filter((a) => a.correct && a.student != null).map((a) => a.student),
  };
}

/**
 * The podium: three steps, the first in the MIDDLE. Teams with the same result share a step; a team with nothing right
 * does not climb; nobody is ever shown as last — what is not on the podium is simply not shown.
 * → [{ place: 1 | 2 | 3, teams: [...] }] in the order they stand: 2, 1, 3.
 */
export function podium(rankedTeams) {
  const steps = [];
  for (const t of rankedTeams.filter((x) => x.right > 0)) {
    const lastStep = steps[steps.length - 1];
    if (lastStep && lastStep.teams[0].rate === t.rate && lastStep.teams[0].right === t.right) lastStep.teams.push(t);
    else if (steps.length < 3) steps.push({ place: steps.length + 1, teams: [t] });
    else break;
  }
  const at = (p) => steps.find((s) => s.place === p);
  return [at(2), at(1), at(3)].filter(Boolean);
}

/** What the server keeps of a session: the answers and the result, never the right answers of the questions. */
export function toRecord({
  classroomId,
  lessonCode,
  moment,
  questions,
  answers,
  teams,
  startedAt,
  finishedAt,
  absent = [],
}) {
  const s = summarise({ questions, answers, teams });
  return {
    classroomId,
    lessonCode,
    moment,
    startedAt,
    finishedAt,
    absent,
    answers: answers.map((a, i) => ({
      position: i + 1,
      questionId: a.question,
      item: questions.find((q) => q.id === a.question)?.item ?? null,
      studentId: a.student ?? null,
      teamId: a.team ?? null,
      correct: Boolean(a.correct),
      pickedBy: a.pickedBy ?? 'order',
      ms: a.ms ?? null,
    })),
    summary: {
      right: s.right,
      total: s.total,
      percent: s.percent,
      revise: s.revise.map((x) => x.item),
      teams: s.teams.map((t) => ({ id: t.id, name: t.name, right: t.right, total: t.total })),
    },
  };
}

// ───────────────────────────── editing the seating map ─────────────────────────────
const seatsOf = (seating) => seating?.seats ?? [];
/** The roster re-seated row by row with `cols` desks per row, in the order of the turn (genders and names kept). */
export function reflow(seating, students, cols) {
  const order = turnOrder(seating, students);
  const team = Object.fromEntries(seatsOf(seating).map((s) => [s.student, s.team]));
  return {
    ...seating,
    cols,
    seats: order.map((id, i) => ({
      student: id,
      r: Math.floor(i / cols),
      c: i % cols,
      ...(team[id] ? { team: team[id] } : {}),
    })),
  };
}
/** A student moves to the desk (r, c): the student who sat there takes his place (a swap), an empty desk is simply taken. */
export function moveSeat(seating, student, r, c) {
  const seats = seatsOf(seating);
  const me = seats.find((s) => s.student === student);
  const there = seats.find((s) => s.r === r && s.c === c);
  if (!me || there?.student === student) return seating;
  return {
    ...seating,
    seats: seats.map((s) => (s === me ? { ...s, r, c } : s === there ? { ...s, r: me.r, c: me.c } : s)),
  };
}
/** The teacher's OWN teams: `n` teams (any number from 2), the class dealt in the order of the turn — he then moves whom he wants. */
export function customTeams(seating, students, n) {
  const count = Math.max(2, Math.min(SCHOLARS.length, Math.round(n)));
  const order = turnOrder(seating, students);
  const teams = Array.from({ length: count }, (_, i) => ({
    id: `t${i + 1}`,
    name: seating?.teams?.[i]?.name ?? SCHOLARS[i],
  }));
  return {
    ...seating,
    teams,
    seats: seatsOf(seating).map((s) => ({ ...s, team: teams[order.indexOf(s.student) % count].id })),
  };
}
/** Back to one team per « صفّ » (vertical line of desks). */
export const lineTeams = (seating) => ({
  ...seating,
  teams: null,
  seats: seatsOf(seating).map(({ team: _team, ...s }) => s),
});
/** A student goes to the next team (own teams only). */
export function nextTeam(seating, student) {
  const teams = seating?.teams ?? [];
  if (teams.length === 0) return seating;
  return {
    ...seating,
    seats: seatsOf(seating).map((s) =>
      s.student === student
        ? { ...s, team: teams[(teams.findIndex((t) => t.id === s.team) + 1) % teams.length].id }
        : s,
    ),
  };
}
/** unknown → boy → girl → unknown: the form of the sentences and the character on the podium. Nothing is guessed from a name. */
export function nextGender(seating, student) {
  const now = seating?.genders?.[student] ?? null;
  const next = now === null ? 'm' : now === 'm' ? 'f' : null;
  const genders = { ...(seating?.genders ?? {}) };
  if (next) genders[student] = next;
  else delete genders[student];
  return { ...seating, genders };
}
export function renameTeam(seating, teamId, name) {
  if (Array.isArray(seating?.teams) && seating.teams.length)
    return { ...seating, teams: seating.teams.map((t) => (t.id === teamId ? { ...t, name } : t)) };
  return { ...seating, teamNames: { ...(seating?.teamNames ?? {}), [teamId]: name } };
}
/** The rows the map draws: every row in use, plus an empty one to move a student to. */
export const rowCount = (seating) => Math.max(1, ...seatsOf(seating).map((s) => s.r + 1)) + 1;
/** A map saved earlier, brought up to date with the roster: students who left lose their desk, new ones sit after the last row. */
export function seatEveryone(seating, students) {
  if (!seating || !Array.isArray(seating.seats)) return defaultSeating(students);
  const known = new Set(students.map((s) => s.id));
  const seats = seating.seats.filter((s) => known.has(s.student));
  const cols = seating.cols || 6;
  const missing = students.filter((s) => !seats.some((x) => x.student === s.id));
  const from = seats.length ? Math.max(...seats.map((s) => s.r)) + 1 : 0;
  const own = Array.isArray(seating.teams) && seating.teams.length > 0;
  return {
    cols,
    teams: seating.teams ?? null,
    teamNames: seating.teamNames ?? {},
    genders: seating.genders ?? {},
    seats: [
      ...seats,
      ...missing.map((s, i) => ({
        student: s.id,
        r: from + Math.floor(i / cols),
        c: i % cols,
        ...(own ? { team: seating.teams[i % seating.teams.length].id } : {}),
      })),
    ],
  };
}
