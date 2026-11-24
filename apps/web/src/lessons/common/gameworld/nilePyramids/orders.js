/**
 * The pyramids world — THE ONE ORDER (PYRAMIDS_WORLD_PLAN §2.1, gate cut 1). Every order is ONE number he types; the world
 * builds one thing from it, and what it built is one of three FACTS. Pure: `order(kind, typed, truth)`.
 *
 *   canal   typed BEFORE the rope reads the canal     as · longer · shorter   (the rope's reading against his number)
 *   course  a course of a length, laid at its level   fits · gap · overhang
 *   mark    where a row already cut belongs (BM)      fits · gap · overhang   (the masons build up to his mark)
 *   ferry   a ferry rope thrown to the far post       ties · short · slack
 *   flight  a height h: Zero rises along the axis     apex · below · above
 *
 * No size of a gap, a shortfall or an overhang is part of a fact (gate P1): the sizes belong to the forge's mirror.
 * A missed order stays in the log; the next try is a new order of his own.
 */
import { typedLength, typedRatio, against, courseAt, write } from './logic';
import { times } from '../kit/exact';

const THREE_FACTS = {
  canal: ['shorter', 'as', 'longer'],
  course: ['gap', 'fits', 'overhang'],
  ferry: ['short', 'ties', 'slack'],
  flight: ['below', 'apex', 'above'],
  capstone: ['small', 'sits', 'big'],
};
export const FACTS = Object.freeze({ ...THREE_FACTS, mark: THREE_FACTS.course });

/** Is this fact the one the world wanted (the course fits, the rope reads as he typed…)? */
export const holds = (fact) =>
  fact === 'as' || fact === 'fits' || fact === 'ties' || fact === 'apex' || fact === 'sits';

/** The largest capstone base the yard can hold (m): a bigger block is written as the quarry's order, never lifted. */
const YARD = '20';

/**
 * The world carries out his number. `truth` is what the world holds: the rope's reading (canal), the level's length
 * (course), `{ face, row }` (mark), the river's width (ferry), the pyramid's height (flight), `{ k, base }` (capstone:
 * « every length × [k] », typed as a fraction or a decimal; the base cut is base × his k).
 * → { kind, typed, fact, built } — or { kind, refused: 'empty' | 'out' } when nothing can be built from it.
 */
export function order(kind, text, truth) {
  if (!FACTS[kind]) throw new Error(`nilePyramids: no order « ${kind} »`);
  if (kind === 'capstone') {
    const k = typedRatio(text);
    if (k == null) return { kind, refused: 'empty' };
    const base = write(times(truth.base, k));
    const fact = FACTS.capstone[against(k, truth.k) + 1];
    return { kind, typed: k, fact, built: { base, quarry: against(base, YARD) > 0 } };
  }
  const typed = typedLength(text);
  if (typed == null) return { kind, refused: 'empty' };
  if (kind === 'mark') {
    const { face, row } = truth;
    // the mark is on the edge, between the corner and the apex
    if (against(typed, face.edge) >= 0) return { kind, refused: 'out' };
    const level = courseAt(face, typed).MN; // the length of the level the masons build up to
    // the row he gave is laid on that level: shorter than the level leaves a gap, longer overhangs
    const c = against(row, level);
    return { kind, typed, fact: FACTS.mark[c + 1], built: { mark: typed, level, row: write(row) } };
  }
  const c = against(typed, truth);
  // a canal's fact speaks of the CANAL: the rope reads longer than he typed when his number is the shorter one
  const fact = kind === 'canal' ? FACTS.canal[1 - c] : FACTS[kind][c + 1];
  return { kind, typed, fact, built: { length: typed } };
}
