import { useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

/**
 * LA BANDE DE CHIFFRES ET SA VIRGULE (labo `decimal-comma`, MANIPULATION_CONTRACT §2tervicies) — une rangée de grosses tuiles de chiffre
 * dans un îlot LTR (chiffres latins), séparées par `len + 1` espaces, et une GRANDE boule ronde (≥ 48 px, elle se soulève sous le doigt)
 * qui tient la VIRGULE à l'un de ces espaces.
 *
 * LES TROIS CHEMINS (même résultat) : tirer la boule (elle suit le doigt, l'espace le plus proche s'allume, elle s'y pose au relâchement ;
 * relâchée plus loin que le dernier chiffre d'au moins un demi-pas, l'intention « hors bande » est rapportée) · TOUCHER un espace
 * (`[data-dc-gap]`, une zone d'un pas de large) · le CLAVIER sur la boule (← → Début Fin ; l'îlot est LTR : ← va à gauche).
 *
 * Sous chaque chiffre, la pastille de son RANG (couleur du rang) ; elle SUIT la virgule. Les zéros AJOUTÉS (monde `machine`) sont
 * des tuiles en pointillé, le plus extérieur se retire d'un toucher.
 *
 * DOM : [data-dc-slip=input|output][data-dc-point], [data-dc-digit=<i>][data-added], [data-dc-comma][data-point][data-dragging], [data-dc-gap=<j>],
 * [data-dc-rank=<i>][data-changed], [data-dc-ghost] (le « 0 » imprimé tout seul quand la virgule précède le premier chiffre).
 */
const PILL_NAME = (name) => name.replace(/^ال/, '');

export default function CommaSlip({
  role, str, pos, zl = 0, zr = 0, layout, ranks, editable = false, onRelease, onRemoveZero, changed = null,
  written, labels, showRanks = true, knobSize = 48, laneH = 60,
}) {
  const reduce = useReducedMotion();
  const len = str.length;
  const point = len - pos;
  const { tileW, tileH, gapW, pitch, width } = layout;
  const [drag, setDrag] = useState(null); // { x } — l'abscisse de la boule pendant le tirage
  const st = useRef(null);
  const rowRef = useRef(null);
  const knobX = drag ? drag.x : layout.gapCenter(pos);
  const over = pitch * 0.9;
  const nearest = drag ? layout.nearestGap(drag.x) : pos;
  const inRange = (j) => j >= 0 && j <= len;
  const glyph = Math.round(Math.min(tileW * 0.82, tileH * 0.72));

  const onDown = (e) => {
    if (!editable || (e.button != null && e.button > 0)) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    st.current = { x0: e.clientX, from: layout.gapCenter(pos), moved: false };
    setDrag({ x: st.current.from });
  };
  const onMove = (e) => {
    const s = st.current;
    if (!s) return;
    const dx = e.clientX - s.x0;
    if (!s.moved && Math.abs(dx) > 4) s.moved = true;
    setDrag({ x: Math.max(layout.gapCenter(0) - over, Math.min(layout.gapCenter(len) + over, s.from + dx)) });
  };
  const finish = (e, cancel) => {
    const s = st.current;
    st.current = null;
    if (!s) return;
    const x = Math.max(layout.gapCenter(0) - over, Math.min(layout.gapCenter(len) + over, s.from + (e.clientX - s.x0)));
    setDrag(null);
    if (!cancel && s.moved) onRelease?.(layout.nearestGap(x));
  };
  const onKey = (e) => {
    if (!editable) return;
    const map = { ArrowLeft: pos - 1, ArrowRight: pos + 1, ArrowDown: pos - 1, ArrowUp: pos + 1, Home: 0, End: len };
    if (!(e.key in map)) return;
    e.preventDefault();
    onRelease?.(map[e.key]);
  };

  const tiles = Array.from({ length: len }, (_, i) => {
    const added = i < zl ? 'left' : i >= len - zr ? 'right' : null;
    const outer = (added === 'left' && i === zl - 1) || (added === 'right' && i === len - zr);
    const hue = ranks[i]?.hue;
    const left = layout.tileLeft(i);
    const base = 'absolute flex items-center justify-center rounded-2xl font-black tabular-nums';
    const style = { left, top: 0, width: tileW, height: tileH, fontSize: glyph, lineHeight: 1 };
    if (added) {
      return (
        <button key={i} type="button" disabled={!editable || !outer} onClick={() => onRemoveZero?.(added)}
          data-dc-digit={i} data-added={added} aria-label={outer && editable ? labels.removeZero : undefined}
          className={`${base} border-2 border-dashed border-indigo-300 bg-white/70 text-indigo-300 outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${outer && editable ? 'cursor-pointer hover:bg-rose-50 hover:text-rose-400' : 'cursor-default'}`}
          style={style}>
          <bdi dir="ltr">{str[i]}</bdi>
          {outer && editable && <X className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-white text-rose-500 ring-1 ring-rose-200" strokeWidth={3} aria-hidden="true" />}
        </button>
      );
    }
    return (
      <div key={i} data-dc-digit={i} className={`${base} border-2 bg-white text-indigo-950 shadow-[0_5px_0_0_var(--sh)] ${editable ? 'pointer-events-none' : ''}`}
        style={{ ...style, borderColor: hue?.a ?? '#C7D2FE', '--sh': hue?.soft ?? '#E0E7FF', background: `linear-gradient(180deg,#FFFFFF 55%,${hue?.soft ?? '#EEF2FF'} 100%)` }}>
        <bdi dir="ltr">{str[i]}</bdi>
      </div>
    );
  });

  const commaX = layout.gapCenter(pos);
  return (
    <div dir="ltr" className="relative mx-auto select-none" style={{ width, touchAction: 'pan-y' }} data-dc-slip={role} data-dc-point={point}>
      {/* la voie de la boule : la boule + sa tige jusqu'à l'espace */}
      {editable && (
        <div className="relative" style={{ height: laneH }}>
          <div aria-hidden="true" className="absolute left-0 right-0 rounded-full bg-indigo-100" style={{ top: laneH - 18, height: 6 }} />
          <div aria-hidden="true" className="absolute rounded-full bg-indigo-500/80" style={{ left: knobX - 1.5, top: laneH - 22, width: 3, height: 22 }} />
          {!drag && [-1, 1].map((d) => (
            <span key={d} aria-hidden="true" data-dc-chevron className="pointer-events-none absolute flex items-center justify-center text-indigo-300"
              style={{ left: knobX + d * (knobSize / 2 + 15) - 9, top: 4 + knobSize / 2 - 9, width: 18, height: 18 }}>
              {d < 0 ? <ChevronLeft className="h-5 w-5" strokeWidth={3} /> : <ChevronRight className="h-5 w-5" strokeWidth={3} />}
            </span>
          ))}
          <button type="button" role="slider" aria-orientation="horizontal" aria-valuemin={0} aria-valuemax={len} aria-valuenow={point}
            aria-valuetext={written} aria-label={labels.comma}
            data-dc-comma data-point={point} data-dragging={drag ? 'true' : 'false'}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={(e) => finish(e, false)} onPointerCancel={(e) => finish(e, true)}
            onKeyDown={onKey}
            className="absolute flex touch-none items-center justify-center rounded-full border-[3px] border-indigo-700 bg-gradient-to-b from-indigo-400 to-indigo-600 text-white shadow-[0_8px_0_0_#3730A3,0_14px_22px_-10px_rgba(49,46,129,0.7)] outline-none focus-visible:ring-4 focus-visible:ring-amber-300 motion-reduce:transition-none"
            style={{
              width: knobSize, height: knobSize, left: knobX - knobSize / 2, top: (drag ? 0 : 4),
              transition: drag || reduce ? 'none' : 'left .16s cubic-bezier(.34,1.3,.64,1), top .12s', cursor: drag ? 'grabbing' : 'grab',
              transform: drag && !reduce ? 'scale(1.1)' : undefined,
            }}>
            <span aria-hidden="true" className="select-none font-black leading-none" style={{ fontSize: knobSize * 0.95, marginTop: -knobSize * 0.3 }}>,</span>
          </button>
        </div>
      )}

      {/* les tuiles de chiffre et les espaces */}
      <div ref={rowRef} className="relative" style={{ height: tileH + 8 }} data-dc-row>
        {editable && Array.from({ length: len + 1 }, (_, j) => {
          const left = Math.max(0, layout.gapCenter(j) - pitch / 2);
          const right = Math.min(width, layout.gapCenter(j) + pitch / 2);
          return (
            <button key={j} type="button" tabIndex={-1} data-dc-gap={j} data-here={j === pos ? 'true' : 'false'} aria-label={labels.gap}
              onClick={() => onRelease?.(j)}
              className="absolute top-0 cursor-pointer rounded-xl bg-transparent outline-none hover:bg-indigo-100/50"
              style={{ left, width: right - left, height: tileH + 8, background: drag && j === nearest && inRange(j) ? 'rgba(99,102,241,0.14)' : undefined }} />
          );
        })}
        {tiles}
        {/* la virgule écrite dans l'espace (rien après le dernier chiffre : un entier n'a pas de virgule) */}
        {pos < len && (
          <svg aria-hidden="true" data-dc-written-comma width={16} height={26} viewBox="0 0 16 26" className="pointer-events-none absolute"
            style={{ left: commaX - 8, top: tileH - 24, zIndex: 3 }}>
            <circle cx={8} cy={7} r={5} fill="#4338CA" />
            <path d="M11 9 Q10.5 16 4.5 22.5 Q8 17 5.5 11Z" fill="#4338CA" />
          </svg>
        )}
        {pos === 0 && gapW >= 16 && (
          <span aria-hidden="true" data-dc-ghost className="pointer-events-none absolute flex items-center justify-center rounded-lg border-2 border-dashed border-indigo-200 font-black text-indigo-400"
            style={{ left: 1, top: tileH * 0.22, width: gapW - 3, height: tileH * 0.56, fontSize: Math.min(26, gapW * 0.85), zIndex: 2 }}>
            <bdi dir="ltr">0</bdi>
          </span>
        )}
        {drag && inRange(nearest) && (
          <span aria-hidden="true" className="pointer-events-none absolute rounded-full bg-indigo-500/40" style={{ left: layout.gapCenter(nearest) - 3, top: -2, width: 6, height: tileH + 12, zIndex: 1 }} />
        )}
      </div>

      {/* les rangs : la pastille de chaque chiffre suit la virgule */}
      {showRanks && (
        <div className="relative" style={{ height: 38 }}>
          {ranks.map((r, i) => {
            const delta = changed ? changed.get(i) : undefined;
            const isChanged = delta !== undefined;
            return (
              <span key={i} data-dc-rank={i} data-exp={r.exp} data-changed={isChanged ? 'true' : 'false'}
                className={`absolute flex items-center justify-center rounded-xl px-0.5 text-center font-extrabold leading-[1.1] ${isChanged ? 'ring-2 ring-amber-400' : ''}`}
                dir="rtl"
                style={{ left: layout.tileLeft(i) - gapW * 0.22, width: tileW + gapW * 0.44, height: 36, top: 2, fontSize: tileW >= 52 ? 11.5 : tileW >= 40 ? 10.5 : 9.5, background: r.hue.soft, color: r.hue.edge ?? r.hue.a, transition: 'background .2s' }}>
                {PILL_NAME(r.name)}
                {isChanged && (
                  <bdi dir="ltr" data-dc-delta={delta} className="absolute -right-1 -top-2.5 rounded-full border border-amber-400 bg-amber-50 px-1 text-[10.5px] font-black leading-[15px] text-amber-900 shadow-sm">
                    {delta > 0 ? '+' : '−'}{Math.abs(delta)}
                  </bdi>
                )}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
