import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Translations et vecteurs » (3e) — SOURCE UNIQUE
 * de vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à l'instant
 * où le geste vient de lui donner un sens, puis il reste sur la carte de
 * l'élève. Rien n'est réécrit dans un module : la brique et la carte montrent
 * le même texte, écrit une seule fois.
 *
 * ORDRE — c'est la colonne vertébrale de la leçon, et elle est délibérée :
 *   M1  le déplacement se décrit par trois attributs, sans point de départ ;
 *   M2  les trois attributs SÉPARÉS, puis le déplacement opposé ;
 *   M3  la translation, l'image d'un point, l'image d'une figure ;
 *   M4  le mot « VECTEUR » — pas avant : il ne se justifie qu'une fois que
 *       l'élève a promené la même flèche à trois endroits ;
 *   M5  les coordonnées, arrivée − départ ;
 *   M6  la notation fléchée, et le parallélogramme comme lecture d'une
 *       égalité de vecteurs ;
 *   M7  les trois usages : construire, répéter, enchaîner.
 * Un item n'emploie que ce qui est déjà établi au module qui le déclare : la
 * notation ⃗AB n'apparaît donc nulle part avant M6, et le mot « vecteur »
 * nulle part avant M4.
 *
 * PÉRIMÈTRE : la relation de Chasles n'est pas enseignée (teachingScope).
 * L'enchaînement de deux déplacements reste une addition de composantes, sans
 * notation formelle.
 *
 * LaTeX : antislashs DOUBLÉS dans les chaînes JS ('$\\overrightarrow{AB}$').
 */

/* Une petite figure de carte : viewBox commun, légende sous le dessin. */
const Fig = ({ children, caption, w = 200, h = 120 }) => (
  <div className="space-y-1">
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={caption} style={{ maxWidth: w }} className="w-full h-auto">
      {children}
    </svg>
    <p className="text-xs text-slate-500 text-center">{caption}</p>
  </div>
);

