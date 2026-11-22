import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, HelpCircle, CheckCircle2 } from 'lucide-react';

// Seuls les identifiants vivent ici : question et réponse sont résolues au
// rendu depuis le namespace `marketing` (faq.items.<id>.q / .a).
const FAQ_IDS = [
  'levels',
  'programme',
  'free',
  'activation',
  'noCard',
  'premiumVisible',
  'progress',
  'parents',
  'device',
];

export default function FAQSection() {
  const { t } = useTranslation('marketing');
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="section-wrapper pt-0">
      <div className="max-w-4xl mx-auto">
        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_IDS.map((id, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 6) * 0.05 }}
              className="glass-card overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
                className="w-full p-6 text-start flex items-center justify-between gap-4 font-space font-bold text-slate-800 text-base sm:text-lg hover:text-nav-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nav-accent focus-visible:ring-inset rounded-t-[20px]"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle size={20} className={`flex-shrink-0 transition-colors ${openIndex === i ? 'text-nav-accent' : 'text-blue-500'}`} />
                  {t(`faq.items.${id}.q`)}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === i ? 'rotate-180 text-nav-accent' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 font-inter text-slate-600 text-sm leading-relaxed border-t border-slate-100/80 flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-1" />
                      <div>{t(`faq.items.${id}.a`)}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
