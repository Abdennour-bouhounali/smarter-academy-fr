import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PracticePanel from './PracticePanel.jsx';
import { generateChallenge } from './practice.js';

const data = { lab: 'limit', practice: { solved: 0, seen: 0 } };

/**
 * La fonction d'un défi est du LaTeX : elle doit être RENDUE (KaTeX), pas
 * recopiée. La QA a vu « f(x) = \frac{x^2-4}{x-2} » affiché tel quel.
 */
describe('PracticePanel', () => {
  it('rend la fonction du défi en notation mathématique, jamais en LaTeX brut', () => {
    const challenge = generateChallenge(3, { kinds: ['readLimit'] });
    expect(challenge.source).toMatch(/\\frac/);
    const html = renderToStaticMarkup(createElement(PracticePanel, { data, initialChallenge: challenge }));
    const line = html.slice(html.indexOf('data-ml-an-source'));
    expect(line).toContain('class="katex');
    // Le texte visible ne contient plus la commande LaTeX (seule l'annotation MathML la garde).
    const visible = line.replace(/<annotation[\s\S]*?<\/annotation>/g, '').replace(/<[^>]+>/g, '');
    expect(visible).not.toContain('\\frac');
  });

  it('montre la fonction de la prédiction du laboratoire', () => {
    const challenge = generateChallenge(3, { kinds: ['readLimit'] });
    const html = renderToStaticMarkup(createElement(PracticePanel, { data, initialChallenge: challenge }));
    expect(html).toContain('data-ml-an-prediction="limitFromBothSides"');
    expect(html).toContain('data-ml-an-predict-source');
    expect(html).toContain('data-ml-an-predict-setup');
  });
});
