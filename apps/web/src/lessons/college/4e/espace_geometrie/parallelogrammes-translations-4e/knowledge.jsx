import React from 'react';
import {
  A_DEFAUT, B_DEFAUT, D_DEFAUT, quatriemeSommet, glissementEntre, DRAPEAU,
  glisserFigure, demonstration,
} from './components/paral4e';

/**
 * Connaissances de la leçon « Parallélogrammes et translations » (4e) —
 * SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     le parallélogramme est la TRACE d'un glissement (M1)
 *          ↓
 *     construire le quatrième sommet en reportant le trajet (M1)
 *          ↓
 *     les deux trajets sont LE MÊME glissement (M2)
 *          ↓                          ↘
 *     l'ordre des sommets (M2)     un seul glissement pour tous (M4)
 *          ↓                          ↓
 *     la phrase qui justifie (M5)  ←──┘
 *          ↓
 *     la démonstration en trois lignes (M6)
 *
 * Rien n'y est arbitraire : on ne peut pas JUSTIFIER (M5) avant d'avoir
 * établi que les deux trajets sont le même déplacement (M2), et on ne peut
 * pas RÉDIGER une démonstration (M6) avant de savoir formuler la phrase qui
 * la porte (M5).
 *
 * CE QUE CETTE CARTE NE CONTIENT PAS, et pourquoi :
 *  — la définition du parallélogramme, ses côtés opposés, ses diagonales,
 *    ses caractérisations : acquis de 5e (`parallelogrammes-5e`), listés
 *    dans `priorKnowledge` et diagnostiqués au module 0 ;
 *  — la translation elle-même, ses trois caractères, l'image d'un point,
 *    ses invariants, et le lien « M M’ N’ N est un parallélogramme » :
 *    acquis de la leçon SŒUR `transformations-4e`, également en
 *    `priorKnowledge`. Cette leçon-ci ne les redéclare pas — elle s'en sert
 *    pour CONSTRUIRE, JUSTIFIER et DÉMONTRER ;
 *  — le vecteur, sa notation, ses coordonnées et la relation de Chasles :
 *    objets de 3e, exclus par une garde exécutable.
 */

/* ══ Petits visuels partagés ══════════════════════════════════════════ */

/** Le parallélogramme et les deux trajets, en miniature. */
const DeuxTrajets = () => {
  const C = quatriemeSommet(A_DEFAUT, B_DEFAUT, D_DEFAUT);
  const pts = [A_DEFAUT, B_DEFAUT, C, D_DEFAUT];
  const minX = Math.min(...pts.map((p) => p.x)) - 24;
  const minY = Math.min(...pts.map((p) => p.y)) - 24;
  const w = Math.max(...pts.map((p) => p.x)) + 24 - minX;
  const h = Math.max(...pts.map((p) => p.y)) + 24 - minY;
  const d = (p) => `${p.x - minX},${p.y - minY}`;
  return (
    <div className="rounded-xl border border-violet-100 bg-white p-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
           aria-label="Un parallélogramme ABCD, avec les deux trajets de A vers D et de B vers C en gras">
        <polygon points={pts.map(d).join(' ')} fill="#7c3aed" fillOpacity="0.12" stroke="#7c3aed" strokeWidth="3" />
        <line x1={A_DEFAUT.x - minX} y1={A_DEFAUT.y - minY} x2={D_DEFAUT.x - minX} y2={D_DEFAUT.y - minY}
              stroke="#0891b2" strokeWidth="6" strokeLinecap="round" />
        <line x1={B_DEFAUT.x - minX} y1={B_DEFAUT.y - minY} x2={C.x - minX} y2={C.y - minY}
              stroke="#0891b2" strokeWidth="6" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x - minX} cy={p.y - minY} r="7" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
        ))}
      </svg>
      <p className="text-center text-xs text-slate-500">les deux trajets sont le même glissement</p>
    </div>
  );
};

