import { describe, expect, it } from 'vitest';
import { itemProgress, replay, bandsOf, bandCounts, priorities, BANDS } from './engine.js';
import shared from './fixtures/bands.json' with { type: 'json' };

describe('fixture partagée JS ↔ PHP (ItemBand.php)', () => {
  it.each(shared.cases.map((c, i) => [i, c]))('cas %i', (_i, c) => {
    const r = itemProgress(c.answers.map((a, k) => ({ itemId: 'x', level: 1 + (k > 0 ? 1 : 0), ...a })));
    expect(r.done).toBe(c.done);
    expect(r.done ? r.band : null).toBe(c.band);
    expect(r.next?.level ?? null).toBe(c.nextLevel);
  });
});

const A = (itemId, level, correct, unsure = false) => ({ itemId, level, correct, unsure });

describe('itemProgress — la machine par كفاءة', () => {
  it('L1 ✓ L2 ✓ → ثابتة', () => {
    expect(itemProgress([A('x', 1, true), A('x', 2, true)])).toMatchObject({ done: true, band: BANDS.SOLID });
  });
  it('L1 ✓ L2 ✗ → تحتاج تثبيتًا', () => {
    expect(itemProgress([A('x', 1, true), A('x', 2, false)]).band).toBe(BANDS.CONSOLIDATE);
  });
  it('deux L1 ✗ → نبدأ منها (jamais sur une seule réponse)', () => {
    expect(itemProgress([A('x', 1, false)])).toMatchObject({ done: false, next: { level: 1 } });
    expect(itemProgress([A('x', 1, false), A('x', 1, false)]).band).toBe(BANDS.START);
  });
  it('un faux pas puis deux ✓ → تحتاج تثبيتًا', () => {
    expect(itemProgress([A('x', 1, false), A('x', 1, true), A('x', 2, true)]).band).toBe(BANDS.CONSOLIDATE);
  });
  it('« غير متأكّد » compte comme non réussi', () => {
    expect(itemProgress([A('x', 1, true), A('x', 2, true, true)]).band).toBe(BANDS.CONSOLIDATE);
  });
});

// Réseau jouet : T ← P1 ← P2 ← P3 (P3 = étape 3, jamais atteinte) ; T2 ← P1 (partagé)
const NET = { T: ['P1'], T2: ['P1'], P1: ['P2'], P2: ['P3'], P3: [] };
const prereqsOf = (id) => NET[id] ?? [];

describe('replay — portée adaptative', () => {
  it('commence par le niveau 1 de chaque cible, dans l’ordre', () => {
    const s = replay({ targets: ['T', 'T2'], prereqsOf, answers: [] });
    expect(s.next).toEqual({ itemId: 'T', level: 1 });
    const s2 = replay({ targets: ['T', 'T2'], prereqsOf, answers: [A('T', 1, true)] });
    expect(s2.next).toEqual({ itemId: 'T2', level: 1 });
  });
  it('une cible ثابتة ne descend jamais dans ses prérequis', () => {
    const s = replay({ targets: ['T'], prereqsOf, answers: [A('T', 1, true), A('T', 2, true)] });
    expect(s.order).toEqual(['T']);
    expect(s.finished).toBe(true);
  });
  it('un échec ouvre l’étape 1, puis l’étape 2, jamais l’étape 3', () => {
    const answers = [A('T', 1, false), A('T', 1, false), A('P1', 1, false), A('P1', 1, false), A('P2', 1, false), A('P2', 1, false)];
    const s = replay({ targets: ['T'], prereqsOf, answers });
    expect(s.order).toEqual(['T', 'P1', 'P2']);
    expect(s.items.get('P2').step).toBe(2);
    expect(s.finished).toBe(true);
  });
  it('un prérequis partagé n’est mesuré qu’une fois', () => {
    const answers = [A('T', 1, false), A('T2', 1, false), A('T', 1, false), A('T2', 1, false)];
    const s = replay({ targets: ['T', 'T2'], prereqsOf, answers });
    expect(s.order.filter((id) => id === 'P1')).toHaveLength(1);
    expect(s.items.get('P1').parents).toEqual(['T', 'T2']);
  });
  it('un item sans question reste « لم نفحصها بعد » sans bloquer', () => {
    const s = replay({ targets: ['T', 'T2'], prereqsOf, answers: [], hasQuestion: (id) => id !== 'T' });
    expect(s.next.itemId).toBe('T2');
    expect(bandsOf(s).get('T')).toBe(BANDS.UNSEEN);
  });
  it('s’arrête au plafond de questions et signale la fin de manche', () => {
    const targets = Array.from({ length: 20 }, (_, i) => `I${i}`);
    const answers = targets.slice(0, 12).map((id) => A(id, 1, true));
    const s = replay({ targets, prereqsOf: () => [], answers, options: { roundSize: 12 } });
    expect(s.roundEnded).toBe(true);
    const capped = replay({ targets, prereqsOf: () => [], answers, options: { maxQuestions: 12 } });
    expect(capped.finished).toBe(true);
  });
});

describe('rapport', () => {
  it('compte par bande et met la lacune la plus profonde en priorité', () => {
    const answers = [
      A('T', 1, false), A('T', 1, false),
      A('P1', 1, true), A('P1', 2, false),
      A('P2', 1, false), A('P2', 1, false),
      A('T2', 1, true), A('T2', 2, true),
    ];
    const s = replay({ targets: ['T', 'T2'], prereqsOf, answers });
    const bands = bandsOf(s);
    expect(bandCounts(bands)).toEqual({ solid: 1, consolidate: 1, start: 2, unseen: 0 });
    const p = priorities(s, bands);
    expect(p.priority).toBe('P2');
    expect(p.also).toEqual(['T', 'P1']);
  });
});
