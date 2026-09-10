import React, { useRef, useState, useLayoutEffect } from 'react';
import {
  COS, SIN, CRANS_K, decalerK, indexK, ecritureK, kDepuisPointeur,
  R, CX, CY, H_CADRE, yDeVal, fenetreDerouleur,
  HAUTEUR_PRISE, R_POIGNEE, R_PRISE_POIGNEE,
  solutionsDansFenetre, solutionPrincipaleCos, solutionPrincipaleSin,
  courbeFenetre, labelPi, fr, arcsSolution, mesureArcs, TAU,
} from './trigEqUtils';

/**
 * BarreLab — l'interaction SIGNATURE : « la barre qui coupe partout ».
 *
 * Activity               à gauche le cercle, à droite sa courbe déroulée. Une
 *                        BARRE HORIZONTALE de hauteur k traverse les deux
 *                        cadres. L'élève l'ATTRAPE et la fait GLISSER
 *                        verticalement ; à chaque hauteur, les points
 *                        d'intersection s'allument — sur la courbe ils sont
 *                        EN NOMBRE INFINI, régulièrement espacés de 2π ; sur
 *                        le cercle ce sont DEUX points symétriques.
 * Mathematical objective résoudre cos x = k, ce n'est pas trouver UN nombre :
 *                        c'est décrire une FAMILLE infinie. Et la famille se
 *                        lit sur le cercle : deux points, puis « + 2kπ ».
 * Student action         SAISIR LA BARRE et la faire monter ou descendre. La
 *                        zone de préhension est une bande INVISIBLE de 24 px
 *                        de haut centrée sur le trait — un doigt n'a pas à
 *                        viser un trait de 3 px (le test l'exige ≥ 14 px).
 *                        Le clavier (flèches, Home, PageUp/Down) et deux
 *                        boutons ± restent des chemins complets, en
 *                        affordance SECONDAIRE.
 *
 *                        L'AIMANTATION est le point critique : les crans ne
 *                        sont PAS régulièrement espacés, ce sont les hauteurs
 *                        remarquables elles-mêmes (0, ±1/2, ±√2/2, ±√3/2, ±1)
 *                        plus quelques intermédiaires. C'est elle, et non
 *                        l'adresse de l'élève, qui garantit que « k = √2/2 »
 *                        est atteint EXACTEMENT — et que la solution s'écrit
 *                        π/4 et non 0,79.
 * Controlled variable    la hauteur k de la barre.
 * Mathematical state     { k } ; les points allumés, leur nombre, l'écart
 *                        entre eux et tous les nombres en sont DÉRIVÉS.
 * Visual consequence     la barre glisse ; les points d'intersection
 *                        apparaissent, disparaissent, se resserrent.
 * Expected observation   « il y en a une infinité, tous les 2π » ; « au-dessus
 *                        de 1, il n'y en a plus aucun » ; « sur le cercle il
 *                        n'y en a que deux ».
 * Misconception targeted « une équation a UNE solution » ; « les solutions
 *                        s'arrêtent au bord du dessin ».
 *
 * LES NOMBRES SONT DANS LE DOM, jamais en <text> SVG : au-delà de 2π les
 * points allumés se rapprochent, et des étiquettes s'y chevaucheraient.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne porte QUE le verrou
 * d'ANTÉRIORITÉ d'une étape sur la précédente. Un élève qui vient de
 * comprendre doit pouvoir refaire le geste.
 */
const GRIS = '#94a3b8';
const BARRE = '#f59e0b';
const ALLUME = '#dc2626';

