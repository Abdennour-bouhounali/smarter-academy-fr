import { describe, it, expect } from 'vitest';
import programme from './official_programme_college.json';
import net from './learning_net_college.json';
import lessons6e from '../lessons_6e_2026_2027.json';
import lessons5e from '../lessons_5e_2026_2027.json';
import lessons4e from '../lessons_4e_2026_2027.json';
import lessons3e from '../lessons_3e_2026_2027.json';
import units6e from '../units_6e_2026_2027.json';
import units5e from '../units_5e_2026_2027.json';
import units4e from '../units_4e_2026_2027.json';
import units3e from '../units_3e_2026_2027.json';
import * as delivered from './learningNet.js';
import { createLearningNet, WEIGHTS, weightOf } from './learningNet.js';

/**
 * Le RÉSEAU DES COMPÉTENCES (docs/architecture/LEARNING_NET.md).
 *
 * Ce que ces tests protègent :
 *  - le programme officiel reste la seule autorité : chaque item a un id
 *    stable et une leçon (existante ou prévue) qui l'enseigne ;
 *  - le réseau ne remonte jamais le temps : un lien va d'un item antérieur
 *    vers un item postérieur, et il n'a pas de cycle ;
 *  - la règle anti-doublon est lisible : un item qui prolonge ou répète un
 *    item antérieur le DIT, avec sa valeur ajoutée.
 *
 * The delivered net is the 3e net (55 items taught in 3e, 53 stubs of 4e / 5e / 6e, every lesson `coming_soon`): every
 * invariant runs on it AND on the small neutral net below, so that each rule is seen to hold — and to bite.
 *
 * STUBS: an item `stub: true` is a real prerequisite whose grade has no lesson yet. It has no home lesson; its grade
 * has no lesson at all (the day 4e gets lessons, its stubs must become full items — the test fails until then); a
 * link may start from a stub, never end on one.
 */

