import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Send, CheckCircle, Inbox, MailOpen, Reply, Sparkles } from 'lucide-react';
import { submitContactRequest } from '../../services/contactService';
import { ArrowForward } from '../common/DirectionalIcons';
import { usePayments } from '../../context/PaymentsContext';

// Les clés de sujet restent stables ; seul le libellé arabe est affiché.
// Le libellé est envoyé au serveur tel quel : la boîte de réception de
// l'administration l'affiche sans traduction.
const SUBJECTS = ['general', 'pricing', 'technical', 'other'];
const MESSAGE_MAX = 5000;
const CONTACT_EMAIL = 'contact@smarter-academy.com';

const STEPS = [
  { key: 'received', icon: Inbox },
  { key: 'read', icon: MailOpen },
  { key: 'answer', icon: Reply },
];

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 font-inter text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nav-accent/30 focus:border-blue-400 transition-all';

const EMPTY_FORM = { name: '', email: '', phone: '', message: '' };

export default function ContactSection() {
  const { t } = useTranslation('marketing');
  // Payments closed: no « prices » subject — there is nothing to price (§4ter).
  const { paymentsOpen } = usePayments();
  const subjects = paymentsOpen ? SUBJECTS : SUBJECTS.filter((key) => key !== 'pricing');
  const [form, setForm] = useState(EMPTY_FORM);
  const [subject, setSubject] = useState('general');
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
      await submitContactRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        objectif: t(`contact.subjects.${subject}`),
        message: form.message.trim(),
      });
      setSubmitted(true);
      setForm(EMPTY_FORM);
      setSubject('general');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-wrapper">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
        {/* Panneau d'information : la promesse de réponse, en un coup d'œil */}
        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 relative overflow-hidden rounded-[20px] p-7 sm:p-9 text-white shadow-2xl shadow-indigo-500/20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-10 w-64 h-64 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative">
            <h2 className="font-space font-bold text-xl sm:text-2xl mb-8">{t('contact.stepsTitle')}</h2>

            <ol className="space-y-6">
              {STEPS.map((step, i) => (
                <motion.li
                  key={step.key}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm">
                      <step.icon size={18} className="text-white" />
                    </div>
                    {i < STEPS.length - 1 && (
                      <span aria-hidden="true" className="absolute top-12 start-1/2 -translate-x-1/2 w-px h-6 bg-white/30" />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className="font-inter font-semibold text-sm sm:text-base">{t(`contact.steps.${step.key}.title`)}</p>
                    <p className="font-inter text-white/75 text-sm leading-relaxed mt-1">{t(`contact.steps.${step.key}.body`)}</p>
                  </div>
                </motion.li>
              ))}
            </ol>

            <div className="mt-9 pt-7 border-t border-white/20">
              <p className="font-inter text-xs uppercase tracking-wider text-white/70 mb-2">{t('contact.emailLabel')}</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                dir="ltr"
                className="inline-flex items-center gap-2 font-inter font-semibold text-sm sm:text-base hover:underline underline-offset-4 break-all"
              >
                <Mail size={16} className="flex-shrink-0" />
                {CONTACT_EMAIL}
              </a>
            </div>

            <div className="mt-6 rounded-2xl bg-white/10 border border-white/20 p-4">
              <p className="font-inter text-sm text-white/85 leading-relaxed">{t('contact.faqHint')}</p>
              <Link
                to="/faq"
                className="mt-2 inline-flex items-center gap-1.5 font-inter text-sm font-semibold hover:gap-2.5 transition-all"
              >
                {t('contact.faqLink')}
                <ArrowForward size={15} />
              </Link>
            </div>
          </div>
        </motion.aside>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="glass-card p-6 sm:p-9">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  role="status"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-14 text-center"
                >
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                    <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
                      <CheckCircle size={40} className="text-emerald-500" />
                    </div>
                  </motion.div>
                  <h3 className="font-space font-bold text-slate-900 text-xl mb-2">{t('contact.successTitle')}</h3>
                  <p className="font-inter text-slate-600 text-sm leading-relaxed max-w-sm mb-8">{t('contact.successBody')}</p>
                  <button type="button" onClick={() => setSubmitted(false)} className="btn-secondary text-sm">
                    <Sparkles size={15} className="text-blue-500" />
                    {t('contact.sendAnother')}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-space font-bold text-slate-900 text-2xl mb-1">{t('contact.formTitle')}</h3>
                    <p className="font-inter text-slate-500 text-sm">{t('contact.formSubtitle')}</p>
                  </div>

                  {errorMsg && (
                    <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-inter text-sm">
                      {errorMsg}
                    </div>
                  )}

                  {/* Sujet : des pastilles plutôt qu'une liste déroulante, pour choisir en un geste */}
                  <fieldset>
                    <legend className="font-inter text-sm font-semibold text-slate-700 mb-2">{t('contact.subjectLabel')}</legend>
                    <div role="radiogroup" aria-label={t('contact.subjectLabel')} className="flex flex-wrap gap-2">
                      {subjects.map((key) => {
                        const selected = subject === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => setSubject(key)}
                            className={`px-4 py-2 rounded-full font-inter text-sm font-medium border transition-all duration-200 ${
                              selected
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md shadow-blue-500/25'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-nav-accent'
                            }`}
                          >
                            {t(`contact.subjects.${key}`)}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block font-inter text-sm font-semibold text-slate-700 mb-1.5">
                        {t('contact.nameLabel')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        minLength={2}
                        maxLength={100}
                        autoComplete="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder={t('contact.namePlaceholder')}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block font-inter text-sm font-semibold text-slate-700 mb-1.5">
                        {t('contact.emailFieldLabel')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        maxLength={255}
                        autoComplete="email"
                        dir="ltr"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        className={`${inputClass} text-start`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="block font-inter text-sm font-semibold text-slate-700 mb-1.5">
                      {t('contact.phoneLabel')}{' '}
                      <span className="font-normal text-slate-400">({t('contact.optional')})</span>
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      maxLength={50}
                      autoComplete="tel"
                      dir="ltr"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={t('contact.phonePlaceholder')}
                      className={`${inputClass} text-start`}
                    />
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between gap-3 mb-1.5">
                      <label htmlFor="contact-message" className="font-inter text-sm font-semibold text-slate-700">
                        {t('contact.messageLabel')} <span className="text-red-500">*</span>
                      </label>
                      <span dir="ltr" className="font-inter text-xs text-slate-400 tabular-nums">
                        {form.message.length}{'\u00A0/\u00A0'}{MESSAGE_MAX}
                      </span>
                    </div>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      minLength={10}
                      maxLength={MESSAGE_MAX}
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder={t('contact.messagePlaceholder')}
                      aria-describedby="contact-message-hint"
                      className={`${inputClass} resize-y min-h-[9rem]`}
                    />
                    <p id="contact-message-hint" className="font-inter text-xs text-slate-400 mt-1.5">
                      {t('contact.messageHint')}
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold font-inter text-white transition-all duration-300 disabled:opacity-70"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('contact.submitting')}
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        {t('contact.submit')}
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
