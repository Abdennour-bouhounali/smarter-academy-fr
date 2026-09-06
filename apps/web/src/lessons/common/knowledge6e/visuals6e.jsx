import React from 'react';

/* ─────────────────────────────────────────────────────────────────────────
   MINI-VISUELS 6e pour la carte des connaissances
   ─────────────────────────────────────────────────────────────────────────
   Les visuels de `common/knowledge/knowledgeVisuals.jsx` servent le lycée :
   repère, graphe, triangle rectangle. Les connaissances de 6e parlent d'un
   autre monde — des parts, des barres, des graduations, des unités — et ces
   figures-là n'existaient nulle part.

   Mêmes règles que leurs aînées : SVG autonome, sans KaTeX ni CoordPlane,
   `aria-hidden` (le texte de l'item porte le sens), et un rendu identique à
   l'écran et à l'impression. Elles sont petites et posées à la main : la
   carte n'a pas besoin d'un moteur de placement.
   ───────────────────────────────────────────────────────────────────────── */

const INK = '#334155';
const MUTED = '#94a3b8';
const GRID = '#e2e8f0';

/**
 * PartsBar — une unité coupée en `den` parts égales, dont `num` sont prises.
 * La figure de base de tout ce qui est fraction : elle montre la découpe
 * (le dénominateur) ET la prise (le numérateur) d'un seul coup d'œil.
 */
export function PartsBar({
  den = 4,
  num = 3,
  width = 210,
  height = 46,
  color = '#8b5cf6',
  showUnit = true,
  className = '',
}) {
  const pad = 1;
  const w = width - 2 * pad;
  const barH = showUnit ? height - 16 : height - 2;
  const step = w / den;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true" className={`select-none ${className}`}>
      {Array.from({ length: den }, (_, i) => (
        <rect
          key={i}
          x={pad + i * step} y={pad}
          width={step} height={barH}
          fill={i < num ? color : '#fff'}
          fillOpacity={i < num ? 0.85 : 1}
          stroke={INK} strokeWidth="1.5"
        />
      ))}
      {showUnit && (
        <>
          <line x1={pad} y1={height - 8} x2={pad + w} y2={height - 8} stroke={MUTED} strokeWidth="1" />
          <line x1={pad} y1={height - 11} x2={pad} y2={height - 5} stroke={MUTED} strokeWidth="1" />
          <line x1={pad + w} y1={height - 11} x2={pad + w} y2={height - 5} stroke={MUTED} strokeWidth="1" />
          <text x={pad + w / 2} y={height - 1} textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="ui-monospace, monospace">
            1 unité
          </text>
        </>
      )}
    </svg>
  );
}

/**
 * PartsCircle — la même idée en disque : c'est la représentation que l'élève
 * a rencontrée en premier (la pizza), et la reconnaître dans les deux formes
 * fait partie de la connaissance.
 */
export function PartsCircle({
  den = 4,
  num = 1,
  size = 84,
  color = '#8b5cf6',
  className = '',
}) {
  const r = size / 2 - 3;
  const c = size / 2;
  const sector = (i) => {
    const a0 = (i / den) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / den) * 2 * Math.PI - Math.PI / 2;
    const x0 = c + r * Math.cos(a0), y0 = c + r * Math.sin(a0);
    const x1 = c + r * Math.cos(a1), y1 = c + r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${c} ${c} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true" className={`select-none ${className}`}>
      {den === 1 ? (
        <circle cx={c} cy={c} r={r} fill={num >= 1 ? color : '#fff'} fillOpacity={num >= 1 ? 0.85 : 1} stroke={INK} strokeWidth="1.5" />
      ) : (
        Array.from({ length: den }, (_, i) => (
          <path key={i} d={sector(i)} fill={i < num ? color : '#fff'} fillOpacity={i < num ? 0.85 : 1} stroke={INK} strokeWidth="1.5" />
        ))
      )}
    </svg>
  );
}

/**
 * MiniNumberLine — une demi-droite graduée avec des marques nommées.
 * `ticks` : [{ at, label?, strong? }] en coordonnées mathématiques.
 * `marks` : [{ at, label?, color? }] — les points posés dessus.
 */
