import React, { useMemo } from 'react';
import useDragValue from '../../../../../common/manip6e/useDragValue';
import { filledCells, foldsIntoCube } from './solidesUtils';

/**
 * FoldLab — LE geste de la leçon : plier et déplier, à la main.
 *
 * ACTION          l'élève saisit le patron et tire : le taux de pliage passe
 *                 continûment de 0 (à plat) à 1 (refermé).
 * TRANSFORMATION  les six faces se relèvent ensemble ; celles qui doivent se
 *                 rejoindre se rapprochent, et l'on VOIT si la boîte ferme.
 * SENS MATH.      un patron n'est pas une forme à reconnaître : c'est une
 *                 configuration qui se replie — ou qui ne se replie pas.
 *                 Le pliage est le juge, pas la ressemblance.
 * FEEDBACK        quand deux faces réclament la même place, elles se
 *                 CHEVAUCHENT à l'écran, en rouge : l'échec est visible, pas
 *                 seulement annoncé.
 * GÉNÉRALISATION  deux patrons qui se ressemblent peuvent ne pas avoir le
 *                 même sort ; seul le pliage tranche.
 *
 * ── LE MODÈLE ────────────────────────────────────────────────────────
 * On ne fait pas de vraie 3D : on projette. Chaque case du patron reçoit,
 * par la SIMULATION DE PLIAGE déjà écrite (`foldsIntoCube` → `used`), la
 * face du cube sur laquelle elle atterrit. À `t = 1`, chaque case est donc
 * dessinée à la position que sa face occupe sur un cube en perspective
 * cavalière ; à `t = 0`, à sa position dans le patron. Entre les deux, on
 * interpole. Le mouvement est donc DÉRIVÉ des mathématiques du pliage :
 * une case qui n'a pas de face (patron invalide) va se superposer à une
 * autre, exactement comme dans la réalité.
 *
 * C'est ce qui rend la surprise honnête : deux patrons très semblables se
 * comportent différemment parce que la simulation les distingue, pas parce
 * qu'un auteur a écrit « celui-ci est faux ».
 *
 * ── SÉCURITÉ VISUELLE (§6bis.4) ──────────────────────────────────────
 * Le cadre est calculé pour contenir À LA FOIS le patron étalé et le cube
 * replié (`frameFor`), quelle que soit la grille : rien ne peut sortir sur
 * aucune valeur de `t`. Aucun texte n'est posé sur les faces mobiles — les
 * étiquettes de face vivent dans le DOM, sous la figure. La poignée occupe
 * toute la largeur du cadre, donc reste ≥ 44 px à 375 px.
 */

/* Les six faces du cube, à leur place en perspective cavalière, en unités
   de « case ». Ces positions sont celles du cube fermé : c'est vers elles
   que les cases convergent quand t → 1. */
const K = 0.55;                       // fuyante de la perspective
const FACE_POS = {
  // face      x     y      profondeur (pour l'ordre de peinture)
  B: { x: 0, y: 0, z: 0 },            // bas — la face de devant, au repos
  N: { x: K, y: -K, z: 2 },           // nord — le dessus, décalé en fuyante
  S: { x: 0, y: 0, z: 1 },            // sud — devant
  E: { x: 1, y: 0, z: 1 },            // est — le côté droit
  O: { x: -1, y: 0, z: 0 },           // ouest — le côté gauche, caché
  H: { x: K, y: -1 - K, z: 0 },       // haut — le toit
};

/** Ordre de peinture : les faces du fond d'abord. */
const PAINT_ORDER = ['O', 'B', 'N', 'H', 'S', 'E'];

const COLORS = {
  H: '#c7d2fe', B: '#a5b4fc', N: '#818cf8',
  S: '#6366f1', E: '#4f46e5', O: '#4338ca',
};

/**
 * Le cadre qui contient le patron étalé ET le cube replié.
 * Calculé, jamais deviné : ajouter une colonne au patron élargit le cadre
 * au lieu de faire déborder la figure.
 */
function frameFor(grid, cell) {
  const xs = [0, grid.cols];
  const ys = [0, grid.rows];
  for (const f of Object.values(FACE_POS)) {
    xs.push(f.x, f.x + 1);
    ys.push(f.y, f.y + 1);
  }
  const pad = 0.6;
  const minX = Math.min(...xs) - pad;
  const maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad;
  const maxY = Math.max(...ys) + pad;
  return {
    x: minX * cell,
    y: minY * cell,
    w: (maxX - minX) * cell,
    h: (maxY - minY) * cell,
  };
}

