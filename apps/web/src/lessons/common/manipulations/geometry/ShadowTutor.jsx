import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, Lightbulb, MessageCircle, Target, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Le PANNEAU DU TUTEUR de « ساحة الحيّ » (shadow-world) — refondu le 2026-10-13 à la demande du propriétaire :
 * « l'interaction avec les questions de مقران doit être claire, facile, et faire progresser ».
 *
 * Trois zones, de haut en bas, et JAMAIS deux questions à l'écran en même temps :
 *
 *   1. La PROGRESSION — « أسئلة مقران » : un point par question (faite ✓, courante, à venir, inutile —).
 *   2. Le FIL — la conversation : les observations de مقران et les réponses de l'élève (bulles ✓ / ✗), pour que
 *      question → réponse → retour reste lisible. Les 3 derniers messages (2 sur téléphone), le reste se déplie.
 *   3. UNE CARTE ÉPINGLÉE, l'une OU l'autre :
 *        • « سؤال مقران » — la seule question de l'écran, en gros, ses options en gros boutons, « سؤال 2 من 5 » ;
 *          une option fausse essayée est désactivée (« جرّبتَ هذا ») sous l'explication qui vient de tomber dans le
 *          fil : on progresse en lisant, pas en devinant ;
 *        • « مهمّتك الآن » — UNE consigne concrète dans le monde, jamais une question (on ne peut pas y répondre).
 *      Le bouton « تلميح » ouvre les paliers d'indices DANS la carte (1/3, 2/3, 3/3) sans effacer le fil.
 *
 * Une réaction peut porter une ACTION (ex. « أبعِد العصا » quand l'ombre du bâton est avalée) : un bouton sous le
 * dernier message, pour qu'une consigne de مقران ne soit jamais une impasse.
 *
 * Le panneau ne connaît aucune mathématique : ShadowWorld lui passe des nœuds déjà formatés. Chaque composant
 * porte son propre `useTranslation` (garde `i18nHookScope.test.js`) — jamais un `t` reçu en prop.
 *
 * DOM : [data-sw-companion][data-msg] (id du message de la carte), [data-sw-progress] > [data-sw-step=<id>][data-status],
 * [data-sw-thread] > [data-sw-entry=maqran|you][data-tone], [data-sw-card=question|task], [data-sw-quiz=<id>],
 * [data-sw-quiz-option=<id>][data-tried], [data-sw-help=<level>], [data-sw-hint], [data-sw-action=<id>].
 */
export default function ShadowTutor({
  avatar, narrow, progress, showProgress = true, thread, card, hint, onHint, onPick, action,
}) {
  const { t: tr } = useTranslation('lesson');
  const t = useCallback((key, o) => tr(`manipulation.shadowWorld.${key}`, o), [tr]);
  const [open, setOpen] = useState(false);
  const shown = open ? thread : thread.slice(narrow ? -2 : -3);
  const hidden = thread.length - shown.length;
  const endRef = useRef(null);
  useEffect(() => {
    if (open && endRef.current?.scrollIntoView) endRef.current.scrollIntoView({ block: 'nearest' });
  }, [open, thread.length]);

  const doneCount = progress.filter((p) => p.status === 'done').length;
  const counted = progress.filter((p) => p.status !== 'skipped').length;

  return (
    <section className="space-y-2 rounded-2xl border-2 border-teal-200 bg-white p-2.5 shadow-sm" data-sw-companion data-msg={card.msgId} aria-label={t('companion')}>
      {/* en-tête : مقران + la progression des questions */}
      <header className="flex items-center gap-2">
        {avatar}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-teal-800">{t('companion')} <span className="text-xs font-normal text-slate-500">· {t('companionRole')}</span></p>
          {showProgress && (
          <div className="flex items-center gap-1.5" data-sw-progress={`${doneCount}/${counted}`}>
            <span className="text-[11px] font-bold text-slate-500">{t('progressLabel')}</span>
            <ol className="flex items-center gap-1" aria-label={t('progressLabel')}>
              {progress.map((p) => (
                <li key={p.id} data-sw-step={p.id} data-status={p.status}
                  className={`h-2.5 rounded-full transition-all ${
                    p.status === 'done' ? 'w-2.5 bg-emerald-500'
                      : p.status === 'current' ? 'w-5 bg-teal-500 ring-2 ring-teal-200'
                        : p.status === 'skipped' ? 'w-2.5 bg-slate-200'
                          : 'w-2.5 border border-slate-300 bg-white'}`}
                  aria-label={p.status} />
              ))}
            </ol>
          </div>
          )}
        </div>
      </header>

      {/* le fil de la conversation */}
      {thread.length > 0 && (
        <div className="space-y-1.5" data-sw-thread={thread.length}>
          {hidden > 0 && (
            <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:underline">
              <ChevronUp className="h-3 w-3" aria-hidden="true" /> {t('threadMore')} ({hidden})
            </button>
          )}
          <ol className={`space-y-1.5 ${open ? 'max-h-64 overflow-y-auto pe-1' : ''}`} aria-live="polite">
            {shown.map((e) => (
              <li key={e.key} data-sw-entry={e.who} data-tone={e.tone ?? ''} className={`flex ${e.who === 'you' ? 'justify-end' : 'justify-start'}`}>
                {e.who === 'you' ? (
                  <p className={`max-w-[85%] rounded-2xl rounded-se-sm px-3 py-1.5 text-sm font-bold ${
                    e.tone === 'right' ? 'bg-emerald-600 text-white' : e.tone === 'wrong' ? 'bg-rose-100 text-rose-900' : 'bg-slate-100 text-slate-800'}`}>
                    <span className="me-1 text-[10px] font-extrabold uppercase opacity-80">{t('you')}</span>
                    {e.node}
                    {e.tone === 'right' && <Check className="ms-1 inline h-3.5 w-3.5" aria-hidden="true" />}
                    {e.tone === 'wrong' && <X className="ms-1 inline h-3.5 w-3.5" aria-hidden="true" />}
                  </p>
                ) : (
                  <p className="max-w-[92%] rounded-2xl rounded-ss-sm bg-teal-50 px-3 py-1.5 text-sm leading-relaxed text-slate-900">
                    <MessageCircle className="me-1 inline h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                    {e.node}
                  </p>
                )}
              </li>
            ))}
          </ol>
          {open && thread.length > (narrow ? 2 : 3) && (
            <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:underline">
              <ChevronDown className="h-3 w-3" aria-hidden="true" /> {t('threadLess')}
            </button>
          )}
          {action && (
            <button type="button" onClick={action.onClick} data-sw-action={action.id}
              className="min-h-[40px] rounded-xl border-2 border-amber-500 bg-amber-50 px-3 py-1.5 text-sm font-extrabold text-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
              {action.label}
            </button>
          )}
          <span ref={endRef} />
        </div>
      )}

      {/* la carte épinglée : UNE question, ou UNE mission */}
      {card.type === 'question' ? (
        <div className="space-y-2 rounded-xl border-2 border-teal-500 bg-teal-50/60 p-2.5" data-sw-card="question" data-sw-quiz={card.quizId} role="group" aria-labelledby="sw-question-text">
          <p className="flex items-center justify-between gap-2 text-[11px] font-extrabold text-teal-700">
            <span>{t('questionLabel')}</span>
            <span className="rounded-full bg-white px-2 py-0.5">{t('questionStep', { n: card.step, total: card.total })}</span>
          </p>
          <p id="sw-question-text" className={`${narrow ? 'text-[15px]' : 'text-base'} font-extrabold leading-relaxed text-slate-900`}>{card.prompt}</p>
          <div className={`grid gap-1.5 ${card.options.length > 2 ? '' : 'grid-cols-2'}`}>
            {card.options.map((o) => (
              <button key={o.id} type="button" onClick={() => onPick(o.id)} disabled={o.tried} data-sw-quiz-option={o.id} data-tried={o.tried ? 'true' : 'false'}
                aria-pressed={false}
                className={`min-h-[48px] rounded-xl border-2 px-3 py-2 text-start text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  o.tried ? 'cursor-not-allowed border-rose-200 bg-rose-50 text-rose-400 line-through' : 'border-teal-400 bg-white text-teal-950 hover:border-teal-600 hover:bg-teal-50'}`}>
                {o.label}
                {o.tried && <span className="ms-1 text-[10px] font-bold no-underline">({t('triedWrong')})</span>}
              </button>
            ))}
          </div>
          <HintRow hint={hint} onHint={onHint} />
        </div>
      ) : (
        <div className="space-y-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-2.5" data-sw-card="task">
          <p className="flex items-center gap-1 text-[11px] font-extrabold text-slate-600"><Target className="h-3.5 w-3.5" aria-hidden="true" /> {t('taskLabel')}</p>
          <p className={`${narrow ? 'text-sm' : 'text-[15px]'} font-bold leading-relaxed text-slate-900`}>{card.prompt}</p>
          <HintRow hint={hint} onHint={onHint} />
        </div>
      )}
    </section>
  );
}

/** « تلميح » : les paliers s'ouvrent DANS la carte, le fil reste intact. */
function HintRow({ hint, onHint }) {
  const { t: tr } = useTranslation('lesson');
  const t = (key, o) => tr(`manipulation.shadowWorld.${key}`, o);
  return (
    <div className="space-y-1">
      {hint.level > 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-sm text-amber-950" data-sw-hint={hint.level}>
          <span className="me-1 text-[11px] font-extrabold text-amber-700">{t('hintStep', { n: hint.level })}</span>
          {hint.node}
        </p>
      )}
      <button type="button" onClick={onHint} data-sw-help={hint.level}
        className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
        <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" /> {hint.level === 0 ? t('hintBtn') : t('hintMore')}
      </button>
    </div>
  );
}
