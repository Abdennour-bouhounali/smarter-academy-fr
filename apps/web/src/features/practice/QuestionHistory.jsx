import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import RichText from './RichText';
import { ToneIcon, TONE_STYLE } from './toneStyle';
import RedactionText from './exam/math/RedactionText';

/**
 * CE QUE L'ÉLÈVE A DÉJÀ FAIT dans cet exercice, juste au-dessus de la
 * question courante.
 *
 * Une frise, pas une pile de cartes : chaque question terminée est un nœud
 * (✓ / ✕ / ◐ — icône ET libellé, jamais la couleur seule) sur un rail qui
 * descend jusqu'à la question en cours. L'œil lit « étape faite → étape
 * suivante » sans que la page change de nature.
 *
 * Divulgation progressive, pour que la frise n'écrase jamais la question :
 *  - la question PRÉCÉDENTE est une carte « Question précédente » : énoncé entier,
 *    réponse, verdict, et le retour derrière « Voir l'explication » — c'est souvent
 *    sur son résultat que repose la question courante ;
 *  - les plus anciennes sont repliées sur une ligne (numéro, verdict, SA
 *    réponse), et se rouvrent d'un geste pour relire la question entière.
 *
 * La réponse affichée est celle de l'élève — c'est son propre travail, on
 * peut donc toujours la montrer. La solution de la question courante, elle,
 * n'apparaît nulle part ici.
 */

/** La réponse de l'élève : son écriture, isolée LTR ; un QCM passe par RichText. */
export function StudentAnswer({ answer }) {
  const { t } = useTranslation('student');
  if (!answer) return <span className="text-slate-400">{t('practice.history.noAnswer')}</span>;
  if (answer.kind === 'rich') return <RichText className="font-semibold text-slate-900">{answer.text}</RichText>;
  if (answer.kind === 'self') {
    return (
      <span className="min-w-0">
        <RedactionText text={answer.text} className="font-semibold text-slate-900" />
        {answer.mark && <span className="ms-2 text-xs text-slate-600">· {t(`practice.exam.selfCheck.recap.${answer.mark}`)}</span>}
      </span>
    );
  }

  return (
    <bdi dir="ltr" className="font-mono font-bold text-slate-900 tabular-nums break-all">{answer.text}</bdi>
  );
}

