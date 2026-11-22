import { describe, it, expect } from 'vitest';
import { buildProgressionTree, flattenTree, aggregateLessons } from './buildProgressionTree';
import { applyProgressionView, DEFAULT_VIEW, normalizeText, pointStateSet } from './progressionView';
import { pickWorkNow, pickNextStep } from './pickWorkNow';
import { formatLastActivity } from './formatLastActivity';

/**
 * Un catalogue MINIMAL à la forme exacte de coursesData.js (niveau → classe
 * → ميدان → وحدة → درس → points), et une activité à la forme exacte de
 * getStudentActivity. Rien ici n'est le vrai programme : ces tests
 * vérifient la MÉCANIQUE (hiérarchie conservée, états jamais inventés),
 * pas les intitulés.
 */
function lp(gradeId, code, n) {
  return { id: `${gradeId}_${code}_P${n}`, title: `نقطة ${code} ${n}`, order: n };
}
function lesson(code, { unitId = null, kind = 'lesson', status = 'available', title = `درس ${code}`, points = 3 } = {}) {
  return {
    id: code, title, kind, unitId, status, icon: '📘',
    path: `/courses/moyen/4am/ch/${code}`,
    learningPoints: Array.from({ length: points }, (_, i) => lp('4am', code, i + 1)),
  };
}

const fractions = lesson('fractions', { unitId: 'u1', title: 'الكسور' });
const ops = lesson('ops', { unitId: 'u1', title: 'العمليات على الكسور' });
const synth = lesson('synth', { unitId: 'u1', kind: 'synthesis', title: 'أدمج تعلّماتي', points: 2 });
const loose = lesson('loose', { title: 'درس هندسي', points: 2 });
const soon = lesson('soon', { title: 'قريبًا', status: 'coming_soon' });

const unit1 = { id: 'u1', number: 1, title: 'الأعداد الناطقة', subtitle: null, order: 0, chapterId: 'f1', path: '/u/u1', lessons: [fractions, ops], synthesis: synth };
const field1 = { id: 'f1', title: 'ميدان الأعداد والحساب', subtitle: 'الجبر', order: 0, units: [unit1], lessons: [fractions, ops, synth] };
const field2 = { id: 'f2', title: 'ميدان الهندسة', subtitle: null, order: 1, units: [], lessons: [loose, soon] };
const field3 = { id: 'f3', title: 'ميدان تنظيم المعطيات', subtitle: null, order: 2, units: [], lessons: [soon] };

const courseLevels = [{
  id: 'moyen', title: 'التعليم المتوسط',
  grades: [{ id: '4am', name: 'السنة الرابعة متوسط', chapters: [field1, field2, field3] }],
}];

const NOW = Date.UTC(2026, 8, 19, 12);
const DAY = 86400000;

function entry(l, { progressPercent = 0, lastVisitedAt = 0, modules = [] } = {}) {
  return { lesson: l, progressPercent, lastVisitedAt, currentModule: 1, uniqueModules: new Set(modules), totalCount: 4 };
}
const activity = {
  lessons: [
    entry(fractions, { progressPercent: 50, lastVisitedAt: NOW - DAY, modules: [1, 2] }),
    entry(ops, { progressPercent: 100, lastVisitedAt: NOW - 3 * DAY, modules: [1, 2, 3, 4] }),
    entry(synth),
    entry(loose, { progressPercent: 25, lastVisitedAt: NOW - 10 * DAY, modules: [1] }),
  ],
};

const currentMastery = [{
  grade: '4am',
  lessons: [
    { lesson: 'fractions', title: 'الكسور', chapter: 'f1', learningPoints: [
      { code: '4am_fractions_P1', title: 'جمع كسرين', status: 'gap', confidence: 0.2 },
      { code: '4am_fractions_P2', title: 'مقارنة كسرين', status: 'reinforce', confidence: 0.55 },
      // P3 absent → unassessed, jamais autre chose.
    ] },
    { lesson: 'ops', title: 'العمليات', chapter: 'f1', learningPoints: [
      { code: '4am_ops_P1', title: 'ضرب كسرين', status: 'mastered', confidence: 0.9 },
      { code: '4am_ops_P2', title: 'قسمة كسرين', status: 'mastered', confidence: 0.85 },
      { code: '4am_ops_P3', title: 'ترتيب', status: 'gap', confidence: 0.1 },
    ] },
  ],
}];

const getModulePath = (id, n) => `/courses/moyen/4am/ch/${id}/m${n}`;
const tree = buildProgressionTree(courseLevels, activity, currentMastery, { gradeId: '4am', getModulePath });

