import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import RichText from './RichText';
import { StudentAnswer } from './QuestionHistory';
import { ToneIcon, TONE_STYLE } from './toneStyle';

/**
 * « سياق السؤال » — la colonne de CONTEXTE du lecteur, sur grand écran.
 *
 * Toutes les questions de l'exercice, dans l'ordre, chacune dans son état :
 *  - FAITE : ✓/✕/◐ + libellé, la réponse de l'élève ; un geste la déplie
 *    (énoncé entier, retour) — la question précédente se relit toujours ;
 *  - COURANTE : cerclée, « (الحالي) » ;
 *  - À VENIR : « سيظهر بعد السؤال n » — l'élève sait ce qui l'attend, sans
 *    rien en lire : l'énoncé d'une question future n'est PAS montré (elle
 *    peut contenir la réponse de la courante).
 *
 * Tout vient de l'historique (questionHistory.js) et du contenu : aucun état
 * propre à ce panneau hormis « déplié ». Sous `xl`, il n'est pas rendu : la
 * frise de la colonne centrale porte le même historique. (La carte « تذكّر »
 * de la première passe a été retirée : un conseil générique, répété à chaque
 * question, n'apprenait rien.)
 */
function DoneItem({ entry }) {
  const { t } = useTranslation('student');
  const [open, setOpen] = useState(false);
  const style = TONE_STYLE[entry.tone];
  const id = `practice-context-${entry.questionId}`;

  return (
    <li className={`rounded-xl ring-1 ${entry.tone === 'correct' ? 'bg-emerald-50/60 ring-emerald-200' : 'bg-white ring-slate-200'}`} data-context-item={entry.number} data-context-state="done">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <span aria-hidden="true" className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${style.badge}`}>
          <ToneIcon tone={entry.tone} className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1 space-y-0.5">
          <span className="block text-sm font-bold text-slate-800">{t('practice.questionNumber', { n: entry.number })}</span>
          <span className="flex items-baseline gap-1.5 text-xs text-slate-600">
            {t('practice.history.yourAnswer')} <StudentAnswer answer={entry.answer} />
          </span>
          <span className={`block text-xs font-bold ${style.text}`}>
            {t(`practice.history.status.${entry.tone}`)}
          </span>
        </span>
        <ChevronDown aria-hidden="true" className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id={id} className="space-y-1.5 px-3 pb-3 text-xs leading-relaxed text-slate-700">
          <p><RichText>{entry.statement}</RichText></p>
          {entry.feedback && <p className={`border-s-2 ps-2 text-slate-600 ${style.rule}`}><RichText>{entry.feedback}</RichText></p>}
        </div>
      )}
    </li>
  );
}

export default function QuestionContextPanel({ questions, questionIndex, history }) {
  const { t } = useTranslation('student');
  const byNumber = new Map(history.map((e) => [e.number, e]));

  return (
    <section aria-labelledby="practice-context-title" data-question-context>
      <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
        <h2 id="practice-context-title" className="mb-2 px-0.5 text-sm font-bold text-slate-900">{t('practice.context.title')}</h2>
        <ol className="space-y-1.5">
          {questions.map((q, i) => {
            const n = i + 1;
            const done = byNumber.get(n);
            if (done) return <DoneItem key={q.id} entry={done} />;

            if (i === questionIndex) {
              return (
                <li key={q.id} aria-current="step" className="flex items-start gap-2.5 rounded-xl bg-indigo-50/70 px-2.5 py-2 ring-2 ring-indigo-400" data-context-item={n} data-context-state="current">
                  <span aria-hidden="true" className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-[5px] border-nav-accent bg-white" />
                  <span className="space-y-0.5">
                    <span className="block text-sm font-bold text-indigo-900">
                      {t('practice.questionNumber', { n })} <span className="font-normal">{t('practice.context.current')}</span>
                    </span>
                    <span className="block text-xs text-slate-600">{t('practice.context.inProgress')}</span>
                  </span>
                </li>
              );
            }

            return (
              <li key={q.id} className="flex items-start gap-2.5 rounded-xl px-2.5 py-2 ring-1 ring-slate-100" data-context-item={n} data-context-state="upcoming">
                <span aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 border-slate-300 bg-white" />
                <span className="space-y-0.5">
                  <span className="block text-sm font-bold text-slate-500">{t('practice.questionNumber', { n })}</span>
                  <span className="block text-xs text-slate-500">{t('practice.context.upcoming', { n: i })}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

    </section>
  );
}
