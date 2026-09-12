import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Lock, Crown } from 'lucide-react';
import { isLessonUnlocked } from '@smarter-academy/core';
import { useContentAvailability } from '../../context/ContentAvailabilityContext';
import { getLessonProgress } from '../../lessons/common/utils/progress/getLessonProgress';
import { getTotalModules } from '../../lessons/registry';

/**
 * The single lesson-tile renderer shared by the public /courses catalogue
 * and the student area (Mes cours, Explorer) — one place for the
 * available/premium-locked/coming-soon visual states instead of three
 * near-identical inline copies drifting apart.
 *
 * Premium gating goes through `isLessonUnlocked` (packages/core/lessonAccess.js)
 * rather than a local `tier !== 'premium'` check, so that once a real
 * `isPremiumUser` signal exists (subscription entitlement), only the call
 * site here needs to change — not the card markup or the three-state logic.
 *
 * Wrapped in forwardRef: callers render this directly inside
 * <AnimatePresence>, which attaches a ref to measure exit animations —
 * a plain function component can't accept that ref.
 */
const LessonCard = forwardRef(function LessonCard({ lesson, onClick }, ref) {
  // Le catalogue vient du bundle ; la PUBLICATION vient du serveur. Une leçon
  // retirée par l'administration retombe donc dans l'état « bientôt
  // disponible » déjà géré plus bas — l'élève voit un message qu'il connaît,
  // pas une carte cliquable qui le mènera à un refus.
  const { isLessonClosed, isLessonLocked, isLessonPremium, access } = useContentAvailability();
  const isAvailable = lesson.status === 'available' && !isLessonClosed(lesson.id);
  // Le droit d'accès vient du SERVEUR, jamais d'un état local : la carte ne
  // fait qu'afficher une décision déjà prise (GET /content/availability).
  //
  // Deux sources de palier, et c'est VOULU : le catalogue embarqué
  // (`lesson.tier`) et la liste `locked` du serveur. Le bundle peut être en
  // retard sur la base — une leçon rendue payante côté serveur reste `free`
  // dans le bundle jusqu'au prochain déploiement — et c'est justement le cas
  // où la carte mentirait à l'élève en affichant « Commencer » sur une leçon
  // qui refusera de s'ouvrir. Le serveur tranche donc en dernier.
  //
  // Tant que la réponse n'est pas arrivée, `locked` est vide et `access` nul :
  // la carte retombe sur le palier du bundle, politique d'ouverture identique
  // au reste du contexte.
  const hasPremium = access?.premiumAccess === true;
  // Le contenu est-il payant ? Question distincte de « l'élève y a-t-il
  // accès ». Le serveur tranche en dernier, comme pour le verrou.
  const isPremiumLesson = lesson.tier === 'premium' || isLessonPremium(lesson.id);
  const isUnlocked = isLessonUnlocked(lesson, { isPremiumUser: hasPremium })
    && !isLessonLocked(lesson.id);
  const { progressPercent } = isAvailable
    ? getLessonProgress(lesson.id, getTotalModules(lesson.id))
    : { progressPercent: 0 };

  if (isAvailable && !isUnlocked) {
    return (
      <motion.div ref={ref} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="h-full">
        <Link
          to="/tarifs"
          className="sa-premium-card-locked group relative rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full overflow-hidden"
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <span className="text-3xl opacity-80 group-hover:scale-110 transition-transform origin-bottom-left">{lesson.icon}</span>
              <span className="sa-premium-badge">
                <Lock size={10} />
                Premium
              </span>
            </div>
            <h4 className="font-space font-bold text-slate-800 text-lg mb-2">{lesson.title}</h4>
            <p className="font-inter text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">{lesson.description}</p>
          </div>
          <div className="pt-4 border-t border-violet-100 flex items-center justify-between mt-auto">
            <span className="flex items-center gap-1 text-xs font-mono-jetbrains text-slate-500"><Clock size={14} /> {lesson.duration}</span>
            <span className="font-bold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1 text-violet-700">Voir les tarifs →</span>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (isAvailable) {
    return (
      <motion.div ref={ref} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="h-full">
        <Link
          to={lesson.path}
          onClick={onClick}
          // Une leçon premium À LAQUELLE L'ÉLÈVE A ACCÈS reste une carte
          // OUVERTE : même fond blanc, même « Commencer », même clic. Seule
          // la bordure change, et c'est exactement l'intention — reconnaître
          // le contenu payant sans le faire passer pour verrouillé.
          className={`group relative bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full overflow-hidden ${
            isPremiumLesson
              ? 'sa-premium-card'
              : 'border-slate-200 hover:border-blue-300'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <span className="text-3xl group-hover:scale-110 transition-transform origin-bottom-left">{lesson.icon}</span>
              {/* Le palier reste affiché quand l'élève A l'accès : « c'est du
                  contenu premium, et mon compte y a droit » est une
                  information utile, et masquer le badge dès que l'accès est
                  ouvert ferait passer du payant pour du gratuit le jour où
                  l'abonnement s'arrête. La progression, quand elle existe,
                  prend la place — le badge passe alors sous le titre. */}
              {isPremiumLesson && progressPercent === 0 ? (
                <span className="sa-premium-badge" title="Contenu premium — ton compte y a accès">
                  <Crown size={10} />
                  Premium
                </span>
              ) : progressPercent > 0 ? (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono-jetbrains text-[10px] font-bold ${progressPercent >= 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                  {progressPercent >= 100 ? '✓ ' : ''}{progressPercent}%
                </span>
              ) : lesson.isNew ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-mono-jetbrains text-[10px] font-bold">NOUVEAU</span>
              ) : null}
            </div>
            {/* Une leçon d'EXTENSION n'est pas au programme officiel du niveau
                (elle vient d'`extension_objects`, pas d'`official_objects`) :
                l'élève doit le savoir avant de la commencer, et rien ne doit la
                présenter comme officielle. */}
            <div className="flex items-start justify-between gap-3">
              {lesson.origin === 'extension' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-full bg-violet-50 border border-violet-200 text-violet-700 font-mono-jetbrains text-[10px] font-bold" title="Chapitre ajouté par Smarter Academy — il ne figure pas au programme officiel de ce niveau">
                  HORS PROGRAMME
                </span>
              )}
            </div>
            {/* La pastille dit le PALIER du contenu, pas le droit de l'élève.
                Elle était verte et disait « Gratuit » sur TOUTE carte ouverte
                — y compris sur une leçon payante ouverte par un abonnement.
                Un abonné lisait donc « Gratuit » sur ce qu'il venait de payer,
                et n'aurait rien compris à sa disparition à l'échéance. */}
            <div className="flex items-center gap-2 mb-2">
              <h4 className={`font-space font-bold text-slate-900 text-lg transition-colors ${
                isPremiumLesson ? 'group-hover:text-violet-700' : 'group-hover:text-blue-600'
              }`}>{lesson.title}</h4>
              {isPremiumLesson ? (
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-violet-500" title="Premium" />
              ) : (
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500" title="Gratuit" />
              )}
            </div>
            <p className="font-inter text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">{lesson.description}</p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
            <span className="flex items-center gap-1 text-xs font-mono-jetbrains text-slate-500"><Clock size={14} /> {lesson.duration}</span>
            {/* La PROGRESSION prime sur le palier : « terminé » et « en cours »
                sont ce que l'élève vient chercher, le palier n'est qu'une
                étiquette. L'accent premium ne colore donc que le départ. */}
            <span className={`font-bold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1 ${
              progressPercent >= 100 ? 'text-emerald-600' : progressPercent > 0 ? 'text-blue-600' : isPremiumLesson ? 'text-violet-700' : 'text-blue-600'
            }`}>
              {progressPercent >= 100 ? 'Terminé' : progressPercent > 0 ? 'Continuer' : 'Commencer'} →
            </span>
          </div>
          {progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
              <div className={`h-full ${progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progressPercent}%` }} />
            </div>
          )}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div ref={ref} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="bg-slate-50/50 rounded-2xl border border-slate-200/50 p-5 flex flex-col justify-between opacity-75 h-full">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className="text-3xl grayscale opacity-50">{lesson.icon}</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/50 text-slate-500 font-mono-jetbrains text-[10px] font-semibold">
            <Lock size={10} />
            Bientôt
          </span>
        </div>
        <h4 className="font-space font-bold text-slate-700 text-lg mb-2">{lesson.title}</h4>
        <p className="font-inter text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">{lesson.description}</p>
      </div>
      <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between text-xs font-mono-jetbrains text-slate-400 mt-auto">
        <span className="flex items-center gap-1"><Clock size={14} /> {lesson.duration}</span>
        <span className="font-medium">En préparation</span>
      </div>
    </motion.div>
  );
});

export default LessonCard;
