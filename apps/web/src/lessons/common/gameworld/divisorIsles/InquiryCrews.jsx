/**
 * THE INVESTIGATION `crews` of this world (see `Inquiry.jsx`, which mounts it; logic and state machines: `crews.js`;
 * drawing: `crewLanes.jsx`). Two modes, dispatched here:
 *
 *   `story`  the story card (words only) → « Traduis »: chips onto « une case, c’est » and the two crews (a wrong chip:
 *            the story's fact, the chip goes back) → the pillar on the story's own ruler (the walkway's panel,
 *            `Chantier.jsx › PillarPanel`) → back to the story: his boxes (integers, or « □ h □ min ») → seen.
 *   `days`   one row per team on the day axis (0 days since the start at the left of each row), the asked rows
 *            outlined: before each run he types the day; « Jour suivant » lights the next column team after team, or
 *            « Avance » runs four days a second (« Pause » stops it); the run stops on the day and writes the fact
 *            beside his prediction — and on each day where every team but one works, naming that one.
 *
 * At 1366 × 768 the stage `pillar` stands in the mirror's frame: once the translation is set its three slots are ONE
 * row, « Reviens à l’histoire » sits beside the panel's buttons, the facts take a wider column (one line a lane), and the
 * lanes are drawn tighter (`crewLanes.jsx › STORY_LANES`).
 *
 * `spec.text` holds every sentence (GAME_WORLD.md « Explore », spec shape of `crews`); this file writes no French. Nothing
 * here states a rule; nothing is drawn as a gear. Pure views (`StoryView`, `DaysView`) of the reducers; `window.__inquiry`.
 */
import { useEffect, useReducer, useState } from 'react';
import MathText from '../../components/MathText';
import { Num } from '../kit/parts';
import { daysNow, daysReducer, daysResult, initDays, initStory, storyReducer, storyResult, cycleOf } from './crews';
import { PillarPanel, useLaying } from './Chantier';
import { DayRows, dayCol, STORY_LANES } from './crewLanes';
import { Head, Found } from './InquiryDivision';
import { expose, FAST } from './inquiryParts';
import './inquiryCrews.css';

const lines = (x) => (Array.isArray(x) ? x : [x]);

// ───────────────────────────── mode `story` ─────────────────────────────

/** The chips of one slot: `unit` (the story's options) or a crew (the story's numbers). */
function Chips({ slot, label, values, chosen, onChip, enabled }) {
  return (
    <div className="iq-crews__slot" data-iq-slot={slot} data-iq-chosen={chosen ?? ''}>
      <span className="iq-crews__ask">{label}</span>
      <span className="iq-chips">
        {chosen != null ? (
          <b className="iq-chip is-on" data-iq-placed={`${slot}:${chosen}`}>
            {chosen}
          </b>
        ) : (
          values.map((v) => (
            <button
              key={String(v)}
              type="button"
              className="iq-chip"
              disabled={!enabled}
              onClick={() => onChip(slot, v)}
              data-iq-chip={`${slot}:${v}`}
            >
              {v}
            </button>
          ))
        )}
      </span>
    </div>
  );
}

/** One question of the story: its label, his box (or the two boxes of a clock time), its unit. */
function AskBox({ T, q, value, ok, onType }) {
  if (q.clock) {
    const v = value ?? {};
    return (
      <label className={`iq-crews__back ${ok ? 'is-ok' : ''}`} data-iq-ask={q.id}>
        <span>{q.label}</span>
        <Num value={v.h ?? ''} onChange={(h) => onType({ ...v, h })} w={2} disabled={ok} data-iq-in={`${q.id}:h`} />
        <span>{T.hour}</span>
        <Num
          value={v.min ?? ''}
          onChange={(min) => onType({ ...v, min })}
          w={2}
          disabled={ok}
          data-iq-in={`${q.id}:min`}
        />
        <span>{T.minute}</span>
      </label>
    );
  }
  return (
    <label className={`iq-crews__back ${ok ? 'is-ok' : ''}`} data-iq-ask={q.id}>
      <span>{q.label}</span>
      <Num value={value ?? ''} onChange={onType} w={String(q.value).length + 1} disabled={ok} data-iq-in={q.id} />
      {q.after && <span>{q.after}</span>}
    </label>
  );
}

