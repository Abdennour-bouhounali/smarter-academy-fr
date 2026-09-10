import React, { useRef } from 'react';
import {
  TAU, onde, labelPi, fr, ECARTS, MOTIFS, MOTIFS_LABELS,
  sommetDe, reglageDepuisSommet,
} from './trigFnUtils';

/**
 * OndeReader — le laboratoire de LECTURE d'une courbe qui se répète (module 6).
 *
 * Activity               une vague est tracée ; l'élève règle DEUX cliquets —
 *                        l'écart maximal à l'axe et la longueur du motif — pour
 *                        superposer SA vague à celle qui est donnée.
 * Mathematical objective les deux nombres qui décrivent une courbe périodique
 *                        se lisent séparément : la hauteur à la verticale, la
 *                        longueur du motif à l'horizontale.
 * Student action         ATTRAPER le SOMMET de sa vague et le déplacer. Le
 *                        geste est à deux dimensions, et c'est exactement le
 *                        propos : monter le sommet augmente l'écart maximal,
 *                        l'éloigner vers la droite allonge le motif (le sommet
 *                        d'une onde de motif P est en P/4). Les deux réglages
 *                        se découvrent INDÉPENDANTS par le geste même.
 *                        Les cliquets ± et le clavier restent des chemins
 *                        complets, en affordance secondaire.
 *                        Le lâcher est AIMANTÉ sur les réglages permis : sans
 *                        cela, la courbe de l'élève ne pourrait jamais
 *                        coïncider exactement avec la cible et la consigne
 *                        serait infaisable (test).
 * Controlled variables   A (écart maximal) et P (longueur du motif).
 * Visual consequence     la vague de l'élève s'étire ou s'aplatit ; quand les
 *                        deux réglages sont justes, elle se confond avec la
 *                        vague donnée.
 * Expected observation   « on peut changer la hauteur sans changer le rythme,
 *                        et le rythme sans changer la hauteur ».
 * Misconception targeted mesurer d'un sommet au CREUX suivant (une demi-
 *                        longueur) ; croire que la hauteur se déduit du motif.
 *
 * POURQUOI UN REPÈRE PROPRE, ET NON `CoordPlane`. L'axe des abscisses est
 * gradué en multiples de π, et `CoordPlane.formatTick` écrit les graduations
 * en DÉCIMAL : l'axe afficherait « 3,14 » et « 6,28 » là où toute la leçon
 * écrit « π » et « 2π ». Le repère et le texte se contrediraient. Modifier
 * `CoordPlane` pour accepter des étiquettes sur mesure serait toucher un
 * composant partagé (signalé dans le rapport) : la leçon dessine donc son
 * propre axe, comme le fait déjà le dérouloir.
 *
 * JAMAIS GELÉ : l'élève doit pouvoir continuer à régler après avoir trouvé —
 * c'est même à ce moment-là qu'il voit chaque réglage agir séparément.
 */
const DONNEE = '#7c3aed';
const MIENNE = '#0284c7';
const GRIS = '#94a3b8';

/**
 * Le cadre du repère, en pixels.
 *
 * DÉFAUT ATTRAPÉ PAR LE TEST, et c'était une consigne INFAISABLE. Le cadre
 * allait d'abord de −2π à 4π. Or la lecture L2 a un motif de 4π : ses sommets
 * tombent en π et en 5π, et le second était HORS CADRE. On demandait donc à
 * l'élève de mesurer d'un sommet au sommet suivant alors que le suivant
 * n'était pas dessiné — la seule mesure possible était la moitié du motif,
 * c'est-à-dire précisément l'erreur que le module veut corriger.
 * Le cadre va donc de −2π à 6π : le côté négatif reste visible (la parité s'y
 * lit) et tout motif réglable y tient d'un sommet au sommet suivant (test).
 */
const XMIN = -TAU;
const XMAX = 6 * Math.PI;
const YMAX = 3.4;
const PX_X = 15;                      // pixels par radian
const PX_Y = 24;                      // pixels par unité d'ordonnée
const MARGE = { g: 30, d: 14, h: 12, b: 26 };
const W = MARGE.g + MARGE.d + (XMAX - XMIN) * PX_X;
const H = MARGE.h + MARGE.b + 2 * YMAX * PX_Y;
const toX = (x) => MARGE.g + (x - XMIN) * PX_X;
const toY = (y) => MARGE.h + (YMAX - y) * PX_Y;

