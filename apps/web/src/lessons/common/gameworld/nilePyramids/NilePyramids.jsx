/**
 * The pyramids world on screen — what this world gives the kit's shell (`kit/LessonWorld.jsx` lists every field): its HUD (the
 * instruction that stays, the rope's knots, the fact of what the world built), the field register, the card of
 * the ONE order (one typed box with its printed unit, `WORLD_TEXT.unit`), and the kit's rail between two docks. It
 * names no lesson.
 *
 * Hooks for the walks: `data-np-stage`, `data-np-rope=<knots>`, `data-np-drop`, `data-np-sight` (the sight line of
 * stage 3), `data-np-register` (rows: `data-np-row=<id>`), `data-np-order=<canal|course|mark|ferry|capstone>` (+
 * `data-np-predict` on the canal's card), `data-np-order-in` (or `data-np-order-n` / `data-np-order-d` for the
 * capstone's k), `data-np-order-send`, `data-np-order-later`, `data-np-refused=<why>`, `data-np-fact=<fact>`,
 * `data-np-quarry`, `data-np-top=<on|off>` (the top view's toggle; `data-np-top-back` while it is on), `data-np-mission` / `data-np-box` (the cards: `data-np-card-check`, `data-np-card-later`,
 * `data-np-card-fact`), `data-np-look`, `data-np-look-back`; the forge's are the kit's (`data-rf-*`, `data-iq-*`), the
 * rail's too (`data-gr-*`).
 */
import { useMemo, useState } from 'react';
import GeoFigure from '../../components/GeoFigure';
import RuleForge, { UseLines } from '../kit/RuleForge';
import { boxesOf } from '../kit/authoring/forgeBlocks';
import { FORGE_PARTS } from './forgeParts';
import GateRunHud from '../kit/GateRunHud';
import LessonWorld from '../kit/LessonWorld';
import MathText from '../../components/MathText';
import { Card, M } from '../kit/parts';
import { sheetFigure } from '../kit/sheetFigure';
import { Instruction, Recall } from '../kit/Instruction';
import { NilePyramidsGame, devHandles } from './Game';
import { stageRoute } from './logic';
import { WORLD_TEXT, withStory } from './strings';
import './nilePyramids.css';

/** A number in LaTeX: « 77{,}5 », a fraction over a real bar (defects D41). */
const texOf = (n) => {
  const [a, b] = String(n).split('/');
  const one = (x) => x.replace(',', '{,}');
  return b == null ? one(a) : `\\dfrac{${one(a)}}{${one(b)}}`;
};

/** The rope in his hand: its knots, written beside it, and the way to let it go whenever he wants (defects D26). */
export function RopeChip({ rope, game }) {
  const T = game.T.hud;
  return (
    <div className="np-rope" data-np-rope={rope.knots} data-di-clear>
      {rope.ghost ? (
        <span className="np-rope__cell">
          <small>{game.T.stage.hud.triangle}</small>
        </span>
      ) : (
        <span className="np-rope__cell">
          <small>{T.rope}</small>
          <b dir="ltr">{rope.knots}</b>
          <small>{game.T.unit}</small>
        </span>
      )}
      <button type="button" className="np-rope__drop" onClick={() => game.drop()} data-np-drop>
        <kbd>E</kbd>
        {T.drop}
      </button>
    </div>
  );
}

/** What the world built from his number: a FACT, in the colour of that fact (amber a gap, violet an overhang). */
const TONE = {
  as: 'ok',
  fits: 'ok',
  ties: 'ok',
  sits: 'ok',
  apex: 'ok',
  meet: 'ok',
  longer: 'gap',
  gap: 'gap',
  short: 'gap',
  small: 'gap',
  below: 'gap',
  shorter: 'over',
  overhang: 'over',
  slack: 'over',
  big: 'over',
  above: 'over',
};
/** The sentence of a fact: the world's words for it (a `mark` speaks of the row at HIS mark). */
function factText(verdict, game) {
  const S = game.T.stage.fact;
  if (verdict.kind === 'meet') return S.meet;
  if (verdict.kind === 'mark')
    return verdict.fact === 'fits' ? S.markFits : verdict.fact === 'gap' ? S.markGap : S.markOver;
  if (verdict.kind === 'capstone') return S[verdict.fact];
  return game.T.fact[verdict.fact];
}

export function Fact({ verdict, game }) {
  const T = game.T;
  return (
    <div className={`di-verdict np-fact np-fact--${TONE[verdict.fact]}`} data-np-fact={verdict.fact} data-di-clear>
      <p className="np-fact__line">
        {verdict.kind === 'meet' ? null : verdict.kind === 'canal' ? (
          <>
            <span>
              {T.hud.typed} <M>{`${verdict.seg} = ${texOf(verdict.typed)}`}</M>
            </span>
            <span>
              {T.hud.reads} <M>{`${verdict.seg} = ${texOf(verdict.reading)}`}</M>
            </span>
          </>
        ) : (
          <span>
            {T.hud.typed} <M>{`${verdict.seg} = ${texOf(verdict.typed)}`}</M>
          </span>
        )}
      </p>
      <p className="np-fact__what">
        <MathText>{factText(verdict, game)}</MathText>
      </p>
      {verdict.quarry && (
        <p className="np-fact__quarry" data-np-quarry={verdict.quarry}>
          {T.stage.fact.quarry(verdict.quarry)}
        </p>
      )}
    </div>
  );
}