export function StoryView({ spec, state: s, act }) {
  const T = spec.text;
  const round = spec.rounds[s.ri];
  const isLast = s.ri + 1 >= spec.rounds.length;
  const seen = s.stage === 'seen';
  const seg = { crews: [s.map.A ?? 0, s.map.B ?? 0], ruler: spec.ruler, scale: 'fixed', ticks: spec.ticks };
  const held = s.pillar.tries.some((t) => t.holds);

  let fact = ' ';
  if (s.last?.type === 'chip' && !s.last.right) fact = T.mapFact({ ...s.last, round, ri: s.ri });
  else if (s.last?.type === 'back')
    fact = T.backFact({ ...s.last, ask: round.ask.find((q) => q.id === s.last.id), round });
  else if (seen) fact = T.end(s.rounds[s.rounds.length - 1], round);

  return (
    <section className="iq iq--crews iq--crews-story" data-iq="crews" data-iq-mode="story" data-iq-stage={s.stage}>
      <Head i={s.ri} n={spec.rounds.length} lead={T.lead(round, s.ri)} goal={T.goal(round, s.ri)} />
      <div className="iq-crews__story" data-iq-story>
        {lines(round.text).map((l, i) => (
          <p key={i}>
            <MathText>{l}</MathText>
          </p>
        ))}
      </div>

      {s.stage === 'read' && (
        <div className="iq-actions">
          <button type="button" className="rf-btn rf-btn--main" onClick={act.read} data-iq-read>
            {T.translate}
          </button>
        </div>
      )}

      {s.stage !== 'read' && (
        <div className={`iq-crews__map ${s.stage === 'map' ? '' : 'is-set'}`} data-iq-map>
          <Chips
            slot="unit"
            label={T.unitAsk}
            values={round.unit.options}
            chosen={s.map.unit}
            onChip={act.chip}
            enabled={s.stage === 'map'}
          />
          {['A', 'B'].map((k, i) => (
            <Chips
              key={k}
              slot={k}
              label={T.crewAsk(i)}
              values={round.numbers}
              chosen={s.map[k]}
              onChip={act.chip}
              enabled={s.stage === 'map'}
            />
          ))}
        </div>
      )}

      {s.stage === 'pillar' && (
        <PillarPanel
          W={T.pillar}
          seg={seg}
          state={s.pillar}
          act={act.walk}
          g={STORY_LANES}
          aside={
            <button
              type="button"
              className="di-btn di-btn--primary"
              onClick={act.back}
              disabled={!held || s.pillar.stage === 'laying'}
              data-iq-back
            >
              {T.toStory}
            </button>
          }
        />
      )}

      {(s.stage === 'back' || seen) && (
        <form
          className="iq-crews__asks"
          onSubmit={(e) => {
            e.preventDefault();
            act.check();
          }}
        >
          {round.ask.map((q) => (
            <AskBox
              key={q.id}
              T={T}
              q={q}
              value={s.backVals[q.id]}
              ok={Boolean(s.backOk[q.id])}
              onType={(v) => act.type(q.id, v)}
            />
          ))}
          {!seen && (
            <button type="submit" className="rf-btn rf-btn--main" data-iq-check>
              {T.check}
            </button>
          )}
        </form>
      )}

      {s.stage !== 'pillar' && (
        <p className={`iq-fact ${seen ? 'is-ok' : ''}`} data-iq-fact>
          <MathText>{fact}</MathText>
        </p>
      )}

      {seen && (
        <div className="iq-actions">
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {isLast ? T.done : T.next}
          </button>
        </div>
      )}
      <Found lines={s.rounds.map((r, i) => ({ key: `r${i}`, text: T.foundLine(r, spec.rounds[i]) }))} />
    </section>
  );
}

