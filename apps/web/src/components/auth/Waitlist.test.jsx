import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import '../../i18n';
import Waitlist, { FRENCH_PHONE, waitlistError, waitlistPayload } from './Waitlist';

/**
 * The waiting list follows the server (apps/api › WaitlistController): `email` required, then optionally `name`,
 * `role` (student / teacher / parent) and a French `phone`.
 */
const controller = readFileSync(new URL('../../../../api/app/Http/Controllers/WaitlistController.php', import.meta.url), 'utf8');

describe('Waitlist — what is sent', () => {
  it('always the e-mail, the optional fields only when given', () => {
    expect(waitlistPayload({ email: ' lea@exemple.fr ', name: '', role: null, phone: '' })).toEqual({ email: 'lea@exemple.fr' });
    expect(waitlistPayload({ email: 'lea@exemple.fr', name: ' Léa Martin ', role: 'parent', phone: '06 12 34 56 78' })).toEqual({
      email: 'lea@exemple.fr',
      name: 'Léa Martin',
      role: 'parent',
      phone: '06 12 34 56 78',
    });
  });

  it('refuses a missing or malformed e-mail, and a phone that is not French', () => {
    expect(waitlistError({ email: '', phone: '' })).toEqual({ field: 'email', key: 'waitlist.emailRequired' });
    expect(waitlistError({ email: 'lea@', phone: '' })).toEqual({ field: 'email', key: 'waitlist.badEmail' });
    expect(waitlistError({ email: 'lea@exemple.fr', phone: '+213 550 12 34 56' })).toEqual({ field: 'phone', key: 'waitlist.badPhone' });
    expect(waitlistError({ email: 'lea@exemple.fr', phone: '' })).toBeNull();
    expect(waitlistError({ email: 'lea@exemple.fr', phone: '+33 6 12 34 56 78' })).toBeNull();
  });

  it('mirrors the server’s phone pattern and its three roles', () => {
    for (const ok of ['06 12 34 56 78', '0612345678', '+33 6 12 34 56 78', '0033612345678', '01.23.45.67.89']) {
      expect(FRENCH_PHONE.test(ok), ok).toBe(true);
    }
    for (const bad of ['055 01 23 45', '06 12 34 56', '+213 550 12 34 56', '00 12 34 56 78']) {
      expect(FRENCH_PHONE.test(bad), bad).toBe(false);
    }
    expect(controller).toContain("const FRENCH_PHONE = '/^(?:0|\\+33 ?|0033 ?)[1-9](?:[ .\\-]?[0-9]{2}){4}$/'");
    expect(controller).toMatch(/'role' => 'nullable\|string\|in:student,teacher,parent'/);
    expect(controller).toMatch(/'email' => \['required'/);
  });
});

describe('Waitlist — the form', () => {
  const html = renderToStaticMarkup(
    <MemoryRouter>
      <Waitlist />
    </MemoryRouter>,
  );

  it('asks for an e-mail first, in French, left to right', () => {
    expect(html).toContain('La plateforme est en phase de test');
    expect(html).toContain('type="email"');
    expect(html.indexOf('data-waitlist-email')).toBeLessThan(html.indexOf('data-waitlist-phone'));
    expect(html).toContain('Téléphone (facultatif)');
    for (const role of ['Élève', 'Parent', 'Professeur']) expect(html).toContain(role);
    expect(html).not.toMatch(/[\u0600-\u06FF]/);
    expect(html).not.toContain('dir="rtl"');
  });
});
