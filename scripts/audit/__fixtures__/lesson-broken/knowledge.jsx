import React from 'react';

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'image',
        type: 'vocabulaire',
        title: 'Image',
        summary: 'Le nombre qui sort de la machine est l’image de celui qui entre.',
        body: (<p>On entre 4, il sort 9 : 9 est l’image de 4.</p>),
      },
      {
        id: 'notation-fx',
        type: 'concepts',
        title: 'La notation f(x)',
        summary: 'On note f la machine, et f(4) le nombre qu’elle renvoie pour 4.',
        body: (<p>f(4) = 9 se lit « l’image de 4 par f est 9 ».</p>),
      },
      {
        id: 'bonus-parabole',
        type: 'concepts',
        title: 'Paraboles',
        summary: 'La courbe du carré porte un nom : la parabole.',
        body: (<p>Hors programme ici.</p>),
      },
    ],
  },
};
