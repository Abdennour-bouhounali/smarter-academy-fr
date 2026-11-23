/**
 * « fiche de connaissances » — the FULL-PAGE knowledge map of the lesson inside the game world.
 * It is the lesson's own mind map (its `knowledgeGraph.js`: the nodes and their labelled links) with the memo sheet of its
 * rules (its `knowledge.jsx`: rule, hook, example, trap, exam tip, memory test), read through `useLesson().knowledge`.
 * NOTHING is retyped here, and this page names no lesson: a change in the lesson changes this page.
 *
 * TWO VIEWS of the same cards:
 *   the JOURNEY (« Le voyage de découverte », the way the page opens until everything is found — owner, 2026-11-15): ONE card at a time,
 *     large and comfortable to read, in the middle of the screen; beside it the MYSTERY cards of what follows (the lesson's
 *     own `reveals`), each turned over by a tap and then becoming the card being read; above, the trail of what was found.
 *   the MAP (« La carte des connaissances »): all the cards and their links at once, a card's content in the side panel.
 * The whole page is scaled to the screen (`useFit`): a big screen gets big text, never a small page lost in the middle.
 * Gamified: a card is locked until its key is owned, ticked once read, and a rule is sealed in gold by its memory test.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Lock,
  Check,
  Award,
  Gamepad2,
  Telescope,
  Map as MapIcon,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import MathText from '../../components/MathText';
import Trainer from './Trainer';
import Fit from './Fit';
import { SoundToggle } from './parts';
import { useLesson } from './LessonContext';
import { KT, TX } from './text';

/**
 * The lesson's knowledge, as this page reads it (`useLesson().knowledge`): its graph (nodes and labelled links), its memo
 * items by id, and where each node sits on the MAP (percent of the map box).
 */
function useKnowledge() {
  const { knowledge } = useLesson();
  return useMemo(() => {
    const NODES = knowledge.graph.nodes;
    const EDGES = knowledge.graph.edges;
    const ITEMS = Object.fromEntries(
      Object.values(knowledge.modules)
        .flat()
        .map((it) => [it.id, it]),
    );
    const byId = (id) => NODES.find((n) => n.id === id);
    const edgeLabel = (from, to) => EDGES.find((e) => e.from === from && e.to === to)?.label ?? '';
    return { NODES, EDGES, ITEMS, POS: knowledge.positions, byId, edgeLabel };
  }, [knowledge]);
}
const kindOf = (n) => TX.know.kinds[n.kind] ?? ['•', '', 'core'];
const Tex = ({ children }) => (
  <span dir="ltr" className="di-math">
    <MathText>{`$${children}$`}</MathText>
  </span>
);