/** Le bon ordre contre le croisé. */
const BonOrdre = () => {
  const C = quatriemeSommet(A_DEFAUT, B_DEFAUT, D_DEFAUT);
  const pts = [A_DEFAUT, B_DEFAUT, C, D_DEFAUT];
  const minX = Math.min(...pts.map((p) => p.x)) - 20;
  const minY = Math.min(...pts.map((p) => p.y)) - 20;
  const w = Math.max(...pts.map((p) => p.x)) + 20 - minX;
  const h = Math.max(...pts.map((p) => p.y)) + 20 - minY;
  const d = (p) => `${p.x - minX},${p.y - minY}`;
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        { titre: 'A B C D', ordre: [A_DEFAUT, B_DEFAUT, C, D_DEFAUT], couleur: '#059669', note: 'le contour' },
        { titre: 'A B D C', ordre: [A_DEFAUT, B_DEFAUT, D_DEFAUT, C], couleur: '#dc2626', note: 'croisé' },
      ].map((cas) => (
        <div key={cas.titre} className="rounded-xl border border-slate-200 bg-white p-2">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
               aria-label={`Le quadrilatère obtenu en reliant les sommets dans l’ordre ${cas.titre}`}>
            <polygon points={cas.ordre.map(d).join(' ')} fill={cas.couleur} fillOpacity="0.12"
                     stroke={cas.couleur} strokeWidth="3" />
            {cas.ordre.map((p, i) => (
              <circle key={i} cx={p.x - minX} cy={p.y - minY} r="6" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
            ))}
          </svg>
          <p className="text-center text-xs font-semibold" style={{ color: cas.couleur }}>
            {cas.titre} — {cas.note}
          </p>
        </div>
      ))}
    </div>
  );
};

/** Une figure et son image, avec les cinq trajets parallèles. */
const FigureQuiGlisse = () => {
  const g = glissementEntre({ x: 0, y: 0 }, { x: 200, y: 50 });
  const image = glisserFigure(DRAPEAU, g);
  const tous = [...DRAPEAU, ...image];
  const minX = Math.min(...tous.map((p) => p.x)) - 20;
  const minY = Math.min(...tous.map((p) => p.y)) - 20;
  const w = Math.max(...tous.map((p) => p.x)) + 20 - minX;
  const h = Math.max(...tous.map((p) => p.y)) + 20 - minY;
  const d = (p) => `${p.x - minX},${p.y - minY}`;
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img"
           aria-label="Une figure et son image par un glissement, reliées par cinq traits parallèles">
        {DRAPEAU.map((p, i) => (
          <line key={i} x1={p.x - minX} y1={p.y - minY} x2={image[i].x - minX} y2={image[i].y - minY}
                stroke="#0891b2" strokeWidth="2.5" strokeDasharray="6 5" />
        ))}
        <polygon points={DRAPEAU.map(d).join(' ')} fill="#64748b" fillOpacity="0.18" stroke="#334155" strokeWidth="3" />
        <polygon points={image.map(d).join(' ')} fill="#059669" fillOpacity="0.18" stroke="#059669" strokeWidth="3" />
      </svg>
      <p className="text-center text-xs text-slate-500">cinq points, cinq trajets — tous identiques</p>
    </div>
  );
};

