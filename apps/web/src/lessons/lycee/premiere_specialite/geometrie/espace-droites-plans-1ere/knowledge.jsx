import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de « L'espace : droites, plans et distances » — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit ICI et nulle
 * part ailleurs ; les modules la posent par son id, au moment où le geste vient
 * de lui donner du sens.
 *
 * L'ORDRE DES MODULES EST LA LIGNE DU TEMPS. Le module 1 ne pose AUCUNE brique
 * qui nomme « vecteur normal », « représentation paramétrique » ou « équation
 * cartésienne » : il pose ce qu'il a fait CONSTATER — qu'il n'y a que trois
 * positions, et qu'un seul nombre les décide. Les noms et les écritures
 * viennent aux modules 2 à 5, une fois le geste fait.
 *
 * DEUX BRIQUES PORTENT L'ID EXACT D'UN TERME DU LEXIQUE — `vecteur-normal`
 * (module 2) et `representation-parametrique` (module 4). Ce n'est pas un
 * détail d'implémentation : l'audit des dépendances de connaissances lit ces
 * ids, et une brique nommée autrement laisserait ces deux mots du programme
 * de Première signalés comme employés avant d'avoir été posés. Les renommer
 * pour contourner l'audit reviendrait à priver la leçon du vocabulaire
 * officiel — voir la note « terme du lexique au-dessus du niveau ».
 *
 * POURQUOI SI PEU DE VISUELS SVG ICI. La leçon vit dans un cube en perspective :
 * un cube figé, sans possibilité de le tourner, MENTIRAIT exactement comme la
 * figure dont la leçon apprend à se méfier — une droite y paraîtrait percer un
 * plan qu'elle rate, et l'élève ne pourrait rien y faire. Les briques portent
 * donc des tableaux, des équations et des schémas plans, où le dessin ne peut
 * pas contredire le texte ; le cube reste l'affaire du laboratoire, où il
 * tourne.
 */

/** Une bande de trois cas, le vocabulaire visuel récurrent de la leçon. */
function TroisCas({ items }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {items.map((it) => (
        <div key={it.titre} className="rounded-lg border-2 px-3 py-2"
          style={{ borderColor: it.bord, background: it.fond }}>
          <div className="font-semibold" style={{ color: it.texte }}>{it.titre}</div>
          <div className="text-[13px] mt-0.5" style={{ color: it.texte }}>{it.corps}</div>
        </div>
      ))}
    </div>
  );
}

