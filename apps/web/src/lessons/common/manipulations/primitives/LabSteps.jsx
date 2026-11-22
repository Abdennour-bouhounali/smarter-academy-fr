import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { playSfx } from '../../utils/playEffect';

/**
 * Les ÉTAPES d'un labo, lisibles, et la FÊTE quand une étape est faite (PROTOTYPE 2026-10-28 sur `gear-crank`, propriétaire : « les étapes 1 2 3
 * doivent être plus claires ; à chaque étape terminée, un message de succès façon jeu motive l'élève »). Partagé : à étendre à tous les labos.
 *
 * `<LabStepper count current done stepAttr />` — des pastilles reliées : faite (vert, coche), en cours (bleue, anneau), à venir (contour), et
 * « المهمة 2 من 3 ». `done` : un tableau de booléens ; `stepAttr` : l'attribut DOM de chaque pastille (contrat du labo, ex. `data-gc-step`).
 *
 * `const party = useStepCelebration()` puis `party.celebrate({ n, total })` quand une étape est VRAIMENT finie (pour un labo à questions :
 * après sa suite de questions) et `{party.node}` dans le conteneur `relative` du labo. Une carte au centre, emoji, « المهمة n مكتملة! »,
 * une phrase d'encouragement qui change, les étoiles de progression, des confettis ; elle part seule (2,2 s), ne capte aucun clic, et
 * `prefers-reduced-motion` coupe les animations. La dernière étape dit « أنهيت كل المهام! 🏆 ».
 *
 * Contrat DOM : [data-lab-stepper], [data-lab-step-current], [data-lab-celebration][data-step=<n>][data-final].
 */
export function LabStepper({ count, current, done, stepAttr = 'data-lab-step' }) {
  const { t } = useTranslation('lesson');
  return (
    <div className="flex flex-wrap items-center gap-3" data-lab-stepper role="list" aria-label={t('manipulation.steps.aria')}>
      <div className="flex items-center" dir="rtl">
        {Array.from({ length: count }, (_, i) => {
          const d = !!done[i];
          const cur = i === current;
          return (
            <React.Fragment key={i}>
              {i > 0 && <span className={`h-1 w-6 rounded-full ${done[i - 1] ? 'bg-emerald-400' : 'bg-slate-200'}`} aria-hidden="true" />}
              <span role="listitem" {...{ [stepAttr]: i }} data-done={d ? 'true' : 'false'} aria-current={cur ? 'step' : undefined}
                aria-label={t(d ? 'manipulation.steps.done' : cur ? 'manipulation.steps.current' : 'manipulation.steps.todo', { i: i + 1 })}
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black tabular-nums transition-all ${
                  d ? 'border-emerald-500 bg-emerald-500 text-white'
                    : cur ? 'scale-110 border-sky-600 bg-sky-500 text-white ring-4 ring-sky-200'
                      : 'border-slate-300 bg-white text-slate-400'}`}>
                {d ? <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" /> : <bdi dir="ltr">{i + 1}</bdi>}
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <span className="text-sm font-black text-sky-900" data-lab-step-current>
        {t('manipulation.steps.of', { i: Math.min(current + 1, count), n: count })}
      </span>
    </div>
  );
}

const EMOJI = ['🎉', '🚀', '🔥', '⭐', '💪'];
const CONFETTI = ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#0EA5E9', '#F43F5E', '#84CC16', '#A855F7'];

export function useStepCelebration() {
  const [party, setParty] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const celebrate = useCallback(({ n, total }) => {
    clearTimeout(timer.current);
    setParty({ n, total, key: Date.now() });
    playSfx(n >= total ? 'win' : 'step');
    timer.current = setTimeout(() => setParty(null), 2200);
  }, []);
  return { celebrate, node: <Celebration party={party} /> };
}

function Celebration({ party }) {
  const { t } = useTranslation('lesson');
  const reduce = useReducedMotion();
  const cheers = t('manipulation.steps.cheers', { returnObjects: true });
  return (
    <AnimatePresence>
      {party && (() => {
        const final = party.n >= party.total;
        const cheer = Array.isArray(cheers) ? cheers[(party.n - 1) % cheers.length] : '';
        return (
          <motion.div key={party.key} className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            data-lab-celebration data-step={party.n} data-final={final ? 'true' : 'false'} role="status" aria-live="polite">
            {!reduce && CONFETTI.flatMap((c, i) => [0, 1].map((j) => (
              <motion.span key={`${i}-${j}`} className="absolute top-1/2 h-3 w-2 rounded-sm" style={{ background: c, left: `${8 + ((i * 2 + j) * 6) % 84}%` }}
                initial={{ y: 0, rotate: 0, opacity: 1 }}
                animate={{ y: [0, -170 - ((i + j) % 4) * 30, 220], x: ((i % 2 ? 1 : -1) * (20 + j * 25)), rotate: 360 + i * 40, opacity: [1, 1, 0] }}
                transition={{ duration: 1.8, ease: 'easeOut' }} />
            )))}
            <motion.div className={`rounded-3xl px-8 py-5 text-center text-white shadow-2xl ring-4 ring-white/60 ${final ? 'bg-gradient-to-l from-amber-500 via-orange-500 to-rose-500' : 'bg-gradient-to-l from-emerald-500 via-teal-500 to-sky-500'}`}
              initial={reduce ? false : { scale: 0.6, y: 20 }} animate={{ scale: [0.6, 1.08, 1], y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
              <p className="text-5xl" aria-hidden="true">{final ? '🏆' : EMOJI[(party.n - 1) % EMOJI.length]}</p>
              <p className="mt-1 text-2xl font-black">{final ? t('manipulation.steps.allDone') : t('manipulation.steps.doneTitle', { i: party.n })}</p>
              <p className="mt-1 text-base font-bold text-white/90">{cheer}</p>
              <p className="mt-2 text-xl tracking-widest" aria-hidden="true">{'★'.repeat(party.n)}<span className="opacity-40">{'★'.repeat(Math.max(0, party.total - party.n))}</span></p>
            </motion.div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
}