describe('buildProgressionTree — la hiérarchie officielle, sans aplatissement', () => {
  it('classe → ميدان → وحدة → درس → points', () => {
    expect(tree.grades).toHaveLength(1);
    const [g] = tree.grades;
    expect(g.fields.map((f) => f.id)).toEqual(['f1', 'f2', 'f3']);
    const f1 = g.fields[0];
    expect(f1.groups).toHaveLength(1);
    expect(f1.groups[0].kind).toBe('unit');
    expect(f1.groups[0].lessons.map((l) => l.id)).toEqual(['fractions', 'ops', 'synth']);
    expect(f1.groups[0].lessons[0].points.map((p) => p.code)).toEqual(['4am_fractions_P1', '4am_fractions_P2', '4am_fractions_P3']);
  });

  it('les leçons hors unité restent dans leur ميدان, dans un groupe à part', () => {
    const f2 = tree.grades[0].fields[1];
    expect(f2.groups).toHaveLength(1);
    expect(f2.groups[0].kind).toBe('other');
    expect(f2.groups[0].lessons.map((l) => l.id)).toEqual(['loose']);
  });

  it('une leçon non construite est comptée « قيد الإعداد », jamais affichée à 0 %', () => {
    const f2 = tree.grades[0].fields[1];
    expect(f2.groups[0].comingSoon).toBe(1);
    const f3 = tree.grades[0].fields[2];
    expect(f3.groups).toHaveLength(1);
    expect(f3.groups[0].lessons).toHaveLength(0);
    expect(f3.comingSoon).toBe(1);
    expect(f3.agg.lessons).toBe(0);
    expect(flattenTree(tree).map((x) => x.lesson.id)).not.toContain('soon');
  });

  it('l’état de chaque point vient du profil ; l’absence = non évalué', () => {
    const fr = tree.grades[0].fields[0].groups[0].lessons[0];
    expect(fr.points.map((p) => p.state)).toEqual(['gap', 'reinforce', 'unassessed']);
    expect(fr.counts).toEqual({ mastered: 0, reinforce: 1, gap: 1, unassessed: 1 });
    expect(fr.assessed).toBe(2);
    expect(fr.hasWork).toBe(true);
    // Le titre du profil prime quand il existe, sinon celui du catalogue.
    expect(fr.points[0].title).toBe('جمع كسرين');
    expect(fr.points[2].title).toBe('نقطة fractions 3');
  });

  it('une leçon sans aucune preuve n’a que des points non évalués', () => {
    const s = tree.grades[0].fields[0].groups[0].lessons[2];
    expect(s.isSynthesis).toBe(true);
    expect(s.counts).toEqual({ mastered: 0, reinforce: 0, gap: 0, unassessed: 2 });
    expect(s.assessed).toBe(0);
    expect(s.activityState).toBe('not_started');
  });

  it('les niveaux supérieurs ADDITIONNENT — aucun ratio de maîtrise inventé', () => {
    const u1 = tree.grades[0].fields[0].groups[0];
    expect(u1.agg.counts).toEqual({ mastered: 2, reinforce: 1, gap: 2, unassessed: 3 });
    expect(u1.agg.assessed).toBe(5);
    expect(u1.agg.points).toBe(8);
    expect(u1.agg.lessons).toBe(3);
    expect(u1.agg.done).toBe(1);
    expect(u1.agg.inProgress).toBe(1);
    expect(u1.agg.avgProgress).toBe(50); // (50 + 100 + 0) / 3
    expect(u1.agg.lastVisitedAt).toBe(NOW - DAY);
    expect(tree.agg.counts.mastered).toBe(2);
    expect(tree.agg.lessons).toBe(4);
    expect(aggregateLessons([]).avgProgress).toBe(0);
  });

  it('l’action de la leçon suit son état, et « continuer » passe par le registre', () => {
    const [fr, ops2, s] = tree.grades[0].fields[0].groups[0].lessons;
    expect(fr.cta).toEqual({ kind: 'continue', path: '/courses/moyen/4am/ch/fractions/m3' });
    expect(ops2.cta).toEqual({ kind: 'reviewGaps', path: ops.path });
    expect(s.cta).toEqual({ kind: 'start', path: synth.path });
  });

  it('sans registre, « continuer » retombe sur l’index de la leçon', () => {
    const t2 = buildProgressionTree(courseLevels, activity, currentMastery, { gradeId: '4am' });
    expect(t2.grades[0].fields[0].groups[0].lessons[0].cta.path).toBe(fractions.path);
  });

  it('une autre classe ne fuit pas dans l’arbre', () => {
    const t2 = buildProgressionTree(courseLevels, activity, currentMastery, { gradeId: 'autre' });
    expect(t2.grades).toHaveLength(0);
    expect(t2.lessonCount).toBe(0);
  });

  it('un élève neuf : tout est non commencé, rien n’est évalué, rien n’est faux', () => {
    const t2 = buildProgressionTree(courseLevels, { lessons: activity.lessons.map((e) => entry(e.lesson)) }, [], { gradeId: '4am' });
    for (const { lesson: l } of flattenTree(t2)) {
      expect(l.activityState).toBe('not_started');
      expect(l.progressPercent).toBe(0);
      expect(l.assessed).toBe(0);
      expect(l.hasWork).toBe(false);
    }
    expect(t2.agg.started).toBe(0);
  });
});

