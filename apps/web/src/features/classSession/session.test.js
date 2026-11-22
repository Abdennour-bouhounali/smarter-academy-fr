import { describe, it, expect } from 'vitest';
import {
  SCHOLARS,
  defaultSeating,
  turnOrder,
  teamsOf,
  teamOfStudent,
  nextStudent,
  gradeAnswer,
  praise,
  callName,
  summarise,
  podium,
  toRecord,
} from './session';

const kids = (n) => Array.from({ length: n }, (_, i) => ({ id: 100 + i, name: `Élève ${i + 1}` }));
const S = kids(14);
const seating = defaultSeating(S, 5); // three rows: 5, 5, 4
const order = turnOrder(seating, S);

describe('séance en classe — the seating, the turn and the teams', () => {
  it('seats a class nobody has placed yet, row by row, and the turn follows the seats', () => {
    expect(seating.seats).toHaveLength(14);
    expect(seating.seats[5]).toEqual({ student: 105, r: 1, c: 0 });
    expect(order).toEqual(S.map((s) => s.id));
    const moved = { ...seating, seats: seating.seats.map((s) => (s.student === 113 ? { ...s, r: 0, c: -1 } : s)) }; // the last one comes to the first desk
    expect(turnOrder(moved, S)[0]).toBe(113);
    expect(turnOrder({ seats: seating.seats.slice(0, 3) }, S)).toEqual(S.map((s) => s.id)); // students without a seat come last, none is lost
    expect(turnOrder(null, S)).toHaveLength(14);
  });

  it('makes one team per « rangée » — the VERTICAL line of desks — under the names of mathematicians', () => {
    const teams = teamsOf(seating, S); // 14 students, 5 lines: 3, 3, 3, 3, 2
    expect(teams.map((t) => [t.name, t.members.length])).toEqual([
      ['Thalès', 3],
      ['Hypatie', 3],
      ['Euclide', 3],
      ['Sophie Germain', 3],
      ['Al-Khwârizmî', 2],
    ]);
    expect(teams[0].members).toEqual([100, 105, 110]); // the first line, from the board to the back
    // the owner's own class: seven students on four lines make four teams of 2, 2, 2 and 1
    expect(teamsOf(defaultSeating(kids(7), 4), kids(7)).map((t) => t.members.length)).toEqual([2, 2, 2, 1]);
    expect(teamsOf(defaultSeating(kids(35), 6), kids(35))).toHaveLength(6);
    expect(new Set(teamsOf(defaultSeating(kids(48), 12), kids(48)).map((t) => t.name)).size).toBe(12);
    expect(teamOfStudent(teams, 107).name).toBe('Euclide');
    expect(teamOfStudent(teams, 999)).toBe(null);
    expect(teamsOf({ ...seating, teamNames: { 'line-1': 'Les étoiles' } }, S)[1].name).toBe('Les étoiles'); // a teacher may rename a team
    expect(SCHOLARS.length).toBeGreaterThanOrEqual(12);
  });

  it('lets the teacher make any number of teams of his own', () => {
    const five = {
      ...seating,
      teams: ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, name: `Équipe ${id}` })),
      seats: seating.seats.map((s, i) => ({ ...s, team: 'abcde'[i % 5] })),
    };
    const teams = teamsOf(five, S);
    expect(teams).toHaveLength(5);
    expect(teams.map((t) => t.members.length)).toEqual([3, 3, 3, 3, 2]);
    expect(teams[0].name).toBe('Équipe a');
    const empty = { ...five, teams: [...five.teams, { id: 'z', name: 'Vide' }] };
    expect(teamsOf(empty, S)).toHaveLength(5); // a team with nobody in it does not play
  });
});

