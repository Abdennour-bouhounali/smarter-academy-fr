import React from 'react';
import MathText from '../../../../common/components/MathText';

/** Connaissances de « Tableaux croisés » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */

/** Un mini-tableau croisé, figure récurrente de la leçon. */
const MiniTable = ({ highlight = null }) => {
  const cells = [[6, 3, 6], [5, 6, 8]];
  const rows = ['judo', 'danse'];
  const cols = ['2A', '2B', '2C'];
  const cw = 34; const ch = 20; const x0 = 44; const y0 = 18;
  return (
    <svg viewBox="0 0 216 96" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 216 }}>
      {cols.map((c, j) => (
        <text key={c} x={x0 + j * cw + cw / 2} y={y0 - 4} textAnchor="middle" fontSize="9" fontWeight="700"
          fill={highlight === `col${j}` ? '#7c3aed' : '#64748b'}>{c}</text>
      ))}
      <text x={x0 + 3 * cw + cw / 2} y={y0 - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="#334155">Tot</text>
      {rows.map((r, i) => (
        <g key={r}>
          <text x={x0 - 6} y={y0 + i * ch + 14} textAnchor="end" fontSize="9" fontWeight="700"
            fill={highlight === `row${i}` ? '#7c3aed' : '#64748b'}>{r}</text>
          {cells[i].map((v, j) => (
            <g key={j}>
              <rect x={x0 + j * cw} y={y0 + i * ch} width={cw} height={ch}
                fill={highlight === `row${i}` || highlight === `col${j}` ? '#ede9fe' : '#fff'}
                stroke="#cbd5e1" strokeWidth="1" />
              <text x={x0 + j * cw + cw / 2} y={y0 + i * ch + 14} textAnchor="middle" fontSize="10" fill="#334155">{v}</text>
            </g>
          ))}
          <rect x={x0 + 3 * cw} y={y0 + i * ch} width={cw} height={ch} fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          <text x={x0 + 3 * cw + cw / 2} y={y0 + i * ch + 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="#334155">
            {cells[i].reduce((a, b) => a + b, 0)}
          </text>
        </g>
      ))}
      <text x={x0 - 6} y={y0 + 2 * ch + 14} textAnchor="end" fontSize="9" fontWeight="700" fill="#334155">Tot</text>
      {cols.map((c, j) => (
        <g key={c}>
          <rect x={x0 + j * cw} y={y0 + 2 * ch} width={cw} height={ch} fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          <text x={x0 + j * cw + cw / 2} y={y0 + 2 * ch + 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="#334155">
            {cells[0][j] + cells[1][j]}
          </text>
        </g>
      ))}
      <rect x={x0 + 3 * cw} y={y0 + 2 * ch} width={cw} height={ch} fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" />
      <text x={x0 + 3 * cw + cw / 2} y={y0 + 2 * ch + 14} textAnchor="middle" fontSize="10" fontWeight="800" fill="#0f172a">34</text>
    </svg>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'tableau-croise',
        type: 'concepts',
        title: 'Tableau croisé d’effectifs',
        summary: 'Croiser deux variables, c’est ranger chaque individu dans une case et une seule : le comptage est exhaustif et sans recouvrement.',
        visual: <MiniTable />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Chaque case donne l’effectif des individus qui vérifient <strong>les deux</strong> caractères à la
              fois. La somme de toutes les cases vaut l’effectif total — 60 élèves du club — parce qu’aucun
              individu n’est oublié ni compté deux fois.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Additionner « élèves de 2de A » et « judokas » compterait deux fois ceux qui sont les deux.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les soixante fiches rangées une par une, et le total qui tombe sur 60.</div>
          </div>
        ),
      },
      {
        id: 'fichier-donnees',
        type: 'vocabulaire',
        title: 'Fichier de données individuelles',
        summary: 'Une ligne par individu, une colonne par variable. Il contient tout, mais ne totalise rien.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>C’est la forme brute des données. Le tableau croisé en est le RÉSUMÉ : il répond d’un coup d’œil à des questions qui demandaient de parcourir 60 lignes.</p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'qualitative-nominale-ordinale',
        type: 'concepts',
        title: 'Variables qualitatives : nominales et ordinales',
        summary: 'Une variable qualitative prend pour valeurs des modalités. Elle est ordinale si ses modalités ont un ordre naturel, nominale sinon.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
                <strong>Nominale</strong> — activité, couleur des yeux, ville : aucun ordre naturel.
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900">
                <strong>Ordinale</strong> — niveau (débutant → confirmé), mention au bac : un ordre s’impose.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              L’ordre d’une variable ordinale doit être <strong>respecté dans le tableau</strong> : sinon on ne
              peut plus y lire une progression.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le tableau des niveaux, dans le désordre puis dans l’ordre.</div>
          </div>
        ),
      },
      {
        id: 'combien-modalites',
        type: 'regles',
        title: 'Croiser suppose peu de modalités',
        summary: 'Le tableau n’a de sens que si chaque variable a un petit nombre de modalités ; une grandeur continue doit d’abord être regroupée en classes.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>3 classes × 4 activités = 12 cases, lisibles. Croiser des tailles au centimètre donnerait presque autant de cases que d’individus.</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'effectifs-marginaux',
        type: 'concepts',
        title: 'Effectifs marginaux et total général',
        summary: 'Un total de ligne ou de colonne répond à une question sur UN seul caractère ; la case, sur les deux.',
        visual: <MiniTable highlight="row0" />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              15 judokas <em>toutes classes confondues</em> (marge de ligne) ; 26 élèves en 2de C <em>toutes
              activités confondues</em> (marge de colonne) ; 6 élèves de 2de A qui font du judo (case).
            </p>
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
              La somme des marges de lignes et celle des marges de colonnes valent toutes deux l’effectif total :
              une <strong>vérification gratuite</strong> du comptage.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-case-marge',
        type: 'memoriser',
        title: '⭐ Case = deux caractères, marge = un seul',
        summary: 'La question dit où lire : un seul caractère → la marge ; les deux → la case d’intersection.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">case ⟷ ET · marge ⟷ un caractère</div>
            <p className="text-xs text-rose-700">Somme des lignes = somme des colonnes = effectif total</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'filtres-logiques',
        type: 'regles',
        title: 'ET, OU, NON',
        summary: 'ET = intersection (une case) ; OU = réunion INCLUSIVE ; NON = complémentaire.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 text-center">
              <MathText>{'$$n(A \\text{ ou } B) = n(A) + n(B) - n(A \\text{ et } B)$$'}</MathText>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800"><strong>ET</strong> — « en 2de A et au judo » : 6 élèves, une case.</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800"><strong>OU</strong> — « en 2de A ou au judo » : 14 + 15 − 6 = 23 élèves.</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800"><strong>NON</strong> — « pas en 2de B » : 60 − 20 = 40 élèves.</div>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Le OU des mathématiques est <strong>inclusif</strong> : il garde ceux qui vérifient les deux.
              Additionner sans retirer l’intersection les compte deux fois.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les pastilles qui ne s’allument qu’une fois sur un OU.</div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'comparer-honnetement',
        type: 'methodes',
        title: 'Comparer deux groupes de tailles différentes',
        summary: 'Un effectif brut ne se compare qu’à effectifs de groupes égaux ; sinon il faut le rapporter à son groupe.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>5 danseurs sur 14 élèves de 2de A, contre 8 sur 26 en 2de C : l’effectif brut est plus grand en 2de C, mais la PART y est plus petite (≈ 31 % contre ≈ 36 %).</p>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              Quand les deux groupes ont exactement la même taille (300 et 300 dans une enquête), la comparaison brute redevient légitime.
            </div>
            <p>Rapporter un effectif à son groupe de référence, c’est calculer une <strong>fréquence conditionnelle</strong> — la leçon suivante.</p>
          </div>
        ),
      },
    ],
  },
};