/* Une flèche : les cartes en dessinent beaucoup. */
const Arrow = ({ x1, y1, x2, y2, color = '#7c3aed', dash, id }) => (
  <g>
    <defs>
      <marker id={`kh-${id}`} viewBox="0 0 10 10" refX="9" refY="5"
        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
      </marker>
    </defs>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2.5"
      strokeDasharray={dash} markerEnd={`url(#kh-${id})`} />
  </g>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Un déplacement n'est pas une arrivée. */
    1: [
      {
        id: 'deplacement',
        type: 'concepts',
        title: 'Un déplacement',
        summary:
          'Un déplacement dit de combien on bouge — pas où l’on arrive. Deux objets partis d’endroits différents peuvent faire le même déplacement.',
        visual: (
          <Fig caption="Deux départs, le même déplacement, deux arrivées">
            <circle cx="25" cy="90" r="4" fill="#4338ca" />
            <Arrow id="d1" x1="25" y1="90" x2="85" y2="60" />
            <circle cx="85" cy="60" r="4" fill="#059669" />
            <circle cx="110" cy="70" r="4" fill="#4338ca" />
            <Arrow id="d2" x1="110" y1="70" x2="170" y2="40" />
            <circle cx="170" cy="40" r="4" fill="#059669" />
          </Fig>
        ),
        body: (
          <div className="space-y-2">
            <p>Un <strong>déplacement</strong> est un mouvement en ligne droite : on part d’un
            point, on arrive à un autre.</p>
            <p>Ce qui le caractérise, c’est <strong>l’écart</strong> entre le départ et l’arrivée,
            et rien d’autre. Le point de départ n’en fait pas partie.</p>
            <p className="text-xs text-slate-500">D’où la conséquence qui surprend : deux objets
            qui font le même déplacement n’arrivent pas au même endroit s’ils ne sont pas partis
            du même.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : ton drone et le drone
            modèle, même trajet, deux arrivées différentes.</div>
          </div>
        ),
      },
      {
        id: 'direction-sens-longueur',
        type: 'vocabulaire',
        title: 'Direction, sens, longueur',
        summary:
          'Trois informations suffisent à décrire un déplacement : la direction (la droite suivie), le sens (de quel côté on la parcourt) et la longueur.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>Direction</strong> — la droite que l’on suit.
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900">
                <strong>Sens</strong> — de quel côté on parcourt cette droite.
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Longueur</strong> — de combien on avance.
              </div>
            </div>
            <p className="text-xs text-slate-500">Ces trois-là, et pas le point de départ : deux
            déplacements qui les partagent tous les trois sont le même déplacement.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois voyants du
            tableau de bord, allumés séparément.</div>
          </div>
        ),
      },
    ],

    /* M2 — Les trois attributs, séparés pour de bon. Puis l'opposé. */
    2: [
      {
        id: 'direction-nest-pas-sens',
        type: 'regles',
        title: 'Direction ≠ sens',
        summary:
          'En géométrie, « direction » désigne la droite suivie. Faire demi-tour ne change pas la direction : cela change le sens.',
        visual: (
          <Fig caption="Même direction, même longueur, sens contraires">
            <line x1="15" y1="95" x2="185" y2="25" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
            <Arrow id="s1" x1="30" y1="89" x2="95" y2="62" color="#0284c7" />
            <Arrow id="s2" x1="170" y1="31" x2="105" y2="58" color="#e11d48" />
          </Fig>
        ),
        body: (
          <div className="space-y-2">
            <p>La langue courante dit « il est reparti dans l’autre direction » pour un
            demi-tour. En mathématiques c’est faux : on est reparti dans l’autre
            <strong> sens</strong>, sur la <strong>même</strong> droite, donc dans la même
            direction.</p>
            <p className="text-xs text-slate-500">Deux déplacements de sens contraires ont même
            direction et souvent même longueur : c’est justement pourquoi il faut trois voyants
            et non un seul.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le voyant « Direction »
            restait vert quand tu retournais la flèche.</div>
          </div>
        ),
      },
      {
        id: 'deplacement-oppose',
        type: 'concepts',
        title: 'Le déplacement opposé',
        summary:
          'Le déplacement opposé ramène au point de départ : même direction, même longueur, sens contraire. Ses deux composantes changent de signe.',
        body: (
          <div className="space-y-3">
            <p>Faire <strong>(3 ; 2)</strong> puis <strong>(−3 ; −2)</strong>, c’est revenir
            exactement d’où l’on vient : les deux déplacements se compensent.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center font-mono">
              (3 ; 2) &nbsp;puis&nbsp; (−3 ; −2) &nbsp;→&nbsp; sur place
            </div>
            <p className="text-xs text-slate-500">Il faut changer le signe des <strong>deux</strong>
            composantes. N’en changer qu’une donne une autre direction — et l’on ne revient pas
            chez soi.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le voyant « Sens » seul
            éteint, les deux autres verts.</div>
          </div>
        ),
      },
      {
        id: 'composantes-ordonnees',
        type: 'regles',
        title: 'L’ordre des deux composantes',
        summary:
          'Le premier nombre commande l’horizontal, le second le vertical : (3 ; 2) et (2 ; 3) sont deux déplacements différents.',
        body: (
          <div className="space-y-2">
            <p>Un déplacement s’écrit avec deux nombres, toujours dans cet ordre : d’abord de
            combien on va à droite ou à gauche, ensuite de combien on monte ou on descend.</p>
            <p className="text-xs text-slate-500">Les échanger ne donne pas « le même déplacement
            autrement écrit » : cela donne un <strong>autre</strong> déplacement, qui ne suit même
            pas la même droite.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le piège de la ligne
            (2 ; 3) dans le tableau des quatre comparaisons.</div>
          </div>
        ),
      },
    ],

    /* M3 — La translation, et le mot « image ». */
    3: [
      {
        id: 'translation',
        type: 'concepts',
        title: 'La translation',
        summary:
          'Translater une figure, c’est faire glisser TOUS ses points du même déplacement — sans la tourner ni la déformer.',
        visual: (
          <Fig caption="La figure glisse : même forme, même inclinaison">
            <polygon points="20,95 60,95 40,60" fill="#c7d2fe" stroke="#4338ca" strokeWidth="2" />
            <polygon points="115,70 155,70 135,35" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
            <Arrow id="t1" x1="20" y1="95" x2="115" y2="70" />
            <Arrow id="t2" x1="60" y1="95" x2="155" y2="70" />
            <Arrow id="t3" x1="40" y1="60" x2="135" y2="35" />
          </Fig>
        ),
        body: (
          <div className="space-y-2">
            <p>Une <strong>translation</strong> est un glissement. Chaque sommet reçoit
            exactement le <strong>même</strong> déplacement : les écarts entre les points ne
            changent donc pas.</p>
            <p>La figure obtenue est <strong>superposable</strong> à celle de départ : mêmes
            longueurs, mêmes angles, même orientation. Seule sa position a changé.</p>
            <p className="text-xs text-slate-500">Une translation ne fait jamais tourner ni
            agrandir — c’est ce qui la distingue des autres transformations.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le drone vert, calqué sur
            le bleu, posé plus loin.</div>
          </div>
        ),
      },
      {
        id: 'image-point',
        type: 'vocabulaire',
        title: 'L’image d’un point',
        summary:
          'Le point où arrive A après le déplacement est appelé l’image de A, et se note A′ (« A prime »).',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center font-mono">
              A (−5 ; −3) &nbsp;+ (5 ; 3) →&nbsp; A′ (0 ; 0)
            </div>
            <p>On calcule ses coordonnées en ajoutant chaque composante à sa propre
            coordonnée : l’horizontale à l’abscisse, la verticale à l’ordonnée.</p>
            <p className="text-xs text-slate-500">L’<strong>image d’une figure</strong> est
            simplement l’ensemble des images de ses points.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : A′, le sommet vert, en
            face du sommet bleu A.</div>
          </div>
        ),
      },
    ],

    /* M4 — LE MOT. Il ne se justifie qu'après avoir promené la flèche. */
    4: [
      {
        id: 'vecteur',
        type: 'concepts',
        title: 'Le vecteur',
        summary:
          'Un vecteur est un déplacement : une direction, un sens, une longueur. L’endroit où on le dessine n’en fait pas partie.',
        visual: (
          <Fig caption="Trois flèches, un seul et même vecteur">
            <Arrow id="v1" x1="15" y1="100" x2="65" y2="70" />
            <Arrow id="v2" x1="80" y1="75" x2="130" y2="45" />
            <Arrow id="v3" x1="135" y1="105" x2="185" y2="75" />
          </Fig>
        ),
        body: (
          <div className="space-y-2">
            <p>Le mot des mathématiciens pour un déplacement est <strong>vecteur</strong>. Il
            porte exactement les trois attributs que tu as isolés : direction, sens, longueur.</p>
            <p>On le représente par une <strong>flèche</strong>, mais la flèche n’est qu’un
            dessin : on peut la poser où l’on veut, le vecteur ne change pas.</p>
            <p className="text-xs text-slate-500">C’est pourquoi un vecteur est réutilisable
            partout — quatre drones à quatre endroits peuvent obéir au même.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la flèche vagabonde,
            posée à trois endroits, identique à elle-même.</div>
          </div>
        ),
      },
      {
        id: 'vecteurs-egaux',
        type: 'regles',
        title: 'Deux vecteurs égaux',
        summary:
          'Deux flèches représentent le même vecteur — on dit qu’elles sont égales — dès que leurs deux composantes coïncident, où qu’elles soient dessinées.',
        body: (
          <div className="space-y-2">
            <p>Pour savoir si deux flèches sont le même vecteur, on ne regarde ni leur position
            ni leur point de départ : seulement leurs <strong>deux composantes</strong>.</p>
            <p className="text-xs text-slate-500">Même déplacement horizontal <em>et</em> même
            déplacement vertical : c’est le seul critère, et il suffit.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois flèches posées
            loin les unes des autres, et pourtant les mêmes.</div>
          </div>
        ),
      },
      {
        id: 'mem-vecteur-nest-pas-position',
        type: 'memoriser',
        title: '⭐ Un vecteur n’est pas une position',
        summary: 'Le vecteur dit de combien bouger ; l’arrivée dépend en plus du point de départ.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-1">
            <div className="text-lg font-black text-rose-700">déplacement, pas destination</div>
            <p className="text-xs text-rose-700">Même vecteur + départs différents =
              arrivées différentes.</p>
          </div>
        ),
      },
    ],

    /* M5 — Deux nombres : arrivée − départ. */
    5: [
      {
        id: 'coordonnees-vecteur',
        type: 'formules',
        title: 'Les coordonnées d’un vecteur',
        summary:
          'Le vecteur qui mène de A (xA ; yA) à B (xB ; yB) a pour coordonnées (xB − xA ; yB − yA) : toujours arrivée moins départ.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$(x_B - x_A\\ ;\\ y_B - y_A)$'}</MathText>
            </div>
            <p>La première coordonnée est le pas <strong>horizontal</strong>, la seconde le pas
            <strong> vertical</strong>. Chacune se calcule sur sa propre coordonnée, séparément.</p>
            <p className="text-xs text-slate-500">Le sens de la soustraction n’est pas
            négociable : départ − arrivée donnerait le déplacement inverse, qui repart en
            arrière.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’escalier bleu puis vert
            entre A et B — d’abord à droite, ensuite en haut.</div>
          </div>
        ),
      },
      {
        id: 'mem-arrivee-moins-depart',
        type: 'memoriser',
        title: '⭐ Arrivée moins départ',
        summary: 'Sur chaque coordonnée, on soustrait le départ de l’arrivée — jamais l’inverse.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-1">
            <div className="text-lg font-black text-rose-700">arrivée − départ</div>
            <p className="text-xs text-rose-700">Une fois sur les abscisses, une fois sur les
              ordonnées. Inverser l’ordre inverse le sens du déplacement.</p>
          </div>
        ),
      },
    ],

    /* M6 — L'écriture. Elle arrive quand tout le reste est acquis. */
    6: [
      {
        id: 'notation-vecteur',
        type: 'vocabulaire',
        title: 'La notation ⃗AB',
        summary:
          'Avec une flèche au-dessus, AB désigne le vecteur qui mène de A à B ; sans flèche, AB est un nombre : la longueur du segment [AB].',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900">
                <MathText>{'$\\overrightarrow{AB}$'}</MathText> — le <strong>vecteur</strong> qui
                mène de A à B : direction, sens, longueur.
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800">
                <strong>AB</strong> — un <strong>nombre</strong> : la longueur du segment [AB].
              </div>
            </div>
            <p className="text-xs text-slate-500">La petite flèche change tout : elle transforme
            une longueur en déplacement orienté. L’ordre des lettres donne le sens — de A
            <em> vers</em> B.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la première ligne du
            tableau des écritures, celle qui piège tout le monde.</div>
          </div>
        ),
      },
      {
        id: 'translation-de-vecteur',
        type: 'regles',
        title: 'La translation de vecteur u',
        summary:
          'On dit « B est l’image de A par la translation de vecteur u » quand on est passé de A à B en appliquant u.',
        body: (
          <div className="space-y-2">
            <p>La translation de vecteur <MathText>{'$\\vec{u}$'}</MathText> applique
            <MathText>{' $\\vec{u}$'}</MathText> à <strong>chaque</strong> point du plan : elle
            fait glisser toute figure sans la déformer ni la tourner.</p>
            <p className="text-xs text-slate-500">Un vecteur décrit le déplacement ; la
            translation est la transformation qui l’applique. Deux mots, deux rôles.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la flèche de A à B, et
            toute la figure qui la suit.</div>
          </div>
        ),
      },
      {
        id: 'parallelogramme-vecteurs',
        type: 'regles',
        title: 'Égalité de vecteurs et parallélogramme',
        summary:
          'Si ⃗AB = ⃗CD, alors ABDC est un parallélogramme : [AB] et [CD] sont deux côtés parallèles et de même longueur.',
        visual: (
          <Fig caption="⃗AB = ⃗CD : le quadrilatère ABDC se ferme">
            <polygon points="30,95 90,60 160,75 100,110" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
            <Arrow id="p1" x1="30" y1="95" x2="90" y2="60" />
            <Arrow id="p2" x1="100" y1="110" x2="160" y2="75" />
            <text x="20" y="105" fontSize="12" fill="#0f172a">A</text>
            <text x="92" y="54" fontSize="12" fill="#0f172a">B</text>
            <text x="96" y="123" fontSize="12" fill="#0f172a">C</text>
            <text x="164" y="70" fontSize="12" fill="#0f172a">D</text>
          </Fig>
        ),
        body: (
          <div className="space-y-2">
            <p>Deux vecteurs égaux, c’est deux déplacements parallèles, de même sens et de même
            longueur : les segments qui les portent sont donc parallèles et de même longueur.</p>
            <p className="text-xs text-slate-500">Attention à l’ordre des sommets : le contour est
            A → B → D → C, car ce sont <strong>[AB] et [CD]</strong> qui se correspondent.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux flèches
            identiques, et le quadrilatère qui se colore.</div>
          </div>
        ),
      },
    ],

    /* M7 — Le vecteur comme outil : construire, répéter, enchaîner. */
    7: [
      {
        id: 'construire-quatrieme-point',
        type: 'methodes',
        title: 'Construire un point par un vecteur',
        summary:
          'Pour placer le point manquant d’un parallélogramme, on applique à un sommet connu le vecteur du côté opposé — le point se calcule, il ne se cherche pas à la règle.',
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1">
              <li>Écrire le vecteur connu : arrivée − départ.</li>
              <li>L’appliquer au sommet de départ voulu : on ajoute chaque composante à sa
              coordonnée.</li>
              <li>Vérifier que les deux flèches sont bien identiques.</li>
            </ol>
            <p className="text-xs text-slate-500">C’est la même opération que l’image d’un point :
            construire, ce n’est ici rien d’autre que translater.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : D placé au calcul, et le
            quadrilatère qui s’est coloré en vert.</div>
          </div>
        ),
      },
      {
        id: 'repeter-enchainer',
        type: 'methodes',
        title: 'Répéter et enchaîner des déplacements',
        summary:
          'Répéter un même vecteur engendre une frise ; enchaîner deux déplacements revient à ajouter leurs composantes, coordonnée par coordonnée.',
        body: (
          <div className="space-y-3">
            <p>Appliquer encore et encore le même vecteur à un motif produit une bande
            régulière — c’est ainsi que se construisent frises et pavages.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center font-mono">
              (3 ; −4) &nbsp;puis&nbsp; (1 ; 5) &nbsp;→&nbsp; (4 ; 1)
            </div>
            <p className="text-xs text-slate-500">Les horizontales s’ajoutent entre elles, les
            verticales entre elles : chaque coordonnée mène sa vie.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la frise horizontale, et
            le drone qui descend puis remonte.</div>
          </div>
        ),
      },
    ],
  },
};
