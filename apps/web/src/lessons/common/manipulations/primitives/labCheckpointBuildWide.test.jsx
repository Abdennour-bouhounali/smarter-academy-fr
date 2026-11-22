import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { BuildAnswer } from './LabCheckpoint';
import * as C from './labCheckpoint';

/**
 * Emplacement LARGE pour un mot arabe dans `build` (opt-in `q.wideText`, 2026-11-11, unité 5 — verdict X10 / L3.11 / G4) :
 * « ثمن ▢ هو 90 دج، وثمن ▢ هو 50 دج. » avec les tuiles « الكرّاس » · « القلم » · « $x$ ». `true` élargit tous les emplacements,
 * une liste d'indices seulement ceux-là ; la rangée se lit alors de droite à gauche et passe à la ligne. Sans l'opt-in : le rendu d'avant.
 */
const k = (s) => s;
const PRICES = {
  id: 'buildAnswer', kind: 'build', slots: ['', ''], wrap: ['ثمن', 'هو 50 دج.'], ops: ['هو 90 دج، وثمن'],
  tiles: [{ text: 'الكرّاس' }, { text: 'القلم' }, 'x'], expected: ['الكرّاس', 'القلم'], hints: ['h1', 'h2'], wideText: true,
};
const html = (q, o = {}) => renderToString(<BuildAnswer q={q} settled={false} revealed={false} onAnswer={() => {}} k={k} {...o} />);
const slotTags = (h) => h.match(/<button[^>]*data-lab-checkpoint-slot="\d"[^>]*>/g) ?? [];

describe('build — opt-in wide text slot', () => {
  it('wideText: true widens every slot (w-[7rem]), reads the row right to left and lets it wrap', () => {
    const h = html(PRICES);
    const slots = slotTags(h);
    expect(slots).toHaveLength(2);
    slots.forEach((s) => { expect(s).toContain('w-[7rem]'); expect(s).toContain('data-lab-checkpoint-wide'); expect(s).not.toContain('w-[4.5rem]'); });
    expect(h).toMatch(/<div[^>]*class="flex flex-wrap[^"]*"[^>]*dir="rtl"[^>]*data-lab-checkpoint-sentence/);
    expect(h).toContain('ثمن');
    expect(h).toContain('هو 90 دج، وثمن');
  });

  it('a list of indices widens only those slots', () => {
    const slots = slotTags(html({ ...PRICES, wideText: [1] }));
    expect(slots[0]).toContain('w-[4.5rem]');
    expect(slots[0]).not.toContain('data-lab-checkpoint-wide');
    expect(slots[1]).toContain('w-[7rem]');
  });

  it('a placed word never wraps inside its wide slot', () => {
    const h = html({ ...PRICES, preset: ['الكرّاس', null] });
    expect(h).toMatch(/whitespace-nowrap"[^>]*data-lab-checkpoint-text[^>]*>الكرّاس</);
    const revealed = html(PRICES, { settled: true, revealed: true });
    expect(revealed.match(/whitespace-nowrap/g)).toHaveLength(2);
  });

  it('without the opt-in nothing changes: narrow slots, an LTR row without wrap, no marker', () => {
    const plain = { ...PRICES, wideText: undefined };
    const h = html(plain);
    slotTags(h).forEach((s) => expect(s).toContain('w-[4.5rem]'));
    expect(h).not.toContain('w-[7rem]');
    expect(h).not.toContain('data-lab-checkpoint-wide');
    expect(h).not.toContain('data-lab-checkpoint-sentence');
    expect(h).not.toContain('whitespace-nowrap');
    expect(h).toContain('class="flex items-start justify-center gap-2" dir="ltr"');
    expect(html({ ...PRICES, wideText: false })).toBe(h);
  });

  it('judging is untouched: the words are compared by their string, the letter decoy is wrong', () => {
    expect(C.isCorrect(PRICES, ['الكرّاس', 'القلم'])).toBe(true);
    expect(C.isCorrect(PRICES, ['القلم', 'الكرّاس'])).toBe(false);
    expect(C.submit(C.fresh(), PRICES, ['x', 'القلم']).status).toBe('wrong');
  });
});
