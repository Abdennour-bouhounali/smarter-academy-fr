import React, { useRef } from 'react';
import {
  modele, maxModele, minModele, cransAmplitudeDe, CRANS_PERIODE, aimanterK, fr,
} from './trigEqUtils';

/**
 * ModeleLab — le laboratoire de MODÉLISATION d'un phénomène qui se répète.
 *
 * Activity               une courbe RÉELLE est donnée (la marée d'un port, la
 *                        température d'une journée, la nacelle d'une roue).
 *                        L'élève règle SA courbe pour la superposer, en
 *                        ATTRAPANT SON SOMMET.
 * Mathematical objective un phénomène qui se répète se décrit par trois
 *                        nombres : son AMPLITUDE (l'écart au niveau moyen),
 *                        sa PÉRIODE (la durée d'un cycle) et l'instant du
 *                        maximum. Le geste les sépare : monter le sommet ne
 *                        change pas le rythme, l'éloigner ne change pas la
 *                        hauteur.
 * Student action         SAISIR LE SOMMET de sa courbe et le déplacer. Le
 *                        geste est à deux dimensions, et c'est exactement le
 *                        propos. Le lâcher est AIMANTÉ sur les réglages
 *                        permis : sans cela, la courbe de l'élève ne pourrait
 *                        JAMAIS coïncider exactement avec la donnée, et la
 *                        consigne serait infaisable (test).
 *                        Les cliquets ± et le clavier restent des chemins
 *                        complets, en affordance secondaire.
 * Controlled variables   l'amplitude A et la période P.
 * Visual consequence     la courbe de l'élève monte, s'aplatit, s'étire ou se
 *                        resserre ; quand les deux réglages sont justes, elle
 *                        se confond avec la courbe donnée.
 * Expected observation   « la hauteur et le rythme se règlent séparément ».
 * Misconception targeted lire l'amplitude comme le MAXIMUM (au lieu de l'écart
 *                        au niveau moyen) ; mesurer la période d'un sommet au
 *                        CREUX suivant, donc de moitié.
 *
 * POURQUOI UN REPÈRE PROPRE, ET NON `CoordPlane`. Les deux axes portent des
 * UNITÉS concrètes (heures et mètres, heures et °C, minutes et mètres) et des
 * échelles très différentes d'une situation à l'autre. `CoordPlane` grade en
 * décimal sans unité : l'axe et l'énoncé se contrediraient. Modifier
 * `CoordPlane` serait toucher un composant partagé — signalé dans le rapport
 * plutôt que fait.
 *
 * JAMAIS GELÉ : l'élève doit pouvoir continuer à régler après avoir trouvé —
 * c'est là qu'il voit chaque réglage agir séparément.
 */
const DONNEE = '#7c3aed';
const MIENNE = '#0284c7';
const GRIS = '#94a3b8';

const MARGE = { g: 44, d: 14, h: 14, b: 30 };
const L_TRACE = 430;                 // largeur du tracé, en px
const H_TRACE = 156;                 // hauteur du tracé, en px
const W = MARGE.g + MARGE.d + L_TRACE;
const H = MARGE.h + MARGE.b + H_TRACE;

/**
 * L'échelle verticale est DÉRIVÉE de la situation, jamais fixée : une marée
 * va de 0 à 6 m, une température de 0 à 25 °C. On borne à [0 ; yHaut] où
 * yHaut est calculé pour laisser une marge au-dessus du maximum atteignable
 * par le RÉGLAGE LE PLUS AMPLE — sinon un élève qui monte trop le sommet
 * verrait sa courbe sortir du cadre.
 */
