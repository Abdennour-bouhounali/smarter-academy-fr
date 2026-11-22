import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ChoiceInput from './ChoiceInput';

// Un QCM français étiquette ses choix A, B, C, D, comme le sujet du brevet. La lettre vient de la PLACE du
// choix (pas de son identifiant) et vit dans sa propre case : elle ne se colle pas au premier chiffre (« A6 »).
describe('ChoiceInput — les choix sont étiquetés A, B, C, D', () => {
  const question = {
    answerType: 'choice',
    choices: [
      { id: 'c1', content: '6 est un multiple de 120' },
      { id: 'c2', content: '6 divise 120' },
      { id: 'c3', content: '120 divise 6' },
      { id: 'c4', content: 'Aucune de ces réponses' },
    ],
  };
  const html = renderToStaticMarkup(<ChoiceInput question={question} value={null} onChange={() => {}} />);
  const buttons = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((m) => m[1]);
  const letters = buttons.map((b) => /data-choice-letter="[^"]*">([^<]*)</.exec(b)?.[1]);
  const contents = buttons.map((b) => b.replace(/<span[^>]*data-choice-letter[^>]*>[^<]*<\/span>/, '').replace(/<[^>]+>/g, '').replace(/[\u2066-\u2069]/g, '').trim());

  it('chaque bouton porte sa lettre latine, dans l’ordre, dans sa propre case', () => {
    expect(letters).toEqual(['A', 'B', 'C', 'D']);
  });
  // RichText pose des marques d'isolement invisibles (U+2066–U+2069) autour des suites « nombre + mot » : ignorées ici.
  it('puis le contenu du choix, intact', () => {
    expect(contents).toEqual(['6 est un multiple de 120', '6 divise 120', '120 divise 6', 'Aucune de ces réponses']);
  });
  it('aucune lettre arabe n’étiquette un choix', () => {
    expect(html).not.toMatch(/[\u0600-\u06FF]/);
  });
});
