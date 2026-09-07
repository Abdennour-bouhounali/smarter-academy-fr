import React from 'react';
import { ParamSlider } from '../../../../../common/components/AffineExplorer';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { boxVolume, boxBase, boxExists, curvePieces, BOX, formatDec, SHEET } from './fonctionsUtils';

/**
 * BoxLab — l'interaction SIGNATURE de la leçon : la boîte sans couvercle.
 *
 * Activity               une feuille carrée de 20 cm ; on découpe un carré de
 *                        côté x à chaque coin, on plie : une boîte.
 * Mathematical objective le volume DÉPEND de x, et seulement de x : choisir x,
 *                        c'est fixer le volume — une valeur et une seule. La
 *                        boîte n'existe que pour 0 < x < 10.
 * Student action         régler x (glissière, ± , clavier), enregistrer la
 *                        boîte obtenue ; comparer les boîtes enregistrées.
 * Controlled variable    x, la découpe (cm), par pas de 0,5.
 * Mathematical state     x et la liste des couples (x ; V) enregistrés ; le
 *                        volume est CALCULÉ (boxVolume), jamais saisi.
 * Visual consequence     le patron se redessine (coins rognés, fond qui
 *                        rétrécit), la boîte en perspective monte et se
 *                        resserre ; le volume s'affiche ; puis le tableau,
 *                        puis les points sur le repère (registres révélés
 *                        progressivement : `showTable`, `showGraph`, `showCurve`).
 * Expected observation   « même x, même volume, toujours » ; « le volume monte
 *                        puis redescend » ; « à x = 0 et x = 10 il n'y a pas de
 *                        boîte » ; « les points enregistrés sont sur une courbe ».
 * Misconception targeted « la plus grande boîte est pour x = 5 (la moitié) » ;
 *                        « une fonction, c'est une formule » — ici aucune formule
 *                        n'est montrée, la dépendance existe avant.
 * Formalization          aucune ici : le mot « fonction » est donné en pied de
 *                        module ; la formule attend le module 3.
 *
 * Aucun nombre dans le SVG (§17bis) : le patron et la boîte sont des formes ;
 * toutes les valeurs vivent dans le DOM.
 */
export const GRAPH_RANGE = { xMin: 0, xMax: 10, yMin: 0, yMax: 600 };
export const GRAPH_UNIT = 30;
export const GRAPH_UNIT_Y = 0.4;

function Net({ x }) {
  const S = 160; const k = S / SHEET; const c = x * k; const o = 15;
  const corners = [[o, o], [o + S - c, o], [o, o + S - c], [o + S - c, o + S - c]];
  return (
    <g>
      <rect x={o} y={o} width={S} height={S} fill="#fef3c7" stroke="#b45309" strokeWidth="2" />
      {c > 0 && corners.map(([cx, cy], i) => (
        <rect key={i} x={cx} y={cy} width={c} height={c} fill="#fecdd3" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4 3" />
      ))}
      {c > 0 && c < S / 2 && (
        <g stroke="#b45309" strokeWidth="1.5" strokeDasharray="5 4">
          <line x1={o + c} y1={o + c} x2={o + S - c} y2={o + c} />
          <line x1={o + c} y1={o + S - c} x2={o + S - c} y2={o + S - c} />
          <line x1={o + c} y1={o + c} x2={o + c} y2={o + S - c} />
          <line x1={o + S - c} y1={o + c} x2={o + S - c} y2={o + S - c} />
        </g>
      )}
      {c > 0 && c < S / 2 && <rect x={o + c} y={o + c} width={S - 2 * c} height={S - 2 * c} fill="#fde68a" fillOpacity="0.7" />}
    </g>
  );
}

/** La boîte pliée, en perspective cavalière (base b × b, hauteur x). */
function Box3D({ x }) {
  const k = 3.2; const b = boxBase(x) * k; const h = x * k;
  const ox = 205; const oy = 150; const dx = 0.45; const dy = -0.3;
  if (!boxExists(x)) {
    // Feuille à plat (x = 0) ou plus de fond (x = 10) : rien à plier.
    return <g><rect x={ox} y={oy - 4} width={x === 0 ? 64 : 0.01} height={4} fill="#fde68a" stroke="#b45309" /></g>;
  }
  const P = (u, v, w) => ({ x: ox + u + v * dx * b, y: oy - w + v * dy * b });
  const f = [P(0, 0, 0), P(b, 0, 0), P(b, 0, h), P(0, 0, h)];
  const r = [P(b, 0, 0), P(b, 1, 0), P(b, 1, h), P(b, 0, h)];
  const bt = [P(0, 0, h), P(b, 0, h), P(b, 1, h), P(0, 1, h)];
  const pts = (arr) => arr.map((p) => `${p.x},${p.y}`).join(' ');
  return (
    <g>
      <polygon points={pts(bt)} fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
      <polygon points={pts(f)} fill="#fde68a" stroke="#b45309" strokeWidth="1.5" />
      <polygon points={pts(r)} fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
    </g>
  );
}

