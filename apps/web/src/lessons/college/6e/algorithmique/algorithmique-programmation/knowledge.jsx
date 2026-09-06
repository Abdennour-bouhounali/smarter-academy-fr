import React from 'react';
import { MiniGrid } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Algorithmique et programmation » (6e) —
 * SOURCE UNIQUE de vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * C'est une leçon de PROCÉDURES : la plupart des items sont de type
 * `methodes` ou `regles`, et les quatre mots du domaine — instruction,
 * séquence/algorithme, boucle, bug — sont du `vocabulaire` posé chacun
 * APRÈS le geste qui le fait apparaître :
 *
 *   M1  « instruction » — après avoir vu que PARLER ne suffit pas
 *   M2  l'effet exact de chaque instruction (AVANCER, TOURNER, RAMASSER)
 *   M3  « séquence / algorithme » — après avoir enchaîné plusieurs cartes,
 *       et la décomposition d'un trajet en étapes
 *   M4  l'ordre fait partie du programme
 *   M5  « boucle » — après avoir écrit huit fois la même carte, puis une
 *       seule ; et la distinction écrire / exécuter
 *   M6  « bug », la méthode de débogage, et les quatre réflexes
 *   M7  traduire une stratégie écrite en programme
 *
 * Les clés suivent la numérotation RÉELLE des modules de cette leçon (0 à 8,
 * consécutifs) ; le module 0 (diagnostic) et le module 8 (évaluation) ne
 * contribuent rien.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

