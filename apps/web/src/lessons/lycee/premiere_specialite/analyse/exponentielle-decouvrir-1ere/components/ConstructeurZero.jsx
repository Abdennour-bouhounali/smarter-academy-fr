import React, { useRef, useState } from 'react';
import { PAS_EULER, NB_PAS, constructionDepuisZero, fr } from './expoUtils';

/**
 * ConstructeurZero — le raisonnement par l'absurde, rendu MANIPULABLE.
 *
 * Activity               même geste qu'au module 1 — l'élève ATTRAPE le point
 *                        et le TIRE — mais la hauteur de départ est 0. La règle
 *                        « la pente vaut la hauteur » impose alors une pente
 *                        nulle : où que le doigt aille, le point RETOMBE sur la
 *                        ligne plate. L'élève ne lit pas une démonstration, il
 *                        se heurte à elle.
 * Mathematical objective si la fonction cherchée valait 0 en un point, elle y
 *                        serait plate, donc nulle partout — ce qui contredit
 *                        f(0) = 1. Elle ne s'annule donc nulle part.
 * Student action         tirer le point, et constater qu'il ne reste pas où on
 *                        le met. Chemin CLAVIER complet, comme au module 1.
 * Mathematical state     le nombre de segments tentés ; la ligne elle-même est
 *                        DÉRIVÉE de `constructionDepuisZero`, jamais dessinée
 *                        à la main.
 * Visual consequence     la ligne reste plate sur toute la largeur, et une
 *                        trace montre d'où le point est retombé.
 * Expected observation   « je ne peux pas la faire décoller ».
 * Misconception targeted « la courbe pourrait bien toucher l'axe quelque part
 *                        très à gauche ».
 *
 * JAMAIS GELÉ après réussite : `verrouille` ne porte que le verrou
 * d'ANTÉRIORITÉ de l'étape sur la précédente.
 */
const PLAT = '#0f172a';
const FANTOME = '#f59e0b';
const AXE = '#334155';

const MARGES = { left: 40, right: 24, top: 26, bottom: 30 };
const UNITE_X = 270;
const HAUTEUR = 200;
// L'étendue verticale est SYMÉTRIQUE autour de 0 : l'élève doit pouvoir tirer
// le point aussi haut que bas, et voir dans les deux cas qu'il retombe.
const Y_MAX = 1;

