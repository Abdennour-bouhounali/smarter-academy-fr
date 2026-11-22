import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, SkipForward, RotateCcw, Wand2 } from 'lucide-react';
import ValueInput from './ValueInput.jsx';
import {
  sievePasses, primeFactorization, factorizationToText, factorPairs, isPrime,
  factorizationProduct, MAX_GRID,
} from './numberTheory.js';
import { formatNumber } from './numberValue.js';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';
import {
  collectLeaves, nodeAt, replaceAt, treeLevels, firstCompositeLeafPath, TREE_PRESETS,
} from './factorTree.js';
import { factorTreeFrames, treeAtCursor } from './factorTreeFrames.js';

/**
 * §22 à §24 — LE GHIRBĀL et L'ARBRE.
 *
 * ── Le crible (§22) ─────────────────────────────────────────────────────
 * Il ne montre pas « les nombres premiers » : il montre qu'on les OBTIENT en
 * éliminant. L'élève tient la vitesse, la pause, le pas à pas. Les passes
 * viennent de `sievePasses`, qui a déjà décidé de l'ordre — l'animation ne
 * calcule rien, elle avance un curseur dans une liste. C'est ce qui rend le
 * « pas à pas » et la « lecture » rigoureusement identiques.
 *
 * ── L'arbre (§23, §24) ──────────────────────────────────────────────────
 * L'élève CHOISIT comment fendre chaque nœud — `360 = 36 × 10` ou
 * `360 = 4 × 90`, les deux sont permises. Le système ne valide qu'une chose :
 * que le produit soit juste. Et au bout, quel que soit le chemin, la même
 * décomposition apparaît : c'est le théorème fondamental, découvert au lieu
 * d'être énoncé. Le bouton « جرّب تفكيكًا آخر » existe pour cela.
 */

const SPEEDS = Object.freeze({ slow: 1100, normal: 520, fast: 180 });