describe('séance en classe — who answers next', () => {
  const ans = (student, correct = true) => ({ student, question: 'q', correct });
  it('by place: the next present student, and it wraps', () => {
    expect(nextStudent({ order })).toBe(100);
    expect(nextStudent({ order, answers: [ans(100)] })).toBe(101);
    expect(nextStudent({ order, answers: [ans(100)], absent: [101, 102] })).toBe(103); // an absent student is skipped
    expect(nextStudent({ order, answers: [ans(113)] })).toBe(100);
    expect(nextStudent({ order, absent: order })).toBe(null);
  });
  it('chosen by the teacher: nobody until he taps a desk, never an absent student', () => {
    expect(nextStudent({ order, mode: 'teacher' })).toBe(null);
    expect(nextStudent({ order, mode: 'teacher', pick: 109 })).toBe(109);
    expect(nextStudent({ order, mode: 'teacher', pick: 109, absent: [109] })).toBe(null);
    // back to the order after a pick: the turn continues from the student who just answered
    expect(nextStudent({ order, mode: 'order', answers: [ans(100), ans(109)] })).toBe(110);
  });
  it('fair: among those who have spoken least, counting the earlier lessons', () => {
    const history = Object.fromEntries(order.slice(0, 10).map((id) => [id, 1])); // the first ten spoke last time
    expect(nextStudent({ order, mode: 'fair', history })).toBe(110);
    expect(nextStudent({ order, mode: 'fair', history, answers: [ans(110), ans(111), ans(112)] })).toBe(113);
    expect(nextStudent({ order, mode: 'fair', history, answers: [ans(110), ans(111), ans(112), ans(113)] })).toBe(100); // everyone has spoken once: a new round
    const seen = new Set();
    let answers = [];
    for (let i = 0; i < 14; i += 1) {
      const id = nextStudent({ order, mode: 'fair', answers });
      seen.add(id);
      answers = [...answers, ans(id)];
    }
    expect(seen.size).toBe(14); // fourteen questions, fourteen different students
  });
});

describe('séance en classe — the answer and the sentence that meets it', () => {
  it('grades the three kinds of question', () => {
    expect(gradeAnswer({ kind: 'choice', answer: 2 }, 2)).toBe(true);
    expect(gradeAnswer({ kind: 'choice', answer: 2 }, 0)).toBe(false);
    expect(gradeAnswer({ kind: 'truefalse', answer: false }, false)).toBe(true);
    expect(gradeAnswer({ kind: 'truefalse', answer: false }, null)).toBe(false);
    expect(gradeAnswer({ kind: 'number', answer: 7 }, '7')).toBe(true);
    expect(gradeAnswer({ kind: 'number', answer: 2.5 }, '2,5')).toBe(true);
    expect(gradeAnswer({ kind: 'number', answer: 7 }, '')).toBe(false);
  });
  it('always says the name, never « faux » as a verdict, and agrees with the student', () => {
    expect(praise(true, 'Lucas')).toBe('Bien vu, Lucas.');
    expect(praise(false, 'Lucas', { gender: 'm' })).toBe(
      'Ne sois pas déçu, Lucas\u00a0: tout le monde se trompe, et c’est en reprenant son erreur qu’on progresse.',
    );
    expect(praise(false, 'Inès', { gender: 'f' })).toContain('Ne sois pas déçue, Inès');
    expect(praise(false, 'Camille')).toContain('Pas grave, Camille'); // gender unknown: a sentence that fits everyone
    for (let n = 0; n < 6; n += 1)
      for (const g of ['m', 'f', null])
        for (const ok of [true, false]) {
          const t = praise(ok, 'Yanis', { gender: g, n });
          expect(t).toContain('Yanis');
          expect(t).not.toMatch(/\bfaux\b|\bnul\b|undefined/i);
          expect(t).not.toMatch(/[\u0600-\u06FF]/); // no Arabic, and no religious formula
          if (!ok) expect(t).not.toContain('erreur\u202f!');
        }
    expect([callName({ name: 'Léa Martin' }), callName({ firstName: 'Inès', name: 'x y' }), callName({})]).toEqual([
      'Léa',
      'Inès',
      '',
    ]);
  });
});

