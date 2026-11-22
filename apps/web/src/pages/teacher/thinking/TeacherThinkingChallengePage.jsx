import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MotionConfig } from 'framer-motion';
import { AuthContext } from '../../../context/AuthContext';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { fetchTeacherChallenge } from '../../../services/teacher/thinkingLabTeacherService';
import TeacherChallengeView from '../../../features/thinkingLab/teacher/TeacherChallengeView';
import { Loading, ErrorBox } from '../teacherUi';

/** « مختبر التفكير » — un défi en « معاينة الأستاذ » : tout ouvert, rien d'écrit (THINKING_LAB.md §8bis). */
export default function TeacherThinkingChallengePage() {
  const { t } = useTranslation('thinking');
  const { challengeId } = useParams();
  const { token } = useContext(AuthContext);
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);
  useDocumentMeta(challenge ? t('meta.challengeTitle', { number: challenge.number }) : t('teacher.title'));

  const load = useCallback((tuple = 0) => {
    setError(null);
    fetchTeacherChallenge(token, challengeId, tuple).then((d) => setChallenge(d.challenge), (e) => setError(e.status === 404 ? t('teacher.notFound') : e.message));
  }, [token, challengeId, t]);
  useEffect(() => { setChallenge(null); if (token) load(0); }, [token, challengeId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MotionConfig reducedMotion="user">
      <div className="sa-page py-6 sm:py-8">
        {error && (
          <div className="space-y-3">
            <ErrorBox message={error} onRetry={() => load(0)} />
            <Link to="/enseignant/tafkir" className="font-inter text-sm font-bold text-nav-accent hover:underline">{t('teacher.back')}</Link>
          </div>
        )}
        {!challenge && !error && <Loading />}
        {challenge && <TeacherChallengeView key={challenge.id} challenge={challenge} onTuple={load} />}
      </div>
    </MotionConfig>
  );
}
