import Hero from '../components/hero/Hero';
import { lazy, Suspense, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import MethodTeaser from '../components/home/MethodTeaser';
import TrustRelevanceSection from '../components/home/TrustRelevanceSection';
import FreePremiumTeaser from '../components/home/FreePremiumTeaser';
import SmarterEverydaySection from '../components/home/SmarterEverydaySection';
import CtaBanner from '../components/common/CtaBanner';
import { useTranslation } from 'react-i18next';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

// The banner reads the full catalogue (resume lesson): lazy, so the catalogue stays out of the entry
// chunk (BUNDLE_BOUNDARIES.md §3). It renders nothing for visitors and admins.
const StudentHomeBanner = lazy(() => import('../components/student/StudentHomeBanner'));

// Five sections, five jobs — Attention/Curiosity/Experience (Hero),
// Understanding (MethodTeaser), Trust/Relevance (TrustRelevanceSection),
// Desire (FreePremiumTeaser + SmarterEveryday), Action (CtaBanner).
// Nothing here repeats what another visitor page already owns: the full
// methodology lives on /methode, the full pricing on /tarifs, the mission
// on /about — Home experiences the idea, it doesn't re-explain it.
export default function Home() {
  const { t } = useTranslation('marketing');
  const { user } = useContext(AuthContext);

  useDocumentMeta(t('home.metaTitle'), t('home.metaDescription'));

  return (
    <>
      <Hero />
      {user?.role === 'student' && (
        <Suspense fallback={null}>
          <StudentHomeBanner />
        </Suspense>
      )}
      <MethodTeaser />
      <TrustRelevanceSection />
      <FreePremiumTeaser />
      <SmarterEverydaySection />
      <CtaBanner
        eyebrow={t('home.ctaEyebrow')}
        title={t('home.ctaTitle')}
        subtitle={t('home.ctaBody')}
        primaryLabel={t('home.ctaButton')}
        primaryTo="/register"
      />
    </>
  );
}