const VERT = { bord: '#6ee7b7', fond: '#ecfdf5', texte: '#065f46' };
const BLEU = { bord: '#7dd3fc', fond: '#f0f9ff', texte: '#0c4a6e' };
const ROSE = { bord: '#fda4af', fond: '#fff1f2', texte: '#881337' };

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'trois-positions-droite-plan',
        type: 'concepts',
        title: 'Une droite et un plan : trois positions, et pas une de plus',
        summary:
          'Une droite et un plan de l’espace ont soit un seul point commun, soit aucun, soit une infinité. Il n’y a pas d’autre cas : le nombre de points communs ne peut valoir que 1, 0 ou l’infini.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <TroisCas items={[
              { ...BLEU, titre: 'Elle perce le plan — 1 point commun', corps: 'La droite traverse le plan de part en part et le rencontre en un point unique.' },
              { ...VERT, titre: 'Elle le longe — 0 point commun', corps: 'La droite garde la même direction que le plan sans jamais l’atteindre : elle passe à côté, pour toujours.' },
              { ...ROSE, titre: 'Elle est couchée dedans — une infinité', corps: 'La droite est posée sur le plan : chacun de ses points appartient au plan.' },
            ]} />
            <p>
              Un quatrième cas, « elle le touche sur un morceau puis en ressort », est
              <strong> impossible</strong> : deux points communs suffisent à coucher la droite
              entière dans le plan.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le dessin ne tranche pas. Sur une figure plate, une droite peut sembler percer un plan
              qu’elle rate de loin : il faut tourner la boîte, ou calculer.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le compteur de points communs qui passe de 1 à 0, puis à « une infinité ».</div>
          </div>
        ),
      },
      {
        id: 'un-nombre-decide',
        type: 'concepts',
        title: 'Un seul nombre change quand la position change',
        summary:
          'En faisant basculer la droite, un seul nombre bascule avec elle : le produit scalaire de sa direction par la direction perpendiculaire au plan. Quand il n’est plus nul, la droite perce.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Sur le laboratoire, la droite a pour direction <MathText>{'$\\vec{u}$'}</MathText> et le
              plan porte une direction qui lui est perpendiculaire, <MathText>{'$\\vec{n}$'}</MathText>.
              Le seul nombre qui bouge quand la position change est leur produit scalaire.
            </p>
            <div className="overflow-x-auto rounded-xl border border-indigo-100 bg-white">
              <table className="w-full text-center text-sm"><tbody>
                <tr className="bg-slate-50">
                  <th className="px-2 py-1 text-left font-semibold">ce qu’on observe</th>
                  <td className="px-2 py-1">elle perce</td>
                  <td className="px-2 py-1">elle longe</td>
                  <td className="px-2 py-1">elle est dedans</td>
                </tr>
                <tr className="border-t">
                  <th className="px-2 py-1 text-left font-semibold">points communs</th>
                  <td className="px-2 py-1 font-mono font-bold">1</td>
                  <td className="px-2 py-1 font-mono font-bold">0</td>
                  <td className="px-2 py-1 font-mono font-bold">∞</td>
                </tr>
                <tr className="border-t">
                  <th className="px-2 py-1 text-left font-semibold"><MathText>{'$\\vec{u} \\cdot \\vec{n}$'}</MathText></th>
                  <td className="px-2 py-1 font-mono font-bold text-sky-700">≠ 0</td>
                  <td className="px-2 py-1 font-mono font-bold text-emerald-700">= 0</td>
                  <td className="px-2 py-1 font-mono font-bold text-rose-700">= 0</td>
                </tr>
              </tbody></table>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Regarde la dernière ligne : les deux derniers cas donnent <strong>le même</strong>{' '}
              nombre. Ce nombre-là décide si la droite perce ou non, mais il ne suffit pas à
              distinguer « à côté » de « dedans ». Il manque quelque chose — le module suivant dit
              quoi.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le produit affiché sous la figure, qui tombe à 0 juste avant que la droite ne se couche.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'vecteur-normal',
        type: 'vocabulaire',
        title: 'Le vecteur normal d’un plan',
        summary:
          'Un vecteur normal à un plan est un vecteur non nul perpendiculaire à toutes les droites de ce plan. Il donne la direction « qui sort du plan », et un plan en possède une infinité, tous multiples les uns des autres.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              On le note <MathText>{'$\\vec{n}$'}</MathText>. Il suffit qu’il soit perpendiculaire à{' '}
              <strong>deux</strong> directions non parallèles du plan pour l’être à toutes : c’est
              ce qui rend le calcul court.
            </p>
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-[13px]">
              Sur la boîte, le plancher a pour vecteur normal <strong>(0 ; 0 ; 1)</strong> — la
              direction verticale. La face avant a pour vecteur normal <strong>(0 ; 1 ; 0)</strong> —
              la direction qui va vers le fond.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Un plan n’a pas <em>un</em> vecteur normal, il en a une infinité : (0 ; 0 ; 1),
              (0 ; 0 ; 2), (0 ; 0 ; −5)… tous conviennent. On choisit le plus simple, celui aux
              plus petits nombres entiers.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la flèche qui sort du plan mobile, perpendiculaire à lui à toutes les hauteurs.</div>
          </div>
        ),
      },
      {
        id: 'critere-droite-plan',
        type: 'regles',
        title: 'Le critère complet : deux tests, dans cet ordre',
        summary:
          'Premier test, le produit scalaire du vecteur directeur par le vecteur normal : s’il n’est pas nul, la droite perce. S’il est nul, second test : un point de la droite appartient-il au plan ? Oui, elle est dedans ; non, elle est à côté.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 space-y-2">
              <div className="text-[13px]">
                <strong>1.</strong> Calculer <MathText>{'$\\vec{u} \\cdot \\vec{n}$'}</MathText>.
                S’il n’est <strong>pas nul</strong> → la droite perce le plan en un point unique.
              </div>
              <div className="text-[13px]">
                <strong>2.</strong> S’il est <strong>nul</strong>, prendre un point A de la droite et
                regarder s’il vérifie l’équation du plan.<br />
                &nbsp;&nbsp;&nbsp;&nbsp;A dans le plan → la droite y est <strong>contenue</strong> ;
                A hors du plan → elle lui est <strong>parallèle</strong>, sans point commun.
              </div>
            </div>
            <p>
              Le second test ne se déduit pas du premier : c’est <strong>un fait de plus</strong>,
              qu’aucun produit scalaire ne peut donner. Un seul point suffit, et n’importe lequel de
              la droite fait l’affaire.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              L’erreur la plus coûteuse : s’arrêter au premier test et écrire « le produit est nul,
              donc elles sont parallèles ». Une droite couchée dans le plan donne exactement le même
              produit nul — et elle a une infinité de points communs, pas zéro.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux cadres du laboratoire, le produit puis l’appartenance.</div>
          </div>
        ),
      },
      {
        id: 'mem-nul-puis-appartenance',
        type: 'memoriser',
        title: '⭐ Produit nul, puis un point',
        summary: 'Le produit décide si elle perce ; un point décide si elle est dedans.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">u · n ≠ 0 ⇒ elle perce</div>
            <div className="text-base font-bold text-rose-600">u · n = 0 ⇒ regarder un point</div>
            <p className="text-xs text-rose-700">deux tests, jamais un seul</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'deux-plans-deux-cas',
        type: 'concepts',
        title: 'Deux plans : deux cas seulement',
        summary:
          'Deux plans de l’espace sont sécants — leur intersection est alors une droite entière — ou parallèles. Le troisième cas des droites, « ni l’un ni l’autre », n’existe pas pour les plans.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <TroisCas items={[
              { ...BLEU, titre: 'Sécants — ils se coupent selon une DROITE', corps: 'Jamais selon un seul point : deux plans qui se rencontrent partagent une droite entière. Deux murs se rejoignent le long d’une arête.' },
              { ...VERT, titre: 'Parallèles — aucun point commun', corps: 'Ils gardent le même écart partout, comme le plancher et le plafond d’une pièce.' },
            ]} />
            <p>
              Deux droites de l’espace pouvaient n’être ni sécantes ni parallèles. Deux plans, non :
              ils sont trop grands pour s’éviter sans être parallèles.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Deux plans sécants ne se coupent jamais « en un point ». Si tu écris cela, relis :
              leur intersection est une droite, et elle est infinie.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le plancher et la face avant, qui se rejoignent le long de l’arête du bas.</div>
          </div>
        ),
      },
      {
        id: 'critere-deux-plans',
        type: 'regles',
        title: 'Ce sont les vecteurs normaux qui décident',
        summary:
          'Deux plans sont parallèles quand leurs vecteurs normaux sont colinéaires — l’un multiple de l’autre. Sinon ils sont sécants. Et ils sont perpendiculaires quand le produit scalaire de leurs normaux est nul.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center space-y-1.5">
              <div><MathText>{'$\\vec{n_1}$ et $\\vec{n_2}$ colinéaires $\\iff$ plans parallèles'}</MathText></div>
              <div><MathText>{'$\\vec{n_1} \\cdot \\vec{n_2} = 0 \\iff$ plans perpendiculaires'}</MathText></div>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-[13px]">
              Le plancher a pour normal (0 ; 0 ; 1), le plafond aussi : <strong>ils sont
              parallèles</strong>, et leurs équations ne diffèrent que par le dernier nombre.<br />
              Le plancher (0 ; 0 ; 1) et la face avant (0 ; 1 ; 0) : le produit vaut 0, donc ils sont{' '}
              <strong>perpendiculaires</strong> — et sécants, puisqu’ils ne sont pas parallèles.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Deux plans parallèles peuvent être confondus : c’est le cas quand leurs équations sont
              proportionnelles jusqu’au dernier coefficient. Vérifie ce dernier nombre avant de
              conclure.
            </div>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'representation-parametrique',
        type: 'concepts',
        title: 'La représentation paramétrique d’une droite',
        summary:
          'Une droite de l’espace se décrit par un point de départ et une direction : tout point de la droite s’obtient en partant du premier et en avançant d’un certain nombre de fois la direction. Ce nombre est le paramètre.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Si A est un point de la droite et <MathText>{'$\\vec{u}$'}</MathText> un vecteur
              directeur, alors M appartient à la droite exactement quand{' '}
              <MathText>{'$\\vec{AM} = t\\,\\vec{u}$'}</MathText> pour un certain nombre{' '}
              <MathText>{'$t$'}</MathText>.
            </p>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
              <MathText>{'$$\\begin{cases} x = x_A + t\\,x_u \\\\ y = y_A + t\\,y_u \\\\ z = z_A + t\\,z_u \\end{cases}$$'}</MathText>
            </div>
            <p>
              Le paramètre <MathText>{'$t$'}</MathText> est un curseur : <MathText>{'$t = 0$'}</MathText>{' '}
              donne A, <MathText>{'$t = 1$'}</MathText> donne le point atteint en avançant d’une fois
              la direction, et <MathText>{'$t$'}</MathText> négatif repart de l’autre côté. Quand{' '}
              <MathText>{'$t$'}</MathText> parcourt tous les nombres, M parcourt toute la droite.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Les <strong>trois</strong> lignes s’écrivent, même celle dont le coefficient est nul :
              « z = 2 + 0t » dit que la droite reste à la hauteur 2, ce qui est une information. Une
              ligne omise ne décrit plus une droite de l’espace.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le curseur qu’on fait coulisser, et le point qui court le long de la droite.</div>
          </div>
        ),
      },
      {
        id: 'methode-ecrire-parametrique',
        type: 'methodes',
        title: 'Écrire la représentation paramétrique d’une droite',
        summary:
          'Choisir un point de la droite, calculer un vecteur directeur, puis recopier les trois lignes : coordonnée du point, plus le paramètre fois la coordonnée du vecteur.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Prendre un point A de la droite — le plus simple, celui aux plus petits nombres.</li>
              <li>Calculer un vecteur directeur : « arrivée moins départ » entre deux points de la droite.</li>
              <li>Écrire les trois lignes, dans l’ordre x, y, z, sans en sauter aucune.</li>
              <li>Vérifier : remplacer t par 0 doit redonner A, et t par 1 le second point.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-[13px]">
              Pour la grande diagonale de la boîte, de A(0 ; 0 ; 0) à G(2 ; 2 ; 2), le vecteur
              directeur vaut (2 ; 2 ; 2) et l’on écrit
              <strong> x = 0 + 2t ; y = 0 + 2t ; z = 0 + 2t</strong>. Le point de paramètre 0,5 est
              donc (1 ; 1 ; 1) : le centre exact de la boîte.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Deux écritures différentes peuvent décrire la <strong>même</strong> droite : changer de
              point de départ ou multiplier le vecteur directeur ne change pas la droite. Pour
              vérifier qu’un point y appartient, il faut que le <strong>même</strong> t convienne aux
              trois lignes — deux qui s’accordent ne suffisent pas.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la coordonnée qui refuse le t des deux autres.</div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'equation-cartesienne-plan',
        type: 'formules',
        title: 'L’équation cartésienne d’un plan',
        summary:
          'Un plan de l’espace est l’ensemble des points dont les coordonnées vérifient ax + by + cz + d = 0. Et les trois premiers coefficients ne sont pas quelconques : (a ; b ; c) est un vecteur normal au plan.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-center">
              <MathText>{'$$ax + by + cz + d = 0$$'}</MathText>
            </div>
            <p>
              D’où cela vient : dire que M est dans le plan, c’est dire que{' '}
              <MathText>{'$\\vec{n} \\cdot \\vec{AM} = 0$'}</MathText>. En développant avec{' '}
              <MathText>{'$\\vec{n}\\,(a ; b ; c)$'}</MathText>, on obtient{' '}
              <MathText>{'$a(x - x_A) + b(y - y_A) + c(z - z_A) = 0$'}</MathText>, c’est-à-dire{' '}
              <MathText>{'$ax + by + cz + d = 0$'}</MathText> avec{' '}
              <MathText>{'$d = -\\vec{n} \\cdot \\vec{A}$'}</MathText>.
            </p>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-[13px]">
              <strong>x + y + z − 2 = 0</strong> a pour vecteur normal (1 ; 1 ; 1), et il passe par
              B(2 ; 0 ; 0) puisque 2 + 0 + 0 − 2 = 0.<br />
              <strong>z − 2 = 0</strong>, c’est-à-dire 0x + 0y + z − 2 = 0, a pour vecteur normal
              (0 ; 0 ; 1) : c’est le plafond de la boîte.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le dernier coefficient, <MathText>{'$d$'}</MathText>, ne fait <strong>pas</strong>{' '}
              partie du vecteur normal. Il ne décide pas de la direction du plan, seulement de
              l’endroit où il est posé : deux plans parallèles ont les mêmes a, b, c et diffèrent
              par d.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois premiers coefficients recopiés à côté du vecteur normal, identiques.</div>
          </div>
        ),
      },
      {
        id: 'mem-abc-est-le-normal',
        type: 'memoriser',
        title: '⭐ (a ; b ; c) EST le vecteur normal',
        summary: 'L’équation d’un plan porte sa direction perpendiculaire en clair.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">ax + by + cz + d = 0</div>
            <div className="text-base font-bold text-rose-600">n (a ; b ; c)</div>
            <p className="text-xs text-rose-700">d dit où il est posé, jamais dans quelle direction</p>
          </div>
        ),
      },
      {
        id: 'methode-equation-plan',
        type: 'methodes',
        title: 'Déterminer l’équation cartésienne d’un plan',
        summary:
          'Trouver un vecteur normal, le recopier en a, b, c, puis calculer d en imposant qu’un point connu du plan vérifie l’équation.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Obtenir un vecteur normal : soit il est donné, soit on cherche un vecteur perpendiculaire à deux directions du plan.</li>
              <li>Recopier ses coordonnées en a, b et c : l’équation est déjà à moitié écrite.</li>
              <li>Remplacer x, y et z par les coordonnées d’un point connu du plan, et en tirer d.</li>
              <li>Vérifier sur un <strong>second</strong> point du plan : l’équation doit y donner 0.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-[13px]">
              Plan de vecteur normal (1 ; 1 ; 1) passant par D(0 ; 2 ; 0) : on écrit
              x + y + z + d = 0, puis 0 + 2 + 0 + d = 0 donne d = −2. L’équation est
              <strong> x + y + z − 2 = 0</strong>, et l’on vérifie sur E(0 ; 0 ; 2) : 0 + 0 + 2 − 2 = 0. ✓
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la quatrième case du tableau, qu’on remplit en dernier.</div>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'parallelisme-espace-trois-formes',
        type: 'regles',
        title: 'Démontrer un parallélisme : trois énoncés, trois calculs',
        summary:
          'Deux droites sont parallèles quand leurs directeurs sont colinéaires ; une droite est parallèle à un plan quand son directeur est perpendiculaire au normal ; deux plans sont parallèles quand leurs normaux sont colinéaires.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-amber-100 bg-white">
              <table className="w-full text-left text-sm"><tbody>
                <tr className="bg-slate-50 border-b">
                  <th className="px-2 py-1.5">deux droites</th>
                  <td className="px-2 py-1.5">leurs <strong>directeurs</strong> sont colinéaires</td>
                </tr>
                <tr className="border-b">
                  <th className="px-2 py-1.5">une droite et un plan</th>
                  <td className="px-2 py-1.5">directeur · <strong>normal</strong> = 0, et un point de la droite hors du plan</td>
                </tr>
                <tr>
                  <th className="px-2 py-1.5">deux plans</th>
                  <td className="px-2 py-1.5">leurs <strong>normaux</strong> sont colinéaires</td>
                </tr>
              </tbody></table>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              La ligne du milieu surprend : pour une droite et un plan, le parallélisme se démontre
              par un produit scalaire <strong>nul</strong>. Ce n’est pas une exception — le vecteur
              normal sort du plan, donc une direction perpendiculaire à lui reste dans le plan.
            </div>
          </div>
        ),
      },
      {
        id: 'orthogonalite-espace-deux-formes',
        type: 'regles',
        title: 'Démontrer une orthogonalité : le produit scalaire change de camp',
        summary:
          'Deux droites sont orthogonales quand le produit scalaire de leurs directeurs est nul. Mais une droite est orthogonale à un plan quand son directeur est colinéaire au normal — et non quand un produit est nul.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-amber-100 bg-white">
              <table className="w-full text-left text-sm"><tbody>
                <tr className="bg-slate-50 border-b">
                  <th className="px-2 py-1.5">deux droites</th>
                  <td className="px-2 py-1.5">directeur · directeur = <strong>0</strong></td>
                </tr>
                <tr className="border-b">
                  <th className="px-2 py-1.5">une droite et un plan</th>
                  <td className="px-2 py-1.5">directeur <strong>colinéaire</strong> au normal</td>
                </tr>
                <tr>
                  <th className="px-2 py-1.5">deux plans</th>
                  <td className="px-2 py-1.5">normal · normal = <strong>0</strong></td>
                </tr>
              </tbody></table>
            </div>
            <p>
              Une droite orthogonale à un plan lui est perpendiculaire au sens ordinaire : elle est
              orthogonale à <strong>toutes</strong> les droites de ce plan à la fois. C’est pour cela
              qu’il suffit qu’elle porte la direction du vecteur normal.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le contresens qui coûte le plus cher : appliquer « produit nul donc orthogonal » à une
              droite et un plan. Le produit nul y signifie exactement le <strong>contraire</strong> —
              la droite est parallèle au plan.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux verdicts opposés sur la même figure, à une minute d’intervalle.</div>
          </div>
        ),
      },
      {
        id: 'mem-le-role-s-inverse',
        type: 'memoriser',
        title: '⭐ Avec un plan, tout s’inverse',
        summary: 'Le vecteur normal sort du plan : ce qui lui est perpendiculaire reste dedans.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-base font-bold text-rose-600">deux droites : produit nul ⇒ orthogonales</div>
            <div className="text-xl font-black text-rose-700">droite et plan : produit nul ⇒ PARALLÈLES</div>
            <p className="text-xs text-rose-700">et colinéaires ⇒ orthogonales</p>
          </div>
        ),
      },
    ],
    7: [
      {
        id: 'formule-distance-point-plan',
        type: 'formules',
        title: 'La distance d’un point à un plan',
        summary:
          'On remplace les coordonnées du point dans le membre de gauche de l’équation, on en prend la valeur absolue, et on divise par la longueur du vecteur normal.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-center">
              <MathText>{'$$d(M, \\mathcal{P}) = \\dfrac{|ax_M + by_M + cz_M + d|}{\\sqrt{a^2 + b^2 + c^2}}$$'}</MathText>
            </div>
            <p>
              Le numérateur est ce que l’équation du plan <strong>répond</strong> au point : il vaut
              0 exactement quand le point est dans le plan. Le dénominateur est la longueur du
              vecteur normal, et c’est lui qui transforme cette réponse en une vraie distance.
            </p>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-[13px]">
              Distance de A(0 ; 0 ; 0) au plan x + y + z − 2 = 0 : le numérateur vaut
              |0 + 0 + 0 − 2| = 2, le dénominateur √(1 + 1 + 1) = √3, d’où{' '}
              <strong>2/√3 = 2√3/3</strong>, soit environ 1,15.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le dénominateur ne s’oublie pas. Sans lui, on obtiendrait 2 au lieu de 1,15 : ce n’est
              pas un arrondi, c’est presque le double. Et il ne vaut 1 que si le vecteur normal est
              de longueur 1, ce qui est rare.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le numérateur affiché seul, avant qu’on ne le divise.</div>
          </div>
        ),
      },
      {
        id: 'methode-distance-espace',
        type: 'methodes',
        title: 'Calculer une distance dans l’espace',
        summary:
          'Écrire l’équation du plan, y remplacer le point, prendre la valeur absolue, diviser par la longueur du normal, puis rendre le résultat sous forme exacte.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>S’assurer que le plan est écrit sous la forme ax + by + cz + d = 0, tout au même membre.</li>
              <li>Remplacer x, y, z par les coordonnées du point, et calculer le nombre obtenu.</li>
              <li>En prendre la valeur absolue : une distance n’est jamais négative.</li>
              <li>Diviser par √(a² + b² + c²), et simplifier la racine plutôt que d’arrondir.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-[13px]">
              <strong>Deux plans parallèles</strong> se traitent pareil : on prend un point de l’un,
              et on calcule sa distance à l’autre. Entre x + y + z − 2 = 0 et x + y + z − 4 = 0, le
              point B(2 ; 0 ; 0) du premier donne |2 + 0 + 0 − 4|/√3 = 2/√3 = <strong>2√3/3</strong>.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Cette méthode ne vaut que pour deux plans <strong>parallèles</strong>. Deux plans
              sécants se touchent : leur distance est nulle, et la question n’a pas d’intérêt.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le même calcul mené deux fois, une fois pour un point, une fois pour un plan entier.</div>
          </div>
        ),
      },
    ],
  },
};
