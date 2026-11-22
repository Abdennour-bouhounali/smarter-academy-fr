import { describe, it, expect } from 'vitest';
import {
  isMissionView, missionTools, pendingCheckpoint, missionStations, resumeStation, readMissionState, writeMissionState, missionKey, stationLabel, shouldWelcome, checkpointOrder,
} from './missionModel';
import { describeLearningViewer } from '../../../features/learning/learningViewer';

const viewer = (role) => describeLearningViewer({ role });
const MISSION = {
  climaxModule: 4,
  tools: [{ id: 'qasim-baqi', icon: '🔑', label: 'a' }, { id: 'qasim-jidaa', icon: '🔑', label: 'b' }],
  checkpoints: [{ id: 'cp-1', afterModule: 1 }, { id: 'cp-2', afterModule: 2 }],
};
const memoryStorage = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
};

describe('isMissionView — the mission changes the STUDENT view only', () => {
  it('is on for a learner in a lesson that opts in', () => {
    expect(isMissionView('mission', viewer('student'), { isClassroomMode: false })).toBe(true);
    expect(isMissionView('mission', viewer('visitor'), { isClassroomMode: false })).toBe(true);
  });
  it('is off for other lessons, the teacher, the admin and Classroom Mode', () => {
    expect(isMissionView('focus', viewer('student'), { isClassroomMode: false })).toBe(false);
    expect(isMissionView('mission', viewer('teacher'), { isClassroomMode: false })).toBe(false);
    expect(isMissionView('mission', viewer('admin'), { isClassroomMode: false })).toBe(false);
    expect(isMissionView('mission', viewer('student'), { isClassroomMode: true })).toBe(false);
  });
});

describe('missionTools — a tool is earned when its knowledge item is established', () => {
  it('marks each tool from the unlocked knowledge ids', () => {
    expect(missionTools(MISSION, ['qasim-baqi']).map((t) => t.earned)).toEqual([true, false]);
    expect(missionTools(undefined, ['x'])).toEqual([]);
  });
});

describe('pendingCheckpoint — asked on ARRIVAL at the next module, once', () => {
  it('waits for the previous module to be completed', () => {
    expect(pendingCheckpoint(MISSION, [0], {}, 2)).toBeNull();
    expect(pendingCheckpoint(MISSION, [0, 1], {}, 2)?.id).toBe('cp-1');
    expect(pendingCheckpoint(MISSION, ['00', '01'], {}, 2)?.id).toBe('cp-1');
  });
  it('is not asked again once answered or skipped, nor on a module without one', () => {
    expect(pendingCheckpoint(MISSION, [0, 1], { 'cp-1': 0 }, 2)).toBeNull();
    expect(pendingCheckpoint(MISSION, [0, 1], { 'cp-1': 'skipped' }, 2)).toBeNull();
    expect(pendingCheckpoint(MISSION, [0, 1, 2, 3], {}, 5)).toBeNull();
  });
});

describe('missionStations / resumeStation — the journey follows the real lock', () => {
  const config = { mission: MISSION, modules: [3, 4, 5].map((n) => ({ number: n, slug: `m${n}`, title: `M${n}` })) };
  it('labels the climax and the bonus stations, and keeps the status it is given', () => {
    const stations = missionStations(config, (m) => (m.number === 3 ? 'mastered' : 'locked'));
    expect(stations.map((s) => s.kind)).toEqual(['stage', 'climax', 'bonus']);
    expect(stations.map((s) => s.status)).toEqual(['mastered', 'locked', 'locked']);
  });
  it('resumes at the first station not done', () => {
    expect(resumeStation([{ number: 3, status: 'mastered' }, { number: 4, status: 'current' }])?.number).toBe(4);
    expect(resumeStation([{ number: 3, status: 'mastered' }])).toBeNull();
  });
});

describe('shouldWelcome — the « you are here » card, once per station', () => {
  it('greets a first arrival, never twice, never over a checkpoint', () => {
    expect(shouldWelcome({}, 2, null)).toBe(true);
    expect(shouldWelcome({ 2: true }, 2, null)).toBe(false);
    expect(shouldWelcome({}, 2, { id: 'cp' })).toBe(false);
  });
});

