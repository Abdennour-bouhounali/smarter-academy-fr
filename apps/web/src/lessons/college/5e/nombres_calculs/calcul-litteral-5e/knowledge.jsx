import React from 'react';
import PatternLab from './components/PatternLab';
import RectangleDistribLab from './components/RectangleDistribLab';
import { expr, ecrire, ecrireAvecFois, valeur, MOTIFS, developper } from './components/litteral';

/**
 * Connaissances de la leçon « Calcul littéral et algébrique » (5e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés. Deux présentations
 * consomment ces données : le tiroir « Ma carte » et l'« À retenir » de fin de
 * module ; la synthèse du test final affiche la carte complète. Aucun module
 * n'écrit son propre résumé (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE — c'est elle que la carte doit donner à voir, et c'est
 * elle qui décide de l'ordre des modules :
 *
 *     régularité observée sur un motif  (M1)
 *              ↓
 *     la formule : une recette pour tous les cas  (M1)
 *              ↓
 *     la lettre : l'emplacement du nombre non fixé  (M2)
 *              ↓                    ↘
 *     écrire une expression (M3)      inconnue ou variable (M2)
 *              ↓
 *     substituer un nombre  (M4)
 *              ↓
 *     développer un produit  (M5)
 *              ↓
 *     produire et appliquer une formule  (M6)
 *
 * Rien n'est arbitraire : on ne peut pas écrire une expression (M3) sans savoir
 * ce que la lettre y fait (M2), ni développer (M5) sans savoir substituer (M4)
 * — puisque c'est la substitution qui permet de VÉRIFIER qu'un développement
 * est juste.
 *
 * NOTE LEXIQUE. Les ids `calcul-litteral` et `distributivite` sont ceux du
 * lexique d'audit (scripts/audit/lexicon.json), où ils portent le niveau 4e.
 * Ce sont pourtant les mots exacts du programme de 5e : les briques ci-dessous
 * les ÉTABLISSENT, ce qui est précisément le mécanisme prévu par
 * KNOWLEDGE_DEPENDENCY.md pour qu'une leçon enseigne un terme que le lexique
 * situe plus haut.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare.
 */