function Hud({ s, game }) {
  return (
    <div
      className="np-hud"
      data-np-stage={s.at}
      data-np-look={s.look ?? undefined}
      {...(s.sight ? { 'data-np-sight': '' } : {})}
    >
      {s.objective && !s.look && (
        <Instruction key={s.objective} text={s.objective} compact={Boolean(s.rope || s.verdict || s.top)} />
      )}
      {s.rope && <RopeChip rope={s.rope} game={game} />}
      {!s.rope && !s.top && s.verdict && <Fact verdict={s.verdict} game={game} />}
      {s.look && (
        <button
          type="button"
          className="di-btn di-btn--primary np-back"
          onClick={() => game.endLook()}
          data-np-look-back
        >
          {game.T.hud.back}
        </button>
      )}
    </div>
  );
}

/**
 * The top view: the camera over the whole stage, looking down; pressed again, back behind Zero (`Game.toggleTop`).
 * Shown in play (never on the river run nor inside a forge or a card — the shell's `Under` slot).
 */
export function TopButton({ on, game }) {
  const T = game.T.hud;
  return (
    <button
      type="button"
      className={`di-btn np-top ${on ? 'is-on' : ''}`}
      aria-pressed={on}
      onClick={() => game.toggleTop()}
      data-np-top={on ? 'on' : 'off'}
      {...(on ? { 'data-np-top-back': '' } : {})}
    >
      {on ? T.topBack : T.top}
    </button>
  );
}

