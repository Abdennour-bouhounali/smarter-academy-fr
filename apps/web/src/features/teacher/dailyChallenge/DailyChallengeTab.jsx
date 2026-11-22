import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../../context/AuthContext';
import { fetchClassChallengeResults, fetchClassChallengeSettings } from '../../../services/teacher/dailyChallengeService';
import { Settings2 } from 'lucide-react';
import { Loading, ErrorBox, Fold } from '../../../pages/teacher/teacherUi';
import ClassChallengeResults from './ClassChallengeResults';
import ClassChallengeSettings from './ClassChallengeSettings';

/**
 * L'onglet « التحدّي اليومي » d'un قسم : les résultats du jour (ou d'un jour
 * choisi) et les réglages de la classe. Chargé à la demande, avec le
 * catalogue `challenge`, sous le <Suspense> de ClassGroupDetail.
 */
export default function DailyChallengeTab({ classGroup, onOpenPoint }) {
  const { t } = useTranslation('challenge');
  const { token } = useContext(AuthContext);
  const [date, setDate] = useState(null);
  const [results, setResults] = useState(null);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [r, s] = await Promise.all([
        fetchClassChallengeResults(token, classGroup.id, date),
        settings ? Promise.resolve(null) : fetchClassChallengeSettings(token, classGroup.id),
      ]);
      setResults(r);
      if (s) setSettings(s);
    } catch (e) {
      setError(e.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, classGroup.id, date]);
  useEffect(() => { if (token) load(); }, [token, load]);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!results || !settings) return <Loading />;

  return (
    <div className="space-y-4" data-daily-challenge-tab>
      {/* The RESULTS are the page; the settings are set once and stay one tap away (they were a 4,000 px column). */}
      <div className="min-w-0" title={t('teacher.intro')}>
        <ClassChallengeResults classGroupId={classGroup.id} data={results} onOpenPoint={onOpenPoint} onDate={setDate} />
      </div>
      <Fold name="challenge-settings" icon={Settings2} title={t('teacher.settings.title')} hint={settings.settings.enabled ? t('teacher.settings.enabled') : undefined}>
        <ClassChallengeSettings classGroupId={classGroup.id} initial={settings.settings} options={settings.options} onSaved={() => load()} />
      </Fold>
    </div>
  );
}
