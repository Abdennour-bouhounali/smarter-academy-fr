/**
 * « L’archipel des diviseurs » on screen — what THIS world adds to the kit's shell (`kit/LessonWorld.jsx`): the equation and the verdict
 * of a forge, the HUD of a run and of a real-world case, and its own overlays (the prediction, the stone's question, the rule
 * forge, the statues, the workshop, the store of the last bridge, the guidance after a mistake).
 * The title screen, the top bar, the hub, the tablets, the result and the end are the kit's.
 */
import { createElement, useEffect, useMemo, useState } from 'react';
import { X, ArrowLeft, ArrowRight, Star, Heart, Lightbulb, Flame, Truck, Coins } from 'lucide-react';
import MathText from '../../components/MathText';
import { formatFr, texFr } from '@smarter-academy/core';
import { DivisorIslesGame } from './Game';
import { T, planks, waveSay, explain } from './strings';

import { answerOf, simUnit } from './cases';
import { divisionTip, ruleTip } from '../kit/tips';
import RuleForge from '../kit/RuleForge';
import { FORGE_PARTS } from './forgeParts';
import Workshop from './Workshop';
import MissionRunner from '../missions/MissionRunner';
import { signTex } from './mark';

import Fit, { stepRoom } from '../kit/Fit';
import { PaperGate, PaperModel, PT } from '../kit/Paper';
import { twin } from '../kit/longDivision';
import LessonWorld from '../kit/LessonWorld';
import { M, Card, Num } from '../kit/parts';
import { KT, TX } from '../kit/text';
import { Instruction, Recall } from '../kit/Instruction';
import { useLesson } from '../kit/LessonContext';

export function Equation({ eq, unit = planks }) {
  const { a, b, q, r, live, unpaid, mark, aTex } = eq;
  // a remainder that is not 0 is a FACT about the mould, not a mistake: amber, never the red of an error
  const col = live ? '#fbbf24' : r === 0 ? '#34d399' : '#fb923c';
  // the last bridge announced by a LABEL (`aTex`, the story's `boss.label`): the label stands for a, and what is left is
  // not written while the planks are laid — it would give a away; the final remainder is a fact again
  const hidden = Boolean(aTex) && live;
  // a whole number of four digits or more is grouped by thousands (« 1 736 », FRENCH_LANGUAGE_CONTRACT.md §4)
  const n = (x) => (Number.isInteger(x) && x >= 0 ? texFr(x) : x);
  const rest = hidden ? '\\ldots' : `\\textcolor{${col}}{${n(r)}}`;
  return (
    <div className={`di-eq ${live ? '' : r === 0 ? 'is-ok' : 'is-open'}`} {...(aTex ? { 'data-di-eq-label': '' } : {})}>
      <M>{`${aTex ?? n(a)} = ${n(b)} \\times ${n(q)} + ${rest}`}</M>
      {/* a marked stretch: its own division, once the planks have passed the mark — a joint falls on it only if 0 is left */}
      {mark?.shown && (
        <div className="di-eq__mark" data-di-eq-mark={mark.r}>
          <span>{T.mark.stretch}</span>
          <M>{`${n(mark.m)} = ${n(b)} \\times ${n(mark.q)} + \\textcolor{${mark.r === 0 ? '#34d399' : '#fb923c'}}{${n(mark.r)}}`}</M>
        </div>
      )}
      <div className="di-eq__legend">
        <span>{unit(q)}</span>
        {/* `unpaid`: the purse ran out — what is still open is not a remainder (it is not smaller than the plank) */}
        {!hidden && <span style={{ color: col }}>{`${unpaid ? T.hud.unpaid : T.hud.remainder} : ${formatFr(r)}`}</span>}
      </div>
    </div>
  );
}

/** The two results of a forge, kept apart: the student's prediction first, then what the mould does to the gap. */
function Verdict({ v }) {
  return (
    <div className="di-verdict" data-di-verdict={v.right === null ? 'none' : v.right ? 'right' : 'wrong'}>
      {v.right === true && (
        <p className="di-verdict__pred is-right">
          <b>✓</b> {T.verdict.right(v.r)}
          {v.first && <span className="di-verdict__star">★ {T.verdict.star}</span>}
        </p>
      )}
      {v.right === false && <p className="di-verdict__pred is-wrong">{T.verdict.wrong(v.predicted, v.r)}</p>}
      <p className={`di-verdict__bridge ${v.holds ? 'is-holds' : ''}`}>
        {v.purse
          ? T.verdict.purse(v.q, v.need)
          : v.holds
            ? T.verdict.holds(v.b, v.aText ?? formatFr(v.a))
            : v.mark && v.r === 0
              ? T.verdict.markMiss(v.b, v.mark.m)
              : T.verdict.open(v.b, v.aText ?? formatFr(v.a))}
      </p>
    </div>
  );
}