/** Largeur d'une étiquette, mesurée caractère par caractère — jamais supposée. */
const largeurTexte = (s) =>
  [...String(s)].reduce((n, c) => n + (c === '−' || c === '-' ? 5.5 : c === ',' || c === '.' ? 3 : 6), 0);

/**
 * La GOUTTIÈRE des ordonnées : la bande de gauche où vivent les étiquettes
 * « −3 … 3 », posées en `textAnchor="end"` à `MARGE.g − 6`. Aucune étiquette
 * d'abscisse ne doit y entrer.
 */
const ETIQ_ORD_MAX = Math.max(...[-3, -2, -1, 1, 2, 3].map((y) => largeurTexte(fr(y, 0))));
const GOUTTIERE_FIN = MARGE.g - 6;                    // le bord droit des étiquettes d'ordonnée
const GOUTTIERE_DEBUT = GOUTTIERE_FIN - ETIQ_ORD_MAX; // leur bord gauche

/**
 * Les graduations en π : un multiple de π, comme sur le dérouloir.
 *
 * DÉFAUT ATTRAPÉ AU NAVIGATEUR (layoutAudit : « chevauchement −1 ↔ −2π »).
 * En élargissant le cadre à [−2π ; 6π] pour rendre le second sommet
 * atteignable, la graduation −2π s'est retrouvée posée EXACTEMENT sur le bord
 * gauche du cadre — c'est-à-dire dans la gouttière où s'écrivent les
 * étiquettes d'ordonnée. Centrée sur x = MARGE.g, son étiquette mordait sur
 * le « −1 » qui finit à MARGE.g − 6 : deux nombres se touchaient au coin bas
 * gauche, dès le chargement.
 *
 * La parade est STRUCTURELLE et dérivée, pas un décalage à la main : une
 * graduation dont l'étiquette entrerait dans la gouttière — ou sortirait du
 * cadre à droite — garde son TRAIT mais perd son TEXTE. Le repère reste
 * gradué, la lecture ne perd rien (les multiples de π restent marqués), et
 * aucun couple d'étiquettes ne peut plus se chevaucher.
 * `etiquetee` est calculé ici, une seule fois, et le test le balaye.
 */
const TICKS = (() => {
  const out = [];
  for (let k = Math.ceil(XMIN / Math.PI - 1e-9); k <= Math.floor(XMAX / Math.PI + 1e-9); k += 1) {
    const t = k * Math.PI;
    const x = toX(t);
    const label = labelPi(t);
    const demi = largeurTexte(label) / 2;
    // L'étiquette est écrite seulement si elle tient ENTIÈREMENT à droite de la
    // gouttière des ordonnées et à l'intérieur du cadre.
    const etiquetee = label !== '0' && x - demi > GOUTTIERE_FIN + 2 && x + demi < W - 2;
    out.push({ t, x, label, etiquetee, demi });
  }
  return out;
})();

/** Le chemin d'une onde, échantillonné assez fin pour que les sommets soient nets. */
function chemin(f) {
  const n = 480;
  let d = '';
  for (let i = 0; i <= n; i += 1) {
    const x = XMIN + ((XMAX - XMIN) * i) / n;
    d += `${i === 0 ? 'M' : 'L'} ${toX(x).toFixed(2)} ${toY(f(x)).toFixed(2)} `;
  }
  return d;
}

