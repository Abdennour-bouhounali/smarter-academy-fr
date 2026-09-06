import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniNumberLine, MiniGrid, PlaceValue } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Les quatre opérations » (6e) — SOURCE UNIQUE
 * de vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à
 * l'instant où le geste vient de lui donner un sens, puis il reste sur la
 * carte. Rien n'est réécrit dans les modules : la brique et la carte
 * montrent le même texte.
 *
 * ORDRE — un item n'emploie QUE le vocabulaire déjà posé au module qui le
 * déclare ou avant, puisque la brique rend ce texte à sa position dans le
 * flux d'exposition (docs/architecture/KNOWLEDGE_DEPENDENCY.md) :
 *
 *   M1  quatre actions concrètes → quatre opérations
 *   M2  réunir : les termes et la somme ; l'échange 10 unités = 1 dizaine
 *   M3  retirer / comparer / compléter ; la différence ; l'échange à l'envers
 *   M4  des groupes égaux : les facteurs et le produit ; décomposer
 *   M5  partager / grouper ; le QUOTIENT et le reste ; le reste dans la vie
 *   M6  poser un calcul : aligner les rangs
 *   M7  les stratégies de calcul mental
 *   M8  choisir son outil de calcul
 *   M9  la démarche de résolution d'un problème
 *
 * Le mot « quotient » n'apparaissait jusqu'ici que dans une OPTION du test
 * final : il est désormais posé au module 5, à l'instant où l'élève vient
 * de former ses groupes et de constater ce qui reste.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

