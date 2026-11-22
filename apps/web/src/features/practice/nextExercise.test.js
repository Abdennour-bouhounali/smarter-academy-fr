import { describe, it, expect } from 'vitest';
import { decideNextExercise, selectionHintReason } from './nextExercise';

const ids = ['ex-1', 'ex-2', 'ex-3'];

describe('decideNextExercise — le sélecteur, avec ses replis', () => {
  it('suit le choix du serveur', () => {
    const d = decideNextExercise({ response: { exerciseId: 'ex-3', reason: 'weak_learning_point' }, fallbackIds: ids, completedIds: ['ex-1'] });
    expect(d).toEqual({ exerciseId: 'ex-3', reason: 'weak_learning_point', source: 'selector' });
  });

  it('exerciseId null = niveau épuisé : fin de séance', () => {
    const d = decideNextExercise({ response: { exerciseId: null, reason: 'order' }, fallbackIds: ids, completedIds: ['ex-1'] });
    expect(d.exerciseId).toBeNull();
    expect(d.source).toBe('selector');
  });

  it('échec de l’appel → ordre du contenu', () => {
    expect(decideNextExercise({ response: null, fallbackIds: ids, completedIds: [] }).exerciseId).toBe('ex-1');
    expect(decideNextExercise({ response: null, fallbackIds: ids, completedIds: ['ex-1'] }).exerciseId).toBe('ex-2');
  });

  it('sélecteur désactivé → ordre du contenu, même si exerciseId est null', () => {
    const d = decideNextExercise({ response: { exerciseId: null, reason: 'disabled' }, fallbackIds: ids, completedIds: ['ex-1', 'ex-2'] });
    expect(d).toEqual({ exerciseId: 'ex-3', reason: 'order', source: 'order' });
  });

  it('ordre du contenu épuisé → null (fin de séance, comme avant)', () => {
    expect(decideNextExercise({ response: null, fallbackIds: ids, completedIds: ids }).exerciseId).toBeNull();
  });

  it('un identifiant inconnu du contenu ou déjà fait → ordre du contenu', () => {
    expect(decideNextExercise({ response: { exerciseId: 'ghost', reason: 'unseen' }, fallbackIds: ids }).exerciseId).toBe('ex-1');
    expect(decideNextExercise({ response: { exerciseId: 'ex-1', reason: 'unseen' }, fallbackIds: ids, completedIds: ['ex-1'] }).exerciseId).toBe('ex-2');
  });

  it('une réponse malformée → ordre du contenu', () => {
    expect(decideNextExercise({ response: { reason: 'order' }, fallbackIds: ids }).exerciseId).toBe('ex-1');
    expect(decideNextExercise({ response: 'oops', fallbackIds: ids }).exerciseId).toBe('ex-1');
    expect(decideNextExercise().exerciseId).toBeNull();
  });
});

describe('selectionHintReason', () => {
  it('ne parle que pour un choix du sélecteur et deux raisons', () => {
    expect(selectionHintReason({ source: 'selector', reason: 'weak_learning_point' })).toBe('weak_learning_point');
    expect(selectionHintReason({ source: 'selector', reason: 'recent_misconception' })).toBe('recent_misconception');
    expect(selectionHintReason({ source: 'selector', reason: 'unseen' })).toBeNull();
    expect(selectionHintReason({ source: 'order', reason: 'weak_learning_point' })).toBeNull();
    expect(selectionHintReason(null)).toBeNull();
  });
});
