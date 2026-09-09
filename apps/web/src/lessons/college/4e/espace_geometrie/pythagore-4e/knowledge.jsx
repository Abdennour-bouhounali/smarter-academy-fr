import React from 'react';
import { puzzlePreuve, arrondi } from './components/pythagore4e';

/**
 * Connaissances de la leçon « Théorème de Pythagore » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     hypoténuse (M1)
 *          ↓
 *     égalité des aires (M1)
 *          ↓
 *     l'égalité EXIGE l'angle droit (M2)
 *          ↓
 *     théorème de Pythagore (M3)   ← écrit une fois la figure fabriquée
 *          ↓
 *     méthode « écrire, calculer, extraire » (M4)
 *          ↓                        ↘
 *     contrôle de l'hypoténuse (M5)  réciproque et contraposée (M6)
 *
 * Rien n'y est arbitraire : la réciproque (M6) ne peut pas précéder la
 * condition du module 2, et la méthode (M4) suppose le théorème écrit (M3).
 *
 * Ce que cette carte NE contient PAS : l'angle droit, l'aire d'un carré, le
 * carré d'un nombre, la racine carrée et son encadrement. Ce sont les acquis
 * listés dans `priorKnowledge` et diagnostiqués au module 0. Elle ne contient
 * pas non plus Thalès, la trigonométrie ni l'application à l'espace : objets
 * de 3e.
 */

/* ══ Petits visuels partagés ══════════════════════════════════════════ */

/** Un triangle rectangle et ses trois carrés, en miniature. */
const TroisCarres = () => (
  <div className="rounded-xl border border-indigo-100 bg-white p-2">
    <svg viewBox="0 0 150 120" className="w-full" role="img"
         aria-label="Un triangle rectangle et les carrés construits sur ses trois côtés">
      {/* triangle 3-4-5 à l'échelle 12 */}
      <polygon points="50,90 86,90 50,42" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.8" />
      {/* carré sur le côté vertical (3) */}
      <rect x="14" y="42" width="36" height="48" fill="#0891b2" fillOpacity="0.16" stroke="#0891b2" strokeWidth="1.4" />
      {/* carré sur le côté horizontal (4) */}
      <rect x="50" y="90" width="36" height="24" fill="#7c3aed" fillOpacity="0.16" stroke="#7c3aed" strokeWidth="1.4" />
      {/* carré sur l'hypoténuse (5), incliné */}
      <polygon points="86,90 50,42 98,6 134,54" fill="#dc2626" fillOpacity="0.14" stroke="#dc2626" strokeWidth="1.4" />
      {/* marque d'angle droit */}
      <polyline points="50,82 58,82 58,90" fill="none" stroke="#0f172a" strokeWidth="1.4" />
    </svg>
    <p className="text-center text-[11px] text-slate-500">le rouge = le bleu + le violet</p>
  </div>
);

