import { Fragment, useId } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { STAR_COUNT, masteryStage, practiceRatios } from './learningPointProgress';

/**
 * « Savoir-faire » — l'identité de ce que l'élève entraîne, en tête du lecteur.
 *
 *   SAVOIR-FAIRE
 *   Résoudre un problème avec la divisibilité…          ← le nom, en titre
 *   ★━━★━━☆  À consolider                           ← le CHEMIN de maîtrise
 *   1 / 10  exercices terminés   ▰▱▱   4 / 23  questions répondues ▰▱▱
 *
 * LE CHEMIN D'ÉTOILES — trois étoiles reliées, allumées selon l'état Mastery
 * V2 renvoyé par le serveur (learningPointProgress.js). Retenu parmi trois
 * pistes (chemin, constellation, jauge à arc) parce qu'il se lit comme une
 * PROGRESSION — « où j'en suis sur la route » — et non comme une note
 * « 3/5 » d'avis client. L'étoile suivante porte un anneau pointillé : c'est
 * l'étape en cours. Quand l'état monte (après un exercice), l'étoile se
 * remplit d'un petit ressort ; `MotionConfig reducedMotion="user"` du lecteur
 * le coupe si l'élève l'a demandé. Le libellé est celui de `student:mastery.*`
 * — jamais un pourcentage inventé.
 *
 * LES COMPTEURS — exercices et questions SÉPARÉS : un exercice peut compter
 * 2 questions, un autre 5. Vocabulaire d'ACHÈVEMENT (« terminés »,
 * « répondues »), jamais celui de la maîtrise.
 */
function StarPath({ stage }) {
  return (
    <span className="flex items-center" aria-hidden="true">
      {Array.from({ length: STAR_COUNT }, (_, i) => {
        const lit = i < stage;
        const next = i === stage;

        return (
          <Fragment key={i}>
            {i > 0 && <span className={`h-0.5 w-3.5 rounded-full ${i < stage ? 'bg-amber-400' : 'bg-slate-200'}`} />}
            <span className={`grid h-7 w-7 place-items-center rounded-full ${next ? 'border-2 border-dashed border-amber-300 motion-safe:animate-[pulse_2.4s_ease-in-out_infinite]' : 'border-2 border-transparent'}`}>
              <motion.span
                key={lit ? 'lit' : 'unlit'}
                initial={lit ? { scale: 0.4, rotate: -30 } : false}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                className="grid place-items-center"
              >
                <Star
                  className={`h-5 w-5 ${lit ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`}
                  strokeWidth={lit ? 1.5 : 2}
                />
              </motion.span>
            </span>
          </Fragment>
        );
      })}
    </span>
  );
}

function Metric({ done, total, ratio, label, bar, testId }) {
  return (
    <div className="min-w-0 space-y-1 xl:border-t xl:border-slate-100 xl:pt-2" data-lp-metric={testId}>
      <p className="flex flex-col xl:flex-row xl:flex-wrap xl:items-baseline xl:gap-x-1.5">
        <bdi dir="ltr" className="text-base font-bold tabular-nums text-slate-900 xl:text-lg">{done}{'\u00A0/\u00A0'}{total}</bdi>
        <span className="text-xs font-semibold leading-tight text-slate-600">{label}</span>
      </p>
      <span className="block h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <motion.span
          className={`block h-full rounded-full ${bar}`}
          initial={false}
          animate={{ width: `${Math.round(ratio * 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </span>
    </div>
  );
}

/**
 * @param {object} point         une ligne `learningPoints[]` de l'aperçu de pratique
 * @param {boolean} [eyebrow]    le surtitre « Savoir-faire » (inutile dans une LISTE de points)
 * @param {'h2'|'h3'} [headingTag]
 */
export default function LearningPointProgress({ point, eyebrow = true, headingTag: Heading = 'h2' }) {
  const { t } = useTranslation('student');
  const titleId = useId();
  if (!point) return null;
  const stage = masteryStage(point);
  const stateKey = ['unassessed', 'gap', 'reinforce', 'mastered'][stage];
  const { exercises, questions } = practiceRatios(point.practice);

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-2xl bg-white p-3.5 ring-1 ring-slate-200"
      data-learning-point={point.code}
      data-mastery-stage={stage}
    >
      {eyebrow && <p className="text-xs font-bold text-nav-accent">{t('practice.lp.eyebrow')}</p>}
      {/* Un nom long (« Résoudre un problème avec la divisibilité… ») tient en deux
          lignes sous `xl` — la question doit rester près du haut de l'écran ;
          le nom entier reste dans `title` et s'affiche dans la colonne. */}
      <Heading
        id={titleId}
        title={point.title || undefined}
        className="mt-0.5 line-clamp-2 text-base font-bold leading-snug text-slate-900 xl:line-clamp-none"
      >
        {point.title || t('practice.lp.untitled')}
      </Heading>

      {/* Sous `xl` : chemin d'étoiles et compteurs sur UNE rangée. Dans la
          colonne (`xl`) : le chemin, puis les deux compteurs dessous. */}
      <div className="mt-2 grid grid-cols-[auto_1fr_1fr] items-end gap-x-3 gap-y-2 xl:grid-cols-2">
        <div
          className="flex flex-col items-start gap-0.5 xl:col-span-2 xl:flex-row xl:flex-wrap xl:items-center xl:gap-x-2.5"
          role="img"
          aria-label={t('practice.lp.starsAria', { state: t(`mastery.${stateKey}`), stage, total: STAR_COUNT })}
        >
          <StarPath stage={stage} />
          <span className="text-xs font-bold text-slate-800 xl:text-sm">{t(`mastery.${stateKey}`)}</span>
        </div>

        {point.practice && (
          <>
            <Metric {...exercises} label={t('practice.lp.exercises')} bar="bg-indigo-500" testId="exercises" />
            <Metric {...questions} label={t('practice.lp.questions')} bar="bg-sky-500" testId="questions" />
          </>
        )}
      </div>
    </section>
  );
}