export default function FoldLab({
  grid,
  /** Taux de pliage, 0 = à plat, 1 = refermé. */
  t,
  onTChange,
  cell = 34,
  ariaLabel,
}) {
  const result = useMemo(() => foldsIntoCube(grid), [grid]);
  const cells = useMemo(() => filledCells(grid), [grid]);

  /* Quelle face du cube chaque case occupe-t-elle ? `used` est
     face → [r, c] ; on l'inverse. Une case sans face (patron invalide) n'a
     nulle part où aller : on la fait converger vers le centre, où elle
     chevauchera visiblement ses voisines — ce qui EST le défaut du patron. */
  const faceOfCell = useMemo(() => {
    const m = new Map();
    for (const [face, rc] of Object.entries(result.used ?? {})) {
      if (rc) m.set(`${rc[0]},${rc[1]}`, face);
    }
    return m;
  }, [result]);

  const frame = frameFor(grid, cell);

  /* La poignée : tout le cadre est la course du geste. On saisit la figure
     elle-même — pas un curseur posé dessous (règle projet). */
  const drag = useDragValue({
    value: t,
    onChange: onTChange,
    min: 0,
    max: 1,
    step: 0.02,
    axis: 'x',
    ariaLabel: ariaLabel ?? 'Taux de pliage du patron',
    valueText: (v) =>
      v <= 0.02 ? 'patron à plat'
        : v >= 0.98 ? (result.ok ? 'boîte refermée' : 'boîte qui ne ferme pas')
          : `plié à ${Math.round(v * 100)} pour cent`,
  });

  /* Position d'une case, interpolée entre sa place dans le patron (t=0) et
     la place de sa face sur le cube (t=1). */
  const posOf = (r, c) => {
    const flat = { x: c, y: r };
    const face = faceOfCell.get(`${r},${c}`);
    const folded = face ? FACE_POS[face] : { x: 0.5, y: 0.5, z: 3 };
    return {
      x: (flat.x + (folded.x - flat.x) * t) * cell,
      y: (flat.y + (folded.y - flat.y) * t) * cell,
      z: folded.z ?? 0,
      face,
    };
  };

  /* Les cases, peintes dans l'ordre de profondeur quand la boîte est
     refermée — sans quoi les faces du fond passeraient devant. */
  const painted = cells
    .map(([r, c]) => ({ r, c, ...posOf(r, c) }))
    .sort((a, b) => (t < 0.5 ? 0 : (a.z ?? 0) - (b.z ?? 0)));

  /* Une case orpheline (aucune face) trahit un patron qui ne ferme pas :
     on la marque en rouge dès que le pliage a commencé. */
  const orpheline = (face) => !face;

  return (
    <div className="space-y-3">
      <svg
        {...drag.frameProps}
        viewBox={`${frame.x} ${frame.y} ${frame.w} ${frame.h}`}
        className="w-full max-w-[420px] mx-auto select-none bg-white rounded-xl border-2 border-slate-200"
        role="group"
        aria-label={ariaLabel ?? 'Patron à plier'}
      >
        <g style={{ pointerEvents: 'none' }}>
          {painted.map(({ r, c, x, y, face }) => {
            const rouge = t > 0.15 && orpheline(face);
            return (
              <g key={`${r},${c}`}>
                <rect
                  x={x} y={y} width={cell} height={cell}
                  fill={rouge ? '#fecaca' : (COLORS[face] ?? '#c7d2fe')}
                  fillOpacity={t > 0.5 ? 0.92 : 1}
                  stroke={rouge ? '#dc2626' : '#312e81'}
                  strokeWidth="1.6"
                  rx="2"
                />
              </g>
            );
          })}
        </g>

        {/* La poignée : la figure entière est saisissable. */}
        <rect
          x={frame.x} y={frame.y} width={frame.w} height={frame.h}
          fill="transparent"
          {...drag.handleProps}
          {...drag.a11yProps}
          style={{ ...drag.handleProps.style, outline: 'none' }}
        />
      </svg>

      {/* Les lectures vivent dans le DOM : jamais de texte sur une face
          mobile, donc aucun chevauchement possible. */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-xs font-mono uppercase tracking-wide text-slate-500">
            Pliage
          </span>
          <span className="font-mono font-bold tabular-nums text-slate-700" role="status" aria-live="polite">
            {t <= 0.02 ? 'à plat' : t >= 0.98 ? 'refermé' : `${Math.round(t * 100)} %`}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-75 ${result.ok ? 'bg-emerald-500' : 'bg-rose-400'}`}
            style={{ width: `${Math.round(t * 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 text-center">
          Attrape la figure et tire vers la droite pour la replier, vers la gauche pour l’ouvrir.
        </p>
      </div>
    </div>
  );
}