/** The field register: the record he was given, then what HE measured and typed. */
export function Register({ reg }) {
  return (
    <aside className="np-register" data-np-register={reg.rows.length}>
      <h3>{reg.title}</h3>
      <ul>
        {reg.rows.map((r) => (
          <li key={r.id} className={`is-${r.kind}`} data-np-row={r.id}>
            <M>{r.tex}</M>
            {!r.noUnit && <small>{WORLD_TEXT.unit}</small>}
            {r.by && <small className="np-register__by">{r.by}</small>}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** What a box keeps: digits and ONE comma (a point typed is read as the comma). */
const decimal = (v) => {
  const [a, ...rest] = v
    .replace('.', ',')
    .replace(/[^0-9,]/g, '')
    .split(',');
  return rest.length ? `${a},${rest.join('')}` : a;
};

/**
 * THE ONE ORDER's card: one number with its printed unit — or, for the capstone (« every length × [ ] »), one number
 * written as a fraction over a real bar.
 */
export function OrderCard({ o, game }) {
  const T = game.T.order;
  const C = T[o.kind] ?? game.T.stage.order[o.kind];
  const frac = o.kind === 'capstone';
  const [text, setText] = useState('');
  const [d, setD] = useState('');
  const value = frac ? (d ? `${text}/${d}` : text) : text;
  const send = () => game.sendOrder(value);
  const seg = C.seg ?? o.seg;
  return (
    <Card>
      <div data-np-order={o.kind} {...(o.kind === 'canal' ? { 'data-np-predict': '' } : {})}>
        <p className="di-card__eyebrow">{C.title}</p>
        <h2 className="np-order__ask">
          <MathText>{o.kind === 'mark' ? C.ask(o.row) : C.ask(o.seg)}</MathText>
        </h2>
        <div className="np-order__line" dir="ltr">
          {frac ? (
            <>
              <M>{'k ='}</M>
              <span className="np-order__frac">
                <input
                  className="di-num"
                  inputMode="numeric"
                  autoFocus
                  value={text}
                  onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  aria-label="k"
                  data-np-order-n
                />
                <i aria-hidden="true" />
                <input
                  className="di-num"
                  inputMode="numeric"
                  value={d}
                  onChange={(e) => setD(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  onKeyDown={(e) => e.key === 'Enter' && text && send()}
                  aria-label="k"
                  data-np-order-d
                />
              </span>
            </>
          ) : (
            <>
              <M>{`${seg} =`}</M>
              <input
                className="di-num np-order__in"
                dir="ltr"
                inputMode="decimal"
                autoFocus
                value={text}
                style={{ width: '7ch' }}
                onChange={(e) => setText(decimal(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && text && send()}
                data-np-order-in
              />
              <span className="np-order__unit">{game.T.unit}</span>
            </>
          )}
        </div>
        {o.refused && (
          <p className="np-order__refused" data-np-refused={o.refused}>
            {T.refused[o.refused]}
          </p>
        )}
        <div className="np-order__go">
          <button type="button" className="di-btn di-btn--primary" disabled={!text} onClick={send} data-np-order-send>
            {C.send}
          </button>
          <button type="button" className="di-btn" onClick={() => game.closeOrder()} data-np-order-later>
            {T.later}
          </button>
        </div>
      </div>
    </Card>
  );
}

/**
 * THE MISSION CARD (`story.mission`) and THE BOX AT NOON (`story.box`): a written problem in the kit's `UseLines`, beside
 * a schematic figure (GeoFigure, not to scale — and it says so, gate F4). « check » makes the world act; a line that does
 * not hold yet is answered with a FACT.
 */
export function StoryCard({ kind, game }) {
  const m = kind === 'mission' ? game.story.mission : game.story.box;
  const C = game.T.stage.card;
  const lines = useMemo(() => m.lines(), [m]);
  const [vals, setVals] = useState({});
  const [fact, setFact] = useState(null);
  const names = lines.flatMap((l) => boxesOf(l.tokens).map((t) => t.slot ?? t.choice));
  const filled = names.every((n) => (vals[n] ?? '') !== '');
  const check = () => {
    if (kind === 'mission') game.checkMission(vals);
    else setFact(game.checkBox(vals));
  };
  return (
    <Card wide>
      <div className="np-card" {...{ [`data-np-${kind}`]: '' }}>
        <p className="di-card__eyebrow">{m.title}</p>
        <div className="np-card__cols">
          {m.figure && (
            // never narrower than its 12 px floor when the card shrinks to fit (`sheetFigure` k × --di-min-font)
            <div className="np-card__fig" style={{ '--np-fig-k': sheetFigure(m.figure)?.k ?? 0 }}>
              <GeoFigure {...m.figure} caption={C.notToScale} maxWidth="100%" />
            </div>
          )}
          <div className="np-card__text">
            {(m.lead ?? []).map((l) => (
              <p key={l} className="np-card__lead">
                <MathText>{l}</MathText>
              </p>
            ))}
            <div className="np-card__lines">
              <UseLines
                lines={lines}
                vals={vals}
                onType={(name, value) => {
                  setVals({ ...vals, [name]: value });
                  setFact(null);
                }}
              />
            </div>
            {fact && (
              <p className="np-card__fact" data-np-card-fact>
                <MathText>{fact}</MathText>
              </p>
            )}
          </div>
        </div>
        <div className="np-order__go">
          <button
            type="button"
            className="di-btn di-btn--primary"
            disabled={!filled}
            onClick={check}
            data-np-card-check
          >
            {C.check}
          </button>
          <button type="button" className="di-btn" onClick={() => game.closeCard()} data-np-card-later>
            {C.later}
          </button>
        </div>
      </div>
    </Card>
  );
}

const WORLD = {
  id: 'nile-pyramids',
  Game: NilePyramidsGame,
  devHandles,
  playing: (s) =>
    s.phase === 'play' || s.phase === 'dialog' || s.phase === 'build' || s.phase === 'look' || s.phase === 'fly',
  busy: (s) => s.phase === 'build' || s.phase === 'sail' || s.phase === 'fly' || s.phase === 'climb',
  /** Zero's bubble is not drawn while the top view is open: it printed over the plateau's lengths (the walk, 2026-11-24). */
  quiet: (s) => Boolean(s.top),
  held: (s) => (s.rope ? WORLD_TEXT.held(s.rope.knots) : null),
  Hud,
  Under: ({ s, game }) =>
    !s.overlay && (s.phase === 'play' || s.phase === 'build') ? (
      <>
        {s.register && <Register reg={s.register} />}
        {!s.run && <TopButton on={Boolean(s.top)} game={game} />}
        <Recall lines={s.recall} title={WORLD_TEXT.recall.title} />
      </>
    ) : null,
  /** The course of gates draws over everything while it is run (`kit/GateRunHud.jsx`). */
  Over: ({ s, game }) =>
    s.run && game.runContent ? <GateRunHud run={s.run} game={game} content={game.runContent} /> : null,
  overlay(o, s, game) {
    if (o.type === 'order') return <OrderCard key={o.id} o={o} game={game} />;
    if (o.type === 'mission' || o.type === 'box') return <StoryCard key={o.type} kind={o.type} game={game} />;
    if (o.type === 'forge')
      return (
        <RuleForge
          key={o.key}
          forge={game.lesson.forges[o.key]}
          parts={FORGE_PARTS}
          game={game}
          log={o.log}
          onSeal={(record) => game.sealRule(o.key, record)}
        />
      );
    return null;
  },
};

/** What the shell needs to know of the STORY being played: its docks (the five, or `story.stages`), three stars each, its title and its end. */
function worldOf(lesson) {
  const T = withStory(WORLD_TEXT, lesson.story?.text ?? {});
  const docks = stageRoute(lesson.story?.stages).length;
  return {
    ...WORLD,
    stages: docks,
    maxStars: docks * 3,
    text: { title: T.title, subtitle: T.subtitle, turn: T.turn.body, end: T.end },
  };
}

export default function NilePyramids({ lesson, ...props }) {
  const world = useMemo(() => worldOf(lesson), [lesson]);
  return <LessonWorld world={world} lesson={lesson} {...props} />;
}