// ── A neutral fixture: three grades (the first one, CM2, made of stubs only), nine items ────
const item = (id, extra = {}) => {
  const [grade, seg, rank] = id.split('.');
  return {
    id, segment: `${grade}.${seg}`, grade, text: `Compétence ${id}`, domain: 'nombres_calculs',
    ...(rank.startsWith('r') ? { number: Number(rank.slice(1)) } : {}), ...extra,
  };
};
const FIXTURE_PROGRAMME = {
  grades: [
    { id: 'cm2', label: 'CM2', shortLabel: 'CM2' }, { id: '6e', label: 'Sixième', shortLabel: '6e' },
    { id: '5e', label: 'Cinquième', shortLabel: '5e' },
  ],
  domains: [{ id: 'nombres_calculs', title: 'Nombres et calculs' }],
  segments: [
    { id: 'cm2.m1', grade: 'cm2', number: 1, title: 'Segment CM2-1', domain: 'nombres_calculs' },
    { id: '6e.m1', grade: '6e', number: 1, title: 'Segment 6e-1', domain: 'nombres_calculs' },
    { id: '6e.m2', grade: '6e', number: 2, title: 'Segment 6e-2', domain: 'nombres_calculs' },
    { id: '5e.m1', grade: '5e', number: 1, title: 'Segment 5e-1', domain: 'nombres_calculs' },
  ],
  items: [
    item('cm2.m1.r01', { stub: true }),
    item('6e.m1.r01'), item('6e.m1.r02'), item('6e.m2.r01'), item('6e.m2.r02'),
    item('5e.m1.r01'), item('5e.m1.r02'), item('5e.m1.r03'), item('5e.m1.x1'),
  ],
};
const SUPPORT_NOTE = 'aide à comprendre, mais la tâche se réussit sans lui';
const FIXTURE_NET = {
  version: 1,
  linkTypes: net.linkTypes,
  threads: [
    { id: 'fil-a', title: 'Fil A', domain: 'nombres_calculs', items: ['6e.m1.r01', '6e.m1.r02', '5e.m1.r01', '5e.m1.r02', '5e.m1.x1'] },
    { id: 'fil-c', title: 'Fil C', domain: 'nombres_calculs', items: ['cm2.m1.r01', '5e.m1.r03'] },
    { id: 'fil-b', title: 'Fil B', domain: 'nombres_calculs', items: ['6e.m2.r01', '6e.m2.r02'] },
  ],
  links: [
    { from: '6e.m1.r01', to: '6e.m1.r02', type: 'requires', weight: 'core' },
    // 6e.m2.r01's home lesson (d6) comes AFTER the one of 6e.m2.r02 (c6): a review link of c6, never one of its tools.
    { from: '6e.m2.r01', to: '6e.m2.r02', type: 'requires' },
    { from: '6e.m1.r02', to: '5e.m1.r01', type: 'extends', weight: 'core', addedValue: 'la même notion, avec des négatifs' },
    { from: '6e.m2.r01', to: '5e.m1.r01', type: 'requires', weight: 'support', weightNote: SUPPORT_NOTE },
    { from: '6e.m1.r01', to: '5e.m1.r01', type: 'requires', weight: 'support', weightNote: SUPPORT_NOTE },
    { from: '6e.m1.r01', to: '5e.m1.r02', type: 'consolidates', weight: 'core', note: 'rappelé dans un nouveau contexte' },
    { from: '5e.m1.r01', to: '5e.m1.r02', type: 'requires', weight: 'core' },
    { from: '5e.m1.r02', to: '5e.m1.x1', type: 'requires', weight: 'core' },
    // A stub (CM2 has no lesson) is the base of a 5e item: c5's review, tools and « do not rebuild » show it lessonless.
    { from: 'cm2.m1.r01', to: '5e.m1.r03', type: 'extends', weight: 'core', addedValue: 'la même notion, en plus grand' },
  ],
};
const lesson = (code, order, programmeItems, extra = {}) => ({
  code, order, programmeItems, kind: 'lesson', title: `Leçon ${code}`, status: 'coming_soon', ...extra,
});
const FIXTURE_LESSONS = [
  {
    grade: '6e',
    lessons: [
      lesson('a6', 0, ['6e.m1.r01'], { unitId: 'u6' }),
      lesson('b6', 1, ['6e.m1.r02'], { unitId: 'u6', prerequisiteLessonCodes: ['a6'] }),
      lesson('s6', 2, [], { unitId: 'u6', kind: 'synthesis' }),
      lesson('c6', 3, ['6e.m2.r02']),
      lesson('d6', 4, ['6e.m2.r01', '6e.m2.r02']),
    ],
  },
  {
    grade: '5e',
    lessons: [
      lesson('a5', 0, ['5e.m1.r01', '5e.m1.r02'], { status: 'available', pointPrerequisites: { P1: ['6e_b6_P1'] } }),
      lesson('b5', 1, ['5e.m1.x1'], { status: 'available', prerequisiteLessonCodes: ['a5'] }),
      lesson('c5', 2, ['5e.m1.r03']),
    ],
  },
];
const FIXTURE_UNITS = [
  { grade: '6e', units: [{ code: 'u6', chapterId: 'nombres_calculs', order: 0, number: 1, title: 'Unité 6e', synthesisLessonCode: 's6' }] },
  { grade: '5e', units: [] },
];
/** The stub rules, as a list of violations (so a test can show they bite on a broken net). */
function stubViolations(N) {
  const out = [];
  const gradesWithLessons = new Set(N.LESSONS.map((l) => l.grade));
  for (const i of N.ITEMS.filter((x) => x.stub)) {
    if (gradesWithLessons.has(i.grade)) out.push(`${i.id}: stub in ${i.grade}, which has lessons — make it a full item`);
    if (!N.linksFrom(i.id).some((k) => !N.getItem(k.to)?.stub)) out.push(`${i.id}: stub serves no item`);
  }
  for (const k of N.LINKS) if (N.getItem(k.to)?.stub) out.push(`${k.from} → ${k.to}: a link ends on a stub`);
  return out;
}

const fixtureData = { programme: FIXTURE_PROGRAMME, net: FIXTURE_NET, lessonFiles: FIXTURE_LESSONS, unitFiles: FIXTURE_UNITS };
const fixture = createLearningNet({ ...fixtureData, weightedGrades: ['5e'] });

const deliveredData = {
  programme, net, lessonFiles: [lessons6e, lessons5e, lessons4e, lessons3e], unitFiles: [units6e, units5e, units4e, units3e],
};

