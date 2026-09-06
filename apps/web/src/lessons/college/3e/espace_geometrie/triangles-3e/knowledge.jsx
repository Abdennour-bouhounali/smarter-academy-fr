import React from 'react';

/**
 * Connaissances de la leçon « Triangles » (3e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> au moment
 * où l'élève vient de le rencontrer par le geste, puis il reste sur sa carte.
 *
 * ORDRE. L'existence d'un triangle (M1) avant ses noms (M2), les noms avant la
 * somme des angles (M3) — c'est elle qui les fait calculer —, et la
 * justification (M6) avant la conjecture à prouver (M7).
 */

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Trois longueurs font-elles un triangle ? */
    1: [
      {
        id: 'inegalite-triangulaire',
        type: 'regles',
        title: 'L’inégalité triangulaire',
        summary: 'Trois longueurs forment un triangle si et seulement si la plus grande est strictement inférieure à la somme des deux autres.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
              la plus grande &lt; somme des deux autres
            </div>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                strictement inférieure → le triangle existe
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                égale → le triangle est <strong>aplati</strong> : les trois points sont alignés
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                plus grande → le triangle <strong>n’existe pas</strong> : les côtés ne se rejoignent pas
              </div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois poutres, et
              celle qui était trop courte pour refermer la figure.</div>
          </div>
        ),
      },
    ],

    /* M2 — Les noms, qui ne s'excluent pas. */
    2: [
      {
        id: 'triangles-particuliers',
        type: 'vocabulaire',
        title: 'Isocèle, équilatéral, rectangle',
        summary: 'Isocèle : deux côtés de même longueur. Équilatéral : les trois. Rectangle : un angle droit.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>isocèle</strong> — deux côtés de même longueur
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900">
                <strong>équilatéral</strong> — les trois côtés de même longueur
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>rectangle</strong> — un angle droit
              </div>
            </div>
            <p className="text-xs text-slate-500">Ces propriétés ne s’excluent pas : un triangle
            peut être rectangle <strong>et</strong> isocèle. Un nom décrit une propriété, il ne
            range pas dans une case unique.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le triangle qui changeait
            de nom pendant que tu déplaçais son sommet.</div>
          </div>
        ),
      },
    ],

    /* M3 — La somme des angles, la propriété qui fait tout calculer. */
    3: [
      {
        id: 'somme-des-angles',
        type: 'regles',
        title: 'La somme des angles vaut 180°',
        summary: 'Dans TOUT triangle, quels que soient sa forme et sa taille, les trois angles totalisent 180°.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              angle 1 + angle 2 + angle 3 = 180°
            </div>
            <p className="text-xs text-slate-500">« Tout » veut dire tout : aucun triangle n’y
            échappe. C’est ce qui permet de trouver le troisième angle quand deux sont connus, sans
            rien mesurer.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as déformé le triangle
            dans tous les sens, et le total n’a pas bougé.</div>
          </div>
        ),
      },
      {
        id: 'mem-consequences-180',
        type: 'memoriser',
        title: '⭐ Les trois conséquences utiles',
        summary: 'Rectangle : les deux angles aigus font 90°. Équilatéral : trois angles de 60°. Isocèle : les deux angles à la base sont égaux.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2">
            <div className="text-sm text-rose-900 space-y-1">
              <div><strong>Rectangle</strong> : 90° pris, il reste 90° pour les deux aigus.</div>
              <div><strong>Équilatéral</strong> : 180 ÷ 3 = <strong>60°</strong> chacun.</div>
              <div><strong>Isocèle</strong> : les deux angles à la base sont égaux.</div>
            </div>
            <p className="text-xs text-rose-700">Ces trois faits se redémontrent en une ligne à
            partir des 180° — mais les connaître fait gagner un temps précieux.</p>
          </div>
        ),
      },
    ],

    /* M4 — Construire : unicité, et la médiatrice. */
    4: [
      {
        id: 'triangle-determine',
        type: 'regles',
        title: 'Trois longueurs déterminent un triangle',
        summary: 'Si elles vérifient l’inégalité triangulaire, trois longueurs donnent un seul triangle — à un retournement près.',
        body: (
          <div className="space-y-2">
            <p>Une fois les trois longueurs fixées, il n’y a plus de liberté : la forme est
            <strong> imposée</strong>. On ne peut que la retourner ou la faire tourner.</p>
            <p className="text-xs text-slate-500">C’est pour cela qu’un triangle est rigide, et
            qu’on en met dans les charpentes et les ponts.</p>
          </div>
        ),
      },
      {
        id: 'mediatrice-sommet-isocele',
        type: 'concepts',
        title: 'La médiatrice, ensemble des points équidistants',
        summary: 'Le sommet d’un triangle isocèle se trouve sur la médiatrice de sa base : la droite des points à égale distance des deux extrémités.',
        body: (
          <div className="space-y-2">
            <p>La <strong>médiatrice</strong> d’un segment est la droite formée de tous les points
            situés à <strong>égale distance</strong> de ses deux extrémités.</p>
            <p>Le sommet d’un isocèle étant à égale distance de A et de B, il est forcément
            dessus.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as fait glisser le
            sommet, et il restait sur la même droite.</div>
          </div>
        ),
      },
    ],

    /* M5 — Calculer un angle sans rapporteur. */
    5: [
      {
        id: 'methode-calculer-angle',
        type: 'methodes',
        title: 'Calculer un angle sans le mesurer',
        summary: 'On part de 180°, on retire ce qu’on connaît, et on utilise les égalités que le nom du triangle impose.',
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1">
              <li>Repérer ce que le triangle a de particulier (isocèle, rectangle, équilatéral).</li>
              <li>En déduire les angles égaux ou connus.</li>
              <li>Compléter à 180°.</li>
            </ol>
            <p className="text-xs text-slate-500">Un rapporteur mesure ; un raisonnement
            <strong> démontre</strong>. Le second vaut mieux : il ne dépend pas du dessin.</p>
          </div>
        ),
      },
    ],

    /* M6 — Justifier : la forme d'une preuve. */
    6: [
      {
        id: 'justifier',
        type: 'methodes',
        title: 'Puisque… or… donc…',
        summary: 'En géométrie, une réponse sans justification est incomplète : on cite la donnée, puis la propriété, puis la conclusion.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
              <div><strong>Puisque</strong> … <span className="text-slate-500">(ce que dit l’énoncé)</span></div>
              <div><strong>or</strong> … <span className="text-slate-500">(la propriété du cours)</span></div>
              <div><strong>donc</strong> … <span className="text-slate-500">(ce qu’on en déduit)</span></div>
            </div>
            <p className="text-xs text-slate-500">Le résultat seul ne prouve rien : c’est le chemin
            qui convainc. Et il est toujours de cette forme.</p>
          </div>
        ),
      },
    ],

    /* M7 — Conjecturer, puis prouver. */
    7: [
      {
        id: 'droite-des-milieux',
        type: 'formules',
        title: 'Le théorème de la droite des milieux',
        summary: 'Le segment joignant les milieux de deux côtés est parallèle au troisième et mesure la moitié de sa longueur.',
        body: (
          <div className="space-y-3">
            <p>Dans un triangle, joins les <strong>milieux</strong> de deux côtés. Le segment
            obtenu est :</p>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>parallèle</strong> au troisième côté
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                de longueur <strong>la moitié</strong> de celle du troisième côté
              </div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as déplacé les sommets,
            et les deux propriétés ont tenu à chaque fois.</div>
          </div>
        ),
      },
      {
        id: 'conjecturer-puis-prouver',
        type: 'concepts',
        title: 'Conjecturer n’est pas démontrer',
        summary: 'Observer que c’est vrai sur des exemples suggère un résultat ; seule une démonstration l’établit pour tous les cas.',
        body: (
          <div className="space-y-2">
            <p>Constater une propriété sur dix figures est une <strong>conjecture</strong> : une
            hypothèse sérieuse, pas une certitude.</p>
            <p className="text-xs text-slate-500">Un contre-exemple suffit à détruire une
            conjecture ; aucun nombre d’exemples ne suffit à la démontrer.</p>
          </div>
        ),
      },
    ],
  },
};
