import { describe, it, expect } from 'vitest';
import { getUnitById } from '@smarter-academy/core';
import { UNIT_MISSIONS, unitState, unmetPrerequisites } from './unitMissions';

/**
 * Le contenu de la page d'unité (regard élève, 2026-11-09) est écrit par la plateforme : il doit couvrir CHAQUE leçon de l'unité, ses
 * clés doivent pointer vers de vraies leçons, ses nombres être dans son texte — et aucune ligne ne renvoie au manuel (indépendance).
 */
const BOOK = /الكتاب|كتاب|ص\s*\d|صفحة/;

describe.each(Object.entries(UNIT_MISSIONS))('unit mission content « %s »', (unitId, m) => {
  const unit = getUnitById(unitId);
  const ids = [...unit.lessons, ...(unit.synthesis ? [unit.synthesis] : [])].map((l) => l.id);
  it('exists in the catalogue, and every lesson (and the synthesis) has a station icon and a short label', () => {
    expect(unit).toBeTruthy();
    ids.forEach((id) => { expect(m.icons[id], id).toBeTruthy(); expect(m.short[id], id).toBeTruthy(); });
    Object.keys({ ...m.icons, ...m.short }).forEach((id) => expect(ids).toContain(id));
  });
  it('its keys and the challenge point to real lessons of the unit', () => {
    m.keys.forEach((k) => expect(ids).toContain(k.after));
    expect(ids).toContain(m.challenge.solvedAfter);
  });
  it('the highlighted numbers are in both texts of the challenge', () => {
    m.challenge.numbers.forEach((n) => { expect(m.challenge.lead).toContain(String(n)); expect(m.challenge.full).toContain(String(n)); });
  });
  it('no student-visible line sends the student to the textbook', () => {
    const text = JSON.stringify({ c: m.challenge, h: m.history, k: m.keys, s: m.short });
    expect(BOOK.test(text)).toBe(false);
  });
  it('the stations follow the catalogue order (lessons, then the synthesis) — the path and the e2e read this order', () => {
    expect(Object.keys(m.icons)).toEqual(ids);
  });
  it('five keys, in the order of the lessons (a unit of three or four lessons hands two keys in one lesson)', () => {
    expect(m.keys).toHaveLength(5);
    const at = m.keys.map((k) => ids.indexOf(k.after));
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });
});

describe('unit 2 « الحساب على الجذور » — the challenge never writes its answer', () => {
  // ℓ² = 12 : ℓ = √12 = 2√3 ≈ 3,46 m, L = 4√3 ≈ 6,93 m — and the price, a parasite datum of the situation, is not on the page
  const text = JSON.stringify(UNIT_MISSIONS['hisab-judhur'].challenge);
  it.each(['√12', '2√3', '4√3', '3,46', '6,93', '12000', '12 000'])('« %s » is not on the unit page', (s) => {
    expect(text.includes(s)).toBe(false);
  });
});

describe('unit 9 « خاصية طالس » — the challenge never writes its answer nor another lesson\'s climax', () => {
  // 11,6 ÷ 1,6 = 7,25 m (the synthesis, module 7) ; 10 m is a number of inshaat-talis's climax (the derby banner) — neither is on the page
  const m = UNIT_MISSIONS['khassiyat-talis'];
  const text = JSON.stringify(m.challenge);
  it.each(['7,25', '7.25', '10 m', ' 10 ', '4/29'])('« %s » is not on the unit page', (s) => {
    expect(text.includes(s)).toBe(false);
  });
  it('the five keys are the five tools of the synthesis mission', async () => {
    const { LESSON_CONFIG } = await import('../../lessons/moyen/4am/handasa/khassiyat-talis/wadiya-idmajiya-talis/lesson.config.js');
    expect(m.keys.map((k) => k.icon)).toEqual(LESSON_CONFIG.mission.tools.map((tl) => tl.icon));
  });
});

describe('unit 3 « الحساب الحرفي » — the challenge never writes its answer nor a lesson\'s climax', () => {
  // (x + 6)² = (x + 2)² + (x + 4)² ⟺ x² = 16 : x = 4, sides 6, 8, 10 m. « x + 3 » / « x − 3 » belong to lesson 2's مسألة,
  // 10x² + 15x to lesson 3's, 1820 and x = 30 to lesson 1's — none is on the page.
  const text = JSON.stringify(UNIT_MISSIONS['hisab-harfi'].challenge);
  it.each(['x = 4', 'x=4', '16', ' 6 ', ' 8 ', '10', 'x + 3', 'x - 3', 'x − 3', '15x', '1820', 'x = 30'])('« %s » is not on the unit page', (s) => {
    expect(text.includes(s)).toBe(false);
  });
  it('the sides make a right triangle for exactly one positive x (the x terms cancel)', () => {
    const roots = [];
    for (let x = 1; x <= 50; x += 1) if ((x + 6) ** 2 === (x + 2) ** 2 + (x + 4) ** 2) roots.push(x);
    expect(roots).toEqual([4]);
  });
});

