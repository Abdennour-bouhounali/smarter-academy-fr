import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de « Variables aléatoires : loi et espérance » — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit ICI et nulle
 * part ailleurs ; les modules la posent par son id, au moment où le geste vient
 * de lui donner du sens.
 *
 * PÉRIMÈTRE : aucune brique ne parle de variance, d'écart type d'une variable
 * aléatoire ni de loi binomiale — c'est la leçon suivante, et une brique posée
 * ici la lui volerait.
 */

/** Une roue miniature : dix secteurs, trois gains. Pas de texte dans le SVG. */
const MiniRoue = () => {
  const parts = ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#38bdf8', '#38bdf8', '#38bdf8', '#38bdf8', '#f59e0b', '#f59e0b'];
  const R = 40; const C = 46; const ang = 36;
  const arc = (i) => {
    const a0 = (i * ang - 90) * (Math.PI / 180);
    const a1 = ((i + 1) * ang - 90) * (Math.PI / 180);
    return `M ${C} ${C} L ${(C + R * Math.cos(a0)).toFixed(2)} ${(C + R * Math.sin(a0)).toFixed(2)} ` +
      `A ${R} ${R} 0 0 1 ${(C + R * Math.cos(a1)).toFixed(2)} ${(C + R * Math.sin(a1)).toFixed(2)} Z`;
  };
  return (
    <svg viewBox="0 0 92 92" aria-hidden="true" className="select-none" style={{ width: 92, height: 92 }}>
      {parts.map((c, i) => <path key={i} d={arc(i)} fill={c} stroke="#fff" strokeWidth="1.2" />)}
      <circle cx={C} cy={C} r={R} fill="none" stroke="#334155" strokeWidth="2" />
      <circle cx={C} cy={C} r="4" fill="#0f172a" />
    </svg>
  );
};

