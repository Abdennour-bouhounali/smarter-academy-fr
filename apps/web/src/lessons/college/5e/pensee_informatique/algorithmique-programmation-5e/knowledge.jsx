import React from 'react';
import ProgramView from './components/ProgramView';
import TraceCanvas from './components/TraceCanvas';
import {
  executer, makeRepeat, avancer, tourner, lit, formule, polygone, angleExterieur,
} from './components/trace';

/**
 * Connaissances de la leçon « Algorithmique et programmation » (5e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit l'élève
 * est la réduction cumulative des modules validés. Deux présentations
 * consomment ces données : le tiroir « Ma carte » et l'« À retenir » de fin de
 * module ; la synthèse du test final affiche la carte complète. Aucun module
 * n'écrit son propre résumé (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE, dans l'ordre où la carte se construit — c'est
 * exactement la progression demandée au brief (instruction → séquence →
 * entrée → sortie → formule → prédiction → exécution → modification →
 * répétition) :
 *
 *     instruction, séquence, ordre, boucle   (acquis 6e, mesurés au module 0)
 *              ↓
 *     l'instruction porte un NOMBRE  (M1)  ── le paramètre
 *              ↓
 *     prédire puis exécuter  (M1)          ── la méthode
 *              ↓
 *     l'ENTRÉE : une variable lue  (M2)    ── un programme, une famille de figures
 *              ↓
 *     la FORMULE : le programme calcule  (M3)
 *              ↓
 *     RÉPÉTER n fois  (M4)                 ── la boucle, née du besoin
 *              ↓
 *     360 ÷ n ferme la figure  (M5)        ── la boucle rencontre la géométrie
 *              ↓
 *     déboguer par comparaison  (M6)       ── la méthode de réparation
 *
 * Rien n'est arbitraire : on ne peut pas comprendre la formule (M3) sans la
 * variable (M2), ni chercher 360 ÷ n (M5) sans la boucle paramétrée (M4), ni
 * réparer un programme (M6) sans savoir l'exécuter pas à pas (M1).
 *
 * NOTE LEXIQUE. Les ids `instruction-programme` et `boucle` sont ceux du
 * lexique d'audit, où ils portent le niveau 6e : ils sont donc en
 * `priorKnowledge` et non établis ici. `variable-informatique`,
 * `entree-programme`, `formule-programme`, `repeter-n-fois` et
 * `angle-exterieur` sont propres à cette leçon.
 *
 * PÉRIMÈTRE. Aucun item ne parle de condition, de « si », de « tant que », ni
 * d'une variable qu'on modifie en cours de programme : ce sont les matières de
 * la 4e et de la 3e (lesson.config.js, teachingScope.exclude).
 */

/* Les figures des items sont CALCULÉES par le moteur, jamais dessinées à la
   main : un item ne peut donc pas illustrer autre chose que ce qu'il énonce. */