describe('applyProgressionView — recherche, filtres et tri gardent le contexte', () => {
  const lessonsOf = (v) => v.grades.flatMap((g) => g.fields.flatMap((f) => f.groups.flatMap((gr) => gr.lessons.map((l) => `${f.id}/${gr.id}/${l.id}`))));

  it('la vue par défaut garde tout, y compris les ميادين encore en préparation', () => {
    const v = applyProgressionView(tree, DEFAULT_VIEW);
    expect(v.active).toBe(false);
    expect(v.grades[0].fields.map((f) => f.id)).toEqual(['f1', 'f2', 'f3']);
    expect(v.matched).toBe(4);
    expect(v.total).toBe(4);
  });

  it('un point qui correspond remonte AVEC son درس, sa وحدة et son ميدان', () => {
    const v = applyProgressionView(tree, { ...DEFAULT_VIEW, query: 'قسمة' });
    expect(lessonsOf(v)).toEqual(['f1/u1/ops']);
    const l = v.grades[0].fields[0].groups[0].lessons[0];
    expect(l.visiblePoints.map((p) => p.code)).toEqual(['4am_ops_P2']);
    expect(l.forceOpen).toBe(true);
    // Les ميادين sans correspondance disparaissent, en préparation ou non.
    expect(v.grades[0].fields.map((f) => f.id)).toEqual(['f1']);
  });

  it('la recherche ignore les diacritiques et les variantes de lettres', () => {
    expect(normalizeText('الكُسُور')).toBe(normalizeText('الكسور'));
    expect(normalizeText('أدمج')).toBe(normalizeText('ادمج'));
    const v = applyProgressionView(tree, { ...DEFAULT_VIEW, query: 'الكُسور' });
    expect(lessonsOf(v)).toEqual(['f1/u1/fractions', 'f1/u1/ops']);
  });

  it('un titre de ميدان ou de وحدة qui correspond garde toutes ses leçons, points complets', () => {
    const v = applyProgressionView(tree, { ...DEFAULT_VIEW, query: 'الناطقة' });
    expect(lessonsOf(v)).toEqual(['f1/u1/fractions', 'f1/u1/ops', 'f1/u1/synth']);
    expect(v.grades[0].fields[0].groups[0].lessons[0].visiblePoints).toHaveLength(3);
    expect(v.grades[0].fields[0].groups[0].lessons[0].forceOpen).toBe(false);
  });

  it('« للعمل » ne retient que gap et reinforce — jamais les non évalués', () => {
    expect([...pointStateSet({ ...DEFAULT_VIEW, filter: 'work' })].sort()).toEqual(['gap', 'reinforce']);
    const v = applyProgressionView(tree, { ...DEFAULT_VIEW, filter: 'work' });
    expect(lessonsOf(v)).toEqual(['f1/u1/fractions', 'f1/u1/ops']);
    const fr = v.grades[0].fields[0].groups[0].lessons[0];
    expect(fr.visiblePoints.map((p) => p.state)).toEqual(['gap', 'reinforce']);
    expect(fr.forceOpen).toBe(true);
    // La synthèse (tout non évalué) et la leçon hors unité (rien d'évalué)
    // sortent — et leur ميدان avec elles quand il se vide.
    expect(v.grades[0].fields.map((f) => f.id)).toEqual(['f1']);
  });

  it('« قيد الإنجاز » et « مُنجزة » filtrent sur l’activité, hiérarchie conservée', () => {
    expect(lessonsOf(applyProgressionView(tree, { ...DEFAULT_VIEW, filter: 'inProgress' }))).toEqual(['f1/u1/fractions', 'f2/f2__other/loose']);
    expect(lessonsOf(applyProgressionView(tree, { ...DEFAULT_VIEW, filter: 'done' }))).toEqual(['f1/u1/ops']);
  });

  it('les filtres avancés se combinent (ميدان, état de point, état de leçon)', () => {
    expect(lessonsOf(applyProgressionView(tree, { ...DEFAULT_VIEW, fieldId: 'f2' }))).toEqual(['f2/f2__other/loose']);
    const v = applyProgressionView(tree, { ...DEFAULT_VIEW, masteryStates: ['unassessed'] });
    expect(lessonsOf(v)).toEqual(['f1/u1/fractions', 'f1/u1/synth', 'f2/f2__other/loose']);
    expect(v.grades[0].fields[0].groups[0].lessons[0].visiblePoints.map((p) => p.state)).toEqual(['unassessed']);
    // « للعمل » ∩ { mastered } = ∅ : rien ne passe.
    expect(applyProgressionView(tree, { ...DEFAULT_VIEW, filter: 'work', masteryStates: ['mastered'] }).matched).toBe(0);
    expect(lessonsOf(applyProgressionView(tree, { ...DEFAULT_VIEW, activityStates: ['not_started'] }))).toEqual(['f1/u1/synth']);
  });

  it('le tri « آخر نشاط » ordonne les leçons dans leur unité, et les unités dans leur ميدان', () => {
    const v = applyProgressionView(tree, { ...DEFAULT_VIEW, sort: 'recent' });
    expect(v.grades[0].fields[0].groups[0].lessons.map((l) => l.id)).toEqual(['fractions', 'ops', 'synth']);
    expect(v.grades[0].fields.map((f) => f.id)).toEqual(['f1', 'f2', 'f3']);
    const o = applyProgressionView(tree, { ...DEFAULT_VIEW, sort: 'oldest' });
    expect(o.grades[0].fields.map((f) => f.id)).toEqual(['f2', 'f1', 'f3']);
    expect(o.grades[0].fields.find((f) => f.id === 'f1').groups[0].lessons.map((l) => l.id)).toEqual(['ops', 'fractions', 'synth']);
    const p = applyProgressionView(tree, { ...DEFAULT_VIEW, sort: 'progress' });
    expect(p.grades[0].fields[0].groups[0].lessons.map((l) => l.id)).toEqual(['ops', 'fractions', 'synth']);
  });

  it('une recherche sans résultat ne rend aucun nœud, mais dit combien il y en avait', () => {
    const v = applyProgressionView(tree, { ...DEFAULT_VIEW, query: 'zzz' });
    expect(v.grades).toHaveLength(0);
    expect(v.matched).toBe(0);
    expect(v.total).toBe(4);
  });
});

