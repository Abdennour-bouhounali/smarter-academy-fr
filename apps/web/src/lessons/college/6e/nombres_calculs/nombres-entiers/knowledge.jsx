import React from 'react';
import MathText from '../../../../common/components/MathText';
import { PlaceValue, MiniNumberLine } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Nombres entiers » (6e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à l'instant
 * où le geste vient de lui donner un sens, puis il reste sur la carte. Rien
 * n'est réécrit dans les modules : la brique et la carte montrent le même
 * texte.
 *
 * ORDRE — un item n'utilise QUE ce qui est déjà établi au module qui le
 * déclare, puisque la brique rend ce texte à sa position dans le flux
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md) :
 *
 *   M1  l'intuition de départ : plus de chiffres = plus grand
 *   M2  la position, le zéro qui tient une place, puis le groupement par dix
 *   M3  la classe (les groupes de trois) et l'écriture française
 *   M4  la valeur d'un chiffre, et chiffre des … ≠ nombre de …
 *   M5  décomposer / recomposer, et le rôle du zéro dans la recomposition
 *   M6  la méthode de comparaison en deux temps
 *   M7  ranger (croissant / décroissant) puis encadrer
 *   M8  la demi-droite graduée : le pas, puis la position
 *   M9  l'ordre de grandeur
 *
 * Les mots « ordre croissant », « ordre décroissant », « pas d'une
 * graduation » et « ordre de grandeur » n'apparaissent donc dans aucun item
 * avant le module qui les pose — c'est précisément le défaut que cette carte
 * répare.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

