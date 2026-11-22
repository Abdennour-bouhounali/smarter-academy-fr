// A mission's screens in French, left to right (server render: the first screen, and the shared pieces).
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import MissionRunner from './MissionRunner';
import Ink from './Ink';
import { Connect, Sheet, chipX } from './parts';
import { T } from './text';

const ARABIC = /[\u0600-\u06ff]/;

const SIT = {
  title: 'Les caisses du verger',
  session: 'Brevet blanc',
  intro: 'La coopérative prépare des lots identiques.',
  minutes: 12,
  paper: [
    { t: 'La coopérative a 48 caisses de pommes.', mark: 'a' },
    { t: 'Combien de lots ?', goal: 'g1' },
  ],
  data: [{ id: 'a', text: '48 caisses de pommes', say: 'C’est le stock de pommes.' }],
  goals: [{ id: 'g1', label: '1)', text: 'Combien de lots ?' }],
  plan: [],
  steps: [{ id: 'd', kind: 'data', stage: 1 }],
  model: [{ t: 'On cherche le PGCD.' }],
  marker: ['J’ai écrit les données.'],
};

describe('a mission speaks French and reads left to right', () => {
  it('the mission card: French sentences, no Arabic, no right-to-left', () => {
    const html = renderToString(<MissionRunner situation={SIT} world={{}} onClose={() => {}} />);
    expect(html).toContain('Les caisses du verger');
    expect(html).toContain(T.need);
    expect(html).toContain('12 minutes');
    expect(html).toContain(T.start);
    expect(html).toContain(T.notNow);
    expect(html).not.toMatch(ARABIC);
    expect(html).not.toContain('dir="rtl"');
  });

  it('a mission left half-way offers to go on from its step', () => {
    const html = renderToString(
      <MissionRunner situation={SIT} world={{}} onClose={() => {}} resume={{ i: 0, data: [] }} />,
    );
    expect(html).toContain('data-ms-resume');
    expect(html).toContain('Reprends où tu en étais (étape 1 sur 2)');
    expect(html).toContain(T.again);
  });

  it('the « on your sheet » gate and the pen bar are French', () => {
    const sheet = renderToString(<Sheet id="x" text={T.dataSheet} written={false} onWritten={() => {}} />);
    expect(sheet).toContain('Sur ta feuille :');
    expect(sheet).toContain('J’ai écrit sur ma feuille (3)');
    expect(sheet).toContain('« Les données »');
    const ink = renderToString(<Ink open onClose={() => {}} />);
    expect(ink).toContain(T.inkClose);
    expect(ink).not.toMatch(ARABIC);
    expect(ink).not.toContain('dir="rtl"');
  });

  it('every sentence of text.js is French: no Arabic, French typography', () => {
    const all = Object.values(T)
      .flatMap((v) => (typeof v === 'function' ? [v('x', 2, 3)] : v))
      .join(' ');
    expect(all).not.toMatch(ARABIC);
    expect(all).not.toMatch(/ [!?;:]/); // a plain space before high punctuation
    expect(all).not.toContain("'"); // the typographic apostrophe only
    expect(all).not.toMatch(/\bfaux\b/i);
  });
});

describe('« relie »: the chips are laid from the LEFT', () => {
  it('the first chip’s line starts left of the second’s', () => {
    expect(chipX(0, 3)).toBeLessThan(chipX(1, 3));
    expect(chipX(1, 3)).toBeLessThan(chipX(2, 3));
    const html = renderToString(
      <Connect
        goal={{ id: 'g1', label: '1)', text: 'Combien de lots ?' }}
        items={[
          { id: 'a', text: '48 caisses de pommes' },
          { id: 'b', text: '36 bouteilles de jus' },
        ]}
        picked={['a', 'b']}
        onPick={() => {}}
      />,
    );
    const xs = [...html.matchAll(/<line x1="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(xs).toEqual([25, 75]);
    expect(html.indexOf('data-ms-need="a"')).toBeLessThan(html.indexOf('data-ms-need="b"'));
  });
});
