import React from 'react';
import MathText from '../../../../common/components/MathText';

/** Connaissances de « Statistiques à une variable » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */

/** Un axe avec quelques pastilles et un repère : la figure de la leçon. */
const MiniSeries = ({ marks = [], width = 220, dots = [5, 10, 12, 15, 18, 20, 25, 30, 40], band = null }) => {
  const lo = 0; const hi = 45;
  const x = (v) => 8 + ((v - lo) / (hi - lo)) * (width - 16);
  return (
    <svg viewBox={`0 0 ${width} 72`} aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: width }}>
      {band && <rect x={x(band[0])} y={16} width={Math.max(2, x(band[1]) - x(band[0]))} height={30} fill="#c7d2fe" opacity="0.55" />}
      <line x1={8} y1={46} x2={width - 8} y2={46} stroke="#475569" strokeWidth="1.4" />
      {dots.map((v, i) => <circle key={i} cx={x(v)} cy={38} r="4" fill="#0284c7" stroke="#fff" strokeWidth="1.2" />)}
      {marks.map((m) => (
        <g key={m.label}>
          <line x1={x(m.v)} y1={14} x2={x(m.v)} y2={50} stroke={m.color} strokeWidth="2" strokeDasharray="4 3" />
          <text x={Math.max(20, Math.min(width - 20, x(m.v)))} y={10} textAnchor="middle" fontSize="9" fontWeight="800" fill={m.color}>{m.label}</text>
        </g>
      ))}
      <text x={8} y={64} fontSize="9" fill="#94a3b8">0</text>
      <text x={width - 8} y={64} textAnchor="end" fontSize="9" fill="#94a3b8">45 min</text>
    </svg>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'serie-statistique',
        type: 'concepts',
        title: 'Série statistique à une variable',
        summary: 'Une liste de valeurs mesurées sur des individus. Un seul nombre ne peut pas la résumer : il faut dire où elle se situe ET comment elle s’étale.',
        visual: <MiniSeries marks={[{ v: 19.15, label: 'moy', color: '#d97706' }, { v: 18, label: 'méd', color: '#059669' }]} />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Les 20 temps de trajet de la 2de A forment une série. Deux questions différentes se posent :
              <strong> où vit la classe ?</strong> (position) et <strong>à quel point est-elle dispersée ?</strong> (étalement).
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Deux séries de même moyenne peuvent être totalement différentes — c’est pour cela qu’un seul indicateur ne suffit jamais.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les vingt pastilles sur l’axe, et la pastille qu’on déménage.</div>
          </div>
        ),
      },
      {
        id: 'vocab-effectif-frequence',
        type: 'vocabulaire',
        title: 'Effectif, fréquence, individu',
        summary: 'L’effectif d’une valeur est le nombre d’individus qui la prennent ; sa fréquence est cet effectif rapporté à l’effectif total.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Sur 20 élèves, 3 mettent 15 min : effectif 3, fréquence 3/20 = 0,15 = 15 %.</p>
            <p>L’<strong>effectif total</strong> n’est pas le nombre de valeurs distinctes : trois valeurs distinctes peuvent concerner vingt élèves.</p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'moyenne',
        type: 'formules',
        title: 'Moyenne',
        summary: 'Somme des valeurs divisée par l’effectif ; avec des effectifs, somme pondérée divisée par l’effectif total.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-center">
              <MathText>{'$$\\bar{x} = \\frac{x_1 + \\dots + x_n}{n} = \\frac{n_1 x_1 + n_2 x_2 + \\dots}{n_1 + n_2 + \\dots}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">4 élèves à 10 min, 6 à 20 min, 2 à 35 min : (40 + 120 + 70) ÷ 12 ≈ <strong>19,17 min</strong>.</p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Ne pas faire la moyenne des valeurs distinctes : (10 + 20 + 35) ÷ 3 = 21,67 min ignore les effectifs.
            </div>
          </div>
        ),
      },
      {
        id: 'mediane',
        type: 'concepts',
        title: 'Médiane',
        summary: 'La valeur qui partage l’effectif ordonné en deux moitiés : au moins la moitié des valeurs lui sont inférieures ou égales, au moins la moitié supérieures ou égales.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p><strong>n impair</strong> → la valeur de rang (n+1)/2. <strong>n pair</strong> → la demi-somme des deux valeurs centrales.</p>
            <p>3, 7, 8, 12, 15, 20 : (8 + 12) ÷ 2 = <strong>10</strong> — une médiane peut ne pas figurer dans la série.</p>
          </div>
        ),
      },
      {
        id: 'choisir-position',
        type: 'methodes',
        title: 'Moyenne ou médiane ?',
        summary: 'Médiane quand la série contient des valeurs extrêmes ; moyenne quand on a besoin du total (elle seule le restitue).',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Salaires avec trois dirigeants à 40 000 € : la <strong>médiane</strong> décrit le salaire habituel.</p>
            <p>Masse salariale à budgéter : la <strong>moyenne</strong>, car moyenne × effectif = total.</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'quartiles',
        type: 'concepts',
        title: 'Quartiles Q1 et Q3',
        summary: 'Q1 : au moins un quart de l’effectif lui est inférieur ou égal. Q3 : au moins trois quarts. Rangs ⌈n/4⌉ et ⌈3n/4⌉.',
        visual: <MiniSeries band={[12, 25]} marks={[{ v: 12, label: 'Q1', color: '#7c3aed' }, { v: 25, label: 'Q3', color: '#7c3aed' }]} />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-sky-100 p-3 text-center">
              <MathText>{'$$\\text{rang}(Q_1) = \\left\\lceil \\frac{n}{4} \\right\\rceil \\qquad \\text{rang}(Q_3) = \\left\\lceil \\frac{3n}{4} \\right\\rceil$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              n = 20 : rang de Q1 = 5, rang de Q3 = 15 — Q1 et Q3 sont des <strong>valeurs de la série</strong>, on n’interpole pas.
              Le rang non entier s’arrondit toujours <strong>au-dessus</strong>.
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Les tableurs utilisent une autre convention (interpolation) : leurs résultats peuvent différer de ceux attendus au lycée.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la bande violette qui contient la moitié centrale des pastilles.</div>
          </div>
        ),
      },
      {
        id: 'etendue-interquartile',
        type: 'formules',
        title: 'Étendue et écart interquartile',
        summary: 'Étendue = max − min (sensible aux extrêmes). Écart interquartile = Q3 − Q1 (le cœur de la série, robuste).',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>2de A : étendue 40 − 5 = <strong>35 min</strong>, écart interquartile 25 − 12 = <strong>13 min</strong>.</p>
            <p>Un élève qui déménage à 120 min fait passer l’étendue à 115 min, sans changer l’écart interquartile.</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'ecart-type',
        type: 'concepts',
        title: 'Écart type',
        summary: 'La distance typique à la moyenne, dans l’unité des données. Petit = série resserrée, la moyenne résume bien.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 text-center">
              <MathText>{'$$\\sigma = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n}}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              On élève les écarts au carré pour que les négatifs ne compensent pas les positifs (leur somme vaut
              toujours 0), on en prend la moyenne — la <strong>variance</strong> — puis la racine carrée pour
              retrouver l’unité de départ.
            </p>
            <p className="text-sm text-slate-700">2, 4, 4, 4, 5, 5, 7, 9 : moyenne 5, variance 4, écart type <strong>2</strong>.</p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Ne pas confondre variance (en unité²) et écart type (en unité) : l’écart type est la racine de la variance.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la bande verte qui maigrit quand on resserre les pastilles.</div>
          </div>
        ),
      },
      {
        id: 'mem-deux-nombres',
        type: 'memoriser',
        title: '⭐ Toujours deux nombres',
        summary: 'Une série se résume par une POSITION (moyenne ou médiane) et une DISPERSION (écart type ou Q3 − Q1).',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">position + dispersion</div>
            <p className="text-xs text-rose-700">moyenne &amp; écart type · ou · médiane &amp; écart interquartile</p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'robustesse',
        type: 'regles',
        title: 'Robustesse : qui résiste à une valeur extrême',
        summary: 'Médiane et écart interquartile sont robustes ; moyenne, étendue et écart type ne le sont pas.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Robustes</strong> — médiane, écart interquartile : ils comptent des <em>effectifs</em>.
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                <strong>Sensibles</strong> — moyenne, étendue, écart type : ils utilisent les <em>valeurs</em>.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Ajouter un élève à 120 min à la 2de A : moyenne 19,15 → <strong>23,95 min</strong>, médiane
              <strong> inchangée à 18 min</strong>, écart interquartile inchangé à 13 min.
            </p>
          </div>
        ),
      },
      {
        id: 'linearite-moyenne',
        type: 'regles',
        title: 'Linéarité de la moyenne',
        summary: 'Ajouter b à toutes les valeurs ajoute b à la moyenne ; multiplier par a multiplie la moyenne par a. La dispersion, elle, ne bouge pas par translation.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-cyan-100 p-3 text-center">
              <MathText>{'$$\\overline{x + b} = \\bar{x} + b \\qquad \\overline{a x} = a\\,\\bar{x}$$'}</MathText>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
                <strong>Translation</strong> (+ b) : moyenne et médiane suivent ; écart type et Q3 − Q1 <strong>inchangés</strong>.
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
                <strong>Dilatation</strong> (× a) : position ET dispersion sont multipliées par a.
              </div>
            </div>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'methode-comparer',
        type: 'methodes',
        title: 'Comparer deux séries',
        summary: 'Croiser un indicateur de position et un de dispersion, puis vérifier que l’écart observé est grand devant la dispersion.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Comparer les positions (moyennes, ou médianes si des extrêmes existent).</li>
              <li>Comparer les dispersions (écarts types, ou écarts interquartiles).</li>
              <li>Conclure — et <strong>refuser de conclure</strong> si l’écart est minuscule devant la dispersion.</li>
            </ol>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              2de A et 2de B ont des moyennes de 19,15 et 19,10 min : l’écart de 0,05 min ne permet aucune conclusion.
              En revanche leurs écarts types (8,97 et 2,98 min) les distinguent nettement.
            </div>
          </div>
        ),
      },
    ],
  },
};