function DashHud({ dash, game, paused }) {
  const practice = dash.mode === 'practice';
  return (
    <>
      <div className="di-dash" data-di-dash={dash.mode}>
        <div className="di-dash__meta">
          <span className="di-dash__hearts">
            {[0, 1, 2].map((i) => (
              <Heart key={i} size={20} className={i < dash.hearts ? 'is-on' : ''} fill="currentColor" />
            ))}
          </span>
          <span dir="ltr">
            {dash.index}
            {'\u00a0/\u00a0'}
            {dash.total}
          </span>
          {practice && (
            <span className="di-dash__score" title={KT.practice.score}>
              <Star size={15} className="di-ic-star" /> <b dir="ltr">{dash.score}</b>
            </span>
          )}
          {practice && dash.streak >= 3 && (
            <span className="di-dash__streak" key={dash.streak} title={KT.practice.streak}>
              <Flame size={16} /> <b dir="ltr">{dash.streak}</b>
            </span>
          )}
        </div>
        {!dash.done && !paused && (
          <div className="di-dash__say" key={`${dash.index}-${dash.say}`}>
            <small>{dash.hint ? <M>{dash.hint.replaceAll('$', '')}</M> : T.objective.dash}</small>
            <strong>
              <MathText>{dash.say}</MathText>
            </strong>
          </div>
        )}
      </div>
      {practice && !paused && (
        <div className="di-dash__tools">
          <button type="button" className="di-pill" onClick={() => game.showRule()} data-di-rule>
            <Lightbulb size={17} /> {KT.practice.rule}
          </button>
          <button type="button" className="di-pill" onClick={() => game.quitPractice()} data-di-quit>
            <X size={16} /> {KT.practice.quit}
          </button>
        </div>
      )}
      {!paused && (
        <div className="di-lanes" dir="ltr">
          <button
            type="button"
            aria-label={T.a11y.left}
            onPointerDown={(e) => {
              e.preventDefault();
              game.input.press('left');
            }}
          >
            <ArrowLeft size={30} />
          </button>
          <button
            type="button"
            aria-label={T.a11y.right}
            onPointerDown={(e) => {
              e.preventDefault();
              game.input.press('right');
            }}
          >
            <ArrowRight size={30} />
          </button>
        </div>
      )}
    </>
  );
}

function Predict({ o, game }) {
  return (
    <Card>
      <p className="di-card__eyebrow">{T.predict.title(o.a, o.b)}</p>
      <h2>{T.predict.ask}</h2>
      <div className="di-chips" dir="ltr">
        {o.options.map((v) => (
          <button key={v} type="button" className="di-chip" onClick={() => game.answerPredict(v)} data-di-predict={v}>
            {v}
          </button>
        ))}
      </div>
      <button type="button" className="di-link" onClick={() => game.closeOverlay()}>
        {T.predict.cancel}
      </button>
    </Card>
  );
}

function Quiz({ o, game }) {
  const T = game.T;
  const spec = T.quiz[o.id];
  const [picked, setPicked] = useState([]);
  const [fb, setFb] = useState(null);
  const toggle = (v) => {
    setFb(null);
    setPicked((p) => (spec.multi ? (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]) : [v]));
  };
  const check = () => {
    const res = game.answerQuiz(o.id, picked);
    if (!res.ok) setFb(res);
  };
  const markOf = (v) => fb?.marks?.find((m) => m.v === v);
  return (
    <Card wide>
      <h2>{spec.prompt}</h2>
      <div className={spec.multi ? 'di-chips' : 'di-options'}>
        {spec.options.map((op) => {
          const m = markOf(op.v);
          return (
            <button
              key={op.v}
              type="button"
              className={`${spec.multi ? 'di-chip' : 'di-option'} ${picked.includes(op.v) ? 'is-on' : ''} ${m ? (m.r === 0 ? 'is-fits' : 'is-leaves') : ''}`}
              onClick={() => toggle(op.v)}
              data-di-option={op.v}
            >
              {op.label}
            </button>
          );
        })}
      </div>
      {fb?.feedback && <p className="di-feedback">{fb.feedback}</p>}
      {fb?.marks && (
        <div className="di-marks" data-di-marks>
          {fb.marks.map((m) => (
            <p key={m.v} className={m.r === 0 ? 'is-fits' : 'is-leaves'}>
              <b>{m.r === 0 ? '✓' : '✗'}</b>{' '}
              <MathText>{m.r === 0 ? T.quiz.fits(m.v, m.a, m.q) : T.quiz.leaves(m.v, m.a, m.q, m.r)}</MathText>
            </p>
          ))}
          <p className="di-marks__missing">{T.quiz.missing(fb.missing)}</p>
        </div>
      )}
      <div className="di-row">
        <button
          type="button"
          className="di-btn di-btn--primary"
          disabled={!picked.length}
          onClick={check}
          data-di-check
        >
          {T.quiz.check}
        </button>
        {o.closable && (
          <button type="button" className="di-link" onClick={() => game.quizBack()} data-di-quiz-close>
            {T.quiz.back}
          </button>
        )}
      </div>
    </Card>
  );
}

