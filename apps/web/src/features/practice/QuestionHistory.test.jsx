import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import QuestionHistory from './QuestionHistory';
import QuestionContextPanel from './QuestionContextPanel';
import HintPanel from './HintPanel';
import { historyEntry } from './questionHistory';

// « الدنّان » : trois questions, la 2e et la 3e reposent sur le x de la 1re.
const questions = [
  { id: 'q1', statement: 'جِد أكبر قيمة للعدد x.', answerType: 'rational' },
  { id: 'q2', statement: 'كم مرة استعملنا هذا الدنّ لملء الدنّ الأول؟', answerType: 'rational' },
  { id: 'q3', statement: 'كم مرة استعملنا هذا الدنّ لملء الدنّ الثاني؟', answerType: 'rational' },
];
const done = [
  historyEntry({ question: questions[0], index: 0, answer: { value: '6' }, evaluation: { outcome: 'correct', isCorrect: true }, feedbackMessage: 'PGCD(24 ; 18) = 6.' }),
  historyEntry({ question: questions[1], index: 1, answer: { value: '5' }, evaluation: { outcome: 'incorrect', isCorrect: false } }),
];

describe('QuestionHistory — le travail précédent reste sous les yeux', () => {
  const html = renderToStaticMarkup(<QuestionHistory entries={done} total={3} />);

  it('la question PRÉCÉDENTE est une carte : énoncé entier + réponse de l’élève', () => {
    const card = html.slice(html.indexOf('data-previous-question'));
    expect(card).toContain(questions[1].statement);
    expect(card).toMatch(/dir="ltr"[^>]*>5</);
    expect(card).toContain('data-outcome="incorrect"');
  });

  it('les plus anciennes restent récupérables, repliées sur une ligne avec LEUR réponse', () => {
    expect(html).toContain('data-question-history-line="1"');
    expect(html).toMatch(/aria-expanded="false"/);
    expect(html).toMatch(/dir="ltr"[^>]*>6</);
  });

  it('rien avant la première réponse', () => {
    expect(renderToStaticMarkup(<QuestionHistory entries={[]} total={3} />)).toBe('');
  });
});

describe('QuestionContextPanel — toutes les questions, sans rien dévoiler de l’avenir', () => {
  const html = renderToStaticMarkup(<QuestionContextPanel questions={questions} questionIndex={2} history={done} />);

  it('deux faites, une courante', () => {
    expect(html.match(/data-context-state="done"/g)).toHaveLength(2);
    expect(html).toMatch(/aria-current="step"[^>]*data-context-item="3"/);
  });

  it('l’énoncé d’une question à venir n’est jamais montré', () => {
    const upcoming = renderToStaticMarkup(<QuestionContextPanel questions={questions} questionIndex={0} history={[]} />);
    expect(upcoming).not.toContain(questions[1].statement);
    expect(upcoming).not.toContain(questions[2].statement);
    expect(upcoming.match(/data-context-state="upcoming"/g)).toHaveLength(2);
  });
});

describe('HintPanel — l’échelle des indices, sans fuite', () => {
  const types = ['look', 'direction', 'strategy'];

  it('avant tout indice : UNE ligne repliée (aria-expanded=false), aucun contenu, aucun cran', () => {
    const html = renderToStaticMarkup(<HintPanel hints={[]} remaining={3} hintTypes={types} onRequest={() => {}} />);
    expect(html).toMatch(/data-hint-toggle/);
    expect(html).toMatch(/aria-expanded="false"/);
    expect(html).not.toContain('data-hint-slot');
  });

  it('dès un indice révélé : l’échelle s’ouvre — le suivant demandable, le dernier verrouillé', () => {
    const html = renderToStaticMarkup(
      <HintPanel hints={[{ index: 1, type: 'look', content: 'c' }]} remaining={2} hintTypes={types} onRequest={() => {}} />,
    );
    expect(html.match(/data-hint-request/g)).toHaveLength(1);
    expect(html.match(/data-hint-state="locked"/g)).toHaveLength(1);
  });

  it('un indice révélé s’affiche, le suivant devient demandable', () => {
    const html = renderToStaticMarkup(
      <HintPanel hints={[{ index: 1, type: 'look', content: 'احسب PGCD(24 ; 18).' }]} remaining={2} hintTypes={types} onRequest={() => {}} />,
    );
    expect(html).toContain('PGCD(24 ; 18)');
    expect(html).toMatch(/data-hint-slot="2" data-hint-state="next"/);
  });

  it('question réussie : seuls les indices lus restent, plus aucun bouton', () => {
    const html = renderToStaticMarkup(
      <HintPanel hints={[{ index: 1, type: 'look', content: 'x' }]} remaining={2} hintTypes={types} onRequest={() => {}} disabled />,
    );
    expect(html).not.toContain('data-hint-request');
    expect(html.match(/data-hint-slot=/g)).toHaveLength(1);
  });
});
