import React, { useMemo } from 'react';
import { longueursDe, arrondi, fr, DIMENSIONS } from './espace4e';

/**
 * LongueursLab — la pyramide mesurée : trois longueurs, une seule hauteur.
 *
 * Activity              régler le côté de la base et la hauteur, et voir les
 *                       TROIS longueurs candidates se recalculer.
 * Mathematical objective la hauteur est le segment du sommet au PLAN de la
 *                       base, perpendiculaire à lui ; l'arête latérale et
 *                       l'apothème partent en biais et sont plus longs.
 * Student action        deux réglages continus ; le dessin suit.
 * Controlled variable   `cote` et `hauteur` — les deux seules grandeurs
 *                       indépendantes. Les trois longueurs en DÉCOULENT.
 * Mathematical state    `longueursDe(cote, hauteur)` : aucun nombre n'est
 *                       écrit à la main dans ce composant.
 * Visual consequence    le trait violet tombe droit sur le plancher et porte
 *                       la marque d'angle droit ; les deux autres traits
 *                       s'écartent.
 * Expected observation  « la verticale est toujours la plus courte des trois ».
 * Misconception targeted confondre la hauteur avec l'arête latérale.
 *
 * SÉCURITÉ VISUELLE — DEUX RÈGLES.
 *   1. Le dessin est en unités de la LEÇON (cm), et le viewBox est DÉRIVÉ des
 *      points réellement tracés plus une marge : quelles que soient les
 *      dimensions atteignables, rien ne sort du cadre (vérifié par
 *      `parcours.test.js`).
 *   2. Aucune mesure n'est écrite dans le SVG. Les trois longueurs sont un
 *      tableau du DOM, sous le dessin : deux nombres ne peuvent donc pas se
 *      chevaucher, quelle que soit la forme de la pyramide.
 *
 * REJOUABLE : aucun `disabled` — les réglages restent vivants après la
 * validation des étapes.
 */

/** Fuite de la perspective cavalière, en unités de la leçon. */
export const FUITE = { dx: 0.42, dy: 0.30 };
export const MARGE = 1.4;

/**
 * Les points du dessin, en unités « cm », y vers le HAUT.
 * Exporté pour que le test puisse rejouer exactement la même géométrie.
 */
export function pointsDe(cote, hauteur) {
  const c = cote;
  const px = c * FUITE.dx;
  const py = c * FUITE.dy;
  // Base : A et B devant, C et D derrière (décalés par la fuite).
  const A = { x: 0, y: 0 };
  const B = { x: c, y: 0 };
  const C = { x: c + px, y: py };
  const D = { x: px, y: py };
  // Le centre de la base, où retombe la hauteur.
  const O = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 };
  const S = { x: O.x, y: O.y + hauteur };
  // Le milieu du côté [AB] — le pied de l'apothème.
  const M = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
  return { A, B, C, D, O, S, M };
}

/** Le cadre qui contient TOUT le dessin, marge comprise. */
export function cadreDe(cote, hauteur) {
  const p = pointsDe(cote, hauteur);
  const pts = Object.values(p);
  const minX = Math.min(...pts.map((q) => q.x)) - MARGE;
  const maxX = Math.max(...pts.map((q) => q.x)) + MARGE;
  const minY = Math.min(...pts.map((q) => q.y)) - MARGE;
  const maxY = Math.max(...pts.map((q) => q.y)) + MARGE;
  return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
}

