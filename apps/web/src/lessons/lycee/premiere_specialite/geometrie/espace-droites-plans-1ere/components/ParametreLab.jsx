import React, { useCallback, useRef, useState } from 'react';
import {
  CUBE, DEMI_CADRE, RAYON_POIGNEE, PAS_ROT,
  ecran, sommetsEcran, orientationApresGlisser, orientationApresTouche,
  rotateSolid, visibleEdges, visibleVertices,
  pointDeParametre, lignesParametriques, fr, frVec3,
} from './planUtils';

/**
 * ParametreLab — « Le paramètre qui parcourt ».
 *
 * Activity               un curseur qu'on ATTRAPE sur la droite elle-même, et
 *                        qui court le long d'elle quand on le tire.
 * Mathematical objective le paramètre t n'est pas une lettre de plus : c'est la
 *                        POSITION le long de la droite. t = 0 donne le point de
 *                        départ, t = 1 le point d'arrivée, t négatif repart de
 *                        l'autre côté.
 * Student action         glisser le point orange le long de la droite ; le
 *                        reste du geste tourne la boîte.
 * Controlled variable    t, aimanté sur les crans d'un demi.
 * Mathematical state     t seul. Les trois coordonnées du point courant en sont
 *                        DÉRIVÉES par A + t·u, jamais stockées.
 * Visual consequence     le point court, sort du cube pour t < 0 ou t > 1, et
 *                        la droite se prolonge avec lui.
 * Expected observation   « les trois coordonnées bougent ENSEMBLE, et toujours
 *                        du même multiple de la direction ».
 * Misconception targeted t serait une coordonnée de plus ; la droite s'arrêterait
 *                        aux deux points qui la définissent ; deux coordonnées
 *                        qui s'accordent suffiraient à placer un point dessus.
 * Formalization          aucune ici ; le module 4 fait CONSTATER puis pose la
 *                        brique `representation-parametrique`.
 *
 * ─── LE GLISSER, ET L'ATTEIGNABILITÉ ──────────────────────────────────────
 * Le curseur se saisit SUR LA DROITE — pas au bouton. Comme un doigt ne vise
 * pas au centième, t est AIMANTÉ sur les crans de `PAS_T` : les valeurs
 * remarquables (0, 0,5, 1) tombent donc exactement, et un test le vérifie.
 *
 * La projection étant une application affine, la position du curseur à l'écran
 * est affine en t : on retrouve donc t par une PROJECTION ORTHOGONALE du doigt
 * sur le segment écran, ce qui est exact et bien conditionné — contrairement à
 * une inversion de la projection 3D, qui serait dégénérée aux vues rasantes.
 *
 * Le clavier est un chemin complet : ← → déplacent le curseur d'un cran,
 * Home/End le portent aux bornes, ↑ ↓ tournent la boîte.
 *
 * ─── LES NOMBRES SONT DANS LE DOM ─────────────────────────────────────────
 * t et les trois coordonnées du point courant se lisent sous la figure. Le SVG
 * ne porte que des traits et des pastilles.
 *
 * ─── JAMAIS GELÉ ──────────────────────────────────────────────────────────
 * `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ.
 */

/**
 * LE CRAN DU PARAMÈTRE, et pourquoi c'est un QUART et non un demi.
 *
 * Les trois cibles pédagogiques sont t = 0 (le départ), t = 0,5 (le milieu du
 * segment, qui est le centre de la boîte pour la grande diagonale) et t = 1
 * (l'arrivée). Un cran d'un demi les atteindrait toutes les trois. Le quart les
 * atteint aussi — et il permet en plus de DÉPASSER des deux côtés sans sortir
 * du cadre, ce qu'un test a rendu obligatoire (voir T_MIN / T_MAX).
 *
 * Les coordonnées du point restent lisibles : les vecteurs directeurs des
 * droites du module valent ±2 sur chaque axe, donc un quart de tour donne des
 * demi-entiers (0,5 ; 1,5), jamais des tiers ni des 1,3333.
 */
export const PAS_T = 0.25;