describe('séance en classe — the result and the podium', () => {
  const teams = teamsOf(seating, S);
  const questions = [
    { id: 'q1', item: '1am.m3.r01', itemLabel: 'La division euclidienne' },
    { id: 'q2', item: '1am.m3.r01' },
    { id: 'q3', item: '1am.m3.r02', itemLabel: 'Les critères de divisibilité' },
    { id: 'q4', item: '1am.m3.r02' },
    { id: 'q5', item: '1am.m3.r02' },
    { id: 'q6', item: '4am.m1.r01' },
  ];
  const answers = [
    { question: 'q1', student: 100, correct: true },
    { question: 'q2', student: 105, correct: true }, // line 1 (Thalès): 2 / 2
    { question: 'q3', student: 101, correct: false },
    { question: 'q4', student: 106, correct: true }, // line 2 (Hypatie): 1 / 2
    { question: 'q5', student: 102, correct: false },
    { question: 'q6', student: 107, correct: false }, // line 3 (Euclide): 0 / 2
  ];
  const sum = summarise({ questions, answers, teams });

  it('tells what the class holds and which savoir-faire to revise, the weakest first', () => {
    expect([sum.right, sum.total, sum.percent]).toEqual([3, 6, 50]);
    expect(sum.items.map((x) => [x.item, x.right, x.total, x.revise])).toEqual([
      ['1am.m3.r01', 2, 2, false],
      ['1am.m3.r02', 1, 3, true],
      ['4am.m1.r01', 0, 1, true],
    ]);
    expect(sum.revise.map((x) => x.item)).toEqual(['4am.m1.r01', '1am.m3.r02']);
    expect(sum.stars).toEqual([100, 105, 106]);
    expect(summarise({ questions, answers: [], teams }).percent).toBe(null);
  });

  it('ranks the teams, puts the first in the middle, and never shows a team that has nothing right', () => {
    expect(sum.teams.map((t) => [t.name, t.right, t.total])).toEqual([
      ['Thalès', 2, 2],
      ['Hypatie', 1, 2],
      ['Euclide', 0, 2],
    ]);
    const p = podium(sum.teams);
    expect(p.map((s) => [s.place, s.teams.map((t) => t.name)])).toEqual([
      [2, ['Hypatie']],
      [1, ['Thalès']],
    ]); // third step empty: Euclide got nothing right, and is simply not shown
    const tie = podium([
      { name: 'a', right: 2, rate: 1 },
      { name: 'b', right: 2, rate: 1 },
      { name: 'c', right: 1, rate: 0.5 },
      { name: 'd', right: 1, rate: 0.25 },
      { name: 'e', right: 1, rate: 0.2 },
    ]);
    expect(tie.map((s) => [s.place, s.teams.map((t) => t.name)])).toEqual([
      [2, ['c']],
      [1, ['a', 'b']],
      [3, ['d']],
    ]); // equal teams share a step; five teams, three steps
    expect(podium([])).toEqual([]);
  });

  it('gives the server the answers and the result — never a right answer, never a mark for a student', () => {
    const rec = toRecord({
      classroomId: 7,
      lessonCode: 'qasim-adad-tabii',
      moment: 'start',
      questions: questions.map((q) => ({ ...q, answer: 1 })),
      answers,
      teams,
      startedAt: 1,
      finishedAt: 2,
      absent: [113],
    });
    expect(rec.answers).toHaveLength(6);
    expect(rec.answers[0]).toEqual({
      position: 1,
      questionId: 'q1',
      item: '1am.m3.r01',
      studentId: 100,
      teamId: null,
      correct: true,
      pickedBy: 'order',
      ms: null,
    });
    expect(JSON.stringify(rec)).not.toContain('"answer"');
    expect(rec.summary).toMatchObject({ right: 3, total: 6, percent: 50, revise: ['4am.m1.r01', '1am.m3.r02'] });
    expect(rec.absent).toEqual([113]);
  });
});