function StoryCrews({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => storyReducer(spec, s, a), null, initStory);
  const walkDispatch = (action) => dispatch({ type: 'walk', action });
  useLaying(state.pillar, walkDispatch, play);
  expose({
    kind: 'crews',
    mode: 'story',
    ri: state.ri,
    stage: state.stage,
    map: state.map,
    pillar: { stage: state.pillar.stage, d: state.pillar.d, tries: state.pillar.tries.length },
    backOk: state.backOk,
    rounds: state.rounds,
  });
  const run = (a) => {
    const after = storyReducer(spec, state, a);
    if (after === state) return null;
    dispatch(a);
    return after;
  };
  const act = {
    read: () => run({ type: 'read' }) && play('ui'),
    chip: (slot, value) => {
      const after = run({ type: 'chip', slot, value });
      if (after) play(after.last.right ? 'pick' : 'fail');
    },
    walk: {
      type: (text) => walkDispatch({ type: 'type', text }),
      nudge: (by) => walkDispatch({ type: 'nudge', by }),
      plant: () => walkDispatch({ type: 'plant' }),
      lay: () => walkDispatch({ type: 'lay' }),
      take: () => walkDispatch({ type: 'take' }),
    },
    back: () => run({ type: 'back' }) && play('ui'),
    type: (id, value) => dispatch({ type: 'type', id, value }),
    check: () => {
      const after = run({ type: 'check' });
      if (after) play(after.stage === 'seen' ? 'gate' : 'fail');
    },
    next: () => {
      const after = storyReducer(spec, state, { type: 'next' });
      if (after.done) onDone(storyResult(after));
      else dispatch({ type: 'next' });
    },
  };
  return <StoryView spec={spec} state={state} act={act} />;
}

// ───────────────────────────── mode `days` ─────────────────────────────

export function DaysView({ spec, state: s, act, lit = null }) {
  const T = spec.text;
  const now = daysNow(spec, s);
  const isLast = s.si + 1 >= spec.stages.length;
  const teams = spec.teams.map((t) => ({ cycle: cycleOf(t) }));
  const asked = now.zero ? teams.map((_, i) => i) : now.st.teams.map((t) => t - 1);
  const [typed, setTyped] = useState('');
  const met = s.phase === 'met';
  const stop = s.phase === 'stop' ? s.stopsSeen[s.stopsSeen.length - 1] : null;

  let fact = ' ';
  if (now.zero && s.zeroTries.length) fact = T.zeroFact({ said: s.zeroTries[s.zeroTries.length - 1], right: met });
  else if (stop) fact = T.stopFact(stop);
  else if (met && !now.zero) fact = T.met({ day: now.meet, said: s.said, teams: now.st.teams, sleepers: s.stopsSeen });

  const say = (e) => {
    e.preventDefault();
    act.say(typed);
  };
  return (
    <section
      className="iq iq--crews iq--crews-days"
      data-iq="crews"
      data-iq-mode="days"
      data-iq-stage={now.zero ? 'zero' : s.phase}
      data-iq-day={s.day}
      data-iq-si={s.si}
    >
      <Head i={s.si} n={spec.stages.length} lead={T.lead(now.st, s.si)} goal={T.goal(now.st, s.si)} />
      <div className="iq-crews__days" data-iq-days>
        <DayRows
          teams={teams}
          cols={spec.days}
          colW={dayCol(spec.days)}
          upto={s.day}
          rowsLit={lit}
          outline={asked}
          day={s.day}
          labels={T.rows}
        />
      </div>

      <p className={`iq-fact ${met ? 'is-ok' : ''}`} data-iq-fact>
        <MathText>{fact}</MathText>
      </p>

      <div className="iq-actions">
        {now.zero && !met && (
          <>
            <p className="iq-askline">
              <MathText>{T.zeroAsk}</MathText>
            </p>
            <span className="iq-chips">
              {(now.st.options ?? [0, 1]).map((v) => (
                <button key={v} type="button" className="iq-chip" onClick={() => act.zero(v)} data-iq-zero={v}>
                  {v}
                </button>
              ))}
            </span>
          </>
        )}
        {!now.zero && s.phase === 'say' && (
          <form className="iq-crews__say" onSubmit={say}>
            <span className="iq-askline">
              <MathText>{T.sayAsk(now.st)}</MathText>
            </span>
            <span>{T.dayBefore}</span>
            <Num value={typed} onChange={setTyped} w={4} autoFocus data-iq-in="day" />
            <button
              type="submit"
              className="rf-btn rf-btn--main"
              disabled={!/^\d+$/.test(typed) || Number(typed) < 2}
              data-iq-say
            >
              {T.say}
            </button>
          </form>
        )}
        {!now.zero && s.said != null && !met && (
          <p className="iq-crews__said" data-iq-said={s.said}>
            {T.saidLine(s.said)}
          </p>
        )}
        {!now.zero && (s.phase === 'run' || s.phase === 'stop') && now.st.run === 'step' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.step} autoFocus data-iq-step>
            {T.step}
          </button>
        )}
        {!now.zero && (s.phase === 'run' || s.phase === 'stop') && now.st.run !== 'step' && (
          <>
            {s.phase === 'stop' || s.paused ? (
              <button type="button" className="rf-btn rf-btn--main" onClick={act.resume} data-iq-fast>
                {T.fast}
              </button>
            ) : (
              <button type="button" className="rf-btn" onClick={act.pause} data-iq-pause>
                {T.pause}
              </button>
            )}
          </>
        )}
        {met && (
          <button type="button" className="rf-btn rf-btn--main" onClick={act.next} data-iq-next>
            {isLast ? T.done : T.next}
          </button>
        )}
      </div>
      <Found
        lines={s.stages.filter((x) => x.kind !== 'zero').map((x, i) => ({ key: `s${i}`, text: T.foundLine(x) }))}
      />
    </section>
  );
}

