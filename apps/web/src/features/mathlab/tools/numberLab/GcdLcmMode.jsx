import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlaskConical, ZoomIn, ZoomOut, RotateCcw, Search } from 'lucide-react';
import { StepList, LabPanel } from '../../shared/LabKit.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';
import CheckedInput from './CheckedInput.jsx';
import DifferencesPanel from './DifferencesPanel.jsx';
import { readPositiveInteger } from './differences.js';
import { GCD_METHODS } from './numberState.js';
import { lcm, multiples, gcdLcmRelation, areCoprime } from './numberTheory.js';
import { differencesFrames, euclidFrames, euclidDrawnCount, pgcdProblem } from './gcdFrames.js';
import { factorMethodSteps, listsSteps, ppcmSteps, localizeSteps } from './solutionSteps.js';
import { runExperiment } from './practice.js';

/**
 * §27 à §31 — Q.M.A et M.M.A.
 *
 * ── Rien n'est donné d'avance (exigence de la propriétaire, 2026-09-30) ──
 * Aucun PGCD ni PPCM n'est écrit en tête du mode. Chaque méthode est une
 * DÉRIVATION déroulée par le lecteur partagé (`useStepReveal` + `StepPlayer`) :
 *   soustractions, Euclide       au tableau (MathBoard, frames de gcdFrames.js),
 *                              une soustraction / une division à la fois ;
 *   facteurs premiers, listes     formule par formule (StepList, solutionSteps.js).
 * Le PGCD est le DERNIER pas. Le PPCM se calcule ENSUITE (il a besoin du
 * PGCD) : son panneau reste fermé tant que le PGCD n'est pas atteint, puis se
 * déroule à son tour ; la relation `PGCD × PPCM = a × b` n'est vérifiée à
 * l'écran qu'après le PPCM. Changer a, b ou la méthode ramène à l'énoncé.
 *
 * ── §28 : la géométrie d'Euclide ────────────────────────────────────────
 * Le rectangle 84 × 36 se remplit de carrés de 36 QUAND la division
 * « 84 = 36 × 2 + 12 » tombe au tableau, puis le reste 36 × 12 de carrés de
 * 12. Le dernier carré EST le PGCD — il ne prend sa couleur qu'au dernier pas.
 *
 * ── §31 : une loi qu'on MESURE ──────────────────────────────────────────
 * `PGCD × PPCM = a × b` n'est pas affirmée : les deux membres sont calculés
 * séparément et comparés (`gcdLcmRelation.holds`).
 */
