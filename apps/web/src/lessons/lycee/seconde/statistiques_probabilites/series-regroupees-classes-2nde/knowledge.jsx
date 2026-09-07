import React from 'react';
import MathText from '../../../../common/components/MathText';

/** Connaissances de « Séries regroupées en classes » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */

/** Un mini-histogramme, figure récurrente de la leçon. */
const MiniHisto = ({ bars = [4, 39, 55, 64, 17, 13, 7, 1], width = 220, height = 92, densities = null, cumul = false }) => {
  const vals = densities ?? bars;
  const mx = Math.max(...vals);
  const bw = (width - 16) / vals.length;
  const H = height - 24;
  let run = 0;
  const total = bars.reduce((a, b) => a + b, 0);
  const pts = bars.map((b, i) => { run += b; return { x: 8 + (i + 1) * bw, y: 8 + H - (run / total) * H }; });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: width }}>
      {vals.map((v, i) => (
        <rect key={i} x={8 + i * bw} y={8 + H - (v / mx) * H} width={bw - 1} height={(v / mx) * H}
          fill="#38bdf8" fillOpacity="0.6" stroke="#0284c7" strokeWidth="1" />
      ))}
      {cumul && (
        <path d={[{ x: 8, y: 8 + H }, ...pts].map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
          fill="none" stroke="#c026d3" strokeWidth="2" />
      )}
      <line x1={8} y1={8 + H} x2={width - 8} y2={8 + H} stroke="#475569" strokeWidth="1.2" />
    </svg>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'regroupement-classes',
        type: 'concepts',
        title: 'Regrouper une série continue en classes',
        summary: 'Sur une variable continue, chaque valeur est unique : on découpe l’axe en tranches contiguës [a ; b[ pour rendre la série lisible.',
        visual: <MiniHisto />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              200 temps de recharge tous distincts : le tableau d’effectifs classique aurait 200 lignes d’effectif 1.
              Regroupés par tranches de 10 min, ils tiennent en <strong>huit classes</strong> et la forme apparaît.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Le regroupement fait <strong>perdre le détail</strong> : on ne sait plus qu’une durée est tombée dans
              telle tranche. Les indicateurs deviennent des <strong>estimations</strong>.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le curseur d’amplitude, de 2 min (peigne illisible) à 40 min (forme disparue).</div>
          </div>
        ),
      },
      {
        id: 'vocab-classe-amplitude',
        type: 'vocabulaire',
        title: 'Classe, amplitude, centre',
        summary: 'Classe [a ; b[ : a inclus, b exclu. Amplitude = b − a. Centre = (a + b)/2.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Les classes sont <strong>contiguës</strong> : la borne exclue d’une classe est la borne incluse de la suivante, pour qu’aucune valeur ne soit comptée deux fois ni oubliée.</p>
            <p>Seule la <strong>dernière</strong> classe est fermée à droite, sinon la valeur maximale ne serait dans aucune classe.</p>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">Le centre de [20 ; 30[ vaut 25 ; son amplitude vaut 10.</div>
          </div>
        ),
      },
      {
        id: 'choix-amplitude',
        type: 'methodes',
        title: 'Choisir l’amplitude',
        summary: 'Trop fine : autant de classes que de valeurs, illisible. Trop large : la forme disparaît. Viser quelques classes bien remplies.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Repère pratique : entre 5 et 12 classes pour une série de quelques centaines de données.</p>
            <p>L’amplitude est un <strong>choix</strong> du statisticien : deux découpages différents donnent deux images différentes de la même série.</p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'histogramme-aire',
        type: 'regles',
        title: 'Dans un histogramme, c’est l’AIRE qui représente l’effectif',
        summary: 'Hauteur = effectif ÷ amplitude. Sur des classes d’amplitudes égales, hauteur et effectif sont proportionnels ; sinon, non.',
        visual: <MiniHisto bars={[18, 34, 22, 16]} densities={[18, 34, 22, 4]} width={200} />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-center">
              <MathText>{'$$\\text{hauteur} = \\frac{\\text{effectif}}{\\text{amplitude}}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              Salaires : la classe [4 ; 8] compte 16 salariés mais, quatre fois plus large, elle est dessinée à la
              hauteur 16 ÷ 4 = <strong>4</strong>. Son aire vaut bien 4 × 4 = 16.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Comparer les hauteurs de deux classes d’amplitudes différentes ne compare pas leurs effectifs.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la barre large et basse des hauts salaires.</div>
          </div>
        ),
      },
      {
        id: 'lire-histogramme',
        type: 'methodes',
        title: 'Lire un histogramme',
        summary: 'Vérifier d’abord les amplitudes, puis lire les effectifs classe par classe, en additionnant pour couvrir plusieurs tranches.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>« Entre 40 et 60 min » couvre deux classes : 64 + 17 = <strong>81</strong> recharges.</p>
            <p>La <strong>classe modale</strong> est celle dont la barre est la plus haute — à condition que les amplitudes soient égales.</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'frequences-cumulees',
        type: 'concepts',
        title: 'Effectifs et fréquences cumulés croissants',
        summary: 'Le cumul à une borne compte tous les individus situés en dessous. Il croît de 0 % à 100 % et ne redescend jamais.',
        visual: <MiniHisto cumul />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Recharges : cumuls 4, 43, 98, 162, 179, 192, 199, 200. À 40 min, <strong>98 recharges</strong>
              (49 %) sont déjà comptées ; à 50 min, 162 (81 %).
            </p>
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
              Le polygone se lit dans les deux sens : d’une durée vers une fréquence, ou d’une fréquence vers une durée.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la lecture qui glisse le long de la courbe violette.</div>
          </div>
        ),
      },
      {
        id: 'polygone-cumule',
        type: 'methodes',
        title: 'Construire le polygone des fréquences cumulées',
        summary: 'Placer un point (borne supérieure de classe ; fréquence cumulée), partir de (borne inférieure de la 1re classe ; 0) et relier.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Les points se placent aux <strong>bornes supérieures</strong>, jamais aux centres : à la borne, toute la classe est comptée.</p>
            <p>La courbe part de 0 % à gauche et atteint 100 % à droite.</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'moyenne-estimee',
        type: 'formules',
        title: 'Moyenne estimée à partir des classes',
        summary: 'Chaque classe est représentée par son centre : x̄ ≈ Σ nᵢcᵢ / Σ nᵢ. Le résultat est une estimation.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 text-center">
              <MathText>{'$$\\bar{x} \\approx \\frac{n_1 c_1 + n_2 c_2 + \\dots + n_k c_k}{n_1 + n_2 + \\dots + n_k}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              Centres 5, 15, 25 d’effectifs 5, 15, 10 : (25 + 225 + 250) ÷ 30 ≈ <strong>16,67</strong>.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Ne pas moyenner les centres sans les pondérer : (5 + 15 + 25) ÷ 3 = 15 ignore les effectifs.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-estimation',
        type: 'memoriser',
        title: '⭐ Regroupé ⇒ estimé',
        summary: 'Dès que la série est regroupée, moyenne et médiane sont des estimations, jamais des valeurs exactes.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">classes ⇒ « estimée »</div>
            <p className="text-xs text-rose-700">Le mot doit apparaître dans la réponse : « la moyenne estimée vaut… »</p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'classe-mediane',
        type: 'concepts',
        title: 'Classe médiane',
        summary: 'La première classe dont la fréquence cumulée croissante atteint ou dépasse 50 %.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Recharges : à 40 min le cumul vaut 49 % — insuffisant ; il atteint 81 % dans [40 ; 50[, qui est donc la classe médiane.</p>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">
              Ne pas prendre la classe la plus proche de 50 % : il faut celle qui <strong>franchit</strong> le seuil.
            </div>
          </div>
        ),
      },
      {
        id: 'mediane-interpolee',
        type: 'methodes',
        title: 'Estimer la médiane par interpolation',
        summary: 'Dans la classe médiane, avancer proportionnellement au nombre d’individus qu’il reste à atteindre.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-cyan-100 p-3 text-center">
              <MathText>{'$$M \\approx a + \\frac{\\frac{N}{2} - N_{\\text{avant}}}{n_{\\text{classe}}} \\times (b - a)$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              Classe [20 ; 30[, 42 individus avant, 45 dedans, N = 100 : 20 + (8/45) × 10 ≈ <strong>21,8</strong>.
            </p>
            <p className="text-sm text-slate-700">C’est exactement la lecture du polygone cumulé à la hauteur 50 %.</p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              La médiane n’est pas le centre de sa classe : elle peut tomber tout près d’une borne.
            </div>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'lire-honnetement',
        type: 'regles',
        title: 'Ce qu’une série regroupée ne dit plus',
        summary: 'Les effectifs par classe et leurs cumuls sont exacts ; tout ce qui descend sous la classe est perdu.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="grid gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Exact</strong> — « 42 % des individus sont en dessous de 20 ».
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                <strong>Impossible</strong> — « la valeur la plus fréquente est 17 », « la médiane vaut 21,83 », « aucun individu ne vaut 25 ».
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
};
