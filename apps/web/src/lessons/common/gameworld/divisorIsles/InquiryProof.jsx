/**
 * Two INVESTIGATIONS of a rule forge in this world that end on what the student CLAIMS or PROVES (see `Inquiry.jsx`, which
 * mounts them; logic: `inquiry.js`):
 *
 *   peel     « what is left » — planks of b are laid on the gap a again and again, down to a piece shorter than b
 *            (a = b × q + r). For each plank of a table the world says whether it fills a and whether it fills b; the
 *            student says whether it fills the PIECE before the world lays it there. Then he builds his claim from the
 *            table's columns (« when a plank fills … then it fills the piece »): the table answers, row by row.
 *   letters  « how to be sure for every number » — he checks the statement on numbers, the world changes the numbers and
 *            hides one; then he assembles a proof from cards. A false line is answered by a sample where its numbers do
 *            not match; a line placed too early, by what it uses that no line above has written.
 *
 * `spec.text` is the lesson's wording. Nothing here states a rule: every sentence says what the strip, the table or the
 * numbers just did.
 */
import { useEffect, useRef, useState } from 'react';
import MathText from '../../components/MathText';
import { peelOf, fitsRow, judgePeelClaim, checkProofOrder, refuteCard } from './inquiry';
import { Span, Calc, restTex } from './InquiryCombine';
import { INQUIRY_TEXT } from './strings';
import { FAST, expose, X0, SPAN } from './inquiryParts';

const mark = (v) => (v === true ? '✓' : v === false ? '✗' : '?');

// ───────────────────────── peel ─────────────────────────
const YP = 50;