// ── The invariants, run on both nets ─────────────────────────────────────────
describe.each([
  ['delivered', deliveredData, delivered, { knownGaps: {} }],
  ['fixture', fixtureData, fixture, { knownGaps: {} }],
])('learning net invariants (%s)', (_, data, N, { knownGaps }) => {
  const GRADES = data.programme.grades.map((g) => g.id);
  const gradeOf = (id) => N.getItem(id).grade;
  const segNumber = (id) => N.getSegment(N.getItem(id).segment).number;
  const gradePattern = GRADES.join('|');

  describe('programme officiel — items', () => {
    it('gives every item a unique id in the stable format `<grade>.m<n>.(r<nn>|x<n>)`', () => {
      const ids = N.ITEMS.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const i of N.ITEMS) {
        expect(i.id).toMatch(new RegExp(`^(${gradePattern})\\.m\\d+\\.(r\\d{2}|x\\d+)$`));
        expect(i.id.startsWith(`${i.segment}.`)).toBe(true);
        expect(N.getSegment(i.segment)?.grade, i.id).toBe(i.grade);
        expect(i.text.trim().length).toBeGreaterThan(5);
      }
    });

    it('numbers the numbered items of each segment 1..n without a gap', () => {
      for (const s of N.SEGMENTS) {
        const nums = N.ITEMS.filter((i) => i.segment === s.id && i.number != null).map((i) => i.number);
        expect(nums).toEqual(nums.map((__, k) => k + 1));
      }
    });
  });

  describe('réseau — liens', () => {
    it('ne relie que des items qui existent, jamais un item à lui-même', () => {
      for (const k of N.LINKS) {
        expect(N.getItem(k.from), k.from).not.toBeNull();
        expect(N.getItem(k.to), k.to).not.toBeNull();
        expect(k.from).not.toBe(k.to);
        expect(Object.keys(data.net.linkTypes)).toContain(k.type);
      }
    });

    it('ne remonte jamais le temps : classe puis segment de « from » ≤ ceux de « to »', () => {
      for (const k of N.LINKS) {
        const gf = GRADES.indexOf(gradeOf(k.from));
        const gt = GRADES.indexOf(gradeOf(k.to));
        expect(gf, `${k.from} → ${k.to}`).toBeLessThanOrEqual(gt);
        if (gf === gt) expect(segNumber(k.from), `${k.from} → ${k.to}`).toBeLessThanOrEqual(segNumber(k.to));
        // Prolonger ou consolider, c'est revenir sur un item STRICTEMENT antérieur.
        if (k.type !== 'requires') expect(N.itemRank(k.from)).toBeLessThan(N.itemRank(k.to));
      }
    });

    it('est sans cycle (tous types confondus)', () => {
      const out = new Map(N.ITEMS.map((i) => [i.id, []]));
      for (const k of N.LINKS) out.get(k.from).push(k.to);
      const state = new Map();
      const visit = (id, path) => {
        if (state.get(id) === 'done') return;
        expect(state.get(id), `cycle : ${[...path, id].join(' → ')}`).not.toBe('open');
        state.set(id, 'open');
        for (const next of out.get(id)) visit(next, [...path, id]);
        state.set(id, 'done');
      };
      for (const i of N.ITEMS) visit(i.id, []);
    });

    it('dit la valeur ajoutée de chaque prolongement, et la nature de chaque répétition', () => {
      for (const k of N.LINKS.filter((l) => l.type === 'extends')) expect(k.addedValue?.trim().length, k.to).toBeGreaterThan(5);
      for (const k of N.LINKS.filter((l) => l.type === 'consolidates')) expect(k.note?.trim().length, k.to).toBeGreaterThan(5);
      // Un item repart d'UNE base au plus : sinon « ce qu'il ajoute » n'a plus de sens.
      const based = N.LINKS.filter((l) => l.type !== 'requires').map((l) => l.to);
      expect(new Set(based).size).toBe(based.length);
    });

    it('range chaque item dans exactement un fil conceptuel', () => {
      const all = N.THREADS.flatMap((t) => t.items);
      expect(new Set(all).size).toBe(all.length);
      expect(new Set(all)).toEqual(new Set(N.ITEMS.map((i) => i.id)));
    });
  });

  describe('leçons — existantes et prévues', () => {
    it('donne à CHAQUE item officiel non-stub une leçon d’accueil (existante ou prévue), et aucune à un stub', () => {
      expect(N.ITEMS.filter((i) => !i.stub && !N.homeLessonOf(i.id)).map((i) => i.id)).toEqual([]);
      for (const i of N.ITEMS.filter((x) => x.stub)) expect(N.homeLessonOf(i.id), i.id).toBeNull();
    });

    it('n’admet un stub que dans une classe SANS aucune leçon, jamais au bout d’un lien, et toujours au service d’un item', () => {
      expect(stubViolations(N)).toEqual([]);
    });

    it('a des codes de leçon uniques, prévues comprises', () => {
      const codes = N.LESSONS.map((l) => l.code);
      expect(new Set(codes).size).toBe(codes.length);
      for (const l of N.LESSONS) expect(l.code).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });

    it('fait déclarer à chaque leçon des items de sa classe, une synthèse n’en déclarant aucun', () => {
      for (const l of N.LESSONS) {
        if (l.kind === 'synthesis') expect(l.programmeItems, l.code).toEqual([]);
        for (const id of l.programmeItems) expect(gradeOf(id), `${l.code} › ${id}`).toBe(l.grade);
      }
    });

    it('range chaque leçon d’une unité dans la classe de l’unité, sa synthèse en dernier', () => {
      for (const u of N.UNITS) {
        const lessons = N.LESSONS.filter((l) => l.unit === u.code);
        for (const l of lessons) expect(l.grade).toBe(u.grade);
        if (u.synthesisLessonCode) expect(lessons.at(-1)).toMatchObject({ code: u.synthesisLessonCode, kind: 'synthesis' });
      }
    });

    it('respecte l’ordre des classes : la leçon d’accueil d’un prérequis n’est jamais d’une classe postérieure', () => {
      for (const k of N.LINKS) {
        // A stub has no lesson: its own grade stands for the grade of the lesson that will teach it.
        const a = N.homeLessonOf(k.from);
        const b = N.homeLessonOf(k.to);
        const gradeA = a?.grade ?? gradeOf(k.from);
        expect(b, `${k.to} has no home lesson`).not.toBeNull();
        expect(GRADES.indexOf(gradeA), `${k.from} (${a?.code ?? 'stub'}) → ${k.to} (${b.code})`).toBeLessThanOrEqual(GRADES.indexOf(b.grade));
      }
    });

    it('n’admet aucun renvoi en avant entre deux leçons publiées de la même classe', () => {
      const pos = new Map(N.LESSONS.map((l, k) => [l.code, k]));
      for (const k of N.LINKS) {
        const a = N.homeLessonOf(k.from);
        const b = N.homeLessonOf(k.to);
        // A stub source has no lesson, so no published lesson to refer forward to.
        if (!a || a.grade !== b.grade || a.status !== 'available' || b.status !== 'available') continue;
        expect(pos.get(a.code), `${k.from} (${a.code}) → ${k.to} (${b.code})`).toBeLessThanOrEqual(pos.get(b.code));
      }
    });

    it('n’envoie jamais une leçon vers elle-même, et groupe du plus ancien au plus récent', () => {
      for (const l of N.LESSONS) {
        const groups = N.reviewLinksForLesson(l.code);
        for (const g of groups) expect(g.lesson?.code).not.toBe(l.code);
        const ranks = groups.flatMap((g) => g.items.map((i) => N.itemRank(i.id)));
        expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
      }
    });

    it('ne donne comme outil qu’une compétence ANTÉRIEURE, quatre au plus', () => {
      for (const l of N.LESSONS.filter((x) => x.kind !== 'synthesis')) {
        expect(N.toolsForLesson(l.code).length).toBeLessThanOrEqual(4);
        for (const t of N.toolsForLesson(l.code, { max: 9 })) {
          if (t.lesson) {
            expect(N.LESSONS.findIndex((x) => x.code === t.lesson.code), `${l.code} ← ${t.id}`).toBeLessThan(
              N.LESSONS.findIndex((x) => x.code === l.code),
            );
          }
        }
      }
    });
  });

  describe('poids des liens — core / support', () => {
    it('classe TOUS les liens entrants des classes classées, et seulement avec les deux poids', () => {
      const taught = new Set(N.LESSONS.filter((l) => N.WEIGHTED_GRADES.includes(l.grade)).flatMap((l) => l.programmeItems));
      for (const link of N.LINKS) {
        if (N.WEIGHTED_GRADES.includes(gradeOf(link.to)) || taught.has(link.to)) {
          expect(WEIGHTS, `${link.from} → ${link.to} n’est pas classé`).toContain(weightOf(link));
        }
        if (link.weight !== undefined) expect(WEIGHTS).toContain(link.weight);
        if (link.weight === 'support') expect((link.weightNote ?? '').length, `${link.from} → ${link.to} : un lien support dit pourquoi`).toBeGreaterThan(20);
        if (link.weight === 'core') expect(link.weightNote).toBeUndefined();
      }
    });

    it('donne à chaque compétence d’une classe classée au moins un prérequis « core »', () => {
      for (const i of N.ITEMS.filter((x) => N.WEIGHTED_GRADES.includes(x.grade))) {
        expect(N.corePrerequisitesOf(i.id).length, `${i.id} n’a aucun prérequis core`).toBeGreaterThanOrEqual(1);
      }
    });

    it('garde le poids le plus fort quand un item est atteint par deux liens', () => {
      for (const l of N.LESSONS.filter((x) => N.WEIGHTED_GRADES.includes(x.grade) && x.kind !== 'synthesis')) {
        for (const reached of N.reviewLinksForLesson(l.code).flatMap((g) => g.items)) {
          const weights = l.programmeItems.flatMap((own) => N.linksInto(own)).filter((k) => k.from === reached.id).map((k) => k.weight);
          expect(reached.weight, `${l.code} ← ${reached.id}`).toBe(weights.includes('core') ? 'core' : 'support');
        }
      }
    });
  });

  describe('cohérence — le catalogue ne contredit pas le réseau', () => {
    const catalogue = data.lessonFiles.flatMap((f) => f.lessons);
    const byCode = new Map(catalogue.map((l) => [l.code, l]));
    const ancestors = (ids) => {
      const seen = new Set(ids);
      const todo = [...ids];
      while (todo.length) for (const k of N.linksInto(todo.pop())) if (!seen.has(k.from)) { seen.add(k.from); todo.push(k.from); }
      return seen;
    };
    /** La leçon `a` déclare avoir besoin de `b` : le réseau le dit-il aussi (un item de b est un ancêtre d'un item de a) ? */
    const explained = (a, b) => {
      const ia = byCode.get(a).programmeItems ?? [];
      const ib = byCode.get(b).programmeItems ?? [];
      if (!ia.length || !ib.length) return true; // une leçon sans item du programme ne peut pas être jugée ici
      const up = ancestors(ia);
      return ib.some((id) => up.has(id));
    };

    it('explique chaque paire de leçons liée dans le catalogue, sauf une liste fermée d’écarts connus', () => {
      const pairs = new Set();
      for (const l of catalogue) {
        if (l.kind === 'synthesis') continue;
        for (const b of l.prerequisiteLessonCodes ?? []) pairs.add(`${l.code}<${b}`);
        for (const list of Object.values(l.pointPrerequisites ?? {})) {
          for (const lp of list) {
            const b = N.lessonCodeOfLearningPoint(lp);
            if (b && b !== l.code) pairs.add(`${l.code}<${b}`);
          }
        }
      }
      const gaps = [...pairs].filter((p) => { const [a, b] = p.split('<'); return byCode.has(a) && byCode.has(b) && !explained(a, b); }).sort();
      expect(gaps).toEqual(Object.keys(knownGaps).sort());
    });
  });
});

