import { describe, it, expect, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import i18n from '../../../i18n';
import OneTimeCredentials from '../../../components/admin/OneTimeCredentials';
import { CreateStudentForm, submitStudent } from './CreateStudent';

const t = i18n.getFixedT(null, 'admin');
const FORM = { firstName: 'أمين', lastName: 'بن علي', email: '', grade: '' };
const GRADES = [{ value: '4am', label: 'الرابعة متوسط' }];

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

describe('« إنشاء حساب تلميذ »', () => {
  const original = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = original;
  });

  it('le formulaire : deux noms, un courriel LTR facultatif, un niveau facultatif', () => {
    const out = formHtml();
    expect(out).toContain('حساب تلميذ جديد');
    expect(out).toContain('id="cs-email"');
    expect(out).toMatch(/type="email" dir="ltr"/);
    expect(out).toContain('دون مستوى');
    expect(out).toContain('الرابعة متوسط');
    expect(out).toContain('إنشاء الحساب');
  });

  it('un nom latin est refusé AVANT le serveur, avec le message arabe de l’inscription', async () => {
    const calls = mockFetch(201, {});
    const outcome = await submitStudent('tk', { ...FORM, firstName: 'Amine' }, t);
    expect(calls).toHaveLength(0);
    expect(outcome.nameErrors).toEqual({ firstName: 'notArabic' });
    const out = formHtml({ nameErrors: outcome.nameErrors });
    expect(out).toContain('اكتب بالحروف العربية');
    expect(out).toContain('aria-invalid="true"');
  });

  it('succès : le corps n’envoie ni courriel ni niveau vides ; le mot de passe revient une fois', async () => {
    const calls = mockFetch(201, {
      success: true,
      student: { id: 9, firstName: 'أمين', lastName: 'بن علي' },
      login: 'amine.benali.42',
      password: 'Xk7-pq2-Lm9',
    });
    const outcome = await submitStudent('tk', { ...FORM, firstName: '  أمين  ' }, t);
    expect(calls[0].url).toContain('/admin/students');
    expect(calls[0].method).toBe('POST');
    expect(calls[0].body).toEqual({ firstName: 'أمين', lastName: 'بن علي' });
    expect(outcome.secret).toEqual({ login: 'amine.benali.42', password: 'Xk7-pq2-Lm9' });

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
    expect(card).toContain('تظهر مرة واحدة فقط');
    expect(card.match(/Xk7-pq2-Lm9/g)).toHaveLength(1);
    expect(card).toMatch(/dir="ltr"[^>]*>amine\.benali\.42</);
    expect(card).toContain('نسخ');
    expect(card).toContain('تمّ');
  });

  it('le courriel et le niveau donnés partent', async () => {
    const calls = mockFetch(201, { success: true, student: {}, login: 'a@b.dz', password: 'p' });
    await submitStudent('tk', { ...FORM, email: ' a@b.dz ', grade: '4am' }, t);
    expect(calls[0].body).toEqual({ firstName: 'أمين', lastName: 'بن علي', email: 'a@b.dz', grade: '4am' });
  });

  it('courriel déjà pris : la phrase arabe de la page', async () => {
    mockFetch(422, { success: false, reason: 'email_taken', message: 'server text' });
    const outcome = await submitStudent('tk', { ...FORM, email: 'a@b.dz' }, t);
    expect(outcome.formError).toBe('هذا البريد مستعمل في حساب آخر.');
    expect(outcome.secret).toBeUndefined();
    expect(formHtml({ formError: outcome.formError })).toContain('هذا البريد مستعمل في حساب آخر.');
  });

  it('une autre panne : la phrase de la page, jamais un mot de passe', async () => {
    mockFetch(500, { success: false });
    const outcome = await submitStudent('tk', FORM, t);
    expect(outcome.formError).toBe(t('students.create.error'));
  });
});
