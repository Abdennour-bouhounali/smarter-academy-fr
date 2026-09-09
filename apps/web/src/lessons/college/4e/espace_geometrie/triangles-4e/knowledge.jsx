import React from 'react';
import {
  A_DEFAUT, B_DEFAUT, surLeCercleAB, droiteDesMilieux, midpoint, arrondi, fr,
} from './components/triangles4e';

/**
 * Connaissances de la leçon « Triangles : démontrer » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     [AB] est un diamètre (M1)
 *          ↓
 *     rectangle ⇒ centre sur le milieu (M1)
 *          ↓
 *     le chemin INVERSE est vrai aussi (M2)  ← d'où le mot caractérisation
 *          ↓                                    ↘
 *     droite des milieux, sens direct (M3)       │
 *          ↓                                     │
 *     sa réciproque, cherchée (M4)               │
 *          ↓                                     ↓
 *     propriété ≠ réciproque, et le contre-exemple (M5)
 *          ↓
 *     donnée → propriété → conclusion (M6)
 *
 * Rien n'y est arbitraire. Le mot « réciproque » (M2) ne peut pas précéder le
 * constat qui lui donne un sens, et la charpente d'une démonstration (M6) n'a
 * de contenu que si l'élève dispose déjà de propriétés NOMMÉES à invoquer :
 * c'est pourquoi elle vient en dernier, avec quatre propriétés en réserve.
 *
 * Ce que cette carte NE contient PAS : les médiatrices et le cercle
 * circonscrit d'un triangle quelconque, la somme des angles, l'inégalité
 * triangulaire, le milieu d'un segment, les droites parallèles. Ce sont les
 * acquis listés dans `priorKnowledge` et diagnostiqués au module 0. Elle ne
 * contient pas non plus Thalès ni la trigonométrie (objets de 3e), ni le
 * théorème de Pythagore (leçon sœur `pythagore-4e`).
 */

/* ══ Petits visuels partagés ══════════════════════════════════════════ */

/**
 * Le triangle rectangle inscrit dans son demi-cercle, en miniature.
 *
 * La position de C est CALCULÉE par `surLeCercleAB` : la vignette de la carte
 * montre donc la même mathématique que le labo, et non un dessin à la main qui
 * pourrait la contredire (invariant visuel du dépôt).
 */