/** After a wrong gate the run stops: why the chosen number does not fit, why the right one does — and the rule when lost. */
function Guide({ o, game }) {
  const { rules } = useLesson();
  const rule = rules[o.wave.key];
  const g = explain(o.wave, o.picked);
  const right = o.wave.gates[o.wave.good];
  return (
    <Card wide>
      <p className="di-card__eyebrow">{KT.practice.guide}</p>
      <h2 className="di-guide__q">
        <MathText>{waveSay(o.wave)}</MathText>
      </h2>
      <div className="di-guide" data-di-guide>
        <div className="is-leaves">
          <b>✗</b>
          <div>
            <strong>{KT.practice.picked(o.picked)}</strong>
            <p>
              <MathText>{g.wrong}</MathText>
            </p>
          </div>
        </div>
        <div className="is-fits">
          <b>✓</b>
          <div>
            <strong>{KT.practice.right(right)}</strong>
            <p>
              <MathText>{g.right}</MathText>
            </p>
          </div>
        </div>
      </div>
      {o.lost && (
        <div className="di-guide__rule" data-di-guide-rule>
          <p className="di-card__eyebrow">{KT.practice.lost}</p>
          <div className="di-map__rule">
            <strong>
              {rule.icon} {rule.title}
            </strong>
            <p>
              <MathText>{rule.lines[0]}</MathText>
            </p>
            <M>{rule.math[0]}</M>
          </div>
        </div>
      )}
      {(() => {
        const w = o.wave;
        const tip =
          w.type === 'remainder'
            ? divisionTip(w.a, w.b)
            : ['divisorOf', 'divides'].includes(w.type)
              ? ruleTip(w.a, right)
              : null;
        return tip ? (
          <p className="di-tip" data-di-tip>
            <b>💡 {TX.tip}</b> <MathText>{tip}</MathText>
          </p>
        ) : null;
      })()}
      {o.again && <p className="di-dim">{KT.practice.again}</p>}
      <div className="di-row">
        <button
          type="button"
          className="di-btn di-btn--primary"
          onClick={() => game.resumeRun()}
          data-di-resume
          autoFocus
        >
          {KT.practice.go}
        </button>
        {!o.lost && (
          <button type="button" className="di-link" onClick={() => game.showRule(o.wave.key)} data-di-remind>
            <Lightbulb size={15} /> {KT.practice.remind}
          </button>
        )}
      </div>
    </Card>
  );
}

/**
 * « La coopérative du verger » — the screen of a real-world case: the order at the top (what the client wants), the equality the depot
 * is packing, and at the bottom the ONE step to decide now (choose a crate, or write numbers in the shape of the answer).
 */
