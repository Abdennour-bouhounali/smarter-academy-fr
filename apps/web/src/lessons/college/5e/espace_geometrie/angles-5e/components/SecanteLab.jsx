import React, { useCallback, useMemo, useState } from 'react';
import GeoScene, { Handle, Seg, dotObstacles, segObstacles } from '../../../../../common/geo5e/GeoScene';
import AngleArc, { ParallelMark } from '../../../../../common/geo5e/AngleArc';
import { clampPt, clipLine, deg, fr } from '../../../../../common/geo5e/geo5e';
import {
  droite, configuration, ecartDirections, sontParalleles, pointsDe,
} from './angles';

const W = 780;
const H = 520;

/**
 * SecanteLab — LE laboratoire de la leçon : deux droites, une sécante, et les
 * huit angles qui en découlent.
 *
 * TOUT EST CALCULÉ. Les huit mesures viennent de `configuration()`, c'est-à-dire
 * des droites RÉELLEMENT dessinées. On ne peut donc pas afficher « 62° » à côté
 * d'un arc qui n'en fait pas 62 : l'arc et le nombre sortent des mêmes points
 * (AngleArc). C'est l'invariant visuel de la famille appliqué au cas le plus
 * délicat — une figure où huit étiquettes numériques se disputent la place.
 *
 * CE QUE L'ÉLÈVE MANIPULE, ce sont les droites elles-mêmes : chacune porte une
 * poignée qu'on traîne pour la faire pivoter. Aucun bouton « + 1° ». Le
 * parallélisme s'atteint donc à la main, et l'indicateur d'écart dit à quel
 * point on s'en approche — ce qui rend le « presque parallèle » palpable.
 *
 * `montrer` sélectionne ce qui est affiché : la leçon dévoile progressivement
 * (une paire d'angles, puis les huit) au lieu de tout donner d'un coup.
 */