const CercleDiametre = () => {
  const C = surLeCercleAB(A_DEFAUT, B_DEFAUT, (58 * Math.PI) / 180);
  const O = midpoint(A_DEFAUT, B_DEFAUT);
  const r = (B_DEFAUT.x - A_DEFAUT.x) / 2;
  // Repère local : le cercle et sa marge tiennent dans 150 unités.
  const k = 150 / (2 * r + 30);
  const q = (u) => ({ x: (u.x - O.x + r + 15) * k, y: (u.y - O.y + r + 15) * k });
  const [a, b, c] = [A_DEFAUT, B_DEFAUT, C].map(q);
  const o = q(O);
  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-2">
      <svg viewBox="0 0 150 150" className="mx-auto w-full max-w-[150px]" role="img"
           aria-label="Un triangle dont un côté est le diamètre du cercle : l’angle opposé est droit">
        <circle cx={o.x} cy={o.y} r={r * k} fill="#eef2ff" stroke="#6366f1" strokeWidth="1.6" />
        <polygon points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`}
                 fill="#ffffff" fillOpacity="0.9" stroke="#0f172a" strokeWidth="1.6" />
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#dc2626" strokeWidth="2.4" />
        <circle cx={o.x} cy={o.y} r="3.2" fill="#dc2626" />
      </svg>
      <p className="text-center text-xs text-slate-500">[AB] diamètre ⟹ angle droit en C</p>
    </div>
  );
};

/** La droite des milieux, avec ses deux marques, en miniature. */
const DroiteMilieux = () => {
  const A = { x: 75, y: 18 };
  const B = { x: 16, y: 108 };
  const C = { x: 134, y: 108 };
  const m = droiteDesMilieux(A, B, C);
  return (
    <div className="rounded-xl border border-sky-100 bg-white p-2">
      <svg viewBox="0 0 150 126" className="mx-auto w-full max-w-[150px]" role="img"
           aria-label="Le segment joignant les milieux de deux côtés est parallèle au troisième">
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="#f8fafc" stroke="#0f172a" strokeWidth="1.6" />
        <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#7c3aed" strokeWidth="3" />
        <line x1={m.I.x} y1={m.I.y} x2={m.J.x} y2={m.J.y} stroke="#059669" strokeWidth="3" />
        <circle cx={m.I.x} cy={m.I.y} r="3.2" fill="#0891b2" />
        <circle cx={m.J.x} cy={m.J.y} r="3.2" fill="#0891b2" />
      </svg>
      <p className="text-center text-xs text-slate-500">
        {/* Le même formateur que les labos : la vignette de la carte ne peut
            donc pas afficher « 0,5 » là où le module montre « 0,50 ». */}
        IJ ÷ BC = {fr(arrondi(m.rapport, 2), 2)}
      </p>
    </div>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le nom du côté, puis le constat sur le centre. */
    1: [
      {
        id: 'hypotenuse-diametre',
        type: 'vocabulaire',
        title: 'Un triangle inscrit dans un cercle',
        summary:
          'Un triangle est INSCRIT dans un cercle quand ses trois sommets sont sur ce cercle. Ce cercle est son cercle circonscrit, et un côté peut en être un DIAMÈTRE.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Tu connais déjà le cercle circonscrit : il passe par les trois sommets, et son
              centre est le point de concours des médiatrices. Ce qui est nouveau ici, c’est de
              regarder <strong>où tombe ce centre</strong>.
            </p>
            <p className="text-sm text-slate-700">
              Un <strong>diamètre</strong> est une corde qui passe par le centre : c’est le plus
              grand segment qu’on puisse tracer dans un cercle, et il vaut deux rayons.
            </p>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : le point rouge O que tu as amené sur le point bleu M.
            </div>
          </div>
        ),
      },
      {
        id: 'cercle-circonscrit-rectangle',
        type: 'concepts',
        title: 'Rectangle : le centre est au milieu de l’hypoténuse',
        summary:
          'Si un triangle est rectangle, alors le centre de son cercle circonscrit est le milieu du côté opposé à l’angle droit — donc ce côté est un diamètre.',
        visual: <CercleDiametre />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Tu l’as cherché toi-même : tant que l’angle en C n’est pas droit, le centre O reste
              à distance du milieu M. Au moment exact où l’angle atteint 90°, les deux points se
              confondent.
            </p>
            <div className="rounded-xl border-2 border-indigo-200 bg-white p-3 text-sm text-slate-700">
              Autre façon de dire la même chose : le segment qui joint l’angle droit au milieu du
              côté opposé est un <strong>rayon</strong> du cercle. Il vaut donc la{' '}
              <strong>moitié</strong> de ce côté.
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Attention au sens de lecture : pour l’instant on part de l’angle droit pour aller
              vers le cercle. Le chemin inverse est une autre affaire.
            </div>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : les deux témoins qui se sont mis d’accord.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Le chemin inverse, et le mot qui le nomme. */
    2: [
      {
        id: 'caracterisation-rectangle',
        type: 'regles',
        title: 'La caractérisation du triangle rectangle',
        summary:
          'Un triangle est rectangle SI ET SEULEMENT SI il est inscrit dans un cercle dont un côté est un diamètre. Les deux affirmations se déduisent l’une de l’autre.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Le module précédent partait de l’angle droit. Celui-ci fait l’inverse : on place un
              point n’importe où sur le cercle, et l’angle est droit à chaque fois. Les deux
              chemins sont vrais.
            </p>
            <div className="space-y-1.5 rounded-xl border-2 border-violet-200 bg-white p-3 text-sm">
              <div>
                <span className="rounded bg-violet-100 px-1.5 py-0.5 text-xs font-bold text-violet-800">sens direct</span>
                <span className="ml-2 text-slate-700">rectangle en C ⟹ [AB] est un diamètre</span>
              </div>
              <div>
                <span className="rounded bg-violet-100 px-1.5 py-0.5 text-xs font-bold text-violet-800">sens inverse</span>
                <span className="ml-2 text-slate-700">C sur le cercle de diamètre [AB] ⟹ rectangle en C</span>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Quand les deux sens sont vrais, on ne dit plus « propriété » mais{' '}
              <strong>caractérisation</strong>, et on a le droit d’écrire « si et seulement si ».
              C’est rare, et cela se vérifie : ce n’est jamais automatique.
            </p>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : le point posé sur le cercle, qui donnait un angle droit où qu’il aille.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — La droite des milieux, sens direct. */
    3: [
      {
        id: 'droite-des-milieux',
        type: 'concepts',
        title: 'La droite des milieux',
        summary:
          'Dans un triangle, le segment qui joint les milieux de deux côtés est parallèle au troisième côté et en mesure la moitié.',
        visual: <DroiteMilieux />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-sky-200 bg-white p-3 text-sm text-slate-700">
              Si I est le milieu de [AB] et J le milieu de [AC], alors :
              <div className="mt-1.5 space-y-0.5 font-semibold text-sky-800">
                <div>· (IJ) est parallèle à (BC)</div>
                <div>· IJ = BC ÷ 2</div>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Les deux faits vont ensemble et se lisent sur la même figure. Tu les as relevés sur
              trois triangles très différents : l’angle est resté à 0°, le rapport à 0,5.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Les DEUX points doivent être des milieux. Un segment partant d’un milieu vers un
              point quelconque n’a aucune de ces deux propriétés.
            </div>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : les deux nombres qui refusaient de bouger pendant que tu déformais tout.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — La réciproque, cherchée avant d'être énoncée. */
    4: [
      {
        id: 'reciproque-milieux',
        type: 'regles',
        title: 'La réciproque de la droite des milieux',
        summary:
          'Si une droite passe par le milieu d’un côté et est parallèle à un autre côté, alors elle coupe le troisième côté en son milieu.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Ici, ce n’est plus le milieu qui est donné : c’est le <strong>parallélisme</strong>.
              Et c’est lui qui force la conclusion.
            </p>
            <div className="space-y-1.5 rounded-xl border-2 border-emerald-200 bg-white p-3 text-sm">
              <div>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-800">on sait</span>
                <span className="ml-2 text-slate-700">I est le milieu de [AB], et (IK) est parallèle à (BC)</span>
              </div>
              <div>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-800">on conclut</span>
                <span className="ml-2 text-slate-700">K est le milieu de [AC]</span>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Tu l’as vérifié en glissant K : le parallélisme n’apparaît qu’à UN seul endroit du
              côté, et c’est le milieu. Ailleurs, l’angle affiché n’est jamais nul.
            </p>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : la seule position de K où le trait devenait vert.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — La leçon de logique, adossée à deux contre-exemples. */
    5: [
      {
        id: 'propriete-et-reciproque',
        type: 'regles',
        title: 'Une propriété et sa réciproque sont deux énoncés différents',
        summary:
          'Échanger l’hypothèse et la conclusion produit un NOUVEL énoncé. Il peut être vrai, il peut être faux : il faut le vérifier à part.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-purple-200 bg-white p-3 text-sm">
              <div className="text-slate-700">
                <strong>Propriété</strong> : si <em>hypothèse</em>, alors <em>conclusion</em>.
              </div>
              <div className="mt-1 text-slate-700">
                <strong>Réciproque</strong> : si <em>conclusion</em>, alors <em>hypothèse</em>.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Les deux propriétés de cette leçon ont leur réciproque vraie — mais c’est un fait
              qu’on a dû établir, pas une règle générale. Voici deux énoncés dont la réciproque
              tombe :
            </p>
            <div className="space-y-1.5 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              <div>
                « équilatéral ⟹ isocèle » est vrai, mais un triangle 5-5-8 est isocèle sans être
                équilatéral.
              </div>
              <div>
                « triangle ⟹ somme des angles 180° » est vrai, mais sa réciproque ne distingue
                aucune forme : tous les triangles font 180°.
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Quand les deux sens sont vrais, on parle de <strong>caractérisation</strong> et on
              écrit « si et seulement si ». Une <strong>définition</strong>, elle, n’a pas de
              réciproque : elle pose un mot, elle n’affirme rien.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-un-seul-sens',
        type: 'memoriser',
        title: 'Une flèche a un sens',
        summary:
          'Avant d’utiliser une propriété, demande-toi dans quel sens tu la lis : ce qu’on te DONNE, et ce que tu veux OBTENIR.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-slate-200 bg-white p-3 text-center text-sm">
              <div className="text-slate-600">
                on me donne l’angle droit → j’obtiens le cercle
              </div>
              <div className="mt-1 text-slate-600">
                on me donne le cercle → j’obtiens l’angle droit
              </div>
              <div className="mt-1.5 font-semibold text-slate-800">
                ce ne sont pas les mêmes phrases
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Le réflexe du détective : repérer d’abord ce que l’énoncé accorde, puis choisir la
              propriété qui part de là. Une propriété lue à l’envers sans vérification n’est pas
              une preuve.
            </p>
          </div>
        ),
      },
    ],

    /* M6 — La charpente, une fois quatre propriétés en réserve. */
    6: [
      {
        id: 'charpente-demonstration',
        type: 'methodes',
        title: 'Donnée, propriété, conclusion',
        summary:
          'Une démonstration s’écrit toujours en trois temps : ce que l’énoncé accorde, la propriété du cours qu’on invoque, ce qu’on en déduit.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-2 text-sm text-slate-700">
              <li>
                <strong>1. La donnée</strong> — ce que l’énoncé dit, recopié tel quel. On ne la
                discute pas, on s’en sert.
              </li>
              <li>
                <strong>2. La propriété</strong> — la règle du cours, NOMMÉE en entier. C’est elle
                qui autorise le passage de la donnée à la conclusion.
              </li>
              <li>
                <strong>3. La conclusion</strong> — ce qu’on en déduit, et rien de plus.
              </li>
            </ol>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              L’erreur la plus fréquente : sauter l’étape 2. Une conclusion posée sans la
              propriété qui l’autorise n’est pas une démonstration — c’est une observation.
            </div>
            <p className="text-sm text-slate-600">
              Une preuve peut enchaîner plusieurs donnée-propriété avant de conclure. Ce qui ne
              change jamais, c’est l’ordre : on ne conclut jamais avant d’avoir invoqué.
            </p>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : les trois pastilles de la jauge, qui s’allumaient dans l’ordre.
            </div>
          </div>
        ),
      },
    ],
  },
};