describe('stationLabel — the part of a module title that says WHAT', () => {
  it('keeps what follows the dash, or the whole title', () => {
    expect(stationLabel('نشاط 1 — 420 كتابًا في رفوف')).toBe('420 كتابًا في رفوف');
    expect(stationLabel('أستعدّ')).toBe('أستعدّ');
  });
});

describe('mission state — local, per lesson, never throws', () => {
  it('round-trips and defaults safely', () => {
    const s = memoryStorage();
    expect(readMissionState(s, 'l1')).toEqual({ opened: false, answered: {}, seen: {} });
    writeMissionState(s, 'l1', { opened: true, answered: { 'cp-1': 0 }, seen: { 2: true } });
    expect(readMissionState(s, 'l1')).toEqual({ opened: true, answered: { 'cp-1': 0 }, seen: { 2: true } });
    s.setItem(missionKey('l2'), '{broken');
    expect(readMissionState(s, 'l2')).toEqual({ opened: false, answered: {}, seen: {} });
    expect(readMissionState(null, 'l3')).toEqual({ opened: false, answered: {}, seen: {} });
  });
});

describe('checkpointOrder — the right answer is not always first (ECC review 2026-11-10)', () => {
  const configs = import.meta.glob('../../moyen/4am/**/lesson.config.js', { eager: true });
  const cps = Object.values(configs).flatMap((m) => m.LESSON_CONFIG?.mission?.checkpoints ?? []);
  it('a permutation, the same at every call (stable across reloads)', () => {
    cps.forEach((cp) => {
      const o = checkpointOrder(cp.id, cp.options.length);
      expect([...o].sort()).toEqual(cp.options.map((_, i) => i));
      expect(checkpointOrder(cp.id, cp.options.length)).toEqual(o);
      expect(o.some((v, i) => v !== i), `${cp.id} never shown in its written order`).toBe(true);
    });
  });
  it('across the converted lessons, the right answer is shown at more than one place, and not mostly first', () => {
    expect(cps.length).toBeGreaterThanOrEqual(9);
    const places = cps.map((cp) => checkpointOrder(cp.id, cp.options.length).indexOf(cp.correct));
    expect(new Set(places).size).toBeGreaterThan(1);
    expect(places.filter((p) => p === 0).length).toBeLessThan(cps.length / 2);
  });
});

// ── LA SYNTHÈSE dans le lecteur (2026-11-10, provisoire) : des champs FACULTATIFS — sans eux, tout ce qui précède est inchangé ──────────
import { toolLit, toolProgress, sceneFill, trainingsDone, showStars, openingMinutes } from './missionModel';

const SYNTHESIS = {
  toolsOwned: true,
  climaxModule: 8,
  checkpoints: [],
  trainings: [1, 2, 3, 4, 5, 6],
  hideStars: true,
  stationLabels: { 7: 'وضعية الوحدة', 8: 'التحدّي 🏆' },
  tools: [
    { id: 'other-lesson-key', emoji: '📏', label: 'a', usedIn: [1, 2, 7] },
    { id: 'another-key', emoji: '⚖️', label: 'b', usedIn: [2] },
    { id: 'never-used', icon: '✂️', label: 'c' },
  ],
};

describe('missionTools with toolsOwned — the unit keys are owned from the first screen', () => {
  it('every tool is earned whatever the lesson knowledge holds, and never needs to exist in it', () => {
    const tools = missionTools(SYNTHESIS, [], []);
    expect(tools.map((t) => t.earned)).toEqual([true, true, true]);
    expect(tools.map((t) => t.used)).toEqual([false, false, false]);
    expect(tools.map((t) => t.icon)).toEqual(['📏', '⚖️', '✂️']);
  });
  it('a key is USED once one of its usedIn modules is completed (string or number ids)', () => {
    expect(missionTools(SYNTHESIS, [], [0, 1]).map((t) => t.used)).toEqual([true, false, false]);
    expect(missionTools(SYNTHESIS, [], ['00', '02']).map((t) => t.used)).toEqual([true, true, false]);
    expect(missionTools(SYNTHESIS, [], undefined).map((t) => t.used)).toEqual([false, false, false]);
  });
  it('without the flag the output is exactly the old one (no `used`, earned from knowledge)', () => {
    expect(missionTools(MISSION, ['qasim-baqi'], [1, 2, 3])).toEqual([
      { id: 'qasim-baqi', icon: '🔑', label: 'a', earned: true },
      { id: 'qasim-jidaa', icon: '🔑', label: 'b', earned: false },
    ]);
    expect(missionTools({ ...SYNTHESIS, toolsOwned: 'yes' }, [], [1]).every((t) => !('used' in t) && !t.earned)).toBe(true);
  });
  it('toolLit / toolProgress / sceneFill — lit = used for owned keys, earned otherwise; the scene is full when keys are owned', () => {
    const owned = missionTools(SYNTHESIS, [], [2]);
    expect(owned.map(toolLit)).toEqual([true, true, false]);
    expect(toolProgress(owned)).toEqual({ lit: 2, total: 3 });
    expect(sceneFill(SYNTHESIS, missionTools(SYNTHESIS, [], []))).toBe(1);
    const classic = missionTools(MISSION, ['qasim-baqi']);
    expect(toolProgress(classic)).toEqual({ lit: 1, total: 2 });
    expect(sceneFill(MISSION, classic)).toBe(0.5);
    expect(sceneFill(MISSION, [])).toBe(0);
  });
});

