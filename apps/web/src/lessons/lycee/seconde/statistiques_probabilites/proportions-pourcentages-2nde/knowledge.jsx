import React from 'react';
import MathText from '../../../../common/components/MathText';

/** Connaissances de « Proportions et pourcentages » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */

/** Barre part/tout : la figure de la leçon, réutilisée par plusieurs items. */
const ShareBar = ({ p, label, color = '#4f46e5', width = 210 }) => (
  <svg viewBox={`0 0 ${width} 62`} aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: width }}>
    <rect x={0} y={10} width={width} height={30} fill="#e2e8f0" rx="5" />
    <rect x={0} y={10} width={width * p} height={30} fill={color} rx="5" />
    <line x1={width * p} y1={4} x2={width * p} y2={46} stroke="#1e293b" strokeWidth="2" />
    <text x={width / 2} y={57} textAnchor="middle" fontSize="10" fill="#64748b">{label}</text>
  </svg>
);

/** L'axe des coefficients, pivot en 1 — le repère visuel du module 5. */
const CoefAxis = ({ k, width = 220 }) => {
  const lo = 0.4; const hi = 2.1;
  const x = (v) => ((v - lo) / (hi - lo)) * (width - 16) + 8;
  return (
    <svg viewBox={`0 0 ${width} 54`} aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: width }}>
      <line x1={8} y1={30} x2={width - 8} y2={30} stroke="#475569" strokeWidth="1.5" />
      <line x1={x(1)} y1={16} x2={x(1)} y2={38} stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
      <text x={x(1)} y={50} textAnchor="middle" fontSize="9" fill="#64748b">1</text>
      <text x={x(0.6)} y={50} textAnchor="middle" fontSize="9" fill="#e11d48">baisse</text>
      <text x={x(1.7)} y={50} textAnchor="middle" fontSize="9" fill="#059669">hausse</text>
      <circle cx={x(k)} cy={30} r="6" fill={k > 1 ? '#059669' : k < 1 ? '#e11d48' : '#64748b'} stroke="#fff" strokeWidth="2" />
      <text x={x(k)} y={12} textAnchor="middle" fontSize="11" fontWeight="800" fill={k > 1 ? '#059669' : '#e11d48'}>×{k}</text>
    </svg>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'proportion-reference',
        type: 'concepts',
        title: 'Une proportion, et sa référence',
        summary: 'Un pourcentage n’a de sens que rapporté à un tout : c’est ce tout — la référence — qui décide de la valeur.',
        visual: <ShareBar p={0.6} label="480 sur 800 = 60 %" />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Les mêmes 120 internes valent <strong>25 %</strong> des 480 demi-pensionnaires, mais <strong>15 %</strong> des
              800 élèves. Le numérateur n’a pas bougé : c’est le <strong>tout de référence</strong> qui change tout.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              « 30 % » seul ne désigne aucune quantité. Toujours se demander : <strong>30 % de quoi ?</strong>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la barre du lycée, et la barre plus petite dessinée en dessous.</div>
          </div>
        ),
      },
      {
        id: 'vocab-part-tout',
        type: 'vocabulaire',
        title: 'Part, tout, proportion',
        summary: 'La part est le sous-groupe, le tout est la population de référence, la proportion est leur quotient.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>On dit indifféremment <strong>proportion</strong>, <strong>part</strong> ou <strong>fréquence</strong> pour ce quotient. Une proportion est un nombre <strong>sans unité</strong>, compris entre 0 et 1 lorsque la part est incluse dans le tout.</p>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">« Parmi », « sur », « d’entre eux » signalent la référence dans une phrase.</div>
          </div>
        ),
      },
      {
        id: 'mem-de-quoi',
        type: 'memoriser',
        title: '⭐ Un pourcentage est toujours un pourcentage DE quelque chose',
        summary: 'Avant tout calcul : identifier le tout de référence.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">% de quoi ?</div>
            <p className="text-xs text-rose-700">La question à se poser avant chaque calcul de cette leçon.</p>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'formule-proportion',
        type: 'formules',
        title: 'Proportion, dans les deux sens',
        summary: 'p = partie / tout ; partie = p × tout ; tout = partie / p.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-center">
              <MathText>{'$$p = \\frac{\\text{partie}}{\\text{tout}} \\qquad \\text{partie} = p \\times \\text{tout} \\qquad \\text{tout} = \\frac{\\text{partie}}{p}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">189 élèves représentent 42 % du lycée : le lycée compte 189 ÷ 0,42 = <strong>450</strong> élèves.</p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Le tout est toujours <strong>plus grand</strong> que la part : si le résultat est plus petit, l’opération est inversée.
            </div>
          </div>
        ),
      },
      {
        id: 'trois-ecritures',
        type: 'methodes',
        title: 'Passer d’une écriture à l’autre',
        summary: 'Fraction → décimal : on divise. Décimal → pourcentage : on multiplie par 100.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-center">
              <MathText>{'$$\\frac{3}{8} = 0{,}375 = 37{,}5\\,\\%$$'}</MathText>
            </div>
            <p>Un pourcentage est une fraction de dénominateur 100 : 8 % = 8/100 = 0,08.</p>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">
              0,08 vaut <strong>8 %</strong> et non 0,8 % : compter les rangs après la virgule plutôt que déplacer au jugé.
            </div>
          </div>
        ),
      },
      {
        id: 'vocab-pourcentage',
        type: 'vocabulaire',
        title: 'Pour cent',
        summary: '« Pour cent » veut dire « sur cent » : le symbole % remplace la division par 100.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Une proportion peut dépasser 100 % : 1,25 = 125 %, lorsque la quantité comparée est plus grande que la référence (par exemple un effectif comparé à celui d’une autre année).</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'proportion-de-proportion',
        type: 'regles',
        title: 'Les proportions emboîtées se multiplient',
        summary: 'Une part d’une part : p₁ × p₂, et le résultat se rapporte au tout de DÉPART.',
        visual: <ShareBar p={0.15} label="0,60 × 0,25 = 15 % du lycée" color="#0ea5e9" />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-sky-100 p-3 text-center">
              <MathText>{'$$0{,}60 \\times 0{,}25 = 0{,}15$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              60 % des élèves sont demi-pensionnaires ; 25 % de ceux-là sont internes. Les internes représentent
              {' '}<strong>15 % du lycée</strong> — et toujours 25 % des demi-pensionnaires. Les deux phrases sont vraies,
              elles n’ont simplement pas la même référence.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Jamais 85 % (la somme), jamais 35 % (la différence) : un sous-groupe est <strong>plus petit que chacun</strong> des deux groupes.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la petite barre bleue, toujours plus courte que la barre violette.</div>
          </div>
        ),
      },
      {
        id: 'methode-remises-successives',
        type: 'methodes',
        title: 'Deux réductions l’une après l’autre',
        summary: 'Chaque remise porte sur le prix courant : on multiplie les coefficients, on n’additionne pas les taux.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>200 € avec −30 % puis −20 % : 200 × 0,70 = 140, puis 140 × 0,80 = <strong>112 €</strong>.</p>
            <p>La remise totale vaut 88 € sur 200, soit <strong>44 %</strong> — et non 50 %.</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'etat-vs-variation',
        type: 'concepts',
        title: 'État ou variation : deux « % » différents',
        summary: 'Une proportion décrit un état (part d’un tout) ; une évolution décrit un changement (rapporté au départ).',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
                <strong>État</strong> — « 62 % des élèves sont demi-pensionnaires » : il existe un tout (les élèves).
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Variation</strong> — « les inscriptions ont augmenté de 8 % » : pas de tout, mais une valeur d’avant.
              </div>
            </div>
            <p className="text-sm text-slate-700">Le test qui tranche : <strong>« de quoi ce pourcentage est-il une part ? »</strong> Si la question n’a pas de réponse, c’est une variation.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux cases, jaune et rose, qui n’affichent jamais le même nombre.</div>
          </div>
        ),
      },
      {
        id: 'point-vs-pourcent',
        type: 'regles',
        title: 'Point de pourcentage ≠ pour cent',
        summary: 'De 20 % à 25 % : +5 POINTS (différence des états) et +25 % (évolution relative).',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-amber-100 p-3 text-center">
              <MathText>{'$$25 - 20 = 5 \\text{ points} \\qquad \\frac{25 - 20}{20} = 0{,}25 = +25\\,\\%$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">Les deux nombres décrivent le même passage. Ils ne coïncident que si la valeur de départ vaut 100 %.</p>
          </div>
        ),
      },
      {
        id: 'formule-taux-evolution',
        type: 'formules',
        title: 'Taux d’évolution',
        summary: 't = (V_finale − V_initiale) / V_initiale — on divise toujours par la valeur de DÉPART.',
        body: (
          <div className="space-y-2">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 text-center">
              <MathText>{'$$t = \\frac{V_f - V_i}{V_i} \\qquad 240 \\to 288 : t = \\frac{48}{240} = 0{,}20$$'}</MathText>
            </div>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">Diviser par la valeur d’arrivée est l’erreur la plus fréquente : elle donne 16,7 % au lieu de 20 %.</div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'coefficient-multiplicateur',
        type: 'concepts',
        title: 'Le coefficient multiplicateur',
        summary: 'k = 1 + t : le nombre par lequel on multiplie pour appliquer une évolution. Hausse k > 1, baisse 0 < k < 1.',
        visual: <CoefAxis k={0.85} />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-cyan-100 p-3 text-center">
              <MathText>{'$$k = 1 + t \\qquad V_f = V_i \\times k$$'}</MathText>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">+12 % → k = 1,12</div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">−12 % → k = 0,88 <em>(ce qui reste)</em></div>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Un coefficient est <strong>toujours positif</strong> : −20 % donne ×0,80, jamais ×0,20 ni ×(−0,20).
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le curseur qui traverse 1, jamais 0.</div>
          </div>
        ),
      },
      {
        id: 'methode-coefficient-taux',
        type: 'methodes',
        title: 'Passer du taux au coefficient, et retour',
        summary: 'k = 1 + t dans un sens, t = k − 1 dans l’autre.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>+3,5 % → k = 1,035 (et non 1,35). ×0,94 → t = −0,06, soit une baisse de 6 %.</p>
            <p>Appliquer : un loyer de 640 € qui augmente de 3,5 % devient 640 × 1,035 = <strong>662,40 €</strong>.</p>
          </div>
        ),
      },
      {
        id: 'mem-k-1-plus-t',
        type: 'memoriser',
        title: '⭐ k = 1 + t',
        summary: 'Le pivot est 1 : au-dessus ça monte, en dessous ça descend.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-2xl font-black text-rose-700">k = 1 + t</div>
            <p className="text-xs text-rose-700">+20 % → ×1,20 · −20 % → ×0,80 · 0 % → ×1</p>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'methode-lire-enonce',
        type: 'methodes',
        title: 'Lire un énoncé qui contient des pourcentages',
        summary: 'Repérer la référence de chaque %, puis décider s’il décrit un état ou une variation — avant de calculer.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Quel est le <strong>tout</strong> de ce pourcentage ? (« parmi », « d’entre eux », « du deuxième article »)</li>
              <li>Est-ce un <strong>état</strong> ou une <strong>variation</strong> ?</li>
              <li>État → multiplier ou diviser par p. Variation → multiplier par k = 1 + t.</li>
            </ol>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              « −40 % sur le deuxième article » : la référence est le second article seul — la remise vaut 20 % du total payé.
            </div>
          </div>
        ),
      },
    ],
  },
};
