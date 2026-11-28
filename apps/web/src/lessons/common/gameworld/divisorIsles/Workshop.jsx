/**
 * The WORKSHOP of an island of « L’archipel des diviseurs » (`Game.actAnvil` opens it; the segment declares
 * `workshop: { min, max, open?, typed?, bench? }` — GAME_WORLD.md §2ter-1 « A WORKSHOP »).
 *
 *   the stepper (no `typed`)   − / + between `min` and `max`, then « make » — the pilot's stubborn island
 *   the typed form (`typed`)   he TYPES the length in its own shape (a box and the printed unit); a length outside
 *                              `min` … `max` (each one bounded by 1 … the longest gap), or an empty box, is answered by
 *                              a sentence
 *   the bench (`bench`)        an inquiry spec played by the world's `Inquiry` in a frame of its own (the forge's), with a
 *                              way back to the workshop; what he did there is kept on the game (`Game.benchKept`) and
 *                              shown again when he reopens it. It gives facts; it never says which plank to make.
 *                              When it kept a state and the lesson writes `bench.text.kept(state)` (lines, at most 4),
 *                              the typed form shows those lines in a card under the length box (`data-di-bench-kept`).
 *
 * Words: `T.workshop` (`strings.js`, a story may override them). Hooks: `data-di-workshop`, `data-di-minus`,
 * `data-di-plus`, `data-di-in="plank"`, `data-di-craft`, `data-di-gaps`, `data-di-workshop-error`, `data-di-bench-open`,
 * `data-di-bench`, `data-di-bench-back` (and the ✕ `data-di-exit`, which keeps the bench as it is).
 */
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, NotebookPen } from 'lucide-react';
import { Card, ExitLink, Num, SoundToggle } from '../kit/parts';
import { isShortScreen } from '../engine/phoneScreen';
import MathText from '../../components/MathText';
import Inquiry from './Inquiry';
import { sheetFrom } from './sheet';
import '../kit/ruleForge.css';

/** The gaps the plank must build: the overlay's `gaps` (the whole convoy), or its one gap. */
const gapsOf = (o) => (o.gaps?.length ? o.gaps : [o.a]);

/**
 * What the typed box holds, judged: null when it is a length he can make, else the sentence that answers it
 * (`W` = `T.workshop`). The lengths he can make: from the workshop's `min` (at least 1) to its `max` (at most the
 * longest gap) — `limits` = the overlay's `{ min, max }`; without them, 1 … the longest gap. Below a `min` of more than
 * 1: `W.tooShortOf(min)`; past a `max` shorter than the longest gap: `W.tooLong(b, max, n, true)` (the workshop's own
 * limit, not the gap's).
 */
export function plankRefusal(text, gaps, W, limits = {}) {
  if (text === '' || text == null) return W.empty;
  const b = Number(text);
  const longest = Math.max(...gaps);
  const min = Number.isInteger(limits.min) && limits.min > 1 ? limits.min : 1;
  const max = Number.isInteger(limits.max) && limits.max >= min ? Math.min(limits.max, longest) : longest;
  if (!Number.isInteger(b) || b < 1) return W.tooShort;
  if (b < min) return W.tooShortOf(min);
  if (b > max) return W.tooLong(b, max, gaps.length, max < longest);
  return null;
}

function BenchButton({ o, game }) {
  if (!o.bench) return null;
  const kept = game.benchKept?.(o.seg);
  return (
    <button
      type="button"
      className="di-btn di-bench-open"
      onClick={() => game.openBench()}
      data-di-bench-open={kept ? 'kept' : 'new'}
    >
      <NotebookPen size={18} aria-hidden="true" /> {game.T.workshop.bench}
    </button>
  );
}

/** The pilot's stepper — unchanged (its walk clicks − / + and « make »). */
function Stepper({ o, game }) {
  const T = game.T;
  const [b, setB] = useState(1 + Math.floor((o.max - o.min) / 2));
  return (
    <Card>
      <p className="di-card__eyebrow">{T.workshop.title}</p>
      <h2>{T.workshop.ask}</h2>
      <div className="di-stepper" dir="ltr">
        <button type="button" onClick={() => setB((v) => Math.max(o.min, v - 1))} aria-label="−" data-di-minus>
          −
        </button>
        <output>{b}</output>
        <button type="button" onClick={() => setB((v) => Math.min(o.max, v + 1))} aria-label="+" data-di-plus>
          +
        </button>
      </div>
      <div className="di-plankbar" dir="ltr" aria-hidden="true">
        {Array.from({ length: o.max }, (_, i) => (
          <span key={i} className={i < b ? 'is-on' : ''} />
        ))}
      </div>
      <div className="di-row">
        <button type="button" className="di-btn di-btn--primary" onClick={() => game.craft(b)} data-di-craft>
          {T.workshop.make}
        </button>
        <BenchButton o={o} game={game} />
        <button type="button" className="di-link" onClick={() => game.closeOverlay()}>
          {T.workshop.close}
        </button>
      </div>
    </Card>
  );
}

/** A kept bench state read back for its spec, per kind (a kind not listed is taken as kept, as before). */
const KEPT_OF = { sheet: sheetFrom };
/** The most lines the « kept » card holds (a card is four lines at most). */
const KEPT_LINES = 4;

