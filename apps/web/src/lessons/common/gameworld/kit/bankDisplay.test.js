// The « brevet blanc » on the REAL banks of every v2 lesson (content/practice/<grade>/<id>/, served as they are): EVERY sheet
// of every level is drawn (the DEV hook names it) and every string the sitting shows is read — the statement, its formulas
// and table, each step, the widgets' words (choices, answer format), the model copy, the hints, the answer written back.
// Money is in euros, written the French way (« 450 € », a no-break space before the sign): no dinar of the Algerian banks
// (« DA », its Arabic sign) may reach the screen, and no Arabic letter at all. A segment named DA stays a segment.
import { describe, it, expect, afterAll } from 'vitest';
import { rng } from './random';
import { DEV_SHEET_KEY, createBankSittings, namesAsMath } from './bankSitting';

/** Every v2 lesson's sitting (a lesson is v2 when its world serves its bank: `world/sitting.js`). */
const LESSONS = import.meta.glob('../../../college/**/world/sitting.js', { eager: true });

/** A dinar: « DA » after a number (glued or not, or the formula that holds it) or in a unit « (DA) »; or its Arabic sign. */
const DINAR = /(?:\d\$?|\\,|\\text\{|\\mathrm\{)\s*DA(?![A-Za-z])|\(\s*DA\s*\)|\u062F\u062C/;
const ARABIC = /[\u0600-\u06FF]/;
/** A euro sign glued to its number, or after a plain space (French: « 450 € », a no-break space before the sign). */
const LOOSE_EURO = /\d ?€|\d\$ ?€/;

const right = (q) =>
  q.answerType === 'choice'
    ? { choiceId: q.bank.choices.find((c) => c.isCorrect)?.id }
    : q.paper
      ? undefined
      : { value: String(q.bank.expectedAnswer) };

/** Every string of a subject that reaches the screen. */
function shownStrings(sittings, s) {
  const out = [];
  for (const e of s.exercises) {
    out.push(e.title, e.topic, e.statement, ...e.formulas);
    if (e.table) out.push(...e.table.head, ...e.table.rows.flat());
    for (const q of e.questions) {
      out.push(q.text, q.lead, q.shown.statement, q.shown.lead, q.shown.answerFormat);
      out.push(...(q.shown.choices ?? []).map((c) => c.content));
      out.push(...sittings.model(q), ...sittings.guide(q), ...sittings.scheme(q));
      if (!q.paper) out.push(sittings.written(q, right(q)));
    }
  }
  return out.filter((x) => typeof x === 'string');
}

const store = {};
globalThis.localStorage = { getItem: (k) => store[k] ?? null };
afterAll(() => {
  delete globalThis.localStorage;
});

describe('the sittings of every v2 lesson, on their real banks — money is in euros', () => {
  const entries = Object.entries(LESSONS);

  // no v2 lesson before the first French lesson: the loop below checks every sitting the tree holds
  for (const [file, mod] of entries) {
    // a world not wired to its bank yet (`sittings = []`): its bank is read through the same adapter all the same
    const id = file.split('/').at(-3);
    const sittings = typeof mod.sittings?.prepare === 'function' ? mod.sittings : createBankSittings({ lesson: id });
    it(`${id}: every sheet of every level shows euros, French, and no dinar`, async () => {
      await sittings.prepare();
      let sheets = 0;
      for (const L of sittings.levels) {
        for (const id of sittings.sheetIds(L.n)) {
          store[DEV_SHEET_KEY] = id;
          const s = sittings.makeSubject(rng(1), L.n, [], {});
          if (!s) continue; // a sheet on paper only, alone at its level: nothing to sit
          expect(s.exercises[0].bankId, file).toBe(id);
          sheets += 1;
          for (const line of shownStrings(sittings, s)) {
            expect(line, `${id}: ${line}`).not.toMatch(DINAR);
            expect(line, `${id}: ${line}`).not.toMatch(ARABIC);
            expect(line, `${id}: ${line}`).not.toMatch(LOOSE_EURO);
          }
        }
      }
      delete store[DEV_SHEET_KEY];
      expect(sheets, file).toBeGreaterThan(0);
    });
  }

  it('leaves a name alone: a segment DA is not money, and the sitting rewrites no word of the bank', () => {
    expect(namesAsMath('$AB + DA = 7$')).toBe('$AB + DA = 7$');
    expect(namesAsMath('Le segment $[DA]$ mesure $5$\u00a0cm.')).toBe('Le segment $[DA]$ mesure $5$\u00a0cm.');
    expect(namesAsMath('Il paie 450\u00a0€.')).toBe('Il paie 450\u00a0€.');
  });
});

describe('a PGCD written in the words of a bank line is drawn as a formula', () => {
  it('the run and its « = n » become ONE formula, upright; inside a formula the name gets upright letters', () => {
    expect(namesAsMath('Le plus grand est 36, donc PGCD(252 ; 180) = 36.')).toBe(
      'Le plus grand est 36, donc $\\mathrm{PGCD}(252 ; 180) = 36$.',
    );
    expect(namesAsMath('On calcule PGCD(a ; b) d’abord')).toBe('On calcule $\\mathrm{PGCD}(a ; b)$ d’abord');
    expect(namesAsMath('$PGCD(252 ; 180) = 36$')).toBe('$\\mathrm{PGCD}(252 ; 180) = 36$');
    // already upright, or a word of the text without brackets: left as it is
    expect(namesAsMath('$\\mathrm{PGCD}(8 ; 12) = 4$')).toBe('$\\mathrm{PGCD}(8 ; 12) = 4$');
    expect(namesAsMath('On cherche le PGCD des deux nombres')).toBe('On cherche le PGCD des deux nombres');
  });
});
