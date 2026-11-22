import { describe, it, expect, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from '../../../i18n';
import OneTimeCredentials from '../../../components/admin/OneTimeCredentials';
import { CreateStudentForm, submitStudent } from './CreateStudent';

const t = i18n.getFixedT(null, 'admin');
const FORM = { firstName: 'Inès', lastName: 'Martin', email: '', grade: '' };
const GRADES = [{ value: '3e', label: 'Niveau 3e' }];

function mockFetch(status, body) {
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), method: options.method, body: JSON.parse(options.body) });
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  };
  return calls;
}

const formHtml = (props) =>
  renderToStaticMarkup(
    <CreateStudentForm
      t={t}
      form={FORM}
      gradeOptions={GRADES}
      busy={false}
      nameErrors={{}}
      formError={null}
      onField={() => {}}
      onSubmit={() => {}}
      onCancel={() => {}}
      {...props}
    />,
  );

describe('« Créer un compte élève »', () => {
  const original = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = original;
  });

  it('le formulaire : deux noms, un courriel LTR facultatif, un niveau facultatif', () => {
    const out = formHtml();
    expect(out).toContain('Nouveau compte élève');
    expect(out).toContain('id="cs-email"');
    expect(out).toMatch(/type="email" dir="ltr"/);
    expect(out).toContain('Sans niveau');
    expect(out).toContain('Niveau 3e');
    expect(out).toContain('Créer le compte');
  });

  it('un nom hors de l’alphabet latin est refusé AVANT le serveur, avec le message de l’inscription', async () => {
    const calls = mockFetch(201, {});
    // Un prénom avec un chiffre : `utils/personName` n'accepte que les lettres latines (accents compris).
    const outcome = await submitStudent('tk', { ...FORM, firstName: 'In3s' }, t);
    expect(calls).toHaveLength(0);
    expect(outcome.nameErrors).toEqual({ firstName: 'invalid' });
    const out = formHtml({ nameErrors: outcome.nameErrors });
    // La phrase vient du catalogue `auth` (celui de l'inscription), pas d'une copie locale.
    const message = i18n.t('name.errors.invalid', { ns: 'auth' });
    expect(message).not.toBe('name.errors.invalid');
    expect(out).toContain(message);
    expect(out).toContain('aria-invalid="true"');
  });

  it('succès : le corps n’envoie ni courriel ni niveau vides ; le mot de passe revient une fois', async () => {
    const calls = mockFetch(201, {
      success: true,
      student: { id: 9, firstName: 'Inès', lastName: 'Martin' },
      login: 'ines.martin.42',
      password: 'Xk7-pq2-Lm9',
    });
    const outcome = await submitStudent('tk', { ...FORM, firstName: '  Inès  ' }, t);
    expect(calls[0].url).toContain('/admin/students');
    expect(calls[0].method).toBe('POST');
    expect(calls[0].body).toEqual({ firstName: 'Inès', lastName: 'Martin' });
    expect(outcome.secret).toEqual({ login: 'ines.martin.42', password: 'Xk7-pq2-Lm9' });

    const card = renderToStaticMarkup(
      <OneTimeCredentials
        title={t('students.create.passwordTitle')}
        hint={t('students.create.passwordHint')}
        footer={t('students.create.loginAt')}
        login={outcome.secret.login}
        password={outcome.secret.password}
        labels={{ copy: t('common.copy'), copied: t('common.copied'), done: t('students.create.done') }}
        onDone={() => {}}
      />,
    );
    expect(card).toContain('affiché une seule fois');
    expect(card.match(/Xk7-pq2-Lm9/g)).toHaveLength(1);
    expect(card).toMatch(/dir="ltr"[^>]*>ines\.martin\.42</);
    expect(card).toContain('Copier');
    expect(card).toContain('Terminé');
  });

  it('le courriel et le niveau donnés partent', async () => {
    const calls = mockFetch(201, { success: true, student: {}, login: 'a@b.fr', password: 'p' });
    await submitStudent('tk', { ...FORM, email: ' a@b.fr ', grade: '3e' }, t);
    expect(calls[0].body).toEqual({ firstName: 'Inès', lastName: 'Martin', email: 'a@b.fr', grade: '3e' });
  });

  it('courriel déjà pris : la phrase française de la page', async () => {
    mockFetch(422, { success: false, reason: 'email_taken', message: 'server text' });
    const outcome = await submitStudent('tk', { ...FORM, email: 'a@b.fr' }, t);
    expect(outcome.formError).toBe('Cet e-mail est déjà utilisé par un autre compte.');
    expect(outcome.secret).toBeUndefined();
    expect(formHtml({ formError: outcome.formError })).toContain('Cet e-mail est déjà utilisé par un autre compte.');
  });

  it('une autre panne : la phrase de la page, jamais un mot de passe', async () => {
    mockFetch(500, { success: false });
    const outcome = await submitStudent('tk', FORM, t);
    expect(outcome.formError).toBe(t('students.create.error'));
  });
});