function echelle(situation) {
  const { m } = situation.reglages;
  /**
   * DÉFAUT ATTRAPÉ PAR LE TEST. Les crans d'amplitude étaient d'abord une
   * liste UNIQUE de 1 à 30, partagée par les trois situations. À l'échelle de
   * la grande roue (0 à 60 m), les crans 1 et 2 tombaient à 2,6 px l'un de
   * l'autre : deux poignées voisines indiscernables, glisser illisible.
   * Chaque situation porte donc ses propres crans (`cransA`), au pas de son
   * échelle — et le test vérifie 4 px d'écart minimum.
   */
  const crans = cransAmplitudeDe(situation);
  const aMax = Math.max(...crans.filter((v) => v <= m));
  const yHaut = m + aMax;
  const toY = (v) => MARGE.h + H_TRACE * (1 - v / yHaut);
  const toX = (t) => MARGE.g + (L_TRACE * t) / situation.tMax;
  const deX = (px) => ((px - MARGE.g) / L_TRACE) * situation.tMax;
  const deY = (py) => ((MARGE.h + H_TRACE - py) / H_TRACE) * yHaut;
  return { yHaut, aMax, crans, toX, toY, deX, deY };
}

/** Les graduations d'un axe : un pas qui donne entre 4 et 8 traits. */
function graduations(max, pas) {
  const out = [];
  for (let v = 0; v <= max + 1e-9; v += pas) out.push(Number(v.toFixed(6)));
  return out;
}

