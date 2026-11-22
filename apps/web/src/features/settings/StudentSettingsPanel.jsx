import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Users, Volume2 } from 'lucide-react';
import { useEffectsPreference } from '../../lessons/common/hooks/useEffectsPreference';
import { AuthContext } from '../../context/AuthContext';
import { fetchStudentSettings, updateStudentSettings } from '../../services/studentSettingsService';

/**
 * « Réglages » — les réglages de l'élève, en FENÊTRE (propriétaire, 2026-10-06 :
 * « une fenêtre, pas une page » ; voir SettingsButton). Premier
 * réglage : les cinq niveaux de difficulté de l'espace d'exercices ouverts
 * d'emblée, pour l'élève qui n'a pas besoin de passer par les premiers.
 *
 * Un élève membre d'une classe VOIT le réglage mais ne le change pas : son
 * enseignant le décide, élève par élève (dossier élève côté enseignant). Le
 * serveur fait foi (`managedByTeacher`, refus 422).
 *
 * D'autres réglages s'ajouteront ici : une section par sujet.
 */
export default function StudentSettingsPanel() {
  const { t } = useTranslation('student');
  const { token } = useContext(AuthContext);
  const [state, setState] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  // « Son » : préférence de l'APPAREIL (comme le volume), pas du compte —
  // la même que les leçons (useEffectsPreference), désactivée par défaut.
  const { enabled: soundOn, toggle: toggleSound } = useEffectsPreference();

  useEffect(() => {
    if (!token) return;
    fetchStudentSettings(token).then(setState).catch((e) => setError(e.message));
  }, [token]);

  const toggle = async (value) => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      setState(await updateStudentSettings(token, { practiceLevelsOpen: value }));
      setSaved(true);
    } catch (e) {
      setError(e.reason === 'managed_by_teacher' ? t('settings.managedByTeacher') : e.message);
    } finally {
      setSaving(false);
    }
  };

  const open = Boolean(state?.settings?.practiceLevelsOpen);
  const managed = Boolean(state?.managedByTeacher);

  return (
    <div className="space-y-3" data-settings-panel>
      <p className="text-sm text-slate-600">{t('settings.subtitle')}</p>
      <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200" aria-labelledby="settings-practice" data-settings-practice>
        <h2 id="settings-practice" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Layers className="h-5 w-5 text-nav-accent" aria-hidden="true" /> {t('settings.practice.title')}
        </h2>

        {state === null && !error ? (
          <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
        ) : (
          <label className={`flex items-start gap-3 rounded-xl p-3 ring-1 ring-slate-200 ${managed ? 'bg-slate-50' : 'cursor-pointer hover:bg-slate-50'}`}>
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-slate-400 text-nav-accent focus:ring-nav-accent disabled:opacity-60"
              checked={open}
              disabled={managed || saving || state === null}
              onChange={(e) => toggle(e.target.checked)}
              data-setting="practiceLevelsOpen"
            />
            <span className="space-y-0.5">
              <span className="block font-bold text-slate-900">{t('settings.practice.levelsOpen')}</span>
              <span className="block text-sm text-slate-600">{t('settings.practice.levelsOpenHelp')}</span>
            </span>
          </label>
        )}

        {managed && (
          <p className="flex items-center gap-2 rounded-xl bg-nav-accent-soft px-3 py-2 text-sm text-indigo-900 ring-1 ring-indigo-100" data-settings-managed>
            <Users className="h-4 w-4 shrink-0" aria-hidden="true" /> {t('settings.managedByTeacher')}
          </p>
        )}
        {/* Qui corrige les photos de copie et les « Montrer que » (réglé par l'enseignant). */}
        {managed && (
          <p className="text-sm text-slate-700" data-settings-validation={state?.effectiveValidation ?? 'self'}>
            <span className="font-bold">{t('settings.practice.validation.label')} : </span>
            {t(`settings.practice.validation.${state?.effectiveValidation === 'teacher' ? 'teacher' : 'self'}`)}
          </p>
        )}
        {saved && <p className="text-sm font-semibold text-emerald-700" role="status">{t('settings.saved')}</p>}
        {error && <p className="text-sm font-semibold text-rose-700" role="alert">{error}</p>}
      </section>
      <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200" aria-labelledby="settings-sound" data-settings-sound>
        <h2 id="settings-sound" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Volume2 className="h-5 w-5 text-nav-accent" aria-hidden="true" /> {t('settings.sound.title')}
        </h2>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl p-3 ring-1 ring-slate-200 hover:bg-slate-50">
          <input type="checkbox" className="mt-1 h-5 w-5 rounded border-slate-400 text-nav-accent focus:ring-nav-accent" checked={soundOn} onChange={toggleSound} data-setting="sound" />
          <span className="space-y-0.5">
            <span className="block font-bold text-slate-900">{t('settings.sound.label')}</span>
            <span className="block text-sm text-slate-600">{t('settings.sound.help')}</span>
          </span>
        </label>
      </section>
    </div>
  );
}