describe('the delivered net (3e)', () => {
  it('holds the 3e net: 55 items taught in 3e, 53 stubs of the earlier grades, 60 planned lessons in 13 units', () => {
    expect(net).toMatchObject({ version: 1 });
    expect(typeof net.builtOn).toBe('string');
    expect(Object.keys(net.linkTypes)).toEqual(['requires', 'extends', 'consolidates']);
    expect(programme).toMatchObject({ level: 'college', verified: false });
    expect(delivered.GRADES.map((g) => g.id)).toEqual(['6e', '5e', '4e', '3e']);
    const count = (f) => delivered.ITEMS.filter(f).length;
    expect(count((i) => i.grade === '3e' && !i.stub)).toBe(55);
    expect(count((i) => i.stub)).toBe(53);
    expect(delivered.ITEMS).toHaveLength(108);
    expect(delivered.THREADS).toHaveLength(17);
    expect(delivered.LINKS).toHaveLength(113);
    expect(delivered.UNITS).toHaveLength(13);
    expect(delivered.LESSONS).toHaveLength(60);
    expect(delivered.LESSONS.every((l) => l.grade === '3e' && l.status === 'planned')).toBe(true);
    expect(delivered.WEIGHTED_GRADES).toEqual(['3e']);
  });

  it('never loads a horizon-2028 item', () => {
    expect(delivered.ITEMS.filter((i) => i.horizon || /\.x\d+$/.test(i.id)).map((i) => i.id)).toEqual([]);
  });

  it('answers an unknown id with an empty result, never a crash', () => {
    expect(delivered.getItem('6e.m1.r01')).toBeNull();
    expect(delivered.getLesson('nimporte')).toBeNull();
    expect(delivered.homeLessonOf('6e.m1.r01')).toBeNull();
    expect(delivered.reviewLinksForLesson('nimporte')).toEqual([]);
    expect(delivered.toolsForLesson('nimporte')).toEqual([]);
    expect(delivered.forwardLinksForLesson('nimporte')).toEqual([]);
    expect(delivered.noRebuildForLesson('nimporte')).toEqual([]);
    expect(delivered.earlierYearReviewFor({ learningPointCode: '6e_nimporte_P1' })).toEqual([]);
    expect(delivered.itemRank('6e.m1.r01')).toBe(Infinity);
  });

  it('answers a stub with the item itself and « no lesson yet in its grade », in every function', () => {
    const stub = '4e.m1.r01';
    expect(delivered.isStub(stub)).toBe(true);
    expect(delivered.homeLessonOf(stub)).toBeNull();
    expect(delivered.lessonsOf(stub)).toEqual([]);
    // 3e.m1.r01 (calculer-avec-des-fractions) consolidates 4e.m1.r01.
    const groups = delivered.reviewLinksForLesson('calculer-avec-des-fractions');
    const stubGroup = groups.find((g) => g.items.some((i) => i.id === stub));
    expect(stubGroup).toMatchObject({ lesson: null, noLessonInGrade: '4e' });
    expect(stubGroup.items.find((i) => i.id === stub)).toMatchObject({ grade: '4e', stub: true, via: 'consolidates' });
    const tool = delivered.toolsForLesson('calculer-avec-des-fractions', { max: 99 }).find((t) => t.id === stub);
    expect(tool).toMatchObject({ lesson: null, noLessonInGrade: '4e', stub: true });
    expect(tool.text.length).toBeGreaterThan(5);
    const noRebuild = delivered.noRebuildForLesson('calculer-avec-des-fractions').find((r) => r.base.id === stub);
    expect(noRebuild).toMatchObject({ baseLesson: null, baseNoLessonInGrade: '4e', type: 'consolidates' });
    const earlier = delivered.earlierYearReviewFor({ learningPointCode: '3e_calculer-avec-des-fractions_P1' });
    expect(earlier.some((g) => g.noLessonInGrade === '4e' && g.lesson === null)).toBe(true);
    // A stub is never the end of a link, so no forward link ever names it.
    for (const l of delivered.LESSONS) {
      for (const g of delivered.forwardLinksForLesson(l.code)) for (const i of g.items) expect(i.stub, `${l.code} → ${i.id}`).toBe(false);
    }
  });

  it('groups the stubs of one grade together, never one group per item', () => {
    for (const l of delivered.LESSONS) {
      const grades = delivered.reviewLinksForLesson(l.code).filter((g) => g.noLessonInGrade).map((g) => g.noLessonInGrade);
      expect(new Set(grades).size, l.code).toBe(grades.length);
    }
  });

  it('keeps every 3e lesson in the year order: no prerequisite whose home lesson comes later in 3e', () => {
    // Stricter than the general rule (which only forbids it between PUBLISHED lessons): the 3e catalogue was cut so.
    const pos = new Map(delivered.LESSONS.map((l, k) => [l.code, k]));
    const forward = delivered.LINKS.map((k) => [k, delivered.homeLessonOf(k.from), delivered.homeLessonOf(k.to)])
      .filter(([, a, b]) => a && b && a.grade === b.grade && pos.get(a.code) > pos.get(b.code))
      .map(([k, a, b]) => `${k.from} (${a.code}) → ${k.to} (${b.code})`);
    expect(forward).toEqual([]);
  });
});

