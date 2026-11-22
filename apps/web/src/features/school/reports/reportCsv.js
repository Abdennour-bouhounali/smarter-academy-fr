/**
 * L'export CSV d'un rapport FIGÉ (SCHOOL_ADMIN_SPACE.md, phase 5) — fonctions
 * PURES. Le serveur rend des codes et des nombres ; les libellés arabes sont
 * passés par l'appelant (`label(key)` → idara:reports.col.*, `stateLabel(state)`
 * → student:mastery.*), comme à l'écran. Toujours des EFFECTIFS, jamais une
 * moyenne.
 */

const STATES = ['mastered', 'reinforce', 'gap', 'unassessed'];

const fullName = (p) => [p?.firstName, p?.lastName].filter(Boolean).join(' ');

/**
 * @param {{type: string, payload: object}} report
 * @param {(key: string) => string} label
 * @param {(state: string) => string} stateLabel
 * @returns {Array<Array<string|number>>}
 */
export function reportRows(report, label, stateLabel) {
  const p = report.payload ?? {};
  const stateHeaders = STATES.map((s) => label(s));

  switch (report.type) {
    case 'class': {
      const rows = [[label('lesson'), label('learningPoint'), ...stateHeaders]];
      for (const lesson of p.lessons ?? []) {
        for (const lp of lesson.learningPoints) rows.push([lesson.title, lp.title, ...STATES.map((s) => lp.counts?.[s] ?? 0)]);
      }
      rows.push([]);
      rows.push([label('student'), label('gap'), label('reinforce'), label('mastered')]);
      for (const s of p.studentsToWatch ?? []) rows.push([fullName(s), s.gap, s.reinforce, s.mastered]);
      return rows;
    }
    case 'grade': {
      const rows = [[label('lesson'), label('learningPoint'), label('class'), ...stateHeaders]];
      const classes = p.map?.classes ?? [];
      for (const lesson of p.map?.lessons ?? []) {
        for (const lp of lesson.learningPoints) {
          for (const c of classes) rows.push([lesson.title, lp.title, c.name, ...STATES.map((s) => lp.byClass?.[String(c.id)]?.[s] ?? 0)]);
        }
      }
      return rows;
    }
    case 'student': {
      const rows = [[label('lesson'), label('learningPoint'), label('status')]];
      for (const lesson of p.progress?.lessons ?? []) {
        for (const lp of lesson.learningPoints ?? []) rows.push([lesson.title, lp.title, stateLabel(lp.status)]);
      }
      return rows;
    }
    case 'school_term': {
      const rows = [[label('gradeName'), label('classes'), label('students'), ...stateHeaders]];
      for (const g of p.grades ?? []) rows.push([g.gradeName, g.classes, g.students, ...STATES.map((s) => g.states?.[s] ?? 0)]);
      return rows;
    }
    case 'teachers': {
      const rows = [[label('teacher'), label('classes'), label('students'), label('interventionsOpened'), label('interventionsClosed'), label('lastSignIn')]];
      for (const tch of p.teachers ?? []) {
        const f = tch.facts ?? {};
        rows.push([fullName(tch), f.classes, f.students, f.interventionsOpened, f.interventionsClosed, f.lastSignInAt ?? '']);
      }
      return rows;
    }
    default:
      return [];
  }
}

function cell(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Des lignes → un CSV UTF-8 avec BOM (Excel lit alors l'arabe correctement). */
export function toCsv(rows) {
  return `﻿${rows.map((r) => r.map(cell).join(',')).join('\r\n')}\r\n`;
}