export default function PrimesMode({ state, onChange, compact, reducedMotion }) {
  const { t } = useTranslation('mathlab');
  const { limit, cursor, factorTree } = state;
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState('normal');
  const timerRef = useRef(null);

  const run = useMemo(() => sievePasses(limit), [limit]);
  const totalPasses = run?.passes.length ?? 0;
  const safeCursor = Math.min(cursor, totalPasses);

  /** L'état de chaque case APRÈS `safeCursor` passes — dérivé, jamais stocké. */
  const cells = useMemo(() => {
    if (!run) return [];
    const struck = new Map();
    for (let i = 0; i < safeCursor; i += 1) {
      for (const value of run.passes[i].struck) struck.set(value, run.passes[i].prime);
    }
    const primesSoFar = new Set(run.passes.slice(0, safeCursor).map((p) => p.prime));

    return Array.from({ length: limit }, (_, index) => {
      const value = index + 1;
      if (value === 1) return { value, kind: 'one' };
      if (struck.has(value)) return { value, kind: 'struck', by: struck.get(value) };
      if (primesSoFar.has(value) || safeCursor >= totalPasses) return { value, kind: 'prime' };

      return { value, kind: 'pending' };
    });
  }, [run, safeCursor, limit, totalPasses]);

  // L'animation : un simple minuteur qui avance le curseur. Rien d'autre.
  useEffect(() => {
    if (!playing) return undefined;
    if (safeCursor >= totalPasses) { setPlaying(false); return undefined; }
    timerRef.current = window.setTimeout(
      () => onChange({ cursor: safeCursor + 1 }),
      reducedMotion ? 60 : SPEEDS[speed],
    );

    return () => window.clearTimeout(timerRef.current);
  }, [playing, safeCursor, totalPasses, speed, onChange, reducedMotion]);

  const currentPass = safeCursor > 0 ? run?.passes[safeCursor - 1] : null;
  const done = safeCursor >= totalPasses;

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--primes">
      {/* ── §22 : le crible ─────────────────────────────────────────── */}
      <section className="sa-ml-nb__section">
        <h3 className="sa-ml-nb__heading">{t('tools.numberLab.primes.heading')}</h3>
        <p className="sa-ml-nb__hint">{t('tools.numberLab.primes.hint')}</p>

        <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
          <ValueInput
            value={limit}
            onChange={(next) => onChange({ limit: next, cursor: 0 })}
            label={t('tools.numberLab.primes.limit')}
            integer
            min={10}
            max={MAX_GRID}
          />
          <div className="sa-ml-nb__controls">
            <button
              type="button"
              className="sa-ml-nb__button"
              onClick={() => { if (done) onChange({ cursor: 0 }); setPlaying((v) => !v); }}
            >
              {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
              {playing ? t('tools.numberLab.primes.pause') : t('tools.numberLab.primes.play')}
            </button>
            <button
              type="button"
              className="sa-ml-nb__button sa-ml-nb__button--ghost"
              onClick={() => { setPlaying(false); onChange({ cursor: Math.min(totalPasses, safeCursor + 1) }); }}
              disabled={done}
            >
              <SkipForward size={15} aria-hidden="true" />
              {t('tools.numberLab.primes.step')}
            </button>
            <button
              type="button"
              className="sa-ml-nb__button sa-ml-nb__button--ghost"
              onClick={() => { setPlaying(false); onChange({ cursor: 0 }); }}
            >
              <RotateCcw size={15} aria-hidden="true" />
              {t('tools.numberLab.primes.restart')}
            </button>
          </div>
          <label className="sa-ml-nb__field">
            <span className="sa-ml-nb__label">{t('tools.numberLab.primes.speed')}</span>
            <select className="sa-ml-nb__select" value={speed} onChange={(event) => setSpeed(event.target.value)}>
              <option value="slow">{t('tools.numberLab.primes.speedSlow')}</option>
              <option value="normal">{t('tools.numberLab.primes.speedNormal')}</option>
              <option value="fast">{t('tools.numberLab.primes.speedFast')}</option>
            </select>
          </label>
        </div>

        <p className="sa-ml-nb__status" aria-live="polite">
          {done
            ? t('tools.numberLab.primes.done', { count: run?.primes.length ?? 0, limit })
            : currentPass
              ? `${t('tools.numberLab.primes.currentPass', { prime: currentPass.prime })} — ${t('tools.numberLab.primes.startsAtSquare', { square: currentPass.prime ** 2 })}`
              : t('tools.numberLab.primes.hint')}
        </p>

        <div
          className={`sa-ml-nb__sieve${limit > 400 ? ' is-dense' : ''}`}
          role="img"
          aria-label={t('tools.numberLab.primes.gridLabel', { limit })}
        >
          {cells.map((cell) => (
            <span
              key={cell.value}
              className={`sa-ml-nb__sieve-cell is-${cell.kind}${currentPass && cell.by === currentPass.prime ? ' is-current' : ''}`}
              title={cell.kind === 'struck'
                ? t('tools.numberLab.primes.cellComposite', { value: cell.value, prime: cell.by })
                : (cell.kind === 'prime' ? t('tools.numberLab.primes.cellPrime', { value: cell.value }) : undefined)}
            >
              {cell.value}
            </span>
          ))}
        </div>

        <p className="sa-ml-nb__muted">{t('tools.numberLab.primes.one')}</p>

        {done && run && (
          <p className="sa-ml-nb__formula" dir="ltr">
            <strong>{t('tools.numberLab.primes.primesFound')}</strong>{' : '}
            {run.primes.slice(0, 60).join(' · ')}{run.primes.length > 60 ? ' …' : ''}
          </p>
        )}
      </section>

      {/* ── §23, §24 : l'arbre de facteurs ──────────────────────────── */}
      <FactorTree tree={factorTree} onChange={(next) => onChange({ factorTree: next })} compact={compact} />
    </div>
  );
}

/**
 * §24 — L'ARBRE, un puzzle.
 *
 * On clique une feuille composée, on choisit un couple, elle se fend. Le
 * système valide le produit (c'est tout ce qu'il y a à valider) et refuse
 * poliment un couple faux. Quand toutes les feuilles sont premières, la
 * décomposition s'écrit toute seule — et on VÉRIFIE que son produit fait bien
 * le nombre de départ, parce que §24 le demande.
 *
 * « فكّكه تلقائيًّا » ne pose PLUS l'arbre entier d'un coup : il ouvre un
 * DÉROULÉ (lecteur partagé + MathBoard, frames de `factorTreeFrames.js`) qui
 * fend une feuille par étape — [60] ÷ [2] ↓ 30, puis 30, puis 15 — l'arbre
 * dessiné poussant quand le quotient tombe ; la décomposition (puissances
 * regroupées) est le DERNIER pas. L'arbre complet n'entre dans le document
 * qu'une fois ce pas atteint. Le déroulé part de l'arbre tel que l'élève l'a
 * laissé : on peut commencer à la main et laisser la machine finir.
 */
