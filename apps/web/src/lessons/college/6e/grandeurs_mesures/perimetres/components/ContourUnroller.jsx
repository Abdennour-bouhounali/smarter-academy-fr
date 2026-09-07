import React from 'react';

import useDragValue from '../../../../../common/manip6e/useDragValue';

/**
 * ContourUnroller — DÉROULER le tour d'une figure en une ligne droite.
 *
 * ACTION       l'élève attrape le curseur du déroulement et le tire : un
 *              point parcourt le bord de la figure, côté après côté.
 * CHANGE       la portion parcourue s'allume sur la figure ET s'empile en
 *              même temps sur une règle horizontale, dans l'ordre du tour.
 * OBSERVATION  quand le point revient à son départ, la règle porte la somme
 *              de tous les côtés — le tour a été mis à plat.
 * SENS         le périmètre est une LONGUEUR : c'est le contour redressé.
 *              D'où son unité (des mètres, pas des mètres carrés) et d'où
 *              la formule, qui n'est qu'un raccourci pour cette somme.
 *
 * Pourquoi ce composant à côté de `PolygonPerimeter` (tap côté par côté) :
 * taper quatre côtés donne un total, mais ne montre pas que le périmètre EST
 * une longueur qu'on pourrait dérouler et mesurer au mètre ruban. Le
 * déroulement continu produit le lien contour ↔ segment, que la formule
 * viendra ensuite raccourcir.
 *
 * L'état mathématique est UN réel : `travelled`, la distance parcourue le
 * long du bord depuis le sommet 0, en unités de la figure. La position du
 * point, la portion allumée, la règle et le total en dérivent tous.
 *
 * Sécurité visuelle (§6bis.4) : la figure et la règle sont deux SVG
 * séparés, dimensionnés pour leur cas maximal ; les longueurs de côté sont
 * posées à l'EXTÉRIEUR du polygone (décalage depuis le centre), et le total
 * vit dans le DOM. Aucun texte n'entre dans la figure.
 */
const FIG_W = 300;
const FIG_H = 200;
const RULE_H = 58;

function centroid(pts) {
  const n = pts.length;
  return [pts.reduce((s, p) => s + p.x, 0) / n, pts.reduce((s, p) => s + p.y, 0) / n];
}

