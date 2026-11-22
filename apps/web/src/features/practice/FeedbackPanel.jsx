import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import RichText from './RichText';
import { outcomeTone } from './questionHistory';
import { ToneIcon, TONE_STYLE } from './toneStyle';

/**
 * Ce qu'on dit à l'élève après sa réponse.
 *
 * Jamais « Faux ». Quand l'évaluateur a reconnu une erreur de raisonnement
 * précise, c'est SON explication qui s'affiche — pas le message générique.
 * Et une réponse à moitié juste est nommée comme telle : « ton coefficient
 * directeur est bon » n'est ni un succès ni un échec.
 *
 * FORME (refonte 2026-09-24) : un verdict en titre, l'explication dessous,
 * une pastille-icône (✓ ✕ ◐ ?) et un filet sur le bord de DÉBUT — pas une
 * boîte entièrement colorée. Une réponse fausse prend l'orangé « à revoir »
 * de `toneStyle.jsx`, jamais le rouge d'alarme : c'est un moment
 * d'apprentissage, pas une sanction. `role="status"` annonce le verdict ;
 * le conteneur est focalisable (`tabIndex=-1`) pour que le lecteur y amène
 * le focus après « تحقّق من إجابتي » — le bouton qui l'avait disparaît.
 */

// Le VERDICT est la phrase la plus lue de tout l'espace d'exercices : elle
// s'affiche après CHAQUE réponse. Les clés vivent dans student.json
// (`practice.verdict.*`).
const TITLE_KEY = {
  correct: 'practice.verdict.correct',
  equivalent_correct: 'practice.verdict.equivalent_correct',
  partially_correct: 'practice.verdict.partially_correct',
  incorrect: 'practice.verdict.incorrect',
  syntax_error: 'practice.verdict.syntax_error',
  abandoned: 'practice.verdict.abandoned',
};

const FeedbackPanel = forwardRef(function FeedbackPanel({ evaluation, message, children }, ref) {
  const { t } = useTranslation('student');
  if (!evaluation) return null;
  const tone = outcomeTone(evaluation.outcome);
  const style = TONE_STYLE[tone];

  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      role="status"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      data-feedback={tone}
      className={`scroll-mt-20 rounded-xl border-s-4 px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 lg:scroll-mt-6 ${style.panel}`}
    >
      <div className="flex items-start gap-3">
        <motion.span
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${style.badge}`}
        >
          <ToneIcon tone={tone} className="h-4 w-4" />
        </motion.span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-bold text-slate-900">
            {TITLE_KEY[evaluation.outcome] ? t(TITLE_KEY[evaluation.outcome]) : ''}
          </p>
          {message ? (
            <p className="text-sm leading-relaxed text-slate-700"><RichText>{message}</RichText></p>
          ) : null}
          {children}
        </div>
      </div>
    </motion.div>
  );
});

export default FeedbackPanel;
