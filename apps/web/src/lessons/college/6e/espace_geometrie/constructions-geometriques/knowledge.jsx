import React from 'react';
import { MiniFigure } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Constructions géométriques » (6e) — SOURCE
 * UNIQUE de vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * C'est une leçon de MÉTHODES : la plupart des items décrivent un geste
 * (« comment je fais »), pas une définition. Chacun est posé dans la page par
 * un <KnowledgeBrick id="…"> à l'instant où la manipulation vient de lui
 * donner un sens, puis reste sur la carte.
 *
 * ORDRE — un item n'emploie QUE ce qui est déjà établi à son module ou avant
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md) :
 *
 *   M1  l'idée fondatrice : un instrument GARANTIT une propriété
 *   M2  la règle graduée — mesurer, c'est soustraire ; puis tracer
 *   M3  le compas — reporter sans lire, et pourquoi il trace un cercle
 *   M4  l'équerre — le rituel, puis les DEUX constructions qu'il donne
 *   M5  institutionnalisation : suivre et écrire un programme de construction
 *   M6  vérifier une figure propriété par propriété ; « presque » n'existe pas
 *
 * Les gestes eux-mêmes se posent aux modules 2, 3 et 4 ; le module 5 ne fait
 * que les enchaîner. Ni « médiatrice » ni « bissectrice » n'apparaissent dans
 * cette leçon : elles ne sont donc posées par aucune brique.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