function FactorTree({ tree, onChange, compact }) {
  const { t } = useTranslation('mathlab');
  const [picking, setPicking] = useState(null);
  const [error, setError] = useState(null);
  // Le déroulé automatique en cours : état d'INTERFACE (jamais enregistré).
  const [auto, setAuto] = useState(null);

  const autoRun = useMemo(() => (auto ? factorTreeFrames(auto.start) : null), [auto]);
  const frames = autoRun?.frames ?? [];
  const player = useStepReveal(frames.length, { resetKey: auto?.id ?? null });
  const practice = useBoardPractice(frames, player, auto?.id ?? null);
  const shown = auto ? treeAtCursor(auto.start, autoRun.stages, frames, player.cursor) : tree;

  const leaves = useMemo(() => collectLeaves(shown), [shown]);
  const complete = shown && leaves.length > 0 && leaves.every((leaf) => isPrime(leaf.n));
  const factors = complete ? primeFactorization(shown.n) : null;
  const levels = useMemo(() => treeLevels(shown), [shown]);
  const finalTree = autoRun?.stages.length ? autoRun.stages[autoRun.stages.length - 1].tree : null;
  const autoDone = Boolean(auto) && player.done;

  // Le dernier pas atteint : l'arbre complet entre dans le document.
  useEffect(() => {
    if (autoDone && finalTree && JSON.stringify(finalTree) !== JSON.stringify(tree)) onChange(finalTree);
  }, [autoDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Le document a changé AILLEURS (annuler, autre document) : le déroulé n'a plus d'objet.
  useEffect(() => {
    if (!auto) return;
    const json = JSON.stringify(tree);
    if (json !== JSON.stringify(auto.start) && json !== JSON.stringify(finalTree)) setAuto(null);
  }, [tree]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Fendre un nœud : on remplace la feuille `path` par deux fils. */
  const split = useCallback((path, a, b) => {
    const node = nodeAt(tree, path);
    if (!node || a * b !== node.n) {
      setError(t('tools.numberLab.primes.splitInvalid', { a, b, value: node?.n ?? '?' }));

      return;
    }
    setError(null);
    onChange(replaceAt(tree, path, { n: node.n, left: { n: Math.min(a, b) }, right: { n: Math.max(a, b) } }));
    setPicking(null);
  }, [tree, onChange, t]);

  /** §24 : la machine fend, UNE feuille par étape, à partir de l'arbre courant. */
  const startAuto = useCallback((start) => {
    setAuto({ id: `${Date.now()}-${JSON.stringify(start)}`, start });
    setPicking(null);
    setError(null);
    player.start();
  }, [player]);

  const canAuto = Boolean(tree) && firstCompositeLeafPath(tree) !== null;

  if (!tree) {
    return (
      <section className="sa-ml-nb__section">
        <h3 className="sa-ml-nb__heading">{t('tools.numberLab.primes.tree')}</h3>
        <p className="sa-ml-nb__hint">{t('tools.numberLab.primes.treeHint')}</p>
        <div className="sa-ml-nb__row">
          <ValueInput
            value={360}
            onChange={(next) => next >= 2 && onChange({ n: Math.abs(Math.trunc(next)) })}
            label={t('tools.numberLab.valueLabel')}
            integer
            min={2}
          />
          <button type="button" className="sa-ml-nb__button" onClick={() => onChange({ n: 360 })}>
            {t('tools.numberLab.primes.treeStart', { value: 360 })}
          </button>
        </div>
        {/* Les nombres du manuel, et l'arbre construit pas à pas (60 → 2 × 30 → …). */}
        <div className="sa-ml-nb__row sa-ml-nb__row--wrap" data-ml-nb-tree-presets>
          <span className="sa-ml-nb__label">{t('tools.numberLab.primes.treePresets')}</span>
          {TREE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className="sa-ml-kit-chip"
              onClick={() => onChange({ n: preset })}
              data-ml-nb-tree-preset={preset}
            >
              <bdi dir="ltr">{preset}</bdi>
            </button>
          ))}
          <button
            type="button"
            className="sa-ml-nb__button sa-ml-nb__button--ghost"
            onClick={() => { onChange({ n: 60 }); startAuto({ n: 60 }); }}
            data-ml-nb-tree-auto
          >
            <Wand2 size={14} aria-hidden="true" />
            {t('tools.numberLab.primes.treeAuto')}
          </button>
        </div>
      </section>
    );
  }

  const pairs = picking ? factorPairs(nodeAt(tree, picking)?.n ?? 0).filter(([a]) => a > 1) : [];
  // Pendant un déroulé, l'arbre se regarde : on ne fend pas à la main.
  const onPick = auto ? null : (path) => { setPicking(path); setError(null); };

  return (
    <section className="sa-ml-nb__section" data-ml-nb-tree={auto ? 'auto' : 'manual'}>
      <header className="sa-ml-nb__panel-head">
        <h3 className="sa-ml-nb__heading">{t('tools.numberLab.primes.tree')}</h3>
        <div className="sa-ml-nb__controls">
          <button
            type="button"
            className="sa-ml-nb__button sa-ml-nb__button--ghost"
            onClick={() => startAuto(tree)}
            disabled={!canAuto}
            data-ml-nb-tree-autosplit
          >
            <Wand2 size={14} aria-hidden="true" />
            {t('tools.numberLab.primes.autoSplit')}
          </button>
          <button type="button" className="sa-ml-nb__button sa-ml-nb__button--ghost" onClick={() => { onChange(null); setPicking(null); setAuto(null); }}>
            <RotateCcw size={14} aria-hidden="true" />
            {t('tools.numberLab.primes.treeReset')}
          </button>
        </div>
      </header>
      <p className="sa-ml-nb__hint">{t(auto ? 'tools.numberLab.steps.tree.autoHint' : 'tools.numberLab.primes.treeHint')}</p>

      {auto && <StepPlayer player={player} {...practice.player} sticky progress={boardProgress(frames, player.cursor)} dataAttr="data-ml-nb-step" />}

      <div className={`sa-ml-nb__tree${compact ? ' is-compact' : ''}`}>
        <TreeNode node={shown} path={[]} onPick={onPick} picking={picking} />
      </div>

      {auto && (
        <MathBoard
          {...practice.board}
          frames={frames}
          cursor={player.cursor}
          problem={`${auto.start.n} = \\ ?`}
          dataAttr="data-ml-nb-tree-frame"
        />
      )}

      {error && <p className="sa-ml-nb__error" role="alert">{error}</p>}

      {/* La lecture de l'arbre, niveau par niveau (construction À LA MAIN) : 60 = 2 × 30 = 2 × 2 × 15 = … */}
      {!auto && levels.length > 1 && (
        <div className="sa-ml-nb__panel" data-ml-nb-tree-levels>
          <h4>{t('tools.numberLab.primes.treeLevels')}</h4>
          <p className="sa-ml-nb__muted">{t('tools.numberLab.primes.treeLevelsHint')}</p>
          <p className="sa-ml-nb__formula" dir="ltr">
            {levels.map((level) => level.join(' × ')).join(' = ')}
          </p>
        </div>
      )}

      {/* Le choix du couple : c'est ici que l'élève DÉCIDE. */}
      {picking && !auto && (
        <div className="sa-ml-nb__panel">
          <h4>{t('tools.numberLab.primes.splitPrompt', { value: nodeAt(tree, picking)?.n })}</h4>
          {pairs.length === 0 ? (
            <p>{t('tools.numberLab.primes.splitPrime', { value: nodeAt(tree, picking)?.n })}</p>
          ) : (
            <ul className="sa-ml-nb__chiplist" dir="ltr">
              {pairs.map(([a, b]) => (
                <li key={`${a}x${b}`}>
                  <button type="button" className="sa-ml-nb__chip" onClick={() => split(picking, a, b)}>
                    {t('tools.numberLab.primes.splitChoice', { a, b })}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* §23 : la décomposition, et sa VÉRIFICATION — à la main quand l'arbre est fini,
          en automatique seulement au DERNIER pas. */}
      {complete && factors && (!auto || autoDone) && (
        <div className="sa-ml-nb__panel sa-ml-nb__panel--result" data-ml-nb-tree-result>
          <h4>{t('tools.numberLab.primes.treeResult')}</h4>
          <p className="sa-ml-nb__formula sa-ml-nb__formula--big" dir="ltr">
            {formatNumber(shown.n)} = {factorizationToText(factors)}
          </p>
          <p className="sa-ml-nb__muted" dir="ltr">
            {t('tools.numberLab.primes.treeVerify', {
              product: factorizationProduct(factors), value: shown.n,
            })}
          </p>
          <p className="sa-ml-nb__callout">{t('tools.numberLab.primes.differentTrees')}</p>
        </div>
      )}
    </section>
  );
}

function TreeNode({ node, path, onPick, picking }) {
  const { t } = useTranslation('mathlab');
  if (!node) return null;
  const leaf = !node.left || !node.right;
  const prime = isPrime(node.n);
  const isPicking = picking && picking.join('.') === path.join('.');

  return (
    <div className="sa-ml-nb__tree-node">
      <button
        type="button"
        className={`sa-ml-nb__tree-value${prime ? ' is-prime' : ''}${leaf && !prime && onPick ? ' is-splittable' : ''}${isPicking ? ' is-picking' : ''}`}
        onClick={leaf && !prime && onPick ? () => onPick(path) : undefined}
        disabled={!leaf || prime || !onPick}
        aria-label={prime
          ? t('tools.numberLab.primes.leafLabel', { value: node.n })
          : t('tools.numberLab.primes.nodeLabel', { value: node.n })}
      >
        {node.n}
      </button>

      {!leaf && (
        <div className="sa-ml-nb__tree-children">
          <TreeNode node={node.left} path={[...path, 'left']} onPick={onPick} picking={picking} />
          <TreeNode node={node.right} path={[...path, 'right']} onPick={onPick} picking={picking} />
        </div>
      )}
    </div>
  );
}