describe('pickWorkNow — une règle déterministe, jamais les non évalués', () => {
  it('gap d’abord, puis reinforce ; à état égal la leçon la plus récente', () => {
    const { items, total } = pickWorkNow(tree, { limit: 10 });
    expect(total).toBe(3);
    expect(items.map((i) => `${i.point.state}:${i.point.code}`)).toEqual([
      'gap:4am_fractions_P1',   // fractions visitée hier
      'gap:4am_ops_P3',         // ops visitée il y a 3 jours
      'reinforce:4am_fractions_P2',
    ]);
    expect(items[0].field.id).toBe('f1');
    expect(items[0].group.id).toBe('u1');
    expect(items[0].lesson.id).toBe('fractions');
    expect(items.some((i) => i.point.state === 'unassessed')).toBe(false);
  });

  it('respecte la limite et annonce le total', () => {
    const { items, total } = pickWorkNow(tree, { limit: 2 });
    expect(items).toHaveLength(2);
    expect(total).toBe(3);
  });

  it('la prochaine étape : une leçon en cours, sinon la première non commencée', () => {
    expect(pickNextStep(tree).lesson.id).toBe('fractions');
    const fresh = buildProgressionTree(courseLevels, { lessons: activity.lessons.map((e) => entry(e.lesson)) }, [], { gradeId: '4am' });
    expect(pickNextStep(fresh).lesson.id).toBe('fractions');
    expect(pickWorkNow(fresh).total).toBe(0);
  });
});

describe('formatLastActivity', () => {
  const t = (k, o) => (o?.count != null ? `${k}:${o.count}` : k);
  it('relatif pour les jours proches, absolu au-delà, rien pour « jamais »', () => {
    expect(formatLastActivity(0, t, NOW)).toBeNull();
    expect(formatLastActivity(NOW - 60000, t, NOW)).toBe('progression.relative.today');
    expect(formatLastActivity(NOW - DAY, t, NOW)).toBe('progression.relative.yesterday');
    expect(formatLastActivity(NOW - 3 * DAY, t, NOW)).toBe('progression.relative.daysAgo:3');
    expect(formatLastActivity(NOW - 15 * DAY, t, NOW)).toBe('progression.relative.weeksAgo:2');
    expect(typeof formatLastActivity(NOW - 90 * DAY, t, NOW)).toBe('string');
  });
});
