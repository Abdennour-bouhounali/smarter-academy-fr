import React, { useCallback, useState } from 'react';
import GeoScene, { Dot, Handle, Poly, Seg, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import { clampPt, midpoint } from '../../../../../common/geo5e/geo5e';
import { cm, estSimple, etatQuad, quatriemeSommet } from './paral';

export const W = 760;
export const H = 520;

const NOMS = ['A', 'B', 'C', 'D'];

/* Rayon de la cible tactile, en unités de viewBox.
   MESURÉ, jamais estimé : à 375 px le SVG rend 263 px de large pour un cadre
   de 760 unités, soit une échelle de 0,346. Une cible de 68 unités de rayon
   fait donc 68 × 2 × 0,346 ≈ 47 px de diamètre — au-dessus du minimum de
   44 px du §17. (Une première valeur de 52 ne donnait que 36 px : l'échelle
   avait été devinée au lieu d'être mesurée.) */
const HIT_R = 68;

/**
 * QuadLab — LE laboratoire de la leçon : un quadrilatère articulé dont on
 * traîne les sommets.
 *
 * Ce que l'élève manipule, c'est la FIGURE ELLE-MÊME : on prend un sommet et
 * on le déplace, jamais un bouton + / − (INTERACTION_PEDAGOGY §16,
 * « on traîne l'objet, pas un stepper »). Rien ne se fige quand l'étape est
 * validée : après avoir trouvé, on continue d'explorer — c'est la règle
 * « ne jamais geler un labo après validation ».
 *
 * ACTION → CHANGE → OBSERVATION → SENS (§6ter.4)
 *   action      : traîner un sommet
 *   change      : les quatre témoins (2 parallélismes, 2 égalités) se
 *                 recalculent depuis les points RÉELLEMENT dessinés
 *   observation : les quatre lampes s'allument au même instant, et il n'y a
 *                 qu'une place pour le sommet libre
 *   sens        : le parallélisme des deux paires EMPORTE l'égalité des
 *                 côtés opposés — on ne l'a pas demandée, elle est arrivée
 *
 * Ce composant ne connaît ni étape, ni XP, ni module : il reçoit les points,
 * annonce leurs déplacements, et dessine ce que les points disent. Toute la
 * mathématique vient de paral.js — une seule source de vérité (§28).
 */
export default function QuadLab({
  pts,                         // [A, B, C, D] en unités de viewBox
  onPts,                       // (next) => void ; non fourni ⇒ figure de lecture
  mobiles = [0, 1, 2, 3],      // indices des sommets que l'élève peut prendre
  asservi = null,              // indice d'un sommet recalculé pour garder le parallélogramme
  montrerTemoins = true,       // les quatre lampes
  montrerCodages = true,       // chevrons (∥) et marques (=) sur les côtés
  montrerMesures = false,      // la table des longueurs, en cm
  montrerDiagonales = false,
  cible = null,                // { p, r } : la place à atteindre, en pointillé
  ariaLabel,
  children,                    // décor supplémentaire, dessiné SOUS la figure
}) {
  const [drag, setDrag] = useState(null);
  const etat = etatQuad(pts);
  const { temoins } = etat;

  /* Un déplacement n'est accepté que s'il laisse une figure dont la leçon
     sait parler : pas de quadrilatère croisé, pas de sommets confondus. On
     REFUSE le mouvement plutôt que d'afficher une figure aberrante — l'élève
     sent une butée, il ne voit pas un dessin faux. */
  const poser = useCallback((i, p) => {
    if (!onPts) return;
    const next = pts.map((q, k) => (k === i ? clampPt(p, W, H, 34) : q));
    if (asservi !== null && asservi !== i) {
      const [a, b, c] = [0, 1, 2].map((k) => (k === i ? next[i] : next[k]));
      // Le sommet asservi suit pour que la figure RESTE un parallélogramme :
      // c'est ce qui permet au module 3 de chercher un contre-exemple à
      // « AB = DC » sans jamais quitter la famille des parallélogrammes.
      next[asservi] = quatriemeSommet(a, b, c);
    }
    if (!estSimple(next)) return;
    onPts(next);
  }, [onPts, pts, asservi]);

  const move = useCallback((p) => {
    if (p && drag !== null) poser(drag, p);
  }, [drag, poser]);

  /** Clavier : la même manipulation, au pas de 8 unités (§27). */
  const touche = (i) => (e) => {
    const d = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -8], ArrowDown: [0, 8] }[e.key];
    if (!d) return;
    e.preventDefault();
    poser(i, { x: pts[i].x + d[0], y: pts[i].y + d[1] });
  };

  const O = midpoint(pts[0], pts[2]);

  const labels = pts.map((p, i) => ({
    id: `s${i}`, text: NOMS[i], anchor: p, color: mobiles.includes(i) ? '#7c3aed' : '#334155', priority: true,
  }));
  if (montrerDiagonales) labels.push({ id: 'O', text: 'O', anchor: O, color: '#dc2626', priority: true });

  const obstacles = [
    ...dotObstacles(pts, 18),
    ...polyObstacles(pts),
    ...(montrerDiagonales ? dotObstacles([O], 16) : []),
    ...(cible ? dotObstacles([cible.p], 20) : []),
  ];

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-white overflow-hidden">
      <GeoScene
        width={W} height={H}
        labels={labels}
        obstacles={obstacles}
        ariaLabel={ariaLabel}
        onPointerMove={move}
        onPointerUp={() => setDrag(null)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefeff" data-visual-role="decor" />
        <Grille />
        {children}

        {/* La place à atteindre — un anneau, jamais un point plein : l'élève
            doit y AMENER son sommet, pas croire qu'il y est déjà. */}
        {cible && (
          <circle
            cx={cible.p.x} cy={cible.p.y} r={cible.r ?? 16}
            fill="none" stroke="#f59e0b" strokeWidth={3} strokeDasharray="7 6"
          />
        )}

        {montrerDiagonales && (
          <>
            <Seg a={pts[0]} b={pts[2]} color="#c4b5fd" w={2.5} dash="7 6" />
            <Seg a={pts[1]} b={pts[3]} color="#c4b5fd" w={2.5} dash="7 6" />
          </>
        )}

        <Poly pts={pts} fill="#6366f1" stroke="#4338ca" fillOpacity={0.12} w={3.5} />

        {montrerCodages && <Codages pts={pts} temoins={temoins} />}

        {montrerDiagonales && <Dot p={O} color="#dc2626" r={7} />}

        {pts.map((p, i) => (mobiles.includes(i) ? (
          <Handle
            key={`h${i}`}
            p={p}
            color="#7c3aed"
            /* Cible tactile ≥ 44 px sur téléphone (§17) — voir HIT_R. */
            hitR={HIT_R}
            /* setPointerCapture : sans lui, le pointeur qui sort de la
               poignée cesse d'alimenter onPointerMove et le sommet se fige
               au premier pixel. C'est ce que fait DemiTourLab. */
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag(i); }}
            onKeyDown={touche(i)}
            dragging={drag === i}
            label={`Sommet ${NOMS[i]} — flèches du clavier pour le déplacer`}
          />
        ) : (
          <Dot key={`h${i}`} p={p} color="#334155" r={7} />
        )))}
      </GeoScene>

      {montrerTemoins && <Temoins temoins={temoins} />}
      {montrerMesures && <Mesures etat={etat} />}
    </div>
  );
}