export default function BarreLab({
  fn = COS,
  k,
  onChangeK,
  /** Colorier l'ARC solution d'une inéquation, plutôt que les points. */
  inegalite = null,        // '>=' | '<=' | null
  /** Montrer les repères de la famille (l'écart de 2π), module 2. */
  montreEcart = false,
  disabled = false,
  label = 'La barre qui coupe',
}) {
  const cercleRef = useRef(null);
  const courbeRef = useRef(null);

  // ─── LA FENÊTRE EST MESURÉE, PAS FIXÉE ────────────────────────────────
  // Le viewBox suit la largeur RÉELLEMENT disponible. On démarre sur la
  // fenêtre la plus étroite : elle tient partout, donc le premier rendu ne
  // déborde jamais, même avant la première mesure.
  const boiteRef = useRef(null);
  const [dispo, setDispo] = useState(0);
  useLayoutEffect(() => {
    const el = boiteRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => setDispo(e.contentRect.width));
    ro.observe(el);
    setDispo(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  const vue = fenetreDerouleur(dispo || 0);

  const yBarre = yDeVal(k);
  const points = inegalite ? [] : solutionsDansFenetre(fn, k, vue.tMin, vue.tMax);
  const arcs = inegalite ? arcsSolution(fn, k, inegalite) : [];
  const i = indexK(k);

  // La solution principale, EXACTE : c'est elle qui s'écrit « π/3 » et non « 1,05 ».
  const a = Math.abs(k) <= 1
    ? (fn.id === 'cos' ? solutionPrincipaleCos(k) : solutionPrincipaleSin(k))
    : null;

  const bouger = (d) => { if (!disabled) onChangeK?.(decalerK(k, d)); };

  /**
   * Pointeur → hauteur. On passe par la boîte du SVG pour rester juste quel
   * que soit le zoom, puis on délègue au modèle pur (aimantation), qui est
   * testé. Les DEUX cadres pilotent la même barre : elle est un seul objet.
   */
  const depuisPointeur = (e, ref) => {
    const svg = ref.current;
    if (!svg || disabled) return;
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const vy = ((e.clientY - r.top) / r.height) * H_CADRE;
    onChangeK?.(kDepuisPointeur(vy));
  };

  const onKey = (e) => {
    if (disabled) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); bouger(1); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); bouger(-1); }
    if (e.key === 'Home') { e.preventDefault(); onChangeK?.(0); }
    if (e.key === 'PageUp') { e.preventDefault(); bouger(3); }
    if (e.key === 'PageDown') { e.preventDefault(); bouger(-3); }
  };

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const ecrit = ecritureK(k);
  const grab = disabled ? '' : 'cursor-grab';

  /**
   * La BANDE DE PRÉHENSION, invisible, de HAUTEUR_PRISE px : le piège payé
   * trois fois dans cette mission. Elle est posée sur toute la largeur du
   * cadre, et le geste y est capturé (`setPointerCapture`) pour que le doigt
   * puisse sortir du cadre sans perdre la barre.
   */
  const bandePrise = (largeur, ref) => (
    <rect
      x={0} y={yBarre - HAUTEUR_PRISE / 2} width={largeur} height={HAUTEUR_PRISE}
      fill="transparent"
      className={grab}
      onPointerDown={(e) => {
        if (disabled) return;
        e.currentTarget.ownerSVGElement.setPointerCapture(e.pointerId);
        depuisPointeur(e, ref);
      }}
    />
  );

  return (
    <div className="space-y-3" role="group" aria-label={label}>
      <div className="flex flex-col lg:flex-row gap-3 items-stretch">
        {/* ─── À GAUCHE : le cercle, coupé par la barre ─────────────────── */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-2 shrink-0">
          <svg
            ref={cercleRef}
            viewBox={`0 0 ${H_CADRE} ${H_CADRE}`}
            className={`w-full max-w-[220px] mx-auto touch-none select-none ${grab}`}
            role="img"
            aria-label={
              `Le cercle, coupé par une barre de hauteur ${ecrit}. ` +
              (Math.abs(k) > 1
                ? 'Elle passe à côté du cercle : aucune solution.'
                : `Elle le rencontre en deux points${a !== null ? `, dont ${labelPi(a) ?? fr(a)}` : ''}.`)
            }
            onPointerMove={(e) => { if (!disabled && e.buttons === 1) depuisPointeur(e, cercleRef); }}
          >
            <line x1={CX - R - 14} y1={CY} x2={CX + R + 14} y2={CY} stroke={GRIS} strokeWidth="1.5" />
            <line x1={CX} y1={CY - R - 14} x2={CX} y2={CY + R + 14} stroke={GRIS} strokeWidth="1.5" />
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#cbd5e1" strokeWidth="2.5" />

            {/* L'ARC solution, quand on résout une INÉQUATION : c'est là que
                l'élève voit que la solution n'est pas deux points mais un
                morceau de cercle. Le chemin est DÉRIVÉ des arcs du modèle. */}
            {arcs.filter((s) => s.a - s.de > 1e-9).map((s) => {
              const p0 = { x: CX + R * Math.cos(s.de), y: CY - R * Math.sin(s.de) };
              const p1 = { x: CX + R * Math.cos(s.a), y: CY - R * Math.sin(s.a) };
              const grand = s.a - s.de > Math.PI ? 1 : 0;
              return (
                <path
                  key={`${s.de}-${s.a}`}
                  d={`M ${p0.x} ${p0.y} A ${R} ${R} 0 ${grand} 0 ${p1.x} ${p1.y}`}
                  fill="none" stroke={ALLUME} strokeWidth="6" strokeLinecap="round" strokeOpacity="0.85"
                />
              );
            })}

            {/* LA BARRE — verticale pour le cosinus (l'abscisse vaut k),
                horizontale pour le sinus (l'ordonnée vaut k). Elle traverse
                tout le cadre : on VOIT qu'elle rate le cercle quand |k| > 1. */}
            {fn.id === 'cos' ? (
              <line
                x1={CX + k * R} y1={0} x2={CX + k * R} y2={H_CADRE}
                stroke={BARRE} strokeWidth="3" strokeDasharray="6 4"
              />
            ) : (
              <line x1={0} y1={yBarre} x2={H_CADRE} y2={yBarre} stroke={BARRE} strokeWidth="3" strokeDasharray="6 4" />
            )}

            {/* Les DEUX points du cercle : la famille tout entière s'y résume. */}
            {Math.abs(k) <= 1 && !inegalite && [...new Set(
              solutionsDansFenetre(fn, k, 0, TAU - 1e-9).map((x) => x.toFixed(12)),
            )].map((s) => {
              const x = Number(s);
              return (
                <circle
                  key={s}
                  cx={CX + R * Math.cos(x)} cy={CY - R * Math.sin(x)} r="6.5"
                  fill={ALLUME} stroke="#fff" strokeWidth="2"
                />
              );
            })}

            {/* La bande de préhension, sur toute la largeur, INVISIBLE. */}
            {bandePrise(H_CADRE, cercleRef)}
          </svg>
        </div>

        {/* ─── À DROITE : la courbe déroulée, coupée par la même barre ──── */}
        {/* LA FENÊTRE EST MESURÉE. Le dessin ne défile pas et ne se comprime
            pas : on RÉDUIT la fenêtre affichée quand la place manque, et
            toute fenêtre candidate garde deux tours entiers — sans quoi
            l'espacement de 2π, qui EST le sujet, serait inobservable. */}
        <div ref={boiteRef} className="rounded-2xl border-2 border-slate-200 bg-white p-2 flex-1 min-w-0">
          <svg
            ref={courbeRef}
            viewBox={`0 0 ${vue.largeur} ${H_CADRE}`}
            width={vue.largeur}
            height={H_CADRE}
            className={`touch-none select-none block max-w-full ${grab}`}
            role="img"
            aria-label={
              inegalite
                ? `La courbe et la barre de hauteur ${ecrit} : la solution est un arc de longueur ${fr(mesureArcs(arcs), 2)} par tour.`
                : points.length === 0
                  ? `La courbe ne rencontre jamais la barre de hauteur ${ecrit} : aucune solution.`
                  : `La barre de hauteur ${ecrit} coupe la courbe en ${points.length} points visibles, espacés de 2π. Il y en a une infinité.`
            }
            onPointerMove={(e) => { if (!disabled && e.buttons === 1) depuisPointeur(e, courbeRef); }}
          >
            <line x1={0} y1={yDeVal(1)} x2={vue.largeur} y2={yDeVal(1)} stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="5 4" />
            <line x1={0} y1={yDeVal(-1)} x2={vue.largeur} y2={yDeVal(-1)} stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="5 4" />
            <line x1={0} y1={CY} x2={vue.largeur} y2={CY} stroke={GRIS} strokeWidth="1.5" />

            {/* Graduations. Seules les majeures portent une étiquette : le pas
                de π garantit qu'aucune ne chevauche sa voisine (test). */}
            {vue.graduations.map((g) => (
              <g key={g.t}>
                <line
                  x1={g.x} y1={CY - (g.majeure ? 6 : 3)} x2={g.x} y2={CY + (g.majeure ? 6 : 3)}
                  stroke={GRIS} strokeWidth={g.majeure ? 1.5 : 1}
                />
                {g.label !== null && (
                  <text x={g.x} y={CY + 20} fontSize="11" fill="#64748b" textAnchor="middle">{g.label}</text>
                )}
              </g>
            ))}

            {/* Les BANDES solution d'une inéquation, dans la fenêtre : la
                solution se répète elle aussi de 2π en 2π. */}
            {inegalite && arcs.filter((s) => s.a - s.de > 1e-9).flatMap((s) => {
              const out = [];
              for (let n = Math.floor(vue.tMin / TAU) - 1; n <= Math.ceil(vue.tMax / TAU) + 1; n += 1) {
                const de = Math.max(vue.tMin, s.de + n * TAU);
                const a2 = Math.min(vue.tMax, s.a + n * TAU);
                if (a2 > de) out.push(
                  <rect
                    key={`${s.de}-${n}`}
                    x={vue.xDe(de)} y={yDeVal(1)} width={vue.xDe(a2) - vue.xDe(de)} height={yDeVal(-1) - yDeVal(1)}
                    fill={ALLUME} fillOpacity="0.13"
                  />,
                );
              }
              return out;
            })}

            {/* LA COURBE. */}
            <path
              d={courbeFenetre(fn, vue).map((p, n) => `${n === 0 ? 'M' : 'L'} ${vue.xDe(p.x).toFixed(2)} ${yDeVal(p.y).toFixed(2)}`).join(' ')}
              fill="none" stroke={fn.tone} strokeWidth="2.5" strokeLinecap="round"
            />

            {/* LA BARRE, à la MÊME ordonnée que dans le cadre de gauche : les
                deux cadres partagent l'échelle verticale (test), donc c'est
                visuellement UN seul trait qui traverse toute la figure. */}
            <line x1={0} y1={yBarre} x2={vue.largeur} y2={yBarre} stroke={BARRE} strokeWidth="3" strokeDasharray="6 4" />

            {/* L'ÉCART entre deux points d'une même branche : 2π, matérialisé. */}
            {montreEcart && points.length >= 2 && (() => {
              // Deux points CONSÉCUTIFS de la même branche sont à 2π l'un de
              // l'autre — on cherche donc la première paire dont l'écart vaut
              // un tour, plutôt que deux points voisins quelconques.
              const paire = points.find((p, n) => n + 1 < points.length
                && points.some((q) => Math.abs(q - p - TAU) < 1e-9));
              if (paire === undefined) return null;
              const y = yBarre - 16;
              return (
                <g>
                  <line
                    x1={vue.xDe(paire)} y1={y} x2={vue.xDe(paire + TAU)} y2={y}
                    stroke="#7c3aed" strokeWidth="2"
                  />
                  <line x1={vue.xDe(paire)} y1={y - 5} x2={vue.xDe(paire)} y2={y + 5} stroke="#7c3aed" strokeWidth="2" />
                  <line x1={vue.xDe(paire + TAU)} y1={y - 5} x2={vue.xDe(paire + TAU)} y2={y + 5} stroke="#7c3aed" strokeWidth="2" />
                </g>
              );
            })()}

            {/* LES POINTS ALLUMÉS : ceux que la barre coupe. Le cadre en
                montre plusieurs ; il y en a une infinité. */}
            {points.map((x) => (
              <circle key={x} cx={vue.xDe(x)} cy={yBarre} r="5.5" fill={ALLUME} stroke="#fff" strokeWidth="2" />
            ))}

            {/* LA POIGNÉE de la barre, à gauche : une pastille visible de
                9 px de rayon, entourée d'une cible tactile invisible de 18. */}
            <circle cx={14} cy={yBarre} r={R_PRISE_POIGNEE} fill="transparent" />
            <circle
              cx={14} cy={yBarre} r={R_POIGNEE} fill={BARRE} stroke="#fff" strokeWidth="2.5"
              tabIndex={disabled ? -1 : 0}
              role="slider"
              aria-label="Hauteur de la barre"
              aria-valuenow={i}
              aria-valuemin={0}
              aria-valuemax={CRANS_K.length - 1}
              aria-valuetext={`k égale ${ecrit}`}
              onKeyDown={onKey}
              className={disabled ? '' : `${grab} [outline:none] focus-visible:[stroke:#2563eb] focus-visible:[stroke-width:4]`}
            />

            {/* La bande de préhension, sur toute la largeur, INVISIBLE. */}
            {bandePrise(vue.largeur, courbeRef)}
          </svg>
        </div>
      </div>

      {/* Les nombres, DANS LE DOM. Aucun ne s'écrit dans le SVG : au deuxième
          tour les points se rapprochent, et des étiquettes s'y toucheraient. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border-2 px-2 py-2" style={{ borderColor: BARRE }}>
          <div className="text-[13px] text-slate-500">hauteur de la barre</div>
          <div className="font-mono font-black tabular-nums text-slate-900" data-testid="k">k = {ecrit}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">{inegalite ? 'longueur de l’arc, par tour' : 'points allumés à l’écran'}</div>
          <div className="font-mono font-bold tabular-nums text-slate-900" data-testid="n-points">
            {inegalite ? fr(mesureArcs(arcs), 2) : points.length}
          </div>
        </div>
        <div className="rounded-lg border-2 px-2 py-2" style={{ borderColor: fn.tone }}>
          <div className="text-[13px]" style={{ color: fn.tone }}>solution de [0 ; π] ou [−π/2 ; π/2]</div>
          <div className="font-mono font-bold tabular-nums" style={{ color: fn.tone }} data-testid="a">
            {a === null ? 'aucune' : (labelPi(a) ?? fr(a))}
          </div>
        </div>
      </div>

      {/* Le cliquet, en affordance SECONDAIRE : la barre se saisit. */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Régler la hauteur de la barre">
        <button type="button" className={btn} onClick={() => bouger(-1)} disabled={disabled || i <= 0} aria-label="Descendre la barre">
          ↓ descendre
        </button>
        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm" aria-hidden="true">
          k = {ecrit}
        </span>
        <button type="button" className={btn} onClick={() => bouger(1)} disabled={disabled || i >= CRANS_K.length - 1} aria-label="Monter la barre">
          ↑ monter
        </button>
        <button type="button" className={btn} onClick={() => !disabled && onChangeK?.(0)} disabled={disabled} aria-label="Remettre la barre à zéro">
          ⟲ zéro
        </button>
        <span className="text-[13px] text-slate-500">
          <strong>attrape la barre</strong> et fais-la glisser de haut en bas
        </span>
      </div>
    </div>
  );
}

export { COS, SIN };