/**
 * What the bench kept, in the lesson's words: the lines of `bench.text.kept(state)` — none when the bench kept nothing,
 * when its state is not one of this bench's (other numbers), when the lesson supplies no `kept`, or when it throws.
 */
export function benchKeptLines(o, game) {
  const kept = o.bench && typeof o.bench.text?.kept === 'function' ? game.benchKept?.(o.seg) : null;
  if (!kept) return [];
  const check = KEPT_OF[o.bench.kind];
  const state = check ? check(o.bench, kept) : kept;
  if (!state) return [];
  try {
    const lines = o.bench.text.kept(state);
    if (!Array.isArray(lines)) return [];
    return lines.filter((l) => typeof l === 'string' && l.trim() !== '').slice(0, KEPT_LINES);
  } catch {
    return [];
  }
}

/** The « kept » card under the length box: what the bench showed him, where he types (at least 18 px, no scroll). */
function BenchKept({ o, game }) {
  const lines = benchKeptLines(o, game);
  if (!lines.length) return null;
  return (
    <div className="di-fact" data-di-bench-kept={lines.length} style={{ margin: '0.5rem 0', padding: '0.4rem 1rem' }}>
      {lines.map((l, i) => (
        <p key={i} style={{ fontSize: '1.15rem', lineHeight: 1.5, margin: '0.1rem 0' }}>
          <MathText>{l}</MathText>
        </p>
      ))}
    </div>
  );
}

/** He types the length: one box with its printed unit; Enter or the button makes the plank. */
function Typed({ o, game }) {
  const W = game.T.workshop;
  const gaps = gapsOf(o);
  const [text, setText] = useState('');
  const [err, setErr] = useState(null);
  const make = (e) => {
    e.preventDefault();
    const why = plankRefusal(text, gaps, W, { min: o.min, max: o.max });
    if (why) setErr(why);
    else game.craft(Number(text));
  };
  return (
    <Card>
      <form onSubmit={make} data-di-workshop="typed">
        <p className="di-card__eyebrow">{W.title}</p>
        <h2>{W.typedAsk}</h2>
        <p className="di-fact" data-di-gaps={gaps.join(',')}>
          {W.forGaps(gaps)}
        </p>
        <div className="di-template">
          <Num
            value={text}
            onChange={(v) => {
              setText(v);
              setErr(null);
            }}
            w={String(Math.max(...gaps)).length}
            autoFocus
            aria-label={W.lengthLabel}
            data-di-in="plank"
          />
          <span>{W.unit}</span>
        </div>
        <BenchKept o={o} game={game} />
        {err && (
          <p className="di-feedback" data-di-workshop-error>
            {err}
          </p>
        )}
        <div className="di-row di-row--wrap">
          <button type="submit" className="di-btn di-btn--primary" data-di-craft>
            {W.make}
          </button>
          <BenchButton o={o} game={game} />
          <button type="button" className="di-link" onClick={() => game.closeOverlay()}>
            {W.close}
          </button>
        </div>
      </form>
    </Card>
  );
}

/** The forge's zoom (designed 1280 × 720, zoomed to the window; a phone keeps one scale) — the lists fit as there. */
function useFrameZoom() {
  const [z, setZ] = useState(1);
  useEffect(() => {
    const fit = () =>
      setZ(
        isShortScreen()
          ? 1
          : Math.max(0.62, Math.min(1.9, Math.min(window.innerWidth / 1280, window.innerHeight / 720))),
      );
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return z;
}

/**
 * The bench: the experiment `o.bench` in the forge's frame, over the workshop. It starts where he left it
 * (`Game.benchKept`); leaving it, or finishing it, takes him back to the workshop and keeps what he did.
 */
function Bench({ o, game }) {
  const W = game.T.workshop;
  const z = useFrameZoom();
  const [kept] = useState(() => game.benchKept?.(o.seg) ?? null);
  const latest = useRef(kept);
  const [spec] = useState(() => ({
    ...o.bench,
    ...(kept ? { from: kept } : {}),
    onState: (s) => {
      latest.current = s;
    },
  }));
  const back = () => game.closeBench(latest.current);
  return (
    <div className="rf-root di-bench" data-rf-skin="isles" data-di-bench={spec.kind}>
      <div className="rf-fit" style={{ zoom: z, '--di-min-font': `${Math.ceil(1200 / z) / 100}px` }}>
        <header className="rf-head">
          <div className="rf-brand">
            <i aria-hidden="true">📓</i>
            <div>
              <h2>{W.bench}</h2>
              <p>{W.benchSub}</p>
            </div>
          </div>
          <div className="rf-head__end">
            <button type="button" className="rf-btn" onClick={back} data-di-bench-back>
              <ArrowRight size={18} aria-hidden="true" /> {W.benchBack}
            </button>
            <SoundToggle game={game} />
            {/* the bench covers the top bar: it draws the ✕ again (B2), and leaving by it keeps what he did there */}
            <span style={{ display: 'contents' }} onClickCapture={() => game.closeBench(latest.current)}>
              <ExitLink />
            </span>
          </div>
        </header>
        <Inquiry spec={spec} game={game} onDone={back} />
      </div>
    </div>
  );
}

/** The workshop overlay: its bench when open, else the typed form or the stepper. */
export default function Workshop({ o, game }) {
  if (o.benchOpen && o.bench) return <Bench o={o} game={game} />;
  return o.typed ? <Typed o={o} game={game} /> : <Stepper o={o} game={game} />;
}
