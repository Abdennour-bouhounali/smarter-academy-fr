import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { fetchReviewCount } from '../../../services/teacher/answerReviewService';

/** L'événement que la page « تصحيح الإجابات » émet après une correction. */
export const REVIEWS_CHANGED = 'sa:reviews-changed';

/**
 * Le compteur « تصحيح الإجابات » du menu enseignant : relu à l'ouverture,
 * toutes les 2 minutes, au retour sur l'onglet, et après chaque correction.
 * Une panne garde le dernier nombre (un compteur, jamais un blocage).
 */
export function useReviewCount() {
  const { token } = useContext(AuthContext);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    const refresh = () => fetchReviewCount(token).then((n) => !cancelled && setCount(n)).catch(() => {});
    refresh();
    const timer = window.setInterval(refresh, 120000);
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    window.addEventListener(REVIEWS_CHANGED, refresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener(REVIEWS_CHANGED, refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [token]);

  return count;
}
