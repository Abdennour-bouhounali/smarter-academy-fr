import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, CheckCircle, Clock } from 'lucide-react';
import { submitContactRequest } from '../../services/contactService';

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'abdennour.bouhounali@gmail.com',
    href: 'mailto:abdennour.bouhounali@gmail.com',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Clock,
    label: 'Délai de réponse',
    value: 'Sous 48h ouvrées',
    href: null,
    color: 'from-purple-500 to-indigo-500',
  },
];

export default function ContactSection() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    objectif: 'Question générale',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      await submitContactRequest(form);
      setSubmitted(true);
      setForm({ name: '', email: '', objectif: 'Question générale', message: '' });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-wrapper">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left — Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h3 className="font-space font-bold text-xl text-slate-800 mb-2">Une question ? Écris-nous</h3>
            <p className="font-inter text-slate-500 text-sm leading-relaxed mb-6">
              Pour toute question sur la plateforme, les tarifs ou un problème technique — nous répondons personnellement à chaque message.
            </p>

            {contactInfo.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="glass-card p-4 flex items-center gap-4"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${item.color}`}>
                  <item.icon size={18} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-inter text-xs text-slate-400 mb-0.5">{item.label}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="font-inter text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors break-words"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-inter text-sm font-medium text-slate-700 break-words">{item.value}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right — Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="glass-card p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <CheckCircle size={56} className="text-green-500 mb-4" />
                    </motion.div>
                    <h4 className="font-space font-bold text-slate-800 text-lg mb-2">Message bien reçu !</h4>
                    <p className="font-inter text-slate-600 text-sm mb-6">
                      Merci pour votre message. Nous vous répondrons sous 48h ouvrées.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-secondary text-sm"
                    >
                      Envoyer un autre message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {errorMsg && (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-inter text-sm mb-4">
                        {errorMsg}
                      </div>
                    )}
                    <div>
                      <label htmlFor="contact-name" className="block font-inter text-sm font-medium text-slate-700 mb-1">
                        Nom *
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Ton nom"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 font-inter text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block font-inter text-sm font-medium text-slate-700 mb-1">
                        Email *
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="ton@email.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 font-inter text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-objectif" className="block font-inter text-sm font-medium text-slate-700 mb-1">
                        Sujet
                      </label>
                      <select
                        id="contact-objectif"
                        name="objectif"
                        value={form.objectif}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-inter text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                      >
                        <option value="Question générale">Question générale</option>
                        <option value="Tarifs et abonnement Premium">Tarifs et abonnement Premium</option>
                        <option value="Problème technique">Problème technique</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block font-inter text-sm font-medium text-slate-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={4}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Ta question ou ton message..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 font-inter text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-70"
                      style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Envoyer le message
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
