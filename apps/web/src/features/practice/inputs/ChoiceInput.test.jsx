import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ChoiceInput from './ChoiceInput';

// Le cas signalé : « 6 مضاعف للعدد 120 ». La lettre latine affichée devant un
// contenu qui commence par un chiffre se lisait « A6 » en RTL : on n'affiche
// plus de lettre, seulement le contenu du choix.
describe('ChoiceInput — aucune lettre latine devant les choix', () => {
  const question = {
    answerType: 'choice',
    choices: [
      { id: 'A', content: '6 مضاعف للعدد 120' },
      { id: 'B', content: '6 يقسم 120' },
    ],
  };
  const html = renderToStaticMarkup(<ChoiceInput question={question} value={null} onChange={() => {}} />);
  const buttonTexts = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());

  it('chaque bouton ne montre que le contenu du choix', () => {
    expect(buttonTexts).toEqual(['6 مضاعف للعدد 120', '6 يقسم 120']);
  });
});