export default function OndeReader({
  cible,                 // { A, P }
  A, P,
  onChangeA, onChangeP,
  montreSienne = true,
  disabled = false,
  label = 'Lire une courbe qui se répète',
}) {
  const svgRef = useRef(null);
  const fCible = onde(cible.A, cible.P);
  const fMienne = onde(A, P);

  const iA = ECARTS.indexOf(A);
  const iP = MOTIFS.findIndex((m) => Math.abs(m - P) < 1e-12);

  // La poignée : le sommet de MA vague, en P/4, à la hauteur A.
  const sx = toX(sommetDe(P));
  const sy = toY(A);

  const bougeable = !disabled && montreSienne;

  /** Pointeur → réglage (A ; P), aimanté par le modèle pur (testé). */
  const depuisPointeur = (e) => {
    const svg = svgRef.current;
    if (!svg || !bougeable) return;
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const vx = ((e.clientX - r.left) / r.width) * W;
    const vy = ((e.clientY - r.top) / r.height) * H;
    // Retour aux coordonnées mathématiques.
    const x = (vx - MARGE.g) / PX_X + XMIN;
    const y = YMAX - (vy - MARGE.h) / PX_Y;
    const next = reglageDepuisSommet(x, y);
    if (next.A !== A) onChangeA?.(next.A);
    if (Math.abs(next.P - P) > 1e-12) onChangeP?.(next.P);
  };

  /** Le clavier : un chemin complet, sur les deux réglages. */
  const onKey = (e) => {
    if (!bougeable) return;
    const dA = (d) => { const i = ECARTS.indexOf(A) + d; if (i >= 0 && i < ECARTS.length) onChangeA?.(ECARTS[i]); };
    const dP = (d) => { const i = iP + d; if (i >= 0 && i < MOTIFS.length) onChangeP?.(MOTIFS[i]); };
    if (e.key === 'ArrowUp') { e.preventDefault(); dA(1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); dA(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); dP(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); dP(-1); }
  };

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const juste = Math.abs(A - cible.A) < 1e-9 && Math.abs(P - cible.P) < 1e-9;

  return (
    <div className="space-y-3" role="group" aria-label={label}>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2 overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          height={H}
          // Même parade que le dérouloir : aucun `width` en dur, qui imposerait
          // 421 px de mise en page à un <main> de 375. Le viewBox dimensionne,
          // `minWidth` interdit la compression (l'échelle ne doit jamais mentir),
          // et le conteneur `overflow-x-auto` fait défiler dans SA boîte.
          style={{ minWidth: W, height: H }}
          className={`select-none touch-none block ${bougeable ? 'cursor-grab' : ''}`}
          role={bougeable ? 'group' : 'img'}
          onPointerDown={(e) => {
            if (!bougeable) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            depuisPointeur(e);
          }}
          onPointerMove={(e) => { if (bougeable && e.buttons === 1) depuisPointeur(e); }}
          aria-label={
            `Une courbe qui se répète. Ton réglage : écart maximal ${fr(A, 1)}, ` +
            `longueur du motif ${MOTIFS_LABELS[iP] ?? fr(P)}.` +
            (juste ? ' Les deux courbes se confondent.' : '') +
            (bougeable ? ' Attrape le sommet de ta vague pour la déformer.' : '')
          }
        >
          {/* les graduations horizontales entières, discrètes */}
          {[-3, -2, -1, 1, 2, 3].map((y) => (
            <line key={y} x1={MARGE.g} y1={toY(y)} x2={W - MARGE.d} y2={toY(y)} stroke="#f1f5f9" strokeWidth="1" />
          ))}
          {[-3, -2, -1, 1, 2, 3].map((y) => (
            <text key={`l${y}`} x={MARGE.g - 6} y={toY(y) + 3.5} textAnchor="end" fontSize="10" fill="#94a3b8" className="font-mono">
              {fr(y, 0)}
            </text>
          ))}

          <line x1={MARGE.g} y1={toY(0)} x2={W - MARGE.d} y2={toY(0)} stroke={GRIS} strokeWidth="1.5" />
          <line x1={toX(0)} y1={MARGE.h} x2={toX(0)} y2={H - MARGE.b} stroke={GRIS} strokeWidth="1.5" />

          {/* Graduations en π. Le pas de π laisse 47 px entre deux étiquettes :
              « −2π » en mesure 18, aucune ne chevauche sa voisine (test). */}
          {TICKS.map((t) => (
            <g key={t.t}>
              <line x1={t.x} y1={toY(0) - 5} x2={t.x} y2={toY(0) + 5} stroke={GRIS} strokeWidth="1.5" />
              {/* `etiquetee` est DÉRIVÉ (voir TICKS) : une graduation trop
                  proche de la gouttière des ordonnées garde son trait et perd
                  son texte, plutôt que de chevaucher un nombre. */}
              {t.etiquetee && (
                <text x={t.x} y={toY(0) + 18} textAnchor="middle" fontSize="10" fill="#64748b" className="font-mono">
                  {t.label}
                </text>
              )}
            </g>
          ))}

          <path d={chemin(fCible)} fill="none" stroke={DONNEE} strokeWidth="2.5" strokeLinecap="round" />
          {montreSienne && (
            <path d={chemin(fMienne)} fill="none" stroke={MIENNE} strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
          )}

          {/* LA POIGNÉE : le sommet de ma vague. On l'attrape et on la déforme.
              Une cible tactile généreuse et invisible l'entoure. */}
          {montreSienne && (
            <g>
              <circle cx={sx} cy={sy} r="18" fill="transparent" />
              <circle
                cx={sx} cy={sy} r="7" fill={MIENNE} stroke="#fff" strokeWidth="2.5"
                tabIndex={bougeable ? 0 : -1}
                role={bougeable ? 'slider' : undefined}
                aria-label={bougeable ? 'Sommet de ta vague : monte-le pour l’écart maximal, éloigne-le pour la longueur du motif' : undefined}
                aria-valuetext={`écart maximal ${fr(A, 1)}, motif ${MOTIFS_LABELS[iP] ?? labelPi(P)}`}
                onKeyDown={onKey}
                className={bougeable ? 'cursor-grab [outline:none] focus-visible:[stroke:#2563eb] focus-visible:[stroke-width:4]' : ''}
              />
            </g>
          )}
        </svg>
      </div>

      {/* La LÉGENDE en DOM : deux courbes qui se confondent ne peuvent pas
          porter leur nom dans le SVG sans se chevaucher. */}
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-4 h-1 rounded" style={{ background: DONNEE }} aria-hidden="true" />
          la courbe donnée
        </span>
        {montreSienne && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-1 rounded" style={{ background: MIENNE }} aria-hidden="true" />
            la tienne (pointillés) — <strong>attrape son sommet</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-xl border border-slate-200 bg-white p-2">
          <div className="text-[13px] text-slate-500 mb-1 text-center">écart maximal à l’axe</div>
          <div className="flex items-center justify-center gap-2">
            <button type="button" className={btn} onClick={() => onChangeA?.(ECARTS[iA - 1])} disabled={disabled || iA <= 0} aria-label="Diminuer l’écart maximal">−</button>
            <span className="px-3 py-1.5 rounded-lg bg-sky-900 text-white font-mono font-bold tabular-nums text-sm" data-testid="reglage-a">{fr(A, 1)}</span>
            <button type="button" className={btn} onClick={() => onChangeA?.(ECARTS[iA + 1])} disabled={disabled || iA >= ECARTS.length - 1} aria-label="Augmenter l’écart maximal">+</button>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2">
          <div className="text-[13px] text-slate-500 mb-1 text-center">longueur du motif</div>
          <div className="flex items-center justify-center gap-2">
            <button type="button" className={btn} onClick={() => onChangeP?.(MOTIFS[iP - 1])} disabled={disabled || iP <= 0} aria-label="Raccourcir le motif">−</button>
            <span className="px-3 py-1.5 rounded-lg bg-sky-900 text-white font-mono font-bold tabular-nums text-sm" data-testid="reglage-p">{MOTIFS_LABELS[iP] ?? labelPi(P)}</span>
            <button type="button" className={btn} onClick={() => onChangeP?.(MOTIFS[iP + 1])} disabled={disabled || iP >= MOTIFS.length - 1} aria-label="Allonger le motif">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** La géométrie du repère, exportée pour que le test la balaye. */
export const GEOM_ONDE = {
  XMIN, XMAX, YMAX, W, H, MARGE, toX, toY, TICKS,
  largeurTexte, GOUTTIERE_DEBUT, GOUTTIERE_FIN,
  /** Les ordonnées effectivement écrites dans la gouttière. */
  ORDONNEES: [-3, -2, -1, 1, 2, 3],
};
