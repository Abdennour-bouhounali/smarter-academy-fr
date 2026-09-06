import React from 'react';
import MathText from '../../../../common/components/MathText';
import { RightTriangle } from '../../../../common/knowledge';

/**
 * Connaissances de la leçon « Trigonométrie dans le triangle rectangle » (3e)
 * — SOURCE UNIQUE de vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> au moment
 * où l'élève vient de le rencontrer par le geste, puis il reste sur sa carte.
 *
 * ORDRE. Un item n'utilise que ce qui est déjà établi au module qui le
 * déclare : les rôles des côtés (M2) avant l'invariance du rapport (M3), et
 * l'invariance avant les trois noms (M4) — c'est elle qui les justifie. Les
 * mots « sinus », « cosinus », « tangente » n'apparaissent nulle part avant M4.
 */

const triangle = (props = {}) => (
  <RightTriangle a={4} b={3} hyp={5} width={190} height={140} {...props} />
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le déclencheur : un quotient mesure la raideur, pas la taille. */
    1: [
      {
        id: 'pente-quotient',
        type: 'concepts',
        title: 'La pente est un quotient',
        summary: 'La raideur d’une rampe se mesure par hauteur ÷ base — un quotient, pas une longueur.',
        body: (
          <div className="space-y-3">
            <p>Deux rampes peuvent avoir des tailles très différentes et la <strong>même
            raideur</strong>. Ce qui les distingue n’est pas une longueur, c’est le
            <strong> quotient</strong> de deux longueurs.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              pente = hauteur ÷ base
            </div>
            <p className="text-xs text-slate-500">Agrandir la rampe multiplie la hauteur ET la base
            par le même nombre : le quotient, lui, ne bouge pas.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux rampes d’accès —
            la petite et la grande donnaient le même nombre.</div>
          </div>
        ),
      },
    ],

    /* M2 — Les rôles des côtés, relatifs à l'angle étudié. */
    2: [
      {
        id: 'hypotenuse',
        type: 'vocabulaire',
        title: 'Hypoténuse',
        summary: 'L’hypoténuse est le côté face à l’angle droit. Elle ne change jamais de rôle.',
        visual: triangle({ color: '#7c3aed' }),
        body: (
          <div className="space-y-2">
            <p>Dans un triangle rectangle, l’<strong>hypoténuse</strong> est le côté situé
            <strong> face à l’angle droit</strong>. C’est aussi le plus long des trois.</p>
            <p className="text-xs text-slate-500">Quel que soit l’angle aigu qu’on décide
            d’étudier, l’hypoténuse reste la même : elle ne dépend pas de ce choix.</p>
          </div>
        ),
      },
      {
        id: 'cote-oppose',
        type: 'vocabulaire',
        title: 'Côté opposé',
        summary: 'Le côté opposé à l’angle étudié est celui qui ne le touche pas.',
        body: (
          <div className="space-y-2">
            <p>On choisit un angle aigu à étudier. Le <strong>côté opposé</strong> à cet angle est
            celui qui <strong>ne le touche pas</strong> — il lui fait face.</p>
            <p className="text-xs text-slate-500">« Opposé » n’est pas le nom d’un côté : c’est un
            <strong> rôle</strong>. Change l’angle étudié, et ce n’est plus le même côté.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu es passé de l’angle A à
            l’angle C, et les couleurs se sont échangées.</div>
          </div>
        ),
      },
      {
        id: 'cote-adjacent',
        type: 'vocabulaire',
        title: 'Côté adjacent',
        summary: 'Le côté adjacent touche l’angle étudié sans être l’hypoténuse.',
        body: (
          <div className="space-y-2">
            <p>Le <strong>côté adjacent</strong> à l’angle étudié est celui qui
            <strong> le touche</strong> — sans être l’hypoténuse.</p>
            <p className="text-xs text-slate-500">Deux côtés touchent l’angle : l’hypoténuse et
            l’adjacent. C’est ce qui rend le piège fréquent.</p>
          </div>
        ),
      },
      {
        id: 'mem-roles-relatifs',
        type: 'memoriser',
        title: '⭐ Opposé et adjacent sont des rôles, pas des noms',
        summary: 'Change l’angle étudié et les deux s’échangent ; seule l’hypoténuse ne bouge pas.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
            <div className="text-base font-black text-rose-700">
              opposé ⇄ adjacent quand on change d’angle
            </div>
            <p className="text-xs text-rose-700">Retenir « [BC] est l’opposé » est l’erreur qui
            fait rater un exercice sur deux. Toujours demander : opposé <em>à quel angle</em> ?</p>
          </div>
        ),
      },
    ],

    /* M3 — L'invariance : le rapport ne dépend que de l'angle. */
    3: [
      {
        id: 'rapport-depend-angle',
        type: 'regles',
        title: 'Le rapport ne dépend que de l’angle',
        summary: 'Dans deux triangles rectangles de même angle, le rapport de deux côtés est le même, quelle que soit leur taille.',
        visual: triangle({ color: '#059669' }),
        body: (
          <div className="space-y-3">
            <p>Agrandir un triangle rectangle multiplie <strong>tous</strong> ses côtés par le même
            nombre. Un quotient de deux côtés reste donc <strong>inchangé</strong>.</p>
            <p>En revanche, <strong>changer l’angle change le rapport</strong>. Chaque rapport est
            donc entièrement déterminé par l’angle : il le caractérise.</p>
            <p className="text-xs text-slate-500">C’est ce qui rend la trigonométrie possible : on
            peut tabuler ces rapports une fois pour toutes, angle par angle.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as agrandi le triangle
            sans que le quotient bouge, puis incliné l’angle et tout a changé.</div>
          </div>
        ),
      },
    ],

    /* M4 — Les trois noms, enfin, sur des rapports déjà rencontrés. */
    4: [
      {
        id: 'sinus-cosinus-tangente',
        type: 'formules',
        title: 'Sinus, cosinus, tangente',
        summary: 'Les trois rapports de côtés portent un nom : sin = opposé ÷ hypoténuse, cos = adjacent ÷ hypoténuse, tan = opposé ÷ adjacent.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                <MathText>{'$\\sin$'}</MathText> = <strong>opposé ÷ hypoténuse</strong>
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <MathText>{'$\\cos$'}</MathText> = <strong>adjacent ÷ hypoténuse</strong>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <MathText>{'$\\tan$'}</MathText> = <strong>opposé ÷ adjacent</strong>
              </div>
            </div>
            <p className="text-xs text-slate-500">Ce ne sont pas des touches magiques : ce sont les
            trois quotients que tu viens de manipuler, avec leur nom.</p>
          </div>
        ),
      },
      {
        id: 'mem-sinus-inferieur-1',
        type: 'memoriser',
        title: '⭐ Un sinus ou un cosinus ne dépasse jamais 1',
        summary: 'L’hypoténuse étant le plus grand côté, elle est au dénominateur : le quotient est inférieur à 1.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
            <div className="text-base font-black text-rose-700">sin ≤ 1 et cos ≤ 1, toujours</div>
            <p className="text-xs text-rose-700">Un résultat supérieur à 1 signale une erreur de
            rapport — l’hypoténuse n’était pas au dénominateur. La tangente, elle, n’a pas cette
            limite.</p>
          </div>
        ),
      },
      {
        id: 'calculatrice-degres',
        type: 'methodes',
        title: 'La calculatrice, en degrés',
        summary: 'Les touches sin, cos et tan donnent ces quotients pour un angle donné — à condition d’être en mode degrés (DEG).',
        body: (
          <div className="space-y-2">
            <p>La calculatrice connaît ces rapports pour tous les angles. Il suffit de les lui
            demander.</p>
            <p className="text-xs text-slate-500">Vérifie le mode : en <strong>radians</strong>,
            tous les résultats seraient faux sans que rien ne le signale.</p>
          </div>
        ),
      },
    ],

    /* M5 — Choisir le bon rapport et calculer une longueur. */
    5: [
      {
        id: 'methode-choisir-rapport',
        type: 'methodes',
        title: 'Choisir le bon rapport',
        summary: 'On regarde quels deux côtés sont en jeu — celui qu’on connaît et celui qu’on cherche — et le rapport qui les relie s’impose.',
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1">
              <li>Repérer l’angle étudié, puis nommer les côtés (opposé, adjacent, hypoténuse).</li>
              <li>Repérer les <strong>deux</strong> côtés concernés : le connu et le cherché.</li>
              <li>Le rapport qui relie exactement ces deux-là est celui qu’on utilise.</li>
            </ol>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
              opposé et hypoténuse ⇒ sinus · adjacent et hypoténuse ⇒ cosinus ·
              opposé et adjacent ⇒ tangente
            </div>
            <p className="text-xs text-slate-500">Le rapport ne se devine pas : il se déduit des
            deux côtés en jeu.</p>
          </div>
        ),
      },
    ],

    /* M6 — Le chemin inverse : du rapport à l'angle. */
    6: [
      {
        id: 'retrouver-angle',
        type: 'methodes',
        title: 'Retrouver un angle',
        summary: 'Connaissant un rapport, les touches arcsin, arccos et arctan redonnent l’angle.',
        body: (
          <div className="space-y-2">
            <p>Les deux sens existent :</p>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                Angle connu → <strong>sin, cos, tan</strong> → un rapport
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                Rapport connu → <strong>arcsin, arccos, arctan</strong> → un angle
              </div>
            </div>
            <p className="text-xs text-slate-500">Sur la calculatrice, ces touches s’obtiennent
            souvent avec la seconde fonction (SHIFT ou 2nde).</p>
          </div>
        ),
      },
    ],

    /* M7 — La pente en pourcentage : le piège du réel. */
    7: [
      {
        id: 'pente-pourcentage',
        type: 'concepts',
        title: 'La pente en pourcentage',
        summary: 'Une pente de 12 % signifie 12 m de dénivelé pour 100 m à l’horizontale : c’est une tangente, pas un angle.',
        body: (
          <div className="space-y-2">
            <p>Un panneau routier « 12 % » annonce un <strong>rapport</strong> : 12 mètres de
            montée pour 100 mètres parcourus <strong>à l’horizontale</strong>.</p>
            <p>C’est donc <MathText>{'$\\tan$'}</MathText> de l’angle, exprimé en pourcentage —
            et non l’angle lui-même. 100 % n’est pas la verticale, mais 45°.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la rampe, l’échelle et
            l’arbre — et le piège du panneau.</div>
          </div>
        ),
      },
    ],
  },
};