function DepotHud({ d, eq, game, paused }) {
  const step = d.step;
  const lesson = useLesson();
  const W = lesson.text.worlds[d.world] ?? lesson.text.worlds.depot;
  const [picked, setPicked] = useState([]);
  const [vals, setVals] = useState({});
  const [model, setModel] = useState(null);
  useEffect(() => {
    setPicked([]);
    setVals({});
  }, [d.index, d.stepIndex]);
  // the earlier steps of the day can be read again: the question, what the student answered, the explanation
  const H = (d.history ?? []).filter((x) => x.done);
  const [rev, setRev] = useState(null);
  useEffect(() => {
    setRev(null);
  }, [d.index, d.stepIndex]);
  const R = rev !== null ? H[rev] : null;
  const slots = step?.type === 'number' ? step.tokens.filter((t) => typeof t === 'object') : [];
  const ready = step?.type === 'number' ? slots.every((t) => (vals[t.slot] ?? '') !== '') : picked.length === 2;
  const choose = (v) => {
    if (d.busy || !step) return;
    if (step.pick === 2)
      setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : p.length < 2 ? [...p, v] : [p[1], v]));
    else game.answerCase(v);
  };
  const submit = (e) => {
    e.preventDefault();
    if (!ready || d.busy || !step) return;
    game.answerCase(
      step.type === 'number' ? Object.fromEntries(slots.map((t) => [t.slot, Number(vals[t.slot])])) : picked,
    );
  };
  return (
    <>
      <div className="di-order" data-di-order={d.kind}>
        <div className="di-order__meta">
          <b>
            <Truck size={16} /> {W.name} · {W.order(d.index, d.total)}
          </b>
          <span className="di-dash__hearts">
            {[0, 1, 2].map((i) => (
              <Heart key={i} size={18} className={i < d.hearts ? 'is-on' : ''} fill="currentColor" />
            ))}
          </span>
          <span className="di-order__money" title={W.earned}>
            <Coins size={16} /> <b dir="ltr">{d.earned}</b> {W.unit}
          </span>
        </div>
        <p>
          <MathText>{R ? R.brief : d.brief}</MathText>
        </p>
        {(R ? R.facts : d.facts)?.length > 0 && (
          <ul className="di-facts" data-di-facts aria-label={T.a11y.facts}>
            {(R ? R.facts : d.facts).map((f) => (
              <li key={f}>
                <MathText>{f}</MathText>
              </li>
            ))}
          </ul>
        )}
      </div>
      {eq && (
        <div className="di-order__eq">
          <Equation eq={eq} unit={(q) => simUnit(q, eq.mode)} />
        </div>
      )}
      {!paused && (
        <div className="di-dash__tools">
          <button type="button" className="di-pill" onClick={() => game.showRule()} data-di-rule>
            <Lightbulb size={17} /> {KT.practice.rule}
          </button>
          <button type="button" className="di-pill" onClick={() => game.quitPractice()} data-di-quit>
            <X size={16} /> {KT.practice.quit}
          </button>
        </div>
      )}
      {!paused && (
        <form className={`di-step ${d.busy ? 'is-busy' : ''}`} onSubmit={submit} data-di-step={step?.id ?? 'shipping'}>
          <Fit avail={stepRoom} innerClass="di-step__in">
            {H.length > 0 && (
              <div className="di-hist" data-di-hist>
                <small>{TX.depot.history}</small>
                {H.map((x, k) => (
                  <button
                    key={`${x.oi}-${x.si}`}
                    type="button"
                    className={`${k === rev ? 'is-on' : ''} ${x.attempts.length > 1 ? 'is-late' : ''}`}
                    onClick={() => setRev(k === rev ? null : k)}
                    title={x.prompt}
                    data-di-hist-dot={k}
                  >
                    {W.order(x.oi + 1, d.total).split(' ')[0]} {x.oi + 1} · {x.si + 1}
                  </button>
                ))}
                {R && (
                  <button type="button" className="is-now" onClick={() => setRev(null)} data-di-hist-back>
                    {TX.depot.backNow}
                  </button>
                )}
              </div>
            )}
            {R && (
              <div className="di-review" data-di-review>
                <p className="di-review__head">
                  <b>{TX.depot.review}</b> <span>{TX.depot.step(R.si + 1, R.steps)}</span>
                </p>
                <p className="di-review__q">{R.prompt}</p>
                {R.attempts.map((at, k) => (
                  <div key={k} className={`di-review__a ${at.ok ? 'is-ok' : 'is-ko'}`}>
                    <b>{at.ok ? '✓' : '✗'}</b> <small>{TX.depot.mine}</small>
                    <span className="di-review__ans" dir="ltr">
                      {at.parts.map((pt, j) => (
                        <span key={j} className={pt.mine ? 'is-mine' : ''}>
                          {pt.text}
                        </span>
                      ))}
                    </span>
                    <p>
                      <MathText>{at.text}</MathText>
                    </p>
                  </div>
                ))}
                {R.tip && (
                  <p className="di-tip">
                    <b>💡 {TX.tip}</b> <MathText>{R.tip}</MathText>
                  </p>
                )}
              </div>
            )}
            <div hidden={Boolean(R)} className="di-step__live">
              {d.note && (
                <p className="di-step__note" data-di-note>
                  <b>✓</b> <MathText>{d.note}</MathText>
                </p>
              )}
              {d.note && d.tip && (
                <p className="di-tip" data-di-tip>
                  <b>💡 {TX.tip}</b> <MathText>{d.tip}</MathText>
                </p>
              )}
              <p className="di-step__prompt">
                {step && d.steps > 1 && <small>{TX.depot.step(d.stepIndex + 1, d.steps)}</small>}
                {!step ? W.done : d.busy ? lesson.text.busy : step.prompt}
              </p>
              {!d.busy && step && (
                <div className="di-step__row">
                  {step.type === 'choose' && (
                    <div className="di-opts" dir="ltr">
                      {step.options.map((op) => (
                        <button
                          key={op.v}
                          type="button"
                          className={`di-opt ${picked.includes(op.v) ? 'is-on' : ''}`}
                          onClick={() => choose(op.v)}
                          data-di-opt={op.v}
                        >
                          <strong>{op.label}</strong>
                          <small>{op.sub}</small>
                        </button>
                      ))}
                    </div>
                  )}
                  {step.type === 'number' && (
                    <PaperGate
                      key={`${d.index}-${d.stepIndex}`}
                      tip={PT.tipCompute}
                      onModel={
                        step.div
                          ? () => {
                              game.markHelped();
                              setModel(twin(step.div[0], step.div[1]));
                            }
                          : undefined
                      }
                    >
                      <div className="di-template di-template--case" dir="ltr">
                        {step.tokens.map((t, i) =>
                          typeof t === 'string' ? (
                            <span key={`${t}-${i}`}>{t}</span>
                          ) : (
                            <label key={t.slot}>
                              <Num
                                value={vals[t.slot] ?? ''}
                                onChange={(v) => setVals((x) => ({ ...x, [t.slot]: v }))}
                                w={t.w}
                                aria-label={t.label}
                                autoFocus={t === slots[0]}
                                data-di-slot={t.slot}
                              />
                              <small>{t.label}</small>
                            </label>
                          ),
                        )}
                      </div>
                      <button type="submit" className="di-btn di-btn--primary" disabled={!ready} data-di-case-check>
                        {TX.depot.check}
                      </button>
                    </PaperGate>
                  )}
                  {step.pick === 2 && (
                    <button type="submit" className="di-btn di-btn--primary" disabled={!ready} data-di-case-check>
                      {TX.depot.pack}
                    </button>
                  )}
                </div>
              )}
            </div>
            {model && <PaperModel a={model.a} b={model.b} onClose={() => setModel(null)} />}
          </Fit>
        </form>
      )}
    </>
  );
}