const Carte = ({ children }) => (
  <span className="inline-block rounded-md border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs font-bold text-slate-700">
    {children}
  </span>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Parler ne suffit pas : l'instruction. ── */
    1: [
      {
        id: 'instruction',
        type: 'vocabulaire',
        title: 'Une instruction',
        summary: 'Un ordre précis, que la machine sait exécuter tel quel — et rien d’autre.',
        visual: (
          <div className="flex items-center gap-1.5">
            <Carte>AVANCER</Carte>
            <Carte>TOURNER →</Carte>
            <Carte>RAMASSER</Carte>
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              ROBI ne comprend qu’une petite liste d’ordres. Chacun a un effet exact, toujours le même.
              Une phrase qu’il ne connaît pas ne produit rien du tout — pas même une erreur.
            </p>
            <Piege>
              Ce n’est pas de la mauvaise volonté ni une panne : une machine ne devine pas ce qu’on
              veut dire. Elle exécute ce qu’elle a reçu, à la lettre.
            </Piege>
            <Souvenir>les trois phrases dites à ROBI, et son haussement d’épaules à chaque fois.</Souvenir>
          </div>
        ),
      },
      {
        id: 'objectif-nest-pas-programme',
        type: 'concepts',
        title: 'Un objectif n’est pas un programme',
        summary: '« Va au drapeau » dit où arriver ; un programme dit comment y aller, pas à pas.',
        visual: (
          <MiniGrid cols={4} rows={3} cell={19} nodes={[{ r: 1, c: 0 }]} filled={[{ r: 1, c: 2 }]} color="#6366f1" />
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1.5">
              <div className="text-slate-500">l’objectif : « ROBI doit atteindre le drapeau »</div>
              <div className="text-slate-800">
                le programme : <Carte>AVANCER</Carte> <Carte>AVANCER</Carte>
              </div>
            </div>
            <p>
              Tout le travail du programmeur tient dans ce passage : <strong>traduire</strong> un but en
              une suite d’ordres que la machine sait faire.
            </p>
            <Souvenir>le drapeau atteint, non pas en le montrant, mais en donnant deux ordres.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Chaque instruction a UN effet, et un seul. ── */
    2: [
      {
        id: 'effet-instruction',
        type: 'regles',
        title: 'Chaque instruction fait une chose, et une seule',
        summary: 'AVANCER change la case ; TOURNER change la direction ; RAMASSER agit là où le robot est.',
        visual: (
          <div className="flex items-center gap-3">
            <MiniGrid cols={3} rows={2} cell={19} nodes={[{ r: 1, c: 0 }, { r: 1, c: 1 }]} color="#0ea5e9" />
            <MiniGrid cols={3} rows={2} cell={19} nodes={[{ r: 1, c: 1 }]} color="#f59e0b" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1 text-sm text-slate-600">
              <div><Carte>AVANCER</Carte> — la case change, la direction ne change pas</div>
              <div><Carte>TOURNER</Carte> — la direction change, la case ne change pas</div>
              <div><Carte>RAMASSER</Carte> — ni l’une ni l’autre : il prend ce qui est SOUS lui</div>
            </div>
            <Piege>
              Croire que <Carte>TOURNER</Carte> déplace aussi le robot est l’erreur la plus fréquente.
              Deux <Carte>TOURNER</Carte> à la suite font un demi-tour <em>sur place</em>.
            </Piege>
            <Souvenir>tes prédictions, vérifiées une par une avant d’exécuter.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Enchaîner : la séquence, et la décomposition. ── */
    3: [
      {
        id: 'sequence-algorithme',
        type: 'vocabulaire',
        title: 'Séquence, algorithme, programme',
        summary: 'Une suite d’instructions exécutées l’une après l’autre pour résoudre un problème.',
        visual: (
          <div className="flex items-center gap-1">
            <Carte>AVANCER</Carte>
            <span className="text-slate-400 text-xs">→</span>
            <Carte>TOURNER ←</Carte>
            <span className="text-slate-400 text-xs">→</span>
            <Carte>AVANCER</Carte>
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Une <strong>séquence</strong>, c’est cet enchaînement d’instructions. Quand la séquence
              résout un problème, on parle d’un <strong>algorithme</strong> ; écrite pour qu’une machine
              l’exécute, elle devient un <strong>programme</strong>.
            </p>
            <p className="text-xs text-slate-500">
              Une situation décrite (« le drapeau est en colonne 2 ») ou un but (« ROBI doit le
              rejoindre ») ne sont ni l’un ni l’autre : ils ne disent pas quoi faire, étape par étape.
            </p>
            <Souvenir>les cinq cartes posées bout à bout pour contourner le premier virage.</Souvenir>
          </div>
        ),
      },
      {
        id: 'decomposer',
        type: 'methodes',
        title: 'Décomposer avant d’écrire',
        summary: 'Regarder le trajet, compter les portions droites et repérer les virages — puis seulement poser les cartes.',
        visual: (
          <MiniGrid
            cols={5} rows={4} cell={16}
            nodes={[{ r: 3, c: 0 }, { r: 3, c: 2 }, { r: 1, c: 2 }]}
            filled={[{ r: 0, c: 3 }]}
            color="#10b981"
          />
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1 text-sm text-slate-600">
              <div>① combien de cases tout droit ?</div>
              <div>② où est le virage, et de quel côté ?</div>
              <div>③ combien de cases ensuite ?</div>
            </div>
            <p>
              Un long trajet devient facile dès qu’on le coupe en morceaux droits séparés par des
              virages. C’est cette découpe qui s’écrit ensuite, telle quelle, en cartes.
            </p>
            <Souvenir>le trajet entre les rochers, compté avant d’être écrit.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — L'ordre fait partie du programme. ── */
    4: [
      {
        id: 'ordre-compte',
        type: 'regles',
        title: 'Changer l’ordre change le résultat',
        summary: 'Un programme n’est pas un sac d’instructions : chacune part de l’état laissé par la précédente.',
        visual: (
          <div className="flex items-center gap-3">
            <MiniGrid cols={4} rows={3} cell={16} filled={[{ r: 0, c: 2 }]} nodes={[{ r: 2, c: 0 }]} color="#8b5cf6" />
            <MiniGrid cols={4} rows={3} cell={16} filled={[{ r: 2, c: 2 }]} nodes={[{ r: 2, c: 0 }]} color="#f43f5e" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Les mêmes cartes, dans deux ordres différents, mènent le robot à deux cases différentes.
              Tourner puis avancer n’est pas avancer puis tourner.
            </p>
            <Piege>
              L’ordre n’est pas une question de présentation : il fait partie du programme, au même
              titre que les cartes elles-mêmes.
            </Piege>
            <Souvenir>les deux programmes lancés côte à côte, arrivés ailleurs l’un que l’autre.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — La boucle : écrire moins, exécuter autant. ── */
    5: [
      {
        id: 'boucle',
        type: 'vocabulaire',
        title: 'La boucle',
        summary: 'La carte RÉPÉTER n FOIS remplace n cartes identiques écrites à la suite.',
        visual: (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <Carte>AV</Carte><Carte>AV</Carte><Carte>AV</Carte><Carte>AV</Carte>
            </div>
            <span className="text-slate-400 text-sm">=</span>
            <Carte>RÉPÉTER 4 FOIS (AV)</Carte>
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Quand la même instruction revient encore et encore, on l’écrit une seule fois en disant
              combien de fois la faire. Le programme raccourcit ; le trajet du robot, lui, ne change
              pas d’un pas.
            </p>
            <Souvenir>les huit cartes du long couloir, remplacées par une seule.</Souvenir>
          </div>
        ),
      },
      {
        id: 'ecrire-vs-executer',
        type: 'regles',
        title: 'Ce qu’on écrit n’est pas ce qui est fait',
        summary: 'Une carte RÉPÉTER 5 FOIS s’écrit une fois et provoque 5 actions.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
              <div className="text-slate-500">1 carte écrite</div>
              <div className="text-slate-800 font-bold">5 actions exécutées</div>
            </div>
            <Piege>
              Compter les cartes pour savoir de combien le robot avance est faux dès qu’une boucle est
              là. Ce qu’il faut compter, ce sont les <strong>actions</strong>.
            </Piege>
            <Souvenir>les deux programmes du raccourci, qui menaient exactement à la même case.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Le bug, et la méthode qui le trouve. ── */
    6: [
      {
        id: 'bug-debogage',
        type: 'vocabulaire',
        title: 'Un bug',
        summary: 'Une erreur dans un programme : il s’exécute très bien, mais ne fait pas ce qu’on voulait.',
        visual: (
          <MiniGrid cols={5} rows={3} cell={17} nodes={[{ r: 1, c: 0 }, { r: 1, c: 3 }]} filled={[{ r: 2, c: 4 }]} color="#f43f5e" />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Un programme qui bugue n’est pas cassé : il fait exactement ce qui est écrit. C’est
              l’écriture qui ne correspond pas au but. Chercher et corriger cette erreur s’appelle{' '}
              <strong>déboguer</strong>.
            </p>
            <p className="text-xs text-slate-500">
              Les vrais programmeurs passent une grande partie de leur temps à cela — ce n’est pas un
              accident du métier, c’est le métier.
            </p>
            <Souvenir>le programme qui envoyait ROBI juste à côté du drapeau.</Souvenir>
          </div>
        ),
      },
      {
        id: 'methode-debogage',
        type: 'methodes',
        title: 'Trouver un bug',
        summary: 'Lancer, observer où le robot quitte le bon chemin, corriger cette instruction-là, relancer.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1 text-sm text-slate-600">
              <div>① je lance le programme</div>
              <div>② je regarde à quel moment ROBI dévie</div>
              <div>③ je corrige <strong>une seule</strong> chose</div>
              <div>④ je relance pour vérifier</div>
            </div>
            <Piege>
              Tout effacer fait perdre la partie déjà juste ; changer des cartes au hasard n’apprend
              rien. C’est l’endroit du dérapage qui désigne l’instruction fautive.
            </Piege>
            <Souvenir>le bouton « Pas à pas », qui montrait l’effet d’une instruction à la fois.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-quatre-reflexes',
        type: 'memoriser',
        title: '⭐ Les quatre réflexes du programmeur',
        summary: 'Je découpe · j’écris · je lance · je corrige.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">🧩 JE DÉCOUPE le trajet en étapes</div>
              <div className="text-sm font-black text-rose-700">🎴 J’ÉCRIS les instructions dans l’ordre</div>
              <div className="text-sm font-black text-rose-700">▶️ JE LANCE et je regarde</div>
              <div className="text-sm font-black text-rose-700">🔧 JE CORRIGE là où ROBI a dévié</div>
            </div>
            <p className="text-xs text-slate-500">
              Ces quatre gestes ne servent pas qu’à ROBI : c’est la boucle de travail de tout
              programmeur, quel que soit le langage.
            </p>
          </div>
        ),
      },
    ],

    /* ── M7 — Du français au programme. ── */
    7: [
      {
        id: 'traduire-strategie',
        type: 'methodes',
        title: 'Traduire une stratégie en programme',
        summary: 'Reprendre la phrase morceau par morceau, et donner à chaque morceau ses cartes.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1 text-sm">
              <div className="text-slate-500">« descendre jusqu’en bas » → <Carte>RÉPÉTER 3 FOIS (AVANCER)</Carte></div>
              <div className="text-slate-500">« ramasser la carotte » → <Carte>RAMASSER</Carte></div>
              <div className="text-slate-500">« tourner vers la droite » → <Carte>TOURNER →</Carte></div>
            </div>
            <p>
              Une consigne écrite en français se découpe comme un trajet : une phrase, un morceau de
              programme. Rien ne s’écrit avant que la phrase correspondante ne soit lue.
            </p>
            <Souvenir>la stratégie du jardinier, transformée phrase par phrase en cartes.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
