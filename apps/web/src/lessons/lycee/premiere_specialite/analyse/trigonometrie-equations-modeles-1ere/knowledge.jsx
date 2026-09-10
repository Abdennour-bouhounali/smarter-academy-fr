import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de « Fonctions trigonométriques : équations et phénomènes
 * périodiques » — SOURCE UNIQUE (docs/architecture/KNOWLEDGE_MAP.md). Le texte
 * d'une brique vit ICI et nulle part ailleurs ; les modules la posent par son
 * id, au moment où le geste vient de lui donner du sens.
 *
 * CE QUI N'EST PAS ICI, ET POURQUOI.
 *   · Le cercle trigonométrique, le radian, les valeurs remarquables, la
 *     résolution SUR UN TOUR (methode-resoudre-cos, methode-resoudre-sin,
 *     equation-deux-solutions, regle-deux-symetries, regle-hors-bornes) et les
 *     FORMULES D'ADDITION sont des briques de la SECONDE
 *     (`trigonometrie-cercle-2nde`, `trigonometrie-equations-2nde`).
 *   · La périodicité, la parité et la courbe des deux fonctions sont des
 *     briques de la PARTIE 1 de ce chapitre
 *     (`trigonometrie-cercle-fonctions-1ere`).
 *   Toutes sont en `priorKnowledge`, et le module 0 les mesure. Les réétablir
 *   ici les ferait apparaître DEUX FOIS dans la carte de l'élève, comme si la
 *   Première les découvrait.
 *
 * L'APPORT PROPRE, et donc les seules briques de cette leçon : la FAMILLE de
 * solutions sur ℝ, les deux méthodes qui l'écrivent, l'ARC d'une inéquation,
 * la DUPLICATION déduite de l'addition, et la MODÉLISATION.
 */
const I = '#4f46e5';   // le cosinus
const E = '#059669';   // le sinus
const A = '#dc2626';   // les solutions allumées
const TAU = 2 * Math.PI;

