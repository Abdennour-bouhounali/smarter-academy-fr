import React from 'react';
import { MiniGrid, MiniFigure } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Symétrie » (6e) — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md, KNOWLEDGE_DEPENDENCY.md).
 *
 * ORDRE — chaque item est posé par un <KnowledgeBrick> au module qui le
 * déclare, à l'instant où le geste vient de lui donner son sens :
 *
 *   M1  la symétrie axiale = un pliage exact ; l'axe de symétrie
 *   M2  le nombre d'axes est une propriété de la figure (le piège de la diagonale)
 *   M3  le symétrique d'un point : les DEUX conditions
 *   M4  la règle ne dépend pas de l'inclinaison de l'axe
 *   M5  ce que la symétrie conserve, et ce qu'elle change
 *   M6  le symétrique d'une figure se construit sommet par sommet
 *   M7  se servir de la conservation pour déduire sans mesurer
 *
 * ⚠️ ORDRE IMPOSÉ. « Axe de symétrie » n'existe qu'APRÈS le pliage du module 1,
 * et « symétrique d'un point » qu'APRÈS la manipulation point/image du
 * module 3 — jamais avant. Le module 5 institutionnalise, il ne découvre pas.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => <p className="text-xs text-rose-600">⚠️ {children}</p>;

/** Un point, l'axe, et l'image : les deux conditions codées sur le dessin. */
function PointImage({ color = '#7c3aed' }) {
  const W = 148, H = 84, ax = 74, y = 42;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="select-none">
      <line x1={ax} y1="6" x2={ax} y2={H - 6} stroke="#94a3b8" strokeWidth="1.6" strokeDasharray="5 3" />
      <text x={ax + 5} y="15" fontSize="9" fill="#64748b" fontFamily="ui-monospace, monospace">(d)</text>
      <line x1="26" y1={y} x2="122" y2={y} stroke={color} strokeWidth="1.6" />
      {/* Le petit carré de l'angle droit au pied du trait. */}
      <path d={`M ${ax} ${y - 8} L ${ax + 8} ${y - 8} L ${ax + 8} ${y}`} fill="none" stroke={color} strokeWidth="1.2" />
      {[[26, 'M'], [122, 'M′']].map(([x, t]) => (
        <g key={t}>
          <circle cx={x} cy={y} r="4" fill={color} />
          <text x={x} y={y - 10} fontSize="10" fontWeight="700" fill="#334155" textAnchor="middle"
            fontFamily="ui-monospace, monospace">{t}</text>
        </g>
      ))}
      {/* Les deux distances, marquées identiques. */}
      {[50, 98].map((x) => (
        <line key={x} x1={x} y1={y - 5} x2={x} y2={y + 5} stroke={color} strokeWidth="1.4" />
      ))}
      <text x={W / 2} y={H - 4} fontSize="9" fill="#64748b" textAnchor="middle" fontFamily="ui-monospace, monospace">
        même distance de part et d’autre
      </text>
    </svg>
  );
}

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Le pliage fonde tout. ── */
    1: [
      {
        id: 'symetrie-pliage',
        type: 'concepts',
        title: 'La symétrie axiale, c’est un pliage',
        summary: 'En pliant le long d’une droite, les deux moitiés se superposent exactement.',
        visual: (
          <MiniFigure
            points={[{ x: 50, y: 4 }, { x: 96, y: 46 }, { x: 73, y: 94 }, { x: 27, y: 94 }, { x: 4, y: 46 }]}
            fill="#eef2ff"
            stroke="#4f46e5"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Le critère est la <strong>superposition exacte</strong>, point par point. Pas « à peu
              près », pas « ça se ressemble beaucoup ».
            </p>
            <Piege>
              Un sommet décalé de quelques millimètres se voit à peine, et suffit pourtant à ce que le
              pliage rate. L’équilibre général du dessin ne prouve rien.
            </Piege>
            <Souvenir>la figure B, qui débordait dès qu’on pliait.</Souvenir>
          </div>
        ),
      },
      {
        id: 'axe-symetrie',
        type: 'vocabulaire',
        title: 'Un axe de symétrie',
        summary: 'La droite du pli : celle qui fait coïncider les deux moitiés.',
        body: (
          <div className="space-y-2">
            <p>
              Toutes les droites ne conviennent pas. Seule celle le long de laquelle le pliage{' '}
              <strong>fonctionne</strong> mérite ce nom.
            </p>
            <p className="text-xs text-slate-500">
              Une figure peut en avoir plusieurs, une seule, ou aucun — c’est ce qu’on va compter.
            </p>
            <Souvenir>le trait pointillé, qui n’était un bon pli que pour la figure A.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Compter les axes, et le piège de la diagonale. ── */
    2: [
      {
        id: 'nombre-axes',
        type: 'regles',
        title: 'Le nombre d’axes se compte, il ne se devine pas',
        summary: 'Carré : 4 · Rectangle : 2 · Triangle équilatéral : 3 · Figure quelconque : aucun.',
        visual: (
          <div className="flex items-center gap-2">
            <MiniFigure points={[{ x: 12, y: 12 }, { x: 88, y: 12 }, { x: 88, y: 88 }, { x: 12, y: 88 }]}
              width={80} height={72} fill="#e0f2fe" stroke="#0284c7" />
            <MiniFigure points={[{ x: 4, y: 26 }, { x: 96, y: 26 }, { x: 96, y: 74 }, { x: 4, y: 74 }]}
              width={80} height={72} fill="#e0f2fe" stroke="#0284c7" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Plus une figure a de propriétés, plus elle a d’axes. Les quatre côtés égaux du carré
              rendent ses diagonales pliables — ce qui est faux pour le rectangle.
            </p>
            <Piege>
              La diagonale d’un rectangle n’est <strong>pas</strong> un axe de symétrie : en pliant
              dessus, les coins ne tombent pas l’un sur l’autre. C’est l’erreur la plus fréquente du
              chapitre.
            </Piege>
            <Souvenir>les deux plis testés sur le rectangle : le milieu marchait, la diagonale non.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Le symétrique d'un point : deux conditions. ── */
    3: [
      {
        id: 'symetrique-point',
        type: 'concepts',
        title: 'Le symétrique d’un point',
        summary: 'Deux conditions ensemble : [MM′] perpendiculaire à l’axe, et M, M′ à égale distance de l’axe.',
        visual: <PointImage />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
              <div>① le trait <span className="font-mono">[MM′]</span> coupe l’axe <strong>à angle droit</strong></div>
              <div>② M et M′ sont à la <strong>même distance</strong> de l’axe, de part et d’autre</div>
            </div>
            <Piege>
              L’une sans l’autre ne définit rien. À égale distance de l’axe, il existe une infinité de
              points : c’est l’angle droit qui en désigne un seul.
            </Piege>
            <Souvenir>les deux jauges qui affichaient toujours le même nombre, où que tu emmènes M.</Souvenir>
          </div>
        ),
      },
      {
        id: 'point-sur-axe',
        type: 'regles',
        title: 'Un point posé sur l’axe est son propre symétrique',
        summary: 'Sa distance à l’axe vaut 0 : son image ne peut être que lui-même.',
        body: (
          <div className="space-y-2">
            <p>
              La règle s’applique sans exception : distance nulle d’un côté, distance nulle de
              l’autre. En pliant, un tel point reste posé sur le pli.
            </p>
          </div>
        ),
      },
    ],

    /* ── M4 — La règle est indépendante de l'inclinaison de l'axe. ── */
    4: [
      {
        id: 'axe-oblique',
        type: 'regles',
        title: 'L’inclinaison de l’axe ne change rien',
        summary: 'Vertical, horizontal ou penché : les deux mêmes conditions s’appliquent toujours.',
        body: (
          <div className="space-y-2">
            <p>
              Un axe penché déroute l’œil, mais pas la règle : le trait qui joint le point à son image
              reste perpendiculaire à cet axe, et les deux distances restent égales.
            </p>
            <Piege>
              Avec un axe oblique, il ne faut surtout pas placer l’image « à la même hauteur » : c’est
              l’angle droit avec l’axe qui commande, pas les bords de la feuille.
            </Piege>
            <Souvenir>le second chantier, où l’axe était penché et où les deux voyants s’allumaient pareil.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — Ce qui se conserve. ── */
    5: [
      {
        id: 'conservation',
        type: 'regles',
        title: 'La symétrie déplace sans déformer',
        summary: 'Longueurs, angles, périmètre et aire sont conservés ; la position et le sens de lecture changent.',
        visual: (
          <MiniGrid
            cols={6} rows={4}
            filled={[{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 4 }, { r: 1, c: 5 }, { r: 2, c: 4 }]}
            color="#60a5fa"
          />
        ),
        body: (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                <div className="font-bold text-emerald-800 text-xs mb-1">Conservé</div>
                <div className="text-emerald-900 text-xs">longueurs · angles · périmètre · aire</div>
              </div>
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5">
                <div className="font-bold text-rose-800 text-xs mb-1">Changé</div>
                <div className="text-rose-900 text-xs">la position · le sens de lecture</div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Le <strong>périmètre</strong> est la longueur du contour, l’<strong>aire</strong> la
              place occupée à l’intérieur : puisque aucune longueur ne change, ces deux mesures ne
              changent pas non plus.
            </p>
            <Souvenir>la figure bleue et son image verte, identiques trait pour trait.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Du point à la figure. ── */
    6: [
      {
        id: 'symetrique-figure',
        type: 'methodes',
        title: 'Le symétrique d’une figure',
        summary: 'On construit le symétrique de chaque sommet, puis on relie.',
        body: (
          <div className="space-y-2">
            <p>
              Rien de nouveau : chaque sommet suit exactement les deux conditions du point isolé. Une
              fois tous les sommets placés, on les relie dans le même ordre.
            </p>
            <Piege>
              On ne dessine jamais « l’autre moitié à l’œil ». C’est sommet par sommet, ou rien.
            </Piege>
            <Souvenir>les trois sommets que tu as placés l’un après l’autre.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M7 — La conservation devient un outil. ── */
    7: [
      {
        id: 'mem-deduire',
        type: 'memoriser',
        title: '⭐ Reconnaître une symétrie, c’est gagner des informations',
        summary: 'Toutes les longueurs et tous les angles de l’image sont déjà connus : inutile de mesurer.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700 font-mono">AB = 7 cm &nbsp;⇒&nbsp; A′B′ = 7 cm</div>
              <div className="text-sm font-black text-rose-700 font-mono">angle B = 55° &nbsp;⇒&nbsp; angle B′ = 55°</div>
            </div>
            <p className="text-xs text-slate-500">
              La symétrie ne double rien et ne divise rien : l’image est une copie exacte, posée de
              l’autre côté de l’axe.
            </p>
            <Souvenir>les réponses trouvées sans rien mesurer sur l’image.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
