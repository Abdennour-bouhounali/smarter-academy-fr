import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Trophy } from 'lucide-react';
import Medal from './Medal';
import { rankFor } from '../exam/medals';

/**
 * « خزانة الميداليات » — la page des niveaux (prototype BEM, 2026-10-06) : les
 * médailles gagnées dans la leçon, le RANG atteint et ce qu'il manque pour le
 * suivant, et la règle en une ligne (ce qui rapporte l'or).
 */
export default function MedalCabinet({ medals }) {
  const { t } = useTranslation('student');
  const total = medals?.total ?? { gold: 0, silver: 0, bronze: 0, points: 0 };
  const r = rankFor(total.points);

  return (
    <section className="rounded-2xl bg-gradient-to-l from-amber-50 via-white to-white p-4 ring-1 ring-amber-200 sm:p-5" aria-labelledby="medal-cabinet-title" data-medal-cabinet>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 id="medal-cabinet-title" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Trophy className="h-5 w-5 text-amber-600" aria-hidden="true" /> {t('practice.medals.cabinet.title')}
          </h2>
          <p className="text-sm text-slate-700">
            {t('practice.medals.cabinet.rankIs')} <span className="font-bold text-[#1f5c4c]" data-rank={r.rank}>{t(`practice.medals.rank.${r.rank}`)}</span>
            {' · '}<bdi dir="ltr" className="font-bold tabular-nums">{total.points}</bdi> {t('practice.medals.points')}
          </p>
          <div className="w-64 max-w-full space-y-0.5">
            <span className="block h-2 overflow-hidden rounded-full bg-amber-100" aria-hidden="true">
              <motion.span
                className="block h-full rounded-full bg-gradient-to-l from-amber-400 to-[#1f5c4c]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(r.progress * 100)}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            </span>
            <p className="text-xs text-slate-600">
              {r.next ? t('practice.medals.cabinet.toNext', { count: r.toNext, next: t(`practice.medals.rank.${r.next}`) }) : t('practice.medals.cabinet.top')}
            </p>
          </div>
        </div>
        <div className="flex items-end gap-4">
          {['gold', 'silver', 'bronze'].map((m, i) => (
            <motion.div
              key={m}
              className="flex flex-col items-center"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * i, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <Medal medal={m} size={m === 'gold' ? 46 : 38} shine={m === 'gold' && total.gold > 0} title={t(`practice.medals.name.${m}`)} />
              <bdi dir="ltr" className="text-lg font-bold tabular-nums text-slate-900" data-cabinet-count={m}>{total[m]}</bdi>
            </motion.div>
          ))}
        </div>
      </div>
      <p className="mt-3 border-t border-amber-200/70 pt-2 text-xs text-slate-600">{t('practice.medals.rules')}</p>
    </section>
  );
}