const CARRE_60 = [makeRepeat(4, [avancer(60), tourner(90)])];
const CARRE_VARIABLE = [makeRepeat(4, [avancer(lit('cote')), tourner(90)])];
const RECTANGLE_FORMULE = [
  makeRepeat(2, [avancer(lit('cote')), tourner(90), avancer(formule('cote', { fois: 2 })), tourner(90)]),
];

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — L'instruction porte un nombre, et on peut prédire avant d'exécuter.
       Ni variable, ni boucle : seulement le paramètre et la méthode. */
    1: [
      {
        id: 'instruction-parametree',
        type: 'concepts',
        title: 'Une instruction porte un nombre',
        summary:
          'AVANCER tout seul ne veut rien dire : il faut dire DE COMBIEN. Ce nombre est le paramètre de l’instruction — le changer change le dessin.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              En 6e, le robot avançait d’une case : le pas était toujours le même. Ici, chaque
              instruction emporte sa valeur, et deux valeurs différentes ne tracent pas la même
              figure.
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {[30, 70].map((d) => (
                <div key={d} className="rounded-xl border-2 border-indigo-200 bg-white p-2 space-y-1">
                  <div className="text-center font-mono text-xs font-bold text-indigo-700">
                    AVANCER de {d} · TOURNER de 90°
                  </div>
                  <TraceCanvas
                    resultat={executer([avancer(d), tourner(90), avancer(d)])}
                    hauteur={110}
                    montrerStylo={false}
                    fond="uni"
                    titre={`deux traits de ${d}`}
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-700">
              Le programme ne décrit pas une image : il décrit les <strong>gestes</strong> qui la
              produisent. C’est pour cela qu’on peut le lire à l’avance et deviner le résultat.
            </p>
          </div>
        ),
      },
      {
        id: 'prevoir-executer',
        type: 'methodes',
        title: 'Prévoir, puis exécuter',
        summary:
          'On lit le programme instruction par instruction, on note ce qu’on attend, puis on l’exécute et on compare. Un écart n’est pas une faute : c’est une information.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
              <li>Repérer où part le stylo, et dans quelle direction.</li>
              <li>Suivre les instructions <strong>dans l’ordre</strong>, une par une.</li>
              <li>Dire à l’avance ce que la figure devrait être.</li>
              <li>Exécuter, et comparer avec ce qu’on avait prévu.</li>
            </ol>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-sm text-slate-700">
              Prévoir avant d’exécuter, c’est ce qui distingue un programmeur d’un spectateur :
              sans prédiction, on ne peut pas savoir si le programme est juste — seulement voir ce
              qu’il fait.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — L'entrée : une variable lue. Le cœur de « variables (lecture) ». */
    2: [
      {
        id: 'variable-informatique',
        type: 'vocabulaire',
        title: 'La variable',
        summary:
          'Une variable est un nom qui garde une valeur. Le programme écrit le NOM ; au moment de s’exécuter, il va lire la valeur que ce nom contient.',
        visual: <ProgramView programme={CARRE_VARIABLE} env={{ cote: 60 }} titre={null} compact />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Dans <span className="font-mono text-xs">AVANCER de cote</span>, le mot{' '}
              <span className="font-mono font-bold text-violet-700">cote</span> n’est pas une
              longueur : c’est une <strong>étiquette</strong>. La longueur, elle, est rangée à côté
              — et c’est elle que le programme lit.
            </p>
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3 text-sm text-slate-700">
              On <strong>définit</strong> la variable en lui donnant une valeur
              (<span className="font-mono">cote = 60</span>), et le programme la{' '}
              <strong>lit</strong> chaque fois qu’il rencontre son nom. Changer la valeur une seule
              fois change toutes les instructions qui la lisent.
            </div>
            <p className="text-xs text-slate-500 italic">
              📍 Souvenir : le curseur qu’on glisse, et le carré qui grandit sans qu’on ait touché
              au programme.
            </p>
          </div>
        ),
      },
      {
        id: 'entree-programme',
        type: 'concepts',
        title: 'L’entrée et la sortie',
        summary:
          'Ce qu’on donne au programme avant qu’il démarre est son entrée ; ce qu’il produit est sa sortie. Un même programme, avec deux entrées, donne deux sorties.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-violet-200 bg-white p-3">
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-center">
                <div className="rounded-lg border-2 border-violet-300 bg-violet-50 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-violet-600">Entrée</div>
                  <div className="font-mono text-sm font-black text-violet-900">cote = 60</div>
                </div>
                <span aria-hidden="true" className="text-xl text-slate-400">→</span>
                <div className="rounded-lg border-2 border-slate-300 bg-slate-50 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Programme</div>
                  <div className="font-mono text-xs font-bold text-slate-700">le même, toujours</div>
                </div>
                <span aria-hidden="true" className="text-xl text-slate-400">→</span>
                <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-emerald-600">Sortie</div>
                  <div className="font-mono text-sm font-black text-emerald-900">un carré de 60</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              C’est ce qui rend un programme <strong>réutilisable</strong> : il ne sert pas à tracer
              UN carré, mais <strong>tous</strong> les carrés. On ne le réécrit pas, on change son
              entrée.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — La formule : le programme calcule à partir de l'entrée. */
    3: [
      {
        id: 'formule-programme',
        type: 'regles',
        title: 'Une formule dans l’instruction',
        summary:
          'Une instruction peut contenir un calcul portant sur une variable : AVANCER de cote × 2 avance du double de ce que contient cote, quelle que soit sa valeur.',
        visual: (
          <TraceCanvas
            resultat={executer(RECTANGLE_FORMULE, { env: { cote: 50 } })}
            hauteur={150}
            montrerLongueurs
            montrerStylo={false}
            titre="rectangle dont la longueur vaut cote × 2"
          />
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              La formule <span className="font-mono font-bold text-sky-700">cote × 2</span> n’est
              pas un nombre : c’est une <strong>façon de calculer</strong> un nombre. Le programme
              lit d’abord <span className="font-mono">cote</span>, puis effectue le calcul, puis
              avance.
            </p>
            <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 space-y-1 text-sm text-slate-700">
              <div>si <span className="font-mono">cote = 50</span> → il avance de <strong>100</strong></div>
              <div>si <span className="font-mono">cote = 30</span> → il avance de <strong>60</strong></div>
              <div className="text-xs text-slate-500 pt-1">
                Le rapport entre les deux côtés, lui, ne change jamais : c’est la formule qui le
                garantit, pas la valeur.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              C’est le même geste qu’en calcul littéral : une lettre représente un nombre inconnu,
              et l’expression dit ce qu’on en fait.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — La boucle, née du besoin de ne pas tout réécrire. */
    4: [
      {
        id: 'repeter-n-fois',
        type: 'regles',
        title: 'RÉPÉTER n fois',
        summary:
          'Quand un même bloc d’instructions revient plusieurs fois de suite, on l’écrit une seule fois dans une boucle « répéter n fois ». Le dessin est identique ; c’est ce qu’on écrit qui raccourcit.',
        visual: <ProgramView programme={CARRE_60} env={{}} titre={null} />,
        body: (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">
                  Écrit à la main
                </div>
                <div className="font-mono text-xs text-slate-600 leading-relaxed">
                  AVANCER 60 · TOURNER 90°<br />
                  AVANCER 60 · TOURNER 90°<br />
                  AVANCER 60 · TOURNER 90°<br />
                  AVANCER 60 · TOURNER 90°
                </div>
                <div className="mt-1 text-xs font-bold text-slate-500">8 instructions</div>
              </div>
              <div className="rounded-xl border-2 border-purple-300 bg-purple-50 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-purple-700 mb-1">
                  Avec la boucle
                </div>
                <div className="font-mono text-xs text-purple-900 leading-relaxed">
                  RÉPÉTER 4 fois [<br />
                  &nbsp;&nbsp;AVANCER 60<br />
                  &nbsp;&nbsp;TOURNER 90°<br />
                  ]
                </div>
                <div className="mt-1 text-xs font-bold text-purple-700">1 boucle, 2 instructions</div>
              </div>
            </div>
            <div className="rounded-xl border-2 border-purple-200 bg-white p-3 text-sm text-slate-700">
              <strong>Le même dessin, exactement.</strong> La boucle n’ajoute rien et n’enlève rien
              au tracé : elle dit seulement « refais ce bloc n fois ». Ce qui change, c’est la
              longueur du programme — et donc le nombre d’endroits où l’on peut se tromper.
            </div>
            <p className="text-sm text-slate-500">
              Le nombre de tours peut lui aussi être une variable : <span className="font-mono">RÉPÉTER n fois</span>{' '}
              trace autant de côtés que <span className="font-mono">n</span> en contient.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — Le lien 360 ÷ n : la boucle rencontre la géométrie. */
    5: [
      {
        id: 'angle-exterieur',
        type: 'regles',
        title: 'Pour fermer la figure : 360 ÷ n',
        summary:
          'En parcourant le contour d’une figure régulière à n côtés, le stylo fait un tour complet, soit 360°, réparti en n virages égaux. Chaque virage vaut donc 360 ÷ n.',
        visual: (
          <div className="grid grid-cols-3 gap-2">
            {[3, 5, 8].map((n) => (
              <div key={n} className="rounded-xl border-2 border-emerald-200 bg-white p-1.5 space-y-1">
                <TraceCanvas
                  resultat={executer(polygone(n, 45))}
                  hauteur={95}
                  montrerStylo={false}
                  montrerDepart={false}
                  fond="uni"
                  titre={`polygone à ${n} côtés`}
                />
                <div className="text-center font-mono text-[11px] font-bold text-emerald-800">
                  {n} × {angleExterieur(n)}° = 360°
                </div>
              </div>
            ))}
          </div>
        ),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Le stylo part dans une direction et doit y revenir : sinon, la figure ne se referme
              pas. Or revenir à sa direction de départ, c’est avoir tourné de <strong>360°</strong>{' '}
              en tout.
            </p>
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 text-center space-y-1">
              <div className="font-mono text-lg font-black text-emerald-800">
                n × angle = 360°&nbsp;&nbsp;donc&nbsp;&nbsp;angle = 360 ÷ n
              </div>
              <div className="text-xs text-emerald-700">
                6 côtés → 60° &nbsp;·&nbsp; 8 côtés → 45° &nbsp;·&nbsp; 10 côtés → 36°
              </div>
            </div>
            <div className="rounded-xl border-2 border-orange-200 bg-white p-3 text-sm text-slate-700">
              <strong className="text-orange-800">L’erreur à ne plus faire :</strong> tourner de
              l’angle qu’on VOIT dans la figure. Dans un triangle équilatéral, l’angle du coin
              mesure 60° — mais le stylo, lui, tourne de <strong>120°</strong>. Il ne suit pas
              l’angle : il enjambe le coin.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-360-sur-n',
        type: 'memoriser',
        title: '⭐ n virages égaux font un tour complet',
        summary: 'Pour une figure régulière à n côtés : angle = 360 ÷ n.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                RÉPÉTER n fois [ AVANCER · TOURNER de 360 ÷ n ]
              </div>
              <div className="text-sm text-slate-600 font-semibold">
                n donne le nombre de côtés ; 360 ÷ n donne le virage.
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              En cas de doute : multiplie ton angle par n. Si tu ne tombes pas sur 360, la figure ne
              se refermera pas.
            </p>
          </div>
        ),
      },
    ],

    /* M6 — Déboguer : comparer l'attendu et l'obtenu, instruction par instruction. */
    6: [
      {
        id: 'deboguer',
        type: 'methodes',
        title: 'Trouver l’instruction fautive',
        summary:
          'Un programme qui bugue ne se relit pas au hasard : on l’exécute pas à pas et on cherche la PREMIÈRE instruction où le tracé quitte ce qu’on attendait. L’erreur est là, pas avant.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
              <li>Dire ce que la figure <strong>devrait</strong> être — sans cela, rien à comparer.</li>
              <li>Exécuter pas à pas, et s’arrêter au premier écart.</li>
              <li>Regarder l’instruction qui vient d’être exécutée : c’est elle, la coupable.</li>
              <li>Corriger, relancer, comparer de nouveau.</li>
            </ol>
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3 text-sm text-slate-700">
              Les instructions <strong>avant</strong> le premier écart sont justes : elles ont
              produit exactement ce qui était attendu. Inutile de les relire — c’est ce qui rend la
              méthode rapide, même sur un long programme.
            </div>
            <p className="text-sm text-slate-500">
              Dans un programme à boucle, l’erreur se répète à chaque tour : une figure fausse
              « régulièrement » désigne presque toujours le corps de la boucle.
            </p>
          </div>
        ),
      },
    ],
  },
};