/** After a wrong step of a case: what the answer PRODUCED (never the answer), the rule when lost, and « try again ». */
function CaseGuide({ o, game }) {
  const t = useLesson().rules[o.key];
  return (
    <Card wide>
      <p className="di-card__eyebrow">{TX.depot.guide}</p>
      <h2 className="di-guide__q">{o.prompt}</h2>
      <div className="di-guide" data-di-case-guide>
        <div className="is-leaves">
          <b>✗</b>
          <div>
            <p>
              <MathText>{o.text}</MathText>
            </p>
          </div>
        </div>
      </div>
      {o.lost && (
        <div className="di-guide__rule" data-di-guide-rule>
          <p className="di-card__eyebrow">{KT.practice.lost}</p>
          <div className="di-map__rule">
            <strong>
              {t.icon} {t.title}
            </strong>
            <p>
              <MathText>{t.lines[0]}</MathText>
            </p>
            <M>{t.math[0]}</M>
          </div>
        </div>
      )}
      <div className="di-row">
        <button
          type="button"
          className="di-btn di-btn--primary"
          onClick={() => game.resumeCase()}
          data-di-case-retry
          autoFocus
        >
          {TX.depot.retry}
        </button>
        {!o.lost && (
          <button type="button" className="di-link" onClick={() => game.showRule(o.key)} data-di-remind>
            <Lightbulb size={15} /> {KT.practice.remind}
          </button>
        )}
      </div>
    </Card>
  );
}