/** The scale of the page: designed for 1280 × 720, it grows with the screen (up to ×1.8) so the text is never small. */
function useFit() {
  const [z, setZ] = useState(1);
  useEffect(() => {
    const fit = () => setZ(Math.max(1, Math.min(1.8, Math.min(window.innerWidth / 1280, window.innerHeight / 720))));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return z;
}

export default function KnowledgePage({ s, game, sel }) {
  const { NODES, EDGES, ITEMS, POS, byId } = useKnowledge();
  const keys = s.openKeys;
  const { read, sealed, trained = {} } = s.know;
  const isOpen = (n) => keys.includes(n.requires);
  const found = s.know.found?.length ? s.know.found : [NODES[0].id];
  const [mode, setMode] = useState(() => (found.length < NODES.length ? 'discover' : 'full'));
  const discovering = mode === 'discover';
  const [id, setId] = useState(() =>
    sel && byId(sel)
      ? sel
      : discovering
        ? found.at(-1)
        : (NODES.find((n) => isOpen(n) && !read.includes(n.id)) ?? NODES[0]).id,
  );
  const node = byId(id);
  const open = isOpen(node);
  const item = node.notebook ? ITEMS[node.requires] : null;
  // the tab belongs to the card it was chosen on: another card opens on « La carte » in the SAME render (an effect reset it
  // one frame late — the new card was first drawn on the previous card's tab, and a walk read it then)
  const [tabOf, setTabOf] = useState({ id, tab: 'card' });
  const tab = tabOf.id === id ? tabOf.tab : 'card';
  const setTab = (t) => setTabOf({ id, tab: t });
  // a card counts as read once it is opened — a common mistake only once its error is uncovered
  useEffect(() => {
    if (open && !node.context?.parts) game.markRead(id);
  }, [id, open]); // eslint-disable-line react-hooks/exhaustive-deps
  const z = useFit();
  const readCount = NODES.filter((n) => read.includes(n.id)).length;
  const body = { node, open, item, tab, setTab, id, read, sealed, trained, game };

  return (
    <div className="di-page" data-di-know data-di-kmode={mode}>
      {/* --di-page-floor: the 12 px floor in the units of this zoom (GAME_WORLD.md « 12 px floor »; knowledge.css) */}
      <div
        className="di-page__fit"
        style={{ zoom: z, '--di-page-floor': `${Math.ceil(1200 / z) / 100}px` }}
        data-di-fit={z.toFixed(2)}
      >
        <header className="di-page__head">
          <div>
            <h2>{discovering ? TX.know.journey : TX.know.title}</h2>
            <p>{discovering ? TX.know.journeySub : TX.know.sub}</p>
          </div>
          {discovering && (
            <span className="di-pill di-pill--found" title={TX.know.found} data-di-know-found={found.length}>
              <Sparkles size={16} />{' '}
              <b dir="ltr">
                {found.length}
                {'\u00a0/\u00a0'}
                {NODES.length}
              </b>{' '}
              <span className="di-pill__label">{TX.know.found}</span>
            </span>
          )}
          <span className="di-pill" title={TX.know.cards} data-di-know-read={readCount}>
            <Check size={16} />{' '}
            <b dir="ltr">
              {readCount}
              {'\u00a0/\u00a0'}
              {NODES.length}
            </b>{' '}
            <span className="di-pill__label">{TX.know.cards}</span>
          </span>
          <span className="di-pill di-pill--gold" title={TX.know.seals} data-di-know-sealed={sealed.length}>
            <Award size={16} />{' '}
            <b dir="ltr">
              {sealed.length}
              {'\u00a0/\u00a0'}
              {Object.keys(ITEMS).length}
            </b>{' '}
            <span className="di-pill__label">{TX.know.seals}</span>
          </span>
          <button
            type="button"
            className="di-btn di-btn--map"
            onClick={() => {
              setMode(discovering ? 'full' : 'discover');
              if (!discovering && !found.includes(id)) setId(found.at(-1));
            }}
            data-di-know-mode={mode}
          >
            {discovering ? (
              <>
                <MapIcon size={17} /> {TX.know.full}
              </>
            ) : (
              <>
                <Telescope size={17} /> {TX.know.discover}
              </>
            )}
          </button>
          <button type="button" className="di-btn di-btn--map" onClick={() => game.openMap()} data-di-know-hub>
            <Gamepad2 size={17} /> {TX.hub.open}
          </button>
          <SoundToggle game={game} />
          <button
            type="button"
            className="di-icon"
            onClick={() => game.closeMap()}
            aria-label={TX.know.close}
            data-di-know-close
          >
            <X size={20} />
          </button>
        </header>

        {discovering ? (
          <Journey {...body} found={found} isOpen={isOpen} setId={setId} onFull={() => setMode('full')} />
        ) : (
          <div className={`di-page__body ${tab !== 'card' && open ? 'is-training' : ''}`}>
            <div className="di-kmap" dir="ltr" data-di-kmap="full">
              <div className="di-kmap__in">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {EDGES.map((e) => (
                    <line
                      key={`${e.from}-${e.to}`}
                      x1={POS[e.from][0]}
                      y1={POS[e.from][1]}
                      x2={POS[e.to][0]}
                      y2={POS[e.to][1]}
                      className={`${isOpen(byId(e.from)) && isOpen(byId(e.to)) ? 'is-lit' : ''} ${e.lateral ? 'is-dashed' : ''}`}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>
                {/* a link with no label draws no pill (an empty one was a stray dash on the line) */}
                {EDGES.filter((e) => e.label).map((e) => (
                  <span
                    key={`${e.from}-${e.to}`}
                    className="di-kmap__edge"
                    style={{
                      left: `${(POS[e.from][0] + POS[e.to][0]) / 2}%`,
                      top: `${(POS[e.from][1] + POS[e.to][1]) / 2}%`,
                    }}
                  >
                    {e.label}
                  </span>
                ))}
                {NODES.map((n) => {
                  const o = isOpen(n);
                  const [icon, label, family] = kindOf(n);
                  const gold = n.notebook && sealed.includes(n.requires);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setId(n.id)}
                      data-di-knode={n.id}
                      data-open={o}
                      data-read={read.includes(n.id)}
                      className={`di-knode di-knode--${family} ${o ? '' : 'is-locked'} ${n.id === id ? 'is-sel' : ''} ${read.includes(n.id) ? 'is-read' : ''} ${gold ? 'is-gold' : ''}`}
                      style={{ left: `${POS[n.id][0]}%`, top: `${POS[n.id][1]}%` }}
                    >
                      <span className="di-knode__icon">{o ? icon : <Lock size={15} />}</span>
                      <span className="di-knode__text">
                        <small>{o ? label : TX.know.lockedTitle}</small>
                        <strong>{o ? n.title : KT.hidden}</strong>
                      </span>
                      {o && read.includes(n.id) && (
                        <i className="di-knode__tick">{gold ? <Award size={13} /> : <Check size={13} />}</i>
                      )}
                      {o && trained[n.id] > 0 && (
                        <i className="di-knode__stars" dir="ltr">
                          {'★'.repeat(trained[n.id])}
                        </i>
                      )}
                    </button>
                  );
                })}
                <div className="di-kmap__legend">
                  {Object.entries(TX.know.legend).map(([k, v]) => (
                    <span key={k} className={`is-${k}`}>
                      <i />
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <aside className={`di-kpanel di-kpanel--${kindOf(node)[2]}`} data-di-kpanel={id}>
              <CardBody {...body} />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * THE JOURNEY: one big card, the mystery cards of what follows, the trail of what was found.
 * A mystery card is turned over by a tap: it is found, and it becomes the card being read.
 */
function Journey({ node, found, isOpen, setId, onFull, game, ...body }) {
  const { NODES, byId, edgeLabel } = useKnowledge();
  const { open, id } = body;
  // on a phone the trail is ONE line that slides (styles/phone.css): the card being read is brought into sight
  const trail = useRef(null);
  useEffect(() => {
    const line = trail.current;
    const now = line?.querySelector('.is-now');
    if (!line || !now || line.scrollWidth <= line.clientWidth) return;
    line.scrollLeft +=
      now.getBoundingClientRect().left - line.getBoundingClientRect().left - (line.clientWidth - now.clientWidth) / 2;
  }, [id, found.length]);
  const next = node.reveals.map(byId);
  // the cards already found that still hide something: where to go when this branch ends
  const frontier = found
    .map(byId)
    .filter(
      (n) => n.id !== id && !node.reveals.includes(n.id) && isOpen(n) && n.reveals.some((r) => !found.includes(r)),
    );
  const turn = (n) => {
    game.discover([...found, n.id]);
    setId(n.id);
  }; // the cards already shown are kept with the new one
  const all = found.length === NODES.length;
  return (
    <div className="di-journey" data-di-journey>
      <nav className="di-trail" aria-label={TX.know.trail} data-di-trail data-di-slides ref={trail}>
        {found.map((fid, k) => {
          const n = byId(fid);
          const [icon] = kindOf(n);
          return (
            <React.Fragment key={fid}>
              {k > 0 && <i className="di-trail__link" aria-hidden="true" />}
              <button
                type="button"
                className={`${fid === id ? 'is-now' : ''} ${body.read.includes(fid) ? 'is-read' : ''}`}
                onClick={() => setId(fid)}
                data-di-trail-card={fid}
              >
                <span>{isOpen(n) ? icon : <Lock size={15} />}</span>
                {isOpen(n) ? n.title : KT.hidden}
              </button>
            </React.Fragment>
          );
        })}
        {!all && (
          <span className="di-trail__rest">
            <HelpCircle size={15} /> <b dir="ltr">{NODES.length - found.length}</b> {TX.know.hidden}
          </span>
        )}
        {found.length > 1 && (
          <button
            type="button"
            className="di-link di-trail__again"
            onClick={() => {
              game.resetDiscovery(NODES[0].id);
              setId(NODES[0].id);
            }}
            data-di-know-again
          >
            <RotateCcw size={13} /> {TX.know.again}
          </button>
        )}
      </nav>

      <div className="di-journey__main">
        <section key={id} className={`di-jcard di-kpanel--${kindOf(node)[2]}`} data-di-jcard={id} data-open={open}>
          <CardBody node={node} game={game} {...body} big />
        </section>

        <aside className="di-next" data-di-next>
          <h4>{all ? TX.know.allFound : next.length ? TX.know.nextTitle : TX.know.branchEnd}</h4>
          {next.map((n) => {
            const [icon, label] = kindOf(n);
            return found.includes(n.id) ? (
              <button
                key={n.id}
                type="button"
                className="di-nextcard is-found"
                onClick={() => setId(n.id)}
                data-di-go={n.id}
              >
                <span className="di-nextcard__icon">{icon}</span>
                <span>
                  <small>
                    {edgeLabel(id, n.id)} · {label}
                  </small>
                  <strong>{isOpen(n) ? n.title : KT.hidden}</strong>
                </span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                key={n.id}
                type="button"
                className="di-nextcard is-mystery"
                disabled={!open}
                onClick={() => turn(n)}
                data-di-mystery={n.id}
              >
                <span className="di-nextcard__icon">
                  <HelpCircle size={30} />
                </span>
                <span>
                  <small>{edgeLabel(id, n.id)}</small>
                  <strong>{TX.know.mystery}</strong>
                </span>
                <Sparkles size={20} />
              </button>
            );
          })}
          {!all && frontier.length > 0 && (
            <div className="di-next__frontier">
              <small>{TX.know.frontier}</small>
              {frontier.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="di-nextcard is-back"
                  onClick={() => setId(n.id)}
                  data-di-frontier={n.id}
                >
                  <span className="di-nextcard__icon">{kindOf(n)[0]}</span>
                  <span>
                    <strong>{n.title}</strong>
                  </span>
                  <Sparkles size={18} />
                </button>
              ))}
            </div>
          )}
          {all && (
            <button type="button" className="di-btn di-btn--primary" onClick={onFull} data-di-see-map>
              <MapIcon size={18} /> {TX.know.seeMap}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

/** A card's content — the same in the journey (`big`) and in the map's side panel: head, tabs, then the tab's body. */
function CardBody({ node, open, item, tab, setTab, id, read, sealed, trained, game, big = false }) {
  const [kIcon, kLabel] = kindOf(node);
  if (!open) {
    return (
      <>
        <div className="di-kpanel__head">
          <span>
            <Lock size={26} />
          </span>
          <div>
            <small>{TX.know.lockedTitle}</small>
            <h3>{KT.hidden}</h3>
          </div>
        </div>
        <p className="di-feedback di-feedback--soft">{TX.know.locked}</p>
      </>
    );
  }
  return (
    <>
      <div className={`di-kpanel__head ${tab !== 'card' ? 'is-compact' : ''}`}>
        <span>{kIcon}</span>
        <div>
          <small>{kLabel}</small>
          <h3>{node.title}</h3>
          {node.subtitle && (
            <p>
              <MathText>{node.subtitle}</MathText>
            </p>
          )}
        </div>
        {big && read.includes(id) && (
          <i className="di-jcard__tick">
            <Check size={18} />
          </i>
        )}
      </div>
      <div className="di-tabs" role="tablist">
        {(item ? ['card', 'memo', 'quiz', 'train'] : ['card', 'train']).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? 'is-on' : ''}
            onClick={() => setTab(t)}
            data-di-tab={t}
          >
            {TX.know.tabs[t]}
            {t === 'quiz' && sealed.includes(item.id) ? ' ★' : ''}
            {t === 'train' && trained[id] > 0 ? ` ${'★'.repeat(trained[id])}` : ''}
          </button>
        ))}
      </div>
      {/* floor: the panel's box shrinks a long card (a mistake once uncovered: four parts), its labels stay at 12 px */}
      <Fit className="di-kpanel__body" floor={12} data-di-kbody>
        {tab === 'card' && (
          <Context ctx={node.context} onUncover={() => game.markRead(id)} uncovered={read.includes(id)} />
        )}
        {tab === 'memo' && item && <Memo memo={item.memo} />}
        {tab === 'quiz' && item && (
          <Quiz key={item.id} item={item} sealed={sealed.includes(item.id)} onSeal={() => game.seal(item.id)} />
        )}
        {tab === 'train' && (
          <Trainer
            key={id}
            nodeId={id}
            best={trained[id] ?? 0}
            onDone={(stars) => game.trained(id, stars)}
            onPaper={(on) => game.paperMode('trainer', on)}
            onEvidence={(ev) => game.evidence('trainer', ev)}
          />
        )}
      </Fit>
      {tab !== 'train' && (
        <button type="button" className="di-btn di-btn--primary" onClick={() => setTab('train')} data-di-know-train>
          <Gamepad2 size={17} /> {TX.know.practise}
        </button>
      )}
    </>
  );
}

/** The card of a node, as the lesson wrote it. A common mistake shows the wrong sentence first: the student uncovers the rest. */
function Context({ ctx, onUncover, uncovered }) {
  // uncovered by HIM on THIS card: another card is drawn covered (or uncovered when already read) in the same render — an
  // effect reset it one frame late, and the correction of the card before flashed on a new mistake card
  const [shownOn, setShownOn] = useState(uncovered ? ctx : null);
  const shown = uncovered || shownOn === ctx;
  const setShown = () => setShownOn(ctx);
  if (!ctx) return null;
  if (ctx.parts) {
    const [wrong, ...rest] = ctx.parts;
    return (
      <div className="di-parts">
        <div className="is-wrong">
          <small>{TX.know.parts.wrong}</small>
          <p>
            <MathText>{wrong.text}</MathText>
          </p>
        </div>
        {!shown && (
          <button
            type="button"
            className="di-btn di-btn--primary"
            onClick={() => {
              setShown();
              onUncover();
            }}
            data-di-uncover
          >
            {TX.know.reveal}
          </button>
        )}
        {shown &&
          rest.map((p) => (
            <div key={p.role} className={`is-${p.role}`}>
              <small>{TX.know.parts[p.role] ?? ''}</small>
              <p>
                <MathText>{p.text}</MathText>
              </p>
            </div>
          ))}
      </div>
    );
  }
  return (
    <div className="di-ctx">
      {ctx.text && (
        <p>
          <MathText>{ctx.text}</MathText>
        </p>
      )}
      {ctx.formula && (
        <div className="di-ctx__formula">
          <MathText>{ctx.formula}</MathText>
        </div>
      )}
      {ctx.list && (
        <ul>
          {ctx.list.map((l) => (
            <li key={l}>
              <MathText>{l}</MathText>
            </li>
          ))}
        </ul>
      )}
      {ctx.note && (
        <p className="di-ctx__note">
          <MathText>{ctx.note}</MathText>
        </p>
      )}
    </div>
  );
}

function Memo({ memo }) {
  return (
    <dl className="di-memo">
      <div className="is-rule">
        <dt>{TX.know.memo.rule}</dt>
        <dd>
          <Tex>{memo.rule}</Tex>
        </dd>
      </div>
      <div>
        <dt>{TX.know.memo.hook}</dt>
        <dd>{memo.hook}</dd>
      </div>
      <div>
        <dt>{TX.know.memo.example}</dt>
        <dd>
          <Tex>{memo.example}</Tex>
        </dd>
      </div>
      <div className="is-trap">
        <dt>⛔ {TX.know.memo.trap}</dt>
        <dd>{memo.trap}</dd>
      </div>
      <div className="is-exam">
        <dt>🎯 {TX.know.memo.exam}</dt>
        <dd>{memo.exam}</dd>
      </div>
    </dl>
  );
}

/** The memory test of a rule (the lesson's own two questions): both right seals the rule in gold. */
function Quiz({ item, sealed, onSeal }) {
  const qs = item.memo.quiz;
  const [picked, setPicked] = useState(() => qs.map(() => null));
  const [state, setState] = useState(null);
  const all = useMemo(() => picked.every((p) => p !== null), [picked]);
  const check = () => {
    const ok = qs.every((q, i) => picked[i] === q.correct);
    setState(ok ? 'ok' : 'ko');
    if (ok) onSeal();
  };
  return (
    <div className="di-quiz">
      {qs.map((q, i) => (
        <div key={q.q} className="di-quiz__q">
          <p>
            <MathText>{q.q}</MathText>
          </p>
          <div>
            {q.options.map((op, k) => (
              <button
                key={op}
                type="button"
                className={`${picked[i] === k ? 'is-on' : ''} ${state && picked[i] === k ? (k === q.correct ? 'is-ok' : 'is-ko') : ''}`}
                onClick={() => {
                  setState(null);
                  setPicked((p) => p.map((v, j) => (j === i ? k : v)));
                }}
                data-di-quiz={`${i}-${k}`}
              >
                <MathText>{op}</MathText>
              </button>
            ))}
          </div>
        </div>
      ))}
      {state === 'ko' && <p className="di-feedback">{TX.know.quizRetry}</p>}
      {(state === 'ok' || sealed) && (
        <p className="di-quiz__gold">
          <Award size={18} /> {state === 'ok' ? TX.know.quizOk : TX.know.sealed}
        </p>
      )}
      <button type="button" className="di-btn di-btn--primary" disabled={!all} onClick={check} data-di-quiz-check>
        {TX.know.check}
      </button>
    </div>
  );
}
