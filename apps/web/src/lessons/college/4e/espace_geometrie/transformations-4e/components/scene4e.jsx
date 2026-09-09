import React from 'react';
import { PAS, CADRE, fr, enCarreaux } from './translation4e';

/**
 * Primitives de scène partagées par les six laboratoires de la leçon.
 *
 * Elles existent pour une raison précise : la leçon montre SIX fois la même
 * chose — un quadrillage, une figure, une copie, une flèche de glissement, des
 * traits [M M'] — et six copies divergentes du même dessin finiraient par se
 * contredire. Un trait pointillé qui serait ailleurs « plein » ferait croire à
 * l'élève qu'il regarde un objet différent.
 *
 * Tout est en unités de viewBox (760 × 470). Les épaisseurs suivent donc la
 * figure quand elle grandit, et rien ne devient un cheveu sur grand écran ni
 * un pâté sur téléphone.
 */

export const W = CADRE.w;
export const H = CADRE.h;

/** Le quadrillage, discret : c'est un repère de comptage, pas un motif. */
export function Grille({ step = PAS }) {
  const lines = [];
  for (let x = step; x < W; x += step) {
    lines.push(<line key={`x${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#eef2f7" strokeWidth={1} data-visual-role="grid" />);
  }
  for (let y = step; y < H; y += step) {
    lines.push(<line key={`y${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#eef2f7" strokeWidth={1} data-visual-role="grid" />);
  }
  return <g>{lines}</g>;
}

/**
 * La flèche du glissement.
 *
 * Elle est dessinée à partir des DEUX points qu'on lui donne — jamais à partir
 * d'une longueur et d'un angle stockés à part. La pointe est donc toujours à
 * l'endroit exact où la copie a été portée : le dessin ne peut pas annoncer un
 * glissement que la figure ne fait pas.
 */
export function Fleche({ de, vers, color = '#4338ca', w = 5, dash, opacity = 1, tete = 17 }) {
  const dx = vers.x - de.x;
  const dy = vers.y - de.y;
  const n = Math.hypot(dx, dy);
  if (n < 1e-6) return null;
  const ux = dx / n;
  const uy = dy / n;
  // La hampe s'arrête AVANT la pointe : sinon le trait dépasse du triangle et
  // la flèche paraît émoussée.
  const bout = { x: vers.x - ux * tete * 0.85, y: vers.y - uy * tete * 0.85 };
  const px = -uy;
  const py = ux;
  const pts = [
    `${vers.x},${vers.y}`,
    `${vers.x - ux * tete + px * tete * 0.55},${vers.y - uy * tete + py * tete * 0.55}`,
    `${vers.x - ux * tete - px * tete * 0.55},${vers.y - uy * tete - py * tete * 0.55}`,
  ].join(' ');
  return (
    <g opacity={opacity}>
      <line
        x1={de.x} y1={de.y} x2={bout.x} y2={bout.y}
        stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash}
      />
      <polygon points={pts} fill={color} />
    </g>
  );
}

/**
 * Les trajets [M M'] — un par sommet.
 *
 * C'est LE dessin de la leçon : quand le geste est un glissement, ces traits
 * sont parallèles et de même longueur ; quand c'est un demi-tour, ils se
 * croisent tous en un point. Le module 1 ne dit rien de plus que « regarde-les ».
 */
export function Trajets({ figure, image, color = '#f59e0b', w = 2.5, fleches = false }) {
  return (
    <g>
      {figure.map((p, i) => (fleches
        ? <Fleche key={`tr${i}`} de={p} vers={image[i]} color={color} w={w} tete={12} opacity={0.85} />
        : <line
            key={`tr${i}`}
            x1={p.x} y1={p.y} x2={image[i].x} y2={image[i].y}
            stroke={color} strokeWidth={w} strokeDasharray="8 6" strokeLinecap="round"
          />
      ))}
    </g>
  );
}

/**
 * Une case du tableau de bord, en DOM et non en `<text>` SVG (§6bis.4).
 *
 * Un nombre posé dans le SVG se met à l'échelle avec la figure : sur
 * téléphone il devient illisible, et il peut recouvrir un trait sans que
 * l'audit de collisions le voie. Ici il vit dans le flux, il s'enroule, et il
 * reste à 15 px quelle que soit la taille du dessin.
 */
const FONDS = {
  slate: 'bg-slate-50/70',
  indigo: 'bg-indigo-50/70',
  emerald: 'bg-emerald-50/70',
  amber: 'bg-amber-50/70',
};

export function Mesure({ label, value, ok, tone = 'slate' }) {
  const couleur = ok === undefined
    ? 'text-slate-800'
    : ok ? 'text-emerald-700' : 'text-slate-400';
  // Les classes sont prises dans une TABLE et non composées : Tailwind ne
  // compile que les noms qu'il voit écrits en toutes lettres, et une classe
  // interpolée donnerait une case sans fond, sans aucune erreur.
  return (
    <div className={`rounded-xl px-2 py-1.5 ${FONDS[tone] ?? FONDS.slate}`}>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`font-mono text-base font-black tabular-nums ${couleur}`}>{value}</div>
    </div>
  );
}

/** Une longueur, dite en carreaux — l'unité que l'élève peut compter. */
export const carreaux = (px, n = 2) => `${fr(enCarreaux(px), n)} car.`;
