import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import RouteCompare from './RouteCompare';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import * as L from '../logic/routeCompare';

/**
 * route-compare se rend aux deux niveaux de levels.js (le rallye du Sahara ; le cross des Sablettes de la وضعية), seul et
 * dans un workspace, sans clé i18n brute, sans interpolation oubliée, et sans aucune longueur écrite avant la construction.
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('route-compare — rendu', () => {
  it('advanced (وضعية) : le cross, le pari d’abord, les deux montres à zéro — la réponse nulle part', () => {
    const html = renderToString(<RouteCompare theme="cross" {...LEVELS['route-compare'].advanced.numbers} />);
    expect(html).toContain('data-route-compare');
    expect(html).toContain('data-world="cross"');
    expect(html).toContain('data-stage="bet"');
    expect(html).toContain('data-rc-glance');
    expect(html).toContain('data-rc-bet="1"');
    expect(html).toContain('data-rc-bet="2"');
    expect(html).toContain('data-rc-watch="1"');
    expect(html).toContain('data-deco="cross"');
    expect(html).not.toContain('data-rc-pin');
    for (const leak of ['9,42', '9{,}42', '9,96', '9{,}96', '3\\pi', '\\sqrt{13}']) expect(html).not.toContain(leak);
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('beginner : le rallye, les balises', () => {
    const html = renderToString(<RouteCompare theme="rally" level="beginner" {...LEVELS['route-compare'].beginner.numbers} />);
    expect(html).toContain('data-world="rally"');
    expect(html).toContain('data-deco="rally"');
    expect(html).not.toContain('8,28');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('numbers groupés (contrat de la leçon) et workspace : deux niveaux montés, des ids SVG distincts', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <RouteCompare level="beginner" theme="rally" numbers={LEVELS['route-compare'].beginner.numbers} />,
        advanced: () => <RouteCompare level="advanced" theme="cross" numbers={LEVELS['route-compare'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-route-compare="true"/g) ?? []).length).toBe(2);
    const ids = [...html.matchAll(/ id="(rc[A-Za-z]+[^"]*)"/g)].map((m) => m[1]);
    expect(ids.length).toBe(2);
    expect(new Set(ids).size).toBe(2);
    expect(html).not.toMatch(RAW);
  });
});

const { beginner, advanced } = LEVELS['route-compare'];
const k = (key, o) => i18n.t(`lesson:manipulation.routeCompare.${key}`, o);
/** Construit tout : le pari, puis chaque morceau (la balise suivante, ou le centre du demi-cercle). */
const buildAll = (s0) => {
  let s = L.placeBet(s0, 0);
  for (let guard = 0; guard < 40 && !L.allDone(s); guard += 1) {
    const piece = L.nextPiece(s);
    const P = piece.kind === 'arc' ? piece.centre : piece.to;
    s = L.placePin(s, { x: P.x, y: P.y });
  }
  return s;
};

describe('route-compare — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque parcours de chaque niveau : texte, deux indices, une seule bonne réponse, ni clé brute ni {{', async () => {
    const { chainOf, QUESTIONS } = await import('./RouteCompare');
    for (const lv of [beginner, advanced]) {
      const s = buildAll(L.init(lv.numbers));
      expect(L.allDone(s)).toBe(true);
      for (const i of [0, 1]) {
        const chain = chainOf(s, i);
        expect(chain.length).toBeGreaterThanOrEqual(2);
        expect(chain.at(-1)).toBe('rule');
        for (const qid of chain) {
          const q = QUESTIONS[qid](s, i, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((x, j) => <span key={j}>{x.text}{x.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${i}.${qid}`).not.toMatch(RAW);
          expect(out, `${i}.${qid}`).not.toContain('{{');
          expect(q.hints, `${i}.${qid}`).toHaveLength(2);
          expect(q.options.filter((x) => x.correct), `${i}.${qid}`).toHaveLength(1);
          expect(q.options.filter((x) => !x.correct).every((x) => x.why), `${i}.${qid} why`).toBe(true);
        }
      }
    }
    // un parcours seul fini : la suite s'arrête à la longueur du parcours (pas encore de comparaison)
    let t = L.placeBet(L.init(beginner.numbers), 0);
    for (let g = 0; g < 10 && !L.isComplete(t, 0); g += 1) { const pc = L.nextPiece(t); const P = pc.kind === 'arc' ? pc.centre : pc.to; t = L.placePin(t, { x: P.x, y: P.y }); }
    expect(chainOf(t, 0)).toEqual(['pieceLen', 'routeSum']);
  });

  it('mode guidé : ni la progression ni le bouton d’indice, mais les étapes ; « أعِد التجربة » reconstruit le parcours', () => {
    const html = renderToString(<RouteCompare {...beginner.numbers} level="beginner" />);
    expect(html).not.toContain('data-manipulation-progress');
    expect(html).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(html).toContain('data-lab-stepper');
    let t = L.placeBet(L.init(beginner.numbers), 0);
    for (let g = 0; g < 10 && !L.isComplete(t, 0); g += 1) { const pc = L.nextPiece(t); const P = pc.kind === 'arc' ? pc.centre : pc.to; t = L.placePin(t, { x: P.x, y: P.y }); }
    const r = L.retryRoute(t, 0);
    expect(r.built[0]).toBe(0);
    expect(r.bet).toBe(0);
    expect(r.trials.length).toBe(t.trials.length);
  });
});