export default function ConstructeurZero({ essais, onEssai, verrouille = false }) {
  const svgRef = useRef(null);
  const glisse = useRef(false);
  const [tire, setTire] = useState(null);   // où le doigt tient le point
  const [attrape, setAttrape] = useState(false);

  const largeurVB = MARGES.left + MARGES.right + UNITE_X;
  const hauteurVB = MARGES.top + MARGES.bottom + HAUTEUR;
  const unitX = UNITE_X / (NB_PAS * PAS_EULER);
  const unitY = HAUTEUR / (2 * Y_MAX);

  const toSvg = (x, y) => ({
    x: MARGES.left + x * unitX,
    y: MARGES.top + (Y_MAX - y) * unitY,
  });
  const yDepuisSvg = (sy) => Y_MAX - (sy - MARGES.top) / unitY;

  const index = Math.min(essais, NB_PAS - 1);
  const fini = essais >= NB_PAS;

  // La ligne construite depuis zéro : DÉRIVÉE du modèle, et plate par
  // construction — c'est tout l'argument.
  const ligne = constructionDepuisZero().slice(0, Math.min(essais, NB_PAS) + 1);

  const positionDepuisPointeur = (clientY) => {
    if (verrouille || fini) return null;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const sy = ((clientY - rect.top) / rect.height) * hauteurVB;
    return Math.max(-Y_MAX, Math.min(Y_MAX, yDepuisSvg(sy)));
  };

  const onPointerDown = (e) => {
    if (verrouille || fini) return;
    glisse.current = true;
    setAttrape(true);
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* pointeur déjà relâché */
    }
    setTire(positionDepuisPointeur(e.clientY));
  };

  const onPointerMove = (e) => {
    if (!glisse.current) return;
    setTire(positionDepuisPointeur(e.clientY));
  };

  /**
   * AU RELÂCHEMENT, LA RÈGLE REPREND LA MAIN. La pente imposée vaut la hauteur
   * actuelle, c'est-à-dire 0 : le segment est donc plat, et le point retombe
   * exactement d'où il est parti. C'est le cœur de la manipulation — l'élève
   * décide, la règle refuse.
   */
  const finDuGlisser = (e) => {
    if (!glisse.current) return;
    glisse.current = false;
    setAttrape(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* idem */
    }
    setTire(null);
    onEssai?.();
  };

  const onKeyDown = (e) => {
    if (verrouille || fini) return;
    if (!['ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'ArrowUp') setTire(0.6);
    else if (e.key === 'ArrowDown') setTire(-0.6);
    else {
      setTire(null);
      onEssai?.();
    }
  };

  const pointe = toSvg((index + 1) * PAS_EULER, tire ?? 0);
  const base = toSvg(index * PAS_EULER, 0);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-sky-200 bg-sky-50 px-3 py-2 text-center">
        <div className="text-[13px] font-semibold text-sky-900">Même règle, mais on part de la hauteur 0</div>
        <div className="text-base font-black text-sky-800">pente imposée = hauteur actuelle = 0</div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${largeurVB} ${hauteurVB}`}
        className="w-full h-auto max-h-[280px] touch-none select-none rounded-xl border border-slate-200 bg-white"
        role="group"
        aria-label={
          fini
            ? 'Quatre segments tentés depuis la hauteur zéro : la ligne est restée plate sur toute la largeur.'
            : `Segment ${index + 1} sur ${NB_PAS}, depuis la hauteur zéro. Tire le point : au relâchement, la règle le ramène à la hauteur zéro. Flèches haut et bas, puis Entrée.`
        }
        tabIndex={verrouille || fini ? -1 : 0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finDuGlisser}
        onPointerCancel={finDuGlisser}
        style={{ cursor: verrouille || fini ? 'default' : attrape ? 'grabbing' : 'grab' }}
      >
        <g pointerEvents="none">
          {/* L'axe des abscisses, sur lequel la ligne est collée. */}
          <line
            x1={toSvg(0, 0).x} y1={toSvg(0, 0).y}
            x2={toSvg(NB_PAS * PAS_EULER, 0).x} y2={toSvg(0, 0).y}
            stroke={AXE} strokeWidth="1.5"
          />
          <line
            x1={toSvg(0, -Y_MAX).x} y1={toSvg(0, -Y_MAX).y}
            x2={toSvg(0, Y_MAX).x} y2={toSvg(0, Y_MAX).y}
            stroke={AXE} strokeWidth="1.5"
          />
          <text x={toSvg(0, 0).x - 8} y={toSvg(0, 0).y + 4} textAnchor="end" fontSize="11" fill="#64748b" fontFamily="ui-monospace, monospace">0</text>

          {/* La trace du point tiré : d'où il vient de retomber. */}
          {tire !== null && Math.abs(tire) > 0.02 && (
            <line
              x1={base.x} y1={base.y} x2={pointe.x} y2={pointe.y}
              stroke={FANTOME} strokeWidth="2.5" strokeDasharray="5 4"
            />
          )}

          {/* La ligne réellement construite : plate, par construction. */}
          {ligne.length > 1 && (
            <polyline
              points={ligne.map((p) => { const s = toSvg(p.x, p.y); return `${s.x},${s.y}`; }).join(' ')}
              fill="none" stroke={PLAT} strokeWidth="3.5" strokeLinecap="round"
            />
          )}
          {ligne.map((p, k) => {
            const s = toSvg(p.x, p.y);
            return <circle key={k} cx={s.x} cy={s.y} r="4.5" fill={PLAT} />;
          })}
        </g>

        {/* La poignée. */}
        {!fini && !verrouille && (
          <g pointerEvents="none">
            <circle cx={pointe.x} cy={pointe.y} r="13" fill={FANTOME} opacity="0.18" />
            <circle cx={pointe.x} cy={pointe.y} r="7.5" fill={FANTOME} stroke="#ffffff" strokeWidth="2.5" />
          </g>
        )}
      </svg>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">hauteur actuelle</div>
          <div className="font-mono font-bold tabular-nums text-slate-900">0</div>
        </div>
        <div className="rounded-lg border-2 border-sky-300 bg-sky-50 px-2 py-2">
          <div className="text-[13px] text-sky-700">pente imposée</div>
          <div className="font-mono font-black tabular-nums text-sky-900">0</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">hauteur obtenue</div>
          <div className="font-mono font-bold tabular-nums text-slate-900">{fr(0)}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <span className="font-semibold text-slate-600">Segments tentés :</span>
        {Array.from({ length: NB_PAS }, (_, k) => (
          <span
            key={k}
            className={
              'inline-flex items-center justify-center w-7 h-7 rounded-lg border font-mono font-bold ' +
              (k < essais
                ? 'bg-slate-800 border-slate-900 text-white'
                : k === essais
                ? 'bg-white border-sky-400 text-sky-700'
                : 'bg-slate-50 border-slate-200 text-slate-400')
            }
          >
            {k + 1}
          </span>
        ))}
        {!fini && <span className="text-slate-500">— tire le point, puis relâche</span>}
      </div>
    </div>
  );
}
