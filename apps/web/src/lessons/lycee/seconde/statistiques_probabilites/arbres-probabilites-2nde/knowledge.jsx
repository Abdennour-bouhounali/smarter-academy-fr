import React from 'react';
import MathText from '../../../../common/components/MathText';

/** Connaissances de « Arbres de probabilités » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */

/** Un arbre miniature : les deux chemins « rouge » éclairés, produits et somme. */
const MiniTree = ({ lit = false }) => {
  const x0 = 14; const x1 = 84; const x2 = 154;
  const rows = [
    { y: 18, sac: 'A', pSac: '0,6', couleur: 'R', p: '0,5', prod: '0,30', red: true },
    { y: 40, sac: 'A', pSac: '', couleur: 'B', p: '0,5', prod: '0,30', red: false },
    { y: 62, sac: 'B', pSac: '0,4', couleur: 'R', p: '0,25', prod: '0,10', red: true },
    { y: 84, sac: 'B', pSac: '', couleur: 'B', p: '0,75', prod: '0,30', red: false },
  ];
  return (
    <svg viewBox="0 0 214 100" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 214 }}>
      <circle cx={x0} cy={51} r="3.5" fill="#475569" />
      {[{ y: 29, l: 'A', p: '0,6' }, { y: 73, l: 'B', p: '0,4' }].map((n) => (
        <g key={n.l}>
          <line x1={x0} y1={51} x2={x1} y2={n.y} stroke="#94a3b8" strokeWidth="1.4" />
          <text x={(x0 + x1) / 2 - 2} y={(51 + n.y) / 2 - 3} fontSize="8" fontWeight="700" fill="#7c3aed">{n.p}</text>
          <circle cx={x1} cy={n.y} r="3" fill="#475569" />
          <text x={x1 - 9} y={n.y + 3} fontSize="9" fontWeight="700" fill="#334155">{n.l}</text>
        </g>
      ))}
      {rows.map((r, i) => {
        const from = r.sac === 'A' ? 29 : 73;
        const on = lit && r.red;
        return (
          <g key={i}>
            <line x1={x1} y1={from} x2={x2} y2={r.y} stroke={on ? '#c026d3' : '#cbd5e1'} strokeWidth={on ? 2.2 : 1.2} />
            <text x={x2 + 4} y={r.y + 3} fontSize="8" fontWeight={on ? '800' : '400'} fill={on ? '#a21caf' : '#64748b'}>
              {r.sac}{r.couleur} = {r.prod}
            </text>
          </g>
        );
      })}
      {lit && <text x={x1 - 4} y={98} fontSize="8.5" fontWeight="700" fill="#a21caf">0,30 + 0,10 = 0,40</text>}
    </svg>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'arbre-structure',
        type: 'vocabulaire',
        title: 'Arbre pondéré : nœuds, branches, chemins',
        summary: 'Un niveau par étape de l’expérience, un chemin par issue complète — l’arbre suit la chronologie.',
        visual: <MiniTree />,
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Chaque <strong>niveau</strong> correspond à une étape ; chaque <strong>chemin</strong>, de la
              racine à une extrémité, décrit une issue complète.
            </p>
            <p>
              Deux étapes à deux issues donnent <strong>4 chemins</strong>. L’ordre des niveaux n’est pas libre :
              on place d’abord l’étape dont la suivante dépend.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : impossible d’accrocher la bille avant le sac.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'poids-conditionnels',
        type: 'concepts',
        title: 'Les poids du second niveau sont des conditionnelles',
        summary: 'Un poids se lit « sachant qu’on est arrivé à ce nœud » — jamais sur l’ensemble de l’expérience.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Sur la branche du sac A, 0,5 signifie <strong>P<sub>A</sub>(rouge)</strong> : la moitié des
              tirages <em>qui passent par A</em>. La probabilité d’obtenir une rouge en général vaut 0,40 —
              un tout autre nombre.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              C’est l’erreur la plus fréquente : prendre un poids du second niveau pour une proportion globale.
            </div>
          </div>
        ),
      },
      {
        id: 'somme-branches',
        type: 'regles',
        title: 'Les branches d’un même nœud somment à 1',
        summary: 'Elles couvrent toutes les suites possibles ; une somme différente de 1 signale un arbre faux.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Une fois le sac A choisi, la bille est rouge ou bleue : 0,5 + 0,5 = 1.</p>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              Premier contrôle à faire sur tout arbre : additionner les branches de chaque nœud.
            </div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'produit-chemin',
        type: 'formules',
        title: 'Probabilité d’un chemin : on multiplie',
        summary: 'Les poids rencontrés le long d’un chemin se multiplient, parce que chaque étape se joue dans ce qui reste.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-sky-100 p-3 text-center">
              <MathText>{'$$P(\\text{chemin}) = p_1 \\times p_2$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              Sur 1 000 tirages, 600 passent par A et la moitié donnent une rouge : 300, soit 0,30 = 0,6 × 0,5.
              Le produit est un <strong>comptage</strong>, pas une convention.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les 600 puis les 300.</div>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'somme-chemins',
        type: 'formules',
        title: 'Probabilité d’un événement : on additionne les chemins',
        summary: 'Les chemins qui réalisent l’événement sont incompatibles : leurs probabilités s’ajoutent.',
        visual: <MiniTree lit />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 text-center">
              <MathText>{'$$P(\\text{événement}) = \\sum \\text{chemins}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              Une rouge vient de A (0,30) ou de B (0,10) : P(rouge) = <strong>0,40</strong>.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Ce n’est <strong>pas</strong> la moyenne des compositions (qui donnerait 0,375) : les deux sacs ne
              sont pas choisis aussi souvent.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-produit-somme',
        type: 'memoriser',
        title: '⭐ Multiplier le long, additionner entre',
        summary: 'Produit en avançant sur un chemin ; somme en rassemblant des chemins distincts.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">× le long d’un chemin<br />+ entre les chemins</div>
            <p className="text-xs text-rose-700">deux questions différentes, deux opérations différentes</p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'methode-situation-arbre',
        type: 'methodes',
        title: 'D’une situation à un arbre',
        summary: 'Repérer les deux étapes, poser les poids conditionnels, puis multiplier et additionner.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Identifier les deux étapes et laquelle conditionne l’autre.</li>
              <li>Poser les poids du premier niveau (les données globales).</li>
              <li>Poser ceux du second niveau : ce sont les « parmi ceux-là… » de l’énoncé.</li>
              <li>Multiplier le long de chaque chemin utile, puis additionner ces chemins.</li>
            </ol>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              Météo : 0,30 × 0,40 + 0,70 × 0,10 = <strong>0,19</strong>.
            </div>
          </div>
        ),
      },
    ],
  },
};