export default function GcdLcmMode({ state, onChange, compact, onSaveNote, reducedMotion = false }) {
  const { t } = useTranslation('mathlab');
  const { a, b, method } = state;
  const [experiment, setExperiment] = useState(null);
  // §28 : le pas MIS EN AVANT — survolé dans la liste, ou dans le dessin.
  const [activeStep, setActiveStep] = useState(null);

  const board = useMemo(() => {
    if (method === 'differences') return differencesFrames(a, b);
    if (method === 'euclid') return euclidFrames(a, b);

    return null;
  }, [method, a, b]);
  const listSolution = useMemo(() => {
    if (method === 'factors') return factorMethodSteps(a, b);
    if (method === 'lists') return listsSteps(a, b);

    return null;
  }, [method, a, b]);
  const frames = board?.frames ?? null;
  const total = frames ? frames.length : (listSolution?.steps.length ?? 0);
  const player = useStepReveal(total, { resetKey: `${method}|${a}|${b}` });

  const ppcm = useMemo(() => ppcmSteps(a, b) ?? [], [a, b]);
  const ppcmPlayer = useStepReveal(ppcm.length, { resetKey: `${a}|${b}` });

  const relation = useMemo(() => gcdLcmRelation(a, b), [a, b]);
  const multiplesA = useMemo(() => multiples(a, 14), [a]);
  const multiplesB = useMemo(() => multiples(b, 14), [b]);
  const theLcm = lcm(a, b);

  // Le PGCD n'est « su » qu'au dernier pas de la méthode (une trace bornée n'en donne pas).
  // (Rien à dérouler — a = 1 par les facteurs premiers — ne bloque pas le PPCM.)
  const gcdKnown = (total === 0 || player.done) && !(method === 'differences' && board?.run?.truncated);
  const lcmKnown = gcdKnown && ppcmPlayer.done;

  const setNumber = (key) => (next) => onChange({ [key]: next });

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--gcdlcm">
      <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
        {/* a et b : des naturels NON NULS, et un refus dit pourquoi (differences.readPositiveInteger). */}
        <CheckedInput
          value={a}
          onValue={setNumber('a')}
          read={readPositiveInteger}
          errorText={(code) => t(`tools.numberLab.gcdLcm.differences.errors.${code}`)}
          label={t('tools.numberLab.gcdLcm.a')}
          dataAttr="data-ml-nb-gcd-a"
        />
        <CheckedInput
          value={b}
          onValue={setNumber('b')}
          read={readPositiveInteger}
          errorText={(code) => t(`tools.numberLab.gcdLcm.differences.errors.${code}`)}
          label={t('tools.numberLab.gcdLcm.b')}
          dataAttr="data-ml-nb-gcd-b"
        />
        <label className="sa-ml-nb__field">
          <span className="sa-ml-nb__label">{t('tools.numberLab.gcdLcm.method')}</span>
          <select className="sa-ml-nb__select" value={method} onChange={(event) => onChange({ method: event.target.value })} data-ml-nb-gcd-method>
            {GCD_METHODS.map((m) => (
              <option key={m} value={m}>{t(`tools.numberLab.gcdLcm.methods.${m}`)}</option>
            ))}
          </select>
        </label>
      </div>

      {/* §29 : les curseurs — on fait varier et on regarde (chaque changement ramène à l'énoncé). */}
      <div className="sa-ml-nb__slider-row">
        <input
          type="range" className="sa-ml-nb__slider" min={1} max={200} value={Math.min(200, a)}
          onChange={(event) => onChange({ a: Number(event.target.value) })}
          aria-label={t('tools.numberLab.gcdLcm.sliderA')}
        />
        <input
          type="range" className="sa-ml-nb__slider" min={1} max={200} value={Math.min(200, b)}
          onChange={(event) => onChange({ b: Number(event.target.value) })}
          aria-label={t('tools.numberLab.gcdLcm.sliderB')}
        />
      </div>

      {/* ── PGCD par soustractions successives — la méthode par défaut ─────────── */}
      {method === 'differences' && board && (
        <DifferencesPanel key={`${a}-${b}`} a={a} b={b} onChange={onChange} reducedMotion={reducedMotion} board={board} player={player} />
      )}

      {/* ── §27, §28 : Euclide, une division par étape ───────────────── */}
      {method === 'euclid' && board && (
        <EuclidPanel
          a={a} b={b} board={board} player={player} compact={compact}
          activeStep={activeStep} onHoverStep={setActiveStep}
        />
      )}

      {/* ── §27 : par les facteurs premiers, formule par formule ─────── */}
      {method === 'factors' && listSolution && (
        <section className="sa-ml-nb__panel" data-ml-nb-gcd-factors>
          <h4>{t('tools.numberLab.gcdLcm.methods.factors')}</h4>
          <p className="sa-ml-nb__muted">{t('tools.numberLab.gcdLcm.columnsHint')}</p>
          <StepPlayer player={player} sticky dataAttr="data-ml-nb-step" />
          {player.cursor >= 1 && (
            <table className="sa-ml-nb__table" dir="ltr">
              <thead>
                <tr>
                  <th scope="col" />
                  {listSolution.factors.primes.map((p) => <th key={p} scope="col">{p}</th>)}
                </tr>
              </thead>
              <tbody>
                <FactorRow label={String(a)} factors={listSolution.factors.a} primes={listSolution.factors.primes} />
                {player.cursor >= 2 && <FactorRow label={String(b)} factors={listSolution.factors.b} primes={listSolution.factors.primes} />}
                {player.cursor >= 3 && <FactorRow label={t('tools.numberLab.gcdLcm.gcdShort')} factors={listSolution.factors.gcd} primes={listSolution.factors.primes} tone="gcd" />}
                {lcmKnown && <FactorRow label={t('tools.numberLab.gcdLcm.lcmShort')} factors={listSolution.factors.lcm} primes={listSolution.factors.primes} tone="lcm" />}
              </tbody>
            </table>
          )}
          <StepList steps={localizeSteps(t, listSolution.steps)} revealUpTo={player.cursor - 1} dataAttr="data-ml-nb-gcd-steps" />
        </section>
      )}

      {/* ── §27, §30 : les listes ───────────────────────────────────── */}
      {method === 'lists' && listSolution && (
        <section className="sa-ml-nb__panel" data-ml-nb-gcd-lists>
          <h4>{t('tools.numberLab.gcdLcm.methods.lists')}</h4>
          <StepPlayer player={player} sticky dataAttr="data-ml-nb-step" />
          <StepList steps={localizeSteps(t, listSolution.steps)} revealUpTo={player.cursor - 1} dataAttr="data-ml-nb-gcd-steps" />
          {gcdKnown && <p className="sa-ml-nb__muted">{t('tools.numberLab.gcdLcm.commonDivisorsHint')}</p>}

          {/* §30 : les deux listes de multiples ; leur PREMIÈRE rencontre ne s'allume qu'une fois le PPCM calculé. */}
          <h5 className="sa-ml-nb__subheading">{t('tools.numberLab.gcdLcm.firstCommon')}</h5>
          <div className="sa-ml-nb__multiples">
            <MultipleRow label={t('tools.numberLab.gcdLcm.multiplesOfA', { value: a })} list={multiplesA} target={lcmKnown ? theLcm : null} />
            <MultipleRow label={t('tools.numberLab.gcdLcm.multiplesOfB', { value: b })} list={multiplesB} target={lcmKnown ? theLcm : null} />
          </div>
        </section>
      )}

      {/* Ce que le PGCD APPREND — seulement quand il est atteint. */}
      {gcdKnown && areCoprime(a, b) && <p className="sa-ml-nb__callout">{t('tools.numberLab.gcdLcm.coprime')}</p>}
      {gcdKnown && a !== b && (a % b === 0 || b % a === 0) && (
        <p className="sa-ml-nb__callout">
          {t('tools.numberLab.gcdLcm.divides', { a: Math.min(a, b), b: Math.max(a, b) })}
        </p>
      )}

      {/* ── PPCM : trois chemins vers le même nombre ; le calcul vient APRÈS le PGCD ── */}
      <LabPanel id="numberLab.gcdLcm.ppcm" title={t('tools.numberLab.gcdLcm.ppcm.title')}>
      <div data-ml-nb-ppcm>
        <p className="sa-ml-nb__muted">{t('tools.numberLab.gcdLcm.ppcm.intro')}</p>
        <ul className="sa-ml-nb__ppcm-ways">
          <li>
            {t('tools.numberLab.gcdLcm.ppcm.byLists')}
            {method !== 'lists' && (
              <button type="button" className="sa-ml-nb__link" onClick={() => onChange({ method: 'lists' })}>
                {t('tools.numberLab.gcdLcm.ppcm.showLists')}
              </button>
            )}
          </li>
          <li>
            {t('tools.numberLab.gcdLcm.ppcm.byFactors')}
            {method !== 'factors' && (
              <button type="button" className="sa-ml-nb__link" onClick={() => onChange({ method: 'factors' })}>
                {t('tools.numberLab.gcdLcm.ppcm.showFactors')}
              </button>
            )}
          </li>
          <li>{t('tools.numberLab.gcdLcm.ppcm.byGcd')}</li>
        </ul>
        {gcdKnown ? (
          <div data-ml-nb-ppcm-derivation>
            <StepPlayer player={ppcmPlayer} dataAttr="data-ml-nb-ppcm-step" title={t('tools.numberLab.steps.ppcm.playerTitle')} />
            <StepList steps={localizeSteps(t, ppcm)} revealUpTo={ppcmPlayer.cursor - 1} dataAttr="data-ml-nb-ppcm-steps" />
          </div>
        ) : (
          <p className="sa-ml-nb__hint" data-ml-nb-ppcm-locked>{t('tools.numberLab.steps.ppcm.locked')}</p>
        )}
      </div>
      </LabPanel>

      {/* ── §31 : la relation, MESURÉE — après le PPCM ──────────────── */}
      {relation && (
        <LabPanel id="numberLab.gcdLcm.relation" title={t('tools.numberLab.gcdLcm.relation')} className="sa-ml-nb__panel--result">
          <p className="sa-ml-nb__formula sa-ml-nb__formula--big" dir="ltr">
            {t('tools.numberLab.gcdLcm.relationFormula')}
          </p>
          {lcmKnown ? (
            <>
              <p className="sa-ml-nb__formula" dir="ltr" data-ml-nb-relation-check>
                {t('tools.numberLab.gcdLcm.relationCheck', {
                  gcd: relation.gcd, lcm: relation.lcm, product: relation.product,
                  a: relation.a, b: relation.b, ab: relation.abProduct,
                })}
              </p>
              {relation.holds && (
                <>
                  <p className="sa-ml-nb__verdict is-prime">{t('tools.numberLab.gcdLcm.relationHolds')}</p>
                  <p className="sa-ml-nb__muted">{t('tools.numberLab.gcdLcm.relationHint')}</p>
                </>
              )}
            </>
          ) : (
            <p className="sa-ml-nb__hint">{t('tools.numberLab.steps.relationLocked')}</p>
          )}
          <div className="sa-ml-nb__controls">
            <button
              type="button" className="sa-ml-nb__button sa-ml-nb__button--ghost"
              onClick={() => setExperiment(runExperiment('gcdLcmProduct', Date.now() % 100000))}
            >
              <FlaskConical size={14} aria-hidden="true" />
              {t('tools.numberLab.practice.experiments.run')}
            </button>
            <button
              type="button" className="sa-ml-nb__link"
              onClick={() => onSaveNote?.(t('tools.numberLab.practice.law.gcdLcmProduct'))}
            >
              {t('tools.numberLab.notes.add')}
            </button>
          </div>

          {experiment && (
            <table className="sa-ml-nb__table" dir="ltr">
              <thead>
                <tr>
                  <th scope="col">a</th><th scope="col">b</th>
                  <th scope="col">{t('tools.numberLab.gcdLcm.gcdShort')}</th>
                  <th scope="col">{t('tools.numberLab.gcdLcm.lcmShort')}</th>
                  <th scope="col">×</th><th scope="col">a × b</th>
                </tr>
              </thead>
              <tbody>
                {experiment.rows.map((row, index) => (
                  <tr key={index}>
                    <td>{row.a}</td><td>{row.b}</td><td>{row.gcd}</td>
                    <td>{row.lcm}</td><td>{row.product}</td><td>{row.ab}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </LabPanel>
      )}
    </div>
  );
}

/**
 * §27, §28 — Euclide AU TABLEAU : une division par étape (désigner, relier
 * par « ÷ », q et r qui tombent, l'égalité acquise). Ses carrés se posent
 * dans le rectangle quand elle tombe ; la liste liée (survol ↔ carrés) ne
 * contient que les divisions déjà posées.
 */
function EuclidPanel({ a, b, board, player, compact, activeStep, onHoverStep }) {
  const { t } = useTranslation('mathlab');
  const { euclid, frames } = board;
  const drawn = euclidDrawnCount(frames, player.cursor);
  const practice = useBoardPractice(frames, player, `${a}|${b}`);
  const steps = euclid.steps.slice(0, drawn);

  return (
    <section className="sa-ml-nb__panel" data-ml-nb-euclid>
      <h4>{t('tools.numberLab.gcdLcm.methods.euclid')}</h4>
      <p className="sa-ml-nb__muted">{t('tools.numberLab.gcdLcm.euclidHint')}</p>
      <StepPlayer player={player} {...practice.player} sticky progress={boardProgress(frames, player.cursor)} dataAttr="data-ml-nb-step" />

      {/* « D'un seul regard » (MATH_LAB §3.5) : les carrés À CÔTÉ du tableau qui les pose. */}
      <div className="sa-ml-nb__duo" dir="ltr">
        <div className="sa-ml-nb__duo-figure">
          {/* §28 : LE MÊME calcul, en rectangles — au rythme du tableau. */}
          <h5 className="sa-ml-nb__subheading">{t('tools.numberLab.gcdLcm.geometric')}</h5>
          <p className="sa-ml-nb__muted">{t('tools.numberLab.gcdLcm.geometricHint')}</p>
          <EuclidRectangles
            steps={steps}
            a={a} b={b} gcd={euclid.gcd} compact={compact}
            final={player.done}
            activeStep={activeStep}
            onHoverStep={onHoverStep}
          />

          {/* §28 : chaque ligne POSÉE est liée à ses carrés (survol dans les deux sens). */}
          {steps.length > 0 && (
            <ol className="sa-ml-nb__steps sa-ml-nb__steps--linked" dir="ltr" data-ml-nb-euclid-divisions={steps.length}>
              {steps.map((s, index) => (
                <li
                  key={index}
                  className={`${player.done && s.remainder === 0 ? 'is-final' : ''}${activeStep === index ? ' is-active' : ''}`}
                >
                  <button
                    type="button"
                    className="sa-ml-nb__step-link"
                    onPointerEnter={() => onHoverStep(index)}
                    onPointerLeave={() => onHoverStep(null)}
                    onFocus={() => onHoverStep(index)}
                    onBlur={() => onHoverStep(null)}
                    aria-pressed={activeStep === index}
                  >
                    <span className="sa-ml-nb__step-swatch" data-depth={index % 4} aria-hidden="true" />
                    {t('tools.numberLab.gcdLcm.euclidStep', s)}
                    <span className="sa-ml-nb__step-note">
                      {t('tools.numberLab.gcdLcm.squareCount', { count: s.quotient, side: s.divisor })}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="sa-ml-nb__duo-board">
          <MathBoard {...practice.board} frames={frames} cursor={player.cursor} problem={pgcdProblem(a, b)} dataAttr="data-ml-nb-euclid-frame" />
        </div>
      </div>
    </section>
  );
}

function FactorRow({ label, factors, primes, tone = null }) {
  const map = new Map(factors.map(({ p, e }) => [p, e]));

  return (
    <tr className={tone ? `is-${tone}` : undefined}>
      <th scope="row">{label}</th>
      {primes.map((p) => <td key={p}>{map.get(p) ? `${p}^${map.get(p)}` : '—'}</td>)}
    </tr>
  );
}

function MultipleRow({ label, list, target }) {
  return (
    <div className="sa-ml-nb__multiple-row">
      <span className="sa-ml-nb__bar-label">{label}</span>
      <ul className="sa-ml-nb__chiplist" dir="ltr">
        {list.map((value) => (
          <li key={value}>
            <span className={`sa-ml-nb__chip${value === target ? ' is-current' : ''}`}>{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * §28 — LE RECTANGLE D'EUCLIDE.
 *
 * Chaque pas pose `quotient` carrés de côté `divisor` dans ce qui reste du
 * rectangle, en alternant horizontal/vertical comme le fait l'algorithme.
 * Le dernier carré posé a pour côté le PGCD : c'est la démonstration, pas
 * une illustration.
 */
function EuclidRectangles({ steps, a, b, gcd: result, compact, final = true, activeStep, onHoverStep }) {
  const { t } = useTranslation('mathlab');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef(null);
  const svgRef = useRef(null);

  // La GOUTTIÈRE où s'écrivent les dimensions : au-dessus et à gauche du
  // rectangle, JAMAIS dedans — un nombre posé sur un carré se confond avec
  // le côté de ce carré, et le dessin ment.
  const GUTTER = 24;
  const width = compact ? 300 : 460;
  const long = Math.max(a, b);
  const short = Math.min(a, b);
  const scale = width / long;
  const height = short * scale;

  /**
   * On rejoue le découpage pour placer les carrés — la même récurrence
   * qu'Euclide, mais en pixels. Chaque carré GARDE l'indice de son pas :
   * c'est ce qui permet de relier une ligne de calcul à ses carrés, et
   * inversement (§28 : le dessin et l'équation doivent être LE MÊME objet).
   */
  const squares = useMemo(() => {
    const out = [];
    let originX = 0;
    let originY = 0;
    let horizontal = true;
    steps.forEach((step, index) => {
      for (let i = 0; i < step.quotient && out.length < 500; i += 1) {
        const side = step.divisor * scale;
        out.push({
          x: horizontal ? originX + i * side : originX,
          y: horizontal ? originY : originY + i * side,
          side,
          step: index,
          value: step.divisor,
          // Le rang du carré dans son pas : « le 2ᵉ des 2 carrés de 36 ».
          ordinal: i + 1,
        });
      }
      if (horizontal) originX += step.quotient * step.divisor * scale;
      else originY += step.quotient * step.divisor * scale;
      horizontal = !horizontal;
    });

    return out;
  }, [steps, scale]);

  /** Le RESTE de chaque pas : le rectangle qui part au pas suivant. */
  const remainders = useMemo(() => {
    const out = [];
    let originX = 0;
    let originY = 0;
    let horizontal = true;
    steps.forEach((step, index) => {
      if (horizontal) {
        originX += step.quotient * step.divisor * scale;
        if (step.remainder > 0) {
          out.push({
            step: index,
            x: originX, y: originY,
            w: step.remainder * scale,
            h: step.divisor * scale,
          });
        }
      } else {
        originY += step.quotient * step.divisor * scale;
        if (step.remainder > 0) {
          out.push({
            step: index,
            x: originX, y: originY,
            w: step.divisor * scale,
            h: step.remainder * scale,
          });
        }
      }
      horizontal = !horizontal;
    });

    return out;
  }, [steps, scale]);

  /* ── Le zoom et le déplacement (pour voir les DERNIERS carrés) ──────── */

  const zoomBy = useCallback((factor) => {
    setZoom((current) => Math.min(12, Math.max(1, current * factor)));
  }, []);

  const reset = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  /** Cadrer le DERNIER pas : les plus petits carrés, ceux du PGCD. */
  const focusLast = useCallback(() => {
    const last = squares.filter((sq) => sq.step === steps.length - 1);
    if (last.length === 0) return;
    const minX = Math.min(...last.map((s) => s.x));
    const maxX = Math.max(...last.map((s) => s.x + s.side));
    const minY = Math.min(...last.map((s) => s.y));
    const maxY = Math.max(...last.map((s) => s.y + s.side));
    const boxW = Math.max(1, maxX - minX);
    const boxH = Math.max(1, maxY - minY);
    const next = Math.min(12, Math.max(1, Math.min(width / boxW, height / boxH) * 0.8));
    setZoom(next);
    setPan({
      x: width / 2 - ((minX + maxX) / 2) * next,
      y: height / 2 - ((minY + maxY) / 2) * next,
    });
  }, [squares, steps.length, width, height]);

  const onPointerDown = useCallback((event) => {
    if (zoom <= 1) return;
    panRef.current = { x: event.clientX, y: event.clientY, pan };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [zoom, pan]);

  const onPointerMove = useCallback((event) => {
    const drag = panRef.current;
    if (!drag) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (width + GUTTER) / rect.width;
    setPan({
      x: drag.pan.x + (event.clientX - drag.x) * ratio,
      y: drag.pan.y + (event.clientY - drag.y) * ratio,
    });
  }, [width]);

  const endPan = useCallback((event) => {
    panRef.current = null;
    event.currentTarget?.releasePointerCapture?.(event.pointerId);
  }, []);

  const onWheel = useCallback((event) => {
    event.preventDefault();
    zoomBy(event.deltaY > 0 ? 1 / 1.2 : 1.2);
  }, [zoomBy]);

  // Le carré du PGCD ne prend sa couleur qu'au DERNIER pas : avant, rien ne le distingue.
  const lastStep = final ? steps.length - 1 : -1;

  return (
    <div className="sa-ml-nb__euclid">
      <div className="sa-ml-nb__euclid-actions">
        <button type="button" className="sa-ml-nb__mini" onClick={() => zoomBy(1.4)} aria-label={t('tools.numberLab.line.zoomIn')}>
          <ZoomIn size={15} aria-hidden="true" />
        </button>
        <button type="button" className="sa-ml-nb__mini" onClick={() => zoomBy(1 / 1.4)} aria-label={t('tools.numberLab.line.zoomOut')}>
          <ZoomOut size={15} aria-hidden="true" />
        </button>
        <button type="button" className="sa-ml-nb__button sa-ml-nb__button--ghost" onClick={focusLast}>
          <Search size={14} aria-hidden="true" />
          {t('tools.numberLab.gcdLcm.focusLast')}
        </button>
        <button type="button" className="sa-ml-nb__button sa-ml-nb__button--ghost" onClick={reset}>
          <RotateCcw size={14} aria-hidden="true" />
          {t('tools.numberLab.gcdLcm.resetView')}
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width + GUTTER} ${height + GUTTER}`}
        width="100%"
        role="img"
        aria-label={t('tools.numberLab.gcdLcm.geometricLabel', { a: long, b: short })}
        preserveAspectRatio="xMidYMid meet"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
      >
        {/* Les DIMENSIONS, dans la gouttière : le rectangle reste intact. */}
        <text x={GUTTER + width / 2} y={13} className="sa-ml-nb__euclid-dim" textAnchor="middle">{long}</text>
        <text
          x={11} y={GUTTER + height / 2}
          className="sa-ml-nb__euclid-dim"
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(-90 11 ${GUTTER + height / 2})`}
        >
          {short}
        </text>

        {/* Le dessin est FENÊTRÉ : on zoome dedans sans déborder du cadre. */}
        <clipPath id="sa-ml-nb-euclid-clip">
          <rect x={0} y={0} width={width} height={height} />
        </clipPath>

        <g transform={`translate(${GUTTER} ${GUTTER})`}>
          <g clipPath="url(#sa-ml-nb-euclid-clip)">
            <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
              <rect x={0} y={0} width={width} height={height} className="sa-ml-nb__euclid-frame" />

              {/* Le RESTE de chaque pas, hachuré : c'est lui qui devient le
                  rectangle du pas suivant — le lien entre deux lignes. */}
              {remainders.map((rest) => (
                <rect
                  key={`rest-${rest.step}`}
                  x={rest.x} y={rest.y} width={rest.w} height={rest.h}
                  className={`sa-ml-nb__euclid-rest${activeStep === rest.step ? ' is-active' : ''}`}
                />
              ))}

              {squares.map((square, index) => {
                const dim = activeStep !== null && activeStep !== square.step;
                const fits = square.side * zoom >= 22;

                return (
                  <g
                    key={index}
                    className={`sa-ml-nb__euclid-group${dim ? ' is-dimmed' : ''}${activeStep === square.step ? ' is-active' : ''}`}
                    onPointerEnter={() => onHoverStep?.(square.step)}
                    onPointerLeave={() => onHoverStep?.(null)}
                  >
                    <rect
                      x={square.x} y={square.y}
                      width={Math.max(0.5, square.side - 1 / zoom)}
                      height={Math.max(0.5, square.side - 1 / zoom)}
                      className={`sa-ml-nb__euclid-square is-depth${square.step % 4}${square.step === lastStep ? ' is-gcd' : ''}`}
                      strokeWidth={1 / zoom}
                    />
                    {/* Le côté ÉCRIT dans le carré — seulement s'il y tient.
                        Le zoom le fait apparaître : c'est à cela qu'il sert. */}
                    {fits && (
                      <text
                        x={square.x + square.side / 2}
                        y={square.y + square.side / 2}
                        className="sa-ml-nb__euclid-label"
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{ fontSize: `${Math.min(13, Math.max(7, square.side * zoom * 0.3)) / zoom}px` }}
                      >
                        {square.value}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        </g>
      </svg>

      {/* §28 : le dernier carré EST le PGCD — dit en toutes lettres. */}
      {final && steps.length > 0 && steps[steps.length - 1].remainder === 0 && (
        <p className="sa-ml-nb__result-line" dir="ltr">
          {t('tools.numberLab.gcdLcm.geometricResult', { gcd: result })}
        </p>
      )}
    </div>
  );
}