/** Le puzzle du module 3, en miniature. */
const Puzzle = () => {
  const z = puzzlePreuve(3, 4);
  const U = 100 / z.cadre;
  const pt = (p) => `${p.x * U},${(z.cadre - p.y) * U}`;
  return (
    <div className="rounded-xl border border-sky-100 bg-white p-2">
      <svg viewBox="-4 -4 108 108" className="mx-auto w-full max-w-[130px]" role="img"
           aria-label="Quatre triangles dans un cadre carré, laissant au milieu un carré incliné">
        <rect x="0" y="0" width="100" height="100" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
        <polygon points={z.carreIncline.sommets.map(pt).join(' ')} fill="#fbbf24" fillOpacity="0.4" stroke="#b45309" strokeWidth="1.5" />
        {z.pieces.map((p) => (
          <polygon key={p.id} points={p.sommets.map(pt).join(' ')} fill="#0891b2" fillOpacity="0.3" stroke="#0e7490" strokeWidth="1.2" />
        ))}
      </svg>
      <p className="text-center text-[11px] text-slate-500">7² = 4 triangles + 5²</p>
    </div>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le nom du côté, et le constat sur les aires. */
    1: [
      {
        id: 'hypotenuse',
        type: 'vocabulaire',
        title: 'L’hypoténuse',
        summary:
          'Dans un triangle rectangle, l’hypoténuse est le côté OPPOSÉ à l’angle droit. C’est aussi le plus grand des trois.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              L’hypoténuse se reconnaît à l’angle droit, pas à sa position sur la feuille : si la
              figure est tournée, c’est toujours le côté qui ne touche pas le sommet de l’angle
              droit.
            </p>
            <p className="text-sm text-slate-700">
              Elle fait face au plus grand angle du triangle, donc elle est{' '}
              <strong>toujours le plus long côté</strong>. C’est ce qui permet de contrôler un
              résultat.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le plus grand des trois carrés, toujours construit sur le même côté.
            </div>
          </div>
        ),
      },
      {
        id: 'egalite-des-aires',
        type: 'concepts',
        title: 'L’égalité des trois aires',
        summary:
          'Le carré construit sur l’hypoténuse a la même aire que les deux autres carrés réunis — quelle que soit la forme du triangle rectangle.',
        visual: <TroisCarres />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Les trois aires changent quand on déforme le triangle. Leur relation, elle, ne
              change pas : la somme des deux petites retombe toujours sur la grande.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Attention : cette égalité porte sur les <strong>aires</strong>, donc sur les carrés
              des longueurs. Les longueurs elles-mêmes ne s’additionnent pas.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les trois formes relevées, et la même somme à chaque ligne.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — L'égalité EXIGE l'angle droit. */
    2: [
      {
        id: 'condition-angle-droit',
        type: 'regles',
        title: 'L’égalité et l’angle droit vont ensemble',
        summary:
          'L’égalité des aires n’est vraie QUE si le triangle a un angle droit. Si elle est fausse, le triangle n’est pas rectangle.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Dès que le sommet quitte le cercle, la balance penche — et le sens de la pente dit
              quel angle on a :
            </p>
            <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <div><strong>angle aigu</strong> → le grand carré est trop petit</div>
              <div><strong>angle droit</strong> → les deux plateaux s’équilibrent</div>
              <div><strong>angle obtus</strong> → le grand carré est trop grand</div>
            </div>
            <p className="text-sm text-slate-600">
              Conséquence directe : on peut TESTER un triangle. Si l’égalité tombe, l’angle droit
              n’y est pas.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le sommet libéré du cercle, et la balance qui penche des deux côtés.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — Le théorème, écrit une fois la figure fabriquée. */
    3: [
      {
        id: 'theoreme-pythagore',
        type: 'formules',
        title: 'Le théorème de Pythagore',
        summary:
          'Dans un triangle rectangle, le carré de l’hypoténuse est égal à la somme des carrés des deux autres côtés.',
        visual: <Puzzle />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-sky-200 bg-white p-3 text-center">
              <div className="font-mono text-xl font-black text-sky-700">a² + b² = c²</div>
              <div className="mt-1 text-xs text-slate-500">
                a et b : les côtés de l’angle droit · c : l’hypoténuse
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Dans un triangle ABC rectangle en A, cela s’écrit{' '}
              <strong>AB² + AC² = BC²</strong> : les deux côtés qui partent du sommet de l’angle
              droit sont à gauche, l’hypoténuse à droite.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              L’erreur classique : écrire a + b = c. Le puzzle le contredit — avec 3 et 4, le
              trou du milieu a pour côté 5, pas 7.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le trou carré que les quatre triangles laissaient au milieu.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — La méthode. */
    4: [
      {
        id: 'methode-calculer',
        type: 'methodes',
        title: 'Écrire, calculer, extraire',
        summary:
          'Trois temps, toujours dans cet ordre : écrire l’égalité, calculer le carré cherché, puis extraire la racine carrée.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-2 text-sm text-slate-700">
              <li>
                <strong>1. Écrire</strong> l’égalité en repérant d’abord l’hypoténuse :
                <span className="ml-1 font-mono">AB² + AC² = BC²</span>
              </li>
              <li>
                <strong>2. Calculer</strong> le membre connu :
                <span className="ml-1 font-mono">9 + 16 = 25</span>
              </li>
              <li>
                <strong>3. Extraire</strong> la racine carrée :
                <span className="ml-1 font-mono">c = 5</span>
              </li>
            </ol>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              L’étape 3 s’oublie souvent : 25 est le CARRÉ de la longueur, pas la longueur.
            </div>
            <p className="text-sm text-slate-600">
              Quand la racine ne tombe pas juste, on l’encadre entre deux entiers, puis on en
              donne une valeur approchée.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — Le garde-fou. */
    5: [
      {
        id: 'controle-hypotenuse',
        type: 'memoriser',
        title: 'L’hypoténuse est le plus grand côté',
        summary:
          'Un résultat où un côté de l’angle droit dépasse l’hypoténuse est forcément faux : on a additionné au lieu de soustraire.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-purple-200 bg-white p-3 text-center text-sm">
              <div className="text-slate-600">on cherche l’hypoténuse → on <strong>additionne</strong></div>
              <div className="mt-1 text-slate-600">on cherche un côté de l’angle droit → on <strong>soustrait</strong></div>
            </div>
            <p className="text-sm text-slate-700">
              Le réflexe : avant de calculer, repérer l’hypoténuse. C’est elle qui décide de
              l’opération. Après le calcul, vérifier qu’elle est bien le plus grand des trois.
            </p>
          </div>
        ),
      },
    ],

    /* M6 — Les deux lectures inverses. */
    6: [
      {
        id: 'reciproque',
        type: 'regles',
        title: 'La réciproque',
        summary:
          'Si le carré du plus grand côté égale la somme des carrés des deux autres, alors le triangle EST rectangle.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Le théorème part de l’angle droit pour donner l’égalité. La réciproque fait le
              chemin inverse : elle part de l’égalité pour <strong>prouver</strong> l’angle droit.
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <p className="font-semibold text-slate-700">La méthode, en trois lignes :</p>
              <ol className="mt-1 space-y-0.5 text-slate-600">
                <li>1. repérer le plus grand côté ;</li>
                <li>2. calculer les deux membres SÉPARÉMENT ;</li>
                <li>3. comparer, et conclure.</li>
              </ol>
            </div>
            <p className="text-sm text-slate-600">
              C’est le seul moyen de décider quand on n’a que des mesures, sans figure fiable.
            </p>
          </div>
        ),
      },
      {
        id: 'contraposee',
        type: 'regles',
        title: 'La contraposée',
        summary:
          'Si l’égalité est fausse, le triangle n’est pas rectangle — et on peut l’affirmer sans mesurer aucun angle.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              C’est le même calcul que la réciproque, avec l’autre conclusion. Si le triangle
              était rectangle, l’égalité serait vraie ; elle est fausse, donc il ne l’est pas.
            </p>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              Réciproque et contraposée ne sont pas deux techniques à choisir : on fait UN seul
              calcul, et c’est son résultat qui dit laquelle des deux conclusions s’applique.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : la palette du menuisier, dont les deux membres ne tombaient pas égaux.
            </div>
          </div>
        ),
      },
    ],
  },
};