describe('séance en classe — editing the seating map', () => {
  it('moves a student to another desk: a swap, or an empty desk taken', async () => {
    const { moveSeat, reflow, rowCount } = await import('./session');
    const swapped = moveSeat(seating, 100, 1, 0); // desk of 105
    expect(swapped.seats.find((s) => s.student === 100)).toMatchObject({ r: 1, c: 0 });
    expect(swapped.seats.find((s) => s.student === 105)).toMatchObject({ r: 0, c: 0 });
    const alone = moveSeat(seating, 113, 3, 2);
    expect(alone.seats.find((s) => s.student === 113)).toMatchObject({ r: 3, c: 2 });
    expect(alone.seats).toHaveLength(14);
    expect(moveSeat(seating, 100, 0, 0)).toBe(seating);
    expect(moveSeat(seating, 999, 0, 0)).toBe(seating);
    expect(rowCount(seating)).toBe(4); // three rows in use and one free
    const four = reflow(swapped, S, 4);
    expect(four.cols).toBe(4);
    expect(four.seats).toHaveLength(14);
    expect(turnOrder(four, S)).toEqual(turnOrder(swapped, S)); // more rows, the same order of the turn
    expect(teamsOf(four, S)).toHaveLength(4); // four lines of desks: four teams
  });

  it('gives the teacher his own teams — any number — and lets him move a student from one to the next', async () => {
    const { customTeams, nextTeam, lineTeams, renameTeam } = await import('./session');
    const seven = customTeams(seating, S, 7);
    expect(teamsOf(seven, S)).toHaveLength(7);
    expect(teamsOf(seven, S).map((t) => t.members.length)).toEqual([2, 2, 2, 2, 2, 2, 2]);
    expect(teamOfStudent(teamsOf(seven, S), 100).id).toBe('t1');
    const moved = nextTeam(seven, 100);
    expect(teamOfStudent(teamsOf(moved, S), 100).id).toBe('t2');
    expect(teamsOf(moved, S)[0].members).toEqual([107]);
    expect(teamsOf(renameTeam(seven, 't3', 'Les aigles'), S)[2].name).toBe('Les aigles');
    expect(customTeams(seating, S, 1).teams).toHaveLength(2);
    expect(customTeams(seating, S, 99).teams).toHaveLength(12);
    const back = lineTeams(seven);
    expect(back.teams).toBe(null);
    expect(teamsOf(back, S)).toHaveLength(5);
    expect(back.seats.every((s) => !('team' in s))).toBe(true);
    expect(nextTeam(seating, 100)).toBe(seating); // no own teams: nothing to change
    expect(teamsOf(renameTeam(seating, 'line-0', 'Les premiers'), S)[0].name).toBe('Les premiers');
  });

  it('never guesses a gender from a name: unknown, then boy, then girl, then unknown again', async () => {
    const { nextGender } = await import('./session');
    const a = nextGender(seating, 100);
    const b = nextGender(a, 100);
    const c = nextGender(b, 100);
    expect([a.genders[100], b.genders[100], c.genders[100] ?? null]).toEqual(['m', 'f', null]);
  });
});

describe('séance en classe — a saved map and a roster that changed', () => {
  it('keeps the desks of those who stayed, drops those who left, seats the new ones after the last row', async () => {
    const { seatEveryone } = await import('./session');
    const now = [...S.slice(2), { id: 900, name: 'Nouveau' }, { id: 901, name: 'Nouvelle' }]; // two left, two arrived
    const map = seatEveryone({ ...seating, genders: { 105: 'f' } }, now);
    expect(map.seats).toHaveLength(14);
    expect(map.seats.some((s) => s.student === 100)).toBe(false);
    expect(map.seats.find((s) => s.student === 105)).toEqual({ student: 105, r: 1, c: 0 });
    expect(map.seats.find((s) => s.student === 900)).toEqual({ student: 900, r: 3, c: 0 });
    expect(map.genders[105]).toBe('f');
    expect(seatEveryone(null, S).seats).toHaveLength(14);
  });
});
