import { describe, it, expect } from 'vitest';
import {
  isRichContent, escapeHtml, inlineMarkupToHtml, plainTextToHtml, formatAnswer, buildDefaultContent,
  MAX_CONTENT_LENGTH,
} from './noteContent';

/**
 * La partie PURE du contenu de note — testable sans navigateur. La
 * désinfection (DOM) et le rendu KaTeX sont couverts par e2e/notebook.mjs.
 */
describe('le format d’une note', () => {
  it('reconnaît une note riche par son premier bloc, et une brute par son absence', () => {
    expect(isRichContent('<p>Bonjour</p>')).toBe(true);
    expect(isRichContent('  <section data-nb="exercise"><p>x</p></section>')).toBe(true);
    expect(isRichContent('<h2>Titre</h2>')).toBe(true);
    // Les notes d'avant le cahier riche : du texte, parfois avec « < ».
    expect(isRichContent('Penser à vérifier le signe de a.')).toBe(false);
    expect(isRichContent('x < 3 donc…')).toBe(false);
    expect(isRichContent('<3 les maths')).toBe(false);
    expect(isRichContent('')).toBe(false);
    expect(isRichContent(null)).toBe(false);
  });

  it('une note brute devient des paragraphes, ligne par ligne, texte échappé', () => {
    expect(plainTextToHtml('a < b\n\n**gras**')).toBe('<p>a &lt; b</p><p><br></p><p><strong>gras</strong></p>');
  });

  it('échappe le HTML et ne garde que **gras** du dialecte des exercices', () => {
    expect(escapeHtml('<script>x</script>')).toBe('&lt;script&gt;x&lt;/script&gt;');
    expect(inlineMarkupToHtml('Calcule **$3/4 + 1/2$** puis <b>simplifie</b>'))
      .toBe('Calcule <strong>$3/4 + 1/2$</strong> puis &lt;b&gt;simplifie&lt;/b&gt;');
  });

  it('connaît la limite du serveur', () => {
    expect(MAX_CONTENT_LENGTH).toBe(12000);
  });
});

describe('la réponse de l’élève, telle que saisie', () => {
  const choiceQ = {
    answerType: 'choice',
    choices: [{ id: 'A', content: 'الأعداد **الزوجية**' }, { id: 'B', content: '$\\frac{1}{2}$' }],
  };

  it('QCM : le texte du choix, dans le dialecte des exercices', () => {
    expect(formatAnswer(choiceQ, { choiceId: 'B' })).toEqual({ text: '$\\frac{1}{2}$', ltr: false, markup: true });
    expect(formatAnswer({ ...choiceQ, answerType: 'multiChoice' }, { choiceIds: ['A', 'B'] }).text)
      .toBe('الأعداد **الزوجية** ، $\\frac{1}{2}$');
    // Un identifiant inconnu n'invente rien.
    expect(formatAnswer(choiceQ, { choiceId: 'Z' })).toBeNull();
  });

  it('nombres et ensembles : la saisie brute, isolée gauche-à-droite', () => {
    expect(formatAnswer({ answerType: 'rational' }, { value: ' 21/12 ' })).toEqual({ text: '21/12', ltr: true, markup: false });
    expect(formatAnswer({ answerType: 'integerSet' }, { value: '1، 2، 3' }).text).toBe('1، 2، 3');
    expect(formatAnswer({ answerType: 'rational' }, { value: '' })).toBeNull();
  });

  it('affine, intervalle, point : une notation lisible', () => {
    expect(formatAnswer({ answerType: 'affine' }, { a: '2', b: '-1' }).text).toBe('a = 2 ; b = -1');
    expect(formatAnswer({ answerType: 'affine' }, { a: '2' }).text).toBe('a = 2 ; b = ?');
    expect(formatAnswer({ answerType: 'interval' }, { lo: '3', loOpen: true, hi: '', hiOpen: true }).text).toBe(']3 ; +∞[');
    expect(formatAnswer({ answerType: 'interval' }, { lo: '-2', loOpen: false, hi: '5', hiOpen: false }).text).toBe('[-2 ; 5]');
    expect(formatAnswer({ answerType: 'point' }, { x: '1', y: '-3' }).text).toBe('(1 ; -3)');
  });

  it('sans réponse, rien', () => {
    expect(formatAnswer({ answerType: 'point' }, null)).toBeNull();
    expect(formatAnswer({ answerType: 'point' }, { x: '', y: '' })).toBeNull();
    expect(formatAnswer({ answerType: 'inconnu' }, { value: 'x' })).toBeNull();
  });
});