const Encadre = ({ children }) => (
  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
    {children}
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Quatre actions, quatre opérations. ── */
    1: [
      {
        id: 'quatre-situations',
        type: 'concepts',
        title: 'Chaque opération raconte une action',
        summary: 'Réunir, retirer, faire des groupes égaux, partager : quatre actions, quatre signes.',
        body: (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5 text-sm">
              <Encadre><strong>+</strong> <span className="text-slate-500">on réunit</span></Encadre>
              <Encadre><strong>−</strong> <span className="text-slate-500">on retire</span></Encadre>
              <Encadre><strong>×</strong> <span className="text-slate-500">groupes égaux</span></Encadre>
              <Encadre><strong>÷</strong> <span className="text-slate-500">on partage</span></Encadre>
            </div>
            <p>
              Avant de chercher un résultat, on cherche l'<strong>action</strong> : que fait-on
              réellement avec les objets ? Le signe vient après, il ne fait que la traduire.
            </p>
            <Piege>
              Les grands nombres d'un énoncé ne disent rien de l'opération. « 4 582 bonbons pour
              2 enfants » est un partage, même si les nombres sont impressionnants.
            </Piege>
            <Souvenir>les quatre situations du magasin de fournitures que tu as triées.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Réunir : les mots de l'addition, et l'échange. ── */
    2: [
      {
        id: 'termes-somme',
        type: 'vocabulaire',
        title: 'Termes et somme',
        summary: 'Les nombres que l’on réunit sont les termes ; le résultat est la somme.',
        visual: (
          <MiniNumberLine
            min={0} max={14}
            ticks={[{ at: 0, label: '0', strong: true }, { at: 7, label: '7', strong: true }, { at: 11, label: '11', strong: true }, { at: 14 }]}
            marks={[{ at: 11, label: '7 + 4' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <Encadre>
              <MathText>{'$5 + 7 = 12$'}</MathText>
              <div className="text-slate-500 text-xs">5 et 7 sont les termes · 12 est la somme</div>
            </Encadre>
            <p>
              Les deux termes jouent le même rôle : réunir 5 puis 7 ou 7 puis 5 donne la même
              somme. On peut donc commencer par le terme le plus commode.
            </p>
            <Souvenir>les billes bleues transférées une à une dans la main gauche.</Souvenir>
          </div>
        ),
      },
      {
        id: 'retenue',
        type: 'regles',
        title: 'La retenue est un échange',
        summary: '10 unités valent 1 dizaine : la retenue déménage cette dizaine dans la colonne voisine.',
        visual: (
          <PlaceValue
            columns={[{ label: 'd', digit: '3' }, { label: 'u', digit: '8' }]}
            highlight={1}
          />
        ),
        body: (
          <div className="space-y-2">
            <Encadre>
              <div><MathText>{'$8 + 7 = 15$'}</MathText></div>
              <div className="text-slate-500 text-xs">15 unités = 1 dizaine + 5 unités</div>
            </Encadre>
            <p>
              On écrit les 5 unités et on porte la dizaine dans la colonne de gauche. Rien n'est
              inventé et rien n'est perdu : c'est le même nombre, rangé autrement.
            </p>
            <Piege>
              Écrire 15 dans une colonne est impossible : une colonne ne loge qu'un seul chiffre.
              C'est justement pour cela que la retenue existe.
            </Piege>
            <Souvenir>la colonne des unités qui débordait, et le petit 1 posé au-dessus des dizaines.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Retirer, comparer, compléter. ── */
    3: [
      {
        id: 'trois-sens-soustraction',
        type: 'concepts',
        title: 'Une soustraction, trois questions',
        summary: 'Retirer, comparer deux quantités, chercher ce qui manque : le même calcul répond aux trois.',
        body: (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-1.5 text-sm">
              <Encadre><strong>Retirer</strong> <span className="text-slate-500">j’avais 13, j’en enlève 5</span></Encadre>
              <Encadre><strong>Comparer</strong> <span className="text-slate-500">13 et 8 : combien d’écart ?</span></Encadre>
              <Encadre><strong>Compléter</strong> <span className="text-slate-500">j’ai 8, il m’en faut 13</span></Encadre>
            </div>
            <p>
              Les trois situations n'ont pas la même histoire, et pourtant elles se calculent
              toutes de la même façon. Reconnaître les trois évite de rester bloqué devant un
              énoncé où rien n'est « enlevé ».
            </p>
            <Souvenir>les 5 € qui te manquaient pour atteindre les 13 € du prix.</Souvenir>
          </div>
        ),
      },
      {
        id: 'difference',
        type: 'vocabulaire',
        title: 'La différence',
        summary: 'Le résultat d’une soustraction s’appelle la différence.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <MathText>{'$13 - 8 = 5$'}</MathText>
              <div className="text-slate-500 text-xs">13 est le premier terme · 8 le second · 5 la différence</div>
            </Encadre>
            <p>
              Ici l'ordre compte : <MathText>{'$13 - 8$'}</MathText> et{' '}
              <MathText>{'$8 - 13$'}</MathText> ne racontent pas la même histoire. On part
              toujours du plus grand.
            </p>
            <Souvenir>les billes encadrées du groupe A, celles que B n’avait pas.</Souvenir>
          </div>
        ),
      },
      {
        id: 'echange-emprunt',
        type: 'regles',
        title: 'Quand la colonne est trop petite, on échange',
        summary: 'On casse une dizaine du rang voisin en 10 unités pour pouvoir retirer.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div><MathText>{'$3 - 7$'}</MathText> <span className="text-slate-500">impossible dans la colonne</span></div>
              <div className="text-slate-500 text-xs">on casse 1 dizaine → 13 − 7 = 6</div>
            </Encadre>
            <p>
              C'est l'échange du module précédent, joué à l'envers : là on regroupait 10 unités en
              1 dizaine, ici on casse 1 dizaine en 10 unités. Le nombre du haut ne change pas de
              valeur, seulement de rangement.
            </p>
            <Piege>
              L'erreur la plus fréquente est de retourner la colonne et de calculer 7 − 3. Le
              résultat paraît propre, il est faux : on ne choisit pas l'ordre dans une colonne.
            </Piege>
            <Souvenir>la dizaine empruntée pour que 3 − 7 devienne possible.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — Groupes égaux. ── */
    4: [
      {
        id: 'facteurs-produit',
        type: 'vocabulaire',
        title: 'Facteurs et produit',
        summary: 'Les deux nombres multipliés sont les facteurs ; le résultat est le produit.',
        visual: <MiniGrid cols={6} rows={4} filled={Array.from({ length: 24 }, (_, i) => ({ r: Math.floor(i / 6), c: i % 6 }))} color="#a78bfa" />,
        body: (
          <div className="space-y-2">
            <Encadre>
              <MathText>{'$4 \\times 6 = 24$'}</MathText>
              <div className="text-slate-500 text-xs">4 et 6 sont les facteurs · 24 est le produit</div>
            </Encadre>
            <p>
              Un facteur dit <strong>combien de groupes</strong>, l'autre dit{' '}
              <strong>la taille d'un groupe</strong>. Sur la grille, ce sont les lignes et les
              colonnes — et tourner la grille d'un quart de tour ne change pas le nombre de cases :{' '}
              <MathText>{'$4 \\times 6 = 6 \\times 4$'}</MathText>.
            </p>
            <Souvenir>les boîtes de 3 objets que tu as remplies une à une.</Souvenir>
          </div>
        ),
      },
      {
        id: 'decomposer-produit',
        type: 'methodes',
        title: 'Décomposer pour multiplier de tête',
        summary: 'On coupe un facteur en morceaux faciles, on multiplie chaque morceau, puis on réunit.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div><MathText>{'$7 \\times 23 = 7 \\times 20 + 7 \\times 3$'}</MathText></div>
              <div className="text-slate-500 text-xs">140 + 21 = 161</div>
            </Encadre>
            <p>
              La grille explique pourquoi : couper la grille en deux blocs ne fait perdre aucune
              case, donc on peut compter chaque bloc à part puis réunir les deux comptes.
            </p>
            <Piege>
              Il faut multiplier <em>chaque</em> morceau. Oublier le second (7 × 20 seulement)
              donne 140 au lieu de 161.
            </Piege>
            <Souvenir>les 23 coupés en 20 + 3 pour rendre le calcul faisable de tête.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — Partager, grouper, et ce qui reste. ── */
    5: [
      {
        id: 'partage-groupement',
        type: 'concepts',
        title: 'Diviser répond à deux questions',
        summary: '« Combien chacun reçoit-il ? » et « combien de groupes puis-je faire ? » : même calcul.',
        body: (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-1.5 text-sm">
              <Encadre><strong>Partager</strong> <span className="text-slate-500">24 billes pour 6 amis → 4 chacun</span></Encadre>
              <Encadre><strong>Grouper</strong> <span className="text-slate-500">24 billes par paquets de 6 → 4 paquets</span></Encadre>
            </div>
            <p>
              Les deux gestes sont différents à la main, et pourtant{' '}
              <MathText>{'$24 \\div 6 = 4$'}</MathText> répond aux deux. C'est ce qui rend la
              division si utile dans les problèmes.
            </p>
            <Souvenir>les 24 billes distribuées une à une, puis regroupées par paquets de 6.</Souvenir>
          </div>
        ),
      },
      {
        id: 'quotient',
        type: 'vocabulaire',
        title: 'Quotient et reste',
        summary: 'Le quotient est le nombre de groupes complets ; le reste est ce qui ne rentre dans aucun.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div><MathText>{'$17 \\div 5$'}</MathText> <span className="text-slate-500">→ 3 groupes de 5, et 2 de côté</span></div>
              <div className="text-slate-500 text-xs">quotient = 3 · reste = 2</div>
            </Encadre>
            <p>
              Le <strong>quotient</strong> répond à « combien de fois entier ? » et le{' '}
              <strong>reste</strong> à « qu'est-ce qui ne rentre pas ? ». Le nombre que l'on
              partage s'appelle le <strong>dividende</strong>, celui par lequel on partage le{' '}
              <strong>diviseur</strong>.
            </p>
            <Piege>
              Le reste est toujours <strong>plus petit que le diviseur</strong>. S'il ne l'est
              pas, c'est qu'un groupe complet a été oublié.
            </Piege>
            <Souvenir>les 2 billes restées seules, impossibles à mettre dans un groupe de 5.</Souvenir>
          </div>
        ),
      },
      {
        id: 'egalite-euclidienne',
        type: 'formules',
        title: 'L’égalité qui vérifie une division',
        summary: 'dividende = diviseur × quotient + reste — de quoi contrôler soi-même son calcul.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <MathText>{'$17 = 5 \\times 3 + 2$'}</MathText>
            </Encadre>
            <p>
              Elle se lit dans les objets : les groupes complets{' '}
              <MathText>{'$5 \\times 3$'}</MathText>, plus ce qui traîne à côté. C'est la
              vérification la plus rapide qui existe — sans repasser par la division.
            </p>
            <Souvenir>les 3 paquets de 5 posés sur la table, et les 2 billes à côté.</Souvenir>
          </div>
        ),
      },
      {
        id: 'sens-du-reste',
        type: 'regles',
        title: 'Dans un problème, le reste se décide',
        summary: 'Selon la question, on garde le quotient, on ajoute 1, ou on ne garde que le reste.',
        body: (
          <div className="space-y-2">
            <div className="space-y-1.5 text-sm">
              <Encadre><span className="text-slate-500">« Combien de bus faut-il ? » → quotient <strong>+ 1</strong> si le reste n’est pas nul</span></Encadre>
              <Encadre><span className="text-slate-500">« Combien de groupes complets ? » → le <strong>quotient</strong></span></Encadre>
              <Encadre><span className="text-slate-500">« Combien en restera-t-il ? » → le <strong>reste</strong></span></Encadre>
            </div>
            <p>
              Le calcul est le même dans les trois cas ; c'est la question qui décide de la
              réponse. Deux enfants qui ne montent pas dans le bus restent deux enfants à pied.
            </p>
            <Souvenir>les 17 enfants et les bus de 5 places : 3 bus ne suffisaient pas.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-quatre-mots',
        type: 'memoriser',
        title: '⭐ Le résultat porte un nom différent à chaque fois',
        summary: 'somme, différence, produit, quotient : un mot par opération.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1 text-center text-sm font-black text-rose-700">
              <div>+ → la SOMME de deux termes</div>
              <div>− → la DIFFÉRENCE de deux termes</div>
              <div>× → le PRODUIT de deux facteurs</div>
              <div>÷ → le QUOTIENT (et parfois un reste)</div>
            </div>
            <p className="text-xs text-slate-500">
              Ces mots reviennent dans tous les énoncés. « Calcule la différence » veut dire
              « soustrais », sans qu'aucun signe ne soit écrit.
            </p>
          </div>
        ),
      },
    ],

    /* ── M6 — Poser un calcul. ── */
    6: [
      {
        id: 'aligner-les-rangs',
        type: 'methodes',
        title: 'Poser, c’est aligner les rangs',
        summary: 'Unités sous unités, dizaines sous dizaines — et virgule sous virgule.',
        visual: (
          <PlaceValue
            columns={[{ label: 'c', digit: '2' }, { label: 'd', digit: '4' }, { label: 'u', digit: '7' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Une colonne = un rang. Tant que les colonnes sont justes, chaque calcul de colonne
              est un tout petit calcul, et les échanges circulent d'une colonne à sa voisine.
            </p>
            <Piege>
              Aligner à droite marche pour les entiers, mais pas pour les nombres à virgule :
              c'est la <strong>virgule</strong> qu'on aligne, pas le dernier chiffre. Sinon les
              dixièmes tombent sous les unités.
            </Piege>
            <Souvenir>les colonnes du tableau que tu as remplies rang par rang.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M7 — Calculer de tête, mais malin. ── */
    7: [
      {
        id: 'strategies-mentales',
        type: 'methodes',
        title: 'Arrondir puis corriger',
        summary: 'On remplace un nombre par un voisin facile, on calcule, puis on rattrape l’écart.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div><MathText>{'$47 + 9 = 47 + 10 - 1 = 56$'}</MathText></div>
              <div><MathText>{'$14 \\times 5 = 14 \\times 10 \\div 2 = 70$'}</MathText></div>
            </Encadre>
            <p>
              Ajouter 10 est immédiat, doubler et prendre la moitié aussi. Toute la stratégie
              consiste à ramener un calcul difficile à un calcul facile, puis à corriger de
              l'écart exact qu'on s'est accordé.
            </p>
            <Piege>
              La correction va toujours dans le sens contraire : si on a ajouté 1 de trop, on le
              retire. Se tromper de sens donne 58 au lieu de 56.
            </Piege>
            <Souvenir>le +10 puis −1 qui rendait 47 + 9 instantané.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M8 — Le bon outil. ── */
    8: [
      {
        id: 'choisir-outil',
        type: 'regles',
        title: 'Choisir son outil avant de calculer',
        summary: 'Mental si une stratégie saute aux yeux ; posé si les rangs sont nombreux ; estimation pour contrôler.',
        body: (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-1.5 text-sm">
              <Encadre><strong>Mental</strong> <span className="text-slate-500">un voisin facile existe (+9, ×5, ×2)</span></Encadre>
              <Encadre><strong>Posé</strong> <span className="text-slate-500">grands nombres, virgules, échanges en série</span></Encadre>
              <Encadre><strong>Estimation</strong> <span className="text-slate-500">pour vérifier que le résultat est plausible</span></Encadre>
            </div>
            <p>
              L'outil n'est pas une question de goût : il dépend des nombres. Poser 25 + 100 fait
              perdre du temps ; calculer 398 + 487 de tête fait perdre des points.
            </p>
            <Piege>
              L'estimation ne remplace jamais un résultat exact. Elle sert à repérer une réponse
              absurde, pas à répondre.
            </Piege>
            <Souvenir>les cinq calculs où tu as dû choisir ton outil avant de te lancer.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M9 — Résoudre un problème. ── */
    9: [
      {
        id: 'demarche-probleme',
        type: 'methodes',
        title: 'Cinq gestes pour un problème',
        summary: 'Comprendre, trier les données, choisir l’opération, calculer, puis répondre à la question posée.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 space-y-1">
              <div>① je relis la situation sans chiffre en tête</div>
              <div>② je garde les données utiles, j'écarte les autres</div>
              <div>③ je choisis l'opération d'après l'action</div>
              <div>④ je calcule avec l'outil adapté</div>
              <div>⑤ je relis la question et j'y réponds vraiment</div>
            </div>
            <Piege>
              Le geste ⑤ est celui qu'on saute le plus souvent. Un calcul juste qui ne répond pas
              à la question posée ne vaut rien : 16 étagères pleines n'est pas la réponse à
              « combien d'étagères faut-il ? ».
            </Piege>
            <Souvenir>les données « une sortie scolaire » que tu as écartées, parce qu’elles ne se calculent pas.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
