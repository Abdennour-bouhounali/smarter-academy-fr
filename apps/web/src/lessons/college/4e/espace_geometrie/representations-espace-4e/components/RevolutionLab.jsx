import React, { useMemo } from 'react';
import { coneParRevolution, volumeCylindre, arrondi, fr, vol } from './espace4e';

/**
 * RevolutionLab — un triangle rectangle tourne, un cône apparaît.
 *
 * Activity              faire tourner un triangle rectangle autour d'un des
 *                       côtés de son angle droit, d'un quart de tour à un tour
 *                       complet, et voir le solide se former.
 * Mathematical objective un cône de révolution EST le solide engendré par
 *                       cette rotation : l'axe devient la hauteur, l'autre
 *                       côté de l'angle droit devient le rayon de la base, et
 *                       le troisième balaie la surface arrondie.
 * Student action        régler le rayon, la hauteur, et l'angle de rotation.
 * Controlled variable   `rayon`, `hauteur` et `tour` (en degrés, 0 → 360).
 * Mathematical state    `coneParRevolution(rayon, hauteur)` : le rayon, la
 *                       hauteur, la génératrice et le volume viennent tous du
 *                       noyau.
 * Visual consequence    le disque de base se remplit à mesure que le triangle
 *                       tourne ; à 360°, la base est un disque entier et le
 *                       solide est fermé.
 * Expected observation  « la base est ronde, mais la hauteur se lit
 *                       exactement comme sur la pyramide ».
 * Misconception targeted croire que la génératrice — le bord qu'on voit — est
 *                       la hauteur du cône.
 *
 * SÉCURITÉ VISUELLE : le cadre est calculé à partir des BORNES des réglages,
 * pas des valeurs courantes — le dessin ne « saute » donc pas d'une échelle à
 * l'autre quand l'élève bouge un curseur, et rien ne sort jamais du cadre
 * (vérifié par `parcours.test.js` sur toutes les valeurs atteignables).
 * Toutes les mesures sont du DOM.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement.
 */
export const BORNES = { rayonMin: 2, rayonMax: 8, hauteurMin: 4, hauteurMax: 14 };
export const MARGE = 1.6;
/** Écrasement de l'ellipse de base : la base est vue de biais. */
export const APLATI = 0.34;

/** Le cadre du dessin, en unités « cm ». Fixe, dérivé des BORNES. */
export function cadre() {
  const R = BORNES.rayonMax;
  const H = BORNES.hauteurMax;
  return {
    minX: -R - MARGE,
    maxX: R + MARGE,
    minY: -R * APLATI - MARGE,
    maxY: H + R * APLATI + MARGE,
  };
}

/**
 * Le contour du disque balayé après une rotation de `tour` degrés, en unités
 * « cm », y vers le HAUT, centre de la base à l'origine.
 * Exporté pour que le test puisse vérifier qu'il tient dans le cadre.
 */
export function secteurBase(rayon, tour) {
  const pts = [{ x: 0, y: 0 }];
  const n = Math.max(2, Math.round((tour / 360) * 64));
  for (let i = 0; i <= n; i += 1) {
    const a = (tour / 360) * 2 * Math.PI * (i / n);
    pts.push({ x: rayon * Math.cos(a), y: rayon * APLATI * Math.sin(a) });
  }
  return pts;
}