describe('le contenu de départ d’une note ouverte depuis un exercice', () => {
  const labels = {
    exercise: 'التمرين', question: 'السؤال', mistake: 'خطئي', myAnswer: 'إجابتي', verdict: 'التقييم', noAnswer: 'بدون إجابة',
  };
  const exercise = {
    metadata: { title: 'معارف — 12 و 18' },
    statement: { content: 'قواسم 12 هي **1 ، 2 ، 3 ، 4 ، 6 و 12**.\n\nقواسم 18 هي 1 ، 2 ، 3 ، 6 ، 9 و 18.' },
  };
  const question = { id: 'q1', answerType: 'integerSet', statement: 'اكتب القواسم المشتركة $\\gcd(12, 18)$.' };

  it('commence TOUJOURS par le bloc exercice : titre, énoncé en paragraphes, question', () => {
    const html = buildDefaultContent({ exercise, question, labels });
    expect(html.startsWith('<section data-nb="exercise">')).toBe(true);
    expect(html).toContain('<p data-nb="label">التمرين — معارف — 12 و 18</p>');
    expect(html).toContain('<p>قواسم 12 هي <strong>1 ، 2 ، 3 ، 4 ، 6 و 12</strong>.</p><p>قواسم 18 هي 1 ، 2 ، 3 ، 6 ، 9 و 18.</p>');
    expect(html).toContain('<p data-nb="label">السؤال</p><p>اكتب القواسم المشتركة $\\gcd(12, 18)$.</p>');
    // Et se termine par la ligne où l'élève écrit.
    expect(html.endsWith('<p><br></p>')).toBe(true);
  });

  it('sans validation, pas de bloc « خطئي » — on n’invente pas d’erreur', () => {
    const html = buildDefaultContent({ exercise, question, answer: { value: '1, 2' }, labels });
    expect(html).not.toContain('data-nb="mistake"');
  });

  it('réponse juste : pas de bloc « خطئي » non plus', () => {
    const html = buildDefaultContent({
      exercise, question, answer: { value: '1, 2, 3, 6' }, evaluation: { outcome: 'correct', isCorrect: true }, labels,
    });
    expect(html).not.toContain('data-nb="mistake"');
  });

  it('réponse fausse : la VRAIE réponse, isolée LTR, puis verdict et message', () => {
    const html = buildDefaultContent({
      exercise, question, answer: { value: '1, 2, 3' },
      evaluation: { outcome: 'incorrect', isCorrect: false },
      feedbackMessage: 'قارن **القائمتين** عددًا عددًا.',
      verdict: 'ليس بعد',
      labels,
    });
    expect(html).toContain('<section data-nb="mistake"><p data-nb="label">خطئي</p>');
    expect(html).toContain('<p><strong>إجابتي :</strong> <span dir="ltr">1, 2, 3</span></p>');
    expect(html).toContain('<p><strong>التقييم :</strong> ليس بعد — قارن <strong>القائمتين</strong> عددًا عددًا.</p>');
  });

  it('réponse fausse illisible : « بدون إجابة » plutôt qu’un vide', () => {
    const html = buildDefaultContent({
      exercise, question, answer: null, evaluation: { outcome: 'incorrect', isCorrect: false }, labels,
    });
    expect(html).toContain('<strong>إجابتي :</strong> بدون إجابة</p>');
    // Sans verdict ni message, pas de ligne « التقييم » vide.
    expect(html).not.toContain('التقييم');
  });

  it('le contenu venu des fichiers est échappé, jamais interprété', () => {
    const html = buildDefaultContent({
      exercise: { statement: { content: '<img src=x onerror=alert(1)>' } },
      question: { statement: 'a < b' },
      labels,
    });
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('<p>a &lt; b</p>');
    expect(html).not.toContain('<img');
  });
});
