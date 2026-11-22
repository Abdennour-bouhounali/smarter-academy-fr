import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import ShapeProver from './ShapeProver';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import * as L from '../logic/shapeProver';

/**
 * shape-prover se rend aux deux niveaux de levels.js (le triangle du ملعب الحي ; la droite de C de la طريقة p. 145),
 * seul et dans le workspace, sans clé i18n brute, sans interpolation oubliée et sans mot latin hors des noms de points.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const LATIN_WORD = />[^<]*\b(?:VAR|claim|card|check|Enter|cone|ball)\b[^<]*</i;
const { beginner, advanced } = LEVELS['shape-prover'];

describe('shape-prover — rendu', () => {
  it('beginner (triangle): the pitch, three cones, C held, two claims, the three right-angle cards, the check, the decor', () => {
    const html = renderToString(<ShapeProver {...beginner.numbers} level="beginner" theme="football" />);
    expect(html).toContain('data-shape-prover');
    expect(html).toContain('data-mode="triangle"');
    expect(html).toContain('data-sp-glance');
    expect(html).toContain('data-sp-handle="C"');
    expect(html).toContain('data-x="-1" data-y="2"');
    expect((html.match(/data-sp-cone=/g) ?? []).length).toBe(3);
    expect((html.match(/data-sp-move=/g) ?? []).length).toBe(4);
    expect(html).toContain('data-sp-claim="right:A"');
    expect(html).toContain('data-sp-claim="iso:C"');
    // les cartes de la famille de l'affirmation (« قائم في A ») : les trois sommets
    expect((html.match(/data-sp-card=/g) ?? []).length).toBe(3);
    // le départ a l'air droit en A : la carte du sommet A n'est pas équilibrée
    expect(html).toMatch(/data-sp-card="pyth:A" data-balanced="false"/);
    expect(html).toContain('data-sp-check');
    expect(html).toContain('data-deco="turf"');
    expect(html).toContain('data-deco="ball"');
    expect(html).toContain('data-deco="phone"');
    expect(html).not.toContain('data-sp-rail');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
    expect(html).not.toMatch(LATIN_WORD);
  });

  it('advanced (طرائق p. 145): C on its rail x = −2 (up / down only), the three right-angle cards, no quad yet', () => {
    const html = renderToString(<ShapeProver {...advanced.numbers} level="advanced" theme="football" />);
    expect(html).toContain('data-mode="unknown"');
    expect(html).toContain('data-stage="tri"');
    expect(html).toContain('data-sp-rail');
    expect(html).toContain('data-x="-2" data-y="4"');
    expect((html.match(/data-sp-move=/g) ?? []).length).toBe(2);
    expect((html.match(/data-sp-card=/g) ?? []).length).toBe(3);
    expect(html).toContain('data-sp-claim="right:B"');
    expect(html).not.toContain('data-sp-next-quad');
    expect(html).not.toContain('data-sp-circle');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
    expect(html).not.toMatch(LATIN_WORD);
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace levels={{
        beginner: () => <ShapeProver level="beginner" numbers={beginner.numbers} />,
        advanced: () => <ShapeProver level="advanced" numbers={advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-shape-prover/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });
});

const k = (key, o) => i18n.t(`lesson:manipulation.shapeProver.${key}`, o);
const prove = (s, claim, cards, at) => {
  let x = at ? L.moveHeld(s, at) : s;
  x = L.setClaim(x, claim);
  for (const c of cards) x = L.toggleCard(x, c);
  return L.check(x);
};

describe('shape-prover — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque preuve de chaque niveau : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { chainOf, QUESTIONS } = await import('./ShapeProver');
    const { beginner, advanced } = LEVELS['shape-prover'];
    let t = L.init(beginner.numbers);
    t = prove(t, 'right:A', ['pyth:A'], [-1, 3]);
    t = prove(t, 'iso:C', ['iso:C'], [1, 2]);
    let u = L.init(advanced.numbers);
    u = prove(u, 'right:B', ['pyth:B'], [-2, -4]);
    u = L.openQuad(u);
    u = prove(u, 'square', ['vec', 'diag', 'side'], [2, -2]);
    u = prove(u, 'circle', ['circ']);
    for (const [s, claims] of [[t, ['right:A', 'iso:C']], [u, ['right:B', 'square', 'circle']]]) {
      for (const g of claims) expect(s.solved[g], g).toBe(true);
      for (const g of claims) {
        const chain = chainOf(s, g);
        expect(chain.length, g).toBeGreaterThanOrEqual(2);
        if (g === claims.at(-1)) expect(chain.at(-1)).toBe('rule');
        for (const qid of chain) {
          const q = QUESTIONS[qid](s, g, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${g}.${qid}`).not.toMatch(RAW);
          expect(out, `${g}.${qid}`).not.toContain('{{');
          expect(q.hints, `${g}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${g}.${qid}`).toHaveLength(1);
            expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${g}.${qid} why`).toBe(true);
          } else expect(q.expected, `${g}.${qid}`).toMatch(/^\d+$/);
        }
      }
    }
    expect(QUESTIONS.pythRead(t, 'right:A', k).expected).toBe('20');   // A(0 ; 0), B(3 ; 1), C(-1 ; 3) : AB² = AC² = 10
  });

  it('mode guidé : ni la progression ni le bouton d’indice, mais les étapes ; « أعِد التجربة » efface la preuve et ramène le plot', () => {
    const b = renderToString(<ShapeProver {...LEVELS['shape-prover'].beginner.numbers} level="beginner" />);
    expect(b).not.toContain('data-manipulation-progress');
    expect(b).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(b).toContain('data-lab-stepper');
    let s = L.init(LEVELS['shape-prover'].beginner.numbers);
    s = prove(s, 'right:A', ['pyth:A'], [-1, 3]);
    const r = L.retryClaim(s, 'right:A');
    expect(r.solved['right:A']).toBeUndefined();
    expect(L.xy(r.pts.C)).toEqual([-1, 2]);
    expect(r.trials).toHaveLength(1);
  });
});
