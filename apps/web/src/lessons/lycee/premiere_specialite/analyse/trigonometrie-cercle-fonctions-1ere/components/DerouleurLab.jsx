import React, { useRef, useState, useLayoutEffect } from 'react';
import {
  PAS, CRAN_MIN, CRAN_MAX, tDuCran, bornerCran, cranDepuisPointeur,
  R, CX, CY, H_CADRE, MARGE_G, yDeVal,
  segmentsTrace, labelPi, fr, SIN, COS, fenetreDerouleur, FENETRES,
} from './trigFnUtils';

/**
 * DerouleurLab — l'interaction SIGNATURE : « dérouler le cercle ».
 *
 * Activity               à gauche le cercle, à droite un axe VIDE. L'élève
 *                        ENROULE un point sur le cercle, cran par cran
 *                        (pas de π/12) ; à chaque position, l'ordonnée (ou
 *                        l'abscisse) du point est REPORTÉE sur l'axe de
 *                        droite, à la même hauteur. La courbe SE DESSINE par
 *                        le geste : elle n'est jamais affichée d'avance.
 * Mathematical objective la courbe du sinus EST le cercle déroulé. La
 *                        périodicité, c'est « on revient au même endroit » ;
 *                        la parité, c'est « de quel côté on a tourné ».
 * Student action         ATTRAPER le point et le faire tourner autour du
 *                        cercle, au doigt ou à la souris — « enrouler » est un
 *                        geste, pas un clic. Le clavier (flèches, Home,
 *                        PageUp/Down) et deux boutons ± restent des chemins
 *                        complets, en affordance SECONDAIRE.
 *
 *                        DEUX GARANTIES que le glisser exige, toutes deux
 *                        portées par le modèle pur et verrouillées par le test :
 *                        · AIMANTATION — un doigt ne vise pas au pixel ; la
 *                          position est aimantée sur le cran le plus proche,
 *                          ce qui fait tomber π/6, π/4, π/3, π/2 et π
 *                          EXACTEMENT juste, et afficher 0,5 et non 0,4999 ;
 *                        · ENROULEMENT CONTINU — `atan2` ne connaît qu'un
 *                          tour et sauterait de 2π à 0 en franchissant le
 *                          point (1 ; 0). `cranDepuisPointeur` reçoit le cran
 *                          COURANT et choisit le représentant le plus proche :
 *                          continuer de tourner DÉPASSE 2π, et tourner à
 *                          l'envers descend sous 0. Sans cela, la périodicité
 *                          et la parité seraient inobservables au glisser.
 * Controlled variable    le cran n, donc le réel t = n × π/12.
 * Mathematical state     { cran, visites } ; le point, le trait de report, la
 *                        trace et tous les nombres en sont DÉRIVÉS.
 * Visual consequence     le point tourne, le trait de report glisse
 *                        horizontalement, la trace s'allonge.
 * Expected observation   « au deuxième tour, la trace repasse exactement sur
 *                        elle-même » ; « en tournant à l'envers, la trace du
 *                        sinus est retournée, celle du cosinus est la même ».
 * Misconception targeted « au-delà de 2π on sort du cercle » ; « la courbe du
 *                        sinus est un objet nouveau, sans rapport avec le
 *                        cercle » ; « sin et cos se comportent pareil quand on
 *                        tourne à l'envers ».
 *
 * LES NOMBRES SONT DANS LE DOM, jamais en <text> SVG : c'est la parade contre
 * les collisions d'étiquettes quand la trace se replie sur elle-même au
 * deuxième tour. Seules les graduations de l'axe portent du texte, à un pas de
 * π mesuré sans chevauchement (test de mise en page).
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ
 * d'une étape sur la précédente. Un élève qui vient de comprendre doit pouvoir
 * refaire le geste.
 */
const GRIS = '#94a3b8';
const REPORT = '#f59e0b';

