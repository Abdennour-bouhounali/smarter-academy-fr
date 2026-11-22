import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ScrollText } from 'lucide-react';
import { ArrowForward } from '../common/DirectionalIcons';
import { HOME_GRADES as ALL_GRADES, AVAILABLE_LESSON_COUNT } from '../../utils/gradeSummary';

/**
 * One section, two jobs: TRUST (a real, computed number — never a hardcoded
 * or invented stat — plus the one credibility line that matters) and
 * RELEVANCE (find your own grade). Kept together deliberately: "here's
 * proof this is real" and "here's yours" read as one thought, not two.
 */
export default function TrustRelevanceSection() {
  const { t } = useTranslation('marketing');
  const lessonCount = AVAILABLE_LESSON_COUNT;

  return (
    <section className="section-wrapper">
      <div className="max-w-5xl mx-auto">
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-3 flex items-center justify-center gap-1.5">
            <ScrollText size={13} />
            {t('trust.title')}
          </p>
          <h2 className="section-title !mb-3">{t('trust.subtitle')}</h2>
          {/* No lesson is open yet: a sentence that says so, never « 0 leçon ». */}
          <p className="font-inter text-slate-500 text-base">
            {lessonCount > 0 ? t('trust.lessonsAvailable', { lessonCount }) : t('trust.lessonsNone')}
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-2.5"
        >
          {ALL_GRADES.map((grade) => {
            // 3e: the grade whose lessons are being written first.
            const isFlagship = grade.id === '3e';
            return (
              <Link
                key={grade.id}
                to="/register"
                className={`px-5 py-3 rounded-2xl font-space font-bold text-sm transition-all ${
                  isFlagship
                    ? 'text-white shadow-md hover:-translate-y-0.5'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                style={isFlagship ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' } : {}}
              >
                {grade.name}
              </Link>
            );
          })}
        </m.div>

        <div className="text-center mt-8">
          <Link to="/courses" className="inline-flex items-center gap-2 font-inter text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            {t('trust.seeFullProgramme')}
            <ArrowForward size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
