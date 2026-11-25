/**
 * THE GATE RUN ON SCREEN (`kit/GateRun.js` plays it; it names no world and no lesson): the run's card before the start
 * and at the end, then — while he runs — his hearts, his score, the order on its white card, the three numbers of the
 * gate ahead (placed over the 3D arches by the engine, every frame), the two round arrows for a mouse or a finger, and
 * the FACT of a gate that was not the right one. A world draws it over everything while `state.run` is set:
 *
 *   <GateRunHud run={s.run} game={game} content={lesson.run} />
 *
 * `game` answers `startRun()`, `leaveRun()`, `pauseRun(on)`, `runLane(d)` and holds the engine as `game.gateRun`.
 * A gate's `why` is drawn by MathText: a fraction in it is written `$\\dfrac{p}{q}$`, never « p/q ».
 * A world that sails with a `skin` (`GateRun` options) gets `gr-run--<skin>` and `data-gr-skin`: on the river the numbers
 * are tags over the buoys. With `hazards`: `data-gr-hazard` is the lane of the obstacle ahead ('' once passed) and
 * `data-gr-bumps` the obstacles touched; a touch shakes the hearts (and shows `text.bump` when the lesson gives one).
 * A round that names points carries `figure` (a GeoFigure spec, `state.run.figure`): it is drawn by the practice space's
 * own `components/StatementFigure.jsx` in its light panel `data-gr-figure`, on the inline-start side under the order (the
 * RIGHT in Arabic, the left in French; `data-gr-has-figure` holds the fact card narrower beside it), while the order is up (`go`, `paused`) and beside the fact (`hit`) — at its
 * 12 px floor (`trainerFigure.js › runFigure`).
 * `content.text` is the lesson's: { title, say, rule, start, again, leave, order, gate, of, pause, resume, quit, won: { title, text }, lost: { title, text } }.
 */
import { ArrowLeft, ArrowRight, Flame, Heart, Pause, Play, Star, Trophy, X, Zap } from 'lucide-react';
import MathText from '../../components/MathText';
import StatementFigure from '../../components/StatementFigure';
import { M } from './parts';
import { RUN_FIGURE, runFigure } from './trainerFigure';
import './styles/gateRun.css';

const Option = ({ o }) => (o.tex ? <M>{o.tex}</M> : <span dir="ltr">{o.t}</span>);

/** The figure of the round, in its own panel: its width from `runFigure` (never under its 12 px floor), plus its padding. */
function RunFigure({ fig }) {
  const f = runFigure(fig);
  if (!f) return null;
  return (
    <div
      className="gr-figure"
      data-gr-figure
      style={{ width: `${f.width + 2 * RUN_FIGURE.pad}px`, padding: `${RUN_FIGURE.pad}px` }}
    >
      <StatementFigure {...fig} maxWidth="100%" />
    </div>
  );
}

