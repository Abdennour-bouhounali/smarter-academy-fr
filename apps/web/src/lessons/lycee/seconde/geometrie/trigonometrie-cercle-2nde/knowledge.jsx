import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Le cercle trigonométrique » — SOURCE UNIQUE.
 * Aucun module n'écrit son propre résumé : la carte cumulative est la seule
 * présentation, rendue par <KnowledgeSnapshot> en pied de module.
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'cercle-trigonometrique', type: 'concepts', title: 'Le cercle trigonométrique',
        summary: 'Le cercle de rayon 1 centré à l’origine, parcouru dans le sens direct (inverse des aiguilles) depuis le point (1 ; 0).',
        body: (
          <div className="space-y-2 text-sm">
            <p>Rayon <strong>1</strong> : c’est ce choix qui rend tout le reste simple.</p>
            <p>On part toujours de (1 ; 0), et on tourne dans le <strong>sens direct</strong>.</p>
          </div>
        ),
      },
      {
        id: 'enroulement', type: 'concepts', title: 'Enrouler la droite des réels',
        summary: 'À chaque réel t correspond UN point du cercle : celui qu’on atteint en parcourant une longueur t sur le cercle depuis (1 ; 0).',
        body: (
          <div className="space-y-2 text-sm">
            <p>t &gt; 0 : on enroule dans le sens direct. t &lt; 0 : dans l’autre sens.</p>
            <p>Un tour complet mesure <MathText>{'$2\\pi$'}</MathText> : au-delà, on repasse sur les mêmes points.</p>
          </div>
        ),
      },
      {
        id: 'mem-rayon-un', type: 'memoriser', title: '⭐ Rayon 1, départ (1 ; 0)',
        summary: 'Tout part de là : un cercle de rayon 1, un départ en (1 ; 0), un sens direct.',
      },
    ],
    2: [
      {
        id: 'radian', type: 'vocabulaire', title: 'Le radian',
        summary: 'Un angle vaut t radians quand l’arc qu’il découpe sur le cercle de rayon 1 a pour longueur t. L’angle se mesure donc par une LONGUEUR.',
        body: (
          <div className="space-y-2 text-sm">
            <p>Un demi-tour parcourt une longueur <MathText>{'$\\pi$'}</MathText> : c’est 180°.</p>
            <p>Le radian n’a rien d’arbitraire, contrairement au degré : il vient du cercle lui-même.</p>
          </div>
        ),
      },
      {
        id: 'formule-conversion', type: 'formules', title: 'Degrés ↔ radians',
        summary: 'π radians = 180 degrés. On passe de l’un à l’autre par proportionnalité.',
        body: <MathText>{'$$\\text{rad} = \\text{deg} \\times \\dfrac{\\pi}{180} \\qquad \\text{deg} = \\text{rad} \\times \\dfrac{180}{\\pi}$$'}</MathText>,
      },
      {
        id: 'mem-pi-180', type: 'memoriser', title: '⭐ π rad = 180°',
        summary: 'Un demi-tour. Toutes les conversions en découlent par proportionnalité.',
      },
    ],
    3: [
      {
        id: 'cos-sin-coordonnees', type: 'concepts', title: 'cos t et sin t sont des coordonnées',
        summary: 'Le point associé au réel t a pour abscisse cos t et pour ordonnée sin t. Ce ne sont plus des rapports de longueurs : ce sont deux nombres lus sur les axes.',
        body: (
          <div className="space-y-2 text-sm">
            <p><span className="text-indigo-700 font-bold">cos t</span> : l’abscisse, projetée sur l’axe horizontal.</p>
            <p><span className="text-emerald-700 font-bold">sin t</span> : l’ordonnée, projetée sur l’axe vertical.</p>
          </div>
        ),
      },
      {
        id: 'regle-signes-quadrants', type: 'regles', title: 'Le signe dépend du quart de tour',
        summary: 'cos t est positif à droite de l’axe vertical, négatif à gauche ; sin t est positif au-dessus de l’axe horizontal, négatif en dessous.',
      },
      {
        id: 'regle-borne-un', type: 'regles', title: 'Toujours entre −1 et 1',
        summary: 'Le point ne quitte jamais le cercle : cos t et sin t sont donc compris entre −1 et 1, bornes atteintes.',
      },
      {
        id: 'mem-cos-abscisse', type: 'memoriser', title: '⭐ cos = abscisse, sin = ordonnée',
        summary: 'Le cosinus se lit à l’horizontale, le sinus à la verticale. Jamais l’inverse.',
      },
    ],
    4: [
      {
        id: 'valeurs-remarquables', type: 'memoriser', title: '⭐ Les valeurs remarquables',
        summary: 'π/6, π/4 et π/3 : trois angles dont on connaît les coordonnées exactes, sans calculatrice.',
        body: (
          <div className="text-sm">
            <MathText>{'$$\\cos\\dfrac{\\pi}{6} = \\dfrac{\\sqrt{3}}{2} \\quad \\cos\\dfrac{\\pi}{4} = \\dfrac{\\sqrt{2}}{2} \\quad \\cos\\dfrac{\\pi}{3} = \\dfrac{1}{2}$$'}</MathText>
            <MathText>{'$$\\sin\\dfrac{\\pi}{6} = \\dfrac{1}{2} \\quad \\sin\\dfrac{\\pi}{4} = \\dfrac{\\sqrt{2}}{2} \\quad \\sin\\dfrac{\\pi}{3} = \\dfrac{\\sqrt{3}}{2}$$'}</MathText>
          </div>
        ),
      },
      {
        id: 'regle-pi-quatre-egalite', type: 'regles', title: 'π/4, le seul où les deux sont égaux',
        summary: 'En π/4 le point est sur la bissectrice : cos = sin = √2/2. C’est ce qui permet de ne pas confondre π/6 et π/3.',
      },
      {
        id: 'methode-placer-remarquable', type: 'methodes', title: 'Placer un angle remarquable',
        summary: 'Repérer le quart de tour, y placer l’angle, puis lire les deux coordonnées avec leur signe.',
      },
    ],
  },
};

export default LESSON_KNOWLEDGE;
