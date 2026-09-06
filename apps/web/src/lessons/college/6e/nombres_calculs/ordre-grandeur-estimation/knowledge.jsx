import React from 'react';
import { MiniNumberLine, MiniGrid } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Ordre de grandeur et estimation » (6e) —
 * SOURCE UNIQUE de vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à
 * l'instant où le geste vient de lui donner un sens, puis il reste sur la
 * carte. Rien n'est réécrit dans les modules : la brique et la carte
 * montrent le même texte.
 *
 * ORDRE — un item n'emploie que ce qui est déjà posé au module qui le
 * déclare ou avant (docs/architecture/KNOWLEDGE_DEPENDENCY.md) :
 *
 *   M1  juger un résultat sans le recalculer
 *   M2  le nombre ami ; une estimation est APPROCHÉE, et c'est normal
 *   M3  l'ARRONDI, la convention du pile-au-milieu, le pas d'arrondi
 *   M4  plusieurs arrondis raisonnables donnent le même ordre de grandeur
 *   M5  une différence est une distance entre deux nombres
 *   M6  un produit est une surface : le rectangle donne l'ordre de grandeur
 *   M7  plausible / suspect / impossible — et ce qu'un contrôle ne prouve pas
 *   M8  la démarche complète dans un problème
 *   M9  choisir le niveau de précision qu'exige la situation
 *
 * Le mot « arrondi » était jusqu'ici employé partout — jusque dans le titre
 * d'une étape verrouillée, lisible avant même son ouverture — sans être
 * jamais défini. Il est désormais posé au module 3, après la première
 * manipulation sur la droite graduée qui lui donne son sens.
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

    /* ── M1 — Juger sans recalculer. ── */
    1: [
      {
        id: 'ordre-de-grandeur',
        type: 'concepts',
        title: 'L’ordre de grandeur',
        summary: 'La taille approximative d’un résultat — assez pour juger, sans le calculer.',
        visual: (
          <MiniNumberLine
            min={0} max={1400}
            ticks={[{ at: 0, label: '0', strong: true }, { at: 600, label: '600', strong: true }, { at: 1200, label: '1 200' }, { at: 1400 }]}
            marks={[{ at: 600, label: 'attendu' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>398 + 205 : les deux nombres sont proches de 400 et de 200.</div>
              <div>→ on attend un résultat proche de <strong>600</strong>.</div>
              <div className="text-rose-600">1 203 est presque le double : impossible.</div>
            </Encadre>
            <p>
              Connaître l'ordre de grandeur d'un résultat ne demande aucun calcul détaillé, et
              suffit pourtant à écarter une réponse absurde.
            </p>
            <Souvenir>le 1 203 que tu as rejeté sans jamais reposer l'addition.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Le nombre ami, et l'approximation assumée. ── */
    2: [
      {
        id: 'nombre-ami',
        type: 'vocabulaire',
        title: 'Un nombre ami',
        summary: 'Un nombre rond, tout proche du nombre de départ, avec lequel le calcul se fait de tête.',
        visual: (
          <MiniNumberLine
            min={190} max={210}
            ticks={[{ at: 190, label: '190' }, { at: 197 }, { at: 200, label: '200', strong: true }, { at: 210, label: '210' }]}
            marks={[{ at: 197, label: '197' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>197 → 200 · 302 → 300 · 49 → 50</div>
              <div>200 + 300 = 500 se fait sans écrire une ligne.</div>
            </Encadre>
            <p>
              Un bon nombre ami est <strong>proche</strong> et <strong>simple</strong>. Les deux à
              la fois : 190 est proche de 197 mais peu commode ; 100 est très simple mais bien
              trop loin.
            </p>
            <Souvenir>les 197 et 302 que tu as remplacés, un par un, sur la droite graduée.</Souvenir>
          </div>
        ),
      },
      {
        id: 'estimation-approchee',
        type: 'regles',
        title: 'Une estimation n’est pas le résultat exact',
        summary: 'Elle donne un repère : un petit écart est normal, un grand écart signale une erreur.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>198 + 297 ≈ 200 + 300 = 500 · exact : <strong>495</strong></div>
              <div className="text-slate-400">5 d'écart : parfaitement normal.</div>
            </Encadre>
            <p>
              Remplacer les nombres, c'est accepter de perdre un peu de précision — c'est le prix
              de la rapidité, et il est volontaire. L'estimation ne remplace jamais le calcul
              exact ; elle l'encadre.
            </p>
            <Piege>
              Un résultat proche de l'estimation n'est pas prouvé juste pour autant. L'estimation
              attrape les grosses erreurs, pas les petites.
            </Piege>
            <Souvenir>les cas A et B qui donnaient la même estimation et deux résultats différents.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Arrondir. ── */
    3: [
      {
        id: 'arrondi',
        type: 'vocabulaire',
        title: 'Arrondir',
        summary: 'Remplacer un nombre par le nombre rond le plus proche, à un rang choisi.',
        visual: (
          <MiniNumberLine
            min={280} max={290}
            ticks={[{ at: 280, label: '280', strong: true }, { at: 285 }, { at: 286 }, { at: 290, label: '290', strong: true }]}
            marks={[{ at: 286, label: '286' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>286 est à <strong>6</strong> de 280, et à <strong>4</strong> de 290.</div>
              <div>→ arrondi à la dizaine, 286 devient <strong>290</strong>.</div>
            </Encadre>
            <p>
              Le résultat de cette opération s'appelle l'<strong>arrondi</strong> du nombre. Sur
              la droite graduée, il se lit directement : c'est celui des deux voisins ronds dont
              on est le plus près.
            </p>
            <Piege>
              Arrondir n'est pas « couper les derniers chiffres ». 286 arrondi à la dizaine ne
              donne pas 280 : on regarde de quel voisin on est le plus proche.
            </Piege>
            <Souvenir>les points que tu as posés entre deux graduations pour choisir le plus proche.</Souvenir>
          </div>
        ),
      },
      {
        id: 'convention-milieu',
        type: 'regles',
        title: 'Pile au milieu : on prend au-dessus',
        summary: 'Quand le nombre est à égale distance des deux voisins, la convention arrondit au plus grand.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>750 est à 50 de 700, et à 50 de 800.</div>
              <div>→ par convention, 750 devient <strong>800</strong>.</div>
            </Encadre>
            <p>
              Les deux choix seraient également proches : ce n'est pas la précision qui tranche,
              c'est un accord entre nous. Il existe pour que deux personnes arrondissant le même
              nombre trouvent la même chose.
            </p>
            <Souvenir>le 750 exactement au milieu, qui ne se départageait pas tout seul.</Souvenir>
          </div>
        ),
      },
      {
        id: 'pas-arrondi',
        type: 'methodes',
        title: 'Choisir le rang où l’on arrondit',
        summary: 'Plus le nombre est grand, plus on peut arrondir large sans fausser l’ordre de grandeur.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>49 → à la dizaine : 50</div>
              <div>347 → à la centaine : 300</div>
              <div>4 128 → au millier : 4 000</div>
            </Encadre>
            <p>
              Il n'y a pas de règle rigide : le but est d'obtenir un calcul faisable de tête sans
              trop s'éloigner. Sur des nombres à quatre chiffres, arrondir au millier reste tout
              à fait honnête.
            </p>
            <Souvenir>le 4 128 + 3 950 que tu as ramené à 4 000 + 4 000.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — Plusieurs chemins, un même ordre. ── */
    4: [
      {
        id: 'plusieurs-arrondis',
        type: 'regles',
        title: 'Plusieurs arrondis peuvent être bons',
        summary: 'Ce qui compte est l’ordre de grandeur obtenu, pas le chemin choisi pour y arriver.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>347 + 251 : 350 + 250 = 600</div>
              <div>347 + 251 : 300 + 300 = 600</div>
              <div className="text-slate-400">exact : 598 — les deux estimations tiennent.</div>
            </Encadre>
            <p>
              Deux élèves peuvent arrondir différemment et avoir raison tous les deux. Une
              estimation ne se corrige pas comme un calcul exact : on juge si elle est{' '}
              <em>utile</em>, pas si elle est <em>identique</em>.
            </p>
            <Souvenir>les deux stratégies qui tombaient toutes les deux sur 600.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — La différence est une distance. ── */
    5: [
      {
        id: 'difference-distance',
        type: 'concepts',
        title: 'Une différence est une distance',
        summary: 'Sur la droite graduée, l’écart entre les deux arrondis donne l’ordre de grandeur.',
        visual: (
          <MiniNumberLine
            min={0} max={800}
            ticks={[{ at: 0, label: '0', strong: true }, { at: 300, label: '300', strong: true }, { at: 800, label: '800', strong: true }]}
            marks={[{ at: 300, label: '≈ 302' }, { at: 800, label: '≈ 798' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>798 − 302 : de 300 à 800, il y a <strong>500</strong>.</div>
            </Encadre>
            <p>
              Vue comme une distance, une soustraction devient lisible à l'œil. Pas besoin de la
              poser pour savoir si le résultat doit valoir 500 ou 1 000.
            </p>
            <Souvenir>les deux repères placés sur la droite, et l'écart entre eux.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Le produit est une surface. ── */
    6: [
      {
        id: 'produit-rectangle',
        type: 'methodes',
        title: 'Estimer un produit avec un rectangle',
        summary: 'On arrondit les deux facteurs, et la surface du rectangle donne l’ordre de grandeur.',
        visual: <MiniGrid cols={5} rows={4} filled={Array.from({ length: 20 }, (_, i) => ({ r: Math.floor(i / 5), c: i % 5 }))} color="#818cf8" />,
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>49 × 21 : 49 ≈ 50 et 21 ≈ 20</div>
              <div>→ 50 × 20 = <strong>1 000</strong> (exact : 1 029)</div>
            </Encadre>
            <p>
              Sur un produit, une erreur d'un seul zéro change tout : 129 au lieu de 1 029 se
              repère instantanément dès qu'on a l'ordre de grandeur en tête.
            </p>
            <Piege>
              Arrondir les deux facteurs vers le haut gonfle l'estimation, les arrondir tous les
              deux vers le bas la réduit. Ce n'est pas grave pour juger, mais il faut le savoir.
            </Piege>
            <Souvenir>le rectangle de 50 sur 20 dont tu as lu la surface d'un coup d'œil.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M7 — Le verdict. ── */
    7: [
      {
        id: 'plausible-suspect-impossible',
        type: 'methodes',
        title: 'Trois verdicts pour un résultat',
        summary: 'Proche de l’estimation : plausible. Nettement écarté : suspect. Hors d’échelle : impossible.',
        body: (
          <div className="space-y-2">
            <div className="space-y-1.5">
              <Encadre><strong className="text-emerald-700">Plausible</strong> — 601 pour une estimation de 600</Encadre>
              <Encadre><strong className="text-amber-700">Suspect</strong> — 800 pour une estimation de 1 000 : à vérifier</Encadre>
              <Encadre><strong className="text-rose-700">Impossible</strong> — 1 601 pour une estimation de 600</Encadre>
            </div>
            <Piege>
              « Plausible » ne veut pas dire « juste ». C'est un contrôle qui laisse passer les
              petites erreurs : seul le calcul exact peut trancher.
            </Piege>
            <Souvenir>les six verdicts que tu as rendus sans reposer un seul calcul.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-estimer-toujours',
        type: 'memoriser',
        title: '⭐ Estimer avant, contrôler après',
        summary: 'Un ordre de grandeur en tête avant le calcul, et une comparaison après : deux secondes, beaucoup d’erreurs évitées.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1 text-center text-sm font-black text-rose-700">
              <div>① J'ARRONDIS CHAQUE NOMBRE</div>
              <div>② JE CALCULE DE TÊTE → l'ordre de grandeur</div>
              <div>③ JE FAIS LE CALCUL EXACT</div>
              <div>④ JE COMPARE : cohérent ou pas ?</div>
            </div>
            <p className="text-xs text-slate-500">
              Ce réflexe ne coûte presque rien et rattrape les erreurs les plus coûteuses : un
              zéro en trop, un chiffre oublié, une virgule déplacée.
            </p>
          </div>
        ),
      },
    ],

    /* ── M8 — Dans un vrai problème. ── */
    8: [
      {
        id: 'demarche-estimation',
        type: 'methodes',
        title: 'La démarche complète dans un problème',
        summary: 'Je comprends, j’estime, je calcule, je compare — et je décide si je garde ma réponse.',
        body: (
          <div className="space-y-2">
            <Encadre>
              <div>① quelle opération la situation demande-t-elle ?</div>
              <div>② quel ordre de grandeur j'attends</div>
              <div>③ le calcul exact</div>
              <div>④ mon résultat colle-t-il à ce que j'attendais ?</div>
            </Encadre>
            <p>
              L'estimation vient <strong>avant</strong> le calcul : après, on est déjà influencé
              par le résultat trouvé, et l'on a tendance à le croire.
            </p>
            <Souvenir>les 198 cahiers estimés à 400 € avant de trouver 396 €.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M9 — Combien de précision ? ── */
    9: [
      {
        id: 'niveau-de-precision',
        type: 'regles',
        title: 'La situation décide de la précision',
        summary: 'Un ordre de grandeur suffit parfois ; ailleurs, seule la valeur exacte convient.',
        body: (
          <div className="space-y-2">
            <div className="space-y-1.5">
              <Encadre><strong>≈ suffit</strong> — la foule d'un stade, la durée d'un trajet</Encadre>
              <Encadre><strong>exact obligatoire</strong> — le prix à payer en caisse, une dose de médicament</Encadre>
            </div>
            <p>
              Ce n'est pas une question de difficulté : c'est une question de conséquence. La
              bonne question est toujours « que se passe-t-il si je me trompe un peu ? ».
            </p>
            <Souvenir>la dose de médicament, la seule des quatre situations à ne tolérer aucun « environ ».</Souvenir>
          </div>
        ),
      },
    ],
  },
};
