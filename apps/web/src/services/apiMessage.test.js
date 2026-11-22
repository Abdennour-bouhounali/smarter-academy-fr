import { describe, it, expect } from 'vitest';
import i18n from '../i18n';
import { apiMessage, serverSentence, SERVER_SENTENCE_CODES } from './apiMessage';

const t = (key) => i18n.t(key, { ns: 'common' });
const CLOSED = 'La plateforme est en test : les inscriptions sont fermées pour le moment.';

describe('apiMessage — the server’s sentence for a known code, the client’s otherwise', () => {
  it('shows the server’s French sentence for a code of the list', () => {
    expect(apiMessage('register', { code: 'registration_closed', message: CLOSED }, 403)).toBe(CLOSED);
    expect(apiMessage('classroomJoin', { reason: 'joining_closed', message: 'Cette classe n’accepte plus de nouvel élève.' }, 422))
      .toBe('Cette classe n’accepte plus de nouvel élève.');
  });

  it('falls back to the client’s sentence for a message without a known code', () => {
    // A developer’s sentence, a code the list does not name, no code at all.
    expect(apiMessage('login', { message: 'Email ou mot de passe incorrect.' }, 401)).toBe(t('apiErrors.login'));
    expect(apiMessage('practice', { code: 'stale', message: 'Charge utile de preuve obsolète.' }, 422)).toBe(t('apiErrors.practice'));
    expect(apiMessage('reportSend', { reason: 'not_a_reviewer', message: 'Seuls les ambassadeurs…' }, 403)).toBe(t('apiErrors.reportSend'));
  });

  it('refuses a known code whose message is not a sentence for a person', () => {
    expect(serverSentence({ code: 'payments_closed', message: 'payments_closed' })).toBeNull();
    expect(serverSentence({ code: 'payments_closed', message: '' })).toBeNull();
    expect(serverSentence({ code: 'payments_closed', message: 'sans ponctuation finale' })).toBeNull();
    expect(serverSentence({ code: 'payments_closed', message: `${'x'.repeat(240)}.` })).toBeNull();
    expect(serverSentence({ code: 'payments_closed', message: '\u0644\u0627.' })).toBeNull();
    expect(serverSentence({ code: 'payments_closed', message: 'Le paiement en ligne n’est pas ouvert.' })).toBe('Le paiement en ligne n’est pas ouvert.');
  });

  it('keeps 429 its own sentence, whatever the server says', () => {
    expect(apiMessage('login', { code: 'registration_closed', message: CLOSED }, 429)).toBe(t('apiErrors.rateLimited'));
  });

  it('falls back to the generic sentence for an unknown key, and never returns a raw key', () => {
    expect(apiMessage('noSuchKey', null, 500)).toBe(t('apiErrors.generic'));
    expect(apiMessage('network')).toBe(t('apiErrors.network'));
    expect(apiMessage('network')).not.toContain('apiErrors');
  });

  it('every client sentence is French', () => {
    const catalogue = i18n.getResourceBundle(i18n.language, 'common').apiErrors;
    for (const [key, text] of Object.entries(catalogue)) {
      expect(text, key).not.toMatch(/[\u0600-\u06FF]/);
      expect(text, key).toMatch(/[a-zàâçéèêëîïôûùüÿœ]/);
    }
  });

  it('names only codes the API emits', () => {
    expect(SERVER_SENTENCE_CODES).toEqual(['registration_closed', 'payments_closed', 'joining_closed', 'class_inactive', 'not_a_student']);
  });
});
