import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MotionConfig } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { fetchLadder } from '../../../services/thinkingLabService';
import LadderHome from '../../../features/thinkingLab/ladder/LadderHome';

/** « مختبر التفكير » — écran 1, l'échelle. Le serveur dit tout : les numéros, les états, la place libre. */
export default function ThinkingLadderPage() {
  const { t } = useTranslation('thinking');
  useDocumentMeta(t('meta.title'), t('meta.description'));
  const { token } = useContext(AuthContext);
  const [home, setHome] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setHome(await fetchLadder(token));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [token]);
  useEffect(() => { if (token) load(); }, [token, load]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
        {error && <p role="alert" className="rounded-2xl bg-slate-100 px-4 py-3 font-inter text-sm text-slate-700">{error}</p>}
        {!home && !error && <Loader2 className="mx-auto mt-16 animate-spin text-indigo-500" size={28} aria-label="…" />}
        {home && <LadderHome home={home} />}
      </div>
    </MotionConfig>
  );
}
