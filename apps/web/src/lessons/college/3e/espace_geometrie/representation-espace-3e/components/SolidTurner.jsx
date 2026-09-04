import React from 'react';
import {
  rotateSolid, projectCavaliere, visibleEdges, visibleVertices, countsOf,
  vertexName, edgeName,
} from './espaceUtils';

/**
 * SolidTurner — l'interaction signature de la leçon.
 *
 * ACTION            l'élève tourne le solide (deux réglages : yaw et pitch).
 * CHANGEMENT        le dessin change, et surtout : une arête pointillée
 *                   devient pleine, un sommet caché réapparaît.
 * OBSERVATION       ce qui est caché dépend du POINT DE VUE, pas de l'objet.
 * SENS MATHÉMATIQUE un dessin plat n'est pas le solide : c'est une projection,
 *                   et elle perd de l'information (les arêtes cachées).
 * FORMALISATION     la convention du pointillé, et le fait que les comptes
 *                   F/A/S ne changent JAMAIS quand on tourne.
 *
 * RÈGLE ABSOLUE : la visibilité est CALCULÉE par `visibleEdges` (une arête est
 * cachée quand toutes ses faces sont tournées de l'autre côté). Aucun appelant
 * ne peut demander « dessine cette arête en pointillé » : le composant ne
 * reçoit que le solide et l'orientation.
 *
 * Purement visuel (role="img") : les réglages sont des boutons DOM à côté, ce
 * qui rend l'interaction tactile et clavier par construction.
 */
const BOX = { w: 300, h: 260 };
const CENTER = { x: 150, y: 130 };