describe('the official items — sources (delivered)', () => {
  const ORIGINS = ['programme-2020', 'reperes-2019', 'attendus-2019', 'reperes-c3-2019', 'programme-2026'];
  it('names the document and the PDF page of every item, still unverified', () => {
    for (const i of delivered.ITEMS) {
      expect(ORIGINS, i.id).toContain(i.origin);
      expect(Object.keys(programme.sources), i.id).toContain(i.origin);
      expect(Number.isInteger(i.page), i.id).toBe(true);
      expect(i.verified, i.id).toBe(false);
    }
  });
  it('says, for each 3e item, how the 2026 programme treats it', () => {
    for (const i of delivered.ITEMS.filter((x) => x.grade === '3e')) {
      expect(['kept', 'absent', 'changed'], i.id).toContain(i.in2026);
      expect(i.in2026Note?.length, i.id).toBeGreaterThan(10);
    }
  });
  it('has the five 3e segments, one per thème', () => {
    for (let m = 1; m <= 5; m += 1) expect(delivered.getSegment(`3e.m${m}`), `3e.m${m}`).not.toBeNull();
  });
});

describe('the stub rules bite', () => {
  it('flags a stub in a grade that has a lesson, a link ending on a stub, and a stub that serves nothing', () => {
    const broken = createLearningNet({
      ...fixtureData,
      programme: { ...FIXTURE_PROGRAMME, items: FIXTURE_PROGRAMME.items.map((i) => (i.id === '6e.m2.r02' || i.id === '5e.m1.x1' ? { ...i, stub: true } : i)) },
    });
    expect(stubViolations(broken)).toEqual([
      '6e.m2.r02: stub in 6e, which has lessons — make it a full item',
      '6e.m2.r02: stub serves no item',
      '5e.m1.x1: stub in 5e, which has lessons — make it a full item',
      '5e.m1.x1: stub serves no item',
      '6e.m2.r01 → 6e.m2.r02: a link ends on a stub',
      '5e.m1.r02 → 5e.m1.x1: a link ends on a stub',
    ]);
  });
});

