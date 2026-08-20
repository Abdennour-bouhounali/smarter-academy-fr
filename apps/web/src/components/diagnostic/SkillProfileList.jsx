import { motion } from 'framer-motion';

const TONES = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
};

/**
 * One group of the learning profile (strengths / à renforcer / gaps).
 * Renders skill labels only — never a percentage, never the raw
 * confidence number, and never which misconception was detected (that
 * metadata stays server-side; see DiagnosticEngine's profile builder).
 */
export default function SkillProfileList({ icon: Icon, title, tone, items, emptyLabel, delay = 0 }) {
  if (items.length === 0 && !emptyLabel) return null;
  const t = TONES[tone];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card p-5 sm:p-6">
      <h3 className="font-space font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
        {Icon && <Icon size={16} className={t.text} />}
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400 italic">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.skillId} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border ${t.bg} ${t.border}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.dot}`} aria-hidden="true" />
              <span className={`font-inter text-sm font-medium ${t.text}`}>{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