/**
 * LES BORNES OFFERTES, MESURÉES ET NON CHOISIES.
 *
 * On dépasse des DEUX côtés pour que l'élève VOIE que la droite ne s'arrête pas
 * aux deux points qui la définissent : c'est l'erreur que le module 4 vise.
 *
 * Mais on ne peut pas dépasser autant qu'on veut : l'échelle du dessin est
 * dérivée du cube et du plan mobile, et un test de balayage a refusé
 * t ∈ [−1 ; 2], qui faisait sortir la droite (AG) de 115 unités hors du cadre à
 * (yaw −90 ; pitch 30), et même t ∈ [−0,5 ; 1,5], qui en sortait de 30.
 *
 * t ∈ [−0,25 ; 1,25] tient sur TOUTE la plage de rotation, avec 12,4 unités de
 * garde au pire cas — et le dépassement reste bien visible : 34 à 46 unités
 * d'écran de chaque côté selon la droite, mesurées dans la vue de départ,
 * contre 135 à 183 pour le segment lui-même.
 */
export const T_MIN = -0.25;
export const T_MAX = 1.25;

/** Aimante un paramètre sur son cran, puis le borne. */
export function aimanterT(t) {
  const k = Math.round(t / PAS_T) * PAS_T;
  const b = Math.min(T_MAX, Math.max(T_MIN, k));
  return b === 0 ? 0 : b;
}

/** Tous les crans réellement atteignables — la plage entière, énumérée. */
export function crans() {
  const out = [];
  for (let t = T_MIN; t <= T_MAX + 1e-9; t += PAS_T) out.push(aimanterT(t));
  return out;
}

/**
 * Le paramètre correspondant à un point de l'écran, par PROJECTION ORTHOGONALE
 * sur le segment [t=0 ; t=1] projeté.
 *
 * La projection cavalière composée d'une rotation est une application AFFINE :
 * l'image de A + t·u est donc E(0) + t·(E(1) − E(0)), et retrouver t revient à
 * projeter le doigt sur cette droite de l'écran. C'est exact, et cela reste
 * bien conditionné tant que le segment n'est pas dégénéré à l'écran — cas que
 * la garde ci-dessous traite en rendant le paramètre courant.
 */
export function parametreSousLeDoigt(orientation, droite, pointEcran, tCourant) {
  const [E0, E1] = ecran(orientation, [
    pointDeParametre(droite, 0), pointDeParametre(droite, 1),
  ]);
  const vx = E1.x - E0.x;
  const vy = E1.y - E0.y;
  const n2 = vx * vx + vy * vy;
  if (n2 < 1e-9) return tCourant;
  const t = ((pointEcran.x - E0.x) * vx + (pointEcran.y - E0.y) * vy) / n2;
  return aimanterT(t);
}

const C_ARETE = '#334155';
const C_DROITE = '#0284c7';
const C_PROLONGE = '#94a3b8';
const C_CURSEUR = '#f59e0b';
const C_ANCRE = '#e11d48';

