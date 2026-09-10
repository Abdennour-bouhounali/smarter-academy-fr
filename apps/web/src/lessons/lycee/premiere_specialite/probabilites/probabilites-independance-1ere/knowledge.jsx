import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de « Probabilités : inverser le conditionnement et
 * l'indépendance » — SOURCE UNIQUE (docs/architecture/KNOWLEDGE_MAP.md). Le
 * texte d'une brique vit ICI et nulle part ailleurs ; les modules la posent par
 * son id, au moment où le geste vient de lui donner du sens.
 *
 * CE QUI N'EST PAS ICI, ET POURQUOI. L'univers restreint, la notation P_A(B),
 * le fait que le dénominateur décide, l'arbre pondéré et ses gestes, la somme
 * des chemins et la partition sont des acquis — de Seconde pour les uns, de la
 * leçon « Probabilités conditionnelles : arbres et probabilités totales » pour
 * les autres. Ils sont en `priorKnowledge`, pas en briques.
 *
 * Ce que ces douze briques ajoutent :
 *   · les DEUX ARBRES d'une même population et leurs poids qui ne coïncident
 *     pas — retourner n'est pas échanger ;
 *   · la MÉTHODE d'inversion, où le numérateur ne bouge pas ;
 *   · l'INDÉPENDANCE, d'abord comme forme visible sur l'arbre, puis comme mot,
 *     puis comme égalité vérifiable ;
 *   · les TROIS ÉCRITURES équivalentes, et l'égalité d'entiers qui tranche ;
 *   · l'INCOMPATIBILITÉ, et la démonstration que deux événements possibles qui
 *     s'excluent ne sont JAMAIS indépendants.
 */