export default function ModeleLab({
  situation,
  A, P,
  onChangeA, onChangeP,
  montreSienne = true,
  disabled = false,
  label = 'Modéliser un phénomène qui se répète',
}) {
  const svgRef = useRef(null);
  const e = echelle(situation);
  const { m, d } = situation.reglages;

  const fDonnee = modele(situation.reglages);
  const fMienne = modele({ m, A, P, d });

  const cransA = e.crans;
  const iA = cransA.indexOf(A);
  const iP = CRANS_PERIODE.indexOf(P);

  // La poignée : le SOMMET de ma courbe, atteint en t = d, à la hauteur m + A.
  const sx = e.toX(d);
  const sy = e.toY(m + A);

  const bougeable = !disabled && montreSienne;

  /** Le chemin d'une courbe, échantillonné assez fin pour que les sommets soient nets. */
  const chemin = (f) => {
    const n = 480;
    let s = '';
    for (let i = 0; i <= n; i += 1) {
      const t = (situation.tMax * i) / n;
      s += `${i === 0 ? 'M' : 'L'} ${e.toX(t).toFixed(2)} ${e.toY(f(t)).toFixed(2)} `;
    }
    return s;
  };

  /**
   * Pointeur → réglage. La hauteur du sommet donne l'amplitude (A = y − m) ;
   * sa position horizontale ne peut PAS donner la période ici (le maximum est
   * en d, fixé par la situation), donc l'axe horizontal règle la période via
   * la position du sommet SUIVANT : P = x − d. Les deux sont aimantés sur les
   * crans permis, et le modèle pur (testé) fait l'aimantation.
   */
  const depuisPointeur = (ev) => {
    const svg = svgRef.current;
    if (!svg || !bougeable) return;
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = ((ev.clientX - r.left) / r.width) * W;
    const py = ((ev.clientY - r.top) / r.height) * H;
    const nextA = aimanterK(e.deY(py) - m, cransA);
    if (nextA !== A) onChangeA?.(nextA);
    // Le sommet SUIVANT est en d + P : si le doigt dépasse nettement d, on lit
    // la période. En deçà, on ne touche qu'à l'amplitude.
    const t = e.deX(px);
    if (t > d + CRANS_PERIODE[0] / 2) {
      const nextP = aimanterK(t - d, CRANS_PERIODE);
      if (nextP !== P) onChangeP?.(nextP);
    }
  };

  const onKey = (ev) => {
    if (!bougeable) return;
    const dA = (k) => { const i = iA + k; if (i >= 0 && i < cransA.length) onChangeA?.(cransA[i]); };
    const dP = (k) => { const i = iP + k; if (i >= 0 && i < CRANS_PERIODE.length) onChangeP?.(CRANS_PERIODE[i]); };
    if (ev.key === 'ArrowUp') { ev.preventDefault(); dA(1); }
    if (ev.key === 'ArrowDown') { ev.preventDefault(); dA(-1); }
    if (ev.key === 'ArrowRight') { ev.preventDefault(); dP(1); }
    if (ev.key === 'ArrowLeft') { ev.preventDefault(); dP(-1); }
  };

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const juste = A === Math.abs(situation.reglages.A) && P === situation.reglages.P;

  // Les graduations : un pas qui donne un nombre lisible de traits.
  const pasX = situation.reglages.P / 2;
  const pasY = e.yHaut > 30 ? 10 : e.yHaut > 12 ? 5 : 2;

  return (
    <div className="space-y-3" role="group" aria-label={label}>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2 overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          height={H}
          // Aucun `width` en dur, qui imposerait 488 px à un <main> de 375. Le
          // viewBox dimensionne, `minWidth` interdit la compression (l'échelle
          // ne doit jamais mentir), et le conteneur défile dans SA boîte.
          style={{ minWidth: W, height: H }}
          className={`select-none touch-none block ${bougeable ? 'cursor-grab' : ''}`}
          role="img"
          aria-label={
            `${situation.titre}. Ton réglage : amplitude ${fr(A, 1)} ${situation.uniteY}, ` +
            `période ${fr(P, 0)} ${situation.unite}.` +
            (juste ? ' Les deux courbes se confondent.' : '') +
            (bougeable ? ' Attrape le sommet de ta courbe pour la déformer.' : '')
          }
          onPointerDown={(ev) => {
            if (!bougeable) return;
            ev.currentTarget.setPointerCapture(ev.pointerId);
            depuisPointeur(ev);
          }}
          onPointerMove={(ev) => { if (bougeable && ev.buttons === 1) depuisPointeur(ev); }}
        >
          {/* Les graduations horizontales, avec leur UNITÉ dans la légende DOM. */}
          {graduations(e.yHaut, pasY).map((v) => (
            <g key={`y${v}`}>
              <line x1={MARGE.g} y1={e.toY(v)} x2={W - MARGE.d} y2={e.toY(v)} stroke="#f1f5f9" strokeWidth="1" />
              <text x={MARGE.g - 6} y={e.toY(v) + 3.5} textAnchor="end" fontSize="10" fill="#94a3b8" className="font-mono">
                {fr(v, 0)}
              </text>
            </g>
          ))}

          <line x1={MARGE.g} y1={e.toY(0)} x2={W - MARGE.d} y2={e.toY(0)} stroke={GRIS} strokeWidth="1.5" />
          <line x1={MARGE.g} y1={MARGE.h} x2={MARGE.g} y2={H - MARGE.b} stroke={GRIS} strokeWidth="1.5" />

          {/* Les graduations verticales : un pas de P/2, donc les sommets ET
              les creux de la courbe donnée y tombent exactement. */}
          {graduations(situation.tMax, pasX).map((t) => (
            <g key={`x${t}`}>
              <line x1={e.toX(t)} y1={e.toY(0) - 5} x2={e.toX(t)} y2={e.toY(0) + 5} stroke={GRIS} strokeWidth="1.5" />
              <text x={e.toX(t)} y={e.toY(0) + 18} textAnchor="middle" fontSize="10" fill="#64748b" className="font-mono">
                {fr(t, 0)}
              </text>
            </g>
          ))}

          {/* Le NIVEAU MOYEN : la droite autour de laquelle tout oscille. */}
          <line
            x1={MARGE.g} y1={e.toY(m)} x2={W - MARGE.d} y2={e.toY(m)}
            stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6 4"
          />

          <path d={chemin(fDonnee)} fill="none" stroke={DONNEE} strokeWidth="2.5" strokeLinecap="round" />
          {montreSienne && (
            <path d={chemin(fMienne)} fill="none" stroke={MIENNE} strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
          )}

          {/* LA POIGNÉE : le sommet de ma courbe. Une cible tactile généreuse
              et invisible l'entoure — un doigt n'a pas à viser au pixel. */}
          {montreSienne && (
            <g>
              <circle cx={sx} cy={sy} r="20" fill="transparent" />
              <circle
                cx={sx} cy={sy} r="7.5" fill={MIENNE} stroke="#fff" strokeWidth="2.5"
                tabIndex={bougeable ? 0 : -1}
                role={bougeable ? 'slider' : undefined}
                aria-label={bougeable ? 'Sommet de ta courbe : monte-le pour l’amplitude, éloigne-le vers la droite pour la période' : undefined}
                aria-valuetext={`amplitude ${fr(A, 1)} ${situation.uniteY}, période ${fr(P, 0)} ${situation.unite}`}
                onKeyDown={onKey}
                className={bougeable ? 'cursor-grab [outline:none] focus-visible:[stroke:#2563eb] focus-visible:[stroke-width:4]' : ''}
              />
            </g>
          )}
        </svg>
      </div>

      {/* La LÉGENDE en DOM : deux courbes qui se confondent ne peuvent pas
          porter leur nom dans le SVG sans se chevaucher. Les UNITÉS y vivent
          aussi — un axe SVG ne les porterait pas sans risque de collision. */}
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-4 h-1 rounded" style={{ background: DONNEE }} aria-hidden="true" />
          la {situation.grandeur} observée
        </span>
        {montreSienne && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-1 rounded" style={{ background: MIENNE }} aria-hidden="true" />
            la tienne, en tirets — <strong>attrape son sommet</strong>
          </span>
        )}
        <span className="text-slate-500">
          horizontal : {situation.unite} · vertical : {situation.uniteY} · le trait gris est le niveau moyen
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-xl border border-slate-200 bg-white p-2">
          <div className="text-[13px] text-slate-500 mb-1 text-center">amplitude ({situation.uniteY})</div>
          <div className="flex items-center justify-center gap-2">
            <button type="button" className={btn} onClick={() => onChangeA?.(cransA[iA - 1])} disabled={disabled || iA <= 0} aria-label="Diminuer l’amplitude">−</button>
            <span className="px-3 py-1.5 rounded-lg bg-sky-900 text-white font-mono font-bold tabular-nums text-sm" data-testid="reglage-a">{fr(A, 1)}</span>
            <button type="button" className={btn} onClick={() => onChangeA?.(cransA[iA + 1])} disabled={disabled || iA >= cransA.length - 1} aria-label="Augmenter l’amplitude">+</button>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2">
          <div className="text-[13px] text-slate-500 mb-1 text-center">période ({situation.unite})</div>
          <div className="flex items-center justify-center gap-2">
            <button type="button" className={btn} onClick={() => onChangeP?.(CRANS_PERIODE[iP - 1])} disabled={disabled || iP <= 0} aria-label="Raccourcir la période">−</button>
            <span className="px-3 py-1.5 rounded-lg bg-sky-900 text-white font-mono font-bold tabular-nums text-sm" data-testid="reglage-p">{fr(P, 0)}</span>
            <button type="button" className={btn} onClick={() => onChangeP?.(CRANS_PERIODE[iP + 1])} disabled={disabled || iP >= CRANS_PERIODE.length - 1} aria-label="Allonger la période">+</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">ton maximum</div>
          <div className="font-mono font-bold tabular-nums text-slate-900">{fr(maxModele({ m, A }), 1)} {situation.uniteY}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">ton minimum</div>
          <div className="font-mono font-bold tabular-nums text-slate-900">{fr(minModele({ m, A }), 1)} {situation.uniteY}</div>
        </div>
      </div>
    </div>
  );
}

/** La géométrie du repère, exportée pour que le test la balaye. */
export const GEOM_MODELE = { MARGE, L_TRACE, H_TRACE, W, H, echelle, graduations };