// ── What the resolver gives, on the fixture ─────────────────────────────────
describe('résolveur — navigation (fixture)', () => {
  it('groupe les révisions d’une leçon par leçon d’accueil, du plus ancien au plus récent', () => {
    expect(fixture.reviewLinksForLesson('a5').map((g) => [g.lesson.code, g.items.map((i) => [i.id, i.via, i.weight])])).toEqual([
      ['a6', [['6e.m1.r01', 'requires', 'core']]],
      ['b6', [['6e.m1.r02', 'extends', 'core']]],
      ['d6', [['6e.m2.r01', 'requires', 'support']]],
    ]);
    // 6e.m1.r01 is reached by a support link (→ r01) and a core one (→ r02): the stronger weight wins.
    expect(fixture.reviewLinksForLesson('a5')[0].items[0]).toMatchObject({ text: 'Compétence 6e.m1.r01', grade: '6e' });
    expect(fixture.reviewLinksForLesson('a5')[0].lesson).toEqual({ code: 'a6', grade: '6e', title: 'Leçon a6', status: 'planned' });
  });

  it('montre où sert une leçon plus tard', () => {
    expect(fixture.forwardLinksForLesson('a6').map((g) => [g.lesson.code, g.items.map((i) => i.id)])).toEqual([
      ['b6', ['6e.m1.r02']],
      ['a5', ['5e.m1.r01', '5e.m1.r02']],
    ]);
  });

  it('dit à une leçon ce qu’elle ne doit pas reconstruire', () => {
    expect(fixture.noRebuildForLesson('a5').map((r) => [r.item.id, r.base.id, r.baseLesson.code, r.type, r.addedValue, r.note])).toEqual([
      ['5e.m1.r01', '6e.m1.r02', 'b6', 'extends', 'la même notion, avec des négatifs', null],
      ['5e.m1.r02', '6e.m1.r01', 'a6', 'consolidates', null, 'rappelé dans un nouveau contexte'],
    ]);
  });

  it('« revoir » après une erreur : de la compétence à sa leçon, puis aux SEULES classes antérieures', () => {
    expect(fixture.lessonCodeOfLearningPoint('5e_a5_P1')).toBe('a5');
    expect(fixture.lessonCodeOfLearningPoint('5e_nexiste-pas_P1')).toBeNull();
    expect(fixture.lessonCodeOfLearningPoint('9z_a5_P1')).toBeNull();
    const groups = fixture.earlierYearReviewFor({ learningPointCode: '5e_a5_P1' });
    expect(groups.map((g) => g.lesson.code)).toEqual(['a6', 'b6', 'd6']);
    expect(fixture.earlierYearReviewFor({ learningPointCode: null, lessonCode: 'a5' })).toEqual(groups);
    // b5 only reaches back into its own grade; 6e has no earlier grade.
    expect(fixture.earlierYearReviewFor({ lessonCode: 'b5' })).toEqual([]);
    expect(fixture.earlierYearReviewFor({ lessonCode: 'b6' })).toEqual([]);
    expect(fixture.earlierYearReviewFor({})).toEqual([]);
  });
});