export default function SolidTurner({
  solid,
  yaw = 0,
  pitch = 0,
  onYawChange,
  onPitchChange,
  showHidden = true,
  showNames = false,
  highlight = null,        // 'faces' | 'aretes' | 'sommets' | null
  selectedEdge = null,     // [i, j] — mis en évidence pour une question
  disabled = false,
  ariaLabel,
}) {
  const turned = rotateSolid(solid, { yaw, pitch });
  const { visible, hidden } = visibleEdges(turned);
  const seenVertices = visibleVertices(turned);
  const counts = countsOf(solid);

  const project = (p) => {
    const q = projectCavaliere(p);
    return { x: CENTER.x + q.x, y: CENTER.y + q.y };
  };
  const P = turned.vertices.map(project);

  /**
   * PLACEMENT DES ÉTIQUETTES — sûr pour TOUTE orientation.
   *
   * Un décalage fixe (x + 9, y − 7) fonctionne pour la vue par défaut mais fait
   * se chevaucher les noms de sommets dès qu'on tourne : sur la grille des
   * rotations accessibles, 16 couples d'étiquettes se superposaient (par
   * exemple G et D, ou A et H). Deux règles corrigent cela :
   *
   *  1. chaque étiquette est poussée VERS L'EXTÉRIEUR, le long de la direction
   *     qui va du centre du dessin au sommet — les sommets s'écartant les uns
   *     des autres, leurs étiquettes s'écartent aussi ;
   *  2. il reste des cas où deux sommets se projettent presque au même endroit
   *     (le solide vu presque de face) : on écarte alors les étiquettes encore
   *     en conflit, l'une vers le haut, l'autre vers le bas.
   *
   * Le résultat est vérifié par le test e2e « aucune étiquette ne se
   * chevauche », balayé sur toute la plage de rotation.
   */
  const labelPositions = (() => {
    const cx = P.reduce((s2, q) => s2 + q.x, 0) / (P.length || 1);
    const cy = P.reduce((s2, q) => s2 + q.y, 0) / (P.length || 1);
    const OUT = 15;
    const pos = P.map((q) => {
      const dx = q.x - cx;
      const dy = q.y - cy;
      const n = Math.hypot(dx, dy) || 1;
      return { x: q.x + (dx / n) * OUT, y: q.y + (dy / n) * OUT + 4 };
    });
    // Désencombrement : deux étiquettes trop proches sont écartées verticalement.
    const MIN_X = 12;
    const MIN_Y = 13;
    for (let pass = 0; pass < 3; pass += 1) {
      for (let i = 0; i < pos.length; i += 1) {
        for (let j = i + 1; j < pos.length; j += 1) {
          const dx = Math.abs(pos[i].x - pos[j].x);
          const dy = Math.abs(pos[i].y - pos[j].y);
          if (dx < MIN_X && dy < MIN_Y) {
            const push = (MIN_Y - dy) / 2 + 1;
            const up = pos[i].y <= pos[j].y ? i : j;
            const down = up === i ? j : i;
            pos[up].y -= push;
            pos[down].y += push;
          }
        }
      }
    }
    return pos;
  })();

  const sameEdge = (e) => selectedEdge
    && ((e[0] === selectedEdge[0] && e[1] === selectedEdge[1])
      || (e[0] === selectedEdge[1] && e[1] === selectedEdge[0]));

  const edgeLine = (e, isHidden) => {
    const [i, j] = e;
    const on = sameEdge(e);
    return (
      <line
        key={`${i}-${j}-${isHidden ? 'h' : 'v'}`}
        x1={P[i].x} y1={P[i].y} x2={P[j].x} y2={P[j].y}
        stroke={on ? '#e11d48' : (highlight === 'aretes' ? '#7c3aed' : '#0f172a')}
        strokeWidth={on ? 4 : (highlight === 'aretes' ? 3 : 2.2)}
        strokeDasharray={isHidden ? '6 4' : undefined}
        opacity={isHidden ? (showHidden ? 0.45 : 0) : 1}
        strokeLinecap="round"
      />
    );
  };

  /* Les faces visibles, peintes pour donner du volume. */
  const facePaths = turned.faces.map((f, idx) => {
    const pts = f.map((i) => `${P[i].x},${P[i].y}`).join(' ');
    const visibleFace = f.every((i) => seenVertices.has(i));
    if (!visibleFace) return null;
    return (
      <polygon key={`f${idx}`} points={pts}
        fill={highlight === 'faces' ? '#ddd6fe' : '#eef2ff'}
        fillOpacity={highlight === 'faces' ? 0.9 : 0.7}
        stroke={highlight === 'faces' ? '#7c3aed' : 'none'}
        strokeWidth="1.5" />
    );
  });

  const Stepper = ({ label, value, onMinus, onPlus }) => (
    <div className="flex-1 min-w-[150px] rounded-xl border-2 border-slate-200 bg-white p-2">
      <p className="text-xs font-semibold text-slate-600 mb-1">{label}</p>
      <div className="flex items-center gap-1 justify-center">
        <button type="button" onClick={onMinus} disabled={disabled}
          aria-label={`Tourner ${label} vers la gauche`}
          className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">−</button>
        <span className="w-16 text-center text-lg font-mono font-bold tabular-nums">
          {String(value).replace('-', '−')}°
        </span>
        <button type="button" onClick={onPlus} disabled={disabled}
          aria-label={`Tourner ${label} vers la droite`}
          className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">+</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <svg
        viewBox={(() => {
          // Le cadre englobe les sommets ET leurs étiquettes déplacées : sans
          // cela, une étiquette poussée vers l'extérieur pourrait sortir.
          const all = [...P, ...(showNames ? labelPositions : [])];
          const pad = 16;
          const x0 = Math.min(0, ...all.map((q) => q.x - pad));
          const x1 = Math.max(BOX.w, ...all.map((q) => q.x + pad));
          const y0 = Math.min(0, ...all.map((q) => q.y - pad));
          const y1 = Math.max(BOX.h, ...all.map((q) => q.y + pad));
          return `${x0} ${y0} ${x1 - x0} ${y1 - y0}`;
        })()}
        className="w-full max-w-[340px] mx-auto bg-white rounded-xl border-2 border-slate-200"
        role="img"
        aria-label={ariaLabel ?? `${solid.nom} vu en perspective : ${visible.length} arêtes visibles, ${hidden.length} cachées`}
      >
        <g style={{ pointerEvents: 'none' }}>
          {facePaths}
          {hidden.map((e) => edgeLine(e, true))}
          {visible.map((e) => edgeLine(e, false))}

          {(highlight === 'sommets' || showNames) && P.map((p, i) => (
            <g key={`v${i}`}>
              <circle cx={p.x} cy={p.y} r={highlight === 'sommets' ? 5.5 : 4}
                fill={seenVertices.has(i) ? '#e11d48' : '#94a3b8'}
                stroke="#fff" strokeWidth="1.5"
                opacity={seenVertices.has(i) ? 1 : 0.6} />
              {showNames && (
                <text
                  x={labelPositions[i].x} y={labelPositions[i].y}
                  textAnchor="middle" fontSize="12" fontWeight="700"
                  className="font-space" fill="#0f172a"
                  stroke="#ffffff" strokeWidth="3" paintOrder="stroke"
                >
                  {vertexName(solid, i)}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>

      {(onYawChange || onPitchChange) && (
        <div className="flex gap-2 flex-wrap">
          {onYawChange && (
            <Stepper label="Rotation horizontale" value={yaw}
              onMinus={() => onYawChange(yaw - 15)} onPlus={() => onYawChange(yaw + 15)} />
          )}
          {onPitchChange && (
            <Stepper label="Inclinaison" value={pitch}
              onMinus={() => onPitchChange(Math.max(-60, pitch - 15))}
              onPlus={() => onPitchChange(Math.min(60, pitch + 15))} />
          )}
        </div>
      )}

      {/* Les comptes viennent du MODÈLE, jamais du dessin. */}
      <div className="grid grid-cols-3 gap-2 text-center" aria-live="polite">
        {[
          { l: 'faces', v: counts.faces },
          { l: 'arêtes', v: counts.aretes },
          { l: 'sommets', v: counts.sommets },
        ].map(({ l, v }) => (
          <div key={l} className={`rounded-xl border-2 p-2 ${
            highlight === l ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-slate-50'
          }`}>
            <p className="text-xs text-slate-600">{l}</p>
            <p className="text-lg font-mono font-bold tabular-nums text-slate-800">{v}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-slate-600" aria-live="polite">
        <strong className="text-slate-800">{hidden.length}</strong> arête
        {hidden.length > 1 ? 's' : ''} cachée{hidden.length > 1 ? 's' : ''} sous cet angle
        {hidden.length > 0 && ' — en pointillé'}
      </p>
    </div>
  );
}