function Statues({ game }) {
  const T = game.T;
  const STATUES = game.story.statues;
  // every sentence starts written the wrong way round
  const [order, setOrder] = useState(() => STATUES.sentences.map((x) => !x.smallFirst));
  const [res, setRes] = useState(null);
  const flip = (i) => {
    setRes(null);
    setOrder((o) => o.map((v, k) => (k === i ? !v : v)));
  };
  const firstWrong = res ? res.findIndex((ok) => !ok) : -1;
  return (
    <Card wide>
      <p className="di-card__eyebrow">{T.statues.title}</p>
      <p className="di-fact">
        {T.statues.fact} <M>{`${STATUES.big} = ${STATUES.small} \\times ${STATUES.q}`}</M>
      </p>
      <p className="di-dim">{T.statues.ask}</p>
      <div className="di-sentences">
        {STATUES.sentences.map((st, i) => {
          const [x, y] = order[i] ? [STATUES.small, STATUES.big] : [STATUES.big, STATUES.small];
          return (
            <button
              key={st.id}
              type="button"
              className={`di-sentence ${res ? (res[i] ? 'is-ok' : 'is-ko') : ''}`}
              onClick={() => flip(i)}
              data-di-sentence={st.id}
            >
              <b dir="ltr">{x}</b>
              <span>{st.mid}</span>
              <b dir="ltr">{y}</b>
              <i aria-hidden="true">⇄</i>
            </button>
          );
        })}
      </div>
      {firstWrong >= 0 && <p className="di-feedback">{T.statues.hint[STATUES.sentences[firstWrong].id]}</p>}
      <div className="di-row">
        <button
          type="button"
          className="di-btn di-btn--primary"
          onClick={() => setRes(game.submitStatues(order))}
          data-di-check
        >
          {T.statues.go}
        </button>
        <button type="button" className="di-link" onClick={() => game.closeOverlay()}>
          {T.workshop.close}
        </button>
      </div>
    </Card>
  );
}

/**
 * The store of the last bridge. The mission is written at the top and never leaves; three steps: choose a mould and compute,
 * watch the world build it, pay. A mould already tried shows what it left, and the store writes what the world said after
 * the last one that left cells (`o.said`, the story's `say.bossFail`): its bubble is under the store's veil.
 * The compute step: the Euclidean division of the gap « a = b × [ ] + [ ] » — or, when the story announces the gap by a
 * LABEL (`boss.label: { text, tex, sign? }`, « 2³ × 3² × 7 »), the label in place of a and ONE box, the number of planks
 * « 2³ × 3² × 7 = 36 × [ ] » (`game.bossCount`): a is never printed, and no long division of a is offered as a model.
 */
