import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import QuestionRenderer from './QuestionRenderer';

// Le cas signalé (« مدار », محطة التزوّد) : la consigne de format
// « اكتب قيمة $K$ فقط (عدد طبيعي) » s'affichait avec ses dollars, sous le champ
// ET dans le placeholder. Aucun texte de contenu ne doit montrer de « $ » :
// le texte passe par MathLabel / RichText, les attributs par mathToPlain.
const FORMAT = 'اكتب قيمة $K$ فقط (عدد طبيعي)';

const QUESTIONS = [
  { id: 'q1', answerType: 'rational', answerFormat: FORMAT },
  { id: 'q2', answerType: 'integerSet', answerFormat: FORMAT },
  { id: 'q3', answerType: 'choice', choices: [{ id: 'A', content: '$K = 12$' }, { id: 'B', content: '$\\frac{3}{4}$' }] },
  { id: 'q4', answerType: 'multiChoice', choices: [{ id: 'A', content: '$a < b$' }, { id: 'B', content: 'العدد $7$' }] },
];

describe('QuestionRenderer — never a raw « $ » on screen', () => {
  for (const question of QUESTIONS) {
    it(`${question.answerType}: no dollar sign in text or attributes`, () => {
      const html = renderToStaticMarkup(<QuestionRenderer question={question} value={null} onChange={() => {}} />);
      expect(html).not.toContain('$');
    });
  }

  it('keeps the readable hint (the formula as plain text) in the placeholder', () => {
    const html = renderToStaticMarkup(<QuestionRenderer question={QUESTIONS[0]} value={null} onChange={() => {}} />);
    // mathToPlain isole la formule (marques bidi invisibles) : on les ignore.
    expect(html.replace(/[\u2066-\u2069\u200e\u200f]/g, '')).toContain('placeholder="اكتب قيمة K فقط (عدد طبيعي)"');
  });
});