const Etapes = ({ children }) => (
  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-sm text-slate-600">
    {children}
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Le croquis raté : pourquoi des instruments, au juste ? ── */
    1: [
      {
        id: 'instrument-garantit',
        type: 'concepts',
        title: 'Un instrument garantit une propriété',
        summary:
          'On ne choisit pas un instrument par habitude, mais d’après ce qu’on veut assurer : une longueur, un angle droit, une égalité.',
        body: (
          <div className="space-y-2">
            <p>
              Un instrument n’embellit pas le dessin : il le rend <strong>exact</strong>. À main levée,
              aucune propriété n’est garantie — et une figure fausse ne prouve rien.
            </p>
            <Etapes>
              <div>📏 la <strong>règle graduée</strong> → des traits droits et des longueurs exactes ;</div>
              <div>📐 l’<strong>équerre</strong> → l’angle droit ;</div>
              <div>⭕ le <strong>compas</strong> → l’égalité de deux longueurs, et les cercles.</div>
            </Etapes>
            <Piege>
              La question à se poser n’est jamais « avec quoi ai-je l’habitude de tracer ? » mais
              « quelle propriété dois-je assurer ici ? ».
            </Piege>
            <Souvenir>les trois défauts du croquis à main levée, chacun réparable par un seul instrument.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-trois-garanties',
        type: 'memoriser',
        title: '⭐ Règle → longueur · Équerre → angle droit · Compas → report',
        summary: 'Trois instruments, trois garanties différentes. C’est la propriété qui décide.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">📏 une LONGUEUR exacte → la règle</div>
              <div className="text-sm font-black text-rose-700">📐 un ANGLE DROIT → l’équerre</div>
              <div className="text-sm font-black text-rose-700">⭕ REPORTER une longueur → le compas</div>
            </div>
            <p className="text-xs text-slate-500">
              Le compas ne sert donc pas qu’aux cercles : c’est aussi le seul instrument qui transporte
              une longueur qu’on n’a pas mesurée.
            </p>
          </div>
        ),
      },
    ],

    /* ── M2 — La règle graduée : le piège du zéro, puis le tracé. ── */
    2: [
      {
        id: 'mesurer-difference',
        type: 'regles',
        title: 'Une longueur est une différence de graduations',
        summary:
          'Le bord de la règle n’est pas le 0. Si le segment commence à 1 et finit à 8, il mesure 8 − 1 = 7.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
              de la graduation <strong>1</strong> à la graduation <strong>8</strong> :{' '}
              <strong className="font-mono">8 − 1 = 7</strong>
            </div>
            <p>
              Lire la graduation d’arrivée revient à croire que le segment part de 0. Ce n’est vrai
              que si on l’a effectivement aligné dessus.
            </p>
            <Piege>
              C’est LE piège de la règle graduée, et il ne vient pas d’un manque de soin : sur presque
              toutes les règles, la graduation 0 est en retrait du bord.
            </Piege>
            <Souvenir>le segment posé de 1 à 8, qui mesurait 7 et non 8.</Souvenir>
          </div>
        ),
      },
      {
        id: 'tracer-longueur',
        type: 'methodes',
        title: 'Tracer un segment d’une longueur donnée',
        summary: 'Je place les deux points aux bonnes graduations, PUIS je relie. Jamais l’inverse.',
        body: (
          <div className="space-y-2">
            <Etapes>
              <div>Tracer [AB] de 7 cm :</div>
              <div>① j’aligne la graduation <strong>0</strong> sur le point A ;</div>
              <div>② je marque un point au niveau de la graduation <strong>7</strong> : c’est B ;</div>
              <div>③ je relie A et B le long de la règle.</div>
            </Etapes>
            <Piege>
              Tracer « à peu près » puis retoucher fait perdre l’exactitude à chaque essai. On repère
              d’abord, on trace ensuite.
            </Piege>
            <Souvenir>l’alignement sur le 0, qui évitait d’avoir à soustraire.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Le compas : conserver, plutôt que mesurer. ── */
    3: [
      {
        id: 'reporter-au-compas',
        type: 'methodes',
        title: 'Reporter une longueur au compas',
        summary:
          'Je règle l’écartement sur le segment, puis je pointe ailleurs sans y toucher : la longueur est transportée, sans être lue.',
        body: (
          <div className="space-y-2">
            <Etapes>
              <div>① je pose la pointe sur une extrémité du segment ;</div>
              <div>② j’ouvre le compas jusqu’à l’autre extrémité ;</div>
              <div>③ sans rien changer, je pose la pointe où je veux reporter ;</div>
              <div>④ je trace l’arc : la longueur est exactement la même.</div>
            </Etapes>
            <p>
              Le compas ne mesure pas, il <strong>conserve</strong>. C’est pour cela qu’il permet de
              reporter une longueur qu’on ne connaît même pas.
            </p>
            <Piege>
              Mesurer d’abord à la règle oblige à lire un nombre, donc à arrondir. Le report, lui, est
              exact.
            </Piege>
            <Souvenir>l’écartement réglé sur le segment bleu, puis reporté plus loin sans changer.</Souvenir>
          </div>
        ),
      },
      {
        id: 'cercle-au-compas',
        type: 'concepts',
        title: 'Pourquoi le compas trace un cercle',
        summary:
          'Un cercle est l’ensemble des points situés à une même distance du centre : c’est exactement ce que dessine un écartement fixe.',
        visual: (
          <MiniFigure
            points={[{ x: 50, y: 20 }, { x: 85, y: 55 }, { x: 50, y: 90 }, { x: 15, y: 55 }]}
            labels={[{ x: 50, y: 58, text: '•' }]}
            fill="#ede9fe"
            stroke="#7c3aed"
            width={140}
            height={110}
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              Ce n’est pas la rotation qui fait le cercle, c’est le fait que la distance au centre ne
              change jamais. Tracer un cercle et reporter une longueur, c’est le même geste.
            </p>
            <Souvenir>le cercle apparu sous la mine, à écartement constant.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — L'équerre : un rituel, deux constructions. ── */
    4: [
      {
        id: 'construire-perpendiculaire',
        type: 'methodes',
        title: 'Construire la perpendiculaire à (d) passant par A',
        summary:
          'Un côté de l’angle droit le long de (d), le sommet exactement sur A, puis je trace le long de l’autre côté.',
        visual: (
          <MiniFigure
            points={[{ x: 10, y: 80 }, { x: 90, y: 80 }, { x: 90, y: 20 }]}
            rightAngles={[1]}
            labels={[{ x: 95, y: 88, text: 'd' }, { x: 96, y: 16, text: 'A' }]}
            fill="#f5f3ff"
            stroke="#7c3aed"
            width={140}
            height={110}
          />
        ),
        body: (
          <div className="space-y-2">
            <Etapes>
              <div>① je pose un côté de l’angle droit le long de (d) ;</div>
              <div>② je fais glisser l’équerre jusqu’à ce que son sommet soit sur A ;</div>
              <div>③ je trace le long de l’autre côté.</div>
            </Etapes>
            <Piege>
              Les deux conditions comptent. Si le sommet n’est pas exactement sur A, l’angle droit est
              bien tracé — mais ailleurs, et la droite ne passe pas par A.
            </Piege>
            <Souvenir>l’équerre glissée le long de (d) jusqu’à ce que son coin atteigne A.</Souvenir>
          </div>
        ),
      },
      {
        id: 'construire-parallele',
        type: 'methodes',
        title: 'Construire la parallèle à (d) passant par B',
        summary:
          'Le même rituel, mais on suit l’autre côté de l’équerre : deux perpendiculaires à une même droite sont parallèles entre elles.',
        body: (
          <div className="space-y-2">
            <p>
              L’angle droit de l’équerre porte les deux directions à la fois : suivre un côté donne la
              perpendiculaire, suivre l’autre donne la parallèle. Une seule équerre suffit.
            </p>
            <Piege>
              « Garder la même pente à l’œil » ne garantit rien. Le parallélisme se construit par
              l’angle droit, pas par l’allure.
            </Piege>
            <Souvenir>la même équerre, retournée d’un quart de tour, qui donnait cette fois la parallèle.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — Institutionnalisation : le programme de construction. ── */
    5: [
      {
        id: 'ordre-dependances',
        type: 'regles',
        title: 'L’ordre des étapes n’est pas un style',
        summary:
          'On ne peut pas tracer la perpendiculaire à une droite qui n’existe pas encore : chaque étape s’appuie sur les précédentes.',
        body: (
          <div className="space-y-2">
            <p>
              Une étape mal placée n’est pas « moins jolie » : elle est <strong>impossible</strong>.
              L’ordre traduit des dépendances réelles entre les objets tracés.
            </p>
            <p className="text-xs text-slate-500">
              Plusieurs ordres peuvent convenir, tant que chaque étape trouve ce dont elle a besoin
              déjà tracé.
            </p>
            <Souvenir>les étapes refusées parce qu’elles arrivaient trop tôt, en nommant ce qui manquait.</Souvenir>
          </div>
        ),
      },
      {
        id: 'programme-construction',
        type: 'methodes',
        title: 'Suivre et écrire un programme de construction',
        summary:
          'Des étapes ordonnées, avec les longueurs, les propriétés à respecter et l’instrument de chacune — de quoi refaire la figure sans la voir.',
        body: (
          <div className="space-y-2">
            <Etapes>
              <div>Un bon programme dit, pour chaque étape :</div>
              <div>① ce qu’on trace (un segment, une droite, un point) ;</div>
              <div>② avec quelle mesure ou quelle propriété (7 cm, perpendiculaire à…) ;</div>
              <div>③ avec quel instrument.</div>
            </Etapes>
            <Piege>
              Un dessin de la figure finie n’est pas un programme : il montre le résultat, pas la
              méthode. Une simple liste d’instruments non plus.
            </Piege>
            <Souvenir>le programme du rectangle, remis dans un ordre qui tenait debout.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Vérifier : reprendre chaque propriété. ── */
    6: [
      {
        id: 'verifier-figure',
        type: 'methodes',
        title: 'Vérifier une figure',
        summary:
          'Je reprends CHAQUE propriété de la définition, avec l’instrument qui la garantit — jamais un seul contrôle.',
        body: (
          <div className="space-y-2">
            <Etapes>
              <div>Vérifier un rectangle :</div>
              <div>① ses 4 angles droits, à l’équerre ;</div>
              <div>② l’égalité de ses côtés opposés, à la règle ou au compas.</div>
            </Etapes>
            <p>
              Et quand un défaut apparaît, on sait quoi dire : quelle propriété est fausse, et quel
              instrument l’aurait garantie.
            </p>
            <Piege>
              « Elle ressemble à un rectangle » ne prouve rien, et mesurer un seul côté laisse trois
              côtés et quatre angles non vérifiés.
            </Piege>
            <Souvenir>les trois figures ratées, chacune rattachée à l’instrument qui manquait.</Souvenir>
          </div>
        ),
      },
      {
        id: 'presque-nest-pas-juste',
        type: 'regles',
        title: 'En géométrie, « presque » n’existe pas',
        summary:
          'Une propriété est vérifiée, ou elle ne l’est pas. Des côtés de 5 ; 5 ; 5 et 5,3 cm ne font pas un carré.',
        body: (
          <div className="space-y-2">
            <p>
              Une figure aux 4 angles droits mais aux côtés inégaux est un rectangle — c’est un nom
              exact, pas un carré raté. Nommer juste vaut mieux qu’arrondir.
            </p>
            <p className="text-xs text-slate-500">
              C’est aussi pourquoi on ne retouche pas un tracé : on le reconstruit.
            </p>
            <Souvenir>le « carré » de 5,3 cm de côté, qui n’en était pas un.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
