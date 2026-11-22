import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import ComponentCalc from './ComponentCalc';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import * as L from '../logic/componentCalc';

/**
 * component-calc se rend aux deux niveaux de levels.js (le code de AB puis D ; نشاط 2 : le code de CD, E, CF), seul et
 * dans le workspace, sans clé i18n brute, sans interpolation oubliée, sans dollar hors des îlots.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const { beginner, advanced } = LEVELS['component-calc'];

describe('component-calc — rendu', () => {
  it('beginner: the map, the signed code pad (two spinbuttons ≥ 44 px), the portals with coordinates, the decor', () => {
    const html = renderToString(<ComponentCalc {...beginner.numbers} level="beginner" theme="game-map" />);
    expect(html).toContain('data-component-calc');
    expect(html).toContain('data-kind="calc"');
    expect(html).toContain('data-cc-glance');
    expect(html).toContain('data-cc-scene');
    expect((html.match(/role="spinbutton"/g) ?? []).length).toBe(2);
    expect(html).toContain('data-cc-sign="x"');
    expect(html).toContain('data-cc-open');
    expect(html).toContain('data-cc-portal="A"');
    expect(html).toContain('data-cc-portal="B"');
    expect(html).toContain('data-cc-hero');
    expect(html).toContain('data-cc-axes');
    expect(html).toContain('data-deco="chest"');
    expect((html.match(/data-cc-dot=/g) ?? []).length).toBe(2);
    expect(html).not.toContain('data-cc-next');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('advanced (نشاط 2): three missions, the portals C, D, F, the code of CD first', () => {
    const html = renderToString(<ComponentCalc {...advanced.numbers} level="advanced" theme="game-map" />);
    expect((html.match(/data-cc-dot=/g) ?? []).length).toBe(3);
    expect(html).toContain('data-cc-portal="C"');
    expect(html).toContain('data-cc-portal="D"');
    expect(html).toContain('data-cc-portal="F"');
    expect(html).not.toContain('data-cc-portal="E"');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <ComponentCalc level="beginner" numbers={beginner.numbers} />,
        advanced: () => <ComponentCalc level="advanced" numbers={advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-component-calc/g) ?? []).length).toBe(2);
    // deux niveaux montés : des identifiants SVG distincts (useId)
    const ids = [...html.matchAll(/id="(cc-swirl-[^"]+)"/g)].map((x) => x[1]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(html).not.toMatch(RAW);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.componentCalc.${key}`, o);

describe('component-calc — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque mission de chaque niveau : chaque question a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { chainOf, QUESTIONS } = await import('./ComponentCalc');
    for (const lv of [beginner, advanced]) {
      let s = L.init(lv.numbers);
      // on résout chaque mission (code juste ou point sur sa cible) pour que les questions « après coup » (jumeaux) existent
      for (let i = 0; i < s.missions.length; i += 1) {
        const m = s.missions[i];
        if (m.kind === 'calc') { const t = L.xy(L.calcTarget(s)); s = L.setEntry(L.setEntry(s, 0, t[0]), 1, t[1]); s = L.commitCalc(s); } else { s = L.commitPlace(s, m.target); }
        const chain = chainOf(s, i);
        expect(chain.length, `mission ${i}`).toBeGreaterThanOrEqual(2);
        for (const qid of chain) {
          const q = QUESTIONS[qid](s, i, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${i}.${qid}`).not.toMatch(RAW);
          expect(out, `${i}.${qid}`).not.toContain('{{');
          expect(q.hints, `${i}.${qid}`).toHaveLength(2);
          expect(q.options.filter((o) => o.correct), `${i}.${qid}`).toHaveLength(1);
          expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${i}.${qid} why`).toBe(true);
        }
        if (i < s.missions.length - 1) s = L.nextMission(s);
      }
      expect(chainOf(s, s.missions.length - 1).at(-1)).toBe('rule');
    }
    // beginner : A(1 ; 2), B(4 ; 3) → composantes 3 et 1 ; la 2e mission pose D tel que DC = AB
    let s = L.init(beginner.numbers);
    expect(QUESTIONS.calcBack(s, 0, k).options[0].correct).toBe(true);
  });

  it('mode guidé : ni la progression « جرّب › اكتشف › صِغ » ni le bouton d’indice, mais les étapes (LabStepper)', () => {
    const html = renderToString(<ComponentCalc {...beginner.numbers} level="beginner" theme="game-map" />);
    expect(html).not.toContain('data-manipulation-progress');
    expect(html).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(html).toContain('data-lab-stepper');
    expect(html).toContain('data-cc-dot="1"');
  });

  it('la même mission repart : restartMission efface le drapeau et le code, garde les essais', () => {
    let s = L.init(beginner.numbers);
    s = L.commitCalc(L.setEntry(L.setEntry(s, 0, 3), 1, 1));
    expect(s.solved[0]).toBe(true);
    const r = L.restartMission(s);
    expect(r.solved[0]).toBe(false);
    expect(r.entry[0]).toEqual([0, 0]);
    expect(r.trials).toHaveLength(1);
  });
});