export default function GateRunHud({ run: r, game, content }) {
  const T = content.text;
  const Leave = () => (
    <button type="button" className="gr-door" data-gr-leave onClick={() => game.leaveRun()}>
      {T.leave}
    </button>
  );
  if (r.stage === 'ready')
    return (
      <section className="gr-run gr-run--card" data-gr-run="ready">
        <div className="gr-card">
          <Zap size={56} aria-hidden="true" />
          <h2>{T.title}</h2>
          <p>{T.say}</p>
          <p>{T.rule}</p>
          <button type="button" className="gr-btn" data-gr-start onClick={() => game.startRun()}>
            <Play size={20} aria-hidden="true" /> {T.start}
          </button>
          <Leave />
        </div>
      </section>
    );
  if (r.stage === 'over') {
    const end = r.won ? T.won : T.lost;
    return (
      <section className="gr-run gr-run--card" data-gr-run="over" data-gr-won={r.won ? '1' : '0'}>
        <div className="gr-card">
          <Trophy size={64} aria-hidden="true" />
          <h2>{end.title}</h2>
          <p className="gr-card__score" data-gr-score={r.score}>
            {r.total != null ? `${r.score} ${T.of} ${r.total}` : r.score}
          </p>
          <p>{end.text}</p>
          {r.won ? (
            <button type="button" className="gr-btn" data-gr-leave onClick={() => game.leaveRun()}>
              {T.leave}
            </button>
          ) : (
            <>
              <button type="button" className="gr-btn" data-gr-start onClick={() => game.startRun()}>
                <Play size={20} aria-hidden="true" /> {T.again}
              </button>
              <Leave />
            </>
          )}
        </div>
      </section>
    );
  }
  const paused = r.stage === 'paused';
  const skin = game.gateRun?.o?.skin?.name;
  const hazards = r.bumps != null;
  return (
    <section
      className={skin ? `gr-run gr-run--${skin}` : 'gr-run'}
      data-gr-run={r.stage}
      data-gr-round={r.n}
      data-gr-lane={r.lane}
      data-gr-skin={skin}
      data-gr-hazard={hazards ? (r.hazard ?? '') : undefined}
      data-gr-bumps={hazards ? r.bumps : undefined}
      data-gr-has-figure={r.figure ? '' : undefined}
    >
      <div className="di-dash" data-di-dash="gate-run">
        <div className="di-dash__meta">
          <span
            className={r.bumps ? 'di-dash__hearts gr-hearts--bump' : 'di-dash__hearts'}
            data-gr-hearts={r.hearts}
            key={`h${r.bumps ?? 0}`}
          >
            {[0, 1, 2].map((k) => (
              <Heart key={k} size={22} className={k < r.hearts ? 'is-on' : ''} fill="currentColor" aria-hidden="true" />
            ))}
          </span>
          <span className="di-dash__score" data-gr-score={r.score}>
            <Star size={18} className="di-ic-star" aria-hidden="true" /> <b dir="ltr">{r.score}</b>
          </span>
          {r.streak >= 3 && (
            <span className="di-dash__streak" key={r.streak}>
              <Flame size={18} aria-hidden="true" /> <b dir="ltr">{r.streak}</b>
            </span>
          )}
          {r.total != null ? (
            <span data-gr-progress={r.n}>
              {T.gate} <b>{r.n}</b> {T.of} <b>{r.total}</b>
            </span>
          ) : (
            <span data-gr-level={r.level}>{r.levelName}</span>
          )}
          <button type="button" className="gr-quit" data-gr-pause onClick={() => game.pauseRun(!paused)}>
            {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
            {paused ? T.resume : T.pause}
          </button>
          <button type="button" className="gr-quit" data-gr-leave onClick={() => game.leaveRun()}>
            <X size={18} aria-hidden="true" /> {T.quit}
          </button>
        </div>
        {(r.stage === 'go' || paused) && (
          <div className="di-dash__say" key={r.n} data-gr-ask>
            <small>{T.order}</small>
            <strong>
              {r.ask}{' '}
              {r.tex && (
                <span className="gr-tex" dir="ltr">
                  <M>{r.tex}</M>
                </span>
              )}
            </strong>
          </div>
        )}
        {r.stage === 'hit' && (
          <div className="di-dash__say gr-why" data-gr-why>
            <small>
              {r.ask}{' '}
              {r.tex && (
                <span className="gr-tex" dir="ltr">
                  <M>{r.tex}</M>
                </span>
              )}
            </small>
            {/* a fact may write a fraction over a real bar (`$\\dfrac{4}{7}$`): a fact without `$` reads as before */}
            <strong>
              <MathText>{r.why}</MathText>
            </strong>
          </div>
        )}
      </div>
      {r.figure && (r.stage === 'go' || paused || r.stage === 'hit') && <RunFigure fig={r.figure} />}
      {r.options.map((o, lane) => (
        <b
          key={`${r.n}-${lane}`}
          ref={(el) => {
            game.gateRun.els[lane] = el;
          }}
          className={`gr-gate ${r.stage === 'hit' && lane === r.right ? 'is-right' : ''} ${r.stage === 'hit' && lane === r.picked ? 'is-other' : ''}`}
          data-gr-gate={lane}
          style={{ visibility: 'hidden' }}
        >
          <Option o={o} />
        </b>
      ))}
      {r.bumps > 0 && T.bump && r.stage === 'go' && (
        <div className="gr-bump" key={`b${r.bumps}`} data-gr-bump={r.bumps}>
          {T.bump}
        </div>
      )}
      {paused && (
        <div className="gr-paused" data-gr-paused>
          <div className="gr-card">
            <Pause size={52} aria-hidden="true" />
            <h2>{T.pausedTitle}</h2>
            <p>{T.pausedText}</p>
            <button type="button" className="gr-btn" data-gr-resume onClick={() => game.pauseRun(false)}>
              <Play size={20} aria-hidden="true" /> {T.resume}
            </button>
            <Leave />
          </div>
        </div>
      )}
      <div className="di-lanes" dir="ltr">
        <button
          type="button"
          aria-label={T.left}
          data-gr-left
          onPointerDown={(e) => (e.preventDefault(), game.runLane(-1))}
        >
          <ArrowLeft size={30} />
        </button>
        <button
          type="button"
          aria-label={T.right}
          data-gr-right
          onPointerDown={(e) => (e.preventDefault(), game.runLane(1))}
        >
          <ArrowRight size={30} />
        </button>
      </div>
    </section>
  );
}
