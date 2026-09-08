import React, { useCallback, useEffect, useRef, useState } from 'react';
import { frac, memeNombre, texte } from './rationnels';

/**
 * FractionLineLab — la manipulation SIGNATURE de la leçon (§6bis).
 *
 * L'élève dispose d'une droite graduée où seuls les ENTIERS sont marqués. Il
 * choisit d'abord en combien de parts couper l'unité — c'est le dénominateur,
 * et la droite se re-gradue à l'instant — puis il fait glisser un curseur qui
 * saute de graduation en graduation : c'est le numérateur.
 *
 * L'idée que cela rend visible : une fraction n'est pas « deux nombres », ni
 * un dessin de parts. C'est UNE POSITION sur la droite, aussi légitime que
 * celle d'un entier. Et deux écritures différentes peuvent désigner la même
 * position — le choc du module 1.
 *
 * Cause → effet immédiat : changer le découpage re-gradue la droite ET
 * repositionne le curseur à la même LONGUEUR quand c'est possible ; glisser le
 * curseur réécrit la fraction. Aucun bouton « Valider » entre le geste et sa
 * conséquence.
 *
 * Sécurité visuelle (§17bis) : la géométrie est CALCULÉE à partir du nombre de
 * graduations. Les libellés chiffrés ne sont posés que sur les ENTIERS et sur
 * la position courante — jamais sur toutes les graduations —, si bien qu'aucun
 * texte ne peut en chevaucher un autre, même en seizièmes. La lecture de la
 * fraction courante vit dans le DOM, sous le dessin, jamais en <text> par
 * dessus le tracé.
 */
const H = 118;
const AXIS_Y = 56;
const PAD_X = 22;