export default function RevolutionLab({ rayon, hauteur, tour, onRayon, onHauteur, onTour }) {
  const c = useMemo(() => coneParRevolution(rayon, hauteur), [rayon, hauteur]);
  const vCyl = useMemo(() => volumeCylindre(rayon, hauteur), [rayon, hauteur]);
  const secteur = useMemo(() => secteurBase(rayon, tour), [rayon, tour]);
  const C = cadre();

  const w = C.maxX - C.minX;
  const h = C.maxY - C.minY;
  const viewBox = `${C.minX} ${-C.maxY} ${w} ${h}`;
  const t = w / 40;

  // y de l'élève → y de l'écran.
  const P = (q) => `${q.x},${-q.y}`;
  const sommet = { x: 0, y: hauteur };
  // Le côté mobile du triangle, à l'angle courant.
  const a = (tour / 360) * 2 * Math.PI;
  const pied = { x: rayon * Math.cos(a), y: rayon * APLATI * Math.sin(a) };
  const complet = tour >= 360;

  return (
    <div className="space-y-3" role="group" aria-label="Triangle rectangle en rotation engendrant un cône">
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <svg
          viewBox={viewBox}
          className="mx-auto w-full max-w-[300px]"
          role="img"
          aria-label={`Triangle rectangle de rayon ${rayon} cm et de hauteur ${hauteur} cm, tourné de ${tour} degrés`}
        >
          {/* Le disque complet, en attente — la trace de ce qui reste à balayer. */}
          <ellipse
            cx={0} cy={0} rx={rayon} ry={rayon * APLATI}
            fill="transparent" stroke="#cbd5e1" strokeWidth={0.06 * t}
            strokeDasharray={`${0.25 * t} ${0.2 * t}`}
          />

          {/* La portion de base déjà balayée. */}
          <polygon points={secteur.map(P).join(' ')} fill="#10b981" fillOpacity={0.22}
                   stroke="#047857" strokeWidth={0.07 * t} />

          {/* La surface du cône, une fois le tour complet. */}
          {complet && (
            <path
              d={`M ${-rayon},0 L 0,${-hauteur} L ${rayon},0 A ${rayon} ${rayon * APLATI} 0 0 1 ${-rayon},0 Z`}
              fill="#10b981" fillOpacity={0.14} stroke="#047857" strokeWidth={0.09 * t}
            />
          )}

          {/* L'AXE : il devient la hauteur du cône. */}
          <line x1={0} y1={0} x2={0} y2={-hauteur} stroke="#7c3aed" strokeWidth={0.16 * t} />
          {/* La marque d'angle droit, au pied de l'axe. */}
          <polyline
            points={`0,${-0.9 * t} ${0.9 * t},${-0.9 * t} ${0.9 * t},0`}
            fill="none" stroke="#7c3aed" strokeWidth={0.07 * t}
          />

          {/* Le triangle en rotation : le rayon au sol, et la génératrice. */}
          <line x1={0} y1={0} x2={pied.x} y2={-pied.y} stroke="#0891b2" strokeWidth={0.16 * t} />
          <line x1={pied.x} y1={-pied.y} x2={0} y2={-hauteur} stroke="#e11d48" strokeWidth={0.16 * t} />
          <circle cx={pied.x} cy={-pied.y} r={0.11 * t} fill="#0891b2" />
          <circle cx={0} cy={-hauteur} r={0.13 * t} fill="#0f172a" />
        </svg>
      </div>

      {/* LES MESURES SONT DU DOM. */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
        <dl className="space-y-1.5 text-sm">
          <div className="flex items-baseline justify-between border-b border-slate-100 pb-1.5">
            <dt><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-violet-600 align-middle" aria-hidden="true" />
              <span className="font-bold text-violet-700">hauteur</span> — l’axe de rotation</dt>
            <dd className="font-mono font-black tabular-nums text-slate-900">{fr(c.hauteur, 2)} cm</dd>
          </div>
          <div className="flex items-baseline justify-between border-b border-slate-100 pb-1.5">
            <dt><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-cyan-600 align-middle" aria-hidden="true" />
              <span className="font-bold text-cyan-700">rayon</span> — l’autre côté de l’angle droit</dt>
            <dd className="font-mono font-black tabular-nums text-slate-900">{fr(c.rayon, 2)} cm</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-rose-600 align-middle" aria-hidden="true" />
              <span className="font-bold text-rose-700">le côté en biais</span> — il balaie le bord</dt>
            <dd className="font-mono font-black tabular-nums text-slate-900">{fr(arrondi(c.generatrice, 2), 2)} cm</dd>
          </div>
        </dl>
      </div>

      {/* Les trois réglages. */}
      <div className="space-y-2.5">
        {[
          { id: 'tour', label: 'Rotation', valeur: tour, set: onTour, min: 0, max: 360, step: 15, unite: '°' },
          { id: 'rayon', label: 'Rayon', valeur: rayon, set: onRayon, min: BORNES.rayonMin, max: BORNES.rayonMax, step: 1, unite: 'cm' },
          { id: 'hauteur', label: 'Hauteur', valeur: hauteur, set: onHauteur, min: BORNES.hauteurMin, max: BORNES.hauteurMax, step: 1, unite: 'cm' },
        ].map((r) => (
          <div key={r.id} className="rounded-xl border-2 border-slate-200 bg-white p-2.5">
            <label htmlFor={`rev-${r.id}`} className="flex items-baseline justify-between text-xs font-bold text-slate-600">
              {r.label}
              <span className="font-mono text-base font-black text-slate-900">{r.valeur} {r.unite}</span>
            </label>
            <input
              id={`rev-${r.id}`}
              type="range"
              min={r.min}
              max={r.max}
              step={r.step}
              value={r.valeur}
              onChange={(ev) => r.set(Number(ev.target.value))}
              className="sa-slider accent-emerald-600 mt-1 w-full"
              aria-valuetext={`${r.label} : ${r.valeur} ${r.unite}`}
            />
          </div>
        ))}
      </div>

      {/* Le volume, et sa comparaison avec le cylindre jumeau. */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-1.5 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-slate-600">le cylindre de même base et même hauteur</span>
          <span className="font-mono font-black tabular-nums text-slate-900">{vol(vCyl, 'cm', 1)}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="font-semibold text-emerald-800">le cône</span>
          <span className="font-mono font-black tabular-nums text-emerald-800">{vol(c.volume, 'cm', 1)}</span>
        </div>
        <p className="pt-1 text-center text-xs text-slate-500" data-rev-rapport={arrondi(vCyl / c.volume, 4)}>
          {fr(arrondi(vCyl / c.volume, 2), 2)} fois plus — le même rapport que pour la pyramide.
        </p>
      </div>

      <p className="text-center text-xs text-slate-500">
        {complet
          ? 'Le tour est complet : la base est un disque entier.'
          : `Encore ${360 - tour}° à parcourir pour fermer le solide.`}
      </p>
    </div>
  );
}
