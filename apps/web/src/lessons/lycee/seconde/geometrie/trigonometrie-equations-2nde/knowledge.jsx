import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de « Trigonométrie : identités et équations » — SOURCE UNIQUE.
 * La partie 1 (cercle, radian, coordonnées) est un PRÉREQUIS : elle n'est pas
 * réenseignée ici, seulement réemployée.
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'identite-fondamentale', type: 'formules', title: 'cos²t + sin²t = 1',
        summary: 'Pour TOUT réel t. Ce n’est pas une formule à croire : c’est le théorème de Pythagore appliqué au triangle rectangle caché sous le point, dont l’hypoténuse est le rayon 1.',
        body: (
          <div className="space-y-2 text-sm">
            <MathText>{'$$\\cos^2 t + \\sin^2 t = 1$$'}</MathText>
            <p>Les deux côtés de l’angle droit mesurent |cos t| et |sin t| ; l’hypoténuse est le rayon, donc 1.</p>
          </div>
        ),
      },
      {
        id: 'methode-retrouver-coordonnee', type: 'methodes', title: 'Retrouver une coordonnée à partir de l’autre',
        summary: 'Connaissant cos t, on obtient sin t au signe près : sin²t = 1 − cos²t. C’est le quart de tour qui décide du signe.',
        body: (
          <div className="space-y-2 text-sm">
            <p>Exemple : si cos t = 0,6 alors sin²t = 1 − 0,36 = 0,64, donc sin t = 0,8 ou −0,8.</p>
            <p>Deux points du cercle ont la même abscisse : il FAUT une information de plus pour trancher.</p>
          </div>
        ),
      },
      {
        id: 'mem-pythagore-deguise', type: 'memoriser', title: '⭐ Une identité, pas une formule à croire',
        summary: 'cos²t + sin²t = 1 EST Pythagore, sur un triangle d’hypoténuse 1.',
      },
    ],
    2: [
      {
        id: 'formules-addition', type: 'formules', title: 'Les formules d’addition',
        summary: 'cos(a + b) = cos a cos b − sin a sin b, et sin(a + b) = sin a cos b + cos a sin b. Le signe MOINS du cosinus n’est pas une faute de frappe.',
        body: (
          <div className="space-y-2 text-sm">
            <MathText>{'$$\\cos(a+b) = \\cos a \\cos b - \\sin a \\sin b$$'}</MathText>
            <MathText>{'$$\\sin(a+b) = \\sin a \\cos b + \\cos a \\sin b$$'}</MathText>
          </div>
        ),
      },
      {
        id: 'regle-cos-non-lineaire', type: 'regles', title: 'cos(a + b) ≠ cos a + cos b',
        summary: 'Le cosinus n’est pas une fonction qui « se distribue » sur une somme. Un seul contre-exemple suffit à le prouver.',
      },
      {
        id: 'mem-signe-moins', type: 'memoriser', title: '⭐ Le cosinus change de signe, le sinus non',
        summary: 'cos(a+b) : produit des cos MOINS produit des sin. sin(a+b) : les deux produits croisés, PLUS.',
      },
    ],
    3: [
      {
        id: 'equation-deux-solutions', type: 'concepts', title: 'Une équation, deux solutions par tour',
        summary: 'cos t = a revient à couper le cercle par une droite VERTICALE d’abscisse a : elle rencontre le cercle en deux points, symétriques par rapport à l’axe horizontal.',
      },
      {
        id: 'methode-resoudre-cos', type: 'methodes', title: 'Résoudre cos t = a sur [0 ; 2π[',
        summary: 'Si a est hors de [−1 ; 1] : aucune solution. Sinon, une solution t₀ dans [0 ; π], et la seconde vaut 2π − t₀.',
        body: <MathText>{'$$\\cos t = a \\iff t = t_0 \\ \\text{ou} \\ t = 2\\pi - t_0$$'}</MathText>,
      },
      {
        id: 'regle-hors-bornes', type: 'regles', title: 'Hors de [−1 ; 1], aucune solution',
        summary: 'Le point ne quitte jamais le cercle : cos t = 1,5 n’a pas de solution, quel que soit l’intervalle.',
      },
    ],
    4: [
      {
        id: 'methode-resoudre-sin', type: 'methodes', title: 'Résoudre sin t = b sur [0 ; 2π[',
        summary: 'Droite HORIZONTALE d’ordonnée b : les deux solutions sont symétriques par rapport à l’axe VERTICAL. Si t₀ est l’une, l’autre vaut π − t₀.',
        body: <MathText>{'$$\\sin t = b \\iff t = t_0 \\ \\text{ou} \\ t = \\pi - t_0$$'}</MathText>,
      },
      {
        id: 'regle-deux-symetries', type: 'regles', title: 'Deux équations, deux symétries',
        summary: 'cos t = a : symétrie par rapport à l’axe horizontal (2π − t₀). sin t = b : symétrie par rapport à l’axe vertical (π − t₀). Les confondre est l’erreur type.',
      },
      {
        id: 'mem-lire-sur-le-cercle', type: 'memoriser', title: '⭐ Toujours dessiner le cercle',
        summary: 'Une équation trigonométrique se lit sur la figure : la droite, les deux points, puis l’intervalle demandé.',
      },
    ],
  },
};

export default LESSON_KNOWLEDGE;