/* ── Le décor : un quadrillage, pour que « parallèle » ait un repère ────── */

function Grille() {
  const lignes = [];
  for (let x = 40; x < W; x += 40) lignes.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#eef2ff" strokeWidth={1.5} />);
  for (let y = 40; y < H; y += 40) lignes.push(<line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#eef2ff" strokeWidth={1.5} />);
  return <g data-visual-role="decor">{lignes}</g>;
}

/* ── Les codages : ce que le cahier de l'élève porterait ───────────────── */

/**
 * Les chevrons du parallélisme et les marques de l'égalité.
 *
 * Ils n'apparaissent QUE quand la propriété est vraie sur la figure : un
 * codage est une affirmation, et une affirmation fausse dessinée sur un
 * dessin est un bug pédagogique (§28bis). Ils sont posés au milieu du côté,
 * tournés dans sa direction — jamais à un décalage fixe.
 */
function Codages({ pts, temoins }) {
  const marque = (a, b, n, forme, color) => {
    const m = midpoint(a, b);
    const t = Math.atan2(b.y - a.y, b.x - a.x);
    const deg = (t * 180) / Math.PI;
    const items = [];
    for (let k = 0; k < n; k += 1) {
      const dx = (k - (n - 1) / 2) * 9;
      items.push(forme === 'chevron'
        ? <path key={k} d={`M ${dx - 4} -7 L ${dx + 4} 0 L ${dx - 4} 7`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        : <line key={k} x1={dx} y1={-8} x2={dx} y2={8} stroke={color} strokeWidth={3} strokeLinecap="round" />);
    }
    return <g transform={`translate(${m.x} ${m.y}) rotate(${deg})`}>{items}</g>;
  };

  const [A, B, C, D] = pts;
  return (
    <g data-visual-role="decor">
      {temoins.parAbDc.ok && (
        <>
          {marque(A, B, 1, 'chevron', '#0ea5e9')}
          {marque(D, C, 1, 'chevron', '#0ea5e9')}
        </>
      )}
      {temoins.parAdBc.ok && (
        <>
          {marque(A, D, 2, 'chevron', '#0ea5e9')}
          {marque(B, C, 2, 'chevron', '#0ea5e9')}
        </>
      )}
      {temoins.egAbDc.ok && (
        <>
          {marque(A, B, 1, 'tick', '#059669')}
          {marque(D, C, 1, 'tick', '#059669')}
        </>
      )}
      {temoins.egAdBc.ok && (
        <>
          {marque(A, D, 2, 'tick', '#059669')}
          {marque(B, C, 2, 'tick', '#059669')}
        </>
      )}
    </g>
  );
}

/* ── Les lampes ────────────────────────────────────────────────────────── */

/**
 * Les quatre témoins, en DOM et non en SVG.
 *
 * Une rangée DOM ne peut pas entrer en collision avec la figure, quel que
 * soit l'état atteint — c'est le device recommandé au §6ter.5 (« prefer DOM
 * tracks to SVG text »). Une lampe éteinte n'écrit jamais « faux » : elle
 * annonce ce qu'il reste à faire, chiffré.
 */
function Temoins({ temoins }) {
  const ordre = ['parAbDc', 'parAdBc', 'egAbDc', 'egAdBc'];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 border-t-2 border-indigo-100">
      {ordre.map((k) => {
        const t = temoins[k];
        const par = k.startsWith('par');
        return (
          <div
            key={k}
            className={`rounded-xl border-2 px-2.5 py-2 text-center transition ${
              t.ok
                ? par ? 'border-sky-300 bg-sky-50' : 'border-emerald-300 bg-emerald-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span
                aria-hidden="true"
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  t.ok ? (par ? 'bg-sky-500' : 'bg-emerald-500') : 'bg-slate-300'
                }`}
              />
              <span className={`font-mono text-sm font-black ${
                t.ok ? (par ? 'text-sky-700' : 'text-emerald-700') : 'text-slate-400'
              }`}
              >
                {t.label}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {t.ok
                ? <span className="font-semibold">{par ? 'parallèles' : 'égaux'}</span>
                : par
                  ? `il s’en faut de ${Math.round(t.ecart)}°`
                  : `il s’en faut de ${cm(t.ecart)} cm`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── La table des mesures ──────────────────────────────────────────────── */

/**
 * Les quatre longueurs, mesurées sur la figure dessinée.
 *
 * Elle n'écrit JAMAIS « égal » : elle affiche les deux nombres et laisse
 * l'élève lire l'égalité (§14 — le symbole décrit ce qu'on vient de voir).
 */
function Mesures({ etat }) {
  const { AB, BC, CD, DA } = etat.longueurs;
  const paires = [
    { titre: 'Les côtés [AB] et [DC]', a: ['AB', AB], b: ['DC', CD] },
    { titre: 'Les côtés [AD] et [BC]', a: ['AD', DA], b: ['BC', BC] },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-2 p-3 bg-white border-t-2 border-indigo-100">
      {paires.map((p) => (
        <div key={p.titre} className="rounded-xl border-2 border-slate-200 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 text-center">{p.titre}</div>
          <div className="mt-1.5 flex items-center justify-center gap-4">
            {[p.a, p.b].map(([nom, val]) => (
              <div key={nom} className="text-center">
                <div className="font-mono text-xs text-slate-500">{nom}</div>
                <div className="font-mono text-lg font-black tabular-nums text-slate-800">{cm(val)}<span className="text-xs font-semibold text-slate-500"> cm</span></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