function HistoryItem({ entry, defaultOpen }) {
  const { t } = useTranslation('student');
  // Ouverte par défaut tant qu'elle est la PRÉCÉDENTE ; dès qu'une question
  // plus récente arrive, elle se replie d'elle-même — sauf si l'élève l'a
  // ouverte ou fermée lui-même : son geste l'emporte.
  const [override, setOverride] = useState(null);
  const open = override ?? defaultOpen;
  const style = TONE_STYLE[entry.tone];
  const panelId = `practice-history-${entry.questionId}`;

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative ps-10 sm:ps-11 pb-1 scroll-mt-20 lg:scroll-mt-6"
      data-question-history-line={entry.number}
      data-outcome={entry.tone}
    >
      {/* Le nœud sur le rail. Décoratif : le libellé du verdict est dans le bouton. */}
      <span
        aria-hidden="true"
        className={`absolute start-0 top-1.5 grid h-7 w-7 place-items-center rounded-full ${style.node}`}
      >
        <ToneIcon tone={entry.tone} className="h-4 w-4" />
      </span>

      <button
        type="button"
        onClick={() => setOverride(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full min-h-[40px] items-center gap-x-3 gap-y-1 rounded-lg px-2.5 py-1.5 text-start transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 motion-reduce:transition-none flex-wrap"
      >
        <span className="text-sm font-bold text-slate-700">{t('practice.questionNumber', { n: entry.number })}</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${style.chip}`}>
          {t(`practice.history.status.${entry.tone}`)}
        </span>
        <span className="flex min-w-0 flex-1 items-baseline gap-1.5 text-sm text-slate-600">
          <span className="shrink-0 text-slate-700">{t('practice.history.yourAnswer')}</span>
          <StudentAnswer answer={entry.answer} />
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div id={panelId} className="space-y-2 px-3 pb-1 pt-1 text-sm leading-relaxed">
          <p className="text-slate-700"><RichText>{entry.statement}</RichText></p>
          {entry.feedback && (
            <p className={`border-s-2 ps-3 text-slate-600 ${style.rule}`}>
              <RichText>{entry.feedback}</RichText>
            </p>
          )}
          {(entry.hintsUsed > 0 || entry.retried) && (
            <p className="text-xs text-slate-500">
              {[
                entry.hintsUsed > 0 ? t('practice.history.hintsUsed', { count: entry.hintsUsed }) : null,
                entry.retried ? t('practice.history.retried') : null,
              ].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      )}
    </motion.li>
  );
}

/**
 * « Question précédente » — la question qu'on vient de quitter, en RÉSUMÉ compact
 * (deuxième passe 2026-09-24 : plus de grande carte pour une question faite).
 *
 *   ✓ Question précédente · Question 1   [✓ Réponse juste]        Ta réponse : 6
 *   Trouve la plus grande valeur de x.              ← 2 lignes au plus, dépliable
 *   Voir l'explication ⌄
 *
 * Toujours visibles : le numéro, le verdict en toutes lettres, la RÉPONSE de
 * l'élève. L'énoncé est coupé à deux lignes ; « Voir l'explication » déplie l'énoncé
 * entier et le retour. C'est le contexte immédiat de la question courante,
 * posé juste au-dessus d'elle.
 */
function PreviousQuestionCard({ entry, total }) {
  const { t } = useTranslation('student');
  const [open, setOpen] = useState(false);
  const style = TONE_STYLE[entry.tone];
  const panelId = `practice-previous-${entry.questionId}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      tabIndex={-1}
      aria-labelledby={`${panelId}-title`}
      className="scroll-mt-20 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 lg:scroll-mt-6"
      data-question-history-item={entry.number}
      data-previous-question
      data-outcome={entry.tone}
    >
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <span aria-hidden="true" className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${style.badge}`}>
          <ToneIcon tone={entry.tone} className="h-3.5 w-3.5" />
        </span>
        <h3 id={`${panelId}-title`} className="text-sm font-bold text-slate-800">
          {t('practice.history.previous')}
          <span className="font-semibold text-slate-600"> · {t('practice.progress.questionOfShort', { current: entry.number, total })}</span>
        </h3>
        <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${style.chip}`}>
          {t(`practice.history.statusLong.${entry.tone}`)}
        </span>
        <span className="ms-auto flex items-baseline gap-1.5 text-sm text-slate-700">
          {t('practice.history.yourAnswer')}
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-base"><StudentAnswer answer={entry.answer} /></span>
        </span>
      </div>

      <p className={`mt-1.5 text-sm leading-relaxed text-slate-700 ${open ? '' : 'line-clamp-2'}`}>
        <RichText>{entry.statement}</RichText>
      </p>

      {(entry.feedback || entry.hintsUsed > 0 || entry.retried || entry.statement.length > 90) && (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={panelId}
            className="mt-0.5 inline-flex min-h-[36px] items-center gap-1 rounded-md text-sm font-bold text-nav-accent hover:text-indigo-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            {open ? t('practice.history.hideExplanation') : t('practice.history.showExplanation')}
            <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div id={panelId} className="space-y-1 pb-1 text-sm leading-relaxed">
              {entry.feedback && (
                <p className={`border-s-2 ps-3 text-slate-700 ${style.rule}`}><RichText>{entry.feedback}</RichText></p>
              )}
              {(entry.hintsUsed > 0 || entry.retried) && (
                <p className="text-xs text-slate-600">
                  {[
                    entry.hintsUsed > 0 ? t('practice.history.hintsUsed', { count: entry.hintsUsed }) : null,
                    entry.retried ? t('practice.history.retried') : null,
                  ].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </motion.article>
  );
}

export default function QuestionHistory({ entries, total }) {
  const { t } = useTranslation('student');
  if (!entries?.length) return null;
  const older = entries.slice(0, -1);
  const previous = entries[entries.length - 1];

  return (
    <section aria-label={t('practice.history.title')} className="space-y-2" data-question-history>
      {/* Les plus anciennes : une ligne chacune, sur un rail. Sur grand écran
          (`xl`), la colonne « Le fil de l'exercice » les porte déjà — on ne les répète
          pas au centre. Le rail passe par le CENTRE des nœuds : marge du
          `ol` + demi-nœud − demi-trait. */}
      {older.length > 0 && (
        <ol className="relative px-3 xl:hidden sm:px-5 before:absolute before:start-[25px] sm:before:start-[33px] before:top-3 before:bottom-4 before:w-0.5 before:bg-slate-200 before:content-['']">
          {older.map((entry) => (
            <HistoryItem key={entry.questionId} entry={entry} defaultOpen={false} />
          ))}
        </ol>
      )}
      <PreviousQuestionCard key={previous.questionId} entry={previous} total={total} />
    </section>
  );
}
