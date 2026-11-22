import { useState } from 'react';
import { AdminCard, input, label, btnPrimary, btnSecondary } from '../adminUi';
import { createStudent } from '../../../services/admin/studentService';
import { normalizeName, personNameErrors } from '../../../utils/personName';

const EMPTY = { firstName: '', lastName: '', email: '', grade: '' };

/**
 * « إنشاء حساب تلميذ » — envoie le formulaire au serveur et dit ce qui en sort.
 *
 * Les noms sont vérifiés ICI d'abord (`utils/personName`, le miroir de PersonName) pour qu'un nom latin reçoive
 * son message arabe sans aller-retour ; le serveur reste l'autorité. Un courriel ou un niveau vide n'est pas
 * envoyé : sans courriel, le serveur fabrique l'identifiant (`login`).
 *
 * @returns {Promise<{ nameErrors?: object, formError?: string, secret?: { login: string, password: string } }>}
 */
export async function submitStudent(token, form, t) {
  const nameErrors = personNameErrors(form);
  if (Object.keys(nameErrors).length > 0) return { nameErrors };

  const email = form.email.trim();
  const body = {
    firstName: normalizeName(form.firstName),
    lastName: normalizeName(form.lastName),
    ...(email ? { email } : {}),
    ...(form.grade ? { grade: form.grade } : {}),
  };
  try {
    const res = await createStudent(token, body);
    return { secret: { login: res.login, password: res.password } };
  } catch (err) {
    if (err.reason === 'email_taken') return { formError: t('students.create.emailTaken') };
    // Un 422 porte la phrase arabe du serveur (nom refusé, niveau inconnu…) ; le reste, la nôtre.
    return { formError: err.status === 422 && err.message ? err.message : t('students.create.error') };
  }
}

/** L'état du formulaire et de la carte du mot de passe, pour la page `StudentList`. */
export function useCreateStudent(token, t, onCreated) {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [nameErrors, setNameErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [secret, setSecret] = useState(null);

  const start = () => {
    setForm(EMPTY);
    setSecret(null);
    setNameErrors({});
    setFormError(null);
  };

  const submit = async () => {
    setBusy(true);
    setFormError(null);
    const outcome = await submitStudent(token, form, t);
    setBusy(false);
    setNameErrors(outcome.nameErrors ?? {});
    setFormError(outcome.formError ?? null);
    if (outcome.secret) {
      setSecret(outcome.secret);
      setForm(null);
      onCreated();
    }
  };

  return {
    form,
    busy,
    nameErrors,
    formError,
    secret,
    start,
    submit,
    setField: (field, value) => setForm((current) => ({ ...current, [field]: value })),
    cancel: () => setForm(null),
    dismissSecret: () => setSecret(null),
  };
}

/**
 * Le formulaire, sans état. `t` est celui de `admin` ; les messages de nom sont ceux de l'inscription
 * (`auth:name.errors.*`), les mêmes que voit un élève qui s'inscrit seul.
 */
export function CreateStudentForm({ t, form, gradeOptions, busy, nameErrors, formError, onField, onSubmit, onCancel }) {
  const nameField = (field, id) => (
    <div>
      <label className={label} htmlFor={id}>{t(`students.create.${field}`)}</label>
      <input
        id={id}
        required
        maxLength={50}
        className={input}
        value={form[field]}
        aria-invalid={Boolean(nameErrors[field])}
        aria-describedby={`${id}-hint`}
        onChange={(e) => onField(field, e.target.value)}
      />
      <p id={`${id}-hint`} className={`mt-1 font-inter text-xs ${nameErrors[field] ? 'text-rose-600' : 'text-slate-500'}`}>
        {nameErrors[field] ? t(`auth:name.errors.${nameErrors[field]}`) : t('students.create.namesHint')}
      </p>
    </div>
  );

  return (
    <AdminCard title={t('students.create.title')}>
      <form
        data-create-student
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {nameField('firstName', 'cs-first')}
        {nameField('lastName', 'cs-last')}
        <div>
          <label className={label} htmlFor="cs-email">{t('students.create.email')}</label>
          <input
            id="cs-email"
            type="email"
            dir="ltr"
            maxLength={190}
            className={input}
            value={form.email}
            onChange={(e) => onField('email', e.target.value)}
          />
          <p className="mt-1 font-inter text-xs text-slate-500">{t('students.create.emailHint')}</p>
        </div>
        <div>
          <label className={label} htmlFor="cs-grade">{t('students.create.grade')}</label>
          <select id="cs-grade" className={input} value={form.grade} onChange={(e) => onField('grade', e.target.value)}>
            <option value="">{t('students.create.noGrade')}</option>
            {gradeOptions.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        {formError && <p role="alert" className="font-inter text-sm text-rose-600 sm:col-span-2 lg:col-span-4">{formError}</p>}
        <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? t('students.create.creating') : t('students.create.submit')}
          </button>
          <button type="button" className={btnSecondary} onClick={onCancel}>{t('common.cancel')}</button>
        </div>
      </form>
    </AdminCard>
  );
}