/** A day run team by team: 150 ms a team (the walks' fast mode: 10). */
function useTeamByTeam(day, n) {
  const [lit, setLit] = useState(null);
  useEffect(() => {
    if (day <= 1) return undefined;
    setLit(0);
    let k = 0;
    const tm = setInterval(
      () => {
        k += 1;
        setLit(k >= n ? null : k);
        if (k >= n) clearInterval(tm);
      },
      FAST() ? 10 : 150,
    );
    return () => clearInterval(tm);
  }, [day, n]);
  return lit;
}

function DaysCrews({ spec, play, onDone }) {
  const [state, dispatch] = useReducer((s, a) => daysReducer(spec, s, a), null, initDays);
  const now = daysNow(spec, state);
  const fast = !now.zero && now.st.run !== 'step';
  const lit = useTeamByTeam(fast ? 0 : state.day, spec.teams.length);
  expose({
    kind: 'crews',
    mode: 'days',
    si: state.si,
    phase: state.phase,
    day: state.day,
    said: state.said,
    meet: now.zero ? null : now.meet,
    stops: state.stopsSeen,
    stages: state.stages,
  });
  // « Avance »: four days a second until the run stops (the walks' fast mode: much faster)
  useEffect(() => {
    if (!fast || state.phase !== 'run' || state.paused) return undefined;
    const tm = setTimeout(
      () => {
        play('sweep', state.day);
        dispatch({ type: 'step' });
      },
      FAST() ? 10 : 250,
    );
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one timer per day run
  }, [fast, state.phase, state.paused, state.day]);
  useEffect(() => {
    if (state.phase === 'met') play('gate');
    if (state.phase === 'stop') play('hit');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per stop
  }, [state.phase, state.day]);
  const act = {
    zero: (value) => {
      play(value === 0 ? 'key' : 'fail');
      dispatch({ type: 'zero', value });
    },
    say: (text) => dispatch({ type: 'say', text }),
    step: () => {
      play('sweep', state.day);
      dispatch({ type: 'step' });
    },
    pause: () => dispatch({ type: 'pause' }),
    resume: () => dispatch({ type: 'resume' }),
    next: () => {
      const after = daysReducer(spec, state, { type: 'next' });
      if (after.done) onDone(daysResult(after));
      else dispatch({ type: 'next' });
    },
  };
  return <DaysView key={state.si} spec={spec} state={state} act={act} lit={lit} />;
}

/** The kind `crews`: its two modes (`story`, `days`). */
export function Crews({ spec, play, onDone }) {
  if (spec.mode === 'days') return <DaysCrews spec={spec} play={play} onDone={onDone} />;
  if (spec.mode === 'story') return <StoryCrews spec={spec} play={play} onDone={onDone} />;
  throw new Error(`crews: the mode ${spec.mode}`);
}