export function Boss({ o, game }) {
  const T = game.T;
  // the gap, the two moulds and the price are THE LESSON'S (its story): nothing of them is written in this screen
  const { a, boss } = game.bossSeg;
  const label = boss.label ?? null;
  const [q, setQ] = useState('');
  const [r, setR] = useState('');
  const [cost, setCost] = useState('');
  const [err, setErr] = useState(null);
  const [model, setModel] = useState(null);
  const step = o.view === 'cost' ? 2 : 0;
  const submit = (e) => {
    e.preventDefault();
    if (o.view === 'cost') {
      if (cost === '' || !game.bossCost(Number(cost))) setErr(T.boss.err.cost(cost === '' ? '…' : cost));
      return;
    }
    if (label) {
      const st = q === '' ? 'nan' : game.bossCount(o.b, Number(q));
      if (st === 'long') setErr(T.boss.err.long(o.b, Number(q)));
      else if (st === 'short') setErr(T.boss.err.short(o.b, Number(q)));
      else if (st === 'nan') setErr(T.boss.err.count);
      return;
    }
    if (q === '' || r === '') {
      setErr(T.boss.err.nan);
      return;
    }
    const st = game.bossDivision(o.b, Number(q), Number(r));
    if (st === 'long') setErr(T.boss.err.long(o.b, Number(q)));
    else if (st === 'sum') setErr(T.boss.err.sum(o.b, Number(q), Number(r)));
    else if (st === 'big') setErr(T.boss.err.big(o.b, Number(r)));
    else if (st !== 'ok') setErr(T.boss.err.nan);
  };
  return (
    <Card wide>
      <p className="di-card__eyebrow">{T.boss.title}</p>
      <p className="di-fact" data-di-boss-mission>
        {T.boss.mission}
      </p>
      <ol className="di-bsteps">
        {T.boss.steps.map((label, i) => (
          <li key={label} className={i === step ? 'is-now' : i < step ? 'is-done' : ''}>
            <b>{i + 1}</b>
            {label}
          </li>
        ))}
      </ol>

      {o.view === 'choose' && (
        <>
          <h2>{T.boss.choose}</h2>
          <div className="di-moulds" dir="ltr">
            {boss.options.map((b) => {
              const left = o.tried?.[b];
              return (
                <button
                  key={b}
                  type="button"
                  className={`di-mouldcard ${left != null ? 'is-tried' : ''}`}
                  onClick={() => game.bossPick(b)}
                  data-di-mould={b}
                >
                  <strong>{b}</strong>
                  <span>{T.boss.mould(b)}</span>
                  <em>
                    {left == null
                      ? T.boss.untried
                      : `✗ ${typeof left === 'object' ? (left.purse ? T.boss.triedPurse(left.laid, left.need) : T.boss.triedMark(left.mark)) : T.boss.tried(left)}`}
                  </em>
                </button>
              );
            })}
          </div>
          {o.said && (
            // what the world said when his last plank left cells — the fact and the nudge, in the story's own words
            <p className="di-fact di-boss-said" data-di-boss-said>
              <MathText>{o.said}</MathText>
            </p>
          )}
          <p className="di-dim">{T.boss.price}</p>
          <div className="di-row">
            <button type="button" className="di-link" onClick={() => game.closeOverlay()}>
              {T.boss.close}
            </button>
          </div>
        </>
      )}

      {o.view !== 'choose' && (
        <form onSubmit={submit}>
          {o.view === 'divide' && label ? (
            <>
              <h2>{T.boss.divide(o.b)}</h2>
              <PaperGate tip={PT.tipCompute}>
                <div className="di-template" dir="ltr" data-di-boss-count>
                  <span data-di-boss-label>
                    <M>{label.tex}</M>
                  </span>
                  <span>=</span>
                  <span>{o.b}</span>
                  <span>×</span>
                  <label>
                    <Num
                      value={q}
                      onChange={(v) => {
                        setQ(v);
                        setErr(null);
                      }}
                      w={2}
                      autoFocus
                      aria-label={T.boss.qLabel}
                      data-di-q
                    />
                    <small>{T.boss.qLabel}</small>
                  </label>
                </div>
              </PaperGate>
            </>
          ) : o.view === 'divide' ? (
            <>
              <h2>{T.boss.divide(o.b)}</h2>
              <PaperGate tip={PT.tipDivision} onModel={() => setModel(twin(a, o.b))}>
                <div className="di-template" dir="ltr">
                  <span data-di-boss-a>{formatFr(a)}</span>
                  <span>=</span>
                  <span>{o.b}</span>
                  <span>×</span>
                  <label>
                    <Num
                      value={q}
                      onChange={(v) => {
                        setQ(v);
                        setErr(null);
                      }}
                      w={2}
                      autoFocus
                      aria-label={T.boss.qLabel}
                      data-di-q
                    />
                    <small>{T.boss.qLabel}</small>
                  </label>
                  <span>+</span>
                  <label>
                    <Num
                      value={r}
                      onChange={(v) => {
                        setR(v);
                        setErr(null);
                      }}
                      w={2}
                      aria-label={T.boss.rLabel}
                      data-di-r
                    />
                    <small>{T.boss.rLabel}</small>
                  </label>
                </div>
              </PaperGate>
            </>
          ) : (
            <>
              <h2>{T.boss.costAsk(o.b, o.q)}</h2>
              <PaperGate tip={PT.tipCompute}>
                <div className="di-template" dir="ltr">
                  <span>{o.q}</span>
                  <span>×</span>
                  <span data-di-boss-price>{boss.price}</span>
                  <span>=</span>
                  <Num
                    value={cost}
                    onChange={(v) => {
                      setCost(v);
                      setErr(null);
                    }}
                    w={5}
                    autoFocus
                    aria-label={T.a11y.amount}
                    data-di-cost
                  />
                  {T.boss.unit && <span>{T.boss.unit}</span>}
                </div>
              </PaperGate>
            </>
          )}
          {model && <PaperModel a={model.a} b={model.b} onClose={() => setModel(null)} />}
          {err && (
            <p className="di-feedback" data-di-boss-error>
              <MathText>{err}</MathText>
            </p>
          )}
          <div className="di-row">
            <button type="submit" className="di-btn di-btn--primary" data-di-check>
              {o.view === 'cost' ? T.boss.pay : T.boss.forge}
            </button>
            {o.view === 'divide' && (
              <button type="button" className="di-link" onClick={() => game.bossBack()} data-di-boss-back>
                {T.boss.change}
              </button>
            )}
            <button type="button" className="di-link" onClick={() => game.closeOverlay()} data-di-boss-close>
              {T.boss.close}
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}

/** What the world shows in the middle while the student plays: its objective, what the robot remembers, the equation, the verdict. */
function Hud({ s }) {
  return (
    <>
      {/* the instruction of the moment stays until it is done — he may fold it (owner, 2026-11-19) */}
      {s.objective && <Instruction key={s.objective} text={s.objective} compact={Boolean(s.equation)} />}
      {s.purse && (
        <div className={`di-purse ${s.purse.left === 0 ? 'is-empty' : ''}`} data-di-purse={s.purse.left}>
          <Coins size={18} aria-hidden="true" />
          <span>{s.purse.n === 1 ? T.purse.one : T.purse.label}</span>
          <b dir="ltr">
            {s.purse.left}
            {'\u00a0/\u00a0'}
            {s.purse.of}
          </b>
        </div>
      )}
      {s.sign && (
        <div className="di-sign" data-di-sign={s.sign.chain.map((c) => c.join('/')).join('=')}>
          <span>{T.mark.sign}</span>
          <M>{signTex(s.sign.chain, s.sign.strokes)}</M>
        </div>
      )}
      {s.pinned && !s.equation && (
        <div className="di-pinned">
          <span>🧠</span>
          <M>{s.pinned}</M>
        </div>
      )}
      {s.equation && <Equation eq={s.equation} />}
      {s.equation && s.verdict && <Verdict v={s.verdict} />}
    </>
  );
}

/** What this world gives the kit's shell (`kit/LessonWorld.jsx` lists every field). */
const WORLD = {
  id: 'divisor-isles',
  Game: DivisorIslesGame,
  devHandles: { __cases: { answerOf } },
  playing: (s) => (s.phase === 'play' || s.phase === 'forge' || s.phase === 'dialog') && !s.dash && !s.depot,
  busy: (s) => Boolean(s.dash || s.depot),
  quiet: (s) => s.dash?.mode === 'practice' || Boolean(s.depot),
  // a calculation step of the depot or the store of the last bridge is written work
  paperOn: (s) =>
    (s.overlay?.type === 'boss' && s.overlay.view !== 'choose') ||
    Boolean(s.depot && s.phase === 'depot' && !s.depot.busy && s.depot.step?.type === 'number'),
  held: (s) => (s.held != null ? T.hud.held(s.held) : null),
  Hud,
  Under: ({ s, game }) =>
    s.dash ? (
      <DashHud dash={s.dash} game={game} paused={s.phase !== 'dash'} />
    ) : !s.overlay && (s.phase === 'play' || s.phase === 'dialog' || s.phase === 'forge') ? (
      <Recall lines={s.recall} />
    ) : null,
  Over: ({ s, game }) =>
    s.mission ? (
      // a mission is DATA, played by the missions' engine
      createElement(MissionRunner, {
        key: s.mission.id,
        situation: s.mission,
        world: {
          run: (spec, opts) => game.missionRun(spec, opts),
          stock: (a, b) => game.missionStock(a, b),
          cheer: (big) => game.missionCheer(big),
        },
        onClose: () => game.leaveMission(),
      })
    ) : s.depot ? (
      <DepotHud d={s.depot} eq={s.equation} game={game} paused={s.phase !== 'depot'} />
    ) : null,
  overlay(o, s, game) {
    switch (o.type) {
      case 'predict':
        return <Predict o={o} game={game} />;
      case 'quiz':
        return <Quiz key={o.id} o={o} game={game} />;
      case 'forge':
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
      case 'statues':
        return <Statues game={game} />;
      case 'workshop':
        return <Workshop o={o} game={game} />;
      case 'boss':
        return <Boss key={`${o.view}-${o.b ?? ''}`} o={o} game={game} />;
      default:
        return null;
    }
  },
  guide(o, s, game) {
    if (o.type === 'caseGuide') return <CaseGuide o={o} game={game} />;
    return o.type === 'guide' ? <Guide o={o} game={game} /> : null;
  },
};

/** The world names no lesson: `LessonGameWorld` hands it the content of the lesson being played (its pack). */
/** What the shell needs to know of the STORY being played: how many islands, how many stars, its title and its end. */
function worldOf(lesson) {
  const { islands, segments, text = {} } = lesson.story;
  return {
    ...WORLD,
    stages: islands.length,
    maxStars: segments.length * 3,
    text: {
      title: text.title ?? T.title,
      subtitle: text.subtitle ?? T.subtitle,
      turn: T.turn.body,
      end: { ...T.end, ...text.end },
    },
  };
}

export default function DivisorIsles({ lesson, ...props }) {
  const world = useMemo(() => worldOf(lesson), [lesson]);
  return <LessonWorld world={world} lesson={lesson} {...props} />;
}