export default function ContourUnroller({
  vertices,        // [{x, y}] en coordonnées de dessin (viewBox 300×200)
  sideLengths,     // longueurs mathématiques, même ordre que les côtés
  travelled,
  onChange,
  unit = 'm',
  step = 0.5,
  ruleMax = null,  // longueur maximale de la règle ; par défaut le tour
}) {
  const n = vertices.length;
  const total = sideLengths.reduce((s, v) => s + v, 0);
  const max = ruleMax ?? total;
  const [cx, cy] = centroid(vertices);

  /* Où se trouve le point après avoir parcouru `d` unités du bord, et
     combien de côtés sont entièrement franchis. Tout est dérivé de `d` :
     c'est la seule variable de la manipulation. */
  const locate = (d) => {
    let rest = Math.min(d, total);
    for (let i = 0; i < n; i += 1) {
      if (rest <= sideLengths[i] || i === n - 1) {
        const a = vertices[i];
        const b = vertices[(i + 1) % n];
        const t = sideLengths[i] === 0 ? 0 : Math.min(1, rest / sideLengths[i]);
        return { side: i, t, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      }
      rest -= sideLengths[i];
    }
    return { side: 0, t: 0, x: vertices[0].x, y: vertices[0].y };
  };

  const head = locate(travelled);
  const fullSides = (() => {
    let rest = travelled;
    let k = 0;
    for (let i = 0; i < n; i += 1) {
      if (rest >= sideLengths[i] - 1e-9) { k += 1; rest -= sideLengths[i]; } else break;
    }
    return k;
  })();

  const drag = useDragValue({
    value: travelled,
    onChange,
    min: 0,
    max: total,
    step,
    axis: 'x',
    ariaLabel: 'Déroule le tour de la figure',
    valueText: (v) => `${v} ${unit} de contour parcourus sur ${total}`,
  });

  // Portion du bord déjà parcourue, en polyligne : elle s'allume derrière
  // le point, ce qui rend visible « ce qui est déjà compté ».
  const donePath = (() => {
    const pts = [`${vertices[0].x},${vertices[0].y}`];
    for (let i = 1; i <= fullSides; i += 1) pts.push(`${vertices[i % n].x},${vertices[i % n].y}`);
    if (travelled > 0) pts.push(`${head.x},${head.y}`);
    return pts.join(' ');
  })();

  const RULE_W = FIG_W;
  const px = (v) => (v / max) * (RULE_W - 20);

  return (
    <div className="space-y-2">
      {/* ── La figure : le tour se colore au fur et à mesure ────────── */}
      <svg
        viewBox={`0 0 ${FIG_W} ${FIG_H}`}
        className="w-full max-w-md mx-auto select-none block"
        role="img"
        aria-label={`Figure à ${n} côtés, contour parcouru sur ${travelled} ${unit}`}
      >
        <polygon points={vertices.map((v) => `${v.x},${v.y}`).join(' ')} fill="#eff6ff" stroke="#cbd5e1" strokeWidth="2" />
        {travelled > 0 && (
          <polyline points={donePath} fill="none" stroke="#059669" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* Longueurs des côtés, posées à l'extérieur du polygone (décalage
            radial depuis le centre) : elles ne peuvent croiser ni le
            contour ni le point mobile, dans aucun état. */}
        {vertices.map((a, i) => {
          const b = vertices[(i + 1) % n];
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const dx = mx - cx;
          const dy = my - cy;
          const d = Math.hypot(dx, dy) || 1;
          return (
            <text
              key={i}
              x={mx + (dx / d) * 20}
              y={my + (dy / d) * 20 + 4}
              textAnchor="middle"
              style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, pointerEvents: 'none' }}
              className={i < fullSides ? 'fill-emerald-700' : 'fill-slate-500'}
            >
              {sideLengths[i]}
            </text>
          );
        })}
        <circle cx={vertices[0].x} cy={vertices[0].y} r={4} fill="#0f172a" />
        <circle cx={head.x} cy={head.y} r={8} fill="#059669" stroke="#ffffff" strokeWidth="3" />
      </svg>

      {/* ── La règle : le MÊME tour, mis à plat ─────────────────────── */}
      <svg
        viewBox={`0 0 ${RULE_W} ${RULE_H}`}
        className="w-full max-w-md mx-auto select-none block"
        role="group"
        aria-label="Le contour déroulé en ligne droite"
        {...drag.frameProps}
      >
        <line x1={10} y1={30} x2={RULE_W - 10} y2={30} stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        {/* Chaque côté déjà déroulé prend sa place sur la règle, dans
            l'ordre du parcours et avec sa propre teinte : on voit la somme
            se construire segment après segment. */}
        {(() => {
          const segs = [];
          let acc = 0;
          for (let i = 0; i < n; i += 1) {
            const shown = Math.max(0, Math.min(sideLengths[i], travelled - acc));
            if (shown > 0) {
              segs.push(
                <line
                  key={i}
                  x1={10 + px(acc)}
                  y1={30}
                  x2={10 + px(acc + shown)}
                  y2={30}
                  stroke={i % 2 === 0 ? '#059669' : '#0ea5e9'}
                  strokeWidth="10"
                  strokeLinecap="butt"
                />
              );
              segs.push(
                <line key={`t${i}`} x1={10 + px(acc + shown)} y1={20} x2={10 + px(acc + shown)} y2={40} stroke="#0f172a" strokeWidth="1.5" />
              );
            }
            acc += sideLengths[i];
          }
          return segs;
        })()}
        {/* La poignée : le bout du ruban déroulé. Cible tactile r = 20 en
            viewBox de 300 rendue sur ~380 px → largement au-delà de 44 px. */}
        <g {...drag.handleProps} {...drag.a11yProps} style={{ ...drag.handleProps.style, outline: 'none' }}>
          <circle cx={10 + px(travelled)} cy={30} r={20} fill="transparent" />
          <circle cx={10 + px(travelled)} cy={30} r={10} fill="#e11d48" stroke="#ffffff" strokeWidth="3" />
        </g>
      </svg>

      {/* Le total dans le DOM : jamais dans le SVG (§6ter.5). */}
      <div className="text-center" role="status" aria-live="polite">
        <p className="font-mono text-slate-800">
          Contour déroulé : <strong className="text-xl">{Number(travelled.toFixed(2))} {unit}</strong>
          <span className="text-slate-400"> / {Number(total.toFixed(2))} {unit}</span>
        </p>
        {fullSides > 0 && (
          <p className="font-mono text-xs text-slate-500 break-words mt-0.5">
            {sideLengths.slice(0, fullSides).join(' + ')}
            {fullSides === n ? ` = ${Number(total.toFixed(2))} ${unit}` : ' + …'}
          </p>
        )}
      </div>
    </div>
  );
}
