import { useState } from 'react';
import { X, Star, Lock, Play, Lightbulb, Truck, Zap, BookOpen, FileText } from 'lucide-react';
import Fit, { cardRoom } from './Fit';
import { useLesson } from './LessonContext';
import { SUMMARY } from './ladder';
import { KT, TX } from './text';
import { M, Stars } from './parts';
import { ExamLadder } from './Spaces';

/**
 * « L’espace d’entraînement » — the lesson's mind map as the level select of the practice game (`useLesson().practiceMap`: where each
 * node sits and how they are linked): one node per key and the summary node. A node lights up with its key; its pips are
 * its levels. The panel beside it reminds the rule and lists the levels, easiest first.
 */
export default function PracticeHub({ s, game, sel: selFrom, space0 }) {
  const { ladder, journey, rules, text, practiceMap } = useLesson();
  const nodeMeta = (id) => (id === SUMMARY ? text.summary : rules[id]);
  // « no rule is told »: a key's name (its tablet's title) and its levels' names appear only once he holds the key
  const nameOf = (id, isOpen) => (isOpen || id === SUMMARY ? nodeMeta(id).title : KT.hidden);
  const [space, setSpace] = useState(space0 ?? 'game');
  const keys = s.openKeys;
  const progress = s.practice;
  const next = ladder.nextLevel(keys, progress);
  const [sel, setSel] = useState(
    () =>
      selFrom ??
      next?.node ??
      Math.max(
        0,
        ladder.nodes.findIndex((_, i) => ladder.nodeOpen(i, keys, progress)),
      ),
  );
  const total = ladder.practiceStars(progress);
  const node = ladder.nodes[sel];
  const meta = nodeMeta(node.id);
  const open = ladder.nodeOpen(sel, keys, progress);
  const openById = (id) =>
    id === 'root' ||
    ladder.nodeOpen(
      ladder.nodes.findIndex((n) => n.id === id),
      keys,
      progress,
    );
  return (
    <div className="di-veil">
      <div className="di-card di-mapcard" role="dialog" aria-modal="true" data-di-mapcard>
        <Fit avail={cardRoom}>
          <header className="di-map__head">
            <div>
              <h2>{TX.hub.title}</h2>
              <div className="di-spaces" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={space === 'game'}
                  className={space === 'game' ? 'is-on' : ''}
                  onClick={() => setSpace('game')}
                  data-di-space="game"
                >
                  <Zap size={16} /> {TX.spaces.game}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={space === 'exam'}
                  className={space === 'exam' ? 'is-on' : ''}
                  onClick={() => setSpace('exam')}
                  data-di-space="exam"
                >
                  {journey.examOpen(keys, progress) ? <FileText size={16} /> : <Lock size={15} />} {TX.spaces.exam}
                </button>
                <span className="di-dim">{space === 'game' ? TX.spaces.gameSub : TX.spaces.examSub}</span>
              </div>
            </div>
            <div className="di-map__total" title={KT.map.stars}>
              <Star size={20} className="di-ic-star" />{' '}
              <b dir="ltr">
                {total}
                {'\u00a0/\u00a0'}
                {ladder.MAX_PRACTICE_STARS}
              </b>
              <span className="di-bar">
                <i style={{ width: `${(total / ladder.MAX_PRACTICE_STARS) * 100}%` }} />
              </span>
            </div>
            <button type="button" className="di-btn di-btn--map" onClick={() => game.openKnow()} data-di-hub-know>
              <BookOpen size={17} /> {TX.hub.toKnow}
            </button>
            <button
              type="button"
              className="di-icon"
              onClick={() => game.closeMap()}
              aria-label={KT.map.close}
              data-di-map-close
            >
              <X size={20} />
            </button>
          </header>

          {space === 'exam' && <ExamLadder s={s} game={game} />}
          {space === 'game' && (
            <div className="di-map__body">
              <div className="di-map" dir="ltr">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {practiceMap.edges.map(([a, b, , dashed]) => (
                    <line
                      key={`${a}-${b}`}
                      x1={practiceMap.positions[a][0]}
                      y1={practiceMap.positions[a][1]}
                      x2={practiceMap.positions[b][0]}
                      y2={practiceMap.positions[b][1]}
                      className={`${openById(a) && openById(b) ? 'is-lit' : ''} ${dashed ? 'is-dashed' : ''}`}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>
                {practiceMap.edges
                  .filter(([, , label]) => label)
                  .map(([a, b, label]) => (
                    <span
                      key={`${a}-${b}`}
                      className="di-map__edge"
                      style={{
                        left: `${(practiceMap.positions[a][0] + practiceMap.positions[b][0]) / 2}%`,
                        top: `${(practiceMap.positions[a][1] + practiceMap.positions[b][1]) / 2}%`,
                      }}
                    >
                      {label}
                    </span>
                  ))}
                <span
                  className="di-map__root"
                  style={{ left: `${practiceMap.positions.root[0]}%`, top: `${practiceMap.positions.root[1]}%` }}
                >
                  {practiceMap.root}
                </span>
                {ladder.nodes.map((n, i) => {
                  const m = nodeMeta(n.id);
                  const isOpen = ladder.nodeOpen(i, keys, progress);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      className={`di-node ${isOpen ? 'is-open' : 'is-locked'} ${i === sel ? 'is-sel' : ''} ${n.id === SUMMARY ? 'di-node--exam' : ''}`}
                      style={{ left: `${practiceMap.positions[n.id][0]}%`, top: `${practiceMap.positions[n.id][1]}%` }}
                      onClick={() => setSel(i)}
                      data-di-node={n.id}
                      data-open={isOpen}
                    >
                      <span className="di-node__icon">{isOpen ? m.icon : <Lock size={22} />}</span>
                      <strong>{nameOf(n.id, isOpen)}</strong>
                      <span className="di-node__pips">
                        {n.levels.map((_, l) => {
                          const st = progress[ladder.levelId(i, l)]?.stars ?? 0;
                          return <i key={l} className={st === 3 ? 'is-gold' : st > 0 ? 'is-done' : ''} />;
                        })}
                      </span>
                    </button>
                  );
                })}
              </div>

              <aside className="di-map__panel" data-di-panel={node.id}>
                <div className="di-map__panelhead">
                  <span>{open ? meta.icon : '🔒'}</span>
                  <h3>{nameOf(node.id, open)}</h3>
                </div>
                {!open && (
                  <p className="di-feedback di-feedback--soft">
                    {node.id === SUMMARY ? KT.map.examLocked : KT.map.locked}
                  </p>
                )}
                {open && node.id === SUMMARY && <p className="di-dim">{meta.text}</p>}
                {open && node.id !== SUMMARY && (
                  <div className="di-map__rule">
                    <M>{meta.math[0]}</M>
                    <p>{meta.notes[0]}</p>
                    <button type="button" className="di-link" onClick={() => game.showRule(node.id, { sel, space })}>
                      <Lightbulb size={15} /> {KT.map.rule}
                    </button>
                  </div>
                )}
                <ol className="di-levels">
                  {node.levels.map((_, l) => {
                    const id = ladder.levelId(sel, l);
                    const can = ladder.levelOpen(sel, l, keys, progress);
                    const st = progress[id]?.stars ?? 0;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          className={`di-level ${can ? '' : 'is-locked'} ${next?.id === id ? 'is-next' : ''}`}
                          disabled={!can}
                          onClick={() => game.startPractice(sel, l)}
                          data-di-level={id}
                          title={can ? KT.map.play : KT.map.levelLocked}
                        >
                          <span className={`di-level__go ${ladder.isCase(sel, l) ? 'is-depot' : ''}`}>
                            {!can ? (
                              <Lock size={16} />
                            ) : ladder.isCase(sel, l) ? (
                              <Truck size={19} />
                            ) : (
                              <Zap size={19} fill="currentColor" />
                            )}
                          </span>
                          <span className="di-level__name">
                            <b>{KT.map.level(l + 1)}</b>
                            {(open || node.id === SUMMARY) && <small>{text.levels[node.id][l]}</small>}
                          </span>
                          <span className="di-level__score">
                            <Stars n={st} />
                            {progress[id]?.best > 0 && <small dir="ltr">{progress[id].best}</small>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </aside>
            </div>
          )}

          {space === 'game' && (
            <footer className="di-row">
              {next ? (
                <button
                  type="button"
                  className="di-btn di-btn--primary di-btn--wide"
                  onClick={() => game.startPractice(next.node, next.level)}
                  data-di-next
                >
                  <Play size={18} fill="currentColor" /> {KT.map.next}
                  {'\u00a0: '}
                  {text.levels[ladder.nodes[next.node].id][next.level]}
                </button>
              ) : (
                <p className="di-dim">{keys.length ? KT.map.allDone : KT.map.locked}</p>
              )}
            </footer>
          )}
        </Fit>
      </div>
    </div>
  );
}
