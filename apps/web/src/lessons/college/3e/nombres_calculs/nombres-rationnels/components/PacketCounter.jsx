import React, { useCallback, useRef } from 'react';
import MathText from '../../../../../common/components/MathText';
import { formatFrac, normalize, toDecimal, plainFrac } from './rationalUtils';

/**
 * PacketCounter — diviser, c'est COMPTER des paquets.
 *
 * Activity: remplir une longueur (3/2) avec des paquets d'une taille donnée
 *   (1/4), posés bout à bout.
 * Mathematical objective: a ÷ b répond à « combien de fois b tient-il dans
 *   a ? ». Quand b < 1, la réponse est PLUS GRANDE que a — c'est ce que
 *   « diviser rend plus petit » empêche de voir, et ça se compte.
 * Student action: glisser le paquet vers la droite pour en poser un de plus,
 *   vers la gauche pour en retirer un ; ou les touches + / − / flèches.
 * Controlled variable: le nombre de paquets posés.
 * Mathematical state: `placed` appartient au module ; la longueur couverte,
 *   le reste et le verdict en sont dérivés — rien n'est écrit en dur.
 * Visual consequence: chaque paquet posé colorie une tranche de la barre ; le
 *   dernier qui dépasse est refusé avec sa raison.
 * Expected observation: « il en faut SIX, alors que 3/2 ne vaut que 1,5 ».
 * Misconception targeted: « une division donne toujours un résultat plus
 *   petit » (piège n°3 de la leçon).
 * Feedback: le module rend les Feedback ; le composant ne juge pas — il montre.
 * Scaffolding: aucune limite d'essais, retrait toujours possible.
 *
 * Composant CONTRÔLÉ.
 *
 * @param {{num,den}} total       la longueur à remplir
 * @param {{num,den}} packet      la taille d'un paquet
 * @param {number} placed         paquets déjà posés
 * @param {(n:number)=>void} onPlaced
 * @param {(reason:string)=>void} [onRefuse]
 * @param {number} [max=2]        borne droite de l'axe
 * @param {boolean} [frozen=false]
 */
export default function PacketCounter({
  total, packet, placed, onPlaced, onRefuse = null, max = 2, frozen = false,
}) {
  const T = normalize(total);
  const P = normalize(packet);
  const tv = toDecimal(T, 8);
  const pv = toDecimal(P, 8);
  const fits = Math.round(tv / pv);          // le compte exact, CALCULÉ
  const covered = placed * pv;
  const full = Math.abs(covered - tv) < 1e-8;

  const trackRef = useRef(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX) => {
    const el = trackRef.current;
    if (!el || frozen) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0) return;
    const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const n = Math.round((t * max) / pv);
    if (n === placed) return;
    if (n * pv > tv + 1e-8) {
      onRefuse?.(`Un paquet de plus dépasserait ${plainFrac(T)} : il ne reste plus assez de place.`);
      onPlaced(fits);
      return;
    }
    onPlaced(Math.max(0, n));
  }, [frozen, max, pv, tv, placed, onPlaced, onRefuse, fits, T]);

  const down = (e) => {
    if (frozen) return;
    dragging.current = true;
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* relâché */ }
    setFromClientX(e.clientX);
  };
  const move = (e) => { if (dragging.current) setFromClientX(e.clientX); };
  const up = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* idem */ }
  };

  const step = (d) => {
    const n = placed + d;
    if (n < 0) return;
    if (n * pv > tv + 1e-8) {
      onRefuse?.(`Un paquet de plus dépasserait ${plainFrac(T)} : il ne reste plus assez de place.`);
      return;
    }
    onPlaced(n);
  };

  const key = (e) => {
    if (frozen) return;
    const moves = {
      ArrowRight: () => step(1), ArrowUp: () => step(1), '+': () => step(1),
      ArrowLeft: () => step(-1), ArrowDown: () => step(-1), '-': () => step(-1),
      Home: () => onPlaced(0), End: () => onPlaced(fits),
    };
    if (moves[e.key]) { e.preventDefault(); moves[e.key](); }
  };

  const pct = (v) => `${(v / max) * 100}%`;

  return (
    <div className="space-y-2" data-packets={placed} data-packets-full={full ? 'true' : 'false'}>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-3">
        <div
          ref={trackRef}
          role="slider"
          tabIndex={frozen ? -1 : 0}
          aria-label={`Poser des paquets de ${plainFrac(P)} dans ${plainFrac(T)}`}
          aria-valuenow={placed}
          aria-valuemin={0}
          aria-valuemax={fits}
          aria-valuetext={`${placed} paquet${placed > 1 ? 's' : ''} de ${plainFrac(P)}`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={key}
          style={{ touchAction: 'none' }}
          className="relative h-16 rounded-xl border-2 border-slate-300 bg-slate-50 cursor-ew-resize focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 overflow-hidden"
        >
          {/* la longueur à remplir */}
          <div className="absolute inset-y-0 left-0 bg-indigo-100 border-r-4 border-indigo-600" style={{ width: pct(tv) }} />
          {/* les paquets posés, bout à bout */}
          {Array.from({ length: placed }, (_, i) => (
            <div
              key={i}
              className="absolute top-2 bottom-2 bg-emerald-400/80 border-2 border-emerald-600 rounded"
              style={{ left: pct(i * pv), width: `calc(${pct(pv)} - 2px)` }}
            />
          ))}
          {/* le bord de la cible, toujours lisible */}
          <div className="absolute inset-y-0 border-l-2 border-dashed border-indigo-700" style={{ left: pct(tv) }} />
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={frozen || placed === 0}
            aria-label="Retirer un paquet"
            className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-emerald-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            −
          </button>
          <span className="font-mono text-base font-extrabold text-slate-800 tabular-nums px-2 text-center">
            {placed} paquet{placed > 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={frozen}
            aria-label="Poser un paquet de plus"
            className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-emerald-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            +
          </button>
        </div>

        <p className="text-center text-sm text-slate-600">
          <MathText>{`$${formatFrac(P)}$`}</MathText> × {placed} ={' '}
          <strong className="font-mono">{(covered).toFixed(2).replace('.', ',')}</strong>
          {' '}sur <MathText>{`$${formatFrac(T)}$`}</MathText>
        </p>
      </div>
    </div>
  );
}
