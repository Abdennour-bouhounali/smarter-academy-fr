import React from 'react';
import { MiniFigure } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Figures planes » (6e) — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md, KNOWLEDGE_DEPENDENCY.md).
 *
 * ORDRE IMPOSÉ PAR LA PÉDAGOGIE, et respecté par les briques :
 *
 *   M1  les propriétés décident du nom, pas l'allure
 *   M2  côté → sommet → angle, puis le polygone et son nom par le nombre de côtés
 *   M3  les quadrilatères : rectangle, losange, carré, et la famille
 *   M4  les triangles : isocèle (côtés), équilatéral (côtés), rectangle (angle)
 *   M5  la carte d'identité : décrire et comparer par listes de propriétés
 *   M6  identifier par élimination : un indice ne suffit pas toujours
 *   M7  construire, c'est satisfaire toutes les contraintes à la fois
 *
 * ⚠️ Le module 5 « La carte d'identité des figures » est une
 * INSTITUTIONNALISATION : les propriétés du carré, du rectangle, du losange et
 * des triangles y sont RELUES, pas rencontrées. C'est pourquoi elles sont
 * posées aux modules 3 et 4, à l'instant où la manipulation les fait
 * apparaître ou disparaître.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => <p className="text-xs text-rose-600">⚠️ {children}</p>;

