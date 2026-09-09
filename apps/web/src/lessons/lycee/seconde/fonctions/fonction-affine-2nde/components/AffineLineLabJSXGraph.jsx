import React, { useCallback, useRef, useState } from 'react';
import { JSXGraphBoard } from '../../../../../common/math-visualization/jsxgraph';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { ParamSlider } from '../../../../../common/components/AffineExplorer';
import { snapClamp, slopeFromHandle, handleYForSlope } from '../../../../../common/math-visualization/jsxgraph/pilotMath';
import { affine, imageOf, formatDec, TANK, TANK_RANGE } from './affineUtils';

/**
 * AffineLineLabJSXGraph — VARIANTE PILOTE de la courbe de TankLab.
 * Voir docs/experiments/JSXGRAPH_PILOT.md.
 *
 * CE QUE LE PILOTE TESTE : l'élève attrape LA DROITE elle-même, au lieu de
 * pousser deux curseurs à côté d'elle.
 *   — tirer la POIGNÉE DE PENTE (le point (1 ; a·1+b) sur la droite) fait
 *     PIVOTER la droite autour de (0 ; b) : a change, b ne bouge pas ;
 *   — tirer la POIGNÉE D'ORIGINE (le point (0 ; b)) fait GLISSER la droite :
 *     b change, a ne bouge pas.
 * C'est exactement la phrase que le module 1 étape 3 demande d'observer
 * (« la droite pivote autour de (0 ; b) : a règle la pente, pas le départ »),
 * mais produite par le geste de l'élève au lieu d'être lue sous un curseur.
 *
 * MÊME MATHÉMATIQUE : `affineUtils` reste le modèle ; ce composant ne
 * recalcule aucune image. Mêmes bornes, même pas (TANK.aStep / bStep) — les
 * deux implémentations sont donc aimantées de la même façon, et la
 * comparaison ne porte que sur le geste.
 *
 * CONTRAT : les curseurs a et b RESTENT (le glisser est le jumeau d'un
 * contrôle tap-first, jamais l'unique chemin — playbook §10.1/§12.3.5) ;
 * jamais gelé après validation ; repli sur CoordPlane si JSXGraph échoue.
 */
const R = TANK_RANGE;                      // x 0..10, y −10..40

