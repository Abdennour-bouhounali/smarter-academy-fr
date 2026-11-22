import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Pencil, UserRound } from 'lucide-react';
import PersonNameFields from '../auth/PersonNameFields';
import { AuthContext } from '../../context/AuthContext';
import { normalizeName, personNameErrors } from '../../utils/personName';

/**
 * « Prénom et nom » on a profile page — read, then edit in place. Shared by
 * the student profile (Profil.jsx) and the teacher profile (TeacherProfile.jsx);
 * only the accent differs (`tone`). Writes through AuthContext.updateProfile
 * (PATCH /auth/profile), so the greeting, the sidebar and the teacher's view
 * of this student all pick the new name up.
 */
export default function NameEditor({ tone = 'blue' }) {
  const { t } = useTranslation('auth');
  const { user, updateProfile } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [names, setNames] = useState({ firstName: '', lastName: '' });
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const accent = tone === 'teal'
    ? { text: 'text-teal-700', button: 'bg-teal-700 hover:bg-teal-800', icon: 'text-teal-600' }
    : { text: 'text-nav-accent', button: 'bg-nav-accent hover:bg-[#3350c4]', icon: 'text-blue-500' };

  const startEditing = () => {
    setNames({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
    setErrors({});
    setErrorMsg('');
    setSaved(false);
    setEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const nextErrors = personNameErrors(names);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await updateProfile({ firstName: normalizeName(names.firstName), lastName: normalizeName(names.lastName) });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="name-editor-title">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h2 id="name-editor-title" className="font-inter text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <UserRound size={15} className={accent.icon} /> {t('name.sectionTitle')}
        </h2>
        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${accent.text} hover:bg-slate-100 transition-colors`}
          >
            <Pencil size={13} /> {t('name.edit')}
          </button>
        )}
      </div>

      {!editing ? (
        <dl className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <div className="min-w-0">
            <dt className="text-xs text-slate-400">{t('name.firstLabel')}</dt>
            <dd className="mt-0.5 font-semibold text-slate-800 truncate" dir="auto">{user?.firstName || '—'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-slate-400">{t('name.lastLabel')}</dt>
            <dd className="mt-0.5 font-semibold text-slate-800 truncate" dir="auto">{user?.lastName || '—'}</dd>
          </div>
        </dl>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          {errorMsg && (
            <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{errorMsg}</div>
          )}
          <PersonNameFields
            idPrefix="profile"
            value={names}
            onChange={(next) => {
              setNames(next);
              setErrors({});
            }}
            errors={errors}
            disabled={saving}
            autoFocus
            tone={tone}
            hint={null}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${accent.button}`}
            >
              {saving ? t('name.saving') : t('name.save')}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              {t('name.cancel')}
            </button>
          </div>
        </form>
      )}

      {saved && (
        <p role="status" className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
          <Check size={12} /> {t('name.saved')}
        </p>
      )}
    </section>
  );
}
