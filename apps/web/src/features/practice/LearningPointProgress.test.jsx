import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import LearningPointProgress from './LearningPointProgress';

const LONG = 'حل وضعية إدماجية بتعبئة قابلية القسمة والقواسم والقاسم المشترك الأكبر';
const render = (point) => renderToStaticMarkup(<LearningPointProgress point={point} />);
const lit = (html) => (html.match(/fill-amber-400/g) ?? []).length;

describe('LearningPointProgress — le point, son chemin, ses deux compteurs', () => {
  it('scénario A/D : le NOM en titre, exercices et questions séparés (1 / 3, 8 / 13)', () => {
    const html = render({ code: 'P1', title: LONG, status: 'reinforce', practice: { exercises: 3, exercisesCompleted: 1, questions: 13, questionsAnswered: 8 } });
    expect(html).toContain(LONG);
    expect(html).toMatch(/data-lp-metric="exercises"[\s\S]*?>1(?:<!-- -->)? \/ (?:<!-- -->)?3</);
    expect(html).toMatch(/data-lp-metric="questions"[\s\S]*?>8(?:<!-- -->)? \/ (?:<!-- -->)?13</);
    expect(html).toContain('data-mastery-stage="2"');
    expect(lit(html)).toBe(2);
  });

  it('scénario C : rien de fait, non évalué — aucune étoile allumée, 0 / N', () => {
    const html = render({ code: 'P1', title: 'x', status: 'unassessed', practice: { exercises: 5, exercisesCompleted: 0, questions: 15, questionsAnswered: 0 } });
    expect(lit(html)).toBe(0);
    expect(html).toMatch(/>0(?:<!-- -->)? \/ (?:<!-- -->)?5</);
    expect(html).toMatch(/>0(?:<!-- -->)? \/ (?:<!-- -->)?15</);
  });

  it('scénario E : tout fait + متحكَّم فيها — trois étoiles', () => {
    const html = render({ code: 'P1', title: 'x', status: 'mastered', practice: { exercises: 3, exercisesCompleted: 3, questions: 13, questionsAnswered: 13 } });
    expect(lit(html)).toBe(3);
    expect(html).toMatch(/>3(?:<!-- -->)? \/ (?:<!-- -->)?3</);
  });

  it('les compteurs ne disent jamais un mot de maîtrise', () => {
    const html = render({ code: 'P1', title: 'x', status: 'gap', practice: { exercises: 1, exercisesCompleted: 0, questions: 2, questionsAnswered: 0 } });
    const metrics = html.slice(html.indexOf('data-lp-metric'));
    expect(metrics).not.toMatch(/إتقان|متحكَّم|تحكّم/);
  });
});