describe('poids des liens — outils d’une leçon (fixture)', () => {
  it('donne les prérequis et les dépendants « core », d’un pas', () => {
    expect(fixture.corePrerequisitesOf('5e.m1.r01')).toEqual(['6e.m1.r02']);
    expect(fixture.coreDependentsOf('6e.m1.r01')).toEqual(['6e.m1.r02', '5e.m1.r02']);
    expect(fixture.coreDependentsOf('6e.m2.r01')).toEqual([]); // un lien support ou non classé ne porte aucune déduction
  });

  it('ordonne les outils : core d’abord, puis l’ordre du programme, `max` au plus', () => {
    expect(fixture.toolsForLesson('a5').map((t) => [t.id, t.weight, t.lesson.code])).toEqual([
      ['6e.m1.r01', 'core', 'a6'], ['6e.m1.r02', 'core', 'b6'], ['6e.m2.r01', 'support', 'd6'],
    ]);
    expect(fixture.toolsForLesson('a5', { max: 2 }).map((t) => t.id)).toEqual(['6e.m1.r01', '6e.m1.r02']);
    expect(fixture.toolsForLesson('inconnue')).toEqual([]);
  });

  it('ne fait jamais d’une compétence enseignée PLUS TARD un outil', () => {
    // c6 shares 6e.m2.r02 with d6; 6e.m2.r01 → 6e.m2.r02 and 6e.m2.r01's home is d6, after c6.
    expect(fixture.reviewLinksForLesson('c6').flatMap((g) => g.items.map((i) => i.id))).toEqual(['6e.m2.r01']);
    expect(fixture.toolsForLesson('c6')).toEqual([]);
  });

  it('compte un lien non classé comme « core » parmi les outils, mais ne lui donne aucun poids', () => {
    const unclassified = FIXTURE_NET.links.find((k) => k.from === '6e.m2.r01' && k.to === '6e.m2.r02');
    expect(weightOf(unclassified)).toBeNull();
    expect(fixture.reviewLinksForLesson('c6')[0].items[0].weight).toBeNull();
  });
});