/** La règle des gains, avec la ligne de la moyenne posée entre deux valeurs. */
const MiniRegle = () => (
  <svg viewBox="0 0 220 56" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 220 }}>
    <rect x="8" y="14" width="204" height="20" rx="5" fill="#fff" stroke="#cbd5e1" />
    {[0, 1, 5].map((g) => (
      <line key={g} x1={8 + (g / 5) * 204} y1="14" x2={8 + (g / 5) * 204} y2="24" stroke="#94a3b8" strokeWidth="1.4" />
    ))}
    <rect x={8 + (1.4 / 5) * 204 - 1.5} y="10" width="3" height="28" rx="1.5" fill="#0f766e" />
    <text x="8" y="50" fontSize="9" fill="#64748b">0 €</text>
    <text x="196" y="50" fontSize="9" fill="#64748b">5 €</text>
    <text x={8 + (1.4 / 5) * 204 - 12} y="9" fontSize="9" fontWeight="700" fill="#0f766e">1,40</text>
  </svg>
);

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'hasard-moyenne-previsible',
        type: 'concepts',
        title: 'Un lancer est imprévisible, la moyenne ne l’est pas',
        summary:
          'On ne peut pas prévoir le résultat d’un lancer. Mais sur un très grand nombre de lancers, la moyenne des résultats se pose toujours au même endroit — et cet endroit se calcule à l’avance.',
        visual: <MiniRoue />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Le hasard n’interdit pas toute prévision : il interdit de prévoir <strong>un</strong>{' '}
              résultat. La <strong>moyenne d’un grand nombre</strong> de résultats, elle, est
              remarquablement stable — relance 500 fois, elle retombe presque au même endroit.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              « Avec du hasard on ne peut rien prévoir » est faux. Ce qu’on ne peut pas prévoir,
              c’est le prochain lancer.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la ligne de la moyenne qui se pose toujours au même endroit.</div>
          </div>
        ),
      },
      {
        id: 'moyenne-hors-des-valeurs',
        type: 'concepts',
        title: 'Cette moyenne n’est en général AUCUN résultat possible',
        summary:
          'Une roue qui paie 0 €, 1 € ou 5 € a pour moyenne à long terme 1,40 € : un montant qu’elle ne verse jamais. Une moyenne n’a pas à figurer parmi les valeurs qu’on moyenne.',
        visual: <MiniRegle />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              La ligne se pose entre les valeurs, pas sur l’une d’elles. C’est déjà le cas d’un sac
              de six boules numérotées de 1 à 6 : la moyenne des numéros tirés vaut à la longue{' '}
              <strong>3,5</strong>, et aucune boule ne porte 3,5.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Chercher la moyenne parmi les résultats possibles est l’erreur la plus fréquente ici :
              elle n’y est presque jamais.
            </div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'variable-aleatoire',
        type: 'vocabulaire',
        title: 'Variable aléatoire',
        summary:
          'Une variable aléatoire associe UN NOMBRE à chaque issue d’une expérience aléatoire. On la note par une majuscule, X, et les nombres qu’elle peut prendre par des minuscules.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$X : \\text{issue} \\longmapsto \\text{nombre}$$'}</MathText>
            </div>
            <p>
              Sur la roue, X est le <strong>gain</strong> : à chaque secteur, un montant. X prend
              ici trois valeurs — 0, 1 et 5 —, et l’on écrit « X = 5 » pour l’événement « la roue
              s’arrête sur un secteur du gros lot ».
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              X n’est pas une probabilité : c’est un gain, en euros. Ce n’est pas non plus un
              résultat déjà tiré — c’est la règle qui transforme chaque issue en nombre.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : chaque secteur de la roue étiqueté par son montant.</div>
          </div>
        ),
      },
      {
        id: 'valeurs-prises',
        type: 'regles',
        title: 'Les valeurs prises, sans répétition',
        summary:
          'Les valeurs d’une variable aléatoire se listent une seule fois chacune, dans l’ordre croissant — même si plusieurs issues donnent le même nombre.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              La roue a dix secteurs mais X ne prend que <strong>trois</strong> valeurs : 0, 1 et 5.
              Quatre secteurs donnent 0 : cela ne fait pas quatre valeurs, cela fait une valeur
              obtenue de quatre façons.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Confondre le nombre d’issues (10) et le nombre de valeurs (3) fausse tout le tableau
              qui suit.
            </div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'loi-de-probabilite',
        type: 'vocabulaire',
        title: 'La loi de probabilité de X',
        summary:
          'La loi de probabilité de X donne, pour chaque valeur possible, la probabilité que X la prenne. On la note P(X = xᵢ).',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$P(X = x_i) = \\frac{\\text{nombre d’issues qui donnent } x_i}{\\text{nombre total d’issues}}$$'}</MathText>
            </div>
            <p>
              Sur la roue à dix secteurs égaux : P(X = 0) = 4/10, P(X = 1) = 4/10,
              P(X = 5) = 2/10. On <strong>regroupe</strong> les issues qui donnent le même nombre,
              et l’on additionne leurs probabilités.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les quatre secteurs gris réunis en une seule ligne du tableau.</div>
          </div>
        ),
      },
      {
        id: 'somme-des-probabilites-vaut-1',
        type: 'regles',
        title: 'La somme des probabilités vaut 1',
        summary:
          'Dans une loi de probabilité, les probabilités des valeurs somment toujours à 1 : une issue et une seule se réalise à chaque expérience.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$p_1 + p_2 + \\dots + p_k = 1$$'}</MathText>
            </div>
            <p>
              4/10 + 4/10 + 2/10 = 10/10 = 1. C’est le premier contrôle à faire sur un tableau :
              une somme différente de 1 signale une valeur oubliée ou une probabilité fausse.
            </p>
            <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              Et c’est aussi ce qui permet de trouver une probabilité manquante : elle vaut 1 moins
              la somme des autres.
            </div>
          </div>
        ),
      },
      {
        id: 'tableau-de-loi',
        type: 'methodes',
        title: 'Dresser le tableau de la loi',
        summary:
          'Deux lignes : les valeurs de X en haut, leurs probabilités en dessous. On vérifie toujours que la somme de la seconde ligne vaut 1.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Lister les valeurs possibles de X, chacune une fois, dans l’ordre croissant.</li>
              <li>Pour chacune, compter les issues qui la donnent.</li>
              <li>Diviser par le nombre total d’issues — ou additionner les probabilités des issues.</li>
              <li>Vérifier : la somme de la ligne des probabilités doit valoir 1.</li>
            </ol>
            <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white">
              <table className="w-full text-center text-sm"><tbody>
                <tr className="bg-sky-50"><th className="px-2 py-1 text-left">x<sub>i</sub></th><td>0 €</td><td>1 €</td><td>5 €</td><td className="text-slate-400">total</td></tr>
                <tr className="border-t"><th className="px-2 py-1 text-left">P(X = x<sub>i</sub>)</th><td>4/10</td><td>4/10</td><td>2/10</td><td className="font-black text-sky-800">1</td></tr>
              </tbody></table>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la dernière case du tableau, qui vaut toujours 1.</div>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'esperance',
        type: 'vocabulaire',
        title: 'L’espérance E(X)',
        summary:
          'L’espérance de X est la somme des valeurs multipliées par leur probabilité. C’est le nombre sur lequel se pose la moyenne d’un très grand nombre de répétitions.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
              <MathText>{'$$E(X) = x_1 p_1 + x_2 p_2 + \\dots + x_k p_k$$'}</MathText>
            </div>
            <p>
              Sur la roue : E(X) = 0 × 0,4 + 1 × 0,4 + 5 × 0,2 = <strong>1,4</strong>. Le tableau
              suffit : on n’a plus besoin de lancer quoi que ce soit.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Ce n’est PAS la moyenne des valeurs : (0 + 1 + 5)/3 = 2, ce qui est faux. Chaque
              valeur pèse selon sa probabilité.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la ligne rouge du calcul venue se poser sur la ligne verte de la moyenne.</div>
          </div>
        ),
      },
      {
        id: 'methode-calculer-esperance',
        type: 'methodes',
        title: 'Calculer une espérance',
        summary:
          'Dresser le tableau, multiplier chaque valeur par sa probabilité, additionner les produits. Un seul nombre en sort.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Écrire le tableau de la loi, et vérifier que la somme des probabilités vaut 1.</li>
              <li>Multiplier chaque valeur par SA probabilité — colonne par colonne.</li>
              <li>Additionner tous les produits.</li>
              <li>Contrôler l’ordre de grandeur : le résultat tombe entre la plus petite et la plus grande valeur.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3">
              0 × 4/10 = 0 ; 1 × 4/10 = 0,4 ; 5 × 2/10 = 1. Somme : <strong>1,4</strong>. Et
              1,4 est bien entre 0 et 5. ✔
            </div>
          </div>
        ),
      },
      {
        id: 'mem-esperance',
        type: 'memoriser',
        title: '⭐ E(X) = Σ xᵢ pᵢ',
        summary: 'Chaque valeur multipliée par sa probabilité, le tout additionné.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">E(X) = x₁p₁ + x₂p₂ + … + x\u2096p\u2096</div>
            <p className="text-xs text-rose-700">chaque valeur pèse selon sa probabilité — jamais une moyenne simple</p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'esperance-moyenne-long-terme',
        type: 'concepts',
        title: 'Ce que l’espérance annonce vraiment',
        summary:
          'E(X) annonce la moyenne des résultats sur un très grand nombre de répétitions — pas ce qui arrivera la prochaine fois, et pas un montant qu’on puisse gagner.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Une tombola d’espérance 1,275 € ne fait gagner 1,275 € à personne : elle annonce que
              sur 200 billets, les lots distribués reviennent à <strong>environ 1,275 € par
              billet</strong>. C’est une prévision <em>par répétition</em>, pas une promesse.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              « J’ai une espérance de 1,275 €, donc je vais gagner 1,275 € » est faux : ce billet-là
              rapportera 0, 5, 20 ou 100 €.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les 145 € qui restent à l’organisateur au bout des 200 billets.</div>
          </div>
        ),
      },
      {
        id: 'benefice-espere',
        type: 'formules',
        title: 'Bénéfice espéré : retirer la mise',
        summary:
          'Quand jouer coûte quelque chose, ce qui compte est l’espérance de GAIN diminuée de la mise : E(X) − mise.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-center">
              <MathText>{'$$\\text{bénéfice espéré} = E(X) - \\text{mise}$$'}</MathText>
            </div>
            <p>
              Billet à 2 €, espérance de gain 1,275 € : le bénéfice espéré vaut
              1,275 − 2 = <strong>−0,725 €</strong>. Chaque billet coûte en moyenne 72,5 centimes
              à celui qui l’achète.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Oublier la mise est l’erreur classique : une espérance de gain positive ne suffit pas
              à rendre un jeu intéressant.
            </div>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'jeu-equitable',
        type: 'regles',
        title: 'Jeu équitable',
        summary:
          'Un jeu est équitable quand le bénéfice espéré est nul, c’est-à-dire quand l’espérance de gain égale exactement la mise.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800"><strong>E(X) − mise = 0</strong> — jeu équitable</div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900"><strong>E(X) − mise &gt; 0</strong> — favorable au joueur</div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900"><strong>E(X) − mise &lt; 0</strong> — favorable à l’organisateur</div>
            </div>
            <p>
              « Équitable » est une égalité de nombres, pas une impression : un jeu dont les règles
              semblent justes peut être largement défavorable.
            </p>
          </div>
        ),
      },
      {
        id: 'decider-par-esperance',
        type: 'methodes',
        title: 'Choisir entre deux offres',
        summary:
          'On compare les bénéfices espérés, pas les gros lots : l’offre au plus gros lot est souvent la moins intéressante à long terme.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Dresser la loi de chaque offre.</li>
              <li>Calculer chaque espérance de gain.</li>
              <li>Retirer la mise de chacune.</li>
              <li>Choisir le plus grand bénéfice espéré — et le dire en une phrase de contexte.</li>
            </ol>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Un lot de 20 € annoncé sur l’affiche ne dit rien de l’espérance : tout dépend de la
              probabilité de le décrocher.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’offre au gros lot de 20 € battue par celle qui plafonne à 5 €.</div>
          </div>
        ),
      },
      {
        id: 'mem-decider',
        type: 'memoriser',
        title: '⭐ On décide sur E(X) − mise',
        summary: 'Le plus gros lot ne décide de rien ; le bénéfice espéré décide de tout.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">bénéfice espéré = E(X) − mise</div>
            <p className="text-xs text-rose-700">nul : équitable · positif : favorable au joueur · négatif : à l’organisateur</p>
          </div>
        ),
      },
    ],
  },
};
