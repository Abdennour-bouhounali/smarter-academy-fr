import React from 'react';
import { MiniGrid, MiniNumberLine } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Résolution de problèmes » (6e) — SOURCE UNIQUE
 * de vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Cette leçon n'enseigne pas de nouveaux calculs : elle enseigne une
 * DÉMARCHE. Ses connaissances sont donc surtout des méthodes et des règles
 * de conduite — ce qui les rend d'autant plus faciles à laisser implicites,
 * et d'autant plus nécessaires à poser explicitement.
 *
 * ORDRE — chaque item n'emploie que ce qui est déjà posé au module qui le
 * déclare ou avant (docs/architecture/KNOWLEDGE_DEPENDENCY.md) :
 *
 *   M1  construire la situation avant de chercher un calcul
 *   M2  c'est la situation qui donne le sens, pas les mots de l'énoncé
 *   M3  trier les informations ; savoir dire qu'il en manque une
 *   M4  choisir un modèle qui rend la relation visible
 *   M5  plusieurs stratégies peuvent être bonnes
 *   M6  les cinq structures de problèmes à une étape
 *   M7  le résultat intermédiaire, et la chaîne de calcul
 *   M8  estimer avant, contrôler après
 *   M9  une réponse complète : résultat + unité + phrase
 *   M10 lire un raisonnement étape par étape, jusqu'à la PREMIÈRE erreur
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