export function MiniNumberLine({
  min = 0,
  max = 2,
  ticks = [],
  marks = [],
  width = 230,
  height = 56,
  className = '',
}) {
  const padL = 14, padR = 14;
  const w = width - padL - padR;
  const y = 26;
  const toX = (v) => padL + ((v - min) / (max - min)) * w;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true" className={`select-none overflow-visible ${className}`}>
      <defs>
        <marker id="mnl-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={INK} />
        </marker>
      </defs>
      <line x1={padL} y1={y} x2={width - 4} y2={y} stroke={INK} strokeWidth="1.5" markerEnd="url(#mnl-arrow)" />

      {ticks.map((t, i) => (
        <g key={`t${i}`}>
          <line
            x1={toX(t.at)} y1={y - (t.strong ? 7 : 4)}
            x2={toX(t.at)} y2={y + (t.strong ? 7 : 4)}
            stroke={t.strong ? INK : MUTED} strokeWidth={t.strong ? 1.5 : 1}
          />
          {t.label && (
            <text x={toX(t.at)} y={y + 19} textAnchor="middle" fontSize="9.5" fill={MUTED} fontFamily="ui-monospace, monospace">
              {t.label}
            </text>
          )}
        </g>
      ))}

      {marks.map((m, i) => (
        <g key={`m${i}`}>
          <circle cx={toX(m.at)} cy={y} r="4.5" fill={m.color ?? '#e11d48'} stroke="#fff" strokeWidth="1.5" />
          {m.label && (
            <text x={toX(m.at)} y={y - 11} textAnchor="middle" fontSize="10" fontWeight="700" fill={m.color ?? '#e11d48'} fontFamily="ui-monospace, monospace">
              {m.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

/**
 * UnitLadder — l'escalier des unités (km … mm, kL … mL, kg … mg).
 * `steps` : les symboles, du plus grand au plus petit. `highlight` : les
 * index à mettre en avant. La figure dit ce qu'aucune phrase ne dit aussi
 * vite : chaque marche vaut ×10, et sauter n marches vaut ×10ⁿ.
 */
export function UnitLadder({
  steps = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'],
  highlight = [],
  width = 250,
  height = 58,
  className = '',
}) {
  const n = steps.length;
  const cellW = width / n;
  const y = 14, h = 22;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true" className={`select-none ${className}`}>
      {steps.map((s, i) => {
        const on = highlight.includes(i);
        return (
          <g key={s}>
            <rect
              x={i * cellW} y={y} width={cellW} height={h}
              fill={on ? '#dbeafe' : '#fff'} stroke={on ? '#3b82f6' : GRID} strokeWidth={on ? 1.6 : 1}
            />
            <text
              x={i * cellW + cellW / 2} y={y + h / 2 + 4}
              textAnchor="middle" fontSize="10.5" fontWeight={on ? '800' : '600'}
              fill={on ? '#1d4ed8' : INK} fontFamily="ui-monospace, monospace"
            >
              {s}
            </text>
          </g>
        );
      })}
      {steps.slice(0, -1).map((_, i) => (
        <text key={`x${i}`} x={(i + 1) * cellW} y={height - 3} textAnchor="middle" fontSize="8" fill={MUTED}>
          ×10
        </text>
      ))}
    </svg>
  );
}

/**
 * PlaceValue — le tableau de numération, avec un chiffre mis en avant.
 * `columns` : [{ label, digit }]. `comma` : l'index APRÈS lequel la virgule
 * se place (omis pour un entier).
 */
export function PlaceValue({
  columns = [],
  comma = null,
  highlight = null,
  width = 250,
  height = 56,
  className = '',
}) {
  const n = columns.length;
  const cellW = width / n;
  const yLab = 12, yBox = 18, h = 24;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true" className={`select-none ${className}`}>
      {columns.map((c, i) => {
        const on = highlight === i;
        return (
          <g key={i}>
            <text x={i * cellW + cellW / 2} y={yLab} textAnchor="middle" fontSize="7.5" fill={MUTED} fontFamily="ui-monospace, monospace">
              {c.label}
            </text>
            <rect
              x={i * cellW} y={yBox} width={cellW} height={h}
              fill={on ? '#fef3c7' : '#fff'} stroke={on ? '#f59e0b' : GRID} strokeWidth={on ? 1.6 : 1}
            />
            <text
              x={i * cellW + cellW / 2} y={yBox + h / 2 + 5}
              textAnchor="middle" fontSize="14" fontWeight="800"
              fill={on ? '#b45309' : INK} fontFamily="ui-monospace, monospace"
            >
              {c.digit}
            </text>
          </g>
        );
      })}
      {comma != null && (
        <text x={(comma + 1) * cellW} y={yBox + h + 6} textAnchor="middle" fontSize="16" fontWeight="900" fill="#e11d48">
          ,
        </text>
      )}
    </svg>
  );
}

/**
 * MiniFigure — polygone nommé, posé à la main, avec ses marques de codage
 * (angle droit, côtés égaux). `points` en pourcentage de la boîte, y vers le
 * bas — les figures de la carte sont petites et fixes.
 */
export function MiniFigure({
  points = [],
  labels = [],
  rightAngles = [],
  ticks = [],
  width = 130,
  height = 100,
  fill = '#ede9fe',
  stroke = '#7c3aed',
  className = '',
}) {
  const pad = 14;
  const toX = (px) => pad + (px / 100) * (width - 2 * pad);
  const toY = (py) => pad + (py / 100) * (height - 2 * pad);
  const pts = points.map((p) => `${toX(p.x)},${toY(p.y)}`).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true" className={`select-none overflow-visible ${className}`}>
      <polygon points={pts} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />

      {rightAngles.map((i, k) => {
        const p = points[i];
        const prev = points[(i - 1 + points.length) % points.length];
        const next = points[(i + 1) % points.length];
        const ux = toX(prev.x) - toX(p.x), uy = toY(prev.y) - toY(p.y);
        const vx = toX(next.x) - toX(p.x), vy = toY(next.y) - toY(p.y);
        const nu = Math.hypot(ux, uy) || 1, nv = Math.hypot(vx, vy) || 1;
        const s = 10;
        const a = { x: toX(p.x) + (ux / nu) * s, y: toY(p.y) + (uy / nu) * s };
        const b = { x: toX(p.x) + (vx / nv) * s, y: toY(p.y) + (vy / nv) * s };
        return (
          <path key={`ra${k}`} d={`M ${a.x} ${a.y} L ${a.x + b.x - toX(p.x)} ${a.y + b.y - toY(p.y)} L ${b.x} ${b.y}`}
            fill="none" stroke={stroke} strokeWidth="1.3" />
        );
      })}

      {ticks.map((t, k) => {
        const p = points[t.edge];
        const q = points[(t.edge + 1) % points.length];
        const mx = (toX(p.x) + toX(q.x)) / 2, my = (toY(p.y) + toY(q.y)) / 2;
        const dx = toX(q.x) - toX(p.x), dy = toY(q.y) - toY(p.y);
        const L = Math.hypot(dx, dy) || 1;
        const nx = -dy / L, ny = dx / L;
        return Array.from({ length: t.count ?? 1 }, (_, j) => {
          const off = (j - ((t.count ?? 1) - 1) / 2) * 4;
          const cx = mx + (dx / L) * off, cy = my + (dy / L) * off;
          return (
            <line key={`tk${k}-${j}`}
              x1={cx - nx * 4} y1={cy - ny * 4} x2={cx + nx * 4} y2={cy + ny * 4}
              stroke={stroke} strokeWidth="1.6" />
          );
        });
      })}

      {labels.map((l, k) => (
        <text key={`l${k}`} x={toX(l.x)} y={toY(l.y)} fontSize="10.5" fontWeight="700"
          fill={INK} textAnchor={l.anchor ?? 'middle'} fontFamily="ui-monospace, monospace">
          {l.text}
        </text>
      ))}
    </svg>
  );
}

/**
 * MiniGrid — un quadrillage à cases, pour les aires et le repérage : on
 * compte des carreaux, ou on montre une case / un nœud.
 */
export function MiniGrid({
  cols = 5,
  rows = 3,
  filled = [],
  cell = 18,
  colLabels = null,
  rowLabels = null,
  nodes = [],
  color = '#34d399',
  className = '',
}) {
  const padL = rowLabels ? 16 : 2;
  const padT = colLabels ? 13 : 2;
  const width = padL + cols * cell + 4;
  const height = padT + rows * cell + 4;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true" className={`select-none overflow-visible ${className}`}>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const on = filled.some((f) => f.r === r && f.c === c);
          return (
            <rect key={`${r}-${c}`}
              x={padL + c * cell} y={padT + r * cell}
              width={cell} height={cell}
              fill={on ? color : '#fff'} fillOpacity={on ? 0.75 : 1}
              stroke={GRID} strokeWidth="1" />
          );
        })
      )}
      <rect x={padL} y={padT} width={cols * cell} height={rows * cell} fill="none" stroke={INK} strokeWidth="1.5" />

      {colLabels?.map((l, i) => (
        <text key={`cl${i}`} x={padL + i * cell + cell / 2} y={padT - 4} textAnchor="middle" fontSize="8.5" fill={MUTED} fontFamily="ui-monospace, monospace">{l}</text>
      ))}
      {rowLabels?.map((l, i) => (
        <text key={`rl${i}`} x={padL - 4} y={padT + i * cell + cell / 2 + 3} textAnchor="end" fontSize="8.5" fill={MUTED} fontFamily="ui-monospace, monospace">{l}</text>
      ))}
      {nodes.map((n, i) => (
        <circle key={`n${i}`} cx={padL + n.c * cell} cy={padT + n.r * cell} r="3.5" fill={n.color ?? '#e11d48'} stroke="#fff" strokeWidth="1.2" />
      ))}
    </svg>
  );
}
