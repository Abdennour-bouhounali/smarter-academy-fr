import { describe, it, expect } from 'vitest';
import { isAssessedQuestion, buildEvidencePayload } from './evidencePayload';

/**
 * Ce que ces tests verrouillent (Mastery V2) : la preuve envoyée au serveur
 * ne porte QUE ce que l'élève a choisi. Ni `isCorrect`, ni
 * `learningPointCodes`, ni `assessmentType` — le serveur juge, lit les points
 * dans le registre et fixe la difficulté. Une épreuve sans réponse part avec
 * `picked: null` (le serveur l'enregistre `abandoned`).
 */
const assessed = {
  id: 'ft-01',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['4am_x_P1'] },
};

describe('isAssessedQuestion — la porte de la preuve', () => {
  it('accepte une question évaluative qui porte des points (learningPointIds)', () => {
    expect(isAssessedQuestion(assessed)).toBe(true);
  });

  it('accepte aussi la forme du registre (`learningPoints`)', () => {
    expect(isAssessedQuestion({ id: 'q', assessment: { enabled: true, type: 'assessment', learningPoints: [{ code: 'P1', role: 'primary' }] } })).toBe(true);
  });

  it('refuse une question désactivée, non évaluative, ou sans point', () => {
    expect(isAssessedQuestion({ id: 'q', assessment: { enabled: false, type: 'assessment', learningPointIds: ['P1'] } })).toBe(false);
    expect(isAssessedQuestion({ id: 'q', assessment: { enabled: true, type: 'practice', learningPointIds: ['P1'] } })).toBe(false);
    expect(isAssessedQuestion({ id: 'q', assessment: { enabled: true, type: 'discovery', learningPointIds: ['P1'] } })).toBe(false);
    expect(isAssessedQuestion({ id: 'q', assessment: { enabled: true, type: 'assessment', learningPointIds: [] } })).toBe(false);
    expect(isAssessedQuestion({ id: 'q' })).toBe(false);
    expect(isAssessedQuestion(undefined)).toBe(false);
  });
});

describe('buildEvidencePayload — la charge utile V2', () => {
  it('envoie questionCode, attemptId et answer.picked — rien d’autre', () => {
    const payload = buildEvidencePayload(assessed, { picked: 2 }, 'uuid-1');

    expect(payload).toEqual({ questionCode: 'ft-01', attemptId: 'uuid-1', answer: { picked: 2 } });
    expect(Object.keys(payload).sort()).toEqual(['answer', 'attemptId', 'questionCode']);
    expect(payload).not.toHaveProperty('isCorrect');
    expect(payload).not.toHaveProperty('learningPointCodes');
    expect(payload).not.toHaveProperty('assessmentType');
  });

  it('accepte l’indice nu comme réponse', () => {
    expect(buildEvidencePayload(assessed, 0, 'uuid-2').answer).toEqual({ picked: 0 });
  });

  it('une question sans réponse part avec picked: null', () => {
    expect(buildEvidencePayload(assessed, null, 'u').answer).toEqual({ picked: null });
    expect(buildEvidencePayload(assessed, undefined, 'u').answer).toEqual({ picked: null });
    expect(buildEvidencePayload(assessed, { picked: null }, 'u').answer).toEqual({ picked: null });
    expect(buildEvidencePayload(assessed, {}, 'u').answer).toEqual({ picked: null });
  });

  it('tire un attemptId unique par preuve quand aucun n’est fourni', () => {
    const a = buildEvidencePayload(assessed, 1);
    const b = buildEvidencePayload(assessed, 1);
    expect(typeof a.attemptId).toBe('string');
    expect(a.attemptId).toHaveLength(36);
    expect(a.attemptId).not.toBe(b.attemptId);
  });
});
