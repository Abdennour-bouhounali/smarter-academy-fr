import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardCheck, Layers, Settings as SettingsIcon } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { fetchClassStudentSettings, updateClassStudentSettings } from '../../../services/teacher/classGroupService';

/**
 * « Réglages de l'élève » — ce que l'enseignant règle pour CET élève (propriétaire,
 * 2026-10-06). Un élève de classe ne change pas ces réglages lui-même ; il les
 * voit sur sa page « Paramètres ». Réglages : les cinq niveaux de l'espace
 * d'exercices ouverts d'emblée ; « Mode de correction » — « Correction par le professeur » (ses
 * photos de copie et démonstrations attendent l'enseignant, page « Réponses
 * à corriger ») ou « Autocorrection » (il se corrige seul), 2026-10-06.
 */
const VALIDATIONS = ['teacher', 'self'];
export default function StudentSettingsCard({ classroomId, studentId }) {
  const { t } = useTranslation('teacher');
  const { token } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetchClassStudentSettings(token, classroomId, studentId).then(setSettings).catch((e) => setError(e.message));
  }, [token, classroomId, studentId]);

  const save = async (patch) => {
    setSaving(true);
    setError(null);
    try {
      setSettings(await updateClassStudentSettings(token, classroomId, studentId, patch));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-nav-line bg-white space-y-3 p-5" data-student-settings>
      <h2 className="flex items-center gap-2 font-space font-bold text-slate-900">
        <SettingsIcon className="h-4 w-4 text-slate-600" aria-hidden="true" /> {t('studentSettings.title')}
      </h2>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl p-3 ring-1 ring-slate-200 hover:bg-slate-50">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 rounded border-slate-400 text-nav-accent focus:ring-nav-accent disabled:opacity-60"
          checked={Boolean(settings?.practiceLevelsOpen)}
          disabled={settings === null || saving}
          onChange={(e) => save({ practiceLevelsOpen: e.target.checked })}
          data-setting="practiceLevelsOpen"
        />
        <span className="space-y-0.5">
          <span className="flex items-center gap-1.5 font-bold text-slate-900"><Layers className="h-4 w-4 text-nav-accent" aria-hidden="true" /> {t('studentSettings.levelsOpen')}</span>
          <span className="block text-sm text-slate-600">{t('studentSettings.levelsOpenHelp')}</span>
        </span>
      </label>
      <fieldset className="space-y-2 rounded-xl p-3 ring-1 ring-slate-200" data-setting="practiceValidation">
        <legend className="flex items-center gap-1.5 px-1 font-bold text-slate-900">
          <ClipboardCheck className="h-4 w-4 text-nav-accent" aria-hidden="true" /> {t('studentSettings.validation.title')}
        </legend>
        <p className="text-sm text-slate-600">{t('studentSettings.validation.help')}</p>
        {VALIDATIONS.map((value) => (
          <label key={value} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-slate-50">
            <input
              type="radio"
              name={`validation-${studentId}`}
              value={value}
              className="mt-1 h-4 w-4 border-slate-400 text-nav-accent focus:ring-nav-accent disabled:opacity-60"
              checked={(settings?.practiceValidation ?? 'self') === value}
              disabled={settings === null || saving}
              onChange={() => save({ practiceValidation: value })}
              data-validation={value}
            />
            <span className="space-y-0.5">
              <span className="block font-semibold text-slate-900">{t(`studentSettings.validation.${value}`)}</span>
              <span className="block text-sm text-slate-600">{t(`studentSettings.validation.${value}Help`)}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {error && <p className="text-sm font-semibold text-rose-700" role="alert">{error}</p>}
    </section>
  );
}