describe('unit 4 « المعادلات والمتراجحات » — the challenge never writes its answer nor a climax of the unit', () => {
  // 90x > 700 + 20x ⟺ 70x > 700 ⟺ x > 10 : equal at 10 sessions (900 دج), cheaper from 11. The unit's تحدّ (75 / 560 + 5x) is the synthesis's
  // 🏆 and its module 7 is 50x / 200 + 10x — neither is on the page; no lesson's مسألة signature either (`_unit/signatures/*.js`).
  const text = JSON.stringify(UNIT_MISSIONS['muadalat-mutarajihat'].challenge);
  it.each(['11', '10 ', 'x > 10', '900', '70x', '75', '560', '5x', '50x', '200', '10x', 'المسبح'])('« %s » is not on the unit page', (s) => {
    expect(text.includes(s)).toBe(false);
  });
  it('the second formula is cheaper from exactly 11 sessions on, equal at 10', () => {
    const cheaper = [];
    for (let x = 0; x <= 40; x += 1) if (700 + 20 * x < 90 * x) cheaper.push(x);
    expect(cheaper[0]).toBe(11);
    expect(700 + 20 * 10).toBe(90 * 10);
  });
  it('no line of the challenge shows a lesson\'s مسألة signature', async () => {
    const sigs = Object.values(import.meta.glob('../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/muadalat-mutarajihat/_unit/signatures/*.js', { eager: true }))
      .flatMap((m) => m.TEXT ?? []);
    expect(sigs.length).toBeGreaterThan(10);
    const c = UNIT_MISSIONS['muadalat-mutarajihat'].challenge;
    [c.lead, c.full, c.question].forEach((line) => sigs.forEach((re) => expect(re.test(line), `${re} — ${line}`).toBe(false)));
  });
});

describe('unit 5 « جمل معادلتين » — the challenge never writes its answer nor a climax of the unit', () => {
  // x + y = 23 ; 5x + 2y = 82 → 3x = 36 → (12 ; 11): the numbers RESERVED by the council (verdict X2), used by no lesson
  // (`_unit/unitCollisions.test.js`). The book's تحدّ (the class coins) stays in the lessons, never on this page.
  const text = JSON.stringify(UNIT_MISSIONS['jumal-muadalatayn'].challenge);
  it.each(['12', '11', '36', '3x', 'قطعة', 'دج'])('« %s » is not on the unit page', (s) => {
    expect(text.includes(s)).toBe(false);
  });
  it('the system has exactly the solution (12 ; 11) in whole boxes', () => {
    const sols = [];
    for (let x = 0; x <= 23; x += 1) if (5 * x + 2 * (23 - x) === 82) sols.push([x, 23 - x]);
    expect(sols).toEqual([[12, 11]]);
  });
  it('no line of the challenge shows a lesson\'s مسألة signature', () => {
    const sigs = Object.values(import.meta.glob('../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/jumal-muadalatayn/_unit/signatures/*.js', { eager: true }))
      .flatMap((m) => m.TEXT ?? []);
    expect(sigs.length).toBeGreaterThan(10);
    const c = UNIT_MISSIONS['jumal-muadalatayn'].challenge;
    [c.lead, c.full, c.question].forEach((line) => sigs.forEach((re) => expect(re.test(line), `${re} — ${line}`).toBe(false)));
  });
  it('the history line is the verified one of `_unit/abuKamil.js`', async () => {
    const { ABU_KAMIL } = await import('../../lessons/moyen/4am/ansab_al_aadad_wal_hisab/jumal-muadalatayn/_unit/abuKamil.js');
    expect(UNIT_MISSIONS['jumal-muadalatayn'].history.text).toBe(ABU_KAMIL.line);
  });
});

describe('unit state for a student', () => {
  const m = { keys: [{ after: 'a' }, { after: 'c' }] };
  it('the current lesson is the first open one not finished; keys follow finished lessons', () => {
    const s = unitState([{ id: 'a', done: true, available: true }, { id: 'b', done: false, available: true }, { id: 'c', done: false, available: true }], m);
    expect(s).toEqual({ done: 1, current: 'b', keysEarned: 1, finished: false });
  });
  it('a closed lesson is skipped; everything done means the unit is finished', () => {
    expect(unitState([{ id: 'a', done: true, available: true }, { id: 'b', done: false, available: false }, { id: 'c', done: false, available: true }], m).current).toBe('c');
    expect(unitState([{ id: 'a', done: true, available: true }, { id: 'c', done: true, available: true }], m)).toEqual({ done: 2, current: null, keysEarned: 2, finished: true });
  });
  it('only the unmet prerequisites inside the unit show up front', () => {
    const lesson = { prerequisiteLessonCodes: ['a', 'b', 'outside'] };
    expect(unmetPrerequisites(lesson, new Set(['a']), new Set(['a', 'b']))).toEqual(['b']);
  });
});
