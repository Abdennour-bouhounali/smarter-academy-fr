import Hero from '../components/hero/Hero';
import StudentHomeBanner from '../components/student/StudentHomeBanner';
import MethodTeaser from '../components/home/MethodTeaser';
import TrustRelevanceSection from '../components/home/TrustRelevanceSection';
import FreePremiumTeaser from '../components/home/FreePremiumTeaser';
import SmarterEverydaySection from '../components/home/SmarterEverydaySection';
import CtaBanner from '../components/common/CtaBanner';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

// Five sections, five jobs — Attention/Curiosity/Experience (Hero),
// Understanding (MethodTeaser), Trust/Relevance (TrustRelevanceSection),
// Desire (FreePremiumTeaser + SmarterEveryday), Action (CtaBanner).
// Nothing here repeats what another visitor page already owns: the full
// methodology lives on /methode, the full pricing on /tarifs, the mission
// on /about — Home experiences the idea, it doesn't re-explain it.
export default function Home() {
  useDocumentMeta(
    'Comprendre les mathématiques, pas les réciter',
    "Smarter Academy — une plateforme interactive pour manipuler, découvrir et maîtriser les mathématiques, du Collège au Lycée. Essaie sans compte."
  );

  return (
    <>
      <Hero />
      <StudentHomeBanner />
      <MethodTeaser />
      <TrustRelevanceSection />
      <FreePremiumTeaser />
      <SmarterEverydaySection />
      <CtaBanner
        eyebrow="Prêt à essayer ?"
        title="Commence à comprendre les maths dès aujourd'hui"
        subtitle="Crée ton compte gratuit — sans carte bancaire — et commence tout de suite."
        primaryLabel="Commencer gratuitement"
        primaryTo="/register"
      />
    </>
  );
}
