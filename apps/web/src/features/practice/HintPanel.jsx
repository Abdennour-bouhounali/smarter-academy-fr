import { useEffect, useState } from 'react';
import { ChevronDown, Lightbulb, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import RichText from './RichText';

/**
 * Les indices, un par un, et jamais avant qu'on les demande.
 *
 * Le contenu des indices ne descend pas avec la question : chaque appui
 * demande le suivant au serveur, qui le trace. On ne peut donc pas sauter au
 * troisième, et la progressivité tient par construction plutôt que par la
 * retenue de l'interface.
 *
 * Demander un indice n'est pas un aveu d'échec — le libellé le dit, et le
 * moteur de maîtrise le traite ainsi : une réussite aidée reste une
 * progression.
 *
 * FORME (refonte 2026-09-24, maquette) — visible sans dominer :
 *   💡 الإرشادات                                   ⌄ (repliable)
 *   ① ملاحظة   — le texte de l'indice révélé
 *   ② توجيه    [اطلب الإرشاد 2]      ← le SEUL bouton : le suivant
 *   ③ خطّة     🔒 يُفتح بعد الإرشاد 2
 * L'élève voit combien d'aides existent et de quelle NATURE (le `type` du
 * contenu : look / direction / strategy) — jamais leur contenu avant de le
 * demander. Aucune de ces étiquettes ne révèle la réponse.
 */
export default function HintPanel({ hints, remaining, hintTypes = [], onRequest, busy, disabled }) {
  const { t } = useTranslation('student');
  // Replié tant qu'aucun indice n'est demandé : UNE ligne « 💡 الإرشادات · 3
  // متاحة ». Il s'ouvre de lui-même dès qu'un indice arrive (y compris par le
  // raccourci « إرشاد » à côté de « تحقّق »), et l'élève peut le replier.
  const [open, setOpen] = useState(hints.length > 0);
  useEffect(() => { if (hints.length > 0) setOpen(true); }, [hints.length]);
  const total = hints.length + remaining;
  if (total === 0) return null;
  // Rien d'ouvert et plus rien à demander (question validée juste) : on se tait.
  if (disabled && hints.length === 0) return null;

  // Question close : seuls les indices déjà lus restent, comme trace.
  const slots = disabled ? hints.length : total;
  const typeOf = (i) => hints[i]?.type ?? hintTypes[i] ?? null;
  const typeLabel = (i) => (typeOf(i) ? t(`practice.hint.type.${typeOf(i)}`, { defaultValue: '' }) : '');

  const requestButton = (i) => (
    <button
      type="button"
      onClick={onRequest}
      disabled={busy}
      className="inline-flex min-h-[44px] flex-wrap items-center gap-x-2 rounded-lg px-3 py-1.5 text-sm font-bold text-amber-900 ring-1 ring-amber-300 bg-white transition-colors hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60 motion-reduce:transition-none"
      data-hint-request
    >
      <span className="whitespace-nowrap">{t('practice.hint.reveal', { n: i + 1 })}</span>
      {typeLabel(i) && <span className="whitespace-nowrap font-normal text-amber-700">· {typeLabel(i)}</span>}
    </button>
  );

  return (
    <section
      aria-label={t('practice.hint.title')}
      className="rounded-xl border border-amber-200/80 bg-amber-50/40 px-3 py-1 sm:px-3.5"
      data-hint-panel
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="practice-hint-ladder"
        data-hint-toggle
        className="flex w-full min-h-[44px] items-center gap-2 rounded-lg text-start text-sm font-bold text-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
        <span className="flex-1">
          {t('practice.hint.title')}
          {hints.length === 0 && !disabled && <span className="font-semibold text-amber-800"> · {t('practice.hint.available', { count: total })}</span>}
        </span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ol id="practice-hint-ladder" className="space-y-1 pb-2">
          {Array.from({ length: slots }, (_, i) => {
            const revealed = hints[i];
            const isNext = !revealed && i === hints.length;
            const label = typeLabel(i);

            return (
              <li key={i} className="flex items-start gap-2.5" data-hint-slot={i + 1} data-hint-state={revealed ? 'revealed' : isNext ? 'next' : 'locked'}>
                <span
                  aria-hidden="true"
                  className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    revealed ? 'bg-amber-400 text-amber-950' : 'bg-white text-amber-700 ring-1 ring-amber-200'
                  }`}
                >
                  {i + 1}
                </span>

                {revealed ? (
                  <motion.div
                    initial={{ opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="min-w-0 flex-1 pt-0.5 text-sm leading-relaxed text-slate-800"
                    role="status"
                  >
                    <span className="block text-xs font-bold text-amber-800">
                      {t('practice.hint.n', { n: i + 1 })}{label ? ` · ${label}` : ''}
                    </span>
                    <RichText>{revealed.content}</RichText>
                  </motion.div>
                ) : isNext && !disabled ? (
                  requestButton(i)
                ) : (
                  <span className="inline-flex min-h-[28px] items-center gap-1.5 pt-0.5 text-xs text-slate-600">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    {t('practice.hint.n', { n: i + 1 })}{label ? ` · ${label}` : ''}
                    <span className="sr-only"> — {t('practice.hint.locked', { n: i })}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {remaining === 0 && hints.length > 0 && (
        <p className="pb-2 text-xs text-slate-600">{t('practice.allHintsGiven')}</p>
      )}
    </section>
  );
}
