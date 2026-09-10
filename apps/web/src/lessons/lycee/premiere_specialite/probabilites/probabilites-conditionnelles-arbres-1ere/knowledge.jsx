import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de « Probabilités conditionnelles : arbres et probabilités
 * totales » — SOURCE UNIQUE (docs/architecture/KNOWLEDGE_MAP.md). Le texte
 * d'une brique vit ICI et nulle part ailleurs ; les modules la posent par son
 * id, au moment où le geste vient de lui donner du sens.
 *
 * CE QUI N'EST PAS ICI, ET POURQUOI. L'univers restreint, la notation P_A(B),
 * la non-symétrie du conditionnement, la structure de l'arbre, la somme des
 * branches, le produit le long d'un chemin et la somme des chemins sont des
 * acquis de SECONDE : ils sont en `priorKnowledge`, pas en briques. Réenseigner
 * ce que l'élève sait ferait de la Première une révision.
 *
 * Ce que ces onze briques ajoutent, et que la 2de ne donne pas :
 *   · le dénominateur comme OBJET DE DÉCISION quand deux univers sont en
 *     concurrence sur les mêmes individus (le monde qui rétrécit) ;
 *   · la PHRASE qui nomme sa population de référence ;
 *   · la PARTITION, condition d'emploi de la somme, sur plus de deux parts ;
 *   · la FORMULE DES PROBABILITÉS TOTALES, absente du programme de 2de ;
 *   · le paradoxe du dépistage, sa conséquence la plus contre-intuitive.
 */

/** L'arbre du dépistage en miniature : les deux chemins « positif » éclairés. */
const MiniArbre = ({ lit = false }) => {
  const x0 = 12; const x1 = 78; const x2 = 146;
  const nodes = [
    { y: 26, label: 'M', p: '0,01', color: '#be123c' },
    { y: 74, label: 'M̄', p: '0,99', color: '#0284c7' },
  ];
  const leaves = [
    { from: 26, y: 14, l: '+', p: '0,99', prod: '0,0099', pos: true },
    { from: 26, y: 38, l: '−', p: '0,01', prod: '0,0001', pos: false },
    { from: 74, y: 62, l: '+', p: '0,02', prod: '0,0198', pos: true },
    { from: 74, y: 86, l: '−', p: '0,98', prod: '0,9702', pos: false },
  ];
  return (
    <svg viewBox="0 0 214 104" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 214 }}>
      <circle cx={x0} cy={50} r="3.2" fill="#475569" />
      {nodes.map((n) => (
        <g key={n.label}>
          <line x1={x0} y1={50} x2={x1} y2={n.y} stroke="#94a3b8" strokeWidth="1.4" />
          <text x={(x0 + x1) / 2 - 2} y={(50 + n.y) / 2 - 3} fontSize="7.5" fontWeight="700" fill="#7c3aed">{n.p}</text>
          <circle cx={x1} cy={n.y} r="2.8" fill={n.color} />
          <text x={x1 - 10} y={n.y + 3} fontSize="8.5" fontWeight="700" fill={n.color}>{n.label}</text>
        </g>
      ))}
      {leaves.map((f, i) => {
        const on = lit && f.pos;
        return (
          <g key={i}>
            <line x1={x1} y1={f.from} x2={x2} y2={f.y} stroke={on ? '#c026d3' : '#cbd5e1'} strokeWidth={on ? 2.2 : 1.2} />
            <text x={(x1 + x2) / 2} y={(f.from + f.y) / 2 - 3} fontSize="7" fontWeight="700" fill={on ? '#a21caf' : '#94a3b8'}>{f.p}</text>
            <text x={x2 + 4} y={f.y + 3} fontSize="7.5" fontWeight={on ? '800' : '400'} fill={on ? '#a21caf' : '#64748b'}>
              {f.l} · {f.prod}
            </text>
          </g>
        );
      })}
      {lit && <text x={x1 - 6} y={101} fontSize="7.5" fontWeight="800" fill="#a21caf">0,0099 + 0,0198 = 0,0297</text>}
    </svg>
  );
};