export const LESSON_KNOWLEDGE = {
  modules: {
    2: [
      {
        id: 'solutions-sur-r',
        type: 'concepts',
        title: 'Sur ℝ, une équation trigonométrique a une infinité de solutions',
        summary:
          'Deux points du cercle donnent deux solutions par tour. Comme on peut ajouter autant de tours qu’on veut, il y en a une INFINITÉ, régulièrement espacées de 2π.',
        visual: (
          <MiniGraph
            width={230} height={130} xMin={-7} xMax={13} yMin={-1.4} yMax={1.4}
            functions={[{ fn: Math.cos, color: I }]}
            guides={[{ y: 0.5, color: '#f59e0b' }]}
            points={[
              { x: -Math.PI / 3, y: 0.5, color: A },
              { x: Math.PI / 3, y: 0.5, color: A },
              { x: TAU - Math.PI / 3, y: 0.5, color: A },
              { x: TAU + Math.PI / 3, y: 0.5, color: A },
            ]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              La barre horizontale de hauteur k coupe la courbe encore et encore, à
              droite comme à gauche. Elle ne s’arrête pas au bord du dessin : elle
              continue <strong>indéfiniment</strong>.
            </p>
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$\\text{deux points par tour} \\;\\times\\; \\text{une infinité de tours}$$'}</MathText>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Répondre « x = π/3 » est donc une réponse INCOMPLÈTE : c’est une solution
              parmi une infinité. Il faut décrire toute la famille.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les points qui s’allument à perte de vue quand tu fais glisser la barre.</div>
          </div>
        ),
      },
      {
        id: 'methode-cos-sur-r',
        type: 'methodes',
        title: 'Résoudre cos x = k sur ℝ',
        summary:
          'Si |k| > 1 : aucune solution. Sinon on cherche a dans [0 ; π] tel que cos a = k, et toutes les solutions s’écrivent x = a + 2kπ ou x = −a + 2kπ.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Vérifier que k est bien entre −1 et 1.</li>
              <li>Trouver a dans [0 ; π] tel que cos a = k — le cercle suffit.</li>
              <li>Écrire les DEUX branches, puis ajouter « + 2kπ » à chacune.</li>
            </ol>
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$\\cos x = k \\iff x = a + 2k\\pi \\ \\text{ ou } \\ x = -a + 2k\\pi \\qquad (k \\in \\mathbb{Z})$$'}</MathText>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              cos x = 1/2 : on a a = π/3, donc
              <MathText>{'$$x = \\dfrac{\\pi}{3} + 2k\\pi \\quad \\text{ou} \\quad x = -\\dfrac{\\pi}{3} + 2k\\pi$$'}</MathText>
            </div>
          </div>
        ),
      },
      {
        id: 'mem-plus-deux-k-pi',
        type: 'memoriser',
        title: '⭐ Ne jamais oublier le « + 2kπ »',
        summary: 'Sans lui, on n’a écrit qu’une solution sur une infinité. Avec lui, on les a toutes.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">x = … + 2kπ</div>
            <p className="text-xs text-rose-700">k parcourt tous les entiers relatifs : … −2, −1, 0, 1, 2 …</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'methode-sin-sur-r',
        type: 'methodes',
        title: 'Résoudre sin x = k sur ℝ',
        summary:
          'Même démarche, mais l’autre symétrie : si a est la solution de [−π/2 ; π/2], les solutions sont x = a + 2kπ ou x = π − a + 2kπ.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$\\sin x = k \\iff x = a + 2k\\pi \\ \\text{ ou } \\ x = \\pi - a + 2k\\pi \\qquad (k \\in \\mathbb{Z})$$'}</MathText>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              sin x = 1/2 : on a a = π/6, donc
              <MathText>{'$$x = \\dfrac{\\pi}{6} + 2k\\pi \\quad \\text{ou} \\quad x = \\dfrac{5\\pi}{6} + 2k\\pi$$'}</MathText>
              car π − π/6 = 5π/6.
            </div>
          </div>
        ),
      },
      {
        id: 'regle-deux-familles-differentes',
        type: 'regles',
        title: 'Les deux familles ne se ressemblent pas',
        summary:
          'Pour le cosinus, la deuxième branche est −a. Pour le sinus, c’est π − a. Écrire « ±a » pour le sinus est l’erreur type — et elle donne des nombres faux.',
        visual: (
          <MiniGraph
            width={230} height={130} xMin={-1} xMax={7} yMin={-1.4} yMax={1.4}
            functions={[{ fn: Math.sin, color: E }, { fn: Math.cos, color: I, dashed: true }]}
            guides={[{ y: 0.5, color: '#f59e0b' }]}
            points={[
              { x: Math.PI / 6, y: 0.5, color: E },
              { x: (5 * Math.PI) / 6, y: 0.5, color: E },
              { x: Math.PI / 3, y: 0.5, color: I },
              { x: (5 * Math.PI) / 3, y: 0.5, color: I },
            ]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-900">
                <strong>cos x = k</strong> → x = a + 2kπ ou x = <strong>−a</strong> + 2kπ
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>sin x = k</strong> → x = a + 2kπ ou x = <strong>π − a</strong> + 2kπ
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le contrôle qui ne trompe jamais : la somme des deux solutions d’un même
              tour vaut 2π pour le cosinus, et π pour le sinus.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux points du cercle qui ne se placent pas du même côté.</div>
          </div>
        ),
      },
      {
        id: 'mem-cos-moins-a-sin-pi-moins-a',
        type: 'memoriser',
        title: '⭐ −a pour le cosinus, π − a pour le sinus',
        summary: 'Le cosinus se replie sur l’axe horizontal, le sinus sur l’axe vertical.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">cos → −a + 2kπ</div>
            <div className="text-lg font-black text-rose-700">sin → π − a + 2kπ</div>
            <p className="text-xs text-rose-700">et dans les deux cas, « + 2kπ » à la fin</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'inequation-arc',
        type: 'concepts',
        title: 'La solution d’une inéquation est un arc',
        summary:
          'Avec un signe =, la solution est faite de points isolés. Avec un signe ≥ ou ≤, elle devient un MORCEAU de cercle — un arc — et donc, sur la courbe, des bandes qui se répètent tous les 2π.',
        visual: (
          <MiniGraph
            width={230} height={130} xMin={-1} xMax={7} yMin={-1.4} yMax={1.4}
            functions={[{ fn: Math.cos, color: I }]}
            guides={[{ y: 0.5, color: '#f59e0b' }]}
            bands={[
              { from: 0, to: Math.PI / 3, color: A, opacity: 0.15 },
              { from: TAU - Math.PI / 3, to: TAU, color: A, opacity: 0.15 },
            ]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Les deux points où la barre touche la courbe sont les <strong>bornes</strong> de
              l’arc : ce sont eux qu’on trouve d’abord, en résolvant l’égalité. Ensuite on
              regarde de quel côté la courbe est <strong>au-dessus</strong> de la barre.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Un arc n’est pas « deux nombres » : entre ses deux bornes, il y a une infinité
              de réels, et ils sont tous solutions.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le morceau de cercle qui s’est coloré quand tu as fait glisser la barre.</div>
          </div>
        ),
      },
      {
        id: 'methode-inequation-trigo',
        type: 'methodes',
        title: 'Résoudre une inéquation trigonométrique sur un tour',
        summary:
          'Résoudre d’abord l’ÉGALITÉ pour trouver les deux bornes, puis regarder sur la figure de quel côté l’inégalité est vraie, et écrire l’arc.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Remplacer le signe par un = et trouver les deux bornes.</li>
              <li>Placer la barre sur la figure et regarder où la courbe est du bon côté.</li>
              <li>Écrire l’arc entre les deux bornes, dans le sens du tour.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3">
              cos x ≥ 1/2 sur [0 ; 2π[ : les bornes sont π/3 et 5π/3, et la courbe est
              au-dessus <strong>autour de 0</strong>. L’ensemble solution est donc
              [0 ; π/3] ∪ [5π/3 ; 2π[.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Ne jamais deviner le côté : le lire sur la figure. Selon le sens de
              l’inégalité, c’est l’arc autour de 0 ou l’arc autour de π.
            </div>
          </div>
        ),
      },
      {
        id: 'regle-arc-se-repete',
        type: 'regles',
        title: 'L’arc se répète, lui aussi, tous les 2π',
        summary:
          'On résout sur un tour, puis on ajoute « + 2kπ » à chaque borne : sur ℝ, l’ensemble solution est une suite de bandes régulièrement espacées.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Exactement comme pour l’égalité : ce qu’on a trouvé sur un tour se reproduit
              à l’identique au tour suivant, et au précédent.
            </p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'formules-duplication',
        type: 'formules',
        title: 'Les formules de duplication',
        summary:
          'En posant b = a dans les formules d’addition, on obtient cos 2a = cos²a − sin²a et sin 2a = 2 sin a cos a. Elles ne se retiennent pas : elles se retrouvent.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-rose-100 bg-white p-3 space-y-2 text-center">
              <MathText>{'$$\\cos 2a = \\cos^2 a - \\sin^2 a$$'}</MathText>
              <MathText>{'$$\\sin 2a = 2\\sin a \\cos a$$'}</MathText>
            </div>
            <p>
              Avec cos²a + sin²a = 1, la première se réécrit de deux autres façons — celle
              qui ne contient que des cosinus, et celle qui ne contient que des sinus :
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 text-center">
              <MathText>{'$$\\cos 2a = 2\\cos^2 a - 1 = 1 - 2\\sin^2 a$$'}</MathText>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le geste minuscule qui a fait tomber la formule — remplacer b par a.</div>
          </div>
        ),
      },
      {
        id: 'methode-poser-b-egale-a',
        type: 'methodes',
        title: 'Retrouver une formule de duplication',
        summary:
          'Écrire la formule d’addition, remplacer partout b par a, puis simplifier. Aucune formule nouvelle à apprendre par cœur.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Partir de cos(a + b) = cos a cos b − sin a sin b.</li>
              <li>Remplacer b par a : cos(a + a) = cos a cos a − sin a sin a.</li>
              <li>Simplifier : cos 2a = cos²a − sin²a.</li>
            </ol>
            <div className="rounded-xl border border-rose-100 bg-white p-3">
              Même geste pour le sinus : sin(a + a) = sin a cos a + cos a sin a, donc
              <strong> sin 2a = 2 sin a cos a</strong>.
            </div>
          </div>
        ),
      },
      {
        id: 'regle-cos-2a-nest-pas-2cos-a',
        type: 'regles',
        title: 'cos 2a n’est PAS 2 cos a',
        summary:
          'Un seul contre-exemple le prouve : en a = π/3, cos 2a vaut −0,5 alors que 2 cos a vaut 1. Doubler le réel ne double pas la valeur.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <MathText>{'$$\\cos\\left(2 \\times \\dfrac{\\pi}{3}\\right) = \\cos\\dfrac{2\\pi}{3} = -0{,}5 \\qquad 2\\cos\\dfrac{\\pi}{3} = 2 \\times 0{,}5 = 1$$'}</MathText>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Les deux nombres ne sont même pas du même signe. C’est la même erreur que
              « cos(a + b) = cos a + cos b », rencontrée en Seconde.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-poser-b-egale-a',
        type: 'memoriser',
        title: '⭐ 2a, c’est a + a',
        summary: 'Toute formule de duplication est une formule d’addition où b = a.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">cos 2a = cos²a − sin²a</div>
            <div className="text-xl font-black text-rose-700">sin 2a = 2 sin a cos a</div>
            <p className="text-xs text-rose-700">et si tu les oublies : pose b = a dans l’addition</p>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'modele-periodique',
        type: 'concepts',
        title: 'Décrire un phénomène qui se répète',
        summary:
          'La marée, la température d’une journée, une nacelle de grande roue : trois nombres suffisent — le niveau moyen, l’amplitude (l’écart au niveau moyen) et la période (la durée d’un cycle).',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-amber-100 bg-white p-3 text-center">
              <MathText>{'$$h(t) = m + A\\cos\\!\\left(\\dfrac{2\\pi(t - d)}{P}\\right)$$'}</MathText>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <strong>m</strong>, le niveau moyen : la hauteur autour de laquelle tout oscille
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <strong>A</strong>, l’amplitude : l’écart entre le niveau moyen et le maximum
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <strong>P</strong>, la période : la durée au bout de laquelle tout recommence
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <strong>d</strong>, le décalage : l’instant où le maximum est atteint
              </div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le sommet que tu attrapais pour régler la courbe.</div>
          </div>
        ),
      },
      {
        id: 'methode-lire-amplitude-periode',
        type: 'methodes',
        title: 'Lire l’amplitude et la période sur une courbe',
        summary:
          'L’amplitude est la MOITIÉ de l’écart entre le maximum et le minimum. La période se lit d’un sommet au sommet SUIVANT.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-amber-100 bg-white p-3 text-center">
              <MathText>{'$$A = \\dfrac{\\text{maximum} - \\text{minimum}}{2} \\qquad m = \\dfrac{\\text{maximum} + \\text{minimum}}{2}$$'}</MathText>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              Une marée qui monte à 6 m et descend à 2 m : l’amplitude vaut (6 − 2)/2 = 2 m,
              et le niveau moyen (6 + 2)/2 = 4 m.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Deux pièges : prendre le maximum pour l’amplitude (il faut retirer le niveau
              moyen), et mesurer d’un sommet au CREUX suivant (cela ne donne que la moitié
              de la période).
            </div>
          </div>
        ),
      },
      {
        id: 'regle-amplitude-et-periode-independantes',
        type: 'regles',
        title: 'L’amplitude et la période ne se déduisent pas l’une de l’autre',
        summary:
          'Deux phénomènes peuvent monter à la même hauteur sans se répéter au même rythme, et inversement. Les deux nombres se lisent séparément : l’un à la verticale, l’autre à l’horizontale.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              La marée d’un port a une amplitude de 2 m et un cycle de 12 h ; la température
              d’une journée a une amplitude de 6 °C et un cycle de 24 h. Rien ne relie ces
              deux réglages, et le laboratoire le montre : monter le sommet ne change pas
              le rythme.
            </p>
          </div>
        ),
      },
    ],
  },
};

export default LESSON_KNOWLEDGE;
