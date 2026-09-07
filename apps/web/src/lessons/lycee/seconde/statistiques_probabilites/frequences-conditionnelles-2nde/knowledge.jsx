import React from 'react';
import MathText from '../../../../common/components/MathText';

/** Connaissances de « Fréquences conditionnelles » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */

/** Un tableau miniature dont on éclaire la référence : la figure de la leçon. */
const MiniRef = ({ mode = 'col' }) => {
  const cells = [[100, 48, 12], [40, 24, 16]];
  const cw = 34; const ch = 20; const x0 = 40; const y0 = 18;
  const litCol = 0; const litRow = 0;
  return (
    <svg viewBox="0 0 214 92" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 214 }}>
      {['2de', '1re', 'T'].map((c, j) => (
        <text key={c} x={x0 + j * cw + cw / 2} y={y0 - 4} textAnchor="middle" fontSize="9" fontWeight="700"
          fill={mode === 'col' && j === litCol ? '#4f46e5' : '#64748b'}>{c}</text>
      ))}
      {['bus', 'vélo'].map((r, i) => (
        <g key={r}>
          <text x={x0 - 5} y={y0 + i * ch + 14} textAnchor="end" fontSize="9" fontWeight="700"
            fill={mode === 'row' && i === litRow ? '#4f46e5' : '#64748b'}>{r}</text>
          {cells[i].map((v, j) => {
            const inRef = mode === 'total' || (mode === 'col' && j === litCol) || (mode === 'row' && i === litRow);
            const isNum = i === 0 && j === 0;
            return (
              <g key={j}>
                <rect x={x0 + j * cw} y={y0 + i * ch} width={cw} height={ch}
                  fill={isNum ? '#4f46e5' : inRef ? '#e0e7ff' : '#fff'} stroke="#cbd5e1" strokeWidth="1" />
                <text x={x0 + j * cw + cw / 2} y={y0 + i * ch + 14} textAnchor="middle" fontSize="9"
                  fontWeight={isNum ? '800' : '400'} fill={isNum ? '#fff' : '#334155'}>{v}</text>
              </g>
            );
          })}
        </g>
      ))}
      <text x={x0} y={82} fontSize="9" fill="#4f46e5" fontWeight="700">
        {mode === 'total' ? '100 / 400 = 25 %' : mode === 'col' ? '100 / 200 = 50 %' : '100 / 160 = 62,5 %'}
      </text>
    </svg>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'population-reference',
        type: 'concepts',
        title: 'La population de référence',
        summary: 'Une fréquence n’existe pas sans un groupe de référence : c’est le dénominateur, et c’est lui qui change tout.',
        visual: <MiniRef mode="col" />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Les mêmes <strong>100 élèves</strong> (en 2de et usagers du bus) valent <strong>25 %</strong> de
              l’ensemble, <strong>50 %</strong> parmi les 200 élèves de 2de, et <strong>62,5 %</strong> parmi les
              160 usagers du bus. Le numérateur ne bouge pas.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Un pourcentage sans référence explicite ne veut rien dire. Chercher toujours : <strong>divisé par quoi ?</strong>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la même case, trois références, trois pourcentages.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'trois-frequences',
        type: 'regles',
        title: 'Marginale, conjointe, conditionnelle',
        summary: 'Elles se distinguent par le dénominateur : le total pour les deux premières, le groupe de référence pour la troisième.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-center">
              <MathText>{'$$f = \\frac{\\text{effectif}}{\\text{effectif de référence}}$$'}</MathText>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900"><strong>Marginale</strong> — modalité ÷ total : 160/400 = 40 % prennent le bus.</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800"><strong>Conjointe</strong> — case ÷ total : 100/400 = 25 % sont en 2de ET en bus.</div>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-900"><strong>Conditionnelle</strong> — case ÷ ligne ou colonne : 100/200 = 50 % des 2de prennent le bus.</div>
            </div>
          </div>
        ),
      },
      {
        id: 'somme-conditionnelles',
        type: 'regles',
        title: 'Les conditionnelles d’une même condition somment à 1',
        summary: 'Elles répartissent tout le groupe de référence. On ne peut jamais additionner deux fréquences de dénominateurs différents.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Parmi les 2de : 50 % bus + 20 % vélo + 10 % voiture + 20 % à pied = 100 %.</p>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">
              Additionner « 25 % des demi-pensionnaires » et « 40 % des externes » n’a aucun sens : il faut
              repasser par les effectifs.
            </div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'inversion-condition',
        type: 'regles',
        title: '« Parmi les A, les B » ≠ « parmi les B, les A »',
        summary: 'Inverser la condition change le dénominateur, donc la question et la réponse.',
        visual: <MiniRef mode="row" />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              La part du bus parmi les 2de vaut <strong>50 %</strong> (100/200) ; la part des 2de parmi les usagers
              du bus vaut <strong>62,5 %</strong> (100/160). Même numérateur, dénominateurs différents.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              « 90 % des accidents graves impliquent une voiture » ne dit <strong>rien</strong> de la part des
              trajets en voiture qui finissent en accident. C’est l’erreur d’inversion.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le bouton qui bascule la condition, et le pourcentage qui saute.</div>
          </div>
        ),
      },
      {
        id: 'comparer-sous-populations',
        type: 'methodes',
        title: 'Comparer deux sous-populations',
        summary: 'Des effectifs bruts ne se comparent qu’à groupes de tailles égales ; sinon on compare des fréquences conditionnelles.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>20 élèves de 2de sur 200 en voiture (10 %) contre 40 de terminale sur 80 (50 %) : deux fois plus en effectif, <strong>cinq fois plus</strong> en part.</p>
          </div>
        ),
      },
      {
        id: 'mem-parmi',
        type: 'memoriser',
        title: '⭐ Le mot « parmi » désigne le dénominateur',
        summary: 'Repérer « parmi les… » ou « des… » dans la phrase : ce groupe est la population de référence.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">parmi les X, la part de Y</div>
            <p className="text-xs text-rose-700">numérateur = X et Y · dénominateur = X</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'frequences-vers-effectifs',
        type: 'formules',
        title: 'Des fréquences aux effectifs',
        summary: 'effectif = fréquence × effectif de référence — encore faut-il identifier la bonne référence.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 text-center">
              <MathText>{'$$\\text{effectif} = f \\times \\text{effectif de référence}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              500 élèves, 60 % de demi-pensionnaires → 300. Parmi eux 25 % en association → 0,25 × <strong>300</strong> = 75
              (et non 0,25 × 500 = 125).
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Chaque pourcentage a SA référence : celle que désigne la phrase, pas le total par défaut.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-completer-tableau',
        type: 'methodes',
        title: 'Compléter un tableau à partir de pourcentages',
        summary: 'Traduire chaque pourcentage en effectif avec sa propre référence, puis compléter par différences.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Poser l’effectif total.</li>
              <li>Calculer les marges avec les fréquences marginales.</li>
              <li>Calculer chaque case avec la conditionnelle de SA référence.</li>
              <li>Compléter le reste par différences, puis vérifier que les marges tombent juste.</li>
            </ol>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'lire-un-article',
        type: 'methodes',
        title: 'Vérifier une affirmation chiffrée',
        summary: 'Se demander d’abord quel dénominateur la phrase suppose, puis retrouver ce quotient dans le tableau.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>« 60 % des garçons sont en club » → 96/160 ✓. « Donc 60 % des inscrits sont des garçons » → faux : 96/180 ≈ 53 %.</p>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              La première question à poser devant un pourcentage n’est pas « est-ce vrai ? » mais « par quoi divise-t-il ? ».
            </div>
          </div>
        ),
      },
    ],
  },
};