export default function FractionLineLab({
  den,                      // en combien de parts l'unité est coupée
  onDen,                    // (den) => void — null si le découpage est fixé
  num,                      // position du curseur, en nombre de parts
  onNum,                    // (num) => void
  maxUnits = 1,             // longueur de la droite, en unités
  densChoices = [2, 3, 4, 6, 8],
  cible = null,             // { num, den } — la marque fantôme à atteindre
  width = 620,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const boxRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [boxW, setBoxW] = useState(null);

  // La largeur épouse la place réellement disponible : une unité SVG vaut un
  // pixel CSS, la hauteur reste H, et rien ne rapetisse dans une carte étroite.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => { if (e.contentRect.width > 0) setBoxW(e.contentRect.width); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = Math.max(240, Math.min(boxW ?? width, width));
  const total = den * maxUnits;                    // nombre de graduations
  const innerW = W - PAD_X * 2;
  const step = innerW / total;                     // px par part
  const xOf = (k) => PAD_X + k * step;

  const clamp = useCallback((k) => Math.max(0, Math.min(total, k)), [total]);

  const move = useCallback((k) => {
    const next = clamp(Math.round(k));
    if (next !== num) onNum?.(next, den);
  }, [clamp, den, num, onNum]);

  const numFromClientX = useCallback((clientX) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return num;
    const ratio = (clientX - box.left) / box.width;
    return (ratio * W - PAD_X) / step;
  }, [W, num, step]);

  useEffect(() => {
    if (!dragging) return undefined;
    const onMove = (e) => move(numFromClientX(e.touches ? e.touches[0].clientX : e.clientX));
    const stop = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };
  }, [dragging, move, numFromClientX]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); move(num + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); move(num - 1); }
    if (e.key === 'Home') { e.preventDefault(); move(0); }
    if (e.key === 'End') { e.preventDefault(); move(total); }
  };

  /**
   * Changer le découpage conserve la LONGUEUR quand la nouvelle graduation
   * peut l'exprimer ; sinon on garde la marque la plus proche. C'est ce qui
   * fait vivre « 3/4 et 6/8 sont au même endroit » : en passant de 4 à 8, le
   * curseur ne bouge pas d'un pixel, mais son écriture change.
   */
  const changerDen = (d) => {
    if (!onDen) return;
    const longueur = num / den;
    const nouveauNum = Math.round(longueur * d);
    onDen(d);
    // Le SECOND argument porte le dénominateur qui vient d'être choisi. Sans
    // lui, un module qui teste `frac(n, den)` dans son handler lirait le `den`
    // de l'état PRÉCÉDENT — les deux `setState` étant groupés dans le même
    // rendu — et manquerait précisément l'instant où l'écriture change alors
    // que la position ne bouge pas, qui est tout le propos du module 1.
    onNum?.(nouveauNum, d);
  };

  const courante = frac(num, den);
  const surCible = cible !== null && memeNombre(courante, cible);

  return (
    <div ref={boxRef} className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      {/* Le choix du découpage — des puces de 44 px, pas un stepper : on
          essaie, on compare, on revient. */}
      {onDen && (
        <div className="space-y-1.5">
          <div className="text-xs uppercase tracking-wide text-slate-500 text-center">
            Je coupe chaque unité en…
          </div>
          <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Choisir le découpage de l’unité">
            {densChoices.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => changerDen(d)}
                aria-pressed={d === den}
                data-den={d}
                className={[
                  'min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 font-mono font-bold tabular-nums transition-colors',
                  d === den
                    ? 'border-indigo-500 bg-indigo-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400',
                ].join(' ')}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        style={{ height: H }}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={num}
        aria-valuetext={`${texte(courante)}`}
        aria-label={ariaLabel || 'Droite graduée — flèches gauche et droite pour déplacer le curseur'}
        onKeyDown={onKeyDown}
        onMouseDown={(e) => { setDragging(true); move(numFromClientX(e.clientX)); }}
        onTouchStart={(e) => { setDragging(true); move(numFromClientX(e.touches[0].clientX)); }}
      >
        {/* L'axe */}
        <line x1={PAD_X} x2={W - PAD_X} y1={AXIS_Y} y2={AXIS_Y} stroke="#0f172a" strokeWidth="2.5" />

        {/* Les graduations. Les petites (les parts) sont de simples traits ; on
            ne CHIFFRE que les entiers, sinon les libellés se chevaucheraient
            dès le découpage en huitièmes. */}
        {Array.from({ length: total + 1 }, (_, k) => k).map((k) => {
          const entier = k % den === 0;
          return (
            <line
              key={k}
              x1={xOf(k)} x2={xOf(k)}
              y1={AXIS_Y - (entier ? 13 : 7)} y2={AXIS_Y + (entier ? 13 : 7)}
              stroke={entier ? '#0f172a' : '#cbd5e1'}
              strokeWidth={entier ? 2.5 : 1.5}
            />
          );
        })}

        {/* Les libellés des entiers seulement — impossible de se chevaucher. */}
        {Array.from({ length: maxUnits + 1 }, (_, u) => u).map((u) => (
          <text
            key={`u${u}`}
            x={xOf(u * den)} y={AXIS_Y + 32}
            textAnchor="middle"
            className="fill-slate-800"
            style={{ fontSize: 15, fontWeight: 800 }}
          >
            {u}
          </text>
        ))}

        {/* La cible fantôme */}
        {cible !== null && (
          <circle
            cx={xOf((cible.num / cible.den) * den)} cy={AXIS_Y}
            r="9" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 3"
          />
        )}

        {/* Le segment parcouru : la fraction est une LONGUEUR depuis zéro. */}
        <line
          x1={xOf(0)} x2={xOf(num)} y1={AXIS_Y} y2={AXIS_Y}
          stroke={surCible ? '#059669' : '#6366f1'} strokeWidth="5" strokeLinecap="round"
          opacity="0.55"
        />

        {/* Le curseur */}
        <circle
          cx={xOf(num)} cy={AXIS_Y} r="10"
          fill={surCible ? '#059669' : '#4f46e5'}
          stroke="#fff" strokeWidth="2.5"
          style={{ transition: dragging ? 'none' : 'cx 140ms ease-out' }}
        />
      </svg>

      {/* La lecture de la fraction — dans le DOM, sous le dessin. */}
      <div className="flex items-center justify-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 flex-wrap">
        <span className="text-xs uppercase tracking-wide text-slate-500">Le curseur est sur</span>
        <output
          className="flex flex-col items-center leading-none font-mono font-black text-indigo-700"
          aria-live="polite"
          data-num={String(num)}
          data-den={String(den)}
        >
          <span className="text-xl tabular-nums">{num}</span>
          <span className="w-6 border-t-2 border-indigo-700 my-0.5" />
          <span className="text-xl tabular-nums">{den}</span>
        </output>
      </div>

      <p className="text-xs text-center text-slate-500">
        Glisse le point, ou utilise les flèches ← →.
      </p>
    </div>
  );
}