describe('a mission with no checkpoint (`checkpoints: []`)', () => {
  it('never asks one, at any module', () => {
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((n) => expect(pendingCheckpoint(SYNTHESIS, [0, 1, 2, 3, 4, 5, 6, 7], {}, n)).toBeNull());
    expect(shouldWelcome({}, 3, pendingCheckpoint(SYNTHESIS, [0, 1, 2], {}, 3))).toBe(true);
  });
});

describe('stationLabels and a climax on the LAST module', () => {
  const config = { mission: SYNTHESIS, modules: [0, 1, 6, 7, 8].map((n) => ({ number: n, slug: `m${n}`, title: `محور ${n} — عنوان ${n}` })) };
  it('the last module is the 🏆 station and nothing comes after it (no bonus station)', () => {
    const stations = missionStations(config, () => 'locked');
    expect(stations.map((s) => s.kind)).toEqual(['stage', 'stage', 'stage', 'stage', 'climax']);
    expect(stations[stations.length - 1].number).toBe(8);
  });
  it('a station takes its label from mission.stationLabels, otherwise from its module title', () => {
    const stations = missionStations(config, () => 'locked');
    expect(stations.map((s) => s.label)).toEqual(['عنوان 0', 'عنوان 1', 'عنوان 6', 'وضعية الوحدة', 'التحدّي 🏆']);
    expect(stations.map((s) => s.title)).toEqual(config.modules.map((m) => m.title));
  });
  it('without stationLabels every label is the old stationLabel(title)', () => {
    const plain = { mission: MISSION, modules: [3, 4].map((n) => ({ number: n, slug: `m${n}`, title: `نشاط ${n} — شيء ${n}` })) };
    expect(missionStations(plain, () => 'locked').map((s) => s.label)).toEqual(['شيء 3', 'شيء 4']);
  });
});

describe('trainingsDone / showStars / openingMinutes', () => {
  it('counts the completed training modules, or is null when the lesson declares none', () => {
    expect(trainingsDone(SYNTHESIS, [])).toEqual({ done: 0, total: 6 });
    expect(trainingsDone(SYNTHESIS, ['00', 1, '2', 7])).toEqual({ done: 2, total: 6 });
    expect(trainingsDone(SYNTHESIS, [0, 1, 2, 3, 4, 5, 6, 7, 8])).toEqual({ done: 6, total: 6 });
    expect(trainingsDone(MISSION, [1, 2])).toBeNull();
    expect(trainingsDone({ trainings: [] }, [1])).toBeNull();
  });
  it('hideStars hides the ⭐ counter only while it reads 0 — the first lab star brings it back', () => {
    expect(showStars(SYNTHESIS, 0)).toBe(false);
    expect(showStars(SYNTHESIS, 1)).toBe(true);
    expect(showStars(MISSION, 0)).toBe(true);
    expect(showStars(undefined, 0)).toBe(true);
  });
  it('the opening shows mission.durationMin when given, the catalogue duration otherwise', () => {
    expect(openingMinutes({ estimatedDurationMin: 31, mission: { durationMin: 70 } })).toBe(70);
    expect(openingMinutes({ estimatedDurationMin: 31, mission: {} })).toBe(31);
    expect(openingMinutes({ mission: {} })).toBeNull();
  });
});