/** La chaîne d'une démonstration, en trois cases. */
const TroisLignes = () => {
  const d = demonstration('construction');
  const TON = {
    donnee: 'border-sky-200 bg-sky-50 text-sky-900',
    propriete: 'border-violet-200 bg-violet-50 text-violet-900',
    conclusion: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  };
  const NOM = { donnee: '1. La donnée', propriete: '2. La propriété', conclusion: '3. La conclusion' };
  return (
    <div className="space-y-1.5">
      {d.maillons.map((m) => (
        <div key={m.id} className={`rounded-xl border-2 p-2 ${TON[m.role]}`}>
          <div className="text-xs font-black uppercase tracking-wide opacity-70">{NOM[m.role]}</div>
          <div className="text-sm">{m.texte}</div>
        </div>
      ))}
    </div>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — ce qu'on vient de VOIR : le point qu'on n'a pas placé. */
    1: [
      {
        id: 'trace-du-glissement',
        type: 'concepts',
        title: 'Un parallélogramme est la trace d’un glissement',
        summary:
          'Quand un même glissement mène A en D et B en C, le quadrilatère ABCD est un parallélogramme. Ce n’est pas une coïncidence de dessin : c’est le glissement qui le referme.',
        visual: <DeuxTrajets />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Jusqu’ici, on reconnaissait un parallélogramme à ce qu’on VOYAIT : des côtés qui
              ont l’air parallèles, des longueurs qui ont l’air égales. Ici, on le reconnaît à
              sa <strong>cause</strong> : un glissement l’a fabriqué.
            </p>
            <p className="text-sm text-slate-700">
              Les deux traits épais sont les deux <strong>trajets</strong> du glissement : celui
              qui mène A en D, et celui qui mène B en C. Ce sont eux qui forment deux côtés
              opposés de la figure.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              La question change de sens : ce n’est plus « est-ce que ça ressemble à un
              parallélogramme ? », c’est <strong>« quel glissement l’a fait ? »</strong>.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le point C qu’on n’a jamais placé, et qui arrivait quand même.
            </div>
          </div>
        ),
      },
      {
        id: 'construire-le-quatrieme',
        type: 'methodes',
        title: 'Construire le quatrième sommet en reportant le trajet',
        summary:
          'Pour placer C tel que ABCD soit un parallélogramme : on regarde le trajet qui mène A en D, et on le reporte à l’identique en partant de B.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-2 text-sm text-slate-700">
              <li>
                <strong>1. Lire le trajet</strong> qui mène A en D : de combien on va sur le côté,
                de combien on monte ou on descend.
              </li>
              <li>
                <strong>2. Repartir de B</strong>, et refaire exactement le même trajet — même
                longueur, même direction, même sens.
              </li>
              <li>
                <strong>3. C est le point d’arrivée.</strong> Il n’y a rien à ajuster à l’œil.
              </li>
            </ol>
            <div className="rounded-xl border-2 border-sky-200 bg-white p-3 text-sm text-slate-700">
              En 5e, on plaçait ce même point en passant par le milieu commun des diagonales.
              C’est le <strong>même point</strong> : deux chemins, une seule figure. Ce qui
              change, c’est ce que la construction permet ensuite de JUSTIFIER.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le défi où il fallait replacer C sans que rien ne t’aimante.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — pourquoi ça se referme, et le piège de l'ordre. */
    2: [
      {
        id: 'deux-trajets-un-glissement',
        type: 'regles',
        title: 'Les deux trajets sont le MÊME glissement',
        summary:
          'Si un glissement mène A en D et B en C, alors [AD] et [BC] sont parallèles, de même longueur et de même sens. Deux côtés opposés parallèles et de même longueur suffisent à conclure.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              C’est la raison, et elle tient en deux temps :
            </p>
            <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <div>
                <strong>parce que c’est un glissement</strong> → tous les points font le même
                trajet, donc [AD] et [BC] sont parallèles et de même longueur ;
              </div>
              <div>
                <strong>parce que c’est ce qu’il fallait</strong> → un quadrilatère dont deux
                côtés opposés sont parallèles et de même longueur est un parallélogramme.
              </div>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Les deux conditions comptent. Deux côtés seulement <strong>de même longueur</strong>,
              sans le parallélisme, ne suffisent pas : un cerf-volant en a, et ce n’est pas un
              parallélogramme.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les deux longueurs affichées sous la figure, toujours égales.
            </div>
          </div>
        ),
      },
      {
        id: 'ordre-des-sommets',
        type: 'memoriser',
        title: '⭐ L’ordre des sommets fait la figure',
        summary:
          'ABCD se lit dans l’ordre du contour : A, puis B, puis C, puis D, et on referme sur A. Relier A, B, D, C traverse la figure et fabrique un quadrilatère croisé.',
        visual: <BonOrdre />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              C’est l’erreur la plus fréquente, et elle ne se voit pas dans un calcul : elle ne
              se voit que sur le dessin. En reliant les deux points de départ puis leurs deux
              points d’arrivée, on <strong>traverse</strong> le quadrilatère au lieu d’en faire
              le tour.
            </p>
            <div className="rounded-xl border-2 border-rose-200 bg-white p-3 text-sm text-slate-700">
              Le réflexe : nommer les sommets <strong>en tournant</strong>, dans le sens du
              contour, sans jamais sauter d’un côté à l’autre.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — la figure entière, et le test qui décide. */
    4: [
      {
        id: 'un-seul-trajet-pour-tous',
        type: 'regles',
        title: 'Un seul trajet pour tous les points',
        summary:
          'Dans un glissement, TOUS les points font exactement le même trajet. Il suffit d’un seul point mal placé pour que ce ne soit plus un glissement.',
        visual: <FigureQuiGlisse />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              C’est le test qui décide, et il se fait à l’œil : on <strong>relie chaque point à
              son image</strong>. Si les traits obtenus sont tous parallèles, de même longueur et
              dans le même sens, c’est un glissement.
            </p>
            <p className="text-sm text-slate-700">
              Conséquence directe : chaque point et son image forment, avec un autre point et
              son image, un parallélogramme. Une figure qui glisse en fabrique donc{' '}
              <strong>autant qu’on veut</strong>.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Si les traits se coupent tous en un même point, ce n’est pas un glissement mais le
              demi-tour de 5e. Si leurs longueurs diffèrent, ce n’est ni l’un ni l’autre.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le drapeau qui glissait, et les cinq traits restés parallèles.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — la phrase. */
    5: [
      {
        id: 'justifier-par-le-glissement',
        type: 'methodes',
        title: 'La phrase qui justifie',
        summary:
          'Pour justifier qu’un quadrilatère est un parallélogramme par un glissement, il faut dire TROIS choses : quel glissement, quels deux points il déplace, et quelle propriété permet de conclure.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-purple-200 bg-white p-3">
              <p className="text-sm italic text-slate-700">
                « Le glissement qui mène A en D mène aussi B en C. Donc [AD] et [BC] sont
                parallèles et de même longueur. Donc ABCD est un parallélogramme. »
              </p>
            </div>
            <p className="text-sm text-slate-700">
              Chacun des trois morceaux est indispensable, et chacun tombe pour une raison
              différente :
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700">
                sans le <strong>glissement nommé</strong>, on ne sait pas de quel déplacement on
                parle ;
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700">
                sans les <strong>deux points</strong>, on ne sait pas quels côtés deviennent
                parallèles ;
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700">
                sans la <strong>propriété</strong>, on affirme sans prouver.
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              « Ça se voit sur la figure » n’est jamais une justification : un dessin peut être
              faux, et de toute façon il ne prouve rien.
            </div>
          </div>
        ),
      },
    ],

    /* M6 — la démonstration rédigée. */
    6: [
      {
        id: 'trois-lignes-de-preuve',
        type: 'methodes',
        title: 'Une démonstration tient en trois lignes',
        summary:
          'Une donnée (ce que l’énoncé dit), une propriété (ce que le cours dit), une conclusion (ce qu’on en déduit). Toujours dans cet ordre, jamais moins de trois.',
        visual: <TroisLignes />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              La ligne du milieu est celle qu’on oublie — et c’est la seule qui prouve. Sans
              elle, on passe de la donnée à la conclusion sans dire POURQUOI : le raisonnement a
              l’air juste, mais il ne démontre rien.
            </p>
            <div className="rounded-xl border-2 border-rose-200 bg-white p-3 text-sm">
              <p className="font-semibold text-slate-700">Le repère à l’écrit :</p>
              <ul className="mt-1 space-y-0.5 text-slate-600">
                <li>la donnée commence souvent par « <strong>On sait que</strong> » ;</li>
                <li>la propriété commence par « <strong>Or</strong> » ;</li>
                <li>la conclusion commence par « <strong>Donc</strong> ».</li>
              </ul>
            </div>
            <p className="text-sm text-slate-700">
              Et cela marche dans les deux sens : d’un glissement on tire un parallélogramme, et
              d’un parallélogramme on tire le glissement qui le referme.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les trois étiquettes à remettre dans l’ordre, et celle qui manquait.
            </div>
          </div>
        ),
      },
    ],
  },
};