/** Les deux arbres de la même population, côte à côte, à l'indépendance. */
const MiniDeuxArbres = ({ flat = false }) => {
  // Réglage gauche (dépendant) et droit (indépendant), en poids affichés.
  const g = flat
    ? [['0,5', ['0,4', '0,6']], ['0,5', ['0,4', '0,6']]]
    : [['0,6', ['0,33', '0,67']], ['0,4', ['0,5', '0,5']]];
  const d = flat
    ? [['0,4', ['0,5', '0,5']], ['0,6', ['0,5', '0,5']]]
    : [['0,4', ['0,5', '0,5']], ['0,6', ['0,67', '0,33']]];
  const Arbre = ({ data, x, first, second, tint }) => (
    <g transform={`translate(${x}, 0)`}>
      <text x={0} y={7} fontSize="7" fontWeight="700" fill="#94a3b8">{first} d’abord</text>
      <circle cx={4} cy={44} r="2.6" fill="#475569" />
      {data.map(([p1, kids], i) => {
        const yb = i === 0 ? 22 : 66;
        return (
          <g key={i}>
            <line x1={4} y1={44} x2={34} y2={yb} stroke="#94a3b8" strokeWidth="1.2" />
            <text x={12} y={(44 + yb) / 2 - 2} fontSize="6.5" fontWeight="700" fill="#7c3aed">{p1}</text>
            <circle cx={34} cy={yb} r="2.2" fill={tint} />
            {kids.map((p2, j) => {
              const yl = yb + (j === 0 ? -11 : 11);
              const same = flat;
              return (
                <g key={j}>
                  <line x1={34} y1={yb} x2={66} y2={yl}
                    stroke={same ? '#059669' : '#cbd5e1'} strokeWidth={same ? 1.8 : 1.1} />
                  <text x={44} y={(yb + yl) / 2 - 1.5} fontSize="6.5"
                    fontWeight={same ? '800' : '700'} fill={same ? '#047857' : '#0284c7'}>{p2}</text>
                  <text x={69} y={yl + 2.5} fontSize="6" fill="#64748b">
                    {j === 0 ? second : `non ${second}`}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
  return (
    <svg viewBox="0 0 214 96" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 214 }}>
      <Arbre data={g} x={0} first="A" second="B" tint="#4f46e5" />
      <line x1={104} y1={12} x2={104} y2={84} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
      <Arbre data={d} x={110} first="B" second="A" tint="#c026d3" />
      <text x={0} y={94} fontSize="6" fontWeight="700" fill={flat ? '#047857' : '#94a3b8'}>
        {flat
          ? 'les deux poids coïncident DANS chaque arbre — mais pas d’un arbre à l’autre'
          : 'mêmes 1 000 individus, mêmes quatre cases — et pourtant d’autres poids'}
      </text>
    </svg>
  );
};

/** Le quotient qu'on retourne : même numérateur, deux dénominateurs. */
const MiniInversion = () => (
  <svg viewBox="0 0 214 76" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 214 }}>
    <rect x={2} y={6} width={98} height={62} rx="6" fill="#f5f3ff" stroke="#c4b5fd" />
    <text x={51} y={19} textAnchor="middle" fontSize="7" fontWeight="700" fill="#6d28d9">parmi les préparés</text>
    <text x={51} y={38} textAnchor="middle" fontSize="13" fontWeight="800" fill="#312e81">90 / 100</text>
    <text x={51} y={56} textAnchor="middle" fontSize="11" fontWeight="800" fill="#4c1d95">= 90 %</text>
    <rect x={114} y={6} width={98} height={62} rx="6" fill="#fdf4ff" stroke="#f0abfc" />
    <text x={163} y={19} textAnchor="middle" fontSize="7" fontWeight="700" fill="#a21caf">parmi les reçus</text>
    <text x={163} y={38} textAnchor="middle" fontSize="13" fontWeight="800" fill="#312e81">90 / 200</text>
    <text x={163} y={56} textAnchor="middle" fontSize="11" fontWeight="800" fill="#86198f">= 45 %</text>
    <text x={107} y={74} textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#0f172a">
      même 90 au numérateur — le dénominateur a changé de camp
    </text>
  </svg>
);

/** Les deux mots qu'on confond, sur deux paires prises dans le même jeu. */
const MiniDeuxMots = () => (
  <svg viewBox="0 0 214 88" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 214 }}>
    <text x={0} y={8} fontSize="7" fontWeight="700" fill="#047857">cœur et roi — INDÉPENDANTS</text>
    <circle cx={34} cy={30} r="17" fill="#10b981" fillOpacity="0.22" stroke="#059669" />
    <circle cx={52} cy={30} r="10" fill="#0ea5e9" fillOpacity="0.22" stroke="#0284c7" />
    <text x={62} y={22} fontSize="6" fill="#334155">1 carte commune</text>
    <text x={62} y={32} fontSize="6" fill="#334155">1/52 = 1/4 × 1/13 ✔</text>
    <text x={0} y={58} fontSize="7" fontWeight="700" fill="#be123c">cœur et pique — INCOMPATIBLES</text>
    <circle cx={26} cy={74} r="11" fill="#f43f5e" fillOpacity="0.2" stroke="#e11d48" />
    <circle cx={54} cy={74} r="11" fill="#64748b" fillOpacity="0.2" stroke="#475569" />
    <text x={70} y={70} fontSize="6" fill="#334155">aucune carte commune</text>
    <text x={70} y={80} fontSize="6" fontWeight="700" fill="#be123c">0 ≠ 1/4 × 1/4 ✘ jamais indépendants</text>
  </svg>
);

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'deux-arbres-deux-poids',
        type: 'concepts',
        title: 'Une même population, deux arbres, deux jeux de poids',
        summary:
          'On peut décrire les mêmes individus en conditionnant par A d’abord ou par B d’abord. Les quatre cases ne bougent pas, les poids des branches, si : retourner un conditionnement n’est pas échanger deux lettres.',
        visual: <MiniDeuxArbres />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Les deux arbres racontent les mêmes 1 000 élèves. À gauche, on demande d’abord
              « porte-t-il des lunettes ? » ; à droite, « est-il au club de sport ? ». Les
              effectifs sont identiques, et pourtant P<sub>A</sub>(B) ≠ P<sub>B</sub>(A) presque
              toujours.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              L’erreur la plus coûteuse consiste à lire P<sub>A</sub>(B) comme si c’était
              P<sub>B</sub>(A) : les deux nombres se rapportent à des groupes de tailles
              différentes, et rien n’oblige les quotients à se ressembler.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux arbres côte à côte, et les poids qui refusent de coïncider.</div>
          </div>
        ),
      },
      {
        id: 'savoir-ne-change-rien',
        type: 'concepts',
        title: 'Le cas où savoir ne change rien',
        summary:
          'Pour certains réglages, les deux poids de deuxième génération d’un arbre deviennent identiques : la réponse à la première question ne modifie plus la chance de la seconde.',
        visual: <MiniDeuxArbres flat />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Sur 1 000 élèves dont 500 à lunettes et 400 au club, si 200 élèves cumulent les
              deux : parmi les élèves à lunettes, 40 % sont au club ; parmi les autres, 40 %
              aussi. Les deux branches portent le même poids. Savoir qu’un élève porte des
              lunettes n’apprend RIEN sur son club.
            </p>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              Ce réglage se voit d’un coup d’œil sur l’arbre : les deux poids de deuxième
              génération sont écrits pareil. C’est un candidat — il restera à le vérifier.
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Attention : « identiques dans chaque arbre » ne veut pas dire « identiques d’un
              arbre à l’autre ». Ici les poids valent 40 % à gauche et 50 % à droite.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux poids verts, écrits pareil dans les deux branches.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'inverser-le-conditionnement',
        type: 'methodes',
        title: 'Retourner un conditionnement',
        summary:
          'Le numérateur ne bouge pas — c’est le même effectif d’intersection. Seul le dénominateur change de camp : l’effectif de la condition de départ cède la place à celui de la condition d’arrivée.',
        visual: <MiniInversion />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Repérer l’effectif d’intersection : celui qui vérifie les DEUX critères.</li>
              <li>Le poser au numérateur — il sera le même dans les deux sens.</li>
              <li>Mettre au dénominateur l’effectif du groupe qu’on veut désormais parcourir.</li>
              <li>Diviser, puis dire la phrase : « parmi les … ».</li>
            </ol>
            <div className="rounded-xl border border-violet-100 bg-white p-3">
              Sur 500 candidats dont 100 préparés et 200 reçus, 90 sont à la fois préparés et
              reçus : P<sub>préparé</sub>(reçu) = 90/100 = <strong>90 %</strong>, tandis que
              P<sub>reçu</sub>(préparé) = 90/200 = <strong>45 %</strong>.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux cadres, le 90 immobile et les deux dénominateurs.</div>
          </div>
        ),
      },
      {
        id: 'inverser-sur-un-arbre',
        type: 'methodes',
        title: 'Retourner un conditionnement quand on n’a qu’un arbre',
        summary:
          'Sur un arbre, l’effectif d’intersection n’est pas écrit : on le remplace par le produit du chemin, et le nouveau dénominateur par la somme de tous les chemins qui mènent à l’événement.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$P_B(A) = \\frac{P(A) \\times P_A(B)}{P(B)}$$'}</MathText>
            </div>
            <p>
              Le haut est le chemin A → B, le bas est la somme de TOUS les chemins menant à B —
              celle qu’on sait déjà calculer. C’est exactement la même opération que sur le
              tableau : un numérateur inchangé, un dénominateur qui devient celui du groupe
              d’arrivée.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Oublier le dénominateur, c’est confondre P<sub>B</sub>(A) avec le produit du chemin,
              c’est-à-dire avec P(A ∩ B) — un nombre bien plus petit.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-numerateur-commun',
        type: 'memoriser',
        title: '⭐ Le numérateur ne bouge pas',
        summary: 'Dans les deux sens du conditionnement, le numérateur est le même effectif : seul le dénominateur change.',
        body: (
          <div className="bg-violet-50 rounded-xl border-2 border-violet-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-violet-800">
              P<sub>A</sub>(B) = <span className="text-slate-900">n(A ∩ B)</span> / n(A)
              <span className="mx-2 text-violet-400">·</span>
              P<sub>B</sub>(A) = <span className="text-slate-900">n(A ∩ B)</span> / n(B)
            </div>
            <p className="text-xs text-violet-700">
              même haut, deux bas — et les deux bas n’ont aucune raison d’être égaux
            </p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'independance',
        type: 'vocabulaire',
        title: 'Deux événements indépendants',
        summary:
          'Deux événements sont indépendants quand savoir que l’un s’est produit ne change pas la probabilité de l’autre. Sur un arbre, les deux poids de deuxième génération sont alors identiques.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              C’est le nom du cas particulier repéré au premier module : les branches de deuxième
              génération portent le même poids, dans les deux branches du premier niveau. Ce poids
              commun vaut alors la probabilité de l’événement tout court.
            </p>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
              <strong>Sur 1 200 pièces</strong>, 300 viennent de l’atelier du matin dont 90
              contrôlées (30 %), et 900 du soir dont 270 contrôlées (30 %). Les deux ateliers
              n’ont pas le même volume, et pourtant les poids coïncident : les deux événements
              sont indépendants.
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Ce mot ne parle PAS de cause. Deux événements peuvent être liés par une cause
              commune et rester indépendants au sens du calcul, et l’inverse est vrai aussi.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : 30 % et 30 % sur deux ateliers de tailles différentes.</div>
          </div>
        ),
      },
      {
        id: 'reconnaitre-sur-arbre',
        type: 'regles',
        title: 'Reconnaître le cas sur l’arbre — et s’en méfier',
        summary:
          'Deux poids de deuxième génération écrits pareil signalent un candidat. Deux poids simplement PROCHES ne signalent rien du tout : l’œil ne distingue pas 30 % de 31 %.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Sur 1 000 élèves, 124 des 400 demi-pensionnaires sont au club (31 %) contre 180 des
              600 externes (30 %). À l’œil, c’est la même chose. Au calcul, 124 × 1 000 = 124 000
              et 400 × 304 = 121 600 : ce n’est pas égal.
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              L’arbre sert à REPÉRER un candidat, jamais à conclure. Le verdict se prend au
              calcul, sur une égalité qui est vraie ou fausse, sans « à peu près ».
            </div>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'test-du-produit',
        type: 'formules',
        title: 'Le test du produit',
        summary:
          'Deux événements sont indépendants si et seulement si la probabilité qu’ils se produisent tous les deux est le produit de leurs probabilités.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
              <MathText>{'$$P(A \\cap B) = P(A) \\times P(B)$$'}</MathText>
            </div>
            <p>
              Sur un jeu de 52 cartes : P(cœur) = 13/52 = 1/4, P(roi) = 4/52 = 1/13, et il y a un
              seul roi de cœur donc P(cœur ∩ roi) = 1/52. Or 1/4 × 1/13 = <strong>1/52</strong> :
              l’égalité tient, les deux événements sont indépendants.
            </p>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              Sur des effectifs, ce test devient une égalité d’ENTIERS, sans aucune division :
              n(A ∩ B) × N = n(A) × n(B). Aucun arrondi ne peut alors fausser le verdict.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : 1/52, et le produit qui tombe exactement dessus.</div>
          </div>
        ),
      },
      {
        id: 'trois-ecritures',
        type: 'regles',
        title: 'Trois écritures, une seule propriété',
        summary:
          'P(A ∩ B) = P(A) × P(B), P_A(B) = P(B) et P_B(A) = P(A) sont vraies exactement en même temps : on choisit celle dont on a les nombres.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
              <MathText>{'$$P(A \\cap B) = P(A)P(B) \\iff P_A(B) = P(B) \\iff P_B(A) = P(A)$$'}</MathText>
            </div>
            <p>
              La première se lit sur un tableau, les deux autres sur un arbre. Aucune n’est plus
              vraie que les autres : on prend celle que la situation rend calculable.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Les deux formes conditionnelles n’exigent PAS que P<sub>A</sub>(B) soit égal à
              P<sub>B</sub>(A) — ces deux nombres-là restent en général différents, même quand les
              événements sont indépendants.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-verifier-independance',
        type: 'methodes',
        title: 'Vérifier l’indépendance par le calcul',
        summary:
          'Calculer les trois nombres, comparer le produit à l’intersection, et conclure par oui ou par non — jamais par « à peu près ».',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Écrire P(A), P(B) et P(A ∩ B) — trois quotients sur le MÊME total.</li>
              <li>Multiplier P(A) par P(B).</li>
              <li>Comparer à P(A ∩ B). Sur des effectifs, comparer plutôt n(A ∩ B) × N à n(A) × n(B) : deux entiers.</li>
              <li>Conclure : égalité ⇒ indépendants ; toute différence, si petite soit-elle ⇒ non.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3">
              Deux dés. A = « le premier est pair » (18 issues), B = « la somme vaut 7 » (6
              issues), A ∩ B = 3 issues. 3 × 36 = 108 et 18 × 6 = 108 : <strong>indépendants</strong>.
              Avec B′ = « la somme vaut 8 » (5 issues, dont 3 avec un premier dé pair) :
              3 × 36 = 108 mais 18 × 5 = 90 — <strong>non</strong>.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : 108 = 108, puis 108 ≠ 90, sur la même expérience.</div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'incompatibles',
        type: 'vocabulaire',
        title: 'Deux événements incompatibles',
        summary:
          'Deux événements sont incompatibles quand ils ne peuvent pas se produire en même temps : aucun individu, aucune issue ne vérifie les deux. Leur intersection est vide.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Une carte ne peut pas être à la fois un cœur et un pique. Un élève ne peut pas être
              à la fois interne et externe. L’effectif de l’intersection vaut alors 0, et donc
              P(A ∩ B) = 0.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Ce mot décrit la FORME des deux ensembles — ils ne se touchent pas. Il ne dit rien
              sur les probabilités elles-mêmes, sinon que celle de l’intersection est nulle.
            </div>
          </div>
        ),
      },
      {
        id: 'incompatible-nest-pas-independant',
        type: 'regles',
        title: 'Incompatibles et possibles ⇒ JAMAIS indépendants',
        summary:
          'Si A et B ne peuvent pas se produire ensemble et que chacun a une probabilité non nulle, alors P(A ∩ B) = 0 tandis que P(A) × P(B) > 0 : le test échoue toujours.',
        visual: <MiniDeuxMots />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Loin d’être la même chose, les deux notions sont presque opposées. Deux événements
              incompatibles sont même le cas le plus LIÉ qui soit : savoir que l’un s’est produit
              donne la certitude que l’autre ne s’est pas produit.
            </p>
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-center">
              <MathText>{'$$P(A \\cap B) = 0 \\quad \\text{et} \\quad P(A) \\times P(B) > 0$$'}</MathText>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Cœur et pique : 0 d’un côté, 1/4 × 1/4 = 1/16 de l’autre. Ces deux nombres ne
              peuvent pas être égaux, quelle que soit la situation, dès que les deux événements
              sont possibles.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux disques qui ne se touchent pas, et le 0 face au 1/16.</div>
          </div>
        ),
      },
      {
        id: 'mem-deux-mots',
        type: 'memoriser',
        title: '⭐ Les deux mots qu’on confond',
        summary: 'Incompatibles : ils ne se rencontrent jamais. Indépendants : se rencontrer ne leur apprend rien.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="rounded-lg bg-white border border-rose-200 px-3 py-2">
                <strong className="text-rose-800">Incompatibles</strong> — P(A ∩ B) = 0 :
                aucun cas commun.
              </div>
              <div className="rounded-lg bg-white border border-emerald-200 px-3 py-2">
                <strong className="text-emerald-800">Indépendants</strong> —
                P(A ∩ B) = P(A) × P(B) : savoir l’un ne change rien à l’autre.
              </div>
            </div>
            <p className="text-center text-xs font-bold text-rose-700">
              deux événements possibles ne peuvent pas être les deux à la fois
            </p>
          </div>
        ),
      },
      {
        id: 'methode-probleme-deux-sens',
        type: 'methodes',
        title: 'Mener un problème qui demande les deux sens',
        summary:
          'Poser le tableau des effectifs, y lire chaque question dans le bon sens, et ne trancher l’indépendance qu’avec le test du produit.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Poser les quatre effectifs et leurs marges : tout se lira dessus.</li>
              <li>Pour chaque question, repérer le groupe de référence et écrire son effectif au dénominateur.</li>
              <li>Pour l’indépendance, comparer n(A ∩ B) × N à n(A) × n(B).</li>
              <li>Répondre en phrases qui nomment leur population, et non en nombres nus.</li>
            </ol>
            <div className="rounded-xl border border-rose-100 bg-white p-3">
              2 000 pièces, 1 200 de la machine 1 dont 60 défectueuses, 800 de la machine 2 dont
              40 défectueuses. P<sub>M1</sub>(déf) = 60/1 200 = <strong>5 %</strong> ;
              P<sub>déf</sub>(M1) = 60/100 = <strong>60 %</strong> ; et 60 × 2 000 = 120 000 =
              1 200 × 100, donc les deux événements sont <strong>indépendants</strong>.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : 5 % et 60 % sur la même case de 60 pièces.</div>
          </div>
        ),
      },
    ],
  },
};