const Encart = ({ children }) => (
  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
    {children}
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Le coffre : le premier repère, avant toute règle. ── */
    1: [
      {
        id: 'longueur-ecriture',
        type: 'regles',
        title: 'Le nombre de chiffres départage en premier',
        summary: 'À écriture normale, celui qui a le plus de chiffres est le plus grand.',
        body: (
          <div className="space-y-2">
            <Encart>
              <span className="font-mono font-bold">3 900</span>
              <span className="text-slate-400 mx-2">a 4 chiffres</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono font-bold ml-2">12 000</span>
              <span className="text-slate-400 mx-2">en a 5</span>
            </Encart>
            <p>
              Un nombre à 5 chiffres dépasse toujours un nombre à 4 chiffres. C'est le premier
              coup d'œil à avoir : compter les chiffres avant de regarder lesquels.
            </p>
            <Piege>
              Comparer 900 et 12 ne veut rien dire ici : dans 12 000, le 12 ne compte pas des
              unités. Le premier chiffre tout seul ne suffit pas non plus — 9 commence par 9, et
              pourtant 9 est plus petit que 12.
            </Piege>
            <Souvenir>les six étiquettes du coffre que tu as rangées à la main.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — L'atelier base 10 : la position naît du groupement. ── */
    2: [
      {
        id: 'position-chiffre',
        type: 'concepts',
        title: 'Chaque chiffre a une place, et cette place a un nom',
        summary: 'Les chiffres se rangent du plus gros paquet au plus petit : milliers, centaines, dizaines, unités.',
        body: (
          <div className="space-y-2">
            <p>
              Écrire un nombre, c'est ranger les paquets dans l'ordre, du plus gros au plus
              petit. Le tableau de numération n'est rien d'autre que ce rangement, avec une
              colonne par sorte de paquet.
            </p>
            <Encart>
              <span className="font-mono font-bold text-lg">347</span>
              <span className="text-slate-400 mx-2">=</span>
              3 centaines, 4 dizaines et 7 unités
            </Encart>
            <Souvenir>les 3 plaques, 4 barres et 7 cubes que tu as posés pour fabriquer 347.</Souvenir>
          </div>
        ),
      },
      {
        id: 'zero-place',
        type: 'regles',
        title: 'Le zéro tient une place vide',
        summary: "Un 0 dit qu'il n'y a aucun paquet de cette taille — et il empêche les autres chiffres de glisser.",
        visual: (
          <PlaceValue
            columns={[
              { label: 'milliers', digit: '1' },
              { label: 'centaines', digit: '2' },
              { label: 'dizaines', digit: '0' },
              { label: 'unités', digit: '5' },
            ]}
            highlight={2}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Dans 1 205 il n'y a aucune barre : aucune dizaine. Pourtant on ne peut pas écrire
              « 125 » — le 2 doit rester à la place des centaines, et c'est le 0 qui l'y tient.
            </p>
            <Piege>
              Effacer un zéro déplace tous les chiffres à sa gauche : 1 205 deviendrait 125, un
              nombre dix fois plus petit.
            </Piege>
            <Souvenir>l'atelier où tu n'as posé aucune barre pour construire 1 205.</Souvenir>
          </div>
        ),
      },
      {
        id: 'groupement-dix',
        type: 'concepts',
        title: 'Dix petits font un grand',
        summary: 'Dix unités font une dizaine, dix dizaines une centaine, dix centaines un millier.',
        visual: (
          <PlaceValue
            columns={[
              { label: 'milliers', digit: '1' },
              { label: 'centaines', digit: '2' },
              { label: 'dizaines', digit: '0' },
              { label: 'unités', digit: '5' },
            ]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              On n'écrit jamais dix unités côte à côte : dès qu'on en a dix, on les{' '}
              <strong>échange</strong> contre un paquet plus grand. C'est pour cela qu'un chiffre
              ne dépasse jamais 9.
            </p>
            <Encart>
              10 unités = 1 dizaine &nbsp;·&nbsp; 10 dizaines = 1 centaine &nbsp;·&nbsp; 10
              centaines = 1 millier
            </Encart>
            <Souvenir>les 10 cubes qui se sont regroupés en une barre quand tu es passé de 37 à 50.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Lire : les groupes de trois portent un nom. ── */
    3: [
      {
        id: 'classe-trois',
        type: 'vocabulaire',
        title: 'Une classe : un groupe de trois chiffres',
        summary: 'On groupe par trois en partant de la droite : unités, mille, millions.',
        body: (
          <div className="space-y-2">
            <Encart>
              <span className="font-mono font-bold">2</span>
              <span className="text-slate-400 mx-1">|</span>
              <span className="font-mono font-bold">350</span>
              <span className="text-slate-400 mx-1">|</span>
              <span className="font-mono font-bold">700</span>
              <div className="text-xs text-slate-500 mt-1">millions · mille · unités</div>
            </Encart>
            <p>
              Chaque groupe de trois porte un nom, et c'est ce nom qu'on annonce en lisant :
              « deux millions, trois cent cinquante mille, sept cents ». Les groupes rendent
              lisible d'un coup d'œil un nombre qui aurait 7 chiffres d'affilée.
            </p>
            <Souvenir>le bouton « grouper par 3 » qui a coupé le grand nombre sous tes yeux.</Souvenir>
          </div>
        ),
      },
      {
        id: 'ecriture-francaise',
        type: 'regles',
        title: 'En français, une espace sépare les classes',
        summary: 'On écrit 2 350 700 — jamais avec une virgule, jamais tout collé.',
        body: (
          <div className="space-y-2">
            <Encart>
              <span className="font-mono font-bold text-emerald-700">2 350 700</span>
              <span className="text-slate-400 mx-3">et non</span>
              <span className="font-mono text-rose-600 line-through">2,350,700</span>
            </Encart>
            <p>
              La virgule est réservée aux nombres à virgule ; tout coller rend le nombre
              illisible. L'espace, elle, ne fait que montrer les groupes de trois.
            </p>
          </div>
        ),
      },
    ],

    /* ── M4 — La valeur : le chiffre n'est pas ce qu'il vaut. ── */
    4: [
      {
        id: 'valeur-position',
        type: 'concepts',
        title: 'Un chiffre vaut ce que sa colonne lui donne',
        summary: 'Le même chiffre 5 peut valoir 5, 50, 500 ou 5 000 : sa place décide.',
        visual: (
          <PlaceValue
            columns={[
              { label: 'milliers', digit: '5' },
              { label: 'centaines', digit: '5' },
              { label: 'dizaines', digit: '5' },
              { label: 'unités', digit: '5' },
            ]}
            highlight={0}
          />
        ),
        body: (
          <div className="space-y-2">
            <Encart>
              <MathText>{'$5\\,555 = 5\\,000 + 500 + 50 + 5$'}</MathText>
            </Encart>
            <p>
              Quatre fois le même chiffre, quatre valeurs différentes. Un chiffre écrit tout seul
              ne dit rien ; c'est sa <strong>position</strong> qui lui donne sa valeur.
            </p>
            <Souvenir>les quatre 5 de 5 555 que tu as examinés colonne après colonne.</Souvenir>
          </div>
        ),
      },
      {
        id: 'chiffre-vs-nombre',
        type: 'regles',
        title: 'Chiffre des milliers ≠ nombre de milliers',
        summary: 'Le chiffre se lit dans UNE colonne ; le nombre compte TOUS les milliers.',
        body: (
          <div className="space-y-2">
            <Encart>
              <span className="font-mono font-bold">12 450</span>
              <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                <div>chiffre des milliers : <strong className="font-mono">2</strong></div>
                <div>nombre de milliers : <strong className="font-mono">12</strong></div>
              </div>
            </Encart>
            <p>
              Un <strong>chiffre</strong> est toujours un seul symbole entre 0 et 9. Le{' '}
              <strong>nombre</strong> de milliers, lui, compte combien de fois 1 000 tient dans
              le nombre entier : 12 000 tient dans 12 450, 13 000 non.
            </p>
            <Piege>
              C'est la confusion la plus fréquente des problèmes : répondre 2 quand on demande
              combien il y a de milliers.
            </Piege>
          </div>
        ),
      },
      {
        id: 'mem-position-decide',
        type: 'memoriser',
        title: '⭐ La position décide de tout',
        summary: 'Un chiffre ne vaut pas lui-même : il vaut ce que sa colonne lui donne.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">LE CHIFFRE N'EST PAS LA VALEUR</div>
              <div className="text-xs text-rose-700">
                On lit d'abord la colonne, puis on dit ce que le chiffre vaut.
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Toutes les autres règles de la leçon en découlent : comparer, ranger, décomposer,
              placer — on regarde toujours les colonnes, jamais les chiffres tout seuls.
            </p>
          </div>
        ),
      },
    ],

    /* ── M5 — Démonter et remonter un nombre. ── */
    5: [
      {
        id: 'decomposer',
        type: 'methodes',
        title: 'Décomposer un nombre',
        summary: 'Écrire le nombre comme une somme, une part par colonne occupée.',
        body: (
          <div className="space-y-2">
            <Encart>
              <MathText>{'$4\\,582 = 4\\,000 + 500 + 80 + 2$'}</MathText>
            </Encart>
            <p>
              Chaque part de la somme est la valeur d'un chiffre à sa place. Il en existe
              d'autres — <MathText>{'$4\\,500 + 82$'}</MathText> vaut aussi 4 582 — mais celle
              par colonnes est la plus utile : elle se lit directement dans le tableau.
            </p>
            <Souvenir>les tuiles que tu as choisies pour reconstituer 4 582.</Souvenir>
          </div>
        ),
      },
      {
        id: 'recomposer',
        type: 'methodes',
        title: 'Recomposer : de la somme au nombre',
        summary: "On replace chaque part dans sa colonne, et on met un 0 dans les colonnes vides.",
        body: (
          <div className="space-y-2">
            <Encart>
              <MathText>{'$5\\,000 + 80 + 6 = 5\\,086$'}</MathText>
            </Encart>
            <p>
              Aucune centaine n'apparaît dans la somme : la colonne des centaines reçoit donc un{' '}
              <strong className="font-mono">0</strong>. Sans lui, on écrirait 586 — un nombre
              tout à fait différent.
            </p>
            <Piege>
              Coller les morceaux les uns aux autres ne marche pas : c'est ainsi qu'on obtient
              586 au lieu de 5 086, ou 45 au lieu de 4 005.
            </Piege>
            <Souvenir>les positions vides que tu as cliquées dans 4 005 et 7 040.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — La méthode de comparaison, en deux temps. ── */
    6: [
      {
        id: 'comparer-methode',
        type: 'methodes',
        title: 'Comparer deux entiers en deux temps',
        summary: '① le plus de chiffres gagne ; ② à égalité, on compare colonne par colonne depuis la gauche.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600 space-y-1">
              <div>
                ① Compte les chiffres. Le plus long l'emporte :{' '}
                <MathText>{'$3\\,900 < 12\\,000$'}</MathText>.
              </div>
              <div>
                ② Même longueur ? Compare colonne par colonne en partant de la{' '}
                <strong>gauche</strong>, et arrête-toi à la première différence :{' '}
                <MathText>{'$4\\,582 > 4\\,527$'}</MathText>.
              </div>
            </div>
            <p>
              Une fois la première différence trouvée, les colonnes suivantes ne peuvent plus
              rien changer : elles pèsent toutes moins que celle-là.
            </p>
            <Piege>
              Comparer des morceaux au hasard mène à l'erreur : « 8 450 &lt; 8 320 car 320 &lt;
              450 » est faux, la première différence est aux centaines, 4 contre 3.
            </Piege>
            <Souvenir>le laboratoire où tu as dévoilé les colonnes une à une.</Souvenir>
          </div>
        ),
      },
      {
        id: 'signes-comparaison',
        type: 'vocabulaire',
        title: 'Les signes < , > et =',
        summary: "La pointe du signe montre toujours le plus petit des deux nombres.",
        body: (
          <div className="space-y-2">
            <Encart>
              <MathText>{'$4\\,582 > 4\\,527$'}</MathText>
              <span className="text-slate-400 mx-3">·</span>
              <MathText>{'$3\\,900 < 12\\,000$'}</MathText>
            </Encart>
            <p>
              On lit de gauche à droite : « 4 582 est plus grand que 4 527 », « 3 900 est plus
              petit que 12 000 ».
            </p>
          </div>
        ),
      },
    ],

    /* ── M7 — Ranger, puis encadrer. Les mots sont posés ICI. ── */
    7: [
      {
        id: 'ranger-ordre',
        type: 'vocabulaire',
        title: 'Ordre croissant et ordre décroissant',
        summary: 'Croissant : du plus petit au plus grand. Décroissant : du plus grand au plus petit.',
        body: (
          <div className="space-y-2">
            <Encart>
              <div className="space-y-1">
                <div>
                  <span className="text-xs text-slate-500 mr-2">croissant</span>
                  <MathText>{'$3\\,999 < 4\\,250 < 4\\,502$'}</MathText>
                </div>
                <div>
                  <span className="text-xs text-slate-500 mr-2">décroissant</span>
                  <MathText>{'$4\\,502 > 4\\,250 > 3\\,999$'}</MathText>
                </div>
              </div>
            </Encart>
            <p>
              Ranger, ce n'est pas une nouvelle règle : c'est comparer plusieurs fois de suite,
              avec la méthode du module précédent.
            </p>
            <Piege>
              Le rangement décroissant n'est pas seulement la liste écrite à l'envers : il faut
              vérifier chaque comparaison, sinon une erreur du premier rangement se recopie.
            </Piege>
            <Souvenir>les cinq cartes que tu as déplacées, dans un sens puis dans l'autre.</Souvenir>
          </div>
        ),
      },
      {
        id: 'encadrer',
        type: 'methodes',
        title: 'Encadrer un nombre',
        summary: "Le coincer entre deux repères ronds : d'abord des milliers, puis des centaines, puis des dizaines.",
        visual: (
          <MiniNumberLine
            min={4500} max={4600}
            ticks={[
              { at: 4500, label: '4500', strong: true },
              { at: 4550 },
              { at: 4600, label: '4600', strong: true },
            ]}
            marks={[{ at: 4582, label: '4582' }]}
          />
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
              <div><MathText>{'$4\\,000 < 4\\,582 < 5\\,000$'}</MathText></div>
              <div><MathText>{'$4\\,500 < 4\\,582 < 4\\,600$'}</MathText></div>
              <div><MathText>{'$4\\,580 < 4\\,582 < 4\\,590$'}</MathText></div>
            </div>
            <p>
              Un repère rond se termine par des zéros : 4 000 et 5 000 sont des milliers, 4 500
              et 4 600 des centaines, 4 580 et 4 590 des dizaines. Plus les deux repères sont
              proches, plus on sait précisément où se trouve le nombre.
            </p>
            <Souvenir>les trois encadrements de 4 582, de plus en plus serrés.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M8 — La demi-droite graduée : lire le pas, puis la position. ── */
    8: [
      {
        id: 'pas-graduation',
        type: 'concepts',
        title: 'Le pas d\'une graduation',
        summary: 'Le pas est la valeur qui sépare deux traits voisins — il est le même partout sur la droite.',
        visual: (
          <MiniNumberLine
            min={0} max={1000}
            ticks={[
              { at: 0, label: '0', strong: true },
              { at: 100 }, { at: 200 }, { at: 300 }, { at: 400 },
              { at: 500, label: '500', strong: true },
              { at: 600 }, { at: 700 }, { at: 800 }, { at: 900 },
              { at: 1000, label: '1000', strong: true },
            ]}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Pour le trouver, on prend deux nombres écrits sur la droite et on compte les traits
              qui les séparent.
            </p>
            <Encart>
              De 0 à 1 000, il y a 10 traits égaux : chacun vaut{' '}
              <MathText>{'$1\\,000 \\div 10 = 100$'}</MathText>.
            </Encart>
            <Piege>
              Sans lire le pas d'abord, on lit n'importe quoi : le même trait peut valoir 1, 100
              ou 10 000 selon la droite.
            </Piege>
            <Souvenir>les deux droites où tu as cherché combien valait un seul trait.</Souvenir>
          </div>
        ),
      },
      {
        id: 'placer-sur-droite',
        type: 'methodes',
        title: 'Lire et placer un nombre sur la demi-droite',
        summary: 'On lit le pas, puis on compte les traits depuis un repère écrit.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600">
              ① je lis le pas &nbsp;②&nbsp; je pars du repère écrit le plus proche &nbsp;③&nbsp;
              j'avance du bon nombre de traits.
            </div>
            <Encart>
              Placer 370 avec un pas de 10, à partir de 300 : il faut avancer de{' '}
              <MathText>{'$70 \\div 10 = 7$'}</MathText> traits.
            </Encart>
            <p>
              Une distance entre deux points se lit de la même façon : on compte les traits, puis
              on multiplie par le pas.
            </p>
            <Souvenir>le curseur que tu as fait glisser sans voir sa valeur.</Souvenir>
          </div>
        ),
      },
      {
        id: 'droite-ordonne',
        type: 'regles',
        title: 'Plus à droite, plus grand',
        summary: 'Sur la demi-droite graduée, comparer deux nombres, c\'est regarder lequel est le plus à droite.',
        body: (
          <div className="space-y-2">
            <p>
              Chaque nombre entier occupe une place et une seule ; la droite les range donc
              automatiquement. C'est la même comparaison que celle du module 6, vue autrement.
            </p>
            <Souvenir>les points A et B dont tu as mesuré l'écart en comptant les traits.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M9 — Ce que les grands nombres racontent du monde. ── */
    9: [
      {
        id: 'ordre-grandeur',
        type: 'concepts',
        title: 'L\'ordre de grandeur',
        summary: "Dire la taille d'un nombre — des dizaines, des centaines, des milliers — sans donner sa valeur exacte.",
        body: (
          <div className="space-y-2">
            <p>
              Beaucoup de questions de la vie courante ne demandent pas le nombre exact, mais sa{' '}
              <strong>taille</strong> : un collège accueille des <em>centaines</em> d'élèves, une
              grande ville des <em>centaines de milliers</em> d'habitants.
            </p>
            <Encart>
              Le nombre de chiffres donne directement cette taille : 650 a 3 chiffres (des
              centaines), 500 000 en a 6 (des centaines de milliers).
            </Encart>
            <p className="text-xs text-slate-500">
              C'est aussi ce qui permet de dire qu'une réponse est absurde sans refaire le
              calcul.
            </p>
            <Souvenir>les trois situations où tu as choisi entre 65, 650 et 65 000.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
