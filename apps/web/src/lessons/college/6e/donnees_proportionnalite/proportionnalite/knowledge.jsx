import React from 'react';
import { MiniGrid } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Proportionnalité » (6e) — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à
 * l'instant où le geste vient de lui donner un sens, puis il reste sur la
 * carte. Rien n'est réécrit dans les modules.
 *
 * ORDRE — un item n'emploie QUE le vocabulaire déjà posé à son module ou
 * avant (docs/architecture/KNOWLEDGE_DEPENDENCY.md) :
 *
 *   M1  deux grandeurs qui varient ensemble, et le comportement « double →
 *       double » — SANS le mot savant, qui n'a pas encore de quoi s'appuyer
 *   M2  le mot « proportionnalité », posé une fois le × constant TROUVÉ ;
 *       puis, distinctement, le coefficient de proportionnalité
 *   M3  la part fixe qui casse tout, et les raccourcis double/triple/moitié
 *   M4  le passage par l'unité, et l'équivalence des chemins
 *   M5  choisir la stratégie la plus courte, et vérifier la cohérence
 *   M6  « augmenter ensemble » ne suffit pas, et le réflexe de tester
 *
 * DEUX CONNAISSANCES DISTINCTES, et dans cet ordre : « proportionnalité »
 * (le comportement, M2 étape 2) puis « coefficient de proportionnalité »
 * (le nombre qui le réalise, M2 étape 2 également mais APRÈS). Le mot n'est
 * employé dans aucune demande du module 1 : c'est le geste qui y règne.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Le distributeur : ce qu'on OBSERVE, pas ce qu'on nomme. ── */
    1: [
      {
        id: 'deux-grandeurs',
        type: 'concepts',
        title: 'Deux grandeurs qui varient ensemble',
        summary: 'Avant tout calcul : repérer ce qui varie, et avec quoi.',
        visual: (
          <MiniGrid cols={5} rows={2} cell={20} rowLabels={['Jet.', 'Crê.']} colLabels={['1', '2', '3', '5', '10']} color="#6366f1" />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Une grandeur, c’est ce qui se mesure ou se compte : des jetons, des crêpes, des euros, des
              kilomètres. Dans le distributeur, deux grandeurs bougent ensemble — les jetons donnés et les
              crêpes reçues.
            </p>
            <Piege>
              Tout ce qui figure dans l’énoncé n’est pas une grandeur qui varie. La taille du stand, elle,
              ne change pas quand on met un jeton de plus.
            </Piege>
            <Souvenir>les deux tas qui grossissaient ensemble à chaque jeton ajouté.</Souvenir>
          </div>
        ),
      },
      {
        id: 'double-double',
        type: 'regles',
        title: 'Quand l’une double, l’autre double',
        summary: 'Le comportement du distributeur : deux fois plus de jetons donnent exactement deux fois plus de crêpes.',
        visual: (
          <div className="flex items-center gap-3">
            <MiniGrid cols={2} rows={2} cell={19} rowLabels={['J', 'C']} colLabels={['2', '4']} filled={[{ r: 0, c: 0 }, { r: 1, c: 0 }]} color="#6366f1" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Ce n’est pas évident : d’autres machines auraient pu ajouter toujours la même chose, ou
              ralentir. Celle-ci fait exactement suivre l’une à l’autre.
            </p>
            <Piege>
              Doubler la mise n’ajoute pas « deux de plus » : avec 2 jetons on a 6 crêpes, avec 4 jetons on
              en a 12 — pas 8.
            </Piege>
            <Souvenir>les quatre quantités que tu as essayées au distributeur.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Le nombre constant, puis les deux mots qu'il fait naître. ── */
    2: [
      {
        id: 'proportionnalite',
        type: 'concepts',
        title: 'Une situation de proportionnalité',
        summary: 'Deux grandeurs sont proportionnelles quand on passe de l’une à l’autre en multipliant toujours par le MÊME nombre.',
        visual: (
          <MiniGrid
            cols={4} rows={2} cell={20}
            rowLabels={['Crê.', 'Prix']}
            colLabels={['1', '2', '3', '5']}
            filled={[{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }]}
            color="#0ea5e9"
          />
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm font-mono text-slate-700 space-y-0.5">
              <div>1 × 3 = 3 &nbsp;·&nbsp; 2 × 3 = 6</div>
              <div>3 × 3 = 9 &nbsp;·&nbsp; 5 × 3 = 15</div>
            </div>
            <p>
              C’est ce mot-là qui décrit le comportement du distributeur : la même multiplication, sur
              toutes les lignes, sans exception.
            </p>
            <Piege>
              Une addition peut coller sur UNE ligne (« + 2 »), mais elle change à la ligne suivante
              (« + 4 », « + 6 »). C’est la multiplication, elle, qui ne bouge jamais.
            </Piege>
            <Souvenir>les quatre lignes où tu as choisi « × 3 » plutôt qu’une addition.</Souvenir>
          </div>
        ),
      },
      {
        id: 'coefficient-proportionnalite',
        type: 'vocabulaire',
        title: 'Le coefficient de proportionnalité',
        summary: 'Le nombre constant par lequel on multiplie : il porte un nom parce qu’on s’en sert tout le temps.',
        visual: (
          <MiniGrid cols={4} rows={2} cell={20} rowLabels={['Crê.', 'Prix']} colLabels={['1', '2', '3', '5']} nodes={[{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }]} color="#38bdf8" />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Une fois qu’on le connaît, il répond pour <strong>n’importe quelle</strong> quantité, sans rien
              redessiner : 12 jetons ? 12 × 3 = 36 crêpes.
            </p>
            <p className="text-xs text-slate-500">
              Il n’est pas toujours entier. Au stand du jus, on multiplie par 0,5 : le prix devient alors plus
              petit que la quantité, et c’est normal.
            </p>
            <Piege>
              Il a un sens de lecture. De la première grandeur vers la seconde on multiplie ; pour revenir,
              on divise.
            </Piege>
            <Souvenir>la colonne de « × 3 » identiques, puis le « × 0,5 » du stand de jus.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Le banc d'essai : ce qui casse la proportionnalité. ── */
    3: [
      {
        id: 'part-fixe',
        type: 'regles',
        title: 'Une part fixe casse la proportionnalité',
        summary: 'Un forfait payé une seule fois ne double jamais : la situation n’est plus proportionnelle.',
        visual: (
          <MiniGrid cols={3} rows={2} cell={22} rowLabels={['Pers', 'Prix']} colLabels={['1', '2', '4']} filled={[{ r: 1, c: 0 }]} color="#f43f5e" />
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm font-mono text-slate-700 space-y-0.5">
              <div>1 personne → 5 + 2 = 7 €</div>
              <div>2 personnes → 5 + 4 = 9 €</div>
              <div className="text-rose-600">et non 14 €</div>
            </div>
            <p>
              Les 2 € par personne, eux, doublent bien. Ce sont les 5 € de location, payés une fois pour
              toutes, qui empêchent le prix de suivre.
            </p>
            <Souvenir>la barque qui refusait de doubler, quoi qu’on essaie.</Souvenir>
          </div>
        ),
      },
      {
        id: 'double-triple-moitie',
        type: 'methodes',
        title: 'Double, triple, moitié',
        summary: 'Dans une situation proportionnelle, multiplier une grandeur par un nombre multiplie l’autre par le même nombre.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm font-mono text-slate-700 space-y-0.5">
              <div>4 crêpes → 12 € &nbsp;·&nbsp; 12 crêpes → 36 €</div>
              <div className="text-slate-500">triple d’un côté, triple de l’autre</div>
            </div>
            <p>
              Ces raccourcis évitent de chercher le coefficient : quand la quantité cherchée est un multiple
              simple de celle qu’on connaît, une seule opération suffit.
            </p>
            <Piege>
              Ils ne fonctionnent QUE dans une situation proportionnelle — c’est bien pour cela qu’il faut
              la tester avant de s’en servir.
            </Piege>
            <Souvenir>les trois situations passées au banc d’essai, dont une seule tenait.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — Le tableau : par l'unité, et par plusieurs chemins. ── */
    4: [
      {
        id: 'passage-unite',
        type: 'methodes',
        title: 'Le passage par l’unité',
        summary: 'Trouver ce que vaut UNE unité, puis multiplier par la quantité voulue.',
        visual: (
          <MiniGrid cols={5} rows={2} cell={19} rowLabels={['Crê.', 'Prix']} colLabels={['1', '3', '6', '9', '10']} filled={[{ r: 0, c: 0 }, { r: 1, c: 0 }]} color="#8b5cf6" />
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1 text-sm text-slate-600">
              <div>① je divise pour connaître la valeur de 1</div>
              <div>② je multiplie cette valeur par la quantité cherchée</div>
            </div>
            <p>
              C’est le chemin qui marche <strong>toujours</strong>, quels que soient les nombres. La valeur
              de l’unité est justement le coefficient de proportionnalité.
            </p>
            <Souvenir>la case « 1 crêpe » que tu as remplie en premier, et qui a ouvert toutes les autres.</Souvenir>
          </div>
        ),
      },
      {
        id: 'chemins-equivalents',
        type: 'regles',
        title: 'Plusieurs chemins, une seule réponse',
        summary: 'Par l’unité, en multipliant, en additionnant deux colonnes : tous donnent le même résultat.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm font-mono text-slate-700 space-y-0.5">
              <div>9 × 3 = 27 €</div>
              <div>9 = 3 × 3 → 9 × 3 = 27 €</div>
              <div>9 = 6 + 3 → 18 + 9 = 27 €</div>
            </div>
            <p>
              Dans un tableau de proportionnalité, on lit vers le bas avec le coefficient, et sur le côté avec
              des × 2, ÷ 3, ou des additions de colonnes. Aucun chemin n’est « le bon ».
            </p>
            <Souvenir>les trois calculs du prix de 9 crêpes, qui tombaient tous sur 27 €.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — Institutionnalisation de MÉTHODES. ── */
    5: [
      {
        id: 'choisir-strategie',
        type: 'methodes',
        title: 'Choisir le chemin le plus court',
        summary: 'Regarder les nombres AVANT de calculer : multiple ? diviseur ? sinon, l’unité.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-sm text-slate-700">
              <div><strong>Un multiple</strong> (4 → 8) : je multiplie directement.</div>
              <div><strong>Un diviseur</strong> (6 → 1) : je divise directement.</div>
              <div><strong>Ni l’un ni l’autre</strong> (5 → 7) : je passe par l’unité.</div>
            </div>
            <p>
              Toutes les méthodes donnent la bonne réponse. Ce coup d’œil sur les nombres décide seulement de
              la longueur du trajet.
            </p>
            <Souvenir>les trois situations du stand, dont chacune appelait une stratégie différente.</Souvenir>
          </div>
        ),
      },
      {
        id: 'verifier-coherence',
        type: 'methodes',
        title: 'Vérifier un résultat',
        summary: 'Contrôler le sens (plus de quantité → plus cher) et le rapport (la valeur de l’unité doit être restée la même).',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm font-mono text-slate-700 space-y-0.5">
              <div>5 tickets → 15 € &nbsp;·&nbsp; 1 ticket → 3 €</div>
              <div className="text-rose-600">7 tickets → 17 € ? &nbsp; 17 ÷ 7 ≠ 3</div>
            </div>
            <Piege>
              L’erreur la plus fréquente est d’ajouter au prix l’écart des quantités : de 5 à 7 on ajoute 2,
              donc de 15 on passerait à 17. C’est exactement ce que le contrôle du rapport attrape.
            </Piege>
            <Souvenir>le résultat faux de l’élève, démasqué en une division.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Le piège ultime, et le réflexe qui l'évite. ── */
    6: [
      {
        id: 'augmenter-nest-pas-proportionnel',
        type: 'regles',
        title: 'Augmenter ensemble ne suffit pas',
        summary: 'Deux grandeurs peuvent grandir en même temps sans être proportionnelles.',
        visual: (
          <MiniGrid cols={3} rows={2} cell={22} rowLabels={['Âge', 'Taille']} colLabels={['2', '6', '10']} filled={[{ r: 1, c: 2 }]} color="#f43f5e" />
        ),
        body: (
          <div className="space-y-2">
            <p>
              L’âge et la taille montent ensemble — et pourtant un enfant de 86 cm à 2 ans ne mesure pas
              430 cm à 10 ans. Le rapport, lui, ne reste pas le même.
            </p>
            <Piege>
              « Quand l’un monte, l’autre monte, donc c’est proportionnel » est l’idée fausse la plus tenace
              de toute la leçon. Le résultat absurde est souvent le seul avertissement.
            </Piege>
            <Souvenir>les 4,30 m de Tom à 10 ans, obtenus en appliquant la mauvaise règle.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-tester-avant',
        type: 'memoriser',
        title: '⭐ Tester d’abord, calculer ensuite',
        summary: 'Je double la quantité : l’autre grandeur double-t-elle exactement ? Alors seulement les raccourcis sont permis.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">① je double la quantité</div>
              <div className="text-sm font-black text-rose-700">② l’autre grandeur double-t-elle EXACTEMENT ?</div>
              <div className="text-sm font-black text-rose-700">③ si oui → multiplier, diviser, passer par 1</div>
            </div>
            <p className="text-xs text-slate-500">
              Si non, aucune de ces méthodes n’a le droit d’être employée : il faut revenir au texte du
              problème.
            </p>
          </div>
        ),
      },
    ],
  },
};
