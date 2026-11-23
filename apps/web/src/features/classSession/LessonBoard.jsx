/**
 * « séance en classe » — the LESSON ON THE BOARD (owner, 2026-11-18: the during-the-lesson classroom mode, rebuilt from zero;
 * CLASS_SESSION.md §5ter). One board, one mouse, a whole class — and the platform's method, moved to the board:
 *   the class ACTS first (it chooses a gap and a plank, predicts, the board builds), it CONCLUDES itself (it writes its rule
 *   with two tiles; the board runs it on the class's own bridges, then attacks it with a new gap), and only a rule that
 *   survived gets its NAME — read aloud by a student the teacher picks, or by the teacher.
 * The script of the hour is data (`lessonScripts.js`); this file draws each kind of step. An adult's tool: every step can
 * be reached from the rail, nothing is ever locked, the footer whispers one oral question, the board tools (class, pen,
 * pointer, curtain, timer) are the same on every screen. Nothing scrolls; nothing here is a student's progress.
 */
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import {
  Brain,
  Check,
  FlaskConical,
  KeyRound,
  Minus,
  NotebookPen,
  Plus,
  Presentation,
  RotateCcw,
  Star,
  Swords,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import MathText from '../../lessons/common/components/MathText';
import { ArrowBack, ArrowForward } from '../../components/common/DirectionalIcons';

// the lesson's game world (three.js): its own chunk, loaded only when a mission is opened on the board
const LessonGameWorld = lazy(() => import('../../lessons/common/gameworld/LessonGameWorld'));
import { playSfx } from '../../lessons/common/utils/playEffect';
import {
  QUANTITIES,
  CONDITIONS,
  outcome,
  runOnEvidence,
  attacks,
  isTheRule,
  ruleSays,
} from '../../lessons/common/gameworld/divisorIsles/ruleForge';
import { Court, CourtMini } from '../../lessons/common/gameworld/rootCourts/courtParts';
import BoardBridge, { BridgeBar, buildMs } from './BoardBridge';
import LadderStation from './LadderStation';
import { ClassWindow, Speaker, BoardTools, BoardLayers, useBoardTools, BL } from './board';
import { callName, teamsOf, teamOfStudent } from './session';
import WorldLoading from '../../lessons/common/gameworld/WorldLoading';
import {
  groupsOf,
  classLog,
  readyToConclude,
  missingEvidence,
  classExplain,
  classRuleText,
  equalityOf,
  leftCells,
  cellsOf,
  proofOf,
  blanks,
  FORMS,
  askRight,
  askWords,
  courtCards,
  courtRodTex,
  courtShown,
  courtWords,
  denseTablet,
} from './lessonScripts';

const LL = {
  openMission: 'Ouvrir la mission au tableau',
  exit: 'Quitter',
  prev: 'Précédent',
  next: 'Suivant',
  toForge: 'On conclut',
  toName: 'On lui donne son nom',
  toEnd: 'Test de fin',
  cue: 'Question à l’oral',
  key: (k, n) => `Clé ${k} sur ${n}`,
  turn: 'Au tableau',
  reads: 'Lecture par',
  tryPlank: (b) => `On essaie la planche de ${b}`,
  held: 'Le pont tient !',
  fell: 'Le pont s’effondre',
  again: 'Recommencer',
  gap: 'Longueur du fossé',
  plank: 'Longueur de la planche',
  suggest: 'Suggestions',
  predict: 'La classe prévoit :',
  holds: 'Il tient',
  falls: 'Il s’effondre',
  noPredict: 'Construire sans prévoir',
  building: 'On construit…',
  predRight: 'La classe avait bien prévu',
  predOff: 'Ce n’est pas ce que nous avions prévu : pourquoi ?',
  another: 'Un autre pont',
  log: 'Les ponts de la classe',
  logEmpty: 'Chaque pont que la classe construit s’inscrit ici.',
  miss: {
    held: 'Il nous faut un pont qui tient.',
    fell: 'Il nous faut un pont qui s’effondre.',
    more: 'Encore un ou deux ponts, puis on conclut.',
    ready: 'Nous en avons assez pour conclure.',
  },
  cols: ['Fossé', 'Planche', 'Planches posées', 'Cases restantes', 'Le pont', 'Notre règle'],
  heldShort: 'Tient',
  fellShort: 'S’effondre',
  noLog: 'Aucun pont pour l’instant : la classe essaie d’abord.',
  backToLab: 'Retour à l’expérience',
  few: 'La classe a peu de ponts : il en faut au moins un qui tient et un qui s’effondre.',
  write: 'La classe écrit sa règle',
  when: 'Le pont tient quand :',
  hole: '……',
  test: 'On teste notre règle',
  clash: (m) =>
    `Notre règle dit que le pont (fossé de ${m.a}, planche de ${m.b}) ${m.says ? 'tient' : 's’effondre'}, mais il ${m.held ? 'a tenu' : 's’est effondré'}. On corrige notre règle.`,
  broke: (c) =>
    `Notre règle n’a pas résisté à un fossé de ${cellsOf(c.a)} et une planche de ${c.b} : ce pont rejoint les ponts de la classe.`,
  noAttack:
    'Notre règle s’accorde avec nos ponts, mais ce n’est pas la plus simple : on essaie d’autres ponts, puis on recommence.',
  agree: 'Notre règle s’accorde avec tous les ponts de la classe.',
  attack: (c) => `Le tableau met notre règle à l’épreuve : un fossé de ${cellsOf(c.a)} et une planche de ${c.b}.`,
  attackBuild: 'On construit pour voir',
  survived: 'Notre règle a tenu !',
  broken: 'Ici, notre règle n’a pas tenu.',
  nextAttack: 'Une autre épreuve',
  fix: 'On corrige notre règle',
  seal: 'On valide notre règle',
  sealed: 'La règle de la classe a tenu',
  sealedSub: (n, k) =>
    `Elle s’accorde avec ${n} ${n <= 1 ? 'pont' : 'ponts'} de la classe et a résisté à ${k <= 1 ? 'une épreuve' : `${k} épreuves`} du tableau.`,
  rewrite: 'La réécrire',
  ours: 'La règle de la classe, qui a tenu',
  theirs: 'Son nom en mathématiques :',
  pick: 'Choisir un lecteur',
  pickTitle: 'Qui lit ? Cliquez sur sa table.',
  pickBoard: 'Qui vient au tableau ? Cliquez sur sa table.',
  me: 'Je la lis moi-même',
  recall: 'Qui s’en souvient ?',
  check: 'On vérifie avec les ponts',
  askRight: 'La classe a trouvé.',
  askLook: 'Regardons les ponts.',
  true: 'Vrai',
  false: 'Faux',
  copy: 'On recopie dans le cahier',
  teacher: BL.teacher,
};
const sfx = (name) => playSfx(name, { enabled: true });
const fast = () => typeof window !== 'undefined' && Boolean(window.__classFast);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
/** The colours of the game's formulas are made for a dark world: on the light board they become readable ones. */
const calm = (m) =>
  m.replaceAll('#34d399', '#047857').replaceAll('#fb7185', '#be123c').replaceAll('#fbbf24', '#b45309');
/** Timers that die with the screen: a bridge being built never fires on a step the class has left. */
function useLater() {
  const ids = useRef([]);
  useEffect(() => () => ids.current.forEach(clearTimeout), []);
  return (fn, ms) => {
    ids.current.push(setTimeout(fn, ms));
  };
}

/** What the board remembers of the hour while the teacher moves between screens (kept for the browser tab, never sent). */
export const EMPTY_MEMO = { step: 0, log: [], stars: 0, preds: 0, rule: null, sealed: false, readers: [] };

/**
 * A MISSION ON THE BOARD (the last lesson of a unit, INTEGRATION_LESSON_PLAN.md): the station says what the class needs
 * — paper, pen, the minutes — and opens the lesson's OWN world on that mission, over the whole window, as a preview
 * (nothing is recorded). The class solves on paper; the board asks, builds what one student types and answers a wrong
 * value by its fact. Leaving the mission comes back to this station.
 */
function MissionStation({ step }) {
  const [open, setOpen] = useState(false);
  const board = useMemo(() => ({ mission: step.mission, onLeave: () => setOpen(false) }), [step.mission]);
  // the world's own « ✕ » and « Quitter l’aperçu » lead to `#board`: the hash closes the world, then is cleared
  useEffect(() => {
    if (!open) return undefined;
    const close = () => {
      if (window.location.hash !== '#board') return;
      setOpen(false);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    };
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, [open]);
  return (
    <div className="cs-sit cs-mission" data-cs-mission={step.mission}>
      <p className="cs-say">
        <MathText>{step.text}</MathText>
      </p>
      <ul className="cs-mission__needs">
        {step.needs.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <div className="cs-actrow">
        <p className="cs-quest">{step.question}</p>
        <button type="button" className="cs-btn cs-btn--big" onClick={() => setOpen(true)} data-cs-mission-open>
          <Presentation size={22} aria-hidden="true" /> {LL.openMission}
        </button>
      </div>
      {open && (
        <Suspense fallback={<WorldLoading lessonId={step.lesson} title={step.title} />}>
          <LessonGameWorld
            worldId={step.world}
            config={{ id: step.lesson, title: step.title, modules: [] }}
            basePath=""
            exitTo="#board"
            completedModules={[]}
            board={board}
            preview
          />
        </Suspense>
      )}
    </div>
  );
}

function Situation({ step }) {
  const c = useMemo(() => outcome(step.bridge.a, step.bridge.b), [step]);
  const [stage, setStage] = useState('ask');
  const later = useLater();
  const build = () => {
    setStage('build');
    later(() => {
      setStage('done');
      sfx(c.held ? 'correct' : 'notyet');
    }, buildMs(c).total);
  };
  return (
    <div className="cs-sit">
      <p className="cs-say">
        <MathText>{step.text}</MathText>
      </p>
      <div className="cs-bridgebox">
        <BoardBridge c={c} stage={stage} kid={1} />
      </div>
      <div className="cs-actrow">
        <p className="cs-quest">{step.question}</p>
        {stage === 'ask' && (
          <button type="button" className="cs-btn cs-btn--big" onClick={build} data-cs-sit-try>
            {LL.tryPlank(c.b)}
          </button>
        )}
        {stage === 'done' && (
          <p className={`cs-verdict ${c.held ? 'is-held' : 'is-fell'}`} data-cs-verdict={c.held ? 'held' : 'fell'}>
            <b>{c.held ? LL.held : `${LL.fell} : ${leftCells(c.r)}.`}</b>
            <button type="button" className="cs-btn" onClick={() => setStage('ask')} data-cs-sit-again>
              <RotateCcw size={18} /> {LL.again}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

const Stepper = ({ label, value, onStep, k, disabled }) => (
  <label className="cs-bigstep" data-cs-stepper={k}>
    <span>{label}</span>
    <span>
      <button type="button" onClick={() => onStep(-1)} disabled={disabled} aria-label="−" data-cs-minus={k}>
        <Minus size={24} strokeWidth={3} />
      </button>
      <b dir="ltr" data-cs-value={k}>
        {value}
      </b>
      <button type="button" onClick={() => onStep(1)} disabled={disabled} aria-label="+" data-cs-plus={k}>
        <Plus size={24} strokeWidth={3} />
      </button>
    </span>
  </label>
);

/** The class EXPERIMENTS: a gap, a plank, a prediction — then the board builds, and the bridge joins the class's evidence. */
function Bridges({ step, memo, patch }) {
  const [a, setA] = useState(step.suggest[0].a);
  const [b, setB] = useState(step.suggest[0].b);
  const [stage, setStage] = useState('ask');
  const [pred, setPred] = useState(null);
  const later = useLater();
  const c = outcome(a, b);
  const busy = stage === 'build';
  const miss = missingEvidence(memo.log);
  const set = (na, nb) => {
    if (busy) return;
    const A = clamp(na, 4, 60);
    setA(A);
    setB(clamp(nb, 1, Math.min(12, A)));
    setStage('ask');
    setPred(null);
  };
  const build = (p) => {
    if (stage !== 'ask') return;
    const now = outcome(a, b);
    setPred(p);
    setStage('build');
    later(() => {
      setStage('done');
      sfx(now.held ? 'correct' : 'notyet');
      patch((m) => ({
        log: classLog(m.log, now),
        preds: m.preds + (p === null ? 0 : 1),
        stars: m.stars + (p !== null && p === now.held ? 1 : 0),
      }));
    }, buildMs(now).total);
  };
  return (
    <div className="cs-lab">
      <section className="cs-lab__main">
        <div className="cs-lab__ctl">
          <Stepper label={LL.gap} value={a} onStep={(d) => set(a + d, b)} k="a" disabled={busy} />
          <Stepper label={LL.plank} value={b} onStep={(d) => set(a, b + d)} k="b" disabled={busy} />
        </div>
        <div className="cs-bridgebox">
          <BoardBridge c={c} stage={stage} kid={memo.log.length} />
        </div>
        <div className="cs-actrow" data-cs-lab-stage={stage}>
          {stage === 'ask' && (
            <>
              <strong className="cs-quest">{LL.predict}</strong>
              <button type="button" className="cs-predict is-hold" onClick={() => build(true)} data-cs-predict="held">
                {LL.holds}
              </button>
              <button type="button" className="cs-predict is-fall" onClick={() => build(false)} data-cs-predict="fell">
                {LL.falls}
              </button>
              <button type="button" className="cs-link" onClick={() => build(null)} data-cs-predict="none">
                {LL.noPredict}
              </button>
            </>
          )}
          {stage === 'build' && <strong className="cs-quest cs-building">{LL.building}</strong>}
          {stage === 'done' && (
            <p className={`cs-verdict ${c.held ? 'is-held' : 'is-fell'}`} data-cs-verdict={c.held ? 'held' : 'fell'}>
              <b>{c.held ? LL.held : `${LL.fell} : ${leftCells(c.r)}.`}</b>
              <span dir="ltr" data-cs-equality>
                <MathText>{`$${equalityOf(c)}$`}</MathText>
              </span>
              {pred !== null && (
                <em className={pred === c.held ? 'is-star' : ''} data-cs-pred={pred === c.held ? 'right' : 'off'}>
                  {pred === c.held ? (
                    <>
                      <Star size={20} fill="currentColor" /> {LL.predRight}
                    </>
                  ) : (
                    LL.predOff
                  )}
                </em>
              )}
              <button
                type="button"
                className="cs-btn cs-btn--main"
                onClick={() => {
                  setStage('ask');
                  setPred(null);
                }}
                data-cs-another
              >
                {LL.another}
              </button>
            </p>
          )}
        </div>
      </section>
      <aside className="cs-log" data-cs-log={memo.log.length}>
        {/* bridges that lead somewhere; the class is free to try any other */}
        <div className="cs-suggest">
          <small>{LL.suggest}</small>
          <span>
            {step.suggest.map((s) => (
              <button
                key={`${s.a}:${s.b}`}
                type="button"
                className={`${memo.log.some((x) => x.a === s.a && x.b === s.b) ? 'is-done' : ''} ${s.a === a && s.b === b ? 'is-on' : ''}`}
                onClick={() => set(s.a, s.b)}
                disabled={busy}
                data-cs-suggest={`${s.a}:${s.b}`}
              >
                <b>{s.a}</b>
                <i>·</i>
                <b>{s.b}</b>
              </button>
            ))}
          </span>
        </div>
        <h3>
          {LL.log}
          <span className="cs-starcount" data-cs-stars={memo.stars}>
            <Star size={18} fill="currentColor" /> {memo.stars}
          </span>
        </h3>
        {memo.log.length === 0 ? (
          <p className="cs-hint">{LL.logEmpty}</p>
        ) : (
          <ol>
            {memo.log.map((x) => (
              <li key={`${x.a}:${x.b}`} className={x.held ? 'is-held' : 'is-fell'} data-cs-log-row={`${x.a}:${x.b}`}>
                <span dir="ltr">
                  <b>{x.a}</b>
                  <i>·</i>
                  <b>{x.b}</b>
                </span>
                <BridgeBar c={x} />
                <em>{x.held ? LL.heldShort : LL.fellShort}</em>
              </li>
            ))}
          </ol>
        )}
        <p className={`cs-ready ${miss ? '' : 'is-ready'}`} data-cs-ready={miss ?? 'yes'}>
          {LL.miss[miss ?? 'ready']}
        </p>
      </aside>
    </div>
  );
}

/**
 * The class CONCLUDES. Its bridges are a table (planks laid, cells left, held or not); it writes a rule with two tiles; the
 * board runs the rule on every line, then attacks it with a gap the class has not built. A rule that breaks goes back to the
 * class with the bridge that broke it; the rule that survives is sealed — and only then gets its name, on the next screen.
 */
function Forge({ memo, patch, goBack }) {
  const rows = memo.log;
  const [q, setQ] = useState(memo.rule?.q ?? null);
  const [cnd, setCnd] = useState(memo.rule?.c ?? null);
  const [phase, setPhase] = useState(memo.sealed ? 'sealed' : 'write');
  const [run, setRun] = useState(null);
  const [atk, setAtk] = useState({ list: [], k: 0, stage: 'ask' });
  const [broke, setBroke] = useState(null);
  const later = useLater();
  const rule = q && cnd ? { q, c: cnd } : null;
  const locked = phase !== 'write';
  const Q = QUANTITIES.find((x) => x.id === q);
  const C = CONDITIONS.find((x) => x.id === cnd);
  const choose = (kind, id) => {
    if (locked) return;
    if (kind === 'q') setQ(id);
    else setCnd(id);
    setRun(null);
    setBroke(null);
  };
  const finish = (r, n) => {
    if (isTheRule(r)) {
      patch({ rule: r, sealed: true, attacks: n });
      setPhase('sealed');
      sfx('win');
    } else {
      setBroke({ none: true });
      setPhase('write');
    }
  };
  const test = () => {
    if (!rule || rows.length === 0 || locked) return;
    const res = runOnEvidence(rule, rows);
    const r = rule;
    setRun(res);
    setBroke(null);
    setPhase('run');
    later(
      () => {
        if (res.bad >= 0) {
          sfx('notyet');
          setPhase('write');
          return;
        }
        const list = attacks(r, rows);
        if (list.length === 0) {
          finish(r, 0);
          return;
        }
        setAtk({ list, k: 0, stage: 'ask' });
        setPhase('attack');
      },
      fast() ? 30 : rows.length * 260 + 700,
    );
  };
  const buildAttack = () => {
    const c = atk.list[atk.k];
    setAtk((s) => ({ ...s, stage: 'build' }));
    later(() => {
      setAtk((s) => ({ ...s, stage: 'done' }));
      sfx(c.held ? 'correct' : 'notyet');
    }, buildMs(c).total);
  };
  const afterAttack = () => {
    const c = atk.list[atk.k];
    if (ruleSays(rule, c.a, c.b) !== c.held) {
      patch((m) => ({ log: classLog(m.log, c) }));
      setBroke(c);
      setRun(null);
      setPhase('write');
      return;
    }
    if (atk.k + 1 < atk.list.length) setAtk((s) => ({ ...s, k: s.k + 1, stage: 'ask' }));
    else finish(rule, atk.list.length);
  };
  const rewrite = () => {
    patch({ sealed: false });
    setRun(null);
    setBroke(null);
    setPhase('write');
  };
  const c = phase === 'attack' ? atk.list[atk.k] : null;
  const says = c ? ruleSays(rule, c.a, c.b) : null;
  const bad = run && run.bad >= 0 ? run.marks[run.bad] : null;
  return (
    <div className="cs-forge" data-cs-forge={phase}>
      <section className="cs-forge__left">
        {c ? (
          <div className="cs-attack" data-cs-attack={`${c.a}:${c.b}`} data-cs-attack-stage={atk.stage}>
            <p className="cs-say cs-say--attack">
              <Swords size={28} /> {LL.attack(c)}
            </p>
            <div className="cs-bridgebox">
              <BoardBridge c={c} stage={atk.stage} kid={atk.k + 2} />
            </div>
            <p className="cs-explain" data-cs-explain>
              {classExplain(rule, c.a, c.b)}
            </p>
            <div className="cs-actrow">
              {atk.stage === 'ask' && (
                <button
                  type="button"
                  className="cs-btn cs-btn--main cs-btn--big"
                  onClick={buildAttack}
                  data-cs-attack-build
                >
                  {LL.attackBuild}
                </button>
              )}
              {atk.stage === 'build' && <strong className="cs-quest cs-building">{LL.building}</strong>}
              {atk.stage === 'done' && (
                <p
                  className={`cs-verdict ${says === c.held ? 'is-held' : 'is-fell'}`}
                  data-cs-attack-result={says === c.held ? 'survived' : 'broken'}
                >
                  <b>{says === c.held ? LL.survived : LL.broken}</b>
                  <span dir="ltr">
                    <MathText>{`$${equalityOf(c)}$`}</MathText>
                  </span>
                  <button type="button" className="cs-btn cs-btn--main" onClick={afterAttack} data-cs-attack-next>
                    {says !== c.held ? LL.fix : atk.k + 1 < atk.list.length ? LL.nextAttack : LL.seal}{' '}
                    <ArrowForward size={18} />
                  </button>
                </p>
              )}
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="cs-empty">
            <p>{LL.noLog}</p>
            <button type="button" className="cs-btn cs-btn--main cs-btn--big" onClick={goBack} data-cs-back-lab>
              <ArrowBack size={20} /> {LL.backToLab}
            </button>
          </div>
        ) : (
          <>
            <table className={`cs-evi ${run ? 'is-run' : ''}`} data-cs-evidence={rows.length}>
              <thead>
                <tr>
                  {LL.cols.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((x, k) => {
                  const m = run?.marks[k];
                  return (
                    <tr
                      key={`${x.a}:${x.b}`}
                      className={`${x.held ? 'is-held' : 'is-fell'} ${m ? (m.agrees ? 'is-agree' : 'is-clash') : ''}`}
                      style={m ? { '--d': `${fast() ? 0 : k * 260}ms` } : undefined}
                      data-cs-evi-row={`${x.a}:${x.b}`}
                    >
                      <td dir="ltr">{x.a}</td>
                      <td dir="ltr">{x.b}</td>
                      <td dir="ltr">{x.q}</td>
                      <td dir="ltr" className="cs-evi__r">
                        {x.r}
                      </td>
                      <td>
                        <em>{x.held ? LL.heldShort : LL.fellShort}</em>
                      </td>
                      <td className="cs-evi__rule" data-cs-mark={m ? (m.agrees ? 'agree' : 'clash') : ''}>
                        {m ? (
                          <span>
                            {m.says ? LL.holds : LL.falls}{' '}
                            {m.agrees ? <Check size={22} strokeWidth={3.5} /> : <X size={22} strokeWidth={3.5} />}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {phase === 'write' && bad && (
              <p className="cs-clash" role="status" data-cs-clash={`${bad.a}:${bad.b}`}>
                {LL.clash(bad)}
              </p>
            )}
            {phase === 'write' && broke && (
              <p className="cs-clash" role="status" data-cs-broke={broke.none ? 'none' : `${broke.a}:${broke.b}`}>
                {broke.none ? LL.noAttack : LL.broke(broke)}
              </p>
            )}
            {phase === 'write' && !bad && !broke && !readyToConclude(rows) && <p className="cs-warn">{LL.few}</p>}
            {phase === 'sealed' && <p className="cs-good">{LL.agree}</p>}
          </>
        )}
      </section>
      <aside className="cs-forge__right">
        {phase === 'sealed' ? (
          <div className="cs-sealed" data-cs-sealed>
            <i>
              <KeyRound size={44} />
            </i>
            <h3>{LL.sealed}</h3>
            <p className="cs-sentence">{classRuleText(memo.rule)}</p>
            <small>{LL.sealedSub(rows.length, memo.attacks ?? 2)}</small>
            <button type="button" className="cs-link" onClick={rewrite} data-cs-rewrite>
              <RotateCcw size={16} /> {LL.rewrite}
            </button>
          </div>
        ) : (
          <>
            <h3>{LL.write}</h3>
            <p className="cs-sentence" data-cs-rule-text>
              {LL.when} <b className={Q ? '' : 'is-hole'}>{Q?.label ?? LL.hole}</b>{' '}
              <b className={C ? '' : 'is-hole'}>{C?.label ?? LL.hole}</b>
            </p>
            <div className="cs-tiles">
              {QUANTITIES.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  className={q === x.id ? 'is-on' : ''}
                  onClick={() => choose('q', x.id)}
                  disabled={locked}
                  data-cs-tile-q={x.id}
                >
                  {x.label}
                </button>
              ))}
            </div>
            <div className="cs-tiles cs-tiles--c">
              {CONDITIONS.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  className={cnd === x.id ? 'is-on' : ''}
                  onClick={() => choose('c', x.id)}
                  disabled={locked}
                  data-cs-tile-c={x.id}
                >
                  {x.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="cs-btn cs-btn--main cs-btn--big"
              onClick={test}
              disabled={!rule || rows.length === 0 || locked}
              data-cs-forge-test
            >
              <FlaskConical size={22} /> {LL.test}
            </button>
          </>
        )}
      </aside>
    </div>
  );
}

/** The rule gets its NAME: the tablet of the lesson, read aloud. « Qui s’en souvient ? » hides its key words: the class says them. */
/** A chain of equalities (« 60 = 1 × 60 = 2 × 30 = … »): too wide for half a card, so it takes a row — counted in `=`, never in characters (colour macros inflate those). */
const isChain = (m) => (m.match(/=/g) ?? []).length >= 4;

function Name({ step, memo, onPick, onMe, rules }) {
  const t = rules[step.tablet];
  const [recall, setRecall] = useState(false);
  const [open, setOpen] = useState([]);
  const words = recall ? (step.recall ?? []) : [];
  const line = (text, id) =>
    blanks(text, words).map((p, k) => {
      const key = `${id}-${k}`;
      if (p.t === 'math') return <MathText key={key}>{p.v}</MathText>;
      if (p.t === 'text') return <span key={key}>{p.v}</span>;
      const seen = open.includes(key);
      return (
        <button
          key={key}
          type="button"
          className={`cs-blank ${seen ? 'is-open' : ''}`}
          onClick={() => setOpen((o) => (seen ? o : [...o, key]))}
          data-cs-blank={seen ? 'open' : 'hidden'}
        >
          {seen ? p.v : '?'}
        </button>
      );
    });
  return (
    <div className="cs-name" data-cs-name={step.tablet}>
      {step.forged && memo.sealed && memo.rule && (
        <p className="cs-ours" data-cs-ours>
          <small>{LL.ours}</small>
          <strong>{classRuleText(memo.rule)}</strong>
          <small>{LL.theirs}</small>
        </p>
      )}
      <div className="cs-name__card" data-dense={denseTablet(t) ? '' : undefined}>
        <div className="cs-name__lines">
          {t.lines.map((l, k) => (
            <p key={l}>{line(l, `l${k}`)}</p>
          ))}
          {t.list && (
            <ul>
              {t.list.map((l, k) => (
                <li key={l}>{line(l, `i${k}`)}</li>
              ))}
            </ul>
          )}
        </div>
        {/* an example and what it says stay together: the equality above its sentence */}
        {t.math.length === t.notes.length ? (
          <div className="cs-name__pairs" data-long={t.math.some(isChain) ? '' : undefined}>
            {t.math.map((m, k) => (
              <p key={m}>
                <span dir="ltr">
                  <MathText>{`$${calm(m)}$`}</MathText>
                </span>
                <small>{t.notes[k]}</small>
              </p>
            ))}
          </div>
        ) : (
          <>
            <div className="cs-name__math" dir="ltr">
              {t.math.map((m) => (
                <span key={m}>
                  <MathText>{`$${calm(m)}$`}</MathText>
                </span>
              ))}
            </div>
            <p className="cs-name__notes">{t.notes.join(' · ')}</p>
          </>
        )}
      </div>
      <div className="cs-name__acts">
        <button type="button" className="cs-btn cs-btn--big" onClick={onPick} data-cs-pick-reader>
          <Users size={20} /> {LL.pick}
        </button>
        <button type="button" className="cs-btn cs-btn--big" onClick={onMe} data-cs-read-myself>
          <UserRound size={20} /> {LL.me}
        </button>
        {step.recall?.length > 0 && (
          <button
            type="button"
            className={`cs-btn cs-btn--big ${recall ? 'is-on' : ''}`}
            onClick={() => {
              setRecall(!recall);
              setOpen([]);
            }}
            aria-pressed={recall}
            data-cs-recall
          >
            <Brain size={20} /> {LL.recall}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * One question, answered by the class and PROVED by bridges: every plank chosen or not is built in one line. A step whose
 * choices are not planks (bouquets, boxes…) names them with its own `words` ({ card, held, fell }); a missing word keeps
 * the board's default (« Planche », « Tient », « S’effondre »).
 */
function Ask({ step }) {
  const words = askWords(step);
  const [picked, setPicked] = useState([]);
  const [checked, setChecked] = useState(false);
  const single = step.answer.length === 1;
  const right = askRight(step, picked);
  const toggle = (o) => {
    if (!checked) setPicked((p) => (single ? [o] : p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));
  };
  return (
    <div className="cs-askstep" data-cs-ask={step.id} data-cs-ask-checked={checked}>
      <p className="cs-say">
        <MathText>{step.text}</MathText>
      </p>
      <p className="cs-quest">{step.question}</p>
      <div
        className="cs-planks"
        style={{ '--n': step.options.length }}
        data-many={step.options.length > 4 ? '' : undefined}
      >
        {step.options.map((o) => {
          const c = outcome(step.a, o);
          return (
            <button
              key={o}
              type="button"
              className={`cs-plankcard ${picked.includes(o) ? 'is-picked' : ''} ${checked ? (c.held ? 'is-held' : 'is-fell') : ''}`}
              onClick={() => toggle(o)}
              aria-pressed={picked.includes(o)}
              data-cs-ask-option={o}
            >
              <small>{words.card}</small>
              <b dir="ltr">{o}</b>
              {checked && (
                <>
                  <BridgeBar c={c} />
                  <span dir="ltr">
                    <MathText>{`$${equalityOf(c)}$`}</MathText>
                  </span>
                  <em>{c.held ? words.held : words.fell}</em>
                </>
              )}
            </button>
          );
        })}
      </div>
      <div className="cs-actrow">
        {!checked ? (
          <button
            type="button"
            className="cs-btn cs-btn--main cs-btn--big"
            onClick={() => {
              setChecked(true);
              sfx(right ? 'correct' : 'notyet');
            }}
            disabled={picked.length === 0}
            data-cs-ask-check
          >
            {LL.check}
          </button>
        ) : (
          <p className={`cs-after ${right ? 'is-right' : ''}`} data-cs-ask-result={right ? 'right' : 'look'}>
            <b>
              {right ? (
                <>
                  <Star size={20} fill="currentColor" /> {LL.askRight}
                </>
              ) : (
                LL.askLook
              )}
            </b>
            <span>
              <MathText>{step.after}</MathText>
            </span>
            <button
              type="button"
              className="cs-btn"
              onClick={() => {
                setChecked(false);
                setPicked([]);
              }}
              data-cs-ask-again
            >
              <RotateCcw size={18} /> {LL.again}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

/** How long the world takes to lower a platform into its court (`court.css`: 0.9 s, the tiles lit one after the other). */
const COURT_MS = 1150;

/**
 * A COURT of the `rootCourts` world on the board: ONE court drawn by the world's own `Court` (rootCourts/courtParts.jsx), and its
 * cards — rods over a court whose area is given, or courts under a rod that is given. A tap on a card holds its platform
 * over the court, dashed (the class predicts aloud); « Abaisser la plateforme » lowers it and the WORLD answers: it rides, it leaves
 * a band (amber), it jams (violet), the exact difference written beside the court — a fact, never « wrong ». Each card
 * lowered keeps its verdict; the proof (`after`) comes once the cards that ride were lowered (every card, when none does).
 */
function CourtStation({ step }) {
  const words = courtWords(step);
  const cards = useMemo(() => courtCards(step), [step]);
  const [sel, setSel] = useState(null);
  const [stage, setStage] = useState('ask');
  const [tried, setTried] = useState([]);
  const later = useLater();
  const card = cards.find((c) => c.key === sel) ?? null;
  const busy = stage === 'build';
  const shown = courtShown(step, tried);
  const pick = (c) => {
    if (busy) return;
    setSel(c.key);
    setStage('ask');
  };
  const lower = () => {
    if (!card || stage !== 'ask') return;
    setStage('build');
    later(
      () => {
        setStage('done');
        setTried((t) => (t.includes(card.key) ? t : [...t, card.key]));
        sfx(card.out.kind === 'ride' ? 'correct' : 'notyet');
      },
      fast() ? 40 : COURT_MS,
    );
  };
  return (
    <div className="cs-courtstep" data-cs-court={step.id} data-cs-court-shown={shown}>
      <p className="cs-say">
        <MathText>{step.text}</MathText>
      </p>
      <div className="cs-courtstep__main">
        <div className="cs-courtbox" data-cs-court-on={card?.key ?? ''} data-cs-court-stage={card ? stage : 'none'}>
          {card ? (
            <Court key={card.key} area={card.area} rod={card.rod} stage={stage} fast={fast()} />
          ) : step.areas ? (
            <p className="cs-courtbox__rod" data-cs-court-rod>
              <small>{words.rod}</small>
              <b dir="ltr">
                <MathText>{`$${courtRodTex(step)}$`}</MathText>
              </b>
            </p>
          ) : (
            <Court area={String(step.area)} fast={fast()} />
          )}
        </div>
        <div className="cs-rods" data-many={cards.length > 4 ? '' : undefined}>
          {cards.map((c) => {
            const seen = tried.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                className={`cs-rodcard ${sel === c.key ? 'is-on' : ''} ${seen ? `is-${c.out.kind}` : ''}`}
                onClick={() => pick(c)}
                disabled={busy}
                aria-pressed={sel === c.key}
                data-cs-court-card={c.key}
                data-cs-court-kind={seen ? c.out.kind : undefined}
              >
                <span className="cs-rodcard__name" data-frac={c.tex.includes('frac') ? '' : undefined}>
                  <small>{c.label}</small>
                  <b dir="ltr" data-long={c.tex.length > 7 ? '' : undefined}>
                    <MathText>{`$${c.tex}$`}</MathText>
                  </b>
                </span>
                {seen && (
                  <span className="cs-rodcard__out">
                    <CourtMini area={c.area} rod={c.rod} />
                    <em>{words[c.out.kind]}</em>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="cs-actrow">
        {shown ? (
          <p className="cs-after is-right" data-cs-court-after>
            <span>
              <MathText>{step.after}</MathText>
            </span>
          </p>
        ) : (
          <p className="cs-quest">{step.question}</p>
        )}
        <button
          type="button"
          className="cs-btn cs-btn--main cs-btn--big"
          onClick={lower}
          disabled={!card || stage !== 'ask'}
          data-cs-court-lower
        >
          {words.lower}
        </button>
      </div>
    </div>
  );
}

/** Sentences the class judges, one student after the other; each verdict comes with its reason. */
function Statements({ step }) {
  const [said, setSaid] = useState({});
  const answer = (k, v, truth) => {
    setSaid((s) => ({ ...s, [k]: v }));
    sfx(v === truth ? 'correct' : 'notyet');
  };
  return (
    <div className="cs-stmts" data-cs-statements={Object.keys(said).length}>
      <p className="cs-say">
        <MathText>{step.text}</MathText> <span className="cs-quest">{step.question}</span>
      </p>
      <ol>
        {step.items.map((it, k) => {
          const truth = FORMS[it.form](step.a, step.b);
          const v = said[k];
          const done = v !== undefined;
          return (
            <li
              key={it.form}
              className={done ? (truth ? 'is-true' : 'is-false') : ''}
              data-cs-stmt={k}
              data-cs-stmt-truth={done ? String(truth) : ''}
            >
              <strong>{it.text}</strong>
              {!done ? (
                <span className="cs-tf">
                  <button type="button" onClick={() => answer(k, true, truth)} data-cs-stmt-say="true">
                    {LL.true}
                  </button>
                  <button type="button" onClick={() => answer(k, false, truth)} data-cs-stmt-say="false">
                    {LL.false}
                  </button>
                </span>
              ) : (
                <span className="cs-proof">
                  <em>{truth ? LL.true : LL.false}</em>
                  <span>
                    <MathText>{proofOf(it.form, step.a, step.b)}</MathText>
                  </span>
                  {v === truth && <Star size={22} fill="currentColor" className="cs-proof__star" data-cs-stmt-star />}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** What goes in the copybook: the keys of the lesson on one page, in the wording the class has just read. */
function Trace({ step, rules }) {
  return (
    <div className="cs-copy" data-cs-trace={step.tablets.length}>
      {step.tablets.map((id, k) => {
        const t = rules[id];
        return (
          <article key={id}>
            <h3>
              <b>{k + 1}</b>
              {t.title}
            </h3>
            {t.lines.map((l) => (
              <p key={l}>
                <MathText>{l}</MathText>
              </p>
            ))}
            {t.list && (
              <ul>
                {t.list.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
            <div dir="ltr" data-long={t.math.some(isChain) ? '' : undefined}>
              {t.math.map((m) => (
                <span key={m}>
                  <MathText>{`$${calm(m)}$`}</MathText>
                </span>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function LessonBoard({ script, rules, students, seating, memo, setMemo, onEndTest, onExit }) {
  const tools = useBoardTools();
  const [classOpen, setClassOpen] = useState(false);
  const [speaker, setSpeaker] = useState(null);
  const steps = script.steps;
  const i = clamp(memo.step, 0, steps.length - 1);
  const step = steps[i];
  const groups = useMemo(() => groupsOf(script), [script]);
  const byId = useMemo(() => Object.fromEntries(students.map((s) => [s.id, s])), [students]);
  const teams = useMemo(() => teamsOf(seating, students), [seating, students]);
  const patch = (p) => setMemo((m) => ({ ...m, ...(typeof p === 'function' ? p(m) : p) }));
  const go = (k) => {
    if (k < 0) return;
    if (k >= steps.length) {
      onEndTest();
      return;
    }
    patch({ step: k });
    setSpeaker(null);
    tools.setInk(false);
  };
  useEffect(() => {
    const onKey = (e) => {
      if (classOpen) {
        if (e.key === 'Escape') setClassOpen(false);
        return;
      }
      if (tools.busy) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        go(i + 1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        go(i - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  useEffect(() => {
    if (import.meta.env.DEV) window.__classLesson = { memo, step, speaker };
  });
  const st = speaker && speaker !== 'teacher' ? byId[speaker] : null;
  const reading = step.kind === 'name' || step.kind === 'trace';
  const tap = (id) => {
    setSpeaker(id);
    patch((m) => ({ readers: m.readers.includes(id) ? m.readers : [...m.readers, id] }));
    setClassOpen(false);
  };
  const names = steps.filter((s) => s.kind === 'name');
  const title = step.kind === 'name' ? rules[step.tablet].title : step.title;
  const nextKind = steps[i + 1]?.kind;
  const nextLabel =
    i + 1 >= steps.length
      ? LL.toEnd
      : nextKind === 'forge'
        ? LL.toForge
        : nextKind === 'name' && step.kind === 'forge' && memo.sealed
          ? LL.toName
          : LL.next;
  const calmNext = (step.kind === 'bridges' && !readyToConclude(memo.log)) || (step.kind === 'forge' && !memo.sealed); // never locked: only less loud
  return (
    <div className="cs-lesson" data-cs-lesson-step={step.id} data-cs-lesson-kind={step.kind} data-cs-lesson-index={i}>
      <header className="cs-lesson__top">
        <nav className="cs-rail" aria-label={script.title}>
          {groups.map((g, n) => (
            <span
              key={g.steps[0]}
              className={`cs-rail__group ${g.steps.includes(i) ? 'is-now' : g.steps[g.steps.length - 1] < i ? 'is-done' : ''}`}
            >
              <em>
                {g.kind === 'trace' ? (
                  <NotebookPen size={16} />
                ) : (
                  <>
                    <KeyRound size={15} /> {n + 1}
                  </>
                )}
              </em>
              {g.steps.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`${k === i ? 'is-now' : k < i ? 'is-done' : ''} ${steps[k].kind === 'name' ? 'is-name' : ''}`}
                  onClick={() => go(k)}
                  aria-label={steps[k].kind === 'name' ? rules[steps[k].tablet].title : steps[k].title}
                  aria-current={k === i ? 'step' : undefined}
                  data-cs-rail={k}
                />
              ))}
            </span>
          ))}
        </nav>
        <BoardTools tools={tools} onClass={() => setClassOpen(true)} />
        <button type="button" className="cs-icon" onClick={onExit} aria-label={LL.exit} data-cs-lesson-exit>
          <X size={22} />
        </button>
      </header>

      {speaker && (
        <Speaker
          slim
          name={speaker === 'teacher' ? LL.teacher : st ? callName(st) : null}
          team={st ? teamOfStudent(teams, st.id) : null}
          label={reading ? LL.reads : LL.turn}
          onClear={() => setSpeaker(null)}
        />
      )}

      <main className={`cs-scene cs-scene--${step.kind}`} key={step.id}>
        <header className="cs-scene__head">
          <span className="cs-chip cs-chip--chapter">{step.chapter}</span>
          <h2>
            {step.kind === 'name' && <i>{rules[step.tablet].icon}</i>}
            {title}
          </h2>
          {step.kind === 'name' && <span className="cs-chip">{LL.key(names.indexOf(step) + 1, names.length)}</span>}
          {step.lead && <p>{step.lead}</p>}
          {step.kind === 'trace' && <p>{LL.copy}</p>}
        </header>
        {step.kind === 'situation' && <Situation step={step} />}
        {step.kind === 'mission' && <MissionStation step={step} />}
        {step.kind === 'bridges' && <Bridges step={step} memo={memo} patch={patch} />}
        {step.kind === 'forge' && <Forge memo={memo} patch={patch} goBack={() => go(i - 1)} />}
        {step.kind === 'name' && (
          <Name
            step={step}
            rules={rules}
            memo={memo}
            onPick={() => setClassOpen(true)}
            onMe={() => setSpeaker('teacher')}
          />
        )}
        {step.kind === 'ask' && <Ask step={step} />}
        {step.kind === 'statements' && <Statements step={step} />}
        {step.kind === 'court' && <CourtStation step={step} />}
        {step.kind === 'ladder' && <LadderStation step={step} />}
        {step.kind === 'trace' && <Trace step={step} rules={rules} />}
      </main>

      <footer className="cs-lesson__foot">
        <button
          type="button"
          className="cs-btn cs-btn--big"
          onClick={() => go(i - 1)}
          disabled={i === 0}
          data-cs-lesson-prev
        >
          <ArrowBack size={20} /> {LL.prev}
        </button>
        <p className="cs-cue" data-cs-cue>
          <b>{LL.cue}</b>
          <span>{step.cue}</span>
        </p>
        <button
          type="button"
          className={`cs-btn cs-btn--big ${calmNext ? '' : 'cs-btn--main'}`}
          onClick={() => go(i + 1)}
          data-cs-lesson-next={i + 1 >= steps.length ? 'end' : 'next'}
        >
          {nextLabel} <ArrowForward size={20} />
        </button>
      </footer>
      {classOpen && (
        <ClassWindow
          students={students}
          seating={seating}
          current={st?.id ?? null}
          spoken={memo.readers}
          onTap={tap}
          onClose={() => setClassOpen(false)}
          title={reading ? LL.pickTitle : LL.pickBoard}
        />
      )}
      <BoardLayers tools={tools} />
    </div>
  );
}
