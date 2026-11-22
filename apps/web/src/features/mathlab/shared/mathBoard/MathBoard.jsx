import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { CheckCircle2, AlertTriangle, Hand, Undo2 } from 'lucide-react';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { settledLines, checkPick, checkOperator, checkAnswer, isPickable, OPERATOR_PALETTE } from './frames.js';
import './mathBoard.css';

const katexCache = new Map();

/**
 * Le pas courant vient AU CENTRE de l'écran (demande de la propriétaire) :
 * quand le tableau s'allonge, l'élève n'a pas à faire défiler pour suivre.
 * Doux, sauf en mouvement réduit.
 */
function centerOnScreen(node) {
  if (!node || typeof node.scrollIntoView !== 'function') return;
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  node.scrollIntoView({ block: 'center', inline: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
}

/** La mesure des jetons se fait avant la peinture ; hors navigateur (tests, rendu serveur), rien à mesurer. */
const useMeasureEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Un morceau de LaTeX en HTML KaTeX (mis en cache : les jetons se répètent d'un frame à l'autre). */
function renderLatex(latex) {
  if (katexCache.has(latex)) return katexCache.get(latex);
  let html;
  try {
    html = katex.renderToString(latex, { throwOnError: false, output: 'html', strict: 'ignore' });
  } catch {
    html = latex;
  }
  if (katexCache.size > 800) katexCache.clear();
  katexCache.set(latex, html);

  return html;
}

function Latex({ latex, className = '' }) {
  // eslint-disable-next-line react/no-danger
  return <span className={className} dangerouslySetInnerHTML={{ __html: renderLatex(latex) }} />;
}

/**
 * LE TABLEAU — une solution qui se CONSTRUIT devant l'élève (frames.js).
 *
 *     ✓ 2x + 3 − 3 = 9 − 3        ← les lignes acquises (settle), en petit
 *     ✓ 2x = 6
 *     ┌──────────────────────────┐
 *     │  2x = [6]                 │  ← le frame courant : jetons colorés,
 *     │  ↓      ↓                 │     flèches et résultats posés dessus
 *     │  ÷2     ÷2                │
 *     └──────────────────────────┘
 *     « نقسم الطرفين على 2 »       ← la phrase de ce micro-état
 *
 * Ne rend JAMAIS un frame futur : `frames.slice(0, cursor)` au plus. Avant le
 * premier pas (`cursor = 0`), seul l'énoncé (`problem`, LaTeX) est au tableau.
 *
 * Les jetons sont rendus un par un (KaTeX), ce qui permet de les MESURER : les
 * flèches sont un calque SVG posé sur leurs boîtes, recalculé à chaque frame
 * et à chaque redimensionnement. Le tableau est LTR (c'est de la notation) ;
 * les phrases suivent la page.
 */
export default function MathBoard({ frames, cursor, problem = null, label = null, dataAttr = 'data-ml-board', interactive = false, onSolved = null, answer = null, answerContext = null }) {
  const { t } = useTranslation('mathlab');
  const frame = cursor > 0 ? frames[Math.min(cursor, frames.length) - 1] : null;
  const history = useMemo(() => settledLines(frames, Math.min(cursor, frames.length)), [frames, cursor]);
  const text = frame ? (frame.text ?? (frame.textKey ? t(frame.textKey, frame.textParams) : null)) : null;
  const operation = frame ? (frame.operation ?? (frame.operationKey ? t(frame.operationKey, frame.operationParams) : null)) : null;
  const currentRef = useRef(null);

  // À chaque nouveau pas (pas à l'ouverture : l'énoncé seul ne bouge pas l'écran).
  useEffect(() => {
    if (cursor > 0) centerOnScreen(currentRef.current);
  }, [cursor]);

  return (
    <section className={`sa-ml-board${cursor > 0 ? ' is-running' : ''}`} aria-label={label ?? undefined} {...{ [dataAttr]: frame ? `${cursor}/${frames.length}` : 'ready' }}>
      {problem && (
        <div className="sa-ml-board__problem" dir="ltr" data-ml-board-problem>
          <Latex latex={problem} />
        </div>
      )}

      {history.length > 0 && (
        <ol className="sa-ml-board__history" dir="ltr" data-ml-board-history={history.length}>
          {history.map((line, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={index} className={`sa-ml-board__settled${line.tone === 'warning' ? ' is-warning' : ''}`}>
              <CheckCircle2 size={14} aria-hidden="true" />
              <Latex latex={line.latex} />
            </li>
          ))}
        </ol>
      )}

      {frame && (
        <div ref={currentRef} className={`sa-ml-board__current${frame.tone ? ` is-${frame.tone}` : ''}`} key={cursor} data-ml-board-frame={cursor}>
          {!(interactive && frame.task) && (operation || frame.operationLatex) && (
            <p className="sa-ml-board__operation" data-ml-board-operation>
              {frame.tone === 'warning' && <AlertTriangle size={14} aria-hidden="true" />}
              {operation && <span><MathText>{operation}</MathText></span>}
              {frame.operationLatex && <bdi dir="ltr"><Latex latex={frame.operationLatex} /></bdi>}
            </p>
          )}
          {interactive && frame.task
            ? <PracticeCanvas frame={frame} onSolved={onSolved} answer={answer} answerContext={answerContext} key={`practice-${cursor}`} />
            : <FrameCanvas frame={frame} />}
          {!(interactive && frame.task) && text && (
            <p className="sa-ml-board__text" data-ml-board-text>
              <MathText>{text}</MathText>
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Les lignes de jetons du frame courant et le calque des marques. Les
 * positions viennent des boîtes RÉELLES des jetons (police chargée, largeur
 * de l'écran) : aucune géométrie devinée.
 */
function FrameCanvas({ frame }) {
  const hostRef = useRef(null);
  const [geometry, setGeometry] = useState(null);
  const marks = frame.marks ?? [];
  const hasLink = marks.some((mark) => mark.type === 'link');
  const hasUnder = marks.some((mark) => mark.type !== 'link');

  useMeasureEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const measure = () => {
      const origin = host.getBoundingClientRect();
      const boxes = {};
      host.querySelectorAll('[data-mb-token]').forEach((node) => {
        const r = node.getBoundingClientRect();
        boxes[node.getAttribute('data-mb-token')] = {
          left: r.left - origin.left + host.scrollLeft,
          right: r.right - origin.left + host.scrollLeft,
          top: r.top - origin.top,
          bottom: r.bottom - origin.top,
          cx: (r.left + r.right) / 2 - origin.left + host.scrollLeft,
        };
      });
      setGeometry({ boxes, width: host.scrollWidth, height: host.scrollHeight });
    };
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(host);
    document.fonts?.ready?.then(measure).catch(() => {});

    return () => observer?.disconnect();
  }, [frame]);

  return (
    <div
      ref={hostRef}
      className={`sa-ml-board__canvas${hasLink ? ' has-link' : ''}${hasUnder ? ' has-under' : ''}`}
      dir="ltr"
    >
      {frame.rows.map((row, rowIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={rowIndex} className="sa-ml-board__row">
          {row.map((token) => (
            <span key={token.id} className={`sa-ml-board__token is-${token.tone ?? 'neutral'}`} data-mb-token={token.id} data-mb-tone={token.tone ?? 'neutral'}>
              <Latex latex={token.latex} />
            </span>
          ))}
        </div>
      ))}
      {geometry && <MarksLayer marks={marks} geometry={geometry} />}
    </div>
  );
}

/** Les flèches : ↓ sous un jeton, ⌒ d'un jeton à l'autre, ↓ résultat sous une paire. */
function MarksLayer({ marks, geometry }) {
  const items = [];
  marks.forEach((mark, index) => {
    if (mark.type === 'under') {
      const box = geometry.boxes[mark.target];
      if (!box) return;
      const y1 = box.bottom + 2;
      const y2 = box.bottom + 20;
      items.push({ key: index, path: `M ${box.cx} ${y1} L ${box.cx} ${y2}`, label: { x: box.cx, y: y2 + 2, latex: mark.latex, tone: mark.tone ?? 'operation' } });
    } else if (mark.type === 'result') {
      const boxes = mark.from.map((id) => geometry.boxes[id]).filter(Boolean);
      if (!boxes.length) return;
      const cx = boxes.reduce((sum, box) => sum + box.cx, 0) / boxes.length;
      const bottom = Math.max(...boxes.map((box) => box.bottom));
      const lines = boxes.map((box) => `M ${box.cx} ${bottom + 2} L ${cx} ${bottom + 20}`).join(' ');
      items.push({ key: index, path: lines, label: { x: cx, y: bottom + 22, latex: mark.latex, tone: 'result' } });
    } else if (mark.type === 'link') {
      const a = geometry.boxes[mark.from];
      const b = geometry.boxes[mark.to];
      if (!a || !b) return;
      const top = Math.min(a.top, b.top);
      const lift = Math.min(30, 12 + Math.abs(b.cx - a.cx) / 6);
      const mid = (a.cx + b.cx) / 2;
      items.push({
        key: index,
        path: `M ${a.cx} ${top - 2} Q ${mid} ${top - 2 - lift * 2} ${b.cx} ${top - 2}`,
        arrowAt: { x: b.cx, y: top - 2, from: { x: mid, y: top - 2 - lift * 2 } },
        label: { x: mid, y: top - 2 - lift - 12, latex: mark.latex, tone: 'operation', badge: true },
      });
    }
  });

  return (
    <>
      <svg className="sa-ml-board__marks" width={geometry.width} height={geometry.height} aria-hidden="true">
        <defs>
          <marker id="sa-ml-board-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="sa-ml-board__arrowhead" />
          </marker>
        </defs>
        {items.map((item) => (
          <path key={item.key} d={item.path} pathLength={1} className="sa-ml-board__arrow" markerEnd="url(#sa-ml-board-arrow)" />
        ))}
      </svg>
      {items.map((item) => item.label && (
        <span
          key={`label-${item.key}`}
          className={`sa-ml-board__mark-label is-${item.label.tone}${item.label.badge ? ' is-badge' : ''}`}
          style={{ left: item.label.x, top: item.label.y }}
          data-mb-mark={item.label.tone}
        >
          <Latex latex={item.label.latex} />
        </span>
      ))}
    </>
  );
}

/**
 * « تدرّب بنفسك » — le frame devient un petit exercice : les jetons sont des
 * boutons, l'élève désigne les éléments puis choisit l'opération. Rien du
 * frame n'est révélé avant la bonne réponse (ni les tons, ni les flèches, ni
 * la pastille de l'opération).
 */
function PracticeCanvas({ frame, onSolved, answer = null, answerContext = null }) {
  const { t } = useTranslation('mathlab');
  const task = frame.task;
  const [picked, setPicked] = useState([]);
  const [stage, setStage] = useState('pick');      // pick → operator → answer → done
  const [typed, setTyped] = useState('');
  const [chosen, setChosen] = useState(null);
  const [feedback, setFeedback] = useState(null);  // { tone, key }
  const [errors, setErrors] = useState(0);
  const need = task.targets.length;

  const fail = (key) => {
    setErrors((n) => n + 1);
    setFeedback({ tone: 'error', key });
  };

  const choose = (id) => {
    if (stage !== 'pick') return;
    setFeedback(null);
    const next = picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id];
    setPicked(next);
    if (next.length < need) return;
    const verdict = checkPick(task, next);
    if (!verdict.ok) {
      fail(task.kind === 'term' ? 'kit.practice.wrongTerm' : 'kit.practice.wrongPick');
      setPicked([]);

      return;
    }
    if (task.operator) {
      setStage('operator');
      setFeedback({ tone: 'success', key: 'kit.practice.goodPick' });
    } else if (answer) {
      setStage('answer');
      setFeedback({ tone: 'success', key: 'kit.practice.nowCompute' });
    } else {
      setStage('done');
      setFeedback({ tone: 'success', key: 'kit.practice.correct' });
      onSolved?.();
    }
  };

  const operate = (operator) => {
    if (stage !== 'operator') return;
    if (!checkOperator(task, operator)) {
      fail('kit.practice.wrongOperator');

      return;
    }
    setChosen(operator);
    if (answer) {
      setStage('answer');
      setFeedback({ tone: 'success', key: 'kit.practice.nowCompute' });

      return;
    }
    setStage('done');
    setFeedback({ tone: 'success', key: 'kit.practice.correct' });
    onSolved?.();
  };

  const submitAnswer = (event) => {
    event.preventDefault();
    if (!typed.trim()) return;
    if (!checkAnswer(answer, typed)) {
      fail('kit.practice.wrongAnswer');

      return;
    }
    setStage('done');
    setFeedback({ tone: 'success', key: 'kit.practice.correct' });
    onSolved?.();
  };

  const hint = errors >= 2 && stage === 'pick';

  return (
    <div className="sa-ml-board__practice" data-ml-board-practice={stage}>
      <p className="sa-ml-board__practice-prompt">
        <Hand size={15} aria-hidden="true" />
        <span>{t(stage === 'operator' ? 'kit.practice.chooseOperator' : task.promptKey, task.promptParams ?? undefined)}</span>
        {stage === 'pick' && need > 1 && (
          <span className="sa-ml-board__practice-count">{t('kit.practice.picked', { current: picked.length, total: need })}</span>
        )}
      </p>

      <div className="sa-ml-board__canvas" dir="ltr">
        {frame.rows.map((row, rowIndex) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={rowIndex} className="sa-ml-board__row">
            {row.map((token) => {
              const pickable = isPickable(token);
              const isPicked = picked.includes(token.id) || (stage !== 'pick' && task.targets.includes(token.id));
              const isHint = hint && task.targets.includes(token.id);
              if (!pickable) {
                return (
                  <span key={token.id} className="sa-ml-board__token is-neutral" data-mb-token={token.id}>
                    <Latex latex={token.latex} />
                  </span>
                );
              }

              return (
                <button
                  key={token.id}
                  type="button"
                  className={`sa-ml-board__token sa-ml-board__pick${isPicked ? ' is-selected' : ' is-neutral'}${isHint ? ' is-hint' : ''}`}
                  aria-pressed={isPicked}
                  disabled={stage !== 'pick'}
                  onClick={() => choose(token.id)}
                  data-mb-token={token.id}
                  data-mb-pick={token.id}
                >
                  <Latex latex={token.latex} />
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {stage === 'operator' && (
        <div className="sa-ml-board__operators" role="group" aria-label={t('kit.practice.chooseOperator')}>
          {OPERATOR_PALETTE.map((operator) => (
            <button
              key={operator}
              type="button"
              className="sa-ml-board__operator"
              onClick={() => operate(operator)}
              aria-label={t(`kit.practice.operators.${operatorName(operator)}`)}
              title={t(`kit.practice.operators.${operatorName(operator)}`)}
              data-mb-operator={operatorName(operator)}
            >
              <Latex latex={operator === '-' ? '-' : operator} />
            </button>
          ))}
          <button type="button" className="sa-ml-board__operator is-undo" onClick={() => { setStage('pick'); setPicked([]); setFeedback(null); }} aria-label={t('kit.practice.repick')} title={t('kit.practice.repick')}>
            <Undo2 size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      {stage === 'answer' && (
        // Les mathématiques se lisent de GAUCHE à DROITE, même sur une page
        // arabe : « 84 − 36 = [ ؟ ] » — la case vient APRÈS le signe égal.
        <form className="sa-ml-board__answer" onSubmit={submitAnswer} dir="ltr" data-ml-board-answer>
          {answerContext ? (
            // Un geste sur les deux membres : la ligne où l'opération est écrite,
            // puis l'élève tape le nombre qui en sort.
            <span className="sa-ml-board__answer-context" dir="ltr"><Latex latex={answerContext} /></span>
          ) : (
            <span className="sa-ml-board__answer-expr" dir="ltr">
              {task.targets.map((id, index) => {
                const token = frame.rows.flat().find((item) => item.id === id);

                return (
                  <span key={id} className="sa-ml-board__answer-part">
                    {index > 0 && chosen && <Latex latex={chosen} />}
                    {token && <Latex latex={token.latex} />}
                  </span>
                );
              })}
              <Latex latex="=" />
            </span>
          )}
          {answerContext && <span className="sa-ml-board__answer-arrow" aria-hidden="true">→</span>}
          <input
            className="sa-ml-board__answer-input"
            type="text"
            inputMode="decimal"
            dir="ltr"
            lang="en"
            autoComplete="off"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            aria-label={t('kit.practice.answerLabel')}
            placeholder="?"
            autoFocus
            data-mb-answer-input
          />
          <button type="submit" className="sa-ml-board__answer-check" dir="rtl" data-mb-answer-check>{t('kit.practice.check')}</button>
        </form>
      )}

      <p className={`sa-ml-board__practice-feedback${feedback ? ` is-${feedback.tone}` : ''}`} role="status" aria-live="polite" data-ml-board-feedback={feedback?.tone ?? ''}>
        {feedback ? t(feedback.key) : ''}
        {hint && !feedback?.key?.startsWith('kit.practice.good') ? ` ${t('kit.practice.hintShown')}` : ''}
      </p>
    </div>
  );
}

function operatorName(operator) {
  return { '+': 'add', '-': 'subtract', '\\times': 'multiply', '\\div': 'divide' }[operator] ?? 'add';
}