/** Le motif de la leçon, figé à une étape — non interactif. */
const Motif = ({ etape = 4 }) => (
  <PatternLab
    motif={MOTIFS.escalier}
    etape={etape}
    onEtape={() => {}}
    maxEtape={etape}
    montrerEcart
  />
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — La régularité, puis la formule. La LETTRE n'est pas encore le
       sujet : elle n'arrive qu'au module 2, qui garde ainsi sa découverte. */
    1: [
      {
        id: 'regularite',
        type: 'concepts',
        title: 'Une régularité se prévoit',
        summary: 'Quand un motif ajoute toujours la même chose à chaque étape, on peut prévoir n’importe quelle étape sans la dessiner.',
        visual: <Motif etape={4} />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Dans l’escalier, chaque étape ajoute exactement <strong>2 carreaux</strong> — jamais
              3, jamais 1. Cet ajout constant est ce qui rend la suite prévisible :
            </p>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• étape 1 : 3 carreaux ;</li>
              <li>• étape 2 : 3 + 2 = 5 ;</li>
              <li>• étape 3 : 5 + 2 = 7 ;</li>
              <li>• et ainsi de suite, indéfiniment.</li>
            </ul>
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-sm text-slate-700">
              Mais compter d’étape en étape jusqu’à la 100ᵉ serait absurde. Il faut une manière de
              répondre <strong>d’un coup</strong>, pour n’importe quelle étape.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le laboratoire qui refusait d’aller jusqu’à l’étape 20.</div>
          </div>
        ),
      },
      {
        id: 'formule',
        type: 'methodes',
        title: 'Une formule répond pour tous les cas',
        summary: 'Une formule est une recette de calcul écrite une seule fois, valable pour toutes les étapes à la fois.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-violet-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                Pour l’escalier :{' '}
                <strong className="font-mono">2 × (numéro de l’étape) + 1</strong>
              </div>
              <div className="text-xs text-slate-500">
                Le <strong>2</strong> est ce qu’on ajoute à chaque étape ; le <strong>+ 1</strong>{' '}
                est le carreau qui était déjà là au départ.
              </div>
            </div>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• étape 4 : 2 × 4 + 1 = <strong>9</strong> ✓</li>
              <li>• étape 20 : 2 × 20 + 1 = <strong>41</strong> — sans rien dessiner ;</li>
              <li>• étape 100 : 2 × 100 + 1 = <strong>201</strong>.</li>
            </ul>
            <p className="text-sm text-slate-500">
              Une bonne formule doit redonner les étapes déjà connues. C’est ainsi qu’on la vérifie.
            </p>
          </div>
        ),
      },
    ],

    /* M2 — La lettre. Elle arrive maintenant, à la seule place où elle a un
       sens : celle du nombre qu'on refuse de fixer. */
    2: [
      {
        id: 'calcul-litteral',
        type: 'vocabulaire',
        title: 'La lettre est un emplacement',
        summary: 'Dans une expression, une lettre est simplement la place d’un nombre qu’on ne veut pas fixer.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Écrire « le numéro de l’étape » à chaque fois est long. On le remplace par{' '}
              <strong>une seule lettre</strong> :
            </p>
            <div className="bg-white rounded-xl border-2 border-indigo-200 p-4 text-center space-y-1">
              <div className="font-mono text-sm text-slate-500">2 × (numéro de l’étape) + 1</div>
              <div className="text-slate-400 text-xs">devient</div>
              <div className="font-mono text-2xl font-black text-indigo-700">
                {ecrire(MOTIFS.escalier.regle)}
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>• la lettre <strong>n’est pas</strong> une étiquette, ni l’initiale d’un mot ;</li>
              <li>• elle <strong>n’a pas</strong> une valeur secrète à deviner ;</li>
              <li>• c’est un <strong>trou dans un calcul</strong>, qu’on remplit quand on veut.</li>
            </ul>
            <div className="bg-white rounded-xl border border-indigo-100 p-3 text-sm text-slate-600">
              On n’écrit pas le signe × entre un nombre et une lettre :{' '}
              <span className="font-mono">{ecrireAvecFois(expr(2, 1))}</span> s’écrit simplement{' '}
              <span className="font-mono font-bold">{ecrire(expr(2, 1))}</span>.
            </div>
          </div>
        ),
      },
      {
        id: 'inconnue-variable',
        type: 'concepts',
        title: 'Inconnue ou variable ?',
        summary: 'La même lettre joue deux rôles : un nombre précis qu’on cherche, ou un nombre qui change librement.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border-2 border-indigo-200 p-3 space-y-1">
              <div className="font-semibold text-indigo-800">Une inconnue</div>
              <div className="text-slate-600 text-xs">
                « Quelle étape compte 41 carreaux ? » — il n’y a qu’<strong>une seule réponse</strong>,
                et on la cherche.
              </div>
            </div>
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 space-y-1">
              <div className="font-semibold text-emerald-800">Une variable</div>
              <div className="text-slate-600 text-xs">
                « Combien de carreaux à l’étape n ? » — n peut prendre{' '}
                <strong>toutes les valeurs</strong>, et la formule répond à chaque fois.
              </div>
            </div>
            <p className="text-slate-500">
              C’est la question posée qui décide du rôle, pas la lettre elle-même.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — Écrire une expression, et le piège somme/produit. */
    3: [
      {
        id: 'ecrire-expression',
        type: 'methodes',
        title: 'Traduire une situation en expression',
        summary: 'On repère ce qui se répète (le coefficient) et ce qui reste fixe (la constante), puis on écrit.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-sky-200 p-3 space-y-1.5 text-sm">
              <div className="text-slate-700">
                « Un forfait de 5 € plus 3 € par heure » →{' '}
                <strong className="font-mono">{ecrire(expr(3, 5), 'h')}</strong>
              </div>
              <div className="text-xs text-slate-500">
                Le 3 se répète (une fois par heure), le 5 ne bouge jamais.
              </div>
            </div>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 space-y-1.5 text-sm">
              <div className="font-semibold text-orange-800">Le piège des parenthèses</div>
              <div className="text-slate-700">
                « le double de n, plus 3 » s’écrit <span className="font-mono">2n + 3</span> ;
              </div>
              <div className="text-slate-700">
                « le double de (n plus 3) » s’écrit <span className="font-mono">2 × (n + 3)</span>.
              </div>
              <div className="text-xs text-slate-600">
                Avec n = 5, la première donne 13 et la seconde 16 : ce ne sont pas les mêmes
                recettes. L’ordre des mots décide de la place des parenthèses.
              </div>
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Substituer. */
    4: [
      {
        id: 'substituer',
        type: 'methodes',
        title: 'Remplacer la lettre par un nombre',
        summary: 'On remet le signe × là où il était caché, on remplace la lettre, puis on applique les priorités.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                Pour <strong className="font-mono">{ecrire(expr(3, 2))}</strong> avec{' '}
                <strong>n = 4</strong> :
              </div>
              <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                <li>on relit l’écriture complète : <span className="font-mono">{ecrireAvecFois(expr(3, 2))}</span> ;</li>
                <li>on remplace : <span className="font-mono">3 × 4 + 2</span> ;</li>
                <li>priorités : <span className="font-mono">12 + 2 = {valeur(expr(3, 2), 4)}</span>.</li>
              </ol>
            </div>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">L’erreur à ne plus faire :</strong> écrire{' '}
              <span className="font-mono">34</span> en collant le 3 et le 4. Le signe × est caché,
              mais il est bien là : <span className="font-mono">3n</span> veut dire{' '}
              <span className="font-mono">3 × n</span>.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — Développer, lu sur l'aire. */
    5: [
      {
        id: 'distributivite',
        type: 'regles',
        title: 'Développer un produit',
        summary: 'Multiplier une somme par un nombre revient à multiplier chaque morceau, puis à additionner.',
        visual: (
          <RectangleDistribLab k={3} e={expr(1, 2)} n={3} onN={() => {}} valeurs={[3]} />
        ),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-purple-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono">
                3 × (n + 2) = {ecrire(developper(3, expr(1, 2)))}
              </div>
              <div className="text-xs text-slate-500">
                Couper le rectangle en deux ne change pas son aire : on peut donc calculer l’aire
                d’un bloc, ou la somme des deux morceaux — le résultat est le même.
              </div>
            </div>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">L’erreur à ne plus faire :</strong> écrire{' '}
              <span className="font-mono">3 × (n + 2) = 3n + 2</span>. Ce serait oublier de
              multiplier le second morceau — donc perdre tout un bout du rectangle.
            </div>
            <p className="text-sm text-slate-500">
              Pour vérifier un développement, il suffit de <strong>remplacer la lettre par un
              nombre</strong> dans les deux écritures : elles doivent donner le même résultat.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-developper',
        type: 'memoriser',
        title: '⭐ Chaque morceau, sans en oublier',
        summary: 'k × (a + b) = k × a + k × b.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                Le facteur va sur TOUS les morceaux
              </div>
              <div className="text-sm text-slate-600 font-semibold font-mono">
                3 × (n + 2) = 3n + 6 &nbsp;·&nbsp; jamais 3n + 2
              </div>
            </div>
          </div>
        ),
      },
    ],

    /* M6 — Produire une formule et l'appliquer. */
    6: [
      {
        id: 'produire-formule',
        type: 'methodes',
        title: 'Produire une formule à partir d’une situation',
        summary: 'On compte deux ou trois cas, on cherche ce qui se répète, on écrit la recette, puis on la vérifie sur un cas connu.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="space-y-1 list-decimal list-inside">
              <li>compter quelques cas et les noter dans un tableau ;</li>
              <li>repérer <strong>ce qu’on ajoute à chaque fois</strong> — c’est le coefficient ;</li>
              <li>repérer <strong>ce qui ne bouge jamais</strong> — c’est la constante ;</li>
              <li>écrire la recette, puis <strong>la vérifier sur un cas déjà compté</strong>.</li>
            </ol>
            <div className="bg-white rounded-xl border border-rose-100 p-3">
              La dernière étape n’est pas facultative : une formule qui ne redonne pas les cas
              connus est fausse, et c’est le seul moyen de s’en apercevoir seul.
            </div>
          </div>
        ),
      },
    ],
  },
};
