import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  joinClassGroup,
  previewJoinLink,
  confirmClassConsent,
  fetchTeacherRecommendations,
} from './studyContextService';

/**
 * قسمي, côté client : rejoindre = consentir. Le drapeau `consent` ne part
 * que si l'appelant le passe — le service n'en décide jamais.
 */
describe('studyContextService', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function respond(status, body) {
    global.fetch.mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    });
  }

  const sentBody = () => JSON.parse(global.fetch.mock.calls[0][1].body);
  const sentUrl = () => global.fetch.mock.calls[0][0];

  describe('joinClassGroup', () => {
    it('sans consentement explicite, le corps ne le porte pas', async () => {
      respond(201, { success: true });
      await joinClassGroup('tk', { code: 'ABC123' });
      expect(sentBody()).toEqual({ code: 'ABC123' });
    });

    it('avec consent: true, le corps le porte', async () => {
      respond(201, { success: true });
      await joinClassGroup('tk', { link: 'L'.repeat(32), consent: true });
      expect(sentBody()).toEqual({ link: 'L'.repeat(32), consent: true });
    });

    it('le jeton d’invitation (`token`) n’existe plus : jamais envoyé', async () => {
      respond(201, { success: true });
      await joinClassGroup('tk', { token: 'inv', code: 'ABC123', consent: true });
      expect(sentBody()).toEqual({ code: 'ABC123', consent: true });
    });

    it('le motif consent_required voyage sur l’erreur', async () => {
      respond(422, { success: false, reason: 'consent_required' });
      await expect(joinClassGroup('tk', { code: 'ABC123' })).rejects.toMatchObject({ reason: 'consent_required' });
    });
  });

  describe('previewJoinLink', () => {
    it('publique : sans jeton d’API, aucun en-tête Authorization', async () => {
      respond(200, { success: true, joinLink: { classroomName: 'أ', joiningOpen: true } });
      const preview = await previewJoinLink('abc');
      expect(sentUrl()).toMatch(/\/join-links\/abc$/);
      expect(global.fetch.mock.calls[0][1]?.headers?.Authorization).toBeUndefined();
      expect(preview).toEqual({ classroomName: 'أ', joiningOpen: true });
    });

    it('avec le jeton d’un élève connecté, l’en-tête part (alreadyMember)', async () => {
      respond(200, { success: true, joinLink: { alreadyMember: true } });
      await previewJoinLink('abc', 'tk');
      expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer tk');
    });

    it('le motif invalid voyage sur l’erreur', async () => {
      respond(422, { success: false, reason: 'invalid' });
      await expect(previewJoinLink('zzz')).rejects.toMatchObject({ reason: 'invalid' });
    });
  });

  describe('confirmClassConsent', () => {
    it('POST sur la classe et rend le contexte', async () => {
      respond(200, { success: true, studyContext: { mode: 'classroom' } });
      const ctx = await confirmClassConsent('tk', 7);
      expect(sentUrl()).toMatch(/\/student\/classrooms\/7\/consent$/);
      expect(global.fetch.mock.calls[0][1].method).toBe('POST');
      expect(ctx).toEqual({ mode: 'classroom' });
    });

    it('not_member voyage sur l’erreur', async () => {
      respond(422, { success: false, reason: 'not_member' });
      await expect(confirmClassConsent('tk', 7)).rejects.toMatchObject({ reason: 'not_member' });
    });
  });

  describe('fetchTeacherRecommendations', () => {
    it('rend la liste', async () => {
      respond(200, { success: true, recommendations: [{ id: 1, kind: 'recommend_lesson' }] });
      expect(await fetchTeacherRecommendations('tk')).toEqual([{ id: 1, kind: 'recommend_lesson' }]);
      expect(sentUrl()).toMatch(/\/student\/teacher-recommendations$/);
    });

    it('une réponse sans liste donne une liste vide', async () => {
      respond(200, { success: true });
      expect(await fetchTeacherRecommendations('tk')).toEqual([]);
    });
  });
});