/** Une population de 1000, deux découpes, deux dénominateurs concurrents. */
const MiniBarre = () => (
  <svg viewBox="0 0 214 92" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 214 }}>
    {/* Composition A : B = 200, dont 150 dans A */}
    <text x={0} y={9} fontSize="7.5" fontWeight="700" fill="#64748b">B = 200 habitants</text>
    <rect x={0} y={13} width={214} height={16} rx="3" fill="#e2e8f0" />
    <rect x={0} y={13} width={42.8} height={16} rx="3" fill="#4f46e5" />
    <rect x={0} y={13} width={32.1} height={16} rx="3" fill="#c026d3" />
    <text x={35} y={25} fontSize="7.5" fontWeight="800" fill="#0f172a">150 sur 200 = 75 %</text>
    {/* Composition B : B = 600, dont 150 dans A */}
    <text x={0} y={49} fontSize="7.5" fontWeight="700" fill="#64748b">B = 600 habitants</text>
    <rect x={0} y={53} width={214} height={16} rx="3" fill="#e2e8f0" />
    <rect x={0} y={53} width={128.4} height={16} rx="3" fill="#4f46e5" />
    <rect x={0} y={53} width={32.1} height={16} rx="3" fill="#c026d3" />
    <text x={35} y={65} fontSize="7.5" fontWeight="800" fill="#fff">150 sur 600 = 25 %</text>
    <text x={0} y={83} fontSize="7" fill="#a21caf" fontWeight="700">même 150 en magenta — deux dénominateurs</text>
    <text x={0} y={90} fontSize="6.5" fill="#94a3b8">le comptage n’a pas bougé, l’univers si</text>
  </svg>
);

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'denominateur-decide',
        type: 'concepts',
        title: 'C’est le dénominateur qui décide du pourcentage',
        summary:
          'Deux populations peuvent partager EXACTEMENT les mêmes individus à l’intersection et afficher des pourcentages tout différents : ce n’est pas le comptage qui change, c’est l’ensemble auquel on le rapporte.',
        visual: <MiniBarre />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              150 habitants font du vélo <em>et</em> vivent près du centre. Si « près du centre »
              compte 200 personnes, cela fait <strong>75 %</strong> ; si le même quartier en compte
              600, cela fait <strong>25 %</strong>. Le numérateur n’a pas bougé d’un individu.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Devant tout pourcentage, une seule question tient lieu de réflexe :
              <strong> rapporté à quel ensemble ?</strong> Sans réponse, le nombre ne veut rien dire.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux séparations qu’on fait glisser, et le même bloc magenta qui change de pourcentage.</div>
          </div>
        ),
      },
      {
        id: 'intersection-vs-conditionnelle',
        type: 'regles',
        title: 'Intersection et conditionnelle : même numérateur, deux questions',
        summary:
          'P(A ∩ B) se rapporte à la population entière ; P_B(A) se rapporte aux seuls individus de B. Les deux comptent les mêmes individus au numérateur.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border border-indigo-100 bg-white p-3 text-center">
              <MathText>{'$$P(A \\cap B) = \\frac{n(A \\cap B)}{n(\\text{tout})} \\qquad P_B(A) = \\frac{n(A \\cap B)}{n(B)}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              Sur 1 000 habitants dont 200 près du centre et 150 à la fois près du centre et
              cyclistes : P(A ∩ B) = 150/1 000 = <strong>0,15</strong> tandis que
              P<sub>B</sub>(A) = 150/200 = <strong>0,75</strong>.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Confondre les deux, c’est répondre à une autre question que celle posée : « quelle part
              de TOUS » n’est pas « quelle part DE CEUX-LÀ ».
            </div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'conditionnelle-sur-effectifs',
        type: 'methodes',
        title: 'Calculer une probabilité conditionnelle sur des effectifs',
        summary:
          'Repérer la condition, écrire son effectif au dénominateur, compter au numérateur ceux qui vérifient AUSSI l’événement, diviser.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Repérer la condition : les mots « sachant », « parmi », « on sait que », « il est… ».</li>
              <li>Écrire l’effectif de cette condition — c’est le dénominateur, et il ne changera plus.</li>
              <li>Compter au numérateur ceux qui vérifient aussi l’événement.</li>
              <li>Diviser, et VÉRIFIER que le résultat tient dans [0 ; 1].</li>
            </ol>
            <div className="rounded-xl border border-violet-100 bg-white p-3">
              Sur 100 000 personnes testées, 2 970 ont un test positif et 990 d’entre elles sont
              malades : <strong>990 / 2 970 ≈ 33,3 %</strong>. Le dénominateur n’est ni 100 000, ni
              1 000.
            </div>
          </div>
        ),
      },
      {
        id: 'phrase-population-reference',
        type: 'methodes',
        title: 'Dire une probabilité conditionnelle sans mentir',
        summary:
          'Une phrase juste commence par nommer la population de référence : « parmi les… ». Sans elle, le même nombre passe pour une autre affirmation.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
              ✔ « <strong>Parmi les personnes au test positif</strong>, une sur trois est malade. »
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
              ✘ « Le test se trompe une fois sur trois. » — cette phrase parle du test en général,
              donc d’un autre ensemble, et elle est fausse : le test se trompe sur 1 % des malades et
              2 % des bien portants.
            </div>
            <p>
              Écrire d’abord « parmi les … » force à choisir le dénominateur avant de parler, et
              rend l’erreur visible à la relecture.
            </p>
          </div>
        ),
      },
      {
        id: 'paradoxe-depistage',
        type: 'concepts',
        title: 'Le paradoxe du dépistage',
        summary:
          'Un test très fiable appliqué à une maladie rare produit une majorité de faux positifs : le petit pourcentage d’erreurs porte sur un ensemble énorme.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-violet-100 bg-white">
              <table className="w-full text-center text-xs tabular-nums">
                <thead className="bg-slate-50 text-slate-500">
                  <tr><th className="px-2 py-1 text-left">sur 100 000</th><th className="px-2 py-1">test +</th><th className="px-2 py-1">test −</th></tr>
                </thead>
                <tbody>
                  <tr className="border-t"><th className="px-2 py-1 text-left font-semibold text-rose-700">malades (1 000)</th><td className="font-bold">990</td><td>10</td></tr>
                  <tr className="border-t"><th className="px-2 py-1 text-left font-semibold text-sky-700">bien portants (99 000)</th><td className="font-bold">1 980</td><td>97 020</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              2 % de 99 000 bien portants font <strong>1 980</strong> alertes injustifiées, quand
              99 % de 1 000 malades n’en font que <strong>990</strong> de justifiées. Sur les 2 970
              tests positifs, <strong>deux sur trois</strong> concernent une personne en bonne santé.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Rien n’est truqué : le test est bien fiable à 99 %. C’est la RARETÉ de la maladie qui
              rend le petit taux d’erreur majoritaire en nombre.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : 990 contre 1 980, et le tiers qui en sort.</div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'chaque-poids-sa-branche',
        type: 'regles',
        title: 'Chaque poids a une branche, et une seule',
        summary:
          'Un même nombre peut peser deux branches différentes sans y jouer le même rôle : le premier niveau porte des probabilités sur toute la population, le second des conditionnelles.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Dans le dépistage, <strong>0,99</strong> apparaît deux fois : sur la branche
              « bien portant » du premier niveau, où il vaut P(M̄) — 99 % de la population ; et sur
              la branche « positif » partant de « malade », où il vaut P<sub>M</sub>(+) — 99 % des
              malades <em>seulement</em>.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Reconnaître un poids à sa VALEUR est l’erreur : c’est sa PLACE qui dit ce qu’il pèse et
              sur quel ensemble il se calcule.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le même 0,99 accroché à deux endroits, pour deux populations.</div>
          </div>
        ),
      },
      {
        id: 'arbre-controle',
        type: 'methodes',
        title: 'Contrôler un arbre avant de s’en servir',
        summary:
          'Trois vérifications, dans cet ordre : les branches de chaque nœud somment à 1, l’ordre des niveaux suit la chronologie, et le second niveau porte des conditionnelles.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Additionner les branches de CHAQUE nœud : chaque somme doit valoir 1 exactement.</li>
              <li>Vérifier l’ordre : on place d’abord l’étape dont la suivante dépend.</li>
              <li>Relire chaque poids du second niveau en disant « parmi ceux-là… ».</li>
            </ol>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              Un arbre qui échoue au premier contrôle est faux : inutile de calculer avec.
            </div>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'arbre-instrument',
        type: 'concepts',
        title: 'L’arbre comme instrument de calcul',
        summary:
          'L’arbre n’est pas un schéma d’illustration : c’est un dispositif qui rend le calcul sûr, parce qu’il montre TOUS les chemins et garantit qu’aucun n’est compté deux fois.',
        visual: <MiniArbre />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Un chemin décrit une issue complète, et deux chemins distincts ne peuvent pas se
              produire ensemble. C’est ce qui autorise à <strong>multiplier</strong> le long d’un
              chemin puis à <strong>additionner</strong> entre les chemins, sans jamais compter un
              individu deux fois.
            </p>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              Le contrôle qui ne trompe pas : la somme de TOUS les produits terminaux vaut 1.
              Si elle ne les vaut pas, il manque un chemin ou un poids est faux.
            </div>
          </div>
        ),
      },
      {
        id: 'partition',
        type: 'vocabulaire',
        title: 'Une partition de l’univers',
        summary:
          'Des cas forment une partition quand ils recouvrent toute la population ET ne se chevauchent pas : chaque individu tombe dans un cas, et dans un seul.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Les trois fournisseurs d’un atelier forment une partition : chaque composant vient d’un
              fournisseur, et d’un seul. « Malade » et « bien portant » aussi — à deux parts.
            </p>
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Recouvrement complet</strong> — aucun individu n’est laissé de côté
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Sans chevauchement</strong> — aucun individu n’est compté deux fois
              </div>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              « Les élèves qui font du sport » et « les élèves qui font de la musique » ne forment
              PAS une partition : certains font les deux, d’autres ni l’un ni l’autre.
            </div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'probabilites-totales',
        type: 'formules',
        title: 'La formule des probabilités totales',
        summary:
          'Si A₁, …, Aₙ forment une partition de l’univers, alors P(B) = P(A₁) × P_A₁(B) + … + P(Aₙ) × P_Aₙ(B) : c’est la somme des chemins, écrite en une ligne.',
        visual: <MiniArbre lit />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-center">
              <MathText>{'$$P(B) = \\sum_{i} P(A_i) \\times P_{A_i}(B)$$'}</MathText>
            </div>
            <p>
              Trois fournisseurs livrant 60 %, 30 % et 10 % des composants, avec 2 %, 5 % et 10 % de
              défauts : 0,60 × 0,02 + 0,30 × 0,05 + 0,10 × 0,10 = <strong>0,037</strong>.
              Sur 10 000 composants, cela fait 120 + 150 + 100 = 370 défectueux.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              L’hypothèse n’est pas décorative : sans partition, additionner les chemins compterait
              certains individus deux fois, d’autres pas du tout.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois chemins qui découpent les 10 000 composants sans trou ni recouvrement.</div>
          </div>
        ),
      },
      {
        id: 'moyenne-nest-pas-la-somme-ponderee',
        type: 'regles',
        title: 'Moyenner les taux n’est pas les pondérer',
        summary:
          'Faire la moyenne simple des probabilités conditionnelles revient à traiter les parts comme si elles avaient toutes le même poids : c’est faux dès qu’elles n’en ont pas.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Taux de défaut 2 %, 5 % et 10 % : leur moyenne vaut <strong>5,7 %</strong>. La bonne
              réponse est <strong>3,7 %</strong> — car le fournisseur le plus fiable livre à lui seul
              60 % des composants.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Chaque taux doit être multiplié par le poids de la part sur laquelle il porte. La
              moyenne simple est le cas particulier où tous les poids sont égaux.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-probabilites-totales',
        type: 'methodes',
        title: 'Appliquer la formule des probabilités totales',
        summary:
          'Identifier la partition, poser l’arbre, multiplier le long de chaque chemin menant à l’événement, additionner ces produits, puis contrôler.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Identifier les cas qui partitionnent la population, et vérifier que leurs poids somment à 1.</li>
              <li>Poser l’arbre : les poids globaux au premier niveau, les conditionnels au second.</li>
              <li>Multiplier le long de CHAQUE chemin qui mène à l’événement.</li>
              <li>Additionner ces produits.</li>
              <li>Contrôler l’ordre de grandeur : le résultat est encadré par le plus petit et le plus grand des taux conditionnels.</li>
            </ol>
            <div className="rounded-xl border border-rose-100 bg-white p-3">
              Colis en retard : 0,50 × 0,05 + 0,30 × 0,10 + 0,20 × 0,25 = <strong>0,105</strong>.
              Contrôle : 0,105 est bien compris entre 0,05 et 0,25. ✔
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’encadrement qui attrape les erreurs de calcul d’un coup d’œil.</div>
          </div>
        ),
      },
      {
        id: 'mem-partition-puis-somme',
        type: 'memoriser',
        title: '⭐ Partition d’abord, somme ensuite',
        summary: 'On n’additionne des chemins qu’après avoir vérifié que les cas partitionnent l’univers.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">P(B) = Σ P(Aᵢ) × P<sub>Aᵢ</sub>(B)</div>
            <p className="text-xs text-rose-700">
              chaque individu dans un cas et un seul — sinon la somme ne veut rien dire
            </p>
          </div>
        ),
      },
    ],
  },
};