export default function DerouleurLab({
  fn = SIN,
  cran,
  onChangeCran,
  visites = [],
  /** Trace fantôme d'une seconde fonction, pour la comparaison du module 5. */
  fantome = null,
  disabled = false,
  /** Repères verticaux sur l'axe déroulé : [{ t, label }]. */
  reperes = [],
  label = 'Dérouler le cercle',
}) {
  const svgRef = useRef(null);
  // ─── LA FENÊTRE EST MESURÉE, PAS FIXÉE ────────────────────────────────
  // Règle `svg_illustration_vs_manipulable` : le viewBox suit la largeur
  // RÉELLEMENT disponible. On mesure le conteneur, et le modèle choisit la
  // fenêtre la plus riche qui y tient sans que les étiquettes se chevauchent.
  // Départ sur la fenêtre la plus étroite : elle tient partout, donc le premier
  // rendu ne déborde jamais, même avant la première mesure.
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

  // Si l'état vient d'une fenêtre plus large (rotation de l'écran, module qui
  // démarre à 3π), on AFFICHE le point au bord plutôt que hors cadre.
  const cranVu = Math.max(vue.cranMin, Math.min(vue.cranMax, cran));
  const t = tDuCran(cranVu);
  const val = fn.exact(t);
  // Le point du cercle : ses DEUX coordonnées, exactes aux crans.
  const px = CX + COS.exact(t) * R;
  const py = CY - SIN.exact(t) * R;
  // Le point de la courbe : même hauteur que le point du cercle, par
  // construction (les deux cadres partagent l'échelle verticale — test).
  const cx = vue.xDe(t);   // dérivé de cranVu : toujours dans le cadre
  const cy = yDeVal(val);

  // Le cliquet et le glisser sont bornés à la fenêtre VISIBLE : on ne peut pas
  // amener le point là où la trace ne serait pas dessinée.
  const borner = (n) => Math.max(vue.cranMin, Math.min(vue.cranMax, n));
  const peutEnrouler = !disabled && cran < vue.cranMax;
  const peutDerouler = !disabled && cran > vue.cranMin;

  // La trace ne dessine QUE les crans de la fenêtre : un point hors cadre
  // aurait une boîte qui déborde, et l'audit de débordement le verrait.
  const vus = visites.filter((n) => n >= vue.cranMin && n <= vue.cranMax);
  const segs = segmentsTrace(fn, vus);
  const segsFantome = fantome ? segmentsTrace(fantome, vus) : [];

  const chemin = (seg) => seg.map((p, i) => `${i === 0 ? 'M' : 'L'} ${vue.xDe(p.x)} ${yDeVal(p.y)}`).join(' ');

  const bouger = (d) => {
    if (disabled) return;
    onChangeCran?.(borner(cran + d));
  };

  /**
   * Pointeur → cran. La conversion passe par la boîte du SVG pour rester juste
   * quel que soit le zoom ou la taille d'affichage, puis délègue au modèle pur
   * (aimantation + enroulement continu), qui est testé.
   */
  const depuisPointeur = (e) => {
    const svg = svgRef.current;
    if (!svg || disabled) return;
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return;
    // Coordonnées dans le viewBox, puis relatives au centre, y vers le HAUT.
    const vx = ((e.clientX - r.left) / r.width) * H_CADRE;
    const vy = ((e.clientY - r.top) / r.height) * H_CADRE;
    const dx = vx - CX;
    const dy = CY - vy;
    // Trop près du centre, l'angle n'a pas de sens : on ignore plutôt que de
    // faire sauter le point au hasard.
    if (Math.hypot(dx, dy) < 10) return;
    onChangeCran?.(borner(cranDepuisPointeur(dx, dy, cran)));
  };

  const onKey = (e) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); bouger(1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); bouger(-1); }
    if (e.key === 'Home') { e.preventDefault(); onChangeCran?.(0); }
    if (e.key === 'PageUp') { e.preventDefault(); onChangeCran?.(borner(cran + 6)); }
    if (e.key === 'PageDown') { e.preventDefault(); onChangeCran?.(borner(cran - 6)); }
  };

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const ecrit = labelPi(t);

  return (
    <div className="space-y-3" role="group" aria-label={label}>
      <div className="flex flex-col lg:flex-row gap-3 items-stretch">
        {/* ─── À GAUCHE : le cercle ─────────────────────────────────────── */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-2 shrink-0">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${H_CADRE} ${H_CADRE}`}
            className={`w-full max-w-[192px] mx-auto touch-none select-none ${disabled ? '' : 'cursor-grab'}`}
            role="group"
            aria-label={`Cercle : le réel ${ecrit ?? fr(t)} arrive au point d’abscisse ${fr(COS.exact(t))} et d’ordonnée ${fr(SIN.exact(t))}. Attrape le point et fais-le tourner.`}
            onPointerDown={(e) => {
              if (disabled) return;
              // Une SEULE zone tactile, capturée : le doigt peut sortir du
              // cercle sans que le geste soit perdu.
              e.currentTarget.setPointerCapture(e.pointerId);
              depuisPointeur(e);
            }}
            onPointerMove={(e) => { if (!disabled && e.buttons === 1) depuisPointeur(e); }}
          >
            <line x1={CX - R - 12} y1={CY} x2={CX + R + 12} y2={CY} stroke={GRIS} strokeWidth="1.5" />
            <line x1={CX} y1={CY - R - 12} x2={CX} y2={CY + R + 12} stroke={GRIS} strokeWidth="1.5" />
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#cbd5e1" strokeWidth="2" />

            {/* Le trait qui montre CE QU'ON REPORTE : l'ordonnée pour le
                sinus, l'abscisse pour le cosinus. */}
            {fn.id === 'sin' ? (
              <>
                <line x1={CX} y1={py} x2={px} y2={py} stroke={REPORT} strokeWidth="2" strokeDasharray="4 3" />
                <line x1={CX} y1={CY} x2={CX} y2={py} stroke={fn.tone} strokeWidth="4" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1={px} y1={CY} x2={px} y2={py} stroke={REPORT} strokeWidth="2" strokeDasharray="4 3" />
                <line x1={CX} y1={CY} x2={px} y2={CY} stroke={fn.tone} strokeWidth="4" strokeLinecap="round" />
              </>
            )}

            <line x1={CX} y1={CY} x2={px} y2={py} stroke="#0f172a" strokeWidth="1.5" />
            {/* La poignée. Une cible tactile généreuse (invisible) entoure la
                pastille visible : un doigt n'a pas à viser au pixel. */}
            <circle cx={px} cy={py} r="16" fill="transparent" />
            <circle
              cx={px} cy={py} r="7" fill={fn.tone} stroke="#fff" strokeWidth="2.5"
              tabIndex={disabled ? -1 : 0}
              role="slider"
              aria-label="Point enroulé sur le cercle"
              aria-valuenow={cran}
              aria-valuemin={vue.cranMin}
              aria-valuemax={vue.cranMax}
              aria-valuetext={`${ecrit ?? fr(t)} radians`}
              onKeyDown={onKey}
              className={disabled ? '' : 'cursor-grab [outline:none] focus-visible:[stroke:#2563eb] focus-visible:[stroke-width:4]'}
            />
          </svg>
        </div>

        {/* ─── À DROITE : l'axe déroulé, VIDE au départ ─────────────────── */}
        {/* ─── LE CADRE DÉROULÉ, À FENÊTRE MESURÉE ──────────────────────
            DÉFAUT ATTRAPÉ AU NAVIGATEUR (domOverflow à 375 px). L'axe déroulé
            faisait 530 px — trois tours à 26 px par radian — dans un <main>
            de 375 : il en sortait de 155 px, et trois éléments débordaient.

            Trois parades étaient possibles ; deux ne tiennent pas.
            · Le faire DÉFILER ne suffit pas : l'audit mesure la boîte de
              CHAQUE descendant, et un enfant poussé hors de la zone visible
              garde une boîte qui dépasse.
            · Le COMPRIMER ferait mentir l'échelle, et à 10 px par radian les
              étiquettes « 2π » et « 3π » se toucheraient. Jamais de
              `preserveAspectRatio="none"` ici.

            La parade retenue est la troisième : RÉDUIRE LA FENÊTRE affichée.
            On mesure la largeur réellement disponible (ResizeObserver), et
            `fenetreDerouleur` rend la fenêtre la plus riche qui y tient en
            gardant les étiquettes séparées. Sur un téléphone on montre de −2π
            à 3π au lieu de −2π à 4π : moins de tours, même lisibilité, et
            surtout les DEUX gestes de la leçon — dépasser 2π, descendre sous
            0 — restent possibles dans toutes les fenêtres (test). */}
        <div ref={boiteRef} className="rounded-2xl border-2 border-slate-200 bg-white p-2 flex-1 min-w-0">
          <svg
            viewBox={`0 0 ${vue.largeur} ${H_CADRE}`}
            width={vue.largeur}
            height={H_CADRE}
            className="touch-none select-none block max-w-full"
            role="img"
            aria-label={
              visites.length < 2
                ? 'Axe déroulé : encore vide. Enroule le point pour y reporter des hauteurs.'
                : `Axe déroulé : ${visites.length} positions reportées, de ${labelPi(tDuCran(Math.min(...visites))) ?? ''} à ${labelPi(tDuCran(Math.max(...visites))) ?? ''}.`
            }
          >
            {/* les deux bornes de la bande [−1 ; 1] : la courbe n'en sort jamais */}
            <line x1={0} y1={yDeVal(1)} x2={vue.largeur} y2={yDeVal(1)} stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="5 4" />
            <line x1={0} y1={yDeVal(-1)} x2={vue.largeur} y2={yDeVal(-1)} stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="5 4" />
            <line x1={0} y1={CY} x2={vue.largeur} y2={CY} stroke={GRIS} strokeWidth="1.5" />

            {/* Graduations. Seules les majeures portent une étiquette : le pas
                de π garantit qu'aucune ne chevauche sa voisine (test). */}
            {vue.graduations.map((g) => (
              <g key={g.t}>
                <line
                  x1={g.x} y1={CY - (g.majeure ? 6 : 3)}
                  x2={g.x} y2={CY + (g.majeure ? 6 : 3)}
                  stroke={GRIS} strokeWidth={g.majeure ? 1.5 : 1}
                />
                {g.label !== null && (
                  <text x={g.x} y={CY + 20} fontSize="11" fill="#64748b" textAnchor="middle">{g.label}</text>
                )}
              </g>
            ))}

            {/* Repères pédagogiques éventuels (module 4 : les changements de sens). */}
            {reperes.filter((r) => r.t >= vue.tMin && r.t <= vue.tMax).map((r) => (
              <line
                key={r.t} x1={vue.xDe(r.t)} y1={yDeVal(1)} x2={vue.xDe(r.t)} y2={yDeVal(-1)}
                stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="3 3"
              />
            ))}

            {/* La trace FANTÔME, quand on compare deux fonctions. */}
            {segsFantome.map((seg, i) => (
              <path key={`f${i}`} d={chemin(seg)} fill="none" stroke={fantome.tone} strokeWidth="2" strokeOpacity="0.35" strokeDasharray="5 4" />
            ))}

            {/* LA TRACE : elle naît du geste, elle n'est pas affichée d'avance. */}
            {segs.map((seg, i) => (
              <path key={i} d={chemin(seg)} fill="none" stroke={fn.tone} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            ))}

            {/* Le report : le trait horizontal qui relie la hauteur du point du
                cercle à la position courante sur l'axe. C'est LUI qui fait
                comprendre que la courbe est le cercle déroulé. */}
            <line x1={0} y1={cy} x2={cx} y2={cy} stroke={REPORT} strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1={cx} y1={CY} x2={cx} y2={cy} stroke={REPORT} strokeWidth="2" />
            <circle cx={cx} cy={cy} r="5.5" fill={fn.tone} stroke="#fff" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* Les nombres, DANS LE DOM. Aucun ne s'écrit dans le SVG : deux points
          voisins au deuxième tour rendraient les étiquettes illisibles. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">réel enroulé</div>
          <div className="font-mono font-bold tabular-nums text-slate-900" data-testid="t-ecrit">
            x = {ecrit ?? fr(t)}
          </div>
        </div>
        <div className="rounded-lg border-2 px-2 py-2" style={{ borderColor: fn.tone }}>
          <div className="text-[13px]" style={{ color: fn.tone }}>{fn.ecriture} x</div>
          <div className="font-mono font-black tabular-nums" style={{ color: fn.tone }} data-testid="val">
            {fr(val)}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px] text-slate-500">positions reportées</div>
          <div className="font-mono font-bold tabular-nums text-slate-900" data-testid="n-visites">{visites.length}</div>
        </div>
      </div>

      {/* Le cliquet. Un pas de π/12 : toutes les valeurs remarquables tombent
          dessus exactement (test), et rien d'autre n'est atteignable. */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Enrouler le point sur le cercle">
        <button type="button" className={btn} onClick={() => bouger(-1)} disabled={!peutDerouler} aria-label="Enrouler dans l’autre sens">
          ← à l’envers
        </button>
        {/* Simple AFFICHAGE. La poignée du cercle est le seul `slider` : en
            déclarer deux ferait annoncer au lecteur d'écran deux réglages
            distincts là où il n'y en a qu'un. */}
        <span
          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm"
          aria-hidden="true"
        >
          {ecrit ?? fr(t)}
        </span>
        <button type="button" className={btn} onClick={() => bouger(1)} disabled={!peutEnrouler} aria-label="Enrouler d’un cran">
          enrouler →
        </button>
        <button type="button" className={btn} onClick={() => !disabled && onChangeCran?.(0)} disabled={disabled} aria-label="Revenir au départ">
          ⟲ départ
        </button>
        <span className="text-[13px] text-slate-500">
          attrape le point et fais-le tourner · un cran = <span className="font-mono">π/12</span>
        </span>
      </div>
    </div>
  );
}

/** Le pas du cliquet, réexporté pour les modules qui l'annoncent à l'élève. */
export { PAS };