export default function AffineLineLabJSXGraph({
  a, b, onChange,
  lockA = false, lockB = false,
  disabled = false,
  ariaLabel,
}) {
  const [live, setLive] = useState(null);   // { a, b } pendant le glisser
  const stateRef = useRef({ a, b, lockA, lockB, disabled });
  stateRef.current = { a, b, lockA, lockB, disabled };
  const commit = useRef(onChange);
  commit.current = onChange;

  const A = live?.a ?? a;
  const B = live?.b ?? b;

  const setup = useCallback((board, JXG, getData) => {
    // ── décor ──
    for (let k = 0; k <= 10; k += 1) {
      board.create('segment', [[k, R.yMin], [k, R.yMax]],
        { strokeColor: '#eef2f7', strokeWidth: 1, fixed: true, highlight: false, layer: 0 });
    }
    for (let k = R.yMin; k <= R.yMax; k += 10) {
      board.create('segment', [[R.xMin, k], [R.xMax, k]],
        { strokeColor: '#eef2f7', strokeWidth: 1, fixed: true, highlight: false, layer: 0 });
    }
    board.create('axis', [[0, 0], [1, 0]], { strokeColor: '#94a3b8', ticks: { visible: false }, fixed: true, highlight: false, name: 't', withLabel: false });
    board.create('axis', [[0, 0], [0, 1]], { strokeColor: '#94a3b8', ticks: { visible: false }, fixed: true, highlight: false, withLabel: false });

    // ── la droite, DÉRIVÉE de l'état (jamais une seconde vérité) ──
    const line = board.create('functiongraph', [
      (x) => { const d = getData(); return d.a * x + d.b; }, R.xMin, R.xMax,
    ], { strokeColor: '#0284c7', strokeWidth: 4, fixed: true, highlight: false, layer: 6 });

    // ── poignée d'ORIGINE : (0 ; b) — la droite GLISSE ──
    const hB = board.create('point', [0, b], {
      name: 'b', size: 6, strokeWidth: 3,
      fillColor: '#d97706', strokeColor: '#ffffff',
      label: { offset: [12, 6], fontSize: 15, cssStyle: 'font-weight:700' },
      showInfobox: false, layer: 9,
    });
    // ── poignée de PENTE : (1 ; a+b) — la droite PIVOTE autour de (0 ; b) ──
    const hA = board.create('point', [1, a + b], {
      name: 'a', size: 6, strokeWidth: 3,
      fillColor: '#4f46e5', strokeColor: '#ffffff',
      label: { offset: [12, 6], fontSize: 15, cssStyle: 'font-weight:700' },
      showInfobox: false, layer: 9,
    });

    // L'escalier +1 → +a, qui fait LIRE le coefficient directeur.
    board.create('segment', [() => [0, getData().b], () => [1, getData().b]],
      { strokeColor: '#0369a1', strokeWidth: 2.5, dash: 2, fixed: true, highlight: false, layer: 5 });
    board.create('segment', [() => [1, getData().b], () => [1, getData().a + getData().b]],
      { strokeColor: '#047857', strokeWidth: 2.5, dash: 2, fixed: true, highlight: false, layer: 5 });

    const pushB = (final) => {
      const s = stateRef.current;
      if (s.disabled || s.lockB) { hB.moveTo([0, s.b]); return; }
      const nb = snapClamp(hB.Y(), TANK.bMin, TANK.bMax, final ? TANK.bStep : 0.001);
      hB.moveTo([0, final ? nb : hB.Y()]);
      if (final) { setLive(null); commit.current?.({ a: s.a, b: nb, t: undefined }); }
      else setLive({ a: s.a, b: nb });
    };
    const pushA = (final) => {
      const s = stateRef.current;
      if (s.disabled || s.lockA) { hA.moveTo([1, s.a + s.b]); return; }
      // Le pivot est autour de (0 ; b) : a = y(1) − b, par construction.
      const na = snapClamp(slopeFromHandle(hA.Y(), s.b), TANK.aMin, TANK.aMax, final ? TANK.aStep : 0.001);
      hA.moveTo([1, handleYForSlope(final ? na : slopeFromHandle(hA.Y(), s.b), s.b)]);
      if (final) { setLive(null); commit.current?.({ a: na, b: s.b, t: undefined }); }
      else setLive({ a: na, b: s.b });
    };

    hB.on('drag', () => pushB(false));
    hB.on('up', () => pushB(true));
    hA.on('drag', () => pushA(false));
    hA.on('up', () => pushA(true));

    return (d) => {
      hB.setAttribute({ fixed: !!(d.disabled || d.lockB) });
      hA.setAttribute({ fixed: !!(d.disabled || d.lockA) });
      if (!d.dragging) {
        if (hB.Y() !== d.b) hB.moveTo([0, d.b]);
        if (hA.Y() !== handleYForSlope(d.a, d.b)) hA.moveTo([1, handleYForSlope(d.a, d.b)]);
      }
      board.update();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const f = affine(A, B);

  return (
    <div className="space-y-3">
      <JSXGraphBoard
        setup={setup}
        data={{ a: A, b: B, lockA, lockB, disabled, dragging: live !== null }}
        boundingbox={[R.xMin - 1.2, R.yMax + 4, R.xMax + 0.6, R.yMin - 4]}
        keepAspectRatio={false}
        aspect={0.62}
        ariaLabel={ariaLabel ?? `Droite V(t) = ${formatDec(A)} t + ${formatDec(B)}`}
        fallback={
          <CoordPlane
            range={R} unit={30} unitY={5} xStep={1} yStep={10}
            functions={[{ id: 'V', a: A, b: B, tone: 'sky' }]}
            intercept={{ y: B, label: `b = ${formatDec(B)}` }}
            axisLabels={{ x: 't', y: 'V' }} caption={false} disabled={disabled}
            ariaLabel={ariaLabel}
          />
        }
      />
      <p className="text-sm text-slate-700" aria-live="polite">
        <span className="font-mono font-bold">V(t) = {formatDec(A)}·t {B < 0 ? '−' : '+'} {formatDec(Math.abs(B))}</span>
        {' · '}pente <strong>a = {formatDec(A)}</strong> · départ <strong>b = {formatDec(B)}</strong>
        {' · '}V(1) = {formatDec(imageOf(f, 1))} L
      </p>
      {/* Les curseurs RESTENT : le glisser est le jumeau du contrôle
          tap-first, jamais l'unique chemin (accessibilité + playbook). */}
      {!disabled && (
        <div className="space-y-2">
          <ParamSlider label="a" ariaLabel="le débit a" value={a}
            onChange={(v) => onChange?.({ a: v, b, t: undefined })}
            min={TANK.aMin} max={TANK.aMax} step={TANK.aStep} tone="indigo" unit=" L/min" disabled={lockA} />
          <ParamSlider label="b" ariaLabel="le volume initial b" value={b}
            onChange={(v) => onChange?.({ a, b: v, t: undefined })}
            min={TANK.bMin} max={TANK.bMax} step={TANK.bStep} tone="amber" unit=" L" disabled={lockB} />
        </div>
      )}
    </div>
  );
}
