import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis listés dans `priorKnowledge` — le programme de calcul
 * de 5e, la substitution, la distributivité simple, la factorisation, le test
 * d'une égalité, la modélisation par une équation et le contrôle du sens —
 * et RIEN de la matière de la leçon : ni conjecture, ni contre-exemple, ni
 * preuve littérale, ni tri des données.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  transformer: { label: 'Transformer une expression', emoji: '🔤' },
  tester: { label: 'Tester une valeur', emoji: '🧪' },
  modeliser: { label: 'Traduire un énoncé', emoji: '⚖️' },
};

const QUESTIONS = [
  {
    id: 'rp4-d1-programme',
    skill: 'tester',
    points: 2,
    requires: ['programme-de-calcul'],
    prompt: 'Programme : « choisis un nombre, ajoute 5, multiplie par 3 ». Que donne-t-il pour 4 ?',
    options: ['27', '17', '12'],
    cols: 3,
    correct: 0,
    explain: 'On suit les consignes dans l’ordre : 4 + 5 = 9, puis 9 × 3 = 27. (17 viendrait de 4 × 3 + 5.)',
  },
  {
    id: 'rp4-d2-substituer',
    skill: 'tester',
    points: 2,
    requires: ['substituer'],
    prompt: 'Combien vaut l’expression 3n + 4 lorsque n = 6 ?',
    options: ['22', '34', '13'],
    cols: 3,
    correct: 0,
    explain: 'On remplace n par 6 : 3 × 6 + 4 = 18 + 4 = 22. (34 viendrait d’un « 3 » collé au « 6 ».)',
  },
  {
    id: 'rp4-d3-distributivite',
    skill: 'transformer',
    points: 2,
    requires: ['distributivite-simple'],
    prompt: 'Que vaut 2 × (n + 3), écrit sans parenthèses ?',
    options: ['2n + 6', '2n + 3', 'n + 6'],
    cols: 3,
    correct: 0,
    explain: 'Le facteur 2 multiplie CHACUN des deux termes : 2 × n et 2 × 3, soit 2n + 6.',
  },
  {
    id: 'rp4-d4-factoriser',
    skill: 'transformer',
    points: 2,
    requires: ['factoriser'],
    prompt: 'Comment écrire 3n + 3 sous la forme d’un produit ?',
    options: ['3 × (n + 1)', '3 × n + 1', '6n'],
    cols: 3,
    correct: 0,
    explain: 'Les deux termes contiennent le facteur 3 : on le met devant, et il reste n + 1 dans la parenthèse.',
  },
  {
    id: 'rp4-d5-egalite',
    skill: 'tester',
    points: 2,
    requires: ['tester-une-egalite'],
    prompt: 'L’égalité 4n − 1 = 11 est-elle vraie pour n = 3 ?',
    options: ['Oui : 4 × 3 − 1 = 11', 'Non : 4 × 3 − 1 = 12', 'On ne peut pas le savoir'],
    cols: 1,
    correct: 0,
    explain: 'On calcule chaque membre séparément : 4 × 3 − 1 = 12 − 1 = 11, et l’autre membre vaut 11. Les deux sont égaux.',
  },
  {
    id: 'rp4-d6-modeliser',
    skill: 'modeliser',
    points: 2,
    requires: ['modeliser-par-une-equation'],
    prompt: 'Un stylo coûte 2 € de plus qu’un crayon. Si le crayon coûte c euros, combien coûte le stylo ?',
    options: ['c + 2', '2c', 'c − 2'],
    cols: 3,
    correct: 0,
    explain: '« 2 € de plus » s’écrit avec une addition : le stylo coûte c + 2 euros. (2c voudrait dire « le double ».)',
  },
  {
    id: 'rp4-d7-sens',
    skill: 'modeliser',
    points: 2,
    requires: ['controler-le-sens'],
    prompt: 'On cherche l’âge d’un enfant et on trouve −4 ans. Que faut-il en penser ?',
    options: [
      'C’est impossible : il y a une erreur quelque part',
      'C’est possible, il faut juste enlever le signe',
      'C’est possible si l’enfant n’est pas encore né',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un âge est forcément positif. Un résultat impossible signale une erreur, avant même de savoir laquelle.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleSubtitle="Programme de calcul, transformer une expression, traduire"
      brief={{
        tag: '🎯 Mission de départ',
        title: 'Ce que tu sais déjà',
        tone: 'slate',
        body: (
          <>
            Sept questions rapides. Rien n’est noté, rien ne bloque : elles servent à savoir
            par où commencer.
          </>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
