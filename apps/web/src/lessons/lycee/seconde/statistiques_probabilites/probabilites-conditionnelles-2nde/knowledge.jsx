import React from 'react';
import MathText from '../../../../common/components/MathText';

/** Connaissances de « Probabilités conditionnelles » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */

/**
 * L'univers qui rétrécit : la figure de la leçon. À gauche la population
 * entière, à droite la sous-population — même numérateur en foncé, tout
 * autre dénominateur.
 */
const MiniUniverse = ({ restricted = true }) => {
  const dot = (i, lit) => {
    const cx = 8 + (i % 10) * 10;
    const cy = 8 + Math.floor(i / 10) * 10;
    return <circle key={i} cx={cx} cy={cy} r="3.4" fill={lit ? '#4f46e5' : '#cbd5e1'} opacity={lit ? 1 : 0.45} />;
  };
  // 40 pastilles : 10 « internes en club », 10 internes sans club, 20 externes
  const dots = Array.from({ length: 40 }, (_, i) => {
    const inA = i < 20;                 // condition A : les 20 premières
    const inB = i < 10 || (i >= 20 && i < 30);
    const lit = restricted ? inA && inB : inB;
    const shown = restricted ? inA : true;
    return { i, lit, shown };
  });
  return (
    <svg viewBox="0 0 214 92" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 214 }}>
      {dots.map((d) => (d.shown
        ? dot(d.i, d.lit)
        : <circle key={d.i} cx={8 + (d.i % 10) * 10} cy={8 + Math.floor(d.i / 10) * 10} r="3.4" fill="#e2e8f0" opacity="0.3" />))}
      <text x={8} y={64} fontSize="10" fontWeight="700" fill="#4f46e5">
        {restricted ? '10 / 20 = 50 %' : '20 / 40 = 50 %'}
      </text>
      <text x={8} y={80} fontSize="9" fill="#64748b">
        {restricted ? 'univers restreint : 20 individus' : 'univers complet : 40 individus'}
      </text>
    </svg>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'univers-restreint',
        type: 'concepts',
        title: 'L’univers restreint',
        summary: 'Conditionner, ce n’est pas ajouter une information : c’est remplacer la population entière par une sous-population.',
        visual: <MiniUniverse restricted />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Sur 800 élèves, <strong>56,3 %</strong> sont en club. Parmi les 200 internes seulement,
              <strong> 75 %</strong> le sont. Les 150 élèves du numérateur sont pourtant les mêmes : c’est le
              <strong> tout</strong> qui a changé.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Une probabilité n’existe jamais sans son univers. Devant un pourcentage, chercher toujours :
              <strong> calculé sur qui ?</strong>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les pastilles qui s’éteignent.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'notation-sachant',
        type: 'formules',
        title: 'La notation P_A(B)',
        summary: 'Une probabilité calculée sous une condition s’appelle une probabilité CONDITIONNELLE ; l’événement en indice est la condition, c’est lui qui donne le dénominateur.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-center">
              <MathText>{'$$P_A(B) = \\frac{n(A \\cap B)}{n(A)}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              Se lit « probabilité de <strong>B sachant A</strong> ». Une probabilité calculée ainsi, dans un
              univers restreint par une condition, s’appelle une <strong>probabilité conditionnelle</strong> —
              et l’adjectif <strong>conditionnel</strong> renverra toujours à cette restriction. Avec
              A = interne et B = en club : 150/200 = 0,75.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              À distinguer de <MathText>{'$P(A \\cap B) = 150/800 = 0{,}1875$'}</MathText> : même numérateur,
              univers différent.
            </div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'inversion',
        type: 'regles',
        title: 'P_A(B) ≠ P_B(A)',
        summary: 'Échanger la condition et l’événement change l’univers, donc la question et la réponse.',
        visual: <MiniUniverse restricted={false} />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              <strong>75 %</strong> des internes sont en club, mais seulement <strong>33 %</strong> des élèves
              en club sont internes : 150/200 contre 150/450.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              « La plupart des accidents ont lieu près du domicile » ne dit <strong>rien</strong> du risque par
              trajet : la première phrase compte parmi les accidents, la seconde parmi les trajets.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le bouton qui bascule la condition, la ligne qui devient colonne.</div>
          </div>
        ),
      },
      {
        id: 'mem-indice',
        type: 'memoriser',
        title: '⭐ L’indice porte la condition',
        summary: 'Dans P_A(B), A est la condition et donne le dénominateur ; B est l’événement calculé dedans.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">P<sub>condition</sub>(événement)</div>
            <p className="text-xs text-rose-700">dénominateur = effectif de la condition</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'frequence-probabilite',
        type: 'concepts',
        title: 'Fréquence conditionnelle et probabilité conditionnelle',
        summary: 'Le même quotient : l’une décrit des données observées, l’autre modélise un tirage au hasard.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              150/200 = 0,75 est une <strong>fréquence</strong> quand on résume une enquête déjà faite, une
              <strong> probabilité</strong> quand on prévoit le résultat d’un tirage au hasard.
            </p>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              C’est la <strong>loi des grands nombres</strong> qui autorise le passage de l’une à l’autre : sur
              un grand nombre de tirages, la fréquence observée s’approche de la probabilité.
            </div>
          </div>
        ),
      },
      {
        id: 'probabilites-composees',
        type: 'formules',
        title: 'Probabilités composées',
        summary: 'P(A ∩ B) = P(A) × P_A(B) : on compose la probabilité de la condition et la conditionnelle.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 text-center">
              <MathText>{'$$P(A \\cap B) = P(A) \\times P_A(B)$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              40 % de cyclistes, dont 30 % à vélo tous les jours → 0,40 × 0,30 = <strong>12 %</strong> des
              habitants.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Ne jamais appliquer les 30 % à la population entière : ils ne portent que sur les cyclistes.
            </div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'methode-situation',
        type: 'methodes',
        title: 'Traiter un énoncé de probabilité conditionnelle',
        summary: 'Repérer la condition, écrire son effectif au dénominateur, compter l’intersection au numérateur.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Repérer les mots « sachant », « parmi », « on sait que », « il est… ».</li>
              <li>Écrire l’effectif de cette condition : c’est le dénominateur.</li>
              <li>Compter les individus qui vérifient <em>aussi</em> l’événement : c’est le numérateur.</li>
              <li>Diviser, puis relire le résultat en commençant la phrase par « parmi les… ».</li>
            </ol>
          </div>
        ),
      },
    ],
  },
};