const Encadre = ({ children }) => (
  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 space-y-1">
    {children}
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Construire d'abord, calculer ensuite. ── */
    1: [
      {
        id: 'construire-avant-calculer',
        type: 'methodes',
        title: 'Construire la situation avant de chercher un calcul',
        summary: 'On rend la situation visible ; l’opération apparaît alors d’elle-même.',
        visual: <MiniGrid cols={6} rows={4} filled={Array.from({ length: 24 }, (_, i) => ({ r: Math.floor(i / 6), c: i % 6 }))} color="#a78bfa" />,
        body: (
          <div className="space-y-2">
            <p>
              Devant un énoncé, la première question n'est pas « quelle opération ? » mais{' '}
              <strong>« qu'est-ce qui se passe ? »</strong>. Une fois les 6 groupes de 24 posés
              devant soi, personne n'a besoin qu'on lui dise de multiplier.
            </p>
            <Piege>
              Chercher l'opération en premier revient à deviner. On tombe juste parfois, et on ne
              sait jamais pourquoi.
            </Piege>
            <Souvenir>les 6 classes que tu as ajoutées une par une jusqu'à 144 élèves.</Souvenir>
          </div>
        ),
      },
      {
        id: 'interpreter-le-resultat',
        type: 'regles',
        title: 'Le calcul ne répond pas toujours tout seul',
        summary: 'Un résultat exact peut demander une décision avant de devenir une réponse.',
        visual: (
          <MiniNumberLine
            min={0} max={200}
            ticks={[{ at: 0, label: '0', strong: true }, { at: 50, label: '50' }, { at: 100, label: '100' }, { at: 144, label: '144', strong: true }, { at: 150, label: '150' }, { at: 200 }]}
            marks={[{ at: 144, label: '3 bus' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>144 personnes, 50 places par bus</div>
              <div>2 bus = 100 places → il manque de la place</div>
              <div>3 bus = 150 places → tout le monde monte</div>
            </Encadre>
            <p>
              Le troisième bus n'est pas plein, et il est indispensable quand même. C'est la
              situation, pas le calcul, qui tranche.
            </p>
            <Souvenir>le troisième bus, à moitié vide, mais sans lequel 44 personnes restaient à quai.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Le sens vient de la situation. ── */
    2: [
      {
        id: 'situation-avant-mots',
        type: 'regles',
        title: 'Un même calcul, plusieurs histoires',
        summary: 'C’est la situation qui donne son sens au calcul — jamais un mot repéré dans l’énoncé.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div><strong>Ana donne 7 billes sur 18</strong> → 18 − 7 : des objets partent</div>
              <div><strong>Léo a 15 cartes, Zoé 9</strong> → 15 − 9 : personne ne donne rien</div>
            </Encadre>
            <p>
              Deux histoires sans rapport, la même soustraction. C'est pour cela qu'aucun mot ne
              peut servir d'étiquette : le mot « reste » n'annonce pas plus une soustraction que
              le mot « chacun » n'annonce une division.
            </p>
            <Piege>
              Chercher un mot-clé dans l'énoncé est la stratégie qui échoue le plus souvent au
              collège : les énoncés qui piègent sont écrits exprès pour cela.
            </Piege>
            <Souvenir>les billes d'Ana qui disparaissaient, et les cartes de Léo qui ne bougeaient pas.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Trier, et savoir que ça manque. ── */
    3: [
      {
        id: 'trier-les-donnees',
        type: 'methodes',
        title: 'Trier les informations par la question',
        summary: 'Une information est utile ou non selon LA question posée, pas en soi.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>240 cahiers · 12 classes · 2 € le cahier · le directeur est là depuis 8 ans</div>
              <div className="text-slate-400">Question : combien coûtent tous les cahiers ?</div>
              <div>→ on garde 240 et 2 € ; le reste est vrai mais inutile <em>ici</em>.</div>
            </Encadre>
            <p>
              Le tri se fait toujours en tenant la question en tête. Change la question, et les
              informations utiles changent avec elle.
            </p>
            <Souvenir>les 12 classes que tu as écartées, alors qu'elles étaient parfaitement vraies.</Souvenir>
          </div>
        ),
      },
      {
        id: 'information-manquante',
        type: 'regles',
        title: 'Parfois, il manque une information',
        summary: '« On ne peut pas répondre » est une vraie réponse — inventer un nombre n’en est pas une.',
        body: (
          <div className="space-y-2">
            <p>
              Si une donnée indispensable n'est pas dans l'énoncé, aucun calcul ne peut la faire
              apparaître. Le dire est un raisonnement juste, pas un aveu d'échec.
            </p>
            <Piege>
              Inventer une donnée plausible produit un résultat qui a l'air correct et qui ne veut
              rien dire. C'est plus grave qu'une erreur de calcul, parce que rien ne le trahit.
            </Piege>
            <Souvenir>les boîtes de crayons dont on ne connaissait ni le nombre, ni le contenu.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — Le bon modèle. ── */
    4: [
      {
        id: 'choisir-un-modele',
        type: 'methodes',
        title: 'Choisir un modèle qui rend la relation visible',
        summary: 'Groupes, barres, droite graduée, tableau : chacun éclaire un type de relation.',
        body: (
          <div className="space-y-2">
            <div className="space-y-1.5">
              <Encadre><strong>Groupes</strong> — des paquets identiques répétés</Encadre>
              <Encadre><strong>Schéma en barres</strong> — un tout et ses parties, ou deux quantités à comparer</Encadre>
              <Encadre><strong>Droite graduée</strong> — une position, un trajet, une progression</Encadre>
              <Encadre><strong>Tableau</strong> — plusieurs données de même nature à comparer d'un coup d'œil</Encadre>
            </div>
            <p>
              Il n'y a pas de modèle universel. La bonne question est : « lequel me fait{' '}
              <em>voir</em> ce que je cherche ? »
            </p>
            <Souvenir>la barre de Luc coupée en deux : les 12 € dépensés, et le reste en question.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — Plusieurs chemins. ── */
    5: [
      {
        id: 'plusieurs-strategies',
        type: 'concepts',
        title: 'Plusieurs chemins peuvent être bons',
        summary: 'Dessiner ou calculer : le choix dépend de la situation et de la taille des nombres.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>27 élèves par groupes de 4 : dessiner marche, calculer aussi.</div>
              <div>4 827 élèves : dessiner ne marche plus.</div>
            </Encadre>
            <p>
              Le dessin fait <strong>comprendre</strong> une situation nouvelle ; le calcul fait{' '}
              <strong>aller vite</strong> quand les nombres grandissent. Savoir passer de l'un à
              l'autre vaut mieux que connaître une seule méthode par cœur.
            </p>
            <Souvenir>les deux méthodes de Léa et Nathan, justes toutes les deux.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Les cinq structures. ── */
    6: [
      {
        id: 'structures-de-problemes',
        type: 'concepts',
        title: 'Cinq façons dont une situation est bâtie',
        summary: 'Combiner, retirer, comparer, grouper, partager : reconnaître la structure, c’est trouver l’opération.',
        body: (
          <div className="space-y-2">
            <div className="space-y-1.5">
              <Encadre><strong>Combiner</strong> — deux quantités réunies en une (14 pommes et 9 poires)</Encadre>
              <Encadre><strong>Retirer</strong> — une partie enlevée d'un total (37 places sur 60)</Encadre>
              <Encadre><strong>Comparer</strong> — l'écart entre deux quantités (45 m et 28 m)</Encadre>
              <Encadre><strong>Grouper</strong> — des paquets identiques répétés (9 bouquets de 6)</Encadre>
              <Encadre><strong>Partager</strong> — un total distribué équitablement (84 bonbons, 7 enfants)</Encadre>
            </div>
            <p>
              Retirer et comparer donnent la même soustraction ; grouper et partager donnent la
              même division. La structure ne se lit pas dans l'opération : c'est l'inverse.
            </p>
            <Souvenir>les six problèmes que tu as résolus sans qu'aucun ne te dise quoi faire.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-comprendre-avant',
        type: 'memoriser',
        title: '⭐ Comprendre, puis choisir, puis calculer',
        summary: 'Jamais l’inverse : un calcul lancé trop tôt répond souvent à une autre question.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1 text-center text-sm font-black text-rose-700">
              <div>① QU'EST-CE QUI SE PASSE ?</div>
              <div>② QUELLES DONNÉES SERVENT ?</div>
              <div>③ QUELLE OPÉRATION ?</div>
              <div>④ JE CALCULE</div>
              <div>⑤ EST-CE QUE JE RÉPONDS À LA QUESTION ?</div>
            </div>
            <p className="text-xs text-slate-500">
              Les trois premiers gestes ne demandent aucun calcul. C'est pourtant là que la
              plupart des erreurs se jouent.
            </p>
          </div>
        ),
      },
    ],

    /* ── M7 — Plusieurs étapes. ── */
    7: [
      {
        id: 'resultat-intermediaire',
        type: 'concepts',
        title: 'Le résultat intermédiaire',
        summary: 'Un nombre qu’il faut trouver pour continuer, et qui n’est pas la réponse.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>8 boîtes × 24 crayons = <strong>192</strong> ← intermédiaire</div>
              <div>192 − 35 distribués = <strong>157</strong> ← réponse</div>
            </Encadre>
            <p>
              Un résultat intermédiaire doit être <strong>nommé</strong> : « 192 crayons achetés »,
              pas « 192 ». Un nombre sans nom se perd, et on ne sait plus quoi en faire à l'étape
              suivante.
            </p>
            <Piege>
              Rendre 192 comme réponse finale est l'erreur classique : le calcul est juste, mais
              on s'est arrêté au milieu du chemin.
            </Piege>
            <Souvenir>les 192 crayons achetés, qu'il fallait trouver avant de pouvoir en retirer 35.</Souvenir>
          </div>
        ),
      },
      {
        id: 'chaine-de-calcul',
        type: 'methodes',
        title: 'Construire la chaîne de calcul',
        summary: 'Comprendre → trouver l’intermédiaire → calculer la réponse → répondre.',
        body: (
          <div className="space-y-2">
            <p>
              Chaque maillon utilise le résultat du précédent. Écrire la chaîne, avec le nom de
              chaque valeur, permet de reprendre le fil quand on s'est perdu — et de retrouver
              l'endroit exact d'une erreur.
            </p>
            <Souvenir>l'ordre des quatre étiquettes que tu as remises dans le bon ordre.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M8 — Encadrer son propre travail. ── */
    8: [
      {
        id: 'estimer-puis-controler',
        type: 'methodes',
        title: 'Estimer avant, contrôler après',
        summary: 'On remplace les nombres par des voisins ronds pour prévoir l’ordre du résultat.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div><strong>Avant</strong> : 8 × 25 = 200, puis 200 − 35 ≈ 165</div>
              <div><strong>Après</strong> : 157 trouvé — proche de 165, donc plausible ✓</div>
            </Encadre>
            <p>
              L'estimation ne remplace jamais le calcul : elle donne un repère. Un résultat très
              loin du repère signale une erreur avant même de la chercher.
            </p>
            <Piege>
              Un écart raisonnable ne prouve pas que le résultat est exact. L'estimation attrape
              les grosses erreurs, pas les petites.
            </Piege>
            <Souvenir>les ≈ 165 crayons annoncés avant de trouver 157.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M9 — Répondre pour de vrai. ── */
    9: [
      {
        id: 'reponse-complete',
        type: 'regles',
        title: 'Une réponse complète a trois morceaux',
        summary: 'Le résultat, son unité, et une phrase qui répond à la question posée.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div className="text-rose-600">« 157 » → un nombre, pas une réponse</div>
              <div className="text-rose-600">« Il reste 157 € » → mauvaise unité, réponse fausse</div>
              <div className="text-emerald-700">« Il reste 157 crayons. » → complète</div>
            </Encadre>
            <p>
              L'unité n'est pas une décoration : elle dit ce qu'on a compté. Se tromper d'unité,
              c'est répondre à une autre question que celle posée.
            </p>
            <Souvenir>les 33 « bus » qui étaient en réalité 33 passagers.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M10 — Lire un raisonnement. ── */
    10: [
      {
        id: 'premiere-erreur',
        type: 'methodes',
        title: 'Chercher la PREMIÈRE erreur',
        summary: 'On relit les étapes dans l’ordre jusqu’à celle qui ne colle plus à la situation.',
        body: (
          <div className="space-y-2">
            <p>
              Dire « tout est faux » n'apprend rien. Une solution fausse est presque toujours
              juste jusqu'à un certain point : c'est ce point-là qu'il faut trouver, parce que
              tout ce qui suit n'est qu'une conséquence.
            </p>
            <Encadre>
              <div>Une erreur peut se cacher dans le choix de l'opération…</div>
              <div>…dans le calcul lui-même…</div>
              <div>…ou seulement dans la phrase de réponse.</div>
            </Encadre>
            <Souvenir>les 6 heures de travail du vendeur, glissées dans un calcul de prix.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
