import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Wrench, Target, Sparkles } from 'lucide-react';
import { useDiagnosticSession } from '../../../hooks/useDiagnosticSession';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import SkillProfileList from '../../../components/diagnostic/SkillProfileList';
import RecommendationCard from '../../../components/diagnostic/RecommendationCard';

/**
 * The most important screen in the feature — no percentage, no letter
 * grade, no "Score: 72%". Arriving right from DiagnosticRun carries the
 * freshly-computed profile via router state (no extra request); arriving
 * any other way (direct link, refresh, "Voir mon profil" from the intro)
 * falls back to fetching the latest completed session's saved snapshot, so
 * this page never depends on how the student got here.
 */
export default function DiagnosticResult() {
  useDocumentMeta('Ton profil mathématique 6e', 'Tes points forts, ce qui est à renforcer, et ta prochaine mission.');
  const location = useLocation();
  const stateProfile = location.state?.profile;
  const { profile: fetchedProfile, loading, error } = useDiagnosticSession('6e', { autoStart: false });

  const profile = stateProfile ?? fetchedProfile;

  if (!profile && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="glass-card p-8 text-center max-w-sm">
          <p className="text-sm text-slate-500 mb-5">{error || "Tu n'as pas encore de profil — fais ton diagnostic pour en obtenir un."}</p>
          <Link to="/espace/diagnostic" className="btn-primary text-sm inline-flex">
            Faire le diagnostic
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-white mb-4"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
          >
            <Sparkles size={24} />
          </div>
          <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">Ton profil mathématique 6e</h1>
          <p className="font-inter text-slate-500 text-sm mt-2">Voici ce qu'on a appris sur toi aujourd'hui.</p>
        </motion.div>

        <div className="space-y-5 mb-7">
          <SkillProfileList
            icon={Star}
            title="Tes points forts"
            tone="emerald"
            items={profile.strengths}
            emptyLabel="On construit encore ton profil de forces — direction les fondamentaux pour commencer."
            delay={0.05}
          />
          <SkillProfileList icon={Wrench} title="À renforcer" tone="amber" items={profile.reinforce} delay={0.1} />
          <SkillProfileList icon={Target} title="À apprendre en priorité" tone="rose" items={profile.gaps} delay={0.15} />
        </div>

        <p className="font-inter text-sm text-slate-500 text-center mb-4">Voici par où je te conseille de commencer.</p>

        <RecommendationCard recommendation={profile.recommendation} />

        <div className="text-center mt-7">
          <Link to="/espace" className="text-xs font-inter text-slate-400 hover:text-slate-600 transition-colors">
            Plus tard, retourner à mon espace
          </Link>
        </div>
      </div>
    </div>
  );
}
