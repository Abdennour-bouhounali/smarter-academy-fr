import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  SHARED_ITEMS,
  joinRequest,
  classroomsAwaitingConsent,
  visibleRecommendations,
  RECOMMENDATION_KINDS,
} from './qismConsent';

const studentAr = JSON.parse(
  readFileSync(new URL('../../i18n/locales/ar/student.json', import.meta.url), 'utf8'),
);
const qismSrc = readFileSync(new URL('./Qism.jsx', import.meta.url), 'utf8');

/**
 * Rejoindre un قسم = consentir au partage. Ce fichier défend la règle :
 * aucune requête d'adhésion sans geste explicite, et un lien de classe
 * n'adhère JAMAIS tout seul.
 */
describe('joinRequest', () => {
  it('ne produit aucun corps sans consentement', () => {
    expect(joinRequest({ code: 'ABC123' }, false)).toBeNull();
    expect(joinRequest({ link: 'tok' }, undefined)).toBeNull();
    expect(joinRequest({ link: 'tok' }, 'yes')).toBeNull();
  });

  it('porte consent: true après le geste', () => {
    expect(joinRequest({ code: 'ABC123' }, true)).toEqual({ code: 'ABC123', consent: true });
    expect(joinRequest({ link: 'tok' }, true)).toEqual({ link: 'tok', consent: true });
    expect(joinRequest({ token: 'tok' }, true)).toBeNull();
  });

  it('refuse un corps vide', () => {
    expect(joinRequest({}, true)).toBeNull();
    expect(joinRequest(null, true)).toBeNull();
  });
});

describe('classroomsAwaitingConsent', () => {
  it('ne garde que les adhésions à confirmer', () => {
    const ctx = { classrooms: [{ id: 1, consentRequired: true }, { id: 2, consentRequired: false }, { id: 3 }] };
    expect(classroomsAwaitingConsent(ctx).map((c) => c.id)).toEqual([1]);
  });

  it('tolère un contexte vide', () => {
    expect(classroomsAwaitingConsent(null)).toEqual([]);
    expect(classroomsAwaitingConsent({})).toEqual([]);
  });
});

describe('visibleRecommendations', () => {
  const resolve = (code) => (code === 'known' ? '/courses/x/known' : null);

  it('écarte les kinds inconnus et résout le lien de leçon', () => {
    const out = visibleRecommendations([
      { id: 1, kind: 'recommend_lesson', lesson: { code: 'known', title: 'د' } },
      { id: 2, kind: 'recommend_lesson', lesson: { code: 'unknown', title: 'د' } },
      { id: 3, kind: 'review_prerequisite', lesson: null, learningPoint: { code: 'lp', title: 'ن' } },
      { id: 4, kind: 'something_new' },
    ], resolve);
    expect(out.map((r) => [r.id, r.lessonPath])).toEqual([[1, '/courses/x/known'], [2, null], [3, null]]);
  });

  it('tolère une réponse absente', () => {
    expect(visibleRecommendations(undefined, resolve)).toEqual([]);
  });
});

describe('le catalogue arabe couvre le consentement', () => {
  const q = studentAr.qism;

  it('chaque élément partagé a son texte', () => {
    for (const item of SHARED_ITEMS) expect(q.sharing.items[item]).toBeTruthy();
    expect(q.sharing.email).toBeTruthy();
    expect(q.sharing.leave).toBeTruthy();
  });

  it('chaque kind de suggestion a sa phrase', () => {
    for (const kind of RECOMMENDATION_KINDS) expect(q.recommendations.kinds[kind]).toBeTruthy();
  });

  it('le motif consent_required a son message', () => {
    expect(q.errors.consent_required).toBeTruthy();
  });
});

describe('Qism : rien n’adhère tout seul', () => {
  it('aucun joinClassGroup dans un effet', () => {
    const effects = qismSrc.split('useEffect(').slice(1).map((chunk) => chunk.split('}, [')[0]);
    for (const body of effects) expect(body).not.toMatch(/joinClassGroup/);
  });

  it('l’adhésion passe par joinRequest', () => {
    expect(qismSrc).toMatch(/joinRequest\(/);
  });
});