describe('stubs — what the resolver gives (fixture)', () => {
  it('has no home lesson for a stub, and shows it as the item itself, grouped by its grade with no lesson', () => {
    expect(fixture.homeLessonOf('cm2.m1.r01')).toBeNull();
    expect(fixture.reviewLinksForLesson('c5')).toEqual([
      {
        lesson: null,
        noLessonInGrade: 'cm2',
        items: [{ id: 'cm2.m1.r01', grade: 'cm2', segment: 'cm2.m1', text: 'Compétence cm2.m1.r01', stub: true, via: 'extends', weight: 'core' }],
      },
    ]);
  });

  it('makes a stub a tool of the lesson (an earlier grade), with no lesson to send the student to', () => {
    expect(fixture.toolsForLesson('c5').map((t) => [t.id, t.weight, t.lesson, t.noLessonInGrade])).toEqual([['cm2.m1.r01', 'core', null, 'cm2']]);
  });

  it('tells the lesson not to rebuild a stub base, naming its grade', () => {
    expect(fixture.noRebuildForLesson('c5')).toEqual([
      {
        item: { id: '5e.m1.r03', grade: '5e', segment: '5e.m1', text: 'Compétence 5e.m1.r03', stub: false },
        base: { id: 'cm2.m1.r01', grade: 'cm2', segment: 'cm2.m1', text: 'Compétence cm2.m1.r01', stub: true },
        baseLesson: null,
        baseNoLessonInGrade: 'cm2',
        type: 'extends',
        addedValue: 'la même notion, en plus grand',
        note: null,
      },
    ]);
  });

  it('« revoir » keeps the stub (an earlier grade) and offers no lesson', () => {
    expect(fixture.earlierYearReviewFor({ lessonCode: 'c5' }).map((g) => [g.lesson, g.noLessonInGrade, g.items.map((i) => i.id)])).toEqual([
      [null, 'cm2', ['cm2.m1.r01']],
    ]);
  });

  it('never names a stub as a later use', () => {
    expect(fixture.forwardLinksForLesson('c5')).toEqual([]);
    expect(fixture.coreDependentsOf('cm2.m1.r01')).toEqual(['5e.m1.r03']);
  });
});
