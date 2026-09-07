import React from 'react';
import MathText from '../../../../common/components/MathText';

/** Connaissances de « Tests diagnostiques » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */

/**
 * Les deux populations de référence : la colonne (les atteints) et la ligne
 * (les positifs). C'est la figure de la leçon — la même case 99 divisée par
 * deux dénominateurs radicalement différents.
 */
const MiniTable = ({ mode = 'col' }) => {
  const cw = 52; const ch = 22; const x0 = 46; const y0 = 20;
  const cells = [[99, 495], [1, 9405]];
  return (
    <svg viewBox="0 0 214 92" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 214 }}>
      {['atteints', 'sains'].map((c, j) => (
        <text key={c} x={x0 + j * cw + cw / 2} y={y0 - 5} textAnchor="middle" fontSize="8.5" fontWeight="700"
          fill={mode === 'col' && j === 0 ? '#0284c7' : '#64748b'}>{c}</text>
      ))}
      {['test +', 'test −'].map((r, i) => (
        <g key={r}>
          <text x={x0 - 4} y={y0 + i * ch + 15} textAnchor="end" fontSize="8.5" fontWeight="700"
            fill={mode === 'row' && i === 0 ? '#059669' : '#64748b'}>{r}</text>
          {cells[i].map((v, j) => {
            const inRef = (mode === 'col' && j === 0) || (mode === 'row' && i === 0);
            const isNum = i === 0 && j === 0;
            return (
              <g key={j}>
                <rect x={x0 + j * cw} y={y0 + i * ch} width={cw} height={ch}
                  fill={isNum ? (mode === 'col' ? '#0284c7' : '#059669') : inRef ? (mode === 'col' ? '#e0f2fe' : '#d1fae5') : '#fff'}
                  stroke="#cbd5e1" strokeWidth="1" />
                <text x={x0 + j * cw + cw / 2} y={y0 + i * ch + 15} textAnchor="middle" fontSize="9"
                  fontWeight={isNum ? '800' : '400'} fill={isNum ? '#fff' : '#334155'}>{v}</text>
              </g>
            );
          })}
        </g>
      ))}
      <text x={x0} y={84} fontSize="9" fontWeight="700" fill={mode === 'col' ? '#0284c7' : '#059669'}>
        {mode === 'col' ? '99 / 100 = 99 % (sensibilité)' : '99 / 594 ≈ 17 % (VPP)'}
      </text>
    </svg>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'quatre-groupes',
        type: 'concepts',
        title: 'Un test partage la population en quatre',
        summary: 'Deux états de santé × deux résultats possibles : le tableau du test a quatre cases, et c’est en effectifs qu’il se lit le mieux.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Sur 10 000 personnes, avec 1 % d’atteints, un test sensible à 99 % et spécifique à 95 % donne :
              <strong> 99</strong> vrais positifs, <strong>495</strong> faux positifs, <strong>1</strong> faux
              négatif, <strong>9 405</strong> vrais négatifs.
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Raisonner en <strong>effectifs</strong> plutôt qu’en pourcentages rend le phénomène évident : les
              faux positifs sont nombreux parce que les personnes saines sont nombreuses.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les pastilles orange qui noient les rouges.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'vocabulaire-cases',
        type: 'vocabulaire',
        title: 'Vrai / faux, positif / négatif',
        summary: 'Le nom dit ce que le test affiche ; l’adjectif dit s’il avait raison.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>· <strong>Faux positif</strong> : le test dit « positif », la personne est saine.</p>
            <p>· <strong>Faux négatif</strong> : le test dit « négatif », la personne est atteinte.</p>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              Rien à mémoriser : les deux mots se lisent séparément.
            </div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'sensibilite-specificite',
        type: 'formules',
        title: 'Sensibilité et spécificité',
        summary: 'Deux qualités du test, calculées en divisant par une colonne — donc en connaissant déjà l’état de santé.',
        visual: <MiniTable mode="col" />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-sky-100 p-3 text-center space-y-1">
              <MathText>{'$$\\text{sensibilité} = P_{\\text{atteint}}(+) = \\frac{VP}{VP+FN}$$'}</MathText>
              <MathText>{'$$\\text{spécificité} = P_{\\text{sain}}(-) = \\frac{VN}{VN+FP}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              Ici 99/100 = <strong>99 %</strong> et 9 405/9 900 = <strong>95 %</strong>.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Ces deux nombres supposent connu l’état de santé — précisément ce que la personne testée ignore.
            </div>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'valeur-predictive',
        type: 'formules',
        title: 'La valeur prédictive positive',
        summary: 'P(atteint | test +) se calcule sur la LIGNE des positifs, et dépend fortement de la prévalence.',
        visual: <MiniTable mode="row" />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 text-center">
              <MathText>{'$$P_{+}(\\text{atteint}) = \\frac{VP}{VP + FP}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              99/594 ≈ <strong>16,7 %</strong> — alors que la sensibilité vaut 99 %. Même case au numérateur,
              deux dénominateurs.
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Avec une prévalence de 40 % au lieu de 1 %, la même VPP passe à <strong>93 %</strong> : elle
              n’est <strong>pas</strong> une propriété du test.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le curseur de prévalence, et le grand nombre qui bascule.</div>
          </div>
        ),
      },
      {
        id: 'mem-inversion-test',
        type: 'memoriser',
        title: '⭐ « Détecte 99 % des malades » ≠ « un positif est malade à 99 % »',
        summary: 'La première phrase divise par les malades, la seconde par les positifs.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-base font-black text-rose-700">
              P<sub>atteint</sub>(test +) ≠ P<sub>test +</sub>(atteint)
            </div>
            <p className="text-xs text-rose-700">99 % contre 17 % : ce n’est pas la même question.</p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'methode-affirmation-test',
        type: 'methodes',
        title: 'Analyser une affirmation sur un test',
        summary: 'Repérer la population de référence du pourcentage cité, et la comparer à celle de la question posée.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Reconstituer les quatre effectifs sur une population de 10 000.</li>
              <li>Repérer sur quelle population le pourcentage cité est calculé.</li>
              <li>Vérifier si la question porte sur cette même population.</li>
              <li>Se demander si la <strong>prévalence</strong> a été prise en compte.</li>
            </ol>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              Quand la maladie est rare, un test négatif est très fiable (ici plus de 99,9 %) alors qu’un test
              positif l’est peu.
            </div>
          </div>
        ),
      },
    ],
  },
};