export default function SecanteLab({
  d1, d2, s,
  onD1, onD2, onS,
  montrer = 'aucun',        // 'aucun' | 'paire' | 'tous'
  paire = null,             // [idA, idB] — la paire mise en évidence
  couleurPaire = '#7c3aed',
  montrerEcart = true,
  montrerMarquesParalleles = true,
  verrouillerSecante = false,
  ariaLabel,
}) {
  const [drag, setDrag] = useState(null);

  const config = useMemo(() => {
    try {
      return configuration(d1, d2, s);
    } catch {
      return null;
    }
  }, [d1, d2, s]);

  const ecart = ecartDirections(d1, d2);
  const paralleles = sontParalleles(d1, d2);

  /** Faire pivoter une droite autour de son point : la poignée suit le doigt. */
  const move = useCallback((p) => {
    if (!p || !drag) return;
    const cible = drag === 'd1' ? d1 : drag === 'd2' ? d2 : s;
    const setter = drag === 'd1' ? onD1 : drag === 'd2' ? onD2 : onS;
    if (!setter) return;
    const q = clampPt(p, W, H, 8);
    const dir = deg(Math.atan2(q.y - cible.p.y, q.x - cible.p.x));
    setter(droite(cible.p, dir));
  }, [drag, d1, d2, s, onD1, onD2, onS]);

  /** Le segment visible d'une droite : clippé au cadre, jamais débordant. */
  const trace = (d) => {
    const [a, b] = pointsDe(d, 900);
    return clipLine(a, b, W, H, 10);
  };

  const [t1a, t1b] = trace(d1);
  const [t2a, t2b] = trace(d2);
  const [tsa, tsb] = trace(s);

  // La poignée d'une droite : posée sur la droite, à distance fixe du point,
  // du côté qui reste dans le cadre.
  const poigneeDe = (d, dist = 150) => {
    const t = (d.dir * Math.PI) / 180;
    const cand = [
      { x: d.p.x + Math.cos(t) * dist, y: d.p.y + Math.sin(t) * dist },
      { x: d.p.x - Math.cos(t) * dist, y: d.p.y - Math.sin(t) * dist },
    ];
    return cand.find((c) => c.x > 40 && c.x < W - 40 && c.y > 40 && c.y < H - 40) ?? cand[0];
  };

  const h1 = poigneeDe(d1);
  const h2 = poigneeDe(d2);
  const hs = poigneeDe(s, 175);

  const angles = config?.angles ?? [];
  const affiches = montrer === 'tous'
    ? angles
    : montrer === 'paire' && paire
      ? angles.filter((a) => paire.includes(a.id))
      : [];

  const labels = [];
  if (config) {
    labels.push(
      { id: 'A', text: 'A', anchor: config.A, color: '#0f172a', priority: true, size: 20 },
      { id: 'B', text: 'B', anchor: config.B, color: '#0f172a', priority: true, size: 20 },
    );
  }

  const obstacles = config
    ? [
      ...dotObstacles([config.A, config.B, h1, h2, hs], 22),
      ...segObstacles(t1a, t1b), ...segObstacles(t2a, t2b), ...segObstacles(tsa, tsb),
    ]
    : [];

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
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />

        {/* La sécante, dessous : c'est le décor commun aux deux croisements. */}
        <Seg a={tsa} b={tsb} color="#f59e0b" w={3.5} />

        <Seg a={t1a} b={t1b} color="#334155" w={4} />
        <Seg a={t2a} b={t2b} color="#334155" w={4} />

        {/* Les chevrons du parallélisme : ils n'apparaissent QUE s'il est
            réel — la figure ne peut pas annoncer un parallélisme faux. */}
        {montrerMarquesParalleles && paralleles && (
          <>
            <ParallelMark a={t1a} b={t1b} n={2} color="#0284c7" t={0.22} />
            <ParallelMark a={t2a} b={t2b} n={2} color="#0284c7" t={0.22} />
          </>
        )}

        {affiches.map((a) => (
          <AngleArc
            key={a.id}
            a={a.a} b={a.P} c={a.c}
            r={montrer === 'tous' ? 40 : 52}
            color={paire?.includes(a.id) ? couleurPaire : '#64748b'}
            width={paire?.includes(a.id) ? 4 : 3}
            labelOffset={montrer === 'tous' ? 22 : 26}
          />
        ))}

        {config && (
          <>
            <circle cx={config.A.x} cy={config.A.y} r={7} fill="#0f172a" stroke="#fff" strokeWidth={2.5} />
            <circle cx={config.B.x} cy={config.B.y} r={7} fill="#0f172a" stroke="#fff" strokeWidth={2.5} />
          </>
        )}

        {onD1 && (
          <Handle p={h1} color="#334155" r={13} dragging={drag === 'd1'}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag('d1'); }}
            label="Faire pivoter la première droite" />
        )}
        {onD2 && (
          <Handle p={h2} color="#334155" r={13} dragging={drag === 'd2'}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag('d2'); }}
            label="Faire pivoter la seconde droite" />
        )}
        {onS && !verrouillerSecante && (
          <Handle p={hs} color="#f59e0b" r={13} dragging={drag === 's'}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag('s'); }}
            label="Faire pivoter la sécante" />
        )}
      </GeoScene>

      {montrerEcart && (
        <div className={`border-t-2 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 ${
          paralleles ? 'border-sky-200 bg-sky-50' : 'border-indigo-100 bg-indigo-50/60'
        }`}>
          <span className="text-sm text-slate-600">
            Écart de direction entre les deux droites :{' '}
            <strong className={`tabular-nums ${paralleles ? 'text-sky-700' : 'text-slate-800'}`}>
              {fr(ecart, 1)}°
            </strong>
          </span>
          <span className={`text-sm font-bold ${paralleles ? 'text-sky-700' : 'text-slate-400'}`}>
            {paralleles ? '∥ les droites sont parallèles' : 'pas encore parallèles'}
          </span>
        </div>
      )}
    </div>
  );
}

export { W as SEC_W, H as SEC_H };