export default function LongueursLab({ cote, hauteur, onCote, onHauteur }) {
  const { p, cadre, L } = useMemo(() => ({
    p: pointsDe(cote, hauteur),
    cadre: cadreDe(cote, hauteur),
    L: longueursDe(cote, hauteur),
  }), [cote, hauteur]);

  // y de l'élève (vers le haut) → y de l'écran (vers le bas).
  const X = (q) => q.x;
  const Y = (q) => -q.y;
  const poly = (...qs) => qs.map((q) => `${X(q)},${Y(q)}`).join(' ');
  const viewBox = `${cadre.minX} ${-cadre.maxY} ${cadre.w} ${cadre.h}`;
  // Un trait doit rester lisible quelle que soit l'échelle du cadre.
  const t = cadre.w / 170;

  // La petite équerre au pied de la hauteur, dimensionnée en unités du dessin.
  const e = Math.min(cote, hauteur) * 0.11;

  const LIGNES = [
    { id: 'hauteur', libelle: 'du sommet au plancher, à angle droit', nom: 'hauteur', valeur: L.hauteur, couleur: 'text-violet-700', puce: 'bg-violet-600' },
    { id: 'apotheme', libelle: 'du sommet au milieu d’un côté', nom: 'deuxième longueur', valeur: arrondi(L.apotheme, 2), couleur: 'text-cyan-700', puce: 'bg-cyan-600' },
    { id: 'arete', libelle: 'du sommet à un coin de la base', nom: 'troisième longueur', valeur: arrondi(L.arete, 2), couleur: 'text-rose-700', puce: 'bg-rose-600' },
  ];

  return (
    <div className="space-y-3" role="group" aria-label="Pyramide et ses trois longueurs">
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <svg
          viewBox={viewBox}
          className="mx-auto w-full max-w-[340px]"
          role="img"
          aria-label={`Pyramide à base carrée de ${cote} cm de côté et ${hauteur} cm de hauteur, avec ses trois longueurs`}
        >
          {/* Le plancher : la base carrée, vue en fuite. */}
          <polygon points={poly(p.A, p.B, p.C, p.D)} fill="#f1f5f9" stroke="#0f172a" strokeWidth={1.6 * t} />

          {/* Les arêtes latérales cachées, en pointillé. */}
          <line x1={X(p.D)} y1={Y(p.D)} x2={X(p.S)} y2={Y(p.S)}
                stroke="#0f172a" strokeWidth={1.2 * t} strokeDasharray={`${3 * t} ${2 * t}`} />

          {/* Les arêtes latérales vues. */}
          <line x1={X(p.A)} y1={Y(p.A)} x2={X(p.S)} y2={Y(p.S)} stroke="#0f172a" strokeWidth={1.4 * t} />
          <line x1={X(p.C)} y1={Y(p.C)} x2={X(p.S)} y2={Y(p.S)} stroke="#0f172a" strokeWidth={1.4 * t} />

          {/* La troisième longueur : du sommet à un COIN — rose. */}
          <line x1={X(p.B)} y1={Y(p.B)} x2={X(p.S)} y2={Y(p.S)} stroke="#e11d48" strokeWidth={2.6 * t} />

          {/* La deuxième longueur : du sommet au MILIEU d'un côté — cyan. */}
          <line x1={X(p.M)} y1={Y(p.M)} x2={X(p.S)} y2={Y(p.S)}
                stroke="#0891b2" strokeWidth={2.4 * t} strokeDasharray={`${3 * t} ${2 * t}`} />
          <circle cx={X(p.M)} cy={Y(p.M)} r={1.4 * t} fill="#0891b2" />

          {/* La hauteur : du sommet au centre du plancher — violette, avec son angle droit. */}
          <line x1={X(p.O)} y1={Y(p.O)} x2={X(p.S)} y2={Y(p.S)} stroke="#7c3aed" strokeWidth={2.8 * t} />
          <polyline
            points={`${X(p.O)},${Y(p.O) - e} ${X(p.O) + e},${Y(p.O) - e} ${X(p.O) + e},${Y(p.O)}`}
            fill="none" stroke="#7c3aed" strokeWidth={1.3 * t}
          />
          <circle cx={X(p.O)} cy={Y(p.O)} r={1.4 * t} fill="#7c3aed" />
          <circle cx={X(p.S)} cy={Y(p.S)} r={1.8 * t} fill="#0f172a" />
        </svg>
      </div>

      {/* LES MESURES SONT DU DOM — aucun texte dans le SVG. */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
        <table className="w-full text-sm">
          <tbody>
            {LIGNES.map((l) => (
              <tr key={l.id} className="border-b border-slate-100 last:border-0">
                <td className="py-1.5 pr-2">
                  <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle ${l.puce}`} aria-hidden="true" />
                  <span className={`font-bold ${l.couleur}`}>{l.nom}</span>
                  <span className="block pl-[18px] text-xs text-slate-500">{l.libelle}</span>
                </td>
                <td className="py-1.5 text-right font-mono text-base font-black tabular-nums text-slate-900">
                  {fr(l.valeur, 2)} cm
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Les deux réglages. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { id: 'cote', label: 'Côté de la base', valeur: cote, set: onCote, min: DIMENSIONS.coteMin, max: DIMENSIONS.coteMax },
          { id: 'hauteur', label: 'Hauteur', valeur: hauteur, set: onHauteur, min: DIMENSIONS.hauteurMin, max: DIMENSIONS.hauteurMax },
        ].map((r) => (
          <div key={r.id} className="rounded-xl border-2 border-slate-200 bg-white p-2.5">
            <label htmlFor={`ll-${r.id}`} className="flex items-baseline justify-between text-xs font-bold text-slate-600">
              {r.label}
              <span className="font-mono text-base font-black text-slate-900">{r.valeur} cm</span>
            </label>
            <input
              id={`ll-${r.id}`}
              type="range"
              min={r.min}
              max={r.max}
              step={1}
              value={r.valeur}
              onChange={(ev) => r.set(Number(ev.target.value))}
              className="sa-slider accent-violet-600 mt-1 w-full"
              aria-valuetext={`${r.label} : ${r.valeur} cm`}
            />
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-slate-500">
        Une seule des trois longueurs tombe droit sur le plancher.
      </p>
    </div>
  );
}