export default function ParametreLab({
  orientation,
  onOrientation,
  droite,
  t,
  onT,
  disabled = false,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  const geste = useRef({ curseur: false, x0: 0, y0: 0, o0: null });
  const [saisi, setSaisi] = useState(null);

  const tourne = rotateSolid(CUBE, orientation);
  const { visible, hidden } = visibleEdges(tourne);
  const vus = visibleVertices(tourne);
  const S = sommetsEcran(orientation);

  const M = pointDeParametre(droite, t);
  const lignes = lignesParametriques(droite);
  const [Emin, E0, E1, Emax, EM] = ecran(orientation, [
    pointDeParametre(droite, T_MIN),
    pointDeParametre(droite, 0),
    pointDeParametre(droite, 1),
    pointDeParametre(droite, T_MAX),
    M,
  ]);

  const versCadre = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return { x: 0, y: 0 };
    return {
      x: ((e.clientX - r.left) / r.width) * (2 * DEMI_CADRE),
      y: ((e.clientY - r.top) / r.height) * (2 * DEMI_CADRE),
    };
  }, []);

  const prendre = (e) => {
    if (disabled) return;
    // SANS CECI, LE GLISSER SE FIGE AU PREMIER PIXEL.
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const P = versCadre(e);
    const surCurseur = Math.hypot(P.x - EM.x, P.y - EM.y) <= 26;
    geste.current = { curseur: surCurseur, x0: e.clientX, y0: e.clientY, o0: orientation };
    setSaisi(surCurseur ? 'curseur' : 'boite');
    if (surCurseur) {
      const suivant = parametreSousLeDoigt(orientation, droite, P, t);
      if (suivant !== t) onT?.(suivant);
    }
  };

  const bouger = (e) => {
    if (disabled || !saisi) return;
    if (geste.current.curseur) {
      const suivant = parametreSousLeDoigt(orientation, droite, versCadre(e), t);
      if (suivant !== t) onT?.(suivant);
      return;
    }
    const dx = e.clientX - geste.current.x0;
    const dy = e.clientY - geste.current.y0;
    onOrientation?.(orientationApresGlisser(geste.current.o0, dx, dy));
  };

  const lacher = (e) => {
    if (disabled) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    geste.current.curseur = false;
    setSaisi(null);
  };

  const auClavier = (e) => {
    if (disabled) return;
    // ← et → pilotent le CURSEUR ; ↑ ↓ et les autres tournent la boîte.
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      onT?.(aimanterT(t + (e.key === 'ArrowRight' ? PAS_T : -PAS_T)));
      return;
    }
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      onT?.(e.key === 'Home' ? T_MIN : T_MAX);
      return;
    }
    const suivant = orientationApresTouche(orientation, e.key);
    if (!suivant) return;
    e.preventDefault();
    onOrientation?.(suivant);
  };

  const arete = ([i, j], cachee) => (
    <line
      key={`${i}-${j}-${cachee ? 'h' : 'v'}`}
      x1={S[i].x} y1={S[i].y} x2={S[j].x} y2={S[j].y}
      stroke={C_ARETE} strokeWidth={cachee ? 1.4 : 2}
      strokeDasharray={cachee ? '6 4' : undefined}
      opacity={cachee ? 0.3 : 0.85} strokeLinecap="round"
    />
  );

  const btn = 'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 '
    + 'disabled:opacity-40 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${2 * DEMI_CADRE} ${2 * DEMI_CADRE}`}
        className={`w-full max-w-[340px] mx-auto bg-white rounded-xl border-2 border-slate-200 touch-none select-none ${
          disabled ? 'opacity-60' : saisi === 'curseur' ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        role="application"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        onPointerDown={prendre}
        onPointerMove={bouger}
        onPointerUp={lacher}
        onPointerCancel={lacher}
        onKeyDown={auClavier}
        aria-label={
          ariaLabel
          ?? `La droite ${droite.nom ?? ''} dans la boîte, vue sous une rotation de `
            + `${fr(orientation.yaw)} degrés et une inclinaison de ${fr(orientation.pitch)} degrés. `
            + `Le curseur est au paramètre ${fr(t)}, c’est-à-dire au point ${frVec3(M)}. `
            + 'Glisse le point orange le long de la droite, ou utilise les flèches gauche et droite.'
        }
      >
        <g style={{ pointerEvents: 'none' }}>
          {hidden.map((e) => arete(e, true))}
          {visible.map((e) => arete(e, false))}

          {/* LE PROLONGEMENT, en gris : la droite ne s'arrête pas aux deux
              points qui la définissent, et c'est ce que l'élève doit voir. */}
          <line x1={Emin.x} y1={Emin.y} x2={Emax.x} y2={Emax.y}
            stroke={C_PROLONGE} strokeWidth={2.5} strokeDasharray="6 5" strokeLinecap="round" />
          {/* LE SEGMENT DE RÉFÉRENCE, de t = 0 à t = 1. */}
          <line x1={E0.x} y1={E0.y} x2={E1.x} y2={E1.y}
            stroke={C_DROITE} strokeWidth={4} strokeLinecap="round" />

          {S.map((P, i) => (
            <circle key={`v${i}`} cx={P.x} cy={P.y} r={3}
              fill={vus.has(i) ? '#64748b' : '#cbd5e1'} opacity={vus.has(i) ? 1 : 0.6} />
          ))}

          {/* Les deux ancres t = 0 et t = 1. */}
          {[E0, E1].map((P, k) => (
            <circle key={`a${k}`} cx={P.x} cy={P.y} r={5.5}
              fill={C_ANCRE} stroke="#fff" strokeWidth={2.5} />
          ))}

          {/* LE CURSEUR, dessiné en dernier : c'est lui qu'on attrape. */}
          <circle cx={EM.x} cy={EM.y} r={saisi === 'curseur' ? RAYON_POIGNEE + 2 : RAYON_POIGNEE}
            fill={C_CURSEUR} stroke="#fff" strokeWidth={3} />
        </g>
      </svg>

      {/* LE CLIQUET DU PARAMÈTRE — chemin clavier et secours de la souris.
          Le glisser sur la droite reste le geste principal. */}
      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Déplacer le curseur sur la droite">
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Reculer le curseur de ${fr(PAS_T)}`}
          onClick={() => onT?.(aimanterT(t - PAS_T))}>−</button>
        <span className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-mono font-bold tabular-nums"
          data-testid="valeur-t">
          t = {fr(t)}
        </span>
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Avancer le curseur de ${fr(PAS_T)}`}
          onClick={() => onT?.(aimanterT(t + PAS_T))}>+</button>
        <span className="text-[13px] text-slate-500">
          attrape le point orange et fais-le courir sur la droite
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Tourner la boîte">
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Tourner la boîte de ${PAS_ROT} degrés vers la gauche`}
          onClick={() => onOrientation?.(orientationApresTouche(orientation, 'ArrowLeft'))}>↺</button>
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Tourner la boîte de ${PAS_ROT} degrés vers la droite`}
          onClick={() => onOrientation?.(orientationApresTouche(orientation, 'ArrowRight'))}>↻</button>
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Redresser la boîte de ${PAS_ROT} degrés`}
          onClick={() => onOrientation?.(orientationApresTouche(orientation, 'ArrowDown'))}>⤓</button>
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Plonger sur la boîte de ${PAS_ROT} degrés`}
          onClick={() => onOrientation?.(orientationApresTouche(orientation, 'ArrowUp'))}>⤒</button>
        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-[13px]">
          {fr(orientation.yaw)}° / {fr(orientation.pitch)}°
        </span>
      </div>

      {/* LES NOMBRES, DANS LE DOM. */}
      <div aria-live="polite" className="space-y-2">
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3" data-testid="point-courant">
          <div className="text-[13px] font-semibold text-amber-900">
            le point du curseur, au paramètre {fr(t)}
          </div>
          <div className="font-mono text-2xl font-black tabular-nums text-amber-800 mt-0.5"
            data-testid="coordonnees-courantes">
            {frVec3(M)}
          </div>
          <div className="text-xs text-amber-800 mt-1">
            {t < 0 || t > 1
              ? 'Le curseur est sorti du morceau tracé en bleu — mais il est toujours sur la droite, qui ne s’arrête nulle part.'
              : t === 0 ? 'C’est le point de départ.'
                : t === 1 ? 'C’est le point d’arrivée : on a avancé d’exactement une fois la direction.'
                  : 'Le curseur est entre les deux ancres rouges.'}
          </div>
        </div>

        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3" data-testid="lignes-parametriques">
          <div className="text-[13px] font-semibold text-emerald-900 mb-1">
            les trois lignes, et ce qu’elles donnent pour t = {fr(t)}
          </div>
          <ul className="space-y-0.5">
            {lignes.map((l) => (
              <li key={l.axe} className="font-mono text-[13px] text-emerald-800 tabular-nums">
                {l.texte}
                <span className="text-emerald-600"> → {l.axe} = {fr(M[l.axe])}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
