import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import { useAdminResource } from '../../hooks/useAdminResource';
import { fetchRegistration, updateRegistration } from '../../services/admin/registrationService';
import { AdminCard } from '../../pages/admin/adminUi';
import Switch from './ui/Switch';

/**
 * Un changement des inscriptions, envoyé au serveur. OUVRIR demande d'abord une confirmation (cela ouvre la
 * plateforme au public) ; fermer, ou toucher au lien de classe, part tout de suite. Rend l'état que le serveur
 * renvoie, ou `null` quand l'administrateur a renoncé.
 *
 * @param {{ open?: boolean, classLinks?: boolean }} change
 * @param {{ confirm: (message: string) => boolean, confirmMessage: string }} ask
 */
export async function changeRegistration(token, change, { confirm, confirmMessage }) {
  if (change.open === true && !confirm(confirmMessage)) return null;
  return updateRegistration(token, change);
}

/**
 * La carte, sans état : ce que le serveur a dit (`registration`), et les deux interrupteurs. Celui du lien de
 * classe n'existe que lorsque l'inscription publique est fermée — ouverte, il ne change rien.
 */
export function RegistrationView({ t, registration, loading, saving, error, onChange }) {
  const open = Boolean(registration?.open);
  const classLinks = Boolean(registration?.classLinks);

  return (
    <AdminCard title={t('registration.title')} className="mb-6">
      {registration ? (
        <div className="space-y-3" data-registration={open ? 'open' : 'closed'}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className={`font-inter text-sm font-semibold ${open ? 'text-emerald-700' : 'text-slate-800'}`}>
                {open ? t('registration.open') : t('registration.closed')}
              </p>
              {open && <p className="font-inter text-xs text-slate-500">{t('registration.openHint')}</p>}
            </div>
            <Switch
              on={open}
              label={t('registration.switchLabel')}
              disabled={saving}
              onToggle={() => onChange({ open: !open })}
              onClass="bg-emerald-600"
              data-registration-switch="open"
            />
          </div>

          {!open && (
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="min-w-0">
                <p className="font-inter text-sm font-semibold text-slate-800">{t('registration.classLinks')}</p>
                <p className="font-inter text-xs text-slate-500">{t('registration.classLinksHint')}</p>
              </div>
              <Switch
                on={classLinks}
                label={t('registration.classLinks')}
                disabled={saving}
                onToggle={() => onChange({ classLinks: !classLinks })}
                onClass="bg-emerald-600"
                data-registration-switch="classLinks"
              />
            </div>
          )}

          {saving && <p role="status" className="font-inter text-xs text-slate-500">{t('registration.saving')}</p>}
        </div>
      ) : (
        loading && <p role="status" className="font-inter text-xs text-slate-500">{t('registration.loading')}</p>
      )}
      {error && <p role="alert" className="mt-2 font-inter text-xs text-rose-600">{error}</p>}
    </AdminCard>
  );
}

/** « التسجيل » sur l'accueil du panneau : ouvrir / fermer l'inscription publique, et le lien de classe. */
export default function RegistrationCard() {
  const { t } = useTranslation('admin');
  const { token } = useContext(AuthContext);
  const { data, loading, error: loadError, setData } = useAdminResource(fetchRegistration);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const onChange = async (change) => {
    setSaving(true);
    setError(null);
    try {
      const next = await changeRegistration(token, change, {
        confirm: (message) => window.confirm(message),
        confirmMessage: t('registration.confirmOpen'),
      });
      if (next) setData(next);
    } catch {
      setError(t('registration.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <RegistrationView
      t={t}
      registration={data}
      loading={loading}
      saving={saving}
      error={error ?? (loadError && t('registration.loadError'))}
      onChange={onChange}
    />
  );
}