export function Peel({ spec, play, onDone }) {
  const T = spec.text;
  const [ri, setRi] = useState(0);
  const { a, b, candidates } = spec.rounds[ri];
  const p = peelOf(a, b);
  const [stage, setStage] = useState('start'); // start | peeling | guess | shown | claim
  const [peeled, setPeeled] = useState(0);
  const [ci, setCi] = useState(0);
  const [rows, setRows] = useState([]); // every plank answered: { ri, d, fitsA, fitsB, fitsR, guess }
  const [claim, setClaim] = useState({ cols: [], link: 'and' });
  const timer = useRef(null);
  useEffect(() => () => clearInterval(timer.current), []);
  const d = candidates[ci];
  const f = fitsRow(a, b, d);
  const judge = stage === 'claim' ? judgePeelClaim(spec.rounds, claim) : null;
  // what the question may say (whether the plank fills the piece is told only after his guess)
  const asked = { a, b, d, q: p.q, r: p.r, fitsA: f.a, fitsB: f.b };
  const row = { ...asked, fitsR: f.r };
  const answered = rows.find((x) => x.ri === ri && x.d === d);
  expose({ kind: 'peel', ri, a, b, q: p.q, r: p.r, d, stage, peeled, rows, claim, judge });

  const u = SPAN / a;
  const peel = () => {
    setStage('peeling');
    let i = 0;
    timer.current = setInterval(
      () => {
        i += 1;
        play('plank', i);
        setPeeled(i);
        if (i >= p.q) {
          clearInterval(timer.current);
          play('gate');
          setStage('guess');
        }
      },
      FAST() ? 8 : 560,
    );
  };
  const say = (v) => {
    if (stage !== 'guess') return;
    play(f.r ? 'success' : 'crumble');
    setRows([...rows, { ri, d, fitsA: f.a, fitsB: f.b, fitsR: f.r, guess: v }]);
    setStage('shown');
  };
  const next = () => {
    if (ci + 1 < candidates.length) {
      setCi(ci + 1);
      setStage('guess');
      return;
    }
    if (ri + 1 < spec.rounds.length) {
      setRi(ri + 1);
      setCi(0);
      setPeeled(0);
      setStage('start');
      return;
    }
    play('ui');
    setStage('claim');
  };
  const choose = (c) => {
    const j = judgePeelClaim(spec.rounds, c);
    play(c.cols.length && j.intruders.length ? 'fail' : 'pick');
    setClaim(c);
  };
  const toggleCol = (c) =>
    choose({ ...claim, cols: claim.cols.includes(c) ? claim.cols.filter((x) => x !== c) : [...claim.cols, c].sort() });
  const seal = () => {
    play('key');
    onDone({
      rounds: spec.rounds.map((x, i) => {
        const { q, r } = peelOf(x.a, x.b);
        const mine = rows.filter((y) => y.ri === i);
        return {
          a: x.a,
          b: x.b,
          q,
          r,
          rows: mine.map((y) => ({ d: y.d, fitsA: y.fitsA, fitsB: y.fitsB, fitsR: y.fitsR, guess: y.guess })),
        };
      }),
      claim,
    });
  };

  const done = stage !== 'start' && stage !== 'peeling';
  const divTex = (x) => {
    const pp = peelOf(x.a, x.b);
    return `${x.a} = ${x.b} \\times ${pp.q} + ${pp.r}`;
  };
  const inClaim = (rr, dd, list) => list?.some((x) => x.gap === rr.a && x.bridge === rr.b && x.d === dd);
  const calc =
    stage === 'peeling'
      ? [peeled ? `${p.steps[peeled - 1]} - ${b} = ${p.steps[peeled]}` : `${a}`]
      : stage === 'guess'
        ? [divTex(asked), restTex(a, d), restTex(b, d)]
        : stage === 'shown'
          ? [restTex(a, d), restTex(b, d), restTex(p.r, d)]
          : stage === 'start'
            ? []
            : null;

  return (
    <section className="iq iq--peel" data-iq="peel" data-iq-stage={stage} data-iq-gap={a} data-iq-plank={d}>
      <div className="iq-lead">
        <span className="iq-count">
          {Math.min(ri + 1, spec.rounds.length)}&nbsp;/&nbsp;{spec.rounds.length}
        </span>
        <p>
          <MathText>
            {stage === 'start'
              ? T.lead(a, b, ri)
              : stage === 'peeling'
                ? T.peeling(a, b)
                : stage === 'claim'
                  ? T.claimLead
                  : T.ask(asked)}
          </MathText>
        </p>
      </div>
      <p className="iq-goal" data-iq-goal>
        <span aria-hidden="true">🎯</span>
        {T.goal}
      </p>

      {stage !== 'claim' ? (
        <svg className="iq-scene" viewBox="0 0 1000 190" role="img" aria-label={`${a} ÷ ${b}`}>
          <Span n={a} d={0} u={u} y={YP} laid={false} />
          {Array.from({ length: peeled }, (_, i) => (
            <rect
              key={i}
              className={`iq-plank iq-plank--drop ${i % 2 ? 'is-alt' : ''}`}
              x={X0 + i * b * u + 1}
              y={YP - 4}
              width={b * u - 2}
              height="38"
              rx="6"
            />
          ))}
          {done && (
            <>
              <rect
                className="iq-rest"
                x={X0 + p.q * b * u}
                y={YP - 4}
                width={Math.max(1, p.r * u - 1.5)}
                height="38"
                rx="5"
              />
              <text className="iq-scene__say" x={Math.min(900, X0 + (p.q * b + p.r / 2) * u)} y={YP - 16}>
                {T.piece(p.r)}
              </text>
            </>
          )}
          {/* the plank asked about, laid on the piece left — or longer than it (its right end on the gap's end) */}
          {stage === 'shown' &&
            (d <= p.r ? (
              <Span n={p.r} d={d} u={u} x={X0 + p.q * b * u} y={YP + 82} fast={FAST()} />
            ) : (
              <>
                <Span n={p.r} d={0} u={u} x={X0 + p.q * b * u} y={YP + 82} laid={false} />
                <rect className="iq-over" x={X0 + a * u - d * u} y={YP + 124} width={d * u - 2} height="26" rx="6" />
              </>
            ))}
        </svg>
      ) : (
        <div className="iq-psay" data-iq-claim>
          <span>{T.claimIf}</span>
          <button
            type="button"
            className={`iq-lens ${claim.cols.includes('a') ? 'is-on' : ''}`}
            onClick={() => toggleCol('a')}
            data-iq-col="a"
          >
            {T.colLabel.a}
          </button>
          <span className={`iq-plinks ${claim.cols.length > 1 ? '' : 'is-idle'}`}>
            {['and', 'or'].map((l) => (
              <button
                key={l}
                type="button"
                className={`iq-chip iq-chip--s ${claim.link === l ? 'is-on' : ''}`}
                onClick={() => choose({ ...claim, link: l })}
                data-iq-link={l}
              >
                {T.link[l]}
              </button>
            ))}
          </span>
          <button
            type="button"
            className={`iq-lens ${claim.cols.includes('b') ? 'is-on' : ''}`}
            onClick={() => toggleCol('b')}
            data-iq-col="b"
          >
            {T.colLabel.b}
          </button>
          <span>{T.claimThen}</span>
        </div>
      )}

      {calc && <Calc items={calc} />}

      {/* the table of every round: what fills a, what fills b — and, after his guess, what fills the piece */}
      <div className="iq-ptable" dir="ltr" data-iq-ptable>
        <div className="iq-pcol iq-pcol--head">
          <span />
          <span>{T.cols.plank}</span>
          <span>{T.cols.a}</span>
          <span>{T.cols.b}</span>
          <span>{T.cols.r}</span>
        </div>
        {spec.rounds.slice(0, ri + 1).map((rr, i) => {
          const seen = i < ri || done;
          return (
            <div key={`${rr.a}-${rr.b}`} className="iq-pgroup">
              <div className="iq-pgroup__cap">{seen && <MathText>{`$${divTex(rr)}$`}</MathText>}</div>
              <div className="iq-pgroup__cols">
                {rr.candidates.map((dd) => {
                  const x = rows.find((y) => y.ri === i && y.d === dd);
                  const ff = fitsRow(rr.a, rr.b, dd);
                  const active = i === ri && dd === d && (stage === 'guess' || stage === 'shown');
                  const cls = [
                    'iq-pcol',
                    active ? 'is-active' : '',
                    inClaim(rr, dd, judge?.intruders)
                      ? 'is-intruder'
                      : inClaim(rr, dd, judge?.taken)
                        ? 'is-claimed'
                        : '',
                  ].join(' ');
                  return (
                    <div key={dd} className={cls} data-iq-row={`${rr.a}:${rr.b}:${dd}`}>
                      <b>{dd}</b>
                      <span className={seen ? (ff.a ? 'is-yes' : 'is-no') : ''}>{seen ? mark(ff.a) : ''}</span>
                      <span className={seen ? (ff.b ? 'is-yes' : 'is-no') : ''}>{seen ? mark(ff.b) : ''}</span>
                      <span
                        className={`${x ? (x.fitsR ? 'is-yes' : 'is-no') : ''} ${x && x.guess !== x.fitsR ? 'is-missed' : ''}`}
                        data-iq-r={x ? (x.fitsR ? '1' : '0') : ''}
                      >
                        {x ? mark(x.fitsR) : active ? '?' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className={`iq-fact ${judge?.ok ? 'is-ok' : ''}`} data-iq-fact data-iq-ok={judge?.ok ? '1' : '0'}>
        <MathText>
          {stage === 'shown'
            ? T.shown(row, answered?.guess)
            : stage === 'claim'
              ? !claim.cols.length
                ? T.claimAsk
                : judge.ok
                  ? T.claimOk(judge)
                  : T.claimFact(judge)
              : ' '}
        </MathText>
      </p>

      <div className="iq-actions">
        {stage === 'start' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={peel} data-iq-peel>
            {T.peelBtn(b)}
          </button>
        )}
        {stage === 'guess' && (
          <>
            <button type="button" className="rf-btn" onClick={() => say(true)} data-iq-say="yes">
              {T.yes}
            </button>
            <button type="button" className="rf-btn" onClick={() => say(false)} data-iq-say="no">
              {T.no}
            </button>
          </>
        )}
        {stage === 'shown' && (
          <button type="button" className="rf-btn rf-btn--main" onClick={next} data-iq-next>
            {ci + 1 < candidates.length ? T.next : ri + 1 < spec.rounds.length ? T.nextRound : T.toClaim}
          </button>
        )}
        {stage === 'claim' && judge.ok && (
          <button type="button" className="rf-btn rf-btn--main" onClick={seal} data-iq-seal>
            {T.seal}
          </button>
        )}
      </div>
    </section>
  );
}

// ───────────────────────── letters ─────────────────────────
export function Letters({ spec, play, onDone }) {
  const T = spec.text;
  const N = spec.numbers;
  const { samples, statement, cards } = spec;
  const keys = spec.show ?? Object.keys(samples[0]).filter((k) => k !== 'hide');
  const byId = Object.fromEntries(cards.map((c) => [c.id, c]));
  const [stage, setStage] = useState('numbers'); // numbers | cards | proved
  const [si, setSi] = useState(0);
  const [lines, setLines] = useState([]); // his calculations: { si, q }
  const [miss, setMiss] = useState(null);
  const [placed, setPlaced] = useState([]);
  const [tries, setTries] = useState(0);
  const [refuted, setRefuted] = useState([]);
  const [said, setSaid] = useState(null); // the world's answer to the last card: { id, kind, text }
  const v = samples[si];
  // the □ he presses: a sample whose quotient is not a natural number cannot be asked — it is shown like a hidden one
  // (the world moves on), never a row of chips with no right one
  const quotient = N.value(v) / N.by(v);
  const unaskable = !v.hide && !(Number.isInteger(quotient) && quotient >= 1);
  const hidden = Boolean(v.hide) || unaskable;
  const mine = lines.find((l) => l.si === si);
  const last = lines.filter((l) => l.si < si).at(-1);
  expose({ kind: 'letters', stage, si, hidden, lines, placed, tries, refuted, said, want: spec.order });

  const pick = (q) => {
    if (mine || hidden) return;
    if (N.by(v) * q === N.value(v)) {
      play('key');
      setMiss(null);
      setLines([...lines, { si, q }]);
      return;
    }
    play('fail');
    setMiss(q);
  };
  const nextSample = () => {
    setMiss(null);
    if (si + 1 < samples.length) {
      play('ui');
      setSi(si + 1);
      return;
    }
    play('paper');
    setStage('cards');
  };
  const place = (id) => {
    if (stage !== 'cards') return;
    const card = byId[id];
    if (!card.ok) {
      play('crumble');
      setTries(tries + 1);
      if (!refuted.includes(id)) setRefuted([...refuted, id]);
      // the world answers with the sample where the line is false; a false line no sample refutes (a lesson's data that
      // let one through) is answered by where it stands — it never crashes and never says « wrong »
      const where = refuteCard(card, samples);
      setSaid({
        id,
        kind: 'false',
        text: where && card.why ? card.why(where) : (T.unrefuted ?? INQUIRY_TEXT.unrefuted)(card),
      });
      return;
    }
    const ord = checkProofOrder(cards, [...placed, id], statement.gives ?? []);
    if (!ord.ok) {
      play('fail');
      setTries(tries + 1);
      setSaid({ id, kind: 'early', text: T.needs(card, ord.missing) });
      return;
    }
    const list = [...placed, id];
    setPlaced(list);
    setSaid({ id, kind: 'ok', text: T.placed?.(card) ?? ' ' });
    if (list.length >= spec.order.length) {
      play('success');
      setStage('proved');
    } else play('paper');
  };
  // the chips reach the sample's quotient even when it is past `max` (never a row with no right chip)
  const max = Math.max(N.max ?? 20, hidden ? 0 : quotient);

  if (stage === 'numbers')
    return (
      <section className="iq iq--letters" data-iq="letters" data-iq-stage={stage} data-iq-sample={si}>
        <div className="iq-lead">
          <span className="iq-count">
            {si + 1}&nbsp;/&nbsp;{samples.length}
          </span>
          <p>
            <MathText>{T.lead}</MathText>
          </p>
        </div>
        <p className="iq-goal" data-iq-goal>
          <span aria-hidden="true">🎯</span>
          {T.goal}
        </p>
        <div className="iq-values-row" dir="ltr" data-iq-values>
          {keys.map((k) => (
            <span key={k} className={`iq-val ${v.hide === k ? 'is-hidden' : ''}`}>
              <MathText>{`$${k} = ${v.hide === k ? '\\,?' : v[k]}$`}</MathText>
            </span>
          ))}
        </div>
        <p className="iq-fact" data-iq-fact>
          <MathText>
            {unaskable
              ? (T.noWhole ?? INQUIRY_TEXT.noWhole)(v, N.value(v), N.by(v))
              : hidden
                ? T.hidden(v, last ? samples[last.si] : null, last?.q ?? null)
                : mine
                  ? T.numbersOk(v, mine.q)
                  : miss != null
                    ? T.numbersMiss(v, miss)
                    : last
                      ? `${T.carry(v, samples[last.si], last.q)} ${T.numbersAsk(v)}`
                      : T.numbersAsk(v)}
          </MathText>
        </p>
        <div className="iq-actions">
          {!hidden && !mine && (
            <div className="iq-chips" dir="ltr">
              {Array.from({ length: max }, (_, i) => i + 1).map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`iq-chip iq-chip--s ${miss === q ? 'is-said' : ''}`}
                  onClick={() => pick(q)}
                  data-iq-q={q}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          {(mine || hidden) && (
            <button type="button" className="rf-btn rf-btn--main" onClick={nextSample} data-iq-next>
              {si + 1 < samples.length ? T.nextSample : T.toCards}
            </button>
          )}
        </div>
        {lines.length > 0 && (
          <ul className="iq-found" data-iq-found>
            {lines.map((l) => (
              <li key={l.si}>
                <MathText>{T.line(samples[l.si], l.q)}</MathText>
              </li>
            ))}
          </ul>
        )}
      </section>
    );

  return (
    <section className="iq iq--letters iq--cards" data-iq="letters" data-iq-stage={stage}>
      <div className="iq-lead">
        <span className="iq-count">
          {placed.length}&nbsp;/&nbsp;{spec.order.length}
        </span>
        <p>
          <MathText>{stage === 'proved' ? T.proved : T.cardsLead}</MathText>
        </p>
      </div>

      <div className="iq-proof">
        <div className="iq-sheet" data-iq-sheet>
          <div className="iq-given">
            <b>{T.givenLabel}</b>
            {statement.given.map((g) => (
              <span key={g}>
                <MathText>{g}</MathText>
              </span>
            ))}
            <b>{T.goalLabel}</b>
            <span>
              <MathText>{statement.goal}</MathText>
            </span>
          </div>
          <ol className="iq-slots">
            {spec.order.map((_, i) => (
              <li
                key={i}
                className={`iq-slot ${placed[i] ? 'is-full' : i === placed.length ? 'is-next' : ''}`}
                data-iq-slot={i}
                data-iq-card-in={placed[i] ?? ''}
              >
                <span className="iq-slot__n">{i + 1}</span>
                {placed[i] && <MathText>{byId[placed[i]].tex}</MathText>}
              </li>
            ))}
          </ol>
        </div>
        {stage === 'cards' && (
          <div className="iq-deck" data-iq-deck>
            {cards
              .filter((c) => !placed.includes(c.id))
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`iq-card ${said?.id === c.id && said.kind !== 'ok' ? 'is-said' : ''} ${refuted.includes(c.id) ? 'is-refuted' : ''}`}
                  onClick={() => place(c.id)}
                  data-iq-card={c.id}
                >
                  <MathText>{c.tex}</MathText>
                </button>
              ))}
          </div>
        )}
      </div>

      <p className={`iq-fact ${stage === 'proved' ? 'is-ok' : ''}`} data-iq-fact data-iq-said={said?.kind ?? ''}>
        <MathText>{said?.text ?? T.cardsAsk}</MathText>
      </p>

      {stage === 'proved' && (
        <div className="iq-actions">
          <button
            type="button"
            className="rf-btn rf-btn--main"
            onClick={() => onDone({ order: placed, tries, refuted })}
            data-iq-done
          >
            {T.done}
          </button>
        </div>
      )}
    </section>
  );
}
