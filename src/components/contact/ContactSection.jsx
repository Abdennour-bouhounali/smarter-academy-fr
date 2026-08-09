import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle } from 'lucide-react';

const contactInfo = [
  {
    icon: Phone,
    label: 'Téléphone / WhatsApp',
    value: '+33 7 58 10 30 86',
    href: 'tel:+33758103086',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50'
  },
  {
    icon: Mail,
    label: 'Email direct',
    value: 'abdennour.bouhounali@gmail.com',
    href: 'mailto:abdennour.bouhounali@gmail.com',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50'
  },
  {
    icon: MapPin,
    label: 'Lieux d\'intervention',
    value: 'Toulouse, Paris & En Ligne (France)',
    href: null,
    color: 'from-red-400 to-pink-500',
    bg: 'bg-red-50'
  },
  {
    icon: MessageCircle,
    label: 'Réponse rapide',
    value: 'Sous 24h ouvrées',
    href: null,
    color: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-50'
  }
];

export default function ContactSection() {
  const [form, setForm] = useState({
    name: '',
    classe: 'Terminale Spé Maths',
    ville: 'Toulouse (À domicile)',
    objectif: 'Préparation Bac / Brevet',
    phone: '',
    email: '',
    message: ''
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Une erreur est survenue.");
      }

      setSubmitted(true);
      setForm({
        name: '',
        classe: 'Terminale Spé Maths',
        ville: 'Toulouse (À domicile)',
        objectif: 'Préparation Bac / Brevet',
        phone: '',
        email: '',
        message: ''
      });
    } catch (err) {
      // Fallback si le backend n'est pas joignable ou renvoie une erreur
      setErrorMsg(
        err.message === 'Failed to fetch' 
          ? "Impossible de joindre le serveur. Veuillez réessayer plus tard ou utiliser le numéro de téléphone." 
          : err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-wrapper">
      <div className="max-w-6xl mx-auto">


        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left — Contact info cards */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h3 className="font-space font-bold text-xl text-slate-800 mb-6">Contactez-moi directement</h3>

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
                      className="font-inter text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors break-words font-space font-semibold"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-inter text-sm font-medium text-slate-700 break-words">{item.value}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Availability card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-5 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(59,130,246,0.15)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="font-space font-bold text-slate-800 text-sm">Disponibilité pour le semestre</span>
              </div>
              <p className="font-inter text-slate-600 text-xs leading-relaxed">
                Des créneaux sont actuellement ouverts pour du suivi hebdomadaire et des cours particuliers à Toulouse, Paris et en visioconférence.
              </p>
            </motion.div>
          </motion.div>

          {/* Right — Lead Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="glass-card p-6 sm:p-8">
              <h3 className="font-space font-bold text-xl text-slate-800 mb-6">Formulaire de demande de cours</h3>

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
                    <h4 className="font-space font-bold text-slate-800 text-lg mb-2">Demande bien reçue !</h4>
                    <p className="font-inter text-slate-600 text-sm mb-6">
                      Merci pour votre message. Je vous recontacterai sous 24 heures pour échanger et convenir d'un premier rendez-vous.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn-secondary text-sm"
                    >
                      Envoyer une autre demande
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
                        Nom & Prénom (Parent / Élève) *
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Ex: Marie Dupont"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 font-inter text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-classe" className="block font-inter text-sm font-medium text-slate-700 mb-1">
                          Classe de l'élève *
                        </label>
                        <select
                          id="contact-classe"
                          name="classe"
                          value={form.classe}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-inter text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                        >
                          <option value="Collège (6e - 4e)">Collège (6ème - 4ème)</option>
                          <option value="3ème (Brevet DNB)">Troisième (3ème - Brevet)</option>
                          <option value="Seconde (2nde)">Seconde (2nde)</option>
                          <option value="1ère Spé Maths">Première Spécialité Maths</option>
                          <option value="Terminale Spé Maths">Terminale Spécialité Maths</option>
                          <option value="Terminale Maths Expertes">Terminale Maths Expertes</option>
                          <option value="Supérieur / Autre">Supérieur / Autre</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="contact-ville" className="block font-inter text-sm font-medium text-slate-700 mb-1">
                          Lieu / Format souhaité *
                        </label>
                        <select
                          id="contact-ville"
                          name="ville"
                          value={form.ville}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-inter text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                        >
                          <option value="Toulouse (À domicile)">Toulouse (À domicile)</option>
                          <option value="Paris (À domicile)">Paris (À domicile)</option>
                          <option value="En Ligne (Visioconférence)">En Ligne (Visioconférence HD)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          placeholder="votre@email.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 font-inter text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-phone" className="block font-inter text-sm font-medium text-slate-700 mb-1">
                          Téléphone *
                        </label>
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          required
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="07 58 10 30 86"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 font-inter text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block font-inter text-sm font-medium text-slate-700 mb-1">
                        Objectifs & Précisions *
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={4}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Décrivez les objectifs (remise à niveau, prépa Bac, révision d'un chapitre particulier...)"
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
                          Envoi de la demande...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Envoyer ma demande de cours ➔
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