export default function BoxLab({
  x, onChange, records = [], onRecord, disabled = false,
  showTable = false, showGraph = false, showCurve = false,
}) {
  const exists = boxExists(x);
  const v = exists ? boxVolume(x) : null;
  const already = records.some((r) => r.x === x);
  const sorted = [...records].sort((a, b) => a.x - b.x);
  const best = sorted.reduce((m, r) => (m === null || r.v > m.v ? r : m), null);
  return (
    <div className="space-y-3" role="group" aria-label="La boîte sans couvercle">
      <svg viewBox="0 0 300 190" className="w-full max-w-[460px] mx-auto block bg-white rounded-xl border-2 border-slate-200 select-none" role="img"
        aria-label={exists ? `Patron : feuille de 20 cm, coins de ${formatDec(x)} cm découpés ; boîte de base ${formatDec(boxBase(x))} cm et de hauteur ${formatDec(x)} cm` : `Découpe de ${formatDec(x)} cm : aucune boîte`}>
        <Net x={x} />
        <Box3D x={x} />
      </svg>
      <div className="flex flex-wrap gap-2 text-sm font-mono font-bold tabular-nums" aria-live="polite">
        <span className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">découpe x = {formatDec(x)} cm</span>
        {exists ? (
          <>
            <span className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">fond {formatDec(boxBase(x))} × {formatDec(boxBase(x))} cm</span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">hauteur {formatDec(x)} cm</span>
            <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white">volume {formatDec(v)} cm³</span>
          </>
        ) : (
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 font-sans font-semibold">{x === 0 ? 'rien découpé : pas de boîte (hauteur 0)' : 'tout découpé : pas de boîte (fond 0)'}</span>
        )}
      </div>
      {!disabled && (
        <div className="space-y-2">
          <ParamSlider label="x" ariaLabel="la découpe x" value={x} onChange={onChange} min={0} max={10} step={0.5} tone="rose" unit=" cm" />
          {onRecord && (
            <button type="button" onClick={onRecord} disabled={!exists || already}
              className="min-h-[44px] px-4 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              {already ? 'Déjà enregistrée' : '📌 Enregistrer cette boîte'}
            </button>
          )}
        </div>
      )}
      {showTable && sorted.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
          <table className="w-full text-sm font-mono tabular-nums">
            <caption className="sr-only">Boîtes enregistrées : découpe et volume</caption>
            <thead><tr className="bg-slate-50 text-slate-600"><th scope="row" className="px-3 py-2 text-left font-bold">x (cm)</th>{sorted.map((r) => <td key={r.x} className="px-3 py-2 text-center">{formatDec(r.x)}</td>)}</tr></thead>
            <tbody><tr className="border-t border-slate-100"><th scope="row" className="px-3 py-2 text-left font-bold">V (cm³)</th>{sorted.map((r) => <td key={r.x} className={`px-3 py-2 text-center font-bold ${best && r.x === best.x ? 'text-indigo-700' : 'text-slate-800'}`}>{formatDec(r.v)}</td>)}</tr></tbody>
          </table>
        </div>
      )}
      {showGraph && (
        <CoordPlane
          range={GRAPH_RANGE} unit={GRAPH_UNIT} unitY={GRAPH_UNIT_Y} xStep={1} yStep={100}
          points={sorted.map((r) => ({ id: `r${r.x}`, x: r.x, y: r.v, color: '#4f46e5' }))}
          curves={showCurve ? curvePieces(BOX, GRAPH_RANGE).map((pc, i) => ({ id: `V${i}`, points: pc, tone: 'indigo', width: 2.5 })) : []}
          cursor={{ x }}
          axisLabels={{ x: 'x', y: 'V' }}
          caption={false}
          ariaLabel={`Repère : ${sorted.length} boîte(s) enregistrée(s) placées en (x ; V)`}
        />
      )}
    </div>
  );
}
