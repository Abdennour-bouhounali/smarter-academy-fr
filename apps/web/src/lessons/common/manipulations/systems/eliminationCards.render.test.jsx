import { it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import EliminationCards from './EliminationCards';
import ManipulationWorkspace from '../ManipulationWorkspace';

/** Le TEXTE affiché (balises ôtées) : aucune clé i18n brute « manipulation.… » ne doit y paraître. */
const shownText = (html) => html.replace(/<[^>]+>/g, ' ');

/**
 * elimination-cards se rend pour chaque jumla que la leçon hall-jabri lui pose (les deux niveaux,
 * les deux jumal des طرائق), seul et dans un workspace à deux niveaux ouvert sur متقدم, sans clé
 * i18n brute, avec le contrat DOM des cartes, des tuiles, du multiplicateur et du décor.
 */
const SYSTEMS = ['x+y=10|x-y=2', '2x+y=7|3x-2y=4,2', '3x+y=-4|x-y=2', '4x+2y=9|-4x+3y=6'];

it('elimination-cards se rend pour chaque jumla, sur l’étape « cartes »', () => {
  for (const system of SYSTEMS) {
    const html = renderToString(<EliminationCards system={system} />);
    expect(html, system).toContain('data-elimination-cards');
    expect(html).toContain('data-stage="cards"');
    expect(html).toContain('data-method=""');
    expect(html).toContain('data-eq-card="1"');
    expect(html).toContain('data-eq-card="2"');
    expect(html).toContain('data-eq-tile="x"');
    expect(html).toContain('data-eq-tile="y"');
    expect(html).toContain('data-eq-tile="c"');
    expect(html).toContain('data-scale-handle="1"');
    expect(html).toContain('data-drag-source="card:1"');
    expect(html).toContain('data-drag-source="iso:1:x"');
    expect(html).toContain('data-drop-zone="tile:2:y"');
    expect(html).toContain('data-drop-zone="tray"');
    expect(html).toContain('data-deco');
    expect(shownText(html)).not.toMatch(/manipulation\./);
    expect(html).not.toMatch(/manipulation\.eliminationCards\./);
  }
});

it('les nombres décimaux du manuel restent décimaux (4,2), et les tuiles négatives sont marquées', () => {
  const html = renderToString(<EliminationCards system="2x+y=7|3x-2y=4,2" />);
  expect(html).toContain('4,2');
  expect(html).toContain('data-negative="true"');
});

it('elimination-cards se rend dans un workspace à deux niveaux, ouvert sur متقدم (نشاط 2)', () => {
  const html = renderToString(
    <ManipulationWorkspace
      defaultLevel="advanced"
      levels={{
        beginner: () => <EliminationCards level="beginner" system="x+y=10|x-y=2" />,
        advanced: () => <EliminationCards level="advanced" system="2x+y=7|3x-2y=4,2" title="نشاط 2" />,
      }}
    />,
  );
  expect(html).toContain('data-system="2x+y=7|3x-2y=4,2"');
  expect(html).toContain('data-system="x+y=10|x-y=2"');
  expect(shownText(html)).not.toMatch(/manipulation\./);
});

/* ── questions pendant le labo (LabCheckpoint) ── */
import { describe } from 'vitest';
import i18n from '../../../../i18n';
import { chainOf, QUESTIONS } from './EliminationCards';
import * as E from '../logic/eliminationCards';

const RAW = /manipulation\.[a-zA-Z]/;
const kk = (key, o) => i18n.t(`lesson:manipulation.eliminationCards.${key}`, o);

function finish(lab) {
  let s = lab;
  for (let guard = 0; guard < 8 && s.stage === 'one'; guard += 1) s = E.solveStep(s);
  return E.backSubstitute(s, 1);
}
function bySub(lab) {
  const v = E.canIsolate(lab, 1, 'y') === true ? 'y' : 'x';
  let s = E.isolateFrom(lab, 1, v);
  s = E.substituteInto(s, 2);
  return finish(s);
}
function byAdd(lab) {
  let s = lab;
  const ks = [1, 2, 3, 4, 5, 6, -1, -2, -3, -4, -5, -6];
  for (const k1 of ks) for (const k2 of ks) {
    const t = E.setScale(E.setScale(lab, 1, k1), 2, k2);
    if (E.canStack(t, 1, 2) === true) return finish(E.stack(t, 1, 2));
  }
  return s;
}

describe('elimination-cards — questions pendant le labo (LabCheckpoint)', () => {
  for (const system of ['x+y=10|x-y=2', '2x+y=7|3x-2y=4,2', '3x+y=-4|x-y=2', '4x+2y=9|-4x+3y=6']) {
    it(`${system} : chaque question a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{`, () => {
      const first = bySub(E.init(system));
      expect(first.stage).toBe('done');
      const second = byAdd(E.restart(first));
      expect(E.discoveryReady(second)).toBe(true);
      const check = (lab, chain) => {
        for (const qid of chain) {
          const q = QUESTIONS[qid](lab, kk);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${system}.${qid}`).not.toMatch(RAW);
          expect(out, `${system}.${qid}`).not.toContain('{{');
          expect(q.hints, `${system}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${system}.${qid}`).toHaveLength(1);
          else expect(q.expected, `${system}.${qid}`).toBeTruthy();
        }
      };
      expect(chainOf(first)).toEqual(['found', 'other', 'pair']);
      expect(chainOf(second)).toEqual(['sumValue', 'found', 'other', 'pair', 'rule']);
      check(first, chainOf(first));
      check(second, chainOf(second));
    });
  }
  it('les nombres viennent de la jumla de l’élève : (2,6 ; 1,8)', () => {
    const lab = E.restart(bySub(E.init('2x+y=7|3x-2y=4,2')));
    const done = byAdd(lab);
    expect(QUESTIONS.found(done, kk).expected).toBe('2,6');
    expect(QUESTIONS.other(done, kk).expected).toBe('1,8');
    expect(QUESTIONS.sumValue(done, kk).expected).toBe('18,2');
  });
});

describe('elimination-cards — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('avec questions : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<EliminationCards system="x+y=10|x-y=2" />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(g).toContain('data-ec-step');
    const off = renderToString(<EliminationCards system="x+y=10|x-y=2" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
