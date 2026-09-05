import React from 'react';
import { ParamSlider } from '../../../../../common/components/AffineExplorer';
import { formatDec, scaleFigure, scaleFactors } from './propUtils';

/**
 * ScaleBox — agrandir une figure et lire ce que deviennent ses mesures.
 *
 * Activity            régler le rapport k (0,5 à 3, pas 0,5) ; le rectangle
 *                     de base se redessine agrandi, pavé de copies de la base.
 * Mathematical objective  faire VOIR que les longueurs sont multipliées par
 *                     k, mais l'aire par k² (le rectangle agrandi contient k²
 *                     copies de la base) et le volume par k³.
 * Student action      glisser ou ± sur k.
 * Controlled variable k, le rapport d'agrandissement.
 * Mathematical state  { base, k } ; toutes les mesures viennent de
 *                     `scaleFigure` (propUtils) — jamais écrites à la main.
 * Visual consequence  le rectangle grandit dans le cadre ; le quadrillage en
 *                     copies de la base montre k × k copies ; les mesures se
 *                     mettent à jour dans le DOM.
 * Expected observation « ×2 sur les côtés, mais 4 copies : ×4 sur l'aire ».
 * Misconception targeted  « agrandir ×2 double l'aire ».
 *
 * SÉCURITÉ D'AFFICHAGE : le viewBox est calculé pour k = kMax (le plus grand
 * rectangle possible + marge) ; aucun texte dans le SVG — toutes les lectures
 * sont des lignes DOM à largeur réservée.
 */
const CELL = 24;   // 1 cm en unités SVG
const PAD = 10;

export default function ScaleBox({
  base = { w: 4, h: 2 },
  k,
  onKChange,
  kMin = 0.5,
  kMax = 3,
  showArea = true,
  showVolume = false,
  showTiles = true,
  disabled = false,
  frozen = false,
  caption,
}) {
  const fig = scaleFigure(base, k);
  const factors = scaleFactors(k);
  const W = base.w * kMax * CELL + 2 * PAD;
  const H = base.h * kMax * CELL + 2 * PAD;
  const w = fig.w * CELL;
  const h = fig.h * CELL;
  const bw = base.w * CELL;
  const bh = base.h * CELL;
  const reading = `Rectangle de base ${formatDec(base.w)} cm sur ${formatDec(base.h)} cm, agrandi de rapport ${formatDec(k)} : ${formatDec(fig.w)} cm sur ${formatDec(fig.h)} cm, aire ${formatDec(fig.area)} cm²`;

  // Les lignes du pavage en copies de la base, coupées au rectangle agrandi.
  const vLines = [];
  for (let x = bw; x < w - 1e-6; x += bw) vLines.push(x);
  const hLines = [];
  for (let y = bh; y < h - 1e-6; y += bh) hLines.push(y);

  return (
    <div className="w-full rounded-2xl border-2 border-slate-300 bg-slate-50 p-3 sm:p-4 space-y-3" role={frozen ? 'img' : 'group'} aria-label={reading}>
      {caption && <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wide">{caption}</p>}
      {!frozen && (
        <ParamSlider label="k" ariaLabel="le rapport d'agrandissement k" value={k} onChange={(v) => !disabled && onKChange?.(v)}
          min={kMin} max={kMax} step={0.5} tone="indigo" disabled={disabled} />
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[520px] mx-auto block bg-white rounded-xl border border-slate-200" role="img" aria-label={reading}>
        {/* le quadrillage 1 cm */}
        {Array.from({ length: Math.round(base.w * kMax) + 1 }, (_, i) => (
          <line key={`gx${i}`} x1={PAD + i * CELL} y1={PAD} x2={PAD + i * CELL} y2={H - PAD} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {Array.from({ length: Math.round(base.h * kMax) + 1 }, (_, i) => (
          <line key={`gy${i}`} x1={PAD} y1={PAD + i * CELL} x2={W - PAD} y2={PAD + i * CELL} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {/* le rectangle agrandi, ancré en bas à gauche */}
        <rect x={PAD} y={H - PAD - h} width={w} height={h} fill="#c7d2fe" stroke="#4f46e5" strokeWidth="3" />
        {showTiles && vLines.map((x) => <line key={`v${x}`} x1={PAD + x} y1={H - PAD - h} x2={PAD + x} y2={H - PAD} stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="4 3" />)}
        {showTiles && hLines.map((y) => <line key={`h${y}`} x1={PAD} y1={H - PAD - y} x2={PAD + w} y2={H - PAD - y} stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="4 3" />)}
        {/* la base, en surimpression */}
        <rect x={PAD} y={H - PAD - bh} width={bw} height={bh} fill="#fbbf24" fillOpacity="0.55" stroke="#b45309" strokeWidth="2.5" />
      </svg>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2 space-y-0.5">
          <p className="text-xs font-mono uppercase tracking-wide text-amber-800">Base (orange)</p>
          <p className="font-mono tabular-nums text-slate-800">{formatDec(base.w)} cm × {formatDec(base.h)} cm{base.d !== undefined ? ` × ${formatDec(base.d)} cm` : ''}</p>
          <p className="font-mono tabular-nums text-slate-700">périmètre {formatDec(measuresOf(base).perimeter)} cm{showArea ? ` · aire ${formatDec(measuresOf(base).area)} cm²` : ''}{showVolume && base.d !== undefined ? ` · volume ${formatDec(measuresOf(base).volume)} cm³` : ''}</p>
        </div>
        <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 px-3 py-2 space-y-0.5" aria-live="polite">
          <p className="text-xs font-mono uppercase tracking-wide text-indigo-800">Agrandie (k = {formatDec(k)})</p>
          <p className="font-mono tabular-nums text-slate-800">{formatDec(fig.w)} cm × {formatDec(fig.h)} cm{fig.d !== undefined ? ` × ${formatDec(fig.d)} cm` : ''}</p>
          <p className="font-mono tabular-nums text-slate-700">
            périmètre {formatDec(fig.perimeter)} cm <span className="text-indigo-700 font-semibold">(× {formatDec(factors.length)})</span>
            {showArea && <> · aire {formatDec(fig.area)} cm² <span className="text-indigo-700 font-semibold">(× {formatDec(factors.area)})</span></>}
            {showVolume && fig.volume !== undefined && <> · volume {formatDec(fig.volume)} cm³ <span className="text-indigo-700 font-semibold">(× {formatDec(factors.volume)})</span></>}
          </p>
        </div>
      </div>
    </div>
  );
}

const measuresOf = (base) => scaleFigure(base, 1);