/* Coordonnées en % de la boîte, y vers le bas — cf. MiniFigure. */
const CARRE_PTS = [{ x: 14, y: 12 }, { x: 86, y: 12 }, { x: 86, y: 84 }, { x: 14, y: 84 }];
const RECT_PTS = [{ x: 4, y: 22 }, { x: 96, y: 22 }, { x: 96, y: 74 }, { x: 4, y: 74 }];
const LOSANGE_PTS = [{ x: 50, y: 6 }, { x: 94, y: 48 }, { x: 50, y: 90 }, { x: 6, y: 48 }];
const TRI_PTS = [{ x: 8, y: 88 }, { x: 92, y: 88 }, { x: 50, y: 8 }];

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Le conflit fondateur : l'œil ne décide pas. ── */
    1: [
      {
        id: 'propriete-decide',
        type: 'concepts',
        title: 'Ce sont les propriétés qui décident du nom',
        summary: 'Une figure porte un nom parce qu’elle vérifie des mesures exactes, jamais parce qu’elle « fait penser à ».',
        visual: <MiniFigure points={CARRE_PTS} ticks={[{ edge: 0 }, { edge: 1 }, { edge: 2 }, { edge: 3 }]} fill="#eef2ff" stroke="#4f46e5" />,
        body: (
          <div className="space-y-2">
            <p>
              Deux figures peuvent paraître identiques sur un dessin et ne pas porter le même nom. Ce
              qui tranche, ce sont les <strong>mesures</strong> : les longueurs des traits du contour,
              et l’ouverture aux coins.
            </p>
            <Piege>
              Un écart de quelques millimètres est invisible à l’œil, et il suffit pourtant à changer
              le nom de la figure. « Ça ressemble à » n’est jamais une preuve.
            </Piege>
            <Souvenir>la figure B, qui avait l’air d’un carré et qui n’en était pas un.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Le vocabulaire de base, dans l'ordre côté → sommet → angle. ── */
    2: [
      {
        id: 'cote',
        type: 'vocabulaire',
        title: 'Un côté',
        summary: 'Un segment du contour de la figure.',
        visual: <MiniFigure points={TRI_PTS} labels={[{ x: 0, y: 98, text: 'A' }, { x: 100, y: 98, text: 'B' }, { x: 50, y: 0, text: 'C' }]} fill="#e0f2fe" stroke="#0284c7" />,
        body: (
          <div className="space-y-2">
            <p>
              Le contour d’une figure est fait de segments mis bout à bout. Chacun de ces segments est
              un côté.
            </p>
            <p className="text-xs text-slate-500">
              Le nombre de côtés est la toute première chose qu’on compte sur une figure : c’est lui
              qui donne sa grande famille.
            </p>
            <Souvenir>les trois figures dont tu as compté les côtés une à une.</Souvenir>
          </div>
        ),
      },
      {
        id: 'sommet',
        type: 'vocabulaire',
        title: 'Un sommet',
        summary: 'Un point où deux côtés se rejoignent — un coin de la figure.',
        visual: <MiniFigure points={TRI_PTS} labels={[{ x: 0, y: 98, text: 'A' }, { x: 100, y: 98, text: 'B' }, { x: 50, y: 0, text: 'C' }]} fill="#e0f2fe" stroke="#0284c7" />,
        body: (
          <div className="space-y-2">
            <p>
              Un sommet n’est pas le point le plus haut : c’est un point de <strong>rencontre</strong>{' '}
              entre deux côtés. On le désigne par une lettre majuscule.
            </p>
            <Piege>
              Il y a autant de sommets que de côtés. Le dernier côté revient au point de départ : il
              ne crée pas de sommet supplémentaire.
            </Piege>
            <Souvenir>les coins que tu as comptés sur le quadrilatère.</Souvenir>
          </div>
        ),
      },
      {
        id: 'angle',
        type: 'vocabulaire',
        title: 'Un angle',
        summary: 'L’ouverture entre les deux côtés qui se rejoignent en un sommet. Elle se mesure en degrés.',
        visual: <MiniFigure points={CARRE_PTS} rightAngles={[0, 1, 2, 3]} fill="#e0f2fe" stroke="#0284c7" />,
        body: (
          <div className="space-y-2">
            <p>
              À chaque sommet, les deux côtés forment une ouverture : c’est l’angle. Plus le nombre de
              degrés est grand, plus l’angle est <strong>ouvert</strong>.
            </p>
            <Piege>
              Un angle ne dépend <strong>pas</strong> de la longueur des côtés qui le dessinent. Deux
              traits très longs peuvent former un angle tout petit.
            </Piege>
            <Souvenir>les degrés affichés à chaque coin du quadrilatère.</Souvenir>
          </div>
        ),
      },
      {
        id: 'polygone',
        type: 'vocabulaire',
        title: 'Un polygone, et son nom',
        summary: 'Une figure fermée faite de côtés : 3 → triangle, 4 → quadrilatère, 5 → pentagone.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1 text-center">
              <div>3 côtés → un <strong>triangle</strong></div>
              <div>4 côtés → un <strong>quadrilatère</strong></div>
              <div>5 côtés → un <strong>pentagone</strong></div>
            </div>
            <p className="text-xs text-slate-500">
              Ce premier nom ne dit rien de plus que le nombre de côtés. Un quadrilatère qui n’a
              aucune autre propriété remarquable est dit <strong>quelconque</strong>.
            </p>
            <Souvenir>le tri que tu as fait entre les figures à 3, 4 et 5 côtés.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Les quadrilatères, découverts en cassant des propriétés. ── */
    3: [
      {
        id: 'rectangle',
        type: 'concepts',
        title: 'Le rectangle',
        summary: 'Un quadrilatère dont les 4 angles sont droits — c’est-à-dire de 90°.',
        visual: <MiniFigure points={RECT_PTS} rightAngles={[0, 1, 2, 3]} fill="#f5f3ff" stroke="#7c3aed" />,
        body: (
          <div className="space-y-2">
            <p>
              Un <strong>angle droit</strong> est un angle de 90° exactement — le coin d’une feuille.
              Un quadrilatère qui en a quatre est un rectangle.
            </p>
            <Piege>
              Il n’y a pas d’angle « presque droit » : dès qu’on s’écarte de 90°, la propriété est
              perdue et la figure n’est plus un rectangle.
            </Piege>
            <Souvenir>les quatre voyants d’angle droit que tu as vus s’éteindre un à un.</Souvenir>
          </div>
        ),
      },
      {
        id: 'losange',
        type: 'concepts',
        title: 'Le losange',
        summary: 'Un quadrilatère dont les 4 côtés sont de la même longueur.',
        visual: <MiniFigure points={LOSANGE_PTS} ticks={[{ edge: 0 }, { edge: 1 }, { edge: 2 }, { edge: 3 }]} fill="#f5f3ff" stroke="#7c3aed" />,
        body: (
          <div className="space-y-2">
            <p>
              Le losange se reconnaît à ses <strong>longueurs</strong> : les quatre côtés sont égaux.
              Ses angles, eux, peuvent être quelconques.
            </p>
            <p className="text-xs text-slate-500">
              Sur une figure, on code des côtés de même longueur par de petits traits identiques.
            </p>
          </div>
        ),
      },
      {
        id: 'carre',
        type: 'concepts',
        title: 'Le carré',
        summary: '4 angles droits ET 4 côtés égaux — les deux propriétés à la fois.',
        visual: (
          <MiniFigure
            points={CARRE_PTS}
            rightAngles={[0, 1, 2, 3]}
            ticks={[{ edge: 0 }, { edge: 1 }, { edge: 2 }, { edge: 3 }]}
            fill="#f5f3ff"
            stroke="#7c3aed"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Le carré cumule la propriété du rectangle (les 4 angles droits) et celle du losange (les
              4 côtés égaux). Aucune des deux ne suffit toute seule.
            </p>
            <Piege>
              4 côtés égaux ne font pas un carré : le losange les a aussi. 4 angles droits non plus :
              le rectangle les a aussi.
            </Piege>
            <Souvenir>la figure qui s’est renommée toute seule quand tu as tiré un sommet.</Souvenir>
          </div>
        ),
      },
      {
        id: 'famille-quadrilateres',
        type: 'regles',
        title: 'Un carré est un rectangle',
        summary: 'Vérifier les propriétés d’une figure suffit à en porter le nom, même si on en a plus.',
        body: (
          <div className="space-y-2">
            <p>
              Le carré vérifie « 4 angles droits », qui est la propriété du rectangle : c’est donc un
              rectangle — un rectangle particulier. Pour la même raison, c’est aussi un losange.
            </p>
            <Piege>
              « Carré » et « rectangle » ne s’excluent pas. Retirer une propriété à un carré fait
              simplement remonter d’un cran dans la famille.
            </Piege>
            <Souvenir>les voyants qui s’éteignaient un à un : carré → rectangle → quadrilatère.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — Les triangles : côtés d'un côté, angles de l'autre. ── */
    4: [
      {
        id: 'triangle-isocele',
        type: 'concepts',
        title: 'Le triangle isocèle',
        summary: 'Un triangle dont DEUX côtés ont la même longueur.',
        visual: <MiniFigure points={TRI_PTS} ticks={[{ edge: 1 }, { edge: 2 }]} fill="#faf5ff" stroke="#9333ea" />,
        body: (
          <div className="space-y-2">
            <p>
              « Isocèle » parle uniquement des <strong>côtés</strong>. Le sommet où se rejoignent les
              deux côtés égaux est le sommet principal : on dit « isocèle en C ».
            </p>
            <Souvenir>le sommet mobile que tu as déplacé jusqu’à égaliser les deux longueurs.</Souvenir>
          </div>
        ),
      },
      {
        id: 'triangle-equilateral',
        type: 'concepts',
        title: 'Le triangle équilatéral',
        summary: 'Un triangle dont les TROIS côtés ont la même longueur.',
        visual: <MiniFigure points={TRI_PTS} ticks={[{ edge: 0 }, { edge: 1 }, { edge: 2 }]} fill="#faf5ff" stroke="#9333ea" />,
        body: (
          <div className="space-y-2">
            <p>
              C’est le cas le plus régulier : les trois côtés sont égaux, et ses trois angles valent
              tous 60°.
            </p>
            <Piege>
              60° n’est pas 90° : un triangle équilatéral n’a donc jamais d’angle droit.
            </Piege>
          </div>
        ),
      },
      {
        id: 'triangle-rectangle',
        type: 'concepts',
        title: 'Le triangle rectangle',
        summary: 'Un triangle dont l’un des angles est droit (90°).',
        visual: (
          <MiniFigure
            points={[{ x: 10, y: 88 }, { x: 92, y: 88 }, { x: 10, y: 10 }]}
            rightAngles={[0]}
            fill="#faf5ff"
            stroke="#9333ea"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Ici, ce n’est plus une longueur qui décide, c’est un <strong>angle</strong> : un seul
              angle droit suffit, et il ne peut pas y en avoir deux.
            </p>
            <p className="text-xs text-slate-500">
              Sur une figure, l’angle droit se code par un petit carré placé dans le coin.
            </p>
            <Souvenir>la marque d’angle droit qui est apparue toute seule quand tu as atteint 90°.</Souvenir>
          </div>
        ),
      },
      {
        id: 'caracteres-cumulables',
        type: 'regles',
        title: 'Un triangle peut cumuler deux caractères',
        summary: 'Isocèle parle des côtés, rectangle parle d’un angle : rien n’empêche les deux ensemble.',
        visual: (
          <MiniFigure
            points={[{ x: 10, y: 88 }, { x: 88, y: 88 }, { x: 10, y: 10 }]}
            rightAngles={[0]}
            ticks={[{ edge: 0 }, { edge: 2 }]}
            fill="#faf5ff"
            stroke="#9333ea"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Deux critères indépendants — l’un sur les longueurs, l’autre sur un angle — peuvent être
              vrais en même temps. On dit alors « triangle isocèle rectangle ».
            </p>
            <Piege>
              Aucun des deux ne « l’emporte » sur l’autre : ce ne sont pas des cases où l’on rangerait
              chaque triangle une fois pour toutes.
            </Piege>
          </div>
        ),
      },
    ],

    /* ── M5 — Institutionnalisation : décrire et comparer par listes. ── */
    5: [
      {
        id: 'carte-identite',
        type: 'methodes',
        title: 'La carte d’identité d’une figure',
        summary: 'Décrire une figure = donner la liste des propriétés qu’elle vérifie. Comparer = comparer deux listes.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
              <div><strong>Carré</strong> : 4 côtés · 4 angles droits · 4 côtés égaux</div>
              <div><strong>Rectangle</strong> : 4 côtés · 4 angles droits</div>
              <div><strong>Losange</strong> : 4 côtés · 4 côtés égaux</div>
            </div>
            <p>
              Comparer deux figures ne se fait pas à l’œil : on lit les deux listes{' '}
              <strong>ligne à ligne</strong>, et on repère ce qui change.
            </p>
            <Piege>
              L’orientation sur la feuille n’est pas une propriété. Tourner un carré ne le transforme
              pas en autre chose.
            </Piege>
            <Souvenir>les trois fiches lues côte à côte, ligne par ligne.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Identifier par élimination. ── */
    6: [
      {
        id: 'mem-eliminer',
        type: 'memoriser',
        title: '⭐ Un indice élimine, il ne conclut pas',
        summary: 'Tant qu’il reste plusieurs figures possibles, on ne conclut pas.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">4 côtés égaux → carré OU losange</div>
              <div className="text-sm font-black text-rose-700">4 angles droits → carré OU rectangle</div>
            </div>
            <p className="text-xs text-slate-500">
              Pour trancher, il faut un second indice — un sur les longueurs quand le premier portait
              sur les angles, et réciproquement.
            </p>
            <Souvenir>les enquêtes où le dernier indice, seul, permettait de conclure.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M7 — Construire : toutes les contraintes en même temps. ── */
    7: [
      {
        id: 'construire-contraintes',
        type: 'methodes',
        title: 'Construire, c’est satisfaire toutes les contraintes',
        summary: 'Une seule contrainte oubliée, et la figure obtenue n’est pas celle qu’on demandait.',
        body: (
          <div className="space-y-2">
            <p>
              Quand on te donne une liste de propriétés, il faut les vérifier{' '}
              <strong>toutes ensemble</strong>. Certaines sont interdites plutôt qu’exigées :
              « pas 4 côtés égaux » est une contrainte comme une autre.
            </p>
            <Souvenir>les contraintes qui devaient toutes s’allumer en même temps.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
